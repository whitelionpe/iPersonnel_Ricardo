import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";

import {obtener as obtenerResultado} from "../../../../../api/asistencia/resultado.api";

import { useSelector } from "react-redux";
import { useStylesTab } from "../../../../../store/config/Styles";
import DataSource from "devextreme/data/data_source";
import ArrayStore from "devextreme/data/array_store";
import PersonaResultadoEditPage from "./PersonaResultadoEditPage";
import PersonaResultadoListPage from "./PersonaResultadoListPage";
import { handleErrorMessages } from "../../../../../store/ducks/notify-messages";
import { dateFormat, isNotEmpty } from "../../../../../../_metronic";

export const initialFilter = {
    IdCliente: '',
    IdPersona: '',
    FechaInicio: new Date(),
    FechaFin: new Date(),
};

const PersonaResultadoIndexPage = (props) => {
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


    const seleccionar = async (dataRow) => {
        const { RowIndex } = dataRow;
        setSelected(dataRow);
        if (RowIndex !== focusedRowKey) {
            setFocusedRowKey(RowIndex);
        }
        console.log("***seleccionar****dataRow:> ", dataRow);
    }

    const verRegistro = async (dataRow) => {
        setDataRowEditNew({});
        setModeView(true);
        setTituloTabs(intl.formatMessage({ id: "ACTION.VIEW" }));
        //LSF-202031009-Comentado por pendiente
        console.log("verRegistro = async (dataRow) => " ,dataRow );
        await obtener(dataRow);
        setModoEdicion(true);
    };

    const cancelarEdicionMarcacion = () => {
        setModoEdicion(false);
        setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
        setDataRowEditNew({});
        setFocusedRowKey();
        setSelected({});
    };


    async function obtener(dataRow) {
        setLoading(true);
        const { IdCliente, IdPersona, FechaAsistencia } = dataRow;
        await obtenerResultado({ 
            IdCliente, 
            IdPersona, 
            IdDivision,
            FechaAsistencia: isNotEmpty(FechaAsistencia) ? dateFormat(FechaAsistencia, 'yyyyMMdd') : ""
        }).then(data => {
            console.log("****Resultado : data",data);
            // const { FechaMarca, Automatico, MarcacionWeb } = data;
            //data.HoraMarca = FechaMarca;

            // data.Automatico = Automatico === "S" ? "S" : "N";
            // data.MarcacionWeb = MarcacionWeb === "N" ? true : false;

            // let minutos = new Date(FechaMarca);
            // let fechaCorta = new Date(FechaMarca);

            setDataRowEditNew({ ...data, esNuevoRegistro: false, });
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
    }

    return <>

        {modoEdicion && (
            <>
                <PersonaResultadoEditPage
                    dataRowEditNew={dataRowEditNew}
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
                />
            </>

        )}
        {!modoEdicion && (
            <>
                <PersonaResultadoListPage
                    seleccionarRegistro={seleccionar}
                    // editarRegistro={editarRegistroMarcacion}
                    // eliminarRegistro={eliminarRegistroMarcacion}
                    // nuevoRegistro={nuevoRegistroMarcacion}
                    cancelarEdicion={props.cancelarEdicion}
                    getInfo={getInfo}
                    accessButton={accessButton}
                    focusedRowKey={focusedRowKey}
                    verRegistro={verRegistro}

                    isFirstDataLoad={isFirstDataLoad}
                    setIsFirstDataLoad={setIsFirstDataLoad}
                    dataSource={dataSource}
                    refresh={refresh}
                    resetLoadOptions={resetLoadOptions}
                    refreshData={refreshData}
                    setRefreshData={setRefreshData}
                    varIdPersona={varIdPersona}
                // ocultarEdit={ocultarEdit}
                />
            </>

        )}

    </>

};

export default injectIntl(WithLoandingPanel(PersonaResultadoIndexPage));
