import { configure, addDecorator } from '@storybook/react';
import { withScreenshot, initScreenshot } from '../../../lib/';

const req = require.context('../src', true, /\.stories\.tsx/);

addDecorator(initScreenshot())
// addDecorator(withScreenshot({
//   namespace: 'global'
// }));

configure(() => {
  req.keys().forEach(filename => req(filename));
}, module);
