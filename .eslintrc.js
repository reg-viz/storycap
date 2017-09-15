module.exports = {
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  parser: 'babel-eslint',
  extends: 'airbnb',
  rules: {
    'react/jsx-filename-extension': 'off',
    'jsx-a11y/href-no-hash': 'off',
  },
};
