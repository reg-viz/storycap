import { StoryKind } from "@storybook/addons";

export const noopDecorator = () => (storyFn: Function, ctx: StoryKind | undefined) =>
  ctx != null ? storyFn(ctx) : storyFn;
