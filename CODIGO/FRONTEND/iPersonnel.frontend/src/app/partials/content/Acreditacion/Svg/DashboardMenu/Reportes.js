import React from "react";

const ReportesIcon = ({ width = "20px", height = "20px", stroke = "#141516" }) => {
  return (
  <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24" fill="none">
    <path d="M1 18L12 23L23 18" stroke={stroke} stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M1 11.5L12 16.5L23 11.5" stroke={stroke} stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M12 1L23 5L12 10L1 5L12 1Z" stroke={stroke} stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
  );
};

export default ReportesIcon;
