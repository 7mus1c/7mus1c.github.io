# LangGraph

## 什么是 LangGraph？

LangGraph 是 LangChain 团队推出的一个用于构建有状态（Stateful）、可循环（Cyclic）、可控制的 AI Agent 工作流的框架。

简单来说：

如果说 LangChain 帮助你快速调用大模型、连接工具、构建 AI 应用，那么 LangGraph 更关注的是：

如何让一个 AI Agent 像一个真正的程序一样，有状态、有流程、有记忆、能循环执行任务，并且在关键节点接受人工干预。

使用图（Graph）的方式，把 AI Agent 的执行过程组织起来。



假设你想开发一个 AI 客服 Agent，用户问：

> 帮我查询订单，如果订单已经发货，就告诉我物流信息；如果还没发货，就联系仓库处理。

一个简单的 AI 程序可能是：

```
用户提问
   ↓
调用 LLM
   ↓
返回答案
```

但实际业务远远没有这么简单。

它需要：

1. 判断用户到底想查询什么。
2. 调用订单查询接口。
3. 判断订单是否发货。
4. 如果已发货，调用物流接口。
5. 如果未发货，调用仓库系统。
6. 如果接口调用失败，尝试重试。
7. 如果需要人工审批，暂停并等待人工确认。
8. 最后整合结果回复用户。

这实际上是一个有分支、有循环、有状态的复杂流程。

传统的线性 Chain 很难优雅地管理这些逻辑。

LangGraph 就是为了解决这类问题而设计的。

## LangGraph 的核心思想：把 Agent 变成一张图

LangGraph 最重要的设计理念是 Graph（图）。

它不是简单地把任务从上到下执行，而是把整个 AI 工作流程拆成节点（Node），再通过边（Edge）连接起来。

```mermaid
flowchart TD
    A[用户输入] --> B[意图识别 Node]
    B --> C[查询订单 Node]
    C --> D{判断订单状态}

    D -->|已发货| E[查询物流]
    D -->|未发货| F[联系仓库]

    E --> G[回复物流信息]
    F --> H[回复处理结果]

    G --> I[结束 END]
    H --> I
```





### 核心架构图

```mermaid
flowchart TB
    A["LangGraph Runtime 运行时"]

    A --> B["State 状态管理"]
    A --> C["Graph 图结构"]
    A --> D["Checkpointer 状态持久化"]
    A --> E["Interrupt 人工介入"]

    B --> F["Agent 执行"]
    C --> F
    D --> F
    E --> F

    F --> G["LLM"]
    F --> H["Tools"]
    F --> I["API"]
    F --> J["Database"]
```

## 三个核心概念

### 1. State（状态）

State 就是整个 Agent 执行过程中共享的数据。

```python
state = {
    "user_query": "我的订单发货了吗？",
    "order_id": "10001",
    "order_status": "shipped",
    "tracking_number": "SF123456",
    "answer": ""
}
```

每个节点都可以读取 State，也可以更新 State。

### 2. Node（节点）

Node 是一个执行单元，通常是一个 Python 函数。

```python
def query_order(state):
  	# 获取订单状态
    order = order_api(state["order_id"])
		
    # 返回订单状态
    return {
        "order_status": order["status"]
    }
```

一个 Node 可以执行：

- 调用大模型。
- 调用外部 API。
- 执行业务代码。
- 查询数据库。
- 处理数据。

### Edge（边）

Edge 决定节点之间如何流转。

主要有两种：

- 普通 Edge：A 执行完后，进入 B。
- Conditional Edge：根据当前 State 决定下一步进入哪个节点。

```python
def route_order(state):
    if state["order_status"] == "shipped":
        return "logistics"

    return "warehouse"
```

**这就实现了动态流程控制。**

## LangGraph 主要解决了哪几个问题？

| 传统 Agent 的问题          | LangGraph 的解决方案      |
| -------------------------- | ------------------------- |
| 流程只能简单串行执行       | 支持分支、循环、跳转      |
| 多步骤之间数据容易丢失     | State 统一管理状态        |
| Agent 执行中断后难以恢复   | Checkpoint 持久化状态     |
| 模型容易自主发挥，难以控制 | 可以混合确定性代码与 LLM  |
| 重要操作缺少人工审核       | Human-in-the-loop         |
| 长时间运行的任务难以管理   | 支持持久化和恢复执行      |
| 执行过程不透明             | 可配合 LangSmith 追踪调试 |

### 持久化与断点恢复（Persistence）

假设你开发一个 AI 自动化系统，需要执行：

```mermaid
flowchart TD
A[分析需求] --> B[搜索资料]
    B --> C[整理资料]
    C --> D[生成报告]
    D --> E[发送邮件]
```



如果执行到生成报告时服务器突然崩溃，怎么办？

普通程序可能需要重新执行整个任务。

LangGraph 可以**通过 Checkpointer 保存执行状态，在满足恢复条件时从之前保存的状态继续执行。**

### 人工介入（Human-in-the-loop）

假设 Agent 要给客户退款。

你肯定不希望 AI 自己决定金额，然后直接执行退款。

可以设计成：

```mermaid
flowchart TD
    A[AI 判断退款需求] --> B[查询退款金额]
    B --> C[生成退款申请]
    C --> D[暂停执行]
    D --> E[人工审核]
    E --> F{是否批准}
    
    F -->|是| G[退款]
    F -->|否| H[结束]

```

人工可以检查甚至修改 Agent 的 State，然后继续执行。

### 循环执行（Cycles）

这是 LangGraph 很重要的特点。

例如 AI 生成代码：

```mermaid
flowchart TD
    A[生成代码] --> B[执行测试]
    B --> C{"测试通过？"}
    C -->|是| D[结束]
    C -->|否| E[分析错误]
    E --> F[修改代码]
    F --> G[重新测试]
    G --> B

```

它可以反复执行，直到满足条件，或者达到最大迭代次数。

## LangChain 和 LangGraph 有什么区别？

这是初学者最容易混淆的地方。

| 对比     | LangChain                    | LangGraph              |
| -------- | ---------------------------- | ---------------------- |
| 定位     | LLM 应用开发框架             | Agent 编排框架与运行时 |
| 核心关注 | 模型、工具、检索、Agent 抽象 | 流程、状态、执行控制   |
| 流程     | 适合常见 Chain 和 Agent 模式 | 支持复杂图结构         |
| 状态管理 | 提供相关抽象                 | 核心设计能力           |
| 循环控制 | 可以实现                     | 原生图结构支持         |
| 断点恢复 | 不是核心定位                 | 核心能力               |
| 人工审批 | 需要组合实现                 | 提供专门机制           |

两者不是竞争关系，而是可以配合使用。

## 什么时候应该使用 LangGraph？

举几个常见的例子：

- 场景 1：智能客服

  需要识别问题、查询订单、调用工具、判断业务规则，必要时转人工。

- 场景 2：AI 深度研究 Agent

  搜索资料、分析资料、发现信息不足、继续搜索、整合报告。

- 场景 3：AI 编程 Agent

  编写代码、执行测试、分析错误、自动修复、重新测试。

## 安装

```shell
uv add langgraph

# 大部分时候还需要 langchain
uv add langchain
```

## StateGraph：创建图

通过使用 StateGraph 开始创建图。它的作用是：创建一个状态图，用来组织节点和节点之间的执行关系。它是一张流程图的容器。

```python
# 从标准库 typing 导入 TypedDict，用于声明图的强类型状态结构
from typing import TypedDict
# 从 langgraph.graph 导入构建状态图所需的类与虚拟起止点
from langgraph.graph import StateGraph, START, END


# 1. 定义状态（State）
# 使用 TypedDict 描述图在运行过程中维护的数据结构
# 这里只有一个字段 message，表示在节点之间传递的一条文本消息
class MyState(TypedDict):
    message: str


# 2. 创建状态图（Builder）
# StateGraph 接收状态类型 MyState，负责登记节点与边，编译前只是"草稿"
builder = StateGraph(MyState)


# 3. 定义节点（Node）
# 节点是一个函数，接收当前 state，返回需要更新的字段
# 返回 {"message": ...} 会覆盖（替换）state 中的 message
def hello_node(state: MyState):
    # 忽略输入，直接返回一条固定的问候消息
    return {
        "message": "Hello LangGraph!"
    }


# 4. 添加执行节点
# 第一个参数是节点名（"hello"），第二个参数是对应的处理函数
builder.add_node("hello", hello_node)


# 5. 添加边（Edge），定义节点的执行顺序
# 从虚拟起点 START 流向 hello 节点（图的入口）
builder.add_edge(START, "hello")
# 从 hello 节点流向虚拟终点 END（图的出口）
builder.add_edge("hello", END)


# 6. 编译图
# 把草稿（节点+边）固化成可执行的 Runnable 对象，之后才能 invoke
graph = builder.compile()


# 7. 执行图
# 传入初始 state（message="你好"），沿 START → hello → END 运行
result = graph.invoke({
    "message": "你好"
})
# 打印最终 state：{"message": "Hello LangGraph!"}
print(result)

```



注意一个容易混淆的地方：

- `builder`：负责构建图。
- `graph`：编译后得到的可执行图。

## State：状态

它负责保存整个 Graph 执行过程中需要共享的数据。

例如，一个 AI Agent 需要保存：

- 用户的问题
- AI 的回答
- 工具调用结果
- 当前执行次数
- 是否需要调用工具

这些数据都可以放在 State 中。

### 定义 state

```python
from typing import TypedDict


class AgentState(TypedDict):
  	#	用户的问题
    question: str
		# AI 的回答
    answer: str
		# 执行次数
    count: int
```

### state 如何传递

```python
# 从标准库导入 TypedDict，用于声明图的强类型状态结构
from typing import TypedDict
# 导入构建状态图所需的类与虚拟起止点
from langgraph.graph import StateGraph, START, END


# 1. 定义状态（State）
# AgentState 描述图运行期间维护的数据：
#   question —— 用户提出的问题（输入）
#   answer   —— 生成的回答（由节点填充）
class AgentState(TypedDict):
    question: str
    answer: str


# 2. 定义节点 A：处理问题并生成回答
def node_a(state: AgentState):
    # 读取输入中的问题并打印
    print("问题：", state["question"])
    # 返回要更新的字段：写入 answer（这里用固定文本模拟"AI 生成"）
    return {
        "answer": "这是 AI 生成的回答"
    }


# 3. 定义节点 B：消费/展示上一节点产生的回答
def node_b(state: AgentState):
    # 读取已被 node_a 更新过的 answer 并打印
    print("回答：", state["answer"])
    # 返回空字典表示本节点不修改任何状态字段
    return {}


# 4. 创建状态图（Builder），状态类型使用 AgentState
builder = StateGraph(AgentState)

# 5. 注册两个节点（指定节点名与对应函数）
builder.add_node("node_a", node_a)
builder.add_node("node_b", node_b)

# 6. 添加边，定义执行顺序：START → node_a → node_b → END
builder.add_edge(START, "node_a")
builder.add_edge("node_a", "node_b")
builder.add_edge("node_b", END)

# 7. 编译图，固化成可执行的 Runnable 对象
graph = builder.compile()

# 8. 执行图：传入初始 state（question 有值，answer 先留空）
result = graph.invoke({
    "question": "什么是 LangGraph？",
    "answer": ""
})

# 打印最终返回的状态
print(result)
# 问题： 什么是 LangGraph？
# 回答： 这是 AI 生成的回答
# {'question': '什么是 LangGraph？', 'answer': '这是 AI 生成的回答'}
```

### 如何"追加"数据

上面的例子只能获取到每次更新之后的数据，但是想要之前的数据就只能用累加了

```python
# Annotated 用于在类型注解上附加"元数据"，LangGraph 借此识别 reducer
from typing import Annotated
# operator.add 是一个二元操作函数：operator.add(a, b) == a + b
# LangGraph 把它用作"归约函数（reducer）"，决定状态字段如何合并
import operator
# TypedDict 用于声明图的强类型状态结构
# （从 typing_extensions 导入，兼容低版本 Python；3.10+ 也可直接 from typing import TypedDict）
from typing_extensions import TypedDict


# 定义状态：只有一个字段 messages
class AgentState(TypedDict):
    # Annotated[list, operator.add] 的含义：
    #   - 类型仍是 list
    #   - 附加的 reducer = operator.add（即列表拼接）
    # 效果：当某个节点返回 {"messages": [新消息]} 时，
    #       LangGraph 不会"覆盖"原 messages，而是把新列表内容"追加"到原有列表末尾
    # 这正是实现多轮对话历史累积的标准写法
    messages: Annotated[list, operator.add]

```

## Node: 执行节点

它是 Graph 中真正执行任务的地方。**一个 Node 就是一个执行函数。**

例如：

- 接收用户问题
- 调用大模型
- 查询数据库
- 调用搜索工具
- 执行 Python 代码
- 分析工具返回结果

```python
def llm_node(state):
  	print("开始调用LLM")
    response = llm.invoke(state["question"])
    print("调用结束")

    return {
        "answer": response.content
    }
```

**Node 通常接收 State，并返回一个字典，表示对 State 的更新。如果返回空的字典，表示不更新**

### 多节点组合

```python
# 导入 TypedDict 用于声明强类型状态；导入 StateGraph 与虚拟起止点
from typing import TypedDict
from langgraph.graph import StateGraph, START, END


# 1. 定义状态（State）
# 三个字段分别表示流程中的三件事：
#   question —— 用户原始问题（输入）
#   analysis —— 分析过程/结论（中间产物，会被多个节点读写）
#   answer   —— 最终回答（输出）
class AgentState(TypedDict):
    question: str
    analysis: str
    answer: str


# 2. 节点一：接收问题，写入初步分析
def question_node(state):
    # 读取输入问题，生成"分析开始"文本，写入 analysis 字段
    return {
        "analysis": f"正在分析：{state['question']}"
    }


# 3. 节点二：在已有分析基础上追加结论
def analysis_node(state):
    # 读取上一节点写好的 analysis，拼接"分析完成"后回写
    # （注意：analysis 是普通 str，这里靠"先读后写"完成累积）
    return {
        "analysis": state["analysis"] + "，分析完成"
    }


# 4. 节点三：生成最终回答
def answer_node(state):
    # 本节点只写 answer，不关心 analysis 的具体内容
    return {
        "answer": "这是最终回答"
    }


# 5. 创建状态图（Builder）
builder = StateGraph(AgentState)

# 6. 注册三个节点（节点名与函数一一对应）
builder.add_node("question", question_node)
builder.add_node("analysis", analysis_node)
builder.add_node("answer", answer_node)

# 7. 添加边，定义线性执行顺序：
# START → question → analysis → answer → END
builder.add_edge(START, "question")
builder.add_edge("question", "analysis")
builder.add_edge("analysis", "answer")
builder.add_edge("answer", END)

# 8. 编译图，固化成可执行的 Runnable 对象
graph = builder.compile()


result = graph.invoke({
    "question": "什么是 LangGraph？",
    "analysis": "",
    "answer": ""
})
print(result)
# 输出：
# {'question': '什么是 LangGraph？',
#  'analysis': '正在分析：什么是 LangGraph？，分析完成',
#  'answer': '这是最终回答'}
```

## Edge：执行流程

它的作用是连接不同的 Node，决定执行完当前节点后，接下来执行哪个节点。

```python
builder.add_edge(START, "node_a")
builder.add_edge("node_a", "node_b")
builder.add_edge("node_b", "node_c")
builder.add_edge("node_c", END)
```

## Conditional Edge：条件分支

Conditional Edge 就是条件边。**根据当前 State 或其他判断结果，动态决定下一个执行节点。**

假设 Agent 判断用户的问题：

- 如果需要搜索，就调用搜索节点。
- 如果不需要搜索，就直接回答。

```python
# 导入 TypedDict 声明状态；导入 StateGraph 与虚拟起止点
from typing import TypedDict
from langgraph.graph import StateGraph, START, END


# 1. 定义状态（State）
#   question  —— 用户问题（输入）
#   need_tool —— 是否需要调用工具的标记（由 agent 节点判断）
#   answer    —— 最终回答（输出）
class AgentState(TypedDict):
    question: str
    need_tool: bool
    answer: str


# 2. 节点：agent，模拟"AI 决策"
# 这里写死返回 need_tool=True，真实场景会由 LLM 判断是否需要检索/工具
def agent_node(state):
    # 模拟 AI 判断是否需要借助外部工具
    return {
        "need_tool": True
    }


# 3. 路由函数（router）：根据状态决定下一步走哪条分支
# 注意：它不属于"节点"，不会出现在 add_node 里，
#       只作为 add_conditional_edges 的"路由依据"被调用
def route_node(state):
    # 返回值是字符串，必须出现在下面 path_map 的 key 中
    if state["need_tool"]:
        return "search"   # 需要工具 → 走搜索分支
    return "answer"       # 不需要 → 直接生成回答


# 4. 分支节点一：search，模拟调用搜索工具得到答案
def search_node(state):
    return {
        "answer": "这是搜索得到的结果"
    }


# 5. 分支节点二：answer，模拟直接生成回答
def answer_node(state):
    return {
        "answer": "这是直接生成的回答"
    }


# 6. 创建状态图（Builder）
builder = StateGraph(AgentState)

# 7. 注册节点（router 不需要注册为节点）
builder.add_node("agent", agent_node)
builder.add_node("search", search_node)
builder.add_node("answer", answer_node)

# 8. 画主流程的入边：START → agent
builder.add_edge(START, "agent")

# 9. 添加"条件边"：从 agent 节点出发，按 route_node 的返回值分流
builder.add_conditional_edges(
    "agent",          # 源节点
    route_node,       # 路由函数：返回 "search" 或 "answer"
    {                 # 路径映射：返回值 → 目标节点名
        "search": "search",
        "answer": "answer"
    }
)

# 10. 两个分支都汇向 END（终点）
builder.add_edge("search", END)
builder.add_edge("answer", END)

# 11. 编译图，固化成可执行的 Runnable 对象
graph = builder.compile()


result = graph.invoke({
    "question": "今天天气怎么样？",
    "need_tool": False,
    "answer": ""
})
print(result)
# 输出：
# 因 agent_node 固定返回 need_tool=True，会走 search 分支：
# {'question': '今天天气怎么样？', 'need_tool': True, 'answer': '这是搜索得到的结果'}
```



## Cycles：循环/重试

LangGraph 与普通线性工作流最大的区别之一，就是它支持循环执行。

