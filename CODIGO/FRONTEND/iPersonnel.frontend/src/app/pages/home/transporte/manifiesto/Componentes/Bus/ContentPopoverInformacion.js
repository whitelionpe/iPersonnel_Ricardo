import React, { useState, useEffect } from "react";
import Form, { Item, GroupItem } from "devextreme-react/form";
import Box, { Item as ItemBox } from 'devextreme-react/box';
import { Button } from 'devextreme-react';
import { useSelector } from "react-redux";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import ControlSwitch from "../../../../../../store/ducks/componente/componenteSwitch";
import { useStylesEncabezado } from "../../../../../../store/config/Styles";
import { service } from "../../../../../../api/transporte/manifiestoResponsable.api";
import { service as servicemanifiestoDetalle } from "../../../../../../api/transporte/manifiestoDetalle.api";

import { customMessageHandler, handleErrorMessages, handleSuccessMessages } from "../../../../../../store/ducks/notify-messages";
import { injectIntl } from "react-intl";


const TIPO_PARADERO = {
  Origen: 'ORI',
  Destino: 'DES',
};

const ContentPopoverInformacion = ({
  data,
  popoverInstance,
  esModificable,
  intl
}) => {

  console.log("ContentPopoverInformacion|esModificable:",esModificable);
  console.log("ContentPopoverInformacion|data:",data);

  const messages = {
    ActualizacionExitosa: intl.formatMessage({ id: "TRANSPORTE.MANIFEST.UPDATESUCCES" }) //'La actualización de la ruta se realizó con éxito!',
  };

  const classesEncabezado = useStylesEncabezado();
  const usuario = useSelector(state => state.auth.user);

  const [mostrarDatosAuditoria, setMostrarDatosAuditoria] = useState(false);
  const [listParaderosOrigen, setListParaderosOrigen] = useState([]);
  const [listParaderosDestino, setListParaderosDestino] = useState([]);
  const [idParaderoOrigen, setIdParaderoOrigen] = useState('');
  const [idParaderoDestino, setIdParaderoDestino] = useState('');

  const { IdPasajero, IdManifiesto, Nivel, Fila, Columna } = data;
  const { Asiento, EstadoAsiento } = data;
  const { Pasajero, IdParaderoInicial, IdParaderoFinal } = data;
  const { IdUsuarioCreacion, FechaCreacionFormateada, IdUsuarioModificacion, FechaModificacionFormateada } = data;

  const [rutaData] = useState({ IdManifiesto, Nivel, Fila, Columna, Pasajero, IdParaderoInicial, IdParaderoFinal, IdUsuarioModificacion: usuario.username });

  const toggleDatosAuditoria = () => setMostrarDatosAuditoria(!mostrarDatosAuditoria);

  const reservar = async () => {

    if (IdManifiesto && IdPasajero && Nivel > 0 && Fila >= 0 && Columna >= 0) {
      await servicemanifiestoDetalle.actualizar({ ...rutaData, IdPasajero, IdManifiesto, IdParaderoInicial: idParaderoOrigen, IdParaderoFinal: idParaderoDestino, Nivel, Fila, Columna }).then((response) => {
        const { mensajeError } = response;
        if (!mensajeError) {
          popoverInstance.hide();
          // handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), messages.AsignacionExitosa);
          handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
        } else {
          customMessageHandler(mensajeError, { type: 'error' });
        }
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
      });
    }
  }

  const cargarParaderosPorManifiesto = async () => {

    let listOrigen = [];
    let listDestino = [];

    if (IdManifiesto) {
      listOrigen = await service.listarParaderos({ IdManifiesto, Tipo: TIPO_PARADERO.Origen });
      listDestino = await service.listarParaderos({ IdManifiesto, Tipo: TIPO_PARADERO.Destino });

      if (listOrigen && listOrigen.length > 0) setIdParaderoOrigen(listOrigen[0].IdParadero);
      if (listDestino && listDestino.length > 0) setIdParaderoDestino(listDestino[listDestino.length - 1].IdParadero);
    }
    console.log("cargarParaderosPorManifiesto|listOrigen:",listOrigen);
    console.log("cargarParaderosPorManifiesto|listDestino:",listDestino);
    setListParaderosOrigen(listOrigen.result);
    setListParaderosDestino(listDestino.result);
  };

  useEffect(() => {
  
    if (popoverInstance.isVisible) {
      cargarParaderosPorManifiesto();
    }
  }, [popoverInstance.isVisible]);

  return (
    <>
      <div className="row">
        <div className="col-md-12">
          {  
            Asiento &&
            <Form formData={{ Asiento, EstadoAsiento }}>
              <Item>
                <AppBar position="static" className={classesEncabezado.secundario}>
                    <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                      <Typography variant="h6" color="inherit" className={classesEncabezado.title}>{intl.formatMessage({ id: "TRANSPORTE.MANIFEST.SEATS" })}</Typography>
                    </Toolbar>
                  </AppBar>
              </Item>
              <GroupItem colCount={20}>
                <Item dataField="Asiento" hoverStateEnabled={true} label={{ text: intl.formatMessage({ id: "TRANSPORTE.MANIFEST.NUMBER.SEAT" }) }} editorOptions={{ readOnly: true, }} colSpan={7} />
                <Item dataField="EstadoAsiento" hoverStateEnabled={true} label={{ text:  intl.formatMessage({ id: "COMMON.STATE" })  }} editorOptions={{ readOnly: true, }} colSpan={13} />
              </GroupItem>
            </Form>
          }
          {
            Pasajero &&
            <Form formData={data} className="pt-3">
              <Item>
                <AppBar position="static" className={classesEncabezado.secundario}>
                    <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                      <Typography variant="h6" color="inherit" className={classesEncabezado.title}>{intl.formatMessage({ id: "TRANSPORTE.MANIFEST.PASSENGERANDTRIP" })}</Typography>
                    </Toolbar>
                  </AppBar>
              </Item>
              <GroupItem> 
                <Item dataField="Pasajero" hoverStateEnabled={true} label={{ text:  intl.formatMessage({ id: "ACCESS.VEHICLE.MARK.PASSENGERS" }) }} editorOptions={{ readOnly: true, }} />
              </GroupItem>
              <GroupItem colCount={2}>
                <Item dataField="IdParaderoInicial" isRequired={esModificable} editorType="dxSelectBox" hoverStateEnabled={true} label={{ text: intl.formatMessage({ id: "SYSTEM.CONFIGURATIONS.ORIGEN" })  }}
                  editorOptions={{
                    items: listParaderosOrigen,
                    valueExpr: "IdParadero",
                    displayExpr: "Paradero",
                    searchEnabled: true,
                    readOnly: !esModificable
                  }} />
                <Item dataField="IdParaderoFinal" isRequired={esModificable} editorType="dxSelectBox" hoverStateEnabled={true} label={{ text: intl.formatMessage({ id: "SYSTEM.CONFIGURATIONS.DESTINO" }) }}
                  editorOptions={{
                    items: listParaderosDestino,
                    valueExpr: "IdParadero",
                    displayExpr: "Paradero",
                    searchEnabled: true,
                    readOnly: !esModificable
                  }} />
              </GroupItem>
            </Form>
          }
          {
            <Form formData={{ IdUsuarioCreacion, FechaCreacionFormateada, IdUsuarioModificacion, FechaModificacionFormateada }} className="pt-3">
              <Item>
                <AppBar position="static" className={classesEncabezado.secundario}>
                  <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                    <Typography variant="h6" color="inherit" className={classesEncabezado.title}>{intl.formatMessage({ id: "AUDIT.DATA" })}</Typography>
                    <div className="switch-right">
                      <ControlSwitch checked={mostrarDatosAuditoria} 
                        onChange={toggleDatosAuditoria}
                      />
                      <span onClick={toggleDatosAuditoria}>{mostrarDatosAuditoria ? intl.formatMessage({ id: "COMMON.SHOW" }) : intl.formatMessage({ id: "COMMON.HIDE" })}</span>
                    </div>
                  </Toolbar>
                </AppBar>
              </Item>
              {
                mostrarDatosAuditoria &&
                <GroupItem colCount={2}>
                  <Item dataField="IdUsuarioCreacion" hoverStateEnabled={true} label={{ text: intl.formatMessage({ id: "AUDIT.USERCREATION" }) }} editorOptions={{ readOnly: true, }} />
                  <Item dataField="FechaCreacionFormateada" hoverStateEnabled={true} label={{ text:  intl.formatMessage({ id: "AUDIT.CREATIONDATE" })}} editorOptions={{ readOnly: true, }} />
                </GroupItem> 
              }
              {
                mostrarDatosAuditoria &&
                <GroupItem colCount={2} visible={!!IdUsuarioModificacion}>
                  <Item dataField="IdUsuarioModificacion" hoverStateEnabled={true} label={{ text: intl.formatMessage({ id: "AUDIT.USERMODIFICATION" }) }} editorOptions={{ readOnly: true, }} />
                  <Item dataField="FechaModificacionFormateada" hoverStateEnabled={true} label={{ text: intl.formatMessage({ id: "AUDIT.MODIFICATIONDATE" })}} editorOptions={{ readOnly: true, }} />
                </GroupItem>
              }
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
                text={intl.formatMessage({ id: "ACTION.RECORD" })}
                type="default"
                stylingMode="contained"
                onClick={reservar}
                visible={esModificable && IdManifiesto && IdPasajero && Nivel > 0 && Fila >= 0 && Columna >= 0}
              />
            </ItemBox>
            <ItemBox ratio={1}>
              <Button
                width={130}
                className="default-button mx-auto"
                icon="close"
                text={intl.formatMessage({ id: "TRANSPORTE.MANIFEST.TOCLOSE" })}
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
export default injectIntl(ContentPopoverInformacion);

