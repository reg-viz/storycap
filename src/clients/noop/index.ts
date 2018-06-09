export function noopDecorator() {
  return (story: Function) => story;
}
