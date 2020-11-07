import { Component } from './Component.js';

export class Swiper extends Component {
  constructor() {
    super();
    this.attributes = Object.create(null);
  }
  setAttribute(name, value) {
    this.attributes[name] = value;
  }
  mountTo(parent) {
    parent.appendChild(this.render());
  }
  render() {
    this.root = document.createElement('div');
    this.root.classList.add('swiper');
    for (let record of this.attributes.src) {
      let imgEle = document.createElement('div');
      imgEle.classList.add('item');
      imgEle.style.backgroundImage = `url(${record})`;
      this.root.appendChild(imgEle);
    }

    // 鼠标拖动切换
    let position = 0;
    this.root.addEventListener('mousedown', e => {
      let children = this.root.children;
      let startX = e.clientX;

      let move = event => {
        let x = event.clientX - startX;

        let current = position - ((x - x % 500) / 500);
        
        for (let offset of  [-1, 0, 1]) {
          let pos = current + offset;
          pos = (pos + children.length) % children.length;

          children[pos].style.transition = 'none';
          children[pos].style.transform = `translateX(${- pos * 500 + offset * 500 + x % 500}px)`;
        }
      }

      let up = event => {
        let x = event.clientX - startX;
        position = position - Math.round(x / 500);

        for (let offset of [0, -Math.sign(Math.round(x / 500) - x + 250 * Math.sign(x))]) {
          let pos = position + offset;
          pos = (pos + children.length) % children.length;

          children[pos].style.transition = '';
          children[pos].style.transform = `translateX(${- pos * 500 + offset * 500}px)`;
        }

        document.removeEventListener('mousemove', move);
        document.removeEventListener('mouseup', up);
      }

      document.addEventListener('mousemove', move);
      document.addEventListener('mouseup', up);
    });

    /* let currentIndex = 0;
    setInterval(() => {
      let children = this.root.children;
      let nextIndex = (currentIndex + 1) % children.length;

      let current = children[currentIndex];
      let next = children[nextIndex];

      next.style.transition = 'none';
      console.log('------------------------')
      console.log('next', 100 - nextIndex * 100)
      next.style.transform = `translateX(${100 - nextIndex * 100}%)`;

      setTimeout(() => {
        
        next.style.transition = '';
        console.log('current', -100 - currentIndex * 100)
        current.style.transform = `translateX(${-100 - currentIndex * 100}%)`;
        console.log('next', - nextIndex * 100)
        next.style.transform = `translateX(${- nextIndex * 100}%)`;

        currentIndex = nextIndex;
      }, 16);

    }, 3000); */

    return this.root;
  }
}