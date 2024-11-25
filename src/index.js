import { initMixin } from './init'
import { initLifecycle } from './lifecycle'
import Watcher from './observe/watcher';


function Vue(options){// options是用户的选项
    this._init(options)
}

initMixin(Vue);// 扩展了init方法
initLifecycle(Vue)// 扩展了生命周期方法


Vue.prototype.$watch = function(expOrfn,cb,options={}){
    // 值一变化，执行cb回调即可
    new Watcher(this,expOrfn,{user:true},cb)
}

export default Vue