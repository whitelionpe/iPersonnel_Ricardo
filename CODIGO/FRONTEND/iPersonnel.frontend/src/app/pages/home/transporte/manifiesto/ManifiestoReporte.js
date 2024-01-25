import React, { useEffect, useState } from "react";
import DataGrid, {  Column } from 'devextreme-react/data-grid';
import { Button } from 'devextreme-react';
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import Pdf from "react-to-pdf";
import { injectIntl } from "react-intl";

const ref = React.createRef();

const ManifiestoReporte = props => {

  const { intl, setLoading } = props;

    const options = {
        orientation: 'landscape',
        unit: 'in',
        format: [20, 20] //height, width
    };

    const printChart = () => {
        window.print();

    }

    return (
        <>
            <div class="oculto-impresion">
                <PortletHeader
                    title={<> <div style={{color:"red"}}> Nota: Solo se muestra información de manifiestos del tipo urbanito</div> </>}
                    toolbar={
                        <PortletHeaderToolbar>
                            <Pdf targetRef={ref} filename="Reporte_Manifiesto.pdf" options={options} x={.2} y={.2}>
                                {({ toPdf }) => <Button icon="fas fa-cloud-download-alt" type="default" text="Exportar" onClick={toPdf} />}
                            </Pdf>
                        &nbsp;
                        <Button icon="fas fa-print" type="default" text="Imprimir" onClick={printChart} />
                        &nbsp;
                        <Button
                                icon="fa fa-times-circle"
                                type="normal"
                                stylingMode="outlined"
                                text="Cancelar"
                                onClick={props.cancelarEdicion}
                            />
                        </PortletHeaderToolbar>
                    }
                />
            </div>
            <div ref={ref}>
                <PortletBody >
                    <React.Fragment>
                            <DataGrid
                              dataSource={props.dataReporteUrbanito}
                              showBorders={true}
                              keyExpr="RowIndex"
                              focusedRowEnabled={true}
                              allowColumnReordering={true}
                              allowColumnResizing={true}
                              columnAutoWidth={true}
                            >
                            <Column dataField="RowIndex" caption="#" visible={false} />
                            <Column dataField="Asiento" caption="Asiento" alignment="center"  />
                            <Column dataField="TipoDocumento" caption="Tipo Documento"  />
                            <Column dataField="NumeroDocumento" caption="Número Documento"  />
                            <Column dataField="Nombres" caption="Pasajero" alignment="left" ColumnHeaderAutoHeight={true} />
                            <Column dataField="ParaderoEmbarque" caption="Paradero Embarque"  />
                            <Column dataField="FechaEmarque" caption="Fecha Embarque" alignment="center" />
                            <Column dataField="ParaderoDesembarque" caption="Paradero Desembarque"  />
                            <Column dataField="FechaDesembarque" caption="Fecha Desembarque" alignment="center" />


                            </DataGrid>
                    </React.Fragment>
                </PortletBody>
            </div>
        </>
    );
};

export default injectIntl(ManifiestoReporte);

