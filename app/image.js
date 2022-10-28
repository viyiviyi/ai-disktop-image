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
async function getArg(ser = server[0]) {
  const [prompt, unprompt] = runEnv.magic ? getMagic() : ["", ""];
  let tags = runEnv.randomTag ? promptsRdom() : "";
  let unTags = "";
  tags += defaultPrompts.prompt;
  unTags += defaultPrompts.unprompt;
  if (ser.isMagic) {
    ser.tags = tags + tags + "," + prompt;
    ser.unTags = unTags + unTags + "," + unprompt;
  }
  const option = Object.assign({}, ser.option || {}, {
    prompts: removeDuplicates(ser.tags),
    unprompts: removeDuplicates(ser.unTags),
  });
  switch (ser.apiType) {
    case "naifu":
      return argTemplate.naifu(option);
    case "stable-diffusion":
      return argTemplate.stableDiffusion(option);
  }
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
  let result = "";
  for (let index = 0; index < server.length; index++) {
    if (result) return result;
    const config = {
      headers: {},
    };
    if (
      !server[index].url.startsWith("http") &&
      server[index].ngrok &&
      server[index].ngrok.enadle
    ) {
      let url = await tunnels(server[index].ngrok.token);
      server[index].url = url + server[index].url;
      config.headers["ngrok-skip-browser-warning"] = 0;
    }
    const arg = getArg(server[index]);
    console.log(server[index].url, arg[index]);
    result = await axios
      .post(server[index].url, arg[index], config)
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

const argTemplate = {
  naifu: function (
    option = {
      prompts: "",
      unprompts: "",
      seed: -1,
      width: 1024,
      height: 576,
      scale: 12,
      sampler: "k_euler_ancestral",
      steps: 28,
    }
  ) {
    option = Object.assign(
      {
        prompts: "",
        unprompts: "",
        seed: -1,
        width: 1024,
        height: 576,
        scale: 12,
        sampler: "k_euler_ancestral",
        steps: 28,
      },
      option
    );
    return {
      prompt: option.prompts,
      width: option.width,
      height: option.height,
      scale: option.scale,
      sampler: samplerMap.naifu[option.sampler],
      steps: option.steps,
      seed:
        option.seed == -1
          ? Number(parseInt(Math.random() * 4294967296 - 1))
          : option.seed,
      n_samples: 1,
      ucPreset: 0,
      uc: "lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry,$unprompt",
    };
  },
  stableDiffusion: function (
    option = {
      prompts: "",
      unprompts: "",
      seed: -1,
      width: 1024,
      height: 576,
      scale: 12,
      sampler: "k_euler_ancestral",
      steps: 28,
    }
  ) {
    option = Object.assign(
      {
        prompts: "",
        unprompts: "",
        seed: -1,
        width: 1024,
        height: 576,
        scale: 12,
        sampler: "k_euler_ancestral",
        steps: 28,
      },
      option
    );
    return {
      fn_index: 14,
      data: [
        option.prompts,
        option.unprompts,
        "None",
        "None",
        option.steps,
        samplerMap.stableDiffusion[option.sampler],
        false,
        false,
        1,
        1,
        option.scale,
        option.seed == -1
          ? Number(parseInt(Math.random() * 4294967296 - 1))
          : option.seed,
        -1,
        0,
        0,
        0,
        false,
        option.height,
        option.height,
        false,
        0.7,
        0,
        0,
        "None",
        false,
        false,
        null,
        "",
        "Seed",
        "",
        "Nothing",
        "",
        true,
        false,
        false,
        null,
        "",
        "",
      ],
      session_hash: "m4lcbskxh9k",
    };
  },
};

const samplerMap = {
  naifu: {
    k_euler: "k_euler",
    k_euler_ancestral: "k_euler_ancestral",
  },
  stableDiffusion: {
    k_euler: "Euler",
    k_euler_ancestral: "Euler a",
  },
};
