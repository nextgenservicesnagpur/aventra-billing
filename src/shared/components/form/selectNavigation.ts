type NavigableOption = { label: string; disabled?: boolean };

export const findNextEnabledOption = (
  options: readonly NavigableOption[],
  index: number,
  direction: 1 | -1,
): number => {
  for (let offset = 1; offset <= options.length; offset += 1) {
    const next = ((index + offset * direction) % options.length + options.length) % options.length;
    if (!options[next]?.disabled) return next;
  }
  return -1;
};

export const findOptionByPrefix = (
  options: readonly NavigableOption[],
  prefix: string,
  index: number,
): number => {
  for (let offset = 1; offset <= options.length; offset += 1) {
    const next = (index + offset + options.length) % options.length;
    const option = options[next];
    if (option && !option.disabled && option.label.toLocaleLowerCase().startsWith(prefix.toLocaleLowerCase())) return next;
  }
  return -1;
};
