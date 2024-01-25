import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { Portlet } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";

import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";
import { handleErrorMessages, handleSuccessMessages } from "../../../../store/ducks/notify-messages";
import { useSelector } from "react-redux";
import CustomBreadcrumbs from "../../../../partials/layout/CustomBreadcrumbs";

import { eliminar, obtener, listar, crear, actualizar } from "../../../../api/administracion/centroCosto.api";
import CentroCostoListPage from "./CentroCostoListPage";
import CentroCostoEditPage from "./CentroCostoEditPage";

const CentroCostoIndexPage = ({ intl }) => {
    const usuario = useSelector(state => state.auth.user);
    const perfil = useSelector(state => state.perfil.perfilActual);

    const [centroCostos, setCentroCostos] = useState([]);
    const [dataRowEditNew, setDataRowEditNew] = useState({});
    const [modoEdicion, setModoEdicion] = useState(false);
    const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
    const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
    const classesEncabezado = useStylesEncabezado();
    const [focusedRowKey, setFocusedRowKey] = useState(1);

    async function agregarCentroCosto(centroCosto) {
        const { IdCentroCosto, CentroCosto, Activo } = centroCosto;
        let param = {
            IdCentroCosto: IdCentroCosto.toUpperCase(),
            CentroCosto: CentroCosto.toUpperCase(),
            IdCliente: perfil.IdCliente,
            //IdDivision: perfil.IdDivision,
            Activo: Activo,
            IdUsuario: usuario.username
        };
        await crear(param)
            .then(response => {
                if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
                setModoEdicion(false);
                listarCentroCostos();
            })
            .catch(err => {
                handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
            });
    }

    async function actualizarCentroCosto(centroCosto) {
        const { IdCentroCosto, CentroCosto, Activo } = centroCosto;
        let params = {
            IdCentroCosto: IdCentroCosto.toUpperCase(),
            CentroCosto: CentroCosto.toUpperCase(),
            IdCliente: perfil.IdCliente,
            //IdDivision: perfil.IdDivision,
            Activo: Activo,
            IdUsuario: usuario.username
        };
        await actualizar(params)
            .then(response => {
                handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
                setModoEdicion(false);
                listarCentroCostos();
            })
            .catch(err => {
                handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
            });
    }

    async function eliminarRegistro(centroCosto) {
        const { IdCentroCosto, IdCliente } = centroCosto;
        await eliminar({
            IdCentroCosto: IdCentroCosto,
            IdCliente: IdCliente,
            //IdDivision: IdDivision,
            IdUsuario: usuario.username
        })
            .then(response => {
                handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
            })
            .catch(err => {
                handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
            });
        listarCentroCostos();
    }

    async function listarCentroCostos() {
        let centroCostos = await listar({
            IdCliente: perfil.IdCliente,
            //IdDivision: perfil.IdDivision,
            NumPagina: 0,
            TamPagina: 0
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
        setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
        setCentroCostos(centroCostos);
    }

    async function obtenerCentroCosto(filtro) {
        const { IdCentroCosto, IdCliente } = filtro;
        if (IdCentroCosto && IdCliente) {
            let centroCosto = await obtener({
                IdCentroCosto: IdCentroCosto,
                IdCliente: IdCliente,
                //IdDivision: IdDivision
            }).catch(err => {
                handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
            });
            setDataRowEditNew({ ...centroCosto, esNuevoRegistro: false });
        }
    }

    const nuevoRegistro = () => {
        let centroCosto = { Activo: "S" };
        setDataRowEditNew({ ...centroCosto, esNuevoRegistro: true });
        setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
        setModoEdicion(true);
    };

    const editarRegistro = dataRow => {
        setModoEdicion(true);
        setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
        obtenerCentroCosto(dataRow);
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
        listarCentroCostos();
    }, []);

    return (
        <>
            <div className="row">
                <div className="col-md-12">
                <CustomBreadcrumbs Title={intl.formatMessage({ id: "ADMINISTRATION.COSTCENTER.MENU" })} SubMenu={intl.formatMessage({ id: "ADMINISTRATION.COSTCENTER.SUBMENU" })}  Subtitle={intl.formatMessage({ id: "ADMINISTRATION.COSTCENTER.COSTCENTER" })} />
                    <Portlet className={classesEncabezado.border}>
                        <AppBar position="static" className={classesEncabezado.principal}>
                            <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                                <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                                {intl.formatMessage({ id: "ADMINISTRATION.COSTCENTER.MAINTENANCE" }).toUpperCase()}
                                </Typography>
                            </Toolbar>
                        </AppBar>
                        {modoEdicion && (
                            <>
                                <CentroCostoEditPage
                                    modoEdicion={modoEdicion}
                                    dataRowEditNew={dataRowEditNew}
                                    actualizarCentroCosto={actualizarCentroCosto}
                                    agregarCentroCosto={agregarCentroCosto}
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
                                       <b> {intl.formatMessage({ id: "AUDIT.DATA" })}</b>
                                    </div>
                                </div>
                                {auditoriaSwitch && <AuditoriaPage dataRowEditNew={dataRowEditNew} />}
                            </>
                        )}
                        {!modoEdicion && (
                            <CentroCostoListPage
                                centroCostos={centroCostos}
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

export default injectIntl (CentroCostoIndexPage);
