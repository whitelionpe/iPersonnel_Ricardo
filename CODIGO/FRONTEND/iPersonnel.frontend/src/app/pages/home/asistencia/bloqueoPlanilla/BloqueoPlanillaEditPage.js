import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import Form, { Item, GroupItem, RequiredRule, PatternRule, StringLengthRule } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";
import AdministracionCompaniaBuscar from "../../../../partials/components/AdministracionCompaniaBuscar";

import { getDateOfDay, listarEstadoSimple, PatterRuler } from "../../../../../_metronic";
import { isRequired, isModified } from "../../../../../_metronic/utils/securityUtils";
import HeaderInformation from "../../../../partials/components/HeaderInformation";
import FieldsetAcreditacion from "../../../../partials/content/Acreditacion/FieldsetAcreditacion/FieldsetAcreditacion";


const BloqueoPlanillaEditPage = props => {
  const { intl, modoEdicion, settingDataField, accessButton } = props;
  const [estadoSimple, setEstadoSimple] = useState([]);
  const classesEncabezado = useStylesEncabezado();

  const [isVisiblePopUpCompaniaMandante, setisVisiblePopUpCompaniaMandante] = useState(false);
  const [companiaContratista, setCompaniaContratista] = useState("N");

  console.log("*BloqueoPlanillaEditPage ,modoEdicion:>", modoEdicion);
  console.log("*BloqueoPlanillaEditPage ,settingDataField:>", settingDataField);
  console.log("*BloqueoPlanillaEditPage ,accessButton:>", accessButton);

  async function cargarCombos() {
    let estadoSimple = listarEstadoSimple();
    setEstadoSimple(estadoSimple);
  }

  function grabar(e) {
    let result = e.validationGroup.validate();
    console.log("grabar() - result.isValid :> ", result.isValid);
    if (result.isValid) {
      console.log("*props.dataRowEditNew :> ", props.dataRowEditNew);
      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregarPlanilla(props.dataRowEditNew);
      }
      // else {
      //   props.actualizarPlanilla(props.dataRowEditNew);
      // }
    }
  }
  const selectCompaniaMandante = (mandante) => {
    const { IdCompania, Compania } = mandante[0];
    props.dataRowEditNew.IdCompania = IdCompania;
    props.dataRowEditNew.CompaniaMandante = Compania;
  }

  // const isRequiredRule = (id) => {
  //   return modoEdicion ? false : isRequired(id, settingDataField);
  // }

  useEffect(() => {
    cargarCombos();

  }, []);

  return (
    <>


      <HeaderInformation data={props.getInfo()} visible={true} labelLocation={'left'} colCount={6}
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
                // disabled={!accessButton.grabar}
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
          <div>
            <Form formData={props.dataRowEditNew} validationGroup="FormEdicion" >
              <GroupItem itemType="group" colCount={2} colSpan={2}>
                {/* <Item colSpan={2}>
                  <AppBar position="static" className={classesEncabezado.secundario}>
                    <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                      <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                        {intl.formatMessage({ id: "COMMON.DETAIL" })}
                      </Typography>
                    </Toolbar>
                  </AppBar>
                </Item> */}

                <Item dataField="IdCompania" visible={false} />
                <Item
                  colSpan={1}
                  dataField="CompaniaMandante"
                  isRequired={modoEdicion ? isRequired('IdCompania', settingDataField) : false}
                  label={{ text: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CLIENTCOMPANY" }), }}
                  visible={false}
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
                            setCompaniaContratista("N");
                            setisVisiblePopUpCompaniaMandante(true);
                          },
                        },
                      },
                    ],
                  }}
                />


              </GroupItem>
            </Form>

            <FieldsetAcreditacion title={intl.formatMessage({ id: "ASSISTANCE.BLOCKDATE.EDIT_TITLE_SECTION" })}>
              <div className="card-body" >
                <Form formData={props.dataRowEditNew} validationGroup="FormEdicion" >

                  <GroupItem itemType="group" colCount={2} colSpan={2}>
                    <Item dataField="FechaCierrePlanilla"
                      label={{ text: intl.formatMessage({ id: "SECURITY.USER.DATELOCKED" }) }}
                      isRequired={modoEdicion}
                      // isRequired={modoEdicion ? isRequired('FechaCierrePlanilla', settingDataField) : false}
                      editorType="dxDateBox"
                      dataType="date"
                      editorOptions={{
                        inputAttr: { 'style': 'text-transform: uppercase' },
                        displayFormat: "dd/MM/yyyy",
                        // readOnly: !(modoEdicion ? isModified('FechaCierrePlanilla', settingDataField) : false),
                        // min: fechasContrato.FechaInicioContrato,
                        // max: fechasContrato.FechaFinContrato 
                        max: getDateOfDay().FechaInicio,
                      }}
                    />
                    <Item
                      dataField="Activo"
                      label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
                      editorType="dxSelectBox"
                      isRequired={modoEdicion}
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
              </div>
            </FieldsetAcreditacion>
          </div>

          <AdministracionCompaniaBuscar
            selectData={selectCompaniaMandante}
            showPopup={{ isVisiblePopUp: isVisiblePopUpCompaniaMandante, setisVisiblePopUp: setisVisiblePopUpCompaniaMandante }}
            cancelarEdicion={() => setisVisiblePopUpCompaniaMandante(false)}
            uniqueId={"administracionCompaniaMandanteBuscar"}
            contratista={companiaContratista}
          />
        </React.Fragment >
      </PortletBody >
    </>
  );
};

export default injectIntl(BloqueoPlanillaEditPage);
