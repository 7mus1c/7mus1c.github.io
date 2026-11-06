# LLM API

## 主流 API 协议：

不管调用什么模型，现在都是通过 API 来调用。

目前市面主流模型 API 协议方案有：

OpenAI（ChatGPT）：目前国内主流的大部分都是这个方案

```json
base_url:/v1/chat/completions

{
	"messages": [
  {"role":"system",…}
  {"role":"user",…}
  ],
  "tools":[...]
  "stream": true
}
```

Anthropic（Claude code）

```json
base_url: /v1/messages

{
  "system": "…",
  "messages": [
    {
      "role":"user",
    	"content":[…]
    }
  ],
  "tools":[...]
}
```

举个例子：拿 DeepSeek 官方的例子：

```python
# Please install OpenAI SDK first: `pip3 install openai`

# 导入依赖
import os
from openai import OpenAI

# 创建链接
client = OpenAI(
    api_key=os.environ.get('DEEPSEEK_API_KEY'),
    base_url="https://api.deepseek.com",
)

# 发送消息
response = client.chat.completions.create(
    model="deepseek-flash",
    messages=[
        {"role": "system", "content": "You are a helpful assistant"},
        {"role": "user", "content": "Hello"},
    ],
    stream=False,
    reasoning_effort="high",
    extra_body={"thinking": {"type": "enabled"}},
)

# 打印返回的输出
print(response.choices[0].message.content)
```

## SDK 安装

所有 SDK 万变不离其宗，要么就是阿里系列、火山引擎系列其实都大差不差，这里拿 DeepSeek 举例。

### 创建环境

在安装 SDK 之前先给环境安装好。

#### 安装 uv

```shell
# 安装 uv
# 官方脚本（推荐）
curl -LsSf https://astral.sh/uv/install.sh | sh
```

#### 创建项目

```shell
# 1. 创建目录进入
mkdir api_test && cd api_test
# 2. 初始化一个项目
# 生成 pyproject.toml + .venv + uv.lock
uv init --python 3.13

```

#### 安装 SKD

```shell
# 安装依赖（自动写入 pyproject.toml + 锁定版本）
uv add openai python-dotenv
```



## 创建环境变量

在根目录穿件 .env 文件

```.env
# DeepSeek API Key（在 https://platform.deepseek.com 申请）
DEEPSEEK_API_KEY=sk-b5f983da*********50172
# 可选：走自建网关/代理时取消注释并修改
# DEEPSEEK_BASE_URL=https://api.deepseek.com
```

## 测试第一次 API 调用

```python
"""DeepSeek API 冒烟测试：发一条最小请求，验证 key / 网络 / 模型可用。

用法：
    uv run python test_deepseek.py
"""

import os
import sys

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()


def main() -> None:
    api_key = os.getenv("DEEPSEEK_API_KEY")
    if not api_key or api_key == "sk-":
        sys.exit("未配置 DEEPSEEK_API_KEY：请编辑 .env 填入 DeepSeek API Key")

    # DeepSeek 兼容 OpenAI 协议，只改 base_url 即可复用 openai SDK
    client = OpenAI(
        api_key=api_key,
        base_url=os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com"),
    )

    response = client.chat.completions.create(
        model="deepseek-flash",
        messages=[{"role": "user", "content": "用一句话介绍你自己"}],
    )

    print(response.choices[0].message.content)
    usage = response.usage
    if usage:
        print(
            f"\n[usage] prompt={usage.prompt_tokens} "
            f"completion={usage.completion_tokens} total={usage.total_tokens}"
        )


if __name__ == "__main__":
    main()

```

在控制台执行 ` uv run python test_deepseek.py`，此时应该输出：

```shell
❯ uv run python test_deepseek.py
我是由深度求索公司开发的AI助手DeepSeek，乐于用清晰可靠的方式为你提供帮助。

[usage] prompt=34 completion=109 total=143
```

此时简单的一问一答就已经完成，并且已经确认了配置没问题，API 可用。

## 测试图片识别

其实图片识别只需要更换 `message` 里面的内容就好，重要的是`type` 。

```python
"""DeepSeek API 冒烟测试：发一条最小请求，验证 key / 网络 / 模型可用。

用法：
    uv run python test_deepseek.py
"""

import os
import sys

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()


def main() -> None:
    api_key = os.getenv("DEEPSEEK_API_KEY")
    if not api_key or api_key == "sk-":
        sys.exit("未配置 DEEPSEEK_API_KEY：请编辑 .env 填入 DeepSeek API Key")

    # DeepSeek 兼容 OpenAI 协议，只改 base_url 即可复用 openai SDK
    client = OpenAI(
        api_key=api_key,
        base_url=os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com"),
    )

    response = client.chat.completions.create(
        model="deepseek-flash",
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": "这张图片里有什么？"},
                    {
                        "type": "image_url",
                        "image_url": {"url": "https://i0.hdslb.com/bfs/archive/a9e9ec5a889d5882cb2e9e8053b5d864ed5011e0.jpg"},
                    },
                ],
            },
        ],
    )

    print(response.choices[0].message.content)
    usage = response.usage
    if usage:
        print(
            f"\n[usage] prompt={usage.prompt_tokens} "
            f"completion={usage.completion_tokens} total={usage.total_tokens}"
        )


if __name__ == "__main__":
    main()

```

```shell
❯ uv run python test_deepseek.py
这张图片展示的是一颗**英特尔（Intel）的台式机处理器**，具体型号是 **i5-12600KF**。图片看起来像是某个电脑硬件评测视频或文章的封面图。

图片中的具体内容包括：

1. **顶部文字**：白色的粗体大字写着“**12600KF性能测试**”，明确了图片的主题。
2. **中央主体**：一颗正面朝上的 CPU 芯片。
   * **金属顶盖（IHS）**：银色金属表面印有 Intel 的 Logo、“INTEL® CORE™ i5” 以及型号“**i5-12600KF**”。
   * 此外还印有批次/规格代码（SRL4U）和二维码（Matrix码）等出厂信息。
   * **基板**：边缘是蓝绿色的 PCB 基板。
3. **背景**：深色（黑灰色）且有细微颗粒质感的背景，看起来像是放在桌垫或防静电垫上，背景被虚化以突出中央的 CPU。

**补充信息**：i5-12600KF 是英特尔第 12 代酷睿（Alder Lake）处理器，采用大小核架构，是一款带“K”（支持超频）和“F”（无内置核显）后缀的高性价比热门型号。

[usage] prompt=1003 completion=824 total=1827
```

### 应用场景

1. 发票审核
2. 财务审核
3. 合同审核

## 系统提示词与用户提示词

我们可以看到 message 里面刚才都是 `role: user`, 这是告诉大模型接下来 `content`里面的内容都是用户提示词。

系统提示词都是我们默认给到 LLM 的提示词，用户是看不见的。`Role: system`, 这都是用户无感知的。

| 系统提示词 (system) | 用户提示词 (user)                  |                        |
| :------------------ | :--------------------------------- | ---------------------- |
| **谁写的**          | 开发者 / 产品设计者                | 终端用户（或你自己）   |
| **用户可见吗**      | 通常不可见                         | 可见                   |
| **生效范围**        | 整个对话，持续约束                 | 当前这一轮             |
| **职责**            | 定人设、定规则、定输出格式、定边界 | 提需求、给数据、提问题 |
| **类比**            | 公司章程 + 员工手册                | 今天的具体工单         |

```python
response = client.chat.completions.create(
  model="deepseek-flash",
  messages=[
      # ↓ 系统提示词：开发者预设，用户看不到
      {"role": "system", "content": "你是一个只回答SQL问题的助手，回答必须用Markdown表格"},
      # ↓ 用户提示词：每轮真实输入
      {"role": "user", "content": "怎么查过去7天每个用户的订单数？"},
  ],
)
```

**系统提示词 Checklist**（推荐按这个顺序写）：

1. **角色**：你是一个 XXX
2. **任务**：你的职责是 XXX
3. **约束**：不允许 XXX；只使用 XXX
4. **输出格式**：必须输出 JSON / Markdown 表格 / 固定字段
5. **示例**（可选，few-shot）：输入A→输出A，输入B→输出B

**用户提示词 Checklist**：

1. **背景**：我在做什么（缺了这条模型全靠猜）
2. **任务**：具体要我做什么（动词开头）
3. **要求**：格式、长度、语言、口径

## 多轮对话 （历史对话）

我们知道 Transformer 的特性，推理下一个 Token 需要拿到之前所有的 Token。在 API 中就是不记录用户请求的上下文，用户在每次请求时，**需将之前所有对话历史拼接好后**，传递给对话 API。

第一轮对话：

```json
[
    {"role": "user", "content": "你是谁?"}
]
```



第二轮：

```json
[
    {"role": "user", "content": "你是谁?"}
  	{"role": "assistant", "content": "我是由深度求索公司开发的AI助手DeepSeek，乐于用清晰可靠的方式为你提供帮助。"}
		{"role": "user", "content": "你都会什么?"}
]
```

代码中肯定不能这样去写。

### 拼接 assistant

模拟代码：

```python
"""DeepSeek 多轮对话测试。

用法：
    uv run python test_multi_turn.py
"""
import os
import sys

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

def main() -> None:
    api_key = os.getenv("DEEPSEEK_API_KEY")
    if not api_key or api_key == "sk-":
            sys.exit("未配置 DEEPSEEK_API_KEY：请编辑 .env 填入 DeepSeek API Key")

    # DeepSeek 兼容 OpenAI 协议，只改 base_url 即可复用 openai SDK
    client = OpenAI(
            api_key=api_key,
            base_url=os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com"),
        )

    # 第一轮
    messages = [{"role": "user", "content": "世界上最高的山是什么？"}]
    response = client.chat.completions.create(
        model="deepseek-flash",
        messages=messages,
    )

    messages.append(response.choices[0].message)
    print(f"第1轮消息: {messages}")

    # 第二轮
    messages.append({"role": "user", "content": "那第二呢？"})
    response = client.chat.completions.create(
        model="deepseek-flash",
        messages=messages,
    )

    messages.append(response.choices[0].message)
    print(f"第2轮消息: {messages}")


if __name__ == "__main__":
    main()

```

