const fs = require("fs");
const translations = [];

let def = fs.readFileSync("tags.translation.csv").toString().split("\n");
def
  .filter((v) => v)
  .map((v) => v.trim())
  .forEach((v) => {
    let l = v.split(",").map((v) => v.trim());
    let tag = l[0].toLowerCase().trim().replace(/\s+/g, "_");
    let name = l[1].trim().replace(/\s+/g, "_").replace(/\|/g, ",");
    translations.push([tag, name.split(",")]);
  });
fs.writeFileSync(
  "translation.sort.csv",
  translations
    .sort((v, n) => (v[0] > n[0] ? 1 : v[0] < n[0] ? -1 : 0))
    .map((v) => {
      v[1] = '"' + v[1].filter((v) => v).join(",") + '"';
      return v.join(",");
    })
    .join("\n")
);

// cum_on_back,cum_on_belly,cum_on_chest,cum_on_ear,cum_on_feet,cum_on_foot,cum_on_hand,cum_on_hands,cum_on_hips,cum_on_leg,cum_on_legs,cum_on_lower_body,cum_on_thigh,cum_on_thighs,cum_on_upper_body,semen_on_body,semen_on_lower_body,semen_on_upper_body
