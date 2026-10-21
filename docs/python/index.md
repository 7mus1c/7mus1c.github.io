# Python

## 开发环境搭建

业内普遍使用 Conda 或者 pip（Python内置） 管理 Python 依赖，但是现在更推荐使用 rust 开发的新一代管理工具 uv 。
uv 速度比 pip 快 10-100 倍，比 conda 轻量很多。但是 conda 和 uv 都要会，毕竟工作中都需要用到。

### Conda

Conda 可以安装任何语言的二进制包。 pip 只能装 Python 语言的包。

- Conda 可以管理 Python 的版本，在不同项目中切换 Python 版本非常方便。
- 也可以管理包的依赖
- 管理非 Python 的包，比如 C++ 的包

Conda 有两个版本

1. Anaconda 完整版 大小约 3G，包含很多包。
2. Miniconda 轻量版 大小约 100M，只包含 Conda 和 Python 和基础依赖。（推荐）

#### 下载地址：

- 官方地址：https://docs.conda.io/en/latest/miniconda.html
- 清华镜像地址：https://mirrors.tuna.tsinghua.edu.cn/anaconda/miniconda/

安装后

```shell
conda --version # 查看版本
```

配置下载镜像源，默认的源下载慢，可以配置清华镜像源。

```shell
# 添加镜像 第一个挂了 就换第二个
conda config --add channels https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/main/
conda config --add channels https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/free/
conda config --add channels https://mirrors.tuna.tsinghua.edu.cn/anaconda/cloud/conda-forge/

# 搜索是显示源地址
conda config --set show_channel_urls yes

# 删除默认的 default 源（可选，避免请求国外源）
conda config --remove channels defaults

# 验证镜像是否生效
conda config --show channels
```

#### 创建环境

Python 目前最稳定的版本是 3.12。

```shell
# 创建一个名为 <project_name> 的环境，并指定 Python 版本为 3.12
conda create -n <project_name> python=3.12

# 创建一个名为 <project_name> 的环境，并指定 Python 版本为 3.12，同时安装 numpy、pandas 和 jupyter 依赖包
conda create -n <project_name> python=3.12 numpy pandas jupyter

```

#### 激活与切换环境

```shell
# 查看所有环境
conda env list

# 激活环境
conda activate <project_name>

# 切换环境
conda activate <project_name>

# 退出环境
conda deactivate
```

#### 删除环境

```shell
conda remove -n <project_name> --all
```

#### 管理包

```shell
# 安装包
conda install <package_name>

# 安装指定版本的包
conda install <package_name>=<version>

# 安装多个包
conda install <package_name1> <package_name2>

# 安装指定版本的多个包
conda install <package_name1>=<version1> <package_name2>=<version2>

# 查看已安装的包
conda list

# 查看已安装的包的版本
conda list <package_name>

# 更新包
conda update <package_name>

# 更新所有包
conda update --all

# 删除包
conda remove <package_name>

# 删除所有包
conda remove --all
```

#### 为什么 ai 应用开发不推荐

Conda 更适合本地 GPU 训练，它会自动安装对应的驱动，比较省心。
只在你要本地管 CUDA 底层时,才值得请出 Miniforge 版的 conda。俗称杀鸡不用牛刀。

### pip

pip 是 Python 的自带包管理工具，用于安装和管理 Python 包。

#### 管理包

```shell
# 查看版本
pip --version

# 更新 pip
pip install --upgrade pip

# 安装包
pip install <package_name>

# 安装指定版本的包
pip install <package_name>==<version>

# 安装多个包
pip install <package_name1> <package_name2>

# 删除包
pip uninstall <package_name>

# 查看已安装的包
pip list
```

#### 为什么 ai 应用开发不推荐

pip 只能安装 Python 包，不能安装非 Python 包，比如 CUDA、cuDNN、显卡驱动等。所以 pip 不适合 ai 应用开发。

### uv

uv 是 rust 开发的新一代包管理工具，用于安装和管理 Python 包。一个字快。
它集合了 pip、 pip-tools、venv、conda(版本管理部分) 和 pyenv。
不需要像 conda 一样手动创建虚拟环境，uv 会在运行项目时自动创建虚拟环境。
不需要安装 Python 就能运行 UV。

