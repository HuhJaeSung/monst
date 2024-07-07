const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: "./src/index.js",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
  target: "web",
  module: {
    rules: [
      {
        test: /\.(wasm|bin|obj)$/i,
        include: [path.resolve(__dirname, "node_modules/deepar/")],
        type: "asset/resource",
      },
      {
        include: [path.resolve(__dirname, "effects/")],
        type: "asset/resource",
      },
    ],
  },
  resolve: {
    alias: {
      "@effects": path.resolve(__dirname, "effects/"),
    },
  },
  performance: {
    maxEntrypointSize: 10000000,
    maxAssetSize: 100000000,
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: "public", to: "" }, // public 폴더의 파일을 dist 폴더에 복사
        { from: "node_modules/deepar", to: "deepar-resources" }, // node_modules/deepar의 파일을 dist/deepar-resources로 복사
      ],
    }),
  ],
  devServer: {
    static: [
      {
        directory: path.join(__dirname, "public"),
      },
      {
        directory: path.join(__dirname, "node_modules/deepar"),
        publicPath: "/deepar-resources",
      },
    ],
    compress: true,
    port: 9000,
  },
};
