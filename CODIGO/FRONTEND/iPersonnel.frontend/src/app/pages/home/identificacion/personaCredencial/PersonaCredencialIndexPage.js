import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { handleErrorMessages } from "../../../../store/ducks/notify-messages";
import { getButtonPermissions, defaultPermissions, setDisabledTabs } from '../../../../../_metronic/utils/securityUtils'
import { useSelector } from "react-redux";
import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";
import Confirm from "../../../../partials/components/Confirm";
import { servicePersona } from "../../../../api/administracion/persona.api";
import { obtener as obtenerFoto } from "../../../../api/administracion/personaFoto.api";

import PersonaCredencialListPage from "./PersonaCredencialListPage";
import PersonaEditTabPage from "../../administracion/persona/PersonaEditTabPage";
import PersonaFotoEditPage from "../../administracion/persona/PersonaFotoEditPage";
import PersonaContratoIndexPage from "../../administracion/persona/contrato/PersonaContratoIndexPage";

import AvatarFoto from "../../../../partials/content/avatarFoto";
import { isNotEmpty, TYPE_SISTEMA_ENTIDAD } from "../../../../../_metronic";
import FormatListNumberedIcon from "@material-ui/icons/FormatListNumbered";
import AccountCircleOutlinedIcon from "@material-ui/icons/AccountCircleOutlined";
import DescriptionIcon from '@material-ui/icons/Description';
import AssignmentIndIcon from '@material-ui/icons/AssignmentInd';
import Fingerprint from '@material-ui/icons/Fingerprint';
import RecordVoiceOverIcon from '@material-ui/icons/RecordVoiceOver';
import AssignmentTurnedIn from '@material-ui/icons/AssignmentTurnedIn';
import { useStylesTab, } from "../../../../store/config/Styles";

import IdentificacionCredencialIndexPage from "./credencial/IdentificacionCredencialIndexPage";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import TabNavContainer from "../../../../partials/components/Tabs/TabNavContainer";
import PersonaHuellaIndexPage from './huella/PersonaHuellaIndexPage';
import PersonaRostroIndexPage from './rostro/PersonaRostroIndexPage';
import PersonaLicenciaIndexPage from '../../administracion/persona/licencia/PersonaLicenciaIndexPage';
import { obtener as obtenerSistemaConfiguracion } from "../../../../api/sistema/configuracion.api";
import { obtener_medidas as obtenerSistemaConfiguracionMedidas } from "../../../../api/sistema/configuracion.api";

export const initialFilter = {
  IdCliente: '',
  Activo: 'S',
  Estado: 'S',
  Condicion: 'TRABAJADOR'
};

