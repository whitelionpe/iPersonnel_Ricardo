import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";

import { isNotEmpty, dateFormat } from "../../../../../../_metronic";

//import { useStylesEncabezado, useStylesTab } from "../../../../../store/config/Styles";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import Confirm from "../../../../../partials/components/Confirm";

import {
  handleErrorMessages,
  handleSuccessMessages,
  handleInfoMessages,
} from "../../../../../store/ducks/notify-messages";

import AuditoriaPage from "../../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../../store/ducks/componente/componenteSwitch";

import {
  listar,
  obtener,
  crear,
  actualizar,
  eliminar
} from "../../../../../api/acceso/personaRestriccion.api";
import { servicePersona } from "../../../../../api/administracion/persona.api";

import PersonaRestriccionEditPage from "../../persona/restriccion/PersonaRestriccionEditPage";
import PersonaRestriccionListPage from "../../persona/restriccion/PersonaRestriccionListPage";

import { uploadFile } from "../../../../../api/helpers/fileBase64.api";

const PersonaRestriccionIndexPage = (props) => {
  const { intl, setLoading, getInfo, accessButton, settingDataField, varIdPersona, cancelarEdicion, idAplicacion, idMenu, idModulo } = props;
  const usuario = useSelector(state => state.auth.user);
  const { IdCliente, IdDivision } = useSelector(state => state.perfil.perfilActual);

  const [listarTabs, setListarTabs] = useState([]);
  const [focusedRowKey, setFocusedRowKey] = useState(0);

  const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);

  const [isVisible, setIsVisible] = useState(false);
  const [, setInstance] = useState({});
  const [selectedDelete, setSelectedDelete] = useState({});
  const [fechasContrato, setFechasContrato] = useState({ FechaInicioContrato: null, FechaFinContrato: null });

  //:::::::::::::::::::::::::::::::::::::::::::::-funciones-Restriccion-Persona-:::::::::::::::::::::::::::::::::

  async function listarRestriccion() {
    setModoEdicion(false);
    let restriccion = await listar({
      IdCliente: IdCliente,
      IdPersona: varIdPersona,
      IdRestriccion: '%'
    }).catch((err) => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    });
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setListarTabs(restriccion);
  }

  async function agregarRestriccion(restriccion) {
    setLoading(true);
    const {
      IdSecuencial,
      IdRestriccion,
      FechaInicio,
      FechaFin,
      HoraInicio,
      HoraFin,
      FlgDiaCompleto, NombreArchivo, FileBase64, FechaArchivo, Restriccion } = restriccion;
    let params = {
      IdCliente: IdCliente,
      IdPersona: varIdPersona,
      IdRestriccion: isNotEmpty(IdRestriccion) ? IdRestriccion : "",
      IdSecuencial: isNotEmpty(IdSecuencial) ? IdSecuencial : 0,
      IdDivision: IdDivision,
      FechaInicio: isNotEmpty(FechaInicio) ? dateFormat(FechaInicio, 'yyyyMMdd') : "",
      FechaFin: isNotEmpty(FechaFin) ? dateFormat(FechaFin, 'yyyyMMdd') : "",
      HoraInicio: isNotEmpty(HoraInicio) ? dateFormat(HoraInicio, "hh:mm") : "",
      HoraFin: isNotEmpty(HoraFin) ? dateFormat(HoraFin, "hh:mm") : "",
      FlgDiaCompleto: isNotEmpty(FlgDiaCompleto) ? FlgDiaCompleto : "",
      FileBase64: isNotEmpty(FileBase64) ? FileBase64 : "",
      NombreArchivo: isNotEmpty(NombreArchivo) ? NombreArchivo : "",
      IdItemSharepoint: "",
      ClaseArchivo: isNotEmpty(Restriccion) ? Restriccion : "",
      FechaArchivo: isNotEmpty(FechaArchivo) ? FechaArchivo : "",
      IdUsuario: usuario.username,
      PathFile: "",
      IdModulo: idModulo,
      IdAplicacion: idAplicacion,
      IdMenu: idMenu
    };

    if (isNotEmpty(FileBase64)) {
      //Restricción con archivo.
      await uploadFile(params).then(response => {
        //Recuperar Nombre archivo.
        const { nombreArchivo, idItemSharepoint } = response;
        params.NombreArchivo = nombreArchivo;
        params.IdItemSharepoint = idItemSharepoint;
        
        crear(params)
          .then((response) => {
            if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
            listarRestriccion();
          })
          .catch((err) => {
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
          }).finally(() => { setLoading(false); });
      }).catch((err) => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
    } else {
      //Restricción sin archivo.
      await crear(params)
        .then((response) => {
          if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
          listarRestriccion();
        })
        .catch((err) => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
    }
  }

  async function actualizarRestriccion(restriccion) {
    setLoading(true);
    const {
      IdCliente,
      IdPersona,
      IdRestriccion,
      IdSecuencial,
      IdDivision,
      FechaInicio,
      FechaFin,
      HoraInicio,
      HoraFin,
      FlgDiaCompleto, NombreArchivo, FileBase64, FechaArchivo, Restriccion, IdItemSharepoint
    } = restriccion;
    let params = {
      IdCliente: IdCliente,
      IdPersona: IdPersona,
      IdRestriccion: isNotEmpty(IdRestriccion) ? IdRestriccion : "",
      IdSecuencial: IdSecuencial,
      IdDivision: IdDivision,
      FechaInicio: isNotEmpty(FechaInicio) ? dateFormat(FechaInicio, 'yyyyMMdd') : "",
      FechaFin: isNotEmpty(FechaFin) ? dateFormat(FechaFin, 'yyyyMMdd') : "",
      HoraInicio: isNotEmpty(HoraInicio) ? dateFormat(HoraInicio, "hh:mm") : "",
      HoraFin: isNotEmpty(HoraFin) ? dateFormat(HoraFin, "hh:mm") : "",
      FlgDiaCompleto: isNotEmpty(FlgDiaCompleto) ? FlgDiaCompleto : "",
      FileBase64: isNotEmpty(FileBase64) ? FileBase64 : "",
      NombreArchivo: isNotEmpty(NombreArchivo) ? NombreArchivo : "",
      IdItemSharepoint: isNotEmpty(IdItemSharepoint) ? IdItemSharepoint : "",
      ClaseArchivo: isNotEmpty(Restriccion) ? Restriccion : "",
      FechaArchivo: isNotEmpty(FechaArchivo) ? FechaArchivo : "",
      IdUsuario: usuario.username,
      PathFile: "",
      IdModulo: idModulo,
      IdAplicacion: idAplicacion,
      IdMenu: idMenu
    };

    if (isNotEmpty(FileBase64)) {
      //Requisito con archivo.
      await uploadFile(params).then(response => {
        //Restricción Nombre archivo.
        const { nombreArchivo, idItemSharepoint } = response;
        params.NombreArchivo = nombreArchivo;
        params.IdItemSharepoint = idItemSharepoint;

        actualizar(params)
          .then(() => {
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
            listarRestriccion();
          }).catch((err) => {
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
          }).finally(() => { setLoading(false); });
      }).catch((err) => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
    } else {
      //Restricción sin archivo.
      await actualizar(params)
        .then(() => {
          handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
          listarRestriccion();
        }).catch((err) => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
    }

  }

  async function eliminarRegistro(dataRow, confirm) {
    setSelectedDelete(dataRow);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdCliente, IdPersona, IdRestriccion, IdSecuencial } = selectedDelete;
      await eliminar({
        IdCliente: IdCliente,
        IdPersona: IdPersona,
        IdRestriccion: IdRestriccion,
        IdSecuencial: IdSecuencial,
      })
        .then(() => {
          handleSuccessMessages(
            intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" })
          );
        })
        .catch((err) => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
      listarRestriccion();
    }
  }

  async function obtenerRestriccion(dataRow) {

    const { IdCliente, IdPersona, IdRestriccion, IdSecuencial } = dataRow;

    if (IdPersona) {
      let Restriccion = await obtener({
        IdCliente: IdCliente,
        IdPersona: IdPersona,
        IdRestriccion: IdRestriccion,
        IdSecuencial: IdSecuencial,
      }).catch((err) => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      });
      setDataRowEditNew({ ...Restriccion, esNuevoRegistro: false });
    }
  }

  const seleccionarRegistro = (dataRow) => {
    const { RowIndex } = dataRow;
    setFocusedRowKey(RowIndex);
  };

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
    obtenerRestriccion(dataRow);
  };


  const nuevoRegistro = async () => {

    setDataRowEditNew({});
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
          let nuevo = { Activo: "S", FechaInicio: fecInicio, FechaFin: fecFin, HoraInicio: '2020-01-01 00:00:00.000', HoraFin: '2020-01-01 23:59:00.000' };
          setDataRowEditNew({
            ...nuevo,
            esNuevoRegistro: true,
          });
          setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
          setModoEdicion(true);

        } else {
          setFechasContrato({ FechaInicioContrato: null, FechaFinContrato: null });
          handleInfoMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), response.MensajeValidacion);
        }
      }
    }).finally(x => {
      setLoading(false);
    });

  };

  const cancelarEdicionRestriccion = () => {
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});

  };


  useEffect(() => {
    listarRestriccion();
  }, []);

  return <>

    {modoEdicion && (
      <>
        <PersonaRestriccionEditPage
          modoEdicion={modoEdicion}
          dataRowEditNew={dataRowEditNew}
          actualizarRestriccion={actualizarRestriccion}
          agregarRestriccion={agregarRestriccion}
          cancelarEdicion={cancelarEdicionRestriccion}
          titulo={titulo}
          accessButton={accessButton}
          settingDataField={settingDataField}
          varIdPersona={varIdPersona}
          showHeaderInformation={true}
          getInfo={getInfo}
          setDataRowEditNew={setDataRowEditNew}
          fechasContrato={fechasContrato}
          idModulo={idModulo}
          idAplicacion={idAplicacion}
          idMenu={idMenu}
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
        <PersonaRestriccionListPage
          personaRestriccionData={listarTabs}
          editarRegistro={editarRegistro}
          eliminarRegistro={eliminarRegistro}
          nuevoRegistro={nuevoRegistro}
          seleccionarRegistro={seleccionarRegistro}
          focusedRowKey={focusedRowKey}
          accessButton={accessButton}
          getInfo={getInfo}
          cancelarEdicion={cancelarEdicion}
          idModulo={idModulo}
          idAplicacion={idAplicacion}
          idMenu={idMenu}
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



export default injectIntl(WithLoandingPanel(PersonaRestriccionIndexPage));
