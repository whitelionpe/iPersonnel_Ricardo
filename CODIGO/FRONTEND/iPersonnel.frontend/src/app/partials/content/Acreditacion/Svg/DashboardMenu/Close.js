
import React from "react";

const CloseIcon = ({ style= {}, width = "24px", height = "24px", stroke = "#010101" }) => {
  return (
    <svg style={style} xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24" fill="none">
      <path d="M6.4 19L5 17.6L10.6 12L5 6.4L6.4 5L12 10.6L17.6 5L19 6.4L13.4 12L19 17.6L17.6 19L12 13.4L6.4 19Z" fill={stroke}/>
    </svg>
  );
};

export default CloseIcon;
