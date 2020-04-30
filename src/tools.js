// 异步函数的串行、并行、及类似Promise.all()的封装 暂未加入容错处理
const queue = () => {
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
};
// tree原始数据转标准tree
const resetTree = originData => {
  if (!originData || originData.length === 0) return;

  for (let i = 0; i < originData.length; i++) {
    for (let j = 0; j < originData.length; j++) {
      if (originData[i].id === originData[j].pid) {
        originData[i].childern = originData[i].childern || [];
        originData[i].childern.push(originData[j]);
      }
    }
  }

  return originData.find(item => item.id === 0);
};
/**
 * 获取数组中极值项
 * @param arr
 * @param type
 * @returns {number}
 */
const getArrMax = (arr, type = 'max') => type === 'max' ? Math.max(...arr) : Math.min(...arr);
/**
 * 获取数组中极值项索引
 * @param arr
 * @param type
 * @returns {*}
 */
const getArrMaxIndex = (arr, type = 'max') => arr.indexOf(getArrMax(arr, type));
/**
 * 判断对象是否为空
 * @param obj
 * @returns {boolean} 不是对象返回都是false
 */
const isEmpty = obj => typeof obj === 'object' && obj !== null && Object.keys(obj).length === 0;
/**
 * 遍历一颗标准Tree结构
 * @param tree
 * @param action
 * @returns {boolean}
 */
const mapTree = (tree, action) => {
  if (!tree || !tree.children) {
    return false
  }
  action(tree.value);
  tree.children.forEach(item => this.mapTree(item, action));
};
// 数组扁平化
const flatten = arr => {
  while (arr.some(item => Array.isArray(item))) {
    arr = [].concat(...arr);
  }
  return arr;
};
// 一维数组转二维数组
const group = (array, subGroupLength, index = 0, newArray = []) => {
  while (index < array.length) {
    newArray.push(array.slice(index, index += subGroupLength));
  }
  return newArray;
};
// 数组转迭代器对象
const iterator = arr => {
  let index = 0;
  return {
    next: () => index < arr.length ? { value: arr[index++], done: false } : { value: undefined, done: true }
  }
};
/**
 * 函数节流
 * @param fn        频繁触发的函数    type Function
 * @param limit     必触发时间限制   type Number
 */
const throttle = (fn, limit = 1000) => {
  let previous = null;
  let result;

  return function () {
    let now = +new Date();
    !previous && (previous = now);
    if (now - previous > limit) {
      // eslint-disable-next-line
      result = fn.apply(this, arguments);
      previous = now
    }
    return result
  }
};
/**
 * 函数防抖
 * @param   fn        频繁触发的函数   type Function
 * @param   delay     延迟           type Number
 * @param   immediate 是否立即触发一次 type Boolean
 */
const debounce = (fn, delay = 300, immediate = false) => {
  let timer = null;
  let now = true;
  let result;
  return function () {
    clearTimeout(timer);
    if (immediate) {
      if (now) {
        now = false;
        // eslint-disable-next-line
        result = fn.apply(this, arguments);
      } else {
        timer = setTimeout(() => {
          // eslint-disable-next-line
          fn.apply(this, arguments);
        }, delay)
      }
    } else {
      timer = setTimeout(() => {
        // eslint-disable-next-line
        fn.apply(this, arguments);
      }, delay)
    }
    return result
  }
};
/**
 * 函数执行时间计算
 * @param fn 原函数
 * @returns {Function}
 */
const calcTime = fn => {
  return function () {
    console.time();
    fn.apply(this, arguments);
    console.log(`${fn.name}方法执行耗时:`);
    console.timeEnd()
  }
};

/**
 * 判断两个对象相等
 * @param obj
 * @param other
 * @returns {boolean}
 */
const isEqual = (obj, other) => JSON.stringify(obj) === JSON.stringify(other);

/**
 * 日期转化
 * @param time
 * @param format
 * @returns {{nowTime: string, nowYear: number, nowMonth: number, nowDate: number, nowHour: number, nowMinutes: number, nowSeconds: number, nowDayOfWeek: number}}
 */
const toDate = (time, format) => {
  if (time.toString().length < 13) {
    time = parseInt(time) * 1000
  }
  let t = new Date(time);
  let nowYear = t.getFullYear(); // 年
  let nowMonth = t.getMonth() + 1; // 月
  let nowDate = t.getDate(); // 日
  let nowHour = t.getHours(); // 时
  let nowMinutes = t.getMinutes(); // 分
  let nowSeconds = t.getSeconds(); // 秒
  let nowDayOfWeek = t.getDay(); // 今天本周的第几天

  let tf = function (i) {
    return (i < 10 ? '0' : '') + i
  };
  // 当前时间
  let nowTime = function (format) {
    return format.replace(/yyyy|MM|dd|hh|mm|ss/g, function (a) {
      let str = '';
      switch (a) {
        case 'yyyy':
          str = tf(nowYear);
          break;
        case 'MM':
          str = tf(nowMonth);
          break;
        case 'dd':
          str = tf(nowDate);
          break;
        case 'hh':
          str = tf(nowHour);
          break;
        case 'mm':
          str = tf(nowMinutes);
          break;
        case 'ss':
          str = tf(nowSeconds);
          break;
      }
      return str
    })
  };
  return {
    nowTime: format ? nowTime(format) : '',
    nowYear: nowYear,
    nowMonth: nowMonth,
    nowDate: nowDate,
    nowHour: nowHour,
    nowMinutes: nowMinutes,
    nowSeconds: nowSeconds,
    nowDayOfWeek: nowDayOfWeek
  }
};
/**
 * 千分位/电话号切割
 * @param num 数字
 * @param fh  分隔符号
 * @returns {string}
 */
const split = (num, fh = ' ') => {
  const base = `$1${fh}`;
  const source = String(num).split('.'); // 按小数点分成2部分
  source[0] = source[0].replace(new RegExp(`(\\d)(?=(\\d{3})+$)`, 'ig'), base); // 只将整数部分进行都好分割
  return source.join('.') // 再将小数部分合并进来
};
/**
 * 解除循环引用
 * @param object    循环引用对象
 * @param replacer  重构对象的回调函数
 * @returns {{_$}}  解除循环引用的占位对象
 */
const fixReference = (object, replacer) => {
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
};
// 简单深拷贝
const simpleClone = obj => JSON.parse(JSON.stringify(obj));
/**
 * 深拷贝
 * @param obj           被拷贝对象
 * @param fixReference  是否考虑循环引用
 * @returns {*}
 */
const cloneDeep = (obj, fixReference) => {
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
};
// 函数记忆
const memorize = cb => {
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
};

export {
  queue,
  resetTree,
  getArrMax,
  getArrMaxIndex,
  isEmpty,
  mapTree,
  flatten,
  group,
  iterator,
  throttle,
  debounce,
  calcTime,
  isEqual,
  toDate,
  split,
  fixReference,
  simpleClone,
  cloneDeep,
  memorize
}
