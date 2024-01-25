import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl"; //Multi-idioma
import { useSelector } from "react-redux";
import Form, {
  Item,
  GroupItem,
} from "devextreme-react/form";
import { Button } from "devextreme-react";
import { Portlet, PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";

import { handleInfoMessages, handleSuccessMessages } from "../../../../store/ducks/notify-messages";

import {
  DataGrid,
  Column,
  FilterRow,
  HeaderFilter,
  FilterPanel,
  Selection,
} from "devextreme-react/data-grid";

import PropTypes from "prop-types";
import { initialFilter } from "./PerfilIndexPage";
import CampamentoCompaniaPerfilBuscar from "../../../../partials/components/CampamentoCompaniaPerfilBuscar";

import { isNotEmpty, listarEstadoSimple, PatterRuler } from "../../../../../_metronic";
//import { isRequired, isModified } from "../../../../../_metronic/utils/securityUtils";


const PerfilCompaniaEditPage = props => {
  const { intl, modoEdicion, settingDataField, accessButton, varIdPerfil } = props;

  const { IdCliente, IdDivision } = useSelector((state) => state.perfil.perfilActual);
  const [estadoSimple, setEstadoSimple] = useState([]);

  const classesEncabezado = useStylesEncabezado();
  const [selectedRow, setSelectedRow] = useState([]);

  const [isVisiblePopUpPerfil, setisVisiblePopUpPerfil] = useState(true);


  async function cargarCombos() {
    let estadoSimple = listarEstadoSimple();
    setEstadoSimple(estadoSimple);
  }


  function grabar(e) {
    let result = e.validationGroup.validate();
    if (result.isValid) {

      if (props.dataRowEditNew.esNuevoRegistro) {
        if (selectedRow.length > 0) {
          props.agregarCompaniaPerfil(selectedRow);
          //handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
        } else {
          handleInfoMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), intl.formatMessage({ id: "CAMP.MANAGE.PROFILE.VALIDATION.MESSAGE" }));
        }
      } else {
        props.actualizarCompaniaPerfil(props.dataRowEditNew);
      }
    }
  }


  const selectCompaniaPerfil = (selectedRow) => {

    if (props.dataRowEditNew.esNuevoRegistro) {
      if (selectedRow.length > 0) {
        //Regsitros de compañias
        props.agregarCompaniaPerfil(selectedRow);

      } else {
        handleInfoMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), intl.formatMessage({ id: "CAMP.MANAGE.PROFILE.VALIDATION.MESSAGE" }));
      }
    } else {
      props.actualizarCompaniaPerfil(props.dataRowEditNew);
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

          {!props.isNewCompaniaPerfil && (
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
                  <Item
                    dataField="Compania"
                    label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.COMPANY" }) }}
                    editorOptions={{
                      readOnly: true,
                    }}
                  />

                  <Item
                    dataField="Activo"
                    label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
                    editorType="dxSelectBox"
                    isRequired={modoEdicion}
                    editorOptions={{
                      readOnly: !(modoEdicion ? (props.dataRowEditNew.esNuevoRegistro ? false : true) : false),
                      items: estadoSimple,
                      valueExpr: "Valor",
                      displayExpr: "Descripcion",
                    }}
                  />

                </GroupItem>
              </Form>
            </>

          )}

          {props.isNewCompaniaPerfil && (
            <>

              {/*******>POPUP DE PERFIL >******** */}

              <CampamentoCompaniaPerfilBuscar
                selectData={selectCompaniaPerfil}
                showPopup={{ isVisiblePopUp: isVisiblePopUpPerfil, setisVisiblePopUp: setisVisiblePopUpPerfil }}
                cancelar={() => setisVisiblePopUpPerfil(false), props.cancelarEdicion}
                selectionMode={"multiple"}
                uniqueId={"CampamentoCompaniaPerfilBuscarCompaniaPerfilEditPage"}
                showButton={true}
                varIdPerfil={varIdPerfil}
                cancelarEdicion={props.cancelarEdicion}
              />


            </>

          )}


        </React.Fragment>
      </PortletBody>
    </>
  );
};
PerfilCompaniaEditPage.propTypes = {
  selectionMode: PropTypes.string,
  uniqueId: PropTypes.string,
};
PerfilCompaniaEditPage.defaultProps = {
  selectionMode: "multiple",
  uniqueId: "PerfilCompaniasList",

};
export default injectIntl(PerfilCompaniaEditPage);
