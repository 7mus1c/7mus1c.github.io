# RAG 工程深度

## 1. RAG 系统架构与数据摄取

### 1.1 RAG 是什么

RAG 全称 Retrieval-Augmented Generation，即检索增强生成（检索增强生成）。

它是一种将外部知识检索与大语言模型生成能力结合起来的技术架构。

传统 LLM 的工作方式：

```text
用户问题
   |
   v
大语言模型
   |
   v
生成回答
```

传统 LLM 存在的问题：

1. 模型不知道企业内部的私有数据。
2. 模型训练数据可能已经过时。
3. 模型可能产生幻觉。
4. 企业知识发生变化后，模型不会自动知道。
5. 无法天然保证回答符合当前企业业务规则。

RAG 的工作方式：

```text
用户问题
   |
   v
问题处理
   |
   v
知识库检索
   |
   v
召回相关文档
   |
   v
构造 Prompt
   |
   v
大语言模型
   |
   v
生成回答
```

核心思想：

**先从外部知识源中检索相关信息，再将检索结果作为上下文提供给大模型，让模型基于这些信息回答问题。**

RAG 包含两个核心能力：

- Retrieval：负责找到相关知识。
- Generation：负责理解知识并生成回答。

RAG 的质量不仅取决于大模型，也取决于检索系统能否找到正确的知识。

#### 1.1.1 RAG 与 Embedding 的关系

RAG 不等于向量数据库，也不等于 Embedding。

Embedding 是将文本转换为向量表示的技术，是语义检索的一种基础能力。

RAG 还可以使用 BM25 关键词检索、混合检索等其他检索方法。

### 1.2 RAG 解决了什么问题

以企业售后工单 Agent 为例。

企业售后政策：

```text
普通商品：
签收后7天内，符合条件可以申请退款。

定制商品：
除质量问题外，不支持无理由退货。

质量问题：
用户需要提供商品照片或相关证明，
由售后人员审核后处理。
```

用户提出：

```text
我购买的定制商品已经签收5天，
发现商品有质量问题，可以退款吗？
```

如果没有 RAG，大模型可能根据一般电商经验回答，甚至错误地认为定制商品一律不能退款。

如果使用 RAG，系统可以检索：

- 定制商品售后规则。
- 质量问题处理规则。
- 退款审核要求。

然后让模型根据检索结果组织答案。

#### 1.2.1 企业私有知识接入

企业内部知识通常包括：

- 产品说明书。
- 售后政策。
- 退款规则。
- 物流规范。
- 内部 SOP。
- 历史工单。
- FAQ。
- 客服知识库。

这些内容不在大模型的训练数据中。

RAG 可以在不重新训练模型的情况下，让模型使用这些外部知识。

#### 1.2.2 知识实时更新

企业知识发生变化时，可以通过更新知识库，让后续检索获得新知识。

例如退款政策从签收后7天调整为15天。

实际工程中还需要考虑：

- 新旧版本管理。
- 生效时间。
- 失效时间。
- 文档冲突。
- 旧版本清理。
- 检索结果一致性。

不能简单地将新文档插入数据库就认为更新完成。

#### 1.2.3 降低模型幻觉

RAG 可以向模型提供明确的知识依据，减少模型凭空编造的情况。

但 RAG 不能保证模型绝对不产生幻觉。

可能的问题：

- 检索结果本身不准确。
- 相关文档没有被召回。
- 文档之间存在冲突。
- 模型错误理解检索结果。
- Prompt 没有限制模型只能基于证据回答。

#### 1.2.4 企业知识权限控制

企业知识可能具有不同访问权限。

例如：

| 知识内容     | 客户     | 普通客服   | 售后主管 |
| ------------ | -------- | ---------- | -------- |
| 公开售后政策 | 可访问   | 可访问     | 可访问   |
| 客户个人订单 | 仅本人   | 授权范围   | 授权范围 |
| 内部处理 SOP | 不可访问 | 可访问     | 可访问   |
| 投诉升级策略 | 不可访问 | 部分可访问 | 可访问   |

RAG 检索时需要结合用户身份、租户、角色和文档权限进行过滤。

### 1.3 RAG 系统整体架构

企业级 RAG 通常分成两个相对独立的流程：

1. 离线数据处理流程（Indexing Pipeline）。
2. 在线检索生成流程（Retrieval Pipeline）。

#### 1.3.1 离线数据处理流程

```text
企业原始数据
     |
     v
数据采集
     |
     v
文档解析
     |
     v
文本清洗
     |
     v
文档切片 Chunking
     |
     v
元数据补充
     |
     v
Embedding 向量化
     |
     v
写入向量数据库
     |
     v
建立检索索引
```

各环节职责：

| 环节       | 主要职责                        |
| ---------- | ------------------------------- |
| 数据采集   | 从企业数据源获取原始文档        |
| 文档解析   | 提取 PDF、Word、HTML 等内容     |
| 文本清洗   | 清除无效字符和无关内容          |
| 文档切片   | 将长文档拆分成可检索片段        |
| 元数据补充 | 添加文档 ID、来源、权限、版本等 |
| Embedding  | 将文本转换成向量                |
| 向量存储   | 保存向量和关联内容              |
| 建立索引   | 支持后续相似度检索              |

离线流程负责把企业知识变成可检索的数据，通常不需要在用户每次提问时重新执行。

#### 1.3.2 在线检索生成流程

```text
用户问题
   |
   v
Query 处理
   |
   v
问题向量化
   |
   v
向量数据库检索
   |
   v
召回 Top-K 文档
   |
   v
相关性重排序
   |
   v
构建上下文
   |
   v
构造 Prompt
   |
   v
LLM
   |
   v
生成答案
```

在线流程负责处理用户的实时请求。

例如用户询问：

```text
定制商品存在质量问题可以退款吗？
```

系统需要：

1. 理解用户问题。
2. 将问题转换为检索请求。
3. 从知识库中检索相关内容。
4. 对候选结果进行筛选和排序。
5. 将相关知识放入 Prompt。
6. 调用 LLM 生成答案。

#### 1.3.3 离线流程与在线流程的区别

| 对比维度 | 离线流程                   | 在线流程                 |
| -------- | -------------------------- | ------------------------ |
| 核心目标 | 构建知识索引               | 使用知识回答问题         |
| 输入     | 企业原始数据               | 用户问题                 |
| 输出     | 可检索知识库               | 最终答案                 |
| 执行时机 | 文档新增或更新时           | 用户提问时               |
| 主要关注 | 数据质量、处理效率         | 检索准确率、响应延迟     |
| 典型组件 | Parser、Chunker、Embedding | Retriever、Reranker、LLM |

拆分的原因：

- 两者性能要求不同。
- 两者生命周期不同。
- 可以独立扩缩容。
- 可以独立重试。
- 避免用户每次提问都重新处理知识库。

### 1.4 数据摄取（Data Ingestion）

Data Ingestion，也叫数据摄取。

它指的是将外部数据源中的数据采集、导入并转换为系统内部可处理数据的过程。

它是整个知识库的数据入口。

#### 1.4.1 企业常见数据源

| 数据源     | 数据示例             | 摄取方式           |
| ---------- | -------------------- | ------------------ |
| PDF        | 售后政策、产品说明书 | 文件上传、对象存储 |
| Word       | 内部 SOP、业务规范   | 文件上传           |
| HTML       | 企业帮助中心         | HTTP 抓取          |
| Markdown   | 技术文档、知识库     | 文件读取           |
| PostgreSQL | 商品、售后规则       | 数据库查询         |
| CRM        | 客户信息、工单记录   | API                |
| ERP        | 商品、订单信息       | API                |
| 对象存储   | 历史附件、图片       | SDK/API            |

不同数据源需要不同的接入和解析方式：

- PDF、Word：文档解析。
- HTML：网页正文提取。
- PostgreSQL：SQL 查询和数据转换。
- CRM、ERP：API 集成。
- 图片：OCR 或视觉模型。

#### 1.4.2 统一数据接入层

企业级 RAG 可以采用 Adapter 模式。

```text
                  Data Ingestion
                        |
          +-------------+-------------+
          |             |             |
          v             v             v
      PDF Adapter   HTML Adapter   DB Adapter
          |             |             |
          v             v             v
      PDF Parser    HTML Parser    SQL Query
          |             |             |
          +-------------+-------------+
                        |
                        v
                Standard Document
                        |
                        v
                  后续处理流程
```

不同数据源通过不同 Adapter 处理，最终输出统一的 Document 对象。

优点：

1. 隔离不同数据源的差异。
2. 方便新增数据源。
3. 独立处理异常和重试。
4. 统一管理文档版本和来源。
5. 方便实现增量更新。

#### 1.4.3 标准化 Document 模型

不同数据源的数据结构可能完全不同。

如果下游流程直接依赖不同数据结构，就会产生大量分支判断。

因此，需要定义统一的 Document 数据模型。

```python
from datetime import datetime, timezone
from pydantic import BaseModel, Field


class Document(BaseModel):
    document_id: str
    content: str
    source: str
    source_type: str
    title: str | None = None
    tenant_id: str
    version: int = 1

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    metadata: dict = Field(default_factory=dict)
```

使用示例：

```python
document = Document(
    document_id="refund-policy-001",
    content="普通商品签收后7天内，符合条件可以申请退款。",
    source="refund_policy.pdf",
    source_type="pdf",
    title="普通商品退款政策",
    tenant_id="tenant-001",
    version=1,
    metadata={
        "department": "after_sales",
        "category": "refund_policy",
    },
)
```

这里的 Document 是项目自定义的标准化数据模型，不是特定框架的 Document 类。

### 1.5 数据摄取的关键工程问题

#### 1.5.1 文档去重

常见问题：

```text
refund_policy.pdf
refund_policy_copy.pdf
refund_policy_final.pdf
```

它们可能是相同文件，也可能是不同版本。

不做去重可能导致：

- 相同知识重复召回。
- 检索结果被重复内容占据。
- 新旧政策同时出现。
- Token 浪费。

常见做法是计算文件内容 Hash：

```python
import hashlib


def calculate_hash(content: bytes) -> str:
    return hashlib.sha256(content).hexdigest()
```

可以使用 `tenant_id + content_hash` 作为去重的辅助依据。

注意：文件哈希相同只能说明文件字节内容相同；文件哈希不同，也不代表文档语义不同。

#### 1.5.2 增量更新

文档发生变化时，不应该每次重新处理整个知识库。

推荐流程：

```text
新文档上传
    |
    v
计算文档 Hash
    |
    v
检查是否发生变化
    |
    +---- 没变化 ----> 跳过
    |
    +---- 有变化
            |
            v
       创建新版本
            |
            v
       解析新文档
            |
            v
       重新切片
            |
            v
       重新 Embedding
            |
            v
       更新检索索引
```

生产系统需要考虑失败恢复，避免：

- 文档已更新，但向量尚未更新。
- 部分 Chunk 已更新，部分 Chunk 仍然是旧版本。
- 删除旧版本时误删新版本的数据。

建议将文档摄取设计为具有状态的异步任务：

```text
PENDING
   |
   v
PROCESSING
   |
   +------> FAILED
   |
   v
COMPLETED
```

#### 1.5.3 文档删除

文档删除时，需要同步清理：

1. 文档记录。
2. 对应 Chunk。
3. 向量记录。
4. 关键词检索索引。
5. 相关缓存。

推荐通过 `document_id` 关联所有 Chunk，便于准确定位和删除。

#### 1.5.4 多租户隔离

企业知识库可能包含不同租户的数据。

```text
tenant-A
  ├── 售后政策
  ├── 产品说明
  └── 历史工单

tenant-B
  ├── 售后政策
  ├── 产品说明
  └── 历史工单
```

必须保证 tenant-A 的用户不能检索到 tenant-B 的私有知识。

因此，`tenant_id` 应从数据摄取阶段就进入标准化文档对象，并贯穿 Chunk、向量存储和检索流程。

仅在文档中存储 tenant_id 并不等于完成隔离。在线检索必须在数据库查询层实施权限过滤。

### 1.6 项目中的 RAG 架构设计

企业售后工单 Agent 建议采用模块化单体：

```text
backend/
└── app/
    ├── rag/
    │   ├── ingestion/
    │   │   ├── base.py
    │   │   ├── pdf_adapter.py
    │   │   ├── html_adapter.py
    │   │   ├── database_adapter.py
    │   │   └── pipeline.py
    │   │
    │   ├── parsing/
    │   ├── chunking/
    │   ├── embedding/
    │   ├── retrieval/
    │   ├── reranking/
    │   ├── evaluation/
    │   └── schemas.py
    │
    ├── agents/
    ├── workflows/
    ├── tools/
    └── api/
```

模块职责：

| 模块       | 职责                       |
| ---------- | -------------------------- |
| ingestion  | 数据采集、导入、更新、删除 |
| parsing    | 文档解析                   |
| chunking   | 文档切片                   |
| embedding  | 文本向量化                 |
| retrieval  | 各类检索                   |
| reranking  | 检索结果重排序             |
| evaluation | RAG 质量评估               |
| schemas    | 统一数据模型               |

这是模块化单体的建议结构，不意味着每个目录都必须拆成独立微服务。

### 1.7 代码实践：实现最小数据摄取 Pipeline

本节实践目标：

1. 读取本地文本文件。
2. 转换成统一 Document。
3. 计算内容 Hash。
4. 判断文档是否变化。
5. 保存文档。
6. 记录文档版本。

技术要求：

- Python 3.10+
- 标准库，无需第三方依赖。

项目结构：

```text
rag_ingestion_demo/
├── main.py
└── documents/
    ├── refund_policy.txt
    └── logistics_policy.txt
```

完整实现：

```python
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from hashlib import sha256
from typing import Protocol


@dataclass
class Document:
    """统一文档模型：任何来源的文件经适配器转换后都归一化为该结构。"""
    document_id: str          # 文档唯一标识（此处取文件名 stem）
    content: str              # 正文内容
    source: str               # 来源路径（字符串形式）
    source_type: str          # 来源类型：txt / pdf / docx 等
    tenant_id: str            # 租户 ID，用于多租户隔离
    content_hash: str         # 正文 SHA-256，判断内容是否变化的依据
    version: int = 1          # 版本号，内容变更时递增
    created_at: datetime = field(
        default_factory=lambda: datetime.now(timezone.utc)  # UTC 创建时间
    )
    metadata: dict = field(default_factory=dict)  # 扩展元数据（文件名、大小等）


class DocumentAdapter(Protocol):
    """适配器协议：定义「文件 → Document」的统一接口。
    新增文件类型只需实现 load，即可接入管道，无需改动管道代码。"""
    def load(self, path: Path) -> Document:
        ...


class TxtAdapter:
    """纯文本适配器：UTF-8 读取正文并计算内容哈希。"""
    def load(self, path: Path) -> Document:
        content = path.read_text(encoding="utf-8")       # 以 UTF-8 读取全文
        content_hash = sha256(
            content.encode("utf-8")
        ).hexdigest()                                     # 正文哈希 → 幂等依据
        return Document(
            document_id=path.stem,                        # 不含扩展名的文件名作 ID
            content=content,
            source=str(path),
            source_type="txt",
            tenant_id="tenant-001",                       # TODO: 应由上下文/配置注入，勿硬编码
            content_hash=content_hash,
            metadata={
                "filename": path.name,                    # 保留原始文件名
            },
        )


class DocumentStore:
    """内存文档仓库：按 document_id 存取。生产环境可替换为 DB / 搜索引擎。"""
    def __init__(self):
        self.documents: dict[str, Document] = {}

    def get(self, document_id: str):
        """按 ID 查询，不存在返回 None。"""
        return self.documents.get(document_id)

    def save(self, document: Document):
        """保存（覆盖写）文档。"""
        self.documents[document.document_id] = document

    def list_all(self):
        """返回全部文档。"""
        return list(self.documents.values())


class IngestionPipeline:
    """摄取管道：加载 → 去重判断 → 版本管理 → 落库。
    核心是幂等：内容未变跳过，内容变化升版本。"""
    def __init__(
        self,
        adapter: DocumentAdapter,
        store: DocumentStore,
    ):
        self.adapter = adapter
        self.store = store

    def ingest(self, path: Path):
        """摄取单个文件。"""
        document = self.adapter.load(path)                # 1. 加载为统一模型
        existing = self.store.get(
            document.document_id
        )                                                 # 2. 查询是否已存在
        if (
            existing
            and existing.content_hash == document.content_hash
        ):
            print(f"[SKIP] {document.document_id}")        # 内容未变 → 跳过（幂等）
            return
        if existing:
            document.version = existing.version + 1       # 内容变化 → 版本 +1
            print(
                f"[UPDATE] {document.document_id}, "
                f"version={document.version}"
            )
        else:
            print(f"[CREATE] {document.document_id}")     # 首次摄取
        self.store.save(document)                         # 3. 落库
        print(
            f"[SUCCESS] {document.document_id}, "
            f"hash={document.content_hash[:12]}"          # 短哈希便于日志追踪
        )


def main():
    """入口：扫描 documents 下的 .txt 逐个摄取，最后打印入库摘要。"""
    document_dir = Path("documents")
    store = DocumentStore()
    adapter = TxtAdapter()
    pipeline = IngestionPipeline(
        adapter=adapter,
        store=store,
    )
    for path in document_dir.glob("*.txt"):              # 仅处理 txt 文件
        pipeline.ingest(path)
    for document in store.list_all():                    # 汇总输出最终状态
        print({
            "document_id": document.document_id,
            "tenant_id": document.tenant_id,
            "version": document.version,
            "source_type": document.source_type,
        })


if __name__ == "__&#8203;main__":
    main()

```

第一次执行会创建文档，第二次执行会跳过未变化的文档。修改文档内容后再次执行，会创建新版本。

这是最小实验，存储使用内存字典，程序退出后数据会消失。

生产环境还需要：

- PostgreSQL 持久化文档记录。
- 对象存储保存原始文件。
- 摄取任务状态和重试机制。
- 多租户隔离。
- Chunk、Embedding 和索引版本管理。
- 并发更新控制。
- 失败恢复和旧版本清理。

### 1.8 技术选型与架构取舍

#### 1.8.1 为什么采用统一 Document 模型

统一模型可以屏蔽不同数据源之间的数据结构差异。

下游 Chunking、Embedding、Retrieval 不需要关心数据最初来自哪里。

代价是需要设计标准字段，以及承载不同数据源特殊属性的 metadata。

#### 1.8.2 为什么摄取流程不应该直接绑定向量数据库

不推荐：

```text
PDF Parser
    |
    v
直接调用 Qdrant
```

更推荐：

```text
PDF Parser
    |
    v
标准化 Document
    |
    v
Chunking
    |
    v
Embedding
    |
    v
Vector Store
```

原因：

- 可以迁移向量数据库。
- 可以增加 BM25。
- 可以同时维护多个检索索引。
- 可以独立重建 Embedding。
- 数据摄取与检索存储的生命周期不同。

#### 1.8.3 PostgreSQL、对象存储和向量数据库如何分工

| 组件                            | 主要职责                         |
| ------------------------------- | -------------------------------- |
| PostgreSQL                      | 文档元数据、版本、任务状态、权限 |
| 对象存储                        | 原始 PDF、Word、HTML 等文件      |
| pgvector                        | 向量存储与相似度检索             |
| PostgreSQL 全文检索或 BM25 组件 | 关键词检索                       |

当前项目建议先使用 PostgreSQL + pgvector 构建完整链路，再根据实际需求比较 Milvus 和 Qdrant。



## 2. 文档解析与切片策略

### 2.1 文档解析的作用

企业知识通常以 PDF、Word、HTML、Excel 等格式存在，大模型和 Embedding 模型不能直接理解任意原始文件。

因此需要先进行文档解析，将原始文件转换为系统可以处理的结构化内容。

```text
原始文件
   |
   v
文档解析 Parser
   |
   v
文本与结构提取
   |
   v
内容清洗
   |
   v
统一 Document
   |
   v
Chunking
   |
   v
Embedding
```

文档解析不只是提取文字，还应该尽可能保留：

- 标题与章节关系。
- 段落边界。
- 表格结构。
- 页码。
- 列表关系。
- 图片及其说明。
- 文档来源。

### 2.2 常见文档格式及解析工具

#### 2.2.1 PDF

常用工具：

| 工具       | 用途                       |
| ---------- | -------------------------- |
| PyMuPDF    | PDF 文本、页面和布局提取   |
| pypdf      | PDF 页面读取和基础文本提取 |
| pdfplumber | 文本、表格和布局分析       |
| OCR 工具   | 扫描件文字识别             |

PDF 分为两类：

1. 文本型 PDF：包含可提取的文本层。
2. 扫描型 PDF：页面主要是图片，需要 OCR。

