# 手势系统的应用
本次学习目标：将手势系统和动画系统应用到轮播图组件中.完善组件的属性和事件的支持   

## 使用手势系统
首先将轮播组件的事件替换成手势系统的事件：   
* 使用`start pan end`替换`mousedown mousemove mouseup`

在`render`函数中绑定`Gesture(this.root)`：   
```javascript
import { TimeLine, Animation, ease } from '../lib/animations/index.js'; //引入动画系统
import { Gesture } from '../components/Gusture.js'; // 引入手势系统


this.root.addEventListener('start', event => {
  console.log('start');
  //...
});

this.root.addEventListener('pan', event => {
  let x = event.clientX - event.startX - ax;
  let current = position - ((x - x % 500) / 500);
  for (let offset of  [-1, 0, 1]) {
    let pos = current + offset;
    pos = (pos % children.length + children.length) % children.length;

    children[pos].style.transition = 'none';
    children[pos].style.transform = `translateX(${- pos * 500 + offset * 500 + x % 500}px)`;
  }
});

this.root.addEventListener('end', event => {


  let x = event.clientX - event.startX - ax;
  let current = position - ((x - x % 500) / 500);

  let direction = Math.round((x % 500) / 500);

  if (event.isFlick) {
    if (event.velocity < 0) {
      direction = Math.ceil((x % 500) / 500);
    } else {
      direction = Math.floor((x % 500) / 500);
    }
  }

  for (let offset of  [-1, 0, 1]) {
    let pos = current + offset;
    pos = (pos % children.length + children.length) % children.length;

    children[pos].style.transition = 'none';
    timeLine.add(new Animation(children[pos].style, 'transform',
      - pos * 500 + offset * 500 + x % 500, 
      - pos * 500 + offset * 500 + direction * 500, 
      500, 0, ease, v => `translateX(${v}px)`));
  }

});
```
**start 和 end**是在`Gusture`中新增的两个事件，`start`事件中可以做一些参数初始化操作.新增代码如下：   
```javascript
export class Recognize {
  start(point, context) {
    context.startX = point.clientX;
    context.startY = point.clientY;
    // 新增start
    this.dispatcher.dispatch('start', {
      clientX: point.clientX,
      clientY: point.clientY,
    });
    // ...
  }
  end(point, context) {

    // ...
    this.dispatcher.dispatch('end', {
      startX: context.startX,
      startY: context.startY,
      clientX: point.clientX,
      clientY: point.clientY,
      isVertical: context.isVertical,
      isFlick: context.isFlick,
      velocity: v,
    });
  }
}

```
## 引入动画系统
* 在`render`中创建`timeLine`并且`start`,将`setInterval`中的动画实现代码替换成`timeLine + Animation`的形式
* 当发生手势系统`start`函数触发，则需要暂停`timeLine`的播放
* 当手势系统结束`end`函数触发，则需要重启`timeLine`的播放
* `timeLine`的重新启动需要计算出上一次移动距离`ax`以及`position`的计算
  
