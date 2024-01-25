import React, { useState } from "react";
import {injectIntl} from "react-intl";
import WithLoandingPanel from "../../../../../partials/content/withLoandingPanel";
import {useStylesEncabezado} from "../../../../../store/config/Styles";
import {useSelector} from "react-redux";
import DataSource from "devextreme/data/data_source";
import ArrayStore from "devextreme/data/array_store";
import CustomBreadcrumbs from "../../../../../partials/layout/CustomBreadcrumbs";
import {dateFormat, isNotEmpty} from "../../../../../../_metronic";
import {Portlet} from "../../../../../partials/content/Portlet";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import AppBar from "@material-ui/core/AppBar";
import ManifiestoFinalFilterPage from "./ManifiestoFinalFilterPage";
import ManifiestoFinalListPage from "./ManifiestoFinalListPage";

export const initialFilter = {
  Fecha: '',
  Ruta: ''
};

const ManifiestoFinalIndexPage = (props) =>{
  const { intl, setLoading, dataMenu } = props;
  const classesEncabezado = useStylesEncabezado();
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
    Fecha: "",
    IdRuta: "",
    Ruta: "",
  });

  const filtrarReporte = (filtro) => {
    const { Fecha, IdRuta} = filtro;
    dataSource.loadDataWithFilter({
      data: {
        Fecha,
        IdRuta
      }
    });
  }

  const clearDataGrid = () => {
    resetLoadOptions();
  }


  return (
    <>
      <a id="iddescarga" className=""></a>
      <CustomBreadcrumbs
        Title={intl.formatMessage({id: "ASSISTANCE.MAIN"})}
        SubMenu={intl.formatMessage({id: "ACCESS.REPORT.SUBMENU"})}
        Subtitle={intl.formatMessage({id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}`})}
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
          <ManifiestoFinalFilterPage
            dataRowEditNew={dataRowEditNew}
            setDataRowEditNew={setDataRowEditNew}
            filtrarReporte={filtrarReporte}
            clearDataGrid={clearDataGrid}
            //exportReport={exportReport}
            dataGridRef={dataGridRef}
          />
          <ManifiestoFinalListPage
            isFirstDataLoad={isFirstDataLoad}
            setIsFirstDataLoad={setIsFirstDataLoad}
            dataSource={dataSource}
            refresh={refresh}
            resetLoadOptions={resetLoadOptions}
            refreshData={refreshData}
            setRefreshData={setRefreshData}
            setDataGridRef={setDataGridRef}
          />
        </>
      </Portlet>
    </>
  );
}

export default injectIntl(WithLoandingPanel(ManifiestoFinalIndexPage));
