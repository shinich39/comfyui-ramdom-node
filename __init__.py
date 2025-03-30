"""
@author: shinich39
@title: comfyui-random-node
@nickname: comfyui-random-node
@version: 1.0.1
@description: Shuffle nodes after queue added.
"""

WEB_DIRECTORY = "./js"
NODE_CLASS_MAPPINGS = {}
NODE_DISPLAY_NAME_MAPPINGS = {}
__all__ = ["NODE_CLASS_MAPPINGS", "NODE_DISPLAY_NAME_MAPPINGS"]

# ComfyUI-inspire-pack
class AnyType(str):
    def __ne__(self, __value: object) -> bool:
        return False

ANY_TYPE = AnyType("*")

class RandomNode:
    def __init__(self):
        pass

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "": (ANY_TYPE,),
            },
        }
    
    CATEGORY = "utils"
    RETURN_TYPES = (ANY_TYPE,)
    RETURN_NAMES = ("output0",)

NODE_CLASS_MAPPINGS["Random Node"] = RandomNode
NODE_DISPLAY_NAME_MAPPINGS["Random Node"] = "Random Node"
