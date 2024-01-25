import React, { Fragment, useState, useEffect } from 'react';
import { injectIntl } from "react-intl";
import { Button } from "devextreme-react";
import { withRouter } from 'react-router-dom';
import Form, {
  Item,
  GroupItem
} from "devextreme-react/form";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";

import { WithLoandingPanel } from "../../../../../../../partials/content/withLoandingPanel";
import { useStylesEncabezado } from "../../../../../../../store/config/Styles";
import { isNotEmpty, dateFormat } from "../../../../../../../../_metronic";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../../../partials/content/Portlet";
import FieldsetAcreditacion from '../../../../../../../partials/content/Acreditacion/FieldsetAcreditacion/FieldsetAcreditacion';

const DetalleEditPage = (props) => {

  const classesEncabezado = useStylesEncabezado();
  const { intl, setLoading, dataMenu, modoEdicion } = props;

  const paintTitle = () => {
    return (
      <div className="title-estado-general">
        <div className="title-estado-general-bar"> {intl.formatMessage({ id: "ACCREDITATION.EDIT.REQUEST" })}
          <b>{zeroPad(props.dataRowEditNew.IdSolicitud, 8)} </b>
        </div>
        {paintState()}
      </div>
    );
  }

  function zeroPad(num, places) {
    if (num === undefined) {
      return "";
    }
    var zero = places - num.toString().length + 1;
    return Array(+(zero > 0 && zero)).join("0") + num;
  }

  const paintState = () => {

    let estado = '';
    let css = '';
    switch (props.dataRowEditNew.EstadoAprobacion) {
      case 'I': css = 'estado_item_incompleto'; estado = intl.formatMessage({ id: "COMMON.INCOMPLETE" }); break;
      case 'P': css = 'estado_item_pendiente'; estado = intl.formatMessage({ id: "COMMON.EARRING" }); break;
      case 'O': css = 'estado_item_observado'; estado = intl.formatMessage({ id: "COMMON.OBSERVED" }); break;
      case 'R': css = 'estado_item_rechazado'; estado = intl.formatMessage({ id: "COMMON.REJECTED" }); break;
      case 'A': css = 'estado_item_aprobado'; estado = intl.formatMessage({ id: "COMMON.APPROVED" }); break;
      default: css = 'estado_item_incompleto'; estado = intl.formatMessage({ id: "COMMON.INCOMPLETE" }); break;
    }
    return <span className={`estado_item_izq estado_item_general  ${css}`}   >{estado}</span>
  }


  function retornaColor() {
    const { DiasTranscurridos } = props.dataRowEditNew;
    let color = '';
    if (!isNotEmpty(DiasTranscurridos)) {
      color = 'rgb(167, 167, 167)';
    }
    else if (DiasTranscurridos >= props.colorRojo) {
      color = 'red';
    }
    else if (DiasTranscurridos <= props.colorVerde) {
      color = 'green';
    } else if (DiasTranscurridos < props.colorRojo && DiasTranscurridos > props.colorVerde) {
      color = '#ffd400';
    }

    return color;
  }

  function retornaColorTexto() {
    const { DiasTranscurridos } = props.dataRowEditNew;
    let color = '';
    if (DiasTranscurridos < props.colorRojo && DiasTranscurridos > props.colorVerde) {
      color = 'black';
    }
    else {
      color = 'white';
    }
    return color;
  }

  const renderDatosVehiculos = () => {
    return (
      <FieldsetAcreditacion title={intl.formatMessage({ id: "ACCREDITATION.DATA.VEHICLE" })}>
        <Form formData={props.dataRowEditNew} validationGroup="FormEdicion">
          <GroupItem itemType="group" colSpan={2} colCount={2}>

            <Item dataField="Placa" label={{ text: intl.formatMessage({ id: "ADMINISTRATION.VEHICLE.PLATE" }) }} />
            <Item dataField="Combustible" label={{ text: intl.formatMessage({ id: "ADMINISTRATION.VEHICLE.FUEL" }) }} editorOptions={{ readOnly: true }} />
            <Item dataField="Marca" label={{ text: intl.formatMessage({ id: "ADMINISTRATION.VEHICLE.BRAND" }) }} editorOptions={{ readOnly: true }} />
            <Item dataField="Modelo" label={{ text: intl.formatMessage({ id: "ADMINISTRATION.VEHICLE.MODEL" }) }} editorOptions={{ readOnly: true }} />
            <Item dataField="Color" label={{ text: intl.formatMessage({ id: "ADMINISTRATION.VEHICLE.COLOR" }) }} editorOptions={{ readOnly: true }} />
            <Item dataField="Potencia" label={{ text: intl.formatMessage({ id: "ADMINISTRATION.VEHICLE.POWER" }) }} editorOptions={{ readOnly: true }} />
            <Item dataField="Anno" label={{ text: intl.formatMessage({ id: "ADMINISTRATION.VEHICLE.YEAR" }) }} editorOptions={{ readOnly: true }} />
            <Item dataField="Serie" label={{ text: intl.formatMessage({ id: "ADMINISTRATION.VEHICLE.SERIE" }) }} editorOptions={{ readOnly: true }} />

          </GroupItem>
        </Form>
      </FieldsetAcreditacion>
    )
  }

  const renderDatosDesmovilizacion = () => {
    return (
      <FieldsetAcreditacion title={intl.formatMessage({ id: "ACCREDITATION.DEMOBILIZATION" })}>
        {/* <EmptyItem /> */}
        <Form formData={props.dataRowEditNew} validationGroup="FormEdicion">
          <GroupItem itemType="group" colSpan={2} colCount={2}>
            <Item
              label={{ text: intl.formatMessage({ id: "ACCREDITATION.DEMOBILIZATION.REASONTERMINATION" }) }}
              dataField="MotivoCese" editorOptions={{ readOnly: true }} />
            <Item
              dataField="FechaCese"
              label={{
                text: intl.formatMessage({ id: "ADMINISTRATION.CESSATION.DATE" }),
              }}
              editorType="dxDateBox"
              dataType="datetime"
              editorOptions={{
                inputAttr: { style: "text-transform: uppercase" },
                displayFormat: "dd/MM/yyyy",
                readOnly: true,
                min: new Date()
              }}
            />
            <Item
              dataField={`Observacion`}
              label={{ text: intl.formatMessage({ id: "COMMON.OBSERVATION" }).toUpperCase() }}
              editorType={"dxTextArea"}
              cssClass={"clsTextExtenso2"}
              colSpan={2}
              editorOptions={{
                maxLength: 500,
                placeholder: intl.formatMessage({ id: "ACCREDITATION.EDIT.OBSERVATION" }),
              }}
            />
          </GroupItem>
        </Form>
      </FieldsetAcreditacion>
    )
  }

  const renderTiemporAcreditacion = () => {
    return (
      <Form formData={props.dataRowEditNew} validationGroup="FormEdicion">
        <GroupItem itemType="group" colSpan={3} colCount={3} >
          <Item colSpan={3}>
            <AppBar
              position="static"
              className={classesEncabezado.secundario}
            >
              <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                <Typography
                  variant="h6"
                  color="inherit"
                  className={classesEncabezado.title}
                >
                  {intl.formatMessage({ id: "ADMINISTRATION.REQUEST.ACCREDITATION.TIME" })}
                </Typography>
              </Toolbar>
            </AppBar>
          </Item>
          <Item
            dataField="FechaSolicitud"
            label={{ text: intl.formatMessage({ id: "ADMINISTRATION.REQUEST.ACCREDITATION.STARTDATE" }) }}
            editorType="dxDateBox"
            dataType="datetime"
            editorOptions={{
              inputAttr: { style: "text-transform: uppercase" },
              displayFormat: "dd/MM/yyyy HH:mm",
              readOnly: true
            }}
          />
          <Item
            dataField="FechaAprobacion"
            label={{ text: intl.formatMessage({ id: "ADMINISTRATION.REQUEST.ACCREDITATION.APPROVAL.DATE" }) }}
            editorType="dxDateBox"
            dataType="datetime"
            editorOptions={{
              inputAttr: { style: "text-transform: uppercase" },
              displayFormat: "dd/MM/yyyy HH:mm",
              readOnly: true
            }}
          />
          <Item
            dataField="FechaProcesado"
            label={{ text: intl.formatMessage({ id: "ADMINISTRATION.REQUEST.ACCREDITATION.DATE.PROCESS" }) }}
            editorType="dxDateBox"
            dataType="datetime"
            editorOptions={{
              inputAttr: { style: "text-transform: uppercase" },
              displayFormat: "dd/MM/yyyy HH:mm",
              readOnly: true
            }}
          />
          <Item
            dataField="TiempoAcreditacion"
            label={{ text: intl.formatMessage({ id: "ACCREDITATION.TIME" }) }}
            editorOptions={{
              readOnly: true,
              inputAttr: { 'style': 'background-color: ' + retornaColor() + ' ;color: ' + retornaColorTexto() + '' }
            }}
          />
          <Item />
        </GroupItem>
      </Form>
    )
  }

  return (
    <Fragment>
      <div className="row" style={{ width: "100%" }}>
        <div className="col-12">
          <PortletHeader
            classNameHead={"title-estado-general-row"}
            title={paintTitle()}
            toolbar={
              <PortletHeaderToolbar>
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
          <PortletBody>
            {renderDatosVehiculos()}
            {renderDatosDesmovilizacion()}
            {renderTiemporAcreditacion()}
          </PortletBody>
        </div>
      </div>
    </Fragment>
  );
};

export default injectIntl(WithLoandingPanel(withRouter(DetalleEditPage)));
