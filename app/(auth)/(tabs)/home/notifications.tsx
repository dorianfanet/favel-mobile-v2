import { Text, View } from "@/components/Themed";
import { supabase } from "@/lib/supabase";
import { Notification as NotificationType } from "@/types/types";
import { useUser } from "@clerk/clerk-expo";
import React, { useEffect, useRef } from "react";
import { FlatList } from "react-native";
import { RefreshControl } from "react-native-gesture-handler";
import Notification from "@/components/Notification";
import { padding } from "@/constants/values";
import Colors from "@/constants/Colors";

export default function notifications() {
  const [notifications, setNotifications] = React.useState<NotificationType[]>(
    []
  );
  const [refreshing, setRefreshing] = React.useState(false);
  const { user } = useUser();

  const page = useRef(0);

  async function getNotifications(page: number) {
    const { data, error } = await supabase
      .from("notifications")
      .select("id, is_read, type, body, data, author_id, created_at")
      .eq("user_id", user?.id)
      .order("created_at", { ascending: false })
      .range(page * 10, page * 10 + 9);
    if (error) {
      console.error(error);
      return [];
    }

    return data;
  }

  useEffect(() => {
    async function init() {
      const newNotifications = await getNotifications(0);
      setNotifications(newNotifications);

      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user?.id)
        .eq("is_read", false);

      if (error) {
        console.error(error);
      }
    }
    init();
  }, []);

  return (
    <View
      style={{
        flex: 1,
      }}
    >
      {notifications.length > 0 ? (
        <FlatList
          data={notifications}
          renderItem={({ item }) => <Notification notification={item} />}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={async () => {
                setRefreshing(true);
                const newNotifications = await getNotifications(0);
                setNotifications(newNotifications);
                setRefreshing(false);
              }}
              colors={[Colors.light.primary]}
              tintColor={Colors.light.primary}
            />
          }
          onEndReached={async () => {
            const newNotifications = await getNotifications(page.current + 1);
            if (newNotifications.length === 0) return;
            setNotifications([...notifications, ...newNotifications]);
            page.current += 1;
          }}
          contentContainerStyle={{
            rowGap: 10,
          }}
          style={{
            padding: padding,
          }}
        />
      ) : (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text>Pas de notifications</Text>
        </View>
      )}
    </View>
  );
}
