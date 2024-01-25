import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { handleErrorMessages, handleInfoMessages, handleSuccessMessages } from "../../../../../store/ducks/notify-messages";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import Confirm from "../../../../../partials/components/Confirm";
import { useSelector } from "react-redux";
import AuditoriaPage from "../../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../../store/ducks/componente/componenteSwitch";
import {
  obtener,
  listar,
  crear,
  actualizar,
  eliminar,
  horarioDia,
  validar
} from "../../../../../api/asistencia/personaHorario.api";
import { servicePersona } from "../../../../../api/administracion/persona.api";
import {
  servicePersonaContrato
} from "../../../../../api/administracion/personaContrato.api";
import { listar as listarMarcacion } from "../../../../../api/asistencia/marcacion.api";
import { convertyyyyMMddToDate, dateFormat, isNotEmpty } from "../../../../../../_metronic";
import PersonaHorarioEditPage from "./PersonaHorarioEditPage";
import PersonaHorarioListPage from "./PersonaHorarioListPage";
import AsistenciaDetalleBuscar from "../../../../../partials/components/AsistenciaDetalleBuscar";
import { obtenerTodos } from "../../../../../api/asistencia/horarioDia.api";
export const initialFilter = {
  IdCliente: '1',
  IdDivision: '',
  IdCompania: '',
  Activo: 'S',
};

