export function sleep(time: number = 0) {
  return new Promise(res => {
    setTimeout(() => res(), time);
  });
}
