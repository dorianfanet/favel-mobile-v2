type SnakeToCamelCase<T> = T extends object
  ? {
      [K in keyof T as K extends string
        ? SnakeToCamelCaseString<K>
        : K]: SnakeToCamelCase<T[K]>;
    }
  : T;

type SnakeToCamelCaseString<S extends string> =
  S extends `${infer T}_${infer U}`
    ? `${T}${Capitalize<SnakeToCamelCaseString<U>>}`
    : S;

function snakeToCamelCase<T>(obj: T): SnakeToCamelCase<T> {
  if (typeof obj !== "object" || obj === null) {
    return obj as SnakeToCamelCase<T>;
  }

  if (Array.isArray(obj)) {
    return obj.map(snakeToCamelCase) as SnakeToCamelCase<T>;
  }

  const entries = Object.entries(obj).map(([key, value]) => [
    key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase()),
    snakeToCamelCase(value),
  ]);

  return Object.fromEntries(entries) as SnakeToCamelCase<T>;
}
