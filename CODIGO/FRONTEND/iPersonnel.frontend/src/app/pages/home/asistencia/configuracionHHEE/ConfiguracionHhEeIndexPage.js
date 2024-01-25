import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";

import PropTypes from 'prop-types';
import { isNotEmpty } from "../../../../../_metronic";
import { getButtonPermissions, defaultPermissions } from '../../../../../_metronic/utils/securityUtils'
import { Portlet } from "../../../../partials/content/Portlet";
import { handleErrorMessages, handleSuccessMessages } from "../../../../store/ducks/notify-messages";
import { useStylesTab } from "../../../../store/config/Styles";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import Confirm from "../../../../partials/components/Confirm";
import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import FeaturedPlayListIcon from '@material-ui/icons/FeaturedPlayList';

import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";

import { serviceConfiguracion } from "../../../../api/asistencia/configuracionHhEe.api";
import ConfiguracionHhEeListPage from "./ConfiguracionHhEeListPage";
import ConfiguracionHhEeEditPage from "./ConfiguracionHhEeEditPage";

import { serviceConfiguracionPlanilla } from "../../../../api/asistencia/configuracionHhEePlanilla.api";
import { serviceConfiguracionUnidaOrg } from "../../../../api/asistencia/configuracionHhEeUnidadOrg.api";
import { serviceCompania } from "../../../../api/administracion/compania.api";
import TabNavContainer from "../../../../partials/components/Tabs/TabNavContainer";


