import { createElement } from './Component.js';
import { Swiper } from './components/Swiper.js';
import { Button } from './components/Button.js';
import { List } from './components/List.js';

let d = [
  {
    src: 'https://static001.geekbang.org/resource/image/bb/21/bb38fb7c1073eaee1755f81131f11d21.jpg',
    title: '猫1',
  },
  {
    src: 'https://static001.geekbang.org/resource/image/1b/21/1b809d9a2bdf3ecc481322d7c9223c21.jpg',
    title: '猫2',
  },
  {
    src: 'https://static001.geekbang.org/resource/image/b6/4f/b6d65b2f12646a9fd6b8cb2b020d754f.jpg',
    title: '猫3',
  },
  {
    src: 'https://static001.geekbang.org/resource/image/bb/21/bb38fb7c1073eaee1755f81131f11d21.jpg',
    title: '猫4',
  },
];

// let s = <List data={d}>
//   {
//     (record) => 
//       <div>
//         <img src={record.src}></img>
//         <span>{record.title}</span>
//       </div>
//   }
// </List>
let s = <Swiper list={d} onClick={e => console.log(e.detail)} onChange={e => console.log(e.detail)}>
  {
    (record) => 
      <div class="item">
        <img src={record.src}></img>
      </div>
  }
</Swiper>

s.mountTo(document.body);
