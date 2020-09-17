class Compile {
    constructor(el, vm) {
        this.el = this.isEementNode(el) ? el : document.querySelector(el);
        this.vm = vm;
        if (this.el) {
            // 如果这个元素能获取到 我们才能编译
            // 1. 先把这些真实的Dom移入到内存中 fragment
            let fragment = this.node2fragment(this.el);
            // 2. 编译 => 提取想要的元素节点  v-model 和文本节点 {{}}
            this.Compile(fragment);
            // 3. 把编译好的fragment再放回到页面
            this.el.appendChild(fragment)
        }
    };
    /*专门写一些辅助的方法*/
    // 检测节点
    isEementNode(node) {
        return node.nodeType === 1
    };
    isDirective(name) { // 判断是不是指令
        return name.includes("v-")
    };
    /* 核心代码 */
    compileElement(node) {
        // 编译 v-
        let attrs = node.attributes; // 获取元素的属性
        Array.from(attrs).forEach(attr => {
            // 判断属性名字包含v-
            let attrName = attr.name;
            if (this.isDirective(attrName)) {
                // 取对应的值
                let expr = attr.value;
                // 截取属性的v-
                let [, type] = attrName.split("-");
                // node this.vm.$data expr
                CompileUtil[type](node, this.vm, expr);
            }
        })
    };
    compileText(node) {
        // 编译 {{}}
        let expr = node.textContent; // 取文本中的内容
        let reg = /\{\{([^}]+)\}\}/g;
        if (reg.test(expr)) {
            CompileUtil["text"](node, this.vm, expr);
        }
    };
    Compile(fragment) {
        // 递归
        let childNodes = fragment.childNodes;
        Array.from(childNodes).forEach(node => {
            if (this.isEementNode(node)) {
                // 元素节点
                this.compileElement(node); // 编译元素
                this.Compile(node); // 递归 子元素
            } else {
                // 文本节点
                this.compileText(node) // 编译文本
            }
        })
    };
    node2fragment(el) { // 需要将el中的内容全部放到内存中
        // 文档碎片
        let fragment = document.createDocumentFragment();
        let firstChild;
        while (firstChild = el.firstChild) {
            fragment.appendChild(firstChild)
        }
        return fragment; //内存中的节点
    }
}

CompileUtil = {
    getVal(vm, expr) { //获取实例对应的数据
        expr = expr.replace(/^\s*|\s*$/g, "");
        expr = expr.split('.');
        return expr.reduce((prev, next) => { // vm.$data=>prev
            return prev[next]
        }, vm.$data)
    },
    getTextVal(vm, expr) {
        return expr.replace(/\{\{([^}]+)\}\}/g, (...arguments) => {
            return this.getVal(vm, arguments[1])
        })
    },
    text(node, vm, expr) { //文本处理
        let updateFn = this.updater['textUpdater'];
        let value = this.getTextVal(vm, expr);
        expr.replace(/\{\{([^}]+)\}\}/g, (...arguments) => {
            // 数据变化 调用watch的callback
            new Watcher(vm, arguments[1], (newValue) => {
                // 如果数据变化了 文本节点需要重新获取依赖的属性更新文本中的内容
                updateFn && updateFn(node, this.getTextVal(vm, expr))
            });
        })

        // 判断有没有这个函数
        updateFn && updateFn(node, value)
    },
    model(node, vm, expr) { //input处理
        let updateFn = this.updater['modelUpdater'];
        // 数据变化 调用watch的callback
        new Watcher(vm, expr, (newValue) => {
            updateFn && updateFn(node, this.getVal(vm, expr))
        });
        console.log("触发")
            // 判断有没有这个函数
        updateFn && updateFn(node, this.getVal(vm, expr))
    },
    updater: {
        // 文本更新
        textUpdater(node, value) {
            node.textContent = value
        },
        // input更新
        modelUpdater(node, value) {
            console.log("111")
            node.value = value
        }
    }
}