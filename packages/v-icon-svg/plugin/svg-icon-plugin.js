/**
 * svg-icon-plugin.js
 * Webpack插件，用于配置SVG图标加载器
 */

const path = require('path');

class SvgIconPlugin {
  constructor(options = {}) {
    // 合并默认配置和用户配置
    this.options = Object.assign(
      {
        test: /\.svg$/, // 默认匹配所有SVG文件
        include: null, // 可选的包含路径
        exclude: null, // 可选的排除路径
        rawQuery: 'raw', // 当资源包含此query参数时，返回原始SVG字符串
        urlQuery: 'url', // 当资源包含此query参数时，返回SVG文件URL
        inlineQuery: 'inline', // 当资源包含此query参数时，返回base64编码的内联内容
      },
      options
    );
  }

  apply(compiler) {
    const { test, include, exclude, rawQuery, urlQuery, inlineQuery } =
      this.options;

    // 添加loader处理规则
    const rawRules = compiler.options.module.rules.filter(
      (rule) => rule.test && rule.test.toString().includes('svg')
    );

    // 如果已有处理SVG的规则，需要修改它们的test以排除我们要处理的SVG
    if (rawRules.length > 0) {
      rawRules.forEach((rawRule) => {
        const originalTest = rawRule.test;

        rawRule.test = function (resource) {
          if (include && include.test(resource)) {
            return false;
          }

          // 不在include列表内，使用原有规则
          if (typeof originalTest === 'function') {
            return originalTest(resource);
          } else if (originalTest instanceof RegExp) {
            return originalTest.test(resource);
          } else if (typeof originalTest === 'string') {
            return resource.includes(originalTest);
          } else if (Array.isArray(originalTest)) {
            return originalTest.some((condition) => {
              if (typeof condition === 'function') return condition(resource);
              if (condition instanceof RegExp) return condition.test(resource);
              if (typeof condition === 'string')
                return resource.includes(condition);
              return false;
            });
          }

          return false;
        };
      });
    }

    // 使用 oneOf 规则组织所有 SVG 处理方式
    compiler.options.module.rules.push({
      test,
      include,
      exclude,
      oneOf: [
        // 原始内容查询参数的 SVG 处理规则
        {
          resourceQuery: new RegExp(`\\?.*${rawQuery}`), // 匹配包含原始内容参数的查询
          type: 'asset/source', // 使用 asset/source 直接返回文件内容
        },
        // URL查询参数的 SVG 处理规则
        {
          resourceQuery: new RegExp(`\\?.*${urlQuery}`), // 匹配包含URL参数的查询
          type: 'asset/resource', // 使用 asset/resource 返回文件URL
        },
        // 内联查询参数的 SVG 处理规则
        {
          resourceQuery: new RegExp(`\\?.*${inlineQuery}`), // 匹配包含内联参数的查询
          type: 'asset/inline', // 使用 asset/inline 返回base64编码的内容
        },
        // 默认的 Vue 组件处理规则 - 直接使用 svg-icon-loader
        {
          use: [
            {
              loader: path.resolve(__dirname, 'svg-icon-loader.js'),
              options: {
                // 传递必要的选项给 loader
                rawQuery,
                urlQuery,
                inlineQuery,
              },
            },
          ],
        },
      ],
    });
  }
}

module.exports = SvgIconPlugin;
