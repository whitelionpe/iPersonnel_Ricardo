import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import Form, { Item, GroupItem, RequiredRule, StringLengthRule, PatternRule } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar, PortletHeaderPopUp, Portlet } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";

import { listarEstadoSimple, PatterRuler, isNotEmpty, listarEstado } from "../../../../../_metronic";
import { isRequired, isModified } from "../../../../../_metronic/utils/securityUtils";

import { obtenerTodos as obtenerCmbTipoPosicion } from "../../../../api/administracion/tipoPosicion.api";
import { obtenerTodos as obtenerCmbFuncion } from "../../../../api/administracion/funcion.api";

import { useSelector } from "react-redux";
import { Popup } from "devextreme-react/popup";
import PropTypes from "prop-types";
import AdministracionDivisionBuscar from "../../../../partials/components/AdministracionDivisionBuscar";
import FieldsetAcreditacion from '../../../../partials/content/Acreditacion/FieldsetAcreditacion/FieldsetAcreditacion';

const PosicionEditPage = props => {

  const { intl, modoEdicion, settingDataField, accessButton } = props;

  const { IdCliente } = useSelector((state) => state.perfil.perfilActual);
  const [estadoSimple, setEstadoSimple] = useState([]);
  const [estado, setEstado] = useState([]);
  const classesEncabezado = useStylesEncabezado();
  const [cmbTipoPosicion, setCmbTipoPosicion] = useState([]);
  const [cmbFuncion, setCmbFuncion] = useState([]);
  const [isVisiblePopUpDivision, setisVisiblePopUpDivision] = useState(false);

  async function cargarCombos() {
    let estadoSimple = listarEstadoSimple();
    let estado = listarEstado();
    //Listar Tipo posicion
    await obtenerCmbTipoPosicion({ IdCliente }).then(cmbTipoPosicion => { setCmbTipoPosicion(cmbTipoPosicion); });
    //Listar Funciones
    await obtenerCmbFuncion({ IdCliente, Contratista: 'N' }).then(cmbFuncion => { setCmbFuncion(cmbFuncion); });

    setEstadoSimple(estadoSimple);
    setEstado(estado);
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

  const isRequiredRule = (id) => {
    return modoEdicion ? false : isRequired(id, settingDataField);
  }

  const hidePopover = () => {
    props.showPopup.setisVisiblePopUp(false);
    //props.setModoEdicion(false);
  }

  const selectDataDivisiones = (data) => {
    props.setDataRowEditNew({
      ...props.dataRowEditNew,
      IdDivision: data.IdDivision,
      Division: `${data.IdDivision} - ${data.Division}`,
    });
    setisVisiblePopUpDivision(false);
  }

  useEffect(() => {
    cargarCombos();
  }, []);

  return (
    <>
      <Popup
        visible={props.showPopup.isVisiblePopUp}
        dragEnabled={false}
        closeOnOutsideClick={false}
        showTitle={true}
        height={"700px"}
        width={"600px"}
        title={(props.titulo).toUpperCase()}
        onHiding={hidePopover}
      >
        <Portlet>

          <PortletHeaderPopUp
            title={""}
            toolbar={
              <PortletHeaderToolbar>
                <Button
                  //id="idGrabarUO"
                  icon="fa fa-save"
                  type="default"
                  hint={intl.formatMessage({ id: "ACTION.RECORD" })}
                  useSubmitBehavior={true}
                  disabled={!props.modoEdicion}
                  validationGroup="FormEdicion"
                  onClick={grabar}
                //visible={true}
                //style={{ alignment: "left", padding: "0px" }}
                />
                &nbsp;
                <Button
                  icon="fa fa-times-circle"
                  type="normal"
                  hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
                  onClick={props.cancelarEdicion}
                  disabled={!props.modoEdicion}
                  visible={true}
                />
              </PortletHeaderToolbar>
            }
          />

          <PortletBody >
            <React.Fragment>
              <FieldsetAcreditacion title={intl.formatMessage({ id: "COMMON.DETAIL" })}>
                <Form formData={props.dataRowEditNew} validationGroup="FormEdicion" >
                  <GroupItem itemType="group" colCount={4} colSpan={4}>
                    <Item dataField="IdCliente" visible={false} />
                    <Item dataField="IdPosicionPadre" visible={false} />
                    <Item dataField="IdUnidadOrganizativa" visible={false} />
                    <Item dataField="IdDivision" visible={false} />

                    <Item
                      dataField="IdPosicion"
                      label={{ text: intl.formatMessage({ id: "COMMON.CODE" }) }}
                      isRequired={true}
                      colSpan={4}
                      editorOptions={{
                        maxLength: 20,
                        inputAttr: { style: "text-transform: uppercase" },
                        readOnly: props.dataRowEditNew.esNuevoRegistro ? false : true,
                      }}
                    >
                      <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} />
                      <PatternRule pattern={PatterRuler.CODE} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS.NUMERIC" })} />
                    </Item>

                    <Item
                      dataField="Posicion"
                      isRequired={true}
                      label={{ text: intl.formatMessage({ id: "ADMINISTRATION.POSITION" }) }}
                      colSpan={4}
                      editorOptions={{
                        maxLength: 100,
                        inputAttr: { style: "text-transform: uppercase" },
                        readOnly: !props.modoEdicion,
                      }}
                    >
                      {(isRequiredRule("Posicion")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={100} />}
                      <PatternRule pattern={PatterRuler.LETRAS_DESCRIPCION} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS" })} />
                    </Item>

                    <Item
                      dataField="IdTipoPosicion"
                      label={{ text: intl.formatMessage({ id: "ADMINISTRATION.POSITION.POSITIONTYPE" }), }}
                      editorType="dxSelectBox"
                      colSpan={4}
                      editorOptions={{
                        items: cmbTipoPosicion,
                        valueExpr: "IdTipoPosicion",
                        displayExpr: "TipoPosicion",
                        showClearButton: true,
                        readOnly: !props.modoEdicion,
                      }}
                    />

                    <Item
                      colSpan={4}
                      dataField="Division"
                      isRequired={true}
                      label={{ text: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.DIVISION.NAME" }) }}
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
                              //disabled: !props.dataRowEditNew.esNuevoRegistro,
                              onClick: (evt) => {
                                setisVisiblePopUpDivision(true);
                              },
                            },
                          },
                        ],
                      }}
                    />
                    <Item
                      dataField="UnidadOrganizativa"
                      isRequired={true}
                      label={{ text: intl.formatMessage({ id: "ADMINISTRATION.ORGANIZATIONALUNIT.COSTCENTER.UO.TAB" }) }}
                      colSpan={4}
                      editorOptions={{
                        maxLength: 100,
                        inputAttr: { style: "text-transform: uppercase" },
                        readOnly: true,
                      }}
                    />

                    <Item
                      dataField="IdFuncion"
                      label={{ text: intl.formatMessage({ id: "ADMINISTRATION.POSITION.FUNCTION" }) }}
                      editorType="dxSelectBox"
                      colSpan={4}
                      editorOptions={{
                        items: cmbFuncion,
                        valueExpr: "IdFuncion",
                        displayExpr: "Funcion",
                        showClearButton: true,
                        readOnly: !props.modoEdicion,
                      }}
                    />

                  </GroupItem>

                  <GroupItem itemType="group" colCount={4} colSpan={4} >
                    <GroupItem cssClass={"card"} colSpan={4}>
                      <GroupItem cssClass={"card-body"} colCount={4} colSpan={4}>

                        <Item
                          dataField="Fiscalizable"
                          label={{ text: "Check", visible: false }}
                          editorType="dxCheckBox"
                          colSpan={2}
                          editorOptions={{
                            //value: props.dataRowEditNew.Fiscalizable === "S" ? true : false,
                            readOnly: !props.modoEdicion,
                            text: intl.formatMessage({ id: "ADMINISTRATION.POSITION.CONTROLLABLE" }),
                            width: "100%"
                          }}
                        />

                        <Item
                          dataField="Confianza"
                          label={{ text: "Check", visible: false }}
                          editorType="dxCheckBox"
                          colSpan={2}
                          editorOptions={{
                            //value: props.dataRowEditNew.Confianza === "S" ? true : false,
                            readOnly: !props.modoEdicion,
                            text: intl.formatMessage({ id: "ADMINISTRATION.POSITION.TRUST" }),
                            width: "100%"
                          }}
                        />
                      </GroupItem>
                    </GroupItem>
                    <Item
                      dataField="JefeUnidadOrganizativa"
                      label={{ text: intl.formatMessage({ id: "ADMINISTRATION.POSITION.UNIT.CHIEF" }) }}
                      editorType="dxSelectBox"
                      isRequired={true}
                      colSpan={2}
                      editorOptions={{
                        items: estado,
                        valueExpr: "Valor",
                        displayExpr: "Descripcion"
                      }}
                    />

                    <Item
                      dataField="Activo"
                      label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
                      editorType="dxSelectBox"
                      isRequired={true}
                      colSpan={2}
                      editorOptions={{
                        items: estadoSimple,
                        valueExpr: "Valor",
                        displayExpr: "Descripcion",
                        disabled: props.dataRowEditNew.esNuevoRegistro ? true : !props.modoEdicion
                      }}
                    />
                  </GroupItem>
                </Form>
              </FieldsetAcreditacion>

              <FieldsetAcreditacion title={intl.formatMessage({ id: "ACCESS.R001.INTERVALCONSULTATION.INFORMATIVE.DATA" })}>
                <Form formData={props.dataRowEditNew} validationGroup="FormEdicion" >
                  <GroupItem itemType="group" colCount={4} colSpan={4}>
                    <Item
                      dataField="nombresPersonaAsigando"
                      label={{ text: intl.formatMessage({ id: "ADMINISTRATION.POSITION.ASSIGNED" }) }}
                      colSpan={4}
                      editorOptions={{
                        inputAttr: { style: "text-transform: uppercase" },
                        disabled: true,
                      }}
                    />
                    <Item
                      dataField="PosicionPadre"
                      label={{ text: intl.formatMessage({ id: "ADMINISTRATION.POSITION.IMMEDIATE.BOSS" }) }}
                      colSpan={4}
                      editorOptions={{
                        maxLength: 100,
                        inputAttr: { style: "text-transform: uppercase" },
                        disabled: true,
                      }}
                    />
                  </GroupItem>
                </Form>
              </FieldsetAcreditacion>
              {/*******>POPUP DE UNIDAD ORGA.>******** */}
              {/* POPUP-> Buscar Divisiòn */}
              <AdministracionDivisionBuscar
                selectData={selectDataDivisiones}
                showPopup={{ isVisiblePopUp: isVisiblePopUpDivision, setisVisiblePopUp: setisVisiblePopUpDivision }}
                cancelarEdicion={() => setisVisiblePopUpDivision(false)}
              />

            </React.Fragment>
          </PortletBody>
        </Portlet>
      </Popup>
    </>
  );
};

PosicionEditPage.propTypes = {
  showButton: PropTypes.bool,
  //selectionMode: PropTypes.string,
  uniqueId: PropTypes.string,
};
PosicionEditPage.defaultProps = {
  showButton: true,
  //selectionMode: "row", //['multiple', 'row']
  uniqueId: "PosicionEditPage",
};

export default injectIntl(PosicionEditPage);
