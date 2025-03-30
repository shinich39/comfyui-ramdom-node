import { app } from "../../scripts/app.js";
import { api } from "../../scripts/api.js";

const CLASS_NAME = "Random Node";
const DefaultState = {
  type: "*",
  inProgress: false,
}

function shuffle(arr) {
  let i = arr.length;
  while (i > 0) {
    let j = Math.floor(Math.random() * i);
    i--;
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function initState(node) {
  if (!node.randomState) {
    node.randomState = JSON.parse(JSON.stringify(DefaultState));
  }
}

function shuffleInputs(node) {
  initState(node);

  if (node.randomState.inProgress) {
    return;
  }

  // Prevent call node.onConnectionsChange()
  node.randomState.inProgress = true;

  const connectedOutputs = [];
  let connectedInputs = [];
  for (let i = node.inputs.length - 1; i >= 0; i--) {
    const input = node.inputs[i];
    const linkId = input.link;
    const link = app.graph.links[linkId];
    if (!link) {
      continue;
    }

    connectedOutputs.push({
      nodeId: link.origin_id,
      slotIndex: link.origin_slot,
    });

    connectedInputs.push({
      nodeId: link.target_id,
      slotIndex: link.target_slot,
    });

    node.disconnectInput(i);
  }

  connectedInputs = shuffle(connectedInputs);

  for (let i = 0; i < connectedOutputs.length; i++) {
    const output = connectedOutputs[i];
    const input = connectedInputs[i];
    const outputNode = app.graph.getNodeById(output.nodeId);
    const inputNode = app.graph.getNodeById(input.nodeId);
    outputNode.connect(output.slotIndex, inputNode, input.slotIndex);
  }

  node.randomState.inProgress = false;
}

function getSlotType(node) {
  if (!node.inputs) {
    return "*";
  }

  const connectedInput = node.inputs.find(function(input) {
    return input.link;
  });

  if (!connectedInput) {
    return "*";
  }

  const linkId = connectedInput.link;
  const link = app.graph.links[linkId];
  const originNode = app.graph.getNodeById(link.origin_id)
  const originSlot = originNode.outputs[link.origin_slot];
  return originSlot?.type || "*";
}

function setLinkColors(node) {
  initState(node);

  try {
    const color = LGraphCanvas.link_type_colors[node.randomState.type];
    for (const link in app.graph.links) {
      if (!link) {
        continue; // pass unconnected link
      }
      if (link.origin_id === node.id || link.target_id === node.id) {
        link.color = color;
      }
    }
  } catch(err) {
    // error occurred at first link in workflow
    console.error(err);
  }
}

function setSlotTypes(node) {
  const type = getSlotType(node);
  if (node.inputs) {
    for (const input of node.inputs) {
      input.type = type;
    }
  }
  if (node.outputs) {
    for (const output of node.outputs) {
      output.type = type;
    }
  }
}

function initNode(node) {
  // Prevent run with worklflow initialization
  setTimeout(() => {
    node.onConnectionsChange = function(type, index, connected, link_info) {
      initState(this);
  
      if (!this.inputs || !this.outputs || this.randomState.inProgress) {
        return;
      }
  
      this.randomState.inProgress = true;
  
      // const isInput = type === LiteGraph.INPUT;
      // const isOutput = type === LiteGraph.OUTPUT;
  
      // Set input type
      this.randomState.type = getSlotType(this);
  
      // Get connected input links
      const inputConnections = this.inputs.reduce((acc, input) => {
        if (!input.link || !app.graph.links[input.link]) {
          return acc;
        }
  
        const link = app.graph.links[input.link];
  
        acc.push({
          originId: link.origin_id,
          originSlot: link.origin_slot,
          targetId: link.target_id,
          targetSlot: link.target_slot,
        });
  
        return acc;
      }, []);
  
      // Disconnect all inputs
      for (const c of inputConnections) {
        this.disconnectInput(c.targetSlot);
      }
  
      // Remove all inputs
      while(this.inputs && this.inputs.length > 0) {
        this.removeInput(this.inputs.length - 1);
      }
  
      // Create new inputs
      if (inputConnections.length > 0) {
        for (let i = 0; i < inputConnections.length; i++) {
          const c = inputConnections[i];
  
          this.addInput("input" + i, this.randomState.type, {
            label: " ",
          });
  
          // Re-Connect
          const originNode = app.graph.getNodeById(c.originId);
          originNode?.connect(c.originSlot, this, i);
        }
      }
  
      // Create last input
      this.addInput(``, this.randomState.type);
  
      // Remove overflowed outputs
      while(this.outputs && this.outputs.length >= this.inputs.length) {
        this.removeOutput(this.outputs.length - 1);
      }
  
      // Create new outputs same number as inputs
      while(this.outputs && this.outputs.length < this.inputs.length - 1) {
        const i = this.outputs.length;
        this.addOutput("output"+i, this.randomState.type || "*", {
          label: i === 0 ? this.randomState.type || "*" : " "
        });
      }
      
      setLinkColors(this);
      this.randomState.inProgress = false;
    }  
  }, 1024);
  
  node.isVirtualNode = true;
  initState(node);

  // Wait all nodes created
  setTimeout(() => {
    // Remove overflowed outputs
    while(node.outputs && node.outputs.length >= node.inputs.length) {
      node.removeOutput(node.outputs.length - 1);
    }
    setLinkColors(node);
    setSlotTypes(node);
    node.computeSize();
  }, 128);
}

app.registerExtension({
	name: "shinich39.RandomNode",
	nodeCreated(node, app) {
    if (node.comfyClass !== CLASS_NAME) {
      return;
    }

    // Fix link missing
    initNode(node);
	}
});

api.addEventListener("promptQueued", ({ detail }) => {
  for (const node of app.graph._nodes) {
    if (node.comfyClass === CLASS_NAME) {
      shuffleInputs(node);
    }
  }
});