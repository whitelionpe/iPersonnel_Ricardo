import React, { useState, useEffect, useRef } from "react";
import { MultiView } from "devextreme-react";
import { Grid, Row, Col } from 'react-flexbox-grid';
import { v4 as uuid4 } from "uuid";
import { isArray, isFunction, isNullOrUndefined, isNumber, isObject, isPrimitive, isSet } from "../../shared/CommonHelper";
import { arrayToObjectBySomeKey } from "../../shared/ArrayAndObjectHelper";
import { Header, Footer, sysMultiViewItemCssClass, sysRowHeaderCssClass, sysRowViewItemCssClass, sysRowFooterCssClass } from ".";

import "./style.css";

const MultiViewItem = ({
  data: usrData,
  source: usrSource,
  uniqueId,
  uniqueDataField,
  transformItem, 
  selected,
  // ----------------------------
  viewItemComponent: usrViewItemComponent,
  messageViews,
  redirectViewFromMessage,
  timeoutMesageView,
  renderHeader,
  renderFooter,
  // ----------------------------
  multiViewItemCssClass: usrMultiViewItemCssClass,
  headerCssClass,
  footerCssClass,
  // ----------------------------
  height = undefined,
  animationEnabled = true,
  swipeEnabled = false,
  loop = true,
}) => {
  // --------------------------------------------------------------------
  // declarations
  // --------------------------------------------------------------------
  const uniqueIdObjectProperty = { name: 'name', func: 'func' };
  const defaultIdPropertyName = 'id';
  const noObjectPropertyName = '$__vcg:NoObject:__$';
  
  const timer = useRef(false);

  const [data, setData] = useState(usrData);
  const [originalSource, setOriginalSource] = useState(usrSource);
  const [source, setSource] = useState([]);
  const [sourceById, setSourceById] = useState({});
  const [idPropertyName, setIdPropertyName] = useState(defaultIdPropertyName);
  const [idFunc, setIdFunc] = useState();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [messageViewsIndexes, setMessageViewsIndexes] = useState([]);
  const [multiViewItemCssClass, setMultiViewItemCssClass] = useState(sysMultiViewItemCssClass);
  // --------------------------------------------------------------------

  // --------------------------------------------------------------------
  // functionalities for the component
  // --------------------------------------------------------------------
  const changeView = index => {
		setSelectedIndex(index);
  }
  const onSelectionChanged = args => {
    // console.log("onSelectionChanged ---> args", args);
    if (args.name == 'selectedIndex') {
      changeView(args.value);
    }
  }
  const getIdPropertyValue = item => (!isFunction(idFunc) ? (isSet(uniqueDataField) && uniqueDataField in item ? item[uniqueDataField] : uuid4()) : idFunc(item));
  const prepareData = (rawData) => {
    if (isArray(rawData)) {
      const isObjectArray = !rawData.filter(item => !isNullOrUndefined(item)).some(item => !isObject(item));
      const tmpSource = [ ...(isFunction(transformItem) ? rawData.map(transformItem) : rawData) ];
      if (isObjectArray) {
        tmpSource
          .map((item, index) => isObject(item) && !(idPropertyName in item) ? index : false)
          .filter(value => value !== false)
          .forEach(index => tmpSource[index] = { ...tmpSource[index], [idPropertyName]: getIdPropertyValue(tmpSource[index]) });
      } else {
        tmpSource.map((_, index) => index).forEach(index => tmpSource[index] = { [idPropertyName]: getIdPropertyValue(tmpSource[index]), [noObjectPropertyName]: tmpSource[index] });
      }
      return tmpSource;
    }
    return undefined;
  }
  const loadDataFromOriginalSource = () => {
    const data = prepareData(originalSource);
    const dataById = !!data ? arrayToObjectBySomeKey(data, idPropertyName) : {};
    setSourceById(dataById)
  }
  const calculateIdNameAndFunc = () => {
    let nameVal = defaultIdPropertyName;
    let funcVal = undefined;
    if (isSet(uniqueId)) {
      if (isPrimitive(uniqueId)) nameVal = uniqueId;
      if (isObject(uniqueId) && (uniqueIdObjectProperty.name in uniqueId) && (uniqueIdObjectProperty.func in uniqueId)) {
        ({ [uniqueIdObjectProperty.name]: nameVal, [uniqueIdObjectProperty.func]: funcVal } = uniqueId);
      }
    }
    setIdPropertyName(nameVal);
    setIdFunc(funcVal);
  }
  const calculateMultiViewItemCssClass = () => {
    if (!isPrimitive(usrMultiViewItemCssClass) && !isFunction(usrMultiViewItemCssClass)) setMultiViewItemCssClass(sysMultiViewItemCssClass);
    if (isPrimitive(usrMultiViewItemCssClass)) setMultiViewItemCssClass(`${sysMultiViewItemCssClass} ${usrMultiViewItemCssClass}`);
    if (isFunction(usrMultiViewItemCssClass)) setMultiViewItemCssClass(`${sysMultiViewItemCssClass} ${usrMultiViewItemCssClass()}`);
  }
  const calculateRedirectViewIndex = () => {
    let index = 0;
    if (isNumber(redirectViewFromMessage)) index = redirectViewFromMessage;
    else if (isFunction(redirectViewFromMessage)) {
      const to = redirectViewFromMessage({ selected, selectedIndex });
      if (isObject(sourceById) && isObject(to)) {
        index = Object.values(sourceById)
          .map(({ [idPropertyName]: id }) => id)
          .findIndex(id => id === to[idPropertyName]);
        if (index < 0) index = 0;
      }
    }
    return index;
  }
  const calculateTimeoutMessageView = () => {
    let timeout = 0;
    if (isNumber(timeoutMesageView)) timeout = timeoutMesageView;
    else if (isFunction(timeoutMesageView)) timeout = timeoutMesageView({ selected, selectedIndex });
    return timeout;
  }
  // --------------------------------------------------------------------
  
  // --------------------------------------------------------------------
  // functionality for effects
  // --------------------------------------------------------------------
  const initialization = () => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = false;
    }
  }
  const performOnAfterChangedUsrData = () => setData(usrData);
  const performOnAfterChangedUniqueId = () => calculateIdNameAndFunc();
  const performOnAfterChangedUsrSource = () => setOriginalSource(usrSource);
  const performOnAfterChangedUniqueDataField = () => loadDataFromOriginalSource();
  const performOnAfterChangedTransformItem = () => loadDataFromOriginalSource();
  const performOnAfterChangedOriginalSource = () => loadDataFromOriginalSource();
  const performOnAfterChangedIdPropertyName = () => loadDataFromOriginalSource();
  const performOnAfterChangedSourceById = () => setSource(!!sourceById ? Object.values(sourceById) : []);
  const performOnAfterChangedUsrMultiViewItemCssClass = () => calculateMultiViewItemCssClass();
  const performOnAfterChangedMessageViews = () => {
    const messages = prepareData(messageViews);
    let indexes = [];
    if (isObject(sourceById) && !!messages) {
      const messageIds = Object.values(messages).map(({ [idPropertyName]: id }) => id);
      indexes = Object.values(sourceById)
        .map(({ [idPropertyName]: id }) => id)
        .map((id, index) => messageIds.includes(id) ? index : false)
        .filter(index => index !== false);
    }
    setMessageViewsIndexes(indexes);
  }
  const performOnAfterChangedSelected = () => {
    if (isObject(sourceById) && isObject(selected)) {
      const index = Object.values(sourceById)
        .map(({ [idPropertyName]: id }) => id)
        .findIndex(id => id === selected[idPropertyName]);
      if (index >= 0) changeView(index);
      // console.log("performOnAfterChangedSelected -> index", index);
    }
  }
  const performOnAfterChangedSelectedIndex = () => {
    if (isArray(messageViewsIndexes, true)) {
      timer.current = setTimeout(() => {
        if (timer.current) clearTimeout(timer.current);
        timer.current = false;
        changeView(calculateRedirectViewIndex());
      }, calculateTimeoutMessageView());
    }
  }
  // --------------------------------------------------------------------

  // --------------------------------------------------------------------
  // attach effects
  // --------------------------------------------------------------------
  useEffect(initialization, []);
  useEffect(performOnAfterChangedUsrSource, [usrSource]);
  useEffect(performOnAfterChangedOriginalSource, [originalSource]);
  useEffect(performOnAfterChangedUniqueId, [uniqueId]);
  useEffect(performOnAfterChangedIdPropertyName, [idPropertyName]);
  useEffect(performOnAfterChangedUniqueDataField, [uniqueDataField]);
  useEffect(performOnAfterChangedTransformItem, [transformItem]);
  useEffect(performOnAfterChangedSourceById, [sourceById]);
  useEffect(performOnAfterChangedMessageViews, [messageViews]);
  useEffect(performOnAfterChangedSelected, [selected]);
  useEffect(performOnAfterChangedSelectedIndex, [selectedIndex]);
  useEffect(performOnAfterChangedUsrMultiViewItemCssClass, [usrMultiViewItemCssClass]);
  useEffect(performOnAfterChangedUsrData, [usrData]);
  useEffect(() => {
    // console.log("MultiViewItem ===> data, source, isArray(source)", data, source, isArray(source));
  }, [source, data]);
  // --------------------------------------------------------------------

  // --------------------------------------------------------------------
  // rendering
  // --------------------------------------------------------------------
  return (
    <>
      {
        <Grid fluid className={multiViewItemCssClass}>
          {
            isFunction(renderHeader) && 
            <Row className={sysRowHeaderCssClass}>
              <Col xs={12} sm={12} md={12} lg={12}>
                <Header cssClass={headerCssClass}
                  source={source}
                  idPropertyName={idPropertyName}
                  uniqueId={uniqueId}
                  uniqueDataField={uniqueDataField}
                  render={renderHeader} 
                />
              </Col>
            </Row>
          }
          {
            isArray(source) && 
            <Row className={sysRowViewItemCssClass}>
              <Col xs={12} sm={12} md={12} lg={12}>
                <MultiView
                  height={height}
                  dataSource={source}
                  selectedIndex={selectedIndex}
                  onOptionChanged={onSelectionChanged}
                  itemRender={(viewItemData, viewItemIndex) => usrViewItemComponent({ data, viewItemData, viewItemIndex })}
                  // itemComponent={({ data: viewItemData, index: viewItemIndex }) => { return usrViewItemComponent({ data, viewItemData, viewItemIndex }) }}
                  // itemComponent={usrViewItemComponent}
                  animationEnabled={animationEnabled}
                  swipeEnabled={swipeEnabled}
                  loop={loop}
                />
              </Col>
            </Row>
          }
          {
            isFunction(renderFooter) && 
            <Row className={sysRowFooterCssClass}>
              <Col xs={12} sm={12} md={12} lg={12}>
                <Footer cssClass={footerCssClass}
                  source={source}
                  idPropertyName={idPropertyName}
                  uniqueId={uniqueId}
                  uniqueDataField={uniqueDataField}
                  render={renderFooter} 
                />
              </Col>
            </Row>
          }
        </Grid>
      }
    </>
  );
  // --------------------------------------------------------------------
};

export default MultiViewItem;
