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
import AdministracionCompaniaBuscar from "../../../../../partials/components/AdministracionCompaniaBuscar";

import ArrayStore from "devextreme/data/array_store";
import DataSource from "devextreme/data/data_source";

const ContratoSubcontratistasEditPage = props => {

  const { intl, setLoading,accessButton } = props;
  const [estadoSimple, setEstadoSimple] = useState([]);
  const classesEncabezado = useStylesEncabezado();
  const [isVisiblePopUpCompania, setisVisiblePopUpCompania] = useState(false);
  const [companiaContratista, setCompaniaContratista] = useState("");

  const ds = new DataSource({
    store: new ArrayStore({ data: [], key: "RowIndex" }),
    reshapeOnPush: false,
  });
  const [dataSource] = useState(ds);

  async function cargarCombos() {
    let estadoSimple = listarEstadoSimple();
    setEstadoSimple(estadoSimple);
  }

  function grabar(e) {
    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregarContratoSubcontratista(props.dataRowEditNew);
      } else {
        props.actualizarContratoSubContratista(props.dataRowEditNew);
      }
    }
  }

  const agregarCompania = (companias) => {
      let data = companias[0];

      props.setDataRowEditNew({
          ...props.dataRowEditNew,
          IdCompaniaSubContratista: data.IdCompania,
          CompaniaSubContratista: data.Compania,
      });

  };

    


  /**************************************************************************************************** */
  useEffect(() => {
    cargarCombos();
  }, []);

  return (
    <>
      {props.showButton && (
        <HeaderInformation data={props.getInfo()} visible={true} labelLocation={'left'} colCount={3}
          toolbar={
            <PortletHeader
              title=""
              toolbar={
                <PortletHeaderToolbar>
                  <PortletHeaderToolbar>
                    <Button
                      icon="fa fa-save"
                      type="default"
                      hint={intl.formatMessage({ id: "ACTION.RECORD" })}
                      visible={props.modoEdicion}
                      onClick={grabar}
                      useSubmitBehavior={true}
                      validationGroup="FormEdicion"
                      //disabled={!accessButton.grabar}//// 2023-06-26->DESHABILITADO-> SOLICUD JORGE-> ADEMAS SE SOLICITA AGREGAR CONFIGURAR TAB CON SUS RESPECTIVO BOTTON. 
                    />
                    &nbsp;
                    <Button
                      icon="fa fa-times-circle"
                      type="normal"
                      hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
                      onClick={props.cancelarEdicion}
                    />
                  </PortletHeaderToolbar>
                </PortletHeaderToolbar>
              }
            />

          } />)}

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



              <Item
                colSpan={1} dataField="CompaniaSubContratista" isRequired={true} label={{ text: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.SUBCONTRACTOR" }), }}
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
                        onClick: (evt) => {
                          setCompaniaContratista("S");
                          setisVisiblePopUpCompania(true);
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

          </Form>
          {/* ---------------------------------------------------- */}
          <AdministracionCompaniaBuscar
            showPopup={{ isVisiblePopUp: isVisiblePopUpCompania, setisVisiblePopUp: setisVisiblePopUpCompania }}
            cancelar={() => setisVisiblePopUpCompania(false)}
            selectData={agregarCompania}
            selectionMode={"row"}
            uniqueId={"companiabuscarContratoSubContratistaEditPage"}
            contratista={companiaContratista}

          />
          {/* ---------------------------------------------------- */}
        </React.Fragment>
      </PortletBody>
    </>
  );

};

ContratoSubcontratistasEditPage.propTypes = {
  titulo: PropTypes.string,
  modoEdicion: PropTypes.bool,
  showButtons: PropTypes.bool,
  showAppBar: PropTypes.bool,

}
ContratoSubcontratistasEditPage.defaultProps = {
  titulo: "",
  modoEdicion: false,
  showButtons: true,
  showAppBar: true,
}

export default injectIntl(WithLoandingPanel(ContratoSubcontratistasEditPage));
