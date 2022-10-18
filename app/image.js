const axios = require("axios");
const fs = require("fs");
const join = require("path").join;
const { 元素法典 } = require("./data/元素法典");
const { server, runEnv } = require("./config");
const { promptsRandom: promptsRdom } = require("./data/prompts");

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
  const [prompt, unprompt] = runEnv.magic ? getMagic() : ["", ""];
  const tags = runEnv.randomTag ? promptsRdom() : "";
  const unTags = "";
  const seed = Number(parseInt(Math.random() * 4294967296 - 1));

  const arg = Object.assign({}, server.arg);
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

async function getImage(path = undefined, NSFW = true) {
  var arg = getArg(NSFW);
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
