import { app } from "../../scripts/app.js";
import { api } from "../../scripts/api.js";

const DEBUG = false;
const CLASS_NAME = "Random Node";

app.registerExtension({
	name: "shinich39.RandomNode",
	nodeCreated(node, app) {
    if (node.comfyClass !== CLASS_NAME) {
      return;
    }
  
    if (DEBUG) {
      console.log("RandomNode.node", node);
    }

    node.onConnectInput = function(index, type, link_info, node) {
      try {
        // fix change link
        this.__keepInputsOnce = this.inputs[index] && this.inputs[index].link;
        return true;
      } catch(err) {
        return false;
      }
    }

    node.computeSize = function(out) {
      if (this.constructor.size) {
        return this.constructor.size.concat();
      }

      var rows = Math.max(
        this.inputs ? this.inputs.length : 1,
        this.outputs ? this.outputs.length : 1
      );
      var size = out || new Float32Array([0, 0]);
      rows = Math.max(rows, 1);
      var font_size = LiteGraph.NODE_TEXT_SIZE; //although it should be graphcanvas.inner_text_font size

      var title_width = compute_text_size(this.title);
      var input_width = 0;
      var output_width = 0;

      if (this.inputs) {
        for (var i = 0, l = this.inputs.length; i < l; ++i) {
          var input = this.inputs[i];
          var text = input.label || input.name || "";
          var text_width = compute_text_size(text);
          if (input_width < text_width) {
            input_width = text_width;
          }
        }
      }

      if (this.outputs) {
        for (var i = 0, l = this.outputs.length; i < l; ++i) {
          var output = this.outputs[i];
          var text = output.label || output.name || "";
          var text_width = compute_text_size(text);
          if (output_width < text_width) {
            output_width = text_width;
          }
        }
      }

      size[0] = Math.max(input_width + output_width + 10, title_width);
      size[0] = Math.max(size[0], LiteGraph.NODE_WIDTH * 1);
      if (this.widgets && this.widgets.length) {
        size[0] = Math.max(size[0], LiteGraph.NODE_WIDTH * 1.5);
      }

      size[1] = (this.constructor.slot_start_y || 0) + rows * LiteGraph.NODE_SLOT_HEIGHT;

      var widgets_height = 0;
      if (this.widgets && this.widgets.length) {
        for (var i = 0, l = this.widgets.length; i < l; ++i) {
          if (this.widgets[i].computeSize)
            widgets_height += this.widgets[i].computeSize(size[0])[1] + 4;
          else
            widgets_height += LiteGraph.NODE_WIDGET_HEIGHT + 4;
        }
        widgets_height += 8;
      }

      //compute height using widgets height
      if( this.widgets_up )
        size[1] = Math.max( size[1], widgets_height );
      else if( this.widgets_start_y != null )
        size[1] = Math.max( size[1], widgets_height + this.widgets_start_y );
      else
        size[1] += widgets_height;

      function compute_text_size(text) {
        if (!text) {
          return 0;
        }
        return font_size * text.length * 0.6;
      }

      if (
        this.constructor.min_height &&
        size[1] < this.constructor.min_height
      ) {
        size[1] = this.constructor.min_height;
      }

      size[1] += 6; //margin

      return size;
    }

    node.getSlotType = function() {
      if (!this.inputs) {
        return null;
      }

      const connectedInput = this.inputs.find(function(input) {
        return input.link;
      });

      if (!connectedInput) {
        return null;
      }

      const linkId = connectedInput.link;
      const link = app.graph.links[linkId];
      const targetNode = app.graph.getNodeById(link.origin_id)
      const targetSlot = targetNode.outputs[link.origin_slot];
      return targetSlot && targetSlot.type ? targetSlot.type : null;
    }

    node.showSlotType = function() {
      try {
        if (this.outputs && this.outputs.length > 0) {
          this.outputs[0].label = this.__type ? this.__type : "";
        }
      } catch(err) {
        console.error(err);
      }
    }

    node.setLinkColors = function() {
      try {
        const color = LGraphCanvas.link_type_colors[this.__type];
        for (const link in app.graph.links) {
          if (!link) {
            continue; // removed link
          }
          if (link.origin_id === this.id || link.target_id === this.id) {
            link.color = color;
          }
        }
      } catch(err) {
        // error occurred at first link in workflow
        console.error(err);
        console.log(app.graph.links)
      }
    }

    node.getConnectedInputs = function() {
      return this.inputs ? this.inputs.filter(function(input) {
        return input.link;
      }) : [];
    }

    node.getConnectedOutputs = function() {
      return this.outputs ? this.outputs.filter(function(outputs) {
        return outputs.links.length > 0;
      }) : [];
    }

    node.shuffleInputs = function() {
      if (DEBUG) {
        console.log("RandomNode.shuffleInputs");
      }

      const connectedInputs = this.getConnectedInputs();
      if (connectedInputs.length < 1) {
        return;
      }

      this.__keepOutputs = true;
      this.__keepInputs = true;

      let outputs = [];
      let inputs = []
      for (let i = this.inputs.length - 1; i >= 0; i--) {
        const input = this.inputs[i];
        const linkId = input.link;
        const link = app.graph.links[linkId];
        if (!link) {
          continue;
        }

        outputs.push({
          nodeId: link.origin_id,
          slotIndex: link.origin_slot,
        });

        inputs.push({
          nodeId: link.target_id,
          slotIndex: link.target_slot,
        });

        this.disconnectInput(i);
      }

      inputs = inputs.sort(function() {
        return Math.random() - 0.5;
      });

      for (let i = 0; i < outputs.length; i++) {
        const output = outputs[i];
        const input = inputs[i];
        const outputNode = app.graph.getNodeById(output.nodeId);
        const inputNode = app.graph.getNodeById(input.nodeId);
        outputNode.connect(output.slotIndex, inputNode, input.slotIndex);
      }

      this.__keepOutputs = false;
      this.__keepInputs = false;
    }

    node.onConnectionsChange = function(type, index, connected, link_info) {
      if (DEBUG) {
        console.log("RandomNode.onConnectionsChange", type, index, connected, link_info);
      }

      if (!this.inputs || !this.outputs) {
        return;
      }

      if (this.__keepInputsOnce) {
        this.__keepInputs = true;
      }

      if (this.__keepOutputsOnce) {
        this.__keepOutputs = true;
      }

      // const isInput = type === LiteGraph.INPUT;
      const isLastInputConnected = this.inputs[this.inputs.length - 1].link;
      const slotType = this.getSlotType();

      // set slot type
      this.__type = slotType ? slotType : "*";

      if (isLastInputConnected) {
        // create new input
        this.addInput("input" + this.inputs.length, this.__type, { label: "" });
      }

      // set inputs
      if (!this.__keepInputs) {
        // remove last input
        let isRemoveLastInput = this.inputs.length > 1 && !isLastInputConnected && !this.inputs[this.inputs.length - 2].link;
        while(isRemoveLastInput) {
          this.removeInput(this.inputs.length - 1);
          isRemoveLastInput = this.inputs.length > 1 && !isLastInputConnected && !this.inputs[this.inputs.length - 2].link;
        }

        // set inputs
        for (let i = this.inputs.length - 1; i >= 0; i--) {
          const input = this.inputs[i];
          input.name = "input" + i;
          input.label = "";
          input.type = this.__type;
        }
      }

      // set outputs
      if (!this.__keepOutputs) {
        while(this.outputs.length !== this.inputs.length - 1) {
          if (this.outputs.length > this.inputs.length - 1) {
            let unlinkedOutputIndex = this.outputs.findIndex(function(output) {
              return !output.links || output.links.length < 1;
            });
  
            if (unlinkedOutputIndex < 0) {
              unlinkedOutputIndex = this.outputs.length - 1
            }
  
            this.removeOutput(unlinkedOutputIndex);
          } else {
            this.addOutput("output"+this.outputs.length, this.__type || "*", {
              label: this.outputs.length === 0 ? this.__type || "*" : ""
            });
          }
        }
      }

      this.setLinkColors();
      this.showSlotType();

      if (this.__keepInputsOnce) {
        this.__keepInputs = false;
        this.__keepInputsOnce = false;
      }

      if (this.__keepOutputsOnce) {
        this.__keepOutputs = false;
        this.__keepOutputsOnce = false;
      }
    }

    // init
    node.isVirtualNode = true;
    node.__type = "*";
    node.__keepOutputs = false;
    node.__keepInputs = false;
    node.__keepInputsOnce = false;
    node.__keepOutputsOnce = false;
    node.removeOutput(0); // remove first output
    node.computeSize();
	}
});

function updateHandler({ detail }) {
  if (DEBUG) {
    console.log("RandomNode.update", detail);
  }

  for (const node of app.graph._nodes) {
    if (node.comfyClass === CLASS_NAME) {
      node.shuffleInputs();
    }
  }
}

api.addEventListener("promptQueued", updateHandler);