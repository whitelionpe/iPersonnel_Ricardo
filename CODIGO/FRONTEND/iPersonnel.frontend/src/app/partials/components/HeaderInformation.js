import React, { useState, useEffect } from "react";
import AppBar from "@material-ui/core/AppBar";
import Form from "devextreme-react/form";
import { isArray, isNullOrUndefined, isObject, isSet } from "../shared/CommonHelper";

const isDefined = value => typeof value === 'undefined' || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || typeof value === 'function';

const HeaderInformation = ({
  data,
  visible,
  minColWidth,
  colCount,
  showColonAfterLabel = true,
  labelLocation,
  toolbar,
  cssClass,
  width,
  componenteAdicional = null,
  arrayColSize = [6, 3, 3], //Solo en caso exista componente adicional se asigna el valor de col-x
}) => {

  let existeToolbar = !isDefined(toolbar);
  let existeComponenteAdicional = componenteAdicional != null;

  const [formData, setFormData] = useState({});
  const [dataByDataField, setDataByDataField] = useState({});

  const customizeItem = item => {
    const { itemType, dataField } = item;
    if (itemType == "simple") {
      const metadata = dataByDataField[dataField];
      if (dataField in dataByDataField && isObject(metadata)) {
        const { text, value, colSpan, width } = metadata;
        if (text) item.label = { text };
        if (colSpan) item.colSpan = colSpan;
        if (value) item.editorOptions = { value };
        if (!isNullOrUndefined(width)) item.editorOptions = { ...item.editorOptions, width };
      }
    }
  }

  useEffect(() => {
    let tmpData = {}, tmpByDataField = {};
    if (data && typeof data === 'object') {
      // if ('length' in data) {
      if (isArray(data)) {
        data.forEach(item => {
          const { text, value } = item;
          tmpData[text] = value;
          tmpByDataField[text] = item;
        });
      } else tmpData = data;
    }
    setFormData(tmpData);
    setDataByDataField(tmpByDataField);
  }, [data]);


  return (
    <AppBar className={isSet(cssClass) ? cssClass : ''} position="static" elevation={0} style={{ backgroundColor: '#f1f6ff', borderBottom: '1px solid #ebedf2', ...(!isNullOrUndefined(width) ? { width } : {}) }}>
      <div className="row">
        <div className=

          {existeToolbar ?
            (existeComponenteAdicional ? `col-${arrayColSize[0]}` : 'col-9')
            : 'col-12'}>

          <Form className="cabecera-info"
            formData={formData}
            readOnly={true}
            showColonAfterLabel={showColonAfterLabel}
            labelLocation={labelLocation || 'left'}
            visible={visible}
            minColWidth={minColWidth || 200}
            colCount={colCount || 'auto'}
            customizeItem={customizeItem}
          >
          </Form>
        </div>

        {
          existeComponenteAdicional ?
            (<div className={`col-${arrayColSize[1]}`}>
              {componenteAdicional}
            </div>)
            : null
        }
        {
          existeToolbar ?
            existeComponenteAdicional ?
              (<div className={`col-${arrayColSize[2]}`}>{toolbar}</div>)
              : (<div className="col-3">{toolbar}</div>)
            : null
        }
      </div>
    </AppBar >
  );
}

export default HeaderInformation;