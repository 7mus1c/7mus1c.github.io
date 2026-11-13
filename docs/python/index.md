# Python

# 第一阶段：Python 语言基础

> 本阶段学习 Python 语言本身，目标是能够读懂并编写 Python 代码。
> 项目环境、依赖管理、项目组织、配置、日志、异步工程实践和 Git，统一放在第二阶段。

## 一、Python 基础语法

### 1. 变量与基础数据类型

#### print

```python
# 在终端输出
print("Hello, World!")
# 在终端输出，不换行
print("Hello, World!", end=" ")
# 在终端输出，不换行
print("Hello, World!", end="、")
print("我们都在一行")
```

#### 变量

```python
a = 1
b = 2
c = a + b
print(c)

# 同时给多个变量赋值
x,y,z = 1,2,3

# 同时给多个变量 同一个值
a = b = c = 0
print(a,b,c)

# 交换变量的值
left = "left"
right = "right"
left,right = right,left
print(left,right)

# 变量命名规范 蛇形命名法 只能是字母、数字和下划线，且不能以数字开头
my_name = "zhangsan"

# 打印所有关键字
import keyword
print(keyword.kwlist)

# 变量区分大小写
Name = "zhangsan"
name = "lisi"
NAME = "wangwu"
print(Name, name, NAME)
```

#### 基础数据类型

- 整数 int
- 浮点数 float
- 字符串 str
- 布尔值 bool
- 没有类型 None
- 列表 list
- 元组 tuple
- 字典 dict
- 集合 set

##### 整数和浮点数

```python
age = 18
price = -20
# python 的整数没有大小限制，多大都行
big_number = 999999999999999999999999999999
# 大数字可以用下划线分隔，方便阅读
world_population = 7_000_000_000

pi = 3.1415926
height = 1.75
price = -9.9

a = 100
b = 100.0
print("a 的类型是：", type(a)) # <class, 'int'>
print("b 的类型是：", type(b)) # <class, 'float'>

# 常用函数
0.1 + 0.2  # 0.30000000000000004
# 四舍五入
round(0.1 + 0.2, 1)  # 0.3  保留 1 位小数
abs(-42)  # 42  取绝对值
max(1, 2, 3)  # 3  取最大值
min(1, 2, 3)  # 1  取最小值


# 整数加减乘除
1 + 1
1 - 1
1 * 1
1 / 1
1 // 1  # 整除
1 % 1  # 取余

# 浮点数加减乘除
1.1 + 1.1
1.1 - 1.1
1.1 * 1.1
1.1 / 1.1
1.1 // 1.1  # 整除
1.1 % 1.1  # 取余

```

##### 字符串

```python
# 单引号
name = 'zhangsan'
# 双引号
name = "zhangsan"
# 三引号 夸多行
name = '''这个是第一行
这是第二行
这是第三行'''
name = """这是第一行
这是第二行
这是第三行"""


# 引号嵌套
quote1= "I said: 'Hello'" # I said: 'Hello'
quote2= 'I said: "Hello"' # I said: "Hello"

# 字符串转义
"\n 这是换行符"
"制表符: 姓名\t年龄\t性别"
"反斜杠: C:\\Users\\Administrator\\Desktop"

# 字符串长度
len("Hello, World!")  # 13

# 字符串下标
name = "zhangsan"
name[0]  # z
name[1]  # h
name[-1]  # n
name[-2]  # a

# 字符串切片
name = "hello world"
name[0:5]  # hello   0 到 5（不包括 5）
name[6:11]  # world   6 到 11（不包括 11）
name[:5]  # hello   从 0 到 5（不包括 5）
name[6:]  # world   从 6 到 最后
name[:]  # hello world   从 0 到 最后

# 带步长的切片
number = "1234567890"
number[::2]  # 13579   从 0 到 最后，步长为 2 每两位取一个
number[::-1]  # 0987654321   从 最后 到 0，步长为 -1 倒序取
number[1::2]  # 24680   从 1 到 最后，步长为 2 每两位取一个



# 字符串拼接
name = "zhangsan"
age = 18
# 字符串不能跟数字直接运算 必须先转成字符串
a = name + " is " + str(age) + " years old" # zhangsan is 18 years old

# 字符串方法
msg = "hello WORLD"
msg.upper()  # HELLO WORLD  全大写
msg.lower()  # hello world  全小写
msg.title()  # Hello World  每个单词首字母大写
msg.capitalize()  # Hello world 仅首字母大写
msg.swapcase()  # HELLO world 大小写互换

# 查找和替换
msg.find("WORLD")  # 6  查找字符串的索引开始位置
msg.find("world")  # -1  查找字符串的索引开始位置，找不到返回 -1
msg.count("hello") # 1  统计字符串出现的次数
new_msg = msg.replace("WORLD", "Python")  # hello Python  字符串替换


"123".isdigit()  # True  判断字符串是否是数字
"123".isalpha()  # False  判断字符串是否是字母
"123".isalnum()  # True  判断字符串是否是字母或数字
"123".isspace()  # False  判断字符串是否是空格
"123".startswith("hello")  # False  判断字符串是否以指定字符串开头
"123".endswith("hello")  # False  判断字符串是否以指定字符串结尾
" 123 ".strip()  # 123  去除字符串两端的空格
" 123".lstrip()  # 123  去除字符串左边的空格
"123 ".rstrip()  # 123  去除字符串右边的空格

# 分割与合并
msg.split(" ")  # ['hello', 'WORLD']  字符串分割并且转成列表
msg.split(" ", 1)  # ['hello', 'WORLD']  字符串分割并且转成列表，最多分割一次
"→".join(["苹果", "香蕉", "橙子"])  # 苹果→香蕉→橙子  列表合并成字符串，默认使用→分割

# 字符串格式化
"我的名字是：{}，我今年{}岁了".format("张三", 18)  # 我的名字是：张三，我今年18岁了
"我的名字是：{name}，我今年{age}岁了".format(name="张三", age=18)  # 我的名字是：张三，我今年18岁了
"我的名字是：{0}，我今年{1}岁了".format("张三", 18)  # 我的名字是：张三，我今年18岁了

name = "张三"
age = 18
print(f"我叫{name}, 我今年{age}岁了")  # 我叫张三, 我今年18岁了
print(f"明年{age+1}岁了")  # 明年19岁了

score = 99.12
print(f"我的成绩是：{score:.2f}")  # 我的成绩是：99.12  保留两位小数
print(f"成绩是：{score:.0f}")  # 成绩是：99 不保留小数

print(f"{'左对齐':<10}|")  # 左对齐，占 10 个字符
print(f"{'右对齐':>10}|")  # 右对齐
print(f"{'居中':^10}|")   # 居中

# 格式化
big = 1234567890
print(f"{big:,}")  # 1,234,567,890  千位分隔符
print(f"{big:,.2f}")  # 1,234,567,890.00  千位分隔符和小数点后两位
print(f"百分比：{0.123456789 * 100:.2f}%")  # 百分比：12.35%  小数点后两位
```

##### 布尔值

```python
# 布尔值
true = True
false = False

# 比较运算
1 == 1  # True
1 != 1  # False
1 > 1  # False
1 < 1  # False
1 >= 1  # True
1 <= 1  # True

# 逻辑运算
true and false  # False
true or false  # True
not true  # False

# 成员运算
"zhangsan" in "zhangsan is a good man"  # True
"zhangsan" not in "zhangsan is a good man"  # False

# 统计有多少个 True
scores = [True, False, True, True, False]
sum(scores)  # 3 比如算有多少人通过 现在就是 3 人通过
```

##### None

```python
# None
a = None
b = None
a is None  # True
a is not None  # False

type(a)  # <class 'NoneType'>
```

#### 类型转换与检查

```python
# 类型转换
int("123")  # 123  字符串转整数
str(123)  # '123'  整数转字符串
float("123")  # 123.0  字符串转浮点数
bool("123")  # True  非空字符串转布尔值

# 类型检查
type(123)  # <class 'int'>
type("123")  # <class 'str'>
type(123.0)  # <class 'float'>
type(True)  # <class 'bool'>
type(None)  # <class 'NoneType'>

# isinstance
isinstance("123", str)  # True
isinstance(123, int)  # True
isinstance(123.0, float)  # True
isinstance(123, (int, float))  # True. 是否是 int 或 float 类型 参数可多选
isinstance(True, bool)  # True
isinstance(None, type(None))  # True

# 转整数
int("123")  # 123
int(123.0)  # 123
int(True)  # 1
int(False)  # 0

# 转浮点数
float("123")  # 123.0
float(123)  # 123.0
float(True)  # 1.0

# 转字符串
str(123)  # 123
str(123.0)  # 123.0
str(True)  # True
repr(str(123))  # '123'  转成字符串并且带引号

# 转布尔值
bool(123)  # True
bool(0)  # False
bool("")  # False
bool(" ")  # True
bool(None) # False
bool([])  # False
bool([1, 2, 3])  # True
bool({})  # False
bool({"name": "zhangsan"})  # True
```

#### 运算符

