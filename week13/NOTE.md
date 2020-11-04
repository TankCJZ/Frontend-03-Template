## 组件化的学习一
组件化开发方式是为了更好实现代码的复用，组件化是前端框架里面重要组成部分。

### 组件的基本概念和组成
了解组件基本结构之前先看下我们熟悉的对象的基本结构

#### 对象基本结构：
由属性、方法、继承组成   
* Properties (属性)
* Methods (方法)
* Inherit (继承)

#### 属性的基本结构
* Properties (属性)
* Methods (方法)
* Inherit (继承)
* Attribute (属性 | 特性)
* Config & State (配置和状态)
* Event (事件)
* Lifecycle (组件生命周期)
* Children (子组件)


**总的来说组件的结构是在对象的结构上增加更多的特性，因此更适合用来描述UI.** 

#### Properties 和 Attribute
> Properties 与 Attribute 非常相似，当时还是会有细微的区别，
> 一般来说 Attribute 强调描述性,而Property强调从属关系。

在HTML中attribute 和 Property的表现方式：    
```html
Attribute:
<div name="v"><div>

Property:
div.name = 'xxx';
```
#### Lifecycle 
组件生命周期，created 和 destroyed 是必不可少的，表示组件创建和销毁事件，当然不同的设计者会增加一些其他生命周期函数   
例如Vue 中就增加了更细致的事件： beforeMount, mounted, update beforeCreated beforeDestroyed ...   

## 组件系统环境搭建
接下来就是开始组件环境的搭建，我们会介绍vue 和 react 两种风格的搭建   
### React JSX 组件开发环境
安装`webpack webpack-cli @babel/core @babel/preset-env babel-loader @babel/plugin-transform-react-jsx`   

```javascript
// package.json
{
  "name": "jsx",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "@babel/core": "^7.11.1",
    "@babel/preset-env": "^7.11.0",
    "@babel/plugin-transform-react-jsx": "^7.10.4",
    "babel-loader": "^8.1.0",
    "webpack": "^4.44.1",
    "webpack-cli": "^3.3.12"
  }
}
```
配置`webpack.config.js`:   
```javascript
module.exports = {
    entry: './main.js',
    mode: "development",
    module: {
      rules: [
        {
          test: /\.js$/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ["@babel/preset-env"],
              plugins: ["@babel/plugin-transform-react-jsx"]
            }
          }
        }
      ]
    }
};
```
> @babel/plugin-transform-react-jsx 插件是关键，用来编译jsx的

编译成功后`/dist/main.js`中出现：   
`eval("var a = /*#__PURE__*/React.createElement(\"div\", null);\n\n//# sourceURL=webpack:///./main.js?");`

### JSX 基本使用
`@babel/plugin-transform-react-jsx`默认会调用`React.createElement`方法来编译`jsx`代码，我们不需要使用`React`我们定义自己的`createElement`函数,在`webpack.config.js`修改`plugins`配置项的值为如下，表示使用`createElement`来编译`jsx`:   
```javascript
module.exports = {
    entry: './main.js',
    mode: "development",
    module: {
      rules: [
        {
          test: /\.js$/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ["@babel/preset-env"],
              plugins: [
                ["@babel/plugin-transform-react-jsx", { pragma: "createElement" }]
              ]
            }
          }
        }
      ]
    }
};
```
新建`main.js`编写一个`createElement`空函数   
```javascript
//main.js
function createElement() {
  return;
}

let a = <div id="nams">
  <span>1</span>
  <span>2</span>
</div>;

```
新建`index.html`引入`/dist/index.js`使用`chrome`打开在`chrome`浏览器中`Sources-webpack://./main.js`编译结果：   
```javascript
function createElement() {
  return;
}

var a = createElement("div", {
  id: "nams"
}, createElement("span", null, "1"), createElement("span", null, "2"));

```
> `html`代码将使用`createElement`函数来创建.

