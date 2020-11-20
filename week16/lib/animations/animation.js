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
    this.state = STATE_INIT;
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