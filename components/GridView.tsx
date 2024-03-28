import { View, Text, StyleSheet, DimensionValue } from "react-native";
import React from "react";

export default function GridView({
  data,
  col = 2,
  renderItem,
}: {
  data: any;
  col?: number;
  renderItem: any;
}) {
  return (
    <View style={styles.container}>
      {data.map((item: any, index: number) => {
        return (
          <View
            key={index}
            style={{ width: (100 / col + "%") as DimensionValue }}
          >
            <View style={{ padding: 5 }}>{renderItem(item)}</View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%", flexDirection: "row", flexWrap: "wrap" },
});
