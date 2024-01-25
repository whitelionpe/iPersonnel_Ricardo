import React from "react";
import { v4 as uuid4 } from "uuid";
import { isSet, isFunction, isArray, isPrimitive, isObject, isObjectOrArray, isString, isNullOrUndefined } from "./CommonHelper";

// -------------------------------------------------------------------------------------------------------------------------
const defaultKeyName = 'id';
const keyObjectProperty = { name: 'name', func: 'func' };
// -------------------------------------------------------------------------------------------------------------------------
const internalKey = '$$__key__$$';
const defaultKeyNameForChildren = 'children';
const keyJoinObjectProperty = { parent: 'parent', children: 'children' };
// -------------------------------------------------------------------------------------------------------------------------
const indexPropertyName = '$$__index__$$';
const defaultIdPropertyName = defaultKeyName;
const uniqueIdObjectProperty = { ...keyObjectProperty };
// -------------------------------------------------------------------------------------------------------------------------

// -------------------------------------------------------------------------------------------------------------------------
const calculateNameAndFuncForKey = (key) => {
  let nameVal = undefined;
  let funcVal = undefined;
  if (isSet(key)) {
    nameVal = defaultKeyName;
    if (isPrimitive(key)) nameVal = key;
    if (isFunction(key)) funcVal = key;
    if (isObject(key) && (keyObjectProperty.name in key) && (keyObjectProperty.func in key)) {
      ({ [keyObjectProperty.name]: nameVal, [keyObjectProperty.func]: funcVal } = key);
    }
  }
  return { name: nameVal, func: funcVal };
}
const getKeyAndValue = (item, key, { createKeyIfNotExists }) => {
  // Es undefined si es que key es una función, puesto que no es necesario modificar el array original para crear el objeto con los 'keys' calculados.
  let calculatedKeyName = undefined;  
  let calculatedKeyValue = undefined;
  const { name: nameKey, func: funcKey } = calculateNameAndFuncForKey(key);

  if (isObject(item) && isSet(nameKey)) {
    if (!isFunction(funcKey)) {
      if (isPrimitive(nameKey)) {
        if (nameKey in item) {
          calculatedKeyName = nameKey;
          calculatedKeyValue = item[nameKey];
        } else if (createKeyIfNotExists) {
          calculatedKeyName = defaultKeyName;
          calculatedKeyValue = uuid4();
        }
      }
    } else {
      calculatedKeyName = nameKey;
      calculatedKeyValue = funcKey(item);
    }
  }

  return { key: calculatedKeyName, value: calculatedKeyValue, existsKey: (!!calculatedKeyName && calculatedKeyName in item) };
}
export const arrayToObjectBySomeKey = (rawData, key, { valueFunc, createKeyIfNotExists = false, replaceValueForKeyIfExists = false } = {}) => {
  let result = {};
  if (isArray(rawData) && isSet(key)) {
    rawData.forEach(item => {
      const { key: keyName, value: keyValue, existsKey } = getKeyAndValue(item, key, { createKeyIfNotExists });
      const objKeyAndValue = {};
      if (!!keyName && ((!existsKey && createKeyIfNotExists) || replaceValueForKeyIfExists)) objKeyAndValue[keyName] = keyValue;
      result[keyValue] = isFunction(valueFunc) ? valueFunc(item) : { ...objKeyAndValue, ...item };
    });
  }
  return result;
}
// -------------------------------------------------------------------------------------------------------------------------
const attachInternalKey = arrOrObj => (isArray(arrOrObj) ? arrOrObj : Object.values(arrOrObj)).map((item, index) => ({ ...item, [internalKey]: index }));
const getKeyValue = (item, key) => isFunction(key) ? key(item) : item[key];
// parent (object | array)
// keyMapJoin: (string | function | { parent: (string | function), children: (string | function) }), las propiedades estan definidas por el objeto 'keyJoinObjectProperty'
// children (object | array)
// keyNameForChildren, es el nombre de la propiedad que tendrá cada ítem del padre, para almacenar los hijos
// asObject = true, retorna el resultado como un objeto, de lo contrario devuelve un array.
export const attachChildren = (parent, keyMapJoin, children, { keyNameForChildren = defaultKeyNameForChildren, asObject = false } = {}) => {
  if (!isObjectOrArray(parent)) return undefined;
  if (!isObjectOrArray(children)) return undefined;
  if (!isString(keyMapJoin) && !isFunction(keyMapJoin) && !isObject(keyMapJoin)) return undefined;
  
  const objParentByKey = {};

  let [ arrParent, arrChildren ] = [ attachInternalKey(parent), attachInternalKey(children) ];
  let [ parentKey, childrenKey ] = [ keyMapJoin, keyMapJoin ];

  if (isObject(keyMapJoin)) {
    const { [keyJoinObjectProperty.parent]: valParentKey, [keyJoinObjectProperty.children]: valChildrenKey } = keyMapJoin;
    ([ parentKey, childrenKey ] = [ !isNullOrUndefined(valParentKey) ? valParentKey : internalKey, !isNullOrUndefined(valChildrenKey) ? valChildrenKey : internalKey ]);
  }

  arrParent.map(item => ({ ...item, [keyNameForChildren]: [] })).forEach(item => objParentByKey[getKeyValue(item, parentKey)] = item);

  arrChildren.forEach(childItem => {
    const childKeyValue = getKeyValue(childItem, childrenKey);
    if (isObject(childItem) && isSet(childKeyValue) && (childKeyValue in objParentByKey) && isArray(objParentByKey[childKeyValue][keyNameForChildren])) {
      objParentByKey[childKeyValue][keyNameForChildren].push(childItem);
    }
  });

  return asObject ? objParentByKey : Object.values(objParentByKey);
}
// -------------------------------------------------------------------------------------------------------------------------
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
const getIdPropertyValue = (item, { idFunc, uniqueDataField }) => (!isFunction(idFunc) ? (isSet(uniqueDataField) && uniqueDataField in item ? item[uniqueDataField] : uuid4()) : idFunc(item));
const prepareData = (rawData, { idPropertyName, idFunc, uniqueDataField, transformItem }) => {
  if (isArray(rawData)) {
    rawData = rawData.map((item, index) => ({ ...item, [indexPropertyName]: index }));
    const tmpSource = [ ...(isFunction(transformItem) ? rawData.map(transformItem) : rawData) ];
    tmpSource
      .map((item, index) => isSet(item) && !(idPropertyName in item) ? index : false)
      .filter(value => value !== false)
      .forEach(index => tmpSource[index] = { ...tmpSource[index], [idPropertyName]: getIdPropertyValue(tmpSource[index], { idFunc, uniqueDataField }) });
    return tmpSource;
  }
  return undefined;
}
export const toDataFormatter = (rawData, { uniqueId = defaultIdPropertyName, uniqueDataField = defaultIdPropertyName, transformItem } = {}) => {
  const { name: idPropertyName, func: idFunc } = calculateNameAndFuncForId(uniqueId);
  const data = prepareData(rawData, { idPropertyName, idFunc, uniqueDataField, transformItem });
  const dataById = !!data ? arrayToObjectBySomeKey(data, idPropertyName) : {};
  return { data, dataById }
}
// -------------------------------------------------------------------------------------------------------------------------
export const arrayToObjectByPrimitiveValue = (rawData, key) => {
  const result = {};
  if (isArray(rawData) && isSet(key)) rawData.forEach(value => result[value] = { [key]: value });
  return result;
}
export const arrayPrimitiveValueToObject = (rawData, key) => Object.values(arrayToObjectByPrimitiveValue(rawData, key));
// -------------------------------------------------------------------------------------------------------------------------
export const arrayPrimitiveValueToObjectKeyValueSame = rawData => {
  let result = {};
  if (isArray(rawData)) rawData.forEach(value => result[value] = value);
  return result;
}









