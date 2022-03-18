export type StorybookVersion = 'v5';

export type V5Story = {
  id: string;
  kind: string;
  story: string;
  version: 'v5';
};

/**
 *
 * Represents a story object
 *
 **/
export type Story = V5Story;
