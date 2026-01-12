import React, { useMemo } from "react";
import "./ItemCard.scss";

const ItemCard = ({
  item,
  faceDown = false,
  disabled = false,
  selected = false, // NEW
  onClick = null,
}) => {
  const name = typeof item?.name === "string" ? item.name : "Unknown Item";
  const text = typeof item?.text === "string" ? item.text : "";

  const canClick = typeof onClick === "function" && !disabled;

  const className = useMemo(() => {
    let s = "itemCard";
    if (faceDown) s += " faceDown";
    if (selected) s += " selected";
    if (!canClick) s += " disabled";
    if (canClick) s += " clickable";
    return s;
  }, [faceDown, selected, canClick]);

  return (
    <button
      type="button"
      className={className}
      onClick={canClick ? onClick : null}
      disabled={!canClick}
      aria-label={faceDown ? "Face-down item card" : name}
    >
      {faceDown ? (
        <div className="itemCardBack">
          <div className="itemCardBackMark">?</div>
          <div className="itemCardBackLabel">Item</div>
        </div>
      ) : (
        <div className="itemCardFront">
          <div className="itemCardName">{name}</div>
          <div className="itemCardText">{text}</div>
        </div>
      )}
    </button>
  );
};

export default ItemCard;
