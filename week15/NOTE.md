# 手势系统
手势事件在PC和手机端是两种不同的事件，PC通常是`mousedown mousemove mouseup`来处理，手机端则是`touchstart touchmove touchend touchcancel`,本次我们学习将PC和手机端手势事件进行抽象封装成统一的更精细的事件。   

## 手势系统的基本知识
首先设计一套自己的手势系统流程，整个系统事件触发流程如下：   
正常流程：   
* 1.当用户按下后触发start事件
* 2.触发start后发生10px(根据实际情况调整)移动则触发panstart(手势移动开始)
* 3.用户在移动过程会持续触发pan(手势移动)事件
* 4.用户结束移动后触发panend(手势移动结束)事件
* 5.在移动结束后并且移动速度过快则会触发flick(快速滑动或者轻扫)事件

非正常流程触发事件顺序,   
* 如果用户在步骤1未发生移动就结束手势，则不会进入步骤2,
* 则会直接触发tap(点击)事件，
* 如果步骤1按下时间超过0.5s未结束手势并且未触发步骤2则会触发长按(pressstart)事件，
* 结束后触发pressend(长按结束)事件，
* 长按过程中出现了移动就走步骤2。   
看文字描述比较绕，我们直接看下面流程图就明白了，下图：   
![手势流程图](https://blog-images-file.oss-cn-beijing.aliyuncs.com/week/15/1.png)   
> 图片来自课程视频截图.   

## 鼠标和手势操作事件绑定
有了上面流程我们接着就是代码部分，首先我们完成PC端鼠标操作的.   
新建文件`gustrue.js`,PC端手势主要是`mousedown mousemove mouseup`，以下是代码实现部分：   
```javascript
let element = document.documentElement;

element.addEventListener('mousedown', event => {

  let mousemove = event => {
    console.log(event.clientX, event.clientY);
  }
  let mouseup = event => {
    element.removeEventListener('mousemove', mousemove);
    element.removeEventListener('mouseup', mouseup);
  }


  element.addEventListener('mousemove', mousemove);
  element.addEventListener('mouseup', mouseup);

});
```
加入手机端代码实现：   
```javascript
let element = document.documentElement;

element.addEventListener('mousedown', event => {
  start(event);
  let mousemove = event => {
    move(event);
  }
  let mouseup = event => {
    end(event);
    element.removeEventListener('mousemove', mousemove);
    element.removeEventListener('mouseup', mouseup);
  }

  element.addEventListener('mousemove', mousemove);
  element.addEventListener('mouseup', mouseup);

});

element.addEventListener('touchstart', event => {
  for (let touch of event.changedTouches) {
    start(touch);
  }
});

element.addEventListener('touchmove', event => {
  for (let touch of event.changedTouches) {
    move(touch);
  }
});

element.addEventListener('touchend', event => {
  for (let touch of event.changedTouches) {
    end(touch);
  }
});

element.addEventListener('touchcancel', event => {
  for (let touch of event.changedTouches) {
    cancel(touch);
  }
});

let start = event => {
  console.log('start', event.clientX, event.clientY)
}
let move = event => {
  console.log('move', event.clientX, event.clientY)
}
let end = event => {
  console.log('end', event.clientX, event.clientY)
}
let cancel = event => {
  console.log('cancel', event.clientX, event.clientY)
}
```
> 手机端 有touchcancel事件，表示在移动中被打断，例如系统弹窗，电话，等系统事件发生则会打断touchmove事件并且触发touchcancel   
> 手机端 通常支持多点触控，所有需要遍历changedTouches   
现在我们已经将PC和手机端抽象出统一事件`start move end cancel`.   

## 手势操作的逻辑处理
手势操作的逻辑是实现`tap press pressend panstart pan panend`触发时机：   
开始之前我们定义一些**全局常量和变量**:   
```javascript
const PRESS_TIME = 500; //长按事件触发时长
const PAN_START_DISTANCE = 10; //移动多少10px触发panstart
let handler = null; // 长按事件定时器
let startX, startY; // 记录移动信息
let isTap = false, // 是否是tap事件
    isPan = false, // 是否pan事件
    isPress = false; //是否是press长按事件
```
### tap和press事件触发
在`start`函数最开始触发tap：   
```javascript
let start = point => {
  startX = point.clientX;
  startY = point.clientY;

  // 触发tap事件
  isTap = true;
  isPan = false;
  isPress = false;
  console.log('tap');

  handler = setTimeout(() => {
    isTap = false;
    isPan = false;
    isPress = true; // 0.5s触发长按press事件
    console.log('press');
  }, PRESS_TIME);

}
```
### panstart和pan事件触发
在`move`函数中触发：  
* `panstart`只会触发一次，而`pan`是一直触发所以我们需要做双重判断，`isPan` 和 移动`10px`才触发`panstart`
* 触发`pan`之后才会继续`panstart`
```javascript
let move = point => {
  // 记录移动信息
  let mx = point.clientX - startX;
  let my = point.clientY - startY;

  // 当不在pan事件，并且移动距离大于10px 则触发pan事件
  if (!isPan && mx ** 2 + my ** 2 > PAN_START_DISTANCE ** 2) {
    isTap = false;
    isPress = false;
    isPan = true;
    console.log('panstart');
    // 清除press定时器
    clearTimeout(handler);
  }

  if (isPan) {
    console.log('pan', mx, my);
  }

}
```
### pressend和panend触发
在`end`中通过判断`isTap isPan isPress`状态来触发不同事件:   
```javascript
let end = point => {
  if (isTap) {
    //console.log('tap');
    clearTimeout(handler);
  }
  if (isPress) {
    console.log('pressend');
  }
  if (isPan) {
    console.log('panend')
  }
}
```
### 完整代码
```javascript
let element = document.documentElement;

element.addEventListener('mousedown', event => {
  start(event);
  let mousemove = event => {
    move(event);
  }
  let mouseup = event => {
    end(event);
    element.removeEventListener('mousemove', mousemove);
    element.removeEventListener('mouseup', mouseup);
  }

  element.addEventListener('mousemove', mousemove);
  element.addEventListener('mouseup', mouseup);

});

element.addEventListener('touchstart', event => {
  for (let touch of event.changedTouches) {
    start(touch);
  }
});

element.addEventListener('touchmove', event => {
  for (let touch of event.changedTouches) {
    move(touch);
  }
});

element.addEventListener('touchend', event => {
  // 关闭默认事件
  event.preventDefault();
  for (let touch of event.changedTouches) {
    end(touch);
  }
});

element.addEventListener('touchcancel', event => {
  for (let touch of event.changedTouches) {
    cancel(touch);
  }
});

const PRESS_TIME = 500; //长按事件触发时长
const PAN_START_DISTANCE = 10; //移动多少10px触发panstart
let handler = null;
let startX, startY;
let isTap = false, // 是否是tap事件
    isPan = false, // 是否pan事件
    isPress = false; //是否是press长按事件

let start = point => {
  startX = point.clientX;
  startY = point.clientY;

  // 触发tap事件
  isTap = true;
  isPan = false;
  isPress = false;
  console.log('tap');

  handler = setTimeout(() => {
    isTap = false;
    isPan = false;
    isPress = true; // 0.5s触发长按press事件
    console.log('press');
  }, PRESS_TIME);

}
let move = point => {
  // 记录移动信息
  let mx = point.clientX - startX;
  let my = point.clientY - startY;

  // 当不在pan事件，并且移动距离大于10px 则触发pan事件
  if (!isPan && mx ** 2 + my ** 2 > PAN_START_DISTANCE ** 2) {
    isTap = false;
    isPress = false;
    isPan = true;
    console.log('panstart');
    // 清除press定时器
    clearTimeout(handler);
  }

  if (isPan) {
    console.log('pan', mx, my);
  }

}
let end = point => {
  if (isTap) {
    //console.log('tap');
    clearTimeout(handler);
  }
  if (isPress) {
    console.log('pressend');
  }
  if (isPan) {
    console.log('panend')
  }
}
let cancel = point => {
  // 发生打断touch事件需要清除定时器
  clearTimeout(handler);
  console.log('cancel', point.clientX, point.clientY);
}
```
> 注意handler清除的时机，在panstart、end、cancel中需要清除

## 鼠标操作的逻辑处理
在移动端手势存在多个触控，PC端同样也会有左键右键等按键触发，所以我们使用全局变量来存储状态是有问题的，应该是每个触摸点或鼠标点击都应该有独立的状态.需要单独储存.   
### 移动端多个触点处理
增加一个全局`contexts`Map数据结构来存储touch点，每个touch使用独立的`context`储存状态，`start move end cancel`增加一个参数`context`共享状态,调整后代码如下：   
```javascript
let start = (point, context) => {
  context.startX = point.clientX;
  context.startY = point.clientY;

  // 触发tap事件
  context.isTap = true;
  context.isPan = false;
  context.isPress = false;
  console.log('tap');

  context.handler = setTimeout(() => {
    context.isTap = false;
    context.isPan = false;
    context.isPress = true; // 0.5s触发长按press事件
    console.log('press');
  }, PRESS_TIME);

}
let move = (point, context) => {
  // 记录移动信息
  let mx = point.clientX - context.startX;
  let my = point.clientY - context.startY;

  // 当不在pan事件，并且移动距离大于10px 则触发pan事件
  if (!context.isPan && mx ** 2 + my ** 2 > PAN_START_DISTANCE ** 2) {
    context.isTap = false;
    context.isPress = false;
    context.isPan = true;
    console.log('panstart');
    // 清除press定时器
    clearTimeout(context.handler);
  }

  if (context.isPan) {
    console.log('pan', mx, my);
  }

}
let end = (point, context) => {
  if (context.isTap) {
    //console.log('tap');
    clearTimeout(context.handler);
  }
  if (context.isPress) {
    console.log('pressend');
  }
  if (context.isPan) {
    console.log('panend')
  }
}
let cancel = (point, context) => {
  // 发生打断touch事件需要清除定时器
  clearTimeout(context.handler);
  console.log('cancel', point.clientX, point.clientY);
}
```
在`touchstart`中创建context,`touchmove`取出对应的context,`touchend touchcancel`中移除对应的context,调整后代码如下：   
```javascript
let contexts = new Map();

element.addEventListener('touchstart', event => {
  for (let touch of event.changedTouches) {
    // 增加context
    let context = Object.create(null);
    contexts.set(touch.identifier, context);
    start(touch, context);
  }
});

element.addEventListener('touchmove', event => {
  for (let touch of event.changedTouches) {
    // 取出context
    let context = contexts.get(touch.identifier);
    move(touch, context);
  }
});

element.addEventListener('touchend', event => {
  // 关闭默认事件
  event.preventDefault();
  for (let touch of event.changedTouches) {
    let context = contexts.get(touch.identifier);
    end(touch, context);
    // 移除context
    contexts.delete(touch.identifier);
  }
});

element.addEventListener('touchcancel', event => {
  for (let touch of event.changedTouches) {
    let context = contexts.get(touch.identifier);
    cancel(touch, context);
    // 移除context
    contexts.delete(touch.identifier);
  }
});
```
### 为什么使用touch.identifier作为Map的key？
MDN: touch.identifier返回一个可以唯一地识别和触摸平面接触的点的值. 这个值在这根手指（或触摸笔等）所引发的所有事件中保持一致, 直到它离开触摸平面.   

### PC端多个触点处理
PC端多个触点，只要表现为鼠标左键，右键，中间，甚至更多键(部分鼠标会有),我们需要支持多个键同时按下。   
调整后代码如下：   
```javascript
let isListeningMouse = false; //是否绑定过了mouse相关事件

element.addEventListener('mousedown', event => {
  
  let context = Object.create(null);
  // 使用位移 1 << event.button
  contexts.set("mouse" + (1 << event.button), context);

  start(event, context);

  let mousemove = event => {
    let button = 1;
    // event.buttons 事件触发时哪些鼠标按键被按下 buttons 的值为各键对应值做与计算（+）后的值 => 多个之和
    // event.button 表示当前按下的键的值 =>单个
    while (button <= event.buttons) {
      if (button & event.buttons) {
        // key 顺序是反的，需要重新计算key
        let key;
        if (button === 2) {
          key = 4;
        } else if (button === 4) {
          key =  2;
        } else {
          key = button;
        }
        let context = contexts.get("mouse" + key);
        move(event, context);
      }
      button = button << 1;
    }
  }
  let mouseup = event => {
    let context = contexts.get("mouse" + (1 << event.button));
    end(event, context);
    contexts.delete("mouse" + (1 << event.button));

    // buttons为 0才移除 无按下
    if (event.buttons === 0) {
      element.removeEventListener('mousemove', mousemove);
      element.removeEventListener('mouseup', mouseup);
      isListeningMouse = false;
    }
    
  }

  if (!isListeningMouse) {
    element.addEventListener('mousemove', mousemove);
    element.addEventListener('mouseup', mouseup);
    isListeningMouse = true;
  }

});
```
### 分析
**MDN:** buttons 的值为各键对应值做与计算（+）后的值。例如，如果右键（2）和滚轮键（4）被同时按下buttons 的值为 2 + 4 = 6。   
**event.buttons**值列表：   
![值](https://blog-images-file.oss-cn-beijing.aliyuncs.com/week/15/2.png)   
**event.button**值列表：   
![值](https://blog-images-file.oss-cn-beijing.aliyuncs.com/week/15/4.png)   
使用位运算符正好可以`buttons = 1 << button`匹配到对应的值：   
* 按下左键button=0 对应 buttons=1(左键)
* 按下中键button=1 对应 buttons=2(右键)
* 按下右键button=2 对应 buttons=4(中键)
* 按下第4键button=3 对应buttons=8(第4键)
* 按下第5键button=4 对应buttons=16(第5键)   
这里有个问题，中键和右键顺序是不对的，需要交换，所有就做了如下处理:   
```javascript
let key;
if (button === 2) {
  key = 4;
} else if (button === 4) {
  key =  2;
} else {
  key = button;
}
```
**mouse事件触发多次**：   
为了确保`mouse`事件只绑定一次，增加了`isListeningMouse`来控制，首次绑定事件后在`buttons`为0(没有按键按下)时才做移除事件处理.   

## 事件派发
上面部分已经完成事件的抽象和可控，接下来我们需要将事件进行派发出去，事件派发使用到原生`Event`对象和DOM的`dispatchEvent`来实现,如下代码.   
```javascript
function dispatch(type, properties) {
  let event = new Event(type);
  for (let name in properties) {
    event[name] = properties[name];
  }
  element.dispatchEvent(event);
}
```
将`console.log('tap')`下增加`dispatch('tap');`测试。   
```javascript
console.log('tap');
dispatch('tap');
```
给`document.documentElement`增加`tap`监听:   
```html
<script>
  // 取消右键菜单事件
  document.oncontextmenu = function (e) {
    e.preventDefault();
  }
  document.documentElement.addEventListener('tap', () => {
    console.log('on tap event');
  });
</script>
```
> 这里派发对象是documentElement所有只有改对象可以接受到
![结果](https://blog-images-file.oss-cn-beijing.aliyuncs.com/week/15/5.png)   

## fclick的判断
判断是否是快速滑动的思路是，在一定时间内触发的`point`的个数来判断，个数越少说明速度越快。   
* 在`start`函数中记录触发点时间
* 在`move`函数中记录0.5秒内移动的点
* 在`end`中计算移动速度:
  * 1.计算第一个point和最后一个point，坐标(x,y)平房之和 再开根号得到d
  * 2.计算第一个point时间和最后一个point时间差
  * 3.d / 时间差，大于1.5(越大说明越快)则为快速滑动

代码如下：   
```javascript
// start
let start = (point, context) => {
  context.startX = point.clientX;
  context.startY = point.clientY;

  context.points = [{
    t: Date.now(),
    x: point.clientX,
    y: point.clientY,
  }];

  // 触发tap事件
  context.isTap = true;
  context.isPan = false;
  context.isPress = false;
  console.log('tap');
  dispatch('tap');

  context.handler = setTimeout(() => {
    context.isTap = false;
    context.isPan = false;
    context.isPress = true; // 0.5s触发长按press事件
    console.log('press');
    dispatch('press');
  }, PRESS_TIME);
}
// move
let move = (point, context) => {
  // 记录移动信息
  let mx = point.clientX - context.startX;
  let my = point.clientY - context.startY;

  // 当不在pan事件，并且移动距离大于10px 则触发pan事件
  if (!context.isPan && mx ** 2 + my ** 2 > PAN_START_DISTANCE ** 2) {
    context.isTap = false;
    context.isPress = false;
    context.isPan = true;
    console.log('panstart');
    dispatch('panstart');
    // 清除press定时器
    clearTimeout(context.handler);
  }

  if (context.isPan) {
    // console.log('pan', mx, my);
    dispatch('pan');
  }

  // 过滤掉0.5内触发的点
  context.points = context.points.filter(point => Date.now() - point.t < 500);

  context.points.push({
    t: Date.now(),
    x: point.clientX,
    y: point.clientY,
  });

}

let end = (point, context) => {
  if (context.isTap) {
    //console.log('tap');
    clearTimeout(context.handler);
  }
  if (context.isPress) {
    console.log('pressend');
    dispatch('pressend');
  }
  if (context.isPan) {
    console.log('panend');
    dispatch('panend');
  }

  let d, v;

  if (!context.points.length) {
    d = 0;
  } else {
    context.points = context.points.filter(point => Date.now() - point.t < 500);
    d = Math.sqrt((point.clientX - context.points[0].x) ** 2 + (point.clientY - context.points[0].y) ** 2);
    v = d / (Date.now() - context.points[0].t);
  }

  if (v > 1.5) {
    context.isFlick = true;
  } else {
    context.isFlick = false;
  }
  console.log(context);
}
```
## 代码封装
将整个代码设置成3个类：   
* Listener 事件监听类 封装处理事件监听相关代码
* Recognize 识别器 封装事件系统`tap press panstart pan panend pressend`的逻辑
* dispatch 事件派发 封装事件派发代码
* gusture 调用入口 提供对外调用的接口

```javascript
export class Listener {
  constructor(element, recognize) {
    if (!element) {
      throw Error('element can not be undefined');
    }
    if (!recognize) {
      throw Error('recognize can not be undefined');
    }
    element.addEventListener('mousedown', event => {
  
      let context = Object.create(null);
      // 使用位移 1 << event.button
      contexts.set("mouse" + (1 << event.button), context);
    
      recognize.start(event, context);
    
      let mousemove = event => {
        let button = 1;
        // event.buttons 表示所有按下的键值 之和 =>多个
        // event.button 表示当前按下的键的值 =>单个
        while (button <= event.buttons) {
          if (button & event.buttons) {
            let key;
            if (button === 2) {
              key = 4;
            } else if (button === 4) {
              key =  2;
            } else {
              key = button;
            }
            let context = contexts.get("mouse" + key);
            recognize.move(event, context);
          }
          button = button << 1;
        }
      }
      let mouseup = event => {
        let context = contexts.get("mouse" + (1 << event.button));
        recognize.end(event, context);
        contexts.delete("mouse" + (1 << event.button));
    
        // buttons为 0才移除 无按下
        if (event.buttons === 0) {
          document.removeEventListener('mousemove', mousemove);
          document.removeEventListener('mouseup', mouseup);
          isListeningMouse = false;
        }
        
      }
    
      if (!isListeningMouse) {
        document.addEventListener('mousemove', mousemove);
        document.addEventListener('mouseup', mouseup);
        isListeningMouse = true;
      }
    
    });
    
    element.addEventListener('touchstart', event => {
      for (let touch of event.changedTouches) {
        let context = Object.create(null);
        contexts.set(touch.identifier, context);
        recognize.start(touch, context);
      }
    });
    
    element.addEventListener('touchmove', event => {
      for (let touch of event.changedTouches) {
        let context = contexts.get(touch.identifier);
        recognize.move(touch, context);
      }
    });
    
    element.addEventListener('touchend', event => {
      // 关闭默认事件
      event.preventDefault();
      for (let touch of event.changedTouches) {
        let context = contexts.get(touch.identifier);
        recognize.end(touch, context);
        contexts.delete(touch.identifier);
      }
    });
    
    element.addEventListener('touchcancel', event => {
      for (let touch of event.changedTouches) {
        let context = contexts.get(touch.identifier);
        recognize.cancel(touch, context);
        contexts.delete(touch.identifier);
      }
    });
  }
}

export class Dispatcher {
  constructor(element) {
    this.element = element;
  }
  dispatch(type, properties) {
    let event = new Event(type);
    for (let name in properties) {
      event[name] = properties[name];
    }
    this.element.dispatchEvent(event);
  }
}

export class Recognize {
  constructor(dispatcher) {
    this.dispatcher = dispatcher;
  }
  start(point, context) {
    context.startX = point.clientX;
    context.startY = point.clientY;
  
    context.points = [{
      t: Date.now(),
      x: point.clientX,
      y: point.clientY,
    }];
  
    // 触发tap事件
    context.isTap = true;
    context.isPan = false;
    context.isPress = false;
    // this.dispatch('tap');
  
    context.handler = setTimeout(() => {
      context.isTap = false;
      context.isPan = false;
      context.isPress = true; // 0.5s触发长按press事件
      this.dispatcher.dispatch('press', {});
    }, PRESS_TIME);
  
  }
  move(point, context){
    // 记录移动信息
    let mx = point.clientX - context.startX;
    let my = point.clientY - context.startY;
  
    // 当不在pan事件，并且移动距离大于10px 则触发pan事件
    if (!context.isPan && mx ** 2 + my ** 2 > PAN_START_DISTANCE ** 2) {
      context.isTap = false;
      context.isPress = false;
      context.isPan = true;
      context.isVertical = Math.abs(mx) < Math.abs(my) ? true : false;
      this.dispatcher.dispatch('panstart', {
        startX: context.startX,
        startY: context.startY,
        clientX: point.clientX,
        clientY: point.clientY,
        isVertical: context.isVertical,
      });
      // 清除press定时器
      clearTimeout(context.handler);
    }
  
    if (context.isPan) {
      this.dispatcher.dispatch('pan', {
        startX: context.startX,
        startY: context.startY,
        clientX: point.clientX,
        clientY: point.clientY,
        isVertical: context.isVertical,
      });
    }
  
    // 过滤掉0.5内触发的点
    context.points = context.points.filter(point => Date.now() - point.t < POINT_FILTER_TIME);
  
    context.points.push({
      t: Date.now(),
      x: point.clientX,
      y: point.clientY,
    });
  
  }
  end(point, context) {
    let d, v;
    if (context.isTap) {
      this.dispatcher.dispatch('tap', {});
      clearTimeout(context.handler);
    }
    if (context.isPress) {
      this.dispatcher.dispatch('pressend', {});
    }
    
    context.points = context.points.filter(point => Date.now() - point.t < 500);

    if (!context.points.length) {
      d = 0;
    } else {
      d = Math.sqrt((point.clientX - context.points[0].x) ** 2 + (point.clientY - context.points[0].y) ** 2);
      v = d / (Date.now() - context.points[0].t);
    }
  
    if (v > FLICK_DISTANCE) {
      this.dispatcher.dispatch('flick', {
        startX: context.startX,
        startY: context.startY,
        clientX: point.clientX,
        clientY: point.clientY,
        isVertical: context.isVertical,
        isFlick: context.isFlick,
        velocity: v,
      });
      context.isFlick = true;
    } else {
      context.isFlick = false;
    }

    if (context.isPan) {
      this.dispatcher.dispatch('panend', {
        startX: context.startX,
        startY: context.startY,
        clientX: point.clientX,
        clientY: point.clientY,
        isVertical: context.isVertical,
        isFlick: context.isFlick,
      });
    }
  }
  cancel(point, context) {
    // 发生打断touch事件需要清除定时器
    clearTimeout(context.handler);
    this.dispatcher.dispatch('cancel', {});
  }
}

```
完整代码如下：   
```javascript
const PRESS_TIME = 500; //长按事件触发时长
const PAN_START_DISTANCE = 10; //移动多少10px触发panstart
const FLICK_DISTANCE = 1.5; //flick事件触发值
const POINT_FILTER_TIME = 500; //触点的有效过滤时间

let contexts = new Map();
let isListeningMouse = false; //是否绑定过了mouse相关事件

export class Dispatcher {
  constructor(element) {
    this.element = element;
  }
  dispatch(type, properties) {
    let event = new Event(type);
    for (let name in properties) {
      event[name] = properties[name];
    }
    this.element.dispatchEvent(event);
  }
}

export class Listener {
  constructor(element, recognize) {
    if (!element) {
      throw Error('element can not be undefined');
    }
    if (!recognize) {
      throw Error('recognize can not be undefined');
    }
    element.addEventListener('mousedown', event => {
  
      let context = Object.create(null);
      // 使用位移 1 << event.button
      contexts.set("mouse" + (1 << event.button), context);
    
      recognize.start(event, context);
    
      let mousemove = event => {
        let button = 1;
        // event.buttons 表示所有按下的键值 之和 =>多个
        // event.button 表示当前按下的键的值 =>单个
        while (button <= event.buttons) {
          if (button & event.buttons) {
            let key;
            if (button === 2) {
              key = 4;
            } else if (button === 4) {
              key =  2;
            } else {
              key = button;
            }
            let context = contexts.get("mouse" + key);
            recognize.move(event, context);
          }
          button = button << 1;
        }
      }
      let mouseup = event => {
        let context = contexts.get("mouse" + (1 << event.button));
        recognize.end(event, context);
        contexts.delete("mouse" + (1 << event.button));
    
        // buttons为 0才移除 无按下
        if (event.buttons === 0) {
          document.removeEventListener('mousemove', mousemove);
          document.removeEventListener('mouseup', mouseup);
          isListeningMouse = false;
        }
        
      }
    
      if (!isListeningMouse) {
        document.addEventListener('mousemove', mousemove);
        document.addEventListener('mouseup', mouseup);
        isListeningMouse = true;
      }
    
    });
    
    element.addEventListener('touchstart', event => {
      for (let touch of event.changedTouches) {
        let context = Object.create(null);
        contexts.set(touch.identifier, context);
        recognize.start(touch, context);
      }
    });
    
    element.addEventListener('touchmove', event => {
      for (let touch of event.changedTouches) {
        let context = contexts.get(touch.identifier);
        recognize.move(touch, context);
      }
    });
    
    element.addEventListener('touchend', event => {
      // 关闭默认事件
      event.preventDefault();
      for (let touch of event.changedTouches) {
        let context = contexts.get(touch.identifier);
        recognize.end(touch, context);
        contexts.delete(touch.identifier);
      }
    });
    
    element.addEventListener('touchcancel', event => {
      for (let touch of event.changedTouches) {
        let context = contexts.get(touch.identifier);
        recognize.cancel(touch, context);
        contexts.delete(touch.identifier);
      }
    });
  }
}

export class Recognize {
  constructor(dispatcher) {
    this.dispatcher = dispatcher;
  }
  start(point, context) {
    context.startX = point.clientX;
    context.startY = point.clientY;
  
    context.points = [{
      t: Date.now(),
      x: point.clientX,
      y: point.clientY,
    }];
  
    // 触发tap事件
    context.isTap = true;
    context.isPan = false;
    context.isPress = false;
    // this.dispatch('tap');
  
    context.handler = setTimeout(() => {
      context.isTap = false;
      context.isPan = false;
      context.isPress = true; // 0.5s触发长按press事件
      this.dispatcher.dispatch('press', {});
    }, PRESS_TIME);
  
  }
  move(point, context){
    // 记录移动信息
    let mx = point.clientX - context.startX;
    let my = point.clientY - context.startY;
  
    // 当不在pan事件，并且移动距离大于10px 则触发pan事件
    if (!context.isPan && mx ** 2 + my ** 2 > PAN_START_DISTANCE ** 2) {
      context.isTap = false;
      context.isPress = false;
      context.isPan = true;
      context.isVertical = Math.abs(mx) < Math.abs(my) ? true : false;
      this.dispatcher.dispatch('panstart', {
        startX: context.startX,
        startY: context.startY,
        clientX: point.clientX,
        clientY: point.clientY,
        isVertical: context.isVertical,
      });
      // 清除press定时器
      clearTimeout(context.handler);
    }
  
    if (context.isPan) {
      this.dispatcher.dispatch('pan', {
        startX: context.startX,
        startY: context.startY,
        clientX: point.clientX,
        clientY: point.clientY,
        isVertical: context.isVertical,
      });
    }
  
    // 过滤掉0.5内触发的点
    context.points = context.points.filter(point => Date.now() - point.t < POINT_FILTER_TIME);
  
    context.points.push({
      t: Date.now(),
      x: point.clientX,
      y: point.clientY,
    });
  
  }
  end(point, context) {
    let d, v;
    if (context.isTap) {
      this.dispatcher.dispatch('tap', {});
      clearTimeout(context.handler);
    }
    if (context.isPress) {
      this.dispatcher.dispatch('pressend', {});
    }
    
    context.points = context.points.filter(point => Date.now() - point.t < 500);

    if (!context.points.length) {
      d = 0;
    } else {
      d = Math.sqrt((point.clientX - context.points[0].x) ** 2 + (point.clientY - context.points[0].y) ** 2);
      v = d / (Date.now() - context.points[0].t);
    }
  
    if (v > FLICK_DISTANCE) {
      this.dispatcher.dispatch('flick', {
        startX: context.startX,
        startY: context.startY,
        clientX: point.clientX,
        clientY: point.clientY,
        isVertical: context.isVertical,
        isFlick: context.isFlick,
        velocity: v,
      });
      context.isFlick = true;
    } else {
      context.isFlick = false;
    }

    if (context.isPan) {
      this.dispatcher.dispatch('panend', {
        startX: context.startX,
        startY: context.startY,
        clientX: point.clientX,
        clientY: point.clientY,
        isVertical: context.isVertical,
        isFlick: context.isFlick,
      });
    }
  }
  cancel(point, context) {
    // 发生打断touch事件需要清除定时器
    clearTimeout(context.handler);
    this.dispatcher.dispatch('cancel', {});
  }
}

export function gesture(element) {
  new Listener(element, new Recognize(new Dispatcher(element)));
}
```
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>
  <script type="module">
    document.oncontextmenu = function (e) {
      e.preventDefault();
    }

    import { gesture } from './gusture.js';
    gesture(document.documentElement);

    document.documentElement.addEventListener('tap', () => {
      console.log('tap');
    })
    document.documentElement.addEventListener('press', () => {
      console.log('press');
    })
    document.documentElement.addEventListener('pressend', () => {
      console.log('pressend');
    })
    document.documentElement.addEventListener('panstart', (e) => {
      console.log('panstart', e);
    })
    document.documentElement.addEventListener('pan', (e) => {
      console.log('pan', e);
    })
    document.documentElement.addEventListener('panend', (e) => {
      console.log('panend', e);
    })
  </script>
</body>
</html>
```
![运行结果](https://blog-images-file.oss-cn-beijing.aliyuncs.com/week/15/6.png)   
## 总结
手势系统分为三个步骤，第一步：设计一套自己的完整的手势事件系统流程，第二步：对PC和移动端事件统一抽象处理，第三步，手势库的封装并提供最简单的API给调用者，值得学习的地方有：多点触控每个点状态处理问题，原生对象`Event`的使用，`flick`事件判断思路，还有最难理解的地方PC端`buttons`和`buttons`通过位运算符处理思路.   