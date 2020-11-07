# 组件化-动画系统
动画系统的核心是每一帧(16ms)执行一个动作，在JavaScript中实现帧的概念有三种方式:   
* setTimeout()
* setInterval()
* requestAnimationFrame()

`requestAnimationFrame`是目前最好的方式，因为它是由系统决定动画回调函数执行的时机，而`setTimeout、setInterval`是被放入到异步队列中，它执行时机会受到主线程的影响，主线程执行完成后才会取执行异步队列，如果主线程执行执行时间超过一帧则会出现掉帧卡顿效果。   

## 动画系统-时间线
时间线属于动画系统一部分，时间线的概念是为了控制动画执行的过程和状态，定义`TimeLine`时间线类，提供以下方法：   
* start() // 开始动画
* pause() // 暂停
* resume() //继续
* reset() //重置
  
在`animations`文件夹下新建`animation.js`编写`TimeLine`基本结构:   
```javascript
const TICK = Symbol("tick");
const TICK_HANDLER = Symbol('tick-handler');

export class TimeLine {
  constructor() {
    this[TICK] = () => {
      console.log('tick')
      requestAnimationFrame(this[TICK]);
    }
  }

  start() {
    this[TICK]();
  }
  pause() {

  }
  resume() {

  }
  reset() {

  }
}
```
> 使用`Symbol`的好处是避免外界访问内部方法，相当于实现私有化一种小技巧

## 动画系统-动画类实现
* `Animation`类 提供一个构造函数传入必要参数: 对象,属性,开始值,结束值,动画时间,动画函数
* `TimeLine`做一些调整，增加一个添加动画方法`add`,TICK中调用添加的动画数组
  
```javascript
const TICK = Symbol("tick");
const TICK_HANDLER = Symbol('tick-handler');
const ANIMATION = Symbol('animation');
const START_TIME = Symbol('start-time');

export class Animation {
  // 基本动画参数
  constructor(object, property, startValue, endValue, duration, timingFunction) {
    this.object = object,
    this.property = property;
    this.startValue = startValue;
    this.endValue = endValue;
    this.duration = duration;
    this.timingFunction = timingFunction;
  }
  receive(time) {
    // 计算属性差值
    let range = (this.endValue - this.startValue);
    // 设置属性每一帧的值
    this.object[this.property] = this.startValue + range * time / this.duration
  }
}
export class TimeLine {
  constructor() {
    this[ANIMATION] = new Set();
    this[START_TIME] = new Map();
  }

  start() {
    let startTime = Date.now();
    this[TICK] = () => {
      let now = Date.now();
      // 在每一帧中执行动画函数
      for (const animation of this[ANIMATION]) {
        // 计算时间差
        let t;
        // 当添加动画的时间 小于 开始时间
        if (this[START_TIME].get(animation) < startTime) {
          t = now - startTime;
        } else {
          // 添加动画时间大于 开始时间
          t = now - this[START_TIME].get(animation);
        }
        
        if (animation.duration < t) {
          // 时间到移除动画
          this[ANIMATION].delete(animation);
          t = animation.duration;
        }
        animation.receive(t);
      }
      this[TICK_HANDLER] = requestAnimationFrame(this[TICK]);
    }
    this[TICK]();
  }
  pause() {
    // 暂停动画
    cancelAnimationFrame(this[TICK_HANDLER]);
  }
  resume() {}
  reset() {}
  add(animation, startTime = Date.now()) {
    // 添加动画
    this[ANIMATION].add(animation);
    // 记录添加动画的时候
    this[START_TIME].set(animation, startTime);
  }
}
```
> 难点：animation.receive方法，需要传入一个毫秒时间差来计算动画属性的值   
> t 的计算比较难理解 

## 动画系统-暂停和继续
* 暂停使用`cancelAnimationFrame`可以取消一个`requestAnimationFrame`
* 继续需要记录暂停动画的时间并且计算出暂停了多少时间，再次启动动画时候减去改时间差

**暂停:**   
```javascript
const TICK_HANDLER = Symbol('tick-handler');
// 暂停的核心代码
start() {
    //...
    this[TICK_HANDLER] = requestAnimationFrame(this[TICK]);
    // ...
  }
}
// 暂停
pause() {
  cancelAnimationFrame(this[TICK_HANDLER]);
}
```
> 保存好`requestAnimationFrame`在暂停时候调用`cancelAnimationFrame`取消动画

