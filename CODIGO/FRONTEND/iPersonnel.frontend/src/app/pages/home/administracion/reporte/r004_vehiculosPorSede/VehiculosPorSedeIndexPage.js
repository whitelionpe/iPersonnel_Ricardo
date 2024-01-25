import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import { useStylesEncabezado } from "../../../../../store/config/Styles";
import { useSelector } from "react-redux";
// import { servicePersona } from "../../../../../api/administracion/persona.api";
import VehiculosPorSedeListPage from "./VehiculosPorSedeListPage";
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';

import {  isNotEmpty } from "../../../../../../_metronic";
import CustomBreadcrumbs from "../../../../../partials/layout/CustomBreadcrumbs";
import { Portlet } from "../../../../../partials/content/Portlet";
import { AppBar } from '@material-ui/core';
import { Typography } from "@material-ui/core";
import { Toolbar } from "@material-ui/core";


export const initialFilter = {
  Activo: 'S',
  IdCliente: '',
  IdDivision: '',
  Division: '',
 
};

const VehiculosPorSedeIndexPage = (props) => {
  const perfil = useSelector(state => state.perfil.perfilActual);
  const { intl, setLoading, dataMenu } = props;

  //const [varIdPersona, setVarIdPersona] = useState("");  
  //const [fotoPerfil, setFotoPerfil] = useState("");

  //FILTRO
  const [isFirstDataLoad, setIsFirstDataLoad] = useState(true);
  const [refreshData, setRefreshData] = useState(false);
  const ds = new DataSource({ store: new ArrayStore({ data: [], key: 'RowIndex' }), reshapeOnPush: false });
  const [dataSource] = useState(ds);

  const refresh = () => dataSource.refresh();
  const resetLoadOptions = () => dataSource.resetLoadOptions();
  const classesEncabezado = useStylesEncabezado();

  const [focusedRowKey, setFocusedRowKey] = useState();
  //++++++++Variable (totalRowIndex) para controlar bloqueo de tabs cuando se cambia de búsqueda de un registro en la grilla.++++++++++++++
  const [totalRowIndex, setTotalRowIndex] = useState(0);


  const seleccionarRegistro = dataRow => {
    const { RowIndex } = dataRow;
    setFocusedRowKey(RowIndex);
  };


  useEffect(() => {
    setRefreshData(true);
    initialFilter.IdDivision = perfil.IdDivision;
    initialFilter.Division = perfil.Division;
    
  }, []);



  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  return <>
    {/* <input type="hidden" value={varIdPersona} id="hidIdPersona" name="hidIdPersona" />
    <input type="hidden" value={fotoPerfil} id="hidIdPersona" name="hidFotoPerfil" /> */}


    <CustomBreadcrumbs
      Title={intl.formatMessage({ id: "ADMINISTRATION.PERSON.MENU" })}
      SubMenu={intl.formatMessage({ id: "ACCESS.REPORT.SUBMENU" })}
      Subtitle={intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })}
    />

    <Portlet>
      <AppBar position="static" className={classesEncabezado.principal}>
        <Toolbar variant="dense" className={classesEncabezado.toolbar}>
          <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
            {intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })}
          </Typography>
        </Toolbar>
      </AppBar>

      <VehiculosPorSedeListPage
        seleccionarRegistro={seleccionarRegistro}
        isFirstDataLoad={isFirstDataLoad}
        setIsFirstDataLoad={setIsFirstDataLoad}
        dataSource={dataSource}
        refresh={refresh}
        resetLoadOptions={resetLoadOptions}
        refreshData={refreshData}
        focusedRowKey={focusedRowKey}
        setFocusedRowKey={setFocusedRowKey}
        setRefreshData={setRefreshData}
        totalRowIndex={totalRowIndex}
        setTotalRowIndex={setTotalRowIndex}
      />

    </Portlet>


  </>
};

export default injectIntl(WithLoandingPanel(VehiculosPorSedeIndexPage));
