"""
@author: shinich39
@title: Random Node #39
@nickname: Random Node #39
@version: 1.0.1
@description: Choose random node.
"""

import random
import re

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

def getNumber(text):
    return int(re.findall(r'\d+', text).pop())

class RandomNode:
    def __init__(self):
        pass

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "type": (["boolean","number","int","float","string","text","image","mask","latent","conditioning","model","clip","vae",],),
                "input0": (ANY_TYPE,),
            },
            "optional": {
                "input1": (ANY_TYPE,),
                "input2": (ANY_TYPE,),
                "input3": (ANY_TYPE,),
                "input4": (ANY_TYPE,),
                "input5": (ANY_TYPE,),
                "input6": (ANY_TYPE,),
                "input7": (ANY_TYPE,),
                "input8": (ANY_TYPE,),
            }
        }
    
    @classmethod
    def IS_CHANGED(cls, **kwargs):
        return float("NaN")
    
    CATEGORY = "utils"
    RETURN_TYPES = (ANY_TYPE,ANY_TYPE,ANY_TYPE,ANY_TYPE,ANY_TYPE,ANY_TYPE,ANY_TYPE,ANY_TYPE,ANY_TYPE,)
    RETURN_NAMES = ("output0","output1","output2","output3","output4","output5","output6","output7","output8",)
    FUNCTION = "exec"

    def exec(self, type, **inputs):

        if DEBUG:
            print(f"type: {type}")
            print(f"inputs: {inputs}")
    
        result = [None for i in range(9)]
        keys = [getNumber(k) for k in list(inputs.keys())]
        values = list(inputs.values())

        random.shuffle(keys)

        if DEBUG:
            print(f"keys: {keys}")
            print(f"values: {values}")

        for i in range(len(keys)):
            index = keys[i]
            value = values[i]
            result[index] = value

        if DEBUG:
            print(f"result: {result}")

        return tuple(result)

NODE_CLASS_MAPPINGS["Random Node #39"] = RandomNode
NODE_DISPLAY_NAME_MAPPINGS["Random Node #39"] = "Random Node #39"