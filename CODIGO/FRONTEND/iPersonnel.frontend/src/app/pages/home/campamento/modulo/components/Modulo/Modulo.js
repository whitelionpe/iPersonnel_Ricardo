import React, { useState, useEffect } from "react";
import { Button } from "devextreme-react";
import { Grid, Row, Col } from 'react-flexbox-grid';
import Pagination from "react-bootstrap-4-pagination";
import Toolbar from "@material-ui/core/Toolbar";
import MultiViewItem, { CommonViewItemType, SuccessMessageViewItem, ErrorMessageViewItem } from "../../../../../../partials/components/MultiViewItem";
import { arrayPrimitiveValueToObject } from "../../../../../../partials/shared/ArrayAndObjectHelper";
import { DataView, Configuration, Summary, DataEditor, Configurator } from ".";
import LayoutView from "../../../../../../partials/components/LayoutView";
import { isNullOrUndefined, isString } from "../../../../../../partials/shared/CommonHelper";
import { prefixHabitacion, ClassNameModulo, toolTipTextTemplate, buttonHintTextTemplate, buttonIcon } from "../Shared";
import { isFunction, isSet } from "../../../../../../partials/shared/CommonHelper";
import { sectionContentType } from "../../../../../../partials/components/BoxesGrid/BoxesGrid";

