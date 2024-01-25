import React, { useEffect, useState, useRef } from "react";
import { injectIntl } from "react-intl"; //Multi-idioma /, useIntl
import { DataGrid, Button as ColumnButton, Column, Editing, MasterDetail, Selection, Summary, TotalItem } from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import { listar as listarAplicaciones } from '../../../../api/sistema/moduloAplicacion.api';

import { exportExcelDataGrid, isNotEmpty } from "../../../../../_metronic";
import PropTypes from "prop-types";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";


const ModuloListPage = props => {

  const { intl } = props;
  const dataGridRef = useRef(null);
  //const intl = useIntl();
  //console.log("ModuloListPage.props", props);
  /***********-Eventos del Modulo-************************/
  const editarRegistro = evt => {
    props.editarRegistro(evt.data);
  };

  const eliminarRegistro = evt => {
    evt.cancel = true;
    props.eliminarRegistro(evt.data);
  };

  const obtenerCampoActivo = rowData => {
    return rowData.Activo === "S";
  };

  const seleccionarRegistro = evt => {
    if (evt.rowIndex === -1) return;
    if (isNotEmpty(evt.row.data)) props.seleccionarRegistro(evt.row.data);

  };

  const textEditing = {
    confirmDeleteMessage: '',
    editRow: intl.formatMessage({ id: "ACTION.EDIT" }),
    deleteRow: intl.formatMessage({ id: "ACTION.REMOVE" }),
  };

  const insertarRegistro = evt => {
    props.insertarRegistro(evt.row.data);
  }

  function onRowExpanding(e) {
    props.expandRow.setExpandRow(e.key);
    props.collapsedRow.setCollapsed(false);
    e.component.collapseAll(-1);
    return;
  }

  function onRowCollapsed(e) {
    props.collapsedRow.setCollapsed(true);
    e.component.collapseRow(e.key);
    return;
  }

  function contentReady(e) {
    if (!props.collapsedRow.collapsed) {
      //props.setCollapsed( props.collapsed );
      e.component.expandRow(props.expandRow.expandRow);
    }
    return;
  }

  //*******************-Eventos de Aplicación-**************************/
  const seleccionarAplicacion = evt => {
    props.seleccionarAplicacion(evt);
  };

  const editarModuloAplicacion = evt => {
    props.editarModuloAplicacion(evt);
  };

  const eliminarModuloAplicacion = evt => {
    props.eliminarModuloAplicacion(evt);
  };

  useEffect(() => {

  }, []);

  return (
    <>
      <PortletHeader
        title={intl.formatMessage({ id: "ACTION.LIST" })}
        toolbar={
          <PortletHeaderToolbar>
            <PortletHeaderToolbar>
              {props.showButtons && (
                <Button
                  icon="plus"
                  type="default"
                  hint={intl.formatMessage({ id: "ACTION.NEW" })}
                  onClick={props.nuevoRegistro}
                />
              )}
              &nbsp;
              <Button
                id="btnExport"
                icon="fa fa-file-excel"
                type="normal"
                hint={intl.formatMessage({ id: "ACTION.EXPORT" })}
                onClick={() => {
                  let title = intl.formatMessage({ id: "SYSTEM.MODULE" });
                  let refDataGrid = dataGridRef.current.instance;
                  let fileName = intl.formatMessage({ id: "SYSTEM.MODULE" });
                  exportExcelDataGrid(title, refDataGrid, fileName);
                }}
              />

            </PortletHeaderToolbar>
          </PortletHeaderToolbar>
        }
      />
      <PortletBody>
        <DataGrid
          id="datagrid-modulo"
          keyExpr="RowIndex"
          ref={dataGridRef}
          dataSource={props.modulosData}
          showBorders={true}
          focusedRowEnabled={true}
          focusedRowKey={props.focusedRowKey}
          onFocusedRowChanged={seleccionarRegistro}

          onEditingStart={editarRegistro}
          onRowRemoving={eliminarRegistro}

          onRowExpanding={onRowExpanding}
          onRowCollapsed={onRowCollapsed}
          onContentReady={contentReady}

        >
          <Editing
            mode="row"
            useIcons={props.showButtons}
            allowUpdating={props.showButtons}
            allowDeleting={props.showButtons}
            texts={textEditing}
          />
          <Selection mode="single" />

          <Column dataField="IdModulo" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"15%"} alignment={"center"} />
          <Column dataField="Modulo" caption={intl.formatMessage({ id: "SYSTEM.MODULE" })} width={"55%"} />

          <Column dataField="Licencia" caption={intl.formatMessage({ id: "SYSTEM.LICENSE" })} width={"10%"} alignment={"center"} visible={props.showColumnLicense} />

          <Column dataField="Orden" caption={intl.formatMessage({ id: "SYSTEM.MODULE.ORDER" })} width={"10%"} alignment={"center"} visible={props.showColumnOrder} />

          <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} calculateCellValue={obtenerCampoActivo} width={"10%"} />
          <Column type="buttons" width={"10%"} visible={props.showButtons} >
            <ColumnButton icon="share" hint={intl.formatMessage({ id: "SYSTEM.APLICATION.ADD" })} onClick={insertarRegistro} />
            <ColumnButton name="edit" />
            <ColumnButton name="delete" />
          </Column>

          <MasterDetail enabled={true} component={(dta) => (AplicacionListPage({ data: dta.data, intl, seleccionarAplicacion, editarModuloAplicacion, eliminarModuloAplicacion, showButtons: props.showButtons }))} />

          <Summary>
            <TotalItem
            cssClass="classColorPaginador_"
              column="IdModulo"
              summaryType="count"
              displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
            />
          </Summary>

        </DataGrid>

      </PortletBody>
    </>
  );
};
ModuloListPage.prototype = {
  showButtons: PropTypes.bool,
  modoEdicion: PropTypes.bool,
  showColumnLicense: PropTypes.bool,
  showColumnOrder: PropTypes.bool,
}
ModuloListPage.defaultProps = {
  showButtons: true,
  modoEdicion: true,
  showColumnLicense: false,
  showColumnOrder: true,

}
//Asignar component listado de aplicaciones.
const AplicacionListPage = props => {

  const { intl } = props;

  const [dataSource, setDataSource] = useState([]);
  const [focusedRowKeyAplicacion, setFocusedRowKeyAplicacion] = useState();
  const splashScreen = document.getElementById("splash-screen");

  const editarModuloAplicacion = evt => {
    props.editarModuloAplicacion(evt.data);
  };

  const eliminarModuloAplicacion = evt => {
    props.eliminarModuloAplicacion(evt.data);
  };

  const obtenerCampoActivo = rowData => {
    return rowData.Activo === "S";
  };

  const seleccionarAplicacion = evt => {

    if (evt.rowIndex === -1) return;

    if (isNotEmpty(evt.row.data)) {
      const { RowIndex } = evt.row.data;
      setFocusedRowKeyAplicacion(RowIndex);
      props.seleccionarAplicacion(evt.row.data);
    }

  };

  function onCellPrepared(e) {

    if (e.rowType === 'data') {
      if (e.data.Activo === 'N') {
        e.cellElement.style.color = 'red';
      }
    }
  }
  const textEditing = {
    confirmDeleteMessage: '',
    editRow: intl.formatMessage({ id: "ACTION.EDIT" }),
    deleteRow: intl.formatMessage({ id: "ACTION.REMOVE" }),
  };

  async function listarModuloAplicacion(idModulo) {
    splashScreen.classList.remove("hidden");
    let params = {
      IdModulo: idModulo,
      IdAplicacion: "%"
    };
    await listarAplicaciones(params).then((data) => {
      setDataSource(data);
      //Obtener Focus de dataGrid
      getRowFocus();
    }).finally(() => {
      splashScreen.classList.add("hidden");
    });

  }
  const getRowFocus = () => {
    let dataRow = JSON.parse(localStorage.getItem('dataRowAplication'));
    if (isNotEmpty(dataRow)) {
      const { RowIndex } = dataRow;
      setFocusedRowKeyAplicacion(RowIndex);
    }
  }

  useEffect(() => {
    //listarModuloAplicacion(props.data.data);
    console.log("useEffect.props.data", props.data);
    console.log("useEffect.props.data.data", props.data.data);
    const { IdModulo } = props.data.data;
    if (IdModulo) {
      listarModuloAplicacion(IdModulo);
      getRowFocus();
    }
  }, []);

  return (

    <>
      <div className="grid_detail_title">
        {intl.formatMessage({ id: "SYSTEM.MODULEAPLICATION.APLICATIONS" })}
      </div>
      <DataGrid
        id="datagrid-aplicacion"
        dataSource={dataSource}
        showBorders={true}
        columnAutoWidth={true}
        focusedRowEnabled={true}
        focusedRowKey={focusedRowKeyAplicacion}
        keyExpr="RowIndex"
        onCellPrepared={onCellPrepared}
        onEditingStart={editarModuloAplicacion}
        onRowRemoving={eliminarModuloAplicacion}
        onFocusedRowChanged={seleccionarAplicacion}

      >
        <Editing
          mode="row"
          useIcons={props.showButtons}
          allowUpdating={props.showButtons}
          allowDeleting={props.showButtons}
          texts={textEditing}
        />
        <Column dataField="RowIndex" caption="#" width={"10%"} alignment={"center"} />
        <Column dataField="IdAplicacion" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"20%"} alignment={"center"} />
        <Column dataField="Aplicacion" caption={intl.formatMessage({ id: "SYSTEM.MODULEAPLICATION.APLICATION" })} width={"40%"} />
        <Column dataField="TipoAplicacion" caption={intl.formatMessage({ id: "SYSTEM.APLICATION.TYPE" })} alignment={"center"} width={"30%"} />
        <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} calculateCellValue={obtenerCampoActivo} width={"10%"} />
      </DataGrid>

    </>
  );
};


export default injectIntl(WithLoandingPanel(ModuloListPage));
