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
import MeetingRoomIcon from '@material-ui/icons/MeetingRoom';

import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";

import {
    obtener, listar, crear, actualizar, eliminar
} from "../../../../api/campamento/tipoHabitacion.api";
import TipoHabitacionListPage from "./TipoHabitacionListPage";
import TipoHabitacionEditPage from "./TipoHabitacionEditPage";
import { getButtonPermissions, defaultPermissions } from '../../../../../_metronic/utils/securityUtils'
// import Confirm from "../../../../partials/components/Confirm";


const TipoHabitacionIndexPage = (props) => {
    const { intl, setLoading, dataMenu } = props;
    const usuario = useSelector(state => state.auth.user);
    const perfil = useSelector(state => state.perfil.perfilActual);
    const classesEncabezado = useStylesEncabezado();
    const classes = useStylesTab();

    const [tipoHabitacionData, setTipoHabitacionData] = useState([]);
    const [varIdTipoHabitacion, setVarIdTipoHabitacion] = useState("");
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

    const [modoEdicionReporte, setModoEdicionReporte] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const [expandRow, setExpandRow] = useState(0);
    /*********************************************************** */
    const [accessButton, setAccessButton] = useState(defaultPermissions);

    const loadControlsPermission = () => {
        let buttonsPermissions = getButtonPermissions(dataMenu.objetos);
        setAccessButton({ ...accessButton, ...buttonsPermissions });
    }
    /*********************************************************** */

    async function agregarTipoHabitacion(tipoHabitacion) {
        setLoading(true);
        const { IdCliente, IdDivision, IdTipoHabitacion, TipoHabitacion, Activo } = tipoHabitacion;
        let params = {
            IdCliente
            , IdDivision
            , IdTipoHabitacion: isNotEmpty(IdTipoHabitacion) ? IdTipoHabitacion.toUpperCase() : ""
            , TipoHabitacion: isNotEmpty(TipoHabitacion) ? TipoHabitacion.toUpperCase() : ""
            , Activo: Activo
            , IdUsuario: usuario.username
        }
        await crear(params).then(response => {
            if (response)
                handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
            //setModoEdicion(false);
            listarTipoHabitacion();
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
    }


    async function actualizarTipoHabitacion(dataRow) {
        setLoading(true);
        const { IdTipoHabitacion, TipoHabitacion, Activo } = dataRow;
        let params = {
            IdCliente: perfil.IdCliente
            , IdDivision: perfil.IdDivision
            , IdTipoHabitacion: isNotEmpty(IdTipoHabitacion) ? IdTipoHabitacion.toUpperCase() : ""
            , TipoHabitacion: isNotEmpty(TipoHabitacion) ? TipoHabitacion.toUpperCase() : ""
            , Activo: Activo
            , IdUsuario: usuario.username
        }
        await actualizar(params).then(response => {
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
            //setModoEdicion(false);
            listarTipoHabitacion();
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
    }


    async function eliminarRegistro(dataRow, confirm) {
      console.log("eliminarRegistro|dataRow|confirm",dataRow,confirm);
        setSelected(dataRow);
        setIsVisible(true);
        if (confirm) {
            setLoading(true);
            const { IdCliente, IdDivision, IdTipoHabitacion } = dataRow;
            await eliminar({
                IdCliente
                , IdDivision
                , IdTipoHabitacion
            }).then(() => {
                handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
            }).catch(err => {
                handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
            }).finally(() => { setLoading(false); });
            listarTipoHabitacion();
        }
    }


    async function listarTipoHabitacion() {
        setLoading(true);
        const { IdCliente, IdDivision } = selected;
        await listar(
            {
                IdCliente
                , IdDivision
                , NumPagina: 0
                , TamPagina: 0
            }).then(TipoHabitacion => {
                setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
                setTipoHabitacionData(TipoHabitacion);
                changeTabIndex(0);
                setModoEdicion(false);
            }).catch(err => {
                handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
            }).finally(() => { setLoading(false); });
    }


    async function obtenerTipoHabitacion(tipoHabitacion) {
      setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
        setLoading(true);
        const { IdCliente, IdDivision, IdTipoHabitacion } = tipoHabitacion;
        await obtener({
            IdCliente: IdCliente
            , IdDivision: IdDivision
            , IdTipoHabitacion: IdTipoHabitacion
        }).then(tipoHabitacion => {
            setDataRowEditNew({ ...tipoHabitacion, esNuevoRegistro: false });
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
    }



    const nuevoRegistro = () => {
        changeTabIndex(1);
        const { IdCliente, IdDivision } = selected;
        let TipoHabitacion = { Activo: "S", IdCliente, IdDivision };
        setDataRowEditNew({ ...TipoHabitacion, esNuevoRegistro: true });
        setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
        setModoEdicion(true);
    };


    const editarRegistro = async (dataRow) => {
        changeTabIndex(1);
        const { IdTipoHabitacion, RowIndex } = dataRow;
        setModoEdicion(true);
        obtenerTipoHabitacion(dataRow);
        setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
        setFocusedRowKey(RowIndex);
    };


    const cancelarEdicion = () => {
        //console.log("cancelarEdicion")
        changeTabIndex(0);
        setModoEdicion(false);
        setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
        //setDataRowEditNew({});
    };


    const seleccionarRegistro = dataRow => {
        localStorage.setItem('dataRowReporte', JSON.stringify(dataRow));
        const { IdTipoHabitacion, RowIndex } = dataRow;
        /* setSelected(dataRow);
        setModoEdicion(false);
        setTitulo(intl.formatMessage({ id: "ACTION.VIEW" })); */
        if (IdTipoHabitacion != varIdTipoHabitacion) {
            setVarIdTipoHabitacion(IdTipoHabitacion);
            setFocusedRowKey(RowIndex);

            setExpandRow(RowIndex);
            setCollapsed(false);
            setSelected(dataRow);
        }
    }

    const verRegistroHabitacionDblClick = async (dataRow) => {
        changeTabIndex(1);
        setModoEdicion(false);
        await obtenerTipoHabitacion(dataRow);
    };


    const changeTabIndex = (index) => {
        handleChange(null, index);
    }

    const seleccionarReporte = async (dataRow) => {

    }

    async function eliminarListRowTab(selected, confirm) {
        let currentTab = tabIndex;
        switch (currentTab) {
            case 0://tab listar
                eliminarRegistro(selected, confirm);
                break;
        }
    }


    useEffect(() => {
        listarTipoHabitacion();
        loadControlsPermission();
    }, []);

    return (
        <>
            <div className="row">
                <div className="col-md-12">
                    <CustomBreadcrumbs
                        Title={intl.formatMessage({ id: "CAMP.ROOMTYPE.MENU" })}
                        SubMenu={intl.formatMessage({ id: "CAMP.ROOMTYPE.SUBMENU" })}
                        Subtitle={intl.formatMessage({ id: "CAMP.ROOMTYPE.MAINTENANCE" })} />
                    <Portlet className={classesEncabezado.border}>
                        <AppBar position="static" className={classesEncabezado.principal}>
                            <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                                <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                                    {intl.formatMessage({ id: "CAMP.ROOMTYPE.MAINTENANCE" })}

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
                                        onClick={listarTipoHabitacion} 
                                        {...tabPropsIndex(0)}
                                        className={classes.tabContent}
                                    />
                                    <Tab
                                        label={intl.formatMessage({ id: "CAMP.ROOMTYPE" })}
                                        icon={<MeetingRoomIcon fontSize="large" />}
                                        onClick={(e => obtenerTipoHabitacion(selected))} {...tabPropsIndex(1)}
                                        disabled={isNotEmpty(varIdTipoHabitacion) ? false : true}
                                        className={classes.tabContent}
                                    />
                                </Tabs>
                                <TabPanel value={tabIndex} className={classes.TabPanel} index={0}>
                                    {!modoEdicion && !modoEdicionReporte && (
                                        <>
                                            <TipoHabitacionListPage
                                                tipoHabitacionData={tipoHabitacionData}
                                                titulo={titulo}
                                                editarRegistro={editarRegistro}
                                                eliminarRegistro={eliminarRegistro}
                                                nuevoRegistro={nuevoRegistro}
                                                seleccionarRegistro={seleccionarRegistro}
                                                focusedRowKey={focusedRowKey}
                                                //verRegistroDblClick={verRegistroHabitacionDblClick}
                                                accessButton={accessButton}

                                                seleccionarReporte={seleccionarReporte}
                                                expandRow={{ expandRow, setExpandRow }}
                                                collapsedRow={{ collapsed, setCollapsed }}
                                            />
                                        </>
                                    )}
                                </TabPanel>
                                <TabPanel value={tabIndex} className={classes.TabPanel} index={1}>
                                    <>
                                        <TipoHabitacionEditPage
                                            titulo={titulo}
                                            modoEdicion={modoEdicion}
                                            dataRowEditNew={dataRowEditNew}
                                            actualizarTipoHabitacion={actualizarTipoHabitacion}
                                            agregarTipoHabitacion={agregarTipoHabitacion}
                                            cancelarEdicion={cancelarEdicion}
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
                onConfirm={() => eliminarListRowTab(selected, true)}
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

export default injectIntl(WithLoandingPanel(TipoHabitacionIndexPage));
