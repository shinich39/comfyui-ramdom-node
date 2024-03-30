"""
@author: shinich39
@title: Random Node #39
@nickname: Random Node #39
@version: 1.0.0
@description: Choose random node.
"""

import random

DEBUG = False
VERSION = "1.0.0"
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
                "type": (["boolean","number","int","float","string","text","image","latent",],),
                "count": ("INT", {"default": 1, "min": 1, "max": 99, "step": 1}),
                "input": (ANY_TYPE, )
            },
        }
    
    @classmethod
    def IS_CHANGED(cls, **kwargs):
        return float("NaN")
    
    CATEGORY = "utils"
    RETURN_TYPES = (ANY_TYPE,)
    RETURN_NAMES = ("output",)
    FUNCTION = "exec"

    def exec(self, type, count, **inputs):

        if DEBUG:
            print(f"type: {type}")
            print(f"count: {count}")
    
        items = list(inputs.values())
        values = [None for x in range(count)]
        types = [type.upper() for x in range(count)]
        for i in range(len(items)):
            values[i] = items[i]
        
        random.shuffle(values)

        self.RETURN_TYPES = tuple(types)

        return tuple(values)

NODE_CLASS_MAPPINGS["Random Node #39"] = RandomNode
NODE_DISPLAY_NAME_MAPPINGS["Random Node #39"] = "Random Node #39"