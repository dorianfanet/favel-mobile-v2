import { View, Text, Alert, ActivityIndicator, Pressable } from "react-native";
import React, { useEffect, useState } from "react";
import {
  Conversation,
  ConversationMessage,
  ConversationModificationsStatus,
  ConversationParticipant,
} from "@/types/types";
import { Image } from "expo-image";
import UserCard from "@/components/UserCard";
import Colors from "@/constants/Colors";
import { TouchableOpacity } from "react-native-gesture-handler";
import { formatDateToRelativeShort } from "@/lib/utils";
import ParsedText from "react-native-parsed-text";
import { useAuth } from "@clerk/clerk-expo";
import { favelClient } from "@/lib/favelApi";
import { supabaseClient } from "@/lib/supabaseClient";
import ContainedButton from "@/components/ContainedButton";
import Edits from "./Edits";

export default function Message({
  message,
  currentParticipant,
  participants,
  conversation,
}: {
  message: ConversationMessage;
  currentParticipant: string | null;
  participants: ConversationParticipant[];
  conversation: Conversation | null;
}) {
  const [open, setOpen] = useState(false);

  return (
    <View
      style={{
        width: "100%",
        flexDirection:
          message.author_id === currentParticipant ? "row-reverse" : "row",
        alignItems: "flex-end",
      }}
    >
      {message.author_id !== currentParticipant &&
        (message.author_id ===
        participants.find((part) => part.user_id === "favel")?.id ? (
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
                (participant) => participant.id === message.author_id
              )?.user_id!
            }
            size="extraSmall"
            avatarOnly
          />
        ))}
      <Pressable
        style={{
          maxWidth: "80%",
        }}
        onPress={() => setOpen(!open)}
      >
        {(message.author_id !== currentParticipant || open) && (
          <View
            style={{
              maxWidth: "100%",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-end",
              paddingHorizontal: 10,
              marginBottom: 5,
              gap: 5,
            }}
          >
            {message.author_id ===
            participants.find((part) => part.user_id === "favel")?.id ? (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: "Outfit_600SemiBold",
                    color: Colors.light.primary,
                    paddingVertical: 2,
                  }}
                >
                  Favel{" "}
                </Text>

                <TouchableOpacity
                  style={{
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
                      paddingVertical: 2,
                    }}
                  >
                    Beta
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <UserCard
                userId={
                  participants?.find(
                    (participant) => participant.id === message.author_id
                  )?.user_id!
                }
                size="small"
                noAvatar
                noLastName
                style={{}}
              />
            )}
            <Text
              style={{
                color: Colors.light.primary,
                fontFamily: "Outfit_400Regular",
                fontSize: 12,
                opacity: 0.8,
              }}
            >
              {formatDateToRelativeShort(message.created_at)}
            </Text>
          </View>
        )}

        <View
          style={{
            backgroundColor:
              message.author_id === currentParticipant
                ? Colors.light.accent
                : Colors.light.secondary,
            padding: 10,
            borderRadius: 15,
            alignSelf:
              message.author_id === currentParticipant
                ? "flex-end"
                : "flex-start",
          }}
        >
          <ParsedText
            style={{
              color:
                message.author_id === currentParticipant
                  ? "white"
                  : Colors.light.primary,
              fontFamily: "Outfit_400Regular",
              fontSize: 16,
              alignSelf: "flex-start",
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
                    message.author_id === currentParticipant
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
            {message.content}
          </ParsedText>
          {message.modifications ? (
            <Edits edits={message.modifications} />
          ) : null}
          {message.modifications_status ? (
            <ApplyModificationsButton
              status={message.modifications_status}
              tripId={conversation?.trip_id}
              message={message.content}
              messageId={message.id}
            />
          ) : null}
        </View>
      </Pressable>
    </View>
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
      const { error } = await favel.tripConversationFavelApplyModifications(
        message,
        tripId,
        messageId
      );
      console.log(error);
      if (error) {
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
              const { data, error } = await favel.tripConversationFavelRevert(
                tripId,
                messageId
              );
              console.log("Revert result error", error);
              if (error) {
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
    </>
  );
}
