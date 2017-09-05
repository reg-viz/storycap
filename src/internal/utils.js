import sanitize from 'sanitize-filename';

export const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

export const identity = v => v;

export const parseInteger = v => parseInt(v, 10);

export const parseList = v => (
  v ? v.split(',').map(o => o.trim()) : null
);

export const parseRegExp = v => (
  v ? new RegExp(v) : null
);

export const filenamify = filename => (
  sanitize(filename).replace(/\s/g, '-')
);

export const viewport2string = viewport => ([
  `${viewport.width}x${viewport.height}`,
  `${viewport.isMobile ? '-mobile' : ''}`,
  `${viewport.hasTouch ? '-touch' : ''}`,
  `${viewport.isLandscape ? '-landscape' : ''}`,
  `${viewport.deviceScaleFactor > 1 ? `@${viewport.deviceScaleFactor}x` : ''}`,
].join(''));

export const story2filename = (kind, story, viewport = null) => (
  `${filenamify(`${kind}-${story}${viewport ? `-${viewport2string(viewport)}` : ''}`)}.png`
);

export const pascalize = v => (
  `${v.charAt(0).toUpperCase()}${v.slice(1)}`.replace(/[-_](.)/g, (m, g) => (
    g.toUpperCase()
  ))
);
