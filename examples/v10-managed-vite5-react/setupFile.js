import '@testing-library/jest-dom'
import { setProjectAnnotations } from '@storybook/react';
import * as globalStorybookConfig from './.storybook/preview.js';

setProjectAnnotations(globalStorybookConfig);
