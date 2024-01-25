import React, { useEffect, useState } from "react";
import Form, { Item, GroupItem, SimpleItem, ButtonItem } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../../store/config/Styles";
import { listarEstadoSimple } from "../../../../../../_metronic/utils/utils";
import { injectIntl } from "react-intl";
import PropTypes from 'prop-types'
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";
import { isNotEmpty } from "../../../../../../_metronic";

import AdministracionUnidadOrganizativaBuscar from "../../../../../partials/components/AdministracionUnidadOrganizativaBuscar";
import AccesoGrupoBuscar from "../../../../../partials/components/AccesoGrupoBuscar";
import Alerts from "../../../../../partials/components/Alert/Alerts";

const ContratoUnidadOrganizativaEditPage = props => {

  const { intl, setLoading, accessButton, titulo } = props;
  const [fileBase64, setFileBase64] = useState();

  const [estadoSimple, setEstadoSimple] = useState([]);
  const classesEncabezado = useStylesEncabezado();
  const [isVisibleUnidadOrganizativa, setisVisibleUnidadOrganizativa] = useState(false);

  const [popupGrupoVisible, setPopupGrupoVisible] = useState(false);

  async function cargarCombos() {
    let estadoSimple = listarEstadoSimple();
    setEstadoSimple(estadoSimple);
  }

  function grabar(e) {
    let result = e.validationGroup.validate();
    if (result.isValid) {
      //console.log("***Grabar() :> ",props.dataRowEditNew);
      if (props.dataRowEditNew.esNuevoRegistro) {
          props.agregarContratoUndOrganizativa(props.dataRowEditNew);
      } else {
          props.actualizarContratoUndOrganizativa(props.dataRowEditNew);
      }
    }
  }

  const seleccionarGrupo = dataPopup => {
    const { IdGrupo, Grupo } = dataPopup[0];
    if (isNotEmpty(IdGrupo)) {
      props.dataRowEditNew.IdGrupoAcceso = IdGrupo;
      props.dataRowEditNew.GrupoAcceso = Grupo;
    }
    setPopupGrupoVisible(false);
  };

  /**************************************************************************************************** */

  useEffect(() => {
    cargarCombos();
  }, []);

  return (
    <>
      {props.showButton && (
        <PortletHeader
          title={titulo}
          toolbar={
              <PortletHeaderToolbar>
                <Button
                  icon="fa fa-save"
                  type="default"
                  hint={intl.formatMessage({ id: "ACTION.RECORD" })}
                  onClick={grabar}
                  useSubmitBehavior={true}
                  validationGroup="FormEdicion"
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
      )}

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

              <SimpleItem dataField="IdCliente" visible={false}></SimpleItem>
              <SimpleItem dataField="IdCompaniaMandante" visible={false}></SimpleItem>
              <SimpleItem dataField="IdCompaniaContratista" visible={false}></SimpleItem>
              <SimpleItem dataField="IdContrato" visible={false}></SimpleItem>
              <SimpleItem dataField="IdCompaniaSubContratista" visible={false}></SimpleItem>
              <SimpleItem dataField="IdCompaniaSubContratistaPadre" visible={false}></SimpleItem>
              <SimpleItem dataField="IdGrupoAcceso" visible={false}></SimpleItem>
              <SimpleItem dataField="IdUnidadOrganizativa" visible={true}
                editorOptions={{
                    readOnly: true
                  }
                }
                label={{ text: intl.formatMessage({ id: "ASISTENCIA.PERSONA.BOLSAHORAS.CODIGO" }) }}/>

              <Item
                colSpan={1} dataField="UnidadOrganizativa" isRequired={true} label={{ text: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.UNIDADORGANIZATIVA" }), }}
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
                        disabled: !props.dataRowEditNew.esNuevoRegistro,
                        onClick: () => {
                          setisVisibleUnidadOrganizativa(true);
                        },
                      },
                    },
                  ],
                }}
              />

              <Item
                colSpan={1}
                dataField="Dotacion"
                isRequired={props.modoEdicion ? props.dataRowEditNew.ValidarDotacion === 'Y' : true}
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.ENDOWMENT" }), }}
                editorType="dxNumberBox"
                dataType="number"
                editorOptions={{
                  maxLength: 5,
                  inputAttr: { style: "text-transform: uppercase; text-align: right", },
                  readOnly: props.dataRowEditNew.esNuevoRegistro ? true : (props.modoEdicion ? props.dataRowEditNew.ValidarDotacion !== 'Y' : !props.modoEdicion),
                  showSpinButtons: true,
                  showClearButton: true,
                  min: 0,
                  max: 999999
                }}
              />

              <Item
                colSpan={1}
                dataField="GrupoAcceso"
                isRequired={false}
                label={{ text: "Grupo de Acceso" }}
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
                        disabled: props.dataRowEditNew.esNuevoRegistro ? true : !props.modoEdicion,
                        onClick: () => {
                          setPopupGrupoVisible(true);
                        },
                      },
                    },
                  ],
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
                  readOnly: props.dataRowEditNew.esNuevoRegistro ? true : !props.modoEdicion,
                }}
              />
            </GroupItem>

            { popupGrupoVisible && (
                <AccesoGrupoBuscar
                  selectData={seleccionarGrupo}
                  showPopup={{ isVisiblePopUp: popupGrupoVisible, setisVisiblePopUp: setPopupGrupoVisible }}
                  cancelarEdicion={() => setPopupGrupoVisible(false)}
                  selectionMode={"row"}
                  mostrarPuertas={false}
                  usarIdDivisionPerfil={false}
                  varIdDivision={props.dataRowEditNew.IdDivision}
                  filtroAsignarUOContrato={'S'}
                />
              )
            }

          </Form>

        </React.Fragment>
      </PortletBody>
    </>
  );

};

ContratoUnidadOrganizativaEditPage.propTypes = {
  titulo: PropTypes.string,
  modoEdicion: PropTypes.bool,
  showButtons: PropTypes.bool,
  showAppBar: PropTypes.bool,

}
ContratoUnidadOrganizativaEditPage.defaultProps = {
  titulo: "",
  modoEdicion: false,
  showButtons: true,
  showAppBar: true,
}

export default injectIntl(WithLoandingPanel(ContratoUnidadOrganizativaEditPage));
