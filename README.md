# Tools
工具箱,对常用功能的封装实现

> DOC

## How to use ?

```npm
npm install highly-tools
```

### queue
> 串行、并行、全部完成
```javascript
// 需要对异步函数做一些修改(包一层即可) 如下:
//（略显鸡肋 曾尝试过装饰器模式自行内部封装fail...）
import Tools from 'Tools';

const fn1 = (cb) => {
    setTimeout(() => {
        console.log('fn1');
        cb && cb();
    }, 1000);
};

const fn2 = (cb) => {
    setTimeout(() => {
        console.log('fn2');
        cb && cb();
    }, 3000);
};

const fn3 = (cb) => {
    setTimeout(() => {
        console.log('fn3');
        cb && cb();
    }, 1000);
};

asyncQueue = [fn1, fn2, fn3];

const q = Tools.queue();
q.add(...asyncQueue);

// 串行
q.runAsync();

// 并行
q.run();

//全部完成
q.runAll().then(() => {
    console.log('全部完成了');
});
```

### mapTree
> tree的遍历
```javascript
import Tools from 'Tools';

let tree = {
     value: 0,
     children: []
 };

Tools.mapTree(tree, console.log);
```

### flatten
> 数组扁平化
```javascript
import Tools from 'Tools';

let arr = [1, 2, [1, 3, 4, 5, [3, 4], 5, 7], 668];
Tools.flatten(arr);
```

### group
> 一维数组转多维数组
```javascript
import Tools from 'Tools';

arr = Tools.group([1, 2, 3, 4, 5], 2);
```

### iterator
> 数组转迭代器对象
```javascript
import Tools from 'Tools';

Tools.iterator([1, 2, 3]);
```

### throttle
> 函数节流，控制执行频率
```javascript
import Tools from 'Tools';

/**
 * 函数节流
 * @param fn        频繁触发的函数    type Function
 * @param delay     延迟            type Number
 * @param limit     必触发时间限制   type Number
 */
Tools.throttle(() => {
    // your fn
}, 300, 600);
```

### debounce
> 函数防抖，频繁触发只触发一次
```javascript
import Tools from 'Tools';

/**
 * 函数防抖
 * @param   fn        频繁触发的函数   type Function
 * @param   delay     延迟           type Number
 * @param   immediate 是否立即触发一次 type Boolean
 */
Tools.debounce(() => {
    // your fn
}, 300);

```

### fixReference
> 循环引用解除
```javascript
import Tools from 'Tools';

/**
 * 解除循环引用
 * @param object    循环引用对象
 * @param replacer  重构对象的回调函数
 * @returns {{_$}}  解除循环引用的占位对象
 */
let a = {};
let b = {};
a.b = b;
b.a = a;
Tools.fixReference(b, callback);

```

### cloneDeep
> 深拷贝
```javascript
import Tools from 'Tools';

/**
 * 深拷贝
 * @param obj           被拷贝对象
 * @param fixReference  是否考虑循环引用
 * @returns {*}
 */
// 普通对象深拷贝
let obj = {a: 3, b: [1, 2, 3]}
Tools.cloneDeep(obj);
// 考虑循环引用的深拷贝
let a = {};
let b = {};
a.b = b;
b.a = a;
Tools.cloneDeep(b, true);

```

### memorize
> 函数记忆
```javascript
import Tools from 'Tools';

// 函数记忆
const add = (a, b) => a + b
const memorizeAdd = Tools.memorize(add);
memorizeAdd(1, 2)
```
