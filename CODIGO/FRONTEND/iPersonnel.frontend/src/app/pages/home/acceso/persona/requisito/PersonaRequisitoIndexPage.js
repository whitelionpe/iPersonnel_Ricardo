import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";

import { isNotEmpty, dateFormat } from "../../../../../../_metronic";

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
  listarVigentes,
  obtener,
  crear,
  actualizar,
  eliminar,
  listarHistorial
} from "../../../../../api/acceso/personaRequisito.api";

import PersonaRequisitoEditPage from "../../persona/requisito/PersonaRequisitoEditPage";
import PersonaRequisitoListPage from "../../persona/requisito/PersonaRequisitoListPage";
import { servicePersona } from "../../../../../api/administracion/persona.api";
import { uploadFile } from "../../../../../api/helpers/fileBase64.api";
import PropTypes from 'prop-types';

const PersonaRequisitoIndexPage = (props) => {
  const { intl, setLoading, getInfo, accessButton, settingDataField, varIdPersona, documento, cancelarEdicion, idAplicacion, idMenu, idModulo } = props;
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
  const [, setInstance] = useState({});
  const [selectedDelete, setSelectedDelete] = useState({});
  //const [fechasContrato, setFechasContrato] = useState({ FechaInicioContrato: null, FechaFinContrato: null });


  const [requisitosHistorialData, setRequisitosHistorialData] = useState([])

  async function agregarRequisito(dataRow) {
    setLoading(true);
    const { IdRequisito, FechaInicio, FechaFin, IdSecuencial, Requisito, NombreArchivo, FileBase64, FechaArchivo } = dataRow;
    let params = {
      IdDivision: IdDivision,
      IdCliente: IdCliente,
      IdPersona: varIdPersona,
      IdRequisito: isNotEmpty(IdRequisito) ? IdRequisito : "",
      IdSecuencial: isNotEmpty(IdSecuencial) ? IdSecuencial : 0,
      FechaInicio: isNotEmpty(FechaInicio) ? dateFormat(FechaInicio, 'yyyyMMdd') : "",
      FechaFin: isNotEmpty(FechaFin) ? dateFormat(FechaFin, 'yyyyMMdd') : "",
      FileBase64: isNotEmpty(FileBase64) ? FileBase64 : "",
      NombreArchivo: isNotEmpty(NombreArchivo) ? documento + '_0_' + IdRequisito + NombreArchivo.substring(NombreArchivo.lastIndexOf('.'), NombreArchivo.length) : "",
      IdItemSharepoint: "",
      ClaseArchivo: isNotEmpty(Requisito) ? Requisito : "",
      FechaArchivo: isNotEmpty(FechaArchivo) ? FechaArchivo : "",
      IdUsuario: usuario.username,
      PathFile: "",
      IdModulo: idModulo,
      IdAplicacion: idAplicacion,
      IdMenu: idMenu,
      IdItemSharepoint: ""
    };
    if (isNotEmpty(FileBase64)) {
      //Requisito con archivo.
      await uploadFile(params).then(response => {
        //Recuperar Nombre archivo.
        const { nombreArchivo, idItemSharepoint } = response;
        params.NombreArchivo = nombreArchivo;
        params.IdItemSharepoint = idItemSharepoint;
        crear(params)
          .then((response) => {
            if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
            listarRequisito();
          })
          .catch((err) => {
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
          }).finally(() => { setLoading(false); });
      }).catch((err) => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
    } else {
      //Requisito sin archivo.
      await crear(params)
        .then((response) => {
          if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
          listarRequisito();
        })
        .catch((err) => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
    }
  }

  async function actualizarRequisito(dataRow) {
    setLoading(true);
    const { IdCliente, IdPersona, IdRequisito, FechaInicio, FechaFin, IdSecuencial, Requisito, NombreArchivo, FileBase64, FechaArchivo, IdItemSharepoint } = dataRow;
    let params = {
      IdDivision: IdDivision,
      IdCliente: IdCliente,
      IdPersona: IdPersona,
      IdRequisito: isNotEmpty(IdRequisito) ? IdRequisito : "",
      IdSecuencial: isNotEmpty(IdSecuencial) ? IdSecuencial : 0,
      FechaInicio: isNotEmpty(FechaInicio) ? dateFormat(FechaInicio, 'yyyyMMdd') : "",
      FechaFin: isNotEmpty(FechaFin) ? dateFormat(FechaFin, 'yyyyMMdd') : "",
      FileBase64: isNotEmpty(FileBase64) ? FileBase64 : "",
      NombreArchivo: isNotEmpty(NombreArchivo) ? documento + '_0_' + IdRequisito + NombreArchivo.substring(NombreArchivo.lastIndexOf('.'), NombreArchivo.length) : "",
      IdItemSharepoint: isNotEmpty(IdItemSharepoint) ? IdItemSharepoint : "",
      ClaseArchivo: isNotEmpty(Requisito) ? Requisito : "",
      FechaArchivo: isNotEmpty(FechaArchivo) ? FechaArchivo : "",
      IdUsuario: usuario.username,
      PathFile: "",
      IdModulo: idModulo,
      IdAplicacion: idAplicacion,
      IdMenu: idMenu,
    };

    if (isNotEmpty(FileBase64)) {
      //Requisito con archivo.
      await uploadFile(params).then(response => {
        //Recuperar Nombre archivo.
        const { nombreArchivo, idItemSharepoint } = response;
        params.NombreArchivo = nombreArchivo;
        params.IdItemSharepoint = idItemSharepoint;

        actualizar(params)
          .then(() => {
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
            listarRequisito();
          })
          .catch((err) => {
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
          }).finally(() => { setLoading(false); });
      }).catch((err) => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
    } else {
      //Requisito sin archivo.
      await actualizar(params)
        .then(() => {
          handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
          listarRequisito();
        })
        .catch((err) => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
    }

  }

  async function eliminarRegistro(dataRow, confirm) {
    setSelectedDelete(dataRow);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const {
        IdDivision,
        IdCliente,
        IdPersona,
        IdRequisito,
        IdSecuencial,
      } = selectedDelete;
      await eliminar({
        IdDivision,
        IdCliente,
        IdPersona,
        IdRequisito,
        IdSecuencial,
        IdUsuario: usuario.username,
      })
        .then(() => {
          handleSuccessMessages(
            intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" })
          );
        })
        .catch((err) => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
      listarRequisito();
    } else {
      let { Nombre, Apellido } = selected;
      setSelected({ ...dataRow, Nombre, Apellido });
      setIsVisible(true);
    }
  }

  async function obtenerRequisito(dataRow) {
    setLoading(true);
    const {
      IdDivision,
      IdCliente,
      IdPersona,
      IdRequisito,
      IdSecuencial,
    } = dataRow;
    if (IdPersona) {
      let requisito = await obtener({
        IdDivision,
        IdCliente,
        IdPersona,
        IdRequisito,
        IdSecuencial,
      }).catch((err) => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
      setDataRowEditNew({ ...requisito, esNuevoRegistro: false });
    }
  }

  async function listarRequisito() {
    setModoEdicion(false);
    let data = await listarVigentes({
      IdCliente: IdCliente,
      IdPersona: varIdPersona,
      IdRequisito: '%',

    }).catch((err) => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    });
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setListarTabs(data);
  }

  const seleccionarRegistro = (dataRow) => {
    const { RowIndex } = dataRow;
    setFocusedRowKey(RowIndex);
  };

  const editarRegistro = async (dataRow) => {

    // setLoading(true);
    // await servicePersona.obtenerPeriodo({
    //   IdCliente: IdCliente,
    //   IdPersona: varIdPersona,
    //   FechaInicio: dateFormat(new Date(), 'yyyyMMdd'),
    //   FechaFin: dateFormat(new Date(), 'yyyyMMdd'),
    // }).then(response => {
    //   if (response) {
    //     if (!isNotEmpty(response.MensajeValidacion)) {
    //       setFechasContrato({ FechaInicioContrato: response.FechaInicio, FechaFinContrato: response.FechaFin });
    //     } else {
    //       setFechasContrato({ FechaInicioContrato: null, FechaFinContrato: null });
    //       handleInfoMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), response.MensajeValidacion);
    //     }
    //   }
    // }).finally(x => {
    //   setLoading(false);
    // });

    setModoEdicion(true);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    obtenerRequisito(dataRow);
  };



  async function listarHistorialRequisito(dataRow) {
    const { IdCliente, IdDivision, IdPersona, IdRequisito } = dataRow;

    let data = await listarHistorial({
      IdCliente,
      IdDivision,
      IdPersona,
      IdRequisito
    }).catch((err) => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    });
    setRequisitosHistorialData(data);
  };

  const nuevoRegistro = async () => {
    setDataRowEditNew({});
    setLoading(true);
    // await servicePersona.obtenerPeriodo({
    //   IdCliente: IdCliente,
    //   IdPersona: varIdPersona,
    //   FechaInicio: dateFormat(new Date(), 'yyyyMMdd'),
    //   FechaFin: dateFormat(new Date(), 'yyyyMMdd'),
    // }).then(response => {
    //   if (response) {
    //     if (!isNotEmpty(response.MensajeValidacion)) {
    //       setFechasContrato({ FechaInicioContrato: response.FechaInicio, FechaFinContrato: response.FechaFin });

    // let fecInicio = parseInt(response.FechaInicio) >  parseInt(dateFormat(new Date(), 'yyyyMMdd')) ? new Date(response.FechaInicio.substring(0, 4), response.FechaInicio.substring(4, 6) - 1, response.FechaInicio.substring(6, 8)) : new Date();
    // let fecFin = new Date(response.FechaFin.substring(0, 4), response.FechaFin.substring(4, 6) - 1, response.FechaFin.substring(6, 8));
    let nuevo = { Activo: "S" }; //FechaInicio: fecInicio,FechaFin: fecFin};
    setDataRowEditNew({
      ...nuevo,
      esNuevoRegistro: true,
    });
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);

    //     } else {
    //       setFechasContrato({ FechaInicioContrato: null, FechaFinContrato: null });
    //       handleInfoMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), response.MensajeValidacion);
    //     }
    //   }
    // }).finally(x => {
    //   setLoading(false);
    // });
    setLoading(false);

  };

  const cancelarEdicionRequisito = () => {
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});

  };


  useEffect(() => {
    listarRequisito();
  }, []);

  return <>

    {modoEdicion && (
      <>
        <PersonaRequisitoEditPage
          modoEdicion={modoEdicion}
          dataRowEditNew={dataRowEditNew}
          actualizarRequisito={actualizarRequisito}
          agregarRequisito={agregarRequisito}
          cancelarEdicion={cancelarEdicionRequisito}
          titulo={titulo}
          accessButton={accessButton}
          settingDataField={settingDataField}
          varIdPersona={varIdPersona}
          showHeaderInformation={true}
          getInfo={getInfo}
          setDataRowEditNew={setDataRowEditNew}
          // fechasContrato = {fechasContrato}
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
        <PersonaRequisitoListPage
          personaRequisitosData={listarTabs}
          editarRegistro={editarRegistro}
          eliminarRegistro={eliminarRegistro}
          nuevoRegistro={nuevoRegistro}
          seleccionarRegistro={seleccionarRegistro}
          focusedRowKey={focusedRowKey}
          accessButton={accessButton}
          getInfo={getInfo}
          cancelarEdicion={cancelarEdicion}
          listarHistorialRequisito={listarHistorialRequisito}
          requisitosHistorialData={requisitosHistorialData}
          showButtons={props.showButtons}
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

PersonaRequisitoIndexPage.propTypes = {
  showButtons: PropTypes.bool,
}
PersonaRequisitoIndexPage.defaultProps = {
  showButtons: true,
}

export default injectIntl(WithLoandingPanel(PersonaRequisitoIndexPage));
