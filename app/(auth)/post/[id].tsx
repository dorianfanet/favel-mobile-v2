import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import PostCard from "@/components/Post/PostCard";
import { Post } from "@/types/types";
import { MMKV } from "../trip/_layout";
import Colors from "@/constants/Colors";
import { RefreshControl } from "react-native-gesture-handler";
import { supabase } from "@/lib/supabase";
import Comments from "./Comments";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export default function Index() {
  const { id } = useLocalSearchParams();
  const [post, setPost] = useState<Post | null>(
    JSON.parse(MMKV.getString(`post-${id}`)) || null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  async function getPost() {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("id", id)
      .single();
    if (error) {
      setError("Une erreur est survenue");
      setLoading(false);
      return;
    }
    setPost(data);
    setLoading(false);
  }

  useEffect(() => {
    getPost();
  }, [id]);

  return post ? (
    // <KeyboardAvoidingView
    //   behavior={Platform.OS === "ios" ? "padding" : "height"}
    //   keyboardVerticalOffset={Platform.OS === "ios" ? 120 : 0}
    //   style={{
    //     flexGrow: 1,
    //   }}
    // >
    <KeyboardAwareScrollView
      extraHeight={30}
      extraScrollHeight={30}
      style={{
        flex: 1,
        backgroundColor: Colors.light.background,
      }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={async () => {
            setRefreshing(true);
            await getPost();
            setRefreshing(false);
          }}
        />
      }
    >
      <PostCard
        post={post}
        style={{ borderRadius: 0, marginBottom: 10 }}
        noLink
      />
      <Comments post={post} />
    </KeyboardAwareScrollView>
  ) : // </KeyboardAvoidingView>
  loading ? (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.light.background,
      }}
    >
      <Text>Chargement...</Text>
    </View>
  ) : (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.light.background,
      }}
    >
      <Text>{error || "Une erreur est survenue"}</Text>
    </View>
  );
}
