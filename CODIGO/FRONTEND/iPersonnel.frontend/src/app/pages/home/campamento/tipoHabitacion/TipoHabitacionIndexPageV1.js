import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";

import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import PropTypes from 'prop-types';
import { isNotEmpty } from "../../../../../_metronic";
import { Portlet } from "../../../../partials/content/Portlet";
import { handleErrorMessages, handleSuccessMessages } from "../../../../store/ducks/notify-messages";
import { useStylesEncabezado, useStylesTab } from "../../../../store/config/Styles";
import CustomBreadcrumbs from "../../../../partials/layout/CustomBreadcrumbs";

import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import MeetingRoomIcon from '@material-ui/icons/MeetingRoom';

import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";

import {
    obtener,
    listar,
    crear,
    actualizar,
    eliminar
} from "../../../../api/campamento/tipoHabitacion.api";
import TipoHabitacionListPage from "./TipoHabitacionListPage";
import TipoHabitacionEditPage from "./TipoHabitacionEditPage";


const TipoHabitacionIndexPage = (props) => {

    const { intl } = props;

    const usuario = useSelector(state => state.auth.user);
    const perfil = useSelector(state => state.perfil.perfilActual);
    const [varIdTipoHabitacion, setVarIdTipoHabitacion] = useState("");
    const [focusedRowKey, setFocusedRowKey] = useState();
    const [tipoHabitacionData, setTipoHabitacionData] = useState([]);

    const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
    const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
    const classesEncabezado = useStylesEncabezado();
    const classes = useStylesTab();

    const [selected, setSelected] = useState({});
    const [modoEdicion, setModoEdicion] = useState(false);
    const [dataRowEditNew, setDataRowEditNew] = useState({});
    const [dataRowEditNewTabs, setDataRowEditNewTabs] = useState({});
    const [tabIndex, setTabIndex] = useState(0);

    const handleChange = (event, newValue) => { setTabIndex(newValue); };


    async function agregarTipoHabitacion(dataRow) {

        const { IdTipoHabitacion, TipoHabitacion, Activo } = dataRow;
        let params = {
            IdCliente: perfil.IdCliente
            , IdDivision: perfil.IdDivision
            , IdTipoHabitacion: IdTipoHabitacion.toUpperCase()
            , TipoHabitacion: TipoHabitacion.toUpperCase()
            , Activo: Activo
            , IdUsuario: usuario.username
        }
        await crear(params).then(response => {
            if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
            setModoEdicion(false);
            listarTipoHabitacion();
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
    }

    async function actualizarTipoHabitacion(dataRow) {

        const { IdTipoHabitacion, TipoHabitacion, Activo } = dataRow;
        let params = {
            IdCliente: perfil.IdCliente
            , IdDivision: perfil.IdDivision
            , IdTipoHabitacion: IdTipoHabitacion.toUpperCase()
            , TipoHabitacion: TipoHabitacion.toUpperCase()
            , Activo: Activo
            , IdUsuario: usuario.username
        }
        await actualizar(params).then(response => {
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
            setModoEdicion(false);
            listarTipoHabitacion();
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
    }


    async function eliminarRegistro(dataRow) {
        const { IdTipoHabitacion } = dataRow;
        await eliminar({
            IdCliente: perfil.IdCliente
            , IdDivision: perfil.IdDivision
            , IdTipoHabitacion: IdTipoHabitacion
        }).then(response => {
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
        listarTipoHabitacion();
    }


    async function listarTipoHabitacion() {
        let TipoHabitacion = await listar(
            {
                IdCliente: perfil.IdCliente
                , IdDivision: perfil.IdDivision
                , NumPagina: 0
                , TamPagina: 0
            }
        );
        setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
        setTipoHabitacionData(TipoHabitacion);
        changeTabIndex(0);
    }

    async function obtenerTipoHabitacion(idTipoHabitacion) {
        if (idTipoHabitacion) {
            let TipoHabitacion = await obtener({
                IdCliente: perfil.IdCliente
                , IdDivision: perfil.IdDivision
                , IdTipoHabitacion: idTipoHabitacion
            });
            setDataRowEditNew({ ...TipoHabitacion, esNuevoRegistro: false });
        }
    }

    const nuevoRegistro = () => {
        changeTabIndex(1);
        let TipoHabitacion = { Activo: "S" };
        setDataRowEditNew({ ...TipoHabitacion, esNuevoRegistro: true });
        setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
        setModoEdicion(true);
        setVarIdTipoHabitacion("");
    };

    const editarRegistro = dataRow => {
        changeTabIndex(1);
        const { IdTipoHabitacion, RowIndex } = dataRow;
        setModoEdicion(true);
        setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
        obtenerTipoHabitacion(IdTipoHabitacion);
        setFocusedRowKey(RowIndex);
    };

    const cancelarEdicion = () => {
        changeTabIndex(0);
        setModoEdicion(false);
        setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
        setDataRowEditNew({});
        setDataRowEditNewTabs({});
        setVarIdTipoHabitacion("");
    };

    const seleccionarRegistro = dataRow => {
        const { IdTipoHabitacion, RowIndex } = dataRow;
        setModoEdicion(true);
        setSelected(dataRow);
        setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
        if (IdTipoHabitacion != varIdTipoHabitacion) {
            setVarIdTipoHabitacion(IdTipoHabitacion);
            obtenerTipoHabitacion(dataRow);
            setFocusedRowKey(RowIndex);
        }
    }


    const changeTabIndex = (index) => {
        handleChange(null, index);
    }


    useEffect(() => {
        listarTipoHabitacion();
    }, []);

    return (
        <>
            <div className="row">
                <div className="col-md-12">
                    <CustomBreadcrumbs Title={intl.formatMessage({ id: "CAMP.BEDTYPE.MENU" })} SubMenu={intl.formatMessage({ id: "CAMP.BEDTYPE.SUBMENU" })} Subtitle={intl.formatMessage({ id: "CAMP.BEDTYPE.SUBTITLE" })} />
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
                                        onClick={listarTipoHabitacion} {...tabPropsIndex(0)}
                                        className={classes.tabContent}
                                    />
                                    <Tab
                                        label={"TIPO HABITACIÓN"}
                                        icon={<MeetingRoomIcon fontSize="large" />}
                                        onClick={(e => obtenerTipoHabitacion(varIdTipoHabitacion))} {...tabPropsIndex(1)}
                                        disabled={isNotEmpty(varIdTipoHabitacion) ? false : true}
                                        className={classes.tabContent}
                                    />
                                </Tabs>
                                <TabPanel value={tabIndex} className={classes.TabPanel} index={0}>
                                    <TipoHabitacionListPage
                                        tipoHabitacionData={tipoHabitacionData}
                                        titulo={titulo}
                                        editarRegistro={editarRegistro}
                                        eliminarRegistro={eliminarRegistro}
                                        nuevoRegistro={nuevoRegistro}
                                        seleccionarRegistro={seleccionarRegistro}
                                        focusedRowKey={focusedRowKey}
                                    />
                                </TabPanel>
                                <TabPanel value={tabIndex} className={classes.TabPanel} index={1}>
                                    <>
                                        <TipoHabitacionEditPage
                                            titulo={titulo}
                                            dataRowEditNew={dataRowEditNew}
                                            actualizarTipoHabitacion={actualizarTipoHabitacion}
                                            agregarTipoHabitacion={agregarTipoHabitacion}
                                            cancelarEdicion={cancelarEdicion}
                                            titulo={titulo}
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

export default injectIntl(TipoHabitacionIndexPage);
