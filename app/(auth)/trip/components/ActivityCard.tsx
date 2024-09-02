import React from "react";
import { Activity } from "@/types/types";
import RouteCard from "./RouteCard";
import PlaceCard from "./PlaceCard";
import { useEditor } from "@/context/editorContext";

export default function ActivityCard({
  activity,
  drag,
  isActive,
  style,
  loading,
  onDelete,
  swipeable,
  theme = "dark",
  draggable,
  noCache,
  highlighted,
}: {
  activity: Activity;
  drag?: any;
  isActive?: boolean;
  style?: any;
  loading?: boolean;
  onDelete?: () => void;
  swipeable?: boolean;
  theme?: "light" | "dark";
  draggable?: boolean;
  noCache?: boolean;
  highlighted?: boolean;
}) {
  const { editor, setEditor } = useEditor();

  console.log("setEditorInComp", setEditor);

  return activity.route ? (
    <RouteCard
      route={activity.route}
      style={
        loading
          ? {
              padding: 10,
              marginVertical: 5,
              paddingHorizontal: 10,
              marginHorizontal: 10,
              backgroundColor: "transparent",
            }
          : {}
      }
    />
  ) : (
    <PlaceCard
      activity={activity}
      drag={drag}
      isActive={isActive}
      style={style}
      theme={theme}
      draggable={draggable}
      noCache={noCache}
      swipeable={swipeable}
      onDelete={onDelete}
      highlighted={highlighted}
    />
  );
}
