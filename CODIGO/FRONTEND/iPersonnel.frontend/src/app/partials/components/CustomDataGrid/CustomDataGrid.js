import React, { useState, useEffect } from "react";
import Pagination from "@tcoldmf/react-bootstrap-pagination";
import CustomFilter, { convertFilterObjectToFilterArray } from "../CustomFilter";
import {
  performLoad, getStorageKeys, dataLoadTypes,
  getStoredLoadOptions, forceLoadTypes, isSet,
  isUnset, convertArrayFilterToFilterObject, getFilterFromStorageStateExceptThese,
  getMixedLoadOptions, isFunction, removeAllStorageKeys,
  normalizeUserLoadOptions, areSameFilter, debug,
  compareAndCombineElements, getMixedFilter
} from "./CustomDataGridHelper";
import './style.css';
import _ from "lodash";
import PropTypes from "prop-types";
import { dateFormat } from "../../../../_metronic";




const summaryStyle = { textAlign: 'center', position: 'absolute', paddingTop: '8px', paddingLeft: '8px' };

const cssClassFilterRowSize = {
  sm: 'filter-row-sm'
};


const CustomDataGrid = ({
  showLog: userShowLog = true, //Flag que permite pintar el log en la consola, valor default = false

  // GRID
  uniqueId, //Identificador de la data para la grilla en el localstorage, Campo Requierdo
  dataSource, //Enlace de datos. Requerido
  rowNumberName = 'RowIndex', //Nombre de la columna principal, Default RowIndex
  loadWhenStartingComponent = true,//Permite realizar la carga de los datos al iniciar el componente, por default es true 
  renderDataGrid,//El componente datagrid. Requerido
  loadUrl,//Url del api. Requerido
  forceLoad = forceLoadTypes.Unforced,/*Como se va realizar la carga 
                                      Unforced=No se carga |   
                                      FromLocalStorage=lo carga del localstorage | 
                                      FromServer=Lo carga del servidor al localstorage */
  sendToServerOnlyIfThereAreChanges = true, //Permite realizar una peticion al servidor si es que se encuentran cambios en los filtros. Por default es true
  ifThereAreNoChangesLoadFromStorage = true, /*Permite realizar la carga de data desede el localstorage. Default : false  
                                              se debe usar si se realizo un cambio en el localstorage y se desea actualizar la data*/
  caseSensitiveWhenCheckingForChanges = true,//Cuando esta en False convierte a mayusuculas los parametros para que sean iguales. Default es true
  uppercaseFilterRow = true,//Agrega una clase CSS para poner los filtros en mayuscula. Por defecto es true
  initialLoadOptions,//Agrega a los parametros de carga la cantidad de paginacion y columna que ordenara la grilla, es requerido
  filterRowSize = 'sm',//Clase que se le aplicara al contenedor de los filtros, actualmente solo existe el "sm", valor defecto sm
  summaryCountFormat = '{0} / {1} ',//Texto de la paginacio 
  addRowNumberToResult = true,//Flag que indica la creacion de una nueva columna con valores correlativos, Opcional
  allowAutomaticPageTurning = true,//Si puede realizar el cambio de pagina automatico, si es true comprueba que existan cambios de filtro y con eso realiza el cambio de pagina, Opcional
  replaceFilter = false,//Si se remplazan los valores del filtro o se hace un merge con lo anterior, Opcional
  clearStoredStateIfResultHasNoData = true,//Flag que remueve del localstorage la data y el numero de pagina si no existe informacion al consultar el api
  clearFilterIfNoData: userClearFilterIfNoData = false,//Flag que remueve los filtros del localstorage antes de realizar una peticion al api, Opcional
  keysToGenerateFilter: userkeysToGenerateFilter,//Nombre de filtros que se le van a setear siempre, Requerido
  filterData: userFilterData, //Filtros iniciales

  // CUSTOM FILTER
  cssClassForm, //nombre de la clase css que se le aplicara al componente form del filtro, Opcional
  cssClassAppBar, //nombre de la clase css que se le aplicara al componente AppBar del filtro, Opcional
  cssClassToolbar, //nombre de la clase css que se le aplicara al componente ToolBar del filtro, Opcional
  titleCustomFilter,//Nombre del titulo del filtro, Opcional
  visibleCustomFilter = false,//Flag que visualiza el Form de los filtros. Requerido si es que va tener filtro
  renderFormContentCustomFilter,//Componente que pinta el filtro 
  renderFormTitleCustomFilter,//Componente que remplaza al parametro title para agregar como titulo al filtro, Opcional
  transformData, //Objeto con los filtros que se le aplicara una funcion al cargar el parametro, Opcional
  reverseTransformData,//Objeto con los filtros que se le aplicara al retornar los parametros, Opcional 
  StylesForCustomFilterForm,//Estilo que se le aplicara al formulario del filtro, Opcional
  dataTypes,//Se utiliza para los filtros, es un objeto que tiene los filtros como llave y un valor type que indica si es fecha o fecha/hora para aplicarle el formato, Opcional
  performFilterWhenFilterDataHasChanged = false,
  cssClass = '',
  // PAGINATION
  paginationSize = 'md',//Estilo poara el footer
  paginationShadow = false,//Si le aplica sombra al componente pie de pagina. Opcional
  // EVENTS
  onLoading, //Evento que se ejecuta antes de llamar al api, Opcional
  onSuccess, //Evento despues de ejecutar el api y el response retorno la llave "data", Opcional
  onError, //Evento que se ejecuta en el catch que encapsula el llamado al api, Opcional
  onLoaded,//Evento que se ejecuta despues de llamar al api, Opcional
  //Clear checks:
  clearChecks = false,//En caso la grilla tenga la opcion multirow este valor activa o desactiva todos los checks,Opcional
  setClearChecks = () => { },//Actualiza el valor de clearChecks, Opcional

}) => {

  // ------------------------------
  const { metadataKey, loadOptionsKey } = getStorageKeys(uniqueId);
  const originalShowMax = 5;
  const excludeBlankValues = false;
  const keysToGenerateFilter = undefined;

  const gridRef = React.useRef();

  const defaultFilterData = userFilterData ? { ...userFilterData } : (initialLoadOptions ? initialLoadOptions.filter : undefined);
  const { currentPage: userCurrentPage, pageSize: userPageSize } = normalizeUserLoadOptions(initialLoadOptions, undefined, { dataTypes, keysToGenerateFilter, transformData, excludeBlankValues });

  const [arrayData, setArrayData] = useState([]);
  const [currentPage, setCurrentPage] = useState(userCurrentPage);
  const [pageSize, setPageSize] = useState(userPageSize);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [showMax, setShowMax] = useState(5);
  const [disabledCustomFilter, setDisabledCustomFilter] = useState(false);
  const [filterData, setFilterData] = useState({ ...(defaultFilterData || {}) });
  const [previousFilterData, setPreviousFilterData] = useState();
  const [isFilterSetUpForFirstTime, setIsFilterSetUpForFirstTime] = useState(false);
  const [summaryCountText, setSummaryCountText] = useState();
  const [clearFilterIfNoData, setClearFilterIfNoData] = useState(userClearFilterIfNoData);
  const [customFilterHelper] = useState({});
  // ------------------------------
  //const [clearChecks, setClearChecks] = useState(clearChecks);

  const clearChecksGrid = () => {
    if (clearChecks) {
      gridRef.current.instance.deselectAll()
      gridRef.current.instance.clearSelection()
      setClearChecks(false);
    }
  }


  const getCssClass = () => {
    let className = "vcg-custom-data-grid";
    if (cssClass) className += " " + cssClass;
    if (uppercaseFilterRow) className += " uppercase-filter-row";
    if (filterRowSize) className += " " + (cssClassFilterRowSize[filterRowSize] || filterRowSize);
    return className;
  }

  const getDefaultLoadOptions = () => normalizeUserLoadOptions(initialLoadOptions, defaultFilterData, { dataTypes, keysToGenerateFilter, transformData, excludeBlankValues });

  const toFilterArray = (filterObject = filterData) => convertFilterObjectToFilterArray(filterObject, { dataTypes, keysToGenerateFilter, transformData, excludeBlankValues });

  const changeDataStore = (data = arrayData, replaceFilterData = false) => {
    if (dataSource) {
      setArrayData(data || []);
      dataSource.store().clear();
      (data || []).forEach(data => dataSource.store().push([{ type: "insert", data }]));
      setPartOfLoadOptions(replaceFilterData);
      dataSource.reload(); 
    }
  }

  const turnEnabled = enabled => {
    if (gridRef.current && gridRef.current.instance) {
      setDisabledCustomFilter(!enabled);
      gridRef.current.instance.option('disabled', !enabled);
      if (enabled) gridRef.current.instance.endCustomLoading();
      else gridRef.current.instance.beginCustomLoading();
    }
  }

  const loadData = async (config = {}) => { 
    try {
      const stateConfig = {
        currentPage,
        pageSize,
        totalPages,
        totalCount,
        filterData,
      };
      const previousData = [...dataSource.items()];
      const previousTotalPages = totalPages;
      const previousTotalCount = totalCount;
      turnEnabled(false);
      dataSource.store().clear();
      dataSource.reload();
      setTotalPages(0);
      setTotalCount(0);
      const previousStoredLoadOptions = getStoredLoadOptions(loadOptionsKey);
      const originalConfig = { ...config };
      const { optionsPart = {} } = config;
      const { currentPage: storedCurrentPage, pageSize: storedPageSize } = previousStoredLoadOptions;
      const { currentPage: auxCurrentPage, pageSize: auxPageSize } = optionsPart;
      if (isFunction(onLoading)) onLoading({ previousData });
      config = {
        forceLoad,
        addRowNumberToResult,
        rowNumberName,
        sendToServerOnlyIfThereAreChanges,
        ifThereAreNoChangesLoadFromStorage,
        caseSensitiveWhenCheckingForChanges,
        replaceFilter,
        replaceFilterData: false,
        keysToGenerateFilter: userkeysToGenerateFilter,
        allowAutomaticPageTurning,
        initialLoadOptions: getDefaultLoadOptions(),
        clearStoredStateIfResultHasNoData,
        clearFilterIfNoData,
        ...config,
        optionsPart: {
          ...getMixedLoadOptions(loadOptionsKey, getDefaultLoadOptions()),
          ...optionsPart,
          currentPage: (auxCurrentPage || storedCurrentPage || currentPage),
          pageSize: (auxPageSize || storedPageSize || pageSize),
        },
      };
      const response = await performLoad(loadUrl, uniqueId, config, stateConfig); 
      const hasRequestError = !(response && 'data' in response);
      const {
        data = [],
        totalPages: resultTotalPages = 0,
        totalCount: resultTotalCount = 0,
        changeCurrentPage = false,
        dataLoaded = dataLoadTypes.FromNoSource,
        params,
        queryString,
        delayTime,
      } = !hasRequestError ? response : {};
      if (!hasRequestError && isFunction(onSuccess)) onSuccess();
      if (!hasRequestError && userShowLog) generateLog({ dataLoaded, changeCurrentPage, totalPages: resultTotalPages, totalCount: resultTotalCount, data, originalConfig, config, params, queryString, previousStoredLoadOptions, delayTime });
      if (!hasRequestError && dataLoaded !== dataLoadTypes.FromNoSource) {
        setPageSize(auxPageSize || storedPageSize || pageSize);
        setTotalPages(resultTotalPages);
        setTotalCount(resultTotalCount);
        if (changeCurrentPage) setCurrentPage(changeCurrentPage);
        calculateAdjustmentForShowMaxButtonsForPagination(changeCurrentPage ? changeCurrentPage : (auxCurrentPage || storedCurrentPage || currentPage), resultTotalPages);
        changeDataStore(data, config.replaceFilterData);
      } else {
        if (config.clearStoredStateIfResultHasNoData && (previousTotalCount === 0 || previousData.length === 0)) removeAllStorageKeys(uniqueId);
        setTotalPages(previousTotalPages);
        setTotalCount(previousTotalCount);
        changeDataStore(previousData, config.replaceFilterData);
      }
      turnEnabled(true);
      if (isFunction(onLoaded)) onLoaded({ data, totalPages: resultTotalPages, totalCount: resultTotalCount, changeCurrentPage, dataLoaded, params, queryString });
    } catch (error) {
      const { dataLoaded, isNetworkError } = error;
      delete error['dataLoaded'];
      delete error['isNetworkError'];
      turnEnabled(true);
      if (isFunction(onError)) onError({ error, dataLoaded, isNetworkError });
    }
  }

  const generateLog = ({ dataLoaded, changeCurrentPage, totalPages, totalCount, data, originalConfig, config, params, queryString, previousStoredLoadOptions, delayTime }) => {
    if (userShowLog) {
      const { type = debug.LogType.Inline, mode = debug.ModeType.Light, wrapLog = true, from } = typeof userShowLog === 'object' ? userShowLog : {};
      if (!from || getAllowDataLoadTypes(from).includes(dataLoaded)) {
        const info = getLogInfo({ dataLoaded, delayTime, data, totalPages, totalCount, changeCurrentPage, originalConfig, config, params, queryString, previousStoredLoadOptions });
        const [startLog, endLog] = ['# :::::::::::::::::: [ DATA LOAD CALL INFO (CustomDataGrid) ] ::::::::::::::::::: #', '# ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: #'];
        const stringKeys = ['from', 'delayTime', 'totalPages', 'totalCount', 'changeCurrentPage'];
        const lightModeKeys = ['from', 'delayTime', 'data', 'totalPages', 'totalCount'];
        const separator = ':::';
        const items = [];
        const output = [];
        if (type === debug.LogType.Inline) Object.keys(info).forEach(key => { if (lightModeKeys.includes(key) || mode === debug.ModeType.Full) stringKeys.includes(key) ? items.push(key === 'from' ? info[key] : `${separator} ${info[key]}`) : items.push(`${separator} ${key}=>`, info[key]); });
        if (type === debug.LogType.Multiline) Object.keys(info).forEach(key => { if (lightModeKeys.includes(key) || mode === debug.ModeType.Full) stringKeys.includes(key) ? items.push(info[key]) : items.push([`${key}=>`, info[key]]); });
        if (items.length > 0) {
          const showOutput = item => typeof item === 'object' && Array.isArray(item) ? console.log(...item) : console.log(item);
          if (type === debug.LogType.Inline) output.push(items);
          if (type === debug.LogType.Multiline) output.push(...items);
          if (wrapLog) output.unshift(startLog);
          if (wrapLog) output.push(endLog);
          output.forEach(showOutput);
        }
      }
    }
  }
  const getAllowDataLoadTypes = (from) => {
    const { FromNoSource, FromLocalStorage, FromServer } = dataLoadTypes;
    if (from) {
      switch (from) {
        case FromNoSource: return [FromNoSource];
        case FromLocalStorage: return [FromLocalStorage];
        case FromServer: return [FromServer];
        case FromNoSource | FromLocalStorage: return [FromNoSource, FromLocalStorage];
        case FromNoSource | FromServer: return [FromNoSource, FromServer];
        case FromLocalStorage | FromServer: return [FromLocalStorage, FromServer];
        case FromNoSource | FromLocalStorage | FromServer: return [FromNoSource, FromLocalStorage, FromServer];
      }
    }
  }
  const getLogInfo = ({ dataLoaded, delayTime, data, totalPages, totalCount, changeCurrentPage, originalConfig, config, params, queryString, previousStoredLoadOptions }) => {
    const source = ((dataLoaded === dataLoadTypes.FromServer) ? 'SERVER' : (dataLoaded === dataLoadTypes.FromLocalStorage) ? 'LOCAL' : 'NO LOAD');
    const currentStoredLoadOptions = getStoredLoadOptions(loadOptionsKey);
    return {
      from: `[ ${source.padEnd(8, ' ')} ]`,
      delayTime: `delayTime = [ ${delayTime.toString().padStart(7, ' ')} segundos ]`,
      data,
      totalPages: `totalPages=${totalPages}`,
      totalCount: `totalCount=${totalCount}`,
      changeCurrentPage: `changeCurrentPage=${changeCurrentPage}`,
      sortableColumns: getSortableColumns(),
      filterableColumns: getFilterableColumns(),
      originalConfig,
      mixedConfig: config,
      params,
      queryString,
      previousStoredLoadOptions,
      currentStoredLoadOptions,
      dataSource,
      gridRef,
    };
  }

  const setPartOfLoadOptions = (replaceFilterData = false) => {
    loadSortOption();
    loadFilterOption(replaceFilterData);
  }

  const onOptionChanged = async (e) => {
    const { name, fullName, value, component } = e;
    let option = name;
    let columnIndex;
    let selector;
    let replaceFilter = false;
    let allowAutomaticPageTurning = true;
    let forceLoad = forceLoadTypes.Unforced;
    let skip = false;
    if (name === "columns") {
      ([, option] = fullName.split("."));
      ([columnIndex] = /[0-9]+/.exec(fullName));
      ([selector] = component.getVisibleColumns().filter(({ index }) => index >= 0 && index.toString() === columnIndex).map(({ dataField }) => dataField));
    }
    const allowedOptions = ["sortOrder", "filterValue"];
    if (allowedOptions.includes(option)) {
      const optionsPart = getMixedLoadOptions(loadOptionsKey, getDefaultLoadOptions());
      delete optionsPart['currentPage'];
      delete optionsPart['pageSize'];
      switch (option) {
        case "sortOrder":
          delete optionsPart['filter'];
          skip = selector === undefined || value === undefined;
          allowAutomaticPageTurning = false;
          if (!skip) {
            const { sort: [sortExpr] = [] } = optionsPart;
            const desc = value.toString().toLowerCase() === 'desc';
            const { selector: storedSelector, desc: storedDesc } = sortExpr || {};
            skip = selector === storedSelector && desc === storedDesc;
            if (!skip) {
              optionsPart['sort'] = [{ selector, desc }];
            }
          }
          break;
        case "filterValue":
          delete optionsPart['sort'];
          const { filter: storedFilterRow = [] } = optionsPart;
          const storedFilterData = convertArrayFilterToFilterObject(storedFilterRow, reverseTransformData) || {};
          optionsPart['filter'] = [[selector, '=', typeof value === 'string' ? value.replace(/&|#/g, '') : value]];

          skip = storedFilterData[selector] === value;
          if (!isSet(value)) {
            skip = value === undefined;
            if (!skip) {
              replaceFilter = true;
              forceLoad = forceLoadTypes.FromServer;
              optionsPart['filter'] = getFilterFromStorageStateExceptThese(loadOptionsKey, [selector]);
            }
          }
          break;
      }
      if (!skip) {
        await loadData({ forceLoad, allowAutomaticPageTurning, replaceFilter, optionsPart });
      }
    }
  };

  const calculateAdjustmentForShowMaxButtonsForPagination = (page, altTotalPages = totalPages) => {
    setCurrentPage(page);
    let newShowMax = altTotalPages - page >= Math.floor(originalShowMax / 2) ? originalShowMax : altTotalPages - page + 1;
    newShowMax = newShowMax > 3 ? newShowMax : 3;
    if (page === altTotalPages) newShowMax = 2;
    if (showMax !== newShowMax) setShowMax(newShowMax);
  }

  const onChangePage = async (page) => {
    calculateAdjustmentForShowMaxButtonsForPagination(page);
    await loadData({ optionsPart: { currentPage: page, pageSize } });
  }

  const loadSortOption = () => {
    const sortableColumns = getSortableColumns();
    if (sortableColumns && Object.keys(sortableColumns).length > 0) {
      const { sort: [sortExpr] = [] } = getMixedLoadOptions(loadOptionsKey, getDefaultLoadOptions());
      const { selector: dataField, desc } = sortExpr || {};
      if (dataField) {
        gridRef.current.instance.clearSorting();
        gridRef.current.instance.columnOption(dataField, { sortIndex: 0, sortOrder: (desc ? 'desc' : 'asc') });
        dataSource.sort(sortExpr);
      }
    }
  }

  const loadFilterOption = (replaceFilterData = false) => {
    const filterableColumns = getFilterableColumns();
    const { filter = [] } = getStoredLoadOptions(loadOptionsKey);
    const filterData = convertArrayFilterToFilterObject(filter, reverseTransformData) || {};
    if ((isFilterSetUpForFirstTime && hasFilterDataChanged(filterData)) || replaceFilterData) setFilterData(filterData);
    if (filterableColumns && Object.keys(filterableColumns).length > 0) {
      let filterExpr = [];
      filter.filter(item => item && item.length === 3 && Object.keys(filterableColumns).includes(item[0]) && isSet(item[2])).forEach(([dataField, , criteria]) => filterExpr = filterExpr.concat([[dataField, 'contains', criteria], 'AND']));
      filterExpr.pop();

      gridRef.current.instance.clearFilter();
      if (filterData && Object.keys(filterData).length > 0) {
        const targetFilter = Object.keys(filterData).filter(key => Object.keys(filterableColumns).includes(key));
        if (targetFilter && targetFilter.length > 0) {
          targetFilter.forEach(key => {
            try {
              gridRef.current.instance.columnOption(key, { filterValue: filterData[key], selectedFilterOperation: 'contains' });
            } catch (e) { /*console.log(e);*/ }
          });
          gridRef.current.instance.filter(filterExpr);
        }
      }

      if (filterExpr && filterExpr.length > 0) dataSource.filter(filterExpr);
    }
  }

  const getSortableColumns = () => {
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    //..Obtiene columnas ordenables del DataGrid que está como referencia.
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    let sortables;
    if (gridRef && gridRef.current && gridRef.current.instance) {
      sortables = {};
      //V16-JDL-//.gridRef.current.instance._options.columns.filter(({ allowSorting }) => allowSorting).forEach(column => sortables[column.dataField] = column);
      gridRef.current.instance.getVisibleColumns().filter(({ allowSorting }) => allowSorting).forEach(column => sortables[column.dataField] = column);
    }
    return sortables;
  }

  const getFilterableColumns = () => {
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    //..Obtiene filtros de columna del DataGrid que está como referencia.
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    let filterables;
    if (gridRef && gridRef.current && gridRef.current.instance) {
      filterables = {};
      const allowFilteringVisible = gridRef.current.instance.option("filterRow.visible");
      //V16-JDL-// gridRef.current.instance._options.columns.filter(({ allowFiltering = allowFilteringVisible, visible = true }) => allowFiltering && visible).forEach(column => filterables[column.dataField] = column);
      gridRef.current.instance.getVisibleColumns().filter(({ allowFiltering = allowFilteringVisible, visible = true }) => allowFiltering && visible).forEach(column => filterables[column.dataField] = column);
    }
    return filterables;
  }

  const hasFilterDataChanged = (userFilterData = filterData) => {
    const filter = userFilterData ? toFilterArray(userFilterData) : [];
    const previousFilter = previousFilterData ? toFilterArray(previousFilterData) : [];
    return !areSameFilter({ filter1: filter, transformData1: transformData }, { filter2: previousFilter, transformData2: transformData }, caseSensitiveWhenCheckingForChanges);
  }

  const thisKeyHaveSameValue = (key, object1, object2) => {
    return (
      (
        isUnset(object1[key]) &&
        isUnset(object2[key])
      )
      ||
      (
        (
          typeof object1[key] === 'string' &&
          typeof object2[key] === 'string' &&
          (
            caseSensitiveWhenCheckingForChanges ?
              object1[key] === object2[key]
              :
              object1[key].toString().toLowerCase() === object2[key].toString().toLowerCase()
          )
        )
        ||
        (
          typeof object1[key] === 'object' &&
          _.isEqual(object1[key], object2[key])
        )
      )
    );
  }

  const onAfterFilterCustomFilter = async ({ data, filter, infoAboutKeys: { keysChanged } }) => {
    const { filter: filterArray = [] } = getStoredLoadOptions(loadOptionsKey);
    const filterData = convertArrayFilterToFilterObject(filterArray, reverseTransformData, caseSensitiveWhenCheckingForChanges);
    if (keysChanged.some(key => !thisKeyHaveSameValue(key, filterData, data))) await loadData({ optionsPart: { filter } });
  }

  const userLoadData = (config = {}) => {
    return loadData(config);
  }
  const loadDataWithFilter = ({ data: userFilterData = {}, merge = true }) => {
    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    //Asignación de valores adicionales desde el formulario externo.
    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    const filter = toFilterArray(userFilterData);
    return loadData({ replaceFilter: !merge, replaceFilterData: true, optionsPart: { filter } });
  }
  const refresh = (allwaysSendToServer = true) => {
    const forceLoad = allwaysSendToServer ? forceLoadTypes.FromServer : forceLoadTypes.Unforced;
    return loadData({ forceLoad });
  }
  const resetLoadOptions = () => {
    removeAllStorageKeys(uniqueId);
    const optionsPart = getDefaultLoadOptions();
    return loadData({ allowAutomaticPageTurning: false, replaceFilter: true, replaceFilterData: true, optionsPart });
  }
  const clearFilter = () => {
    const filter = toFilterArray(defaultFilterData);
    return loadData({ replaceFilter: true, optionsPart: { filter } });
  }
  const clearLocalStorage = () => removeAllStorageKeys(uniqueId);

  const extendedMethods = {
    totalCount: () => totalCount,
    totalPages: () => totalPages,
    arrayData: () => arrayData,
    hasData: () => arrayData && Array.isArray(arrayData) && arrayData.length > 0,
    loadData: userLoadData,
    loadDataWithFilter,
    refresh,
    resetLoadOptions,
    clearFilter,
    clearLocalStorage,
  };
  const render = () => (
    <div className={getCssClass()}>
      <CustomFilter cssClassForm={cssClassForm}
        cssClassAppBar={cssClassAppBar}
        cssClassToolbar={cssClassToolbar}
        title={titleCustomFilter}
        visible={visibleCustomFilter}
        disabled={disabledCustomFilter}
        helper={customFilterHelper}
        transformData={transformData}
        keysToGenerateFilter={keysToGenerateFilter}
        filterData={filterData}
        performFilterWhenFilterDataHasChanged={false}
        renderFormTitle={renderFormTitleCustomFilter}
        renderFormContent={renderFormContentCustomFilter}
        excludeBlankValues={excludeBlankValues}
        onAfterFilter={onAfterFilterCustomFilter}
      />
      {renderDataGrid({ gridRef, dataSource })}
      {
        totalPages > 0 &&
        <div className="vcg-wrapper-pagination">
          {
            !!summaryCountFormat &&
            !!summaryCountText &&
            <span className="dx-datagrid-summary-item dx-datagrid-text-content classColorPaginador_" style={summaryStyle} >{summaryCountText}</span>
          }
          <Pagination threeDots
            prevNext
            shadow={paginationShadow}
            size={paginationSize}
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
    </div>
  );

  // -+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
  // States Arrays for Effect
  // -+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
  const statesForDataGrid = [
    currentPage,
    pageSize,
    totalPages,
    totalCount,
    disabledCustomFilter,
    filterData,
    isFilterSetUpForFirstTime,
    clearFilterIfNoData,
    // ------------------------------
    loadWhenStartingComponent,
    allowAutomaticPageTurning,
    replaceFilter,
    forceLoad,
    sendToServerOnlyIfThereAreChanges,
    ifThereAreNoChangesLoadFromStorage,
    caseSensitiveWhenCheckingForChanges,
    uppercaseFilterRow,
    clearStoredStateIfResultHasNoData,
    dataTypes,
    transformData,
    reverseTransformData,
    keysToGenerateFilter,
  ];
  const statesForDataSource = [
    addRowNumberToResult,
    rowNumberName,
    filterRowSize,
    loadWhenStartingComponent,
    allowAutomaticPageTurning,
    replaceFilter,
    forceLoad,
    sendToServerOnlyIfThereAreChanges,
    ifThereAreNoChangesLoadFromStorage,
    caseSensitiveWhenCheckingForChanges,
    uppercaseFilterRow,
    clearStoredStateIfResultHasNoData,
    visibleCustomFilter,
    dataTypes,
    transformData,
    reverseTransformData,
    keysToGenerateFilter,
    userkeysToGenerateFilter,
    userFilterData,
    // -----------------------------------------
    arrayData,
    currentPage,
    pageSize,
    totalPages,
    totalCount,
    disabledCustomFilter,
    filterData,
    isFilterSetUpForFirstTime,
    clearFilterIfNoData,
  ];
  const statesForSummaryCount = [summaryCountFormat, pageSize, totalCount, arrayData.length];
  // -+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

  // -+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
  // Effect Functions
  // -+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
  const initialization = () => {
    gridRef.current.instance.option({ loadPanel: { enabled: true }, filterRow: { showOperationChooser: false }, onOptionChanged });
    Object.assign(dataSource, extendedMethods);
    const firstLoad = async () => {
      // await dataSource.load().catch(error => console.log('[[ERROR EN LA PRIMERA CARGA]]', error));
      if (loadWhenStartingComponent) {
        let allowAutomaticPageTurning = true;
        let replaceFilterData = true;
        const optionsPart = {};
        const storedOptions = getStoredLoadOptions(loadOptionsKey);

        //Verifica si tiene parametros en el localStorage
        if (storedOptions && Object.keys(storedOptions).length > 0) {
          replaceFilterData = true;
          //JDELVILLAR->2022-03-09
          //En caso exista se verifica los parametros por default que se estan cargando:
          // if (!!defaultFilterData) {
          //   // [currentPage, pageSize, sort, filter] 
          //   //Se fuciona los parametros nuevos con los existentes 
          //   //Se obtienen los parametros y se comparan si son iguales
          //   //En caso de no ser iguales se fusionan sino , no se hace nada
          //   let oldLoadOptions = getStoredLoadOptions(loadOptionsKey);
          //   let oldArrayFilters = oldLoadOptions.filter || [];

          //   let { newFilter, changes } = compareAndCombineElements(oldArrayFilters, defaultFilterData, transformData, reverseTransformData);
          //   if (changes) {
          //     let tmpStoreOption = getMixedLoadOptions(loadOptionsKey, getDefaultLoadOptions(), replaceFilter, { filter: newFilter });
          //     Object.assign(optionsPart, tmpStoreOption);
          //   } else {
          //     Object.assign(optionsPart, storedOptions);
          //   }

          // } else {
          Object.assign(optionsPart, storedOptions);
          // }


        } else {
          allowAutomaticPageTurning = false;
          Object.assign(optionsPart, { filter: toFilterArray(defaultFilterData) || [] });
        }
        await loadData({ allowAutomaticPageTurning, replaceFilterData, optionsPart });
        setClearFilterIfNoData(false);
        setIsFilterSetUpForFirstTime(true);
      }
    };
    firstLoad();
    return () => {
      gridRef.current = false;
    }
  }

  //Limpiar filtros 
  const performAfterChangedUserClearFilterIfNoData = () => {
    //console.log("useEffect performAfterChangedUserClearFilterIfNoData", { userClearFilterIfNoData });
    setClearFilterIfNoData(userClearFilterIfNoData);
  }

  //Realiza cambios en las opciones del datasource cuando hay cambios en la grilla
  //En las opciones si no existe columna key o no esta en orden vuelve a llamar a load 
  const performAfterChangedStatesForDataGrid = () => {
    //console.log("useEffect performAfterChangedStatesForDataGrid", { statesForDataGrid });
    // if (dataSource && !dataSource.isLoading()) dataSource.requireTotalCount(false);
    gridRef.current.instance.option({ onOptionChanged, paging: { enabled: false } });
  }
  //Realiza cambios en las opciones del datasource cuando hay cambios en el datasource
  //En las opciones si no existe columna key o no esta en orden vuelve a llamar a load 
  const performAfterChangedStatesForDataSource = () => {
    //console.log("useEffect performAfterChangedStatesForDataSource", { statesForDataSource });
    // if (dataSource && !dataSource.isLoading()) dataSource.requireTotalCount(false);
    gridRef.current.instance.option({ onOptionChanged, paging: { enabled: false } });
    Object.assign(dataSource, extendedMethods);
  }
  //Realiza el cambio de filtro
  const performAfterChangedUserFilterData = () => {
    if (isFilterSetUpForFirstTime && hasFilterDataChanged(userFilterData)) setFilterData(userFilterData);
  }
  const performAfterChangedFilterData = () => {
    setPreviousFilterData(filterData);
  }
  const performAfterChangedCustomFilterHelper = () => {
    if (customFilterHelper && typeof customFilterHelper === 'object' && 'filter' in customFilterHelper) {
      const { filter: filterWithData } = customFilterHelper;
      Object.assign(dataSource, { filterWithData });
    }
  }
  const performAfterChangedStatesForSummaryCount = () => {
    if (!!summaryCountFormat && pageSize > 0 && totalCount > 0) {
      const count = (totalCount < pageSize) ? totalCount : ((arrayData.length < pageSize) ? arrayData.length : pageSize);
      setSummaryCountText(summaryCountFormat.replace('{0}', count).replace('{1}', totalCount));
    }
  }
  // -+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

  // -+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
  // Effects
  // -+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
  useEffect(initialization, []);
  useEffect(performAfterChangedUserClearFilterIfNoData, [userClearFilterIfNoData]);
  useEffect(performAfterChangedStatesForDataGrid, [...statesForDataGrid]);
  useEffect(performAfterChangedStatesForDataSource, [...statesForDataSource]);
  useEffect(performAfterChangedStatesForSummaryCount, [...statesForSummaryCount]);
  useEffect(performAfterChangedUserFilterData, [userFilterData]);
  useEffect(performAfterChangedFilterData, [filterData]);
  useEffect(performAfterChangedCustomFilterHelper, [customFilterHelper]);
  useEffect(clearChecksGrid, [clearChecks])
  // -+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

  return render();
};

export default CustomDataGrid;
