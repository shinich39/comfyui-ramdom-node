import { app } from "../../scripts/app.js";

const DEBUG = false;
const NODE_TYPE = "Random Node #39";
const INPUT_NAME = "input";
const OUTPUT_NAME = "output";

if (DEBUG) {
  console.log("#39 loaded");
}

function chkLink(linkId, type) {
  if (!linkId || !type) {
    return;
  }

  const link = app.graph.links[linkId];
  if (!link) {
    return;
  }

  if (link.type.toLowerCase() !== type.toLowerCase() && link.type !== "*" && type.toLowerCase() !== "*") {
    app.graph.removeLink(link.id);
  }
}

function getInputs(node) {
  return node.inputs.filter(function(input) {
    return input.name.indexOf(INPUT_NAME) > -1;
  });
}

function getOutputs(node) {
  return node.outputs.filter(function(output) {
    return output.name.indexOf(OUTPUT_NAME) > -1;
  });
}

function setTypes(node, type) {
  const inputs = getInputs(node);
  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i];
    input.type = type;
    input.label = INPUT_NAME;

    // unlink
    chkLink(input.link, type);
  }

  const outputs = getOutputs(node);
  for (let i = 0; i < outputs.length; i++) {
    const output = outputs[i];
    output.type = type;
    output.label = OUTPUT_NAME;

    // unlink
    chkLink(output.links, type);
  }
}

function setNode(node, app) {
  if (node.comfyClass !== NODE_TYPE) {
    return;
  }

  const typeWidget = node.widgets ? node.widgets.find(function(item) {
    return item.name == "type";
  }) : null;

  if (!typeWidget) {
    return;
  }

  node._type = typeWidget.value;

  if (DEBUG) {
    console.log("#39 node", node);
  }

  setTypes(node, node._type);

  Object.defineProperty(typeWidget, "value", {
    set: async function(value) {
      node._type = value;

      setTypes(node, node._type);
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