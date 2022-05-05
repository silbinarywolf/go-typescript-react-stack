/* eslint-disable @typescript-eslint/no-var-requires */

const webpack = require("webpack");
const path = require("path");

const TerserPlugin = require("terser-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { mergeWithRules } = require("webpack-merge");

const common = require("./webpack.common.js");

// Get VCS commit hash for version number of package
let commitHash;
{
	try {
		commitHash = require("child_process")
			.execSync("git rev-parse HEAD")
			.toString();
	} catch (e) {
		let hasNoGitRepository = e.toString().includes("not a git repository");
		if (hasNoGitRepository !== true) {
			throw new Error("unable to get Git Commit HASH for Version string: " + e.toString());
		}
		// note(jae): 2021-07-21
		// handle case where someone downloaded this repository from Github without Git and
		// just wants to try it out.
		//
		// this case still prints "fatal: not a git repository (or any of the parent directories): .git"
		// but it works.
		commitHash = "novcs";
	}
	if (!commitHash) {
		throw new Error("unable to get Git Commit HASH for Version string: empty value returned");
	}
}

module.exports = mergeWithRules({
	module: {
		rules: {
			// note(jae): 2021-07-18
			// For MiniCssExtractPlugin to work, it needs to be prepended (first in the ".css" loaders)
			test: "match",
			use: "prepend",
		},
	},
})(common, {
	mode: "production",
	devtool: "source-map",
	module: {
		rules: [
			{
				test: /\.module.css$/,
				use: [
					{
						// note(jae): 2021-07-18
						// For production, we just want our styles pulled out into a CSS file
						loader: MiniCssExtractPlugin.loader,
					},
				],
			},
			{
				test: /\.css$/,
				use: [
					{
						// note(jae): 2021-07-18
						// For production, we just want our styles pulled out into a CSS file
						loader: MiniCssExtractPlugin.loader,
					},
				],
			},
		],
	},
	plugins: [
		new MiniCssExtractPlugin({
			filename: "[name].[fullhash].css",
			chunkFilename: "[id].[fullhash].css",
		}),
		new webpack.DefinePlugin({
			// note(jae): 2021-07-20
			// These are global variables.
			// We add definitions to the "src/custom.d.ts" file so that TypeScript can see them.
			API_ENDPOINT: JSON.stringify(":8080"),
			VERSION: JSON.stringify("1.0.0-"+commitHash+"-"+Date.now()),
		}),
	],
	output: {
		filename: "[name].[fullhash].min.js",
		clean: true,
		// note(jae): 2021-07-18
		// build production files directly into a place where Go server
		// can access it. Go's embed files functionality can't access files outside of it's directory.
		path: path.resolve(__dirname, "../../go/server/internal/staticfile/dist"),
	},
	optimization: {
		minimize: true,
		minimizer: [new TerserPlugin()],
		usedExports: true,
	},
});
