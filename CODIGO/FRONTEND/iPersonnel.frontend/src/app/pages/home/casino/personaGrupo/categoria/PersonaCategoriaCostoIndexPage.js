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
  listar ,
  obtener ,
  crear ,
  actualizar ,
  eliminar ,
} from "../../../../../api/casino/personaCategoriaCosto.api";

import { servicePersona } from "../../../../../api/administracion/persona.api";

import PersonaCategoriaCostoEditPage from "../../personaGrupo/categoria/PersonaCategoriaCostoEditPage";
import PersonaCategoriaCostoListPage from "../../personaGrupo/categoria/PersonaCategoriaCostoListPage";
 
const PersonaCategoriaCostoIndexPage = (props) => {
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

  const [fechasContrato, setFechasContrato] = useState({ FechaInicioContrato: null, FechaFinContrato: null });


  //:::CATEGORÍA COSTO::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  async function agregarCategoriaCosto(categoriaCosto) {
    setLoading(true);
    const { IdSecuencial, IdCategoriaCosto, FechaInicial, FechaFinal, Activo } = categoriaCosto;
    let params = {
        IdCliente: IdCliente
      , IdPersona: varIdPersona
      , IdSecuencial: isNotEmpty(IdSecuencial) ? IdSecuencial : 0
      , IdCategoriaCosto: isNotEmpty(IdCategoriaCosto) ? IdCategoriaCosto.toUpperCase() : ""
      , FechaInicial: isNotEmpty(FechaInicial) ? dateFormat(FechaInicial,'yyyyMMdd')  : ""
      , FechaFinal: isNotEmpty(FechaFinal) ? dateFormat(FechaFinal,'yyyyMMdd') : ""
      , Activo
      , IdUsuario: usuario.username
    };
    await crear(params).then(response => {
      if (response)
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      listarCategoriaCosto();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false) });
  }

  async function actualizarCategoriaCosto(categoriaCosto) {
    setLoading(true);
    const { IdCliente,IdSecuencial,IdPersona, IdCategoriaCosto, FechaInicial, FechaFinal, Activo } = categoriaCosto;
    let params = {
        IdCliente: IdCliente
      , IdPersona: IdPersona
      , IdSecuencial: IdSecuencial
      , IdCategoriaCosto: isNotEmpty(IdCategoriaCosto) ? IdCategoriaCosto.toUpperCase() : ""
      , FechaInicial: isNotEmpty(FechaInicial) ? dateFormat(FechaInicial,'yyyyMMdd')  : ""
      , FechaFinal: isNotEmpty(FechaFinal) ? dateFormat(FechaFinal,'yyyyMMdd') : ""
      , Activo: Activo
      , IdUsuario: usuario.username

    };
    await actualizar(params).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      listarCategoriaCosto();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false) });
  }

  async function eliminarCategoriaCosto(personaCategoria, confirm) {
    setSelectedDelete(personaCategoria);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdCliente, IdPersona, IdSecuencial } = selectedDelete;
      await eliminar({
        IdCliente :IdCliente ,
        IdPersona : IdPersona,
        IdSecuencial : IdSecuencial,
        IdUsuario: usuario.username
      }).then(() => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false) });
      listarCategoriaCosto();
    }
  }

  async function listarCategoriaCosto() {
    setLoading(true);
    await listar({
      IdCliente: IdCliente,
      IdPersona: varIdPersona,
      IdCategoriaCosto: '%',
      NumPagina: 0,
      TamPagina: 0
    }).then(pcategoriasCosto => {
      setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
      setListarTabs(pcategoriasCosto);
      setModoEdicion(false);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false) });

  }

  async function obtenerCategoriaCosto(filtro) {
    setLoading(true);
    const { IdCliente, IdPersona, IdSecuencial } = filtro;
    await obtener({ IdCliente, IdPersona, IdSecuencial })
      .then(regimen => {
        setDataRowEditNew({ ...regimen, esNuevoRegistro: false });
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      })
      .finally(() => { setLoading(false) });
  }


  const editarCategoriaCosto = async (dataRow) => {

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

    const { RowIndex } = dataRow;
    setModoEdicion(true);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    obtenerCategoriaCosto(dataRow);
    setFocusedRowKey(RowIndex);
  };

  const seleccionarCategoriaCosto = (dataRow) => {
    const { RowIndex } = dataRow;
    setFocusedRowKey(RowIndex);
};

  const nuevoCategoriaCosto = async () => {

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

            let fecInicio = parseInt(response.FechaInicio) >  parseInt(dateFormat(new Date(), 'yyyyMMdd')) ? new Date(response.FechaInicio.substring(0, 4), response.FechaInicio.substring(4, 6) - 1, response.FechaInicio.substring(6, 8)) : new Date();
            let fecFin = new Date(response.FechaFin.substring(0, 4), response.FechaFin.substring(4, 6) - 1, response.FechaFin.substring(6, 8));
            let nuevo = { FechaInicial: fecInicio, FechaFinal: fecFin, Activo: "S", ...selected };

            setDataRowEditNew({ ...nuevo, esNuevoRegistro: true });
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
      
    setLoading(false);

  };

  const cancelarCategoriaCosto = () => {
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };

  useEffect(() => {
    listarCategoriaCosto();
  }, []);

  return <>

    {modoEdicion && (
      <>
        <PersonaCategoriaCostoEditPage
          modoEdicion={modoEdicion}
          dataRowEditNew={dataRowEditNew}
          actualizarCategoriaCosto={actualizarCategoriaCosto}
          agregarCategoriaCosto={agregarCategoriaCosto}
          cancelarEdicion={cancelarCategoriaCosto}
          titulo={titulo}
          accessButton={accessButton}
          settingDataField={settingDataField}
          getInfo={getInfo}
          fechasContrato ={fechasContrato}
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
        <PersonaCategoriaCostoListPage
          personasCategoriaCosto={listarTabs}
          editarRegistro={editarCategoriaCosto}
          eliminarRegistro={eliminarCategoriaCosto}
          nuevoRegistro={nuevoCategoriaCosto}
          seleccionarRegistro={seleccionarCategoriaCosto}
          focusedRowKey={focusedRowKey}
          accessButton={accessButton}
          getInfo = {getInfo}
          cancelarEdicion={cancelarEdicion}
        />
      </>
    )}

    <Confirm
      message={intl.formatMessage({ id: "ALERT.REMOVE" })}
      isVisible={isVisible}
      setIsVisible={setIsVisible}
      setInstance={setInstance}
      onConfirm={() => eliminarCategoriaCosto(selectedDelete, true)}
      title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
      confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
      cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
    />
  </>

};

export default injectIntl(WithLoandingPanel(PersonaCategoriaCostoIndexPage));
