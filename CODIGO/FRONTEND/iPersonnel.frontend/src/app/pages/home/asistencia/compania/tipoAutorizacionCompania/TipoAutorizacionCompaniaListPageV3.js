import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";

import {
  DataGrid,
  Column,
  Button as ColumnButton,
  Editing,
  MasterDetail,
  Selection,
  Summary,
  TotalItem
} from "devextreme-react/data-grid";

import { Button as ButtonDev } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import { isNotEmpty } from "../../../../../../_metronic";
import { listar as listarAUT } from "../../../../../api/asistencia/autorizador.api";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";

const TipoAutorizacionCompaniaListPageV3 = props => {

    const { intl } = props;

    const editarRegistro = evt => {
        props.editarRegistro(evt.data);
        props.invokeMethod.SetInvokeContentReady(false);
    };

    const eliminarRegistro = evt => {
        evt.cancel = true;
        props.eliminarRegistro(evt.data);
    };
    const insertarRegistro = evt => {
        props.insertarRegistro(evt.row.data);
    }
    const obtenerCampoActivo = rowData => {
        return rowData.Activo === "S";
    };

    const seleccionarRegistro = evt => {
        if (evt.rowIndex === -1) return;
        if (isNotEmpty(evt.row.data)) props.seleccionarRegistro(evt.row.data);

    };

    function onCellPrepared(e) {
        if (e.rowType === 'data') {
            if (e.data.Activo === 'N') {
                e.cellElement.style.color = 'red';
            }
        }
    }

    const textEditing = {
        confirmDeleteMessage:'',
        editRow: intl.formatMessage({ id: "ACTION.EDIT" }),
        deleteRow: intl.formatMessage({ id: "ACTION.REMOVE" }),
    };

    function contentReady(e) {
      console.log("contentReady|e:", e);
      console.log("contentReady|invokeContentReady:", props.invokeMethod.invokeContentReady);

      if (props.invokeMethod.invokeContentReady) {
        setTimeout(() => {
          if (!props.collapsedRow.collapsed) {
            e.component.expandRow(props.expandRow.expandRow);
            props.invokeMethod.SetInvokeContentReady(false);
          }
          return;
        }, 100);
      }
    }
  
    function onRowExpanding(e) {
      console.log("onRowExpanding|e:", e);
      props.invokeMethod.SetInvokeContentReady(true);
      props.collapsedRow.setCollapsed(false); // |||
      props.expandRow.setExpandRow(e.key);
      e.component.collapseAll(-1);
      return;
    }
  
    function onRowCollapsed(e) {
      console.log("onRowCollapsed|e:", e);
      props.collapsedRow.setCollapsed(true); // ---
      e.component.collapseRow(e.key);
      return;
    }


  //   function onRowExpanding(e) {
  //     props.expandRow.setExpandRow(e.key);
  //     props.collapsedRow.setCollapsed(false);
  //     // e.component.collapseAll(-1);
  //     return;
  // }

  // function onRowCollapsed(e) {
  //     props.collapsedRow.setCollapsed(true);
  //     e.component.collapseRow(e.key);
  //     return;
  // }

  // function contentReady(e) {
  //     if (!props.collapsedRow.collapsed) {
  //         e.component.expandRow(props.expandRow.expandRow);
  //     }
  //     return;
  // }

    //*******************-Eventos del Autorizador-**************************/
    
    const nuevoAutorizador = evt => {
      props.nuevoAutorizador(evt.row.data);
    };

    const seleccionarAutorizador = evt => {
      props.seleccionarAutorizador(evt);
    };
  
    const editarAutorizador = evt => {
      props.editarAutorizador(evt);
    };
  
    const eliminarAutorizador = evt => {
      props.eliminarAutorizador(evt);
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
                            <ButtonDev icon="plus"
                                type="default"
                                hint={intl.formatMessage({ id: "ACTION.NEW" })}
                                onClick={props.nuevoRegistro} />
                        </PortletHeaderToolbar>
                    </PortletHeaderToolbar>
                }
            />
            <PortletBody>
                <DataGrid
                    id="datagrid-tipoAutorizador"
                    keyExpr="RowIndex"
                    dataSource={props.tipoAutorizacionCompaniaData}
                    showBorders={true}
                    focusedRowEnabled={true}
                    onEditingStart={editarRegistro}
                    onRowRemoving={eliminarRegistro}
                    onFocusedRowChanged={seleccionarRegistro}
                    focusedRowKey={props.focusedRowKey}

                    // onCellPrepared={onCellPrepared}
                    onRowExpanding={(e) => onRowExpanding(e)}
                    onRowCollapsed={ (e) => onRowCollapsed(e) }
                    onContentReady={(e) => contentReady(e)}
                >
                    <Editing
                        mode="row"
                        useIcons={true}
                        allowUpdating={true}
                        allowDeleting={true}
                        texts={textEditing}
                    />
                    <Column
                    dataField="IdTipoAutorizacion"
                    caption={intl.formatMessage({ id: "COMMON.CODE" })}
                    alignment={"center"}
                    />
                    <Column
                    dataField="TipoAutorizacion"
                    caption={intl.formatMessage({
                    id: "ASSISTANCE.AUTHORIZATION.TYPE"
                    })}
                    />
                    <Column
                    dataField="NivelAprobacion"
                    caption={intl.formatMessage({ id: "ASSISTANCE.APPROVAL.LEVEL" })}
                    alignment={"center"}
                    />
                    <Column
                    dataType="boolean"
                    caption={intl.formatMessage({ id: "COMMON.ACTIVE" })}
                    calculateCellValue={obtenerCampoActivo}
                    />

                    <Column type="buttons" width={"15%"}>
                    <ColumnButton
                    icon="group"
                    hint={intl.formatMessage({ id: "ASSISTANCE.ASSIGN.AUTHORIZER" })}
                    onClick={nuevoAutorizador}
                    />

                    <ColumnButton name="edit" />
                    <ColumnButton name="delete" />
                    </Column>

                    <MasterDetail enabled={true} component={dta =>DetailAutorizador({
                    data: dta.data,
                    intl,
                     seleccionarAutorizador,
                     editarAutorizador,
                     eliminarAutorizador
                    })
                    }
                    />
                    <Summary>
                        <TotalItem
                        cssClass="classColorPaginador_"
                            column="IdTipoAutorizacion"
                            summaryType="count"
                            alignment={"left"}
                            displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
                        />
                    </Summary>
                </DataGrid>

            </PortletBody>
        </>
    );
};

