const ncname =`[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`;
const qnamecapture =`((?:${ncname}\\:)?${ncname})`;
const startTagOpen = new RegExp(`^<${qnamecapture}`); // 标签开始
const endTag = new RegExp(`^<\\/${qnamecapture}[^>]*>`);// 标签结束
const attribute = /^\s*([^\s<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>]+)))?/; 
const startTagClose=/^s*(\/?)>/; // <div><br/>
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;

// vue3不是采用正则，而是每个字符进行匹配

/**
 * 解析html
 * 思路：解析一段就删除一段，直至没有能解析的数据
 */


export function parseHTML(html){
     /**
     * 解析到标签、文本、结尾时的处理函数
     * 最终要生成一颗抽象语法树
     * 利用栈来实现，类似于括号匹配
     */
    const ELMENTTYPE = 1;
    const TEXTTYPE = 3;
    const stack = [];// 用于存放元素
    let currentParent;// 栈顶指针
    let root;

    function createASTElement(tag, attrs){
        return {
            tag,
            type: ELMENTTYPE,
            children: [],
            attrs,
            parent: null
        }
    }

    function start(tag,attrs){
        // console.log('开始',tag,attrs);
        let node = createASTElement(tag, attrs);
        if(!root){
            root = node;
        }
        if(currentParent){
            node.parent = currentParent;
            currentParent.children.push(node);
        }
        stack.push(node);
        currentParent = node;
    }
    function chars(text){
        // console.log('文本',text);
        text = text.replace(/\s/g,'');
        text && currentParent.children.push({
            type: TEXTTYPE,
            text,
            parent: currentParent
        });
    }
    function end(tag){
        // console.log('结束',tag);
        stack.pop();
        currentParent = stack[stack.length-1];
    }



    /**
     * 解析HTML主体代码
     */
    function advance(n){// 向前移动n个字符(刪除)
        html = html.substring(n);
    }

    function parseStartTag(){
        const start = html.match(startTagOpen); // 匹配开始标签
        if(start){
            const match = {
                tagName: start[1],
                attrs: []
            }
            advance(start[0].length);


            let end, attr;
            while(!(end = html.match(startTagClose)) && (attr = html.match(attribute))){
                advance(attr[0].length);
                match.attrs.push({
                    name: attr[1],
                    value: attr[3] || attr[4] || attr[5] || true
                })
            }
    
            if(end){
                advance(end[0].length);
            }
            return match;
        }

        return false;// 不是开始标签
    }

    while(html){// 一定是<开始
        // 如果textEnd 为0 说明是一个开始标签或者结束标签
        // 如果textEnd >@说明就是文本的结束位置
        let textEnd = html.indexOf('<');
        if(textEnd == 0){
            const startTagMatch = parseStartTag();

            if(startTagMatch){// 解析到的开始标签
                start(startTagMatch.tagName, startTagMatch.attrs);
                continue;
            }

            let endTagMatch = html.match(endTag);
            if(endTagMatch){// 解析到的结束标签
                end(endTagMatch[1]);
                advance(endTagMatch[0].length);
                continue;
            }
        }

        if(textEnd > 0){// 解析文本内容
            let text = html.substring(0, textEnd);
            if(text){
                chars(text);
                advance(textEnd);
            }
        }
    }

    return root;
}