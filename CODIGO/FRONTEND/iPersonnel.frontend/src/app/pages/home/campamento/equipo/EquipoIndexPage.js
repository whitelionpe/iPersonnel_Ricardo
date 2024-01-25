import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";
import { isNotEmpty } from "../../../../../_metronic";
import { confirmAction, handleErrorMessages, handleInfoMessages, handleSuccessMessages } from "../../../../store/ducks/notify-messages";
import { useStylesTab } from "../../../../store/config/Styles";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import Confirm from "../../../../partials/components/Confirm";
import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";
import { serviceEquipo } from "../../../../api/campamento/equipo.api";
import EquipoListPage from "./EquipoListPage";
import EquipoEditPage from "./EquipoEditPage";

const EquipoIndexPage = (props) => {

  const { intl, setLoading, getInfo, accessButton, settingDataField, varIdCampamento, cancelarEdicion,IdZona,IdModulo } = props;
  const { IdDivision } = useSelector(state => state.perfil.perfilActual);
  const usuario = useSelector(state => state.auth.user);
  const classes = useStylesTab();
  const [listarTabs, setListarTabs] = useState([]);
  const [varIdEquipo, setVarIdEquipo] = useState("");
  const [focusedRowKey, setFocusedRowKey] = useState();
  const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const [selected, setSelected] = useState({});
  const [tabIndex, setTabIndex] = useState(0);
  const handleChange = (event, newValue) => { setTabIndex(newValue); };
  const [isVisible, setIsVisible] = useState(false);
  const [instance, setInstance] = useState({});
  const [selectedDelete, setSelectedDelete] = useState({});

  //::::::::::::::::::::::::::::::: Función Equipo ::::::::::::::::::::::::::::::::::::::::::::::::

  async function agregarEquipo(dataRow) {
    setLoading(true);
    const { IdEquipo, TipoControl, Activo } = dataRow;
    let params = {
      IdDivision: isNotEmpty(IdDivision) ? IdDivision.toUpperCase() : "",
      IdCampamento: varIdCampamento,
      IdEquipo: isNotEmpty(IdEquipo) ? IdEquipo.toUpperCase() : "",
      TipoControl: isNotEmpty(TipoControl) ? TipoControl.toUpperCase() : "",
      Activo: Activo,
      IdZona:IdZona,
      IdModulo: IdModulo,
      IdUsuario: usuario.username
    };
    await serviceEquipo.crear(params)
      .then(response => {
        if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
        setModoEdicion(false);
        listarEquipo();
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
      }).finally(() => { setLoading(false); });
  }

  async function actualizarEquipo(dataRow) {
    setLoading(true);
    const { IdDivision, IdCampamento, IdEquipo,TipoControl,Activo } = dataRow;
    let params = {
      IdDivision: IdDivision,
      IdCampamento: IdCampamento,
      IdEquipo: IdEquipo,
      TipoControl: isNotEmpty(TipoControl) ? TipoControl.toUpperCase() : "",
      Activo: Activo,
      IdZona:IdZona,
      IdModulo: IdModulo,
      IdUsuario: usuario.username
    };
    await serviceEquipo.actualizar(params)
      .then(() => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
        setModoEdicion(false);
        listarEquipo();
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
      }).finally(() => { setLoading(false); });
  }

  async function eliminarRegistro(dataRow, confirm) {
    setSelectedDelete(dataRow);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
     const { IdCliente,IdDivision,IdCampamento,IdEquipo} = selected;
  await serviceEquipo.eliminar({ 
         IdCliente,
         IdDivision,
         IdCampamento,
         IdEquipo,
         IdZona:IdZona,
         IdModulo: IdModulo,
             }).then(response => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
      listarEquipo();
    }
  }

  async function listarEquipo() {
    let data = await serviceEquipo.listar({
      IdDivision:IdDivision,
      IdCampamento:varIdCampamento,
      IdEquipo:'%',
      NumPagina: 0,
      TamPagina: 0
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    });
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setListarTabs(data);
    changeTabIndex(0);
  }

  async function obtenerEquipo() {
    setLoading(true);
    const { IdCliente,IdDivision,IdCampamento,IdEquipo} = selected;
    await serviceEquipo.obtener({
      IdCliente,
      IdDivision,
      IdCampamento,
      IdEquipo
    }).then(data => {
      setDataRowEditNew({ ...data, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });

  }

  const nuevoRegistro = () => {
    if(isNotEmpty(IdZona)){
      changeTabIndex(1);
      let Equipo = { Activo: "S" };
      setDataRowEditNew({ ...Equipo, esNuevoRegistro: true });
      setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
      setModoEdicion(true);
      setVarIdEquipo("");
    }else
    {
      handleInfoMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), intl.formatMessage({ id: "CAMP.DEVICE.VALIDATE" }));
    }
    
  };

  const editarRegistro  = async dataRow => {
    setDataRowEditNew({});
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    await obtenerEquipo(dataRow);
    changeTabIndex(1);
    setModoEdicion(true);
  };

  const seleccionarRegistro = dataRow => {
    const { IdEquipo, RowIndex } = dataRow;
    setModoEdicion(false);
    setSelected(dataRow);
    setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
    setVarIdEquipo(IdEquipo);
    setFocusedRowKey(RowIndex);
  };

  const cancelarEquipo = () => {
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };

  const changeTabIndex = (index) => {
    handleChange(null, index);
  }

  useEffect(() => {
    listarEquipo();
  }, []);


  return (
    <>
 
{modoEdicion && (
      <>
        <EquipoEditPage
          modoEdicion={modoEdicion}
          dataRowEditNew={dataRowEditNew}
          actualizarEquipo={actualizarEquipo}
          agregarEquipo={agregarEquipo}
          cancelarEdicion={cancelarEquipo}
          titulo={titulo}
          accessButton={accessButton}
          settingDataField={settingDataField}
          getInfo={getInfo}
          showHeaderInformation ={true}
          idModulo ={IdModulo}
          idZona ={IdZona}
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
        <EquipoListPage
          equipos={listarTabs}
          editarRegistro={editarRegistro}
          eliminarRegistro={eliminarRegistro}
          nuevoRegistro={nuevoRegistro}
          seleccionarRegistro={seleccionarRegistro}
          focusedRowKey={focusedRowKey}
          accessButton={accessButton}
          getInfo = {getInfo}
          cancelarEdicion={cancelarEdicion}
          showHeaderInformation ={true}
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
  );
};

export default injectIntl(WithLoandingPanel(EquipoIndexPage));
