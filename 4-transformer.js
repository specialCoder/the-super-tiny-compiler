import traverser from "./3-traverser";

/**
 * Next up, the transformer. Our transformer is going to take the AST that we
 * have built and pass it to our traverser function with a visitor and will
 * create a new ast.
 *
 * ----------------------------------------------------------------------------
 *   Original AST                     |   Transformed AST
 * ----------------------------------------------------------------------------
 *   {                                |   {
 *     type: 'Program',               |     type: 'Program',
 *     body: [{                       |     body: [{
 *       type: 'CallExpression',      |       type: 'ExpressionStatement',
 *       name: 'add',                 |       expression: {
 *       params: [{                   |         type: 'CallExpression',
 *         type: 'NumberLiteral',     |         callee: {
 *         value: '2'                 |           type: 'Identifier',
 *       }, {                         |           name: 'add'
 *         type: 'CallExpression',    |         },
 *         name: 'subtract',          |         arguments: [{
 *         params: [{                 |           type: 'NumberLiteral',
 *           type: 'NumberLiteral',   |           value: '2'
 *           value: '4'               |         }, {
 *         }, {                       |           type: 'CallExpression',
 *           type: 'NumberLiteral',   |           callee: {
 *           value: '2'               |             type: 'Identifier',
 *         }]                         |             name: 'subtract'
 *       }]                           |           },
 *     }]                             |           arguments: [{
 *   }                                |             type: 'NumberLiteral',
 *                                    |             value: '4'
 * ---------------------------------- |           }, {
 *                                    |             type: 'NumberLiteral',
 *                                    |             value: '2'
 *                                    |           }]
 *  (sorry the other one is longer.)  |         }
 *                                    |       }
 *                                    |     }]
 *                                    |   }
 * ----------------------------------------------------------------------------
 */
import traverser from './3-traverser';

const visitor = {
    NumberLiteral:{
        enter(node,parent){
            parent._context.push({
                type:'NumberLiteral',
                value:node.value
            })
        }
    },
    StringLiteral:{
        enter(node,parent){
            parent._context.push({
                type:'StringLiteral',
                value:node.value
            })
        }
    },
    CallExpression:{
        enter(node,parent){
            let expression={
                type:'CallExpression',
                callee:{
                    type:'Identifier',
                    name:node.name
                },
                arguments:[],
            }
            node._context = expression.arguments;
            if(parent.type !== 'CallExpression'){
                expression = {
                    type: 'ExpressionStatement',
                    expression: expression,
                  };
            }
            parent._context.push(expression);
        }
    }
}

function transformer(ast){
     // new AST
    let newAst = {
        type:'Program',
        body:[]
    }

    // 依赖ast 结构来生成 新的ast
    ast._context = newAst.body;
    traverser(sat,visitor);
    return newAst;
 }

 export default transformer;