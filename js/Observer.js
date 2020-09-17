class Observer {
    constructor(data) {
        this.observer(data)
    }
    observer(data) {

            //要对这个data数据将原有的属性改成get和set的形式
            if (!data || typeof data !== "object") {
                return;
            }
            // 要将数据=>劫持 获取到data的key和value
            Object.keys(data).forEach(key => {
                this.defineRwactive(data, key, data[key]);
                this.observer(data[key]); // 递归
            })
        }
        // 响应式
    defineRwactive(obj, key, value) {
        let that = this;
        let dep = new Dep(); // 每个变化的数据 都会对应一个数组 这个数组是存放所以更新的操作
        Object.defineProperty(obj, key, {
            get() { // 当时的值
                Dep.target && dep.addSub(Dep.target);
                return value;
            },
            set(newValue) { //改变后的值
                if (newValue != value) {
                    that.observer(newValue); //如果是对象继续劫持
                    value = newValue;
                    dep.notify(); // 通知所有人 数据更新了
                };
            },

        })
    }
}

class Dep {
    constructor() {
        // 订阅的数组
        this.subs = []
    }
    addSub(watcher) {
        this.subs.push(watcher)
    }
    notify() {
        this.subs.forEach(watcher => watcher.update())
    }
}