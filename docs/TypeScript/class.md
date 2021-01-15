---
id: class
title: 类
---

## 基本使用

与 JavaScript 相同，类都包含属性和方法。

```ts
class Person {
  name: string;
  age: number;
  constructor(name: stirng, age: number) {
    this.name = name;
    this.age = age;
  }
  say() {
    console.log(`${this.name}: ${this.age}`);
  }
}

let p = new Person(name: 'lee', age: 18);
p.say(); // lee: 18
```

## 继承

在 TypeScript 可以使用常见的面向对象模式。基于类的程序设计是允许使用继承来扩展类的。

通过 **extends** 关键字来继承基类。

```ts
class Person {
  name: string;
  age: number;
  say() {
    console.log(`${this.name}: ${this.age}`);
  }
}

class Student extends Person {
  school: string;
  tell() {
    console.log(`${this.name}: ${this.age}: ${this.school}`);
  }
}

let s = new Student();
s.name = "lee";
s.age = 18;
s.school = "清华";
s.say(); // lee: 18
s.tell(); // lee: 18: 清华
```

通过例子可以看出，子类从基类中继承了属性和方法。

```ts
class Person {
  name: stirng;
  age: number;
  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
  }
}

class Student extends Person {
  school: string;
  constructor(school: string) {
    super("lee", 18);
    this.school = school;
  }
  tell() {
    console.log(`${this.name}:${this.age}:${this.school}`);
  }
}

let s = new Student("清华");
s.tell(); // lee: 18: 清华
```

与前一个例子的不同点是，子类包含了一个构造函数，它必须调用 **super()**，它会执行基类的构造函数。而且，**「在构造函数里访问 this 的属性之前，我们 一定要调用 super()。 这个是 TypeScript 强制执行的一条重要规则」**。

## 修饰符

在 TypeScript 有 4 种修饰符：

- public
- private
- protected
- readonly

### public 默认属性

在 TypeScript 里，成员都默认为 public。如果什么都不写的情况下，成员就是 public。

```ts
class Person {
  public name: string;
  public age: number;

  public say() {
    console.log(`${this.name}: ${this.age}`);
  }
}
```

public 指定成员是可见的,也可以在外部或内部修改的。

### private 私有属性

当成员被标记成 private 时，它就不能在声明它的类的外部访问。

```ts
class Person {
  private name: string;
  constructor(name: string) {
    this.name = name;
  }
}

let p = new Person("lee");
console.log(p.name); // error
```

私有的属性在外部访问是会报错的，它只能在类的内部访问, 即使是子类也是不可以访问的。

### protected 受保护属性

**protected** 修饰符与 **private** 修饰符很相似，但有一点不同， **protected** 成员在子类中仍然可以访问。

```ts
class Person {
  protected name: string;
  constructor(name: string) {
    this.name = name;
  }
}

class Student extends Person {
  private lastName: string;
  constructor(name: string, lastName: string) {
    super(name);
    this.lastName = lastNmae;
  }

  say() {
    console.log(`${this.name}·${this.lastName}`);
  }
}

let S = new Student("cheng", "lee");
S.say(); // cheng lee
console.log(s.name); // error 属性“name”受保护，只能在类“Person”及其子类中访问
```

### readonly 只读属性

顾名思义，只读属性就只能读取。只读属性必须在声明时或构造函数里被初始化。

```ts
class Person {
  readonly name: string;
  readonly age: number = 18;
  constructor(name: string) {
    this.name = name;
  }
}

let p = new Person("lee");
p.name = "liu"; // error name是只读的
```

## 存取器

TypeScript 支持通过 **getters/setters** 来截取对对象成员的访问。

```ts
class Person {
  private _name: string = "lee";
  get name(): string {
    return this._name;
  }

  set name(newName: string) {
    if (this._name === "lee") {
      this._name = newName;
    } else {
      console.log("Error: Modification failed!");
    }
  }
}

let p = new Person();
console.log(p.name); // lee
p.name = "liu";
console.log(p.name); // liu
```

## 静态属性(static)

之前的成员都是实力成员，只有在实例化的时候才会被初始化的属性。但是静态成员，只存在于类本身上面而不是类的实例上。
所以在访问静态属性的时候，只能加上类名来访问。

```ts
class Person {
  static name: string;
  tell() {
    console.log(Person.name);
  }
}

let p = new Person();
Person.name = "lee";
p.tell(); // lee
```

## 抽象类

抽象类是做为子类的父类使用，不能被实例化。不同于接口，抽象类可以包含成员的实现。使用 **abstract** 关键字来定义抽象类和抽象类内部的抽象方法。

抽象类中的抽象方法不包含具体实现的，并且必须在子类中实现。

```ts
abstract class Person {
  name: string;
  constructor(name: string) {
    this.name = name;
  }

  abstract say(): void; // 抽象方法

  sayHello() {
    console.log(`hello ${this.name}`);
  }
}

class Student extends Person {
  constructor(name: string) {
    super(name);
  }

  say(): void {
    console.log(this.name);
  }
}

let p = new Student("lee");
p.say(); // lee
p.sayHello(); // hello lee
```

## 高级技巧

在 TypeScript 里声明了一个类的时候，实际上同时声明了很多东西。 首先就是类的实例的类型。

```ts
class Greeter {
  greeting: string;
  constructor(message: string) {
    this.greeting = message;
  }

  greet() {
    console.log(`hello ${this.greeting}`);
  }
}

let greeter: Greeter;
greeter = new Greeter("world");
greeter.greet(); // hello world
```

**let greeter: Greeter**，意思是 **Greeter** 类的实例的类型是 **Greeter**。

```ts
class Point {
  x: number;
  y: number;
}

interface Point3d extends Point {
  z: number;
}

let point3d: Point3d = {x: 1, y:2 z: 3};
```

类的定义会创建两个东西：类的实例和一个构造函数。因为类可以创建除类型，所以允许使用接口的地方使用类。
上面的相当于隐形的创建了一个构造函数，然后默认赋值。
