// 词法分析
/**
 * 我们将开始解析的第一阶段：用标记器做词法分析
 * 我们仅仅是把代码字符串拆成由标记组成的数组
 * (add 2 substract(4 2)) => [{type:'paren',value:'('}...]
 */
/**
 * 
 * @param {string} input 
 */
function tokenizer(input){
    //current来跟踪光标位置
    let current = 0;
    //tokens表示token数组
    let tokens = [];
    // 我们创建while循环来更新current
    //在内部循环中变量会增加
    //我们这样做是因为我们可能希望在一次循环内内多次增加`current`
    // 因为我们的标记可以是任意长度
    while(current < input.length){
        // 获取当前光标下的内容
        let char = input[current];
        // "("
        if(char === '('){
            tokens.push({
                type:'paren',
                value:'('
            });
            current++;
            continue;
        }
        // ")"
        if(char === ')'){
            tokens.push({
                type:'paren',
                value:')'
            });
            current++;
            continue;
        }
        // whitespace 跳过
        let WHITESPACE = /\s/;
        if(WHITESPACE.test(char)){
            current++;
            continue;
        }
        // number
        let NUMBERS = /[0-9]/;
        if(NUMBERS.test(char)){
            let value = '';
            // 继续查找，直到不为number
            // 记录下这一串数字
            while(NUMBERS.test(char)){
                value+=char;
                char = input[++current]
            }
            tokens.push({
                type:'number',
                value
            });
            continue;
        }
        // ""
        if(char === '"'){
            let value = '';
            // 继续查找，直到找到另一个"
            // 记录下这一串字符串
            char = input[++current];
            while(char !== '"'){
                value += char;
                char = input[++current];
            } 
            // 跳过另一个"
            char = input[++current];
            tokens.push({
                type:'string',
                value
            });
            continue;
        }
        // letters
        const LETTERS = /[a-z]/i;
        if(LETTERS.test(char)){
            let value = '';
            // 继续查找，直到不为number
            // 记录下这一串数字
            while(LETTERS.test(char)){
                value+=char;
                char = input[++current]
            }
            tokens.push({
                type:'string',
                value,
            });
            continue;
        }
        // 否则
        throw new TypeError('I dont know what this character is: ' + char);
    }
    return tokens;
}

export default tokenizer;