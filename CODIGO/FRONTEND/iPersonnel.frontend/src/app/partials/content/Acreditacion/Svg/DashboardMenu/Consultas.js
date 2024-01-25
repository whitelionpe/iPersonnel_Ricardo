import React from "react";

const ConsultasIcon = ({ width = "20px", height = "20px", stroke = "#141516" }) => {
  return (
  <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24" fill="none">
    <path d="M11 20C15.9706 20 20 15.9706 20 11C20 6.02944 15.9706 2 11 2C6.02944 2 2 6.02944 2 11C2 15.9706 6.02944 20 11 20Z" stroke={stroke} stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M21 21L18 18" stroke={stroke} stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
  );
};

export default ConsultasIcon;
