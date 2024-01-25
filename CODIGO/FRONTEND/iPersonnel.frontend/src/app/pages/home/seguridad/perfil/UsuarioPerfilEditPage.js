import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";//Multi-idioma
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
//import { listarEstadoSimple } from "../../../../api/sistema/entidad.api";
import { serviceEntidad } from "../../../../api/sistema/entidad.api";
import { DataGrid, Column, Paging, Pager, FilterRow, HeaderFilter, Selection, Scrolling } from "devextreme-react/data-grid";
import { isNotEmpty, toAbsoluteUrl, listarEstadoSimple } from "../../../../../_metronic";
import { useStylesEncabezado } from "../../../../store/config/Styles";
import "../../../../store/config/styles.css";

import Form, {
  Item,
  SimpleItem,
  GroupItem,
  Label
} from 'devextreme-react/form';
import 'devextreme-react/text-area';


const UsuarioPerfilEditPage = props => {

  const { intl } = props;
  const [estadoSimple, setEstadoSimple] = useState([]);
  const classesEncabezado = useStylesEncabezado();
  //const [cmbEntidad, setCmbEntidad] = useState([]);

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
          props.dataRowEditNew.IdUsuario = props.gridBoxValue[i];
          props.agregarRegistro(props.dataRowEditNew);
        }

      } else {
        props.actualizarRegistro(props.dataRowEditNew);
      }
    }
  }

  function dataGrid_onSelectionChanged(e) {
    props.setGridBoxValue(e.selectedRowKeys.length && e.selectedRowKeys || []);
  }

  function avatarRender() {
    const { Foto } = props.dataRowEditNew
    return (
      <img src={isNotEmpty(Foto) ? Foto : toAbsoluteUrl("/media/users/default.jpg")} className="form-avatar" />
    );
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

            {/* <Button
              icon="fa fa-save"
              type="default"
              hint={intl.formatMessage({ id: "ACTION.RECORD" })}
              onClick={grabar}
              useSubmitBehavior={true}
              validationGroup="FormEdicion"
            /> */}

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
                    colSpan={2}
                  >
                    <>
                      <DataGrid
                        dataSource={props.usuariosData}
                        showBorders={true}
                        keyExpr="IdUsuario"
                        focusedRowEnabled={true}
                        remoteOperations={true}
                        hoverStateEnabled={true}
                        selectedRowKeys={props.gridBoxValue}
                        onSelectionChanged={(e => dataGrid_onSelectionChanged(e))}
                        height="100%"
                      >
                        <Selection mode="multiple" />
                        <FilterRow visible={true} />
                        <HeaderFilter visible={false} />
                        <Column dataField="IdCliente" visible={false} />
                        <Column dataField="IdUsuario" caption={intl.formatMessage({ id: "SECURITY.PROFILE.USER" })} width={"30%"} allowHeaderFiltering={true} allowSorting={false} />
                        <Column dataField="UserName" caption={intl.formatMessage({ id: "SECURITY.PROFILE.USER.USERNAME" })} allowHeaderFiltering={true} allowSorting={true} width={"50%"}
                        />
                        <Paging defaultPageSize={10} />
                        <Pager showPageSizeSelector={false} />
                      </DataGrid>
                    </>

                  </Item>

                </GroupItem>
              </Form>

            )}

          {!props.dataRowEditNew.esNuevoRegistro &&
            (
              <>
                <Form
                  formData={props.dataRowEditNew} validationGroup="FormEdicion"
                >

                  <Item colSpan={2}>
                    <AppBar position="static" className={classesEncabezado.secundario}>
                      <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                        <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                          {intl.formatMessage({ id: "SECURITY.PROFILE.USER.ADD" })}
                        </Typography>
                      </Toolbar>
                    </AppBar>
                  </Item>

                  <GroupItem cssClass="first-group" colCount={4}>
                    <SimpleItem
                      render={avatarRender}
                    >
                    </SimpleItem>

                    <GroupItem colSpan={3}>
                      <SimpleItem dataField="IdUsuario"
                        label={{ text: intl.formatMessage({ id: "SECURITY.PROFILE.USER" }) }}
                        editorOptions={{
                          readOnly: true
                        }}
                      />

                      <SimpleItem dataField="Nombres"
                        label={{ text: intl.formatMessage({ id: "SECURITY.PROFILE.USER.USERNAME" }) }}
                        editorOptions={{
                          readOnly: true
                        }}
                      />
                      <SimpleItem dataField="Apellidos"
                        label={{ text: intl.formatMessage({ id: "SECURITY.PROFILE.USER.LASTNAME" }) }}
                        editorOptions={{
                          readOnly: true
                        }}
                      />

                    </GroupItem>
                  </GroupItem>

                  <GroupItem cssClass="second-group" colCount={2}>
                    <GroupItem>
                      <SimpleItem dataField="Alias"
                        label={{ text: intl.formatMessage({ id: "SECURITY.PROFILE.USER.DOCUMENTTYPE" }) }}
                        editorOptions={{
                          readOnly: true
                        }}
                      />
                      <SimpleItem dataField="Documento"
                        label={{ text: intl.formatMessage({ id: "SECURITY.PROFILE.USER.DOCUMENT" }) }}
                        editorOptions={{
                          readOnly: true
                        }}
                      />
                      <SimpleItem dataField="Correo"
                        label={{ text: intl.formatMessage({ id: "SECURITY.PROFILE.USER.EMAILADRESS" }) }}
                        editorOptions={{
                          readOnly: true
                        }}
                      />

                      <Item
                        dataField="Activo"
                        label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
                        editorType="dxSelectBox"
                        isRequired={true}
                        editorOptions={{
                          items: estadoSimple,
                          valueExpr: "Valor",
                          displayExpr: "Descripcion",
                          readOnly: true
                        }}
                      />

                    </GroupItem>
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
