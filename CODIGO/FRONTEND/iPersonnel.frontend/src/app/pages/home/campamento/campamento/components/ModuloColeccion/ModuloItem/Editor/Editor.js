import React from "react";
import { injectIntl } from "react-intl"; 
import { Grid, Row, Col } from 'react-flexbox-grid';
import "react-perfect-scrollbar/dist/css/styles.css";

import { ModuloItemEditorBotonera, ModuloItemEditorConfigurador, ModuloItemEditorData } from "."
import HabitacionItem from "./Habitacion";
import { ItemSectionType } from "../../";

import "./style.css";

const ModuloItemEditor = ({
  item,
  child,
  selectItemInEdit,
  // ------------------
  source,
  uniqueId, 
  uniqueDataField, 
  textDataField,
  columnCount,
  cssClassBox,
  ltConfig,
  rtConfig,
  mConfig,
  readOnly,
  // ----
  toolbar,
  getClassName,
  getItemSectionClassName,
  getWidth,
  // ------------------
  intl,
}) => {
  
  return (
    <Grid fluid className={getClassName()}>
      <Row className="my-3">
        <Col className={getItemSectionClassName(ItemSectionType.Data)} xs={12} sm={12} md={3} lg={2}>
          <ModuloItemEditorData item={item}
            selectItemInEdit={selectItemInEdit}
          />
        </Col>
        <Col className={getItemSectionClassName(ItemSectionType.Configurator)} xs={12} sm={12} md={6} lg={8}>
          <ModuloItemEditorConfigurador item={item}
            source={source}
            columnCount={columnCount}
            getWidth={getWidth}
            cssClassBox={cssClassBox}
            uniqueId={uniqueId}
            uniqueDataField={uniqueDataField}
            textDataField={textDataField}
            readOnly={readOnly}
            ltConfig={ltConfig}
            rtConfig={rtConfig}
            mConfig={mConfig}
            // -----------------------------
            selectItemInEdit={selectItemInEdit}
          />
        </Col>
        <Col className={getItemSectionClassName(ItemSectionType.Buttons)} xs={12} sm={12} md={3} lg={2}>
          <ModuloItemEditorBotonera item={item}
            visible={!item.Disabled}
            toolbar={toolbar} 
            selectItemInEdit={selectItemInEdit}
          />
        </Col>
      </Row>
      <HabitacionItem parent={item} 
        item={child} 
        selectItemInEdit={selectItemInEdit}
        visible={!!child}
      />
    </Grid>
  );
};

export default injectIntl(ModuloItemEditor);
