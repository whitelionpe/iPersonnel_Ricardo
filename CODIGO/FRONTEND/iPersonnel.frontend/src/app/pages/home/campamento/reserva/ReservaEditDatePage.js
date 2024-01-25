import React from 'react';
import { injectIntl } from "react-intl";
import { Popup } from "devextreme-react/popup";
import { Portlet, PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import HeaderInformation from "../../../../partials/components/HeaderInformation";
import { Button } from 'devextreme-react';
import Form, { Item, GroupItem } from 'devextreme-react/form';
import { useSelector } from "react-redux";

const ReservaEditDatePage = (props) => {

  const { intl, dataRowEditNew, setDataRowEditNew, titulo, cancelarEdicion, isVisiblePopup, setIsVisiblePopup } = props;
 
  const grabar = e => {
    let result = e.validationGroup.validate();
    if (!result.isValid) return; 
    props.actualizar(dataRowEditNew);
  };




  return <Popup
    visible={isVisiblePopup}
    dragEnabled={false}
    closeOnOutsideClick={false}
    showTitle={true}
    height={"325px"}
    width={"800px"}
    title={titulo.toUpperCase()}
    onHiding={() =>
      setIsVisiblePopup(false)
    }
  >
    <Portlet>
      <PortletHeader
        title={""}
        toolbar={
          <PortletHeaderToolbar>
            <Button
              icon="fa fa-check"
              type="default"
              hint={intl.formatMessage({ id: "ACTION.RECORD" })}
              onClick={grabar}
              useSubmitBehavior={true}
              validationGroup="FormEdicion"
            />
            &nbsp;
            <Button
              icon="fa fa-times-circle"
              type="normal"
              hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
              onClick={cancelarEdicion}
            />
          </PortletHeaderToolbar>
        }
      />

      <PortletBody>
        <Form formData={dataRowEditNew} validationGroup="FormEdicion">
          <GroupItem itemType="group" colCount={4} colSpan={4}>
            <Item
              colSpan={2}
              dataField="CompaniaContratista"
              label={{
                text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.COMPANY" })
              }}
              editorOptions={{
                readOnly: true
              }}
            />
            <Item
              colSpan={2}
              dataField="NombreCompleto"
              label={{
                text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.NAME" })
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
              colSpan={2}
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
              colSpan={2}
              dataField="FechaFin"
              label={{
                text: intl.formatMessage({ id: "COMMON.ENDDATE" })
              }}
              isRequired={true}
              editorType="dxDateBox"
              dataType="datetime"
              editorOptions={{
                min: dataRowEditNew.FechaInicio,
                inputAttr: { style: "text-transform: uppercase" },
                displayFormat: "dd/MM/yyyy",
                onValueChanged: e => setDataRowEditNew({ ...dataRowEditNew, FechaFin: e.value })
              }}
            />
          </GroupItem>
        </Form>
      </PortletBody>
    </Portlet>
  </Popup>
};

export default injectIntl(ReservaEditDatePage);
