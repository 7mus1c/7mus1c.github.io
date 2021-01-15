---
id: function
title: 函数
---

和 JavaScript 一样 TypeScript 具有命名函数和匿名函数。

```ts
function add(x, y) {
  return x + y;
}

let myAdd = function (x, y) {
  return x + y;
};
```

## 函数类型

### 添加类型

函数的参数可以指定类型，如果有返回值，那么就需要给函数添加返回值的类型，但是 TypeScript 能自动推断返回值的类型，通常可以省略。

```ts
function add(x: number, y: number): number {
  return x + y;
}

let myAdd = function (x: number, y: number): number {
  return x + y;
};
```

### 完整函数类型

```ts
let myAdd: (name: string, age: number) => number = function (
  n: string,
  a: number
): number {
  return a;
};
```

可以把这个看成是两部分，第一部分是指定 **myAdd** 的类型，第二部分才是真正的赋值。这样使用可以通过指定参数的名字和类型增加代码的可读性。

### 推断类型

在赋值语句的一边指定了类型但是另一边没有类型的话，TypeScript 编译器会自动识别出类型。  
这叫做“按上下文归类”，是类型推论的一种。 它帮助我们更好地为程序指定类型。

```ts
let myAdd: (x: number, y: number) => number = function (x, y) {
  return x + y;
};
```

## 可选参数和默认参数

TypeScript 里函数在不设置默认参数和可选参数的情况下，每个参数都是必须传递进函数的，否则就会报错。

```ts
function buildName(firstName: string, lastName: string, age: number) {
  return firstName + " " + lastName;
}

buildName("cheng"); // error
buildName("cheng", "li", 20); // ok
buildName("cheng", "li", 20, 30); // error 超出最大限制
```

下面修正一下

```ts
function buildName(firstName = "cheng", lastName: string, age?: number) {
  return firstName + " " + lastName + "" + age;
}

buildName(undefined, "lee"); // ok  cheng lee
buildName(undefined, "lee", 18); // ok cheng lee 18
```

在 Javascript 里参数都是可传可不传的，但是在 TypeScript 中都是必须传的。只有通过 **?** 的参数才可以不传。
**?** 表示可选参数，**=** 表示参数默认值。可选参数表示可传可不传，但是默认参数如果不是在最后一位那么就需要传入一个 **undefined** 占位符。

## 剩余参数

你想同时操作多个参数，或者你并不知道会有多少参数传递进来。在 TypeScript 里，你可以把所有参数收集到一个变量里。

```ts
function buildName(firstName: string, ...restOfName: string[]) {
  return firstName + " " + restOfName.join(" ");
}
buildName("cheng", "lee", "ma", "liu", "zhang", "?"); // ok
```

## lambads 和 this

```ts
let people = {
  name: ["tom", "tim", "wil", "toms"],
  getName: function () {
    return function () {
      let i = Math.floor(Math.random() * 4);
      return {
        n: this.name[i],
      };
    };
  },
};
let myName = people.getName();
console.log(myName()); // undefined
```

可以看到 **getName** 它返回了一个函数，在调用 **myName** 的时候 **this** 就被绑定到了 **window** 上。  
但是 window 上并没有 name 属性，所以这个函数并不能正常返回我们想要的结果。  
下面可以修改成箭头函数让他可以正常运行，箭头函数能够保存函数创建时的 **this**，而不是调用时的 **this**。

```ts
let people = {
  name: ["tom", "tim", "wil", "toms"],
  getName: function () {
    return () => {
      let i = Math.floor(Math.random() * 4);
      return {
        n: this.name[i],
      };
    };
  },
};

let myName = people.getName();
console.log(myName()); // ok
```

## 重载

重载就是函数根据传入不同的参数而返回不同类型的数据。

```ts
function attr(name: string): string;
function attr(age: number): number;
function attr(nameOrAge: any): any {
  if (nameOrAge && typeof mameOrAge === "string") {
    console.log("name");
  } else {
    console.log("age");
  }
}
attr("hello"); // ok
attr(18); // ok
```

同一个函数提供多个函数类型定义来进行函数重载。 编译器会根据这个列表去处理函数的调用。
