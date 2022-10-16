const axios = require("axios");
const 元素法典 = require("./元素法典");
const join = require("path").join;
const exec = require("shelljs").exec;
const prompts = require("./prompts").prompts;
var fs = require("fs");

const api = "http://127.0.0.1:7860/generate-stream";

function getPrompt(prompts) {
  if (Array.isArray(prompts) && prompts.length > 1) {
    let num = 0;
    if (Array.isArray(prompts[0]) && prompts[0].length) {
      num = Number(prompts[0][0]);
    } else {
      num = Number(prompts[0]);
    }
    if (num >= prompts.length - 1)
      return prompts
        .slice(1)
        .map(getPrompt)
        .filter((v) => v)
        .join(",");
    else {
      let arr = [];
      for (let i = 1; i <= num; i++) {
        arr.push(
          getPrompt(
            prompts[Number(parseInt(Math.random() * (prompts.length - 1) + 1))]
          )
        );
      }
      return arr.filter((v) => v).join();
    }
  } else if (!Array.isArray(prompts)) {
    return prompts;
  }
  return undefined;
}
function getPromptAndUC() {
  let p = ["", ""];
  p = 元素法典[Number(parseInt(Math.random() * 元素法典.length - 1))];
  return p || [];
}
function getArg() {
  var [prompt, uc] = getPromptAndUC();
  const arg = {
    prompt: "masterpiece, best quality," + prompt + "," + getPrompt(prompts),
    width: 1024,
    height: 576,
    scale: 12,
    sampler: "k_euler_ancestral",
    steps: 28,
    seed: Number(parseInt(Math.random() * 4294967296 - 1)),
    n_samples: 1,
    ucPreset: 0,
    uc: "lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry",
  };
  return arg;
}
async function saveImage(base64) {
  var dir = "images";
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

async function getImage() {
  var arg = getArg();
  return await axios
    .post(api, arg)
    .then((res) => {
      return res.data;
    })
    .then((data) => {
      if (typeof data === "object" && data.error) console.error(data.error);
      if (typeof data !== "string") return;
      let d = data.split("\n").find((f) => f.startsWith("data:"));
      if (!d) return;
      let base64 = d.split(":")[1];
      return saveImage(base64);
    });
}
async function nccnImage(path, outPath) {
  let p = exec("nccn -i " + path + " -o " + outPath);
}
async function setBg(path) {
  exec("python ./setBg.py " + path);
}

async function main() {
  var path = await getImage();
  console.log("image path:", path);
  if (!path) return;
  await nccnImage(path, path);
  await setBg(path);
}
main();