`createElement`第一版本：   
* 函数接受三个参数 `type` DOM类型 `attributes` 属性对象 `children` 子节点类
* 创建DOM
* 设置属性
* 添加子节点
```javascript
/**
 * 
 * @param {String} type 节点类型
 * @param {Object} attributes 节点属性
 * @param  {...Object} children 子节点
 */
function createElement(type, attributes, ...children) {
  // 创建DOM
  let element = document.createElement(type);
  // 增加属性
  for (let name in attributes) {
    element.setAttribute(name, attributes[name]);
  }
  // 增加子节点
  for (let child of children) {
    // 文本类型字节点处理
    if (typeof child === 'string') {
      child = document.createTextNode(child);
    }
    element.appendChild(child);
  }
  return element;
}

let a = <div id="nams">
  <span>1</span>
</div>;

console.log(a)
document.body.appendChild(a); // 添加到body中
```
> 字节点问纯文本时候需要创建文本节点
第一版已经成功显示出dom节点信息了，接着问题出现了 `main.js`中`div`如果改成大写，则会出现问题，createElement的第一个参数type变成了对象，实际上是一个组件      
```javascript
// main.js
let a = <Div id="nams">
  <span>1</span>
</Div>;
// webpack main.js
var a = createElement(Div, {
  id: "nams"
}, createElement("span", null, "1"));
```
也就是说我们必须实现名字为`Div`的类，并且必须实现`setAttribute appendChild `等DOM对象存在的方法并且需要修改`createElement`创建DOM的逻辑：   
```javascript
function createElement(type, attributes, ...children) {
  let element = null;
  if (typeof type === 'string') {
    element = document.createElement(type);
  } else {
    // 实例化组件对象
    element = new type;
  }
  ....
}
// Div组件
class Div {
  constructor() {
    this.root = document.createElement("div");
  }
  setAttribute(name, value) {
    this.root.setAttribute(name, value);
  }
  appendChild(child) {
    this.root.appendChild(child);
  }
  mountTo(parent) {
    parent.appendChild(this.root);
  }
}
```
> 增加了一个mountTo方法用于挂载DOM
**这样我们使用大写`Div`也是可以成功创建DOM**
事实上我不仅需要给`Div`做封装，还需要给文本节点创建和普通节点创建做一层封装:   
```javascript
function createElement(type, attributes, ...children) {
  let element = null;
  if (typeof type === 'string') {
    // 使用ElementWrapper 来创建
    element = new ElementWrapper(type);
  } else {
    element = new type;
  }
  for (let name in attributes) {
    element.setAttribute(name, attributes[name]);
  }
  for (let child of children) {
    if (typeof child === 'string') {
      // 使用 TextWrapper来创建
      child = new TextWrapper(child);
    }
    element.appendChild(child);
  }
  return element;
}
// 文本组件
class TextWrapper {
  constructor(content) {
    this.root = document.createTextNode(content);
  }
  setAttribute(name, value) {
    this.root.setAttribute(name, value);
  }
  appendChild(child) {
    child.mountTo(this.root);
  }
  mountTo(parent) {
    parent.appendChild(this.root);
  }
}
// 普通组件包装 主要是DOM 类型组件封装
class ElementWrapper {
  constructor(type) {
    this.root = document.createElement(type);
  }
  setAttribute(name, value) {
    this.root.setAttribute(name, value);
  }
  appendChild(child) {
    child.mountTo(this.root);
  }
  mountTo(parent) {
    parent.appendChild(this.root);
  }
}
// Div组件 这里主要是是用户自定义组件
class Div {
  constructor() {
    this.root = document.createElement("div");
  }
  setAttribute(name, value) {
    this.root.setAttribute(name, value);
  }
  appendChild(child) {
    child.mountTo(this.root);
  }
  mountTo(parent) {
    parent.appendChild(this.root);
  }
}

let a = <Div id="nams">
  <span>1</span>
</Div>;

a.mountTo(document.body);

```
> 注意： `document.body.appendChild`需要改成 使用 组件的`mountTo`方法
**组件系统的封装：** 最后我们需要将`ElementWrapper TextWrapper`进行整合封装，目的是抽离出**重复代码**   
```javascript
// Component.js
/**
 * 
 * @param {String || Object} type 节点类型
 * @param {Object} attributes 节点属性
 * @param  {...Object} children 子节点
 */
export function createElement(type, attributes, ...children) {
  let element = null;
  if (typeof type === 'string') {
    element = new ElementWrapper(type);
  } else {
    element = new type;
  }
  for (let name in attributes) {
    element.setAttribute(name, attributes[name]);
  }
  for (let child of children) {
    if (typeof child === 'string') {
      child = new TextWrapper(child);
    }
    element.appendChild(child);
  }
  return element;
}

export class Component {
  // constructor() {
  //   this.root = this.render();
  // }
  setAttribute(name, value) {
    this.root.setAttribute(name, value);
  }
  appendChild(child) {
    child.mountTo(this.root);
  }
  mountTo(parent) {
    parent.appendChild(this.root);
  }
}

class TextWrapper extends Component{
  constructor(content) {
    this.root = document.createTextNode(content);
  }
}

class ElementWrapper extends Component {
  constructor(type) {
    this.root = document.createElement(type);
  }
}

```
### 轮播图组件开发一
* 组件提供`src` 属性传递图片数组
* 组件接受`src` 并且在`render`函数中绘制出来
```javascript
import { Component, createElement } from './Component.js';

class Swiper extends Component {
  constructor() {
    super();
    // 创建存放外部传递属性的attributes对象 
    this.attributes = Object.create(null);
  }
  setAttribute(name, value) {
    // 保存属性
    this.attributes[name] = value;
  }
  mountTo(parent) {
    parent.appendChild(this.render());
  }
  render() {
    this.root = document.createElement('div');
    // 遍历属性src 并且创建img追加到root中
    for (let record of this.attributes.src) {
      let imgEle = document.createElement('img');
      imgEle.src = record;
      this.root.appendChild(imgEle);
    }
    return this.root;
  }
}

let d = [
  'https://static001.geekbang.org/resource/image/bb/21/bb38fb7c1073eaee1755f81131f11d21.jpg',
  'https://static001.geekbang.org/resource/image/1b/21/1b809d9a2bdf3ecc481322d7c9223c21.jpg',
  'https://static001.geekbang.org/resource/image/b6/4f/b6d65b2f12646a9fd6b8cb2b020d754f.jpg',
  'https://static001.geekbang.org/resource/image/73/e4/730ea9c393def7975deceb48b3eb6fe4.jpg',
];

// 组件的使用
let s = <Swiper src={d}></Swiper>
s.mountTo(document.body);

```
> 使用Object.create(null)会创建一个干净没有原型的对象

