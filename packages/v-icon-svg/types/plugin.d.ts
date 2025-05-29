import type { Compiler } from 'webpack';

// Plugin 配置选项
export interface SvgIconPluginOptions {
  /** 匹配 SVG 文件的测试规则，默认 /\.svg$/ */
  test?: RegExp;
  /** 包含的路径规则 */
  include?: RegExp | null;
  /** 排除的路径规则 */
  exclude?: RegExp | null;
  /** 原始内容查询参数名，默认 'raw' */
  rawQuery?: string;
  /** URL 查询参数名，默认 'url' */
  urlQuery?: string;
  /** 内联 base64 查询参数名，默认 'inline' */
  inlineQuery?: string;
}

// Vue SVG Icon Plugin 类
export declare class VueSvgIconPlugin {
  constructor(options?: SvgIconPluginOptions);

  /**
   * 应用插件到 webpack/rspack 编译器
   * @param compiler webpack/rspack 编译器实例
   */
  apply(compiler: Compiler): void;
}
