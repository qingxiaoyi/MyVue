import { parseHTML } from './parse'

function genProps(attrs){
    let str = '';
    for(let i = 0; i < attrs.length; i++){
        let attr = attrs[i];

        if(attr.name === 'style'){
            let obj = {};
            attr.value.split(';').forEach(item => {
                let [key, value] = item.split(':');
                if(typeof value == 'string'){
                    value = value.trim()
                }
                obj[key] = value;
            });
            attr.value = obj;
        }
        str += `${attr.name}:${JSON.stringify(attr.value)},`;
    }
    return `{${str.slice(0,-1)}}`
}

function genChildren(children){
    return children.map(child => gen(child)).join(',');
}

const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;// 用于匹配{{}}
function gen(node){
    if(node.type === 1){
        return codegen(node);
    }else{
        let text = node.text;
        if(!defaultTagRE.test(text)){
            return `_v('${text}')`
        }else{
            let tokens = [];
            let match
            defaultTagRE.lastIndex = 0;
            let lastIndex = 0;
            while(match = defaultTagRE.exec(text)){
                let index = match.index;
                if(index > lastIndex){
                    tokens.push(JSON.stringify(text.slice(lastIndex, index)));
                }
                tokens.push(`_s(${match[1].trim()})`);
                lastIndex = index + match[0].length;
            }
            if(lastIndex < text.length){
                tokens.push(JSON.stringify(text.slice(lastIndex)));
            }
            return `_v(${tokens.join('+')})`
        }
    }
}

function codegen(ast){
    let children = ast.children;
    let code = (`_c('${ast.tag}',${ast.attrs.length > 0 ? genProps(ast.attrs) : null},${children.length > 0 ? genChildren(children) : ''})`)

    return code;
}


export function compileToFunction(template){
    //1.就是将template 转化成ast语法树

    let ast = parseHTML(template); // 解析html模板
    console.log('ast',ast);

    //2.生成render方法(render方法返回的结果就是 虚拟D0M)
    // codegen(ast); // 生成render方法
    let code = codegen(ast);

    console.log(code,'code');
    // 模板引擎的实现原理就是with + new Function
    let render = new Function(`with(this){return ${code}}`);

    return render;
}