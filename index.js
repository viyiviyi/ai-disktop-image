const { defaultPrompts } = require("./app/config");
const { getImage, setTags } = require("./app/image");
const { setBg, srImage } = require("./app/utils/utils");
const join = require("path").join;

async function main() {
  console.log(new Date().toLocaleString());
  setTags(defaultPrompts.prompt + ",");
  var path = await getImage();
  console.log("image path:", path);
  if (!path) return;
  let bgimgName = "default.png";
  bgimgName = join(require.main.path, bgimgName);
  if (!(await srImage(path, bgimgName))) return;
  await setBg(bgimgName);
}
main();
