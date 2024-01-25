import { Popup } from "devextreme-react";
import DataGrid, { Column, Paging } from "devextreme-react/data-grid";
import React from "react";
import { Portlet } from "../../../../partials/content/Portlet";

const PerfilPersonaMasivoMessage = ({ intl, showPopup, dataSourcePersona }) => {
  return (
    <>
      <Popup
        visible={showPopup.isVisiblePopUp}
        dragEnabled={false}
        closeOnOutsideClick={false}
        showTitle={true}
        height={"500px"}
        width={"700px"}
        title={intl
          .formatMessage({ id: "CASINO.MASIVO.TITLE.PROCESADOS" })
          .toUpperCase()}
        onHiding={() => showPopup.setisVisiblePopUp(!showPopup.isVisiblePopUp)}
      >
        <Portlet>
          <DataGrid
            id="gridContainer"
            dataSource={dataSourcePersona}
            showBorders={true}
            focusedRowEnabled={true}
            keyExpr="IdPersona"
            repaintChangesOnly={true}
            allowColumnReordering={true}
            allowColumnResizing={true}
            columnAutoWidth={true}
          >
            <Paging defaultPageSize={15} defaultPageIndex={1} />
            <Column
              dataField="IdPersona"
              caption={intl.formatMessage({ id: "COMMON.CODE" })}
              allowHeaderFiltering={false}
              allowSorting={true}
              width={"10%"}
              alignment={"center"}
            />
            <Column
              dataField="NombresCompletos"
              caption={intl.formatMessage({
                id: "ADMINISTRATION.PERSON.FULLNAME"
              })}
              allowSorting={true}
              allowHeaderFiltering={false}
              width={"25%"}
            />
            {/* <Column
              dataField="TipoDocumento"
              caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.TYPE" })}
              allowHeaderFiltering={false}
              alignment={"center"}
              width={"10%"}
            ></Column> */}
            <Column
              dataField="Documento"
              caption={intl.formatMessage({
                id: "ADMINISTRATION.PERSON.DOCUMENT"
              })}
              allowHeaderFiltering={false}
              width={"10%"}
            />
            <Column
              dataField="Mensaje"
              caption={intl.formatMessage({
                id: "CASINO.MASIVO.GRID.MENSAJE"
              })}
              allowHeaderFiltering={false}
              width={"45%"}
            />
          </DataGrid>
        </Portlet>
      </Popup>
    </>
  );
};

export default PerfilPersonaMasivoMessage;
