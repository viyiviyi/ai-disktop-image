const axios = require("axios");
const fs = require("fs");
const join = require("path").join;
const 元素法典 = require("./data/元素法典");
const config = require("./config.json");
const { promptsRandom: promptsRdom } = require('./data/prompts')

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
const server = config["server-type-all"].find(
  (f) => f.name == config["server-type"]
);
if (!server) {
  server = config["server-type-all"].length
    ? config["server-type-all"][0]
    : defaultConfig["server-type-all"][0];
}
const defaultPrompts = {
  prompt: "",
  unprompt: "",
};

function getMagic() {
  let p = ["", ""];
  p = 元素法典[Math.floor(Math.random() * 元素法典.length)];
  return p || [];
}
function getArg() {
  const [prompt, unprompt] = getMagic();
  const tags = promptsRdom();
  const unTags = "";
  const seed = Number(parseInt(Math.random() * 4294967296 - 1));

  const arg = Object.assign({},server.arg);
  Object.keys(arg).forEach((key) => {
    if (typeof arg[key] === "string") {
      if (arg[key].includes("$seed")) {
        arg[key] = seed;
      } else if (arg[key].includes("$unprompt")) {
        arg[key] = arg[key].replace(
          "$unprompt",
          server.isMagic ? unprompt + "," + unTags : unTags
        );
        arg[key] += "," + defaultPrompts.unprompt;
        let set = new Set();
        arg[key].split(",").forEach((v) => {
          set.add(v);
        });
        arg[key] = Array.from(set).join(",");
      } else if (arg[key].includes("$prompts")) {
        arg[key] = arg[key].replace(
          "$prompts",
          server.isMagic ? prompt + "," + tags : tags
        );
        arg[key] += "," + defaultPrompts.prompt;
        let set = new Set();
        arg[key].split(",").forEach((v) => {
          set.add(v);
        });
        arg[key] = Array.from(set).join(",");
      }
    }
  });
  return arg;
}
async function saveImage(base64, path = "images") {
  try {
    var dir = join(process.cwd(), path);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    var fileName = Date.now() + ".png";
    let filePath = join(dir, fileName);
    fs.writeFileSync(filePath, base64, "base64");
    return filePath;
  } catch (error) {
    console.error(error);
    return null;
  }
}
function setTags(prompts, unprompt) {
  defaultPrompts.prompt = prompts || "";
  defaultPrompts.unprompt = unprompt || "";
}

async function getImage(path = undefined) {
  var arg = getArg();
  console.log("arg:", arg);
  return await axios
    .post(server.url, arg)
    .then((res) => {
      return res.data;
    })
    .then((data) => {
      if (typeof data === "object" && data.error) console.error(data.error);
      if (typeof data !== "string") return;
      let d = data.split("\n").find((f) => f.startsWith("data:"));
      if (!d) return;
      let base64 = d.split(":")[1];
      return saveImage(base64, path);
    });
}

module.exports = {
  getImage,
  setTags,
  getArg,
};
