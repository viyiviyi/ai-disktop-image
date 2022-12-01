const { join } = require("path");
const { exec } = require("shelljs");
const fs = require("fs");
const os = require("os");
const { config, defaultPrompts } = require("../config");


/**
 * 设置图片为桌面背景
 * @param {string} path 图片完整路径
 */
async function setBg(path) {
  switch (os.platform()) {
    case "android":
      break;
    case "win32":
      setBgWin(path);
      break;
    case "aix":
      break;
    case "linux":
      break;
    case "cygwin":
      break;
    case "darwin":
      break;
    case "freebsd":
      break;
    case "haiku":
      break;
    case "openbsd":
      break;
    case "sunos":
      break;
  }
}
function setBgWin(path) {
  const { exec } = require("child_process");
  exec(join(__dirname,'./exes'+'/wallpaper.exe') + " " + path);
}
/**
 * 图片超分辨率
 * @param {string} path  图片文件路径
 * @param {string} outPath 输出图片文件路径
 * @returns {boolean} 是否成功
 */
async function srImage(path, outPath) {
  if (!config["Super-Resolution"]) return true;
  let p = exec(
    config["Super-Resolution"]
      .replace("$input", path)
      .replace("$output", outPath)
  );
  return !p.code;
}

function removeDuplicates(tags) {
  let rd = new Set();
  tags
    .split(",")
    .map((v) => v.trim())
    .filter((f) => f)
    .filter(
      (f) => config.detalesPrompts.find((a) => f.includes(a)) == undefined
    )
    .forEach((v) => rd.add(v));
  return Array.from(rd).join(",");
}

function promptsJoin(...arg) {
  return removeDuplicates(arg.join(","));
}

async function saveImage(base64, path = "images", dataType = "base64") {
  try {
    var dir = join(require.main.path, path);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    var fileName = Date.now() + ".png";
    let filePath = join(dir, fileName);
    fs.writeFileSync(filePath, base64, dataType);
    return filePath;
  } catch (error) {
    console.error(error);
    return null;
  }
}
function setTags(prompts, unprompt) {
  defaultPrompts.prompt = prompts || defaultPrompts.prompt;
  defaultPrompts.unprompt = unprompt || defaultPrompts.unprompt;
}

module.exports = {
  setTags,
  promptsJoin,
  removeDuplicates,
  srImage,
  setBg,
  saveImage,
};
