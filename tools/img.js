const { runEnv, defaultPrompts } = require("../app/config");
const { getImage, setTags } = require("../app/image");
const { srImage } = require("../app/utils/utils");

runEnv.NSFW = false;
setTags(
  defaultPrompts.prompt +
    "," +
    "nude,naked,large breasts,Expose the chest,1girl,1"
);
async function main() {
  let i = 100;
  for (; i--; ) {
    try {
      var path = await getImage("images-18", false);
      await srImage(path, path);
    } catch (error) {
      await new Promise((res) => {
        setTimeout(() => {
          res();
        }, 10 * 1000 + Math.random() * 20 * 1000);
      });
    }
  }
}
main();
