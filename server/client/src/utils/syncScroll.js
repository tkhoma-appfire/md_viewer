export function syncScrollPosition(source, target) {
  if (!source || !target) return;
  const sourceMax = source.scrollHeight - source.clientHeight;
  const targetMax = target.scrollHeight - target.clientHeight;
  if (sourceMax <= 0 || targetMax <= 0) {
    target.scrollTop = 0;
    return;
  }
  const ratio = source.scrollTop / sourceMax;
  target.scrollTop = ratio * targetMax;
}
