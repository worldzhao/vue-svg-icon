<template>
  <!-- Symbol 模式 -->
  <svg
    v-if="!inline && symbolId"
    width="1em"
    height="1em"
    fill="currentColor"
    class="v-icon-svg"
    :style="defaultStyle"
    :data-hash="hash"
    v-bind="svgAttrs"
  >
    <use :href="symbolHref" />
  </svg>
  <!-- Inline 模式：直接渲染SVG内容，使用v-html但应用相同类名 -->
  <svg
    v-else-if="inline && inlineContent"
    width="1em"
    height="1em"
    fill="currentColor"
    class="v-icon-svg"
    :style="defaultStyle"
    :data-hash="hash"
    v-bind="svgAttrs"
    v-html="inlineContent"
  />
</template>

<script>
export default {
  name: 'VueSvgIcon',
};
</script>

<script setup>
import { computed, ref, watch } from 'vue';

import { generateHash } from './utils/string-hash';
import { symbolManager } from './utils/symbol-manager';

const defaultStyle = {
  display: 'inline-block',
  verticalAlign: '-0.15em', // 稍微调整垂直对齐，使图标更好地与文本对齐
  overflow: 'hidden',
};

const props = defineProps({
  icon: {
    type: String,
    required: true,
  },
  colorless: {
    type: Boolean,
    default: true,
  },
  inline: {
    type: Boolean,
    default: false,
  },
});

// 状态定义
const hash = ref(null);
const symbolId = ref(null);
const inlineContent = ref(null);
const svgAttrs = ref({});

// 计算属性
const symbolHref = computed(() => {
  return symbolId.value ? `#${symbolId.value}` : null;
});

// 方法
const resetState = () => {
  hash.value = null;
  symbolId.value = null;
  inlineContent.value = null;
  svgAttrs.value = {};
};

const updateSymbol = (content) => {
  if (!content) {
    resetState();
    return;
  }

  // 统一的 hash 计算，不区分模式
  const contentWithProps = `${content}-colorless:${props.colorless}`;
  hash.value = generateHash(contentWithProps);

  if (props.inline) {
    // Inline 模式：获取处理后的SVG内部内容
    const result = symbolManager.getInlineContent(content, props.colorless);
    if (result) {
      inlineContent.value = result.content; // 已经是内部内容，不需要再提取
      svgAttrs.value = result.attrs || {}; // 应用保留的属性
      symbolId.value = null; // 清空 symbolId
    } else {
      resetState();
    }
  } else {
    // Symbol 模式
    const result = symbolManager.addSymbol(content, props.colorless);
    if (result) {
      symbolId.value = result.symbolId;
      svgAttrs.value = result.attrs || {}; // 应用保留的属性
      inlineContent.value = null; // 清空 inlineContent
    } else {
      resetState();
    }
  }
};

// 监听器
watch(
  () => [props.icon, props.colorless, props.inline],
  () => {
    updateSymbol(props.icon);
  },
  { immediate: true }
);
</script>
