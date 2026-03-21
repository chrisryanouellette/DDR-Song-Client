import z from "zod";

export const searchSchema = z.union([
  z.object({
    songtitle: z
      .string()
      .min(1, "Song Title or Artist Name must be set.")
      .trim(),
  }),
  z.object({
    songartist: z
      .string()
      .min(1, "Song Title or Artist Name must be set.")
      .trim(),
  }),
]);

export const songDetailsSchema = z.object({
  id: z.string().min(1),
});

export const songDownloadSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().nonempty(),
  })
  .and(
    z.union([
      z.object({
        folder: z.string().nonempty("Please select a folder."),
        new: z.string().length(0),
      }),
      z.object({
        folder: z.string().length(0),
        new: z.string("Please ender a folder name.").nonempty(),
      }),
    ]),
  );

export const songDownloadProgressSchema = z.record(
  z.string(),
  z.object({ name: z.string().nonempty() }).and(
    z.union([
      z.object({
        progress: z.number().min(0),
      }),
      z.object({ completed: z.literal(true) }),
      z.object({ error: z.string() }),
    ]),
  ),
);
export type SongDownloadProgressSchema = z.infer<
  typeof songDownloadProgressSchema
>;

export const editSongSchema = z.object({
  collection: z.string().nonempty("Collection is required."),
  song: z.string().nonempty("Song is required."),
  folder: z.string(),
  title: z.string().nonempty("Title is required."),
  subtitle: z.string().optional(),
  artist: z.string().nonempty("Artist is required."),
  genre: z.string().nonempty("Genre is required."),
});

export type EditSongSchema = z.infer<typeof editSongSchema>;

export const createFolderSchema = z.object({
  collection: z.string().nonempty(),
});
export const listSongsSchema = z.object({ collection: z.string().nonempty() });
export const getSongSchema = z.object({
  collection: z.string().nonempty(),
  song: z.string().nonempty(),
});

export const moveSongSchema = z.object({
  collection: z.string().nonempty(),
  dest: z.string().nonempty(),
  song: z.string().nonempty(),
});