在 AI Agent 中，很多任务不能一次完成。

例如：

- AI 生成的代码运行失败，需要重新修改。
- 搜索结果不准确，需要重新搜索。
- AI 回答不符合要求，需要重新生成。
- 工具调用失败，需要再次尝试。

这些场景都需要循环。

```python
# 导入 TypedDict 声明状态；导入 StateGraph 与虚拟起止点
from typing import TypedDict
from langgraph.graph import StateGraph, START, END


# 1. 定义状态（State）
#   count  —— 已生成次数（计数器）
#   result —— 最近一次生成的结果（中间产物）
#   passed —— 是否通过校验（门控标记）
class AgentState(TypedDict):
    count: int
    result: str
    passed: bool


# 2. 节点：generate，每次把计数 +1 并生成一条结果
def generate_node(state):
    count = state["count"] + 1        # 自增计数
    return {
        "count": count,
        "result": f"第 {count} 次生成结果"
    }


# 3. 节点：check，根据当前 count 判断是否满足通过条件
def check_node(state):
    # 模拟业务规则：累计生成达到 3 次才算"通过"
    passed = state["count"] >= 3
    return {
        "passed": passed
    }


# 4. 路由函数（router）：决定"继续重试"还是"结束"
def route_node(state):
    if state["passed"]:           # 已通过 → 结束
        return "end"
    if state["count"] >= 3:       # 兜底：计数也到 3 → 结束
        return "end"
    return "retry"                # 否则 → 回到生成节点重试


# 5. 创建状态图（Builder）
builder = StateGraph(AgentState)

# 6. 注册两个业务节点（router 不是节点，无需注册）
builder.add_node("generate", generate_node)
builder.add_node("check", check_node)

# 7. 主流程：START → generate → check
builder.add_edge(START, "generate")
builder.add_edge("generate", "check")

# 8. 条件边：从 check 出发，按 route_node 返回值分流
builder.add_conditional_edges(
    "check",                      # 源节点
    route_node,                   # 路由函数：返回 "retry" 或 "end"
    {                             # 路径映射
        "retry": "generate",      # 返回 retry → 跳回 generate（形成循环）
        "end": END                # 返回 end   → 直接结束
    }
)

# 9. 编译图，固化成可执行的 Runnable 对象
graph = builder.compile()

# 10. 执行：初始计数 0，循环直到 count 达到 3
result = graph.invoke({
    "count": 0,
    "result": "",
    "passed": False
})

print(result)
# 输出：
# {'count': 3, 'result': '第 3 次生成结果', 'passed': True}
```

**Cycles = Node + Edge + 返回之前节点的流程连接。**

**循环通常需要配合条件判断和最大重试次数，避免无限循环。**

## Checkpointer：持久化

Checkpointer 是 LangGraph 的状态保存机制。

它可以在 Graph 执行过程中保存状态快照。

**就像游戏存档一样，可以保存 Agent 当前的执行进度，之后再恢复。**



假设用户正在使用一个 AI Agent：

1. 用户提出一个复杂问题。
2. Agent 已经执行了几个步骤。
3. Agent 需要等待人工审批。
4. 用户关闭页面。
5. 第二天重新打开。
6. 希望继续之前的任务。

如果没有状态保存机制，就可能需要从头执行。



```python
# Checkpointer 负责在图执行过程中"持久化状态"，让图具备记忆 / 可恢复能力
from langgraph.checkpoint.memory import InMemorySaver

# 1. 创建一个内存检查点对象（数据存在进程内存里，重启即丢失）
#    生产环境可换成 SqliteSaver / PostgresSaver 等做持久化存储
checkpointer = InMemorySaver()

# 2. 编译图时把 checkpointer 挂上去
#    挂上之后，图就变成"有状态（stateful）"的：每次执行的中间状态会被记录下来
graph = builder.compile(
    checkpointer=checkpointer
)

# 3. 配置对象：用 thread_id 标识"哪一次会话 / 哪一条对话线程"
#    不同的 thread_id 拥有相互独立的持久化状态，互不干扰
config = {
    "configurable": {
        "thread_id": "user_001"
    }
}

# 4. 调用图时传入 config
#    - 同一 thread_id 的多次 invoke 会"接着上次的状态继续"（对话记忆）
#    - 也支持中途崩溃后从检查点恢复、以及 human-in-the-loop 中断/续跑
#    这里只传了 question，answer 等字段依赖检查点维护（首次调用需状态定义兼容）
result = graph.invoke(
    {
        "question": "什么是 LangGraph？"
    },
    config=config
)

```

需要注意：

- `InMemorySaver` 只适合开发和测试。
- 程序重启后，内存中的数据不会保留。
- 生产环境应该使用持久化存储，例如 SQLite 或 PostgreSQL 对应的 Checkpointer。

## Interrupt：人工审批

Interrupt 就是中断。它可以让 Agent 在执行到某个位置时暂停，等待外部输入或人工审批。

AI Agent 不应该在所有情况下都自动执行。

尤其是涉及以下操作：

- 转账
- 删除数据
- 发送重要邮件
- 修改数据库
- 发布内容
- 执行高风险操作

应该先提出操作计划，再由人决定是否允许执行。



```python
# 导入 TypedDict 声明状态；导入 StateGraph 与虚拟起止点
from typing import TypedDict
from langgraph.graph import StateGraph, START, END
# interrupt 用于在节点中"主动暂停并等待外部输入"（人工介入 / 审批）
# Command 用于"从暂停点恢复执行"，resume 的值会回传给 interrupt
from langgraph.types import interrupt, Command
# 检查点：interrupt 必须配合 checkpointer 才能恢复（暂停点要先落盘）
from langgraph.checkpoint.memory import InMemorySaver


# 1. 定义状态（State）
#   action   —— 待执行的操作（输入）
#   approved —— 人工审批结果（由 approval 节点在恢复后填充）
#   result   —— 最终执行结果（输出）
class AgentState(TypedDict):
    action: str
    approved: bool
    result: str


# 2. 节点：approval，发起人工审批并暂停
def approval_node(state):
    # interrupt 会立刻暂停图的执行，并把传入的字典"抛给"调用方
    # 当后续用 Command(resume=...) 恢复时，interrupt(...) 的返回值 = resume 的值
    approved = interrupt({
        "message": "是否允许执行该操作？",
        "action": state["action"]
    })
    # 恢复后才继续往下走：把人工给的 approved 写回状态
    return {
        "approved": approved
    }


# 3. 节点：execute，根据审批结果决定执行还是拒绝
def execute_node(state):
    if state["approved"]:
        return {
            "result": "操作执行成功"
        }
    return {
        "result": "操作已被拒绝"
    }


# 4. 创建状态图（Builder）并注册节点
builder = StateGraph(AgentState)
builder.add_node("approval", approval_node)
builder.add_node("execute", execute_node)

# 5. 主流程：START → approval → execute → END（线性，但 approval 内部会暂停）
builder.add_edge(START, "approval")
builder.add_edge("approval", "execute")
builder.add_edge("execute", END)

# 6. 编译图：interrupt 必须挂 checkpointer，否则暂停点无法保存、无法恢复
checkpointer = InMemorySaver()
graph = builder.compile(
    checkpointer=checkpointer
)

# 7. 用 thread_id 隔离这次审批会话
config = {
    "configurable": {
        "thread_id": "approval_001"
    }
}

# 8. 第一次执行：运行到 approval_node 里的 interrupt 时暂停
#    此时返回的 result 是暂停前的状态（含 pending 的 interrupt 信息）
result = graph.invoke(
    {
        "action": "删除数据库记录",
        "approved": False,
        "result": ""
    },
    config=config
)

print(result)
# 输出：
# {'action': '删除数据库记录', 'approved': False, 'result': ''}   # 第一次：停在审批前

# 9. 第二次执行：人工审批通过，用 Command(resume=True) 恢复
#    resume=True 会成为 approval_node 中 interrupt(...) 的返回值，
#    于是 approved 被赋值为 True，图从暂停处继续往下走到 execute_node
result = graph.invoke(
    Command(resume=True),
    config=config
)

print(result)
# 输出：
# {'action': '删除数据库记录', 'approved': True,  'result': '操作执行成功'}  # 第二次：恢复后执行

```

- **`interrupt` 是暂停器**：节点调用它时，图立刻停下并把 payload 交回调用方；节点"后面的代码"要等恢复才执行。
- **`Command(resume=X)` 是续命键**：`X` 会成为 `interrupt(...)` 的返回值。本例 `resume=True` → `approved = True`。要拒绝就传 `Command(resume=False)`。

## Subgraphs：多 Agent/模块化

Subgraphs 就是子图。

当一个 Agent 项目变得复杂时，我们不应该把所有 Node 都放在一个 Graph 中。

可以把不同功能拆分成独立的 Graph，再组合起来。

1. 搜索 Agent
2. 分析 Agent
3. mcp Agent

每个子图都可以独立管理自己的节点和执行流程。

假设我们需要构建一个多 Agent 系统：

| Agent          | 负责的任务 |
| -------------- | ---------- |
| Research Agent | 搜集资料   |
| Coding Agent   | 编写代码   |
| Review Agent   | 检查代码   |
| Report Agent   | 生成报告   |

如果全部写在一个 Graph 中，会变得非常复杂。

使用 Subgraphs 就可以把每个 Agent 独立封装起来。

### 创建子 agent

```python
# 导入 TypedDict 声明状态；导入 StateGraph 与虚拟起止点
from typing import TypedDict
from langgraph.graph import StateGraph, START, END


# 1. 定义"子图"自己的状态（SubState）
#    子图拥有独立的状态结构，和父图的状态可以不同
class SubState(TypedDict):
    message: str


# 2. 子图内的节点：在传入的消息后追加一句完成标记
def sub_node(state):
    return {
        "message": state["message"] + "，子图执行完成"
    }


# 3. 用 StateGraph 搭建子图（builder）
sub_builder = StateGraph(SubState)

# 4. 在子图里注册节点并连边：START → sub_node → END
sub_builder.add_node("sub_node", sub_node)
sub_builder.add_edge(START, "sub_node")
sub_builder.add_edge("sub_node", END)

# 5. 编译子图
#    ——关键：编译后的 graph 本身可以被当作"一个节点"挂到别的图里
sub_graph = sub_builder.compile()

```



### 子 agent 加入主 agent

```python
# 1. 定义"主图"的状态（MainState）
#    注意：它和上一段的 SubState 都有同名字段 message —— 这是父子状态能自动映射的关键
class MainState(TypedDict):
    message: str


# 2. 主图节点：写入一条初始消息
def main_node(state):
    return {
        "message": "主图开始执行"
    }


# 3. 创建主图的 builder
main_builder = StateGraph(MainState)

# 4. 注册主图自己的节点
main_builder.add_node("main", main_node)

# 5. 关键：把"已经编译好的子图 sub_graph"直接当作一个节点挂进主图
#    LangGraph 会把主图状态按字段名映射进子图的 SubState，
#    子图执行完再把结果按字段名映射回主图状态
main_builder.add_node("sub", sub_graph)

# 6. 主流程：START → main → sub → END（sub 在这里就是一个"黑盒节点"）
main_builder.add_edge(START, "main")
main_builder.add_edge("main", "sub")
main_builder.add_edge("sub", END)

# 7. 编译主图，得到可执行的完整图
main_graph = main_builder.compile()

result = main_graph.invoke({"message": ""})
print(result)
# 输出：
# {'message': '主图开始执行，子图执行完成'}

```

### 如果主图和子图的 State 不一样呢？

```python
# 主图
class MainState(TypedDict):
    question: str
    answer: str
      
# 子图
class SubState(TypedDict):
    search_query: str
    search_result: str
```

此时就需要进行状态转换。可以使用一个普通 Node 作为适配层：

```python
def call_subgraph(state):
    result = sub_graph.invoke({
        "search_query": state["question"]
    })

    return {
        "answer": result["search_result"]
    }
```

```python
main_builder.add_node(
    "search_subgraph",
    call_subgraph
)
```

让主图与子图中间加一层转换层。这样主图就可以调用拥有不同 State Schema 的子图。

**Subgraphs = 把一个复杂 Graph 拆分成多个独立的小 Graph，再组合起来。**

主要价值：

1. **模块化开发。**
2. **复用工作流。**
3. **降低代码复杂度。**
4. **构建多 Agent 系统。**
5. **方便独立测试和维护。**



## 整体流程

```mermaid
flowchart TD
    A([START]) --> B[用户问题节点]
    B --> C[AI 分析节点]
    C --> D{是否需要调用工具?}

    D -->|是| E[调用工具]
    D -->|否| G[生成最终回答]

    E --> F[获取工具执行结果]
    F --> C

    G --> H([END])

    style A fill:#d1fae5,stroke:#059669,color:#000
    style H fill:#d1fae5,stroke:#059669,color:#000
    style D fill:#fef3c7,stroke:#d97706,color:#000
```



# LangGraph 进阶能力

## Command: 控制指令

`Command` 是 LangGraph 提供的一种控制指令，可以将状态更新和流程跳转合并在一起。

```python
from langgraph.types import Command

return Command(
    update={"status": "success"},
    goto="next_node"
)
```

假设我们开发一个 AI 客服 Agent：

- 用户提出问题。
- 系统判断问题类型。
- 如果是退款问题，交给退款节点。
- 如果是物流问题，交给物流节点。
- 同时记录系统判断出的业务类型。

传统方式需要先更新 State，再通过 Conditional Edge 判断下一步。

而使用 Command，可以在一个节点中同时完成这两件事。

### Command 的核心参数

```
Command 的核心参数
- update
- goto
- graph
- resume
```

### 使用 Command 实现动态路由

```python
from typing import TypedDict
from langgraph.graph import StateGraph, START, END

# 状态 schema：整张图共享的"黑板"。
# question 是输入，category 是分类结果，result 是最终输出。
class State(TypedDict):
    question: str
    category: str
    result: str

from typing import Literal
from langgraph.types import Command

# classify_node：分类路由节点。
# 关键点：返回类型是 Command[Literal["refund_node", "logistics_node"]]
#   - Command 的泛型参数声明"这个 Command 可能 goto 的目标节点名"，仅用于类型检查
#   - 节点内部用 Command(goto=..., update=...) 同时完成两件事：
#       1) update：把 category 写回状态（状态是累积的，只传要改的字段）
#       2) goto：决定下一步跳到哪个节点
# 这种"在节点里直接路由"的写法，等价于 add_conditional_edges，但把判断+跳转内联在一起，更直观。
def classify_node(
    state: State
) -> Command[Literal["refund_node", "logistics_node"]]:
    question = state["question"]
    
    if "退款" in question:
        return Command(
            update={
                "category": "refund"
            },
            goto="refund_node"
        )
    else:
        return Command(
            update={
                "category": "logistics"
            },
            goto="logistics_node"
        )

# 退款分支：叶子节点，只更新 result（其余字段原样保留）
def refund_node(state: State):
    return {
        "result": "已经进入退款处理流程"
    }

# 物流分支：同理
def logistics_node(state: State):
    return {
        "result": "已经进入物流查询流程"
    }

# —— 建图 ——
builder = StateGraph(State)
builder.add_node("classify_node", classify_node)
builder.add_node("refund_node", refund_node)
builder.add_node("logistics_node", logistics_node)

# START 永远先到分类节点
builder.add_edge(START, "classify_node")
# 两个分支各自通向 END（不需要再画条件边，因为路由已在 classify_node 内部用 Command 完成）
builder.add_edge("refund_node", END)
builder.add_edge("logistics_node", END)

graph = builder.compile()

# 初始状态：question 必填；category/result 用空串占位，
# 因为 State 是普通 TypedDict（字段非 Optional），不传会在取值时报缺失，
# 给空串是最简单的兜底（更规范的写法是用 Optional 或 total=False）。
result = graph.invoke({
    "question": "我想申请退款",
    "category": "",
    "result": ""
})

print(result)

```

### Command 和 Conditional Edge 如何选择？

| 比较维度       | Conditional Edge | Command                |
| -------------- | ---------------- | ---------------------- |
| 动态路由       | 支持             | 支持                   |
| 更新 State     | 通常由节点负责   | 可以同时完成           |
| 决定下一节点   | 是               | 是                     |
| 从子图跳转父图 | 不直接负责       | 支持 `Command.PARENT`  |
| Interrupt 恢复 | 不负责           | 支持 `resume`          |
| 适合场景       | 单纯控制流程     | 状态更新与流程控制结合 |

**只需要决定下一步去哪：优先使用 Conditional Edge。**

**既要更新 State，又要决定下一步去哪：使用 Command。**

### Command.PARENT 和 Command(resume=...)

当你在 Subgraph 内部，希望跳转到父图中的某个节点时，可以使用：

```python
return Command(
    update={"status": "completed"},
    goto="parent_node",
    graph=Command.PARENT
)
```

当图因为 `interrupt()` 暂停后，可以使用：

```python
graph.invoke(
    Command(resume="approved"),
    config=config
)
```

## MessagesState 与 add_messages

普通 State 管理消息有什么问题？

```python
from typing import TypedDict
from langchain_core.messages import AnyMessage

class State(TypedDict):
    messages: list[AnyMessage]
      
def chatbot_node(state: State):
    return {
        "messages": [
            AIMessage(content="你好！")
        ]
    }
  

```

**如果没有为 messages 配置 Reducer，默认更新规则是覆盖，而不是追加。**之前用户发送的消息就不在 State 里了。所以，我们需要一个专门处理消息合并的 Reducer。

### 什么是 add_messages？

`add_messages` 是 LangGraph 提供的消息 Reducer。

它的主要作用是：

1. 将新消息追加到原有消息列表。
2. 根据消息 ID 更新已经存在的消息。
3. 支持删除消息指令。
4. 将常见的消息字典格式转换为 LangChain 消息对象。

```python
from typing import Annotated
from typing_extensions import TypedDict
from langgraph.graph.message import add_messages

class State(TypedDict):
    messages: Annotated[list, add_messages]
```

拆开理解：

| 部分           | 含义                   |
| -------------- | ---------------------- |
| `messages`     | State 中的字段         |
| `list`         | 消息列表               |
| `Annotated`    | 为类型附加额外元数据   |
| `add_messages` | 指定这个字段的 Reducer |

当节点返回新的 messages 时，不直接覆盖，而是交给 add_messages 进行合并。

### 什么是 MessagesState？

`MessagesState` 本身**只是一行类型声明**。