PyMuPDF 示例：

```python
import pymupdf


def parse_pdf(file_path: str) -> list[dict]:
    results = []

    with pymupdf.open(file_path) as pdf:
        for page_number, page in enumerate(pdf, start=1):
            text = page.get_text("text")

            results.append({
                "page_number": page_number,
                "content": text,
            })

    return results
```

需要注意：

- 双栏 PDF 可能出现阅读顺序错乱。
- 表格可能被提取成无序文本。
- 页眉页脚可能污染正文。
- 扫描件可能提取不到文字。
- 特殊字体可能导致字符编码异常。

#### 2.2.2 Word

常用工具：`python-docx`。

安装：

```bash
pip install python-docx
```

示例：

```python
from docx import Document


def parse_word(file_path: str) -> dict:
    doc = Document(file_path)

    paragraphs = []

    for paragraph in doc.paragraphs:
        text = paragraph.text.strip()

        if text:
            paragraphs.append({
                "style": paragraph.style.name,
                "text": text,
            })

    tables = []

    for table in doc.tables:
        rows = []

        for row in table.rows:
            rows.append([
                cell.text.strip()
                for cell in row.cells
            ])

        tables.append(rows)

    return {
        "paragraphs": paragraphs,
        "tables": tables,
    }
```

注意：分别提取 `paragraphs` 和 `tables` 不能完整保留两者在原文中的交错顺序。顺序重要时，需要按文档实际块级元素顺序遍历。

#### 2.2.3 HTML

常用工具：

- BeautifulSoup：HTML 解析和元素提取。
- trafilatura：网页正文提取。
- Readability：提取主要文章内容。

安装：

```bash
pip install beautifulsoup4
```

示例：

```python
from bs4 import BeautifulSoup


def parse_html(html: str) -> str:
    soup = BeautifulSoup(html, "html.parser")

    for tag in soup([
        "script",
        "style",
        "nav",
        "footer",
        "header",
    ]):
        tag.decompose()

    main = (
        soup.find("main")
        or soup.find("article")
        or soup.body
        or soup
    )

    return main.get_text(
        separator="\n",
        strip=True,
    )
```

生产环境应根据页面实际结构提取正文，不能假设所有网站的正文都位于 `main` 或 `article` 中。

#### 2.2.4 Excel

常用工具：`openpyxl`。

安装：

```bash
pip install openpyxl
```

示例：

```python
from openpyxl import load_workbook


def parse_excel(file_path: str) -> list[dict]:
    workbook = load_workbook(
        file_path,
        read_only=True,
        data_only=True,
    )

    results = []

    for sheet in workbook.worksheets:
        rows = sheet.iter_rows(values_only=True)

        headers = next(rows, None)

        if not headers:
            continue

        headers = [
            str(value) if value is not None else ""
            for value in headers
        ]

        for row in rows:
            item = dict(zip(headers, row))

            results.append({
                "sheet": sheet.title,
                "data": item,
            })

    return results
```

Excel 解析需要考虑：

- 合并单元格。
- 多级表头。
- 空行和空列。
- 公式及缓存值。
- 多个 Sheet。
- 单元格之间的关联关系。

### 2.3 统一文档解析结果

不同文件解析完成后，应该输出统一结构。

```python
from pydantic import BaseModel, Field


class ParsedBlock(BaseModel):
    content: str

    block_type: str = "paragraph"

    page_number: int | None = None

    heading: str | None = None

    order: int = 0

    metadata: dict = Field(default_factory=dict)


class ParsedDocument(BaseModel):
    document_id: str

    title: str

    source: str

    source_type: str

    blocks: list[ParsedBlock]
```

使用 `blocks` 而不是单一 `content` 字段，可以保留：

- 标题块。
- 段落块。
- 表格块。
- 图片说明块。
- 页码和原文顺序。

这些信息可以支持后续结构化切片、原文定位和引用生成。

### 2.4 Chunking 是什么

Chunking，也叫文档切片。

它指的是将较长的文档拆分成多个较小文本单元的过程。

例如：

原始文档：

```text
售后退款政策

第一章：普通商品退款规则

普通商品签收后7天内，符合条件可以申请退款。

第二章：定制商品退款规则

定制商品不支持无理由退货。
如果存在质量问题，可以提交售后申请。
```

切片后：

```text
Chunk 1：

第一章：普通商品退款规则

普通商品签收后7天内，符合条件可以申请退款。
Chunk 2：

第二章：定制商品退款规则

定制商品不支持无理由退货。
如果存在质量问题，可以提交售后申请。
```

每个 Chunk 都可以独立进行 Embedding 和检索。

#### 2.4.1 为什么需要 Chunking

1. 整份文档可能超过 Embedding 模型输入长度。
2. 一个向量难以准确代表长文档的多个主题。
3. 检索时无法精准定位相关内容。
4. 整份文档进入 Prompt 会浪费上下文窗口。
5. 无关内容会干扰模型回答。

### 2.5 Chunk Size 与 Chunk Overlap

#### 2.5.1 Chunk Size

Chunk Size 表示单个 Chunk 的目标长度。

太大可能造成：

- 多个主题混合。
- 向量语义不够集中。
- 检索结果包含大量无关信息。
- Prompt 上下文浪费。

太小可能造成：

- 语义不完整。
- 上下文丢失。
- 关键词与解释分离。
- 检索结果无法独立回答问题。

#### 2.5.2 Chunk Overlap

Chunk Overlap 表示相邻 Chunk 之间重复保留的内容长度。

例如：

```text
原始文本：

A B C D E F G H I J
```

切片：

```text
Chunk 1：
A B C D E F

Chunk 2：
E F G H I J
```

`E F` 是重叠内容。

Overlap 可以减少边界信息丢失，但也会增加存储量、Embedding 成本和重复召回。

Chunk Size 和 Overlap 不存在适用于所有知识库的统一最佳值，需要通过实验确定。

### 2.6 固定长度切片（Fixed-size Chunking）

按照预设长度直接拆分文本。

```python
def fixed_chunk(
    text: str,
    chunk_size: int = 100,
    overlap: int = 20,
) -> list[str]:

    if chunk_size <= 0:
        raise ValueError("chunk_size 必须大于 0")

    if overlap < 0 or overlap >= chunk_size:
        raise ValueError("overlap 必须满足 0 <= overlap < chunk_size")

    chunks = []
    start = 0

    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end].strip()

        if chunk:
            chunks.append(chunk)

        start += chunk_size - overlap

    return chunks
```

优点：

- 实现简单。
- 处理速度快。
- 参数容易控制。
- 适合结构简单的文本。

缺点：

- 可能从句子中间切开。
- 可能破坏段落结构。
- 可能把不同主题混合在一起。
- 不理解文档语义。

适合结构简单、文本边界不明显的内容，可以作为初始方案。

### 2.7 递归字符切片（Recursive Character Chunking）

核心思想：

**优先按照更自然的文本边界切分，如果内容仍然太长，再逐级使用更细的分隔符。**

例如：

```python
separators = [
    "\n\n",
    "\n",
    "。",
    "！",
    "？",
    "；",
    "，",
    "",
]
```

切分优先级：

1. 段落。
2. 换行。
3. 句子。
4. 更细的标点。
5. 字符。

使用 LangChain：

安装：

```bash
pip install langchain-text-splitters
```

示例：

```python
from langchain_text_splitters import (
    RecursiveCharacterTextSplitter,
)

splitter = RecursiveCharacterTextSplitter(
    chunk_size=300,
    chunk_overlap=50,
    separators=[
        "\n\n",
        "\n",
        "。",
        "！",
        "？",
        "；",
        "，",
        "",
    ],
)

chunks = splitter.split_text(text)
```

优点：

- 更关注自然文本边界。
- 实现成熟。
- 参数可配置。
- 适合大多数普通文本知识库。

缺点：

- 不真正理解语义。
- 无法保证业务规则完整。
- 表格和复杂文档结构仍需单独处理。

注意：`chunk_size` 默认按字符长度计算，不等于 Token 数量。

### 2.8 语义切片（Semantic Chunking）

核心思想：

**根据文本之间的语义关系决定切分位置，而不是只根据字符数量或标点符号切分。**

典型实现流程：

1. 按句子或段落拆分文本。
2. 对每个段落计算 Embedding。
3. 计算相邻段落之间的语义相似度。
4. 相似度低于阈值时判断为主题边界。
5. 根据边界合并为 Chunk。
6. 检查 Chunk 长度，过长时进一步切分。

余弦相似度：

[
Similarity(A,B)=
\frac{A\cdot B}{|A||B|}
]

伪代码：

```python
paragraphs = split_into_paragraphs(text)

embeddings = embedding_model.embed_documents(
    paragraphs
)

similarities = []

for index in range(len(embeddings) - 1):
    score = cosine_similarity(
        embeddings[index],
        embeddings[index + 1],
    )

    similarities.append(score)

boundaries = find_semantic_boundaries(
    similarities,
    threshold=0.65,
)

chunks = merge_by_boundaries(
    paragraphs,
    boundaries,
)
```

优点：

- 更关注主题完整性。
- 有机会减少无关内容混合。
- 适合主题变化明显的长文档。

缺点：

- 需要额外 Embedding 调用。
- 离线处理成本较高。
- 阈值需要实验确定。
- 相邻段落相似度不一定代表业务主题相同。
- 可能把业务上必须关联的内容拆开。

### 2.9 三种切片策略对比

| 对比维度         | 固定长度          | 递归字符     | 语义切片            |
| ---------------- | ----------------- | ------------ | ------------------- |
| 切分依据         | 字符或 Token 数量 | 分隔符优先级 | 语义相似度          |
| 实现复杂度       | 低                | 中           | 高                  |
| 是否关注文本结构 | 否                | 是           | 间接关注            |
| 是否理解语义     | 否                | 否           | 使用 Embedding 判断 |
| 处理成本         | 低                | 低到中       | 较高                |
| 适合场景         | 简单文本          | 通用知识文档 | 主题复杂的长文档    |

企业 RAG 可以组合使用：

```text
文档解析
   |
   v
识别标题、段落、表格
   |
   v
优先按文档结构切分
   |
   v
对过长段落使用递归字符切片
   |
   v
对特殊长文档考虑语义切片
   |
   v
生成最终 Chunk
```

### 2.10 企业级结构感知切片

售后政策可能包含：

```text
第三章：退款政策

3.1 普通商品退款

普通商品签收后7天内，符合条件可以申请退款。

3.2 定制商品退款

定制商品不支持无理由退货。

3.3 质量问题处理

如果商品存在质量问题，用户可以提交售后申请。
需要提供商品照片，由售后人员审核。
```

建议切片结果：

```text
Chunk 1：
第三章 > 3.1 普通商品退款

普通商品签收后7天内，符合条件可以申请退款。

Chunk 2：
第三章 > 3.2 定制商品退款

定制商品不支持无理由退货。

Chunk 3：
第三章 > 3.3 质量问题处理

如果商品存在质量问题，用户可以提交售后申请。
需要提供商品照片，由售后人员审核。
```

核心原则：

**Chunk 不只是文本片段，还应该尽可能保留它在原始文档中的语义和结构。**

### 2.11 Chunk 参数评估

Chunk Size 和 Overlap 应由评估集和实验结果驱动。

可以观察：

- Recall@K。
- Precision@K。
- MRR。
- NDCG。
- 检索上下文冗余程度。
- 最终回答正确率。
- Token 成本。
- 响应延迟。

Chunk Size 的选择应结合知识库内容、Embedding 模型输入限制和实际检索结果。

### 2.12 代码实践：文档解析与切片

依赖：

```bash
pip install pymupdf python-docx beautifulsoup4 langchain-text-splitters
```

PDF 解析：

```python
import pymupdf


def parse_pdf(file_path: str) -> str:
    pages = []

    with pymupdf.open(file_path) as pdf:
        for page_number, page in enumerate(pdf, start=1):
            content = page.get_text("text").strip()

            if content:
                pages.append(
                    f"[Page {page_number}]\n{content}"
                )

    return "\n\n".join(pages)
```

固定长度切片：

```python
def fixed_chunk(
    text: str,
    chunk_size: int = 500,
    overlap: int = 50,
) -> list[str]:

    if chunk_size <= 0:
        raise ValueError("chunk_size 必须大于 0")

    if overlap < 0 or overlap >= chunk_size:
        raise ValueError("overlap 必须满足 0 <= overlap < chunk_size")

    chunks = []
    start = 0

    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end].strip()

        if chunk:
            chunks.append(chunk)

        start += chunk_size - overlap

    return chunks
```

递归字符切片：

```python
from langchain_text_splitters import (
    RecursiveCharacterTextSplitter,
)


def recursive_chunk(
    text: str,
    chunk_size: int = 500,
    overlap: int = 50,
) -> list[str]:

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=overlap,
        separators=[
            "\n\n",
            "\n",
            "。",
            "！",
            "？",
            "；",
            "，",
            "",
        ],
    )

    return splitter.split_text(text)
```

完整执行：

```python
def main():

    text = parse_pdf(
        "documents/refund_policy.pdf"
    )

    fixed_chunks = fixed_chunk(
        text,
        chunk_size=500,
        overlap=50,
    )

    recursive_chunks = recursive_chunk(
        text,
        chunk_size=500,
        overlap=50,
    )

    print("固定长度切片数量：", len(fixed_chunks))
    print("递归字符切片数量：", len(recursive_chunks))

    for index, chunk in enumerate(recursive_chunks):
        print(f"\nChunk {index + 1}")
        print(chunk)


if __name__ == "__main__":
    main()
```

注意：示例中的长度单位是字符，不是 Token。语义切片需要额外接入 Embedding 模型。

## 3. Chunk Metadata 设计

### 3.1 什么是 Chunk Metadata

Chunk Metadata（Chunk 元数据）是附加在文本片段上的结构化信息，用于描述 Chunk 的来源、位置、归属、版本和数据处理过程。

一个完整的 Chunk 不应该只有正文：

```python
chunk = "符合条件的商品可以在签收后 7 天内申请退货。"
```

而应该包含正文和结构化元数据：

```python
chunk = {
    "content": "符合条件的商品可以在签收后 7 天内申请退货。",
    "metadata": {
        "document_id": "doc_10001",
        "chunk_id": "chunk_10001_0001",
        "chunk_index": 0,
        "source_name": "售后退货政策.pdf",
        "page_number": 3,
        "section_path": "售后政策/退款规则/退货条件",
        "tenant_id": "tenant_001",
        "document_version": "v3",
        "status": "active"
    }
}
```

核心区别：

- `content`：参与语义检索和 LLM 上下文构建的正文。
- `metadata`：描述正文来源、位置、版本和归属的结构化数据。

Metadata 主要服务于检索过滤、来源追踪、引用展示、数据维护和权限控制。

### 3.2 Metadata 解决的问题

#### 3.2.1 来源追踪

系统需要知道检索结果来自哪份文档、哪个页面、哪个章节，以及如何跳转到原始文档。

常用字段：

- `document_id`
- `source_name`
- `source_uri`
- `page_number`
- `section_path`

#### 3.2.2 检索过滤

可以按照业务分类缩小检索范围：

```python
filters = {
    "document_type": "refund_policy",
    "status": "active"
}
```

Metadata Filter 决定哪些数据有资格参与检索。

Vector Similarity 决定符合过滤条件的数据中哪些内容与 Query 更相似。

两者解决的是不同问题。

#### 3.2.3 文档版本管理

文档可能有多个版本，需要避免旧政策和新政策同时参与默认检索。

建议记录：

```python
{
    "document_version": "v3",
    "status": "active",
    "effective_from": "2026-01-01T00:00:00Z",
    "effective_to": None
}
```

需要区分：

- `document_version`：文档版本标识。
- `effective_from`：业务生效时间。
- `effective_to`：业务失效时间。
- `status`：系统当前管理状态。

文档更新时间不等于业务政策生效时间。

#### 3.2.4 多租户数据隔离

SaaS 系统通常需要为每个 Chunk 记录所属租户：

```python
{
    "tenant_id": "tenant_001"
}
```

租户身份和权限过滤条件必须由服务端可信地确定，不能直接相信用户输入或 LLM 自行生成的租户 ID。

完整的多租户权限模型和 ACL 设计在本部分第十节展开。

### 3.3 企业级 Metadata 字段设计

#### 3.3.1 文档身份字段

| 字段                 | 类型    | 作用                 |
| -------------------- | ------- | -------------------- |
| `document_id`        | string  | 逻辑文档唯一标识     |
| `chunk_id`           | string  | 具体 Chunk 唯一标识  |
| `chunk_index`        | integer | Chunk 在文档中的顺序 |
| `document_version`   | string  | 文档版本             |
| `parent_document_id` | string  | 逻辑父文档标识，可选 |

`document_id` 标识逻辑文档，`chunk_id` 标识具体切片，`chunk_index` 标识切片在文档中的顺序。

不要只使用 `document_id + chunk_index` 作为长期稳定的 Chunk 身份，因为文档插入内容后，后续 Chunk 的索引可能发生变化。

建议使用版本化标识或内容指纹：

```text
document_id: policy_refund_001
document_version: v3
chunk_id: policy_refund_001_v3_a8f31c
```

#### 3.3.2 来源定位字段

| 字段           | 类型    | 作用             |
| -------------- | ------- | ---------------- |
| `source_uri`   | string  | 原始文档地址     |
| `source_name`  | string  | 原始文件名称     |
| `file_type`    | string  | pdf/docx/html 等 |
| `page_number`  | integer | 页面位置         |
| `section_path` | string  | 章节路径         |
| `start_offset` | integer | 起始位置         |
| `end_offset`   | integer | 结束位置         |

Offset 必须明确计算口径，例如：

- 原始文件字节偏移。
- 解析后全文的字符偏移。
- Token 偏移。

不能混用不同偏移口径。

#### 3.3.3 文档分类字段

| 字段            | 类型         | 作用     |
| --------------- | ------------ | -------- |
| `document_type` | string       | 文档类型 |
| `category`      | string       | 业务分类 |
| `tags`          | list[string] | 标签     |
| `language`      | string       | 文档语言 |
| `department`    | string       | 所属部门 |

示例：

```python
{
    "document_type": "policy",
    "category": "refund",
    "tags": ["售后", "退款", "退货"],
    "language": "zh-CN",
    "department": "customer_service"
}
```

#### 3.3.4 生命周期字段

| 字段             | 类型          | 作用         |
| ---------------- | ------------- | ------------ |
| `status`         | string        | 系统管理状态 |
| `created_at`     | datetime      | 创建时间     |
| `updated_at`     | datetime      | 更新时间     |
| `effective_from` | datetime      | 生效时间     |
| `effective_to`   | datetime/null | 失效时间     |
| `deleted_at`     | datetime/null | 删除时间     |

不能仅通过 `updated_at` 判断政策是否有效。

#### 3.3.5 数据处理字段

| 字段               | 类型     | 作用               |
| ------------------ | -------- | ------------------ |
| `parser_version`   | string   | 解析器版本         |
| `chunking_version` | string   | 切片策略版本       |
| `embedding_model`  | string   | Embedding 模型标识 |
| `content_hash`     | string   | 内容哈希           |
| `indexed_at`       | datetime | 最近索引时间       |

这些字段用于追踪数据处理链路，支持解析器升级、切片策略调整和 Embedding 模型迁移。

`embedding_model` 也可以放在向量集合或索引级别，具体取决于是否允许不同模型的向量共存。

### 3.4 使用 Pydantic 定义 Metadata Schema

企业工程中应该使用统一的数据结构，避免不同模块随意传递字典。

```python
from datetime import datetime, timezone
from typing import Optional

from pydantic import BaseModel, Field


class ChunkMetadata(BaseModel):
    # 身份信息
    document_id: str
    chunk_id: str
    chunk_index: int = Field(ge=0)

    # 来源信息
    source_name: str
    source_uri: Optional[str] = None
    file_type: Optional[str] = None

    # 文档位置
    page_number: Optional[int] = Field(default=None, ge=1)
    section_path: Optional[str] = None
    start_offset: Optional[int] = Field(default=None, ge=0)
    end_offset: Optional[int] = Field(default=None, ge=0)

    # 业务分类
    document_type: Optional[str] = None
    category: Optional[str] = None
    tags: list[str] = Field(default_factory=list)

    # 租户与版本
    tenant_id: str
    document_version: str = "v1"

    # 生命周期
    status: str = "active"
    effective_from: Optional[datetime] = None
    effective_to: Optional[datetime] = None

    # 处理信息
    parser_version: Optional[str] = None
    chunking_version: Optional[str] = None
    embedding_model: Optional[str] = None
    content_hash: Optional[str] = None

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
```

注意：

