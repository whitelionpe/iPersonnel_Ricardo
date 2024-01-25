import React, { useEffect, useState } from 'react';
import { injectIntl } from "react-intl";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
//import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { dateFormat, getStartAndEndOfMonthByDay, isNotEmpty } from "../../../../../_metronic";
// import {
//     useStylesEncabezado,
//     useStylesTab,
// } from "../../../../store/config/Styles";
import TabNavContainer from "../../../../partials/components/Tabs/TabNavContainer";

import { validarlista, listarPersonasJustificadas, eliminarPersonasJustificadas } from "../../../../api/asistencia/justificacionMasiva.api";

import { obtenerTodos as listarJustificaciones } from "../../../../api/asistencia/justificacion.api";
import { crear as crearJustificacionMasiva, listar, actualizar, obtener, eliminar } from "../../../../api/asistencia/justificacionMasiva.api";

import {
  handleErrorMessages,
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
// import { serviceRepositorio } from '../../../../api/sistema/repositorio.api';
//import { obtener as obtenerMenu } from "../../../../api/sistema/menu.api";

const JustificacionMasivaIndexPage = (props) => {

  const usuario = useSelector(state => state.auth.user);
  const { IdCliente, IdPerfil } = useSelector(state => state.perfil.perfilActual);
  const { intl, setLoading, dataMenu } = props;
  const IdDivisionPerfil = useSelector(state => state.perfil.perfilActual.IdDivision);

  const numeroTabs = 2; //Definicion numero de tabs que contiene el formulario.

  const [accessButton, setAccessButton] = useState(defaultPermissions);

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
  const [dataRowEditNew, setDataRowEditNew] = useState({ esnuevaAsginacionConAsistente: true, Tipo: 0, FechaInicio: new Date(), FechaFin: new Date(), IdProcesoMasivo: 0 });
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

  const [justificaciones, setJustificaciones] = useState([]);
  const [varIdProceso, setVarIdProceso] = useState("");
  //const [pathFile, setPathFile] = useState();

  // const [listarTabs, setListarTabs] = useState([]);
  const [justificacionMasivoData, setJustificacionMasivoData] = useState([]);
  const [justificacionMasivaPersonas, setJustificacionMasivaPersonas] = useState([]);


  const [dataPersonasTemporal, setDataPersonasTemporal] = useState([]);

  const handleChange = (event, newValue) => {
    //Estado cambio de tabs
    setValue(newValue);
    setTabIndex(newValue);
  };


  async function listarCargaMasivoJustificacion(parameterFilter) {
    // // setModoEdicion(true);
    // if (!isNotEmpty(parameterFilter)) return;

    // setLoading(true);
    // const { FechaInicio, FechaFin } = parameterFilter;
    // await serviceHorarioMasivo.listar({ IdCliente, IdDivision, IdCompania: varIdCompania, FechaInicio, FechaFin }).then(data => {
    //   setHorarioMasivoData(data)
    //   //console.log("listarCargaMasivoHorario|data:", data);
    // }).catch(err => {
    //   handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    // }).finally(() => { setLoading(false); });
  }


  async function eliminarPersonaJustificacion(data, confirm) {
    setSelectedDelete(data);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdCliente, IdCompania, IdPersona, IdSecuencial } = selectedDelete;
      await eliminarPersonasJustificadas({
        IdCliente: IdCliente,
        IdCompania: IdCompania,
        IdPersona: IdPersona,
        IdSecuencial: IdSecuencial
      }).then(response => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });

      listarJustificacionesMasivas()
      listarPersonas_Justificadas(selectedDelete);
    }
  }

  async function listarPersonas_Justificadas(dataRow) {

    setLoading(true);
    const { IdCliente, IdCompania, IdProceso } = dataRow;

    await listarPersonasJustificadas(
      {
        IdCliente: IdCliente
        , IdCompania: IdCompania
        , IdProceso: IdProceso
      }
    ).then(data => {
      setJustificacionMasivaPersonas(data)
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }


  async function listarJustificacionesMasivas() {
    setLoading(true);
    await listar(
      {
        IdCliente
        , IdCompania: '%'
        , IdJustificacion: '%'
        , IdProceso: 0
        , NumPagina: 0
        , TamPagina: 0
      }
    ).then(data => {
      setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
      // setListarTabs(data)
      setJustificacionMasivoData(data);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }


  const validarDatosPersona = async (personas) => {
    let param = {
      IdCliente: IdCliente,
      IdCompania: dataRowEditNew.IdCompania,
      IdPerfil: IdPerfil,
      IdDivisionPerfil: IdDivisionPerfil,
      Listapersona: personas
    };
    setLoading(true);
    await validarlista(param).then(resp => {
      setPersonasValidadas(resp);
      setProcesados(false);
    }).catch(error => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.ERROR" }), error);
    }).finally(() => {
      setLoading(false);
    });
  }

  const procesarPersonas = async (personas) => {
    let params = {
      IdCliente: IdCliente
      , IdCompania: dataRowEditNew.IdCompania
      , IdJustificacion: dataRowEditNew.IdJustificacion
      , IdProceso: 0
      , Observacion: isNotEmpty(dataRowEditNew.Observacion) ? dataRowEditNew.Observacion.toUpperCase() : ""
      , FechaInicio: dateFormat(dataRowEditNew.FechaInicio, 'yyyyMMdd')
      , FechaFin: dateFormat(dataRowEditNew.FechaFin, 'yyyyMMdd')
      //--
      , FileBase64: isNotEmpty(dataRowEditNew.FileBase64) ? dataRowEditNew.FileBase64 : ""
      , NombreArchivo: isNotEmpty(dataRowEditNew.NombreArchivo) ? dataRowEditNew.NombreArchivo : ""
      , FechaArchivo: isNotEmpty(dataRowEditNew.NombreArchivo) ? (isNotEmpty(dataRowEditNew.FechaArchivo) ? dataRowEditNew.FechaArchivo : "") : ""
      , ClaseArchivo: isNotEmpty(dataRowEditNew.IdJustificacion) ? dataRowEditNew.IdJustificacion : ""
      // --
      , ListaPersona: personas
      , IdSecuencial: 0
      , IdUsuario: usuario.username
      // -- 
      , IdDia: 0
      , Fecha: dateFormat(dataRowEditNew.Fecha, 'yyyyMMdd')
      , HoraInicio: ""
      , HoraFin: ""
      , DiaCompleto: 'S'
      , Activo: 'S',
      PathFile: "",
      IdAplicacion: dataMenu.info.IdAplicacion,
      IdModulo: dataMenu.info.IdModulo,
      IdMenu: dataMenu.info.IdMenu
    };

    if (isNotEmpty(dataRowEditNew.FileBase64)) {
      setLoading(true);
      await uploadFile(params).then(response => {
        //Recuperar Nombre archivo.
        const { nombreArchivo } = response;
        params.NombreArchivo = nombreArchivo;

        crearJustificacionMasiva(params)
          .then((response) => {
            if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
            setPersonasValidadas(response);
            setProcesados(true);
            listarJustificacionesMasivas();
          })
          .catch((err) => {
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
          }).finally(() => { setLoading(false); });
      }).catch((err) => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
    }
    else {

      setLoading(true);
      await crearJustificacionMasiva(params).then(response => {
        setPersonasValidadas(response);
        setProcesados(true);
        listarJustificacionesMasivas();
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      }).catch(error => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.ERROR" }), error);
        setProcesados(false);
      }).finally(() => {
        setLoading(false);
      });

    }

  }

  async function actualizarJustificacionMasiva(personas) {

    setLoading(true);

    let params = {
      IdCliente: IdCliente
      , IdCompania: dataRowEditNew.IdCompania
      , IdJustificacion: dataRowEditNew.IdJustificacion
      , IdProceso: dataRowEditNew.IdProceso
      , Observacion: isNotEmpty(dataRowEditNew.Observacion) ? dataRowEditNew.Observacion.toUpperCase() : ""
      , FechaInicio: dateFormat(dataRowEditNew.FechaInicio, 'yyyyMMdd')
      , FechaFin: dateFormat(dataRowEditNew.FechaFin, 'yyyyMMdd')
      //--
      , FileBase64: isNotEmpty(dataRowEditNew.FileBase64) ? dataRowEditNew.FileBase64 : ""
      , NombreArchivo: isNotEmpty(dataRowEditNew.NombreArchivo) ? dataRowEditNew.NombreArchivo : ""
      , FechaArchivo: isNotEmpty(dataRowEditNew.NombreArchivo) ? (isNotEmpty(dataRowEditNew.FechaArchivo) ? dataRowEditNew.FechaArchivo : "") : ""
      , ClaseArchivo: isNotEmpty(dataRowEditNew.IdJustificacion) ? dataRowEditNew.IdJustificacion : ""
      , PathFile: ""
      // --
      , ListaPersona: personas
      , IdSecuencial: 0
      , IdUsuario: usuario.username
      // -- 
      , IdDia: 0
      , Fecha: dateFormat(dataRowEditNew.Fecha, 'yyyyMMdd')
      , HoraInicio: ""
      , HoraFin: ""
      , DiaCompleto: 'S'
      , Activo: 'S'
    };
    await actualizar(params).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      listarJustificacionesMasivas();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function obtenerJustificacionMasiva(dataRow) {
    setLoading(true);
    const { IdCliente, IdCompania, IdProceso } = dataRow;
    await obtener({
      IdCliente: IdCliente,
      IdCompania: IdCompania,
      IdProceso: IdProceso,
    }).then(data => {
      setDataRowEditNew({ ...data, esNuevoRegistro: false });

    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }


  /*  EVENTOS GRILLAS  */
  async function eliminarRegistro(data, confirm) {
    setSelectedDelete(data);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdCliente, IdCompania, IdProceso } = selectedDelete;
      await eliminar({ IdCliente: IdCliente, IdCompania: IdCompania, IdProceso: IdProceso }).then(response => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
      listarJustificacionesMasivas();
    }
  }

  const editarRegistro = async (dataRow) => {

    changeTabIndex(1);
    const { IdCompania } = dataRow;
    setModoEdicion(true);
    setProcesados(false);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    obtenerJustificacionMasiva(dataRow);
    listarPersonas_Justificadas(dataRow);

    let tmp_justificaciones = await listarJustificaciones({
      IdCliente: IdCliente,
      IdCompania: IdCompania
    });

    setJustificaciones(tmp_justificaciones);
  };


  const nuevoRegistro = async () => {
    changeTabIndex(1);
    setDataRowEditNew({ esNuevoRegistro: true });
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
    setJustificaciones([]);
    setPersonasValidadas([]);
    setProcesados(false);

  };


  const cancelarEdicion = () => {
    changeTabIndex(0);
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };

  const seleccionarRegistro = dataRow => {
    const { RowIndex, IdProceso } = dataRow;
    setSelected(dataRow);
    setFocusedRowKey(RowIndex);
    setVarIdProceso(IdProceso);
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


  const nuevaAsginacionConAsistente = async () => {
    changeTabIndex(1);
    setNuevaAsignacionImportar(false);
    const { FechaFin } = getStartAndEndOfMonthByDay();
    setDataRowEditNew({ FechaInicio: new Date(), FechaFin, Indefinido: 'N', esNuevoRegistro: true });
    setModoEdicion(true);
    setDataPersonasTemporal([]);
  }

  const nuevaAsginacionImportar = async () => {
    console.log("**nuevaAsginacionImportar**");
    changeTabIndex(1);
    setNuevaAsignacionImportar(true);
    const { FechaFin } = getStartAndEndOfMonthByDay();
    console.log("FechaFin>>", FechaFin);
    setDataRowEditNew({ FechaInicio: new Date(), FechaFin, Indefinido: 'N', esNuevoRegistro: true });
    setModoEdicion(true);
    setDataPersonasTemporal([]);
  }

  // :::::::::::::::::::::::::::: Configuracions principales :::::::::::::::::::::::::::::::::::::::::::::

  async function obtenerConfiguracion() {
    // let param = {
    //   IdCliente: IdCliente,
    //   IdPerfil: IdPerfil,
    //   IdModulo: dataMenu.info.IdModulo,
    //   IdAplicacion: dataMenu.info.IdAplicacion,
    //   IdMenu: dataMenu.info.IdMenu
    // };

    // //Obtener Ruta  del servidor para subir archivos
    // await serviceRepositorio.obtenerMenu(param).then(datosMenu => {
    //   const { Repositorio } = datosMenu;
    //   setPathFile(Repositorio);
    // });

  }


  const tabsDisabled = () => {
    return isNotEmpty(varIdProceso) ? false : true;
  }

  const changeTabIndex = (index) => {
    handleChange(null, index);
  }

  async function eliminarListRowTab(rowData, confirm) {

    let currentTab = tabIndex;
    switch (currentTab) {
      case 0:
        eliminarRegistro(rowData, confirm)
        break;
      case 1:
        eliminarPersonaJustificacion(rowData, confirm);
        break;
      default:
        return;
    }

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
    listarJustificacionesMasivas();
    obtenerConfiguracion();
  }, []);

  const tabContent_JustificacionMasivaListPage = () => {
    return <>
      <JustificacionMasivaListPage
        justificacionMasivoData={justificacionMasivoData}//listarTabs
        dataRowEditNew={dataRowEditNew}
        varIdCompania={varIdCompania}
        companiaData={companiaData}

        nuevaAsginacionConAsistente={nuevaAsginacionConAsistente}
        nuevaAsignacionImportar={nuevaAsginacionImportar}

        editarRegistro={editarRegistro}
        eliminarRegistro={eliminarRegistro}
        nuevoRegistro={nuevoRegistro}
        seleccionarRegistro={seleccionarRegistro}
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
    console.log("**tabContent_JustificacionMasivaEditPage :> modoEdicion",modoEdicion);
    return <>
      {modoEdicion ? (
        <>
          <JustificacionMasivoProcesarPage
            titulo={titulo}
            modoEdicion={modoEdicion}
            dataRowEditNew={dataRowEditNew}
            setDataRowEditNew={setDataRowEditNew}
            // validarPersona={validarPersona} //---->validarDatosPersona
            varIdCompania={varIdCompania}
            companiaData={companiaData}
            companyName={companyName}
            nuevaAsignacionImportar={nuevaAsignacionImportar}

            procesarPersonas={procesarPersonas}
            cancelarEdicion={cancelarEdicion}
            dataPersonasTemporal={dataPersonasTemporal}
            setDataPersonasTemporal={setDataPersonasTemporal}
            // setDisabledFiltrosFrm={setDisabledFiltrosFrm}
            // disabledFiltrosFrm={disabledFiltrosFrm}
            // disabledPeopleButton={disabledPeopleButton}
            // setDisabledPeopleButton={setDisabledPeopleButton}

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
        // <HorarioMasivoPersonasPage
        //   cancelarEdicion={cancelarEdicion}
        //   getInfo={getInfo}
        //   historialData={historialData}
        // />
        <JustificacionMasivaEditPage
          titulo={titulo}
          dataRowEditNew={dataRowEditNew}
          setDataRowEditNew={setDataRowEditNew}
          validarDatosPersona={validarDatosPersona}
          personasValidadas={personasValidadas}
          setPersonasValidadas={setPersonasValidadas}
          procesarPersonas={procesarPersonas}
          actualizarJustificacionMasiva={actualizarJustificacionMasiva}
          eliminarRegistroFromEditPage={eliminarPersonaJustificacion}
          procesados={procesados}
          setProcesados={setProcesados}
          cancelarEdicion={cancelarEdicion}
          setJustificaciones={setJustificaciones}
          justificaciones={justificaciones}
          justificacionMasivaPersonas={justificacionMasivaPersonas}
          idAplicacion={dataMenu.info.IdAplicacion}
          idModulo={dataMenu.info.IdModulo}
          idMenu={dataMenu.info.IdMenu}
        />


      )}

    </>


    // return <>

    // </>

  }

  return (
    <>
      <TabNavContainer
        title={intl.formatMessage({ id: "ASSISTANCE.MAIN" })}
        submenu={intl.formatMessage({ id: "CONFIG.MENU.ASISTENCIA.GESTIÓN_DE_JUSTIFICACIO" })}
        subtitle={intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })}
        nombrebarra={intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })}
        tabIndex={tabIndex}
        handleChange={handleChange}
        value={value}
        componentTabsHeaders={[
          {
            label: intl.formatMessage({ id: "ACTION.LIST" }),
            icon: <FormatListNumberedIcon fontSize="large" />,
          },
          {
            label: intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` }),
            icon: <LocalMallOutlinedIcon fontSize="large" />,
            onClick: () => { obtenerJustificacionMasiva(selected) },
            disabled: !tabsDisabled() && accessButton.Tabs[1] ? false : true
            // disabled: false
          },
        ]}
        componentTabsBody={[
          tabContent_JustificacionMasivaListPage(),
          tabContent_JustificacionMasivaEditPage(),
        ]}
      />

      <Confirm
        message={intl.formatMessage({ id: "ALERT.REMOVE" })}
        isVisible={isVisible}
        setIsVisible={setIsVisible}
        setInstance={setInstance}
        onConfirm={() => eliminarListRowTab(selectedDelete, true)}
        title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
        confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
        cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
      />

    </>
  );
};

export default injectIntl(WithLoandingPanel(JustificacionMasivaIndexPage));
