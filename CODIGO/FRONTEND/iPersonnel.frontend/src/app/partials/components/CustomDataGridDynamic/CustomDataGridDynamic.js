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
  dataTypes,//Se utiliza para los filtros, es un objeto que tiene los filtros como llave y un valor type que indica si es fecha o fecha/hora para aplicarle el formato, Opcional
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
  additionalProperties = [], //Propiedades adicionales para las columnas dinamicas:  [{dataField:"nombre",properties:{ ..Eventos }}]
}) => {

  // ------------------------------
  const { loadOptionsKey } = getStorageKeys(uniqueId);
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
  const [dynamicColumns, setDynamicColumns] = useState([]);

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
    // console.log("changeDataStore", { dataSource, data });
    if (dataSource) {
      setArrayData(data || []);
      dataSource.store().clear();
      (data || []).forEach(data => dataSource.store().push([{ type: "insert", data }]));
      setPartOfLoadOptions(replaceFilterData);
      dataSource.reload();
    }
  }

  const turnEnabled = enabled => {
    // console.log("turnEnabled", { enabled }, gridRef.current);
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
      setDynamicColumns([]);
      const previousStoredLoadOptions = getStoredLoadOptions(loadOptionsKey);
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
      // console.log("response performLoad-> ", { response });
      const hasRequestError = !(response && 'data' in response);
      const {
        data = [],
        LabelsKey,
        FieldsKey,
        totalPages: resultTotalPages = 0,
        totalCount: resultTotalCount = 0,
        changeCurrentPage = false,
        dataLoaded = dataLoadTypes.FromNoSource,
        params,
        queryString,
      } = !hasRequestError ? response : {};
      //EGSC - CONSTRUIR FILAS Y COLUMNAS DE ACUERDO AL FieldKey
      if (!hasRequestError && isFunction(onSuccess)) onSuccess();

      if (!hasRequestError && dataLoaded !== dataLoadTypes.FromNoSource) {
        setPageSize(auxPageSize || storedPageSize || pageSize);
        setTotalPages(resultTotalPages);
        setTotalCount(resultTotalCount);
        // FieldsKey LabelsKey EGSC

        if (changeCurrentPage) setCurrentPage(changeCurrentPage);
        calculateAdjustmentForShowMaxButtonsForPagination(changeCurrentPage ? changeCurrentPage : (auxCurrentPage || storedCurrentPage || currentPage), resultTotalPages);
        changeDataStore(data, config.replaceFilterData);
      } else {
        if (config.clearStoredStateIfResultHasNoData && (previousTotalCount === 0 || previousData.length === 0)) removeAllStorageKeys(uniqueId);
        setTotalPages(previousTotalPages);
        setTotalCount(previousTotalCount);
        changeDataStore(previousData, config.replaceFilterData);
      }

      // console.log("Columnas Dinamicas->", { FieldsKey, LabelsKey });
      if (!!FieldsKey && FieldsKey.length > 0) {
        let newcolumns = await createDynamicColumns(FieldsKey, LabelsKey, additionalProperties);
        // console.log("newcolumns", { newcolumns });
        setDynamicColumns(newcolumns);
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

  const createDynamicColumns = (columns, labels, additionalProperties) => {
    let dinamycColumns = columns.map((item, index) => {
      let [field, tipo] = item.Field.split("#");
      let fieldProperties = additionalProperties.find(x => x.dataField === field);
      let properties = {
        dataField: field,
        caption: labels[index].Label,
        alignment: "left",
        events: {}
      };

      if (!!fieldProperties) {
        properties.events = {
          ...fieldProperties.properties
        };
      }
      if (!!tipo) {
        if (tipo === "D") {
          properties.alignment = "center";
          properties.events = {
            ...properties.events,
            dataType: "date",
            format: "dd/MM/yyy"
          };
        }
      }
      return { ...properties };
    });

    return dinamycColumns;
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
    if (name === "columns" && fullName.indexOf(".") >= 0) {//EGSC - Se agrega indexof para validar el string tenga un .

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
        default: break;
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
      {renderDataGrid({ gridRef, dataSource, dynamicColumns })}
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
