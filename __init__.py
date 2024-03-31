"""
@author: shinich39
@title: Random Node #39
@nickname: Random Node #39
@version: 1.0.1
@description: Choose random node.
"""

import random

DEBUG = False
VERSION = "1.0.1"
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
                "type": (["boolean","number","int","float","string","text","image","mask","latent","conditioning","model","clip","vae",],),
                "input1": (ANY_TYPE,),
            },
            "optional": {
                "input2": (ANY_TYPE,),
                "input3": (ANY_TYPE,),
                "input4": (ANY_TYPE,),
                "input5": (ANY_TYPE,),
                "input6": (ANY_TYPE,),
                "input7": (ANY_TYPE,),
                "input8": (ANY_TYPE,),
                "input9": (ANY_TYPE,),
            }
        }
    
    @classmethod
    def IS_CHANGED(cls, **kwargs):
        return float("NaN")
    
    CATEGORY = "utils"
    RETURN_TYPES = (ANY_TYPE,ANY_TYPE,ANY_TYPE,ANY_TYPE,ANY_TYPE,ANY_TYPE,ANY_TYPE,ANY_TYPE,ANY_TYPE,)
    RETURN_NAMES = ("output1","output2","output3","output4","output5","output6","output7","output8","output9",)
    FUNCTION = "exec"

    def exec(self, type, **inputs):

        if DEBUG:
            print(f"type: {type}")
    
        values = list(inputs.values())
        new_values = []
        for i in range(9):
            for v in values:
                new_values.append(v)


        if DEBUG:
            print(new_values)

        random.shuffle(new_values)

        if DEBUG:
            print(new_values[0:9])

        return tuple(new_values[0:9])

NODE_CLASS_MAPPINGS["Random Node #39"] = RandomNode
NODE_DISPLAY_NAME_MAPPINGS["Random Node #39"] = "Random Node #39"