import React, { useState } from "react";
import { injectIntl } from "react-intl";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import { useStylesEncabezado, useStylesTab } from "../../../../../store/config/Styles";
import { useSelector } from "react-redux";
import ControlSwitch from "../../../../../store/ducks/componente/componenteSwitch";
import AuditoriaComedorListPage from './../r003_AuditoriaComedor/AuditoriaComedorListPage';

import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import {  defaultPermissions} from '../../../../../../_metronic/utils/securityUtils'
import TabNavContainer from "../../../../../partials/components/Tabs/TabNavContainer";

export const filterAudiroriaComedorMarcas = {
  IdCliente: '',
  IdDivision: '',
  FechaInicio: new Date((new Date()).getFullYear(), (new Date()).getMonth(), 1),
  FechaFin: new Date((new Date()).getFullYear(), (new Date()).getMonth(), (new Date()).getDate() + 26)
};


const PersonaIndexPage = (props) => {
  const { intl, setLoading, dataMenu } = props;
  const usuario = useSelector(state => state.auth.user);
  const perfil = useSelector(state => state.perfil.perfilActual);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
  const classesEncabezado = useStylesEncabezado();
  const classes = useStylesTab();
  const [tabIndex, setTabIndex] = useState(0);
  const [listarTabs, setListarTabs] = useState([]);

  const handleChange = (event, newValue) => {
    //Estado cambio de tabs
    setTabIndex(newValue);
  };
  const [listarCabeceraMarcacion, setListarCabeceraMarcacion] = useState([]);
  //FILTRO
  const [isFirstDataLoad, setIsFirstDataLoad] = useState(true);
  const [refreshData, setRefreshData] = useState(false);
  const ds = new DataSource({ store: new ArrayStore({ data: [], key: 'RowIndex' }), reshapeOnPush: false });
  const [dataSource] = useState(ds);

  const refresh = () => dataSource.refresh();
  const resetLoadOptions = () => dataSource.resetLoadOptions();

  /*********************************************************** */
  const [accessButton, setAccessButton] = useState(defaultPermissions);



  const tabContent_MarcacionListPage = () => {
    return <>
      {!modoEdicion && (
        <>
          <AuditoriaComedorListPage
            personaMarcacionData={listarTabs}
            columnas={listarCabeceraMarcacion}
            accessButton={accessButton}
            isFirstDataLoad={isFirstDataLoad}
            setIsFirstDataLoad={setIsFirstDataLoad}
            dataSource={dataSource}
            refresh={refresh}
            resetLoadOptions={resetLoadOptions}
            refreshData={refreshData}
            setRefreshData={setRefreshData}
            uniqueId={"AudoriaComedorIndex"}

          />

        </>
      )}

    </>
  }

  //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  return (
    <>
      <TabNavContainer
        title={intl.formatMessage({ id: "CASINO.PERSON.GROUP.MENU" })}
        submenu={intl.formatMessage({ id: "CONFIG.MENU.COMEDORES.AUDITORIA_COMEDOR" })}
        nombrebarra={intl.formatMessage({ id: "CONFIG.MENU.COMEDORES.AUDITORIA_COMEDOR" })}
        tabIndex={tabIndex}
        handleChange={handleChange}
        className={classes.tabContent}
        componentTabsBody={
          [
            tabContent_MarcacionListPage()
          ]
        }
      />


    </>
  );
};



export default injectIntl(WithLoandingPanel(PersonaIndexPage));
