<!--
 * @Author: your name
 * @Date: 2020-09-24 13:56:03
 * @LastEditTime: 2020-11-24 14:56:26
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \week17\NOTE.md
-->
# 工具链-脚手架的开发
本周学习脚手架实现、webpack、Babel相关知识.

## 使用yo实现一个类似vue-cli脚手架

### 脚手架做了那些事？
`Vue-Cli`脚手架帮我们做了哪些事呢？我认为它做了三件事：   
* 接受用户输入的信息
* 创建项目`package.json`并且安装依赖
* 创建空项目(可以理解为：复制预先配置好的项目文件)

### 搭建脚手架项目环境
**创建项目**:   
新建项目`generator-vue-cli`,进入目录执行`npm init`,项目名必须`generator`开头,`vue-cli`为脚手架名字   
安装yo:   
```
npm install yeoman-generator --save-dev
npm install -g yo
```
**目录结构**:   
在`generator-vue-cli`目录下新建：   
```
├───package.json
└───generators/
    ├───app/
    │   └───index.js
    └───templates/      
```
> 必须按照上面目录结构创建文件    

### 接受用户输入的信息
```javascript
`Yeoman`提供了`prompt`方法来在命令行交互：   
// 1.获取用户输入信息
async getUserEnter() {
  // 获取用户输入的项目名
  const answers = await this.prompt([
    {
      type: "input",
      name: "name",
      message: "Your Vue project name",
    }
  ]);
  /// 保存用户输入的信息
  this.answers = answers;
  this.destinationRoot(this.answers.name);
}
```
运行效果:   
![交互](https://blog-images-file.oss-cn-beijing.aliyuncs.com/20201124/4.png)   
> `this.destinationRoot`配置目根目录.   


### 创建项目`package.json`并且安装依赖
```javascript
// 2.安装相关依赖创建package.json
async installPackage() {
  const pgkJSON = {
    name: this.answers.name,
    version: "1.0.0",
    main: "./src/index.js",
    license: "ISC",
    scripts: {
      build:"webpack",
      watch: "webpack --watch",
      dev: "webpack-dev-server --open"
    },
    devDependencies: {
      "webpack": "^4.35.2",
      "webpack-cli": "^3.3.6",
      "webpack-dev-server": "^3.7.2"
    },
    dependencies: {
    }
  };
  // 创建package.json
  this.fs.extendJSON(this.destinationPath('package.json'), pgkJSON);
  // 安装依赖 相当于执行了npm install 会安装package.json配置的包
  this.npmInstall();
  // 安装指定包 相当于执行了npm install vue
  this.npmInstall(["vue"], { "save-dev": false });
  // 安装指定包 相当于执行了npm install xxx --save-dev
  this.npmInstall(
    ["@babel/core", "@babel/preset-env", "babel-loader", "css-loader", "html-webpack-plugin", "style-loader", "vue-loader", "vue-template-compiler"],
    { "save-dev": true }
  );
}
```
### 复制模板文件
在`templates`准备好了我们的项目模板文件:   
![模板文件](https://blog-images-file.oss-cn-beijing.aliyuncs.com/20201124/3.png)   
模板文件就是已经搭建好的基于`webpack`的`Vue`开发环境。   

复制模板文件也很简单：   
```javascript
// 3.复制模板文件
async copyTemplateFiles() {
  this.fs.copyTpl(
    this.templatePath('public/index.html'),
    this.destinationPath('public/index.html'),
    {
      title: this.answers.name
    }
  );
  this.fs.copyTpl(
    this.templatePath('src/main.js'),
    this.destinationPath('src/main.js'),
  );
  this.fs.copyTpl(
    this.templatePath('src/App.vue'),
    this.destinationPath('src/App.vue'),
  );
  this.fs.copyTpl(
    this.templatePath('src/components/HelloWorld.vue'),
    this.destinationPath('src/components/HelloWorld.vue'),
  );
  this.fs.copyTpl(
    this.templatePath('webpack.config.js'),
    this.destinationPath('webpack.config.js'),
  );
}
```
> `copyTpl`接受两个参数，一个是模板文件路径和复制到项目的路径。   

### 完整代码
```javascript
var Generator = require('yeoman-generator');

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);
    this.answers = null;
  }
  // 1.获取用户输入信息
  async getUserEnter() {
    // 获取用户输入的项目名
    const answers = await this.prompt([
      {
        type: "input",
        name: "name",
        message: "Your Vue project name",
      }
    ]);

    this.answers = answers;
    this.destinationRoot(this.answers.name);
  }
  // 2.安装相关依赖创建package.json
  async installPackage() {
    const pgkJSON = {
      name: this.answers.name,
      version: "1.0.0",
      main: "./src/index.js",
      license: "ISC",
      scripts: {
        build:"webpack",
        watch: "webpack --watch",
        dev: "webpack-dev-server --open"
      },
      devDependencies: {
        "webpack": "^4.35.2",
        "webpack-cli": "^3.3.6",
        "webpack-dev-server": "^3.7.2"
      },
      dependencies: {
      }
    };
    // 创建package.json
    this.fs.extendJSON(this.destinationPath('package.json'), pgkJSON);
    this.npmInstall();
    this.npmInstall(["vue"], { "save-dev": false });
    this.npmInstall(
      ["@babel/core", "@babel/preset-env", "babel-loader", "css-loader", "html-webpack-plugin", "style-loader", "vue-loader", "vue-template-compiler"],
      { "save-dev": true }
    );
  }

  // 3.复制模板文件
  async copyTemplateFiles() {
    this.fs.copyTpl(
      this.templatePath('public/index.html'),
      this.destinationPath('public/index.html'),
      {
        title: this.answers.name
      }
    );
    this.fs.copyTpl(
      this.templatePath('src/main.js'),
      this.destinationPath('src/main.js'),
    );
    this.fs.copyTpl(
      this.templatePath('src/App.vue'),
      this.destinationPath('src/App.vue'),
    );
    this.fs.copyTpl(
      this.templatePath('src/components/HelloWorld.vue'),
      this.destinationPath('src/components/HelloWorld.vue'),
    );
    this.fs.copyTpl(
      this.templatePath('webpack.config.js'),
      this.destinationPath('webpack.config.js'),
    );
  }

};
```

### 使用脚手架
在非当前脚手架目录下执行`yo vue-cli`,输入项目名`vue-demo`：   
![使用脚手架](https://blog-images-file.oss-cn-beijing.aliyuncs.com/20201124/5.png)   
在`vue-demo`运行项目`npm run dev`：   
![运行项目](https://blog-images-file.oss-cn-beijing.aliyuncs.com/20201124/6.png)


## Webpack的基本使用
`Webpack`做了一个打包工具，帮助我们将代码模块打包成一个或者多个`bundle`。核心是`loader`和`plugin`的使用。`loader`帮助我们处理各种文件的转换，`plugin`则是提供了插件机制帮助我们使用插件处理
从一个`webpack.config.js`配置文件来看：  
```javascript
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const VueLoaderPlugin = require("vue-loader/lib/plugin");
const webpack = require("webpack");

// 导出一个webpack具有特殊属性配置的对象
module.exports = {
  mode: "none", // 指定模式配置："development" | "production" | "none"
  // 入口
  entry: "./src/main.js", // 入口模块文件路径
  // 出口
  output: {
    // path: './dist/', 错误的，要指定绝对路径
    path: path.join(__dirname, "./dist/"), //打包的结果文件生成的目录要是绝对路径
    filename: "[name].[hash].js",
  },
  module: {
    rules: [
      //配置转换规则
      {
        test: /\.css$/, // 注意，不要有单引号，正则表达 式，匹配 .css 文件资源
        use: [
          // 根据外国人的习惯来的顺序，而且顺序不要写错
          "style-loader", // js识别css
          "css-loader", // css 转换为 js
        ],
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: ["file-loader"],
      },
      // 解决兼容性问题
      {
        test: /\.m?js$/,
        exclude: /(node_modules)/, // 排除的目录
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"], // babel中内容的转换规则工具
          },
        },
      },
      // 2. 处理 .vue 单文件组件
      {
        test: /\.vue$/,
        loader: "vue-loader",
      },
    ],
  },
  // 配置插件
  plugins: [
    new HtmlWebpackPlugin({
      // 指定要打包的模板页面
      // 就会将 index.html 打包到与 bundle.js 所在同一目录下面，
      // 同时在 index.html 中会自动的使用script 标签引入bundle.js
      template: "./public/index.html",
    }),
    // 3. 请确保引入这个插件！
    new VueLoaderPlugin(),
    // 3. 配置热模块加载对象
    new webpack.HotModuleReplacementPlugin(),
  ],
  // 实时重新加载
  devServer: {
    // 目标路径
    contentBase: "./dist",
    // 2. 开启热模块加载,
    hot: true,
  },
};

```
## Babel的基本使用
Babel 是一个 JavaScript 编译器，其目的是将我们的`JavaScript`代码编译成向后兼容的 JavaScript 语法，它通过`Polyfill`的方式实现了一些新的语法，它可以单独使用，通常我们是配合webpack一起使用.
在`webpack`中使用`babel-loader`来编译`JavaScript`代码。