const PersonaHorarioIndexPage = (props) => {

  const usuario = useSelector(state => state.auth.user);
  const { IdDivision, IdCliente } = useSelector(state => state.perfil.perfilActual);
  const { intl, setLoading, settingDataField, getInfo, accessButton, varIdPersona, selectedIndex, varIdCompania } = props;
  const [listarHorario, setListarHorario] = useState([]);
  const [listarHorarioDia, setListarHorarioDia] = useState([]);
  const [dateRange, setDateRange] = useState({ FechaInicio: '', FechaFin: '' })
  const [isVisibleDelete, setIsVisibleDelete] = useState(false);
  const [isVisibleAdd, setIsVisibleAdd] = useState(false);
  const [instance, setInstance] = useState({});
  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
  const [focusedRowKey, setFocusedRowKey] = useState();
  const [selected, setSelected] = useState({});
  const [selectedDelete, setSelectedDelete] = useState({});
  const [selectedValidar, setSelectedValidar] = useState({});

  const [isVisibleAlert, setIsVisibleAlert] = useState(false);
  const [fechasContrato, setFechasContrato] = useState({ FechaInicioContrato: null, FechaFinContrato: null });

  //>Horario Dia
  const [isVisiblePopUpHorarioDia, setisVisiblePopUpHorarioDia] = useState(false);
  const [listarPopUpHorarioDia, setListarPopUpHorarioDia] = useState([]);

  //:::::::::::::::::::::::::::::::::::::::::::::-funciones-Persona-:::::::::::::::::::::::::::::::::

  const seleccionarRegistro = async (dataRow) => {
    const { RowIndex } = dataRow;
    if (isNotEmpty(RowIndex)) {
      setSelected(dataRow);
      if (RowIndex !== focusedRowKey) {
        setFocusedRowKey(RowIndex);
      }
    }
  }

  useEffect(() => {
    listarPersonaHorario();
  }, []);


  useEffect(() => {
    if (isNotEmpty(varIdPersona)) obtenerPersonaPeriodoPosicion();
  }, [varIdPersona]);


  //Obtener Fecha Fin del Contrato
  const obtenerPersonaPeriodoPosicion = async () => {
    setLoading(true);
    await servicePersona.obtenerPeriodo({
      IdCliente: IdCliente,
      IdPersona: varIdPersona,
      FechaInicio: dateFormat(new Date(), 'yyyyMMdd'),
      FechaFin: dateFormat(new Date(), 'yyyyMMdd'),
    }).then(response => {
      if (response) {
        if (!isNotEmpty(response.MensajeValidacion)) {
          setIsVisibleAlert(false);
          setFechasContrato({ FechaInicioContrato: response.FechaInicio, FechaFinContrato: response.FechaFin });

        } else {
          setFechasContrato({ FechaInicioContrato: null, FechaFinContrato: null });
          setIsVisibleAlert(true);
          handleInfoMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), response.MensajeValidacion);
        }

      }
    }).finally(x => {
      setLoading(false);
    });
  }


  //::::::::::::::::::::::::::::::::::::::::::::: Funciones Persona Horario ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  const between = (input, date1, date2) => {
    return input >= date1 && input <= date2;
  }

  const prevalidate = (datarow) => {

    let currentHours = listarHorario;

    const { FechaInicio, FechaFin } = datarow;

    let existSomeRange = false;

    for (let element of currentHours) {

      let lfechaInicio = new Date(element.FechaInicio);
      let lfechaFin = new Date(element.FechaFin);

      let isRangeInputStartDate = between(FechaInicio, lfechaInicio, lfechaFin);
      let isRangeInputEndDate = between(FechaFin, lfechaInicio, lfechaFin);

      //debugger;
      if (isRangeInputStartDate && isRangeInputEndDate) {
        existSomeRange = true;
        break;
      }
    };

    return existSomeRange;

  }


  async function agregarPersonaHorario(datarow, confirm, valueConfirm) {
    //console.log("agregarPersonaHorario|datarow:", datarow);  //--->LSF
    setSelectedValidar(datarow);
    if (valueConfirm > 0 && !isNotEmpty(confirm)) {
      setIsVisibleAdd(true);
    } else {
      if (!isNotEmpty(confirm)) confirm = true;
    }
    if (confirm) {
      setLoading(true);

      const { IdCompania, IdHorario, FechaInicio, FechaFin, DiaInicio, Indefinido } = datarow;
      let data = {
        IdCliente
        , IdPersona: varIdPersona
        , IdSecuencial: 0
        , IdDivision: IdDivision
        , IdCompania: isNotEmpty(IdCompania) ? IdCompania : ""
        , IdHorario: isNotEmpty(IdHorario) ? IdHorario : ""
        , FechaInicio: dateFormat(FechaInicio, 'yyyyMMdd')
        , FechaFin: dateFormat(FechaFin, 'yyyyMMdd')
        , DiaInicio: isNotEmpty(DiaInicio) ? DiaInicio : 1
        //, Indefinido: Indefinido ? "N" : "S"
        , Indefinido: Indefinido
        , IdUsuario: usuario.username
      };
      await crear(data).then(response => {
        if (response) {
          handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
          listarPersonaHorario();
          listarPersonaHorarioDia(datarow);
          setModoEdicion(false);
        }
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
    }

  }

  async function actualizarPersonaHorario(datarow) {
    setLoading(true);
    const { IdSecuencial, IdCompania, IdHorario, FechaInicio, FechaFin, DiaInicio, Indefinido } = datarow;
    let data = {
      IdCliente
      , IdPersona: varIdPersona
      , IdSecuencial: isNotEmpty(IdSecuencial) ? IdSecuencial : 0
      , IdDivision: IdDivision
      , IdCompania: isNotEmpty(IdCompania) ? IdCompania.toUpperCase() : ""
      , IdHorario: isNotEmpty(IdHorario) ? IdHorario.toUpperCase() : ""
      , FechaInicio: dateFormat(FechaInicio, 'yyyyMMdd') //(new Date(FechaInicio)).toLocaleString()
      , FechaFin: dateFormat(FechaFin, 'yyyyMMdd')//(new Date(FechaFin)).toLocaleString()
      , DiaInicio: isNotEmpty(DiaInicio) ? DiaInicio : 1
      //, Indefinido//
      , Indefinido: Indefinido //? "N" : "S"
      , IdUsuario: usuario.username
    };
    await actualizar(data).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      setModoEdicion(false);
      listarPersonaHorario();
      listarPersonaHorarioDia(datarow);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function eliminarPersonaHorario(data, confirm) {
    setSelectedDelete(data);
    setIsVisibleDelete(true);
    if (confirm) {
      setLoading(true);
      const { IdCliente, IdPersona, IdSecuencial,IdCompania } = selectedDelete;
      await eliminar({ 
        IdCliente: IdCliente, 
        IdPersona: IdPersona, 
        IdSecuencial: IdSecuencial ,
        IdCompania,
        IdDivision
      }).then(response => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
      listarPersonaHorario();
      //Limpiar calendario
      setListarHorarioDia([]);
    }
  }

  async function listarPersonaHorario() {
    setLoading(true);
    await listar(
      {
        IdCliente
        , IdDivision
        , IdPersona: varIdPersona
      }
    ).then(async data => {
      setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
      setListarHorario(data);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function obtenerPersonaHorario(dataRow) {
    setLoading(true);
    let horarioVencido = obtenerFinUltimaHorarioVencido();

    const { IdCliente, IdPersona, IdSecuencial } = dataRow;
    await obtener({ IdCliente, IdPersona, IdSecuencial }).then(data => {
      setDataRowEditNew({
        ...data, esNuevoRegistro: false,
        
        FechaFinNoIndefinida: data.FechaFin,
        FechaFinMaxHorarioVencido: horarioVencido
      });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function obtenerPersonaMarca(fecha) {
     setLoading(true);  
    const { IdCliente, IdPersona } = selectedIndex;
    let responseData = []; 
    
    await listarMarcacion({ IdCliente, IdDivision, IdPersona, FechaMarca: fecha }).then(data => {
      responseData = data;
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); 
    });
    return responseData;
  }

  function obtenerFinUltimaHorarioVencido() {
    let listaHorariosVencidos = listarHorario.filter(x => x.HorarioActual === "N");
    let HorarioFinMax = null;

    if (listaHorariosVencidos.length > 0) {
      HorarioFinMax = listaHorariosVencidos.reduce(
        function (prev, current) {
          return (prev.FechaFin > current.FechaFin ? prev : current);
        });
    }

    return isNotEmpty(HorarioFinMax) ? HorarioFinMax.FechaFin : null;
  }

  const nuevoPersonaHorario = () => {
    let hoy = new Date();
    let fecInicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    let fecFin = isNotEmpty(fechasContrato.FechaFinContrato)
      ? convertyyyyMMddToDate(fechasContrato.FechaFinContrato)
      : Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    let horarioVencido = obtenerFinUltimaHorarioVencido();
    let data = {
      IdCliente,
      IdPersona: varIdPersona,
      Activo: "S",
      Indefinido: "N",
      FechaInicio: fecInicio,
      FechaFin: fecFin, //---> Fecha que se muestra en el campo Fecha Fin, puede modficiarse
      FechaFinNoIndefinida: fecFin, //---> Fecha del campo Fecha Fin, pero que no se modifica
      FechaFinMaxHorarioVencido: horarioVencido //--> Fecha Fin del ultimo Horario Vencido
    };

    setDataRowEditNew({ ...data, DiaInicio: 1, esNuevoRegistro: true });
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);

  };

  const editarPersonaHorario = async (dataRow) => {
    setModoEdicion(true);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    obtenerPersonaHorario(dataRow);

  };

  const cancelarEdicionPersonaHorario = () => {
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };

  function validationDoubleExecute(fechaInicio, fechaFin) {
    const { FechaInicio, FechaFin } = dateRange;
    if (dateFormat(fechaInicio, 'yyyyMMdd') !== dateFormat(FechaInicio, 'yyyyMMdd') && dateFormat(fechaFin, 'yyyyMMdd') !== dateFormat(FechaFin, 'yyyyMMdd')) {
      setDateRange({ FechaInicio: fechaInicio, FechaFin: fechaFin })
      return true;
    } else {
      return false;
    }

  }

  async function listarPersonaHorarioDia(dataRow) {
    let sCheduler = [];
    const { IdCliente, IdCompania, IdHorario, FechaInicio, FechaFin, IdPersona } = dataRow;

    if (validationDoubleExecute(FechaInicio, FechaFin)) {
      setLoading(true);
      await horarioDia({
        IdCliente,
        IdDivision,
        IdCompania,
        IdHorario: '',
        FechaInicio: dateFormat(FechaInicio, 'yyyyMMdd'),
        FechaFin: dateFormat(FechaFin, 'yyyyMMdd'),
        IdPersona
      }).then(horarios => {
        if (isNotEmpty(horarios)) {

          horarios.map(data => {
            var x = new Date(data.startDate);
            var y = new Date(data.endDate);
            let row = {
              startDate: x,
              endDate: y,
              color: data.Color,
              text: data.Evento,
              descanso: data.Descanso,
              turno: data.Turno,
              inicioHorario: data.InicioHorario,
              idHorario: data.IdHorario,
              dayWeek: data.dayWeek
            };
            sCheduler.push(row);
          });
        }
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false) });

      setListarHorarioDia(sCheduler);
      //console.log("::2::listarPersonaHorarioDia.data", sCheduler);
      setModoEdicion(false);
    }
  }

  //::::::::::::::::::::::::::::::::::::::::::::: Popup Horario día ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  async function obtenerPopUpHorarioDia() {
    setLoading(true);
    const { IdCompania, IdHorario } = selected;
    await obtenerTodos({
      IdCliente
      , IdDivision
      , IdCompania
      , IdHorario
    }).then(data => {
      setListarPopUpHorarioDia(data);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  const detalleHorarioDia = async (dataRow) => {
    const { IdCliente, IDivision, IdCompania, IdHorario } = dataRow;
    obtenerPopUpHorarioDia(IdCliente, IDivision, IdCompania, IdHorario);
    setisVisiblePopUpHorarioDia(true);
  };

  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  return <>

    {modoEdicion && (
      <>
        <PersonaHorarioEditPage
          dataRowEditNew={dataRowEditNew}
          setDataRowEditNew={setDataRowEditNew}
          actualizarPersonaHorario={actualizarPersonaHorario}
          agregarPersonaHorario={agregarPersonaHorario}
          cancelarEdicion={cancelarEdicionPersonaHorario}
          titulo={titulo}
          modoEdicion={modoEdicion}
          settingDataField={settingDataField}
          accessButton={accessButton}
          varIdPersona={varIdPersona}
          varIdCompania={varIdCompania}
          getInfo={getInfo}
          setLoading={setLoading}
          selected={selected}
          // fechaFinContrato={fechaFinContrato}
          isVisibleAlert={isVisibleAlert}
          fechasContrato={fechasContrato}
        />
        <div className="container_extra">
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
        <PersonaHorarioListPage
          personaHorario={listarHorario}
          personaHorarioDia={listarHorarioDia}
          seleccionarRegistro={seleccionarRegistro}
          editarRegistro={editarPersonaHorario}
          eliminarRegistro={eliminarPersonaHorario}
          nuevoRegistro={nuevoPersonaHorario}
          cancelarEdicion={props.cancelarEdicion}
          obtenerPersonaMarca={obtenerPersonaMarca}
          listarPersonaHorarioDia={listarPersonaHorarioDia}
          getInfo={getInfo}
          accessButton={accessButton}
          focusedRowKey={focusedRowKey}
          dataRowEditNew={dataRowEditNew}
          selectedIndex={selectedIndex}
          viewPoppup={detalleHorarioDia}
        />
      </>
    )}


    <AsistenciaDetalleBuscar
      listDetalle={listarPopUpHorarioDia}
      showPopup={{ isVisiblePopUp: isVisiblePopUpHorarioDia, setisVisiblePopUp: setisVisiblePopUpHorarioDia }}
      cancelar={() => setisVisiblePopUpHorarioDia(false)}
      showButton={false}
    />

    <Confirm
      message={intl.formatMessage({ id: "ALERT.REMOVE" })}
      isVisible={isVisibleDelete}
      setIsVisible={setIsVisibleDelete}
      setInstance={setInstance}
      onConfirm={() => eliminarPersonaHorario(selectedDelete, true)}
      title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
      confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
      cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
    />
    <Confirm
      message={intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.ALERT" })}
      isVisible={isVisibleAdd}
      setIsVisible={setIsVisibleAdd}
      setInstance={setInstance}
      onConfirm={() => agregarPersonaHorario(selectedValidar, true)}
      title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
      confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
      cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
    />

  </>
};

export default injectIntl(WithLoandingPanel(PersonaHorarioIndexPage));
