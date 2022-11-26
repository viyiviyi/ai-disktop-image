const fs = require("fs");
const join = require("path").join;
const axios = require("axios");

const basePath = join(
  "F:/stable-diffusion-webui",
  "extensions",
  "stable-diffusion-webui-inspiration",
  "inspiration",
  "embedding"
);
const embdeddingPath = join("F:/stable-diffusion-webui",'embeddings');

async function saveImage(base64, fileDir, fileName, dataType = "base64") {
  try {
    var dir = join(basePath, fileDir);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    let filePath = join(dir, fileName);
    fs.writeFileSync(filePath, base64, dataType);
    console.log("save file: " + filePath);
    return filePath;
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function getImage(emb, fileDir, fileName) {
  await await axios
    .post(
      "http://127.0.0.1:7860/sdapi/v1/txt2img",
      stableDiffusionArg({ prompts: emb + ",1girl,masterpiece, best quality" })
    )
    .then((d) => d.data)
    .then(async (data) => {
      if (!data.images) return console.error("error");
      if (!Array.isArray(data.images) || data.images.length == 0)
        return console.error("error");
      return saveImage(data.images[0], fileDir, fileName);
    })
    .catch(async (err) => console.error(err));
}

function getDirs(path) {
  let fileList = [];
  if (!fs.existsSync(path)) return fileList;
  let files = fs.readdirSync(path);
  files.forEach((file) => {
    let fPath = join(path, file);
    let state = fs.statSync(fPath);
    if (state.isDirectory()) {
      fileList.push(file);
    }
  });
  return fileList;
}
function getFiles(path, suffix) {
  let fileList = [];
  if (!fs.existsSync(path)) return fileList;
  let files = fs.readdirSync(path);
  files.forEach((file) => {
    let fPath = join(path, file);
    let state = fs.statSync(fPath);
    if (!state.isDirectory()) {
      if (fPath.endsWith(suffix)) fileList.push(file);
    }
  });
  return fileList;
}
main();
async function main() {
  // 获取 embedding 文件列表
  let embFileList = getFiles(embdeddingPath, ".pt");
  embFileList.push(...getFiles(embdeddingPath, ".webp"));
  let embFilesNoSuffix = embFileList.map((v) =>
    v.substring(0, v.lastIndexOf("."))
  );
  console.log(embFilesNoSuffix);
  // 获取输出目录下 embedding 文件夹下对应 embedding 的文件夹列表
  let outputDirs = getDirs(join(basePath));
  // 当输出列表内的文件夹对应的 embedding 文件不存在时删除文件夹
  outputDirs.forEach((v) => {
    if (embFilesNoSuffix.findIndex((f) => f == v) === -1)
      fs.rmSync(join(basePath, v));
  });
  for (let i = 0; i < embFilesNoSuffix.length; i++) {
    const emb = embFilesNoSuffix[i];
    for (let j = 0; j < 4; j++) {
      var fileName = j.toString().padStart(3, "0") + ".png";
      if (!fs.existsSync(join(basePath, emb, fileName))) {
        await getImage(emb, emb, fileName);
        // return; // 测试
      }
    }
  }
}
function stableDiffusionArg(option = {}) {
  return {
    enable_hr: false,
    denoising_strength: 0,
    firstphase_width: 0,
    firstphase_height: 0,
    prompt: option.prompts || "masterpiece, best quality",
    styles: [],
    seed: -1,
    subseed: -1,
    subseed_strength: 0.69,
    seed_resize_from_h: -1,
    seed_resize_from_w: -1,
    batch_size: 1,
    n_iter: 1,
    steps: 12,
    cfg_scale: 7,
    width: option.width || 512,
    height: option.height || 512,
    restore_faces: false,
    tiling: false,
    negative_prompt:
      option.negative_prompt ||
      "lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry,artist name",
    eta: 0,
    s_churn: 0,
    s_tmax: 0,
    s_tmin: 0,
    s_noise: 0.667,
    sampler_index: option.sampler || "DPM++ 2M",
  };
}
