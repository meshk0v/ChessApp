import React from "react";
import './TimeSelection.css'

const TimeSelection = ({ onSelectTime }) => (
  <div className="time-selection">
    <h2>Select game time::</h2>
    <div className="time-buttons">
      {[1, 5, 10, 15, 30, 60].map(time => (
        <button key={time} onClick={() => onSelectTime(time)} className="styled-button-time">
          {time} minut{time > 1 ? 'es' : 'e'}
        </button>
      ))}
    </div>
  </div>
);

export default TimeSelection;
