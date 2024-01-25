import React, { useEffect, useState } from 'react';
import { injectIntl } from "react-intl";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { dateFormat, getDateOfDay, getStartAndEndOfMonthByDay, isNotEmpty } from "../../../../../_metronic";
import {
  useStylesEncabezado,
  useStylesTab,
} from "../../../../store/config/Styles";
import TabNavContainer from "../../../../partials/components/Tabs/TabNavContainer";
import { serviceHorarioMasivo } from "../../../../api/asistencia/horarioMasivo.api";


import {
  handleErrorMessages,
  handleSuccessMessages,
} from "../../../../store/ducks/notify-messages";

/******************************************* */
import HorarioMasivoProcesarPage from './HorarioMasivoProcesarPage';
import HorarioMasivoListPage from './HorarioMasivoListPage'
/******************************************* */

import { getButtonPermissions, defaultPermissions, setDisabledTabs } from '../../../../../_metronic/utils/securityUtils'

import FormatListNumberedIcon from "@material-ui/icons/FormatListNumbered";
import LocalMallOutlinedIcon from '@material-ui/icons/LocalMallOutlined';
import { serviceCompania } from "../../../../api/administracion/compania.api";

import Confirm from "../../../../partials/components/Confirm";
import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";
import HorarioMasivoPersonasPage from './HorarioMasivoPersonasPage';