### 轮播图组件开发二
接着继续开发轮播图布局和自动轮播效果   
```html
<style>
  .swiper {
    width: 500px;
    height: 280px;
    white-space: nowrap;
    overflow: hidden;
  }
  .swiper>.item{
    display: inline-block;
    width: 100%;
    height: 100%;
    background-size: contain;
    transition: ease .5s;
  }
</style>
```
> 使用inline-block 让 item显示成一行并且增加了过渡效果

**JS部分使用`setInterval`改变`translateX`实现轮播** `render`函数如下：   
```javascript
render() {
  this.root = document.createElement('div');
  this.root.classList.add('swiper');
  for (let record of this.attributes.src) {
    let imgEle = document.createElement('div');
    imgEle.classList.add('item');
    imgEle.style.backgroundImage = `url(${record})`;
    this.root.appendChild(imgEle);
  }

  let current = 0;
  setInterval(() => {
    let children = this.root.children;
    ++current;
    current %= children.length;
    for (let child of children) {
      child.style.transform = `translateX(-${current * 100}%)`;
    }
  }, 3000);

  return this.root;
}
```
> 小技巧：使用%运算符计算出current值

### 轮播图组件开发二 - 无缝切换
无缝切换实现思路：   
* 计算当前显示的图标下标`currentIndex`和下一张`nextIndex`图下标
* 处理下一张图`next`位置，接着下下一帧处理当前`current`图标位置
* 最后将下一张图坐标赋值给`current`

只需要改动`render`函数：   
```javascript
render() {
  this.root = document.createElement('div');
  this.root.classList.add('swiper');
  for (let record of this.attributes.src) {
    let imgEle = document.createElement('div');
    imgEle.classList.add('item');
    imgEle.style.backgroundImage = `url(${record})`;
    this.root.appendChild(imgEle);
  }

  // 当前图标位置
  let currentIndex = 0;
  setInterval(() => {
    let children = this.root.children;
    // 下一张图位置
    let nextIndex = (currentIndex + 1) % children.length;

    // 当前图
    let current = children[currentIndex];
    // 下一张图
    let next = children[nextIndex];

    next.style.transition = 'none';
    next.style.transform = `translateX(${100 - nextIndex * 100}%)`;

    setTimeout(() => {
      
      next.style.transition = '';
      current.style.transform = `translateX(${-100 - currentIndex * 100}%)`;
      next.style.transform = `translateX(${- nextIndex * 100}%)`;

      currentIndex = nextIndex;
    }, 16);

  }, 3000);

  return this.root;
}
```
### 轮播图组件开发三 - 鼠标拖动切换
1.事件监听：   
```javascript
// 鼠标拖动切换
this.root.addEventListener('mousedown', e => {
  console.log('down')

  let move = (e) => {
    console.log('move')
  }

  let up = (e) => {
    console.log('up');

    document.removeEventListener('mousemove', move);
    document.removeEventListener('mouseup', up);
  }

  document.addEventListener('mousemove', move);
  document.addEventListener('mouseup', up);
});
```
> 小细节： 监听document 而不是this.root 这样在脱离div甚至浏览器外也能触发到mouseup
2.鼠标拖拽实现代码：   
```javascript
render() {
  // ...
  // 鼠标拖动切换
  // 记录上一次拖动的位置
  let position = 0;
  this.root.addEventListener('mousedown', e => {
    let children = this.root.children;
    let startX = e.clientX; //开始位置

    let move = event => {
      // 移动图片
      let x = event.clientX - startX;
      
      for (let child of  children) {
        child.style.transition = 'none';
        // 原来的位置 -position * 500 加上 x
        child.style.transform = `translateX(${-position * 500 + x}px)`;
      }
    }

    let up = event => {
      let x = event.clientX - startX;
      // 当x >= 250 则Math.round(x / 500) = -1 则position 减-1相当于+1
      // 当x < 250 则Math.round(x / 500) = 0 则position 相当于不变

      position = position - Math.round(x / 500);
      
      // 如果超出一半则切换，否则恢复当前图片位置
      for (let child of children) {
        child.style.transition = '';
        child.style.transform = `translateX(${- position * 500}px)`;
      }

      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', up);
    }

    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up);
  });

  return this.root;
}
```
> 这里position 逻辑需要多次console.log 来查看实现原理

3.边界的处理：   
