import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(pkgName) {
  const dirName = `/${pkgName}/`;
  let pkgPath = require.resolve(pkgName);
  const dirIndex = pkgPath.lastIndexOf(dirName);
  pkgPath = pkgPath.substring(0, dirIndex + dirName.length - 1);
  return pkgPath;
}

/** @type { import('@storybook/react-vite').StorybookConfig } */
const config = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    getAbsolutePath('@storybook/addon-links'),
    getAbsolutePath('storycap'),
  ],
  framework: {
    name: getAbsolutePath('@storybook/react-vite'),
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
};
export default config;
