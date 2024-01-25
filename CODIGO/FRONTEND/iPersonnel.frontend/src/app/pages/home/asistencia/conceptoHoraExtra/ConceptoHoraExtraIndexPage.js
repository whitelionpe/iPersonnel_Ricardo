import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";

//import PropTypes from 'prop-types';
import { isNotEmpty } from "../../../../../_metronic";
import { getButtonPermissions, defaultPermissions } from '../../../../../_metronic/utils/securityUtils'
//import { Portlet, } from "../../../../partials/content/Portlet";
import { handleErrorMessages, handleSuccessMessages } from "../../../../store/ducks/notify-messages";
import { useStylesEncabezado, useStylesTab } from "../../../../store/config/Styles";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import Confirm from "../../../../partials/components/Confirm";
import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import FeaturedPlayListIcon from '@material-ui/icons/FeaturedPlayList';
import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";
import { serviceConceptoHoraExtra } from "../../../../api/asistencia/conceptoHoraExtra.api";
import { serviceCompania } from "../../../../api/administracion/compania.api";

import ConceptoHoraExtraListPage from "./ConceptoHoraExtraListPage";
import ConceptoHoraExtraEditPage from "./ConceptoHoraExtraEditPage";
import TabNavContainer from "../../../../partials/components/Tabs/TabNavContainer";

