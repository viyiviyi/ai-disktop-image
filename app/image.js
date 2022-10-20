const axios = require("axios");
const fs = require("fs");
const join = require("path").join;
const 元素法典 = require("./data/元素法典.json");
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
  let tags = runEnv.randomTag ? promptsRdom() : "";
  let unTags = "";
  tags += defaultPrompts.prompt;
  unTags += defaultPrompts.unprompt;
  if (server.isMagic) {
    tags += "," + prompt;
    unTags += "," + unprompt;
  }
  const seed = Number(parseInt(Math.random() * 4294967296 - 1));

  const arg = server.arg.map((str) => {
    return JSON.parse(
      JSON.stringify(str)
        .replace(/"\$seed"/g, seed)
        .replace(/\$seed/g, seed)
        .replace(/\$unprompt/g, unTags)
        .replace(/\$prompts/, tags)
    );
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
  if (arg.length == 0) return console.error("参数不能为空");
  let result = "";
  for (let index = 0; index < arg.length; index++) {
    if (result) return result;
    result = await axios
      .post(server.url, arg[0])
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
      .catch((e) => null);
  }
}

module.exports = {
  getImage,
  setTags,
  getArg,
};
