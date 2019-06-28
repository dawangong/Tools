const Tools = {
  // 异步函数的串行、并行、及类似Promise.all()的封装 暂未加入容错处理
  queue() {
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
  mapTree(tree, action) {
    if (!tree || !tree.children) {
      return false
    }
    action(tree.value);
    tree.children.forEach(item => this.mapTree(item, action));
  },

  // 数组扁平化
  flatten(arr) {
    while (arr.some(item => Array.isArray(item))) {
      arr = [].concat(...arr);
    }
    return arr;
  },

  // 一维数组转二维数组
  group(array, subGroupLength, index = 0, newArray = []) {
    while (index < array.length) {
      newArray.push(array.slice(index, index += subGroupLength));
    }
    return newArray;
  },

  // 数组转迭代器对象
  iterator(arr) {
    let index = 0;
    return {
      next: () => index < arr.length ? { value: arr[index++], done: false } : { value: undefined, done: true }
    }
  },

  /**
   * 函数节流
   * @param fn        频繁触发的函数    type Function
   * @param delay     延迟            type Number
   * @param limit     必触发时间限制   type Number
   */
  throttle(fn, delay = 300, limit = 1000) {
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
  debounce(fn, delay = 300, immediate = false) {
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
  },

  /**
   * 解除循环引用
   * @param object    循环引用对象
   * @param replacer  重构对象的回调函数
   * @returns {{_$}}  解除循环引用的占位对象
   */
  fixReference(object, replacer) {
    // 使用闭包和WeakMap对象的set、get嗅探重复的对象
    const objects = new WeakMap();
    // 传入需解除引用的对象和默认的终止引用占位
    const terminate = (value, path) => {

      // 识别并终止引用和重构重复对象
      let old_path;
      // 新子对象
      let _obj;

      // 回调函数,修改传入对象
      if (replacer !== undefined) {
        value = replacer(value);
      }

      // 排除基本类型、null、reg对象、date对象,反之直接return自身
      if (
        typeof value === 'object'
        && value !== null
        && !(value instanceof Boolean)
        && !(value instanceof Date)
        && !(value instanceof Number)
        && !(value instanceof RegExp)
        && !(value instanceof String)
      ) {

        // 尝试根据当前对象获取key对应的value
        old_path = objects.get(value);
        if (old_path !== undefined) {
          // 如果重复则返回重构的对象（old_path为重复对象WeakMap中存储的value）
          return { _$: old_path };
        }

        // 无重复则用当前对象设置key和对应的value
        objects.set(value, path);

        // 根据数组或对象不断递归每一个key,消除引用返回key对应的value或者_obj
        if (Array.isArray(value)) {
          _obj = [];
          // 键值和默认path拼接新的path
          value.forEach((item, index) => _obj[index] = terminate(item, `${path}[${index}]`));
        } else {
          _obj = {};
          Object.keys(value).forEach(key => _obj[key] = terminate(
            value[key],
            // 键值和默认path拼接新的path
            `${path}[${JSON.stringify(key)}]`
          ));
        }
        // return 重组后的子对象
        return _obj;
      }
      // return 自身
      return value;
    };

    return terminate(object, 'stop')
  },

  /**
   * 深拷贝
   * @param obj           被拷贝对象
   * @param fixReference  是否考虑循环引用
   * @returns {*}
   */
  cloneDeep(obj, fixReference) {
    let _obj = obj;
    if (fixReference) {
      _obj = this.fixReference(obj);
    }
    const cloneBase = (_obj) => {
      if (obj === null || typeof obj !== 'object') return obj;
      let newObj = _obj instanceof Array ? [] : {};
      for (let key in _obj) {
        if (_obj.hasOwnProperty(key)) {
          newObj[key] = typeof _obj[key] === 'object' ? cloneBase(_obj[key]) : _obj[key];
        }
      }
      return newObj;
    };
    return cloneBase(_obj)
  },
  // 函数记忆
  memorize(cb) {
    const cache = new Map();
    return function () {
      const key = JSON.stringify(arguments);
      if (cache.has(key)) {
        return cache.get(key)
      } else {
        const result = cb(arguments);
        cache.set(key, result);
        return result;
      }
    };
  },
  // 事件管理机制
  eventManage: {
    listener: {
      eventList: {},
      add(name, handle) {
        this.eventList[name] = handle
      },
      remove(name) {
        this.eventList[name] = null
      }
    },
    // 订阅事件
    subscribe(name, handle) {
      if (typeof name !== 'string' || typeof handle !== 'function') {
        throw new Error('param type error!')
      }
      this.listener.add(name, handle)
    },
    // 取消订阅
    unsubscribe(name) {
      this.listener.eventList[name] && this.listener.remove(name)
    },
    // 发布订阅
    broadcast({ name, params }) {
      if (!this.listener.eventList[name]) {
        throw new Error('no exist event!')
      }

      return this.listener.eventList[name](params) || {}
    },
    // 集体订阅
    registered(eventList) {
      for (let name in eventList) {
        if (eventList.hasOwnProperty(name)) {
          const handle = eventList[name].handle
          this.subscribe(name, handle)
        }
      }
    },
    // 发布所有订阅
    allBroadcast(eventList) {
      const result = [];
      for (let name in eventList) {
        if (eventList.hasOwnProperty(name)) {
          const { params, disable } = eventList[name];
          !disable && result.push({
            name: this.broadcast({
              name,
              params
            })
          })
        }
      }
      return result
    },
    // 串行发布
    queueBroadcast(eventList) {
      let cache = {};
      for (let name in eventList) {
        if (eventList.hasOwnProperty(name)) {
          const { params, disable } = eventList[name];
          Object.assign(params, cache);
          !disable && (cache = Object.assign(cache, this.broadcast({ name, params })))
        }
      }
      console.log(Object.keys(cache), 'cache params');
      return cache
    }
  }

};

export default Tools;
