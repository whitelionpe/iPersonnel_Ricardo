import { Button, DataGrid, Form } from "devextreme-react";
import { GroupItem, Item } from "devextreme-react/form";
import React from "react";
import {
  PortletBody,
  PortletHeader,
  PortletHeaderToolbar
} from "../../../../partials/content/Portlet";
import HeaderInformation from "../../../../partials/components/HeaderInformation";
import {
  Column,
  Selection,
  Button as ColumnButton,
  Paging
} from "devextreme-react/data-grid";

const PerfilPersonaListPage = ({
  intl,
  dsPerfil,
  getInfo,
  showHeaderInformation,
  nuevoRegistro,
  cancelarEdicion,
  editarRegistro,
  eliminarRegistro
}) => {
  function onCellPrepared(e) {
    if (e.rowType === "data") {
      if (e.data.Activo === "N") {
        e.cellElement.style.color = "red";
      }
    }
  }

  const obtenerCampoActivo = rowData => {
    return rowData.Activo === "S";
  };

  const btn_click_editarRegistro = evt => {
    console.log("btn_click_editarRegistro", evt);
    editarRegistro(evt.row.data);
  };

  const btn_click_eliminarRegistro = evt => {
    // evt.cancel = true;
    eliminarRegistro(evt.row.data);
  };

  const visibleButtons = e => {
    if (e.row !== undefined && e.row.data !== null) {
      let { FlReadOnly } = e.row.data;

      if (!!FlReadOnly && FlReadOnly === "S") {
        return false;
      }
    }
    return true;
  };

  const visibleReadOnly = e => {
    if (e.row !== undefined && e.row.data !== null) {
      let { FlReadOnly } = e.row.data;

      if (!!FlReadOnly && FlReadOnly === "S") {
        return true;
      }
    }
    return false;
  };

  return (
    <>
      <HeaderInformation
        data={getInfo()}
        visible={showHeaderInformation}
        labelLocation={"left"}
        colCount={6}
        toolbar={
          <PortletHeader
            title={""}
            toolbar={
              <PortletHeaderToolbar>
                <PortletHeaderToolbar>
                  <Button
                    icon="plus"
                    type="default"
                    hint={intl.formatMessage({ id: "ACTION.NEW" })}
                    onClick={nuevoRegistro}
                    disabled={false}
                  />
                  &nbsp;
                  <Button
                    icon="fa fa-times-circle"
                    type="normal"
                    hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
                    onClick={cancelarEdicion}
                  />
                </PortletHeaderToolbar>
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
                  dataSource={dsPerfil}
                  showBorders={true}
                  focusedRowEnabled={true}
                  keyExpr="RowIndex"
                  onCellPrepared={onCellPrepared}
                >
                  <Paging defaultPageSize={15} defaultPageIndex={1} />
                  <Selection mode="single" />
                  <Column dataField="RowIndex" caption="#" width={40} />
                  <Column
                    dataField="IdPersona"
                    caption={intl.formatMessage({ id: "COMMON.CODE" })}
                    visible={true}
                    width={"10%"}
                    alignment={"center"}
                  />
                  <Column
                    dataField="NombreCompleto"
                    caption={intl.formatMessage({
                      id: "ADMINISTRATION.PERSON.FULLNAME"
                    })}
                    visible={true}
                    width={"30%"}
                  />
                  <Column
                    dataField="FechaInicio"
                    caption={intl.formatMessage({
                      id: "ADMINISTRATION.PERSON.STARTDATE"
                    })}
                    dataType="date"
                    format="dd/MM/yyyy"
                    alignment={"center"}
                    width={"15%"}
                  />
                  <Column
                    dataField="FechaFin"
                    caption={intl.formatMessage({
                      id: "ADMINISTRATION.PERSON.ENDDATE"
                    })}
                    dataType="date"
                    format="dd/MM/yyyy"
                    alignment={"center"}
                    width={"15%"}
                  />

                  <Column
                    dataField="Compania"
                    caption={intl.formatMessage({
                      id: "CONFIG.MENU.ACCESO.COMPAÑIA"
                    })}
                    width={"20%"}
                  />
                  <Column type="buttons" width={85} visible={true}>
                    <ColumnButton
                      icon={"info"}
                      hint={intl.formatMessage({
                        id: "CASINO.BUTTON.INFO.COMPANYPROFILE"
                      })}
                      onClick={() => {}}
                      visible={visibleReadOnly}
                    />

                    <ColumnButton
                      icon="edit"
                      hint={intl.formatMessage({ id: "ACTION.EDIT" })}
                      onClick={btn_click_editarRegistro}
                      visible={visibleButtons}
                    />

                    <ColumnButton
                      icon="trash"
                      hint={intl.formatMessage({ id: "ACTION.REMOVE" })}
                      onClick={btn_click_eliminarRegistro}
                      visible={visibleButtons}
                    />
                  </Column>
                </DataGrid>
              </Item>
            </GroupItem>
          </Form>
        </React.Fragment>
      </PortletBody>
    </>
  );
};

export default PerfilPersonaListPage;