```shell
❯ uv run python test_multi_turn.py 
第1轮消息: [{'role': 'user', 'content': '世界上最高的山是什么？'}, ChatCompletionMessage(content='世界上最高的山是**珠穆朗玛峰**，海拔约 **8848.86 米**，位于中国与尼泊尔边界。', refusal=None, role='assistant', annotations=None, audio=None, function_call=None, tool_calls=None, reasoning_content='我们需要回答中文问题。需要识别“世界上最高的山是什么？” 答案珠穆朗玛峰。但需注意最高山与最高峰区别？ 世界最高山一般指珠穆朗玛峰海拔8848.86米（中国尼泊尔边界）。如果严格“山”而非“峰”可能争议？ 通常答案珠峰。简洁回答。可以提按海拔。')]
第2轮消息: [{'role': 'user', 'content': '世界上最高的山是什么？'}, ChatCompletionMessage(content='世界上最高的山是**珠穆朗玛峰**，海拔约 **8848.86 米**，位于中国与尼泊尔边界。', refusal=None, role='assistant', annotations=None, audio=None, function_call=None, tool_calls=None, reasoning_content='我们需要回答中文问题。需要识别“世界上最高的山是什么？” 答案珠穆朗玛峰。但需注意最高山与最高峰区别？ 世界最高山一般指珠穆朗玛峰海拔8848.86米（中国尼泊尔边界）。如果严格“山”而非“峰”可能争议？ 通常答案珠峰。简洁回答。可以提按海拔。'), {'role': 'user', 'content': '那第二呢？'}, ChatCompletionMessage(content='世界第二高的山峰是**乔戈里峰**，又称 **K2**，海拔约 **8611 米**，位于中国与巴基斯坦边界的喀喇昆仑山脉。', refusal=None, role='assistant', annotations=None, audio=None, function_call=None, tool_calls=None, reasoning_content='我们需要回答中文问题。用户问“那第二呢？” 承接世界最高山。需要明确“第二高”是什么。世界上第二高的山峰是乔戈里峰/K2，海拔8611米，位于中国和巴基斯坦边界喀喇昆仑山脉。需要区分“第二高山”可能指独立山峰，乔戈里峰。也要注意如果按“山”而非“峰”或按地形突起度，可能有不同答案？ 世界第二高峰通常K2。可简洁回答。 需要中文。可补充：若按“独立山峰”海拔排名，第二是乔戈里峰（K2），8611米。最终简洁。')]
```

#### 真实业务场景代码设计

1. 开始提问
2. 将问题存入数据库，调用 LLM API。
3. 等待大模型回复，然后再将回复也存入数据库中。
4. 再问，将新的问题和数据库中的历史记录进行拼接，形成新的 prompt。
5. 用新的 prompt 调用 LLM API。

```python
"""交互式多轮对话（真实场景版）。

与 test_multi_turn.py 的区别：
- assistant 的历史回复全部来自 API 实时返回，运行时动态累积（无预填假数据）
- 带历史窗口管理，防止无限增长触顶上下文限制
- 命令：exit/quit 退出，reset 清空历史（保留 system）

用法：
    uv run python chat.py
"""

import os
import sys

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

Message = dict[str, str]

SYSTEM_PROMPT = "你是一个乐于助人的中文助手，回答简洁"
MAX_HISTORY = 20  # 最多保留的消息条数（不含 system），超出丢弃最旧的


class Conversation:
    """一个多轮会话：自动累积历史、自动裁剪、可重置。"""

    def __init__(self, client: OpenAI, system_prompt: str, max_history: int = MAX_HISTORY) -> None:
        self.client = client
        self.max_history = max_history
        self.messages: list[Message] = [{"role": "system", "content": system_prompt}]

    def send(self, user_input: str) -> str:
        """发一轮用户输入，返回模型回复；历史随之更新。"""
        self.messages.append({"role": "user", "content": user_input})
        reply = self._call_api()
        # 关键：模型的真实回复原样入列，成为下一轮的上下文
        self.messages.append({"role": "assistant", "content": reply})
        self._trim_history()
        return reply

    def _call_api(self) -> str:
        response = self.client.chat.completions.create(
            model="deepseek-flash",
            messages=self.messages,  # type: ignore[arg-type]
        )
        return response.choices[0].message.content or ""

    def _trim_history(self) -> None:
        """超出窗口时丢弃最旧的轮次；system 永远保留在首位。"""
        history = self.messages[1:]
        if len(history) > self.max_history:
            self.messages = [self.messages[0], *history[-self.max_history :]]

    def reset(self) -> None:
        """清空对话历史，只留 system。"""
        self.messages = [self.messages[0]]


def main() -> None:
    api_key = os.getenv("DEEPSEEK_API_KEY")
    if not api_key or api_key == "sk-":
        sys.exit("未配置 DEEPSEEK_API_KEY：请编辑 .env 填入 DeepSeek API Key")

    client = OpenAI(
        api_key=api_key,
        base_url=os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com"),
    )
    conv = Conversation(client, SYSTEM_PROMPT)

    print("多轮对话开始（exit 退出 / reset 清空历史）\n")
    while True:
        try:
            user_input = input("你: ").strip()
        except (EOFError, KeyboardInterrupt):
            break
        if not user_input:
            continue
        if user_input in ("exit", "quit"):
            break
        if user_input == "reset":
            conv.reset()
            print("── 历史已清空 ──\n")
            continue

        reply = conv.send(user_input)
        print(f"DeepSeek: {reply}\n")


if __name__ == "__main__":
    main()

```

## 流式输出

```python
"""流式输出测试

用法：
    uv run python test_stream.py
"""

import os
import sys
import time

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

MODEL = "deepseek-flash"
SYSTEM_PROMPT = "你是一个乐于助人的中文助手，回答简洁"
USER_INPUT = "用三句话介绍流式输出"


def main() -> None:
    api_key = os.getenv("DEEPSEEK_API_KEY")
    if not api_key or api_key == "sk-":
        sys.exit("未配置 DEEPSEEK_API_KEY：请编辑 .env 填入 DeepSeek API Key")

    client = OpenAI(
        api_key=api_key,
        base_url=os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com"),
    )

    # 开始时间
    start = time.perf_counter()
    # 首字用时
    first_token_time: float | None = None
    # 输出的最终文案
    full_text = ""

    with client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": USER_INPUT},
        ],
        # 开启流式输出
        stream=True,
    ) as response:  # 确保代码执行完之后自动关闭链接， 避免链接泄露
        for chunk in response:
            # chunk.choices 可能为空；delta.content 首块可能为 None
            delta = chunk.choices[0].delta.content if chunk.choices else None
            # 首块如果为 None 就跳过本次循环进入下一次
            if not delta:
                continue
            # 如果没计算过首字延迟时间 那就计算一下
            if first_token_time is None:
                first_token_time = time.perf_counter() - start
            # 立刻不换行输出拿到的内容 flush=True(立刻输出)
            print(delta, end="", flush=True)
            # 拼接拿到的内容
            full_text += delta

    total = time.perf_counter() - start
    print(f"\n\n[首字延迟] {first_token_time:.2f}s")
    print(f"[总耗时]   {total:.2f}s")
    print(f"[总字数]   {len(full_text)}")


if __name__ == "__main__":
    main()
```

```shell
❯ uv run python test_stream.py
流式输出是指系统边生成内容边返回给用户，而不是等全部结果生成完再一次性返回。它能显著降低首字等待时间，让用户更早看到内容并提升交互体验。常见于大模型对话和长文本生成，但需要处理好数据分片拼接、结束标识和异常中断。

[首字延迟] 1.20s
[总耗时]   1.66s
[总字数]   106
```

## 工具方法（Tool Calls）

Tool Calls 让模型能够调用外部工具，来增强自身能力。例如查询天气：

```python
"""Function Calling（工具调用）测试。

核心机制：模型不直接回答问题，而是返回一个"调用请求"（tool_calls），
由代码本地执行函数，再把结果回传给模型，生成最终回答。

完整流程：
    1. 用户提问
    2. 模型返回 tool_calls（决定调 get_weather，参数 {"location": "北京"}）
    3. 本地执行 get_weather("北京") → "24℃ 晴"
    4. 以 role="tool" 消息把结果回传（必须带 tool_call_id 对应）
    5. 模型基于工具结果生成最终回答

用法（在项目根目录执行）：
    uv run python src/test_tool_calls.py
"""

import json
import os
import sys

from dotenv import load_dotenv
from openai import OpenAI
from openai.types.chat import ChatCompletionMessage

load_dotenv()

MODEL = "deepseek-flash"


def build_client() -> OpenAI:
    api_key = os.getenv("DEEPSEEK_API_KEY")
    if not api_key or api_key == "sk-":
        sys.exit("未配置 DEEPSEEK_API_KEY：请编辑 .env 填入 DeepSeek API Key")
    return OpenAI(
        api_key=api_key,
        base_url=os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com"),
    )


client = build_client()

# ---- 1. 工具定义：告诉模型"你有哪些工具可调" ----
# description 和 parameters 是模型唯一能看到的"说明书"，写清楚它才会用对
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather", # 模型实际调用的函数
            "description": "获取单个城市的天气。用户同时问多个城市时，会为每个城市分别调用一次。",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        # 单值类型：忠实映射真实天气 API（一次请求只查一个城市）
                        "type": "string",
                        "description": "城市名称，例如北京。",
                    },
                },
                "required": ["location"],
            },
        },
    },
]


# ---- 2. 本地实现：模型只"决定调用"，真正执行在你手里 ----
def get_weather(location: str) -> str:
    """查询单个城市的天气（演示用假数据；真实场景替换为 HTTP 调用天气 API）。

    真实 API 通常一次只查一个城市：
        GET https://api.weather.com/v1/current?city=北京
    多城市由模型发起多个 tool_call，可并发执行。
    """
    mock_data = {"北京": "24℃ 晴", "上海": "26℃ 多云", "广州": "30℃ 阵雨"}
    return mock_data.get(location, f"{location}：暂无数据")


# ---- 3. 发消息：tools 参数随请求一起发给模型 ----
def send_messages(messages: list[dict]) -> ChatCompletionMessage:
    response = client.chat.completions.create(
        model=MODEL,
        messages=messages,  # type: ignore[arg-type]
        tools=tools,
        # DeepSeek 特有参数：关闭思维链，让模型直接做工具决策
        extra_body={"thinking": {"type": "disabled"}},
    )
    return response.choices[0].message


def main() -> None:
    messages: list[dict] = [{"role": "user", "content": "北京和上海的天气怎么样？"}]

    # 第 1 轮：模型决定是否调工具
    message = send_messages(messages)
    print(f"User>\t {messages[0]['content']}")

    # 注意：模型可能选择不调工具（tool_calls 为 None），必须判空
    if not message.tool_calls:
        print(f"Model>\t {message.content}")
        return

    # 关键：模型的调用请求也要原样入列，否则第 2 轮它不知道自己要过调工具
    # （Pydantic 对象转 dict，exclude_none 清掉 content=None 等空字段）
    messages.append(message.model_dump(exclude_none=True))

    # 模型可能一次返回多个 tool_call（如"北京和上海"各一个），逐个执行、逐个回传
    # 生产环境可在此并发执行（ThreadPoolExecutor）缩短总耗时
    for tool_call in message.tool_calls:
        args = json.loads(tool_call.function.arguments)
        print(f"Tool>\t 调用 {tool_call.function.name}({args})")
        result = get_weather(**args)
        # role=tool 的消息必须带 tool_call_id，模型靠它把结果对回调用
        messages.append({"role": "tool", "tool_call_id": tool_call.id, "content": result})

    # 第 2 轮：模型基于工具结果生成最终回答
    message = send_messages(messages)
    print(f"Model>\t {message.content}")


if __name__ == "__main__":
    main()

```

