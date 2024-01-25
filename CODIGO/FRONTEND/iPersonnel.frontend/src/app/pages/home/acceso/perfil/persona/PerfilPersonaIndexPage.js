import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { handleErrorMessages, handleSuccessMessages, handleWarningMessages } from "../../../../../store/ducks/notify-messages";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import { useSelector } from "react-redux";

import {
  serviceAccesoPersonaPerfil
} from "../../../../../api/acceso/personaPerfil.api";
import PerfilPersonaEditPage from "./PerfilPersonaEditPage";
import PerfilPersonaListPage from "./PerfilPersonaListPage";

import { dateFormat, isNotEmpty } from "../../../../../../_metronic";
import Confirm from "../../../../../partials/components/Confirm";
//-customerDataGrid Star
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';


export const initialFilter = {
  IdCliente: "1",
  IdPerfil: "",
  Activo: "S",
};

const ProcesoIndexPage = (props) => {

  const usuario = useSelector(state => state.auth.user);
  const { IdCliente } = useSelector(state => state.perfil.perfilActual);

  const { intl, setLoading, getInfo, accessButton, varIdPerfil, settingDataField, selected, cancelarEdicion, changeTabIndex } = props;
  const [focusedRowKeyPersonaPerfil, setFocusedRowKeyPersonaPerfil] = useState();

  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));

  const [listarTabs, setListarTabs] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [instance, setInstance] = useState({});
  const [selectedDelete, setSelectedDelete] = useState({});
  const [gridBoxValue, setGridBoxValue] = useState([]);

  //FILTRO- CustomerDataGrid
  const [isFirstDataLoad, setIsFirstDataLoad] = useState(true);
  const [refreshData, setRefreshData] = useState(false);

  const ds = new DataSource({ store: new ArrayStore({ data: [], key: 'RowIndex' }), reshapeOnPush: false });
  const [dataSource] = useState(ds);

  const refresh = () => dataSource.refresh();
  const resetLoadOptions = () => dataSource.resetLoadOptions();

  const [grillaPersona, setGrillaPersona] = useState([]);

  const [historialPersona, setHistorialPersona] = useState([])


  useEffect(() => {
    //listarProceso();
  }, []);



  async function listarPersonaPerfil() {
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    changeTabIndex(3);
    setModoEdicion(false);
  }

  const seleccionarPersonaPerfil = dataRow => {
    const { RowIndex } = dataRow;
    setFocusedRowKeyPersonaPerfil(RowIndex);
  };

  const nuevoRegistro = () => {
    let hoy = new Date();
    let fecInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    let fecFin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 1);
    fecFin = fecFin.setMinutes(-1);

    let nuevo = { Activo: "S", FechaInicio: fecInicio, FechaFin: fecFin };

    let currentUsers = dataSource._items;

    setDataRowEditNew({
      ...nuevo, esNuevoRegistro: true, currentUsers
    });
    setGrillaPersona([]);
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);

  };


  //JDL
  async function agregarPersonaPerfil(personas) {
    setLoading(true);

    const { FechaInicio, FechaFin, Activo } = personas[0];
    var parametro = {
      IdCliente,
      IdPerfil: varIdPerfil,
      IdPersonas: personas.map(item => item.IdPersona).join(","),
      FechaInicio: dateFormat(FechaInicio, 'yyyyMMdd'),
      FechaFin: dateFormat(FechaFin, 'yyyyMMdd'),
      Activo
    }
    //console.log("parametro..>", parametro);
    let nombrePersona = '';
    await serviceAccesoPersonaPerfil.crearMultiple(parametro).then(result => {
      result = result.data;
      //console.log("resultado>", result);
      setGrillaPersona(result);
      if (result.length === 1) {
        nombrePersona = result[0].NombreCompleto;
      }
      setRefreshData(true);
      //Numero de observados
      var rsObservados = result.filter(o => o.Activo === "N");
      var rsOk = result.filter(o => o.Activo === "S");
      //console.log(".length", result.find(x => x.Activo === "N").length);
      //console.log("rsObservados, rsOk", rsObservados, rsOk);
      if (rsObservados.length === 0 && rsOk.length > 0) {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }), nombrePersona);
        setModoEdicion(false);
      } else {
        if (rsOk.length > 0) {
          handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }), nombrePersona);
          //Observaciones
          //setModoEdicion(false);
        } else {
          handleWarningMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.NO.SUCESS" }));
          //No se registro 
        }
      }
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err);
    }).finally(() => {
      setLoading(false);
    })

  }

  const cancelarEdicionTabsPersonaPerfil = () => {
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };


  async function eliminarPersonaPerfil(perfilData, confirm) {
    setSelectedDelete(perfilData);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdCliente, IdSecuencial, IdPersona } = perfilData;
      const { IdPerfil } = selected;
      await serviceAccesoPersonaPerfil.eliminar({
        IdCliente,
        IdSecuencial,
        IdPerfil,
        IdPersona,
        IdUsuario: usuario.username,
      })
        .then(() => {
          handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
        })
        .catch((err) => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
      listarPersonaPerfil();
      setRefreshData(true);
    }
    
  }


  async function listarHistorialPersona(dataRow) {
    const { IdCliente, IdPersona, IdPerfil } = dataRow;

    let data = await serviceAccesoPersonaPerfil.listarHistorial({
      IdCliente,
      IdPersona,
      IdPerfil
    }).catch((err) => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    });
    setHistorialPersona(data);
  };

  return <>

    {modoEdicion && (
      <>
        <PerfilPersonaEditPage
          dataRowEditNew={dataRowEditNew}
          agregarPerfil={agregarPersonaPerfil}
          cancelarEdicion={cancelarEdicionTabsPersonaPerfil}
          gridBoxValue={gridBoxValue}
          setGridBoxValue={setGridBoxValue}
          titulo={titulo}

          modoEdicion={modoEdicion}
          accessButton={accessButton}
          settingDataField={settingDataField}
          getInfo={getInfo}
          grillaPersona={grillaPersona}
          setGrillaPersona={setGrillaPersona}

        />

      </>
    )}

    {!modoEdicion && (
      <>
        <PerfilPersonaListPage
          personaPerfiles={listarTabs}
          eliminarRegistro={eliminarPersonaPerfil}
          nuevoRegistro={nuevoRegistro}
          cancelarEdicion={cancelarEdicion}
          seleccionarRegistro={seleccionarPersonaPerfil}
          accessButton={accessButton}
          focusedRowKey={focusedRowKeyPersonaPerfil}
          varIdPerfil={varIdPerfil}
          getInfo={getInfo}
          allowUpdating={false}

          //customerDataGrid
          showHeaderInformation={true}
          uniqueId={"accesoPersonaPerfilList"}
          isFirstDataLoad={isFirstDataLoad}
          setIsFirstDataLoad={setIsFirstDataLoad}
          dataSource={dataSource}
          refresh={refresh}
          resetLoadOptions={resetLoadOptions}
          refreshData={refreshData}
          setRefreshData={setRefreshData}
          selected={selected}

          listarHistorialPersona={listarHistorialPersona}
          historialPersona={historialPersona}

        />
      </>
    )}

    <Confirm
      message={intl.formatMessage({ id: "ALERT.REMOVE" })}
      isVisible={isVisible}
      setIsVisible={setIsVisible}
      setInstance={setInstance}
      onConfirm={() => eliminarPersonaPerfil(selectedDelete, true)}
      title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
      confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
      cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
    />

  </>


};

export default injectIntl(WithLoandingPanel(ProcesoIndexPage));
