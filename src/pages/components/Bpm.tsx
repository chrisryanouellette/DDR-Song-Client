import { useSongDetailsContext } from "../hooks/song";

export function BpmFallback() {
  return (
    <p className="mt-1 animate-pulse font-semibold text-gray-700">BPM...</p>
  );
}

export function Bpm() {
  const { bpm } = useSongDetailsContext();

  return <p className="mt-1 font-semibold text-gray-200">BPM {bpm}</p>;
}
