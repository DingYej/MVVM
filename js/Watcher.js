// 观察者模式的目是满足给需要变化的那个元素增加一个观察者, 当数据变化后进行对应的方法
class Watcher {
    constructor(vm, expr, cb) {
        this.vm = vm;
        this.expr = expr;
        this.cb = cb;
        // 先获取老值
        this.value = this.get();
    };
    // 获取老值
    getVal(vm, expr) { //获取实例对应的数据
        expr = expr.replace(/^\s*|\s*$/g, "");
        expr = expr.split('.');
        return expr.reduce((prev, next) => { // vm.$data=>prev
            return prev[next]
        }, vm.$data)
    };
    get() {
        Dep.target = this;
        let value = this.getVal(this.vm, this.expr);
        // Dep.target = null;
        console.log("更新")
        return value;
    };
    // 更新 获取新值
    update() {
        let newValue = this.getVal(this.vm, this.expr);
        let oldValue = this.value;
        if (newValue != oldValue) {
            this.cb(newValue) //watch的callback
        };

    }
}