const DetailAutorizador = props => {
    const { intl } = props;
    const [dataSource, setDataSource] = useState([]);
    const splashScreen = document.getElementById("splash-screen");
    const [focusedRowKeyAutorizador, setFocusedRowKeyAutorizador] = useState();

    async function listar(dataRow) {
      splashScreen.classList.remove("hidden");
      const { IdCliente, IdCompania, IdTipoAutorizacion } = dataRow;
  
      if (
        isNotEmpty(IdCliente) &&
        isNotEmpty(IdCompania) &&
        isNotEmpty(IdTipoAutorizacion)
      ) {
        let params = {
          IdCliente: IdCliente,
          IdCompania: IdCompania,
          IdTipoAutorizacion: IdTipoAutorizacion,
          IdPosicion: "%",
          Nivel: "0"
        };
  
        await listarAUT(params)
          .then(data => {
            setDataSource(data);
            //Obtener Focus de dataGrid
            getRowFocus();
          })
          .finally(() => {
            splashScreen.classList.add("hidden");
          });
      }
    }

    const getRowFocus = () => {
      let dataRow = JSON.parse(localStorage.getItem("dataRowAplication"));
      if (isNotEmpty(dataRow)) {
        const { RowIndex } = dataRow;
        setFocusedRowKeyAutorizador(RowIndex);
      }
    };

    const obtenerCampoActivo = rowData => {
        return rowData.Activo === "S";
    };

    
    const editarAutorizador = evt => {
      props.editarAutorizador(evt.data);
    };
  
    const eliminarAutorizador = evt => {
      props.eliminarAutorizador(evt.data);
    };
  
    const obtenerCampoActivoDetail = rowData => {
      return rowData.Activo === "S";
    };
  
    const seleccionarAutorizador = evt => {
      if (evt.rowIndex === -1) return;
  
      if (isNotEmpty(evt.row.data)) {
        const { RowIndex } = evt.row.data;
        setFocusedRowKeyAutorizador(RowIndex);
        props.seleccionarAutorizador(evt.row.data);
      }
    };
  

  function onCellPreparedDetail(e) {
    if (e.rowType === "data") {
      if (e.data.Activo === "N") {
        e.cellElement.style.color = "red";
      }
    }
  }

  const textEditing = {
    confirmDeleteMessage: "",
    editRow: intl.formatMessage({ id: "ACTION.EDIT" }),
    deleteRow: intl.formatMessage({ id: "ACTION.REMOVE" })
  };

    useEffect(() => {
        listar(props.data.data);
    }, []);

    return (
        <>
          <div className="grid_detail_title">
          {intl.formatMessage({ id: "ASSISTANCE.ASSIGN.CONFIGURATION" })}
          </div>
            <DataGrid
                dataSource={dataSource}
                showBorders={true}
                columnAutoWidth={true}
                focusedRowEnabled={true}
                focusedRowKey={focusedRowKeyAutorizador}
                keyExpr="RowIndex"
                onEditingStart={editarAutorizador}
                onRowRemoving={eliminarAutorizador}
                onFocusedRowChanged={seleccionarAutorizador}
                // onCellPrepared={onCellPreparedDetail}

            >
                <Editing
                    mode="row"
                    useIcons={true}
                    allowUpdating={true}
                    allowDeleting={true}
                    texts={textEditing}
                />


    <Column
          dataField="Posicion"
          caption={intl.formatMessage({ id: "ASSISTANCE.AUTHORIZER.POSITION" })}
          alignment={"left"}
        />

        <Column
          dataField="Responsable"
          caption={intl.formatMessage({
            id: "ASSISTANCE.AUTHORIZER.RESPONSABLE"
          })}
          alignment={"center"}
        />

        <Column
          dataField="Nivel"
          caption={intl.formatMessage({ id: "ASSISTANCE.AUTHORIZER.LEVEL" })}
          alignment={"center"}
        />

        <Column
          dataField="Principal"
          caption={intl.formatMessage({
            id: "ASSISTANCE.AUTHORIZER.PRINCIPAL"
          })}
          alignment={"center"}
        />
        <Column
          dataField="GeneraSolicitud"
          caption={intl.formatMessage({
            id: "ASSISTANCE.AUTHORIZER.GENERATEREQUEST"
          })}
          alignment={"center"}
        />
               
                {/* <Column type="buttons" width={"15%"} >
                    <Button name="delete" onClick={eliminarRegistroHijo} />
                </Column> */}
            </DataGrid>

        </>
    );
};
//.....................................................................
export default injectIntl(WithLoandingPanel(TipoAutorizacionCompaniaListPageV3));

 
// export default injectIntl(TipoAutorizacionCompaniaListPage);