```Python
❯ uv run python test_tool_calls.py
User>    北京和上海的天气怎么样？
Tool>    调用 get_weather({'location': '北京'})
Tool>    调用 get_weather({'location': '上海'})
Model>   北京和上海的天气如下：

- **北京**：24℃，晴
- **上海**：26℃，多云

两地都比较舒适，上海略暖一些，北京则是晴朗的好天气。需要我帮你查其他城市吗？
```

## 思考模式

大模型可以打开或者关闭思考模型。

### 什么是思考模式：

DeepSeek 的推理模型在给出最终答案前，会先生成一段"思维链"
（Chain-of-Thought），把推理过程写出来，再据此给出答案。
这段思维链不展示给用户，但能显著提升复杂题的正确率。

### 思考模式的两条输出：

reasoning_content  —— 思维链（推理过程），与 content 同级
content            —— 最终答案

### 接口层面的关键点（极易踩坑）：

       1. 思考默认开启。不写任何参数它就是开着的（effort 默认 high）。
    1. 开关 thinking 是 DeepSeek 私有参数，OpenAI SDK 的 create()
        方法签名里没有它，所以必须塞进 extra_body 透传：
        extra_body={"thinking": {"type": "enabled"}}   开启（默认）
        extra_body={"thinking": {"type": "disabled"}}  关闭
    1. reasoning_effort="low"|"high"|"max" 控制思考深度，是 OpenAI 官方参数，
        可直接传；可与 thinking 搭配使用。
       4. 带工具调用（tools）时，reasoning_content 必须原样回传，否则 API 报 400。

```python
"""思考模式（Thinking Mode / Reasoning）示例。

三个演示：
    ① 思考模式 · 非流式：一次返回，看 reasoning_content 与 content 分离
    ② 思考模式 · 流式：思维链和答案分两段实时到达（"思考中…" UI 的原理）
    ③ 关闭思考：同一道题对比速度与正确性

用法：
    uv run python test_thinking.py
"""

import os
import sys
import time

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

MODEL = "deepseek-flash"

# 经典陷阱题：9.11 和 9.9 谁大？模型容易按"小数位数/字符串"误判成 9.11 更大。
# 正是思考模式最能体现价值、且容易量化对错的一道题。
QUESTION = "9.11 和 9.9 哪个大？只回答哪个更大。"


def build_client() -> OpenAI:
    """构造 OpenAI 客户端（兼容 DeepSeek 的 OpenAI 协议端点）。

    密钥从 .env 读取，未配置时直接退出，避免代码里硬编码 key。
    """
    api_key = os.getenv("DEEPSEEK_API_KEY")
    if not api_key or api_key == "sk-":
        sys.exit("未配置 DEEPSEEK_API_KEY：请编辑 .env 填入 DeepSeek API Key")
    return OpenAI(
        api_key=api_key,
        # base_url 指向 DeepSeek 网关；也可在 .env 用 DEEPSEEK_BASE_URL 覆盖
        base_url=os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com"),
    )


# 模块加载时即建好客户端，三个测试函数共用同一个连接配置
client = build_client()


def test_thinking_nonstream() -> None:
    """① 非流式：一次请求拿回完整结果，重点看两条内容如何分离。"""
    print("=" * 60)
    print("① 思考模式（默认开启）· 非流式")
    print("=" * 60)

    # 关键参数：
    #   reasoning_effort="high"   —— 思考深度开到最大
    #   extra_body={"thinking": {"type": "enabled"}}
    #       —— 显式开启思考（其实不写默认也是开）
    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": QUESTION}],
        reasoning_effort="high",
        extra_body={"thinking": {"type": "enabled"}},
    )
    message = response.choices[0].message

    # reasoning_content 与 content 是 message 上的两个并列字段。
    # 老版本 SDK 的类型定义里可能还没有 reasoning_content，
    # 用 getattr 兜底，避免 AttributeError。
    reasoning = getattr(message, "reasoning_content", None)
    print("【思维链 reasoning_content】")
    print(reasoning or "（无，试试 reasoning_effort 或换模型）")

    print("\n【最终答案 content】")
    print(message.content)

    # usage 里能看到"有多少 token 花在了思考上"，这是算账 / 成本评估的依据
    if response.usage:
        # completion_tokens_details 同样可能缺失，逐层 getattr 兜底
        details = getattr(response.usage, "completion_tokens_details", None)
        reasoning_tokens = getattr(details, "reasoning_tokens", 0) if details else 0
        print(
            f"\n[usage] prompt={response.usage.prompt_tokens} "
            f"completion={response.usage.completion_tokens} "
            f"reasoning={reasoning_tokens}"
        )


def test_thinking_stream() -> None:
    """② 流式：思维链和答案分两段实时到达，是"思考中…→答案逐字" UI 的原理。"""
    print("=" * 60)
    print("② 思考模式 · 流式（实时分阶段输出）")
    print("=" * 60)

    start = time.perf_counter()
    reasoning, answer = "", ""          # 分别累积思维链与答案
    first_reasoning_at: float | None = None  # 首个思维链片段的耗时
    first_answer_at: float | None = None     # 首个答案片段的耗时

    # with 块保证：无论中途是否 break / 异常，底层 HTTP 连接都会关闭，
    # 避免流式请求常犯的"连接泄漏"。
    with client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": QUESTION}],
        reasoning_effort="high",
        extra_body={"thinking": {"type": "enabled"}},
        stream=True,
    ) as stream:
        for chunk in stream:
            # 防御：个别 chunk 可能没有 choices（如生命周期事件），跳过
            delta = chunk.choices[0].delta if chunk.choices else None
            if delta is None:
                continue

            # 流式的思维链走 delta.reasoning_content（与 delta.content 互斥到达）
            rc = getattr(delta, "reasoning_content", None)
            if rc:
                if first_reasoning_at is None:
                    first_reasoning_at = time.perf_counter() - start
                reasoning += rc

            # 答案增量走 delta.content。
            # 注意：这里用独立的 if（不是 elif），万一某 chunk 同时带两者也能都抓到
            if delta.content:
                if first_answer_at is None:
                    first_answer_at = time.perf_counter() - start
                answer += delta.content

    print("【思维链】")
    print(reasoning or "（无）")
    print("\n【答案】")
    print(answer)
    if first_reasoning_at is not None:
        print(f"\n[首个思维链片段] {first_reasoning_at:.2f}s")
    if first_answer_at is not None:
        print(f"[首个答案片段]   {first_answer_at:.2f}s")
    print(f"[总耗时]         {time.perf_counter() - start:.2f}s")


def test_without_thinking() -> None:
    """③ 关闭思考：同一题对比——速度是否变快、答案是否仍正确。

    实测单次差异受网络抖动影响很大，要下结论得同题跑 10 次取平均。
    """
    print("=" * 60)
    print("③ 关闭思考模式（thinking: disabled）· 同一道题")
    print("=" * 60)

    start = time.perf_counter()
    # 唯一区别：thinking 关掉。不传 reasoning_effort，由服务端按默认处理
    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": QUESTION}],
        extra_body={"thinking": {"type": "disabled"}},
    )
    elapsed = time.perf_counter() - start
    message = response.choices[0].message

    print("【答案】")
    print(message.content)
    # 关闭成功时不应再有任何思维链；若有，说明没真正关掉
    has_reasoning = bool(getattr(message, "reasoning_content", None))
    print(f"\n[思维链] {'有（说明没关掉）' if has_reasoning else '无 ✅'}")
    print(f"[耗时]   {elapsed:.2f}s")


def main() -> None:
    """依次跑三个演示。"""
    test_thinking_nonstream()
    print()
    test_thinking_stream()
    print()
    test_without_thinking()


if __name__ == "__main__":
    main()

```

