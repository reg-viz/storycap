import lerna from '../lerna.json' with { type: 'json' };
const { version } = lerna;
const hit = version.match(/-(.+)\.\d+$/);
console.log(hit ? 'next' : 'latest');
