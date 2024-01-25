import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import Form, { Item, GroupItem } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";
import { listarEstado } from "../../../../../_metronic";


const MenuDatosEditPage = props => {

  const { intl } = props;

  const [estadoSimple, setEstadoSimple] = useState([]);
  const classesEncabezado = useStylesEncabezado();
  async function cargarCombos() {

    let estadoActivo = listarEstado();
    setEstadoSimple(estadoActivo);
  }

  function grabar(e) {

    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregarMenuDatos(props.dataRowEditNew);
      } else {
        props.actualizarMenuDatos(props.dataRowEditNew);
      }
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
      <PortletBody >
        <React.Fragment>
         

            <Form formData={props.dataRowEditNew} validationGroup="FormEdicion" >
              <GroupItem itemType="group" colCount={2} colSpan={2}>
              <Item colSpan={2}>
                <AppBar position="static" className={classesEncabezado.secundario}>
                  <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                    <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                    {intl.formatMessage({ id: "SYSTEM.MENUDATA.CONFIGFORM" })}
                    </Typography>
                  </Toolbar>
                </AppBar>
              </Item>

                <Item
                  dataField="Campo"
                  isRequired={true}
                  label={{ text: intl.formatMessage({ id: "SYSTEM.MENUDATA.CONTRYSITE" }) }}
                  colSpan={2}
                  editorOptions={{
                    maxLength: 100,
                    disabled: !props.dataRowEditNew.esNuevoRegistro ? true : false,
                    //inputAttr: { style: "text-transform: uppercase" }
                  }}
                />
                <Item
                  dataField="Descripcion"
                  label={{ text: intl.formatMessage({ id: "SYSTEM.MENUDATA.DESCRIPTION" }) }}
                  isRequired={true}
                  colSpan={2}
                  editorOptions={{
                    maxLength: 500,
                    inputAttr: { style: "text-transform: uppercase" },
                    height: 45
                  }}
                />

                <Item dataField="Obligatorio"
                  label={{
                    text: "Check",
                    visible: false
                  }}
                  editorType="dxCheckBox"
                  //colSpan={2}
                  editorOptions={{
                    readOnly: props.modoEdicion,
                    text: intl.formatMessage({ id: "SYSTEM.MENUDATA.ISMANDATORY" }),
                    width: "100%"
                  }}
                />

                <Item dataField="Modificable"
                  label={{
                    text: "Check",
                    visible: false
                  }}
                  editorType="dxCheckBox"
                  //colSpan={2}
                  editorOptions={{
                    readOnly: props.modoEdicion,
                    text: intl.formatMessage({ id: "SYSTEM.MENUDATA.ISMODIFIABLE" }),
                    width: "100%"
                  }}
                />
                {/*  <Item
                                dataField="Obligatorio"
                                label={{ text: intl.formatMessage({ id: "SYSTEM.MENUDATA.ISMANDATORY" })  }}
                                editorType="dxSelectBox"
                                isRequired={true}
                                editorOptions={{
                                    items: estadoSimple,
                                    valueExpr: "Valor",
                                    displayExpr: "Descripcion",
                                    //disabled: props.dataRowEditNew.esNuevoRegistro ? true : false
                                }}
                            /> 
                            <Item
                                dataField="Modificable"
                                label={{ text: intl.formatMessage({ id: "SYSTEM.MENUDATA.ISMODIFIABLE" }) }}
                                editorType="dxSelectBox"
                                isRequired={true}
                                editorOptions={{
                                    items: estadoSimple,
                                    valueExpr: "Valor",
                                    displayExpr: "Descripcion",
                                    //disabled: props.dataRowEditNew.esNuevoRegistro ? true : false
                                }}
                            /> */}
              </GroupItem>
            </Form>
          
        </React.Fragment>
      </PortletBody>
    </>
  );

};

export default injectIntl(MenuDatosEditPage);
