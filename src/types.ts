export type ErrorResult<E> = { isError: true; error: E };
export type SuccessResult<R> = R extends void
  ? { isError?: false }
  : { isError?: false; value: R };
export type Throwable<R = void, E = Error> = SuccessResult<R> | ErrorResult<E>;

export type SearchSong = {
  id: string;
  title: string;
  collection: string;
  collectionId: string;
  single: [
    `${number}` | "-",
    `${number}` | "-",
    `${number}` | "-",
    `${number}` | "-",
    `${number}` | "-",
  ];
  double: [
    `${number}` | "-",
    `${number}` | "-",
    `${number}` | "-",
    `${number}` | "-",
    `${number}` | "-",
  ];
  artist: string[];
};

export type SongDetails = {
  id: string;
  bpm: string;
  preview?: string;
  quality: {
    audio: 0 | 1 | 2 | "unknown";
    banner: 0 | 1 | 2 | "unknown" | "custom";
    background: 0 | 1 | 2 | "unknown" | "custom";
  };
};

export type Folder = {
  name: string;
};
