import OrganizeCollections from "./components/Collections";
import { OrganizeEditor } from "./components/Editor";
import OrganizeSongs from "./components/Songs";
import OrganizeFormContextProvider from "./context/Form";
import { SongsContextProvider } from "./context/Songs";

export default function OrganizePage() {
  return (
    <OrganizeFormContextProvider>
      <SongsContextProvider>
        <div className="flex flex-1 gap-6 px-16 pb-8">
          <OrganizeCollections />
          <OrganizeSongs />
          <OrganizeEditor />
        </div>
      </SongsContextProvider>
    </OrganizeFormContextProvider>
  );
}
