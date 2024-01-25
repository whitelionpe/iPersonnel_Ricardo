//import React from "react";
import axios from "axios";
import { of as createObservable } from 'rxjs';
import _ from "lodash";
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import { convertFilterObjectToFilterArray } from "../CustomFilter";
import { dateFormat, convertyyyyMMddToDate } from "../../../../_metronic";

export const prefixForStorageKeys = "vcg:";

export const isSet = value => value !== null && value !== undefined && value !== '';
export const isUnset = value => value === '' || value === null || value === undefined;
export const isFunction = functionName => functionName && typeof functionName === 'function';
export const isNullOrUndefined = value => value === null || value === undefined;

export const debug = {
  LogType: { Inline: 'INLINE', Multiline: 'MULTILINE' },
  ModeType: { Light: 'LIGHT', Full: 'FULL' },
};

// export const dataLoadTypes = { FromNoSource: 'DataLoadFromNoSource', FromLocalStorage: 'DataLoadFromLocalStorage', FromServer: 'DataLoadFromServer' };
export const dataLoadTypes = { FromNoSource: 1, FromLocalStorage: 2, FromServer: 4 };
export const forceLoadTypes = { Unforced: 'UnForceLoad', FromLocalStorage: 'ForceLoadFromLocalStorage', FromServer: 'ForceLoadFromServer' };
export const dataLoadCalledTypes = { NotSet: 'DataLoadCallFromNotSet', ResetLoadOptions: 'DataLoadFromResetLoadOptions' };

export const defaultLoadOptions = { currentPage: 1, pageSize: 10, sort: [{ selector: 'RowIndex', desc: false }], filter: [] };

