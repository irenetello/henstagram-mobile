// metro.config.cjs
const { getDefaultConfig } = require("expo/metro-config.js");

const config = getDefaultConfig(__dirname);

const blocked = [
  /.*\.jest\.test\.[jt]sx?$/,
  /.*\.(test|spec)\.[jt]sx?$/,
  /.*\/__tests__\/.*/,
];

const blockListRE = new RegExp(blocked.map((r) => r.source).join("|"));

config.resolver.blockList = blockListRE;
config.resolver.blacklistRE = blockListRE;

module.exports = config;