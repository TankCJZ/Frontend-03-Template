## 组件化的学习一
组件化开发方式是为了更好实现代码的复用，组件化是前端框架里面重要组成部分。

### 组件的基本概念和组成
了解组件基本结构之前先看下我们熟悉的对象的基本结构

#### 对象基本结构：
由属性、方法、继承组成   
* Properties (属性)
* Methods (方法)
* Inherit (继承)

#### 属性的基本结构
* Properties (属性)
* Methods (方法)
* Inherit (继承)
* Attribute (属性 | 特性)
* Config & State (配置和状态)
* Event (事件)
* Lifecycle (组件生命周期)
* Children (子组件)


**总的来说组件的结构是在对象的结构上增加更多的特性，因此更适合用来描述UI.** 

#### Properties 和 Attribute
> Properties 与 Attribute 非常相似，当时还是会有细微的区别，
> 一般来说 Attribute 强调描述性,而Property强调从属关系。

在HTML中attribute 和 Property的表现方式：    
```html
Attribute:
<div name="v"><div>

Property:
div.name = 'xxx';
```
#### Lifecycle 
组件生命周期，created 和 destroyed 是必不可少的，表示创建和销毁事件，当然不同的设计者会增加一些其他生命周期函数   
例如Vue 中就增加了更细致的事件： beforeMount, mounted, update beforeCreated beforeDestroyed ...   

## 组件系统环境搭建
接下来就是开始组件环境的搭建，我们会介绍vue 和 react 两种风格的搭建   
### JSX 组件开发环境
安装`webpack webpack-cli @babel/core @babel/preset-env babel-loader @babel/plugin-transform-react-jsx`   

```javascript
// package.json
{
  "name": "jsx",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "@babel/core": "^7.11.1",
    "@babel/preset-env": "^7.11.0",
    "@babel/plugin-transform-react-jsx": "^7.10.4",
    "babel-loader": "^8.1.0",
    "webpack": "^4.44.1",
    "webpack-cli": "^3.3.12"
  }
}
```
配置`webpack.config.js`:   
```javascript
module.exports = {
    entry: './main.js',
    mode: "development",
    module: {
      rules: [
        {
          test: /\.js$/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ["@babel/preset-env"],
              plugins: ["@babel/plugin-transform-react-jsx"]
            }
          }
        }
      ]
    }
};
```
> @babel/plugin-transform-react-jsx 插件是关键，用来编译jsx的

编译成功后/dist/main.js中出现：   
`eval("var a = /*#__PURE__*/React.createElement(\"div\", null);\n\n//# sourceURL=webpack:///./main.js?");`

### JSX 基本使用
`@babel/plugin-transform-react-jsx`默认会调用`React.createElement`方法来编译`jsx`代码，我们不需要使用React我们需要定义自己的`createElement`函数,在webpack.config.js修改plugins配置项的值为如下，表示使用`createElement`来编译`jsx`:   
```javascript
module.exports = {
    entry: './main.js',
    mode: "development",
    module: {
      rules: [
        {
          test: /\.js$/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ["@babel/preset-env"],
              plugins: [
                ["@babel/plugin-transform-react-jsx", { pragma: "createElement" }]
              ]
            }
          }
        }
      ]
    }
};
```
接着`main.js`中定义`createElement`函数   
```javascript
//main.js
function createElement() {
  return;
}

let a = <div id="nams">
  <span>1</span>
  <span>2</span>
</div>;

```
在`chrome`浏览器中`Sources-webpack://./main.js`编译结果：   
```javascript
function createElement() {
  return;
}

var a = createElement("div", {
  id: "nams"
}, createElement("span", null, "1"), createElement("span", null, "2"));

```
> `html`代码将使用`createElement`函数来创建.