**时间线**   
```javascript
// 鼠标拖动切换
let position = 0; //当前位置
let children = this.root.children; //子节点
let t = 0; //时间
let ax = 0; //移动距离
let handler = null; // 定时器
// 创建时间线
let timeLine = new TimeLine();
timeLine.start();
```
**手势开始停止timeLine和定时器并且计算出ax值**   
```javascript
this.root.addEventListener('start', event => {
  timeLine.pause();
  clearInterval(handler);
  let progress = (Date.now() - t) / 500;
  ax = ease(progress) * 500 - 500;
});
```
**定时器中动画使用Animation**   
```javascript
let nextPicture = () => {
  let nextPosition = (position + 1) % children.length;

  let current = children[position];
  let next = children[nextPosition];

  t = Date.now();

  timeLine.add(new Animation(current.style, 'transform',
      - position * 500, -500 - position * 500, 500, 0, ease, v => `translateX(${v}px)`));
  timeLine.add(new Animation(next.style, 'transform',
      500 - nextPosition * 500, - nextPosition * 500, 500, 0, ease, v => `translateX(${v}px)`));

  position = nextPosition;

}

handler = setInterval(nextPicture, 3000);
```
**手势结束触发`end`重启定时器和时间线**
```javascript
 this.root.addEventListener('end', event => {
  
  // 重启时间线
  timeLine.reset();
  timeLine.start();
  handler = setInterval(nextPicture, 3000);

  let x = event.clientX - event.startX - ax;
  let current = position - ((x - x % 500) / 500);

  let direction = Math.round((x % 500) / 500);

  // 快速滑动触发
  if (event.isFlick) {
    if (event.velocity < 0) {
      direction = Math.ceil((x % 500) / 500);
    } else {
      direction = Math.floor((x % 500) / 500);
    }
  }

  for (let offset of  [-1, 0, 1]) {
    let pos = current + offset;
    pos = (pos % children.length + children.length) % children.length;

    children[pos].style.transition = 'none';
    timeLine.add(new Animation(children[pos].style, 'transform',
      - pos * 500 + offset * 500 + x % 500, 
      - pos * 500 + offset * 500 + direction * 500, 
      500, 0, ease, v => `translateX(${v}px)`));
  }

  // 重新计算position
  position = position - ((x - x % 500) / 500) - direction;
  position = (position % children.length + children.length) % children.length;

});
```
> direction 和 position 的计算还是 比较蒙蔽状态-_- 

## 给组件添加一些属性
组件增加属性支持需要对`Component`进行调整，增加`attributes state`字段，也就是我们常见的属性和状态，这样轮播组件即可直接添加属性到`state`中：   

```javascript
//Components.js
export const STATE = Symbol("state");
export const ATTRIBUTE = Symbol("attribute");
export class Component {
  constructor() {
    // 创建attribute 和 state
    this[ATTRIBUTE] = Object.create(null);
    this[STATE] = Object.create(null);
  }
  setAttribute(name, value) {
    this[ATTRIBUTE][name] = value;
  }
  appendChild(child) {
    child.mountTo(this.root);
  }
  mountTo(parent) { 
    // 当没有root需要render一次render是字组件需要编写的代码
    if (!this.root) {
      this.render();
    }
    parent.appendChild(this.root);
  }
}
```
> 这里使用Symbol 来导出，也是私有化的一个作用      

**Swiper组件使用state attribute**   
```javascript
import { Component, STATE, ATTRIBUTE } from '../Component.js';
// 将position 存放到state上 所有使用到position的地方都需要调整
this[STATE].position = 0;

```
## 给组件添加事件功能
完成属性添加后，接着给组件增加事件，我们需要实现轮播组件可以绑定`onClick onChange`两个事件，同样是在`Component`组件下做调整： 
在Component中增加一个`triggerEvent`方法来触发事件**使用原生`CustomEvent`**,正则将事件名首字母转大写:   
```javascript
triggerEvent(type, args) {
  this[ATTRIBUTE]["on" + type.replace(/^[\s\S]/, s => s.toUpperCase())](new CustomEvent(type, {
    detail: args
  }));
}
```
`Swiper`直接调用`this.triggerEvent()`即可,事件实现实际上是将事件名称按照`onXXX`规则最为属性添加到`attribute`对象下.   
**给组件增加onClick onChange**事件，关键代码如下:
```javascript
this.root.addEventListener('tap', () => {
  this.triggerEvent('click', {
    data: this[ATTRIBUTE].src[this[STATE].position],
    position: this[STATE].position
  });
});

let nextPicture = () => {
  // ...
  this.triggerEvent('change', {
    position: this[STATE].position
  });
}

//main.js
let s = <Swiper src={d} onClick={e => console.log(e.detail)} onChange={e => {console.log(e.detail)}}></Swiper>
```
## 给组件增加Children机制
Children有两种类型的，一种是内容型,和模板型 
* 内容型：例如`<Button>按钮</Button>`
* 模板型：例如列表组件的每一项共用一个模板Item: `<List> <Item></Item> </List>`

