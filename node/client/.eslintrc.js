module.exports = {
	// note(jae): 2021-07-21
	// stop eslint from getting more rules from parent directories
	"root": true,
	"env": {
		"es2021": true
	},
	"extends": "plugin:react/recommended",
	"parser": "@typescript-eslint/parser",
	"parserOptions": {
		"ecmaFeatures": {
			"jsx": true
		},
		"ecmaVersion": 12,
		"sourceType": "module"
	},
	"plugins": [
		"react",
		"@typescript-eslint"
	],
	"rules": {
		// note(jae): 2021-07-21
		// Using tabs instead of spaces for consistency with the Go backend.
		// Worth noting that most frontend developers will expect spaces instead of tabs.
		// I disagree with using spaces over tabs because tabs allow each programmer on the team
		// to configure the indent size to what they prefer. For people with eyesight issues, they
		// will want their tab spacing to much wider than those without.
		"indent": ["error", "tab"],
		// note(jae): 2021-07-21
		// making quotes default to " instead of ' for consistency with Go server backend.
		// Again, in frontend culture the default is generally ', but when working with C/C++ or Go this type
		// of quote has a different meaning (ie. 1 character). So I prefer to make double quotes be the default.
		"quotes": ["error", "double"],
		// note(jae): 2021-07-21
		// weird subtle bugs can occur in JS if the semicolon is missing, so let's enforce it.
		"semi": ["error", "always"],
	},
	"settings": {
		"react": {
			"version": "detect", // React version. "detect" automatically picks the version you have installed.
			// You can also use `16.0`, `16.3`, etc, if you want to override the detected value.
			// default to latest and warns if missing
			// It will default to "detect" in the future
		},
		//"propWrapperFunctions": [
		//    // The names of any function used to wrap propTypes, e.g. `forbidExtraProps`. If this isn't set, any propTypes wrapped in a function will be skipped.
		//    "forbidExtraProps",
		//    {"property": "freeze", "object": "Object"},
		//],
		//"linkComponents": [
		//  // Components used as alternatives to <a> for linking, eg. <Link to={ url } />
		//  "Hyperlink",
		//  {"name": "Link", "linkAttribute": "to"}
		//]
	}
};
