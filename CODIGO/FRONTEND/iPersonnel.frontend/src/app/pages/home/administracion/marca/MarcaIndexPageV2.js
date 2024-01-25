import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";

import PropTypes from 'prop-types';
import { isNotEmpty } from "../../../../../_metronic";
import { Portlet } from "../../../../partials/content/Portlet";
import { handleErrorMessages, handleSuccessMessages } from "../../../../store/ducks/notify-messages";
import { useStylesEncabezado, useStylesTab } from "../../../../store/config/Styles";
import CustomBreadcrumbs from "../../../../partials/layout/CustomBreadcrumbs";

import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import ImportExportIcon from '@material-ui/icons/ImportExport';

import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";

import { obtener, listar, crear, actualizar, eliminar } from "../../../../api/administracion/marca.api";
import MarcaListPage from "./MarcaListPage";
import MarcaEditPage from "./MarcaEditPage";

import {
    eliminar as eliminarDetalle,
    obtener as obtenerDetalle,
    listar as listarDetalle,
    crear as crearDetalle,
    actualizar as actualizarDetalle
} from "../../../../api/administracion/marcaModelo.api";
import MarcaModeloListPage from "../marcaModelo/MarcaModeloListPage";
import MarcaModeloEditPage from "../marcaModelo/MarcaModeloEditPage";


