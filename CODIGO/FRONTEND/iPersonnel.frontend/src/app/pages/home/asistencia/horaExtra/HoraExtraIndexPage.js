import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { handleErrorMessages } from "../../../../store/ducks/notify-messages";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import Confirm from "../../../../partials/components/Confirm";
import { getButtonPermissions, defaultPermissions, setDisabledTabs } from '../../../../../_metronic/utils/securityUtils'
import { useStylesTab } from "../../../../store/config/Styles";
import { useSelector } from "react-redux";
import { obtenerTodos as obtenerTodosTiposDocumento } from "../../../../api/sistema/tipodocumento.api";
import { obtener } from "../../../../api/asistencia/persona.api";
import HoraExtraListPage from "./HoraExtraListPage";
import { dateFormat, isNotEmpty } from "../../../../../_metronic";
import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
// import { obtener as obtenerMenu } from "../../../../api/sistema/menu.api";
import TabNavContainer from "../../../../partials/components/Tabs/TabNavContainer";
// import { serviceRepositorio } from "../../../../api/sistema/repositorio.api";

export const initialFilter = {
  Activo: 'S',
  IdCliente: '',
  IdPersona: '',
  Condicion: 'TRABAJADOR',
  ControlarAsistencia: 'S'
};


const HoraExtraIndexPage = (props) => {
  const usuario = useSelector(state => state.auth.user);
  const { IdDivision, IdCliente } = useSelector(state => state.perfil.perfilActual);
  const perfil = useSelector(state => state.perfil.perfilActual);

  const { intl, setLoading, dataMenu } = props;
  const numeroTabs = 2; //Definicion numero de tabs que contiene el formulario.

  const [varIdPersona, setVarIdPersona] = useState("");
  const [varIdCompania, setVarIdCompania] = useState("");
  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  const [tiposDocumento, setTiposDocumento] = useState([]);
  const [focusedRowKey, setFocusedRowKey] = useState();
  const [selected, setSelected] = useState({});
  const classes = useStylesTab();
  const [tabIndex, setTabIndex] = useState(0);
  //const [tituloTabs, setTituloTabs] = useState(intl.formatMessage({ id: "ACTION.EDIT" }));

  const [isVisible, setIsVisible] = useState(false);
  const [instance, setInstance] = useState({});

  /* const [menus, setMenus] = useState([{
    Icon: "flaticon2-expand"
    , varIdMenu: null
    , varIdMenuPadre: null
    , Menu: "-SIN DATA-"
    , MenuPadre: null
    , Nivel: 0
    , expanded: true
    , selected: false
  }]); */

  //const [pathFile, setPathFile] = useState();

  const handleChange = (event, newValue) => {
    //Estado cambio de tabs
    setTabIndex(newValue);
  };
  //const [fotoPerfil, setFotoPerfil] = useState("");
  //FILTRO
  const [isFirstDataLoad, setIsFirstDataLoad] = useState(true);
  const [refreshData, setRefreshData] = useState(false);
  const ds = new DataSource({ store: new ArrayStore({ data: [], key: 'RowIndex' }), reshapeOnPush: false });
  const [dataSource] = useState(ds);

  const refresh = () => dataSource.refresh();
  const resetLoadOptions = () => dataSource.resetLoadOptions();

  const [accessButton, setAccessButton] = useState(defaultPermissions);

  const loadControlsPermission = () => {
    // const numeroTabs = 8;
    let buttonsPermissions = getButtonPermissions(dataMenu.objetos);
    let newTabs = setDisabledTabs(dataMenu.objetos, numeroTabs);
    setAccessButton({ ...accessButton, ...buttonsPermissions, Tabs: newTabs });
  }

  const titleHeaderToolbar = () => {
    //`${intl.formatMessage({ id: "ADMINISTRATION.PERSON.MAINTENANCE" })}   
    return `${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} `;
  }


  //:::::::::::::::::::::::::::::::::::::::::::::-funciones-Persona-:::::::::::::::::::::::::::::::::


/* 
  async function listadoPersonas() {
    setRefreshData(true);//Actualizar CustomDataGrid

    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    changeTabIndex(0);
    setModoEdicion(false);

  }

 */
  async function listarTiposDocumento() {
    let tiposDocumento = await obtenerTodosTiposDocumento();
    setTiposDocumento(tiposDocumento);
  }

  // async function obtenerConfiguracion() {
  //   //debugger;
  //   //console.log("obtenerConfiguracion", obtenerConfiguracion);
  //   let param = {
  //     IdCliente: perfil.IdCliente,
  //     IdPerfil: perfil.IdPerfil,
  //     IdModulo: dataMenu.info.IdModulo,
  //     IdAplicacion: dataMenu.info.IdAplicacion,
  //     IdMenu: dataMenu.info.IdMenu //'040401'
  //   };
  //   //Obtener Ruta  del servidor para subir archivos
  //   await serviceRepositorio.obtenerMenu(param).then(datosMenu => {
  //     const { Repositorio } = datosMenu;
  //     setPathFile(Repositorio);
  //   });

  // }


  useEffect(() => {
    listarTiposDocumento();
    loadControlsPermission();
    //obtenerConfiguracion();
  }, []);


  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::-Configuración - Tabs::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::


  const tabContent_PersonaListPage = () => {
    return <>
      <HoraExtraListPage
        titulo={titulo}
        showButtons={false}
        focusedRowKey={focusedRowKey}
        isFirstDataLoad={isFirstDataLoad}
        setIsFirstDataLoad={setIsFirstDataLoad}
        dataSource={dataSource}
        refresh={refresh}
        resetLoadOptions={resetLoadOptions}
        refreshData={refreshData}
        setRefreshData={setRefreshData}

      />
    </>
  }


  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  return <>

    <TabNavContainer
      title={intl.formatMessage({ id: "ASSISTANCE.MAIN" })}
      subtitle={`${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} `}
      nombrebarra={titleHeaderToolbar()}
      tabIndex={tabIndex}
      handleChange={handleChange}
      componentTabsHeaders={[
        {
          label: intl.formatMessage({ id: "ACTION.LIST" }),
          icon: <FormatListNumberedIcon fontSize="large" />,
          disabled: false,
        }

      ]}
      className={classes.tabContent}
      componentTabsBody={
        [
          tabContent_PersonaListPage()
        ]
      }

    />

    <Confirm
      message={intl.formatMessage({ id: "ALERT.REMOVE" })}
      isVisible={isVisible}
      setIsVisible={setIsVisible}
      setInstance={setInstance}
      title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
      confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
      cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
    />

  </>


};


export default injectIntl(WithLoandingPanel(HoraExtraIndexPage));
