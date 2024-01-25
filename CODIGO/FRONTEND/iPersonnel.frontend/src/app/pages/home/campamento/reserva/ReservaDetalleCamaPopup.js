import React from 'react';
import { Popup } from 'devextreme-react/popup';
import Form, { Item, GroupItem, SimpleItem, ButtonItem, EmptyItem } from "devextreme-react/form";
import { convertyyyyMMddToFormatDate } from '../../../../../_metronic/utils/utils';
import { Portlet } from '../../../../partials/content/Portlet';
import { injectIntl } from 'react-intl';

const ReservaDetalleCamaPopup = ({
  isVisiblePopupDetalle = false,
  setIsVisiblePopupDetalle,
  datosReservaDetalle = {},
  width = 450,
  height = 500,
  intl
}) => {
  let fieldSetHeight = ((datosReservaDetalle.FechaCheckout ? 340 : 280) + (datosReservaDetalle.DetalleServicios.length > 4 ? (Math.ceil(datosReservaDetalle.DetalleServicios.length / 4) - 1) * 25 : 0)) + 'px';
  const datosReserva = () => {
    return (
      <Form formData={datosReservaDetalle}
        readOnly={true}
        labelLocation={"top"}
        colCount={2}>
        <SimpleItem dataField="Campamento" editorOptions={{ readOnly: true }}  ></SimpleItem>
        <SimpleItem dataField="Estado" editorOptions={{ readOnly: true }} cssClass={datosReservaDetalle.cssEstado}  ></SimpleItem>
        <SimpleItem dataField="FechaInicio" editorType={"dxDateBox"} editorOptions={{ readOnly: true, displayFormat: "dd/MM/yyyy", }}  ></SimpleItem>
        <SimpleItem dataField="FechaFin" editorType={"dxDateBox"} editorOptions={{ readOnly: true, displayFormat: "dd/MM/yyyy", }}  ></SimpleItem>
        {datosReservaDetalle.FechaCheckin && <SimpleItem dataField="FechaCheckin" editorOptions={{ readOnly: true }} />}
        {datosReservaDetalle.FechaCheckout && <SimpleItem dataField="FechaCheckout" editorOptions={{ readOnly: true }} />}
        <SimpleItem dataField="Turno" editorOptions={{ readOnly: true }}  ></SimpleItem>
        {((datosReservaDetalle.FechaCheckin && datosReservaDetalle.FechaCheckout) || (!datosReservaDetalle.FechaCheckin && !datosReservaDetalle.FechaCheckout)) && <EmptyItem></EmptyItem>}
        <SimpleItem>Servicios</SimpleItem>
        <EmptyItem></EmptyItem>
        {datosReservaDetalle.DetalleServicios.length > 0 ?
          (
            <GroupItem itemType="group" colCount={4} colSpan={2}>
              {
                datosReservaDetalle.DetalleServicios.map((x, i) => (
                  <SimpleItem
                    key={`SIG_${i}`}
                    cssClass="css_servicio_item badge badge badge-info">{x}</SimpleItem>
                ))
              }
            </GroupItem>
          )
          :
          (<SimpleItem colSpan={2}>[Sin servicios adicionales]</SimpleItem>)}
      </Form>
    );
  };

  const datosTrabajador = () => {
    return (
      <Form formData={datosReservaDetalle}
        readOnly={true}
        labelLocation={"top"}
        colCount={2}>
        <SimpleItem label="Nombre" dataField="Nombre" editorOptions={{ readOnly: true }}  ></SimpleItem>
        <SimpleItem label="Apellido" dataField="Apellido" editorOptions={{ readOnly: true }} ></SimpleItem>
        <SimpleItem label="Tipo Documento" dataField="TipoDocumento" editorOptions={{ readOnly: true }} ></SimpleItem>
        <SimpleItem label="Documento" dataField="Documento" editorOptions={{ readOnly: true }}  ></SimpleItem>
        <SimpleItem label="Compañia" dataField="Compania" editorOptions={{ readOnly: true }} ></SimpleItem>
        <SimpleItem label="Unid.Organizativa" dataField="UnidadOrganizativa" editorOptions={{ readOnly: true }} ></SimpleItem>
      </Form>
    );
  };

  return (
    <Popup
      visible={isVisiblePopupDetalle}
      onHiding={(e) => { setIsVisiblePopupDetalle(false) }}
      dragEnabled={false}
      closeOnOutsideClick={true}
      showTitle={true}
      width={`${width}px`}
      height={`${height}px`}
      title={"DETALLE DE RESERVA N°" + datosReservaDetalle.IdReserva
        + " - " + convertyyyyMMddToFormatDate(datosReservaDetalle.Fecha)}
    >
      <Portlet>
        <div className="pb-3" style={{ overflow: "auto", maxHeight: `${height - 70}px` }}>
          <div className="row pb-2" style={{ width: '456px' }}>
            <div className="col-md-12">
              <fieldset className="scheduler-border" style={{ height: fieldSetHeight }} >
                <legend className="scheduler-border" >   <h5>{intl.formatMessage({ id: "CAMP.RESERVATION.RESERVATION_DATA" })} </h5></legend>
                {datosReserva()}
              </fieldset>
            </div>
            <div className="col-md-12 pt-1">
              <fieldset className="scheduler-border" style={{ height: "225px" }} >
                <legend className="scheduler-border" >   <h5>{intl.formatMessage({ id: "ACREDITATION.DATA" })} </h5></legend>
                {datosTrabajador()}
              </fieldset>
            </div>
          </div>
          <Form formData={datosReservaDetalle}
            readOnly={true}
            labelLocation={"top"}
            colCount={2}

          >

            {/* <SimpleItem cssClass="reserva_detalle_titulo" colSpan="2">
                        <span>Detalle de reserva N° {datosReservaDetalle.IdReserva}
                            &nbsp;-&nbsp;
                            {convertyyyyMMddToFormatDate(datosReservaDetalle.Fecha)}</span>
                    </SimpleItem> */}
                    
            {/* <SimpleItem cssClass={"item_top_0"} colSpan={2}><span>DATOS DE PERSONA:</span></SimpleItem> */}

            <ButtonItem
              colSpan={2}
              horizontalAlignment="center"
              buttonOptions={{
                text: "Cerrar",
                type: "default",
                // icon: "search",
                useSubmitBehavior: false,
                onClick: (e) => { setIsVisiblePopupDetalle(false) },
              }}
            />
          </Form>
        </div>
      </Portlet>
    </Popup>
  );
};

export default injectIntl(ReservaDetalleCamaPopup);
