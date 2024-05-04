import { TripUserRole } from "@/types/types";
import { createContext, useContext, useState } from "react";

export interface TripUserRoleContext {
  tripUserRole: TripUserRole;
  setTripUserRole: React.Dispatch<React.SetStateAction<TripUserRole>>;
}

const tripUserRoleContext = createContext<TripUserRoleContext>({} as any);

export const TripUserRoleProvider = ({
  children,
}: {
  children: React.JSX.Element;
}) => {
  const [tripUserRole, setTripUserRole] = useState<TripUserRole>({
    id: "",
    role: "read-only",
  });

  return (
    <tripUserRoleContext.Provider
      value={{
        tripUserRole,
        setTripUserRole,
      }}
    >
      {children}
    </tripUserRoleContext.Provider>
  );
};

export const useTripUserRole = () => {
  const context = useContext(tripUserRoleContext);
  if (context === undefined) {
    throw new Error(
      "useTripUserRole must be used within a TripUserRoleProvider"
    );
  }
  return context;
};

// import { Editor } from "@/types/types";
// import { createContext, useContext, useEffect, useState } from "react";

// export interface EditorContext {
//   editor: Editor | null;
//   setEditor: (editor: Editor | null) => void;
// }

// const editorContext = createContext<EditorContext>({} as any);

// export const EditorProvider = ({
//   children,
// }: {
//   children: React.JSX.Element;
// }) => {
//   const [editor, setEditor] = useState<Editor | null>(null);

//   useEffect(() => {
//     console.log("editor", editor);
//   }, [editor]);

//   return (
//     <editorContext.Provider
//       value={{
//         editor,
//         setEditor,
//       }}
//     >
//       {children}
//     </editorContext.Provider>
//   );
// };

// export const useEditor = () => {
//   const context = useContext(editorContext);
//   if (context === undefined) {
//     throw new Error("useEditor must be used within a EditorProvider");
//   }
//   return context;
// };
