const { getImage, srImage, setTags } = require("./image");


setTags('nipples, ejaculation, cum, pubic_hair, clitoris, pussy_juice, female_ejaculation, nude,medium breasts','');
async function main() {
  let i = 100;
  for (;i-- ;) {
    await new Promise((res) => {
      setTimeout(() => {
        res()
      }, 30 * 1000 + Math.random() * 20*1000);
    })
    var path = await getImage('images-18');
    await srImage(path, path);
  }
}
main();