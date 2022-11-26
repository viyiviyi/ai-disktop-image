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
const ls = [];
const translations = [];
const tags = new Set();

function addTags(tag, name, type = 0, hotCount = 0) {
  if (!tags.has(tag)) {
    tags.add(tag);
    ls.push([tag, type, hotCount, [...name.split(",")]]);
    translations.push([tag, [...name.split(",")]]);
  } else {
    let idx = ls.findIndex(
      (f) => f[0] == tag || f[3].findIndex((sub) => sub == tag) != -1
    );
    if (idx > -1) {
      name.split(",").forEach((v) => {
        if (ls[idx][3].findIndex((f) => f.includes(v)) == -1) {
          ls[idx][3].push(v);
          translations[idx][1].push(v);
        }
      });
    }
  }
}
async function main() {
  let list = fs.readFileSync(resolve("./danbooru.csv")).toString().split("\n");
  let ts = list.map((v) => {
    let row = v
      .toLowerCase()
      .replace(/"/g, "")
      .split(",")
      .map((v) => v.trim());
    return [row[0], row[1], row[2], row.slice(3)];
  });
  ts.forEach((v) => {
    tags.add(v[0]);
    v[3] &&
      v[3].forEach((ali) => {
        tags.add(ali);
      });
    ls.push(v);
    translations.push([v[0],[]]);
  });

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

  let def = fs.readFileSync("tags.translation.csv").toString().split("\n");
  def
    .filter((v) => v)
    .map((v) => v.trim())
    .forEach((v) => {
      let l = v.split(",").map((v) => v.trim());
      let tag = l[0].toLowerCase().trim().replace(/\s+/g, "_");
      let name = l[1].trim().replace(/\s+/g, "_").replace(/\|/g, ",");
      addTags(tag, name);
    });
  fs.writeFileSync(
    "tags.csv",
    ls
      .map((v) => {
        v[3] = '"' + v[3].filter((v) => v).join(",") + '"';
        return v.join(",");
      })
      .join("\n")
  );
  fs.writeFileSync(
    "translation.csv",
    translations
      .map((v) => {
        v[1] = '"' + v[1].filter((v) => v).join(",") + '"';
        return v.join(",");
      })
      .join("\n")
  );
}
main();

function getFiles(path) {
  let fileList = [];
  let files = fs.readdirSync(path);
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
