import React, { useEffect, useState } from "react";
import { useStylesEncabezado, useStylesTab } from "../../../../store/config/Styles";
import TabNavContainer from "../../../../partials/components/Tabs/TabNavContainer";
import { injectIntl } from "react-intl";
import WithLoandingPanel from "../../../../partials/content/withLoandingPanel";
import FormatListNumberedIcon from "@material-ui/icons/FormatListNumbered";
import FeaturedPlayListIcon from '@material-ui/icons/FeaturedPlayList';
// import "./SolicitudIndexPage.css";
// import SolicitudListPage from "./SolicitudListPage";
// import SolicitudEditPage from "./SolicitudEditPage";
import { useSelector } from "react-redux";
import { serviceCompania } from "../../../../api/administracion/compania.api";
import { handleErrorMessages, handleSuccessMessages } from "../../../../store/ducks/notify-messages";
import { servicePlanilla } from "../../../../api/asistencia/bloqueoPlanilla.api";
import { defaultPermissions, getButtonPermissions } from "../../../../../_metronic/utils/securityUtils";
import { dateFormat, isNotEmpty } from "../../../../../_metronic";
import BloqueoPlanillaListPage from "./BloqueoPlanillaListPage";
import BloqueoPlanillaEditPage from "./BloqueoPlanillaEditPage";

