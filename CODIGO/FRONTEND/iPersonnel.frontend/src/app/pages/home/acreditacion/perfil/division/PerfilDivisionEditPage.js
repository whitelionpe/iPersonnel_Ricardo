import React, { useEffect, useState } from "react";
import Form, { Item, GroupItem, PatternRule, StringLengthRule, RequiredRule } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";

import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../../store/config/Styles";
import { injectIntl } from "react-intl";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";

import { listarEstadoSimple } from "../../../../../../_metronic/utils/utils";
import AdministracionDivisionBuscar from "../../../../../partials/components/AdministracionDivisionBuscar";
import { isNotEmpty, PatterRuler } from "../../../../../../_metronic";

const PerfilDivisionEditPage = props => {
  const { intl, setLoading } = props;
  const [estadoSimple, setEstadoSimple] = useState([]);
  const classesEncabezado = useStylesEncabezado();
  const [isVisiblePopUpDivision, setisVisiblePopUpDivision] = useState(false);
  const [varDiasPerm, setDiasPerm] = useState(null);
  const [varSizeNumber, setSizeNumber] = useState(null);
  


  useEffect(() => {
    cargarCombos();
  }, []);

  async function cargarCombos() {
    let estadoSimple = listarEstadoSimple();
    setEstadoSimple(estadoSimple);
  }

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

  /*** POPUP DIVISIONES ***/
  const selectDataDivisiones = (data) => {

    const { IdCliente, Division, IdDivision } = data;
    props.dataRowEditNew.IdCliente = IdCliente;
    props.dataRowEditNew.IdDivision = IdDivision;
    props.dataRowEditNew.Division = `${IdDivision} - ${Division}`;

    setisVisiblePopUpDivision(false);

  }

  const cambiaDiasPerm = e => {
    var string = "" + e.value;
    let SizeNumber = string.toString().length;
    setSizeNumber(SizeNumber);
    // console.log(SizeNumber)
    setDiasPerm(e.value);
  }

  return (
    <>
      <HeaderInformation data={props.getInfo()} visible={true} labelLocation={'left'} colCount={3}
        toolbar={
          <PortletHeader
            title=""
            toolbar={
              <PortletHeaderToolbar>
                <PortletHeaderToolbar>
                  <Button
                    icon="fa fa-save"
                    type="default"
                    hint={intl.formatMessage({ id: "ACTION.RECORD" })}
                    onClick={grabar}
                    useSubmitBehavior={true}
                    validationGroup="FormEdicion"
                    visible={props.modoEdicion}
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

        } />

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
              <Item dataField="IdCliente" visible={false}></Item>
              <Item dataField="IdPerfil" visible={false}></Item>
              <Item dataField="IdDivision" visible={false}></Item>

              <Item
                colSpan={1} dataField="Division" isRequired={true} label={{ text: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.DIVISION.NAME" }) }}
                editorOptions={{
                  readOnly: true,
                  hoverStateEnabled: false,
                  inputAttr: { style: "text-transform: uppercase" },
                  showClearButton: true,
                  buttons: [
                    {
                      name: "search",
                      location: "after",
                      useSubmitBehavior: true,
                      options: {
                        stylingMode: "text",
                        icon: "search",
                        disabled: !props.dataRowEditNew.esNuevoRegistro,
                        onClick: (evt) => {
                          setisVisiblePopUpDivision(true);
                        },
                      },
                    },
                  ],
                }}
              />

              <Item
                dataField="DiasPermanencia"
                label={{ text: intl.formatMessage({ id: "ACCREDITATION.PROFILE.DIAPERMANECIA" }) }}
                isRequired={true}
                dataType="number"
                editorOptions={{
                  onValueChanged: cambiaDiasPerm,
                  value: props.dataRowEditNew.esNuevoRegistro ? (props.dataRowEditNew.varVisita == 'N' ? (varDiasPerm != null ? varDiasPerm : 30) : (varDiasPerm != null ? varDiasPerm : 7)) : props.dataRowEditNew.DiasPermanencia,
                  showClearButton: true,
                  showSpinButtons: true
                }}
              >
                {/* <RequiredRule /> */}
                <StringLengthRule max={3} />
                {/* { varSizeNumber > 3 ?  <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} />  : <StringLengthRule max={3} />} */}
                <PatternRule pattern={PatterRuler.SOLO_NUMEROS} message={intl.formatMessage({ id: "COMMON.ENTER.NUMERIC.DATA" })} />
                
              </Item>

              <Item
                dataField="Activo"
                label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
                editorType="dxSelectBox"
                isRequired={true}
                editorOptions={{
                  readOnly: !props.modoEdicion,
                  items: estadoSimple,
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                  disabled: props.dataRowEditNew.esNuevoRegistro ? true : !props.modoEdicion,
                }}
              />

            </GroupItem>
          </Form>


          {/*******>POPUP DIVISIONES>******** */}
          <AdministracionDivisionBuscar
            selectData={selectDataDivisiones}
            showPopup={{ isVisiblePopUp: isVisiblePopUpDivision, setisVisiblePopUp: setisVisiblePopUpDivision }}
            cancelarEdicion={() => setisVisiblePopUpDivision(false)}
          />
        </React.Fragment>
      </PortletBody>
    </>
  );

};

export default injectIntl(WithLoandingPanel(PerfilDivisionEditPage));

