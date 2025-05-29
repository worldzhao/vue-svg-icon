import type { DefineComponent } from 'vue';

// SVGIcon 组件的 Props 类型
export interface SVGIconProps {
  /** SVG 图标内容或路径 */
  icon: string;
  /** 是否应用无色处理，将 fill 和 stroke 转换为 currentColor */
  colorless?: boolean;
  /** 是否使用内联模式渲染 */
  inline?: boolean;
}

// SVGIcon 组件类型定义
export declare const SVGIcon: DefineComponent<SVGIconProps>;

// 默认导出组件
export default SVGIcon;

// 声明 SVG 模块类型
declare module '*.svg' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

// 声明带查询参数的 SVG 模块
declare module '*.svg?raw' {
  const content: string;
  export default content;
}

declare module '*.svg?url' {
  const url: string;
  export default url;
}

declare module '*.svg?inline' {
  const dataUrl: string;
  export default dataUrl;
}
