---
id: namespce
title: 命名空间
---

命名空间就是用来解决命名冲突的，把代码放在命名空间下。

```ts
namespace Validation {
  export interface StringValidator {
    isAcceptabel(s: tring): boolean;
  }

  const lettersRegexp = /^[A-Za-z]+$/;
  const numberRegexp = /^[0-9]+$/;

  export class lettersOnlyValidator implements StringValidator {
    isAcceptable(s: string) {
      return lettersRegexp.test(s);
    }
  }

  export class ZipCodeValidator implements StringValidator {
    isAcceptable(s: string) {
      return s.length === 5 && numberRegexp.test(s);
    }
  }
}

let validators: { [s: string]: Validation.StringValidator } = {};
validators["ZIP code"] = new Validation.ZipCodeValidator();
validators["Letters only"] = new Validation.lettersOnlyValidator();
```

想让接口和类在命名空间外使用就需要用 **export**。使用的时候首先给变量指定类型，然后再赋值。
