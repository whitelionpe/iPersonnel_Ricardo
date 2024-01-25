import React, { createRef } from "react";
import { Grid, Row, Col } from 'react-flexbox-grid';

import { sectionType, eventType } from '../BoxesGrid';
import Section from './Section';

const classNameSections = {
  'lt': 'lt',
  'rt': 'rt',
  'm': 'm',
  'lb': 'lb',
  'rb': 'rb',
};

const properties = {
  IsText: 'isText',
  Text: 'text',
  Icon: 'icon',
  CssClass: 'cssClass',
  Tooltip: 'tooltip',
  Visible: 'visible',
  Disabled: 'disabled',
  ShowPopoverWhenClicked: 'showPopoverWhenClicked',
  ShowPopoverWhenDoubleClicked: 'showPopoverWhenDoubleClicked',
  ClickHandler: 'clickHandler',
  DoubleClickHandler: 'doubleClickHandler',
}

const Box = ({
  data,
  // ------------------------------
  uniqueId,
  uniqueDataField,
  textDataField,
  readOnly,
  cssClass,
  ltConfig,
  rtConfig,
  mConfig,
  lbConfig,
  rbConfig,
  // ------------------------------
  setPopoverTarget,
  setType,
  setIsVisiblePopover,
  setSelected,
  setTooltipTarget,
  toggleTooltip,
  setTooltip,
  setEventSourceType,
  setContentType,
  // ------------------------------
  position,
  isSelected = false,
  selected,
  selectedCssClass = '',
}) => {
  const ltCaptionRef = createRef();
  const rtCaptionRef = createRef();
  const mCaptionRef = createRef();
  const lbCaptionRef = createRef();
  const rbCaptionRef = createRef();

  const ltIconRef = createRef();
  const rtIconRef = createRef();
  const mIconRef = createRef();
  const lbIconRef = createRef();
  const rbIconRef = createRef();

  const toggleTooltipHandler = (type) => {
    const ref = getRef(type);
    const tooltip = getProp(type, properties.Tooltip);
    if (ref && ref.current && tooltip) {
      setTooltipTarget(ref.current);
      setTooltip(tooltip);
      toggleTooltip();
    }
    toggleTooltip(!!tooltip);
  }
  const getClassNameCaption = (type) => {
    const disabled = getProp(type, properties.Disabled) ? 'vcg-disabled' : '';
    return `${disabled} ${classNameSections[type]}`;
  }
  const getClassNameIcon = (type) => {
    const disabled = getProp(type, properties.Disabled) ? 'vcg-disabled' : '';
    return `${getProp(type, properties.Icon)} ${disabled} ${classNameSections[type]}`;
  }
  const getProp = (type, property, otherParamsArray = undefined) => {
    let prop = getDefaultProp(property);
    const config = getConfig(type);
    if (property === properties.Text) {
      if (type === sectionType.Middle && textDataField) {
        prop = data[textDataField];
      }
      if (config && config.dataField) prop = data[config.dataField];
    }
    if (config && isDefined(config[property]) && isPrimitive(typeof config[property])) prop = config[property];
    if (config && isDefined(config[property]) && typeof config[property] === 'function') {
      switch (property) {
        case properties.CssClass:
        case properties.ClickHandler:
        case properties.DoubleClickHandler:
          prop = config[property].call(undefined, ...otherParamsArray);
          break;
        default:
          prop = config[property](data);
          break;
      }
    }
    return prop;
  }
  const getDefaultProp = property => {
    switch (property) {
      case properties.IsText: return true;
      case properties.Text: return undefined;
      case properties.Icon: return undefined;
      case properties.CssClass: return '';
      case properties.Tooltip: return undefined;
      case properties.Visible: return true;
      case properties.Disabled: return false;
      case properties.ShowPopoverWhenClicked: return false;
      case properties.ShowPopoverWhenDoubleClicked: return false;
      case properties.ClickHandler: return undefined;
      case properties.DoubleClickHandler: return undefined;
    }
  }
  const getCaptionRef = (type) => {
    let ref = undefined;
    switch (type) {
      case sectionType.LeftTop:
        ref = ltCaptionRef;
        break;
      case sectionType.RightTop:
        ref = rtCaptionRef;
        break;
      case sectionType.Middle:
        ref = mCaptionRef;
        break;
      case sectionType.LeftBottom:
        ref = lbCaptionRef;
        break;
      case sectionType.RightBottom:
        ref = rbCaptionRef;
        break;
    }
    return ref;
  }
  const getIconRef = (type) => {
    let ref = undefined;
    switch (type) {
      case sectionType.LeftTop:
        ref = ltIconRef;
        break;
      case sectionType.RightTop:
        ref = rtIconRef;
        break;
      case sectionType.Middle:
        ref = mIconRef;
        break;
      case sectionType.LeftBottom:
        ref = lbIconRef;
        break;
      case sectionType.RightBottom:
        ref = rbIconRef;
        break;
    }
    return ref;
  }
  const getRef = (type) => {
    let ref = undefined;
    if (showText(type)) ref = getCaptionRef(type);
    if (showIcon(type)) ref = getIconRef(type);
    return ref;
  }
  const showText = (type) => {
    const config = getConfig(type);
    const visible = !!getProp(type, properties.Visible);
    if (config) {
      const isText = isBooleanOrFunction(config.isText) ? !!getProp(type, properties.IsText) : true;
      return visible && isText && (!!config.dataField || !!config.text || !!textDataField);
    } else {
      return visible && type === sectionType.Middle && !!textDataField;
    }
  }
  const showIcon = (type) => {
    const config = getConfig(type);
    const visible = !!getProp(type, properties.Visible);
    if (!config) return false;
    const isIcon = isBooleanOrFunction(config.isText) ? !getProp(type, properties.IsText) : false;
    return visible && isIcon && !!config.icon;
  }
  const getConfig = (type) => {
    switch (type) {
      case sectionType.LeftTop: return ltConfig;
      case sectionType.RightTop: return rtConfig;
      case sectionType.Middle: return mConfig;
      case sectionType.LeftBottom: return lbConfig;
      case sectionType.RightBottom: return rbConfig;
    }
  }
  const getCssClass = () => {
    let className = '';
    if (typeof cssClass === 'string') className = cssClass;
    if (typeof cssClass === 'function') className = cssClass(data);

    if (isSelected) className += (!!selectedCssClass ? selectedCssClass : '');

    return className;
  }
  const getCssClassSection = (type, contentType) => {
    return getProp(type, properties.CssClass, [{data, contentType}]);
  }
  const getText = type => getProp(type, properties.Text);
  // Utils
  const isFunction = functionName => functionName && typeof functionName === 'function';
  const isBooleanOrFunction = value => typeof value === 'boolean' || typeof value === 'function';
  const isDefined = value => typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || typeof value === 'function';
  const isPrimitive = value => typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
  // Events
  const configShowPopoverWhenEventTarget = (type, contentType, eventSourceType, property) => {
    if (getProp(type, property)) {
      const ref = getRef(type)
      setSelected(data);
      if (ref && ref.current) {
        setType(type);
        setEventSourceType(eventSourceType);
        setContentType(contentType);
        setPopoverTarget(ref.current);
        setIsVisiblePopover(true);
      }
    }
  }
  const onClick = ({type, contentType, event}) => {
    const config = getConfig(type);
    configShowPopoverWhenEventTarget(type, contentType, eventType.Click, properties.ShowPopoverWhenClicked);
    if (config && isFunction(config.clickHandler)) {
      getProp(type, properties.ClickHandler, [{data, uniqueId, uniqueDataField, position, type, contentType, event}]);
    }
  }
  const onDblClick = ({type, contentType, event}) => {
    const config = getConfig(type);
    configShowPopoverWhenEventTarget(type, contentType, eventType.DoubleClick, properties.ShowPopoverWhenDoubleClicked);
    if (config && isFunction(config.doubleClickHandler)) {
      getProp(type, properties.DoubleClickHandler, [{data, uniqueId, uniqueDataField, position, type, contentType, event}]);
    }
  }
  const commonProps = {
    readOnly,
    getCaptionRef,
    getIconRef,
    getText,
    getCssClass: getCssClassSection,
    getClassNameCaption,
    getClassNameIcon,
    toggleTooltipHandler,
    onClick,
    onDblClick,
    showText,
    showIcon,
  };

  return (
    <Grid fluid key={data[uniqueId]} className={`vcg-box ${getCssClass()}`}>
      <Row>
        <Col className="vcg-box-section" xs={3}>
          <Section {...commonProps} type={sectionType.LeftTop} />
        </Col>
        <Col className="vcg-box-section" xsOffset={6} xs={3}>
          <Section {...commonProps} type={sectionType.RightTop} />
        </Col>
      </Row>
      <Row>
        <Col className="vcg-box-section m" center="xs" xs={12}>
          <Section {...commonProps} type={sectionType.Middle} />
        </Col>
      </Row>
      <Row>
        <Col className="vcg-box-section" xs={3}>
          <Section {...commonProps} type={sectionType.LeftBottom} />
        </Col>
        <Col className="vcg-box-section" xsOffset={6} xs={3}>
          <Section {...commonProps} type={sectionType.RightBottom} />
        </Col>
      </Row>
    </Grid>
  );
}

export default Box;