1. 使用 `default_factory=list` 避免共享可变默认列表。
2. 使用 `Field(ge=0)` 等约束校验字段范围。
3. 企业多租户场景中，`tenant_id` 通常应该是必填字段。
4. 页面信息只有在解析器能够提供时才填写。
5. 时间字段建议使用带时区的 UTC 时间。
6. 生产环境应进一步定义状态枚举和版本格式。

### 3.5 定义统一的 DocumentChunk

```python
from pydantic import BaseModel


class DocumentChunk(BaseModel):
    content: str
    metadata: ChunkMetadata
    embedding: list[float] | None = None
```

其中：

- `content`：Chunk 正文。
- `metadata`：结构化元数据。
- `embedding`：向量表示。

Embedding 是向量数据，不属于普通业务元数据。实际存储时可以映射到向量数据库的独立向量字段。

### 3.6 Metadata 参与检索

例如用户询问：

> 我想知道退款政策中，当前有效的退货条件。

可以构建过滤条件：

```python
filters = {
    "tenant_id": "tenant_001",
    "document_type": "policy",
    "category": "refund",
    "status": "active"
}
```

再执行向量检索：

```python
results = vector_store.search(
    query="当前有效的退货条件",
    filters=filters,
    top_k=5
)
```

这是抽象接口示例，不代表所有向量数据库采用相同的参数格式。

检索流程：

1. 获取用户 Query。
2. 根据业务上下文构建 Metadata Filter。
3. 在符合过滤条件的数据中执行向量相似度检索。
4. 返回正文和 Metadata。
5. LLM 根据检索内容生成答案。
6. 根据来源元数据展示引用。

### 3.7 Metadata 与向量数据库索引

Metadata 字段不是越多越好。

应该优先关注高频过滤字段，例如：

- `tenant_id`
- `document_type`
- `status`
- `category`

不同数据库的实现方式不同：

| 数据库   | Metadata 存储与过滤思路                  |
| -------- | ---------------------------------------- |
| pgvector | PostgreSQL 普通列、JSONB、B-tree、GIN 等 |
| Qdrant   | Payload 字段和 Payload Index             |
| Milvus   | Scalar Fields 和标量过滤                 |

索引并不是免费的。索引过多会增加存储空间、写入成本和维护复杂度。

应该根据实际查询模式、字段选择性和执行计划决定索引策略。

### 3.8 文档更新、删除与索引重建

文档更新时，不能只把新 Chunk 写入向量数据库，还必须处理旧版本。

建议采用版本化更新流程：

1. 新版本进入构建状态。
2. 解析新文档。
3. 重新切片并生成 Metadata。
4. 生成 Embedding。
5. 写入新版本索引。
6. 完成数据完整性校验。
7. 将新版本切换为当前有效版本。
8. 旧版本停止参与默认检索。
9. 根据保留策略异步清理旧数据。

对于重要企业知识库，可以使用版本状态表、数据库事务、集合别名或索引版本指针实现切换。

删除文档时，需要考虑：

- 向量数据库中的 Chunk。
- 关键词索引中的 Chunk。
- 缓存中的检索结果。
- 文档与 Chunk 的关联记录。
- 相关处理任务和审计记录。

建议使用 `document_id` 作为关联删除的核心标识，并确保删除操作具备幂等性。

### 3.9 Metadata 设计中的常见错误

#### 3.9.1 把所有信息都放进 Metadata

完整原始文档和大体积历史记录不适合重复存储在每个 Chunk 的 Metadata 中。

大体积内容应该放在对象存储或关系数据库中，通过 ID 关联。

#### 3.9.2 把所有 Metadata 拼接进正文

某些字段，例如标题、章节名，可以有选择地加入 Embedding 文本。

但不应该把所有结构化字段都拼进正文，否则可能干扰语义检索。

#### 3.9.3 缺少数据版本信息

缺少 `parser_version`、`chunking_version` 等字段，会导致难以追踪某个 Chunk 是如何生成的，也难以判断是否需要重新处理。

#### 3.9.4 把 chunk_index 当作永久身份

文档内容变化后，Chunk 的数量和位置可能发生变化。不能只依赖 `chunk_index` 作为长期唯一标识。

#### 3.9.5 忽略 Schema 校验

应该在数据摄取阶段检查 `tenant_id`、`document_id` 等关键字段，而不是等到检索阶段才发现数据不完整。

### 3.10 售后工单 Agent 的 Metadata 设计

售后知识库可以包含：

| 文档                 | 类型      | 分类      |
| -------------------- | --------- | --------- |
| 售后退货政策.pdf     | policy    | refund    |
| 退款审批规范.docx    | procedure | refund    |
| 物流异常处理手册.pdf | handbook  | logistics |
| 投诉升级规则.docx    | procedure | complaint |

Chunk 示例：

```json
{
  "content": "符合条件的商品可以在签收后 7 天内申请退货。",
  "metadata": {
    "document_id": "policy_refund_001",
    "chunk_id": "policy_refund_001_v3_0001",
    "chunk_index": 0,
    "source_name": "售后退货政策.pdf",
    "source_uri": "s3://knowledge/tenant_001/policies/refund.pdf",
    "file_type": "pdf",
    "page_number": 3,
    "section_path": "售后政策/退款规则/退货条件",
    "document_type": "policy",
    "category": "refund",
    "tags": ["售后", "退款", "退货"],
    "tenant_id": "tenant_001",
    "document_version": "v3",
    "status": "active",
    "effective_from": "2026-01-01T00:00:00Z",
    "effective_to": null,
    "parser_version": "pdf-parser-v2",
    "chunking_version": "recursive-v3",
    "embedding_model": "embedding-model-v1",
    "content_hash": "sha256:abc123"
  }
}
```

实际业务处理流程：

1. 从当前会话和业务系统获取用户所属租户。
2. 判断问题所属业务分类。
3. 构建租户、文档类型、分类和有效状态过滤条件。
4. 执行向量检索或混合检索。
5. 根据检索结果生成答案。
6. 将来源文件、页码和章节信息返回前端。
7. 前端展示答案引用并支持打开原始政策。

### 3.11 技术选型与架构取舍

| 设计问题       | 推荐思路                          | 原因                     |
| -------------- | --------------------------------- | ------------------------ |
| Metadata 结构  | Pydantic Schema                   | 统一字段和校验           |
| 文档标识       | document_id                       | 关联同一逻辑文档         |
| Chunk 标识     | 版本化 chunk_id                   | 避免位置变化导致身份混乱 |
| 来源定位       | source_uri + page + section       | 支持引用和审计           |
| 生命周期       | status + effective_from/to        | 区分系统状态和业务有效期 |
| 处理追踪       | parser/chunking/embedding version | 支持重建与排查           |
| 高频过滤字段   | 按查询模式建立索引                | 控制检索成本             |
| 大体积原始内容 | 对象存储或关系数据库              | 避免 Metadata 膨胀       |

售后工单 Agent 建议采用：

- PostgreSQL：保存文档主记录、版本、处理任务和必要的 Chunk 关联信息。
- 向量数据库：保存向量、正文和检索需要的 Metadata。
- 对象存储：保存原始文档。
- `document_id`、`document_version`、`chunk_id`：建立数据关联。

如果使用 pgvector，也可以在 PostgreSQL 内承担更多存储职责，不一定需要独立向量数据库。

## 4. 向量数据库

### 4.1 为什么 RAG 需要向量数据库

RAG 的基本数据流程：

1. 读取原始文档。
2. 解析文档。
3. 将文档切分为 Chunk。
4. 使用 Embedding 模型将 Chunk 转换为向量。
5. 将向量、正文和 Metadata 存储起来。
6. 用户提出 Query。
7. 将 Query 转换为向量。
8. 在数据库中检索相似向量。
9. 返回相关 Chunk。
10. 将检索结果交给 LLM 生成答案。

例如：

```python
{
    "content": "符合条件的商品可以在签收后 7 天内申请退货。",
    "embedding": [0.12, -0.35, 0.87, 0.21],
    "metadata": {
        "document_id": "policy_refund_001",
        "tenant_id": "tenant_001",
        "category": "refund"
    }
}
```

假设 Embedding 模型输出 1536 维向量：

当知识库包含大量 Chunk 时，需要高效找到与 Query 最相似的向量，因此需要向量存储、相似度计算和向量索引能力。

### 4.2 向量数据库的核心概念

#### 4.2.1 Vector Embedding

Embedding 是将文本、图片等内容映射到高维向量空间的过程。

在 RAG 中，通常使用文本 Embedding 模型：

```python
text = "符合条件的商品可以在签收后 7 天内申请退货。"

vector = embedding_model.embed_query(text)
```

Embedding 向量表达模型学习到的语义特征，不是文本的直接编码。

语义相近的文本，在向量空间中通常具有较高的相似度。

#### 4.2.2 Similarity Metric

向量数据库需要计算两个向量之间的相似程度。

常见度量方式有三种。

**1. Cosine Similarity：余弦相似度**

关注两个向量方向之间的夹角。

**2. Dot Product：点积**

如果 Embedding 模型输出的是经过归一化的向量，点积与余弦相似度具有相同的排序关系。

**3. Euclidean Distance：欧氏距离**

计算两个向量在空间中的直线距离。

需要注意：

- 不同 Embedding 模型可能采用不同的归一化方式。
- 不同模型可能有推荐的距离度量。
- 不能忽略模型说明，随意更换距离函数。
- 距离越小还是相似度越大，取决于具体数据库的操作符定义。

#### 4.2.3 Exact Search 与 ANN

**Exact Search：精确搜索**

逐一计算 Query 与所有向量之间的距离，再排序返回 Top K。

优点：

- 检索结果精确。
- 实现简单。
- 可以作为 ANN 检索的质量基准。

缺点：

- 数据量增加后计算成本较高。
- 大规模数据下查询延迟可能明显增加。

**ANN：Approximate Nearest Neighbor，近似最近邻**

通过索引结构减少需要比较的向量数量，以较低计算成本寻找近似最近邻。

优点：

- 查询通常更快。
- 适合大规模向量数据。
- 可以在速度与召回质量之间权衡。

缺点：

- 不保证找到全局精确最近邻。
- 需要调整索引和查询参数。
- 建索引、更新和内存使用会增加工程复杂度。

常见索引：

- FLAT
- HNSW
- IVF_FLAT
- IVF_PQ

### 4.3 常见向量索引原理

#### 4.3.1 FLAT：暴力精确搜索

FLAT 不建立近似搜索索引，而是直接计算 Query 与所有向量的距离。

特点：

- 检索结果精确。
- 不需要训练聚类索引。
- 数据规模较小时简单有效。
- 数据量增大后计算开销较高。

FLAT 可以作为 ANN 检索的对照基准。

例如，使用 FLAT 得到精确 Top 10，再与 HNSW 的 Top 10 比较，评估 ANN 的召回质量。

#### 4.3.2 HNSW：分层可导航小世界图

HNSW 全称 Hierarchical Navigable Small World，是一种基于图结构的近似最近邻索引。

基本原理：

1. 每个向量是图中的一个节点。
2. 相似向量之间建立连接边。
3. 图被组织为多个层级。
4. 顶层节点较少，用于快速定位搜索区域。
5. 底层节点较密集，用于精细搜索。
6. 搜索从高层开始，逐层向更接近 Query 的区域移动。

重要参数：

| 参数              | 含义                         | 影响                   |
| ----------------- | ---------------------------- | ---------------------- |
| `M`               | 每个节点的连接数量上限       | 影响图结构、内存和召回 |
| `ef_construction` | 构建索引时搜索候选邻居的范围 | 影响建索引成本和图质量 |
| `ef_search`       | 查询时探索的候选范围         | 影响查询召回和延迟     |

参数取舍：

- 增大 `M`：可能提高召回，但增加内存和构建成本。
- 增大 `ef_construction`：增加建索引成本，可能改善图质量。
- 增大 `ef_search`：通常提高召回，但增加查询延迟。

HNSW 适合对查询延迟和召回质量都有较高要求的场景，但需要重点评估内存成本。

#### 4.3.3 IVF：倒排文件索引

IVF 全称 Inverted File Index。

基本思路：

先把向量空间划分为多个聚类区域，查询时只搜索其中一部分区域。

执行流程：

1. 使用聚类算法将向量划分为多个 Cluster。
2. 为每个 Cluster 建立中心向量。
3. 查询时寻找与 Query 最近的若干 Cluster。
4. 只在选中的 Cluster 中搜索向量。
5. 对候选结果排序并返回 Top K。

重要参数：

| 参数     | 含义                     |
| -------- | ------------------------ |
| `nlist`  | 聚类中心或分区数量       |
| `nprobe` | 查询时实际搜索的分区数量 |

例如：

```text
nlist = 1024
nprobe = 16
```

表示建立 1024 个分区，每次查询选择其中 16 个分区进行搜索。

一般来说：

- `nprobe` 越大，搜索范围越大，召回可能越好。
- `nprobe` 越大，查询成本也越高。
- `nlist` 影响数据分区粒度和索引构建。

#### 4.3.4 PQ：乘积量化

PQ 全称 Product Quantization。

核心思路：

把一个高维向量切分成多个子向量，再使用较短的编码表示每个子向量。

例如，一个 128 维向量可以拆成 8 个 16 维子向量，每个子向量通过对应码本映射成较短编码。

优点：

- 显著减少向量存储空间。
- 降低大规模向量数据的内存压力。

缺点：

- 会引入量化误差。
- 可能降低检索精度。

常见索引组合：

| 索引     | 特点                   |
| -------- | ---------------------- |
| FLAT     | 精确搜索               |
| IVF_FLAT | 分区搜索，保留原始向量 |
| IVF_PQ   | 分区搜索，同时压缩向量 |
| HNSW     | 基于图结构搜索         |

### 4.4 pgvector：在 PostgreSQL 中实现向量检索

#### 4.4.1 pgvector 是什么

pgvector 是 PostgreSQL 的扩展，为 PostgreSQL 增加向量数据类型和相似度检索能力。

核心特点：

1. 向量数据直接存储在 PostgreSQL 中。
2. 使用 SQL 完成向量检索。
3. 可以与关系型业务表关联。
4. 可以复用 PostgreSQL 的事务、权限和备份体系。
5. 支持精确搜索以及 HNSW、IVFFlat 等近似索引。

#### 4.4.2 安装与启用

安装对应版本的 pgvector 扩展后：

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

实际安装过程取决于 PostgreSQL 的部署方式，需要确保服务器上已经安装对应版本的扩展。

#### 4.4.3 创建 Chunk 表

结合上一节的 Metadata 设计：

```sql
CREATE TABLE document_chunks (
    id BIGSERIAL PRIMARY KEY,

    document_id TEXT NOT NULL,
    chunk_id TEXT NOT NULL UNIQUE,
    chunk_index INTEGER NOT NULL,

    tenant_id TEXT NOT NULL,

    content TEXT NOT NULL,

    metadata JSONB NOT NULL DEFAULT '{}',

    embedding VECTOR(1536),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

字段说明：

| 字段          | 作用           |
| ------------- | -------------- |
| `document_id` | 所属文档       |
| `chunk_id`    | Chunk 唯一标识 |
| `chunk_index` | Chunk 顺序     |
| `tenant_id`   | 租户标识       |
| `content`     | Chunk 正文     |
| `metadata`    | 扩展元数据     |
| `embedding`   | 向量数据       |

1536 只是示例维度，实际必须与 Embedding 模型输出维度一致。

#### 4.4.4 创建 HNSW 索引

```sql
CREATE INDEX document_chunks_embedding_hnsw
ON document_chunks
USING hnsw (embedding vector_cosine_ops);
```

其中：

- `hnsw`：使用 HNSW 索引。
- `vector_cosine_ops`：使用余弦距离对应的操作符类。

pgvector 常见距离操作符：

| 操作符 | 含义        |
| ------ | ----------- |
| `<->`  | L2 欧氏距离 |
| `<#>`  | 负内积      |
| `<=>`  | 余弦距离    |

注意：`<#>` 返回负内积，通常配合升序排序使用。

#### 4.4.5 执行向量检索

```sql
SELECT
    chunk_id,
    document_id,
    content,
    metadata,
    embedding <=> :query_embedding AS distance
FROM document_chunks
WHERE tenant_id = :tenant_id
ORDER BY embedding <=> :query_embedding
LIMIT 5;
```

这里包含：

- Query Embedding。
- 租户过滤。
- 余弦距离排序。
- Top 5 结果。

实际应用应该使用数据库驱动的参数绑定，不要通过字符串拼接构造 SQL。

#### 4.4.6 pgvector 的优势

1. 关系型数据和向量数据可以统一管理。
2. 可以复用 PostgreSQL 事务能力。
3. SQL 生态成熟。
4. 可以复用现有备份、监控和权限体系。
5. 减少额外基础设施。

#### 4.4.7 pgvector 的局限

1. 向量检索会与其他 PostgreSQL 查询争用资源。
2. 大规模向量检索需要评估索引、内存和并发。
3. ANN 与 Metadata Filter 组合时需要关注召回问题。
4. 超大规模向量检索可能需要独立的向量数据库。

pgvector 的近似索引可能先扫描索引，再应用过滤条件，因此过滤后返回的结果可能不足。

pgvector 从 0.8.0 开始支持 iterative index scans，可以在满足条件时继续扫描索引，尝试补足结果数量。

例如：

```sql
SET hnsw.iterative_scan = strict_order;
```

具体配置需要结合查询负载和召回测试调整。

### 4.5 Milvus：专用向量数据库

#### 4.5.1 Milvus 是什么

Milvus 是面向向量数据管理和相似度检索的专用数据库。

主要解决：

- 大规模向量存储。
- 高并发向量检索。
- 多种向量索引。
- 标量字段过滤。
- 分布式数据管理。
- 向量数据扩展和运维。

#### 4.5.2 Milvus 的核心数据概念

| 概念         | 含义                   |
| ------------ | ---------------------- |
| Collection   | 类似数据库中的集合或表 |
| Schema       | 定义字段和数据结构     |
| Entity       | 一条具体数据记录       |
| Vector Field | 向量字段               |
| Scalar Field | 普通标量字段           |
| Index        | 向量或标量索引         |
| Partition    | 集合内部的数据分区     |

例如售后知识库：

```text
Collection: support_knowledge

Fields:
  id
  document_id
  chunk_id
  tenant_id
  category
  content
  embedding
```

#### 4.5.3 Milvus 的向量索引

| 索引     | 适用方向     | 主要特点             |
| -------- | ------------ | -------------------- |
| FLAT     | 精确搜索     | 直接计算             |
| IVF_FLAT | 分区近似搜索 | 分区后搜索原始向量   |
| IVF_PQ   | 内存受限     | 向量压缩             |
| HNSW     | 高召回需求   | 图索引，内存成本较高 |
| DiskANN  | 磁盘辅助搜索 | 利用磁盘存储和搜索   |

具体索引可用性和参数会随 Milvus 版本、向量类型和部署环境变化，应以目标版本官方文档为准。

#### 4.5.4 Milvus 的标量过滤

例如：

```text
tenant_id = "tenant_001"
category = "refund"
status = "active"
```

Milvus 可以使用标量字段过滤，缩小向量检索范围。

常见标量索引类型：

- INVERTED
- BITMAP
- STL_SORT
- TRIE
- NGRAM

应根据字段类型、基数和过滤方式选择。

#### 4.5.5 Milvus 的优势

1. 面向专用向量检索设计。
2. 提供丰富的向量索引类型。
3. 支持标量字段过滤。
4. 适合大规模向量数据场景。
5. 有独立的向量数据库部署与扩展体系。

#### 4.5.6 Milvus 的代价

1. 需要额外部署和维护数据库服务。
2. 分布式架构带来更多运维复杂度。
3. 需要设计数据导入、索引构建和资源配置流程。
4. 需要关注向量检索与业务数据库之间的数据一致性。
5. 团队需要掌握 Collection、索引和分区管理。

### 4.6 Qdrant：向量检索与 Payload 过滤

#### 4.6.1 Qdrant 是什么

Qdrant 是专门面向向量相似度搜索的数据库。

核心数据模型：

- Collection
- Point
- Vector
- Payload
- Index

#### 4.6.2 Qdrant 的数据模型

```text
Collection
  |
  +-- Point 1
  |     |
  |     +-- ID
  |     +-- Vector
  |     +-- Payload
  |
  +-- Point 2
  |     |
  |     +-- ID
  |     +-- Vector
  |     +-- Payload
```

Payload 就是结构化 Metadata。

例如：

```json
{
  "id": "chunk_001",
  "vector": [0.12, -0.35, 0.87],
  "payload": {
    "document_id": "policy_refund_001",
    "tenant_id": "tenant_001",
    "category": "refund",
    "status": "active",
    "content": "符合条件的商品可以在签收后 7 天内申请退货。"
  }
}
```

