// ButtonGroup.js
import React from "react";

const ButtonGroup = ({ onFriendGameClick, onRandomGameClick }) => (
  <div className="button-group">
    <button onClick={onFriendGameClick} className="styled-button">
      Play a friend
    </button>
    <button onClick={onRandomGameClick} className="styled-button">
      Random game
    </button>
  </div>
);

export default ButtonGroup;