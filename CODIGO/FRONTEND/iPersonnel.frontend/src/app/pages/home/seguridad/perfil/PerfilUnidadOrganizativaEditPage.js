import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";//Multi-idioma
import Form, { Item, GroupItem } from "devextreme-react/form";
import { Button, TreeView } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";
//import { listarEstadoSimple } from "../../../../api/sistema/entidad.api";
import PropTypes from "prop-types";
import HeaderInformation from "../../../../partials/components/HeaderInformation";
import { listarEstadoSimple } from "../../../../../_metronic";

const PerfilUnidadOrganizativaEditPage = props => {

  const { intl, accessButton, modoEdicion } = props;
  const [estadoSimple, setEstadoSimple] = useState([]);
  const classesEncabezado = useStylesEncabezado();
  const [treeViewRefUO, setTreeViewRefUO] = useState(null);

  //console.log("PerfilUnidadOrganizativaEditPage|accessButton:",accessButton);

  async function cargarCombos() {
    let estadoSimple = listarEstadoSimple();
    setEstadoSimple(estadoSimple);
  }

  function grabar(e) {

    let ArrayIdUnidadOrganizativa = [];
    var codigosUO = "";
    let result = e.validationGroup.validate();
    if (result.isValid) {
      for (let i = 0; i < treeViewRefUO.props.items.length; i++) {
        if (treeViewRefUO.props.items[i].selected === true) {
          ArrayIdUnidadOrganizativa.push(treeViewRefUO.props.items[i].IdUnidadOrganizativa);
        }
      }
      codigosUO = ArrayIdUnidadOrganizativa.join(';');
      props.agregarUnidadOrganizativa(props.dataRowEditNew, codigosUO);
    }

  }

  useEffect(() => {
    props.dataRowEditNew.Activo = "S";
    cargarCombos();
  }, []);


  return (
    <>
      <HeaderInformation data={props.getInfo()} visible={props.showHeaderInformation} labelLocation={'left'} colCount={6}
        toolbar={
          <PortletHeader
            title=""
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


        } />

      <PortletBody >
        <React.Fragment>
          <Form formData={props.dataRowEditNew} validationGroup="FormEdicion" >
            <GroupItem itemType="group" colCount={2} colSpan={2}>
              <Item colSpan={2}>
                <AppBar position="static" className={classesEncabezado.secundario}>
                  <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                    <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                      {intl.formatMessage({ id: "SECURITY.PROFILE.ORGANIZATIONALUNIT.ADD" })}
                    </Typography>
                  </Toolbar>
                </AppBar>
              </Item>

              <Item
                dataField="Activo"
                label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
                editorType="dxSelectBox"
                isRequired={false}
                visible={false}
                editorOptions={{
                  items: estadoSimple,
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                  disabled: props.dataRowEditNew.esNuevoRegistro ? true : false,
                }}
              />
            </GroupItem>

          </Form>
          <br />
          <TreeView
            id="treeview-base"
            ref={e => setTreeViewRefUO(e)}
            items={props.unidadOrganizativaTreeView}
            dataStructure="plain"
            virtualModeEnabled={true}
            selectNodesRecursive={true}
            selectionMode={props.selectionMode}
            showCheckBoxesMode={props.showCheckBoxesModes}
            selectByClick={true}
            displayExpr="Menu"
            parentIdExpr="IdMenuPadre"
            keyExpr="IdMenu"
            searchEnabled={props.searchEnabled}
            searchMode={props.searchMode}

          />

        </React.Fragment>
      </PortletBody>
    </>
  );
};


PerfilUnidadOrganizativaEditPage.propTypes = {
  showHeaderInformation: PropTypes.bool,
  searchEnabled: PropTypes.bool,
};
PerfilUnidadOrganizativaEditPage.defaultProps = {
  showHeaderInformation: true,
  searchEnabled: true,
};
export default injectIntl(PerfilUnidadOrganizativaEditPage);
