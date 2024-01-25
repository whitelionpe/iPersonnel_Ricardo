import React, { useEffect, useState } from "react";
import { Portlet } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";

import { handleErrorMessages, handleSuccessMessages } from "../../../../store/ducks/notify-messages";
import { useSelector } from "react-redux";

import {
    eliminar,
    obtener,
    listar,
    crear,
    actualizar, listarCrud
} from "../../../../api/sistema/divisionModuloRegla.api";
import DivisionModuloReglaListPage from "./divisionModuloReglaListPage";
import DivisionModuloReglaEditPage from "./divisionModuloReglaEditPage";

const DivisionModuloReglaIndexPage = () => {
    const usuario = useSelector(state => state.auth.user);

    const [reglaModulos, setReglaModulos] = useState([]);
    const [dataRowEditNew, setDataRowEditNew] = useState({});
    const [modoEdicion, setModoEdicion] = useState(false);
    const [titulo, setTitulo] = useState("Listado");
    const classesEncabezado = useStylesEncabezado();

    async function agregarReglaModulo(reglaModulo) {

        const {
            IdCliente,
            IdDivision,
            IdModulo,
            IdRegla,
            Activo,
            Nombre_Procedimiento } = reglaModulo;

        await crear(
            IdCliente
            , IdDivision
            , IdModulo
            , IdRegla
            , Activo
            , Nombre_Procedimiento.toUpperCase()
            , usuario.username
        ).then(response => {
            if (response.data) handleSuccessMessages("Se registró con éxito!");
            setModoEdicion(false);
            listarReglaModulos();
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
    }

    async function actualizarReglaModulo(reglaModulo) {

        const {
            IdCliente,
            IdDivision,
            IdModulo,
            IdRegla,
            Activo,
            Nombre_Procedimiento } = reglaModulo;

        await actualizar(
            IdCliente
            , IdDivision
            , IdModulo
            , IdRegla
            , Activo
            , Nombre_Procedimiento.toUpperCase()
            , usuario.username
        ).then(response => {
            handleSuccessMessages("Se actualizó con éxito!");
            setModoEdicion(false);
            listarReglaModulos();
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
    }

    async function eliminarRegistro(reglaModulo) {
        const {
            IdCliente,
            IdDivision,
            IdModulo,
            IdRegla } = reglaModulo;

        await eliminar(IdCliente, IdDivision, IdModulo, IdRegla, usuario.username).then(response => {
            handleSuccessMessages("Se eliminó con éxito!");

        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
        listarReglaModulos();
    }

    async function listarReglaModulos() {

        let reglaModulos = await listar('%', '%', '%', '%', 0, 0);
        setTitulo("Listado");
        setReglaModulos(reglaModulos.data);

    }

    async function obtenerReglaModulo(filtro) {

        const { IdCliente, IdDivision, IdModulo, IdRegla } = filtro;
        if (IdCliente) {
            let reglaModulo = await obtener(IdCliente, IdDivision, IdModulo, IdRegla);
            let reglaModuloCrud = await listarCrud(IdCliente, IdDivision, 0, 0);
            setDataRowEditNew({ ...reglaModulo.data, esNuevoRegistro: false, listarCrud: [...reglaModuloCrud.data] });
        }
    }

    const nuevoRegistro = () => {
        let reglaModulo = { Activo: "S" };
        setDataRowEditNew({ ...reglaModulo, esNuevoRegistro: true });
        setTitulo("Nuevo");
        setModoEdicion(true);

    };

    const editarRegistro = dataRow => {
        const { IdCliente, IdDivision, IdModulo, IdRegla } = dataRow;
        let filtro = { IdCliente: IdCliente, IdDivision: IdDivision, IdModulo: IdModulo, IdRegla: IdRegla }
        setModoEdicion(true);
        setTitulo("Editar");
        obtenerReglaModulo(filtro);

    };

    const cancelarEdicion = () => {
        setModoEdicion(false);
        setTitulo("Listado");
        setDataRowEditNew({});
    };

    useEffect(() => {

        listarReglaModulos();

    }, []);

    return (
        <>

            <div className="row">
                <div className="col-md-12">
                    <Portlet className={classesEncabezado.border}>
                        <AppBar position="static" className={classesEncabezado.principal}>
                            <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                                <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                                    {("Mantenimiento módulo regla").toUpperCase()}
                                </Typography>
                            </Toolbar>
                        </AppBar>

                        {modoEdicion && (
                            <DivisionModuloReglaEditPage
                                modoEdicion={modoEdicion}
                                dataRowEditNew={dataRowEditNew}
                                actualizarReglaModulo={actualizarReglaModulo}
                                agregarReglaModulo={agregarReglaModulo}
                                cancelarEdicion={cancelarEdicion}
                                titulo={titulo}
                            />
                        )}
                        {!modoEdicion && (
                            <DivisionModuloReglaListPage
                                reglaModulos={reglaModulos}
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



export default DivisionModuloReglaIndexPage;
