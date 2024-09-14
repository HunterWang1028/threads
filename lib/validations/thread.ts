import * as z from "zod";

export const ThreadValidation = z.object({
  thread: z.string().min(3, { message: "come on, type some more" }),
  accountId: z.string(),
});

export const CommentValidation = z.object({
  thread: z.string().min(3, { message: "come on, type some more" }),
});
