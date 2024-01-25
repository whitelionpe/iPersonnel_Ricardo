import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { handleErrorMessages, handleSuccessMessages } from "../../../../../store/ducks/notify-messages";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import { useSelector } from "react-redux";
import AuditoriaPage from "../../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../../store/ducks/componente/componenteSwitch";

import { service } from "../../../../../api/sistema/proceso.api";
import ProcesoEditPage from "../proceso/ProcesoEditPage";
import ProcesoListPage from "../proceso/ProcesoListPage";

import { isNotEmpty } from "../../../../../../_metronic";
import Confirm from "../../../../../partials/components/Confirm";


const ProcesoIndexPage = (props) => {

  const usuario = useSelector(state => state.auth.user);

  const { intl, setLoading, getInfo, accessButton, varIdModulo, varIdAplicacion, settingDataField, selected, cancelarEdicion } = props;
  const [focusedRowKeyProceso, setFocusedRowKeyProceso] = useState();

  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);

  const [listarTabs, setListarTabs] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [instance, setInstance] = useState({});
  const [selectedDelete, setSelectedDelete] = useState({});
  const [selectedProceso, setSelectedProceso] = useState({});


  useEffect(() => {
    listarProceso();
  }, []);


  async function agregarProceso(datarow) {
    // setLoading(true);
    const { IdProceso, IdTipoProceso, TipoEjecucion, Proceso, Descripcion, NombreProcedimiento, Activo } = datarow;
    let params = {
      IdProceso: isNotEmpty(IdProceso) ? IdProceso : 0
      , TipoEjecucion: isNotEmpty(TipoEjecucion) ? TipoEjecucion : ""
      , IdAplicacion: varIdAplicacion
      , IdModulo: varIdModulo
      , IdTipoProceso: isNotEmpty(IdTipoProceso) ? IdTipoProceso.toUpperCase() : ""
      , Proceso: isNotEmpty(Proceso) ? Proceso.toUpperCase() : ""
      , Descripcion: isNotEmpty(Descripcion) ? Descripcion.toUpperCase() : ""
      , NombreProcedimiento: isNotEmpty(NombreProcedimiento) ? NombreProcedimiento.toUpperCase() : ""
      , Activo: Activo
      , IdUsuario: usuario.username
    };

    if (IdTipoProceso === 'NOTIF') {
      const { IdPlantilla, Asunto, Destinatario, CopiaOculta, Mensaje1, Mensaje2, AdjuntarArchivo, MostrarInforme } = datarow;
      params = {
        ...params,
        IdPlantilla,
        Asunto,
        Destinatario,
        CopiaOculta,
        Mensaje1: isNotEmpty(Mensaje1) ? Mensaje1 : "",
        Mensaje2: isNotEmpty(Mensaje2) ? Mensaje2 : "",
        AdjuntarArchivo: AdjuntarArchivo ? 'S' : 'N',
        MostrarInforme: MostrarInforme ? 'S' : 'N'
      };
    }
    await service.crear(params).then(() => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
        setModoEdicion(false);
        listarProceso();
    }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }


  async function actualizarProceso(dataRow) {
    setLoading(true);
    const { IdProceso, IdAplicacion, IdModulo, IdTipoProceso, TipoEjecucion, Proceso, Descripcion, NombreProcedimiento, Activo } = dataRow;
    let params = {
      IdProceso
      , IdAplicacion
      , IdModulo
      , IdTipoProceso: IdTipoProceso
      , TipoEjecucion: isNotEmpty(TipoEjecucion) ? TipoEjecucion : ""
      , Proceso: isNotEmpty(Proceso) ? Proceso.toUpperCase() : ""
      , Descripcion: isNotEmpty(Descripcion) ? Descripcion.toUpperCase() : ""
      , NombreProcedimiento: isNotEmpty(NombreProcedimiento) ? NombreProcedimiento.toUpperCase() : ""
      , Activo: Activo
      , IdUsuario: usuario.username
    }

    if (IdTipoProceso === 'NOTIF') {
      const { IdPlantilla, Asunto, Destinatario, CopiaOculta, Mensaje1, Mensaje2, AdjuntarArchivo, MostrarInforme } = dataRow;
      params = {
        ...params,
        IdPlantilla,
        Asunto,
        Destinatario,
        CopiaOculta,
        Mensaje1: isNotEmpty(Mensaje1) ? Mensaje1 : "",
        Mensaje2: isNotEmpty(Mensaje2) ? Mensaje2 : "",
        AdjuntarArchivo: AdjuntarArchivo ? 'S' : 'N',
        MostrarInforme: MostrarInforme ? 'S' : 'N'
      };
    }

    await service.actualizar(params).then(response => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      setModoEdicion(false);
      listarProceso();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });
  }

  async function listarProceso() {
    setLoading(true);
    setModoEdicion(false);
    await service.listar(
      {
        IdModulo: varIdModulo
        , IdAplicacion: varIdAplicacion
        , IdProceso: 0
        , NumPagina: 0
        , TamPagina: 0
      }
    ).then(procesos => {
      setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
      setListarTabs(procesos)
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function obtenerProceso(filtro) {
    setLoading(true);
    const { IdModulo, IdAplicacion, IdProceso } = filtro;
    await service.obtener({
      IdModulo,
      IdAplicacion,
      IdProceso
    }).then(data => {
      setDataRowEditNew({ ...data, AdjuntarArchivo: data.AdjuntarArchivo === 'S', MostrarInforme: data.MostrarInforme === 'S', esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  const seleccionarProceso = dataRow => {
    const { RowIndex } = dataRow;

    setModoEdicion(false);
    setSelectedProceso(dataRow);
    setFocusedRowKeyProceso(RowIndex);
  };

  const nuevoRegistro = () => {
    let Procesos = { Activo: "S" };
    setDataRowEditNew({ ...Procesos, esNuevoRegistro: true });
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
  };


  const editarRegistroProceso = async (dataRow) => {
    setModoEdicion(true);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    obtenerProceso(dataRow);
  };

  async function eliminarRegistro(dataRow, confirm) {
    setSelectedDelete(dataRow);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdProceso } = dataRow;
      await service.eliminar({
        IdModulo: varIdModulo,
        IdAplicacion: varIdAplicacion,
        IdProceso
      }).then(response => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
      }).finally(() => { setLoading(false); });
      listarProceso();
    }
  }

  const cancelarEdicionTabsProceso = () => {
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };


  return <>

    {modoEdicion && (
      <>
        <ProcesoEditPage
          dataRowEditNew={dataRowEditNew}
          agregarRegistro={agregarProceso}
          actualizarRegistro={actualizarProceso}
          cancelarEdicion={cancelarEdicionTabsProceso}
          titulo={titulo}
          modoEdicion={modoEdicion}
          accessButton={accessButton}
          varIdModulo={varIdModulo}
          varIdAplicacion={varIdAplicacion}
          settingDataField={settingDataField}
          setDataRowEditNew={setDataRowEditNew}
        />
        <div className="container_only">
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
        <ProcesoListPage
          procesoData={listarTabs}
          seleccionarRegistro={seleccionarProceso}
          editarRegistro={editarRegistroProceso}
          eliminarRegistro={eliminarRegistro}
          nuevoRegistro={nuevoRegistro}
          getInfo={props.getInfo}
          cancelarEdicion={cancelarEdicion}
          accessButton={accessButton}
          focusedRowKey={focusedRowKeyProceso}
          varIdModulo={varIdModulo}
          varIdAplicacion={varIdAplicacion}

          dataRowEditNew={dataRowEditNew}
          selected={selected}
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

export default injectIntl(WithLoandingPanel(ProcesoIndexPage));
