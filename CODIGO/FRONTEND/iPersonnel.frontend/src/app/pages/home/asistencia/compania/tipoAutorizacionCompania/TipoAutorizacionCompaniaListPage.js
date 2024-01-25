import React, { useEffect, useState, useRef } from "react";
import { injectIntl } from "react-intl";
import {
  DataGrid,
  Button as ColumnButton,
  Column,
  Editing,
  MasterDetail,
  Selection,
  Summary,
  TotalItem
} from "devextreme-react/data-grid";

import { Button } from "devextreme-react";
import {
  PortletBody,
  PortletHeader,
  PortletHeaderToolbar
} from "../../../../../partials/content/Portlet";
import { isNotEmpty } from "../../../../../../_metronic";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";

import { listar as listarAUT } from "../../../../../api/asistencia/autorizador.api";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import { handleInfoMessages } from "../../../../../store/ducks/notify-messages";

const TipoAutorizacionCompaniaListPage = props => {

  const { intl, accessButton } = props;
  const dataGridRef = useRef(null);
  const [nivelMaximo, setNivelMaximo] = useState(0);

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
    confirmDeleteMessage: "",
    editRow: intl.formatMessage({ id: "ACTION.EDIT" }),
    deleteRow: intl.formatMessage({ id: "ACTION.REMOVE" })
  };


  async function nuevoAutorizador(evt) {
  
    // obtenerCantidadRegistroHijos(evt.row.data);

     const { IdCliente, IdCompania, IdTipoAutorizacion } = evt.row.data;
     let nivelMaximo = 0;

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
           await listarAUT(params).then(data => { nivelMaximo = data.length; }).finally(() => {});
      }
      
      // console.log("nuevoAutorizador|nivelMaximo:",nivelMaximo);

        if(nivelMaximo < evt.row.data.NivelAprobacion )
        {
          props.nuevoAutorizador(evt.row.data);
        }
        else
        {
          handleInfoMessages(intl.formatMessage({ id: "Ya llego al nivel maximo" }));
        }
      
  };
 
  /* function onRowExpanding(e) {
    props.expandRow.setExpandRow(e.key);
    props.collapsedRow.setCollapsed(false);
    e.component.collapseAll(-1);
    return;
  } */

    function onRowExpanding(e) {
    //props.invokeMethod.SetInvokeContentReady(true);
    props.collapsedRow.setCollapsed(false); 
    props.expandRow.setExpandRow(e.key);
    e.component.collapseAll(-1);
    return;
  }

  
 
  function onRowCollapsed(e) {
    props.collapsedRow.setCollapsed(true);
    e.component.collapseRow(e.key);
    return;
  }

  function contentReady(e) {
    if (props.invokeMethod.invokeContentReady) {
      setTimeout(() => {
        if (!props.collapsedRow.collapsed) {
          e.component.expandRow(props.expandRow.expandRow);
          props.invokeMethod.SetInvokeContentReady(false);
        }
        return;
      }, 5);
    }
  }

 /*  function contentReady(e) {
    if (!props.collapsedRow.collapsed) {
      //props.setCollapsed( props.collapsed );
      e.component.expandRow(props.expandRow.expandRow);
    }
    return;
  }
 */


 

  // ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  async function obtenerCantidadRegistroHijos(dataRow) {
    console.log("obtenerCantidadRegistroHijos|dataRow:",dataRow);

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

      await listarAUT(params).then(data => {
          setNivelMaximo(data.length);
          console.log("obtenerCantidadRegistroHijos|data.length:",data.length);

        })
        .finally(() => {});
    }
  }



  //*******************-Eventos del Autorizador-**************************/
  const seleccionarAutorizador = evt => {
    props.seleccionarAutorizador(evt);
  };

  /* const seleccionarAutorizador = evt => {

    if (evt.rowIndex === -1) return;

    if (isNotEmpty(evt.row.data)) {
      const { RowIndex } = evt.row.data;
      //setFocusedRowKeyAutorizadorRequisito(RowIndex);
      props.seleccionarAutorizador(evt.row.data);
    }

  }; */

  const editarAutorizador = evt => {
    props.editarAutorizador(evt);
  };

  const eliminarAutorizador = evt => {
    props.eliminarAutorizador(evt);
  };

  return (
    <>
      <HeaderInformation
        data={props.getInfo()}
        visible={true}
        labelLocation={"left"}
        colCount={6}
        toolbar={
          <PortletHeader
            title={""}
            toolbar={
              <PortletHeaderToolbar>
                <Button
                  icon="plus"
                  type="default"
                  hint={intl.formatMessage({ id: "ACTION.NEW" })}
                  onClick={props.nuevoRegistro}
                  disabled={!accessButton.nuevo}
                />
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
        }
      />

      <PortletBody>

        <DataGrid
          id="datagrid-modulo"
          keyExpr="RowIndex"
          ref={dataGridRef}
          dataSource={props.tipoAutorizacionCompaniaData}
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
            useIcons={true}
            allowUpdating={accessButton.editar}
            allowDeleting={accessButton.eliminar}
            texts={textEditing}
          />
          <Selection mode="single" />

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

          <Column type="buttons">
            <ColumnButton
              icon="group"
              hint={intl.formatMessage({ id: "ASSISTANCE.ASSIGN.AUTHORIZER" })}
              onClick={nuevoAutorizador}
            />
            <ColumnButton name="edit" />
            <ColumnButton name="delete" />
          </Column>

          <MasterDetail enabled={true} component={dta =>DetailAutorizadorList({
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
              alignment="left"
              summaryType="count"
              displayFormat={`${intl.formatMessage({
                id: "COMMON.TOTAL.ROW"
              })} {0}`}
            />
          </Summary>
        </DataGrid>
      </PortletBody>
    </>
  );
};

//Asignar componente DetailAutorizadorList.
const DetailAutorizadorList = props => {
  const { intl } = props;

  const [dataSource, setDataSource] = useState([]);
  const [focusedRowKeyAutorizador, setFocusedRowKeyAutorizador] = useState();
  const splashScreen = document.getElementById("splash-screen");

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

  async function listarAutorizador(dataRow) {
    splashScreen.classList.remove("hidden");
    const { IdCliente, IdCompania, IdTipoAutorizacion, Nivel } = dataRow;

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
    let dataRow = JSON.parse(localStorage.getItem("dataRowAutorizador"));
    if (isNotEmpty(dataRow)) {
      const { RowIndex } = dataRow;
      setFocusedRowKeyAutorizador(RowIndex);
    }
  };

  useEffect(() => {
    listarAutorizador(props.data.data);
  }, []);

  return (
    <>
      <div className="grid_detail_title">
        {intl.formatMessage({ id: "ASSISTANCE.ASSIGN.CONFIGURATION" })}
      </div>
      <DataGrid 
        id="datagrid-aplicacion"
        dataSource={dataSource}
        showBorders={true}
        columnAutoWidth={true}
        focusedRowEnabled={true}
        focusedRowKey={focusedRowKeyAutorizador}
        keyExpr="RowIndex"
        // onCellPrepared={onCellPreparedDetail}
        onEditingStart={editarAutorizador}
        onRowRemoving={eliminarAutorizador}
        onFocusedRowChanged={seleccionarAutorizador}
      >
        <Editing
          mode="row"
          useIcons={true}
          allowUpdating={true}
          allowDeleting={true}
          texts={textEditing}
        />
        <Column dataField="RowIndex" caption="#" alignment={"center"} />
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
        <Column dataType="boolean"
          caption={intl.formatMessage({ id: "COMMON.ACTIVE" })}
           calculateCellValue={obtenerCampoActivoDetail}
           /> 
      </DataGrid>
    </>
  );
};

export default injectIntl(WithLoandingPanel(TipoAutorizacionCompaniaListPage));

