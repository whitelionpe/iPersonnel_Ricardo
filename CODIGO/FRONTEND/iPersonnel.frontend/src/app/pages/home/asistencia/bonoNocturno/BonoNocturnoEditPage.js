import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import Form, { Item, GroupItem } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";
import HeaderInformation from "../../../../partials/components/HeaderInformation";
import { listarEstadoSimple, listarEstado } from "../../../../../_metronic";
import { isRequired } from "../../../../../_metronic/utils/securityUtils";
import { ObtenerTodosClientePadre as obtenerTodosDivision } from "../../../../api/sistema/division.api";
import { useSelector } from "react-redux";
import { handleInfoMessages } from "../../../../store/ducks/notify-messages";



const BonoNocturnoEditPage = props => {
  const { intl, modoEdicion, settingDataField, accessButton } = props;
  const { IdCliente } = useSelector(state => state.perfil.perfilActual);
  const [estadoSimple, setEstadoSimple] = useState([]);
  const [estado, setEstado] = useState([]);
  const classesEncabezado = useStylesEncabezado();
  const [cmbDivisiones, setCmbDivisiones] = useState([]);


  async function cargarCombos() {
    let estadoSimple = listarEstadoSimple();
    setEstadoSimple(estadoSimple);

    let estado = listarEstado();
    setEstado(estado);

    if (IdCliente) {
      let divisiones = await obtenerTodosDivision({ IdCliente: IdCliente });
      setCmbDivisiones(divisiones);
    }

  }

  function grabar(e) {
    let result = e.validationGroup.validate();

    if (result.isValid) {
      let currentInicio = Date.parse(props.dataRowEditNew.HoraInicio);
      let currentFin = Date.parse(props.dataRowEditNew.HoraFin);

      let inicio = new Date(props.dataRowEditNew.HoraInicio);
      let fin = new Date(props.dataRowEditNew.HoraFin);
      let milisegundos = Math.abs(fin - inicio);
      let horas = milisegundos / 36e5;
      let minHoras = 8;

      let maxHourNight = 7;
      let currentHourInicio = inicio.getHours();
      let currentHourFin = fin.getHours();

      // si la hora es menor que las 7, se asume que es el otro día
      if (currentHourInicio < maxHourNight) {
        inicio.setDate(inicio.getDate() + 1);
        currentInicio = Date.parse(inicio);
      }
      // si la hora es menor que las 7, se asume que es el otro día
      if (currentHourFin < maxHourNight) {
        fin.setDate(fin.getDate() + 1);
        currentFin = Date.parse(fin);
      }

      if (horas < minHoras) {
        handleInfoMessages(intl.formatMessage({ id: "MESSAGES.INFO" }),
          intl.formatMessage({ id: "ASSISTANCE.NIGHT.BONUS.INFO" }));
        return;
      }

      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregarBonoNocturno(props.dataRowEditNew);
      } else {
        props.actualizarBonoNocturno(props.dataRowEditNew);
      }
    }
  }


  useEffect(() => {
    cargarCombos();
  }, []);

  return (
    <>
      <HeaderInformation
        data={props.getInfo()}
        visible={true}
        labelLocation={'left'} colCount={6}
        toolbar={
          <PortletHeader
            title={""}
            toolbar={
              <PortletHeaderToolbar>
                <Button
                  icon="fa fa-save"
                  type="default"
                  hint={intl.formatMessage({ id: "ACTION.RECORD" })}
                  onClick={grabar}
                  useSubmitBehavior={true}
                  validationGroup="FormEdicion"
                  visible={modoEdicion}
                  disabled={!accessButton.grabar}
                />
                &nbsp;
                <Button
                  icon="fa fa-times-circle"
                  type="normal"
                  hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
                  onClick={props.cancelarEdicion}
                />
              </PortletHeaderToolbar>
            }
          />
        }
      />

      <PortletBody >
        <React.Fragment>
          <Form formData={props.dataRowEditNew} validationGroup="FormEdicion" >
            <GroupItem itemType="group" colCount={2} colSpan={2}>
              <Item colSpan={2}>
                <AppBar position="static" className={classesEncabezado.secundario}>
                  <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                    <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                      {intl.formatMessage({ id: "COMMON.DETAIL" })}
                    </Typography>
                  </Toolbar>
                </AppBar>
              </Item>

              <Item dataField="IdCompania" visible={false} />

              <Item
                dataField="IdDivision"
                label={{ text: intl.formatMessage({ id: "SYSTEM.DIVISION" }) }}
                isRequired={true}
                editorType="dxSelectBox"
                editorOptions={{
                  items: cmbDivisiones,
                  valueExpr: "IdDivision",
                  displayExpr: "Division",
                  showClearButton: true,
                  readOnly: props.dataRowEditNew.esNuevoRegistro ? false : true
                }}
              />
              <Item />

              <Item
                dataField="HoraInicio"
                label={{ text: intl.formatMessage({ id: "ACCESS.PERSON.GRUPO.STARTTIME" }) }}
                isRequired={modoEdicion ? isRequired("HoraInicio", settingDataField) : false}
                editorType="dxDateBox"
                editorOptions={{
                  showClearButton: true,
                  useMaskBehavior: true,
                  maxLength: 5,
                  displayFormat: "HH:mm",
                  type: "time",
                  readOnly: !modoEdicion,
                }}
              />

              <Item
                dataField="HoraFin"
                label={{ text: intl.formatMessage({ id: "CASINO.DINNINGROOM.SERVICE.ENDTIME" }) }}
                isRequired={modoEdicion ? isRequired("HoraFin", settingDataField) : false}
                editorType="dxDateBox"
                editorOptions={{
                  showClearButton: true,
                  useMaskBehavior: true,
                  maxLength: 5,
                  displayFormat: "HH:mm",
                  type: "time",
                  readOnly: !modoEdicion,
                }}
              />

              <Item />
              <Item
                dataField="Activo"
                label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
                isRequired={true}
                editorType="dxSelectBox"
                editorOptions={{
                  items: estadoSimple,
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                  readOnly: !(modoEdicion ? (props.dataRowEditNew.esNuevoRegistro ? false : true) : false)
                }}
              />

              <Item dataField="IdCliente" visible={false} />

            </GroupItem>
          </Form>

        </React.Fragment>
      </PortletBody>
    </>
  );
};

export default injectIntl(BonoNocturnoEditPage);
