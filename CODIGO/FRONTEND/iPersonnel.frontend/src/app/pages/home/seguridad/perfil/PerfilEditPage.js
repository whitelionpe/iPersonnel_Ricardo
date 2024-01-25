import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import Form, {
  Item, EmptyItem,
  GroupItem,
  //SimpleItem,
  //ButtonItem,
  RequiredRule,
  StringLengthRule,
  PatternRule
} from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";
//import { obtenerTodos as obtenerCmbEntidad } from "../../../../api/sistema/entidad.api";

import { listarEstado, listarEstadoSimple, listarTipoPerfil, PatterRuler } from "../../../../../_metronic";
import { isRequired, isModified } from "../../../../../_metronic/utils/securityUtils";
import { serviceCaracteristica } from "../../../../api/seguridad/caracteristica.api";


const PerfilEditPage = props => {
  const { intl, modoEdicion, accessButton, settingDataField, dataRowEditNew } = props;
  const [estadoSimple, setEstadoSimple] = useState([]);
  const [estadoRegistro, setEstadoRegistro] = useState([]);
  const classesEncabezado = useStylesEncabezado();
  const [cboTipoPerfil, setCboTipoPerfil] = useState([]);
  const [caracteristicaData, setCaracteristicaData] = useState([]);

  async function cargarCombos() {
    let estadoSimple = listarEstadoSimple();
    let dataTipo = listarTipoPerfil();
    let estadoRegistro = listarEstado();
    setEstadoSimple(estadoSimple);
    setCboTipoPerfil(dataTipo);
    setEstadoRegistro(estadoRegistro);
  }
  async function listar_Caracteristicas() {
    let data = await serviceCaracteristica.listar().catch(err => { console.log(err); });
    setCaracteristicaData(data);
  }


  function grabar(e) {

    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (dataRowEditNew.esNuevoRegistro) {
        props.agregarPerfil(dataRowEditNew);
      } else {
        props.actualizarPerfil(dataRowEditNew);
      }
    }
  }

  const isRequiredRule = (id) => {
    return modoEdicion ? false : isRequired(id, settingDataField);
  }

  useEffect(() => {
    cargarCombos();
    listar_Caracteristicas();
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
              <Item dataField="IdPerfil"
                label={{ text: intl.formatMessage({ id: "COMMON.CODE" }) }}
                isRequired={modoEdicion}
                editorOptions={{
                  maxLength: 10,
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  readOnly: !props.dataRowEditNew.esNuevoRegistro ? true : false
                }}
              >
                <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} />
                <PatternRule pattern={PatterRuler.CODE} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS.NUMERIC" })} />
              </Item>
              <EmptyItem />
              <Item dataField="Perfil"
                label={{ text: intl.formatMessage({ id: "ACCESS.PROFILE" }) }}
                isRequired={modoEdicion ? isRequired('Perfil', settingDataField) : false}
                colSpan={2}
                editorOptions={{
                  maxLength: 100,
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  readOnly: !(modoEdicion ? isModified('Perfil', settingDataField) : false)
                }}
              >
                {(isRequiredRule("Perfil")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={100} />}
                <PatternRule pattern={PatterRuler.LETRAS_DESCRIPCION} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS" })} />
              </Item>

              {/* <Item
                dataField="TipoPerfil"
                label={{ text: intl.formatMessage({ id: "ACCESS.PROFILE.TYPE" }) }}
                editorType="dxSelectBox"
                isRequired={true}
                editorOptions={{
                  items: cboTipoPerfil,
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                  readOnly: !(modoEdicion ? isModified('TipoPerfil', settingDataField) : false)
                }}
              />  */}
              <Item
                dataField="IdCaracteristica"
                label={{ text: intl.formatMessage({ id: "SECURITY.PROFILE.CHARACTERISTIC" }) }}
                editorType="dxSelectBox"
                //isRequired={modoEdicion}
                editorOptions={{
                  items: caracteristicaData,
                  valueExpr: "IdCaracteristica",
                  displayExpr: "Caracteristica",
                  readOnly: !(modoEdicion ? true : false)//!props.dataRowEditNew.esNuevoRegistro ? true : false
                }}
              />
              <Item
                dataField="AutorizacionAutomatica"
                label={{ text: "Check", visible: false }}
                //isRequired={modoEdicion}
                editorType="dxCheckBox"
                editorOptions={{
                  readOnly: !(modoEdicion ? true : false),
                  text: intl.formatMessage({ id: "ASSISTANCE.PROFILE.AUTORIZACION_AUTO" }),
                  width: "100%",
                }}
              />

              <Item
                dataField="Nivel"
                label={{ text: intl.formatMessage({ id: "ASSISTANCE.APPROVAL.LEVEL" }) }}
                isRequired={modoEdicion}
                editorType="dxNumberBox"
                dataType="number"
                editorOptions={{
                  readOnly: true,//!(modoEdicion ? configurarPorSemana : false),
                  inputAttr: { style: "text-transform: uppercase; text-align: right" },
                  showSpinButtons: true,
                  showClearButton: true,
                  width: "50%",
                  min: 0,
                  max: 99
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
              
              <Item
                dataField="AplicaUnidadOrganizativa"
                label={{ text: intl.formatMessage({ id: "SECCURITY.PROFILE.APPLY_ORGANIZATION_UNITY" }) }}
                editorType="dxSelectBox"
                isRequired={modoEdicion}
                editorOptions={{
                  items: estadoRegistro,
                  valueExpr: "Valor",
                  displayExpr: "Descripcion", 
                  readOnly: !(modoEdicion ? true : false) 
                }}
              />
            </GroupItem>
          </Form>
        </React.Fragment>
      </PortletBody>
    </>
  );
};

export default injectIntl(PerfilEditPage);
