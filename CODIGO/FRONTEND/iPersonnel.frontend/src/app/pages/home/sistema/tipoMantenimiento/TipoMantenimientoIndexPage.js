import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";

import PropTypes from 'prop-types';
import { isNotEmpty } from "../../../../../_metronic";
import { getButtonPermissions, defaultPermissions } from '../../../../../_metronic/utils/securityUtils'
import { Portlet } from "../../../../partials/content/Portlet";
import { handleErrorMessages, handleSuccessMessages } from "../../../../store/ducks/notify-messages";
import { useStylesEncabezado, useStylesTab } from "../../../../store/config/Styles";
import CustomBreadcrumbs from "../../../../partials/layout/CustomBreadcrumbs";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import Confirm from "../../../../partials/components/Confirm";

import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import TableChartIcon from '@material-ui/icons/TableChart';

import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";

import {
    obtener, listar, crear, actualizar, eliminar
} from "../../../../api/sistema/tipomantenimiento.api";
import TipoMantenimientoListPage from "./TipoMantenimientoListPage";
import TipoMantenimientoEditPage from "./TipoMantenimientoEditPage";



const TipoMantenimientoIndexPage = (props) => {
    const { intl, setLoading , dataMenu} = props;
    const usuario = useSelector(state => state.auth.user);
    const perfil = useSelector(state => state.perfil.perfilActual);
    const classesEncabezado = useStylesEncabezado();
    const classes = useStylesTab();

    const [tiposMantenimiento, setTiposMantenimiento] = useState([]);
    const [varIdTipoMantenimiento, setVarIdTipoMantenimiento] = useState("");
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


    async function agregarTipoMantenimiento(tipoMantenimiento) {
        setLoading(true);
        const { IdCliente, IdTipoMantenimiento, TipoMantenimiento, Activo } = tipoMantenimiento;
        let params = {
            IdTipoMantenimiento: isNotEmpty(IdTipoMantenimiento) ? IdTipoMantenimiento.toUpperCase() : ""
            , TipoMantenimiento: isNotEmpty(TipoMantenimiento) ? TipoMantenimiento.toUpperCase() : ""
            , IdCliente
            , Activo: Activo
            , IdUsuario: usuario.username
        };
        await crear(params).then(response => {
            if (response)
                handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
            setModoEdicion(false);
            listarTipoMantenimiento();
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        }).finally(() => { setLoading(false); });
    }

    async function actualizarTipoMantenimiento(tipoMantenimiento) {
        setLoading(true);
        const { IdCliente, IdTipoMantenimiento, TipoMantenimiento, Activo } = tipoMantenimiento;
        let params = {
            IdTipoMantenimiento: isNotEmpty(IdTipoMantenimiento) ? IdTipoMantenimiento.toUpperCase() : ""
            , TipoMantenimiento: isNotEmpty(TipoMantenimiento) ? TipoMantenimiento.toUpperCase() : ""
            , IdCliente
            , Activo: Activo
            , IdUsuario: usuario.username
        };
        await actualizar(params).then(response => {
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
            setModoEdicion(false);
            listarTipoMantenimiento();
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        }).finally(() => { setLoading(false); });
    }

    async function eliminarTipoMantenimiento(tipoMantenimiento, confirm) {            
    setSelected(tipoMantenimiento);
    setIsVisible(true);
    if (confirm) {
        setLoading(true);
        const { IdCliente, IdTipoMantenimiento } = tipoMantenimiento;
        await eliminar({
            IdCliente,
            IdTipoMantenimiento,
            IdUsuario: usuario.username
        }).then(response => {
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        }).finally(() => { setLoading(false); });
        listarTipoMantenimiento();
    }
    }

    async function listarTipoMantenimiento() {
        setLoading(true);
        const { IdCliente } = selected;
        await listar().then(lisTipoMantenimiento => {
            setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
            setTiposMantenimiento(lisTipoMantenimiento);
            changeTabIndex(0);
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        }).finally(() => { setLoading(false); });
    }


    async function obtenerTipoMantenimiento() {
        setLoading(true);
        const { IdCliente, IdTipoMantenimiento } = selected;
        await obtener({
            IdCliente,
            IdTipoMantenimiento
        }).then(tipoMantenimiento => {
            setDataRowEditNew({ ...tipoMantenimiento, esNuevoRegistro: false });
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        }).finally(() => { setLoading(false); });
    }

    const nuevoRegistro = () => {
        changeTabIndex(1);
        const { IdCliente } = selected;
        let tipoMantenimiento = { Activo: "S", IdCliente };
        setDataRowEditNew({ ...tipoMantenimiento, esNuevoRegistro: true });
        setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
        setModoEdicion(true);
    };

    const editarRegistro = dataRow => {
        changeTabIndex(1);
        const { IdTipoMantenimiento, RowIndex } = dataRow;
        setModoEdicion(true);
        setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
        obtenerTipoMantenimiento(IdTipoMantenimiento);
        setFocusedRowKey(RowIndex);
    };

    const cancelarEdicion = () => {
        changeTabIndex(0);
        setModoEdicion(false);
        setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
        setDataRowEditNew({});
    };

    const seleccionarRegistro = dataRow => {
        const { IdTipoMantenimiento, RowIndex } = dataRow;
        setModoEdicion(false);
        setSelected(dataRow);
        setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
        if (IdTipoMantenimiento != varIdTipoMantenimiento) {
            setVarIdTipoMantenimiento(IdTipoMantenimiento);
            setFocusedRowKey(RowIndex);
        }
    }

    const verRegistroDblClick = async (dataRow) => {
        changeTabIndex(1);
        setModoEdicion(false);
        await obtenerTipoMantenimiento(dataRow.IdTipoMantenimiento);
    };

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
        listarTipoMantenimiento();
        loadControlsPermission();
    }, []);

    return (
        <>
            <div className="row">
                <div className="col-md-12">
                    <CustomBreadcrumbs
                        Title={intl.formatMessage({ id: "SYSTEM.MAINTENANCETYPE.MENU" })}
                        SubMenu={intl.formatMessage({ id: "SYSTEM.MAINTENANCETYPE.SUBMENU" })}
                        Subtitle={intl.formatMessage({ id: "SYSTEM.MAINTENANCETYPE.MAINTENANCE" })}
                    />
                    <Portlet className={classesEncabezado.border}>
                        <AppBar position="static" className={classesEncabezado.principal}>
                            <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                                <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                                    {intl.formatMessage({ id: "SYSTEM.MAINTENANCETYPE.MAINTENANCE" })}
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
                                        //onClick={listarTipoMantenimiento} 
                                        {...tabPropsIndex(0)}
                                        className={classes.tabContent}
                                    />
                                    <Tab
                                        label={intl.formatMessage({ id: "SYSTEM.MAINTENANCETYPE.TAB" })}
                                        icon={<TableChartIcon fontSize="large" />}
                                        onClick={(e => obtenerTipoMantenimiento(varIdTipoMantenimiento))} {...tabPropsIndex(1)}
                                        disabled={isNotEmpty(varIdTipoMantenimiento) ? false : true}
                                        className={classes.tabContent}
                                    />
                                </Tabs>
                                <TabPanel value={tabIndex} className={classes.TabPanel} index={0}>
                                    <TipoMantenimientoListPage
                                        lisTipoMantenimiento={tiposMantenimiento}
                                        editarRegistro={editarRegistro}
                                        eliminarRegistro={eliminarTipoMantenimiento}
                                        nuevoRegistro={nuevoRegistro}
                                        seleccionarRegistro={seleccionarRegistro}
                                        verRegistroDblClick={verRegistroDblClick}
                                        focusedRowKey={focusedRowKey}
                                        accessButton={accessButton}
                                    />
                                </TabPanel>
                                <TabPanel value={tabIndex} className={classes.TabPanel} index={1}>
                                    <>
                                        <TipoMantenimientoEditPage
                                            modoEdicion={modoEdicion}
                                            dataRowEditNew={dataRowEditNew}
                                            actualizarTipoMantenimiento={actualizarTipoMantenimiento}
                                            agregarTipoMantenimiento={agregarTipoMantenimiento}
                                            cancelarEdicion={cancelarEdicion}
                                            titulo={titulo}
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
                onConfirm={() => eliminarTipoMantenimiento(selected, true)}
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

export default injectIntl(WithLoandingPanel(TipoMantenimientoIndexPage));
