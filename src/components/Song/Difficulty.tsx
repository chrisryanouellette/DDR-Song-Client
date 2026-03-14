import type { ComponentProps, PropsWithChildren } from "react";
import type { SearchSong } from "../../types";
import { cn } from "../../utils";

type DifficultyProps = ComponentProps<"div"> & {
  difficulty: SearchSong["single"] | SearchSong["double"];
};

function Difficulty({
  difficulty,
  children,
  className,
  ...rest
}: PropsWithChildren<DifficultyProps>) {
  return (
    <div className={cn("mt-auto flex", className)} {...rest}>
      <h3 className="mr-4 mb-2 font-medium text-slate-300">{children}</h3>
      {difficulty.map((option, index) => (
        <p
          key={option}
          className={`font-medium after:px-0.5 after:pl-1 after:text-slate-400 after:content-['-'] last:after:content-[''] ${
            index < difficulty.length / 3
              ? "text-green-400"
              : index < (2 * difficulty.length) / 3
                ? "text-yellow-400"
                : "text-red-400"
          }`}
        >
          {option === "-" ? "X" : option}
        </p>
      ))}
    </div>
  );
}
export default Difficulty;
