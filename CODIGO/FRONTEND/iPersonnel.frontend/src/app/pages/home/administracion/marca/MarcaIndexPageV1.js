import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { Portlet } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";
import CustomBreadcrumbs from "../../../../partials/layout/CustomBreadcrumbs";
import { isNotEmpty } from "../../../../../_metronic";

import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";

import {
    handleErrorMessages,
    handleSuccessMessages,
    handleInfoMessages
} from "../../../../store/ducks/notify-messages";
import { useSelector } from "react-redux";

import { obtener, listar, crear, actualizar, eliminar } from "../../../../api/administracion/marca.api";
import MarcaListPage from "./MarcaListPage";
import MarcaEditPage from "./MarcaEditPage";

//:::::::::::::::::::::::::::::::::::::::::::::-import- modelo -::::::::::::::::::::::::::::::::://
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

    const [marcas, setMarcas] = useState([]);

    const [dataRowEditNew, setDataRowEditNew] = useState({});
    const [modoEdicion, setModoEdicion] = useState(false);
    const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
    const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
    const classesEncabezado = useStylesEncabezado();
    const [focusedRowKey, setFocusedRowKey] = useState(1);

    //:::::::::::::::::::::::::::::::::::::::::::::-variables-modelo-::::::::::::::::::::::::::::::::://
    const [marcaModelos, setMarcaModelos] = useState([]);
    const [modoEdicionDetalle, setModoEdicionDetalle] = useState(false);
    const [dataRowEditNewDetalle, setDataRowEditNewDetalle] = useState({});

    async function agregarMarca(marca) {
        const { IdMarca, Marca, Activo } = marca;
        let params = {
            IdMarca:  isNotEmpty(IdMarca) ? IdMarca.toUpperCase() : "",
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
            IdMarca:  isNotEmpty(IdMarca) ? IdMarca.toUpperCase() : "",
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
            IdUsuario: usuario.username })
            .then(response => {
                handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
            })
            .catch(err => {
                handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
            });
        listarMarca();
    }

    async function listarMarca() {
        let marca = await listar();
        setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
        setMarcas(marca);
    }

    /*async function obtenerMarca(idMarca) {
        if (idMarca) {
            let marca = await obtener({ IdMarca: idMarca });
            setDataRowEditNew({ ...marca, esNuevoRegistro: false });
        }
    }*/

    async function obtenerMarca(filtro) {
        const { IdCliente, IdMarca } = filtro;
        if (isNotEmpty(IdCliente)
            && isNotEmpty(IdMarca)) {
            let marca = await obtener({ 
                IdCliente: IdCliente,
                IdMarca: IdMarca 
            }).catch(err => {
                handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
            });
            setDataRowEditNew({ ...marca, esNuevoRegistro: false });
        }
    }

    const nuevoRegistro = () => {
        let marca = { Activo: "S" };
        setDataRowEditNewDetalle({});
        setDataRowEditNew({ ...marca, esNuevoRegistro: true });
        setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
        setModoEdicion(true);
    };

    const editarRegistro = dataRow => {
        const { IdMarca } = dataRow;
        setModoEdicion(true);
        setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
        obtenerMarca(dataRow);
        listarMarcaModelo(dataRow);
    };

    const cancelarEdicion = () => {
        setModoEdicion(false);
        setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
        setDataRowEditNew({});
        setDataRowEditNewDetalle({});
    };

    const seleccionarRegistro = dataRow => {
        const { RowIndex } = dataRow;
        setFocusedRowKey(RowIndex);
    };

    //:::::::::::::::::::::::::::::::::::::::::::::-funcion-modelo-::::::::::::::::::::::::::::::::://
    async function listarMarcaModelo(filtro) {
        const { IdMarca } = filtro;
        if (IdMarca) {
            let marcaModelo = await listarDetalle({ IdMarca: IdMarca, NumPagina: 0, TamPagina: 0 });
            setMarcaModelos(marcaModelo);
        }
    }

    const nuevoRegistroDetalle = () => {
        const { IdMarca } = dataRowEditNew;
        if (!IdMarca) {
            handleInfoMessages("Crear Marca!");
        } else {
            let marcaModelo = { Activo: "S", IdMarca: IdMarca };
            setDataRowEditNewDetalle({ ...marcaModelo, esNuevoRegistro: true });
            setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
            setModoEdicionDetalle(true);
        }
    };

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
            IdUsuario: usuario.username })
            .then(response => {
                handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
            })
            .catch(err => {
                handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
            });
        listarMarcaModelo(marcaModelo);
    }

    useEffect(() => {
        listarMarca();
    }, []);

    return (
        <>
            <div className="row">
                <div className="col-md-12">
                <CustomBreadcrumbs Title={intl.formatMessage({ id: "ADMINISTRATION.BRAND.MENU" })} SubMenu={intl.formatMessage({ id: "ADMINISTRATION.BRAND.SUBMENU" })} SubMenu1={intl.formatMessage({ id: "ADMINISTRATION.BRAND.SUBTITLE" })} Subtitle={intl.formatMessage({ id: "ADMINISTRATION.BRAND.BRAND" })} />
                    <Portlet className={classesEncabezado.border}>
                        <AppBar position="static" className={classesEncabezado.principal}>
                            <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                                <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                                {intl.formatMessage({ id: "ADMINISTRATION.BRAND.MAINTENANCE" }).toUpperCase()}
                                </Typography>
                            </Toolbar>
                        </AppBar>
                        {modoEdicion && (
                            <>
                                {!modoEdicionDetalle && (
                                    <>
                                        <MarcaEditPage
                                            modoEdicion={modoEdicion}
                                            dataRowEditNew={dataRowEditNew}
                                            actualizarMarca={actualizarMarca}
                                            agregarMarca={agregarMarca}
                                            cancelarEdicion={cancelarEdicion}
                                            titulo={titulo}
                                        />
                                        <MarcaModeloListPage
                                            marcaModelos={marcaModelos}
                                            editarRegistro={editarRegistroDetalle}
                                            eliminarRegistro={eliminarRegistroDetalle}
                                            nuevoRegistro={nuevoRegistroDetalle}
                                        />
                                        <div className="container_only">
                                            <div className="float-right">
                                                <ControlSwitch
                                                    checked={auditoriaSwitch}
                                                    onChange={e => {
                                                        setAuditoriaSwitch(e.target.checked);
                                                    }}
                                                />
                                                <b> {intl.formatMessage({ id: "AUDIT.DATA" })}</b>
                                            </div>
                                        </div>
                                        {auditoriaSwitch && <AuditoriaPage dataRowEditNew={dataRowEditNew} />}
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
                                                <ControlSwitch
                                                    checked={auditoriaSwitch}
                                                    onChange={e => {
                                                        setAuditoriaSwitch(e.target.checked);
                                                    }}
                                                />
                                               <b> {intl.formatMessage({ id: "AUDIT.DATA" })}</b>
                                            </div>
                                        </div>
                                        {auditoriaSwitch && <AuditoriaPage dataRowEditNew={dataRowEditNewDetalle} />}
                                    </>
                                )}
                            </>
                        )}
                        {!modoEdicion && (
                            <MarcaListPage
                                marcas={marcas}
                                editarRegistro={editarRegistro}
                                eliminarRegistro={eliminarRegistro}
                                nuevoRegistro={nuevoRegistro}
                                seleccionarRegistro={seleccionarRegistro}
                                focusedRowKey={focusedRowKey}
                            />
                        )}
                    </Portlet>
                </div>
            </div>
        </>
    );
};

export default injectIntl (MarcaIndexPage);
