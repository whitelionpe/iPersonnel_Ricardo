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
} from "../../../../../api/acreditacion/requisitoDatoEvaluar.api";

import RequisitoDatoEvaluarEditPage from "../../requisito/datoEvaluar/RequisitoDatoEvaluarEditPage";
import RequisitoDatoEvaluarListPage from "../../requisito/datoEvaluar/RequisitoDatoEvaluarListPage";
 
const RequisitoDatoEvaluarIndexPage = (props) => {
  const { intl, setLoading, getInfo, accessButton, settingDataField, varIdRequisito, cancelarEdicion,varTipoEntidad } = props;
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

  //:::::::::::::::::::::::::::::::::::::::::::::-Funciones Requisito Datos Evaluar:::::::::::::::::::::::::::::::::

    const listarDatoEvaluar = async () => {
      setLoading(true);
      setListarTabs([])
      let datosEvaluar = await listar({
          IdCliente: IdCliente,
          IdRequisito: varIdRequisito 
        }).finally(() => { setLoading(false); });
      setModoEdicion(false);
      setListarTabs(datosEvaluar);
  }

  const agregarDatoEvaluar = async (dataRow) => {
      const {
          IdDatoEvaluar,
          Orden,
          Activo,
      } = dataRow;

      let params = {
          IdCliente: IdCliente,
          IdRequisito: varIdRequisito,
          IdDatoEvaluar,
          Orden: isNotEmpty(Orden) ? Orden : 0,
          Activo,
          IdUsuario: usuario.username,
      };

      setLoading(true);
      await crear(params).then(response => {
          handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
          setModoEdicion(false);
          setDataRowEditNew({});
          listarDatoEvaluar();
      }).catch(err => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });

  }

  const actualizarDatoEvaluar = async (dataRow) => {
      const {
            IdCliente,
            IdRequisito,
            IdDatoEvaluar,
            Orden,
            Activo,
      } = dataRow;

      let params = {
            IdCliente: IdCliente,
            IdRequisito: IdRequisito,
            IdDatoEvaluar : IdDatoEvaluar,
            Orden: isNotEmpty(Orden) ? Orden : 0,
            Activo : Activo,
            IdUsuario: usuario.username,
      };

      setLoading(true);
      await actualizar(params).then(response => {
          handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
          setModoEdicion(false);
          setDataRowEditNew({});
          listarDatoEvaluar();
      }).catch(err => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
  }

  const editarDatoEvaluar = async (dataRow) => {

    const { IdDatoEvaluar,IdCliente,IdRequisito } = dataRow;

    let params = {
        IdCliente: IdCliente,
        IdDatoEvaluar :IdDatoEvaluar ,
        IdRequisito: IdRequisito,
    };

    setLoading(true);
    let RequisitoDatoEvaluar = await obtener(params).finally(() => { setLoading(false); });
    setDataRowEditNew({ ...RequisitoDatoEvaluar, esNuevoRegistro: false });
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    setModoEdicion(true);
}

const eliminarDatoEvaluar= async (dataRow) => {

    const { IdCliente,IdDatoEvaluar,IdRequisito } = dataRow;

    let params = {
        IdCliente: IdCliente,
        IdDatoEvaluar : IdDatoEvaluar,
        IdRequisito: IdRequisito,
    };
    setLoading(true);
    await eliminar(params).then(response => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
        setModoEdicion(false);
        setDataRowEditNew({});
        listarDatoEvaluar();
    }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
}


  const seleccionarDatoEvaluar = (dataRow) => {
    const { RowIndex } = dataRow;
    setFocusedRowKey(RowIndex);
  };

   const nuevoDatoEvaluar = () => {
     let nuevo = { Activo: "S" };
     setDataRowEditNew({ ...nuevo,esNuevoRegistro: true,});
     setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
     setModoEdicion(true);
   };

  const cancelarDatoEvaluar = () => {
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };

  useEffect(() => {
    listarDatoEvaluar();
  }, []);

  return <>

    {modoEdicion && (
      <>
        <RequisitoDatoEvaluarEditPage
          modoEdicion={modoEdicion}
          dataRowEditNew={dataRowEditNew}
          actualizarDatoEvaluar={actualizarDatoEvaluar}
          agregarDatoEvaluar={agregarDatoEvaluar}
          cancelarEdicion={cancelarDatoEvaluar}
          titulo={titulo}
          accessButton={accessButton}
          settingDataField={settingDataField}
          getInfo={getInfo}
          showButton={true}
          setDataRowEditNew = { setDataRowEditNew }
          varIdRequisito={props.varIdRequisito}
          varTipoEntidad={varTipoEntidad}
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
        <RequisitoDatoEvaluarListPage
          datosEvaluarDetalle={listarTabs}
          editarRegistro={editarDatoEvaluar}
          eliminarRegistro={eliminarDatoEvaluar}
          nuevoRegistro={nuevoDatoEvaluar}
          seleccionarRegistro={seleccionarDatoEvaluar}
          focusedRowKey={focusedRowKey}
          accessButton={accessButton}
          getInfo = {getInfo}
          cancelarEdicion={cancelarEdicion}
          showButton={true}
        />
      </>
    )}

    <Confirm
      message={intl.formatMessage({ id: "ALERT.REMOVE" })}
      isVisible={isVisible}
      setIsVisible={setIsVisible}
      setInstance={setInstance}
      onConfirm={() => eliminarDatoEvaluar(selectedDelete, true)}
      title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
      confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
      cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
    />
  </>

};

export default injectIntl(WithLoandingPanel(RequisitoDatoEvaluarIndexPage));
