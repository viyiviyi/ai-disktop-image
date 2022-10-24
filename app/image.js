const axios = require("axios");
const fs = require("fs");
const join = require("path").join;
const 元素法典 = require("./data/元素法典.json");
const { server, runEnv } = require("./config");
const { promptsRandom: promptsRdom } = require("./data/prompts");
const { tunnels } = require("./utils/ngrok");

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
  let tags = runEnv.randomTag ? promptsRdom() : "";
  let unTags = "";
  tags += defaultPrompts.prompt;
  unTags += defaultPrompts.unprompt;
  const arg = server.map((ser) => {
    if (ser.isMagic) {
      ser.tags = tags += "," + prompt;
      ser.unTags = unTags += "," + unprompt;
    }

    if (ser.ngrok && ser.ngrok.enadle) {
      let url = tunnels(ser.ngrok.token);
      ser.url = url;
    }
    const seed = Number(parseInt(Math.random() * 4294967296 - 1));
    return JSON.parse(
      JSON.stringify(ser.arg)
        .replace(/"\$seed"/g, seed)
        .replace(/\$seed/g, seed)
        .replace(/\$unprompt/g, removeDuplicates(ser.unTags))
        .replace(/\$prompts/, removeDuplicates(ser.tags))
    );
  });
  return flatten(arg);
}
function flatten(arr) {
  while (arr.some((i) => Array.isArray(i))) {
    arr = [].concat(...arr);
  }
  return arr;
}
function removeDuplicates(tags) {
  let rd = new Set();
  tags
    .split(",")
    .map((v) => v.trim())
    .filter((f) => f)
    .forEach((v) => rd.add(v));
  return Array.from(rd).join(",");
}

async function saveImage(base64, path = "images") {
  try {
    var dir = join(require.main.path, path);
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
  // console.log("arg:", arg);
  if (arg.length == 0) return console.error("参数不能为空");
  let result = "";
  for (let index = 0; index < arg.length; index++) {
    if (result) return result;
    console.log(server[index].url, arg[index]);
    result = await axios
      .post(server[index].url, arg[index])
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
      })
      .catch(() => null);
  }
  return result;
}

module.exports = {
  getImage,
  setTags,
  getArg,
};
