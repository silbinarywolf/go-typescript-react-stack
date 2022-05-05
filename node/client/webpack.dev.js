/* eslint-disable @typescript-eslint/no-var-requires */

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
			use: "prepend",
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
				],
			},
			{
				// note(jae): 2021-07-18
				// we use ".css" for top-level global CSS styles
				test: /\.css$/,
				use: [
					{
						// note(jae): 2021-07-18
						// For development, we just want our styles embedded in a <style> tag
						// on the page for faster loading.
						loader: require.resolve("style-loader"),
					},
				],
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
		// note(jae): 2021-11-24
		// we want this to be true so all routes such as /, /login, etc
		// will work with the devServer and not give 404 pages
		historyApiFallback: true,
		proxy: {
			// note(jae): 2022-05-05
			// Instead of using API_ENDPOINT, we could proxy api calls with the following
			// line.
			// "/api": "http://localhost:8080",
			// note(jae): 2021-12-16
			// If we served user-uploaded files, we could proxy the following:
			// "/files": "http://localhost:8080",
			"/favicon.ico": "http://localhost:8080",
		},
		client: {
			// note(jae): 2021-09-08
			// Show black screen with overlay with compilation errors
			// This helps catch type-errors earlier without needing to refer to your IDE/command-line
			overlay: {
				errors: true,
				warnings: true,
			},
			progress: true,
		},
		// note(jae): 2021-09-08
		// enabling this allows hot-reloading such as modifying CSS and seeing changes without a full page reload
		// see Webpack docs for how that works: https://webpack.js.org/guides/hot-module-replacement/
		hot: "only",
		compress: true,
		port: 9000,
		host: "0.0.0.0",
		allowedHosts: (
			process.env.DEV_ALLOWED_HOSTS_ALL === "true" ||
			process.env.DEV_ALLOWED_HOSTS_ALL === "1" ||
			process.env.DEV_ALLOWED_HOSTS_ALL === true
		) ? "all" : [
			// Allow connections from BrowserStack by default
				".bs-local.com",
			],
		// note(jae): 2021-07-18
		// write files out to disk for inspection during dev
		// writeToDisk: true,
	},
});
