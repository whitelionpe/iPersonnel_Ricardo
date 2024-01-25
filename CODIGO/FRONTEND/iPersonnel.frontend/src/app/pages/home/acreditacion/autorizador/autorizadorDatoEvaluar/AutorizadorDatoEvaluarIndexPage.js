import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";

import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import { handleErrorMessages, handleSuccessMessages } from "../../../../../store/ducks/notify-messages";

import AuditoriaPage from "../../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../../store/ducks/componente/componenteSwitch";
import { useStylesEncabezado } from "../../../../../store/config/Styles";

import {
  listar, eliminar, crear, actualizar
} from "../../../../../api/acreditacion/autorizadorDatoEvaluar.api";

const AutorizadorDatoEvaluarIndexPage = (props) => {
  const { intl, setLoading, getInfo, accessButton, settingDataField, varIdAutorizador, varIdRequisito, selected, cancelarEdicion } = props;
  const perfil = useSelector(state => state.perfil.perfilActual);
  const usuario = useSelector(state => state.auth.user);
  const { IdCliente, IdDivision } = useSelector(state => state.perfil.perfilActual);

  const classesEncabezado = useStylesEncabezado();
  const [focusedRowKey, setFocusedRowKey] = useState(0);
  const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const [autorizadorSolicitudesDetalle, setAutorizadorSolicitudesDetalle] = useState([]);


  async function listarAutorizadorSolicitudDetalle() {
    //console.log("listarAutorizadorSolicitudDetalle", listarAutorizadorSolicitudDetalle);
    setLoading(true);
    const { IdCliente } = selected;
    await listar({
      IdCliente
      , IdAutorizador: varIdAutorizador
      , IdRequisito: "PERPER_AD"
    }).then(solicitudesdetalle => {
      setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
      setAutorizadorSolicitudesDetalle(solicitudesdetalle);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });
    //console.log("listarAutorizador", selected);

  }

  const agregarAutorizadorSolicitud = async (dataRow) => {
    // console.log("agregarAutorizadorSolicitud",dataRow );
    let { IdCliente, IdAutorizador, IdEntidad, IdDato, Activo } = dataRowEditNew;
    let cont_rows = 0
    let isOk = false;
    let msj_error = '';
    let errores = false;
    setLoading(true);

    let param = {
      IdCliente: perfil.IdCliente,
      IdAutorizador: varIdAutorizador,
      IdEntidad,
      IdDato,
      Activo
      //IdMenu: dataRow.IdMenu
    }

    await eliminar(param)
      .then(() => { isOk = true })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      });

    if (isOk) {
      //debugger;
      for (let i = 0; i < dataRow.Datos.length; i++) {
        await crear({
          ...param,

          //IdAutorizat: dataRow.IdAutorizar,
          IdAutorizador: varIdAutorizador,
          IdEntidad: dataRow.Datos[i],
          IdDato: dataRow.Datos[i],
          Activo: dataRow.Datos[i],
          IdUsuario: usuario.username
        })
          .then(() => {
            cont_rows++;
          })
          .catch(err => {
            errores = true;
            msj_error = msj_error + `${param.IdDato} - ${err} <br/>`
          })
          .finally(() => { })
      }
      setLoading(false);
      if (errores) {
        console.log(msj_error);
      }
      if (cont_rows > 0) {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
        listarAutorizadorSolicitudDetalle();
      }
    }
  }



  const eliminarAutorizadorSolicitud = async (dataRow) => {
    let { IdAutorizador, IdEntidad, IdDato } = dataRowEditNew;
    setLoading(true);

    let param = {
      IdCliente: perfil.IdCliente,
      IdAutorizador,
    }

    await eliminar(param)
      .then(() => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
  }



  useEffect(() => {
    listarAutorizadorSolicitudDetalle();
  }, []);


  return <>

    <>
      {/*  <AutorizadorSolicitudEditPage
        dataRowEditNew={dataRowEditNew}
        accessButton={accessButton}

        autorizadorSolicitudesDetalle={autorizadorSolicitudesDetalle}
      /> */}
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

  </>

};



export default injectIntl(WithLoandingPanel(AutorizadorDatoEvaluarIndexPage));