```python
from langgraph.graph import MessagesState
```

它就等价 

```python
class State(TypedDict):
    messages: Annotated[list, add_messages]
```

不需要再手动定义了。



```python
from langgraph.graph import MessagesState

class State(MessagesState):
    user_id: str
    category: str
    result: str

```

此时 State 同时具有：

```
{
    "messages": [],
    "user_id": "",
    "category": "",
    "result": ""
}
```

其中 `messages` 已经自动使用 `add_messages`。

### 使用 MessagesState 构建聊天流程

业务需求：

1. 用户输入一条消息。
2. Graph 接收用户消息。
3. Chatbot 节点读取历史消息。
4. Chatbot 生成回复。
5. 使用 MessagesState 自动保存回复。

```python
# MessagesState：LangGraph 内置状态基类，自带 messages 字段
# 该字段绑定了 add_messages reducer —— 节点返回的消息会「追加」到历史，而不是覆盖
from langgraph.graph import MessagesState

# StateGraph 用于构图；START / END 是图的虚拟入口与出口节点
from langgraph.graph import StateGraph, START, END

# HumanMessage 表示用户消息，AIMessage 表示机器人/模型回复
from langchain_core.messages import HumanMessage, AIMessage


# 自定义图状态：继承 MessagesState 后扩展业务字段
# 这样每个节点都能读写 user_id，它也会出现在 invoke 的返回结果里
class State(MessagesState):
    user_id: str


def chatbot_node(state: State):
    """聊天节点：取最后一条消息，原样回显。"""
    # state["messages"] 是当前完整对话历史，[-1] 取本轮最新输入
    last_message = state["messages"][-1]

    # 构造一条 AI 回复
    response = AIMessage(
        content=f"你刚才说的是：{last_message.content}"
    )

    # 只返回「新增」的消息即可，不必把整个历史再返回一遍
    # add_messages reducer 会自动把它追加到已有 messages 后面
    return {
        "messages": [response]
    }


# 1) 用自定义状态创建图构建器
builder = StateGraph(State)

# 2) 注册节点：节点名 "chatbot" → 处理函数 chatbot_node
builder.add_node("chatbot", chatbot_node)

# 3) 连边定义执行顺序：入口 → chatbot → 出口
builder.add_edge(START, "chatbot")
builder.add_edge("chatbot", END)

# 4) 编译成可调用的图对象（此步会校验图结构）
graph = builder.compile()


# 第一次调用：输入一条用户消息，外加业务字段 user_id
result = graph.invoke({
    "messages": [
        HumanMessage(content="你好")
    ],
    "user_id": "user-001"
})
# 返回的是完整状态：messages = [Human("你好"), AI("你刚才说的是：你好")]，以及 user_id
print(result)

# 第二次调用：把上一轮的完整 messages 拼上新消息，手动带上历史 → 实现多轮对话
# 注意：compile() 未配置 checkpointer，图本身不记忆，历史必须由调用方传入
result2 = graph.invoke({
    "messages": result["messages"] + [
        HumanMessage(content="介绍一下 LangGraph")
    ],
    "user_id": "user-001"
})

# 逐条打印消息类型与内容，观察累积的对话历史
for message in result2["messages"]:
    print(message.type, message.content)

```

### add_messages 和 operator.add 有什么区别？

| 比较                    | `operator.add` | `add_messages` |
| ----------------------- | -------------- | -------------- |
| 追加新消息              | 支持           | 支持           |
| 根据 ID 更新消息        | 不支持         | 支持           |
| 删除消息                | 不支持         | 支持           |
| 消息格式反序列化        | 不支持         | 支持           |
| 专门处理 LangChain 消息 | 否             | 是             |

- 普通列表追加：可以使用 `operator.add`。

- 对话消息管理：优先使用 `add_messages`。

### 删除消息

```python
from langchain_core.messages import RemoveMessage

def delete_old_messages(state: State):

    messages = state["messages"]

    return {
        "messages": [
            RemoveMessage(id=message.id)
            for message in messages[:2]
        ]
    }
```

删除消息列表中最早的两条消息。

全部删除

```python
from langgraph.graph.message import REMOVE_ALL_MESSAGES
from langchain_core.messages import RemoveMessage

def clear_messages(state: State):

    return {
        "messages": [
            RemoveMessage(id=REMOVE_ALL_MESSAGES)
        ]
    }
```

## Reducer：更新和合并

### State 是怎么更新的？

初始状态：

```python
from typing import TypedDict

class State(TypedDict):
    name: str
    count: int
    messages: list
```

```json
{
    "name": "张三",
    "count": 0,
    "messages": []
}
```

现在有一个节点返回：

```python
def node_a(state: State):
    return {
        "count": 1,
        "messages": ["你好"]
    }
```

节点执行后，LangGraph 需要把节点返回的更新合并到原来的 State 中。

这里有一个关键问题：

如果节点返回的新值与原来的值发生冲突，LangGraph 应该怎么处理？

例如：

- 原来的 `count` 是 `0`，节点返回 `1`。
- 原来的 `messages` 是 `[]`，节点返回 `["你好"]`。
- 如果另一个节点也返回了 `count` 或 `messages`，又应该怎么处理？

### 什么是 Reducer？

 State 字段在收到新更新时，**reducer 决定：拿到这个新值之后，这个 key 到底是「整块替换掉」还是「跟旧值合起来」。**。

> 新状态 = Reducer(旧状态, 节点更新)

不同字段可以配置不同的 Reducer。

例如：

- `count`：可以使用加法合并。
- `messages`：可以使用 `add_messages` 合并。
- `name`：可以使用默认覆盖规则。

### reducer 到底干了什么事

节点不返回完整 state，只返回增量：

```python
def node_a(state):
    return {"count": 1}      # 不是说 count=1，是说"给我加 1"
```

`{"count": 1}` 回来之后，框架要做一件事：把它合并进 `state["count"]`。怎么合并？取决于这个 key 有没有注册 reducer。

```python
# 直接替换，变成 1
count: int
# 合并操作 旧值 + 1
count: Annotated[int, operator.add]
```

所以 reducer 本质上就是**一个 key 的「写入策略」**。

```python
from typing import Annotated, TypedDict
from operator import add
from langgraph.graph.message import add_messages

class State(TypedDict):
    messages: Annotated[list, add_messages]  # 按 id 合并 + 支持删除
    count:    Annotated[int, add]            # 相加
    status:   str                            # 没写 = 覆盖
```

### 常见 Reducer：operator.add

#### 列表追加

```python
import operator
from typing import Annotated
from typing_extensions import TypedDict

class State(TypedDict):
    messages: Annotated[list[str], operator.add]
```

假设原有值是`["你好"]`更新后变成`["你好","欢迎使用 LangGraph"]`。

#### 整数累加

```python
class State(TypedDict):
    count: Annotated[int, operator.add]
```

假设原有值是 10 更新后变成 15。

所以，`operator.add` 的实际含义取决于数据类型：

| 数据类型 | `operator.add` 的效果 |
| -------- | --------------------- |
| `list`   | 列表拼接              |
| `int`    | 整数相加              |
| `str`    | 字符串拼接            |
| `float`  | 浮点数相加            |

### 自定义 Reducer

```python
from typing import Annotated
from typing_extensions import TypedDict

def merge_lists(old_value, new_value):
    return old_value + new_value

class State(TypedDict):
    results: Annotated[list[str], merge_lists]


old_value = ["任务 A"]
new_value = ["任务 B"]

result = merge_lists(old_value, new_value)

print(result)
```

**Reducer 本身就是一个接收旧值和新值，并返回合并结果的函数。**

### 并行节点状态合并

例如：

用户提出一个复杂问题，需要三个 Agent 同时分析：

- Agent A：分析业务需求。
- Agent B：分析技术方案。
- Agent C：分析成本。
- 汇总节点：整合三个 Agent 的结果。

#### 使用 Reducer 解决并行更新

```python
import operator
from typing import Annotated
from typing_extensions import TypedDict  # Python < 3.12 用扩展版；3.12+ 可从 typing 直接导入
from langgraph.graph import StateGraph, START, END


class State(TypedDict):
    # Annotated 第二个参数是 reducer：节点返回 {"results": [...]} 时不覆盖旧值，
    # 而是用 operator.add 把新列表拼接到已有列表后面。
    # 这也是多个并行节点能同时写同一个 key 的前提（无 reducer 会抛 InvalidUpdateError）。
    results: Annotated[list[str], operator.add]


def agent_a(state: State):
    # 节点只返回自己新增的那一条，合并逻辑由 reducer 统一处理
    return {"results": ["需求分析完成"]}


def agent_b(state: State):
    return {"results": ["技术方案分析完成"]}


def agent_c(state: State):
    return {"results": ["成本分析完成"]}


builder = StateGraph(State)  # 用 State 作为整张图的状态 schema

builder.add_node("agent_a", agent_a)  # 注册节点：节点名 -> 可调用对象
builder.add_node("agent_b", agent_b)
builder.add_node("agent_c", agent_c)
builder.add_node(
    "summary",
    lambda state: {},  # 目前是空实现：只作汇聚点，不修改状态；
                       # 需要真正汇总时在这里读 state["results"] 再返回结果
)

# fan-out：START 同时连到三个节点，它们会在同一个 superstep 内并行执行
builder.add_edge(START, "agent_a")
builder.add_edge(START, "agent_b")
builder.add_edge(START, "agent_c")

# fan-in：summary 是屏障，等 a/b/c 三个分支全部完成后才执行一次
builder.add_edge("agent_a", "summary")
builder.add_edge("agent_b", "summary")
builder.add_edge("agent_c", "summary")

builder.add_edge("summary", END)      # 汇聚后结束
graph = builder.compile()            # 编译成可执行 Runnable：校验图结构、预计算 superstep

result = graph.invoke({"results": []})  # 显式传空列表作为累加起点
print(result["results"])
# ['需求分析完成', '技术方案分析完成', '成本分析完成']

```

### Overwrite 绕过 Reducer

```python
results: Annotated[list, operator.add]
```

正常更新都会追加。

但如果某些时候，我们希望清空列表，或者直接替换整个值，该怎么办？

LangGraph 提供了 `Overwrite`，可以绕过字段的 Reducer，直接写入新值：

```python
from langgraph.types import Overwrite

def reset_node(state):
    return {
        "results": Overwrite(
            value=["全新的任务"]
        )
    }
```

## Runtime Context：运行时上下文

它本质上是一种依赖注入（Dependency Injection）机制。

> 在 Graph 启动时，把本次执行需要的依赖传进去，节点执行时再从 Runtime 中读取。

State 关注正在处理什么，Context 关注这次执行依赖什么。

LangGraph 支持使用 `TypedDict` 或 `dataclass` 定义 Context Schema。

### 定义上下文

#### dataclass 定义

```python
from dataclasses import dataclass

@dataclass
class Context:
    user_id: str
    role: str
```

#### TypedDict 定义

```python
from typing_extensions import TypedDict

class Context(TypedDict):
    user_id: str
    role: str
```

这两种方式都可以使用。

| 方式        | 特点                                    |
| ----------- | --------------------------------------- |
| `dataclass` | 使用属性访问，例如 `context.user_id`    |
| `TypedDict` | 使用字典访问，例如 `context["user_id"]` |

### 使用

```python
from typing_extensions import TypedDict
from dataclasses import dataclass
from langgraph.graph import StateGraph, START, END


class State(TypedDict):
    question: str
    result: str


@dataclass
class Context:
    user_id: str
    role: str


builder = StateGraph(
    State,
    context_schema=Context
)
```

### 在 Node 中读取

```python
from langgraph.runtime import Runtime

def my_node(
    state: State,
    runtime: Runtime[Context]
):
    user_id = runtime.context.user_id
    role = runtime.context.role

    print(user_id)
    print(role)

    return {}
  
  
result = graph.invoke(
    {
        "question": "查询我的订单",
        "result": ""
    },
    context=Context(
        user_id="user-001",
        role="employee"
    )
)
```

### 权限判断

系统有三种角色：

| 角色     | 权限               |
| -------- | ------------------ |
| employee | 只能查询自己的订单 |
| manager  | 可以查询部门订单   |
| admin    | 可以查询全部订单   |

用户提出查询请求后：

1. 从 State 中读取用户问题。
2. 从 Runtime Context 中读取用户 ID 和角色。
3. 根据角色判断查询范围。
4. 返回查询结果。

```python
from dataclasses import dataclass
from typing_extensions import TypedDict  # Python < 3.12；3.12+ 可直接用 typing.TypedDict
from langgraph.graph import StateGraph, START, END
from langgraph.runtime import Runtime  # Runtime 在这里，不在 langgraph.graph


class State(TypedDict):
    # 图内流转的状态：节点读取它，并以「局部更新」的形式写回
    question: str  # 用户原始问题
    result: str    # 权限判定后的查询结果描述


@dataclass(frozen=True)
class Context:
    # frozen=True 保证实例不可变，所有节点共享同一份，不会被某个节点意外改写。
    user_id: str
    role: str
    department_id: str


def order_node(state: State, runtime: Runtime[Context]):
    user_id = runtime.context.user_id
    role = runtime.context.role
    department_id = runtime.context.department_id

    # 按角色做数据范围判定（RBAC）：员工 → 个人；经理 → 部门；管理员 → 全量
    if role == "employee":
        result = f"只查询用户 {user_id} 自己的订单"
    elif role == "manager":
        result = f"查询部门 {department_id} 的订单"
    elif role == "admin":
        result = "查询全部订单"
    else:
        result = "无权访问订单数据"  # 兜底：未知 / 缺失角色一律拒绝，避免默认放行

    return {"result": result}  # 局部更新，question 原样保留


builder = StateGraph(
    State,
    context_schema=Context,  # 声明 runtime.context 的 schema，invoke 时按它构造 / 校验
)
builder.add_node("order_node", order_node)
builder.add_edge(START, "order_node")
builder.add_edge("order_node", END)
graph = builder.compile()


result = graph.invoke(
    {
        "question": "查询我的订单",
        "result": ""
    },
    context=Context(
        user_id="user-001",
        role="employee",
        department_id="dept-001"
    )
)

print(result["result"])

result2 = graph.invoke(
    {
        "question": "查询部门订单",
        "result": ""
    },
    context=Context(
        user_id="manager-001",
        role="manager",
        department_id="dept-001"
    )
)

print(result2["result"])

result3 = graph.invoke(
    {
        "question": "查询全部订单",
        "result": ""
    },
    context=Context(
        user_id="admin-001",
        role="admin",
        department_id="dept-001"
    )
)

print(result3["result"])
```

## Store：长期存储

这个篇幅在 LangChain 中其实已经说过了。Store 主要由四个概念组成：

1. Namespace：命名空间，负责数据分类和隔离。
2. Key：数据的唯一标识。
3. Value：实际保存的数据。
4. Store API：负责写入、读取、搜索和删除。

### API

| 方法                | 作用                        |
| ------------------- | --------------------------- |
| `put()`             | 保存或更新数据              |
| `get()`             | 根据 Key 获取数据           |
| `search()`          | 根据 Namespace 前缀搜索数据 |
| `delete()`          | 删除指定数据                |
| `list_namespaces()` | 查询符合条件的 Namespace    |

这些方法都有对应的异步版本，例如 `aput()`、`aget()`、`asearch()` 和 `adelete()`。

### Store 注册到 Graph

```python
graph = builder.compile(
    store=store
)
```

### 例子

```python
from typing import TypedDict
from dataclasses import dataclass

from langgraph.graph import StateGraph, START, END
from langgraph.runtime import Runtime
from langgraph.store.memory import InMemoryStore


# 1. 定义 State
class State(TypedDict):
    question: str
    result: str


# 2. 定义 Runtime Context
@dataclass
class Context:
    user_id: str


# 3. 创建 Store
store = InMemoryStore()


# 4. 定义 Node
def memory_node(
    state: State,
    runtime: Runtime[Context]
):
    # 从 Context 中获取当前用户 ID
    user_id = runtime.context.user_id

    # 构造当前用户的 Namespace
    namespace = ("users", user_id, "preferences")

    # 从 Store 中读取用户偏好
    item = runtime.store.get(
        namespace,
        "programming_language"
    )

    if item is not None:
        preference = item.value["language"]
    else:
        preference = "暂时没有记录"

    return {
        "result": f"用户偏好的编程语言：{preference}"
    }


# 5. 创建 Graph
builder = StateGraph(
    State,
    context_schema=Context
)

builder.add_node("memory_node", memory_node)

builder.add_edge(START, "memory_node")
builder.add_edge("memory_node", END)


# 6. 编译 Graph，并注入 Store
graph = builder.compile(store=store)


# 7. 调用 Graph
result = graph.invoke(
    {
        "question": "我适合学习什么编程语言？",
        "result": ""
    },
    context=Context(user_id="user_001")
)

print(result["result"])
```

### 跨 Thread 的长期记忆

假设：

- 用户 ID：`user_001`
- 第一次对话：`thread_001`
- 第二次对话：`thread_002`

用户第一次告诉 Agent：

> 我喜欢 Python。

Agent 把这个偏好保存到 Store。

第二天，用户开启新的对话，使用 `thread_002`。

Agent 依然可以通过相同的 Namespace 读取之前保存的偏好。

这里最重要的是：

Thread ID 发生了变化，但用户 ID 没有变化。

因此，两个 Thread 可以通过相同的用户 Namespace 访问同一份长期记忆。

