import React, { useState, useEffect } from "react";
import { injectIntl } from "react-intl";
import { DataGrid, Popup } from "devextreme-react";
import { Column, Paging, Summary, TotalItem } from "devextreme-react/data-grid";

const CalculoBonoNocturnoDetallePopUp = props => {
    const { intl } = props;

    return (
        <>
            <Popup
                visible={props.showPopup.isVisiblePopUp}
                dragEnabled={false}
                closeOnOutsideClick={false}
                showTitle={true}
                height={"450px"}
                width={"750px"}
                title={(intl.formatMessage({ id: "ACTION.DETAIL" })).toUpperCase()}
                onHiding={() => props.showPopup.setisVisiblePopUp(!props.showPopup.isVisiblePopUp)}
            >
                <DataGrid
                    dataSource={props.detalleBonoNocturno}
                    showBorders={true}
                    focusedRowEnabled={true}
                    keyExpr="RowIndex"
                    noDataText={intl.formatMessage({ id: "ASSISTANCE.PERSON.JUSTIFICATION.NO_DATA" })}
                >
                    <Column dataField="DiaAsistencia"
                        caption={intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY" })}
                        width={"20%"} alignment={"center"} />
                    <Column dataField="FechaAsistencia"
                        caption={intl.formatMessage({ id: "ACCESS.PERSON.MARK.DATE" })}
                        width={"20%"} alignment={"center"} />
                    <Column dataField="Horario"
                        caption={intl.formatMessage({ id: "ASSISTANCE.SCHEDULE" })}
                        width={"20%"} alignment={"center"} />
                    <Column dataField="Marcas"
                        caption={intl.formatMessage({ id: "CONFIG.MENU.ASISTENCIA.MARCAS" })}
                        width={"20%"} alignment={"center"} />
                    <Column dataField="MinutosBonoNocturno"
                        caption={intl.formatMessage({ id: "ACCESS.HOUR" })}
                        width={"25%"} alignment={"center"} />
                    <Paging defaultPageSize={10} />
                </DataGrid>
                <br />
                <div className="row">
                    <div className="col-md-12" style={{ textAlign: 'right', color: '#000000' }}>
                        <h5>
                            <div style={{ color: '#000000' }}>
                                {intl.formatMessage({ id: "ASSISTANCE.REPORTE.NOCTURNALBONUS.SUMMARY.MIN_TOTAL" })
                                    + ' : ' + props.sumaMinutosDetalle}
                            </div>
                        </h5>
                    </div>
                </div>
            </Popup>
        </>
    );
}

export default injectIntl(CalculoBonoNocturnoDetallePopUp);






