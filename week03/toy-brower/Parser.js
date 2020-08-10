const EOF = Symbol("EOF"); // 定义结束状态
let currentToken = null;

// 处理token
function emit(token) {
  console.log(token);
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
    emit({
      type: 'startTag',
      tagName: '',
    });
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
    return tagName;
  }
}

// 属性名 开始状态
function beforeAttributeName(c) {
  if (c.match(/^[\t\n\f ]$/)) {
    return beforeAttributeName;
  } else if (c === '>') {
    return data;
  } else if (c === '=') {
    return beforeAttributeName;
  } else {
    return beforeAttributeName;
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


// 解析HTML
module.exports.parseHTML = function parseHTML(html) {

  let state = data;
  for (const c of html) {
    state = state(c);
  }

  state = state(EOF);

}