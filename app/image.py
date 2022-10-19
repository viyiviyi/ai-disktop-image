import random
import data.data as data

def getArg():
  prompts = ''
  unprompts = ''
  magic = data.magic[random.randint(0, len(data.magic-1))]

  