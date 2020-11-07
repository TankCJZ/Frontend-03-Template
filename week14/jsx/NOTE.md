<!--
 * @Author: your name
 * @Date: 2020-09-24 13:56:03
 * @LastEditTime: 2020-11-07 11:09:14
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \week14\NOTE.md
-->
# 组件化-动画系统
动画系统的核心是每一帧执行一个动作，在JavaScript中实现帧的概念有三种方式:   
* setTimeout()
* setInterval()
* requestAnimationFrame()

`requestAnimationFrame`是目前最好的方式，因为它是由系统决定动画回调函数执行的时机，而`setTimeout、setInterval`是被放入到异步队列中，它执行时机会受到主线程的影响，主线程执行完成后才会取执行异步队列，如果主线程执行执行时间超过一帧则会出现掉帧卡顿效果。   

## 动画系统-时间线
时间线属于动画系统一部分，时间线的概念是为了控制动画执行的过程和状态，定义`TimeLine`时间线类，提供以下方法：   
* start() // 开始动画
* set rate() // 设置动画速率
* get rate() // 获取动画速率
* pause() // 暂停
* resume() //继续
* reset() //重新开始
  
```javascript
class TimeLine {
  con
}
```
