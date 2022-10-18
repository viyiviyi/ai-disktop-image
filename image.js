const axios = require("axios");
const fs = require("fs");
const join = require("path").join;
const exec = require("shelljs").exec;
const 元素法典 = require("./元素法典");
const config = require("./config.json");
const { promptsRandom: promptsRdom } = require('./prompts')

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
  p = 元素法典[Number(parseInt(Math.random() * 元素法典.length - 1))];
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
  var dir = path;
  if (!fs.existsSync(join(__dirname, dir))) {
    fs.mkdirSync(join(__dirname, dir));
  }
  var fileName = Date.now() + ".png";
  try {
    let path = join(__dirname, dir, fileName);
    fs.writeFileSync(path, base64, "base64");
    return path;
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
/**
 * 图片超分辨率
 * @param {string} path  图片文件路径
 * @param {string} outPath 输出图片文件路径
 * @returns {boolean} 是否成功
 */
async function srImage(path, outPath) {
  let p = exec(
    config["Super-Resolution"]
      .replace("$input", path)
      .replace("$output", outPath)
  );
  return !p.code;
}
async function setBg(path) {
  exec("python ./setBg.py " + path);
}

module.exports = {
  setBg,
  srImage,
  srImage,
  getImage,
  setTags,
  getArg,
};
