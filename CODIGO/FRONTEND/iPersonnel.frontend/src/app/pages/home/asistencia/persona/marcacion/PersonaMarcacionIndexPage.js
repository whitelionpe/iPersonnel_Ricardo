import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { handleErrorMessages, handleSuccessMessages, handleInfoMessages } from "../../../../../store/ducks/notify-messages";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import Confirm from "../../../../../partials/components/Confirm";
import { useSelector } from "react-redux";
import AuditoriaPage from "../../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../../store/ducks/componente/componenteSwitch";
import { useStylesTab } from "../../../../../store/config/Styles";
import {
  obtener as obtenerMarca, crear as crearMarca, actualizar as actualizarMarca, eliminar as eliminarMarca
} from "../../../../../api/asistencia/marcacion.api";
import PersonaMarcacionEditPage from "./PersonaMarcacionEditPage";
import PersonaMarcacionListPage from "./PersonaMarcacionListPage";
import { dateFormat, isNotEmpty } from "../../../../../../_metronic";
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import { TYPE_IDENTIFICACION_TIPOIDENTIFICACION } from "../../../../../../_metronic";
import { servicePersonaGrupo } from "../../../../../api/asistencia/personaGrupo.api";
import CasinoMarcacionMotivoPopUp from "../../../../../partials/components/CasinoMarcacionMotivoPopUp";

export const initialFilterMarcas = {
  IdCliente: '',
  IdPersona: '',
  FechaMarca: '',//Date((new Date()).getFullYear(), (new Date()).getMonth(), (new Date()).getDate()),
  FechaInicio: new Date(),
  FechaFin: new Date(),
  Activo: 'S'
};


