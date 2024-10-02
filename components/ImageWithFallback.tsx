import { View, Text } from "react-native";
import React, { useState } from "react";
import { Image, ImageProps } from "expo-image";

interface ImageWithFallbackProps extends ImageProps {
  fallbackSource?: ImageProps["source"];
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  source,
  fallbackSource = require("../assets/images/no-image.png"),
  ...props
}) => {
  const [currentSource, setCurrentSource] = useState(source);

  const handleError = () => {
    setCurrentSource(fallbackSource);
  };

  return (
    <Image
      source={currentSource}
      onError={handleError}
      {...props}
      cachePolicy={"disk"}
    />
  );
};

export default ImageWithFallback;
