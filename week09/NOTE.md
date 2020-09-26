## 第九周|编程与算法训练
本周学习目标：如何实现寻路算法？

### 地图编辑器实现
先实现一个地图编辑器方便对地图增加一些障碍物，来测试寻路算法

实现思路：  
1.生成100*100地图   
2.当鼠标在画布中按下左键并且移动则开始绘制地图   
3.当鼠标松开后不再停止绘制   
4.当鼠标在画布按下右键并且移动鼠标则清除地图   
5.点击保存按钮 保存数据到缓存中   
6.清除地图数据   

首页需要创建一个100*100个格子的地图   
先简单定义地图样式   
```html
<style>
  *{
    margin: 0;
    padding: 0;
  }
  #map{
    width: 800px;
    display: flex;
    flex-wrap: wrap;
  }
  .box{
    width: 6px;
    height: 6px;
    display: inline-block;
    vertical-align: top;
    background-color: #eee;
    border: 1px solid #e1e2e3;
  }
</style>
```
定义一些变量   
```javascript
let map = localStorage['map'] ? JSON.parse(localStorage['map']) : Array(10000).fill(0); // 地图数据
let container = document.getElementById('map'); 
let save = document.getElementById('save');
let clear = document.getElementById('clear');

let isMousedown = false; //是否是鼠标按下
let isClear = false; //是否是清除状态
```
接着编写绘制地图函数render   
给container增加100*100个div增加box样式，给每一个div增加鼠标移动监听，鼠标按下后右键为清楚左键为绘制   
地图数据一维数组 每项值为0表示未绘制 1表示已经绘制   
小技巧：使用了两层100*100循环，并且 用 循环长度 100 * y + x 来获取当前数组下标    
```javascript
// 绘制函数 
function render(map) {
  container.innerHTML = '';
  for (let y = 0; y < 100; y++) {
    for (let x = 0; x < 100; x++) {
      let box = document.createElement('div');
      box.classList.add('box');

      if (map[100 * y + x] === 1) {
        box.style.backgroundColor = 'black';
      }

      // 鼠标移动
      box.addEventListener('mousemove', () => {
        // 鼠标按下
        if (isMousedown) {
          // 清除
          if (isClear) {
            box.style.backgroundColor = '';
            map[100*y + x] = 0;
          } else {
            // 花点
            box.style.backgroundColor = 'black';
            map[100*y + x] = 1;
          }
        }
      });
      container.appendChild(box);
    }
  }
}
```

监听鼠标按下和鼠标松开   
鼠标使用到右键清除画布，所以需要把浏览器默认右键菜单禁用
```javascript
//鼠标按下
document.addEventListener('mousedown', e => {
  isMousedown = true;
  isClear = (e.which === 3);
});
//鼠标松开
document.addEventListener('mouseup', e => {
  isMousedown = false;
});
//禁止右键菜单
document.addEventListener('contextmenu', e => {
  e.preventDefault();
});
```

增加一些保存数据和清楚数据事件   
```javascript
// 保存数据
save.onclick = function () {
  localStorage['map'] = JSON.stringify(map);
}

//清除数据
clear.onclick = function () {
  map = Array(10000).fill(0);
  render(map);
}
```

完整代码：
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>地图编辑器</title>
  <style>
    *{
      margin: 0;
      padding: 0;
    }
    #map{
      width: 800px;
      display: flex;
      flex-wrap: wrap;
    }
    .box{
      width: 6px;
      height: 6px;
      display: inline-block;
      vertical-align: top;
      background-color: #eee;
      border: 1px solid #e1e2e3;
    }
  </style>
