---
id: decorators
title: 装饰器
---

首先 typescript 的装饰器是一种实验特性，想要使用就需要在命令行或者 tsconfig.json 里面启用 experimentalDecorators。

命令行：

```bash
tsc --target ES5 --experimentalDecorators
```

tsconfig.json:

```json
{
  "compilerOptions": {
    "target": "ES5",
    "experimentalDecorators": true
  }
}
```

装饰器是一种特殊类型的声明，它能够被附加到类声明，方法，访问符，属性或参数上。
装饰器使用 **@expression** 这种形式，**expression** 必须为一个函数，**它会在运行时被调用，被装饰的声明信息做为参数传入**。

```ts
function hello() {}

@hello
class Person {}
```

## 装饰器工厂

装饰器工厂就是一个简单的函数，它返回一个表达式，以供装饰器在运行时调用。

```ts
function color(value: sring) {
  // 装饰器工厂
  return function (target) {}; // 装饰器
}
```

## 装饰器组合

多个装饰器可以应用在同一声明上。

```ts
// 在同一行上
@f @g x

// 在多行
@f
@g
x
```

在 TypeScript 里，当多个装饰器应用在一个声明上时会进行如下步骤的操作:

1. 由上至下依次对装饰器表达式求值。
2. 求值的结果会被当作函数，由下至上依次调用。

```ts
function f() {
  console.log(1);
  return function (target) {
    console.log(2);
  };
}

function g() {
  console.log(3);
  return function (target) {
    console.log(4);
  };
}

class C {
  @f()
  @g()
  method() {}
}
```

最后输出的结果是

```bash
1
3
4
2
```

## 装饰器类型

一共有 5 种装饰器可以被使用：

1. 类装饰器
2. 属性装饰器
3. 方法装饰器
4. 访问器装饰器
5. 参数装饰器

```ts
// 类装饰器
@classDecorator
class C {
  // 属性装饰器
  @propertyDecorator
  name: string;

  // 方法装饰器
  @methodDecorator
  hello(
    // 参数装饰器
    @parameterDecorator
    num: mumber
  ) {}

  @accessorDecorator
  get substr() {}
}
```

## 执行顺序

普通执行顺序：参数装饰器 -> 方法装饰器 -> 访问器或属性装饰器 -> 类装饰器
构造函数参数：参数装饰器 -> 方法装饰器 -> 访问器或属性装饰器 -> 构造函数参数装饰器 ->类装饰器

## 类装饰器

```ts
function sealed(constructor: Function) {
  Object.seal(constructor);
  Object.seal(constructor.prototype);
}

@sealed
class Greeter {
  greeting: string;
  constructor(message: string) {
    this.greeting = message;
  }
  greet() {
    return "Hello, " + this.greeting;
  }
}
```

当@sealed 被执行的时候，它将密封此类的构造函数和原型。  
使构造函数和原型阻止添加新属性并将所有现有属性标记为不可配置。  
当前属性的值只要原来是可写的就可以改变。

## 方法装饰器

方法装饰器表达式会在运行时当作函数被调用，传入下列 3 个参数：

1. 对于静态成员来说是类的构造函数，对于实例成员是类的原型对象。
2. 成员的名字。
3. 成员的属性描述符。

```ts
function enumerable(value: boolean) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    descriptor.enumerable = value;
  };
}

class Greeter {
  greeting: string;
  constructor(message: string) {
    this.greeting = message;
  }

  @enumerable(false)
  greet() {
    return "Hello, " + this.greeting;
  }
}
```

**enumerable** 函数就是一个构造工厂，当装饰器被调用，它会修改属性描述符的 **enumerable**属性。

## 访问器装饰器

**注意：TypeScript 不允许同时装饰一个成员的 get 和 set 访问器。一个成员的所有装饰的必须应用在文档顺序的第一个访问器上。因为在装饰器应用于一个属性描述符时，它联合了 get 和 set 访问器，而不是分开声明的。**

访问器装饰器表达式会在运行时当作函数被调用，传入下列 3 个参数：

1. 对于静态成员来说是类的构造函数，对于实例成员是类的原型对象。
2. 成员的名字。
3. 成员的属性描述符。

```ts
function configurable(value: boolean) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    descriptor.configurable = value;
  };
}

class Point {
  private _x: number;
  private _y: number;
  constructor(x: number, y: number) {
    this._x = x;
    this._y = y;
  }

  @configurable(false)
  get x() {
    return this._x;
  }

  @configurable(false)
  get y() {
    return this._y;
  }
}
```

## 属性装饰器

属性装饰器表达式会在运行时当作函数被调用，传入下列 2 个参数：

1. 对于静态成员来说是类的构造函数，对于实例成员是类的原型对象。
2. 成员的名字。

```ts
function format(target: any, propertyKey: string) {
  console.log(propertyKey);
}

class Greeter {
  @format()
  greeting: string;

  constructor(message: string) {
    this.greeting = message;
  }
}
```

## 参数装饰器

参数装饰器表达式会在运行时当作函数被调用，传入下列 3 个参数：

1. 对于静态成员来说是类的构造函数，对于实例成员是类的原型对象。
2. 成员的名字。
3. 参数在函数参数列表中的索引。

```ts
function hello(target: Object, propertyKey: string, parameterIndex: number) {
  console.log(propertyKey);
}

class Greeter {
  greeting: string;

  constructor(message: string) {
    this.greeting = message;
  }

  greet(@hello name: string) {
    return "Hello " + name + ", " + this.greeting;
  }
}
```
