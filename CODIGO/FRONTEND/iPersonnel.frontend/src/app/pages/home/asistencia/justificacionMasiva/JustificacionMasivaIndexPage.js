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
  validarlista, listar, obtener, listarPersonasJustificadas,
  servicioJustificacionMasiva
} from "../../../../api/asistencia/justificacionMasiva.api";


import {
  handleErrorMessages,
  handleInfoMessages,
  handleSuccessMessages
  //handleWarningMessages,
} from "../../../../store/ducks/notify-messages";

/******************************************* */
import JustificacionMasivaEditPage from './JustificacionMasivaEditPage';
import JustificacionMasivaListPage from './JustificacionMasivaListPage'
/******************************************* */

import { getButtonPermissions, defaultPermissions, setDisabledTabs } from '../../../../../_metronic/utils/securityUtils'

import FormatListNumberedIcon from "@material-ui/icons/FormatListNumbered";
import LocalMallOutlinedIcon from '@material-ui/icons/LocalMallOutlined';
import { serviceCompania } from "../../../../api/administracion/compania.api";

import Confirm from "../../../../partials/components/Confirm";
import { uploadFile } from "../../../../api/helpers/fileBase64.api";
import JustificacionMasivoProcesarPage from './JustificacionMasivoProcesarPage';
import JustificacionMasivaPersonasPage from './JustificacionMasivaPersonasPage';
import JustificacionMasivaCancellationPage from './JustificacionMasivaCancellationPage';


