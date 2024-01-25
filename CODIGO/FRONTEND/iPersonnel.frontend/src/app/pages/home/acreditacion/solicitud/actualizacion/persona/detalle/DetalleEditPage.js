import React, { Fragment, useState } from 'react';
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";
import Form, {
  Item,
  GroupItem
} from "devextreme-react/form";
import { Button } from "devextreme-react";
import { withRouter } from 'react-router-dom';
import { AppBar, Toolbar, Typography } from "@material-ui/core";

import { WithLoandingPanel } from "../../../../../../../partials/content/withLoandingPanel";
import { useStylesEncabezado } from "../../../../../../../store/config/Styles";
import CustomTabNav from '../../../../../../../partials/components/Tabs/CustomTabNav';
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../../../partials/content/Portlet";
import FieldsetAcreditacion from '../../../../../../../partials/content/Acreditacion/FieldsetAcreditacion/FieldsetAcreditacion';
import { listarEstado, listarEstadoSimple, PatterRuler, isNotEmpty, dateFormat } from "../../../../../../../../_metronic";

const DetalleEditPage = (props) => {
  const classesEncabezado = useStylesEncabezado();
  const { intl, modoEdicion, eventViewPdf } = props;

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

  const renderDatosTrabajador = () => {
    return (
      <FieldsetAcreditacion title={intl.formatMessage({ id: "ACREDITATION.DATA" })}>
        <Form formData={props.dataRowEditNew} validationGroup="FormEdicion">
          <GroupItem itemType="group" colCount={2} colSpan={2}>
            <Item dataField="TipoDocumento"
              label={{ text: intl.formatMessage({ id: "ADMINISTRATION.COMPANY.DOCUMENTTYPE" }) }}
              editorOptions={{ inputAttr: { style: "text-transform: uppercase" }, readOnly: true, }}
            />
            <Item dataField="Documento"
              label={{ text: intl.formatMessage({ id: "ADMINISTRATION.COMPANY.DOCUMENT" }) }}
              editorOptions={{ inputAttr: { style: "text-transform: uppercase" }, readOnly: true, }} />
            <Item dataField="NombreCompleto"
              label={{ text: intl.formatMessage({ id: "ACCREDITATION.LIST.SURNAMESNAMES" }) }}
              editorOptions={{ inputAttr: { style: "text-transform: uppercase" }, readOnly: true, }}
            />
          </GroupItem>
        </Form>
      </FieldsetAcreditacion>
    )
  }

  const renderDatosRenovar = () => {
    return (
      <FieldsetAcreditacion title={intl.formatMessage({ id: "ACREDITATION.RENEW.DATA" })}>
        <Form formData={props.dataRowEditNew} validationGroup="FormEdicion">
          <GroupItem itemType="group" colCount={2} colSpan={2}>

            <Item label={{ text: intl.formatMessage({ id: "ACCESS.REQUIREMENT" }) }} dataField="Requisito" editorOptions={{ readOnly: true }} />
            <Item label={{ text: intl.formatMessage({ id: "ACCREDITATION.DATAEVALUATE.MAINTENANCE" }) }} dataField="DatoEvaluar" editorOptions={{ readOnly: true }} />
            <Item
              dataField="FechaSolicitud"
              label={{
                text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.REGISTRATIONDATE" }),
              }}
              editorType="dxDateBox"
              dataType="datetime"
              editorOptions={{
                inputAttr: { style: "text-transform: uppercase" },
                displayFormat: "dd/MM/yyyy",
                readOnly: true
              }}
            />
            <Item
              dataField="FechaFinNuevo"
              label={{
                text: intl.formatMessage({ id: "ACREDITATION.NEW.DATE" }),
              }}
              editorType="dxDateBox"
              dataType="datetime"
              editorOptions={{
                inputAttr: { style: "text-transform: uppercase" },
                displayFormat: "dd/MM/yyyy",
                readOnly: true
              }}
            />
            <Item label={{ text: intl.formatMessage({ id: "COMMON.OBSERVATION" }) }} dataField="Comentarios" editorOptions={{ readOnly: true }} />
            <Item label={{ text: intl.formatMessage({ id: "SYSTEM.MODULERULE.COMMENTARY" }) }} dataField="InformacionAdicional" editorOptions={{ readOnly: true }} />

          </GroupItem>
        </Form>
      </FieldsetAcreditacion>
    )
  }

  const renderDatosContrato = () => {
    return (
      <>
        <FieldsetAcreditacion title={intl.formatMessage({ id: "ACREDITATION.CONTRACT.DATA" })}>
          <Form formData={props.dataRowEditNew} validationGroup="FormEdicion">
            <GroupItem itemType="group" colCount={2} colSpan={2}>
              <Item label={{ text: intl.formatMessage({ id: "ACCREDITATION.PEOPLE.EDIT.CONTRACT" }) }} dataField="IdContrato" editorOptions={{ readOnly: true }} />
              <Item label={{ text: intl.formatMessage({ id: "ACCREDITATION.PEOPLE.EDIT.AFFAIR" }) }} dataField="Asunto" editorOptions={{ readOnly: true }} />
              <Item label={{ text: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CLIENTCOMPANY.ABR" }) }} dataField="CompaniaMandante" editorOptions={{ readOnly: true }} />
              <Item label={{ text: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CONTRACTORCOMPANY.ABR" }) }} dataField="CompaniaContratista" editorOptions={{ readOnly: true }} />
              <Item
                dataField="FechaInicio"
                label={{
                  text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.STARTDATE" }),
                }}
                editorType="dxDateBox"
                dataType="datetime"
                editorOptions={{
                  inputAttr: { style: "text-transform: uppercase" },
                  displayFormat: "dd/MM/yyyy",
                  readOnly: true
                }}
              />
              <Item
                dataField="FechaFin"
                label={{
                  text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.ENDDATE" }),
                }}
                editorType="dxDateBox"
                dataType="datetime"
                editorOptions={{
                  inputAttr: { style: "text-transform: uppercase" },
                  displayFormat: "dd/MM/yyyy",
                  readOnly: true
                }}
              />
            </GroupItem>
          </Form>
        </FieldsetAcreditacion>
      </>
    );
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
          <Item />
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

  return (
    <Fragment>
      <div className="row" style={{ width: "100%" }}>
        <div className="col-12">

          <PortletHeader
            classNameHead={"title-estado-general-row"}
            title={paintTitle()}
            toolbar={
              <PortletHeaderToolbar>
                <PortletHeaderToolbar>
                  <Button
                    icon="pdffile"
                    type="default"
                    hint={intl.formatMessage({ id: "ACREDITATION.PDF.VIEW" })}
                    id={`gb_BotonDescarga`}
                    onClick={() => { eventViewPdf(props.dataRowEditNew) }}
                  />
                  &nbsp;
                  <Button
                    icon="fa fa-times-circle"
                    type="normal"
                    hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
                    onClick={props.cancelarEdicion}
                  />
                </PortletHeaderToolbar>
              </PortletHeaderToolbar>
            }
          />

          <PortletBody>
            {renderDatosTrabajador()}
            {renderDatosRenovar()}
            {renderDatosContrato()}
            {renderTiemporAcreditacion()}
          </PortletBody>

        </div>
      </div>
    </Fragment>
  );
};

export default injectIntl(WithLoandingPanel(withRouter(DetalleEditPage)));
