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

import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import PowerIcon from '@material-ui/icons/Power';

import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";
import { getButtonPermissions, defaultPermissions } from '../../../../../_metronic/utils/securityUtils'

import {
    obtener, listar, crear, actualizar, eliminar
} from "../../../../api/campamento/servicio.api";
import ServicioListPage from "./ServicioListPage";
import ServicioEditPage from "./ServicioEditPage";

 

const ServicioIndexPage = (props) => {
    const { intl, setLoading, dataMenu } = props;
    const usuario = useSelector(state => state.auth.user);
    const perfil = useSelector(state => state.perfil.perfilActual);
    const classesEncabezado = useStylesEncabezado();
    const classes = useStylesTab();

    const [varIdServicio, setVarIdServicio] = useState("");
    const [servicios, setServicios] = useState([]);
    const [focusedRowKey, setFocusedRowKey] = useState(0);

    const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
    const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
    const [dataRowEditNew, setDataRowEditNew] = useState({});
    const [modoEdicion, setModoEdicion] = useState(false);
    const [selected, setSelected] = useState({
        IdCliente: perfil.IdCliente,
        IdDivision: perfil.IdDivision
    });
    const [tabIndex, setTabIndex] = useState(0);
    const handleChange = (event, newValue) => { setTabIndex(newValue); };

    const [isVisible, setIsVisible] = useState(false);
    const [instance, setInstance] = useState({});


    async function agregarServicio(dataRow) {
        setLoading(true);    
        const { IdServicio, Servicio, Activo } = dataRow;
        let params = {
            IdCliente: perfil.IdCliente
            , IdDivision: perfil.IdDivision
            , IdServicio: isNotEmpty(IdServicio) ? IdServicio.toUpperCase() : ""
            , Servicio: isNotEmpty(Servicio) ? Servicio.toUpperCase() : ""
            , Activo: Activo
            , IdUsuario: usuario.username
        }
        await crear(params).then(response => {
            if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
            setModoEdicion(false);
            listarServicio();
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        }).finally(() => { setLoading(false); });
    }


    async function actualizarServicio(dataRow) {
        setLoading(true);    
        const { IdServicio, Servicio, Activo } = dataRow;
        let params = {
            IdCliente: perfil.IdCliente
            , IdDivision: perfil.IdDivision
            , IdServicio: isNotEmpty(IdServicio) ? IdServicio.toUpperCase() : ""
            , Servicio: isNotEmpty(Servicio) ? Servicio.toUpperCase() : ""
            , Activo: Activo
            , IdUsuario: usuario.username
        }
        await actualizar(params).then(response => {
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
            setModoEdicion(false);
            listarServicio();
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        }).finally(() => { setLoading(false); });
    }


    async function eliminarRegistro(dataRow, confirm) {
        setSelected(dataRow);
        setIsVisible(true);

        if (confirm) {
        setLoading(true);    
        const { IdServicio } = dataRow;
        await eliminar({
            IdCliente: perfil.IdCliente
            , IdDivision: perfil.IdDivision
            , IdServicio: IdServicio
        }).then(response => {
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        }).finally(() => { setLoading(false); });
        listarServicio();
    }
}


    async function listarServicio() {
        setLoading(true);   
        const { IdCliente, IdDivision } = selected; 
        await listar(
            {
                IdCliente
                , IdDivision
                , NumPagina: 0
                , TamPagina: 0
            }).then(Servicio => {
        setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
        setServicios(Servicio);
        changeTabIndex(0);
    }).catch(err => {
        handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
    }).finally(() => { setLoading(false); });
    }

    async function obtenerServicio(Servicio) {
        setLoading(true);  
        const { IdServicio } = Servicio;  
        await obtener({
                IdCliente: perfil.IdCliente
                , IdDivision: perfil.IdDivision
                , IdServicio: IdServicio
            }).then(Servicio => {
            setDataRowEditNew({ ...Servicio, esNuevoRegistro: false });
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        }).finally(() => { setLoading(false); });
    }


    const nuevoRegistro = () => {
        changeTabIndex(1);
        const { IdCliente, IdDivision } = selected;
        let Servicio = { Activo: "S", IdCliente, IdDivision };
        setDataRowEditNew({ ...Servicio, esNuevoRegistro: true });
        setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
        setModoEdicion(true);
    };


    const editarRegistro = dataRow => {
        changeTabIndex(1);
        const { RowIndex } = dataRow;
        setModoEdicion(true);
        setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
        obtenerServicio(dataRow);
        setFocusedRowKey(RowIndex);
    };


    const cancelarEdicion = () => {
        changeTabIndex(0);
        setModoEdicion(false);
        setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
        //setDataRowEditNew({});
    };



    const seleccionarRegistro = dataRow => {
        const { IdServicio, RowIndex } = dataRow;
        setModoEdicion(false);
        setSelected(dataRow);
        setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
        if (IdServicio != varIdServicio) {
            setVarIdServicio(IdServicio);
            setFocusedRowKey(RowIndex);
        }
    }


    const verRegistroServicioDblClick = async (dataRow) => {
        changeTabIndex(1);
        setModoEdicion(false);
        await obtenerServicio(dataRow);
    };

    /*Configuración de acceso de botones*/
    const [accessButton, setAccessButton] = useState(defaultPermissions);

    const loadControlsPermission = () => {
        let buttonsPermissions = getButtonPermissions(dataMenu.objetos);
        setAccessButton({ ...accessButton, ...buttonsPermissions });
    }


    const changeTabIndex = (index) => {
        handleChange(null, index);
    }

    useEffect(() => {
        listarServicio();
        loadControlsPermission();
    }, []);




    return (
        <>
            <div className="row">
                <div className="col-md-12">
                    <CustomBreadcrumbs
                        Title={intl.formatMessage({ id: "CAMP.CAMPSERVICE.MENU" })}
                        SubMenu={intl.formatMessage({ id: "CAMP.CAMPSERVICE.SUBMENU" })}
                        Subtitle={intl.formatMessage({ id: "CAMP.CAMPSERVICE" })} />
                    <Portlet className={classesEncabezado.border}>
                        <AppBar position="static" className={classesEncabezado.principal}>
                            <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                                <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                                    {intl.formatMessage({ id: "CAMP.CAMPSERVICE" })}
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
                                        label={intl.formatMessage({ id: "CAMP.CAMPSERVICE.SERVICE" })}
                                        icon={<PowerIcon fontSize="large" />}
                                        onClick={(e => obtenerServicio(selected))} {...tabPropsIndex(1)}
                                        disabled={isNotEmpty(varIdServicio) ? false : true}
                                        className={classes.tabContent}
                                    />
                                </Tabs>
                                <TabPanel value={tabIndex} className={classes.TabPanel} index={0}>
                                    <ServicioListPage
                                        titulo={titulo}
                                        servicios={servicios}
                                        editarRegistro={editarRegistro}
                                        eliminarRegistro={eliminarRegistro}
                                        nuevoRegistro={nuevoRegistro}
                                        seleccionarRegistro={seleccionarRegistro}
                                        focusedRowKey={focusedRowKey}
                                        verRegistroDblClick={verRegistroServicioDblClick}
                                        accessButton={accessButton}
                                    />
                                </TabPanel>
                                <TabPanel value={tabIndex} className={classes.TabPanel} index={1}>
                                    <>
                                        <ServicioEditPage
                                            titulo={titulo}
                                            modoEdicion={modoEdicion}
                                            dataRowEditNew={dataRowEditNew}
                                            actualizarServicio={actualizarServicio}
                                            agregarServicio={agregarServicio}
                                            cancelarEdicion={cancelarEdicion}
                                            settingDataField={dataMenu.datos}
                                            accessButton={accessButton}
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
export default injectIntl(WithLoandingPanel(ServicioIndexPage));
