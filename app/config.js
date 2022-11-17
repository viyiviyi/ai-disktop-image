let config = require("../config.json");

const defaultConfig = {
  "server-type-all": [
    {
      url: "http://localhost:7860/generate-stream",
      name: "naifu",
      isMagic: true,
      apiType: "naifu",
      ngrok: {
        enadle: false,
        token: "",
      },
      defaultPrompts: [
        "masterpiece, best quality",
        "lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry",
      ],
      option: {
        seed: -1,
        width: 1024,
        height: 576,
        scale: 12,
        sampler: "k_euler_ancestral",
        steps: 28,
      },
    },
  ],
  "server-type": ["naifu"],
  "Super-Resolution": "ncnn -i $input -o $output",
};

if (!config) config = defaultConfig;
if (!config["server-type"])
  config["server-type"] = defaultConfig["server-type"];
if (!config["Super-Resolution"])
  config["Super-Resolution"] = defaultConfig["Super-Resolution"];
if (!config["server-type-all"])
  config["server-type-all"] = defaultConfig["server-type-all"];
config.detalesPrompts = config.detalesPrompts || [];
let server = config["server-type-all"].filter(
  (f) => config["server-type"].findIndex((name) => name == f.name) != -1
);
if (!server) {
  server = config["server-type-all"].length
    ? config["server-type-all"][0]
    : defaultConfig["server-type-all"][0];
}
const runEnv = {
  NSFW: config.NSFW,
  randomTag: config.randomTag,
  magic: config.magic,
};
const defaultPrompts = {
  prompt: config["defaultPrompts.prompt"],
  unprompt: config["defaultPrompts.unprompt"],
};

module.exports = {
  config,
  server,
  runEnv,
  defaultPrompts
};