#### 4.6.3 Qdrant 的 HNSW 与 Payload Index

两种索引负责不同工作：

- Vector Index：加速向量相似度检索。
- Payload Index：加速结构化条件过滤。

Qdrant 使用 HNSW 进行 Dense Vector 检索，同时支持 Payload 字段索引。

#### 4.6.4 创建 Payload Index

例如经常按照 `tenant_id` 和 `category` 过滤：

```python
client.create_payload_index(
    collection_name="support_knowledge",
    field_name="tenant_id",
    field_schema="keyword",
)

client.create_payload_index(
    collection_name="support_knowledge",
    field_name="category",
    field_schema="keyword",
)
```

示例展示 Python 客户端的调用思路，具体参数类型应以项目锁定的 Qdrant Client 版本为准。

经常参与过滤的字段应该评估是否建立 Payload Index。

#### 4.6.5 执行 Metadata Filter

```python
from qdrant_client import models

query_filter = models.Filter(
    must=[
        models.FieldCondition(
            key="tenant_id",
            match=models.MatchValue(value="tenant_001"),
        ),
        models.FieldCondition(
            key="category",
            match=models.MatchValue(value="refund"),
        ),
        models.FieldCondition(
            key="status",
            match=models.MatchValue(value="active"),
        ),
    ]
)
```

其中：

- `must`：所有条件必须满足，相当于 AND。
- `should`：满足其中部分条件。
- `must_not`：排除符合条件的数据。

#### 4.6.6 Qdrant 的优势

1. 向量检索与 Payload 过滤结合紧密。
2. 数据模型直观。
3. HNSW 索引机制成熟。
4. 支持多种过滤条件。
5. 支持稀疏向量、全文检索和混合检索相关能力。

#### 4.6.7 Qdrant 的代价

1. 需要单独部署和维护服务。
2. Payload Index 会消耗额外资源。
3. HNSW 对内存有要求。
4. 多租户和分布式部署需要进一步规划。
5. 与 PostgreSQL 业务数据之间需要设计一致性机制。

Payload Filter 只是检索条件，不等于完整的授权系统。

### 4.7 三种数据库的核心对比

| 对比维度       | pgvector               | Milvus               | Qdrant               |
| -------------- | ---------------------- | -------------------- | -------------------- |
| 产品形态       | PostgreSQL 扩展        | 专用向量数据库       | 专用向量数据库       |
| 核心数据模型   | SQL 表                 | Collection           | Collection / Point   |
| 向量索引       | HNSW、IVFFlat          | 多种索引             | HNSW                 |
| 精确搜索       | 支持                   | FLAT 等              | 支持精确搜索方式     |
| Metadata 过滤  | SQL / JSONB            | Scalar Filter        | Payload Filter       |
| 关系型事务     | PostgreSQL 原生能力    | 需结合业务数据库设计 | 需结合业务数据库设计 |
| 运维复杂度     | 通常较低               | 通常较高             | 取决于部署规模       |
| 大规模向量能力 | 受 PostgreSQL 架构约束 | 专用向量平台         | 专用向量平台         |
| 适合场景       | 中小规模、业务数据整合 | 大规模、专用向量平台 | RAG 检索与过滤场景   |

实际性能取决于：

- 向量数量。
- 向量维度。
- 数据分布。
- Top K。
- Metadata 过滤选择性。
- 并发量。
- 索引参数。
- 硬件资源。
- 写入与更新比例。

不能只看宣传的 QPS 或单次检索延迟来选型。

### 4.8 企业级 RAG 如何选型

#### 4.8.1 业务已经使用 PostgreSQL

如果企业已经使用 PostgreSQL，知识库规模暂时不大，检索请求量也不高，可以优先考虑 pgvector。

原因：

1. 减少基础设施数量。
2. 文档、Chunk 和业务数据可以统一管理。
3. 使用 SQL 完成过滤与检索。
4. 事务和备份体系可以复用。
5. 减少额外运维成本。

#### 4.8.2 知识库规模较大

如果存在：

- 大规模 Chunk。
- 高并发检索。
- 多个业务系统共用知识检索平台。
- 独立扩展向量检索资源的需求。
- 丰富的向量索引策略需求。

可以考虑 Milvus。

#### 4.8.3 Metadata Filter 要求较高

如果系统存在：

- 多租户知识库。
- 文档分类过滤。
- 文档状态过滤。
- 版本过滤。
- 多种 Payload 条件组合。
- 向量检索与关键词检索结合。

可以重点评估 Qdrant。

### 4.9 售后工单 Agent 的数据库架构

第一版建议采用：

**PostgreSQL + pgvector。**

整体架构：

```text
企业售后工单 Agent
        |
        v
FastAPI / Agent Runtime
        |
        +----------------------+
        |          |           |
        v          v           v
   PostgreSQL   Redis     Object Storage
        |
        +-- 用户
        +-- 订单
        +-- 工单
        +-- 文档
        +-- 文档版本
        +-- Chunk
        +-- 审计记录
        +-- 向量数据（pgvector）
```

后续可以根据实际负载，把向量检索独立迁移到 Qdrant 或 Milvus。

不建议在第一版同时引入三种向量数据库，否则会增加数据同步、一致性、备份、监控和运维成本。

#### 4.9.1 为什么不应该让向量数据库代替关系型数据库

不同数据应该由适合的存储负责：

| 数据                 | 推荐查询方式     |
| -------------------- | ---------------- |
| 订单是否支付成功     | 业务数据库       |
| 退款是否已经审批     | 业务数据库       |
| 用户属于哪个租户     | 身份与业务数据库 |
| 哪条售后政策最相关   | 知识库向量检索   |
| 哪个文档支持当前回答 | Chunk Metadata   |

必须明确业务事实和语义知识的边界。

#### 4.9.2 统一 VectorStore 接口

为了降低后续迁移成本，可以设计统一接口：

```python
from typing import Protocol


class VectorStore(Protocol):

    async def upsert(self, chunks: list) -> None:
        ...

    async def search(
        self,
        query_vector: list[float],
        filters: dict,
        top_k: int,
    ) -> list:
        ...

    async def delete_by_document_id(
        self,
        document_id: str,
    ) -> None:
        ...
```

可以分别实现：

```text
VectorStore
    |
    +-- PgVectorStore
    |
    +-- QdrantStore
    |
    +-- MilvusStore
```

这是项目自己的抽象契约，不代表三个数据库的查询语义、过滤表达式和事务能力完全一致。

具体适配器需要处理数据库差异。

### 4.10 常见选型误区

#### 4.10.1 认为向量数据库越专业越好

专用向量数据库不一定适合每个项目。

如果业务规模不大，pgvector 可能更简单、更经济。

#### 4.10.2 认为 HNSW 一定比 IVF 好

两种索引有不同的资源取舍，应该根据数据规模、内存、延迟和召回要求进行实验。

#### 4.10.3 只关注向量检索，不关注 Metadata Filter

企业 RAG 通常需要同时满足：

```text
tenant_id = tenant_001
category = refund
status = active
```

过滤性能和过滤后的召回质量同样重要。

#### 4.10.4 认为 Top K 越大越好

Top K 越大，返回内容越多，但也可能导致：

- 无关内容进入上下文。
- Token 消耗增加。
- LLM 处理负担增加。
- 噪声影响答案质量。

后续 Reranker 章节会进一步解决候选结果筛选问题。

#### 4.10.5 认为向量数据库可以代替关系型数据库

订单、退款、审批等业务事实应该从业务数据库获取。

向量数据库主要负责语义检索，不应该成为核心业务状态的唯一数据源。

### 4.11 本节技术选型与架构取舍

| 项目                       | 推荐方案                       |
| -------------------------- | ------------------------------ |
| 第一版主线项目             | PostgreSQL + pgvector          |
| 中小规模知识库             | 优先评估 pgvector              |
| 大规模专用向量平台         | 评估 Milvus                    |
| Metadata Filter 密集型 RAG | 重点评估 Qdrant                |
| 原始文档                   | 对象存储                       |
| 文档与业务数据             | PostgreSQL                     |
| 向量检索抽象               | VectorStore Protocol           |
| 数据一致性                 | 文档版本 + 处理任务 + 幂等写入 |
| 检索质量验证               | FLAT 精确检索作为对照基准      |

### 4.12 本节核心总结

1. RAG 需要向量数据库存储 Embedding 并进行相似度检索。
2. Embedding 将文本转换为高维向量。
3. Cosine Similarity、Dot Product 和 Euclidean Distance 是常见距离度量。
4. Exact Search 返回精确结果，ANN 通过索引加速近似搜索。
5. FLAT、HNSW、IVF、PQ 是需要理解的核心索引机制。
6. pgvector 是 PostgreSQL 扩展，可以在关系型数据库中实现向量检索。
7. Milvus 是专用向量数据库，适合大规模向量平台。
8. Qdrant 以 Vector、Point、Payload 和过滤检索为核心。
9. Metadata Filter 会影响检索性能和召回质量。
10. 数据库选型必须考虑规模、并发、过滤、资源和运维成本。
11. 使用统一 VectorStore 接口可以降低迁移成本。
12. 企业系统必须区分业务数据库与语义知识检索。

## 5. BM25 与关键词检索

### 5.1 为什么向量检索需要关键词检索补充

#### 5.1.1 向量检索的局限性

向量检索通过 Embedding 将文本转换为向量，再通过向量相似度寻找相关文档。

它擅长处理语义相近但表达不同的问题。

例如：

- 商品破损如何处理？
- 收到的商品有损坏，可以申请换货吗？

但对于订单号、产品型号、错误码、政策编号等内容，向量相似度不能保证精确匹配。

例如：

```text
ORDER-20261118-001
ORDER-20261118-002
```

两个编号非常相似，但代表不同订单。

#### 5.1.2 关键词检索适用场景

| 场景     | 示例                   |
| -------- | ---------------------- |
| 订单编号 | ORDER-20261118-001     |
| 物流单号 | SF123456789            |
| 产品型号 | SKU-X900-PRO           |
| 错误码   | E-5027                 |
| 政策编号 | POLICY-2026-018        |
| 专有名词 | 屏幕总成、主板通信异常 |

注意：实时订单、物流状态等结构化业务查询，应优先调用业务 API 或数据库精确查询，而不是依赖全文检索。

### 5.2 BM25 核心概念

#### 5.2.1 BM25 定义

BM25（Best Matching 25）是一种经典的文本相关性评分算法，用于衡量查询词与文档之间的相关程度。

它主要考虑：

1. 查询词是否出现在文档中。
2. 查询词在文档中出现的频率。
3. 查询词在整个文档集合中的稀有程度。
4. 文档长度对相关性评分的影响。

BM25 不依赖 Embedding 模型，通常与倒排索引配合使用。

#### 5.2.2 倒排索引

倒排索引从词项出发，记录包含该词项的文档。

例如：

```text
文档 A：退款政策、退款流程
文档 B：换货政策、商品损坏
文档 C：物流查询、订单状态
```

倒排索引：

```text
退款：
  - 文档 A

换货：
  - 文档 B

物流：
  - 文档 C

订单：
  - 文档 C
```

生产级倒排索引通常还会保存词频、词项位置等信息。

#### 5.2.3 BM25 的四个关键因素

BM25 的核心是判断：用户搜索的关键词，在哪篇文档中更有价值。

主要涉及以下因素。

**1. TF：Term Frequency，词频**

表示一个关键词在当前文档中出现了多少次。

例如：

```text
文档 A：
E-5027 表示主板通信异常。

文档 B：
E-5027 表示主板通信异常。
遇到 E-5027 时，需要检查主板连接。
```

用户搜索 `E-5027`：

- 文档 A 出现 1 次。
- 文档 B 出现 2 次。

通常情况下，文档 B 会获得更多词频贡献。

直观理解：关键词出现得越多，文档通常越可能与查询相关。

**2. 词频饱和**

如果一个关键词出现 100 次，是不是就应该比出现 1 次的文档相关 100 倍？

不是。

BM25 会限制词频增长带来的收益。

可以这样理解：

| 关键词出现次数 | 对相关性的帮助                   |
| -------------- | -------------------------------- |
| 0 次           | 没有帮助                         |
| 1 次           | 帮助明显                         |
| 2 次           | 继续增加                         |
| 5 次           | 还有增加                         |
| 50 次          | 仍然可能增加，但额外收益已经很小 |

也就是说，关键词出现次数越多，通常越有帮助，但不会无限增长。

`k1` 参数用于控制这种词频饱和程度。

**3. IDF：Inverse Document Frequency，逆文档频率**

表示一个关键词在整个文档集合中有多稀有。

假设知识库有 10,000 篇文档：

| 关键词       | 出现过的文档数量 |
| ------------ | ---------------: |
| 售后         |            8,000 |
| 退款         |            3,000 |
| E-5027       |                3 |
| SKU-X900-PRO |                5 |

“售后”在大量文档中出现，区分能力比较弱。

而 `E-5027` 只在少量文档中出现，区分能力比较强。

因此：

- 常见词：区分能力弱。
- 稀有词：区分能力强。

直观理解：一个关键词越少见，通常越能帮助系统找到特定文档。

**4. 文档长度归一化**

假设有两篇文档：

| 对比项       |   文档 A |      文档 B |
| ------------ | -------: | ----------: |
| 文档长度     | 100 个词 | 10,000 个词 |
| 退款出现次数 |     5 次 |        5 次 |
| 退款出现比例 |       5% |       0.05% |

虽然两篇文档中“退款”都出现了 5 次，但它们的内容特点不同：

- 文档 A 很短，“退款”可能是它的核心主题。
- 文档 B 很长，“退款”可能只是其中一个小细节。

如果只看词频，长文档可能因为包含更多内容而天然占优势。

因此，BM25 会考虑文档长度，避免长文档仅仅因为内容多而获得不合理的评分优势。

这就是文档长度归一化。

**k1 和 b 两个参数：**

| 参数 | 控制什么           | 直观理解                         |
| ---- | ------------------ | -------------------------------- |
| k1   | 词频饱和程度       | 关键词重复出现时，收益增长有多快 |
| b    | 文档长度归一化程度 | 文档长度对评分的影响有多大       |

常见参数示例：

```python
k1 = 1.5
b = 0.75
```

其中：

- `k1=1.5`：控制词频饱和。
- `b=0.75`：考虑文档长度，属于常见配置。

`b` 可以直观理解为：

| b 值 | 含义                 |
| ---- | -------------------- |
| 0    | 不考虑文档长度       |
| 0.75 | 适度考虑文档长度     |
| 1    | 更充分地考虑文档长度 |

不需要记忆数学公式，也不需要手动计算 BM25 分数。理解每个因素解决的问题即可。

### 5.3 BM25 的评分逻辑

#### 5.3.1 BM25 如何判断文档相关性

假设用户搜索：

```text
E-5027 主板通信异常
```

知识库中有三篇文档：

**文档 A：**

```text
E-5027 表示主板通信异常，需要检查主板连接。
```

**文档 B：**

```text
商品退款需要经过审核，审核通过后原路退回。
```

**文档 C：**

```text
完整产品维修手册，介绍产品使用方法、维修流程、
保修政策和多种常见故障，其中提到 E-5027。
```

BM25 会综合考虑：

1. 文档是否包含查询关键词。
2. 查询关键词出现了多少次。
3. 这些关键词在整个知识库中是否稀有。
4. 文档长度是否影响词频带来的评分。

最终根据相关性评分对候选文档排序。

注意：BM25 评分不是概率，不能理解为分数 10 就代表 90% 的相关性。

#### 5.3.2 需要掌握的核心结论

| 因素           | 解决的问题                     |
| -------------- | ------------------------------ |
| TF             | 关键词在文档中出现了多少次     |
| 词频饱和       | 防止重复堆砌关键词获得过高收益 |
| IDF            | 判断关键词是否具有区分能力     |
| 文档长度归一化 | 防止长文档天然占优势           |

### 5.4 中文分词

#### 5.4.1 为什么需要分词

中文没有天然的空格分隔，BM25 需要先将文本转换成词项。

例如：

```text
商品收到后发现屏幕破裂，需要申请售后换货。
```

可能分词为：

```python
[
    "商品",
    "收到",
    "后",
    "发现",
    "屏幕",
    "破裂",
    "需要",
    "申请",
    "售后",
    "换货"
]
```

分词结果会直接影响倒排索引和查询匹配。

#### 5.4.2 常见分词方案

| 方案                   | 特点                             |
| ---------------------- | -------------------------------- |
| jieba                  | 轻量、适合 Python 实验           |
| Elasticsearch Analyzer | 可配置分词器和过滤器             |
| OpenSearch Analyzer    | 提供全文分析链路                 |
| 字符 n-gram            | 适合部分型号、编码和模糊匹配场景 |

#### 5.4.3 自定义词典

售后领域可以添加：

```python
import jieba

jieba.add_word("以旧换新")
jieba.add_word("七天无理由")
jieba.add_word("屏幕总成")
```

对于以下业务编号：

```text
E-5027
SKU-X900-PRO
POLICY-2026-018
SF123456789
```

应专门设计分词规则或独立字段，避免编号被错误切分。

### 5.5 Python 实践：rank_bm25

#### 5.5.1 安装

```bash
pip install rank-bm25 jieba
```

`rank_bm25` 是轻量级实验库，不等同于 Elasticsearch 或 OpenSearch 等生产搜索引擎。

#### 5.5.2 准备文档

```python
documents = [
    {
        "id": "doc-001",
        "title": "退款政策",
        "content": "用户可以根据退款政策申请退款。",
    },
    {
        "id": "doc-002",
        "title": "换货政策",
        "content": "商品存在质量问题时，可以申请售后换货。",
    },
    {
        "id": "doc-003",
        "title": "产品故障码",
        "content": "错误码 E-5027 表示设备主板通信异常。",
    },
]
```

#### 5.5.3 构建索引

```python
import jieba
from rank_bm25 import BM25Okapi


def tokenize(text: str) -> list[str]:
    return [
        word.strip()
        for word in jieba.cut(text)
        if word.strip()
    ]


corpus = [
    tokenize(doc["title"] + " " + doc["content"])
    for doc in documents
]

bm25 = BM25Okapi(
    corpus,
    k1=1.5,
    b=0.75,
)
```

#### 5.5.4 执行检索

```python
def search(query: str, top_k: int = 3):
    query_tokens = tokenize(query)
    scores = bm25.get_scores(query_tokens)

    ranked_indices = sorted(
        range(len(scores)),
        key=lambda i: scores[i],
        reverse=True,
    )

    return [
        {
            "id": documents[i]["id"],
            "title": documents[i]["title"],
            "score": float(scores[i]),
            "content": documents[i]["content"],
        }
        for i in ranked_indices[:top_k]
    ]
```

调用：

```python
results = search("E-5027 错误码代表什么")

for result in results:
    print(result)
```

### 5.6 企业级全文检索

#### 5.6.1 Elasticsearch / OpenSearch

生产级全文检索系统通常提供：

- 倒排索引。
- 文本分析器。
- 分词器。
- 字段映射。
- BM25 评分。
- 多字段检索。
- 过滤条件。
- 高亮和分页。
- 分布式索引与查询。

#### 5.6.2 字段设计

```json
{
  "document_id": "doc-001",
  "tenant_id": "tenant-001",
  "title": "E-5027 主板通信异常处理",
  "content": "错误码 E-5027 表示设备主板通信异常。",
  "sku": "SKU-X900-PRO",
  "error_code": "E-5027",
  "document_type": "troubleshooting"
}
```

字段类型建议：

| 字段          | 类型    | 用途           |
| ------------- | ------- | -------------- |
| document_id   | keyword | 文档标识       |
| tenant_id     | keyword | 租户过滤       |
| title         | text    | 标题全文检索   |
| content       | text    | 正文全文检索   |
| sku           | keyword | 型号精确匹配   |
| error_code    | keyword | 错误码精确匹配 |
| document_type | keyword | 文档类型过滤   |

`text` 通常经过分析器处理，适合全文检索。

`keyword` 通常将整体作为一个词项，适合精确匹配、过滤和聚合。

#### 5.6.3 多字段检索

```json
{
  "query": {
    "multi_match": {
      "query": "E-5027 主板通信异常",
      "fields": [
        "title^3",
        "content"
      ]
    }
  },
  "size": 10
}
```

`title^3` 表示提高标题字段的相关性权重。

对于错误码、产品型号等字段，可以额外增加精确字段匹配条件。

### 5.7 BM25 的局限性

1. 无法自动理解同义表达和语义关系。
2. 检索质量依赖分词器和领域词典。
3. 关键词命中不代表文档一定适合回答问题。
4. 不能替代实时结构化业务查询。
5. 不能独立解决文档权限、版本和有效期问题。

