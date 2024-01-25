import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { Portlet } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { handleErrorMessages, handleInfoMessages, handleSuccessMessages } from "../../../../store/ducks/notify-messages";
import { useStylesEncabezado, useStylesTab } from "../../../../store/config/Styles";
import CustomBreadcrumbs from "../../../../partials/layout/CustomBreadcrumbs";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import Confirm from "../../../../partials/components/Confirm";

import { useSelector } from "react-redux";
import { isNotEmpty } from "../../../../../_metronic";
import { getButtonPermissions, defaultPermissions, setDisabledTabs } from '../../../../../_metronic/utils/securityUtils'
import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";
import TabNavContainer from "../../../../partials/components/Tabs/TabNavContainer";

//  ::::::::::::::: METODO USAR ::::::::::::::::::::::::::::::
import { obtener } from "../../../../api/administracion/compania.api";

import CompaniaListPage from "../../acceso/companiaGrupo/compania/CompaniaListPage";
import CompaniaEditPage from "../../acceso/companiaGrupo/compania/CompaniaEditPage";

import { serviceAccesoCompaniaGrupo } from "../../../../api/acceso/companiaGrupo.api";

import CompaniaGrupoEditPage from "./CompaniaGrupoEditPage";
import CompaniaGrupoListPage from "./CompaniaGrupoListPage";

import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import BusinessIcon from '@material-ui/icons/Business';
import GroupIcon from '@material-ui/icons/Group';

//-customerDataGrid Star
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';

export const initialFilter = {
  Activo: 'S',
  IdCliente: '',
  IdCompania: ''
};

