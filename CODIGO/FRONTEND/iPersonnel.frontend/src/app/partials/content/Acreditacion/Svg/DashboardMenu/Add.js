
import React from "react";

const AddIcon = ({ width = "24px", height = "24px", stroke = "#F9F9FA" }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24" fill="none">
      <path d="M12 4.5V19.5M19.5 12H4.5" stroke="#141516" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  );
};

export default AddIcon;
