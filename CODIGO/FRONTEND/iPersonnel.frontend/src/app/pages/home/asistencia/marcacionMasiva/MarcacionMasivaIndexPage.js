import React, { useEffect, useState } from 'react';
import { injectIntl } from "react-intl";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
//import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { dateFormat, getStartAndEndOfMonthByDay, getStartOfMonthAndToday, isNotEmpty } from "../../../../../_metronic";
// import {
//     useStylesEncabezado,
//     useStylesTab,
// } from "../../../../store/config/Styles";
import TabNavContainer from "../../../../partials/components/Tabs/TabNavContainer";

import {
   listar,servicioMarcacionMasiva
} from "../../../../api/asistencia/marcacionMasiva.api";


import {
  handleErrorMessages,
  handleInfoMessages,
  handleSuccessMessages
  //handleWarningMessages,
} from "../../../../store/ducks/notify-messages";

/******************************************* */
// import JustificacionMasivaEditPage from './JustificacionMasivaEditPage';
import MarcacionMasivaListPage from './MarcacionMasivaListPage'
/******************************************* */

import { getButtonPermissions, defaultPermissions, setDisabledTabs } from '../../../../../_metronic/utils/securityUtils'

import FormatListNumberedIcon from "@material-ui/icons/FormatListNumbered";
import LocalMallOutlinedIcon from '@material-ui/icons/LocalMallOutlined';
import { serviceCompania } from "../../../../api/administracion/compania.api";

import Confirm from "../../../../partials/components/Confirm";
import { uploadFile } from "../../../../api/helpers/fileBase64.api";
import MarcacionMasivaProcesarPage from './MarcacionMasivaProcesarPage';
import MarcacionMasivaPersonasPage from './MarcacionMasivaPersonasPage';
import MarcacionMasivaCancellationPage from './MarcacionMasivaCancellationPage'; //LSF-Pendiente


