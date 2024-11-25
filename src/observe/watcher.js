import Dep, { popStack, pushStack } from "./dep";


let id = 0;

class Watcher{// 不同的的组件有不同的watcher
    constructor(vm,exprOrFn,options,cb){
        this.id = id++;

        this.renderWatcher = options;// 标识是一个渲染watcher
       
        if(typeof exprOrFn === 'string'){
            this.getter = function(){
                return vm[exprOrFn];
            }
        }else{
            this.getter = exprOrFn;// getter会发生取值操作
        }

        this.deps = [];
        this.depsId = new Set();

        this.lazy = options.lazy;
        this.dirty = this.lazy;// 缓存值
        this.vm = vm;

        this.cb = cb;
        this.user = options.user;// 标识是否是用户watcher

        this.value = this.lazy ? undefined : this.get();
    }

    get(){
        // Dep.target = this;// 静态属性，只有一份
        pushStack(this);
        let value = this.getter.call(this.vm);// 会去vm上取值，vm._update(vm._render())
        // Dep.target = null;// 渲染完毕后就清空
        popStack();
        return value;
    }

    depend(){
        let i = this.deps.length;
        while(i--){
            this.deps[i].depend();
        }
    }

    addDep(dep){
        let id = dep.id;
        if(!this.depsId.has(id)){
            this.deps.push(dep);
            this.depsId.add(id);
            dep.addSub(this);// watcher已经记住了dep并且已经去重，此时让dep记住watcher即可
        }
    }

    evaluate(){
        this.value = this.get();// 获取到用户的返回值，并且标识为脏
        this.dirty = false;
    }

    update(){// 执行更新
        // this.get();// 重新渲染
        if(this.lazy){
            // 如果是计算属性，依赖的值变化了，就标识计算属性更新了
            this.dirty = true
        }else{
            queueWatcher(this);// 把当前的watcher保存起来
        }
    }

    run(){
        let oldValue = this.value;// 计算之前的值，为老值
        // 重新执行get获取的值为新值
        let newValue = this.get();// 真正执行渲染
        if(this.user){
            this.cb.call(this.vm,oldValue,newValue);// 如果是watch，执行回调
        }
    }
}



// notify更新操作（异步）
let queue = [];
let has = {};
let pending = false;// 防抖

function flushSchedulerQueue(){
    let flushQueue = queue.slice(0);
    queue = [];
    has = {};
    pending = false;
    flushQueue.forEach(q=>q.run());

}

function queueWatcher(watcher){
    const id = watcher.id;
    if(!has[id]){
        queue.push(watcher);
        has[id] = true;

        // 不管update执行多少次，最终只会有一轮刷新操作
        if(!pending){
            nextTick(flushSchedulerQueue,0);
            pending = true;
        }
    }
}


let callbacks = [];
let waiting = false;
function flushCallBacks(){
    let cbs = callbacks.slice(0);
    waiting = false;
    callbacks = [];
    cbs.forEach(cb=>cb());
}

// vue中nextTick 没有直接使用某个api 而是采用优雅降级的方式
//内部先采用的是promise(ie不兼容) Mutation0bserver 可以考虑ie专享的 setImmediate
// 使异步更新方案能兼容各种浏览器
let timerFunc;
if(Promise){
    timerFunc = ()=>{
        Promise.resolve().then(flushCallBacks);
    }
}else if(MutationObserver){
    let observer = new MutationObserver(flushCallBacks);// 这里回调是异步执行的
    let textNode = document.createTextNode(1);
    observer.observe(textNode,{
        characterData:true,
    });
    timerFunc = ()=>{
        textNode.textContent = 2;
    }
}else if(setImmediate){
    setImmediate(flushCallBacks);
}else{
    timerFunc = ()=> {
        setTimeout(flushCallBacks);
    }
}

export function nextTick(cb){
    callbacks.push(cb);
    if(!waiting){
        // setTimeout(()=>{
        //     flushCallBacks();
        // },0)
        timerFunc();
        waiting = true;
    }
}


export default Watcher