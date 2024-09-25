import Icon from "@/components/Icon";
import { BackgroundView, Text, View } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { padding } from "@/constants/values";
import { Image } from "expo-image";
import { useColorScheme } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import TripList from "./TripList";

export default function Layout() {
  const inset = useSafeAreaInsets();
  const theme = useColorScheme();

  return (
    <View
      background="primary"
      style={{
        flex: 1,
      }}
    >
      <View
        style={{
          paddingTop: inset.top,
          width: "100%",
        }}
      >
        <View
          style={{
            padding: padding,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: 15,
            }}
          >
            <Image
              source={require("../../assets/images/california.webp")}
              style={{
                width: 45,
                height: 45,
                borderRadius: 30,
              }}
            />
            <Text fontStyle="subtitle">
              <Text
                fontStyle="subtitle"
                style={
                  {
                    // fontFamily: "Outfit_500Medium",
                  }
                }
              >
                {"Hi, "}
              </Text>
              Paul
            </Text>
          </View>
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 10,
            }}
          >
            <Text
              fontStyle="subtitle"
              style={{
                color: Colors[theme || "light"].accent,
              }}
            >
              New trip
            </Text>
            <View
              style={{
                width: 30,
                height: 30,
                borderRadius: 15,
                backgroundColor: Colors[theme || "light"].accent,
                shadowColor: Colors[theme || "light"].accent,
                shadowOffset: {
                  width: 0,
                  height: 0,
                },
                shadowOpacity: 0.5,
                shadowRadius: 10,
                elevation: 20,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Icon
                icon="plusIcon"
                size={12}
                strokeWidth={5}
                color={Colors[theme || "light"].background.primary}
              />
            </View>
          </TouchableOpacity>
        </View>
      </View>
      <TripList />
    </View>
  );
}

// import { BackgroundView, Text, useThemeColor } from "@/components/Themed";
// import MapboxGL from "@rnmapbox/maps";
// import MaskedView from "@react-native-masked-view/masked-view";
// import { LinearGradient } from "expo-linear-gradient";
// import { Dimensions, Touchable, View } from "react-native";
// import Animated, {
//   Easing,
//   useAnimatedStyle,
//   useSharedValue,
//   withTiming,
// } from "react-native-reanimated";
// import { TouchableOpacity } from "react-native-gesture-handler";

// MapboxGL.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_KEY!);

// const dimensions = Dimensions.get("window");

// export default function Layout() {
//   const height = useSharedValue(150);

//   const animatedStyle = useAnimatedStyle(() => {
//     return {
//       height: withTiming(height.value, {
//         duration: 300,
//         easing: Easing.inOut(Easing.poly(4)),
//       }),
//     };
//   });

//   const mapStyle = useThemeColor({
//     dark: "mapbox://styles/dorianfanet/cm1avou9o02ff01o3alp8gd9t",
//     light: "mapbox://styles/mapbox/streets-v12",
//   });

//   return (
//     <MapboxGL.MapView
//       style={{
//         flex: 1,
//       }}
//       scaleBarEnabled={false}
//       attributionEnabled={false}
//       logoEnabled={false}
//       // styleURL="mapbox://styles/dorianfanet/clzfqoo7100do01qr9bad7vtk"
//       styleURL={mapStyle}
//       rotateEnabled={false}
//       pitchEnabled={false}
//       projection="globe"
//     >
//       {/* <Animated.View
//         style={[
//           {

//             height: 500,
//           },
//           // animatedStyle,
//         ]}
//       > */}
//       <MaskedView
//         style={{
//           width: "100%",
//           position: "absolute",
//           top: 0,
//           height: "100%",
//           pointerEvents: "box-none",
//         }}
// maskElement={
//   <Animated.View
//     style={[
//       {
//         width: "100%",
//         height: 200,
//         pointerEvents: "none",
//       },
//       animatedStyle,
//     ]}
//   >
//     <LinearGradient
//       colors={["black", "rgba(0,0,0,.95)", "transparent"]}
//       locations={[0, 0.6, 1]}
//       style={{ flex: 1, pointerEvents: "none" }}
//     />
//   </Animated.View>
// }
//       >
//         <BackgroundView
//           style={{
//             flex: 1,
//             alignItems: "center",
//             pointerEvents: "box-none",
//           }}
//         >
//           <Animated.View
//             style={[
//               {
//                 width: "100%",
//                 justifyContent: "flex-start",
//                 alignItems: "center",
//                 pointerEvents: "box-none",
//               },
//               animatedStyle,
//             ]}
//           >
//             <View
//               style={{
//                 width: "100%",
//                 height: "60%",
//                 justifyContent: "center",
//               }}
//             >
//               <TouchableOpacity
//                 style={{
//                   padding: 10,
//                   borderRadius: 5,
//                 }}
//                 onPress={() => {
//                   height.value = height.value === 150 ? 900 : 150;
//                 }}
//               >
//                 <Text fontStyle="subtitle">Hello</Text>
//               </TouchableOpacity>
//             </View>
//           </Animated.View>
//         </BackgroundView>
//       </MaskedView>
//       <MapboxGL.ShapeSource
//         id="markers"
//         shape={{
//           type: "FeatureCollection",
//           features: [
//             {
//               type: "Feature",
//               properties: {},
//               geometry: {
//                 type: "Point",
//                 coordinates: [-122.4865085827623, 37.771412755304016],
//               },
//             },
//           ],
//         }}
//       >
//         <MapboxGL.SymbolLayer
//           id="marker"
//           style={{
//             iconImage: "harbor",
//             iconAllowOverlap: false,
//             textField: "Golden Gate Park",
//             textAnchor: "left",
//             textOffset: [2, 0],
//             iconSize: 5,
//             iconOpacity: 1,
//           }}
//         />
//       </MapboxGL.ShapeSource>
//       {/* </Animated.View> */}
//     </MapboxGL.MapView>
//   );
// }
