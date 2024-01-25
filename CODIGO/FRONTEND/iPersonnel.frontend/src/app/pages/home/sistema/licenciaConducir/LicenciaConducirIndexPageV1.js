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

import { handleErrorMessages, handleSuccessMessages } from "../../../../store/ducks/notify-messages";
import { useSelector } from "react-redux";

import { obtener, listar, crear, actualizar, eliminar } from "../../../../api/sistema/licenciaConducir.api";
import LicenciaConducirListPage from "./LicenciaConducirListPage";
import LicenciaConducirEditPage from "./LicenciaConducirEditPage";

const LicenciaConducirIndexPage = ({ intl }) => {
    const usuario = useSelector(state => state.auth.user);

    const [licenciasConducir, setLicenciasConducir] = useState([]);

    const [dataRowEditNew, setDataRowEditNew] = useState({});
    const [modoEdicion, setModoEdicion] = useState(false);
    const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
    const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
    const classesEncabezado = useStylesEncabezado();
    const [focusedRowKey, setFocusedRowKey] = useState(1);


    async function agregarLicenciaConducir(licenciaconducir) {
        const { IdPais, IdLicenciaConducir, LicenciaConducir, Activo } = licenciaconducir;

        let params = {
            IdPais: isNotEmpty(IdPais) ? IdPais.toUpperCase() : ""
            , IdLicenciaConducir: isNotEmpty(IdLicenciaConducir) ? IdLicenciaConducir.toUpperCase() : ""
            , LicenciaConducir: isNotEmpty(LicenciaConducir) ? LicenciaConducir.toUpperCase() : ""
            , Activo: Activo
            , IdUsuario: usuario.username
        }
        await crear(params).then(response => {
            if (response)
                handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
            setModoEdicion(false);
            listarLicenciasConducir();
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
    }

    async function actualizarLicenciaConducir(licenciaConducir) {

        const { IdPais, IdLicenciaConducir, LicenciaConducir, Activo } = licenciaConducir;
        let params = {
            IdPais: isNotEmpty(IdPais) ? IdPais.toUpperCase() : ""
            , IdLicenciaConducir: isNotEmpty(IdLicenciaConducir) ? IdLicenciaConducir.toUpperCase() : ""
            , LicenciaConducir: isNotEmpty(LicenciaConducir) ? LicenciaConducir.toUpperCase() : ""
            , Activo: Activo
            , IdUsuario: usuario.username
        }
        await actualizar(params).then(() => {
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
            setModoEdicion(false);
            listarLicenciasConducir();
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
    }

    async function eliminarRegistro(licenciaConducir) {
        const { IdPais, IdLicenciaConducir } = licenciaConducir;

        await eliminar({
            IdPais: IdPais,
            IdLicenciaConducir: IdLicenciaConducir,
            IdUsuario: usuario.username
        }).then(() => {
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
        listarLicenciasConducir();
    }

    async function listarLicenciasConducir() {
        let licenciasConducir = await listar(
            {
                IdLicenciaConducir: "%"
                , LicenciaConducir: "%"
                , NumPagina: 0
                , TamPagina: 0
            }
        );
        setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
        setLicenciasConducir(licenciasConducir);

    }

    async function obtenerLicenciaConducir(filtro) {
        const { IdPais, IdLicenciaConducir } = filtro;
        if (isNotEmpty(IdPais)
            && isNotEmpty(IdLicenciaConducir)) {
            let licenciaConducir = await obtener({
                IdPais: IdPais,
                IdLicenciaConducir: IdLicenciaConducir
            }).catch(err => {
                handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
            });
            setDataRowEditNew({ ...licenciaConducir, esNuevoRegistro: false });
        }
    }

    const nuevoRegistro = () => {
        let licenciaConducir = {
            Activo: "S"
        };
        setDataRowEditNew({ ...licenciaConducir, esNuevoRegistro: true });
        setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
        setModoEdicion(true);
    };

    const editarRegistro = async (dataRow) => {
        setModoEdicion(true);
        setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
        await obtenerLicenciaConducir(dataRow);
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
        listarLicenciasConducir();

    }, []);

    return (
        <>
            <div className="row">
                <div className="col-md-12">
                <CustomBreadcrumbs Title={intl.formatMessage({ id: "SYSTEM" }) + " / " + intl.formatMessage({ id: "COMMON.GENERALS" })} Subtitle={intl.formatMessage({ id: "SYSTEM.LICENSE" })} />

                    <Portlet className={classesEncabezado.border}>
                        <AppBar position="static" className={classesEncabezado.principal}>
                            <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                                <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                                    {intl.formatMessage({ id: "SYSTEM.DRIVERSLICENSE.MAINTENANCE" }).toUpperCase()}
                                </Typography>
                            </Toolbar>
                        </AppBar>
                        {modoEdicion && (
                            <>
                                <LicenciaConducirEditPage
                                    modoEdicion={modoEdicion}
                                    dataRowEditNew={dataRowEditNew}
                                    actualizarLicenciaConducir={actualizarLicenciaConducir}
                                    agregarLicenciaConducir={agregarLicenciaConducir}
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
                                {auditoriaSwitch && (<AuditoriaPage dataRowEditNew={dataRowEditNew} />)}

                            </>
                        )}
                        {!modoEdicion && (
                            <LicenciaConducirListPage
                                licenciasConducir={licenciasConducir}
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

export default injectIntl(LicenciaConducirIndexPage);
