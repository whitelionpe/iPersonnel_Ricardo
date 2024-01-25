import React from 'react';
import { Popup } from 'devextreme-react/popup';
import Form, { Item, GroupItem, SimpleItem, ButtonItem, EmptyItem } from "devextreme-react/form";
import { convertyyyyMMddToFormatDate } from '../../../../../_metronic/utils/utils';


const ReservaDetallePersonaPopup = ({
    isVisiblePopupDetalle = false,
    setIsVisiblePopupDetalle,
    datosReservaDetalle = {}
}) => {
    return (
        <Popup
            visible={isVisiblePopupDetalle}
            onHiding={(e) => { setIsVisiblePopupDetalle(false) }}
            dragEnabled={false}
            closeOnOutsideClick={true}
            showTitle={false}
            width={450}
        >
            <Form formData={datosReservaDetalle}
                readOnly={true}
                labelLocation={"top"}
                colCount={2}
            >
                <SimpleItem cssClass="reserva_detalle_titulo" colSpan="2">
                    <span>Detalle de reserva N° {datosReservaDetalle.IdReserva}
                    &nbsp;-&nbsp;
                    {convertyyyyMMddToFormatDate(datosReservaDetalle.Fecha)}</span>
                </SimpleItem>

                <SimpleItem dataField="Campamento" editorOptions={{ readOnly: true }}  ></SimpleItem>
                <SimpleItem dataField="Estado" editorOptions={{ readOnly: true }} cssClass={datosReservaDetalle.cssEstado}  ></SimpleItem>
                <SimpleItem dataField="FechaInicio" editorOptions={{ readOnly: true, displayFormat: "dd/MM/yyyy", }}  ></SimpleItem>
                <SimpleItem dataField="FechaFin" editorOptions={{ readOnly: true, displayFormat: "dd/MM/yyyy", }}  ></SimpleItem>
                <SimpleItem dataField="TipoModulo" editorOptions={{ readOnly: true }}  ></SimpleItem>
                <SimpleItem dataField="Modulo" editorOptions={{ readOnly: true }} ></SimpleItem>
                <SimpleItem dataField="TipoHabitacion" editorOptions={{ readOnly: true }} ></SimpleItem>
                <SimpleItem dataField="Habitacion" editorOptions={{ readOnly: true }}  ></SimpleItem>
                <SimpleItem dataField="Cama" editorOptions={{ readOnly: true }} ></SimpleItem>
                <SimpleItem dataField="Turno" editorOptions={{ readOnly: true }}  ></SimpleItem>
                <SimpleItem>Servicios</SimpleItem>
                <EmptyItem></EmptyItem>

                {datosReservaDetalle.DetalleServicios.length > 0 ?
                    (
                        <GroupItem itemType="group" colCount={4} colSpan={2}>
                            {
                                datosReservaDetalle.DetalleServicios.map(x => (
                                    <SimpleItem cssClass="css_servicio_item badge badge badge-info">{x}</SimpleItem>
                                ))
                            }
                        </GroupItem>
                    )
                    :
                    (<SimpleItem colSpan={2}>[Sin servicios adicionales]</SimpleItem>)}

                <ButtonItem
                    colSpan={2}
                    horizontalAlignment="right"
                    buttonOptions={{
                        text: "Cerrar",
                        type: "default",
                        // icon: "search",
                        useSubmitBehavior: false,
                        onClick: (e) => { setIsVisiblePopupDetalle(false) },
                    }}
                />
            </Form>
        </Popup>
    );
};

export default ReservaDetallePersonaPopup;