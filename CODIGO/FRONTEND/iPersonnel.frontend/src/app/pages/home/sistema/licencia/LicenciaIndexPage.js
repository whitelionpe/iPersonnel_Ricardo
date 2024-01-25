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
    listar,
    obtener,
    eliminar,
    crear,
    actualizar
} from "../../../../api/sistema/licencia.api";
import LicenciaListPage from "./LicenciaListPage";
import LicenciaEditPage from "./LicenciaEditPage";

const LicenciaIndexPage = () => {
    const usuario = useSelector(state => state.auth.user);

    const [licencias, setLicencias] = useState([]);
    const [dataRowEditNew, setDataRowEditNew] = useState({});
    const [modoEdicion, setModoEdicion] = useState(false);
    const [titulo, setTitulo] = useState("Listado");
    const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
    const classesEncabezado = useStylesEncabezado();


    async function agregarLicencia(licencia) {

        const { IdModulo, IdCliente, Licencia, FechaFin, Clave, Activo } = licencia;
        let params = {
            IdModulo: IdModulo
            , IdCliente: IdCliente
            , Licencia: Licencia
            , FechaFin: FechaFin
            , Clave: Clave
            , Activo: Activo
            , IdUsuario: usuario.username
        };
        await crear(params).then(response => {
            if (response) handleSuccessMessages("Se registró con éxito!");
            setModoEdicion(false);
            listarLicencias();
        }).catch(err => {
           // handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });

    }

    async function actualizarLicencia(licencia) {

        const { IdModulo, IdCliente, Licencia, FechaFin, Clave, Activo } = licencia;
        let params = {
            IdModulo: IdModulo
            , IdCliente: IdCliente
            , Licencia: Licencia
            , FechaFin: FechaFin
            , Clave: Clave
            , Activo: Activo
            , IdUsuario: usuario.username
        };
        await actualizar(params).then(response => {
            handleSuccessMessages("Se actualizó con éxito!");
            setModoEdicion(false);
            listarLicencias();
        }).catch(err => {
            //handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
    }

    async function eliminarRegistro(licencia) {
        const { IdCliente, IdModulo } = licencia;
        await eliminar({ IdModulo: IdModulo, IdCliente: IdCliente, IdUsuario: usuario.username }).then(response => {
            handleSuccessMessages("Se eliminó con éxito!");
        }).catch(err => {
            //handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
        listarLicencias();
    }
    async function listarLicencias() {

        let licencias = await listar({
            IdModulo: "%"
            , IdCliente: "%"
            , NumPagina: 0
            , TamPagina: 0
        });
        setTitulo("Listado");
        setLicencias(licencias);
    }

    async function obtenerLicencia(filtro) {
        const { IdModulo, IdCliente } = filtro;
        if (IdModulo && IdCliente) {
            let licencia = await obtener({ IdModulo: IdModulo, IdCliente: IdCliente });
            setDataRowEditNew({ ...licencia, esNuevoRegistro: false });
        }
    }

    const nuevoRegistro = () => {
        let licencia = { Activo: "S" };
        setDataRowEditNew({ ...licencia, esNuevoRegistro: true });
        setTitulo("Nuevo");
        setModoEdicion(true);
    };

    const editarRegistro = dataRow => {
        const { IdModulo, IdCliente } = dataRow;
        let filtro = { IdModulo: IdModulo, IdCliente: IdCliente };
        setModoEdicion(true);
        setTitulo("Editar");
        obtenerLicencia(filtro);
    };

    const cancelarEdicion = () => {
        setModoEdicion(false);
        setTitulo("Listado");
        setDataRowEditNew({});
    };


    useEffect(() => {
        listarLicencias();

    }, []);

    return (
        <>
            <div className="row">
                <div className="col-md-12">
                    <Portlet className={classesEncabezado.border}>
                        <AppBar position="static" className={classesEncabezado.principal}>
                            <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                                <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                                    {("Mantenimiento de licencia").toUpperCase()}
                                </Typography>
                            </Toolbar>
                        </AppBar>
                        {modoEdicion && (
                            <>
                                <LicenciaEditPage
                                    modoEdicion={modoEdicion}
                                    dataRowEditNew={dataRowEditNew}
                                    actualizarLicencia={actualizarLicencia}
                                    agregarLicencia={agregarLicencia}
                                    cancelarEdicion={cancelarEdicion}
                                    titulo={titulo}
                                />
                                <div className="container_only">
                                    <div className="float-right">
                                        <ControlSwitch checked={auditoriaSwitch}
                                            onChange={e => { setAuditoriaSwitch(e.target.checked) }}
                                        /><b> Datos de auditoría</b>
                                    </div>
                                </div>
                                {auditoriaSwitch && (<AuditoriaPage dataRowEditNew={dataRowEditNew} />)}
                            </>
                        )}
                        {!modoEdicion && (
                            <LicenciaListPage
                                licencias={licencias}
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

export default LicenciaIndexPage;
