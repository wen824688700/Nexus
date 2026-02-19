# WelcomeModal 欢迎弹窗组件

## 功能说明

用户登录后自动显示的产品说明弹窗，介绍 Apex 的核心理念和内测状态。

## 特性

- ✅ 每次登录自动显示（除非用户勾选"不再显示"）
- ✅ 赛博朋克风格设计（扫描线动画、终端风格）
- ✅ 使用 localStorage 存储用户偏好
- ✅ 响应式设计，支持移动端
- ✅ 点击背景或按钮关闭

## 使用方式

组件已集成到 `AuthProvider` 中，无需手动调用。

### 自动触发时机

1. 用户首次访问页面且已登录
2. 用户在当前会话中登录成功

### 用户偏好存储

- localStorage key: `apex_welcome_dismissed`
- 值为 `"true"` 时不再显示弹窗
- 用户可以清除浏览器数据重置此设置

## 测试方法

### 测试显示功能

1. 清除 localStorage：
   ```javascript
   localStorage.removeItem('apex_welcome_dismissed');
   ```

2. 刷新页面（如果已登录）或重新登录

3. 应该在 1 秒后看到欢迎弹窗

### 测试"不再显示"功能

1. 勾选"不再显示此消息"复选框
2. 点击"我已了解，接入系统"按钮
3. 刷新页面或重新登录
4. 弹窗不应再显示

### 重置测试

在浏览器控制台执行：
```javascript
localStorage.removeItem('apex_welcome_dismissed');
```

## 设计元素

- 顶部紫色-青色渐变装饰条
- 扫描线动画效果（3秒循环）
- 终端风格图标和文字
- 赛博朋克配色（紫色/粉色/青色）
- 玻璃态背景（backdrop-blur）
- 按钮悬停光效动画

## 文件位置

- 组件：`web/src/components/auth/WelcomeModal.tsx`
- 集成：`web/src/components/auth/AuthProvider.tsx`
- 导出：`web/src/components/auth/index.ts`
