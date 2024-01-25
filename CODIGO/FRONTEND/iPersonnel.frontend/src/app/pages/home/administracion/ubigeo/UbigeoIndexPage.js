import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";

import PropTypes from 'prop-types';
import { TYPE_SISTEMA_ENTIDAD, isNotEmpty, listarEstado } from "../../../../../_metronic";
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
import LocationOnIcon from '@material-ui/icons/LocationOn';

import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";

import {
    obtenerTodos as listarPaises,
} from "../../../../api/sistema/pais.api";
import {
    obtener, listar, crear, actualizar, eliminar
} from "../../../../api/administracion/ubigeo.api";
import UbigeoListPage from "./UbigeoListPage";
import UbigeoEditPage from "./UbigeoEditPage";

// .::: Filtro CustonDataGrid Ini :::.
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import { servicePersona } from "../../../../api/administracion/persona.api";
// .::: Filtro CustonDataGrid End :::.
export const initialFilter = {
    IdUbigeo: "",
    Pais: "",
    Departamento: "",
    Provincia: "",
    Distrito: "",
    Activo : "S"
};



const UbigeoIndexPage = (props) => {
    const { intl, setLoading, dataMenu } = props;
    const usuario = useSelector(state => state.auth.user);
    const perfil = useSelector(state => state.perfil.perfilActual);
    const classesEncabezado = useStylesEncabezado();
    const classes = useStylesTab();

    // const [ubigeos, setUbigeos] = useState([]);
    const [paisData, setPaisData] = useState([]);
    const [varIdUbigeo, setVarIdUbigeo] = useState("");
    const [focusedRowKey, setFocusedRowKey] = useState(0); 
    const [idPaisActual, setIdPaisActual] = useState(perfil.IdPais);
     

    const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
    const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
    const [dataRowEditNew, setDataRowEditNew] = useState({});
    const [modoEdicion, setModoEdicion] = useState(false);
    const [selected, setSelected] = useState({});
    const [tabIndex, setTabIndex] = useState(0);
    const handleChange = (event, newValue) => { setTabIndex(newValue); };

    const [isVisible, setIsVisible] = useState(false);
    const [instance, setInstance] = useState({});  
    const [dataCombos, setDataCombos] = useState([]);
    
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

    async function agregarUbigeo(dataRow) {
        setLoading(true);
        const { IdUbigeo, IdPais, Departamento, Provincia, Distrito, Activo } = dataRow;
        let params = {
            IdUbigeo: isNotEmpty(IdUbigeo) ? IdUbigeo.toUpperCase() : ""
            , IdPais: isNotEmpty(IdPais) ? IdPais.toUpperCase() : ""
            , Departamento: isNotEmpty(Departamento) ? Departamento.toUpperCase() : ""
            , Provincia: isNotEmpty(Provincia) ? Provincia.toUpperCase() : ""
            , Distrito: isNotEmpty(Distrito) ? Distrito.toUpperCase() : ""
            , Activo: Activo
            , IdUsuario: usuario.username
        };
        await crear(params).then(response => {
            if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
            setModoEdicion(false);
            listarUbigeo();
            setRefreshData(true);//Actualizar CustomDataGrid
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        }).finally(() => { setLoading(false); });
    }

    async function actualizarUbigeo(dataRow) {
        setLoading(true);
        const { IdUbigeo, IdPais, Departamento, Provincia, Distrito, Activo } = dataRow;
        let params = {
            IdUbigeo: isNotEmpty(IdUbigeo) ? IdUbigeo.toUpperCase() : ""
            , IdPais: isNotEmpty(IdPais) ? IdPais.toUpperCase() : ""
            , Departamento: isNotEmpty(Departamento) ? Departamento.toUpperCase() : ""
            , Provincia: isNotEmpty(Provincia) ? Provincia.toUpperCase() : ""
            , Distrito: isNotEmpty(Distrito) ? Distrito.toUpperCase() : ""
            , Activo: Activo
            , IdUsuario: usuario.username
        };
        await actualizar(params).then(() => {
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
            setModoEdicion(false);
            setRefreshData(true);//Actualizar CustomDataGrid
            listarUbigeo();
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        }).finally(() => { setLoading(false); });
    }

    async function eliminarRegistro(dataRow, confirm) {
        setSelected(dataRow);
        setIsVisible(true);
        if (confirm) {
        setLoading(true);
        const { IdUbigeo } = dataRow;
        await eliminar({ IdUbigeo: IdUbigeo, IdUsuario: usuario.username }).then(response => {
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        }).finally(() => { setLoading(false); });
        listarUbigeo();
        setRefreshData(true);//Actualizar CustomDataGrid
    }
    }



    async function obtenerUbigeo() {
        setLoading(true);
        const { IdUbigeo } = selected;  
        await obtener({ IdUbigeo 
        }).then(ubigeo => {
            setDataRowEditNew({ ...ubigeo, esNuevoRegistro: false });
        }).catch(err => {
                handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
            }).finally(() => { setLoading(false); });
    }


    const nuevoRegistro = () => {
        changeTabIndex(1);
        let ubigeo = { Activo: "S" };
        setDataRowEditNew({ ...ubigeo, esNuevoRegistro: true });
        setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
        setModoEdicion(true);
    };

    const seleccionarRegistro = dataRow => {
        const { IdUbigeo, RowIndex } = dataRow;
        setSelected(dataRow);
        setModoEdicion(false);
        setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
        if (IdUbigeo != varIdUbigeo) {
            setVarIdUbigeo(IdUbigeo);
            setFocusedRowKey(RowIndex);
        }
    }
    const editarRegistro = async (dataRow) => {
        changeTabIndex(1);
        const { IdUbigeo, RowIndex } = dataRow;
        setModoEdicion(true);
        setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
        obtenerUbigeo(IdUbigeo);
        setFocusedRowKey(RowIndex);
    };

    const verRegistroDblClick = async (dataRow) => {
        changeTabIndex(1);
        setModoEdicion(false);
        await obtenerUbigeo(dataRow);
    };

    const cancelarEdicion = () => {
        changeTabIndex(0);
        setModoEdicion(false);
        setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
        setDataRowEditNew({});
    };

    async function listarUbigeo() {
        setRefreshData(true);//Actualizar CustomDataGrid
        setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
        changeTabIndex(0);
        setModoEdicion(false);

    }

    async function listarPais() {
        let pais = await listarPaises().catch(err => { handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err); });
        console.log("***listarPais :> ", pais);
        setPaisData(pais);
    }

    const changeTabIndex = (index) => {
        handleChange(null, index);
    }
  
     /************--Configuración de acceso de botones*************/
     const [accessButton, setAccessButton] = useState(defaultPermissions);

     const loadControlsPermission = () => {
         let buttonsPermissions = getButtonPermissions(dataMenu.objetos);
         setAccessButton({ ...accessButton, ...buttonsPermissions });
     }

    useEffect(() => { 
        //  listarUbigeo();
        listarPais();
        loadControlsPermission();
    }, []);

    return (
        <>
            <div className="row">
                <div className="col-md-12">
                    <Portlet >
                        <CustomBreadcrumbs
                            Title={intl.formatMessage({ id: "ADMINISTRATION.UBIGEO.MENU" })}
                            SubMenu={intl.formatMessage({ id: "ADMINISTRATION.UBIGEO.SUBMENU" })}
                            Subtitle={intl.formatMessage({ id: "ADMINISTRATION.UBIGEO.MAINTENANCE" })}
                        />
                        <AppBar position="static" className={classesEncabezado.principal}>
                            <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                                <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                                    {intl.formatMessage({ id: "ADMINISTRATION.UBIGEO.MAINTENANCE" })}
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
                                        label={intl.formatMessage({ id: "ADMINISTRATION.UBIGEO.MAINTENANCE" })}
                                        icon={<LocationOnIcon fontSize="large" />}
                                        onClick={(e => obtenerUbigeo(selected))} {...tabPropsIndex(1)}
                                        disabled={isNotEmpty(varIdUbigeo) ? false : true}
                                        className={classes.tabContent}
                                    />
                                </Tabs>
                                <TabPanel value={tabIndex} className={classes.TabPanel} index={0}>
                                    <UbigeoListPage
                                        titulo={titulo}
                                        editarRegistro={editarRegistro}
                                        eliminarRegistro={eliminarRegistro}
                                        nuevoRegistro={nuevoRegistro}
                                        seleccionarRegistro={seleccionarRegistro}
                                        verRegistroDblClick={verRegistroDblClick}
                                        focusedRowKey={focusedRowKey}
                                        setFocusedRowKey={setFocusedRowKey}
                                        //Propiedades del customerDataGrid 
                                        uniqueId = {"ListarUbigeoUbigeoIndexPage"}
                                        isFirstDataLoad={isFirstDataLoad}
                                        setIsFirstDataLoad={setIsFirstDataLoad}
                                        dataSource={dataSource}
                                        refresh={refresh}
                                        resetLoadOptions={resetLoadOptions}
                                        refreshData={refreshData}
                                        setRefreshData={setRefreshData}
                                        accessButton={accessButton}
                                        setVarIdUbigeo={setVarIdUbigeo}
                                        totalRowIndex = {totalRowIndex}
                                        setTotalRowIndex={setTotalRowIndex} 
                                        paisData={paisData}
                                        idPaisActual={idPaisActual}
                                        setIdPaisActual={setIdPaisActual}
                                        setLoading={setLoading}
                                    />
                                </TabPanel>
                                <TabPanel value={tabIndex} className={classes.TabPanel} index={1}>
                                    <>
                                        <UbigeoEditPage
                                            titulo={titulo}
                                            modoEdicion={modoEdicion}
                                            dataRowEditNew={dataRowEditNew}
                                            actualizarUbigeo={actualizarUbigeo}
                                            agregarUbigeo={agregarUbigeo}
                                            cancelarEdicion={cancelarEdicion}
                                            paisData={paisData}
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

export default injectIntl(WithLoandingPanel(UbigeoIndexPage));