</head>
<body>
  <div id="map">
  </div>

  <button id="save">保存地图</button>
  <button id="clear">清除地图</button>

  <script>
    let map = localStorage['map'] ? JSON.parse(localStorage['map']) : Array(10000).fill(0);
    let container = document.getElementById('map');
    let save = document.getElementById('save');
    let clear = document.getElementById('clear');

    let isMousedown = false;
    let isClear = false;

    save.onclick = function () {
      localStorage['map'] = JSON.stringify(map);
    }

    clear.onclick = function () {
      map = Array(10000).fill(0);
      render(map);
    }

    //鼠标按下
    document.addEventListener('mousedown', e => {
      isMousedown = true;
      isClear = (e.which === 3);
    });
    //鼠标松开
    document.addEventListener('mouseup', e => {
      isMousedown = false;
    });
    //禁止右键菜单
    document.addEventListener('contextmenu', e => {
      e.preventDefault();
    });

    // 生成画布
    function render(map) {
      container.innerHTML = '';
      for (let y = 0; y < 100; y++) {
        for (let x = 0; x < 100; x++) {
          let box = document.createElement('div');
          box.classList.add('box');

          if (map[100 * y + x] === 1) {
            box.style.backgroundColor = 'black';
          }

          // 鼠标移动
          box.addEventListener('mousemove', () => {
            // 鼠标按下
            if (isMousedown) {
              // 清除
              if (isClear) {
                box.style.backgroundColor = '';
                map[100*y + x] = 0;
              } else {
                // 花点
                box.style.backgroundColor = 'black';
                map[100*y + x] = 1;
              }
            }
          });
          container.appendChild(box);
        }
      }
    }

    // 寻路
    function path() {

    }

    render(map);

  </script>
</body>
</html>
```

### 广度优先搜索
先从最简单的开始，每个点只需要找到自己周围（上下左右）4个点，斜向先不考虑，是否可以走，每走到下一个点再次考虑周围4个点是否可以走，这样一直扩展到目标点，就能判断出起点到目标点是否可以能到达，如图所示：   

<img src="https://blog-images-file.oss-cn-beijing.aliyuncs.com/week/08/1.png" width = "200" height = "auto" alt="图片名称" align=center />
<img src="https://blog-images-file.oss-cn-beijing.aliyuncs.com/week/08/2.png" width = "200" height = "auto" alt="图片名称" align=center />
<img src="https://blog-images-file.oss-cn-beijing.aliyuncs.com/week/08/3.png" width = "200" height = "auto" alt="图片名称" align=center />

> 注意：如果使用递归112345...则是一个深度优先算法了，寻路应该使用广度优先

定义一个sleep函数，用来延迟执行  
```javascript
async function sleep(time) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, time);
  })
}
```
编写寻路函数path  接受map地图数据，起点(start) 和 目标点位置(end)   
函数中定义一个队列存放地图点，并且循环取出地图点来判断是否找到了目标点，如果没有找到则继续寻找周围4个点   
insert函数 会高亮显示当前已经走过的点，并且标记为2,继续将点加入到队列中
```javascript
/**
 * @description: 寻路 第一版
 * @param map {Array} 地图数据 
 * @param start {Number} 起点
 * @return {Boolean} 是否能到达
 * @param end {Number} 目标点
 */
async function path(map, start, end) {
  // 定义队列
  let queue = [start];

  async function insert(x, y) {
    // 如果超出边界 则跳过
    if (x < 0 || x >= 100 || y < 0 || y >= 100) {
      return;
    }
    // 如果是障碍物 则跳过
    if (map[y * 100 + x]) {
      return;
    }

    // 高亮显示当前点
    await sleep(10);
    container.children[y * 100 + x].style.backgroundColor = 'lightgreen';
    // 标记当前点已经走过
    map[y * 100 + x] = 2;
    // 继续将当前点作为起点 加入队列中
    queue.push([x, y]);
  }

  // 遍历队列
  while (queue.length) {
    // 取出第一个
    let [x, y] = queue.shift();
    // 找到了目标点
    if (x === end[0] && y === end[1]) {
      // 找到了
      return true;
    }
    
    // 开始寻找当前点4个方向
    await insert(x - 1, y); // top
    await insert(x, y - 1); // left
    await insert(x + 1, y); // right 
    await insert(x, y + 1); // bottom
  }

  // 没有找到
  return false;

}
```

<img src="https://blog-images-file.oss-cn-beijing.aliyuncs.com/week/08/2.gif" width = "600" height = "auto" alt="图片名称" align=center />

### 路径问题处理
找出真实的路径出来,我们将path函数进行改造   
1.insert中增加一个参数传递当前位置   
2.增加斜向的4个位置处理   
3.为了不影响原始数据，赋值一份数据到table   
4.将pre 赋值当前点 作为起始点   
5.找到目标点后通过while循环找出所有点数组组成的路径线   

```javascript
// [x, y]: 把原来的坐标点转递过去
await insert(x - 1, y, [x, y]); // top
await insert(x, y - 1, [x, y]); // left
await insert(x + 1, y, [x, y]); // right 
await insert(x, y + 1, [x, y]); // bottom

