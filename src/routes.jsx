import { Routes, Route, Navigate } from "react-router-dom";

import Info from "./game/info/info";
import Debug from "./game/debug/debug";
import Battle from "./game/actions/battle/battle";
import Board from "./game/board/board";
import Start from "./game/start/start";
import GameTemplate from "./game/gameTemplate/gameTemplate";

const NotFound = () => <div>404</div>;

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Start />} />
      <Route path="/info" element={<Info />} />
      <Route path="/debug" element={<Debug />} />
      <Route path="/battle" element={<Battle />} />
      <Route path="/board" element={<Board />} />
      <Route path="/game" element={<GameTemplate />} />

      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
