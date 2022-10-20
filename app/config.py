
import json

config = defaultConfig = {
  "server-type-all": [
    {
      url: "http://localhost:7860/generate-stream",
      name: "naifu",
      isMagic: true,
      arg: {
        prompt: "masterpiece, best quality,$prompts",
        width: 1024,
        height: 576,
        scale: 12,
        sampler: "k_euler_ancestral",
        steps: 28,
        seed: "$seed",
        n_samples: 1,
        ucPreset: 0,
        uc: "lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry,$unprompt",
      },
    },
  ],
  "server-type": ["naifu"],
  "Super-Resolution": "ncnn -i $input -o $output",
}

with open('../config.json','r',encoding='utf8') as cf:
  config = json.load(cf)

if config is None:
  config = defaultConfig
if config["server-type"] is None:
  config["server-type"] = defaultConfig["server-type"]
if config["Super-Resolution"] is None:
  config["Super-Resolution"] = defaultConfig["Super-Resolution"]
if config["server-type-all"] is None:
  config["server-type-all"] = defaultConfig["server-type-all"]
server = {}
for item in config["server-type-all"]:
  if item['server-type'] == config["server-type"]:
    server = item

if server is None :
  server = config["server-type-all"][0] if config["server-type-all"].length > 0 else defaultConfig["server-type-all"][0]

runEnv = {
  NSFW: true,
  randomTag: true,
  magic: true,
}
