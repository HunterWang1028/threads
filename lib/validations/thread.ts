import * as z from "zod";

export const ThreadValidation = z.object({
  thread: z.string().min(3, { message: "come on, type some more" }),
  accountId: z.string(),
  thread_image: z.string().url().min(1),
});

export const CommentValidation = z.object({
  thread: z.string().min(3, { message: "come on, type some more" }),
});
