"use server";

import { revalidatePath } from "next/cache";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";

type createThreadProps = {
  text: string;
  author: string;
  communityId: string | null;
  path: string;
};
export async function createThread({
  text,
  author,
  communityId,
  path,
}: createThreadProps) {
  try {
    connectToDB();

    const createdThread = await Thread.create({
      text,
      author,
      community: null,
    });

    // update user model
    await User.findByIdAndUpdate(author, {
      $push: { threads: createdThread._id },
    });

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Error creating Thread: ${error.message}`);
  }
}

export async function fetchThreads(pageNumber = 1, pageSize = 20) {
  try {
    connectToDB();

    // caculate the number of threads to skip
    const skipAmount = (pageNumber - 1) * pageSize;

    // fetch the threads that have no parents
    const threadsQuery = Thread.find({
      parentId: { $in: [null, undefined] },
    })
      .sort({ createdAT: "desc" })
      .skip(skipAmount)
      .limit(pageSize)
      .populate({ path: "author", model: User })
      .populate({
        path: "children",
        populate: {
          path: "author",
          model: User,
          select: "_id name parentId image",
        },
      });

    // Count the total number of top-level posts (threads) i.e., threads that are not comments.
    const totalThreadsCount = await Thread.countDocuments({
      parentId: { $in: [null, undefined] },
    });

    const threads = await threadsQuery.exec();

    const isNext = totalThreadsCount > skipAmount + threads.length;

    return { threads, isNext };
  } catch (error: any) {
    throw new Error(`Error fetching threads: ${error.message}`);
  }
}

export async function fetchThreadById(id: string) {
  try {
    connectToDB();

    // TODO populate community
    const thread = await Thread.findById(id)
      .populate({
        path: "author", // Populate the author field with _id and username
        model: "User",
        select: "_id id name image",
      })
      .populate({
        path: "children", // Populate the children field
        populate: [
          {
            path: "author", // Populate the author field within children
            model: "User",
            select: "_id id name parentId image",
          },
          {
            path: "children", // Populate the children field within children
            model: "Thread",
            populate: {
              path: "author", // Populate the author field within nested children
              model: "User",
              select: "_id id name parentId image",
            },
          },
        ],
      })
      .exec();

    return thread;
  } catch (error: any) {
    throw new Error(`Error fetching thread: ${error.message}`);
  }
}

export async function addCommentToThread(
  threadId: string,
  commentText: string,
  userId: string,
  path: string
) {
  try {
    connectToDB();
    // find the original thread by its ID
    const originalThread = await Thread.findById(threadId);

    if (!originalThread) throw new Error("Thread not found");

    // create a new thread with the comment text
    const commentThread = new Thread({
      text: commentText,
      author: userId,
      parentId: threadId,
    });

    // save the new thread
    const savedCommentThread = await commentThread.save();

    // update the original thread to include the new thread

    originalThread.children.push(savedCommentThread._id);

    // save the original thread
    await originalThread.save();

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Error adding comment to thread: ${error.message}`);
  }
}
