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
} from "../../../../api/administracion/motivoCese.api";
import MotivoCeseListPage from "./MotivoCeseListPage";
import MotivoCeseEditPage from "./MotivoCeseEditPage";

import CustomBreadcrumbs from "../../../../partials/layout/CustomBreadcrumbs";

import { injectIntl } from "react-intl"; //Multi-idioma

const MotivoCeseIndexPage = (props) => {
 
    const { intl } = props;

    const usuario = useSelector(state => state.auth.user);
    const perfil = useSelector(state => state.perfil.perfilActual);

    const [motivoCeseData, setMotivoCeseData] = useState([]);

    const [dataRowEditNew, setDataRowEditNew] = useState({});
    const [modoEdicion, setModoEdicion] = useState(false);
    const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
    const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
    const classesEncabezado = useStylesEncabezado();
    const [focusedRowKey, setFocusedRowKey] = useState();

    async function agregarMotivoCese(dataRow) {

        const { IdMotivoCese, MotivoCese, Activo } = dataRow;
        let params = {
              IdCliente: perfil.IdCliente
            , IdMotivoCese: IdMotivoCese.toUpperCase()
            , MotivoCese: MotivoCese.toUpperCase()
            , Activo: Activo
            , IdUsuario: usuario.username
        }
        await crear(params).then(response => {
            if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
            setModoEdicion(false);
            listarMotivoCese();
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
    }

    async function actualizarMotivoCese(dataRow) {

        const { IdMotivoCese, MotivoCese, Activo } = dataRow;
        let params = {
              IdCliente: perfil.IdCliente
            , IdMotivoCese: IdMotivoCese.toUpperCase()
            , MotivoCese: MotivoCese.toUpperCase()
            , Activo: Activo
            , IdUsuario: usuario.username
        }
        await actualizar(params).then(response => {
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
            setModoEdicion(false);
            listarMotivoCese();
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
    }

    async function eliminarRegistro(dataRow) {
        const { IdMotivoCese } = dataRow;

        await eliminar({ 
              IdCliente: perfil.IdCliente
            , IdMotivoCese: IdMotivoCese
        }).then(response => {
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
        listarMotivoCese();
    }

    async function listarMotivoCese() {

        let MotivoCese = await listar(
            {
                  IdCliente: perfil.IdCliente
                , NumPagina: 0
                , TamPagina: 0
            }
        );
        setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
        setMotivoCeseData(MotivoCese);
    }

    async function obtenerMotivoCese(idMotivoCese) {
        if (idMotivoCese) {
            let MotivoCese = await obtener({ 
                  IdCliente: perfil.IdCliente
                , IdMotivoCese: idMotivoCese 
            });
            setDataRowEditNew({ ...MotivoCese, esNuevoRegistro: false });
        }
    }

    const nuevoRegistro = () => {
        let MotivoCese = { Activo: "S" };
        setDataRowEditNew({ ...MotivoCese, esNuevoRegistro: true });
        setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
        setModoEdicion(true);
    };

    const editarRegistro = dataRow => {
        const { IdMotivoCese, RowIndex } = dataRow;
        setModoEdicion(true);
        setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
        obtenerMotivoCese(IdMotivoCese);
        setFocusedRowKey(RowIndex);
    };

    const cancelarEdicion = () => {
        setModoEdicion(false);
        setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
        setDataRowEditNew({});
    };

    const seleccionarRegistro = dataRow => {
        const { RowIndex } = dataRow;
        setFocusedRowKey(RowIndex);
    };

    useEffect(() => {
        listarMotivoCese();
    }, []);

    return (
        <>
            <div className="row">
                <div className="col-md-12">
                    <Portlet className={classesEncabezado.border}>
                    <CustomBreadcrumbs Title={intl.formatMessage({ id: "ADMINISTRATION.REASONCESSATION.PATHNAME" })} />

                        <AppBar position="static" className={classesEncabezado.principal}>
                            <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                                <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                                    {intl.formatMessage({ id: "ADMINISTRATION.REASONCEASE.MAINTENANCE" })}
                                    
                                </Typography>
                            </Toolbar>
                        </AppBar>
                        {modoEdicion && (
                            <>
                                <MotivoCeseEditPage
                                    modoEdicion={modoEdicion}
                                    dataRowEditNew={dataRowEditNew}
                                    actualizarMotivoCese={actualizarMotivoCese}
                                    agregarMotivoCese={agregarMotivoCese}
                                    cancelarEdicion={cancelarEdicion}
                                    titulo={titulo}
                                />
                                <div className="container_only">
                                    <div className="float-right">
                                        <ControlSwitch checked={auditoriaSwitch}
                                            onChange={e => { setAuditoriaSwitch(e.target.checked) }}
                                        /><b> {intl.formatMessage({ id: "AUDIT.DATA" })}  </b>
                                        </div>
                                </div>
                                {auditoriaSwitch && (<AuditoriaPage dataRowEditNew={dataRowEditNew} />)}

                            </>
                        )}
                        {!modoEdicion && (
                            <MotivoCeseListPage
                                motivoCeseData={motivoCeseData}
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
 
export default injectIntl(MotivoCeseIndexPage);
