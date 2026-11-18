# Agent 原理与手写实现

## 1. ReAct（Reasoning + Acting）

### 1.1 ReAct 核心概念

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

### 1.2 ReAct 的三个核心组成部分

| 组成 | 英文        | 作用                         |
| ---- | ----------- | ---------------------------- |
| 推理 | Reasoning   | 分析任务并决定下一步行动     |
| 行动 | Acting      | 调用工具或执行外部操作       |
| 观察 | Observation | 获取工具执行结果并反馈给模型 |

三者构成循环执行机制。

注意：Reasoning 不等于必须将模型完整的内部思维过程展示出来。生产环境可以记录结构化决策摘要、工具调用参数和执行结果，而不暴露模型的私有推理内容。

### 1.3 ReAct 与普通 Tool Calling 的区别

Tool Calling 是模型调用工具的一种接口能力或协议机制；ReAct 是组织 Agent 决策和执行过程的一种模式。

| 对比                     | 普通 Tool Calling      | ReAct                |
| ------------------------ | ---------------------- | -------------------- |
| 核心                     | 模型发起工具调用       | 推理、行动、观察循环 |
| 是否必须调用工具         | 不一定                 | 不一定               |
| 是否根据工具结果继续决策 | 可以，但不一定形成循环 | 核心机制             |
| 是否支持多轮工具调用     | 支持                   | 支持                 |
| 关注重点                 | 工具调用协议           | Agent 决策过程       |

ReAct 可以通过 Function Calling 实现，但 Function Calling 本身不等于 ReAct。

### 1.4 ReAct 解决的问题

1. 解决一次性回答的信息不足：允许模型通过工具获取实时业务数据。
2. 解决固定流程无法适应动态情况：根据每一步的观察结果决定后续操作。
3. 解决工具结果无法影响后续决策：将工具结果重新放入上下文，作为下一轮决策依据。
4. 支持多步骤任务：通过连续工具调用完成复杂任务。

### 1.5 ReAct 核心运行机制

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

### 1.6 ReAct 的核心数据结构

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

### 1.7 ReAct 的结束条件

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

### 1.8 手写 ReAct Agent

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

### 1.9 ReAct 与 LangChain、LangGraph、Deep Agents 的关系

#### 1.9.1 ReAct 与 LangChain

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

#### 1.9.2 ReAct 与 LangGraph

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

#### 1.9.3 ReAct 与 Deep Agents

Deep Agents 在基础 Agent 能力之上，进一步集成规划、任务拆解、Subagents、Filesystem、Skills、Memory 等高级能力。

ReAct 仍然是理解其行动与反馈机制的重要基础，但 Deep Agents 不等同于简单的 ReAct Loop。

### 1.10 企业级应用场景：售后工单 Agent

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

### 1.11 Agent 执行轨迹设计

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

### 1.12 技术选型与架构取舍

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

### 1.13 企业生产环境必须补充的机制

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

## 2. Reflection: 反思机制

### 2.1 核心概念

Reflection 是指 Agent 对自己生成的结果或执行过程进行检查、评价，并根据检查结果进行修改的机制。

标准执行流程：

```text
用户输入
   ↓
Generate：生成初始结果
   ↓
Evaluate：评估结果
   ↓
Reflect：分析问题
   ↓
Revise：修正结果
   ↓
Repeat：再次评估
   ↓
达到终止条件
   ↓
返回最终结果
```

Reflection 的核心目标是通过评价反馈提高 Agent 输出质量。

### 2.2 Reflection 的核心组成

| 组成           | 作用                   |
| -------------- | ---------------------- |
| Generator      | 生成初始结果           |
| Evaluator      | 判断结果是否符合要求   |
| Feedback       | 提供具体问题和改进建议 |
| Reflector      | 分析问题并指导修改     |
| Revision       | 根据反馈修改结果       |
| Stop Condition | 控制反思循环终止       |

Evaluator 负责判断结果是否合格，Reflector 负责分析问题并提出修正方向。

实际工程中，Evaluator 和 Reflector 可以由同一个模型承担，也可以由不同模型、规则引擎或人工审核承担。

### 2.3 Reflection 解决的问题

1. 解决模型一次生成不够准确的问题。
2. 解决复杂任务缺乏自我检查的问题。
3. 解决生成结果缺乏明确质量标准的问题。
4. 通过外部反馈修正代码、SQL、报告和业务方案。
5. 让输出经过检查后再交付用户。

### 2.4 Reflection 的常见模式

#### 2.4.1 Self-Reflection

同一个模型负责生成、评估和修改。

优点：

- 架构简单。
- 实现成本低。
- 不需要额外部署评估模型。

缺点：

- 模型可能无法发现自己的错误。
- 自我评价可能不稳定。
- 容易出现自我肯定。

#### 2.4.2 Critic-Revision

生成者和批评者分开。

```text
Generator
   ↓
生成结果
   ↓
Critic
   ↓
指出问题
   ↓
Generator
   ↓
修正结果
```

优点是生成与评价职责分离，便于独立优化评价机制。

缺点是增加模型调用次数、延迟和成本。

#### 2.4.3 Generate-Verify-Repair

将生成、确定性校验、语义评估和修复结合起来。

```text
生成结果
   ↓
确定性校验
   ↓
语义评估
   ↓
反馈
   ↓
修正
   ↓
再次验证
```

适合企业工程场景。

能够通过程序确定性验证的内容，应优先使用程序，而不是完全依赖 LLM。

#### 2.4.4 External Feedback

使用外部环境产生的真实反馈指导修改。

例如：

- 代码生成后执行 Pytest。
- SQL 生成后执行数据库验证。
- API 调用后检查响应。
- RAG 生成后检查检索证据。
- 业务方案生成后执行规则检查。

### 2.5 Reflection 核心运行机制

```text
初始结果
   ↓
Evaluator
   ↓
是否通过？
   ├── 是 → 返回结果
   │
   └── 否
        ↓
      生成反馈
        ↓
      Reflector
        ↓
      Revision
        ↓
      再次评估
```

伪代码：

```python
current_output = generate(task)

for iteration in range(max_iterations):

    evaluation = evaluate(current_output)

    if evaluation.passed:
        return current_output

    feedback = reflect(
        current_output,
        evaluation,
    )

    current_output = revise(
        current_output,
        feedback,
    )
```

### 2.6 Reflection 反馈设计

不推荐使用模糊反馈：

```text
答案不够好，请重新回答。
```

推荐使用结构化反馈：

```json
{
  "passed": false,
  "score": 0.65,
  "issues": [
    {
      "type": "missing_evidence",
      "description": "没有提供物流查询结果作为依据"
    }
  ],
  "suggestions": [
    "查询最新物流信息",
    "检查配送承诺日期"
  ]
}
```

结构化反馈便于程序解析、模型修正和执行轨迹记录。

### 2.7 Reflection 终止机制

常见终止条件：

- 评估通过。
- 达到最大迭代次数。
- 超过总执行时间。
- 超过模型调用预算。
- 多轮修改没有明显改善。
- 触发安全规则。
- 需要人工介入。

示例：

```python
MAX_REFLECTION_ROUNDS = 3
```

模型评估分数不一定具有可靠的概率意义，不能将 0.85 直接理解为真实正确率达到 85%。

### 2.8 手写 Reflection Agent

核心结构：

```python
class ReflectionAgent:

    def generate(self, task):
        pass

    def evaluate(self, output):
        pass

    def reflect(self, output, evaluation):
        pass

    def revise(self, output, feedback):
        pass

    def run(self, task):
        current_output = self.generate(task)

        for iteration in range(self.max_iterations):

            evaluation = self.evaluate(current_output)

            if evaluation.passed:
                return current_output

            feedback = self.reflect(
                current_output,
                evaluation,
            )

            current_output = self.revise(
                current_output,
                feedback,
            )
```

各方法职责：

- generate：产生初始结果。
- evaluate：判断结果质量。
- reflect：分析问题。
- revise：根据反馈修改。
- run：控制完整反思循环。

### 2.9 Reflection 与 ReAct 的区别

| 对比         | ReAct                | Reflection             |
| ------------ | -------------------- | ---------------------- |
| 核心目标     | 完成任务、与环境交互 | 提高结果质量           |
| 核心循环     | 推理、行动、观察     | 生成、评估、反思、修正 |
| 主要输入     | 用户任务、工具结果   | 初始结果、评价反馈     |
| 主要输出     | 工具行动或最终答案   | 修正后的结果           |
| 是否依赖工具 | 通常使用工具         | 不一定                 |

ReAct 关注下一步应该做什么。

Reflection 关注刚才的结果是否正确，以及如何改进。

两者可以组合使用。

### 2.10 Reflection 与 LangChain、LangGraph、Deep Agents

#### 2.10.1 LangChain

可以使用多个 Runnable 或模型调用组合 Generator、Evaluator 和 Revision。

LangChain 提供组件和调用能力，具体评价规则、迭代逻辑和停止条件需要开发者设计。

#### 2.10.2 LangGraph

推荐将反思过程设计成图：

```text
START
  ↓
Generate
  ↓
Evaluate
  ↓
条件判断
  ├── 通过 → END
  └── 不通过
         ↓
       Reflect
         ↓
       Revise
         ↓
       Evaluate
```

State 示例：

```python
state = {
    "task": "...",
    "draft": "...",
    "feedback": [],
    "iteration": 0,
    "passed": False,
    "final_output": None,
}
```

LangGraph 的价值：

- 执行流程显式化。
- 每轮结果可追踪。
- 控制最大迭代次数。
- 节点级异常处理。
- Checkpointer 持久化。
- 人工介入和恢复执行。

#### 2.10.3 Deep Agents

Reflection 可以作为 Deep Agents 中的任务执行策略或质量检查环节。

它不是 Deep Agents 自动开启的、保证所有输出正确的内置功能，需要开发者设计具体节点、工具或 Middleware。

### 2.11 企业级应用场景

#### 2.11.1 售后处理方案审核

先通过 ReAct 查询订单、物流和售后规则，再通过 Reflection 检查处理方案是否符合业务要求。

#### 2.11.2 RAG 回答质量检查

检查生成答案是否与检索证据一致，避免遗漏特殊商品规则或错误归纳业务政策。

#### 2.11.3 SQL 生成与修复

通过 SQL Parser、只读权限检查和数据库执行结果，反馈 SQL 错误并指导模型修正。

#### 2.11.4 代码生成与测试修复

通过编译器、静态分析和 Pytest 的实际结果指导模型修复代码。

### 2.12 Evaluator 技术选型

| 检查内容   | 推荐方式               |
| ---------- | ---------------------- |
| JSON 格式  | Pydantic / JSON Schema |
| 必填字段   | 程序校验               |
| 金额范围   | 确定性业务规则         |
| 用户权限   | 权限服务               |
| 订单状态   | 业务数据库             |
| 事实一致性 | 工具数据比对           |
| 语义完整性 | LLM Evaluator          |
| 表达质量   | LLM Evaluator          |
| 高风险决策 | 规则引擎 + 人工审批    |

核心原则：

能够用确定性程序验证的内容，不要全部交给 LLM 评估。

### 2.13 Reflection 成本与质量控制

假设 Generator 调用一次，Evaluator 和 Revision 每轮各调用一次，最大反思次数为 3。

最坏情况下：

```text
1 次初始生成
3 次评估
3 次修正
----------------
共 7 次模型调用
```

成本优化方式：

1. 优先执行低成本规则校验。
2. 只有需要语义判断时才调用 Evaluator。
3. 限制最大反思次数。
4. 使用合适的小模型进行简单评价。
5. 检测重复反馈和无进展迭代。
6. 记录每次迭代的成本和质量变化。

建议保存每轮候选结果，比较质量后选择最佳版本，不要默认最后一次生成就是最好的结果。