const ConfiguracionHhEeIndexPage = (props) => {
  const { intl, setLoading, dataMenu } = props;
  const usuario = useSelector(state => state.auth.user);
  const { IdCliente } = useSelector(state => state.perfil.perfilActual);
  const classes = useStylesTab();

  const [varIdConfiguracionHHEE, setVarIdConfiguracionHHEE] = useState(0);
  const [varIdCompania, setVarIdCompania] = useState("");
  const [focusedRowKey, setFocusedRowKey] = useState(0);

  const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const [selected, setSelected] = useState({});
  const [selectedCompany, setSelectedCompany] = useState({});
  const [tabIndex, setTabIndex] = useState(0);
  const handleChange = (event, newValue) => { setTabIndex(newValue); };

  const [isVisible, setIsVisible] = useState(false);
  const [instance, setInstance] = useState({});

  const [selectedDelete, setSelectedDelete] = useState({});
  const [dataPlanilla, setDataPlanilla] = useState([]);
  const [listarTabs, setListarTabs] = useState([]);
  const [isVisibleAlert, setIsVisibleAlert] = useState(false);
  const [companiaData, setCompaniaData] = useState([]);

  const [unidadOrganizativaTreeView, setUnidadOrganizativaTreeView] = useState([{
    Icon: "flaticon2-expand"
    , IdMenu: null
    , IdModulo: null
    , IdMenuPadre: null
    , Menu: intl.formatMessage({ id: "SYSTEM.MENU.OPTIONS" })
    , MenuPadre: null
    , Nivel: 0
    , Orden: 0
    , expanded: true
  }]);


  async function agregarRegistro(datarow, selectedRowPlanilla, selectedItemUnidadOrg) {

    setLoading(true);
    //console.log("agregarRegistro", datarow);
    const { IdConfiguracionHHEE, IdConceptoHoraExtra, Feriado, DiaLaborable, RangoInicio, RangoFin, Orden, Activo, HorarioSemanal, Domingo } = datarow;
    let params = {
      IdCliente
      , IdCompania: varIdCompania
      , IdConfiguracionHHEE: isNotEmpty(IdConfiguracionHHEE) ? IdConfiguracionHHEE : 0
      , IdConceptoHoraExtra: isNotEmpty(IdConceptoHoraExtra) ? IdConceptoHoraExtra.toUpperCase() : ""
      , Activo: Activo
      , DiaLaborable: DiaLaborable ? "S" : "N"
      , Feriado: Feriado ? "S" : "N"
      , RangoInicio: isNotEmpty(RangoInicio) ? RangoInicio : 0
      , RangoFin: isNotEmpty(RangoFin) ? RangoFin : 0
      , Orden: isNotEmpty(Orden) ? Orden : 0
      , IdUsuario: usuario.username
      , Planillas: selectedRowPlanilla.length > 0 ? selectedRowPlanilla : []
      , UnidadOrgs: selectedItemUnidadOrg.length > 0 ? selectedItemUnidadOrg : []
      , ValidSave: 'S'
      , HorarioSemanal: HorarioSemanal ? "S" : "N"
      , Domingo: HorarioSemanal? Domingo ? "S" : "N": "N"
    };

    await serviceConfiguracion.crear(params).then(response => {
      if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      setModoEdicion(false);
      listarConfiguracion(varIdCompania);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });

  }

  async function actualizarRegistro(datarow, selectedRowPlanilla, selectedItemUnidadOrg) {
    //console.log("actualizarRegistro", datarow);
    setLoading(true);
    const { IdConfiguracionHHEE, IdConceptoHoraExtra, Feriado, DiaLaborable, RangoInicio, RangoFin, Orden, Activo, HorarioSemanal, Domingo } = datarow;
    let params = {
      IdCliente
      , IdCompania: varIdCompania
      , IdConfiguracionHHEE: isNotEmpty(IdConfiguracionHHEE) ? IdConfiguracionHHEE : 0
      , IdConceptoHoraExtra: isNotEmpty(IdConceptoHoraExtra) ? IdConceptoHoraExtra.toUpperCase() : ""
      , Activo: Activo
      , DiaLaborable: DiaLaborable ? "S" : "N"
      , Feriado: Feriado ? "S" : "N"
      , RangoInicio: isNotEmpty(RangoInicio) ? RangoInicio : 0
      , RangoFin: isNotEmpty(RangoFin) ? RangoFin : 0
      , Orden: isNotEmpty(Orden) ? Orden : 0
      , IdUsuario: usuario.username
      , Planillas: selectedRowPlanilla.length > 0 ? selectedRowPlanilla : []
      , UnidadOrgs: selectedItemUnidadOrg.length > 0 ? selectedItemUnidadOrg : []
      , ValidSave: 'S'
      , HorarioSemanal: HorarioSemanal ? "S" : "N"
      , Domingo: HorarioSemanal? Domingo ? "S" : "N" :"N"
    };

    await serviceConfiguracion.actualizar(params).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      setModoEdicion(false);
      listarConfiguracion(varIdCompania);

    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }


  async function eliminarRegistro(justificaicon, confirm) {
    setSelectedDelete(justificaicon);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdCliente, IdCompania, IdConfiguracionHHEE } = selectedDelete;
      await serviceConfiguracion.eliminar({
        IdCliente: IdCliente, IdCompania: IdCompania, IdConfiguracionHHEE: IdConfiguracionHHEE, IdUsuario: usuario.username
      }).then(() => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
        listarConfiguracion(varIdCompania);
        setFocusedRowKey();
        setVarIdConfiguracionHHEE(0);
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
    }
  }

  async function listarConfiguracion(idCompania) {
    setLoading(true);
    await serviceConfiguracion.listar(
      {
        IdCliente
        , IdCompania: idCompania
        , IdConfiguracionHHEE: 0
        , NumPagina: 0
        , TamPagina: 0
      }
    ).then(justificaciones => {
      setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
      setListarTabs(justificaciones)
      changeTabIndex(0);
      setModoEdicion(false);

    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function obtenerRegistro() {
    setLoading(true);
    const { IdCompania, IdConfiguracionHHEE } = selected
    await serviceConfiguracion.obtener({
      IdCliente,
      IdCompania: IdCompania,
      IdConfiguracionHHEE: IdConfiguracionHHEE
    }).then(response => {
      //Pendiente convertir
      response.DiaLaborable = response.DiaLaborable === 'S' ? true : false;
      response.Feriado = response.Feriado === 'S' ? true : false;
      response.HorarioSemanal = response.HorarioSemanal === 'S' ? true : false;
      response.Domingo = response.Domingo === 'S' ? true : false;
      setDataRowEditNew({ ...response, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  const nuevoRegistro = async () => {
    changeTabIndex(1);
    let justificaicon = { Activo: "S", IdCompania: varIdCompania };
    setDataRowEditNew({
      ...justificaicon, Longitud: 0, esNuevoRegistro: true, OrigenExterno: false, AplicaFuturo: false,
      ConfigurarPorSemana: false, ConfigurarPorDia: false, AplicarMaximoMinutos: false, RequiereObservacion: false, Remunerado: false,
      AplicaPorDia: false, AplicaPorHora: false, RequiereAutorizacion: false
    });
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
    let dataRow = {
      IdCliente: IdCliente,
      IdCompania: varIdCompania,
      IdConfiguracionHHEE: 0,
    };
    await listarConfiguracionPlanilla('NUEVO', dataRow);
    await listarConfiguracionUnidadOrg('NUEVO', dataRow);
  };

  const editarRegistro = async (dataRow) => {
    changeTabIndex(1);
    await obtenerRegistro();
    await listarConfiguracionPlanilla('ACTUALIZAR', dataRow);
    await listarConfiguracionUnidadOrg('ACTUALIZAR', dataRow);
    setModoEdicion(true);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));

  };

  async function listarConfiguracionPlanilla(Accion, dataRow) {
    const { IdCliente, IdCompania, IdConfiguracionHHEE } = dataRow;
    setLoading(true);

    setDataPlanilla([]);

    await serviceConfiguracionPlanilla.listarAsignados(
      {
        Accion,
        IdCliente,
        IdCompania,
        IdConfiguracionHHEE: isNotEmpty(IdConfiguracionHHEE) ? IdConfiguracionHHEE : 0
      }).then(data => {

        setDataPlanilla(data);
        if (data.length === 0) {
          setIsVisibleAlert(true);
        } else {
          setIsVisibleAlert(false);
        }
      }).finally(() => setLoading(false));


  }

  async function listarConfiguracionUnidadOrg(Accion, dataRow) {

    setLoading(true);
    const { IdCliente, IdConfiguracionHHEE } = dataRow;

    setUnidadOrganizativaTreeView([]);

    await serviceConfiguracionUnidaOrg.listarTreeview({
      Accion: Accion,
      IdCliente: IdCliente,
      IdCompania: varIdCompania,
      IdUnidadOrganizativa: '%',
      IdConfiguracionHHEE: isNotEmpty(IdConfiguracionHHEE) ? IdConfiguracionHHEE : 0
    }).then(data => {

      if (!isNotEmpty(data)) {
        //Sin data , mostrar por defecto.
        setUnidadOrganizativaTreeView([{
          Activo: "S"
          , icon: "flaticon2-expand"
          , IdMenu: null
          , IdMenuPadre: null
          , IdModulo: ""
          , Menu: "-SIN DATOS-"
          , MenuPadre: null
          , expanded: true
        }])
      } else {
        setUnidadOrganizativaTreeView(data);

      }
    }).finally(() => setLoading(false));

  }

  // async function importarJustificaciones(listJustificaciones) {
  //   try {

  //     setTimeout(function () {

  //       if (listJustificaciones.length > 0) {
  //         listJustificaciones.map(async (data) => {
  //           const { IdConfiguracionHHEE, Justificacion, OrigenExterno, AplicaFuturo, AplicaPorDia, AplicaPorHora, AplicarDiaDescanso, ConfigurarPorSemana, NumeroVecesPorSemana,
  //             ConfigurarPorDia, NumeroVecesPorDia, AplicarMaximoMinutos, MaximoMinutos, RequiereObservacion,
  //             CodigoReferencia, Remunerado, RequiereAutorizacion, Activo } = data;

  //           let params = {
  //             IdCliente: IdCliente
  //             , IdCompania: varIdCompania
  //             , IdConfiguracionHHEE: isNotEmpty(IdConfiguracionHHEE) ? IdConfiguracionHHEE.toUpperCase() : ""
  //             , Justificacion: isNotEmpty(Justificacion) ? Justificacion.toUpperCase() : ""
  //             , Activo: Activo
  //             , Remunerado: Remunerado
  //             , OrigenExterno: OrigenExterno ? "S" : "N"
  //             , AplicaFuturo: AplicaFuturo ? "S" : "N"
  //             , AplicaPorDia: AplicaPorDia ? "S" : "N"
  //             , AplicaPorHora: AplicaPorHora ? "S" : "N"
  //             , AplicarDiaDescanso: AplicarDiaDescanso ? "S" : "N"
  //             , ConfigurarPorSemana: ConfigurarPorSemana ? "S" : "N"
  //             , NumeroVecesPorSemana: ConfigurarPorSemana ? isNotEmpty(NumeroVecesPorSemana) ? NumeroVecesPorSemana : 0 : 0
  //             , ConfigurarPorDia: ConfigurarPorDia ? "S" : "N"
  //             , NumeroVecesPorDia: ConfigurarPorDia ? isNotEmpty(NumeroVecesPorDia) ? NumeroVecesPorDia : 0 : 0
  //             , AplicarMaximoMinutos: AplicarMaximoMinutos ? "S" : "N"
  //             , MaximoMinutos: AplicarMaximoMinutos ? isNotEmpty(MaximoMinutos) ? MaximoMinutos : 0.0 : 0.0
  //             , RequiereObservacion: RequiereObservacion ? "S" : "N"
  //             , CodigoReferencia: isNotEmpty(CodigoReferencia) ? CodigoReferencia.toUpperCase() : ""
  //             , RequiereAutorizacion: RequiereAutorizacion ? "S" : "N"
  //             , IdUsuario: usuario.username
  //             , ValidSave: 'N'
  //           };
  //           await serviceConfiguracion.crear(params)
  //             .then((response) => {
  //               listarConfiguracion(varIdCompania);
  //             })
  //             .catch((err) => {
  //               handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
  //             });
  //         });
  //       }

  //     }, 500);

  //   } catch (err) {
  //     setLoading(false);
  //     handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
  //   }
  // }


  const cancelarEdicion = () => {
    changeTabIndex(0);
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };

  const seleccionarRegistro = dataRow => {
    const { IdCompania, IdConfiguracionHHEE, RowIndex } = dataRow;
    setSelected(dataRow);
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
    setVarIdCompania(IdCompania);
    setVarIdConfiguracionHHEE(IdConfiguracionHHEE);
    setFocusedRowKey(RowIndex);
  }

  const verRegistroDblClick = async (dataRow) => {
    changeTabIndex(1);
    setModoEdicion(false);
    obtenerRegistro();
  };

  const changeTabIndex = (index) => {
    handleChange(null, index);
  }

  async function listarCompanias() {
    let data = await serviceCompania.obtenerTodosConfiguracion({
      IdCliente: IdCliente,
      IdModulo: dataMenu.info.IdModulo,
      IdAplicacion: dataMenu.info.IdAplicacion,
      IdConfiguracion: "ID_COMPANIA"
    }
    ).catch(err => { handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err) });
    setCompaniaData(data);
  }

  /************--Configuración de acceso de botones*************/
  const [accessButton, setAccessButton] = useState(defaultPermissions);

  const loadControlsPermission = () => {
    let buttonsPermissions = getButtonPermissions(dataMenu.objetos);
    setAccessButton({ ...accessButton, ...buttonsPermissions });
  }
  /***********************************************************************/

  const getInfo = () => {

    const { IdCompania, Compania } = selectedCompany;
    return [

      { text: [intl.formatMessage({ id: "COMMON.CODE" })], value: IdCompania, colSpan: 2 },
      { text: [intl.formatMessage({ id: "ADMINISTRATION.PERSON.COMPANY" })], value: Compania, colSpan: 4 }

    ];
  }

  const changeValueCompany = (company) => {
    if (isNotEmpty(company)) {
      const { IdCompania } = company;
      setSelectedCompany(company);
      setVarIdCompania(IdCompania);
      listarConfiguracion(IdCompania);
      setVarIdConfiguracionHHEE(0);
    } else {
      setListarTabs([]);
      setSelectedCompany("");
      setVarIdCompania("");
      setVarIdConfiguracionHHEE(0);

    }
  }

  const titleHeaderToolbar = () => {
    let tabsTitles = [
      "",
      "",
    ];
    let sufix = tabsTitles[tabIndex] !== "" ? (" - " + `${intl.formatMessage({ id: tabsTitles[tabIndex] })}`) : "";
    return `${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} ` + " " + sufix;
  }

  const tabsDisabled = () => {
    return (isNotEmpty(varIdCompania) && isNotEmpty(varIdConfiguracionHHEE)) ? true : false;
  }

  useEffect(() => {
    loadControlsPermission();
    listarCompanias();
  }, []);


  const tabContent_ConfiguracionHhEeListPage = () => {
    return <>
      <ConfiguracionHhEeListPage
        justificaciones={listarTabs}
        editarRegistro={editarRegistro}
        eliminarRegistro={eliminarRegistro}
        nuevoRegistro={nuevoRegistro}
        seleccionarRegistro={seleccionarRegistro}
        verRegistroDblClick={verRegistroDblClick}
        focusedRowKey={focusedRowKey}
        accessButton={accessButton}
        dataRowEditNew={dataRowEditNew}
        //importarJustificaciones={importarJustificaciones}
        companiaData={companiaData}
        changeValueCompany={changeValueCompany}
        // changeValueCompanyImport={changeValueCompanyImport}
        varIdCompania={varIdCompania}
        setVarIdCompania={setVarIdCompania}
        setFocusedRowKey={setFocusedRowKey}
        selectedCompany={selectedCompany}
      />
    </>
  }

  const tabContent_ConfiguracionHhEeEditPage = () => {
    return <>
      <ConfiguracionHhEeEditPage
        modoEdicion={modoEdicion}
        dataRowEditNew={dataRowEditNew}
        setDataRowEditNew={setDataRowEditNew}
        actualizarRegistro={actualizarRegistro}
        agregarRegistro={agregarRegistro}
        cancelarEdicion={cancelarEdicion}
        titulo={titulo}
        accessButton={accessButton}
        settingDataField={dataMenu.datos}
        getInfo={getInfo}
        varIdCompania={varIdCompania}
        dataPlanilla={dataPlanilla}
        unidadOrganizativaTreeView={unidadOrganizativaTreeView}
        isVisibleAlert={isVisibleAlert}
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
  }

  return (
    <>
      <TabNavContainer
        title={intl.formatMessage({ id: "ASSISTANCE.MAIN" })}
        submenu={intl.formatMessage({ id: "SYSTEM.CONFIGURATION" })}
        subtitle={`${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} `}
        nombrebarra={titleHeaderToolbar()}
        tabIndex={tabIndex}
        handleChange={handleChange}
        componentTabsHeaders={[
          {
            label: intl.formatMessage({ id: "ACTION.LIST" }),
            icon: <FormatListNumberedIcon fontSize="large" />,
          },
          {
            label: intl.formatMessage({ id: "COMMON.CONFIGURATION" }),
            icon: <FeaturedPlayListIcon fontSize="large" />,
            onClick: (e) => { obtenerRegistro() },
            disabled: !tabsDisabled()
          },
        ]}
        className={classes.tabContent}
        componentTabsBody={
          [
            tabContent_ConfiguracionHhEeListPage(),
            tabContent_ConfiguracionHhEeEditPage(),
          ]
        }
      />

      <Confirm
        message={intl.formatMessage({ id: "ALERT.REMOVE" })}
        isVisible={isVisible}
        setIsVisible={setIsVisible}
        setInstance={setInstance}
        onConfirm={() => eliminarRegistro(selected, true)}
        title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
        confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
        cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
      />
    </>
  );
};


//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::


export default injectIntl(WithLoandingPanel(ConfiguracionHhEeIndexPage));
