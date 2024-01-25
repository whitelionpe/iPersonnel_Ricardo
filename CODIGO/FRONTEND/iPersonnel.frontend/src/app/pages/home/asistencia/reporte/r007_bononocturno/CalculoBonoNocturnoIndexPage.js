import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import { useSelector } from "react-redux";

import { Portlet } from "../../../../../partials/content/Portlet";
import { useStylesEncabezado, useStylesTab } from "../../../../../store/config/Styles";
import CustomBreadcrumbs from "../../../../../partials/layout/CustomBreadcrumbs";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";

import { handleErrorMessages, handleSuccessMessages } from "../../../../../store/ducks/notify-messages";
import CalculoBonoNocturnoFilterPage from "./CalculoBonoNocturnoFilterPage";
import { dateFormat, isNotEmpty, getDateOfDay } from "../../../../../../_metronic";
import CalculoBonoNocturnoListPage from "./CalculoBonoNocturnoListPage";

import { exportarCalculoBonoNocturno, filtrarCalculoBonoNocturnoDetalle } from "../../../../../api/asistencia/reporte.api"
import CalculoBonoNocturnoDetallePopUp from "./CalculoBonoNocturnoDetallePopUp";

export const initialFilter = {
  IdCliente: '',
  IdDivision: '',
  IdUnidadOrganizativa: '',
  IdPosicion: '',
  Personas: '',
  IdCentroCosto: '',
  IdPlanilla: '',
  CodigoPlanilla:'',
  Activo: 'S',
  FechaInicio: '',
  FechaFin: '',

};

