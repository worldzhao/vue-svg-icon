# v-icon-svg

> Renders SVG icon strings in Vue, supporting size and color adjustments via CSS `font-size` and `color` properties.

- [Demo](https://worldzhao.github.io/v-icon-svg/index.html)

English | [简体中文](https://github.com/worldzhao/v-icon-svg/blob/main/README.zh-CN.md)

## Quick Start

**Installation**

```bash
pnpm add v-icon-svg
# or
npm i v-icon-svg
```

**Import**

```js
import { SVGIcon } from 'v-icon-svg';

// vue2
import { SVGIcon } from 'v-icon-svg/vue2';
```

## Solution Overview

This package offers two ways of usage:

| Solution                   | Features                                       | Applicable Scenarios                                                                                                    |
| -------------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **🚀 Runtime Solution**    | Pass SVG string directly, processed at runtime | Dynamic icons, third-party SVGs, high flexibility needs                                                                 |
| **⚡ Build-time Solution** | Webpack/Rspack plugin, processed at build time | Static icon resources, high performance needs, development experience priority, **currently Vue2 with vue-loader only** |

---

## 🚀 Runtime Solution

Use the `SVGIcon` component in your Vue template and pass the **raw SVG string content** via the `icon` prop.

### Basic Usage

```html
<template>
  <div>
    <!-- Basic usage -->
    <SVGIcon :icon="mySvgIconString" />

    <!-- Control size and color via CSS class -->
    <SVGIcon :icon="anotherIconString" class="custom-icon" />

    <!-- Control via inline styles -->
    <SVGIcon :icon="thirdIconString" style="font-size: 24px; color: blue;" />
  </div>
</template>

<script setup>
  import { ref } from 'vue';
  import { SVGIcon } from 'v-icon-svg';

  // Import SVG icon string (using build tool's ?raw suffix)
  import IconXXX from './assets/icon-xxx.svg?raw';

  // Assume these variables contain the full string content of your SVG icons
  const mySvgIconString = ref('<svg viewBox="0 0 1024 1024">...</svg>');
  const anotherIconString = ref('<svg>...</svg>');
  const thirdIconString = ref('<svg>...</svg>');
</script>

<style>
  .custom-icon {
    font-size: 32px; /* Control icon size */
    color: red; /* Control icon color */
  }
</style>
```

### Rendering Modes

The runtime solution supports two rendering modes:

#### 1. Symbol + Use Mode (Default Recommended)

```html
<!-- Default mode, renders using <symbol> + <use> -->
<SVGIcon :icon="iconString" />
```

**Features:**

- ✅ Performance Optimization: Identical SVGs are cached as symbols; only one copy is stored for multiple uses.
- ✅ Low Memory Footprint: Repeated icons share the same symbol definition.
- ✅ High Rendering Efficiency: Natively supported by browsers, good rendering performance.
- ❌ Potential compatibility issues in some scenarios (see below).

#### 2. Inline Mode

```html
<!-- Inline mode, directly renders the full SVG content -->
<SVGIcon :icon="iconString" :inline="true" />
```

**Features:**

- ✅ Full SVG Control: Allows precise styling of internal SVG elements.
- ✅ Avoids `<use>` element compatibility issues.
- ✅ **Solves Special Scenario Problems**: html2canvas, cross-iframe, some export tools, etc.
- ❌ Higher Memory Footprint: Renders the full SVG content for each use.
- ❌ Relatively Lower Performance: Cannot share symbol definitions.

### 🎯 Choosing a Use Case

| Scenario                                  | Recommended Mode | Reason                                                                    |
| ----------------------------------------- | ---------------- | ------------------------------------------------------------------------- |
| **Regular Icon Display**                  | Symbol + Use     | Optimal performance, low memory footprint.                                |
| **html2canvas Screenshot**                | **Inline**       | `<use>` might not render correctly in html2canvas.                        |
| **Cross-iframe Usage**                    | **Inline**       | Symbols referenced by `<use>` might not be accessible outside the iframe. |
| **PDF Export**                            | **Inline**       | Some PDF generation tools have poor support for `<use>`.                  |
| **Need for Precise SVG Internal Styling** | **Inline**       | Allows direct manipulation of SVG DOM elements.                           |
| **Icon Libraries, Many Repeated Icons**   | Symbol + Use     | Fully utilizes caching benefits.                                          |

#### 🔧 html2canvas Scenario Example

```html
<template>
  <div ref="captureArea">
    <!-- ❌ html2canvas might not process this correctly -->
    <SVGIcon :icon="iconString" />

    <!-- ✅ html2canvas can process this correctly -->
    <SVGIcon :icon="iconString" :inline="true" />
  </div>
</template>

<script setup>
  import html2canvas from 'html2canvas';

  const captureScreenshot = async () => {
    const canvas = await html2canvas(captureArea.value);
    // Icons in inline mode will be correctly rendered to the canvas.
  };
</script>
```

### Props

| Property    | Type    | Default | Description                                                                                   |
| ----------- | ------- | ------- | --------------------------------------------------------------------------------------------- |
| `icon`      | String  | -       | **Required**, string containing the full SVG content.                                         |
| `colorless` | Boolean | `true`  | Whether to automatically process SVG color attributes (fill, stroke) to inherit parent color. |
| `inline`    | Boolean | `false` | Whether to use inline mode to render the SVG.                                                 |

### Core Features

- **Dynamic Rendering**: Directly pass the SVG string to the `icon` prop for rendering.
- **CSS Control**:
  - Icon size defaults to inherit and follow the parent element's `font-size` (because the component internally sets `width: 1em; height: 1em;`).
  - Icon color defaults to inherit the parent element's `color` (because the component internally sets `fill: currentColor;`).
- **Color Handling**: The component automatically processes SVG's `fill` and `stroke` attributes to inherit the parent element's `color` property.
- **Smart Caching**: Symbol and Inline modes maintain separate caches to avoid data conflicts.

**Important Constraint:** To ensure icons render correctly, do not use SVG strings containing `<defs>` or `<clipPath>` tags.

---

## ⚡ Build-time Solution (Webpack/Rspack Plugin)

Provides a Webpack/Rspack(Rsbuild) plugin that allows direct import of SVG files as Vue components, eliminating the need to manually handle SVG content.

> Note: Depends on vue-loader's resource handling capabilities. Ensure vue-loader is correctly configured.
> [unplugin-vue](https://github.com/unplugin/unplugin-vue) is not yet supported.

### Configure in webpack.config.js

```js
const SvgIconPlugin = require('v-icon-svg/plugin');

module.exports = {
  // ... other configurations
  plugins: [
    // ... other plugins
    new SvgIconPlugin({
      include: /src\/assets\/icons/, // Only process SVGs in this specific directory
    }),
  ],
};
```

> Note: After configuring `include`, other SVG rule configurations will ignore resources matched by this plugin's `include`.

### Configuration Options

| Option  | Type   | Default  | Description                        |
| ------- | ------ | -------- | ---------------------------------- |
| test    | RegExp | /\.svg$/ | Matches files to be processed.     |
| include | RegExp | null     | Only include matching directories. |
| exclude | RegExp | null     | Exclude matching directories.      |

### Usage in Vue Components

```html
<template>
  <div>
    <IconHome class="my-icon" />
    <IconMenu class="my-icon" />
  </div>
</template>

<script>
  // Directly import SVG files as Vue components
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

### Advantages of Build-time Solution

1. **Build-time Processing**: All SVG processing is done at build time, not affecting runtime performance.
2. **On-demand Loading**: Each SVG becomes an independent Vue component, supporting code splitting.
3. **Cache Optimization**: Build results can be cached, improving development efficiency.
4. **Simplified Usage**: Directly import SVG files for a more intuitive development experience.

---

## 📊 Performance Comparison & Best Practices

### Solution Selection Guide

| Requirement                   | Recommended Solution        | Reason                                            |
| ----------------------------- | --------------------------- | ------------------------------------------------- |
| **Static Icon Resources**     | Build-time Solution         | Optimal performance, good development experience. |
| **Third-party Dynamic Icons** | Runtime Symbol Mode         | Balances performance and flexibility.             |
| **html2canvas/PDF Export**    | **Runtime Inline Mode**     | Avoids compatibility issues.                      |
| **Icon Library Applications** | Build-time + Runtime Symbol | On-demand loading + cache optimization.           |

### Performance Benchmark

```javascript
// Scenario: Using the same icon repeatedly 100 times
// Symbol Mode: 1 symbol definition + 100 use references
// Inline Mode: 100 full SVG elements
// Build-time Solution: Compile-time optimization, minimal runtime overhead
```

### Best Practices

1. **Prioritize the build-time solution** for static icon resources.
2. **Use the runtime solution as a supplement** for dynamic or third-party icons.
3. **Choose rendering mode based on specific scenarios**:
   - Regular scenarios: Symbol + Use
   - Special compatibility needs: Inline
4. **Set the `colorless` prop appropriately** to ensure color inheritance meets expectations.

---

## 🛠️ Compatibility

- **Vue**: 2.7+ / 3.0+
- **Build Tools**: Webpack / Rspack 1+ with Vue2 with vue-loader only
- **Browsers**: Modern browsers (supporting SVG `<symbol>` and `<use>` elements)

---

## 📦 Build Output

- Supports Tree Shaking
- Provides ESM/CJS formats

```bash
dist/
  ├── esm/            # ES Module format
  ├── lib/            # CommonJS format
```
