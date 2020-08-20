const css = require('css');
const Layout = require('./Layout.js');
const EOF = Symbol("EOF"); // 定义结束状态
let currentToken = null; // 当前token
let currentAttribute = null; // 当前属性对象
let currentTextNode = null; // 当前文本节点

let stack = [{type: "document", children: []}]; // 定义栈


let rules = []; //存放style规则表
// 处理 style 规则
function addCSSRules(text) {
  let ast = css.parse(text);
  rules.push(...ast.stylesheet.rules);
}

// 计算css 优先级
function specificity(selector) {
  let p = [0, 0, 0, 0];
  let selectorParts = selector.split(' ')
  for (let part of selectorParts) {
    if (part.charAt(0) === '#') {
      p[1] += 1
    } else if (part.charAt(0) === '.') {
      p[2] += 1
    } else {
      p[3] += 1
    }
  }
  return p
}

function compare(sp1, sp2) {
  if (sp1[0] - sp2[0]) {
    return sp1[0] - sp2[0]
  }
  if (sp1[1] - sp2[1]) {
    return sp1[1] - sp2[1]
  }
  if (sp1[2] - sp2[2]) {
    return sp1[2] - sp2[2]
  }
  return sp1[3] - sp2[3]
}

// 计算css
function computeCSS(element) {
  let elements = stack.slice().reverse()
  if (!element.computedStyle) {
    element.computedStyle = {}
  }


  for (let rule of rules) {
    let selectorParts = rule.selectors[0].split(' ').reverse();

    // 复合选择器
    // let matchReg = rule.selectors[0].match(/^[a-zA-Z]{1}[a-zA-Z0-9]*|\.[a-zA-Z]{1}[a-zA-Z0-9]*|#[a-zA-Z0-9]+$/g);
    // if (matchReg && matchReg.length > 1) {
    //   if (Array.from(matchReg).every(selector => match(element, selector)) === false) {
    //     continue;
    //   }
    // }

    // 先匹配了当前元素，所以后面j为1
    if (!match(element, selectorParts[0])) {
      continue;
    }

    let matched = false;

    let j = 1;
    for (let i = 0; i < elements.length; i++) {
      // elements[i]是element的祖先元素
      if (match(elements[i], selectorParts[j])) {
        j++;
      }
    }

    if (j >= selectorParts.length) {
      matched = true;
    }

    if (matched) {
      let sp = specificity(rule.selectors[0])
      let computedStyle = element.computedStyle
      for (let declaration of rule.declarations) {
        if (!computedStyle[declaration.property]) {
          computedStyle[declaration.property] = {};
        }
        if (!computedStyle[declaration.property].specificity) {
          computedStyle[declaration.property].value = declaration.value;
          computedStyle[declaration.property].specificity = sp
        } else if (compare(computedStyle[declaration.property].specificity, sp) < 0) {
          computedStyle[declaration.property].value = declaration.value
          computedStyle[declaration.property].specificity = sp
        }
      }
    }
  }
}


// 匹配 支持简单选择器 .element #element element
function match(element, selector) {
  if (!selector || !element.attributes) {
    return false;
  }

  if (selector.charAt(0) === "#") {
    let attr = element.attributes.filter(attr => attr.name === 'id')[0];
    if (attr && attr.value === selector.replace("#", "")) {
      return true;
    }
  } else if (selector.charAt(0) === ".") {
    let attr = element.attributes.filter(attr => attr.name === 'class')[0]
    if (attr && attr.value === selector.replace('.', '')) {
      return true;
    }
  } else {
    if (element.tagName === selector) {
      return true;
    }
  }
  return false;
}

// 处理token
function emit(token) {
 
  let top = stack[stack.length - 1];

  // 开始节点处理
  if (token.type === 'startTag') {
    let element = {
      type: 'element',
      children: [],
      attributes: [],
    };

    // 处理标签名
    element.tagName = token.tagName;

    // 处理属性
    for (const p in token) {
      if (p !== 'type' && p !== 'tagName') {
        element.attributes.push({
          name: p,
          value: token[p],
        });
      }
    }
    
    // 计算css
    computeCSS(element);

    // 建立父子关系
    top.children.push(element);
    //element.parent = top;

    if (!token.isSelfClosing) {
      stack.push(element);
    }

    currentTextNode = null;

  } else if (token.type === 'endTag') {
    // 结束节点
    if (top.tagName !== token.tagName) {
      throw new Error("Tag start end doesn't match!");
    } else {
      //=========处理 style 标签样式==========//
      if (top.tagName === 'style') {
        addCSSRules(top.children[0].content);
      }
      // 处理布局
      Layout(top);
      stack.pop();
    }
    currentTextNode = null;

  } else if (token.type === 'text') {
    // 文本节点
    if (currentTextNode === null) {
      currentTextNode = {
        type: 'text',
        content: ''
      };
      top.children.push(currentTextNode);
    }
    currentTextNode.content += token.content;
  }

}

// 状态机 初始状态
function data(c) {
  if (c === '<') {
    // 开头标签
    return tagOpen;
  } else if (c === EOF) {
    // 结束状态
    emit({
      type: 'EOF'
    });
    return;
  } else {
    // 文本节点
    emit({
      type: 'text',
      content: c,
    });
    return data;
  }
}

// 开头标签的状态 <
function tagOpen(c) {
  if (c === '/') {
    // 标签结束<div> </
    return endTagOpen;
  } else if (c.match(/^[a-zA-Z]$/)) {
    // 标签名状态 
    currentToken = {
      type: 'startTag',
      tagName: '',
    };
    return tagName(c);
  } else {
    return;
  }
}

