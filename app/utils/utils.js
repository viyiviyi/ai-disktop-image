const { join } = require("path");
const { exec } = require("shelljs");

/**
 * 设置图片为桌面背景
 * @param {string} path 图片完整路径
 */
module.exports.setBg = async function setBg(path) {
  exec("python " + join(__dirname, "setBg.py") + " " + path);
};

/**
 * 图片超分辨率
 * @param {string} path  图片文件路径
 * @param {string} outPath 输出图片文件路径
 * @returns {boolean} 是否成功
 */
 module.exports.srImage = async function srImage(path, outPath) {
  let p = exec(
    config["Super-Resolution"]
      .replace("$input", path)
      .replace("$output", outPath)
  );
  return !p.code;
}