## 3. Plan-and-Execute：规划与执行模式

### 3.1 核心概念

Plan-and-Execute 是一种先规划、后执行的 Agent 架构模式。

核心流程：

```text
用户任务
   ↓
Planner：制定整体计划
   ↓
生成任务列表
   ↓
Executor：逐步执行任务
   ↓
检查执行结果
   ↓
Replanner：必要时调整计划
   ↓
完成任务
```

核心思想：

将复杂任务拆分为多个可执行步骤，先形成整体执行计划，再按照计划执行，并根据实际执行结果动态调整后续步骤。

### 3.2 核心组成

| 组成       | 英文            | 作用                     |
| ---------- | --------------- | ------------------------ |
| 规划器     | Planner         | 分析目标并制定执行计划   |
| 执行器     | Executor        | 执行计划中的具体任务     |
| 执行状态   | Execution State | 保存计划、进度和执行结果 |
| 重新规划器 | Replanner       | 根据执行结果调整计划     |
| 终止判断   | Stop Condition  | 判断任务是否完成         |

其中 Planner 和 Executor 是核心组件，Replanner 是复杂任务中的重要增强能力。

### 3.3 Plan-and-Execute 解决的问题

1. 复杂任务缺少全局规划。
2. 多步骤任务容易遗漏或重复执行。
3. 执行过程缺少清晰的任务状态。
4. 任务执行结果与原始计划可能不一致。
5. 难以追踪任务进度和执行过程。
6. 需要根据新信息动态调整剩余任务。

### 3.4 核心运行机制

#### 3.4.1 Planner 制定计划

根据用户目标生成结构化任务列表。

示例：

```python
plan = {
    "goal": "调查物流延迟并判断退款资格",
    "steps": [
        {
            "id": "step_1",
            "task": "查询订单",
            "status": "pending",
        },
        {
            "id": "step_2",
            "task": "查询物流",
            "status": "pending",
        },
        {
            "id": "step_3",
            "task": "分析物流异常",
            "status": "pending",
        },
        {
            "id": "step_4",
            "task": "查询退款规则",
            "status": "pending",
        },
        {
            "id": "step_5",
            "task": "判断退款资格",
            "status": "pending",
        },
    ],
}
```

企业级任务定义建议包含：

- 任务 ID。
- 任务名称。
- 任务描述。
- 输入参数。
- 依赖任务。
- 执行状态。
- 输出结果。
- 失败处理策略。

#### 3.4.2 Executor 执行计划

Executor 读取计划并执行其中的任务。

一个 Task 不一定等于一次 Tool Call。

一个任务可以包含：

- 一次 LLM 调用。
- 一次工具调用。
- 一个确定性业务函数。
- 一个子 Agent。
- 一个需要人工处理的步骤。

#### 3.4.3 Execution State 维护状态

建议使用以下状态：

| 状态              | 含义                 |
| ----------------- | -------------------- |
| pending           | 等待执行             |
| running           | 正在执行             |
| completed         | 已完成               |
| failed            | 执行失败             |
| blocked           | 被依赖或业务条件阻塞 |
| awaiting_approval | 等待人工审批         |
| skipped           | 不再需要执行         |
| cancelled         | 已取消               |

示例：

```python
execution_state = {
    "task_id": "task_001",
    "current_step": "step_3",
    "status": "running",
    "results": {
        "step_1": {
            "order_status": "shipped"
        },
        "step_2": {
            "logistics_status": "delayed"
        }
    }
}
```

#### 3.4.4 Replanner 重新规划

重新规划流程：

1. 获取原始计划。
2. 获取已完成任务。
3. 获取当前执行结果。
4. 判断原计划是否仍然合理。
5. 保留有效的已完成任务。
6. 修改后续任务。
7. 生成新计划。

重新规划不应该无条件重新执行已经完成的任务。

#### 3.4.5 判断目标是否完成

必须区分：

- Task Completion：任务步骤是否完成。
- Goal Completion：用户目标是否实现。

所有任务执行结束不代表用户目标一定实现。

### 3.5 任务依赖关系

任务可以分为顺序执行和并行执行。

顺序任务：

```text
查询订单
   ↓
查询物流
   ↓
分析物流异常
```

并行任务：

```text
             查询订单
                │
         ┌──────┴──────┐
         ▼             ▼
      查询物流       查询退款规则
         │             │
         ▼             ▼
      分析物流       分析退款资格
         │             │
         └──────┬──────┘
                ▼
             汇总结果
```

可以使用 DAG（Directed Acyclic Graph，有向无环图）表达任务依赖。

任务定义示例：

```python
tasks = [
    {
        "id": "order",
        "task": "查询订单",
        "dependencies": [],
    },
    {
        "id": "logistics",
        "task": "查询物流",
        "dependencies": ["order"],
    },
    {
        "id": "refund_policy",
        "task": "查询退款规则",
        "dependencies": ["order"],
    },
    {
        "id": "final",
        "task": "汇总结果",
        "dependencies": [
            "logistics",
            "refund_policy",
        ],
    },
]
```

只有所有依赖任务都完成，当前任务才具备执行条件。

并行执行必须考虑数据依赖、共享状态冲突和业务顺序约束。

### 3.6 手写 Plan-and-Execute Agent

核心组件：

```text
PlanAndExecuteAgent
    │
    ├── planner()
    │       └── 制定初始计划
    │
    ├── executor()
    │       └── 执行单个任务
    │
    ├── update_state()
    │       └── 更新任务状态
    │
    ├── replanner()
    │       └── 调整计划
    │
    ├── is_goal_completed()
    │       └── 判断目标是否完成
    │
    └── run()
            └── 控制执行流程
```

核心伪代码：

```python
tasks = planner(goal)

while not goal_completed:

    ready_tasks = get_ready_tasks(tasks)

    for task in ready_tasks:

        result = executor(task)

        update_task_status(
            task,
            result,
        )

    if need_replanning:
        tasks = replanner(
            tasks,
            execution_results,
        )
```

关键能力：

- 显式任务计划。
- 任务依赖关系。
- 可执行任务选择。
- 执行状态维护。
- 任务结果传递。
- 目标完成判断。
- 动态重新规划。

### 3.7 Plan-and-Execute 与 ReAct、Reflection 的关系

| 对比         | ReAct            | Reflection       | Plan-and-Execute     |
| ------------ | ---------------- | ---------------- | -------------------- |
| 核心目标     | 动态执行任务     | 提高结果质量     | 管理复杂任务         |
| 核心机制     | 推理、行动、观察 | 生成、评估、修正 | 规划、执行、重新规划 |
| 关注问题     | 下一步做什么     | 结果是否正确     | 整体任务如何完成     |
| 是否需要工具 | 通常使用         | 不一定           | 视任务而定           |
| 是否需要计划 | 不强制           | 不强制           | 核心环节             |
| 是否需要反馈 | 工具观察结果     | 评估反馈         | 执行结果             |

可以记住：

- ReAct：下一步应该做什么？
- Reflection：刚才做得对不对？
- Plan-and-Execute：整个任务应该如何完成？

三者可以组合使用。

### 3.8 与 LangChain、LangGraph、Deep Agents 的关系

#### 3.8.1 LangChain

可以使用 LangChain 组合 Planner Chain、Executor Chain 和 Replanner Chain。

LangChain 提供开发组件，任务拆分、依赖关系、状态管理和重新规划策略仍需要开发者设计。

#### 3.8.2 LangGraph

LangGraph 适合实现 Plan-and-Execute。

推荐图结构：

```text
START
  ↓
Planner
  ↓
保存计划
  ↓
Executor
  ↓
更新 State
  ↓
任务是否完成？
  ├── 是 → Finalizer → END
  └── 否
       ↓
    是否需要重新规划？
       ├── 否 → Executor
       └── 是 → Replanner → 保存新计划
```

简化 State：

```python
from typing import TypedDict, Any


class PlanState(TypedDict):
    goal: str
    plan: list[dict[str, Any]]
    current_task: str
    completed_tasks: list[str]
    results: dict[str, Any]
    iteration: int
    final_answer: str
```

LangGraph 可以使用：

- State：保存任务计划和执行结果。
- 条件边：控制执行路径。
- Checkpointer：持久化图状态。
- Interrupt：支持人工介入。
- 并行节点：支持独立任务并行执行。

注意：Checkpointer 不会自动保证外部工具副作用的幂等性。

#### 3.8.3 Deep Agents

Deep Agents 提供 Planning、Task Decomposition、Subagents 等高级能力，可以支持复杂任务规划与执行。

但 Deep Agents 的高级规划能力不代表自定义 DAG 依赖、失败恢复和动态 Replanning 逻辑都自动具备，需要根据实际业务设计。

### 3.9 企业级应用场景：售后工单 Agent

用户：

“帮我调查订单 A10086 为什么延迟，判断能否退款，如果可以，准备退款申请。”

Planner 制定计划：

```text
任务一：查询订单信息
任务二：查询物流信息
任务三：分析物流异常
任务四：查询退款政策
任务五：判断退款资格
任务六：生成处理方案
任务七：准备退款申请
任务八：等待人工审批
```

执行过程中：

- Executor 逐步完成任务。
- Replanner 根据执行结果调整计划。
- Reflection 检查分析结果是否有事实依据。
- ReAct 在具体任务内部动态调用工具。
- 人工审批控制实际退款操作。

### 3.10 执行轨迹控制台设计

建议记录：

| 事件               | 说明         |
| ------------------ | ------------ |
| plan_created       | 初始计划生成 |
| task_started       | 任务开始     |
| task_completed     | 任务完成     |
| task_failed        | 任务失败     |
| task_blocked       | 任务被阻塞   |
| plan_updated       | 计划发生变化 |
| task_skipped       | 任务被跳过   |
| approval_requested | 请求人工审批 |
| approval_resolved  | 审批完成     |
| goal_completed     | 用户目标完成 |

前端可以展示：

- 整体任务进度。
- 任务依赖关系图。
- 当前执行任务。
- 已完成和失败任务。
- 每个任务的输入与输出。
- 重新规划历史。
- 人工审批状态。
- 历史执行轨迹回放。

### 3.11 技术选型与架构取舍

#### 3.11.1 适用场景

适合：

- 用户任务包含多个步骤。
- 任务之间存在明确依赖关系。
- 需要提前了解整体执行路径。
- 需要汇总多个任务的结果。
- 执行过程中可能需要重新规划。
- 需要展示执行进度。

不适合：

- 简单的一问一答。
- 一次工具调用即可完成的任务。
- 规划成本明显高于执行成本的任务。

#### 3.11.2 Planner 技术选型

| 方式         | 优点               | 缺点           |
| ------------ | ------------------ | -------------- |
| LLM Planner  | 灵活，理解自然语言 | 计划可能不稳定 |
| 规则 Planner | 可预测、可审计     | 灵活性较差     |
| 混合 Planner | 兼顾灵活性和确定性 | 架构复杂度较高 |

企业推荐混合方式：

```text
LLM 生成计划
   ↓
程序验证计划
   ↓
检查工具白名单
   ↓
检查任务依赖
   ↓
检查业务规则
   ↓
保存合法计划
   ↓
执行任务
```

#### 3.11.3 重新规划触发条件

- 关键任务执行失败。
- 执行结果与原计划假设不一致。
- 新信息导致后续任务失去意义。
- 需要增加新的任务。
- 发现原计划存在遗漏。
- 任务执行超出预期边界。

#### 3.11.4 计划修改原则

- 已完成任务：原则上不重新执行。
- 正在执行任务：明确取消或等待完成后再调整。
- 未开始任务：允许修改、删除或增加。
- 等待审批任务：不能绕过审批。
- 已执行的外部副作用：必须保留记录。

