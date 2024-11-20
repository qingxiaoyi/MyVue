import { observe } from './observe/index.js'

export function initState(vm){
    const opts = vm.$options; // 获取用户的选项

    // if(opts.props){
    //     initProps(vm, opts.props);
    // }

    if(opts.data){
        initData(vm);
    }
}

function proxy(vm,target,key){// 让data数据能够直接从实例上获取
    Object.defineProperty(vm,key,{
        get(){
            return vm[target][key];
        },
        set(newVal){
            vm[target][key] = newVal;
        }
    });
}

function initData(vm){
    let data = vm.$options.data;

    /**
     * 这里源代码是直接使用data.call(vm)
     * 我实现时若data为function执行之后仍旧是function，所以这里将data覆盖，以此得到data的返回值
     */
    typeof data === 'function'? data = data.call(vm) : data;

    vm._data = data;// 无论data是function还是object，都要处理成object绑定到vm实例上
    // 劫持数据，vue2采用 defineProperty
    observe(data);


    // 将vm._data用vm来代理就可以了
    for(let key in data){
        proxy(vm,'_data',key);
    }
}