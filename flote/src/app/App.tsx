import { NextUIProvider } from "@nextui-org/react";
import { Route, Routes, useHref, useNavigate } from "react-router-dom";

import { AuthenticationGuard } from "./AuthenticationGuard";

import AccountHome from "@pages/AccountHome";
import Landing from "@pages/Landing";
import RaceView from "@pages/RaceView";
import RegattaView from "@pages/RegattaView";
import Search from "@pages/Search";
import BoatView from "@pages/BoatView";
import RaceTimer from "@pages/RaceTimer/RaceTimer";

export default function App() {
  const navigate = useNavigate();

  return (
    <NextUIProvider navigate={navigate} useHref={useHref}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="search" element={<Search />} />
        <Route
          path="home"
          element={<AuthenticationGuard component={AccountHome} />}
        />
        <Route path="/regatta/:regattaId" element={<RegattaView />} />

        <Route path="/race/:raceId" element={<RaceView />} />
        <Route path="/regatta/:regattaId/race/:raceId" element={<RaceView />} />
        <Route path="/regatta/:regattaId/boat/:boatId" element={<BoatView />} />
        <Route path="/raceTimer/:raceId" element={<RaceTimer />} />
      </Routes>
    </NextUIProvider>
  );
}
