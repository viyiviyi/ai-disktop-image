const { defaultPrompts } = require("./app/config");
const { getImage, setTags } = require("./app/image");
const { setBg, srImage } = require("./app/utils/utils");

async function main() {
  console.log(new Date().toLocaleString());
  setTags(
    defaultPrompts.prompt +
      "," +
      "(an extremely delicate and beautiful girl:1.33),{extremely delicate and beautiful},{{best quality}},{{{detailed}}},{{intricate }},{ultra-detailed}, {{ray_tracing}},{{{highres}}}, {detailed background},{extremely detailed cg unity 8k wallpaper},(large breasts:1.33),"
  );
  var path = await getImage();
  console.log("image path:", path);
  if (!path) return;
  if (!(await srImage(path, path))) return;
  await setBg(path);
}
main();
