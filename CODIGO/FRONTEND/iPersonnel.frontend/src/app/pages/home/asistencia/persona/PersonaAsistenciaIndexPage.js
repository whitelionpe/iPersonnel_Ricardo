import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { handleErrorMessages, handleInfoMessages } from "../../../../store/ducks/notify-messages";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
// import Confirm from "../../../../partials/components/Confirm";
import { getButtonPermissions, defaultPermissions, setDisabledTabs } from '../../../../../_metronic/utils/securityUtils'
import { useStylesTab } from "../../../../store/config/Styles";
import { useSelector } from "react-redux";
import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";
import { obtener } from "../../../../api/asistencia/persona.api";
import { servicePersona } from "../../../../api/administracion/persona.api"; 
import { obtener as obtenerFoto } from "../../../../api/administracion/personaFoto.api";
import { obtener_medidas as obtenerSistemaConfiguracionMedidas } from "../../../../api/sistema/configuracion.api";

import PersonaAsistenciaListPage from "./PersonaAsistenciaListPage";
import PersonaEditTabPage from "../../administracion/persona/PersonaEditTabPage";
import PersonaCondicionEspecialIndexPage from "./condicionEspecial/PersonaCondicionEspecialIndexPage";
import PersonaGrupoIndexPage from "./grupo/PersonaGrupoIndexPage";
import PlanillaIndexPage from "./planilla/PlanillaIndexPage";
import PersonaHorarioIndexPage from "./horario/PersonaHorarioIndexPage";
import PersonaJustificacionIndexPage from "./justificacion/PersonaJustificacionIndexPage";
import PersonaMarcacionIndexPage from "./marcacion/PersonaMarcacionIndexPage";
import PersonaBolsaHorasIndexPage from "./bolsaHoras/PersonaBolsaHorasIndexPage";
import AvatarFoto from "../../../../partials/content/avatarFoto";
import { isNotEmpty, TYPE_SISTEMA_ENTIDAD } from "../../../../../_metronic";
import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import FeaturedPlayListIcon from '@material-ui/icons/FeaturedPlayList';
import FormatIndentIncrease from '@material-ui/icons/FormatIndentIncrease';
import GroupWorkSharpIcon from '@material-ui/icons/GroupWorkSharp';
import AccessTime from '@material-ui/icons/AccessTime';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import Timer from '@material-ui/icons/Timer';
import TouchAppIcon from "@material-ui/icons/TouchApp";
import BusinessCenterOutlinedIcon from '@material-ui/icons/BusinessCenterOutlined';
import AccountCircleOutlinedIcon from '@material-ui/icons/AccountCircleOutlined';
import EventAvailableRoundedIcon from  '@material-ui/icons/EventAvailableRounded'  ;
import Security from  '@material-ui/icons/Security'  ; 
import DescriptionIcon from '@material-ui/icons/Description';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
//import PersonaPosicionIndexPage from "../../administracion/persona/posicion/PersonaPosicionIndexPage";
import PersonaContratoIndexPage from "../../administracion/persona/contrato/PersonaContratoIndexPage";
import TabNavContainer from "../../../../partials/components/Tabs/TabNavContainer";
import { serviceCompania } from "../../../../api/administracion/compania.api";
import PersonaFotoEditPage from "../../administracion/persona/PersonaFotoEditPage";
import PersonaResultadoIndexPage from "./resultado/PersonaResultadoIndexPage";
import PersonaGuardiaIndexPage from "./guardia/PersonaGuardiaIndexPage";

export const initialFilter = {
  Activo: 'S',
  //IdCliente: '',
  //IdPersona: '',
  //IdPerfil: '',
  //IdDivisionPerfil: '',
  Condicion: 'TRABAJADOR',
  ControlarAsistencia: 'S',
  MostrarPersonas: 1,
};

