import OrganizeCollections from "./components/Collections";
import { OrganizeEditor } from "./components/Editor";
import NewCollectionDialog from "./components/NewCollection";
import OrganizeSongs from "./components/Songs";
import { CollectionsProvider } from "./context/Collections";
import { EditorContextProvider } from "./context/Editor";
import OrganizeFormContextProvider from "./context/Form";
import { SongsContextProvider } from "./context/Songs";

export default function OrganizePage() {
  return (
    <OrganizeFormContextProvider>
      <CollectionsProvider>
        <SongsContextProvider>
          <EditorContextProvider>
            <div className="flex flex-1 gap-6 overflow-auto px-16 pb-8">
              <OrganizeCollections />
              <OrganizeSongs />
              <OrganizeEditor />
            </div>
          </EditorContextProvider>
          <NewCollectionDialog />
        </SongsContextProvider>
      </CollectionsProvider>
    </OrganizeFormContextProvider>
  );
}
