import React, { useState, useEffect } from "react";
import { Button } from 'devextreme-react';
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";

import { injectIntl } from "react-intl";

// -- Data Grid Filter
import CustomDataGrid from "../../../../partials/components/CustomDataGrid";
import { storeListar as loadUrl } from "../../../../api/transporte/manifiesto.api";
import { forceLoadTypes } from "../../../../partials/components/CustomDataGrid/CustomDataGridHelper";
import { initialFilter } from "./ManifiestoIndexPage";
import HeaderInformation from "../../../../partials/components/HeaderInformation";
import { Item, GroupItem } from "devextreme-react/form";
import { DataGrid, Column, FilterRow, HeaderFilter, FilterPanel, Editing  } from "devextreme-react/data-grid";
//--------------------------------------------------- IMG
 import imgClose from "../../../../img/close.png"
 import imgOpen from "../../../../img/open.png"
 import imgEmbarque from "../../../../img/embarcado.png"
 import imgUrbanito from "../../../../img/urbanito.png"
 import PropTypes from 'prop-types';
 import { convertyyyyMMddToDateTime, dateFormat, isNotEmpty,listarEstadoManifiesto,listarEstadoAprobado  } from "../../../../../_metronic";
          
 import { service  } from "../../../../api/transporte/tipoProgramacion.api";