```shell
❯ uv run python test_thinking.py
============================================================
① 思考模式（默认开启）· 非流式
============================================================
【思维链 reasoning_content】
We need answer Chinese only which bigger. Compare 9.11 vs 9.9. Numerically 9.9 > 9.11. Only answer which bigger. "9.9 更大" is maybe answer which larger. They requested only answer which greater. Could just "9.9". Need no explanation.

【最终答案 content】
9.9 更大

[usage] prompt=48 completion=73 reasoning=67

============================================================
② 思考模式 · 流式（实时分阶段输出）
============================================================
【思维链】
We need answer in Chinese only which greater. Need be careful: 9.11 vs 9.9. Numerically 9.9 > 9.11. User asks "9.11 和 9.9 哪个大？只回答哪个更大。" Need answer only which bigger. "9.9更大" or "9.9". Only answer. 

【答案】
9.9更大

[首个思维链片段] 0.60s
[首个答案片段]   1.01s
[总耗时]         1.01s

============================================================
③ 关闭思考模式（thinking: disabled）· 同一道题
============================================================
【答案】
9.9 更大。

[思维链] 无 ✅
[耗时]   0.62s
```

### 为什么非深度思考容易产生幻觉？

**幻觉：为了快速生成而导致答案是个错误的。**

#### 非深度思考：

1. 直接模式匹配：下一个 token 预测
2. 输出流畅答案：未做内部校验
3. 幻觉风险高：流畅但可能错误

#### 深度思考：

1. 拆解问题步骤：把难题拆成小步
2. 逐步推导：显式写出中间过程
3. 自我核对校验：矛盾处会被发现
4. 幻觉率降低：经推导验证后输出

### 思考深度

`reasoning_effort："none | low | high | max`

`none` 关闭思考模式；`low` / `high` / `max` 开启思考模式。默认强度为 `high`。

## 最大输出长度

通过设置 **max_tokens** 来设置最大输出长度。取值范围为 1 到 384K（393216）,非思考模式默认 8K，思考模式默认 64K（`reasoning_effort` 为 `max` 时为 128K）。

```python
client = client.chat.completions.create(
    model=MODEL,
    messages=[
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": USER_INPUT},
    ],
    # 设置最大输出长度
  	max_tokens=1024
) 
```

## FIM 补全

可以提供前缀和后缀（可选），模型来补全中间的内容。FIM 常用于内容续写、代码补全等场景。

```python
"""FIM 补全（Fill-In-the-Middle）示例。

什么是 FIM：
    给模型一段"前缀"和一段"后缀"，让它把中间那一段补出来。
    这是 IDE 代码补全（Copilot 的 Tab 补全）的底层原理——
    你在函数体中间按下 Tab，光标前后都有代码，模型要填的正是中间。

        def fib(a):
            ┌─────────────────┐   ← 模型要填这里
            └─────────────────┘
            return fib(a-1) + fib(a-2)
        └─ prefix ─┘              └─ suffix ─┘

与 chat.completions 的三点关键差异（极易踩坑）：
    1. 端点不同：base_url 必须是 https://api.deepseek.com/beta（Beta 功能）
    2. 接口不同：用 client.completions.create()，不是 client.chat.completions.create()
    3. 取值不同：结果在 response.choices[0].text，不是 message.content

参数：
    prompt   —— 前缀（必填）
    suffix   —— 后缀（可选；不给就退化成普通续写）
    max_tokens —— FIM 上限 4K
    stop     —— 建议设置，否则模型可能把后缀又重复生成一遍
    echo     —— 是否回显 prompt（与 suffix / logprobs 互斥）
    支持模型：deepseek-flash / deepseek-v4-pro（FIM 专用列表，与对话接口不同）

三个演示：
    ① 经典代码 FIM：补全 fib 函数的 base case
    ② 不传 suffix：退化成普通续写，对比差异
    ③ 非代码场景：文本中间填充，说明 FIM 的通用性

用法：
    uv run python test_fim.py
"""

import os
import sys

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

MODEL = "deepseek-flash"

# FIM 必须走 /beta 端点，这是开启 Beta 功能的开关
BETA_BASE_URL = "https://api.deepseek.com/beta"


def build_client() -> OpenAI:
    """构造 FIM 专用客户端（指向 /beta 端点）。"""
    api_key = os.getenv("DEEPSEEK_API_KEY")
    if not api_key or api_key == "sk-":
        sys.exit("未配置 DEEPSEEK_API_KEY：请编辑 .env 填入 DeepSeek API Key")
    return OpenAI(api_key=api_key, base_url=BETA_BASE_URL)


client = build_client()


def fim_complete(prefix: str, suffix: str | None = None, stop: list[str] | None = None) -> str:
    """调用 FIM 补全，返回模型生成的中间内容。

    注意用的是 client.completions（补全接口），不是 chat.completions。
    """
    kwargs: dict = {
        "model": MODEL,
        "prompt": prefix,
        "max_tokens": 128,
    }
    # suffix 为 None 时不传该参数，退化为普通续写
    if suffix is not None:
        kwargs["suffix"] = suffix
    if stop:
        kwargs["stop"] = stop

    response = client.completions.create(**kwargs)
    # 补全接口的结果在 .text，对话接口才在 .message.content
    return response.choices[0].text


def test_fim_code() -> None:
    """① 经典代码 FIM：给函数头和递归返回，让模型补全边界条件。"""
    print("=" * 60)
    print("① 经典 FIM · 补全 fib 函数的 base case")
    print("=" * 60)

    prefix = "def fib(a):\n"
    suffix = "    return fib(a-1) + fib(a-2)"

    print("【前缀 prompt】")
    print(prefix, end="")
    print("【后缀 suffix】")
    print(suffix)
    print("\n【模型填充的中间部分】")

    # stop 设成后缀的开头：防止模型填完后又把 suffix 重复生成一遍
    filled = fim_complete(prefix, suffix, stop=["    return fib"])

    print(filled)

    # 拼回完整代码，直观看到 FIM 的成品。
    # 注意：模型填充的内容通常不以换行结尾，直接拼接会和 suffix 挤在同一行，
    # 这里 rstrip + "\n" 仅为展示可读性，真实 IDE 补全时是原样插在光标处的。
    print("\n【拼回完整代码】")
    print(prefix + filled.rstrip() + "\n" + suffix)


def test_fim_without_suffix() -> None:
    """② 不传 suffix：suffix 是可选的，此时退化成普通续写。"""
    print("=" * 60)
    print("② 不传 suffix · 退化成普通续写")
    print("=" * 60)

    prefix = "def add(a, b):\n"

    print("【前缀 prompt】")
    print(prefix, end="")
    print("\n【续写结果】")

    # 不传 suffix → 模型一直往下写，用 stop 在空行处截断
    filled = fim_complete(prefix, suffix=None, stop=["\n\n"])

    print(filled)
    print("\n说明：没有后缀约束时，模型不知道该在哪里收尾，容易续写出多余内容。")


def test_fim_text() -> None:
    """③ 非代码场景：FIM 不只用于代码，文本中间填充同样成立。"""
    print("=" * 60)
    print("③ 非代码场景 · 文本中间填充")
    print("=" * 60)

    # 后缀以「，于是」开头，这样和填充内容拼接后标点自然连贯
    prefix = "今天天气很好，"
    suffix = "，于是我们取消了原定的室内活动。"

    print(f"【前缀】{prefix}")
    print(f"【后缀】{suffix}")
    print("\n【模型填充的中间部分】")

    # stop 设成后缀开头，避免模型把后缀又生成一遍
    filled = fim_complete(prefix, suffix, stop=["，于是"])

    print(filled)

    print("\n【拼回完整句子】")
    print(prefix + filled.rstrip() + suffix)


def main() -> None:
    """依次跑三个演示。"""
    test_fim_code()
    print()
    test_fim_without_suffix()
    print()
    test_fim_text()


if __name__ == "__main__":
    main()

```



```python
❯ uv run python test_fim.py
============================================================
① 经典 FIM · 补全 fib 函数的 base case
============================================================
【前缀 prompt】
def fib(a):
【后缀 suffix】
    return fib(a-1) + fib(a-2)

【模型填充的中间部分】
    if a==1 or a==0:
        return 1

【拼回完整代码】
def fib(a):
    if a==1 or a==0:
        return 1
    return fib(a-1) + fib(a-2)

============================================================
② 不传 suffix · 退化成普通续写
============================================================
【前缀 prompt】
def add(a, b):

【续写结果】
    """Return the sum of a and b."""
    return a + b

说明：没有后缀约束时，模型不知道该在哪里收尾，容易续写出多余内容。

============================================================
③ 非代码场景 · 文本中间填充
============================================================
【前缀】今天天气很好，
【后缀】，于是我们取消了原定的室内活动。

【模型填充的中间部分】
阳光明媚

【拼回完整句子】
今天天气很好，阳光明媚，于是我们取消了原定的室内活动。
```

## 输出超过模型上限怎么办

### 确认是不是被截断

```python
choice = response.choices[0]

if choice.finish_reason == "length":
    print("⚠️ 输出被 max_tokens 截断，内容不完整！")
elif choice.finish_reason == "stop":
    print("✅ 正常结束")
```

如果是 `max_tokens` 截断，那么就加大`Max_token`。

### 自动续写循环

如果`max_tokens`不够了怎么办？被截断后把已有内容作为 assistant 前缀发回去，让模型接着写。**必须用 `/beta` 端点 + `prefix: True`**：

```python
def complete_long(client, messages, max_tokens=4096, max_rounds=5) -> str:
    """自动续写：被 max_tokens 截断后拼接继续，直到正常结束。"""
    full = ""
    for _ in range(max_rounds):
        msgs = messages
        if full:  # 已生成的内容作为 assistant 前缀，让模型接着写
            msgs = messages + [{"role": "assistant", "content": full, "prefix": True}]

        response = client.chat.completions.create(
            model="deepseek-flash",
            messages=msgs,
            max_tokens=max_tokens,
        )
        choice = response.choices[0]
        full += choice.message.content or ""

        if choice.finish_reason == "stop":
            return full        # ✅ 正常写完
        # finish_reason == "length" → 进入下一轮继续拼

    return full  # 达到轮数上限，可能仍不完整

```

## 输入输出都超过上限怎么办

1. 对话历史压缩，牺牲细节
2. 外置存储（RAG），别把整个文档塞进去，只检索 top-k 相关片段

## JSON 输出

