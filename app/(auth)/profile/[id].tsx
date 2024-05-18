import { StatusBar } from "react-native";
import React, { useEffect } from "react";
import { useLocalSearchParams } from "expo-router";
import Profile from "./Profile";

export default function Index() {
  const { id } = useLocalSearchParams();
  const userId = id as string;

  useEffect(() => {
    StatusBar.setBarStyle("light-content");
  });

  return (
    <Profile
      key={userId}
      userId={userId}
    />
  );
}