```python
from typing import TypedDict  # Python 3.12+ 直接用 typing；低版本需 typing_extensions
from dataclasses import dataclass
from langgraph.graph import StateGraph, START, END
from langgraph.runtime import Runtime
from langgraph.store.memory import InMemoryStore          # 长期记忆：跨 thread，纯内存
from langgraph.checkpoint.memory import InMemorySaver    # 短期记忆：按 thread 存 state 快照，纯内存


class State(TypedDict):
    # 图内状态：随 checkpoint 按 thread_id 隔离，不同 thread 之间不共享
    action: str       # "save" / "read"
    preference: str   # save 时要写入的偏好值
    result: str       # 节点输出的结果描述


@dataclass(frozen=True)  # frozen=True，让一次 invoke 内的上下文只读
class Context:
    # 调用方注入的运行时上下文，不属于 state、不进 checkpoint
    user_id: str


def memory_node(state: State, runtime: Runtime[Context]):
    user_id = runtime.context.user_id

    # Store 的定位是 (namespace, key)：
    # namespace 像文件夹，把 user_id 编进去实现用户级隔离；key 像文件名。
    # namespace 与 thread_id 无关 → 同一用户在任意 thread 都指向同一份数据。
    namespace = ("users", user_id, "preferences")

    if state["action"] == "save":
        # 写入长期记忆。同 namespace + 同 key 再次 put 是覆写，不是追加。
        runtime.store.put(
            namespace,
            "programming_language",
            {"language": state["preference"]},  # value 必须是可 JSON 序列化的 dict
        )
        return {"result": "偏好保存成功"}

    # 读取长期记忆：get 返回 Item 对象，实际数据在 item.value 里；不存在时返回 None
    item = runtime.store.get(namespace, "programming_language")
    if item is None:
        return {"result": "没有找到用户偏好"}
    return {"result": f"用户喜欢：{item.value['language']}"}


builder = StateGraph(State, context_schema=Context)
builder.add_node("memory_node", memory_node)
builder.add_edge(START, "memory_node")
builder.add_edge("memory_node", END)

# 两套机制相互独立，互不干扰
store = InMemoryStore()          # 长期记忆：存应用数据（用户偏好、事实）
checkpointer = InMemorySaver()   # 短期记忆：按 thread 存 state 快照，支持续聊 / 中断恢复

graph = builder.compile(
    store=store,                # 不传这个，节点里 runtime.store 就是 None
    checkpointer=checkpointer,  # 传了才必须/才能用 config 里的 thread_id
)

# 第一次对话：在 thread_001 里保存偏好
result1 = graph.invoke(
    {"action": "save", "preference": "Python", "result": ""},
    config={"configurable": {"thread_id": "thread_001"}},  # checkpointer 的作用域键
    context=Context(user_id="user_001"),
)
print(result1["result"])  # 偏好保存成功

# 第二次对话：换到 thread_002，state 是全新的，但 Store 是全局共享的
result2 = graph.invoke(
    {"action": "read", "preference": "", "result": ""},
    config={"configurable": {"thread_id": "thread_002"}},
    context=Context(user_id="user_001"),  # user_id 相同 → namespace 相同 → 能读到
)
print(result2["result"])  # 用户喜欢：Python

```

### 语义搜索

用户现在问：

> 我平时主要用什么技术开发 AI Agent？

我们并不知道这条记忆的 Key，也不一定知道它存在哪个字段。这时可以使用语义搜索。

语义搜索不是简单地匹配关键词，而是通过 Embedding 将文本转换为向量，再根据向量相似度查找相关内容。

例如：

| 用户查询                    | Store 中的记忆                    | 是否可能匹配 |
| --------------------------- | --------------------------------- | ------------ |
| 我喜欢什么编程语言？        | 用户喜欢使用 Python               | 匹配         |
| 我主要用什么开发 AI Agent？ | 用户主要通过 Python 开发 AI Agent | 匹配         |
| 我喜欢什么颜色？            | 用户喜欢使用 Python               | 不相关       |

#### 创建 

创建 Store 时，需要提供 Embedding 配置：

```python
from langgraph.store.memory import InMemoryStore
from langchain.embeddings import init_embeddings

store = InMemoryStore(
    index={
        "dims": 1536,
        "embed": init_embeddings(
            "openai:text-embedding-3-small"
        ),
        "fields": ["content"]
    }
)
```

| 参数     | 作用                              |
| -------- | --------------------------------- |
| `dims`   | Embedding 向量维度                |
| `embed`  | 将文本转换成向量的 Embedding 模型 |
| `fields` | 指定需要进行向量索引的字段        |

这里使用的模型维度是 1536。

#### 保存

保存可以进行语义搜索的记忆

```python
namespace = ("users", "user_001", "memories")

store.put(
    namespace,
    "memory_001",
    {
        "content": "用户喜欢使用 Python，主要通过 Python 开发 AI Agent"
    }
)
```

#### 使用

```python
results = store.search(
    namespace,
    query="用户平时使用什么技术开发 AI Agent？",
    limit=3
)

for item in results:
    print(item.value)
```

### 持久化

前面使用的 `InMemoryStore` 有一个明显的问题：

程序重启，数据就会丢失。

对于企业级 Agent，用户的长期记忆不能只保存在 Python 进程的内存中。

所以生产环境通常需要使用数据库持久化 Store。

例如：

- `PostgresStore`
- `MongoDBStore`
- `RedisStore`
- `UpstashStore`

#### InMemoryStore 与 PostgresStore

| 对比       | InMemoryStore    | PostgresStore     |
| ---------- | ---------------- | ----------------- |
| 数据位置   | Python 进程内存  | PostgreSQL 数据库 |
| 程序重启   | 数据丢失         | 数据可保留        |
| 适用场景   | 学习、测试、Demo | 生产环境          |
| 多进程共享 | 不适合           | 可以              |
| 持久化     | 不支持           | 支持              |

### 如何设计长期记忆？

实际开发时，更重要的是思考：什么信息应该存入 Store？

例如，一个企业内部 AI 助手可以设计以下 Namespace：

```
Store
│
├── users
│   └── user_001
│       ├── preferences
│       │   ├── language
│       │   └── answer_style
│       │
│       ├── profile
│       │   ├── department
│       │   └── position
│       │
│       └── memories
│           ├── memory_001
│           └── memory_002
│
└── organizations
    └── company_001
        ├── policies
        └── knowledge
```

可以把长期记忆分成三类：

| 类型     | 内容               | 示例                      |
| -------- | ------------------ | ------------------------- |
| 用户偏好 | 用户喜欢什么       | 喜欢 Python、喜欢详细解释 |
| 用户资料 | 相对稳定的用户信息 | 所属部门、岗位            |
| 用户经历 | 过去发生过什么     | 曾经处理过某个项目        |

企业级开发还需要注意：

1. 身份可信：Namespace 中的 `user_id` 应来自可信的认证系统，不能直接信任用户提交的 ID。
2. 权限隔离：不同用户、不同租户之间必须进行访问控制。
3. 敏感信息保护：不要随意保存密码、密钥、个人敏感信息。
4. 记忆更新：用户偏好可能变化，需要支持更新和删除。
5. 数据生命周期：考虑过期时间、保留期限和用户删除请求。
6. 并发与一致性：多个 Agent 同时读写同一用户的记忆时，需要考虑数据冲突。

还有一点很重要：

Store 只是存储系统，不会自动判断什么信息值得记住。

Agent 还需要设计记忆提取、筛选、更新和检索逻辑。

## Send API：动态任务分发

假设用户上传了一份包含 100 个产品的 Excel 文件，希望 Agent 对每个产品分别进行分析，最后汇总结果。

我们可以创建一个分析节点，让它依次处理 100 个产品。

但这样有一个问题：所有产品都要排队等待，执行效率可能比较低。

有没有办法让 Graph 根据实际数据，动态创建多个任务，并行处理这些产品？

这就是 Send API 的典型用途。

### Send API 解决什么问题？

Send API 可以让某个节点在运行时，根据实际数据动态创建任务，并把任务发送给指定节点执行。

                   START
                     |
                 dispatch
                     |
             		动态创建任务
                     |
          +----------+----------+
          |          |          |
       Worker 1   Worker 2   Worker 3
          |          |          |
          +----------+----------+
                     |
                  Summary
                     |
                    END

假设用户上传了 3 个产品，`dispatch` 就创建 3 个任务。

如果用户上传了 100 个产品，就可以创建 100 个任务。

不需要提前在 Graph 中配置 100 个 Worker 节点。

**这就是 Send API 最核心的价值：根据运行时数据动态分发任务。**

### 基本使用

```python
from langgraph.types import Send

Send(
    node="worker",
    arg={"product": "产品 A"}
)
```

### 配合条件边使用

Send 通常不是在普通 Node 中直接调用，而是由条件路由函数返回。

```python
def dispatch_workers(state):
    return [
        Send("worker", {"product": product})
        for product in state["products"]
    ]
  
builder.add_conditional_edges(
    "dispatch",
    dispatch_workers
)
```

执行过程：

1. `dispatch` 节点执行完成。
2. LangGraph 调用 `dispatch_workers()`。
3. 路由函数读取当前 State。
4. 根据产品数量创建多个 Send 对象。
5. LangGraph 将这些任务发送给 Worker。
6. Worker 并行处理各自的产品。

**Conditional Edge 决定往哪里走，Send 决定动态创建多少次节点调用，以及每次调用接收什么数据。**

### Map-Reduce

这里包含两个阶段：

- Map：把一个大任务拆分成多个小任务。
- Reduce：把多个小任务的结果合并起来。

这就是 Map-Reduce 模式。

```python
from typing import TypedDict, Annotated
import operator
from langgraph.types import Send
from langgraph.graph import StateGraph, START, END


# Graph 的整体状态：所有节点共享、invoke 的输入输出都按这个 schema
class OverallState(TypedDict):
    products: list[dict]                          # 待分析的产品列表（扇出的来源）
    # 用于收集多个 Worker 的结果：带 reducer 后，多个并行 worker 写同一 key 是「拼接」而不是互相覆盖
    # 没有这个 Annotated，多个 worker 同时写 analyses 会直接报 InvalidUpdateError
    analyses: Annotated[list[dict], operator.add]
    summary: str                                  # 最终汇总文本


# Worker 接收的独立输入：Worker 不需要知道所有产品，只需要知道当前自己负责分析的产品。
# 这是「私有输入 schema」——LangGraph 由 worker() 参数的类型注解推断出该节点的输入 schema，
# 因此 Send 传进去的 dict 必须符合它（只含 product），而不是 OverallState。
class WorkerState(TypedDict):
    product: dict


def worker(state: WorkerState):
    product = state["product"]
    name = product["name"]
    price = product["price"]

    # 模拟产品分析
    analysis = {
        "name": name,
        "price": price,
        "evaluation": (
            "价格较高"
            if price > 5000
            else "价格相对适中"
        ),
    }

    # 注意：analyses 并不在 WorkerState 里，但节点可以把更新写回整体 state 的任意 channel，
    # 这是 LangGraph 允许的做法；返回列表（不是单个 dict）是为了配合 operator.add 拼接
    return {"analyses": [analysis]}


def dispatch_workers(state: OverallState):
    # 条件边路由函数：返回 Send 列表，每个 Send = 一次独立的 worker 调用
    #   Send 第一个参数是目标节点名，第二个参数是「这次调用」的输入（partial state）
    # 产品数量在运行时才确定，普通 add_edge 做不到这种按数据条数动态建边
    return [
        Send("worker", {"product": product})
        for product in state["products"]
    ]


def summarize(state: OverallState):
    # 读到的 analyses 已经是所有 worker 结果经 reducer 合并后的完整列表
    analyses = state["analyses"]
    lines = []
    for item in analyses:
        lines.append(f"{item['name']}：{item['evaluation']}")
    summary = "\n".join(lines)
    return {"summary": summary}  # 默认 reducer：直接覆盖


builder = StateGraph(OverallState)

# 注册节点
builder.add_node("worker", worker)
builder.add_node("summarize", summarize)

# START 根据输入动态分发任务：条件入口点，返回值是 Send 列表
# 这里不要再写 add_edge(START, "worker")，扇出完全由 dispatch_workers 决定
builder.add_conditional_edges(START, dispatch_workers)

# Worker 完成后进入汇总节点：多个 worker 实例在同一 superstep 并行执行，
# 所有分支结束后 summarize 只触发一次（fan-in 屏障），不会每个产品跑一遍
builder.add_edge("worker", "summarize")

# 汇总完成后结束
builder.add_edge("summarize", END)

graph = builder.compile()

result = graph.invoke({
    "products": [
        {"name": "iPhone", "price": 5999},
        {"name": "Xiaomi", "price": 2999},
        {"name": "Huawei", "price": 4999},
    ],
    "analyses": [],  # 必须给空列表作为 reducer 的累加起点
    "summary": "",
})
print(result["summary"])
# iPhone：价格较高
# Xiaomi：价格相对适中
# Huawei：价格相对适中

```

| 组件    | 职责                             |
| ------- | -------------------------------- |
| Send    | 创建动态任务，决定每个任务的输入 |
| Worker  | 执行具体任务                     |
| Reducer | 合并多个 Worker 的结果           |
| Summary | 使用合并后的结果进行汇总         |

**Send 负责动态并行，不负责结果合并；Reducer 负责结果合并，不负责启动并行。**

## Parallel Execution：并行执行

在 LangGraph 中，多个节点可以从同一个上游节点出发，同时进入执行流程。

LangGraph 并不是简单地按照代码中的边一条一条执行，

适合并行的任务通常具有以下特点：

- 任务之间相互独立。
- 不需要等待其他任务的执行结果。
- 可以分别读取输入数据。
- 执行结果可以在后续节点汇总。

### Super-step

一个 Super-step 就是 Graph 的一个执行阶段，同一个阶段中被调度的多个节点可以并行执行。

你发一条消息触发 Agent，Agent 执行一步算作一个 Super-step；有多个节点同时活跃就并行跑，全部跑完、消息送达后，再根据新状态决定下一步谁被唤醒，进入下一个 Super-step。

#### 内部发生什么？

Plan（计划）：确定本阶段哪些节点需要执行。

Execute（执行）：被选中的节点并行运行。

Update（更新）：收集节点返回的 State 更新，并应用到对应字段。

```mermaid
flowchart TD
    A[Plan: 选择本阶段节点] --> B[Execute: 并行执行节点]
    B --> C[收集各节点返回值]
    C --> D[Update: 通过 Reducer 更新 State]
    D --> E{是否还有待执行节点?}
    E -->|有| A
    E -->|没有| F[Graph 执行结束]
```

**同一个 Super-step 中，一个节点的 State 更新不会立即被另一个并行节点看到。**

### Fan-out 与 Fan-in

LangGraph 并行执行有两个重要概念：

- Fan-out：扇出，将一个任务分发给多个节点。
- Fan-in：扇入，等待多个节点完成后汇合到一个节点。

### 示例

```python
from typing import TypedDict, Annotated
import operator
from langgraph.graph import StateGraph, START, END  # 统一放顶部，避免 E402


# Graph 的整体状态
class State(TypedDict):
    product: dict  # 三个分析节点共享的同一份输入
    # 收集三个并行节点的结果：带 reducer 才能被多个并行节点同时写，
    # operator.add 负责把各自的 [result] 拼成一个列表，而不是互相覆盖
    results: Annotated[list[dict], operator.add]
    # 最终汇总结果（默认 last-write-wins，由 summary 节点覆盖写入）
    summary: str


def price_agent(state: State):
    product = state["product"]
    result = {
        "type": "price",  # 标记结果来源，便于汇总时区分 / 过滤
        "content": f"产品售价为 {product['price']} 元",
    }
    return {"results": [result]}  # 返回单元素列表，交给 reducer 拼接


def quality_agent(state: State):
    product = state["product"]
    result = {
        "type": "quality",
        "content": f"正在分析 {product['name']} 的产品质量",
    }
    return {"results": [result]}


def review_agent(state: State):
    product = state["product"]
    result = {
        "type": "review",
        "content": f"正在收集 {product['name']} 的用户评价",
    }
    return {"results": [result]}


def summary(state: State):
    # 此时 results 已是三条分支经 reducer 合并后的完整列表
    results = state["results"]
    summary_text = "\n".join(
        item["content"]
        for item in results
    )
    return {"summary": summary_text}


builder = StateGraph(State)

# 注册节点
builder.add_node("price_agent", price_agent)
builder.add_node("quality_agent", quality_agent)
builder.add_node("review_agent", review_agent)
builder.add_node("summary", summary)

# Fan-out：START 同时连到三个节点 → 它们在同一个 superstep 内并行执行，
# 三个节点拿到的是同一份 state 快照，各自只读 product、只写 results
builder.add_edge(START, "price_agent")
builder.add_edge(START, "quality_agent")
builder.add_edge(START, "review_agent")

# Fan-in：等待三个节点全部完成。
# 注意这是「列表形式」的 add_edge，不是三条独立边的简写：
#   - 列表形式：summary 严格等列表中所有节点完成后，只执行一次
#   - 三条独立边：任一分支完成的 superstep 都可能触发一次，分支长短不一时会跑多次
builder.add_edge(
    [
        "price_agent",
        "quality_agent",
        "review_agent",
    ],
    "summary",
)

# 汇总完成后结束
builder.add_edge("summary", END)

graph = builder.compile()

result = graph.invoke({
    "product": {
        "name": "iPhone 17",
        "price": 5999,
        "description": "一款智能手机",  # 当前三个节点都没用到，留给后续扩展
    },
    "results": [],  # reducer 的累加起点，必传
    "summary": "",
})
print(result["summary"])
# 产品售价为 5999 元 / 正在分析 iPhone 17 的产品质量 / 正在收集 iPhone 17 的用户评价
# （三行内容固定，但顺序不保证 —— 并行节点完成顺序不决定于注册顺序）

```

### 并行执行与 Send API 的关系

它们都可以实现并行执行，但适用场景不同。

| 对比         | 普通并行执行                                                 | Send API                     |
| ------------ | ------------------------------------------------------------ | ---------------------------- |
| 任务数量     | 通常提前确定                                                 | 运行时动态确定               |
| 目标节点     | 可以是多个不同节点                                           | 可以是同一个 Worker 多次调用 |
| 输入数据     | 共享 Graph State                                             | 每个 Send 可提供独立输入     |
| 典型用途     | 多个固定 Agent 协作                                          | 批量任务、Map-Reduce         |
| 是否支持并行 | 支持LangGraph 的 Streaming 不只是输出文字，还可以观察整个 Graph 的执行过程。 | 支持                         |

## Streaming：流式输出

LangGraph 的 Streaming 不只是输出文字，还可以观察整个 Graph 的执行过程。

目前常用的 Streaming 模式有七种：

| 模式          | 作用                               | 典型用途               |
| ------------- | ---------------------------------- | ---------------------- |
| `values`      | 输出每个执行阶段结束后的完整 State | 查看当前完整状态       |
| `updates`     | 输出节点返回的 State 更新          | 观察哪个节点修改了什么 |
| `messages`    | 输出 LLM 的消息片段和元数据        | 实现逐 Token 输出      |
| `custom`      | 输出节点主动发送的自定义数据       | 展示进度、状态提示     |
| `checkpoints` | 输出 Checkpoint 事件               | 观察状态持久化         |
| `tasks`       | 输出任务开始、结束、结果和错误     | 监控节点执行           |
| `debug`       | 输出详细调试信息                   | 调试复杂 Graph         |

