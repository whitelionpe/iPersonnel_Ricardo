import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";

import PropTypes from 'prop-types';
import { isNotEmpty, dateFormat } from "../../../../../_metronic";
import { Portlet } from "../../../../partials/content/Portlet";
import { handleErrorMessages, handleSuccessMessages } from "../../../../store/ducks/notify-messages";
import { useStylesEncabezado, useStylesTab } from "../../../../store/config/Styles";
import CustomBreadcrumbs from "../../../../partials/layout/CustomBreadcrumbs";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import Confirm from "../../../../partials/components/Confirm";
import { getButtonPermissions, defaultPermissions } from '../../../../../_metronic/utils/securityUtils'

import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import BusinessIcon from '@material-ui/icons/Business';
import GroupWorkSharp from '@material-ui/icons/GroupWorkSharp';

import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";

import CompaniaGrupoListPage from "./CompaniaGrupoListPage";
import CompaniaGrupoEditPage from "./CompaniaGrupoEditPage";

import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import TabNavContainer from "../../../../partials/components/Tabs/TabNavContainer";

import {
   obtener
} from "../../../../api/administracion/compania.api";

import CompaniaGrupoIndexPage from "./grupo/CompaniaGrupoIndexPage";

export const initialFilter = {
  Activo: 'S',
  IdCliente: '1',
  ControlarAsistencia: ''
};

const CompaniaGrupoIndex = (props) => {
  const { intl, setLoading, dataMenu } = props;
  const usuario = useSelector(state => state.auth.user);
  const { IdCliente, IdDivision } = useSelector(state => state.perfil.perfilActual);

  const classes = useStylesTab();

  const [varIdCompania, setVarIdCompania] = useState("");
  const [focusedRowKey, setFocusedRowKey] = useState();
  const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const [selected, setSelected] = useState({ IdCliente: IdCliente, IdDivision: IdDivision });
  const [tabIndex, setTabIndex] = useState(0);
  const handleChange = (event, newValue) => { setTabIndex(newValue); };

  const [isVisible, setIsVisible] = useState(false);
  const [instance, setInstance] = useState({});
  const [selectedDelete, setSelectedDelete] = useState({});
  const [listarTabs, setListarTabs] = useState([]);
  //++++++++Variable (totalRowIndex) para controlar bloqueo de tabs cuando se cambia de búsqueda de un registro en la grilla.++++++++++++++
  const [totalRowIndex, setTotalRowIndex] = useState(0);
  //: FILTRO  :::::::::::::::::::::::::::::::::::::::::::::

  const [isFirstDataLoad, setIsFirstDataLoad] = useState(true);
  const [refreshData, setRefreshData] = useState(false);
  const ds = new DataSource({ store: new ArrayStore({ data: [], key: 'RowIndex' }), reshapeOnPush: false });
  const [dataSource] = useState(ds);

  const refresh = () => dataSource.refresh();
  const resetLoadOptions = () => dataSource.resetLoadOptions();

  //:::::::::::::::::::: CONFIG TABS :::::::::::::::::::::::::::::::::::

  const titleHeaderToolbar = () => {
    let tabsTitles = [
      "",
      "",
      "CASINO.PERSON.GROUP.GROUP"
    ];

    let sufix = tabsTitles[tabIndex] !== "" ? (" - " + `${intl.formatMessage({ id: tabsTitles[tabIndex] })}`) : "";

    return `${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} ` + " " + sufix;
  }

  const tabsDisabled = () => {
    return isNotEmpty(varIdCompania) ? false : true;
  }

  //:::::::::::::::::::: FUNCIÓN COMPANIA :::::::::::::::::::::::::::::::::::

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

 
  /************--Configuración de acceso de botones*************/
  const [accessButton, setAccessButton] = useState(defaultPermissions);

  const loadControlsPermission = () => {
    let buttonsPermissions = getButtonPermissions(dataMenu.objetos);
    setAccessButton({ ...accessButton, ...buttonsPermissions });
  }
  /***********************************************************************/

  useEffect(() => {
    loadControlsPermission();
  }, []);

  //::::::::::::::::::::::::::::::::::::::::::::::::: Datos Principales ::::::::::::::::::::::::::::::::::::::::::::::::::::::

  const getInfo = () => {

    const { IdCompania, Compania } = selected;
    return [

      { text: [intl.formatMessage({ id: "COMMON.CODE" })], value: IdCompania, colSpan: 2 },
      { text: [intl.formatMessage({ id: "ADMINISTRATION.PERSON.COMPANY" })], value: Compania, colSpan: 4 }

    ];
  }

  const changeTabIndex = (index) => {
    handleChange(null, index);
  }

  async function eliminarListRowTab(rowData, confirm) {
    let currentTab = tabIndex;
    switch (currentTab) {
    
    }
  }

  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::-Configuración - Tabs::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::


  const tabContent_CompaniaGrupoListPage = () => {
    return <>
      <CompaniaGrupoListPage
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
        varIdCompania = {varIdCompania}
        setVarIdCompania={setVarIdCompania}
        totalRowIndex = {totalRowIndex}
        setTotalRowIndex={setTotalRowIndex}

      //::::::::::::::::::::::::::::::::::::::::
      />
    </>

  }

  const tabContent_CompaniaGrupoEditPage = () => {
    return <>
      <CompaniaGrupoEditPage
        titulo={titulo}
        modoEdicion={modoEdicion}
        dataRowEditNew={dataRowEditNew}
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

  const tabContent_CompaniaGrupo = () => {
    return <>

     <CompaniaGrupoIndexPage
      varIdCompania={varIdCompania}
      cancelarEdicion={cancelarEdicion}
      getInfo={getInfo}
      accessButton={accessButton}
      settingDataField={dataMenu.datos}
     />

    </>
  }



  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  return <>
    <input type="hidden" value={varIdCompania} id="hIdCompania" name="hidIdPersona" />

    <TabNavContainer
      title={intl.formatMessage({ id: "CASINO.PERSON.GROUP.MENU" })}
      submenu={intl.formatMessage({ id: "CONFIG.MENU.COMEDORES.GESTIÓN_COMEDORES" })}
      subtitle={ `${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} ` }
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
          label: intl.formatMessage({ id: "ADMINISTRATION.COMPANY.COMPANY" }),
          icon: <BusinessIcon fontSize="large" />,
          onClick: () => { obtenerCompania() },
          disabled: !tabsDisabled() && accessButton.Tabs[1] ? false : true
        },
        {
          label: intl.formatMessage({ id: "CASINO.PERSON.GROUP.GROUP" }),
          icon: <GroupWorkSharp fontSize="large" />,
          disabled: !tabsDisabled() && accessButton.Tabs[2] ? false : true
        },

      ]}
      className={classes.tabContent}
      componentTabsBody={
        [
          tabContent_CompaniaGrupoListPage(),
          tabContent_CompaniaGrupoEditPage(),
          tabContent_CompaniaGrupo(),
        ]
      }

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

};

export default injectIntl(WithLoandingPanel(CompaniaGrupoIndex));