const MarcaIndexPage = ({ intl }) => {
    const usuario = useSelector(state => state.auth.user);
    const perfil = useSelector(state => state.perfil.perfilActual);
    const classesEncabezado = useStylesEncabezado();
    const classes = useStylesTab();
    
    const [marcas, setMarcas] = useState([]);
    const [varIdMarca, setVarIdMarca] = useState("");
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

    
    //::::::::::::::::::::::::-variables-modelo-::::::::::::::::::::::::::::::::://
    const [marcaModelos, setMarcaModelos] = useState([]);
    const [modoEdicionDetalle, setModoEdicionDetalle] = useState(false);
    const [dataRowEditNewDetalle, setDataRowEditNewDetalle] = useState({});
    const [focusedRowKeyMarcaModelo, setFocusedRowKeyMarcaModelo] = useState();

    const [collapsed, setCollapsed] = useState(false);
    const [expandRow, setExpandRow] = useState(0);
    const [collapsedMarca, setCollapsedMarca] = useState(false);
    const [expandRowMarca, setExpandRowMarca] = useState(0);

    //::::Función Marca:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

    async function agregarMarca(marca) {
        const { IdMarca, Marca, Activo } = marca;
        let params = {
            IdMarca: isNotEmpty(IdMarca) ? IdMarca.toUpperCase() : "",
            Marca: isNotEmpty(Marca) ? Marca.toUpperCase() : "",
            IdCliente: perfil.IdCliente,
            Activo: Activo,
            IdUsuario: usuario.username
        };
        await crear(params)
            .then(response => {
                if (response)
                    handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
                setModoEdicion(false);
                listarMarca();
            })
            .catch(err => {
                handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
            });
    }

    async function actualizarMarca(marca) {
        const { IdMarca, Marca, Activo } = marca;
        let params = {
            IdMarca: isNotEmpty(IdMarca) ? IdMarca.toUpperCase() : "",
            Marca: isNotEmpty(Marca) ? Marca.toUpperCase() : "",
            IdCliente: perfil.IdCliente,
            Activo: Activo,
            IdUsuario: usuario.username
        };
        await actualizar(params)
            .then(response => {
                handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
                setModoEdicion(false);
                listarMarca();
            })
            .catch(err => {
                handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
            });
    }

    async function eliminarRegistro(marca) {
        const { IdCliente, IdMarca } = marca;
        await eliminar({
            IdCliente: IdCliente,
            IdMarca: IdMarca,
            IdUsuario: usuario.username
        })
            .then(response => {
                handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
            })
            .catch(err => {
                handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
            });
        listarMarca();
    }

    async function listarMarca() {
        const { IdCliente } = selected;
        let marca = await listar(
            IdCliente
        );
        setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
        setMarcas(marca);
        changeTabIndex(0);
    }

    /*async function obtenerMarca(idMarca) {
        if (idMarca) {
            let marca = await obtener({ IdMarca: idMarca });
            setDataRowEditNew({ ...marca, esNuevoRegistro: false });
        }
    }*/

    async function obtenerMarca() {
        const { IdCliente, IdMarca } = selected;
        if (isNotEmpty(IdCliente)
            && isNotEmpty(IdMarca)) {
            let marca = await obtener({
                IdCliente,
                IdMarca
            }).catch(err => {
                handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
            });
            setDataRowEditNew({ ...marca, esNuevoRegistro: false });
        }
    }

    const nuevoRegistro = () => {
        changeTabIndex(1);
        const { IdCliente } = selected;
        let marca = { Activo: "S" };
        setDataRowEditNewDetalle({});
        setDataRowEditNew({ ...marca, esNuevoRegistro: true });
        setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
        setModoEdicion(true);
    };

    const editarRegistro = dataRow => {
        changeTabIndex(1);
        const { IdMarca } = dataRow;
        setModoEdicion(true);
        setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
        obtenerMarca(dataRow);
        listarMarcaModelo(dataRow);
    };

    const cancelarEdicion = () => {
        changeTabIndex(0);
        setModoEdicion(false);
        setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
        setDataRowEditNew({});
        //setDataRowEditNewDetalle({});
    };

    const seleccionarRegistro = dataRow => {
        const { IdMarca, RowIndex } = dataRow;
        setSelected(dataRow);
        setModoEdicion(false);
        setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
        if (IdMarca != varIdMarca) {
            setVarIdMarca(IdMarca);
            setFocusedRowKey(RowIndex); 
        }
    };

    /*const seleccionarRegistro = dataRow => {
        const { RowIndex } = dataRow;
        setFocusedRowKey(RowIndex);
    };*/

    //:::Función Detalle Marca:::::::::::::::::::::::::::::::://

    const seleccionarMarcaModelo = async (dataRow) => {
        const { RowIndex } = dataRow;
        setFocusedRowKeyMarcaModelo(RowIndex);
    }

    async function listarMarcaModelo(filtro) {
        const { IdMarca } = filtro;
        if (IdMarca) {
            let marcaModelo = await listarDetalle({ IdMarca: IdMarca, NumPagina: 0, TamPagina: 0 });
            setMarcaModelos(marcaModelo);
        }
    }

    /* const nuevoRegistroDetalle = () => {
         const { IdMarca } = dataRowEditNew;
         if (!IdMarca) {
             handleInfoMessages("Crear Marca!");
         } else {
             let marcaModelo = { Activo: "S", IdMarca: IdMarca };
             setDataRowEditNewDetalle({ ...marcaModelo, esNuevoRegistro: true });
             setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
             setModoEdicionDetalle(true);
         }
     };*/

    async function agregarMarcaModelo(marcaModelo) {
        const { IdModelo, IdMarca, Modelo, Activo } = marcaModelo;

        let params = {
            IdModelo: isNotEmpty(IdModelo) ? IdModelo.toUpperCase() : "",
            IdMarca: isNotEmpty(IdMarca) ? IdMarca.toUpperCase() : "",
            Modelo: isNotEmpty(Modelo) ? Modelo.toUpperCase() : "",
            IdCliente: perfil.IdCliente,
            Activo: Activo,
            IdUsuario: usuario.username
        };
        await crearDetalle(params)
            .then(response => {
                if (response)
                    handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
                setModoEdicionDetalle(false);
                setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
                listarMarcaModelo(params);
            })
            .catch(err => {
                handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
            });
    }

    async function actualizarMarcaModelo(marcaModelo) {
        const { IdModelo, IdMarca, Modelo, Activo } = marcaModelo;

        let params = {
            IdModelo: isNotEmpty(IdModelo) ? IdModelo.toUpperCase() : "",
            IdMarca: isNotEmpty(IdMarca) ? IdMarca.toUpperCase() : "",
            Modelo: isNotEmpty(Modelo) ? Modelo.toUpperCase() : "",
            IdCliente: perfil.IdCliente,
            Activo: Activo,
            IdUsuario: usuario.username
        };
        await actualizarDetalle(params)
            .then(response => {
                handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
                setModoEdicionDetalle(false);
                setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
                listarMarcaModelo(params);
            })
            .catch(err => {
                handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
            });
    }

    const nuevoRegistroDetalle = async (dataRow) => {
        const { IdCliente, IdMarca, IdModelo } = dataRow;
        let marcaModulo = {
            IdCliente,
            IdMarca,
            IdModelo,
            Activo: "S"
        };
        setDataRowEditNewDetalle({ ...marcaModulo, esNuevoRegistro: true });
        setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
        setModoEdicionDetalle(true);
    };

    const editarRegistroDetalle = dataRow => {
        setModoEdicionDetalle(true);
        setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
        obtenerMarcaModelo(dataRow);
    };

    const cancelarEdicionDetalle = () => {
        setModoEdicionDetalle(false);
        setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
        setDataRowEditNewDetalle({});
    };

    async function obtenerMarcaModelo(filtro) {
        const { IdMarca, IdModelo } = filtro;
        if (IdModelo && IdMarca) {
            let marcaModelo = await obtenerDetalle({ IdModelo: IdModelo, IdMarca: IdMarca });
            setDataRowEditNewDetalle({ ...marcaModelo, esNuevoRegistro: false });
        }
    }

    async function eliminarRegistroDetalle(marcaModelo) {
        const { IdMarca, IdModelo, IdCliente } = marcaModelo;
        await eliminarDetalle({
            IdModelo: IdModelo,
            IdMarca: IdMarca,
            IdCliente: IdCliente,
            IdUsuario: usuario.username
        })
            .then(response => {
                handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
            })
            .catch(err => {
                handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
            });
        listarMarcaModelo(marcaModelo);
    }


    const changeTabIndex = (index) => {
        handleChange(null, index);
    }


    useEffect(() => {
        listarMarca();
    }, []);



    return (
        <>
            <div className="row">
                <div className="col-md-12">
                <Portlet className={classesEncabezado.border}>
                    <CustomBreadcrumbs 
                    Title={intl.formatMessage({ id: "ADMINISTRATION.BRAND.MENU" })} 
                    SubMenu={intl.formatMessage({ id: "ADMINISTRATION.BRAND.SUBMENU" })} 
                    SubMenu1={intl.formatMessage({ id: "ADMINISTRATION.BRAND.SUBTITLE" })} 
                    Subtitle={intl.formatMessage({ id: "ADMINISTRATION.BRAND.BRAND" })} />
                        <AppBar position="static" className={classesEncabezado.principal}>
                            <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                                <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                                    {intl.formatMessage({ id: "ADMINISTRATION.BRAND.MAINTENANCE" }).toUpperCase()}
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
                                        onClick={listarMarca} {...tabPropsIndex(0)}
                                        className={classes.tabContent}
                                    />
                                    <Tab
                                        label="Marca"
                                        icon={<ImportExportIcon fontSize="large" />}
                                        onClick={(e => obtenerMarca(varIdMarca))} {...tabPropsIndex(1)}
                                        disabled={isNotEmpty(varIdMarca) ? false : true}
                                        className={classes.tabContent}
                                    />
                                    
                                </Tabs>
                                <TabPanel value={tabIndex} className={classes.TabPanel} index={0}>
                                <>
                                 {modoEdicion && (

                                <>
                                    <MarcaEditPage
                                        modoEdicion={modoEdicion}
                                        dataRowEditNew={dataRowEditNew}
                                        actualizarMarca={actualizarMarca}
                                        agregarMarca={agregarMarca}
                                        cancelarEdicion={cancelarEdicion}
                                        titulo={titulo}
                                    />
                                    <div className="container_only">
                                        <div className="float-right">
                                            <ControlSwitch checked={auditoriaSwitch}
                                                onChange={e => { setAuditoriaSwitch(e.target.checked) }}
                                            /><b> {intl.formatMessage({ id: "AUDIT.DATA" })}</b>
                                        </div>
                                    </div>
                                    {auditoriaSwitch && (<AuditoriaPage dataRowEditNew={dataRowEditNewDetalle} />)}
                                </>
                            )}
                            {modoEdicionDetalle && (
                                <>
                                    <MarcaModeloEditPage
                                        modoEdicion={modoEdicionDetalle}
                                        dataRowEditNew={dataRowEditNewDetalle}
                                        actualizarModelo={actualizarMarcaModelo}
                                        agregarModelo={agregarMarcaModelo}
                                        cancelarEdicion={cancelarEdicionDetalle}
                                        titulo={titulo}
                                    />
                                    <div className="container_only">
                                        <div className="float-right">
                                            <ControlSwitch checked={auditoriaSwitch}
                                                onChange={e => { setAuditoriaSwitch(e.target.checked) }}
                                            /><b> {intl.formatMessage({ id: "AUDIT.DATA" })}</b>
                                        </div>
                                    </div>
                                    {auditoriaSwitch && (<AuditoriaPage dataRowEditNew={dataRowEditNewDetalle} />)}
                                </>
                            )}
                            {!modoEdicion && !modoEdicionDetalle && (
                                <MarcaListPage
                                    marcas={marcas}
                                    titulo={titulo}
                                    showButtons={true}
                                    showColumnOrder={false}
                                    editarRegistro={editarRegistro}
                                    eliminarRegistro={eliminarRegistro}
                                    nuevoRegistro={nuevoRegistro}
                                    seleccionarRegistro={seleccionarRegistro}
                                    focusedRowKey={focusedRowKey}

                                    insertarMarcaModelo={nuevoRegistroDetalle}
                                    editarMarcaModelo={editarRegistroDetalle}
                                    eliminarMarcaModelo={eliminarRegistroDetalle}
                                    seleccionarMarcaModelo={seleccionarMarcaModelo}
                                    focusedRowKeyMarcaModelo={focusedRowKeyMarcaModelo}

                                    expandRow={{ expandRowMarca, setExpandRowMarca }}
                                    collapsedRow={{ collapsedMarca, setCollapsedMarca }}
                                />

                            )}
                        </>
                                </TabPanel>
                                <TabPanel value={tabIndex} className={classes.TabPanel} index={1}>
                                    <>
                                    <MarcaEditPage
                                        modoEdicion={modoEdicion}
                                        dataRowEditNew={dataRowEditNew}
                                        actualizarMarca={actualizarMarca}
                                        agregarMarca={agregarMarca}
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

export default injectIntl(MarcaIndexPage);
