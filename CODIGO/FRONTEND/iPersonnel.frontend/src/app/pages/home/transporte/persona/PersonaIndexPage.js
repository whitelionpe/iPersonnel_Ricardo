import React, { useEffect, useState } from "react";
import {
  handleErrorMessages
} from "../../../../store/ducks/notify-messages";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import { getButtonPermissions, defaultPermissions, setDisabledTabs } from '../../../../../_metronic/utils/securityUtils'
import { useSelector } from "react-redux";
import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";
import { servicePersona } from "../../../../api/administracion/persona.api";
import { obtener as obtenerFoto } from "../../../../api/administracion/personaFoto.api";
import PersonaListPage from "../../administracion/persona/PersonaListPage";
import PersonaEditTabPage from "../../administracion/persona/PersonaEditTabPage";
import PersonaFotoEditPage from "../../administracion/persona/PersonaFotoEditPage";
import PersonaContratoIndexPage from "../../administracion/persona/contrato/PersonaContratoIndexPage";
import AvatarFoto from "../../../../partials/content/avatarFoto";
import { isNotEmpty, TYPE_SISTEMA_ENTIDAD } from "../../../../../_metronic";
import TabNavContainer from "../../../../partials/components/Tabs/TabNavContainer";
import FormatListNumberedIcon from "@material-ui/icons/FormatListNumbered";
import AccountCircleOutlinedIcon from "@material-ui/icons/AccountCircleOutlined";
import DescriptionIcon from "@material-ui/icons/Description";
import PlaylistAddCheckOutlined from "@material-ui/icons/PlaylistAddCheckOutlined";
import AssignmentTurnedIn from '@material-ui/icons/AssignmentTurnedIn';
import PersonaRequisitoIndexPage from "../../acceso/persona/requisito/PersonaRequisitoIndexPage";
import PersonaLicenciaIndexPage from '../../administracion/persona/licencia/PersonaLicenciaIndexPage';
import {
useStylesTab,
} from "../../../../store/config/Styles";

//Multi-idioma
import { injectIntl } from "react-intl";

import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';

export const initialFilter = {
  IdCliente: '',
  Activo: 'S',
  Condicion: 'TRABAJADOR'
};