### 5.8 售后工单 Agent 中的应用

| 用户问题                   | 推荐处理方式           |
| -------------------------- | ---------------------- |
| 我的订单到哪里了？         | 订单与物流 API         |
| E-5027 是什么故障？        | 错误码字段查询、BM25   |
| SKU-X900-PRO 支持换货吗？  | 型号检索、政策知识检索 |
| 商品屏幕坏了怎么办？       | 向量语义检索           |
| 商品破损是否符合换货政策？ | 关键词与语义检索协同   |

检索架构需要区分：

- 结构化业务查询。
- 关键词全文检索。
- 向量语义检索。

### 5.9 技术选型

| 方案                | 优势                   | 适用场景       |
| ------------------- | ---------------------- | -------------- |
| rank_bm25           | 轻量、易实验           | 本地实验和原型 |
| PostgreSQL 全文检索 | 与业务数据库集成方便   | 中小规模检索   |
| Elasticsearch       | 搜索生态成熟、功能完善 | 企业全文检索   |
| OpenSearch          | 开源搜索生态           | 企业搜索平台   |

选型需要考虑数据规模、查询复杂度、运维能力和业务要求。

## 6. Hybrid Search 混合检索

### 6.1 什么是 Hybrid Search

Hybrid Search（混合检索）是指同时使用关键词检索（BM25）和向量检索（Vector Search），再将两路检索结果进行融合，得到最终候选文档。

核心目的：

- 利用 BM25 的关键词匹配能力。
- 利用向量检索的语义理解能力。
- 提升候选文档的覆盖能力。

基本架构：

```text
用户问题
    |
    v
Query 预处理
    |
    +---------------------+
    |                     |
    v                     v
BM25 检索             向量检索
    |                     |
    v                     v
关键词候选文档        语义候选文档
    |                     |
    +----------+----------+
               |
               v
           结果融合
               |
               v
          去重与排序
               |
               v
          最终候选文档
```

### 6.2 为什么需要混合检索

#### 6.2.1 单一检索方式的局限

BM25 擅长：

- 订单号、产品型号。
- 错误码、政策编号。
- 专有名词和关键词匹配。

向量检索擅长：

- 同义表达。
- 自然语言语义匹配。
- 不同措辞表达的相同意思。

例如：

用户问题：

```text
SKU-X900-PRO 屏幕碎了，可以申请换货吗？
```

知识库可能包含：

```text
文档 A：
SKU-X900-PRO 产品售后政策。
该产品屏幕出现破损时，可以提交售后换货申请。

文档 B：
商品外观损坏处理指南。
客户收到商品后，如果发现屏幕破裂，可以申请售后处理。

文档 C：
SKU-X900-PRO 产品规格说明。
该产品采用 OLED 屏幕，支持屏幕检测功能。
```

BM25 能够利用产品型号和关键词寻找文档。

向量检索能够利用语义相似性找到不同措辞的售后说明。

两种检索方式结合，可以获得更全面的候选文档。

### 6.3 两种检索方式的职责

| 对比项             | BM25                 | 向量检索             |
| ------------------ | -------------------- | -------------------- |
| 核心依据           | 关键词匹配           | 语义相似度           |
| 擅长内容           | 型号、编号、专有名词 | 同义表达、自然语言   |
| 是否需要 Embedding | 不需要               | 需要                 |
| 是否依赖分词       | 通常需要             | 不依赖传统关键词分词 |
| 主要风险           | 无法理解语义变化     | 可能忽略精确词项差异 |

### 6.4 Hybrid Search 执行流程

#### 6.4.1 接收用户问题

```text
SKU-X900-PRO 屏幕损坏后能不能换货？
```

#### 6.4.2 执行 BM25 检索

```text
BM25 Top 3：

1. SKU-X900-PRO 售后政策
2. SKU-X900-PRO 产品说明
3. 屏幕损坏处理规范
```

#### 6.4.3 执行向量检索

```text
Vector Search Top 3：

1. 屏幕破损售后处理指南
2. 商品质量问题换货政策
3. SKU-X900-PRO 售后政策
```

#### 6.4.4 合并两路结果

```text
BM25：
A、B、C

Vector：
D、E、A
```

合并去重：

```text
A、B、C、D、E
```

去重时应使用稳定的 `chunk_id` 或 `document_id`，同时保留两路检索的分数和排名信息。

#### 6.4.5 结果排序

合并后需要决定最终文档的排名。

常见方法：

1. Score Fusion：分数融合。
2. Rank Fusion：排名融合。

### 6.5 分数融合（Score Fusion）

#### 6.5.1 什么是分数融合

分数融合是将 BM25 分数和向量相似度经过处理后，计算综合得分。

例如：

BM25：

| 文档 | 分数 |
| ---- | ---: |
| A    | 12.5 |
| B    |  8.2 |
| C    |  4.1 |

Vector：

| 文档 | 相似度 |
| ---- | -----: |
| A    |   0.92 |
| D    |   0.89 |
| E    |   0.85 |

#### 6.5.2 为什么不能直接相加

BM25 和向量检索的分数：

- 计算方式不同。
- 数值范围不同。
- 统计意义不同。

直接相加可能导致数值范围较大的检索方式占据主导地位。

因此，通常需要先进行分数归一化。

#### 6.5.3 分数归一化

归一化可以理解为将不同范围的分数转换到相对统一的范围。

例如使用 Min-Max 归一化：

```text
BM25 原始分数：

A = 12
B = 6
C = 3

归一化后：

A = 1.00
B = 0.33
C = 0.00
```

向量分数也可以进行类似处理。

注意：归一化只能调整数值范围，不能保证两种分数具有完全相同的统计意义。归一化结果还会受到候选集合的影响。

#### 6.5.4 加权分数融合

完成归一化后，可以设置两路检索的权重。

例如：

```python
bm25_weight = 0.5
vector_weight = 0.5
```

最终得分由两路归一化分数按照权重共同决定。

业务可以根据检索特点调整权重：

| 场景             | BM25 权重 | Vector 权重 |
| ---------------- | --------: | ----------: |
| 产品型号查询     |       0.7 |         0.3 |
| 故障码查询       |       0.8 |         0.2 |
| 普通售后咨询     |       0.3 |         0.7 |
| 自然语言政策咨询 |       0.4 |         0.6 |

这些只是实验起点，最终权重应通过评估集确定。

### 6.6 排名融合（Rank Fusion）

#### 6.6.1 什么是排名融合

排名融合不直接比较原始分数，而是利用文档在各自检索结果中的排名。

例如：

BM25：

| 文档 | 排名 |
| ---- | ---: |
| A    |    1 |
| B    |    2 |
| C    |    3 |

Vector：

| 文档 | 排名 |
| ---- | ---: |
| D    |    1 |
| A    |    2 |
| E    |    3 |

合并后：

| 文档 | BM25 排名 | Vector 排名 |
| ---- | --------: | ----------: |
| A    |         1 |           2 |
| B    |         2 |      未命中 |
| C    |         3 |      未命中 |
| D    |    未命中 |           1 |
| E    |    未命中 |           3 |

排名融合根据不同检索结果中的排名计算综合排名。

#### 6.6.2 RRF

RRF（Reciprocal Rank Fusion）是一种经典的排名融合算法。

它通过文档在不同检索结果中的排名计算融合结果。

RRF 的具体原理、参数和实现将在下一节详细学习。

### 6.7 Python 实践：基础混合检索

#### 6.7.1 准备检索结果

```python
bm25_results = [
    {"chunk_id": "chunk-001", "score": 12.5},
    {"chunk_id": "chunk-002", "score": 8.2},
    {"chunk_id": "chunk-003", "score": 4.1},
]

vector_results = [
    {"chunk_id": "chunk-001", "score": 0.92},
    {"chunk_id": "chunk-004", "score": 0.89},
    {"chunk_id": "chunk-005", "score": 0.85},
]
```

#### 6.7.2 分数归一化

```python
def min_max_normalize(results: list[dict]) -> dict:
    if not results:
        return {}

    scores = [
        item["score"]
        for item in results
    ]

    min_score = min(scores)
    max_score = max(scores)

    if max_score == min_score:
        return {
            item["chunk_id"]: 1.0
            for item in results
        }

    return {
        item["chunk_id"]: (
            item["score"] - min_score
        ) / (
            max_score - min_score
        )
        for item in results
    }
```

#### 6.7.3 加权分数融合

```python
def hybrid_search(
    bm25_results: list[dict],
    vector_results: list[dict],
    bm25_weight: float = 0.5,
    vector_weight: float = 0.5,
):
    bm25_scores = min_max_normalize(
        bm25_results
    )

    vector_scores = min_max_normalize(
        vector_results
    )

    all_chunk_ids = (
        set(bm25_scores)
        | set(vector_scores)
    )

    results = []

    for chunk_id in all_chunk_ids:
        bm25_score = bm25_scores.get(
            chunk_id,
            0.0,
        )

        vector_score = vector_scores.get(
            chunk_id,
            0.0,
        )

        final_score = (
            bm25_score * bm25_weight
            + vector_score * vector_weight
        )

        results.append({
            "chunk_id": chunk_id,
            "bm25_score": bm25_score,
            "vector_score": vector_score,
            "final_score": final_score,
        })

    return sorted(
        results,
        key=lambda item: item["final_score"],
        reverse=True,
    )
```

该实现用于理解流程，不应直接视为生产级融合算法。

生产环境还需要处理未命中分数、异常值、候选集合变化、检索超时和权限过滤等问题。

### 6.8 企业级 Hybrid Search 架构

#### 6.8.1 售后工单 Agent 架构

```text
用户问题
    |
    v
Query 预处理
    |
    +----------------------------+
    |                            |
    v                            v
BM25 Retriever              Vector Retriever
    |                            |
    v                            v
Elasticsearch               pgvector / Qdrant
    |                            |
    v                            v
关键词候选文档                语义候选文档
    |                            |
    +-------------+--------------+
                  |
                  v
             Hybrid Fusion
                  |
                  v
             去重与排序
                  |
                  v
             候选文档集合
```

#### 6.8.2 推荐代码结构

```text
app/
└── rag/
    ├── models/
    │   └── retrieval.py
    │
    ├── retrievers/
    │   ├── base.py
    │   ├── bm25_retriever.py
    │   └── vector_retriever.py
    │
    ├── fusion/
    │   ├── base.py
    │   └── weighted_fusion.py
    │
    └── service/
        └── hybrid_search_service.py
```

模块职责：

| 模块                | 职责             |
| ------------------- | ---------------- |
| BM25Retriever       | 关键词检索       |
| VectorRetriever     | 向量检索         |
| WeightedFusion      | 分数融合         |
| HybridSearchService | 协调两路检索     |
| RetrievalResult     | 统一检索结果结构 |

#### 6.8.3 统一检索结果

```python
from pydantic import BaseModel


class RetrievalResult(BaseModel):
    chunk_id: str
    document_id: str
    content: str

    source: str

    score: float | None = None
    rank: int | None = None

    metadata: dict = {}
```

融合结果可以保留：

```python
{
    "bm25_score": 12.5,
    "vector_score": 0.92,
    "bm25_rank": 1,
    "vector_rank": 2,
    "fusion_score": 0.95
}
```

这样可以支持后续执行轨迹展示和检索问题排查。

### 6.9 工程问题

#### 6.9.1 Top K 如何设置

例如：

```python
bm25_top_k = 20
vector_top_k = 20
final_top_k = 10
```

执行流程：

1. BM25 返回 20 条。
2. Vector 返回 20 条。
3. 合并候选文档。
4. 去重和融合。
5. 最终返回 10 条。

召回太少可能遗漏相关文档，召回太多会增加计算和后续排序成本。

#### 6.9.2 两路结果如何去重

使用稳定的 `chunk_id` 识别同一 Chunk。

去重时保留：

- BM25 分数。
- Vector 分数。
- BM25 排名。
- Vector 排名。

#### 6.9.3 两路检索并行执行

```python
import asyncio


async def hybrid_search(
    query: str,
    bm25_retriever,
    vector_retriever,
):
    bm25_task = bm25_retriever.search(query)
    vector_task = vector_retriever.search(query)

    bm25_results, vector_results = await asyncio.gather(
        bm25_task,
        vector_task,
    )

    return fuse_results(
        bm25_results,
        vector_results,
    )
```

生产环境需要考虑超时、单路失败、降级策略、并发限制和耗时监控。

#### 6.9.4 混合检索不保证一定提高准确率

混合检索可能同时召回：

- 错误版本的政策。
- 其他产品型号的政策。
- 无权限访问的文档。
- 已过期的知识。

因此还需要后续的权限过滤、重排序和评估。

### 6.10 技术选型

| 架构                     | 特点                       | 适用场景                     |
| ------------------------ | -------------------------- | ---------------------------- |
| BM25 + pgvector          | PostgreSQL 统一存储与检索  | 已有 PostgreSQL 的中小型系统 |
| Elasticsearch + 向量检索 | 搜索能力与向量能力结合     | 需要成熟全文搜索的企业       |
| OpenSearch Hybrid Search | 搜索系统提供混合检索能力   | 希望在 OpenSearch 内完成融合 |
| Qdrant + 独立 BM25       | 向量数据库与关键词搜索分离 | 已有独立搜索基础设施         |

对于售后工单 Agent，建议将 BM25 和向量检索封装成两个独立 Retriever，再通过 Fusion 模块合并。

## 7. RRF 排序融合

### 7.1 RRF 解决什么问题

Hybrid Search 同时使用 BM25 和 Vector Search 检索文档。

两路检索的原始分数通常不在同一个尺度上：

- BM25 分数可能是 18.5。
- Vector 相似度可能是 0.82。
- 两种分数的计算方式和含义不同，不能直接相加。

RRF（Reciprocal Rank Fusion，倒数排名融合）通过检索排名融合结果，而不是直接比较原始分数。

核心思想：

1. 文档排名越靠前，获得的贡献越大。
2. 文档被多路检索同时命中，可以累积多路贡献。
3. 最后按照累积贡献从高到低排序。

### 7.2 Score Fusion 与 Rank Fusion

| 对比                 | Score Fusion | Rank Fusion |
| -------------------- | ------------ | ----------- |
| 主要依据             | 原始检索分数 | 检索排名    |
| 是否使用原始分数     | 是           | 否          |
| 是否需要处理分数范围 | 通常需要     | 不需要      |
| 代表方式             | 加权分数融合 | RRF         |

Score Fusion 使用原始分数进行融合，通常需要先进行分数归一化，再设置不同检索器的权重。

Rank Fusion 只关注文档在每一路检索结果中的名次，不要求不同检索器使用相同的评分标准。

### 7.3 RRF 核心原理

假设两路检索结果：

BM25：

| 文档 | 排名 |
| ---- | ---: |
| A    |    1 |
| B    |    2 |
| C    |    3 |

Vector：

| 文档 | 排名 |
| ---- | ---: |
| C    |    1 |
| D    |    2 |
| A    |    3 |

RRF 分别计算文档在各路检索中的排名贡献，再将贡献累加。

一个文档在某一路排名越靠前，该路贡献越大。

如果同一个文档同时被多路检索命中，就会累积多路贡献。

### 7.4 rank_constant 参数

`rank_constant` 控制不同排名之间贡献变化的平缓程度。

- 排名靠前的文档贡献更大。
- 排名靠后的文档贡献相对更小。
- 调整参数可以改变排名差距对最终结果的影响。

常见经验值为 60，但不是固定标准，需要通过实际检索数据评估。

注意区分：

| 参数          | 作用                             |
| ------------- | -------------------------------- |
| rank_constant | 控制排名贡献的变化程度           |
| top_k         | 控制检索或融合阶段保留的结果数量 |

### 7.5 RRF 手动计算示例

为了方便理解，假设 `rank_constant = 0`。

此时：

- 第 1 名贡献 1 分。
- 第 2 名贡献 0.5 分。
- 第 3 名贡献约 0.33 分。

| 文档 | BM25 排名 | Vector 排名 | BM25 贡献 | Vector 贡献 | 总贡献 |
| ---- | --------: | ----------: | --------: | ----------: | -----: |
| A    |         1 |           3 |      1.00 |        0.33 |   1.33 |
| B    |         2 |      未命中 |      0.50 |           0 |   0.50 |
| C    |         3 |           1 |      0.33 |        1.00 |   1.33 |
| D    |    未命中 |           2 |         0 |        0.50 |   0.50 |

最终排序：

A、C、B、D。

A 和 C 的贡献相同，需要通过稳定的并列排序规则确定先后顺序。

实际项目中通常使用 `rank_constant = 60` 等参数，贡献变化会更加平缓。

### 7.6 单路检索没有命中的情况

假设：

BM25：A、B、C

Vector：C、D、A

文档 B 没有出现在 Vector 结果中。

正确处理方式：

- B 保留 BM25 的排名贡献。
- Vector 没有命中 B，就没有 Vector 这一部分贡献。
- 不应该因为 Vector 没有命中就删除 B。
- 不应该随意给 B 编造一个排名。

没有检索到，不等于已经证明不相关。

### 7.7 Python 实现

```python
from collections import defaultdict
from typing import Any


def reciprocal_rank_fusion(
    ranked_lists: list[list[dict[str, Any]]],
    rank_constant: int = 60,
    top_k: int = 10,
) -> list[dict[str, Any]]:

    if rank_constant < 0:
        raise ValueError("rank_constant 不能小于 0")

    if top_k < 0:
        raise ValueError("top_k 不能小于 0")

    fused = defaultdict(
        lambda: {
            "rrf_score": 0.0,
            "source_details": {},
        }
    )

    for source_index, results in enumerate(ranked_lists):
        source_name = f"retriever_{source_index}"

        seen = set()
        rank = 0

        for item in results:
            chunk_id = item["chunk_id"]

            # 同一路检索结果去重
            if chunk_id in seen:
                continue

            seen.add(chunk_id)
            rank += 1

            contribution = 1 / (rank_constant + rank)

            fused[chunk_id]["rrf_score"] += contribution

            fused[chunk_id]["source_details"][source_name] = {
                "rank": rank,
                "original_score": item.get("score"),
                "contribution": contribution,
            }

    results = [
        {
            "chunk_id": chunk_id,
            **data,
        }
        for chunk_id, data in fused.items()
    ]

    results.sort(
        key=lambda item: (
            -item["rrf_score"],
            item["chunk_id"],
        )
    )

    return results[:top_k]
```

调用示例：

```python
bm25_results = [
    {"chunk_id": "A", "score": 18.5},
    {"chunk_id": "B", "score": 12.3},
    {"chunk_id": "C", "score": 8.2},
]

vector_results = [
    {"chunk_id": "C", "score": 0.91},
    {"chunk_id": "D", "score": 0.87},
    {"chunk_id": "A", "score": 0.82},
]

results = reciprocal_rank_fusion(
    ranked_lists=[
        bm25_results,
        vector_results,
    ],
    rank_constant=60,
    top_k=10,
)
```

注意：

- `score` 用于保留原始检索分数和审计。
- 标准 RRF 不使用原始分数计算融合贡献。
- 同一路结果中的重复 Chunk 只保留第一次出现的位置。
- 不同检索器应该使用统一、稳定的 Chunk ID。

### 7.8 RRF 工程设计

#### 7.8.1 稳定的 Chunk ID

同一 Chunk 被多路检索命中时，必须能够识别它们是同一个文档片段。

建议在数据摄取阶段统一生成 Chunk ID。

#### 7.8.2 保留原始检索信息

建议记录：

| 字段             | 说明           |
| ---------------- | -------------- |
| chunk_id         | Chunk 唯一标识 |
| retriever        | 检索器名称     |
| original_rank    | 原始排名       |
| original_score   | 原始检索分数   |
| rrf_contribution | 本路检索贡献   |
| final_rrf_score  | 最终融合分数   |
| query_id         | 本次查询 ID    |

#### 7.8.3 Top K 的区别

例如：

```text
BM25 Top 20
Vector Top 20
       |
       v
合并去重
       |
       v
RRF 排序
       |
       v
最终 Top 10
```

检索阶段的 Top K 决定候选文档数量。

融合阶段的 Top K 决定最终保留多少文档。

RRF 只能融合已经召回的候选，无法找回没有进入候选集合的文档。

#### 7.8.4 多路检索扩展

RRF 可以融合：

- BM25 检索。
- Dense Vector 检索。
- Multi-Query 检索。
- 不同 Embedding 模型的检索结果。
- 不同知识库的检索结果。

多路结果如果高度重复，可能会反复强化同一批候选文档，需要通过评估判断是否真的有收益。

### 7.9 RRF 与 Weighted Score Fusion

