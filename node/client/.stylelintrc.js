module.exports = {
    "extends": [
        "stylelint-config-standard",
        // note(jae): 2021-09-01
        // We chose this property ordering scheme from the following.
        // I'm open to changing this in the future but I opted for this as it enforces *something*, I have no preference.
        // - stylelint-config-idiomatic-order
        // - stylelint-config-hudochenkov/order
        // - stylelint-config-recess-order
        // Source: https://github.com/hudochenkov/stylelint-order/blob/aa854725cfb482a256764d74693b8c32dbbe489f/README.md#example-configs
        "stylelint-config-idiomatic-order",
    ],
    "rules": {
        // note(jae): 2021-09-01
		// Using tabs instead of spaces for consistency with the Go backend.
		// Worth noting that most frontend developers will expect spaces instead of tabs.
		// I disagree with using spaces over tabs because tabs allow each programmer on the team
		// to configure the indent size to what they prefer. For people with eyesight issues, they
		// will want their tab spacing to much wider than those without.
        "indentation": "tab",
        // note(jae): 2022-01-18
        // disable this as it "Expected class selector to be kebab-case" and we use camelCase because
        // we import our classes into TypeScript code. I actually prefer kebab case but it just doesn't
        // translate across to programming languages like TypeScript well when importing those identifiers.
        "selector-class-pattern": null,
        "declaration-block-no-redundant-longhand-properties": null,
    },
}
