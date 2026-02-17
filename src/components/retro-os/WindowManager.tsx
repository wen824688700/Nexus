"use client";

import { useRetroOS } from "./RetroOSContext";
import { WindowFrame } from "./WindowFrame";
import { FolderWindow } from "./FolderWindow";
import { ArticleWindow } from "./ArticleWindow";

export function WindowManager() {
  const { state, actions } = useRetroOS();

  return (
    <>
      {state.openWindows.map((window) => (
        <WindowFrame
          key={window.id}
          id={window.id}
          title={window.type === "folder" ? "C:\\项目文档" : window.data?.title || "Document"}
          icon={window.type === "folder" ? "📂" : window.data?.icon}
          zIndex={window.zIndex}
          width={window.type === "folder" ? "550px" : "650px"}
          height={window.type === "folder" ? "400px" : "500px"}
          top={window.position?.top}
          left={window.position?.left}
          onClose={() => actions.closeWindow(window.id)}
          onFocus={() => actions.focusWindow(window.id)}
        >
          {window.type === "folder" ? (
            <FolderWindow />
          ) : window.data ? (
            <ArticleWindow article={window.data} />
          ) : null}
        </WindowFrame>
      ))}
    </>
  );
}
