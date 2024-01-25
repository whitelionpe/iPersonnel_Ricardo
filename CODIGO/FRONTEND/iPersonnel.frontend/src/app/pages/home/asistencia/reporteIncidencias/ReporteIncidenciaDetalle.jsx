import { DataGrid, Form, Popup } from 'devextreme-react';
import { Column } from 'devextreme-react/data-grid';
import { Item } from 'devextreme-react/form';
import React from 'react';
import { Portlet } from '../../../../partials/content/Portlet';

import { convertyyyyMMddToFormatDate } from "../../../../../_metronic";

import { ItemCellIncidencia } from "./IncidenciasUtil";

const ReporteIncidenciaDetalle = ({
    showPopup,
    intl,
    IncidenciaData = {
        Incidencia: {
            IdPersona: 0, Fecha: '', NombreCompleto: '', Posicion: ''
        },
        DetalleIncidencia: []
    },
    height = "650px",
    width = "750px"
}) => {

    const { IdPersona, Fecha } = IncidenciaData.Incidencia;

    const cellRenderDay = e => {
        if (e && e.data) {
            const { IdIncidencia, Incidencia, Color } = e.data;
            return (
                <ItemCellIncidencia
                    Id="ItemDetalle"
                    IdIncidencia={IdIncidencia}
                    Incidencia={Incidencia}
                    TotalIncidencias={1}
                    Color={Color}
                    IdPersona={IdPersona}
                    Fecha={Fecha}
                    ParentStyle={{ position: "inherit" }}
                />
            );
        }

        return "";
    };


    return (

        <Popup
            visible={showPopup.isVisiblePopUp}
            dragEnabled={false}
            closeOnOutsideClick={false}
            showTitle={true}
            height={height}
            width={width}
            title={(intl.formatMessage({ id: "ASISTENCIA.REPORT.INCIDENCIAS.TITLE" }).toUpperCase() + ' ' + convertyyyyMMddToFormatDate(Fecha))}
            onHiding={() => showPopup.setisVisiblePopUp(!showPopup.isVisiblePopUp)}
        >
            <Portlet>

                <Form formData={IncidenciaData.Incidencia} >


                    <Item
                        dataField="NombreCompleto"
                        label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.FULLNAME" }) }}
                        editorOptions={{ readOnly: true }}
                    />

                    <Item
                        dataField="Posicion"
                        label={{ text: intl.formatMessage({ id: "ADMINISTRATION.POSITION" }) }}
                        editorOptions={{ readOnly: true }}
                    />
                </Form>

                <br />
                <br />
                <DataGrid
                    dataSource={IncidenciaData.DetalleIncidencia}
                >
                    <Column caption={intl.formatMessage({ id: "COMMON.CODE" })} dataField="IdIncidencia"
                        cellRender={cellRenderDay}
                    />
                    <Column caption={intl.formatMessage({ id: "ASSISTANCE.INCIDENCE.INCIDENCE" })} dataField="Incidencia" />
                    <Column caption={intl.formatMessage({ id: "ASSISTANCE.INCIDENCE.INCIDENCE.TYPE" })} dataField="TipoIncidencia" />
                    <Column caption={intl.formatMessage({ id: "ASISTENCIA.REPORT.INCIDENCIAS.JUSTIFICATION.MINTOT" })} dataField="Total" />
                    {/* <Column caption={intl.formatMessage({ id: "SYSTEM.LICENSES.BALANCE" })} dataField="Saldo" /> */}
                </DataGrid>

            </Portlet>
        </Popup>
    );
};

export default ReporteIncidenciaDetalle;