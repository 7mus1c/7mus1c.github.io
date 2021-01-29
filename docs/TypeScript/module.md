---
id: module
title: 模块
---

## 导出

### 导出声明

任何声明（比如变量，函数，类，类型别名或接口）都能够通过添加 export 关键字来导出。

```ts
export interface StringValidator {
  isAcceptable(str: string): boolean;
}

export const numberRegexp = /^[0-9]+$/;

export class zipCodeValidator implements StringValidator {
  isAcceptable(str: string): boolean {
    return str.length === 5 && numberRegexp.test(str);
  }
}
```

### 导出语句

```ts
class zipCodeValidator implements StringValidator {
  isAcceptable(str: string): boolean {
    return str.length === 5 && numberRegexp.test(str);
  }
}

export { zipCodeValidator };
export { zipCodeValidator as mainValidator };
```

导出语句可以通过 **as** 对导出的部分重命名。

### 重新导出

```ts
export class ParseIntBasedZipCodeValidator {
  isAcceptable(s: string) {
    return s.length === 5 && parseInt(s).toString() === s;
  }
}

// 导出原先的验证器但做了重命名
export { ZipCodeValidator as RegExpBasedZipCodeValidator } from "./ZipCodeValidator";
```

重新导出功能并不会在当前模块导入那个模块或定义一个新的局部变量。  
或者一个模块可以包裹多个模块，并把他们导出的内容联合在一起通过语法：**export \* from "module"**。

```ts
export * from "./StringValidator";
export * from "./LettersOnlyValidator";
export * from "./ZipCodeValidator";
```

## 导入

### 导入部分导出

```ts
import { ZipCodeValidator } from "./ZipCodeValidator";
```

通过 **{}** 可以导入导出文件内的部分内容,也可以对导入的内容重新命名;

```ts
import { ZipCodeValidator as ZCV } from "./ZipCodeValidator";
```

### 导入整个到变量

```ts
import * as validator from "./ZipCodeValidator";

let myValidator = new validator.ZipCodeValidator();
```

## 默认导出

每次只导出一个内容，视为默认导出，默认导出需要加上 **default** 关键字。

```ts
let $ = Jquery;
export default $;

import $ from "./Jquery";
```