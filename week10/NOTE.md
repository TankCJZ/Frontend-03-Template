# 第十周-如何使用LL算法构建语法树(AST)

（AST）语法树的构建过程也称作语法分析可以分为以下两步：
* 分词：将编程语言代码分词
* 语法树：将分词结果层层嵌套起来形成一颗语法树结构
* 运行：构建好的语法树进行解析执行

整个语法树构建构成有两种算法实现比较著名 **LL算法** **LR算法**  

我们从一个四则运算开始：   
### 词法定义
四则运算产生式词法
* TokenNumber:  0-9数字组合
* Operator: 运算符 + - * /之一
* Whitespace: 空格 <SP>
* LineTerminator: 行开始或结束<LF> <LR>
### 语法定义
```
<Expression>::=   
    <AdditiveExpression><EOF>

<AdditiveExpression>::=   
    <MultiplicativeExpression>
    |<AdditiveExpression><+><MultiplicationExpression>
    |<AdditiveExpression><-><MultiplicationExpression>

<MultiplicativeExpression>::=
    <Number>
    |<MultiplicativeExpression><*><Number>
    |<MultiplicativeExpression></><Number>
```
### LL语法分析
```
// 加法LL语法分析定义
<AdditiveExpression>::=
    <MultiplicativeExpression>
    |<AdditiveExpression><+><MultiplicativeExpression>
    |<AdditiveExpression><-><MultiplicativeExpression>
// 四则LL语法定义
<AdditiveExpression>::=
    <Number>
    |<MultiplicativeExpression><*><Number>
    |<MultiplicativeExpression></><Number>
    |<AdditiveExpression><+><MultiplicativeExpression>
    |<AdditiveExpression><-><MultiplicativeExpression>
```
### 代码实现词法分析-正则
```html
<script>
    // 四则词法分析过程-第一版
    const regex = /([0-9\.]+)|([ \t]+)|([\r\n]+)|(\*)|(\/)|(\+)|(\-)/g;
    const dictionary = ['Number', 'Whitespace', 'LineTerminator', '*', '/', '+', '-'];


    function tokenize(source) {
        let result = null;
        while(true) {
            result = regex.exec(source);
            if (!result) {
                break;
            }
        
            for (let i = 1; i <= dictionary.length; i++) {
                if (result[i]) {
                    console.log(dictionary[i - 1]);
                }
            }
            console.log(result);
        }
    }

    tokenize('1024 * 10 * 25');
</script>
```
```html
<script>
    // 四则词法分析过程-第一版
    const regex = /([0-9\.]+)|([ \t]+)|([\r\n]+)|(\*)|(\/)|(\+)|(\-)/g;
    const dictionary = ['Number', 'Whitespace', 'LineTerminator', '*', '/', '+', '-'];


    function* tokenize(source) {
        let result = null;
        let lastIndex = 0;
        while(true) {
            lastIndex = regex.lastIndex;
            result = regex.exec(source);

            if (!result) {
                break;
            }
            if (regex.lastIndex - lastIndex > result[0].length) {
                break;
            }
            let token = {
                type: null,
                value: null,
            };

            for (let i = 1; i <= dictionary.length; i++) {
                if (result[i]) {
                    token.type = dictionary[i - 1];
                }
            }
            token.value = result[0];
            yield token;
        }
        yield {
            type: 'EOF',
        }
    }

    for(let token of tokenize('1024 + 10 * 25')) {
        console.log(token);
    }

</script>
```
![图片](https://blog-images-file.oss-cn-beijing.aliyuncs.com/week/10/QQ%E6%88%AA%E5%9B%BE20201002230817.png)

### LL语法分析
词法分析完成后开始语法分析实现
乘法实现：   
```html
 let source = [];

for(let token of tokenize('10 * 25 / 2')) {
    console.log(token);
    // 过滤非数字和非运算符
    if (token.type !== 'Whitespace' && token.type !== 'LineTerminator') {
        source.push(token);
    }
}
function MultiplicativeExpression(source) {
    if (source[0].type === 'Number') {
        let node = {
            type: 'MultiplicativeExpression',
            children: [source[0]],
        };
        source[0] = node;
        return MultiplicativeExpression(source);
    }

    if (source[0].type === 'MultiplicativeExpression' && source[1] && source[1].type === '*') {
        let node = {
            type: 'MultiplicativeExpression',
            operator: '*',
            children: [],
        };
        node.children.push(source.shift());
        node.children.push(source.shift());
        node.children.push(source.shift());
        source.unshift(node);
        return MultiplicativeExpression(source);   
    }
    if (source[0].type === 'MultiplicativeExpression' && source[1] && source[1].type === '/') {
        let node = {
            type: 'MultiplicativeExpression',
            operator: '/',
            children: [],
        };
        node.children.push(source.shift());
        node.children.push(source.shift());
        node.children.push(source.shift());
        source.unshift(node);
        return MultiplicativeExpression(source);
    }
    if (source[0].type === 'MultiplicativeExpression') {
        return source[0];
    }
    return MultiplicativeExpression(source);

}

```
加法运算：   
```html
// 加法
function AdditiveExpression(source) {
    if (source[0].type === 'MultiplicativeExpression') {
        let node = {
            type: 'AdditiveExpression',
            children: [source[0]],
        };
        source[0] = node;
        return AdditiveExpression(source);
    }
    if (source[0].type === 'AdditiveExpression' && source[1] && source[1].type === '+') {
        let node = {
            type: 'AdditiveExpression',
            operrator: '+',
            children: [],
        };
        node.children.push(source.shift());
        node.children.push(source.shift());
        MultiplicativeExpression(source);
        node.children.push(source.shift());
        source.unshift(node);
        return AdditiveExpression(source);
    }
    if (source[0].type === 'AdditiveExpression' && source[1] && source[1].type === '-') {
        let node = {
            type: 'AdditiveExpression',
            operator: '-',
            children: []
        };
        node.children.push(source.shift());
        node.children.push(source.shift());
        MultiplicativeExpression(source);
        node.children.push(source.shift());
        source.unshift();
        return AdditiveExpression(source);
    }
    if (source[0].type === 'AdditiveExpression') {
        return source[0];
    }
    MultiplicativeExpression(source);
    return AdditiveExpression(source);

}
```
封装Expression:   
```html
function Expression(tokens) {
    if (source[0].type === 'AdditiveExpression' && source[1] && source[1].type === 'EOF') {
        let node = {
            type: 'Expression',
            children: [source.shift(), source.shift()]
        };
        source.unshift(node);
        return node;
    }
    AdditiveExpression(source);
    return Expression(source);
}
```

调用Expression(source):   
console.log(Expression(source));
![运行结果](https://blog-images-file.oss-cn-beijing.aliyuncs.com/week/10/QQ%E6%88%AA%E5%9B%BE20201004155705.png)