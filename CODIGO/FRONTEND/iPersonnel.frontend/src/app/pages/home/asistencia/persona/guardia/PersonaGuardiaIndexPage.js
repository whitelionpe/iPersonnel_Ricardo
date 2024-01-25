
import React, { useState } from "react";
import { injectIntl } from "react-intl";
import WithLoandingPanel from "../../../../../partials/content/withLoandingPanel";

import { useSelector } from "react-redux";
import { useStylesTab } from "../../../../../store/config/Styles";
import DataSource from "devextreme/data/data_source";
import ArrayStore from "devextreme/data/array_store";
import PersonaGuardiaEditPage from "./PersonaGuardiaEditPage";
import PersonaGuardiaListPage from "./PersonaGuardiaListPage";
import { handleErrorMessages, handleInfoMessages, handleSuccessMessages } from "../../../../../store/ducks/notify-messages";
import { dateFormat, isNotEmpty } from "../../../../../../_metronic";

import { servicePersona } from "../../../../../api/administracion/persona.api";

import { obtenerTodos as obtenerTodosGuardia, obtener as obtenerGuardia, } from "../../../../../api/administracion/regimenGuardia.api";
import {
    crear as crear_PersonaGuardia,
    actualizar as actualizar_PersonaGuardia,
    eliminar as eliminarPersonaGuardia
} from "../../../../../api/administracion/personaRegimen.api";
import Confirm from "../../../../../partials/components/Confirm";
//  "../../../../../api/administracion/personaRegimen.api";

export const initialFilter = {
    IdCliente: '',
    IdPersona: '',
    FechaInicio: new Date(),
    FechaFin: new Date(),
    Activo: 'S'
};

