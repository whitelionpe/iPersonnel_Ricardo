import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { useSelector } from "react-redux";
import Form, { Item, GroupItem, } from "devextreme-react/form";
import { Button } from "devextreme-react";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";

import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import { useStylesEncabezado } from "../../../../../store/config/Styles";
import { isRequired } from "../../../../../../_metronic/utils/securityUtils";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";
import SeguridadUsuarioBuscar from "../../../../../partials/components/SeguridadUsuarioBuscar";
import './UsuarioCompaniaEditPage.css';

const UsuarioCompaniaEditPage = props => {

  const { intl, modoEdicion, settingDataField, accessButton, selectedIndex } = props;
  const classesEncabezado = useStylesEncabezado();
  const [repositoryIndex, setRepositoryIndex] = useState({});
  //POPUP USUARIO
  const [isVisiblePopUpUsuario, setisVisiblePopUpUsuario] = useState(false);


  //::::::::::::::::::::::: ACCION: AGREGAR USUARIOS
  function grabar(e) {
    let result = e.validationGroup.validate();
    if (result.isValid) {
      props.dataRowEditNew.IdCompania = selectedIndex.IdCompania;
      props.agregarUsuarioCompania(props.dataRowEditNew);
    }
  }

  //POPUP: BUSCAR USUARIOS PARA ASIGNAR
  const agregarUsuario = (usuarios) => {
    let { IdUsuario, NombreCompleto } = usuarios[0];
    props.dataRowEditNew.IdUsuario = IdUsuario;
    props.dataRowEditNew.NombreCompleto = NombreCompleto;
  };

  function cancelar() {
    props.cancelarRegistroUsuario(repositoryIndex)
  }
  //::::::::::::::::::::::: ACCION: EFFECTS

  useEffect(() => {
    if (selectedIndex) {
      const { Contratista, IdCompania, Compania } = selectedIndex;
      setRepositoryIndex(selectedIndex)
      props.dataRowEditNew.IdCompania = IdCompania;
      props.dataRowEditNew.Compania = Compania;
      props.dataRowEditNew.Contratista = Contratista;

    }
  }, [selectedIndex]);

  return (
    <>
      <HeaderInformation data={props.getInfo()} visible={true} labelLocation={'left'} colCount={6}
        toolbar={
          <PortletHeader
            title={""}
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
                  onClick={cancelar}
                />
              </PortletHeaderToolbar>
            }
          />
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
                      {intl.formatMessage({ id: "SECURITY.USER.ADD" })}
                    </Typography>
                  </Toolbar>
                </AppBar>
              </Item>
              <Item dataField="IdCompania" visible={false} />
              <Item dataField="IdUsuario" visible={false} />
              <Item
                colSpan={1}
                dataField="NombreCompleto"
                isRequired={modoEdicion ? isRequired('IdUsuario', settingDataField) : false}
                label={{ text: intl.formatMessage({ id: "AUTH.INPUT.USERNAME" }), }}
                visible={true}
                editorOptions={{
                  readOnly: true,
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
                        disabled: false,
                        onClick: (evt) => {
                          setisVisiblePopUpUsuario(true);
                        },
                      },
                    },
                  ],
                }}
              />
              <Item />
              <Item dataField="FechaInicio"
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.STARTDATE" }) }}
                isRequired={true}
                editorType="dxDateBox"
                editorOptions={{
                  type: "date",
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  displayFormat: "dd/MM/yyyy",
                }}
              />
              <Item dataField="FechaFin"
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.ENDDATE" }) }}
                isRequired={true}
                editorType="dxDateBox"
                editorOptions={{
                  type: "date",
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  displayFormat: "dd/MM/yyyy",
                }}
              />
              <Item dataField="IdCliente" visible={false} />
            </GroupItem>
          </Form>

          {/* BUSCAR USUARIOS */}
          {isVisiblePopUpUsuario && (
            <SeguridadUsuarioBuscar
              showPopup={{ isVisiblePopUp: isVisiblePopUpUsuario, setisVisiblePopUp: setisVisiblePopUpUsuario }}
              agregar={agregarUsuario}
              selectionMode={"row"}
              uniqueId={"popupUsuariosBuscar"}
            />
          )}

        </React.Fragment>
      </PortletBody>
    </>
  );
};

export default injectIntl(UsuarioCompaniaEditPage);
