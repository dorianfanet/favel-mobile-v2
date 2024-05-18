import { Post } from "@/types/types";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useEffect, useState } from "react";
import ActionButton from "./ActionButton";
import Icon from "@/components/Icon";
import Colors from "@/constants/Colors";
import { supabaseClient } from "@/lib/supabaseClient";
import { favelClient } from "@/lib/favelApi";

export default function LikeButton({ post }: { post: Post | null }) {
  const { user } = useUser();
  const [likes, setLikes] = useState<number | null>(null);
  const [isUserLike, setIsUserLike] = useState<boolean | null>(null);

  const { getToken } = useAuth();

  async function checkLike() {
    if (user && post) {
      console.log("Checking like", post.id, user.id);
      supabaseClient(getToken).then(async (supabase) => {
        const { count, error } = await supabase
          .from("likes")
          .select("*", { count: "exact", head: true })
          .eq("post_id", post.id)
          .eq("user_id", user.id);

        if (error) console.error(error);

        const isLike = count && count > 0 ? true : false;
        if (isLike) {
          setIsUserLike(isLike);
        }
      });
    }
  }

  useEffect(() => {
    async function fetchLikes() {
      if (!post) return;
      supabaseClient(getToken).then(async (supabase) => {
        const { count, error } = await supabase
          .from("likes")
          .select("*", { count: "exact", head: true })
          .eq("post_id", post.id);

        setLikes(count);
      });
    }
    fetchLikes();
    checkLike();
  }, [post]);

  return (
    <ActionButton
      IconComponent={() => (
        <Icon
          icon={isUserLike ? "likeFilledIcon" : "likeIcon"}
          size={24}
          color={isUserLike ? "#ff0000" : Colors.light.primary}
        />
      )}
      counter={likes}
      title={`J'aime`}
      iconColor={isUserLike ? "#ff0000" : Colors.light.primary}
      onPress={async () => {
        if (!post) return;
        if (isUserLike) {
          supabaseClient(getToken).then(async (supabase) => {
            const { data, error } = await supabase
              .from("likes")
              .delete()
              .eq("post_id", post.id)
              .eq("user_id", user?.id);

            setLikes(likes ? likes - 1 : 0);
            setIsUserLike(false);
          });
        } else {
          if (user) {
            favelClient(getToken).then((favel) => {
              favel.likePost(post.id, user.id);
            });
          }
          setLikes(likes ? likes + 1 : 1);
          setIsUserLike(true);
          if (post.author_id !== user?.id) {
            favelClient(getToken).then((favel) => {
              favel.sendNotification(
                post.author_id,
                "Favel",
                `${user?.firstName} a aimé votre ${
                  post.trip_id ? "voyage" : "publication"
                }`,
                {
                  link: `/post/${post.id}`,
                  tripId: post.trip_id,
                },
                "like",
                user?.id
              );
            });
          }
        }
      }}
    />
  );
}
