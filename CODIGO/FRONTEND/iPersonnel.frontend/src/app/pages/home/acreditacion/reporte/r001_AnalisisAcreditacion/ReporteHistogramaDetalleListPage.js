import React, { useState, useEffect } from "react";
import { injectIntl } from "react-intl";
import { PortletBody} from "../../../../../partials/content/Portlet";
import { DataGrid, Column, Editing, FilterRow, HeaderFilter, FilterPanel } from "devextreme-react/data-grid";
import { isNotEmpty,STATUS_ACREDITACION_SOLICITUD } from "../../../../../../_metronic";
import PropTypes from 'prop-types';
import CustomDataGrid from "../../../../../partials/components/CustomDataGrid";
import { forceLoadTypes } from "../../../../../partials/components/CustomDataGrid/CustomDataGridHelper";
import WithLoandingPanel from "../../../../../partials/content/withLoandingPanel";
import { r001_detalle_dataSource as loadUrl } from "../../../../../api/acreditacion/reporte.api";
import { initialFilter } from "./ReporteIndexPage";

const ReporteHistogramaDetalleListPage = props => {

  const { intl } = props;
  const { IdCompania,Perfil,UnidadesOrganizativas,EstadoAprobacion,FechaInicio,FechaFin } = props.filtro;

  //Variables de CustomerDataGrid
  const [isActiveFilters, setIsActiveFilters] = useState(false);
  const [customDataGridIsBusy, setCustomDataGridIsBusy] = useState(false);
  const [filterData, setFilterData] = useState({
    ...initialFilter,
    IdCompania: isNotEmpty(IdCompania) ? IdCompania : "",
    Perfil: isNotEmpty(Perfil) ? Perfil : "",
    UnidadesOrganizativas: isNotEmpty(UnidadesOrganizativas) ? UnidadesOrganizativas : "",
    EstadoAprobacion: isNotEmpty(EstadoAprobacion) ? EstadoAprobacion : "",
    FechaInicio: FechaInicio,
    FechaFin: FechaFin,
  });

  // ------------------------------
  const [ifThereAreNoChangesLoadFromStorage, setIfThereAreNoChangesLoadFromStorages] = useState(true);
  const resetLoadOptions = props.resetLoadOptions;
  //:::::::::::::::::::::::::::::::::::::::::::::-funciones-:::::::::::::::::::::::::::::::::
  const textEditing = {
    confirmDeleteMessage: '',
    editRow: intl.formatMessage({ id: "ACTION.EDIT" }),
    deleteRow: intl.formatMessage({ id: "ACTION.REMOVE" }),
  }

  const cellEstadoRender = (e) => {
    let estado = e.data.EstadoAprobacionDescrip;
    let css = '';
    let estado_txt = "";
    if (e.data.EstadoAprobacionDescrip.trim() === "") {
      estado = "INCOMPLETA";
    }

    switch (estado) {
      case "INCOMPLETA": css = 'estado_item_incompleto'; estado_txt = intl.formatMessage({ id: "COMMON.INCOMPLETE" }).toUpperCase(); break;
      case "PENDIENTE": css = 'estado_item_pendiente'; estado_txt = intl.formatMessage({ id: "COMMON.EARRING" }).toUpperCase(); break;
      case "OBSERVADO": css = 'estado_item_observado'; estado_txt = intl.formatMessage({ id: "COMMON.OBSERVED" }).toUpperCase(); break;
      case "RECHAZADA": css = 'estado_item_rechazado'; estado_txt = intl.formatMessage({ id: "COMMON.REJECTED" }).toUpperCase(); break;
      case "APROBADA": css = 'estado_item_aprobado'; estado_txt = intl.formatMessage({ id: "COMMON.APPROVED" }).toUpperCase(); break;
    };

    return (css === '') ?
      <div className={"estado_item_general"}>{estado_txt}</div>
      : <div className={`estado_item_general  ${css}`}   >{estado_txt}</div>
  }



  useEffect(() => {
    if (ifThereAreNoChangesLoadFromStorage) setIfThereAreNoChangesLoadFromStorages(false);
  }, [ifThereAreNoChangesLoadFromStorage])

  useEffect(() => {
    if (props.refreshData) {
      props.refresh();
      props.setRefreshData(false);
    }
  }, [props.refreshData,]);

 useEffect(() => {
      if (props.filtro) {
       const { IdCompania,Perfil,UnidadesOrganizativas,EstadoAprobacion,FechaInicio,FechaFin } = props.filtro;
        setTimeout(() => {
          props.dataSource.loadDataWithFilter({ data: { IdCompania,Perfil,UnidadesOrganizativas,EstadoAprobacion,FechaInicio,FechaFin } });
        }, 500)
      }
    }, [props.filtro]);

  //>..Definir Filtro para customerDataGrid
  const keysToGenerateFilter = [
    'IdCliente',
    'IdCompania',
    'Perfil', 
    'UnidadesOrganizativas',
    'EstadoAprobacion',
    'FechaInicio',
    'FechaFin'
  ];

  const renderDataGrid = ({ gridRef, dataSource }) => {
    props.setDataGridRef(gridRef);
    return (
      <DataGrid
        dataSource={dataSource}
        ref={gridRef}
        keyExpr="RowIndex"
        showBorders={true}
        remoteOperations={true}
        focusedRowEnabled={true}
        repaintChangesOnly={true}
        allowColumnReordering={true}
        allowColumnResizing={true}
        columnAutoWidth={true}
        scrolling={{showScrollbar: 'always'}}
        className="tablaScrollHorizontal"
      >
        <Editing mode="row"
          useIcons={props.showButtons}
          allowUpdating={props.showButtons}
          allowDeleting={props.showButtons}
          texts={textEditing} />
        <FilterRow visible={false} showOperationChooser={false} />
        <HeaderFilter visible={false} />
        <FilterPanel visible={false} />
        <Column
          dataField="RowIndex"
          caption="#"
          allowSorting={false}
          allowFiltering={false}
          allowHeaderFiltering={false}
          width={"35px"}
          alignment={"center"} 
          />

          <Column
            dataField="IdSolicitud"
            caption={intl.formatMessage({ id: "ACCREDITATION.REQUEST" })}
            allowSorting={true}
            allowHeaderFiltering={false}
            alignment={"center"}
            width={"75px"}
          />
          <Column dataField="CompaniaContratista"
            caption={intl.formatMessage({ id: "ADMINISTRATION.POSITION.CONTRACTOR" })}
            allowHeaderFiltering={false}
            allowSorting={true}
            width={"200px"}
            alignment={"left"}
          />
          <Column
            dataField="FechaSolicitud"
            caption={intl.formatMessage({ id: "ADMINISTRATION.REQUEST.DATE" })}
            dataType="date"
            format="dd/MM/yyyy"
            alignment={"center"}
            allowHeaderFiltering={false}
            allowFiltering={false}
            width={"130px"}
          />

          <Column
            dataField="HoraSolicitud"
            caption={intl.formatMessage({ id: "ACREDITATION.R001.STADISTIC.HOUR.REQUEST" })}
            allowSorting={true}
            allowFiltering={false}
            allowHeaderFiltering={true}
            alignment={"center"}
            width={"120px"}
          />

          <Column dataField="Documento"
            caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.DOCUMENT" })}
            allowHeaderFiltering={false}
            width={"100px"}
            alignment={"center"}
          />
          <Column
            dataField="NombreCompleto"
            caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.FULLNAME" })}
            allowSorting={true}
            allowHeaderFiltering={false}
            width={"200px"}
          />
          <Column
            dataField="FechaInicio"
            caption={intl.formatMessage({ id: "COMMON.STARTDATE" })}
            dataType="date"
            format="dd/MM/yyyy"
            alignment={"center"}
            allowHeaderFiltering={false}
            allowFiltering={false}
            width={"90px"}
          />
          <Column
            dataField="FechaFin"
            caption={intl.formatMessage({ id: "COMMON.ENDDATE" })}
            dataType="date"
            format="dd/MM/yyyy"
            alignment={"center"}
            allowHeaderFiltering={false}
            allowFiltering={false}
            width={"90px"}
          />
          <Column
            dataField="Perfil"
            caption={intl.formatMessage({ id: "ACCESS.PERSON.PROFILE" })}
            allowSorting={true}
            allowFiltering={false}
            allowHeaderFiltering={true}
            alignment={"left"}
            width={"200px"}
          />

          <Column
            dataField="FechaAprobacion"
            caption={intl.formatMessage({ id: "ACREDITATION.R001.STADISTIC.DATE.OF.APPROVAL" })}
            allowSorting={true}
            allowFiltering={false}
            allowHeaderFiltering={true}
            alignment={"center"}
            width={"140px"}
          />
          
          <Column
            dataField="HoraAprobacion"
            caption={intl.formatMessage({ id: "ACREDITATION.R001.STADISTIC.HOUR.APPROVAL" })}
            allowSorting={true}
            allowFiltering={false}
            allowHeaderFiltering={true}
            alignment={"center"}
            width={"140px"}
          />

          <Column
            dataField="UsuarioCreacion"
            caption={intl.formatMessage({ id: "AUDIT.USERCREATION" })}
            allowSorting={true}
            allowFiltering={false}
            allowHeaderFiltering={true}
            alignment={"center"}
            width={"120px"}
          />

          <Column
            dataField="ProcesadoDescripcion"
            caption={intl.formatMessage({ id: "ACCREDITATION.MANAGEMENT.PROCESS" })}
            allowSorting={true}
            allowFiltering={false}
            allowHeaderFiltering={true}
            alignment={"center"}
            width={"130px"}
          />

          <Column
            dataField="FechaHoraProcesado"
            caption={intl.formatMessage({ id: "ACREDITATION.R001.STADISTIC.DATE.PROCESSED" })}
            allowSorting={true}
            allowFiltering={false}
            allowHeaderFiltering={true}
            alignment={"center"}
            width={"130px"}
          />

          <Column
            dataField="HoraProcesado"
            caption={intl.formatMessage({ id: "ACREDITATION.R001.STADISTIC.HOUR.PROCESS" })}
            allowSorting={true}
            allowFiltering={false}
            allowHeaderFiltering={true}
            alignment={"center"}
            width={"120px"}
          />
    
          <Column
            dataField="EstadoAprobacionDescrip"
            caption={intl.formatMessage({ id: "COMMON.STATE" })}
            width={"100px"}
            allowSorting={true}
            allowFiltering={false}
            allowHeaderFiltering={false}
            alignment={"center"}
            cellRender={cellEstadoRender}
          />

      </DataGrid>
    );
  }

  return (
    <>
      <a id="iddescarga" className="" ></a>
      <PortletBody>
        <CustomDataGrid
          showLog={false} 
          uniqueId={props.uniqueId}
          dataSource={props.dataSource}
          rowNumberName='RowIndex'
          loadWhenStartingComponent={props.isFirstDataLoad && !props.refreshData}
          renderDataGrid={renderDataGrid}
          loadUrl={loadUrl}
          forceLoad={forceLoadTypes.Unforced}
          sendToServerOnlyIfThereAreChanges={false}
          ifThereAreNoChangesLoadFromStorage={ifThereAreNoChangesLoadFromStorage}
          caseSensitiveWhenCheckingForChanges={true}
          uppercaseFilterRow={true}
          initialLoadOptions={{ currentPage: 1, pageSize: 20, sort: { column: 'NombreCompleto', order: 'asc' } }}
          filterRowSize='sm'
          summaryCountFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0} de {1} `}
          // CUSTOM FILTER
          //cssClassAppBar={classesEncabezado.secundario}
          //cssClassToolbar={classesEncabezado.toolbar}
          //renderFormTitleCustomFilter={renderFormTitleCustomFilter}
          //titleCustomFilter='Datos a consultar'
          visibleCustomFilter={isActiveFilters}
          // renderFormContentCustomFilter={renderFormContentCustomFilter}
          //transformData={transformData}
          //reverseTransformData={reverseTransformData}
          keysToGenerateFilter={keysToGenerateFilter}
          filterData={filterData}
          // PAGINATION
          paginationSize='md'
          // EVENTS
          onLoading={() => setCustomDataGridIsBusy(true)}
          onError={() => setCustomDataGridIsBusy(false)}
          onLoaded={() => setCustomDataGridIsBusy(false)}
        />
     
      </PortletBody>
    </>
  );
};

ReporteHistogramaDetalleListPage.propTypes = {
  titulo: PropTypes.string,
  showButtons: PropTypes.bool,
  uniqueId: PropTypes.string,
  filtro: PropTypes.object,
}
ReporteHistogramaDetalleListPage.defaultProps = {
  titulo: "",
  modoEdicion: false,
  showButtons: true,
  showAppBar: true,
  uniqueId: 'ReporteHistogramaDetalleListPage',
  filtro: { 
    IdCompania: "",
    Perfil: "",
    UnidadesOrganizativas: "",
    EstadoAprobacion: "",
    FechaInicio:"",
    FechaFin:""
  }
     
}
export default injectIntl(WithLoandingPanel(ReporteHistogramaDetalleListPage));
