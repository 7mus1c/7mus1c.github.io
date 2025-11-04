# 基本数据类型
## 原始数据类型
```typescript
const name: string = 'zhangsan';
const age: number = 18;
const isStudent: boolean = true;
const nullValue: null = null;
const undefinedValue: undefined = undefined;

const obj: { name: string, age: number } = { name: 'zhangsan', age: 18 };
const bigintVlaue: bigint = 100n;
const symbolVlaue: symbol = Symbol('1');
```

## Null 和 undefined 
JS 中它们分别表示**“这里有值，但是是****空值****”**和**“这里没有值”。**

TS 中它们都有具体的意义。但是没有开启`strict`严格模式的时候，null 和 undefined 都是其他类型的子类。

```typescript
// 只有关闭严格模式以下代码才生效
const name: string = null;
const age: number = undefined;
```

## Void
一个函数没有返回值可以用 void 表示

```typescript
function app(): void {
  console.log(1);
}
```

# 数组
```typescript
const arr: number[] = [1, 2, 3];
const arr2: Array<number> = [1, 2, 3];
```

## 元组 （tuple）
元祖可以限定数组的长度和每一项的具体数据类型。 元祖可以通过 ? 指定某一项是可选项，那么那一项就是可有可无的，不写也不会报错。元祖也可以给一个变量名。

```typescript
const tuple: [string, number] = ['1', 2];
```

### 可选属性
```typescript
// 报错
const tuple: [string, number, number] = ['1', 2]; 
// 元祖可选项
const tuple: [string, number, number?] = ['1', 2];
```

### 设置别名（解构）
```typescript
// 别名
const tuple: [name:string, age:number] = ['1', 2]; 
console.log(name, age)
```

### 只读
将元组设置成只读之后，不再会有 pop，push 等方法。

```typescript
const tuple: readonly [number, string] = [1, '2'];

tuple.push(3); // 无法分配到 "tuple" ，因为它是只读属性
```

# 对象类型的定义
type 和 interface 都可以定义对象的类型。

```typescript
interface Obj {
  name: string;
  age: number;
}

type Obj = {
  name: string;
  age: number;
}

const obj: Obj = {
  name: '张三',
  age: 18
};
```

## 属性的可选
通过 ? 定义对象熟悉的可选项。

```typescript
interface Obj {
  name: string;
  age: number;
  sex: string;
}
// 报错 缺少了sex属性
const obj: Obj = {
  name: '张三',
  age: 18
};
```

```typescript
interface Obj {
  name: string;
  age: number;
  sex?: string;
}
// 不报错
const obj: Obj = {
  name: '张三',
  age: 18
};
```

## 属性的只读
通过 readonly 属性定义只读

```typescript
interface Obj {
  readonly name: string;
  age: number;
}

const obj: Obj = {
  name: '张三',
  age: 18
};
// 报错
obj.name = '李四'; // 无法分配到 "name" ，因为它是只读属性
```

# 联合类型 和 字面量类型
通过 | 来确定联合类型，就是 什么类型 或者 什么类型。

就比如：“success” 和 “fail” 这两个其实是两个类型。就是这个属性的值，必须是 “success” 或者 “fail” 这两个字段才可以。其他结果都是错误的，所以它就是一个具体的值。

```typescript
const sex: string | number = 123;

interface obj {
  name: string;
  age: number;
  status: 'success' | 'fail';
}

// 这是正确的字面量类型
const name: 'zhangsan' = 'zhangsan';
// 这个是错误的 值必须是18 否则会报错。
const age: 18 = 19;
```

# 枚举
它有点像 constants 文件了。之前写的大概如下

```typescript
export default {
  Home_Url: 'xxxx',
  Share_Url: 'xxx',
  Setting_url: 'xxx'
}
```

如果切换成枚举就是：

```typescript
enum Urls {
  Home_url = 'https://www.google.com/',
  About_url = 'https://www.google.com/',
  Contact_url = 'https://www.google.com/'
}

const homeUrl = Urls.Home_url;
```

## 常量枚举
代表着枚举不可修改

```typescript
const enum Urls {
  Home_url = 'https://www.google.com/',
  About_url = 'https://www.google.com/',
  Contact_url = 'https://www.google.com/'
}
```

