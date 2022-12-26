const warn = "warn";
module.exports = {
  extends: [
    "airbnb-typescript",
    "plugin:@typescript-eslint/recommended", // Uses the recommended rules from the @typescript-eslint/eslint-plugin
    "plugin:react/recommended",
    "plugin:react-redux/recommended",
    "plugin:jest/recommended",
    "plugin:prettier/recommended", // Enables eslint-plugin-prettier and displays prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
    "plugin:react-hooks/recommended",
    "prettier",
  ],
  rules: {
    "react-hooks/exhaustive-deps": "warn", // Checks effect dependencies
    "prettier/prettier": [
      "error",
      {
        singleQuote: true,
        jsxSingleQuote: false,
        tabWidth: 2,
        useTabs: false,
        semi: true,
        trailingComma: "all",
        printWidth: 120,
        arrowParens: "avoid",
      },
    ],
    camelcase: "off",
    "@typescript-eslint/camelcase": "off",
    // bug https://github.com/benmosher/eslint-plugin-import/issues/528
    "import/no-unresolved": "off",
    "import/no-dynamic-require": "off",
    "import/no-extraneous-dependencies": "off",
    "import/prefer-default-export": "off",
    "global-require": warn,
    // needs work
    "no-restricted-syntax": warn,
    // needs work
    "no-param-reassign": "off",
    "max-len": [
      warn,
      120,
      2,
      {
        ignoreUrls: true,
        ignoreComments: true,
        ignoreRegExpLiterals: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
      },
    ],
    "no-console": "error",
    "no-plusplus": "off",
    "import/extensions": "off",
    "@typescript-eslint/no-empty-function": "off",
    "jest/no-conditional-expect": warn,
    "jest/valid-expect-in-promise": warn,
    "jest/no-export": warn,
    "jest/no-standalone-expect": warn,
    "react-redux/useSelector-prefer-selectors": warn,
  },
  overrides: [
    {
      files: ["**/*.ts", "**/*.tsx"],
      rules: {
        "no-unused-vars": "off",
        "no-cond-assign": warn,
        "no-use-before-define": "off",
        "import/no-cycle": warn,
        "@typescript-eslint/no-use-before-define": ["error"],
        "@typescript-eslint/interface-name-prefix": "off",
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/consistent-type-assertions": warn,
        "@typescript-eslint/no-empty-interface": warn,
        "@typescript-eslint/ban-ts-comment": warn,
        "@typescript-eslint/no-use-before-define": warn,
        "@typescript-eslint/naming-convention": "off",
        "import/no-named-as-default": warn,
        "max-classes-per-file": "off",
      },
    },
    {
      files: ["**/*.jsx", "**/*.tsx"],
      rules: {
        "react-redux/mapDispatchToProps-returns-object": "off",
        "react-redux/connect-prefer-named-arguments": warn,
        "react/display-name": "off",
        "react/jsx-curly-brace-presence": "off",
        "react/require-default-props": "off",
        // 1500 warning
        "react/destructuring-assignment": warn,
        "react/forbid-prop-types": "off",
        "react/prefer-stateless-function": warn,
        "react/no-unused-state": warn,
        "class-methods-use-this": warn,
        "react/sort-comp": warn,
        "react/jsx-no-bind": warn,
        "no-nested-ternary": warn,
        "prefer-destructuring": warn,
        "react/default-props-match-prop-types": warn,
        "react/no-unused-prop-types": warn,
        radix: warn,
        "jsx-a11y/click-events-have-key-events": "off",
        "jsx-a11y/no-noninteractive-element-interactions": "off",
        "jsx-a11y/alt-text": "off",
        "jsx-a11y/no-static-element-interactions": "off",
        "react/prop-types": "off",
        "react-hooks/rules-of-hooks": "error",
        "react/jsx-filename-extension": [1, { extensions: [".tsx", ".jsx"] }],
        "react/jsx-props-no-spreading": warn,
        "react/jsx-fragments": warn,
        "@typescript-eslint/naming-convention": "off",
        "react/static-property-placement": warn,
      },
    },
    {
      files: ["**/*.test.js", "**/*.test.ts", "**/*.test.tsx"],
      rules: {
        "react/jsx-filename-extension": "off",
        "no-console": "off",
        "no-empty-pattern": "off",
        "react/jsx-props-no-spreading": warn,
      },
    },
    {
      files: ["**/*.js"],
      rules: {
        "import/no-named-as-default": warn,
      },
    },
  ],
  root: true,

  plugins: ["react", "react-hooks", "jest", "react-redux", "@typescript-eslint", "prettier"],
  parserOptions: {
    project: "./**/tsconfig.json",
  },
};