```python
# 算术运算
1 + 1  # 2
1 - 1  # 0
1 * 1  # 1
1 / 1  # 1.0
1 // 1  # 1  整除
1 % 1  # 0  取余
2 ** 3  # 8  幂运算
2 ** 3 ** 2  # 512  幂运算从右往左算

# 比较运算
1 == 1  # True
1 != 1  # False
1 > 1  # False
1 < 1  # False
1 >= 1  # True
1 <= 1  # True

# 链式比较
1 < 2 < 3  # True
1 < 2 > 3  # False
1 < 2 == 2  # True

# 字符串比较
"abc" < "bcd"  # True
"abc" > "bcd"  # False
"abc" == "abc"  # True
"abc" != "abc"  # False

# 逻辑运算
true and false  # False and 两个条件必须同时满足
true or false  # True   or 两个条件只要有一个满足
not true  # False   not 取反

# 复合赋值
x = 10
x += 5  # x = x + 5
x -= 5  # x = x - 5
x *= 5  # x = x * 5
x /= 5  # x = x / 5
x //= 5  # x = x // 5
x %= 5  # x = x % 5

# 成员运算
"zhangsan" in "zhangsan is a good man"  # True
"zhangsan" not in "zhangsan is a good man"  # False

# 身份运算
a = 1
b = 1
a is b  # True
a = 1
b = 2
a is b  # False

# is 和 == 的区别

# is 比较的是对象身份；普通值请使用 ==，不要依赖整数缓存等实现细节。
a = [1]
b = [1]
a is b  # False：两个不同的列表对象
a == b  # True：内容相等

# == 比较的是值
a = 1
b = 1
a == b  # True
a = 1
b = 2
a == b  # False


# 位运算
0b1010 & 0b1100  # 0b1000  按位与 就是说 1 和 1 才是 1，其他都是 0
0b1010 | 0b1100  # 0b1110  按位或 就是说 0 和 0 才是 0，其他都是 1
0b1010 ^ 0b1100  # 0b0110  按位异或 就是说 1 和 1 或 0 和 0 才是 0，其他都是 1
~0b1010  # -0b1011  按位取反 就是说 0 变 1，1 变 0
0b1010 << 2  # 0b101000  左移 2 位 就是说 0b1010 变成 0b101000
0b1010 >> 2  # 0b10  右移 2 位 就是说 0b1010 变成 0b10
```

### 2. Python 常用数据结构

列表、元组、字典、JSON 和集合共同构成日常 Python 数据处理的基础。下面分别保留它们的创建、增删改查、遍历、排序、切片、拷贝、解包和序列化用法。

#### 2.1 列表

```python
# 列表
names = ["zhangsan", "lisi", "wangwu"]
empty1 = []
empty2 = list()

list1 = list("hello")  # ['h', 'e', 'l', 'l', 'o']  字符串转列表

miedx = [1 , "hello", True, 3.14, None, [1, 2, 3]]  # 可以存储不同类型的数据

names[0] # 'zhangsan'
names[1]  # 'lisi'
names[-1]  # 'wangwu'
names[-2]  # 'lisi'

names[0:2]  # ['zhangsan', 'lisi']  切片
names[1:3]  # ['lisi', 'wangwu']
len(names)  # 3  列表长度

# 列表操作
list1 = [1, 2, 3]
list2 = [4, 5, 6]
list1 + list2  # [1, 2, 3, 4, 5, 6]  列表拼接
repeated = [0] * 5  # [0, 0, 0, 0, 0]  重复

3 in list1  # True  判断元素是否在列表中
7 in list2 # False
7 not in list2  # True

# 列表方法
numbers = [1, 2, 3, 3, 2, 3, 1]
numbers.count(2)  # 2  统计元素出现的次数
numbers.index(3)  # 2  查找元素第一次出现的索引
max(numbers)  # 3  查找最大值
min(numbers)  # 1  查找最小值
sum(numbers)  # 12  求和


# 遍历列表
for name in names:
    print(f"名字：{name}")

# 通过索引遍历
for index in range(len(names)):
    print(f"索引：{index}，名字：{names[index]}")

# enumerate 通过枚举遍历（推荐）
for index, name in enumerate(names):
    print(f"索引：{index}，名字：{name}")

# 通过枚举遍历，并指定索引的起始值
for index, name in enumerate(names, start=1):
    print(f"索引：{index}，名字：{name}")

# 增删改查
fruits = ["苹果", "香蕉",]
fruits.append("橘子")  # 在列表末尾添加元素
fruits.insert(1, "草莓")  # 在列表指定位置插入元素
fruits.extend(["葡萄", "西瓜"])  # 在列表末尾添加多个元素

fruits.remove("香蕉")  # 删除列表中第一个匹配的元素
fruits.pop(1)  # 删除列表中指定位置的元素
del fruits[0]  # 删除列表中指定位置的元素
del fruits[1:3]  # 删除列表中指定位置的元素

fruits[1:4] = ["草莓", "西瓜"]  # 替换列表中下标 1 - 3位置的元素


fruits.index("苹果")  # 0  查找元素第一次出现的索引
fruits.count("苹果")  # 1  统计元素出现的次数
"苹果" in fruits  # True  判断元素是否在列表中

fruits.clear()  # 清空列表

# 切片与排序
fruits = ["苹果", "香蕉", "草莓", "西瓜"]
fruits[1:3] # ['香蕉', '草莓']  切片
fruits[::2] # ['苹果', '草莓']  步长为2
fruits[::-1] # ['西瓜', '草莓', '香蕉', '苹果']  反转
fruits[7:2:-1] # ['西瓜', '草莓', '香蕉']  从后往前取，步长为-1

numbers = [85, 192 ,79, 339, 50]
# 改变原数组
numbers.sort()  # [39, 50, 79, 85, 92]  排序 默认升序
numbers.sort(reverse=True)  # [92, 85, 79, 50, 39]  降序
# 不改变原数组
sorted(numbers)  # [39, 50, 79, 85, 92]  排序
sorted(numbers, reverse=True)  # [92, 85, 79, 50, 39]  降序

strings = ["abc", "ab", "a"]
sorted(strings, key=len)  # ['a', 'ab', 'abc']  按照字符串长度升序
sorted(strings, key=len, reverse=True)  # ["abc", "ab", "a"] 按照字符串长度降序


students = [
    {"name": "zhangsan", "age": 18},
    {"name": "lisi", "age": 20},
    {"name": "wangwu", "age": 19},
]
# 按照年龄升序
sorted(students, key=lambda x: x["age"])
# 按照年龄降序
sorted(students, key=lambda x: x["age"], reverse=True)

# 反转列表
numbers.reverse()  # [50, 39, 79, 92, 85]  反转列表
numbers[::-1]  # [50, 39, 79, 92, 85]  切片反转列表 并返回新列表
list(reversed(numbers))  # [50, 39, 79, 92, 85]  反转列表返回新列表


# 深拷贝浅拷贝
a = [1, 2, 3]
b = a
b[0] = 4
print(a)  # [4, 2, 3]  修改 b 也会影响 a，因为 a 和 b 指向同一个列表

copy1 = a.copy() # 浅拷贝
copy2 = a[:]  # 浅拷贝
copy3 = list(a)  # 浅拷贝

copy1[0] = 5
print(a)  # [4, 2, 3]  修改 copy1 不会影响 a，因为 copy1 和 a 指向不同的列表

list1 =  [[1, 2], [3, 4]]
list2 = list1.copy()  # 浅拷贝
list2[0][0] = 5
# 浅拷贝它只复制"外层容器"，里面的嵌套可变对象（子 list、子 dict 等）还是和原对象共享同一份。
# 所以你改了拷贝里嵌套对象的"内容"，原对象也跟着变。 只有基本数据类型不受影响
print(list1)  # [[5, 2], [3, 4]]

# 深拷贝
import copy
list3 = copy.deepcopy(list1)  # 深拷贝
list3[0][0] = 6
print(list1)  # [[5, 2], [3, 4]]  修改 list3 不会影响 list1，因为 list3 和 list1 指向不同的列表

# 列表拼接和解包
a = [1, 2]
b = [3, 4]
c = [5, 6]
print(a + b + c)  # [1, 2, 3, 4, 5, 6]  列表拼接
print([*a, *b, *c])  # [1, 2, 3, 4, 5, 6]  列表解包

# 判断列表是否为空
empty = []
if not empty:
    print("列表为空")

if len(empty) == 0:
    print("列表为空")

# 最大值和最小值的索引
numbers = [1, 2, 3, 4, 5]
max_index = numbers.index(max(numbers))  # 4  最大值的索引
min_index = numbers.index(min(numbers))  # 0  最小值的索引

# 推导式
numbers = [1, 2, 3, 4, 5]
squares = [x ** 2 for x in numbers]  # [1, 4, 9, 16, 25]  列表推导式
even_numbers = [x for x in numbers if x % 2 == 0]  # [2, 4]  列表推导式
even_squares = [x ** 2 for x in numbers if x % 2 == 0]  # [4, 16]  列表推导式
```

#### 2.2 元组

```python
# 元组
tuple1 = (1, 2, 3)
tuple2 = 1, 2, 3
tuple3 = tuple([1, 2, 3])  # 列表转元组
tuple4 = tuple("hello")  # 字符串转元组
tuple5 = ()  # 空元组
tuple6 = (1,)  # 单个元素的元组，注意逗号 不加逗号就是数字了



tuple1[0]  # 1  元组索引
tuple1[-1]  # 3  元组索引
tuple1[0:2]  # (1, 2)  元组切片
len(tuple1)  # 3  元组长度
1 in tuple1 # True  判断元素是否在元组中
tuple4.count("h")  # 1  统计元素出现的次数
tuple4.index("e")  # 1  查找元素第一次出现的索引

# 遍历元组
data = (1, 2, 3, 4, 5)
for item in data:
    print(item)

# 元组不可变
tuple1[0] = 4  # 报错

tuple7 = (1, 2, [3, 4])
tuple7[2][0] = 5  # 修改元组中嵌套的列表
print(tuple7)  # (1, 2, [5, 4])  元组中的列表被修改了

# 元组解包
point = (100, 200)
x, y = point
print(x)  # 100
print(y)  # 200

first, *middle = (1, 2, 3, 4, 5)
print(first)  # 1
print(middle)  # [2, 3, 4, 5]

first, *middle, last = (1, 2, 3, 4, 5)
print(first)  # 1
print(middle)  # [2, 3, 4]
print(last)  # 5

*first, last = (1, 2, 3, 4, 5)
print(first)  # [1, 2, 3, 4]
print(last)  # 5

name, _, age = ("zhangsan", "male", 18)
print(name)  # zhangsan
print(age)  # 18
# 实际场景
import os
filename = "report_2024.xlsx"
name, ext = os.path.splitext(filename)
print(name)  # report_2024
print(ext)  # .xlsx

# 什么时候用元组 什么时候用列表？
# 1. 函数返回多个值时，默认就返回的是元组
def get_max_min(numbers):
    return max(numbers), min(numbers)

max_number, min_number = get_max_min([1, 2, 3, 4, 5])
print(max_number)  # 5
print(min_number)  # 1

# 2. 字典的键必须是不可变类型，元组可以用来当键 列表不行
locations = {
    (35.6895, 139.6917): "Tokyo",
    (40.7128, 74.0060): "New York",
}
print(locations[(35.6895, 139.6917)])  # Tokyo

# 3. 元组比列表更节省内存
import sys
print(sys.getsizeof((1, 2, 3)))  # 72
print(sys.getsizeof([1, 2, 3]))  # 140
```

