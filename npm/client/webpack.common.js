const path = require("path");

const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
	entry: {
		reactvendors: { 
			import: [
				require.resolve('react'), 
				require.resolve('react-dom'),
			],
			runtime: 'runtime',
		},
		app: {
			import: path.resolve(__dirname, "src/main.tsx"),
			dependOn: ['reactvendors'],
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
						// we use PostCSS instead of SASS because:
						// - Node-SASS and Dart SASS are very very slow in comparison
						// - Node-SASS can slow down "npm install" times greatly and fallover on various CI machines
						//	 because it's a native binary
						// - Most loaders end up relying on "postcss-loader" for the "autoprefixer" module anyway
						//		- So let's keep our loaders minimal, so that our build-time stays fast.
						// - For installing plugins/etc, see: "postcss.config.js"
						loader: require.resolve("postcss-loader")
					}
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
		path: path.resolve(__dirname, "dist"),
	}
};
