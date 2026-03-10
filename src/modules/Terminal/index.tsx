import React, { useState } from "react";
import { TerminalBox } from "components/TerminalBody";
import { MessageEditor } from "components/CommandLineFunctions";
import { themeStore } from "utils/store";
import "./terminal.scss";

const TopTerminalBar = () => {
  const {
    isClosed,
    isMaximized,
    isMinimized,
    setIsClosed,
    setIsMaximized,
    setIsMinimized,
  } = themeStore();

  return (
    <div className="Terminal_Top">
      <button
        className="Terminal_Top_CloseBtn"
        onClick={() => setIsClosed(!isClosed)}
      >
        &#10005;
      </button>

      <button
        className="Terminal_Top_DummyBtn"
        onClick={() => setIsMinimized(!isMinimized)}
      >
        &#9472;
      </button>

      <button
        className="Terminal_Top_DummyBtn"
        onClick={() => setIsMaximized(!isMaximized)}
      >
        &#9723;
      </button>
    </div>
  );
};

export const Terminal: React.FC = () => {
  const [isMobileDevice] = useState(window.innerWidth < 500);

  const { isClosed, isMaximized, isMinimized, isEditorOpen } = themeStore();

  return (
    <div
      className={`${isMobileDevice && "Mobile_Container"} Terminal_Container ${
        isClosed && "closed"
      } ${isMaximized && "maximized"} ${isMinimized && "minimized"}`}
    >
      <TopTerminalBar />
      <div className="Terminal_Content_Wrapper" style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {!isEditorOpen && <TerminalBox />}
        {isEditorOpen && <MessageEditor />}
      </div>
    </div>
  );
};