#### 2.3 字典（对象）

```python
# 创建字典
person = {"name": "zhangsan", "age": 18, "gender": "male"}
# 通过构造函数创建字典
person = dict(name="zhangsan", age=18, gender="male")
# 通过键值对创建字典
person = dict([("name", "zhangsan"), ("age", 18), ("gender", "male")])
# key 创建相同值的字典
person = dict.fromkeys(["name", "age", "gender"], 123)

# 访问字典
person["name"]  # "zhangsan"
person.get("name")  # "zhangsan"
person.get("address")  # None  不存在返回 None
person.get("address", "unknown")  # "unknown"  不存在返回默认值 unknown

# 判断字典是否包含某个键
"age" in person  # True
"address" in person  # False

# 修改字典
person["name"] = "lisi"  # 修改键值对
person["address"] = "Beijing"  # 添加键值对 不存在时就是添加
person.update({"name": "wangwu", "age": 20})  # 修改键值对 添加键值对 有就修改 没有就添加
person.setdefault("address", "unknown")  # 设置默认值 不存在时就是添加 存在就算了

# 字典的键必须是不可变类型，元组可以用来当键 列表不行
locations = {
    (35.6895, 139.6917): "Tokyo",
    (40.7128, 74.0060): "New York",
}
print(locations[(35.6895, 139.6917)])  # Tokyo

# 删除字典
del person["name"]  # 删除键值对
person.pop("age")  # 删除键值对并返回值
person.popitem()  # 删除最后一个键值对并返回值
person.clear()  # 清空字典
del person  # 删除字典

# 遍历字典
person = {"name": "zhangsan", "age": 18, "gender": "male"}
person.keys()  # dict_keys(['name', 'age', 'gender'])  返回字典的键
person.values()  # dict_values(['zhangsan', 18, 'male'])  返回字典的值
person.items()  # dict_items([('name', 'zhangsan'), ('age', 18), ('gender', 'male')])  返回字典的键值对

# 遍历字典的键
for key in person.keys():
    print(key, person[key])
# 遍历字典的值
for value in person.values():
    print(value)
# 遍历字典的键值对
for key, value in person.items():
    print(key, value)
# 遍历字典
for key in person:
    print(key, person[key])

# 找最开分的科目
scores = {"math": 90, "english": 85, "chinese": 95}
max_score = max(scores, key=scores.get)  # "chinese" key=scores.get 表示按照 scores.get 的值来排序

# 找到 90 分以上的科目
for key, value in scores.items():
    if value >= 90:
        print(key, value)
# 合并字典
scores.update({"physics": 80, "chemistry": 85})
print(scores)  # {'math': 90, 'english': 85, 'chinese': 95, 'physics': 80, 'chemistry': 85}

# 解包运算符 * 和 **
person = {"name": "zhangsan", "age": 18, "gender": "male"}
print(*person)  # name age gender  解包字典的键
# ** 只能用于函数调用或字典构造，不能直接传给 print
def show_person(name, age, gender):
    print(name, age, gender)
show_person(**person)
# 也可以用解包来合并字典
person = {"name": "zhangsan", "age": 18, "gender": "male"}
person2 = {"name": "lisi", "age": 20, "gender": "female"}
person3 = {**person, **person2}

# | 运算符合并字典
person = {"name": "zhangsan", "age": 18, "gender": "male"}
person2 = {"name": "lisi", "age": 20, "gender": "female"}
person3 = person | person2
```

#### 2.4 JSON

```python
import json

user_data = {
    "name": "zhangsan",
    "age": 18,
    "gender": "male",
    "scores": [90, 85, 95],
    "address": {
        "city": "Beijing",
        "zip_code": 100000
    }
}

# 将字典转换为 JSON 字符串
# ensure_ascii=False 表示不使用 ASCII 编码，解决中文乱码问题 indent=2 表示缩进 2 个空格
json_str = json.dumps(user_data, ensure_ascii=False, indent=2)
# 字符串转换为字典
str_2_json = json.loads(json_str)
```

#### 2.5 集合

就是 set 会自动去重

```python
# 创建集合
set1 = {1, 2, 3, 4, 5}
set2 = set([1, 2, 3, 4, 5])
set3 = set((1, 2, 3, 4, 5))
set4 = set("12345")

# 添加元素
set1.add(6)  # {1, 2, 3, 4, 5, 6}
# 批量添加
set1.update([7, 8, 9])  # {1, 2, 3, 4, 5, 6, 7, 8, 9}
# 删除元素
set1.remove(1)  # {2, 3, 4, 5, 6, 7, 8, 9}
set1.discard(10)  # {2, 3, 4, 5, 6, 7, 8, 9}  不存在不会报错
set1.pop()  # 1  随机删除一个元素并返回删掉的元素
set1.clear()  # 清空集合

# 集合运算
set1 = {1, 2, 3, 4, 5}
set2 = {4, 5, 6, 7, 8}
# 并集
print(set1 | set2)  # {1, 2, 3, 4, 5, 6, 7, 8} 取两个集合的合并，并且去重
# 交集
print(set1 & set2)  # {4, 5}    取两个集合的相同部分
# 差集
print(set1 - set2)  # {1, 2, 3}  取 set1 中有 set2 中没有的部分
# 对称差集
print(set1 ^ set2)  # {1, 2, 3, 6, 7, 8} 取两个集合的不同部分

# 集合判断
a = {1, 2, 3}
b = {1, 2, 3, 4, 5}
c = {1, 2, 3}
# 子集判断
print(a < b)  # True  a 是 b 的子集
# 超集判断
print(a > b)  # False  a 不是 b 的超集
# 等价判断
print(a == c)  # True  a 和 c 等价
# 是否有没有交集
d = {4, 5}
print(a.isdisjoint(d))  # True  a 和 d 没有交集


# 案例
# 1. 列表去重
a = [1, 3, 2, 5, 4, 1, 2, 3]
b = list(set(a)) # [1, 2, 3, 4, 5]
# 去重后保持顺序不变
c = list(dict.fromkeys(a)) # [1, 3, 2, 5, 4]

# 2. 快速判断两个列表的差异
a = [1, 2, 3, 4, 5]
b = [4, 5, 6, 7, 8]
print(set(a) - set(b))  # {1, 2, 3}  a 中有 b 中没有的元素
print(set(b) - set(a))  # {6, 7, 8}  b 中有 a 中没有的元素
print(set(a) & set(b))  # {4, 5}  a 和 b 中都有的元素

#3.检查用户输入是否合法
user_input = "admin"
if user_input in {"admin", "root", "guest"}:
    print("用户名合法")
else:
    print("用户名不合法")

# 不可变集合（冻结集合），不能修改，不能添加，不能删除
a = frozenset([1, 2, 3, 4, 5])
a.add(6)  # ❌ AttributeError: 'frozenset' object has no attribute 'add'
a.remove(1)  # ❌ AttributeError: 'frozenset' object has no attribute 'remove'
a.update([6, 7, 8])  # ❌ AttributeError: 'frozenset' object has no attribute 'update'
```

### 3. 流程控制

#### 3.1 条件判断

```python
age = 18

if age >= 18:
    print("成年")
elif age >= 6:
    print("少年")
else:
    print("儿童")

name = "zhangsan"

if name == "zhangsan":
    print("张三")
elif name == "lisi":
    print("李四")
elif not name == "wangwu":
    print("王五")
else:
    print("其他")

# 判断是否为空
if not name:
    print("姓名不能为空")

# 判断是否为数字
if age.isdigit():
    print("年龄是数字")
else:
    print("年龄不是数字")

# 判断是否为字符串
if isinstance(name, str):
    print("name 是字符串")
else:
    print("name 不是字符串")

# 判断是否是 None
if name is None:
    print("name 是 None")

# 三元表达式
print("成年") if age >= 18 else print("未成年")

nums = [1, 2, -1, -2]
labels = ["正数" if n > 0  else "负数" for n in nums]
print(labels)  # ['正数', '正数', '负数', '负数']

# 短路赋值
a = 1
b = 2
c = 3
d = 4
a = b if a is None else a
b = c if b is None else b
c = d if c is None else c
print(a, b, c, d)  # 2 3 4 4

name = "" or "zhangsan"


# match 语句
# match 语句可以匹配多个值，类似于 switch 语句
status_code = 404
match status_code:
    case 200:
        print("请求成功")
    case 404:
        print("请求失败")
    case 500:
        print("服务器错误")
    case _: # _是通配符 相当于 default
        print("未知错误")

value = 10
match value:
    case int(n) if n > 0:
        print("正数")
    case int(n) if n < 0:
        print("负数")
    case int(n):
        print("零")
    case _:
        print("未知类型")
```

#### 3.2 循环

```python
# for 循环
# range(1, 10) 表示从 1 到 9 只有一个参数就是从 0 开始到哪结束
for i in range(1, 10):
    print(i) # 1 2 3 4 5 6 7 8 9

# while 循环
i = 1
while i < 10:
    print(i) # 1 2 3 4 5 6 7 8 9
    i += 1

# break 跳出循环
for i in range(1, 10):
    if i == 5:
        break
    print(i)

# continue 跳过本次循环
for i in range(1, 10):
    if i == 5:
        continue
    print(i)

# for else 循环
for i in range(1, 10):
    print(i)
else:
    print("循环结束")

# while else 循环
i = 1
while i < 10:
    print(i)
    i += 1
else:
    print("循环结束")


# pass 占位符
x = 10
if x > 10:
    pass
else:
    print("x 小于 10")

# 嵌套循环
for i in range(1, 10):
    for j in range(1, 10):
        print(i, j)
```

### 4. 函数

