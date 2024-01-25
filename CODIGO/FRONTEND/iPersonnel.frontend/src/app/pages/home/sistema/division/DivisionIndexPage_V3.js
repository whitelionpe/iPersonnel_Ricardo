import React, { useEffect, useState } from "react";
import { Portlet } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";

import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";
import { handleErrorMessages, handleSuccessMessages } from "../../../../store/ducks/notify-messages";
import { useSelector } from "react-redux";
import { isNotEmpty } from "../../../../../_metronic";

import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import MenuTreeViewPage from "../../../../partials/content/TreeView/MenuTreeViewPage";
import { injectIntl } from "react-intl";
import CustomBreadcrumbs from "../../../../partials/layout/CustomBreadcrumbs";
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { eliminar, obtener, listar, listarTreeview, crear, actualizar } from "../../../../api/sistema/division.api";
import DivisionEditPage from "./DivisionEditPage";


const DivisionIndexPage = (props) => {
    const { intl, setLoading } = props;
    const usuario = useSelector(state => state.auth.user);
    const perfil = useSelector(state => state.perfil.perfilActual);

    const [dataRowEditNew, setDataRowEditNew] = useState({});
    const [modoEdicion, setModoEdicion] = useState(false);
    const [titulo, setTitulo] = useState("");
    const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
    const [showClient, setShowClient] = useState(false);
    const [dataRowEditNewCliente, setDataRowEditNewCliente] = useState({});

    const classesEncabezado = useStylesEncabezado();

    const [selected, setSelected] = useState({});

    const [dataFilter, setDataFilter] = useState({ IdModulo: "01" });
    const [isSubMenu, setIsSubMenu] = useState(false);
    const [varIdMenu, setVarIdMenu] = useState("PE");
    const [menus, setMenus] = useState([{
        Icon: "flaticon2-expand"
        , varIdMenu: null
        , IdModulo: null
        , IdMenuPadre: null
        , Menu: "-SIN DEFINIR UNIDAD-"
        , MenuPadre: null
        , Nivel: 0
        , Orden: 0
        , expanded: true
    }]);

    async function agregarDivision(division) {
        setLoading(true); 
        //console.log("agregarDivision", division)
        const { IdCliente, IdDivision, IdClientePadre, IdDivisionPadre, Division, IdPais, Activo } = division;
        let data = {
            IdCliente
            , IdDivision: isNotEmpty(IdDivision) ? IdDivision.toUpperCase() : ""
            , IdClientePadre: isNotEmpty(IdClientePadre) ? IdClientePadre : ""
            , IdDivisionPadre: isNotEmpty(IdDivisionPadre) ? IdDivisionPadre : ""
            , Division: isNotEmpty(Division) ? Division.toUpperCase() : ""
            , IdPais: isNotEmpty(IdPais) ? IdPais.toUpperCase() : ""
            , Activo
            , IdUsuario: usuario.username
        };
        await crear(data)
            .then(response => {
                if (response)
                    handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
                setModoEdicion(false);
                listarDivision();
            })
            .catch(err => {
                handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
            }).finally(() => { setLoading(false); });  
    }

    async function actualizarDivision(division) {
        setLoading(true); 
        const { IdCliente, IdDivision, IdClientePadre, IdDivisionPadre, Division, IdPais, Activo } = division;
        let data = {
            IdCliente
            , IdDivision: isNotEmpty(IdDivision) ? IdDivision.toUpperCase() : ""
            , IdClientePadre: isNotEmpty(IdClientePadre) ? IdClientePadre : ""
            , IdDivisionPadre: isNotEmpty(IdDivisionPadre) ? IdDivisionPadre : ""
            , Division: isNotEmpty(Division) ? Division.toUpperCase() : ""
            , IdPais: isNotEmpty(IdPais) ? IdPais.toUpperCase() : ""
            , Activo
            , IdUsuario: usuario.username
        };
        await actualizar(data)
            .then(() => {
                handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
                setModoEdicion(false);
                listarDivision();
            })
            .catch(err => {
                handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
            }).finally(() => { setLoading(false); });  
    }

    async function eliminarRegistro(division) {
        setLoading(true); 
        const { IdDivision, IdCliente } = division;
        await eliminar({
            IdDivision,
            IdCliente,
            IdUsuario: usuario.username
        }).then(() => {
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
        })
            .catch(err => {
                handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
            }).finally(() => { setLoading(false); });  
        listarDivision();
    }

    async function listarDivision() {
        setLoading(true);
        let divisiones = await listarTreeview({
            IdCliente: perfil.IdCliente,
            IdDivision: '%'
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
        if (!isNotEmpty(divisiones)) {
            setMenus([{
                Activo: "S"
                , icon: "flaticon2-expand"
                , IdMenu: null
                , IdMenuPadre: null
                , IdModulo: ""
                , Menu: "-SIN DATOS-"
                , MenuPadre: null
                , expanded: true
            }])
        } else {
            setMenus(divisiones);
            setLoading(false);
        }

    }

    async function obtenerDivision(filtro) {
        setLoading(true);
        const { IdDivision, IdCliente } = filtro;
        /*if (IdDivision) {
            let division = */
            await obtener({
                IdDivision, IdCliente
            }).then(division => {
                setDataRowEditNew({ ...division, esNuevoRegistro: false });
            }).catch(err => {
                handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
            }).finally(() => { setLoading(false); });
    }

    const nuevoRegistro = (dataNodo) => {
        const { IdDivision, IdCliente } = dataNodo;
        let nuevoDivision = {};
        if (isNotEmpty(IdDivision)) {
            nuevoDivision = { IdDivision:"", IdDivisionPadre: IdDivision, IdCliente, IdClientePadre: IdCliente, Activo: "S", IdPais:"PE" };
        } else {
            nuevoDivision = { IdDivision: "", IdDivisionPadre: "", IdCliente, IdClientePadre:IdCliente,  Activo: "S" };
        }
        setDataRowEditNew({ ...nuevoDivision, esNuevoRegistro: true });
        setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
        setModoEdicion(true);
    };

    const editarRegistro = async (dataRow) => {
        setModoEdicion(true);
        setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
        await obtenerDivision(dataRow);
    };

    const cancelarEdicion = () => {
        setModoEdicion(false);
        setDataRowEditNew({});
        setIsSubMenu(false);
        setDataFilter({ IdModulo: "" });
    };

    const treeViewSetFocusNodo = (data, varIdMenu) => {
        let menus = [];
        let objIndex = data.findIndex((obj => obj.varIdMenu === varIdMenu));
        if (objIndex >= 0) data[objIndex].selected = true;
        menus.push(...data);
        return menus;
    }
    const seleccionarNodo = async (dataRow) => {
        const { IdMenu,  IdDivision } = dataRow;
        if (IdMenu != varIdMenu) {
            setVarIdMenu(IdMenu);
            setModoEdicion(false);
            setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
            await obtenerDivision(dataRow);
        }
        setSelected(dataRow);
    }

    useEffect(() => {
        listarDivision();
    }, []);

    return (
        <>
            <div className="row">
                <div className="col-md-12">
                    <CustomBreadcrumbs 
                    Title={intl.formatMessage({ id: "SYSTEM.DIVISION.MENU" })} 
                    SubMenu={intl.formatMessage({ id: "SYSTEM.DIVISION.SUBMENU" })} 
                    Subtitle={intl.formatMessage({ id: "SYSTEM.DIVISION.MAINTENANCE" })} />
                    <Portlet className={classesEncabezado.border}>
                        <AppBar position="static" className={classesEncabezado.principal}>
                            <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                                <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                                 {intl.formatMessage({ id: "SYSTEM.DIVISION.MAINTENANCE" }).toUpperCase()}
                                </Typography>
                            </Toolbar>
                        </AppBar>

                        <Grid container spacing={1} direction="row" justify="flex-start" alignItems="stretch" >
                            <Grid item xs={6} >
                                <br />
                                {/***********Asignar componente MenuTreeViewPage*****************************/}
                                <Paper >
                                    <>
                                        <AppBar position="static" className={classesEncabezado.secundario}>
                                            <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                                                <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                                                {intl.formatMessage({ id: "SYSTEM.DIVISION.CLIENT" }).toUpperCase()}
                                                </Typography>
                                            </Toolbar>
                                        </AppBar>
                                        <MenuTreeViewPage
                                            menus={treeViewSetFocusNodo(menus, varIdMenu)}
                                            modoEdicion={modoEdicion}
                                            dataFilter={dataFilter}
                                            setDataFilter={setDataFilter}
                                            isSubMenu={isSubMenu}
                                            setIsSubMenu={setIsSubMenu}
                                            nuevoRegistro={nuevoRegistro}
                                            editarRegistro={editarRegistro}
                                            eliminarRegistro={eliminarRegistro}
                                            seleccionarNodo={seleccionarNodo}
                                        />
                                    </>
                                </Paper>
                            </Grid>
                            <Grid item xs={6} >
                                <br />
                                {/**********Asignar componente Divsión**********************************/}
                                <Paper >
                                    <>
                                        <AppBar position="static" className={classesEncabezado.secundario}>
                                            <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                                                <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                                                   {intl.formatMessage({ id: "SYSTEM.DIVISION" }).toUpperCase()}
                                                </Typography>
                                            </Toolbar>
                                        </AppBar>
                                        <DivisionEditPage
                                            modoEdicion={modoEdicion}
                                            dataRowEditNew={dataRowEditNew}
                                            actualizarDivision={actualizarDivision}
                                            agregarDivision={agregarDivision}
                                            cancelarEdicion={cancelarEdicion}
                                            titulo={titulo}
                                        />
                                        <div className="col-12 d-inline-block">
                                            <div className="float-right"> 
                                                <ControlSwitch
                                                    checked={auditoriaSwitch}
                                                    onChange={e => {
                                                        setAuditoriaSwitch(e.target.checked);
                                                    }}
                                                />
                                                <b> {intl.formatMessage({ id: "AUDIT.DATA" })} </b>
                                            </div>
                                        </div>
                                        {auditoriaSwitch && <AuditoriaPage dataRowEditNew={dataRowEditNew} />}
                                    </>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Portlet>
                </div>
            </div>
        </>
    );
};

export default injectIntl(WithLoandingPanel(DivisionIndexPage));
