import type { SearchSong } from "../../types";
import { hasProperty } from "../../utils";
import { useSongDetailsContext } from "../hooks/song";

type Letters = "A" | "B" | "C" | "D";
type Grades = Letters | `+${Letters}` | `${Letters}-` | "F" | "S";
// const letters = ["A", "B", "C", "D", "F"] as const;
// const varients = ["+", "-"] as const;
const grades: Grades[] = [
  "F",
  "D-",
  "D",
  "+D",
  "C",
  "C-",
  "+C",
  "B-",
  "B",
  "+B",
  "A-",
  "A",
  "+A",
  "S",
];

type GradeProps = {
  single: SearchSong["single"];
  double: SearchSong["double"];
};

const singleScoring = [0.5, 2, 3, 2, 0.25];
const doubleScoring = [0.25, 0.25, 0.1, 0.1, 0.1];
const audioScoring = { 0: -2, 1: 0, 2: 3 };
const bannerScoring = { 0: -2, 1: 0, 2: 1, custom: 0.5 };
const backgroundScoring = { 0: -2, 1: 1, 2: 1, custom: 0.5 };

export function Grade({ single, double }: GradeProps) {
  let score = 0;
  const { quality } = useSongDetailsContext();
  const { audio, background, banner } = quality;
  for (let i = 0; i < single.length - 1; i++) {
    if (single[i] === "-") continue;
    score += singleScoring[i];
  }

  for (let i = 0; i < double.length - 1; i++) {
    if (double[i] === "-") continue;
    score += doubleScoring[i];
  }

  if (hasProperty(audioScoring, audio)) {
    score += Number(audioScoring[audio]);
  }
  if (hasProperty(bannerScoring, banner)) {
    score += Number(bannerScoring[banner]);
  }
  if (hasProperty(backgroundScoring, background)) {
    score += Number(backgroundScoring[background]);
  }
  return (
    <p className="absolute right-0.5 bottom-0 translate-y-full pt-1.5 text-3xl">
      {grades[Math.max(Math.min(Math.floor(score), grades.length - 1), 0)]}
    </p>
  );
}
