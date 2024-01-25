import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import FormatListNumberedIcon from "@material-ui/icons/FormatListNumbered";
import DescriptionIcon from '@material-ui/icons/Description';
import PlaylistAddCheckOutlinedIcon from "@material-ui/icons/PlaylistAddCheckOutlined";
import AccountCircleOutlinedIcon from "@material-ui/icons/AccountCircleOutlined";
import PlaylistAddIcon from '@material-ui/icons/PlaylistAdd';

import PeopleAltOutlinedIcon from "@material-ui/icons/PeopleAltOutlined";
import TouchAppIcon from "@material-ui/icons/TouchApp";
import { useSelector } from "react-redux";
import PanTool from "@material-ui/icons/PanTool";
import SupervisedUserCircle from "@material-ui/icons/SupervisedUserCircle";
import LowPriority from "@material-ui/icons/LowPriority";
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';

import { handleErrorMessages } from "../../../../store/ducks/notify-messages";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import { getButtonPermissions, defaultPermissions, setDisabledTabs } from '../../../../../_metronic/utils/securityUtils'
import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";

import PersonaAccesoListPage from "./PersonaAccesoListPage";
import PersonaEditTabPage from "../../administracion/persona/PersonaEditTabPage";
import PersonaContratoIndexPage from "../../administracion/persona/contrato/PersonaContratoIndexPage";
import PersonaRequisitoIndexPage from "./requisito/PersonaRequisitoIndexPage";
import PersonaRequisitoOpcionalIndexPage from "./requisitoOpcional/PersonaRequisitoOpcionalIndexPage";
import PersonaFotoEditPage from "../../administracion/persona/PersonaFotoEditPage";
import PersonaExoneracionIndexPage from "./exoneracion/PersonaExoneracionIndexPage";
import PersonaPerfilIndexPage from "./perfil/PersonaPerfilIndexPage";
import PersonaGrupoIndexPage from "./grupo/PersonaGrupoIndexPage";
import PersonaRestriccionIndexPage from "./restriccion/PersonaRestriccionIndexPage";
import AvatarFoto from "../../../../partials/content/avatarFoto";
import { isNotEmpty, TYPE_SISTEMA_ENTIDAD } from "../../../../../_metronic";
import TabNavContainer from "../../../../partials/components/Tabs/TabNavContainer";
import {
  useStylesEncabezado,
  useStylesTab,
} from "../../../../store/config/Styles";
import PersonaMarcacionIndexPage from "./marcacion/PersonaMarcacionIndexPage";

import { servicePersona } from "../../../../api/administracion/persona.api";
import { obtener as obtenerFoto } from "../../../../api/administracion/personaFoto.api";
import { obtener_medidas as obtenerSistemaConfiguracionMedidas } from "../../../../api/sistema/configuracion.api";

export const initialFilter = {
  IdCliente: '',
  Activo: 'S',
  Condicion: 'TRABAJADOR'
};

