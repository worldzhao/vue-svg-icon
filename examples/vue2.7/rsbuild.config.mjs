import { defineConfig } from '@rsbuild/core';
import { pluginVue2 } from '@rsbuild/plugin-vue2';
import path from 'path';
import { VueSvgIconPlugin } from 'v-icon-svg/plugin';

export default defineConfig({
  plugins: [pluginVue2()],
  source: {
    alias: {
      vue: path.resolve(__dirname, 'node_modules/vue/dist/vue.esm.js'),
    },
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
