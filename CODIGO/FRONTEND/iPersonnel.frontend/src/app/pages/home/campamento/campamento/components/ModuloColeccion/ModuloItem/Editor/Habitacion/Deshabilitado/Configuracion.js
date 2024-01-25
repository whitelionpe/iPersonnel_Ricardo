import React, { useEffect } from "react";
import { injectIntl } from "react-intl"; 
import BoxesGrid from "../../../../../../../../../../partials/components/BoxesGrid/BoxesGrid";
import ScrollBar from "react-perfect-scrollbar";
import "react-perfect-scrollbar/dist/css/styles.css";

const ModuloItemDeshabilitadoConfiguracion = ({
  item,
  source,
  setSource,
  cantidadColumnas,
  getWidthCampamento,
  cssClassBox,
  ltConfig,
  mConfig,
  generateConfig,
  intl,
}) => {
  
  useEffect(() => {
    setSource(generateConfig(source));
  }, []);

  return (
    <div className="hic">
      <ScrollBar component="div">
        <BoxesGrid source={source}
          columnCount={cantidadColumnas}
          uniqueDataField="id"
          textDataField="Etiqueta"
          width={getWidthCampamento()}
          cssClass="mb-3"
          cssClassBox={cssClassBox}
          ltConfig={ltConfig}
          mConfig={mConfig}
          showTitlePopover={true}
          titlePopover="Ingresar Etiqueta Módulo"
          widthPopover={650}
          showEvenWithoutData={true}
          emptyDataMessage="No se ha configurado el campamento."
        />
      </ScrollBar>
    </div>
  );
};

export default injectIntl(ModuloItemDeshabilitadoConfiguracion);