大模型大部分时间输出都是 markdown 格式的内容，但是在很多场景下，需要让模型严格按照 JSON 格式来输出，以实现输出的结构化，便于后续逻辑进行解析。

### JSON Schema 模式

**JSON Schema**：保证「输出严格符合你给的 schema」——**结构保证**（字段名、类型、嵌套、枚举都对）

DeepSeek 的 Chat Completions API 原生不支持，要原生 schema 保证就用 OpenAI / Antheperopic 或者其他支持的模型。

但是 Responses API 支持，可以先看 OpenAi Chat Completions API的例子：

```python
python
from openai import OpenAI
from pydantic import BaseModel, Field

client = OpenAI()

# 1. 使用 Pydantic 定义你想要的 JSON 结构
class CalendarEvent(BaseModel):
    name: str = Field(description="活动名称")
    date: str = Field(description="活动的日期，格式为 YYYY-MM-DD")
    participants: list[str] = Field(description="参与者名单")

# 2. 调用 API 并传入 response_format
completion = client.beta.chat.completions.parse(
    model="gpt-4o",
    messages=[
        {"role": "system", "content": "提取文本中的日程信息。"},
        {"role": "user", "content": "下周五（2026-10-30）我和小明、高级经理要开个产品同步会。"}
    ],
    # 核心：指定 response_format 为你的 Pydantic 模型
    response_format=CalendarEvent,
)

# 3. 直接获取解析好的结构化对象
event = completion.choices[0].message.parsed
print(event.name)          # 输出: 产品同步会
print(event.date)          # 输出: 2026-10-30
print(event.participants)  # 输出: ['小明', '高级经理']

```

Responses API：

```python
"""Responses API + JSON Schema + Pydantic 结构化输出示例。

为什么要用 Pydantic：
    手写 schema dict 有两个痛点——
    	① 结构要写两遍（schema 一遍、解析一遍）
    	② 拿到 JSON 只能当 dict 用，没有类型提示。
    Pydantic 把这两件事合成一件：
        · 模型定义即 schema（model_json_schema() 自动生成，不用手写 dict）
        · model_validate_json() 校验并转成类型安全对象（data.cities[0].temp 真的是 int）

Responses API 与 Chat Completions 的差异：
    1. 结构化参数在 text={"format": {...}}，不是 response_format={...}
    2. 输入用 input=[...]，系统提示单独用 instructions="..."
    3. 结果取 resp.output_text

strict 模式的两条硬规矩（Pydantic 已自动满足）：
    · 所有字段进 required         → Pydantic 默认都是 required
    · additionalProperties: false → 靠 model_config = ConfigDict(extra="forbid")
    想做可选字段：Optional[X] = None，或 Field(default=None)

两个演示：
    ① Pydantic 驱动 json_schema：自动生成 schema → 调用 → 校验成类型安全对象
    ② 校验兜底：拿 json_object 的不稳定输出去 validate，看 Pydantic 如何拦住它

用法（文件在 src/ 目录下，须在项目根目录执行）：
    uv run python src/test_responses_schema.py
"""

import json
import os
import sys
from typing import Literal

from dotenv import load_dotenv
from openai import OpenAI
from pydantic import BaseModel, ConfigDict, Field, ValidationError

load_dotenv()

MODEL = "deepseek-flash"


# ============================================================
# 1. Pydantic 模型 = schema 的唯一来源（不再手写 dict）
# ============================================================
class Weather(BaseModel):
    """单条天气记录——这个类的定义本身就是 JSON Schema。

    每个字段注解都会被翻译成 schema 的一个 property：
        str       → {"type": "string"}
        int       → {"type": "integer"}
        Literal[] → {"type": "string", "enum": [...]}
    Field(description=...) 会写进 schema 的 description，模型靠它理解该填什么。
    """

    # extra="forbid" 是这里最关键的一行：
    # 它让 model_json_schema() 生成 "additionalProperties": false，
    # 而这是 strict 模式的硬性要求（缺了会被 API 拒绝）。
    model_config = ConfigDict(extra="forbid")

    city: str = Field(description="城市名称")
    temp: int = Field(description="气温（摄氏度）")
    # Literal 会被自动转成 JSON Schema 的 enum，模型只能从这几个值里选
    condition: Literal["晴", "多云", "阴", "雨", "雪"] = Field(description="天气状况")
    humidity: int = Field(description="湿度百分比")


class WeatherList(BaseModel):
    """顶层结构：城市天气列表。

    嵌套的 Weather 会在生成的 schema 里变成 $defs + $ref 引用
    （DeepSeek 实测接受这种形式，不需要手动内联展开）。
    """

    model_config = ConfigDict(extra="forbid")
    cities: list[Weather]


def build_client() -> OpenAI:
    """构造客户端。Responses API 与 Chat Completions 共用同一个 base_url。"""
    api_key = os.getenv("DEEPSEEK_API_KEY")
    if not api_key or api_key == "sk-":
        sys.exit("未配置 DEEPSEEK_API_KEY：请编辑 .env 填入 DeepSeek API Key")
    return OpenAI(api_key=api_key, base_url="https://api.deepseek.com")


client = build_client()

# 待提取的原始文本：故意包含两个城市，用来验证 schema 里的数组结构
USER_INPUT = "北京今天 24 度，晴，湿度 30%。上海 26 度，多云，湿度 65%。"


def test_pydantic_json_schema() -> None:
    """① Pydantic 自动生成 schema → 调用 → 校验成类型安全对象。"""
    print("=" * 60)
    print("① Pydantic 驱动 json_schema（推荐路径）")
    print("=" * 60)

    # ★ 核心一行：Pydantic 模型 → JSON Schema。
    # 从此 schema 与 Python 类型定义同源，改字段只需改类定义一处。
    schema = WeatherList.model_json_schema()
    print("【Pydantic 自动生成的 schema（节选）】")
    print(json.dumps(schema, ensure_ascii=False, indent=2)[:500] + "\n  ...")

    try:
        resp = client.responses.create(
            model=MODEL,
            # Responses API 的系统提示是独立的 instructions 参数，
            # 不像 Chat Completions 那样塞进 messages 里当 role="system"
            instructions="你是一个信息提取助手，从用户的描述中提取天气信息。",
            # Responses API 的用户输入用 input（字符串或消息列表），不是 messages
            input=USER_INPUT,
            # ★ 结构化输出的落点：text.format（Chat Completions 用的是 response_format）
            text={
                "format": {
                    # json_schema = 结构保证；json_object = 仅语法保证
                    "type": "json_schema",
                    # schema 名称，自定义但必填
                    "name": "weather_list",
                    # 直接喂 Pydantic 生成的 schema
                    "schema": schema,
                    # 开启严格约束：字段名/类型/枚举全部强制
                    "strict": True,
                }
            },
        )
    except Exception as exc:  # noqa: BLE001 - 故意宽捕获，用于探测接口支持情况
        print(f"\n❌ 请求失败：{type(exc).__name__}: {exc}")
        print("   该模型/端点若不支持 json_schema，可退回 json_object 或 Function Calling。")
        return

    # Responses API 把各段输出聚合好放在 output_text，不用自己拼 content
    raw = resp.output_text
    print("\n【原始输出 output_text】")
    print(raw)

    # ★ 校验 + 转对象：model_validate_json 一次完成「解析 + 按模型定义校验」。
    # 通过则返回 WeatherList 实例；不通过抛 ValidationError，不会静默出错。
    try:
        data = WeatherList.model_validate_json(raw)
    except ValidationError as exc:
        print(f"\n❌ 输出不符合模型定义（{exc.error_count()} 处错误）：")
        for err in exc.errors()[:5]:
            print(f"   {err['loc']} → {err['msg']}")
        return

    print("\n【校验通过 · 类型安全访问】")
    for w in data.cities:
        # w 是 Weather 实例：w.temp 是 int，所以能直接做算术运算。
        # 若拿到裸 dict 且值是字符串 "24"，这里 +1 会变成字符串拼接或直接报错。
        print(f"  {w.city}: {w.temp}℃ (若升温1度={w.temp + 1}℃) {w.condition} 湿度{w.humidity}%")

    print(f"\n[对象类型] {type(data).__name__} → {type(data.cities[0]).__name__}")


def test_validation_guard() -> None:
    """② 兜底验证：拿 json_object 的不稳定输出去 validate，看它如何被拦住。"""
    print("\n" + "=" * 60)
    print("② 校验兜底 · json_object 的输出能否通过校验")
    print("=" * 60)

    try:
        resp = client.responses.create(
            model=MODEL,
            instructions="你是一个信息提取助手，提取天气信息并以 JSON 格式返回。",
            input="北京今天 24 度，晴，湿度 30%。",
            # json_object：只保证输出是"合法 JSON"（括号匹配、引号闭合），
            # 字段名和类型完全由模型自由发挥 —— 这是它与 json_schema 的本质区别
            text={"format": {"type": "json_object"}},
        )
    except Exception as exc:  # noqa: BLE001
        print(f"❌ 请求失败：{type(exc).__name__}: {exc}")
        return

    raw = resp.output_text
    print("【json_object 原始输出】")
    print(raw)

    # 先 json.loads（一定成功，因为 json_object 保证了语法合法），
    # 再交给 Pydantic 做结构校验（这一步大概率失败）
    single: dict = json.loads(raw)
    try:
        w = Weather.model_validate(single)
        print(f"\n✅ 侥幸通过校验：{w.city} {w.temp}℃")
        print("   注意：这只是运气好，换个提问/换个模型字段名就会漂。")
    except ValidationError as exc:
        # exc.errors() 返回结构化错误列表：loc=字段路径、msg=原因、type=错误类型
        print(f"\n❌ 被 Pydantic 拦住（{exc.error_count()} 处问题）：")
        for err in exc.errors()[:5]:
            loc = ".".join(str(x) for x in err["loc"]) or "(根)"
            print(f"   {loc} → {err['msg']}")
        print("\n   这正是必须在下游加校验的原因：json_object 只保证语法，不保证结构。")


def main() -> None:
    """依次跑两个演示。"""
    test_pydantic_json_schema()
    test_validation_guard()


if __name__ == "__main__":
    main()

```