const CalculoBonoNocturnoIndexPage = (props) => {

  const { intl, setLoading, dataMenu } = props;
  const classesEncabezado = useStylesEncabezado();
  const classes = useStylesTab();
  const [dataIdCompania, setDataIdCompania] = useState(null);//ADD

  const perfil = useSelector((state) => state.perfil.perfilActual);
  const [isVisiblePopUp, setisVisiblePopUp] = useState(false);
  const [detalleBonoNocturno, setDetalleBonoNocturno] = useState([]);
  const [sumaMinutosDetalle, setSumaMinutosDetalle] = useState([]);


  //ADD-> INTERVALOS DE FECHA 1 A 30
  const { FechaInicio, FechaFin } = getDateOfDay();

  //FILTRO
  const [isFirstDataLoad, setIsFirstDataLoad] = useState(true);
  const [refreshData, setRefreshData] = useState(false);
  const ds = new DataSource({ store: new ArrayStore({ data: [], key: 'RowIndex' }), reshapeOnPush: false });
  const [dataSource] = useState(ds);

  const refresh = () => dataSource.refresh();
  const resetLoadOptions = () => dataSource.resetLoadOptions();
  const [dataGridRef, setDataGridRef] = useState(null);
  const [varFiltro, setVarFiltro] = useState({
    IdCliente: perfil.IdCliente,
    IdDivision: perfil.IdDivision,
    IdUnidadOrganizativa: '',
    IdPosicion: '',
    Personas: '',
    IdCentroCosto: '',
    IdPlanilla: '',
    CodigoPlanilla:'',
    Activo: 'S',
    FechaInicio: FechaInicio,
    FechaFin: FechaFin,

  });


  const [dataRowEditNew, setDataRowEditNew] = useState({
    IdCliente: perfil.IdCliente,
    IdDivision: perfil.IdDivision,
    IdUnidadOrganizativa: '',
    IdPosicion: '',
    Personas: '',
    IdCentroCosto: '',
    IdPlanilla: '',
    CodigoPlanilla:'',
    Activo: 'S',
    FechaInicio: FechaInicio,
    FechaFin: FechaFin,

  });

  const filtrarReporte = (filtro) => {
    const {
      IdCliente,
      IdDivision,
      IdCompania,
      IdUnidadOrganizativa,
      IdPosicion,
      Personas,
      IdCentroCosto,
      IdPlanilla,
      CodigoPlanilla,
      Estado,
      FechaInicio,
      FechaFin

    } = filtro;

    setVarFiltro(filtro);

    //comunicarnos con customerDataGrid.
    dataSource.loadDataWithFilter({
      data: {
        IdCliente,
        IdDivision,
        IdCompania,
        IdUnidadOrganizativa,
        IdPosicion,
        Personas,
        IdCentroCosto,
        IdPlanilla,
        CodigoPlanilla,
        Estado,
        FechaInicio,
        FechaFin
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

      var arrayNombresCabecera_Detalle = "CÓDIGO|APELLIDOS Y NOMBRES|N° DOCUMENTO|FECHA ASISTENCIA|DÍA|HORARIO|MARCAS|BONO NOCTURNO";
      var arrayNombresData_Detalle = "IdPersona|NombreCompleto|Documento|FechaAsistencia|DiaAsistencia|Horario|Marcas|MinutosBonoNocturno";


      const {
        IdCompania,
        IdUnidadOrganizativa,
        IdPosicion,
        Personas,
        IdCentroCosto,
        IdPlanilla,
        CodigoPlanilla,
        Activo,
        FechaInicio,
        FechaFin,
        NombreCompleto,
        Documento,
        IdPersona } = dataRowEditNew;

      let params = {
        IdCliente: perfil.IdCliente,
        IdDivision: perfil.IdDivision,
        IdCompania: isNotEmpty(IdCompania) ? IdCompania : "",
        IdUnidadOrganizativa: isNotEmpty(IdUnidadOrganizativa) ? IdUnidadOrganizativa : "",
        IdPosicion: isNotEmpty(IdPosicion) ? IdPosicion : "",
        Personas: isNotEmpty(Personas) ? Personas : "",
        IdCentroCosto: isNotEmpty(IdCentroCosto) ? IdCentroCosto : "",
        IdPlanilla: isNotEmpty(IdPlanilla) ? IdPlanilla : "",
        CodigoPlanilla: isNotEmpty(CodigoPlanilla) ? CodigoPlanilla : "",        
        Estado: isNotEmpty(Activo) ? Activo : "",
        FechaInicio: dateFormat(FechaInicio, 'yyyyMMdd'),
        FechaFin: dateFormat(FechaFin, 'yyyyMMdd'),

        NombreCompleto: isNotEmpty(NombreCompleto) ? NombreCompleto : "",
        Documento: isNotEmpty(Documento) ? Documento : "",
        IdPersona: isNotEmpty(IdPersona) ? IdPersona : "",

        tituloHoja: intl.formatMessage({ id: "CONFIG.MENU.ASISTENCIA.CALCULO_BONONOCTURNO" }),
        nombreHoja: intl.formatMessage({ id: "COMMON.REPORT" }),
        arrayNombresCabecera,
        arrayNombresData,
        tituloHoja2: intl.formatMessage({ id: "CONFIG.MENU.ASISTENCIA.DETALLE_BONONOCTURNO" }),
        nombreHoja2: intl.formatMessage({ id: "COMMON.DETAIL" }),
        arrayNombresCabecera2: arrayNombresCabecera_Detalle,
        arrayNombresData2: arrayNombresData_Detalle

      };

      setLoading(true);

      await exportarCalculoBonoNocturno(params).then(resp => {

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

  function VerDetalle(data) {
    //console.log("data::>> ", data);
    obtenerDetalle(data);
  }

  async function obtenerDetalle(data) {
    setLoading(true);
    const {
      IdCliente,
      IdDivision,
      IdCompania,
      IdUnidadOrganizativa,
      IdPosicion,
      Personas,
      IdCentroCosto,
      IdPlanilla,
      Activo,
      FechaInicio,
      FechaFin
    } = varFiltro;

    const {
      FechaPeriodo,
      IdPersona
    } = data;

    await filtrarCalculoBonoNocturnoDetalle({
      filter: JSON.stringify([
        ["IdCliente", "=", perfil.IdCliente], "AND",
        ["IdDivision", "=", IdDivision], "AND",
        ["IdCompania", "=", IdCompania], "AND",
        ["IdUnidadOrganizativa", "=", IdUnidadOrganizativa], "AND",
        ["IdPosicion", "=", IdPosicion], "AND",
        //["Personas", "=", Personas], "AND",
        ["IdPersona", "=", IdPersona], "AND",
        ["IdCentroCosto", "=", IdCentroCosto], "AND",
        ["IdPlanilla", "=", IdPlanilla], "AND",
        ["Activo", "=", Activo], "AND",
        //["FechaPeriodo", "=", FechaPeriodo], "AND",
        ["FechaInicio", "=", FechaInicio], "AND",
        ["FechaFin", "=", FechaFin],]),
      skip: 0,
      take: 0,
      sort: JSON.stringify([{ selector: "NombreCompleto", desc: false }]),
    })
      .then(data => {
        setDetalleBonoNocturno(data);

        if (data.length > 0) {
          setSumaMinutosDetalle(data[0].SumaMinutos);
        }
        else{
          setSumaMinutosDetalle('0');
        }

        setisVisiblePopUp(true);
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      })
      .finally(() => {
        setLoading(false);
      });



  }



  return (
    <>
      <a id="iddescarga" className="" ></a>
      <CustomBreadcrumbs
        Title={intl.formatMessage({ id: "ASSISTANCE.MAIN" })}
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
         
          <CalculoBonoNocturnoFilterPage
            dataRowEditNew={dataRowEditNew}
            setDataRowEditNew={setDataRowEditNew}
            setDataIdCompania={setDataIdCompania}
            filtrarReporte={filtrarReporte}
            clearDataGrid={clearDataGrid}
            exportReport={exportReport}
            dataGridRef={dataGridRef}
            dataMenu={dataMenu}   />
          
        <CalculoBonoNocturnoListPage
          uniqueId={"CalculoBonoNocturnoListPage"}
          dataIdCompania={dataIdCompania}
          isFirstDataLoad={isFirstDataLoad}
          setIsFirstDataLoad={setIsFirstDataLoad}
          dataSource={dataSource}
          refresh={refresh}
          resetLoadOptions={resetLoadOptions}
          refreshData={refreshData}
          setRefreshData={setRefreshData}
          setDataGridRef={setDataGridRef}
          VerDetalle={VerDetalle}  />

        <CalculoBonoNocturnoDetallePopUp
          showPopup={{ isVisiblePopUp: isVisiblePopUp, setisVisiblePopUp: setisVisiblePopUp }}
          detalleBonoNocturno={detalleBonoNocturno}
          sumaMinutosDetalle={sumaMinutosDetalle}  />

      
      </>
    </Portlet>
    </>
  );
};


export default injectIntl(WithLoandingPanel(CalculoBonoNocturnoIndexPage));
