import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";
import HeaderInformation from "../../../../partials/components/HeaderInformation";
import { listarEstadoSimple, listarEstado } from "../../../../../_metronic";
import { ObtenerTodosClientePadre as obtenerTodosDivision } from "../../../../api/sistema/division.api";
import { useSelector } from "react-redux";
import { handleInfoMessages } from "../../../../store/ducks/notify-messages";
import Form, {
  Item,
  GroupItem,
  RequiredRule,
  StringLengthRule,
  PatternRule
} from "devextreme-react/form";
import { isRequired, isModified } from "../../../../../_metronic/utils/securityUtils";

import {
  Validator
} from 'devextreme-react/validator';

const CuponeraEditPage = props => {
  const { intl, modoEdicion, settingDataField, accessButton } = props;
  const { IdCliente } = useSelector(state => state.perfil.perfilActual);
  const classesEncabezado = useStylesEncabezado();
  const [cmbDivisiones, setCmbDivisiones] = useState([]);

  console.log("CuponeraEditPage|props:",props);

  async function cargarCombos() {
 
    if (IdCliente) {
      let divisiones = await obtenerTodosDivision({ IdCliente: IdCliente });
      setCmbDivisiones(divisiones);
    }

  }

  function onValueChangeHorasCupon(e) {
    console.log("onValueChangeHorasCupon|e:",e);
    if(e.value > props.maxHorasCupon){

    }
  }


  function grabar(e) {
    let result = e.validationGroup.validate();
 
    if ( parseInt(props.dataRowEditNew.MesesParaGanarCupon) > parseInt(props.dataRowEditNew.Periodo) ) {
      handleInfoMessages(intl.formatMessage({ id: "MESSAGES.INFO" }),intl.formatMessage({ id: "ASSISTANCE.COUPON.INFO" }));
      return;
    }

    if (result.isValid) {
      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregarCuponera(props.dataRowEditNew);
      } else {
        props.actualizarCuponera(props.dataRowEditNew);
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
                  readOnly: (modoEdicion ? (props.dataRowEditNew.esNuevoRegistro ? false : true) : false)
                }}
              />
              <Item />


              <Item
                dataField="Periodo"
                label={{
                  text: intl.formatMessage({
                    id: "ASSISTANCE.COUPON.PERIOT",
                  }),
                }}
                isRequired={modoEdicion ? isRequired("Periodo", settingDataField) : false }
                editorType="dxNumberBox"
                dataType="number"
                editorOptions={{ 
                  readOnly: !(modoEdicion? isModified("Periodo", settingDataField) : false),
                  inputAttr: { style: "text-transform: uppercase; text-align: right",},
                  showSpinButtons: true,
                  showClearButton: true,
                  min:0
                }}
              >
                <PatternRule
                  pattern={/[0-9]/}
                  message={intl.formatMessage({
                    id: "COMMON.ENTER.NUMERIC.DATA",
                  })}
                />
              </Item>

              <Item
                dataField="MesesParaGanarCupon"
                label={{
                  text: intl.formatMessage({
                    id: "ASSISTANCE.COUPON.MONTHTOEARN",
                  }),
                }}
                isRequired={modoEdicion ? isRequired("MesesParaGanarCupon", settingDataField) : false }
                editorType="dxNumberBox"
                dataType="number"
                editorOptions={{
                  readOnly: !(modoEdicion? isModified("MesesParaGanarCupon", settingDataField) : false),
                  inputAttr: { style: "text-transform: uppercase; text-align: right",},
                  showSpinButtons: true,
                  showClearButton: true,
                  min:0
                }}
              >
                <PatternRule
                  pattern={/[0-9]/}
                  message={intl.formatMessage({
                    id: "COMMON.ENTER.NUMERIC.DATA",
                  })}
                />
              </Item>

              <Item
                dataField="Cupones"
                label={{
                  text: intl.formatMessage({
                    id: "ASSISTANCE.COUPON.COUPONS",
                  }),
                }}
                isRequired={modoEdicion ? isRequired("Cupones", settingDataField) : false }
                editorType="dxNumberBox"
                dataType="number"
                editorOptions={{
                  readOnly: !(modoEdicion? isModified("Cupones", settingDataField) : false),
                  inputAttr: { style: "text-transform: uppercase; text-align: right",},
                  showSpinButtons: true,
                  showClearButton: true,
                  min:0
                }}
              >
                <PatternRule
                  pattern={/[0-9]/}
                  message={intl.formatMessage({
                    id: "COMMON.ENTER.NUMERIC.DATA",
                  })}
                />
              </Item>

              <Item
                dataField="HorasCupon"
                label={{
                  text: intl.formatMessage({
                    id: "ASSISTANCE.COUPON.HOURS",
                  }),
                }}
                 isRequired={modoEdicion ? isRequired("HorasCupon", settingDataField) : false }
                editorType="dxNumberBox"
                dataType="fixedPoint"
                helpText={"El número máximo a ingresar es " + (props.maxHorasCupon).toString()  }
                editorOptions={{
                  readOnly: !(modoEdicion? isModified("HorasCupon", settingDataField) : false),
                  inputAttr: { style: "text-transform: uppercase; text-align: right",},
                  showSpinButtons: true,
                  showClearButton: true,
                  format: "#,##0.00",
                  min:0, 
                  max: props.maxHorasCupon,
                  // onValueChange:(e) => onValueChangeHorasCupon(e),
                }}
              
              >


                <PatternRule
                  visible={true}
                  pattern={/[0-9]/}
                  message={intl.formatMessage({
                    id: "COMMON.ENTER.NUMERIC.DATA",
                  })}
                />
              </Item>

              <Item
                dataField="MaximoCuponesDia"
                label={{
                  text: intl.formatMessage({
                    id: "ASSISTANCE.COUPON.MAXIUM.DAYS",
                  }),
                }}
                isRequired={modoEdicion ? isRequired("MaximoCuponesDia", settingDataField) : false }
                editorType="dxNumberBox"
                dataType="number"
                editorOptions={{
                  readOnly: !(modoEdicion? isModified("MaximoCuponesDia", settingDataField) : false),
                  inputAttr: { style: "text-transform: uppercase; text-align: right",},
                  showSpinButtons: true,
                  showClearButton: true,
                  min:0
                }}
              >
                <PatternRule
                  pattern={/[0-9]/}
                  message={intl.formatMessage({
                    id: "COMMON.ENTER.NUMERIC.DATA",
                  })}
                />
              </Item>

              <Item
                dataField="MaximoCuponesSemana"
                label={{
                  text: intl.formatMessage({
                    id: "ASSISTANCE.COUPON.MAXIUM.WEEKS",
                  }),
                }}
                isRequired={modoEdicion ? isRequired("MaximoCuponesSemana", settingDataField) : false }
                editorType="dxNumberBox"
                dataType="number"
                editorOptions={{
                  readOnly: !(modoEdicion? isModified("MaximoCuponesSemana", settingDataField) : false),
                  inputAttr: { style: "text-transform: uppercase; text-align: right",},
                  showSpinButtons: true,
                  showClearButton: true,
                  min:0
                }}
              >
                <PatternRule
                  pattern={/[0-9]/}
                  message={intl.formatMessage({
                    id: "COMMON.ENTER.NUMERIC.DATA",
                  })}
                />
              </Item>

            </GroupItem>
          </Form>


        </React.Fragment>
      </PortletBody>
    </>
  );
};

export default injectIntl(CuponeraEditPage);
