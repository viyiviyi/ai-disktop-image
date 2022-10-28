const axios = require("axios");
const cheerio = require("cheerio");
const { runEnv } = require("../config");
const fs = require("fs/promises");
const { join } = require("path");

let prompts = require("./prompts.json");

module.exports.prompts = prompts;
module.exports.promptsRandom = function promptsRandom(tags = prompts) {
  return tags
    .filter((f) => (f.enable && runEnv.NSFW ? !f.UNNSFW : true))
    .map((v) => {
      if (v.list) {
        let num = v.min >= v.max ? v.min : randomNum(v.max, v.min);
        let arr = [];
        let cache = [
          ...v.list.filter((v) => (v.enable && runEnv.NSFW ? !v.UNNSFW : true)),
        ];
        if (cache.length <= num) arr = [...cache];
        else {
          for (let i = 0; i < num && i < cache.length; i++) {
            arr.push(cache[randomNum(cache.length - 1, 0)]);
          }
          return promptsRandom(arr);
        }
      } else if (v.value) {
        return v.value;
      }
    })
    .filter((v) => v)
    .join(",");
};

function randomNum(max, min) {
  const num = Math.floor(Math.random() * (max - min + 1)) + min;
  return num;
}

module.exports.updatePrompts = function updatePrompts() {
  axios
    .get("https://wolfchen.top/tag/?from=zhihu")
    .then((d) => d.data)
    .then((html) => {
      let $ = cheerio.load(html);
      let data = $(".layui-tab.layui-tab-card")
        .find(".layui-tab-title")
        .find("li")
        .map(function () {
          return $(this).text();
        })
        .map((idx, txt) => {
          return {
            title: txt,
            enable: true,
            max: 2,
            min: 2,
            NSFW: false,
            list: $(".layui-tab-content .layui-tab-item")
              .eq(idx)
              .find(".layui-form")
              .map(function (i) {
                return {
                  enable: true,
                  max: 2,
                  min: 2,
                  NSFW: false,
                  title: $(this).prev("p").text().trim() || txt + "-" + i,
                  list: $(this)
                    .find("input")
                    .map(function () {
                      let val = $(this).val().trim();
                      return {
                        value: val,
                        title: $(this).prop("title").trim().replace(val, ""),
                        enable: true,
                        NSFW: false,
                      };
                    })
                    .toArray(),
                };
              })
              .toArray(),
          };
        })
        .toArray();
      promptsUpload(data);
      fs.writeFile(
        join(__dirname, "prompts.json"),
        JSON.stringify(data, null, 4)
      );
    });
};
function promptsUpload(data) {
  data.forEach((v) => {
    if (v.value) {
      let item = findPrompt(prompts, undefined, v.value);
      if (item) {
        v.enable = item.enable;
        v.NSFW = item.NSFW;
      }
    } else if (v.title) {
      let item = findPrompt(prompts, v.title);
      if (item) {
        v.enable = item.enable;
        v.max = item.max;
        v.min = item.min;
        v.NSFW = item.NSFW;
      }
    }
    if (v.list) promptsUpload(v.list);
  });
}

function findPrompt(prompts, title, value) {
  let item = undefined;
  for (let index = 0; index < prompts.length; index++) {
    const v = prompts[index];
    if (value && v.value && v.value == value) item = v;
    else if (title && v.title && v.title == title) item = v;
    else if (v.list) item = findPrompt(v.list, title, value);
    if (item) return item;
  }
  return item;
}
