/* eslint-disable @typescript-eslint/no-var-requires */

const webpack = require("webpack");
const path = require("path");

const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const PostCSSLoader = {
	// note(jae): 2021-07-18
	// we use PostCSS instead of SASS because:
	// - Node-SASS and Dart SASS are very very slow in comparison
	// - Node-SASS can slow down "npm install" times greatly and fallover on various CI machines
	//	 because it's a native binary
	// - Most loaders end up relying on "postcss-loader" for the "autoprefixer" module anyway
	//		- So let's keep our loaders minimal, so that our build-time stays fast.
	// - For installing plugins/etc, see: "postcss.config.js"
	loader: require.resolve("postcss-loader"),
};

module.exports = {
	entry: {
		reactvendors: {
			import: [
				require.resolve("react"),
				require.resolve("react-dom"),
			],
			runtime: "runtime",
		},
		app: {
			import: path.resolve(__dirname, "src/main.tsx"),
			dependOn: ["reactvendors"],
		},
	},
	module: {
		rules: [
			{
				// note(jae): 2021-07-18
				// we use ".module.css" format as other out-of-the-box bundlers such as Parcel
				// use that format by default. This will hopefully make switching to other such
				// bundlers easier in the future, if we decide it's worth doing.
				test: /\.module.css$/,
				use: [
					{
						// note(jae): 2021-07-18
						// this will auto-generate "Button.module.css.d.ts" TypeScript definitions
						// based on CSS files. That way, we get to write plain old CSS and we get
						// type-checking for our CSS imports that will work with Webpack and our IDEs.
						// (VSCode, IntelliJ, etc)
						loader: require.resolve("css-modules-typescript-loader"),
						options: {
							// note(jae): 2021-07-18
							// we want our continous integration machine to ensure the committed
							// definition files in the repository are correct
							mode: process.env.CI ? "verify" : "emit",
						},
					},
					{
						loader: require.resolve("css-loader"),
						options: {
							modules: true,
							importLoaders: 1,
						},
					},
					PostCSSLoader,
				],
			},
			{
				// note(jae): 2021-07-18
				// we use ".css" for top-level global CSS styles.
				// We need to do this so that ID and class selectors don't get their names mangled/transformed.
				test: /\.css$/,
				exclude: /\.module.css$/,
				use: [
					{
						loader: require.resolve("css-loader"),
						options: {
							modules: false,
							importLoaders: 1,
						},
					},
					PostCSSLoader,
				],
			},
			{
				test: /\.(png|jpe?g|gif)$/i,
				type: "asset/resource",
			},
			{
				test: /\.svg$/,
				use: [
					{
						loader: require.resolve("@svgr/webpack"),
					},
				],
			},
			{
				// note(jae): 2021-07-18
				// we use "ts-loader" because alternative loaders like Babel have subtle compilation bugs
				// and are slow. Worth noting that it's also on the decline due to misallocated funds.
				// It's original author (Sebastian McKenzie) has essentially disavvowed it.
				//
				// We also don't want a "faster compile" with type-checking turned off. That defeats the purpose
				// of having type-checking.
				test: /\.tsx?$/,
				use: require.resolve("ts-loader"),
				exclude: /node_modules/,
			},
		],
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
			new TsconfigPathsPlugin(),
		],
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: "./src/index.html",
			favicon: "./src/favicon.ico",
		}),
		new webpack.DefinePlugin({
			// note(jae): 2021-07-20
			// These are global variables.
			// We add definitions to the "src/custom.d.ts" file so that TypeScript can see them.
			// MY_VARIABLE: JSON.stringify(process.env.MY_VARIABLE),
		}),
	],
	output: {
		path: path.resolve(__dirname, "dist"),
		// note(jae): 2021-11-23
		// This is needed for:
		// - backend routes that serve not just the index.html page
		// - dev server using "historyApiFallback: true"
		// ie. "www.mysite.com/routes" should look for JS/CSS files at "/app.min.js" not "app.min.js",
		// 	   this slash fixes ensures that.
		publicPath: "/",
		// note(jae): 2022-01-13
		// we don't use the default hash function because Webpack 5 / Node 17 don't
		// play well together.
		// See: https://github.com/webpack/webpack/issues/14532
		hashFunction: "xxhash64",
	},
};
