# useAgentCall Hook 使用指南

## 概述

`useAgentCall` 是一个用于智能体 API 调用的自定义 Hook，自动处理积分不足（402）错误，并提供统一的错误处理机制。

## 基本用法

```typescript
import { useAgentCall } from '@/hooks/useAgentCall';
import { useCredits } from '@/contexts/CreditsContext';

function MyAgentComponent() {
  const { showInsufficientCreditsModal } = useCredits();
  const { callAgent, isLoading, error } = useAgentCall({
    onInsufficientCredits: (error) => {
      // 显示积分不足模态框
      showInsufficientCreditsModal(error.required, 0);
    },
  });

  async function handleSubmit() {
    const data = await callAgent('/api/agents/my-agent/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'Hello' }),
    });

    if (data) {
      // 处理成功响应
      console.log(data);
    }
  }

  return (
    <div>
      <button onClick={handleSubmit} disabled={isLoading}>
        {isLoading ? '处理中...' : '提交'}
      </button>
      {error && <div className="error">{error}</div>}
    </div>
  );
}
```

## 高级用法 - 获取当前积分余额

```typescript
import { useAgentCall } from "@/hooks/useAgentCall";
import { useCredits } from "@/contexts/CreditsContext";
import { useState, useEffect } from "react";

function MyAgentComponent() {
  const { showInsufficientCreditsModal } = useCredits();
  const [currentBalance, setCurrentBalance] = useState(0);

  const { callAgent, isLoading, error } = useAgentCall({
    onInsufficientCredits: (error) => {
      // 使用实际的当前余额
      showInsufficientCreditsModal(error.required, currentBalance);
    },
  });

  // 获取当前积分余额
  useEffect(() => {
    async function fetchBalance() {
      const response = await fetch("/api/credits/balance");
      const data = await response.json();
      setCurrentBalance(data.total || 0);
    }
    fetchBalance();
  }, []);

  // ... 其余代码
}
```

## 错误处理

Hook 自动处理以下错误：

1. **402 积分不足**：触发 `onInsufficientCredits` 回调
2. **其他 HTTP 错误**：触发 `onError` 回调
3. **网络错误**：触发 `onError` 回调

## API

### useAgentCall(options)

**参数：**

- `options.onInsufficientCredits?: (error) => void` - 积分不足时的回调
- `options.onError?: (error) => void` - 其他错误的回调

**返回值：**

- `callAgent: (url, init?) => Promise<any>` - API 调用函数
- `isLoading: boolean` - 加载状态
- `error: string | null` - 错误消息
- `setError: (error: string | null) => void` - 手动设置错误

## 迁移现有代码

### 之前：

```typescript
const [isLoading, setIsLoading] = useState(false);

async function handleSubmit() {
  setIsLoading(true);
  try {
    const response = await fetch("/api/agents/my-agent/run", {
      method: "POST",
      body: JSON.stringify({ prompt }),
    });
    const data = await response.json();
    // 处理响应
  } catch (error) {
    console.error(error);
  } finally {
    setIsLoading(false);
  }
}
```

### 之后：

```typescript
const { showInsufficientCreditsModal } = useCredits();
const { callAgent, isLoading } = useAgentCall({
  onInsufficientCredits: (error) => {
    showInsufficientCreditsModal(error.required, 0);
  },
});

async function handleSubmit() {
  const data = await callAgent("/api/agents/my-agent/run", {
    method: "POST",
    body: JSON.stringify({ prompt }),
  });

  if (data) {
    // 处理响应
  }
}
```

## 注意事项

1. 确保组件在 `CreditsProvider` 内部使用
2. 积分余额需要单独获取（通过 `/api/credits/balance`）
3. Hook 会自动管理加载状态和错误状态
4. 所有智能体 API 调用都应该使用这个 Hook