| 对比               | Weighted Score Fusion | RRF             |
| ------------------ | --------------------- | --------------- |
| 主要依据           | 原始检索分数          | 检索排名        |
| 分数是否需要归一化 | 通常需要              | 不需要          |
| 是否使用原始分数   | 是                    | 否              |
| 是否需要调权重     | 通常需要              | 标准 RRF 不需要 |

当不同检索器的分数尺度差异较大时，RRF 是一个合适的起点。

当已经建立合理的分数归一化方案，并通过实验确定不同检索器的权重时，可以使用 Weighted Score Fusion。

Weighted RRF 则是在排名贡献上额外引入检索器权重，不属于标准 RRF 的默认行为。

### 7.10 企业售后工单 Agent 应用

检索架构：

```text
用户 Query
    |
    v
Hybrid Search Service
    |
    +-- BM25 Retriever
    |       |
    |       +-- 订单号、退款编号精确匹配
    |
    +-- Vector Retriever
            |
            +-- 退款问题语义匹配
                    |
                    v
                RRF Fusion
                    |
                    v
              最终候选 Chunk
                    |
                    v
                 Reranker
                    |
                    v
                RAG Context
                    |
                    v
                LLM 生成答案
```

RRF 负责融合多路检索结果。

Reranker 负责进一步判断 Query 和候选文档之间的相关性。

两者解决的问题不同，不能互相替代。

#### 7.10.1 执行轨迹记录

建议记录：

```json
{
  "query": "订单 ORD-20261101 为什么退款还没有到账？",
  "retrieval": {
    "bm25": [
      {
        "chunk_id": "chunk_1001",
        "rank": 1,
        "score": 18.5
      }
    ],
    "vector": [
      {
        "chunk_id": "chunk_1001",
        "rank": 3,
        "score": 0.82
      }
    ]
  },
  "fusion": {
    "method": "rrf",
    "rank_constant": 60,
    "results": [
      {
        "chunk_id": "chunk_1001",
        "rrf_score": 0.032,
        "sources": ["bm25", "vector"]
      }
    ]
  }
}
```

数字仅用于展示数据结构。

控制台应能查看：

- 每路检索的排名。
- 每路检索的原始分数。
- 每路检索是否命中。
- RRF 贡献。
- 最终融合排名。

这样研发和客服人员才能理解某个 Chunk 为什么进入最终候选集合。

### 7.11 常见错误

| 错误                         | 正确做法                       |
| ---------------------------- | ------------------------------ |
| 直接相加 BM25 和 Vector 分数 | 使用排名融合，或先做合理归一化 |
| 未命中就认为不相关           | 未命中只是没有该路排名贡献     |
| 同一路重复 Chunk 重复累加    | 先去重                         |
| 不同检索器使用不同 ID        | 统一 Chunk ID                  |
| 只保存最终分数               | 保留各路排名和原始分数         |
| 认为 RRF 能找回漏掉的文档    | RRF 只能融合已召回的候选       |
| 认为参数越大越好             | 通过评估数据选择               |
| 把 RRF 和 Reranker 混为一谈  | 明确区分候选融合与模型重排序   |

## 8. Reranker 重排序

### 8.1 Reranker 是什么

Reranker（重排序模型）负责对检索阶段已经召回的候选文档重新进行相关性判断。

它接收：

- 用户 Query。
- 多个候选 Document。

然后分别判断每个 Document 与 Query 的相关程度，输出相关性分数，最后重新排序。

核心作用：

**从已经召回的候选文档中，找出真正适合回答当前问题的文档。**

### 8.2 为什么 RRF 后还需要 Reranker

RRF 解决的是多路检索结果如何合并。

但排名靠前不代表文档一定最适合回答用户问题。

例如：

用户问题：

```text
退款为什么还没有到账？
```

候选文档：

- A：退款申请正在财务审核中。
- B：退款成功后通常需要 3～5 个工作日到账。
- C：用户可以在个人中心查看订单。

这些文档都可能被初步检索召回，但它们对当前问题的帮助程度不同。

Reranker 可以结合完整 Query 和 Document 重新判断相关性。

| 对比             | RRF          | Reranker               |
| ---------------- | ------------ | ---------------------- |
| 输入             | 多路检索排名 | Query + 候选文档       |
| 主要工作         | 合并检索结果 | 判断文档相关性         |
| 判断依据         | 各路排名     | Query 与文档的匹配程度 |
| 是否需要模型推理 | 不需要       | 通常需要               |
| 计算成本         | 很低         | 相对较高               |

### 8.3 Bi-Encoder 与 Cross-Encoder

#### 8.3.1 Bi-Encoder

Bi-Encoder 分别处理 Query 和 Document。

```text
Query
  |
  v
Embedding Model
  |
  v
Query Vector


Document
  |
  v
Embedding Model
  |
  v
Document Vector
```

然后计算两个向量之间的相似程度。

特点：

- Query 和 Document 分别编码。
- 文档向量可以提前计算并存储。
- 检索速度快。
- 适合大规模候选召回。
- 不专门针对每次 Query 和 Document 组合做深度匹配。

#### 8.3.2 Cross-Encoder

Cross-Encoder 将 Query 和 Document 一起输入模型。

```text
Query + Document
       |
       v
 Cross-Encoder
       |
       v
  相关性分数
```

模型针对每个 Query-Document 组合进行相关性判断。

特点：

- Query 和 Document 一起输入。
- 能进行更细致的相关性判断。
- 每个候选文档通常都需要评分。
- 计算成本通常高于 Bi-Encoder。
- 适合对有限数量的候选文档做精细排序。

#### 8.3.3 两者对比

| 对比                 | Bi-Encoder   | Cross-Encoder            |
| -------------------- | ------------ | ------------------------ |
| 输入方式             | 分别编码     | 一起输入                 |
| 文档向量能否提前计算 | 可以         | 通常不能用同样方式预计算 |
| 检索速度             | 快           | 相对慢                   |
| 主要用途             | 第一阶段召回 | 第二阶段重排序           |

记住：

- Bi-Encoder 负责快速召回。
- Cross-Encoder 负责精细排序。

### 8.4 Reranker 完整执行流程

假设知识库有 10 万个 Chunk。

第一阶段先通过 BM25 和 Vector Search 召回候选：

```text
知识库 100,000 个 Chunk
          |
          v
      BM25 Top 50
          |
          +
          |
      Vector Top 50
          |
          v
        RRF
          |
          v
     去重候选 Top 50
```

第二阶段使用 Reranker：

```text
Query + Chunk 1
Query + Chunk 2
Query + Chunk 3
       ...
Query + Chunk 50
          |
          v
       Reranker
          |
          v
       重新排序
          |
          v
       最终 Top 5
          |
          v
      构建 RAG Context
          |
          v
        LLM 回答
```

典型流程：

Retrieve → Fuse → Rerank → Generate。

### 8.5 Reranker 分数如何理解

Reranker 通常为每个 Query-Document 组合输出一个相关性分数。

例如：

| 文档                         | 分数 |
| ---------------------------- | ---: |
| 退款正在财务审核中           | 0.96 |
| 退款成功后需要 3～5 个工作日 | 0.91 |
| 如何查看订单                 | 0.18 |

注意：

1. 不同模型的分数不能直接比较。
2. 相关性分数不一定是概率。
3. 分数高不代表事实一定正确。
4. Reranker 判断的是相关性，不负责验证业务事实。

### 8.6 常见实现方案

#### 8.6.1 使用开源 Cross-Encoder

可以使用 Sentence Transformers：

```python
from sentence_transformers import CrossEncoder

model = CrossEncoder(
    "cross-encoder/ms-marco-MiniLM-L-6-v2"
)

query = "退款为什么还没有到账？"

documents = [
    "退款申请正在财务审核中。",
    "退款成功后通常需要3到5个工作日到账。",
    "用户可以在个人中心查看订单。",
]

pairs = [
    (query, document)
    for document in documents
]

scores = model.predict(pairs)

ranked_results = sorted(
    zip(documents, scores),
    key=lambda item: float(item[1]),
    reverse=True,
)

for document, score in ranked_results:
    print(document, float(score))
```

说明：

- 示例使用英文 MS MARCO 模型，不适合直接作为中文售后业务生产模型。
- 中文项目应选择经过中文相关性任务验证的模型。
- 模型版本、许可证、最大输入长度和推理设备都需要纳入配置。

#### 8.6.2 使用专业 Reranker API

架构：

```text
RAG Application
      |
      v
Reranker Client
      |
      v
模型服务 API
      |
      v
相关性分数
      |
      v
重新排序
```

优点：

- 不需要自行管理模型权重。
- 不需要自行维护 GPU 推理环境。
- 部署和升级相对简单。

缺点：

- API 调用成本。
- 网络和服务可用性依赖。
- 需要考虑数据隐私和合规要求。

#### 8.6.3 自己部署模型

架构：

```text
FastAPI
   |
   v
Reranker Service
   |
   v
Model Runtime
   |
   v
GPU / CPU
```

建议在应用侧定义统一接口：

```python
class Reranker:
    async def rerank(
        self,
        query: str,
        documents: list[str],
        top_k: int,
    ):
        ...
```

这样更换模型时不需要修改整个 RAG 架构。

### 8.7 Reranker 工程优化

#### 8.7.1 Batch 批量评分

不推荐逐条请求模型：

```text
请求 1：Query + Document 1
请求 2：Query + Document 2
请求 3：Query + Document 3
```

推荐批量评分：

```text
准备多组 Query-Document
          |
          v
       Batch 推理
          |
          v
      返回所有分数
```

批量推理可以减少请求开销，提高 GPU 利用率。

但需要结合显存、输入长度和并发量控制 Batch 大小。

#### 8.7.2 候选数量控制

示例：

| 阶段         | 候选数量 |
| ------------ | -------: |
| BM25         |       50 |
| Vector       |       50 |
| RRF 去重后   |       60 |
| Reranker     |       60 |
| 最终 Context |        8 |

候选越多，Reranker 的计算量通常越大。

需要根据召回质量和延迟预算选择候选数量。

#### 8.7.3 文档长度控制

Cross-Encoder 通常存在最大输入长度限制。

文档过长可能导致：

- 超过模型最大 Token 长度。
- 输入被截断。
- 关键内容没有进入模型。
- 推理耗时增加。

因此应该使用合理长度的 Chunk，而不是直接把整篇文档输入模型。

#### 8.7.4 超时和降级

```text
RRF 候选结果
      |
      v
   Reranker
      |
      +-- 成功
      |     |
      |     v
      |  使用重排序结果
      |
      +-- 超时 / 失败
            |
            v
       使用 RRF 结果
```

需要记录：

- 是否成功。
- 调用耗时。
- 候选数量。
- 模型名称和版本。
- 降级次数。
- 超时原因。

降级不能跳过权限检查。

#### 8.7.5 Reranker 缓存

缓存 Key 建议考虑：

```text
query_hash
chunk_id
chunk_version
reranker_model_version
```

更换模型后，旧评分可能失效。

文档版本发生变化后，旧评分也可能失效。

缓存还需要考虑租户隔离、权限变化和数据删除。

### 8.8 Reranker 与权限控制

假设知识库包含：

- 普通客服可以查看的退款政策。
- 主管才能查看的投诉处理记录。
- 财务人员才能查看的退款审核记录。

正确原则：

**先执行权限过滤，再对用户有权访问的候选文档进行 Reranker 排序。**

推荐流程：

```text
用户 Query
    |
    v
检索请求
    |
    v
租户 / 用户权限过滤
    |
    v
BM25 + Vector
    |
    v
RRF 融合
    |
    v
权限再次校验
    |
    v
Reranker
    |
    v
最终 Context
```

最好在检索层就通过数据库过滤条件限制候选集合。

Reranker 不能成为权限控制边界。

### 8.9 Reranker 效果评估

准备一组测试问题和人工相关性标签。

例如：

| Query              | 候选文档     | 相关性标签 |
| ------------------ | ------------ | ---------: |
| 退款为什么没有到账 | 退款审核中   |          3 |
| 退款为什么没有到账 | 退款到账时间 |          3 |
| 退款为什么没有到账 | 物流配送记录 |          0 |
| 如何修改收货地址   | 修改地址说明 |          3 |
| 如何修改收货地址   | 退款审核记录 |          0 |

相关性等级：

| 标签 | 含义                       |
| ---- | -------------------------- |
| 0    | 完全不相关                 |
| 1    | 有一点关系，但不能有效回答 |
| 2    | 比较相关，能提供部分帮助   |
| 3    | 高度相关，能直接帮助回答   |

常用指标：

**1. Precision@K**

看前 K 个文档中有多少真正相关。

例如 Top 5 中有 4 个相关文档，Precision@5 为 4/5。

**2. MRR**

看第一个真正相关的文档排在第几位。

**3. NDCG@K**

考虑相关文档是否出现，以及高度相关文档是否排在更靠前的位置。

完整的评估集设计和指标计算在后面的 RAG 评估章节展开。

### 8.10 Reranker 架构取舍

| 场景                 | 建议                       |
| -------------------- | -------------------------- |
| 简单 FAQ，知识库很小 | 可以先不使用               |
| 多份文档内容相似     | 建议使用                   |
| 复杂售后政策问答     | 建议使用                   |
| 订单号精确匹配       | 先保证 BM25 召回质量       |
| 对延迟非常敏感       | 降低候选数量或选择轻量模型 |
| 对准确性要求很高     | 通过评估验证收益           |

主线项目初始架构：

```text
Hybrid Search
      |
      v
     RRF
      |
      v
  候选 Top 30～50
      |
      v
  Cross-Encoder
      |
      v
   重排序
      |
      v
   最终 Top 5～8
      |
      v
   Context Builder
      |
      v
      LLM
```

以上数量是初始实验配置，不是固定最佳参数。

订单状态、退款状态等强业务事实，还必须结合业务数据库中的实时状态验证，不能只依靠 RAG 文档。

### 8.11 常见错误

| 错误                            | 正确做法                 |
| ------------------------------- | ------------------------ |
| 对整个知识库运行 Reranker       | 先召回候选               |
| 把 Reranker 当成 Embedding 模型 | 区分向量召回和相关性排序 |
| 认为分数是概率                  | 将其视为模型相关性分数   |
| 候选数量无限增加                | 控制 Top K               |
| 输入整篇长文档                  | 控制 Chunk 长度          |
| 每个文档单独请求 API            | 尽可能批量评分           |
| 模型超时导致 Agent 卡死         | 设置超时和降级           |
| 更换模型后继续使用旧缓存        | 缓存 Key 包含模型版本    |
| 排序前不做权限过滤              | 权限过滤先于模型处理     |

## 9. Query 优化

### 9.1 Query 优化是什么

Query 优化是指：在用户问题进入检索系统之前，对问题进行分析和处理，让检索系统更容易找到真正相关的文档。

用户的原始问题可能存在以下问题：

1. 表达口语化，不够准确。
2. 使用了代词，缺少明确指代。
3. 问题太复杂，包含多个检索目标。
4. 使用了业务术语的简称或别名。
5. 问题与知识库文档的表达方式不同。

Query 优化的目标不是改变用户的真实意图，而是让检索系统更准确地理解用户想查什么。

### 9.2 Query Rewrite：查询改写

Query Rewrite 是将用户原始问题改写成更适合检索的表达。

例如：

用户问题：

```text
我的东西怎么还没到？
```

改写后：

```text
如何查询订单物流状态，以及物流长时间未更新的处理方式？
```

查询改写需要注意：

1. 保留用户原始意图。
2. 保留订单号、商品型号等关键业务信息。
3. 不要擅自补充用户没有提供的事实。
4. 不要将推测内容当成确定事实。
5. 原始 Query 必须保留，方便追踪和审计。

建议同时保存：

- original_query：用户原始问题。
- rewritten_query：改写后的问题。
- rewrite_reason：改写原因。

### 9.3 Multi-Query：多查询检索

Multi-Query 是根据一个用户问题，生成多个不同角度的检索问题。

例如：

用户问题：

```text
退款一直没到账怎么办？
```

可以生成：

```text
1. 退款到账时间一般是多久？
2. 退款处理失败的常见原因有哪些？
3. 退款已经完成但银行卡没有收到款项怎么办？
4. 如何查询退款处理状态？
```

然后分别执行检索，最后将结果合并、去重和排序。

Multi-Query 解决的问题是：同一个问题可能有多种表达方式，单次检索不一定能覆盖所有相关文档。

注意：

- 多个 Query 不代表一定能提高检索质量。
- 生成的 Query 不能擅自增加业务事实。
- 多路结果需要去重。
- 应保留每个 Chunk 来自哪个 Query。
- 需要控制生成数量，避免增加不必要的模型调用成本。

### 9.4 Query Decomposition：查询拆解

Query Decomposition 是把一个复杂问题拆成多个相对独立的子问题。

例如：

```text
我的订单已经发货三天了还没收到，
如果商品丢失了可以退款吗？
```

可以拆解成：

```text
1. 如何查询订单物流状态？
2. 物流长时间未更新应该如何处理？
3. 商品丢失是否符合退款条件？
4. 商品丢失后的退款申请流程是什么？
```

Multi-Query 和 Query Decomposition 的区别：

| 对比项   | Multi-Query              | Query Decomposition        |
| -------- | ------------------------ | -------------------------- |
| 核心目的 | 从不同角度表达同一个问题 | 将复杂问题拆成多个子问题   |
| 问题关系 | 多个表达通常指向同一目标 | 多个子问题可能需要分别回答 |
| 典型场景 | 退款政策有多种表达方式   | 物流、丢件、退款组合问题   |

### 9.5 HyDE：假设性文档嵌入

HyDE 的核心思路：

先让模型生成一段假设性的答案或文档，再将这段内容转换成向量，用于向量检索。

例如：

用户问题：

```text
商品丢失后如何申请退款？
```

模型先生成一段假设性说明：

```text
如果订单物流确认丢失，用户可以联系售后客服，
提交订单信息并根据平台退款政策申请退款。
```

然后使用这段假设性文本进行向量检索。

为什么这样做？

因为用户的问题通常比较短，而知识库文档可能是完整的业务说明。假设性文档可以让检索表达更接近知识库中的文档内容。

需要特别注意：

1. HyDE 生成的内容只是检索辅助材料。
2. 它不是经过验证的业务事实。
3. 不能直接作为最终答案。
4. 最终回答必须以真实检索结果或业务系统数据为依据。

### 9.6 Step-back Prompting：退一步提问

Step-back Prompting 是先从用户的具体问题中提取更通用的背景问题，再利用背景问题检索知识。

例如：

用户问题：

```text
订单 A123 的退款为什么还没到账？
```

可以先提取通用问题：

```text
退款到账通常受哪些因素影响？
```

通过通用问题检索退款到账规则，再结合具体订单的真实业务数据回答。

它适合处理：

- 具体问题缺少背景知识。
- 用户的问题过于细节化。
- 需要先了解通用规则，再分析具体情况。

注意：订单 A123 的实际退款状态仍然应该查询订单或退款业务 API，不能只依靠知识库推断。

### 9.7 Query Expansion：查询扩展

Query Expansion 是为原始 Query 补充同义词、相关术语或业务关键词。

例如：

```text
原始 Query：
退款没到账
```

扩展关键词：

```text
退款到账
退款处理进度
退款失败
原路退回
银行卡入账
支付渠道退款
```

扩展后的关键词可以用于 BM25 检索，提高关键词召回能力。

企业系统中可以维护业务词典：

| 用户表达 | 业务术语     |
| -------- | ------------ |
| 没到账   | 未入账       |
| 退钱     | 退款         |
| 快递没动 | 物流未更新   |
| 东西坏了 | 商品质量问题 |
| 换一个   | 换货申请     |

### 9.8 不同 Query 优化策略如何选择

| 策略                | 适用场景                         | 主要作用           |
| ------------------- | -------------------------------- | ------------------ |
| Query Rewrite       | 口语化、表达不清楚               | 改善查询表达       |
| Multi-Query         | 同一个问题存在多种表达           | 扩大检索覆盖       |
| Query Decomposition | 一个问题包含多个目标             | 拆分检索任务       |
| HyDE                | 用户问题短，知识库文档表达较完整 | 改善向量检索表达   |
| Step-back           | 需要先了解通用背景               | 补充背景知识       |
| Query Expansion     | 业务术语、同义词较多             | 扩大关键词匹配范围 |

不要每次检索都开启全部策略。

应该根据问题类型选择合适的策略，并通过后续评估判断是否真正有效。

### 9.9 QueryOptimizer 接口设计

可以将不同的 Query 优化策略统一封装。