# 函数
## 函数签名
函数签名是一种类型定义，用于描述函数的参数类型和返回类型

```typescript
function add(a: number, b: number): number {
  return a + b;
}

const add = (a: number, b: number): number => {
  return a + b;
};

// 可读性比较差
const add: (a: number, b: number) => number = (a, b) => a + b;
```

## 类型别名
将 function 的类型单独抽离出来 就叫类型别名

```typescript
// 第一种
type AddFunc = (a: number, b: number) => number;
// 第二种
interface AddFunc {
  (a: number, b: number): number;
}

const add: AddFunc = (a, b) => a + b;
```

## Void 
如果一个函数没有返回值 需要用 void 来表示, 实际上返回的是一个 undefined。

```typescript
const add = (a: number, b: number): void => {
  console.log(a + b);
};

const foo = (): void {
  return;
}
```

## 可选参数与 rest 参数
**注意：可选参数必须在必选参数后面。**

```typescript
function foo(a: string, b?: number) {
  console.log(a);
  console.log(b);// undefined
}

foo('张三');

function foo1(a: string, b: number = 18) {
  console.log(a);
  console.log(b); // 18
}

foo1('张三');

function bar(a: string, ...args: string[]) {
  console.log(a);
  console.log(args); // [李四， 王五]
}

bar('张三', '李四', '王五');

function bar(a: string, ...args: ['string', number]) {
  console.log(a);
  console.log(args); // [李四， 18]
}

bar('张三', '李四', 18); // rest 元组限制了只能有两个
```

## 重载
同一个函数名定义多个函数签名，这称为函数重载。

```typescript
function foo(a: number, b: true): number;
function foo(a: number, b?: false): string;
function foo(a: number, b?: boolean): number | string {
  if (b) {
    return a;
  } else {
    return `${a}`; // 这里会推断为 string
  }
}
const res = foo(1, true); // 推断为 number
const res2 = foo(1); // 推断为 string
const res3 = foo(1, true); // 推断为 number
```

## 异步函数签名 和 genertor 函数签名
```typescript
async function foo(): Promise<void> {}

function* foo(): Iterabel<void> {}

async function* foo(): AsyncIterabel<void> {}
```

# Class
## 类与成员的类型签名
```typescript
class Foo {
  prop: string;

  constructor(prop: string) {
    this.prop = prop;
  }

  print(params: string): string {
    return `${params}`;
  }

  get(): string {
    return this.prop;
  }

  set(prop: string) {
    this.prop = prop;
  }
}
```

## 修饰符
常见的修饰符有：

+ **public**：默认的 谁都可以访问
+ **private**：私有的 类的内部访问。
+ **protected**：半私有的 类的内部和子类可以访问
+ **readonly**：只读的
+ **static**：定义的属性或方法属于类本身，而不是类的实例。

## 继承和抽象类
在ts 4.3中 有一个关键字 override，它就是去覆盖父类方法的。如果父类没有整个方法，那么就会报错。它就是为了确保父类中有这一个方法。

抽象类就是定义一个类，但是不去实现他。实现抽象类的时候必须需要去实现抽象类中的所有属性和方法。

通过 absctact 定义抽象类，implements 去实现抽象类

```typescript
class Foo {
  print() {}
}

class Bar extends Foo {
  // 此时会报错，因为父类中没有 add 方法。如果去掉override 就不会报错
  override add() {}
}
```

```typescript
abstract class Foo {
  abstract prop: string;
  abstract baz(): void;
}
// 抽象类的中的属性和方法必须实现
class Bar implements Foo {
  prop = 'hello';
  
  baz() {
    console.log('hello');
  }
}
```

# 内置类型
Any 和 unknown 的区别？

**<font style="background-color:rgb(255,245,235);">Unknown 类型的变量可以赋值任何类型， 但是赋值给其他有类型的变量时会报错，除了 any 和 unknown。</font>**

**<font style="background-color:rgb(255,245,235);">核心区别：any是双向赋值。 Unknown 是单向赋值。</font>**

## Unknown 的类型断言
```typescript
let unknownVar: unknown;
unknownVar.foo();
```