const getDelayTime = ts => ((new Date().getTime()) - ts) / 1000;
const areThereKeys = storageKey => {
  const keys = getStorageKeys(storageKey);
  const [metadataKey, loadOptionsKey, arrayDataKey, gridInfoKey] = Object.values(keys).map(key => !isNullOrUndefined(localStorage.getItem(key)));
  return { metadataKey, loadOptionsKey, arrayDataKey, gridInfoKey };
}
const transformToLowerCase = value => isSet(value) && typeof value === 'string' ? value.toLowerCase() : value;
const areSameSort = (sort1, sort2) => {
  const object1 = convertArraySortToSortObject(sort1);
  const object2 = convertArraySortToSortObject(sort2);
  return !_.isEqual(object1, object2);
}
const convertArraySortToSortObject = (arraySort) => {
  const target = {};
  (arraySort || []).forEach(({ selector: key, desc: value }) => target[key] = value);
  return { ...target };
}
const convertArrayFilterToFilterObjectFromStorageState = ({ loadOptionsKey, reverseTransformData = undefined, data = {} }) => {
  const { filter = [] } = getStoredLoadOptions(loadOptionsKey);
  const target = convertArrayFilterToFilterObject(filter, reverseTransformData);
  return { ...target, ...data };
}
const getMixedFilter = (oldValue, newValue) => {
  //console.log("getMixedFilter->", {oldValue, newValue});
  let aux = [];
  const newValueFilterTarget = (newValue || []).filter(item => item && typeof item !== 'string' && item.length > 0);
  const oldValueFilterTarget = (oldValue || []).filter(item => item && typeof item !== 'string' && item.length > 0 && !newValueFilterTarget.map(([key]) => key).includes(item[0]));
  [...oldValueFilterTarget, ...newValueFilterTarget].forEach(item => {
    aux = aux.concat([item, 'AND']);
  });
  aux.pop();
  //console.log("getMixedFilter-out->",{aux});
  return aux;
}
const getLoadOptionsChanges = (loadOptionsKey, stateConfig = {}, initialLoadOptions = undefined, replaceFilter = false, optionsPart = {}, checkCaseSensitivity = true) => {
  const { pageSize: ops } = stateConfig;
  const oldLoadOptions = getStoredLoadOptions(loadOptionsKey);
  const newLoadOptions = getMixedLoadOptions(loadOptionsKey, initialLoadOptions, replaceFilter, optionsPart);
  const { currentPage: ocp, sort: os, filter: ot } = oldLoadOptions;
  const { currentPage: ncp, pageSize: nps, sort: ns, filter: nf } = newLoadOptions;
  const [currentPage, pageSize, sort, filter] = [ocp !== ncp, ops !== nps, areSameSort(os, ns), areSameFilter({ filter1: ot }, { filter2: nf }, checkCaseSensitivity)];
  return {
    thereAre: currentPage || pageSize || sort || filter,
    currentPage,
    pageSize,
    sort,
    filter,
  };
}
export const getStorageKeys = storageKey => ({
  metadataKey: `${prefixForStorageKeys}${storageKey}:metadataKey`,
  loadOptionsKey: `${prefixForStorageKeys}${storageKey}:loadOptions`,
  arrayDataKey: `${prefixForStorageKeys}${storageKey}:arrayData`,
  gridInfoKey: `${prefixForStorageKeys}${storageKey}:gridInfo`
});
export const removeAllStorageKeys = (uniqueId = undefined) => {
  const prefix = `${prefixForStorageKeys}${(uniqueId || '')}`;
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) keys.push(localStorage.key(i));
  keys.filter(key => key.startsWith(prefix)).forEach(key => localStorage.removeItem(key));
}
export const areSameFilter = ({ filter1, transformData1 = undefined }, { filter2, transformData2 = undefined }, checkCaseSensitivity = true) => {
  const object1 = convertArrayFilterToFilterObject(filter1, transformData1, checkCaseSensitivity);
  const object2 = convertArrayFilterToFilterObject(filter2, transformData2, checkCaseSensitivity);
  return !_.isEqual(object1, object2);
}
export const convertArrayFilterToFilterObject = (arrayFilter, transformData = undefined, checkCaseSensitivity = true) => {
  const target = {};
  (arrayFilter || []).filter(item => item && typeof item !== 'string' && item.length > 0).forEach(([key, , value]) => {
    const tmp = transformData && Object.keys(transformData).length > 0 && transformData[key] && isFunction(transformData[key])
      ?
      transformData[key](value)
      :
      value;
    target[key] = checkCaseSensitivity ? tmp : transformToLowerCase(tmp);
  });
  return { ...target };
}
export const getFilterFromStorageStateExceptThese = (loadOptionsKey, except = []) => {
  let aux = [];
  const { filter = [] } = getStoredLoadOptions(loadOptionsKey);
  filter.filter(item => item && typeof item !== 'string' && item.length === 3 && !except.includes(item[0])).forEach(item => aux = aux.concat([item, 'AND']));
  aux.pop();
  return aux;
}
export const getMixedLoadOptions = (loadOptionsKey, initialLoadOptions = undefined, replaceFilter = false, optionsPart = {}, keysToGenerateFilter = undefined) => {
  const oldLoadOptions = getStoredLoadOptions(loadOptionsKey);
  const [{ filter: oldFilter = [] }, { filter: newFilter = [] }] = [oldLoadOptions, optionsPart];
  let filter = [];
  (replaceFilter ? newFilter : getMixedFilter((!replaceFilter ? oldFilter : []), newFilter)).filter(item => item && typeof item !== 'string' && item.length === 3 && isSet(item[2]) && (!keysToGenerateFilter || (keysToGenerateFilter && keysToGenerateFilter.length > 0 && keysToGenerateFilter.includes(item[0])))).forEach(item => filter = filter.concat([item, 'AND']));
  filter.pop();
  const newLoadOptions = { ...(initialLoadOptions || defaultLoadOptions), ...oldLoadOptions, ...optionsPart, filter };
  return newLoadOptions;
}
export const normalizeUserLoadOptions = (userLoadOptions, defaultFilterData = undefined, { dataTypes = undefined, keysToGenerateFilter = [], transformData = undefined, excludeBlankValues = false } = {}) => {
  const { currentPage: helperCurrentPage, pageSize: helperPageSize, sort: helperSort, filter: helperFilter } = defaultLoadOptions || {};
  const { currentPage = helperCurrentPage, pageSize = helperPageSize, sort: sortData, filter: filterData } = { ...(userLoadOptions || {}), ...(defaultFilterData ? { filter: defaultFilterData } : {}) };
  const sort = sortData && Object.keys(sortData).length > 0 ? [{ selector: sortData.column, desc: (sortData.order || '').toLowerCase() === 'desc' }] : helperSort;
  const filter = filterData && Object.keys(filterData).length > 0 ? convertFilterObjectToFilterArray(filterData, { dataTypes, keysToGenerateFilter, transformData, excludeBlankValues }) : helperFilter;
  return { currentPage, pageSize, sort, filter };
}
export const getStoredLoadOptions = loadOptionsKey => JSON.parse(localStorage.getItem(loadOptionsKey) || '{}');
const getData = (response, pageSize) => {
  // console.log("getData.pageSize", response, pageSize);
  //let { data: { data = [] }, totalPages = 0, totalCount = 0 } = response;//data
  let { data = [], totalPages = 0, totalCount = 0 } = response;
  //console.log("getData.data", data);
  if (data && Array.isArray(data) && data.length > 0 && 'TotalCount' in data[0]) {
    ([{ TotalCount: totalCount = 0 }] = data);
    totalPages = Math.ceil((totalCount * 1.0 / pageSize));
  }
  //console.log("return->", data, totalPages, totalCount);
  return { data, totalPages, totalCount }
}
export const performLoad = (
  loadUrl,
  storageKey,
  {
    addRowNumberToResult = true,
    rowNumberName = 'index',
    clearFilterIfNoData = false,
    forceLoad = forceLoadTypes.Unforced,
    sendToServerOnlyIfThereAreChanges = false,
    ifThereAreNoChangesLoadFromStorage = true,
    caseSensitiveWhenCheckingForChanges = true,
    allowAutomaticPageTurning = true,
    replaceFilter = false,
    keysToGenerateFilter = undefined,
    initialLoadOptions = undefined,
    optionsPart = {},
    clearStoredStateIfResultHasNoData = true,
  },
  stateConfig = {},
) => {
  const splashScreen = document.getElementById("splash-screen"); //>JDL->2022-12-02->Add loanding...
  try {
    let goToStorage = forceLoad === forceLoadTypes.FromLocalStorage;
    const { loadOptionsKey, arrayDataKey, gridInfoKey } = getStorageKeys(storageKey);
    const { loadOptionsKey: existsLoadOptions, arrayDataKey: existsArrayData } = areThereKeys(storageKey);
    if (!!clearFilterIfNoData && !existsArrayData && existsLoadOptions) {
      localStorage.removeItem(loadOptionsKey);
      if (initialLoadOptions && 'filter' in initialLoadOptions && defaultLoadOptions && 'filter' in defaultLoadOptions) optionsPart = { ...optionsPart, filter: (initialLoadOptions.filter || defaultLoadOptions.filter) };
    }
    const { thereAre: thereAreChanges, currentPage: currentPageChanges, pageSize: pageSizeChanges, filter: filterHasChanges } = getLoadOptionsChanges(loadOptionsKey, stateConfig, initialLoadOptions, replaceFilter, optionsPart, caseSensitiveWhenCheckingForChanges);
    if (!existsArrayData || (forceLoad === forceLoadTypes.FromServer) || !sendToServerOnlyIfThereAreChanges || (sendToServerOnlyIfThereAreChanges && thereAreChanges)) {
      goToStorage = false;
      let loadOptionsToSave = getMixedLoadOptions(loadOptionsKey, initialLoadOptions, replaceFilter, optionsPart);
      let loadOptions = getMixedLoadOptions(loadOptionsKey, initialLoadOptions, replaceFilter, optionsPart, keysToGenerateFilter);
      const { pageSize: auxPageSize } = pageSizeChanges ? stateConfig : loadOptionsToSave;
      loadOptions = { ...loadOptions, currentPage: (allowAutomaticPageTurning && filterHasChanges ? 1 : loadOptions.currentPage), pageSize: auxPageSize };
      loadOptionsToSave = { ...loadOptionsToSave, currentPage: (allowAutomaticPageTurning && filterHasChanges ? 1 : loadOptionsToSave.currentPage), pageSize: auxPageSize };
      const { currentPage, pageSize } = loadOptions;
      const [skip, take] = [(currentPage - 1) * pageSize, pageSize];
      const extendedOptions = { ...loadOptions, skip, take };
      delete extendedOptions["currentPage"];
      delete extendedOptions["pageSize"];
      let params = "?";
      ["skip", "take", "sort", "filter"].forEach(function (i) {
        if (i in extendedOptions && isSet(extendedOptions[i])) {
          params += `${i}=${JSON.stringify(extendedOptions[i])}&`;
        }
      });
      params = params.slice(0, -1);
      const ts = new Date().getTime();
      splashScreen.classList.remove("hidden"); //>JDL->2022-12-02->Add loanding... //activar loanding
      return axios
        .get(`${loadUrl}${params}`)
        .then(response => {
          //console.log("CUSTIMERDATAGRID.response->", response);
          if (!(response instanceof Error)) {
            response = response.data.result;
            //console.log("CUSTIMERDATAGRID.response->CONVERT.", response);
            let { data, totalPages, totalCount } = getData(response, take);
            //console.log("data, totalPages, totalCount---->", data, totalPages, totalCount);
            const changeCurrentPage = ((allowAutomaticPageTurning && filterHasChanges) || currentPageChanges) ? currentPage : false;
            if (addRowNumberToResult) data = data.map((item, index) => ({ ...item, [rowNumberName]: ((currentPage - 1) * pageSize + index + 1) }));
            localStorage.setItem(loadOptionsKey, JSON.stringify(loadOptionsToSave));
            if (!clearStoredStateIfResultHasNoData || (clearStoredStateIfResultHasNoData && totalCount !== 0 && data.length !== 0)) {
              localStorage.setItem(arrayDataKey, JSON.stringify(data));
              localStorage.setItem(gridInfoKey, JSON.stringify({ totalPages, totalCount }));
            } else {
              localStorage.removeItem(arrayDataKey);
              localStorage.removeItem(gridInfoKey);
            }
            return { data, totalPages, totalCount, changeCurrentPage, dataLoaded: dataLoadTypes.FromServer, params: extendedOptions, queryString: params, delayTime: getDelayTime(ts) };
          } else {
            throw response;
          }
        })
        .catch(error => {
          error = typeof error === 'object' ? error : { message: error };
          const { code, message } = error instanceof Error && 'toJSON' in error ? error.toJSON() : {};
          const isNetworkError = !!!code && !!message && message.toString().toLowerCase() === 'network error';
          Object.assign(error, { dataLoaded: dataLoadTypes.FromServer, isNetworkError });
          throw error;
        }).finally(() => {
          splashScreen.classList.add("hidden");//ocultar loanding
        });
    } else {
      goToStorage = true;
    }
    splashScreen.classList.remove("hidden"); //>JDL->2022-12-02->Add loanding... //activar loanding
        
    if (goToStorage) {
      if (ifThereAreNoChangesLoadFromStorage || forceLoad === forceLoadTypes.FromLocalStorage) {
        let data = JSON.parse(localStorage.getItem(arrayDataKey) || '[]');
        const { totalPages: storedTotalPages = 0, totalCount: storedTotalCount = 0 } = JSON.parse(localStorage.getItem(gridInfoKey) || {});
        if (clearStoredStateIfResultHasNoData && (totalCount === 0 || data.length === 0)) removeAllStorageKeys(storageKey);
        if (!addRowNumberToResult && data.some(item => rowNumberName in item)) data = data.map(item => {
          delete item[rowNumberName];
          return item;
        });
        const [totalPages, totalCount] = [parseInt(storedTotalPages || '0'), parseInt(storedTotalCount || '0')];
        const target = { data, totalPages, totalCount, changeCurrentPage: false, dataLoaded: dataLoadTypes.FromLocalStorage, params: undefined, queryString: undefined };
        const ts = new Date().getTime();
        return createObservable(target)
          .toPromise()
          .then(response => {
            return { ...response, delayTime: getDelayTime(ts) };
          })
          .catch(error => {
            error = typeof error === 'object' ? error : { message: error };
            Object.assign(error, { dataLoaded: dataLoadTypes.FromLocalStorage, isNetworkError: false });
            throw error;
          }).finally(()=>{
            splashScreen.classList.add("hidden");//ocultar loanding
          });
      } else {
        const target = { data: [], totalPages: 0, totalCount: 0, changeCurrentPage: false, dataLoaded: dataLoadTypes.FromNoSource, params: undefined, queryString: undefined };
        const ts = new Date().getTime();
        return createObservable(target)
          .toPromise()
          .then(response => {
            return { ...response, delayTime: getDelayTime(ts) };
          })
          .catch(error => {
            error = typeof error === 'object' ? error : { message: error };
            Object.assign(error, { dataLoaded: dataLoadTypes.FromNoSource, isNetworkError: false });
            throw error;
          }).finally(()=>{
            splashScreen.classList.add("hidden");//ocultar loanding
          });
      }
    }
  } catch (error) {
    error = typeof error === 'object' ? error : { message: error };
    Object.assign(error, { dataLoaded: undefined, isNetworkError: false });
    throw error;
  }
}

