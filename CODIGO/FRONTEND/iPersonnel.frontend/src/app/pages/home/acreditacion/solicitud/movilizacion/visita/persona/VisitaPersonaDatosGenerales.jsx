import React, { Fragment, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";
import { WithLoandingPanel } from "../../../../../../../partials/content/withLoandingPanel";
import { Popup } from "devextreme-react/popup";
import PropTypes from "prop-types";
import Form, {
  Item,
  GroupItem,
  PatternRule,
  RequiredRule,
  EmailRule,
  StringLengthRule,
  EmptyItem
} from "devextreme-react/form";
import { AppBar, Toolbar, Typography } from "@material-ui/core";

import {
  listarEstado,
  listarEstadoSimple,
  PatterRuler,
  isNotEmpty,
  dateFormat
} from "../../../../../../../../_metronic";

//import * '../../../../../../_metronic';
import { obtenerTodos as obtenerTodosLicencias } from "../../../../../../../api/sistema/licenciaConducir.api";

import ImageViewer from "../../../../../../../partials/content/ImageViewer/ImageViewer";
import CustomTabNav from "../../../../../../../partials/content/Acreditacion/CustomTabNav/CustomTabNav";

import {
  createItem,
  createItemAutorizador
} from "../../../../../../../partials/content/Acreditacion/DynamicColumns";

import {
  PortletBody,
  PortletHeader,
  PortletHeaderToolbar
} from "../../../../../../../partials/content/Portlet";
import { Button } from "devextreme-react";

import {
  handleErrorMessages,
  handleSuccessMessages
} from "../../../../../../../store/ducks/notify-messages";

import {
  obtener as obtenerDetalle,
  downloadFile as downloadFileDetalle,
  actualizarrequisitos
} from "../../../../../../../api/acreditacion/visitaPersonaDetalle.api";
import FieldsetAcreditacion from '../../../../../../../partials/content/Acreditacion/FieldsetAcreditacion/FieldsetAcreditacion';

const VisitaPersonaDatosGenerales = ({ intl, colSpan = 2, dataRowEditNew, colorRojo, colorVerde }) => {


  return (
    <Fragment>
      <FieldsetAcreditacion title={intl.formatMessage({ id: "ACCREDITATION.PEOPLE.GENERALDATA" })}>
        <Form formData={dataRowEditNew} validationGroup="FormEdicion">
          <GroupItem itemType="group" colCount={colSpan} colSpan={colSpan}>
            <Item
              label={{
                text: intl.formatMessage({
                  id: "ADMINISTRATION.VISIT.CLIENTECOMPANY"
                })
              }}
              dataField="CompaniaMandante"
              editorOptions={{ readOnly: true }}
            />
            <Item
              label={{
                text: intl.formatMessage({
                  id: "ADMINISTRATION.VISIT.RESPONSIBLEFORVISIT"
                })
              }}
              dataField="NombreCompleto"
              editorOptions={{ readOnly: true }}
            />
            <Item
              dataField="Division"
              label={{
                text: intl.formatMessage({
                  id: "ACCREDITATION.PEOPLE.EDIT.PLACE"
                })
              }}
              editorOptions={{ readOnly: true }}
            />
            <Item
              label={{
                text: intl.formatMessage({
                  id: "ACCREDITATION.PEOPLE.EDIT.PROFILE"
                })
              }}
              dataField="Perfil"
              editorOptions={{ readOnly: true }}
            />
            <Item
              label={{
                text: intl.formatMessage({
                  id: "ACCREDITATION.PEOPLE.EDIT.UO"
                })
              }}
              dataField="UnidadOrganizativa"
              editorOptions={{ readOnly: true }}
            />
            <Item
              label={{
                text: intl.formatMessage({
                  id: "ACCREDITATION.PEOPLE.EDIT.COSTCENTER"
                })
              }}
              dataField="CentroCosto"
              editorOptions={{ readOnly: true }}
            />

            <Item
              dataField="FechaInicio"
              label={{
                text: intl.formatMessage({
                  id: "ACCESS.PERSON.MARK.STARTDATE"
                })
              }}
              // disabled={!props.dataRowEditNew.esNuevoRegistro}
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
                text: intl.formatMessage({
                  id: "ACCESS.PERSON.MARK.ENDDATE"
                })
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
    </Fragment>
  );
};

export default VisitaPersonaDatosGenerales;
