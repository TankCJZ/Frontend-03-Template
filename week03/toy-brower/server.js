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
    response.end(`
    <html lang="en">
      <head>
      </head>
      <style>
        html{
          font-size: 12px;
        }
        #h2{
          color: #fff;
          font-size: 29px;
          height: 100px;
        }
        .title a{
          font-size: 12px;
        }
        .user .name{
          font-size: 12px;
        }
      </style>
      <body>
        <h2 id="h2">hello</h2>
        <div class="title">
          <a>111</a>
        </div>
        <div class="user">
          <a class="name">username</a>
        </div>
      </body>
      </html>
    `);
  })
}).listen(3000);

console.log('server started in port 3000');