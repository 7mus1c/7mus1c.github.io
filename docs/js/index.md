# JavaScript 必知概念

## 变量与数据类型

过于基础都不提了。

### 变量提升

```js
console.log(a); // undefined
var a = 1;
```

因为变量提升，变量声明会被提升到作用域的顶部，但赋值不会被提升。

### 块级作用域

```js
if (true) {
  var a = 1;
  let b = 2;
  const c = 3;
}
console.log(a); // 1
console.log(b); // ReferenceError: b is not defined
console.log(c); // ReferenceError: c is not defined
```

因为`let`和`const`是块级作用域，而`var`是函数作用域。var 会有变量提升，而 let 和 const 没有。只在它当前的代码块中有效。

### 暂时性死区

```js
if (true) {
  console.log(a); // ReferenceError: a is not defined
  let a = 1;
}
```

在块级作用域中，变量在声明之前都是不可用的，称为“暂时性死区”。

### 重复声明

```js
var a = 1;
var a = 2;
console.log(a); // 2

let b = 1;
let b = 2; // SyntaxError: Identifier 'b' has already been declared
```

`let`和`const`不允许在同一个作用域内，重复声明同一个变量。

### 数据类型

- 基本类型：`number`、`string`、`boolean`、`null`、`undefined`、`symbol`、`bigint`
- 引用类型：`object`、`array`、`function`

### 类型判断

- `typeof`：基本类型和函数，`typeof null`是`object`
- `instanceof`：判断一个实例是否属于某个构造函数
- `Object.prototype.toString.call()`：判断一个实例的类型，返回`[object Type]`
- `Array.isArray()`：判断一个实例是否是数组
- `constructor`：判断一个实例的构造函数
- `Object.prototype.isPrototypeOf()`：判断一个实例的原型链上是否有某个原型
- `__proto__`：判断一个实例的原型链上是否有某个原型

## 流程控制

### 条件语句

- `if`：条件判断
- `switch`：多条件判断

### 循环语句

- `for`：循环
- `while`：循环
- `do...while`：循环
- `for...in`：遍历对象的可枚举属性
- `for...of`：遍历可迭代对象
- `forEach`：遍历数组

### 循环控制

- `break`：跳出循环, `for／for-in／for-of／while／do-while / switch`
- `continue`：跳过当前循环，进入下一次循环 `or／for-in／for-of／while／do-while`

## 函数

### 函数声明

```js
function add(a, b) {
  return a + b;
}
```

### 函数表达式

```js
const add = function (a, b) {
  return a + b;
};
```

### 箭头函数

```js
const add = (a, b) => a + b;
```

### 函数参数

- 默认参数：`function add(a = 1, b = 2) { return a + b; }`，默认参数必须放在最后
- 剩余参数：`function add(...args) { return args.reduce((a, b) => a + b, 0); }`，将所有参数放入一个数组中
- 展开运算符：`const arr = [1, 2, 3]; console.log(...arr);`，将数组展开成多个参数
- arguments：函数内部的特殊对象，包含了函数的所有参数

### 函数作用域和作用域链

- 全局作用域：函数外部的变量
- 局部作用域：函数内部的变量。
- 作用域链：当函数内部需要访问一个变量时，会先在函数内部查找，如果没有找到，就会在函数外部查找，直到全局作用域，这就是作用域链

### 闭包

闭包是指函数内部的作用域被保存到了外部，使得函数外部也可以使用函数内部的变量。
应用场景：模块化，数据私有化
缺点：内存泄漏

```js
function outer() {
  const a = 1;
  function inner() {
    console.log(a);
  }
  return inner;
}
const fn = outer();
fn(); // 1
```

### 立即执行函数

立即执行函数是指函数在声明后立即执行。

```js
(function () {
  console.log("立即执行函数");
})();
```

## 对象

### 对象的创建

- 字面量：`const obj = { name: "Tom", age: 18 };`
- 构造函数：`function Person(name, age) { this.name = name; this.age = age; } const person = new Person("Tom", 18);`
- Object.create：`const obj = Object.create({ name: "Tom", age: 18 });`

### 对象的属性

- 属性名：`const obj = { name: "Tom", age: 18 }; obj.name`，`obj["age"]`
- 属性值：`const obj = { name: "Tom", age: 18 }; obj.name = "Jerry"; obj["age"] = 20;`
- 属性删除：`const obj = { name: "Tom", age: 18 }; delete obj.name; delete obj["age"];`
- 属性遍历：`for (const key in obj) { console.log(key, obj[key]); }`
- 属性判断：`const obj = { name: "Tom", age: 18 }; Object.prototype.hasOwnProperty.call(obj, 'age');`

### 对象的方法

方法就是函数：`const obj = { name: "Tom", age: 18, sayHello: function () { console.log("Hello, my name is " + this.name); } }; obj.sayHello();`

### this

`this`指向调用函数的对象，如果没有调用对象，则指向全局对象。

```js
const obj = {
  name: "Tom",
  age: 18,
  sayHello: function () {
    console.log("Hello, my name is " + this.name);
  },
};
obj.sayHello(); // Hello, my name is Tom
```

#### new 调用

```js
const obj = new Foo(); // Foo 里的 this === obj
```

#### 显式绑定

call / apply / bind 直接告诉你 this 是谁

```js
foo.call(obj, 1, 2); // this === obj
const bar = foo.bind(obj);
bar(); // this 永远是 obj
```

#### 隐式绑定
```js
obj.fn();   // this === obj
```

#### 默认绑定

```js
function foo() {
  console.log(this);
}
foo(); //undefined
```

#### 箭头函数

this 在定义时就捕获外层词法作用域，不可被 call/apply/new 修改

```js
const obj = {
  a: 1,
  fn: () => console.log(this.a), // 外层 window，永远拿不到 1
};
```

#### 优先级
new > 显式 > 隐式 > 默认；箭头函数只认词法。