"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

import {
  deleteThread,
  fetchThreadById,
  likeThread,
} from "@/lib/actions/thread.actions";
import { useState } from "react";

type LikeThreadProps = {
  threadId: string;
  currentUserId: string;
};

function LikeThread({ threadId, currentUserId }: LikeThreadProps) {
  //   const thread = await fetchThreadById(threadId);

  //   const likesList = thread?.likes.map((userId: string) => currentUserId);

  const [likes, setLikes] = useState(false);
  return (
    <Image
      src="assets/heart-gray.svg"
      //   src={
      //     likesList.includes(currentUserId)
      //       ? "/assets/heart-filled.svg"
      //       : "/assets/heart-gray.svg"
      //   }
      alt="heart"
      width={24}
      height={24}
      className="cursor-pointer object-contain"
      onClick={async () => {
        await likeThread(JSON.parse(threadId), currentUserId);
      }}
    />
  );
}

export default LikeThread;
