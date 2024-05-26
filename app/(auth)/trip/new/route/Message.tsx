import { ActivityIndicator, View } from "react-native";
import React, { useEffect, useState } from "react";
import { BlurView, Text } from "@/components/Themed";
import { ChatMessage, Hotspot } from "@/types/types";
import Markdown from "react-native-markdown-display";
import ContainedButton from "@/components/ContainedButton";
import TypewriterMardown from "@/components/TypewriterMardown";
import ImageWithFallback from "@/components/ImageWithFallback";
import Colors from "@/constants/Colors";
import { borderRadius } from "@/constants/values";
import Icon from "@/components/Icon";
import { ScrollView } from "react-native-gesture-handler";

export default function Message({
  message,
  index,
  onRetry,
  isLast,
}: {
  message: ChatMessage;
  index: number;
  onRetry: () => void;
  isLast: boolean;
}) {
  // log first two words of message
  console.log(message.content.split(" ").slice(0, 2).join(" "), isLast);

  return (
    <View
      style={{
        padding: 20,
      }}
    >
      <Text
        style={{
          fontSize: 18,
          fontFamily: "Outfit_600SemiBold",
          color: "white",
          marginBottom: 10,
        }}
      >
        {message.role === "assistant" ? "Favel" : "Vous"}
      </Text>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
        }}
      >
        {message.status === "running" ? (
          <ActivityIndicator
            size="small"
            color="white"
          />
        ) : null}
        {message.status === "finished" && message.role === "assistant" ? (
          <TypewriterMardown
            key={message.id}
            text={message.content}
            shouldAnimate={isLast}
          />
        ) : (
          <Text
            style={{
              fontSize: 16,
              fontFamily: "Outfit_400Regular",
              color: "white",
            }}
          >
            {message.content}
          </Text>
        )}
        {/* <Markdown
          style={{
            body: {
              fontSize: 16,
              fontFamily: "Outfit_400Regular",
              color: "white",
            },
            strong: {
              fontSize: 18,
              fontFamily: "Outfit_700Bold",
              color: "white",
            },
          }}
        >
          {message.content}
        </Markdown> */}
      </View>
      <View
        style={{
          flex: 1,
        }}
      >
        <ScrollView
          horizontal
          contentContainerStyle={{
            gap: 20,
          }}
          style={{
            borderRadius: borderRadius,
            // overflow: "hidden",
            marginTop: 10,
          }}
        >
          {message.route
            ? message.route.map((hotspot) => (
                <HotspotCard
                  key={hotspot.id}
                  hotspot={hotspot}
                />
              ))
            : null}
        </ScrollView>
      </View>
      {message.status === "error" ? (
        <ContainedButton
          style={{
            marginTop: 10,
          }}
          title="Réessayer"
          onPress={() => {
            onRetry();
          }}
        />
      ) : null}
    </View>
  );
}

function HotspotCard({ hotspot }: { hotspot: Hotspot }) {
  return (
    <View
      style={[
        {
          // flexDirection: "row",
        },
      ]}
    >
      <View
        style={{
          width: 150,
          height: 150,
          position: "relative",
        }}
      >
        <ImageWithFallback
          key={hotspot.id + "1"}
          style={{ width: "100%", height: "100%", borderRadius: borderRadius }}
          source={{
            uri: `https://storage.googleapis.com/favel-photos/hotspots/${hotspot.id}-700.jpg`,
          }}
          fallbackSource={require("@/assets/images/no-image.png")}
        />
      </View>
      <ImageCard text={hotspot.location} />
      <ImageCard
        text={`${hotspot.duration}  jour${hotspot.duration > 1 ? "s" : ""}`}
        style={{
          top: undefined,
          bottom: 8,
        }}
      />
    </View>
  );
}

export function ImageCard({ text, style }: { text: string; style?: any }) {
  return (
    <BlurView
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          gap: 5,
          position: "absolute",
          top: 8,
          left: 8,
          borderRadius: 5,
          padding: 5,
          paddingHorizontal: 10,
        },
        style,
      ]}
    >
      <Icon
        icon="mapPinIcon"
        size={14}
        color={Colors.dark.primary}
      />
      <Text
        style={{
          color: Colors.dark.primary,
          fontSize: 12,
          fontFamily: "Outfit_600SemiBold",
        }}
      >
        {text}
      </Text>
    </BlurView>
  );
}