#### 3.11.5 企业生产环境关键机制

| 机制           | 解决的问题         |
| -------------- | ------------------ |
| Plan Schema    | 保证计划结构统一   |
| DAG 校验       | 保证任务依赖正确   |
| 最大任务数     | 避免计划无限膨胀   |
| 最大重规划次数 | 控制模型成本       |
| 任务超时       | 避免任务长期阻塞   |
| Checkpoint     | 支持执行状态恢复   |
| 幂等键         | 防止重复执行副作用 |
| 任务重试策略   | 处理可恢复错误     |
| 权限校验       | 防止越权执行       |
| 人工审批       | 控制高风险操作     |
| Event Log      | 支持审计和历史回放 |

特别注意：

**计划持久化不等于执行可靠性。外部写操作必须设计幂等键、操作记录和业务状态核对机制。**

## 4. Workflow vs Agent

### 4.1 Workflow 的定义与核心特征

Workflow（工作流）是一种由开发者预先定义执行步骤、节点关系、条件分支和异常处理规则的程序执行模式。

核心特征：执行路径主要由程序预先决定，而不是由 LLM 在运行时自由决定。

主要特点：

- 流程预定义：开发者提前定义节点和执行关系。
- 控制流确定：节点执行顺序和条件分支由程序控制。
- 可预测性强：执行路径相对稳定。
- 可测试性强：可以针对节点和分支编写测试。
- 可审计性强：可以追踪每个节点的执行过程。
- 业务约束清晰：权限、审批、金额限制可以直接编码。
- 适合事务处理：适合订单、支付、退款等业务。

注意：Workflow 的控制流由程序定义，但节点内部的计算结果不一定完全确定。例如 Workflow 节点也可以调用 LLM。

**是否使用 LLM，不是判断 Workflow 和 Agent 的标准。**

### 4.2 Agent 的定义与核心特征

Agent 是一种以目标为导向的执行系统。

它接收用户目标，在运行过程中观察当前环境和工具返回结果，并根据这些信息动态决定下一步行动。

核心特征：

- 目标驱动：围绕用户目标组织执行。
- 动态决策：模型根据当前状态决定下一步。
- 工具调用：选择适合的工具完成任务。
- 反馈驱动：根据工具执行结果调整后续行动。
- 路径不完全固定：不同执行结果可能产生不同路径。
- 自主规划：可以动态决定任务步骤。
- 需要边界约束：必须限制工具权限、执行次数和风险操作。

典型 Agent Loop：

1. 获取当前目标和上下文。
2. 观察当前环境。
3. LLM 决定下一步行动。
4. 执行工具。
5. 获取工具执行结果。
6. 更新状态。
7. 再次决策，直到完成或达到停止条件。

### 4.3 Workflow 与 Agent 的核心区别

最核心的区别是控制流由谁决定。

Workflow：

- 开发者预先定义控制流程。
- 程序决定下一步执行哪个节点。
- 可以使用 LLM，但模型通常只负责节点内部任务。

Agent：

- 模型参与运行时控制流决策。
- 根据目标、上下文和工具返回结果决定下一步。
- 可以动态选择工具、调整计划和结束任务。

| 对比维度 | Workflow       | Agent                    |
| -------- | -------------- | ------------------------ |
| 核心驱动 | 预定义流程     | 用户目标                 |
| 控制流   | 程序定义       | 模型参与决策             |
| 执行路径 | 相对固定       | 动态变化                 |
| 工具选择 | 程序指定       | 模型选择授权工具         |
| 反馈调整 | 预定义逻辑     | 根据观察结果重新决策     |
| 可预测性 | 通常更高       | 通常更低                 |
| 可测试性 | 相对简单       | 需要评估决策质量         |
| 成本     | 通常较低       | 可能产生多轮模型调用     |
| 适合场景 | 标准化业务流程 | 动态、复杂、非结构化问题 |

#### 4.3.1 控制流与数据流

数据流（Data Flow）：数据从哪里来，经过哪些节点，被处理后传递到哪里。

控制流（Control Flow）：决定哪些节点执行、什么时候执行、执行顺序是什么。

Workflow 中控制流由开发者定义。

Agent 中模型可以根据运行时观察结果参与控制流决策。

两者并不是按照复杂度区分。Workflow 可以有大量节点、循环、并行任务和复杂分支；Agent 也可以只是一个简单的工具调用循环。

### 4.4 何时使用 Workflow、何时使用 Agent

#### 4.4.1 适合 Workflow

- 订单查询。
- 物流查询。
- 退款资格校验。
- 退款金额计算。
- 退款提交。
- 用户权限校验。
- 人工审批。
- 订单状态更新。

这些任务具有明确的业务规则和执行路径，应优先采用确定性程序逻辑。

#### 4.4.2 适合 Agent

- 用户意图理解。
- 复杂问题诊断。
- 知识检索策略选择。
- 复杂投诉分析。
- 多步骤信息收集。
- 动态工具选择。

这些任务需要理解自然语言、分析上下文、探索信息或动态调整执行策略。

#### 4.4.3 架构选型原则

- 流程明确、规则清晰：优先 Workflow。
- 需要理解、分析、探索和动态选择：考虑 Agent。
- 同时存在两种需求：采用混合架构。
- 涉及资金、权限和数据修改：必须由服务端进行强制业务校验。

### 4.5 Workflow 与 Agent 的混合架构

企业生产环境通常采用：

**Workflow 管理业务主流程，Agent 负责其中需要动态决策的任务。**

推荐架构：

1. 请求入口：身份认证、参数校验、创建工单。
2. Workflow：检查用户权限和工单状态。
3. Agent：理解用户问题，诊断问题类型。
4. Workflow：执行订单查询、物流查询等业务操作。
5. Agent：根据调查结果分析问题并提出处理建议。
6. Workflow：检查业务规则和操作权限。
7. 人工审批：必要时进入审批流程。
8. Workflow：提交业务操作、更新状态、通知用户。
9. 审计系统：记录完整执行过程。

Agent 可以提出操作建议，但不能凭模型输出直接获得业务执行权限。

模型决策不等于业务授权，工具调用成功也不等于业务状态已经正确更新。

### 4.6 四种常见架构模式

#### 4.6.1 固定 Workflow

适合执行路径明确的任务。

```text
Start
  ↓
Validate
  ↓
Query Order
  ↓
Check Rule
  ↓
Execute
  ↓
End
```

#### 4.6.2 动态路由

入口由程序管理，路由节点可以使用 LLM 识别请求类型。

```text
用户请求
   ↓
意图识别
   ├── 订单查询 Workflow
   ├── 物流查询 Workflow
   ├── 退款申请 Workflow
   └── 投诉处理 Agent
```

如果 LLM 只负责分类，后续执行路径由程序预先定义，整体仍属于 Workflow。

#### 4.6.3 Planner / Executor

适合任务步骤不固定，但需要生成和执行任务计划的场景。

```text
用户目标
   ↓
Planner
   ↓
任务计划
   ↓
Executor
   ↓
执行任务
   ↓
Replanner
   ↓
结束或调整计划
```

Plan-and-Execute 可以放在更大的 Workflow 中运行。

#### 4.6.4 Multi-Agent

适合多个专业角色协作的问题。

```text
主控 Agent
    ├── 订单 Agent
    ├── 物流 Agent
    └── 投诉 Agent
           ↓
        汇总结果
           ↓
        Workflow
           ↓
        业务执行
```

只有当任务边界、专业职责或上下文隔离能够带来实际收益时，才应该引入 Multi-Agent。

### 4.7 Python 实现

#### 4.7.1 确定性 Workflow

```python
from decimal import Decimal


async def query_order(order_id: str) -> dict:
    return {
        "order_id": order_id,
        "status": "paid",
        "refund_status": "none",
        "amount": "199.00",
    }


def validate_refund(order: dict) -> bool:
    return (
        order["status"] == "paid"
        and order["refund_status"] == "none"
        and Decimal(order["amount"]) > 0
    )


async def submit_refund(order: dict) -> dict:
    return {
        "success": True,
        "order_id": order["order_id"],
        "refund_amount": order["amount"],
    }


async def refund_workflow(order_id: str) -> dict:
    order = await query_order(order_id)

    if not validate_refund(order):
        return {
            "status": "rejected",
            "reason": "退款条件不满足",
        }

    result = await submit_refund(order)

    return {
        "status": "completed",
        "result": result,
    }
```

执行路径由程序预先定义：

```text
query_order
    ↓
validate_refund
    ↓
submit_refund
    ↓
return
```

#### 4.7.2 Agent 决策循环

```python
async def run_agent(goal, max_steps=8):
    observations = []

    for step in range(max_steps):
        decision = await llm_decide(
            goal=goal,
            observations=observations,
        )

        action = decision["action"]

        if action == "finish":
            return {
                "status": "completed",
                "answer": decision["answer"],
            }

        tool = TOOLS.get(action)

        if tool is None:
            observations.append({
                "error": f"不允许调用工具：{action}"
            })
            continue

        result = await tool(**decision["arguments"])

        observations.append({
            "action": action,
            "result": result,
        })

    return {
        "status": "max_steps_exceeded",
        "observations": observations,
    }
```

这里的 `llm_decide()` 代表真实模型决策接口。

Agent 的执行顺序不是固定的，而是由模型根据目标和当前观察结果动态决定。

生产环境还需要工具参数校验、权限校验、超时、重试、幂等、审计和人工审批等机制。

### 4.8 与 LangChain、LangGraph、Deep Agents 的关系

#### 4.8.1 LangChain

提供 Model、Prompt、Tools、Runnable、Agent 等组件。

既可以构建固定处理链，也可以构建动态工具调用 Agent。

#### 4.8.2 LangGraph

适合统一编排 Workflow 和 Agent。

主要能力：

- State：共享执行状态。
- Node：业务节点或 Agent 节点。
- Edge：节点执行关系。
- Conditional Edge：条件路由。
- Command：状态更新和路由控制。
- Send：动态任务分发。
- Checkpointer：状态持久化。
- Interrupt：中断和人工介入。

推荐使用 LangGraph 构建企业售后工单项目的核心编排层。

#### 4.8.3 Deep Agents

提供更高层的复杂 Agent 执行能力：

- Planning。
- Task Decomposition。
- Subagents。
- Filesystem。
- Skills。
- Memory。

适合复杂长任务，但不能替代企业业务 Workflow。

### 4.9 企业级架构设计

#### 4.9.1 可控性

限制工具权限、最大执行轮数、超时、上下文预算、工具参数和高风险操作。

#### 4.9.2 成本

记录模型调用次数、Token 使用量、子 Agent 调用和实际执行成本。

#### 4.9.3 延迟

使用小模型处理简单任务、固定节点避免重复调用 LLM、并行执行无依赖任务、设置最大决策轮数。

#### 4.9.4 可靠性

为节点设计重试、超时、补偿、幂等、错误分支和恢复机制。

#### 4.9.5 可观测性

记录完整执行轨迹：

- 用户输入。
- Agent 决策。
- 工具调用。
- 工具返回。
- Workflow 节点执行。
- 审批等待。
- 最终结果。

#### 4.9.6 权限边界

区分 Agent 决策权限、工具调用权限、用户数据访问权限、业务执行权限和人工审批权限。

#### 4.9.7 人工审批

高风险操作采用：

```text
Agent 提出操作建议
    ↓
Workflow 检查业务规则
    ↓
人工审批
    ↓
服务端再次校验
    ↓
执行操作
    ↓
记录审计日志
```

### 4.10 常见问题

1. 使用了 LLM 就是 Agent 吗？

   不是。关键是模型是否参与运行时控制流决策。

2. Workflow 能不能动态选择执行路径？

   可以。可以通过条件分支、路由节点和动态任务分发实现。

