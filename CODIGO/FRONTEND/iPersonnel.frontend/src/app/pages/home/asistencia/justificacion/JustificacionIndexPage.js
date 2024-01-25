import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";

import PropTypes from 'prop-types';
import { isNotEmpty } from "../../../../../_metronic";
import { getButtonPermissions, defaultPermissions } from '../../../../../_metronic/utils/securityUtils'
import { Portlet } from "../../../../partials/content/Portlet";
import { handleErrorMessages, handleSuccessMessages } from "../../../../store/ducks/notify-messages";
import { useStylesTab } from "../../../../store/config/Styles";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import Confirm from "../../../../partials/components/Confirm";
import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import FeaturedPlayListIcon from '@material-ui/icons/FeaturedPlayList';

import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";

import {
  obtener, listar, crear, actualizar, eliminar
} from "../../../../api/asistencia/justificacion.api";
import JustificacionListPage from "./JustificacionListPage";
import JustificacionEditPage from "./JustificacionEditPage";


import {
  crear as crearDIV,
  eliminar as eliminarDIV
} from "../../../../api/asistencia/justificacionDivision.api";

import {
  crear as crearJP,
  eliminar as eliminarJP
} from "../../../../api/asistencia/justificacionPlanilla.api";

import { listarAsignados } from "../../../../api/asistencia/justificacionPlanilla.api";
import { listarTreeview } from "../../../../api/asistencia/justificacionDivision.api";
import { serviceCompania } from "../../../../api/administracion/compania.api";
import TabNavContainer from "../../../../partials/components/Tabs/TabNavContainer";


