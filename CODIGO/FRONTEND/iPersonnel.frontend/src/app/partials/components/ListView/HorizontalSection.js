import React, { useState, useEffect } from "react";
import { isPrimitive, isFunction } from "../../shared/CommonHelper";
import { sysHorizontalSectionCssClass } from ".";

const HorizontalSection = ({
  source,
  idPropertyName,
  uniqueId,
  uniqueDataField,
  selected,
  changes,
  applyChanges,
  render, 
  cssClass: usrCssClass,
}) => {
  // --------------------------------------------------------------------
  // declarations
  // --------------------------------------------------------------------
  const [cssClass, setCssClass] = useState(sysHorizontalSectionCssClass);
  // --------------------------------------------------------------------

  // --------------------------------------------------------------------
  // functionalities for the component
  // --------------------------------------------------------------------
  const calculateCssClass = () => {
    if (!isPrimitive(usrCssClass) && !isFunction(usrCssClass)) setCssClass(sysHorizontalSectionCssClass);
    if (isPrimitive(usrCssClass)) setCssClass(`${sysHorizontalSectionCssClass} ${usrCssClass}`);
    if (isFunction(usrCssClass)) setCssClass(`${sysHorizontalSectionCssClass} ${usrCssClass()}`);
  }
  // --------------------------------------------------------------------
  
  // --------------------------------------------------------------------
  // functionality for effects
  // --------------------------------------------------------------------
  const performOnAfterChangedUsrCssClass = () => {
    calculateCssClass();
  }
  // --------------------------------------------------------------------

  // --------------------------------------------------------------------
  // attach effects
  // --------------------------------------------------------------------
  useEffect(performOnAfterChangedUsrCssClass, [usrCssClass]);
  // --------------------------------------------------------------------

  // --------------------------------------------------------------------
  // rendering
  // --------------------------------------------------------------------
  return (
    <>
      {
        isFunction(render) && 
        <div className={cssClass}>
          { render({ source, idPropertyName, uniqueId, uniqueDataField, selected, changes, applyChanges, render, cssClass: usrCssClass }) }
        </div>
      }
    </>
  );
  // --------------------------------------------------------------------
};

export default HorizontalSection;