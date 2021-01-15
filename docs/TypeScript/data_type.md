---
id: datatype
title: 数据类型与断言
---

## 变量声明

在 TypeScript 中，变量声明的方式与 JavaScript 的声明方式是有差别的：

```ts
// let [变量]:[类型] = 值

let count: number = 1;
console.log(count);
```

这样声明变量的好处就是赋值给变量的数据类型如果与定义的类型不一致，那么会报错的。

## 数据类型

TypeScript 和 Javascript 的变量不同点是 TypeScript 的变量是强类型的。如果不是 **any** 类型，值就不能是其他类型。

### 布尔类型(boolean)

```ts
let isBoolean: boolean = true;
```

使用构造函数 **Boolean()** 创造的对象并不是布尔值。

```ts
let isBoolean: boolean = new Boolean(1); // error

let booleanObj: Boolean = new Boolean(1); // 允许的
let booleanObject: boolean = Boolean(1); // 允许的
```

实际上 **Boolean()** 返回的是一个 **Boolean** 对象。直接调用 **Boolean** 可以返回一个 **boolena** 类型。

### 数字类型(number)

TypeScript 里所有的数字都是浮点数。它们都是 number 类型，包括十进制、十六进制、二进制、八进制。

```ts
let decLiteral: number = 5;
let hex: number = 0xf00d;
let binary: number = 0b1010;
let oct: number = 0o744;
```

### 字符串类型(string)

和 JavaScript 一样都是表示文本，一样可以使用单引号和双引号表示。一样可以使用模板字符串。

```ts
let lastName: string = "Lee";
console.log(`hello ${lastName}`);
```

### 数组类型(array)

TypeScript 有两种定义方式。

```ts
let list: number[] = [1, 2, 3];

let list: Array<number> = [1, 2, 3];
```

第二种的方式是数组泛型，**Array<元素类型>**

### 元组类型(tuple)

元组是属于数组的一种，普通的数据只能有一种类型，否则会报错，但是元组可以有很多种类型。元组表示【一个已知元素数量和类型的数组，各元素类型不必相同】。

```ts
let x: [string, number];
x = ["1", 1]; // ok
x = [1, "1"]; // error
```

当访问一个已知索引的元素会得到正确的类型。

```ts
console.log(x[0].substr(1)); // ok
console.log(x[1].substr(1)); // error number 没有 substr
```

当访问一个越界的元素，会使用联合类型替代。

```ts
x[3] = "2"; // ok 字符串可以赋值给(string | number)类型
console.log(x[5].toString()); // ok string 和 number 都有 toString()
x[6] = true; // error 布尔不是(string | number)类型
```

### 枚举类型(enum)

枚举类型是对 JavaScript 的补充，可以为一组数值赋予变量名称。

```ts
enum Color {
  Red,
  Green,
  Blue,
}
```

以上代码编译成 JavaScript 代码

```js
var Color;
(function (Color) {
  Color[(Color["Red"] = 0)] = "Red";
  Color[(Color["Green"] = 1)] = "Green";
  Color[(Color["Blue"] = 2)] = "Blue";
})(Color || (Color = {}));
```

在默认情况下 **enum** 从 0 开始为元素编号。如果没有给标识符赋值，那么标识符的默认值为索引值。
也可以手动指定成员的数值，如果只给第一给设置编号，那么这个编号将成为起始编号，如果每个都设置，相当于每个元素的下标。

```ts
enum Color {
  Red = 1,
  Green = 10,
  Blue = 5,
}
// 输出 {'1': 'Red', '5': Blue, '10': 'Green', Red: 1, Green: 10, Blue: 5}
```

**enum** 的类型的值不能设置为对象，或者是利用变量的间接引用对象的值

```ts
enum Color = {Red = 1, {"y": 1}, Blue} // 报错

let o = {x : 1};
enum Color = {Red = 1, o, Blue} //报错
```

枚举类型的值是可以得到它的名字。

```ts
enum Color {
  Red = 1,
  Green,
  Blue,
}

let colorName: string = Color[2];
console.log(colorName); // Green
```

### 任意类型(any)

有时候想给还不知道类型的变量指定一个类型的时候，这些值有可能是冬天的，那么就可以使用 **any** 类型标记。

```ts
let myName: any = 4;
myName = "Lee";
myName = {
  name: "Lee",
  age: 20,
};
```

### void 类型

TypeScript 中 **void** 便是没有任何类型，一般用于方法没有返回值。也可以给变量指定类型，但是 **void** 只能赋值给 undefined 和 null。

```ts
function run(): void {
  console.log(123);
}
```

### undefined 和 null 类型

虽然变量指定了类型， 但是如果不赋值的话默认值还是 undefined,如果没有指定就直接赋值那么会报错。

```ts
let flag: undefined;
let flag: undefined = undefined;

let flag: null = null;
```

默认情况下 null 和 undefined 是所有类型的子类型，也就是说可以把 null 和 undefined 赋值给 number 类型的变量。

```ts
let num: number = undefined;
let str: string = null;
```

可以给变量指定多种可能的类型。

```ts
let one: number | undefine; // 这样不赋值也不会报错了

let tow: number | string | null | undefined; // 这样就支持4种类型了
```

### never 类型

**never** 类型表示那些永不存在的值的类型。一般用来保持抛出异常或者返回一个 error 类型的数据, 或者死循环。

```ts
function error(message: string): never {
  throw new Error(message);
}

function fail(): never {
  return error("something failed");
}

function infiniteLoop(): never {
  while (true) {}
}
```

### object 类型

**Object** 并非原始类型, 也就除 **number, string, boolean, symbol, null, undefined** 之外的类型。

```ts
let stu: object = { name: "Lee" }; // ok
let stu: {} = { name: "Lee" }; // ok

let person: { name: string; age: number } = { name: "Lee", age: 18 }; // 必须一一对应，否则报错

decalre function create(o: object| null) : void;
// declare是一个声明的关键字,可以写在声明一个变量时解决命名冲突的问题

create({name: 'Lee'}); // ok
create(null); // ok

create(18); // error
create('string'); // error
create(false); // error
```

## 类型断言

有时候你会比 TypeScript 更了解某个值的信息。就可以通过类型断言告诉编译器，"相信我，我知道自己在干什么"。
类型断言就像其他语言的类型转换。但是不进行特殊的数据检查和解构。只在编译阶段起作用。TypeScript 会假设程序员已经进行了必要的检查。

类型断言有两种形式 **<尖括号>** 和 **as** 语法:

```ts
let someValue: any = "this is a string";
// 如果写的是any类型，去找length属性的话，编译器是找不到length属性的
// 类型断言断言后是可以知道的
let str: number = (<string>someValue).length;

let someValue: any = "this is a string";
let str: number = (someValue as string).length;
```
