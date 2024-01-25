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

import { eliminar, obtener, listar, crear, actualizar } from "../../../../api/casino/comedor.api";
import ComedorListPage from "./ComedorListPage";
import ComedorEditPage from "./ComedorEditPage";

import {
    eliminar as eliminarComServicio, obtener as obtenerComServicio, listar as listarComServicio, crear as crearComServicio, actualizar as actualizarComServicio
} from "../../../../api/casino/comedorServicio.api";
import ComedorServicioListPage from "../comedorServicio/ComedorServicioListPage";
import ComedorServicioEditPage from "../comedorServicio/ComedorServicioEditPage";

import {
    eliminar as eliminarComEquipo, obtener as obtenerComEquipo, listar as listarComEquipo, crear as crearComEquipo, actualizar as actualizarComEquipo
} from "../../../../api/casino/comedorEquipo.api";
import ComedorEquipoListPage from "../comedorEquipo/ComedorEquipoListPage";
import ComedorEquipoEditPage from "../comedorEquipo/ComedorEquipoEditPage";

import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import PropTypes from 'prop-types';

import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import KitchenIcon from '@material-ui/icons/Kitchen';
import RoomServiceIcon from '@material-ui/icons/RoomService';
import RestaurantIcon from '@material-ui/icons/Restaurant';

// import HeaderInformation from "../../../../partials/components/HeaderInformation";