```python
def hello():
    print("hello world")

# 调用函数
hello()

# 函数参数
def add(a, b):
    return a + b

# 调用函数
print(add(1, 2))  # 3

# 默认参数
def add(a, b=10):
    return a + b

# 调用函数
print(add(1))  # 11

# 可变参数
def add(*args):
    """
    可变参数 可以传入任意个参数
    参数类型为元组
    """
    sum = 0
    for i in args:
        sum += i
    return sum

# 调用函数
print(add(1, 2, 3, 4, 5))  # 15

# 函数文档字符串，可以拿到函数内部的注释
# 在 ai 编程中 通过函数文档字符串可以拿到对 tools 的描述 从而变成给 LLM 的提示词
print(add.__doc__)

# 字典参数
def add(**kwargs):
    """
    字典参数 可以传入任意个参数
    参数类型为字典
    """
    sum = 0
    for i in kwargs.values():
        sum += i
    return sum

# 调用函数
print(add(a=1, b=2, c=3))  # 6


# 多个返回值
def add(a, b):
    return a + b, a - b

# 调用函数
print(add(1, 2))  # (3, -1)

# 函数返回多个值时，返回的是一个元组
# 可以通过解包的方式获取返回值
a, b = add(1, 2)
print(a, b)  # 3 -1

# 函数返回多个值时，也可以通过列表的方式获取返回值
a, b = list(add(1, 2))
print(a, b)  # 3 -1

# 作用域和闭包
# 全局变量
a = 10

def add():
    global a  # 声明全局变量 不推荐
    a = 20
    print(a)

add()  # 20
print(a)  # 20

# nonlocal 关键字
# nonlocal 关键字用于声明非局部变量，即函数内部的变量
def outer():
    a = 10

    def inner():
        nonlocal a  # 声明非局部变量 这个 a 实际是外部的 a
        a = 20
        print(a)

    inner()
    print(a)

outer()  # 20 10

# 闭包
# 闭包就是函数内部定义的变量在外部可以访问到
def make_counter():
    count = 0

    def counter():
        nonlocal count
        count += 1
        return count

    return counter

c1 = make_counter()
c2 = make_counter()

print(c1())  # 1
print(c1())  # 2
print(c2())  # 1
print(c2())  # 2

# 递归函数
def factorial(n):
    if n < 0:
        raise ValueError("n 必须是非负整数")
    if n in (0, 1):
        return 1
    return n * factorial(n - 1)

print(factorial(5))  # 120

# 递归函数的优化
def factorial(n, result=1):
    if n < 0:
        raise ValueError("n 必须是非负整数")
    if n in (0, 1):
        return result
    return factorial(n - 1, result * n)

print(factorial(5))  # 120


# 匿名函数 lambda
add = lambda a, b: a + b
print(add(1, 2))  # 3
```

#### 补充：模块导入语法

一个 .py 文件就是一个模块，模块名就是文件名（不包含后缀 .py）。
Python 自带了大量的标准库模块，可以直接导入使用。例如：math sys os datetime random time json re 等。

```python
# 导入整个模块 math 是计算数学的模块
import math
print(math.pi)  # 3.141592653589793
print(math.sqrt(16))  # 4.0 sqrt是求平方根的函数
print(math.pow(2, 10))  # 1024.0 pow是求幂的函数
print(math.floor(3.14))  # 3 floor是向下取整的函数
print(math.ceil(3.14))  # 4 ceil是向上取整的函数

# 导入模块中的某个函数
from math import sqrt

# 导入模块并且重命名
import math as m
print(m.sqrt(16))  # 4.0

# 导入模块中的某个函数并重命名
from math import sqrt as square_root
print(square_root(16))  # 4.0

# 导入模块中的所有函数 直接使用函数名调用
from math import *
print(pi)  # 3.141592653589793
print(sqrt(16))  # 4.0
print(pow(2, 10))  # 1024.0
print(floor(3.14))  # 3
print(ceil(3.14))  # 4

# 模块的查找顺序：1. 当前目录 2. 环境变量 PYTHONPATH 指定的目录 3. 标准库目录 4. 第三方库目录


# 内置属性
# __name__ 模块的名称
# __doc__ 模块的文档字符串
# __file__ 模块的文件名
# __package__ 模块的包名
# __path__ 模块的路径
# __version__ 模块的版本号
# __author__ 模块的作者
# __all__ 模块的公开接口
# __builtins__ 内置模块
# __import__ 导入模块
# __init__ 初始化模块
# __main__ 主模块
import math
print(math.__name__)  # math
print(math.__doc__)  # math module
print(math.__file__)  # /usr/lib/python3.9/math.py
print(math.__package__)  # math
# `math` 是扩展模块，不保证提供 `__path__` 或 `__version__`。
print(getattr(math, "__path__", None))
print(getattr(math, "__version__", "未提供版本属性"))

# 直接在模块中运行 __name__
print(__name__)  # __main__
# 如果模块被导入，则 __name__ 的值为模块名
import math
print(math.__name__)  # math
if __name__ == "__main__":
    print("直接运行")
else:
    print("被导入")

# __init__.py 文件
# 它的作用就是
# 1. 让目录也变成一个包，让里面的文件可以被导入 python3.3 + 引入命名空间包 技术上不再是必须
# 2. 可以在目录中定义一些初始化代码， 让被导入时自动执行
# 3. 统一导出，可以在 __init__.py 中定义 可以直接导出的a, b, c 也能用__all__ = ['a', 'b', 'c']来定义

print(f"初始化 utils 包...")

from .add import add
from .multiply import multiply
from .capitalize import capitalize
from .read_file import read_file

# 导入 utils 包中的所有函数
from utils import *
# 导入 utils 包中的函数
from utils import add, multiply, capitalize, read_file

# 相对路径和绝对路径
# 相对路径
from .add import add
# 绝对路径
from utils.add import add



# __all__ 是一个列表，里面是模块中可以被导入的函数名
# 如果没有定义 __all__，则默认导入模块中的所有函数
def add (a, b):
    return a + b

def multiply(a, b):
    return a * b

def capitalize(s):
    return s.capitalize()

def read_file(file_path):
    return open(file_path, 'r').read()

# 如果没有定义 __all__，则默认导入模块中的所有函数
__all__ = ['add', 'multiply', 'capitalize', 'read_file']
```

### 5. 面向对象编程

```python
# 类
class Dog:
    def __init__(self, name, age):
        # self 就是当前对象本身 也就是自己
        self.name = name
        self.age = age

    def bark(self):
        print(f'{self.name} : 汪汪汪')

    def eat(self, food):
        print(f'{self.name}在吃{food}')

# 创建对象
dog = Dog('旺财', 3)
dog2 = Dog('小黑', 2)
# 调用方法
dog.bark()  # 旺财 : 汪汪汪
dog.eat('骨头')  # 旺财在吃骨头
dog2.bark()  # 小黑 : 汪汪汪
dog2.eat('鱼')  # 小黑在吃鱼

# 判断对象是否是某个类的实例
print(isinstance(dog, Dog))  # True
print(isinstance(dog, str))  # False

# 判断对象是否有某个属性
print(hasattr(dog, 'name'))  # True
print(hasattr(dog, 'age'))  # True
print(hasattr(dog, 'color'))  # False



# 类的继承
class Animal:
    def __init__(self, name, age):
        self.name = name
        self.age = age

    def bark(self):
        print(f'{self.name} : 汪汪汪')

    def eat(self, food):
        print(f'{self.name}在吃{food}')


class Dog(Animal):
    def __init__(self, name, age, color):
        # super() 调用父类的方法
        # super().__init__(name, age) 执行父类的 __init__ 方法
        super().__init__(name, age)
        self.color = color

    # 重写了 bark 的方法
    def bark(self):
        print(f'{self.name} : 汪汪汪汪汪汪')


dog = Dog('旺财', 3, '白色')
dog.bark()  # 旺财 : 汪汪汪汪汪汪
dog.eat('骨头')  # 旺财在吃骨头



# 工厂方法
class Date:
    def __init__(self, year, month, day):
        self.year = year
        self.month = month
        self.day = day

    def __str__(self):
        return f'{self.year}-{self.month}-{self.day}'

    # 静态方法装饰器
    @staticmethod
    def is_leap_year(year):
        return year % 4 == 0 and year % 100 != 0 or year % 400 == 0

    # @classmethod 装饰器，表示这个方法是一个类方法，不是实例方法 可以理解为带 cls 静态方法
    @classmethod
    def form_str(cls, s):
        # cls 代表 class 本身
        y,m,d = s.split('-')
        return cls(int(y), int(m), int(d))



print(Date.is_leap_year(2020))  # True
print(Date.form_str('2021-01-01'))  # 2021-1-1
print(Date(2021, 1, 1))  # 2021-1-1
```

### 6. 迭代器与生成器

- 迭代器iter：一个对象，它有一个 next 方法，每次调用 next 方法，返回下一个值，如果没有下一个值了，就抛出 StopIteration 异常
- 生成器：一个函数，它有一个 yield 关键字，每次调用 yield 关键字，返回一个值，并且函数会暂停执行，等待下一次调用 yield 关键字

```python
# 迭代器
numbers = [1, 2, 3, 4, 5]
# 创建一个迭代器
iterator = iter(numbers)
# 调用 next 方法，返回下一个值
print(next(iterator))  # 1
print(next(iterator))  # 2
print(next(iterator))  # 3
print(next(iterator))  # 4
print(next(iterator))  # 5
print(next(iterator))  # StopIteration

# 生成器
def fibonacci(n):
    a, b = 0, 1
    for _ in range(n):
        yield a
        a, b = b, a + b

# 创建一个生成器
generator = fibonacci(10)
# 调用 next 方法，返回下一个值
print(next(generator))  # 0
print(next(generator))  # 1
print(next(generator))  # 1
print(next(generator))  # 2
print(next(generator))  # 3
print(next(generator))  # 5

def step():
    yield 1
    yield 2
    yield 3
    yield 4
    yield 5

# 创建一个生成器
generator = step()
# 调用 next 方法，返回下一个值
print(next(generator))  # 1
print(next(generator))  # 2
print(next(generator))  # 3
print(next(generator))  # 4
print(next(generator))  # 5
print(next(generator))  # StopIteration

```

#### 补充：异步函数语法

