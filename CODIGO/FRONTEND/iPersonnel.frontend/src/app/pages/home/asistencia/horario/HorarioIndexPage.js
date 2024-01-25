import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";

import PropTypes from 'prop-types';
import { isNotEmpty, dateFormat } from "../../../../../_metronic";
import { handleErrorMessages, handleSuccessMessages } from "../../../../store/ducks/notify-messages";
import { useStylesEncabezado, useStylesTab } from "../../../../store/config/Styles";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import Confirm from "../../../../partials/components/Confirm";
import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";

import {
  obtener as obtenerAHorario, listar as listarAHorario, crear as crearAHorario, actualizar as actualizarAHorario, eliminar as eliminarAHorario
} from "../../../../api/asistencia/horario.api";
import HorarioEditPage from "../horario/HorarioEditPage";
import HorarioListPage from "../horario/HorarioListPage";

import {
  obtener as obtenerAHDia, listar as listarAHDia, crear as crearAHDia, actualizar as actualizarAHDia, eliminar as eliminarAHDia, obtenerTodos as obtenerTodosAHDias
} from "../../../../api/asistencia/horarioDia.api";
import HorarioDiaEditPage from "../horarioDia/HorarioDiaEditPage";
import HorarioDiaListPage from "../horarioDia/HorarioDiaListPage";


import AsistenciaHorarioDiaBuscar from "../../../../partials/components/AsistenciaHorarioDiaBuscar";
import promise from "redux-promise-middleware";
import { getButtonPermissions, defaultPermissions } from '../../../../../_metronic/utils/securityUtils'
import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import AssignmentTurnedInIcon from '@material-ui/icons/AssignmentTurnedIn';
import TabNavContainer from "../../../../partials/components/Tabs/TabNavContainer";
import { serviceCompania } from "../../../../api/administracion/compania.api";
import Form, { Item, GroupItem, EmptyItem } from "devextreme-react/form";
import { Portlet, PortletBody, PortletHeaderToolbar } from "../../../../partials/content/Portlet";

export const initialFilter = {
  Activo: '%', 
  IdCompania: '%'
};

