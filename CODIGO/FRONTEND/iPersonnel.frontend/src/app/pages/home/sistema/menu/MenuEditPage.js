import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";
import Form, {
  Item,
  GroupItem,
  RequiredRule,
  PatternRule
} from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import SistemaRepositorioBuscar from "../../../../partials/components/SistemaRepositorioBuscar";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";

import PropTypes from 'prop-types'
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";

import { isNotEmpty, listarEstadoSimple, PatterRuler, listarEstado, listarIconos } from "../../../../../_metronic";
import { isRequired } from "../../../../../_metronic/utils/securityUtils";
import ColorBox from 'devextreme-react/color-box';
import ImageViewerSmall from "../../../../partials/content/ImageViewer/ImageViewerSmall";
import PopUpImageViewer from "../../../../partials/content/ImageViewer/PopUpImageViewer";

 
const MenuEditPage = props => {

  const { intl, modoEdicion, settingDataField, showPersonalizar } = props;
  const [estadoSimple, setEstadoSimple] = useState([]);
  //const perfil = useSelector(state => state.perfil.perfilActual);
  const [personalizar, setPersonalizar] = useState([]);
  const [iconos, setIconos] = useState([]);
  const classesEncabezado = useStylesEncabezado();
  const [isVisiblePopUpRepositorio, setisVisiblePopUpRepositorio] = useState(false);
  const [isVisiblePopUpImageViewer, setisVisiblePopUpImageViewer] = useState(false);
  
  var colorNuevoFondo = "";
  var colorNuevoBarraMenu = "";

  async function cargarCombos() {

   

    let estadoSimple = listarEstadoSimple();
    let icons = listarIconos();
    let personalizar = listarEstado();
    setEstadoSimple(estadoSimple);
    setIconos(icons);
    setPersonalizar(personalizar);
  }


  function grabar(e) {

    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (props.dataRowEditNew.esNuevoRegistro) {
        props.dataRowEditNew.ColorBarraMenu = isNotEmpty(colorNuevoBarraMenu) ? colorNuevoBarraMenu : props.valueColorBarraMenu;
        props.dataRowEditNew.ColorFondo = isNotEmpty(colorNuevoFondo) ? colorNuevoFondo : props.valueColorFondo;
        props.agregarMenu({ ...props.dataRowEditNew });
      } else {
        props.dataRowEditNew.ColorBarraMenu = isNotEmpty(colorNuevoBarraMenu) ? colorNuevoBarraMenu : props.valueColorBarraMenu;
        props.dataRowEditNew.ColorFondo = isNotEmpty(colorNuevoFondo) ? colorNuevoFondo : props.valueColorFondo;
        props.actualizarMenu({ ...props.dataRowEditNew });
      }
    }
  }

  const agregarPopupRepositorio = (repositorios) => {
    const { IdRepositorio, Descripcion } = repositorios[0];
    props.dataRowEditNew.IdRepositorio = IdRepositorio;
    props.dataRowEditNew.Repositorio = IdRepositorio + " - " + Descripcion;
  }


  function onValueChangedPersonalizar(e) {
    if (e.value === "S") {
      props.onValueChangedPersonalizar(true);
    }
    else {
      props.onValueChangedPersonalizar(false);
    }
  }

  function onValueChangedColorFondo(value) {
    if (isNotEmpty(value)) {
      colorNuevoFondo = value;
    }
  }

  function onValueChangedColorBarraMenu(value) {
    if (isNotEmpty(value)) {
      colorNuevoBarraMenu = value;
    }
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
              id="idButtonSave"
              icon="fa fa-save"
              type="default"
              hint="Grabar"
              onClick={grabar}
              disabled={!props.modoEdicion}
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
              onClick={props.cancelarEdicionPrincipal}
              visible={false}
            />
          </PortletHeaderToolbar>
        }>

      </PortletHeader>


      <PortletBody >
        <React.Fragment>
       

          <Form formData={props.dataRowEditNew} validationGroup="FormEdicion"  >
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

              <Item dataField="IdMenu"
                label={{ text: intl.formatMessage({ id: "COMMON.CODE" }) }}
                isRequired={true}
                visible={false}
                editorOptions={{
                  maxLength: 20,
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  readOnly: true
                }}
              />

              <Item dataField="Menu"
                isRequired={props.modoEdicion}
                label={{ text: intl.formatMessage({ id: "SYSTEM.MENU.MENU" }) }}
                colSpan={2}
                editorOptions={{
                  readOnly: !props.modoEdicion,
                  maxLength: 100,
                }}
              >
                <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} />
                <PatternRule pattern={PatterRuler.LETRAS_DESCRIPCION} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS" })} />
              </Item>

              <Item dataField="Descripcion"
                isRequired={false}
                label={{ text: intl.formatMessage({ id: "COMMON.DESCRIPTION" }) }}
                colSpan={2}
                editorOptions={{
                  readOnly: !props.modoEdicion,
                  maxLength: 500,
                  height: 50,
                  inputAttr: { 'style': 'text-transform: uppercase' },
                }}
              >
              </Item>

              <Item
                dataField="Ruta"
                label={{ text: intl.formatMessage({ id: "SYSTEM.MENU.ROUTE" }) }}
                isRequired={false}
                colSpan={2}
                editorOptions={{
                  readOnly: !props.modoEdicion,
                  maxLength: 100,
                }}
              > 
                <PatternRule pattern={props.TipoAplicacion === "ANDROID" ? PatterRuler.LETRAS_DESCRIPCION : PatterRuler.PATH } message={intl.formatMessage({ id: "COMMON.ENTER.PATH" })} />
              </Item>

              <Item dataField="Icono"
                isRequired={false}
                label={{ text: intl.formatMessage({ id: "SYSTEM.MENU.ICON" }) }}
                editorOptions={{
                  maxLength: 50,
                }}
              />

            <Item dataField="DescripcionIconoBase64"
                isRequired={false}
                label={{ text: intl.formatMessage({ id: "SYSTEM.MENU.IMAGE" }) }}
                editorOptions={{ 
                  value:isNotEmpty(props.dataRowEditNew.IconoBase64) ? intl.formatMessage({ id: "SYSTEM.MENUDATA.LOADEDICON" })  : "",
                  readOnly: true,
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
                      disabled: !props.modoEdicion,
                      onClick: () => {
                        setisVisiblePopUpImageViewer(true);
                      },
                    }
                  }]
                }}
              />

              <Item dataField="Orden"
                label={{ text: intl.formatMessage({ id: "SYSTEM.MENU.ORDER" }) }}
                isRequired={props.modoEdicion}
                dataType="numeric"
                editorOptions={{
                  readOnly: !props.modoEdicion,
                  maxLength: 4,
                }}>
                <RequiredRule message={intl.formatMessage({ id: "SYSTEM.MENU.ORDER.REQUIERD" })} />
                <PatternRule pattern={/[0-9]/} message={intl.formatMessage({ id: "SYSTEM.MENU.ORDER.NUMERIC" })} />
              </Item>

              <Item
                dataField="ColorBarraMenu"
                label={{ text: intl.formatMessage({ id: "SYSTEM.MENU.COLOR.BAR" }) }}
                editorOptions={{
                  readOnly: true,
                  maxLength: 10,
                }}
              >
                <ColorBox
                  readOnly={!props.modoEdicion}
                  defaultValue={props.valueColorBarraMenu}
                  applyValueMode="instantly"
                  onValueChanged={(e) => onValueChangedColorBarraMenu(e.value)}
                />
              </Item>

              <Item
                dataField="ColorFondo"
                label={{ text: intl.formatMessage({ id: "SYSTEM.MENU.COLOR.BACKGROUND" }) }}
                editorOptions={{
                  readOnly: true,
                  maxLength: 10,
                }}
              >
                <ColorBox
                  readOnly={!props.modoEdicion}
                  defaultValue={props.valueColorFondo}
                  applyValueMode="instantly"
                  onValueChanged={(e) => onValueChangedColorFondo(e.value)}
                />
              </Item>

              <Item
                dataField="Personalizar"
                label={{ text: intl.formatMessage({ id: "SYSTEM.MENU.PERSONALIZE" }) }}
                editorType="dxSelectBox"
                isRequired={props.modoEdicion}
                editorOptions={{
                  items: personalizar,
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                  readOnly: !props.modoEdicion,
                  onValueChanged: onValueChangedPersonalizar
                }}
              />

              <Item
                dataField="Activo"
                label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
                editorType="dxSelectBox"
                isRequired={props.modoEdicion}
                editorOptions={{
                  items: estadoSimple,
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                  disabled: props.dataRowEditNew.esNuevoRegistro ? true : false,
                  readOnly: !props.modoEdicion,
                }}
              />

              <Item
                dataField="IdModulo"
                visible={false}
              />
              <Item
                dataField="IdMenuPadre"
                visible={false} />
              <Item dataField="Nivel"
                visible={false}
                dataType="numeric" />



            </GroupItem>
            {showPersonalizar && <GroupItem itemType="group" colCount={2} colSpan={2}>
              <Item dataField="IdRepositorio" visible={false} />
              <Item
                colSpan={2}
                dataField="Repositorio"
                label={{ text: intl.formatMessage({ id: "SYSTEM.REPOSITORY" }), }}
                editorOptions={{
                  readOnly: !props.modoEdicion,
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
                        onClick: (evt) => {
                          setisVisiblePopUpRepositorio(true);
                        },
                      },
                    },
                  ],
                }}
              />

              <Item
                dataField="ConfigurarDatos"
                label={{ text: intl.formatMessage({ id: "SYSTEM.MENU.CONFIGUREDATA" }) }}
                isRequired={true}
                editorType="dxSelectBox"
                editorOptions={{
                  items: personalizar,
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                  readOnly: !props.modoEdicion
                }}
              />
            </GroupItem>}

          </Form>
        
          {isVisiblePopUpRepositorio && (
            <SistemaRepositorioBuscar
              selectData={agregarPopupRepositorio}
              showPopup={{ isVisiblePopUp: isVisiblePopUpRepositorio, setisVisiblePopUp: setisVisiblePopUpRepositorio }}
              cancelar={() => setisVisiblePopUpRepositorio(false)}
              uniqueId={"sistemaRepositorioBuscar"}
            />
          )
          }

        </React.Fragment>

          {/*** PopUp -> ImageViwer ****/}
          {isVisiblePopUpImageViewer && (
            <PopUpImageViewer
              showPopup={{ isVisiblePopUp: isVisiblePopUpImageViewer, setisVisiblePopUp: setisVisiblePopUpImageViewer }}
              cancelarEdicion={() => setisVisiblePopUpImageViewer(false)}
              selectionMode={"row"}
              dataRowEditNew = {props.dataRowEditNew}
            />
          )}
      </PortletBody>
    </>
  );
};
MenuEditPage.propTypes = {
  titulo: PropTypes.string,
  modoEdicion: PropTypes.bool,
  showButtons: PropTypes.bool,
  showAppBar: PropTypes.bool,

}
MenuEditPage.defaultProps = {
  titulo: "",
  modoEdicion: false,
  showButtons: true,
  showAppBar: true,
}
export default injectIntl(WithLoandingPanel(MenuEditPage));
