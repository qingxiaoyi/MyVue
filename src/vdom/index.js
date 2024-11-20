/**
 * _c
 */
export function createElement(vm,tag,data,...children){
    if(data == null){
        data = {}
    }
    let key = data.key;
    if(key){
        delete data.key
    }
    return vnode(vm,tag,key,data,children)
}

/**
 * _v
 */
export function createTextNode(vm,text){
    return vnode(vm,undefined,undefined,undefined,undefined,text)
}

function vnode(vm,tag,key,props,children,text){
    return {
        vm,
        tag,
        key,
        props,
        children,
        text,
        // ...
    }
}