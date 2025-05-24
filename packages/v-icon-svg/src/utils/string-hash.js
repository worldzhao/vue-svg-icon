/**
 * 生成字符串的哈希值
 * @param {string} str - 输入字符串
 * @returns {string} - 8位十六进制哈希值
 */
export const generateHash = (str) => {
  let hash = 0;
  if (!str) return hash.toString(16);

  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  return (hash >>> 0).toString(16).padStart(8, '0');
};
