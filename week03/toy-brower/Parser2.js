// HTML解析 | 用token构建DOM树 课堂代码
const EOF = Symbol("EOF"); // 定义结束状态
let currentToken = null; // 当前token
let currentAttribute = null; // 当前属性对象

let stack = [{type: "document", children: []}]; // 定义栈

// 处理token
function emit(token) {
  if (token.type === "text") {
    return;
  }
  let top = stack[stack.length - 1];

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

    // 建立父子关系
    top.children.push(element);
    element.parent = top;

    if (!token.isSelfClosing) {
      stack.push(element);
    }

    currentToken = null;

  } else if (token.type === 'endTag') {
    if (top.tagName !== token.tagName) {
      throw new Error("Tag start end doesn't match!");
    } else {
      stack.pop();
    }
    currentToken = null;

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
    // emit({
    //   type: 'startTag',
    //   tagName: '',
    // });
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
    currentToken[currentAttribute.name] = currentAttribute.value;
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

}