### Value

它会在 Graph 每个执行阶段完成后，输出当时的完整 State。

```python
from typing import TypedDict

from langgraph.graph import StateGraph, START, END


class State(TypedDict):
    topic: str
    result: str


def node_a(state: State):
    return {
        "topic": state["topic"] + " LangGraph"
    }


def node_b(state: State):
    return {
        "result": f"正在学习：{state['topic']}"
    }


builder = StateGraph(State)

builder.add_node("node_a", node_a)
builder.add_node("node_b", node_b)

builder.add_edge(START, "node_a")
builder.add_edge("node_a", "node_b")
builder.add_edge("node_b", END)

graph = builder.compile()

for chunk in graph.stream(
    {
        "topic": "学习",
        "result": ""
    },
    stream_mode="values"
):
    print(chunk)
    
# 输出：    
    
# {
#     "topic": "学习",
#     "result": ""
# }

# {
#     "topic": "学习 LangGraph",
#     "result": ""
# }

# {
#     "topic": "学习 LangGraph",
#     "result": "正在学习：学习 LangGraph"
# }
```

### updates

`updates` 和 `values` 很像，但它们有一个关键区别。

- `values`：输出完整 State。
- `updates`：只输出节点本次返回的更新内容。

```python
for chunk in graph.stream(
    {
        "topic": "学习",
        "result": ""
    },
    stream_mode="updates"
):
    print(chunk)
    
# 输出：
# {
#     "node_a": {
#         "topic": "学习 LangGraph"
#     }
# }
# 
# {
#     "node_b": {
#         "result": "正在学习：学习 LangGraph"
#     }
# }
```

### messages

LLM 逐 Token 输出。

```python
from typing import TypedDict
from langchain.chat_models import init_chat_model
from langgraph.graph import StateGraph, START, END


class State(TypedDict):
    question: str
    answer: str
      

model = init_chat_model(
    "openai:gpt-4.1-mini",
    temperature=0
)


def llm_node(state: State):
    response = model.invoke(
        state["question"]
    )

    return {
        "answer": response.content
    }

builder = StateGraph(State)

builder.add_node("llm_node", llm_node)

builder.add_edge(START, "llm_node")
builder.add_edge("llm_node", END)

graph = builder.compile()

for message_chunk, metadata in graph.stream(
    {
        "question": "请介绍 LangGraph",
        "answer": ""
    },
    stream_mode="messages"
):
    print(
        message_chunk.content,
        end="",
        flush=True
    )
   
```

| 内容            | 作用                      |
| --------------- | ------------------------- |
| `message_chunk` | LLM 生成的消息片段        |
| `metadata`      | 这次 LLM 调用的相关元数据 |

### custom

自定义流式输出

```text
正在搜索资料...
已经找到 5 条资料...
正在分析第 1 份文档...
文档分析完成，进度 30%...
正在生成最终报告...
```

```python
from typing import TypedDict

from langgraph.graph import StateGraph, START, END
from langgraph.config import get_stream_writer


class State(TypedDict):
    question: str
    result: str


def process_node(state: State):
    writer = get_stream_writer()

    writer({
        "status": "开始处理",
        "progress": 10
    })

    writer({
        "status": "正在分析问题",
        "progress": 50
    })

    writer({
        "status": "分析完成",
        "progress": 100
    })

    return {
        "result": "问题处理完成"
    }


builder = StateGraph(State)

builder.add_node("process_node", process_node)

builder.add_edge(START, "process_node")
builder.add_edge("process_node", END)

graph = builder.compile()

for chunk in graph.stream(
    {
        "question": "什么是 LangGraph？",
        "result": ""
    },
    stream_mode="custom"
):
    print(chunk)
    
    
# {"status": "开始处理", "progress": 10}

# {"status": "正在分析问题", "progress": 50}

# {"status": "分析完成", "progress": 100}
```

### checkpoints

如果我们想在 Graph 执行时，观察 Checkpoint 什么时候创建、保存了什么状态，该怎么办？

```python
from langgraph.checkpoint.memory import InMemorySaver

checkpointer = InMemorySaver()

graph = builder.compile(
    checkpointer=checkpointer
)

config = {
    "configurable": {
        "thread_id": "thread_001"
    }
}

for chunk in graph.stream(
    inputs,
    config=config,
    stream_mode="checkpoints"
):
    print(chunk)
```

### tasks

我们希望知道：

- 哪个节点开始执行了？
- 哪个节点执行完成了？
- 哪个节点执行失败了？
- 节点返回了什么结果？

```python
for chunk in graph.stream(
    inputs,
    config=config,
    stream_mode="tasks"
):
    print(chunk)
    
# {
#     "node": "node_a",
#     "status": "started"
# }
# 
# {
#     "node": "node_a",
#     "status": "finished",
#     "result": {"answer": "处理完成"}
# }
```

### debug

调试 Graph 的完整执行过程, 可以理解为一个更全面的调试模式。

```python
for chunk in graph.stream(
    inputs,
    config=config,
    stream_mode="debug"
):
    print(chunk)
```

它会输出尽可能多的 Graph 执行信息，包括任务事件、Checkpoint 事件以及相关元数据。

适合：

- 调试复杂 Agent。
- 查看节点执行顺序。
- 排查状态更新问题。
- 研究并行执行。
- 排查中断与恢复问题。

### 如何选择

| 需求             | 推荐模式      |
| ---------------- | ------------- |
| 查看完整 State   | `values`      |
| 查看节点更新     | `updates`     |
| 查看 LLM Token   | `messages`    |
| 查看自定义进度   | `custom`      |
| 查看 Checkpoint  | `checkpoints` |
| 查看任务生命周期 | `tasks`       |
| 深入调试         | `debug`       |

### 同时使用多种模式

例如：

- 需要逐 Token 输出 LLM 内容。
- 需要显示当前执行到了哪个节点。
- 需要显示业务处理进度。
- 需要观察 State 更新。

LangGraph 支持同时使用多个 `stream_mode`。

```python
for chunk in graph.stream(
    inputs,
    stream_mode=[
        "updates",
        "messages",
        "custom"
    ]
):
    print(chunk)
```

### Subgraph 的 Streaming

父 Graph 中有一个节点，这个节点内部调用了一个子 Graph。

如果我们只使用父 Graph 的 Streaming，是否能看到子 Graph 内部的执行过程？

默认情况下，不一定能看到子图内部的流式事件。

如果希望观察子图内部的执行过程，需要设置：

```python
for chunk in graph.stream(
    inputs,
    stream_mode="updates",
    subgraphs=True
):
    print(chunk)
```

这样就可以接收子图内部产生的流式事件。

## Checkpointer：快照管理器

**核心概念：Checkpointer 不只是保存聊天记录，而是保存 Graph 在执行过程中的状态快照，使 Graph 能够检查、恢复和回溯执行。**

### 工作机制

假设一个订单处理 Graph：

```python
开始
  |
验证订单
  |
检查库存
  |
处理支付
  |
发送通知
  |
结束
```

执行过程中，LangGraph 会在 Super-step 边界保存状态快照。这样即使程序中断，也可以根据已保存的状态继续执行，而不是简单地从头开始。

**Checkpoint 保存了什么？**

Checkpoint 不只是保存一个简单的 State 字典。底层还会记录通道版本、节点已经读取过的版本等执行信息。

```json
{
    "v": 1,
    "id": "checkpoint-xxx",
    "ts": "2026-11-08T10:00:00",
    "channel_values": {
        "question": "订单什么时候发货？",
        "answer": "正在处理中"
    },
    "channel_versions": {
        "question": 1,
        "answer": 2
    },
    "versions_seen": {
        "answer_node": {
            "question": 1
        }
    }
}
```

几个重要字段：

| 字段               | 含义                       |
| ------------------ | -------------------------- |
| `v`                | Checkpoint 数据格式版本    |
| `id`               | Checkpoint 唯一标识        |
| `ts`               | 创建时间                   |
| `channel_values`   | 保存的 State 通道值        |
| `channel_versions` | 各个通道的版本             |
| `versions_seen`    | 各节点已经读取过的通道版本 |

LangGraph 通过这些版本信息判断哪些节点需要执行，以及哪些状态已经被节点读取。

### thread_id、checkpoint_id、checkpoint_ns

这三个都是 `config["configurable"]` 里的字段，合起来是**一张快照的三级坐标**：哪条会话 → 哪张图 → 哪个时刻。少任意一级都会取错数据。

```python
config = {
  "configurable": {
    "thread_id":    "thread-1",
    "checkpoint_ns": "researcher:6ba7b810|planner:9c2f1d40",
    "checkpoint_id": "1ef4a6c8-...",
  }
}

graph.invoke(
    {"question": "你好"},
    config=config
)
```

| 字段            | 作用                           | 示例                   |
| --------------- | ------------------------------ | ---------------------- |
| `thread_id`     | 标识逻辑执行线程               | `user-1001-session-01` |
| `checkpoint_id` | 指定某个具体快照               | `1f0abc...`            |
| `checkpoint_ns` | 区分根图或子图的检查点命名空间 | `""` 或子图命名空间    |

这三个字段都不需要你手工构造——正常只传 `thread_id`，其余由运行时生成，从 `StateSnapshot.config` 里读回来。

### Checkpoint 的 StateSnapshot 数据结构

在 LangGraph 中，调用 `get_state()` 获取的不是普通字典，而是一个 `StateSnapshot` 对象。

它包含以下重要属性：

| 属性            | 含义                                   |
| --------------- | -------------------------------------- |
| `values`        | 当前 State 的值                        |
| `next`          | 下一步准备执行的节点                   |
| `config`        | 当前快照对应的配置，包含检查点定位信息 |
| `metadata`      | Checkpoint 的元数据                    |
| `created_at`    | 快照创建时间                           |
| `parent_config` | 父级 Checkpoint 的配置                 |
| `tasks`         | 当前步骤的任务信息                     |
| `interrupts`    | 当前快照关联的中断信息                 |

其中最常用的是：

- `values`：查看当前业务状态。
- `next`：查看接下来要执行哪些节点。
- `config`：获取这个快照的定位信息。
- `tasks`：查看任务状态、错误等信息。

#### get_state 查看当前状态

```python
from typing import TypedDict
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import InMemorySaver


class State(TypedDict):
    messages: list[str]


def process_node(state: State):
    return {
        "messages": state["messages"] + ["处理完成"]
    }


builder = StateGraph(State)

builder.add_node("process", process_node)

builder.add_edge(START, "process")
builder.add_edge("process", END)

checkpointer = InMemorySaver()

graph = builder.compile(
    checkpointer=checkpointer
)

config = {
    "configurable": {
        "thread_id": "thread-001"
    }
}

result = graph.invoke(
    {
        "messages": ["用户提交订单"]
    },
    config=config
)

print(result)

snapshot = graph.get_state(config)

print(snapshot.values) 
print(snapshot.next)
print(snapshot.config)
print(snapshot.metadata)
print(snapshot.created_at)
print(snapshot.tasks)
```

#### get_state_history 查看历史状态

`get_state_history()` 可以查看同一个 Thread 的历史快照。

```python
history = graph.get_state_history(config)

for snapshot in history:
    print("时间：", snapshot.created_at)
    print("状态：", snapshot.values)
    print("下一步：", snapshot.next)
    print("Checkpoint：", snapshot.config)
    print("--------------------")
```

#### 限制历史查询数量

如果一个 Thread 已经执行了几千个步骤，不一定要全部读取。

```python
history = graph.get_state_history(config)

for index, snapshot in enumerate(history):
    if index >= 5:
        break

    print(snapshot.values)
```

### update_state 人工修改 Graph 状态

有时候我们希望在不重新执行某个业务节点的情况下，人工修改 Graph 的状态。

例如当前状态：

```python
{
    "messages": [
        "用户提交订单",
        "系统验证通过"
    ]
}
```

修改

```python
graph.update_state(
    config,
    {
        "messages": [
            "管理员人工修正订单"
        ]
    }
)
```

**它会按照 State 字段定义的 Reducer 规则处理更新, 而不是整体覆盖。**

#### as_node 参数

`as_node` 的作用是指定这次状态更新应当被视为哪个节点产生的更新。这会影响 LangGraph 对后续执行位置的判断。

```python
graph.update_state(
    config,
    {"status": "approved"},
    as_node="approval_node"
)
```

### Pending Writes 待处理写入

假设三个节点并行执行,两个执行成功了，一个失败了。如果没有保存中间执行结果，恢复时可能需要重新执行所有节点。

但是 LangGraph 的 Checkpointer 支持 Pending Writes，它可以保存同一个 Super-step 中已经成功完成的节点写入，即使其他节点失败，也能在恢复时利用这些成功结果，避免重新执行已经成功的节点。

### 持久化

前面一直使用`InMemorySaver`,数据保存在程序内存中。如果程序重启，内存中的 Checkpoint 就会丢失。

#### 常见 Checkpointer 方案

| Checkpointer         | 存储位置   | 适用场景            |
| -------------------- | ---------- | ------------------- |
| `InMemorySaver`      | 内存       | 学习、测试          |
| `SqliteSaver`        | SQLite     | 本地 Demo、小型应用 |
| `AsyncSqliteSaver`   | SQLite     | 异步小型应用        |
| `PostgresSaver`      | PostgreSQL | 生产环境            |
| `AsyncPostgresSaver` | PostgreSQL | 异步生产环境        |

#### PostgreSQL 持久化示例

```python
from langgraph.checkpoint.postgres import PostgresSaver

DB_URI = "postgresql://user:password@localhost:5432/langgraph"

with PostgresSaver.from_conn_string(DB_URI) as checkpointer:

    # 初始化数据库表结构
    checkpointer.setup()

    # 编译 Graph
    graph = builder.compile(
        checkpointer=checkpointer
    )

    config = {
        "configurable": {
            "thread_id": "user-1001"
        }
    }

    result = graph.invoke(
        {"messages": ["你好"]},
        config=config
    )

    print(result)
```

### Checkpointer 与 Store 的区别

| 对比维度 | Checkpointer                         | Store                                    |
| -------- | ------------------------------------ | ---------------------------------------- |
| 主要目的 | 保存 Graph 执行状态                  | 保存长期业务数据和记忆                   |
| 数据组织 | Thread、Checkpoint                   | Namespace、Key、Value                    |
| 生命周期 | 跟随 Graph 执行线程                  | 可以跨 Thread 长期存在                   |
| 典型数据 | 当前消息、执行进度、中断状态         | 用户偏好、长期记忆、用户资料             |
| 常用 API | `get_state()`、`get_state_history()` | `get()`、`put()`、`search()`、`delete()` |
| 主要场景 | 恢复执行、查看历史                   | 跨会话记忆、共享数据                     |

```
Checkpointer
    |
    +-- 保存执行过程
    +-- 保存当前状态
    +-- 保存历史快照
    +-- 支持中断恢复

Store
    |
    +-- 保存长期记忆
    +-- 保存用户偏好
    +-- 保存业务资料
    +-- 跨 Thread 共享数据
```

## Time Travel：时间旅行

如果 Graph 已经执行完成，但我们发现中间某一步出现了错误，能不能回到之前的状态，重新执行？

可以，这就是 LangGraph 的 Time Travel（时间旅行）。


它主要解决三个问题：

1. 回溯历史：查看 Graph 过去某个时间点的状态。
2. 从历史重新执行：从某个历史 Checkpoint 重新运行后续节点。
3. 创建执行分支：保留原来的执行历史，同时尝试另一条执行路径。



记住一个核心区别：

- Checkpointer 负责保存历史状态。

- Time Travel 利用这些历史状态，选择过去的某个位置重新执行。



例如，一个订单 Agent 的执行过程：

```
用户提交订单
     |
订单验证
     |
库存检查
     |
价格计算
     |
支付处理
     |
订单完成
```

如果发现价格计算阶段使用了错误的折扣规则，就可以回到价格计算之前的 Checkpoint，修改输入或状态，然后重新执行后续流程。

这不是简单地把时间倒回去，也不会自动撤销已经发生的外部操作。它本质上是基于历史状态重新启动 Graph 执行。

### Time Travel 的两种核心操作

- Replay（重放）：从过去某个 Checkpoint 重新执行后续流程。
- Fork（分叉）：从过去某个 Checkpoint 修改 State，再执行后续流程。

两者的区别：

| 对比                       | Replay         | Fork               |
| -------------------------- | -------------- | ------------------ |
| 是否从历史 Checkpoint 开始 | 是             | 是                 |
| 是否修改 State             | 通常不修改     | 可以修改           |
| 是否重新执行后续节点       | 是             | 是                 |
| 是否保留原来的历史         | 是             | 是                 |
| 主要用途                   | 重试、排查问题 | 尝试另一种执行路径 |

```python
from typing_extensions import TypedDict, NotRequired
from langgraph.graph import StateGraph, START
from langgraph.checkpoint.memory import InMemorySaver

class State(TypedDict):
    topic: NotRequired[str]
    joke: NotRequired[str]
      
def generate_topic(state: State):
    print("执行 generate_topic")

    return {
        "topic": "袜子在洗衣机里为什么会消失"
    }


def write_joke(state: State):
    print("执行 write_joke")

    topic = state["topic"]

    return {
        "joke": f"为什么{topic}？因为它们可能偷偷私奔了！"
    }

builder = StateGraph(State)

builder.add_node("generate_topic", generate_topic)
builder.add_node("write_joke", write_joke)

builder.add_edge(START, "generate_topic")
builder.add_edge("generate_topic", "write_joke")

checkpointer = InMemorySaver()

graph = builder.compile(
    checkpointer=checkpointer
)

config = {
    "configurable": {
        "thread_id": "time-travel-001"
    }
}

result = graph.invoke({}, config)

print(result)
```

现在 Graph 已经执行完成，并且 Checkpointer 已经保存了多个历史 Checkpoint。

### Replay：从历史状态重新执行

```python
# 将历史记录存入列表
history = list(
    graph.get_state_history(config)
)


for snapshot in history:
    print("State:", snapshot.values)
    print("Next:", snapshot.next)

    print(
        "Checkpoint ID:",
        snapshot.config["configurable"].get("checkpoint_id")
    )

    print("--------------------")
    
# 找到目标节点
before_joke = next(
    snapshot
    for snapshot in history
    if snapshot.next == ("write_joke",)
)

replay_result = graph.invoke(
    None,
    before_joke.config
)

print(replay_result)
```

