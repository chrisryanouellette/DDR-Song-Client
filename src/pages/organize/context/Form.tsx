import { zodResolver } from "@hookform/resolvers/zod";
import type { PropsWithChildren } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import { editSongSchema } from "../../../schema";

export default function OrganizeFormContextProvider({
  children,
}: PropsWithChildren) {
  const [searchParams] = useSearchParams();
  const form = useForm({
    resolver: zodResolver(editSongSchema),
    defaultValues: {
      song: searchParams.get("song") ?? "",
      collection: searchParams.get("collection") ?? "",
    },
  });

  return <FormProvider {...form}>{children}</FormProvider>;
}
