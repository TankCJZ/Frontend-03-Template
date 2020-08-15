const Request = require('./Request.js');
const Parser = require('./Parser5.js');

void async function () {
  let request = new Request({
    method: "POST",
    host: "127.0.0.1",
    port: "3000",
    path: "/",
    headers: {
      ["X-Foo2"]: "costumed"
    }, 
    body: {
      name: "zhangsan"
    }
  });
  let response = await request.send();
  // 解析html
  let dom = Parser.parseHTML(response.body);
  console.log(JSON.stringify(dom, null, '   '))
}();