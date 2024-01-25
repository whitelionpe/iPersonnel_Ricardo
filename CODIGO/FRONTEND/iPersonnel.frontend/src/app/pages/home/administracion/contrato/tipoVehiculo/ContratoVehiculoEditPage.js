import React, { useEffect, useState } from "react";
import Form, { Item, GroupItem, SimpleItem, ButtonItem, PatternRule } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../../store/config/Styles";
import { listarEstadoSimple, listarEstado } from "../../../../../../_metronic/utils/utils";
import { injectIntl } from "react-intl";
import PropTypes from 'prop-types'
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";
import { isNotEmpty } from "../../../../../../_metronic";

import AdministracionTipoVehiculoBuscar from "../../../../../partials/components/AdministracionTipoVehiculoBuscar";

const ContratoVehiculoEditPage = props => {

  const { intl, setLoading , accessButton} = props;

  const [estadoSimple, setEstadoSimple] = useState([]);
  const classesEncabezado = useStylesEncabezado();
  const [isVisibleTipoVehiculo, setisVisibleTipoVehiculo] = useState(false);
  const [estado, setEstado] = useState([]);

  async function cargarCombos() {
    let estadoSimple = listarEstadoSimple();
    setEstadoSimple(estadoSimple);

    let estado = listarEstado();
    setEstado(estado);
  }

  function grabar(e) {
    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregarContratoTipoVehiculo(props.dataRowEditNew);
      } else {
        props.actualizarContratoTipoVehiculo(props.dataRowEditNew);
      }
    }
  }

  const agregarTipoVehiculo = (dataPopup) => {
    const { IdCliente, IdDivision, IdTipoVehiculo, TipoVehiculo } = dataPopup[0];
    // console.log("agregarTipoVehiculo|dataPopup[0] :", dataPopup[0]);
    setisVisibleTipoVehiculo(false);
    if (isNotEmpty(IdTipoVehiculo)) {
      props.setDataRowEditNew({
        ...props.dataRowEditNew,
        IdTipoVehiculo: IdTipoVehiculo,
        TipoVehiculo: TipoVehiculo,
      });
    }
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
              <SimpleItem dataField="IdTipoVehiculo" visible={false}></SimpleItem>

              <Item
                colSpan={1} dataField="TipoVehiculo" isRequired={true} label={{ text: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.TYPEVEHICLE" }), }}
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
                          setisVisibleTipoVehiculo(true);
                        },
                      },
                    },
                  ],
                }}
              />

              <Item />


              <Item
                dataField="ValidarDotacion"
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.ISVALIDENDOWMENT" }) }}
                editorType="dxSelectBox"
                isRequired={true}
                editorOptions={{
                  readOnly: !props.modoEdicion,
                  items: estado,
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                }}
              />

              <Item
                colSpan={1} dataField="Dotacion" isRequired={true} label={{ text: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.ENDOWMENT" }), }}
                editorType="dxNumberBox"
                dataType="number"
                editorOptions={{
                  maxLength: 5,
                  inputAttr: { style: "text-transform: uppercase" },
                  readOnly: !props.modoEdicion,
                  showSpinButtons: true,
                  showClearButton: true,
                  min:0,
                  max:999999
                }}
              />

              <Item />

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
          <AdministracionTipoVehiculoBuscar
            dataSource={props.TipoVehiculos}
            selectData={agregarTipoVehiculo}
            showPopup={{ isVisiblePopUp: isVisibleTipoVehiculo, setisVisiblePopUp: setisVisibleTipoVehiculo }}
            cancelarEdicion={() => setisVisibleTipoVehiculo(false)}
            IdCliente={props.IdCliente}
            selectionMode={"row"}
            showButton={true}
          />
          {/* ---------------------------------------------------- */}
        </React.Fragment>
      </PortletBody>
    </>
  );

};

ContratoVehiculoEditPage.propTypes = {
  titulo: PropTypes.string,
  modoEdicion: PropTypes.bool,
  showButtons: PropTypes.bool,
  showAppBar: PropTypes.bool,

}
ContratoVehiculoEditPage.defaultProps = {
  titulo: "",
  modoEdicion: false,
  showButtons: true,
  showAppBar: true,
}

export default injectIntl(WithLoandingPanel(ContratoVehiculoEditPage));
