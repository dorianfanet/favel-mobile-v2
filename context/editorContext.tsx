import { Editor } from "@/types/types";
import { createContext, useContext, useEffect, useState } from "react";

export interface EditorContext {
  editor: Editor | null;
  setEditor: (editor: Editor | null) => void;
}

const editorContext = createContext<EditorContext>({} as any);

export const EditorProvider = ({
  children,
}: {
  children: React.JSX.Element;
}) => {
  const [editor, setEditor] = useState<Editor | null>(null);

  useEffect(() => {
    console.log("editor", editor);
  }, [editor]);

  return (
    <editorContext.Provider
      value={{
        editor,
        setEditor,
      }}
    >
      {children}
    </editorContext.Provider>
  );
};

export const useEditor = () => {
  const context = useContext(editorContext);
  if (context === undefined) {
    throw new Error("useEditor must be used within a EditorProvider");
  }
  return context;
};
