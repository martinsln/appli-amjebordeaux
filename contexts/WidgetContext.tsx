import * as React from "react";
import { createContext, useCallback, useContext } from "react";
import { Platform } from "react-native";

type ExtensionStorageClass = typeof import("@bacons/apple-targets").ExtensionStorage;

// Only load the Apple widget helper where it exists to avoid web ReferenceErrors.
const loadExtensionStorage = (): ExtensionStorageClass | null => {
  if (Platform.OS !== "ios") {
    return null;
  }

  const hasNativeModule =
    typeof globalThis !== "undefined" &&
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Boolean((globalThis as any).expo?.modules?.ExtensionStorage);

  if (!hasNativeModule) {
    return null;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { ExtensionStorage } = require("@bacons/apple-targets") as typeof import("@bacons/apple-targets");
    return ExtensionStorage;
  } catch (error) {
    console.warn("Widget extension unavailable:", error);
    return null;
  }
};

const extensionStorage = loadExtensionStorage();

type WidgetContextType = {
  refreshWidget: () => void;
};

const WidgetContext = createContext<WidgetContextType | null>(null);

export function WidgetProvider({ children }: { children: React.ReactNode }) {
  // Update widget state whenever what we want to show changes
  React.useEffect(() => {
    // set widget_state to null if we want to reset the widget
    // ExtensionStorage.set("widget_state", null);

    // Refresh widget
    extensionStorage?.reloadWidget?.();
  }, []);

  const refreshWidget = useCallback(() => {
    extensionStorage?.reloadWidget?.();
  }, []);

  return (
    <WidgetContext.Provider value={{ refreshWidget }}>
      {children}
    </WidgetContext.Provider>
  );
}

export const useWidget = () => {
  const context = useContext(WidgetContext);
  if (!context) {
    throw new Error("useWidget must be used within a WidgetProvider");
  }
  return context;
};
