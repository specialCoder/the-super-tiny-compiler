/**
 * So now we have our AST, and we want to be able to visit different nodes with
 * a visitor. We need to be able to call the methods on the visitor whenever we
 * encounter a node with a matching type.
 *
 *   traverse(ast, {
 *     Program(node, parent) {
 *       // ...
 *     },
 *
 *     CallExpression(node, parent) {
 *       // ...
 *     },
 *
 *     NumberLiteral(node, parent) {
 *       // ...
 *     },
 *   });
 */
function traverser(ast, visitor) {
    // å¤çæ°ç»
    function traverseArray(array, parent) {
      array.forEach(child => {
        traverseNode(child, parent);
      });
    }
    // å¤çåä¸ª
    function traverseNode(node, parent) {
      let methods = visitor[node.type];
      //enter
      if (methods && methods.enter) {
        // è°ç¨è®¿é®èæ¨¡å¼éé¢çæ¹æ³
        methods.enter(node, parent);
      }
      // åºå«å¤çä¸äºäºæ
      switch (node.type) {
        case "Program":
          traverseArray(node.body, node);
          break;
        case "CallExpression":
          traverseArray(node.params, node);
          break;
        case "NumberLiteral":
        case "StringLiteral":
          break;
        default:
          throw new TypeError(node.type);
      }
      // exit
      if (methods && methods.exit) {
        methods.exit(node, parent);
      }
    }
    traverseNode(ast, null);
  }
  
  export default traverser;
  