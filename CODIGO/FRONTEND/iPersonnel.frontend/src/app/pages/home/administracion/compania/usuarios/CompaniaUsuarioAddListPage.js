import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { Button } from "devextreme-react";
import { Popup } from 'devextreme-react/popup';
import PropTypes from "prop-types";
import { DataGrid, Column, Editing, Paging, Pager, FilterRow, Summary, TotalItem } from "devextreme-react/data-grid";

import {
  Portlet,
  PortletBody,
  PortletHeader,
  PortletHeaderToolbar
} from "../../../../../partials/content/Portlet";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import { isNotEmpty } from "../../../../../../_metronic";

const CompaniaUsuarioAddListPage = props => {

  const { intl, accessButton } = props;

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

  return (
    <>
      <Popup
        visible={props.showPopup.isVisiblePopUpPerfil}
        dragEnabled={false}
        closeOnOutsideClick={false}
        showTitle={true}
        height={"580px"}
        width={"650px"}
        title={(intl.formatMessage({ id: "CONFIG.MENU.SEGURIDAD.PERFILES" })).toUpperCase()}
        onHiding={() => props.showPopup.setIsVisiblePopUpPerfil(!props.showPopup.isVisiblePopUpPerfil)}
      >
        <Portlet>
          <>
            <HeaderInformation data={props.getInfoUsuarioAsignado()} visible={props.showHeaderInformation} labelLocation={'left'} colCount={6}
              toolbar={
                <PortletHeader
                  title=""
                  toolbar={
                    <PortletHeaderToolbar>
                      <PortletHeaderToolbar>
                        <Button
                          icon="plus"
                          type="default"
                          hint={intl.formatMessage({ id: "ACTION.NEW" })}
                          onClick={props.mostrarPopUpObjetos}
                          disabled={!accessButton.nuevo} />
                      </PortletHeaderToolbar>
                    </PortletHeaderToolbar>
                  }
                />
              } />

            <PortletBody>
              <DataGrid
                dataSource={props.usuarioPerfilData}
                showBorders={true}
                focusedRowEnabled={true}
                keyExpr="RowIndex"
                // onEditingStart={editarRegistro}
                onRowRemoving={eliminarRegistro}
                onFocusedRowChanged={seleccionarRegistro}
                // onRowDblClick={seleccionarRegistroDblClick}
                focusedRowKey={props.focusedPerfilRowKey}
                onCellPrepared={onCellPrepared}
                allowColumnReordering={true}
                allowColumnResizing={true}
                columnAutoWidth={true}
              >
                <Editing
                  mode="row"
                  useIcons={true}
                  allowDeleting={accessButton.eliminar}
                  texts={textEditing}
                  alignment={"center"}
                />
                <FilterRow visible={false} />
                <Column dataField="IdPerfil" caption={intl.formatMessage({ id: "COMMON.CODE" })} allowSorting={false} allowSearch={false} allowFiltering={false} width={"20%"} />
                <Column dataField="Perfil" caption={intl.formatMessage({ id: "ACCESS.PROFILE" })} allowSorting={false} width={"60%"} />
                <Column visible={true} dataType="boolean" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} alignment={"center"} calculateCellValue={obtenerCampoActivo} width={"10%"} />
                <Paging defaultPageSize={10} />
                <Pager showPageSizeSelector={false} />


                <Summary>
                  <TotalItem
                    cssClass="classColorPaginador_"
                    column="IdPerfil"
                    summaryType="count"
                    displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
                  />
                </Summary>

              </DataGrid>

            </PortletBody>
          </>
        </Portlet>
      </Popup>
    </>
  );
};

CompaniaUsuarioAddListPage.propTypes = {
  showHeaderInformation: PropTypes.bool,

  showButton: PropTypes.bool,
  selectionMode: PropTypes.string,
  uniqueId: PropTypes.string,
};
CompaniaUsuarioAddListPage.defaultProps = {
  showHeaderInformation: true,

  showButton: false,
  selectionMode: "row", //['multiple', 'row','single]
  uniqueId: "ListContratoXPersona",

};
export default injectIntl(WithLoandingPanel(CompaniaUsuarioAddListPage));

