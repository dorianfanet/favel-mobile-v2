import { View, Text } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import Markdown from "react-native-markdown-display";

export default function TypewriterMardown({
  text,
  typingDelay = 10,
  batchSize = 5,
  shouldAnimate = true,
}: {
  text: string;
  typingDelay?: number;
  batchSize?: number;
  shouldAnimate: boolean;
}) {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    if (!shouldAnimate) {
      setDisplayedText(text);
      return;
    }
    setDisplayedText("");
    let index = 0;
    const timer = setInterval(() => {
      setDisplayedText((prev) => prev + text.slice(index, index + batchSize));
      index += batchSize;
      if (index >= text.length) {
        clearInterval(timer);
      }
    }, typingDelay);

    return () => clearInterval(timer);
  }, []);

  return (
    <View>
      <Markdown
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
        {displayedText}
      </Markdown>
    </View>
  );
}
