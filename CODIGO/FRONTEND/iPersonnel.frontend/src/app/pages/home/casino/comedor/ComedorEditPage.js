import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";
import Form, {
  Item,
  GroupItem,
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

import { obtenerTodos as obtenerTipo } from "../../../../api/casino/casinoTipo.api";
import { obtenerTodos as obtenerPaises } from "../../../../api/sistema/pais.api";
import { obtenerTodos as obtenerMonedas } from "../../../../api/sistema/moneda.api";
import { obtenerTodos as obtenerPaisMoneda } from "../../../../api/sistema/paisMoneda.api";

import { listarEstado } from '../../../../../_metronic/utils/utils'
import PropTypes from 'prop-types';

import { listarEstadoSimple, PatterRuler } from "../../../../../_metronic";
import { isRequired, isModified } from "../../../../../_metronic/utils/securityUtils";
import AdministracionZonaModuloBuscar from "../../../../partials/components/AdministracionZonaModuloBuscar";

const ComedorEditPage = props => {

  const { intl, modoEdicion, settingDataField, accessButton } = props;
  const perfil = useSelector(state => state.perfil.perfilActual);
  const [estadoSimple, setEstadoSimple] = useState([]);
  const [estadoAforo, setEstadoAforo] = useState([]);
  const [cmbTipo, setCmbTipo] = useState([]);
  const [paises, setPaises] = useState([]);
  const [monedas, setMonedas] = useState([]);
  const [popupVisibleZona, setPopupVisibleZona] = useState(false);
  const classesEncabezado = useStylesEncabezado();
  const [enableAforo, setEnableAforo] = useState(false);

  async function cargarCombos() {
    let cmbTipo = await obtenerTipo({ IdTipo: '%' });
    let estadoSimple = listarEstadoSimple();
    let estadoAforo = listarEstado();
    let paises = await obtenerPaises({});
    // let monedas = [];
    // if (!modoEdicion) {
    //   monedas = await obtenerMonedas({});
    // }

    let monedas =  await obtenerPaisMoneda({ IdPais: perfil.IdPais, IdMoneda: '%' })

    setEstadoAforo(estadoAforo);
    setEstadoSimple(estadoSimple);
    setCmbTipo(cmbTipo);
    setPaises(paises);
    setMonedas(monedas);
  }


  function grabar(e) {

    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregarComedor(props.dataRowEditNew);
      } else {
        props.actualizarComedor(props.dataRowEditNew);
      }
    }
  }

  const isRequiredRule = (id) => {
    return modoEdicion ? false : isRequired(id, settingDataField);
  }

  useEffect(() => {
    cargarCombos();
    onValueChangedTipo(props.dataRowEditNew.ControlarAforo);
  }, []);


  function onValueChangedTipo(valor) {
    let aplicaAforo = valor === 'N';
    if (valor === 'N') {
      props.dataRowEditNew.TotalAforo = 0
      setEnableAforo(aplicaAforo);
    } else {
      setEnableAforo(aplicaAforo);
    }
  }

  const selectZona = (dataPopup) => {
     props.dataRowEditNew.IdZona = dataPopup.IdZona
     props.dataRowEditNew.Zona = dataPopup.Zona

    setPopupVisibleZona(false);
  }

  const onValueChangedPais = async (valor) => {
    await obtenerPaisMoneda({ IdPais: valor, IdMoneda: '%' }).then(response => {
      setMonedas(response);
    })
  }

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

              <Item dataField="IdComedor"
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

              <Item dataField="Comedor"
                label={{ text: intl.formatMessage({ id: "CASINO.DINNINGROOM" }) }}
                isRequired={modoEdicion ? isRequired('Comedor', settingDataField) : false}
                editorOptions={{
                  maxLength: 100,
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  readOnly: !(modoEdicion ? isModified('Comedor', settingDataField) : false),
                }}
              >
                {(isRequiredRule("Comedor")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={100} />}
                <PatternRule pattern={PatterRuler.LETRAS_DESCRIPCION} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS.NUMERIC" })} />
              </Item>

              <Item
                dataField="IdTipo"
                label={{ text: intl.formatMessage({ id: "COMMON.TYPE" }) }}
                isRequired={modoEdicion ? isRequired('IdTipo', settingDataField) : false}
                editorType="dxSelectBox"
                editorOptions={{
                  items: cmbTipo,
                  valueExpr: "IdTipo",
                  displayExpr: "Tipo",
                  readOnly: !(modoEdicion ? isModified('IdTipo', settingDataField) : false),
                }}
              />

              <Item
                dataField="IdMoneda"
                label={{ text: intl.formatMessage({ id: "SYSTEM.CURRENCY" }) }}
                isRequired={modoEdicion ? isRequired('IdMoneda', settingDataField) : false}
                editorType="dxSelectBox"
                editorOptions={{
                  items: monedas,
                  valueExpr: "IdMoneda",
                  displayExpr: "Moneda",
                  readOnly: !(modoEdicion ? isModified('IdMoneda', settingDataField) : false),
                }}
              />

              <Item
                dataField="ControlarAforo"
                label={{ text: intl.formatMessage({ id: "CASINO.APPLYCAPACITY" }) }}
                editorType="dxSelectBox"
                isRequired={modoEdicion ? isRequired('ControlarAforo', settingDataField) : false}
                editorOptions={{
                  items: estadoAforo,
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                  onValueChanged: (e) => onValueChangedTipo(e.value),
                  readOnly: !(modoEdicion ? isModified('ControlarAforo', settingDataField) : false)
                }}
              />

              <Item
                dataField="TotalAforo"
                label={{ text: intl.formatMessage({ id: "CASINO.CAPACITY" }) }}
                editorType="dxNumberBox"
                dataType="number"
                isRequired={modoEdicion ? isRequired('TotalAforo', settingDataField) : false}
                editorOptions={{
                  disabled: enableAforo,
                  readOnly: !(modoEdicion ? isModified('TotalAforo', settingDataField) : false),
                  min: 1,
                }}
              />

              <Item
                dataField="IdPais"
                label={{ text: intl.formatMessage({ id: "SYSTEM.COUNTRY" }) }}
                isRequired={modoEdicion ? isRequired('IdPais', settingDataField) : false}
                visible={false}
                editorType="dxSelectBox"
                editorOptions={{
                  items: paises,
                  valueExpr: "IdPais",
                  displayExpr: "Pais",
                  readOnly: true,
                  onValueChanged: (e) => onValueChangedPais(e.value)
                }}
              />

          <Item
              dataField="Zona"
              label={{ text: intl.formatMessage({ id: "CAMP.CAMP.PHYSICAL.AREA" }) }}
              editorOptions={{
                hoverStateEnabled: false,
                inputAttr: { 'style': 'text-transform: uppercase' },
                showClearButton: true,
                buttons: [{
                  name: 'search',
                  location: 'after',
                  useSubmitBehavior: true,
                  options: {
                    stylingMode: 'text',
                    icon: 'search',
                    disabled: !modoEdicion ? true : false,
                    onClick: () => {
                      setPopupVisibleZona(true);
                    },
                  }
                }]
              }}
            />

              <Item
                  dataField="Activo"
                  label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
                  editorType="dxSelectBox"
                  isRequired={modoEdicion}
                  colSpan={3}
                  editorOptions={{
                    items: estadoSimple,
                    valueExpr: "Valor",
                    displayExpr: "Descripcion",
                    readOnly: !(modoEdicion ? (props.dataRowEditNew.esNuevoRegistro ? false : true) : false)
                  }}
                />

              <GroupItem itemType="group" colCount={6} colSpan={2}>

             

                <Item
                  dataField="DiferenciarCostos"
                  isRequired={
                    modoEdicion ? isRequired("DiferenciarCostos", settingDataField) : false
                  }
                  colSpan={3}
                  editorType="dxCheckBox"
                  label={{
                    text: "Check",
                    visible: false
                  }}
                  editorOptions={{
                    readOnly: !(modoEdicion ? isModified("DiferenciarCostos", settingDataField) : false),
                    text: intl.formatMessage({ id: "CASINO.DIFFENTIATE.COSTS" }),
                    width: "100%"
                  }}
                />
              </GroupItem>

            </GroupItem>
          </Form>

          {popupVisibleZona && (
              <AdministracionZonaModuloBuscar
              selectData={selectZona}
              showPopup={{ isVisiblePopUp: popupVisibleZona, setisVisiblePopUp: setPopupVisibleZona }}
              cancelarEdicion={() => setPopupVisibleZona(false)}
              dataMenu ={props.dataMenu}
              />
        )}

        </React.Fragment>
      </PortletBody>
    </>
  );
};

ComedorEditPage.propTypes = {
  titulo: PropTypes.string,
  modoEdicion: PropTypes.bool

}
ComedorEditPage.defaultProps = {
  titulo: "",
  modoEdicion: false
}

export default injectIntl(ComedorEditPage);
