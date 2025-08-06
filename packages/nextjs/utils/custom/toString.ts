export function toString(obj: any): string {
  return JSON.stringify(obj, (_, value) => (typeof value === "bigint" ? { __bigint__: value.toString() } : value));
}