### JSON Object 模式

**JSON Object**：只保证「输出是一段能被 `json.loads` 的合法 JSON」——**语法保证**

```python
response = client.chat.completions.create(
    model="deepseek-flash",
    messages=[
        {"role": "system", "content": "提取城市天气，返回 JSON"},  # ← 必须含 "json" 字样
        {"role": "user", "content": "北京今天 24 度，晴"},
    ],
  	# 开启 JSON Object 模式
    response_format={"type": "json_object"},
)
data = json.loads(response.choices[0].message.content)
# ⚠️ data 可能是 {"city": ...}，也可能是 {"城市": ...} —— 字段名不保证

```

## Chat Completions API 与 Responses API 的区别

**Chat Completions 默认由开发者管理上下文，Responses 提供了由 API 协助管理上下文的能力。**

Chat Completions 通常需要应用自己管理对话历史；Responses API 则支持通过 `previous_response_id` 或 Conversations API 延续上下文。可以简单理解为 Chat Completions 没有状态，但是 Responses 是有状态的。

所以在日常 Agent 开发中，一般都使用 Responses API。

### 核心差异对照

| 维度       | Chat Completions                                             | Responses                                                    |
| :--------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| 入口       | `client.chat.completions.create()`                           | `client.responses.create()`                                  |
| 端点       | `/chat/completions`                                          | `/responses`                                                 |
| 输入       | `messages=[{role, content}]`                                 | `input=[...]`（字符串或列表）                                |
| 系统提示   | 塞在 `messages` 里当 `role="system"`                         | 独立参数 **`instructions=`**                                 |
| 取结果     | `choices[0].message.content`                                 | **`resp.output_text`**（聚合纯文本）                         |
| 返回结构   | `choices[0].message`（单个 message）                         | **`resp.output`**（数组：message / reasoning / function_call / web_search_call…） |
| 结构化输出 | `response_format={"type":"json_schema","json_schema":{...}}` | **`text={"format":{"type":"json_schema","name":..,"schema":..,"strict":..}}`** |
| Pydantic   | 自己 `model_validate_json(content)`                          | 可 `client.responses.parse(text_format=Model)` → `resp.output_parsed` |
| 流式解析   | `chunk.choices[0].delta.content`                             | `event.type=="response.output_text.delta"` → `event.delta`   |
| 上下文状态 | **无状态**，每轮重发全量 messages                            | 支持 **`previous_response_id`** 让服务端续上下文             |
| 内置工具   | 无（只有 Function Calling）                                  | 内置 `web_search` / `file_search` / `code_interpreter`       |
| 服务端存储 | 不存                                                         | 默认**存储响应**（合规敏感，可 `store=False`）               |

### 写法对照

**创建链接和获取输出**

```python
# Chat Completions
response = client.chat.completions.create(
    model="deepseek-v4-flash",
    messages=[
        {"role": "system", "content": "你是信息提取助手"},
        {"role": "user", "content": "北京今天24度，晴"},
    ],
    response_format={"type": "json_object"},
)
print(response.choices[0].message.content)

# Responses
response = client.responses.create(
    model="deepseek-flash",
    instructions="你是信息提取助手",        # 系统提示独立出来
    input="北京今天24度，晴",
    text={"format": {"type": "json_object"}},
)
print(response.output_text)
```

**断开链接**

```python
# Chat Completions：单位是 chunk
for chunk in stream:
    print(chunk.choices[0].delta.content or "", end="")

# Responses：单位是 event，要先判类型
for event in stream:
    if event.type == "response.output_text.delta":
        print(event.delta, end="")
```

**多轮对话**

```python
# Chat Completions：必须自己攒历史，每轮全量重发
messages.append({"role": "assistant", "content": reply})
messages.append({"role": "user", "content": "再详细点"})

# Responses（OpenAI）：服务端帮你记住上下文
resp2 = client.responses.create(
    model="...",
    previous_response_id=resp1.id,     # ← 不用重发历史
    input=[{"role": "user", "content": "再详细点"}],
)
```

**注意：DeepSeek 中该 API 是无状态的：服务端不存储响应与会话。多轮对话需要客户端在每次请求的 `input` 中回传完整对话历史。**

## 图片识别的几种方式

### File Url

```python
response = client.responses.create(
    model="deepseek-flash",
    input=[
        {
            "role": "user",
            "content": [
                {"type": "input_text", "text": "这张图片里有什么？"},
                {"type": "input_image", "image_url": "https://i0.hdslb.com/bfs/archive/a9e9ec5a889d5882cb2e9e8053b5d864ed5011e0.jpg", "detail": "low"},
            ],
        },
    ],
)
print(response.output_text)
```

#### 精细度控制

对于 `image_url` 输入，可以选填 `detail` 字段来控制图片的处理方式：

| 取值       | 行为                                                         |
| :--------- | :----------------------------------------------------------- |
| `low`      | 推理前将图片缩放到 512×512。当不需要精细视觉细节时更快、更省 token。 |
| `high`     | 保留原图。（为兼容性提供，等价于 `original`。）              |
| `original` | 保留原图。                                                   |
| `auto`     | 自动选择。当前等价于 `original`。                            |

其实就两个，一个`low`压缩之后的，一个原图`original`。

### Base64

```python
input=[
    {"role": "user", "content": "读取工具返回的截图。"},
    {"type": "function_call", "call_id": "fc1", "name": "take_screenshot", "arguments": "{}"},
    {"type": "function_call_output", "call_id": "fc1",
    "output": [{"type": "input_image", "image_url": "data:image/png;base64,<BASE64_DATA>"}]},
]
```

### Files API

上传图片，之后通过 `file_id` 引用。通过 Files API `file_id` 引用的图片最大可达 64 MiB，且不受 32 MiB 单图检查限制。

```python
"""Files API 示例：上传图片 → 用 file_id 在对话里引用 → 删除。

Files API 解决什么问题：
    直接在请求里塞 base64 图片有三个痛点——① 请求体暴涨（上限 48 MiB）
    ② 同一张图多次提问要重复传 ③ 单张图还卡 32 MiB 上限。
    Files API 的做法是「上传一次，到处引用」：
        上传 → 拿到 file_id（形如 file-api-...）→ 后续请求只传这个 id

规格要点（DeepSeek 官方）：
    · 只支持图片：JPEG / PNG / GIF / WebP（按文件内容判断，不看扩展名）
    · 单文件最大 64 MiB，上传需 10 分钟内完成
    · purpose 必须是 "user_data"（不是 OpenAI 的 assistants/vision）
    · 可选 expires_after[anchor]=created_at + expires_after[seconds]（3600~2592000）
      两个都不传 = 永久保存
    · 每个用户最多存 25 GiB

生命周期：create → list → retrieve → (responses 引用) → delete

用法（文件在 src/ 目录下，须在项目根目录执行）：
    uv run python src/test_files_api.py
"""

import os
import struct
import sys
import tempfile
import zlib

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

MODEL = "deepseek-flash"


def build_client() -> OpenAI:
    api_key = os.getenv("DEEPSEEK_API_KEY")
    if not api_key or api_key == "sk-":
        sys.exit("未配置 DEEPSEEK_API_KEY：请编辑 .env 填入 DeepSeek API Key")
    return OpenAI(api_key=api_key, base_url="https://api.deepseek.com")


client = build_client()


# ---- 0. 造一张测试图（纯标准库生成 PNG，不依赖 Pillow） ----
def make_test_png(path: str, size: int = 128, rgb: tuple[int, int, int] = (220, 38, 38)) -> str:
    """生成一张纯色 PNG，用于测试上传与识别。

    为了让脚本零依赖，这里手写 PNG 编码：
    PNG = 签名 + IHDR(宽高/位深/颜色类型) + IDAT(zlib 压缩的像素) + IEND
    """
    def chunk(tag: bytes, data: bytes) -> bytes:
        payload = tag + data
        # 每个 chunk 结构：长度(4B) + 类型+数据 + CRC32(4B)
        return struct.pack(">I", len(data)) + payload + struct.pack(">I", zlib.crc32(payload) & 0xFFFFFFFF)

    # 每行开头要一个 filter byte（0 = 无过滤），后面是 size 个 RGB 像素
    row = b"\x00" + bytes(rgb) * size
    raw = row * size

    png = b"\x89PNG\r\n\x1a\n"
    # IHDR: 宽、高、位深8、颜色类型2(真彩RGB)、压缩0、滤波0、隔行0
    png += chunk(b"IHDR", struct.pack(">IIBBBBB", size, size, 8, 2, 0, 0, 0))
    png += chunk(b"IDAT", zlib.compress(raw))
    png += chunk(b"IEND", b"")

    with open(path, "wb") as f:
        f.write(png)
    return path


def test_upload(path: str) -> str:
    """① 上传：拿到 file_id。"""
    print("=" * 60)
    print("① 上传文件（POST /files）")
    print("=" * 60)

    with open(path, "rb") as f:
        # purpose 在 DeepSeek 里必须写 "user_data"
        uploaded = client.files.create(file=f, purpose="user_data")

    print(f"  id        = {uploaded.id}")            # 形如 file-api-xxx
    print(f"  filename  = {uploaded.filename}")
    print(f"  bytes     = {uploaded.bytes}")
    print(f"  purpose   = {uploaded.purpose}")
    print(f"  created_at= {uploaded.created_at}")
    print(f"  expires_at= {getattr(uploaded, 'expires_at', '（未设置过期，永久保存）')}")
    return uploaded.id


def test_list_and_retrieve(file_id: str) -> None:
    """② 列表 + ③ 查询单个文件信息。"""
    print("\n" + "=" * 60)
    print("② 列出文件（GET /files）")
    print("=" * 60)
    files = client.files.list()
    for f in files.data:
        print(f"  {f.id}  {f.filename}  {f.bytes}B")

    print("\n" + "=" * 60)
    print("③ 查询单个文件（GET /files/{id}）")
    print("=" * 60)
    info = client.files.retrieve(file_id)
    print(f"  {info.id} → {info.filename}, {info.bytes}B")


def test_responses_with_file(file_id: str) -> None:
    """④ 在对话里用 file_id 引用这张图（Responses API）。"""
    print("\n" + "=" * 60)
    print("④ 对话引用 file_id（Responses API）")
    print("=" * 60)

    try:
        response = client.responses.create(
            model=MODEL,
            # 用户输入：内容块数组，文本块和图片块平级
            input=[
                {
                    "role": "user",
                    "content": [
                        # 文本块：Responses API 里叫 input_text（Chat Completions 叫 text）
                        {"type": "input_text", "text": "这张图片是什么颜色？只回答颜色名称。"},
                        # ★ 图片块：type 必须是 input_image
                        #   写成 input_file 不报错但图进不去，模型会答"无法查看"
                        {"type": "input_image", "file_id": file_id},
                    ],
                }
            ],
        )
        # Responses API 取结果用 output_text（不是 choices[0].message.content）
        print("【模型回答】")
        print(response.output_text)
    except Exception as exc:  # noqa: BLE001
        # 常见失败：账号未开通视觉模型 / 模型名变动
        print(f"❌ 调用失败：{type(exc).__name__}: {exc}")
        print("   提示：若报 400 This model does not support image，")
        print("        把 MODEL 换成视觉模型 deepseek-v4-flash-vision-exp。")


def test_delete(file_id: str) -> None:
    """⑤ 删除文件，避免占着 25 GiB 配额。"""
    print("\n" + "=" * 60)
    print("⑤ 删除文件（DELETE /files/{id}）")
    print("=" * 60)
    result = client.files.delete(file_id)
    print(f"  {result.id} deleted={getattr(result, 'deleted', '?')}")


def main() -> None:
    # 临时目录里造图，跑完删掉，不污染项目
    tmp_dir = tempfile.mkdtemp(prefix="deepseek_files_")
    img_path = os.path.join(tmp_dir, "test_red.png")
    make_test_png(img_path)
    print(f"[准备] 已生成测试图：{img_path}（128x128 纯红色 PNG）\n")

    file_id = ""
    try:
        file_id = test_upload(img_path)
        test_list_and_retrieve(file_id)
        test_responses_with_file(file_id)
    finally:
        # 无论中间是否报错，都要把上传的文件删掉，免得占配额
        if file_id:
            test_delete(file_id)
        os.remove(img_path)
        os.rmdir(tmp_dir)


if __name__ == "__main__":
    main()

```

