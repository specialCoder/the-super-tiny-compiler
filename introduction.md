# 介绍
今天我们将一起实现一个编译器。但是不是像其他编译器一样...这只是一个超级小巧的编译器！这个编译器小到去除注释只有大约200行真正的代码。
我们打算编译一些lisp样式的函数调用到C样式函数的调用。
如果你没有见过类似的函数，我将会给你一个快速浏览。

如果你有两个函数：add和substract，他们长这样：

math         |LISP                       | C                             
-------------|---------------------------|------------------------------
2 + 2        |(add 2 2)                  | add(2,2)                       
4 - 2        |(substract 4 2)            | substract(4, 2)               
2 + (4 - 3)  |(add 2 (substract 4 2 ))   | add(2, substract(4, 2))       


是不是很简单？</br>
那好，这就是我们打算实现的编译器。虽然这既不是一个完整的LISP或C语法，但它足以说明现代编译器的许多主要部分。
实现一个编译器的步骤
几乎所有的编译器实现都是分三步：**解析、转换和代码生成**
 

1. 解析就是把一行具体的代码转换成抽象的内容
2. 转换就是把抽象出来的表示和操作去做一些针对性的处理
3. 代码生成将转化抽象的内容来生成新的代码

## 解析
解析通常分为两个阶段：词法分析和句法分析。
词法分析采用原始代码并通过称为标记器（或词法分析器）的东西将它分成这些称为标记的东西。标记是一个微小的小对象数组，描述了一段孤立的语法。它们可以是数字，标签，标点符号，运算符等等。
语法分析采用标记并将它们重新格式化为表示语法的每个部分及其相互关系的表示。这称为中间表示或抽象语法树。
抽象语法树（简称AST）是一个深度嵌套的对象，它以易于使用的方式表示代码并告诉我们大量信息。
就像下面的代码：
```js
(add 2 (subtract 4 2))
```

标记可能长这样：
```js
[
  { type: 'paren',  value: '('        },
  { type: 'name',   value: 'add'      },
  { type: 'number', value: '2'        },
  { type: 'paren',  value: '('        },
  { type: 'name',   value: 'subtract' },
  { type: 'number', value: '4'        },
  { type: 'number', value: '2'        },
  { type: 'paren',  value: ')'        },
  { type: 'paren',  value: ')'        },
]
```
抽象语法树长这样：

```js
{
  type: 'Program',
  body: [{
    type: 'CallExpression',
    name: 'add',
    params: [{
      type: 'NumberLiteral',
      value: '2',
    }, {
      type: 'CallExpression',
      name: 'subtract',
      params: [{
        type: 'NumberLiteral',
        value: '4',
      }, {
        type: 'NumberLiteral',
        value: '2',
      }]
    }]
  }]
}
```

## 转换
编译器的下一个阶段是转换。同样，这只是从最后一步获取AST并对其进行更改。它可以用同一种语言操作AST，也可以将它翻译成一种全新的语言。
让我们来看看我们如何转换AST。
您可能会注意到我们的AST中包含的元素看起来非常相似。这些对象具有type属性。这些中的每一个都称为AST节点。这些节点在它们上定义了描述树的一个孤立部分的属性。
我们有个NumberLiteral节点：
```js
{
  type: 'NumberLiteral',
  value: '2',
}
```

或者我们有一个CallExpression节点：
```js
{
  type: 'CallExpression',
  name: 'subtract',
  params: [
    // nested nodes go here...
  ],
}
```


在转换AST时，我们可以通过添加/删除/替换属性来操作节点，我们可以添加新节点，删除节点，或者我们可以单独保留现有AST并基于它创建一个全新的AST。
由于我们的目标是新语言，因此我们将专注于创建一个特定于目标语言的全新AST

## 遍历

为了浏览所有这些节点，我们需要能够遍历它们。此遍历过程首先进入AST深度优先级中的每个节点：
```js
{
  type: 'Program',
  body: [{
    type: 'CallExpression',
    name: 'add',
    params: [{
      type: 'NumberLiteral',
      value: '2'
    }, {
      type: 'CallExpression',
      name: 'subtract',
      params: [{
        type: 'NumberLiteral',
        value: '4'
      }, {
        type: 'NumberLiteral',
        value: '2'
      }]
    }]
  }]
}
```

所以对于上面的AST语法树，我们可以：
>1. 程序 - 从AST的顶层开始
>2. CallExpression（add） - 移动到程序正文的第一个元素
>3. NumberLiteral（2） - 移动到CallExpression的参数的第一个元素
>4. CallExpression（substract） - 移动到CallExpression参数的第二个元素
>5. NumberLiteral（4） - 移动到CallExpression参数的第一个元素
>6. NumberLiteral（2） - 移动到CallExpression的参数的第二个元素


如果我们直接操作这个AST，而不是创建一个单独的AST，我们可能会在这里介绍各种抽象。但只是访问树中的每个节点就足够了。
我使用“访问”一词的原因是因为存在如何在对象结构的元素上表示操作的这种模式。

## 访问者
这里的基本思想是我们将创建一个“访问者”对象，该对象具有接受不同节点类型的方法。
```js
var visitor = {
  NumberLiteral() {},
  CallExpression() {},
};
```
当我们遍历我们的AST语法树的时候，每当我们进入一个类型匹配的节点，我们将在访问者上调用这些类型方法。
为了使这个有用，我们还将传递节点和对父节点的引用。
```js
var visitor = {
  NumberLiteral(node, parent) {},
  CallExpression(node, parent) {},
};
```
但是，也存在在“exist”上调用方法的可能性。想象一下我们以前的列表形式的树结构：

当我们遍历下去，发现无法结束。当我们完成对树上每个分支的访问后，我们“退出”它。因此，在我们“进入”每个节点之后，还要返回我们的“退出”信息。

为了支持这个，最终访问者长这样：
```js
var visitor = {
  NumberLiteral: {
    enter(node, parent) {},
    exit(node, parent) {},
  }
};
```


## 代码生成
编译器的最后阶段是代码生成。有时编译器会做与转换重叠的事情，但在大多数情况下代码生成只意味着我们将AST和string-ify代码退出。
代码生成器以多种不同的方式工作，一些编译器将重用前面的标记，其他编译器将创建一个单独的代码表示，以便它们可以线性打印节点，但从我能说的最多将使用我们刚创建的相同的AST，这是我们将要关注的内容。
实际上，我们的代码生成器将知道如何“打印”AST的所有不同节点类型，并且它将递归地调用自身来打印嵌套节点，直到将所有内容打印到一长串代码中。

------------------------------------------------------------
And that's it! That's all the different pieces of a compiler.
Now that isn't to say every compiler looks exactly like I described here. Compilers serve many different purposes, and they might need more steps than I have detailed.
But now you should have a general high-level idea of what most compilers look like.
Now that I've explained all of this, you're all good to go write your own compilers right?
Just kidding, that's what I'm here to help with :P
So let's begin...
