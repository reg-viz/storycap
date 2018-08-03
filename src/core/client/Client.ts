import { Story, StoryWithOptions } from '../../models/story';
import { API, Channel, Group } from '../../models/storybook';
import { EventTypes, PhaseTypes } from '../constants';
import { Env } from './Env';
import { Gateway } from './Gateway';

export class Client {
  private env: Env;
  private gateway: Gateway;
  private channel: Channel;
  private api: API;

  public constructor(env: Env, gateway: Gateway, channel: Channel, api: API) {
    this.env = env;
    this.gateway = gateway;
    this.channel = channel;
    this.api = api;
  }

  public run() {
    const phase = this.env.getPhase();

    if (phase === '') {
      return;
    }

    try {
      switch (phase) {
        case PhaseTypes.PREPARE:
          this.prepare(); // tslint:disable-line: no-floating-promises

          return;

        case PhaseTypes.CAPTURE:
          this.capture(); // tslint:disable-line: no-floating-promises

          return;

        default:
          throw new Error(`An unknown phase called "${phase}" is being executed.`);
      }
    } catch (e) {
      this.gateway.failure(e);
    }
  }

  private async prepare() {
    const { clientId, clientsCount } = await this.gateway.getMetadata();
    const stories = await this.searchTargetStories(clientId, clientsCount);
    this.gateway.setStories(stories);
  }

  private async capture() {
    this.channel.on(EventTypes.COMPONENT_READY, (story: StoryWithOptions) => {
      if (this.env.getKind() === story.kind && this.env.getStory() === story.story) {
        const frame = <HTMLIFrameElement>document.querySelector('#storybook-preview-iframe');
        const contentDocument = <Document>frame.contentDocument;

        frame.style.width = `${contentDocument.documentElement.scrollWidth}px`;
        frame.style.height = `${contentDocument.documentElement.scrollHeight}px`;

        // and document itself
        document.body.style.height = frame.style.height;

        this.gateway.readyComponent();
      }
    });

    this.api.selectStory(this.env.getKind(), this.env.getStory());
  }

  private searchTargetStories(clientIndex: number, clientsCount: number) {
    return new Promise<StoryWithOptions[]>((resolve, reject) => {
      this.channel.once('setStories', ({ stories }: { stories: Group[] }) => {
        // flatten stories
        const list = stories.reduce(
          (acc, cur) => [
            ...acc,
            ...cur.stories.map((story) => ({
              kind: cur.kind,
              story
            }))
          ],
          <Story[]>[]
        );

        // sequential promises
        // tslint:disable-next-line: no-floating-promises
        list
          .reduce(
            (acc: Promise<StoryWithOptions[] | void>, cur: Story, i: number) =>
              acc
                .then(async (results) => {
                  if (i % (clientsCount !== 0 ? clientsCount : 1) !== clientIndex) {
                    return results;
                  }

                  const res = await this.searchScreenshotWrappersByStory(cur.kind, cur.story);

                  return [...(<StoryWithOptions[]>results), ...res];
                })
                .catch(reject),
            <Promise<StoryWithOptions[]>>Promise.resolve([])
          )
          .then((results: StoryWithOptions[] | void) => {
            resolve(<StoryWithOptions[]>results);
          });

        this.channel.on(EventTypes.COMPONENT_ERROR, reject);
      });
    });
  }

  /**
   * One story can have several usage of withScreenshot.
   * Using the events from teh ScreenshotWrapper we try to know about the wrappers
   * events are firing in this sequence. init, mount
   * If story doesn't have any withScreenshot wrappers, we handle it with FINISH_MOUNT event.
   * initScreenshot decorator must be added before the gloabl withScreenshot,
   * so the mount event of the wrapper element in initScreenshot will be fired after
   * the all mount events of the withScreenthot HOC
   *
   * Why we use 2 kind of events: init and mount?
   * we use 2 events, init and mount, because in this way
   * we can recognize when all wrappers are mounted.
   * Init events always fire before a mount events.
   * so when we handle first mount event we know the total count of the wrappers.
   */
  private searchScreenshotWrappersByStory(kind: string, story: string) {
    const inited: StoryWithOptions[] = [];
    const mounted: StoryWithOptions[] = [];
    const match = (fn: (ctx: StoryWithOptions) => void) => (ctx: StoryWithOptions) => {
      if (ctx.kind === kind && ctx.story === story) {
        fn(ctx);
      }
    };

    return new Promise<StoryWithOptions[]>((resolve) => {
      // tslint:disable: no-use-before-declare
      const onInit = match((ctx) => {
        inited.push(ctx);
      });

      const onMount = match((ctx) => {
        mounted.push(ctx);
        if (mounted.length === inited.length) {
          doResolve(mounted);
        }
      });

      const onFinishMount = match(() => {
        if (inited.length === 0) {
          doResolve([]);
        }
      });

      const doResolve = (stories: StoryWithOptions[]) => {
        this.channel.removeListener(EventTypes.COMPONENT_INIT, onInit);
        this.channel.removeListener(EventTypes.COMPONENT_MOUNT, onMount);
        this.channel.removeListener(EventTypes.COMPONENT_FINISH_MOUNT, onFinishMount);
        resolve(stories);
      };

      this.channel.on(EventTypes.COMPONENT_INIT, onInit);
      this.channel.on(EventTypes.COMPONENT_MOUNT, onMount);
      this.channel.on(EventTypes.COMPONENT_FINISH_MOUNT, onFinishMount);

      this.api.selectStory(kind, story);
      // tslint:enable
    });
  }
}
