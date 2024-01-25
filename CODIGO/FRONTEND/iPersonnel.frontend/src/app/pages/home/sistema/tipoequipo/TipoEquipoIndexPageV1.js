import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { Portlet } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { handleErrorMessages, handleSuccessMessages } from "../../../../store/ducks/notify-messages";
import { useStylesEncabezado, useStylesTab } from "../../../../store/config/Styles";
import CustomBreadcrumbs from "../../../../partials/layout/CustomBreadcrumbs";

import { useSelector } from "react-redux";
import { isNotEmpty } from "../../../../../_metronic";
import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";

import { obtener, listar, crear, actualizar, eliminar, } from "../../../../api/sistema/tipoequipo.api";
import {
    eliminar as eliminarTipoEqModelo
    , obtener as obtenerTipoEqModelo
    , listar as listarTipoEqModelo
    , crear as crearTipoEqModelo
    , actualizar as actualizarTipoEqModelo
} from "../../../../api/sistema/tipoequipoModelo.api";

import TipoEquipoListPage from "./TipoEquipoListPage";
import TipoEquipoEditPage from "./TipoEquipoEditPage";
import TipoEquipoModeloListPage from "./TipoEquipoModeloListPage";
import TipoEquipoModeloEditPage from "./TipoEquipoModeloEditPage";

import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import PropTypes from 'prop-types';

import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import PhonelinkSetupIcon from '@material-ui/icons/PhonelinkSetup';
import FileCopyIcon from '@material-ui/icons/FileCopy';

//import HeaderInformation from "../../../../partials/components/HeaderInformation";