**继续:**   
```javascript
start() {
  // 每次执行动画前需要重置暂停时间
  this[PAUSE_TIME] = 0;
  this[TICK] = () => {
    let now = Date.now();
    // 在每一帧中执行动画函数
    for (const animation of this[ANIMATION]) {
      // ...
      if (this[START_TIME].get(animation) < startTime) {
        // 减去暂停时间
        t = now - startTime - this[PAUSE_TIME];
      } else {
        // 减去暂停时间
        t = now - this[START_TIME].get(animation) - this[PAUSE_TIME];
      }
      // ...
    }
  }
}
pause() {
  // 记录开始暂停的时间
  this[PAUSE_START] = Date.now();
  // ...
}
resume() {
  // 计算出暂停了多久
  this[PAUSE_TIME] += Date.now() - this[PAUSE_START];
  this[TICK]();
}
```
**完整DEMO**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <style>
    *{
      margin: 0;
      padding: 0;
    }
    #box{
      width: 150px;
      height: 150px;
      background: hotpink;
    }
  </style>
</head>
<body>
  <div id="box"></div>
  <div>
    <button id="start">start</button>
    <button id="pause">pause</button>
    <button id="resume">resume</button>
  </div>
  <script type="module" src="./main.js"></script>
</body>
</html>
```
```javascript
import { TimeLine, Animation } from '../animations/animation.js';

let tt = new TimeLine();

tt.add(new Animation(document.querySelector('#box').style, 'transform', 0, 1000, 5000, 0, null, v => `translateX(${v}px)`));

document.querySelector('#start').addEventListener('click', () => tt.start());
document.querySelector('#pause').addEventListener('click', () => tt.pause());
document.querySelector('#resume').addEventListener('click', () => tt.resume());
```
运行效果：   
![运行效果](https://blog-images-file.oss-cn-beijing.aliyuncs.com/week/14/1.gif)

## 动画系统-增加三次贝塞尔动画函数
目前动画只有匀速效果，接下来就是增加一些常用的动画函数`ease ease-in ease-out ease-in-out`:   
* 动画函数需要实现 三次贝塞尔函数 直接copy
* animation 完善 reset 功能

**三次贝塞尔函数 COPY**
```javascript
// 贝塞尔函数
export function cubicBezier(p1x, p1y, p2x, p2y) {
  const ZERO_LIMIT = 1e-6;

  const ax = 3 * p1x - 3 * p2x + 1;
  const bx = 3 * p2x - 6 * p1x;
  const cx = 3 * p1x;

  const ay = 3 * p1y - 3 * p2y + 1;
  const by = 3 * p2y - 6 * p1y;
  const cy = 3 * p1y;

  function sampleCurveDerivativeX(t) {
    return (3 * ax * t + 2 * bx) * t + cx;
  }

  function sampleCurveX(t) {
    return ((ax * t + bx) * t + cx) * t;
  }

  function sampleCurveY(t) {
    return ((ay * t + by) * t + cy) * t;
  }

  function solveCurveX(x) {
    let t2 = x;
    let derivative;
    let x2;

    for (let i = 0; i < 8; i++) {
      x2 = sampleCurveX(t2) - x;
      if (Math.abs(x2) < ZERO_LIMIT) {
        return t2;
      }
      derivative = sampleCurveDerivativeX(t2);
      if (Math.abs(derivative) < ZERO_LIMIT) {
        break;
      }
      t2 -= x2 / derivative;
    }

    let t1 = 1;
    let t0 = 0;

    t2 = x;
    while (t1 > t0) {
      x2 = sampleCurveX(t2) - x;
      if (Math.abs(x2) < ZERO_LIMIT) {
        return t2;
      }
      if (x2 > 0) {
        t1 = t2;
      } else {
        t0 = t2;
      }
      t2 = (t1 + t0) / 2;
    }

    return t2;
  }

  function solve(x) {
    return sampleCurveY(solveCurveX(x));
  }

  return solve;

}
export let linear = v => v;
export let ease = cubicBezier(.25,.1,.25,1);
export let easeIn = cubicBezier(.42,0,1,1);
export let easeOut = cubicBezier(0,0,.58,1);
export let easeInOut = cubicBezier(.42,0,.58,1);
```
JS动画和原生css运行效果：   
![运行效果](https://blog-images-file.oss-cn-beijing.aliyuncs.com/week/14/2.gif)
**动画重置**   
* 暂停动画并且将相关值(PAUSE_TIME, ANIMATION, START_TIME, TICK_HANDLER)设置成默认值,将`tick`设置为`null`
```javascript
reset() {
  this.pause();
  this[PAUSE_TIME] = 0;
  this[ANIMATION] = new Set();
  this[START_TIME] = new Map();
  this[TICK_HANDLER] = null;
}
receive(time) {
  let range = (this.endValue - this.startValue);
  // 
  let progress = this.timingFunction(time / this.duration);
  this.object[this.property] = this.template(this.startValue + range * progress);
}
```
**receive中使用动画函数**   
* 使用传入的`timingFunction`计算出`progress`;
```javascript
receive(time) {
  let range = (this.endValue - this.startValue);
  // ease ease-in ...
  let progress = this.timingFunction(time / this.duration);
  this.object[this.property] = this.template(this.startValue + range * progress);
}
```

## 动画系统-增加动画状态
我们发现在一开始调用`resume`或者`reset`动画会发生异常现象，我们需要做一层处理，只有动画开始的时候才能调用暂停，暂停状态才能调用继续：   
* 增加三个状态：   
```javascript
const STATE_INIT = 'inited';
const STATE_START = 'started';
const STATE_PAUSE = 'paused';
```
* 在动画开始、暂停、继续、重置中做状态处理:   
```javascript
start() {
  if (this.state !== STATE_INIT) {
    return;
  }
  this.state = STATE_START;
}
pause() {
  if (this.state !== STATE_START) {
    return;
  }
  this.state = STATE_PAUSE;
}
resume() {
  if (this.state !== STATE_PAUSE) {
    return;
  }
  this.state = STATE_START;
}
reset() {
  this.pause();
  this.state = STATE_START;
}
```
**完整代码animation.js**   
```javascript
const TICK = Symbol("tick");
const TICK_HANDLER = Symbol('tick-handler');
const ANIMATION = Symbol('animation');
const START_TIME = Symbol('start-time');
const PAUSE_START = Symbol('pause-start');
const PAUSE_TIME = Symbol('pause-time');

