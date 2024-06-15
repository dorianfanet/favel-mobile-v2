import { Post } from "@/types/types";
import { useEffect, useState } from "react";
import ActionButton from "./ActionButton";
import Icon from "@/components/Icon";
import Colors from "@/constants/Colors";
import { useRouter } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { supabaseClient } from "@/lib/supabaseClient";

export default function CommentButton({
  post,
  noLink = false,
}: {
  post: Post | null;
  noLink?: boolean;
}) {
  const [comments, setComments] = useState<number | null>(null);
  const router = useRouter();

  const { getToken } = useAuth();

  async function fetchLikes() {
    if (!post) return;
    supabaseClient(getToken).then(async (supabase) => {
      const { count } = await supabase
        .from("comments")
        .select("*", { count: "exact", head: true })
        .eq("post_id", post.id);

      setComments(count);
    });
  }

  useEffect(() => {
    fetchLikes();
  }, [post]);

  return (
    <ActionButton
      IconComponent={() => (
        <Icon
          icon="messageDotsSquareIcon"
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
