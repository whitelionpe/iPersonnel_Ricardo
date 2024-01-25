import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";
import { DataGrid, Column, Editing, Summary, TotalItem, Button as ColumnButton, } from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import { isNotEmpty } from "../../../../../_metronic";
import Form, { Item, GroupItem } from "devextreme-react/form";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";


const GrupoListPage = props => {
  const { intl, accessButton, companiaData, changeValueCompany, varIdCompania, setVarIdCompania,setFocusedRowKey  } = props;

  const editarRegistro = evt => {
    props.editarRegistro(evt.data);
  };

  const eliminarRegistro = evt => {
    evt.cancel = true;
    props.eliminarRegistro(evt.data);
  };

  const obtenerCampoActivo = rowData => {
    return rowData.Activo === "S";
  }

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


  async function getCompanySeleccionada(idCompania, company) {
    if (isNotEmpty(idCompania)) {
        setVarIdCompania(idCompania);
        changeValueCompany(company[0]);
    }else
    {
      changeValueCompany(null);
    }
  }

 useEffect(() => {
    if(!isNotEmpty(varIdCompania)){
        if (companiaData.length > 0) {
          const { IdCompania } = companiaData[0];
          var company = companiaData.filter(x => x.IdCompania === IdCompania);
          getCompanySeleccionada(IdCompania, company);
       }
     }
 }, [companiaData]);



  return (
    <>

      <PortletHeader
        title={
          <Form >
            <GroupItem itemType="group" colSpan={2}>
                <Item
                  dataField="IdCompania"
                  label={{ text: intl.formatMessage({ id: "ADMINISTRATION.COMPANY.COMPANY" }) }}
                  editorType="dxSelectBox"
                  editorOptions={{
                      items: companiaData,
                      valueExpr: "IdCompania",
                      displayExpr: "Compania",
                      showClearButton: true,
                      value: varIdCompania,
                      onValueChanged: (e) => {
                          if (isNotEmpty(e.value)) {
                                var company = companiaData.filter(x => x.IdCompania === e.value);
                                getCompanySeleccionada(e.value, company);
                                setFocusedRowKey();
                          }else{
                            setVarIdCompania("");
                            getCompanySeleccionada(null, "");
                            setFocusedRowKey();
                          }
                      },
                  }}
                />
            </GroupItem>

          </Form>
        }
        toolbar={
          <PortletHeaderToolbar>
            <Button
              icon="plus"
              type="default"
              hint={intl.formatMessage({ id: "ACTION.NEW" })}
              onClick={props.nuevoRegistro}
              disabled={isNotEmpty(varIdCompania) ? false : true}
            />
          </PortletHeaderToolbar>
        }
      />

      <PortletBody>
        <DataGrid
          dataSource={props.grupoData}
          showBorders={true}
          focusedRowEnabled={true}
          keyExpr="RowIndex"
          onEditingStart={editarRegistro}
          onRowRemoving={eliminarRegistro}
          onFocusedRowChanged={seleccionarRegistro}
          onRowDblClick={seleccionarRegistroDblClick}
          focusedRowKey={props.focusedRowKey}
          onCellPrepared={onCellPrepared}
          repaintChangesOnly={true}
        >
          <Editing
            mode="row"
            useIcons={true}
            allowUpdating={accessButton.editar}
            allowDeleting={accessButton.eliminar}
            texts={textEditing}
          />

          <Column dataField="IdGrupo" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"20%"} alignment={"left"} />
          <Column dataField="Grupo" caption={intl.formatMessage({ id: "ACCESS.PERSON.GRUPO" })} width={"70%"} />
          <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} calculateCellValue={obtenerCampoActivo} width={"10%"} />

          <Column type="buttons">
            <ColumnButton name="edit" />
            <ColumnButton name="delete" />
          </Column>

          <Summary>
            <TotalItem
            cssClass="classColorPaginador_"
              column="IdGrupo"
              alignment="left"
              summaryType="count"
              displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
            />
          </Summary>


        </DataGrid>
      </PortletBody>
    </>
  );
};

export default injectIntl(WithLoandingPanel(GrupoListPage));
