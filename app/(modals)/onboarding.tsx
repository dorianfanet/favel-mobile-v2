import { View, Text } from "react-native";
import React, { useEffect } from "react";
import Colors from "@/constants/Colors";
import { MMKV } from "../_layout";
// import { VideoView, useVideoPlayer } from "expo-video";

const videoSource =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

export default function onboarding() {
  useEffect(() => {
    MMKV.setStringAsync("onboardingSeen", "true");
  }, []);

  // const player = useVideoPlayer(videoSource, (player) => {
  //   player.loop = true;
  //   player.play();
  // });

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.light.accent,
      }}
    >
      {/* <VideoView
        player={player}
        style={{
          flex: 1,
        }}
      /> */}
    </View>
  );
}
