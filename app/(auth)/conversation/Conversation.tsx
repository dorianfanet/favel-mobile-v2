import {
  View,
  StatusBar,
  SafeAreaView,
  KeyboardAvoidingView,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  Platform,
  Alert,
} from "react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Stack, router, useLocalSearchParams } from "expo-router";
import Colors from "@/constants/Colors";
import {
  Conversation,
  ConversationMessage,
  ConversationModificationsStatus,
  UserMetadata,
} from "@/types/types";
import { supabaseClient } from "@/lib/supabaseClient";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ParsedText from "react-native-parsed-text";
import { createClient } from "@supabase/supabase-js";
import { useConversation } from "@/context/conversationContext";
import { FlatList, ScrollView } from "react-native-gesture-handler";
import UserCard from "@/components/UserCard";
import { Button, Text } from "@/components/Themed";
import { borderRadius, padding } from "@/constants/values";
import Icon from "@/components/Icon";
import ImageWithFallback from "@/components/ImageWithFallback";
import { Image } from "expo-image";
import { getUserMetadata } from "@/lib/utils";
import { favelClient } from "@/lib/favelApi";
import Markdown from "react-native-markdown-display";
import ContainedButton from "@/components/ContainedButton";
import { MMKV } from "@/app/_layout";

export default function ConversationComponent() {
  const { id } = useLocalSearchParams();

  useEffect(() => {
    StatusBar.setBarStyle("light-content");
  });

  const [loading, setLoading] = useState(true);

  const { getToken } = useAuth();

  const [token, setToken] = useState<string | null>(null);

  const {
    messages,
    setMessages,
    setParticipants,
    participants,
    setCurrentParticipant,
    currentParticipant,
    conversation,
    setConversation,
  } = useConversation();

  useEffect(() => {
    const conversationCache = MMKV.getString(`conversation-${id}`);
    const messagesCache = MMKV.getString(`conversation-messages-${id}`);
    const participantsCache = MMKV.getString(`conversation-participants-${id}`);
    const currentParticipantCache = MMKV.getString(
      `conversation-currentParticipant-${id}`
    );
    if (
      conversationCache &&
      messagesCache &&
      participantsCache &&
      currentParticipantCache
    ) {
      console.log(
        conversationCache,
        messagesCache,
        participantsCache,
        currentParticipantCache
      );
      try {
        setConversation(JSON.parse(conversationCache));
        setMessages(JSON.parse(messagesCache));
        setParticipants(JSON.parse(participantsCache));
        setCurrentParticipant(currentParticipantCache);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    async function fetchConversation() {
      supabaseClient(getToken).then(async (supabase) => {
        const { data, error } = await supabase
          .from("conversations")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          console.error(error);
        }

        console.log(data);

        if (data) {
          setConversation(data);
          MMKV.setString(`conversation-${id}`, JSON.stringify(data));
        }

        const { data: messagesData, error: messagesError } = await supabase
          .from("conversation_messages")
          .select("*")
          .eq("conversation_id", id)
          .order("created_at", { ascending: true });

        if (messagesError) {
          console.error(messagesError);
        }

        if (messagesData) {
          setMessages(messagesData as ConversationMessage[]);
        }

        const { data: participantsData, error: participantsError } =
          await supabase
            .from("conversation_participants")
            .select("*")
            .eq("conversation_id", id);

        if (participantsError) {
          console.error(participantsError);
        }

        if (participantsData) {
          setParticipants(participantsData);
          MMKV.setString(
            `conversation-participants-${id}`,
            JSON.stringify(participantsData)
          );
        }

        console.log("participantsData", participantsData);

        console.log("user", user?.id);

        const currentParticipant = participantsData?.find(
          (participant) => participant.user_id === user?.id
        );

        console.log("currentParticipant", currentParticipant);

        setCurrentParticipant(currentParticipant?.id);
        MMKV.setString(
          `conversation-currentParticipant-${id}`,
          currentParticipant?.id
        );

        setLoading(false);
      });
    }

    fetchConversation();
  }, []);

  useEffect(() => {
    if (token) return;
    async function init() {
      const token = await getToken();
      setToken(token);
    }
    init();
  }, []);

  useEffect(() => {
    MMKV.setString(`conversation-messages-${id}`, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
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
      .channel(`${id}-conversation-messages`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "conversation_messages",
          filter: `conversation_id=eq.${id}`,
        },
        (payload) => {
          console.log(payload);
          if (payload.new) {
            console.log(payload.new);
            setMessages((currentMessages) => [
              ...currentMessages,
              payload.new as ConversationMessage,
            ]);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "conversation_messages",
          filter: `conversation_id=eq.${id}`,
        },
        (payload) => {
          console.log(payload);
          if (payload.new) {
            console.log(payload.new);
            setMessages((currentMessages) =>
              currentMessages.map((message) =>
                message.id === payload.new.id
                  ? (payload.new as ConversationMessage)
                  : message
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, token]);

  const { user } = useUser();

  const [chatHeight, setChatHeight] = useState(0);

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerBackTitleVisible: false,
          headerBackground: () => (
            <View
              style={{
                backgroundColor: Colors.light.accent,
                flex: 1,
              }}
            />
          ),
          headerTintColor: "white",
          headerTitle(props) {
            return conversation ? (
              // <View
              //   style={{
              //     flexDirection: "row",
              //     alignItems: "center",
              //     gap: 10,
              //     flexShrink: 1,
              //   }}
              // >
              //  <View
              //     style={{
              //       width: 40,
              //       height: 40,
              //       borderRadius: 100,
              //       overflow: "hidden",
              //     }}
              //   >
              //     <ImageWithFallback
              //       style={{
              //         width: "100%",
              //         height: "100%",
              //         borderRadius: 10,
              //       }}
              //       source={{
              //         uri: `https://storage.googleapis.com/favel-photos/hotspots/${tripMetadata?.route?.[0]?.id}-700.jpg`,
              //       }}
              //       fallbackSource={require("@/assets/images/no-image.png")}
              //     />
              //   </View>
              //   <View
              //     style={{
              //       flex: 1,
              //     }}
              //   >
              <Text
                style={{
                  color: "white",
                  fontFamily: "Outfit_600SemiBold",
                  fontSize: 18,
                }}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {conversation.name}
              </Text>
            ) : (
              // </View>
              // </View>
              <Text
                style={{
                  color: "white",
                  fontFamily: "Outfit_600SemiBold",
                  fontSize: 18,
                }}
              >
                Discussion
              </Text>
            );
          },
        }}
      />
      {loading ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: Colors.light.background,
          }}
        >
          <ActivityIndicator
            size="large"
            color={Colors.light.primary}
          />
        </View>
      ) : (
        <View
          style={{
            flex: 1,
            backgroundColor: Colors.light.background,
            justifyContent: "space-between",
          }}
        >
          <View
            style={{
              flex: 1,
            }}
            onLayout={(event) => {
              console.log(event.nativeEvent.layout.height);
              if (chatHeight === 0) {
                setChatHeight(event.nativeEvent.layout.height);
              }
            }}
          >
            <FlatList
              data={JSON.parse(JSON.stringify(messages)).reverse()}
              keyExtractor={(_, index) => index.toString()}
              inverted
              contentContainerStyle={{
                padding: padding,
                rowGap: 10,
                marginTop: 50,
              }}
              ListFooterComponent={
                <View
                  style={{
                    flex: 1,
                    height: chatHeight,
                    padding: padding,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      width: 150,
                      height: 150,
                      borderRadius: 100,
                      overflow: "hidden",
                      marginBottom: 20,
                    }}
                  >
                    <ImageWithFallback
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: 10,
                      }}
                      source={{
                        uri: conversation?.thumbnail,
                      }}
                      fallbackSource={require("@/assets/images/no-image.png")}
                    />
                  </View>
                  <Text
                    style={{
                      fontFamily: "Outfit_600SemiBold",
                      fontSize: 24,
                      color: Colors.light.primary,
                      marginBottom: 10,
                      textAlign: "center",
                    }}
                  >
                    {conversation?.name}
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Outfit_400Regular",
                      fontSize: 14,
                      color: Colors.light.primary,
                      textAlign: "center",
                    }}
                  >
                    Discutez avec les autres participants de votre voyage et
                    demandez des modifications à Favel
                  </Text>
                </View>
              }
              renderItem={({ item }) => (
                <View
                  style={{
                    width: "100%",
                    flexDirection:
                      item.author_id === currentParticipant
                        ? "row-reverse"
                        : "row",
                    alignItems: "flex-end",
                  }}
                >
                  {item.author_id !== currentParticipant &&
                    (item.author_id ===
                    participants.find((part) => part.user_id === "favel")
                      ?.id ? (
                      <View
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 25,
                          marginRight: 10,
                          backgroundColor: "white",
                        }}
                      >
                        <Image
                          source={require("@/assets/images/icon.png")}
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: 25,
                          }}
                        />
                      </View>
                    ) : (
                      <UserCard
                        userId={
                          participants?.find(
                            (participant) => participant.id === item.author_id
                          )?.user_id!
                        }
                        size="extraSmall"
                        avatarOnly
                      />
                    ))}
                  <View
                    style={{
                      backgroundColor:
                        item.author_id === currentParticipant
                          ? Colors.light.accent
                          : Colors.light.secondary,
                      padding: 10,
                      borderRadius: 15,
                      maxWidth: "80%",
                    }}
                  >
                    <ParsedText
                      style={{
                        color:
                          item.author_id === currentParticipant
                            ? "white"
                            : Colors.light.primary,
                        fontFamily: "Outfit_400Regular",
                        fontSize: 16,
                      }}
                      parse={[
                        {
                          pattern: /\*\*(.*?)\*\*/,
                          style: {
                            fontFamily: "Outfit_600SemiBold",
                          },
                          renderText(matchingString, matches) {
                            return matchingString.replace(/\*\*/g, "");
                          },
                        },
                        {
                          pattern: /@\[\S+\]/,
                          style: {
                            color:
                              item.author_id === currentParticipant
                                ? "#fff"
                                : Colors.light.accent,
                            fontFamily: "Outfit_600SemiBold",
                          },
                          renderText(matchingString, matches) {
                            console.log(matches);

                            const pattern = /@\[([^\]]+)\]/;
                            let match = matchingString.match(pattern);
                            if (match) {
                              return `@${match[1].split(":")[0]}`;
                            } else {
                              return matchingString;
                            }
                          },
                        },
                      ]}
                    >
                      {item.content}
                    </ParsedText>
                    {item.modifications_status ? (
                      <ApplyModificationsButton
                        status={item.modifications_status}
                        tripId={conversation?.trip_id}
                        message={item.content}
                        messageId={item.id}
                      />
                    ) : null}
                    {item.author_id ===
                      participants.find((part) => part.user_id === "favel")
                        ?.id && (
                      <TouchableOpacity
                        style={{
                          position: "absolute",
                          top: -18,
                          left: -15,
                          backgroundColor: Colors.light.accent,
                          borderRadius: 5,
                        }}
                        onPress={() => {
                          Alert.alert(
                            "Fonctionnalité en bêta",
                            "Les discussions avec Favel sont en cours de développement. Il se peut que Favel fasse des erreurs ou ne réponde pas correctement à vos demandes."
                          );
                        }}
                      >
                        <Text
                          style={{
                            color: "white",
                            fontFamily: "Outfit_600SemiBold",
                            fontSize: 14,
                            padding: 5,
                          }}
                        >
                          Beta
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}
            />
          </View>
          <ConversationInput />
        </View>
      )}
    </>
  );
}

