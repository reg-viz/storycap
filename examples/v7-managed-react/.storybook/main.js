module.exports = {
  stories: ['../src/**/*.stories.@(js|jsx|mdx)'],
  addons: ['@storybook/addon-actions', '@storybook/addon-links', 'storycap', '@storybook/addon-mdx-gfm'],
  framework: {
    name: '@storybook/react-webpack5',
    options: {}
  },
  docs: {
    autodocs: true
  }
};