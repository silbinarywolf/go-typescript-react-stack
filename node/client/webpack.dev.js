const webpack = require("webpack");
const path = require("path");
const { mergeWithRules } = require("webpack-merge");

const common = require("./webpack.common.js");

module.exports = mergeWithRules({
	module: {
		rules: {
			// note(jae): 2021-07-18
			// For style-loader to work, it needs to be prepended (first in the ".css" loaders)
			test: "match",
			use: "prepend"
		},
	},
})(common, {
	mode: "development",
	devtool: "eval-source-map",
	module: {
		rules: [
			{
				test: /\.module.css$/,
				use: [
					{
						// note(jae): 2021-07-18
            			// For development, we just want our styles embedded in a <style> tag
						// on the page for faster loading.
						loader: require.resolve("style-loader"),
					},
				]
			},
		],
	},
	plugins: [
		new webpack.DefinePlugin({
			// note(jae): 2021-07-20
			// These are global variables. 
			// We add definitions to the "src/custom.d.ts" file so that TypeScript can see them.
			API_ENDPOINT: JSON.stringify(":8080"),
			VERSION: JSON.stringify("development"),
		}),
	],
	devServer: {
		contentBase: path.join(__dirname, "dist"),
		compress: true,
		port: 9000,
		// note(jae): 2021-07-18
		// write files out to disk for inspection during dev
		// writeToDisk: true,
	},
});
