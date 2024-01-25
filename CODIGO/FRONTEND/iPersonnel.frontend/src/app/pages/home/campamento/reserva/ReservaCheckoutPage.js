import React, { useState } from 'react';
import { injectIntl } from "react-intl";
import { Popup } from "devextreme-react/popup";
import { Portlet, PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import HeaderInformation from "../../../../partials/components/HeaderInformation";
import { Button } from 'devextreme-react';
import Form, { Item, GroupItem } from 'devextreme-react/form';
import { useSelector } from "react-redux";

const ReservaCheckoutPage = (props) => {

  const { intl, dataRowEditNew, setDataRowEditNew, cancelarCheckout, isVisiblePopup, setIsVisiblePopup } = props;
  let minDate = new Date(dataRowEditNew.FechaCheckIn);
  minDate.setDate(minDate.getDate() + 1);
  minDate.setHours(0, 0, 0, 0);
  const grabar = e => {
    let result = e.validationGroup.validate();
    if (!result.isValid) return;
    props.checkout(dataRowEditNew);
  };

  const datosReserva = () => {
    return (
      <Form formData={dataRowEditNew} validationGroup="FormEdicion">
        <GroupItem itemType="group" colCount={2} >
          <Item
            dataField="IdReserva"
            label={{
              text: `N° ${intl.formatMessage({ id: "CAMP.RESERVATION.TAB" })}`
            }}
            editorOptions={{
              readOnly: true
            }}
          />
          <Item
            dataField="EstadoCama"
            label={{
              text: intl.formatMessage({ id: "COMMON.STATE" })
            }}
            editorOptions={{
              readOnly: true
            }}
          />
          <Item
            dataField="Campamento"
            label={{
              text: intl.formatMessage({ id: "CAMP.RESERVATION.CAMP" })
            }}
            editorOptions={{
              readOnly: true
            }}
          />
          <Item
            dataField="Modulo"
            label={{
              text: intl.formatMessage({ id: "CAMP.RESERVATION.MODULE" })
            }}
            editorOptions={{
              readOnly: true
            }}
          />
          <Item
            dataField="Habitacion"
            label={{
              text: intl.formatMessage({ id: "CAMP.RESERVATION.ROOM" })
            }}
            editorOptions={{
              readOnly: true
            }}
          />
          <Item
            dataField="Cama"
            label={{
              text: intl.formatMessage({ id: "CAMP.RESERVATION.BED" })
            }}
            editorOptions={{
              readOnly: true
            }}
          />
          <Item
            dataField="FechaInicio"
            label={{
              text: intl.formatMessage({ id: "COMMON.STARTDATE" })
            }}
            editorType="dxDateBox"
            dataType="datetime"
            editorOptions={{
              inputAttr: { style: "text-transform: uppercase" },
              readOnly: true,
              displayFormat: "dd/MM/yyyy"
            }}
          />

          <Item
            dataField="FechaFin"
            label={{
              text: intl.formatMessage({ id: "COMMON.ENDDATE" })
            }}
            editorType="dxDateBox"
            dataType="datetime"
            editorOptions={{
              inputAttr: { style: "text-transform: uppercase" },
              readOnly: true,
              displayFormat: "dd/MM/yyyy"
            }}
          />
        </GroupItem>
      </Form>
    )
  };

  const datosTrabajador = () => {
    return (
      <Form formData={dataRowEditNew} validationGroup="FormEdicion">
        <GroupItem itemType="group" colCount={2} >
          <Item
            dataField="NombreCompleto"
            label={{
              text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.NAME" })
            }}
            editorOptions={{
              readOnly: true
            }}
          />
          <Item
            dataField="Documento"
            label={{
              text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.DOCUMENT" })
            }}
            editorOptions={{
              readOnly: true
            }}
          />
          <Item
            dataField="CompaniaContratista"
            label={{
              text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.COMPANY" })
            }}
            editorOptions={{
              readOnly: true
            }}
          />
          <Item
            dataField="CompaniaSubContratista"
            label={{
              text: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.SUBCONTRACTOR" })
            }}
            editorOptions={{
              readOnly: true
            }}
          />

        </GroupItem>
      </Form>
    );
  }


  return <Popup
    visible={isVisiblePopup}
    dragEnabled={false}
    closeOnOutsideClick={false}
    showTitle={true}
    height={"500px"}
    width={"800px"}
    title={dataRowEditNew.SoloLectura ? intl.formatMessage({ id: "COMMON.DETAIL" }).toUpperCase() : intl.formatMessage({ id: "CAMP.CAMP.CHECKOUT" }).toUpperCase()}
    onHiding={() =>
      setIsVisiblePopup(false)
    }
  >
    <Portlet>
      <PortletHeader
        title={""}
        toolbar={
          <PortletHeaderToolbar>
            {
              !dataRowEditNew.SoloLectura && (
                <Button
                  icon="fa fa-check"
                  type="default"
                  hint={intl.formatMessage({ id: "ACTION.RECORD" })}
                  onClick={grabar}
                  useSubmitBehavior={true}
                  validationGroup="FormEdicion"
                />
              )
            }
            &nbsp;
            <Button
              icon="fa fa-times-circle"
              type="normal"
              hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
              onClick={cancelarCheckout}
            />
          </PortletHeaderToolbar>
        }
      />

      <PortletBody>
        <Form formData={dataRowEditNew} validationGroup="FormEdicion">
          <GroupItem itemType="group" colCount={4} colSpan={4}>
            <div className="row">
              <div className="col-md-12">
                <fieldset className="scheduler-border" style={{ height: "192px" }} >
                  <legend className="scheduler-border" >   <h5>{intl.formatMessage({ id: "CAMP.RESERVATION.RESERVATION_DATA" })} </h5></legend>
                  {datosReserva()}
                </fieldset>
              </div>
              <div className="col-md-12 pt-1">
                <fieldset className="scheduler-border" style={{ height: "108px" }} >
                  <legend className="scheduler-border" >   <h5>{intl.formatMessage({ id: "ACREDITATION.DATA" })} </h5></legend>
                  {datosTrabajador()}
                </fieldset>
              </div>
            </div>
          </GroupItem>
          <GroupItem itemType="group" colCount={2} colSpan={2}>
            <Item
              dataField="FechaCheckIn"
              label={{
                text: `${intl.formatMessage({ id: "CASINO.PERSON.GROUP.DATE" })} ${intl.formatMessage({ id: "CAMP.CAMP.CHECKIN" })}`
              }}
              editorType="dxDateBox"
              dataType="datetime"
              editorOptions={{
                inputAttr: { style: "text-transform: uppercase" },
                displayFormat: "dd/MM/yyyy HH:mm",
                readOnly: true
              }}
            />
            <Item
              dataField="FechaCheckOut"
              label={{
                text: `${intl.formatMessage({ id: "CASINO.PERSON.GROUP.DATE" })} ${intl.formatMessage({ id: "CAMP.CAMP.CHECKOUT" })}`
              }}
              isRequired={true}
              editorType="dxDateBox"
              editorOptions={{
                inputAttr: { style: "text-transform: uppercase" },
                type: "datetime",
                displayFormat: "dd/MM/yyyy HH:mm",
                min: minDate,
                max: new Date(),
                readOnly: dataRowEditNew.SoloLectura
              }}
            />
          </GroupItem>
        </Form>
      </PortletBody>
    </Portlet>
  </Popup>
};

export default injectIntl(ReservaCheckoutPage);
