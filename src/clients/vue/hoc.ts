// FIXME:
// As you can see, we are using any, so type definition is not performed properly.
// How is it to be better to solve it?
/* tslint:disable: no-any */
export const hoc = (component: any, wrap: any): any => ({
  ...wrap,
  render(h: any, context: any): any {
    const self: any = this;

    return h(
      component,
      {
        attrs: self.$attrs,
        props: self.$props,
        on: self.$listeners,
        scopedSlots: self.$scopedSlots
      },
      self.$slots
    );
  }
});