此时会报错，因为不确定 unknownVar 是否是一个对象，更加不确定它有没有 foo 方法了。

```typescript
let unknownVar: unknown;
(unknownVar as { foo(): void }).foo();
```

先给断言成一个对象，且这个对象有 foo 这个方法。此时将不再报错。

## Never
Never 表示虚无的类型。一般用不到。

```typescript
function foo(): never {
  throw new Error();
}
```

# 类型断言
### 双重断言
```typescript
const str: string = '123';

(str as unknown as { add: () => void }).add();

// 从右到左的<>断言 特别反人类
(<{ add: () => void }>(<unknown>str)).add();
```

### 非空断言
就是断定你必有这个属性或者方法。

```typescript
declare const foo: {
  add?: () => {
    prop?: null | number;
  };
};
// 报错 因为 add 或者 prop 都是可选项非必须得
foo.add().prop.toFixed();

// 非空断言
foo.add!().prop!.toFixed();

// 另外一种可选链的方式
foo.add?.().prop?.toFixed();
```

```typescript
interface IStruct {
  name: string;
  age: number;
}
// 报错缺少 name age 属性
const obj: IStruct = {};

// 断言
const obj: IStruct = {} as IStruct;
```

# 类型别名
也就是 type。

```typescript
type StatusCode = 401 | 404 | 200 | 500;
const code: StatusCode = 500;

type Handle = (e: Event) => void;
const handleClick: Handle = (e) => {};

type Factory<T> = T | number | string;
const factory: Factory<boolean> = false;
```

# 交叉类型
交叉类型就是用 & 连接两个类型，表示新类型有两个类型的所有属性和方法。

```typescript
interface Person {
  name: string;
  age: number;
}

interface Sex {
  male: string;
  female: string;
}

type PersonWithSex = Person & Sex;

const person: PersonWithSex = {
  name: 'John',
  age: 30,
  male: '男',
  female: '女'
};
```

## 交叉类型的合并
```typescript
interface Person1 {
  name: string;
  other: {
    sex: string;
  };
}

interface Person2 {
  name: number;
  other: {
    age: number;
  };
}

type Person = Person1 & Person2;

type PersonName = Person['name']; // name 不可能既是string 又是 number 所以是 never
type PersonOther = Person['other']; // other 会合并 {sex: string; age: number}

/* 
** type PersonName = never
** type PersonOther = {
**   sex: string;
** } & {
**   age: number;
** }
*/
```

## 联合类型的交叉类型
相同的交叉类型才会被取出来 否则会扔掉

```typescript
type A = (1 | 2 | 3) & (1 | 2);  // 1 | 2

type B = (string | number) & (boolean | number); // number
```

# 索引类型
它也叫做索引签名：定义对象的索引类型

```typescript
interface StringTypes {
  [key: string]: string;
}

const stringTypes: StringTypes = {
  string: 'string',
  number: 'number',
  boolean: 'boolean',
  object: 'object',
  function: 'function',
  undefined: 'undefined',
  null: 'null',
  123: 'number', // 数字键会被转换为字符串
  [Symbol('abc')]: 'symbol' // 符号键会被转换为字符串
};
```

## 索引类型查询
获取某一类型的所有 key。

```typescript
interface Foo {
  bar: number;
  baz: string;
  333: boolean;
}
// 获取所有的 key
type FooKeys = keyof Foo; // 'bar' | 'baz' | 333


interface StringTypes {
  [key: string]: number;
}
type Keys = keyof Foo; // string
```

## 索引类型访问
访问某一类型的 value。

```typescript
interface Foo {
  bar: number;
  baz: string;
  333: boolean;
}
// 获取所有的 key
type FooKeys = keyof Foo; // 'bar' | 'baz' | 333
// 获取单独的 value
type FooValues = Foo['bar']; // number
// 获取所有的 value
type FooValues = Foo[FooKeys]; // number | string | boolean
// type FooValues = Foo[keyof Foo];

interface StringTypes {
  [key: string]: number;
}
type Values = Foop[string]; // number;
```

# 映射类型
就是去遍历 其他类型并且拿到所有的 key 然后统一赋值。

