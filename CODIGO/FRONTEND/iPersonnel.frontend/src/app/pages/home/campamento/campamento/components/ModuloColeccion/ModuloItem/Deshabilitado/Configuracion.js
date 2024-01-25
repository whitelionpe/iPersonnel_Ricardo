import React, { useEffect } from "react";
import { injectIntl } from "react-intl"; 
import BoxesGrid from "../../../../../../../../partials/components/BoxesGrid/BoxesGrid";
import ScrollBar from "react-perfect-scrollbar";
import "react-perfect-scrollbar/dist/css/styles.css";

const ModuloItemDeshabilitadoConfiguracion = ({
  item,
  source,
  uniqueId, 
  uniqueDataField, 
  textDataField,
  columnCount,
  getWidth,
  cssClassBox,
  mConfig,
  intl,
}) => {
  
  return (
    <div className="mic">
      <ScrollBar component="div">
        <BoxesGrid source={source}
          columnCount={columnCount}
          uniqueId={uniqueId}
          uniqueDataField={uniqueDataField}
          textDataField={textDataField}
          width={getWidth()}
          cssClass="mb-3"
          cssClassBox={cssClassBox}
          mConfig={mConfig}
          showEvenWithoutData={true}
          emptyDataMessage="No se ha configurado el campamento."
        />
      </ScrollBar>
    </div>
  );
};

export default injectIntl(ModuloItemDeshabilitadoConfiguracion);
