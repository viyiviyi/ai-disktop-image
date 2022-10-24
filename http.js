const http = require("http");
const { tunnels } = require("./app/utils/ngrok");

const port = 3000;

const server = http.createServer(async (req, res) => {
  if (req.url.endsWith("ngrok/")) {
    var url = await tunnels(
      "2GZ2Qu3eF16h1plsPeS6jpYRpPg_7ejEiaLRy8uKdcfgKiQZL"
    );
    res.writeHead(301, { Location: url });
  }
  res.end();
});

server.listen(port, () => {
  console.log(`服务器运行在 http://${"127.0.0.1"}:${port}/`);
});
