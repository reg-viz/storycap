import { PhaseIdentity } from '../../constants';
import Env from '../Env';

describe('Env', () => {
  it('Should be get environment variables', () => {
    let env: Env;

    env = new Env('react', '?');
    expect(env.getStorybookEnv()).toBe('react');
    expect(env.getPhase()).toBe('');
    expect(env.getKind()).toBe('');
    expect(env.getStory()).toBe('');

    env = new Env('angular', `?${PhaseIdentity}=foo&selectKind=kind&selectStory=story`);
    expect(env.getStorybookEnv()).toBe('angular');
    expect(env.getPhase()).toBe('foo');
    expect(env.getKind()).toBe('kind');
    expect(env.getStory()).toBe('story');
  });
});
