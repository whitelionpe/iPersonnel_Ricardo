import React, { useState } from "react";
import { injectIntl } from "react-intl";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { Portlet } from "../../../../../partials/content/Portlet";
import { useStylesEncabezado, useStylesTab } from "../../../../../store/config/Styles";
import CustomBreadcrumbs from "../../../../../partials/layout/CustomBreadcrumbs";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import TabPanel from "../../../../../partials/content/TabPanel";
import { getDateOfDay } from '../../../../../../_metronic/utils/utils';
import { useSelector } from "react-redux";
import { handleErrorMessages, handleSuccessMessages } from "../../../../../store/ducks/notify-messages";

import ReporteRequisitoFilterPage from "./ReporteRequisitoFilterPage";
import { isNotEmpty, dateFormat } from "../../../../../../_metronic";

import ReporteRequisitoListPage from "./ReporteRequisitoListPage";
import { exportarReporteRequisito } from "../../../../../api/acceso/reporte.api"

import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';

export const initialFilter = {
  IdCliente: '',
  IdDivision: '',
  IdCompania: '',
  IdUnidadOrganizativa: '',
  TipoReporte: 'P',
  FechaInicio: ''
};

const ReporteRequisitoIndexPage = (props) => {

  const { intl, setLoading, dataMenu } = props;
  const classesEncabezado = useStylesEncabezado();
  const classes = useStylesTab();
  const { FechaInicio } = getDateOfDay();
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
    IdCliente: perfil.IdCliente,
    IdDivision: perfil.IdDivision,
    TipoReporte: 'P',
    IdCompania: '',
    IdUnidadesOrganizativas: '',
    UnidadesOrganizativas: '',
    IdPerfil: '',
    Perfil: '',
    IdRequisito: '',
    DiasVencimiento: '0',
    FechaCorte: FechaInicio,
    VigenciaActual: false
  });

  const filtrarReporte = (filtro) => {
    const {
      IdCliente,
      IdDivision,
      TipoReporte,
      IdCompania,
      IdUnidadOrganizativa,
      IdPerfil,
      IdRequisito,
      VigenciaActual,
      DiasVencimiento,
      FechaCorte
    } = filtro;
    //comunicarnos con customerDataGrid.
    dataSource.loadDataWithFilter({
      data: {
        IdCliente,
        IdDivision,
        TipoReporte,
        IdCompania,
        IdUnidadOrganizativa,
        IdPerfil,
        IdRequisito,
        VigenciaActual,
        DiasVencimiento,
        FechaCorte
      }
    });
  }

  const clearDataGrid = () => {
    resetLoadOptions();
  }


  const exportReport = async () => {

    if (dataGridRef.current.props.dataSource._items.length > 0) {

      let ListColumnName = [];
      let ListDataField = [];

      dataGridRef.current._optionsManager._currentConfig.configCollections.columns.map(item => {
        if ((item.options.visible === undefined || item.options.visible === true) && item.options.type != 'buttons') {
          ListColumnName.push(item.options.caption.toUpperCase());
          ListDataField.push(item.options.dataField);
        }
      })
      var arrayNombresCabecera = ListColumnName.join('|');
      var arrayNombresData = ListDataField.join('|');

      const { TipoReporte, IdCompania, IdUnidadOrganizativa, IdPerfil, IdRequisito, VigenciaActual, DiasVencimiento, FechaCorte } = dataRowEditNew;


      let params = {
        IdCliente: perfil.IdCliente,
        IdDivision: perfil.IdDivision,
        TipoReporte: isNotEmpty(TipoReporte) ? TipoReporte : "",
        IdCompania: isNotEmpty(IdCompania) ? IdCompania : "",
        IdUnidadOrganizativa: isNotEmpty(IdUnidadOrganizativa) ? IdUnidadOrganizativa : "",
        IdPerfil: isNotEmpty(IdPerfil) ? IdPerfil : "",
        IdRequisito: isNotEmpty(IdRequisito) ? IdRequisito : "",
        VigenciaActual: isNotEmpty(VigenciaActual) ? VigenciaActual : "",
        DiasVencimiento: isNotEmpty(DiasVencimiento) ? DiasVencimiento : 0,
        FechaCorte: isNotEmpty(FechaCorte) ? dateFormat(FechaCorte, 'yyyyMMdd') : "",
        tituloHoja: intl.formatMessage({ id: "CONFIG.MENU.ACCESO.REPORTE_DE_REQUISITO" }),
        nombreHoja: intl.formatMessage({ id: "CONFIG.MENU.ACCESO.REPORTE_DE_REQUISITO" }),
        arrayNombresCabecera,
        arrayNombresData
      };

      await exportarReporteRequisito(params).then(resp => {
        if (isNotEmpty(resp.fileBase64)) {
          let download = document.getElementById('iddescarga');
          download.href = `data:application/vnd.ms-excel;base64,${encodeURIComponent(resp.fileBase64)}`;
          download.download = resp.fileName;
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


  return (
    <>
      <a id="iddescarga" className="" ></a>
      <CustomBreadcrumbs
        Title={intl.formatMessage({ id: "ACCESS.MAIN" })}
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
        <>
          <div className={classes.root}>
            <TabPanel value={0} className={classes.TabPanel} index={0}>
              <ReporteRequisitoFilterPage
                dataRowEditNew={dataRowEditNew}
                setDataRowEditNew={setDataRowEditNew}
                filtrarReporte={filtrarReporte}
                clearDataGrid={clearDataGrid}
                exportReport={exportReport}
                dataGridRef={dataGridRef}
              />

              <div className="row">
                <div className="col-12">
                  <ReporteRequisitoListPage
                    uniqueId={"ReportaccesoRequisitoList"}
                    isFirstDataLoad={isFirstDataLoad}
                    setIsFirstDataLoad={setIsFirstDataLoad}
                    dataSource={dataSource}
                    refresh={refresh}
                    resetLoadOptions={resetLoadOptions}
                    refreshData={refreshData}
                    setRefreshData={setRefreshData}
                    setDataGridRef={setDataGridRef}
                  />

                </div>
              </div>

            </TabPanel>

          </div>
        </>
      </Portlet>
    </>
  );
};


export default injectIntl(WithLoandingPanel(ReporteRequisitoIndexPage));
