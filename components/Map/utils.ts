export function findMapStyle(theme: "light" | "dark") {
  const mapStyles = {
    // dark: "mapbox://styles/dorianfanet/cm1avou9o02ff01o3alp8gd9t",
    dark: "mapbox://styles/dorianfanet/cm299zpjv00ju01pi2m9ld23o",
    light: "mapbox://styles/dorianfanet/cm2c2z61w00tg01pbhgaabuw7",
    // light: "mapbox://styles/dorianfanet/cm2c2wkdp00sk01pg0g27axj4",
    // light: "mapbox://styles/mapbox/streets-v12",
  };

  return mapStyles[theme];
}
