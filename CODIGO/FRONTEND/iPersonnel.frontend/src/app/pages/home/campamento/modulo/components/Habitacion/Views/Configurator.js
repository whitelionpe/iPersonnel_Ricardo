import React, { useState, useEffect } from "react";
import { Button } from "devextreme-react";
import { Grid, Row, Col } from 'react-flexbox-grid';
import Toolbar from "@material-ui/core/Toolbar";
import ScrollBar from "react-perfect-scrollbar";
import LayoutView from "../../../../../../../partials/components/LayoutView";
import BoxesGrid from "../../../../../../../partials/components/BoxesGrid/BoxesGrid";
import BaseConfigurator from "../../BaseConfigurator";

import { isArray, isNullOrUndefined, isObject, isSet } from "../../../../../../../partials/shared/CommonHelper";

import "react-perfect-scrollbar/dist/css/styles.css";
import { Typography } from "@material-ui/core";

const Configurator = ({
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
  rtClickHandler,
  mClickHandler,
  toolTip,
}) => {
  // --------------------------------------------------------------------
  // declarations
  // --------------------------------------------------------------------
  const [itemData, setItemData] = useState(data);
  const [source, setSource] = useState([]);
  const [columnCount, setColumnCount] = useState(1);
  const [ltConfig, setLtConfig] = useState({});
  const [rtConfig, setRtConfig] = useState({});
  const [mConfig, setMConfig] = useState({});
  const [width, setWidth] = useState(undefined);
  const [toolbar, setToolbar] = useState([]);
  const [boxHelper, setBoxHelper] = useState({});
  // --------------------------------------------------------------------

  // --------------------------------------------------------------------
  // functionalities for the component
  // --------------------------------------------------------------------
  const onChange = ({ source, columnCount, ltConfig, rtConfig, mConfig, width, toolbar, boxHelper } = {}) => {
    setSource(isArray(source) ? source : []);
    setColumnCount(columnCount || 1);
    setLtConfig(ltConfig || {});
    setRtConfig(rtConfig || {});
    setMConfig(mConfig || {});
    setWidth(width || 500);
    setToolbar(toolbar || []);
    setBoxHelper(boxHelper || {});
  }
  const renderHeader = () => {
    const [ addRow, removeRow, addCol, removeCol ] = toolbar;
    return (
      <Grid fluid className="habitacion-config-acc">
        <Row middle="xs" between="xs">
          <Col xs={2} className="border-r">
            <div className="title">
              <h5>Acciones del configurador</h5>
            </div>
          </Col>
          <Col xsOffset={6} xs={2} className="border-l">
            <div className="habitacion-config-acc-btns">
              <Toolbar variant="dense" className="px-2">
                <Typography variant="h6" color="inherit" className="desc-acc">
                  Acc. Fila
                </Typography>
                <div className="btns-container">
                  <Button className="mr-2 ml-5" visible={!!addRow} { ...addRow } />
                  <Button className="mr-2" visible={!!removeRow} { ...removeRow } />
                </div>
              </Toolbar>
            </div>
          </Col>
          <Col xs={2} className="border-l">
            <div className="habitacion-config-acc-btns">
              <Toolbar variant="dense" className="px-2">
                <Typography variant="h6" color="inherit" className="desc-acc">
                  Acc. Columna
                </Typography>
                <div className="btns-container">
                  <Button className="mr-2 ml-5" visible={!!addCol} { ...addCol } />
                  <Button className="mr-2" visible={!!removeCol} { ...removeCol } />                
                </div>
              </Toolbar>
            </div>
          </Col>
        </Row>
      </Grid>
    );
  }
  const renderCenter = () => {
    return (
      <>
        {
          isArray(source) && isObject(ltConfig) && isObject(rtConfig) && isObject(mConfig) && isSet(width) && isObject(boxHelper) && 'cssClassBox' in boxHelper &&
          <ScrollBar component="div">
            <BoxesGrid source={source}
              columnCount={columnCount}
              uniqueId={uniqueId}
              uniqueDataField={uniqueDataField}
              textDataField={textDataField}
              width={width}
              cssClass="mb-3"
              cssClassBox={boxHelper.cssClassBox}
              ltConfig={ltConfig}
              rtConfig={rtConfig}
              mConfig={mConfig}
              showEvenWithoutData={true}
              emptyDataMessage="No se ha configurado la Habitación."
              selectedCssClass="verde-petroleo"
            />
          </ScrollBar>
        }
      </>
    );
  }
  const render = () => {
    return (
      <LayoutView data={itemData}
        layoutCssClass="habitacion-configurator"
        centerCssClass="px-0 max-width-config"
        renderHeader={renderHeader}
        renderCenter={renderCenter}
      />
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
            rtClickHandler,
            mClickHandler,
            toolTip,
            onChange,
            render,
          }
        } />
      }
    </>
  );
  // --------------------------------------------------------------------
};

export default Configurator;