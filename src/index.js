import { initMixin } from './init'
import { initLifecycle } from './lifecycle'


function Vue(options){// options是用户的选项
    this._init(options)
}

initMixin(Vue);// 扩展了init方法
initLifecycle(Vue)// 扩展了生命周期方法

export default Vue