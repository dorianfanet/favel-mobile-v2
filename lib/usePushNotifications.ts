import { useState, useEffect, useRef } from "react";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

import Constants from "expo-constants";

import { Platform } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "./supabase";
import { MMKVLoader } from "react-native-mmkv-storage";

export const MMKV = new MMKVLoader().initialize();

export interface PushNotificationState {
  expoPushToken?: Notifications.ExpoPushToken;
  notification?: Notifications.Notification;
}

export const usePushNotifications = (): PushNotificationState => {
  const preferences = MMKV.getString("notifications_preferences");

  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => {
        return {
          shouldPlaySound: true,
          shouldShowAlert: true,
          shouldSetBadge: true,
        };
      },
    });

    const [expoPushToken, setExpoPushToken] = useState<
      Notifications.ExpoPushToken | undefined
    >();

    const [notification, setNotification] = useState<
      Notifications.Notification | undefined
    >();

    const notificationListener = useRef<Notifications.Subscription>();
    const responseListener = useRef<Notifications.Subscription>();

    async function registerForPushNotificationsAsync() {
      let token;
      if (Device.isDevice) {
        const { status: existingStatus } =
          await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        console.log("existingStatus", existingStatus);

        if (existingStatus !== "granted") {
          const { status } = await Notifications.requestPermissionsAsync();
          console.log("status", status);
          finalStatus = status;
        }

        console.log("finalStatus", finalStatus);
        if (finalStatus !== "granted") {
          // alert("Failed to get push token for push notification");
          return;
        }

        console.log("finalStatus", finalStatus);

        try {
          token = await Notifications.getExpoPushTokenAsync({
            projectId: Constants.expoConfig?.extra?.eas.projectId,
          });
        } catch (e) {
          console.error("Error getting token", e);
        }
      } else {
        // alert("Must be using a physical device for Push notifications");
      }

      if (Platform.OS === "android") {
        Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
        });
      }

      return token;
    }

    useEffect(() => {
      registerForPushNotificationsAsync().then((token) => {
        console.log("token ", token);
        setExpoPushToken(token);
      });

      notificationListener.current =
        Notifications.addNotificationReceivedListener((notification) => {
          setNotification(notification);
        });

      responseListener.current =
        Notifications.addNotificationResponseReceivedListener((response) => {
          const data = response.notification.request.content.data;
          // const link = data.link;

          // if (link) {
          //   router.push(link);
          // }

          async function updateNotification() {
            if (!data.id) return;
            const { error } = await supabase
              .from("notifications")
              .update({ is_read: true })
              .eq("id", data.id);
          }

          updateNotification();
        });

      return () => {
        Notifications.removeNotificationSubscription(
          notificationListener.current!
        );

        Notifications.removeNotificationSubscription(responseListener.current!);
      };
    }, []);

    return {
      expoPushToken,
      notification,
    };
  } catch (e) {
    console.error(e);
    return {
      expoPushToken: undefined,
      notification: undefined,
    };
  }
  // }
};
