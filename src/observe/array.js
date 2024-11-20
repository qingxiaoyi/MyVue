/**
 * 重写数组中的部分方法
 */

// 获取数组的原型
let oldArrayProto = Array.prototype

let newArrayProto = Object.create(oldArrayProto)

let methods = [ // 找到所有变异方法
    'push',
    'pop',
    'shift',
    'unshift',
    'splice',
    'sort',
    'reverse',
]// concat slice 都不会改变原数组，所以不需要重写

methods.forEach(method => {
    newArrayProto[method] = function (...args) {// 重写方法
        // 内部调用原方法
        const result = oldArrayProto[method].call(this,...args)

        //对新增的数据再次劫持
        let inserted;
        let ob = this.__ob__;
        switch (method) {
            case 'push':
            case 'unshift':
                inserted = args;
                break;
            case 'splice':
                inserted = args.slice(2);
                break;
            case'sort':
            case'reverse':
            default:
                break;
        }

        if (inserted) {
            ob.observeArray(inserted)
        }

        ob.dep.notify();// 数组变化了，通知watcher进行更新

        return result
    }
})

export default newArrayProto