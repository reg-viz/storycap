import sanitize from 'sanitize-filename';

export const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

export const identity = v => v;

export const parseInteger = v => parseInt(v, 10);

export const parseList = v => (
  v ? v.split(',').map(o => o.trim()) : null
);

export const filenamify = filename => (
  sanitize(filename).replace(/\s/g, '-')
);

export const pascalize = v => (
  `${v.charAt(0).toUpperCase()}${v.slice(1)}`.replace(/[-_](.)/g, (m, g) => (
    g.toUpperCase()
  ))
);