```typescript
type Stringify<T> = {
  [K in keyof T]: string;
};

interface Foo {
  prop: string;
  prop2: number;
  prop3: boolean;
  prop4: () => void;
}



type StringifiedFoo = Stringify<Foo>;
// 相当于
interface StringifiedFoo {
  prop: string;
  prop2: string;
  prop3: string;
  prop4: string;
}
```

可以拿映射类型去克隆一个类型。K 就是属性，T[K] 就是值。

```typescript
type Clone<T> = {
  [K in keyof T]: T[K];
}
```

# 类型查询操作符 （typeof）
```typescript
const a = 1;
const b = '2';
const obj = { a: 1 };

type A = typeof a; // 1
type B = typeof b; // '2'
type C = typeof obj; // { a: number }
```

a 和 b 都是字面量类型，所以它的值就是它的类型。

如果两个类型是一样的 可以偷别人的类型拿来自己用。

```typescript
const func = (name: string) => {
  return name === '123';
};

const func2: typeof func = (name: string) => {
  return name === '张三';
};
```

# In 和 instanceof 的类型保护
## in
```typescript
interface Foo {
  foo: string;
  getName: () => void;
}

interface Bar {
  bar: string;
  getAge: () => void;
}

const getPerson = (person: Foo | Bar) => {
  if ('foo' in person) {
    person.getName();
  } else {
    person.getAge();
  }
}
```

## instanceof 
```typescript
class FooBase {}

class BarBase {}

class Foo extends FooBase {
  fooOnly() {}
}

class Bar extends BarBase {
  barOnly() {}
}

function handle(obj: Foo | Bar) {
  if (obj instanceof FooBase) {
    obj.fooOnly();
  } else {
    obj.barOnly();
  }
}
```

# 条件类型
```typescript
type IsEqual<T> = T extends true ? 1 : 2;

type T0 = IsEqual<true>; // 1
type T1 = IsEqual<false>; // 2
type T2 = IsEqual<true | false>; // 2
type T3 = IsEqual<1 | 2>; // 2
type T4 = IsEqual<'string'>; // 2
```

T 是不是 true 的实例，如果是的话就返回1 不是的话 返回2.

# 泛型约束和默认值
## 默认值
```typescript
type Factory<T = boolean> = T | number | string;

type F = Factory; // F 就是 boolean | number | string

type F2 = Factory<null>; // F2 就是 null | number | string
```

## 约束
```typescript
type ResStatus<ResCode extends number> = ResCode extends 10000 | 10001 | 10002
  ? 'success'
  : 'fail';

type Res = ResStatus<10000>; // 'success'
type Res1 = ResStatus<10001>; // 'success'
type Res2 = ResStatus<10002>; // 'success'
type Res3 = ResStatus<10003>; // 'fail'
type Res4 = ResStatus<'200'>; // 报错 string 不满足约束 number
```

这个代码就是 ResCode 必须是一个 number，对类型进行了约束。如果 ResCode 是 10000 10001 10002 的时候就返回 success 否则就是 fail。

如果给了默认值什么不传，也可以的。

```typescript
type ResStatus<ResCode extends number = 10000> = ResCode extends 10000 | 10001 | 10002
  ? 'success'
  : 'fail';
type res5 = ResStatus; // 'success'
```

# 类型层级
## 基础类型
```typescript
type Str = 'abc' extends string ? true : false; // true
type Num = 123 extends number ? true : false; // true
type Bool = true extends boolean ? true : false; // true
type Obj = { a: 1 } extends object ? true : false; // true
type Arr = [] extends object ? true : false; // true
```

根据例子可以得出结论：字面量类型 < 对应的原始类型

## 联合类型
```typescript
type Num = 1 extends 1 | 2 | 3 ? true : false; // true
type Str = 'hello' extends 'hello' | 'world' ? true : false; // true
type Bool = true extends true | false ? true : false; // true

type Str1 = string extends string | number ? true : false; // true

type Str2 = 'a' | 'b' | 'c' extends string ? true : false; // true
type Obj = {} | (() => void) | [] extends object ? true : false; // true
```

## 装箱类型
```typescript
type result = string extends String ? true : false; // true
type result2 = String extends {} ? true : false; // true
type result3 = {} extends object ? true : false; // true
type result4 = object extends Object ? true : false; // true
```

