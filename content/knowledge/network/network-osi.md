---
title: "OSI Model: The 7 Layers of Networking"
topic: network
section: Fundamentals
order: 1
duration: 15
date: 2026-03-26
---

## What is the OSI Model?

The **OSI (Open Systems Interconnection) model** is a conceptual framework that standardizes how different network systems communicate. It divides network communication into **7 layers**, each with a specific responsibility.

Think of it as an assembly line — data passes through each layer on the way out, and back up through each layer on the way in.

## The 7 Layers

| Layer | Name | Responsibility | Examples |
|-------|------|---------------|---------|
| 7 | **Application** | User-facing protocols, data format | HTTP, DNS, FTP, SMTP |
| 6 | **Presentation** | Encoding, encryption, compression | TLS/SSL, JPEG, JSON |
| 5 | **Session** | Open/close/manage sessions | NetBIOS, RPC |
| 4 | **Transport** | End-to-end delivery, reliability | TCP, UDP |
| 3 | **Network** | Routing between networks | IP, ICMP, BGP |
| 2 | **Data Link** | Node-to-node delivery, MAC addressing | Ethernet, Wi-Fi (802.11) |
| 1 | **Physical** | Raw bits over physical medium | Cables, fiber, radio waves |

## Memory Trick

Top-down: **All People Seem To Need Data Processing**
- Application, Presentation, Session, Transport, Network, Data Link, Physical

Bottom-up: **Please Do Not Throw Sausage Pizza Away**

## How Data Flows

When you send an HTTP request:
1. Your browser (Layer 7) creates the HTTP message
2. Each layer **adds a header** (encapsulation) going down
3. Data travels as bits over the wire (Layer 1)
4. The receiving side **strips headers** going back up (decapsulation)

## TCP/IP vs OSI

In practice, the **TCP/IP model** (4 layers) is what's actually used:

| TCP/IP | OSI Equivalent |
|--------|---------------|
| Application | Layers 5, 6, 7 |
| Transport | Layer 4 |
| Internet | Layer 3 |
| Network Access | Layers 1, 2 |

OSI is a **teaching model**. TCP/IP is the **real-world implementation**.

## Key Questions

> _Q: What are the 7 layers of OSI?_

Top-down: Application, Presentation, Session, Transport, Network, Data Link, Physical. Memory trick: **All People Seem To Need Data Processing**.

> _Q: Which layer does TCP operate on? What about UDP?_

Both are at Layer 4 (Transport). TCP provides reliable delivery (three-way handshake, retransmission), while UDP is faster but offers no delivery guarantees.

> _Q: Which layer is HTTP on? What about HTTPS?_

HTTP is at Layer 7 (Application). HTTPS = HTTP + TLS, where TLS technically operates at Layer 6 (Presentation), though answering "Application layer" is acceptable in interviews.

> _Q: What is the difference between OSI and TCP/IP?_

OSI is a theoretical reference model with 7 layers. TCP/IP is the real-world protocol stack with 4 layers, merging Session, Presentation, and Application into a single Application layer. Engineers use TCP/IP; OSI is used for teaching.