const PersonaCredencialIndexPage = (props) => {
  const { intl, setLoading, dataMenu } = props;

  //const usuario = useSelector((state) => state.auth.user);
  const perfil = useSelector((state) => state.perfil.perfilActual);
  //const [pathFile, setPathFile] = useState();

  const [focusedRowKey, setFocusedRowKey] = useState();

  const [varIdPersona, setVarIdPersona] = useState("");
  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const [titulo, setTitulo] = useState(
    intl.formatMessage({ id: "ACTION.LIST" })
  );

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

  const [valorMinimoTexto, setValorMinimoTexto] = useState(4);


  const [isVisible, setIsVisible] = useState(false);
  const [instance, setInstance] = useState({});
  //Datos principales
  const [selected, setSelected] = useState({});
  //const [selectedDelete, setSelectedDelete] = useState({});
  const [tabIndex, setTabIndex] = useState(0);

  //FILTRO
  const [isFirstDataLoad, setIsFirstDataLoad] = useState(true);
  //const [filterData, setFilterData] = useState({ ...initialFilter });
  const [refreshData, setRefreshData] = useState(false);
  const ds = new DataSource({ store: new ArrayStore({ data: [], key: 'RowIndex' }), reshapeOnPush: false });
  const [dataSource] = useState(ds);

  const refresh = () => dataSource.refresh();
  const resetLoadOptions = () => dataSource.resetLoadOptions();
  //const [focusedRowKeyPersonaCredencial, setFocusedRowKeyPersonaCredencial] = useState();

  const [maxFechaFin, setMaxFechaFin] = useState("N");
  const [dataCombos, setDataCombos] = useState([]);
  const [totalRowIndex, setTotalRowIndex] = useState(0);

  const [alturaSugerido, setAlturaSugerido] = useState();
  const [anchoSugerido, setAnchoSugerido] = useState();
  const [alturaSugeridoRadio, setAlturaSugeridoRadio] = useState();
  const [anchoSugeridoRadio, setAnchoSugeridoRadio] = useState();

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

  const seleccionarRegistro = async (dataRow) => {
    const { IdPersona, RowIndex } = dataRow;
    setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
    setFocusedRowKey(RowIndex);
    setVarIdPersona(IdPersona);
    setSelected(dataRow);
    obtenerPersonaFoto(dataRow);


  }

  async function obtenerPersona(filtro, validateSensitiveInformation = false) {
    setLoading(true);
    const { IdPersona, IdCliente } = filtro;
    await servicePersona.obtener({ IdPersona, IdCliente }).then(response => {
      setDataRowEditNew({ ...response, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => {
      setLoading(false);
    });

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


  async function obtenerPersonaFoto(selectedRow) {

    const { IdPersona, IdCliente } = selectedRow;
    if (varIdPersona === IdPersona) return; //Si seleciona la misma persona por segunda vez, no debe recuperar foto 

    setLoading(true);

    await validateConfigurationImageLength(IdCliente);
    await obtenerFoto({ IdPersona, IdCliente })
      .then(response => {
        if (isNotEmpty(response)) {
          setFotoPerfil(response.FotoPC);
          setDataRowEditNewTabs({ ...response, esNuevoRegistro: false });
        } else {
          setFotoPerfil("");
          setDataRowEditNewTabs({ ...selected, esNuevoRegistro: true });
        }
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false) });
  }


  const cancelarEdicion = () => {
    changeTabIndex(0);
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
    setDataRowEditNewTabs({});

  };


  const verRegistroDblClick = async (dataRow) => {
    changeTabIndex(1);
    setModoEdicion(false);
    await obtenerPersona(dataRow, true);
  };

  function clearSensitiveInformation(input, target) {
    input.forEach((element) => {
      let hasProperty = target.hasOwnProperty(element.Campo);
      if (hasProperty) {
        target[element.Campo] = " ";
      }
    })
  }

  async function configurationCaracteristica() {
    setLoading(true);
    await obtenerSistemaConfiguracion({ IdCliente: perfil.IdCliente, IdConfiguracion: "MINVALINPUT" })
      .then(result => {
        if (isNotEmpty(result.Valor1)) setValorMinimoTexto(parseInt(result.Valor1))
      }).finally(() => { setLoading(false); });
  }

  useEffect(() => {
    cargarCombos();
    loadControlsPermission();
    configurationCaracteristica();
  }, []);

  const getInfo = () => {
    const { Nombre, Apellido } = selected;
    return [
      { text: [intl.formatMessage({ id: "COMMON.CODE" })], value: varIdPersona, colSpan: 2 },
      { text: [intl.formatMessage({ id: "ADMINISTRATION.PERSON.NAME" })], value: Nombre + " " + Apellido, colSpan: 4 }
    ];

  };


  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  const changeTabIndex = (index) => {
    handleChange(null, index);
  };


  /**Configuración Botones**************************************** */
  const [accessButton, setAccessButton] = useState(defaultPermissions);

  const loadControlsPermission = () => {
    const numeroTabs = 8; //Nùmero de tab del formulario.
    let buttonsPermissions = getButtonPermissions(dataMenu.objetos);
    let newTabs = setDisabledTabs(dataMenu.objetos, numeroTabs);
    setAccessButton({ ...accessButton, ...buttonsPermissions, Tabs: newTabs });
  }


  //:::::::::::::::::::::::::::::::::::::::::::::-Configuración de tabs-:::::::::::::::::::::::::::::::::
  const titleHeaderToolbar = () => {
    return `${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} `;
  }
  const tabsDisabled = () => {
    return isNotEmpty(varIdPersona) ? false : true;
  }

  const tabContent_PersonaCredencialListPage = () => {
    return <PersonaCredencialListPage
      titulo={titulo}
      uniqueId={"IdentificacionPersonaList"}
      setVarIdPersona={setVarIdPersona}

      seleccionarRegistro={seleccionarRegistro}
      verRegistroDblClick={verRegistroDblClick}
      focusedRowKey={focusedRowKey}
      setFocusedRowKey={setFocusedRowKey}
      showButtons={false}
      isFirstDataLoad={isFirstDataLoad}
      setIsFirstDataLoad={setIsFirstDataLoad}
      dataSource={dataSource}
      refresh={refresh}
      resetLoadOptions={resetLoadOptions}
      refreshData={refreshData}
      setRefreshData={setRefreshData}
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
      {
        auditoriaSwitch && (
          <AuditoriaPage dataRowEditNew={dataRowEditNew} />
        )
      }
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
        editable={false}

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

  const tabContent_IdentificacionCredencialListPage = () => {
    return <>
      <IdentificacionCredencialIndexPage
        accessButton={accessButton}
        varIdPersona={varIdPersona}
        foto={fotoPerfil}
        getInfo={getInfo}
        dataMenu={dataMenu}
        cancelarEdicion={cancelarEdicion}
      />
    </>
  }

  const tabContent_PersonaHuella = () => {
    return <>
      <PersonaHuellaIndexPage
        varIdPersona={varIdPersona}
        selected={selected}
        cancelarEdicion={cancelarEdicion}
        getInfo={getInfo}
      />
    </>
  }

  const tabContent_PersonaRostro = () => {
    return <>
      <PersonaRostroIndexPage
        varIdPersona={varIdPersona}
        selected={selected}
        cancelarEdicion={cancelarEdicion}
        getInfo={getInfo}
      />
    </>
  }

  const tabContent_PersonaLicencia = () => {
    return <>
      <PersonaLicenciaIndexPage
        varIdPersona={varIdPersona}
        selected={selected}
        cancelarEdicion={cancelarEdicion}
        getInfo={getInfo}
        accessButton={accessButton}
        settingDataField={dataMenu.datos}
      />
    </>
  }

  //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  return (
    <>
      <TabNavContainer
        title={intl.formatMessage({ id: "IDENTIFICATION.CREDENTIALTYPE.MENU" })}
        submenu={intl.formatMessage({ id: "CONFIG.MENU.IDENTIFICACION.GESTIÓN_DE_IDENTIFICACI" })}
        subtitle={intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })}
        nombrebarra={titleHeaderToolbar()}
        tabIndex={tabIndex}
        handleChange={handleChange}
        componentTabsHeaders={[
          {
            label: intl.formatMessage({ id: "ACTION.LIST" }),
            icon: <FormatListNumberedIcon fontSize="large" />,
            // onClick: () => { listadoPersonas() },
          },
          {
            label: intl.formatMessage({ id: "ACCESS.PERSON.MENU.PERSON" }),
            icon: <AvatarFoto size={classes.avatarSmall} id={"FotoPerfil"} imagenB64={fotoPerfil} />,
            className: classes.avatarContent,
            onClick: (e) => { obtenerPersona(selected) },
            disabled: tabsDisabled()
          },
          {
            label: intl.formatMessage({ id: "CASINO.PERSON.GROUP.PHOTO" }),
            icon: <AccountCircleOutlinedIcon fontSize="large" />,
            disabled: !tabsDisabled() && accessButton.Tabs[2] ? false : true
          },
          {
            label: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CONTRACT" }),
            icon: < DescriptionIcon fontSize="large" />,
            disabled: !tabsDisabled() && accessButton.Tabs[3] ? false : true
          },

          {
            label: intl.formatMessage({ id: "IDENTIFICATION.CREDENTIAL.TAB" }),
            icon: <AssignmentIndIcon fontSize="large" />,
            //onClick: () => { listarIdentificacionCredencial() },
            disabled: !tabsDisabled() && accessButton.Tabs[4] ? false : true
          },
          {
            label: intl.formatMessage({ id: "IDENTIFICATION.FOOTPRINT.TAB" }),
            icon: <Fingerprint fontSize="large" />,
            disabled: !tabsDisabled() && accessButton.Tabs[5] ? false : true
          },
          {
            label: intl.formatMessage({ id: "IDENTIFICATION.FACIAL.TAB" }),
            icon: <RecordVoiceOverIcon fontSize="large" />,
            disabled: !tabsDisabled() && accessButton.Tabs[6] ? false : true
          },
          {
            label: intl.formatMessage({ id: "IDENTIFICATION.LICENSE.TAB" }),
            icon: <AssignmentTurnedIn fontSize="large" />,
            disabled: !tabsDisabled() && accessButton.Tabs[7] ? false : true
          }
        ]}
        className={classes.tabContent}
        componentTabsBody={
          [
            tabContent_PersonaCredencialListPage(),
            tabContent_PersonaEditTabPage(),
            tabContent_PersonaFotoEditPage(),
            tabContent_PersonaContrato(),
            tabContent_IdentificacionCredencialListPage(),
            tabContent_PersonaHuella(),
            tabContent_PersonaRostro(),
            tabContent_PersonaLicencia(),
          ]
        }
      />

      <Confirm
        message={intl.formatMessage({ id: "ALERT.REMOVE" })}
        isVisible={isVisible}
        setIsVisible={setIsVisible}
        setInstance={setInstance}
        //  onConfirm={() => eliminarListRowTab(selected, true)}
        title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
        confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
        cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
      />

    </>
  );
};

export default injectIntl(WithLoandingPanel(PersonaCredencialIndexPage));
