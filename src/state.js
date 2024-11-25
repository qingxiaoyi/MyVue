import Dep from './observe/dep.js';
import { observe } from './observe/index.js'
import Watcher from './observe/watcher.js';

export function initState(vm){
    const opts = vm.$options; // 获取用户的选项

    // if(opts.props){
    //     initProps(vm, opts.props);
    // }

    if(opts.data){
        initData(vm);
    }

    if(opts.computed){
        initComputed(vm);
    }

    if(opts.watch){
        initWatch(vm);
    }
}

function initWatch(vm){
    let watch = vm.$options.watch;

    for(let key in watch){
        const handler = watch[key];

        if(Array.isArray(handler)){
            for(let i=0;i<handler.length;i++){
                createWatcher(vm,key,handler[i]);
            }
        }else{
            createWatcher(vm,key,handler);
        }
    }
}

function createWatcher(vm,key,handler){
    if(typeof handler === 'string'){
        handler = vm[handler]
    }
    return vm.$watch(key,handler);
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


function initComputed(vm){
    const computed = vm.$options.computed;
    const watchers = vm._computedWatchers = {};

    for(let key in computed){
        let userDef = computed[key];
        // 将属性和watcher对应起来
        let fn = typeof userDef === 'function' ? userDef : userDef.get;
        watchers[key] = new Watcher(vm,fn,{lazy:true});
        defineComputed(vm,key,userDef);
    }
}

function defineComputed(target,key,userDef){
    const setter = userDef.set || (()=>{});

    Object.defineProperty(target,key,{
        // get: typeof userDef === 'function' ? userDef : userDef.get,
        get: createComputedGetter(key),
        set: setter,
    })
}

// 计算属性根本不会收集依赖，只有让自己依赖属性去收集依赖
function createComputedGetter(key){
    // 需要监测是否执行这个getter
    return function(){
        const watcher = this._computedWatchers[key];
        if(watcher.dirty){
            // 如果是脏，就去调用用户的函数
            watcher.evaluate();
        }

        // 计算属性出栈后，还要渲染watcher
        // 让计算属性watcher里的属性，也去收集上一层的依赖
        if(Dep.target){
            watcher.depend();
        }
        return watcher.value;
    }
}