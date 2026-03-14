import z from "zod";

export const searchSchema = z.union([
  z.object({
    songtitle: z.string().min(1, "Song Title or Artist Name must be set."),
  }),
  z.object({
    songartist: z.string().min(1, "Song Title or Artist Name must be set."),
  }),
]);

export const songDetailsSchema = z.object({
  id: z.string().min(1),
});
