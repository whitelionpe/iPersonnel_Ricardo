import React, { useEffect, useState } from "react";
import Form, {
  Item,
  GroupItem,
  SimpleItem,
  ButtonItem,
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
import { useSelector } from "react-redux";
//import { obtenerTodos as obtenerTodosEntidad } from "../../../../api/sistema/entidad.api";
import { injectIntl } from "react-intl";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";

import { listarEstadoSimple, PatterRuler, isNotEmpty, listarEstado, transporteAplicaPara } from "../../../../../_metronic";
import { isRequired, isModified } from "../../../../../_metronic/utils/securityUtils";
import { obtenerTodos as obtenerTodosCaracteristica } from "../../../../api/administracion/caracteristica.api";
import { obtenerTodos as obtenerTodosCaracteristicaDetalle } from "../../../../api/administracion/caracteristicaDetalle.api";

const TipoProgramacionEditPage = props => {
  //const [entidades, setEntidades] = useState([]);
  const [estadoSimple, setEstadoSimple] = useState([]);
  const [estadoObjeto, setEstadoObjeto] = useState([]);
  const [aplicaCaracterista, setAplicaCaracteristica] = useState(false);

  const [caracteristicas, setCaracteristicas] = useState([]);
  const [caracteristicaDetalle, setCaracteristicaDetalle] = useState([]);

  const perfil = useSelector(state => state.perfil.perfilActual);
  const classesEncabezado = useStylesEncabezado();
  const { intl, modoEdicion, settingDataField, accessButton, setDataRowEditNew, setLoading } = props;

  async function cargarCombos() {
    //let entidades = await obtenerTodosEntidad(0, 0);
    let estadoSimple = listarEstadoSimple();
    //setEntidades(entidades);
    setEstadoSimple(estadoSimple);

    let estadoObjeto = listarEstado();
    setEstadoObjeto(estadoObjeto);

    let caracteristica = await obtenerTodosCaracteristica({ IdCliente: perfil.IdCliente, IdEntidad: 'P' });
    setCaracteristicas(caracteristica);

  }

  const getCaracteristicaDetalle = async (value) => {
    debugger


    //console.log("getCaracteristicaDetalle", value);
    if (value) {
      setLoading(true);
      let data = await obtenerTodosCaracteristicaDetalle({ IdCliente: perfil.IdCliente, IdCaracteristica: value })
      //console.log("getCaracteristicaDetalle-> Data->", data);
      setCaracteristicaDetalle(data);
      setLoading(false);
    }
  }

  async function onValueChangeAplicaCaracteristica(value) {
    setAplicaCaracteristica(value);
    if (!value) {
      props.dataRowEditNew.IdCaracteristica = "";
      props.dataRowEditNew.IdCaracteristicaDetalle = "";
    }
  }

  function grabar(e) {

    let result = e.validationGroup.validate();

    if (result.isValid) {

      if (!props.dataRowEditNew.AplicaCaracteristica) {
        //alert(props.dataRowEditNew.IdCaracteristica + '---'  + props.dataRowEditNew.IdCaracteristicaDetalle);
        props.dataRowEditNew.IdCaracteristica = "";
        props.dataRowEditNew.IdCaracteristicaDetalle = "";
      }

      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregarTipoProgramacion(props.dataRowEditNew);
      } else {
        props.actualizarTipoProgramacion(props.dataRowEditNew);
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
              onClick={props.cancelarEdicion} />

          </PortletHeaderToolbar>
        }
      />
      <PortletBody >
        <React.Fragment>
          <Form formData={props.dataRowEditNew} validationGroup="FormEdicion" >

            <GroupItem itemType="group" colCount={2} colSpan={2} >
              <Item colSpan={2}>
                <AppBar position="static" className={classesEncabezado.secundario}>
                  <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                    <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                      {intl.formatMessage({ id: "COMMON.DETAIL" })}
                    </Typography>
                  </Toolbar>
                </AppBar>
              </Item>
              <Item dataField="IdTipoProgramacion"
                label={{ text: intl.formatMessage({ id: "COMMON.CODE" }) }}
                isRequired={true}
                editorOptions={{
                  maxLength: 10,
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  readOnly: true
                }}
              >
              </Item>

              <Item dataField="TipoProgramacion"
                isRequired={modoEdicion ? isRequired('TipoProgramacion', settingDataField) : false}
                label={{ text: intl.formatMessage({ id: "TRANSPORTE.PROGRAMMING.TYPE" }) }}
                colSpan={2}
                editorOptions={{
                  readOnly: !(modoEdicion ? isModified('TipoProgramacion', settingDataField) : false),
                  maxLength: 100,
                  inputAttr: { 'style': 'text-transform: uppercase' },
                }}
              >
                {(isRequiredRule("TipoProgramacion")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={100} />}
                <PatternRule pattern={PatterRuler.LETRAS_DESCRIPCION} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS" })} />
              </Item>

              <Item
                dataField="AplicaPara"
                label={{ text: intl.formatMessage({ id: "TRANSPORTE.APPLICATION.TO" }) }}
                editorType="dxSelectBox"
                isRequired={modoEdicion}
                editorOptions={{
                  readOnly: !(modoEdicion ? true : false),
                  items: transporteAplicaPara(),
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                }}
              />

              <Item dataField="AplicaCaracteristica"
                label={{
                  text: "Check",
                  visible: false
                }}
                editorType="dxCheckBox"
                colSpan={3}
                editorOptions={{
                  readOnly: !modoEdicion,
                  text: intl.formatMessage({ id: "TRANSPORTE.APPLY.FEATUREPERSONNEL" }),
                  width: "100%",
                  onValueChanged: (e) => onValueChangeAplicaCaracteristica(e.value)
                }}
              />

              <Item
                dataField="IdCaracteristica"
                label={{ text: intl.formatMessage({ id: "SECURITY.PROFILE.CHARACTERISTIC" }) }}
                editorType="dxSelectBox"
                isRequired={aplicaCaracterista}
                editorOptions={{
                  items: caracteristicas,
                  valueExpr: "IdCaracteristica",
                  displayExpr: "Caracteristica",
                  searchEnabled: true,
                  readOnly: !(modoEdicion ? aplicaCaracterista : false),
                  onValueChanged: (e => getCaracteristicaDetalle(e.value))
                }}
              >
              </Item>

              <Item
                dataField="IdCaracteristicaDetalle"
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.VALUE" }) }}
                editorType="dxSelectBox"
                isRequired={aplicaCaracterista}
                editorOptions={{
                  items: caracteristicaDetalle,
                  valueExpr: "IdCaracteristicaDetalle",
                  displayExpr: "CaracteristicaDetalle",
                  searchEnabled: true,
                  readOnly: !(modoEdicion ? aplicaCaracterista : false)
                }}
              >
              </Item>

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

            </GroupItem>

          </Form>
        </React.Fragment>
      </PortletBody>
    </>
  );
};

export default injectIntl(WithLoandingPanel(TipoProgramacionEditPage));
