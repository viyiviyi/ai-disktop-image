const axios = require("axios");
const fs = require("fs");
const { join, resolve } = require("path");
const { getYamltags } = require("./getYaml");

const baseUrl = "https://chart.dawnmark.cn";
async function delay() {
  return new Promise((res) => {
    setTimeout(() => {
      res();
    }, 200);
  });
}
const translations = [];
const tags = new Set();
function addTags(tag, name) {
  if (!tags.has(tag)) {
    tags.add(tag);
    translations.push([tag, [name]]);
  } else {
    let idx = translations.findIndex((f) => f[0] == tag);
    if (idx > -1 && translations[idx][1].findIndex((f) => f == name) == -1)
      translations[idx][1].push(name);
  }
}
async function main() {
  let val = await axios
    .get(baseUrl + "/tag/nai-categories")
    .then((d) => d.data)
    .then(async (val) => {
      if (Array.isArray(val)) {
        return val;
      }
    });
  for (let i = 0; i < val.length; i++) {
    const item = val[i];
    if (Array.isArray(item.children)) {
      for (let index = 0; index < item.children.length; index++) {
        const cate = item.children[index];
        await axios
          .get(baseUrl + "/tag/nai-tags?categoryId=" + cate.id)
          .then((d) => d.data)
          .then((res) => {
            if (Array.isArray(res)) {
              res.forEach((v) => {
                let tag = v.englishName
                  .toLowerCase()
                  .trim()
                  .replace(/\s+/g, "_");
                let name = v.name.trim().replace(/\s+/g, "_");
                addTags(tag, name);
              });
            }
          });
        await delay();
      }
    }
  }
  let ys = getFiles("yamltags");
  ys.forEach((vPath) => {
    let list = getYamltags(vPath);
    list.forEach((v) => {
      let tag = v[0].toLowerCase().trim().replace(/\s+/g, "_");
      let name = v[3].trim().replace(/\s+/g, "_");
      addTags(tag, name);
    });
  });

  let def = fs
    .readFileSync(resolve("translation-tags.csv"))
    .toString()
    .split("\n");
  def
    .filter((v) => v)
    .map((v) => v.trim())
    .forEach((v) => {
      let l = v.split(",").map((v) => v.trim());
      let tag = l[0].toLowerCase().trim().replace(/\s+/g, "_");
      let name = l[2].trim().replace(/\s+/g, "_");
      addTags(tag, name);
    });
  fs.writeFileSync(
    "translation.csv",
    translations
      .map((v) => {
        v[1] = '"' + v[1].filter((v) => v).join(",") + '"';
        return v;
      })
      .join("\n")
  );
}
main();

function getFiles(path) {
  let fileList = [];
  let files = fs.readdirSync(resolve(path));
  files.forEach((file) => {
    let fPath = join(path, file);
    let state = fs.statSync(fPath);
    if (state.isDirectory()) {
      fileList.push(...getFiles(fPath));
    } else {
      if (fPath.endsWith("yaml")) fileList.push(fPath);
    }
  });
  return fileList;
}
