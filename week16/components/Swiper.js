import { Component, STATE, ATTRIBUTE, createElement } from '../Component.js';
import { TimeLine, Animation, ease } from '../lib/animations/index.js'; //引入动画系统
import { Gesture } from '../components/Gusture.js'; // 引入手势系统

export { STATE, ATTRIBUTE } from '../Component.js';

export class Swiper extends Component {
  constructor() {
    super();
  }
  appendChild (child) {
    this.template = child;
    //this.render();
  }
  render() {
    this.children = this[ATTRIBUTE].list.map(this.template);
    this.root = (<div class="swiper">{this.children}</div>).render();


    // this.root = document.createElement('div');
    // this.root.classList.add('swiper');
    // for (let record of this[ATTRIBUTE].src) {
    //   let imgEle = document.createElement('div');
    //   imgEle.classList.add('item');
    //   imgEle.style.backgroundImage = `url(${record})`;
    //   this.root.appendChild(imgEle);
    // }

    // 使用手势系统系统替代原生事件
    Gesture(this.root);
    // 创建时间线
    let timeLine = new TimeLine();
    timeLine.start();

    // 鼠标拖动切换
    this[STATE].position = 0;

    let children = this.root.children;
    let t = 0;
    let ax = 0;
    let handler = null;
    
    this.root.addEventListener('start', event => {
      console.log('start')
      timeLine.pause();
      clearInterval(handler);
      let progress = (Date.now() - t) / 500;
      ax = ease(progress) * 500 - 500;
    });

    this.root.addEventListener('pan', event => {

      let x = event.clientX - event.startX - ax;
      let current = this[STATE].position - ((x - x % 500) / 500);
      for (let offset of  [-1, 0, 1]) {
        let pos = current + offset;
        pos = (pos % children.length + children.length) % children.length;

        children[pos].style.transition = 'none';
        children[pos].style.transform = `translateX(${- pos * 500 + offset * 500 + x % 500}px)`;
      }
    });

    this.root.addEventListener('tap', () => {
      this.triggerEvent('click', {
        data: this[ATTRIBUTE].src[this[STATE].position],
        position: this[STATE].position
      });
    });

    this.root.addEventListener('end', event => {

      timeLine.reset();
      timeLine.start();
      handler = setInterval(nextPicture, 3000);

      let x = event.clientX - event.startX - ax;
      let current = this[STATE].position - ((x - x % 500) / 500);

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

      this[STATE].position = this[STATE].position - ((x - x % 500) / 500) - direction;
      this[STATE].position = (this[STATE].position % children.length + children.length) % children.length;
      this.triggerEvent('change', {
        position: this[STATE].position
      });
      
    });

    let nextPicture = () => {
      let nextPosition = (this[STATE].position + 1) % children.length;

      let current = children[this[STATE].position];
      let next = children[nextPosition];

      t = Date.now();

      timeLine.add(new Animation(current.style, 'transform',
         - this[STATE].position * 500, -500 - this[STATE].position * 500, 500, 0, ease, v => `translateX(${v}px)`));
      timeLine.add(new Animation(next.style, 'transform',
         500 - nextPosition * 500, - nextPosition * 500, 500, 0, ease, v => `translateX(${v}px)`));

      this.triggerEvent('change', {
        position: this[STATE].position
      });
      this[STATE].position = nextPosition;

    }

    handler = setInterval(nextPicture, 3000);

    return this.root;
  }
}