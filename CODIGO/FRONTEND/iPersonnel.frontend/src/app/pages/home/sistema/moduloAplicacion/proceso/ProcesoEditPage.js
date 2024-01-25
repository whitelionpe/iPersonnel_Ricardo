import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import Form, { Item, GroupItem, RequiredRule, StringLengthRule, PatternRule } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import { AppBar, Toolbar, Typography } from "@material-ui/core";
import { useStylesEncabezado } from "../../../../../store/config/Styles";
import { useSelector } from "react-redux";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import { isRequired } from "../../../../../../_metronic/utils/securityUtils";

import { listarEstadoSimple, listarTipoEjecucion } from "../../../../../../_metronic";
import { obtenerTodos as obtenerTP } from "../../../../../api/sistema/tipoProceso.api";
import { obtenerTodos as obtenerPlantillas } from "../../../../../api/sistema/plantillaCorreo.api";
import FieldsetAcreditacion from '../../../../../partials/content/Acreditacion/FieldsetAcreditacion/FieldsetAcreditacion';

const ProcesoEditPage = props => {
  const { intl, accessButton, modoEdicion, settingDataField, setLoading, setDataRowEditNew } = props;

  const classesEncabezado = useStylesEncabezado();
  const [cboTipoProceso, setCboTipoProceso] = useState([]);
  const [cboPlantilla, setCboPlantilla] = useState([]);
  const { IdCliente, IdDivision } = useSelector(state => state.perfil.perfilActual);


  async function cargarCombos() {
    let cboTipoProceso = await obtenerTP({ IdTipoProceso: '%' });
    setCboTipoProceso(cboTipoProceso);

    let cboPlantilla = await obtenerPlantillas({ IdPlantilla: '%' });
    setCboPlantilla(cboPlantilla);
  }


  function grabar(e) {
    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregarRegistro(props.dataRowEditNew);
      } else {
        props.actualizarRegistro(props.dataRowEditNew);
      }
    }
  }

  const isRequiredRule = (id) => {
    return modoEdicion ? false : isRequired(id, settingDataField);
  }

  useEffect(() => {
    cargarCombos();
  }, []);


  return (
    <>
      <PortletHeader
        title={props.titulo}
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

                <Item dataField="IdProceso" visible={false} />

                <Item
                  dataField="IdTipoProceso"
                  label={{ text: intl.formatMessage({ id: "SYSTEM.PROCESS.TYPE" }) }}
                  editorType="dxSelectBox"
                  isRequired={modoEdicion}
                  // isRequired={modoEdicion ? isRequired('TipoAplicacion', settingDataField) : false}
                  editorOptions={{
                    items: cboTipoProceso,
                    valueExpr: "IdTipoProceso",
                    displayExpr: "TipoProceso",
                    readOnly: !props.dataRowEditNew.esNuevoRegistro ? true : false,
                    //readOnly: !(modoEdicion ? isModified('Aplicacion', settingDataField) : false),
                    onValueChanged: (e) => {
                      if (props.dataRowEditNew.esNuevoRegistro) setDataRowEditNew({ ...props.dataRowEditNew, IdTipoProceso: e.value })
                    }
                  }}
                />

                <Item
                  dataField="TipoEjecucion"
                  label={{ text: intl.formatMessage({ id: "SYSTEM.PROCESS.EXECUTION_TYPE" }) }}
                  editorType="dxSelectBox"
                  isRequired={modoEdicion}
                  editorOptions={{
                    items: listarTipoEjecucion(),
                    valueExpr: "Valor",
                    displayExpr: "Descripcion"
                  }}
                />


                <Item dataField="Proceso"
                  label={{ text: intl.formatMessage({ id: "SYSTEM.PROCESS" }) }}
                  isRequired={modoEdicion}
                  //isRequired={modoEdicion ? isRequired('Proceso', settingDataField) : false}
                  colSpan={2}
                  editorOptions={{
                    maxLength: 100,
                    inputAttr: { 'style': 'text-transform: uppercase' }
                  }}
                />


                <Item dataField="Descripcion"
                  label={{ text: intl.formatMessage({ id: "COMMON.DESCRIPTION" }) }}
                  isRequired={modoEdicion ? isRequired('Descripcion', settingDataField) : false}
                  editorType="dxTextArea"
                  colSpan={2}
                  editorOptions={{
                    //readOnly: !(modoEdicion ? isModified('Descripcion', settingDataField) : false),
                    maxLength: 200,
                    height: 100,
                    inputAttr: { 'style': 'text-transform: uppercase' }
                  }}
                >
                  {(isRequiredRule("Descripcion")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={500} />}
                </Item>

                <Item dataField="NombreProcedimiento"
                  label={{ text: intl.formatMessage({ id: "SYSTEM.DIVISIONMODULERULE.PROCEDURE" }) }}
                  isRequired={modoEdicion ? isRequired('NombreProcedimiento', settingDataField) : false}
                  colSpan={2}
                  editorOptions={{
                    inputAttr: { 'style': 'text-transform: uppercase' }
                  }}
                >
                  {(isRequiredRule("NombreProcedimiento")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={500} />}
                </Item>
              </GroupItem>

              {props.dataRowEditNew.IdTipoProceso === 'NOTIF' && (
                <GroupItem itemType="group" colCount={2} colSpan={2}>
                  <Item colSpan={2}>
                    <AppBar position="static" className={classesEncabezado.secundario}>
                      <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                        <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                          {intl.formatMessage({ id: "SYSTEM.PROCESS.NOTIFICATION_DATA" })}
                        </Typography>
                      </Toolbar>
                    </AppBar>
                  </Item>
                  <Item
                    dataField="IdPlantilla"
                    label={{ text: intl.formatMessage({ id: "SYSTEM.PROCESS.TEMPLATE" }) }}
                    editorType="dxSelectBox"
                    isRequired={modoEdicion}
                    editorOptions={{
                      items: cboPlantilla,
                      valueExpr: "IdPlantilla",
                      displayExpr: "Plantilla"
                    }}
                  />
                  <Item dataField="Asunto"
                    label={{ text: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.SUBJECT" }) }}
                    isRequired={modoEdicion}
                    //isRequired={modoEdicion ? isRequired('Proceso', settingDataField) : false}
                    colSpan={2}
                    editorOptions={{
                      maxLength: 200,
                      inputAttr: { 'style': 'text-transform: uppercase' }
                    }}
                  />
                  <Item dataField="Destinatario"
                    label={{ text: intl.formatMessage({ id: "SYSTEM.PROCESS.RECEIVER" }) }}
                    isRequired={modoEdicion}
                    editorOptions={{
                      maxLength: 200
                    }}
                  />
                  <Item dataField="CopiaOculta"
                    label={{ text: intl.formatMessage({ id: "SYSTEM.PROCESS.CCO" }) }}
                    isRequired={modoEdicion}
                    //isRequired={modoEdicion ? isRequired('Proceso', settingDataField) : false}
                    editorOptions={{
                      maxLength: 50
                    }}
                  />
                  <Item dataField="Mensaje1"
                    label={{ text: intl.formatMessage({ id: "ASSISTANCE.JUSTIFICATION.MASSIVE.MESSAGE" }) + ' 1' }}
                    isRequired={modoEdicion}
                    editorType="dxTextArea"
                    editorOptions={{
                      //readOnly: !(modoEdicion ? isModified('Descripcion', settingDataField) : false),
                      maxLength: 500,
                      height: 100,
                      inputAttr: { 'style': 'text-transform: uppercase' }
                    }}
                  >
                    <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} />
                    <StringLengthRule max={500} />
                  </Item>

                  <Item dataField="Mensaje2"
                    label={{ text: intl.formatMessage({ id: "ASSISTANCE.JUSTIFICATION.MASSIVE.MESSAGE" }) + ' 2' }}
                    isRequired={modoEdicion}
                    editorType="dxTextArea"
                    editorOptions={{
                      maxLength: 500,
                      height: 100,
                      inputAttr: { 'style': 'text-transform: uppercase' }
                    }}
                  >
                    <StringLengthRule max={500} />
                  </Item>

                  <Item
                    dataField="AdjuntarArchivo"
                    colSpan={2}
                    label={{
                      text: "Check",
                      visible: false
                    }}
                    editorType="dxCheckBox"
                    editorOptions={{
                      text: intl.formatMessage({ id: "ACCREDITATION.DATAEVALUATE.ATTACHFILE" }),
                      width: "100%"
                    }}
                  />
                  <Item
                    dataField="MostrarInforme"
                    label={{
                      text: "Check",
                      visible: false
                    }}
                    editorType="dxCheckBox"
                    editorOptions={{
                      text: intl.formatMessage({ id: "SYSTEM.PROCESS.SHOW_REPORT" }),
                      width: "100%"
                    }}
                  />
                </GroupItem>
              )}
              <GroupItem itemType="group" colCount={2} colSpan={2}>
                <Item
                  dataField="Activo"
                  label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
                  editorType="dxSelectBox"
                  colSpan={1}
                  isRequired={modoEdicion}
                  editorOptions={{
                    items: listarEstadoSimple(),
                    valueExpr: "Valor",
                    displayExpr: "Descripcion",
                    readOnly: !(modoEdicion ? (props.dataRowEditNew.esNuevoRegistro ? false : true) : false)
                  }}
                />
              </GroupItem>
            </Form>
          
        </React.Fragment>
      </PortletBody>

    </>
  );
};

export default injectIntl(WithLoandingPanel(ProcesoEditPage));
