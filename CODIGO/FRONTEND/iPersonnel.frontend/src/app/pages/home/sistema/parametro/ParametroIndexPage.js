import React, { useEffect, useState } from "react";
import { Portlet } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";

import { handleErrorMessages, handleSuccessMessages } from "../../../../store/ducks/notify-messages";
import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";

import { useSelector } from "react-redux";

import {
    eliminar,
    obtener,
    listar,
    crear,
    actualizar
} from "../../../../api/sistema/parametro.api";
import ParametroListPage from "./ParametroListPage";
import ParametroEditPage from "./ParametroEditPage";

const ParametroIndexPage = () => {
    const usuario = useSelector(state => state.auth.user);

    const [parametros, setParametros] = useState([]);
    const [dataRowEditNew, setDataRowEditNew] = useState({});
    const [modoEdicion, setModoEdicion] = useState(false);
    const [titulo, setTitulo] = useState("Listado");
    const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
    const classesEncabezado = useStylesEncabezado();
    const [focusedRowKey, setFocusedRowKey] = useState(1);

    async function agregarParametro(parametro) {

        const { IdModulo, IdParametro, Parametro, Activo } = parametro;

        await crear(
            IdModulo, IdParametro.toUpperCase(), Parametro.toUpperCase(), Activo, usuario.username
        ).then(response => {
            if (response.data) handleSuccessMessages("Se registró con éxito!");
            setModoEdicion(false);
            listarParametros();
        }).catch(err => {
           // handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
    }

    async function actualizarParametro(parametro) {

        const { IdModulo, IdParametro, Parametro, Activo } = parametro;

        await actualizar(
            IdModulo, IdParametro.toUpperCase(), Parametro.toUpperCase(), Activo, usuario.username
        ).then(response => {
            handleSuccessMessages("Se actualizó con éxito!");
            setModoEdicion(false);
            listarParametros();
        }).catch(err => {
           // handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
    }

    async function eliminarRegistro(parametro) {
        const { IdModulo, IdParametro } = parametro;
        await eliminar(IdModulo, IdParametro, usuario.username).then(response => {
            handleSuccessMessages("Se eliminó con éxito!");

        }).catch(err => {
            //handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
        listarParametros();
    }

    async function listarParametros() {
       
            let parametros = await listar('%', 0, 0);
            setTitulo("Listado");
            setParametros(parametros.data);
        
    }

    async function obtenerParametro(filtro) {
        const { IdModulo, IdParametro } = filtro;
        if (IdModulo && IdParametro) {
            let parametro = await obtener(IdModulo, IdParametro);
            setDataRowEditNew({ ...parametro.data, esNuevoRegistro: false });
        }
    }

    const nuevoRegistro = () => {
        let parametro = { Activo: "S" };
        setDataRowEditNew({ ...parametro, esNuevoRegistro: true });
        setTitulo("Nuevo");
        setModoEdicion(true);
    };

    const editarRegistro = dataRow => {
        const { IdModulo, IdParametro } = dataRow;
        let filtro = { IdModulo: IdModulo, IdParametro: IdParametro };
        setModoEdicion(true);
        setTitulo("Editar");       
        obtenerParametro(filtro);
    };

    const cancelarEdicion = () => {
        setModoEdicion(false);
        setTitulo("Listado");
        setDataRowEditNew({});
    };

    const seleccionarRegistro = dataRow => {
        const { RowIndex } = dataRow;
        setFocusedRowKey(RowIndex);
    };

    useEffect(() => {
        listarParametros();
        
    }, []);

    return (
        <>
            <div className="row">
                <div className="col-md-12">
                <Portlet className={classesEncabezado.border}>
                        <AppBar position="static" className={classesEncabezado.principal}>
                            <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                                <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                                      {("Mantenimiento de parámetro").toUpperCase()}
                                </Typography>
                            </Toolbar>
                        </AppBar>
                            {modoEdicion && (
                                <>
                                <ParametroEditPage
                                    modoEdicion={modoEdicion}
                                    dataRowEditNew={dataRowEditNew}
                                    actualizarParametro={actualizarParametro}
                                    agregarParametro={agregarParametro}
                                    cancelarEdicion={cancelarEdicion}
                                    titulo={titulo}
                                />
                                <div className="container_only">
                                    <div className="float-right">
                                        <ControlSwitch checked={auditoriaSwitch}
                                            onChange={e => { setAuditoriaSwitch(e.target.checked) }}
                                        /><b> Datos de auditoría </b>
                                        </div>
                                </div>
                                {auditoriaSwitch && (<AuditoriaPage dataRowEditNew={dataRowEditNew} />)}
                                </>
                            )}
                            {!modoEdicion && (
                                <ParametroListPage
                                    parametros={parametros}
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

export default ParametroIndexPage;
