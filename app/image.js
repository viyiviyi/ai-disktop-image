const axios = require("axios");
const 元素法典 = require("./data/元素法典.json");
const { server, runEnv, defaultPrompts } = require("./config");
const { promptsRandom: promptsRdom } = require("./data/prompts");
const { tunnels } = require("./utils/ngrok");
const { saveImage, promptsJoin } = require("./utils/utils");

function getMagic() {
  let p = ["", ""];
  p = 元素法典[Math.floor(Math.random() * 元素法典.length)];
  return p || [];
}

async function getArg(ser = server[0]) {
  const [promptMagic, unpromptMagic] =
    runEnv.magic && ser.isMagic ? getMagic() : ["", ""];
  let rdomTags = runEnv.randomTag ? promptsRdom() : "";
  const option = Object.assign({}, ser.option || {}, {
    prompts: promptsJoin(
      defaultPrompts.prompt,
      ser.option.prompt,
      ser.defaultPrompts[0],
      rdomTags,
      promptMagic
    ),
    unprompts: promptsJoin(
      defaultPrompts.unprompt,
      ser.option.unprompt,
      ser.defaultPrompts[1],
      unpromptMagic
    ),
  });

  switch (ser.apiType) {
    case "naifu":
      return argTemplate.naifu(option);
    case "stable-diffusion":
      return argTemplate.stableDiffusion(option);
  }
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
    console.log(ser.url, "\n", JSON.stringify(arg, null, 4));
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

module.exports = {
  getImage,
  getArg,
};

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
  },
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
      sampler: option.sampler,
      steps: option.steps,
      seed:
        option.seed == -1
          ? Number(parseInt(Math.random() * 4294967296 - 1))
          : option.seed,
      n_samples: 1,
      ucPreset: 0,
      uc: option.unprompts,
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
        scale: 7,
        sampler: "DPM++ 2M",
        steps: 12,
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
      steps: option.steps,
      cfg_scale: option.scale,
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
      sampler_index: option.sampler,
    };
  },
};
