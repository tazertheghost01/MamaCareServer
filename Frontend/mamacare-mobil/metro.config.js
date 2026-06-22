const { getDefaultConfig } = require("expo/metro-config");
const { withNativewind } = require("nativewind/metro");

/** @type {import('expo/metro-config').MetroConfig} */
// 1. Force Expo's Metro config to enable CSS compilation
const config = getDefaultConfig(__dirname, { isCSSEnabled: true });

// 2. Explicitly feed your global.css into the NativeWind transformer
module.exports = withNativewind(config, { input: "./global.css" });
