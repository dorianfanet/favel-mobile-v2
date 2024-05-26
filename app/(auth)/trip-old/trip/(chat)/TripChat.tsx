import {
  View,
  NativeSyntheticEvent,
  NativeScrollEvent,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  BottomSheetBackdrop,
  BottomSheetFooter,
  BottomSheetModal,
  BottomSheetView,
  TouchableOpacity,
} from "@gorhom/bottom-sheet";
import Colors from "@/constants/Colors";
import { TripChatMessage } from "@/types/types";
import { useTrip } from "@/context/tripContext";
import { FlatList } from "react-native-gesture-handler";
import { BlurView, Text } from "@/components/Themed";
import { padding } from "@/constants/values";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "@/components/Icon";
import Input from "./Input";
import { useTripChat } from "@/context/tripChat";
import Edits from "./Edits";
import Markdown from "react-native-markdown-display";
import { track } from "@amplitude/analytics-react-native";
import ContainedButton from "@/components/ContainedButton";
import { ActivityCardContent } from "../../components/PlaceCard";
import { useAuth } from "@clerk/clerk-expo";
import { createClient } from "@supabase/supabase-js";
import { supabaseClient } from "@/lib/supabaseClient";
import { favelClient } from "@/lib/favelApi";

export default function TripChat({
  bottomSheetModalRef,
  type,
  activityId,
}: {
  bottomSheetModalRef: React.RefObject<BottomSheetModal>;
  type: "trip" | "activity";
  activityId?: string;
}) {
  const snapPoints = useMemo(() => ["100%"], []);
  const scrollOffset = useRef(0);

  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
    if (index === -1) {
      StatusBar.setBarStyle("dark-content");
      track("Chat closed", {
        type: type,
        activityId: activityId,
      });
    } else {
      StatusBar.setBarStyle("light-content");
      track("Chat opened", {
        type: type,
        activityId: activityId,
      });
    }
    flatListRef.current?.scrollToEnd({ animated: false });
  }, []);

  const inset = useSafeAreaInsets();

  const { tripMetadata } = useTrip();
  const { setMessages, messages } = useTripChat();

  const flatListRef = useRef<FlatList>(null);

  const [token, setToken] = React.useState<string | null>(null);
  const { getToken } = useAuth();

  useEffect(() => {
    if (token) return;
    async function init() {
      const token = await getToken();
      setToken(token);
    }
    init();
  }, []);

  useEffect(() => {
    if (!tripMetadata?.id) return;
    if (!token) return;

    const supabase = createClient(
      process.env.EXPO_PUBLIC_SUPABASE_URL!,
      process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    const channel = supabase
      .channel(
        `${tripMetadata?.id}-${type}-chat${activityId ? `-${activityId}` : ""}`
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: type === "trip" ? "trip_chat" : "activity_chat_v2",
          filter:
            type === "trip"
              ? `trip_id=eq.${tripMetadata?.id}`
              : `chat_id=eq.${tripMetadata?.id}-${activityId}`,
          // filter: `trip_id=eq.${tripMetadata?.id}${
          //   activityId ? `&activity_id=eq.${activityId}` : ""
          // }`,
        },
        (payload) => {
          if (payload.new) {
            console.log(payload.new);
            setMessages((currentMessages: TripChatMessage[]) => {
              let updatedMessages = [...currentMessages];
              if (updatedMessages.length > 0 && payload.new.content) {
                updatedMessages[updatedMessages.length - 1].content =
                  payload.new.content;
              }
              if (updatedMessages.length > 0 && payload.new.edits) {
                updatedMessages[updatedMessages.length - 1].edits =
                  payload.new.edits;
              }
              updatedMessages[updatedMessages.length - 1].status =
                payload.new.status;
              updatedMessages[updatedMessages.length - 1].function =
                payload.new.function;
              return updatedMessages;
            });
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: type === "trip" ? "trip_chat" : "activity_chat_v2",
          filter:
            type === "trip"
              ? `trip_id=eq.${tripMetadata?.id}`
              : `chat_id=eq.${tripMetadata?.id}-${activityId}`,
        },
        (payload) => {
          console.log("delete payload", payload);
          if (payload.old) {
            setMessages((currentMessages: TripChatMessage[]) => {
              return currentMessages.filter(
                (message) => message.id !== payload.old.id
              );
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tripMetadata?.id, token]);

  useEffect(() => {
    async function fetchMessages() {
      if (!tripMetadata?.id) return;
      if (type === "trip") {
        await supabaseClient(getToken).then(async (supabase) => {
          const { data, error } = await supabase
            .from("trip_chat")
            .select(`id, role, content, status, edits, function`)
            .eq("trip_id", tripMetadata?.id)
            .order("created_at", { ascending: true });
          if (error) {
            console.log(error);
          } else {
            setMessages(data as TripChatMessage[]);
          }
        });
      } else if (type === "activity") {
        await supabaseClient(getToken).then(async (supabase) => {
          const { data, error } = await supabase
            .from("activity_chat_v2")
            .select(`id, role, content, status`)
            .eq("trip_id", tripMetadata?.id)
            .eq("activity_id", activityId)
            .order("created_at", { ascending: true });
          if (error) {
            console.log(error);
          } else {
            setMessages(data as TripChatMessage[]);
          }
        });
      }
    }

    if (messages.length === 0) {
      fetchMessages();
    }
  }, []);

  const [lastEditMessageIndex, setLastEditMessageIndex] = useState<
    number | null
  >(null);

  useEffect(() => {
    if (messages.length > 0) {
      const lastEditMessageIndex = messages.reduce(
        (acc: any, message: any, index: number) => {
          if (message.edits && message.edits.length > 0) {
            return index;
          }
          return acc;
        },
        -1
      );
      setLastEditMessageIndex(lastEditMessageIndex);
    }
  }, [messages]);

  const renderFooter = useCallback(
    (props: any) => (
      <BottomSheetFooter
        {...props}
        bottomInset={24}
      >
        <Input
          messages={messages}
          setMessages={setMessages}
          tripId={tripMetadata?.id!}
          disabled={
            messages.length > 0 &&
            (messages[messages.length - 1].status === "loading" ||
              messages[messages.length - 1].status === "generating")
          }
          type={type}
          activityId={activityId}
        />
      </BottomSheetFooter>
    ),
    [messages]
  );

  return (
    <>
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        backgroundComponent={(props) => (
          <View
            style={{
              flex: 1,
              padding: 0,
              margin: 0,
            }}
            {...props}
          >
            <BlurView />
          </View>
        )}
        handleIndicatorStyle={{
          backgroundColor: "transparent",
        }}
        handleComponent={(props) => (
          <View
            style={{
              backgroundColor: "",
              height: inset.top,
            }}
            {...props}
          ></View>
        )}
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
            enableTouchThrough={true}
            pressBehavior="close"
          />
        )}
        footerComponent={renderFooter}
        keyboardBlurBehavior="restore"
      >
        <BottomSheetView
          style={{
            paddingTop: inset.top,
            paddingBottom: 5,
            paddingHorizontal: padding,
          }}
        >
          <View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                height: 40,
                position: "relative",
              }}
            >
              <TouchableOpacity
                onPress={async () => {
                  if (type === "trip") {
                    await supabaseClient(getToken).then(async (supabase) => {
                      const { data, error } = await supabase
                        .from("trip_chat")
                        .select("id, role, content, edits")
                        .eq("trip_id", tripMetadata?.id)
                        .order("created_at", { ascending: true });
                      if (error) {
                        console.log(error);
                      } else {
                        setMessages(data as TripChatMessage[]);
                      }
                    });
                  } else if (type === "activity") {
                    await supabaseClient(getToken).then(async (supabase) => {
                      const { data, error } = await supabase
                        .from("activity_chat_v2")
                        .select("id, role, content")
                        .eq("trip_id", tripMetadata?.id)
                        .eq("activity_id", activityId)
                        .order("created_at", { ascending: true });
                      if (error) {
                        console.log(error);
                      } else {
                        setMessages(data as TripChatMessage[]);
                      }
                    });
                  }
                }}
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  height: 40,
                  justifyContent: "center",
                }}
              >
                <Icon
                  icon="refreshIcon"
                  size={20}
                  color={Colors.dark.primary}
                />
              </TouchableOpacity>
              <Text
                style={{
                  fontSize: 18,
                  color: Colors.dark.primary,
                  fontFamily: "Outfit_600SemiBold",
                }}
              >
                {type === "trip" ? "Modifier le voyage" : "Poser une question"}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  bottomSheetModalRef.current?.close();
                }}
                style={{
                  position: "absolute",
                  right: 0,
                  top: 0,
                  height: 40,
                  justifyContent: "center",
                }}
              >
                <Icon
                  icon="closeIconFixed"
                  size={20}
                  color={Colors.dark.primary}
                />
              </TouchableOpacity>
            </View>
            {type === "activity" && activityId && (
              <ActivityCardContent
                activity={{
                  id: activityId,
                  formattedType: "activity",
                }}
                style={{
                  paddingHorizontal: 0,
                }}
                noClick
              />
            )}
          </View>
        </BottomSheetView>
        <FlatList
          data={messages}
          ref={flatListRef}
          onScroll={(event: NativeSyntheticEvent<NativeScrollEvent>) => {
            scrollOffset.current = event.nativeEvent.contentOffset.y;
          }}
          onContentSizeChange={(h: number) => {
            // if (scrollOffset.current < h - 500) {
            flatListRef.current?.scrollToEnd({ animated: false });
            // }
          }}
          keyExtractor={(item: TripChatMessage, index) =>
            item.id + index.toString()
          }
          renderItem={({ item, index }) => {
            return item.role !== "system" ? (
              <View
                style={{
                  padding: 20,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 10,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 18,
                      fontFamily: "Outfit_600SemiBold",
                      color: "white",
                    }}
                  >
                    {item.role === "assistant" ? "Favel" : "Vous"}
                  </Text>
                  {item.edits &&
                    item.edits.length > 0 &&
                    index === lastEditMessageIndex && (
                      <RevertChangesButton
                        tripId={tripMetadata?.id!}
                        messageId={item.id}
                        userMessageId={messages[index - 1].id}
                      />
                    )}
                </View>
                <Markdown
                  style={{
                    body: {
                      fontSize: 16,
                      fontFamily: "Outfit_400Regular",
                      color: "white",
                    },
                    strong: {
                      fontSize: 16,
                      fontFamily: "Outfit_700Bold",
                      color: "white",
                    },
                  }}
                >
                  {item.content}
                </Markdown>
                <Edits edits={item.edits!} />
                {item.status &&
                  ["loading", "generating"].includes(item.status) && (
                    <View
                      style={{
                        width: "100%",
                        flexDirection: "row",
                        justifyContent: "flex-start",
                        marginTop: 10,
                      }}
                    >
                      <ActivityIndicator />
                      <Text
                        style={{
                          fontSize: 16,
                          fontFamily: "Outfit_400Regular",
                          color: "white",
                          marginLeft: 10,
                        }}
                      >
                        {item.status === "loading"
                          ? item.function
                            ? item.function === "modifications"
                              ? "Je réfléchis à des modifications..."
                              : "Je réfléchis..."
                            : "Je réfléchis..."
                          : ""}
                      </Text>
                    </View>
                  )}
              </View>
            ) : null;
          }}
          ItemSeparatorComponent={() => (
            <View
              style={{
                height: 2,
                backgroundColor: "#ffffff",
                opacity: 0.2,
                width: "100%",
              }}
            />
          )}
          style={{
            flex: 1,
            marginBottom: inset.bottom + 50,
          }}
          contentContainerStyle={{
            paddingBottom: 20,
          }}
        />
      </BottomSheetModal>
    </>
  );
}

