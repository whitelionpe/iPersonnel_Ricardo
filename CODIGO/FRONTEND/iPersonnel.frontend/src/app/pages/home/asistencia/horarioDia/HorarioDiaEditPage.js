import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import Form, { Item, GroupItem, RequiredRule, PatternRule } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";

import { listarEstadoSimple, listarEstado, listarTurno } from "../../../../../_metronic";
import { isRequired, isModified } from "../../../../../_metronic/utils/securityUtils";
//import { obtener } from "../../../../api/asistencia/horarioDia.api";
import { handleInfoMessages } from "../../../../store/ducks/notify-messages";
import './HorarioDiaPage.css'
import HeaderInformation from "../../../../partials/components/HeaderInformation";

const HorarioDiaEditPage = props => {
  const { intl, modoEdicion, settingDataField, accessButton, dataRowEditNew } = props;
  const [estadoSimple, setEstadoSimple] = useState([]);
  const [estado, setEstado] = useState([]);
  const [turno, setTurno] = useState([]);
  const [valueHoraEntrada, setValueHoraEntrada] = useState([]);
  const [valueMinutosRefrigerio, setValueMinutosRefrigerio] = useState([]);
  const classesEncabezado = useStylesEncabezado();


  async function cargarCombos() {
    let estadoSimple = listarEstadoSimple();
    setEstadoSimple(estadoSimple);

    let estado = listarEstado();
    setEstado(estado);

    let turno = listarTurno();
    setTurno(turno);

  }




  function grabar(e) {
    let result = e.validationGroup.validate();
    let validar = [];

    if (result.isValid) {
      //Datos ingresado sean correctos.
      const { Turno, HoraEntrada, HoraSalida, InicioControl, InicioRefrigerio, FinRefrigerio, ControlHEAntes, ControlHEDespues, MinutosRefrigerio, MinutosTolerancia, MinutosFlexible } = dataRowEditNew;
      let dtHoraEntrada = Date.parse(HoraEntrada);
      let dtHoraSalida = Date.parse(HoraSalida);

      let dtInicioControl = Date.parse(InicioControl);
      let dtInicioRefrigerio = Date.parse(InicioRefrigerio);
      let dtFinRefrigerio = Date.parse(FinRefrigerio);
      let dtControlHEAntes = Date.parse(ControlHEAntes);
      let dtControlHEDespues = Date.parse(ControlHEDespues);

      let currentInicioRefrigerio = Date.parse(InicioRefrigerio);
      let currentFinRefrigerio = Date.parse(FinRefrigerio);
      //flexibles=480

      // si es noche
      if (Turno == 'N') {

        let inicioRefrigerioAux = new Date(InicioRefrigerio);
        let finRefrigerioAux = new Date(FinRefrigerio);
        let horaSalidaAux = new Date(HoraSalida);
        let horaEntradaAux = new Date(HoraEntrada);

        let maxHourNight = horaSalidaAux.getHours();

        //obtiene la hora de fecha ingresada
        let currentHourInicioRefrigerio = inicioRefrigerioAux.getHours();
        let currentHourFinRefrigerio = finRefrigerioAux.getHours();
        let currentHourSalida = horaSalidaAux.getHours();
        let currentHourEntrada = horaEntradaAux.getHours();

        if (currentHourEntrada > currentHourSalida) {
          horaSalidaAux.setDate(horaSalidaAux.getDate() + 1);
          dtHoraSalida = Date.parse(horaSalidaAux);
        }

        // si la hora es menor que las 6, se asume que es el otro día
        if (currentHourInicioRefrigerio < maxHourNight) {
          inicioRefrigerioAux.setDate(inicioRefrigerioAux.getDate() + 1);
          currentInicioRefrigerio = Date.parse(inicioRefrigerioAux);
          dtInicioRefrigerio = currentInicioRefrigerio;
        }

        // si la hora es menor que las 6, se asume que es el otro día
        if (currentHourFinRefrigerio < maxHourNight) {
          finRefrigerioAux.setDate(finRefrigerioAux.getDate() + 1);
          currentFinRefrigerio = Date.parse(finRefrigerioAux);
          dtFinRefrigerio = currentFinRefrigerio;
        }


        let aux = new Date(ControlHEDespues);
        aux.setDate(aux.getDate() + 1);
        dtControlHEDespues = Date.parse(aux);
      }

      let milisegundosPorMinutos = 60000;

      let newMinutosRefrigerios = (currentFinRefrigerio - currentInicioRefrigerio);
      let minutosCalculado = newMinutosRefrigerios / milisegundosPorMinutos;
      let newMinutosRefrigeriosNoche = (currentFinRefrigerio - currentInicioRefrigerio);

      let minutosCalculadoNoche = newMinutosRefrigeriosNoche / milisegundosPorMinutos;

      /*Minutos flexibles permitido como máximo*/
      let cantMinutosPermitidos = 480;
      let cantMinutosFlexiblePermitido = 280;

      if (Turno === "D") {
        if (dtHoraSalida < dtHoraEntrada) {
          validar.push("La hora de salida debe ser mayor a la hora de entrada.");
        }
        if (dtInicioControl > dtHoraEntrada) {
          validar.push("La hora de entrada debe ser mayor al inicio de control.");
        }
        if (dtFinRefrigerio > dtHoraSalida) {
          validar.push("La hora de salida debe ser mayor a la hora fin de refrigerio.");
        }
        if (dtInicioControl > dtInicioRefrigerio) {
          validar.push("La hora inicio de refrigerio debe ser mayor a la hora inicio control.");
        }

        if (dtInicioRefrigerio < dtHoraEntrada) {
          validar.push("La hora de inicio de refrigerio debe ser mayor a la hora de entrada.");
        }

        if (dtHoraSalida > dtControlHEDespues) {
          validar.push("Control de Horas Extras después de la salida, debe ser mayor a su hora de salida.");
        }
        if (dtControlHEAntes < dtInicioControl) {
          validar.push("La hora extra de ingreso debe ser mayor a la hora inicio de control.");
        }
        if (dtControlHEAntes > dtHoraEntrada) {
          validar.push("La hora extra de ingreso debe ser menor a la hora de entrada.");
        }

        if (dataRowEditNew.MinutosRefrigerio > minutosCalculado) {
          validar.push("Los minutos de refrigerio se encuentra fuera del rango.");
        }

        if (dataRowEditNew.MinutosTolerancia > cantMinutosPermitidos) {
          validar.push("Ha excedido la cantidad de minutos tolerancia permitido.");
        }

        if (dataRowEditNew.MinutosFlexible > cantMinutosFlexiblePermitido) {
          validar.push("Ha excedido la cantidad de minutos flexible permitido.");
        }
      }
      else {

        if (dtHoraEntrada > dtHoraSalida) {
          validar.push("La hora de entrada debe ser menor a la hora de salida.");
        }

        if (dtInicioControl > dtHoraEntrada) {
          validar.push("La hora de entrada debe ser mayor al inicio de control.");
        }
        if (dtHoraEntrada > dtInicioRefrigerio) {
          validar.push("La hora de inicio de refrigerio debe ser mayor a la hora de entrada.");
        }

        if (currentFinRefrigerio > dtHoraSalida) {
          validar.push("La hora de salida debe ser mayor que la hora fin de refrigerio.");
        }

        if (dtInicioControl > dtInicioRefrigerio) {
          validar.push("La hora de inicio refrigerio debe ser mayor al inicio de control.");
        }

        if (dtHoraEntrada > dtInicioRefrigerio) {
          validar.push("La hora entrada debe ser menor a la hora de inicio refrigerio.");
        }

        if (currentInicioRefrigerio > currentFinRefrigerio) {
          validar.push("La hora inicio de refrigerio debe ser mayor que la hora fin de refrigerio.");
        }

        if (dtHoraSalida > dtControlHEDespues) {
          validar.push("La hora extra debe ser mayor a la hora de salida.");
        }

        if (dtControlHEAntes < dtInicioControl) {
          validar.push("La hora extra de ingreso debe ser mayor a la hora inicio de control.");
        }
        if (dtControlHEAntes > dtHoraEntrada) {
          validar.push("La hora extra de ingreso debe ser menor a la hora de entrada.");
        }

        if (dtHoraEntrada > dtHoraSalida) {
          validar.push("La  hora de inico de refrigerio no debe ser mayor que fin de refrigerio.");
        }

        if (dataRowEditNew.MinutosRefrigerio > minutosCalculadoNoche) {
          validar.push("Los minutos de refrigerio se encuentra fuera del rango.");
        }

        if (dataRowEditNew.MinutosTolerancia > cantMinutosPermitidos) {
          validar.push("Ha excedido la cantidad de minutos tolerancia permitido.");
        }

        if (dataRowEditNew.MinutosFlexible > cantMinutosFlexiblePermitido) {
          validar.push("Ha excedido la cantidad de minutos flexible permitido.");
        }

      }


      let messageSumary = '';
      if (validar.length > 0) {
        result.isValid = false;
        for (let i = 0; i < validar.length; i++) {
          messageSumary += validar[i] + "\n" + "\n";
        }

        handleInfoMessages(messageSumary);
      }
      else {
        if (dataRowEditNew.esNuevoRegistro) {
          props.agregarHorarioDia(dataRowEditNew);
        } else {
          props.actualizarHorarioDia(dataRowEditNew);
        }

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

          <Form formData={dataRowEditNew} validationGroup="FormEdicion" >

            <GroupItem itemType="group" colCount={6} colSpan={6}>
              <Item colSpan={6}>
                <AppBar position="static" className={classesEncabezado.secundario}>
                  <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                    <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                      {intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.DETAIL" })} <b style={{ color: "rgb(150 219 147)" }}>   {dataRowEditNew.Dia} </b>
                    </Typography>
                  </Toolbar>
                </AppBar>
              </Item>
              <Item dataField="IdDia" visible={false} />

              <Item
                dataField="Turno"
                colSpan={3}
                label={{ text: intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.TURN" }) }}
                editorType="dxSelectBox"
                isRequired={modoEdicion}
                editorOptions={{
                  items: turno,
                  valueExpr: "Valor",
                  displayExpr: "Descripcion"
                }}
              />

              <Item
                dataField="InicioControl"
                colSpan={2}
                label={{ text: intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.HOMECONTROL", }), }}
                isRequired={modoEdicion}
                editorType="dxDateBox"
                editorOptions={{
                  style: "width: 430px;",
                  showClearButton: true,
                  useMaskBehavior: true,
                  maxLength: 5,
                  displayFormat: "HH:mm",
                  type: "time"
                }}
              />


              <Item
                dataField="Descanso"
                isRequired={modoEdicion ? isRequired("Descanso", settingDataField) : false}
                colSpan={1}
                editorType="dxCheckBox"
                label={{ text: intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.BREAK" }), }}
                editorOptions={{
                  alignment: 'rigth',
                  width: "100%"
                }}
              />


              <GroupItem itemType="group" colSpan={3} >
                <GroupItem cssClass={"card"} >
                  <GroupItem cssClass={"card-header-ingreso"} >
                    {intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.ENTRY" })}
                  </GroupItem>
                  <GroupItem cssClass={"card-body"} >

                    <Item
                      dataField="HoraEntrada"
                      label={{ text: intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.ENTRY.TIME" }), }}
                      isRequired={modoEdicion}
                      editorType="dxDateBox"
                      editorOptions={{
                        showClearButton: true,
                        useMaskBehavior: true,
                        maxLength: 5,
                        displayFormat: "HH:mm",
                        type: "time"
                      }}
                    />

                    <Item
                      dataField="MinutosTolerancia"
                      label={{ text: intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.MIN.TOLERANCE" }), }}
                      isRequired={modoEdicion}
                      editorType="dxNumberBox"
                      dataType="number"
                      editorOptions={{
                        inputAttr: { style: "text-transform: uppercase; text-align: right" },
                        disabled: dataRowEditNew.Flexible == "S",
                        showSpinButtons: true,
                        showClearButton: true,
                        min: 0,
                      }}
                    >
                      <PatternRule pattern={/[0-9]/} message={intl.formatMessage({ id: "COMMON.ENTER.NUMERIC.DATA" })} />
                    </Item>


                    <Item
                      dataField="MinutosFlexible"
                      label={{ text: intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.FLEXIBLE", }), }}
                      colSpan={3}
                      editorType="dxNumberBox"
                      dataType="number"
                      editorOptions={{
                        inputAttr: { style: "text-transform: uppercase; text-align: right" },
                        disabled: dataRowEditNew.Flexible == "N",
                        showSpinButtons: true,
                        showClearButton: true,
                        min: 0
                      }}
                    >

                      <RequiredRule message="Minutos flexible is required" />
                      <PatternRule pattern={/[0-9]/} message={intl.formatMessage({ id: "COMMON.ENTER.NUMERIC.DATA" })} />


                    </Item>

                  </GroupItem>
                </GroupItem >

              </GroupItem>

              <GroupItem itemType="group" colSpan={3} >
                <GroupItem cssClass={"card"} >
                  <GroupItem cssClass={"card-header-salida"} >
                    {intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.DEPARTURE" })}
                  </GroupItem>
                  <GroupItem cssClass={"card-body"} >


                    <Item
                      dataField="HoraSalida"
                      label={{ text: intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.DEPARTURE.TIME" }), }}
                      isRequired={modoEdicion}
                      editorType="dxDateBox"
                      editorOptions={{
                        showClearButton: true,
                        useMaskBehavior: true,
                        maxLength: 5,
                        displayFormat: "HH:mm",
                        type: "time"
                      }}
                    />


                  </GroupItem>
                </GroupItem >

              </GroupItem>

              <GroupItem itemType="group" colSpan={3} >
                <GroupItem cssClass={"card"} >
                  <GroupItem cssClass={"card-header-refrigerio"} >
                    {intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.REFRESHMENT" })}
                  </GroupItem>
                  <GroupItem cssClass={"card-body"} >
                    <Item
                      dataField="InicioRefrigerio"
                      label={{ text: intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.HOME.CONTROL", }), }}
                      isRequired={modoEdicion}
                      editorType="dxDateBox"
                      editorOptions={{
                        showClearButton: true,
                        useMaskBehavior: true,
                        maxLength: 5,
                        displayFormat: "HH:mm",
                        type: "time"
                      }}
                    />
                    <Item
                      dataField="FinRefrigerio"
                      label={{ text: intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.END.CONTROL", }), }}
                      isRequired={modoEdicion}
                      editorType="dxDateBox"
                      editorOptions={{
                        showClearButton: true,
                        useMaskBehavior: true,
                        maxLength: 5,
                        displayFormat: "HH:mm",
                        type: "time",
                      }}
                    />


                    <Item
                      dataField="MinutosRefrigerio"
                      label={{ text: intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.ALLOCATED.MINUTES", }), }}
                      isRequired={modoEdicion}
                      editorType="dxNumberBox"
                      dataType="number"
                      editorOptions={{
                        inputAttr: {
                          style: "text-transform: uppercase; text-align: right",
                        },
                        showSpinButtons: true,
                        showClearButton: true,
                        min: 0,
                      }}
                    >
                      <PatternRule pattern={/[0-9]/} message={intl.formatMessage({ id: "COMMON.ENTER.NUMERIC.DATA" })} />
                    </Item>

                  </GroupItem>
                </GroupItem >

              </GroupItem>

              <GroupItem itemType="group" colSpan={3} >
                <GroupItem cssClass={"card"} >
                  <GroupItem cssClass={"card-header-horasExtra"} >
                    {intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.START.OVERTIME.CONTROL" })}
                  </GroupItem>
                  <GroupItem cssClass={"card-body"} >
                    <Item
                      dataField="ControlHEAntes"
                      label={{ text: intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.BEFORE.ADMISSION", }), }}
                      isRequired={modoEdicion}
                      editorType="dxDateBox"
                      editorOptions={{
                        showClearButton: true,
                        useMaskBehavior: true,
                        maxLength: 5,
                        displayFormat: "HH:mm",
                        type: "time"
                      }}
                    />
                    <Item
                      dataField="ControlHEDespues"
                      label={{
                        text: intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.AFTER.DEPARTURE", }),
                      }}
                      isRequired={modoEdicion}
                      editorType="dxDateBox"
                      editorOptions={{
                        showClearButton: true,
                        useMaskBehavior: true,
                        maxLength: 5,
                        displayFormat: "HH:mm",
                        type: "time"
                      }}
                    />

                  </GroupItem>
                </GroupItem >

              </GroupItem>


              <Item dataField="IdCliente" visible={false} />
              <Item dataField="IdDivision" visible={false} />
              <Item dataField="IdCompania" visible={false} />
              <Item dataField="IdHorario" visible={false} />

            </GroupItem>
          </Form>
        </React.Fragment>
      </PortletBody>
    </>
  );
};

export default injectIntl(HorarioDiaEditPage);