const PersonaIndexPage = (props) => {
  const perfil = useSelector((state) => state.perfil.perfilActual);

  const { intl, setLoading, dataMenu } = props;
  //const [pathFile, setPathFile] = useState();

  const [focusedRowKey, setFocusedRowKey] = useState();

  const [varIdPersona, setVarIdPersona] = useState("");
  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  const [TiposDocumento, setTiposDocumento] = useState([]);
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
  //++++++++Variable (totalRowIndex) para controlar bloqueo de tabs cuando se cambia de búsqueda de un registro en la grilla.++++++++++++++
  const [totalRowIndex, setTotalRowIndex] = useState(0);

  const [dataRowEditNewTabs, setDataRowEditNewTabs] = useState({});
  const [tituloTabs, setTituloTabs] = useState(
    intl.formatMessage({ id: "ACTION.LIST" })
  );
  const classes = useStylesTab();
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    //Estado cambio de tabs
    setValue(newValue);
    setTabIndex(newValue);
  };
  const [fotoPerfil, setFotoPerfil] = useState("");

  //Datos principales
  const [selected, setSelected] = useState({});
  const [tabIndex, setTabIndex] = useState(0);

  //FILTRO
  const [isFirstDataLoad, setIsFirstDataLoad] = useState(true);
  const [filterData, setFilterData] = useState({ ...initialFilter });
  const [refreshData, setRefreshData] = useState(false);
  const ds = new DataSource({ store: new ArrayStore({ data: [], key: 'RowIndex' }), reshapeOnPush: false });
  const [dataSource] = useState(ds);

  const refresh = () => dataSource.refresh();
  const resetLoadOptions = () => dataSource.resetLoadOptions();

  const [maxFechaFin, setMaxFechaFin] = useState("N");
  const [dataCombos, setDataCombos] = useState([]);
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
    const { IdPersona, RowIndex } = dataRow;
    setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
    setSelected(dataRow);

    if (IdPersona !== varIdPersona) {
      setVarIdPersona(IdPersona);
      obtenerFotoPerfilLocal(dataRow);
      setFocusedRowKey(RowIndex);
    }
  }

  const verRegistroDblClick = async (dataRow) => {
    changeTabIndex(1);
    await obtenerPersona(dataRow.IdPersona, true);
  };

  async function obtenerConfiguracion() {
    // let param = {
    //   IdCliente: perfil.IdCliente,
    //   IdPerfil: perfil.IdPerfil,
    //   IdModulo: dataMenu.info.IdModulo,
    //   IdAplicacion: dataMenu.info.IdAplicacion,
    //   IdMenu: dataMenu.info.IdMenu //'040401'
    // };
    // //Obtener Ruta  del servidor para subir archivos
    // await serviceRepositorio.obtenerMenu(param).then(datosMenu => {
    //   const { Repositorio } = datosMenu;
    //   setPathFile(Repositorio);
    // });

  }

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

  // console.log("PersonaIndexPage|accessButton:", accessButton);

  const loadControlsPermission = () => {
    const numeroTabs = 10; //Nùmero de tab del formulario.
    let buttonsPermissions = getButtonPermissions(dataMenu.objetos);
    let newTabs = setDisabledTabs(dataMenu.objetos, numeroTabs);
    setAccessButton({ ...accessButton, ...buttonsPermissions, Tabs: newTabs });
  }


  useEffect(() => {
    cargarCombos();
    obtenerConfiguracion();
    loadControlsPermission();
  }, []);


  //:::::::::::::::::::::::::::::::::::::::::::::-funciones-persona-foto:::::::::::::::::::::::::::::::::
  function obtenerFotoPerfilLocal(dataRow) {
    const { FotoPC } = dataRow;
    setFotoPerfil(FotoPC)
  }

  async function obtenerPersonaFoto() {
    setLoading(true);
    const { IdPersona, IdCliente } = selected;
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
      "IDENTIFICATION.LICENSE.TAB"
    ];

    let sufix = tabsTitles[tabIndex] !== "" ? (" - " + `${intl.formatMessage({ id: tabsTitles[tabIndex] })}`) : "";

    return `${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} ` + " " + sufix;
  }
  const tabsDisabled = () => {
    return isNotEmpty(varIdPersona) ? false : true;
  }


  const tabContent_PersonaListPage = () => {
    return <PersonaListPage
      titulo={titulo}
      seleccionarRegistro={seleccionarRegistro}
      verRegistroDblClick={verRegistroDblClick}
      focusedRowKey={focusedRowKey}
      setFocusedRowKey={setFocusedRowKey}
      showButtons={false}
      uniqueId={"accesoPersonaList"}
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
      totalRowIndex = {totalRowIndex}
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

  const tabContent_PersonaRequisitoIndexPage = () => {
    return <>

      <PersonaRequisitoIndexPage
        varIdPersona={varIdPersona}
        moduloCompania={selected}
        cancelarEdicion={cancelarEdicion}
        getInfo={getInfo}
        accessButton={accessButton}
        settingDataField={dataMenu.datos}
        pathFile={""}
        showButtons={false}
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
        showButtons = {false}
      />
    </>
  }


  //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  return (
    <>
      <TabNavContainer
        title={intl.formatMessage({ id: "TRANSPORT.MAIN" })}
        subtitle={`${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} `}        
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
             icon: <PlaylistAddCheckOutlined fontSize="large" />,
             disabled: !tabsDisabled() && accessButton.Tabs[4] ? false : true
           },
           {
            label: intl.formatMessage({ id: "IDENTIFICATION.LICENSE.TAB" }),
            icon: <AssignmentTurnedIn fontSize="large" />,
            disabled: !tabsDisabled() && accessButton.Tabs[5] ? false : true
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
            tabContent_PersonaLicencia(),
          ]
        }
      />


    </>
  );
};


export default injectIntl(WithLoandingPanel(PersonaIndexPage));