本节只保留 `async`、`await` 和基础任务调度语法；事件循环、并发控制、超时、取消和 Agent 调用见第二阶段“异步编程进阶”。

```python
import asyncio

# 异步函数
async def get_data():
    print('开始获取数据')
    # 模拟等待1秒
    await asyncio.sleep(1)
    print('数据获取完成')
    return 'data'

# 异步函数需要用 asyncio.run() 来运行
result = asyncio.run(get_data())

# 多个异步同时执行
async def main():
    # 创建一个任务列表
    tasks = [
        asyncio.create_task(get_data()),
        asyncio.create_task(get_data()),
        asyncio.create_task(get_data()),
    ]
    # 等待所有任务完成 gather 把多个协程并发执行
    await asyncio.gather(*tasks)

# 运行异步函数
asyncio.run(main())
```

### 7. 类型注解

类型注解主要服务于阅读、补全和静态检查，Python 运行时默认不会因为赋值类型不匹配而自动报错。容器和可选值可以这样写：

```python
from typing import Any, Optional, Union

name: str = '张三'
age: int = 18
is_student: bool = True
name = 123  # 不会报错
age = '18'  # 不会报错
is_student = 'true'  # 不会报错

# 类型注解
def add(a: int, b: int) -> int:
    return a + b

def log() -> None: # None 表示没有返回值
    print('log')

scores: list[int] = [90, 85, 95]
metadata: dict[str, str] = {"source": "test"}
maybe_name: Optional[str] = None
identifier: Union[int, str] = 123
payload: Any = {"raw": True}  # Any 会放宽静态检查，应限制使用范围
```

### 8. 文件与数据处理基础

文本文件应明确编码，优先使用 `with` 自动关闭文件；`pathlib.Path` 比手写字符串路径更适合项目代码。

```python
# os 就是操作系统模块
import os
from pathlib import Path
# tempfile 就是临时文件模块
import tempfile

# tempfile.gettempdir() —— 获取系统的临时目录根路径
# os.path.join(a, b) —— 跨平台拼接路径
# 拼出的结果就是：系统临时目录/demo
DEMO_DIR = os.path.join(tempfile.gettempdir(), 'demo')
# 创建目录 exist_ok=True 目录已存在时不报错
os.makedirs(DEMO_DIR, exist_ok=True)

# 打印最终创建好的目录完整路径，方便确认文件落在哪
print(DEMO_DIR)

# 创建演示文件
demo_file = os.path.join(DEMO_DIR, 'demo.txt')

# 写入文件 文件地址，模式w是写入，encoding='utf-8'是编码格式
f = open(demo_file, 'w', encoding='utf-8')
# 写入文件内容
f.write('hello world')
# 关闭文件 否则资源泄露
f.close()

# 读取文件
f = open(demo_file, 'r', encoding='utf-8')
content = f.read()
print(content)
f.close()

# 删除文件
os.remove(demo_file)

# 删除目录
os.rmdir(DEMO_DIR)

# pathlib 与 with 的写法
path = Path(DEMO_DIR) / "pathlib-demo.txt"
path.write_text("hello pathlib", encoding="utf-8")
with path.open("r", encoding="utf-8") as file:
    print(file.read())
path.unlink()
```

### 9. 异常处理基础

捕获具体异常并在需要时重新抛出；`else` 只在没有异常时执行，`finally` 适合释放资源。自定义异常可以让调用方区分业务失败和系统失败。

```python
class InvalidInputError(ValueError):
    """输入不符合业务规则。"""


try:
    value = int("not-a-number")
except ValueError as e:
    print("输入不是整数", e)
    raise InvalidInputError("年龄必须是整数") from e
else:
    print("解析成功", value)
finally:
    print("本次解析结束")
```

# 第二阶段：Python 工程基础

> 本阶段学习如何把 Python 代码组织成可维护、可协作、可复现、可部署的项目。
> 目标是能够独立搭建和管理规范的 Python 项目，并为后续 AI Agent 工程化打好基础。

## 一、Python 项目环境与依赖管理概述

### 1. 什么是 Python 项目环境？

一个 Python 项目要正常运行，不仅需要 Python 代码，还需要对应的运行环境。

通常，一个 Python 项目的运行环境主要包括：

- **Python 解释器**：负责执行 Python 代码。
- **第三方依赖包**：项目运行过程中需要使用的外部库。
- **依赖版本**：每个依赖包具体使用哪个版本。
- **环境配置**：项目运行时需要的相关配置，例如 API Key、数据库地址等。

例如，一个 AI Agent 项目可能依赖：

```
Python 3.12
LangChain 1.x
LangGraph 1.x
FastAPI
httpx
pydantic
```

这些组件共同构成了项目的运行环境。

如果不同开发者使用的 Python 版本或第三方依赖版本不一致，就可能出现：

- 某些代码在本地可以运行，在服务器上却无法运行。
- 第三方库升级后，原来的代码出现兼容性问题。
- 不同项目之间的依赖版本发生冲突。
- 项目迁移到其他电脑后，需要重新排查环境问题。

因此，开发 Python 项目时，需要对项目环境进行规范管理。

### 2. 为什么需要虚拟环境？

假设我们同时开发两个 AI Agent 项目。

项目 A：

```
项目 A
├── Python 3.12
└── LangChain 1.x
```

项目 B：

```
项目 B
├── Python 3.12
└── LangChain 0.x
```

两个项目依赖的 LangChain 版本不同。

如果所有依赖都安装在同一个 Python 全局环境中，那么安装或升级某个项目的依赖时，就可能影响另一个项目。

例如：

1. 项目 A 需要 LangChain 1.x。
2. 项目 B 需要 LangChain 0.x。
3. 如果在全局环境中安装 LangChain 1.x，项目 B 可能无法正常运行。
4. 如果再降级到 LangChain 0.x，项目 A 又可能受到影响。

这就是依赖冲突。

**虚拟环境（Virtual Environment）就是为了解决不同项目之间的环境隔离问题。**

它可以为每个项目创建独立的 Python 环境，使不同项目能够使用各自需要的依赖版本。

例如：

```
项目 A
└── .venv
    └── LangChain 1.x

项目 B
└── .venv
    └── LangChain 0.x
```

这样，两个项目的依赖就不会互相干扰。

### 3. 为什么需要依赖管理？

虚拟环境解决的是不同项目之间的环境隔离问题，但它并不能自动保证项目依赖版本的一致性。

例如：

项目 A 的依赖：

```
langchain==1.0.0
fastapi==0.115.0
```

项目 B 的依赖：

```
langchain==1.0.0
fastapi==0.115.0
```

如果项目 A 和项目 B 都需要在其他电脑上运行，就需要能够准确记录它们使用的依赖及版本。

否则，重新安装依赖时，可能安装到不同版本，导致项目行为发生变化。

**依赖管理（Dependency Management）就是用来管理项目所需的第三方依赖及其版本的。**

它主要解决以下问题：

- 项目需要安装哪些依赖？
- 每个依赖使用什么版本？
- 不同依赖之间是否存在版本冲突？
- 如何在其他电脑上安装相同的依赖？
- 如何更新、删除和锁定依赖？

例如，可以通过 `pyproject.toml` 声明项目依赖，再通过 `uv.lock` 锁定具体依赖版本，从而提高项目环境的可复现性。

### 4. 环境隔离与依赖管理的区别

两者解决的问题不同：

| 对比       | 环境隔离                 | 依赖管理                                        |
| ---------- | ------------------------ | ----------------------------------------------- |
| 核心目的   | 防止不同项目相互干扰     | 管理项目依赖及版本                              |
| 解决的问题 | 不同项目使用不同运行环境 | 依赖安装、版本冲突和复现                        |
| 主要工具   | venv、Conda、uv          | pip、uv                                         |
| 相关文件   | `.venv`                  | `requirements.txt`、`pyproject.toml`、`uv.lock` |

可以这样理解：

- **环境隔离**：给每个项目准备独立的房间。
- **依赖管理**：管理每个房间里需要安装哪些东西，以及具体使用什么版本。

一个规范的 Python 项目，通常既需要环境隔离，也需要依赖管理。

### 5. Python 常见环境与依赖管理工具

Python 生态中有多种环境与依赖管理工具，它们的职责并不完全相同。

| 工具           | 主要作用                                              |
| -------------- | ----------------------------------------------------- |
| venv           | Python 标准库提供的虚拟环境创建工具                   |
| Conda          | 管理 Python 环境、Python 版本及多种软件包和二进制依赖 |
| pip            | Python 包安装与管理工具                               |
| uv             | 现代 Python 项目、环境、版本及依赖管理工具            |
| pyproject.toml | 声明项目元数据、依赖和工具配置                        |
| uv.lock        | 锁定项目解析后的具体依赖版本                          |

接下来分别学习这些工具。

## 二、Python 虚拟环境：venv

### 1. 什么是 venv？

`venv` 是 Python 标准库提供的虚拟环境创建工具。

它可以为不同的 Python 项目创建相互隔离的运行环境。

每个虚拟环境都有自己的 Python 解释器入口和第三方依赖安装位置。

例如：

```
my-agent/
├── .venv/
│   ├── bin/
│   ├── include/
│   ├── lib/
│   └── pyvenv.cfg
│
└── main.py
```

其中：

- `.venv`：虚拟环境目录。
- `bin`：存放 Python 解释器入口、pip 和激活脚本等。
- `include`：存放部分编译扩展需要的头文件。
- `lib`：存放 Python 标准库及第三方依赖所在的目录。
- `pyvenv.cfg`：记录虚拟环境相关配置信息。

需要注意：虚拟环境并不意味着重新安装了一份完整、完全独立的 Python。

在常见情况下，venv 会复用基础 Python 安装中的部分文件，具体采用复制还是符号链接取决于平台和创建参数。

### 2. 为什么需要 venv？

假设我们有两个 Agent 项目：

项目 A：

```
agent-a/
└── .venv/
    └── LangChain 1.x
```

项目 B：

```
agent-b/
└── .venv/
    └── LangChain 0.x
```

两个项目各自拥有独立的虚拟环境。

项目 A 安装或升级 LangChain，不会直接修改项目 B 的虚拟环境。

