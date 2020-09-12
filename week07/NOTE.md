# 学习笔记-重学HTML-浏览器API

## HTML的定义
HTML 来源与XML与SGML,或者说是XML与SGML的子集。  
SGML中的DTD是用于定义子集也就是定义XML与HTML的格式一种规范  
[DTD定义文档地址](http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd)
XHTML与HTML不同之处在于XHTML是一种严格模式的HTML  

**需要注意：**    
文档中定义nbsp来表示空格，通常不推荐这种写法，因为会造成分词的问题，推荐使用CSS中white-space来显示空格  

## HTML标签语义
aside: 则边栏
main: 主体内容，一个页面只有一个main标签
article: 文章
hx: 标题
hgroup: 标题集合 主标题和子标题结合 子元素只能是hx
p: 段落
abbr: 标记一个缩写
strong: 加粗效果，表示重点内容
em: 加粗效果，表示读音上的强调
li: 列表的每一项
ol: 有序列表
ul: 无须列表
nav: 导航
div: 独立区域
dfn: 特殊语句或短语的定义
pre: 格式文本通常用于显示 源代码
code: 计算机代码
footer: 文档或者文章的页脚内容
header: 文档或者文章的介绍内容

## HTML的语法
+ `<tagname></tagname>` 普通节点
+ text 文本节点
+ `<!--comments-->` 注释节点
+ `<!Doctype html>` 文档类型声明节点 只能有一个
+ `<?a 1?>` ProcessingInstruction 预处理节点 很少见
+ `<![CDATA[]]>` CDATA 文本另一种表达 

## DOM树结构图
![DOM结构](https://blog-images-file.oss-cn-beijing.aliyuncs.com/week/Node.png)

## 浏览器DOM API
浏览器DOM API用于处理节点信息，以及事件相关

### 1.导航类API

**Node 节点导航** 会包含Node中所有节点例如 文本节点注释节点  
+ parentNode: 父节点
+ childNodes: 所有子节点
+ firstChild: 首页子节点
+ lastChild: 最后一个子节点
+ nextSibling: 下一个邻居节点
+ previousSibling: 上一个邻居节点

**Element 节点导航** 只会包含元素节点  
+ parentElement: 父元素
+ children: 子元素
+ firstElementChild: 第一个子元素
+ lastElementChild: 最后一个子元素
+ nextElementSibling: 下一个邻居元素
+ previousElementSibling: 上一个邻居元素

**修改操作**  
+ appendChild: 增加子节点
+ insertBefore: 插入节点
+ removeChild: 移除子节点
+ replaceChild: 替换子节点

**高级操作**  
+ compareDocumentPosition 用于比较两个节点中关系的函数
+ contains: 检查一个节点是否包含另一个节点的函数
+ isEqualNode: 检查两个节点是否完全相同
+ isSameNode: 检查两个节点是否是同一个节点，实际在javascript中可以用 `===` 比较
+ cloneNode: 复制一个节点，如果传入参数true 则会连同子元素做深拷贝

### 2.事件类API

事件API的语法 `target.addEventListener(type, listener [, options])`;
* type: 事件名字
* listener: 事件函数
* options: 为true或者false 表示事件模式是扑获还是冒泡 true为扑获
* options: 为对象 { captrue:事件模式, once:是否响应一次, passive: 阻止默认行为}

一个元素可以增加多个相同事件

**事件冒泡和扑获**  
任何事件是都是先有扑获过程才会有冒泡过程

### 3.Range API（重点）
强大的Node 操作 API，用于更精细的操作节点，例如操作半个节点，操作批量节点
* var range = new Range() 创建range对象
* range.setStart(element, 9) 设置起点
* range.setEnd(element, 4) 设置终点
* var range = document.getSelection().getRangeAt(0) 选中一个范围
* range.setStartBefore 将起点设置在某个节点之前
* range.setEndBefore 将终点设置在某个节点之后
* range.setStartAfter 将起点设置在节点之后
* range.setEndAfter 将终点设置在节点之后
* range.selectNode 选中一个节点
* range.selectNodeContents 选中一个节点的所有内容
* var fragment = range.extractContents() 取出range中选取的内容 相当于删除
* range.insertNode(document.createTextNode("aa")) 在range中插入一个节点 相当于增加

### 案例：使用Range进行元素倒序
```html
<div id="a">
    <span>1</span>
    <div>2</div>
    <a>3</a>
    <p>4</p>
</div>
<script>
let ele = document.getElementById('a');
function reverseChildren(ele) {
    let range = new Range();
    // 选中节点
    range.selectNodeContents(ele);
    
    // 取出节点子节点
    let fg = range.extractContents();
    let l = fg.childNodes.length;
    while(l-- > 0) {
        // 倒序
        fg.appendChild(fg.childNodes[l]);
    }
    ele.appendChild(fg);
}
reverseChildren(ele)
</script>
```

## CSSOM
document.styleSheets

### 1.Rules对象
* document.styleSheets[0].cssRules 获取style
* document.styleSheets[0].insertRule('xxx', 0) 插入style代码
* document.styleSheets[0].removeRule(0) 移除style
* CSSStyleRule
* CSSCharsetRule
* CSSImportRule
* CSSFontFaceRule
* CSSMediaRule
* CSSPageRule
* CSSNamesspaceRule
* CSSKeyframesRule
* CSSKeyframeRule
* CSSSupportsRule
* ......

#### 1.1 CSSStyleRule
* selectorText string 选择器
* style k-v 样式代码 key-value结构

#### 1.2 getComputedStyle(重点)
window.getComputedStryle(el, pseudoElt);
* el: 选择的元素
* pseudoElt: 可选，伪元素 可以获取伪元素的一些属性

## CSSOM View (BOM API)
视图相关API
### 1.window
* window.innerHeight 浏览器HTMl实际显示高度
* window.innerWidth 浏览器HTML实际显示宽度
* window.outerWidth 浏览器窗口总共暂用的宽度 不常用
* window.outerHeight 浏览器窗口总共暂用的高度 不常用
* window.devicePixelRatio 物理像素比 DPR
* window.screen
    * window.screen.width 实际屏幕宽度
    * window.screen.height 实际屏幕高度
    * window.screen.availWidth 屏幕可用宽度
    * window.screen.availHeight 屏幕可用高度
* window.open("about:blank", "_blank", "width=100,height=100,left=100,right=100") 打开新的浏览器窗口
* moveTo(x, y) 改变窗口位置
* moveBy(x, y) 改变窗口位置
* resizeTo(x, y) 改变窗口尺寸
* resizeBy(x, y) 改变窗口尺寸

### 2.Scroll 
滚动条API
* scrollTop
* scrollLeft
* scrollWidth 可滚动内容最大宽度
* scrollHeight 可滚动内容最大高度
* scroll(x, y) 滚动指定位置
* scrollBy(x, y) 在当前基础上滚动位置差值
* scrollIntoView() 滚动到可见区域
* window.scrollX window下的滚动API
* window.scrollY
* window.scroll(x, y)
* window.scrollBy(x, y)

### 3.Layout (重点)
* element.getClientRects() 获取元素所有的盒模型
* element.getBoundingClientRect() 获取包含区域

## 其他API
API来源的标准组织
* khronos
    * WebGL
* ECMA
    * ECMAScript
* WHATWG
    * HTML
* W3C
    * web audio
    * web animation
    * CG/WG
