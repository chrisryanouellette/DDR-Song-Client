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
  zip: string;
  quality: {
    audio: 0 | 1 | 2 | "unknown";
    banner: 0 | 1 | 2 | "unknown" | "custom";
    background: 0 | 1 | 2 | "unknown" | "custom";
  };
};
