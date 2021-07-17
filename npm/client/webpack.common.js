const path = require("path");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
	entry: path.resolve(__dirname, "src/main.tsx"),
	module: {
		rules: [
			{
				test: /\.css$/,
				use: [
					{
						loader: require.resolve("css-modules-typescript-loader"),
						options: {
							mode: process.env.CI ? "verify" : "emit"
						}
					},
					{
						loader: require.resolve("css-loader"),
						options: {
							modules: true,
							importLoaders: 1,
						},
					},
					{
						loader: require.resolve("postcss-loader")
					}
				],
			},
			{
				test: /\.tsx?$/,
				use: "ts-loader",
				exclude: /node_modules/
			},
		]
	},
	resolve: {
		extensions: [
			".tsx",
			".ts",
			".js",
		],
		plugins: [
			new TsconfigPathsPlugin()
		]
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: "./src/index.html",
			//hash: true,
			//title: "My App",
			//myPageHeader: "Hello World",
			//template: "./src/index.html",
			//filename:  "./dist/index.html",
		})
	],
	output: {
		filename: "bundle.min.js",
		path: path.resolve(__dirname, "dist"),
	}
};
