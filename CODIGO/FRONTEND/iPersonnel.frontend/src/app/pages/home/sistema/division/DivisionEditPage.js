import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import Form, {
  Item,
  GroupItem,
  EmptyItem,
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
import { isNotEmpty } from "../../../../../_metronic";
import { obtenerTodos as obtenerTodosPaises } from "../../../../api/sistema/pais.api";

import { listarEstadoSimple, listarEstado, PatterRuler } from "../../../../../_metronic";
import { isRequired, isModified } from "../../../../../_metronic/utils/securityUtils";
import AdministracionUnidadOrganizativaBuscar
  from "../../../../partials/components/AdministracionUnidadOrganizativaBuscar";


const DivisionEditPage = props => {

  const { intl, modoEdicion, settingDataField } = props;

  const [paises, setPaises] = useState([]);
  const [estadoSimple, setEstadoSimple] = useState([]);
  const [estados, setEstados] = useState([]);

  const [popupVisibleUnidad, setPopupVisibleUnidad] = useState(false);
  const classesEncabezado = useStylesEncabezado();

  async function cargarCombos() {
    let paises = await obtenerTodosPaises(0, 0);
    let estadoSimple = listarEstadoSimple();
    let estadosLista = listarEstado();
    setPaises(paises);
    setEstadoSimple(estadoSimple);
    setEstados(estadosLista);
  }

  function grabar(e) {
    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregarDivision(props.dataRowEditNew);
      } else {
        props.actualizarDivision(props.dataRowEditNew);
      }
    }
  }

  const selectUnidadOrganizativa = dataPopup => {
    //console.log(dataPopup);
    props.dataRowEditNew.IdUnidadOrganizativaBase = dataPopup.IdUnidadOrganizativa;
    props.dataRowEditNew.UnidadOrganizativaBase = dataPopup.UnidadOrganizativa;
    setPopupVisibleUnidad(false);
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
              useSubmitBehavior={true}
              disabled={!props.modoEdicion}
              validationGroup="FormEdicion"
              onClick={grabar}
              // visible={modoEdicion}
              visible={props.showButtons ? true : false}
            />
            &nbsp;
            <Button
              icon="fa fa-times-circle"
              type="normal"
              hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
              onClick={props.cancelarEdicion}
              disabled={!props.modoEdicion}
              visible={props.showButtons ? true : false}
            />

          </PortletHeaderToolbar>
        }
      />
      <PortletBody >
        <React.Fragment>
        
          <Form formData={props.dataRowEditNew} validationGroup="FormEdicion"  >
            <GroupItem itemType="group" colCount={2} colSpan={2}>
              <Item colSpan={2}>
                <AppBar position="static" className={classesEncabezado.secundario}>
                  <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                    <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                    {intl.formatMessage({ id: "DIVISIÓN" })}
                    </Typography>
                  </Toolbar>
                </AppBar>
              </Item>

              <Item
                dataField="IdPais"
                label={{ text: intl.formatMessage({ id: "SYSTEM.DIVISION.COUNTRY" }) }}
                editorType="dxSelectBox"
                isRequired={modoEdicion ? isRequired('IdPais', settingDataField) : false}
                editorOptions={{
                  readOnly: !(modoEdicion ? isModified('IdPais', settingDataField) : false),
                  items: paises,
                  valueExpr: "IdPais",
                  displayExpr: "Pais",
                  searchEnabled: true,
                }}
              />

              <Item
                dataField="Corporativo"
                label={{ text: "Corporativo" }}
                colSpan={2}
                editorType="dxSelectBox"
                isRequired={modoEdicion}
                editorOptions={{
                  items: estados,
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                  readOnly: !(modoEdicion ? (props.dataRowEditNew.esNuevoRegistro ? false : true) : false)
                }}
              />

              <Item dataField="IdDivision"
                label={{ text: intl.formatMessage({ id: "COMMON.CODE" }) }}
                isRequired={modoEdicion}
                editorOptions={{
                  maxLength: 20,
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  readOnly: !props.dataRowEditNew.esNuevoRegistro ? true : false
                }}
              >
                <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} />
                <PatternRule pattern={PatterRuler.LETRAS_NUMEROS_GUIONES} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS.NUMERIC" })} />
              </Item>

              <Item dataField="Division"
                isRequired={modoEdicion ? isRequired('Division', settingDataField) : false}
                label={{ text: intl.formatMessage({ id: "SYSTEM.DIVISION" }) }}
                colSpan={2}
                editorOptions={{
                  readOnly: !(modoEdicion ? isModified('Division', settingDataField) : false),
                  maxLength: 100,
                  inputAttr: { 'style': 'text-transform: uppercase' },
                }}
              >
                {/* {(isRequiredRule("Division")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={100} />} */}
                <PatternRule pattern={PatterRuler.LETRAS_DESCRIPCION} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS.NUMERIC" })} />
              </Item>

              <Item
                dataField="UnidadOrganizativaBase"
                isRequired={modoEdicion}
                label={{
                  text: intl.formatMessage({
                    id: "ADMINISTRATION.POSITION.ORGANIZATIONALUNIT"
                  })
                }}
                colSpan={2}
                editorOptions={{

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
                        disabled: !(modoEdicion ? (props.dataRowEditNew.esNuevoRegistro ? true : true) : false),
                        onClick: () => {
                          setPopupVisibleUnidad(true);
                        }
                      }
                    }
                  ]
                }}
              />

              <EmptyItem/>

              <Item
                dataField="Activo"
                label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
                colSpan={2}
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
              <Item dataField="IdClientePadre" visible={false} />
              <Item dataField="IdDivisionPadre" visible={false} />
              <Item dataField="IdUnidadOrganizativaBase" visible={false} />

            </GroupItem>
          </Form>
         
        </React.Fragment>

        {popupVisibleUnidad && (
          <AdministracionUnidadOrganizativaBuscar
            selectData={selectUnidadOrganizativa}
            showPopup={{
              isVisiblePopUp: popupVisibleUnidad,
              setisVisiblePopUp: setPopupVisibleUnidad
            }}
            cancelarEdicion={() => setPopupVisibleUnidad(false)}
            selectionMode={"single"}
            showCheckBoxesModes={"none"}
          />
        )}
      </PortletBody>
    </>
  );
};

DivisionEditPage.defaultProps = {
  showButtons: true
};

export default injectIntl(DivisionEditPage);
