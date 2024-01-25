import React, { useEffect, useState } from "react";
//import { useSelector } from "react-redux";
import Form, { Item, GroupItem, SimpleItem, PatternRule } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar, Portlet } from "../../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../../store/config/Styles";
import { injectIntl } from "react-intl";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import { listarEstadoSimple } from "../../../../../../_metronic/utils/utils";
import { isRequired, isModified } from "../../../../../../_metronic/utils/securityUtils";

const PerfilDivisionRequisitoEditPage = props => {
  const { intl, setLoading, modoEdicion, settingDataField } = props;
  const classesEncabezado = useStylesEncabezado();

  useEffect(() => {
    //cargarCombos();
  }, []);


  function grabar(e) {

    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregar(props.dataRowEditNew);
      } else {
        props.actualizar(props.dataRowEditNew);
      }
    }
  }


  /******************************************************************* */

  return (
    <>
      <PortletBody >
        <Button
          id="idButtonGrabar"
          icon="fa fa-save"
          type="default"
          hint={intl.formatMessage({ id: "ACTION.RECORD" })}
          onClick={grabar}
          useSubmitBehavior={true}
          validationGroup="FormEdicion"
          style={{ display: 'none' }} >
        </Button>

        <React.Fragment>
          <Form formData={props.dataRowEditNew} validationGroup="FormEdicion" >
            <GroupItem itemType="group" colCount={2} colSpan={2}>
              <Item colSpan={2}>
                <AppBar position="static" className={classesEncabezado.secundario}>
                  <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                    <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                      {intl.formatMessage({ id: "COMMON.DETAIL" }) + " - " + intl.formatMessage({ id: "ACCREDITATION.REQUIREMENT" })}
                    </Typography>
                  </Toolbar>
                </AppBar>
              </Item>

              <SimpleItem dataField="IdCliente" visible={false}></SimpleItem>
              <SimpleItem dataField="IdPerfil" visible={false}></SimpleItem>
              <SimpleItem dataField="IdDivision" visible={false}></SimpleItem>
              <SimpleItem dataField="IdRequisito" visible={false}></SimpleItem>
              <Item colSpan={1} dataField="Division"
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.DIVISION.NAME" }) }}
                editorOptions={{ readOnly: true, }} />

              <Item
                colSpan={1} dataField="Requisito" isRequired={true} label={{ text: intl.formatMessage({ id: "ACCREDITATION.REQUIREMENT" }), }}
                editorOptions={{
                  readOnly: true,
                  hoverStateEnabled: false,
                  inputAttr: { style: "text-transform: uppercase" },
                  //   showClearButton: true,
                  //   buttons: [
                  //     {
                  //       name: "search",
                  //       location: "after",
                  //       useSubmitBehavior: true,
                  //       options: {
                  //         stylingMode: "text",
                  //         icon: "search",
                  //         disabled: !props.dataRowEditNew.esNuevoRegistro,
                  //         onClick: (evt) => {
                  //           setisVisiblePopUpRequisitos(true);
                  //         },
                  //       },
                  //     },
                  //   ],
                }}
              />

              <Item
                dataField="Orden"
                label={{ text: intl.formatMessage({ id: "ACCREDITATION.REQUIREMENT.ORDER" }) }}
                isRequired={modoEdicion ? isRequired("Orden", settingDataField) : false}
                editorType="dxNumberBox"
                dataType="number"
                editorOptions={{
                  readOnly: !(modoEdicion ? isModified("Orden", settingDataField) : false),
                  inputAttr: { style: "text-transform: uppercase; text-align: right" },
                  showSpinButtons: true,
                  showClearButton: true,
                  min: 0
                }}
              >
                <PatternRule
                  pattern={/[0-9]/} message={intl.formatMessage({ id: "COMMON.ENTER.NUMERIC.DATA" })}
                />
              </Item>

              <Item
                dataField="Activo"
                label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
                editorType="dxSelectBox"
                isRequired={props.modoEdicion}
                editorOptions={{
                  items: listarEstadoSimple(),
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                  readOnly: props.dataRowEditNew.esNuevoRegistro ? true : !props.modoEdicion,
                }}
              />
            </GroupItem>
          </Form>



        </React.Fragment>
      </PortletBody>
    </>
  );

};

export default injectIntl(WithLoandingPanel(PerfilDivisionRequisitoEditPage));

