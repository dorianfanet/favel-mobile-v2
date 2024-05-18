import { View, Text } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import Markdown from "react-native-markdown-display";

export default function TypewriterMardown({
  text,
  typingDelay = 10,
  batchSize = 5,
}: {
  text: string;
  typingDelay?: number;
  batchSize?: number;
}) {
  const [displayedText, setDisplayedText] = useState("");
  const alreadyTyped = useRef(false);

  useEffect(() => {
    console.log(alreadyTyped.current);
    if (alreadyTyped.current) {
      return;
    }
    alreadyTyped.current = true;
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
  }, [text, typingDelay]);

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
