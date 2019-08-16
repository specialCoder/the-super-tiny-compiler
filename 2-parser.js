function parser(tokens){
    // 光标current
    let current = 0;
    // 使用递归代替while循环
    // 定义递归函数walk
    function walk(){
        let token = tokens[current];
        // number
        if(token.type === 'number'){
            current++;
            return {
                type:'NumberLiteral',
                value:token.value
            }
        }
        // string
        if(token.type === 'string'){
            current++;
            return {
                type:'StringLiteral',
                value:token.value
            }
        }
        // paren "("
        if(token.type === 'paren' && token.value ==='('){
            // 跳过"(""
            token = tokens[++current];
            //
            let node={
                type:'CallExpression',
                name:token.value,
                params:[],
            }
            // 跳过第一个参数(即函数名)
            token = tokens[++current];
            //   (add 2 (subtract 4 2))
            //
            //   [
            //     { type: 'paren',  value: '('        },
            //     { type: 'name',   value: 'add'      },
            //     { type: 'number', value: '2'        },
            //     { type: 'paren',  value: '('        },
            //     { type: 'name',   value: 'subtract' },
            //     { type: 'number', value: '4'        },
            //     { type: 'number', value: '2'        },
            //     { type: 'paren',  value: ')'        }, <<< Closing parenhesis
            //     { type: 'paren',  value: ')'        }, <<< Closing parenhesis
            //   ]
            //
            // We're going to rely on the nested `walk` function to increment our
            // `current` variable past any nested `CallExpression`.

            // deep traverser
            while(token.type !== 'paren' || (token.type === 'paren'&&token.value!== ')')){
                node.params.push(walk());
                token = tokens[current];
            }
            // 跳过 ")"
            current++;
            return node;
        }

        throw new TypeError(token.type);
    }

    let AST = {
        type:'Program',
        body:[],
    }

    while(current < tokens.length){
        AST.body.push(walk());
    }
    return AST;
}
export default parser;