## 视频识别的几种方式

### Files API 上传（推荐）

DeepSeek 不支持视频所以用了火山引擎的 SDK，支持最大 512 MB 文件上传。

```python
import os
from pathlib import Path
# DeepSeek 不支持视频所以用了火山引擎的 SDK
from arkruntime import Ark

client = Ark(
    base_url="https://ark.cn-beijing.volces.com/api/v3",
    api_key=os.environ.get("ARK_API_KEY"),
)

# 这里模拟一下上传的过程
file_path = Path(os.getenv("FILE_PATH", "/Users/doc/demo.mp4"))

uploaded_file = client.files.create(
    file=file_path,
    purpose="user_data",
    preprocess_configs={"video": {"model": "doubao-seed-2-1-pro-260915", "fps": 0.3}},
)

client.files.wait_for_processing(uploaded_file.id)

response = client.responses.create(
    model=os.getenv("MODEL_ID", "doubao-seed-2-1-pro-260915"),
    input=[
        {
            "role": "user",
            "content": [
                {"type": "input_video", "file_id": uploaded_file.id},
                {"type": "input_text", "text": "请你描述下视频中的人物的一系列动作，以JSON格式输出开始时间（start_time）、结束时间（end_time）、事件（event）、是否危险（danger），请使用HH:mm:ss表示时间戳。"},
            ],
        }
    ],
)
print(response)

```

### Base64

适用于文件体积较小的场景，视频文件小于 50 MB，请求体不能超过 64 MB。

```python
import os
from arkruntime import Ark
import base64
api_key = os.getenv('ARK_API_KEY')

client = Ark(
    base_url='https://ark.cn-beijing.volces.com/api/v3',
    api_key=api_key,
)

# 转成 base64
def encode_file(file_path):
  with open(file_path, "rb") as read_file:
    return base64.b64encode(read_file.read()).decode('utf-8')

# 模拟一下上传的过程
base64_file = encode_file("/Users/doc/demo.mp4")

response = client.responses.create(
    model="doubao-seed-2-1-pro-260915",
    input=[
        {
            "role": "user",
            "content": [
                {
                    "type": "input_video",
                    "video_url": f"data:video/mp4;base64,{base64_file}",
                    "fps":1
                }
            ],
        }
    ]
)

print(response)

```

### File Url

适用于文件已存在公网可访问 URL 的场景，视频文件大小不能超过 50 MB。

```python
import os
from arkruntime import Ark

api_key = os.getenv('ARK_API_KEY')

client = Ark(
    base_url='https://ark.cn-beijing.volces.com/api/v3',
    api_key=api_key,
)

response = client.responses.create(
    model="doubao-seed-2-1-pro-260915",
    input=[
        {
            "role": "user",
            "content": [
                {
                    "type": "input_video",
                    "video_url": "https://arkdocs.tos-cn-beijing.volces.com/videos/advanced-usage/ark_vlm_video_input.mp4",
                    "fps":1
                }
            ],
        }
    ]
)

print(response)

```

### 精细度

通过 **fps** 字段，控制从视频中抽取图像的频率，默认为1，即每秒从视频中抽取一帧图像，输入给模型进行视觉理解。 可通过 **fps** 字段，控制模型对于视频中图像变化的敏感度。**最高 5 帧，最低 0.2 帧。数字越小精度越低，数字越大精度越高**

```python
input=[
        {
            "role": "user",
            "content": [
                {
                    "type": "input_video",
                    "video_url": "https://arkdocs.tos-cn-beijing.volces.com/videos/advanced-usage/ark_vlm_video_input.mp4",
                    "fps":1
                }
            ],
        }
    ]
```



### 流式输出

```python
import asyncio
import os

from arkruntime import AsyncArk
from arkruntime.types.responses.response_completed_event import ResponseCompletedEvent
from arkruntime.types.responses.response_reasoning_summary_text_delta_event import (
    ResponseReasoningSummaryTextDeltaEvent,
)
from arkruntime.types.responses.response_output_item_added_event import (
    ResponseOutputItemAddedEvent,
)
from arkruntime.types.responses.response_text_delta_event import ResponseTextDeltaEvent
from arkruntime.types.responses.response_text_done_event import ResponseTextDoneEvent

client = AsyncArk(
    base_url="https://ark.cn-beijing.volces.com/api/v3",
    api_key=os.getenv("ARK_API_KEY"),  # 从环境变量读，别硬编码
)


async def main():
    # ============================================================
    # 第一步：上传视频文件
    # ============================================================

    # with 管理，保证关闭
    with open("/Users/doc/demo.mp4", "rb") as f:
        file = await client.files.create(
            file=f,
            purpose="user_data",  # 固定值，表示"用户数据"（不是 OpenAI 的 assistants/vision）
            preprocess_configs={
                "video": {
                    # 上传时就让服务端抽帧，不用你本地 ffmpeg
                    "fps": 0.3,  # 每秒抽 0.3 帧 ≈ 每 3.3 秒 1 帧，降 token 成本的关键
                    "model": "doubao-seed-2-1-pro-260915",  # 抽帧/预处理用的模型
                }
            },
        )
    print(f"文件 id: {file.id}")

    # ============================================================
    # 第二步：等文件处理完（上传 ≠ 可用的，抽帧是异步任务）
    # ============================================================
    # 内部轮询：每 3s 查一次状态，直到 active（成功）或 failed，默认 10 分钟超时
    await client.files.wait_for_processing(file.id)
    print(f"文件处理完成: {file.id}")

    # ============================================================
    # 第三步：发起流式推理请求
    # ============================================================
    stream = await client.responses.create(
        model="doubao-seed-2-1-pro-260915",
        input=[
            {
                "role": "user",
                "content": [
                    # 视频块：只传 file_id（先上传再引用），不用重复传大文件
                    {"type": "input_video", "file_id": file.id},
                    {"type": "input_text", "text": "请你描述下视频中的人物的一系列动作，以JSON格式输出开始时间（start_time）、结束时间（end_time）、事件（event）、是否危险（danger），请使用HH:mm:ss表示时间戳。",
                    },
                ],
            }
        ],
        # 开启上下文缓存：视频文件这种长前缀，命中缓存后重复提问成本大幅下降
        caching={"type": "enabled"},
        # 服务端存储这次响应（之后可以用 response id 检索/续上下文）
        store=True,
        stream=True,  # 流式：边生成边推事件
    )

    # ============================================================
    # 第四步：消费事件流
    # ============================================================
    # async for 逐条读 SSE 事件；读到流尾自动关闭连接
    # （中途 break 才不会关——批量跑要小心连接泄漏）
    async for event in stream:
        # ---- 思维链 ----
        # 用来做"思考中..."的 UI
        if isinstance(event, ResponseReasoningSummaryTextDeltaEvent):
            print(event.delta, end="")

        # ---- 响应的类型 ----
        # 一个响应里会有多个 output item：reasoning / message / function_call...
        # event.item.type（这次输出是哪种类型）
        if isinstance(event, ResponseOutputItemAddedEvent):
            print(f"\n[outPutItem {event.item.type} start]")

        # ---- 正文文本增量（打字机效果的来源）----
        if isinstance(event, ResponseTextDeltaEvent):
            print(event.delta, end="")

        # ---- 单个输出项的正文写完 ----
        # 注意是"这一项的文本结束"，不是整个响应结束
        if isinstance(event, ResponseTextDoneEvent):
            print("\noutputTextDone.")

        # ---- 整个响应结束 ----
        if isinstance(event, ResponseCompletedEvent):
            print("Response Completed. Usage = " + event.response.usage.model_dump_json())

    # ============================================================
    # 收尾：删掉远端文件，别占存储配额
    # ============================================================
    await client.files.delete(file.id)


if __name__ == "__&#8203;main__":
    asyncio.run(main())

```

