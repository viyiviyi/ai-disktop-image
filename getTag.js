const axios = require("axios");
const fs = require("fs");
const { join } = require("path");
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
const tags = new Set();
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
                let tag = v.englishName.toLowerCase().replace(/\s+/g, "_");
                if (!tags.has(tag)) {
                  tags.add(tag);
                  ls.push(
                    tag +
                      "," +
                      0 +
                      "," +
                      item.name +
                      ">" +
                      cate.name +
                      ">" +
                      v.name
                  );
                }
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
      let tag = v[0].toLowerCase().replace(/\s+/g, "_");
      if (!tags.has(tag)) {
        tags.add(tag);
        ls.push(tag + "," + v[1] + "," + v[2] + ">" + v[3]);
      }
    });
  });

  let def = fs.readFileSync("translation-tags.csv").toString().split("\n");
  def.filter(v=>v).forEach((v) => {
    let l = v.split(",");
    let tag = l[0].toLowerCase().replace(/\s+/g, "_");
    if (!tags.has(tag)) {
      tags.add(tag);
      ls.push(v.toLowerCase().replace(/\s+/g, "_"));
    }
  });
  fs.writeFileSync("tags.csv", ls.join("\n"));
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
