import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import { useStylesEncabezado } from "../../../../../store/config/Styles";
import { useSelector } from "react-redux";
import { servicePersona } from "../../../../../api/administracion/persona.api";
import ReporteSolicitudesHabitacionListPage from "./ReporteSolicitudesHabitacionListPage";
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';

import { TYPE_SISTEMA_ENTIDAD, isNotEmpty, getStartAndEndOfMonthByDay, dateFormat } from "../../../../../../_metronic";
import CustomBreadcrumbs from "../../../../../partials/layout/CustomBreadcrumbs";
import { Portlet } from "../../../../../partials/content/Portlet";
import { AppBar } from '@material-ui/core';
import { Typography } from "@material-ui/core";
import { Toolbar } from "@material-ui/core";
import ReporteSolicitudesHabitacionFilterPage from "./ReporteSolicitudesHabitacionFilterPage";
import { handleErrorMessages, handleSuccessMessages } from "../../../../../store/ducks/notify-messages";
import { service } from '../../../../../api/campamento/reporte.api';

export const initialFilter = {
  Activo: 'S',
  IdCliente: '',
  IdDivision: '',
  Division: '',
  Condicion: 'TRABAJADOR'
};

const ReporteSolicitudesHabitacionIndexPage = (props) => {
  const { IdCliente, IdDivision } = useSelector(state => state.perfil.perfilActual);
  const { intl, setLoading, dataMenu } = props;
  const [varIdPersona, setVarIdPersona] = useState("");
  const [dataCombos, setDataCombos] = useState([]);
  const { FechaInicio, FechaFin } = getStartAndEndOfMonthByDay();
  const [fotoPerfil, setFotoPerfil] = useState("");
  const [dataRowEditNew, setDataRowEditNew] = useState({
    esNuevoRegistro: true,
    FechaInicio,
    FechaFin
  });
  //FILTRO
  const [isFirstDataLoad, setIsFirstDataLoad] = useState(true);
  const [refreshData, setRefreshData] = useState(false);
  const ds = new DataSource({ store: new ArrayStore({ data: [], key: 'RowIndex' }), reshapeOnPush: false });
  const [dataSource] = useState(ds);
  const [dataGridRef, setDataGridRef] = useState(null);
  const refresh = () => dataSource.refresh();
  const resetLoadOptions = () => dataSource.resetLoadOptions();
  const classesEncabezado = useStylesEncabezado();

  const [focusedRowKey, setFocusedRowKey] = useState();
  //++++++++Variable (totalRowIndex) para controlar bloqueo de tabs cuando se cambia de búsqueda de un registro en la grilla.++++++++++++++
  const [totalRowIndex, setTotalRowIndex] = useState(0);

  const filtrarReporte = (filtro) => {
    console.log(filtro);
    const {
      IdCompaniaContratista,
      CompaniaContratista,
      FechaInicio,
      FechaFin,
      EstadoSolicitud
    } = filtro;
    //comunicarnos con customerDataGrid.
    dataSource.loadDataWithFilter({
      data: {
        IdCliente,
        IdDivision,
        IdCompaniaContratista,
        CompaniaContratista,
        FechaInicio,
        FechaFin,
        EstadoSolicitud
      }
    });
  };

  const seleccionarRegistro = dataRow => {
    const { RowIndex } = dataRow;
    setFocusedRowKey(RowIndex);
  };


  useEffect(() => {
    setRefreshData(true);
  }, []);

  const clearDataGrid = () => {
    resetLoadOptions();
  };

  const exportReport = async () => {
    let result = JSON.parse(localStorage.getItem('vcg:r004SolicitudesHabitacionList:loadOptions'));
    if (!isNotEmpty(result)) return;
    let filterExport = {
      IdCliente,
      IdDivision: isNotEmpty(IdDivision) ? IdDivision : ""
    };
    // Recorremos los filtros usados:
    for (let i = 0; i < result.filter.length; i++) {
      let currentValue = result.filter[i];

      // Filtramos solo los Array
      if (currentValue instanceof Array) {

        // Recorremos cada uno de los filtros en el array
        for (let j = 0; j < currentValue.length; j++) {

          //Llenamos filterData para decompilarlo en el siguente punto.
          filterExport[currentValue[0]] = currentValue[2];
        }
      }
    }
    //obtener orden para exportar
    const { selector } = result.sort[0];
    console.log('filterExport', filterExport);

    // Decompilando filterData
    const { IdCompaniaContratista, CompaniaContratista, EstadoSolicitud,
      FechaInicio, FechaFin } = filterExport;

    if (dataGridRef.current.props.dataSource._items.length > 0) {

      let ListColumnName = [];
      let ListDataField = [];

      dataGridRef.current._optionsManager._currentConfig.configCollections.columns.map(item => {
        if ((item.options.visible === undefined || item.options.visible === true) && item.options.type != 'buttons') {
          ListColumnName.push(item.options.caption.toUpperCase());
          ListDataField.push(item.options.dataField);
        }
      })
      //Obtener dataGrid titulo columnas + idColumnas para exportar de forma dinamica.
      var ArrayColumnHeader = ListColumnName.join('|');
      var ArrayColumnId = ListDataField.join('|');

      let params = {
        IdCliente: IdCliente,
        IdDivision: IdDivision,
        IdCompaniaContratista: isNotEmpty(IdCompaniaContratista) ? IdCompaniaContratista : "",
        CompaniaContratista: isNotEmpty(CompaniaContratista) ? CompaniaContratista : "",
        EstadoSolicitud: isNotEmpty(EstadoSolicitud) ? EstadoSolicitud : "",
        FechaInicio: isNotEmpty(FechaInicio) ? FechaInicio : "",
        FechaFin: isNotEmpty(FechaFin) ? FechaFin : "",
        TituloHoja: intl.formatMessage({ id: "CONFIG.MENU.HOTELERÍA.SOLICITUDES_DE_HABITACI" }),
        NombreHoja: intl.formatMessage({ id: "CONFIG.MENU.HOTELERÍA.SOLICITUDES_DE_HABITACI" }),
        ArrayColumnHeader,
        ArrayColumnId,
        OrderField: selector
      };
      setLoading(true);
      await service.reporteSolicitudesHabitacionIndexPage(params).then(response => {
        //result = response;      
        if (isNotEmpty(response.fileBase64)) {
          let download = document.getElementById('iddescarga');
          download.href = `data:application/vnd.ms-excel;base64,${encodeURIComponent(response.fileBase64)}`;
          download.download = response.fileName;
          download.click();
          handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.DOWNLOAD.SUCESS" }));
        }

      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => {
        setLoading(false);
      });

    }

  }

  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  return <>
    <input type="hidden" value={varIdPersona} id="hidIdPersona" name="hidIdPersona" />
    <input type="hidden" value={fotoPerfil} id="hidIdPersona" name="hidFotoPerfil" />


    <CustomBreadcrumbs
      Title={intl.formatMessage({ id:  "CONFIG.MODULE.CAMPAMENTOS" })}
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
      <ReporteSolicitudesHabitacionFilterPage
        dataRowEditNew={dataRowEditNew}
        setDataRowEditNew={setDataRowEditNew}
        filtrarReporte={filtrarReporte}
        clearDataGrid={clearDataGrid}
        exportReport={exportReport}
        dataGridRef={dataGridRef}
      />
      <ReporteSolicitudesHabitacionListPage
        seleccionarRegistro={seleccionarRegistro}
        isFirstDataLoad={isFirstDataLoad}
        setIsFirstDataLoad={setIsFirstDataLoad}
        setDataGridRef={setDataGridRef}
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

export default injectIntl(WithLoandingPanel(ReporteSolicitudesHabitacionIndexPage));
