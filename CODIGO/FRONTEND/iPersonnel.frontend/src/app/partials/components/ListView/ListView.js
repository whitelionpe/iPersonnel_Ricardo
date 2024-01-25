import React, { useState, useEffect } from "react";
import { Grid, Row, Col } from 'react-flexbox-grid';
import { v4 as uuid4 } from "uuid";
import { isArray, isFunction, isObject, isPrimitive, isSet } from "../../shared/CommonHelper";
import { arrayToObjectBySomeKey } from "../../shared/ArrayAndObjectHelper";
import { Header, Footer, ViewItem, sysListCssClass, sysRowHeaderCssClass, sysRowViewItemCssClass, sysRowFooterCssClass } from ".";

import "./style.css";

const ListView = ({
  source: usrSource,
  selected: usrSelected,
  uniqueId,
  uniqueDataField,
  transformItem, 
  listCssClass: usrListCssClass,
  headerCssClass,
  footerCssClass,
  viewItemCssClass,
  renderHeader,
  renderFooter,
  renderItem,
}) => {
  // --------------------------------------------------------------------
  // declarations
  // --------------------------------------------------------------------
  const keysHSRows = { h: 'vcg:ltv:hsr:header', f: 'vcg:ltv:hsr:footer' }; // claves de las filas de HorizontalSection
  const uniqueIdObjectProperty = { name: 'name', func: 'func' };
  const defaultIdPropertyName = 'id';
  const indexPropertyName = '$$__index__$$';

  const [originalSource, setOriginalSource] = useState(usrSource);
  const [source, setSource] = useState([]);
  const [sourceById, setSourceById] = useState({});
  const [idPropertyName, setIdPropertyName] = useState(defaultIdPropertyName);
  const [idFunc, setIdFunc] = useState();
  const [listCssClass, setListCssClass] = useState(sysListCssClass);

  const [selected, setSelected] = useState(undefined);
  const [changes, setChanges] = useState({ forSelected: undefined, forUnselected: undefined });
  // --------------------------------------------------------------------

  // --------------------------------------------------------------------
  // functionalities for the component
  // --------------------------------------------------------------------
  const getIdPropertyValue = item => (!isFunction(idFunc) ? (isSet(uniqueDataField) && uniqueDataField in item ? item[uniqueDataField] : uuid4()) : idFunc(item));
  const calculateNameAndFuncForId = (uniqueId) => {
    let nameVal = defaultIdPropertyName;
    let funcVal = undefined;
    if (isSet(uniqueId)) {
      if (isPrimitive(uniqueId)) nameVal = uniqueId;
      if (isObject(uniqueId) && (uniqueIdObjectProperty.name in uniqueId) && (uniqueIdObjectProperty.func in uniqueId)) {
        ({ [uniqueIdObjectProperty.name]: nameVal, [uniqueIdObjectProperty.func]: funcVal } = uniqueId);
      }
    }
    return { name: nameVal, func: funcVal };
  }
  const applyChanges = (selected, { forSelected = {}, forUnselected = {} } = {}) => {
    setSelected(() => selected);
    setChanges(() => ({ forSelected, forUnselected }));
  }
  const prepareData = (rawData) => {
    if (isArray(rawData)) {
      rawData = rawData.map((item, index) => ({ ...item, [indexPropertyName]: index }));
      const tmpSource = [ ...(isFunction(transformItem) ? rawData.map(transformItem) : rawData) ];
      tmpSource
        .map((item, index) => isSet(item) && !(idPropertyName in item) ? index : false)
        .filter(value => value !== false)
        .forEach(index => tmpSource[index] = { ...tmpSource[index], [idPropertyName]: getIdPropertyValue(tmpSource[index]) });
      return tmpSource;
    }
    return undefined;
  }
  const loadDataFromOriginalSource = () => {
    const data = prepareData(originalSource);
    const dataById = !!data ? arrayToObjectBySomeKey(data, idPropertyName) : {};
    setSourceById(dataById)
  }
  const getRowItemCssClass = (index) => {
    // Necesario puesto que aun no hay como obtener "previous sibling"
    return (index + 1) === source.length ? `${sysRowViewItemCssClass} last` : sysRowViewItemCssClass;
  }
  const isSelected = item => !!idPropertyName && !!selected && !!item && item[idPropertyName] === selected[idPropertyName];
  const getTargetChanges = item => {
    const { forSelected = undefined, forUnselected = undefined } = changes;
    return (!!item ? (isSelected(item) ? forSelected : forUnselected) : undefined);
  };
  const getMergeData = item => {
    const targetChanges = getTargetChanges(item);
    if (!!item && !!targetChanges) return { ...item, ...targetChanges};
    if (!!item && !!!targetChanges) return item;
    if (!!!item && !!targetChanges) return targetChanges;
    return undefined;
  };
  // --------------------------------------------------------------------
  
  // --------------------------------------------------------------------
  // functionality for effects
  // --------------------------------------------------------------------
  const performOnAfterChangedUniqueId = () => {
    const { name, func } = calculateNameAndFuncForId(uniqueId);
    setIdPropertyName(name);
    setIdFunc(func);
  }
  const performOnAfterChangedUsrSource = () => {
    setOriginalSource(usrSource);
  }
  const performOnAfterChangedUniqueDataField = () => { 
    loadDataFromOriginalSource(); 
  }
  const performOnAfterChangedTransformItem = () => { 
    loadDataFromOriginalSource();
  }
  const performOnAfterChangedOriginalSource = () => {
    loadDataFromOriginalSource(); 
  }
  const performOnAfterChangedIdPropertyName = () => {
    loadDataFromOriginalSource();
  }
  
  const performOnAfterChangedSourceById = () => {
      setSource(isObject(sourceById) ? Object.values(sourceById) : []);
  }
  const performOnAfterChangedUsrSelected = () => {
    setSelected(usrSelected);
  }
  const performOnAfterChangedUsrListCssClass = () => {
    if (!isPrimitive(usrListCssClass) && !isFunction(usrListCssClass)) setListCssClass(sysListCssClass);
    if (isPrimitive(usrListCssClass)) setListCssClass(`${sysListCssClass} ${usrListCssClass}`);
    if (isFunction(usrListCssClass)) setListCssClass(`${sysListCssClass} ${usrListCssClass()}`);
  }
  // --------------------------------------------------------------------

  // --------------------------------------------------------------------
  // attach effects
  // --------------------------------------------------------------------
  useEffect(performOnAfterChangedUsrSource, [usrSource]);
  useEffect(performOnAfterChangedOriginalSource, [originalSource]);
  useEffect(performOnAfterChangedUniqueId, [uniqueId]);
  useEffect(performOnAfterChangedIdPropertyName, [idPropertyName]);
  useEffect(performOnAfterChangedUniqueDataField, [uniqueDataField]);
  useEffect(performOnAfterChangedTransformItem, [transformItem]);
  useEffect(performOnAfterChangedSourceById, [sourceById]);
  useEffect(performOnAfterChangedUsrSelected, [usrSelected]);
  useEffect(performOnAfterChangedUsrListCssClass, [usrListCssClass]);
  // --------------------------------------------------------------------

  // --------------------------------------------------------------------
  // rendering
  // --------------------------------------------------------------------
  return (
    <>
      {
        !!source && 
        <Grid fluid className={listCssClass}>
          {
            isFunction(renderHeader) && 
            <Row className={sysRowHeaderCssClass} key={keysHSRows.h}>
              <Col xs={12} sm={12} md={12} lg={12}>
                <Header cssClass={headerCssClass}
                  source={source}
                  render={renderHeader} 
                  idPropertyName={idPropertyName}
                  uniqueId={uniqueId}
                  uniqueDataField={uniqueDataField}
                  selected={selected}
                  changes={changes}
                  applyChanges={applyChanges}
                />
              </Col>
            </Row>
          }
          {
            source.map((item, index) => {
              return (
                <Row className={getRowItemCssClass(index)} key={item[idPropertyName]}>
                  <Col xs={12} sm={12} md={12} lg={12}>
                    <ViewItem cssClass={viewItemCssClass}
                      item={item}
                      isSelected={isSelected(item)} 
                      targetChanges={getTargetChanges(item)} 
                      mergeData={getMergeData(item)} 
                      render={renderItem}
                      idPropertyName={idPropertyName}
                      uniqueId={uniqueId}
                      uniqueDataField={uniqueDataField}
                      selected={selected}
                      changes={changes}
                      applyChanges={applyChanges}
                    />
                  </Col>
                </Row>
              );
            })
          }
          {
            isFunction(renderFooter) && 
            <Row className={sysRowFooterCssClass} key={keysHSRows.f}>
              <Col xs={12} sm={12} md={12} lg={12}>
                <Footer cssClass={footerCssClass}
                  source={source}
                  render={renderFooter} 
                  idPropertyName={idPropertyName}
                  uniqueId={uniqueId}
                  uniqueDataField={uniqueDataField}
                  selected={selected}
                  changes={changes}
                  applyChanges={applyChanges}
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

export default ListView;