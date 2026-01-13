import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import Modal from "./modal";

export const MODAL_BUTTONS = Object.freeze({
  OK: "OK",
  YES_NO: "YES_NO",
  CUSTOM_TEXT: "CUSTOM_TEXT",
  NONE: "NONE",
});

const ModalContext = createContext(null);

export const ModalProvider = ({ children }) => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: "",
    content: null,
    buttons: MODAL_BUTTONS.OK,
    customButtonText: "Submit",
    autoClose: null,
    locked: false,
    onClick: null,
    onYes: null,
    onNo: null,
    onClose: null,
  });

  const closeModal = useCallback(() => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const openModal = useCallback(
    ({
      title,
      modalContent,
      content, // allow either name
      buttons = MODAL_BUTTONS.OK,
      customButtonText = "Submit",
      autoClose = null,
      locked = false,
      onClick = null,
      onYes = null,
      onNo = null,
      onClose = null,
    } = {}) => {
      const resolvedContent = content ?? modalContent ?? null;

      setModalState({
        isOpen: true,
        title: title ?? "",
        content: resolvedContent,
        buttons,
        customButtonText,
        autoClose,
        locked,
        onClick,
        onYes,
        onNo,
        onClose: typeof onClose === "function" ? onClose : closeModal,
      });
    },
    [closeModal]
  );

  const value = useMemo(() => ({ openModal, closeModal }), [openModal, closeModal]);

  return (
    <ModalContext.Provider value={value}>
      {children}

      <Modal
        isOpen={modalState.isOpen}
        title={modalState.title}
        content={modalState.content}
        buttons={modalState.buttons}
        customButtonText={modalState.customButtonText}
        autoClose={modalState.autoClose}
        locked={modalState.locked}
        onClick={modalState.onClick}
        onYes={modalState.onYes}
        onNo={modalState.onNo}
        onClose={modalState.onClose}
      />
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("useModal must be used within a ModalProvider");
  return ctx;
};
