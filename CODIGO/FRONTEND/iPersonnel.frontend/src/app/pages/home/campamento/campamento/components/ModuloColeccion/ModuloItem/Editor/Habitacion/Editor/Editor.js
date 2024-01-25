import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl"; 
import { Grid, Row, Col } from 'react-flexbox-grid';
import "./style.css";

import { HabitacionItemEditorBotonera, HabitacionItemEditorConfigurador, HabitacionItemEditorData } from "."
import { ItemSectionType } from "../../../../";
import { Button } from "devextreme-react/button";

const HabitacionItemEditor = ({
  parent,
  item,
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
  const [ parentUniqueDataField, setParentUniqueDataField ] = useState();
  const [ pk, setPk ] = useState();
  
  const hide = () => {
    selectItemInEdit(parent, { forSelected: { DetailSectionType: undefined, Habitacion: undefined,  } });
  }

  useEffect(() => {
    setParentUniqueDataField(parent.ParentUniqueDataField);
  }, [parent.ParentUniqueDataField]);

  useEffect(() => {
    if (!!parentUniqueDataField) {
      const { [parentUniqueDataField]: pk } = item;
      setPk(pk);
    } else setPk(undefined);
  }, [item[parentUniqueDataField]]);

  return (
    <Grid fluid className={getClassName()}>
      <Row className="hie mb-3">
        <div className="kt-widget1">
          <div className="kt-widget1__header mr-3">
            <span className="kt-widget1__title">Editor de la Habitación</span>
            <div className="buttons-header">
              <Button className="icon-inline" icon="fas fa-eye-slash" hint="Ocultar editor" onClick={hide}
              />
            </div>
          </div>
        </div>
      </Row>
      <Row className="mb-3">
        <Col className={getItemSectionClassName(ItemSectionType.Data)} xs={12} sm={12} md={3} lg={2}>
          <HabitacionItemEditorData parent={parent}
            item={item}
            pk={pk}
            selectItemInEdit={selectItemInEdit}
          />
        </Col>
        <Col className={getItemSectionClassName(ItemSectionType.Configurator)} xs={12} sm={12} md={6} lg={8}>
          <HabitacionItemEditorConfigurador parent={parent}
            item={item}
            pk={pk}
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
          <HabitacionItemEditorBotonera parent={parent}
            item={item}
            pk={pk}
            toolbar={toolbar} 
            selectItemInEdit={selectItemInEdit}
          />
        </Col>
      </Row>
    </Grid>
  );
};

export default injectIntl(HabitacionItemEditor);
