import React from "react";
import { injectIntl } from "react-intl";
import { DataGrid, Column, Editing, Summary, TotalItem, MasterDetail, Button as ColumnButton, } from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import Form, { Item, GroupItem } from "devextreme-react/form";
import PropTypes from "prop-types";
import { isNotEmpty } from "../../../../../../_metronic";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";
import PersonaCentroCostoListPage from '../centroCosto/PersonaCentroCostoListPage';

const PersonaPosicionListPage = props => {

  const { intl, modoEdicion, accessButton, showButtons } = props;
  const editarRegistro = evt => {
    props.editarRegistro(evt.row.data);
  };
  const eliminarRegistro = evt => {
    evt.cancel = true;
    props.eliminarRegistro(evt.row.data);
  };
  const obtenerCampoActivo = rowData => {
    return rowData.Activo === "S";
  }
  const textEditing = {
    confirmDeleteMessage: '',
    editRow: intl.formatMessage({ id: "ACTION.EDIT" }),
    deleteRow: intl.formatMessage({ id: "ACTION.REMOVE" }),
  };

  const editarRegistroPosicion = (dataRow, posicion) => {

    props.editarRegistroCentroCosto(dataRow, posicion);

  }

  const eliminarRegistroPosicion = (dataRow, posicion) => {
    //
    let { NombreCompleto } = posicion
    props.eliminarRegistroCentroCosto({ ...dataRow, NombreCompleto });
  }

  const nuevoRegistroPersonaCentroCosto = (evt) => {

    if (evt.rowIndex === -1) return;
    if (isNotEmpty(evt.row.data)) props.nuevoRegistroCentroCosto(evt.row.data);

  }


  function onCellPrepared(e) {
    if (e.rowType === 'data') {
      if (e.data.Activo === 'N') {
        e.cellElement.style.color = 'red';
      }
    }
  }

  const seleccionarRegistro = evt => {

    if (evt.rowIndex === -1) return;
    if (isNotEmpty(evt.row.data)) {

      // if (!props.collapsedRow.collapsed) {
      //   evt.component.expandRow(props.expandRow.expandRow);
      //   props.expandRow.setExpandRow(evt.row.data.RowIndex);
      //   props.collapsedRow.setCollapsed(false);
      // }
      props.seleccionarRegistro(evt.row.data)
    }


    /* if (evt.rowIndex === -1) return;
     if (isNotEmpty(evt.row.data)) props.seleccionarRegistro(evt[0]);*/
  }


  // function onRowExpanding(e) {
  //     props.expandRow.setExpandRow(e.key);
  //     props.collapsedRow.setCollapsed(false);
  //     //e.component.collapseAll(-1);
  //     return;
  // }

  // function onRowCollapsed(e) {
  //     props.collapsedRow.setCollapsed(true);
  //     e.component.collapseRow(e.key);
  //     return;
  // }

  // function contentReady(e) {
  //     if (!props.collapsedRow.collapsed) {
  //         //props.setCollapsed( props.collapsed );
  //         e.component.expandRow(props.expandRow.expandRow);
  //     }
  //     return;
  // }


  function onRowExpanding(e) {
    props.expandRow.setExpandRow(e.key);
    props.collapsedRow.setCollapsed(false);

    if (e.key !== 0 && e.expanded) {
      e.component.collapseAll(-1);
    }
    return;
  }

  function onRowCollapsed(e) {
    props.collapsedRow.setCollapsed(true);
    e.component.collapseRow(e.key);
    return;
  }

  function contentReady(e) {
    if (!props.collapsedRow.collapsed) {
      e.component.expandRow(props.expandRow.expandRow);
    }
    return;
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
                  keyExpr="RowIndex"
                  dataSource={props.personaPosicions}
                  showBorders={true}
                  focusedRowEnabled={true}
                  focusedRowKey={props.focusedRowKey}
                  onCellPrepared={onCellPrepared}
                  onFocusedRowChanged={seleccionarRegistro}
                  onRowExpanding={onRowExpanding}
                  onRowCollapsed={onRowCollapsed}
                  onContentReady={contentReady}
                  repaintChangesOnly={true}
                  allowColumnReordering={true}
                  allowColumnResizing={true}
                  columnAutoWidth={true}
                >
                  <Editing
                    mode="row"
                    useIcons={ true}
                  />
                  <Column dataField="RowIndex" caption="#" width={"5%"} alignment={"center"} />
                  <Column dataField="Compania" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.COMPANY" })} />
                  <Column dataField="Division" caption={intl.formatMessage({ id: "SYSTEM.DIVISION" })} />
                  <Column dataField="UnidadOrganizativa" caption={intl.formatMessage({ id: "ADMINISTRATION.ORGANIZATIONALUNIT.COSTCENTER.UO.TAB" })} />
                  <Column dataField="Funcion" caption={intl.formatMessage({ id: "ADMINISTRATION.POSITION.FUNCTION" })} />
                  <Column dataField="TipoPosicion" caption={intl.formatMessage({ id: "ADMINISTRATION.POSITIONTYPE" })}/>
                  <Column dataField="Posicion" caption={intl.formatMessage({ id: "ADMINISTRATION.POSITION" })}/>
                  <Column dataField="FechaInicio" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.STARTDATE" })} width={"10%"} dataType="date" format="dd/MM/yyyy" alignment={"center"} />
                  <Column dataField="FechaFin" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.ENDDATE" })} width={"10%"} dataType="date" format="dd/MM/yyyy" alignment={"center"} />
                  <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} width={"7%"} calculateCellValue={obtenerCampoActivo} />

                  <Column type="buttons" width={80} visible={props.showButtons} disabled={!accessButton.nuevo}>
                    <ColumnButton icon="money" hint={intl.formatMessage({ id: "ADMINISTRATION.PERSON.COSTCENTER.ADD", })} onClick={nuevoRegistroPersonaCentroCosto} />
                    <ColumnButton icon="edit" hint={intl.formatMessage({ id: "ACTION.EDIT", })} onClick={editarRegistro} />
                    <ColumnButton icon="trash" hint={intl.formatMessage({ id: "ACTION.REMOVE", })} onClick={eliminarRegistro} />
                  </Column>

                  <MasterDetail enabled={true} component={(opt) => PersonaCentroCostoListPage({
                    posicion: opt.data.data,
                    intl,
                    showButtons: props.showButtons, 
                    editarRegistro: editarRegistroPosicion,
                    eliminarRegistro: eliminarRegistroPosicion,
                  })} />

                  <Summary>
                    <TotalItem
                    cssClass="classColorPaginador_"
                      column="Compania"
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
PersonaPosicionListPage.propTypes = {
  showHeaderInformation: PropTypes.bool,
  //showButtons: PropTypes.bool
};
PersonaPosicionListPage.defaultProps = {
  showHeaderInformation: true,
  //showButtons: true
};

export default injectIntl(PersonaPosicionListPage);
