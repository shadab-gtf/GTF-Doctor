export function lineOf(source: string, pattern: RegExp): number {
  const match = pattern.exec(source);
  if (!match?.index) {
    return 1;
  }
  return source.slice(0, match.index).split(/\r?\n/).length;
}