### 感知视频时

**视频时序感知 = 模型把视频当成「一串有先后顺序的帧」来理解，而不是一堆互不相干的图片。**视频理解可理解视频时间和图像关系信息，如回答事件发生什么时间点，在哪些时间发生了某事件等和时间相关的信息。

```python
import os
from arkruntime import Ark

client = Ark(
    base_url="https://ark.cn-beijing.volces.com/api/v3",
    api_key=os.getenv('ARK_API_KEY'),
)

completion = client.chat.completions.create(
    model = "doubao-seed-2-1-pro-260915",
    messages=[
        {
            # 消息角色为用户
            "role": "user",
            "content": [
                {
                    "type": "video_url",
                    "video_url": {
                        # 替换链接为实际视频链接
                        "url":  "https://arkdocs.tos-cn-beijing.volces.com/videos/advanced-usage/video-understanding.mp4",
                        "fps": 5, # 每秒截取5帧画面，用于视频理解
                    }
                },
                # 文本类型的消息内容，询问视频里有什么
                {"type": "text", "text": "裁判什么时间点出现的？"},
            ],
        }
    ],
)

print(completion.choices[0])

```

```shell
根据视频描述，裁判在**3.7秒**左右出现。此时，画面中两位拳击手（左为黑T恤红短裤、右为白T恤黑短裤）原本处于对峙状态，随后裁判（穿着黑色西装、戴白手套）站到两人中间，似乎在准备开始比赛或暂停当前回合，观众仍在背景中欢呼。
```

### 视频理解原理

视频处理的核心方式为 “帧与时间戳的结构化拼接”，具体规则如下：

- 对视频抽帧得到的每帧图像，在其前插入时间戳文本。
  - `doubao-seed-2.0` 及后续模型：时间戳格式为 `<时间戳> second`。例如：`4.0 second`、`4.5 second`。
  - `doubao-seed-2.0` 之前模型：时间戳格式为 `[<时间戳> second]`。例如：`[4.0 second]`、`[4.5 second]`。
- 拼接后形成“时间戳+图像”的有序序列，模型通过该序列理解视频的时序逻辑和内容变化。

#### 具体步骤

1. **抽帧采样** —— 按照固定间隔抽帧，每秒多少张，或者几秒钟抽一张。

2. **逐帧视觉编码** —— 图片被切成小块（patch），每块转成一个向量。这一步也是逐帧独立的，模型此刻还不知道帧与帧的关系，**每帧此时就是一张孤立的图片**。

3. **时序聚合**  —— 前面每帧还是孤立的，这一步做两件事：

   - **注入时间戳**（帧序号/秒数作为位置编码），让模型知道谁先谁后
   - **跨帧注意力**，让帧与帧互相 attend、比对内容，推出「同一个人」「物体出现/消失」「动作先后」

   前者给坐标系，后者算关系。

4. **语言模型生成** —— 合并后的视觉 Token 和文本 prompt 一起给到 LLM，然后按照普通的方式回答。

## Response API 的缓存

OpenAI 的 Responses API 支持 Prompt Caching（提示词缓存），主要用于降低重复输入的 Token 成本，并减少模型处理输入的延迟。

核心思路是：把多次请求中相同的前缀缓存起来，后续请求复用缓存，而不是重新计算整段输入。默认是开启的。但是也可以手动设置：

```python
response = client.responses.create(
    model="你的模型名称",
    input=[
        {
            "role": "developer",
            "content": [
                {
                    "type": "input_text",
                    "text": "这里放长期不变的系统规则和业务知识。",
                    "prompt_cache_breakpoint": {
                        "mode": "explicit"
                    }
                }
            ]
        },
        {
            "role": "user",
            "content": "这里放每次变化的用户问题。"
        }
    ],
  	# 手动配置缓存
    prompt_cache_options={
        "mode": "explicit"
    }
)
```



**注意：DeepSeek 是上下文硬盘缓存，用户无需修改代码。下面就用豆包举例**

隐式缓存：缓存是默认开启。

显示缓存：需要**主动开启**的缓存模式。前提条件：使用前，请先在 [开通管理页](https://ark.volcengine.com/region:cn-beijing/openManagement?LLM={}&OpenTokenDrawer=false) 开通模型的「推理（缓存）定价」能力。

### 前缀缓存

创建前缀缓存场景限制：Input Tokens 需要大于等于 256 Tokens，否则会报错；`stream` 参数不能设置为 true。

```python
# coding=utf-8
import os
from arkruntime import Ark

client = Ark(
    base_url='https://ark.cn-beijing.volces.com/api/v3',
    api_key=os.getenv('ARK_API_KEY'),
)

response = client.responses.create(
    model="doubao-seed-2-1-pro-260915",
    input=[
            {
             "role": "system",
             "content": "你是一名文学分析助手，回答需简洁明了，请根据下面内容分析《麦琪的礼物》相关问题。<麦琪的礼物小说内容>"
            }
          ],
  	# 开始缓存，开启前置缓存（会把整本书缓存下来）
    caching={"type": "enabled", "prefix": True},
    thinking={"type": "disabled"},
)
print(response)

second_response = client.responses.create(
    model="doubao-seed-2-1-pro-260915",
    previous_response_id=response.id,
    input=[{"role": "user", "content": "以 Della 的视角写一篇日记，描述其卖掉长发前的心情。"}],
    thinking={"type": "disabled"},
)
print(second_response)

third_response = client.responses.create(
    model="doubao-seed-2-1-pro-260915",
    previous_response_id=response.id,
    input=[{"role": "user", "content": "分析 O. Henry 在该故事片段中反讽手法的运用，给出简明阐释。"}],
    thinking={"type": "disabled"},
)
print(third_response)

```

### Session 缓存

Responses API 支持自动储存历史上下文对话并保持缓存，通过调用 `previous_response_id` 在多轮对话等场景中使用缓存输入并降低推理成本。

```python
# encoding=utf-8
import os
from arkruntime import Ark

client = Ark(
    base_url='https://ark.cn-beijing.volces.com/api/v3',
    api_key=os.getenv('ARK_API_KEY'),
)
input_text = "你是一名文学分析助手，回答需简洁明了，请根据下面内容分析《麦琪的礼物》相关问题。<麦琪的礼物小说内容>"
response = client.responses.create(
    model="doubao-seed-2-1-pro-260915",
    input=[
        {
            "role": "system",
            "content": input_text
        },
        {
            "role": "user",
            "content":"用5个简短的要点总结核心情节。"
        }
    ],
    caching={"type": "enabled"},
    thinking={"type": "disabled"},
)
print(response)
print(response.usage.model_dump_json())

# 在后续请求中输入缓存信息
second_response = client.responses.create(
    model="doubao-seed-2-1-pro-260915",
    previous_response_id=response.id,
  	# 拿到上一轮缓存 id
    input=[{"role": "user", "content": "以 Della 的视角写一篇日记，描述其卖掉长发前的心情。"}],
    caching={"type": "enabled"},
    thinking={"type": "disabled"},
)

print(second_response)
print(second_response.usage.model_dump_json())

third_response = client.responses.create(
    model="doubao-seed-2-1-pro-260915",
  	# 拿到上一轮缓存 id
    previous_response_id=second_response.id,
    input=[{"role": "user", "content": "根据原文节选和 Della 刚写的日记，想象 Jame 读到这篇日记时会有怎样的感受。"}],
    caching={"type": "enabled"},
    thinking={"type": "disabled"},
)
print(third_response)
print(third_response.usage.model_dump_json())

```

## 联网搜索

联网搜索可以为大模型获取实时的公开网络信息，适用于新闻、商品、天气、行业动态和事实核验等场景。

```python
import requests

response = requests.post(
    "https://api.deepseek.com/v1/tools/search",
    headers={
        "Authorization": "Bearer <DeepSeek API Key>",
    },
    json={
      	# 搜索词
        "query": "DeepSeek V4 模型 发布",
      	# 返回条数
        "count": 5,
      	# 是否在 content 中返回网页正文
        "need_content": True,
    },
)

response.raise_for_status()

for result in response.json()["results"]:
    print(result["title"], result["url"])
    print(result["summary"])
```

## 图像处理

DeepSeek 没有图像处理，但是豆包有。支持通过 Responses API 调用对输入图片执行画点、画线、旋转、缩放、框选或裁剪关键区域等基础操作，适用于需要模型通过视觉处理提升图片理解的场景（例如图文内容分析、物体定位标注、多轮视觉推理等）

### 缩放

```python
import os

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()
api_key = os.getenv("API_KEY")

# 初始化客户端，配置API地址与工具启用头
client = OpenAI(
    base_url='https://ark.cn-beijing.volces.com/api/v3',
    api_key=api_key,
    default_headers={"ark-beta-image-process": "true"}
)

# 发起图像处理请求
response = client.responses.create(
    model="doubao-seed-2-0-lite-260215",
    tools=[
        {
            "type": "image_process",
            "point": {
                "type": "disabled" # 画点（Point）工具
            },
            "grounding": {
                "type": "disabled" # 框选（Grounding）工具
            },
            "zoom": {
                "type": "enabled" # 启用缩放（zoom）工具
            },
            "rotate": {
                "type": "disabled" # 旋转（Rotate）工具
            }
        }
    ],
    input=[
        {
            "type": "message",
            "role": "user",
            "content": [
                {
                    "type": "input_image",
                    "image_url": "https://arkdocs.tos-cn-beijing.volces.com/images/advanced-usage/image_process_1.jpg"  # 输入图片 URL
                },
                {
                    "type": "input_text",
                    "text": "前方路牌写了什么？"
                }
            ]
        }
    ],
    stream=True  # 启用流式响应，实时获取处理结果
)

# 打印流式响应结果
for chunk in response:
    if hasattr(chunk, 'delta'):
        print(chunk.delta, end="", flush=True)

```

