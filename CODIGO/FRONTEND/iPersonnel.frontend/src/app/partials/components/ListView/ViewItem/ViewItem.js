import React, { useState, useEffect } from "react";
import { isPrimitive, isFunction } from "../../../shared/CommonHelper";
import { sysViewItemCssClass } from "../";

const ViewItem = ({
  item,
  idPropertyName,
  uniqueId,
  uniqueDataField,
  selected,
  changes,
  applyChanges,
  isSelected,
  targetChanges,
  mergeData,
  render, 
  cssClass: usrCssClass,
}) => {
  // --------------------------------------------------------------------
  // declarations
  // --------------------------------------------------------------------
  const [cssClass, setCssClass] = useState();
  // --------------------------------------------------------------------

  // --------------------------------------------------------------------
  // functionalities for the component
  // --------------------------------------------------------------------
  const calculateCssClass = () => {
    if (!isPrimitive(usrCssClass) && !isFunction(usrCssClass)) setCssClass(sysViewItemCssClass);
    if (isPrimitive(usrCssClass)) setCssClass(`${sysViewItemCssClass} ${usrCssClass}`);
    if (isFunction(usrCssClass)) setCssClass(`${sysViewItemCssClass} ${usrCssClass(item)}`);
  }
  // --------------------------------------------------------------------
  
  // --------------------------------------------------------------------
  // functionality for effects
  // --------------------------------------------------------------------
  const performOnAfterChangedItem = () => {
    calculateCssClass();
  }
  const performOnAfterChangedUsrCssClass = () => {
    calculateCssClass();
  }
  // --------------------------------------------------------------------

  // --------------------------------------------------------------------
  // attach effects
  // --------------------------------------------------------------------
  useEffect(performOnAfterChangedItem, [item]);
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
          { render({ item, idPropertyName, uniqueId, uniqueDataField, selected, changes, applyChanges, isSelected, targetChanges, mergeData, cssClass: usrCssClass }) }
        </div>
      }
    </>
  );
  // --------------------------------------------------------------------
};

export default ViewItem;