import * as qs from 'query-string';
import { PhaseIdentity } from '../constants';
import { StorybookEnv } from '../../models/storybook';

export default class Env {
  private storybookEnv: StorybookEnv;
  private phase: string | undefined;
  private kind: string | undefined;
  private story: string | undefined;

  constructor(storybookEnv: StorybookEnv, queryString: string) {
    this.storybookEnv = storybookEnv;

    const query = qs.parse(queryString);
    this.phase = query[PhaseIdentity];
    this.kind = query.selectKind;
    this.story = query.selectStory;
  }

  public getStorybookEnv() {
    return this.storybookEnv || 'react';
  }

  public getPhase() {
    return this.phase || '';
  }

  public getKind() {
    return this.kind || '';
  }

  public getStory() {
    return this.story || '';
  }
}