const BloqueoPlanillaIndexPage = (props) => {
  console.log("PlanillaIndexPage|props:", props);
  const { intl, setLoading, dataMenu } = props;
  const usuario = useSelector(state => state.auth.user);
  const { IdCliente, IdDivision } = useSelector(state => state.perfil.perfilActual);

  const classesEncabezado = useStylesEncabezado();
  const classes = useStylesTab();

  const [planillas, setPlanilla] = useState([]);
  const [varIdPlanilla, setVarIdPlanilla] = useState("");
  const [varIdCompania, setVarIdCompania] = useState("");
  const [focusedRowKey, setFocusedRowKey] = useState();

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
  const [companiaData, setCompaniaData] = useState([]);
  /***************************************** */

  ///////////////////////////////////////////////////////////////////////////////////////
  //METODOS Y OBJETOS DE OBTENCION DE DATOS//////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////

  async function listarCompanias() {
    console.log("listarCompanias|Ingreso:");
    let data = await serviceCompania.obtenerTodosConfiguracion({
      IdCliente: IdCliente,
      IdModulo: dataMenu.info.IdModulo,
      IdAplicacion: dataMenu.info.IdAplicacion,
      IdConfiguracion: "ID_COMPANIA"
    }
    ).catch(err => { handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err) });
    setCompaniaData(data);
    console.log("INDEX|setCompaniaData:", data);
  }

  async function listarPlanilla(idCompania) {
    setLoading(true);
    await servicePlanilla.listar(
      {
        IdCliente
        , IdCompania: idCompania
        , IdDivision: IdDivision //:'%'
        , NumPagina: 0
        , TamPagina: 0
      }
    ).then(planillas => {
      setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
      setPlanilla(planillas);
      changeTabIndex(0);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function obtenerPlanilla() {
    setLoading(true);
    const { IdCompania, IdPlanilla } = selected;
    await servicePlanilla.obtener({
      IdCliente,
      IdCompania: IdCompania,
      IdPlanilla: IdPlanilla
    }).then(planillas => {
      planillas.PrimeraUltimaMarca = planillas.PrimeraUltimaMarca === "S" ? true : false;
      setDataRowEditNew({ ...planillas, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }
  ///////////////////////////////////////////////////////////////////////////////////////
  //METODOS Y OBJETOS DE LA GRILLA  /////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////

  const nuevoRegistro = () => {
    changeTabIndex(1);
    let planilla = { Activo: "S", IdCompania: varIdCompania };
    setDataRowEditNew({ ...planilla, Longitud: 0, esNuevoRegistro: true });
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
  };

  const cancelarEdicion = () => {
    changeTabIndex(0);
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };
  
  async function agregarPlanilla(datarow) {
    setLoading(true);
    const { FechaCierrePlanilla, Activo } = datarow;
    console.log("agregarPlanilla(datarow) ");
    let data = {
        IdCliente
        , IdCompania: varIdCompania
        , IdDivision: IdDivision
        , FechaCierrePlanilla: dateFormat(FechaCierrePlanilla, "yyyyMMdd")  
        , Activo: Activo 
    };
    await servicePlanilla.crear(data).then(response => {
        if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
        setModoEdicion(false);
        listarPlanilla(varIdCompania);
    }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
}

  ///////////////////////////////////////////////////////////////////////////////////////
  //METODOS Y OBJETOS DE NAVEGADOR///////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////

  const seleccionarRegistro = dataRow => {
    const { IdCompania, IdPlanilla, RowIndex } = dataRow;
    setModoEdicion(false);
    setSelected(dataRow);
    setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
    // setVarIdCompania(IdCompania);
    setVarIdPlanilla(IdPlanilla);
    setFocusedRowKey(RowIndex);

  }

  const changeTabIndex = (index) => {
    handleChange(null, index);
  }

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
      listarPlanilla(IdCompania);
      setVarIdPlanilla("");
    } else {
      setSelectedCompany("");
      setVarIdCompania("");
      setPlanilla([]);
    }
  }

  const titleHeaderToolbar = () => {
    let tabsTitles = [
      "",
      intl.formatMessage({ id: "SECURITY.USER.DATELOCKED" }),
    ];
    let sufix = tabsTitles[tabIndex] !== "" ? (" - " + `${intl.formatMessage({ id: tabsTitles[tabIndex] })}`) : "";
    return `${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} ` + " " + sufix;
  }

  const tabsDisabled = () => {
    return (isNotEmpty(varIdCompania) && isNotEmpty(varIdPlanilla)) ? true : false;
  }


  const tabContent_BloqueoPlanillaListPage = () => {
    return <>
      <BloqueoPlanillaListPage
        companiaData={companiaData}
        planillas={planillas}
        // editarRegistro={editarRegistro}
        // eliminarRegistro={eliminarRegistro}
        nuevoRegistro={nuevoRegistro}
        seleccionarRegistro={seleccionarRegistro}
        // verRegistroDblClick={verRegistroDblClick}
        changeValueCompany={changeValueCompany}
        focusedRowKey={focusedRowKey}
        accessButton={accessButton}
        varIdCompania={varIdCompania}
        setVarIdCompania={setVarIdCompania}
        setFocusedRowKey={setFocusedRowKey}
      />
    </>
  }

  const tabContent_BloqueoPlanillaEditPage = () => {
    return <>
      <BloqueoPlanillaEditPage
        modoEdicion={modoEdicion}
        dataRowEditNew={dataRowEditNew}
        // actualizarPlanilla={actualizarPlanilla}
        agregarPlanilla={agregarPlanilla}
        cancelarEdicion={cancelarEdicion}
        titulo={titulo}
        accessButton={accessButton}
        settingDataField={dataMenu.datos}
        getInfo={getInfo}
      />
      {/* 
      <div className="container_only">
        <div className="float-right">
          <ControlSwitch
            checked={auditoriaSwitch}
            onChange={e => { setAuditoriaSwitch(e.target.checked) }}
          /><b> {intl.formatMessage({ id: "AUDIT.DATA" })}</b>
        </div>
      </div>
      {auditoriaSwitch && (<AuditoriaPage dataRowEditNew={dataRowEditNew} />)} */}
    </>
  }


  /************--Configuración de acceso de botones*************/
  const [accessButton, setAccessButton] = useState(defaultPermissions);

  const loadControlsPermission = () => {
    let buttonsPermissions = getButtonPermissions(dataMenu.objetos);
    setAccessButton({ ...accessButton, ...buttonsPermissions });
    console.log("loadControlsPermission , dataMenu.objetos :> ",dataMenu.objetos);
    console.log("loadControlsPermission , buttonsPermissions :> ",buttonsPermissions);
  }
  /***********************************************************************/


  useEffect(() => {
    listarCompanias();
    loadControlsPermission();
  }, []);


  return (
    <>

      <TabNavContainer
        title={intl.formatMessage({ id: "ASSISTANCE.MAIN" })}
        submenu={intl.formatMessage({ id: "CONFIG.MENU.ASISTENCIA.CONFIGURACIÓN" })}
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
            label: intl.formatMessage({ id: "SECURITY.USER.DATELOCKED" }),
            icon: <FeaturedPlayListIcon fontSize="large" />,
            onClick: (e) => { obtenerPlanilla() },
            disabled: !tabsDisabled()
          },
        ]}
        className={classes.tabContent}
        componentTabsBody={
          [
            tabContent_BloqueoPlanillaListPage(),
            tabContent_BloqueoPlanillaEditPage(),
          ]
        }
      />


    </>
  );


};

export default injectIntl(WithLoandingPanel(BloqueoPlanillaIndexPage));
