// 9. HTTP请求 | 服务端环境准备 课后作业
const http = require('http');

http.createServer((request, response) => {
  let body = [];
  request.on('error', err => {
    console.error(err);
  })
  .on('data', chunk => {
    body.push(Buffer.from(chunk));
  })
  .on('end', () => {
    body = Buffer.concat(body).toString();
    console.log('body: ', body);
    response.writeHead(200, {
      'Content-Type': 'text/html'
    });
    response.end('Hello World');
  })
}).listen(3000);

console.log('server started in port 3000');