因此，venv 可以帮助我们：

- 隔离不同项目的第三方依赖。
- 避免项目之间的依赖版本冲突。
- 防止随意安装依赖污染全局 Python 环境。
- 让项目拥有相对独立的运行环境。

### 3. venv 的工作原理

理解 venv，主要需要搞清楚三个概念：

- Python 解释器
- site-packages
- PATH 环境变量

#### 3.1 Python 解释器

Python 解释器负责执行 Python 代码。

当我们在终端输入：

```bash
python main.py
```

系统会根据当前命令搜索路径找到对应的 Python 解释器，再由它执行 `main.py`。

如果使用虚拟环境，就应该让终端优先找到虚拟环境中的 Python 解释器。

#### 3.2 site-packages

`site-packages` 是 Python 安装第三方依赖包的主要目录。

例如：

```
.venv/
└── lib/
    └── python3.12/
        └── site-packages/
            ├── langchain/
            ├── fastapi/
            └── httpx/
```

当我们执行：

```
pip install langchain
```

如果当前使用的是虚拟环境中的 pip，那么 LangChain 就会安装到这个虚拟环境对应的 `site-packages` 中。

这样，其他项目的虚拟环境就不会受到影响。

#### 3.3 激活虚拟环境的原理

激活虚拟环境，并不是启动了一个新的 Python 进程，也不是创建了一个新的操作系统环境。

它主要是通过执行激活脚本，修改当前终端会话中的环境变量，最重要的是 `PATH`。

例如，在 macOS 中：

虚拟环境激活前：

```
/usr/local/bin
/usr/bin
/bin
```

虚拟环境激活后：

```
项目目录/.venv/bin
/usr/local/bin
/usr/bin
/bin
```

因为 `.venv/bin` 被放到了 PATH 的前面，所以当我们执行：

```
python
```

终端就会优先找到：

```
项目目录/.venv/bin/python
```

而不是系统中其他位置的 Python。

因此，激活虚拟环境后，我们执行的 `python` 和 `pip` 通常都会指向当前虚拟环境。

**注意：激活虚拟环境并不是使用虚拟环境的必要条件。**

我们也可以直接使用虚拟环境中 Python 的完整路径运行程序：

```
./.venv/bin/python main.py
```

### 4. 如何创建和使用 venv？

下面以 macOS 为例。

#### 4.1 创建项目目录

```
mkdir my-agent
cd my-agent
```

#### 4.2 创建虚拟环境

```
python3 -m venv .venv
```

参数解释：

- `python3`：调用当前系统中的 Python 3 解释器。
- `-m venv`：通过 Python 模块方式运行 venv。
- `.venv`：指定虚拟环境的目录名称。

执行成功后，会在项目目录下创建 `.venv` 文件夹。

#### 4.3 激活虚拟环境

macOS / Linux：

```
source .venv/bin/activate
```

激活成功后，终端通常会出现：

```
(.venv)
```

这表示当前终端会话已经激活了该虚拟环境。

#### 4.4 验证当前 Python

执行：

```
which python
```

如果输出类似：

```
/Users/xxx/my-agent/.venv/bin/python
```

说明当前使用的是虚拟环境中的 Python。

继续执行：

```
python --version
```

查看当前 Python 版本。

还可以执行：

```
python -c "import sys; print(sys.prefix); print(sys.base_prefix)"
```

其中：

- `sys.prefix`：当前 Python 环境的前缀目录。
- `sys.base_prefix`：创建虚拟环境时所使用的基础 Python 环境前缀。

在虚拟环境中，通常有：

```
sys.prefix != sys.base_prefix
```

这可以用来判断当前解释器是否运行在虚拟环境中。

#### 4.5 退出虚拟环境

执行：

```
deactivate
```

当前终端会退出虚拟环境，恢复使用原来的 Python 环境。

### 5. .venv 目录结构

一个常见的 macOS 虚拟环境目录结构如下：

```
my-agent/
├── .venv/
│   ├── bin/
│   │   ├── activate
│   │   ├── python
│   │   └── pip
│   │
│   ├── include/
│   │
│   ├── lib/
│   │   └── python3.12/
│   │       └── site-packages/
│   │
│   └── pyvenv.cfg
│
└── main.py
```

不同操作系统的目录结构会有所区别。

例如 Windows 通常使用 `Scripts` 目录，而 macOS / Linux 通常使用 `bin` 目录。

### 6. 虚拟环境的工程实践

在实际 Python 项目中，通常将虚拟环境命名为 `.venv`，并放在项目根目录。

例如：

```
my-agent/
├── .venv/
├── main.py
├── pyproject.toml
└── README.md
```

`.venv` 通常不应该提交到 Git 仓库。

原因：

1. 虚拟环境中包含大量依赖文件，体积较大。
2. 不同操作系统的虚拟环境结构可能不同。
3. 其他开发者可以根据项目依赖配置重新创建虚拟环境。
4. 虚拟环境不适合直接在不同电脑之间复制使用。

通常在 `.gitignore` 中添加：

```
.venv/
```

当虚拟环境出现问题时，也可以删除 `.venv` 后重新创建。

**注意：虚拟环境主要用于依赖隔离，不是安全沙箱。它不能阻止项目代码访问操作系统资源或执行危险操作。**

## 三、Conda

### 1. Conda 是什么？

Conda 是一个开源的包管理与环境管理工具。

它可以创建和管理独立环境，也可以安装、更新和删除软件包。

与 venv 主要负责创建 Python 虚拟环境不同，Conda 除了管理 Python 环境，还能够管理许多非 Python 的软件包和二进制依赖。

例如：

- Python
- NumPy
- SciPy
- CUDA Toolkit（在支持的渠道和平台上）
- cuDNN（在支持的渠道和平台上）
- 其他科学计算相关依赖

因此，Conda 在数据科学、科学计算和部分机器学习环境中比较常见。

需要注意：Conda 可以管理部分 CUDA 相关的软件包，但不会自动安装或管理显卡驱动。显卡驱动仍然需要根据操作系统和硬件情况单独处理。

### 2. Anaconda 与 Miniconda

Anaconda 和 Miniconda 都是 Conda 生态中的发行方式。

**Anaconda：**

- 包含 Conda。
- 默认提供大量常用科学计算和数据分析软件包。
- 安装体积较大。
- 适合希望一次性获得较完整数据科学环境的用户。

**Miniconda：**

- 提供 Conda 和基础运行环境。
- 默认安装的软件包较少。
- 安装体积更小。
- 可以根据实际需要安装依赖。

两者的核心区别是默认包含的软件包数量不同。

对于希望自己控制项目依赖的开发者，Miniconda 通常更加轻量。

### 3. Conda 的安装

可以从官方文档获取安装程序：

https://docs.conda.io/projects/conda/en/latest/user-guide/install/index.html

根据操作系统和芯片架构选择对应版本。

macOS 用户需要注意区分 Apple Silicon 和 Intel 版本。

### 4. Conda 镜像源配置

在国内网络环境中，可以根据实际情况配置镜像源，以提高软件包下载速度。

例如，清华大学开源软件镜像站提供 Conda 镜像：

https://mirrors.tuna.tsinghua.edu.cn/help/anaconda/

具体配置方式和镜像地址应以镜像站当前说明为准。

### 5. 创建 Conda 环境

例如，创建一个 Python 3.12 的环境：

```
conda create -n my-agent python=3.12
```

参数解释：

- `conda create`：创建环境。
- `-n my-agent`：指定环境名称。
- `python=3.12`：指定 Python 版本。

### 6. 激活 Conda 环境

```
conda activate my-agent
```

激活后，当前终端就会使用该 Conda 环境。

### 7. 查看 Conda 环境

```bash
conda env list
```

或者：

```bash
conda info --envs
```

### 8. 退出 Conda 环境

```bash
conda deactivate
```

### 9. 删除 Conda 环境

```bash
conda remove -n my-agent --all
```

这会删除名称为 `my-agent` 的整个环境。

### 10. Conda 包管理

安装软件包：

```bash
conda install numpy
```

指定版本：

```bash
conda install numpy=1.26
```

更新软件包：

```bash
conda update numpy
```

删除软件包：

```bash
conda remove numpy
```

查看当前环境安装的软件包：

```bash
conda list
```

### 11. Conda 的适用场景与局限

**适用场景：**

- 数据科学和科学计算。
- 需要管理非 Python 二进制依赖的项目。
- 部分机器学习和 GPU 计算环境。
- 需要灵活管理不同 Python 版本的环境。

**局限：**

- 相比轻量级 Python 项目管理工具，整体使用和配置可能更复杂。
- 软件包的版本和渠道需要合理选择。
- 不同渠道的软件包混合使用时，可能出现依赖冲突。
- 它不是专门针对现代 Python 应用项目工作流设计的唯一解决方案。

对于普通的 Python Web 项目或 AI Agent 应用，通常可以使用 venv 或 uv 管理项目环境与依赖。

## 四、pip

### 1. pip 是什么？

pip 是 Python 生态中最常用的第三方包安装与管理工具。

它主要负责从 Python 包索引或其他指定来源获取 Python 软件包，并将其安装到当前 Python 环境中。

例如：

```bash
pip install langchain
```

就可以安装 LangChain。

需要注意：

- pip 不是 Python 标准库中的模块。
- 它通常会随 Python 安装环境一起提供，但具体是否安装取决于 Python 发行版和安装方式。
- pip 主要管理 Python 软件包，不是通用的操作系统级包管理器。

pip 可以安装带有 C/C++ 扩展或其他二进制组件的 Python distributions，但它不负责管理整个操作系统的驱动、系统级 CUDA 等依赖。

### 2. pip 与 venv 的关系

pip 和 venv 的职责不同：

- venv：创建独立的 Python 虚拟环境。
- pip：向当前 Python 环境安装和管理第三方依赖。

两者通常配合使用。