const PersonaAsistenciaIndexPage = (props) => {
  const perfil = useSelector(state => state.perfil.perfilActual);
  //const { IdCliente, IdPerfil } = useSelector(state => state.perfil.perfilActual);
  //const IdDivisionPerfil = useSelector(state => state.perfil.perfilActual.IdDivision);

  const { intl, setLoading, dataMenu } = props;
  const numeroTabs = 12; //Definicion numero de tabs que contiene el formulario.
  const [varIdPersona, setVarIdPersona] = useState("");
  const [varIdCompania, setVarIdCompania] = useState("");
  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
  const [focusedRowKey, setFocusedRowKey] = useState();
  const [selected, setSelected] = useState({});
  const classes = useStylesTab();
  const [tabIndex, setTabIndex] = useState(0);
  const [dataCombos, setDataCombos] = useState([]);
  //++++++++Variable (totalRowIndex) para controlar bloqueo de tabs cuando se cambia de búsqueda de un registro en la grilla.++++++++++++++
  const [totalRowIndex, setTotalRowIndex] = useState(0);

  const [companiaData, setCompaniaData] = useState([]);

  const handleChange = (event, newValue) => {
    //Estado cambio de tabs
    setTabIndex(newValue);
  };
  const [fotoPerfil, setFotoPerfil] = useState("");
  const [fechaFinContrato, setFechaFinContrato] = useState();

  //FILTRO
  const [isFirstDataLoad, setIsFirstDataLoad] = useState(true);
  // const [filterData, setFilterData] = useState({
  //   ...initialFilter
  // });
  const [refreshData, setRefreshData] = useState(false);
  const ds = new DataSource({ store: new ArrayStore({ data: [], key: 'RowIndex' }), reshapeOnPush: false });
  const [dataSource] = useState(ds);

  const refresh = () => dataSource.refresh();
  const resetLoadOptions = () => dataSource.resetLoadOptions();


  const [dataRowEditNewTabs, setDataRowEditNewTabs] = useState({}); 
  const [tituloTabs, setTituloTabs] = useState(
    intl.formatMessage({ id: "ACTION.LIST" })
  ); 
  const [alturaSugerido, setAlturaSugerido] = useState();
  const [anchoSugerido, setAnchoSugerido] = useState();
  const [alturaSugeridoRadio, setAlturaSugeridoRadio] = useState();
  const [anchoSugeridoRadio, setAnchoSugeridoRadio] = useState();

  //------------------------------------------------------------
  const [accessButton, setAccessButton] = useState(defaultPermissions);
  const loadControlsPermission = () => {
    // const numeroTabs = 8;
    let buttonsPermissions = getButtonPermissions(dataMenu.objetos);
    let newTabs = setDisabledTabs(dataMenu.objetos, numeroTabs);
    // console.log("*accessButton:> ",accessButton);
    // console.log("*buttonsPermissions:> ",buttonsPermissions);
    // console.log("*newTabs:> ",newTabs);
    // console.log("*dataMenu.objetos:> ",dataMenu.objetos);
    setAccessButton({ ...accessButton, ...buttonsPermissions, Tabs: newTabs });
  }

  const titleHeaderToolbar = () => {
    let tabsTitles = [
      "",
      "",
      "ADMINISTRATION.PERSON.PHOTO",
      "ADMINISTRATION.CONTRACT.CONTRACT",
      "ASSISTANCE.PAYROLL",
      "ASSISTANCE.SPECIAL.CONDITIONS",
      "ACCESS.PERSON.GRUPO",
      "ACCESS.SCHEDULE.SCHEDULE",
      "ADMINISTRATION.PERSON.REGIME.GUARD",
      "ACCESS.PERSON.MARK.TAB",
      "CONFIG.MENU.ASISTENCIA.INCIDENCIAS",
      "ASISTENCIA.PERSONA.BOLSAHORAS.TITULO",
      "ACCESS.PERSON.MARK.RESULT",
    ];

    let sufix = tabsTitles[tabIndex] !== "" ? (" - " + `${intl.formatMessage({ id: tabsTitles[tabIndex] })}`) : "";
    return `${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} ` + " " + sufix;
  }

  const tabsDisabled = () => {
    return isNotEmpty(varIdPersona) ? false : true;
  }

  //:::::::::::::::::::::::::::::::::::::::::::::-funciones-Persona-:::::::::::::::::::::::::::::::::

  async function cargarCombos() {
    setLoading(true);
    let array = [];
    setDataCombos([]);
    await servicePersona.listarCombosPersona({ IdPais: perfil.IdPais }).then(data => {
      array.push(data[0].filter(k => k.IdEntidad === TYPE_SISTEMA_ENTIDAD.PERSONAS)); // Combo Tipo Documentos 
      array.push(data[1]); // Combo Tipo de Sangre
      array.push(data[2]); // Combo Estado Civil 
      array.push(data[3]); // Combo Licencia Conducir
      setDataCombos(array);
    }).finally(() => {
      setLoading(false);
    });
  } 

  async function obtenerPersona(filtro) {
    setLoading(true);
    let persona;
    const { IdPersona, IdCliente } = filtro;
    persona = await obtener({ IdPersona, IdCliente }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    });
    setDataRowEditNew({ ...persona, esNuevoRegistro: false });
    setLoading(false);
  }
 
  const cancelarEdicion = () => {
    changeTabIndex(0);
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
    setDataRowEditNewTabs({});
  };

  const seleccionarRegistro = async (dataRow) => {
    const { IdPersona, IdCompania, RowIndex, FechaFinContrato } = dataRow;
    setSelected(dataRow);
    setFocusedRowKey(RowIndex);
    setVarIdPersona(IdPersona);
    setVarIdCompania(IdCompania);
    obtenerFotoPerfilLocal(dataRow);
    setFechaFinContrato(FechaFinContrato);
  }

  const verRegistroDblClick = async (dataRow) => {
    changeTabIndex(1);
    setModoEdicion(false);
    obtenerPersona(dataRow);
  };


  async function listarCompanias() {
    setLoading(true);
    let data = await serviceCompania.obtenerTodosConfiguracion({
      IdCliente: perfil.IdCliente,
      IdModulo: dataMenu.info.IdModulo,
      IdAplicacion: dataMenu.info.IdAplicacion,
      IdConfiguracion: "ID_COMPANIA"
    }
    ).catch(err => { handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err) }
    ).finally(() => { setLoading(false); });
 
    if (data.length > 0) {
      setCompaniaData(data);
      setVarIdCompania(data[0].IdCompania); 
    } else {
      handleInfoMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), intl.formatMessage({ id: "ASISTENCIA.COMPANY.CONFIGURE.MSG" }));
    }

  }

  useEffect(() => {
    cargarCombos();
    loadControlsPermission();
    listarCompanias();

  }, []);

  //:::::::::::::::::::::::::::::::::::::::::::::-funciones-persona-foto:::::::::::::::::::::::::::::::::
  function obtenerFotoPerfilLocal(dataRow) {
    const { FotoPC } = dataRow;
    setFotoPerfil(FotoPC)
  }
 
  async function validateConfigurationImageLength(IdCliente) {
    await obtenerSistemaConfiguracionMedidas({ IdCliente: IdCliente, IdImageSize: "MAXIMAGESIZECLIENTE", idImageRatio: "CLIENTIMAGERATIO" })
      .then(result => {
        if (result === "") {
          setAlturaSugerido(0)
          setAnchoSugerido(0)
          setAlturaSugeridoRadio(0)
          setAnchoSugeridoRadio(0)

        } else {
          setAlturaSugerido(result.AltoMedida)
          setAnchoSugerido(result.AnchoMedida)
          setAlturaSugeridoRadio(result.AltoMedidaRadio)
          setAnchoSugeridoRadio(result.AnchoMedidaRadio)
        }
      }).finally();
  }

  async function obtenerPersonaFoto(idPersona, esPerfil) {
    setLoading(true);
    const { IdPersona, IdCliente } = selected; 
    await validateConfigurationImageLength(IdCliente);
    await obtenerFoto({ IdPersona, IdCliente })
      .then(personaFoto => {
        if (isNotEmpty(personaFoto)) {
          setFotoPerfil(personaFoto.FotoPC); //if (esPerfil)  
          setDataRowEditNewTabs({ ...personaFoto, esNuevoRegistro: false });
        } else {
          setFotoPerfil("");
          setDataRowEditNewTabs({
            ...selected,
            esNuevoRegistro: true,
            FotoPC: null,
            FotoMovil: null,
            FotoExtra: null
          });
        }
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false) });
  }

  //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  //Datos Principales
  const getInfo = () => {

    const { IdPersona, NombreCompleto, Condicion, Compania } = selected;
    return [
      { text: [intl.formatMessage({ id: "COMMON.CODE" })], value: IdPersona, colSpan: 2 },
      { text: [intl.formatMessage({ id: "ADMINISTRATION.PERSON.NAME" })], value: NombreCompleto, colSpan: 3 },
    ];
  }

  const getInfoJustificacion = () => {

    const { NombreCompleto, Compania } = selected;
    return [
      { text: [intl.formatMessage({ id: "ADMINISTRATION.PERSON" })], value: NombreCompleto, colSpan: 3 },
      { text: [intl.formatMessage({ id: "ASSISTANCE.SPECIAL.CONDITIONS.COMAPNY" })], value: Compania, colSpan: 3 }
    ];
  }

  const changeTabIndex = (index) => {
    handleChange(null, index);
  }

  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::-Configuración - Tabs::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  const tabContent_PersonaListPage = () => {
    return <>
      <PersonaAsistenciaListPage
        titulo={titulo}
        uniqueId={"AsistenciaPersonaListPage"}
        showButtons={false}
        seleccionarRegistro={seleccionarRegistro}
        verRegistroDblClick={verRegistroDblClick}
        focusedRowKey={focusedRowKey}
        setFocusedRowKey={setFocusedRowKey}
        isFirstDataLoad={isFirstDataLoad}
        setIsFirstDataLoad={setIsFirstDataLoad}
        dataSource={dataSource}
        refresh={refresh}
        resetLoadOptions={resetLoadOptions}
        refreshData={refreshData}
        setRefreshData={setRefreshData}
        // filterData={filterData}
        // setFilterData={setFilterData}
        setVarIdPersona={setVarIdPersona}
        totalRowIndex={totalRowIndex}
        setTotalRowIndex={setTotalRowIndex}
        dataMenu={dataMenu}
        companiaData={companiaData}
        varIdCompania={varIdCompania}
        setVarIdCompania={setVarIdCompania}
      />
    </>
  }

  const tabContent_PersonaEditPage = () => {
    return <>
      <PersonaEditTabPage
        modoEdicion={modoEdicion}
        titulo={titulo}
        dataRowEditNew={dataRowEditNew}
        idPersona={varIdPersona}
        setDataRowEditNew={setDataRowEditNew}
        cancelarEdicion={cancelarEdicion}
        //req y edit
        settingDataField={dataMenu.datos}
        accessButton={accessButton}
        getInfo={getInfo}
        dataCombos={dataCombos}
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

  }
 
  const tabContent_PersonaFotoEditPage = () => {
    return <>
      <PersonaFotoEditPage 
        setDataRowEditNew={setDataRowEditNewTabs}
        dataRowEditNew={dataRowEditNewTabs}
        cancelarEdicion={cancelarEdicion}
        titulo={tituloTabs}
        size={classes.avatarLarge}
        getInfo={getInfo}

        editable={false}
        medidaSugeridas={{
          width: anchoSugerido, height: alturaSugerido,
          width_radio: anchoSugeridoRadio, height_radio: alturaSugeridoRadio
        }}  
      /> 
    </>
  }

  const tabContent_PersonaContrato = () => {
    return <>
      <PersonaContratoIndexPage
        varIdPersona={varIdPersona}
        selectedIndex={selected}
        cancelarEdicion={cancelarEdicion}
        getInfo={getInfo}
        settingDataField={dataMenu.datos}
        accessButton={accessButton}
        showButtons={false}
        ocultarEdit={true}
      />
    </>

  }

  const tabContent_PersonaPlanillaListPage = () => {
    return <>
      <PlanillaIndexPage
        varIdPersona={varIdPersona}
        selectedIndex={selected}
        getInfo={getInfo}
        accessButton={accessButton}
        settingDataField={dataMenu.datos}
        cancelarEdicion={cancelarEdicion}
      />
    </>
  }

  const tabContent_PersonaCondicionEspecialListPage = () => {
    return <>
      <PersonaCondicionEspecialIndexPage
        varIdPersona={varIdPersona}
        selectedIndex={selected}
        getInfo={getInfo}
        accessButton={accessButton}
        settingDataField={dataMenu.datos}
        cancelarEdicion={cancelarEdicion}
      />
    </>
  }

  const tabContent_PersonaGrupoLisPage = () => {
    return <>
      <>
        <PersonaGrupoIndexPage
          varIdPersona={varIdPersona}
          selectedIndex={selected}
          getInfo={getInfo}
          accessButton={accessButton}
          settingDataField={dataMenu.datos}
          cancelarEdicion={cancelarEdicion}
          varIdCompania={varIdCompania}
          dataMenu={dataMenu}
        />
      </>

    </>
  }

  const tabContent_PersonaHorarioListPage = () => {
    return <>
      <PersonaHorarioIndexPage
        varIdPersona={varIdPersona}
        selectedIndex={selected}
        getInfo={getInfo}
        accessButton={accessButton}
        settingDataField={dataMenu.datos}
        varIdCompania={varIdCompania}
        cancelarEdicion={cancelarEdicion}
      />
    </>
  }

  const tabContent_PersonaJustificacionListPage = () => {
    return <>
      <PersonaJustificacionIndexPage
        varIdPersona={varIdPersona}
        selectedIndex={selected}
        getInfo={getInfo}
        accessButton={accessButton}
        settingDataField={dataMenu.datos}
        cancelarEdicion={cancelarEdicion}
        showButtons={true}
        getInfoJustificacion={getInfoJustificacion}
        varIdCompania={varIdCompania}
        idAplicacion={dataMenu.info.IdAplicacion}
        idModulo={dataMenu.info.IdModulo}
        idMenu={dataMenu.info.IdMenu}
      />
    </>
  }
 
  const tabContent_PersonaBolsaHorasListPage = () => {
    return <>
      <PersonaBolsaHorasIndexPage
        varIdPersona={varIdPersona}
        selectedIndex={selected}
        getInfo={getInfo}
        accessButton={accessButton}
        settingDataField={dataMenu.datos}
        cancelarEdicion={cancelarEdicion}
        showButtons={true}
        getInfoJustificacion={getInfoJustificacion}
        varIdCompania={varIdCompania}
        idAplicacion={dataMenu.info.IdAplicacion}
        idModulo={dataMenu.info.IdModulo}
        idMenu={dataMenu.info.IdMenu}
        dataMenu={dataMenu}
      />
    </>
  }
 
  const tabContent_MarcacionListPage = () => {
    return <>
      <PersonaMarcacionIndexPage
        varIdPersona={varIdPersona}
        IdModulo={dataMenu.info.IdModulo}
        selectedIndex={selected}
        getInfo={getInfo}
        accessButton={accessButton}
        settingDataField={dataMenu.datos}
        cancelarEdicion={cancelarEdicion}
        showButtons={true}
      />
    </>
  }

  const tabContent_PersonaResultado = () => {
    return <>
     
     <PersonaResultadoIndexPage
        varIdPersona={varIdPersona}
        IdModulo={dataMenu.info.IdModulo}
        selectedIndex={selected}
        getInfo={getInfo}
        accessButton={accessButton}
        settingDataField={dataMenu.datos}
        cancelarEdicion={cancelarEdicion}
        showButtons={true}
      />
     
    </>
  }


  const tabContent_PersonaGuardia = () => {
    return <>
     
     <PersonaGuardiaIndexPage
        varIdPersona={varIdPersona}
        IdModulo={dataMenu.info.IdModulo}
        selectedIndex={selected}
        getInfo={getInfo}
        accessButton={accessButton}
        settingDataField={dataMenu.datos}
        cancelarEdicion={cancelarEdicion}
        showButtons={true}
      />
     
    </>
  }
  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  return <>
    <TabNavContainer
      title={intl.formatMessage({ id: "ASSISTANCE.MAIN" })}
      submenu={intl.formatMessage({ id: "CONFIG.MENU.ASISTENCIA.GESTIÓN_DE_INCIDENCIAS" })}
      subtitle={`${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} `}
      nombrebarra={titleHeaderToolbar()}
      tabIndex={tabIndex}
      handleChange={handleChange}
      componentTabsHeaders={[
        {
          label: intl.formatMessage({ id: "ACTION.LIST" }),
          icon: <FormatListNumberedIcon fontSize="large" />,
          disabled: false,
        },
        {
          label: intl.formatMessage({ id: "ADMINISTRATION.PERSON" }),
          icon: <AvatarFoto size={classes.avatarSmall} id={"FotoPerfil"} imagenB64={fotoPerfil} />,
          className: classes.avatarContent,
          onClick: () => { obtenerPersona(selected) },
          disabled: tabsDisabled(),
        },
        {
          label: intl.formatMessage({ id: "ADMINISTRATION.PERSON.PHOTO" }),
          icon: <AccountCircleOutlinedIcon fontSize="large" />,
          onClick: () => { obtenerPersonaFoto(varIdPersona, false) },
          disabled: !tabsDisabled() && accessButton.Tabs[2] ? false : true
        },
        {
          label: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CONTRACT" }),
          icon: < DescriptionIcon fontSize="large" />,
          disabled: !tabsDisabled() && accessButton.Tabs[2] ? false : true
        },
        {
          label: intl.formatMessage({ id: "ASSISTANCE.PAYROLL" }),
          icon: <FeaturedPlayListIcon fontSize="large" />,
          disabled: !tabsDisabled() && accessButton.Tabs[3] ? false : true
        },
        {
          label: intl.formatMessage({ id: "ASSISTANCE.SPECIAL.CONDITIONS" }),
          icon: <FormatIndentIncrease fontSize="large" />,
          disabled: !tabsDisabled() && accessButton.Tabs[4] ? false : true
        },
        {
          label: intl.formatMessage({ id: "ACCESS.PERSON.GRUPO" }),
          icon: <GroupWorkSharpIcon fontSize="large" />,
          disabled: !tabsDisabled() && accessButton.Tabs[5] ? false : true
        },
        {
          label: intl.formatMessage({ id: "ACCESS.SCHEDULE.SCHEDULE" }),
          icon: <AccessTime fontSize="large" />,
          disabled: !tabsDisabled() && accessButton.Tabs[6] ? false : true
        },
        {
          label: intl.formatMessage({ id: "ADMINISTRATION.PERSON.REGIME.GUARD" }),
          icon: <Security fontSize="large" />,
          disabled: !tabsDisabled() && accessButton.Tabs[7] ? false : true
        } ,
        {
          label: intl.formatMessage({ id: "ACCESS.PERSON.MARK.TAB" }),
          icon: <TouchAppIcon fontSize="large" />,
          disabled: !tabsDisabled() && accessButton.Tabs[8] ? false : true
        },
        {
          label: intl.formatMessage({ id: "CONFIG.MENU.ASISTENCIA.INCIDENCIAS" }),
          icon: <InsertDriveFileIcon fontSize="large" />,
          disabled: !tabsDisabled() && accessButton.Tabs[7] ? false : true
        },
        {
          label: intl.formatMessage({ id: "ASISTENCIA.PERSONA.BOLSAHORAS.TITULO" }),
          icon: <Timer fontSize="large" />,
          disabled: !tabsDisabled() && accessButton.Tabs[7] ? false : true
        },
        {
          label: intl.formatMessage({ id: "ACCESS.PERSON.MARK.RESULT" }),
          icon: <EventAvailableRoundedIcon fontSize="large" />,
          disabled: !tabsDisabled() && accessButton.Tabs[7] ? false : true
        } 

      ]}
      className={classes.tabContent}
      componentTabsBody={
        [ 
          tabContent_PersonaListPage(),
          tabContent_PersonaEditPage(),
          tabContent_PersonaFotoEditPage(),
          tabContent_PersonaContrato(),
          tabContent_PersonaPlanillaListPage(),
          tabContent_PersonaCondicionEspecialListPage(),
          tabContent_PersonaGrupoLisPage(),
          tabContent_PersonaHorarioListPage(),
          tabContent_PersonaGuardia(),
          tabContent_MarcacionListPage(),
          tabContent_PersonaJustificacionListPage(),
          tabContent_PersonaBolsaHorasListPage(),
          tabContent_PersonaResultado()
        ]
      }

    />

  </>


};


export default injectIntl(WithLoandingPanel(PersonaAsistenciaIndexPage));
