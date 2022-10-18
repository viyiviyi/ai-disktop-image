const { runEnv } = require("./app/config");
const { getImage } = require("./app/image");
const { setBg, srImage } = require("./app/utils/utils");

async function main() {
  runEnv.randomTag = false;
  var path = await getImage();
  console.log("image path:", path);
  if (!path) return;
  if (!(await srImage(path, path))) return;
  await setBg(path);
}
main();