function RevertChangesButton({
  tripId,
  messageId,
  userMessageId,
}: {
  tripId: string;
  messageId: string;
  userMessageId: string;
}) {
  const [loading, setLoading] = useState(false);

  const { getToken } = useAuth();

  async function handlePress() {
    setLoading(true);
    await favelClient(getToken).then(async (favel) => {
      return await favel.revertModifications(tripId, messageId, userMessageId);
    });
    setLoading(false);
  }

  return (
    <ContainedButton
      TitleComponent={
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
          }}
        >
          {loading ? (
            <>
              <ActivityIndicator
                color="white"
                size="small"
                style={{
                  transform: [{ scale: 0.8 }],
                }}
              />
              <Text
                style={{
                  color: "white",
                  fontSize: 14,
                  fontFamily: "Outfit_500Medium",
                }}
              >
                Chargement
              </Text>
            </>
          ) : (
            <>
              <Icon
                icon="reverseLeftIcon"
                size={14}
                color="white"
              />
              <Text
                style={{
                  color: "white",
                  fontSize: 14,
                  fontFamily: "Outfit_500Medium",
                }}
              >
                Annuler ces modifications
              </Text>
            </>
          )}
        </View>
      }
      onPress={handlePress}
      style={{
        paddingVertical: 5,
        paddingHorizontal: 10,
        opacity: loading ? 0.7 : 1,
      }}
      type="ghost"
      disabled={loading}
    />
  );
}
