import { generateHash } from './string-hash';

// 常量使用大写下划线
const SVG_CONTAINER_ID = '__svg_icon_container__';
const SYMBOL_PREFIX = 'svg-icon-';

// 私有变量使用小驼峰
let svgContainer = null;
// 分离两种缓存，避免数据结构冲突
const symbolCache = new Map(); // symbol 模式缓存
const inlineCache = new Map(); // inline 模式缓存

/**
 * 获取或创建 SVG 容器
 */
const getSvgContainer = () => {
  if (svgContainer && document.body.contains(svgContainer)) {
    return svgContainer;
  }

  svgContainer = document.getElementById(SVG_CONTAINER_ID);
  if (!svgContainer) {
    svgContainer = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'svg'
    );
    svgContainer.setAttribute('id', SVG_CONTAINER_ID);
    svgContainer.style.cssText = [
      'position: absolute',
      'width: 0',
      'height: 0',
      'overflow: hidden',
      'visibility: hidden',
    ].join(';');
    document.body.insertBefore(svgContainer, document.body.firstChild);
  }
  return svgContainer;
};

/**
 * 统一处理SVG元素的属性
 * 递归将元素及其子元素的 fill 属性设置为 "currentColor"，
 * fill-opacity 属性设置为 1，stroke 属性设置为 "currentColor", stroke-opacity 属性设置为 1
 * @param {Element} element - 要处理的 SVG 元素
 * @param {Boolean} colorless - 是否应用currentColor和不透明样式
 */
const setSvgAttributes = (element, colorless = true) => {
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

  // 递归处理所有子元素，只需要一次递归
  Array.from(element.children).forEach((child) =>
    setSvgAttributes(child, colorless)
  );
};

/**
 * 解析和处理 SVG 内容的通用方法
 * @param {string} svgContent - SVG 内容字符串
 * @param {boolean} colorless - 是否处理颜色属性
 * @returns {Object|null} 处理后的 SVG 元素和相关信息
 */
const processSvgContent = (svgContent, colorless = true) => {
  const parser = new DOMParser();
  let processedContent = svgContent.trim();

  // 确保有 xmlns 声明
  if (!processedContent.includes('xmlns="http://www.w3.org/2000/svg"')) {
    processedContent = processedContent.replace(
      '<svg',
      '<svg xmlns="http://www.w3.org/2000/svg"'
    );
  }

  try {
    const doc = parser.parseFromString(processedContent, 'image/svg+xml');
    const svgEl = doc.documentElement;

    if (svgEl.tagName === 'parsererror' || svgEl.querySelector('parsererror')) {
      console.error('[SvgIcon] SVG 解析错误:', processedContent);
      return null;
    }

    // 处理 SVG 属性（colorless 逻辑）
    setSvgAttributes(svgEl, colorless);

    return {
      svgEl,
    };
  } catch (error) {
    console.error('[SvgIcon] SVG 解析错误:', error);
    return null;
  }
};

/**
 * 创建 Symbol 元素
 */
const createSymbolElement = (symbolId, svgContent, colorless = true) => {
  const processed = processSvgContent(svgContent, colorless);
  if (!processed) return null;

  const { svgEl } = processed;

  const symbolEl = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'symbol'
  );
  symbolEl.setAttribute('id', symbolId);

  // 收集除width和height外的所有属性
  const excludeAttrs = ['width', 'height'];
  const attrs = {};

  Array.from(svgEl.attributes).forEach((attr) => {
    if (!excludeAttrs.includes(attr.name)) {
      // 复制必要的属性到 symbol 元素
      symbolEl.setAttribute(attr.name, attr.value);
      // 同时收集到返回的属性对象中
      attrs[attr.name] = attr.value;
    }
  });

  // 将处理过的子元素添加到 symbol 中
  Array.from(svgEl.children).forEach((child) => {
    symbolEl.appendChild(child.cloneNode(true));
  });

  return { symbolEl, attrs };
};

/**
 * 创建内联 SVG 内容
 */
const createInlineContent = (svgContent, colorless = true) => {
  // 复用Symbol元素处理的逻辑，确保一致性
  const processed = processSvgContent(svgContent, colorless);
  if (!processed) return null;

  const { svgEl } = processed;

  // 收集除width和height外的所有属性
  const excludeAttrs = ['width', 'height'];
  const attrs = {};

  Array.from(svgEl.attributes).forEach((attr) => {
    if (!excludeAttrs.includes(attr.name)) {
      attrs[attr.name] = attr.value;
    }
  });
  // 从SVG元素中提取子元素内容，而不是整个SVG
  const innerContent = Array.from(svgEl.children)
    .map((child) => child.outerHTML)
    .join('');

  return {
    content: innerContent, // 只返回内部内容，不包含svg标签
    attrs, // 返回所有需要保留的属性
  };
};

/**
 * Symbol 管理器
 */
export const symbolManager = {
  /**
   * 添加或获取 Symbol
   */
  addSymbol(svgContent, colorless = true) {
    if (!svgContent || typeof svgContent !== 'string') {
      return null;
    }

    // 只基于内容和 colorless 计算 hash，不包含模式信息
    const contentWithColorless = `${svgContent}-colorless:${colorless}`;
    const hash = generateHash(contentWithColorless);
    const symbolId = SYMBOL_PREFIX + hash;

    if (symbolCache.has(hash)) {
      return {
        symbolId,
        attrs: symbolCache.get(hash).attrs || {},
      };
    }

    const result = createSymbolElement(symbolId, svgContent, colorless);
    if (!result) {
      return null;
    }

    const container = getSvgContainer();
    container.appendChild(result.symbolEl);
    symbolCache.set(hash, {
      symbolEl: result.symbolEl,
      attrs: result.attrs || {},
    });

    return {
      symbolId,
      attrs: result.attrs || {},
    };
  },

  /**
   * 获取内联 SVG 内容
   */
  getInlineContent(svgContent, colorless = true) {
    if (!svgContent || typeof svgContent !== 'string') {
      return null;
    }

    // 使用相同的 hash 计算逻辑，保持一致性
    const contentWithColorless = `${svgContent}-colorless:${colorless}`;
    const hash = generateHash(contentWithColorless);

    if (inlineCache.has(hash)) {
      return inlineCache.get(hash);
    }

    const result = createInlineContent(svgContent, colorless);
    if (!result) {
      return null;
    }

    // 缓存到独立的 inline 缓存中
    inlineCache.set(hash, result);

    return result;
  },
};
