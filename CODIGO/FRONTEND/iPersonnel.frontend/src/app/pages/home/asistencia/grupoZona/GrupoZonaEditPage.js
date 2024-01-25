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
//import { handleErrorMessages, handleSuccessMessages, handleInfoMessages } from "../../../../store/ducks/notify-messages";

import PropTypes from "prop-types";
import HeaderInformation from "../../../../partials/components/HeaderInformation";
import MenuTreeViewPage from "../../../../partials/content/TreeView/MenuTreeViewPage";
import { isNotEmpty, listarEstadoSimple } from "../../../../../_metronic";


const GrupoZonaEditPage = props => {

  const { intl, accessButton, modoEdicion } = props;
  const [estadoSimple, setEstadoSimple] = useState([]);
  const classesEncabezado = useStylesEncabezado();
  const [selectedNodos, setSelectedNodos] = useState([]);


  async function cargarCombos() {
    let estadoSimple = listarEstadoSimple();
    setEstadoSimple(estadoSimple);
  }

  function grabar(e) {

    if (selectedNodos.length > 0) {
      let arrayEquipos = selectedNodos[0].selectNodo.filter(data => { return isNotEmpty(data.IdEquipo) });
      props.eliminarZonaEquipo();
      setTimeout(function () {
        props.agregarZonaEquipo(arrayEquipos);
      }, 500);

    }

  }

  function seleccionarNodo(selectNodo, dataAll) {
    setSelectedNodos([{ selectNodo }, { dataAll }]);
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
                      {intl.formatMessage({ id: "ADMINISTRATION.CHARACTERISTIC.DETAIL" }) + ' ' + intl.formatMessage({ id: "ACCESS.GROUP.DEVICES" })}
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
          <MenuTreeViewPage
            id={"MenuTreeViewPage"}
            menus={props.menus}
            showCheckBoxesModes={"normal"}
            selectionMode={"multiple"}
            seleccionarNodo={seleccionarNodo}

          />

        </React.Fragment>
      </PortletBody>
    </>
  );
};


GrupoZonaEditPage.propTypes = {
  showHeaderInformation: PropTypes.bool,
  searchEnabled: PropTypes.bool,
};
GrupoZonaEditPage.defaultProps = {
  showHeaderInformation: true,
  searchEnabled: true,
};
export default injectIntl(GrupoZonaEditPage);
