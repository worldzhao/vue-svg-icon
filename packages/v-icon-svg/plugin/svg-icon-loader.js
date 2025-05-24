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
  if (colorless) {
    // 设置 fill 属性
    if (element.hasAttribute('fill')) {
      element.setAttribute('fill', 'currentColor');
    }

    // 设置 fill-opacity 属性
    if (element.hasAttribute('fill-opacity')) {
      element.setAttribute('fill-opacity', '1');
    }

    // 设置 stroke 属性
    if (element.hasAttribute('stroke')) {
      element.setAttribute('stroke', 'currentColor');
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

    // 生成Vue组件
    const vueComponent = `
<template>
  <svg
    class="v-icon-svg"
    width="1em"
    height="1em"
    style="display:inline-block;vertical-align:-0.15em;overflow:hidden;fill:currentColor;"
    ${attributesString ? attributesString + ' ' : ''}>
    ${svgContent}
  </svg>
</template>

<script>
export default {
  name: '${componentName}',
}
</script>
`;

    callback(null, vueComponent);
  } catch (error) {
    callback(error);
  }
};
