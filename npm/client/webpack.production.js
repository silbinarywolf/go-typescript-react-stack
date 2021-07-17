const TerserPlugin = require("terser-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { mergeWithRules } = require('webpack-merge');

const common = require('./webpack.common.js');

module.exports = mergeWithRules({
    module: {
        rules: {
            // note(jae): 2021-07-18
            // For MiniCssExtractPlugin to work, it needs to be prepended (first in the ".css" loaders)
            test: "match",
            use: "prepend"
        },
    },
})(common, {
    mode: 'production',
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
                ]
			},
		]
	},
    plugins: [
		new MiniCssExtractPlugin({
			filename: '[name].[fullhash].css',
			chunkFilename: '[id].[fullhash].css',
		}),
    ],
    output: {
        filename: "[name].[fullhash].min.js",
		clean: true,
	},
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin()],
        usedExports: true,
    },
});
