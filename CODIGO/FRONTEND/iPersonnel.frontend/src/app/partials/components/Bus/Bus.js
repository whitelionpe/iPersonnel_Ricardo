import React, { useState } from "react";
import { Grid, Row, Col } from 'react-flexbox-grid';
import { Popover } from 'devextreme-react/popover';
import { Tooltip } from 'devextreme-react/tooltip';

import { FilaTipoUno, FilaTipoDos, FilaTipoTres, FilaTipoCuatro, FilaTipoCinco, FilaTipoSeis, FilaTipoSiete } from './Fila';

import "./style.css";

const animationConfig = {
  show: {
    type: 'pop',
    from: {
      scale: 0
    },
    to: {
      scale: 1
    }
  },
  hide: {
    type: 'fade',
    from: 1,
    to: 0
  }
};

export const sectionType = {
  LeftTop: 'lt',
  RightTop: 'rt',
  Middle: 'm',
  LeftBottom: 'lb',
  RightBottom: 'rb',
};

export const toolbarType = {
  Left: 'l',
  Top: 't',
  Right: 'r',
  Bottom: 'b',
};

export const eventType = {
  Click: 'Click',
  DoubleClick: 'DoubleClick',
};

export const sectionContentType = {
  Span: 'span',
  Icon: 'icon',
};

export const columnLayoutType = {
  One: 1,
  Two: 2,
  Three: 3,
  Four: 4,
  Five: 5,
  Six: 6,
  Seven: 7,
};

export const cssClassType = {
  CelestePastel: 'celeste-pastel',
  AmarilloClaro: 'amarillo-claro',
  VerdeClaro: 'verde-claro',
  Anaranjado: 'anaranjado',
  Azul: 'azul',
  Inactivo: 'inactivo',
  Opaco50: 'opaco50',
};

