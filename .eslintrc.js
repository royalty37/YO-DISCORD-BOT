module.exports = {
  extends: [
    'airbnb-typescript',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'prettier',
  ],
  root: true,
  plugins: ['@typescript-eslint', 'prettier'],
  parserOptions: {
    project: "./tsconfig.json",
  },
};