例如：

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install langchain
```

这里：

1. 第一条命令创建虚拟环境。
2. 第二条命令激活虚拟环境。
3. 第三条命令将 LangChain 安装到当前虚拟环境中。

如果没有激活虚拟环境，直接使用全局环境中的 pip 安装依赖，就可能污染全局 Python 环境。

为了更加明确地指定安装目标，也可以使用：

```bash
python -m pip install langchain
```

这样可以确保使用当前 `python` 对应的 pip。

### 3. pip 常用命令

安装依赖：

```bash
pip install langchain
```

安装指定版本：

```bash
pip install langchain==1.0.0
```

升级依赖：

```bash
pip install --upgrade langchain
```

卸载依赖：

```bash
pip uninstall langchain
```

查看已安装的依赖：

```bash
pip list
```

查看某个依赖的信息：

```bash
pip show langchain
```

查看依赖关系：

```bash
pip check
```

### 4. requirements.txt

在传统 Python 项目中，常使用 `requirements.txt` 记录项目依赖。

例如：

```
langchain==1.0.0
```

## 五、uv 与现代 Python 项目依赖管理

前面已经分别介绍过 `venv`、Conda 和 `pip`。这一节把它们放回真实项目里理解：当我们开发一个会调用模型、访问数据库和调用外部 API 的 Agent 时，如何让每个开发者使用同一套依赖，如何在升级依赖时知道发生了什么，以及如何在换一台电脑后重新得到同样的环境。

### 1. pip、venv 与 uv 的边界

| 工具 | 主要职责 | 典型命令 |
| --- | --- | --- |
| `venv` | 创建虚拟环境 | `python -m venv .venv` |
| `pip` | 安装和卸载 Python 包 | `python -m pip install httpx` |
| `uv` | 管理项目、环境、依赖和锁定结果 | `uv add httpx` |

`pip` 解决的是“把包安装到当前解释器”；`uv` 解决的是“把项目环境和依赖一起管理起来”。小脚本使用 `venv + pip` 已经足够；当项目有多个运行依赖、开发依赖和不同入口时，uv 可以减少手工维护的步骤。

### 2. 安装与初始化

安装好 uv 后，先确认命令可用：

```bash
uv --version
uv self update
```

下面从零创建一个订单客服 Agent：

```bash
mkdir support-agent
cd support-agent
uv init --python 3.12
uv add langchain langgraph httpx pydantic-settings
uv add --dev pytest ruff mypy
uv run python -c "import sys; print(sys.version)"
```

`uv init` 会创建 `pyproject.toml` 等基础文件；`uv add` 会更新项目依赖并同步环境；`uv run` 会在项目环境中执行命令，所以不要求每次都手动激活 `.venv`。如果你希望显式创建环境，也可以运行 `uv venv --python 3.12`。

### 3. 依赖、锁文件与 `pyproject.toml`

平时最常用的是四个动作：`uv add` 添加依赖，`uv remove` 删除依赖，`uv sync` 按项目声明同步环境，`uv tree` 查看依赖树。依赖约束发生变化时，使用 `uv lock` 重新解析锁文件。

```toml
[project]
name = "support-agent"
version = "0.1.0"
requires-python = ">=3.12"
dependencies = [
  "httpx>=0.27,<1",
  "langchain>=1,<2",
  "langgraph>=1,<2",
  "pydantic-settings>=2,<3",
]

[dependency-groups]
dev = ["pytest>=8,<9", "ruff>=0.8,<1", "mypy>=1.13,<2"]

[tool.ruff]
line-length = 100
target-version = "py312"
```

`pyproject.toml` 是人可以直接阅读和修改的项目配置；`uv.lock` 记录这一次解析得到的具体版本，包括传递依赖。前者表达“允许什么版本”，后者记录“这次实际用了什么版本”。应用项目通常应该把两者一起提交到 Git，`uv.lock` 由 uv 生成，不要手工编辑。

### 4. Agent 项目的复现流程

```bash
git clone <repository-url>
cd support-agent
uv sync --dev
uv run pytest
uv run python -m support_agent
```

升级依赖时先修改约束或运行 `uv add package@版本`，再执行 `uv lock` 和测试，最后一起提交 `pyproject.toml` 与 `uv.lock`。`.venv` 只在本机生成，应加入 `.gitignore`。新机器只需要安装 Python 和 uv，克隆仓库后执行 `uv sync --dev`，就可以得到项目需要的环境。

## 六、Python 项目结构与模块化

第一阶段只需要知道“怎么导入一个模块”。到了真实项目里，问题会变成：代码应该放在哪个包里？谁可以依赖谁？为什么同样的代码换一种启动方式就导入失败？这一节从这些实际问题出发，整理一个 Agent 项目的目录和依赖方向。

### 1. 模块与包的工程组织

一个 `.py` 文件就是一个模块，多个模块按目录组织起来就是包。拆分模块时，可以问自己“这段代码以后会不会独立修改或独立测试”。例如，查询订单的 HTTP 客户端、Agent 的决策流程和提示词模板，变化原因不同，就不应该挤在一个文件里。模块过大时，测试和替换都会变得困难。

### 2. import 导入机制

执行 `import` 时，Python 会先按模块搜索路径寻找目标，再执行模块顶层代码，并把已加载的模块放进 `sys.modules`。因此，模块顶层不要直接发起网络请求或读取必须存在的密钥，否则“导入模块”本身就可能失败。可以用下面的命令查看当前解释器的搜索路径：

```bash
python -c "import sys; print('\\n'.join(sys.path))"
```

项目代码通常使用绝对导入，让依赖关系一眼可见；包内部的小范围引用可以使用相对导入：

```python
from support_agent.config import Settings
from ..tools.search import SearchTool
```

直接运行 `python support_agent/agents/support.py` 时，Python 可能不知道这个文件属于哪个包，于是相对导入会失败。推荐从项目根目录使用模块入口：`uv run python -m support_agent.agents.support`。如果出现循环导入，优先检查职责是否混在一起，把共享类型提取到独立模块，或让依赖通过参数传入。

### 3. `__init__.py` 与包接口

`__init__.py` 可以定义包的稳定导出接口，也可以放少量初始化代码。初始化应保持轻量，不要在这里创建数据库连接或发起网络请求。`__all__` 主要服务于 `from package import *` 和文档表达，不是访问控制机制。程序入口可以写成：

```python
def main() -> None:
    print("start agent")


if __name__ == "__main__":
    main()
```

### 4. Python 项目目录结构

推荐的 Agent 项目可以采用 `src` 布局：

```text
support-agent/
├── pyproject.toml
├── uv.lock
├── .env.example
├── src/support_agent/
│   ├── __main__.py
│   ├── config.py
│   ├── agents/
│   ├── tools/
│   ├── prompts/
│   ├── services/
│   └── api/
└── tests/
    ├── unit/
    └── integration/
```

`src` 布局可以减少测试时误导入仓库根目录同名文件的风险，也能提醒我们通过“安装后的包”来运行项目。`tests` 应该测试公开行为，不要依赖生产模块里的私有变量和文件路径。

### 5. 分层架构

可以把依赖方向想成一条从外到内的路径：`api -> agents -> services/tools`。API 负责 HTTP 或命令行协议，Agent 负责工作流和决策，services 封装模型、数据库等外部系统，tools 提供模型可以调用的具体能力，config 只负责读取配置。这样，换一个 Web 框架时，Agent 的核心逻辑不需要跟着重写。

### 6. Agent 项目代码组织

在 Agent 项目中，`agents/` 放状态机或工作流，`tools/` 放单一职责的工具，`prompts/` 放可以单独评审和版本管理的模板，`services/` 放 LLM、检索和数据库客户端，`config.py` 提供经过校验的配置。模型客户端通过 service 或适配器注入，测试时就可以换成 fake client，而不必真的调用模型。

## 七、配置管理

### 1. 为什么需要配置管理

假设 Agent 在本地使用测试模型，在服务器上使用正式模型；如果模型名、数据库地址和 API Key 都写在业务代码里，每换一个环境就要改代码、重新提交，甚至可能把密钥一起提交到仓库。配置管理要解决的就是“同一套代码，换一组外部参数即可运行”。

模型名称、超时和重试次数属于普通配置；API Key、数据库密码属于敏感配置。两者都应该从代码中拿出来，但敏感配置还需要额外的密钥保护。

### 2. 环境变量

```bash
export APP_ENV=dev
export OPENAI_API_KEY="replace-me"
python -c "import os; print(os.getenv('APP_ENV'))"
```

读取必需配置时可以使用 `os.environ["NAME"]`，变量缺失就立即失败，这比程序运行到一半才报错更容易排查；有合理默认值的可选配置才使用 `os.getenv("NAME", default)`。

### 3. .env 文件

开发环境可以使用 `python-dotenv` 从项目根目录的 `.env` 文件加载变量：

```bash
uv add python-dotenv
```

```python
from dotenv import load_dotenv
import os

load_dotenv()
api_key = os.environ["OPENAI_API_KEY"]
```

提交 `.env.example` 而不是 `.env`：

```text
APP_ENV=dev
OPENAI_API_KEY=
MODEL_NAME=
DATABASE_URL=sqlite:///./agent.db
```

`.env` 应写入 `.gitignore`，并提交一份不包含真实值的 `.env.example`，让新成员知道需要哪些变量。如果密钥已经泄露，必须先吊销并重新生成；仅仅从当前版本删除文件并不能消除 Git 历史中的泄露。

### 4. 配置文件格式

JSON 适合结构稳定、由程序生成的配置；YAML 适合人手工维护的层级配置，但要固定解析库版本，也不要加载不可信的 YAML。项目可以约定配置优先级为“代码默认值 < 配置文件 < `.env` < 进程环境变量 < 启动参数”，并在启动时一次性校验，避免服务启动后才发现字段写错。

### 5. 配置类与项目实践

当配置字段开始变多时，建议用 Pydantic Settings 集中读取和校验。这样 `request_timeout` 会被转换成数字，缺失的必需字段会在启动时明确报错：

```python
from functools import lru_cache
from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_env: str = "dev"
    model_name: str = "gpt-4.1-mini"
    request_timeout: float = 30.0
    openai_api_key: SecretStr

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()
```

代码中通过 `get_settings()` 读取配置，业务模块不需要到处调用 `os.getenv`。`SecretStr` 可以降低误打印风险，但日志仍要主动脱敏。测试环境可以通过环境变量或依赖注入提供独立配置，生产密钥则由部署平台的 Secret 管理能力注入。

## 八、日志管理

### 1. 为什么需要日志

`print` 在本地调试一个小脚本时很方便，但真实服务通常同时处理很多请求。只看到一串“开始了”“结束了”，你很难知道这条消息属于哪个请求、卡在哪个工具、模型调用花了多久。日志需要记录时间、级别、模块名、请求标识和异常堆栈，Agent 还应该记录当前节点、工具名、模型名和耗时。

### 2. logging 基础

```python
import logging
import sys

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger(__name__)
logger.info("agent started")
```

可以把三者理解成一条流水线：Logger 负责产生消息，Handler 决定消息写到控制台还是文件，Formatter 决定消息长什么样。级别从低到高是 `DEBUG`、`INFO`、`WARNING`、`ERROR`、`CRITICAL`。库代码不要调用 `basicConfig`，应由应用入口统一配置，否则导入某个库就可能改变整个程序的日志设置。

### 3. 日志输出

开发时通常看控制台，排查线上问题时还需要保存文件或交给日志平台。文件日志必须轮转，否则服务运行几个月后日志可能占满磁盘：

```python
from logging.handlers import RotatingFileHandler

