import React from "react";
import CustomTabNavHeaderItem from "./CustomTabNavHeaderItem";
const CustomTabNavHeader = ({
  id = "id_tab_generico",
  tabElements = [],
  currentTab = 0,
  eventDeleteTab = () => {},
  eventSelectedTab = () => {}
}) => {
  return (
    <ul
      className="nav nav-tabsx mb-3 dx-tabs tab-header-custom"
      id={`${id}-tab`}
      role="tablist"
    >
      {tabElements.map((x, i) => (
        <CustomTabNavHeaderItem
          key={`CTNHI_${i}`}
          item={x}
          index={i}
          currentTab={currentTab}
          eventDeleteTab={eventDeleteTab}
          eventSelectedTab={eventSelectedTab}
        />
      ))}
    </ul>
  );
};
export default CustomTabNavHeader;