3. Agent 是不是完全自主？

   不是。企业 Agent 必须受到工具权限、执行次数、业务规则和风险控制的约束。

4. Workflow 和 Agent 哪个更先进？

   没有绝对的先进与落后。两者解决的问题不同。

5. 为什么企业不直接使用纯 Agent？

   企业还需要稳定性、成本控制、权限管理、审计、故障恢复和业务一致性，因此通常采用混合架构。

### 4.11 核心结论

Workflow 和 Agent 的本质区别在于控制流的归属。

- Workflow：程序定义执行路径。
- Agent：模型参与动态决策。
- Hybrid Architecture：程序控制业务主流程，模型负责动态决策节点。

对于企业售后工单 Agent，推荐采用 LangGraph 作为统一编排层，Workflow 负责订单、物流、退款、权限和审批，Agent 负责意图理解、问题诊断、复杂投诉分析和动态信息收集。

最终目标不是让 Agent 拥有无限自主权，而是在可控边界内发挥模型的动态决策能力。

## 5. Context Management：上下文管理

### 5.1 Context 的定义

Context（上下文）是模型在当前一次推理或生成过程中能够访问的信息集合。

主要包括：

- System Instructions。
- Developer Instructions。
- 用户当前消息。
- 历史对话。
- Assistant 历史响应。
- Tool Calls。
- Tool Results。
- 当前任务目标。
- 执行计划。
- 当前执行状态。
- 检索知识。
- 用户长期偏好。
- 当前环境信息。
- 输出格式约束。

Context 不等于 Conversation History。

Conversation History 只是 Context 的一部分。

### 5.2 Context、State、Memory 的区别

| 概念    | 核心含义                           | 解决的问题                 |
| ------- | ---------------------------------- | -------------------------- |
| Context | 当前模型能够看到的信息             | 模型当前知道什么           |
| State   | Agent 执行过程中维护的结构化状态   | 任务执行到哪里             |
| Memory  | 从历史中保留并在未来重新使用的信息 | 如何跨时间保留有价值的信息 |

核心原则：

- State 管当前任务。
- Memory 管跨任务复用的信息。
- Context 管当前模型需要看到的信息。

Memory 可以被加载到 Context，但两者不是同一个概念。

### 5.3 为什么需要上下文管理

#### 5.3.1 Context Window 限制

LLM 一次能够处理的上下文容量有限。

Token 预算：

T_total = T_system + T_tools + T_history + T_memory + T_retrieval + T_input + T_output

必须满足模型上下文窗口限制，并为输出预留空间。

#### 5.3.2 上下文过长的问题

- 请求可能超过模型上下文限制。
- Token 成本增长。
- 推理延迟变高。
- 无关信息干扰判断。
- 旧信息可能与新信息冲突。
- 任务状态可能丢失。

上下文越长不代表 Agent 越聪明。

#### 5.3.3 上下文丢失的风险

可能导致：

- 重复查询。
- 重复审批。
- 重复提交退款。
- 忘记已经完成的步骤。
- 使用过期的业务状态。

业务执行状态必须以数据库或业务服务为准，不能只相信模型上下文。

### 5.4 上下文的主要组成部分

#### 5.4.1 System Instructions

定义 Agent 的角色、目标、规则和安全边界。

#### 5.4.2 Conversation History

保存用户与 Agent 的交互记录。

用于理解用户之前的表达、Agent 已经回答的内容和当前对话语境。

#### 5.4.3 Tool Calls 与 Tool Results

记录模型发出的工具调用和工具执行结果。

需要注意：

- 保证 Tool Call 和 Tool Result 的关联关系。
- 不随意删除不完整的工具调用记录。
- 大型工具返回需要摘要或结构化提取。
- 工具结果属于不可信外部数据，不能覆盖系统指令。

#### 5.4.4 Task State

保存当前任务的结构化执行状态。

例如：

- Task ID。
- Goal。
- Status。
- Completed Steps。
- Pending Steps。
- Current Step。

#### 5.4.5 Retrieved Context

当前推理需要的外部知识，包括 RAG、数据库、API 和企业文档检索结果。

应该按相关性加载，而不是把整个知识库放入 Context。

#### 5.4.6 Memory

用于跨对话、跨任务保留和复用有价值的信息。

不是所有对话内容都应该变成长期 Memory。

### 5.5 上下文管理策略

#### 5.5.1 Sliding Window

只保留最近 N 条消息。

优点：

- 实现简单。
- Token 消耗容易控制。
- 适合短对话。

缺点：

- 可能丢失早期关键事实。
- 不理解信息的重要程度。
- 可能破坏 Tool Call 与 Tool Result 的关联。

不适合单独用于复杂长任务。

#### 5.5.2 Token Budget

为不同上下文部分分配 Token 预算。

需要：

- 使用对应模型的 Tokenizer。
- 统计实际请求内容。
- 为输出预留空间。
- 控制工具定义长度。
- 超出预算时触发压缩。
- 记录 Token 使用量。

字符数量不等于 Token 数量。

#### 5.5.3 Conversation Summarization

将较早的对话历史压缩为摘要。

摘要应该保留：

- 用户目标。
- 关键业务标识。
- 已确认事实。
- 用户明确约束。
- 已完成操作。
- 未完成事项。
- 风险和审批状态。

不要将推测写成事实。

摘要不能替代结构化业务状态。

#### 5.5.4 Structured Context

使用结构化字段管理关键上下文。

例如：

```python
context = {
    "task": {
        "task_id": "TASK-10001",
        "goal": "调查用户未收到货的问题",
        "status": "running",
    },
    "order": {
        "order_id": "ORDER-10001",
        "status": "shipped",
    },
    "completed_steps": [
        "query_order",
        "query_logistics",
    ],
    "pending_steps": [
        "query_customer_service_history",
    ],
}
```

结构化 Context 更容易校验、持久化和展示。

#### 5.5.5 Context Layering

可以将上下文分为五层：

1. 稳定指令：System Prompt、规则和安全边界。
2. 当前任务状态：Goal、Plan、Completed Steps。
3. 近期交互：最近对话和工具调用。
4. 相关长期记忆：用户偏好和跨任务信息。
5. 外部检索信息：RAG、数据库和 API 结果。

不同层次应采用不同的更新与保留策略。

#### 5.5.6 Just-in-Time Context

按需加载上下文。

模型需要订单信息时再查询订单，需要物流信息时再查询物流。

减少无关信息和 Token 消耗。

### 5.6 上下文压缩与信息保留

压缩时优先保留：

1. 业务身份和关键标识。
2. 权限与安全约束。
3. 真实业务执行状态。
4. 用户明确诉求。
5. 已确认事实。
6. 事实来源和时间。
7. 已完成操作。
8. 尚未完成事项。
9. 风险和审批状态。

不同类型的信息应该采用不同压缩方式：

| 信息类型      | 处理方式          |
| ------------- | ----------------- |
| 对话历史      | 摘要、滑动窗口    |
| 工具返回      | 结构化提取、摘要  |
| 当前任务状态  | 结构化字段        |
| 用户偏好      | 筛选后写入 Memory |
| RAG 结果      | 按需检索          |
| System Prompt | 精简和版本化      |
| 工具定义      | 按需暴露          |

上下文压缩不等于业务数据删除。

完整执行日志、审计记录和业务数据应该独立保存。

### 5.7 工具调用上下文管理

#### 5.7.1 原始结果与模型上下文分离

完整工具结果保存到数据库、日志系统或对象存储。

模型上下文只保留当前推理需要的摘要和结构化 Observation。

#### 5.7.2 保证 Tool Call 协议完整

- 保留必要的 Tool Call 和 Tool Result。
- 保持 Tool Call ID 关联。
- 不随意删除不完整的工具调用。
- 确保消息结构符合模型 API 协议。

#### 5.7.3 超大工具返回处理

使用过滤、分页、结构化提取、摘要和引用，避免将大量原始数据放入模型上下文。

#### 5.7.4 工具结果是不可信输入

第三方网页、用户上传文件和外部 API 返回都可能包含恶意内容。

必须区分系统指令、业务数据和外部观察结果。

### 5.8 Context、State、Memory 的工程关系

Context 可以在每次模型调用前动态构建。

State 保存当前任务所需的结构化数据。

Memory 保存跨任务复用的信息。

推荐架构：

```text
State
  ↓
Context Builder
  ↑
Memory / External Retrieval
  ↓
Model Context
  ↓
LLM 决策与执行
```

不要将所有历史日志、原始工具数据和大型文档全部塞入 State。

### 5.9 多轮对话、长任务与上下文隔离

#### 5.9.1 关键对象

- User：用户身份。
- Tenant：租户。
- Thread：对话线程。
- Task：业务执行任务。
- Run：一次执行过程。
- Checkpoint：执行状态快照。

#### 5.9.2 隔离原则

- 用户隔离。
- 租户隔离。
- Thread 隔离。
- Task 隔离。
- Agent 隔离。
- 工具访问隔离。

所有数据读取必须经过服务端权限校验。

#### 5.9.3 Checkpoint

Checkpointer 保存 Graph State，支持中断恢复、故障恢复和状态检查。

Checkpoint 不等于长期 Memory，也不意味着所有原始工具数据都应该保存在其中。

#### 5.9.4 Subagent 上下文隔离

只传递完成子任务所需要的最小信息。

不要无差别传递全部对话、全部业务数据和全部权限。

### 5.10 手写 Context Manager

基础结构：

```python
from dataclasses import dataclass, field
from typing import Any


@dataclass
class AgentContext:
    task_id: str
    goal: str
    messages: list[dict] = field(default_factory=list)
    task_state: dict[str, Any] = field(default_factory=dict)
    memory: dict[str, Any] = field(default_factory=dict)
    summary: str = ""


class ContextManager:

    def __init__(self, max_history_messages=20):
        self.max_history_messages = max_history_messages

    def add_message(self, context, role, content):
        context.messages.append({
            "role": role,
            "content": content,
        })

    def update_state(self, context, key, value):
        context.task_state[key] = value

    def update_memory(self, context, key, value):
        context.memory[key] = value

    def get_recent_messages(self, context):
        return context.messages[-self.max_history_messages:]

    def build_context(self, context):
        return {
            "goal": context.goal,
            "summary": context.summary,
            "task_state": context.task_state,
            "memory": context.memory,
            "messages": self.get_recent_messages(context),
        }
```

实际项目还需要：

- Token Budget。
- Tokenizer。
- 历史摘要。
- 工具消息协议检查。
- 并发更新保护。
- 持久化。
- 用户和租户隔离。

### 5.11 LangGraph 与 Deep Agents

#### 5.11.1 LangGraph

State 是节点之间共享和更新执行数据的重要机制。

Checkpointer 负责持久化 Graph State。

需要区分：

- Graph State：执行状态。
- Model Context：当前模型请求的信息视图。
- Checkpointer：执行状态持久化。
- Store：跨 Thread 持久化信息。

不要将所有原始工具数据放入 State。

#### 5.11.2 Deep Agents

需要区分：

- State：当前 Graph 执行状态。
- Checkpointer：当前 Thread 的状态持久化。
- Store：跨 Thread 的持久化数据。
- Memory：加载并注入 Agent 的记忆信息。
- Filesystem：供 Agent 读写的文件系统。

Memory 的加载和注入不代表 Agent 会自动学习并保存每一轮对话。

长期记忆写入仍然需要文件工具、自定义工具或独立 Memory Service。

### 5.12 企业级上下文管理架构

推荐模块：

- Context Builder：组装上下文。
- Context Selector：筛选相关信息。
- Token Budget Manager：控制 Token 预算。
- Summarizer：压缩历史信息。
- State Manager：管理任务状态。
- Memory Service：管理长期记忆。
- Checkpointer：持久化执行状态。