<font style="background-color:rgb(255,245,235);">可以得出结论 </font>**<font style="background-color:rgb(255,245,235);">原始类型 < 原始类型的装箱 < object 类型</font>**

## 顶层类型
顶层类型只有 any 和 unknown。

```typescript
type Res = Object extends any ? true : false; //  true
type Res2 = Object extends unknown ? true : false; //  true

type Res3 = any extends Object ? 1 : 2; // 1 | 2
type Res4 = unknown extends Object ? true : false; //  false

type Res5 = any extends unknown ? true : false; //  true
type Res6 = unknown extends any ? true : false; //  true
```

Any 包含任何情况，所有不管 any extends 谁都是 1 或 2 。

## 虚无类型
```typescript
type Res = never extends 'string' ? true : false; // true
```

因此得出 never < 字面量类型

# 层级关系
| **any、unknown** | **顶级类型** |
| :---: | :---: |
| **Object** | **顶级原型** |
| **String、Boolean、Numebr** | **装箱类型** |
| **string、boolean、number** | **基础类型** |
| **'string'、true、123** | **字面量类型** |
| **never** | **虚无类型** |


# Infer 推断
在 ts 中支持 infer 来**在条件类型中提取类型的某一部分信息。**

```typescript
type Func = (...args: any[]) => any;

type FunReturn<T extends Func> = T extends (...args: any[]) => infer R ? R : any;
```

可以把当做推断，传入的泛型如果是，它会使用 infer R 来推断出这个类型。

```typescript
type Swap<T extends any[]> = T extends [infer A, infer B] ? [B, A] : T;

type Swap2 = Swap<[1, 2]>; // [2, 1]
type Swap3= Swap<[1, 2, 3]>; // [1, 2, 3]
```

```typescript
type ArrayItemType<T> = T extends Array<infer ElementType> ? ElementType : never;

type Test = ArrayItemType<number[]>; // number
type Test2 = ArrayItemType<string[]>; // string
type Test3 = ArrayItemType<[string, number]>; // string | number
```

# 工具类型
## 变成可选 Partial
```typescript
type Person = {
  name: string;
  age: number;
  gender: string;
};

type User = Partial<Person>; // 所有变成可选
```

## 变成必选 Required
```typescript
type Person = {
  name?: string;
  age: number;
  gender: string;
};

type User = Required<Person>; // 所有变成必选
```

## 变成只读 Readonly
```typescript
type Person = {
  name: string;
  age: number;
  gender: string;
};

type User = Readonly<Person>; // 所有变成只读
```

## 挑选出来 Pick
场景：后台返回的数据很多，只需要其中的一部分。

```typescript
type Person = {
  name: string;
  age: number;
  gender: string;
};

type NameType = Pick<Person, 'name'>; // { name: string }
```

## 剔除出去 Omit
```typescript
type Person = {
  name: string;
  age: number;
  gender: string;
};

type NotName = Omit<Person, 'name'>; // { age: number; gender: string; }
```

## 定义索引签名 Record
场景：一般定义一个对象。

```typescript
type ObjType = Record<string, number>; // ObjType = { [x: string]: number; }

const obj:ObjType = {
    name: 'asd', // 报错 string 类型不能分配给 number 类型
    age: 123,
    sex: 123,
}
```

## 取出交集 Extract
```typescript
type AExtractB = Extract<'name' | 'age' | 'gender', 'name' | 'age'>; // "name" | "age"
type AExcludeB2 = Extract<1 | 2 | 3, 1 | 2>; // 1 | 2
```

## 取出差集 ExClude
```typescript
type AExtractB = Exclude<'name' | 'age' | 'gender', 'name' | 'age'>; // "gender"
type AExcludeB2 = Exclude<1 | 2 | 3, 1 | 2>; // 3
```

## 获取参数的类型 Parameters
```typescript
type Func = (name: string, age: number) => void;

type paramsType = Parameters<Func>; // [name: string, age: number]
```

## 获取返回值的类型 ReturnType
```typescript
type Func = (name: string, age: number) => string;

type returnType = ReturnType<Func>; // string
```

