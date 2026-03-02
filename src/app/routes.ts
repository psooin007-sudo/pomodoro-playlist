import { createBrowserRouter } from "react-router";
import { Landing } from "./components/Landing";
import { PlaylistSelect } from "./components/PlaylistSelect";
import { MixSetup } from "./components/MixSetup";
import { NowPlaying } from "./components/NowPlaying";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Landing,
  },
  {
    path: "/playlists",
    Component: PlaylistSelect,
  },
  {
    path: "/setup",
    Component: MixSetup,
  },
  {
    path: "/session",
    Component: NowPlaying,
  },
]);