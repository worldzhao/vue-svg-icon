# v-icon-svg

> 渲染 SVG 图标字符串, 支持通过 CSS `font-size` 和 `color` 属性调整大小和颜色。

- [Demo](https://worldzhao.github.io/v-icon-svg/index.html)

## 快速开始

**安装**

```bash
pnpm add v-icon-svg
# or
npm i v-icon-svg
```

**引入**

```js
import { SVGIcon } from 'v-icon-svg';

// vue2
import { SVGIcon } from 'v-icon-svg/vue2';
```

## 方案概览

本包提供两种使用方式：

| 方案              | 特点                            | 适用场景                               |
| ----------------- | ------------------------------- | -------------------------------------- |
| **🚀 运行时方案** | 直接传入 SVG 字符串，运行时处理 | 动态图标、第三方 SVG、灵活性要求高     |
| **⚡ 构建时方案** | Webpack/Rspack 插件，构建时处理 | 静态图标资源、性能要求高、开发体验优先 |

---

## 🚀 运行时方案

在 Vue 模板中使用 `SVGIcon` 组件，通过 `icon` prop 传入 SVG 的 **原始内容字符串**。

### 基本用法

```html
<template>
  <div>
    <!-- 基本用法 -->
    <SVGIcon :icon="mySvgIconString" />

    <!-- 通过 CSS class 控制大小和颜色 -->
    <SVGIcon :icon="anotherIconString" class="custom-icon" />

    <!-- 通过内联样式控制 -->
    <SVGIcon :icon="thirdIconString" style="font-size: 24px; color: blue;" />
  </div>
</template>

<script setup>
  import { ref } from 'vue';

  import { SVGIcon } from 'v-icon-svg';

  // 引入 SVG 图标字符串（构建工具 ?raw 后缀）
  import IconXXX from './assets/icon-xxx.svg?raw';

  // 假设这些变量包含了你的 SVG 图标的完整字符串内容
  const mySvgIconString = ref('<svg viewBox="0 0 1024 1024">...</svg>');
  const anotherIconString = ref('<svg>...</svg>');
  const thirdIconString = ref('<svg>...</svg>');
</script>

<style>
  .custom-icon {
    font-size: 32px; /* 控制图标大小 */
    color: red; /* 控制图标颜色 */
  }
</style>
```

### 渲染模式

运行时方案支持两种渲染模式：

#### 1. Symbol + Use 模式（默认推荐）

```html
<!-- 默认模式，使用 <symbol> + <use> 渲染 -->
<SVGIcon :icon="iconString" />
```

**特点：**

- ✅ 性能优化：相同 SVG 会被缓存为 symbol，多次使用时只存储一份
- ✅ 内存占用小：重复图标共享同一个 symbol 定义
- ✅ 渲染效率高：浏览器原生支持，渲染性能好
- ❌ 某些场景可能有兼容性问题（见下文）

#### 2. Inline 模式

```html
<!-- 内联模式，直接渲染完整的 SVG 内容 -->
<SVGIcon :icon="iconString" :inline="true" />
```

**特点：**

- ✅ 完整的 SVG 控制：可以对 SVG 内部元素进行精确的样式控制
- ✅ 避免 `<use>` 元素的兼容性问题
- ✅ **解决特殊场景问题**：html2canvas、跨 iframe、某些导出工具等
- ❌ 内存占用较大：每次使用都渲染完整的 SVG 内容
- ❌ 性能相对较低：无法共享 symbol 定义

### 🎯 使用场景选择

| 场景                          | 推荐模式     | 原因                                           |
| ----------------------------- | ------------ | ---------------------------------------------- |
| **常规图标显示**              | Symbol + Use | 性能最优，内存占用小                           |
| **html2canvas 截图**          | **Inline**   | `<use>` 在 html2canvas 中可能无法正确渲染      |
| **跨 iframe 使用**            | **Inline**   | `<use>` 引用的 symbol 可能在 iframe 外无法访问 |
| **PDF 导出**                  | **Inline**   | 某些 PDF 生成工具对 `<use>` 支持不好           |
| **需要精确控制 SVG 内部样式** | **Inline**   | 可以直接操作 SVG DOM 元素                      |
| **图标库、大量重复图标**      | Symbol + Use | 充分利用缓存优势                               |

#### 🔧 html2canvas 场景示例

```html
<template>
  <div ref="captureArea">
    <!-- ❌ html2canvas 可能无法正确处理 -->
    <SVGIcon :icon="iconString" />

    <!-- ✅ html2canvas 可以正确处理 -->
    <SVGIcon :icon="iconString" :inline="true" />
  </div>
</template>

<script setup>
  import html2canvas from 'html2canvas';

  const captureScreenshot = async () => {
    const canvas = await html2canvas(captureArea.value);
    // 使用 inline 模式的图标会被正确渲染到 canvas 中
  };
</script>
```

### Props

| 属性        | 类型    | 默认值  | 说明                                                            |
| ----------- | ------- | ------- | --------------------------------------------------------------- |
| `icon`      | String  | -       | **必需**，包含 SVG 完整内容的字符串                             |
| `colorless` | Boolean | `true`  | 是否自动处理 SVG 的颜色属性（fill、stroke），使其继承父元素颜色 |
| `inline`    | Boolean | `false` | 是否使用内联模式渲染 SVG                                        |

### 核心特性

- **动态渲染**：直接将 SVG 字符串传递给 `icon` prop 进行渲染
- **CSS 控制**：
  - 图标大小默认继承并跟随父元素的 `font-size`（因为组件内部设置了 `width: 1em; height: 1em;`）
  - 图标颜色默认继承父元素的 `color`（因为组件内部设置了 `fill: currentColor;`）
- **颜色处理**：组件内部会自动处理 SVG 的 `fill` 和 `stroke` 属性，使其继承父元素的 `color` 属性
- **智能缓存**：Symbol 和 Inline 模式分别维护缓存，避免数据冲突

**重要约束：** 为了确保图标正确渲染，请不要使用包含 `<defs>` 或 `<clipPath>` 标签的 SVG 字符串。

---

## ⚡ 构建时方案（Webpack/Rspack 插件）

提供了一个 Webpack/Rspack(Rsbuild) 插件，可以直接将 SVG 文件作为 Vue 组件导入使用，无需手动处理 SVG 内容。

> 需要安装 vue 版本对应的 @vue/compiler-sfc 对应版本

### 在 webpack.config.js 中配置

```js
const { VueSvgIconPlugin } = require('v-icon-svg/plugin');

module.exports = {
  // ... 其他配置
  plugins: [
    // ... 其他插件
    new VueSvgIconPlugin({
      include: /src\/assets\/icons/, // 只处理特定目录的SVG
      rawQuery: 'raw',
      urlQuery: 'url',
      inlineQuery: 'inline',
    }),
  ],
};
```

```js
import ArrowIcon from './arrow.svg'; // Vue 组件
import arrowSvg from './arrow.svg?raw'; // 原始字符串
import arrowUrl from './arrow.svg?url'; // 文件 URL
import arrowInline from './arrow.svg?inline'; // Base64 内联
```

> 注意: 配置 include 后，其他 svg rule 规则将忽略该插件所配置的 include 的资源。

### 配置选项

| 选项        | 类型   | 默认值    | 说明                                                  |
| ----------- | ------ | --------- | ----------------------------------------------------- |
| test        | RegExp | /\\.svg$/ | 匹配要处理的文件                                      |
| include     | RegExp | null      | 仅包含匹配的目录                                      |
| exclude     | RegExp | null      | 排除匹配的目录                                        |
| rawQuery    | String | 'raw'     | 当资源包含此 query 参数时，返回原始 SVG 字符串        |
| urlQuery    | String | 'url'     | 当资源包含此 query 参数时，返回 SVG 文件 URL          |
| inlineQuery | String | 'inline'  | 当资源包含此 query 参数时，返回 base64 编码的内联内容 |

### 在 Vue 组件中使用

```html
<template>
  <div>
    <IconHome class="my-icon" />
    <IconMenu class="my-icon" />
  </div>
</template>

<script>
  // 直接导入SVG文件作为Vue组件
  import IconHome from '@/assets/icons/home.svg';
  import IconMenu from '@/assets/icons/menu.svg';

  export default {
    components: {
      IconMenu,
      IconHome,
    },
  };
</script>

<style>
  .my-icon {
    font-size: 24px;
    color: #333;
  }
</style>
```

### 构建时方案优势

1. **构建时处理**：所有 SVG 处理在构建时完成，不影响运行时性能
2. **按需加载**：每个 SVG 变成独立的 Vue 组件，支持代码分割
3. **缓存优化**：构建结果可以被缓存，提高开发效率
4. **简化使用**：直接导入 SVG 文件，更符合直觉的开发体验

---

## 📊 性能对比与最佳实践

### 方案选择指南

| 需求                     | 推荐方案                   | 理由                 |
| ------------------------ | -------------------------- | -------------------- |
| **静态图标资源**         | 构建时方案                 | 性能最优，开发体验好 |
| **第三方动态图标**       | 运行时 Symbol 模式         | 平衡性能和灵活性     |
| **html2canvas/PDF 导出** | **运行时 Inline 模式**     | 避免兼容性问题       |
| **图标库应用**           | 构建时方案 + 运行时 Symbol | 按需加载 + 缓存优化  |

### 性能基准

```javascript
// 相同图标重复使用 100 次的场景
// Symbol 模式：1 个 symbol 定义 + 100 个 use 引用
// Inline 模式：100 个完整的 SVG 元素
// 构建时方案：编译时优化，运行时开销最小
```

### 最佳实践

1. **优先使用构建时方案**处理静态图标资源
2. **运行时方案作为补充**，处理动态或第三方图标
3. **根据具体场景选择渲染模式**：
   - 常规场景：Symbol + Use
   - 特殊兼容性需求：Inline
4. **合理设置 colorless 属性**，确保颜色继承符合预期

---

## 🛠️ 兼容性

- **Vue**: 2.7+ / 3.0+
- **构建工具**: Webpack 5/ Rspack 1
- **浏览器**: 现代浏览器（支持 SVG `<symbol>` 和 `<use>` 元素）

---

## 📦 构建产物

- 支持 Tree Shaking
- 提供 ESM/CJS 两种格式

```bash
dist/
  ├── esm/            # ES Module 格式
  ├── lib/            # CommonJS 格式
```
