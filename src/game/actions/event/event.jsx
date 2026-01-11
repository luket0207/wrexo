import React from "react";
import { useActions } from "../../../engine/gameContext/useActions";

const EventAction = () => {
  const { endActiveAction } = useActions();

  return (
    <div style={{ padding: "16px" }}>
      <h1>Event</h1>

      <button type="button" onClick={endActiveAction}>
        Back to Board
      </button>
    </div>
  );
};

export default EventAction;
