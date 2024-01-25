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

import {
    obtener,
    listar,
    crear,
    actualizar,
    eliminar
} from "../../../../api/administracion/MarcaModelo.api";
import MarcaModeloListPage from "./MarcaModeloListPage";
import MarcaModeloEditPage from "./MarcaModeloEditPage";

const MarcaModeloIndexPage = () => {
    const usuario = useSelector(state => state.auth.user);

    const [marcaModelos, setMarcaModelos] = useState([]);

    const [dataRowEditNew, setDataRowEditNew] = useState({});
    const [modoEdicion, setModoEdicion] = useState(false);
    const [titulo, setTitulo] = useState("Listado");
    const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
    const classesEncabezado = useStylesEncabezado();


    async function agregarMarcaModelo(marcaModelo) {

        const { IdModelo, Modelo, IdMarca, Activo } = marcaModelo;
        let params = {
            IdModelo: IdModelo.toUpperCase()
            , Modelo: Modelo.toUpperCase()
            , IdMarca: IdMarca.toUpperCase()
            , Activo: Activo
            , IdUsuario: usuario.username
        };
        await crear(params).then(response => {
            if (response) handleSuccessMessages("Se registró con éxito!");
            setModoEdicion(false);
            listarMarcaModelo();
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
    }

    async function actualizarMarcaModelo(marcaModelo) {

        const { IdModelo, Modelo, IdMarca, Activo } = marcaModelo;
        let params = {
            IdModelo: IdModelo.toUpperCase()
            , Modelo: Modelo.toUpperCase()
            , IdMarca: IdMarca.toUpperCase()
            , Activo: Activo
            , IdUsuario: usuario.username
        };
        await actualizar(params).then(response => {
            handleSuccessMessages("Se actualizó con éxito!");
            setModoEdicion(false);
            listarMarcaModelo();
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
    }

    async function eliminarRegistro(marcaModelo) {
        const { IdMarca, IdModelo } = marcaModelo;
        await eliminar({ IdModelo: IdModelo, IdMarca: IdMarca, IdUsuario: usuario.username }).then(response => {
            handleSuccessMessages("Se eliminó con éxito!");
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
        listarMarcaModelo();
    }

    async function listarMarcaModelo() {

        let marcaModelo = await listar();
        setTitulo("Listado");
        setMarcaModelos(marcaModelo);

    }

    async function obtenerMarcaModelo(idMarca, idModelo) {
        if (idMarca && idModelo) {
            let marcaModelo = await obtener({ IdMarca: idMarca, IdModelo: idModelo });
            setDataRowEditNew({ ...marcaModelo, esNuevoRegistro: false });
        }
    }

    const nuevoRegistro = () => {
        let marcaModelo = { Activo: "S" };
        setDataRowEditNew({ ...marcaModelo, esNuevoRegistro: true });
        setTitulo("Nuevo");
        setModoEdicion(true);
    };

    const editarRegistro = dataRow => {
        const { IdMarca, IdModelo } = dataRow;
        setModoEdicion(true);
        setTitulo("Editar");
        obtenerMarcaModelo(IdMarca, IdModelo);
    };

    const cancelarEdicion = () => {
        setModoEdicion(false);
        setTitulo("Listado");
        setDataRowEditNew({});
    };


    useEffect(() => {
        listarMarcaModelo();

    }, []);

    return (
        <>
            <div className="row">
                <div className="col-md-12">
                <Portlet className={classesEncabezado.border}>
                        <AppBar position="static" className={classesEncabezado.principal}>
                            <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                                <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                                      {("Mantenimiento de modelo").toUpperCase()}
                                </Typography>
                            </Toolbar>
                        </AppBar>
                            {modoEdicion && (
                                <>
                                    <MarcaModeloEditPage
                                        modoEdicion={modoEdicion}
                                        dataRowEditNew={dataRowEditNew}
                                        actualizarMarcaModelo={actualizarMarcaModelo}
                                        agregarMarcaModelo={agregarMarcaModelo}
                                        cancelarEdicion={cancelarEdicion}
                                        titulo={titulo}
                                    />
                                    <div className="container_only">
                                        <div className="float-right">
                                            <ControlSwitch checked={auditoriaSwitch}
                                                onChange={e => { setAuditoriaSwitch(e.target.checked) }}
                                            /><b>Datos de auditoría</b>
                                        </div>
                                    </div>
                                    {auditoriaSwitch && (<AuditoriaPage dataRowEditNew={dataRowEditNew} />)}

                                </>
                            )}
                            {!modoEdicion && (
                                <MarcaModeloListPage
                                    marcaModelos={marcaModelos}
                                    editarRegistro={editarRegistro}
                                    eliminarRegistro={eliminarRegistro}
                                    nuevoRegistro={nuevoRegistro}
                                />
                            )}                       
                    </Portlet>
                </div>
            </div>
        </>
    );
};

export default MarcaModeloIndexPage;