const PersonaAccesoIndexPage = (props) => {
  const perfil = useSelector((state) => state.perfil.perfilActual);
  const { intl, setLoading, dataMenu } = props;
  const [focusedRowKey, setFocusedRowKey] = useState();
  const [varIdPersona, setVarIdPersona] = useState("");
  const [varDocumento, setVarDocumento] = useState("");
  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
  const [dataRowEditNewTabs, setDataRowEditNewTabs] = useState({});
  const [tituloTabs, setTituloTabs] = useState(
    intl.formatMessage({ id: "ACTION.LIST" })
  );

  const classes = useStylesTab();
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    setTabIndex(newValue);
  };
  const [fotoPerfil, setFotoPerfil] = useState("");

  //Datos principales
  const [selected, setSelected] = useState({});
  const [tabIndex, setTabIndex] = useState(0);

  const [alturaSugerido, setAlturaSugerido] = useState();
  const [anchoSugerido, setAnchoSugerido] = useState();
  const [alturaSugeridoRadio, setAlturaSugeridoRadio] = useState();
  const [anchoSugeridoRadio, setAnchoSugeridoRadio] = useState();

  //FILTRO
  const [isFirstDataLoad, setIsFirstDataLoad] = useState(true);
  const [refreshData, setRefreshData] = useState(false);
  const ds = new DataSource({ store: new ArrayStore({ data: [], key: 'RowIndex' }), reshapeOnPush: false });
  const [dataSource] = useState(ds);

  const refresh = () => dataSource.refresh();
  const resetLoadOptions = () => dataSource.resetLoadOptions();

  const [maxFechaFin, setMaxFechaFin] = useState("N");
  const [dataCombos, setDataCombos] = useState([]);
  //++++++++Variable (totalRowIndex) para controlar bloqueo de tabs cuando se cambia de búsqueda de un registro en la grilla.++++++++++++++
  const [totalRowIndex, setTotalRowIndex] = useState(0);
  //FILTRO DE MARCAS
  //:::::::::::::::::::::::::::::::::::::::::::::-funciones-:::::::::::::::::::::::::::::::::

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


  async function obtenerPersona(idPersona, validateSensitiveInformation = false) {
    setLoading(true);
    let persona;
    const { IdPersona, IdCliente } = selected;
    if (isNotEmpty(idPersona)) {
      persona = await servicePersona.obtener({ IdPersona, IdCliente }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      });

      if (validateSensitiveInformation) {
        clearSensitiveInformation(dataMenu.protecion_datos, persona);
      }

      setDataRowEditNew({ ...persona, esNuevoRegistro: false });
    }

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

    const { IdPersona, RowIndex, Documento } = dataRow;
    setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
    setSelected(dataRow);

    if (IdPersona !== varIdPersona) {
      setVarIdPersona(IdPersona);
      setVarDocumento(Documento);
      obtenerFotoPerfilLocal(dataRow);
      setFocusedRowKey(RowIndex);
    }
  }

  const verRegistroDblClick = async (dataRow) => {
    changeTabIndex(1);
    await obtenerPersona(dataRow.IdPersona, true);
  };

  function clearSensitiveInformation(input, target) {
    input.forEach((element) => {
      let hasProperty = target.hasOwnProperty(element.Campo);
      if (hasProperty) {
        target[element.Campo] = " ";
      }
    })
  }

  //Configuracion Tabs
  const [accessButton, setAccessButton] = useState(defaultPermissions);

  const loadControlsPermission = () => {
    const numeroTabs = 15; //Nùmero de tab del formulario.
    let buttonsPermissions = getButtonPermissions(dataMenu.objetos);
    let newTabs = setDisabledTabs(dataMenu.objetos, numeroTabs);
    setAccessButton({ ...accessButton, ...buttonsPermissions, Tabs: newTabs });
  }

  useEffect(() => {
    cargarCombos();
    loadControlsPermission();
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

  async function obtenerPersonaFoto() {
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
          setDataRowEditNewTabs({ ...selected, esNuevoRegistro: true });
        }
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false) });
  }
  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  const changeTabIndex = (index) => {
    handleChange(null, index);
  };

  const getInfo = () => {
    const { Nombre, Apellido } = selected;
    return [
      { text: [intl.formatMessage({ id: "COMMON.CODE" })], value: varIdPersona, colSpan: 2 },
      { text: [intl.formatMessage({ id: "ADMINISTRATION.PERSON.NAME" })], value: Nombre + " " + Apellido, colSpan: 4 }
    ];

  };


  //:::::::::::::::::::::::::::::::::::::::::::::-Configuración de tabs-:::::::::::::::::::::::::::::::::
  const titleHeaderToolbar = () => {
    let tabsTitles = [
      "",
      "",
      "SECURITY.USER.PHOTO",
      "ADMINISTRATION.CONTRACT.CONTRACT",
      "ACCESS.PERSON.MENU.REQUIREMENTS",
      "ACCESS.PERSON.MENU.REQUIREMENTS.OPTION",
      "ACCESS.PERSON.MENU.EXONERATION",
      "ACCESS.PERSON.MENU.PROFILE",
      "ACCESS.PERSON.GRUPO.TAB",
      "ACCESS.PERSON.MENU.RESTRICTION",
      "ACCESS.PERSON.MARK.TAB",
    ];

    let sufix = tabsTitles[tabIndex] !== "" ? (" - " + `${intl.formatMessage({ id: tabsTitles[tabIndex] })}`) : "";

    return `${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} ` + " " + sufix;
  }
  const tabsDisabled = () => {

    return isNotEmpty(varIdPersona) ? false : true;
    //return true;
  }


  const tabContent_PersonaListPage = () => {
    return <PersonaAccesoListPage
      uniqueId={"accesoPersonaList"}
      titulo={titulo}
      seleccionarRegistro={seleccionarRegistro}
      verRegistroDblClick={verRegistroDblClick}
      focusedRowKey={focusedRowKey}
      setFocusedRowKey={setFocusedRowKey}
      showButtons={false}
      //=>..CustomerDataGrid
      isFirstDataLoad={isFirstDataLoad}
      setIsFirstDataLoad={setIsFirstDataLoad}
      dataSource={dataSource}
      refresh={refresh}
      resetLoadOptions={resetLoadOptions}
      refreshData={refreshData}
      setRefreshData={setRefreshData}
      accessButton={accessButton}
      setVarIdPersona={setVarIdPersona}
      totalRowIndex={totalRowIndex}
      setTotalRowIndex={setTotalRowIndex}
    />
  }


  const tabContent_PersonaEditTabPage = () => {
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
          <ControlSwitch
            checked={auditoriaSwitch}
            onChange={(e) => {
              setAuditoriaSwitch(e.target.checked);
            }}
          />
          <b> {intl.formatMessage({ id: "AUDIT.DATA" })} </b>
        </div>
      </div>
      {auditoriaSwitch && (
        <AuditoriaPage dataRowEditNew={dataRowEditNew} />
      )}
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

        medidaSugeridas={{
          width: anchoSugerido, height: alturaSugerido,
          width_radio: anchoSugeridoRadio, height_radio: alturaSugeridoRadio
        }}
      />
      <div className="container_only">
        <div className="float-right">
          <ControlSwitch
            checked={auditoriaSwitch}
            onChange={(e) => {
              setAuditoriaSwitch(e.target.checked);
            }}
          />
          <b> {intl.formatMessage({ id: "AUDIT.DATA" })}</b>
        </div>
      </div>
      {auditoriaSwitch && (
        <AuditoriaPage dataRowEditNew={dataRowEditNewTabs} />
      )}
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

  const tabContent_PersonaRequisitoIndexPage = () => {
    return <>

      <PersonaRequisitoIndexPage
        varIdPersona={varIdPersona}
        documento={varDocumento}
        moduloCompania={selected}
        cancelarEdicion={cancelarEdicion}
        getInfo={getInfo}
        accessButton={accessButton}
        settingDataField={dataMenu.datos}
        idAplicacion={dataMenu.info.IdAplicacion}
        idModulo={dataMenu.info.IdModulo}
        idMenu={dataMenu.info.IdMenu}
      />

    </>
  }

  const tabContent_PersonaRequisitoOpcionalIndexPage = () => {
    return <>

      <PersonaRequisitoOpcionalIndexPage
        varIdPersona={varIdPersona}
        documento={varDocumento}
        moduloCompania={selected}
        cancelarEdicion={cancelarEdicion}
        getInfo={getInfo}
        accessButton={accessButton}
        settingDataField={dataMenu.datos}
        idAplicacion={dataMenu.info.IdAplicacion}
        idModulo={dataMenu.info.IdModulo}
        idMenu={dataMenu.info.IdMenu}
      />

    </>
  }

  const tabContent_PersonaExoneracionIndexPage = () => {
    return <>
      <PersonaExoneracionIndexPage
        varIdPersona={varIdPersona}
        moduloCompania={selected}
        cancelarEdicion={cancelarEdicion}
        getInfo={getInfo}
        accessButton={accessButton}
        settingDataField={dataMenu.datos}
      />
    </>
  }

  const tabContent_PersonaPerfilIndexPage = () => {
    return <>
      <PersonaPerfilIndexPage
        varIdPersona={varIdPersona}
        moduloCompania={selected}
        cancelarEdicion={cancelarEdicion}
        getInfo={getInfo}
        accessButton={accessButton}
        settingDataField={dataMenu.datos}
      />
    </>
  }

  const tabContent_PersonaGrupoIndexPage = () => {
    return <>
      <PersonaGrupoIndexPage
        varIdPersona={varIdPersona}
        cancelarEdicion={cancelarEdicion}
        getInfo={getInfo}
        accessButton={accessButton}
        settingDataField={dataMenu.datos}
        dataMenu={dataMenu}
        selectedIndex={selected}
        maxFechaFinObj={maxFechaFin}
      />
    </>
  }


  const tabContent_PersonaRestriccionIndexPage = () => {
    return <>
      <PersonaRestriccionIndexPage
        varIdPersona={varIdPersona}
        moduloCompania={selected}
        cancelarEdicion={cancelarEdicion}
        getInfo={getInfo}
        accessButton={accessButton}
        settingDataField={dataMenu.datos}
        idAplicacion={dataMenu.info.IdAplicacion}
        idModulo={dataMenu.info.IdModulo}
        idMenu={dataMenu.info.IdMenu}
      />
    </>
  }

  const tabContent_PersonaMarcacionIndexPage = () => {
    return <>
      <PersonaMarcacionIndexPage
        varIdPersona={varIdPersona}
        selectedIndex={selected}
        getInfo={getInfo}
        accessButton={accessButton}
        settingDataField={dataMenu.datos}
        cancelarEdicion={cancelarEdicion}
        showButtons={true}
      />
    </>
  }



  //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  return (
    <>
      <TabNavContainer
        title={intl.formatMessage({ id: "ACCESS.PERSON.MENU" })}
        submenu={intl.formatMessage({ id: "ACCESS.PERSON.SUBMENU" })}
        subtitle={intl.formatMessage({ id: "ACCESS.PERSON.MAINTENANCE" })}
        nombrebarra={titleHeaderToolbar()}
        tabIndex={tabIndex}
        handleChange={handleChange}
        componentTabsHeaders={[
          {
            label: intl.formatMessage({ id: "ACTION.LIST" }),
            icon: <FormatListNumberedIcon fontSize="large" />
          },
          {
            label: intl.formatMessage({ id: "ACCESS.PERSON.MENU.PERSON" }),
            icon: <AvatarFoto size={classes.avatarSmall}
              id={"FotoPerfil"}
              imagenB64={fotoPerfil} />,
            onClick: (e) => { obtenerPersona(selected) },
            className: classes.avatarContent,
            disabled: tabsDisabled()
          },
          {
            label: intl.formatMessage({ id: "SECURITY.USER.PHOTO" }),
            icon: <AccountCircleOutlinedIcon fontSize="large" />,
            onClick: (e) => { obtenerPersonaFoto() },
            disabled: !tabsDisabled() && accessButton.Tabs[2] ? false : true
          },
          {
            label: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CONTRACT" }),
            icon: < DescriptionIcon fontSize="large" />,
            disabled: !tabsDisabled() && accessButton.Tabs[3] ? false : true
          },
          {
            label: intl.formatMessage({ id: "ACCESS.PERSON.MENU.REQUIREMENTS" }),
            icon: <PlaylistAddCheckOutlinedIcon fontSize="large" />,
            disabled: !tabsDisabled() && accessButton.Tabs[4] ? false : true
          },
          {
            label: intl.formatMessage({ id: "ACCESS.PERSON.MENU.REQUIREMENTS.OPTION" }),
            icon: <PlaylistAddIcon fontSize="large" />,
            disabled: !tabsDisabled() && accessButton.Tabs[10] ? false : true
          },
          {
            label: intl.formatMessage({ id: "ACCESS.PERSON.MENU.EXONERATION" }),
            icon: <LowPriority fontSize="large" />,
            disabled: !tabsDisabled() && accessButton.Tabs[5] ? false : true
          },
          {
            label: intl.formatMessage({ id: "ACCESS.PERSON.MENU.PROFILE" }),
            icon: <SupervisedUserCircle fontSize="large" />,
            disabled: !tabsDisabled() && accessButton.Tabs[6] ? false : true
          },
          {
            label: intl.formatMessage({ id: "ACCESS.PERSON.MENU.GROUP" }),
            icon: <PeopleAltOutlinedIcon fontSize="large" />,
            disabled: !tabsDisabled() && accessButton.Tabs[7] ? false : true
          },
          {
            label: intl.formatMessage({ id: "ACCESS.PERSON.MENU.RESTRICTION" }),
            icon: <PanTool fontSize="large" />,
            disabled: !tabsDisabled() && accessButton.Tabs[8] ? false : true
          },
          {
            label: intl.formatMessage({ id: "ACCESS.PERSON.MARK.TAB" }),
            icon: <TouchAppIcon fontSize="large" />,
            disabled: !tabsDisabled() && accessButton.Tabs[9] ? false : true
          }
        ]}
        className={classes.tabContent}
        componentTabsBody={
          [
            tabContent_PersonaListPage(),
            tabContent_PersonaEditTabPage(),
            tabContent_PersonaFotoEditPage(),
            tabContent_PersonaContrato(),
            tabContent_PersonaRequisitoIndexPage(),
            tabContent_PersonaRequisitoOpcionalIndexPage(),

            tabContent_PersonaExoneracionIndexPage(),
            tabContent_PersonaPerfilIndexPage(),
            tabContent_PersonaGrupoIndexPage(),
            tabContent_PersonaRestriccionIndexPage(),
            tabContent_PersonaMarcacionIndexPage(),

          ]
        }
      />
    </>
  );
};


export default injectIntl(WithLoandingPanel(PersonaAccesoIndexPage));