const ManifiestoListPage = props => {

  const { intl, setLoading } = props;
  const { IdProgramacion } = props.selected;
  const [tiposProgramacion, setTiposProgramacion] = useState([]);

  //Variables de CustomerDataGrid
  const [isActiveFilters, setIsActiveFilters] = useState(false);
  const [customDataGridIsBusy, setCustomDataGridIsBusy] = useState(false);
  const [filterData, setFilterData] = useState({
    ...initialFilter  ,
    IdProgramacion : isNotEmpty(IdProgramacion) ? IdProgramacion :"",
  });
  // PAGINATION
  // ------------------------------
  const [ifThereAreNoChangesLoadFromStorage, setIfThereAreNoChangesLoadFromStorages] = useState(true);
  const resetLoadOptions = props.resetLoadOptions;

  const editarRegistro = evt => {
    props.editarRegistro(evt.data);
};

  const eliminarRegistro = evt => {
    evt.cancel = true;
    props.eliminarRegistro(evt.data);
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

  const obtenerCampoActivo = rowData => {
    return rowData.Activo === "S";
  }

  function onCellPrepared(e) {
    if (e.rowType === 'data') {
      if (e.data.Activo === 'N') {
        e.cellElement.style.color = 'red';
      }
    }
  }

  const textEditing = {
    confirmDeleteMessage: "",
    editRow: intl.formatMessage({ id: "ACTION.EDIT" }),
  };

  const cargarCombos = async () => {
		await service.obtenerTodos({IdTipoProgramacion :'%'}).then(response => {
			if (isNotEmpty(response)) setTiposProgramacion(response);
		});
	}

	const keysToGenerateFilter = [
    'IdCliente',
    'IdProgramacion',
		'IdVehiculo',
		'IdPiloto',
		'IdCopiloto',
		'IdCopiloto',
		'IdManifiesto',
		'Ruta',
		'FechaProgramada',
		'HoraProgramada',
		'Placa',
		'Unidad',
		'TipoProgramacion',
		'FechaInicio',
    'FechaFin',
    'Piloto',
    'Estado',
    'Aprobado'
	];

	const transformData = {
		FechaInicio: (rawValue) => dateFormat(rawValue, 'yyyyMMdd hh:mm'),
		FechaFin: (rawValue) => dateFormat(rawValue, 'yyyyMMdd hh:mm'),
	}

	const reverseTransformData = {
		FechaInicio: (value) => convertyyyyMMddToDateTime(value),
		FechaFin: (value) => convertyyyyMMddToDateTime(value),
	}

	function cellRenderImage(param) {
		if (param && param.data) {
			const { Estado, IdTipoRuta } = param.data;

			let ImgUrl = null;
			const f = (Estado || 'abierto').toLowerCase();
			const esAb = f === 'abierto';
			const esCe = f === 'cerrado';

			if (esAb) {
				ImgUrl = imgOpen;
			} else if (esCe) {
				ImgUrl = imgClose;
			} else {
				ImgUrl = IdTipoRuta === "URBANO" ? imgUrbanito : imgEmbarque;
			}

			return <img src={ImgUrl} alt="" />;
		}
	}

    //-CustomerDataGrid-UseEffect-ini->
  useEffect(() => {
       cargarCombos();
    if (ifThereAreNoChangesLoadFromStorage) setIfThereAreNoChangesLoadFromStorages(false);
  }, [ifThereAreNoChangesLoadFromStorage])

  useEffect(() => {
    if (props.refreshData) {
      props.refresh();
      props.setRefreshData(false);
    }
  }, [props.refreshData]);

  useEffect(() => {
    if (IdProgramacion) {
      setTimeout(() => {
        props.dataSource.loadDataWithFilter({ data: { 
          IdProgramacion,
          } });
      }, 500)
    }
  }, [IdProgramacion]);

	const renderFormContentCustomFilter = ({ getInstance }) => {
		return (
			<GroupItem>
				<GroupItem itemType="group" colCount={3}>

					<Item 
            dataField="TipoProgramacion"
            label={{ text: intl.formatMessage({ id: "TRANSPORTE.PROGRAMMING.TYPE" }) }}
						editorType="dxSelectBox"
						editorOptions={{
							items: tiposProgramacion,
							showClearButton: true,
							valueExpr: "IdTipoProgramacion",
							displayExpr: "TipoProgramacion",
							onValueChanged: (e) => getInstance().filter(),
						}}
					/>

					<Item dataField="FechaInicio"
            label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.STARTDATE" }) }}
						editorType="dxDateBox"
						editorOptions={{
							type: "datetime",
							showClearButton: true,
							displayFormat: "dd/MM/yyyy HH:mm",
						  onValueChanged: (e) => {
                getInstance().filter()
              }

						}}
					/>

					<Item dataField="FechaFin"
            label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.ENDDATE" }) }}
            editorType="dxDateBox"
						editorOptions={{
							type: "datetime",
							showClearButton: true,
							displayFormat: "dd/MM/yyyy HH:mm",
              onValueChanged: (e) => {
                getInstance().filter()
              }
						}}
					/>

				</GroupItem>
 
          <GroupItem itemType="group" colCount={3}>

            <Item dataField="Piloto"
              label={{ text: intl.formatMessage({ id: "TRANSPORTE.MANIFEST.PILOT" }) }}
              editorOptions={{
                hoverStateEnabled: false,
                inputAttr: { 'style': 'text-transform: uppercase' },
                showClearButton: true,
                onEnterKey: (e) => getInstance().filter(),
              }}
            />

            <Item
              dataField="Estado"
              label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
              editorType="dxSelectBox"
              editorOptions={{
                items: listarEstadoManifiesto(),
                valueExpr: "Valor",
                displayExpr: "Descripcion",
                showClearButton: true,
                onValueChanged: (e) => getInstance().filter(),
              }}
            />

            <Item
              dataField="Aprobado"
              label={{ text: intl.formatMessage({ id: "TRANSPORTE.MANIFEST.STATUS" }) }}
              editorType="dxSelectBox"
              editorOptions={{
                items: listarEstadoAprobado(),
                valueExpr: "Valor",
                displayExpr: "Descripcion",
                showClearButton: true,
                onValueChanged: (e) => getInstance().filter(),
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
		props.setVarIdManifiesto("")
		props.setFocusedRowKey();
		props.setTotalRowIndex(dataSource._totalCount);
		}
	}
}
    return (
      <DataGrid
        dataSource={dataSource}
        ref={gridRef}
        keyExpr="RowIndex"
        showBorders={true}
        focusedRowEnabled={true}
        focusedRowKey={props.focusedRowKey}
        onEditingStart={editarRegistro}
        onRowRemoving={eliminarRegistro}
        onFocusedRowChanged={seleccionarRegistro}
        onRowDblClick={seleccionarRegistroDblClick}
        onCellPrepared={onCellPrepared}
        repaintChangesOnly={true}
        >
        <Editing mode="row"
          useIcons={props.showButtons}
          allowUpdating={props.showButtons}
          allowDeleting={props.showButtons}
          texts={textEditing} />
        <FilterRow visible={true} showOperationChooser={false} />
        <HeaderFilter visible={false} />
        <FilterPanel visible={false} />

        <Column dataField="RowIndex" caption="#" visible={false} allowSorting={false} allowFiltering={false} allowHeaderFiltering={false} />
				<Column dataField="" width={"5%"} alignment="center" cellRender={cellRenderImage} allowSorting={false} allowFiltering={false} allowHeaderFiltering={false} />
				<Column dataField="IdManifiesto"   caption={intl.formatMessage({ id: "CONFIG.MENU.TRANSPORTE.MANIFIESTO" })} alignment="center"  allowSorting={true} allowFiltering={true} allowHeaderFiltering={false} />
				<Column dataField="Ruta" caption={intl.formatMessage({ id: "CONFIG.MENU.TRANSPORTE.RUTA" })} width={"15%"} alignment="center"  allowSorting={true} allowFiltering={true} allowHeaderFiltering={false} />
				<Column dataField="FechaProgramada" caption={intl.formatMessage({ id: "ACCESS.PERSON.MARK.DATE" })} alignment="center" ColumnHeaderAutoHeight={true}  allowSorting={true} allowFiltering={true} allowHeaderFiltering={false} />
				<Column dataField="HoraProgramada" caption={intl.formatMessage({ id: "ACCESS.PERSON.MARK.HOUR" })}  alignment="center"allowSorting={true} allowFiltering={true} allowHeaderFiltering={false} />
				<Column dataField="Placa"  caption={intl.formatMessage({ id: "ACCESS.PERSON.MARK.PLATE" })}  alignment="center"  allowSorting={true} allowFiltering={true} allowHeaderFiltering={false} />
				<Column dataField="Unidad" caption={intl.formatMessage({ id: "SYSTEM.REPOSITORY.UNIT" })} alignment="center" allowSorting={true} allowFiltering={true} allowHeaderFiltering={false} />
				<Column dataField="NumeroAsientosReservados" caption={intl.formatMessage({ id: "TRANSPORTE.MANIFEST.RESERVED" })}  alignment="center" allowSorting={false} allowFiltering={false} allowHeaderFiltering={false} />
				<Column dataField="NumeroAsientosOcupados" caption={intl.formatMessage({ id: "TRANSPORTE.MANIFEST.BUSY" })}  alignment="center" allowSorting={false} allowFiltering={false} allowHeaderFiltering={false} />
				<Column dataField="NumeroAsientosLibres" caption={intl.formatMessage({ id: "TRANSPORTE.MANIFEST.FREE" })} alignment="center"  allowSorting={false} allowFiltering={false} allowHeaderFiltering={false} />
				<Column dataField="Piloto"  caption={intl.formatMessage({ id: "TRANSPORTE.MANIFEST.PILOT" })}  width={"15%"} alignment="left" allowSorting={true}  allowFiltering={true} allowHeaderFiltering={false} />
				<Column dataType="boolean"  caption={intl.formatMessage({ id: "COMMON.STATE" })} calculateCellValue={obtenerCampoActivo} visible={false} allowSorting={false} allowFiltering={false} allowHeaderFiltering={false} />

      </DataGrid>
    );
  }

  return (
    <>
        <HeaderInformation
          data={props.showHeaderInformation ? props.getInfo() : []}
          visible={props.showHeaderInformation} labelLocation={'left'} colCount={6}
          toolbar={
            <PortletHeader
              title=""
              toolbar={
                <PortletHeaderToolbar>
                  <PortletHeaderToolbar>
                        <Button
                        icon="filter"
                        type="default"
                        hint={intl.formatMessage({ id: "ACTION.FILTER" })}
                        onClick={() => setIsActiveFilters(!isActiveFilters)}
                        disabled={customDataGridIsBusy}
                        />
                        &nbsp;
                        <Button icon="fa fa-plus"
                        type="default"
                        hint={intl.formatMessage({ id: "ACTION.NEW" })}
                        visible={props.showButtons}
                        onClick={props.nuevoRegistro}
                        disabled={customDataGridIsBusy}
                        />
                        &nbsp;
                        <Button
                        icon="refresh" //fa fa-broom
                        type="default"
                        hint={intl.formatMessage({ id: "ACTION.CLEAN" })}
                        disabled={customDataGridIsBusy}
                        onClick={resetLoadOptions} 
                        />
                  </PortletHeaderToolbar>
                </PortletHeaderToolbar>
              }
            />
          } />
      
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
          initialLoadOptions={{ currentPage: 1, pageSize: 20, sort: { column: 'FechaProgramada', order: 'asc' } }}
          filterRowSize='sm'
          summaryCountFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0} de {1} `}
          // CUSTOM FILTER
          visibleCustomFilter={isActiveFilters}
          renderFormContentCustomFilter={renderFormContentCustomFilter}
          transformData={transformData}
          reverseTransformData={reverseTransformData}
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

ManifiestoListPage.propTypes = {
  titulo: PropTypes.string,
  modoEdicion: PropTypes.bool,
  showButtons: PropTypes.bool,
  showAppBar: PropTypes.bool,
  showHeaderInformation: PropTypes.bool,
  uniqueId: PropTypes.string,
  selected: PropTypes.object,

}
ManifiestoListPage.defaultProps = {
  titulo: "",
  modoEdicion: false,
  showButtons: true,
  showAppBar: true,
  showHeaderInformation: false,
  uniqueId: 'ManifiestoListPage',
  selected: { IdProgramacion: "" }
}

export default injectIntl(ManifiestoListPage);
