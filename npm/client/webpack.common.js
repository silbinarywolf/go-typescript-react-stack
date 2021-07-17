const path = require("path");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
	entry: path.resolve(__dirname, "src/main.tsx"),
	module: {
		rules: [
			{
				// note(jae): 2021-07-18
				// we use ".module.css" format as other out-of-the-box bundlers such as Parcel
				// use that format by default. This will hopefully make switching to other such
				// bundlers easier in the future, if we decide to do this.
				test: /\.module.css$/,
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
						// note(jae): 2021-07-18
						// we use PostCSS instead of SASS because
						// - Node-SASS and Dart SASS are very very slow
						// - Most loaders end up relying on postcss-loader for the "autoprefixer" module anyway
						//		- So let's keep our loaders low, so that build-time is fast.
						// - If we need more plugins, we can install them if need be.
						loader: require.resolve("postcss-loader")
					}
				],
			},
			{
				test: /\.tsx?$/,
				use: require.resolve("ts-loader"),
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
			// note(jae): 2021-07-18
			// This plugin uses the "paths" from tsconfig.json so that we don't need to configure
			// "alias" entries in these webpack config files
			new TsconfigPathsPlugin()
		]
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: "./src/index.html",
		})
	],
	output: {
		filename: "bundle.min.js",
		path: path.resolve(__dirname, "dist"),
	}
};
