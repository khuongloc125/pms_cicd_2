import React, { createContext, useContext, useState, useEffect } from "react";

const SidebarContext = createContext();

export function SidebarProvider({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [projects, setProjectsSidebar] = useState(
    JSON.parse(localStorage.getItem("projects") || "[]")
  );
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      // Chỉ đặt trạng thái ban đầu khi component mount lần đầu
      if (!isInitialized) {
        if (window.innerWidth <= 768) {
          setIsSidebarOpen(false);
        } else {
          setIsSidebarOpen(true);
        }
        setIsInitialized(true);
      }
    };

    handleResize();

    // Lắng nghe resize để log (không thay đổi state)
    const handleResizeDebounced = () => {
      console.log("Resize event triggered, current width:", window.innerWidth);
    };

    window.addEventListener("resize", handleResizeDebounced);
    return () => window.removeEventListener("resize", handleResizeDebounced);
  }, [isInitialized]);

  const toggleSidebar = () => {
    console.log("Toggling sidebar, current state:", isSidebarOpen);
    setIsSidebarOpen((prev) => {
      const newState = !prev;
      console.log("New sidebar state:", newState);
      return newState;
    });
  };

  return (
    <SidebarContext.Provider
      value={{ isSidebarOpen, toggleSidebar, projects, setProjectsSidebar }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export const useSidebar = () => useContext(SidebarContext);
