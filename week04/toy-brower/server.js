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
        #container{
          width: 500px;
          height: 500px;
          display: flex;
          background: rgb(255,255,255);
        }
        #container #myid{
          width: 200px;
          height: 100px;
          background: rgb(255,0,0);
        }
        #container .c1{
          flex: 1;
          background: rgb(0,255,0);
        }
      </style>
      <body>
        <div id="container">
          <div id="myid"></div>
          <div class="c1"></div>
        </div>
      </body>
      </html>
    `);
  })
}).listen(3000);

console.log('server started in port 3000');