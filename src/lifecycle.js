import Watcher from "./observe/watcher";
import { createElement, createTextNode } from "./vdom/index";

/**
 * 创建真实节点
 */
function createElm(vnode){
    let {tag,props,children,text} = vnode;
    if(typeof tag === 'string'){
        vnode.el = document.createElement(tag);
        patchProps(vnode.el,props)
        children.forEach(child=>{
            vnode.el.appendChild(createElm(child));
        })
    }else{// 文本节点
        vnode.el = document.createTextNode(text);
    }
    return vnode.el
}

function patchProps(el,props){
    for(let key in props){
        if(key === 'style'){
            for(let styleName in props.style){
                el.style[styleName] = props.style[styleName];
            }
        }else{
            el.setAttribute(key,props[key]);
        }
    }
}

function patch(oldVNode,vnode){
    const isRealNode = oldVNode.nodeType;
    if(isRealNode){
        const elm = oldVNode;// 获取到真实元素
        const parentElm = elm.parentNode;// 获取父元素

        let newElm = createElm(vnode);
        parentElm.insertBefore(newElm,elm.nextSibling);
        parentElm.removeChild(elm);

        return newElm;
    }else{
        // diff算法
    }
}

export function initLifecycle(Vue) {
    Vue.prototype._update = function(vnode) {// 将虚拟dom转化成真实dom   
        const vm = this;
        const el = vm.$el;
        //既有初始化功能，又有更新功能
        vm.$el = patch(el,vnode);
    }

    Vue.prototype._render = function() {
        const vm = this;
        return vm.$options.render.call(vm);// render内部的this设置为vm
    }
    // render函数内部的函数
    Vue.prototype._c = function(){
        return createElement(this,...arguments)
    }
    Vue.prototype._v = function(){
        return createTextNode(this,...arguments)
    }
    Vue.prototype._s = function(value){
        if(typeof value == 'object') return value
        return JSON.stringify(value)
    }

}

export function mountComponent(vm,el) {
    vm.$el = el
    // 1.调用render方法，生成虚拟dom

    const updateComponent = function(){
        vm._update(vm._render());
    }
    const watcher = new Watcher(vm,updateComponent,true);// true标识是一个渲染watcher
    console.log('watcher',watcher);

    // 2.根据虚拟dom生成真实dom

    
    // 3.将真实dom挂载到el上
}


//vue核心流程 1、创造力响应式数据；2、模板转换成ast语法树
// 3、将ast语法树转换成render函数 4、后续每次数据更新可以只执行render函数（无需再次执行ast转化的过程）

// render函数会产生虚拟节点（使用响应式数据）
// 根据生成的虚拟节点创造真实dom