file_handler = RotatingFileHandler(
    "logs/agent.log", maxBytes=10_000_000, backupCount=5, encoding="utf-8"
)
file_handler.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(name)s %(message)s"))
logger.addHandler(file_handler)
```

如果服务运行在容器中，也可以只输出标准输出，由容器平台统一收集、检索和轮转。

### 4. 异常日志

```python
async def call_with_logging() -> str:
    try:
        result = await call_model()
    except TimeoutError:
        logger.exception("model call timed out")
        raise
    return result
```

`logger.exception` 应该在 `except` 块中使用，它会把 traceback 一起记录下来。捕获异常后，要么返回明确的降级结果，要么记录后重新抛出；不要写空的 `except Exception: pass`，那会让真正的问题悄悄消失。

### 5. Agent 项目日志实践

一次 Agent 请求可能经过“接收问题 -> 检索订单 -> 调用模型 -> 执行工具 -> 返回结果”多个步骤。建议至少记录 request id、会话 id、节点名、工具名、模型名、耗时、重试次数和结果状态，这样才能把一条链路串起来。不要记录 API Key、Authorization Header、密码或未经脱敏的用户内容；完整 prompt 是否落盘也要结合隐私要求。日志记录单个事件，Tracing 则关注一次请求跨多个节点的完整链路，两者可以一起使用。

## 九、异步编程进阶

第一阶段只展示了 `async def` 和 `await` 的写法。本节继续回答工程中的问题：多个外部 API 能不能同时请求？一个慢工具会不会拖住所有请求？超时、取消和限流应该放在哪里？

### 1. 同步与异步

同步代码通常要等当前函数完成后才进入下一步；异步代码在等待网络、数据库等 I/O 时可以把执行权交给其他任务。比如 Agent 同时查询订单系统和知识库时，异步可以减少“一个请求等完，另一个请求才开始”的空等时间。异步适合 I/O 密集型任务，不会自动让 CPU 密集型计算变快。

### 2. async / await 运行机制

调用 `async def` 函数时，函数体不会立刻执行，只会得到一个 coroutine 对象。必须 `await` 它，或使用 `create_task` 把它交给事件循环调度：

```python
import asyncio

async def fetch(name: str, delay: float) -> str:
    await asyncio.sleep(delay)
    return f"{name} done"

async def main() -> None:
    task = asyncio.create_task(fetch("search", 0.2))
    print(await task)

asyncio.run(main())
```

事件循环会在协程遇到 `await`、正在等待网络或定时器时切换到其他任务。`asyncio.run` 适合作为同步程序的顶层入口；在已经运行事件循环的 Web 框架或 Notebook 中，不要再次调用它。

### 3. Event Loop

可以把事件循环看成一个调度员：它安排就绪任务运行，等待 I/O 完成，再恢复被挂起的协程。它通常运行在一个线程中，所以一个任务里调用 `time.sleep`、同步 HTTP 客户端或耗时 CPU 计算，都会暂时堵住同一事件循环上的其他任务。

### 4. asyncio 常用 API

```python
async def parallel() -> list[str]:
    return await asyncio.gather(
        fetch("search", 0.2), fetch("crm", 0.1), fetch("ticket", 0.3)
    )
```

`gather` 适合等待一组互相独立的任务；Python 3.11+ 的 `TaskGroup` 适合把任务生命周期放在一个清晰的作用域里。超时和限流可以组合使用：

```python
async def limited_fetch(semaphore: asyncio.Semaphore, name: str) -> str:
    async with semaphore:
        return await asyncio.wait_for(fetch(name, 1), timeout=2)
```

用户关闭页面或服务停止时，任务可能会被取消。通常应让 `CancelledError` 继续传播，把连接关闭等清理工作放到 `finally` 中。任务数量不确定时，可以用 `asyncio.Queue` 连接生产者和消费者，避免一次性创建成千上万个任务。

### 5. 并发与并行

并发表示多个任务交替推进，并行表示多个 CPU 核心同时执行。asyncio 适合 I/O；线程适合把阻塞 I/O 移出事件循环；CPU 密集任务通常考虑进程。异步不等于并行，也不能绕过第三方服务的速率限制，所以并发数仍然要受到控制。

### 6. 异步 HTTP 请求

```python
import httpx

async def get_json(url: str) -> dict:
    timeout = httpx.Timeout(10.0, connect=3.0)
    async with httpx.AsyncClient(timeout=timeout) as client:
        response = await client.get(url)
        response.raise_for_status()
        return response.json()
```

示例使用 `async with` 确保客户端关闭。实际服务中通常在应用启动时创建一个 `AsyncClient`，在应用关闭时释放它，从而复用连接池；不要在每个小函数中反复创建客户端。

### 7. 同步与异步协作

同步入口使用 `asyncio.run`；已有事件循环（例如异步 Web 框架）中直接 `await`。不要在事件循环内再次调用 `asyncio.run`。如果必须调用一个旧的同步函数，可以把它移到线程：

```python
async def call_sync_function(arg: object) -> object:
    return await asyncio.to_thread(sync_function, arg)
```

看到 `coroutine was never awaited`，通常是忘记 `await` 或没有创建任务；客户端未关闭、无限创建任务和在异步代码中使用 `time.sleep` 也是常见问题。排查时可以先确认每个异步函数的调用方到底是 `await`、`create_task`，还是误把 coroutine 当成普通返回值使用。

### 8. Agent 异步实践

在 Agent 中，多个互不依赖的检索工具可以并发调用；如果第二个节点必须使用第一个节点的结果，就应该串行执行。模型和工具调用都要设置超时、最大并发数、重试退避和取消策略，并记录 request id、工具名和耗时。使用 LangChain 或 LangGraph 时，优先调用对应版本提供的异步 API，例如 `ainvoke`、`astream`；如果只能使用同步 SDK，就用线程隔离，避免堵住事件循环。

## 十、Git 版本管理

### 1. Git 基础

当 Agent 只有一个 `main.py` 时，复制文件也许还能应付；一旦开始改提示词、调整工具、升级依赖，就需要知道“哪一次修改引入了问题”，也需要让其他人安全地合并自己的工作。Git 保存项目的变更历史，GitHub 则提供远程仓库、代码审查和协作功能。

### 2. Git 工作原理

工作区是你正在编辑的文件，暂存区是你准备放进下一次提交的内容，本地仓库存储已经提交的历史，远程仓库用于团队协作。一次普通的修改通常经过：先看差异，再挑选文件加入暂存区，确认暂存内容，提交，最后推送到远程。

### 3. 常用命令

```bash
git init
git status
git diff
git add src tests pyproject.toml uv.lock
git diff --cached
git commit -m "feat: add support agent"
git log --oneline --decorate --graph --all
git restore path/to/file.py
git restore --staged path/to/file.py
```

`git restore path/to/file.py` 会放弃一个文件尚未暂存的修改；`git restore --staged` 只会取消暂存，不会删除文件内容。`git reset` 会移动分支指针，作用更强，执行前要确认目标提交和范围。

### 4. 分支管理

```bash
git switch -c feat/tool-timeout
git add .
git commit -m "feat: add tool timeout"
git switch main
git merge feat/tool-timeout
git branch -d feat/tool-timeout
```

两个分支同时修改同一行时，Git 无法替你判断应该保留哪一版，就会产生冲突。打开文件，处理 `<<<<<<<`、`=======`、`>>>>>>>` 标记，运行测试确认结果后，再 `git add` 并完成提交。每个功能使用独立分支，小提交保持单一目的，合并前运行测试和静态检查。

### 5. 远程仓库

```bash
git clone <repository-url>
git remote -v
git fetch origin
git pull --rebase origin main
git push -u origin feat/tool-timeout
```

如果不想每次推送都输入密码，可以使用 SSH Key。私钥留在自己的电脑上，只把公钥添加到 GitHub：

```bash
ssh-keygen -t ed25519 -C "you@example.com"
ssh -T git@github.com
```

只上传公钥，私钥不能进入仓库、聊天记录或日志。

### 6. Python 项目中的 Git 实践

```text
.venv/
__pycache__/
*.py[cod]
.pytest_cache/
.mypy_cache/
.ruff_cache/
.env
.env.*
!.env.example
dist/
build/
*.log
```

Python 项目通常应提交 `pyproject.toml`、`uv.lock`、源代码、测试、README 和 `.env.example`；不应提交 `.venv`、真实密钥、缓存、日志和模型输出。`.gitignore` 只会阻止以后被追踪的文件，不能清除已经提交的密钥。如果密钥误提交，先吊销并重新生成，再清理 Git 历史。

从零初始化一个 Agent 项目时，可以按下面的顺序操作：

```bash
uv init --python 3.12
uv add langchain langgraph httpx pydantic-settings
uv add --dev pytest ruff mypy
mkdir -p src/support_agent tests
uv run pytest
uv run ruff check .
git add .
git commit -m "feat: bootstrap agent project"
git remote add origin git@github.com:ORG/support-agent.git
git push -u origin main
```
