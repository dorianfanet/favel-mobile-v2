import { supabase } from "@/lib/supabase";
import { Post, SavedTrip } from "@/types/types";
import { useUser } from "@clerk/clerk-expo";
import { useEffect, useState } from "react";
import ActionButton from "./ActionButton";
import Icon from "@/components/Icon";
import Colors from "@/constants/Colors";
import { favel } from "@/lib/favelApi";
import { useRouter } from "expo-router";

export default function CommentButton({
  post,
  noLink = false,
}: {
  post: Post | null;
  noLink?: boolean;
}) {
  const [comments, setComments] = useState<number | null>(null);
  const router = useRouter();

  async function fetchLikes() {
    if (!post) return;
    const { count, error } = await supabase
      .from("comments")
      .select("*", { count: "exact", head: true })
      .eq("post_id", post.id);

    setComments(count);
  }

  useEffect(() => {
    fetchLikes();
  }, [post]);

  return (
    <ActionButton
      IconComponent={() => (
        <Icon
          icon="messageDotsIcon"
          size={24}
          color={Colors.light.primary}
        />
      )}
      counter={comments}
      title={`Commenter`}
      iconColor={Colors.light.primary}
      onPress={() => {
        if (noLink) return;
        router.push(`/post/${post?.id}`);
      }}
    />
  );
}
