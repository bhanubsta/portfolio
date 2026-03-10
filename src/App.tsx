import { useEffect } from "react";
import "./App.scss";
import { Terminal } from "modules/Terminal";
import { zustandStore, themeStore } from "utils/store";

const disableKeys = [
  "Space",
];

const App = () => {
  const { fetchProjects } = zustandStore();
  const { theme } = themeStore();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    window.addEventListener(
      "keydown",
      (e) => {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA") return;
        if (disableKeys.includes(e.code)) {
          e.preventDefault();
        }
      },
      false
    );

    fetchProjects();
  }, [fetchProjects]);

  const { isClosed } = themeStore();

  return (
    <div className="container">
      <Terminal />
      
      <div className="Taskbar">
        <div 
          className={`Taskbar_item ${!isClosed && "active"}`}
          onClick={() => {
            if (themeStore.getState().isClosed) {
              themeStore.setState({ isClosed: false, isMinimized: false });
            } else {
              themeStore.setState({ isMinimized: !themeStore.getState().isMinimized });
            }
          }}
          title="Terminal (Click to open/minimize)"
        >
          💻
        </div>
      </div>
    </div>
  );
};

export default App;
