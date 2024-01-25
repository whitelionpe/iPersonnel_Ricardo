import React, { useEffect, useState } from "react";
import { Portlet } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import CustomBreadcrumbs from "../../../../partials/layout/CustomBreadcrumbs";
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
} from "../../../../api/campamento/tipoCama.api";
import TipoCamaListPage from "./TipoCamaListPage";
import TipoCamaEditPage from "./TipoCamaEditPage";

import { injectIntl } from "react-intl"; 

const TipoCamaIndexPage = (props) => {
 
    const { intl } = props;

    const usuario = useSelector(state => state.auth.user);
    const perfil = useSelector(state => state.perfil.perfilActual);

    const [tipoCamaData, setTipoCamaData] = useState([]);

    const [dataRowEditNew, setDataRowEditNew] = useState({});
    const [modoEdicion, setModoEdicion] = useState(false);
    const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
    const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
    const classesEncabezado = useStylesEncabezado();
    const [focusedRowKey, setFocusedRowKey] = useState();

    async function agregarTipoCama(dataRow) {

        const { IdTipoCama, TipoCama, Activo } = dataRow;
        let params = {
              IdCliente: perfil.IdCliente
            , IdDivision: perfil.IdDivision
            , IdTipoCama: IdTipoCama.toUpperCase()
            , TipoCama: TipoCama.toUpperCase()
            , Activo: Activo
            , IdUsuario: usuario.username
        }
        await crear(params).then(response => {
            if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
            setModoEdicion(false);
            listarTipoCama();
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
    }

    async function actualizarTipoCama(dataRow) {

        const { IdTipoCama, TipoCama, Activo } = dataRow;
        let params = {
              IdCliente: perfil.IdCliente
            , IdDivision: perfil.IdDivision
            , IdTipoCama: IdTipoCama.toUpperCase()
            , TipoCama: TipoCama.toUpperCase()
            , Activo: Activo
            , IdUsuario: usuario.username
        }
        await actualizar(params).then(response => {
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
            setModoEdicion(false);
            listarTipoCama();
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
    }

    async function eliminarRegistro(dataRow) {
        const { IdTipoCama } = dataRow;

        await eliminar({ 
              IdCliente: perfil.IdCliente
            , IdDivision: perfil.IdDivision
            , IdTipoCama: IdTipoCama
        }).then(response => {
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        });
        listarTipoCama();
    }

    async function listarTipoCama() {

        let TipoCama = await listar(
            {
                  IdCliente: perfil.IdCliente
                , IdDivision: perfil.IdDivision
                , NumPagina: 0
                , TamPagina: 0
            }
        );
        setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
        setTipoCamaData(TipoCama);
    }

    async function obtenerTipoCama(idTipoCama) {
        if (idTipoCama) {
            let TipoCama = await obtener({ 
                  IdCliente: perfil.IdCliente
                , IdDivision: perfil.IdDivision
                , IdTipoCama: idTipoCama 
            });
            setDataRowEditNew({ ...TipoCama, esNuevoRegistro: false });
        }
    }

    const nuevoRegistro = () => {
        let TipoCama = { Activo: "S" };
        setDataRowEditNew({ ...TipoCama, esNuevoRegistro: true });
        setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
        setModoEdicion(true);
    };

    const editarRegistro = dataRow => {
        const { IdTipoCama, RowIndex } = dataRow;
        setModoEdicion(true);
        setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
        obtenerTipoCama(IdTipoCama);
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
        listarTipoCama();
    }, []);

    return (
        <>
            <div className="row">
                <div className="col-md-12">
                <CustomBreadcrumbs Title={intl.formatMessage({ id: "CAMP.BEDTYPE.MENU" })} SubMenu={intl.formatMessage({ id: "CAMP.BEDTYPE.SUBMENU" })} Subtitle={intl.formatMessage({ id: "CAMP.BEDTYPE.SUBTITLE" })} />
                    <Portlet className={classesEncabezado.border}>
                        <AppBar position="static" className={classesEncabezado.principal}>
                            <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                                <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                                    {intl.formatMessage({ id: "CAMP.BEDTYPE.MAINTENANCE" })}
                                    
                                </Typography>
                            </Toolbar>
                        </AppBar>
                        {modoEdicion && (
                            <>
                                <TipoCamaEditPage
                                    modoEdicion={modoEdicion}
                                    dataRowEditNew={dataRowEditNew}
                                    actualizarTipoCama={actualizarTipoCama}
                                    agregarTipoCama={agregarTipoCama}
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
                            <TipoCamaListPage
                            tipoCamaData={tipoCamaData}
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
 
export default injectIntl(TipoCamaIndexPage);
