import React, { useState, useEffect } from "react";
import { injectIntl } from "react-intl";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import { Button } from "devextreme-react";
import Form, { Item, GroupItem } from "devextreme-react/form";
import { DataGrid, Column, FilterRow, HeaderFilter, FilterPanel, Button as ColumnButton, Summary, TotalItem } from "devextreme-react/data-grid";
import { DoubleLinePersona as DoubleLineLabel, PersonaCondicionLabel } from "../../../../../partials/content/Grid/DoubleLineLabel";

import { isNotEmpty, listarEstadoSimple, listarCondicion } from "../../../../../../_metronic";
import PropTypes from 'prop-types';
import { useSelector } from "react-redux";
import CustomDataGrid from "../../../../../partials/components/CustomDataGrid";
import { forceLoadTypes } from "../../../../../partials/components/CustomDataGrid/CustomDataGridHelper";
import { handleErrorMessages, handleSuccessMessages } from "../../../../../store/ducks/notify-messages";
import WithLoandingPanel from "../../../../../partials/content/withLoandingPanel";

import { storeListarR002 as loadUrl, serviceReporte } from "../../../../../api/administracion/reporte.api";
import { initialFilter } from "./TrabajadoresContratosActivosIndexPage";
import { obtenerTodos as obtenerTodosTipoPosicion } from "../../../../../api/administracion/tipoPosicion.api";

