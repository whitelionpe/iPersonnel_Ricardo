import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";
import { isNotEmpty } from "../../../../../_metronic";
import { confirmAction, handleErrorMessages, handleSuccessMessages } from "../../../../store/ducks/notify-messages";
import { useStylesTab } from "../../../../store/config/Styles";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import { getButtonPermissions, defaultPermissions, setDisabledTabs } from '../../../../../_metronic/utils/securityUtils'
import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import DirectionsBus from '@material-ui/icons/DirectionsBus';
import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";
import { service } from "../../../../api/transporte/paradero.api";
import ParaderoListPage from "./ParaderoListPage";
import ParaderoEditPage from "./ParaderoEditPage";
import TabNavContainer from "../../../../partials/components/Tabs/TabNavContainer";
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';

export const initialFilter = {
  IdParadero:'',
  Paradero:'',
  Activo: '',
};


const ParaderoIndexPage = (props) => {
  const { intl, setLoading, dataMenu } = props;
  const usuario = useSelector(state => state.auth.user);
  const classes = useStylesTab();

  const [listarTabs, setListarTabs] = useState([]);
  const [varIdParadero, setVarIdParadero] = useState("");
  const [focusedRowKey, setFocusedRowKey] = useState();

  const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const [selected, setSelected] = useState({});
  const [tabIndex, setTabIndex] = useState(0);
  const handleChange = (event, newValue) => { setTabIndex(newValue); };

      //++++++++Variable (totalRowIndex) para controlar bloqueo de tabs cuando se cambia de búsqueda de un registro en la grilla.++++++++++++++
      const [totalRowIndex, setTotalRowIndex] = useState(0);
      //::::::::::::::::::::: FILTRO ::::::::::::::::::::::::::::::::
      const [isFirstDataLoad, setIsFirstDataLoad] = useState(true);
      const [refreshData, setRefreshData] = useState(false);
      const ds = new DataSource({ store: new ArrayStore({ data: [], key: 'RowIndex' }), reshapeOnPush: false });
      const [dataSource] = useState(ds);
    
      const refresh = () => dataSource.refresh();
      const resetLoadOptions = () => dataSource.resetLoadOptions();

     //:::::::::::::::::::::  ::::::::::::::::::::::::::::::::

  //::::::::::::::::::::::::::::::: Función Paradero ::::::::::::::::::::::::::::::::::::::::::::::::

  async function agregarParadero(dataRow) {
    setLoading(true);
    const { IdParadero, Paradero, Activo } = dataRow;
    let params = {
      IdParadero: isNotEmpty(IdParadero) ? IdParadero.toUpperCase() : "",
      Paradero: isNotEmpty(Paradero) ? Paradero.toUpperCase() : "",
      Activo: Activo,
      IdUsuario: usuario.username
    };
    await service.crear(params)
      .then(response => {
        if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
        setModoEdicion(false);
        listarParadero();
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
      }).finally(() => { setLoading(false); });
  }

  async function actualizarParadero(dataRow) {
    setLoading(true);
    const { IdParadero, Paradero, Activo } = dataRow;
    let params = {
      IdParadero: IdParadero.toUpperCase(),
      Paradero: Paradero.toUpperCase(),
      Activo: Activo,
      IdUsuario: usuario.username
    };
    await service.actualizar(params)
      .then(() => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
        setModoEdicion(false);
        listarParadero();
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
      }).finally(() => { setLoading(false); });
  }

  async function eliminarRegistro() {
    var response = await confirmAction(intl.formatMessage({ id: "ALERT.REMOVE" }),intl.formatMessage({ id: "COMMON.YES" }),intl.formatMessage({ id: "COMMON.NOT" }));
    if(response.isConfirmed){
      setLoading(true);
      const { IdParadero} = selected;
      await service.eliminar({
        IdParadero: IdParadero
      })
        .then(response => {
          handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
          setVarIdParadero("");
          setFocusedRowKey();
        })
        .catch(err => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
        }).finally(() => { setLoading(false); });
      listarParadero();
    }

  }


  async function listarParadero() {
    setRefreshData(true);
    changeTabIndex(0);
  }

  async function obtenerParadero() {
    setLoading(true);
    const { IdParadero } = selected;
    await service.obtener({
      IdParadero
    }).then(Paradero => {
      setDataRowEditNew({ ...Paradero, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });

  }

  const nuevoRegistro = () => {
    changeTabIndex(1);
    let Paradero = { Activo: "S", IdParadero: intl.formatMessage({ id: "COMMON.CODE.AUTO" }).toUpperCase() };
    setDataRowEditNew({ ...Paradero, esNuevoRegistro: true });
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
    setVarIdParadero("");
  };

  const editarRegistro = dataRow => {
    changeTabIndex(1);
    setModoEdicion(true);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    obtenerParadero(dataRow);
  };

  const cancelarEdicion = () => {
    changeTabIndex(0);
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
    setDataRowEditNew({});
  };


  const seleccionarRegistro = dataRow => {
    const { IdParadero, RowIndex } = dataRow;
    setModoEdicion(false);
    setSelected(dataRow);
    setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
    setVarIdParadero(IdParadero);
    setFocusedRowKey(RowIndex);
    
  };

  const verRegistroDblClick = async (dataRow) => {
    changeTabIndex(1);
    setModoEdicion(false);
    await obtenerParadero(dataRow);
  };

  //Botones
  const [accessButton, setAccessButton] = useState(defaultPermissions);

  const loadControlsPermission = () => {
    const numeroTabs = 3;
    let buttonsPermissions = getButtonPermissions(dataMenu.objetos);
    let newTabs = setDisabledTabs(dataMenu.objetos, numeroTabs);
    setAccessButton({ ...accessButton, ...buttonsPermissions, Tabs: newTabs });
  }

  const changeTabIndex = (index) => {
    handleChange(null, index);
  }

  useEffect(() => {
    listarParadero();
    loadControlsPermission();
  }, []);


  //:::::::::::::::::::::::::::::::::::::::::::::-Configuración de tabs-:::::::::::::::::::::::::::::::::
  const titleHeaderToolbar = () => {
    let tabsTitles = [
      "",
      "",
    ];

    let sufix = tabsTitles[tabIndex] !== "" ? (" - " + `${intl.formatMessage({ id: tabsTitles[tabIndex] })}`) : "";

    return `${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} ` + " " + sufix;
  }
  const tabsDisabled = () => {
    return isNotEmpty(varIdParadero) ? true : false;

  }

  const tabContent_ParaderoListPage = () => {
    return <ParaderoListPage
    editarRegistro={editarRegistro}
    eliminarRegistro={eliminarRegistro}
    nuevoRegistro={nuevoRegistro}
    seleccionarRegistro={seleccionarRegistro}
    verRegistroDblClick={verRegistroDblClick}
    focusedRowKey={focusedRowKey}
    setFocusedRowKey={setFocusedRowKey}
    //--------------------------------------
    isFirstDataLoad={isFirstDataLoad}
    setIsFirstDataLoad={setIsFirstDataLoad}
    dataSource={dataSource}
    refresh={refresh}
    resetLoadOptions={resetLoadOptions}
    refreshData={refreshData}
    setRefreshData={setRefreshData}
    showButtons={true}
     setVarIdParadero={setVarIdParadero}
     totalRowIndex = {totalRowIndex}
     setTotalRowIndex={setTotalRowIndex}
  />
//   <ParaderoListPage
//   paraderos = {listarTabs}
//   titulo={titulo}
//   editarRegistro={editarRegistro}
//   eliminarRegistro={eliminarRegistro}
//   nuevoRegistro={nuevoRegistro}
//   seleccionarRegistro={seleccionarRegistro}
//   verRegistroDblClick={verRegistroDblClick}
//   focusedRowKey={focusedRowKey}
//   accessButton={accessButton}
// />
  }

  const tabContent_ParaderoEditTabPage = () => {
    return <>
      <ParaderoEditPage
        titulo={titulo}
        modoEdicion={modoEdicion}
        dataRowEditNew={dataRowEditNew}
        actualizarParadero={actualizarParadero}
        agregarParadero={agregarParadero}
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

  return (
    <>
      <TabNavContainer
        title={intl.formatMessage({ id: "TRANSPORT.MAIN" })}
        submenu={intl.formatMessage({ id: "CONFIG.MENU.TRANSPORTE.CONFIGURACIÓN" })}
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
            label: intl.formatMessage({ id: "TRANSPORTE.WHEREABOUTS" }),
            icon: <DirectionsBus fontSize="large" />,
            onClick: (e) => { obtenerParadero(selected) },
            disabled: !tabsDisabled()
          }
        ]}
        className={classes.tabContent}
        componentTabsBody={
          [
            tabContent_ParaderoListPage(),
            tabContent_ParaderoEditTabPage()
          ]
        }
      />


    </>
  );
};

export default injectIntl(WithLoandingPanel(ParaderoIndexPage));
