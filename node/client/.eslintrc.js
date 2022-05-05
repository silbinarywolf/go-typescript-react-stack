module.exports = {
	// note(jae): 2021-07-21
	// stop eslint from getting more rules from parent directories
	"root": true,
	"env": {
		"es2021": true,
	},
	"extends": [
		"eslint:recommended",
		"plugin:@typescript-eslint/recommended",
		"plugin:react/recommended",
		"plugin:jsx-a11y/recommended",
	],
	"plugins": [
		"autofix",
		"unused-imports",
		"react-hooks",
	],
	"parser": "@typescript-eslint/parser",
	"parserOptions": {
		"ecmaFeatures": {
			"jsx": true,
		},
		"ecmaVersion": 12,
		"sourceType": "module",
	},
	"rules": {
		"react-hooks/rules-of-hooks": "error", // Checks rules of Hooks
		"react-hooks/exhaustive-deps": "warn", // Checks effect dependencies
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
		// note(jae): 2021-09-01
		// always force various cases to have a trailing comma. This is consistent with how Go works and means
		// that less lines of code will appear modified in pull requests.
		"comma-dangle": ["error", {
			"arrays": "always-multiline",
			"objects": "always-multiline",
			"imports": "always-multiline",
			"exports": "always-multiline",
			// note(jae): 2021-09-21
			// not enabled as it could have weird side-effects if we decide to target ECMAScript versions below 2017
			"functions": "never",
		}],
		// note(jae): 2021-09-01
		// these whitespace differences can be picked up by source control systems and flagged as diffs,
		// causing frustration for developers
		"no-trailing-spaces": "error",
		// note(jae): 2021-09-01: if more than N properties in JSX tag, make them split per line
		"react/jsx-max-props-per-line": ["error", { "maximum": 2, "when": "always" }],
		// note(jae): 2021-09-01:
		// the first property should always be placed on a new line if the JSX tag takes up multiple lines and
		// there are multiple properties
		"react/jsx-first-prop-new-line": ["error", "multiline-multiprop"],
		// note(jae): 2021-09-01: make closing tag appear on newline
		"react/jsx-closing-bracket-location": ["error", {"location": "tag-aligned"}],
		// note(jae): 2021-09-01: TypeScript type-checker handles this
		"no-undef": "off",
		// note(jae): 2021-09-01
		// TypeScript checker *could* handle this in tsconfig.json but we don't because this rule
		// is too frustrating to deal with when working with TypeScript/JavaScript
		"no-unused-vars": "off",
		// note(jae): 2021-09-21
		// If I re-throw a caught error immediately and it's a "useless catch", it might
		// have accompanying comments on *why* we do that so I'd rather the "catch" stay in
		"no-useless-catch": "off",
		"@typescript-eslint/no-unused-vars": "off",
		// note(jae): 2021-09-01
		// Stop unused imports from being imported. This is less frustrating to deal with as it has
		// an auto-fixer
		"unused-imports/no-unused-imports": "error",
		// note(jae): 2021-09-02
		// Allow empty interfaces for the use-case of stubbing "interface Props{}" for React
		// components that may initially have nothing but eventually be filled out in the future
		"@typescript-eslint/no-empty-interface": "off",
		// note(jae): 2021-09-02
		// For consistency across *.ts and *.tsx files, force use of "MyType[]" array syntax instead of allowing
		// the generic "Array<MyType>" (which won't work in *.tsx files)
		"@typescript-eslint/array-type": ["error"],
		// note(jae): 2021-09-01
		// default eslint library doesn't provide an auto-fixer for this, so we use a library that does
		"autofix/no-prototype-builtins": "error",
		// note(jae): 2021-09-01: ensure for-in loops are done correctly, Google the rule for more info
		"guard-for-in": "error",
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
	},
};
