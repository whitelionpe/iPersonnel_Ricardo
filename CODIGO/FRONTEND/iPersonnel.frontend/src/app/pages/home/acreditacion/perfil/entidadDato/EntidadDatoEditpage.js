import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import Form, { Item, GroupItem } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../../store/config/Styles";

import { listarEstado } from "../../../../../../_metronic";
import { isRequired } from "../../../../../../_metronic/utils/securityUtils";

import HeaderInformation from "../../../../../partials/components/HeaderInformation";

import AcreditacionPerfilEntidadDatoBuscarMultiple from "../../../../../partials/components/AcreditacionPerfilEntidadDatoBuscarMultiple";

const TipoAutorizacionCompaniaEditPage = props => {
  const { intl, modoEdicion, settingDataField, accessButton } = props;
  const [estado, setEstadoSimple] = useState([]);
  const [isVisiblePopUpEntidadDato, setisVisiblePopUpEntidadDato] = useState(true);

  const [valueEditable, setValueEditable] = useState("");
  const [disabledEditable, setDisabledEditable] = useState(false);

  const classesEncabezado = useStylesEncabezado();
  //**********************************************/
  const [editableValue, setEditableValue] = useState("N");
  const [obligatorioValue, setObligatorioValue] = useState([]);


  async function cargarCombos() {
    let estado = listarEstado();
    setEstadoSimple(estado);
  }

  function grabar(e) {
    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (props.dataRowEditNew.esNuevoRegistro) {
        //Charge for List
      } else {
        props.actualizar(props.dataRowEditNew);
      }
    }
  }
  const isRequiredRule = (id) => {
    return modoEdicion ? false : isRequired(id, settingDataField);
  }
  const agregarEntidadDato = (arrayEntidadDatos) => {
    props.agregar(arrayEntidadDatos);
    props.setModoEdicion(false);
  }
  function onValueChanged(value) {
    if (value === "S") {
      setEditableValue("S")
      setObligatorioValue("S")
      props.dataRowEditNew.Editable = "S";
      setDisabledEditable(true);
    } else {
      setEditableValue("N")
      setObligatorioValue("N")
      setDisabledEditable(false);
    }
  }

  useEffect(() => {
    cargarCombos();
  }, []);

  return (
    <>
      <HeaderInformation data={props.getInfo()} visible={true} labelLocation={'left'} colCount={3}
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

              <Item
                dataField="Entidad"
                label={{ text: intl.formatMessage({ id: "ACCREDITATION.PROFILE.ENTITY" }) }}
                visible={!props.dataRowEditNew.esNuevoRegistro}
                editorOptions={{
                  readOnly: true,
                }}
              />
              <Item
                dataField="Dato"
                label={{ text: intl.formatMessage({ id: "ACCREDITATION.REQUIREMENT.DATA" }) }}
                visible={!props.dataRowEditNew.esNuevoRegistro}
                editorOptions={{
                  readOnly: true,
                }}
              />
              <Item
                dataField="Obligatorio"
                label={{ text: intl.formatMessage({ id: "ACCREDITATION.PROFILE.ENTITY.MANDATORY" }) }}
                visible={!props.dataRowEditNew.esNuevoRegistro}
                editorType="dxSelectBox"
                editorOptions={{
                  items: estado,
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                  onValueChanged: (e) => onValueChanged(e.value),
                }}
              />

              <Item
                dataField="Editable"
                label={{ text: intl.formatMessage({ id: "ACCREDITATION.PROFILE.ENTITY.EDITABLE" }) }}
                visible={!props.dataRowEditNew.esNuevoRegistro}
                editorType="dxSelectBox"
                editorOptions={{
                  items: estado,
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                  //value: props.dataRowEditNew.esNuevoRegistro ? editableValue : props.dataRowEditNew.Editable,
                  disabled: disabledEditable,
                }}
              />

            </GroupItem>
          </Form>

          {props.dataRowEditNew.esNuevoRegistro && (
            <>
              {/* POPUP-> buscar persona */}
              <AcreditacionPerfilEntidadDatoBuscarMultiple
                showPopup={{ isVisiblePopUp: isVisiblePopUpEntidadDato, setisVisiblePopUp: setisVisiblePopUpEntidadDato }}
                cancelar={() => setisVisiblePopUpEntidadDato(false)}
                agregar={agregarEntidadDato}
                selectionMode={"multiple"}
                uniqueId={"EntidadDatoEditPage"}
                cancelarEdicion={props.cancelarEdicion}
                setModoEdicion={props.setModoEdicion}
                filtro={props.filtroLocal}
              />
            </>
          )}
        </React.Fragment>
      </PortletBody>
    </>
  );
};

export default injectIntl(TipoAutorizacionCompaniaEditPage);
