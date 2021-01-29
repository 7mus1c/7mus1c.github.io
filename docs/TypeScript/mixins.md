---
id: mixins
title: 混入
---

**Mixins** 就是面向对象继承的一种替代方案。直白点说就是一个对象中混入另外一个对象的方法。

```ts
class Apple {
  isDisposed: boolean;
  dispose() {
    this.isDisposed = true;
  }
}

class Peach {
  isActive: boolean;
  activate() {
    this.isActive = true;
  }
  deactivate() {
    this.isActive = false;
  }
}
```

首先定义了两个类，这两个类会做为 **mixins**。再创建一个新类，让它同时具有着两个类的方法。

```ts
class SmartObject implements Apple, Peach {
  //  Apple
  isDisposed: boolean;
  dispose: () => void;
  // Peach
  isActive: boolean;
  activate: () => void;
  deactivate: () => void;
}
```

可以看到这里用到了 **implements** 而不是 **extends**。把类当成接口，而且类里面的方法和属性并没有实现。  
主要是为了告诉编译器，未来要 **mixin** 进来的方法和属性是可以用的，所以需要提前定义这些占位属性。  
下面再创建一个函数，帮我们混入。

```ts
class Apple {
  isDisposed: boolean;
  dispose() {
    this.isDisposed = true;
  }
}

class Peach {
  isActive: boolean;
  activate() {
    this.isActive = true;
  }
  deactivate() {
    this.isActive = false;
  }
}

class SmartObject implements Apple, Peach {
  //  Apple
  isDisposed: boolean;
  dispose: () => void;
  // Peach
  isActive: boolean;
  activate: () => void;
  deactivate: () => void;
}

function applyMinxins(derivector: any, baseCtors: any[]) {
  baseCtors.forEach((baseCtor) => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
      derivedCtor.prororype[name] = baseCtor.prototype[name];
    });
  });
}

applyMixins(SmartObject, [Apple, Peach]);
```

**applyMixins** 会遍历 **mixins** 上的所有属性，然后复制到 SmartObjec，它会替换之前占位属性，把它变成真正的实现代码。