export const getDataSource = ({ data = [], key = 'RowIndex' } = {}) => new DataSource({ store: new ArrayStore({ data, key }), reshapeOnPush: false, requireTotalCount: false });
export default getDataSource;


//Compara el filtro anterior y le agrega los nuevos elementos.
//Al final retorna la lista combina y un flag que indica si hubo cambios
//OldFilter: Filtro que usa el dataSource, en formato Array
//NewFilter: Filtro nuevo en formato de objeto JSON.
//transformData: Funcion que transforma la fecha a texto
//reverseTransformData: Funcion que transforma el texto a fecha
export const compareAndCombineElements = (oldFilterArray, newFilter, transformData, reverseTransformData) => {

  let nuevoFiltro = {};
  let newKeys = Object.keys(newFilter);
  //let oldFilters = {}; 
  let flChange = false;

  for (let i = 0; i < oldFilterArray.length; i++) {
    if (typeof oldFilterArray[i] !== "string" && oldFilterArray[i].length > 0) {
      let [item, , value] = oldFilterArray[i];
      let existsItem = newKeys.find(x => x === item);
      let currentValue = (!!existsItem) ? newFilter[item] : "";
      let isItemDate = false;
      //Validacion especial para valores de tipo Fecha
      if (!!transformData && !!transformData[item] && isFunction(transformData[item])) {
        isItemDate = true;
        value = dateFormat((reverseTransformData[item](value)), "yyyyMMdd");
        if (!!existsItem) currentValue = dateFormat(currentValue, "yyyyMMdd");
      }

      if (!!existsItem) {
        if (currentValue !== value) {
          flChange = true;
          nuevoFiltro[item] = isItemDate ? (transformData[item](convertyyyyMMddToDate(currentValue))) : currentValue;
        } else {
          nuevoFiltro[item] = isItemDate ? (transformData[item](convertyyyyMMddToDate(value))) : value;
        }
        newKeys = newKeys.filter(x => x !== item);//Se elimna el repetido
      }
      //oldFilters[item] = value;
    }
  }

  //Se agrega los faltantes:
  for (let i = 0; i < newKeys.length; i++) {
    if (newFilter[newKeys[i]] !== "") {
      flChange = true;
      nuevoFiltro[newKeys[i]] = newFilter[newKeys[i]];
    }
  }
  /*
    let tmpArrayt = convertFilterObjectToFilterArray(nuevoFiltro, {
      dataTypes: undefined,
      keysToGenerateFilter: [],
      transformData,
      excludeBlankValues: false
    });*/


  return {
    newFilter: convertPropertiesToFilterArray(nuevoFiltro || {}),
    changes: flChange
  }

}

export const convertPropertiesToFilterArray = (properties) => {
  let newArrayFilter = [];
  let keys = Object.keys(properties);
  for (let i = 0; i < keys.length; i++) {


    newArrayFilter.push([keys[i], '=', properties[keys[i]]]);


    newArrayFilter.push("AND");
  }
  newArrayFilter.pop();

  return newArrayFilter;
}
