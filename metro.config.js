const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, {
  input: './src/global.css',
  // nativewind resolves rem against React Native's default 14px, so
  // Tailwind's numeric scale would come out 12.5% short of the Figma spec
  // (px-4 -> 14 instead of 16). Pin it to the 16px the design is drawn against.
  inlineRem: 16,
  disableTypeScriptGeneration: true,
});
