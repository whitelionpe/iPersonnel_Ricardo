import React from "react";
import { injectIntl } from "react-intl";
import { DataGrid, Column, Editing, Summary, TotalItem, Button as ColumnButton } from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import Form, { Item, GroupItem } from "devextreme-react/form";
import PropTypes from "prop-types";

import HeaderInformation from "../../../../../partials/components/HeaderInformation";
import { isNotEmpty } from "../../../../../../_metronic";

const PersonaContratoListPage = props => {

  const { intl, accessButton } = props;

  const editarRegistro = (evt) => {
    let { ver } = evt.row.data;
    if (ver = props.ocultarEdit) {
      props.editarRegistro(evt.row.data, false);
    }
    else {
      props.editarRegistro(evt.row.data, true);
    }
  };

  const eliminarRegistro = (evt) => {
    evt.cancel = true;
    props.eliminarRegistro(evt.row.data);
  };

  const verRegistro = (evt) => {
    props.verRegistro(evt.row.data);
  };

  const obtenerCampoActivo = rowData => {
    return rowData.Activo === "S";
  }

  const textEditing = {
    confirmDeleteMessage: '',
    editRow: intl.formatMessage({ id: "ACTION.EDIT" }),
    deleteRow: intl.formatMessage({ id: "ACTION.REMOVE" }),
  };


  const seleccionarRegistro = evt => {
    if (evt.rowIndex === -1) return;
    if (isNotEmpty(evt.row.data)) props.seleccionarRegistro(evt.row.data);
  }

  function onCellPrepared(e) {
    if (e.rowType === 'data') {
      if (e.data.Activo === 'N') {
        e.cellElement.style.color = 'red';
      }
    }
  }


  return (
    <>
      <HeaderInformation data={props.getInfo()} visible={props.showHeaderInformation} labelLocation={'left'} colCount={6}
        toolbar={
          <PortletHeader
            title={""}
            toolbar={
              <PortletHeaderToolbar>
                <Button icon="plus" type="default"
                  hint={intl.formatMessage({ id: "ACTION.NEW" })}
                  onClick={props.nuevoRegistro}
                  disabled={!accessButton.nuevo}
                  visible={props.showButtons}
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
        <React.Fragment>
          <Form>
            <GroupItem>
              <Item>
                <DataGrid
                  dataSource={props.contratos}
                  showBorders={true}
                  focusedRowEnabled={true}
                  keyExpr="RowIndex"
                  onEditingStart={editarRegistro}
                  onRowRemoving={eliminarRegistro}
                  onFocusedRowChanged={seleccionarRegistro}
                  focusedRowKey={props.focusedRowKey}
                  onCellPrepared={onCellPrepared}
                  allowColumnReordering={true}
                  allowColumnResizing={true}
                  columnAutoWidth={true}
                >
                  <Editing
                    mode="row"
                    useIcons={true}
                  />
                  <Column dataField="CompaniaMandante" caption={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CLIENTCOMPANY.ABR" })} width={"15%"} alignment={"left"} />
                  <Column dataField="CompaniaContratista" caption={intl.formatMessage({ id: "ADMINISTRATION.COMPANY.CONTRACTOR" })} width={"15%"} alignment={"left"} />
                  <Column dataField="CompaniaSubContratista" caption={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.SUBCONTRACTOR" })} width={"10%"} alignment={"left"} />
                  <Column dataField="IdContrato" caption={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CONTRACT" })} width={"15%"} alignment={"left"} />
                  <Column dataField="Contrato" caption={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.SUBJECT" })} width={"20%"} alignment={"left"} />
                  <Column dataField="FechaInicio" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.STARTDATE" })} width={"12%"} dataType="date" format="dd/MM/yyyy" alignment={"center"} />
                  <Column dataField="FechaFin" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.ENDDATE" })} width={"12%"} dataType="date" format="dd/MM/yyyy" alignment={"center"} />
                  <Column dataField="Posicion" caption={intl.formatMessage({ id: "ADMINISTRATION.POSITION" })} width={"15%"} alignment={"left"} />

                  <Column dataType="boolean" caption="Activo" calculateCellValue={obtenerCampoActivo} width={100} />

                  <Column type="buttons" width={105} >
                    <ColumnButton icon="fa fa-eye" hint={intl.formatMessage({ id: "ACTION.VIEW", })} onClick={verRegistro} visible={props.ocultarEdit} />
                    <ColumnButton icon="edit" hint={intl.formatMessage({ id: "ACTION.EDIT", })}
                      onClick={editarRegistro} visible={(props.showButtons && accessButton.editar) ? true : false}
                    />
                    <ColumnButton icon="trash" hint={intl.formatMessage({ id: "ACTION.REMOVE", })}
                      onClick={eliminarRegistro} visible={(props.showButtons && accessButton.eliminar) ? true : false}
                    />
                  </Column>

                  <Summary>
                    <TotalItem
                      cssClass="classColorPaginador_"
                      column="CompaniaMandante"
                      summaryType="count"
                      displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
                    />
                  </Summary>

                </DataGrid>
              </Item>
            </GroupItem>
          </Form>


        </React.Fragment>
      </PortletBody>
    </>
  );
};
PersonaContratoListPage.propTypes = {
  showHeaderInformation: PropTypes.bool,
  showButtons: PropTypes.bool
};
PersonaContratoListPage.defaultProps = {
  showHeaderInformation: true,
  showButtons: true
};

export default injectIntl(PersonaContratoListPage);
