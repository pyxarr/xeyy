import type { StorybookConfig } from '@storybook/react-vite';

import { dirname } from 'path';
import { fileURLToPath } from 'url';
import path from 'node:path';
import stylex from '@stylexjs/unplugin';

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string) {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}

const config: StorybookConfig = {
  stories: [
    // '../src/**/*.mdx',
    '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],

  addons: [
    getAbsolutePath('@chromatic-com/storybook'),
    getAbsolutePath('@storybook/addon-vitest'),
    getAbsolutePath('@storybook/addon-a11y'),
    getAbsolutePath('@storybook/addon-docs'),
  ],

  framework: getAbsolutePath('@storybook/react-vite'),

  core: {
    disableTelemetry: true,
  },

  viteFinal: async (config) => {
    config.plugins = config.plugins ?? [];

    config.plugins.push(
      stylex.vite({
        aliases: {
          '@xeyy/tokens': path.resolve(
            dirname(fileURLToPath(import.meta.url)),
            '../../packages/tokens/src/tokens.stylex.ts',
          ),
        },

        unstable_moduleResolution: {
          type: 'commonJS',
          rootDir: path.resolve(
            dirname(fileURLToPath(import.meta.url)),
            '../../',
          ),
        },
      } as any),
    );

    return config;
  },
};

export default config;
