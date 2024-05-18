import React, { useEffect, useState } from "react";
import { TouchableOpacity } from "react-native-gesture-handler";
import Colors from "@/constants/Colors";
import { borderRadius } from "@/constants/values";
import { Text } from "./Themed";
import Icon from "./Icon";
import { MMKV } from "@/app/_layout";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { supabaseClient } from "@/lib/supabaseClient";
import { favelClient } from "@/lib/favelApi";

export default function FollowButton({
  profileId,
  onPress,
}: {
  profileId: string;
  onPress?: (value: "1" | "0") => void;
}) {
  const { user } = useUser();
  const [isFollowing, setIsFollowing] = useState(false);

  const { getToken } = useAuth();

  function setFollowing(state: "1" | "0") {
    if (!user) return;
    MMKV.setString(`${user.id}-following-${profileId}`, state);
    setIsFollowing(state === "1" ? true : false);
  }

  useEffect(() => {
    async function checkFollowing() {
      console.log("Checking following");
      if (!user) return;
      const cache = MMKV.getString(`${user.id}-following-${profileId}`);

      if (cache === "1") {
        setIsFollowing(true);
      } else {
        setIsFollowing(false);
      }

      await supabaseClient(getToken).then(async (supabase) => {
        const { data, error } = await supabase!
          .from("follows")
          .select("id")
          .eq("follower_id", user.id)
          .eq("following_id", profileId);

        if (error) {
          console.error(error);
        }

        console.log(data);

        if (data && data.length > 0) {
          setFollowing("1");
        } else {
          setFollowing("0");
        }
      });
    }

    checkFollowing();
  }, []);

  async function handleFollow() {
    if (!user) return;

    if (isFollowing) {
      setFollowing("0");
      supabaseClient(getToken).then(async (supabase) => {
        const { error } = await supabase
          .from("follows")
          .delete()
          .eq("follower_id", user.id)
          .eq("following_id", profileId);

        if (error) {
          console.error(error);
          setFollowing("1");
        }
      });
    } else {
      supabaseClient(getToken).then(async (supabase) => {
        const { error } = await supabase.from("follows").upsert([
          {
            follower_id: user.id,
            following_id: profileId,
            key: `${user.id}-${profileId}`,
          },
        ]);
        if (error) {
          console.log("Error following");
          console.error(error);
          setFollowing("0");
          return;
        }
        setFollowing("1");
        favelClient(getToken).then((favel) => {
          favel.sendNotification(
            profileId,
            "Favel",
            `${user.firstName} vous suit désormais !`,
            null,
            "follow",
            user.id
          );
        });
      });
    }

    if (onPress) {
      onPress(isFollowing ? "0" : "1");
    }
  }

  return (
    <TouchableOpacity
      style={{
        padding: isFollowing ? 3 : 5,
        paddingHorizontal: 10,
        backgroundColor: isFollowing ? "#44c1e714" : Colors.light.accent,
        borderRadius: borderRadius,
        borderColor: Colors.light.accent,
        borderWidth: isFollowing ? 2 : 0,
        flexDirection: "row",
        alignItems: "center",
      }}
      onPress={handleFollow}
    >
      <Icon
        icon={isFollowing ? "userCheckIcon" : "userPlusIcon"}
        color={isFollowing ? Colors.light.accent : "#fff"}
        size={18}
        style={{ marginRight: 5 }}
      />
      <Text
        style={{
          color: isFollowing ? Colors.light.accent : "#fff",
          fontFamily: "Outfit_600SemiBold",
          fontSize: 16,
          textAlign: "center",
        }}
      >
        {isFollowing ? "Suivi" : "Suivre"}
      </Text>
    </TouchableOpacity>
  );
}
