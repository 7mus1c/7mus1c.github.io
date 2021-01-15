---
id: interface
title: 接口
---

TypeScript 的核心原则之一就是类型检查。

在 TypeScript 里，可以使用接口的来规范类型，为你的代码或第三方代码定义契约。

## 了解接口

```ts
function printeLabel(labelObj: { label: string }) {
  console.log(labelObj.label);
}

let myObj = { label: "hello" };
printeLabel(myObj);
```

上面是一个简单的函数声明及调用，类型检查器会查看 **printLabel** 的调用，它有一个参数是一个对象，有一个名为 label 类型为 string 类型的属性。
下面用接口来描述：

```ts
interface LabelledValue {
  label: string;
}

function printLabel(labelledObj: LabelledValue) {
  consle.log(labelledObj.label);
}

let myObj = { size: 10, label: "size" };
printLabel(myObj);
```

**LabelledValue** 接口就好比一个名字，用来描述上面例子里的要求。 它代表了有一个 label 属性且类型为 string 的对象。
类型检查器不会去检查属性的顺序，只要相应的属性存在并且类型也是对的就可以。

## 可选属性

接口里的属性不是全都必须传入的，有些是只在某些条件下存在，或者根本不存在。

```ts
interface Config {
  name?: string;
  age?: number;
}

function person(config: Config) {
  console.log(config.name);
  console.log(config.age);
}

let my = { name: "tom" };
person(my); // ok  "tom" 和 undefined
```

## 只读属性

有些对象只能在创建的时候赋值，你期望之后都不可以修改的，可以在属性前用 readonly 来定义。

```ts
interface Point {
  readonly x: number;
  readonly y: number;
}

let p1: point = { x: 1, y: 2 };
p1.x = 3; // error
```

## 函数类型

接口能够描述 JavaScript 中任何对象。 除了描述带有属性的普通对象外，接口也可以描述函数类型。

```ts
interface SearchFunc {
  (source: string, subString: string): boolean;
}

let mySearch: SearchFunc;
mySearch = function (source: string, subString: string) {
  let result = source.search(subString);
  return result > -1;
};
```

TypeScript 的类型检查只检查类型，并不检查属性名。可以修改如下：

```ts
let mySearch: SearchFunc;
mySearch = function (src: string, sub: string): boolean {
  let result = src.search(sub);
  return result > -1;
};
```

函数的参数会逐个进行检查，要求对应位置上的参数类型是兼容的。如果不想指定类型，TypeScript 的类型检查会推断出参数类型，因为函数直接赋值了 **SearchFunc** 的类型变量。
所以这个函数可以简写如下：

```ts
let mySearch: SearchFunc;
mySearch = function (src, sub) {
  let result = src.search(sub);
  return result > -1;
};
```

## 数组类型

与使用接口描述函数类型差不多，接口也可以描述数组的类型。它可以描述索引的值的类型，也可以描述索引返回值的类型。

```ts
interface StringArray {
  [index: number]: string;
}

let myArray: StringArray;
myArray = ["a", "b"];

let myStr: string = myArray[0];
```

## Class 类型

接口也可以强制一个类去符合某种约定，规范类的使用。

```ts
interface ColockInterface {
  currentTime: Date;
  setTime(d: Date);
}

class Clock implements ClockInterface {
  // implements 是用来实现接口的
  currentTime: Date;
  setTime(d: Date) {
    this.currentTime = d;
  }
  constructor(h: number, m: number) {}
}
```

在接口中描述了一个属性和一个方法，用类去实现这个接口的时候，属性和方法也是需要在类中去实现的。接口只负责了描述，在类中去实现。

## 继承接口

和类一样接口也是可以互相继承。可以从一个接口复制成员到另一个接口里，可以将接口分割到可重用的模块里。

```ts
interface Shape {
  color: string;
}

interface Square extends Shape {
  sideLength: number;
}

let square = <Square>{};
square.color = "blue";
square.sideLength = 10;
```

一个接口也可以继承多个接口。

```ts
interface Shape {
  color: string;
}

interface PenStroke {
  penWidth: number;
}

interface Square extends Shape, Penstroke {
  sideLength: number;
}

let square = <Square>{};
square.color = "blue";
square.sideLength = 10;
square.penWidth = 5.0;
```

## 混合类型

当然我们常见的对象不可能就只有一种数据类型，肯定是多种的混合类型。接口也可以描述混合类型。

```ts
interface Counter {
  (start: number): string;
  interval: number;
  reset(): void;
}

function getCounter(): Counter {
  let couter = <Counter>function (start: number) {};
  counter.interval = 123;
  counter.reset = function () {};
  return counter;
}

let c = getCounter();
c(10);
c.reset();
c.interval = 5.0;
```

## 接口继承类

当一个接口继承一个类时，它会继承类的 **private** 和 **protected** 成员但是不包括实现。这意味着这个接口继承了一个拥有私有属性和受保护属性的成员类的时候，
那么这个接口只能被这个类或者其子类实现。

当有一个庞大的继承结构时这很有用，但是要指出的是你的代码只能在子类拥有特定属性时起作用，这个子类除了继承自基类外与基类没有任何关系。

```ts
class Control {
  private state: any;
}

interface SelectableControl extends Control {
  select(): void;
}

class Button extends Control implements SelectableControl {
  select() {}
}

class TextBox extends Control {
  select() {}
}

// 错误 “Image” 缺少 “state”属性
class Image implements SelectableControl {
  select() {}
}
```
