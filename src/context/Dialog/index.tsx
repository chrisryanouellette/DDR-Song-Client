import { createContext, type PropsWithChildren, useState } from "react";

type DrawerContextType = {
  openDrawerId: string | null;
  openDrawer: (id: string) => void;
  closeDrawer: () => void;
};

const DrawerContext = createContext<DrawerContextType | undefined>(undefined);

export function DrawerProvider({ children }: PropsWithChildren) {
  const [openDrawerId, setOpenDrawerId] = useState<string | null>(null);

  const openDrawer = (id: string) => setOpenDrawerId(id);
  const closeDrawer = () => setOpenDrawerId(null);

  return (
    <DrawerContext.Provider value={{ openDrawerId, openDrawer, closeDrawer }}>
      {children}
    </DrawerContext.Provider>
  );
}

export default DrawerContext;
