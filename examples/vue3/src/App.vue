<template>
  <div class="tw-p-4">
    <h2 class="tw-text-2xl tw-font-bold tw-mb-6">SVG Icon 渲染模式演示</h2>

    <div
      class="tw-mb-8 tw-p-6 tw-border tw-border-amber-200 tw-rounded-lg tw-bg-amber-50"
    >
      <h3 class="tw-text-xl tw-font-medium tw-mb-2 tw-text-slate-600">
        1. Symbol + Use 模式 (默认)
      </h3>
      <p class="tw-mb-4 tw-text-sm tw-text-slate-700">
        ✅ 性能最优，内存占用小，适合常规图标使用
      </p>
      <SVGIcon
        :icon="mySvgIconString"
        class="tw-cursor-pointer tw-text-[34px] tw-text-blue-500 hover:tw-text-red-500"
        @click="handleClick1"
      />
    </div>

    <div
      class="tw-mb-8 tw-p-6 tw-border tw-border-amber-200 tw-rounded-lg tw-bg-amber-50"
    >
      <h3 class="tw-text-xl tw-font-medium tw-mb-2 tw-text-slate-600">
        2. Inline 模式
      </h3>
      <p class="tw-mb-4 tw-text-sm tw-text-slate-700">
        ✅ 完整 SVG 控制，解决特殊场景兼容性问题
      </p>
      <SVGIcon
        :icon="mySvgIconString"
        :inline="true"
        class="tw-cursor-pointer tw-text-[34px] tw-text-green-500 hover:tw-text-red-500"
        @click="handleClick2"
      />
    </div>

    <div
      class="tw-mb-8 tw-p-6 tw-border tw-border-amber-200 tw-rounded-lg tw-bg-amber-50"
    >
      <h3 class="tw-text-xl tw-font-medium tw-mb-2 tw-text-slate-600">
        3. html2canvas 场景对比
      </h3>
      <p class="tw-mb-4 tw-text-sm tw-text-slate-700">
        📷
        <strong>html2canvas</strong>
        截图时，
        <code
          class="tw-bg-amber-100 tw-text-orange-500 tw-py-0.5 tw-px-1 tw-rounded tw-text-sm tw-font-medium"
          >&lt;use&gt;</code
        >
        元素可能无法正确渲染， 而
        <code
          class="tw-bg-amber-100 tw-text-orange-500 tw-py-0.5 tw-px-1 tw-rounded tw-text-sm tw-font-medium"
          >inline</code
        >
        模式可以避免这个问题
      </p>

      <div
        ref="captureArea"
        class="tw-p-4 tw-border-2 tw-border-dashed tw-border-amber-200 tw-rounded-lg tw-bg-white tw-mb-4"
      >
        <div class="tw-flex tw-justify-center tw-gap-8">
          <div class="tw-text-center">
            <p class="tw-mb-2 tw-text-sm tw-text-slate-700">
              Symbol 模式 (可能有问题)
            </p>
            <SVGIcon
              :icon="mySvgIconString2"
              class="tw-text-[32px] tw-text-red-600"
            />
          </div>
          <div class="tw-text-center">
            <p class="tw-mb-2 tw-text-sm tw-text-slate-700">
              Inline 模式 (推荐)
            </p>
            <SVGIcon
              :icon="mySvgIconString2"
              :inline="true"
              class="tw-text-[32px] tw-text-green-600"
            />
          </div>
        </div>
      </div>

      <button
        class="tw-py-2 tw-px-4 tw-bg-blue-500 tw-text-white tw-rounded-md tw-border-none tw-text-sm tw-cursor-pointer hover:tw-bg-blue-400 disabled:tw-bg-slate-500 disabled:tw-cursor-not-allowed"
        :disabled="isCapturing"
        @click="captureScreenshot"
      >
        {{ isCapturing ? '截图中...' : '📷 测试 html2canvas 截图' }}
      </button>

      <div
        v-if="capturedImage"
        class="tw-mt-4 tw-p-4 tw-bg-white tw-rounded-md tw-border tw-border-amber-200"
      >
        <p class="tw-mb-2">截图结果 (注意观察两个图标的渲染差异):</p>
        <img
          :src="capturedImage"
          alt="截图结果"
          class="tw-max-w-full tw-border tw-border-amber-200 tw-rounded"
        />
      </div>
    </div>

    <div
      class="tw-mb-8 tw-p-6 tw-border tw-border-amber-200 tw-rounded-lg tw-bg-amber-50"
    >
      <h3 class="tw-text-xl tw-font-medium tw-mb-2 tw-text-slate-600">
        4. 缓存效果演示
      </h3>
      <p class="tw-mb-4 tw-text-sm tw-text-slate-700">
        相同图标多次使用时的缓存效果
      </p>

      <div class="tw-flex tw-flex-col tw-gap-4">
        <div
          class="tw-p-4 tw-bg-white tw-rounded-md tw-border tw-border-amber-200"
        >
          <p class="tw-mb-2 tw-text-sm tw-font-medium tw-text-slate-600">
            Symbol 模式 (共享 symbol 定义)
          </p>
          <div class="tw-flex tw-gap-2">
            <SVGIcon
              :icon="mySvgIconString2"
              class="tw-text-[20px] tw-text-red-500"
            />
            <SVGIcon
              :icon="mySvgIconString2"
              class="tw-text-[20px] tw-text-blue-500"
            />
            <SVGIcon
              :icon="mySvgIconString2"
              class="tw-text-[20px] tw-text-green-500"
            />
            <SVGIcon
              :icon="mySvgIconString2"
              class="tw-text-[20px] tw-text-purple-500"
            />
          </div>
        </div>

        <div
          class="tw-p-4 tw-bg-white tw-rounded-md tw-border tw-border-amber-200"
        >
          <p class="tw-mb-2 tw-text-sm tw-font-medium tw-text-slate-600">
            Inline 模式 (独立 SVG 元素)
          </p>
          <div class="tw-flex tw-gap-2">
            <SVGIcon
              :icon="mySvgIconString2"
              :inline="true"
              class="tw-text-[20px] tw-text-yellow-500"
            />
            <SVGIcon
              :icon="mySvgIconString2"
              :inline="true"
              class="tw-text-[20px] tw-text-purple-600"
            />
            <SVGIcon
              :icon="mySvgIconString2"
              :inline="true"
              class="tw-text-[20px] tw-text-blue-600"
            />
            <SVGIcon
              :icon="mySvgIconString2"
              :inline="true"
              class="tw-text-[20px] tw-text-green-400"
            />
          </div>
        </div>
      </div>
    </div>

    <div
      class="tw-mb-8 tw-p-6 tw-border tw-border-amber-200 tw-rounded-lg tw-bg-amber-50"
    >
      <h3 class="tw-text-xl tw-font-medium tw-mb-2 tw-text-slate-600">
        5. 使用场景指南
      </h3>
      <div
        class="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 md:tw-grid-cols-3 lg:tw-grid-cols-4 tw-gap-4"
      >
        <div
          class="tw-flex tw-items-start tw-gap-3 tw-p-4 tw-bg-white tw-rounded-md tw-border tw-border-amber-200 hover:tw-border-teal-400 hover:tw-shadow-md tw-transition-all tw-duration-200"
        >
          <span class="tw-text-2xl tw-flex-shrink-0">🎯</span>
          <div>
            <strong class="tw-block tw-mb-1 tw-text-slate-600"
              >常规图标显示</strong
            >
            <p class="tw-m-0 tw-text-sm tw-text-slate-700">
              使用 Symbol + Use 模式，性能最优
            </p>
          </div>
        </div>
        <div
          class="tw-flex tw-items-start tw-gap-3 tw-p-4 tw-bg-white tw-rounded-md tw-border tw-border-amber-200 hover:tw-border-teal-400 hover:tw-shadow-md tw-transition-all tw-duration-200"
        >
          <span class="tw-text-2xl tw-flex-shrink-0">📷</span>
          <div>
            <strong class="tw-block tw-mb-1 tw-text-slate-600"
              >html2canvas 截图</strong
            >
            <p class="tw-m-0 tw-text-sm tw-text-slate-700">
              使用 Inline 模式，避免 &lt;use&gt; 渲染问题
            </p>
          </div>
        </div>
        <div
          class="tw-flex tw-items-start tw-gap-3 tw-p-4 tw-bg-white tw-rounded-md tw-border tw-border-amber-200 hover:tw-border-teal-400 hover:tw-shadow-md tw-transition-all tw-duration-200"
        >
          <span class="tw-text-2xl tw-flex-shrink-0">🖼️</span>
          <div>
            <strong class="tw-block tw-mb-1 tw-text-slate-600"
              >PDF 导出 / 跨 iframe</strong
            >
            <p class="tw-m-0 tw-text-sm tw-text-slate-700">
              使用 Inline 模式，确保兼容性
            </p>
          </div>
        </div>
        <div
          class="tw-flex tw-items-start tw-gap-3 tw-p-4 tw-bg-white tw-rounded-md tw-border tw-border-amber-200 hover:tw-border-teal-400 hover:tw-shadow-md tw-transition-all tw-duration-200"
        >
          <span class="tw-text-2xl tw-flex-shrink-0">🎨</span>
          <div>
            <strong class="tw-block tw-mb-1 tw-text-slate-600"
              >精确样式控制</strong
            >
            <p class="tw-m-0 tw-text-sm tw-text-slate-700">
              使用 Inline 模式，可操作 SVG 内部元素
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SVGIconDemo',
};
</script>