const Modulo = ({
  data,
  currentPage: usrCurrentPage,
  totalPages: usrTotalPages,
  onChangePage: usrOnChangePage,
  changes, 
  applyChanges
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
    DataView: buttonHintTextTemplate.DataView('del Módulo'),
    Configuration: buttonHintTextTemplate.Configuration('del Módulo'),
    Summary: buttonHintTextTemplate.Summary('del Módulo'),
    DataEditor: buttonHintTextTemplate.DataEditor('del Módulo'),
    Configurator: buttonHintTextTemplate.Configurator('el Módulo'),
  };
  const toolTip = {
    DefineAsEmpty: toolTipTextTemplate.DefineAsEmpty,
    Configure: toolTipTextTemplate.Configure('la Habitación'),
    Edit: toolTipTextTemplate.Edit('la Habitación'),
    Active: toolTipTextTemplate.Active('Habitación', false),
    Inactive: toolTipTextTemplate.Inactive('Habitación', false),
    DefineAsContent: toolTipTextTemplate.DefineAsContent('Habitación'),
  };
  // --------------------------------------------------------------------
  const uniqueId = "id";
  const uniqueDataFieldForConfiguration = "IdHabitacion";
  const textDataField = "Etiqueta";
  const rowField = "Fila";
  const colField = "Columna";
  const valueForUndefined = {};
  const childrenPropertyName = "Habitaciones";
  const prefixEtiqueta = prefixHabitacion;
  // --------------------------------------------------------------------
  const originalShowMax = 5;
  // const [data, setData] = useState();
  const [currentPage, setCurrentPage] = useState(usrCurrentPage);
  const [totalPages, setTotalPages] = useState(usrTotalPages);
  const [showMax, setShowMax] = useState(originalShowMax);

  // En éste caso targetData y rootData son lo mismo
  const [targetData, setTargetData] = useState({});
  const [source] = useState(auxSource);
  const [messageViews] = useState(auxMessageViews);
  const [viewItemSelected, setViewItemSelected] = useState({ type: ViewType.DataView });

  // --------------------------------------------------------------
  const calculateAdjustmentForShowMaxButtonsForPagination = (page) => {
    setCurrentPage(page);
    let newShowMax = totalPages - page >= Math.floor(originalShowMax/2) ? originalShowMax : totalPages - page + 1;
    newShowMax = newShowMax > 3 ? newShowMax : 3;
    if (page === totalPages) newShowMax = 2;
    if (showMax !== newShowMax) setShowMax(newShowMax);
  }
  const onChangePage = page => {
    usrOnChangePage(page);
  }
  // --------------------------------------------------------------
  const changeToView = (viewType) => setViewItemSelected({ type: viewType });
  const renderBotonera = () => {
    const { type } = viewItemSelected || {};
    return Object.keys(botonHint).map(viewType => {
      return (
        <Button className="mr-2" 
          key={viewType}
          disabled={type === viewType}
          hint={botonHint[viewType]}
          icon={botonIcon[viewType]}
          onClick={() => changeToView(viewType)}
        />
      );
    });
  }
  const rtClickHandler = (e) => {
    const { data, contentType } = e;
    // console.log("rtClickHandler -> e, data, contentType", e, data, contentType);
    if (contentType === sectionContentType.Span) return false;
    applyChanges({ Habitacion: data });
  }
  // const rtClickHandler = ({ data: Habitacion, contentType }) => {
  //   if (contentType === sectionContentType.Span) return false;
  //   const { [uniqueDataField]: pk } = Habitacion;
  //   if (!!pk) {
  //     (async () => {
  //       const Camas = (await getCamas(Habitacion));
  //       // console.log("perform -> Camas", Camas);
  //       Habitacion = { ...Habitacion, Camas };
  //       selectItemInEdit(item, { forSelected: { Habitacion, DetailSectionType: ItemSectionType.EditorContainer, ParentUniqueDataField: uniqueDataField } });
  //     })();
  //   } else {
  //     selectItemInEdit(item, { forSelected: { Habitacion, DetailSectionType: ItemSectionType.EditorContainer, ParentUniqueDataField: uniqueDataField } });
  //   }
  // }
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
          classNameBox: ClassNameModulo,
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
      <Grid fluid className="modulo-acc">
        <Row middle="xs" between="xs">
          <Col xs={1} className="border-r">
            <div className="title">
              <h4>Piso</h4>
            </div>
          </Col>
          <Col xs={2} className="border-r">
            {
              isSet(currentPage) && isSet(totalPages) && isFunction(onChangePage) && 
              <div className="vcg-wrapper-pagination">
                <Pagination threeDots
                  prevNext
                  shadow={false}
                  prevNext={false}
                  size="md"
                  totalPages={totalPages}
                  showMax={showMax}
                  color="#337ab7"
                  activeBgColor="#337ab7"
                  activeBorderColor="#164873"
                  currentPage={currentPage}
                  onClick={onChangePage}
                />
              </div>
            }
          </Col>
          <Col xs={1} className="border-r">
            <div className="modulo-acc-t">
              <Toolbar variant="dense">
                <Button icon="fas fa-layer-group" hint="Crear Piso" onClick={console.log} />
              </Toolbar>
            </div>
          </Col>
          <Col xsOffset={6} xs={2} className="border-l">
            <div className="modulo-acc-t">
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
        multiViewItemCssClass="px-0 modulo-view-item"
        messageViews={messageViews}
        redirectViewFromMessage={redirectViewFromMessage}
        timeoutMesageView={timeoutMesageView}
        // height={300}
      />
    );
  }
  // --------------------------------------------------------------------

  // --------------------------------------------------------------------
  // functionalities for the component
  // --------------------------------------------------------------------
  // --------------------------------------------------------------------
  
  // --------------------------------------------------------------------
  // functionality for effects
  // --------------------------------------------------------------------
  const performOnAfterChangedData = () => setTargetData(!isNullOrUndefined(data) ? data : {});
  const performOnAfterChangedCurrentPage = () => calculateAdjustmentForShowMaxButtonsForPagination(currentPage);
  const performOnAfterChangedUsrCurrentPage = () => setCurrentPage(usrCurrentPage);
  const performOnAfterChangedUsrTotalPages = () => setTotalPages(usrTotalPages);
  // --------------------------------------------------------------------

  // --------------------------------------------------------------------
  // attach effects
  // --------------------------------------------------------------------
  useEffect(performOnAfterChangedData, [data]);
  useEffect(performOnAfterChangedCurrentPage, [currentPage]);
  useEffect(performOnAfterChangedUsrCurrentPage, [usrCurrentPage]);
  useEffect(performOnAfterChangedUsrTotalPages, [usrTotalPages]);
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
          layoutCssClass="modulo-layout-content"
          centerCssClass="px-0"
          renderHeader={renderHeader}
          renderCenter={renderCenter}
        />
      }
    </>
  );
  // --------------------------------------------------------------------
};

export default Modulo;