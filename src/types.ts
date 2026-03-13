export type SearchSong = {
  link: string;
  title: string;
  single: [
    `${number}` | "-",
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
    `${number}` | "-",
  ];
  artist: string[];
};
