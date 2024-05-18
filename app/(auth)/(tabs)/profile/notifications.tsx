import React from "react";
import { padding } from "@/constants/values";
import MenuTitle from "@/components/menu/MenuTitle";
import MenuWrapper from "@/components/menu/MenuWrapper";
import MenuButton from "@/components/menu/MenuButton";
import { View } from "@/components/Themed";

export default function notifications() {
  return (
    <View
      style={{
        flex: 1,
        padding: padding,
      }}
    >
      <MenuTitle title="Social" />
      <MenuWrapper>
        <MenuButton
          title="Likes"
          type="switch"
        />
        <MenuButton
          title="Commentaires"
          type="switch"
        />
        <MenuButton
          title="Abonnements"
          type="switch"
        />
        <MenuButton
          title="Personnes ayant rejoint votre voyage"
          type="switch"
        />
      </MenuWrapper>
    </View>
  );
}
