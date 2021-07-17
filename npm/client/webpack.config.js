const path = require("path");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
	entry: path.resolve(__dirname, "src/main.tsx"),
	mode: process.env.NODE_ENV !== 'production' ? "development" : "production",
	devtool: "source-map",
	module: {
		rules: [
			{
				test: /\.css$/,
				use: [
					{
						loader: MiniCssExtractPlugin.loader,
						options: {
						},
					},
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
		new MiniCssExtractPlugin({
			// Options similar to the same options in webpackOptions.output
			// both options are optional
			filename: process.env.NODE_ENV !== 'production' ? '[name].css' : '[name].[hash].css',
			chunkFilename: process.env.NODE_ENV !== 'production' ? '[id].css' : '[id].[hash].css',
		}),
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
		clean: true
	},
	devServer: {
		contentBase: path.join(__dirname, "dist"),
		compress: true,
		port: 9000,
	}
};
