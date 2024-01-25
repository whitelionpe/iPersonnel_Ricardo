import React from "react";
import { arrayToObjectBySomeKey } from "../../shared/ArrayAndObjectHelper";
import { isArray, isFunction, isNullOrUndefined, isObject, isPrimitive, isSet } from "../../shared/CommonHelper";
import { v4 as uuid4 } from "uuid";

const internalUniqueId = '$$__id';

export const transformToFormattedData = (
  arrayData = [], 
  { 
    rowField = 'Row', 
    colField = 'Column', 
    uniqueId = 'id',
    uniqueDataField = 'id',
    maxColCount = undefined, 
    transformItem = undefined, 
    valueForUndefined = undefined 
  } = {},
) => {
  if (!isArray(arrayData)) return undefined;
  
  const [ maxRow = -1 ] = arrayData.filter(item => rowField in item).map(({ [rowField]: rowValue }) => rowValue).sort((a, b) => b - a) || [];
  let [ maxCol = -1 ] = arrayData.filter(item => colField in item).map(({ [colField]: colValue }) => colValue).sort((a, b) => b - a) || [];
  
  if (maxRow === -1 || maxCol === -1) return undefined;
  maxCol = !isNullOrUndefined(maxColCount) && maxColCount <= maxCol ? maxColCount : maxCol;
  
  if (isSet(uniqueId)) {
    arrayData = arrayData.map(item => {
      if (isPrimitive(uniqueId) && !(uniqueId in item)) item[uniqueId] = uniqueDataField in item ? item[uniqueDataField] : uuid4();
      if (isObject(uniqueId) && isSet(uniqueId.key) && isFunction(uniqueId.func)) item[uniqueId.key] = uniqueId.func(item);
      return item;
    });
  }
  
  if (isFunction(transformItem)) arrayData = arrayData.map(transformItem);

  const getUniqueId = (row, col) => `${row}|${col}`;
  // Si es que se desea modificar cada item del array y adicionarle una propiedad ([internalUniqueId]: func(args)) 
  // const objectData = arrayToObjectBySomeKey(arrayData, { name: internalUniqueId, func: ({ [rowField]: rowValue, [colField]: colValue }) => getUniqueId(rowValue, colValue) });
  const objectData = arrayToObjectBySomeKey(arrayData, ({ [rowField]: rowValue, [colField]: colValue }) => getUniqueId(rowValue, colValue));

  let result = [];

  for (let i = 0; i <= maxRow; i++) {
    if (!result[i]) result.push([]);
    for (let j = 0; j <= maxCol; j++) {
      const temporalUniqueId = getUniqueId(i, j);
      const value = temporalUniqueId in objectData ? objectData[temporalUniqueId] : valueForUndefined;
      if (result[i]) result[i].push(value)
    }
  }
  return result;
};