# MCP Servers (Dev-Time Only)

## Overview

MCP (Model Context Protocol) servers are **local services** that extend Cursor's AI capabilities. They run on your development machine and are **never deployed to production**.

## Mental Model

```
┌─────────────────────────────────────────────────────────────┐
│                    YOUR DEV MACHINE                          │
│  ┌──────────┐    ┌──────────────────────────────────────┐   │
│  │  Cursor  │───▶│  MCP Servers (local processes)      │   │
│  │   IDE    │    │  - @color-theory                     │   │
│  │          │◀───│  - @design-heuristics                │   │
│  └──────────┘    └──────────────────────────────────────┘   │
│       │                                                      │
│       │ You write code informed by MCP knowledge            │
│       ▼                                                      │
│  ┌──────────┐                                               │
│  │ Codebase │  Skills, prompts, validation rules            │
│  └──────────┘                                               │
└─────────────────────────────────────────────────────────────┘
       │
       │ git push
       ▼
┌─────────────────────────────────────────────────────────────┐
│                   VERCEL (PRODUCTION)                       │
│  ┌──────────┐                                               │
│  │ Next.js  │  NO MCP. Just the code you wrote.             │
│  │   App    │  Skills are static strings in lib/skills/.    │
│  └──────────┘                                               │
└─────────────────────────────────────────────────────────────┘
```

## What MCP Solves (Dev-Time)

1. **Color Theory Validation**: WCAG contrast checker, harmony rules
2. **Design Heuristics**: Logo complexity analysis, visual weight rules
3. **Prompt Iteration**: Test prompts against models before hardcoding

## Rules

- ✅ MCP servers run locally via Cursor
- ✅ MCP knowledge gets "baked into" your prompts and validation code
- ❌ MCP is NEVER imported into `src/app` or `src/lib` runtime code
- ❌ MCP servers do NOT run in production (not serverless-compatible)

## Configuration

See `.cursor/mcp.json` for MCP server configuration.

