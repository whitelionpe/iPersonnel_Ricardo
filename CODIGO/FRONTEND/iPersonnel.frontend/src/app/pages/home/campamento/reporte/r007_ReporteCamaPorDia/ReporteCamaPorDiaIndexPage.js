import React, { useState } from "react";
import { injectIntl } from "react-intl";
import { AppBar } from "@material-ui/core";
import { Toolbar } from "@material-ui/core";
import { Typography } from "@material-ui/core";
// import { handleErrorMessages } from "../../../../store/ducks/notify-messages";
// import { isNotEmpty } from "../../../../../_metronic";
import { Portlet } from "../../../../../partials/content/Portlet";
import { useStylesEncabezado } from "../../../../../store/config/Styles";
import CustomBreadcrumbs from "../../../../../partials/layout/CustomBreadcrumbs";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
// import CamasDisponiblesPage from './CamasDisponiblesPage';
import { isNotEmpty } from '../../../../../../_metronic/utils/utils';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import ReporteCamaPorDiaListPage from "./ReporteCamaPorDiaListPage";
import ReporteCamaPorDiaFilterPage from "./ReporteCamaPorDiaFilterPage";
import { useSelector } from "react-redux";
import { handleErrorMessages, handleSuccessMessages } from "../../../../../store/ducks/notify-messages";
import { exportarExcelCamasPorDia } from "../../../../../api/campamento/reporte.api";


export const initialFilter = {
  IdCliente: '',
  IdDivision: '',
  Fecha: '',
  IdCampamento: '',
  IdTipoModulo: '',
  IdModulo: '',
  IdHabitacion: '',
  Inactivas: false
};


const ReporteCamaPorDiaIndexPage = (props) => {

  const { intl, setLoading, dataMenu } = props;
  const classesEncabezado = useStylesEncabezado();
  //const [dataRowEditNew, setDataRowEditNew] = useState({ esNuevoRegistro: true, conCamas: 0 });
  const Fecha = new Date();
  const perfil = useSelector((state) => state.perfil.perfilActual);

  //FILTRO
  const [isFirstDataLoad, setIsFirstDataLoad] = useState(true);
  const [refreshData, setRefreshData] = useState(false);
  const ds = new DataSource({ store: new ArrayStore({ data: [], key: 'RowIndex' }), reshapeOnPush: false });
  const [dataSource] = useState(ds);

  const refresh = () => dataSource.refresh();
  const resetLoadOptions = () => dataSource.resetLoadOptions();
  const [dataGridRef, setDataGridRef] = useState(null);

  const [dataRowEditNew, setDataRowEditNew] = useState({
    esNuevoRegistro: true,
    IdDivision: perfil.IdDivision,
    Fecha,
    Inactivas: false
  });

  const filtrarReporte = (filtro) => {
    const {
      IdDivision,
      Fecha,
      IdCampamento,
      IdTipoModulo,
      IdModulo,
      IdHabitacion,
      Inactivas
    } = filtro;
    //comunicarnos con customerDataGrid.
    dataSource.loadDataWithFilter({
      data: {
        IdDivision,
        Fecha,
        IdCampamento,
        IdTipoModulo,
        IdModulo,
        IdHabitacion,
        Inactivas
      }
    });
  };

  const clearDataGrid = () => {
    resetLoadOptions();
  };

  const exportReport = async () => {
    let result = JSON.parse(localStorage.getItem('vcg:camaPorDiaList:loadOptions'));
    if (!isNotEmpty(result)) return;
    let filterExport = {
      IdDivision: isNotEmpty(perfil.IdDivision) ? perfil.IdDivision : ""
    }
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

    // Decompilando filterData
    const { IdDivision, Fecha, IdCampamento, IdTipoModulo, IdModulo, IdHabitacion, Inactivas } = filterExport
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
      let ArrayColumnHeader = ListColumnName.join('|');
      let ArrayColumnId = ListDataField.join('|');
      //var Order = NombreCompleto();

      let params = {
        IdDivision,
        Fecha,
        IdCampamento: isNotEmpty(IdCampamento) ? IdCampamento : "",
        IdTipoModulo: isNotEmpty(IdTipoModulo) ? IdTipoModulo : "",
        IdModulo: isNotEmpty(IdModulo) ? IdModulo : "",
        IdHabitacion: isNotEmpty(IdHabitacion) ? IdHabitacion : "",
        Inactivas: Inactivas ? 'S' : 'N',
        TituloHoja: intl.formatMessage({ id: "COMMON.REPORT" }) + ' ' + intl.formatMessage({ id: "CONFIG.MENU.COMEDORES.CONSUMO_DE_COMEDORES" }),
        NombreHoja: intl.formatMessage({ id: "CONFIG.MENU.COMEDORES.CONSUMO_DE_COMEDORES" }),
        ArrayColumnHeader,
        ArrayColumnId,
        OrderField: selector
      };
      setLoading(true);
      await exportarExcelCamasPorDia(params).then(response => {
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
  };

  return (
    <>
      <a id="iddescarga" className="" ></a>
      <CustomBreadcrumbs
        Title={intl.formatMessage({ id: "CONFIG.MODULE.CAMPAMENTOS" })}
        SubMenu={intl.formatMessage({ id: "ACCESS.REPORT.SUBMENU" })}
        Subtitle={intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })}
      />
      <Portlet>
        <AppBar position="static" className={classesEncabezado.principal}>
          <Toolbar variant="dense" className={classesEncabezado.toolbar}>
            <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
              {intl.formatMessage({ id: "CONFIG.MENU.COMEDORES.REPORTE" }) + ' - ' + intl.formatMessage({ id: "CONFIG.MENU.HOTELERÍA.USO_DE_CAMA_POR_DIA" })}
            </Typography>
          </Toolbar>
        </AppBar>
        <ReporteCamaPorDiaFilterPage
          dataRowEditNew={dataRowEditNew}
          setDataRowEditNew={setDataRowEditNew}
          filtrarReporte={filtrarReporte}
          clearDataGrid={clearDataGrid}
          exportReport={exportReport}
          dataGridRef={dataGridRef}
        />
        <ReporteCamaPorDiaListPage
          uniqueId={"camaPorDiaList"}
          isFirstDataLoad={isFirstDataLoad}
          setIsFirstDataLoad={setIsFirstDataLoad}
          dataSource={dataSource}
          refresh={refresh}
          resetLoadOptions={resetLoadOptions}
          refreshData={refreshData}
          setRefreshData={setRefreshData}
          dataRowEditNew={dataRowEditNew}
          setDataRowEditNew={setDataRowEditNew}
          setDataGridRef={setDataGridRef}
        />
      </Portlet>
    </>
  );
};


export default injectIntl(WithLoandingPanel(ReporteCamaPorDiaIndexPage));
