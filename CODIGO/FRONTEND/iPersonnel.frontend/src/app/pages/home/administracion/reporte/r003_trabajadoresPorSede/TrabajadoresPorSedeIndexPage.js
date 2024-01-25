import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import { useStylesEncabezado } from "../../../../../store/config/Styles";
import { useSelector } from "react-redux";
import { servicePersona } from "../../../../../api/administracion/persona.api";
import TrabajadoresPorSedeListPage from "./TrabajadoresPorSedeListPage";
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';

import { TYPE_SISTEMA_ENTIDAD, isNotEmpty } from "../../../../../../_metronic";
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
  Condicion: 'TRABAJADOR',
  IdCaracteristica: '',
  IdCaracteristicaDetalle: '',
};

const TrabajadoresPorSedeIndexPage = (props) => {
  const perfil = useSelector(state => state.perfil.perfilActual);
  const { intl, setLoading, dataMenu } = props;
  const [varIdPersona, setVarIdPersona] = useState("");
  const [dataCombos, setDataCombos] = useState([]);

  const [fotoPerfil, setFotoPerfil] = useState("");

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



  async function listadoPersonas() {
    setRefreshData(true);
  }


  const seleccionarRegistro = dataRow => {
    const { RowIndex } = dataRow;
    setFocusedRowKey(RowIndex);
  };


  useEffect(() => {
    cargarCombos();
    setRefreshData(true);
    initialFilter.IdDivision = perfil.IdDivision;
    initialFilter.Division = perfil.Division;
    initialFilter.IdDivisionPerfil = perfil.IdDivision;
    //listadoPersonas();
  }, []);



  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  return <>
    <input type="hidden" value={varIdPersona} id="hidIdPersona" name="hidIdPersona" />
    <input type="hidden" value={fotoPerfil} id="hidIdPersona" name="hidFotoPerfil" />


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

      <TrabajadoresPorSedeListPage
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

export default injectIntl(WithLoandingPanel(TrabajadoresPorSedeIndexPage));
