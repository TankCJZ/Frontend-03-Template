import { TimeLine, Animation } from '../lib/animations/animation.js';
import { ease, easeIn, easeInOut, easeOut } from '../lib/animations/ease.js';

let tt = new TimeLine();
tt.add(new Animation(document.querySelector('#box').style, 'transform', 0, 500, 2000, 0, easeInOut, v => `translateX(${v}px)`));


document.querySelector('#box2').style.transition = 'transform ease-in-out 2s';
document.querySelector('#box2').style.transform = 'translate(500px)';

tt.start();
document.querySelector('#start').addEventListener('click', () => tt.start());
document.querySelector('#pause').addEventListener('click', () => tt.pause());
document.querySelector('#resume').addEventListener('click', () => {
  tt.resume();
});
document.querySelector('#restart').addEventListener('click', () => {
  tt.start();
});