const JustificacionMasivaIndexPage = (props) => {

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

  const [justificacionMasivoData, setJustificacionMasivoData] = useState([]);
  const [justificacionMasivaPersonas, setJustificacionMasivaPersonas] = useState([]);

  const [dataPersonasTemporal, setDataPersonasTemporal] = useState([]);

  const [justificacionesData, setJustificacionesData] = useState([]);

  const[subTitleName,setSubTitleName]=useState([]);

  const handleChange = (event, newValue) => {
    //Estado cambio de tabs
    setValue(newValue);
    setTabIndex(newValue);
  };

  async function buscarJustificacionCancelacion() {
    setLoading(true); 
    const { FechaInicio, FechaFin, IdCompania, Activo, ListaPersona } = dataRowEditNew;

    let Personas = isNotEmpty(ListaPersona) ? ListaPersona.map(x => (x.IdPersona)).join(',') : '';

    await servicioJustificacionMasiva.listarJustificacionesCancelacion({
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
    // setModoEdicion(true);
    if (!isNotEmpty(parameterFilter)) return;
    // console.log("**listarCargaMasivoJustificacion");
    // console.log("**dataRowEditNew:>", dataRowEditNew);
    setLoading(true);

    const { FechaInicio, FechaFin } = parameterFilter;
    await listar(
      {
        IdCliente
        , IdCompania: varIdCompania
        , IdJustificacion: '%'
        , IdProceso: 0
        , FechaInicio
        , FechaFin
        , NumPagina: 0
        , TamPagina: 0
      }).then(data => {
        setJustificacionMasivoData(data)
        //console.log("listarCargaMasivoHorario|data:", data);
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
  }

  /*METODO IMPORTAR JUSTIFICACION DE EXCEL */

  const procesarPersonasMasivo = async (personas) => {
    //console.log("JDL-procesarPersonas.Index", personas);
    setLoading(true);
    let params = {
      IdCliente: IdCliente
      , IdDivision: IdDivisionPerfil
      , IdCompania: varIdCompania  //dataRowEditNew.IdCompania
      , IdJustificacion: isNotEmpty(dataRowEditNew.IdJustificacion) ? dataRowEditNew.IdJustificacion : ""
      , FechaInicio: isNotEmpty(dataRowEditNew.FechaInicio) ? dateFormat(dataRowEditNew.FechaInicio, 'yyyyMMdd') : ""
      , FechaFin: isNotEmpty(dataRowEditNew.FechaFin) ? dateFormat(dataRowEditNew.FechaFin, 'yyyyMMdd') : ""
      // , DiaInicio: isNotEmpty(dataRowEditNew.DiaInicio) ? dataRowEditNew.DiaInicio : 1
      // , Indefinido: isNotEmpty(dataRowEditNew.Indefinido) ? dataRowEditNew.Indefinido : "N"
      , ListaPersona: personas
      , IdUsuario: usuario.username
      , Observacion: ""
    };
    // console.log("***procesarPersonasMasivo :> ", params);
    await servicioJustificacionMasiva.crearJustificacionesMasivas(params).then(() => {
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

  /*METODO CANCELACION  JUSTIFICACION */

  async function grabarCancelacionJustificacion(selectedRows) {
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
    // console.log("***grabarCancelacionJustificacion :> dataRowEditNew :> ", dataRowEditNew);
    // console.log("***selectedRows :> ", selectedRows);
    const { FechaInicio, FechaFin, IdCompania, Activo, ListaPersona } = dataRowEditNew;

    let listaEnvio = [];

    selectedRows.forEach(item => {
      listaEnvio.push({
        IdCliente: item.IdCliente.toString(),
        IdCompania: item.IdCompania.toString(),
        IdPersona: item.IdPersona.toString(),
        FechaInicio: dateFormat(item.FechaInicio, 'yyyyMMdd'),
        FechaFin: dateFormat(item.FechaFin, 'yyyyMMdd'),
        IdJustificacion: item.IdJustificacion.toString(),
        IdSecuencialJustificacion: item.IdSecuencialJustificacion.toString(),
        IdProceso: item.IdProceso.toString()
      });
    });

    console.log("***listaEnvio :> ", listaEnvio);

    // let Personas = isNotEmpty(ListaPersona)? ListaPersona.map(x => (x.IdPersona)).join(','):'';

    await servicioJustificacionMasiva.cancelarJustificacionesPersonasMasivas({ 
      IdCliente: IdCliente,
      IdDivision: IdDivisionPerfil,
      IdCompania: varIdCompania,
      ListaCancelacion: listaEnvio,  
      IdUsuario: usuario.username
    }).then(data => {
      console.log("**data :", data);
      buscarJustificacionCancelacion();
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
      
    buscarJustificacionCancelacion();
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
    // console.log("** listarHistorialRequisito -> dataRow:>", dataRow);
    const { IdCliente, IdCompania, IdProceso } = dataRow;
    setLoading(true);
    await servicioJustificacionMasiva.listarHistorial({
      IdCliente,
      IdCompania,
      IdProcesoMasivo: IdProceso,
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
    buscarJustificacionCancelacion();
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
    const { IdCompania, Compania, IdProceso } = selected;
    return [
      { text: [intl.formatMessage({ id: "ASSISTANCE.MASSIVE.SCHEDULES.IDPROCESS" })], value: IdProceso, colSpan: 1 },
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
 
  const tabContent_JustificacionMasivaListPage = () => { //SE LISTA LA CABECERA DE LA TABLA MASIVA
    return <>
      <JustificacionMasivaListPage
        justificacionMasivoData={justificacionMasivoData}//listarTabs
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

  const tabContent_JustificacionMasivaEditPage = () => {
    return <>
      {modoEdicion ? (
        <>
          <JustificacionMasivoProcesarPage //SE MUESTRA EL COMPONENTE QUE INGRESA LOS DATOS PARA IMPORTAR
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
        <JustificacionMasivaPersonasPage //SE LISTA EL DETALLE DE PERSONAS
          cancelarEdicion={cancelarEdicion}
          getInfo={getInfo}
          historialData={historialData}
        />
      )}
    </>
  }

  const tabContent_JustificacionMasivaCancelacion = () => {
    return <>
      <JustificacionMasivaCancellationPage
        dataRowEditNew={dataRowEditNew}
        cancelarEdicion={cancelarEdicion}
        justificacionesData={justificacionesData}
        buscarJustificacionCancelacion={buscarJustificacionCancelacion}
        grabarCancelacionJustificacion={grabarCancelacionJustificacion}
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
          tabContent_JustificacionMasivaListPage(),
          tabContent_JustificacionMasivaEditPage(),
          tabContent_JustificacionMasivaCancelacion(),
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

export default injectIntl(WithLoandingPanel(JustificacionMasivaIndexPage));


