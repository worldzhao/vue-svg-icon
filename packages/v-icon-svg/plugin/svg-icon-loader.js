/**
 * svg-icon-loader.js
 * 用于处理SVG文件并转换为Vue组件
 */
const { JSDOM } = require('jsdom');
const { optimize } = require('svgo');

/**
 * 递归处理SVG元素的属性
 * @param {Element} element - 要处理的SVG元素
 * @param {Boolean} colorless - 是否应用currentColor和不透明样式
 */
function setSvgAttributes(element, colorless = true) {
  // 如果是 mask 元素，不做任何处理
  if (element.tagName && element.tagName.toLowerCase() === 'mask') {
    return;
  }

  if (colorless) {
    // 设置 fill 属性
    if (element.hasAttribute('fill')) {
      const fillValue = element.getAttribute('fill');
      if (fillValue !== 'none') {
        element.setAttribute('fill', 'currentColor');
      }
    }

    // 设置 fill-opacity 属性
    if (element.hasAttribute('fill-opacity')) {
      element.setAttribute('fill-opacity', '1');
    }

    // 设置 stroke 属性
    if (element.hasAttribute('stroke')) {
      const strokeValue = element.getAttribute('stroke');
      if (strokeValue !== 'none') {
        element.setAttribute('stroke', 'currentColor');
      }
    }

    // 设置 stroke-opacity 属性
    if (element.hasAttribute('stroke-opacity')) {
      element.setAttribute('stroke-opacity', '1');
    }
  }

  // 递归处理所有子元素
  Array.from(element.children).forEach((child) =>
    setSvgAttributes(child, colorless)
  );
}

/**
 * 检测和获取 Vue 编译器
 */
function getVueCompiler() {
  const isDebugVue2 = process.env.DEBUG_VUE2 === 'true';
  try {
    // 尝试加载 @vue/compiler-sfc
    const compiler = require(isDebugVue2
      ? '@vue/compiler-sfc-v2'
      : '@vue/compiler-sfc');
    return compiler;
  } catch (error) {
    throw new Error(
      '@vue/compiler-sfc is required for svg-icon-loader. Please install it: npm install @vue/compiler-sfc'
    );
  }
}

/**
 * 简单的哈希函数
 */
function hash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // 转换为32位整数
  }
  return Math.abs(hash).toString(36);
}

/**
 * 编译 Vue 模板为 render 函数
 * @param {string} template - Vue 模板字符串
 * @param {string} filename - 文件名
 */
function compileVueTemplate(template, filename) {
  const compiler = getVueCompiler();

  try {
    // 使用 @vue/compiler-sfc 编译模板
    const { code } = compiler.compileTemplate({
      source: template,
      filename,
      id: hash(filename),
      scoped: false,
      slotted: false,
    });

    return code;
  } catch (error) {
    throw new Error(`Vue template compilation failed: ${error.message}`);
  }
}

/**
 * SVG图标加载器
 * @param {String} source - SVG文件内容
 * @returns {String} 转换后的Vue组件代码
 */
module.exports = function (source) {
  // 确保异步处理
  const callback = this.async();

  try {
    // 使用SVGO优化SVG
    const optimizedSvg = optimize(source, {
      plugins: [
        {
          name: 'preset-default',
          params: {
            overrides: {
              removeViewBox: false,
              cleanupIds: false,
            },
          },
        },
      ],
    }).data;

    // 使用JSDOM处理SVG
    const dom = new JSDOM(optimizedSvg);
    const svgElement = dom.window.document.querySelector('svg');

    if (!svgElement) {
      return callback(new Error('无效的SVG文件'));
    }

    setSvgAttributes(svgElement, true);

    // 提取SVG内容
    const svgContent = svgElement.innerHTML;

    // 提取并处理SVG属性，排除 width, height
    const excludeAttrs = ['width', 'height'];
    let attributesString = '';
    if (svgElement.hasAttributes()) {
      const attrs = svgElement.attributes;
      for (let i = 0; i < attrs.length; i++) {
        const attr = attrs[i];
        if (!excludeAttrs.includes(attr.name)) {
          // 确保属性值中的双引号被正确转义
          const escapedValue = attr.value.replace(/"/g, '&quot;');
          attributesString += ` ${attr.name}="${escapedValue}"`;
        }
      }
    }
    attributesString = attributesString.trim(); // 移除可能的前导空格

    // 获取文件名（不含扩展名）作为组件名
    const fileName = this.resourcePath
      .split('/')
      .pop()
      .replace(/\.svg$/, '');
    const componentName =
      'Svg' + fileName.charAt(0).toUpperCase() + fileName.slice(1);

    // 构建 Vue 模板
    const template = `
<svg
  class="v-icon-svg"
  width="1em"
  height="1em"
  style="display:inline-block;vertical-align:-0.15em;overflow:hidden;"
  ${attributesString ? attributesString + ' ' : ''}>
  ${svgContent}
</svg>
    `.trim();

    // 编译模板为 render 函数
    const renderCode = compileVueTemplate(template, this.resourcePath);

    // 生成最终的 Vue 组件代码
    const vueComponent = `
${renderCode}

export default {
  name: '${componentName}',
  render: render
}
`;

    callback(null, vueComponent);
  } catch (error) {
    callback(error);
  }
};