```python
from typing import Protocol
from pydantic import BaseModel


class QueryContext(BaseModel):
    original_query: str
    tenant_id: str
    user_id: str


class OptimizedQuery(BaseModel):
    original_query: str
    rewritten_query: str
    queries: list[str]
    strategy: str


class QueryOptimizer(Protocol):

    async def optimize(
        self,
        context: QueryContext,
    ) -> OptimizedQuery:
        ...
```

不同策略可以实现统一接口：

```python
class RewriteOptimizer:

    async def optimize(
        self,
        context: QueryContext,
    ) -> OptimizedQuery:

        # 调用 LLM 进行查询改写
        rewritten = context.original_query

        return OptimizedQuery(
            original_query=context.original_query,
            rewritten_query=rewritten,
            queries=[rewritten],
            strategy="rewrite",
        )
```

这里的 `rewritten` 只是接口示例，实际项目中需要接入模型调用。

### 9.10 Multi-Query 结果合并

多个 Query 执行检索后，需要统一合并结果。

主要处理：

1. 合并不同 Query 返回的 Chunk。
2. 根据稳定的 chunk_id 去重。
3. 保留每个 Chunk 的来源 Query。
4. 保留各路检索排名。
5. 交给后续 Hybrid Search 或 RRF 进行排序。

示例：

```python
def merge_results(results: list[list[dict]]) -> list[dict]:
    merged = {}

    for query_index, items in enumerate(results):
        for rank, item in enumerate(items, start=1):
            chunk_id = item["chunk_id"]

            if chunk_id not in merged:
                merged[chunk_id] = {
                    **item,
                    "matched_queries": [],
                }

            merged[chunk_id]["matched_queries"].append({
                "query_index": query_index,
                "rank": rank,
            })

    return list(merged.values())
```

这只是基础合并逻辑。生产环境还需要考虑异常结果、重复来源、排序策略和候选数量控制。

### 9.11 售后工单 Agent 中的 Query 优化

推荐流程：

```text
用户提出问题
    |
    v
保存原始 Query
    |
    v
分析问题类型
    |
    v
选择 Query 优化策略
    |
    v
生成优化后的 Query
    |
    v
BM25 + Vector Search
    |
    v
合并检索结果
    |
    v
RRF 排序融合
    |
    v
Reranker 重排序
    |
    v
构建上下文
    |
    v
LLM 生成回答
```

例如用户提出：

```text
退款怎么还没回来？
```

系统可以：

1. 保留原始问题。
2. 改写成退款到账问题。
3. 扩展退款处理、原路退回、支付渠道等关键词。
4. 检索退款政策和常见问题文档。
5. 如果需要查询具体订单状态，则调用退款业务 API。
6. 综合真实业务状态和知识库规则生成回答。

### 9.12 执行轨迹设计

企业系统需要记录 Query 优化过程，方便排查检索质量问题。

建议记录：

| 字段                  | 说明                    |
| --------------------- | ----------------------- |
| original_query        | 用户原始问题            |
| rewritten_query       | 改写后的问题            |
| generated_queries     | 生成的多个 Query        |
| optimization_strategy | 使用的优化策略          |
| retrieved_chunk_ids   | 检索到的 Chunk          |
| matched_queries       | 每个 Chunk 命中的 Query |
| latency               | Query 优化耗时          |
| model_name            | 使用的模型              |

这些信息可以进入售后工单 Agent 的执行轨迹控制台。

### 9.13 常见错误

1. 改写 Query 时擅自补充用户没有提供的信息。
2. 将 HyDE 生成的假设性内容当成真实知识。
3. 每次请求都生成大量 Query，导致成本和延迟增加。
4. Multi-Query 检索后没有去重。
5. 丢失原始 Query，导致无法追踪模型改写行为。
6. 将复杂问题拆解后，没有保留子问题之间的关系。
7. 用 RAG 知识库代替实时业务 API 查询。
8. 只看生成的 Query 数量，不验证检索结果是否真正改善。

## 10. 权限过滤与多租户 RAG

### 10.1 企业 RAG 为什么需要权限过滤

普通个人知识库通常只需要判断文档是否相关。

企业知识库还需要判断用户是否有权访问文档。

企业知识库可能同时存在：

- 不同租户的数据。
- 不同部门的内部资料。
- 不同角色的业务文档。
- 特定用户才能访问的文档。
- 已经撤销访问权限的文档。

如果不做权限过滤，可能发生：

1. 跨租户数据泄露。
2. 跨部门数据泄露。
3. 跨角色数据泄露。
4. 员工离职后仍然访问内部资料。
5. 文档撤权后仍然通过旧索引或缓存访问。

企业 RAG 必须同时保证：

- 检索相关性。
- 用户访问权限。

权限由后端系统强制执行，不能依赖 LLM 自己判断。

### 10.2 Multi-tenancy：多租户

Multi-tenancy 是指一套应用服务多个相互独立的企业客户。

每个企业客户就是一个 Tenant。

常见隔离方式：

| 方式                    | 说明                    |
| ----------------------- | ----------------------- |
| 共享数据库、共享表      | 每条数据带 tenant_id    |
| 共享数据库、独立 Schema | 每个租户使用独立 Schema |
| 独立数据库              | 每个租户使用独立数据库  |

售后工单 Agent 初期可以采用共享数据库、共享表，通过 tenant_id 强制隔离。

但 tenant_id 必须从可信的服务端认证上下文中获取，不能直接信任客户端传入的值。

### 10.3 企业权限对象关系

企业权限系统涉及：

| 对象       | 作用     |
| ---------- | -------- |
| Tenant     | 租户     |
| User       | 用户     |
| Role       | 角色     |
| Department | 部门     |
| Document   | 文档     |
| Chunk      | 文档切片 |
| Permission | 访问权限 |

一个用户可以拥有多个角色，一份文档也可以同时受到租户、部门、角色和用户级权限约束。

### 10.4 RBAC：基于角色的访问控制

RBAC（Role-Based Access Control）通过用户角色决定访问权限。

例如：

| 角色             | 权限                       |
| ---------------- | -------------------------- |
| customer_service | 查看普通售后政策           |
| supervisor       | 查看售后政策和投诉升级报告 |
| finance          | 查看退款结算资料           |

RBAC 适合按岗位划分权限的企业系统。

### 10.5 ACL：访问控制列表

ACL（Access Control List）直接在资源上定义哪些用户或角色可以访问。

例如：

```text
文档：退款结算报表

允许访问：
- user_1001
- user_1002
- finance
- supervisor
```

ACL 适合需要对具体文档进行单独授权的场景。

企业系统通常组合使用 RBAC 和 ACL：

- RBAC 提供角色级授权。
- ACL 提供资源级授权。
- tenant_id 提供租户隔离。
- 显式拒绝优先于允许。
- 最终授权由统一权限服务决定。

### 10.6 Document-level Permissions：文档级权限

建议 Document 保存以下权限字段：

| 字段          | 作用           |
| ------------- | -------------- |
| tenant_id     | 所属租户       |
| owner_id      | 文档所有者     |
| department_id | 所属部门       |
| visibility    | 可见范围       |
| allowed_roles | 允许的角色     |
| allowed_users | 允许的用户     |
| denied_users  | 明确拒绝的用户 |

visibility 可以设计为：

| 值         | 含义                       |
| ---------- | -------------------------- |
| tenant     | 租户内符合条件的用户可访问 |
| department | 限定部门                   |
| private    | 所有者或明确授权人员       |
| restricted | 必须满足明确授权规则       |

这些是业务设计字段，不是数据库规定的标准字段。

### 10.7 Chunk 权限继承

RAG 实际检索的通常是 Chunk，而不是完整 Document。

因此：

1. Document 保存权威权限。
2. Chunk 继承 Document 权限。
3. Chunk 可以冗余保存必要的权限字段。
4. Document 权限变化时，需要同步更新 Chunk。
5. 最终授权仍然以可信的权限系统为准。

冗余权限字段可以提高检索效率，但必须解决权限同步和版本一致性问题。

### 10.8 RAG 全链路权限控制

正确的流程：

```text
用户请求
    |
    v
身份认证
    |
    v
构建可信 AuthContext
    |
    v
权限约束下的检索
    |
    v
候选结果权限复核
    |
    v
Reranker
    |
    v
Context Builder 再次校验
    |
    v
LLM
    |
    v
引用和最终输出权限复核
```

需要控制的环节：

| 环节            | 权限要求           |
| --------------- | ------------------ |
| 文档摄取        | 验证租户和授权信息 |
| 索引构建        | 保存权限元数据     |
| BM25            | 执行权限过滤       |
| Vector Search   | 执行权限过滤       |
| RRF             | 只融合授权结果     |
| Reranker        | 只接收授权候选     |
| Context Builder | 再次校验           |
| Cache           | 隔离不同授权范围   |
| 引用展示        | 不展示无权限文档   |

不能先检索全部文档，再只在最终回答阶段过滤。

### 10.9 pgvector 权限过滤

Chunk 表可以保存：

```sql
CREATE TABLE document_chunks (
    id BIGSERIAL PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL,
    document_id VARCHAR(64) NOT NULL,
    chunk_id VARCHAR(64) NOT NULL,
    owner_id VARCHAR(64),
    department_id VARCHAR(64),
    visibility VARCHAR(32) NOT NULL,
    allowed_roles TEXT[] NOT NULL DEFAULT '{}',
    allowed_users TEXT[] NOT NULL DEFAULT '{}',
    denied_users TEXT[] NOT NULL DEFAULT '{}',
    content TEXT NOT NULL,
    embedding VECTOR(1536)
);
```

常用索引：

```sql
CREATE INDEX idx_chunks_tenant
ON document_chunks (tenant_id);

CREATE INDEX idx_chunks_department
ON document_chunks (tenant_id, department_id);

CREATE INDEX idx_chunks_roles
ON document_chunks USING GIN (allowed_roles);
```

检索时将权限条件放在 WHERE 中。

示意：

```sql
SELECT chunk_id, document_id, content
FROM document_chunks
WHERE tenant_id = :tenant_id
  AND (
      visibility = 'tenant'
      OR (
          visibility = 'department'
          AND department_id = :department_id
      )
      OR (
          visibility = 'private'
          AND owner_id = :user_id
      )
  )
  AND (
      cardinality(allowed_roles) = 0
      OR allowed_roles && :roles
  )
  AND NOT (
      :user_id = ANY(denied_users)
  )
ORDER BY embedding <=> :query_embedding
LIMIT 10;
```

注意：

- 示例用于说明权限过滤思路，不是完整生产授权实现。
- 需要明确角色授权与用户授权之间的 AND/OR 关系。
- 必须使用参数化查询。
- tenant_id 必须来自可信身份上下文。
- 需要结合 EXPLAIN ANALYZE 检查查询计划。
- 根据实际数据量和过滤选择性优化索引。

### 10.10 Qdrant 权限过滤

Qdrant Point 包含：

- id
- vector
- payload

Payload 可以保存：

```json
{
  "tenant_id": "tenant_a",
  "department_id": "customer_service",
  "visibility": "department",
  "allowed_roles": [
    "customer_service",
    "supervisor"
  ]
}
```

检索时使用 Filter 限制数据范围。

示意：

```python
query_filter = {
    "must": [
        {
            "key": "tenant_id",
            "match": {
                "value": "tenant_a"
            }
        },
        {
            "key": "department_id",
            "match": {
                "value": "customer_service"
            }
        }
    ]
}
```

常用 Payload 字段可以建立 Payload Index。

实际 SDK 参数和复杂条件组合需要根据使用版本实现。

### 10.11 Milvus 权限过滤

Milvus 可以在 Collection 中定义标量字段：

```text
tenant_id
department_id
visibility
```

通过过滤表达式限制检索范围。

示意：

```python
filter_expr = (
    'tenant_id == "tenant_a" '
    'and department_id == "customer_service"'
)
```

需要根据 Milvus 版本和 SDK 确认具体查询参数和字段类型。

### 10.12 过滤前、过滤后与 ANN

过滤前检索全部数据，再删除无权限结果，会带来两个问题：

1. 无权限数据可能进入后续处理环节。
2. 过滤后候选数量可能不足。

推荐优先在数据库检索阶段执行权限过滤。

需要关注：

- 过滤条件是否参与向量检索。
- 过滤条件是否支持向量索引。
- ANN 是否能返回足够的授权候选。
- 是否需要建立标量或 Payload 索引。
- 过滤后候选数量是否充足。

安全要求不能为了召回率而取消。

### 10.13 Hybrid Search 权限一致性

Hybrid Search 包含：

- BM25 关键词检索。
- Vector 向量检索。

两路必须使用相同的权限范围。

建议统一定义：

```python
from pydantic import BaseModel


class RetrievalScope(BaseModel):
    tenant_id: str
    user_id: str
    department_id: str | None = None
    roles: list[str]
```

BM25 和 Vector Retriever 都接收同一个 RetrievalScope。

RRF 只负责融合排序，不负责权限判断。

### 10.14 Query 优化与权限边界

| 技术            | 权限要求                    |
| --------------- | --------------------------- |
| Query Rewrite   | 不能擅自扩大权限            |
| Multi-Query     | 每个 Query 使用相同授权范围 |
| HyDE            | 假设性内容不能绕过权限过滤  |
| BM25            | 检索阶段过滤                |
| Vector Search   | 检索阶段过滤                |
| RRF             | 只融合授权结果              |
| Reranker        | 只处理授权候选              |
| Context Builder | 构建前再次校验              |
| LLM             | 不负责最终授权判断          |

Prompt 不是权限系统。

不能依靠提示词阻止无权限数据进入模型上下文。

### 10.15 Cache 权限隔离

缓存 Key 不能只使用 Query。

建议考虑：

- tenant_id
- user_id 或 permission_scope
- roles
- department_id
- policy_version
- query_hash
- index_version
- model_version

示例：

```python
import hashlib
import json


def build_cache_key(
    tenant_id: str,
    user_id: str,
    roles: list[str],
    department_id: str | None,
    policy_version: str,
    query: str,
) -> str:

    payload = {
        "tenant_id": tenant_id,
        "user_id": user_id,
        "roles": sorted(roles),
        "department_id": department_id,
        "policy_version": policy_version,
        "query": query,
    }

    raw = json.dumps(
        payload,
        sort_keys=True,
        ensure_ascii=False,
    )

    digest = hashlib.sha256(
        raw.encode("utf-8")
    ).hexdigest()

    return f"rag:{digest}"
```

缓存命中不能跳过权限检查。

权限变化后必须使相关缓存失效或重新校验。

### 10.16 文档撤权和权限变更

常见变更：

- 员工离职。
- 员工调部门。
- 员工角色变化。
- 文档修改可见范围。
- 文档撤销某个用户的访问权限。
- 租户停用或删除。

推荐流程：

```text
权限变化
    |
    v
更新权威权限数据
    |
    v
发布权限变更事件
    |
    +----------------+
    |                |
    v                v
更新 Chunk 元数据   更新缓存版本
    |                |
    v                v
同步检索索引        缓存失效
    |                |
    +-------+--------+
            |
            v
      使用新权限检索
```

还需要：

- 事件重试。
- 死信处理。
- 定期数据对账。
- 权限版本检查。
- 高敏感文档的同步期间拒绝访问策略。

不能默认旧权限在同步完成前继续有效。

### 10.17 Prompt Injection 与权限安全

需要区分：

**权限越权：** 用户无权访问某份文档，但系统把文档提供给了用户。

**Prompt Injection：** 文档内容试图影响模型行为，诱导模型执行不应该执行的操作。

防护方式：

1. 检索文档视为不可信数据。
2. 不允许文档内容覆盖系统指令。
3. 工具调用必须由后端再次授权。
4. 高风险操作执行参数校验和人工审批。
5. 记录工具调用和数据访问审计。
6. 权限检查不能只依赖 Prompt。

### 10.18 权限自动化测试

构造测试数据：

| 文档    | 租户 | 角色             |
| ------- | ---- | ---------------- |
| doc_001 | A    | customer_service |
| doc_002 | A    | supervisor       |
| doc_003 | A    | finance          |
| doc_004 | B    | customer_service |

测试：

```python
def test_cross_tenant_isolation():
    results = search(
        query="退款政策",
        auth_context=tenant_a_user,
    )

    for item in results:
        assert item.tenant_id == "tenant_a"
```

必须覆盖：

- BM25 结果。
- Vector Search 结果。
- RRF 输入。
- Reranker 输入。
- LLM Context。
- 最终引用。
- 缓存命中。
- 撤权后的访问。
- 角色变化后的访问。
- 伪造 tenant_id 的访问。

不能只检查最终回答。

还要检查无权限文档有没有进入中间处理环节。

### 10.19 售后工单 Agent 权限架构

推荐模块：

```text
app/
├── auth/
│   ├── authentication.py
│   ├── authorization.py
│   └── auth_context.py
│
├── permissions/
│   ├── policy.py
│   ├── rbac.py
│   ├── acl.py
│   ├── document_permission.py
│   └── permission_service.py
│
├── rag/
│   ├── ingestion/
│   ├── retrievers/
│   │   ├── bm25.py
│   │   └── vector.py
│   ├── hybrid_search.py
│   ├── fusion.py
│   ├── reranker.py
│   └── context_builder.py
│
├── cache/
│   └── rag_cache.py
│
└── tests/
    ├── test_tenant_isolation.py
    ├── test_rbac.py
    ├── test_document_acl.py
    ├── test_retrieval_permissions.py
    └── test_cache_isolation.py
```

核心原则：

Agent 可以理解问题、选择工具和组织回答，但不能自行决定用户有没有权限访问数据。

权限由后端授权服务控制。

### 10.20 常见错误

1. 只在 Prompt 中告诉模型不能泄露数据。
2. 只在最终回答阶段检查权限。
3. BM25 过滤了权限，Vector Search 没有过滤。
4. 只按 tenant_id 过滤，没有考虑部门和角色。
5. 信任客户端传入的 tenant_id。
6. Document 权限更新后没有同步 Chunk。
7. 撤权后仍然返回旧缓存。
8. Reranker 接收无权限文档。
9. 只检查最终回答，不检查 LLM Context。
10. 没有记录权限策略版本。
11. 不同模块分别实现权限规则。
12. 为了召回率直接取消权限过滤。

## 11. RAG 评估集与评估指标

### 11.1 为什么 RAG 需要评估

RAG 系统不能只通过几个问题的人工测试判断好坏。

修改 Chunk Size、Embedding 模型、Top K、RRF 参数或 Reranker 后，都可能出现：

- 部分问题检索质量提高。
- 部分问题检索质量下降。
- 无关文档增加。
- 最终回答出现幻觉。
- 延迟和成本增加。

评估集的作用是：

准备一批固定测试问题和标准结果，每次修改 RAG 后都执行相同的测试，比较系统变化。

### 11.2 RAG 四层评估体系

| 层次     | 评估内容                   |
| -------- | -------------------------- |
| 数据质量 | 文档解析、切片、元数据     |
| 检索质量 | 召回、准确率、排序         |
| 生成质量 | 答案正确性、忠实度、相关性 |
| 系统工程 | 延迟、成本、稳定性、安全性 |

四层不能互相替代。

检索质量好不代表最终回答正确，最终回答正确也不代表引用正确或系统安全。

### 11.3 Evaluation Dataset：评估数据集

一条评估数据建议包含：

| 字段                  | 说明               |
| --------------------- | ------------------ |
| question              | 测试问题           |
| expected_answer       | 参考答案           |
| relevant_chunk_ids    | 标准相关 Chunk     |
| relevant_document_ids | 标准相关文档       |
| tenant_id             | 所属租户           |
| category              | 问题类型           |
| difficulty            | 问题难度           |
| answerable            | 知识库是否能够回答 |

示例：

```json
{
  "question": "商品退货后退款什么时候到账？",
  "expected_answer": "退款到账时间取决于退款处理状态和支付渠道，应以实际退款记录为准。",
  "relevant_chunk_ids": [
    "chunk_refund_001",
    "chunk_refund_002"
  ],
  "relevant_document_ids": [
    "doc_refund_policy"
  ],
  "tenant_id": "tenant_a",
  "category": "refund",
  "difficulty": "normal",
  "answerable": true
}
```

其中 Ground Truth 指人工确认的标准答案和标准相关证据。

评估集应覆盖：

- 事实查询。
- 业务流程。
- 政策查询。
- 精确关键词。
- 多条件问题。
- 多跳问题。
- 模糊表达。
- 无答案问题。
- 实时数据问题。
- 权限问题。

### 11.4 Ground Truth 如何建立

推荐流程：

```text
收集真实问题
    |
    v
人工确认参考答案
    |
    v
人工标注相关文档
    |
    v
人工标注相关 Chunk
    |
    v
检查标注一致性
    |
    v
形成固定评估集
```