// 结尾标签 状态
function endTagOpen(c) {
  if (c.match(/^[a-zA-Z]$/)) {
    // 结尾标签 标签名状态
    currentToken = {
      type: 'endTag',
      tagName: '',
    };
    return tagName(c);
  } else if (c === '>') {
    // 异常
  } else if (c === EOF) {
    // 异常
  } else {
    
    // 异常
  }
}

// 标签名状态
function tagName(c) {
  if (c.match(/^[\t\n\f ]$/)) {
    // 属性名开始 状态
    return beforeAttributeName;
  } else if (c === '/') {
    // 自封闭标签状态 <html/>
    return selfClosingStartTag;
  } else if (c.match(/^[a-zA-Z]$/)) {
    // 继续标签名字 状态
    // 追加tagName
    currentToken.tagName += c;
    return tagName;
  } else if (c === '>') {
    // 普通开头标签 结束状态
    emit(currentToken);
    return data;
  } else {
    currentToken.tagName += c;
    return tagName;
  }
}

// 属性名 开始状态
function beforeAttributeName(c) {
  if (c.match(/^[\t\n\f ]$/)) {
    // 下一个属性
    return beforeAttributeName;
  } else if (c === '/' || c === '>' || c === EOF) {

    return afterAttributeName(c);
  } else if (c === '=') {
    // 异常
  } else {
    // 创建属性
    currentAttribute = {
      name: '',
      value: ''
    };
    return attributeName(c);
  }
}

// 属性名 结束状态
function afterAttributeName(c) {
  if (c.match(/^[\t\n\f ]$/)) {
    return afterAttributeName;
  } else if (c === '/') {
    return selfClosingStartTag;
  } else if (c === '=') {
    return beforeAttributeValue;
  } else if (c === '>') {
    currentToken[currentAttribute.name] = currentAttribute.value;
    emit(currentToken);
    return data;
  } else if (c === EOF) {

  } else {
    //currentToken[currentAttribute.name] = currentAttribute.value;
    currentAttribute = {
      name: '',
      value: '',
    };
    return attributeName(c);
  }
}

// 属性名 名称状态
function attributeName(c) {
  if (c.match(/^[\t\n\f ]$/) || c === '/' || c === '>' || c === EOF) {
    //属性名 结束状态
    return afterAttributeName(c);
  } else if (c === '=') {
    return beforeAttributeValue;
  } else if (c === '\u0000') {
    
  } else if (c === '\"' || c === "'" || c === '<') {
    // 属性值状态
  } else {
    // 属性名追加
    currentAttribute.name += c;
    // 返回属性名状态
    return attributeName;
  }
}


//自封闭标签结束 状态
function selfClosingStartTag(c) {
  if (c === '>') {
    currentToken.isSelfClosing = true;
    return data;
  } else if (c === EOF) {
    // 异常
  } else {
    // 异常
  }
}

// 属性值 开始状态
function beforeAttributeValue(c) {
  if (c.match(/^[\t\n\f ]$/) || c === '/' || c === '>' || c === EOF) {
    return beforeAttributeValue;
  } else if (c === "\"") {
    return doubleQuotedAttributeValue;
  } else if (c === "\'") {
    return singleQuotedAttributeValue;
  } else if (c === '>') {
    // return data;
  } else {
    return unquotedAttributeValue(c);
  }
}

// 双引号 属性名开始状态
function doubleQuotedAttributeValue(c) {
  if (c === "\"") {
    // 设置属性值
    currentAttribute[currentAttribute.name] = currentAttribute.value;
    return afterQuotedAttributeValue;
  } else if (c === '\u0000') {

  } else if (c === EOF) {

  } else {
    currentAttribute.value += c;
    return doubleQuotedAttributeValue;
  }
}

// 单引号 属性名开始状态
function singleQuotedAttributeValue(c) {
  if (c === "\'") {
    // 设置属性值
    currentAttribute[currentAttribute.name] = currentAttribute.value;
    return afterQuotedAttributeValue;
  } else if (c === '\u0000') {

  } else if (c === EOF) {

  } else {
    currentAttribute.value += c;
    return singleQuotedAttributeValue;
  }
}

// 没有引号 属性名开始状态
function unquotedAttributeValue(c) {
  if (c.match(/^[\t\n\f ]$/)) {
    currentToken[currentAttribute.name] = currentAttribute.value;
    return beforeAttributeName;
  } else if (c === "/") {
    currentToken[currentAttribute.name] = currentAttribute.value;
    return selfClosingStartTag;
  } else if (c === '>') {
    currentToken[currentAttribute.name] = currentAttribute.value;
    emit(currentToken);
    return data;
  } else if (c === '\u0000') {

  } else if (c === "\"" || c === "'" || c === "<" || c === "=" || c === "`") {

  } else if (c === EOF) {

  } else {
    currentAttribute.value += c;
    return unquotedAttributeValue;
  }
}

// 结束属性值 状态
function afterQuotedAttributeValue(c) {
  if (c.match(/^[\t\n\f ]$/)) {
    return beforeAttributeName;
  } else if (c === "/") {
    return selfClosingStartTag;
  } else if (c === '>') {
    currentToken[currentAttribute.name] = currentAttribute.value;
    emit(currentToken);
    return data;
  } else if (c === EOF) {

  } else {
    currentAttribute.value += c;
    return doubleQuotedAttributeValue;
  }
}



// 解析HTML
module.exports.parseHTML = function parseHTML(html) {

  let state = data;
  for (const c of html) {
    state = state(c);
  }
  state = state(EOF);
  return stack[0];
}