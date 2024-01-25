import React, { useEffect, useState, Fragment } from "react";
import { injectIntl } from "react-intl";
import { useSelector } from "react-redux";

import { Button } from "devextreme-react";
import Form, { 
  Item,
  GroupItem,
  RequiredRule,
  StringLengthRule,
  PatternRule
  } from "devextreme-react/form";
import { DataGrid, Column, Paging, Pager, Button as ColumnButton, } from "devextreme-react/data-grid";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";

import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";

import { useStylesEncabezado } from "../../../../store/config/Styles";
import { handleErrorMessages, handleInfoMessages } from "../../../../store/ducks/notify-messages";
import HeaderInformation from "../../../../partials/components/HeaderInformation";

import { dateFormat, isNotEmpty, listarEstadoSimple, PatterRuler } from "../../../../../_metronic";
import { isRequired, isModified } from "../../../../../_metronic/utils/securityUtils";

import AdministracionPersonaBuscar from "../../../../partials/components/AdministracionPersonaBuscar";
import { servicePersona } from "../../../../api/administracion/persona.api";


const CamaExclusivaByCamaEditPage = (props) => {
  const { intl, modoEdicion, settingDataField, setLoading } = props;
  const [estadoSimple, setEstadoSimple] = useState([]);
  const classesEncabezado = useStylesEncabezado();
  const [isVisiblePopUpPersonas, setisVisiblePopUpPersonas] = useState(false);

  async function cargarCombos() {
    let estadoSimple = listarEstadoSimple();
    setEstadoSimple(estadoSimple);
  }

  function grabar(e) {
    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregarCamaExclusiva(props.dataRowEditNew);
      } else {
        props.actualizarCamaExclusiva(props.dataRowEditNew);
      }
    }
  }

  const isRequiredRule = (id) => {
    return modoEdicion ? false : isRequired(id, settingDataField);
  }
  

  useEffect(() => {
    cargarCombos();
  }, []);

  /**************************************************************************************************** */

  const agregarPersonaCamaExclusiva = async (personas) => {

    let {  IdPersona, NombreCompleto, }  = personas[0];
    props.setDataRowEditNew({ ...props.dataRowEditNew, IdPersona, NombreCompleto });

     await servicePersona.obtenerPeriodo({
       IdPersona: IdPersona,
       FechaInicio: dateFormat(new Date(), 'yyyyMMdd'),
       FechaFin: dateFormat(new Date(), 'yyyyMMdd')
    }).then(response => {
      // console.log("obtenerPeriodo|response:",response);
        if(response){
          if(!isNotEmpty(response.MensajeValidacion)){
            props.setDisabledSave(false);
            props.setFechasContrato({FechaInicioContrato: response.FechaInicio,FechaFinContrato: response.FechaFin});
          }else
          {
            props.setFechasContrato({FechaInicioContrato: null,FechaFinContrato: null});
            props.setDisabledSave(true);
            handleInfoMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), response.MensajeValidacion);
          }
        }
    })

  }

  /**************************************************************************************************** */

  return (
    <Fragment>
      <HeaderInformation data={props.getInfo()} visible={true} labelLocation={'left'} colCount={4}
        toolbar={
          <PortletHeader
            title={""}
            toolbar={
              <PortletHeaderToolbar>
                <Button
                  icon="fa fa-save"
                  type="default"
                  //text="Grabar"
                  hint={intl.formatMessage({ id: "ACTION.RECORD" })}
                  useSubmitBehavior={true}
                  validationGroup="FormEdicion"
                  onClick={grabar}
                  disabled={props.disabledSave}
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
        } /> 


      <PortletBody >
        <React.Fragment>
          <Form formData={props.dataRowEditNew} validationGroup="FormEdicion" >
            <GroupItem itemType="group" colCount={2} colSpan={2}>
              <Item colSpan={2}>
                <AppBar position="static" className={classesEncabezado.secundario}>
                  <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                    <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                      {intl.formatMessage({ id: "CAMP.EXCLUSIVE.ADD" })}
                    </Typography>
                  </Toolbar>
                </AppBar>
              </Item>

          <GroupItem itemType="group" colCount={2} colSpan={2}>
              <Item dataField="NombreCompleto"
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.FULLNAME" }) }}
                isRequired={true}
                editorOptions={{
                  readOnly: true,
                  maxLength: 20,
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  disabled: !props.dataRowEditNew.esNuevoRegistro ? true : false,
                  showClearButton: true,
                  buttons: [
                    {
                      name: "search",
                      location: "after",
                      useSubmitBehavior: true,
                      options: {
                        stylingMode: "text",
                        icon: "search",
                        disabled: props.dataRowEditNew.esNuevoRegistro ? false : !props.modoEdicion,
                        onClick: () => {
                          setisVisiblePopUpPersonas(true);
                        },
                      },
                    },
                  ],
                }}
              />

            </GroupItem>

              <Item
                dataField="FechaInicio"
                label={{ text: intl.formatMessage({ id: "CASINO.PERSON.GROUP.STARTDATE" }) }}
                editorType="dxDateBox"
                dataType="date"
                isRequired={modoEdicion ? true : false}
                editorOptions={{
                  displayFormat: "dd/MM/yyyy",
                  readOnly: !(modoEdicion ? true : false),
                  min:props.fechasContrato.FechaInicioContrato,
                  max:props.fechasContrato.FechaFinContrato,
                  disabled: isNotEmpty(props.dataRowEditNew.NombreCompleto) ? false : true
                }}
              />
              <Item
                dataField="FechaFin"
                label={{ text: intl.formatMessage({ id: "CASINO.PERSON.GROUP.ENDDATE" }) }}
                editorType="dxDateBox"
                isRequired={modoEdicion ? true : false}
                dataType="date"
                editorOptions={{
                  displayFormat: "dd/MM/yyyy",
                  readOnly: !(modoEdicion ? true : false),
                  min:props.fechasContrato.FechaInicioContrato,
                  max:props.fechasContrato.FechaFinContrato,
                  disabled: isNotEmpty(props.dataRowEditNew.NombreCompleto) ? false : true
                }}
              />

              <Item />

              <Item
                alignment={"right"}
                dataField="Activo"
                label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
                editorType="dxSelectBox"
                isRequired={modoEdicion}
                editorOptions={{
                  items: estadoSimple,
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                  readOnly: !(modoEdicion ? (props.dataRowEditNew.esNuevoRegistro ? false : true) : false),
                }}
              />

            </GroupItem>
          </Form>

          {/* POPUP-> buscar persona */}
          <AdministracionPersonaBuscar
            showPopup={{ isVisiblePopUp: isVisiblePopUpPersonas, setisVisiblePopUp: setisVisiblePopUpPersonas }}
            cancelar={() => setisVisiblePopUpPersonas(false)}
            agregar={agregarPersonaCamaExclusiva}
            selectionMode={"row"}
            uniqueId={"personasBuscarCamaExclusivaIndexPage"}
          />


        </React.Fragment>
      </PortletBody>

    </Fragment>
  );
};

export default injectIntl(WithLoandingPanel(CamaExclusivaByCamaEditPage));
