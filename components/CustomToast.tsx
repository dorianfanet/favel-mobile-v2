import { View } from "react-native";
import { BlurView, Text } from "./Themed";
import { TripEdit } from "@/types/types";
import { padding } from "@/constants/values";
import TripEditCard from "@/app/(auth)/trip-old/components/TripEditCard";

type Props = {
  tripEdit: TripEdit;
};

export default function CustomToast({ props }: { props: Props }) {
  console.log("CustomToast", props.tripEdit);

  return (
    <View
      style={{
        width: "100%",
        paddingHorizontal: padding,
      }}
    >
      <BlurView
        style={{
          flex: 1,
        }}
      >
        <TripEditCard tripEdit={props.tripEdit} />
      </BlurView>
    </View>
  );
}