const TrabajadoresContratosActivosListPage = props => {
  const { intl, focusedRowKey, setLoading } = props;
  const { IdCliente, IdPerfil, IdDivision, Division } = useSelector(state => state.perfil.perfilActual);
  //const IdDivisionPerfil = useSelector(state => state.perfil.perfilActual.IdDivision);
  const { IdDivisionPerfil } = props.selected;

  //Variables de CustomerDataGrid
  const [customDataGridIsBusy, setCustomDataGridIsBusy] = useState(false);
  const [filterData, setFilterData] = useState({
    ...initialFilter, IdCliente, IdDivision, Division,
    IdPerfil,
    IdDivisionPerfil

  });
  // PAGINATION
  // ------------------------------
  const [ifThereAreNoChangesLoadFromStorage, setIfThereAreNoChangesLoadFromStorages] = useState(true);
  const resetLoadOptions = props.resetLoadOptions;
  let dataGridRef = React.useRef();

  //:::::::::::::::::::::::::::::::::::::::::::::-funciones-:::::::::::::::::::::::::::::::::

  const obtenerCampoActivo = rowData => { return rowData.Estado === "S"; };
  const obtenerCampoDiscapacidad = rowData => rowData.Discapaciadad === "S" ? 'SI' : 'NO';

  function onCellPrepared(e) {
    if (e.rowType === 'data') {
      if (e.data.Activo === 'N') {
        e.cellElement.style.color = 'red';
      }
    }
  }

  const seleccionarRegistro = evt => {
    if (evt.rowIndex === -1) return;
    if (isNotEmpty(evt.row.data)) props.seleccionarRegistro(evt.row.data);
  };


  const exportReport = async () => {
    let result = JSON.parse(localStorage.getItem('vcg:' + props.uniqueId + ':loadOptions'));
    if (!isNotEmpty(result)) return;
    let filterExport = {
      IdCliente,
      IdPerfil,
      IdDivisionPerfil,
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

    // Decompilando filterData
    const { IdDivision, IdCompania, Condicion, Personas, IdUnidadOrganizativa, IdEstadoCivil, IdPosicion, Posicion,
      IdTipoPosicion, IdUbigeoResidencia, IdPersona, NombreCompleto, IdTipoDocumento, Documento, Sexo, Edad, UbigeoNacimiento, Activo,
      IdPerfil, IdDivisionPerfil, UnidadesOrganizativas } = filterExport;

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
        IdCompania: isNotEmpty(IdCompania) ? IdCompania : "",
        Condicion: isNotEmpty(Condicion) ? Condicion : "",
        IdUnidadOrganizativa: isNotEmpty(IdUnidadOrganizativa) ? IdUnidadOrganizativa : "",
        Personas: isNotEmpty(Personas) ? Personas : "",
        IdEstadoCivil: isNotEmpty(IdEstadoCivil) ? IdEstadoCivil : "",
        IdPosicion: isNotEmpty(IdPosicion) ? IdPosicion : "",
        Posicion: isNotEmpty(Posicion) ? Posicion : "",
        IdTipoPosicion: isNotEmpty(IdTipoPosicion) ? IdTipoPosicion : "",
        IdUbigeoResidencia: isNotEmpty(IdUbigeoResidencia) ? IdUbigeoResidencia : "",
        IdPersona: isNotEmpty(IdPersona) ? IdPersona : "",
        NombreCompleto: isNotEmpty(NombreCompleto) ? NombreCompleto : "",
        IdTipoDocumento: isNotEmpty(IdTipoDocumento) ? IdTipoDocumento : "",
        Documento: isNotEmpty(Documento) ? Documento : "",
        Sexo: isNotEmpty(Sexo) ? Sexo : "",
        Edad: isNotEmpty(Edad) ? Edad : "",
        UbigeoNacimiento: isNotEmpty(UbigeoNacimiento) ? UbigeoNacimiento : "",
        Activo: isNotEmpty(Activo) ? Activo : "",
        IdPerfil: isNotEmpty(IdPerfil) ? IdPerfil : "",
        IdDivisionPerfil: isNotEmpty(IdDivisionPerfil) ? IdDivisionPerfil : "",
        UnidadesOrganizativas: isNotEmpty(UnidadesOrganizativas) ? UnidadesOrganizativas : "",
        TituloHoja: intl.formatMessage({ id: "CONFIG.MENU.ADMINISTRACION.TRABAJADORES_POR_SEDE" }),
        NombreHoja: intl.formatMessage({ id: "CONFIG.MENU.ADMINISTRACION.TRABAJADORES_POR_SEDE" }),
        ArrayColumnHeader,
        ArrayColumnId,
        OrderField: selector
      };
      setLoading(true);
      await serviceReporte.exportarExcelR003(params).then(response => {
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




  useEffect(() => {
    if (ifThereAreNoChangesLoadFromStorage) setIfThereAreNoChangesLoadFromStorages(false);
  }, [ifThereAreNoChangesLoadFromStorage])
  useEffect(() => {
    if (props.refreshData) {
      props.refresh();
      props.setRefreshData(false);
    }
  }, [props.refreshData]);

  //>..Definir Filtro para customerDataGrid
  const keysToGenerateFilter = ['IdCliente', 'IdDivision', 'IdCompaniaMandante', 'IdCompaniaContratista'];

  const renderDataGrid = ({ gridRef, dataSource }) => {
    if (dataSource._storeLoadOptions.filter !== undefined) {
      if (props.totalRowIndex === 0) {
        props.setTotalRowIndex(dataSource._totalCount);
      }
      if (dataSource._totalCount != props.totalRowIndex) {
        if (dataSource._totalCount != -1) {
          props.setFocusedRowKey();
          props.setTotalRowIndex(dataSource._totalCount);
        }
      }
    }
    dataGridRef = gridRef;
    return (
      <DataGrid
        dataSource={dataSource}
        ref={gridRef}
        showBorders={true}
        keyExpr="RowIndex"
        focusedRowEnabled={true}
        onFocusedRowChanged={seleccionarRegistro}
        focusedRowKey={focusedRowKey}
        repaintChangesOnly={true}
        allowColumnResizing={true}
        allowColumnReordering={true}
        remoteOperations={true}
        onCellPrepared={onCellPrepared}
        columnAutoWidth={true}
      ><Column dataField="CompaniaMandante" caption={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CLIENTCOMPANY" })} width={"15%"} />
      <Column dataField="IdCompaniaContratista" caption={intl.formatMessage({ id: "ADMINISTRATION.RUC.CONTRACTOR" })} alignment={"center"} />
      <Column dataField="CompaniaContratista" caption={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CONTRACTORCOMPANY" })} width={"15%"} />
      <Column dataField="IdContrato" caption={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CONTRACT" })} alignment={"center"} />
      <Column dataField="Asunto" caption={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.SUBJECT" })} width={"15%"} />
      <Column dataField="Dotacion" caption={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.ENDOWMENT" })} alignment={"center"} width={"5%"} />
      <Column dataField="FechaInicio" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.STARTDATE" })} dataType="date" format="dd/MM/yyyy" alignment={"center"} />
      <Column dataField="FechaFin" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.ENDDATE" })} dataType="date" format="dd/MM/yyyy" alignment={"center"} />
      <Column dataField="TotalTrabajadoresActivos" caption={intl.formatMessage({ id: "ADMINISTRATION.REPORT.CONTRACT.ACTIVE_WORKERS" })} alignment={"center"} />
      <Column dataField="TotalTrabajadoresInactivos" caption={intl.formatMessage({ id: "ADMINISTRATION.REPORT.CONTRACT.INACTIVE_WORKERS" })} alignment={"center"} />

      <Column type="buttons" width={"5%"} >
        <ColumnButton
          icon="contentlayout"
          hint={intl.formatMessage({ id: "COMMON.DETAIL" })}
          onClick={props.mostrarDetalle}
          visible={true}
        />
        <ColumnButton
          icon="fa fa-file-excel"
          hint={intl.formatMessage({ id: "ACTION.EXPORT" })}
          onClick={props.exportarPorFila}
          visible={true}
        />
      </Column>

      {/* <Summary>
        <TotalItem
          column="CompaniaMandante"
          summaryType="count"
          displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
        />
        <TotalItem
          column="Dotacion"
          summaryType="max"
          displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL" })} {0}`}
        />
        <TotalItem
          column="TotalTrabajadoresActivos"
          summaryType="sum"
          displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL" })} {0}`}
        />
        <TotalItem
          column="TotalTrabajadoresInactivos"
          summaryType="sum"
          displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL" })} {0}`}
        />
      </Summary> */}
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
          sendToServerOnlyIfThereAreChanges={true}
          ifThereAreNoChangesLoadFromStorage={ifThereAreNoChangesLoadFromStorage}
          caseSensitiveWhenCheckingForChanges={true}
          uppercaseFilterRow={true}
          initialLoadOptions={{ currentPage: 1, pageSize: 20, sort: { column: 'CompaniaMandante', order: 'asc' } }}
          filterRowSize='sm'
          summaryCountFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0} de {1} `}
          // CUSTOM FILTER
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
TrabajadoresContratosActivosListPage.propTypes = {
  titulo: PropTypes.string,
  modoEdicion: PropTypes.bool,
  showButtons: PropTypes.bool,
  showAppBar: PropTypes.bool,
  showHeaderInformation: PropTypes.bool,
  uniqueId: PropTypes.string,
  selected: PropTypes.object,

}
TrabajadoresContratosActivosListPage.defaultProps = {
  titulo: "",
  modoEdicion: false,
  showButtons: true,
  showAppBar: true,
  showHeaderInformation: false,
  uniqueId: 'r002TrabajadoresConContratoActivoList',
  selected: { IdDivision: "" }
}

export default injectIntl(WithLoandingPanel(TrabajadoresContratosActivosListPage));
