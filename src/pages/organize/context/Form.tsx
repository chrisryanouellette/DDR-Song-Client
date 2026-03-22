import { zodResolver } from "@hookform/resolvers/zod";
import { type PropsWithChildren, useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import { editSongSchema } from "../../../schema";

export default function OrganizeFormContextProvider({
  children,
}: PropsWithChildren) {
  const [searchParams] = useSearchParams();
  const collection = searchParams.get("collection") ?? "";
  const song = searchParams.get("song") ?? "";
  const form = useForm({
    resolver: zodResolver(editSongSchema),
    defaultValues: { song, collection },
  });
  const setValue = form.setValue;

  useEffect(
    function initSyncSearchParamsToForm() {
      if (song || collection) {
        setValue("song", song);
        setValue("collection", collection);
      }
    },
    [collection, setValue, song],
  );

  return <FormProvider {...form}>{children}</FormProvider>;
}
