import React, { useState, useEffect } from "react";
import ScrollBar from "react-perfect-scrollbar";
import BaseConfigurator from "../../BaseConfigurator";
import BoxesGrid from "../../../../../../../partials/components/BoxesGrid/BoxesGrid";

import { isNullOrUndefined } from "../../../../../../../partials/shared/CommonHelper";

import "react-perfect-scrollbar/dist/css/styles.css";

const Configuration = ({
  data,
  uniqueId,
  uniqueDataField,
  textDataField,
  rowField,
  colField,
  valueForUndefined,
  childrenPropertyName,
  prefixEtiqueta,
  classNameBox,
  toolTip,
}) => {
  // --------------------------------------------------------------------
  // declarations
  // --------------------------------------------------------------------
  const [itemData, setItemData] = useState(data);  
  // --------------------------------------------------------------------

  // --------------------------------------------------------------------
  // functionalities for the component
  // --------------------------------------------------------------------
  const render = ({
    source,
    uniqueId,
    uniqueDataField,
    textDataField,
    columnCount,
    cssClassBox,
    mConfig,
    getWidth,
  }) => {
    return (
      <ScrollBar component="div" className="max-width-config">
        <BoxesGrid source={source}
          columnCount={columnCount}
          uniqueId={uniqueId}
          uniqueDataField={uniqueDataField}
          textDataField={textDataField}
          readOnly={true}
          width={getWidth()}
          cssClass="mb-3"
          cssClassBox={cssClassBox}
          mConfig={mConfig}
          showEvenWithoutData={true}
          emptyDataMessage="No se ha configurado la Habitación."
          selectedCssClass="verde-petroleo"
        />
      </ScrollBar>
    );
  }
  // --------------------------------------------------------------------
  
  // --------------------------------------------------------------------
  // functionality for effects
  // --------------------------------------------------------------------
  const performOnAfterChangedData = () => setItemData(!isNullOrUndefined(data) ? data : {});
  // --------------------------------------------------------------------

  // --------------------------------------------------------------------
  // attach effects
  // --------------------------------------------------------------------
  useEffect(performOnAfterChangedData, [data]);
  // --------------------------------------------------------------------

  // --------------------------------------------------------------------
  // rendering
  // --------------------------------------------------------------------
  return (
    <>
      {
        <BaseConfigurator { 
          ...{
            itemData,
            uniqueId,
            uniqueDataField,
            textDataField,
            rowField,
            colField,
            valueForUndefined,
            childrenPropertyName,
            prefixEtiqueta,
            classNameBox,
            toolTip,
            render,
          }
        } />
      }
    </>
  );
  // --------------------------------------------------------------------
};

export default Configuration;