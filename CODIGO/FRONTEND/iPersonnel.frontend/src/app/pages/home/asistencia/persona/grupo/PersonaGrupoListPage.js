import React, { useState } from "react";
import { injectIntl } from "react-intl";
import { DataGrid, Column, Editing, Summary, TotalItem, Button as ColumnButton, } from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import { isNotEmpty } from "../../../../../../_metronic";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";
import AsistenciaGrupoZonaEquipoBuscar from "../../../../../partials/components/AsistenciaGrupoZonaEquipoBuscar";



const PersonaGrupoListPage = props => {
  const { intl, accessButton, varIdCompania, dataMenu } = props;
  const [isVisiblePopupGrupoPuerta, setisVisiblePopupGrupoPuerta] = useState(false);
  const [varIdGrupo, setVarIdGrupo] = useState("");
  const [varGrupo, setVarGrupo] = useState("");

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

  function verPopupGrupoPuerta(e) {
    const { IdGrupo, Grupo } = e.row.data;
    setVarIdGrupo(IdGrupo);
    setVarGrupo(Grupo);
    if (isNotEmpty(IdGrupo)) setisVisiblePopupGrupoPuerta(true);
  }


  return (
    <>
      <HeaderInformation data={props.getInfo()} visible={true} labelLocation={'left'} colCount={6}
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
          dataSource={props.personaGrupoData}
          showBorders={true}
          focusedRowEnabled={true}
          keyExpr="RowIndex"
          onEditingStart={editarRegistro}
          onRowRemoving={eliminarRegistro}
          onFocusedRowChanged={seleccionarRegistro}
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

          <Column dataField="Compania" caption={intl.formatMessage({ id: "ASSISTANCE.SPECIAL.CONDITIONS.COMAPNY" })} width={"70%"} />
          <Column dataField="Grupo" caption={intl.formatMessage({ id: "ACCESS.PERSON.GRUPO" })} width={"70%"} />
          <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} calculateCellValue={obtenerCampoActivo} width={"10%"} />

          <Column type="buttons">
            <ColumnButton
              icon="pinleft"
              hint={intl.formatMessage({ id: "ACTION.VIEW" }) + ' ' + intl.formatMessage({ id: "ADMINISTRATION.ZONE.MAINTENANCE" })}
              onClick={verPopupGrupoPuerta}
            />

            <ColumnButton name="edit" />
            <ColumnButton name="delete" />
          </Column>

          <Summary>
            <TotalItem
            cssClass="classColorPaginador_"
              column="Compania"
              alignment="left"
              summaryType="count"
              displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
            />
          </Summary>


        </DataGrid>
      </PortletBody>

      <AsistenciaGrupoZonaEquipoBuscar
        showPopup={{ isVisiblePopUp: isVisiblePopupGrupoPuerta, setisVisiblePopUp: setisVisiblePopupGrupoPuerta }}
        cancelarEdicion={() => setisVisiblePopupGrupoPuerta(false)}
        varIdGrupo={varIdGrupo}
        varGrupo={varGrupo}
        varIdCompania={varIdCompania}
        dataMenu={dataMenu}
      />
    </>
  );
};

export default injectIntl(PersonaGrupoListPage);
