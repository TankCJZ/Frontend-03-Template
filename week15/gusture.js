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