第一个参数传 `None`：不提供新的 Graph 输入，而是从指定的历史 Checkpoint 恢复。

第二个参数传 `before_joke.config`：指定从哪个 Checkpoint 继续执行。

### Fork：修改历史状态并创建新分支

```python
history = list(
    graph.get_state_history(config)
)

before_joke = next(
    snapshot
    for snapshot in history
    if snapshot.next == ("write_joke",)
)

fork_config = graph.update_state(
    before_joke.config,
    {
        "topic": "鸡为什么会过马路"
    }
)

fork_result = graph.invoke(
    None,
    fork_config
)

print(fork_result)
```

### as_node：指定从哪个节点之后继续执行

```python
fork_config = graph.update_state(
    before_joke.config,
    {
        "topic": "鸡为什么会过马路"
    },
    as_node="generate_topic"
)

```

**把这次人工修改视为 `generate_topic` 节点产生的更新。**

## RetryPolicy：重试策略

节点执行失败了怎么办？

例如：

- 调用 OpenAI API 时，网络突然断开。
- 调用第三方天气 API 时，服务暂时不可用。
- 请求数据库时，连接池暂时没有可用连接。
- 调用工具时，遇到 HTTP 429（请求频率过高）。
- 某个节点执行时发生临时性异常。

LangGraph 提供了 `RetryPolicy`，可以为节点配置重试策略。



### 重试次数怎么算？

```python
RetryPolicy(max_attempts=3)
```

总共最多执行 3 次，而不是首次执行后再重试 3 次

### RetryPolicy 的核心参数

| 参数               | 含义                         | 默认值           |
| ------------------ | ---------------------------- | ---------------- |
| `initial_interval` | 第一次重试前等待时间（秒）   | 0.5              |
| `backoff_factor`   | 每次重试的间隔增长倍数       | 2.0              |
| `max_interval`     | 最大重试间隔（秒）           | 128              |
| `max_attempts`     | 最大总尝试次数，包含首次执行 | 3                |
| `jitter`           | 是否加入随机抖动             | True             |
| `retry_on`         | 哪些异常触发重试             | 默认异常判断规则 |

```python
from typing_extensions import TypedDict

from langgraph.graph import StateGraph, START, END
from langgraph.types import RetryPolicy


class State(TypedDict):
    query: str
    result: str


def search_node(state: State):
    print("正在调用搜索 API")

    # 模拟第三方 API
    result = call_search_api(state["query"])

    return {
        "result": result
    }


builder = StateGraph(State)

builder.add_node(
    "search",
    search_node,
    retry_policy=RetryPolicy(
        max_attempts=3,
        initial_interval=1.0,
        backoff_factor=2.0,
        max_interval=10.0,
        jitter=True
    )
)

builder.add_edge(START, "search")
builder.add_edge("search", END)

graph = builder.compile()
```

### 哪些异常应该重试？

例如：

- 网络连接暂时中断。
- 请求超时。
- 服务端暂时不可用。
- HTTP 429 限流。
- HTTP 502、503、504 等暂时性服务错误。

### 自定义 retry_on：精确控制重试条件

```python
import httpx

from langgraph.types import RetryPolicy


def should_retry(error: Exception) -> bool:

    # 网络连接错误
    if isinstance(error, httpx.ConnectError):
        return True

    # 请求超时
    if isinstance(error, httpx.TimeoutException):
        return True

    # HTTP 状态码错误
    if isinstance(error, httpx.HTTPStatusError):

        status_code = error.response.status_code

        if status_code == 429:
            return True

        if status_code in (500, 502, 503, 504):
            return True

    return False


retry_policy = RetryPolicy(
    max_attempts=4,
    initial_interval=1.0,
    backoff_factor=2.0,
    max_interval=10.0,
    jitter=True,
    retry_on=should_retry
)
```

### RetryPolicy 与 Error Handling 的区别

| 机制             | 主要作用                       |
| ---------------- | ------------------------------ |
| RetryPolicy      | 暂时性失败时，自动重新执行节点 |
| Error Handling   | 处理无法恢复或重试耗尽的异常   |
| Conditional Edge | 根据 State 决定下一步          |
| Command          | 更新 State 并控制流程          |
| Interrupt        | 暂停 Graph，等待人工输入       |

### LLM 调用

```python
def generate_node(state):

    response = model.invoke(
        state["messages"]
    )

    return {
        "answer": response.content
    }
  
builder.add_node(
    "generate",
    generate_node,
    retry_policy=RetryPolicy(
        max_attempts=3,
        initial_interval=1.0,
        backoff_factor=2.0,
        max_interval=10.0,
        jitter=True
    )
)
```

如果模型客户端重试 3 次，而 LangGraph 节点最多尝试 3 次，那么实际请求次数可能达到 9 次。

所以需要统一设计：

- 模型客户端重试次数。
- LangGraph 节点重试次数。
- HTTP 客户端重试次数。
- 整个请求允许的最大耗时。

不要让多层重试无限叠加。



## Error Handling：错误处理

RetryPolicy 解决的是“失败后要不要再试一次”；Error Handling 解决的是“失败之后应该怎么办”。

### LangGraph 中的错误处理机制

默认情况下，如果节点抛出一个没有被处理的异常，并且重试策略也无法恢复，异常会向 Graph 调用方传播。

```python
try:
    result = graph.invoke(inputs)
except Exception as error:
    print("Graph 执行失败：", error)
```

### 节点内部使用 try/except

```python
def search_node(state):

    try:
        result = call_search_api(
            state["query"]
        )

        return {
            "result": result,
            "error": None
        }

    except Exception as error:

        return {
            "result": None,
            "error": str(error)
        }
```

这里发生异常时，节点没有继续向外抛出异常，而是返回了一个正常的 State 更新。

LangGraph 会认为这个节点正常完成了。

这意味着：

- 不会自动触发 RetryPolicy。
- 可以继续执行后续节点。
- 后续节点可以读取 `error` 字段，决定下一步怎么处理。

### 区分业务错误与系统错误

#### 业务错误

业务本身不满足执行条件。

例如：

- 订单不存在。
- 库存不足。
- 用户没有权限。
- 余额不足。
- 输入参数不合法。

这类错误通常不应该自动重试。

可以直接返回业务错误信息，或者转到业务处理节点。

#### 系统错误

外部依赖或基础设施发生异常。

例如：

- 网络连接失败。
- 数据库连接失败。
- 第三方 API 超时。
- 模型服务暂时不可用。

这类错误可以考虑：

1. 使用 RetryPolicy 重试。
2. 重试耗尽后进入降级处理。
3. 如果无法恢复，则终止执行并记录错误。

#### 程序错误

例如：

- `NameError`
- `AttributeError`
- `TypeError`
- 不符合预期的状态结构。

这类错误应该优先暴露和修复，不应该简单地转换成“服务暂时不可用”。

### 节点 error_handler

`StateGraph.add_node()` 的 `error_handler` 参数。

它允许你为某个节点指定专门的错误处理函数。

这比在每个节点里面重复编写大量 `try/except` 更容易维护。



```python
from langgraph.errors import NodeError

def search_node(state):
    result = call_search_api(state["query"])

    return {
        "result": result
    }
  
def search_error_handler(
    state,
    error: NodeError
):
    print("搜索节点执行失败")
    print("节点名称：", error.node)
    print("错误原因：", error.error)

    return {
        "result": None,
        "error": str(error.error)
    }
  
builder.add_node(
    "search",
    search_node,
    error_handler=search_error_handler
)
```

当节点发生无法通过重试恢复的异常时，LangGraph 会调用对应的错误处理函数。

### error_handler 与 RetryPolicy 配合

```python
from langgraph.types import RetryPolicy
from langgraph.errors import NodeError


def search_node(state):
    result = call_search_api(state["query"])

    return {
        "result": result
    }


def search_error_handler(state, error: NodeError):
    return {
        "result": None,
        "error": f"搜索失败：{error.error}"
    }


builder.add_node(
    "search",
    search_node,
    retry_policy=RetryPolicy(
        max_attempts=3
    ),
    error_handler=search_error_handler
)
```

### error_handler 中使用 Command 控制流程

```python
from typing import TypedDict
from langgraph.types import Command
from langgraph.errors import NodeError
from langgraph.graph import StateGraph, START, END
from langgraph.types import RetryPolicy

class State(TypedDict):
    query: str
    result: str | None
    error: str | None
    status: str
      
def search_node(state: State):

    result = call_search_api(
        state["query"]
    )

    return {
        "result": result,
        "status": "success"
    }

def search_error_handler(
    state: State,
    error: NodeError
) -> Command:

    return Command(
        update={
            "result": None,
            "error": str(error.error),
            "status": "failed"
        },
        goto="fallback"
    )
  
def fallback_node(state: State):

    return {
        "result": "搜索服务暂时不可用，请稍后重试"
    }
  

builder = StateGraph(State)

builder.add_node(
    "search",
    search_node,
    retry_policy=RetryPolicy(
        max_attempts=3
    ),
    error_handler=search_error_handler
)

builder.add_node(
    "fallback",
    fallback_node
)

builder.add_edge(START, "search")
builder.add_edge("fallback", END)

graph = builder.compile()
```

### Graph 设置默认错误处理

```python
builder.set_node_defaults(
    error_handler=default_error_handler
)
```

### 实现错误分支

使用 State + Conditional Edge 实现错误分支

```python
from typing import TypedDict


class State(TypedDict):
    query: str
    result: str | None
    error: str | None
    
def search_node(state: State):

    try:
        result = call_search_api(
            state["query"]
        )

        return {
            "result": result,
            "error": None
        }

    except ConnectionError as error:

        return {
            "result": None,
            "error": str(error)
        }
        
def route_after_search(state: State):

    if state["error"]:
        return "fallback"

    return "summary"
def summary_node(state: State):

    return {
        "result": f"搜索结果：{state['result']}"
    }


def fallback_node(state: State):

    return {
        "result": "搜索服务暂时不可用"
    }
  
builder = StateGraph(State)

builder.add_node("search", search_node)
builder.add_node("summary", summary_node)
builder.add_node("fallback", fallback_node)

builder.add_edge(START, "search")

builder.add_conditional_edges(
    "search",
    route_after_search,
    {
        "summary": "summary",
        "fallback": "fallback"
    }
)

builder.add_edge("summary", END)
builder.add_edge("fallback", END)

graph = builder.compile()
```

### 无法自动解决的问题交给人

有些错误既不适合重试，也不适合直接失败。

例如：

- 用户没有提供订单号。
- 用户输入的信息不完整。
- 退款金额需要人工确认。
- Agent 无法判断某项业务操作是否安全。

这时可以使用之前学过的 `interrupt()`。

## Timeout / Recursion Limit ：超时与递归限制

Timeout（超时控制）：防止某个节点执行太久。

Recursion Limit（递归限制）：防止整个 Graph 因为循环或路由错误而无限执行。

### 为什么需要 Timeout 和 Recursion Limit？

假设我们正在开发一个商品分析 Agent：

**问题一：节点执行时间过长**

搜索商品时，第三方 API 一直没有响应，节点一直等待。

**问题二：Graph 无限循环**

Agent 判断信息不足，于是重新搜索；搜索后又判断信息不足，再次搜索，始终无法退出循环。

这两个问题分别需要 Timeout 和 Recursion Limit 处理。

### Timeout 和 Recursion Limit 的区别

| 对比项   | Timeout                | Recursion Limit        |
| -------- | ---------------------- | ---------------------- |
| 控制对象 | 单个节点的一次执行尝试 | 整个 Graph 的执行      |
| 控制内容 | 执行时间               | Super-step 数量        |
| 解决问题 | 节点卡住、执行太久     | 无限循环、流程无法终止 |
| 超限结果 | `NodeTimeoutError`     | `GraphRecursionError`  |
| 常见配置 | `timeout=...`          | `recursion_limit=...`  |

### Node Timeout 节点超时控制

```python
import asyncio

from typing_extensions import TypedDict
from langgraph.graph import StateGraph, START, END
from langgraph.errors import NodeTimeoutError


class State(TypedDict):
    result: str


# 模拟一个耗时 5 秒的异步搜索
async def search_node(state: State):
    print("开始搜索...")

    await asyncio.sleep(5)

    return {
        "result": "搜索成功"
    }


builder = StateGraph(State)

# 限制节点最多运行 2 秒
builder.add_node(
    "search",
    search_node,
    timeout=2
)

builder.add_edge(START, "search")
builder.add_edge("search", END)

graph = builder.compile()


async def main():
    try:
        result = await graph.ainvoke({
            "result": ""
        })

        print(result)

    except NodeTimeoutError as error:
        print("节点执行超时！")
        print("节点名称：", error.node)
        print("已经耗时：", error.elapsed)
        print("超时类型：", error.kind)


asyncio.run(main())
```

#### TimeoutPolicy 更精细的超时控制

```python
from langgraph.types import TimeoutPolicy

timeout_policy = TimeoutPolicy(
  	# 单次节点执行的最大总时间
    run_timeout=60,
  	# 节点连续没有可观察进度的最长时间
    idle_timeout=15,
  	# 指定哪些进度信号可以刷新 idle_timeout
    refresh_on="auto"
)
```

节点最多运行 60 秒。即使节点不断汇报进度，也不能延长这个期限。

节点连续 15 秒没有可观察进度，就可能触发超时。

即使不断发送心跳，也不能突破 60 秒总时限。

#### 长任务如何发送 Heartbeat？

如果任务本身需要几分钟，但中间一直有实际进展，就可以定期发送 heartbeat。

```python
import asyncio

from langgraph.runtime import Runtime
from langgraph.types import TimeoutPolicy


async def long_task_node(state, runtime: Runtime):
    for i in range(5):
        await asyncio.sleep(10)

        # 告诉 LangGraph：任务仍在正常推进
        runtime.heartbeat()

        print(f"已完成第 {i + 1} 批")

    return {
        "result": "任务完成"
    }
  
builder.add_node(
    "long_task",
    long_task_node,
    timeout=TimeoutPolicy(
        run_timeout=120,
        idle_timeout=20,
        refresh_on="heartbeat"
    )
)
```

eartbeat 只是告诉 LangGraph 当前任务仍有进展。

### NodeTimeoutError 如何处理节点超时

当节点超时时，LangGraph 会抛出 `NodeTimeoutError`。

它包含一些有用的信息：

| 属性           | 含义                      |
| -------------- | ------------------------- |
| `node`         | 超时节点名称              |
| `elapsed`      | 实际经过的时间            |
| `kind`         | 超时类型：`run` 或 `idle` |
| `run_timeout`  | 配置的总时间限制          |
| `idle_timeout` | 配置的无进度时间限制      |

```python
try:
    result = await graph.ainvoke(inputs)

except NodeTimeoutError as error:
    print(error.node)
    print(error.elapsed)
    print(error.kind)
```

### Timeout + RetryPolicy

```python
from langgraph.types import RetryPolicy

builder.add_node(
    "search",
    search_node,
    timeout=10,
    retry_policy=RetryPolicy(
        max_attempts=3
    )
)
```

每次执行最多 10 秒。

最多尝试 3 次，包含第一次执行。

如果每次都超时，最终执行失败。

### Recursion Limit Graph 最大执行步数

> Agent → 工具 → 检查 → Agent → 工具 → 检查 → ...

Graph 就可能无限循环。

这时需要 Recursion Limit 作为最后一道保护。

```python
result = graph.invoke(
    inputs,
    config={
        "recursion_limit": 50
    }
)
```

这里的 `50` 表示本次 Graph 执行允许的最大 Super-step 数量。

#### GraphRecursionError

当 Graph 达到配置的最大步数，仍然没有正常结束时，就会抛出：GraphRecursionError

```python
from langgraph.errors import GraphRecursionError

try:
    result = graph.invoke(
        inputs,
        config={
            "recursion_limit": 20
        }
    )

except GraphRecursionError:
    print("Graph 执行步数超过限制，可能存在无限循环！")
```

### 不要只依赖 Recursion Limit

Recursion Limit 是保护机制，不应该用它代替业务流程的终止条件。

我们应该让 Graph 自己判断什么时候结束。

```python
from typing import Literal
from typing_extensions import TypedDict  # Python < 3.12；3.12+ 可直接用 typing.TypedDict
from langgraph.graph import StateGraph, START, END

MAX_COUNT = 5  # 循环终止阈值：从硬编码提为常量，更进一步可由 Runtime context / config 下发


class State(TypedDict):
    # 没有 reducer → 默认 last-write-wins（覆盖），所以 process 里的 +1 才是「加一」。
    # 若误给这个字段配 operator.add，每次会变成累加翻倍。
    count: int


def process_node(state: State):
    # 循环体：只返回局部更新，把计数推进一格
    return {"count": state["count"] + 1}


def should_continue(state: State) -> Literal["continue", "end"]:
    # 循环必须有终止条件，否则会一直跑到 recursion_limit 抛 GraphRecursionError。
    # 返回的是「逻辑分支名」，不是节点名 —— 靠下面的 path_map 翻译成实际目标。
    # Literal 注解便于 Studio / get_graph() 渲染出两条出边（非运行必需）。
    if state["count"] < MAX_COUNT:
        return "continue"
    return "end"


builder = StateGraph(State)
builder.add_node("process", process_node)
builder.add_edge(START, "process")

# 条件边指回自身，形成环：
#   "continue" → "process" 再执行一次（循环体）
#   "end"      → END 结束
# 与上一轮不同，这里的 path_map 不能省：返回值 "continue"/"end" 都不是节点名，
# 省略后 LangGraph 会去找名为 "continue" 的节点而报错。
builder.add_conditional_edges(
    "process",
    should_continue,
    {
        "continue": "process",
        "end": END,
    },
)

graph = builder.compile()

# recursion_limit 是 config 的顶层键，不能放进 configurable。
# 如果同时挂了 checkpointer，写成：
#   {"configurable": {"thread_id": "..."}, "recursion_limit": 20}
# 单位是 super-step 数（默认 25），不是节点执行次数；超限抛 GraphRecursionError
# （from langgraph.errors import GraphRecursionError）。本例只跑 5 轮，20 足够。
result = graph.invoke(
    {"count": 0},
    config={"recursion_limit": 20},
)
print(result)  # {'count': 5} —— process_node 执行 5 次：0→1→2→3→4→5

```

`should_continue()`：正常业务逻辑，负责判断是否结束。

