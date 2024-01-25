import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";

import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import { handleErrorMessages, handleSuccessMessages } from "../../../../../store/ducks/notify-messages";

import AuditoriaPage from "../../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../../store/ducks/componente/componenteSwitch";
import { useStylesEncabezado } from "../../../../../store/config/Styles";

import {
  listar, eliminar, crear
} from "../../../../../api/acreditacion/autorizadorDatoEntidad.api";
import AutorizadorDatoEntidadEditPage from "./AutorizadorDatoEntidadEditPage";

const AutorizadorDatoEntidadIndexPage = (props) => {
  const { intl, setLoading, getInfo, accessButton, varIdAutorizador, cancelarEdicion } = props;
  const perfil = useSelector(state => state.perfil.perfilActual);
  const usuario = useSelector(state => state.auth.user);

  const classesEncabezado = useStylesEncabezado();
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
  const [dataRowEditNew, setDataRowEditNew] = useState({});


  const listarAutorizadorSolicitud = async () => {
    let param = {
      IdCliente: perfil.IdCliente,
      IdAutorizador: varIdAutorizador
    };
    setLoading(true);
    let solicitudes = await listar(param).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
    return solicitudes;
  }

  const agregarAutorizadorSolicitud = async (dataRow) => {
    let cont_rows = 0
    let isOk = false;
    let msj_error = '';
    let errores = false;
    setLoading(true);

    let param = {
      IdCliente: perfil.IdCliente,
      IdAutorizador: varIdAutorizador,
      IdEntidad: 'P',
    }

    await eliminar(param)
      .then(() => { isOk = true })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      });
    if (isOk) {
      dataRow.selectData.map(async solictud => {
        await crear({
          ...param,
          IdAutorizador: varIdAutorizador,
          IdDato: solictud,
          Activo: 'S',
          IdUsuario: usuario.username
        }).then(() => {
          cont_rows++;
          if (dataRow.selectData.length === cont_rows) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));

        }).catch(err => {
            errores = true;
            msj_error = msj_error + `${solictud} - ${err} <br/>`
          })

      });
      setLoading(false);
    }
  }

  //****AUTORIZADOR DETALLE************************************************************/

  return <>

    <>
      <AutorizadorDatoEntidadEditPage
        dataRowEditNew={dataRowEditNew}
        cancelarEdicion={cancelarEdicion}
        getInfo={getInfo}
        accessButton={accessButton}
        agregarAutorizadorSolicitud={agregarAutorizadorSolicitud}
        listarAutorizadorSolicitud={listarAutorizadorSolicitud}
    
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
  </>

};



export default injectIntl(WithLoandingPanel(AutorizadorDatoEntidadIndexPage));