const JustificacionIndexPage = (props) => {
  const { intl, setLoading, dataMenu } = props;
  const usuario = useSelector(state => state.auth.user);
  const { IdCliente } = useSelector(state => state.perfil.perfilActual);
  const classes = useStylesTab();

  const [varIdJustificacion, setVarIdJustificacion] = useState("");
  const [varIdCompania, setVarIdCompania] = useState("");
  const [focusedRowKey, setFocusedRowKey] = useState(0);

  const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const [selected, setSelected] = useState({});
  const [selectedCompany, setSelectedCompany] = useState({});
  const [tabIndex, setTabIndex] = useState(0);
  const handleChange = (event, newValue) => { setTabIndex(newValue); };

  const [isVisible, setIsVisible] = useState(false);
  const [instance, setInstance] = useState({});

  const [selectedDelete, setSelectedDelete] = useState({});
  const [dataPlanilla, setDataPlanilla] = useState([]);
  const [listarTabs, setListarTabs] = useState([]);
  const [isVisibleAlert, setIsVisibleAlert] = useState(false);
  const [companiaData, setCompaniaData] = useState([]);

  const [divisionesTreeView, setDivisionesTreeView] = useState([{
    Icon: "flaticon2-expand"
    , IdMenu: null
    , IdModulo: null
    , IdMenuPadre: null
    , Menu: intl.formatMessage({ id: "SYSTEM.MENU.OPTIONS" })
    , MenuPadre: null
    , Nivel: 0
    , Orden: 0
    , expanded: true
  }]);


  async function agregarJustificacion(datarow, selectedRowPlanilla, selectedRowDivision) {
    setLoading(true);
    const { IdJustificacion, Justificacion, OrigenExterno, AplicaFuturo, AplicaPorDia, AplicaPorHora, AplicarDiaDescanso, ConfigurarPorSemana,
      NumeroVecesPorSemana, ConfigurarPorDia, NumeroVecesPorDia, AplicarMaximoMinutos, MaximoMinutos, RequiereObservacion,
      CodigoReferencia, RequiereAutorizacion, Remunerado, EsSubsidio, Activo } = datarow;
    let data = {
      IdCliente
      , IdCompania: varIdCompania
      , IdJustificacion: isNotEmpty(IdJustificacion) ? IdJustificacion.toUpperCase() : ""
      , Justificacion: isNotEmpty(Justificacion) ? Justificacion.toUpperCase() : ""
      , Activo: Activo
      , Remunerado: Remunerado ? "S" : "N"
      , OrigenExterno: OrigenExterno ? "S" : "N"
      , AplicaFuturo: AplicaFuturo ? "S" : "N"
      , AplicaPorDia: AplicaPorDia ? "S" : "N"
      , AplicaPorHora: AplicaPorHora ? "S" : "N"
      , AplicarDiaDescanso: AplicarDiaDescanso ? "S" : "N"
      , ConfigurarPorSemana: ConfigurarPorSemana ? "S" : "N"
      , NumeroVecesPorSemana: ConfigurarPorSemana ? isNotEmpty(NumeroVecesPorSemana) ? NumeroVecesPorSemana : 0 : 0
      , ConfigurarPorDia: ConfigurarPorDia ? "S" : "N"
      , NumeroVecesPorDia: ConfigurarPorDia ? isNotEmpty(NumeroVecesPorDia) ? NumeroVecesPorDia : 0 : 0
      , AplicarMaximoMinutos: AplicarMaximoMinutos ? "S" : "N"
      , MaximoMinutos: AplicarMaximoMinutos ? isNotEmpty(MaximoMinutos) ? MaximoMinutos : 0.0 : 0.0
      , RequiereObservacion: RequiereObservacion ? "S" : "N"
      , CodigoReferencia: isNotEmpty(CodigoReferencia) ? CodigoReferencia.toUpperCase() : ""
      , RequiereAutorizacion: RequiereAutorizacion ? "S" : "N"
      , IdUsuario: usuario.username
      , ValidSave: 'S'
      , EsSubsidio: EsSubsidio ? "S" : "N"
    };
    await crear(data).then(response => {
      agregarJustificacionPlanilla(data, selectedRowPlanilla);
      agregarJustificacionDivision(data, selectedRowDivision);
      if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      setModoEdicion(false);
      listarJustificacion(varIdCompania);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function actualizarJustificacion(datarow, selectedRowPlanilla, selectedRowDivision) {
    setLoading(true);
    const { IdCompania, IdJustificacion, Justificacion, OrigenExterno, AplicaFuturo, AplicaPorDia, AplicaPorHora, AplicarDiaDescanso, ConfigurarPorSemana,
      NumeroVecesPorSemana, ConfigurarPorDia, NumeroVecesPorDia, AplicarMaximoMinutos, MaximoMinutos, RequiereObservacion,
      CodigoReferencia, RequiereAutorizacion, Remunerado, Activo, EsSubsidio } = datarow;
    let data = {
      IdCliente
      , IdCompania: isNotEmpty(IdCompania) ? IdCompania.toUpperCase() : ""
      , IdJustificacion: isNotEmpty(IdJustificacion) ? IdJustificacion.toUpperCase() : ""
      , Justificacion: isNotEmpty(Justificacion) ? Justificacion.toUpperCase() : ""
      , Activo: Activo
      , Remunerado: Remunerado ? "S" : "N"
      , OrigenExterno: OrigenExterno ? "S" : "N"
      , AplicaFuturo: AplicaFuturo ? "S" : "N"
      , AplicaPorDia: AplicaPorDia ? "S" : "N"
      , AplicaPorHora: AplicaPorHora ? "S" : "N"
      , AplicarDiaDescanso: AplicarDiaDescanso ? "S" : "N"
      , ConfigurarPorSemana: ConfigurarPorSemana ? "S" : "N"
      , NumeroVecesPorSemana: ConfigurarPorSemana ? isNotEmpty(NumeroVecesPorSemana) ? NumeroVecesPorSemana : 0 : 0
      , ConfigurarPorDia: ConfigurarPorDia ? "S" : "N"
      , NumeroVecesPorDia: ConfigurarPorDia ? isNotEmpty(NumeroVecesPorDia) ? NumeroVecesPorDia : 0 : 0
      , AplicarMaximoMinutos: AplicarMaximoMinutos ? "S" : "N"
      , MaximoMinutos: AplicarMaximoMinutos ? isNotEmpty(MaximoMinutos) ? MaximoMinutos : 0.0 : 0.0
      , RequiereObservacion: RequiereObservacion ? "S" : "N"
      , CodigoReferencia: isNotEmpty(CodigoReferencia) ? CodigoReferencia.toUpperCase() : ""
      , RequiereAutorizacion: RequiereAutorizacion ? "S" : "N"
      , IdUsuario: usuario.username
      , EsSubsidio: EsSubsidio ? "S" : "N"
    };
    await actualizar(data).then(() => {
      agregarJustificacionPlanilla(datarow, selectedRowPlanilla);
      agregarJustificacionDivision(datarow, selectedRowDivision);
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      setModoEdicion(false);
      listarJustificacion(varIdCompania);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function agregarJustificacionPlanilla(datarow, selectedRowPlanilla) {
    try {
      const { IdCliente, IdCompania, IdJustificacion } = datarow;

      await eliminarJP({ IdCliente: IdCliente, IdCompania: IdCompania, IdJustificacion: IdJustificacion, IdPlanilla: '%' }).then(response => { }).catch(err => { }).finally();

      setTimeout(function () {

        if (selectedRowPlanilla.length > 0) {
          selectedRowPlanilla.map(async (data) => {
            const { IdPlanilla } = data;
            let params = {
              IdCliente: IdCliente,
              IdCompania: IdCompania,
              IdJustificacion: IdJustificacion,
              IdPlanilla: IdPlanilla,
              Activo: 'S',
              IdUsuario: usuario.username
            };
            await crearJP(params)
              .then((response) => { })
              .catch((err) => {
                handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
              });
          });
        }

      }, 500);

    } catch (err) {
      setLoading(false);
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }
  }


  async function agregarJustificacionDivision(datarow, selectedRowDivision) {
    try {
      setLoading(true);
      const { IdCliente, IdCompania, IdJustificacion, IdDivision } = datarow;
      //if (selectedRowDivision != undefined) {
        await eliminarDIV({ IdCliente: IdCliente, IdCompania: IdCompania, IdJustificacion: IdJustificacion, IdDivision: "%" }).then(response => { }).catch(err => { }).finally();
      //}

      setTimeout(function () {

        //if (selectedRowDivision != undefined) {
          if (selectedRowDivision.length > 0) {
            selectedRowDivision.map(async (data) => {
              const { IdDivision } = data;
              if (isNotEmpty(IdDivision)) {
                let params = {
                  IdCliente: IdCliente,
                  IdCompania: IdCompania,
                  IdJustificacion: IdJustificacion,
                  IdDivision: IdDivision,
                  Activo: 'S',
                  IdUsuario: usuario.username
                };
                await crearDIV(params).catch((err) => {
                  handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
                });
              }
            });
          }

        //}


      }, 500);

    } catch (err) {
      setLoading(false);
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }
    setLoading(false);
  }

  async function eliminarRegistro(justificaicon, confirm) {
    setSelectedDelete(justificaicon);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdCliente, IdCompania, IdJustificacion } = selectedDelete;
      await eliminar({ IdCliente: IdCliente, IdCompania: IdCompania, IdJustificacion: IdJustificacion, IdUsuario: usuario.username }).then(response => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
        listarJustificacion(varIdCompania);
        setFocusedRowKey();
        setVarIdJustificacion("");
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
    }
  }

  async function listarJustificacion(idCompania) {
    setLoading(true);
    await listar(
      {
        IdCliente
        , IdCompania: idCompania
        , IdJustificacion: '%'
        , NumPagina: 0
        , TamPagina: 0
      }
    ).then(justificaciones => {
      setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
      setListarTabs(justificaciones)
      changeTabIndex(0);
      setModoEdicion(false);

    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function obtenerJustificacion() {
    setLoading(true);
    const { IdCompania, IdJustificacion } = selected
    await obtener({
      IdCliente,
      IdCompania: IdCompania,
      IdJustificacion: IdJustificacion
    }).then(response => {
      //Pendiente convertir
      response.OrigenExterno = response.OrigenExterno === 'S' ? true : false;
      response.AplicaFuturo = response.AplicaFuturo === 'S' ? true : false;
      response.AplicaPorDia = response.AplicaPorDia === 'S' ? true : false;
      response.AplicaPorHora = response.AplicaPorHora === 'S' ? true : false;
      response.AplicarDiaDescanso = response.AplicarDiaDescanso === 'S' ? true : false;
      response.Remunerado = response.Remunerado === 'S' ? true : false;
      response.ConfigurarPorSemana = response.ConfigurarPorSemana === 'S' ? true : false;
      response.ConfigurarPorDia = response.ConfigurarPorDia === 'S' ? true : false;
      response.AplicarMaximoMinutos = response.AplicarMaximoMinutos === 'S' ? true : false;
      response.RequiereObservacion = response.RequiereObservacion === 'S' ? true : false;
      response.RequiereAutorizacion = response.RequiereAutorizacion === 'S' ? true : false;
      response.EsSubsidio = response.EsSubsidio === 'S' ? true : false;
      setDataRowEditNew({ ...response, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }


  const nuevoRegistro = () => {
    changeTabIndex(1);
    let justificaicon = { Activo: "S", IdCompania: varIdCompania };
    setDataRowEditNew({
      ...justificaicon, Longitud: 0, esNuevoRegistro: true, OrigenExterno: false, AplicaFuturo: false,
      ConfigurarPorSemana: false, ConfigurarPorDia: false, AplicarMaximoMinutos: false, RequiereObservacion: false, Remunerado: false,
      AplicaPorDia: false, AplicaPorHora: false, RequiereAutorizacion: false
    });
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
    let dataRow = {
      IdCliente: IdCliente,
      IdCompania: varIdCompania,
      IdJustificacion: "%",
    };
    listarTabPlanillas('NUEVO', dataRow);
    listarTabDivisiones('NUEVO', dataRow);
  };

  const editarRegistro = async (dataRow) => {
    changeTabIndex(1);
    obtenerJustificacion();
    listarTabPlanillas('ACTUALIZAR', dataRow);
    listarTabDivisiones('ACTUALIZAR', dataRow);
    setModoEdicion(true);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));

  };

  async function listarTabPlanillas(Accion, dataRow) {
    const { IdCliente, IdCompania, IdJustificacion } = dataRow;
    let data = await listarAsignados({ Accion: Accion, IdCliente: IdCliente, IdCompania: IdCompania, IdJustificacion: isNotEmpty(IdJustificacion) ? IdJustificacion : "%" });
    setDataPlanilla(data);
    if (data.length === 0) {
      setIsVisibleAlert(true);
    } else {
      setIsVisibleAlert(false);
    }

  }

  async function listarTabDivisiones(Accion, dataRow) {
    const { IdCliente, IdJustificacion, IdCompania } = dataRow;
    await listarTreeview({
      Accion: Accion,
      IdCliente: IdCliente,
      IdDivision: '%',
      IdJustificacion: isNotEmpty(IdJustificacion) ? IdJustificacion : "%",
      IdCompania: varIdCompania
    }).then(dataTreeView => {
      if (!isNotEmpty(dataTreeView)) {
        //Sin data , mostrar por defecto.
        setDivisionesTreeView([{
          Activo: "S"
          , icon: "flaticon2-expand"
          , IdMenu: null
          , IdMenuPadre: null
          , IdModulo: ""
          , Menu: "-SIN DATOS-"
          , MenuPadre: null
          , expanded: true
        }])
      } else {
          setDivisionesTreeView(dataTreeView);
        // seleccionarNodo([],dataTreeView)
      }
    }).catch(err => {
    }).finally();

  }



  async function importarJustificaciones(listJustificaciones) {
    try {

      setTimeout(function () {

        if (listJustificaciones.length > 0) {
          listJustificaciones.map(async (data) => {
            const { IdJustificacion, Justificacion, OrigenExterno, AplicaFuturo, AplicaPorDia, AplicaPorHora, AplicarDiaDescanso, ConfigurarPorSemana, NumeroVecesPorSemana,
              ConfigurarPorDia, NumeroVecesPorDia, AplicarMaximoMinutos, MaximoMinutos, RequiereObservacion,
              CodigoReferencia, Remunerado, RequiereAutorizacion, Activo } = data;

            let params = {
              IdCliente: IdCliente
              , IdCompania: varIdCompania
              , IdJustificacion: isNotEmpty(IdJustificacion) ? IdJustificacion.toUpperCase() : ""
              , Justificacion: isNotEmpty(Justificacion) ? Justificacion.toUpperCase() : ""
              , Activo: Activo
              , Remunerado: Remunerado
              , OrigenExterno: OrigenExterno ? "S" : "N"
              , AplicaFuturo: AplicaFuturo ? "S" : "N"
              , AplicaPorDia: AplicaPorDia ? "S" : "N"
              , AplicaPorHora: AplicaPorHora ? "S" : "N"
              , AplicarDiaDescanso: AplicarDiaDescanso ? "S" : "N"
              , ConfigurarPorSemana: ConfigurarPorSemana ? "S" : "N"
              , NumeroVecesPorSemana: ConfigurarPorSemana ? isNotEmpty(NumeroVecesPorSemana) ? NumeroVecesPorSemana : 0 : 0
              , ConfigurarPorDia: ConfigurarPorDia ? "S" : "N"
              , NumeroVecesPorDia: ConfigurarPorDia ? isNotEmpty(NumeroVecesPorDia) ? NumeroVecesPorDia : 0 : 0
              , AplicarMaximoMinutos: AplicarMaximoMinutos ? "S" : "N"
              , MaximoMinutos: AplicarMaximoMinutos ? isNotEmpty(MaximoMinutos) ? MaximoMinutos : 0.0 : 0.0
              , RequiereObservacion: RequiereObservacion ? "S" : "N"
              , CodigoReferencia: isNotEmpty(CodigoReferencia) ? CodigoReferencia.toUpperCase() : ""
              , RequiereAutorizacion: RequiereAutorizacion ? "S" : "N"
              , IdUsuario: usuario.username
              , ValidSave: 'N'
            };
            await crear(params)
              .then((response) => {
                listarJustificacion(varIdCompania);
              })
              .catch((err) => {
                handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
              });
          });
        }

      }, 500);

    } catch (err) {
      setLoading(false);
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }
  }


  const cancelarEdicion = () => {
    changeTabIndex(0);
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };

  const seleccionarRegistro = dataRow => {
    const { IdCompania, IdJustificacion, RowIndex } = dataRow;
    setSelected(dataRow);
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
    setVarIdCompania(IdCompania);
    setVarIdJustificacion(IdJustificacion);
    setFocusedRowKey(RowIndex);
    listarTabPlanillas('ACTUALIZAR', dataRow);
    listarTabDivisiones('ACTUALIZAR', dataRow);
  }

  const verRegistroDblClick = async (dataRow) => {
    changeTabIndex(1);
    setModoEdicion(false);
    obtenerJustificacion();
    listarTabPlanillas('ACTUALIZAR', dataRow);
    listarTabDivisiones('ACTUALIZAR', dataRow);
  };

  const changeTabIndex = (index) => {
    handleChange(null, index);
  }

  async function listarCompanias() {
    let data = await serviceCompania.obtenerTodosConfiguracion({
      IdCliente: IdCliente,
      IdModulo: dataMenu.info.IdModulo,
      IdAplicacion: dataMenu.info.IdAplicacion,
      IdConfiguracion: "ID_COMPANIA"
    }
    ).catch(err => { handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err) });
    setCompaniaData(data);
  }

  /************--Configuración de acceso de botones*************/
  const [accessButton, setAccessButton] = useState(defaultPermissions);

  const loadControlsPermission = () => {
    let buttonsPermissions = getButtonPermissions(dataMenu.objetos);
    setAccessButton({ ...accessButton, ...buttonsPermissions });
  }
  /***********************************************************************/

  const getInfo = () => {

    const { IdCompania, Compania } = selectedCompany;
    return [

      { text: [intl.formatMessage({ id: "COMMON.CODE" })], value: IdCompania, colSpan: 2 },
      { text: [intl.formatMessage({ id: "ADMINISTRATION.PERSON.COMPANY" })], value: Compania, colSpan: 4 }

    ];
  }

  const changeValueCompany = (company) => {
    if (isNotEmpty(company)) {
      const { IdCompania } = company;
      setSelectedCompany(company);
      setVarIdCompania(IdCompania);
      listarJustificacion(IdCompania);
      setVarIdJustificacion("");
    } else {
      setListarTabs([]);
      setSelectedCompany("");
      setVarIdCompania("");
      setVarIdJustificacion("");

    }
  }

  const titleHeaderToolbar = () => {
    let tabsTitles = [
      "",
      intl.formatMessage({ id: "ASSISTANCE.JUSTIFICACION" }),
    ];
    let sufix = tabsTitles[tabIndex] !== "" ? (" - " + `${intl.formatMessage({ id: tabsTitles[tabIndex] })}`) : "";
    return `${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} ` + " " + sufix;
  }

  const tabsDisabled = () => {
    return (isNotEmpty(varIdCompania) && isNotEmpty(varIdJustificacion)) ? true : false;
  }

  useEffect(() => {
    loadControlsPermission();
    listarCompanias();
  }, []);


  const tabContent_JustificacionListPage = () => {
    return <>
      <JustificacionListPage
        justificaciones={listarTabs}
        editarRegistro={editarRegistro}
        eliminarRegistro={eliminarRegistro}
        nuevoRegistro={nuevoRegistro}
        seleccionarRegistro={seleccionarRegistro}
        verRegistroDblClick={verRegistroDblClick}
        focusedRowKey={focusedRowKey}
        accessButton={accessButton}
        dataRowEditNew={dataRowEditNew}
        importarJustificaciones={importarJustificaciones}
        companiaData={companiaData}
        changeValueCompany={changeValueCompany}
        // changeValueCompanyImport={changeValueCompanyImport}
        varIdCompania={varIdCompania}
        setVarIdCompania={setVarIdCompania}
        setFocusedRowKey={setFocusedRowKey}
        selectedCompany={selectedCompany}
      />
    </>
  }

  const tabContent_JustificacionEditPage = () => {
    return <>
      <JustificacionEditPage
        modoEdicion={modoEdicion}
        dataRowEditNew={dataRowEditNew}
        setDataRowEditNew={setDataRowEditNew}
        actualizarJustificacion={actualizarJustificacion}
        agregarJustificacion={agregarJustificacion}
        cancelarEdicion={cancelarEdicion}
        titulo={titulo}
        accessButton={accessButton}
        settingDataField={dataMenu.datos}
        getInfo={getInfo}
        dataPlanilla={dataPlanilla}
        divisionesTreeView={divisionesTreeView}
        isVisibleAlert={isVisibleAlert}
      />
      <div className="container_only">
        <div className="float-right">
          <ControlSwitch
            checked={auditoriaSwitch}
            onChange={e => { setAuditoriaSwitch(e.target.checked) }}
          /><b> {intl.formatMessage({ id: "AUDIT.DATA" })}</b>
        </div>
      </div>
      {auditoriaSwitch && (<AuditoriaPage dataRowEditNew={dataRowEditNew} />)}
    </>
  }

  return (
    <>
      <TabNavContainer
        title={intl.formatMessage({ id: "ASSISTANCE.MAIN" })}
        submenu={intl.formatMessage({ id: "CONFIG.MENU.ASISTENCIA.CONFIGURACIÓN" })}
        subtitle={`${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} `}
        nombrebarra={titleHeaderToolbar()}
        tabIndex={tabIndex}
        handleChange={handleChange}
        componentTabsHeaders={[
          {
            label: intl.formatMessage({ id: "ACTION.LIST" }),
            icon: <FormatListNumberedIcon fontSize="large" />,
          },
          {
            label: intl.formatMessage({ id: "ASSISTANCE.JUSTIFICACION" }),
            icon: <FeaturedPlayListIcon fontSize="large" />,
            onClick: (e) => { obtenerJustificacion() },
            disabled: !tabsDisabled()
          },
        ]}
        className={classes.tabContent}
        componentTabsBody={
          [
            tabContent_JustificacionListPage(),
            tabContent_JustificacionEditPage(),
          ]
        }
      />

      <Confirm
        message={intl.formatMessage({ id: "ALERT.REMOVE" })}
        isVisible={isVisible}
        setIsVisible={setIsVisible}
        setInstance={setInstance}
        onConfirm={() => eliminarRegistro(selected, true)}
        title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
        confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
        cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
      />
    </>
  );
};

export default injectIntl(WithLoandingPanel(JustificacionIndexPage));
