import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { Popup } from "devextreme-react/popup";
import { DataGrid, Column, Editing, Button as ColumnButton, Paging, Selection, FilterRow } from "devextreme-react/data-grid";

const AsistenciaHorarioMasivoHistorial = (props) => {
  const { intl } = props;
  useEffect(() => {

  }, []);

  return (
    <>
  <Popup
        visible={props.isVisiblePopDetalleRequisito}
        dragEnabled={false}
        closeOnOutsideClick={true}
        showTitle={true}
        title={intl.formatMessage({ id: "Historial Horarios" })}
        height={"550px"}
        width={"600px"}
        onHiding={() => props.setisVisiblePopDetalleRequisito(false)}
      >
        <DataGrid
          dataSource={props.historialData}
          showBorders={true}
          focusedRowEnabled={true}
          keyExpr="RowIndex"
          showBorders={true}
        >
          <Editing
            mode="row"
            useIcons={false}
            allowUpdating={false}
            allowDeleting={false}
          />

          <Paging enabled={true} defaultPageSize={15} />
          <FilterRow visible={true} />
          <Column dataField="RowIndex" caption="#" width={"7%"} alignment="center" allowSearch={false} allowFiltering={false} visible={false} />
          <Column dataField="NombreCompleto" caption={intl.formatMessage({ id: "Nombre Completo" })} width={"50%"} allowSearch={false} allowFiltering={false} />
          <Column dataField="Observacion" caption={intl.formatMessage({ id: "Observacion" })}  width={"15%"} allowSearch={false} allowFiltering={false} />

        </DataGrid>

      </Popup>
    </>
  );
};

export default injectIntl(AsistenciaHorarioMasivoHistorial);