LLM 可以辅助生成和标注，但重要业务问题必须经过人工审核。

特别是退款、保修、权限等高风险内容，不能让模型自行编造标准答案。

### 11.5 评估集划分

| 数据集          | 用途               |
| --------------- | ------------------ |
| Development Set | 开发和调参         |
| Validation Set  | 方案比较和参数选择 |
| Test Set        | 最终独立评估       |

不能反复根据 Test Set 调参，否则容易让系统只适合这批测试问题。

相似问题也应避免在不同数据集中造成数据泄漏。

### 11.6 Recall@K：召回率

Recall@K 衡量：

正确的相关文档中，有多少被前 K 个检索结果找到了。

例如：

标准相关 Chunk 有 4 个，Top 5 找回 2 个。

Recall@5 = 2 / 4 = 50%。

它关注有没有漏掉相关文档。

常见指标：

- Recall@5
- Recall@10
- Recall@20

K 越大，通常越容易找到相关文档，但也可能带来更多无关候选和处理成本。

### 11.7 Precision@K：精确率

Precision@K 衡量：

前 K 个检索结果中，有多少是真正相关的。

例如：

Top 5 找到 2 个相关 Chunk。

Precision@5 = 2 / 5 = 40%。

两者区别：

| 指标        | 关注点                   |
| ----------- | ------------------------ |
| Recall@K    | 相关内容有没有找全       |
| Precision@K | 检索结果中有多少真正相关 |

Recall 太低可能导致答案缺少证据。

Precision 太低可能导致上下文包含大量无关内容。

### 11.8 MRR：平均倒数排名

MRR 全称 Mean Reciprocal Rank。

它衡量第一个正确结果的位置。

直观理解：

- 第一个结果就正确，得分最高。
- 第二个结果才正确，得分降低。
- 第三个结果才正确，得分进一步降低。
- 没有正确结果，得分为 0。

MRR 适合 FAQ 和单个主要答案文档的检索场景。

如果问题需要多个 Chunk 才能完整回答，MRR 不能完整反映整体检索质量。

### 11.9 NDCG@K：排序质量

NDCG@K 同时考虑：

- 文档的相关程度。
- 文档在结果中的排名位置。

可以将相关程度分成：

| 等级 | 含义             |
| ---- | ---------------- |
| 3    | 直接回答问题     |
| 2    | 包含关键支持信息 |
| 1    | 有一定帮助       |
| 0    | 完全无关         |

如果两个检索方案找到了相同的文档，但一个方案把最相关的文档排在前面，那么它的 NDCG 通常更高。

MRR 关注第一个正确结果。

NDCG@K 关注多个结果的整体排序质量。

### 11.10 检索指标对比

| 指标        | 衡量内容             | 适用场景     |
| ----------- | -------------------- | ------------ |
| Recall@K    | 相关内容找回比例     | 关注漏召回   |
| Precision@K | 检索结果准确比例     | 关注无关内容 |
| MRR         | 第一个正确结果的位置 | 单个主要答案 |
| NDCG@K      | 相关程度和排序位置   | 多个证据文档 |

售后工单 Agent 建议重点关注：

- Recall@5 / Recall@10
- Precision@5 / Precision@10
- MRR
- NDCG@10

### 11.11 Reranker 评估

Reranker 主要负责重新排列已有候选，不会凭空找回初始召回阶段没有找到的文档。

评估流程：

```text
原始检索结果
    |
    v
计算检索指标
    |
    v
加入 Reranker
    |
    v
重新计算检索指标
    |
    v
比较变化
```

示例：

| 指标      | Reranker 前 | Reranker 后 |
| --------- | ----------: | ----------: |
| Recall@10 |         85% |         85% |
| MRR       |        0.62 |        0.79 |
| NDCG@10   |        0.71 |        0.86 |

说明召回数量没有变化，但正确文档的排名提高了。

### 11.12 Answer Correctness：答案正确性

衡量最终答案是否符合真实业务规则和标准答案。

不能只比较字符串是否完全相同。

需要检查：

- 事实是否正确。
- 关键条件是否完整。
- 是否存在错误数字。
- 是否把不确定信息说成确定结论。

### 11.13 Faithfulness：忠实度

衡量回答是否能够从检索上下文中找到依据。

如果上下文没有说明退款一定在 24 小时内到账，而模型却给出这个结论，就存在忠实度问题。

主要发现：

- 模型编造数字。
- 无依据扩展。
- 忽略证据限制条件。
- 把推测当成事实。

### 11.14 Answer Relevancy：答案相关性

衡量回答是否真正解决用户提出的问题。

用户问如何申请换货，模型只回答平台支持退款、换货和维修服务，就没有真正回答问题。

### 11.15 Context Relevance：上下文相关性

衡量检索上下文是否与用户问题相关。

例如用户查询 X200 的保修期限，检索结果却包含 X100 的保修政策、退款流程和物流说明。

大量无关内容会增加模型理解负担。

### 11.16 生成质量指标对比

| 指标               | 关注点             |
| ------------------ | ------------------ |
| Answer Correctness | 最终答案是否正确   |
| Faithfulness       | 是否有证据支持     |
| Answer Relevancy   | 是否回答了用户问题 |
| Context Relevance  | 检索上下文是否相关 |

Faithfulness 高不代表 Answer Correctness 一定高。

如果知识库本身存在错误，模型忠实引用错误文档，也可能得到较高的忠实度。

### 11.17 RAGAS 与 LLM-as-a-Judge

Ragas 是一种 RAG 自动化评估框架。

常见评估指标包括：

- Faithfulness
- Answer Relevancy
- Context Precision
- Context Recall
- Answer Correctness

LLM-as-a-Judge 是让模型充当评审员，对 RAG 的检索结果和回答进行评估。

评估流程：

```text
评估问题
    |
    v
RAG 系统执行
    |
    v
获得上下文和回答
    |
    v
评估模型进行判断
    |
    v
输出评估分数
```

LLM Judge 存在局限：

1. 评审模型可能理解错业务规则。
2. 不同评审模型可能给出不同分数。
3. 可能偏好某种回答风格。
4. 评估结果存在不稳定性。

推荐组合：

- 自动评估用于大规模回归测试。
- 人工评估用于抽样检查。
- 高风险业务问题必须人工确认标准。
- 定期检查评审模型的一致性。

### 11.18 系统工程指标

RAG 还需要评估：

| 指标               | 含义         |
| ------------------ | ------------ |
| Retrieval Latency  | 检索耗时     |
| Reranker Latency   | 重排序耗时   |
| Generation Latency | LLM 生成耗时 |
| End-to-End Latency | 整体请求耗时 |
| Token Usage        | Token 消耗   |
| Cost per Query     | 单次请求成本 |
| Error Rate         | 请求失败率   |
| Timeout Rate       | 超时比例     |
| Cache Hit Rate     | 缓存命中率   |

不能只追求回答质量，还要满足生产环境的延迟、成本和稳定性要求。

### 11.19 评估数据结构

建议使用统一的 Pydantic 模型：

```python
from pydantic import BaseModel
from typing import Literal


class EvaluationSample(BaseModel):
    sample_id: str

    question: str

    expected_answer: str

    relevant_chunk_ids: list[str]

    relevant_document_ids: list[str]

    tenant_id: str

    category: str

    difficulty: Literal[
        "easy",
        "normal",
        "hard",
    ]

    answerable: bool = True
```

可以继续增加：

- expected_citations
- expected_behavior
- permission_scope
- requires_tool_call
- dataset_version

其中 answerable 表示当前知识库是否包含足够信息回答这个问题。

### 11.20 简单检索评估器

```python
def evaluate_retrieval(
    retrieved_ids: list[str],
    relevant_ids: list[str],
    k: int,
) -> dict:
    retrieved = retrieved_ids[:k]

    relevant_set = set(relevant_ids)
    retrieved_set = set(retrieved)

    hits = retrieved_set & relevant_set

    recall = (
        len(hits) / len(relevant_set)
        if relevant_set
        else 0.0
    )

    precision = (
        len(hits) / len(retrieved)
        if retrieved
        else 0.0
    )

    return {
        f"recall@{k}": recall,
        f"precision@{k}": precision,
        "hit_count": len(hits),
    }
```

这是入门实验实现，生产环境还需要处理多条样本、不同 K 值、重复结果、多级相关性和分类统计。

### 11.21 整个评估集的统计

不能只看单条问题。

需要对整个评估集逐条执行，然后计算整体指标。

还要按业务类别分别统计：

| 问题类别 | Recall@10 |
| -------- | --------: |
| 退款     |       90% |
| 物流     |       85% |
| 换货     |       70% |
| 商品保修 |       60% |
| 投诉升级 |       80% |

整体平均分可能不错，但分类指标能够帮助定位具体问题。

例如商品保修 Recall 偏低，可能是：

- 保修文档切片不合理。
- 产品型号分词不正确。
- Query Rewrite 改写不准确。
- Embedding 对型号表达理解不好。
- 知识库缺少文档。

### 11.22 评估报告

每次评估应该保存结构化报告。

建议包含：

| 字段               | 说明           |
| ------------------ | -------------- |
| evaluation_run_id  | 评估运行 ID    |
| dataset_version    | 评估集版本     |
| rag_version        | RAG 系统版本   |
| embedding_model    | Embedding 模型 |
| chunking_version   | 切片版本       |
| retriever_config   | 检索配置       |
| reranker_model     | Reranker 模型  |
| retrieval_metrics  | 检索指标       |
| generation_metrics | 生成指标       |
| latency_metrics    | 延迟指标       |
| cost_metrics       | 成本指标       |
| failed_samples     | 失败样本       |

报告示例：

```json
{
  "evaluation_run_id": "eval_001",
  "dataset_version": "v1.0",
  "rag_version": "v1.2",
  "retrieval_metrics": {
    "recall_at_10": 0.86,
    "precision_at_10": 0.72,
    "mrr": 0.78,
    "ndcg_at_10": 0.83
  },
  "generation_metrics": {
    "faithfulness": 0.91,
    "answer_relevancy": 0.88
  },
  "system_metrics": {
    "avg_latency_ms": 1800,
    "error_rate": 0.01
  }
}
```

以上数字仅用于展示报告结构，不代表真实测试结果。

### 11.23 售后工单 Agent 评估策略

建议覆盖：

| 分类             | 重点验证                 |
| ---------------- | ------------------------ |
| 退款政策         | 退款规则是否准确         |
| 物流查询         | 是否区分知识库和实时数据 |
| 商品保修         | 型号和保修期限是否准确   |
| 换货流程         | 是否找到完整流程         |
| 投诉升级         | 是否找到正确升级规则     |
| 多条件问题       | 是否找到全部必要证据     |
| 无答案问题       | 是否正确拒答             |
| 权限问题         | 是否严格隔离数据         |
| Prompt Injection | 是否抵抗恶意文档指令     |

重点分析三种失败：

1. 检索失败：标准相关文档没有找回来。
2. 生成失败：找到了正确文档，但回答错误。
3. 安全失败：无权限文档进入了不应该进入的处理环节。

安全失败必须单独作为上线阻断条件，不能被普通平均分掩盖。

### 11.24 常见错误

1. 只测试几个问题就认为 RAG 足够好。
2. 只看最终回答，不评估检索过程。
3. 只看 Recall，不看 Precision 和排序指标。
4. 只看 Faithfulness，不检查答案正确性。
5. Ground Truth 没有人工审核。
6. Development 和 Test 混在一起。
7. 只看整体平均值，不按业务类别分析。
8. 忽略无答案问题和拒答能力。
9. 评估数据和生产知识库版本不一致。
10. 不关注延迟和成本。
11. 把 LLM Judge 分数当成绝对正确的结论。
12. 将权限安全问题混入普通质量平均分。

## 12. 消融实验与系统优化（Ablation Study）

### 12.1 什么是 Ablation Study

Ablation Study 即消融实验。

核心思想：

搭建完整系统，然后每次去掉一个组件，观察系统指标发生什么变化。

例如完整 RAG 包含：

- BM25
- Vector Search
- RRF
- Reranker
- Query Rewrite

逐个关闭组件，比较实验结果。

消融实验用于判断：

1. 哪些组件真正有效。
2. 哪些组件只增加复杂度。
3. 哪些组件值得承担额外成本。
4. 哪些组件应该针对特定问题启用。

### 12.2 消融实验的价值

复杂 RAG 不一定比简单 RAG 更好。

增加组件可能提高质量，也可能增加：

- 推理延迟。
- Token 消耗。
- 模型调用次数。
- 系统复杂度。
- 故障点。

技术选型不能以组件数量为依据，而应该以实验结果为依据。

### 12.3 实验类型对比

| 实验类型   | 关注点             |
| ---------- | ------------------ |
| 对比实验   | 哪个完整方案更好   |
| 消融实验   | 某个组件是否有贡献 |
| 参数实验   | 哪个参数更合适     |
| 敏感性实验 | 参数变化对结果影响 |
| 错误分析   | 系统为什么失败     |

### 12.4 消融实验基本原则

#### 12.4.1 一次只改变一个因素

例如：

| 配置 | Chunk Size | Overlap | Embedding |
| ---- | ---------: | ------: | --------- |
| A    |        500 |      50 | Model A   |
| B    |        800 |      50 | Model A   |

只改变 Chunk Size，其他条件保持一致。

这样更容易确定结果变化的原因。

#### 12.4.2 固定评估集

所有实验使用相同的评估集。

不能使用不同的问题集合比较两个方案。

#### 12.4.3 固定其他配置

尽量固定：

- 文档数据版本。
- Chunking 版本。
- Embedding 模型。
- Prompt 版本。
- LLM 模型。
- Top K。
- 检索过滤条件。
- 评估集版本。

#### 12.4.4 不只看一个指标

需要综合：

- Recall@K。
- Precision@K。
- MRR。
- NDCG@K。
- Answer Correctness。
- Faithfulness。
- Latency。
- Cost。

#### 12.4.5 保存实验记录

每次实验记录：

- 实验 ID。
- 实验目的。
- 修改的组件。
- 实验参数。
- 评估集版本。
- 实验结果。
- 实验结论。
- 是否值得上线。

### 12.5 Chunk Size 消融实验

示例配置：

| 实验 | Chunk Size | Overlap |
| ---- | ---------: | ------: |
| A    |        300 |      50 |
| B    |        500 |      50 |
| C    |        800 |      50 |

其他条件保持一致。

观察：

- Recall@10。
- Precision@10。
- MRR。
- NDCG@10。
- 回答质量。
- 上下文 Token 数量。

Chunk 太小可能导致上下文不完整。

Chunk 太大可能导致无关内容增加。

Chunk Size 和 Overlap 最好分开实验。

### 12.6 BM25 和 Vector Search 消融实验

设计四组：

| 实验 | 检索方式                   |
| ---- | -------------------------- |
| A    | BM25                       |
| B    | Vector Search              |
| C    | BM25 + Vector Search       |
| D    | BM25 + Vector Search + RRF |

使用同一评估集比较。

重点关注：

- 精确型号问题。
- 错误码问题。
- 订单编号问题。
- 口语化问题。
- 语义相似问题。

BM25 擅长关键词匹配。

Vector Search 擅长语义匹配。

Hybrid Search 是否更好，需要通过真实问题验证。

### 12.7 RRF 消融实验

比较：

| 实验 | 融合方式              |
| ---- | --------------------- |
| A    | BM25                  |
| B    | Vector                |
| C    | Weighted Score Fusion |
| D    | RRF                   |

观察：

- Recall@10。
- MRR。
- NDCG@10。
- 延迟。
- 参数调优成本。

RRF 使用排名融合，避免直接比较两路原始分数。

但不保证在所有数据集上都优于 Score Fusion。

### 12.8 Reranker 消融实验

设计：

| 实验 | 流程                          |
| ---- | ----------------------------- |
| A    | Hybrid → LLM                  |
| B    | Hybrid → RRF → Reranker → LLM |

比较：

- Recall@10。
- MRR。
- NDCG@10。
- Answer Correctness。
- Faithfulness。
- 延迟。
- 成本。

Reranker 不能找回初始召回阶段没有找到的文档。

如果收益有限，可以考虑：

- 减少候选数量。
- 使用更轻量模型。
- 只对困难问题启用。
- 针对特定业务类别启用。

### 12.9 Query Rewrite 和 Multi-Query 消融实验

建议：

| 实验 | Query 策略            |
| ---- | --------------------- |
| A    | 原始 Query            |
| B    | Query Rewrite         |
| C    | Multi-Query           |
| D    | Rewrite + Multi-Query |

比较：

- Recall@K。
- Precision@K。
- MRR。
- NDCG@K。
- 查询耗时。
- Token 成本。

Query 优化不能替代实时业务数据查询。

订单状态、物流信息和退款记录应该通过业务 API 或数据库查询。

### 12.10 组件组合实验

在单因素实验之后，可以进一步研究组件之间的相互影响。

例如：

| 实验 | Query Rewrite | Reranker |
| ---- | ------------- | -------- |
| A    | 关            | 关       |
| B    | 开            | 关       |
| C    | 关            | 开       |
| D    | 开            | 开       |

观察单独使用和组合使用的效果。

组件很多时，不必一开始就测试所有组合。

先通过单因素实验筛选有价值的组件。

### 12.11 参数调优实验

常见参数：

| 参数              | 影响                |
| ----------------- | ------------------- |
| Chunk Size        | Chunk 内容范围      |
| Chunk Overlap     | 相邻 Chunk 重叠内容 |
| BM25 Top K        | 关键词召回数量      |
| Vector Top K      | 向量召回数量        |
| RRF rank_constant | 排名融合权重分布    |
| Reranker Top K    | 重排序候选数量      |
| Final Top K       | 最终上下文数量      |

需要区分：

- Retrieval Top K：初始召回数量。
- Reranker Top K：重排序候选数量。
- Context Top K：最终送给 LLM 的数量。

### 12.12 根据指标定位问题

| 现象                    | 可能原因             | 优化方向                      |
| ----------------------- | -------------------- | ----------------------------- |
| Recall 低               | 相关文档没有找回来   | 切片、Embedding、Query、Top K |
| Recall 高，Precision 低 | 无关文档过多         | Reranker、过滤                |
| Recall 高，MRR 低       | 正确文档排名靠后     | RRF、Reranker                 |
| 检索好，回答差          | 生成阶段出问题       | Context Builder、Prompt       |
| Faithfulness 低         | 回答缺少证据支持     | 上下文组织、生成约束          |
| 延迟过高                | 组件过多或串行执行   | 并行、缓存、模型优化          |
| 成本过高                | Token 或模型调用过多 | 减少 Query 和候选数量         |
| 特定类别效果差          | 数据或策略不适合     | 分类分析、定向优化            |

### 12.13 Error Analysis：错误样本分析

每条失败样本建议保存：

```json
{
  "sample_id": "sample_001",
  "question": "X200 型号的保修期限是多少？",
  "failure_type": "retrieval_failure",
  "expected_chunk_ids": [
    "chunk_warranty_001"
  ],
  "retrieved_chunk_ids": [
    "chunk_warranty_008",
    "chunk_refund_002"
  ],
  "possible_reason": "产品型号关键词没有被正确召回",
  "suggested_action": "检查 BM25 分词和型号字段"
}
```

常见失败分类：

1. Parsing Failure：文档解析失败。
2. Chunking Failure：切片不合理。
3. Retrieval Failure：检索没有找到正确内容。
4. Ranking Failure：正确内容排名靠后。
5. Context Failure：上下文组织不合理。
6. Generation Failure：LLM 回答错误。
7. Permission Failure：权限过滤异常。
8. Tool Failure：业务工具调用失败。

不要只写模型效果不好，要尽可能定位到具体组件。

### 12.14 生产环境中的分层 RAG

不是所有问题都需要运行最复杂的 RAG 流程。

| 问题类型       | 推荐流程                                      |
| -------------- | --------------------------------------------- |
| 简单语义问题   | Vector Search → LLM                           |
| 精确关键词问题 | BM25 → LLM                                    |
| 复杂知识问题   | Query Rewrite → Hybrid → RRF → Reranker → LLM |
| 实时订单问题   | 订单 API → LLM                                |
| 高风险问题     | 权限校验 → RAG/API → 审批或升级               |

组件应该按需使用。

路由策略本身也需要纳入评估。

### 12.15 RAG 优化闭环

推荐流程：

```text
建立评估集
    |
    v
运行当前基线
    |
    v
分析失败样本
    |
    v
提出优化假设
    |
    v
设计消融实验
    |
    v
运行实验
    |
    v
比较质量、延迟和成本
    |
    v
选择最佳方案
    |
    v
灰度上线
    |
    v
收集线上反馈
    |
    v
更新评估集
    |
    +------> 继续优化
```

