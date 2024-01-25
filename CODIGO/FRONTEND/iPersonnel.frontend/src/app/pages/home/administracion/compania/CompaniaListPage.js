import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import {
  DataGrid,
  Column,
  Editing,
  FilterRow,
  HeaderFilter,
  FilterPanel
} from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import { isNotEmpty, listarEstadoSimple, listarEstado } from "../../../../../_metronic";
import PropTypes from "prop-types";

//Custom grid: ::::::::::::::::::::::::::::::::
import { Item, GroupItem } from "devextreme-react/form";
import CustomDataGrid from "../../../../partials/components/CustomDataGrid";
import { forceLoadTypes } from "../../../../partials/components/CustomDataGrid/CustomDataGridHelper";
import { storeListar as loadUrl, serviceCompania } from "../../../../api/administracion/compania.api";
import { initialFilter } from "./CompaniaIndexPage";
import { useSelector } from "react-redux";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";
import { handleErrorMessages, handleSuccessMessages } from "../../../../store/ducks/notify-messages";



const CompaniaListPage = props => {
  const { intl } = props;
  const { IdCliente, IdDivision } = useSelector(state => state.perfil.perfilActual);

  const [isActiveFilters, setIsActiveFilters] = useState(false);
  const [customDataGridIsBusy, setCustomDataGridIsBusy] = useState(false);
  const [filterData, setFilterData] = useState({ ...initialFilter, IdCliente, IdDivision });

  const [ifThereAreNoChangesLoadFromStorage, setIfThereAreNoChangesLoadFromStorages] = useState(true);
  const resetLoadOptions = props.resetLoadOptions;
  const [estadoSimple, setEstadoSimple] = useState([]);
  const [estado, setEstado] = useState([]);
  const [vizualizarTodasSwitch, setVizualizarTodasSwitch] = useState(false);
  let dataGridRef = React.useRef();

  const editarRegistro = evt => {
    props.editarRegistro(evt.data);
  };

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

  const cleanEvent = () => {
    setVizualizarTodasSwitch(false);
    props.resetLoadOptions();
    props.setFocusedRowKey();
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

  function cellRenderFile(data) {
    return isNotEmpty(data.value) && (
      <span
        //className="dx-icon-photo"
        title={intl.formatMessage({ id: "ADMINISTRATION.COMPANY.LOGO" })}
      >
        <i class="flaticon2-image-file icon-sm text-warning" ></i>
      </span>
      /*  <div className="dx-command-edit-with-icons">
           
       </div> */
    )
  }


  async function cargarCombos() {
    let estadoSimples = listarEstadoSimple()
    let estado = listarEstado()
    setEstadoSimple(estadoSimples)
    setEstado(estado);
  }


  const [filterDatax, setFilterDatax] = useState({ ...initialFilter, IdCliente, IdDivision });


  const exportReport = async () => {
    let result = JSON.parse(localStorage.getItem('vcg:' + props.uniqueId + ':loadOptions'));
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

    const { IdCliente, IdDivision, IdCompania, Compania, TipoDocumento, Documento, Pais, Activo, ControlarAsistencia, Contratista } = filterDatax;

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
        ControlarAsistencia: isNotEmpty(ControlarAsistencia) ? ControlarAsistencia : "",
        Contratista: isNotEmpty(Contratista) ? Contratista : "",
        TituloHoja: intl.formatMessage({ id: "ADMINISTRATION.EXPORT_COMPANIES" }),
        NombreHoja: intl.formatMessage({ id: "ADMINISTRATION.EXPORT_COMPANIES" }),
        ArrayColumnHeader,
        ArrayColumnId,
        OrderField: selector
      };
      await serviceCompania.exportarExcel(params).then(response => {
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
    cargarCombos();
    if (ifThereAreNoChangesLoadFromStorage) setIfThereAreNoChangesLoadFromStorages(false);
  }, [ifThereAreNoChangesLoadFromStorage]);

  useEffect(() => {
    // console.log("useEffect2|props.filtro:");
    if (props.refreshData) {
      props.refresh();
      props.setRefreshData(false);
    } else {
      props.dataSource.loadDataWithFilter({ data: { IdDivision } });
    }
  }, [props.refreshData]);


  //Filter:
  const keysToGenerateFilter = ['IdCliente', 'IdDivision', 'IdCompania', 'Compania', 'TipoDocumento', 'Documento', 'Pais', 'Activo', 'Contratista'];
  const renderFormContentCustomFilter = ({ getInstance }) => {
    return (
      <GroupItem>
        <GroupItem itemType="group" colCount={5} colSpan={5}>

          <Item render={switchVerTodo}
            label={{ text: intl.formatMessage({ id: "ADMINISTRATION.COMPANY.ALL" }) }}
            colSpan={1}
          >
          </Item>

          <Item
            dataField="Contratista"
            label={{ text: intl.formatMessage({ id: "ADMINISTRATION.COMPANY.ISCONTRACTOR" }) }}
            editorType="dxSelectBox"
            colSpan={2}
            editorOptions={{
              items: estado,
              valueExpr: "Valor",
              displayExpr: "Descripcion",
              showClearButton: true,
              onValueChanged: () => getInstance().filter(),
            }}
          />

          <Item
            dataField="Activo"
            label={{ text: intl.formatMessage({ id: "COMMON.ACTIVE" }) }}
            editorType="dxSelectBox"
            colSpan={2}
            editorOptions={{
              items: estadoSimple,
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

  //DataGrid:
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
        focusedRowEnabled={true}
        keyExpr="RowIndex"
        onEditingStart={editarRegistro}
        onRowRemoving={eliminarRegistro}
        onCellPrepared={onCellPrepared}
        onFocusedRowChanged={seleccionarRegistro}
        onRowDblClick={seleccionarRegistroDblClick}
        focusedRowKey={props.focusedRowKey}
        repaintChangesOnly={true}
        allowColumnReordering={true}
        allowColumnResizing={true}
        columnAutoWidth={true}
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

        <Column dataField="Logo" caption={intl.formatMessage({ id: "ADMINISTRATION.COMPANY.LOGO" })} cellRender={cellRenderFile} width={"5%"} alignment="center" />
        <Column dataField="IdCompania" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"15%"} allowHeaderFiltering={false} allowSorting={true} />
        <Column dataField="Compania" caption={intl.formatMessage({ id: "ADMINISTRATION.COMPANY.COMPANY" })} width={"35%"} allowHeaderFiltering={false} allowSorting={true} />
        <Column dataField="TipoDocumento" caption={intl.formatMessage({ id: "ADMINISTRATION.COMPANY.DOCUMENTTYPE" })} width={"15%"} allowHeaderFiltering={false} allowSorting={true} />
        <Column dataField="Documento" caption={intl.formatMessage({ id: "ADMINISTRATION.COMPANY.DOCUMENT" })} width={"15%"} allowHeaderFiltering={false} allowSorting={true} />
        <Column dataField="Pais" caption={intl.formatMessage({ id: "ADMINISTRATION.COMPANY.COUNTRY" })} width={"15%"} allowHeaderFiltering={false} allowSorting={true} visible={false} />
        <Column dataType="boolean" caption={intl.formatMessage({ id: "ADMINISTRATION.COMPANY.CONTRACTOR" })} calculateCellValue={obtenerCampoContratista} width={"10%"} alignment={"center"} allowHeaderFiltering={false} allowSorting={true} />
        <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} calculateCellValue={obtenerCampoActivo} width={"10%"} alignment={"center"} allowHeaderFiltering={false} allowSorting={false} />

      </DataGrid>
    );
  }

  const switchVerTodo = () => {
    return (
      <>
        <div className="switch-filtro">
          <ControlSwitch checked={vizualizarTodasSwitch}
            onChange={e => {

              setVizualizarTodasSwitch(e.target.checked);
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

              <Button icon="plus"
                type="default"
                hint={intl.formatMessage({ id: "ACTION.NEW" })}
                onClick={props.nuevoRegistro}
                visible={props.showButtons} />
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
                icon="refresh"
                type="default"
                hint={intl.formatMessage({ id: "ACTION.CLEAN" })}
                disabled={customDataGridIsBusy}
                onClick={() => cleanEvent()}
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
          uniqueId={props.uniqueId}//'companiaList'
          dataSource={props.dataSource}
          rowNumberName='RowIndex'
          // loadWhenStartingComponent={props.isFirstDataLoad && !props.refreshData}
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
    </>
  );
};



CompaniaListPage.propTypes = {
  showButton: PropTypes.bool,
  uniqueId: PropTypes.string
};
CompaniaListPage.defaultProps = {
  showButton: true,
  uniqueId: 'companiaList'
};

export default injectIntl(CompaniaListPage);
