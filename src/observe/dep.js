let id = 0;

class Dep{
    constructor(){
        this.id = id++;
        this.subs = [];// 这里存放着当前属性对应的watcher有哪些
    }

    depend(){
        // 这里不希望放重复的watcher
        // this.subs.push(Dep.target)
        Dep.target.addDep(this);// 让watcher记住dep
    }

    addSub(Watcher){
        this.subs.push(Watcher);
    }

    notify(){
        this.subs.forEach(watcher => {
            watcher.update()
        })
    }
}

Dep.target = null;

let stack = [];

export function pushStack(watcher){
    stack.push(watcher);
    Dep.target = watcher;
}

export function popStack(){
    stack.pop();
    Dep.target = stack[stack.length - 1];
}

export default Dep