import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import Tooltip from '@material-ui/core/Tooltip';
import {
  DataGrid,
  Column,
  Editing,
  FilterRow,
} from "devextreme-react/data-grid";
import { Item, GroupItem } from "devextreme-react/form";
import { Button } from "devextreme-react";
import {
  PortletBody,
  PortletHeader,
  PortletHeaderToolbar,
} from "../../../../partials/content/Portlet";
import { DoubleLinePersona } from "../../../../partials/content/Grid/DoubleLineLabel";

import { isNotEmpty, toAbsoluteUrl, listarEstadoSimple, clasificarCompania } from "../../../../../_metronic";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import HeaderInformation from "../../../../partials/components/HeaderInformation";
//-CustomerDataGrid-Import>
import CustomDataGrid from "../../../../partials/components/CustomDataGrid";
import { forceLoadTypes } from "../../../../partials/components/CustomDataGrid/CustomDataGridHelper";
import { storeFiltrar as loadUrl } from "../../../../api/seguridad/usuario.api";
import { initialFilter } from "./UsuarioIndexPage";
import { listarAplicacionPorPerfil } from "../../../../api/sistema/moduloAplicacion.api";
import { servicePerfil } from "../../../../api/seguridad/perfil.api";
import { listarModuloPorPerfil } from "../../../../api/sistema/modulo.api";
import AdministracionCompaniaBuscar from "../../../../partials/components/AdministracionCompaniaBuscar";

