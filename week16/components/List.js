import { Component, STATE, ATTRIBUTE, createElement } from '../Component.js';

export { STATE, ATTRIBUTE } from '../Component.js';

export class List extends Component {
  constructor() {
    super();
  }
  render() {
    this.children = this[ATTRIBUTE].data.map(this.template);
    this.root = (<div>{this.children}</div>).render();
    return this.root;
  }
  appendChild (child) {
    this.template = child;
    this.render();
  }
}