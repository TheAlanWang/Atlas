---
title: "RAG 评估体系"
topic: rag
section: Evaluation and Failure Modes
order: 1
duration: 18
date: 2026-03-25
---

## 本章内容

- 这一章的核心概念是什么
- 它在真实系统里的关键权衡是什么
- 面试里怎样把这个主题讲得更稳

---


## 为什么评估很重要

一个 RAG 系统在 demo 里看起来不错，不代表它在真实环境里就工作正常。

常见的问题包括：

- 检索返回了不相关的 chunk
- 回答虽然看起来有依据，但其实没有真正回答问题
- 模型明明拿到了上下文，还是产生了幻觉

如果没有评估，你根本不知道到底是哪一层出了问题。

## 三个核心指标

RAG 评估通常围绕三个问题展开：

| 指标 | 它在检查什么 |
|---|---|
| Context Relevance | 检索到的 chunk 有没有用？ |
| Faithfulness | 回答是不是被这些 chunk 支撑？ |
| Answer Relevance | 回答是不是真的回答了用户问题？ |

这三个指标的价值，在于它们能把不同失败模式拆开，而不是只给你一个模糊的“整体质量分”。

## 测试集质量比花哨指标更重要

评估质量的上限，首先受测试集质量限制。

如果你的测试集太窄、太简单，或者已经过时，那么指标分数看起来再漂亮，也不代表系统在真实环境里可靠。

一个更有用的 RAG 测试集通常应该包含：

- 高频真实问题
- 难例和边界例
- 含糊查询
- 系统应该拒答或走兜底逻辑的情况

在面试里，这个点往往比单纯报工具名更重要。

## 怎么正确理解这些指标

### Context Relevance

如果 context relevance 很低，说明 retrieval 很弱，模型吃进去的是噪音或缺失证据。

常见原因：

- chunking 不合理
- embedding 模型太弱
- `top_k` 设置不对
- 缺少过滤条件

### Faithfulness

如果 faithfulness 很低，说明回答并没有被检索到的上下文充分支撑。

常见原因：

- 模型忽略了证据
- prompt 没有明确要求基于证据回答
- 检索到的证据不完整，逼着模型自己补空白

### Answer Relevance

如果 answer relevance 很低，说明回答并没有真正解决用户的问题，即使它可能是有依据的。

常见原因：

- prompt 太模糊
- 上下文不完整
- 模型过于保守，给了有依据但不解决问题的回答

## 用 RAGAS 做评估

[RAGAS](https://docs.ragas.io) 是常见的开源 RAG 评估工具之一。

```bash
pip install ragas
```

它通常会比较下面几类输入：

- 问题
- 检索到的 contexts
- 模型生成的回答
- ground truth

```python
from ragas import evaluate
# 不同版本的 RAGAS，metric 名称和 import path 可能不同。
# 关键不是死记某个版本的 API，而是固定数据集和指标集合去做比较。

results = evaluate(
    dataset=eval_dataset,
    metrics=[
        faithfulness_metric,
        response_relevance_metric,
        context_relevance_metric,
    ],
)
```

工具本身不是重点，重点是你要对同一批代表性问题反复评估，才能看清系统是否真的变好了。

RAGAS 的具体 API 会随版本变化，所以面试里更稳的表达是讲清楚评估流程，而不是死背某个版本的 import 写法。

## 指标和 Judge 也有局限

自动指标和 LLM-as-judge 评估很有用，但它们并不完美。

它们可能会误判：

- 部分正确的回答
- 多种都合理的表达
- 带领域细节的答案

所以更稳的做法是：

- 用自动评估做规模化回归检查
- 用人工 review 处理含糊或高风险场景

## 离线评估和在线评估

成熟团队一般都会同时做两种：

- 离线评估：固定测试集，可复现，用来做回归检查和调试
- 在线评估：用户反馈、点击行为、工单升级、生产指标

离线评估告诉你：这次改动在受控环境里有没有提升。
在线评估告诉你：真实用户到底有没有受益。

两者都需要。

## 一个实用的排查顺序

当分数变差时，不要同时调所有东西。

更合理的顺序是：

1. 先看 context relevance
2. 再看 faithfulness
3. 最后看 answer relevance

原因很简单：检索问题会一路传导到后面。

如果 context relevance 已经很差，那你单改 generation prompt 往往只是治标不治本。

## 关键问题

> _Q: 你会怎么评估一个 RAG 系统？_

比较标准的做法是把 retrieval 和 generation 分开看，但又放在一条链路里评估。我会重点看 context relevance 来衡量检索质量，看 faithfulness 来衡量依据性，看 answer relevance 来衡量回答是否真正解决问题。然后在一组代表性的离线测试集上做前后对比，再结合线上真实用户信号验证。

> _Q: Faithfulness 和 Answer Relevance 有什么区别？_

Faithfulness 关注回答有没有被检索证据支撑，用来发现幻觉。Answer Relevance 关注回答是否真的回答了用户的问题，用来发现“有依据但没答到点上”的情况。一个回答可以 faithful，但依然不够 relevant。

> _Q: 如果一个 RAG 系统表现很差，你先查哪里？_

我会先查 retrieval，尤其是 context relevance。因为一旦检索到的 chunk 本身就不对，后面的 generation 指标通常都会跟着变差。先修 prompt 而不先修 retrieval，往往只是修表面现象。

> _Q: 只靠自动化 RAG 评估指标够吗？_

不够。自动化指标适合做回归测试和大规模比较，但它们会有噪声，也可能看不懂领域细节。更稳的团队通常会把自动评估和人工 review 结合起来，尤其是在含糊问题或高风险场景里。