const ComedorIndexPage = ({ intl }) => {
    const usuario = useSelector(state => state.auth.user);
    const perfil = useSelector(state => state.perfil.perfilActual);

    const [varIdComedor, setVarIdComedor] = useState("");
    const [focusedRowKey, setFocusedRowKey] = useState(0);
    const [comedores, setComedores] = useState([]);
    //Datos principales
    const [selected, setSelected] = useState({});

    const [dataRowEditNew, setDataRowEditNew] = useState({});
    const [modoEdicion, setModoEdicion] = useState(false);

    const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
    const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
    const [modoEdicionTabs, setModoEdicionTabs] = useState(false);
    const [dataRowEditNewTabs, setDataRowEditNewTabs] = useState({});
    const [tituloTabs, setTituloTabs] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
    const [listarTabs, setListarTabs] = useState([]);

    const classesEncabezado = useStylesEncabezado();
    const classes = useStylesTab();
    const [tabIndex, setTabIndex] = useState(0);

    const handleChange = (event, newValue) => {
        //Estado cambio de tabs
        setTabIndex(newValue);
    };

    //::::::::::::::::::::::::::::FUNCIONES PARA COMEDOR-:::::::::::::::::::::::::::::::::::

    async function agregarComedor(data) {
        const { IdComedor, Comedor, IdTipo, Activo } = data;
        let param = {
            IdComedor: isNotEmpty(IdComedor) ? IdComedor.toUpperCase() : "",
            Comedor: isNotEmpty(Comedor) ? Comedor.toUpperCase() : "",
            IdTipo: isNotEmpty(IdTipo) ? IdTipo.toUpperCase() : "",
            IdCliente: perfil.IdCliente,
            IdDivision: perfil.IdDivision,
            Activo: Activo,
            IdUsuario: usuario.username
        };
        await crear(param)
            .then(response => {
                if (response)
                    handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
                setModoEdicion(false);
                listarComedores();
            })
            .catch(err => {
                handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
            });
    }


    async function actualizarComedor(comedor) {
        const { IdComedor, Comedor, IdTipo, Activo } = comedor;
        let params = {
            IdComedor: isNotEmpty(IdComedor) ? IdComedor.toUpperCase() : "",
            Comedor: isNotEmpty(Comedor) ? Comedor.toUpperCase() : "",
            IdTipo: isNotEmpty(IdTipo) ? IdTipo.toUpperCase() : "",
            IdCliente: perfil.IdCliente,
            IdDivision: perfil.IdDivision,
            Activo: Activo,
            IdUsuario: usuario.username
        };
        await actualizar(params)
            .then(response => {
                handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
                setModoEdicion(false);
                listarComedores();
            })
            .catch(err => {
                handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
            });
    }


    async function eliminarRegistro(comedor) {
        const { IdCliente, IdDivision, IdComedor } = comedor;
        await eliminar({
            IdCliente: IdCliente,
            IdDivision: IdDivision,
            IdComedor: IdComedor,
            IdUsuario: usuario.username
        })
            .then(response => {
                handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
            })
            .catch(err => {
                handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
            });
        listarComedores();
    }


    async function listarComedores() {
        let comedores = await listar({
            IdCliente: perfil.IdCliente,
            IdDivision: perfil.IdDivision,
            IdComedor: '%',
            NumPagina: 0,
            TamPagina: 0
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
        setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
        setComedores(comedores);
        changeTabIndex(0);
    }


    async function obtenerComedor(filtro) {
        const { IdCliente, IdDivision, IdComedor } = filtro;
        if (isNotEmpty(IdCliente)
            && isNotEmpty(IdDivision)
            && isNotEmpty(IdComedor)) {
            let comedor = await obtener({
                IdCliente: IdCliente,
                IdDivision: IdDivision,
                IdComedor: IdComedor
            }).catch(err => {
                handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
            });
            setDataRowEditNew({ ...comedor, esNuevoRegistro: false });
        }
    }


    const nuevoRegistro = () => {
        changeTabIndex(1);
        let comedor = {
            Activo: "S",
            FechaRegistro: new Date().toJSON().slice(0, 10)
        };
        setDataRowEditNew({ ...comedor, esNuevoRegistro: true });
        setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
        setModoEdicion(true);
        setVarIdComedor("");

    };


    const editarRegistro = dataRow => {
        changeTabIndex(1);
        const { IdComedor } = dataRow;
        setModoEdicion(true);
        setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
        //setVarIdComedor(IdComedor);
        obtenerComedor(dataRow);
    };


    const cancelarEdicion = () => {
        changeTabIndex(0);
        setModoEdicion(false);
        setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
        setDataRowEditNew({});
        setDataRowEditNewTabs({});
        setVarIdComedor("");
    };


    const seleccionarRegistro = dataRow => {
        const { IdComedor, Comedor, RowIndex } = dataRow;
        setModoEdicion(false);
        //Datos Principales
        setSelected(dataRow);
        setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
        if (IdComedor != varIdComedor) {
            setVarIdComedor(IdComedor);
            obtenerComedor(dataRow);
            setFocusedRowKey(RowIndex);
        }
    }

    const verRegistroDblClick = async (dataRow) => {
        changeTabIndex(1);
        setModoEdicion(false);
        await obtenerComedor(dataRow.IdComedor);
    };

    useEffect(() => {
        listarComedores();
    }, []);

    //::::::::::::::::::::::FUNCION SERVICIOS:::::::::::::::::::::::::::::::::::::::::::::::::

    async function agregarComedorServicio(dataComedorServicio) {
        //console.log("agregarComedorServicio", dataComedorServicio);
        const { IdComedor, IdServicio, HoraInicio, HoraFin, Servicio, Especial, Activo } = dataComedorServicio;
        let params = {
            IdComedor: varIdComedor
            , IdServicio: isNotEmpty(IdServicio) ? IdServicio.toUpperCase() : ""
            , HoraInicio: isNotEmpty(HoraInicio) ? HoraInicio : ""
            , HoraFin: isNotEmpty(HoraFin) ? HoraFin : ""
            , Servicio: isNotEmpty(Servicio) ? Servicio.toUpperCase() : ""
            , Especial: isNotEmpty(Especial) ? Especial.toUpperCase() : ""
            , Activo
            , IdCliente: perfil.IdCliente
            , IdDivision: perfil.IdDivision
            , IdUsuario: usuario.username
        };
        await crearComServicio(params).then(response => {
            if (response)
                handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
            listarComedorServicio();
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
    }


    async function actualizarComedorServicio(comedorServicio) {
        //console.log("actualizarComedorServicio", comedorServicio);
        const { IdComedor, IdServicio, HoraInicio, HoraFin, Servicio, Especial, Activo } = comedorServicio;
        let params = {
            IdComedor: varIdComedor
            , IdServicio: isNotEmpty(IdServicio) ? IdServicio.toUpperCase() : ""
            , HoraInicio: isNotEmpty(HoraInicio) ? HoraInicio : ""
            , HoraFin: isNotEmpty(HoraFin) ? HoraFin : ""
            , Servicio: isNotEmpty(Servicio) ? Servicio.toUpperCase() : ""
            , Especial: isNotEmpty(Especial) ? Especial.toUpperCase() : ""
            , Activo
            , IdCliente: perfil.IdCliente
            , IdDivision: perfil.IdDivision
            , IdUsuario: usuario.username
        };
        await actualizarComServicio(params).then(() => {
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
            listarComedorServicio();
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
    }


    async function eliminarRegistroComedorServicio(comedorServicio) {
        const { IdComedor, IdServicio, IdCliente, IdDivision } = comedorServicio;
        await eliminarComServicio({
            IdComedor: IdComedor,
            IdServicio: IdServicio,
            IdCliente: IdCliente,
            IdDivision: IdDivision,
            IdUsuario: usuario.username
        }).then(response => {
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
        listarComedorServicio();
    }

    async function listarComedorServicio() {
        setModoEdicionTabs(false);
        let comedoresServicio = await listarComServicio({
            IdComedor: varIdComedor,
            IdCliente: perfil.IdCliente,
            IdDivision: perfil.IdDivision,
            NumPagina: 0, TamPagina: 0
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
        setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
        setListarTabs(comedoresServicio);
    }


    async function obtenerComedorServicio(filtro) {
        const { IdComedor, IdServicio, IdCliente, IdDivision } = filtro;
        if (IdComedor) {
            let comedorServicio = await obtenerComServicio({
                IdComedor: IdComedor,
                IdServicio: IdServicio,
                IdCliente: IdCliente,
                IdDivision: IdDivision
            }).catch(err => {
                handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
            });
            setDataRowEditNewTabs({ ...comedorServicio, esNuevoRegistro: false });
        }
    }


    const editarRegistroComedorServicio = dataRow => {
        setModoEdicionTabs(true);
        setTituloTabs(intl.formatMessage({ id: "ACTION.EDIT" }));
        obtenerComedorServicio(dataRow);
    };


    const nuevoComedorServicio = () => {
        let nuevo = { Activo: "S", HoraInicio: "00:00", HoraFin: "00:00" };
        setDataRowEditNewTabs({ ...nuevo, esNuevoRegistro: true });
        setTituloTabs(intl.formatMessage({ id: "ACTION.NEW" }));
        setModoEdicionTabs(true);
    };


    const cancelarEdicionTabs = () => {
        setModoEdicionTabs(false);
        setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
        setDataRowEditNewTabs({});
    };



    //::::::::::::::::::::::FUNCION EQUIPOS:::::::::::::::::::::::::::::::::::::::::::::::::

    async function agregarComedorEquipo(dataComedorEquipo) {
        const { IdCliente, IdDivision, IdComedor, IdEquipo, Activo } = dataComedorEquipo;
        let params = {
            IdComedor: varIdComedor
            , IdEquipo: isNotEmpty(IdEquipo) ? IdEquipo.toUpperCase() : ""
            , Activo: Activo
            , IdCliente: perfil.IdCliente
            , IdDivision: perfil.IdDivision
            , IdUsuario: usuario.username
        };
        await crearComEquipo(params).then(response => {
            if (response)
                handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
            listarComedorEquipo();
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
    }


    async function actualizarComedorEquipo(comedorEquipo) {
        const { IdCliente, IdDivision, IdComedor, IdEquipo, Activo } = comedorEquipo;
        let params = {
            IdComedor: varIdComedor
            , IdEquipo: isNotEmpty(IdEquipo) ? IdEquipo.toUpperCase() : ""
            , Activo: Activo
            , IdCliente: perfil.IdCliente
            , IdDivision: perfil.IdDivision
            , IdUsuario: usuario.username
        };
        await actualizarComEquipo(params).then(() => {
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
            listarComedorEquipo();
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
    }


    async function eliminarRegistroComedorEquipo(comedorEquipo) {
        const { IdComedor, IdEquipo, IdCliente, IdDivision } = comedorEquipo;
        await eliminarComEquipo({
            IdComedor: IdComedor,
            IdEquipo: IdEquipo,
            IdCliente: IdCliente,
            IdDivision: IdDivision,
            IdUsuario: usuario.username
        }).then(response => {
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
        listarComedorEquipo();
    }

    async function listarComedorEquipo() {
        setModoEdicionTabs(false);
        let comedoresEquipo = await listarComEquipo({
            IdComedor: varIdComedor,
            IdCliente: perfil.IdCliente,
            IdDivision: perfil.IdDivision,
            IdEquipo: '%',
            NumPagina: 0, TamPagina: 0
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
        setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
        setListarTabs(comedoresEquipo);
    }


    async function obtenerComedorEquipo(filtro) {
        const { IdComedor, IdEquipo, IdCliente, IdDivision } = filtro;
        if (IdCliente && IdDivision && IdComedor && IdEquipo) {
            let comedorEquipo = await obtenerComEquipo({
                IdComedor: IdComedor,
                IdEquipo: IdEquipo,
                IdCliente: IdCliente,
                IdDivision: IdDivision
            }).catch(err => {
                handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
            });
            setDataRowEditNewTabs({ ...comedorEquipo, esNuevoRegistro: false });
        }
    }


    const editarRegistroComedorEquipo = dataRow => {
        const { IdCliente, IdDivision, IdComedor, IdEquipo } = dataRow;
        let filtro = {
            IdCliente: IdCliente,
            IdDivision: IdDivision,
            IdComedor: IdComedor,
            IdEquipo: IdEquipo
        };
        setModoEdicionTabs(true);
        setTituloTabs(intl.formatMessage({ id: "ACTION.EDIT" }));
        obtenerComedorEquipo(dataRow);
    };


    const nuevoRegistroTabsEquipo = () => {
        let nuevo = { Activo: "S" };
        setDataRowEditNewTabs({ ...nuevo, esNuevoRegistro: true });
        setTituloTabs(intl.formatMessage({ id: "ACTION.NEW" }));
        setModoEdicionTabs(true);
    };


    const cancelarEdicionTabsEquipo = () => {
        setModoEdicionTabs(false);
        setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
        setDataRowEditNewTabs({});
    };

    //Datos Principales
    const changeTabIndex = (index) => {
        handleChange(null, index);
    }


    const getInfo = () => {
        const { IdComedor, Comedor } = selected;
        return [
            { text: [intl.formatMessage({ id: "COMMON.CODE" })], value: IdComedor, colSpan: 2 },
            { text: [intl.formatMessage({ id: "CASINO.DINNINGROOM" })], value: Comedor, colSpan: 4 }
        ];
    }

    //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

    return (
        <>
            <div className="row">
                <div className="col-md-12">
                    <CustomBreadcrumbs Title={intl.formatMessage({ id: "CASINO.DINNINGROOM.MENU" })} SubMenu={intl.formatMessage({ id: "CASINO.DINNINGROOM.SUBMENU" })} Subtitle={intl.formatMessage({ id: "CASINO.DINNINGROOM.SUBTITLE" })} />
                    <Portlet className={classesEncabezado.border}>
                        <AppBar position="static" className={classesEncabezado.principal}>
                            <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                                <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                                    {intl.formatMessage({ id: "CASINO.DINNINGROOM.SERVICE.MAINTENANCE" }).toUpperCase()}
                                </Typography>
                            </Toolbar>
                        </AppBar>
                        {/* <HeaderInformation data={getInfo()} visible={[2, 3].includes(tabIndex)} /> */}
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
                                        onClick={listarComedores} {...tabPropsIndex(0)}
                                        className={classes.tabContent}
                                    />
                                    <Tab
                                        label={intl.formatMessage({ id: "CASINO.DINNINGROOM" })}
                                        icon={<RestaurantIcon fontSize="large" />}
                                        onClick={(e => obtenerComedor(varIdComedor))} {...tabPropsIndex(1)}
                                        disabled={isNotEmpty(varIdComedor) ? false : true}
                                        className={classes.tabContent}
                                    />
                                    <Tab
                                        label={intl.formatMessage({ id: "CASINO.DINNINGROOM.SERVICE.SERVICES" })}
                                        icon={<RoomServiceIcon fontSize="large" />}
                                        onClick={listarComedorServicio} {...tabPropsIndex(2)}
                                        disabled={isNotEmpty(varIdComedor) ? false : true}
                                        className={classes.tabContent}
                                    />
                                    <Tab
                                        label={intl.formatMessage({ id: "CASINO.DINNINGROOM.SERVICE.TEAMS" })}
                                        icon={<KitchenIcon fontSize="large" />}
                                        onClick={listarComedorEquipo} {...tabPropsIndex(3)}
                                        disabled={isNotEmpty(varIdComedor) ? false : true}
                                        className={classes.tabContent}
                                    />
                                </Tabs>
                                <TabPanel value={tabIndex} className={classes.TabPanel} index={0}>
                                    <ComedorListPage
                                        comedores={comedores}
                                        titulo={titulo}
                                        editarRegistro={editarRegistro}
                                        eliminarRegistro={eliminarRegistro}
                                        nuevoRegistro={nuevoRegistro}
                                        seleccionarRegistro={seleccionarRegistro}
                                        verRegistroDblClick={verRegistroDblClick}
                                        focusedRowKey={focusedRowKey}
                                    />
                                </TabPanel>
                                <TabPanel value={tabIndex} className={classes.TabPanel} index={1}>
                                    <>
                                        <ComedorEditPage
                                            titulo={titulo}
                                            modoEdicion={modoEdicion}
                                            dataRowEditNew={dataRowEditNew}
                                            actualizarComedor={actualizarComedor}
                                            agregarComedor={agregarComedor}
                                            cancelarEdicion={cancelarEdicion}
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
                                <TabPanel value={tabIndex} className={classes.TabPanel} index={2}>
                                    <>
                                        {modoEdicionTabs && (
                                            <>
                                                <ComedorServicioEditPage
                                                    dataRowEditNew={dataRowEditNewTabs}
                                                    actualizarComedorServicio={actualizarComedorServicio}
                                                    agregarComedorServicio={agregarComedorServicio}
                                                    cancelarEdicion={cancelarEdicionTabsEquipo}
                                                    titulo={tituloTabs}  
                                                />
                                                <div className="container_only">
                                                    <div className="float-right">
                                                        <ControlSwitch checked={auditoriaSwitch}
                                                            onChange={e => { setAuditoriaSwitch(e.target.checked) }}
                                                        /><b> {intl.formatMessage({ id: "AUDIT.DATA" })}</b>
                                                    </div>
                                                </div>
                                                {auditoriaSwitch && (<AuditoriaPage dataRowEditNew={dataRowEditNewTabs} />)}
                                            </>
                                        )}
                                        {!modoEdicionTabs && (
                                            <>
                                                <ComedorServicioListPage
                                                    comedoresServicio={listarTabs}
                                                    editarRegistro={editarRegistroComedorServicio}
                                                    eliminarRegistro={eliminarRegistroComedorServicio}
                                                    nuevoRegistro={nuevoComedorServicio}
                                                    cancelarEdicion={cancelarEdicion}
                                                    getInfo={getInfo}
                                                />
                                            </>
                                        )}
                                    </>
                                </TabPanel>
                                <TabPanel value={tabIndex} className={classes.TabPanel} index={3}>
                                    <>
                                        {modoEdicionTabs && (
                                            <>
                                                <ComedorEquipoEditPage
                                                    dataRowEditNew={dataRowEditNewTabs}
                                                    actualizarComedorEquipo={actualizarComedorEquipo}
                                                    agregarComedorEquipo={agregarComedorEquipo}
                                                    cancelarEdicion={cancelarEdicionTabsEquipo}
                                                    titulo={tituloTabs} 
                                                />
                                                <div className="container_only">
                                                    <div className="float-right">
                                                        <ControlSwitch checked={auditoriaSwitch}
                                                            onChange={e => { setAuditoriaSwitch(e.target.checked) }}
                                                        /><b> {intl.formatMessage({ id: "AUDIT.DATA" })}</b>
                                                    </div>
                                                </div>
                                                {auditoriaSwitch && (<AuditoriaPage dataRowEditNew={dataRowEditNewTabs} />)}
                                            </>
                                        )}
                                        {!modoEdicionTabs && (
                                            <>
                                                <ComedorEquipoListPage
                                                    comedoresEquipo={listarTabs}
                                                    editarRegistro={editarRegistroComedorEquipo}
                                                    eliminarRegistro={eliminarRegistroComedorEquipo}
                                                    nuevoRegistro={nuevoRegistroTabsEquipo}
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

//Configuración inicial de tabs.

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

export default injectIntl(ComedorIndexPage);