// 处理斜向坐标
await insert(x - 1, y - 1, [x, y]); // left-top
await insert(x + 1, y - 1, [x, y]); // right-top
await insert(x - 1, y + 1, [x, y]); // left-bottom
await insert(x + 1, y + 1, [x, y]); // right-bottom
```
> 将当前坐标点传递给insert函数，并且将4个斜向点也一并处理，这样就处理了周围所有坐标点了

```javascript
let table = Object.create(map); 
async function insert(x, y, pre) {
  if (x < 0 || x >= 100 || y < 0 || y >= 100) {
    // 超出边界
    return;
  }
  if (table[y * 100 + x]) {
    return;
  }

  // await sleep(10);
  container.children[y * 100 + x].style.backgroundColor = 'lightgreen';
  // 将原来坐标点作为 新的点
  table[y * 100 + x] = pre;
  queue.push([x, y]);
}
```
> 复制一份坐标点保存到table中，insert函数增加一个pre [x,y] 接口上一个坐标点位置   
> table[y * 100 + x] = pre 将上一个坐标点赋值给当前点作为新的起始点

```javascript
while (queue.length) {
  // 将当前点取出
  let [x, y] = queue.shift();

  // 找到目标点
  if (x === end[0] && y === end[1]) {
    // 记录路径点
    let path = [];
    // 寻找完整的路径线
    // 如果 不是起点说明当前点是路径线中的一个点
    while (x != start[0] || y != start[1]) {
      // 保存当前点
      path.push(map[y * 100 + x]);
      // 重新赋值当前坐标点  x y 
      [x, y] = table[y * 100 + x];
      // 高亮显示路径点
      await sleep(50);
      container.children[y * 100 + x].style.backgroundColor = 'purple';
    }
    return path;
  }
  // ...
}
```
<img src="https://blog-images-file.oss-cn-beijing.aliyuncs.com/week/08/1.gif" width = "600" height = "auto" alt="图片名称" align=center />

### 启发式搜索
上面的广发式寻路方法并不是最优的方案，那么有更好的方法吗？答案是启发式搜索， 能找到最佳路径的启发式寻路叫做A*,不一定能找到最佳路径寻路叫A   
显示思路：   
确保每次走的点和 目标点对比是距离最近的点即可这样形成额路径就是最优路径   
我们需要修改存放地图的数据结构，我们需要把队列改成按一定优先级提供位置点的一个数据结构，我们写一个Sorted类来处理这种数据结构   
```javascript
class Sorted {
  constructor(data, compare) {
    this.data = data.slice(); //复制一份地图数据
    // 设置比较函数 默认使用Array.sort
    this.compare = compare || ((a, b) => a - b);
  }
  // 定义取出数据点函数 取出最小值
  take() {
    if (!this.data.length) {
      return;
    }
    // 定义默认最小点
    let min = this.data[0];
    // 定义默认最小点位置
    let minIndex = 0;
    for (let i = 0; i < this.data.length; i++) {
      if (this.compare(this.data[i], min) < 0) {
        // 保存做小点
        min = this.data[i];
        minIndex = i;
      }
    }

    // 将最后一个点赋值给最小点，然后将最后点移除，这样就完成了替换操作
    // 例如：[3,4,1,5] minIndex=2 赋值后： [3,4,5,5]
    this.data[minIndex] = this.data[this.data.length - 1];
    //  [3,4,5,5] => [3,4,5]
    this.data.pop();
    return min;// min: 1
  }
  give(point) {
    this.data.push(point);
  }
}
```
接着我们将使用sorted来代替queue   
```javascript
let queue = new Sorted([start], (a, b) => distance(a) - distance(b));

function distance(point) {
  return (point[0] - end[0]) ** 2 + (point[1] - end[1]) ** 2;
}

// 加值
queue.give([x, y]);

// 取值
while (queue.data.length) {
  let [x, y] = queue.take();
  //...
}
```
运行效果：   

<img src="https://blog-images-file.oss-cn-beijing.aliyuncs.com/week/08/4.gif" width = "600" height = "auto" alt="图片名称" align=center />