存储建议：

| 存储           | 职责                             |
| -------------- | -------------------------------- |
| PostgreSQL     | 用户、工单、任务、对话和审计数据 |
| Redis          | 缓存和短期协调                   |
| Checkpointer   | Graph State                      |
| Store          | 跨 Thread 数据                   |
| Vector DB      | 语义检索                         |
| Object Storage | 大文件和原始工具结果             |

### 5.13 执行轨迹控制台

建议展示：

- 当前上下文 Token 使用量。
- Context 各组成部分。
- 历史摘要。
- 当前 Task State。
- Memory 命中记录。
- 工具调用和返回。
- 上下文压缩事件。
- Checkpoint 保存和恢复事件。
- 上下文版本回放。

每次上下文压缩前后可以保存版本和来源引用，以便检查哪些信息被保留或删除。

### 5.14 常见错误

1. 永久保留全部历史消息。
2. 只按消息数量裁剪。
3. 只依赖 LLM 摘要。
4. 将全部工具原始结果放入 Context。
5. 混淆 Context 和 Memory。
6. 将所有数据放入 Graph State。
7. 多个任务共享同一上下文。
8. 子 Agent 接收全部主 Agent 上下文。
9. 相信摘要中的业务执行状态。
10. 将外部工具结果当作高优先级指令。

### 5.15 核心结论

上下文管理不是简单保存聊天记录，而是为每一次模型调用选择正确的信息。

企业级 Agent 应采用：

- 结构化 State 保存当前任务状态。
- Conversation History 保存必要交互。
- Memory 保存跨任务复用信息。
- Context Builder 组织模型请求。
- Token Budget 控制上下文长度。
- Summarizer 压缩历史。
- Just-in-Time Retrieval 按需获取外部信息。
- Checkpointer 支持长任务恢复。
- 权限系统保证上下文访问隔离。

最终目标是在有限 Token 预算内，让模型获得完成当前任务所需的、准确的、相关的、可信的信息。

## 6. 手写 Agent Loop

### 6.1 Agent Loop 的定义

Agent Loop 是 Agent Runtime 的核心执行机制。

围绕用户目标反复执行：

1. 接收当前上下文。
2. 调用 LLM。
3. 解析模型响应。
4. 判断是否需要调用工具。
5. 执行工具。
6. 将工具结果写入上下文。
7. 再次调用 LLM。
8. 判断任务是否完成。
9. 满足终止条件后返回结果。

核心机制：

**模型根据当前 Observation 决定下一步行动，工具执行结果影响下一次模型决策。**

Agent Loop 不是无限循环，必须设置明确的停止条件。

### 6.2 Agent Loop 与普通 LLM 调用的区别

普通 LLM：

```text
用户输入
  ↓
LLM
  ↓
回答
```

Agent Loop：

```text
用户输入
  ↓
LLM
  ↓
Tool Call
  ↓
工具执行
  ↓
Tool Result
  ↓
LLM 再次决策
  ↓
继续执行或结束
```

普通 LLM 主要负责生成内容。

Agent Runtime 负责组织模型、工具、上下文、状态和执行控制。

### 6.3 Agent Runtime 的核心组成

#### 6.3.1 Model Client

负责模型 API 调用、消息传递、工具 Schema 传递、响应解析和异常处理。

#### 6.3.2 Tool Registry

管理 Agent 可以使用的工具，包括名称、描述、参数 Schema 和实际执行函数。

#### 6.3.3 Tool Executor

负责工具查找、参数验证、权限校验、执行、超时、异常处理和结果标准化。

#### 6.3.4 Context Manager

负责构建模型请求所需的上下文，包括 System Prompt、历史消息、工具调用记录和任务信息。

#### 6.3.5 State Manager

维护当前执行状态，包括运行状态、执行轮数、工具调用次数和最终结果。

#### 6.3.6 Execution Controller

控制循环继续、任务终止、执行预算和人工中断。

#### 6.3.7 Trace Recorder

记录模型请求、模型响应、工具调用、工具结果、异常、审批和任务完成事件。

### 6.4 核心数据结构

#### 6.4.1 Agent State

```python
from dataclasses import dataclass, field
from typing import Any, Literal


@dataclass
class AgentState:
    status: Literal[
        "idle",
        "running",
        "completed",
        "failed",
        "interrupted",
    ] = "idle"

    messages: list[dict] = field(default_factory=list)
    step_count: int = 0
    tool_call_count: int = 0
    final_answer: str | None = None
    error: str | None = None
    metadata: dict[str, Any] = field(default_factory=dict)
```

#### 6.4.2 Tool Call

```python
@dataclass
class ToolCall:
    id: str
    name: str
    arguments: dict
```

#### 6.4.3 Model Response

```python
@dataclass
class ModelResponse:
    content: str | None = None
    tool_calls: list[ToolCall] = field(default_factory=list)
    finish_reason: str | None = None
```

#### 6.4.4 Tool Result

```python
@dataclass
class ToolResult:
    tool_call_id: str
    tool_name: str
    success: bool
    data: Any = None
    error: str | None = None
```

### 6.5 Tool Registry

工具注册表管理可供 Agent 调用的工具。

```python
from dataclasses import dataclass
from typing import Callable, Any


@dataclass
class ToolDefinition:
    name: str
    description: str
    parameters: dict
    handler: Callable[..., Any]
    requires_approval: bool = False


class ToolRegistry:

    def __init__(self):
        self._tools = {}

    def register(self, tool: ToolDefinition):
        if tool.name in self._tools:
            raise ValueError("工具已经注册")

        self._tools[tool.name] = tool

    def get(self, name: str):
        tool = self._tools.get(name)

        if tool is None:
            raise ValueError(f"未知工具：{name}")

        return tool

    def get_model_schemas(self):
        return [
            {
                "name": tool.name,
                "description": tool.description,
                "parameters": tool.parameters,
            }
            for tool in self._tools.values()
        ]
```

工具 Schema 告诉模型工具的用途和参数要求。

Schema 不是安全边界，模型生成的参数必须由服务端重新验证。

### 6.6 Tool Executor

工具执行过程：

```text
Tool Call
   ↓
工具查找
   ↓
参数校验
   ↓
权限校验
   ↓
工具执行
   ↓
异常处理
   ↓
标准化结果
```

基础实现：

```python
import asyncio
import jsonschema


class ToolExecutor:

    def __init__(self, registry, timeout=10):
        self.registry = registry
        self.timeout = timeout

    async def execute(self, tool_call):
        try:
            tool = self.registry.get(
                tool_call.name
            )

            jsonschema.validate(
                instance=tool_call.arguments,
                schema=tool.parameters,
            )

            result = await asyncio.wait_for(
                tool.handler(
                    **tool_call.arguments
                ),
                timeout=self.timeout,
            )

            return ToolResult(
                tool_call_id=tool_call.id,
                tool_name=tool_call.name,
                success=True,
                data=result,
            )

        except asyncio.TimeoutError:
            return ToolResult(
                tool_call_id=tool_call.id,
                tool_name=tool_call.name,
                success=False,
                error="工具执行超时",
            )

        except Exception as exc:
            return ToolResult(
                tool_call_id=tool_call.id,
                tool_name=tool_call.name,
                success=False,
                error=str(exc),
            )
```

生产环境还需要在执行器或业务服务层实现用户权限、租户隔离和高风险操作审批。

### 6.7 Model Client

定义统一模型调用接口：

```python
from typing import Protocol


class ModelClient(Protocol):

    async def generate(
        self,
        messages: list[dict],
        tools: list[dict],
    ) -> ModelResponse:
        ...
```

通过 Model Adapter 将不同模型供应商的消息结构、工具调用结构和错误格式转换为统一的数据结构。

这样可以在不重写 Agent Loop 的情况下更换模型供应商。

### 6.8 Context Manager

基础实现：

```python
class AgentContextManager:

    def __init__(
        self,
        system_prompt: str,
        max_messages: int = 30,
    ):
        self.system_prompt = system_prompt
        self.max_messages = max_messages

    def build_messages(self, state):
        recent = state.messages[
            -self.max_messages:
        ]

        return [
            {
                "role": "system",
                "content": self.system_prompt,
            },
            *recent,
        ]
```

生产环境还需要 Token 预算、摘要、关键事实保留、工具消息协议校验和 Memory 加载。

不能简单依赖消息数量裁剪所有历史消息。

### 6.9 Agent Loop 核心执行流程

伪代码：

```python
async def run_agent(user_input):

    state = initialize_state(user_input)

    while True:

        messages = build_messages(state)

        response = await model.generate(
            messages=messages,
            tools=tools,
        )

        if response.tool_calls:

            for tool_call in response.tool_calls:
                result = await execute_tool(tool_call)
                append_tool_result(state, result)

            continue

        return response.content
```

核心是模型调用、工具执行、结果回传和再次决策形成的反馈闭环。

### 6.10 Agent Runtime

```python
class AgentRuntime:

    def __init__(
        self,
        model,
        registry,
        executor,
        context_manager,
        max_steps=10,
        max_tool_calls=20,
    ):
        self.model = model
        self.registry = registry
        self.executor = executor
        self.context_manager = context_manager
        self.max_steps = max_steps
        self.max_tool_calls = max_tool_calls

    async def run(self, user_input, state=None):

        if state is None:
            state = AgentState()

        if state.status == "running":
            raise ValueError("State 正在运行")

        state.status = "running"

        state.messages.append({
            "role": "user",
            "content": user_input,
        })

        try:
            while state.step_count < self.max_steps:

                state.step_count += 1

                messages = (
                    self.context_manager.build_messages(
                        state
                    )
                )

                tools = (
                    self.registry.get_model_schemas()
                )

                response = await self.model.generate(
                    messages=messages,
                    tools=tools,
                )

                state.messages.append({
                    "role": "assistant",
                    "content": response.content,
                    "tool_calls": [
                        {
                            "id": call.id,
                            "name": call.name,
                            "arguments": call.arguments,
                        }
                        for call in response.tool_calls
                    ],
                })

                if response.tool_calls:

                    for tool_call in response.tool_calls:

                        if (
                            state.tool_call_count
                            >= self.max_tool_calls
                        ):
                            raise RuntimeError(
                                "超过最大工具调用次数"
                            )

                        state.tool_call_count += 1

                        result = await self.executor.execute(
                            tool_call
                        )

                        state.messages.append({
                            "role": "tool",
                            "tool_call_id": tool_call.id,
                            "name": tool_call.name,
                            "content": (
                                result.data
                                if result.success
                                else {"error": result.error}
                            ),
                        })

                    continue

                state.final_answer = response.content or ""
                state.status = "completed"

                return state

            state.status = "failed"
            state.error = "超过最大模型决策轮数"

            return state

        except Exception as exc:
            state.status = "failed"
            state.error = str(exc)

            return state
```

这是用于理解 Agent Loop 的基础实现，并非可以直接部署的生产版本。

真实模型接口通常要求特定的 Assistant Tool Call 和 Tool Result 消息结构，需要由 Model Adapter 负责转换。

生产 Runtime 还需要处理审批中断、用户取消、预算耗尽、持久化恢复和幂等执行。

### 6.11 一次 Agent Run 的执行过程

```text
用户输入
   ↓
Model Request #1
   ↓
调用 query_order
   ↓
Tool Result
   ↓
Model Request #2
   ↓
调用 query_logistics
   ↓
Tool Result
   ↓
Model Request #3
   ↓
生成最终答案
   ↓
Run Completed
```

区分：

- Step Count：模型决策轮数。
- Tool Call Count：工具调用次数。

一次模型响应可能包含多个工具调用，因此二者不一定相等。

### 6.12 Agent Loop 的关键工程问题

#### 6.12.1 并行工具调用

独立工具可以并行执行：

