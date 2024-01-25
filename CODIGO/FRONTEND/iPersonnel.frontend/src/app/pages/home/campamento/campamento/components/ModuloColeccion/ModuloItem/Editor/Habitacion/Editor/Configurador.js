import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl"; 
import BoxesGrid from "../../../../../../../../../../partials/components/BoxesGrid/BoxesGrid";
import ScrollBar from "react-perfect-scrollbar";
import "react-perfect-scrollbar/dist/css/styles.css";

const HabitacionItemEditorConfigurador = ({
  parent,
  item,
  pk,
  source,
  uniqueId, 
  uniqueDataField, 
  textDataField,
  columnCount,
  getWidth,
  cssClassBox,
  readOnly,
  ltConfig,
  rtConfig,
  mConfig,
  intl,
}) => {
  return (
    <div className="hic">
      <ScrollBar component="div">
        <BoxesGrid source={!!pk ? source : undefined}
          columnCount={columnCount}
          uniqueId={uniqueId}
          uniqueDataField={uniqueDataField}
          textDataField={textDataField}
          readOnly={readOnly}
          width={getWidth()}
          cssClass="mb-3"
          cssClassBox={cssClassBox}
          ltConfig={ltConfig}
          rtConfig={rtConfig}
          mConfig={mConfig}
          showEvenWithoutData={!!pk}
          emptyDataMessage={ !!pk ? 'No se ha configurado la Habitación' : 'Debe crear la habitación para poder configurarla.' }
        />
      </ScrollBar>
    </div>
  );
};

export default injectIntl(HabitacionItemEditorConfigurador);
