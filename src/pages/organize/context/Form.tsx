import { zodResolver } from "@hookform/resolvers/zod";
import type { PropsWithChildren } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { editSongSchema } from "../../../schema";

export default function OrganizeFormContextProvider({
  children,
}: PropsWithChildren) {
  const form = useForm({ resolver: zodResolver(editSongSchema) });

  return <FormProvider {...form}>{children}</FormProvider>;
}
