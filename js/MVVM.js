class MVVM {
    constructor(options) {
        //  把可用的东西挂载到实例上
        this.$el = options.el;
        this.$data = options.data;

        // 如果有编译的模板就开始编译
        if (this.$el) {
            // 用数据和元素进行编译
            new Compile(this.$el, this);
            // 数据劫持 把所有属性改成get和set方法
            new Observer(this.$data)
        }
    }
}