import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";

import { isNotEmpty, dateFormat, validarUsoLicencia } from "../../../../../../_metronic";

import { handleErrorMessages, handleSuccessMessages, handleWarningMessages, handleInfoMessages } from "../../../../../store/ducks/notify-messages";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import Confirm from "../../../../../partials/components/Confirm";

import AuditoriaPage from "../../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../../store/ducks/componente/componenteSwitch";

import {
  listar,
  obtener,
  crear,
  actualizar,
  eliminar,

} from "../../../../../api/acceso/personaGrupo.api";
import { serviceAccesoGrupoPuerta } from "../../../../../api/acceso/grupoPuerta.api";

import PersonaGrupoListPage from "./PersonaGrupoListPage";
import PersonaGrupoEditPage from "./PersonaGrupoEditPage";
import { listar as listarHorarioDia } from "../../../../../api/acceso/horarioDia.api";
import { servicePersona } from "../../../../../api/administracion/persona.api";


const varFechaReferencia = "20200525";

const PersonaGrupoIndexPage = (props) => {
  const { intl, setLoading, getInfo, accessButton, settingDataField, varIdPersona, cancelarEdicion } = props;
  const usuario = useSelector(state => state.auth.user);
  const { IdCliente, IdDivision } = useSelector(state => state.perfil.perfilActual);

  const [listarTabs, setListarTabs] = useState([]);
  const [focusedRowKey, setFocusedRowKey] = useState(0);

  const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const [selected, setSelected] = useState({});

  const [isVisible, setIsVisible] = useState(false);
  const [instance, setInstance] = useState({});
  const [selectedDelete, setSelectedDelete] = useState({});

  const [varIdGrupo, setVarIdGrupo] = useState("");
  const [grupoPuertaData, setGrupoPuerta] = useState([]);
  const [dataDetalleHorarios, setDataDetalleHorarios] = useState([]);
  const [fechasContrato, setFechasContrato] = useState({ FechaInicioContrato: null, FechaFinContrato: null });

  //:::::::::::::::::::::::::::::::::::::::::::::-Funciones-Grupo-Persona:::::::::::::::::::::::::::::::::

  async function listarGrupo() {
    setModoEdicion(false);
    let grupos = await listar({
      IdDivision: IdDivision,
      IdCliente: IdCliente,
      IdPersona: varIdPersona,
    }).catch((err) => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    });
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setListarTabs(grupos);
  }

  async function agregarGrupo(grupo) {
    setLoading(true);
    const { IdGrupo, FechaInicio, FechaFin, IdSecuencial } = grupo;
    let params = {
      IdPersona: varIdPersona,
      IdSecuencial: isNotEmpty(IdSecuencial) ? IdSecuencial : 0,
      FechaInicio: isNotEmpty(FechaInicio) ? dateFormat(FechaInicio, 'yyyyMMdd') : "",
      FechaFin: isNotEmpty(FechaFin) ? dateFormat(FechaFin, 'yyyyMMdd') : "",
      IdCliente: IdCliente,
      IdDivision: IdDivision,
      IdGrupo: isNotEmpty(IdGrupo) ? IdGrupo : "",
      IdUsuario: usuario.username,
    };
    await crear(params)
      .then((response) => {
        if (response)
          handleSuccessMessages(
            intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" })
          );
        listarGrupo();
      })
      .catch((err) => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
  }

  async function actualizarGrupo(dataRow) {
    setLoading(true);
    const { IdPersona, IdCliente, IdDivision, IdGrupo, IdSecuencial, FechaInicio, FechaFin } = dataRow;
    let params = {
      IdCliente: IdCliente,
      IdDivision: IdDivision,
      IdPersona: IdPersona,
      IdSecuencial: IdSecuencial,
      FechaInicio: isNotEmpty(FechaInicio) ? dateFormat(FechaInicio, 'yyyyMMdd') : "",
      FechaFin: isNotEmpty(FechaFin) ? dateFormat(FechaFin, 'yyyyMMdd') : "",
      IdGrupo: isNotEmpty(IdGrupo) ? IdGrupo : "",
      IdUsuario: usuario.username,
    };
    await actualizar(params)
      .then(() => {
        handleSuccessMessages(
          intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" })
        );
        listarGrupo();
      })
      .catch((err) => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
  }

  async function eliminarRegistro(grupo, confirm) {
    setSelectedDelete(grupo);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdCliente, IdDivision, IdPersona, IdGrupo, IdSecuencial } = selectedDelete;
      await eliminar({
        IdCliente: IdCliente,
        IdDivision: IdDivision,
        IdPersona: IdPersona,
        IdGrupo: IdGrupo,
        IdSecuencial: IdSecuencial
      })
        .then(() => {
          handleSuccessMessages(
            intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" })
          );
        })
        .catch((err) => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
      listarGrupo();
    } else {
      let { Nombre, Apellido } = selected;
      setSelected({ ...grupo, Nombre, Apellido });
      setIsVisible(true);
    }
  }


  async function obtenerGrupo(filtro) {
    const { IdCliente, IdDivision, IdPersona, IdGrupo, IdSecuencial } = filtro;
    if (IdPersona) {
      let grupo = await obtener({
        IdCliente: IdCliente,
        IdDivision: IdDivision,
        IdPersona: IdPersona,
        IdGrupo: IdGrupo,
        IdSecuencial: IdSecuencial
      }).catch((err) => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      });
      setDataRowEditNew({ ...grupo, esNuevoRegistro: false });
    }
  }

  const editarRegistro = async (dataRow) => {

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

    setModoEdicion(true);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    obtenerGrupo(dataRow);
  };

  const seleccionarRegistro = dataRow => {
    const { RowIndex, IdGrupo } = dataRow;

    setFocusedRowKey(RowIndex);
    setSelected(dataRow)

    setVarIdGrupo(IdGrupo);
  };

  const cancelarEdicionGrupo = () => {
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };


  const nuevoRegistroTabs = async () => {

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

          let fecInicio = parseInt(response.FechaInicio) > parseInt(dateFormat(new Date(), 'yyyyMMdd')) ? new Date(response.FechaInicio.substring(0, 4), response.FechaInicio.substring(4, 6) - 1, response.FechaInicio.substring(6, 8)) : new Date();
          let fecFin = new Date(response.FechaFin.substring(0, 4), response.FechaFin.substring(4, 6) - 1, response.FechaFin.substring(6, 8));

          let nuevo = { Activo: "S", FechaInicio: fecInicio, FechaFin: fecFin };
          setDataRowEditNew({});
          setDataRowEditNew({
            ...nuevo,
            esNuevoRegistro: true,
            isReadOnly: false,
            IdVehiculo: 0,
          });
          setModoEdicion(true);

        } else {
          setFechasContrato({ FechaInicioContrato: null, FechaFinContrato: null });
          handleInfoMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), response.MensajeValidacion);
        }
      }
    }).finally(x => {
      setLoading(false);
    });
    setLoading(false);


  };


  const nuevoRegistro = async () => {
    let nextRow = true;
    await validarUsoLicencia({
      IdCliente: IdCliente,
      IdModulo: props.dataMenu.info.IdModulo,
    }).then(response => {
      nextRow = response;

      // console.log("nuevoRegistro|listarTabs:",listarTabs);

      if (isNotEmpty(listarTabs)) {
        let arr_activos = listarTabs.filter(x => x.Activo == 'S');
        if (arr_activos.length > 0 && nextRow) {
          handleWarningMessages(intl.formatMessage({ id: "IDENTIFICATION.MANAGEMENT.VALIDATE.MESSAGE" }));
          return;
        }
      }

      if (nextRow) nuevoRegistroTabs();
    })
  };


  async function listarTVGrupoPuerta() {
    setLoading(true);
    const { IdCliente, IdDivision, IdGrupo } = selected;
    await serviceAccesoGrupoPuerta.listarTreeViewGrupoPuerta({
      IdCliente,
      IdDivision,
      IdGrupo,
      numPagina: 0,
      tamPagina: 0
    })
      .then(grupoPuerta => {
        setGrupoPuerta(grupoPuerta);
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
      }).finally(() => {
        setLoading(false);
      });
  }



  const verGrupoPuerta = async (dataRow) => {
    setSelected(dataRow);
    listarTVGrupoPuerta();
  };



  async function listar_HorarioDia() {

    const { IdCliente, IdDivision, IdHorario } = selected;
    let horarioDia = await listarHorarioDia({ IdCliente, IdDivision, IdHorario, FechaReferencia: varFechaReferencia }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    });
    //Construir data del calendario
    let sCheduler = [];
    horarioDia.map(data => {
      var x = new Date(data.HoraInicio);
      var y = new Date(data.HoraFin);
      let row = {
        text: data.Evento,
        startDate: new Date(x.getFullYear(), x.getMonth(), x.getDate(), x.getHours(), x.getMinutes()),
        endDate: new Date(y.getFullYear(), y.getMonth(), y.getDate(), y.getHours(), y.getMinutes()),
        IdHorario: data.IdHorario,
        Dia: data.Dia,
        Intervalo: data.Intervalo,
        allDay: data.TodoDia === 1 ? true : false
      };
      sCheduler.push(row);
    });
    //setListarTabs(sCheduler);
    setDataDetalleHorarios(sCheduler);
    listarGrupo();
    //console.log("listar_HorarioDia -> sCheduler: ", sCheduler);
    //setModoEdicion(false);
  }

  const verDetalleHorario = async (dataRow) => {
    setSelected(dataRow);
    listar_HorarioDia()
  };

  useEffect(() => {
    listarGrupo();
  }, []);

  return <>

    {modoEdicion && (
      <>
        <PersonaGrupoEditPage
          modoEdicion={modoEdicion}
          dataRowEditNew={dataRowEditNew}
          actualizarGrupo={actualizarGrupo}
          agregarGrupo={agregarGrupo}
          cancelarEdicion={cancelarEdicionGrupo}
          titulo={titulo}
          accessButton={accessButton}
          settingDataField={settingDataField}
          varIdPersona={varIdPersona}
          showHeaderInformation={true}
          getInfo={getInfo}
          setDataRowEditNew={setDataRowEditNew}

          verGrupoPuerta={verGrupoPuerta}
          grupoPuertaData={grupoPuertaData}
          selected={props.selectedIndex}
          IdCliente={IdCliente}
          IdDivision={IdDivision}
          fechasContrato={fechasContrato}
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
    )}
    {!modoEdicion && (
      <>
        <PersonaGrupoListPage
          personaGrupos={listarTabs}

          editarRegistro={editarRegistro}
          eliminarRegistro={eliminarRegistro}

          nuevoRegistro={nuevoRegistro}
          seleccionarRegistro={seleccionarRegistro}
          verDetalleHorario={verDetalleHorario}
          verGrupoPuerta={verGrupoPuerta}

          accessButton={accessButton}
          getInfo={getInfo}
          cancelarEdicion={cancelarEdicion}
          grupoPuertaData={grupoPuertaData}
          dataDetalleHorarios={dataDetalleHorarios}

          focusedRowKey={focusedRowKey}
          selected={props.selectedIndex}

        />
      </>
    )}

    <Confirm
      message={intl.formatMessage({ id: "ALERT.REMOVE" })}
      isVisible={isVisible}
      setIsVisible={setIsVisible}
      setInstance={setInstance}
      onConfirm={() => eliminarRegistro(selectedDelete, true)}
      title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
      confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
      cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
    />
  </>

};



export default injectIntl(WithLoandingPanel(PersonaGrupoIndexPage));
