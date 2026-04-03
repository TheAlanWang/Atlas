---
title: "MongoDB: Core Concepts"
topic: mongodb
section: Fundamentals
order: 1
duration: 15
date: 2026-03-26
---

## What is MongoDB?

**MongoDB** is a document-oriented NoSQL database that stores data as flexible JSON-like documents (called BSON internally). Instead of tables and rows, MongoDB uses **collections** and **documents**.

Used by: Airbnb, Forbes, eBay, and applications with rapidly evolving or hierarchical data.

## Core Concepts

### Documents

A **document** is a JSON-like object — the basic unit of data in MongoDB.

```json
{
  "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
  "name": "Alan Wang",
  "email": "alan@example.com",
  "age": 25,
  "address": {
    "city": "San Francisco",
    "state": "CA"
  },
  "tags": ["student", "developer"]
}
```

Documents can have nested objects and arrays — no need to normalize data into multiple tables.

### Collections

A **collection** is a group of documents (analogous to a table in SQL). Unlike SQL tables, collections don't enforce a fixed schema — documents in the same collection can have different fields.

### `_id`

Every document has a unique `_id` field (auto-generated as an `ObjectId` if not provided). This is MongoDB's equivalent of a primary key.

## CRUD Operations

```javascript
// Insert
db.users.insertOne({ name: "Alan", email: "alan@example.com", age: 25 });
db.users.insertMany([{ name: "Bob" }, { name: "Carol" }]);

// Find
db.users.find({ age: { $gt: 20 } });           // age > 20
db.users.findOne({ email: "alan@example.com" }); // single document
db.users.find({ tags: "developer" });            // array contains

// Update
db.users.updateOne(
  { email: "alan@example.com" },
  { $set: { age: 26 }, $push: { tags: "engineer" } }
);

// Delete
db.users.deleteOne({ _id: ObjectId("64f1...") });
db.users.deleteMany({ age: { $lt: 18 } });
```

## Query Operators

```javascript
// Comparison
{ age: { $gt: 20, $lte: 30 } }   // 20 < age <= 30
{ status: { $in: ["active", "pending"] } }

// Logical
{ $and: [{ age: { $gt: 18 } }, { active: true }] }
{ $or:  [{ city: "SF" }, { city: "NYC" }] }

// Nested fields
{ "address.city": "San Francisco" }

// Array
{ tags: { $all: ["developer", "student"] } }  // contains all
{ tags: { $size: 2 } }                         // array length
```

## Embedding vs Referencing

The key design decision in MongoDB: should related data be **embedded** or **referenced**?

### Embedding (denormalization)
Store related data inside the same document.

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

**Use when:** Data is always accessed together, the nested array won't grow unboundedly.

### Referencing (normalization)
Store the related document's `_id` and look it up separately.

```json
// User document
{ "_id": "user1", "name": "Alan" }

// Order document
{ "_id": "o1", "user_id": "user1", "amount": 99.99 }
```

**Use when:** Related data is large, frequently updated independently, or shared across multiple documents.

## Indexes

```javascript
// Single field index
db.users.createIndex({ email: 1 });  // 1 = ascending, -1 = descending

// Compound index
db.users.createIndex({ city: 1, age: -1 });

// Text search index
db.articles.createIndex({ content: "text" });
db.articles.find({ $text: { $search: "mongodb tutorial" } });
```

## Aggregation Pipeline

MongoDB's aggregation pipeline processes documents through stages — similar to SQL's GROUP BY + HAVING + ORDER BY:

```javascript
db.orders.aggregate([
  { $match: { status: "completed" } },      // WHERE
  { $group: {
      _id: "$user_id",
      total: { $sum: "$amount" },
      count: { $count: {} }
  }},                                         // GROUP BY
  { $sort: { total: -1 } },                  // ORDER BY
  { $limit: 10 }                              // LIMIT
]);
```

## Key Questions

> _Q: What is the difference between a MongoDB collection and a SQL table?_

Both group related data, but a SQL table enforces a fixed schema — every row has the same columns. A MongoDB collection has no schema enforcement — documents can have different fields. This flexibility is useful for evolving data structures but requires the application to handle data consistency.

> _Q: When should you embed vs reference documents in MongoDB?_

Embed when data is always accessed together and the nested data won't grow without bound (e.g., a user's address). Reference when data is large, updated independently, or needs to be shared across multiple documents (e.g., orders referencing products). As a rule: embed for "contains" relationships, reference for "has many" relationships with unbounded growth.

> _Q: What is the MongoDB aggregation pipeline?_

The aggregation pipeline processes documents through a sequence of stages — each stage transforms the data. Common stages: `$match` (filter), `$group` (aggregate), `$sort`, `$limit`, `$project` (reshape), `$lookup` (join). It's MongoDB's equivalent of SQL's SELECT with GROUP BY, WHERE, and JOIN.

> _Q: How does MongoDB handle transactions?_

MongoDB supports multi-document ACID transactions since version 4.0. However, they are more expensive than single-document operations. MongoDB's document model is designed so that most operations can be completed in a single document (using embedding), making transactions less necessary than in SQL databases.
