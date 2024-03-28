import MyButton from './MyButton';

export default {
  title: 'MyButton',
  component: MyButton,
};

export const Normal = {
  parameters: {
    screenshot: {
      variants: {
        hovered: {
          extends: ['LARGE', 'SMALL'],
          hover: '.my-button',
        },
        focused: {
          extends: ['LARGE', 'SMALL'],
          focus: '.my-button',
        },
      },
    },
  },
};