const TipoEquipoIndexPage = ({ intl }) => {
    const usuario = useSelector(state => state.auth.user);

    const [varIdTipoEquipo, setVarIdTipoEquipo] = useState("");
    const [focusedRowKey, setFocusedRowKey] = useState();
    const [tipoEquipos, setTipoEquipos] = useState([]);

    //Datos principales
    const [selected, setSelected] = useState({});

    const [dataRowEditNew, setDataRowEditNew] = useState({});
    const [modoEdicion, setModoEdicion] = useState(false);
    const [titulo, setTitulo] = useState("");
    const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);

    const [modoEdicionTabs, setModoEdicionTabs] = useState(false);
    const [dataRowEditNewTabs, setDataRowEditNewTabs] = useState({});
    const [tituloTabs, setTituloTabs] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
    const [listarTabs, setListarTabs] = useState([]);

    const classesEncabezado = useStylesEncabezado();
    const classes = useStylesTab();
    const [tabIndex, setTabIndex] = useState(0);

    const [collapsed, setCollapsed] = useState(false);
    const [expandRow, setExpandRow] = useState(0);

    const handleChange = (event, newValue) => {
        //Estado cambio de tabs
        setTabIndex(newValue);
    };


    //::::::::::::::::::::::::::::FUNCIONES PARA GESTIÓN TIPO EQUIPO-:::::::::::::::::::::::::::::::::::

    async function agregarTipoEquipo(tipoEquipo) {
        const { IdTipoEquipo, IdTipoEquipoHijo, TipoEquipo, Observacion, EquipoFijo, Activo } = tipoEquipo;
        let params = {
            IdTipoEquipo: IdTipoEquipo.toUpperCase()
            , IdTipoEquipoHijo: isNotEmpty(IdTipoEquipoHijo) ? IdTipoEquipoHijo.toUpperCase() : ""
            , TipoEquipo: isNotEmpty(TipoEquipo) ? TipoEquipo.toUpperCase() : ""
            , Observacion: isNotEmpty(Observacion) ? Observacion.toUpperCase() : ""
            , EquipoFijo: isNotEmpty(EquipoFijo) ? EquipoFijo : ""
            , Activo
            , IdUsuario: usuario.username
        }
        await crear(params).then(response => {
            if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
            setModoEdicion(false);
            listarTipoEquipos();
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
    }


    async function actualizarTipoEquipo(tipoEquipo) {
        const { IdTipoEquipo, IdTipoEquipoHijo, TipoEquipo, Observacion, EquipoFijo, Activo, messageDelete } = tipoEquipo;
        let params = {
            IdTipoEquipo: isNotEmpty(IdTipoEquipo) ? IdTipoEquipo.toUpperCase() : ""
            , IdTipoEquipoHijo: isNotEmpty(IdTipoEquipoHijo) ? IdTipoEquipoHijo.toUpperCase() : ""
            , TipoEquipo: isNotEmpty(TipoEquipo) ? TipoEquipo.toUpperCase() : ""
            , Observacion: isNotEmpty(Observacion) ? Observacion.toUpperCase() : ""
            , EquipoFijo: isNotEmpty(EquipoFijo) ? EquipoFijo : ""
            , Activo
            , IdUsuario: usuario.username
        }
        await actualizar(params).then(response => {
            if (isNotEmpty(messageDelete)) {
                handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
            } else {
                handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
            }
            setModoEdicion(false);
            listarTipoEquipos();
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
    }

    async function eliminarRegistro(tipoEquipo) {
        const { IdTipoEquipo } = tipoEquipo;
        await eliminar({
            IdTipoEquipo,
            IdUsuario: usuario.username
        }).then(response => {
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
        listarTipoEquipos();
    }


    async function listarTipoEquipos() {
        let tipoEquipos = await listar(
            {
                IdTipoEquipo: "%"
                , TipoEquipo: "%"
                , NumPagina: 0
                , TamPagina: 0
            }
        ).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
        setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
        setTipoEquipos(tipoEquipos);
        changeTabIndex(0);
    }


    async function obtenerTipoEquipo(filtro) {
        const { IdTipoEquipo } = selected;
        if (IdTipoEquipo) {
            let tipoEquipo = await obtener({
                IdTipoEquipo
            });
            setDataRowEditNew({ ...tipoEquipo, esNuevoRegistro: false, asignarHijo: false });
        }
    }

    const nuevoRegistro = (dataRow) => {
        changeTabIndex(1);
        const { IdTipoEquipo, IdTipoEquipoHijo, TipoEquipo, Observacion, EquipoFijo, Activo } = dataRow;
        let tipoEquipo = {};
        if (isNotEmpty(IdTipoEquipo)) {
            //Actualizar-Hijo
            setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
            tipoEquipo = { IdTipoEquipo, IdTipoEquipoHijo, TipoEquipo, Observacion, EquipoFijo, Activo, esNuevoRegistro: false, asignarHijo: true };
        } else {
            setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
            //setVarIdTipoEquipo("");
            tipoEquipo = { Activo: "S", IdTipoEquipoHijo: "", esNuevoRegistro: true, asignarHijo: false };
        }
        setDataRowEditNew({ ...tipoEquipo });
        setModoEdicion(true);

    };


    const editarRegistro = async (dataRow) => {
        changeTabIndex(1);
        const { IdTipoEquipo } = dataRow;
        setModoEdicion(true);
        setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
        setVarIdTipoEquipo(IdTipoEquipo);
        await obtenerTipoEquipo(dataRow);
    };


    const cancelarEdicion = () => {
        changeTabIndex(0);
        setModoEdicion(false);
        setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
        setDataRowEditNew({});
        setDataRowEditNewTabs({});
        //setVarIdTipoEquipo("");
    };


    const seleccionarRegistro = async (dataRow) => {

        //const { RowIndex } = dataRow;
        const { IdTipoEquipo, RowIndex } = dataRow;
        console.log("seleccionarRegistro", dataRow);
        //Datos Principales       
        setModoEdicion(false);
        if (IdTipoEquipo != varIdTipoEquipo) {
            setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
            setVarIdTipoEquipo(IdTipoEquipo);
            //await obtenerTipoEquipo(dataRow);

            setFocusedRowKey(RowIndex);
            setSelected(dataRow);

            setExpandRow(RowIndex);
            setCollapsed(false);
        }
    };

    const verRegistroDblClick = async (dataRow) => {
        changeTabIndex(1);
        setModoEdicion(false);
        await obtenerTipoEquipo(dataRow.IdTipoEquipo);
    };


    useEffect(() => {
        listarTipoEquipos();

    }, []);


    //::::::::::::::::::::::FUNCION TIPO EQUIPO MODELO:::::::::::::::::::::::::::::::::::::::::::::::::

    async function agregarTipoEquipoModelo(tipoEquipoModelo) {
        const { IdTipoEquipo, IdModelo, Modelo, Observacion, Foto, Activo } = tipoEquipoModelo;
        let params = {
            IdTipoEquipo
            , IdModelo: isNotEmpty(IdModelo) ? IdModelo.toUpperCase() : ""
            , Modelo: isNotEmpty(Modelo) ? Modelo.toUpperCase() : ""
            , Observacion: isNotEmpty(Observacion) ? Observacion.toUpperCase() : ""
            , Foto: isNotEmpty(Foto) ? Foto : ""
            , Activo
            , IdUsuario: usuario.username
        };
        await crearTipoEqModelo(params).then(response => {
            if (response)
                handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
            listarTipoEquipoModelo();
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
    }


    async function actualizarTipoEquipoModelo(tipoequipoModelo) {
        const { IdTipoEquipo, IdModelo, Modelo, Observacion, Foto, Activo } = tipoequipoModelo;
        let params = {
            IdTipoEquipo
            , IdModelo: isNotEmpty(IdModelo) ? IdModelo.toUpperCase() : ""
            , Modelo: isNotEmpty(Modelo) ? Modelo.toUpperCase() : ""
            , Observacion: isNotEmpty(Observacion) ? Observacion.toUpperCase() : ""
            , Foto: isNotEmpty(Foto) ? Foto : ""
            , Activo
            , IdUsuario: usuario.username
        };
        await actualizarTipoEqModelo(params).then(() => {
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
            listarTipoEquipoModelo();
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
    }


    async function eliminarRegistroTipoEquipoModelo(tipoequipoModelo) {
        const { IdTipoEquipo, IdModelo } = tipoequipoModelo;
        await eliminarTipoEqModelo({ IdTipoEquipo, IdModelo, IdUsuario: usuario.username }).then(response => {
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
        listarTipoEquipoModelo();
    }


    async function listarTipoEquipoModelo() {
        setModoEdicionTabs(false);
        let tipoequipoModelos = await listarTipoEqModelo({ IdTipoEquipo: varIdTipoEquipo, NumPagina: 0, TamPagina: 0 }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
        setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));

        setListarTabs(tipoequipoModelos);
    }


    async function obtenerTipoEquipoModelo(filtro) {
        const { IdTipoEquipo, IdModelo } = filtro;
        if (IdTipoEquipo) {
            let tipoequipoModelo = await obtenerTipoEqModelo({ IdTipoEquipo, IdModelo }).catch(err => {
                handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
            });
            setDataRowEditNewTabs({ ...tipoequipoModelo, esNuevoRegistro: false });
        }
    }


    const editarRegistroTipoEquipoModelo = dataRow => {
        setModoEdicionTabs(true);
        setTituloTabs(intl.formatMessage({ id: "ACTION.EDIT" }));
        obtenerTipoEquipoModelo(dataRow);
    };


    const nuevoRegistroTabs = () => {
        let nuevo = { Activo: "S", IdTipoEquipo: varIdTipoEquipo };
        setDataRowEditNewTabs({ ...nuevo, esNuevoRegistro: true });
        setTituloTabs(intl.formatMessage({ id: "ACTION.NEW" }));
        setModoEdicionTabs(true);
    };


    const cancelarEdicionTabs = () => {
        setModoEdicionTabs(false);
        setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
        setDataRowEditNewTabs({});
    };


    //Datos Principales
    const changeTabIndex = (index) => {
        handleChange(null, index);
    }


    const getInfo = () => {
        const { IdTipoEquipo, TipoEquipo } = selected;
        return [
            { text: [intl.formatMessage({ id: "COMMON.CODE" })], value: IdTipoEquipo, colSpan: 2 },
            { text: [intl.formatMessage({ id: "SYSTEM.TEAM.TEAMTYPE" })], value: TipoEquipo, colSpan: 4 }
        ];

    }

    //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

    return (
        <>
            <div className="row">
                <div className="col-md-12">
                    <CustomBreadcrumbs Title={intl.formatMessage({ id: "SYSTEM" }) + " / " + intl.formatMessage({ id: "SYSTEM.TYPE.DEVICE.CONFIGURATION" })} Subtitle={intl.formatMessage({ id: "SYSTEM.TYPE.DEVICE.MAINTENANCE" })} />

                    <Portlet className={classesEncabezado.border}>
                        <AppBar position="static" className={classesEncabezado.principal}>
                            <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                                <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                                    {intl.formatMessage({ id: "SYSTEM.TYPE.DEVICE.MAINTENANCE" }).toUpperCase()}
                                </Typography>
                            </Toolbar>
                        </AppBar>
                        {/*<HeaderInformation data={getInfo()} visible={[2].includes(tabIndex)} />*/}
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
                                        //onClick={listarTipoEquipos}
                                        {...tabPropsIndex(0)}
                                        className={classes.tabContent} />
                                    <Tab
                                        label={intl.formatMessage({ id: "SYSTEM.TEAM.TEAMTYPE" })}
                                        icon={<PhonelinkSetupIcon fontSize="large" />}
                                        onClick={(e => obtenerTipoEquipo(varIdTipoEquipo))} {...tabPropsIndex(1)}
                                        disabled={isNotEmpty(varIdTipoEquipo) ? false : true}
                                        className={classes.tabContent} />
                                    <Tab
                                        label={intl.formatMessage({ id: "SYSTEM.TEAM.MODEL" })}
                                        icon={<FileCopyIcon fontSize="large" />}
                                        onClick={listarTipoEquipoModelo} {...tabPropsIndex(2)}
                                        disabled={isNotEmpty(varIdTipoEquipo) ? false : true}
                                        className={classes.tabContent} />
                                </Tabs>
                                <TabPanel value={tabIndex} className={classes.TabPanel} index={0}>
                                    <TipoEquipoListPage
                                        tipoEquipos={tipoEquipos}
                                        titulo={titulo}
                                        editarRegistro={editarRegistro}
                                        eliminarRegistro={eliminarRegistro}
                                        nuevoRegistro={nuevoRegistro}
                                        insertarRegistro={nuevoRegistro}
                                        actualizarRegistro={actualizarTipoEquipo}
                                        seleccionarRegistro={seleccionarRegistro}
                                        //verRegistroDblClick={verRegistroDblClick}
                                        focusedRowKey={focusedRowKey}

                                        expandRow={{ expandRow, setExpandRow }}
                                        collapsedRow={{ collapsed, setCollapsed }}
                                    />
                                </TabPanel>
                                <TabPanel value={tabIndex} className={classes.TabPanel} index={1}>
                                    <>
                                        <TipoEquipoEditPage
                                            titulo={titulo}
                                            modoEdicion={modoEdicion}
                                            dataRowEditNew={dataRowEditNew}
                                            actualizarTipoEquipo={actualizarTipoEquipo}
                                            agregarTipoEquipo={agregarTipoEquipo}
                                            cancelarEdicion={cancelarEdicion}
                                            idTipoEquipo={varIdTipoEquipo}
                                        />
                                        <div className="container_only">
                                            <div className="float-right">
                                                <ControlSwitch
                                                    checked={auditoriaSwitch}
                                                    onChange={e => { setAuditoriaSwitch(e.target.checked) }}
                                                /><b> {intl.formatMessage({ id: "AUDIT.DATA" })} </b>
                                            </div>
                                        </div>
                                        {auditoriaSwitch && (<AuditoriaPage dataRowEditNew={dataRowEditNew} />)}
                                    </>
                                </TabPanel>
                                <TabPanel value={tabIndex} className={classes.TabPanel} index={2}>
                                    <>
                                        {modoEdicionTabs && (
                                            <>
                                                <TipoEquipoModeloEditPage
                                                    modoEdicion={modoEdicion}
                                                    dataRowEditNew={dataRowEditNewTabs}
                                                    actualizarTipoEquipoModelo={actualizarTipoEquipoModelo}
                                                    agregarTipoEquipoModelo={agregarTipoEquipoModelo}
                                                    cancelarEdicion={cancelarEdicionTabs}
                                                    titulo={tituloTabs}
                                                />
                                                <div className="container_only">
                                                    <div className="float-right">
                                                        <ControlSwitch checked={auditoriaSwitch}
                                                            onChange={e => { setAuditoriaSwitch(e.target.checked) }}
                                                        /><b>{intl.formatMessage({ id: "AUDIT.DATA" })} </b>
                                                    </div>
                                                </div>
                                                {auditoriaSwitch && (<AuditoriaPage dataRowEditNew={dataRowEditNewTabs} />)}
                                            </>

                                        )}
                                        {!modoEdicionTabs && (
                                            <>
                                                <TipoEquipoModeloListPage
                                                    tipoequipoModelos={listarTabs}
                                                    editarRegistro={editarRegistroTipoEquipoModelo}
                                                    eliminarRegistro={eliminarRegistroTipoEquipoModelo}
                                                    nuevoRegistro={nuevoRegistroTabs}
                                                    cancelarEdicion={cancelarEdicion}
                                                    getInfo={getInfo}
                                                />
                                            </>
                                        )}
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


export default injectIntl(TipoEquipoIndexPage);
