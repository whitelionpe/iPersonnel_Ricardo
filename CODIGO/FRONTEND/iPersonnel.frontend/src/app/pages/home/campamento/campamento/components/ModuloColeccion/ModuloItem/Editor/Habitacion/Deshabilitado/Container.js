import React, { useState } from "react";
import { injectIntl } from "react-intl"; 
import { Grid, Row, Col } from 'react-flexbox-grid';
import "react-perfect-scrollbar/dist/css/styles.css";

import { v4 as uuid4 } from "uuid";
import { sectionContentType } from "../../../../../../../../../../partials/components/BoxesGrid/BoxesGrid";

import "./style.css";
import HabitacionItemDeshabilitadoConfiguracion from "./Configuracion";
import { ClassNameHabitacion, ItemSectionType } from "../../../../";
import { HabitacionItemDeshabilitadoDataInfo } from ".";

const HabitacionItemDeshabilitado = ({
  parent,
  item,
  selectItemInEdit,
  intl,
}) => {
  const [cantidadColumnas, setCantidadColumnas] = useState(1);
  const [source, setSource] = useState([]);

  /* ================================================================================================================== */
  /* ****************************************************** DATA ****************************************************** */
  /* ================================================================================================================== */
  
  /* ================================================================================================================== */
  /* ************************************************** CONFIGURADOR ************************************************** */
  /* ================================================================================================================== */
  const cssClassBox = ({ CssClassKey }) => ClassNameHabitacion[CssClassKey];
  const getWidthCampamento = () => {
    return cantidadColumnas ? 110*cantidadColumnas : 550;
  }
  const mConfig = {
    icon: 'fas fa-plus',
    text: ({ Etiqueta }) => Etiqueta,
    cssClass: ({ data: { EsContenido }, contentType }) => !EsContenido && contentType === sectionContentType.Icon ? 'center-icon' : '',
    isText: data => data.EsContenido,
    tooltip: ({ EsContenido, Activo }) => EsContenido ? (Activo ? 'Módulo Activo' : 'Módulo Inactivo') : 'Definir como Módulo',
    showPopoverWhenClicked: ({ EsContenido }) => EsContenido,
  }
  const generateConfig = (data) => {
    if (!data || data.length === 0) return data;
    return data.map(row => {
      return row.map(item => {
        const { EsContenido, Activo } = item;
        item = { ...item, id: uuid4(), CssClassKey: EsContenido ? (Activo ? 'S' : 'N') : 'V' };
        return item;
      });
    });
  }
  /* ================================================================================================================== */
  /* **************************************************** BOTONERA **************************************************** */
  /* ================================================================================================================== */
  
  const getItemSectionClassName = itemSectionType => {
    let className = '';
    switch(itemSectionType) {
      case ItemSectionType.Configurator:
        className = 'hi-col-middle';
        break;
    }
    return className;
  }

  return (
    <Grid fluid className="hi disabled">
      <Row className="my-3">
        <Col className={getItemSectionClassName(ItemSectionType.Data)} xs={12} sm={12} md={3} lg={2}>
          <HabitacionItemDeshabilitadoDataInfo item={item}
            selectItemInEdit={selectItemInEdit}
          />
        </Col>
        <Col className={getItemSectionClassName(ItemSectionType.Configurator)} xs={12} sm={12} md={6} lg={8}>
          <HabitacionItemDeshabilitadoConfiguracion item={item}
            source={source}
            setSource={setSource}
            cantidadColumnas={cantidadColumnas}
            getWidthCampamento={getWidthCampamento}
            cssClassBox={cssClassBox}
            mConfig={mConfig}
            generateConfig={generateConfig}
            // -----------------------------
            selectItemInEdit={selectItemInEdit}
          />
        </Col>
      </Row>
    </Grid>
  );
};

export default injectIntl(HabitacionItemDeshabilitado);
