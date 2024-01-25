import React, { useState } from "react";
import { injectIntl } from "react-intl";
import { AppBar } from "@material-ui/core";
import { Toolbar } from "@material-ui/core";
import { Typography } from "@material-ui/core";
import { Portlet } from "../../../../../partials/content/Portlet";
import { useStylesEncabezado, useStylesTab } from "../../../../../store/config/Styles";
import CustomBreadcrumbs from "../../../../../partials/layout/CustomBreadcrumbs";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import { dateFormat, getStartAndEndOfMonthByDay, isNotEmpty } from '../../../../../../_metronic/utils/utils';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import ConsumoComedoresListPage from "./ConsumoComedoresListPage";
import ConsumoComedoresFilterPage from "./ConsumoComedoresFilterPage";
import { useSelector } from "react-redux";
import { handleErrorMessages, handleSuccessMessages } from "../../../../../store/ducks/notify-messages";
import TabNavContainer from "../../../../../partials/components/Tabs/TabNavContainer";
import Check from "@material-ui/icons/Check";
import Clear from "@material-ui/icons/Clear";
import { exportarExcel, exportarExcelNegados } from "../../../../../api/casino/reporte.api";
import ConsumoComedoresNegadoListPage from "./ConsumoComedoresNegadoListPage";


export const initialFilter = {
    IdCliente: '',
    IdDivision: '',
    IdComedor: '',
    IdServicio: '',
    IdUnidadOrganizativa: '',
    IdCompania: '',
    Compania: '',
    IdCentroCosto: '',
    CentroCosto: '',
    Personas: '',
    FechaInicio: '',
    FechaFin: ''
};


