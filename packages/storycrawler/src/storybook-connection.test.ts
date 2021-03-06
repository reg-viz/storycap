import { StorybookConnection } from './storybook-connection';

describe(StorybookConnection, () => {
  describe(StorybookConnection.spawnCmd, () => {
    it('should spawn child process', async () => {
      const out = await new Promise(res => {
        const proc = StorybookConnection.spawnCmd('npm --version');
        proc.stdout!.once('data', (data: Buffer) => res(data.toString('utf8')));
      });
      expect(out).toBeTruthy();
    });
  });
});
