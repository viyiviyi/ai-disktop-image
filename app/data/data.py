import os
import json


magicList = []

with open('./元素法典.json','r',encoding='utf8') as magic:
  magicList = json.load(magic)

prompts = []

with open('./prompts.json','r',encoding='utf8') as p:
  prompts = json.load(p)