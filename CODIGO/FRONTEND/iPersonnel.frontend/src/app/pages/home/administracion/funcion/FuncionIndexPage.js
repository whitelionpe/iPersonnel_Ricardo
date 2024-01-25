import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";

import PropTypes from 'prop-types';
import { isNotEmpty } from "../../../../../_metronic";
import { Portlet } from "../../../../partials/content/Portlet";
import { handleErrorMessages, handleSuccessMessages } from "../../../../store/ducks/notify-messages";
import { useStylesEncabezado, useStylesTab } from "../../../../store/config/Styles";
import CustomBreadcrumbs from "../../../../partials/layout/CustomBreadcrumbs";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import Confirm from "../../../../partials/components/Confirm";
import { getButtonPermissions, defaultPermissions } from '../../../../../_metronic/utils/securityUtils'


import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import ImportExportIcon from '@material-ui/icons/ImportExport';
import ViewWeekIcon from "@material-ui/icons/ViewWeek";

import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";


import {
  eliminar, obtener, listar, crear, actualizar
} from "../../../../api/administracion/funcion.api";
import FuncionListPage from "./FuncionListPage";
import FuncionEditPage from "./FuncionEditPage";

import PosicionListPage from "../posicion/PosicionListPage";


//-customerDataGrid
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';

import TabNavContainer from "../../../../partials/components/Tabs/TabNavContainer";
//import PersonIcon from '@material-ui/icons/Person';

export const initialFilter = {
  IdCliente: 1,
  IdFuncion: '',
  Funcion: ''
};


