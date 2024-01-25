import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import Form, { Item, GroupItem } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";

import { listarEstadoSimple, listarEstado } from "../../../../../_metronic";
import { isRequired, isModified } from "../../../../../_metronic/utils/securityUtils";

import { obtenerTodos as obtenerCmbRequisito } from "../../../../api/acceso/requisito.api";
import { useSelector } from "react-redux";
import HeaderInformation from "../../../../partials/components/HeaderInformation";


const PerfilRequisitoEditPage = props => {

  const perfil = useSelector(state => state.perfil.perfilActual);

  const { intl, modoEdicion, settingDataField, selected } = props;
  const [estadoSimple, setEstadoSimple] = useState([]);
  const [warningEstado, setWarningEstado] = useState([]);
  const classesEncabezado = useStylesEncabezado();
  const [cmbRequisito, setCmbRequisito] = useState([]);

  async function cargarCombos() {
    let estadoSimple = listarEstadoSimple();
    let warningEstado = listarEstado();
    let cmbRequisito = await obtenerCmbRequisito({ IdCliente: perfil.IdCliente, IdDivision: perfil.IdDivision, IdEntidad: selected.IdEntidad });

    setEstadoSimple(estadoSimple);
    setWarningEstado(warningEstado);
    setCmbRequisito(cmbRequisito);
  }

  function grabar(e) {
    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregarPerfilRequisito(props.dataRowEditNew);
      } else {
        props.actualizarPerfilRequisito(props.dataRowEditNew);
      }
    }
  }

  useEffect(() => {
    cargarCombos();
  }, []);

  return (
    <>

      <HeaderInformation data={props.getInfo()} visible={props.showHeaderInformation} labelLocation={'left'} colCount={6}
        toolbar={
          <PortletHeader
            title=""
            toolbar={
              <PortletHeaderToolbar>
                <Button
                  icon="fa fa-save"
                  type="default"
                  hint={intl.formatMessage({ id: "ACTION.RECORD" })}
                  onClick={grabar}
                  useSubmitBehavior={true}
                  validationGroup="FormEdicion"
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
                dataField="IdRequisito"
                label={{ text: intl.formatMessage({ id: "ACCESS.REQUIREMENT" }) }}
                editorType="dxSelectBox"
                colSpan={1}
                colCount={1}
                isRequired={modoEdicion}
                editorOptions={{
                  items: cmbRequisito,
                  valueExpr: "IdRequisito",
                  displayExpr: "Requisito",
                  readOnly: !props.dataRowEditNew.esNuevoRegistro ? true : false
                  //disabled: props.dataRowEditNew.esNuevoRegistro ? false : true
                }}
              />
              <Item></Item>
              <Item dataField="Warning"
                isRequired={modoEdicion ? isRequired('Warning', settingDataField) : false}
                label={{ text: intl.formatMessage({ id: "ACCESS.REQUIREMENT.WARNING" }) }}
                editorType="dxSelectBox"
                editorOptions={{
                  items: warningEstado,
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                  readOnly: (modoEdicion ? isModified('Warning', settingDataField) : false)
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
                  //disabled: props.dataRowEditNew.esNuevoRegistro ? true : false
                }}
              />

            </GroupItem>
          </Form>

        </React.Fragment>
      </PortletBody>
    </>
  );
};

export default injectIntl(PerfilRequisitoEditPage);