`recursion_limit`：安全保护，防止业务逻辑出错导致无限执行。

**企业级 Agent 必须同时设计正常退出条件和异常保护机制。**

## Graph Testing / Debugging：测试和 debug

一套完整的 Graph 测试思维：

- 测试节点
- 测试 State 更新
- 测试 Edge 和 Conditional Edge
- 测试循环与并行
- 测试 Interrupt
- 测试 Checkpoint 恢复
- 调试完整 Graph

### LangGraph 测试应该测试什么？

测试范围清单:

| 测试对象           | 需要验证的内容                           |
| ------------------ | ---------------------------------------- |
| Node               | 输入是否正确、输出是否正确、异常是否正确 |
| State              | 字段是否更新、Reducer 是否正确合并       |
| Edge               | 节点是否按照预期连接                     |
| Conditional Edge   | 不同条件是否走向正确节点                 |
| Command            | State 更新和动态路由是否正确             |
| Parallel Execution | 并行结果是否完整、是否正确合并           |
| Cycles             | 循环是否正确继续、是否能够退出           |
| Interrupt          | 是否正确暂停、是否能够恢复               |
| Checkpointer       | 状态是否保存、是否能从历史状态恢复       |
| 完整 Graph         | 输入到最终输出的业务流程是否正确         |

例如，商品分析 Agent 最终返回了一个总结，但它可能只执行了价格分析，没有执行评价分析。

只检查最终结果，很容易漏掉这种问题。

### Python 测试基础：pytest

```python
def add(a: int, b: int):
    return a + b

def test_add():
    result = add(1, 2)

    assert result == 3
```

```shell
pytest -v
```

- `test_` 开头的函数会被 pytest 识别为测试。
- `assert` 用于验证结果是否符合预期。
- 如果断言失败，测试就会失败。

#### 常用断言

```python
assert result == 10

assert result != 0

assert result is None

assert "success" in result

assert isinstance(result, dict)

assert len(result) == 3
```

提前定义正确结果，然后让程序执行，再检查实际结果是否符合预期。

### Node Testing

```python
from typing_extensions import TypedDict


class State(TypedDict):
    order_id: str
    status: str
    result: str


def check_order_node(state: State):
    order_id = state["order_id"]

    if order_id == "1001":
        return {
            "status": "success",
            "result": "订单存在"
        }

    return {
        "status": "failed",
        "result": "订单不存在"
    }

# 测试正常情况
def test_check_order_success():
    state = {
        "order_id": "1001",
        "status": "",
        "result": ""
    }

    result = check_order_node(state)

    assert result["status"] == "success"
    assert result["result"] == "订单存在"

# 测试异常情况
def test_check_order_not_found():
    state = {
        "order_id": "9999",
        "status": "",
        "result": ""
    }

    result = check_order_node(state)

    assert result["status"] == "failed"
    assert result["result"] == "订单不存在"
```

#### Node Testing 的测试范围

一个节点至少考虑以下情况：

1. 正常输入。
2. 空输入。
3. 缺失字段。
4. 边界值。
5. 业务异常。
6. 第三方服务异常。
7. 返回字段是否正确。

### State Testing

State Testing 关注的是：

节点返回的更新经过 LangGraph 合并后，最终 State 是否正确？

```python
import operator
from typing import Annotated
from typing_extensions import TypedDict
from langgraph.graph import StateGraph, START, END


class State(TypedDict):
    count: Annotated[int, operator.add]
    results: Annotated[list[str], operator.add]


def node_a(state: State):
    return {
        "count": 1,
        "results": ["A"],
    }


def node_b(state: State):
    return {
        "count": 1,
        "results": ["B"],
    }


builder = StateGraph(State)
builder.add_node("node_a", node_a)
builder.add_node("node_b", node_b)
builder.add_node(
    "summary",
    # 只追加一条标记，不写 count → count 保持上一 superstep 的 2。
    # 建议换成具名函数：trace / 报错栈里显示 <lambda> 不方便排错。
    lambda state: {"results": ["SUMMARY"]},
)

builder.add_edge(START, "node_a")
builder.add_edge(START, "node_b")

# 列表形式的 fan-in：等 node_a / node_b 都完成，summary 只执行一次
builder.add_edge(["node_a", "node_b"], "summary")
builder.add_edge("summary", END)

graph = builder.compile()


def test_parallel_state_merge():
    result = graph.invoke({
        "count": 0,     # int reducer 的累加起点
        "results": [],  # list reducer 的累加起点
    })
    # 并行 superstep 的写入顺序不保证，用 set 比集合是对的
    assert set(result["results"]) == {"A", "B", "SUMMARY"}
    # 但 set 会掩盖重复元素，补一条长度断言更严谨
    assert len(result["results"]) == 3
    # 两个节点各贡献增量 1
    assert result["count"] == 2
    # 最终大致：{"count": 2, "results": ["A", "B", "SUMMARY"]}（顺序不定）

```

### Edge / Conditional Edge Testing

先测试路由函数

```python
def route_order(state: State):
    if state["status"] == "success":
        return "process"

    return "error"
  

def test_route_order_success():
    state = {
        "order_id": "1001",
        "status": "success",
        "result": ""
    }

    assert route_order(state) == "process"


def test_route_order_failed():
    state = {
        "order_id": "9999",
        "status": "failed",
        "result": ""
    }

    assert route_order(state) == "error"
```

Conditional Edge 的核心就是一个判断函数。

直接测试可以快速覆盖各种分支，不必每次都运行完整 Graph。

再测试完整路由流程：

```python
from langgraph.graph import StateGraph, START, END


def process_node(state):
    return {
        "result": "订单处理成功"
    }


def error_node(state):
    return {
        "result": "订单处理失败"
    }


builder = StateGraph(State)

builder.add_node("check", check_order_node)
builder.add_node("process", process_node)
builder.add_node("error", error_node)

builder.add_edge(START, "check")

builder.add_conditional_edges(
    "check",
    route_order,
    {
        "process": "process",
        "error": "error"
    }
)

builder.add_edge("process", END)
builder.add_edge("error", END)

graph = builder.compile()

# 测试成功路径
def test_graph_success_path():
    result = graph.invoke({
        "order_id": "1001",
        "status": "",
        "result": ""
    })

    assert result["result"] == "订单处理成功"
    
    
# 测试失败路径
def test_graph_error_path():
    result = graph.invoke({
        "order_id": "9999",
        "status": "",
        "result": ""
    })

    assert result["result"] == "订单处理失败"
```

### Mock 外部依赖

```python
from typing import TypedDict, NotRequired  # Python 3.11+；低版本改从 typing_extensions 导入


class State(TypedDict):
    keyword: str
    # 节点要写入的 channel；调用时不必提供，所以标 NotRequired。
    # 若不声明 results，节点返回的这个 key 在图里没有对应 channel。
    results: NotRequired[list[dict]]


def search_product(keyword: str) -> list[dict]:
    # 真实搜索逻辑（HTTP / DB 等外部依赖），单测里会被替换掉
    raise NotImplementedError("接入真实搜索 API")


def search_node(state: State) -> dict[str, list[dict]]:
    # 通过模块全局名查找 search_product —— 这正是 monkeypatch 能生效的原因：
    # 调用发生在运行时，查的是 agent 模块字典里「当前」绑定的对象
    results = search_product(state["keyword"])
    return {"results": results}  # ← 原代码少了这个 }
  
import agent


def test_search_node(monkeypatch):
    # monkeypatch 是 pytest 内置 fixture：测试结束（含失败）自动还原，无需手动 teardown
    seen_keywords: list[str] = []

    def fake_search(keyword: str) -> list[dict]:
        seen_keywords.append(keyword)  # 顺带验证节点确实把 keyword 传下来了
        return [{"name": "iPhone", "price": 5000}]

    # patch 的是 agent 模块的属性，且必须在调用 search_node 之前设置。
    # 若节点里改成 from xxx import search_product 的本地绑定，或把函数捕获成默认参数，
    # 这里就不会生效。
    monkeypatch.setattr(agent, "search_product", fake_search)

    # 直接调节点函数即可单测，不必编译图、不必 invoke
    result = agent.search_node({"keyword": "手机"})

    assert len(result["results"]) == 1
    assert result["results"][0]["name"] == "iPhone"
    # 补强：验证入参传递与完整返回结构，避免只测到「假数据被原样透传」
    assert seen_keywords == ["手机"]
    assert result == {"results": [{"name": "iPhone", "price": 5000}]}


```

`monkeypatch.setattr()` 会在测试期间替换指定函数，测试结束后自动恢复。

### Cycles Testing

循环测试需要验证两个方面：

1. 应该继续时，Graph 确实继续。
2. 应该结束时，Graph 确实结束。

```python
from typing_extensions import TypedDict

from langgraph.graph import (
    StateGraph,
    START,
    END
)


class State(TypedDict):
    count: int
    finished: bool


def process_node(state: State):
    count = state["count"] + 1

    return {
        "count": count,
        "finished": count >= 3
    }


def route_node(state: State):
    if state["finished"]:
        return "end"

    return "continue"


builder = StateGraph(State)

builder.add_node("process", process_node)

builder.add_edge(START, "process")

builder.add_conditional_edges(
    "process",
    route_node,
    {
        "continue": "process",
        "end": END
    }
)

graph = builder.compile()

# 测试正常退出
def test_cycle_terminates():
    result = graph.invoke({
        "count": 0,
        "finished": False
    })

    assert result["count"] == 3
    assert result["finished"] is True
```

### Parallel Execution Testing

并行执行测试重点验证：

- 所有应该运行的节点是否都执行了。
- Reducer 是否正确合并结果。
- Fan-in 是否等待所有上游节点。
- 是否存在并发写入冲突。
- 结果是否依赖不稳定的执行顺序。

测试时，不要写：

```python
assert set(result["results"]) == {
    "价格分析",
    "质量分析",
    "评价分析"
}
```

因为并行节点的结果顺序不应该被假定为固定。

应该写：

```python
assert set(result["results"]) == {
    "价格分析",
    "质量分析",
    "评价分析"
}
```

如果业务确实需要固定顺序，可以给每个结果增加序号：

```python
[
    {"index": 1, "result": "价格分析"},
    {"index": 2, "result": "质量分析"},
    {"index": 3, "result": "评价分析"}
]
```

然后在汇总节点中排序，再测试排序后的结果。

并行测试要验证结果完整性，而不是假定节点完成顺序。

### Interrupt Testing

```
用户提交退款申请
       ↓
Agent 检查订单
       ↓
生成退款方案
       ↓
人工审批
       ↓
批准？
  ├── 是 → 执行退款
  └── 否 → 拒绝退款
```

我们需要测试：

1. Graph 是否正确暂停。
2. 是否正确返回 Interrupt 信息。
3. 人工批准后是否能够恢复。
4. 人工拒绝后是否不会执行退款。

```python
from typing_extensions import TypedDict

from langgraph.graph import StateGraph, START, END
from langgraph.types import interrupt, Command
from langgraph.checkpoint.memory import InMemorySaver


class State(TypedDict):
    amount: int
    approved: bool
    result: str


def approval_node(state: State):
    approved = interrupt({
        "question": "是否批准退款？",
        "amount": state["amount"]
    })

    return {
        "approved": approved
    }


def refund_node(state: State):
    return {
        "result": "退款成功"
    }


def reject_node(state: State):
    return {
        "result": "退款申请被拒绝"
    }


def route_approval(state: State):
    if state["approved"]:
        return "refund"

    return "reject"


builder = StateGraph(State)

builder.add_node("approval", approval_node)
builder.add_node("refund", refund_node)
builder.add_node("reject", reject_node)

builder.add_edge(START, "approval")

builder.add_conditional_edges(
    "approval",
    route_approval,
    {
        "refund": "refund",
        "reject": "reject"
    }
)

builder.add_edge("refund", END)
builder.add_edge("reject", END)

checkpointer = InMemorySaver()

graph = builder.compile(
    checkpointer=checkpointer
)

# 测试人工恢复与审批
def test_interrupt_approval():

    config = {
        "configurable": {
            "thread_id": "test-refund-001"
        }
    }

    # 第一次执行：应该暂停
    result = graph.invoke(
        {
            "amount": 100,
            "approved": False,
            "result": ""
        },
        config=config
    )

    # 验证出现 Interrupt
    assert "__interrupt__" in result

    # 人工批准，恢复执行
    result = graph.invoke(
        Command(resume=True),
        config=config
    )

    assert result["approved"] is True
    assert result["result"] == "退款成功"
    
# 测试人工拒绝
def test_interrupt_rejection():

    config = {
        "configurable": {
            "thread_id": "test-refund-002"
        }
    }

    graph.invoke(
        {
            "amount": 100,
            "approved": False,
            "result": ""
        },
        config=config
    )

    result = graph.invoke(
        Command(resume=False),
        config=config
    )

    assert result["approved"] is False
    assert result["result"] == "退款申请被拒绝"
```

### Checkpoint Testing

需要验证：

- Graph 执行后，Checkpoint 是否成功保存。
- 是否能通过 `get_state()` 获取当前 State。
- 是否能通过 `get_state_history()` 获取历史记录。
- 是否能在中断或失败后恢复执行。

```python
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.graph import StateGraph, START, END


class State(TypedDict):
    count: int


def increment_node(state: State):
    return {
        "count": state["count"] + 1
    }


builder = StateGraph(State)

builder.add_node("increment", increment_node)

builder.add_edge(START, "increment")
builder.add_edge("increment", END)

checkpointer = InMemorySaver()

graph = builder.compile(
    checkpointer=checkpointer
)

# 测试是否保存
def test_checkpoint_saved():

    config = {
        "configurable": {
            "thread_id": "checkpoint-test-001"
        }
    }

    graph.invoke(
        {"count": 0},
        config=config
    )

    snapshot = graph.get_state(config)

    assert snapshot.values["count"] == 1
    
# 测试历史记录
def test_checkpoint_history():

    config = {
        "configurable": {
            "thread_id": "checkpoint-test-002"
        }
    }

    graph.invoke(
        {"count": 0},
        config=config
    )

    history = list(
        graph.get_state_history(config)
    )

    assert len(history) >= 2
```

### Debugging：如何调试 LangGraph？

但实际开发中，测试失败之后，我们还需要定位问题。

#### 使用 stream_mode="updates"

```python
for chunk in graph.stream(
    {"count": 0},
    stream_mode="updates"
):
    print(chunk)
```

它可以显示每个节点返回的 State 更新。

```python
{
    "node_a": {
        "count": 1
    }
}

{
    "node_b": {
        "count": 2
    }
}
```

适合检查：

- 哪个节点执行了？
- 节点返回了什么？
- State 更新是否符合预期？

### 使用 stream_mode="values"

```python
for chunk in graph.stream(
    {"count": 0},
    stream_mode="values"
):
    print(chunk)
```

它输出每个执行阶段结束后的完整 State。

### 使用 stream_mode="debug"

`debug` 模式会提供更详细的执行信息，适合开发和故障排查。

```python
for chunk in graph.stream(
    {"count": 0},
    stream_mode="debug"
):
    print(chunk)
```

### 使用 使用 stream_mode="tasks"

```python
for chunk in graph.stream(
    {"count": 0},
    stream_mode="tasks"
):
    print(chunk)
```

它更关注任务执行事件，例如任务开始、结束、结果和错误。

注意：`tasks` 和 `checkpoints` 需要配合 Checkpointer 使用；

### 多种 Stream Mode 一起使用

```python
for mode, chunk in graph.stream(
    {"count": 0},
    stream_mode=["updates", "debug"]
):
    print("模式：", mode)
    print("数据：", chunk)
```

### 使用 Interrupt 作为断点调试

还有一个非常实用的功能：静态断点（Static Breakpoints）。

它允许我们在指定节点之前或之后暂停 Graph。

```python
from langgraph.checkpoint.memory import InMemorySaver


checkpointer = InMemorySaver()

graph = builder.compile(
    checkpointer=checkpointer,
    interrupt_before=["process_node"]
)

config = {
    "configurable": {
        "thread_id": "debug-001"
    }
}

result = graph.invoke(
    {"count": 0},
    config=config
)

snapshot = graph.get_state(config)

print(snapshot.values)
print(snapshot.next)
```

当 Graph 执行到 `process_node` 之前，就会暂停。

我们可以查看状态,确认没问题之后，继续执行。

| 对比                  | 静态断点                               | `interrupt()`         |
| --------------------- | -------------------------------------- | --------------------- |
| 主要目的              | 开发调试                               | 人工审批、人工输入    |
| 设置方式              | `interrupt_before` / `interrupt_after` | 在节点中调用          |
| 恢复方式              | `invoke(None, config)`                 | `Command(resume=...)` |
| 是否需要 Checkpointer | 需要                                   | 需要                  |

注意：静态断点适合调试，不应该拿来代替正式的人工审批流程。

### 使用 pytest Fixture 管理 Graph

上面的例子中，我们反复创建 Graph。

实际项目中，可以使用 pytest 的 Fixture 统一管理测试对象。

```python
import pytest

from langgraph.checkpoint.memory import InMemorySaver


@pytest.fixture
def test_graph():

    checkpointer = InMemorySaver()

    graph = builder.compile(
        checkpointer=checkpointer
    )

    return graph
  
def test_graph_execution(test_graph):

    result = test_graph.invoke(
        {"count": 0}
    )

    assert result["count"] == 1
```

Fixture 的好处：

- 统一创建 Graph。
- 减少重复代码。
- 每个测试可以获得独立的测试环境。
- 更容易替换 Checkpointer 和外部依赖。

### 企业级 Agent 的测试目录应该怎么组织？

```shell
my_agent/
│
├── app/
│   ├── graph.py
│   ├── state.py
│   ├── nodes/
│   │   ├── search.py
│   │   ├── analysis.py
│   │   └── summary.py
│   │
│   ├── tools/
│   │   ├── search_tool.py
│   │   └── database_tool.py
│   │
│   └── routing.py
│
├── tests/
│   ├── conftest.py
│   │
│   ├── unit/
│   │   ├── test_nodes.py
│   │   ├── test_tools.py
│   │   ├── test_routing.py
│   │   └── test_state.py
│   │
│   ├── integration/
│   │   ├── test_graph.py
│   │   ├── test_parallel.py
│   │   ├── test_cycles.py
│   │   └── test_interrupt.py
│   │
│   └── persistence/
│       └── test_checkpoint.py
│
└── requirements.txt
```

## Durable Execution：持久化执行

