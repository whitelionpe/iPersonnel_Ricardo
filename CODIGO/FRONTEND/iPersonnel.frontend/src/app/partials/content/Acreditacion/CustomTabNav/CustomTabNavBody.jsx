import React from "react";

const CustomTabNavBody = ({ id = "", currentTab = 0, index = 0, children }) => {
  return (
    <div
      className={`nav-item-body tab-pane fade ${
        currentTab == index ? "show active" : ""
      }`}
      id={`${id}`}
      role="tabpanel"
      aria-labelledby={`${id}-tab`}
    >
      {children}
    </div>
  );
};

export default CustomTabNavBody;
