import React, { useEffect, useState } from "react";
import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";
import { Portlet } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";

import { handleErrorMessages, handleSuccessMessages } from "../../../../store/ducks/notify-messages";
import { useSelector } from "react-redux";


import {
    obtenerTodos as listarPaises,
} from "../../../../api/sistema/pais.api";

import {
    obtener,
    listar,
    crear,
    actualizar,
    eliminar,
} from "../../../../api/administracion/ubigeo.api";
import UbigeoListPage from "./UbigeoListPage";
import UbigeoEditPage from "./UbigeoEditPage";
import { injectIntl } from "react-intl"; //Multi-idioma
import CustomBreadcrumbs from "../../../../partials/layout/CustomBreadcrumbs";


const UbigeoIndexPage = (props) => {
    const usuario = useSelector(state => state.auth.user);

    const { intl } = props;

    const [ubigeos, setUbigeos] = useState([]);
    const [paisData, setPaisData] = useState([]);
    const [focusedRowKey, setFocusedRowKey] = useState(1);
    const [dataRowEditNew, setDataRowEditNew] = useState({});
    const [modoEdicion, setModoEdicion] = useState(false);
    const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
    const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
    const classesEncabezado = useStylesEncabezado();


    async function agregarUbigeo(dataRow) {

        const { IdUbigeo, IdPais,Departamento,Provincia, Distrito, Activo } = dataRow;
        let params = {
              IdUbigeo: IdUbigeo.toUpperCase()
            , IdPais: IdPais.toUpperCase()
            , Departamento: Departamento.toUpperCase()
            , Provincia: Provincia.toUpperCase()
            , Distrito: Distrito.toUpperCase()
            , Activo: Activo
            , IdUsuario: usuario.username
        };
        await crear(params).then(response => {
            if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
            setModoEdicion(false);
            listarUbigeo();
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
    }

    async function actualizarUbigeo(dataRow) {

        const { IdUbigeo, IdPais,Departamento,Provincia, Distrito, Activo } = dataRow;
        let params = {
            IdUbigeo: IdUbigeo.toUpperCase()
            , IdPais: IdPais.toUpperCase()
            , Departamento: Departamento.toUpperCase()
            , Provincia: Provincia.toUpperCase()
            , Distrito: Distrito.toUpperCase()
            , Activo: Activo
            , IdUsuario: usuario.username
        };
        await actualizar(params).then(() => {
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
            setModoEdicion(false);
            listarUbigeo();
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
    }

    async function eliminarRegistro(dataRow) {
        const { IdUbigeo } = dataRow;
        await eliminar({ IdUbigeo: IdUbigeo, IdUsuario: usuario.username }).then(response => {
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
        listarUbigeo();
    }



    async function obtenerUbigeo(idUbigeo) {
        if (idUbigeo) {
            let ubigeo = await obtener({ IdUbigeo: idUbigeo }).catch(err => {
                handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
            });;
            setDataRowEditNew({ ...ubigeo, esNuevoRegistro: false });
        }
    }


    const nuevoRegistro = () => {
        let ubigeo = { Activo: "S" };
        setDataRowEditNew({ ...ubigeo, esNuevoRegistro: true });
        setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
        setModoEdicion(true);
    };

    const seleccionarRegistro = dataRow => {
        const { RowIndex } = dataRow;
        setFocusedRowKey(RowIndex);
    };

    const editarRegistro = dataRow => {
        const { IdUbigeo, RowIndex } = dataRow;
        setModoEdicion(true);
        setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
        obtenerUbigeo(IdUbigeo);
        setFocusedRowKey(RowIndex);
    };

    const cancelarEdicion = () => {
        setModoEdicion(false);
        setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
        setDataRowEditNew({});
    };

    async function listarUbigeo() {
        let ubigeos = await listar({ NumPagina: 0, TamPagina: 0 }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
        setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
        setUbigeos(ubigeos);
    }

    async function listarPais() {
        let pais = await listarPaises().catch(err => {handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);});
        setPaisData(pais);
    }

    useEffect(() => {
        listarUbigeo();
        listarPais();
    }, []);

    return (
        <>
            <div className="row">
                <div className="col-md-12">
                    <Portlet >
                    <CustomBreadcrumbs Title={intl.formatMessage({ id: "ADMINISTRATION.UBIGEO.PATHNAME" })} />

                        <AppBar position="static" className={classesEncabezado.principal}>
                            <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                                <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                                    {intl.formatMessage({ id: "ADMINISTRATION.UBIGEO.MAINTENANCE" })}
                                </Typography>
                            </Toolbar>
                        </AppBar>
                        {modoEdicion && (
                            <>
                                <UbigeoEditPage
                                    modoEdicion={modoEdicion}
                                    dataRowEditNew={dataRowEditNew}
                                    actualizarUbigeo={actualizarUbigeo}
                                    agregarUbigeo={agregarUbigeo}
                                    cancelarEdicion={cancelarEdicion}
                                    titulo={titulo}
                                    paisData = { paisData }
                                />
                                <div className="container_only">
                                    <div className="float-right">
                                        <ControlSwitch checked={auditoriaSwitch}
                                            onChange={e => { setAuditoriaSwitch(e.target.checked) }}
                                        /> {intl.formatMessage({ id: "AUDIT.DATA" })}  </div>
                                </div>
                                {auditoriaSwitch && (<AuditoriaPage dataRowEditNew={dataRowEditNew} />)}

                            </>
                        )}
                        {!modoEdicion && (
                            <UbigeoListPage
                                ubigeos={ubigeos}
                                editarRegistro={editarRegistro}
                                eliminarRegistro={eliminarRegistro}
                                nuevoRegistro={nuevoRegistro}
                                seleccionarRegistro = { seleccionarRegistro }
                                focusedRowKey = { focusedRowKey }
                            />
                        )}

                    </Portlet>
                </div>
            </div>
        </>
    );
};

export default injectIntl(UbigeoIndexPage);
