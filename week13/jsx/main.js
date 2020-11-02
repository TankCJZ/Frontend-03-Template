import { Component, createElement } from './Component.js';

class Swiper extends Component {
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

let s = <Swiper src={d}></Swiper>
s.mountTo(document.body);
