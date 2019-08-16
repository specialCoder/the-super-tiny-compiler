function codeGenerator(node){
    switch(node.type){
        // program
        case 'Program':
            return node.body.map(codeGenerator).join('\n');
        // sup call
        case 'ExpressionStatement':
            return (
                codeGenerator(node.expression) +
                ';' // << (...because we like to code the *correct* way)
              );
        // sub call 
        case 'CallExpression':
            return (
                codeGenerator(node.callee) +
                '(' +
                node.arguments.map(codeGenerator)
                .join(', ') +
                ')'
            );
        // "(" ")"
        case 'Identifier':
            return node.name;
        // number
        case 'NumberLiteral':
            return node.value;
        // string
        case 'StringLiteral':
            return '"' + node.value + '"';
        default:
                throw new TypeError(node.type);
    }
}
export default codeGenerator;