const ConsumoComedoresIndexPage = (props) => {

    const { intl, setLoading } = props;
    const classesEncabezado = useStylesEncabezado();
    const classes = useStylesTab();
    const { FechaInicio, FechaFin } = getStartAndEndOfMonthByDay();
    const perfil = useSelector((state) => state.perfil.perfilActual);
    const [value, setValue] = useState(0);
    const [tabIndex, setTabIndex] = useState(0);

    //FILTRO
    const [isFirstDataLoad, setIsFirstDataLoad] = useState(true);
    const [refreshData, setRefreshData] = useState(false);
    const ds = new DataSource({ store: new ArrayStore({ data: [], key: 'RowIndex' }), reshapeOnPush: false });
    const [dataSource] = useState(ds);

    const refresh = () => dataSource.refresh();
    const resetLoadOptions = () => dataSource.resetLoadOptions();
    const [dataGridRef, setDataGridRef] = useState(null);

    //FILTRO NEGADOS
    const [isFirstDataLoadNegado, setIsFirstDataLoadNegado] = useState(true);
    const [refreshDataNegado, setRefreshDataNegado] = useState(false);
    const dsNegado = new DataSource({ store: new ArrayStore({ data: [], key: 'RowIndex' }), reshapeOnPush: false });
    const [dataSourceNegado] = useState(dsNegado);

    const refreshNegado = () => dataSourceNegado.refresh();
    const resetLoadOptionsNegado = () => dataSourceNegado.resetLoadOptions();
    const [dataGridRefNegados, setDataGridRefNegados] = useState(null);

    const [dataRowEditNew, setDataRowEditNew] = useState({
        ...initialFilter,
        //esNuevoRegistro: true,
        IdCliente: perfil.IdCliente,
        IdDivision: perfil.IdDivision,
        FechaInicio,
        FechaFin
    });

    const handleChange = (event, newValue) => {

        setTabIndex(newValue);
        setValue(newValue);
        clearDataGrid();
        //Cambio tab-> Obtener parametros  
        let filtro = {
            IdCliente:dataRowEditNew.IdCliente,
            IdDivision:dataRowEditNew.IdDivision,
            IdComedor: isNotEmpty(dataRowEditNew.IdComedor) ? dataRowEditNew.IdComedor : "",
            IdServicio: isNotEmpty(dataRowEditNew.IdServicio) ? dataRowEditNew.IdServicio : "",
            IdCompania: isNotEmpty(dataRowEditNew.IdCompania) ? dataRowEditNew.IdCompania : "",
            IdCentroCosto: isNotEmpty(dataRowEditNew.IdCentroCosto) ? dataRowEditNew.IdCentroCosto : "",
            FechaInicio: dateFormat(dataRowEditNew.FechaInicio, 'yyyyMMdd'),
            FechaFin: dateFormat(dataRowEditNew.FechaFin, 'yyyyMMdd'),
            Personas: isNotEmpty(dataRowEditNew.Personas) ? dataRowEditNew.Personas : "",
            IdUnidadOrganizativa: isNotEmpty(dataRowEditNew.UnidadesOrganizativas) ? dataRowEditNew.UnidadesOrganizativas : "",
        }
        //Enviar al servidor para recuperar datos
        filtrarReporte(filtro);
        //Volver a consultar para recuperar data otorgados/Negados
        document.getElementById("btnSearch").click()
        
    };

    const filtrarReporte = (filtro) => {

        const { IdCliente, IdDivision,
            IdComedor,
            IdServicio,
            IdCompania,           
            IdCentroCosto,           
            FechaInicio,
            FechaFin,
            Personas,
            IdUnidadOrganizativa
        } = filtro;
        //Asgnar filtros en un objeto.
        let fitroAplicar={
            IdCliente, IdDivision,
            IdComedor,
            IdServicio,
            IdCompania,           
            IdCentroCosto,           
            FechaInicio,
            FechaFin,
            Personas,
            IdUnidadOrganizativa,
            FechaRefesh : new Date()
        }
        //comunicarnos con customerDataGrid.

       if ( typeof dataSource.loadDataWithFilter != 'undefined' ) {
            dataSource.loadDataWithFilter({
                data: fitroAplicar
            });
        }
        if (typeof dataSourceNegado.loadDataWithFilter != 'undefined') {
            dataSourceNegado.loadDataWithFilter({
                data: fitroAplicar
            });
        } 
       
    };

    const clearDataGrid = () => {
        // if (tabIndex === 0) resetLoadOptions();
        // else if (tabIndex === 1) resetLoadOptionsNegado();

        if ( typeof dataSource.loadDataWithFilter != 'undefined' ) {
            resetLoadOptions();
        }
        if (typeof dataSourceNegado.loadDataWithFilter != 'undefined') {
            resetLoadOptionsNegado();
        } 
        
    };

    const exportReport = async () => {
        let result = JSON.parse(tabIndex === 0
            ? localStorage.getItem('vcg:consumoComedoresList:loadOptions')
            : localStorage.getItem('vcg:consumoComedoresNegadoList:loadOptions')
        );
        if (!isNotEmpty(result)) return;
        let filterExport = {
            IdCliente,
            IdDivision: isNotEmpty(IdDivision) ? IdDivision : "",
            FechaInicio,
            FechaFin
        }
        // Recorremos los filtros usados:
        for (let i = 0; i < result.filter.length; i++) {
            let currentValue = result.filter[i];

            // Filtramos solo los Array
            if (currentValue instanceof Array) {

                // Recorremos cada uno de los filtros en el array
                for (let j = 0; j < currentValue.length; j++) {

                    //Llenamos filterData para decompilarlo en el siguente punto.
                    filterExport[currentValue[0]] = currentValue[2];
                }
            }
        }
        //obtener orden para exportar
        const { selector } = result.sort[0];

        // Decompilando filterData
        const { IdCliente, IdDivision, IdUnidadOrganizativa, IdComedor, IdServicio, IdCompania, IdCentroCosto, IdPersona, FechaInicio, FechaFin, Personas, UnidadesOrganizativas } = filterExport
        if (tabIndex === 0) {
            if (dataGridRef.current.props.dataSource._items.length > 0) {

                let ListColumnName = [];
                let ListDataField = [];

                dataGridRef.current._optionsManager._currentConfig.configCollections.columns.map(item => {
                    if ((item.options.visible === undefined || item.options.visible === true) && item.options.type != 'buttons') {
                        ListColumnName.push(item.options.caption.toUpperCase());
                        ListDataField.push(item.options.dataField);
                    }
                })
                //Obtener dataGrid titulo columnas + idColumnas para exportar de forma dinamica.
                let ArrayColumnHeader = ListColumnName.join('|');
                let ArrayColumnId = ListDataField.join('|');
                //var Order = NombreCompleto();

                let params = {
                    IdCliente: IdCliente,
                    IdDivision: IdDivision,
                    IdUnidadOrganizativa: isNotEmpty(IdUnidadOrganizativa) ? IdUnidadOrganizativa : "",
                    IdComedor: isNotEmpty(IdComedor) ? IdComedor : "",
                    IdServicio: isNotEmpty(IdServicio) ? IdServicio : "",
                    IdCompania: isNotEmpty(IdCompania) ? IdCompania : "",
                    IdCentroCosto: isNotEmpty(IdCentroCosto) ? IdCentroCosto : "",
                    IdPersona: isNotEmpty(IdPersona) ? IdPersona : "",
                    FechaInicio: isNotEmpty(FechaInicio) ? FechaInicio : "",
                    FechaFin: isNotEmpty(FechaFin) ? FechaFin : "",
                    Personas: isNotEmpty(Personas) ? Personas : "",
                    UnidadesOrganizativas: isNotEmpty(UnidadesOrganizativas) ? UnidadesOrganizativas : "",
                    TituloHoja: intl.formatMessage({ id: "COMMON.REPORT" }) + ' ' + intl.formatMessage({ id: "CONFIG.MENU.COMEDORES.CONSUMO_DE_COMEDORES" }),
                    NombreHoja: intl.formatMessage({ id: "CONFIG.MENU.COMEDORES.CONSUMO_DE_COMEDORES" }),
                    ArrayColumnHeader,
                    ArrayColumnId,
                    OrderField: selector
                };
                setLoading(true);
                await exportarExcel(params).then(response => {
                    //result = response;      
                    if (isNotEmpty(response.fileBase64)) {
                        let download = document.getElementById('iddescarga');
                        download.href = `data:application/vnd.ms-excel;base64,${encodeURIComponent(response.fileBase64)}`;
                        download.download = response.fileName;
                        download.click();
                        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.DOWNLOAD.SUCESS" }));
                    }
                }).catch(err => {
                    handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
                }).finally(() => {
                    setLoading(false);
                });
            }
        } else if (tabIndex === 1) {
            if (dataGridRefNegados.current.props.dataSource._items.length > 0) {

                let ListColumnName = [];
                let ListDataField = [];

                dataGridRefNegados.current._optionsManager._currentConfig.configCollections.columns.map(item => {
                    if ((item.options.visible === undefined || item.options.visible === true) && item.options.type != 'buttons') {
                        ListColumnName.push(item.options.caption.toUpperCase());
                        ListDataField.push(item.options.dataField);
                    }
                })
                //Obtener dataGrid titulo columnas + idColumnas para exportar de forma dinamica.
                let ArrayColumnHeader = ListColumnName.join('|');
                let ArrayColumnId = ListDataField.join('|');
                //var Order = NombreCompleto();

                let params = {
                    IdCliente: IdCliente,
                    IdDivision: IdDivision,
                    IdUnidadOrganizativa: isNotEmpty(IdUnidadOrganizativa) ? IdUnidadOrganizativa : "",
                    IdComedor: isNotEmpty(IdComedor) ? IdComedor : "",
                    IdServicio: isNotEmpty(IdServicio) ? IdServicio : "",
                    IdCompania: isNotEmpty(IdCompania) ? IdCompania : "",
                    IdCentroCosto: isNotEmpty(IdCentroCosto) ? IdCentroCosto : "",
                    IdPersona: isNotEmpty(IdPersona) ? IdPersona : "",
                    FechaInicio: isNotEmpty(FechaInicio) ? FechaInicio : "",
                    FechaFin: isNotEmpty(FechaFin) ? FechaFin : "",
                    Personas: isNotEmpty(Personas) ? Personas : "",
                    UnidadesOrganizativas: isNotEmpty(UnidadesOrganizativas) ? UnidadesOrganizativas : "",
                    TituloHoja: intl.formatMessage({ id: "COMMON.REPORT" }) + ' ' + intl.formatMessage({ id: "CONFIG.MENU.COMEDORES.CONSUMO_DE_COMEDORES" }) + ' ' + intl.formatMessage({ id: "CASINO.MARKING.DENIED" }),
                    NombreHoja: intl.formatMessage({ id: "CONFIG.MENU.COMEDORES.CONSUMO_DE_COMEDORES" }) + ' ' + intl.formatMessage({ id: "CASINO.MARKING.DENIED" }),
                    ArrayColumnHeader,
                    ArrayColumnId,
                    OrderField: selector
                };
                setLoading(true);
                await exportarExcelNegados(params).then(response => {
                    //result = response;      
                    if (isNotEmpty(response.fileBase64)) {
                        let download = document.getElementById('iddescarga');
                        download.href = `data:application/vnd.ms-excel;base64,${encodeURIComponent(response.fileBase64)}`;
                        download.download = response.fileName;
                        download.click();
                        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.DOWNLOAD.SUCESS" }));
                    }
                }).catch(err => {
                    handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
                }).finally(() => {
                    setLoading(false);
                });
            }
        }
    };

    const tabContent_ConsumosOtorgados = () => {
        return (
            <ConsumoComedoresListPage
                uniqueId={"consumoComedoresList"}
                isFirstDataLoad={isFirstDataLoad}
                setIsFirstDataLoad={setIsFirstDataLoad}
                dataSource={dataSource}
                refresh={refresh}
                resetLoadOptions={resetLoadOptions}
                refreshData={refreshData}
                setRefreshData={setRefreshData}
                dataRowEditNew={dataRowEditNew}
                setDataRowEditNew={setDataRowEditNew}
                setDataGridRef={setDataGridRef}
            />
        );
    };

    const tabContent_ConsumosNegados = () => {
        return (
            <ConsumoComedoresNegadoListPage
                uniqueId={"consumoComedoresNegadoList"}
                isFirstDataLoad={isFirstDataLoadNegado}
                setIsFirstDataLoad={setIsFirstDataLoadNegado}
                dataSource={dataSourceNegado}
                refresh={refreshNegado}
                resetLoadOptions={resetLoadOptionsNegado}
                refreshData={refreshDataNegado}
                setRefreshData={setRefreshDataNegado}
                dataRowEditNew={dataRowEditNew}
                setDataRowEditNew={setDataRowEditNew}
                setDataGridRef={setDataGridRefNegados}
            />
        );
    };

    return (
        <>
            <a id="iddescarga" className="" ></a>
            <CustomBreadcrumbs
                Title={intl.formatMessage({ id: "CONFIG.MODULE.COMEDORES" })}
                SubMenu={intl.formatMessage({ id: "CONFIG.MENU.COMEDORES.REPORTE" })}
                Subtitle={intl.formatMessage({ id: `CONFIG.MENU.COMEDORES.CONSUMO_DE_COMEDORES` })}
            />
            <Portlet>
                <AppBar position="static" className={classesEncabezado.principal}>
                    <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                        <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                            {intl.formatMessage({ id: "CONFIG.MENU.COMEDORES.REPORTE" }) + ' - ' + intl.formatMessage({ id: `CONFIG.MENU.COMEDORES.CONSUMO_DE_COMEDORES` })}
                        </Typography>
                    </Toolbar>
                </AppBar>
                <ConsumoComedoresFilterPage
                    dataRowEditNew={dataRowEditNew}
                    setDataRowEditNew={setDataRowEditNew}
                    filtrarReporte={filtrarReporte}
                    clearDataGrid={clearDataGrid}
                    exportReport={exportReport}
                    dataGridRef={dataGridRef}
                    dataGridRefNegado={dataGridRefNegados}
                    currentTab={tabIndex}
                />
                <TabNavContainer
                    isVisibleCustomBread={false}
                    isVisibleAppBar={false}
                    tabIndex={tabIndex}
                    handleChange={handleChange}
                    orientation={"horizontal"}
                    componentTabsHeaders={[
                        {
                            label: intl.formatMessage({ id: "CASINO.MARKING.GRANTED" }),
                            icon: <Check fontSize="medium" />,
                            className: classes.tabContent
                        },
                        {
                            label: intl.formatMessage({ id: "CASINO.MARKING.DENIED" }),
                            icon: <Clear fontSize="medium" />,
                            className: classes.tabContent
                        }
                    ]}
                    className={classes.tabContent}
                    componentTabsBody={[
                        tabContent_ConsumosOtorgados(),
                        tabContent_ConsumosNegados()
                    ]}
                />
            </Portlet>
        </>
    );
};


export default injectIntl(WithLoandingPanel(ConsumoComedoresIndexPage));