```python
async def execute_parallel(executor, calls):
    tasks = [
        executor.execute(call)
        for call in calls
    ]

    return await asyncio.gather(*tasks)
```

有依赖关系的工具必须顺序执行。

需要控制并发数量、超时、取消和部分失败。

#### 6.12.2 工具异常

区分：

- 参数错误。
- 权限错误。
- 网络错误。
- 超时。
- 业务失败。
- 不可恢复异常。

临时错误可以有限重试，权限错误和安全违规应该由 Runtime 强制处理。

#### 6.12.3 最大执行预算

常见限制：

- 最大模型决策轮数。
- 最大工具调用次数。
- 最大 Token 数量。
- 最大执行时长。
- 最大并发工具数量。
- 每个工具的最大重试次数。

#### 6.12.4 任务终止条件

需要区分：

- completed。
- needs_input。
- waiting_approval。
- failed。
- interrupted。
- budget_exceeded。

模型没有返回 Tool Call，不一定意味着业务目标已经完成。

#### 6.12.5 Human-in-the-Loop

高风险操作需要经过：

```text
Agent 提出操作
   ↓
业务规则检查
   ↓
创建审批请求
   ↓
暂停 Run
   ↓
人工审批
   ↓
服务端重新校验
   ↓
执行操作
   ↓
恢复 Run
```

审批结果必须来自可信审批服务。

#### 6.12.6 幂等性

退款、支付、订单修改等操作必须使用服务端幂等机制。

例如：

```python
idempotency_key = (
    f"{task_id}:"
    f"{tool_call_id}:"
    f"{operation_type}"
)
```

仅记录 Agent 工具调用次数不能保证业务操作幂等。

#### 6.12.7 Durable Execution

长任务需要持久化执行状态。

恢复执行时，必须核对工具执行记录和业务状态，防止重复执行副作用。

### 6.13 Trace 与可观测性

核心事件：

```text
run_started
model_request_started
model_response_received
tool_call_created
tool_execution_started
tool_execution_completed
tool_execution_failed
context_compacted
approval_requested
approval_resolved
checkpoint_saved
run_completed
run_failed
```

Trace 至少需要关联：

- Run ID。
- Task ID。
- Thread ID。
- Tenant ID。
- Agent ID。
- Tool Call ID。
- 模型名称。
- Token 使用量。
- 执行延迟。
- 错误信息。

敏感数据必须脱敏。

执行轨迹可以通过 SSE 传递给前端执行控制台，但事件传输与 Agent 核心执行状态必须解耦。

### 6.14 手写 Agent Loop 与框架的关系

#### 6.14.1 手写 Agent Loop

理解和实现底层模型调用、工具执行、上下文管理、循环控制和异常处理。

#### 6.14.2 LangChain

提供模型、Prompt、Tools 和 Agent 等常用抽象。

#### 6.14.3 LangGraph

提供 State、Node、Edge、Checkpointer、Interrupt、Retry、Timeout 和 Durable Execution 等能力，适合复杂业务编排。

#### 6.14.4 Deep Agents

提供 Planning、Task Decomposition、Subagents、Filesystem、Skills 和 Memory 等高层复杂任务能力。

三者解决的问题不同，不能认为高层框架可以替代业务权限、幂等和审批机制。



## 7. LangGraph / LangChain 执行模型源码理解

### 7.1 整体架构

当前 LangChain v1 的 `create_agent()` 底层使用 LangGraph Runtime 构建执行图。

整体架构：

```text
业务代码
    |
    v
LangChain Agent API
    |
    |-- Model
    |-- Tools
    |-- Middleware
    |-- State
    |
    v
LangGraph Runtime
    |
    |-- Compiled Graph
    |-- Pregel
    |-- State
    |-- Channel
    |-- Task Scheduler
    |
    v
执行基础设施
    |
    |-- Checkpoint
    |-- Interrupt
    |-- Retry
    |-- Timeout
    |-- Streaming
```

核心职责：

- LangChain：提供模型、工具、Agent 和 Middleware 等高层抽象。
- LangGraph：提供状态图编排和 Runtime 执行能力。
- Pregel：负责 Graph 的任务调度和执行。
- Checkpointer：负责持久化 Graph 执行状态。
- Store：负责跨 Thread 的长期数据存储。

### 7.2 LangChain Agent 执行模型

#### 7.2.1 历史 AgentExecutor

历史 LangChain Agent 常通过 `AgentExecutor` 管理：

1. 调用 Agent。
2. 解析 Agent 动作。
3. 执行工具。
4. 将工具结果返回 Agent。
5. 判断是否继续执行。
6. 判断是否达到最大迭代次数。

它本质上是 Agent 执行循环的抽象。

#### 7.2.2 当前 create_agent

当前推荐使用：

```python
from langchain.agents import create_agent

agent = create_agent(
    model="openai:gpt-4.1",
    tools=tools,
    system_prompt="你是一个企业售后客服 Agent",
)

result = agent.invoke({
    "messages": [
        {
            "role": "user",
            "content": "查询订单状态"
        }
    ]
})
```

`create_agent()` 不只是创建模型调用对象，而是构建包含模型调用、工具执行、状态管理和 Middleware 的执行图。

当前 Agent Factory 基于 LangGraph Runtime。

#### 7.2.3 Agent 执行链路

```text
接收用户输入
    |
    v
准备消息、Prompt 和工具定义
    |
    v
调用模型
    |
    v
解析模型响应
    |
    +---- 有 Tool Call
    |        |
    |        v
    |     执行工具
    |        |
    |        v
    |     返回 ToolMessage
    |        |
    |        v
    |     再次调用模型
    |
    +---- 无 Tool Call
             |
             v
          返回结果
```

核心区别：

- 模型产生 Tool Call，不代表工具已经执行。
- Tool Call 是模型的结构化决策结果。
- Tool Executor 负责实际执行。
- ToolMessage 用于将执行结果返回模型。
- Tool Call ID 用于关联工具调用与执行结果。

### 7.3 Middleware 执行机制

Middleware 用于在 Agent 生命周期中插入可复用的业务逻辑。

常见生命周期钩子：

| Hook            | 执行时机     |
| --------------- | ------------ |
| before_agent    | Agent 执行前 |
| before_model    | 模型调用前   |
| after_model     | 模型调用后   |
| wrap_model_call | 包装模型调用 |
| before_tool     | 工具执行前   |
| after_tool      | 工具执行后   |
| wrap_tool_call  | 包装工具调用 |
| after_agent     | Agent 执行后 |

典型用途：

- 模型请求修改。
- Prompt 注入。
- 上下文压缩。
- 模型路由。
- 工具权限校验。
- 工具执行审计。
- 限流。
- 超时。
- 统一异常处理。
- 执行轨迹记录。

`wrap_model_call` 关注模型调用，`wrap_tool_call` 关注工具执行。

工具权限必须由服务端执行逻辑保证，不能只依赖 Prompt。

### 7.4 LangGraph 执行模型

#### 7.4.1 StateGraph

核心对象：

| 对象             | 作用         |
| ---------------- | ------------ |
| StateGraph       | 构建状态图   |
| State            | 定义业务状态 |
| Node             | 执行业务逻辑 |
| Edge             | 定义节点连接 |
| Conditional Edge | 条件路由     |
| START            | 图入口       |
| END              | 图结束       |
| compile          | 编译图       |

示例：

```python
from typing import TypedDict
from langgraph.graph import StateGraph, START, END


class AgentState(TypedDict):
    question: str
    intent: str
    answer: str


def classify(state):
    return {"intent": "logistics"}


def answer(state):
    return {"answer": "订单正在配送中"}


builder = StateGraph(AgentState)

builder.add_node("classify", classify)
builder.add_node("answer", answer)

builder.add_edge(START, "classify")
builder.add_edge("classify", "answer")
builder.add_edge("answer", END)

graph = builder.compile()
```

编译后的对象是可执行图对象，当前实现通常为 `CompiledStateGraph`。

#### 7.4.2 Pregel / BSP

LangGraph 使用 Pregel 算法所体现的 Bulk Synchronous Parallel 模型组织执行。

一个 Super-step 分为三个阶段：

**Plan**

根据当前 Channel 的更新确定需要执行的节点。

**Execution**

执行本轮被选中的节点，可以并行运行。

本轮执行期间，节点产生的更新不会立即对同一轮其他节点可见。

**Update**

收集本轮节点写入，根据 Channel 的更新规则更新状态。

之后进入下一个 Super-step。

执行过程：

```text
Plan
  |
  v
Execution
  |
  v
Update
  |
  v
下一个 Super-step
  |
  v
直到没有后续任务
```

Pregel 不是简单的 Python while 循环，而是具有任务调度、Channel 更新和同步屏障的图执行模型。

#### 7.4.3 State、Reducer、Channel

State：

描述业务状态结构。

Reducer：

定义状态字段收到多次更新时如何合并。

Channel：

负责 Runtime 内部节点之间的数据传递和更新。

三者关系：

| 层次         | 职责               |
| ------------ | ------------------ |
| State Schema | 定义业务状态       |
| Reducer      | 定义更新合并方式   |
| Channel      | 管理运行时数据     |
| Pregel       | 管理节点执行与调度 |

例如：

```python
from typing import Annotated
from typing_extensions import TypedDict
import operator


class AgentState(TypedDict):
    logs: Annotated[list[str], operator.add]
```

多个节点可以分别向 `logs` 写入内容，由 Reducer 合并。

#### 7.4.4 Node 调度

Runtime 大致经历：

1. 接收输入。
2. 确定待执行节点。
3. 创建 Task。
4. 执行节点。
5. 收集节点写入。
6. 更新 Channel。
7. 计算下一批待执行节点。
8. 重复执行。

重点源码：

- `pregel/main.py`
- `pregel/_loop.py`
- `pregel/_runner.py`

#### 7.4.5 ToolNode

ToolNode 是 LangGraph 提供的预构建工具执行节点。

主要负责：

- 读取 Tool Calls。
- 根据工具名称匹配工具。
- 解析参数。
- 执行工具。
- 处理执行结果。
- 返回 ToolMessage。
- 处理工具执行异常。

ToolNode 不负责整个 Agent 的决策过程。

#### 7.4.6 tools_condition

`tools_condition` 是条件路由函数。

负责判断模型消息中是否包含 Tool Calls：

- 存在 Tool Calls：进入 ToolNode。
- 不存在 Tool Calls：进入 END。

二者区别：

- tools_condition：决定下一步执行位置。
- ToolNode：真正执行工具。

### 7.5 Checkpoint 与持久化

#### 7.5.1 Checkpointer

Checkpointer 用于持久化 Graph 执行状态。

```python
from langgraph.checkpoint.memory import InMemorySaver

checkpointer = InMemorySaver()

graph = builder.compile(
    checkpointer=checkpointer
)
```

生产环境可以使用 PostgreSQL 等持久化实现。

#### 7.5.2 thread_id

执行时指定：

```python
config = {
    "configurable": {
        "thread_id": "ticket_10086"
    }
}
```

`thread_id` 用于关联同一条执行线程的状态和 Checkpoint。

#### 7.5.3 Checkpoint 与 Store

| 比较项   | Checkpoint           | Store              |
| -------- | -------------------- | ------------------ |
| 用途     | 保存执行状态         | 保存长期数据       |
| 主要关联 | thread_id            | namespace / key    |
| 内容     | 状态、消息、执行快照 | 用户偏好、长期记忆 |
| 场景     | 恢复任务             | 跨 Thread 记忆     |

Checkpoint 不等于长期记忆，Store 也不是 Checkpoint 的替代品。

#### 7.5.4 状态读取

```python
snapshot = graph.get_state(config)

print(snapshot.values)
print(snapshot.next)
print(snapshot.tasks)
```