const FuncionIndexPage = (props) => {
  const { intl, setLoading, dataMenu, match: { path } } = props;
  const usuario = useSelector(state => state.auth.user);
  const perfil = useSelector(state => state.perfil.perfilActual);
  //const classesEncabezado = useStylesEncabezado();
  const classes = useStylesTab();
  const contratista = path === '/administracion/funcion' ? 'N' : 'S';

  const [funcion, setFuncion] = useState([]);
  const [varIdFuncion, setVarIdFuncion] = useState("");
  const [, setVarIdPosicion] = useState("");
  const [focusedRowKey, setFocusedRowKey] = useState();
  const [focusedRowKeyPosicion, setFocusedRowKeyPosicion] = useState();
  const [totalRowIndex, setTotalRowIndex] = useState(0);

  const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const [selected, setSelected] = useState({
    IdCliente: perfil.IdCliente
  });
  const [tabIndex, setTabIndex] = useState(0);
  const handleChange = (event, newValue) => { setTabIndex(newValue); };

  const [isVisible, setIsVisible] = useState(false);
  const [instance, setInstance] = useState({});

  /*********************************************************************/
  const [isFirstDataLoad, setIsFirstDataLoad] = useState(true);
  const [refreshData, setRefreshData] = useState(false);
  const ds = new DataSource({ store: new ArrayStore({ data: [], key: 'RowIndex' }), reshapeOnPush: false });
  const [dataSource] = useState(ds);

  const refresh = () => dataSource.refresh();
  const resetLoadOptions = () => dataSource.resetLoadOptions();

  //  const [moduloData, setModuloData] = useState([]);
  const [filterData, setFilterData] = useState({ ...initialFilter });

  async function agregarFuncion(dataRow) {
    setLoading(true);
    const { IdFuncion, Funcion, Contratista, Activo } = dataRow;
    let params = {
      IdCliente: perfil.IdCliente,
      IdFuncion: isNotEmpty(IdFuncion) ? IdFuncion.toUpperCase() : "",
      Funcion: isNotEmpty(Funcion) ? Funcion.toUpperCase() : "",
      Contratista: isNotEmpty(Contratista) ? Contratista : "",
      Activo: Activo,
      IdUsuario: usuario.username
    };
    await crear(params)
      .then(response => {
        if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
        setModoEdicion(false);
        listarFuncion();
        setRefreshData(true);
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
      }).finally(() => { setLoading(false); });
  }

  async function actualizarFuncion(dataRow) {
    setLoading(true);
    const { IdFuncion, Funcion, Contratista, Activo } = dataRow;
    let params = {
      IdCliente: perfil.IdCliente,
      IdFuncion: isNotEmpty(IdFuncion) ? IdFuncion.toUpperCase() : "",
      Funcion: isNotEmpty(Funcion) ? Funcion.toUpperCase() : "",
      Contratista: isNotEmpty(Contratista) ? Contratista : "",
      Activo: Activo,
      IdUsuario: usuario.username
    };
    await actualizar(params)
      .then(response => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
        setModoEdicion(false);
        listarFuncion();
        setRefreshData(true);
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
      }).finally(() => { setLoading(false); });
  }

  async function eliminarRegistro(dataRow, confirm) {
    setSelected(dataRow);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdFuncion, IdCliente } = dataRow;
      await eliminar({ IdCliente, IdFuncion })
        .then(response => {
          handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" })); 
          listarFuncion();
          setRefreshData(true);
        })
        .catch(err => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
        }).finally(() => { setLoading(false); });
      // listarFuncion();
    }
  }

  async function listarFuncion() {
    const { IdCliente } = selected;
    let Funcions = await listar({
      IdCliente,
      contratista,
      NumPagina: 0,
      TamPagina: 0
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    });
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setFuncion(Funcions);
    changeTabIndex(0);
  }

  async function obtenerFuncion() {
    setLoading(true);
    const { IdFuncion, IdCliente } = selected;
    await obtener({
      IdFuncion,
      IdCliente
    }).then(funcion => {
      setDataRowEditNew({ ...funcion, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });
  }

  const nuevoRegistro = () => {
    changeTabIndex(1);
    const { IdCliente } = selected;
    let Funcion = { Activo: "S", Contratista: contratista, IdCliente };
    setDataRowEditNew({ ...Funcion, esNuevoRegistro: true });
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
  };

  const editarRegistro = dataRow => {
    changeTabIndex(1);
    const { IdFuncion, RowIndex } = dataRow;
    setModoEdicion(true);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    obtenerFuncion(IdFuncion);
    setFocusedRowKey(RowIndex);
  };

  const cancelarEdicion = () => {
    changeTabIndex(0);
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };


  const seleccionarRegistro = dataRow => {
    const { IdFuncion, RowIndex } = dataRow;
    setSelected(dataRow);
    setModoEdicion(false);
    //setFiltroLocal({ IdCliente: perfil.IdCliente, IdFuncion: IdFuncion });
    setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
    if (IdFuncion != varIdFuncion) {
      setVarIdFuncion(IdFuncion);
      setFocusedRowKey(RowIndex);
    }
    console.log("dataRow", dataRow);
    console.log("setSelected", setSelected);
    console.log("IdFuncion", IdFuncion);
  }


  const verRegistroDblClick = async (dataRow) => {
    changeTabIndex(1);
    setModoEdicion(false);
    await obtenerFuncion(dataRow);
  };

  const changeTabIndex = (index) => {
    handleChange(null, index);
  }

  /*************************************************************/

  /*   const listarPosiciones = () => {
        setModoEdicion(false);
        setDataRowEditNew({});
        setVarIdFuncion(varIdFuncion);
        setSelected({});
        setTabIndex(2);
    }; */

  const seleccionarRegistroPosicion = dataRow => {
    const { RowIndex } = dataRow;
    setFocusedRowKeyPosicion(RowIndex);
  }

  /************--Configuración de acceso de botones*************/
  const numeroTabs = 2;
  const [accessButton, setAccessButton] = useState(defaultPermissions);

  const loadControlsPermission = () => {
    let buttonsPermissions = getButtonPermissions(dataMenu.objetos, numeroTabs);
    setAccessButton({ ...accessButton, ...buttonsPermissions });
  }
  /***********************************************************************/

  const getInfo = () => {
    const { IdFuncion, Funcion } = selected;
    return [
      { text: [intl.formatMessage({ id: "COMMON.CODE" })], value: IdFuncion, colSpan: 2 },
      { text: [intl.formatMessage({ id: "ADMINISTRATION.FUNCTION.TAB" })], value: Funcion, colSpan: 4 }
    ];

  };

  useEffect(() => {
    listarFuncion();
    loadControlsPermission();
    console.log('contratista', )
  }, []);



  //:::::::::::::::::::::::::::::::::::::::::::::-Configuración de tabs-:::::::::::::::::::::::::::::::::
  const titleHeaderToolbar = () => {
    let tabsTitles = [
      "",
      "",
      "ADMINISTRATION.POSITION.MAINTENANCE"
    ];

    let sufix = tabsTitles[tabIndex] !== "" ? (" - " + `${intl.formatMessage({ id: tabsTitles[tabIndex] })}`) : "";

    return `${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })}` + " " + sufix;

  }
  const tabsDisabled = () => {
    return isNotEmpty(varIdFuncion) ? false : true;
  }

  //0
  const tabContent_FuncionListPage = () => {
    return <FuncionListPage
      titulo={titulo}
      editarRegistro={editarRegistro}
      eliminarRegistro={eliminarRegistro}
      nuevoRegistro={nuevoRegistro}
      seleccionarRegistro={seleccionarRegistro}
      verRegistroDblClick={verRegistroDblClick}
      focusedRowKey={focusedRowKey}
      accessButton={accessButton}

      //Propiedades del customerDataGrid 
      uniqueId = {`ListarFuncionIndexPage${contratista === 'N' ? 'Mandante' : 'Contratista'}` }
      isFirstDataLoad={isFirstDataLoad}
      setIsFirstDataLoad={setIsFirstDataLoad}
      dataSource={dataSource}
      refresh={refresh}
      resetLoadOptions={resetLoadOptions}
      refreshData={refreshData}
      setRefreshData={setRefreshData}
    />

  }
  //1
  const tabContent_FuncionEditPage = () => {
    return <>
      <FuncionEditPage
        titulo={titulo}
        modoEdicion={modoEdicion}
        dataRowEditNew={dataRowEditNew}
        actualizarFuncion={actualizarFuncion}
        agregarFuncion={agregarFuncion}
        cancelarEdicion={cancelarEdicion}
        accessButton={accessButton}
        settingDataField={dataMenu.datos}
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
  //2
  const tabContent_PosicionesListPage = () => {
    return <>
      <PosicionListPage
        varIdFuncion={varIdFuncion}
        selected={selected}
        getInfo={getInfo}
        cancelarEdicion={cancelarEdicion}
        focusedRowKey={focusedRowKeyPosicion}
        setFocusedRowKey={setFocusedRowKeyPosicion}
        seleccionarRegistro={seleccionarRegistroPosicion}
        verRegistroDblClick={() => { }}
        accessButton={accessButton}
        settingDataField={dataMenu.datos}
        dataMenu={dataMenu}
        showButtons={false}

        uniqueId={"FuncionPosicionesListado"}
        isFirstDataLoad={isFirstDataLoad}
        setIsFirstDataLoad={setIsFirstDataLoad}
        dataSource={dataSource}
        refresh={refresh}
        resetLoadOptions={resetLoadOptions}
        refreshData={refreshData}
        setRefreshData={setRefreshData}
        filterData={filterData}
        setFilterData={setFilterData}
        showHeaderInformation={true}
        setIdPosicion={setVarIdPosicion}
        totalRowIndex = {totalRowIndex}
        setTotalRowIndex={setTotalRowIndex}
      //cancelarEdicion={props.cancelarEdicion}
      //filtroLocal={props.filtroLocal}
      />
    </>
  }

  return (
    <>
      <TabNavContainer
        title={intl.formatMessage({ id: "ADMINISTRATION.FUNCTION.MENU" })}
        submenu={contratista === 'N' ? intl.formatMessage({ id: "ADMINISTRATION.FUNCTION.SUBMENU" }) : `${intl.formatMessage({ id: "ADMINISTRATION.FUNCTION.SUBMENU" })}  /  ${intl.formatMessage({ id: "CONFIG.MENU.ADMINISTRACION.CONTRATISTAS_O_TERCEROS"})}`}
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
            label: `${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} `,
            icon: <ImportExportIcon fontSize="large" />,
            onClick: (e) => { obtenerFuncion(selected) },
            disabled: tabsDisabled()
          },
          {
            label: intl.formatMessage({ id: "ADMINISTRATION.POSITION.MAINTENANCE" }),
            icon: <ViewWeekIcon fontSize="large" />,
            disabled: !tabsDisabled() && accessButton.Tabs[2] ? false : true
          }
        ]}
        className={classes.tabContent}
        componentTabsBody={
          [
            tabContent_FuncionListPage(),
            tabContent_FuncionEditPage(),
            tabContent_PosicionesListPage()
          ]
        }
      />

      <Confirm
        message={intl.formatMessage({ id: "ALERT.REMOVE" })}
        isVisible={isVisible}
        setIsVisible={setIsVisible}
        setInstance={setInstance}
        onConfirm={() => eliminarRegistro(selected, true)}
        title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
        confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
        cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
      />

    </>
  );
};


//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <Portlet
      component="div"
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && <>{children}</>}
    </Portlet>
  );
}
TabPanel.propTypes =
{
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};
function tabPropsIndex(index) {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`,
  };
}
export default injectIntl(WithLoandingPanel(FuncionIndexPage));
