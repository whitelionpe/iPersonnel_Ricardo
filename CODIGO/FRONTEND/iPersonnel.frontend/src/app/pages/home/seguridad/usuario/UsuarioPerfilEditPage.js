import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";//Multi-idioma
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
//import { listarEstadoSimple } from "../../../../api/sistema/entidad.api";
// import { serviceEntidad } from "../../../../api/sistema/entidad.api";
// import { DropDownBox } from 'devextreme-react';
// import { DataGrid, Column, Paging, Pager, FilterRow, HeaderFilter, FilterPanel, Selection, Scrolling } from "devextreme-react/data-grid";
// import { isNotEmpty, toAbsoluteUrl, dateFormat } from "../../../../../_metronic";
import { useStylesEncabezado } from "../../../../store/config/Styles";
import "../../../../store/config/styles.css";
import { listarEstadoSimple } from "../../../../../_metronic";
import { isRequired, isModified } from "../../../../../_metronic/utils/securityUtils";

import Form, {
  Item,
  SimpleItem,
  GroupItem,
  Label
} from 'devextreme-react/form';
import 'devextreme-react/text-area';
import SeguridadPerfilBuscar from "../../../../partials/components/SeguridadPerfilBuscar";


const UsuarioPerfilEditPage = props => {

  const { intl, accessButton, modoEdicion, settingDataField } = props;
  const [estadoSimple, setEstadoSimple] = useState([]);
  const classesEncabezado = useStylesEncabezado();
  //const [cmbEntidad, setCmbEntidad] = useState([]);
  const [isVisiblePopPerfil, setisVisiblePopPerfil] = useState(true);

  async function cargarCombos() {
    let estadoSimple = listarEstadoSimple();
    //let cmbEntidad = await serviceEntidad.obtenerTodos({ ImprimirFotocheck: "" });

    setEstadoSimple(estadoSimple);
    //setCmbEntidad(cmbEntidad);
  }

  function grabar(e) {

    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (props.dataRowEditNew.esNuevoRegistro) {

        for (let i = 0; i < props.gridBoxValue.length; i++) {
          props.dataRowEditNew.IdPerfil = props.gridBoxValue[i];
          props.agregarUsuarioPerfil(props.dataRowEditNew);
        }

      } else {
        props.actualizarUsuarioPerfil(props.dataRowEditNew);
      }
    }
  }


  function dataGrid_onSelectionChanged(e) {
    props.setGridBoxValue(e.selectedRowKeys.length && e.selectedRowKeys || []);
  }


  function agregarPerfiles(perfiles) {
    console.log("agregarPerfiles|perfiles:", perfiles);
    if (perfiles.length > 0) {
      props.agregarUsuarioPerfil(perfiles);

    } else {
      // "msj seleccione un perfil"
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


          {props.dataRowEditNew.esNuevoRegistro &&
            (
              <SeguridadPerfilBuscar
                dataSource={props.perfilesData}
                showPopup={{ isVisiblePopUp: isVisiblePopPerfil, setisVisiblePopUp: setisVisiblePopPerfil }}
                cancelar={() => setisVisiblePopPerfil(false)}
                agregar={agregarPerfiles}
                selectionMode={"multiple"}
                showButton={true}
                setModoEdicion={props.setModoEdicion}
              />

            )}


          {!props.dataRowEditNew.esNuevoRegistro && (
            <>
              <Form formData={props.dataRowEditNew} validationGroup="FormEdicion" >
                <GroupItem itemType="group" colCount={2} colSpan={2}>
                  <Item colSpan={2}>
                    <AppBar position="static" className={classesEncabezado.secundario}>
                      <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                        <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                          {intl.formatMessage({ id: "SECURITY.PROFILE.USER.ADD" })}
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
                  />


                  <Item dataField="Perfil"
                    label={{ text: intl.formatMessage({ id: "ACCESS.PROFILE" }) }}
                    isRequired={modoEdicion ? isRequired('Perfil', settingDataField) : false}
                    colSpan={2}
                    editorOptions={{
                      maxLength: 100,
                      inputAttr: { 'style': 'text-transform: uppercase' },
                      readOnly: !props.dataRowEditNew.esNuevoRegistro ? true : false
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
                </GroupItem>
              </Form>
            </>
          )}


        </React.Fragment>
      </PortletBody>
    </>
  );
};

export default injectIntl(UsuarioPerfilEditPage);
