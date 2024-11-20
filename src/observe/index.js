import newArrayProto from './array'
import Dep from './dep';

class Observer {
    constructor(data) {
        // Object.deineProperty只能劫持已经存在的属性（vue会为此单独写一些api $set $delete）

        /**
         * 给数据加上一个标识，如果数据上有__ob__属性，则说明已经被劫持过了
         * 但是在对象中增加__ob__后进入walk方法，会对__ob__进行监测，里边又会有walk导致进入死循环
         * 所以设置__ob__为一个隐藏属性，不可被枚举
         */

        let dep = new Dep();

        data.__ob__ = this;
        Object.defineProperties({
            value: this,
            enumerables: false,// 设置__ob__为一个隐藏属性，循环时不会被获取
        })
        if(Array.isArray(data)){
            // 对数组进行劫持：重写数组中的方法
            data.__proto__ = newArrayProto;// 重写数组原型
            this.observeArray(data);// 如果数组中监测的是对象，可以监控到对象的变化
        }else{
            this.walk(data);// 循环对象，对属性依次劫持
        }
    }

    walk(data) {// 循环对象，对属性依次劫持

        // 重新定义属性
        Object.keys(data).forEach(key => {
            defineReactive(data, key, data[key]);
        });
    }

    /**
     * 监测数组
     * 
     */
    observeArray(data){
        data.forEach(item => {
            observe(item);
        })
    }
}

//深层次嵌套会递归，递归多了性能差，不存在属性监控不到，存在的属性要重写方法vue3-> proxy
function dependArray(value){
    for(let i=0;i<value.length;i++){
        let current = value[i];
        current?.dep.depend();
        if(Array.isArray(current)){
            dependArray(current);
        }
    }
}


export function defineReactive(target, key, value) {// 闭包 属性劫持
    let childob = observe(key);// 如果仍旧是一个对象，则递归劫持 childOb.dep用来收集依赖

    let dep = new Dep();
    Object.defineProperty(target, key, {
        get() {// 取值的时候会执行get
            if(Dep.target){
                dep.depend();// 让这个属性的收集器记住当前的watcher
                if(childob){
                    childob.dep.depend();// 让数组和对象本身也能实现依赖收集
                    if(Array.isArray(value)){
                        dependArray(value);
                    }
                }
            }
            return value;
        },
        set(newValue) {// 赋值的时候会执行set
            if(newValue === value) return;
            observe(newValue);
            value = newValue;
            dep.notify();
        },
    })
}

export function observe(data) {
    // 对这个对象进行劫持

    if (typeof data!== 'object' || data === null) {
        return;// 只对对象进行劫持
    }

    // 如果一个对象被劫持过，则不再劫持
    // 判断一个对象是否被接触过，可以增添一个实例，用实例来判断是否被劫持过
    if (data.__ob__ instanceof Observer) {
        return data.__ob__;
    }

    return new Observer(data);
}