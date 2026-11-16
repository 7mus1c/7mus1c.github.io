# **Agent 原理与手写实现**

## 1. ReAct（Reasoning + Acting）

### 一、ReAct 核心概念

ReAct 是 Reasoning（推理）与 Acting（行动）的组合，是一种通过交替执行推理、工具行动和观察结果来完成任务的 Agent 执行模式。

核心循环：

```text
用户输入
   ↓
Reasoning：分析当前任务
   ↓
Acting：选择并调用工具
   ↓
Observation：获取工具执行结果
   ↓
将结果反馈给模型
   ↓
继续推理或生成最终答案
```

ReAct 的核心思想：

不要求模型在第一次回答时就掌握所有完成任务所需的信息，而是允许模型在执行过程中通过工具获取外部信息，并根据观察结果动态调整后续行动。

### 二、ReAct 的三个核心组成部分

| 组成 | 英文        | 作用                         |
| ---- | ----------- | ---------------------------- |
| 推理 | Reasoning   | 分析任务并决定下一步行动     |
| 行动 | Acting      | 调用工具或执行外部操作       |
| 观察 | Observation | 获取工具执行结果并反馈给模型 |

三者构成循环执行机制。

注意：Reasoning 不等于必须将模型完整的内部思维过程展示出来。生产环境可以记录结构化决策摘要、工具调用参数和执行结果，而不暴露模型的私有推理内容。

### 三、ReAct 与普通 Tool Calling 的区别

Tool Calling 是模型调用工具的一种接口能力或协议机制；ReAct 是组织 Agent 决策和执行过程的一种模式。

| 对比                     | 普通 Tool Calling      | ReAct                |
| ------------------------ | ---------------------- | -------------------- |
| 核心                     | 模型发起工具调用       | 推理、行动、观察循环 |
| 是否必须调用工具         | 不一定                 | 不一定               |
| 是否根据工具结果继续决策 | 可以，但不一定形成循环 | 核心机制             |
| 是否支持多轮工具调用     | 支持                   | 支持                 |
| 关注重点                 | 工具调用协议           | Agent 决策过程       |

ReAct 可以通过 Function Calling 实现，但 Function Calling 本身不等于 ReAct。

### 四、ReAct 解决的问题

1. 解决一次性回答的信息不足：允许模型通过工具获取实时业务数据。
2. 解决固定流程无法适应动态情况：根据每一步的观察结果决定后续操作。
3. 解决工具结果无法影响后续决策：将工具结果重新放入上下文，作为下一轮决策依据。
4. 支持多步骤任务：通过连续工具调用完成复杂任务。

### 五、ReAct 核心运行机制

一个典型的 ReAct 执行流程：

1. 接收用户任务。
2. 构建模型上下文。
3. 调用 LLM 进行决策。
4. 判断是否请求工具调用。
5. 如果需要调用工具，校验工具名称和参数。
6. 通过 Runtime 执行工具。
7. 将工具执行结果作为 Observation 写入消息历史。
8. 再次调用模型。
9. 判断是否继续调用工具或生成最终答案。
10. 达到结束条件后终止执行。

核心流程：

```text
接收任务
   ↓
构建上下文
   ↓
调用 LLM
   ↓
是否调用工具？
   ├── 是
   │    ↓
   │  校验工具与参数
   │    ↓
   │  权限检查
   │    ↓
   │  执行工具
   │    ↓
   │  记录 Observation
   │    ↓
   │  返回模型继续决策
   │
   └── 否
        ↓
      生成最终答案
        ↓
       结束
```

### 六、ReAct 的核心数据结构

一个简化的 Agent State：

```python
state = {
    "user_input": "查询订单 A10086 的物流状态",
    "messages": [],
    "steps": [],
    "tool_results": [],
    "final_answer": None,
}
```

字段说明：

| 字段         | 作用                     |
| ------------ | ------------------------ |
| user_input   | 用户原始任务             |
| messages     | 模型与工具交互的消息历史 |
| steps        | Agent 执行步骤           |
| tool_results | 工具执行结果             |
| final_answer | 最终回答                 |

该结构是自定义的简化状态设计，不是 ReAct 规定的数据结构。

### 七、ReAct 的结束条件

常见结束条件：

- 模型生成最终答案。
- 达到最大执行步数。
- 超过整体执行时间。
- 工具执行失败且无法恢复。
- 用户取消任务。
- 命中安全策略。
- 等待人工审批或外部事件。

生产环境不能只依赖模型自行判断何时结束，需要在 Runtime 中实现执行限制。

例如：

```python
MAX_STEPS = 10
MAX_TOOL_CALLS = 8
```

### 八、手写 ReAct Agent

ReAct 的最小实现包含：

1. call_model：模型决策。
2. execute_tool：执行工具。
3. messages：维护交互历史。
4. run：控制 Agent Loop。

核心代码：

```python
for step in range(max_steps):

    decision = call_model(messages)

    if decision["type"] == "final":
        return decision["content"]

    if decision["type"] == "tool_call":

        observation = execute_tool(
            decision["tool"],
            decision["arguments"],
        )

        messages.append({
            "role": "tool",
            "content": str(observation),
        })
```

核心机制：

- call_model 对应 Reasoning。
- execute_tool 对应 Acting。
- 工具结果写入 messages 对应 Observation。
- for 循环负责控制整个 Agent 执行过程。

