import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl"; //Multi-idioma
import { useSelector } from "react-redux";
import Form, { Item, SimpleItem, GroupItem, Label } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";
//import { listarEstadoSimple } from "../../../../api/sistema/entidad.api";
import { obtenerTodos as obtenerCmbCentroCosto } from "../../../../api/administracion/centroCosto.api";
//import { DataGrid, Column, Editing, Paging, Pager, FilterRow, HeaderFilter, FilterPanel, Selection, Scrolling } from "devextreme-react/data-grid";
import "../../../../store/config/styles.css";
import 'devextreme-react/text-area';
import { listarEstadoSimple } from "../../../../../_metronic";
//import { Popup } from 'devextreme-react/popup';

//import AdministracionUnidadOrganizativaPersonalizado from "../../../../partials/components/AdministracionUnidadOrganizativaPersonalizado_XXX";
//initialFilter
const UnidadOrganizativaCentroCostoEditPage = props => {

  const { intl } = props;
  const perfil = useSelector(state => state.perfil.perfilActual);

  const [filtroLocal, setFiltroLocal] = useState({
    FlRepositorio: "1", IdCliente: perfil.IdCliente,
  });


  const [estadoSimple, setEstadoSimple] = useState([]);
  const [cmbCentroCosto, setCmbCentroCosto] = useState([]);
  const classesEncabezado = useStylesEncabezado();
  const [isVisiblePopUpCentroCosto, setisVisiblePopUpCentroCosto] = useState(true);

  async function cargarCombos() {
    let estadoSimple = listarEstadoSimple();
    let cmbCentroCosto = await obtenerCmbCentroCosto({ IdCliente: perfil.IdCliente });

    setEstadoSimple(estadoSimple);
    setCmbCentroCosto(cmbCentroCosto);
  }


  function grabar(datos) {
    
    console.log("grabar", datos);

    if (props.dataRowEditNew.esNuevoRegistro) {
      props.agregarUOrgCentroCosto(datos);
    }
    else {
      props.actualizarUOrgCentroCosto(props.dataRowEditNew);
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
              useSubmitBehavior={true}
              validationGroup="FormEdicion"
              onClick={grabar}
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
        

          {!props.dataRowEditNew.esNuevoRegistro && (
            <>
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
                  <Item dataField="IdCliente" visible={false} />
                  <Item dataField="IdUnidadOrganizativa" visible={false} />
                  <Item
                    dataField="IdCentroCosto"
                    label={{ text: intl.formatMessage({ id: "ADMINISTRATION.ORGANIZATIONALUNIT.COSTCENTER" }) }}
                    editorType="dxSelectBox"
                    isRequired={true}
                    editorOptions={{
                      maxLength: 50,
                      items: cmbCentroCosto,
                      valueExpr: "IdCentroCosto",
                      displayExpr: "CentroCosto",
                      disabled: props.dataRowEditNew.esNuevoRegistro ? false : true
                    }}
                  />
                  <Item
                    dataField="Activo"
                    label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
                    editorType="dxSelectBox"
                    isRequired={true}
                    editorOptions={{
                      //readOnly: !props.modoEdicion,
                      items: estadoSimple,
                      valueExpr: "Valor",
                      displayExpr: "Descripcion",
                      disabled: props.dataRowEditNew.esNuevoRegistro ? true : false
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

export default injectIntl(UnidadOrganizativaCentroCostoEditPage);
