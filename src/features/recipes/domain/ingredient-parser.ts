const separators = /[\n,;|]+/g;

export function parseIngredients(value: string): string[] {
  return value
    .split(separators)
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
    .filter((item, index, allItems) => allItems.indexOf(item) === index);
}
