---
id: generics
title: 泛型
---

泛型可以用来创建可重用的组件，一个组件可以支持多种类型的数据，这样就可以以数据类型来使用组件。

## 认识泛型

```ts
function hello(str: string): string {
  return str;
}
```

这是一个函数。参数是 **string** 类型，返回的类型也是 **string** 。但是如果参数不一定非要传一个固定的类型，
是不是 **any** 就能解决了呢？**any** 确实是可以，但是没有一个固定的规范了，容易出现类型的转换错误，怎么办？那么这就需要用到了泛型。

```ts
function hello<T>(str: T): T {
  return str;
}
```

把当前的函数指定成一个泛型，参数和返回值都是泛型。

```ts
function hello<T>(str: T): T {
  return str;
}

let output = hello<string>("hello world!"); // error
let output = hello<string>(10); // error
```

把当前函数指定一个 **string** 类型，那么相应的参数和返回值就必须是 **string** 类型。

## 泛型类型

```ts
function hello<T>(str: T): T {
  return str;
}

let myHello: <K>(str: K) => K = hello;
console.log(myHello("hello")); // ok  hello
```

可以使用不同的大写字母来定义泛型参数名，只要数量上和使用方式上一样就可以。

```ts
let myHello: <T>(str: T) => T = hello;
let myHello: { <T>(str: T): T } = hello;
```

这两个语句其实是相等的，如果对拉姆达表达式并不是很好理解，可以看一下第二个。

```ts
interface Hello {
  <T>(arg: T): T;
}

function myHello<T>(arg: T): T {
  return arg;
}

let MH: Hello = myHello;
console.log(MH<string>("hello")); // hello
```

这是一个泛型接口。但是这样写很不方便，应该在接口中统一指定泛型。

```ts
interface Hello<T> {
  (arg: T): T;
}

function myHello<T>(arg: T): T {
  return arg;
}

let mh: Hello<number> = myHello;
console.log(mh(100)); // 100
```

## 泛型类

泛型类看上去与泛型接口差不多。

```ts
class HelloNumber<T> {
  Zero: t;
  add: (x: T, y: T) => T;
}

let myHelloNumber = new HelloNumber<number>();
myHelloNumber.Zero = 10;
myHelloNumber.add = function (x, y) {
  return x + y;
};

console.log(myHelloNumber.zero); // 10;
console.log(MyHelloNumber.add(10, 10)); //10
```

通过指定 **HelloNumber** 的类型，就可以指定 **zero** 和 **add** 的参数和返回值类型。
