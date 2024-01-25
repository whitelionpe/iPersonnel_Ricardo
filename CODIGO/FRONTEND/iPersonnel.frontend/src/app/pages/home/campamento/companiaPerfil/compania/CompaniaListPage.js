import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import {
  DataGrid,
  Column,
  Editing,
  FilterRow,
  HeaderFilter,
  FilterPanel,
  Button as ColumnButton
} from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import { isNotEmpty, listarEstadoSimple, listarEstado, listarConsultaPerfiles } from "../../../../../../_metronic";
import PropTypes from "prop-types";
import WithLoandingPanel from "../../../../../partials/content/withLoandingPanel";

//Custom grid: ::::::::::::::::::::::::::::::::
import { Item, GroupItem } from "devextreme-react/form";
import ControlSwitch from "../../../../../store/ducks/componente/componenteSwitch";
import CustomDataGrid from "../../../../../partials/components/CustomDataGrid";
import { forceLoadTypes } from "../../../../../partials/components/CustomDataGrid/CustomDataGridHelper";
import { storeListarCompania as loadUrl, serviceCompania } from "../../../../../api/administracion/compania.api";
import { initialFilter } from "../CompaniaPerfilIndexPage";
import { useSelector } from "react-redux";
import AdministracionCompaniaContratos from "../../../../../partials/components/AdministracionCompaniaContratos";
import { handleErrorMessages, handleSuccessMessages } from "../../../../../store/ducks/notify-messages";

//:::::::::::::::::::::::::::::::::::::::::::::