如果 Agent 执行到一半，服务器突然崩溃了，等服务恢复之后，能不能从之前的进度继续执行？

这就是 Durable Execution（持久化执行）要解决的问题。

**让一个正在执行的工作流具备持久化能力，即使遇到进程中断、服务重启或临时故障，也能够从已保存的执行进度继续运行。**

```shell
开始执行
   ↓
执行节点 A
   ↓
保存执行进度
   ↓
执行节点 B
   ↓
保存执行进度
   ↓
服务器崩溃
   ↓
服务恢复
   ↓
读取已保存的执行进度
   ↓
从未完成的工作继续执行
```

它的实际机制是：

1. 保存 Graph 的执行状态和 Checkpoint。
2. 记录已经完成的执行任务。
3. 服务恢复后重新启动 Graph。
4. 根据持久化记录恢复执行流程。

### Durable Execution 与 Checkpointer 的关系

在 LangGraph 中，只要 Graph 配置了 Checkpointer，就已经具备 Durable Execution 的基础能力。

它们之间的关系是：

| 概念              | 作用                                           |
| ----------------- | ---------------------------------------------- |
| Checkpointer      | 负责保存和读取执行状态                         |
| Checkpoint        | 某个执行阶段的状态快照                         |
| thread_id         | 标识一条独立的执行线程                         |
| Pending Writes    | 保存同一个 Super-step 中已经成功完成的节点写入 |
| Durable Execution | 利用持久化机制实现中断后恢复执行               |

```python
from langgraph.checkpoint.memory import InMemorySaver

checkpointer = InMemorySaver()

graph = builder.compile(
    checkpointer=checkpointer
)

config = {
    "configurable": {
        "thread_id": "refund-1001"
    }
}

result = graph.invoke(
    inputs,
    config=config
)

```

官方文档明确说明，持久化层会保存执行进度，并支持在系统故障后恢复工作流。

### 最关键的机制 Replay（重放）

在 Graph API 中，恢复的起点是发生中断的节点的开头。也就是中断节点重新执行。

这就是重放。但是也有副作用：

假如发生退款

```shell
调用支付接口
   ↓
支付平台已经扣款
   ↓
服务器突然崩溃
   ↓
LangGraph 还没有成功保存该节点的结果
```

**恢复时,退款节点节点重新执行，那么就会二次退款。**

所以 Durable Execution 不是简单地保存 State，还必须解决副作用重复执行的问题。

### Idempotency：幂等性

#### 什么是幂等性？

幂等性（Idempotency）指：

**同一个操作执行一次或多次，最终产生的业务效果相同。**

例如：

| 操作                 | 是否适合做成幂等 |
| -------------------- | ---------------- |
| 查询订单             | 天然适合         |
| 查询商品             | 天然适合         |
| 设置订单状态为已支付 | 可以设计成幂等   |
| 创建退款申请         | 应使用幂等键     |
| 执行扣款             | 必须防止重复扣款 |
| 发送邮件             | 需要防止重复发送 |

假设退款订单 ID 是：“refund-1001”。我们可以将它作为幂等键：

```shell
idempotency_key = "refund-1001"
```

第一次调用：

```python
refund_api.create(
    amount=100,
    idempotency_key="refund-1001"
)
```

如果服务器崩溃，恢复后再次调用：只要第三方支付平台正确支持幂等键，重复请求就不会创建第二笔退款，而是返回第一次操作的结果。

#### 幂等设计

```shell
业务操作
   ↓
生成唯一幂等键
   ↓
查询操作是否已经完成
   ↓
已经完成？
   ├── 是 → 返回之前的结果
   │
   └── 否 → 执行业务操作
                ↓
             保存操作结果
                ↓
             返回结果
```

```python
def refund_service(
    order_id: str,
    amount: int
):
    idempotency_key = f"refund:{order_id}"

    # 查询之前是否已经执行过
    existing = database.get_refund(
        idempotency_key
    )

    if existing:
        return existing

    # 执行退款
    result = payment_api.refund(
        amount=amount,
        idempotency_key=idempotency_key
    )

    # 保存退款结果
    database.save_refund(
        idempotency_key=idempotency_key,
        result=result
    )

    return result
```

这是示意代码，生产实现还必须处理并发请求、数据库唯一约束、支付平台请求超时后的结果核对，以及数据库与第三方系统之间的一致性问题。

生产环境通常需要结合：

- 数据库唯一约束。
- 事务或原子状态转换。
- 第三方 API 幂等键。
- 操作状态查询。
- 必要时使用 Outbox / 补偿机制。

### Node 拆分：让恢复执行更安全

```python
def refund_node(state):

    # 操作 1：检查退款资格
    check_eligibility(state)

    # 操作 2：调用支付平台退款
    refund_result = payment_api.refund(
        state["amount"]
    )

    # 操作 3：发送退款通知
    send_email(state["email"])

    return {
        "refund_result": refund_result,
        "status": "success"
    }
```

如果操作 2 已经成功，但操作 3 失败，整个节点就没有成功完成。

恢复执行时，整个节点可能重新执行，导致：

- 再次检查退款资格。
- 再次发起退款。
- 再次发送通知。

这会增加重复操作的风险。

#### 拆分节点

把节点按照操作去拆分，然后分别记录节点的执行结果。

如果 `send_email` 失败，而之前节点已经成功记录，那么恢复时就可以复用之前的完成结果，从失败节点重新开始。

### Durability Modes：持久化模式

| 模式    | 保存方式                                       | 性能     | 持久化保障                   |
| ------- | ---------------------------------------------- | -------- | ---------------------------- |
| `exit`  | Graph 退出时保存变更                           | 较好     | 执行中崩溃可能丢失中间进度   |
| `async` | 异步保存，执行与写入可以重叠                   | 较好     | 崩溃时可能丢失尚未写入的进度 |
| `sync`  | 当前阶段的 Checkpoint 写入完成后再进入下一阶段 | 相对较低 | 更高的执行进度持久化保障     |

```python
for chunk in graph.stream(
    inputs,
    config=config,
    durability="exit"
):
    print(chunk)
```

应该选择哪一种？

| 场景                       | 建议考虑                           |
| -------------------------- | ---------------------------------- |
| 开发调试、普通演示         | `async`                            |
| 普通对话 Agent             | 根据恢复要求选择 `async` 或 `sync` |
| 长时间运行的关键工作流     | `sync`                             |
| 可以接受中间进度丢失的任务 | `exit`                             |

### 示例

```python
from typing_extensions import TypedDict
  
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import InMemorySaver

class State(TypedDict):
    order_id: str
    prepared: bool
    processed: bool
    report: str
      
def prepare_node(state: State):
    print("准备订单")

    return {
        "prepared": True
    }


# 模拟第一次失败
attempts = 0


def process_node(state: State):
    global attempts

    attempts += 1

    print(f"处理订单，第 {attempts} 次尝试")

    if attempts == 1:
        raise RuntimeError("模拟服务临时故障")

    return {
        "processed": True
    }


def report_node(state: State):
    print("生成报告")

    return {
        "report": f"订单 {state['order_id']} 处理成功"
    }



builder = StateGraph(State)

builder.add_node("prepare", prepare_node)
builder.add_node("process", process_node)
builder.add_node("report", report_node)

builder.add_edge(START, "prepare")
builder.add_edge("prepare", "process")
builder.add_edge("process", "report")
builder.add_edge("report", END)

checkpointer = InMemorySaver()

graph = builder.compile(
    checkpointer=checkpointer
)

# 第一次执行：模拟失败
config = {
    "configurable": {
        "thread_id": "order-1001"
    }
}

try:
    graph.invoke(
        {
            "order_id": "1001",
            "prepared": False,
            "processed": False,
            "report": ""
        },
        config=config
    )

except RuntimeError as error:
    print("Graph 执行失败：", error)

# 第二次执行：恢复 Graph    
result = graph.invoke(
    None,
    config=config
)

print(result)
```

## Functional API

前面学习 LangGraph 时，我们主要使用的是 StateGraph API：

```python
builder = StateGraph(State)

builder.add_node("search", search_node)
builder.add_node("summary", summary_node)

builder.add_edge(START, "search")
builder.add_edge("search", "summary")
builder.add_edge("summary", END)

graph = builder.compile()
```

这种方式需要显式定义：

- State
- Node
- Edge
- Conditional Edge
- Graph

但在实际开发中，有些工作流本身就是普通的 Python 函数流程。

例如：

```shell
接收用户问题
    ↓
搜索资料
    ↓
分析资料
    ↓
生成报告
    ↓
返回结果
```

如果只是为了实现这样的流程，还要创建 StateGraph、定义 State、配置节点和边，就可能显得比较繁琐。

LangGraph 因此提供了另一种构建方式：Functional API。

它允许我们使用接近普通 Python 函数的方式构建工作流，同时保留 LangGraph 的持久化执行、Checkpoint、Interrupt 和恢复能力。

### Functional API 的核心组成

两个核心装饰器：

- `@entrypoint`：定义工作流入口。
- `@task`：定义一个可以被持久化执行的任务。

#### @entrypoint

`@entrypoint` 用来定义整个工作流的入口。

```python
from langgraph.func import entrypoint


@entrypoint()
def my_workflow(user_input: str):
    return f"收到用户问题：{user_input}"
  
result = my_workflow.invoke("帮我分析 LangGraph")

print(result)
```

#### @task

`@task` 用来定义一个工作流中的独立任务。

```python
from langgraph.func import task

@entrypoint()
def workflow(keyword: str):

    future = search_task(keyword)

    result = future.result()

    return result


@task
def search_task(keyword: str):
    print("正在搜索：", keyword)

    return [
        "资料 A",
        "资料 B",
        "资料 C"
    ]

```

### 示例

通过一个完整的商品分析工作流理解 Functional API。

```python
from langgraph.func import task, entrypoint  # Functional API：普通函数控制流，不声明节点/边


@task
def search_task(product: str) -> list[str]:
    # @task 把函数变成「可 checkpoint 的工作单元」。调用它不会直接返回值，
    # 而是返回 future-like 对象，需要 .result()（async 下用 await）取值。
    print("正在搜索商品：", product)
    return [
        f"{product} 的价格是 5000 元",
        f"{product} 的用户评价较好",
        f"{product} 的主要优点是性能强",
    ]


@task
def analyze_task(documents: list[str]) -> str:
    print("正在分析商品资料")
    return "\n".join(documents)


@task
def summary_task(content: str) -> str:
    print("正在生成总结")
    return f"商品分析报告：\n{content}"


@entrypoint()
def product_workflow(product: str):
    # @entrypoint 把函数包装成 Pregel 工作流对象，可用 .invoke() / .ainvoke()。
    # 函数只接受一个位置参数作为输入；要传多个值就传 dict。
    # Functional API 没有共享 State：中间结果靠局部变量 + 函数参数传递，不需要 reducer。
    #
    # 这里三步是严格串行依赖（搜索 → 分析 → 总结），立刻 .result() 没问题。
    # 若有多个互不依赖的 task，应先收集 future 再统一取结果才能并行：
    #   futures = [some_task(x) for x in items]
    #   values = [f.result() for f in futures]

    # 第一步：搜索
    search_future = search_task(product)  # 调用即启动任务
    documents = search_future.result()    # .result() 才是阻塞点

    # 第二步：分析
    analyze_future = analyze_task(documents)
    analysis = analyze_future.result()

    # 第三步：总结
    summary_future = summary_task(analysis)
    summary = summary_future.result()

    return summary  # 这个返回值就是 .invoke() 的最终结果


result = product_workflow.invoke("iPhone")
print(result)
# 正在搜索商品： iPhone
# 正在分析商品资料
# 正在生成总结
# 商品分析报告：
# iPhone 的价格是 5000 元
# iPhone 的用户评价较好
# iPhone 的主要优点是性能强

```

### 普通函数与 Task 的区别

| 对比                | 普通 Python 函数 | LangGraph Task       |
| ------------------- | ---------------- | -------------------- |
| 普通函数调用        | 支持             | 支持                 |
| 独立任务记录        | 不具备           | 支持                 |
| Checkpoint 结果复用 | 不具备           | 支持                 |
| RetryPolicy         | 需自行实现       | 支持配置             |
| Task Timeout        | 需自行实现       | 支持配置             |
| 并行调度            | 需自行实现       | 可以通过 Future 实现 |

需要注意：

- Task 只能在 EntryPoint 或 StateGraph 的执行上下文中调用。
- 启用 Checkpointer 后，Task 的输入和输出必须可以序列化。
- Task 的结果通过 Future 获取。
- Task 的持久化依赖工作流配置了 Checkpointer。

另外，Task 装饰器本身不会自动给普通函数增加数据库事务或外部副作用的 exactly-once 保证。

### Functional API 的并行执行

```python
from langgraph.func import task, entrypoint


@task
def price_task(product: str):
    return "价格分析：5000 元"


@task
def quality_task(product: str):
    return "质量分析：整体质量良好"


@task
def review_task(product: str):
    return "评价分析：用户评价较好"
  


@entrypoint()
def product_workflow(product: str):

    # 同时提交三个 Task
    price_future = price_task(product)
    quality_future = quality_task(product)
    review_future = review_task(product)

    # 获取结果
    price = price_future.result()
    quality = quality_future.result()
    review = review_future.result()

    return {
        "price": price,
        "quality": quality,
        "review": review
    }
  
result = product_workflow.invoke("iPhone")

print(result)
```

**并行发生在 Task 被提交的时候，而不是调用 `.result()` 的时候。**

如果写成

```python
price = price_task(product).result()
quality = quality_task(product).result()
review = review_task(product).result()
```

就会先等待价格任务完成，再提交质量任务，最后提交评价任务，无法实现这种并行提交方式。

### Functional API 的异步执行

```python
from langgraph.func import entrypoint, task
import asyncio


@task
async def search_task(keyword: str):

    await asyncio.sleep(2)

    return [
        "搜索结果 A",
        "搜索结果 B"
    ]

  
@entrypoint()
async def workflow(keyword: str):

    future = search_task(keyword)

    result = await future

    return result
  
result = await workflow.ainvoke("LangGraph")
```

#### 异步并行执行

```python
import asyncio

from langgraph.func import entrypoint, task


@task
async def price_task(product: str):
    await asyncio.sleep(2)
    return "价格分析完成"


@task
async def quality_task(product: str):
    await asyncio.sleep(3)
    return "质量分析完成"


@task
async def review_task(product: str):
    await asyncio.sleep(2)
    return "评价分析完成"


@entrypoint()
async def workflow(product: str):

    price_future = price_task(product)
    quality_future = quality_task(product)
    review_future = review_task(product)

    results = await asyncio.gather(
        price_future,
        quality_future,
        review_future
    )

    return results
  
result = await workflow.ainvoke("iPhone")
```

### Functional API + Checkpointer：实现持久化执行

```python
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.func import entrypoint, task


checkpointer = InMemorySaver()

@task
def generate_report(topic: str):

    print("正在生成报告")

    return f"{topic} 的分析报告"

# 绑定 checkpointer
@entrypoint(checkpointer=checkpointer)
def workflow(topic: str):

    future = generate_report(topic)

    report = future.result()

    return report

  
config = {
    "configurable": {
        "thread_id": "report-001"
    }
}

result = workflow.invoke(
    "LangGraph",
    config=config
)

print(result)
```

### Functional API + Interrupt：实现人工审批

```python
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.func import task, entrypoint
from langgraph.types import interrupt
from langgraph.types import Command

checkpointer = InMemorySaver()

@task
def generate_article(topic: str):

    print("正在生成文章")

    return f"这是一篇关于 {topic} 的文章。"



@entrypoint(checkpointer=checkpointer)
def article_workflow(topic: str):

    # 生成文章
    future = generate_article(topic)

    article = future.result()

    # 暂停，等待人工审核
    review = interrupt({
        "question": "请审核文章",
        "article": article
    })

    return {
        "article": article,
        "review": review
    }

config = {
    "configurable": {
        "thread_id": "article-001"
    }
}

# 第一次执行：暂停
result = article_workflow.invoke(
    "人工智能",
    config=config
)

print(result)


# 人工审核后恢复
result = article_workflow.invoke(
    Command(
        resume="审核通过"
    ),
    config=config
)

print(result)
```

### Runtime Context 和 Store

```python
from langgraph.func import entrypoint, task
from langgraph.store.memory import InMemoryStore
from langgraph.config import get_store
from langgraph.runtime import Runtime, get_runtime


#  ==================== Runtime Context ========================
@dataclass
class Context:
    user_id: str
    model: str = "gpt-5.5"
      
# 方案 A：task 内部直接取（官方 API）
@task
def fetch_profile(doc_id: str) -> dict:
    runtime = get_runtime(Context)          # 从当前 run 的上下文变量里拿
    return {
        "user_id": runtime.context.user_id,
        "model": runtime.context.model,
        "doc_id": doc_id,
    }

# 方案 B（更推荐）：entrypoint 注入后，把原始值显式传进 task
@task
def fetch_profile(doc_id: str, user_id: str) -> dict:
    return {"user_id": user_id, "doc_id": doc_id}

  
@entrypoint()
def workflow(payload: dict, *, runtime: Runtime[Context]) -> dict:
  	# 获取上下文
    ctx = runtime.context
    # 传入上下文
    return fetch_profile(payload["doc_id"], ctx.user_id).result()

  
# ======================= Store ==================================   



store = InMemoryStore()

store.put(
    ("users", "user-001", "preferences"),
    "language",
    {
        "language": "zh-CN"
    }
)
@task
def get_user_preference(user_id: str):

    user_store = get_store()

    item = user_store.get(
        ("users", user_id, "preferences"),
        "language"
    )

    return item.value


@entrypoint(store=store)
def workflow(user_id: str):

    future = get_user_preference(user_id)

    return future.result()
  
result = workflow.invoke("user-001")

print(result)
```

### Task 的 RetryPolicy 和 Timeout

```python
@task(
    timeout=5,
    retry_policy=RetryPolicy(
        max_attempts=3
    )
)
def search_task(keyword: str):

    return search_service.search(keyword)
```

### 什么时候选择 Functional API？

如果你的工作流：

- 已经是一套成熟的 Python 函数。
- 主要使用顺序执行、if/else 和循环。
- 想为已有 Python Agent 增加 Checkpoint。
- 想让已有工作流支持 Interrupt 和恢复。
- 希望把其他 Agent 框架包装进 LangGraph 的运行能力中。
