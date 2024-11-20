import { initState } from './state'
import { compileToFunction } from './compiler/index'
import { mountComponent } from './lifecycle';


export function initMixin(Vue){// 给Vue增加init方法
    Vue.prototype._init = function(options){
        // 初始化操作
        const vm = this;
        vm.$options = options;// 将用户的选项挂载到实例上

        // 初始化状态
        initState(vm);

        if(options.el){
            vm.$mount(options.el);// 实现数据的挂载
        }

    }


    Vue.prototype.$mount = function(el){
        const vm = this;
        el = document.querySelector(el);
        let ops = vm.$options;

        if(!ops.render){// 先查看有没有render函数
            let template;// 没有render看下是否写了template，没写template采用外部的模板
            if(!ops.template&&el){// 没有写模板，但是写了el
                template = el.outerHTML;
            }else{
                if(el){
                    template = ops.template; // 如果有el，则采用模板的内容
                }
            }
 
            // 写了template，就用写了的template
            if(template){
                // 对模版编译
                const render = compileToFunction(template);// 将模板编译成render函数
                ops.render = render; // jsx最终会被编译成 h('xxx')
            }
        }

        // ops.render;
        mountComponent(vm,el); 
    }
}

