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
  const ViewType = { ...CommonViewItemType };
  const rawSource = [ ViewType.DataView, ViewType.DataEditor, ViewType.SuccessMessageViewItem, ViewType.ErrorMessageViewItem ];
  const rawMessageViews = [ ViewType.SuccessMessageViewItem, ViewType.ErrorMessageViewItem ];
  const auxSource = arrayPrimitiveValueToObject(rawSource, uniqueDataFieldForMVI);
  const auxMessageViews = arrayPrimitiveValueToObject(rawMessageViews, uniqueDataFieldForMVI);
  const redirectViewFromMessage = ({ selected }) => (selected.type === ViewType.ErrorMessageViewItem ? { type: ViewType.DataEditor } : { type: ViewType.DataView });
  const ComponentTagType = { DataView, DataEditor, SuccessMessageViewItem, ErrorMessageViewItem };
  const botonIcon = { ...buttonIcon };
  const botonHint = {
    DataView: buttonHintTextTemplate.DataView('de la Cama'),
    DataEditor: buttonHintTextTemplate.DataEditor('de la Cama'),
  };
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
  const viewItemComponent = ({ data, viewItemData: { type } = {} }) => {
    if (!isNullOrUndefined(type)) {
      const { [type]: ComponentTag } = ComponentTagType;
      if (!isNullOrUndefined(ComponentTag)) {
        return (<ComponentTag data={data} />);
      }
    }
    return (<></>);
  };
  const renderHeader = () => {
    return (
      <Grid fluid className="cama-acc">
        <Row middle="xs" between="xs">
          <Col xs={1} className="border-r">
            <div className="title">
              <h4>Cama</h4>
            </div>
          </Col>
          <Col xsOffset={9} xs={2} className="border-l">
            <div className="cama-acc-t">
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
        multiViewItemCssClass="px-0 cama-view-item"
        messageViews={messageViews}
        redirectViewFromMessage={redirectViewFromMessage}
        timeoutMesageView={timeoutMesageView}
      />
    );
  }
  const getVisible = () => isObject(targetData) && 'IdCama' in targetData && !isNullOrUndefined(targetData['IdCama']);
  // --------------------------------------------------------------------

  // --------------------------------------------------------------------
  // functionalities for the component
  // --------------------------------------------------------------------
  const loadData = async () => {
    if (!isNullOrUndefined(changes)) {
      const { Cama } = changes;
      if (isObject(Cama)) {
        setTargetData(Cama);
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
  // --------------------------------------------------------------------

  // --------------------------------------------------------------------
  // rendering
  // --------------------------------------------------------------------
  return (
    <>
      {
        <LayoutView data={targetData}
          visible={getVisible()}
          layoutCssClass="cama-layout-content"
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