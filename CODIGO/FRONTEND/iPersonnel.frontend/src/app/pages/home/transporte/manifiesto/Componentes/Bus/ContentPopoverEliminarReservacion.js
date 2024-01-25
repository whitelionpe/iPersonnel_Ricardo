import React from "react";
import Form, { Item, GroupItem } from "devextreme-react/form";
import Box, { Item as ItemBox } from 'devextreme-react/box';
import { Button } from 'devextreme-react';
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { handleErrorMessages, handleSuccessMessages } from "../../../../../../store/ducks/notify-messages";
import { service } from "../../../../../../api/transporte/manifiestoResponsable.api";
import { useStylesEncabezado } from "../../../../../../store/config/Styles";
import { injectIntl } from "react-intl";


const ContentPopoverEliminarReservacion = ({
  data,
  popoverInstance,
  cargarConfiguracionAsientos,
  intl
}) => {
  const classesEncabezado = useStylesEncabezado();

  const { IdManifiesto, Asiento, EstadoAsiento, Pasajero, ParaderoInicial, ParaderoFinal,IdPasajero } = data;

  const messages = {
    DesasignacionExitosa: intl.formatMessage({ id: "TRANSPORTE.MANIFEST.NUMBER.SEAT" })
  };

  const eliminarReservacion = async () => {
    console.log(data)
    if (IdManifiesto && Asiento && Pasajero) {
      await service.eliminarAsignacion({ IdManifiesto, Asiento, CodigoTrabajador: IdPasajero }).then(() => {
        popoverInstance.hide();
        cargarConfiguracionAsientos();
        handleSuccessMessages(messages.DesasignacionExitosa);
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
      });
    }
  }

  return (
    <>
      <div className="row">
        <div className="col-md-12">
          {
            Asiento && Pasajero &&
            <Form formData={{ Asiento, EstadoAsiento, Pasajero, ParaderoInicial, ParaderoFinal }}>
              <Item>
                <AppBar position="static" className={classesEncabezado.secundario}>
                  <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                    <Typography variant="h6" color="inherit" className={classesEncabezado.title}>   {intl.formatMessage({ id: "TRANSPORTE.MANIFEST.DELETE.SEATMESAGGE" })} </Typography>
                  </Toolbar>
                </AppBar>

              </Item>
              <GroupItem>
                <Item dataField="Pasajero" hoverStateEnabled={true} label={{ text: intl.formatMessage({ id: "ACCESS.VEHICLE.MARK.PASSENGERS" }) }} editorOptions={{ readOnly: true, }} />
              </GroupItem>
              <GroupItem colCount={2}>
                <Item dataField="ParaderoInicial" hoverStateEnabled={true} label={{ text: intl.formatMessage({ id: "SYSTEM.CONFIGURATIONS.ORIGEN" }) }} editorOptions={{ readOnly: true, }} />
                <Item dataField="ParaderoFinal" hoverStateEnabled={true} label={{ text: intl.formatMessage({ id: "SYSTEM.CONFIGURATIONS.DESTINO" }) }} editorOptions={{ readOnly: true, }} />
              </GroupItem>
              <GroupItem colCount={20}>
                <Item dataField="Asiento" hoverStateEnabled={true} label={{ text: intl.formatMessage({ id: "TRANSPORTE.MANIFEST.NUMBER.SEAT" }) }} editorOptions={{ readOnly: true, }} colSpan={7} />
                <Item dataField="EstadoAsiento" hoverStateEnabled={true} label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }} editorOptions={{ readOnly: true, }} colSpan={13} />
              </GroupItem>
            </Form>

          }
          <Box
            direction="row"
            width="100%"
            className="mt-4"
          >
            <ItemBox ratio={0} baseSize="20%"></ItemBox>
            <ItemBox ratio={1}>
              <Button
                width={140}
                className="mx-auto"
                icon="check"
                text={intl.formatMessage({ id: "ACTION.ACCEPT" })}
                type="default"
                stylingMode="contained"
                onClick={eliminarReservacion}
              />
            </ItemBox>
            <ItemBox ratio={1}>
              <Button
                width={130}
                className="default-button mx-auto"
                icon="close"
                text={intl.formatMessage({ id: "ACTION.CANCEL" })}
                type="normal"
                stylingMode="contained"
                onClick={popoverInstance.hide}
              />
            </ItemBox>
            <ItemBox ratio={0} baseSize="20%"></ItemBox>
          </Box>
        </div>
      </div>
    </>
  );
}
export default injectIntl(ContentPopoverEliminarReservacion);

