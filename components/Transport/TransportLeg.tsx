import useTheme from "@/hooks/useTheme";
import { TransportSection } from "@/types/transport";
import { Text, View } from "../Themed";
import { padding, transportSidebarStyle } from "@/constants/values";
import Colors from "@/constants/Colors";
import { SidebarStyle } from ".";
import React from "react";
import Icon from "../Icon";
import DotColumn from "../DotColumn";
import { formatSeconds } from "@/utils/time";
import MaskedView from "@react-native-masked-view/masked-view";
import TransparentRing from "../TransparentRing";

type TransportLegProps = {
  leg: TransportSection;
  isFirst?: boolean;
  isLast?: boolean;
};

const minSectionHeight = 140;

function TransportLeg({ leg, isFirst, isLast }: TransportLegProps) {
  const { theme } = useTheme();

  return (
    <View
      style={{
        gap: 10,
      }}
    >
      {isFirst ? <StartEndPoint /> : null}
      <LegDetails
        leg={leg}
        isFirst={isFirst}
        isLast={isLast}
      />
      {isLast ? <StartEndPoint /> : null}
    </View>
  );
}

type LegDetailsProps = {
  leg: TransportSection;
  isFirst?: boolean;
  isLast?: boolean;
};

function LegDetails({ leg, isFirst, isLast }: LegDetailsProps) {
  const { theme } = useTheme();

  switch (leg.mode) {
    case "pedestrian":
      return (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            height: 120,
            marginBottom: isLast ? -10 : 0,
            marginTop: isFirst ? -10 : 0,
          }}
        >
          <View
            style={[
              transportSidebarStyle,
              {
                gap: 5,
              },
            ]}
          >
            <DotColumn />
            <Icon
              icon="pedestrianIcon"
              size={22}
              strokeWidth={2}
              color={Colors[theme].accent}
            />
            <DotColumn />
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-end",
              gap: 5,
            }}
          >
            <Text fontStyle="body">Walk</Text>
            <Text fontStyle="body">{`${
              formatSeconds(leg.duration).minutes
            } min`}</Text>
            <Text>{leg.length ? `(${leg.length} m)` : null}</Text>
          </View>
        </View>
      );
    case "kickScooter":
      return (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            height: 160,
          }}
        >
          <View style={transportSidebarStyle}>
            <MaskedView
              maskElement={
                <View
                  style={{
                    width: 16,
                    height: "100%",
                    borderRadius: 14,
                    justifyContent: "space-between",
                    alignItems: "center",
                    // backgroundColor: "black",
                  }}
                >
                  <TransparentRing
                    size={16}
                    strokeWidth={3}
                    color="black"
                  />
                  <View
                    style={{
                      flex: 1,
                      width: 16,
                      backgroundColor: "black",
                    }}
                  />
                  <TransparentRing
                    size={16}
                    strokeWidth={3}
                    color="black"
                  />
                </View>
              }
            >
              <View
                style={{
                  width: 16,
                  height: "100%",
                  borderRadius: 14,
                  backgroundColor: leg.color ? leg.color : Colors[theme].accent,
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingVertical: 4,
                }}
              />
            </MaskedView>
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 14,
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: Colors[theme].background.primary,
                }}
              >
                <Icon
                  icon="kickScooterIcon"
                  size={22}
                  strokeWidth={2}
                  color={leg.color ? leg.color : Colors[theme].accent}
                />
              </View>
            </View>
          </View>
          <View
            style={{
              justifyContent: "space-between",
              height: "100%",
            }}
          >
            <Text fontStyle="subtitle">Electric Scooter Station</Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-end",
                gap: 5,
              }}
            >
              <Text fontStyle="body">Ride</Text>
              <Text fontStyle="body">{`${
                formatSeconds(leg.duration).minutes
              } min`}</Text>
              <Text>{leg.length ? `(${leg.length} m)` : null}</Text>
            </View>
            <Text fontStyle="subtitle">Electric Scooter Station</Text>
          </View>
        </View>
      );
    default:
      return null;
  }
}

type StartEndPointProps = {};

function StartEndPoint({}: StartEndPointProps) {
  const { theme } = useTheme();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <View style={transportSidebarStyle}>
        <View
          style={{
            width: 14,
            height: 14,
            borderRadius: 14,
            backgroundColor: Colors[theme].accent,
          }}
        />
      </View>
      <Text fontStyle="subtitle">The Metro Hotel</Text>
    </View>
  );
}

export default React.memo(TransportLeg);
