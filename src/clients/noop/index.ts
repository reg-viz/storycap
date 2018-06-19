import { Story } from '../../models/story';

export function noopDecorator() {
  return (storyFn: Function, ctx: Story | undefined) => ctx ? storyFn(ctx) : storyFn;
}
