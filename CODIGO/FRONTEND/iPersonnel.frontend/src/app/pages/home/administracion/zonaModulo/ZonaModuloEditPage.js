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
import PropTypes from 'prop-types'

import { listarEstadoSimple, PatterRuler } from "../../../../../_metronic";
import { isRequired, isModified } from "../../../../../_metronic/utils/securityUtils";
import SimpleDropDownBoxGridCharge from '../../../../partials/components/SimpleDropDownBoxGrid/SimpleDropDownBoxGridCharge';
import { obtenerTodos as listarModulos } from "../../../../api/sistema/modulo.api";

import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";


const ZonaModuloEditPage = props => {
  const { intl,modoEdicion,accessButton,settingDataField,setLoading} = props;
  const perfil = useSelector(state => state.perfil.perfilActual);

  const [estadoSimple, setEstadoSimple] = useState([]);
  const classesEncabezado = useStylesEncabezado();

  const [modulos, setModulos] = useState([]);

  const [isChangeCmbService, setIsChangeCmbService] = useState(false);


  async function cargarCombos() {
    
    setLoading(true);
    let estadoSimple = listarEstadoSimple();
    setEstadoSimple(estadoSimple);
      //Listar Módulos
      await listarModulos().then(response => {
        console.log("listarModulos", response);
        // setModulos(response.map(x => ({ IdModulo: x.IdModulo, Modulo: x.Modulo, Check: false })));
       setModulos(response);

      }).finally(() => {});

      setLoading(false);
  }

  function grabar(e) {
    let result = e.validationGroup.validate();
    if (result.isValid) {

      // console.log("modulosSeleccionados:",modulosSeleccionados);
      if (isChangeCmbService) {
       let strModulos = props.modulosSeleccionados.join('|');
       props.dataRowEditNew.Modulos = strModulos
      }

      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregarZona(props.dataRowEditNew);
      } else {
        props.actualizarZona(props.dataRowEditNew);
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
              id="idButtonGrabarTview"
              icon="fa fa-save"
              type="default"
              hint={intl.formatMessage({ id: "ACTION.RECORD" })}
              disabled={!props.modoEdicion}
              onClick={grabar}
              useSubmitBehavior={true}
              validationGroup="FormEdicion"
              visible={false} 
              />
              &nbsp;
              <Button
              icon="fa fa-times-circle"
              type="normal"
              hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
              disabled={!props.modoEdicion}
              onClick={props.cancelarEdicion} 
              visible={false} 
              />

          </PortletHeaderToolbar>
        }
      />
      <PortletBody >
        <React.Fragment>
          <Form formData={props.dataRowEditNew} validationGroup="FormEdicion"  >
            <GroupItem itemType="group" colCount={2} colSpan={2}>
              <Item colSpan={2} visible={props.showAppBar}>
                <AppBar position="static" className={classesEncabezado.secundario}>
                  <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                    <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                      {intl.formatMessage({ id: "ADMINISTRATION.ZONE" })}
                    </Typography>
                  </Toolbar>
                </AppBar>
              </Item>

              <Item dataField="IdZona"
                label={{ text: intl.formatMessage({ id: "COMMON.CODE" }) }}
                colSpan={2}
                editorOptions={{
                  readOnly: !props.modoEdicion,
                  maxLength: 20,
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  readOnly: true
                }}
              />

            <Item dataField="Zona"
                isRequired={props.modoEdicion}
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.ZONE" }) }}
                colSpan={2}
                editorOptions={{
                  readOnly: !props.modoEdicion,
                  maxLength: 100,
                  inputAttr: { 'style': 'text-transform: uppercase' },
                }}
                >
                {(isRequiredRule("Zona")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={100} />}
                <PatternRule pattern={PatterRuler.LETRAS_DESCRIPCION} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS" })} />
              </Item> 

              <Item
                dataField="Modulos"
                colSpan={2}
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.MODULES" }) }}
              >
                <SimpleDropDownBoxGridCharge
                  id="sdbModulo"
                  ColumnDisplay={"Modulo"}
                  ColumnValue={"IdModulo"}
                  placeholder={"Select a value.."}
                  SelectionMode={"multiple"}
                  dataSource={modulos}
                  Columnas={[{ dataField: "Modulo", caption: intl.formatMessage({ id: "ADMINISTRATION.MODULES" }), width: '100%' }]}
                  setSeleccionados={props.setModulosSeleccionados}
                  Seleccionados={props.modulosSeleccionados}
                  pageSize={10}
                  pageEnabled={true}
                  dataCheck={props.dataCheck}
                  setDatacheck={props.setDatacheck}
                  setIsChangeCmbService={setIsChangeCmbService}
                  readOnly={!props.modoEdicion}
                /> 

              </Item>

            

               <Item
                dataField="Activo"
                label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
                editorType="dxSelectBox"
                isRequired={props.modoEdicion}
                editorOptions={{
                  readOnly: !props.modoEdicion,
                  items: estadoSimple,
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                  disabled: props.dataRowEditNew.esNuevoRegistro ? true : false
                }}
              /> 
              {/* <Item dataField="IdCliente" visible={false} />
              <Item dataField="IdDivision" visible={false} />
              <Item dataField="IdZonaPadre" visible={false} /> */}

            </GroupItem>
          </Form>
        </React.Fragment>
      </PortletBody>
    </>
  );
};
ZonaModuloEditPage.propTypes = {
  titulo: PropTypes.string,
  modoEdicion: PropTypes.bool,
  showButtons: PropTypes.bool,
  showAppBar: PropTypes.bool,

}
ZonaModuloEditPage.defaultProps = {
  titulo: "",
  modoEdicion: false,
  showButtons: true,
  showAppBar: true,
}


export default injectIntl(WithLoandingPanel(ZonaModuloEditPage));
