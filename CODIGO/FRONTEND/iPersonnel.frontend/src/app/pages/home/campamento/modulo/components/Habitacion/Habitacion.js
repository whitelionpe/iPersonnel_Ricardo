import React, { useState, useEffect } from "react";
import { Button } from "devextreme-react";
import { Grid, Row, Col } from 'react-flexbox-grid';
import Toolbar from "@material-ui/core/Toolbar";
import MultiViewItem, { CommonViewItemType, SuccessMessageViewItem, ErrorMessageViewItem } from "../../../../../../partials/components/MultiViewItem";
import { arrayPrimitiveValueToObject } from "../../../../../../partials/shared/ArrayAndObjectHelper";
import { DataView, Configuration, Summary, DataEditor, Configurator } from ".";
import LayoutView from "../../../../../../partials/components/LayoutView";
import { isArray, isNullOrUndefined, isObject } from "../../../../../../partials/shared/CommonHelper";
import { prefixCama, ClassNameHabitacion, toolTipTextTemplate, buttonHintTextTemplate, buttonIcon, Actions } from "../Shared";
import { sectionContentType } from "../../../../../../partials/components/BoxesGrid/BoxesGrid";

const Habitacion = ({
  data,
  changes, 
  applyChanges,
  performAction,
}) => {
  // --------------------------------------------------------------------
  // declarations
  // --------------------------------------------------------------------
  const uniqueDataFieldForMVI = 'type';
  const timeoutMesageView = 2000;
  const ViewType = { ...CommonViewItemType, Configuration: 'Configuration', Configurator: 'Configurator', Summary: 'Summary' };
  const rawSource = [ ViewType.DataView, ViewType.Configuration, ViewType.Summary, ViewType.DataEditor, ViewType.Configurator, ViewType.SuccessMessageViewItem, ViewType.ErrorMessageViewItem ];
  const rawMessageViews = [ ViewType.SuccessMessageViewItem, ViewType.ErrorMessageViewItem ];
  const auxSource = arrayPrimitiveValueToObject(rawSource, uniqueDataFieldForMVI);
  const auxMessageViews = arrayPrimitiveValueToObject(rawMessageViews, uniqueDataFieldForMVI);
  const redirectViewFromMessage = ({ selected }) => (selected.type === ViewType.ErrorMessageViewItem ? { type: ViewType.DataEditor } : { type: ViewType.DataView });
  const ComponentTagType = { DataView, Configuration, Summary, DataEditor, Configurator, SuccessMessageViewItem, ErrorMessageViewItem };
  const botonIcon = { ...buttonIcon };
  const botonHint = {
    DataView: buttonHintTextTemplate.DataView('de la Habitación'),
    Configuration: buttonHintTextTemplate.Configuration('de la Habitación'),
    Summary: buttonHintTextTemplate.Summary('de la Habitación'),
    DataEditor: buttonHintTextTemplate.DataEditor('de la Habitación'),
    Configurator: buttonHintTextTemplate.Configurator('la Habitación'),
  };
  const toolTip = {
    Edit: toolTipTextTemplate.Edit('la Cama'),
    Active: toolTipTextTemplate.Active('Cama', false),
    Inactive: toolTipTextTemplate.Inactive('Cama', false),
  };
  // --------------------------------------------------------------------
  const uniqueId = "id";
  const uniqueDataFieldForConfiguration = "IdCama";
  const textDataField = "Etiqueta";
  const rowField = "FilaCama";
  const colField = "ColumnaCama";
  const valueForUndefined = {};
  const childrenPropertyName = "Camas";
  const prefixEtiqueta = prefixCama;
  // --------------------------------------------------------------------
  const [rootData, setRootData] = useState({});
  const [targetData, setTargetData] = useState({});
  const [source] = useState(auxSource);
  const [messageViews] = useState(auxMessageViews);
  const [viewItemSelected, setViewItemSelected] = useState({ type: ViewType.DataView });
  // --------------------------------------------------------------
  
  // --------------------------------------------------------------
  const changeToView = (viewType) => setViewItemSelected({ type: viewType });
  const renderBotonera = () => {
    const { type } = viewItemSelected || {};
    return Object.keys(botonHint).map(viewType => {
      return (
        <Button className="mr-2" 
          key={viewType}
          bisabled={type === viewType}
          hint={botonHint[viewType]}
          icon={botonIcon[viewType]}
          onClick={() => changeToView(viewType)}
        />
      );
    });
  }
  const rtClickHandler = ({ data, contentType }) => {
    if (contentType === sectionContentType.Span) return false;
    applyChanges({ Cama: data });
  }
  const mClickHandler = () => {}
  const getExtraProps = type => {
    switch (type) {
      case ViewType.Configuration: 
      case ViewType.Configurator: 
        return { 
          rtClickHandler,
          mClickHandler,
          uniqueId, 
          uniqueDataField: uniqueDataFieldForConfiguration, 
          textDataField, 
          rowField, 
          colField, 
          valueForUndefined, 
          childrenPropertyName, 
          classNameBox: ClassNameHabitacion,
          prefixEtiqueta, 
          toolTip, 
        };
    }
    return {};
  }
  const viewItemComponent = ({ data, viewItemData: { type } = {} }) => {
    if (!isNullOrUndefined(type)) {
      const { [type]: ComponentTag } = ComponentTagType;
      if (!isNullOrUndefined(ComponentTag)) {
        return (<ComponentTag data={data} { ...getExtraProps(type) }/>);
      }
    }
    return (<></>);
  };
  const renderHeader = () => {
    return (
      <Grid fluid className="habitacion-acc">
        <Row middle="xs" between="xs">
          <Col xs={1} className="border-r">
            <div className="title">
              <h4>Habitación</h4>
            </div>
          </Col>
          <Col xsOffset={9} xs={2} className="border-l">
            <div className="habitacion-acc-t">
              <Toolbar variant="dense">
                { renderBotonera() }
              </Toolbar>
            </div>
          </Col>
        </Row>
      </Grid>
    );
  }
  const renderCenter = ({data}) => {
    return (
      <MultiViewItem data={data}
        source={source}
        selected={viewItemSelected}
        uniqueId={uniqueDataFieldForMVI}
        uniqueDataField={uniqueDataFieldForMVI}
        viewItemComponent={viewItemComponent}
        multiViewItemCssClass="px-0 habitacion-view-item"
        messageViews={messageViews}
        redirectViewFromMessage={redirectViewFromMessage}
        timeoutMesageView={timeoutMesageView}
      />
    );
  }
  const getVisible = () => isObject(targetData) && 'IdHabitacion' in targetData && !isNullOrUndefined(targetData['IdHabitacion']);
  // --------------------------------------------------------------------

  // --------------------------------------------------------------------
  // functionalities for the component
  // --------------------------------------------------------------------
  const loadData = async () => {
    if (!isNullOrUndefined(changes)) {
      const { Habitacion } = changes;
      if (isObject(Habitacion)) {
        const { IdHabitacion, Fila: FilaHabitacion, Columna: ColumnaHabitacion } = Habitacion;
        const camas = await performAction(Actions.GetCamas, { IdHabitacion, FilaHabitacion, ColumnaHabitacion });
        if (isArray(camas)) {
          Habitacion[childrenPropertyName] = camas;
          setTargetData(Habitacion);
        }
      }
    }
  }
  // --------------------------------------------------------------------
  
  // --------------------------------------------------------------------
  // functionality for effects
  // --------------------------------------------------------------------
  const performOnAfterChangedData = () => setRootData(!isNullOrUndefined(data) ? data : {});
  const performOnAfterChangedChanges = () => { loadData(); }
  // --------------------------------------------------------------------

  // --------------------------------------------------------------------
  // attach effects
  // --------------------------------------------------------------------
  useEffect(performOnAfterChangedData, [data]);
  useEffect(performOnAfterChangedChanges, [changes]);
  // useEffect(() => {
  //   // console.log("Modulo ===> useEffect -> data", data);
  //   setViewItemSelected({ ...viewItemSelected });
  // }, [ data ]);
  // --------------------------------------------------------------------

  // --------------------------------------------------------------------
  // rendering
  // --------------------------------------------------------------------
  return (
    <>
      {
        <LayoutView data={targetData}
          visible={getVisible()}
          layoutCssClass="habitacion-layout-content"
          centerCssClass="px-0"
          renderHeader={renderHeader}
          renderCenter={renderCenter}
        />
      }
    </>
  );
  // --------------------------------------------------------------------
};

export default Habitacion;