const CompaniaGrupoIndexPage = (props) => {

  const { intl, setLoading, dataMenu } = props;
  const usuario = useSelector(state => state.auth.user);
  const perfil = useSelector(state => state.perfil.perfilActual);

  const [varIdCompania, setVarIdCompania] = useState("");
  const [focusedRowKey, setFocusedRowKey] = useState();
  const [focusedRowKeyCompaniaGrupo, setfocusedRowKeyCompaniaGrupo] = useState();

  //Datos principales
  const [selected, setSelected] = useState({});

  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);

  const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
  const [modoEdicionMenu, setModoEdicionMenu] = useState(false);
  const [listarTabs, setListarTabs] = useState([]);

  const classesEncabezado = useStylesEncabezado();
  const classes = useStylesTab();
  const [tabIndex, setTabIndex] = useState(0);
  const [isVisibleConfirm, setIsVisibleConfirm] = useState(false);
  const [instance, setInstance] = useState({});

  //++++++++Variable (totalRowIndex) para controlar bloqueo de tabs cuando se cambia de búsqueda de un registro en la grilla.++++++++++++++
  const [totalRowIndex, setTotalRowIndex] = useState(0);

  const [menus, setMenus] = useState([{
    Icon: "flaticon2-expand"
    , IdMenu: null
    , IdModulo: null
    , IdMenuPadre: null
    , Menu: intl.formatMessage({ id: "SYSTEM.MENU.OPTIONS" })
    , MenuPadre: null
    , Nivel: 0
    , Orden: 0
    , expanded: true
  }]);

  const [unidadOrganizativaTreeView, setUnidadOrganizativaTreeView] = useState([{
    Icon: "flaticon2-expand"
    , IdMenu: null
    , IdModulo: null
    , IdMenuPadre: null
    , Menu: intl.formatMessage({ id: "SYSTEM.MENU.OPTIONS" })
    , MenuPadre: null
    , Nivel: 0
    , Orden: 0
    , expanded: true
  }]);




  const handleChange = (event, newValue) => {
    //Estado cambio de tabs
    setTabIndex(newValue);
  };

  //FILTRO- CustomerDataGrid
  const [isFirstDataLoad, setIsFirstDataLoad] = useState(true);
  const [refreshData, setRefreshData] = useState(false);

  const ds = new DataSource({ store: new ArrayStore({ data: [], key: 'RowIndex' }), reshapeOnPush: false });
  const [dataSource] = useState(ds);

  const refresh = () => dataSource.refresh();
  const resetLoadOptions = () => dataSource.resetLoadOptions();

  /************--Configuración de acceso de botones*************/
  const [accessButton, setAccessButton] = useState(defaultPermissions);

  const loadControlsPermission = () => {
    const numeroTabs = 3; //Nùmero de tab del formulario.
    let buttonsPermissions = getButtonPermissions(dataMenu.objetos);
    let newTabs = setDisabledTabs(dataMenu.objetos, numeroTabs);
    setAccessButton({ ...accessButton, ...buttonsPermissions, Tabs: newTabs });
  }
  /***********************************************************************/
  //::::::::::::::::::::::::::::FUNCIONES COMPANIA-:::::::::::::::::::::::::::::::::::

   async function obtenerCompania() {
     setLoading(true);
     const { IdCliente, IdCompania } = selected;
     await obtener({
       IdCompania, IdCliente
     }).then(compania => {
       setDataRowEditNew({ ...compania, esNuevoRegistro: false });
     }).catch(err => {
       handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
     }).finally(() => { setLoading(false); });
   }

  const cancelarEdicion = () => {
    changeTabIndex(0);
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
    setDataRowEditNew({});
    setVarIdCompania("");
  };

  const seleccionarRegistro = dataRow => {
    const { IdCompania, RowIndex } = dataRow;
    setModoEdicion(false);
    setSelected(dataRow);
    setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
    if (IdCompania != varIdCompania) {
      setVarIdCompania(IdCompania);
      setFocusedRowKey(RowIndex);
    }
  }

  const verRegistroDblClick = async (dataRow) => {
    changeTabIndex(1);
    setModoEdicion(false);
    await obtenerCompania(dataRow);
  };

  //::::::::::::::::::::::FUNCIONES COMPANIA GRUPO:::::::::::::::::::::::::::::::::::::::::::::::::

  async function agregarCompaniaGrupo(data) {
    setLoading(true);
    const { IdGrupo,IdDivision, Activo } = data;
    let param = {
      IdCompania: varIdCompania,
      IdDivision: IdDivision,
      IdGrupo: IdGrupo,
      Activo: Activo,
    };
    await serviceAccesoCompaniaGrupo.crear(param)
      .then(response => {
        if (response)
          handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
        listarCompaniaGrupo();
        setModoEdicion(false);
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
  }


  async function actualizarCompaniaGrupo(dataRow) {
    setLoading(true);
    const { IdCompania,IdDivision, IdGrupo, Activo } = dataRow;
    let params = {
      IdCompania,
      IdDivision,
      IdGrupo,
      Activo,
    };
    await serviceAccesoCompaniaGrupo.actualizar(params)
      .then(response => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
        listarCompaniaGrupo();
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
  }

  async function obtenerCompaniaGrupo(dataRow) {
    setLoading(true);
    const { IdCompania,IdDivision, IdGrupo } = dataRow;
    await serviceAccesoCompaniaGrupo.obtener({
      IdCompania,
      IdDivision,
      IdGrupo
    }).then(data => {
      setDataRowEditNew({ ...data, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    })
      .finally(() => { setLoading(false); });
  }

  async function eliminarCompaniaGrupo(dataRow, confirm) {
    setSelected(dataRow);
    setIsVisibleConfirm(true);
    if (confirm) {
      setLoading(true);
      const { IdCompania,IdDivision, IdGrupo } = dataRow;
      await serviceAccesoCompaniaGrupo.eliminar({
        IdCompania,
        IdDivision,
        IdGrupo
      })
        .then(response => {
          handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
        })
        .catch(err => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
      listarCompaniaGrupo();
    }
  }

  async function listarCompaniaGrupo() {
    setLoading(true);
    const { IdCompania } = selected;
    await serviceAccesoCompaniaGrupo.listar({
      IdCompania,
      IdDivision:'%',
      IdGrupo:'%',
      NumPagina: 0,
      TamPagina: 0
    }).then(data => {
      setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
      setListarTabs(data);
      //setModoEdicion(false);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  const seleccionarCompaniaGrupo = dataRow => {
    const { RowIndex } = dataRow;
    setfocusedRowKeyCompaniaGrupo(RowIndex);
  };

  const editarCompaniaGrupo = dataRow => {
    const { RowIndex } = dataRow;
    setModoEdicion(true);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    setDataRowEditNew(dataRow);
    obtenerCompaniaGrupo(dataRow);
    setfocusedRowKeyCompaniaGrupo(RowIndex);
  };

  const nuevoCompaniaGrupo = (e) => {
    let nuevo = { Activo: "S" };
    setDataRowEditNew({ ...nuevo, esNuevoRegistro: true });
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
    setModoEdicionMenu(true);
  };

  //  ::::::::::::::::::::::::: Datos Principales ::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  const cancelarEdicionTabs = () => {
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };

  const changeTabIndex = (index) => {
    handleChange(null, index);
  }

  useEffect(() => {
    loadControlsPermission();
  }, []);


  const getInfo = () => {
    const { IdCompania, Compania } = selected;
    return [
      { text: [intl.formatMessage({ id: "COMMON.CODE" })], value: IdCompania, colSpan: 2 },
      { text: [intl.formatMessage({ id: "ADMINISTRATION.COMPANY.COMPANY" })], value: Compania, colSpan: 4 }
    ];
  }

  //:::::::::::::::::::::::::::::::::::::::::::::-Configuración de tabs-:::::::::::::::::::::::::::::::::
  const titleHeaderToolbar = () => {
    let tabsTitles = [
      "", 
      "",
      "ACCESS.PERSON.GRUPO.TAB"
    ];

    let sufix = tabsTitles[tabIndex] !== "" ? (" - " + `${intl.formatMessage({ id: tabsTitles[tabIndex] })}`): "";
    
    return `${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} ` + " " + sufix;

  }
  const tabsDisabled = () => {
    return isNotEmpty(varIdCompania) ? false : true;
    //return true;
  }

  const tabContent_CompaniaListPage = () => {
    return <CompaniaListPage
      titulo={titulo}
      seleccionarRegistro={seleccionarRegistro}
      verRegistroDblClick={verRegistroDblClick}
      focusedRowKey={focusedRowKey}
      setFocusedRowKey={setFocusedRowKey}
      //::::::::::::::::::::::::::::::::::::::::
      isFirstDataLoad={isFirstDataLoad}
      setIsFirstDataLoad={setIsFirstDataLoad}
      dataSource={dataSource}
      refresh={refresh}
      resetLoadOptions={resetLoadOptions}
      refreshData={refreshData}
      setRefreshData={setRefreshData}
      showButtons={false}
    //::::::::::::::::::::::::::::::::::::::::
      setVarIdCompania={setVarIdCompania}
      totalRowIndex = {totalRowIndex}
      setTotalRowIndex={setTotalRowIndex}
    />
  }

  const tabContent_CompaniaEditPage = () => {
    return <>
      <CompaniaEditPage
        titulo={titulo}
        modoEdicion={modoEdicion}
        dataRowEditNew={dataRowEditNew}
        cancelarEdicion={cancelarEdicion}
        accessButton={accessButton}
        settingDataField={dataMenu.datos}
        selectedIndex = {selected}
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

  const tabContent_CompaniaGrupoListPage = () => {
    return <>
      {modoEdicion && (
        <>
          <CompaniaGrupoEditPage
            dataRowEditNew={dataRowEditNew}
            titulo={titulo}
            modoEdicion={modoEdicion}
            agregarCompaniaGrupo={agregarCompaniaGrupo}
            actualizarCompaniaGrupo={actualizarCompaniaGrupo}
            cancelarEdicion={cancelarEdicionTabs}
            accessButton={accessButton}
            settingDataField={dataMenu.datos}
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
      )}
      {!modoEdicion && (
        <>
          <CompaniaGrupoListPage
            modoEdicion={modoEdicion}
            companiaPerfilData={listarTabs}
            editarRegistro={editarCompaniaGrupo}
            eliminarRegistro={eliminarCompaniaGrupo}
            nuevoRegistro={nuevoCompaniaGrupo}
            cancelarEdicion={cancelarEdicion}
            seleccionarRegistro={seleccionarCompaniaGrupo}
            focusedRowKey={focusedRowKeyCompaniaGrupo}
            getInfo={getInfo}
            accessButton={accessButton}
          />
        </>
      )}
    </>
  }

  //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  return (
    <>
      <TabNavContainer
        title={intl.formatMessage({ id: "ACCESS.PERSON.MENU" })}
        submenu={intl.formatMessage({ id: "ACCESS.PERSON.SUBMENU" })}
        subtitle={intl.formatMessage({ id: "CONFIG.MENU.ACCESO.COMPAÑIA" })}
        nombrebarra={titleHeaderToolbar()}
        tabIndex={tabIndex}
        handleChange={handleChange}
        componentTabsHeaders={[
          {
            label: intl.formatMessage({ id: "ACTION.LIST" }),
            icon: <FormatListNumberedIcon fontSize="large" />,
          },
          {
            label: intl.formatMessage({ id: "ADMINISTRATION.COMPANY.COMPANY" }),
            icon: <BusinessIcon fontSize="large" />,
            onClick: (e) => { obtenerCompania() },
            disabled: tabsDisabled()
          },
          {
            label: intl.formatMessage({ id: "ACCESS.PERSON.GRUPO.TAB" }),
            icon: <GroupIcon fontSize="large" />,
            onClick: (e) => { listarCompaniaGrupo() },
            disabled: !tabsDisabled() && accessButton.Tabs[2] ? false : true
          }
        ]}
        className={classes.tabContent}
        componentTabsBody={
          [
            tabContent_CompaniaListPage(),
            tabContent_CompaniaEditPage(),
            tabContent_CompaniaGrupoListPage()
          ]
        }
      />

      <Confirm
        message={intl.formatMessage({ id: "ALERT.REMOVE" })}
        isVisible={isVisibleConfirm}
        setIsVisible={setIsVisibleConfirm}
        setInstance={setInstance}
        onConfirm={() => eliminarCompaniaGrupo(selected, true)}
        title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
        confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
        cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
      />
    </>
  );
};

export default injectIntl(WithLoandingPanel(CompaniaGrupoIndexPage));
