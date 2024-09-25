export function findMapStyle(theme: "light" | "dark") {
  const mapStyles = {
    dark: "mapbox://styles/dorianfanet/cm1avou9o02ff01o3alp8gd9t",
    light: "mapbox://styles/mapbox/streets-v12",
  };

  return mapStyles[theme];
}
