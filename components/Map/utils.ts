export function findMapStyle(theme: "light" | "dark") {
  const mapStyles = {
    dark: "mapbox://styles/dorianfanet/cm299zpjv00ju01pi2m9ld23o",
    light: "mapbox://styles/mapbox/streets-v12",
  };

  return mapStyles[theme];
}