const STATE_INIT = 'inited';
const STATE_START = 'started';
const STATE_PAUSE = 'paused';

export class TimeLine {
  constructor() {
    this.state = STATE_INIT;
    this[ANIMATION] = new Set();
    this[START_TIME] = new Map();
  }

  start() {
    if (this.state !== STATE_INIT) {
      return;
    }
    this.state = STATE_START;
    let startTime = Date.now();
    this[PAUSE_TIME] = 0;
    this[TICK] = () => {
      let now = Date.now();
      // 在每一帧中执行动画函数
      for (const animation of this[ANIMATION]) {
        let t;

        if (this[START_TIME].get(animation) < startTime) {
          t = now - startTime - this[PAUSE_TIME] - animation.delay;
        } else {
          t = now - this[START_TIME].get(animation) - this[PAUSE_TIME] - animation.delay;
        }
        
        if (animation.duration < t) {
          // 时间到移除动画
          this[ANIMATION].delete(animation);
          t = animation.duration;
        }

        if (t > 0) {
          animation.receive(t);
        }
      }
      this[TICK_HANDLER] = requestAnimationFrame(this[TICK]);
    }
    this[TICK]();
  }
  pause() {
    if (this.state !== STATE_START) {
      return;
    }
    this.state = STATE_PAUSE;
    // 记录暂停开始的时间
    this[PAUSE_START] = Date.now();
    cancelAnimationFrame(this[TICK_HANDLER]);
  }
  resume() {
    if (this.state !== STATE_PAUSE) {
      return;
    }
    this.state = STATE_START;
    this[PAUSE_TIME] += Date.now() - this[PAUSE_START];
    this[TICK]();
  }
  reset() {
    this.pause();
    this.state = STATE_START;
    this[PAUSE_TIME] = 0;
    this[ANIMATION] = new Set();
    this[START_TIME] = new Map();
    this[TICK_HANDLER] = null;
  }
  add(animation, startTime = Date.now()) {
    this[ANIMATION].add(animation);
    this[START_TIME].set(animation, startTime);
  }
}

export class Animation {
  constructor(object, property, startValue, endValue, duration, delay, timingFunction, template) {
    timingFunction = timingFunction || (v => v);
    template = template || (v => v);
    this.object = object,
    this.property = property;
    this.startValue = startValue;
    this.endValue = endValue;
    this.duration = duration;
    this.timingFunction = timingFunction;
    this.delay = delay;
    this.template = template;
  }
  receive(time) {
    let range = (this.endValue - this.startValue);
    let progress = this.timingFunction(time / this.duration);
    this.object[this.property] = this.template(this.startValue + range * progress);
  }
}
```
## 总结
动画实现主要是基于`requestAnimationFrame`实现，最难理解部分是时间线(TimeLine)概念和`Animation.receive`中时间差计算，暂停和恢复动画思路,`Symbol`中使用场景值得学习。