const PersonaGuardiaIndexPage = (props) => {

    const usuario = useSelector(state => state.auth.user);
    const { IdDivision, IdCliente } = useSelector(state => state.perfil.perfilActual);
    const perfil = useSelector(state => state.perfil.perfilActual);
    const { intl, setLoading, settingDataField, getInfo, accessButton, varIdPersona, IdModulo, selectedIndex, dataMenu } = props;

    const [modoEdicion, setModoEdicion] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [tituloTabs, setTituloTabs] = useState(intl.formatMessage({ id: "ACTION.EDIT" }));
    const [isFirstDataLoad, setIsFirstDataLoad] = useState(true);
    const [refreshData, setRefreshData] = useState(false);
    const [dataRowEditNew, setDataRowEditNew] = useState({});
    const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));

    const classes = useStylesTab();
    const [instance, setInstance] = useState({});
    const ds = new DataSource({ store: new ArrayStore({ data: [], key: 'RowIndex' }), reshapeOnPush: false });
    const [dataSource] = useState(ds);
    const refresh = () => dataSource.refresh();
    const resetLoadOptions = () => dataSource.resetLoadOptions();
    const [selected, setSelected] = useState({});

    const [modeView, setModeView] = useState(false);
    const [focusedRowKey, setFocusedRowKey] = useState();

    const [isVisibleConfirm, setIsVisibleConfirm] = useState(false);

    const [fechasContrato, setFechasContrato] = useState({ FechaInicioContrato: null, FechaFinContrato: null });
    //---------------------------------------------------

    const seleccionar = async (dataRow) => {
        const { RowIndex } = dataRow;
        setSelected(dataRow);
        if (RowIndex !== focusedRowKey) {
            setFocusedRowKey(RowIndex);
        }
    }

    const verRegistro = async (dataRow) => {
        setDataRowEditNew({});
        setModeView(true);
        setTituloTabs(intl.formatMessage({ id: "ACTION.VIEW" }));
        //LSF-202031009-Comentado por pendiente
        console.log("verRegistro = async (dataRow) => ", dataRow);
        // await obtener(dataRow);
        setModoEdicion(true);
    };

    const cancelarEdicionMarcacion = () => {
        setModoEdicion(false);
        setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
        setDataRowEditNew({});
        setFocusedRowKey();
        setSelected({});
    };

    const limpiarOperacion = () => {
        setModoEdicion(false);
        setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
        setDataRowEditNew({});
        setFocusedRowKey();
        setSelected({});
    }

    const nuevoRegistroGuardia = async () => {
        let hoy = new Date();
        let fecInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        let fecFin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 1);
        fecFin = fecFin.setMinutes(-1);
        let nuevo = { Activo: "S", FechaInicio: fecInicio, FechaFin: fecFin };
        cargarPeriodo();
        setDataRowEditNew({
            ...nuevo, esNuevoRegistro: true //, currentUsers
        });
        setModoEdicion(true);
    };

    const editarRegistro =async( dataRow) => {
        const { RowIndex } = dataRow;
        setModoEdicion(true);
        cargarPeriodo();
        setDataRowEditNew({ ...dataRow, esNuevoRegistro: false });
        setFocusedRowKey(RowIndex);
    };

    const agregarPersonaGuardia = async (data) => {
        setLoading(true);
        const { IdPersona, FechaInicio, FechaFin, IdRegimen, IdGuardia, Activo } = data;
        let params = {
            IdPersona: isNotEmpty(varIdPersona) ? varIdPersona : 0
            , IdRegimen: IdRegimen
            , IdGuardia
            , FechaInicio: isNotEmpty(FechaInicio) ? dateFormat(FechaInicio, 'yyyyMMdd') : ""
            , FechaFin: isNotEmpty(FechaFin) ? dateFormat(FechaFin, 'yyyyMMdd') : ""
            , Activo: Activo
            , IdCliente: perfil.IdCliente
            , IdDivision: perfil.IdDivision
            , IdUsuario: usuario.username
            , IdSecuencial: 0
        };
        await crear_PersonaGuardia(params)
            .then(response => {
                handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
                setRefreshData(true);
                limpiarOperacion();
            }).catch(err => {
                handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
            }).finally(() => { setLoading(false); });
    };

    const actualizarPersonaGuardia = async (data) => {
        setLoading(true);
        console.log("***actualizarPersonaGuardia()***", data);
        const { IdPersona, FechaInicio, FechaFin, IdRegimen, IdGuardia, Activo, IdSecuencial } = data;
        let params = {
            IdPersona: isNotEmpty(varIdPersona) ? varIdPersona : 0
            , IdRegimen
            , IdGuardia
            , FechaInicio: isNotEmpty(FechaInicio) ? dateFormat(FechaInicio, 'yyyyMMdd') : ""
            , FechaFin: isNotEmpty(FechaFin) ? dateFormat(FechaFin, 'yyyyMMdd') : ""
            , Activo: Activo
            , IdCliente: perfil.IdCliente
            , IdDivision: perfil.IdDivision
            , IdUsuario: usuario.username
            , IdSecuencial: IdSecuencial
        };
        await actualizar_PersonaGuardia(params)
            .then(response => {
                handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
                setRefreshData(true);
                limpiarOperacion();
            }).catch(err => {
                handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
            }).finally(() => { setLoading(false); });
    };

    async function eliminarPersonaRegimen(personaRegimen, confirm = false) {
        setSelected(personaRegimen);
        setIsVisibleConfirm(true);
        if (confirm) {
            setLoading(true);
            const { IdCliente, IdSecuencial, IdPersona } = personaRegimen;
            await eliminarPersonaGuardia({
                IdCliente: IdCliente,
                //IdDivision: IdDivision,
                IdSecuencial,
                IdPersona: IdPersona,
                IdUsuario: usuario.username
            })
                .then(() => {
                    handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
                    setRefreshData(true);
                    limpiarOperacion();
                })
                .catch(err => {
                    handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
                }).finally(() => { setLoading(false); });

        }
    }

 
    const cargarPeriodo = async () => {
        setLoading(true);
        await servicePersona.obtenerPeriodo({
            IdCliente: IdCliente,
            IdPersona: varIdPersona,
            FechaInicio: dateFormat(new Date(), 'yyyyMMdd'),
            FechaFin: dateFormat(new Date(), 'yyyyMMdd'),
        }).then(response => {
            if (response) {
                if (!isNotEmpty(response.MensajeValidacion)) {
                    setFechasContrato({ FechaInicioContrato: response.FechaInicio, FechaFinContrato: response.FechaFin });
                } else {
                    setFechasContrato({ FechaInicioContrato: null, FechaFinContrato: null });
                    handleInfoMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), response.MensajeValidacion);
                }
            }
        }).finally(x => {
            setLoading(false);
        });

    }
    //---------------------------------------------------

    return (
        <>
            {modoEdicion && (
                <>
                    <PersonaGuardiaEditPage
                        dataRowEditNew={dataRowEditNew}
                        agregarPersonaGuardia={agregarPersonaGuardia}
                        actualizarPersonaGuardia={actualizarPersonaGuardia}
                        // actualizarMarcacion={actualizarMarcacion}
                        // agregarMarcacion={agregarMarcacion}
                        cancelarEdicion={cancelarEdicionMarcacion}
                        titulo={tituloTabs}
                        modoEdicion={modoEdicion}
                        accessButton={accessButton}
                        getInfo={getInfo}
                        varIdPersona={varIdPersona}
                        IdModulo={IdModulo}
                        modeView={modeView}
                        fechasContrato={fechasContrato}
                    />
                </>

            )}
            {!modoEdicion && (
                <>
                    <PersonaGuardiaListPage
                        // verRegistro={verRegistro} 
                        editarRegistro={editarRegistro}//{editarRegistroPersonaRegimen}
                        eliminarRegistro={eliminarPersonaRegimen}
                        nuevoRegistro={nuevoRegistroGuardia}
                        cancelarEdicion={props.cancelarEdicion}
                        seleccionarRegistro={seleccionar}
                        focusedRowKey={focusedRowKey}
                        getInfo={getInfo}
                        accessButton={accessButton}
                        showButtons={true}

                        showHeaderInformation={true}
                        uniqueId={"guardiaPersonasList"}
                        isFirstDataLoad={isFirstDataLoad}
                        setIsFirstDataLoad={setIsFirstDataLoad}
                        dataSource={dataSource}
                        refresh={refresh}
                        resetLoadOptions={resetLoadOptions}
                        refreshData={refreshData}
                        setRefreshData={setRefreshData}

                        varIdPersona={varIdPersona}
                    />
                </>

            )}

            <Confirm
                message={intl.formatMessage({ id: "ALERT.REMOVE" })}
                isVisible={isVisibleConfirm}
                setIsVisible={setIsVisibleConfirm}
                setInstance={setInstance}
                onConfirm={() => eliminarPersonaRegimen(selected, true)}
                title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
                confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
                cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
            />
        </>
    );

}

export default injectIntl(WithLoandingPanel(PersonaGuardiaIndexPage));



