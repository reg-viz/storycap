import { Story } from '../../models/story';

export const noopDecorator = () => (storyFn: Function, ctx: Story | undefined) =>
  ctx != null ? storyFn(ctx) : storyFn;
