const { version } = require('../lerna.json');
const hit = version.match(/-(.+)\.\d+$/);
console.log(hit ? 'next' : 'latest');
