/*eslint no-unused-vars: "off"*/

const { getArg } = require("./app/image");
const { promptsRandom: promptsRdom, upload, updatePrompts } = require("./app/data/prompts");
const { setBg } = require("./app/utils/utils");

// console.log(promptsRdom())
console.log(getArg())
// setBg("E:\\projects\\nodejs\\windowBgImageAI\\images\\1665983526066.png");


console.log(require.main.path)
// updatePrompts()