const ConceptoHoraExtraIndexPage = (props) => {

  const { intl, setLoading, dataMenu } = props;
  const usuario = useSelector(state => state.auth.user);
  const { IdCliente } = useSelector(state => state.perfil.perfilActual);
  const classesEncabezado = useStylesEncabezado();
  const classes = useStylesTab();

  const [planillas, setPlanilla] = useState([]);
  const [varIdConceptoHoraExtra, setVarIdConceptoHoraExtra] = useState("");
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

  async function agregarRegistro(datarow) {
    setLoading(true);
    const { IdCompania, IdConceptoHoraExtra, TipoHoraExtra, PrimeraUltimaMarca, Activo } = datarow;
    let data = {
      IdCliente
      , IdCompania: varIdCompania
      , IdConceptoHoraExtra: isNotEmpty(IdConceptoHoraExtra) ? IdConceptoHoraExtra.toUpperCase() : ""
      , TipoHoraExtra: isNotEmpty(TipoHoraExtra) ? TipoHoraExtra.toUpperCase() : ""
      , PrimeraUltimaMarca: (PrimeraUltimaMarca) ? "S" : "N"
      , Activo: Activo
      , IdUsuario: usuario.username
    };
    await serviceConceptoHoraExtra.crear(data).then(response => {
      if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      setModoEdicion(false);
      listarPlanilla(varIdCompania);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function actualizarRegistro(datarow) {
    setLoading(true);
    const { IdCompania, IdConceptoHoraExtra, TipoHoraExtra, PrimeraUltimaMarca, Activo } = datarow;
    let data = {
      IdCliente
      , IdCompania
      , IdConceptoHoraExtra
      , TipoHoraExtra: isNotEmpty(TipoHoraExtra) ? TipoHoraExtra.toUpperCase() : ""
      , PrimeraUltimaMarca: (PrimeraUltimaMarca) ? "S" : "N"
      , Activo: isNotEmpty(Activo) ? Activo.toUpperCase() : ""
      , IdUsuario: usuario.username
    };
    await serviceConceptoHoraExtra.actualizar(data).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      setModoEdicion(false);
      listarPlanilla(varIdCompania);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function eliminarRegistro(planilla, confirm) {
    setSelectedDelete(planilla);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdCliente, IdCompania, IdConceptoHoraExtra } = selectedDelete;
      await serviceConceptoHoraExtra.eliminar({ IdCliente: IdCliente, IdCompania: IdCompania, IdConceptoHoraExtra: IdConceptoHoraExtra, IdUsuario: usuario.username })
        .then(() => {
          handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
          listarPlanilla(varIdCompania);
          setFocusedRowKey();
          setVarIdConceptoHoraExtra("");
        }).catch(err => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });

    }
  }

  async function listarPlanilla(idCompania) {
    setLoading(true);
    await serviceConceptoHoraExtra.listar(
      {
        IdCliente
        , IdCompania: idCompania
        , IdConceptoHoraExtra: '%'
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
    const { IdCompania, IdConceptoHoraExtra } = selected;
    await serviceConceptoHoraExtra.obtener({
      IdCliente,
      IdCompania: IdCompania,
      IdConceptoHoraExtra: IdConceptoHoraExtra
    }).then(planillas => {
      planillas.PrimeraUltimaMarca = planillas.PrimeraUltimaMarca === "S" ? true : false;
      setDataRowEditNew({ ...planillas, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }


  const nuevoRegistro = () => {
    changeTabIndex(1);
    let planilla = { Activo: "S", IdCompania: varIdCompania };
    setDataRowEditNew({ ...planilla, Longitud: 0, esNuevoRegistro: true });
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
  };

  const editarRegistro = async (dataRow) => {
    changeTabIndex(1);
    setModoEdicion(true);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    obtenerPlanilla();

  };

  const cancelarEdicion = () => {
    changeTabIndex(0);
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };


  const seleccionarRegistro = dataRow => {
    const { IdCompania, IdConceptoHoraExtra, RowIndex } = dataRow;
    setModoEdicion(false);
    setSelected(dataRow);
    setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
    // setVarIdCompania(IdCompania);
    setVarIdConceptoHoraExtra(IdConceptoHoraExtra);
    setFocusedRowKey(RowIndex);

  }

  const verRegistroDblClick = async (dataRow) => {
    changeTabIndex(1);
    setModoEdicion(false);
    obtenerPlanilla();
  };

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

  async function listarCompanias() {
    //console.log("listarCompanias|Ingreso:");
    let data = await serviceCompania.obtenerTodosConfiguracion({
      IdCliente: IdCliente,
      IdModulo: dataMenu.info.IdModulo,
      IdAplicacion: dataMenu.info.IdAplicacion,
      IdConfiguracion: "ID_COMPANIA"
    }).catch(err => { handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err) });
    setCompaniaData(data);
    //console.log("INDEX|setCompaniaData:", data);
  }


  /************--Configuración de acceso de botones*************/
  const [accessButton, setAccessButton] = useState(defaultPermissions);

  const loadControlsPermission = () => {
    let buttonsPermissions = getButtonPermissions(dataMenu.objetos);
    setAccessButton({ ...accessButton, ...buttonsPermissions });
  }
  /***********************************************************************/

  const changeValueCompany = (company) => {
    if (isNotEmpty(company)) {
      const { IdCompania } = company;
      setSelectedCompany(company);
      setVarIdCompania(IdCompania);
      listarPlanilla(IdCompania);
      setVarIdConceptoHoraExtra("");
    } else {
      setSelectedCompany("");
      setVarIdCompania("");
      setPlanilla([]);
    }
  }

  const titleHeaderToolbar = () => {
    let tabsTitles = [
      "",
      intl.formatMessage({ id: "ASSISTANCE.PAYROLL" }),
    ];
    let sufix = tabsTitles[tabIndex] !== "" ? (" - " + `${intl.formatMessage({ id: tabsTitles[tabIndex] })}`) : "";
    return `${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} ` + " " + sufix;
  }

  const tabsDisabled = () => {
    return (isNotEmpty(varIdCompania) && isNotEmpty(varIdConceptoHoraExtra)) ? true : false;
  }

  useEffect(() => {
    listarCompanias();
    loadControlsPermission();
  }, []);

  const tabContent_ConceptoHoraExtraListPage = () => {
    return <>
      <ConceptoHoraExtraListPage
        companiaData={companiaData}
        dataSource={planillas}
        editarRegistro={editarRegistro}
        eliminarRegistro={eliminarRegistro}
        nuevoRegistro={nuevoRegistro}
        seleccionarRegistro={seleccionarRegistro}
        verRegistroDblClick={verRegistroDblClick}
        changeValueCompany={changeValueCompany}
        focusedRowKey={focusedRowKey}
        accessButton={accessButton}
        varIdCompania={varIdCompania}
        setVarIdCompania={setVarIdCompania}
        setFocusedRowKey={setFocusedRowKey}
      />
    </>
  }

  const tabContent_ConceptoHoraExtraEditPage = () => {
    return <>
      <ConceptoHoraExtraEditPage
        modoEdicion={modoEdicion}
        dataRowEditNew={dataRowEditNew}
        actualizarRegistro={actualizarRegistro}
        agregarRegistro={agregarRegistro}
        cancelarEdicion={cancelarEdicion}
        titulo={titulo}
        accessButton={accessButton}
        settingDataField={dataMenu.datos}
        getInfo={getInfo}
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
        submenu={intl.formatMessage({ id: "CONFIG.MENU.SISTEMA.CONFIGURACIÓN" })}
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
            label: intl.formatMessage({ id: "ASSISTANCE.OVERTIME.TYPE" }),
            icon: <FeaturedPlayListIcon fontSize="large" />,
            onClick: (e) => { obtenerPlanilla() },
            disabled: !tabsDisabled()
          },
        ]}
        className={classes.tabContent}
        componentTabsBody={
          [
            tabContent_ConceptoHoraExtraListPage(),
            tabContent_ConceptoHoraExtraEditPage(),
          ]
        }
      />

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

//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::


export default injectIntl(WithLoandingPanel(ConceptoHoraExtraIndexPage));
