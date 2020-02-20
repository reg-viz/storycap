import { StorybookConnection } from './storybook-connection';
describe(StorybookConnection, () => {
  describe(StorybookConnection.prototype.connect, () => {
    it('should spawn child process', async () => {
      const c = new StorybookConnection({
        serverCmd: './node_modules/.bin/http-server -p 8080',
        storybookUrl: 'http://localhost:8080',
      });
      await c.connect();
      expect(c.status).toBe('CONNECTED');
      await c.disconnect();
    });
  });
});