可以用于检查：

- 当前状态。
- 下一执行节点。
- 当前任务信息。
- 执行是否中断。

### 7.6 Interrupt 与 HITL

#### 7.6.1 interrupt

```python
from langgraph.types import interrupt


def approval_node(state):

    decision = interrupt({
        "type": "refund_approval",
        "amount": state["refund_amount"],
    })

    return {
        "approved": decision["approved"]
    }
```

执行到 `interrupt()` 时，Graph 暂停并保存相关状态。

#### 7.6.2 恢复

```python
from langgraph.types import Command

graph.invoke(
    Command(
        resume={
            "approved": True
        }
    ),
    config=config,
)
```

#### 7.6.3 恢复执行的注意事项

触发 Interrupt 的节点可能在恢复时从头重新执行。

因此：

- 避免在 Interrupt 前执行不可重复副作用。
- 将审批和业务执行拆分。
- 使用幂等键。
- 保存外部操作状态。
- 对结果不确定的外部请求进行状态核对。

### 7.7 RetryPolicy、Timeout 和异常

RetryPolicy：

用于处理可以通过重试恢复的错误。

Timeout：

用于控制节点或执行过程的时间边界。

异常处理：

| 错误                 | 策略               |
| -------------------- | ------------------ |
| 临时网络故障         | Retry              |
| 参数校验失败         | 修复参数           |
| 用户信息不足         | Interrupt          |
| 权限不足             | 拒绝并审计         |
| 业务不满足条件       | 业务分支           |
| 未知程序错误         | 向上抛出           |
| 外部副作用结果不确定 | 状态核对和幂等恢复 |

Retry、Timeout 和业务异常必须区分。

### 7.8 Streaming

常见 Stream Mode：

| Mode     | 作用                    |
| -------- | ----------------------- |
| values   | 输出完整状态            |
| updates  | 输出节点状态更新        |
| messages | 输出模型消息和 Token 流 |
| custom   | 输出自定义事件          |
| debug    | 输出调试信息            |

示例：

```python
for chunk in graph.stream(
    inputs,
    config=config,
    stream_mode="updates",
):
    print(chunk)
```

适合把执行过程实时推送到前端。

自定义事件可以包含：

```python
{
    "event": "order_query_completed",
    "order_id": "A10086"
}
```

企业执行轨迹系统应将框架事件和业务事件统一封装，并进行持久化、身份关联和脱敏处理。

### 7.9 手写 Agent Loop 与框架映射

| 手写实现             | 框架对应概念                      |
| -------------------- | --------------------------------- |
| Agent Runtime        | LangGraph Runtime                 |
| Model Client         | Chat Model / Model Node           |
| Tool Registry        | Tools                             |
| Tool Executor        | ToolNode                          |
| Agent State          | StateGraph State                  |
| State Manager        | State / Channel / Reducer         |
| Execution Controller | Pregel Runtime                    |
| Context Manager      | Runtime Context                   |
| 执行恢复             | Checkpointer                      |
| 人工审批             | Interrupt / Command               |
| 异常重试             | RetryPolicy                       |
| 执行轨迹             | Streaming / Callback / 自定义事件 |

### 7.10 企业售后工单 Agent 架构

建议流程：

```text
START
  |
  v
意图识别
  |
  v
Workflow 业务校验
  |
  v
订单查询
  |
  v
RAG 政策检索
  |
  v
退款金额计算
  |
  v
主管审批 interrupt
  |
  +---- 拒绝 ----> 记录拒绝原因
  |
  v
退款幂等执行
  |
  v
通知用户
  |
  v
END
```

核心技术：

- LangGraph：核心流程编排。
- LangChain：模型、工具和集成。
- RAG：企业知识检索。
- PostgreSQL：业务数据及持久化。
- Redis：缓存和临时数据。
- SSE：执行事件推送。
- 前端：执行轨迹、审批、Checkpoint 和历史回放。

### 7.11 源码阅读方法

#### 7.11.1 确认版本

```bash
pip show langchain
pip show langchain-core
pip show langgraph
```

#### 7.11.2 使用 inspect

```python
import inspect

from langchain.agents import create_agent
from langgraph.graph import StateGraph
from langgraph.prebuilt import ToolNode


print(inspect.getsourcefile(create_agent))
print(inspect.signature(create_agent))

print(inspect.getsourcefile(StateGraph))
print(inspect.getsourcefile(ToolNode))
```

#### 7.11.3 源码阅读顺序

1. 公开 API。
2. Graph 构建。
3. Graph 编译。
4. Pregel Runtime。
5. Task 调度。
6. Channel 更新。
7. Checkpoint。
8. Interrupt。
9. ToolNode。
10. Middleware。
11. Streaming。

#### 7.11.4 重点源码目录

| 模块                                             | 内容          |
| ------------------------------------------------ | ------------- |
| `libs/langchain_v1/langchain/agents/factory.py`  | Agent Factory |
| `libs/langchain_v1/langchain/agents/middleware/` | Middleware    |
| `libs/langgraph/langgraph/graph/state.py`        | StateGraph    |
| `libs/langgraph/langgraph/pregel/main.py`        | Pregel        |
| `libs/langgraph/langgraph/pregel/_loop.py`       | Runtime Loop  |
| `libs/langgraph/langgraph/pregel/_runner.py`     | Task Runner   |
| `libs/langgraph/langgraph/channels/`             | Channel       |
| `libs/prebuilt/langgraph/prebuilt/tool_node.py`  | ToolNode      |

实际路径可能随版本变化，应以当前安装包为准。

### 7.12 技术选型

| 场景               | 建议                   |
| ------------------ | ---------------------- |
| 标准工具调用 Agent | LangChain create_agent |
| 复杂业务 Workflow  | LangGraph              |
| 复杂状态管理       | LangGraph              |
| 人工审批和恢复     | LangGraph              |
| 极简定制 Agent     | 手写 Agent Loop        |
| 企业级长流程 Agent | LangGraph + LangChain  |

企业项目需要额外处理：

- 权限控制。
- 幂等性。
- 业务审计。
- 多租户。
- 数据脱敏。
- 持久化。
- 异常恢复。
- 执行轨迹。



## 8. MCP Server



### 8.1 MCP Server 的定义

MCP Server 是遵循 Model Context Protocol 的服务端程序，负责向 MCP Client 提供标准化的业务能力和上下文。

核心能力：

- Tools：可执行的业务操作。
- Resources：可读取的数据资源。
- Prompts：可复用的提示词模板。

MCP Server 本身不是 Agent，不负责模型决策、规划和 Agent Loop。

#### 8.1.1 MCP 的三个角色

| 角色   | 职责                                  |
| ------ | ------------------------------------- |
| Host   | AI 应用宿主，负责整体编排和用户交互   |
| Client | 负责 MCP 协议通信、能力发现和请求调用 |
| Server | 提供 Tools、Resources、Prompts        |

核心关系：

```text
Host
  |
  v
MCP Client
  |
  v
MCP Server
  |
  v
Business Service
  |
  v
Database / External API
```

### 8.2 MCP 协议架构

MCP 主要由数据层和传输层组成。

#### 8.2.1 Data Layer

数据层基于 JSON-RPC 2.0，定义：

- 请求和响应。
- 通知。
- 能力发现。
- Tools。
- Resources。
- Prompts。
- 协议版本和相关元数据。

#### 8.2.2 Transport Layer

传输层负责消息传输和通信机制。

主要方式：

- stdio。
- Streamable HTTP。

旧版 SSE 传输仍可能用于兼容，但不建议新项目采用。

#### 8.2.3 JSON-RPC 2.0

请求示例：

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/list",
  "params": {}
}
```

主要字段：

| 字段    | 作用          |
| ------- | ------------- |
| jsonrpc | JSON-RPC 版本 |
| id      | 请求关联 ID   |
| method  | 请求方法      |
| params  | 请求参数      |
| result  | 成功结果      |
| error   | 错误信息      |

常见 MCP 方法：

| 方法           | 作用             |
| -------------- | ---------------- |
| tools/list     | 获取工具列表     |
| tools/call     | 调用工具         |
| resources/list | 获取资源列表     |
| resources/read | 读取资源         |
| prompts/list   | 获取 Prompt 列表 |
| prompts/get    | 获取 Prompt      |

#### 8.2.4 2026-07-28 协议版本变化

当前官方最新规范为 2026-07-28。

重要变化：

- 移除传统协议初始化握手。
- 移除 Streamable HTTP 协议级 Session ID。
- 采用无状态请求模型。
- 每个请求通过 `_meta` 携带协议版本和相关客户端信息。
- 跨请求业务状态需要通过显式业务标识管理。

需要明确：

MCP 连接不等于业务会话，MCP Server 进程也不等于某个用户的会话。

退款、订单等业务状态应该保存在业务数据库中，不能依赖连接内存变量。

### 8.3 MCP Server 的三大核心能力

#### 8.3.1 Tools

Tools 提供可执行的业务操作。

例如：

- 查询订单。
- 查询物流。
- 创建退款。
- 发送通知。
- 创建工单。

示例：

```python
@mcp.tool()
def get_order_status(order_id: str) -> str:
    """查询指定订单的状态"""
    return f"订单 {order_id} 正在配送中"
```

工具发现和调用流程：

```text
tools/list
    |
    v
获取工具定义
    |
    v
提供给 Agent / LLM
    |
    v
模型产生 Tool Call
    |
    v
tools/call
    |
    v
MCP Server 执行
    |
    v
返回结果
```

#### 8.3.2 Resources

Resources 提供可读取的数据。

例如：

- 企业退款政策。
- 订单详情。
- 客户资料。
- 商品说明。
- 数据库 Schema。
- 日志和文档。

示例：

```python
@mcp.resource("company://policies/refund")
def refund_policy() -> str:
    """读取企业退款政策"""
    return "大额退款需要主管审批"
```

#### 8.3.3 Resource Template

Resource Template 支持参数化 URI。

```python
@mcp.resource("order://{order_id}")
def order_detail(order_id: str) -> str:
    """读取订单详情"""
    return f"订单 {order_id} 的详情"
```

例如：

```text
order://A10086
order://A10087
```

#### 8.3.4 Prompts

Prompts 提供可复用的提示词模板。

```python
@mcp.prompt()
def analyze_complaint(
    complaint: str,
    customer_level: str,
) -> str:
    """生成投诉分析提示词"""

    return f"""
    分析以下投诉：

    客户等级：{customer_level}
    投诉内容：{complaint}

    输出：
    1. 投诉原因
    2. 客户情绪
    3. 风险等级
    4. 建议方案
    """
```

#### 8.3.5 三者对比

| 比较项             | Tools               | Resources      | Prompts      |
| ------------------ | ------------------- | -------------- | ------------ |
| 职责               | 执行业务操作        | 提供数据       | 提供提示词   |
| 典型控制方         | 模型驱动，Host 控制 | 应用驱动       | 用户驱动     |
| 调用方法           | tools/call          | resources/read | prompts/get  |
| 是否可能产生副作用 | 是                  | 通常不应该     | 通常不会     |
| 示例               | 创建退款            | 读取退款政策   | 退款分析模板 |

记忆方式：

- Tool：做事情。
- Resource：提供数据。
- Prompt：提供任务模板。

### 8.4 Python MCP Server 开发

#### 8.4.1 安装

推荐使用 MCP 官方 Python SDK v2：

```bash
uv add "mcp[cli]"
```

或者：

```bash
pip install "mcp[cli]"
```

要求 Python 3.11+。

#### 8.4.2 SDK 版本差异

| SDK  | 服务端类  | 导入路径             |
| ---- | --------- | -------------------- |
| v1   | FastMCP   | `mcp.server.fastmcp` |
| v2   | MCPServer | `mcp.server`         |

v2 示例：

```python
from mcp.server import MCPServer