const MarcacionMasivaIndexPage = (props) => {

  const usuario = useSelector(state => state.auth.user);
  const { IdCliente, IdPerfil } = useSelector(state => state.perfil.perfilActual);
  const { intl, setLoading, dataMenu } = props;
  const IdDivisionPerfil = useSelector(state => state.perfil.perfilActual.IdDivision);

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

  /************************************ */
  const [dataRowEditNew, setDataRowEditNew] = useState({ esnuevaAsginacionConAsistente: true, Tipo: 0, FechaInicio: getStartOfMonthAndToday().FechaInicio, FechaFin: getStartOfMonthAndToday().FechaFin, IdProcesoMasivo: 0 });
  const [personasValidadas, setPersonasValidadas] = useState([]);
  const [procesados, setProcesados] = useState(false);
  /************************************ */
  const [modoEdicion, setModoEdicion] = useState(false);
  const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.EDIT" }));
  const [, setInstance] = useState({});
  const [isVisible, setIsVisible] = useState(false);

  const [value, setValue] = useState(0);
  const [tabIndex, setTabIndex] = useState(0);

  const [selected, setSelected] = useState({});
  const [selectedDelete, setSelectedDelete] = useState({});
  const [focusedRowKey, setFocusedRowKey] = useState();

  const [historialData, setHistorialData] = useState([]);
  const [justificaciones, setJustificaciones] = useState([]);
  const [varIdProceso, setVarIdProceso] = useState("");

  const [marcacionMasivaData, setMarcacionMasivaData] = useState([]);
  const [justificacionMasivaPersonas, setJustificacionMasivaPersonas] = useState([]);

  const [dataPersonasTemporal, setDataPersonasTemporal] = useState([]);

  const [justificacionesData, setJustificacionesData] = useState([]);

  const[subTitleName,setSubTitleName]=useState([]);

  const handleChange = (event, newValue) => {
    //Estado cambio de tabs
    setValue(newValue);
    setTabIndex(newValue);
  };

  async function buscarMarcacionCancelacion() {
    setLoading(true); 
    const { FechaInicio, FechaFin, IdCompania, Activo, ListaPersona } = dataRowEditNew;

    let Personas = isNotEmpty(ListaPersona) ? ListaPersona.map(x => (x.IdPersona)).join(',') : '';

    await servicioMarcacionMasiva.listarMarcacionCancelacion({
      IdCliente,
      IdCompania,
      FechaInicio: dateFormat(FechaInicio, "yyyyMMdd"),
      FechaFin: dateFormat(FechaFin, "yyyyMMdd"),
      Activo,
      Personas: isNotEmpty(Personas) ? Personas : '',
      numPagina: 0,
      tamPagina: 0
    }).then(data => {
      // setHistorialData(data);
      setJustificacionesData(data);
    }).catch((err) => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false) });

  }

  async function listarCargaMasivoJustificacion(parameterFilter) { 
    if (!isNotEmpty(parameterFilter)) return; 
    setLoading(true);

    const { FechaInicio, FechaFin } = parameterFilter;
    await listar(
      {
        IdCliente
        , IdCompania: varIdCompania 
        , IdProceso: 0
        , FechaInicio
        , FechaFin
        , NumPagina: 0
        , TamPagina: 0
      }).then(data => {
        setMarcacionMasivaData(data) 
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
  }

  /*METODO IMPORTAR JUSTIFICACION DE EXCEL */

  const procesarPersonasMasivo = async (personas) => {
    //console.log("JDL-procesarPersonas.Index", personas);
    console.log("***procesarPersonasMasivo:> personas :> ",personas);
    setLoading(true);
    let params = {
      IdCliente: IdCliente
      , IdDivision: IdDivisionPerfil
      , IdCompania: varIdCompania  //dataRowEditNew.IdCompania 
      , FechaInicio: isNotEmpty(dataRowEditNew.FechaInicio) ? dateFormat(dataRowEditNew.FechaInicio, 'yyyyMMdd') : ""
      , FechaFin: isNotEmpty(dataRowEditNew.FechaFin) ? dateFormat(dataRowEditNew.FechaFin, 'yyyyMMdd') : "" 
      , ListaPersona: personas
      , IdUsuario: usuario.username 
    }; 
    await servicioMarcacionMasiva.crearMarcacionesMasivas(params).then(() => { 
      setDataPersonasTemporal([]); 
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      cancelarEdicion();

    }).catch(error => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), error);
      // setProcesados(false);
    }).finally(() => {
      setLoading(false);
    });
  }

  /*METODO CANCELACION  MARCACION */ 
  async function grabarCancelacionMarcacion(selectedRows) {
    // VALIDAR SI HAY PERSONAS SELECCIONADAS
    if (selectedRows.length == 0) {
      handleInfoMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), intl.formatMessage({ id: "ASSISTANCE.MASSIVE.JUSTIFICATION.MESSAGE_SELECT_SOME" }));
      return;
    }
    // VALIDAR SI HAY INACTIVOS :  
    let lstAux = selectedRows.filter(x=>x.Activo=='N');
    if(lstAux.length > 0){
      handleInfoMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), intl.formatMessage({ id: "ASSISTANCE.MASSIVE.JUSTIFICATION.MESSAGE_SELECT_ACTIVE" }));
      return;  
    } 
    setLoading(true);
 
    //REALIZAR LA CANCELACION MASIVA 
    const { FechaInicio, FechaFin, IdCompania, Activo, ListaPersona } = dataRowEditNew;

    let listaEnvio = [];

    console.log("**grabarCancelacionMarcacion**selectedRows :> ", selectedRows);

    selectedRows.forEach(item => {
      listaEnvio.push({
        IdCliente: item.IdCliente.toString(),
        IdCompania: item.IdCompania.toString(),
        IdPersona: item.IdPersona.toString(), 
        IdSecuencialMarcacion: item.IdSecuencialMarcacion.toString(),
        IdSecuencialMasiva: item.IdSecuencialMasiva.toString(),
        IdProcesoMasivo: item.IdProcesoMasivo.toString(),
        FechaMarca: item.FechaMarca.toString()
      });
    });

    console.log("***listaEnvio :> ", listaEnvio);

    // let Personas = isNotEmpty(ListaPersona)? ListaPersona.map(x => (x.IdPersona)).join(','):'';

    await servicioMarcacionMasiva.cancelarMarcacionesMasivas({ 
      IdCliente: IdCliente,
      IdDivision: IdDivisionPerfil,
      IdCompania: varIdCompania,
      ListaCancelacion: listaEnvio,  
      IdUsuario: usuario.username
    }).then(data => {
      console.log("**data :", data);
      buscarMarcacionCancelacion();
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      
      // setHistorialData(data);
      // setJustificacionesData(data);
    }).catch((err) => { 
      if (err.response.status == 400) {
        var msj = intl.formatMessage({ id: err.response.data.responseException.exceptionMessage }); 
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), msj, true)
      }
      else
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)


      // handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false) });

  }


  /*  EVENTOS GRILLAS  */


  const eventoRefrescar = () => { 

    // setDataRowEditNew({ 
    //   esnuevaAsginacionConAsistente: true, 
    //   Tipo: 0, 
    //   FechaInicio: getStartOfMonthAndToday().FechaInicio, 
    //   FechaFin: getStartOfMonthAndToday().FechaFin, 
    //   IdProcesoMasivo: 0 } 
    // );
    
    dataRowEditNew.Activo = 'S';
    dataRowEditNew.ListaPersona = ''; 
    dataRowEditNew.ListaPersonaView = '';  
    dataRowEditNew.FechaInicio = getStartOfMonthAndToday().FechaInicio; 
    dataRowEditNew.FechaFin = getStartOfMonthAndToday().FechaFin; 
      
    buscarMarcacionCancelacion();
  }


  const cancelarEdicion = () => {
    changeTabIndex(0);
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    
    setSubTitleName("");
    // setDataRowEditNew({});
    setDataPersonasTemporal([]);
    setDisabledFiltrosFrm(false);//??
  };

  const asignarHorarioMasivo = async () => {
    setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
    changeTabIndex(1);
    setModoEdicion(false);
    //obtenerHorarioMasivo(selected);
    listarHistorialRequisito(selected);
  };

  const seleccionarRegistro = dataRow => {
    const { RowIndex, IdProceso } = dataRow;
    setSelected(dataRow);
    setFocusedRowKey(RowIndex);
    setVarIdProceso(IdProceso);
  }

  const verRegistroDblClick = async (dataRow) => {
    //console.log("verRegistroDblClick|dataRow:", dataRow);
    setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
    changeTabIndex(1);
    setModoEdicion(false);
    // obtenerHorarioMasivo(dataRow); ????
    listarHistorialRequisito(dataRow);
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
    console.log("** listarHistorialRequisito -> dataRow:>", dataRow);
    const { IdCliente, IdCompania, IdProcesoMasivo } = dataRow;
    setLoading(true);
    await servicioMarcacionMasiva.listarHistorial({
      IdCliente,
      IdCompania,
      IdProcesoMasivo: IdProcesoMasivo,
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
    setDataRowEditNew({ FechaInicio: new Date(), FechaFin, Indefinido: 'N', esNuevoRegistro: true });
    setModoEdicion(true);
    setDataPersonasTemporal([]);
  }

  const nuevaAsginacionImportar = async () => {
    // console.log("**nuevaAsginacionImportar**");
    changeTabIndex(1);
    setNuevaAsignacionImportar(true);
    const { FechaFin } = getStartAndEndOfMonthByDay();
    // console.log("FechaFin>>", FechaFin);
    setDataRowEditNew({ FechaInicio: new Date(), FechaFin, Indefinido: 'N', esNuevoRegistro: true });
    setModoEdicion(true);
    setDataPersonasTemporal([]);
  }

  const nuevaCancelacionJustificaciones = async () => { 
    dataRowEditNew.Activo = 'S';
    dataRowEditNew.ListaPersona = ''; 
    setSubTitleName(' - ' +  intl.formatMessage({ id: "ASSISTANCE.MASSIVE.JUSTIFICATION.CANCELLATION_NAME_SUBTITLE" }));
    buscarMarcacionCancelacion();
    changeTabIndex(2);
    setModoEdicion(true);
  }

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
    // console.log("**getInfo :> selected :>",selected );
    const { IdCompania, Compania, IdProcesoMasivo } = selected;
    return [
      { text: [intl.formatMessage({ id: "ASSISTANCE.MASSIVE.SCHEDULES.IDPROCESS" })], value: IdProcesoMasivo, colSpan: 1 },
      { text: [intl.formatMessage({ id: "COMMON.CODE" })], value: IdCompania, colSpan: 2 },
      { text: [intl.formatMessage({ id: "ADMINISTRATION.COMPANY.COMPANY" })], value: Compania, colSpan: 3 }
    ];
  }
  const getInfoCancelacion = () => { 
    // const { IdCompania, Compania, IdProceso } = dataRowEditNew;
    return [
      // { text: [intl.formatMessage({ id: "ASSISTANCE.MASSIVE.SCHEDULES.IDPROCESS" })], value: IdProceso, colSpan: 1 },
      { text: [intl.formatMessage({ id: "COMMON.CODE" })], value: varIdCompania, colSpan: 2 },
      { text: [intl.formatMessage({ id: "ADMINISTRATION.COMPANY.COMPANY" })], value: companyName, colSpan: 3 }
    ];
  }
 
  const tabContent_MarcacionMasivaListPage = () => { //SE LISTA LA CABECERA DE LA TABLA MASIVA
    return <>
      <MarcacionMasivaListPage
        marcacionMasivaData={marcacionMasivaData}//listarTabs
        dataRowEditNew={dataRowEditNew}
        varIdCompania={varIdCompania}
        companiaData={companiaData}

        nuevaAsginacionConAsistente={nuevaAsginacionConAsistente}
        nuevaAsignacionImportar={nuevaAsginacionImportar}
        nuevaCancelacionJustificaciones={nuevaCancelacionJustificaciones}


        editarRegistro={() => { }}
        eliminarRegistro={() => { }}
        nuevoRegistro={() => { }}
        seleccionarRegistro={seleccionarRegistro}
        verRegistroDblClick={verRegistroDblClick}
        listarCargaMasivoJustificacion={listarCargaMasivoJustificacion}

        accessButton={accessButton}
        focusedRowKey={focusedRowKey}
        setLoading={setLoading}

        idAplicacion={dataMenu.info.IdAplicacion}
        idModulo={dataMenu.info.IdModulo}
        idMenu={dataMenu.info.IdMenu}

        getCompanySeleccionada={getCompanySeleccionada}
      />
    </>
  }

  const tabContent_MarcacionMasivaEditPage = () => {
    return <>
      {modoEdicion ? (
        <>
          <MarcacionMasivaProcesarPage //SE MUESTRA EL COMPONENTE QUE INGRESA LOS DATOS PARA IMPORTAR
            titulo={titulo}
            modoEdicion={modoEdicion}
            dataRowEditNew={dataRowEditNew}
            setDataRowEditNew={setDataRowEditNew}
            varIdCompania={varIdCompania}
            companiaData={companiaData}
            companyName={companyName}
            nuevaAsignacionImportar={nuevaAsignacionImportar}

            procesarPersonasMasivo={procesarPersonasMasivo}//---> ERA ASI procesarPersonas={procesarPersonas} pero chca con otro nombre existente
            cancelarEdicion={cancelarEdicion}
            dataPersonasTemporal={dataPersonasTemporal}
            setDataPersonasTemporal={setDataPersonasTemporal}

            getCompanySeleccionada={getCompanySeleccionada}
          />
          {/* <div className="container_only">
            <div className="float-right">
              <ControlSwitch checked={auditoriaSwitch}
                onChange={e => { setAuditoriaSwitch(e.target.checked) }}
              /><b> {intl.formatMessage({ id: "AUDIT.DATA" })}</b>
            </div>
          </div>
          {auditoriaSwitch && (<AuditoriaPage dataRowEditNew={dataRowEditNew} />)} */}
        </>
      ) : (
        <MarcacionMasivaPersonasPage //SE LISTA EL DETALLE DE PERSONAS
          cancelarEdicion={cancelarEdicion}
          getInfo={getInfo}
          historialData={historialData}
        />
      )}
    </>
  }

  const tabContent_MarcacionMasivaCancelacion = () => {
    return <>
      <MarcacionMasivaCancellationPage
        dataRowEditNew={dataRowEditNew}
        cancelarEdicion={cancelarEdicion}
        justificacionesData={justificacionesData}
        buscarMarcacionCancelacion={buscarMarcacionCancelacion}
        grabarCancelacionMarcacion={grabarCancelacionMarcacion}
        getInfo={getInfoCancelacion}
        eventoRefrescar={eventoRefrescar}
      />
    </>
  }

  return (
    <>
      <TabNavContainer
        title={intl.formatMessage({ id: "ASSISTANCE.MAIN" })}
        submenu={intl.formatMessage({ id: "CONFIG.MENU.ASISTENCIA.GESTIÓN_DE_JUSTIFICACIO" })}
        subtitle={intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })}
        nombrebarra={intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` }) 
        + subTitleName}
        tabIndex={tabIndex}
        handleChange={handleChange}
        value={value}
        componentTabsHeaders={[
          {
            label: intl.formatMessage({ id: "ACTION.LIST" }),
            icon: <FormatListNumberedIcon fontSize="large" />,
            onClick: () => { listarCargaMasivoJustificacion(); },
          },
          {
            label: intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` }),
            icon: <LocalMallOutlinedIcon fontSize="large" />,
            onClick: () => { asignarHorarioMasivo(); },
            disabled: !tabsDisabled() && accessButton.Tabs[1] ? false : true
          },
        ]}
        componentTabsBody={[
          tabContent_MarcacionMasivaListPage(),
          tabContent_MarcacionMasivaEditPage(),
          tabContent_MarcacionMasivaCancelacion(),
        ]}
      />

      <Confirm
        message={intl.formatMessage({ id: "ALERT.REMOVE" })}
        isVisible={isVisible}
        setIsVisible={setIsVisible}
        setInstance={setInstance}
        // onConfirm={() => eliminarListRowTab(selectedDelete, true)}
        title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
        confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
        cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
      />

    </>
  );
};

export default injectIntl(WithLoandingPanel(MarcacionMasivaIndexPage));