const UsuarioListPage = (props) => {

  const { intl, setLoading } = props;
  const { IdCliente, IdDivision } = useSelector((state) => state.perfil.perfilActual);

  const [valuePerfil, setValuePerfil] = useState("");

  const { IdPerfil } = props.selected;

  //-CustomerDataGrid-Variables-ini->
  const [customDataGridIsBusy, setCustomDataGridIsBusy] = useState(false);
  const [filterData, setFilterData] = useState({ ...initialFilter, IdCliente, IdPerfil });

  const [ifThereAreNoChangesLoadFromStorage, setIfThereAreNoChangesLoadFromStorages] = useState(true);
  const resetLoadOptions = props.resetLoadOptions;
  //-CustomerDataGrid-Variables-end->

  //Variables de CustomerDataGrid
  const [isActiveFilters, setIsActiveFilters] = useState(false);

  const [cmbPerfil, setCmbPerfil] = useState([]);
  const [cmbModulo, setCmbModulo] = useState([]);
  const [cmbAplicacion, setCmbAplicacion] = useState([]);
  const [estadoSimple, setEstadoSimple] = useState([]);
  const [isVisiblePopUpCompaniaContratista, setisVisiblePopUpCompaniaContratista] = useState(false);

  async function cargarCombos() {
    let dataPerfil = await servicePerfil.obtenerTodos({ IdCliente: IdCliente, IdPerfil: '%' });
    setCmbPerfil(dataPerfil);

    let dataEstado = listarEstadoSimple();
    setEstadoSimple(dataEstado);
  }

  async function onValueChangedPerfil(value) {
    if (isNotEmpty(value)) {
      setValuePerfil(value);
      await listarModuloPorPerfil({
        IdCliente: IdCliente,
        IdPerfil: value
      }).then(data => {
        setCmbAplicacion([]);
        setCmbModulo(data);
      });
    } else {
      setValuePerfil("");
      setCmbModulo([]);
      setCmbAplicacion([]);
    }

  }

  async function onValueChangedModulo(value) {
    if (isNotEmpty(value)) {
      await listarAplicacionPorPerfil({
        IdPerfil: valuePerfil,
        IdModulo: value
      }).then(aplicaciones => {
        setCmbAplicacion(aplicaciones);
      });
    } else {
      setCmbAplicacion([]);
    }
  }


  const editarRegistro = (evt) => {
    props.editarRegistro(evt.data);
  };

  const eliminarRegistro = (evt) => {
    evt.cancel = true;
    props.eliminarRegistro(evt.data);
  };

  const obtenerCampoActivo = (rowData) => {
    return rowData.Activo === "S";
  };

  const cellRenderContratista = (rowData) => {
    if (rowData && rowData.data) {
      const { Contratista, IdPersona } = rowData.data;

      if (Contratista === "S") {
        return <>
          <i className="fas fa-circle  text-success icon-5x" >  &nbsp; {intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" }).toUpperCase() + "- " + IdPersona} </i>
        </>
      }
      else if (Contratista === "N") {
        return <>
          <i className="fas fa-circle  text-info icon-5x" >  &nbsp; {intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" }).toUpperCase() + "- " + IdPersona}  </i>
        </>
      } else {
        return <span>
          {/* <i className="fas fa-circle  text-warning icon-5x" >   &nbsp;{intl.formatMessage({ id: "COMMON.EARRING" }).toUpperCase()}</i> */}
        </span>
      }
    }
  };

  const seleccionarRegistro = (evt) => {
    if (evt.rowIndex === -1) return;
    if (isNotEmpty(evt.row.data)) props.seleccionarRegistro(evt.row.data);
  };

  const seleccionarRegistroDblClick = evt => {
    if (evt.data === undefined) return;
    if (isNotEmpty(evt.data)) {
      props.verRegistroDblClick(evt.data);
    };
  }

  function onCellPrepared(e) {
    if (e.rowType === "data") {
      if (e.data.Activo === "N") {
        e.cellElement.style.color = "red";
      }
    }
  }

  const textEditing = {
    confirmDeleteMessage: '',
    editRow: intl.formatMessage({ id: "ACTION.EDIT" }),
    deleteRow: intl.formatMessage({ id: "ACTION.REMOVE" }),
  };

  const selectCompaniaContratista = dataPopup => {
    const { IdCompania, Compania } = dataPopup[0];
    props.dataSource.loadDataWithFilter({ data: { IdCompania, Compania } })
    setisVisiblePopUpCompaniaContratista(false);
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
    if (isNotEmpty(IdPerfil)) {
      setTimeout(() => {
        props.dataSource.loadDataWithFilter({ data: { IdPerfil, IdCliente } });
      }, 500)
    }
  }, [IdPerfil]);
  // -CustomerDataGrid-UseEffect-end->

  //-CustomerDataGrid-Filter
  const keysToGenerateFilter = [
    'IdCliente',
    'IdPerfil',
    'IdUsuario',
    'NombreCompleto',
    'Documento',
    'ConfiguracionLogeo',
    'Contratista',
    'Activo',
    'IdModulo',
    'IdAplicacion',
    'Correo',
    'IdCompania'
  ];

  const renderFormContentCustomFilter = ({ getInstance }) => {
    return (
      <GroupItem>
        <GroupItem itemType="group" colCount={3} colSpan={3}>

          <Item
            dataField="IdPerfil"
            label={{ text: intl.formatMessage({ id: "ACCESS.PROFILE" }) }}
            editorType="dxSelectBox"
            editorOptions={{
              items: cmbPerfil,
              valueExpr: "IdPerfil",
              displayExpr: "Perfil",
              searchEnabled: true,
              showClearButton: true,
              onValueChanged: (e => {
                onValueChangedPerfil(e.value);
                getInstance().filter()
              }),
            }}
          />

          <Item
            dataField="IdModulo"
            label={{ text: intl.formatMessage({ id: "SECURITY.PROFILE.MENU.MODULE" }) }}
            editorType="dxSelectBox"
            editorOptions={{
              items: cmbModulo,
              valueExpr: "IdModulo",
              displayExpr: "Modulo",
              searchEnabled: true,
              showClearButton: true,
              onValueChanged: (e => { onValueChangedModulo(e.value); getInstance().filter() }),
            }}
          />

          <Item
            dataField="IdAplicacion"
            label={{ text: intl.formatMessage({ id: "SECURITY.PROFILE.MENU.APLICATION" }) }}
            editorType="dxSelectBox"
            editorOptions={{
              items: cmbAplicacion,
              valueExpr: "IdAplicacion",
              displayExpr: "Aplicacion",
              searchEnabled: true,
              showClearButton: true,
              onValueChanged: () => getInstance().filter(),
            }}
          />


          <Item
            dataField="Contratista"
            label={{ text: intl.formatMessage({ id: "ADMINISTRATION.COMPANY.CONTRACTOR" }) }}
            editorType="dxSelectBox"
            editorOptions={{
              items: clasificarCompania,
              valueExpr: "Valor",
              displayExpr: "Descripcion",
              showClearButton: true,
              onValueChanged: () => getInstance().filter(),
            }}
          />

          <Item
            colSpan={1}
            dataField="Compania"
            label={{ text: intl.formatMessage({ id: "ADMINISTRATION.COMPANY.COMPANY" }), }}
            editorOptions={{
              readOnly: true,
              hoverStateEnabled: false,
              inputAttr: { style: "text-transform: uppercase" },
              showClearButton: true,
              buttons: [
                {
                  name: "search",
                  location: "after",
                  useSubmitBehavior: true,
                  options: {
                    stylingMode: "text",
                    icon: "search",
                    disabled: false,
                    onClick: () => {
                      setisVisiblePopUpCompaniaContratista(true);
                    },
                  },
                },
              ],
            }}
          />

          <Item
            dataField="Activo"
            label={{ text: intl.formatMessage({ id: "COMMON.ACTIVE" }) }}
            editorType="dxSelectBox"
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

  const renderDataGrid = ({ gridRef, dataSource }) => {
    if (dataSource._storeLoadOptions.filter !== undefined) {
      if (props.totalRowIndex === 0) {
        props.setTotalRowIndex(dataSource._totalCount);
      }
      if (dataSource._totalCount != props.totalRowIndex) {
        if (dataSource._totalCount != -1) {
          props.setVarIdUsuario("")
          props.setFocusedRowKey();
          props.setTotalRowIndex(dataSource._totalCount);
        }
      }
    }

    return (
      <DataGrid
        dataSource={dataSource}
        ref={gridRef}
        showBorders={true}
        focusedRowEnabled={true}
        keyExpr="RowIndex"
        onEditingStart={editarRegistro}
        onRowRemoving={eliminarRegistro}
        onFocusedRowChanged={seleccionarRegistro}
        focusedRowKey={props.focusedRowKey}
        onRowDblClick={seleccionarRegistroDblClick}
        onCellPrepared={onCellPrepared}
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
        <Column
          dataField="IdUsuario"
          caption={intl.formatMessage({ id: "SECURITY.USER.IDENTIFIER" })}
          width={"18%"}
          allowSorting={true}
          allowSearch={true}
          allowFiltering={true}
        />
        <Column
          dataField="NombreCompleto"
          caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.FULLNAME" })}
          width={"23%"}
          cellRender={DoubleLinePersona}
          allowSorting={true}
          allowSearch={true}
          allowFiltering={true}
        />
        <Column
          dataField="TipoDocumento"
          caption={intl.formatMessage({
            id: "COMMON.TYPE",
          })}
          width={"8%"}
          alignment={"center"}
          allowSearch={false}
          allowFiltering={false}
        />
        <Column
          dataField="Documento"
          caption={intl.formatMessage({ id: "SECURITY.USER.DOCUMENTNUMBER" })}
          allowSorting={true}
          allowFiltering={true}
          allowHeaderFiltering={false}
          alignment={"left"}
          width={"12%"}
        />
        <Column
          dataField="Correo"
          caption={intl.formatMessage({
            id: "SECURITY.USER.MAIL",
          })}
          width={"25%"}
          allowSorting={true}
          allowSearch={true}
          allowFiltering={true}
        />
        <Column
          dataField={"Contratista"}
          caption={intl.formatMessage({ id: "ADMINISTRATION.COMPANY.CONTRACTOR" })}
          cellRender={cellRenderContratista}
          width={"10%"}
          alignment={"left"}
          allowSorting={true}
          allowSearch={false}
          allowFiltering={false}
        />

        <Column
          dataType="boolean"
          caption={intl.formatMessage({ id: "COMMON.ACTIVE" })}
          calculateCellValue={obtenerCampoActivo}
          width={"7%"}
          allowSorting={false}
          allowFiltering={false}
        />

      </DataGrid>
    );
  }
  //-CustomerDataGrid-DataGrid- end

  return (
    <>

      {props.showHeaderInformation && (
        <HeaderInformation data={props.getInfo()} visible={props.showHeaderInformation} labelLocation={'left'} colCount={6}
          toolbar={
            <PortletHeader
              title=""
              toolbar={
                <PortletHeaderToolbar>
                  <Button
                    icon="plus"
                    type="default"
                    hint={intl.formatMessage({ id: "ACTION.NEW" })}
                    onClick={props.nuevoRegistro}
                  />
                  &nbsp;
                  <Button
                    icon="filter"
                    type="default"
                    hint={intl.formatMessage({ id: "ACTION.FILTER" })}
                    onClick={() => setIsActiveFilters(!isActiveFilters)}
                  />
                  &nbsp;
                  <Button icon="refresh"
                    id="btnRefresh"
                    type="default"
                    hint={intl.formatMessage({ id: "ACTION.CLEAN" })}
                    onClick={resetLoadOptions}
                    disabled={customDataGridIsBusy} />
                  &nbsp;
                  <Button
                    icon="fa fa-times-circle"
                    type="normal"
                    hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
                    onClick={props.cancelarEdicion}
                  />
                </PortletHeaderToolbar>
              }
            />

          } />
      )}
      {!props.showHeaderInformation && (
        <PortletHeader
          title=""
          toolbar={
            <PortletHeaderToolbar>
              <Button
                icon="plus"
                type="default"
                hint={intl.formatMessage({ id: "ACTION.NEW" })}
                onClick={props.nuevoRegistro}
                disabled={customDataGridIsBusy}
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
              <Button icon="refresh" //fa fa-broom
                type="default"
                hint={intl.formatMessage({ id: "ACTION.CLEAN" })}
                disabled={customDataGridIsBusy}
                onClick={resetLoadOptions} />

            </PortletHeaderToolbar>
          }
        />

      )}

      <PortletBody>

        <CustomDataGrid
          showLog={false}
          uniqueId={props.uniqueId} //'posicionesList'
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
          initialLoadOptions={{ currentPage: 1, pageSize: 20, sort: { column: 'NombreCompleto', order: 'asc' } }}
          filterRowSize='sm'
          summaryCountFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0} de {1} `}
          // CUSTOM FILTER
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

      {/* PopUp Compañia */}
      {isVisiblePopUpCompaniaContratista && (
        <AdministracionCompaniaBuscar
          selectData={selectCompaniaContratista}
          showPopup={{ isVisiblePopUp: isVisiblePopUpCompaniaContratista, setisVisiblePopUp: setisVisiblePopUpCompaniaContratista }}
          cancelarEdicion={() => setisVisiblePopUpCompaniaContratista(false)}
          uniqueId={"UsuariosListPage"}
          isContratista={"S"}
        />
      )}

    </>
  );
};

UsuarioListPage.propTypes = {
  showHeaderInformation: PropTypes.bool,
  titulo: PropTypes.string,
  modoEdicion: PropTypes.bool,
  showButtons: PropTypes.bool,
};
UsuarioListPage.defaultProps = {
  showHeaderInformation: false,
  titulo: "",
  modoEdicion: false,
  showButtons: true,

};

export default injectIntl(UsuarioListPage);
