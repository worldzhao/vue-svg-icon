import { defineConfig } from '@rsbuild/core';
import { pluginVue } from '@rsbuild/plugin-vue';

export default defineConfig({
  plugins: [pluginVue()],
  output:{ assetPrefix:"/v-icon-svg"},
   html: {
    title: 'v-icon-svg'
  }
});
