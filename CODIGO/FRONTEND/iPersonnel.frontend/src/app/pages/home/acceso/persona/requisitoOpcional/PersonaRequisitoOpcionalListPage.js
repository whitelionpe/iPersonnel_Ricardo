import React, { useState } from "react";
import { DataGrid, Column, Editing, Button as ColumnButton, Paging, FilterRow } from "devextreme-react/data-grid";

import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import PropTypes from "prop-types";
import { Popup } from 'devextreme-react/popup';
//Multi-idioma
import { injectIntl } from "react-intl";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";
import WithLoandingPanel from "../../../../../partials/content/withLoandingPanel";

const PersonaRequisitoOpcionalListPage = props => {

  //multi-idioma
  const { intl, accessButton, setLoading, idModulo, idMenu, idAplicacion } = props;
  const [isVisiblePopDetalleRequisito, setisVisiblePopDetalleRequisito] = useState(false);

  const editarRegistro = evt => {
    props.editarRegistro(evt.data);
  };

  const eliminarRegistro = evt => {
    evt.cancel = true;
    props.eliminarRegistro(evt.data);
  };


  const seleccionarRegistro = evt => {
    props.seleccionarRegistro(evt.data);
  }

  function MostrarHistorial(e) {
    props.listarHistorialRequisito(e.row.data);
    setisVisiblePopDetalleRequisito(true);
  }

  function onCellPreparedHistorial(e) {
    if (e.rowType === "data") {
      if (e.data.Color === "S") {
        e.cellElement.style.color = "green";
      }
    }
  }

  const textEditing = {
    confirmDeleteMessage: '',
    editRow: intl.formatMessage({ id: "ACTION.EDIT" }),
    deleteRow: intl.formatMessage({ id: "ACTION.REMOVE" }),
  }

  return (
    <>

      <HeaderInformation data={props.getInfo()} visible={props.showHeaderInformation} labelLocation={'left'} colCount={6}
        toolbar={
          <PortletHeader
            title=""
            toolbar={
              <PortletHeaderToolbar>
                <PortletHeaderToolbar>
                  <Button icon="plus"
                    type="default"
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
              </PortletHeaderToolbar>
            }
          />
        }
      />


      <PortletBody>
        <DataGrid
          dataSource={props.personaRequisitosData}
          showBorders={true}
          focusedRowEnabled={true}
          keyExpr="RowIndex"
          onEditingStart={editarRegistro}
          onRowRemoving={eliminarRegistro}
          onRowClick={seleccionarRegistro}
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

          <Column dataField="RowIndex" caption="#" width={"5%"} alignment="center" />
          <Column dataField="Requisito" caption={intl.formatMessage({ id: "ACCESS.PERSON.REQUIREMENT" })} width={"55%"} />
          <Column dataField="FechaInicio" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.STARTDATE" })} dataType="date" format="dd/MM/yyyy" width={"15%"} alignment={"center"} />
          <Column dataField="FechaFin" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.ENDDATE" })} dataType="date" format="dd/MM/yyyy" width={"15%"} alignment={"center"} />
          <Column dataField="IdItemSharepoint" caption="Item Sharepoint" width={"10%"} alignment="center" visible={false} />

          <Column type="buttons"  >
            <ColumnButton name="edit" />
            <ColumnButton name="delete" />
          </Column>

        </DataGrid>
      </PortletBody>

      <PortletBody>

      </PortletBody>

      <Popup
        visible={isVisiblePopDetalleRequisito}
        dragEnabled={false}
        closeOnOutsideClick={true}
        showTitle={true}
        title={intl.formatMessage({ id: "ACCESS.PERSON.REQUIREMENTS.HISTORY" })}
        height={"550px"}
        width={"600px"}
        onHiding={() => setisVisiblePopDetalleRequisito(!isVisiblePopDetalleRequisito)}
      >
        <DataGrid
          dataSource={props.requisitosHistorialData}
          showBorders={true}
          focusedRowEnabled={true}
          keyExpr="RowIndex"
          onCellPrepared={onCellPreparedHistorial}
          repaintChangesOnly={true}
          allowColumnReordering={true}
          allowColumnResizing={true}
          columnAutoWidth={true}
        >

          <Paging enabled={true} defaultPageSize={15} />
          <FilterRow visible={true} />
          <Column dataField="RowIndex" caption="#" width={"7%"} alignment="center" allowSearch={false} allowFiltering={false} visible={false} />
          <Column dataField="Requisito" caption={intl.formatMessage({ id: "ACCESS.PERSON.REQUIREMENT" })} width={"50%"} allowSearch={false} allowFiltering={false} />
          <Column dataField="FechaInicio" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.STARTDATE" })} dataType="date" format="dd/MM/yyyy" width={"15%"} alignment={"center"} allowSearch={false} allowFiltering={false} />
          <Column dataField="FechaFin" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.ENDDATE" })} dataType="date" format="dd/MM/yyyy" width={"15%"} alignment={"center"} allowSearch={false} allowFiltering={false} />


        </DataGrid>
      </Popup>

    </>
  );
};

PersonaRequisitoOpcionalListPage.propTypes = {
  showHeaderInformation: PropTypes.bool,
  pathFile: PropTypes.string,
  showButtons: PropTypes.bool
};
PersonaRequisitoOpcionalListPage.defaultProps = {
  showHeaderInformation: true,
  pathFile: "",
  showButtons: false,
};


export default injectIntl(WithLoandingPanel(PersonaRequisitoOpcionalListPage));