const text = {
  pending: "Appliquer les modifications",
  applied: "✅ Votre voyage a été mis à jour",
  loading: "Chargement",
  error: "Réessayer",
};

function ApplyModificationsButton({
  status,
  tripId,
  message,
  messageId,
}: {
  status: ConversationModificationsStatus;
  tripId?: string;
  message: string;
  messageId: string;
}) {
  const { getToken } = useAuth();

  const [localStatus, setLocalStatus] =
    useState<ConversationModificationsStatus>(status);

  useEffect(() => {
    setLocalStatus(status);
  }, [status]);

  async function handleClickApply() {
    setLocalStatus("loading");
    updateMessageInDb("loading");
    if (!tripId) {
      setLocalStatus("error");
      updateMessageInDb("error");
      return;
    }
    favelClient(getToken).then(async (favel) => {
      const result: any = await favel.tripConversationFavelApplyModifications(
        message,
        tripId,
        messageId
      );
      console.log(result);
      if (result.error) {
        setLocalStatus("error");
        updateMessageInDb("error");
      }
    });
  }

  async function handleRevert() {
    Alert.alert(
      "Annuler les modifications",
      "En annulant les modifications, vous revenez à l'état du voyage au moment où ce message a été envoyé. Toutes les modifications apportées depuis ce message seront perdues. Êtes-vous sûr de vouloir continuer ?",
      [
        {
          text: "Annuler",
          style: "cancel",
        },
        {
          text: "Confirmer",
          onPress: () => {
            setLocalStatus("loading");
            updateMessageInDb("loading");
            if (!tripId) {
              setLocalStatus("applied");
              updateMessageInDb("applied");
              return;
            }
            favelClient(getToken).then(async (favel) => {
              const result: any = await favel.tripConversationFavelRevert(
                tripId,
                messageId
              );
              console.log(result);
              if (result.error) {
                setLocalStatus("applied");
                updateMessageInDb("applied");
              }
            });
          },
        },
      ]
    );
  }

  async function updateMessageInDb(status: ConversationModificationsStatus) {
    await supabaseClient(getToken).then(async (supabase) => {
      const { error } = await supabase
        .from("conversation_messages")
        .update({
          modifications_status: status,
        })
        .eq("id", messageId);

      if (error) {
        console.error(error);
      }
    });
  }

  return (
    <>
      <ContainedButton
        TitleComponent={
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
            }}
          >
            {localStatus === "loading" ? (
              <ActivityIndicator
                size="small"
                color="white"
              />
            ) : null}
            <Text
              style={{
                color:
                  localStatus === "applied" ? Colors.light.primary : "white",
                fontSize: 16,
                fontFamily: "Outfit_600SemiBold",
                textAlign: "center",
              }}
            >
              {text[localStatus]}
            </Text>
          </View>
        }
        onPress={handleClickApply}
        style={{
          marginTop: 10,
          opacity: localStatus === "loading" ? 0.5 : 1,
          paddingHorizontal: 10,
          backgroundColor:
            localStatus === "applied" ? "white" : Colors.light.accent,
        }}
        disabled={localStatus === "loading" || localStatus === "applied"}
      />
      {localStatus === "applied" ? (
        <ContainedButton
          title="Annuler les modifications"
          onPress={handleRevert}
          type="ghostLight"
        />
      ) : null}
      {localStatus === "error" ? (
        <Text
          style={{
            textAlign: "center",
            fontFamily: "Outfit_400Regular",
            fontSize: 14,
            marginVertical: 5,
          }}
        >
          Une erreur est survenue. Veuillez réessayer.
        </Text>
      ) : null}
      {/* <Text
        style={{
          textAlign: "center",
          fontFamily: "Outfit_400Regular",
          fontSize: 12,
          marginVertical: 5,
        }}
      >
        {`Cette fonctionnalité est en bêta`}
      </Text> */}
    </>
  );
}