const properties = {
  TitlePopover: 'titlePopover',
  ShadingPopover: 'shadingPopover',
  ShowTitlePopover: 'showTitlePopover',
  PositionPopover: 'positionPopover',
  CloseOnOutsideClickPopover: 'closeOnOutsideClickPopover',
  PositionTooltip: 'positionTooltip',
  WidthPopover: 'widthPopover',
  CssClass: 'cssClass',
}
/*
  las propiedades xxConfig (donde xx: puede ser [lt, rt, m, lb, rb]) es un objeto con las siguientes propiedades: 
  { 
    dataField,                    ->
    text,                         ->
    icon,                         ->
    isText,                       -> Si isText: true (se mostrará text en esa sección, si es false se mostrará icon).
    showPopoverWhenClicked,       ->
    showPopoverWhenDoubleClicked, ->
    visible,                      -> 
    disabled,                     ->
    tooltip,                      ->
    clickHandler,                 ->
  }
*/
const Bus = ({
  source,
  width,  // Es el ancho del contenedor del Bus
  columnCount,  // Es tipo de distribución de columnas para el Bus
  uniqueDataField,  // Propiedad del objeto Asiento que es único por cada asiento (pk).
  textDataField, // Propiedad del objeto Asiento, que contiene el texto a mostrar en la sección central del Componente Asiento.
  cssClass, // La clase CSS que se le aplicará al componente Bus.
  cssClassItem, // La clase CSS que se le aplicará a cada componente Asiento.
  // -------------------------------------------------------------------------------------------------------------
  // Sections
  // -------------------------------------------------------------------------------------------------------------
  ltConfig, // Configuración de la sección Left-Top
  rtConfig, // Configuración de la sección Right-Top
  mConfig,  // Configuración de la sección Middle
  lbConfig, // Configuración de la sección Left-Bottom
  rbConfig, // Configuración de la sección Right-Bottom
  // -------------------------------------------------------------------------------------------------------------
  // Toolbars
  // -------------------------------------------------------------------------------------------------------------
  rToolbar,
  // -------------------------------------------------------------------------------------------------------------
  positionTooltip,
  positionPopover,
  closeOnOutsideClickPopover,
  shadingPopover,
  showTitlePopover,
  titlePopover,
  contentRenderPopover,
  onHiddenPopover,
  widthPopover,
  showEvenWithoutData,
  emptyDataMessage,
}) => {
  const [isVisiblePopover, setIsVisiblePopover] = useState(false);
  const [type, setType] = useState();
  const [contentType, setContentType] = useState();
  const [eventSourceType, setEventSourceType] = useState();
  const [popoverTarget, setPopoverTarget] = useState('');
  const [selected, setSelected] = useState({});
  const [isVisibleTooltip, setIsVisibleTooltip] = useState(false);
  const [tooltipTarget, setTooltipTarget] = useState('');
  const [tooltip, setTooltip] = useState('');

  const componenteFila = {
    1: FilaTipoUno,
    2: FilaTipoDos,
    3: FilaTipoTres,
    4: FilaTipoCuatro,
    5: FilaTipoCinco,
    6: FilaTipoSeis,
    7: FilaTipoSiete,
  };

  const hidePopover = () => {
    setIsVisiblePopover(false);
  }
  const toggleTooltip = (show) => {
    if (typeof show === 'boolean') {
      setIsVisibleTooltip(show);
    } else {
      setIsVisibleTooltip(!isVisibleTooltip);
    }
  }
  const getProp = (property) => {
    let prop = getDefaultProp(property);
    const source = getSourceProp(property);
    if (source && isPrimitive(typeof source)) prop = source;
    if (source && typeof source === 'function') {
      switch (property) {
        case properties.CssClass:
          prop = source();
          break;
        case properties.TitlePopover:
          prop = source(type, selected);
          break;
        default:
          prop = source(type);
          break;
      }
    }
    return prop;
  }
  const getSourceProp = prop => {
    switch (prop) {
      case properties.TitlePopover: return titlePopover;
      case properties.ShadingPopover: return shadingPopover;
      case properties.ShowTitlePopover: return showTitlePopover;
      case properties.PositionPopover: return positionPopover;
      case properties.CloseOnOutsideClickPopover: return closeOnOutsideClickPopover;
      case properties.PositionTooltip: return positionTooltip;
      case properties.WidthPopover: return widthPopover;
      case properties.CssClass: return cssClass;
    }
  }
  const getDefaultProp = property => {
    switch (property) {
      case properties.TitlePopover: return '';
      case properties.ShadingPopover: return false;
      case properties.ShowTitlePopover: return false;
      case properties.PositionPopover: return 'top';
      case properties.CloseOnOutsideClickPopover: return true;
      case properties.PositionTooltip: return 'top';
      case properties.WidthPopover: return 500;
      case properties.CssClass: return '';
    }
  }
  const getMainElementClassName = () => {
    if (showEvenWithoutData && !(source && source.length > 0)) return 'bus p-5';
    return 'bus';
  }
  const isPrimitive = value => typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
  const popoverInstance = {
    isVisible: isVisiblePopover,
    hide: hidePopover,
  }
  const contentRenderPopoverMain = () => {
    if (contentRenderPopover) {
      return contentRenderPopover({ type, data: selected, eventSourceType, contentType, instance: popoverInstance });
    }
  }
  const onHiddenPopoverMain = (e) => {
    if (onHiddenPopover) {
      return onHiddenPopover({ event: e, type, data: selected, eventSourceType, contentType, instance: popoverInstance });
    }
  }
  const configAsiento = {
    uniqueDataField,
    textDataField,
    cssClass: cssClassItem,
    ltConfig,
    rtConfig,
    mConfig,
    lbConfig,
    rbConfig,
    setPopoverTarget,
    setType,
    setIsVisiblePopover,
    setSelected,
    setTooltipTarget,
    toggleTooltip,
    setTooltip,
    setEventSourceType,
    setContentType,
    isVisiblePopover,
  };
  const renderFilas = () => {
    if (source && source.length > 0) {
      return source.map((row, index) => {
        if (row && row.length > 0) {
          const TagFila = componenteFila[columnCount];
          return (
            <TagFila key={index} index={index} row={row} configAsiento={configAsiento} />
          );
        }
      });
    }
  }
  const renderToolbar = (type, toolbarConfig) => {
    let separatorClassName = '';
    switch (type) {
      case toolbarType.Left: separatorClassName = 'ml-2'; break;
      case toolbarType.Top: separatorClassName = ''; break;
      case toolbarType.Right: separatorClassName = 'mr-2'; break;
      case toolbarType.Bottom: separatorClassName = ''; break;

    }
    if (toolbarConfig && toolbarConfig.length > 0) {
      return toolbarConfig.map((button, index) => {
        if (button) {
          return (
            <span key={index} onClick={button.onClick}>
              <i className={`${button.icon} ${separatorClassName}`}></i>
              {button.text}
            </span>
          );
        }
      });
    }
  }

  return (
    <>
      {
        (showEvenWithoutData || (source && source.length > 0)) &&
        <>
          {/* <Grid className="mb-3 p-3" style={{ 'width': `${width + 50}px` }}> */}
          <Grid className={`mb-3 p-3 ${getProp(properties.CssClass)}`} style={{ 'width': `${width + 50}px` }}>
            {/* @TODO */}
            {/* <Row>
              <Col></Col>
              <Col></Col>
              <Col></Col>
            </Row> */}
            <Row>
              {/* @TODO */}
              {/* <Col></Col> */}
              <Col>
                {/* <Grid className={`bus ${getProp(properties.CssClass)}`} style={{ 'width': `${width}px` }}> */}
                <Grid className={getMainElementClassName()} style={{ 'width': `${width}px` }}>
                  {renderFilas()}
                </Grid>
              </Col>
              <Col>
                {/* <div className="side-right">
                  <i class="fas fa-caret-right fa-2x"></i>
                </div> */}
                <div className="toolbar-right">
                  { renderToolbar(toolbarType.Right, rToolbar) }
                  {/* <span>
                    <i class="fas fa-plus mr-1"></i>
                    Agregar fila
                  </span>
                  <span>
                    <i class="fas fa-times mr-1"></i>
                    Eliminar fila
                  </span> */}
                </div>
                {/* <div className="toolbar-right">
                  <i class="fas fa-caret-right"></i>
                  <i class="fas fa-times"></i>
                  <i class="fas fa-plus"></i>
                  <i class="fas fa-check"></i>
                  <i class="fas fa-ban"></i>
                </div> */}
              </Col>
            </Row>
            {/* @TODO */}
            {/* <Row>
              <Col xs={12} sm={12} md={12} lg={12}>
                <div className="side-bottom">
                  <i class="fas fa-caret-down fa-2x"></i>
                </div>
              </Col>
            </Row> */}
          </Grid>
          <Popover
            target={popoverTarget}
            position={getProp(properties.PositionPopover)}
            width={getProp(properties.widthPopover)}
            showTitle={getProp(properties.ShowTitlePopover)}
            title={getProp(properties.TitlePopover)}
            visible={isVisiblePopover}
            onHiding={hidePopover}
            shading={getProp(properties.ShadingPopover)}
            shadingColor="rgba(0, 0, 0, 0.5)"
            animation={animationConfig}
            contentRender={contentRenderPopoverMain}
            closeOnOutsideClick={getProp(properties.CloseOnOutsideClickPopover)}
            onHidden={onHiddenPopoverMain}
          >
          </Popover>



          
          <Tooltip
            target={tooltipTarget}
            position={getProp(properties.PositionTooltip)}
            animation={animationConfig}
            visible={isVisibleTooltip}
            closeOnOutsideClick={false}
          >
            <div>{tooltip}</div>
          </Tooltip>
        </>
      }
      {
        !(showEvenWithoutData || (source && source.length > 0)) &&
        <h3 className="sin-data mt-5">{emptyDataMessage}</h3>
      }
    </>
  );
}

export default Bus;
