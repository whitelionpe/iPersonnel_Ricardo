import React from "react";
import { injectIntl } from "react-intl";
import { DataGrid, Column, Editing, Summary, TotalItem } from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { DoubleLinePersona as DoubleLineLabel } from "../../../../../partials/content/Grid/DoubleLineLabel";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";

const VehiculoMarcacionPasajeroListPage = props => {
  const { intl, dataPasajero, focusedRowKey, accessButton } = props;


  const eliminarRegistro = evt => {
    evt.cancel = true;
    props.eliminarRegistro(evt.data);

  };


  const seleccionarRegistro = evt => {
    props.seleccionarRegistro(evt.data);
  }

  const textEditing = {
    confirmDeleteMessage: '',
    deleteRow: intl.formatMessage({ id: "ACTION.REMOVE" }),
  };

  function onCellPrepared(e) {
    if (e.rowType === 'data') {
      if (e.data.Activo === 'N') {
        e.cellElement.style.color = 'red';
      }
    }
  }
  return (
    <>
      <PortletHeader
        title={intl.formatMessage({ id: "ACTION.LIST" })}
        toolbar={
          <PortletHeaderToolbar>
            <PortletHeaderToolbar>
              <Button
                icon="plus"
                type="default"
                hint={intl.formatMessage({ id: "ACTION.NEW" })}
                onClick={props.nuevoRegistro}

              />
            </PortletHeaderToolbar>
          </PortletHeaderToolbar>
        }
      />
      <PortletBody>
        <DataGrid
          dataSource={dataPasajero}
          showBorders={true}
          focusedRowEnabled={true}
          keyExpr="RowIndex"
          onRowRemoving={eliminarRegistro}
          onRowClick={seleccionarRegistro}
          focusedRowKey={focusedRowKey}
          onCellPrepared={onCellPrepared}
          repaintChangesOnly={true}
        >
          <Editing
            mode="row"
            useIcons={true}
            allowDeleting={accessButton}
            texts={textEditing}
          />
          <Column dataField="RowIndex" caption="#" width={"8%"} alignment={"center"} />
          <Column
            dataField="IdPersona"
            caption={intl.formatMessage({ id: "COMMON.CODE" })}
            allowHeaderFiltering={false}
            allowSorting={true}
            width={"10%"}
            alignment={"center"}
          />
          <Column dataField="NombreCompleto" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.FULLNAME" })} width={"35%"} cellRender={DoubleLineLabel} />
          <Column dataField="Documento" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.DOCUMENT" })} width={"15%"} />
          <Column
            dataField="FechaMarca"
            caption={intl.formatMessage({ id: "ACCESS.PERSON.MARK.DATE" }) + " " + intl.formatMessage({ id: "ACCESS.PERSON.MARK" })}
            dataType="date" format="dd/MM/yyyy HH:mm"
            width={"15%"}
            alignment={"center"}
            allowSorting={true}
            allowFiltering={false}
            allowHeaderFiltering={false}
          />
          <Summary>
            <TotalItem
            cssClass="classColorPaginador_"
              column="NombreCompleto"
              summaryType="count"
              displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
            />
          </Summary>

        </DataGrid>
      </PortletBody>
    </>
  );
};

export default injectIntl(VehiculoMarcacionPasajeroListPage);
