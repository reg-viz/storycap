import * as qs from 'query-string';
import { StorybookEnv } from '../../models/storybook';
import { PhaseIdentity } from '../constants';

export class Env {
  private storybookEnv: StorybookEnv;
  private phase: string | undefined;
  private kind: string | undefined;
  private story: string | undefined;

  public constructor(storybookEnv: StorybookEnv, queryString: string) {
    this.storybookEnv = storybookEnv;

    const query = qs.parse(queryString);
    this.phase = query[PhaseIdentity];
    this.kind = query.selectKind;
    this.story = query.selectStory;
  }

  public getStorybookEnv() {
    return this.storybookEnv != null ? this.storybookEnv : 'react';
  }

  public getPhase() {
    return this.phase != null ? this.phase : '';
  }

  public getKind() {
    return this.kind != null ? this.kind : '';
  }

  public getStory() {
    return this.story != null ? this.story : '';
  }
}
