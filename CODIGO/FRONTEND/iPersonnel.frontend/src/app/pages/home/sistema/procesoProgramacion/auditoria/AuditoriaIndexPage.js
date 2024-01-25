import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";

import { isNotEmpty, dateFormat } from "../../../../../../_metronic";
import { handleErrorMessages, handleSuccessMessages } from "../../../../../store/ducks/notify-messages";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import Confirm from "../../../../../partials/components/Confirm";
import AuditoriaPage from "../../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../../store/ducks/componente/componenteSwitch";

//-customerDataGrid
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';

import { service } from "../../../../../api/sistema/procesoAuditoria.api";
import ProcesoAuditoriaEditPage from "./AuditoriaEditPage";
import ProcesoAuditoriaListPage from "./AuditoriaListPage";

export const initialFilter = {
    
    FechaInicio: new Date((new Date()).getFullYear(), (new Date()).getMonth(), 1),
    FechaFin: new Date(
        (new Date()).getFullYear(), 
        (new Date()).getMonth() + 1, 
        0)
  };
  

const AuditoriaIndexPage = (props) => {

    const { intl, setLoading, dataMenu, varIdProceso, getInfo, accessButton, varIdCliente, varIdProgramacion } = props;
    const usuario = useSelector(state => state.auth.user);
    //FILTRO- CustomerDataGrid
    const [isFirstDataLoad, setIsFirstDataLoad] = useState(true);
    const [refreshData, setRefreshData] = useState(false);

    const ds = new DataSource({ store: new ArrayStore({ data: [], key: 'RowIndex' }), reshapeOnPush: false });
    const [dataSource] = useState(ds);

    const refresh = () => dataSource.refresh();
    const resetLoadOptions = () => dataSource.resetLoadOptions();
    const [selected, setSelected] = useState({});

    const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
    const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [dataRowEditNew, setDataRowEditNew] = useState({});
    const [focusedRowKey, setFocusedRowKey] = useState();
    const [selectedDelete, setSelectedDelete] = useState({});
    const [instance, setInstance] = useState({});
    const [tituloTabs, setTituloTabs] = useState(intl.formatMessage({ id: "ACTION.EDIT" }));


    async function agregarProcesoAuditoria(dataRow) {
        setLoading(true);
        const { IdSecuencial, Evento, MensajeEvento, FechaEjecucion } = dataRow;
        let params = {
            IdCliente: varIdCliente
            , IdProceso: varIdProceso
            , IdProgramacion: varIdProgramacion
            , IdSecuencial: isNotEmpty(IdSecuencial) ? IdSecuencial : 0
            , Evento
            , MensajeEvento: isNotEmpty(MensajeEvento) ? MensajeEvento.toUpperCase() : ""
            , FechaEjecucion: isNotEmpty(FechaEjecucion) ? dateFormat(FechaEjecucion, 'yyyyMMdd') : ""
            , IdUsuario: usuario.username
        }
        await service.crear(params).then(response => {
            if (response)
                handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
            //listarProcesoAuditoria();
            //setModoEdicion(false);
            setRefreshData(true);
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
    }

    async function actualizarProcesoAuditoria(dataRow) {
        setLoading(true);
        const { IdCliente, IdSecuencial, Evento, MensajeEvento, FechaEjecucion } = dataRow;
       // console.log("datos", dataRow);
        let params = {
            IdCliente: varIdCliente
            , IdProceso: varIdProceso
            , IdProgramacion: varIdProgramacion
            , IdSecuencial: isNotEmpty(IdSecuencial) ? IdSecuencial : 0
            , Evento
            , MensajeEvento: isNotEmpty(MensajeEvento) ? MensajeEvento.toUpperCase() : ""
            , FechaEjecucion: isNotEmpty(FechaEjecucion) ? dateFormat(FechaEjecucion, 'yyyyMMdd') : ""
            , IdUsuario: usuario.username
        }
        await service.actualizar(params).then(() => {
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
            /* listarProcesoAuditoria();
            setModoEdicion(false); */
            setRefreshData(true);
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
    }

    async function eliminarProcesoAuditoria(dataRow, confirm) {
        setSelectedDelete(dataRow);
        setIsVisible(true);
        if (confirm) {
            setLoading(true);
            const { IdSecuencial } = dataRow;
            await service.eliminar({
                IdCliente: varIdCliente,
                IdProceso: varIdProceso,
                IdProgramacion: varIdProgramacion,
                IdSecuencial
            }).then((result) => {
                handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
            }).catch(err => {
                handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
            }).finally(() => { setLoading(false); });
            //listarProcesoAuditoria();
            setRefreshData(true);
        }
    }

    async function obtenerProcesoAuditoria(dataRow) {
        setLoading(true);
        const { IdCliente, IdSecuencial } = dataRow;
        await service.obtener({
            IdCliente
            , IdSecuencial
        }).then(procesoProgramacion => {
            setDataRowEditNew({ ...procesoProgramacion, esNuevoRegistro: false });
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
    }

    const seleccionarProcesoAuditoria = dataRow => {
        const { RowIndex } = dataRow;
        setModoEdicion(false);
        setSelected(dataRow);
        setFocusedRowKey(RowIndex);
    };

    const editarProcesoAuditoria = async (dataRow) => {
        //const { RowIndex } = dataRow;

        setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
        //setFocusedRowKey(dataRow);
        await obtenerProcesoAuditoria(dataRow);
        setModoEdicion(true);
        //obtenerProcesoAuditoria(dataRow);
    };

    const cancelarProcesoAuditoria = () => {
        setModoEdicion(false);
        setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
        setDataRowEditNew({});
    };

    const nuevoProcesoAuditoria = (e) => {
        let nuevo = { FechaEjecucion: new Date() };
        setDataRowEditNew({ ...nuevo, esNuevoRegistro: true });
        setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
        setModoEdicion(true);

    };

    //Falta UseeFect

    useEffect(() => {
        setRefreshData(true);
    }, []);

    return <>
        {modoEdicion && (
            <>
                <ProcesoAuditoriaEditPage
                    titulo={titulo}
                    modoEdicion={modoEdicion}
                    dataRowEditNew={dataRowEditNew}
                    /*   agregarRegistro={agregarProcesoAuditoria}
                      actualizarRegistro={actualizarProcesoAuditoria} */
                    cancelarEdicion={cancelarProcesoAuditoria}
                    accessButton={accessButton}
                    //settingDataField={dataMenu.datos}
                    getInfo={getInfo}
                    varIdProceso={varIdProceso}
                    varIdProgramacion={varIdProgramacion}
                    varIdCliente={varIdCliente}
                    titulo={tituloTabs}
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
            <>
                <ProcesoAuditoriaListPage
                    seleccionarRegistro={seleccionarProcesoAuditoria}
                    editarRegistro={editarProcesoAuditoria}
                    cancelarEdicion={props.cancelarEdicion}
                    focusedRowKey={focusedRowKey}
                    getInfo={getInfo}
                    //accessButton={accessButton}
                    //titulo={tituloTabs}
                    varIdCliente={varIdCliente}

                    isFirstDataLoad={isFirstDataLoad}
                    setIsFirstDataLoad={setIsFirstDataLoad}
                    dataSource={dataSource}
                    refresh={refresh}
                    resetLoadOptions={resetLoadOptions}
                    refreshData={refreshData}
                    setRefreshData={setRefreshData}
                    //filtro={selected}
                    //selected={{ IdCliente: 0 }}
                    uniqueId={"ProcesoAuditoriaxListPage"}
                />
            </>
        )}

        <Confirm
            message={intl.formatMessage({ id: "ALERT.REMOVE" })}
            isVisible={isVisible}
            setIsVisible={setIsVisible}
            setInstance={setInstance}
            onConfirm={() => eliminarProcesoAuditoria(selectedDelete, true)}
            title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
            confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
            cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
        />

    </>

};

export default injectIntl(WithLoandingPanel(AuditoriaIndexPage));
