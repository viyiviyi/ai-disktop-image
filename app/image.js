const axios = require("axios");
const fs = require("fs");
const join = require("path").join;
const 元素法典 = require("./data/元素法典.json");
const { server, runEnv, defaultPrompts } = require("./config");
const { promptsRandom: promptsRdom } = require("./data/prompts");
const { tunnels } = require("./utils/ngrok");

function getMagic() {
  let p = ["", ""];
  p = 元素法典[Math.floor(Math.random() * 元素法典.length)];
  return p || [];
}
async function getArg(ser = server[0]) {
  const [prompt, unprompt] = runEnv.magic ? getMagic() : ["", ""];
  let tags = runEnv.randomTag ? promptsRdom() : "";
  let unTags = "";
  tags += "," + defaultPrompts.prompt;
  unTags += "," + defaultPrompts.unprompt;
  if (ser.isMagic) {
    ser.tags = tags + "," + prompt;
    ser.unTags = unTags + "," + unprompt;
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
// eslint-disable-next-line no-unused-vars
async function downloadImage(url, path = "images") {
  var dir = join(require.main.path, path);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  var fileName = Date.now() + ".png";
  let filePath = join(dir, fileName);
  const writer = fs.createWriteStream(filePath);

  const response = await axios({
    url,
    method: "GET",
    responseType: "stream",
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", () => {
      resolve(filePath);
    });
    writer.on("error", reject);
  });
}

function setTags(prompts, unprompt) {
  defaultPrompts.prompt = prompts || "";
  defaultPrompts.unprompt = unprompt || "";
}

async function getImage(path = undefined) {
  let result = "";
  for (let index = 0; index < server.length; index++) {
    if (result) return result;
    const ser = server[index];
    const config = {
      headers: {},
    };
    if (!ser.url.startsWith("http") && ser.ngrok && ser.ngrok.enadle) {
      let url = await tunnels(ser.ngrok.token);
      ser.url = url + ser.url;
      config.headers["ngrok-skip-browser-warning"] = 0;
    }
    const arg = await getArg(ser);
    console.log(ser.url, arg);
    result = await await axios
      .post(ser.url, arg, config)
      .then((d) => d.data)
      .then(async (data) => {
        switch (ser.apiType) {
          case "naifu":
            return await parseResult.naifu(data, path);
          case "stable-diffusion":
            return await parseResult.sd(data, path);
        }
      })
      .catch(async (err) => console.error(err));
  }
  return result;
}

const parseResult = {
  async naifu(data, path) {
    if (typeof data === "object" && data.error) console.error(data.error);
    if (typeof data !== "string") return;
    let d = data.split("\n").find((f) => f.startsWith("data:"));
    if (!d) return;
    let base64 = d.split(":")[1];
    return saveImage(base64, path);
  },
  async sd(data, path) {
    if (!data.images) return console.error("error");
    if (!Array.isArray(data.images) || data.images.length == 0)
      return console.error("error");
    return saveImage(data.images[0], path);
    // if (!Array.isArray(data)) {
    //   return console.error("error");
    // }
    // data = data[0];
    // if (!Array.isArray(data)) return console.error("error");
    // data = data[0];
    // if (!data.name) console.error("error");
    // return await downloadImage("http://127.0.0.1:7860/file=" + data.name, path);
  },
};

module.exports = {
  getImage,
  setTags,
  getArg,
};

const argTemplate = {
  naifu: function (option = {}) {
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
      sampler: samplerMap.naifu[option.sampler] || option.sampler,
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
  stableDiffusion: function (option = {}) {
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
      enable_hr: false,
      denoising_strength: 0,
      firstphase_width: 0,
      firstphase_height: 0,
      prompt: option.prompts,
      styles: [],
      seed: -1,
      subseed: -1,
      subseed_strength: 0.69,
      seed_resize_from_h: -1,
      seed_resize_from_w: -1,
      batch_size: 1,
      n_iter: 1,
      steps: 28,
      cfg_scale: 12,
      width: option.width,
      height: option.height,
      restore_faces: false,
      tiling: false,
      negative_prompt: option.unprompts,
      eta: 0,
      s_churn: 0,
      s_tmax: 0,
      s_tmin: 0,
      s_noise: 0.667,
      sampler_index:
        samplerMap.stableDiffusion[option.sampler] || option.sampler,
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
