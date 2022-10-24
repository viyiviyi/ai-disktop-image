const axios = require("axios");

module.exports.tunnels = async function (token) {
  const config = {
    headers: {
      Authorization: "Bearer " + token,
      "ngrok-version": "2",
    },
  };
  return await axios
    .get("https://api.ngrok.com/tunnels", config)
    .then((d) => d.data)
    .then((v) => {
      var url = "";
      if (v.tunnels && v.tunnels.length) {
        url = v.tunnels[0].public_url;
      }
      return url;
    })
    .catch((e) => console.error(e));
};
