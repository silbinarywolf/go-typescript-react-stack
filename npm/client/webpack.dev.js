const path = require('path');
const { mergeWithRules } = require('webpack-merge');

const common = require('./webpack.common.js');

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
    mode: 'development',
    devtool: 'inline-source-map',
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
    devServer: {
		contentBase: path.join(__dirname, "dist"),
		compress: true,
		port: 9000,
	},
});
