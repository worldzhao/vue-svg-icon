import { defineConfig } from '@rsbuild/core';
import { pluginVue } from '@rsbuild/plugin-vue';
import { VueSvgIconPlugin } from 'v-icon-svg/plugin';

export default defineConfig({
  plugins: [pluginVue()],
  output: { assetPrefix: '/vue-svg-icon' },
  html: {
    title: 'v-icon-svg',
  },
  tools: {
    rspack: (_config, { appendPlugins }) => {
      appendPlugins(
        new VueSvgIconPlugin({
          include: /src\/icons/,
        })
      );
    },
  },
});
