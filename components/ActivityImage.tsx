import { View, Text } from "react-native";
import React, { useState } from "react";
import { Image, ImageProps } from "expo-image";
import { favelClient } from "@/lib/favelApi";
import { useAuth } from "@clerk/clerk-expo";

interface ActivityImageProps extends ImageProps {
  placeId: string;
  id: string;
}

const ActivityImage: React.FC<ActivityImageProps> = ({
  source,
  placeId,
  id,
  ...props
}) => {
  const [currentSource, setCurrentSource] = useState(source);
  const [imageKey, setImageKey] = useState(0);

  const { getToken } = useAuth();

  const handleError = async () => {
    try {
      // const result = await favel.updateImage(placeId, id);
      await favelClient(getToken).then(async (favel) => {
        const result = await favel.updateImage(placeId, id);

        if (result.result === "ok") {
          setImageKey((prevKey) => prevKey + 1);
        } else {
          setCurrentSource(require("@/assets/images/no-image.png"));
        }
      });
    } catch (error) {
      console.error("Error in generating new image", error);
    }
  };

  return (
    <Image
      key={imageKey}
      source={currentSource}
      onError={handleError}
      {...props}
      cachePolicy={"disk"}
    />
  );
};

export default ActivityImage;
