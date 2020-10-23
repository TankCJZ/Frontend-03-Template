# 第十二周 编程与算法训练-Proxy与双向绑定

本周学习目标，了解proxy的基本用发并使用proxy实现vue3.0中的reactive特性   

## Proxy 的基本使用
Proxy 对象用于定义基本操作的自定义行为（如属性查找、赋值、枚举、函数调用等）   
```javascript
// 使用proxy代理一个对象
let obj = {
  a: 1,
  b: 2,
}

let proxy = new Proxy(obj, {
  // 拦截获取属性 obje.xx
  get(obj, prop) {
    console.log('get:', obj, prop);
  },
  // 拦截设置属性 obje.xx = xxx
  set(obj, prop, val) {
    console.log('set:', obj, prop, val);
  }
});

proxy.a; // 1.html:18 get: {a: 1, b: 2} a
proxy.a = 3; // set: {a: 1, b: 2} a 3
```
![](https://blog-images-file.oss-cn-beijing.aliyuncs.com/week/12/Snipaste_2020-10-23_13-53-56.png)   
Proxy拦截器还包含`has` `deleteProperty` `ownKeys` `apply` `construct` 等。   
[MDN文档地址]: https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy  

## 模仿vue3.0 reactive实现一
下面代码实现reactive函数的一个基本结构   
```javascript
let p1 = reactive({
  a: 1,
  b: 2
});

// reactive 函数定义 将Proxy封装
function reactive(object) {
  return new Proxy(object, {
    get(obj, prop) {
      return obj[prop];
    },
    set(obj, prop, val) {
      obj[prop] = val;
      return obj[prop];
    }
  });
}
```

## 模仿vue3.0 reactive实现二 
增加监听函数`effect`   
* 定义`callbacks`数组存放所有`effect`中的回调函数
* 在`Proxy`中set拦截器中执行`callbacks`
```javascript

let p1 = reactive({
  a: 1,
  b: 2
});
// * 定义`callbacks`数组存放所有`effect`中的回调函数
let callbacks = [];

function reactive(object) {
  return new Proxy(object, {
    get(obj, prop) {
      return obj[prop];
    },
    set(obj, prop, val) {
      obj[prop] = val;
      // 执行保存的回调函数
      for (let call of callbacks) {
        call && call();
      }
      return obj[prop];
    }
  });
}

function effect(callback) {
  // 将回调函数保存
  callbacks.push(callback);
}

effect(() => {
  console.log('effect');
});

p1.a = 10; // effect 10
```
> 在p1进行赋值时候会执行effect中的回调函数

## 模仿vue3.0 reactive实现三
将`effect`和`reactive`建立关联   
* 定义`usedReactiveties` 数组存放需要监听的对象和属性信息
* 在`Proxy`中`set`拦截器中将对象和属性加入数组`usedReactiveties`中
* 在`Proxy`中`get`拦截器中从收集对象`usedReactiveties`中找到当前对象的监听函数`callback`函数并执行
* 在`effect`中执行一次callback将触发`usedReactiveties`的收集
* `usedReactiveties`的收集完成后将回调函数`callback`加入绑定到收集对象中
```javascript
let callbacks = new Map();
// 定义`usedReactiveties` 数组存放需要监听的对象和属性信息
let usedReactiveties = [];
let p1 = reactive({
  a: 1,
  b: 2,
});

function reactive(object) {
  return new Proxy(object, {
    get(obj, prop) {
      // 在`Proxy`中`set`拦截器中将对象和属性加入数组`usedReactiveties`中
      usedReactiveties.push([obj, prop]);
      return obj[prop];
    },
    set(obj, prop, val) {
      obj[prop] = val;

      if (callbacks.get(obj)) {
        if (callbacks.get(obj).get(prop)) {
          // 在`Proxy`中`get`拦截器中从收集对象`usedReactiveties`中找到当前对象的监听函数`callback`函数并执行
          for (let call of callbacks.get(obj).get(prop)) {
            call && call();
          }
        }
      }

      return obj[prop];
    }
  });
}

function effect(callback) {
  usedReactiveties = [];
  // 在`effect`中执行一次callback将触发`usedReactiveties`的收集
  callback();

  for(let reactive of usedReactiveties) {
    // 空状态处理
    if (!callbacks.has(reactive[0])) {
      callbacks.set(reactive[0], new Map());
    }
    if (!callbacks.get(reactive[0]).has(reactive[1])) {
      callbacks.get(reactive[0]).set(reactive[1], []);
    }
    // `usedReactiveties`的收集完成后将回调函数`callback`加入绑定到收集对象中
    callbacks.get(reactive[0]).get(reactive[1]).push(callback);
  }
}

effect(() => {
  console.log('effect', p1.a);
});
```
> 当修改p1.a属性 会触发effect中的回调函数

当对象有多层属性的时候`obj.xx.xx`上面实现代码并不能触发`effect`函数，接下来我们就需要实现对象深度监听   

## 模仿vue3.0 reactive实现四
在`Proxy get`拦截器中增加一层判断，当属性为对象`Object`则直接返回一个新的`Proxy`   
```javascript
get(obj, prop) {
  usedReactiveties.push([obj, prop]);
  if (typeof obj[prop] === 'object') {
    return reactive(obj[prop]);
  }
  return obj[prop];
},
```
同时再增加一层proxy缓存，在创建`proxy`之前查看是否有缓存有则使用缓存   
```javascript
let reactivties = new Map();

function reactive(object) {
  // 判断是否有缓存proxy
  if (reactivties.has(object)) {
    return reactivties.get(object);
  }
  let proxy = new Proxy(object, {
    get(obj, prop) {
      usedReactiveties.push([obj, prop]);
      if (typeof obj[prop] === 'object') {
        return reactive(obj[prop]);
      }
      return obj[prop];
    },
    set(obj, prop, val) {
      obj[prop] = val;

      if (callbacks.get(obj)) {
        if (callbacks.get(obj).get(prop)) {
          // 执行保存的回调函数
          for (let call of callbacks.get(obj).get(prop)) {
            call && call();
          }
        }
      }

      return obj[prop];
    }
  });
  
  // 缓存当前proxy
  reactivties.set(object, proxy);

  return proxy;
}
```
完整代码：
```javascript
let obj = {
  a: 1,
  b: 2,
}

let callbacks = new Map();
let reactivties = new Map();
let usedReactiveties = [];
let p1 = reactive(obj);

function reactive(object) {
  if (reactivties.has(object)) {
    return reactivties.get(object);
  }
  let proxy = new Proxy(object, {
    get(obj, prop) {
      usedReactiveties.push([obj, prop]);
      if (typeof obj[prop] === 'object') {
        return reactive(obj[prop]);
      }
      return obj[prop];
    },
    set(obj, prop, val) {
      obj[prop] = val;

      if (callbacks.get(obj)) {
        if (callbacks.get(obj).get(prop)) {
          // 执行保存的回调函数
          for (let call of callbacks.get(obj).get(prop)) {
            call && call();
          }
        }
      }

      return obj[prop];
    }
  });
  
  reactivties.set(object, proxy);

  return proxy;
}

function effect(callback) {
  // 将回调函数保存
  // callbacks.push(callback);
  usedReactiveties = [];
  callback();

  for(let reactive of usedReactiveties) {
    if (!callbacks.has(reactive[0])) {
      callbacks.set(reactive[0], new Map());
    }
    if (!callbacks.get(reactive[0]).has(reactive[1])) {
      callbacks.get(reactive[0]).set(reactive[1], []);
    }
    callbacks.get(reactive[0]).get(reactive[1]).push(callback);
  }
}

effect(() => {
  console.log('effect', p1.a);
  console.log('effect', p1.b);
});
```

## reactive应用场景-双向绑定
简单的`input`双向绑定   
```html
<input type="text" id="r" value="">
<script>
  
  let callbacks = new Map();
  let reactivties = new Map();
  let usedReactiveties = [];

  let p1 = reactive({
    val: 10
  });

  effect(() => {
    // val发生变化时自动设置input值
    document.getElementById('r').value = p1.val;
  })

  function reactive(object) {
    if (reactivties.has(object)) {
      return reactivties.get(object);
    }
    let proxy = new Proxy(object, {
      get(obj, prop) {
        usedReactiveties.push([obj, prop]);
        if (typeof obj[prop] === 'object') {
          return reactive(obj[prop]);
        }
        return obj[prop];
      },
      set(obj, prop, val) {
        obj[prop] = val;

        if (callbacks.get(obj)) {
          if (callbacks.get(obj).get(prop)) {
            // 执行保存的回调函数
            for (let call of callbacks.get(obj).get(prop)) {
              call && call();
            }
          }
        }

        return obj[prop];
      }
    });
    
    reactivties.set(object, proxy);

    return proxy;
  }

  function effect(callback) {
    // 将回调函数保存
    // callbacks.push(callback);
    usedReactiveties = [];
    callback();

    for(let reactive of usedReactiveties) {
      if (!callbacks.has(reactive[0])) {
        callbacks.set(reactive[0], new Map());
      }
      if (!callbacks.get(reactive[0]).has(reactive[1])) {
        callbacks.get(reactive[0]).set(reactive[1], []);
      }
      callbacks.get(reactive[0]).get(reactive[1]).push(callback);
    }
  }

</script>
```
![双向绑定](https://blog-images-file.oss-cn-beijing.aliyuncs.com/week/12/2.gif)   

## reactive应用场景-调色板案例

```html
<div>
  红: <input type="range" id="r" value="" min="0" max="255">
</div>
<div>
  绿: <input type="range" id="g" value="" min="0" max="255">
</div>
<div>
  蓝: <input type="range" id="b" value="" min="0" max="255">
</div>
<div style="width: 100px; height: 100px;border-radius: 50%;" id='color'></div>
<style>
  input{
  }
</style>
<script>
  
  let callbacks = new Map();
  let reactivties = new Map();
  let usedReactiveties = [];

  let p1 = reactive({
    r: 0,
    g: 0,
    b: 0,
  });

  const $ = (el) => {
    return document.querySelector(el);
  }

  effect(() => {
    $('#r').value = p1.r;
  });
  effect(() => {
    $('#g').value = p1.g;
  });
  effect(() => {
    $('#b').value = p1.b;
  });

  $('#r').addEventListener('input', event => p1.r = event.target.value);
  $('#g').addEventListener('input', event => p1.g = event.target.value);
  $('#b').addEventListener('input', event => p1.b = event.target.value);

  effect(() => {
    $('#color').style.backgroundColor = `rgb(${p1.r}, ${p1.g}, ${p1.b})`;
  });

  function reactive(object) {
    if (reactivties.has(object)) {
      return reactivties.get(object);
    }
    let proxy = new Proxy(object, {
      get(obj, prop) {
        usedReactiveties.push([obj, prop]);
        if (typeof obj[prop] === 'object') {
          return reactive(obj[prop]);
        }
        return obj[prop];
      },
      set(obj, prop, val) {
        obj[prop] = val;

        if (callbacks.get(obj)) {
          if (callbacks.get(obj).get(prop)) {
            // 执行保存的回调函数
            for (let call of callbacks.get(obj).get(prop)) {
              call && call();
            }
          }
        }

        return obj[prop];
      }
    });
    
    reactivties.set(object, proxy);

    return proxy;
  }

  function effect(callback) {
    // 将回调函数保存
    // callbacks.push(callback);
    usedReactiveties = [];
    callback();

    for(let reactive of usedReactiveties) {
      if (!callbacks.has(reactive[0])) {
        callbacks.set(reactive[0], new Map());
      }
      if (!callbacks.get(reactive[0]).has(reactive[1])) {
        callbacks.get(reactive[0]).set(reactive[1], []);
      }
      callbacks.get(reactive[0]).get(reactive[1]).push(callback);
    }
  }

</script>
```
![双向绑定](https://blog-images-file.oss-cn-beijing.aliyuncs.com/week/12/3.gif)   

## 案例-Range实现精准拖拽
div拖拽实现：   
* 监听`mousedown`事件，
* 在监听事件`mousedown`中绑定`document`的`mousemove`和`mouseup`事件，
* `mouseup`中移除监听函数，
* `mousemove`中处理div移动逻辑
* 确保第二次位置正确，我们需要记录初始位置 `baseX baseY`
* 在`up`中保存上一次的位置信息`baseX baseY`
* 在drag`mousedown`事件中记录 按下位置，并在移动中`move`计算出位置偏移加上初始位置得出最终移动位置
  
```html
<div id="drag" style="vertical-align: middle;width: 50px;height: 50px;display: inline-block;background: pink;"></div>
<script>
let baseX = 0, baseY = 0;

drag.addEventListener('mousedown', event => {
  let startX = event.clientX, startY = event.clientY;

  // 移动div
  const move = event => {
    drag.style.transform = `translateX(${baseX + event.clientX - startX}px) translateY(${baseY + event.clientY - startY}px)`;
  }

  // 移除监听
  const up = event => {
    baseX = baseX + event.clientX - startX;
    baseY = baseY + event.clientY - startY;
    document.removeEventListener('mousemove', move);
    document.removeEventListener('mouseup', up);
  }

  document.addEventListener('mousemove', move);
  document.addEventListener('mouseup', up);

});
</script>
```
实现将`div`插入到任意的文本位置中   
* 定义存放range数据数组`ranges`
* 将所有文本内容添加到`ranges`数组中
* 在`move`函数中获取到距离div中近的`range`，并将`range`插入到该位置中
```html
<div id="content">
  Proxy 对象用于定义基本操作的自定义行为（如属性查找、赋值、枚举、函数调用等）。术语
  handler
  包含捕捉器（trap）的占位符对象，可译为处理器对象。
  traps
  提供属性访问的方法。这类似于操作系统中捕获器的概念。
  target
  被 Proxy 代理虚拟化的对象。它常被作为代理的存储后端。根据目标验证关于对象不可扩展性或不可配置属性的不变量（保持不变的语义）。
  语法
  const p = new Proxy(target, handler)
  参数
  target
  要使用 Proxy 包装的目标对象（可以是任何类型的对象，包括原生数组，函数，甚至另一个代理）。
  handler
  一个通常以函数作为属性的对象，各属性中的函数分别定义了在执行各种操作时代理 p 的行为。
  方法
  Proxy.revocable()
  创建一个可撤销的Proxy对象。
  handler 对象的方法
  handler 对象是一个容纳一批特定属性的占位符对象。它包含有 Proxy 的各个捕获器（trap）。
  所有的捕捉器是可选的。如果没有定义某个捕捉器，那么就会保留源对象的默认行为。
  handler.getPrototypeOf()
  Object.getPrototypeOf 方法的捕捉器。
  handler.setPrototypeOf()
  Object.setPrototypeOf 方法的捕捉器。
  handler.isExtensible()
  Object.isExtensible 方法的捕捉器。
  handler.preventExtensions()
  Object.preventExtensions 方法的捕捉器。
  handler.getOwnPropertyDescriptor()
  Object.getOwnPropertyDescriptor 方法的捕捉器。
  handler.defineProperty()
  Object.defineProperty 方法的捕捉器。
  handler.has()
  in 操作符的捕捉器。
  handler.get()
  属性读取操作的捕捉器。
  handler.set()
  属性设置操作的捕捉器。
  handler.deleteProperty()
  delete 操作符的捕捉器。
  handler.ownKeys()
  Object.getOwnPropertyNames 方法和 Object.getOwnPropertySymbols 方法的捕捉器。
  handler.apply()
  函数调用操作的捕捉器。
  handler.construct()
  new 操作符的捕捉器。
  一些不标准的捕捉器已经被废弃并且移除了。
</div>
<div id="drag" style="vertical-align: middle;width: 50px;height: 50px;display: inline-block;background: pink;"></div>


<script>

  const $ = (el) => {
    return document.querySelector(el);
  }

  // 定义存放range数据数组`ranges`
  let ranges = [];
  let drag = $('#drag');
  let baseX = 0, baseY = 0;

  document.addEventListener('selectstart', e => e.preventDefault());

  drag.addEventListener('mousedown', event => {
    let startX = event.clientX, startY = event.clientY;
    const move = event => {
      // 在`move`函数中获取到距离div中近的`range`，
      let range = getNearest(event.clientX, event.clientY);
      // 并将`range`插入到该位置中
      range.insertNode(drag);
    }
    const up = event => {
      baseX = baseX + event.clientX - startX;
      baseY = baseY + event.clientY - startY;
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', up);
    }

    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up);

  });

  const content = $('#content');

  // 将所有文本内容添加到`ranges`数组中
  for (let i = 0; i < content.childNodes[0].textContent.length; i++) {
    let range = document.createRange();
    range.setStart(content.childNodes[0], i);
    range.setEnd(content.childNodes[0], i);
    ranges.push(range);
  }

  // 获取最近的range
  function getNearest(x, y) {
    let min = Infinity;
    let nearest = null;

    for (let range of ranges) {
      let rect = range.getBoundingClientRect();
      let distance = (rect.x - x) ** 2 + (rect.y - y) ** 2;
      if (distance < min) {
        nearest = range;
        min = distance;
      }
    }
    return nearest;
  }

</script>
```
![运行效果](https://blog-images-file.oss-cn-beijing.aliyuncs.com/week/12/4.gif)