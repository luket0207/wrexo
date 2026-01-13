// engine/ui/modal/modal.jsx
import React, { useEffect, useMemo } from "react";
import ReactDOM from "react-dom";
import Button, { BUTTON_VARIANT } from "../button/button";
import { MODAL_BUTTONS } from "./modalContext";
import "./modal.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

const Modal = ({
  isOpen,
  title,
  content,
  buttons = MODAL_BUTTONS.OK,
  customButtonText = "Submit",
  autoClose = null,
  onClick,
  onYes,
  onNo,
  onClose,
  locked = false,
}) => {
  const isLocked = Boolean(locked);

  const isAutoCloseEnabled = useMemo(() => {
    if (isLocked) return false;
    if (autoClose == null) return false;
    const seconds = Number(autoClose);
    return Number.isFinite(seconds) && seconds > 0;
  }, [autoClose, isLocked]);

  const hasTitle = typeof title === "string" ? title.trim().length > 0 : Boolean(title);

  const footerConfig = useMemo(() => {
    const safeClose = typeof onClose === "function" ? onClose : () => {};

    // Primary action (OK). If none provided, default is just closing.
    const okHandler = typeof onClick === "function" ? onClick : safeClose;

    const yesHandler = typeof onYes === "function" ? onYes : safeClose;
    const noHandler = typeof onNo === "function" ? onNo : safeClose;

    // IMPORTANT:
    // Any close gesture (X, overlay, Escape, autoClose) should behave like "OK action"
    // AND also close the modal.
    const closeHandler = () => {
      // If an explicit onClick exists, treat it as the close action too.
      if (typeof onClick === "function") {
        onClick();
      }
      // Always invoke onClose to actually close/reset modal state.
      safeClose();
    };

    return { okHandler, yesHandler, noHandler, safeClose, closeHandler };
  }, [onClick, onYes, onNo, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e) => {
      // Do not allow manual close on autoClose modals or when locked
      if (isAutoCloseEnabled || isLocked) return;

      if (e.key === "Escape") footerConfig.closeHandler();
    };

    document.addEventListener("keydown", onKeyDown);

    // Prevent background scroll while modal is open
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, isAutoCloseEnabled, footerConfig]);

  useEffect(() => {
    if (!isOpen) return;
    if (!isAutoCloseEnabled) return;

    const seconds = Number(autoClose);

    const timeoutId = window.setTimeout(() => {
      footerConfig.closeHandler();
    }, seconds * 1000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isOpen, isAutoCloseEnabled, autoClose, footerConfig]);

  if (!isOpen) return null;

  const modalNode = (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(e) => {
        // Do not allow manual close on autoClose modals or when locked
        if (isAutoCloseEnabled || isLocked) return;

        // Close when clicking the backdrop only (not the modal itself)
        if (e.target === e.currentTarget) footerConfig.closeHandler();
      }}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-label={hasTitle ? title : "Modal"}>
        {hasTitle && (
          <div className="modal__header">
            <div className="modal__title">{title}</div>

            {!isAutoCloseEnabled && !isLocked && (
              <button
                type="button"
                className="modal__close"
                onClick={footerConfig.closeHandler}
                aria-label="Close modal"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            )}
          </div>
        )}

        <div className="modal__body">{content || <h2>Modal</h2>}</div>

        {buttons !== MODAL_BUTTONS.NONE && (
          <div className="modal__footer">
            {buttons === MODAL_BUTTONS.YES_NO && (
              <>
                <Button variant={BUTTON_VARIANT.SECONDARY} onClick={footerConfig.noHandler}>
                  No
                </Button>
                <Button variant={BUTTON_VARIANT.PRIMARY} onClick={footerConfig.yesHandler}>
                  Yes
                </Button>
              </>
            )}

            {buttons === MODAL_BUTTONS.OK && (
              <Button variant={BUTTON_VARIANT.PRIMARY} onClick={footerConfig.okHandler}>
                OK
              </Button>
            )}

            {buttons === MODAL_BUTTONS.CUSTOM_TEXT && (
              <Button variant={BUTTON_VARIANT.PRIMARY} onClick={footerConfig.okHandler}>
                {customButtonText || "Submit"}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalNode, document.body);
};

export default Modal;
