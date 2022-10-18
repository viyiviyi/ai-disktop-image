let config = require("../config.json");

const defaultConfig = {
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
  "server-type": "naifu",
  "Super-Resolution": "ncnn -i $input -o $output",
};

if (!config) config = defaultConfig;
if (!config["server-type"])
  config["server-type"] = defaultConfig["server-type"];
if (!config["Super-Resolution"])
  config["Super-Resolution"] = defaultConfig["Super-Resolution"];
if (!config["server-type-all"])
  config["server-type-all"] = defaultConfig["server-type-all"];
let server = config["server-type-all"].find(
  (f) => f.name == config["server-type"]
);
if (!server) {
  server = config["server-type-all"].length
    ? config["server-type-all"][0]
    : defaultConfig["server-type-all"][0];
}

module.exports = {
  config,
  server,
};