<script setup>
import { ref } from 'vue';

import { SVGIcon } from 'v-icon-svg';

const mySvgIconString =
  '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6b9bd2" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>';

const mySvgIconString2 =
  '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" class=""><path d="M13.406 10.156a3.75 3.75 0 00-3.75 3.75v9.188a3.75 3.75 0 003.75 3.75h9.188a3.75 3.75 0 003.75-3.75V21.78a1.5 1.5 0 013 0v1.313a6.75 6.75 0 01-6.75 6.75h-9.188a6.75 6.75 0 01-6.75-6.75v-9.188a6.75 6.75 0 016.75-6.75h1.313a1.5 1.5 0 010 3h-1.313z" fill="#fff" fill-opacity=".45"></path><path d="M20.438 8.656a1.5 1.5 0 011.5-1.5h5.906a1.5 1.5 0 011.5 1.5v5.906a1.5 1.5 0 11-3 0v-2.285l-8.596 8.596a1.5 1.5 0 11-2.121-2.121l8.595-8.596h-2.284a1.5 1.5 0 01-1.5-1.5z" fill="#fff" fill-opacity=".45"></path></svg>';

// html2canvas 相关状态
const captureArea = ref(null);
const isCapturing = ref(false);
const capturedImage = ref(null);

const captureScreenshot = async () => {
  if (!captureArea.value) return;

  isCapturing.value = true;

  try {
    // 动态导入 html2canvas 以避免构建时依赖问题
    const html2canvas = await import('html2canvas')
      .then((module) => module.default)
      .catch(() => {
        console.warn('html2canvas 未安装，这只是演示');
        return null;
      });

    if (html2canvas) {
      const canvas = await html2canvas(captureArea.value, {
        backgroundColor: '#ffffff',
        scale: 2,
      });
      capturedImage.value = canvas.toDataURL('image/png');
    } else {
      // 如果没有 html2canvas，显示提示信息
      alert(
        'html2canvas 未安装。在实际项目中，您可以通过 "npm install html2canvas" 来安装并测试效果。\n\nInline 模式的图标在 html2canvas 中会被正确渲染，而 Symbol 模式可能会有问题。'
      );
    }
  } catch (error) {
    console.error('截图失败:', error);
    alert('截图功能需要安装 html2canvas: npm install html2canvas');
  } finally {
    isCapturing.value = false;
  }
};

const handleClick1 = () => {
  console.log('handleClick1');
};

const handleClick2 = () => {
  console.log('handleClick2');
};
</script>
