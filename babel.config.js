module.exports = function (api) {
  api.cache(true);

  return {
    presets: [['babel-preset-expo', { reanimated: false, jsxImportSource: "nativewind" }], 'nativewind/babel'],
  };
};
