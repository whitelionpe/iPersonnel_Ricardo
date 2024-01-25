import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";

import PropTypes from 'prop-types';
import { isNotEmpty } from "../../../../../_metronic";
import { Portlet } from "../../../../partials/content/Portlet";
import { handleErrorMessages, handleSuccessMessages } from "../../../../store/ducks/notify-messages";
import { useStylesEncabezado, useStylesTab } from "../../../../store/config/Styles";
import CustomBreadcrumbs from "../../../../partials/layout/CustomBreadcrumbs";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import Confirm from "../../../../partials/components/Confirm";
import { getButtonPermissions, defaultPermissions } from '../../../../../_metronic/utils/securityUtils'

import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import WorkOutlineIcon from '@material-ui/icons/WorkOutline';

import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";

import {
    eliminar, obtener, listar, crear, actualizar
} from "../../../../api/administracion/centroCosto.api";
import CentroCostoListPage from "./CentroCostoListPage";
import CentroCostoEditPage from "./CentroCostoEditPage";

// .::: Filtro CustonDataGrid Ini :::.
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
// .::: Filtro CustonDataGrid End :::.

const CentroCostoIndexPage = (props) => {
    const { intl, setLoading, dataMenu } = props;
    const usuario = useSelector(state => state.auth.user);
    const perfil = useSelector(state => state.perfil.perfilActual);
    const classesEncabezado = useStylesEncabezado();
    const classes = useStylesTab();

    const [varIdCentroCosto, setVarIdCentroCosto] = useState("");
    const [focusedRowKey, setFocusedRowKey] = useState(0);

    const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
    const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
    const [dataRowEditNew, setDataRowEditNew] = useState({});
    const [modoEdicion, setModoEdicion] = useState(false);
    const [selected, setSelected] = useState({
        IdCliente: perfil.IdCliente
    });
    const [tabIndex, setTabIndex] = useState(0);
    const handleChange = (event, newValue) => { setTabIndex(newValue); };

    const [isVisible, setIsVisible] = useState(false);
    const [instance, setInstance] = useState({});

     // .::: Filtro CustonDataGrid Ini :::.
     const [isFirstDataLoad, setIsFirstDataLoad] = useState(true);
     const [refreshData, setRefreshData] = useState(false);
     const ds = new DataSource({ store: new ArrayStore({ data: [], key: 'RowIndex' }), reshapeOnPush: false });
     const [dataSource] = useState(ds);
 
     const refresh = () => dataSource.refresh();
     const resetLoadOptions = () => dataSource.resetLoadOptions();
    // .::: Filtro CustonDataGrid End :::.

    //++++++++Variable (totalRowIndex) para controlar bloqueo de tabs cuando se cambia de búsqueda de un registro en la grilla.++++++++++++++
    const [totalRowIndex, setTotalRowIndex] = useState(0);

    async function agregarCentroCosto(centroCosto) {
        setLoading(true);  
        const {IdCliente, IdCentroCosto, CentroCosto, CodigoInterface, Activo } = centroCosto;
        let param = {
            IdCentroCosto: isNotEmpty(IdCentroCosto) ? IdCentroCosto.toUpperCase() : "",
            CentroCosto: isNotEmpty(CentroCosto) ? CentroCosto.toUpperCase() : "",
            CodigoInterface: isNotEmpty(CodigoInterface) ? CodigoInterface.toUpperCase() : "",
            IdCliente,
            Activo: Activo,
            IdUsuario: usuario.username
        };
        await crear(param)
            .then(response => {
                if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
                setModoEdicion(false);
                listarCentroCostos();
                setRefreshData(true);//Actualizar CustomDataGrid
            })
            .catch(err => {
                handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
            }).finally(() => { setLoading(false); });   
    }

    async function actualizarCentroCosto(centroCosto) {
        setLoading(true);  
        const { IdCliente, IdCentroCosto, CentroCosto, CodigoInterface, Activo } = centroCosto;
        let params = {
            IdCentroCosto: isNotEmpty(IdCentroCosto) ? IdCentroCosto.toUpperCase() : "",
            CentroCosto: isNotEmpty(CentroCosto) ? CentroCosto.toUpperCase() : "",
            CodigoInterface: isNotEmpty(CodigoInterface) ? CodigoInterface.toUpperCase() : "",
            IdCliente,
            Activo: Activo,
            IdUsuario: usuario.username
        };
        await actualizar(params)
            .then(response => {
                handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
                setModoEdicion(false);
                listarCentroCostos();
                setRefreshData(true);//Actualizar CustomDataGrid
            })
            .catch(err => {
                handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
            }).finally(() => { setLoading(false); });   
    }

    async function eliminarRegistro(centroCosto, confirm) {
        setSelected(centroCosto);
        setIsVisible(true);
        if (confirm) {
        setLoading(true);  
        const { IdCentroCosto, IdCliente } = centroCosto;
        await eliminar({
            IdCentroCosto,
            IdCliente,
            IdUsuario: usuario.username
        })
            .then(response => {
                handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
            })
            .catch(err => {
                handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
            }).finally(() => { setLoading(false); });   
        listarCentroCostos();
        setRefreshData(true);//Actualizar CustomDataGrid
        }
    }

    async function listarCentroCostos() {

        setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
        changeTabIndex(0);
        setModoEdicion(false);
    }

    async function obtenerCentroCosto() {
        setLoading(true);  
        const { IdCentroCosto, IdCliente } = selected;
        await obtener({
                IdCentroCosto,
                IdCliente
            }).then(centroCosto => {
                setDataRowEditNew({ ...centroCosto, esNuevoRegistro: false });
            }).catch(err => {
                handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
            }).finally(() => { setLoading(false); });
        }
    

    const nuevoRegistro = () => {
        changeTabIndex(1);
        const { IdCliente } = selected;
        let centroCosto = { Activo: "S", IdCliente };
        setDataRowEditNew({ ...centroCosto, esNuevoRegistro: true });
        setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
        setModoEdicion(true);
    };

    const editarRegistro = dataRow => {
        changeTabIndex(1);
        const { IdCentroCosto, RowIndex } = dataRow;
        setModoEdicion(true);
        setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
        obtenerCentroCosto(IdCentroCosto);
        setFocusedRowKey(RowIndex);
    };

    const cancelarEdicion = () => {
        changeTabIndex(0);
        setModoEdicion(false);
        setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
        setDataRowEditNew({});
    };

    const seleccionarRegistro = dataRow => {
        const { IdCentroCosto, RowIndex } = dataRow;
        setModoEdicion(false);
        setSelected(dataRow);
        setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
        if (IdCentroCosto != varIdCentroCosto) {
            setVarIdCentroCosto(IdCentroCosto);
            setFocusedRowKey(RowIndex);
        }
    }

    const verRegistroDblClick = async (dataRow) => {
        changeTabIndex(1);
        setModoEdicion(false);
        await obtenerCentroCosto(dataRow);
    };

    /************--Configuración de acceso de botones*************/
    const [accessButton, setAccessButton] = useState(defaultPermissions);

    const loadControlsPermission = () => {
        let buttonsPermissions = getButtonPermissions(dataMenu.objetos);
        setAccessButton({ ...accessButton, ...buttonsPermissions });
    }

    const changeTabIndex = (index) => {
        handleChange(null, index);
    }

    useEffect(() => { 
        loadControlsPermission();
    }, []);

    return (
        <>
            <div className="row">
                <div className="col-md-12">
                    <CustomBreadcrumbs 
                        Title={intl.formatMessage({ id: "ADMINISTRATION.COSTCENTER.MENU" })} 
                        SubMenu={intl.formatMessage({ id: "ADMINISTRATION.COSTCENTER.SUBMENU" })} 
                        Subtitle={intl.formatMessage({ id: "ADMINISTRATION.COSTCENTER.MAINTENANCE" })} />
                    <Portlet className={classesEncabezado.border}>
                        <AppBar position="static" className={classesEncabezado.principal}>
                            <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                                <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                                    {intl.formatMessage({ id: "ADMINISTRATION.COSTCENTER.MAINTENANCE" }).toUpperCase()}
                                </Typography>
                            </Toolbar>
                        </AppBar>
                        <>
                            <div className={classes.root}>
                                <Tabs
                                    orientation="vertical"
                                    value={tabIndex}
                                    onChange={handleChange}
                                    aria-label="Vertical tabs"
                                    className={classes.tabs}
                                    variant="fullWidth"
                                    indicatorColor="primary"
                                    textColor="primary" >
                                    <Tab
                                        label={intl.formatMessage({ id: "ACTION.LIST" })}
                                        icon={<FormatListNumberedIcon fontSize="large" />}
                                        {...tabPropsIndex(0)}
                                        className={classes.tabContent}
                                    />
                                    <Tab
                                        label={intl.formatMessage({ id: "ADMINISTRATION.COSTCENTER.COSTCENTER" })}
                                        icon={<WorkOutlineIcon fontSize="large" />}
                                        onClick={(e => obtenerCentroCosto(varIdCentroCosto))} {...tabPropsIndex(1)}
                                        disabled={isNotEmpty(varIdCentroCosto) ? false : true}
                                        className={classes.tabContent}
                                    />
                                </Tabs>
                                <TabPanel value={tabIndex} className={classes.TabPanel} index={0}>
                                    <CentroCostoListPage
                                        titulo={titulo}
                                        editarRegistro={editarRegistro}
                                        eliminarRegistro={eliminarRegistro}
                                        nuevoRegistro={nuevoRegistro}
                                        seleccionarRegistro={seleccionarRegistro}
                                        verRegistroDblClick={verRegistroDblClick}
                                        focusedRowKey={focusedRowKey}
                                        setFocusedRowKey={setFocusedRowKey}
                                        //Propiedades del customerDataGrid 
                                        uniqueId = {"ListarCentroCostoIndexPage"}
                                        isFirstDataLoad={isFirstDataLoad}
                                        setIsFirstDataLoad={setIsFirstDataLoad}
                                        dataSource={dataSource}
                                        refresh={refresh}
                                        resetLoadOptions={resetLoadOptions}
                                        refreshData={refreshData}
                                        setRefreshData={setRefreshData}
                                        //accessButton={accessButton}
                                        setVarIdCentroCosto={setVarIdCentroCosto}
                                        totalRowIndex = {totalRowIndex}
                                        setTotalRowIndex={setTotalRowIndex}

                                    />
                                </TabPanel>
                                <TabPanel value={tabIndex} className={classes.TabPanel} index={1}>
                                    <>
                                        <CentroCostoEditPage
                                            titulo={titulo}
                                            modoEdicion={modoEdicion}
                                            dataRowEditNew={dataRowEditNew}
                                            actualizarCentroCosto={actualizarCentroCosto}
                                            agregarCentroCosto={agregarCentroCosto}
                                            cancelarEdicion={cancelarEdicion}
                                            focusedRowKey={focusedRowKey}
                                            accessButton={accessButton}
                                            settingDataField={dataMenu.datos}
                                        />
                                        <div className="container_only">
                                            <div className="float-right">
                                                <ControlSwitch
                                                    checked={auditoriaSwitch}
                                                    onChange={e => { setAuditoriaSwitch(e.target.checked) }}
                                                /><b> {intl.formatMessage({ id: "AUDIT.DATA" })}</b>
                                            </div>
                                        </div>
                                        {auditoriaSwitch && (<AuditoriaPage dataRowEditNew={dataRowEditNew} />)}
                                    </>
                                </TabPanel>
                            </div>
                        </>

                    </Portlet>
                </div>
            </div>
            <Confirm
                message={intl.formatMessage({ id: "ALERT.REMOVE" })}
                isVisible={isVisible}
                setIsVisible={setIsVisible}
                setInstance={setInstance}
                onConfirm={() => eliminarRegistro(selected, true)}
                title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
                confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
                cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
            />

        </>
    );
};


//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::


function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <Portlet
            component="div"
            role="tabpanel"
            hidden={value !== index}
            id={`vertical-tabpanel-${index}`}
            aria-labelledby={`vertical-tab-${index}`}
            {...other}
        >
            {value === index && <>{children}</>}
        </Portlet>
    );
}
TabPanel.propTypes =
{
    children: PropTypes.node,
    index: PropTypes.any.isRequired,
    value: PropTypes.any.isRequired,
};
function tabPropsIndex(index) {
    return {
        id: `vertical-tab-${index}`,
        'aria-controls': `vertical-tabpanel-${index}`,
    };
}
export default injectIntl(WithLoandingPanel(CentroCostoIndexPage));