真实生产实现还需要模型消息协议、参数 Schema 校验、工具权限、超时、重试、幂等、持久化、人工审批等机制。

### 九、ReAct 与 LangChain、LangGraph、Deep Agents 的关系

#### 1. ReAct 与 LangChain

LangChain 提供模型、工具、消息、Agent 构建等开发能力。

可以使用 `create_agent` 构建具有工具调用循环的 Agent。

```python
from langchain.agents import create_agent
from langchain.tools import tool


@tool
def get_order(order_id: str) -> dict:
    """根据订单 ID 查询订单信息"""
    return {
        "order_id": order_id,
        "status": "shipped",
    }


agent = create_agent(
    model="your-model",
    tools=[get_order],
    system_prompt="你是一个企业售后助手。",
)
```

LangChain 提供 Agent 构建和运行时能力，ReAct 描述推理、行动、观察的执行模式。

#### 2. ReAct 与 LangGraph

LangGraph 可以将 ReAct 执行循环显式表达为图：

```text
        Model
          │
     是否调用工具？
       /      \
     是        否
     │         │
   Tools      END
     │
     └──────> Model
```

主要组成：

- Model 节点：模型决策。
- Tools 节点：执行工具。
- 条件边：判断是否继续调用工具。
- State：保存执行上下文。
- Checkpointer：持久化图状态。

LangGraph 可以进一步加入人工审批、异常处理、条件分支、重试、状态恢复和执行轨迹追踪。

#### 3. ReAct 与 Deep Agents

Deep Agents 在基础 Agent 能力之上，进一步集成规划、任务拆解、Subagents、Filesystem、Skills、Memory 等高级能力。

ReAct 仍然是理解其行动与反馈机制的重要基础，但 Deep Agents 不等同于简单的 ReAct Loop。

### 十、企业级应用场景：售后工单 Agent

用户：

“我的订单 A10086 已经超过预计送达时间了，帮我看看怎么回事。”

执行过程：

```text
用户任务
   ↓
查询订单
   ↓
获取订单状态
   ↓
判断是否需要查询物流
   ↓
查询物流
   ↓
获取物流进度
   ↓
判断是否需要查询售后规则
   ↓
查询售后规则
   ↓
判断是否需要升级工单
   ↓
申请人工审批
   ↓
审批通过后创建工单
```

ReAct 负责动态决定查询顺序和下一步行动。

外层 Workflow 负责固定业务流程和风险控制。

### 十一、Agent 执行轨迹设计

建议将 Agent 执行过程转换为结构化事件。

常见事件：

| 事件                | 记录内容            |
| ------------------- | ------------------- |
| agent_started       | 任务 ID、用户、输入 |
| model_decision      | 决策类型、简要说明  |
| tool_call_requested | 工具名称、参数      |
| tool_call_started   | 工具开始时间        |
| tool_call_completed | 返回结果、执行耗时  |
| tool_call_failed    | 错误分类、错误信息  |
| approval_requested  | 审批对象、审批原因  |
| approval_resolved   | 审批人、审批结果    |
| agent_completed     | 最终答案、总耗时    |

事件示例：

```python
{
    "event_id": "evt_001",
    "run_id": "run_001",
    "thread_id": "thread_001",
    "sequence": 1,
    "event_type": "tool_call_requested",
    "timestamp": "2026-11-16T15:00:00+08:00",
    "payload": {
        "tool_name": "get_order",
        "arguments": {
            "order_id": "A10086"
        }
    }
}
```

前端执行轨迹控制台可以基于事件实现：

- Agent 实时执行轨迹。
- 工具调用详情。
- 工具参数和结果查看。
- 执行耗时统计。
- 失败节点定位。
- 人工审批交互。
- 历史执行轨迹回放。

### 十二、技术选型与架构取舍

| 业务特点                   | 推荐方案                |
| -------------------------- | ----------------------- |
| 流程固定、规则明确         | Workflow                |
| 步骤动态、需要模型决策     | ReAct                   |
| 固定流程中包含动态决策     | Workflow + ReAct        |
| 复杂任务，需要规划和子任务 | Deep Agents / LangGraph |
| 高风险操作需要审批         | ReAct + HITL            |

企业系统通常采用混合架构：

```text
售后工单 Workflow
      │
      ├── 用户身份校验
      ├── 订单归属校验
      ├── 问题分析 Agent（ReAct）
      │       ├── 查询订单
      │       ├── 查询物流
      │       └── 查询业务规则
      ├── 风险判断
      ├── 人工审批
      └── 工单创建
```

### 十三、企业生产环境必须补充的机制

| 机制              | 目的                 |
| ----------------- | -------------------- |
| 最大执行步数      | 避免无限循环         |
| 最大工具调用次数  | 控制成本和资源       |
| 工具白名单        | 限制可用工具         |
| 参数 Schema 校验  | 防止非法参数         |
| 用户权限校验      | 防止越权操作         |
| 工具超时          | 避免请求长期阻塞     |
| Retry / Backoff   | 处理可恢复错误       |
| 幂等机制          | 防止重复执行写操作   |
| 人工审批          | 控制高风险行为       |
| Checkpointer      | 支持状态持久化和恢复 |
| Trace / Event Log | 支持审计与故障排查   |

核心原则：

模型负责提出行动建议，Runtime 负责判断行动是否可以执行。