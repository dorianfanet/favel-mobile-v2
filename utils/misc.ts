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

export function darkenHexColor(hex: string, percent: number) {
  // Remove the # if present
  hex = hex.replace(/^#/, "");

  // Convert hex to RGB
  let r = parseInt(hex.substr(0, 2), 16);
  let g = parseInt(hex.substr(2, 2), 16);
  let b = parseInt(hex.substr(4, 2), 16);

  // Darken
  r = Math.floor(r * (1 - percent));
  g = Math.floor(g * (1 - percent));
  b = Math.floor(b * (1 - percent));

  // Convert back to hex
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

export function lightenHexColor(hex: string, percent: number) {
  // Remove the # if present
  hex = hex.replace(/^#/, "");

  // Convert hex to RGB
  let r = parseInt(hex.substr(0, 2), 16);
  let g = parseInt(hex.substr(2, 2), 16);
  let b = parseInt(hex.substr(4, 2), 16);

  // Lighten
  r = Math.floor(r * (1 + percent));
  g = Math.floor(g * (1 + percent));
  b = Math.floor(b * (1 + percent));

  // Convert back to hex
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