const HorarioMasivoIndexPage = (props) => {

  const usuario = useSelector(state => state.auth.user);
  const { IdCliente, IdDivision } = useSelector(state => state.perfil.perfilActual);
  const { intl, setLoading, dataMenu } = props;

  const numeroTabs = 2; //Definicion numero de tabs que contiene el formulario.

  const [accessButton, setAccessButton] = useState(defaultPermissions);
  const [disabledFiltrosFrm, setDisabledFiltrosFrm] = useState(false);
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
  const [companiaData, setCompaniaData] = useState([]);
  const [varIdCompania, setVarIdCompania] = useState("");
  const [companyName, setCompanyName] = useState("");


  const [nuevaAsignacionImportar, setNuevaAsignacionImportar] = useState(false);

  const loadControlsPermission = () => {
    let buttonsPermissions = getButtonPermissions(dataMenu.objetos);
    let newTabs = setDisabledTabs(dataMenu.objetos, numeroTabs);
    setAccessButton({ ...accessButton, ...buttonsPermissions, Tabs: newTabs });
  }

  const [dataRowEditNew, setDataRowEditNew] = useState({ esnuevaAsginacionConAsistente: true, Tipo: 0, FechaInicio: new Date(), FechaFin: new Date(), IdProcesoMasivo: 0 });
  // const [personasValidadas, setPersonasValidadas] = useState([]);
  //const [procesados, setProcesados] = useState(false);

  const [instance, setInstance] = useState({});
  const [isVisible, setIsVisible] = useState(false);
  const [value, setValue] = useState(0);
  const [tabIndex, setTabIndex] = useState(0);

  const [selected, setSelected] = useState({});
  //const [selectedDelete, setSelectedDelete] = useState({});
  const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ASSISTANCE.MASSIVE.SCHEDULES.TITEL.ASSIGNED" }));
  const [modoEdicion, setModoEdicion] = useState(false);

  const [dataPersonasTemporal, setDataPersonasTemporal] = useState([]);

  //const [listarTabs, setListarTabs] = useState([]);
  const [horarioMasivoData, setHorarioMasivoData] = useState([]);
  const [varIdProceso, setVarIdProceso] = useState("");
  const [focusedRowKey, setFocusedRowKey] = useState();

  const [historialData, setHistorialData] = useState([]);
  const [disabledPeopleButton, setDisabledPeopleButton] = useState(true);

  const handleChange = (event, newValue) => {
    //Estado cambio de tabs
    setValue(newValue);
    setTabIndex(newValue);
  };

  async function listarCargaMasivoHorario(parameterFilter) {
    // setModoEdicion(true);
    if (!isNotEmpty(parameterFilter)) return;
    
    setLoading(true);
    const { FechaInicio, FechaFin } = parameterFilter;
    await serviceHorarioMasivo.listar({ IdCliente, IdDivision, IdCompania: varIdCompania, FechaInicio, FechaFin }).then(data => {
      setHorarioMasivoData(data)
      //console.log("listarCargaMasivoHorario|data:", data);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  const asignarHorarioMasivo = async () => {
    setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
    changeTabIndex(1);
    setModoEdicion(false);
    //obtenerHorarioMasivo(selected);
    listarHistorialRequisito(selected);
  };

  const seleccionarRegistro = dataRow => {
    const { RowIndex, IdProcesoMasivo } = dataRow;
    setSelected(dataRow);
    setFocusedRowKey(RowIndex);
    setVarIdProceso(IdProcesoMasivo);
  }

  const verRegistroDblClick = async (dataRow) => {
    //console.log("verRegistroDblClick|dataRow:", dataRow);
    setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
    changeTabIndex(1);
    setModoEdicion(false);
    obtenerHorarioMasivo(dataRow);
    listarHistorialRequisito(dataRow);
  }

  async function obtenerHorarioMasivo(dataRow) {
    setLoading(true);
    const { IdCliente, IdProcesoMasivo } = dataRow;
    await serviceHorarioMasivo.obtener(
      {
        IdCliente: IdCliente,
        IdProcesoMasivo: IdProcesoMasivo
      }
    ).then(data => {
      setDataRowEditNew({ ...data, esnuevaAsginacionConAsistente: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false) })

  }

  async function getCompanySeleccionada(idCompania, data) {

    if (isNotEmpty(idCompania)) {
      setVarIdCompania(idCompania);
    }
    if (data.length > 0) {
      const { Compania } = data[0];
      setCompanyName(Compania);
    }
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

  async function listarHistorialRequisito(dataRow) {

    const { IdCliente, IdCompania, IdProcesoMasivo } = dataRow;
    setLoading(true);
    await serviceHorarioMasivo.listarHistorial({
      IdCliente,
      IdCompania,
      IdProcesoMasivo,
      IdPersona: 0,
    }).then(data => {
      setHistorialData(data);
    }).catch((err) => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false) });

  };

  const nuevaAsginacionConAsistente = async () => {
    changeTabIndex(1);
    setNuevaAsignacionImportar(false);
    const { FechaFin } = getStartAndEndOfMonthByDay();
    //console.log("FechaFin>>", FechaFin);
    setDataRowEditNew({ FechaInicio: new Date(), FechaFin, Indefinido: 'N', esNuevoRegistro: true });
    //setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
    // setDisabledPeopleButton(false);
    //setDisabledFiltrosFrm(false);
    setDataPersonasTemporal([]);
  }

  const nuevaAsginacionImportar = async () => {
    changeTabIndex(1);
    setNuevaAsignacionImportar(true);
    const { FechaFin } = getStartAndEndOfMonthByDay();
    console.log("FechaFin>>", FechaFin);
    setDataRowEditNew({ FechaInicio: new Date(), FechaFin, Indefinido: 'N', esNuevoRegistro: true });
    //setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
    // setDisabledPeopleButton(false);
    //setDisabledFiltrosFrm(false);
    setDataPersonasTemporal([]);
  }

  const procesarPersonas = async (personas) => {
    //console.log("JDL-procesarPersonas.Index", personas);
    setLoading(true);
    let params = {
      IdCliente: IdCliente
      , IdDivision: IdDivision
      , IdCompania: dataRowEditNew.IdCompania
      , IdHorario: isNotEmpty(dataRowEditNew.IdHorario) ? dataRowEditNew.IdHorario : ""
      , FechaInicio: isNotEmpty(dataRowEditNew.FechaInicio) ? dateFormat(dataRowEditNew.FechaInicio, 'yyyyMMdd') : ""
      , FechaFin: isNotEmpty(dataRowEditNew.FechaFin) ? dateFormat(dataRowEditNew.FechaFin, 'yyyyMMdd') : ""
      , DiaInicio: isNotEmpty(dataRowEditNew.DiaInicio) ? dataRowEditNew.DiaInicio : 1
      , Indefinido: isNotEmpty(dataRowEditNew.Indefinido) ? dataRowEditNew.Indefinido : "N"
      , ListaPersona: personas
      , IdUsuario: usuario.username
    };

    await serviceHorarioMasivo.crearHorariosMasivos(params).then(() => {
      //console.log("CrearHoraioMasivo-result", response);
      // setPersonasValidadas(response);
      setDataPersonasTemporal([]);
      //setDataPersonasTemporal(response);
      // setProcesados(true);
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      cancelarEdicion();

    }).catch(error => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), error);
      // setProcesados(false);
    }).finally(() => {
      setLoading(false);
    });
  }

  const validarPersona = async (personas) => {
    //console.log("JDL->Index-validarPersona->", personas);
    let param = {
      IdCliente: IdCliente
      , IdDivision: IdDivision
      , IdCompania: dataRowEditNew.IdCompania
      , IdHorario: dataRowEditNew.IdHorario
      , FechaInicio: dateFormat(dataRowEditNew.FechaInicio, 'yyyyMMdd')
      , FechaFin: dateFormat(dataRowEditNew.FechaFin, 'yyyyMMdd')
      , DiaInicio: isNotEmpty(dataRowEditNew.DiaInicio) ? dataRowEditNew.DiaInicio : 0
      , Indefinido: isNotEmpty(dataRowEditNew.Indefinido) ? dataRowEditNew.Indefinido : ""
      , ListaPersona: personas
      , IdUsuario: usuario.username
    };
    setLoading(true);
    await serviceHorarioMasivo.validarPersonas(param).then(resp => {
      //console.log("JDL->validarPersona|resp:", resp);
      // setPersonasValidadas(resp);
      if (dataPersonasTemporal.length > 0) {

        if (resp.length > 0) {

          for (let i = 0; i < resp.length; i++) {
            if (!dataPersonasTemporal.find(x => x.IdPersona === resp[i].IdPersona))
              dataPersonasTemporal.push(resp[i]);
          }
          let newArray = [];
          newArray = dataPersonasTemporal;
          // console.log("newArray:newArray", newArray);
          setDataPersonasTemporal([]);
          setDataPersonasTemporal(newArray);
        }
      } else {
        setDataPersonasTemporal([]);
        setDataPersonasTemporal(resp);
      }
      // setProcesados(false);
    }).catch(error => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), error);
    }).finally(() => {
      setLoading(false);
    });
  }

  const cancelarEdicion = () => {
    changeTabIndex(0);
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataPersonasTemporal([]);
    setDisabledFiltrosFrm(false);
    //  setDataRowEditNew({ FechaInicio: new Date(), Indefinido:'N' });
  };


  // :::::::::::::::::::::::::::: Configuracions principales :::::::::::::::::::::::::::::::::::::::::::::

  const tabsDisabled = () => {
    return isNotEmpty(varIdProceso) ? false : true;
  }


  const changeTabIndex = (index) => {
    handleChange(null, index);
  }


  useEffect(() => {

    if (!isNotEmpty(varIdCompania)) {

      if (companiaData.length > 0) {
        const { IdCompania } = companiaData[0];
        var company = companiaData.filter(x => x.IdCompania === IdCompania);
        getCompanySeleccionada(IdCompania, company);
      }
    }
  }, [companiaData]);


  useEffect(() => {
    loadControlsPermission();
    listarCompanias();

  }, []);

  const getInfo = () => {
    const { IdCompania, Compania, IdProcesoMasivo } = selected;
    return [
      { text: [intl.formatMessage({ id: "ASSISTANCE.MASSIVE.SCHEDULES.IDPROCESS" })], value: IdProcesoMasivo, colSpan: 1 },
      { text: [intl.formatMessage({ id: "COMMON.CODE" })], value: IdCompania, colSpan: 2 },
      { text: [intl.formatMessage({ id: "ADMINISTRATION.COMPANY.COMPANY" })], value: Compania, colSpan: 3 }
    ];
  }


  const tabContent_HorarioMasivoListPage = () => {
    return <>
      <HorarioMasivoListPage
        //modoEdicion={modoEdicion}
        horarioMasivoData={horarioMasivoData}
        dataRowEditNew={dataRowEditNew}
        varIdCompania={varIdCompania}
        companiaData={companiaData}

        nuevaAsginacionConAsistente={nuevaAsginacionConAsistente}
        nuevaAsginacionImportar={nuevaAsginacionImportar}

        seleccionarRegistro={seleccionarRegistro}
        verRegistroDblClick={verRegistroDblClick}
        listarCargaMasivoHorario={listarCargaMasivoHorario}
        accessButton={accessButton}
        focusedRowKey={focusedRowKey}
        setLoading={setLoading}
        listarHistorialRequisito={listarHistorialRequisito}
        getCompanySeleccionada={getCompanySeleccionada}
      //historialData={historialData}
      />
    </>
  }

  const tabContent_HorarioEditPage = () => {
    return <>
      {modoEdicion ? (
        <>
          <HorarioMasivoProcesarPage
            titulo={titulo}
            modoEdicion={modoEdicion}
            dataRowEditNew={dataRowEditNew}
            setDataRowEditNew={setDataRowEditNew}
            validarPersona={validarPersona}
            varIdCompania={varIdCompania}
            companiaData={companiaData}
            companyName={companyName}
            nuevaAsignacionImportar={nuevaAsignacionImportar}

            procesarPersonas={procesarPersonas}
            cancelarEdicion={cancelarEdicion}
            dataPersonasTemporal={dataPersonasTemporal}
            setDataPersonasTemporal={setDataPersonasTemporal}
            setDisabledFiltrosFrm={setDisabledFiltrosFrm}
            disabledFiltrosFrm={disabledFiltrosFrm}
            disabledPeopleButton={disabledPeopleButton}
            setDisabledPeopleButton={setDisabledPeopleButton}

            getCompanySeleccionada={getCompanySeleccionada}
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
      ) : (
        <HorarioMasivoPersonasPage
          cancelarEdicion={cancelarEdicion}
          getInfo={getInfo}
          historialData={historialData}
        />



      )}

    </>
  }

  return (
    <>
      <TabNavContainer
        title={intl.formatMessage({ id: "ASSISTANCE.MAIN" })}
        submenu={intl.formatMessage({ id: "CONFIG.MENU.ASISTENCIA.GESTIÓN_DE_JUSTIFICACIO" })}
        subtitle={intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })}
        nombrebarra={intl.formatMessage({ id: "ASIGNACION MASIVA DE HORARIOS" })} //JDL->PENDIENTE
        tabIndex={tabIndex}
        handleChange={handleChange}
        value={value}
        componentTabsHeaders={[
          {
            label: intl.formatMessage({ id: "ACTION.LIST" }),
            icon: <FormatListNumberedIcon fontSize="large" />,
            onClick: () => { listarCargaMasivoHorario(); },
          },
          {
            label: intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` }),
            icon: <LocalMallOutlinedIcon fontSize="large" />,
            onClick: () => { asignarHorarioMasivo(); },
            // disabled: false
            disabled: !tabsDisabled() && accessButton.Tabs[1] ? false : true
          }
        ]}
        componentTabsBody={[
          tabContent_HorarioMasivoListPage(),
          tabContent_HorarioEditPage(),
        ]}
      />

      <Confirm
        message={intl.formatMessage({ id: "ALERT.REMOVE" })}
        isVisible={isVisible}
        setIsVisible={setIsVisible}
        setInstance={setInstance}
        //onConfirm={() => eliminarListRowTab(selectedDelete, true)}
        title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
        confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
        cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
      />

    </>
  );
};

export default injectIntl(WithLoandingPanel(HorarioMasivoIndexPage));