const CompaniaListPage = props => {
  const { intl } = props;
  const { IdCliente, IdDivision, setLoading } = useSelector(state => state.perfil.perfilActual);

  const [isActiveFilters, setIsActiveFilters] = useState(false);
  const [customDataGridIsBusy, setCustomDataGridIsBusy] = useState(false);
  const [filterData, setFilterData] = useState({ ...initialFilter, IdCliente, IdDivision });

  const [ifThereAreNoChangesLoadFromStorage, setIfThereAreNoChangesLoadFromStorages] = useState(true);
  const resetLoadOptions = props.resetLoadOptions;
  let dataGridRef = React.useRef();
  // const [estadoSimple, setEstadoSimple] = useState([]);
  // const [estado, setEstado] = useState([]);

  // const [consultaPerfiles, setconsultaPerfiles] = useState([]);

  const [isVisiblePopUpMotivoContrato, setisVisiblePopUpMotivoContrato] = useState(false);
  const [vizualizarTodasSwitch, setVizualizarTodasSwitch] = useState(false);

  const editarRegistro = evt => {
    props.editarRegistro(evt.data);
  };

  const cleanEvent = () => {

    setVizualizarTodasSwitch(false);
    props.resetLoadOptions();
  }

  const eliminarRegistro = evt => {
    evt.cancel = true;
    props.eliminarRegistro(evt.data);
  };

  const obtenerCampoContratista = rowData => {
    return rowData.Contratista === "S";
  };

  const obtenerCampoActivo = rowData => {
    return rowData.Activo === "S";
  };

  const seleccionarRegistro = evt => {
    if (evt.rowIndex === -1) return;
    if (isNotEmpty(evt.row.data)) props.seleccionarRegistro(evt.row.data);
  }

  const seleccionarRegistroDblClick = evt => {
    if (evt.data === undefined) return;
    if (isNotEmpty(evt.data)) {
      props.verRegistroDblClick(evt.data);
    };
  }


  const textEditing = {
    confirmDeleteMessage: '',
    editRow: intl.formatMessage({ id: "ACTION.EDIT" }),
    deleteRow: intl.formatMessage({ id: "ACTION.REMOVE" }),
  };

  function onCellPrepared(e) {
    if (e.rowType === 'data') {
      if (e.data.Activo === 'N') {
        e.cellElement.style.color = 'red';
      }
    }
  }

  /* 
    async function cargarCombos() {
      let estadoSimples = listarEstadoSimple()
      let estado = listarEstado()
  
      let lstConsulta = listarConsultaPerfiles()
  
      setEstadoSimple(estadoSimples)
      setEstado(estado);
      setconsultaPerfiles(lstConsulta);
  
    } */

  function isVisible(e) {
    return (e.row.data.TienePerfil === 'S');
  }

  const [filterDatax, setFilterDatax] = useState({
    ...initialFilter, IdCliente, IdDivision
  });

  const exportReport = async () => {

    let result = JSON.parse(localStorage.getItem('vcg:campamentoCompaniaList:loadOptions'));

    if (!isNotEmpty(result)) return;

    for (let i = 0; i < result.filter.length; i++) {
      let currentValue = result.filter[i];
      if (currentValue instanceof Array) {

        for (let j = 0; j < currentValue.length; j++) {

          filterDatax[currentValue[0]] = currentValue[2];
        }
      }
    }

    //obtener orden para exportar
    const { selector } = result.sort[0];

    const { IdCliente, IdDivision, IdCompania, Compania, TipoDocumento, Documento, Pais, Activo, controlarAsistencia, Contratista, PerfilAsignado, TipoConsultaPerfil } = filterDatax;

    //if (!isNotEmpty(result)) {

    if (dataGridRef.current.props.dataSource._items.length > 0) {

      let ListColumnName = [];
      let ListDataField = [];

      dataGridRef.current._optionsManager._currentConfig.configCollections.columns.map(item => {
        if ((item.options.visible === undefined || item.options.visible === true) && item.options.type != 'buttons') {
          ListColumnName.push(item.options.caption.toUpperCase());
          ListDataField.push(item.options.dataField);
        }
      })
      var ArrayColumnHeader = ListColumnName.join('|');
      var ArrayColumnId = ListDataField.join('|');

      let params = {
        IdCliente: IdCliente,
        IdDivision: IdDivision,
        IdCompania: isNotEmpty(IdCompania) ? IdCompania : "",
        Compania: isNotEmpty(Compania) ? Compania : "",
        TipoDocumento: isNotEmpty(TipoDocumento) ? TipoDocumento : "",
        Documento: isNotEmpty(Documento) ? Documento : "",
        Pais: isNotEmpty(Pais) ? Pais : "",
        Activo: isNotEmpty(Activo) ? Activo : "",
        controlarAsistencia: isNotEmpty(controlarAsistencia) ? controlarAsistencia : "",
        Contratista: isNotEmpty(Contratista) ? Contratista : "",
        PerfilAsignado: isNotEmpty(PerfilAsignado) ? PerfilAsignado : "",
        TipoConsultaPerfil: isNotEmpty(TipoConsultaPerfil) ? TipoConsultaPerfil : "",
        TituloHoja: intl.formatMessage({ id: "ADMINISTRATION.EXPORT_PEOPLE" }),
        NombreHoja: intl.formatMessage({ id: "ADMINISTRATION.EXPORT_PEOPLE" }),
        ArrayColumnHeader,
        ArrayColumnId,
        OrderField: selector
      };
      await serviceCompania.exportarExcelPerfil(params).then(response => {
        const { fileBase64, fileName } = response;
        console.log("fileBase64,fileName,,", fileBase64, fileName);
        //result = response;
        //localStorage.setItem('vcg:campamentoCompaniaList:loadOptions', JSON.stringify(response))
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
      });

    }

  }
  //:::::::::::::::::::::::::::::::::::::::::::::::

  useEffect(() => {

    console.log("ifThereAreNoChangesLoadFromStorage", ifThereAreNoChangesLoadFromStorage);
    if (ifThereAreNoChangesLoadFromStorage) setIfThereAreNoChangesLoadFromStorages(false);
  }, [ifThereAreNoChangesLoadFromStorage])

  useEffect(() => {
    console.log("props.refreshData", props.refreshData);
    if (props.refreshData) {
      props.refresh();
      props.setRefreshData(false);
    } else {
      props.dataSource.loadDataWithFilter({ data: { IdDivision } });
    }
  }, [props.refreshData]);




  //Filter:
  const keysToGenerateFilter = ['IdCliente', 'IdDivision', 'IdCompania', 'Compania', 'TipoDocumento', 'Documento', 'Pais', 'Activo', 'Contratista', 'PerfilAsignado', 'TipoConsultaPerfil'];
  const renderFormContentCustomFilter = ({ getInstance }) => {
    return (
      <GroupItem >
        <GroupItem itemType="group" colCount={7} colSpan={7} >

          <Item
            label={{ text: intl.formatMessage({ id: "ADMINISTRATION.COMPANY.ALL" }) }}
            colSpan={1}
            render={switchVerTodo}
          />


          <Item
            dataField="TipoConsultaPerfil"
            label={{ text: intl.formatMessage({ id: "CASINO.COMPANY.GROUP.TOSELECT" }) }}
            editorType="dxSelectBox"
            colSpan={2}
            editorOptions={{
              items: listarConsultaPerfiles(),// consultaPerfiles,
              valueExpr: "Valor",
              displayExpr: "Descripcion",
              showClearButton: true,
              onValueChanged: () => getInstance().filter(),
            }}
          />

          <Item
            dataField="Contratista"
            label={{ text: intl.formatMessage({ id: "ADMINISTRATION.COMPANY.ISCONTRACTOR" }) }}
            colSpan={2}
            editorType="dxSelectBox"
            editorOptions={{
              items: listarEstado(), //estado,
              valueExpr: "Valor",
              displayExpr: "Descripcion",
              showClearButton: true,
              onValueChanged: () => getInstance().filter(),
            }}
          />

          <Item
            dataField="Activo"
            colSpan={2}
            label={{ text: intl.formatMessage({ id: "CASINO.COMPANY.GROUP.STATE" }) }}
            editorType="dxSelectBox"
            editorOptions={{
              items: listarEstadoSimple(),//estadoSimple,
              valueExpr: "Valor",
              displayExpr: "Descripcion",
              showClearButton: true,
              onValueChanged: () => getInstance().filter(),
            }}
          />

        </GroupItem>
      </GroupItem>
    );
  }

  const renderDataGrid = ({ gridRef, dataSource }) => {
    if(dataSource._storeLoadOptions.filter !== undefined ){
      if(props.totalRowIndex === 0){ 
      props.setTotalRowIndex(dataSource._totalCount);
      }
      if(dataSource._totalCount != props.totalRowIndex){
        if(dataSource._totalCount != -1){
        props.setVarIdCompania("")
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
        focusedRowEnabled={true}
        keyExpr="RowIndex"
        onEditingStart={editarRegistro}
        onRowRemoving={eliminarRegistro}
        onCellPrepared={onCellPrepared}
        onFocusedRowChanged={seleccionarRegistro}
        onRowDblClick={seleccionarRegistroDblClick}
        focusedRowKey={props.focusedRowKey}
      >
        <Editing
          mode="row"
          useIcons={props.showButtons}
          allowUpdating={props.showButtons}
          allowDeleting={props.showButtons}
          texts={textEditing}
        />
        <FilterRow visible={true} showOperationChooser={false} />
        <HeaderFilter visible={false} />
        <FilterPanel visible={false} />

        <Column dataField="IdCompania" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"15%"} allowHeaderFiltering={false} allowSorting={true} />
        <Column dataField="Compania" caption={intl.formatMessage({ id: "ADMINISTRATION.COMPANY.COMPANY" })} width={"35%"} allowHeaderFiltering={false} allowSorting={true} />
        <Column dataField="TipoDocumento" caption={intl.formatMessage({ id: "ADMINISTRATION.COMPANY.DOCUMENTTYPE" })} width={"15%"} allowHeaderFiltering={false} allowSorting={true} />
        <Column dataField="Documento" caption={intl.formatMessage({ id: "ADMINISTRATION.COMPANY.DOCUMENT" })} width={"8%"} allowHeaderFiltering={false} allowSorting={true} />
        <Column dataField="Pais" caption={intl.formatMessage({ id: "ADMINISTRATION.COMPANY.COUNTRY" })} width={"10%"} allowHeaderFiltering={false} allowSorting={true} visible={false} />
        <Column dataType="boolean" caption={intl.formatMessage({ id: "ADMINISTRATION.COMPANY.CONTRACTOR" })} calculateCellValue={obtenerCampoContratista} width={"10%"} alignment={"center"} allowHeaderFiltering={false} allowSorting={true} />
        <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} calculateCellValue={obtenerCampoActivo} width={"10%"} alignment={"center"} allowHeaderFiltering={false} allowSorting={false} />


        <Column type="buttons" width={"3%"}>
          <ColumnButton
            icon="doc"
            hint={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.MAINTENANCE" })}
            onClick={() => setisVisiblePopUpMotivoContrato(true)}
            visible={isVisible}
          />
        </Column>

      </DataGrid>

    );
  }

  const switchVerTodo = () => {
    return (
      <>
        <div className="switch-filtro">
          <ControlSwitch
            id={"switchTodos"}
            checked={vizualizarTodasSwitch}
            onChange={e => {
              setVizualizarTodasSwitch(e.target.checked);
              //debugger;
              if (e.target.checked) { //on
                props.dataSource.loadDataWithFilter({ data: { IdDivision: "" } });
              } else { //off
                props.dataSource.loadDataWithFilter({ data: { IdDivision } });
              }

            }}
          />
        </div>
      </>)
  }


  //:::::::::::::::::::::::::::::::::::::::::::::::
  return (
    <>
      <a id="iddescarga" className="" ></a>
      <PortletHeader
        title={intl.formatMessage({ id: "ACTION.LIST" })}
        toolbar={
          <PortletHeaderToolbar>
            <PortletHeaderToolbar>
              <Button
                icon="plus"
                type="default"
                hint={intl.formatMessage({ id: "ACTION.NEW" })}
                onClick={props.nuevoRegistro}
                visible={props.showButtons}
              />
              &nbsp;
              <Button
                icon="filter"
                type="default"
                hint={intl.formatMessage({ id: "ACTION.FILTER" })}
                onClick={() => setIsActiveFilters(!isActiveFilters)}
                disabled={customDataGridIsBusy}
              />
              &nbsp;
              <Button
                id="idClean"
                icon="refresh"
                type="default"
                hint={intl.formatMessage({ id: "ACTION.CLEAN" })}
                disabled={customDataGridIsBusy}
                onClick={() => cleanEvent()}
              //onClick={()=>resetLoadOptions (vizualizarTodasSwitch) } 
              />
              &nbsp;
              <Button
                icon="fa fa-file-excel"
                type="default"
                hint={intl.formatMessage({ id: "ACTION.EXPORT" })}
                disabled={customDataGridIsBusy}
                onClick={exportReport}
              />

            </PortletHeaderToolbar>
          </PortletHeaderToolbar>
        }
      />
      <PortletBody>


        <CustomDataGrid
          showLog={false}
          uniqueId={"campamentoCompaniaList"}
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
          initialLoadOptions={{ currentPage: 1, pageSize: 20, sort: { column: 'FechaCreacion', order: 'desc' } }}
          filterRowSize='sm'
          visibleCustomFilter={isActiveFilters}
          renderFormContentCustomFilter={renderFormContentCustomFilter}
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

      {/*** PopUp -> Buscar Rquisitos ****/}
      {isVisiblePopUpMotivoContrato && (
        <AdministracionCompaniaContratos
          showPopup={{ isVisiblePopUp: isVisiblePopUpMotivoContrato, setisVisiblePopUp: setisVisiblePopUpMotivoContrato }}
          cancelarEdicion={() => setisVisiblePopUpMotivoContrato(false)}
          varIdCompania={props.varIdCompania}
        />
      )}
    </>
  );
};

CompaniaListPage.propTypes = {
  showButton: PropTypes.bool
};
CompaniaListPage.defaultProps = {
  showButton: true
};

export default injectIntl(CompaniaListPage);