mcp = MCPServer(
    name="order-server",
    instructions="企业订单服务",
    version="1.0.0",
)
```

注意：大量旧教程使用 v1 API，不要直接混用 v1 和 v2 的导入路径及启动参数。

#### 8.4.3 创建 Tool

```python
@mcp.tool()
def get_order_status(order_id: str) -> dict:
    """查询订单状态"""

    return {
        "order_id": order_id,
        "status": "shipping",
    }
```

SDK 根据类型注解生成输入 Schema，根据函数文档生成工具描述。

#### 8.4.4 创建 Resource

```python
@mcp.resource("company://policies/refund")
def refund_policy() -> str:
    """获取退款政策"""
    return "大额退款需要主管审批"
```

#### 8.4.5 创建 Resource Template

```python
@mcp.resource("order://{order_id}")
def order_detail(order_id: str) -> str:
    """获取订单详情"""
    return f"订单 {order_id} 的详情"
```

#### 8.4.6 创建 Prompt

```python
@mcp.prompt()
def summarize_order(order_id: str) -> str:
    """生成订单分析提示词"""

    return f"请分析订单 {order_id} 的当前状态"
```

#### 8.4.7 完整 Server 示例

```python
from mcp.server import MCPServer

mcp = MCPServer(
    name="order-server",
    instructions="企业订单和物流服务",
    version="1.0.0",
)


@mcp.tool()
def get_order_status(order_id: str) -> dict:
    """查询订单状态"""
    return {
        "order_id": order_id,
        "status": "shipping",
    }


@mcp.tool()
def get_logistics(order_id: str) -> dict:
    """查询物流轨迹"""
    return {
        "order_id": order_id,
        "events": [
            "已出库",
            "运输中",
            "到达配送站",
        ],
    }


@mcp.resource("company://policies/refund")
def refund_policy() -> str:
    """读取退款政策"""
    return "大额退款需要主管审批"


@mcp.prompt()
def summarize_order(order_id: str) -> str:
    """生成订单分析提示词"""
    return f"请分析订单 {order_id}"


if __name__ == "__main__":
    mcp.run()
```

### 8.5 传输方式

#### 8.5.1 stdio

通过标准输入输出通信。

```text
Host / MCP Client
       |
       | stdin / stdout
       |
MCP Server 子进程
```

特点：

- Host 启动子进程。
- stdin 接收请求。
- stdout 返回协议消息。
- 不需要监听端口。
- 适合本地 MCP Server。

启动：

```python
if __name__ == "__main__":
    mcp.run()
```

调试：

```bash
uv run mcp dev server.py
```

注意：

stdout 是协议通信通道，不要使用普通 `print()` 输出调试日志。

应该使用 logging，避免破坏协议消息流。

#### 8.5.2 Streamable HTTP

用于远程 MCP Server。

```text
MCP Client
    |
    | HTTP
    v
MCP Server
    |
    v
Business Service
```

启动：

```python
if __name__ == "__main__":
    mcp.run(
        transport="streamable-http",
        host="0.0.0.0",
        port=8000,
        json_response=True,
        stateless_http=True,
    )
```

特点：

- 通过 HTTP 通信。
- 适合远程服务。
- 可以部署在云端。
- 可以供多个 Agent 共享。
- 可以结合 HTTP 认证机制。

#### 8.5.3 传输方式对比

| 对比          | stdio        | Streamable HTTP |
| ------------- | ------------ | --------------- |
| 通信方式      | 标准输入输出 | HTTP            |
| 运行方式      | 子进程       | 服务进程        |
| 监听端口      | 不需要       | 需要            |
| 场景          | 本地工具     | 远程服务        |
| 多 Agent 共享 | 不方便       | 方便            |
| 网络认证      | 环境凭证等   | HTTP 认证机制   |

新项目优先考虑：

- 本地开发：stdio。
- 企业远程部署：Streamable HTTP。

### 8.6 Server 运行机制

基本流程：

```text
创建 MCPServer
      |
      v
注册 Tools / Resources / Prompts
      |
      v
选择 Transport
      |
      v
启动 Server
      |
      v
接收 MCP 请求
      |
      v
识别请求方法
      |
      +---- tools/list
      |        |
      |        v
      |     返回工具定义
      |
      +---- tools/call
      |        |
      |        v
      |     参数校验
      |        |
      |        v
      |     执行业务函数
      |        |
      |        v
      |     返回结果
      |
      +---- resources/read
      |
      +---- prompts/get
```

SDK 负责协议解析、Schema 校验和结果转换，业务开发者主要实现业务处理函数。

#### 8.6.1 Capabilities

Capabilities 用于声明 Server 支持的能力。

例如：

- Tools。
- Resources。
- Prompts。
- Logging。
- 其他可选能力。

只实现项目需要的能力，不需要强行实现全部功能。

#### 8.6.2 动态工具列表

MCP 支持工具列表变化通知。

例如：

- 工具下线。
- 新工具上线。
- 工具能力发生变化。

需要区分：

工具列表过滤和真正的权限校验不是一回事。

每次工具调用都必须进行服务端授权。

### 8.7 MCP Server 与 FastAPI 集成

#### 8.7.1 分层架构

```text
FastAPI Router
      |
      v
Business Service
      ^
      |
MCP Tool
```

业务逻辑应该由 Service 层统一实现。

REST API 和 MCP Tool 不应该重复编写业务规则。

#### 8.7.2 业务服务示例

```python
class OrderService:

    def get_order_status(self, order_id: str):
        return {
            "order_id": order_id,
            "status": "shipping",
        }
```

REST API：

```python
@router.get("/orders/{order_id}")
def get_order(order_id: str):
    return order_service.get_order_status(
        order_id
    )
```

MCP Tool：

```python
@mcp.tool()
def get_order_status(order_id: str) -> dict:
    """查询订单状态"""

    return order_service.get_order_status(
        order_id
    )
```

#### 8.7.3 挂载到 ASGI 应用

可以通过 SDK 的 Streamable HTTP ASGI 应用工厂挂载到现有服务。

v2 需要正确管理 `session_manager` 的 Lifespan：

```python
from contextlib import asynccontextmanager

from fastapi import FastAPI
from mcp.server import MCPServer


mcp = MCPServer("enterprise-mcp")


@mcp.tool()
def get_order_status(order_id: str) -> dict:
    """查询订单状态"""
    return {
        "order_id": order_id,
        "status": "shipping",
    }


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with mcp.session_manager.run():
        yield


app = FastAPI(lifespan=lifespan)

app.mount(
    "/mcp",
    mcp.streamable_http_app(
        json_response=True
    ),
)
```

生产部署需要进一步处理认证、并发、反向代理、优雅关闭和健康检查。

### 8.8 MCP Server 安全设计

#### 8.8.1 身份认证

远程 Server 可以结合：

- OAuth 2.0。
- JWT。
- 企业统一身份认证。
- API Key。
- 企业 API Gateway。

HTTP 传输需要遵循 MCP 的 HTTP Authorization 安全规范。

#### 8.8.2 权限控制

权限不能只依赖 Prompt 或 Tool Description。

必须在业务服务端进行校验。

#### 8.8.3 多租户隔离

```python
@mcp.tool()
def get_order_status(order_id: str) -> dict:
    """查询订单状态"""

    tenant_id = get_authenticated_tenant()

    return order_service.get_order(
        tenant_id=tenant_id,
        order_id=order_id,
    )
```

tenant_id 应从经过验证的认证上下文中获取，而不是直接信任模型提供的参数。

#### 8.8.4 幂等性

退款等有副作用的工具需要幂等机制。

```python
@mcp.tool()
def create_refund(
    order_id: str,
    idempotency_key: str,
) -> dict:
    """创建退款申请"""

    return refund_service.create(
        order_id=order_id,
        idempotency_key=idempotency_key,
    )
```

#### 8.8.5 审计

需要记录：

- request_id。
- tenant_id。
- user_id。
- tool_name。
- arguments。
- status。
- duration。
- error。

敏感字段必须脱敏。

### 8.9 MCP Server 与 REST API

| 比较项     | REST API             | MCP Server                  |
| ---------- | -------------------- | --------------------------- |
| 目标       | 面向应用提供业务接口 | 面向 AI 应用提供能力        |
| 协议       | HTTP                 | JSON-RPC + MCP Transport    |
| 接口描述   | OpenAPI              | Tools / Resources / Prompts |
| 能力发现   | API 文档或注册中心   | MCP Discovery               |
| 典型消费者 | Web、App、后端       | AI Host / MCP Client        |

MCP 不替代 REST API。

建议共用底层 Business Service：

```text
             Business Service
                    |
          +---------+---------+
          |                   |
          v                   v
       REST API           MCP Server
          |                   |
          v                   v
       Web/App             AI Agent
```

### 8.10 MCP Server 测试

#### 8.10.1 MCP Inspector

```bash
uv run mcp dev server.py
```

用于测试：

- Server 启动。
- Client 连接。
- 工具发现。
- 参数 Schema。
- 工具调用。
- Resource 读取。
- Prompt 获取。

#### 8.10.2 内存 Client 测试

```python
import asyncio

from mcp import Client
from mcp.server import MCPServer


mcp = MCPServer("test-server")


@mcp.tool()
def add(a: int, b: int) -> int:
    """计算两个数字之和"""
    return a + b


async def main():

    async with Client(mcp) as client:

        tools = await client.list_tools()

        print(tools)

        result = await client.call_tool(
            "add",
            {
                "a": 10,
                "b": 20,
            },
        )

        print(result)


asyncio.run(main())
```

适合进行进程内协议测试。

#### 8.10.3 测试类型

| 类型        | 测试内容               |
| ----------- | ---------------------- |
| 启动测试    | Server 是否正常启动    |
| 发现测试    | 工具和资源是否正确暴露 |
| Schema 测试 | 参数和边界值           |
| 业务测试    | 订单、退款、物流逻辑   |
| 权限测试    | 越权访问               |
| 多租户测试  | 数据隔离               |
| 幂等测试    | 重复调用               |
| 异常测试    | 错误返回               |
| 并发测试    | 多请求执行             |
| 传输测试    | stdio 和 HTTP          |

### 8.11 企业级项目结构

```text
enterprise-agent/
├── app/
│   ├── main.py
│   ├── api/
│   │   ├── orders.py
│   │   └── refunds.py
│   ├── services/
│   │   ├── order_service.py
│   │   ├── logistics_service.py
│   │   └── refund_service.py
│   ├── repositories/
│   ├── mcp/
│   │   ├── server.py
│   │   ├── tools/
│   │   │   ├── order_tools.py
│   │   │   ├── logistics_tools.py
│   │   │   └── refund_tools.py
│   │   ├── resources/
│   │   └── prompts/
│   └── core/
│       ├── security.py
│       ├── logging.py
│       └── config.py
└── tests/
```

设计原则：

1. MCP Server 负责协议接入。
2. Tool 负责参数转换和业务调用。
3. Service 负责业务规则。
4. Repository 负责数据访问。
5. Security 负责身份和权限。
6. 所有业务操作必须有适当的审计和幂等机制。

### 8.12 MCP Server 与 Agent Runtime

| 模块             | 职责                |
| ---------------- | ------------------- |
| Agent Runtime    | Agent 执行控制      |
| LangGraph        | 业务节点与状态编排  |
| LangChain        | 模型和工具抽象      |
| MCP Client       | 连接外部 MCP Server |
| MCP Server       | 提供标准化能力      |
| Business Service | 执行真实业务规则    |
| Repository       | 数据访问            |

MCP 不会自动提供 Agent 的规划、记忆、审批和持久化执行能力。

这些属于 Agent Runtime 和业务系统的职责。

