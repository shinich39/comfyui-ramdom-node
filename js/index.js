import { app } from "../../scripts/app.js";

const DEBUG = false;
const NODE_TYPE = "Random Node #39";
const INTPUT_NAME = "input";
const OUTPUT_NAME = "output";

if (DEBUG) {
  console.log("#39 js loaded");
}

function chkLink(linkId, type) {
  if (!linkId || !type) {
    return;
  }

  const link = app.graph.links[parseInt(linkId)];
  if (!link) {
    return;
  }
  if (link.type.toLowerCase() !== type.toLowerCase() && link.type !== "*" && type.toLowerCase() !== "*") {
    app.graph.removeLink(link.id);
  }
}

function getInputs(node) {
  return node.inputs.filter(function(input) {
    return input.name.indexOf(INTPUT_NAME) > -1;
  });
}

function getOutputs(node) {
  return node.outputs.filter(function(output) {
    return output.name.indexOf(OUTPUT_NAME) > -1;
  });
}

function getLastInputIndex(node) {
  let i = node.inputs.length - 1;
  for (i; i >= 0; i--) {
    if (node.inputs[i].name.indexOf(INTPUT_NAME) > -1) {
      break;
    }
  }
  return i;
}

function getLastOutputIndex(node) {
  let i = node.outputs.length - 1;
  for (i; i >= 0; i--) {
    if (node.outputs[i].name.indexOf(OUTPUT_NAME) > -1) {
      break;
    }
  }
  return i;
}

function setInputs(node, count, type) {
  while(getInputs(node).length !== count) {
    if (getInputs(node).length > count) {
      node.removeInput(getLastInputIndex(node));
    } else {
      node.addInput(INTPUT_NAME, type);
    }
  }

  // set type
  const inputs = getInputs(node);
  let idx = 0;
  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i];
    input.name = INTPUT_NAME + idx;
    input.type = type;
    input.label = INTPUT_NAME;
    input.required = true;

    // unlink
    chkLink(input.link, type);

    idx++;
  }
}

function setOutputs(node, count, type) {
  while(getOutputs(node).length !== count) {
    if (getOutputs(node).length > count) {
      node.removeOutput(getLastOutputIndex(node));
    } else {
      node.addOutput(OUTPUT_NAME, type);
    }
  }

  // set type
  const outputs = getOutputs(node);
  let idx = 0;
  for (let i = 0; i < outputs.length; i++) {
    const output = outputs[i];
    output.name = OUTPUT_NAME + idx;
    output.type = type;
    output.label = OUTPUT_NAME;

    // unlink
    if (output.links) {
      for (const linkId of output.links) {
        chkLink(linkId, type);
      }
    }

    idx++;
  }
}

function setNode(node, app) {
  if (node.comfyClass !== NODE_TYPE) {
    return;
  }

  const typeWidget = node.widgets ? node.widgets.find(function(item) {
    return item.name == "type";
  }) : null;

  const countWidget = node.widgets ? node.widgets.find(function(item) {
    return item.name == "count";
  }) : null;

  if (!typeWidget || !countWidget) {
    return;
  }

  node._count = countWidget.value;
  node._type = typeWidget.value;

  if (DEBUG) {
    console.log("Random #39 node", node);
  }

  setInputs(node, node._count, node._type);
  setOutputs(node, node._count, node._type);

  Object.defineProperty(countWidget, "value", {
    set: async function(value) {
      node._count = value;

      setInputs(node, value, node._type);
      setOutputs(node, value, node._type);
    },
    get: function() {
      return node._count;
    }
  });

  Object.defineProperty(typeWidget, "value", {
    set: async function(value) {
      node._type = value;

      setInputs(node, node._count, value);
      setOutputs(node, node._count, value);
    },
    get: function() {
      return node._type;
    }
  });
}

app.registerExtension({
	name: "shinich39.RandomNode",
	nodeCreated(node, app) {
    setNode(node, app); 
	}
});