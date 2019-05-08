const Tools = {
    // 异步函数的串行、并行、及类似Promise.all()的封装 暂未加入容错处理
    queue: () => {
        const list = []; // 队列
        let index = 0;   // 索引
        let task = 0;
        let cache;

        // next 方法控制索引
        const next = () => {
            if (index >= list.length - 1) return;

            // 索引 + 1
            const cur = list[++index];
            cur(next);
        };

        // 判断是否全部完成
        const then = (callback) => {

            if (callback) {
                cache = callback;
            }
            if (task > list.length - 1) {
                cache();
            }
            task++;
        };

        // 二次封装为合适的异步函数
        const async = (fn) => {
            return (next) => {
                fn(next);
            };
        };

        // 添加任务
        const add = (...asyncQueue) => {
            const cbQueue = asyncQueue.map(fn => async(fn));
            list.push(...cbQueue);
        };

        // 异步串行执行
        const runAsync = () => {
            const cur = list[index];
            typeof cur === 'function' && cur(next);
        };

        // 同步并行执行
        const run = () => {
            list.forEach(fn => fn());
        };

        // 全部执行完成
        const runAll = function () {
            list.forEach(fn => fn(then));
            return this;
        };

        // 返回一个对象
        return {
            add,
            runAsync,
            run,
            runAll,
            then
        }
    },

    // 遍历一颗标准Tree结构
    mapTree: (tree, action) => {
        if (!tree || !tree.children) {
            return false
        }
        action(tree);
        tree.children.forEach(function (item) {
            tree(item, action);
        });
    },

    // 数组扁平化
    flatten: (arr) => String(arr).split(',').map(item => Number(item)),

    // 一维数组转二维数组
    group: (array, subGroupLength, index = 0, newArray = []) => {
        while (index < array.length) {
            newArray.push(array.slice(index, index += subGroupLength));
        }
        return newArray;
    },

    // 数组转迭代器对象
    iterator: (arr) => {
        let index = 0;
        return {
            next: function () {
                return index < arr.length ? {value: arr[index++], done: false} : {value: undefined, done: true};
            }
        }
    },

    /**
     * 函数节流
     * @param fn        频繁触发的函数   type Function
     * @param delay     延迟            type Number
     * @param limit     必触发时间限制   type Number
     */
    throttle: (fn, delay = 300, limit = 1000) => {
        let timer = null;
        let previous = null;
        let result;

        return () => {
            // 记录当前时刻
            let now = +new Date();
            // 记录上次开始时间
            !previous && (previous = now);
            // 达到限制时间手动触发一次函数执行
            if (now - previous > limit) {
                // 绑定this和event对像
                result = fn.apply(this, arguments);
                // 重置上一次开始时间为本次结束时间
                previous = now;
            } else {
                // 限制在规定时间内重复触发无效
                clearTimeout(timer);
                timer = setTimeout(() => {
                    fn.apply(this, arguments)
                }, delay);
            }
            return result;
        }
    },

    /**
     * 函数防抖
     * @param   fn        频繁触发的函数   type Function
     * @param   delay     延迟           type Number
     * @param   immediate 是否立即触发一次 type Boolean
     */
    debounce: (fn, delay = 300, immediate = false) => {
        let timer = null;
        let now = true;
        let result;
        return () => {
            clearTimeout(timer);
            // 如果设置立即触发则立即触发
            if (immediate) {
                // 如果是第一次 则立即触发
                if (now) {
                    result = fn.apply(this, arguments);
                    now = false;
                } else {
                    timer = setTimeout(() => {
                        // 绑定this和event对象
                        fn.apply(this, arguments)
                    }, delay);
                }
            } else {
                // 如果没设置立即触发则按延时触发
                timer = setTimeout(() => {
                    fn.apply(this, arguments)
                }, delay);
            }
            return result
        };
    }
};

export default Tools;
