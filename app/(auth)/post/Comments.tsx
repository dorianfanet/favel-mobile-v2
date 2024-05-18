import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import Colors from "@/constants/Colors";
import { borderRadius, padding } from "@/constants/values";
import { Post, PostComment } from "@/types/types";
import { Button, Text } from "@/components/Themed";
import Comment from "@/components/Comment";
import { Image } from "expo-image";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { v4 as uuidv4 } from "uuid";
import { supabaseClient } from "@/lib/supabaseClient";
import { favelClient } from "@/lib/favelApi";

export default function Comments({ post }: { post: Post }) {
  const [comments, setComments] = React.useState<PostComment[] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const { getToken } = useAuth();

  function getComments() {
    supabaseClient(getToken).then(async (supabase) => {
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("post_id", post.id)
        .order("created_at", { ascending: false });
      if (error) {
        setError("Une erreur est survenue");
        setLoading(false);
        return;
      }
      setComments(data);
      setLoading(false);
    });
  }

  React.useEffect(() => {
    getComments();
  }, [post.id]);

  return (
    <View
      style={{
        padding: padding,
      }}
    >
      <Text
        style={{
          fontSize: 18,
          color: Colors.light.primary,
          fontFamily: "Outfit_600SemiBold",
          marginBottom: 10,
        }}
      >
        Commentaires
      </Text>
      <NewComment
        post={post}
        onSendNewComment={(id, authorId, content, createdAt, mentions) => {
          setComments([
            {
              id: id,
              author_id: authorId,
              content,
              created_at: createdAt,
              mentions,
              post_id: post.id,
            },
            ...(comments || []),
          ]);
        }}
      />
      {loading ? (
        <Text>Chargement...</Text>
      ) : comments?.length === 0 ? (
        <View
          style={{
            width: "100%",
            height: 200,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text>Aucun commentaires</Text>
        </View>
      ) : (
        <View
          style={{
            gap: 10,
          }}
        >
          {comments?.map((comment) => (
            <Comment
              key={comment.id}
              comment={comment}
            />
          ))}
        </View>
      )}
    </View>
  );
}

function NewComment({
  post,
  onSendNewComment,
}: {
  post: Post;
  onSendNewComment?: (
    id: string,
    authorId: string,
    content: string,
    createdAt: string,
    mentions: string[]
  ) => void;
}) {
  const { user } = useUser();
  const [value, setValue] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const { getToken } = useAuth();

  async function sendComment() {
    const id = uuidv4();

    if (!user) return;
    if (!value || value === "") return;
    return await supabaseClient(getToken).then(async (supabase) => {
      const { data, error } = await supabase!.from("comments").insert({
        id: id,
        post_id: post.id,
        author_id: user.id,
        content: value,
        mentions: [post.author_id],
      });

      if (error) {
        console.error(error);
        setError("Une erreur est survenue");
        Keyboard.dismiss();
        return;
      }

      setValue("");
      setError(null);
      Keyboard.dismiss();

      onSendNewComment?.(id, user.id, value, new Date().toISOString(), [
        post.author_id,
      ]);

      favelClient(getToken).then((favel) => {
        favel.sendNotification(
          post.author_id,
          "Favel",
          `${user?.firstName} a commenté votre publication`,
          {
            link: `/post/${post.id}`,
            tripId: post.trip_id,
          },
          "comment",
          user?.id
        );
      });
    });
  }

  return (
    <View
      style={[
        {
          backgroundColor: Colors.light.secondary,
          padding: padding,
          borderRadius: borderRadius * 2,
          flexDirection: "row",
          gap: 10,
          marginBottom: 10,
        },
      ]}
    >
      <View
        style={{
          width: 40,
          justifyContent: "flex-start",
        }}
      >
        <Image
          source={{ uri: user?.imageUrl }}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
          }}
        />
      </View>
      <TextInput
        placeholder="Ajouter un commentaire"
        style={{
          backgroundColor: Colors.light.background,
          paddingHorizontal: 10,
          paddingVertical: 5,
          borderRadius: 10,
          flex: 1,
        }}
        value={value}
        onChangeText={setValue}
        placeholderTextColor="#083e4f72"
        returnKeyType="send"
        onSubmitEditing={sendComment}
      />
      <Button
        title="Envoyer"
        onPress={sendComment}
      />
    </View>
  );
}
