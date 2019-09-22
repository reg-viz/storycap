import addoons from "@storybook/addons";
import { ExposedWindow } from "../node/types";

(window as any).__STORYCAP_MANAGED_MODE_REGISTERED__ = true;

addoons.register("storycap", () => {
  addoons.getChannel().once("setStories", e => {
    (window as ExposedWindow).stories = e.stories;
  });
});