const PersonaMarcacionIndexPage = (props) => {
  const usuario = useSelector(state => state.auth.user);
  const { IdDivision, IdCliente } = useSelector(state => state.perfil.perfilActual);
  const perfil = useSelector(state => state.perfil.perfilActual);
  const { intl, setLoading, settingDataField, getInfo, accessButton, varIdPersona, IdModulo, selectedIndex, dataMenu } = props;

  const [filterDataMarcas, setFilterDataMarcas] = useState({ ...initialFilterMarcas });
  const [isVisible, setIsVisible] = useState(false);
  const [tituloTabs, setTituloTabs] = useState(intl.formatMessage({ id: "ACTION.EDIT" }));
  const [isFirstDataLoad, setIsFirstDataLoad] = useState(true);
  const [refreshData, setRefreshData] = useState(false);
  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));

  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
  const [focusedRowKeyMarcacion, setFocusedRowKeyMarcacion] = useState();
  const [selectedDelete, setSelectedDelete] = useState({});
  const classes = useStylesTab();
  const [instance, setInstance] = useState({});
  const [ocultarEdit, setOcultarEdit] = useState(false);
  const ds = new DataSource({ store: new ArrayStore({ data: [], key: 'RowIndex' }), reshapeOnPush: false });
  const [dataSource] = useState(ds);
  const refresh = () => dataSource.refresh();
  const resetLoadOptions = () => dataSource.resetLoadOptions();
  const [selected, setSelected] = useState({});

  const [modeView, setModeView] = useState(false);
  const [isVisiblePopUpMotivo, setisVisiblePopUpMotivo] = useState(false);

  //::::::::::::::::::::::::::::::::::::::::::::: Funciones Marcación ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::


  async function agregarMarcacion(datarow) {
    setLoading(true);
    const { IdZona, IdEquipo, IdTipoIdentificacion, Identificacion, FechaMarca, HoraMarca, Automatico, Observacion, Online, FechaRegistro } = datarow;
    let data = {
      IdCliente
      , IdDivision: perfil.IdDivision
      , IdPersona: varIdPersona
      , IdSecuencial: 0
      , IdZona: isNotEmpty(IdZona) ? IdZona.toUpperCase() : ""
      , IdEquipo: isNotEmpty(IdEquipo) ? IdEquipo.toUpperCase() : ""
      , IdTipoIdentificacion: isNotEmpty(IdTipoIdentificacion) ? IdTipoIdentificacion.toUpperCase() : ""
      , Identificacion: isNotEmpty(Identificacion) ? Identificacion.toUpperCase() : ""
      , FechaMarca: dateFormat(FechaMarca, 'yyyyMMdd hh:mm')//dateFormat(FechaMarca, 'yyyyMMdd') + ' ' + dateFormat(HoraMarca, 'hh:mm')   
      , Hash: ""
      , Automatico: Automatico //"N"
      , Observacion: isNotEmpty(Observacion) ? Observacion.toUpperCase() : ""
      , Online: Online
      , MarcacionWeb: "S"
      , OrigenRegistro: "W" // Web
      , FechaRegistro: dateFormat(FechaRegistro, 'yyyyMMdd')
      , IdUsuario: usuario.username
    };
    await crearMarca(data).then(response => {
      setModoEdicion(false);
      setRefreshData(true);
      if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));

    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function actualizarMarcacion(datarow) {
    setLoading(true);
    const { IdZona, IdSecuencial, IdEquipo, IdTipoIdentificacion, Identificacion, FechaMarca, HoraMarca, Automatico, Observacion, Online, MarcacionWeb, FechaRegistro } = datarow;
    let data = {
      IdCliente
      , IdDivision: perfil.IdDivision
      , IdPersona: varIdPersona
      , IdSecuencial: isNotEmpty(IdSecuencial) ? IdSecuencial : 0
      , IdZona: isNotEmpty(IdZona) ? IdZona.toUpperCase() : ""
      , IdEquipo: isNotEmpty(IdEquipo) ? IdEquipo.toUpperCase() : ""
      , IdTipoIdentificacion: isNotEmpty(IdTipoIdentificacion) ? IdTipoIdentificacion.toUpperCase() : ""
      , Identificacion: isNotEmpty(Identificacion) ? Identificacion.toUpperCase() : ""
      , FechaMarca: dateFormat(FechaMarca, 'yyyyMMdd hh:mm') //dateFormat(FechaMarca, 'yyyyMMdd') + ' ' + dateFormat(HoraMarca, 'hh:mm')
      , Hash: ""
      , Automatico: Automatico //(Automatico) ? "S" : "N"
      , Observacion: isNotEmpty(Observacion) ? Observacion.toUpperCase() : ""
      , Online: Online
      , MarcacionWeb: "S"
      , OrigenRegistro: "W" // Web
      , IdUsuario: usuario.username
    };
    await actualizarMarca(data).then(() => {
      setRefreshData(true);
      setModoEdicion(false);
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));

    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  // async function eliminarRegistroMarcacion(dataRow, confirm) {
  //   setSelectedDelete(dataRow);
  //   setIsVisible(true);
  //   if (confirm) {
  //     setLoading(true);
  //     const { IdCliente, IdPersona, IdSecuencial } = dataRow;
  //     await eliminarMarca({ IdCliente, IdPersona, IdSecuencial }).then(() => {
  //       setRefreshData(true);
  //       setModoEdicion(false);
  //       handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
  //     }).catch(err => {
  //       handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
  //     }).finally(() => { setLoading(false); });
  //   }
  // }

  async function eliminarRegistroMarcacion(dataRow, confirm) {
    setSelectedDelete(dataRow);
    setIsVisible(true);
    if (confirm) {
      setisVisiblePopUpMotivo(true);
    }
  }

  const confirmarEliminar = async () => {
    setLoading(true);
    const { IdCliente, IdPersona, IdSecuencial } = selectedDelete;
    const { Motivo } = dataRowEditNew;
    await eliminarMarca({
      IdCliente,
      IdPersona,
      IdSecuencial,
      Motivo: isNotEmpty(Motivo) ? Motivo.toUpperCase() : "",
      IdDivision: perfil.IdDivision
    }).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false) });
    setRefreshData(true);
    setisVisiblePopUpMotivo(false);
  };

  async function obtenerMarcacion(dataRow) {
    setLoading(true);
    const { IdCliente, IdPersona, IdSecuencial } = dataRow;
    await obtenerMarca({ IdCliente, IdPersona, IdSecuencial }).then(data => {
      const { FechaMarca, Automatico, MarcacionWeb } = data;
      //data.HoraMarca = FechaMarca;
      data.Automatico = Automatico === "S" ? "S" : "N";
      data.MarcacionWeb = MarcacionWeb === "N" ? true : false;

      let minutos = new Date(FechaMarca);
      let fechaCorta = new Date(FechaMarca);

      setDataRowEditNew({ ...data, esNuevoRegistro: false, Minutos: minutos, FechaCorta: fechaCorta, });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  const seleccionarMarcacion = async (dataRow) => {
    const { RowIndex } = dataRow;
    setSelected(dataRow);
    if (RowIndex !== focusedRowKeyMarcacion) {
      setFocusedRowKeyMarcacion(RowIndex);
    }
    
  }

  const nuevoRegistroMarcacion = async () => {
    setModeView(false);
    await servicePersonaGrupo.obtenerZona({
      IdCliente: perfil.IdCliente,
      IdDivision: perfil.IdDivision,
      IdPersona: varIdPersona,
      IdModulo: IdModulo
    }).then(data => {
      if (data.length > 0) {

        let dateNow = new Date();
        let fecMarca = new Date(dateNow.getFullYear(), dateNow.getMonth(), dateNow.getDate());
        let data = {
          Activo: "S",
          MarcacionWeb: "N",
          FechaRegistro: dateNow,
          FechaMarca: dateNow,
          HoraMarca: dateNow,
          FechaCorta: fecMarca,
          IdTipoIdentificacion: TYPE_IDENTIFICACION_TIPOIDENTIFICACION.DOCUMENTO_DE_IDENTIDAD,
          Identificacion: selectedIndex.Documento,
        };

        const { IdEquipo, IdZona, FechaMarca } = selected; 
        
        setDataRowEditNew({
          ...data, esNuevoRegistro: true, Automatico: "N", Online: "S",
          IdEquipo: isNotEmpty(IdEquipo) ? IdEquipo : "", IdZona: isNotEmpty(IdZona) ? IdZona : "",
          FechaCorta: isNotEmpty(FechaMarca) ? new Date(FechaMarca) : undefined
        });
        setTituloTabs(intl.formatMessage({ id: "ACTION.NEW" }));
        setModoEdicion(true);

      }
      else {
        handleInfoMessages(intl.formatMessage({ id: "ACCESS.PERSON.MARK.NOGROUP.MSG" }));
      }
    }).catch(err => {
    }).finally(() => { setLoading(false); });

  };


  const editarRegistroMarcacion = async (dataRow, flEditar) => {
    setModeView(false);
    setTituloTabs((flEditar) ? intl.formatMessage({ id: "ACTION.EDIT" }) : intl.formatMessage({ id: "ACTION.VIEW" }));
    await obtenerMarcacion(dataRow);
    setModoEdicion(true);
  };


  const verRegistro = async (dataRow) => {
    setDataRowEditNew({});
    setModeView(true);
    setTituloTabs(intl.formatMessage({ id: "ACTION.VIEW" }));
    await obtenerMarcacion(dataRow);
    setModoEdicion(true);
  };

  const cancelarEdicionMarcacion = () => {
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };

  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  return <>

    {modoEdicion && (
      <>
        <PersonaMarcacionEditPage
          dataRowEditNew={dataRowEditNew}
          actualizarMarcacion={actualizarMarcacion}
          agregarMarcacion={agregarMarcacion}
          cancelarEdicion={cancelarEdicionMarcacion}
          titulo={tituloTabs}
          modoEdicion={modoEdicion}
          accessButton={accessButton}
          getInfo={getInfo}
          varIdPersona={varIdPersona}
          IdModulo={IdModulo}
          modeView={modeView}
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
        <PersonaMarcacionListPage
          seleccionarRegistro={seleccionarMarcacion}
          editarRegistro={editarRegistroMarcacion}
          eliminarRegistro={eliminarRegistroMarcacion}
          nuevoRegistro={nuevoRegistroMarcacion}
          cancelarEdicion={props.cancelarEdicion}
          getInfo={getInfo}
          accessButton={accessButton}
          focusedRowKey={focusedRowKeyMarcacion}
          verRegistro={verRegistro}

          //=>..CustomerDataGrid
          // filterData={filterDataMarcas}
          // setFilterData={setFilterDataMarcas}
          isFirstDataLoad={isFirstDataLoad}
          setIsFirstDataLoad={setIsFirstDataLoad}
          dataSource={dataSource}
          refresh={refresh}
          resetLoadOptions={resetLoadOptions}
          refreshData={refreshData}
          setRefreshData={setRefreshData}
          varIdPersona={varIdPersona}
          ocultarEdit={ocultarEdit}
        />
      </>
    )}

    <Confirm
      message={intl.formatMessage({ id: "ALERT.REMOVE" })}
      isVisible={isVisible}
      setIsVisible={setIsVisible}
      setInstance={setInstance}
      onConfirm={() => eliminarRegistroMarcacion(selectedDelete, true)}
      title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
      confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
      cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
    />

    {isVisiblePopUpMotivo && (
      <CasinoMarcacionMotivoPopUp
        dataRowEditNew={dataRowEditNew}
        showPopup={{ isVisiblePopUp: isVisiblePopUpMotivo, setisVisiblePopUp: setisVisiblePopUpMotivo }}
        cancelar={() => setisVisiblePopUpMotivo(false)}
        confirmar={confirmarEliminar}
      />
    )}

  </>
};

export default injectIntl(WithLoandingPanel(PersonaMarcacionIndexPage));