const HorarioIndexPage = (props) => {
  const { intl, setLoading, dataMenu } = props;
  const usuario = useSelector(state => state.auth.user);
  const { IdCliente, IdDivision } = useSelector(state => state.perfil.perfilActual);

  const [varIdHorario, setVarIdHorario] = useState("");
  const [focusedRowKeyHorario, setFocusedRowKeyHorario] = useState();
  const [focusedRowKeyHorarioDia, setFocusedRowKeyHorarioDia] = useState();
  const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const [selected, setSelected] = useState();
  const [selectedCompany, setSelectedCompany] = useState();

  const [tabIndex, setTabIndex] = useState(0);
  const handleChange = (event, newValue) => { setTabIndex(newValue); };

  const [isVisible, setIsVisible] = useState(false);
  const [instance, setInstance] = useState({});
  const [selectedDelete, setSelectedDelete] = useState({});
  const [listarTabs, setListarTabs] = useState([]);

  const [modoEdicionDetalle, setModoEdicionDetalle] = useState(false);
  const [dataRowEditNewDetalle, setDataRowEditNewDetalle] = useState({});
  const [isVisiblePopUpHorarioDias, setisVisiblePopUpHorarioDias] = useState(false);
  const [listHorarioDia, setlistHorarioDia] = useState([]);
  const [listHorarioDiaExluir, setListHorarioDiaExcluir] = useState([]);

  const [dataRowEditInitial, setDataRowEditInitial] = useState({});
  const [dataRowCopyOrigin, setDataRowCopyOrigin] = useState({});
  const classes = useStylesTab();
  const [companiaData, setCompaniaData] = useState([]);
  const [varIdCompania, setVarIdCompania] = useState("");
  const [varActivo, setVarActivo] = useState("S");

  const [dataGridRef, setDataGridRef] = useState(null);


  // ::::::::::::::::::::::::::::: FUNCIONES HORARIO  :::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  async function agregarHorario(datarow) {
    setLoading(true);
    const { IdHorario, Horario, Flexible, Semanal, Ciclo, Automatico, Activo } = datarow;
    setVarIdHorario(IdHorario);
    let data = {
      // Data ASISTENCIA_HORARIO
      IdCliente: IdCliente
      , IdDivision: IdDivision
      , IdCompania: varIdCompania
      , IdHorario: isNotEmpty(IdHorario) ? IdHorario.toUpperCase() : ""
      , Horario: isNotEmpty(Horario) ? Horario.toUpperCase() : ""
      , Flexible: isNotEmpty(Flexible) ? Flexible.toUpperCase() : ""
      , Semanal: Semanal
      , Ciclo: isNotEmpty(Ciclo) ? Ciclo : 0
      , Automatico: isNotEmpty(Automatico) ? Automatico.toUpperCase() : ""
      , Activo: Activo
      // Data ASISTENCIA_HORARIO_DIA Detalle 
      , Descanso: (datarow.Descanso) ? "S" : "N"
      , Turno: isNotEmpty(datarow.Turno) ? datarow.Turno.toUpperCase() : "D"
      , MinutosFlexible: isNotEmpty(datarow.MinutosFlexible) ? datarow.MinutosFlexible : 0
      , InicioControl: isNotEmpty(datarow.InicioControl) ? dateFormat(datarow.InicioControl, "hh:mm") : ""
      , ControlHEAntes: isNotEmpty(datarow.ControlHEAntes) ? dateFormat(datarow.ControlHEAntes, "hh:mm") : ""
      , HoraEntrada: isNotEmpty(datarow.HoraEntrada) ? dateFormat(datarow.HoraEntrada, "hh:mm") : "00:00"
      , MinutosTolerancia: isNotEmpty(datarow.MinutosTolerancia) ? datarow.MinutosTolerancia : 0
      , InicioRefrigerio: isNotEmpty(datarow.InicioRefrigerio) ? dateFormat(datarow.InicioRefrigerio, "hh:mm") : ""
      , FinRefrigerio: isNotEmpty(datarow.FinRefrigerio) ? dateFormat(datarow.FinRefrigerio, "hh:mm") : ""
      , MinutosRefrigerio: isNotEmpty(datarow.MinutosRefrigerio) ? datarow.MinutosRefrigerio : 0
      , HoraSalida: isNotEmpty(datarow.HoraSalida) ? dateFormat(datarow.HoraSalida, "2020-01-01 00:00:00.000") : ""
      , ControlHEDespues: isNotEmpty(datarow.ControlHEDespues) ? dateFormat(datarow.ControlHEDespues, "hh:mm") : ""
      // Data Auditoria 
      , IdUsuario: usuario.username
    };
    await crearAHorario(data).then(response => {
      if (response) {
        setSelected(data);
        setFocusedRowKeyHorario();
        obtenerHorarioNuevo(varIdCompania, IdHorario);
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      }
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function actualizarHorario(datarow) {
    setLoading(true);
    const { IdHorario, Horario, Flexible, Semanal, Ciclo, Automatico, Activo } = datarow;
    let data = {
      IdCliente: IdCliente
      , IdDivision: IdDivision
      , IdCompania: varIdCompania
      , IdHorario: isNotEmpty(IdHorario) ? IdHorario.toUpperCase() : ""
      , Horario: isNotEmpty(Horario) ? Horario.toUpperCase() : ""
      , Flexible: isNotEmpty(Flexible) ? Flexible.toUpperCase() : ""
      , Semanal: Semanal
      , Ciclo: isNotEmpty(Ciclo) ? Ciclo : 0
      , Automatico: isNotEmpty(Automatico) ? Automatico.toUpperCase() : ""
      , Activo: Activo
      // Data ASISTENCIA_HORARIO_DIA Detalle 
      , Descanso: (datarow.Descanso) ? "S" : "N"
      , Turno: isNotEmpty(datarow.Turno) ? datarow.Turno.toUpperCase() : "D"
      , MinutosFlexible: isNotEmpty(datarow.MinutosFlexible) ? datarow.MinutosFlexible : 0
      , InicioControl: isNotEmpty(datarow.InicioControl) ? dateFormat(datarow.InicioControl, "hh:mm") : ""
      , ControlHEAntes: isNotEmpty(datarow.ControlHEAntes) ? dateFormat(datarow.ControlHEAntes, "hh:mm") : ""
      , HoraEntrada: isNotEmpty(datarow.HoraEntrada) ? dateFormat(datarow.HoraEntrada, "hh:mm") : "00:00"
      , MinutosTolerancia: isNotEmpty(datarow.MinutosTolerancia) ? datarow.MinutosTolerancia : 0
      , InicioRefrigerio: isNotEmpty(datarow.InicioRefrigerio) ? dateFormat(datarow.InicioRefrigerio, "hh:mm") : ""
      , FinRefrigerio: isNotEmpty(datarow.FinRefrigerio) ? dateFormat(datarow.FinRefrigerio, "hh:mm") : ""
      , MinutosRefrigerio: isNotEmpty(datarow.MinutosRefrigerio) ? datarow.MinutosRefrigerio : 0
      , HoraSalida: isNotEmpty(datarow.HoraSalida) ? dateFormat(datarow.HoraSalida, "2020-01-01 00:00:00.000") : ""
      , ControlHEDespues: isNotEmpty(datarow.ControlHEDespues) ? dateFormat(datarow.ControlHEDespues, "hh:mm") : ""
      , CicloInicial: dataRowEditInitial.Ciclo
      // Data Auditoria 
      , IdUsuario: usuario.username
    };
    await actualizarAHorario(data).then(() => {
      setModoEdicion(false);
      setModoEdicionDetalle(false);
      listarHorario(varIdCompania,varActivo);
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function eliminarRegistroHorario(dataRow, confirm) {
    setSelectedDelete(dataRow);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdCliente, IdDivision, IdCompania, IdHorario } = selectedDelete;
      await eliminarAHorario({ IdCliente: IdCliente, IdDivision: IdDivision, IdCompania: IdCompania, IdHorario: IdHorario, IdUsuario: usuario.username }).then(response => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
        listarHorario(varIdCompania,varActivo);
        setFocusedRowKeyHorario();
        setVarIdHorario("");
        setSelected();
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
    }
  }

  async function listarHorario(idCompania, activo = '%') {

    if (focusedRowKeyHorario === undefined) {
      setVarIdHorario("");
    } 

    let size = 0;
    setLoading(true);
    await listarAHorario(
      {
        IdCliente
        , IdDivision
        , IdCompania: idCompania
        , IdHorario: '%'
        , Activo: activo
        , NumPagina: 0
        , TamPagina: 0
      }
    ).then(data => {
      size = data.length;
      setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
      setListarTabs(data);
      changeTabIndex(0);
      setModoEdicion(false);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
    return size;
  }


  async function obtenerHorarioConsulta() {
    setLoading(true);
    obtenerHorario();
    setModoEdicion(false);
    setModoEdicionDetalle(false);
    listarHorarioDia(0);
    setDataRowEditInitial(selected);
    setLoading(false);
  }

  async function obtenerHorarioNuevo(IdCompania, IdHorario) {
    setLoading(true);
    setModoEdicion(false);
    setModoEdicionDetalle(false);
    listarHorarioDia(0);
    await obtenerAHorario({
      IdCliente,
      IdDivision,
      IdCompania: IdCompania,
      IdHorario: IdHorario
    }).then(data => {
      setDataRowEditNew({ ...data, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
    changeTabIndex(1);
  }


  async function obtenerHorario() {
    setLoading(true);
    const { IdCompania, IdHorario } = selected;
    await obtenerAHorario({
      IdCliente,
      IdDivision,
      IdCompania: IdCompania,
      IdHorario: IdHorario
    }).then(data => {
      setDataRowEditNew({ ...data, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  const nuevoRegistroHorario = () => {
    setDataRowEditNew({});
    let data = { Activo: "S", Flexible: "N", Automatico: "N" };
    setDataRowEditNew({ ...data, esNuevoRegistro: true });
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    changeTabIndex(1);
    setModoEdicion(true);
  };

  const editarRegistroHorario = async (dataRow) => {
    changeTabIndex(1);
    setModoEdicion(true);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    obtenerHorario();
    setModoEdicionDetalle(false);
    listarHorarioDia(0);
    setDataRowEditInitial(dataRow);
  };

  const cancelarEdicionHorario = () => { 
    changeTabIndex(0);
    setModoEdicion(false);
    listarHorario(varIdCompania,varActivo);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
    setModoEdicionDetalle(false);
  };

  const seleccionarHorario = dataRow => {
    const { IdHorario, RowIndex } = dataRow;
    setModoEdicion(false);
    setModoEdicionDetalle(false);

    setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
    setVarIdHorario(IdHorario);
    setFocusedRowKeyHorario(RowIndex);
    setSelected(dataRow);
  }

  // ::::::::::::::::::::::::::::: FUNCIONES HORARIO DIA :::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  async function agregarHorarioDiaV2(data) {
    await crearAHDia(data).then(response => {
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function actualizarHorarioDia(datarow) {
    setLoading(true);
    setlistHorarioDia([]);
    const {
      IdDia,
      Descanso,
      Turno,
      MinutosFlexible,
      InicioControl,
      ControlHEAntes,
      HoraEntrada,
      MinutosTolerancia,
      InicioRefrigerio,
      FinRefrigerio,
      MinutosRefrigerio,
      HoraSalida,
      ControlHEDespues } = datarow;


    let data = {
      IdCliente: IdCliente
      , IdDivision: IdDivision
      , IdCompania: varIdCompania
      , IdHorario: varIdHorario
      , IdDia: isNotEmpty(IdDia) ? IdDia : 0
      , Descanso: (Descanso) ? "S" : "N"
      , Turno: isNotEmpty(Turno) ? Turno.toUpperCase() : ""
      , MinutosFlexible: isNotEmpty(MinutosFlexible) ? MinutosFlexible : 0
      , InicioControl: isNotEmpty(InicioControl) ? dateFormat(InicioControl, "hh:mm") : ""
      , ControlHEAntes: isNotEmpty(ControlHEAntes) ? dateFormat(ControlHEAntes, "hh:mm") : ""
      , HoraEntrada: isNotEmpty(HoraEntrada) ? dateFormat(HoraEntrada, "hh:mm") : ""
      , MinutosTolerancia: isNotEmpty(MinutosTolerancia) ? MinutosTolerancia : 0
      , InicioRefrigerio: isNotEmpty(InicioRefrigerio) ? dateFormat(InicioRefrigerio, "hh:mm") : ""
      , FinRefrigerio: isNotEmpty(FinRefrigerio) ? dateFormat(FinRefrigerio, "hh:mm") : ""
      , MinutosRefrigerio: isNotEmpty(MinutosRefrigerio) ? MinutosRefrigerio : 0
      , HoraSalida: isNotEmpty(HoraSalida) ? dateFormat(HoraSalida, "hh:mm") : ""
      , ControlHEDespues: isNotEmpty(ControlHEDespues) ? dateFormat(ControlHEDespues, "hh:mm") : ""
      , IdUsuario: usuario.username
    };

    await actualizarAHDia(data).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      listarHorarioDia(0);
      setModoEdicion(true);
      setModoEdicionDetalle(false);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }


  async function listarHorarioDia(idDia = 0) {
    setLoading(true);
    await listarAHDia(
      {
        IdCliente
        , IdDivision
        , IdCompania: varIdCompania
        , IdHorario: dataRowEditNew.esNuevoRegistro ? dataRowEditNew.IdHorario.toUpperCase() : varIdHorario
        , IdDia: idDia
      }
    ).then(data => {
      if (idDia === 0) {
        setlistHorarioDia(data);
      } else {
        setListHorarioDiaExcluir(data);
      }
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function obtenerHorarioDia(idCompania, IdHorario, idDia) {
    setLoading(true);
    await obtenerAHDia({
      IdCliente, IdDivision, IdCompania: idCompania, IdHorario, IdDia: idDia
    }).then(data => {
      data.Descanso = data.Descanso === "S" ? true : false;
      //data.HoraEntrada = dateFormat
      setDataRowEditNewDetalle({ ...data, esNuevoRegistro: false });
      setModoEdicionDetalle(true);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  const editarRegistroHorarioDia = async (dataRow) => {
    const { IdCompania, IdHorario, IdDia } = dataRow;
    setModoEdicion(false);
    setModoEdicionDetalle(true);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    obtenerHorarioDia(IdCompania, IdHorario, IdDia);

  };


  const copiarRegistroHorarioDia = async (dataRow) => {
    const { IdDia } = dataRow;
    setDataRowCopyOrigin(dataRow);
    listarHorarioDia(IdDia);

    //-Limpiar check seleccionados antes de abrir popup.    
    //document.getElementById().click();
    if (isNotEmpty(document.getElementById('btnClearSelection'))) document.getElementById('btnClearSelection').click();
    setisVisiblePopUpHorarioDias(true);

  };

  const copiarActionHorarioDia = async (dataRow) => {
    try {
      setLoading(true);
      await Promise.all(
        dataRow.map(async (horarioDia) => {
          const { IdDia } = horarioDia
          await actualizarAHDia({ ...dataRowCopyOrigin, IdDia, IdUsuario: usuario.username })
        })
      ).then(() => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      }).finally(() => {
        setLoading(false); listarHorarioDia(0);
      })

    } catch (err) {
      setLoading(false);
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }

  };


  const cancelarEdicionHorarioDia = () => {
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    setModoEdicionDetalle(false);
  };

  const seleccionarHorarioDia = (dataRow) => {
    const { RowIndex } = dataRow;
  };

  const getInfo = () => {
    const { IdCompania, Compania } = selectedCompany;
    return [
      { text: [intl.formatMessage({ id: "COMMON.CODE" })], value: IdCompania, colSpan: 2 },
      { text: [intl.formatMessage({ id: "ADMINISTRATION.PERSON.COMPANY" })], value: Compania, colSpan: 4 }
    ];
  }

  const getInfoDetalle = () => {
    return [
      { text: [intl.formatMessage({ id: "COMMON.CODE" })], value: dataRowEditNew.IdHorario, colSpan: 2 },
      { text: [intl.formatMessage({ id: "ASSISTANCE.SCHEDULE" })], value: dataRowEditNew.Horario, colSpan: 4 }
    ];
  }
  //::::::::::::::::::::::::::::::::::::::::::::::::: Datos Principales ::::::::::::::::::::::::::::::::::::::::::::::::::::::

  const changeTabIndex = (index) => {
    setModoEdicionDetalle(false);
    handleChange(null, index);
  }


  async function eliminarListRowTab(selected, confirm) {
    eliminarRegistroHorario(selected, confirm);
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
 
  const changeValueCompany = (company) => {
    if (isNotEmpty(company)) {
      const { IdCompania } = company;
      setSelectedCompany(company);
      setVarIdCompania(IdCompania); 
      setVarIdHorario("");
    } else {
      setSelectedCompany("");
      setVarIdCompania("");
      setListarTabs([])
    }
  }
  
  const searchschedule = (filter) => {
    const { IdCompania,Activo } = filter;
    listarHorario(IdCompania, Activo); 
  }

  /************--Configuración de acceso de botones*************/
  const [accessButton, setAccessButton] = useState(defaultPermissions);

  const loadControlsPermission = () => {
    let buttonsPermissions = getButtonPermissions(dataMenu.objetos);
    setAccessButton({ ...accessButton, ...buttonsPermissions });
  }


  useEffect(() => {
    listarCompanias();
    loadControlsPermission();
  }, []);


  //:::::::::::::::::::::::::::::::::::::::::::::-Configuración de tabs-:::::::::::::::::::::::::::::::::
  const titleHeaderToolbar = () => {
    let tabsTitles = [
      "",
      ""
    ];

    let sufix = tabsTitles[tabIndex] !== "" ? (" - " + `${intl.formatMessage({ id: tabsTitles[tabIndex] })}`) : "";

    return `${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} ` + " " + sufix;
  }


  const tabContent_HorarioListPage = () => {

    return <HorarioListPage
      asistenciaHorario={listarTabs}
      seleccionarRegistro={seleccionarHorario}
      editarRegistro={editarRegistroHorario}
      eliminarRegistro={eliminarRegistroHorario}
      nuevoRegistro={nuevoRegistroHorario}
      accessButton={accessButton}
      settingDataField={dataMenu.datos}
      focusedRowKey={focusedRowKeyHorario}
      companiaData={companiaData}
      changeValueCompany={changeValueCompany} 
      varIdCompania={varIdCompania}
      setVarIdCompania={setVarIdCompania}
      setFocusedRowKey={setFocusedRowKeyHorario}
      searchschedule={searchschedule} 
      varActivo={varActivo}
      setVarActivo={setVarActivo}
    />
  }

  const tabContent_HorarioEditTabPage = () => {
    return <>
      {dataRowEditNew.esNuevoRegistro && modoEdicion && (
        <HorarioEditPage
          dataRowEditNew={dataRowEditNew}
          setDataRowEditNew={setDataRowEditNew}
          actualizarHorario={actualizarHorario}
          agregarHorario={agregarHorario}
          cancelarEdicion={cancelarEdicionHorario}
          titulo={titulo}
          modoEdicion={modoEdicion}
          accessButton={accessButton}
          settingDataField={dataMenu.datos}
          getInfo={getInfo}
        />
      )}


      {/* Modo edicion Detalle (TAB) */}
      {!dataRowEditNew.esNuevoRegistro && !modoEdicionDetalle && (
        <>
          <HorarioEditPage
            dataRowEditNew={dataRowEditNew}
            actualizarHorario={actualizarHorario}
            agregarHorario={agregarHorario}
            cancelarEdicion={cancelarEdicionHorario}
            titulo={titulo}
            modoEdicion={modoEdicion}
            accessButton={accessButton}
            settingDataField={dataMenu.datos}
            getInfo={getInfo}
          />

          <HorarioDiaListPage
            asistenciaHorarioDia={listHorarioDia}
            modoEdicion={modoEdicionDetalle}
            seleccionarRegistro={seleccionarHorarioDia}
            editarRegistro={editarRegistroHorarioDia}
            accessButton={accessButton}
            copiarRegistro={copiarRegistroHorarioDia}
            dataRowEditNew={dataRowEditNewDetalle}
            getInfo={getInfo}
            setDataGridRef={setDataGridRef}
            dataGridRef={dataGridRef}
          />

          <div className="container_only">
            <div className="float-right">
              <ControlSwitch checked={auditoriaSwitch}
                onChange={e => { setAuditoriaSwitch(e.target.checked) }}
              /><b> {intl.formatMessage({ id: "AUDIT.DATA" })}</b>
            </div>
          </div>
          {auditoriaSwitch && (<AuditoriaPage dataRowEditNew={dataRowEditNewDetalle} />)}

        </>
      )}

      {!dataRowEditNew.esNuevoRegistro && modoEdicionDetalle && (<>
        <HorarioDiaEditPage
          dataRowEditNew={dataRowEditNewDetalle}
          actualizarHorarioDia={actualizarHorarioDia}
          cancelarEdicion={cancelarEdicionHorarioDia}
          titulo={titulo}
          modoEdicion={modoEdicionDetalle}
          accessButton={accessButton}
          settingDataField={dataMenu.datos}
          getInfo={getInfoDetalle}
        />
        <div className="container_only">
          <div className="float-right">
            <ControlSwitch checked={auditoriaSwitch}
              onChange={e => { setAuditoriaSwitch(e.target.checked) }}
            /><b> {intl.formatMessage({ id: "AUDIT.DATA" })}</b>
          </div>
        </div>
        {auditoriaSwitch && (<AuditoriaPage dataRowEditNew={dataRowEditNewDetalle} />)}
      </>
      )}




    </>
  }




  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
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
            onClick: (e) => { listarHorario(varIdCompania,varActivo) },
          },
          {
            label: intl.formatMessage({ id: "ACCESS.GROUP.SCHEDULE" }),
            icon: <AssignmentTurnedInIcon fontSize="large" />,
            onClick: (e) => { obtenerHorarioConsulta() },
            disabled: isNotEmpty(varIdHorario) ? false : true
          }
        ]}
        className={classes.tabContent}
        componentTabsBody={
          [
            tabContent_HorarioListPage(),
            tabContent_HorarioEditTabPage()
          ]
        }
      />
      <AsistenciaHorarioDiaBuscar
        listHorarioDia={listHorarioDiaExluir}
        showPopup={{ isVisiblePopUp: isVisiblePopUpHorarioDias, setisVisiblePopUp: setisVisiblePopUpHorarioDias }}
        cancelar={() => setisVisiblePopUpHorarioDias(false)}
        copiar={copiarActionHorarioDia}
        selectionMode={"multiple"}
        showButton={true}
      />

      <Confirm
        message={intl.formatMessage({ id: "ALERT.REMOVE" })}
        isVisible={isVisible}
        setIsVisible={setIsVisible}
        setInstance={setInstance}
        onConfirm={() => eliminarListRowTab(selectedDelete, true)}
        title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
        confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
        cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
      />
    </>
  );

};



export default injectIntl(WithLoandingPanel(HorarioIndexPage));
