/**
 * TouchButton 使用示例
 * 
 * 此文件展示了 TouchButton 组件的各种用法
 */

import { TouchButton } from "./TouchButton";

export function TouchButtonExamples() {
  return (
    <div className="space-y-8 p-8">
      {/* 变体示例 */}
      <section>
        <h2 className="mb-4 text-xl font-bold text-white">变体 (Variants)</h2>
        <div className="flex flex-wrap gap-4">
          <TouchButton variant="primary" onClick={() => alert("Primary clicked")}>
            Primary Button
          </TouchButton>
          <TouchButton variant="secondary" onClick={() => alert("Secondary clicked")}>
            Secondary Button
          </TouchButton>
          <TouchButton variant="ghost" onClick={() => alert("Ghost clicked")}>
            Ghost Button
          </TouchButton>
        </div>
      </section>

      {/* 尺寸示例 */}
      <section>
        <h2 className="mb-4 text-xl font-bold text-white">尺寸 (Sizes)</h2>
        <div className="flex flex-wrap items-center gap-4">
          <TouchButton size="sm" onClick={() => alert("Small clicked")}>
            Small
          </TouchButton>
          <TouchButton size="md" onClick={() => alert("Medium clicked")}>
            Medium
          </TouchButton>
          <TouchButton size="lg" onClick={() => alert("Large clicked")}>
            Large
          </TouchButton>
        </div>
      </section>

      {/* 禁用状态示例 */}
      <section>
        <h2 className="mb-4 text-xl font-bold text-white">禁用状态 (Disabled)</h2>
        <div className="flex flex-wrap gap-4">
          <TouchButton disabled variant="primary">
            Disabled Primary
          </TouchButton>
          <TouchButton disabled variant="secondary">
            Disabled Secondary
          </TouchButton>
        </div>
      </section>

      {/* 防抖示例 */}
      <section>
        <h2 className="mb-4 text-xl font-bold text-white">防抖测试 (Debounce Test)</h2>
        <p className="mb-4 text-sm text-white/70">
          快速连续点击此按钮，只有第一次点击会触发（300ms 防抖）
        </p>
        <TouchButton
          onClick={() => {
            console.log("Button clicked at:", new Date().toISOString());
            alert("点击成功！尝试快速连续点击，只有第一次会触发。");
          }}
        >
          测试防抖
        </TouchButton>
      </section>

      {/* 自定义样式示例 */}
      <section>
        <h2 className="mb-4 text-xl font-bold text-white">自定义样式 (Custom Styles)</h2>
        <TouchButton
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          onClick={() => alert("Custom styled button")}
        >
          渐变按钮
        </TouchButton>
      </section>

      {/* 移动端触摸目标示例 */}
      <section>
        <h2 className="mb-4 text-xl font-bold text-white">
          移动端触摸目标 (Touch Target)
        </h2>
        <p className="mb-4 text-sm text-white/70">
          所有按钮都保证最小 44x44px 触摸目标，符合移动端可用性标准
        </p>
        <div className="flex flex-wrap gap-4">
          <TouchButton size="sm">✓</TouchButton>
          <TouchButton size="md">✓</TouchButton>
          <TouchButton size="lg">✓</TouchButton>
        </div>
      </section>
    </div>
  );
}
