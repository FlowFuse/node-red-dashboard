const path = require("path");
const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: './',
  chainWebpack: config => {
    config
      .entry("app")
      .clear()
      .add("./ui/src/main.js")
      .end();
    config.resolve.alias
      .set("@", path.join(__dirname, "./ui/src"))
  }
})