function ConversationInput() {
  const inset = useSafeAreaInsets();

  const [value, setValue] = useState("");
  const [height, setHeight] = useState(0);
  const [mentions, setMentions] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<
    {
      id: string;
      mentionName: string;
    }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState<string>("");
  const [showPrompt, setShowPrompt] = useState<boolean>(false);

  const { getToken } = useAuth();

  const { currentParticipant, participants, conversation } = useConversation();

  console.log("Suggestions: ", suggestions);

  useEffect(() => {
    if (!participants) return;

    console.log("Fetching suggestions");

    async function fetchSuggestions() {
      const sug: Promise<{
        id: string;
        mentionName: string;
      }>[] = participants.map(async (participant) => {
        if (participant.user_id === "favel")
          return {
            id: participant.id,
            mentionName: "Favel",
          };
        const userMetadata = await getUserMetadata(
          participant.user_id,
          undefined,
          getToken
        );
        return {
          id: participant.id,
          mentionName: `${userMetadata.firstName}${userMetadata.lastName}`,
        };
      });

      console.log("sug", sug);

      try {
        const suggestions = await Promise.all(sug);

        console.log("Sug: ", suggestions);

        setSuggestions(suggestions);
      } catch (error) {
        console.error(error);
      }
    }

    fetchSuggestions();
  }, [participants]);

  const { id } = useLocalSearchParams();

  async function handleSendMessage() {
    setLoading(true);
    supabaseClient(getToken).then(async (supabase) => {
      const mentionRegex = /@\S+/;

      const matches = value.match(mentionRegex);

      console.log("Matches: ", matches);

      let valueCopy = value;
      let messageMentions: string[] = [];
      let favelMentionned = false;

      if (matches && matches.length > 0) {
        const ids = matches
          .map((mention) => {
            if (mention === "@Favel") {
              favelMentionned = true;
              return {
                mention,
                id: "favel",
              };
            }
            const user = suggestions.find(
              (user) => user && user.mentionName === mention.replace("@", "")
            );
            return user ? { mention, id: user.id } : null;
          })
          .filter((x) => x);

        console.log("Ids: ", ids);

        console.log("Value copy before: ", valueCopy);

        ids.forEach((mapping) => {
          if (!mapping) return;
          valueCopy = valueCopy.replace(
            `${mapping.mention}`,
            `@[${mapping.mention.replace("@", "")}:${mapping.id}]`
          );
          messageMentions.push(mapping.id);
        });

        console.log("Value copy: ", valueCopy);
        console.log("Message mentions: ", messageMentions);
      }

      const { error } = await supabase.from("conversation_messages").insert([
        {
          content: valueCopy,
          author_id: currentParticipant,
          conversation_id: id,
          mentions: messageMentions,
        },
      ]);

      if (error) {
        console.error(error);
      } else {
        setValue("");
      }

      setLoading(false);

      if (favelMentionned) {
        await favelClient(getToken).then(async (favel) => {
          if (!conversation?.trip_id) return;
          const favelId = participants?.find(
            (participant) => participant.user_id === "favel"
          );
          await favel.tripConversationFavel(
            id as string,
            favelId?.id!,
            suggestions,
            conversation?.trip_id
          );
        });
      }
    });
  }

  const { user } = useUser();

  const inputRef = useRef<TextInput>(null);

  return (
    <KeyboardAvoidingView
      behavior="padding"
      keyboardVerticalOffset={70}
      style={{
        backgroundColor: Colors.light.background,
        paddingBottom: inset.bottom,
        marginBottom: Platform.OS === "android" ? 10 : 0,
      }}
    >
      <View
        style={{
          backgroundColor: Colors.light.background,
          paddingBottom: inset.bottom,
        }}
      >
        {/* <View
          style={{
            paddingHorizontal: padding,
            marginBottom: 10,
          }}
        >
          <ContainedButton
            title="@Favel"
            type="ghostLight"
            onPress={() => {}}
            style={{
              paddingVertical: 5,
            }}
          >
            @Favel
          </ContainedButton>
        </View> */}
        <ScrollView
          style={{
            borderRadius: borderRadius,
            paddingHorizontal: padding,
            paddingVertical: 10,
            position: "absolute",
            top: -60,
            right: 0,
            left: 0,
          }}
          keyboardShouldPersistTaps="always"
          horizontal
        >
          <View
            key={"participant-favel"}
            style={{
              padding: 5,
              paddingRight: 10,
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              backgroundColor: "white",
              borderRadius: 10,
            }}
          >
            <TouchableOpacity
              style={[
                {
                  flexDirection: "row",
                  justifyContent: "flex-start",
                  alignItems: "center",
                },
              ]}
              onPress={() => {
                setValue((currentValue) => {
                  const lastAtPos = currentValue.lastIndexOf("@");
                  setMentions(false);
                  return `${currentValue.slice(0, lastAtPos)}@Favel `;
                });
                inputRef.current?.focus();
              }}
            >
              <Image
                source={require("@/assets/images/icon.png")}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 25,
                  marginRight: 10,
                }}
              />
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Outfit_600SemiBold",
                  color: Colors.light.primary,
                }}
              >
                Favel
              </Text>
            </TouchableOpacity>
          </View>
          {participants?.map((participant) =>
            participant.user_id !== user?.id ? (
              <View
                key={`participant-${participant.id}`}
                style={{
                  padding: 0,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <UserCard
                  userId={participant.user_id}
                  size="small"
                  onPress={(user) => {
                    setValue((currentValue) => {
                      const lastAtPos = currentValue.lastIndexOf("@");
                      setMentions(false);
                      return `${currentValue.slice(0, lastAtPos)}@${
                        user.firstName
                      }${user.lastName} `;
                    });
                  }}
                />
              </View>
            ) : null
          )}
        </ScrollView>
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "row",
            gap: 10,
            marginHorizontal: padding,
          }}
        >
          {/* <TouchableOpacity
            onPress={() => {
              setValue((currentValue) => {
                // check if last char is a space
                const lastChar = currentValue[currentValue.length - 1];
                console.log(lastChar);
                if (lastChar === undefined) {
                  return `@Favel`;
                } else if (lastChar === " ") {
                  return `${currentValue}@Favel`;
                } else {
                  return `${currentValue} @Favel`;
                }
              });
            }}
            style={{
              flexDirection: "row",
              gap: -3,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: Colors.light.primary,
                fontFamily: "Outfit_600SemiBold",
                fontSize: 24,
              }}
            >
              @
            </Text>
            <Icon
              icon="favelAt"
              size={20}
              color={Colors.light.primary}
            />
          </TouchableOpacity> */}

          <View
            style={{
              justifyContent: "center",
              alignItems: "flex-start",
              backgroundColor: "#39a1ca24",
              // height: Math.max(40, height),
              // maxHeight: 80,
              flex: 1,
              borderRadius: 10,
              padding: 10,
              paddingVertical: 5,
              maxHeight: 100,
            }}
          >
            {mentions ? (
              <View
                style={{
                  position: "absolute",
                  top: -10,
                  left: 0,
                  right: 0,
                  height: 0,
                }}
              >
                <ScrollView
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    maxHeight: 150,
                    backgroundColor: "white",
                    borderRadius: borderRadius,
                  }}
                  keyboardShouldPersistTaps="always"
                >
                  <View
                    key={"participant-favel"}
                    style={{
                      padding: 10,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <TouchableOpacity
                      style={[
                        {
                          flexDirection: "row",
                          justifyContent: "flex-start",
                          alignItems: "center",
                        },
                      ]}
                      onPress={() => {
                        setValue((currentValue) => {
                          const lastAtPos = currentValue.lastIndexOf("@");
                          setMentions(false);
                          return `${currentValue.slice(0, lastAtPos)}@Favel `;
                        });
                      }}
                    >
                      <Image
                        source={require("@/assets/images/icon.png")}
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 25,
                          marginRight: 10,
                        }}
                      />
                      <Text
                        style={{
                          fontSize: 14,
                          fontFamily: "Outfit_600SemiBold",
                          color: Colors.light.primary,
                        }}
                      >
                        Favel
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {participants?.map((participant) =>
                    participant.user_id !== "favel" ? (
                      participant.user_id !== user?.id ? (
                        <View
                          key={`participant-${participant.id}`}
                          style={{
                            padding: 10,
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 10,
                          }}
                        >
                          <UserCard
                            userId={participant.user_id}
                            size="small"
                            onPress={(user) => {
                              setValue((currentValue) => {
                                const lastAtPos = currentValue.lastIndexOf("@");
                                setMentions(false);
                                return `${currentValue.slice(0, lastAtPos)}@${
                                  user.firstName
                                }${user.lastName} `;
                              });
                            }}
                          />
                        </View>
                      ) : null
                    ) : null
                  )}
                </ScrollView>
              </View>
            ) : null}
            <TextInput
              style={{
                color: Colors.light.primary,
                fontFamily: "Outfit_400Regular",
                fontSize: 16,
                padding: 0,
                borderWidth: 0,
                width: "100%",
                height: Math.max(30, height),
                maxHeight: 80,
              }}
              placeholder="Votre message..."
              placeholderTextColor="#0d2a496c"
              multiline
              // value={value}
              onChangeText={(text) => {
                const lastAtPos = text.lastIndexOf("@");
                if (lastAtPos !== -1) {
                  setMentions(true);
                  const textAfter = text.substr(lastAtPos + 1);
                  if (textAfter.includes(" ") || textAfter.includes("\n")) {
                    console.log("end of mention");
                    setMentions(false);
                  }
                } else {
                  console.log("no mention");
                  setMentions(false);
                }
                setValue(text);
              }}
              onContentSizeChange={(event) =>
                setHeight(event.nativeEvent.contentSize.height)
              }
              ref={inputRef}
            >
              <ParsedText
                parse={[
                  {
                    pattern: /@\S+/,
                    style: {
                      color: Colors.light.accent,
                      fontFamily: "Outfit_600SemiBold",
                    },
                    // renderText(matchingString, matches) {
                    //   console.log(matches);

                    //   // matches => ["@[michel]"]
                    //   const pattern = /@\[([^\]]+)\]/;
                    //   let match = matchingString.match(pattern);
                    //   if (match) {
                    //     return `^^${match[1]}^^`;
                    //   } else {
                    //     return matchingString;
                    //   }
                    // },
                  },
                ]}
              >
                {value}
              </ParsedText>
            </TextInput>
          </View>
          <TouchableOpacity
            onPress={handleSendMessage}
            disabled={value.length === 0 || loading}
            style={{
              backgroundColor: Colors.light.accent, // Button color
              height: 40,
              width: 40,
              borderRadius: borderRadius,
              justifyContent: "center",
              alignItems: "center",
              opacity: value.length === 0 ? 0.5 : 1,
            }}
            onLongPress={() => {
              setShowPrompt(true);
            }}
          >
            {loading ? (
              <ActivityIndicator
                size="small"
                color="white"
              />
            ) : (
              <Icon
                icon="sendIcon"
                size={20}
                color="white"
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
      {/* {showPrompt ? (
        <PromptComponent
          prompt={prompt}
          setPrompt={setPrompt}
          setShowPrompt={setShowPrompt}
        />
      ) : null} */}
    </KeyboardAvoidingView>
  );
}

const { width, height } = Dimensions.get("screen");

function PromptComponent({
  prompt,
  setPrompt,
  setShowPrompt,
}: {
  prompt: string;
  setPrompt: (value: string) => void;
  setShowPrompt: (value: boolean) => void;
}) {
  return (
    <View
      style={{
        position: "absolute",
        left: padding,
        right: padding,
        // height: 500,
        paddingTop: padding,
        bottom: 100,
        backgroundColor: "white",
        borderWidth: 2,
        borderColor: "#0d2a496c",
        borderRadius: borderRadius,
      }}
    >
      <TextInput
        style={{
          color: Colors.light.primary,
          fontFamily: "Outfit_400Regular",
          fontSize: 16,
          padding: 10,
          borderWidth: 0,
          marginHorizontal: padding,
          height: 430,
          backgroundColor: "#dcdcdca9",
          borderRadius: borderRadius,
        }}
        placeholder="Prompt..."
        placeholderTextColor="#0d2a496c"
        multiline
        value={prompt}
        onChangeText={(text) => {
          setPrompt(text);
        }}
      />
      <Button
        title="Fermer"
        onPress={() => {
          setShowPrompt(false);
        }}
      />
    </View>
  );
}