实现一个内容型组件Button:   
```javascript
//Button.js
import { Component, STATE, ATTRIBUTE, createElement } from '../Component.js';

export { STATE, ATTRIBUTE } from '../Component.js';

export class Button extends Component {
  constructor() {
    super();
  }
  render() {
    this.childContainer = <span />;
    this.root = (<div>{this.childContainer}</div>).render();
    return this.root;
  }
  appendChild (child) {
    if (!this.childContainer) {
      this.render();
    }
    this.childContainer.appendChild(child);
  }
}

//Component.js
export class Component {
  constructor() {
    this[ATTRIBUTE] = Object.create(null);
    this[STATE] = Object.create(null);
  }
  setAttribute(name, value) {
    this[ATTRIBUTE][name] = value;
  }
  render() {
    return this.root;
  }
  appendChild(child) {
    child.mountTo(this.root);
  }
  mountTo(parent) { 
    if (!this.root) {
      this.render();
    }
    parent.appendChild(this.root);
  }
  triggerEvent(type, args) {
    this[ATTRIBUTE]["on" + type.replace(/^[\s\S]/, s => s.toUpperCase())](new CustomEvent(type, {
      detail: args
    }));
  }
}
```
> 在render函数将children放到root中即可实现child机制

实现一个模板型组件List:   
```javascript
//List.js
import { Component, STATE, ATTRIBUTE, createElement } from '../Component.js';

export { STATE, ATTRIBUTE } from '../Component.js';

export class List extends Component {
  constructor() {
    super();
  }
  render() {
    // 迭代data生成子节点children
    this.children = this[ATTRIBUTE].data.map(this.template);
    // 将children放入到root中
    this.root = (<div>{this.children}</div>).render();
    return this.root;
  }
  appendChild (child) {
    // 保存用户编写的模板内容，也就是{}中的内容，为一个函数
    this.template = child;
    this.render();
  }
}

//main.js
let s = <List data={d}>
  {
    (record) => 
      <div>
        <img src={record.src}></img>
        <span>{record.title}</span>
      </div>
  }
</List>
```
在`appendChild`中将模板List`{}`中的内容(一般为一个函数)保存起来,`render`函数获取到属性`data`迭代并生成`children`放入到`this.root`中作为子节点   
**Component**中需要做一些调整，增加child类型对数组的支持:   
```javascript
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

  let processChild = (children) => {
    for (let child of children) {
      if ((typeof child === 'object') && (child instanceof Array)) {
        // 如果是数组则继续递归创建
        processChild(child);
        continue;
      }
      if (typeof child === 'string') {
        child = new TextWrapper(child);
      }
      element.appendChild(child);
    }
  }

  processChild(children);
  
  return element;
}

class ElementWrapper extends Component {
  constructor(type) {
    super();
    this.root = document.createElement(type);
  }
  // 重载setAttribute方法
  setAttribute(name, value) {
    this.root.setAttribute(name, value);
  }
}
```
**Swiper组件改造成模板型组件**关键代码：   
```javascript
// Swiper.js
  appendChild (child) {
    this.template = child;
    this.render();
  }
  render() {
    this.children = this[ATTRIBUTE].list.map(this.template);
    this.root = (<div class="swiper">{this.children}</div>).render();

    // ...
  }

 // main.js
 let s = <Swiper list={d} onClick={e => console.log(e.detail)} onChange={e => console.log(e.detail)}>
  {
    (record) => 
      <div class="item">
        <img src={record.src}></img>
      </div>
  }
</Swiper>
```
样式做一些调整：   
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
    /* transition: ease .6s; */
  }
  .swiper>.item>img{
    width: 100%;
    height: 100%;
  }
</style>
```
## 总结
本周重点是学习将复杂的逻辑拆分成多个功能来实现，并且能组装起来。