#### 安装

```shell
# 安装 uv
curl -LsSf https://astral.sh/uv/install.sh | sh
```

#### 管理包

```shell
# 初始化项目 并且指定版本是 3.14
uv init <package_name> --python 3.14

# 安装包
uv add fastapi uvicorn

# 运行文件
uv run **.py

# 查看依赖列表
uv list

# 删除依赖
uv remove fastapi uvicorn
```

#### venv 目录

uv 会自动创建一个 venv 目录，里面包含了 Python 的虚拟环境。也包含了所有的项目依赖。

## 语法

### 变量与基础数据类型

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


"123".isDigit()  # True  判断字符串是否是数字
"123".isalpha()  # False  判断字符串是否是字母
"123".isalnum()  # True  判断字符串是否是字母或数字
"123".isspace()  # False  判断字符串是否是空格
"123".StartWith("hello")  # False  判断字符串是否以指定字符串开头
"123".EndWith("hello")  # False  判断字符串是否以指定字符串结尾
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

name = 张三
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
isinstance(None, NoneType)  # True

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

# is 比较的是内存地址
a = 1
b = 1
a is b  # True CPython 启动时就把 [-5, 256] 各建一个对象放那儿，全程序所有 1 都指向同一个。所以 a、b 真的是同一个对象，is 自然 True。
a = 1234567890
b = 1234567890
a is b  # False 这个超出了 256 的范围，所以 Python 会新建对象，所以 a、b 不是同一个对象，is 自然 False。
a = 1
b = 2
a is b  # False

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

### 列表

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
list1 = [1， 2， 3]
list2 = [4， 5， 6]
list1 + list2  # 【1， 2， 3， 4， 5， 6】  列表拼接
repeted = [0] * 5  # [0， 0， 0， 0， 0]  重复

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
friuts.append("橘子")  # 在列表末尾添加元素
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
sorted(strings, key=len reverse=True)  # [""abc", "ab", "a"] 按照字符串长度降序序


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
b = [3，4]
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

### 元组

```python
# 元组
tuple1 = (1, 2, 3)
typle2 = 1, 2, 3
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
data = （1, 2, 3, 4, 5）
for item in data:
    print(item)

# 元组不可变
tuple1[0] = 4  # 报错

tuple7 = （1， 2， [3, 4]）
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

### 字典（对象）

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
print(**person)  # name=zhangsan age=18 gender=male  解包字典的键值对
# 也可以用解包来合并字典
person = {"name": "zhangsan", "age": 18, "gender": "male"}
person2 = {"name": "lisi", "age": 20, "gender": "female"}
person3 = {**person, **person2}

# | 运算符合并字典
person = {"name": "zhangsan", "age": 18, "gender": "male"}
person2 = {"name": "lisi", "age": 20, "gender": "female"}
person3 = person | person2
```

### JSON

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

### 集合

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

### 判断

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

### 循环

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

### 函数

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
    if n == 1:
        return 1
    return n * factorial(n - 1)

print(factorial(5))  # 120

# 递归函数的优化
def factorial(n, result=1):
    if n == 1:
        return result
    return factorial(n - 1, result * n)

print(factorial(5))  # 120


# 匿名函数 lambda
add = lambda a, b: a + b
print(add(1, 2))  # 3
```

### 模块化

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
from math as m
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

# 导入模块中的所有函数并重命名
from math import * as m

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
print(math.__path__)  # ['/usr/lib/python3.9/math.py']
print(math.__version__)  # 3.9.0

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

### 类

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

### 迭代器和生成器

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

### 异步函数

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

### 类型注解

```python
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
```

### 文件读写

```python
# os 就是操作系统模块
import os
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
```

### 异常处理

```python
# 异常处理
try:
    # 可能会抛出异常的代码
    print(1 / 0)
except ZeroDivisionError as e:
    # 捕获到异常后的处理
    print('除数不能为0', e)
```
