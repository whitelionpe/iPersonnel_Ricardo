import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";

//import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import { handleErrorMessages, handleSuccessMessages, handleSuccessMessagesHTML } from "../../../../../store/ducks/notify-messages";
import AuditoriaPage from "../../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../../store/ducks/componente/componenteSwitch";
import { useStylesEncabezado } from "../../../../../store/config/Styles";
import Confirm from "../../../../../partials/components/Confirm";

import {
  service as serviceTipoVehiculo
} from "../../../../../api/acreditacion/perfilTipoVehiculo.api";

import PerfilTipoVehiculoListPage from "./PerfilTipoVehiculoListPage";
import PerfilTipoVehiculoEditPage from "./PerfilTipoVehiculoEditPage";
import { isNotEmpty } from "../../../../../../_metronic";
import WithLoandingPanel from "../../../../../partials/content/withLoandingPanel";

import AdministracionTipoVehiculoBuscar from "../../../../../partials/components/AdministracionTipoVehiculoBuscar";
import { handleInfoMessages } from "../../../../../store/ducks/notify-messages";

const PerfilTipoVehiculoIndexPage = (props) => {
  const { intl, setLoading, getInfo, accessButton, varIdPerfil, selectedIndex } = props;
  const perfil = useSelector(state => state.perfil.perfilActual);
  const usuario = useSelector(state => state.auth.user);

  const classesEncabezado = useStylesEncabezado();
  const [focusedRowKey, setFocusedRowKey] = useState(0);
  const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const [dataSource, setDataSource] = useState([]);

  const [selectedDelete, setSelectedDelete] = useState({});
  const [isVisibleConfirm, setIsVisibleConfirm] = useState(false);
  const [instance, setInstance] = useState({});

  const [isVisiblePopUpTipoVehiculos, setisVisiblePopUpTipoVehiculos] = useState(false);
  //*****Perfil TipoVehiculo***************************************************/
  async function listarPerfilTipoVehiculo() {
    setLoading(true);
    if (isNotEmpty(varIdPerfil)) {
      await serviceTipoVehiculo.listar({ IdCliente: perfil.IdCliente, IdPerfil: varIdPerfil, IdTipoVehiculo: "%" }).then((data) => {
        setDataSource(data);
      }).finally(() => { setLoading(false); });
    }
  }

  const nuevoPerfilTipoVehiculo = () => {
    const { IdCliente, IdPerfil } = selectedIndex;
    setDataRowEditNew({ IdCliente, IdPerfil, esNuevoRegistro: true });
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
    setisVisiblePopUpTipoVehiculos(true);
  };


  async function agregarPerfilTipoVehiculo(dataRow) {
    setLoading(true);
    const { IdCliente, IdPerfil, IdTipoVehiculo } = dataRow;
    let params = {
      IdCliente
      , IdPerfil: isNotEmpty(IdPerfil) ? IdPerfil.toUpperCase() : ""
      , IdTipoVehiculo: isNotEmpty(IdTipoVehiculo) ? IdTipoVehiculo.toUpperCase() : ""
      , IdUsuario: usuario.username
    }
    await serviceTipoVehiculo.crear(params).then(response => {
      if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      listarPerfilTipoVehiculo();
      setModoEdicion(false);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  const seleccionarPerfilTipoVehiculo = async (dataRow) => {
    const { RowIndex } = dataRow;
    setFocusedRowKey(RowIndex);
  }

  async function eliminarPerfilTipoVehiculo(dataRow, confirm) {
    console.log("eliminarPerfilTipoVehiculo", dataRow);
    setSelectedDelete(dataRow);
    setIsVisibleConfirm(true);
    if (confirm) {
      setLoading(true);
      const { IdCliente, IdPerfil, IdTipoVehiculo } = dataRow;
      await serviceTipoVehiculo.eliminar({
        IdCliente,
        IdPerfil,
        IdTipoVehiculo
      }).then(() => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
      listarPerfilTipoVehiculo();
    }
  }
  const editarPerfilTipoVehiculo = async (dataRow) => {
    const { IdCliente, IdPerfil, IdTipoVehiculo } = dataRow;
    setLoading(true);
    let perfiltmp = await serviceTipoVehiculo.obtener({ IdCliente, IdPerfil, IdTipoVehiculo }).finally(() => { setLoading(false); });
    setDataRowEditNew({ ...perfiltmp, esNuevoRegistro: false });
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    setModoEdicion(true);
  }

  const cancelarEdicion = () => {
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});

  };

  useEffect(() => {
    listarPerfilTipoVehiculo();
  }, []);


  const agregarTipoVehiculos = async (dataPopup) => {
    setLoading(true);
    if (dataPopup.length > 0) {

      let promesas = [];
      let { IdCliente, IdPerfil } = selectedIndex;

      for (let i = 0; i < dataPopup.length; i++) {
        let { TipoVehiculo, IdTipoVehiculo } = dataPopup[i];
        promesas.push(serviceTipoVehiculo.crear({
          IdCliente
          , IdPerfil: isNotEmpty(IdPerfil) ? IdPerfil.toUpperCase() : ""
          , IdTipoVehiculo: isNotEmpty(IdTipoVehiculo) ? IdTipoVehiculo.toUpperCase() : ""
          , IdUsuario: usuario.username
        }));
      }

      let existeError = false;
      let respuesta = await Promise.all(promesas)
        .then(res => {
          return res;
        })
        .catch(err => {
          existeError = true;
          return { codigo: err.response.data.id, mensaje: err.response.data.mensajeValidacion };
        });


      if (existeError) {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), {
          response: {
            data: respuesta.mensaje
          }
        })
      } else {
        let totalOk = respuesta.filter(x => x.id === 0).length;
        let totalExiste = respuesta.filter(x => x.id === -2).length;
        let totalError = respuesta.filter(x => x.id !== 0 && x.id !== -2).length;

        //return { codigo: res.id, mensaje: res.mensajeValidacion };

        let mensaje = "<br/>";
        mensaje += totalOk > 0 ? `Registros Ok: ${totalOk}<br/>` : "";
        mensaje += totalExiste > 0 ? `Registros existentes: ${totalExiste}<br/>` : "";
        mensaje += totalError > 0 ? `Registros con error: ${totalError}<br/>` : "";
        //handleInfoMessages(intl.formatMessage({ id: "MESSAGES.SELECT.ROW" }), "");
        handleSuccessMessagesHTML(intl.formatMessage({ id: "MESSAGES.SUCESS" }),
          intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }) + mensaje);

        listarPerfilTipoVehiculo();
        setModoEdicion(false);
      }
      setLoading(false);
    }


  }


  return <>

    {modoEdicion && dataRowEditNew.esNuevoRegistro ? (
      <>

        {/* POPUP TipoVehiculoS   ++++++++++++++++++++++++++- */}
        <AdministracionTipoVehiculoBuscar
          selectData={agregarTipoVehiculos} 
          showPopup={{ isVisiblePopUp: isVisiblePopUpTipoVehiculos, setisVisiblePopUp: setisVisiblePopUpTipoVehiculos }}
          cancelarEdicion={() => setisVisiblePopUpTipoVehiculos(false)}
          selectionMode={"multiple"}
          showButton={true}
        />


      </>
    ) : null}
    {modoEdicion && !dataRowEditNew.esNuevoRegistro ? (
      <>
        <PerfilTipoVehiculoEditPage
          dataRowEditNew={dataRowEditNew}
          agregarRegistro={agregarPerfilTipoVehiculo}
          cancelarEdicion={cancelarEdicion}
          titulo={titulo}
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
    ) : null}
    {!modoEdicion && (
      <>
        <PerfilTipoVehiculoListPage
          eliminarRegistro={eliminarPerfilTipoVehiculo}
          nuevoRegistro={nuevoPerfilTipoVehiculo}
          editarRegistro={editarPerfilTipoVehiculo}
          cancelarEdicion={props.cancelarEdicion}
          seleccionarRegistro={seleccionarPerfilTipoVehiculo}
          dataSource={dataSource}
          focusedRowKey={focusedRowKey}
          getInfo={getInfo}
        />
      </>
    )}

    <Confirm
      message={intl.formatMessage({ id: "ALERT.REMOVE" })}
      isVisible={isVisibleConfirm}
      setIsVisible={setIsVisibleConfirm}
      setInstance={setInstance}
      onConfirm={() => eliminarPerfilTipoVehiculo(selectedDelete, true)}
      title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
      confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
      cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
    />


  </>
};

export default injectIntl(WithLoandingPanel(PerfilTipoVehiculoIndexPage));
