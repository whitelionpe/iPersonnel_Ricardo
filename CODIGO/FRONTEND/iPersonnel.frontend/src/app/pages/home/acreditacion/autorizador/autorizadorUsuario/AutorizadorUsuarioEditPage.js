import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { useSelector } from "react-redux";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";

import { DataGrid, Column, Paging, Pager, FilterRow, HeaderFilter, Button as ColumnButton } from "devextreme-react/data-grid";
import { isNotEmpty, toAbsoluteUrl, listarEstadoSimple } from "../../../../../../_metronic";
import { useStylesEncabezado } from "../../../../../store/config/Styles";
import "../../../../../store/config/styles.css";
import Form, { Item, SimpleItem, GroupItem } from 'devextreme-react/form';
import 'devextreme-react/text-area';
import { handleInfoMessages } from "../../../../../store/ducks/notify-messages";
import SeguridadUsuarioBuscar from "../../../../../partials/components/SeguridadUsuarioBuscar";
import { custom } from "devextreme/ui/dialog";
import { servicePerfil } from '../../../../../api/seguridad/perfil.api';


const AutorizadorUsuarioEditPage = props => {

  const { intl, modoEdicion } = props;
  const { IdCliente } = useSelector(state => state.perfil.perfilActual);

  const [estadoSimple, setEstadoSimple] = useState([]);
  //const [cmbEntidad, setCmbEntidad] = useState([]);
  const [cmbPerfiles, setcmbPerfiles] = useState([]);

  const classesEncabezado = useStylesEncabezado();
  const [isVisiblePopUpUsuario, setisVisiblePopUpUsuario] = useState(false);
  const [Filtros, setFiltros] = useState({ Filtro: "1" });


  async function cargarCombos() {
    let estadoSimple = listarEstadoSimple();
    //let cmbEntidad = await serviceEntidad.obtenerTodos({ ImprimirFotocheck: "" });
    let cmbPerfil = await servicePerfil.obtenerTodosAcreditacion({ IdCliente: IdCliente, IdPerfil: '%' });

    setEstadoSimple(estadoSimple);
    setcmbPerfiles(cmbPerfil);
  }

  function grabar(e) {
    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (props.dataRowEditNew.esNuevoRegistro) {
        let newArray = [...props.grillaAutorizadorUsuario];
        if (newArray.length == 0) {
          handleInfoMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), intl.formatMessage({ id: "ADMINISTRATION.PERSON.REGIME.VALIDATION.MESSAGE.PERSON" }));
          return;
        }
        newArray.map(x => {
          x.IdPerfil = props.dataRowEditNew.IdPerfil;
        });
        props.agregarRegistro(newArray);
      } else {
        props.actualizarRegistro(props.dataRowEditNew);
      }
    }
  }

  const agregarDatosGrilla = (usuarios) => {
    props.setGrillaAutorizadorUsuario([]);
    let newArray = [...props.grillaAutorizadorUsuario];

    usuarios.map(async (data) => {
      //Apellido Nombre
      let { IdUsuario, NombreCompleto, TipoDocumento, Documento, Activo
      } = data;

      let foundIndex = newArray.findIndex(x => x.IdUsuario == IdUsuario);

      if (foundIndex == -1) {
        newArray.push({
          IdUsuario, NombreCompleto, TipoDocumento, Documento, Activo
        });
        newArray.map((x, i) => x.RowIndex = i + 1);
      }

    });

    props.setGrillaAutorizadorUsuario(newArray);
  };

  const eliminarRegistro = (evt) => {
    let data = evt.row.data;

    let dialog = custom({
      showTitle: false,
      messageHtml: intl.formatMessage({ id: "ALERT.REMOVE" }),
      buttons: [
        {
          text: "Yes",
          onClick: (e) => {
            let newArray = props.grillaAutorizadorUsuario.filter(x => x.IdUsuario != data.IdUsuario);

            newArray.map((x, i) => {
              x.RowIndex = i + 1;
            });
            props.setGrillaAutorizadorUsuario(newArray);
          }
        },
        { text: "No", },
      ]
    });
    dialog.show();

  };




  function avatarRender() {
    const { Foto } = props.dataRowEditNew
    return (
      <img src={isNotEmpty(Foto) ? Foto : toAbsoluteUrl("/media/users/default.jpg")} className="form-avatar" />
    );
  }

  function onCellPrepared(e) {
    if (e.rowType === 'data') {
      if (e.data.Activo === 'N') {
        e.cellElement.style.color = 'red';
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
            {props.dataRowEditNew.esNuevoRegistro && (
              <Button
                icon="group"
                type="default"
                hint={intl.formatMessage({ id: "ACCESS.PROFILE.ADD" })}
                useSubmitBehavior={true}
                onClick={function (evt) {
                  setFiltros({ ...Filtros, IdCliente })
                  setisVisiblePopUpUsuario(true);
                }}
              />
            )}
            &nbsp;
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

          {props.dataRowEditNew.esNuevoRegistro &&
            (
              <Form formData={props.dataRowEditNew} validationGroup="FormEdicion" >
                <GroupItem itemType="group" colCount={2} colSpan={2}>
                  <Item colSpan={2}>
                    <AppBar position="static" className={classesEncabezado.secundario}>
                      <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                        <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                          {intl.formatMessage({ id: "SECURITY.USER.ADD" })}
                        </Typography>
                      </Toolbar>
                    </AppBar>
                  </Item>

                  <Item
                    dataField="IdPerfil"
                    label={{ text: intl.formatMessage({ id: "SECURITY.USER.PROFILES" }) }}
                    editorType="dxSelectBox"
                    colSpan={1}
                    isRequired={modoEdicion}
                    editorOptions={{
                      items: cmbPerfiles,
                      valueExpr: "IdPerfil",
                      displayExpr: "Perfil"
                    }}
                  />

                  <Item colSpan={1} />

                  <Item
                    colSpan={2}
                  >

                    <>
                      <DataGrid
                        //dataSource={props.usuariosData}
                        dataSource={props.grillaAutorizadorUsuario}
                        showBorders={true}
                        keyExpr="IdUsuario"
                        focusedRowEnabled={true}
                        onCellPrepared={onCellPrepared}
                      //remoteOperations={true}
                      //hoverStateEnabled={true}
                      //selectedRowKeys={props.gridBoxValue}
                      //onSelectionChanged={(e => dataGrid_onSelectionChanged(e))}
                      //height="100%"
                      >
                        {/* <Selection mode="multiple" /> */}
                        <FilterRow visible={false} />
                        <HeaderFilter visible={false} />
                        <Column dataField="IdCliente" visible={false} />
                        <Column dataField="IdUsuario" caption={intl.formatMessage({ id: "SECURITY.PROFILE.USER" })} width={"20%"} allowHeaderFiltering={false} allowSorting={false} />
                        <Column dataField="NombreCompleto" caption={intl.formatMessage({ id: "SECURITY.PROFILE.USER.USERNAME" })} allowHeaderFiltering={false} allowSorting={true} width={"40%"}
                        // allowSorting={false}
                        />
                        <Column dataField="TipoDocumento" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.TYPE" })} width={"10%"} allowSorting={false} allowSearch={false} allowFiltering={false} />
                        <Column dataField="Documento" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.DOCUMENT" })} width={"10%"} />
                        <Column dataField="Mensaje" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.REGIME.MESSAGE" })} width={"20%"} />
                        <Column type="buttons" width={70} visible={props.showButtons}
                        // visible={props.dataRowEditNew.esNuevoRegistro}
                        >
                          <ColumnButton icon="trash" hint={intl.formatMessage({ id: "ACTION.REMOVE", })} onClick={eliminarRegistro} />
                        </Column>
                        <Paging defaultPageSize={9999} />
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
                <Form formData={props.dataRowEditNew} validationGroup="FormEdicion">
                  {/*  <GroupItem itemType="group" colCount={3} colSpan={3}> */}
                  <Item colSpan={3}>
                    <AppBar position="static" className={classesEncabezado.secundario}>
                      <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                        <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                          {intl.formatMessage({ id: "COMMON.DETAIL" })}
                        </Typography>
                      </Toolbar>
                    </AppBar>
                  </Item>

                  <GroupItem cssClass="first-group" colCount={4} colSpan={4}>

                    <GroupItem itemType="group" colCount={3} colSpan={3}>
                      <Item dataField="IdUsuario"
                        label={{ text: intl.formatMessage({ id: "COMMON.CODE" }) }}
                        colSpan={3}
                        isRequired={true}
                        editorOptions={{
                          readOnly: true
                        }}
                      />

                      <Item dataField="Nombres"
                        label={{ text: intl.formatMessage({ id: "SECURITY.USER.NAMES" }) }}
                        colSpan={3}
                        isRequired={true}
                        editorOptions={{
                          readOnly: true
                        }}
                      />
                      <Item dataField="Apellidos"
                        label={{ text: intl.formatMessage({ id: "SECURITY.USER.SURNAMES" }) }}
                        colSpan={3}
                        isRequired={true}
                        editorOptions={{
                          readOnly: true
                        }}
                      />

                    </GroupItem>

                    <GroupItem colSpan={1}>
                      <SimpleItem
                        render={avatarRender}
                      >
                      </SimpleItem>
                    </GroupItem>

                    <Item
                      dataField="Alias"
                      label={{ text: intl.formatMessage({ id: "SECURITY.PROFILE.USER.DOCUMENTTYPE" }) }}
                      colSpan={2}
                      isRequired={true}
                      editorOptions={{
                        readOnly: true
                      }}
                    />

                    <Item
                      dataField="Documento"
                      label={{ text: intl.formatMessage({ id: "SECURITY.USER.DOCUMENTNUMBER" }) }}
                      colSpan={2}
                      isRequired={true}
                      editorOptions={{
                        readOnly: true
                      }}
                    />

                    <Item dataField="Correo"
                      label={{ text: intl.formatMessage({ id: "SECURITY.PROFILE.USER.EMAILADRESS" }) }}
                      colSpan={2}
                      editorOptions={{
                        readOnly: true
                      }}
                    />

                    <Item dataField="Telefono"
                      label={{ text: intl.formatMessage({ id: "SECURITY.USER.TELEPHONE" }) }}
                      colSpan={2}
                      editorOptions={{
                        readOnly: true
                      }}
                    />

                    <Item colSpan={2} />

                    <Item
                      dataField="Activo"
                      label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
                      editorType="dxSelectBox"
                      isRequired={true}
                      colSpan={2}
                      editorOptions={{
                        items: estadoSimple,
                        valueExpr: "Valor",
                        displayExpr: "Descripcion"
                      }}
                    />


                  </GroupItem>
                </Form>
              </>
            )}

          <SeguridadUsuarioBuscar
            showPopup={{ isVisiblePopUp: isVisiblePopUpUsuario, setisVisiblePopUp: setisVisiblePopUpUsuario }}
            ///cancelar={() => setisVisiblePopUpUsuario(false)}
            agregar={agregarDatosGrilla}
            selectionMode={"multiple"}
            uniqueId={"popupUsuariosBuscar"}
          />

        </React.Fragment>
      </PortletBody>
    </>
  );
};

export default injectIntl(AutorizadorUsuarioEditPage);
