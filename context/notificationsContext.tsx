import { ChatMessage, TripChatMessage } from "@/types/types";
import React, { createContext } from "react";

export interface NotificationsContext {
  notificationsCount: number;
  setNotificationsCount: React.Dispatch<React.SetStateAction<number>>;
  clearNotifications: () => void;
}

const notificationsContext = createContext({} as NotificationsContext);

export const NotificationsProvider = ({
  children,
}: {
  children: React.JSX.Element;
}) => {
  const [notificationsCount, setNotificationsCount] = React.useState<number>(0);

  function clearNotifications() {
    setNotificationsCount(0);
  }

  return (
    <notificationsContext.Provider
      value={{
        notificationsCount,
        setNotificationsCount,
        clearNotifications,
      }}
    >
      {children}
    </notificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = React.useContext(notificationsContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationsProvider"
    );
  }
  return context;
};
