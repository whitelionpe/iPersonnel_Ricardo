import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { useSelector } from "react-redux";
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

import { Popup } from 'devextreme-react/popup';
import DataGrid, {
  Column,Editing,Paging,Selection,FilterRow } from 'devextreme-react/data-grid';

import { obtenerTodos as obtenerTodosTipoVehiculo } from "../../../../api/administracion/tipoVehiculo.api";

import { isNotEmpty, listarEstadoSimple, PatterRuler } from "../../../../../_metronic";
import { isRequired, isModified } from "../../../../../_metronic/utils/securityUtils";
import  IdentificacionTipoVehiculoBuscar from "../../../../partials/components/IdentificacionTipoVehiculoBuscar"

const TipoVehiculoEditPage = props => {
  const { intl, modoEdicion ,accessButton,settingDataField } = props;
  const perfil = useSelector(state => state.perfil.perfilActual);

  const [estadoSimple, setEstadoSimple] = useState([]);
  const classesEncabezado = useStylesEncabezado();
  const [tipoVehiculos, setTipoVehiculos] = useState([]);
  const [isVisiblePopUpTipoVehiculo, setIsVisiblePopUpTipoVehiculo] = useState(false);


  async function cargarCombos() {
    let tipoVehiculos = await obtenerTodosTipoVehiculo({ IdCliente: perfil.IdCliente });
    let estadoSimple = listarEstadoSimple();

    setTipoVehiculos(tipoVehiculos);
    setEstadoSimple(estadoSimple);
  }


  function grabar(e) {
    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregarTipoVehiculo(props.dataRowEditNew);
      } else {
        props.actualizarTipoVehiculo(props.dataRowEditNew);
      }
    }
  }

  const agregar = (dataPopup) => { 
    const { IdTipoVehiculo, TipoVehiculo } = dataPopup[0];
    if (isNotEmpty(IdTipoVehiculo)) {
        props.dataRowEditNew.IdTipoVehiculo = IdTipoVehiculo;
        props.dataRowEditNew.TipoVehiculo = TipoVehiculo;
    }
    setIsVisiblePopUpTipoVehiculo(false);
};

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
              <Item dataField="IdCliente" visible={false} />
              <Item dataField="IdLicencia" visible={false} />
              <Item dataField="IdTipoVehiculo" visible={false} />

              <Item
                dataField="TipoVehiculo"
                label={{ text: intl.formatMessage({ id: "IDENTIFICATION.VEHICLETYPE.VEHICLETYPE" }) }}
                isRequired={modoEdicion}
                editorOptions={{
                  readOnly: true,
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
                      disabled: props.dataRowEditNew.esNuevoRegistro ? false : true,
                      onClick: () => {
                        setIsVisiblePopUpTipoVehiculo(true);
                      },
                    }
                  }]
                }}
              />

              <Item
                dataField="Activo"
                label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
                editorType="dxSelectBox"
                isRequired={modoEdicion}
                colSpan={1}
                editorOptions={{
                  items: estadoSimple,
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                  readOnly: !(modoEdicion ? (props.dataRowEditNew.esNuevoRegistro ? false : true) : false)
                }}
              />
         
            </GroupItem>
          </Form>

        {/*** PopUp -> Buscar Rquisitos ****/}
        {isVisiblePopUpTipoVehiculo && (
                <IdentificacionTipoVehiculoBuscar
                  dataSource={tipoVehiculos}
                  selectData={agregar}
                  showPopup={{ isVisiblePopUp: isVisiblePopUpTipoVehiculo, setisVisiblePopUp: setIsVisiblePopUpTipoVehiculo }}
                  cancelarEdicion={() => setIsVisiblePopUpTipoVehiculo(false)}
                  selectionMode ={"row"}
                />
        )}

        </React.Fragment>
      </PortletBody>
    </>
  );
};

export default injectIntl(TipoVehiculoEditPage);
