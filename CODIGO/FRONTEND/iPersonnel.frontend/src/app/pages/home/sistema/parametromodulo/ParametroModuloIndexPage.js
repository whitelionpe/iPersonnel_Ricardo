import React, { useEffect, useState } from "react";
import { Portlet } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";

import { handleErrorMessages, handleSuccessMessages } from "../../../../store/ducks/notify-messages";
import { useSelector } from "react-redux";
import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";

import { obtener, eliminar, listar, crear, actualizar } from "../../../../api/sistema/parametroModulo.api";
import ParametroModuloListPage from "./ParametroModuloListPage";
import ParametroModuloEditPage from "./ParametroModuloEditPage";

const ParametroModuloIndexPage = () => {
    const usuario = useSelector(state => state.auth.user);
    // const perfil = useSelector(state => state.auth.perfil);
    const perfil = useSelector(state => state.perfil.perfilActual);

    const [parametroModulos, setParametroModulos] = useState([]);
    const [dataRowEditNew, setDataRowEditNew] = useState({});
    const [modoEdicion, setModoEdicion] = useState(false);
    const [titulo, setTitulo] = useState("Listado");
    const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);

    const classesEncabezado = useStylesEncabezado();

    async function agregarParametroModulo(parametroModulo) {
        const {
            IdModulo,
            IdParametro,
            IdSecuencial,
            Valor,
            Descripcion,
            Sp_Antes,
            Sp_Despues,
            EditableModulo,
            Fijo,
            Activo
        } = parametroModulo;

        await crear(
            perfil.IdCliente,
            perfil.IdDivision,
            IdModulo,
            IdParametro,
            IdSecuencial.toUpperCase(),
            Valor.toUpperCase(),
            Descripcion.toUpperCase(),
            Sp_Antes.toUpperCase(),
            Sp_Despues.toUpperCase(),
            EditableModulo,
            Fijo,
            Activo,
            usuario.username
        )
            .then(response => {
                if (response.data) handleSuccessMessages("Se registró con éxito!");
                setModoEdicion(false);
                listarParametroModulos();
            })
            .catch(err => {
                //handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
            });
    }

    async function actualizarParametroModulo(parametroModulo) {
        const {
            IdModulo,
            IdParametro,
            IdSecuencial,
            Valor,
            Descripcion,
            Sp_Antes,
            Sp_Despues,
            EditableModulo,
            Fijo,
            Activo
        } = parametroModulo;

        await actualizar(
            perfil.IdCliente,
            perfil.IdDivision,
            IdModulo,
            IdParametro,
            IdSecuencial.toUpperCase(),
            Valor.toUpperCase(),
            Descripcion.toUpperCase(),
            Sp_Antes.toUpperCase(),
            Sp_Despues.toUpperCase(),
            EditableModulo,
            Fijo,
            Activo,
            usuario.username
        )
            .then(() => {
                handleSuccessMessages("Se actualizó con éxito!");
                setModoEdicion(false);
                listarParametroModulos();
            })
            .catch(err => {
                //handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
            });
    }

    async function eliminarRegistro(parametroModulo) {
        const { IdCliente, IdDivision, IdModulo, IdParametro, IdSecuencial } = parametroModulo;
        await eliminar(IdCliente, IdDivision, IdModulo, IdParametro, IdSecuencial, usuario.username)
            .then(response => {
                handleSuccessMessages("Se eliminó con éxito!");
            })
            .catch(err => {
                //handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
            });
        listarParametroModulos();
    }

    async function listarParametroModulos() {
        let parametroModulos = await listar(perfil.IdCliente, perfil.IdDivision, "%", "%", 0, 0).catch(err => {
            //handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
        setTitulo("Listado");
        setParametroModulos(parametroModulos.data);
    }

    async function obtenerParametroModulo(filtro) {
        const { IdCliente, IdDivision, IdModulo, IdParametro, IdSecuencial } = filtro;
        if (IdCliente && IdDivision && IdModulo && IdParametro && IdSecuencial) {
            let moduloJob = await obtener(IdCliente, IdDivision, IdModulo, IdParametro, IdSecuencial).catch(err => {
                //handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
            });
            setDataRowEditNew({ ...moduloJob.data, esNuevoRegistro: false });
        }
    }

    const nuevoRegistro = () => {
        let parametroModulo = { Activo: "S" };
        setDataRowEditNew({ ...parametroModulo, esNuevoRegistro: true });
        setTitulo("Nuevo");
        setModoEdicion(true);
    };

    const editarRegistro = dataRow => {
        const { IdCliente, IdDivision, IdModulo, IdParametro, IdSecuencial } = dataRow;
        let filtro = {
            IdCliente: IdCliente,
            IdDivision: IdDivision,
            IdModulo: IdModulo,
            IdParametro: IdParametro,
            IdSecuencial: IdSecuencial
        };

        setModoEdicion(true);
        setTitulo("Editar");
        obtenerParametroModulo(filtro);
    };

    const cancelarEdicion = () => {
        setModoEdicion(false);
        setTitulo("Listado");
        setDataRowEditNew({});
    };

    useEffect(() => {
        listarParametroModulos();
    }, []);

    return (
        <>
            <div className="row">
                <div className="col-md-12">
                    <Portlet className={classesEncabezado.border}>
                        <AppBar position="static" className={classesEncabezado.principal}>
                            <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                                <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                                    {"Mantenimiento de módulo parámetro".toUpperCase()}
                                </Typography>
                            </Toolbar>
                        </AppBar>
                        {modoEdicion && (
                            <>
                                <ParametroModuloEditPage
                                    modoEdicion={modoEdicion}
                                    dataRowEditNew={dataRowEditNew}
                                    actualizarParametroModulo={actualizarParametroModulo}
                                    agregarParametroModulo={agregarParametroModulo}
                                    cancelarEdicion={cancelarEdicion}
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
                                        <b> Datos de auditoría </b>
                                    </div>
                                </div>
                                {auditoriaSwitch && <AuditoriaPage dataRowEditNew={dataRowEditNew} />}
                            </>
                        )}
                        {!modoEdicion && (
                            <ParametroModuloListPage
                                parametroModulos={parametroModulos}
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

export default ParametroModuloIndexPage;
