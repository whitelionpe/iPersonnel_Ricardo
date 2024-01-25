import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
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

import { obtenerTodos as obtenerTodosCategoria } from "../../../../api/administracion/categoria.api";
import { obtenerTodos as obtenerTodosTipoDocumento, obtenerTodosPorPais } from "../../../../api/sistema/tipodocumento.api";
import { obtenerTodos as obtenerTodosPais } from "../../../../api/sistema/pais.api";

import { listarEstadoSimple, listarEstado, PatterRuler } from "../../../../../_metronic";
import { isRequired, isModified } from "../../../../../_metronic/utils/securityUtils";
import AdministracionCompaniaBuscar from "../../../../partials/components/AdministracionCompaniaBuscar";


const CompaniaEditPage = props => {
  const { intl, modoEdicion, settingDataField, accessButton, dataRowEditNew } = props;
  const [estadoRegistro, setEstadoRegistro] = useState([]);

  const classesEncabezado = useStylesEncabezado();
  const [popupVisibleCompania, setPopupVisibleCompania] = useState(false);

  async function cargarCombos() {
    let estadoRegistro = listarEstado();
    setEstadoRegistro(estadoRegistro);
  }

  function grabar(e) {

    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (dataRowEditNew.esNuevoRegistro) {
        props.agregarCompania(dataRowEditNew);
      } 
      /* else {
        props.actualizarCompania(dataRowEditNew);
      } */
    }
  }

  /*   const selectCompania = dataPopup => {
      const { IdCompania, Compania } = dataPopup[0];
      dataRowEditNew.IdCompania = IdCompania;
      dataRowEditNew.Compania = Compania;
      setPopupVisibleCompania(false);
    } */

  const selectCompania = (dataPopup) => {
    const { IdCompania,
      Compania,
      Alias,
      Direccion,
      Contratista,
      TipoDocumento,
      Documento,
      Categoria,
      Logo,
      Pais,
      Activo
    } = dataPopup[0];
    dataRowEditNew.IdCompania = IdCompania;
    dataRowEditNew.Compania = Compania;
    dataRowEditNew.Alias = Alias;
    dataRowEditNew.Direccion = Direccion;
    dataRowEditNew.Contratista = Contratista;
    dataRowEditNew.TipoDocumento = TipoDocumento;
    dataRowEditNew.Documento = Documento;
    dataRowEditNew.Categoria = Categoria;
    dataRowEditNew.Logo = Logo;
    dataRowEditNew.Pais = Pais;
    dataRowEditNew.Activo = Activo;
    setPopupVisibleCompania(false);
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
              visible={props.modoEdicion}
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

              <Item dataField="IdCompania" visible={false} />

              <Item
                dataField="Compania"
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.COMPANY" }) }}
                isRequired={true}
                editorOptions={{
                  readOnly: !(modoEdicion ? isModified('Compania', settingDataField) : false),
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
                      disabled: false,
                      onClick: () => {
                        setPopupVisibleCompania(true);
                      },
                    }
                  }]
                }}
              />


              <Item
                dataField="ControlarAsistencia"
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.COMPANY.CONTROLATTENDACE" }) }}
                editorType="dxSelectBox"
                isRequired={modoEdicion}
                editorOptions={{
                  //readOnly: !(modoEdicion ? (dataRowEditNew.esNuevoRegistro ? false : true) : false),
                  items: estadoRegistro,
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",

                }}
              />


              <Item dataField="Alias"
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.COMPANY.NICKNAME" }) }}
                colSpan={1}
                editorOptions={{
                  readOnly: true,
                  inputAttr: { 'style': 'text-transform: uppercase' }
                }}
              />

              {/*    <Item dataField="Contratista"
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.COMPANY.CONTRACTOR" }) }}
                colSpan={1}
                editorOptions={{
                  readOnly: true,
                  inputAttr: { 'style': 'text-transform: uppercase' }
                }}
              /> */}

              <Item dataField="Direccion"
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.COMPANY.ADDRESS" }) }}
                colSpan={1}
                editorOptions={{
                  readOnly: true,
                  inputAttr: { 'style': 'text-transform: uppercase' }
                }}
              />

              <Item dataField="Pais"
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.COMPANY.COUNTRY" }) }}
                colSpan={1}
                editorOptions={{
                  readOnly: true,
                  inputAttr: { 'style': 'text-transform: uppercase' }
                }}
              />

              <Item dataField="Categoria"
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.COMPANY.CATEGORY" }) }}
                colSpan={1}
                editorOptions={{
                  readOnly: true,
                  inputAttr: { 'style': 'text-transform: uppercase' }
                }}
              />

              <Item dataField="TipoDocumento"
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.COMPANY.DOCUMENTTYPE" }) }}
                colSpan={1}
                editorOptions={{
                  readOnly: true,
                  inputAttr: { 'style': 'text-transform: uppercase' }
                }}
              />

              <Item dataField="Documento"
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.COMPANY.DOCUMENT" }) }}
                colSpan={1}
                editorOptions={{
                  readOnly: true,
                  inputAttr: { 'style': 'text-transform: uppercase' }
                }}
              />

              {/*   <Item dataField="Activo"
                label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
                colSpan={1}
                editorOptions={{
                  readOnly: true,
                  inputAttr: { 'style': 'text-transform: uppercase' }
                }}
              /> */}


              <Item dataField="IdCliente" visible={false} />
            </GroupItem>
          </Form>

          <AdministracionCompaniaBuscar
            //dataSource={companias}
            selectData={selectCompania}
            showPopup={{ isVisiblePopUp: popupVisibleCompania, setisVisiblePopUp: setPopupVisibleCompania }}
            cancelarEdicion={() => setPopupVisibleCompania(false)}
            uniqueId={"AdministracionCompaniaBuscar"}
          />

        </React.Fragment>
      </PortletBody>
    </>
  );
};

export default injectIntl(CompaniaEditPage);
