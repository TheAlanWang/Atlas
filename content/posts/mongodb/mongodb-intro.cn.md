---
title: "MongoDB：核心概念"
topic: mongodb
section: Fundamentals
order: 1
duration: 15
date: 2026-03-26
---

## 什么是 MongoDB？

**MongoDB** 是一个面向文档的 NoSQL 数据库，以灵活的 JSON 格式（内部称为 BSON）存储数据。MongoDB 用**集合（collection）**和**文档（document）**代替了表和行。

使用者包括：Airbnb、Forbes、eBay，以及数据结构快速演化或层次化的应用。

## 核心概念

### 文档（Document）

**文档**是类 JSON 的对象，是 MongoDB 中数据的基本单位。

```json
{
  "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
  "name": "Alan Wang",
  "email": "alan@example.com",
  "age": 25,
  "address": {
    "city": "旧金山",
    "state": "CA"
  },
  "tags": ["学生", "开发者"]
}
```

文档可以包含嵌套对象和数组——不需要像 SQL 那样将数据拆分到多张表。

### 集合（Collection）

**集合**是一组文档（类比 SQL 中的表）。与 SQL 表不同，集合不强制固定 Schema——同一集合中的文档可以有不同的字段。

### `_id`

每个文档都有唯一的 `_id` 字段（如果不提供，自动生成 `ObjectId`）。这是 MongoDB 中主键的等价物。

## CRUD 操作

```javascript
// 插入
db.users.insertOne({ name: "Alan", email: "alan@example.com", age: 25 });
db.users.insertMany([{ name: "Bob" }, { name: "Carol" }]);

// 查询
db.users.find({ age: { $gt: 20 } });            // age > 20
db.users.findOne({ email: "alan@example.com" }); // 单个文档
db.users.find({ tags: "开发者" });               // 数组包含

// 更新
db.users.updateOne(
  { email: "alan@example.com" },
  { $set: { age: 26 }, $push: { tags: "工程师" } }
);

// 删除
db.users.deleteOne({ _id: ObjectId("64f1...") });
db.users.deleteMany({ age: { $lt: 18 } });
```

## 查询操作符

```javascript
// 比较
{ age: { $gt: 20, $lte: 30 } }   // 20 < age <= 30
{ status: { $in: ["active", "pending"] } }

// 逻辑
{ $and: [{ age: { $gt: 18 } }, { active: true }] }
{ $or:  [{ city: "上海" }, { city: "北京" }] }

// 嵌套字段
{ "address.city": "旧金山" }

// 数组
{ tags: { $all: ["开发者", "学生"] } }  // 同时包含所有值
{ tags: { $size: 2 } }                   // 数组长度
```

## 嵌入 vs 引用

MongoDB 数据建模的核心决策：关联数据应该**嵌入**还是**引用**？

### 嵌入（反范式）
将关联数据存储在同一文档内。

```json
{
  "_id": "user1",
  "name": "Alan",
  "orders": [
    { "id": "o1", "amount": 99.99, "date": "2026-01-01" },
    { "id": "o2", "amount": 49.99, "date": "2026-02-01" }
  ]
}
```

**适合：** 数据总是一起访问，嵌套数组不会无限增长。

### 引用（范式）
只存储关联文档的 `_id`，需要时单独查询。

```json
// 用户文档
{ "_id": "user1", "name": "Alan" }

// 订单文档
{ "_id": "o1", "user_id": "user1", "amount": 99.99 }
```

**适合：** 关联数据量大、需要独立更新，或被多个文档共享。

## 索引

```javascript
// 单字段索引
db.users.createIndex({ email: 1 });  // 1 = 升序，-1 = 降序

// 复合索引
db.users.createIndex({ city: 1, age: -1 });

// 全文搜索索引
db.articles.createIndex({ content: "text" });
db.articles.find({ $text: { $search: "mongodb 教程" } });
```

## 聚合管道

MongoDB 的聚合管道将文档逐阶段处理——类似 SQL 的 GROUP BY + HAVING + ORDER BY：

```javascript
db.orders.aggregate([
  { $match: { status: "completed" } },       // WHERE
  { $group: {
      _id: "$user_id",
      total: { $sum: "$amount" },
      count: { $count: {} }
  }},                                          // GROUP BY
  { $sort: { total: -1 } },                   // ORDER BY
  { $limit: 10 }                               // LIMIT
]);
```

## 面试常问

> _Q: MongoDB 集合和 SQL 表有什么区别？_

两者都用来组织相关数据，但 SQL 表强制固定 Schema——每行有相同的列。MongoDB 集合没有 Schema 约束——文档可以有不同的字段。这种灵活性适合不断演化的数据结构，但需要应用层自行保证数据一致性。

> _Q: 什么时候嵌入，什么时候引用？_

如果数据总是一起访问且嵌套数据不会无限增长（如用户地址），选嵌入。如果数据量大、需要独立更新，或需要被多个文档共享（如订单引用商品），选引用。经验法则："包含"关系用嵌入，"一对多且无限增长"的关系用引用。

> _Q: 什么是 MongoDB 的聚合管道？_

聚合管道将文档通过一系列阶段依次处理，每个阶段对数据进行转换。常用阶段：`$match`（过滤）、`$group`（聚合）、`$sort`、`$limit`、`$project`（重塑）、`$lookup`（关联）。它是 MongoDB 版的 SQL SELECT + GROUP BY + WHERE + JOIN。

> _Q: MongoDB 如何处理事务？_

MongoDB 从 4.0 版本开始支持多文档 ACID 事务。但事务比单文档操作开销更大。MongoDB 的文档模型设计使大多数操作可以在单个文档内完成（通过嵌入），因此对事务的需求比 SQL 数据库少得多。
