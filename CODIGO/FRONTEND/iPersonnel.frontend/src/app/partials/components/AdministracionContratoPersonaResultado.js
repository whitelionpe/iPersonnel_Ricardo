import React, { useEffect, useState } from "react";

import { injectIntl } from "react-intl";
import { Portlet } from "../content/Portlet";

import { DataGrid, Column, Paging, Pager, Editing } from "devextreme-react/data-grid";
import { Popup } from 'devextreme-react/popup';

const AdministracionPersonaContratoResultado = props => {
  const { intl, dataSourceContract } = props;


  function onCellPrepared(e) {
    if (e.rowType === 'data') {
      if (e.data.Error === 'S') {
        e.cellElement.style.color = 'red';
      }
    }
  }

  function showIcon(rowData) {
    return (
      <div className={rowData.row.data.Error === "S" ? 'fa flaticon2-delete text-danger' : 'fa flaticon2-check-mark text-primary'} />
    );
  }

  return (
    <>
      <Popup
        visible={props.showPopup.isVisiblePopUp}
        dragEnabled={false}
        closeOnOutsideClick={false}
        showTitle={true}
        height={"600px"}
        width={"600px"}
        title={(intl.formatMessage({ id: "ACTION.RESULT" }) + ' ' + intl.formatMessage({ id: "ADMINISTRATION.PERSON.CHANGE.CONTRACT" })).toUpperCase()}
        onHiding={() => props.showPopup.setisVisiblePopUp(!props.showPopup.isVisiblePopUp)}
      >
        <Portlet>
          <DataGrid
            dataSource={dataSourceContract}
            keyExpr="NombreCompleto"
            showBorders={true}
            onCellPrepared={onCellPrepared}
            focusedRowEnabled={true}
            allowColumnReordering={true}
            allowColumnResizing={true}
          >
            <Column dataField="Error" caption={""} cellRender={showIcon} width={"5%"} alignment={"center"} />
            <Column dataField="NombreCompleto" caption={intl.formatMessage({ id: "SECURITY.USER.FULLNAME" })} editorOptions={false} allowEditing={false} width={"45%"} />
            <Column dataField="Mensaje" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.REGIME.MESSAGE" })} editorOptions={false} allowEditing={false} width={"50%"} />

            <Paging defaultPageSize={15} />
            <Pager showPageSizeSelector={false} />
          </DataGrid>
        </Portlet>
      </Popup>


    </>
  );
};

export default injectIntl(AdministracionPersonaContratoResultado);
