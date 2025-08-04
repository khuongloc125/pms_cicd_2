import React, { createContext, useState } from "react";

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const triggerSuccess = (message) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const triggerError = (message) => {
    setErrorMessage(message);
    setShowError(true);
    setTimeout(() => setShowError(false), 3000);
  };

  return (
    <NotificationContext.Provider
      value={{
        showSuccess,
        successMessage,
        triggerSuccess,
        showError,
        errorMessage,
        triggerError,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};