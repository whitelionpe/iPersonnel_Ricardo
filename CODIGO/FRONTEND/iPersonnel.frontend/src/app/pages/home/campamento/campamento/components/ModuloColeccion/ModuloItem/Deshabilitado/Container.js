import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl"; 
import { Grid, Row, Col } from 'react-flexbox-grid';
import "react-perfect-scrollbar/dist/css/styles.css";

import { ItemSectionType } from "../../";
import { ModuloItemDeshabilitadoDataInfo } from ".";
import ModuloItemDeshabilitadoConfiguracion from "./Configuracion";
import "./style.css";
// import { v4 as uuid4 } from "uuid";
// import { sectionContentType } from "../../../../../../../../partials/components/BoxesGrid/BoxesGrid";
// import { ClassNameModulo } from "../../";
// import { transformToFormattedData } from "../../../../../../../../partials/components/BoxesGrid/BoxesGridHelper";
// import { prefixHabitacion } from "../../Shared";

const ModuloItemDeshabilitado = ({
  item,
  selectItemInEdit,
  source,
  columnCount,
  getWidth,
  mConfig,
  cssClassBox,
  uniqueId,
  uniqueDataField,
  textDataField,
  readOnly,
  getItemSectionClassName,
  intl,
}) => {
  // const [columnCount, setColumnCount] = useState(1);
  // const [source, setSource] = useState([]);

  // /* ================================================================================================================== */
  // /* ****************************************************** DATA ****************************************************** */
  // /* ================================================================================================================== */
  
  // /* ================================================================================================================== */
  // /* ************************************************** CONFIGURADOR ************************************************** */
  // /* ================================================================================================================== */
  
  // const [ uniqueId, uniqueDataField, textDataField, rowField, colField, valueForUndefined ] = [ 'id', 'IdHabitacion', 'Etiqueta', 'Fila', 'Columna', {} ];
  // const transformItem = item => ({ ...item, [textDataField]: getEtiquetaBasadaEnLaPosicion({ row: item[rowField], col: item[colField] }) });

  // const cssClassBox = ({ CssClassKey }) => ClassNameModulo[CssClassKey];
  // const getWidth = () => {
  //   return columnCount ? 110*columnCount : 550;
  // }
  // const mConfig = {
  //   text: ({ Etiqueta }) => Etiqueta,
  //   cssClass: ({ data: { EsContenido }, contentType }) => !EsContenido && contentType === sectionContentType.Icon ? 'center-icon' : '',
  //   isText: data => data.EsContenido,
  //   tooltip: ({ EsContenido, Activo }) => EsContenido ? (Activo ? 'Módulo Activo' : 'Módulo Inactivo') : 'Definir como Módulo',
  // }
  // const generateConfig = (data) => {
  //   if (!data || data.length === 0) return data;
  //   return data.map(row => {
  //     return row.map(item => {
  //       const { EsContenido, Activo } = item;
  //       item = { ...item, id: uuid4(), CssClassKey: EsContenido ? (Activo ? 'S' : 'N') : 'V' };
  //       return item;
  //     });
  //   });
  // }
  // const getEtiquetaBasadaEnLaPosicion = ({ row, col }) => {
  //   const numeroModulo = row * columnCount + (col + 1);
  //   return `${prefixHabitacion}${numeroModulo.toString().padStart(2, '0')}`;
  // }
  // /* ================================================================================================================== */
  // /* **************************************************** BOTONERA **************************************************** */
  // /* ================================================================================================================== */
  
  // const getItemSectionClassName = itemSectionType => {
  //   let className = '';
  //   switch(itemSectionType) {
  //     case ItemSectionType.Configurator:
  //       className = 'mi-col-middle';
  //       break;
  //   }
  //   return className;
  // }

  // useEffect(() => {
  //   const { Habitaciones = [] } = item;
  //   const formattedSource = transformToFormattedData(Habitaciones, { rowField, colField, uniqueId, uniqueDataField, valueForUndefined, transformItem });
  //   const colCount = Array.isArray(formattedSource) && Array.isArray(formattedSource[0]) ? formattedSource[0].length : 0;
  //   setColumnCount(colCount);
  //   setSource(generateConfig(formattedSource));
  //   // console.log("formattedSource - colCount", formattedSource, colCount);
  // }, [item.Habitaciones]);

  return (
    <Grid fluid className="mi disabled">
      <Row className="my-3">
        <Col className={getItemSectionClassName(ItemSectionType.Data)} xs={12} sm={12} md={3} lg={2}>
          <ModuloItemDeshabilitadoDataInfo item={item}
            selectItemInEdit={selectItemInEdit}
          />
        </Col>
        <Col className={getItemSectionClassName(ItemSectionType.Configurator)} xs={12} sm={12} md={6} lg={8}>
          <ModuloItemDeshabilitadoConfiguracion item={item}
            source={source}
            columnCount={columnCount}
            getWidth={getWidth}
            mConfig={mConfig}
            cssClassBox={cssClassBox}
            uniqueId={uniqueId}
            uniqueDataField={uniqueDataField}
            textDataField={textDataField}
            mConfig={mConfig}
            readOnly={readOnly}
            // -----------------------------
            selectItemInEdit={selectItemInEdit}
          />
        </Col>
      </Row>
    </Grid>
  );
};

export default injectIntl(ModuloItemDeshabilitado);
