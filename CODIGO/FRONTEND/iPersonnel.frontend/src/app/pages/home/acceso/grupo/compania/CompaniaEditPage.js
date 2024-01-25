import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl"; //Multi-idioma
import { useSelector } from "react-redux";
import Form, {
  Item,
  GroupItem,
  RequiredRule,
  StringLengthRule,
  PatternRule
} from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../../store/config/Styles";
import { listar as ObtenerCampamentoPerfil } from "../../../../../api/campamento/perfil.api";
import AdministracionCompaniaBuscar from "../../../../../partials/components/AdministracionCompaniaBuscar";

import { isNotEmpty, listarEstadoSimple, PatterRuler } from "../../../../../../_metronic";
import { isRequired, isModified } from "../../../../../../_metronic/utils/securityUtils";
import FieldsetAcreditacion from '../../../../../partials/content/Acreditacion/FieldsetAcreditacion/FieldsetAcreditacion';

const CompaniaEditPage = props => {
  const { intl, modoEdicion, settingDataField, accessButton } = props;
  const perfil = useSelector(state => state.perfil.perfilActual);

  const [estadoSimple, setEstadoSimple] = useState([]);
  const [popupVisibleCompania, setPopupVisibleCompania] = useState(false);

  const classesEncabezado = useStylesEncabezado();

  async function cargarCombos() {
    let estadoSimple = listarEstadoSimple();
    setEstadoSimple(estadoSimple);
  }

  function grabar(e) {
    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregarCompaniaGrupo(props.dataRowEditNew);
      } else {
        props.actualizarCompaniaGrupo(props.dataRowEditNew);
      }
    }
  }

  // const selectGrupo = (dataPopup) => {
  //   const { IdGrupo, Grupo, IdDivision } = dataPopup[0];
  //   if (isNotEmpty(IdGrupo)) {
  //     props.dataRowEditNew.IdGrupo = IdGrupo;
  //     props.dataRowEditNew.Grupo = Grupo;  
  //     props.dataRowEditNew.IdDivision = IdDivision; 
  //   }
  //   setisVisiblePopUpGrupo(false);
  // };

  const selectCompania = dataPopup => {
    const { IdCompania, Compania } = dataPopup[0];
    if (isNotEmpty(IdCompania)) {
      props.dataRowEditNew.IdCompania = IdCompania;
      props.dataRowEditNew.Compania = Compania;
    }
    setPopupVisibleCompania(false);
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

                <Item
                  dataField="Compania"
                  label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.COMPANY" }) }}
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
                        disabled: !props.dataRowEditNew.esNuevoRegistro ? true : false,
                        onClick: () => {
                          setPopupVisibleCompania(true);
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
                  editorOptions={{
                    readOnly: !(modoEdicion ? (props.dataRowEditNew.esNuevoRegistro ? false : true) : false),
                    items: estadoSimple,
                    valueExpr: "Valor",
                    displayExpr: "Descripcion",
                  }}
                />

              </GroupItem>
            </Form>
         
          {/*** PopUp -> Buscar Grupo ****/}
          {popupVisibleCompania && (
            <AdministracionCompaniaBuscar
              selectData={selectCompania}
              showPopup={{ isVisiblePopUp: popupVisibleCompania, setisVisiblePopUp: setPopupVisibleCompania }}
              cancelarEdicion={() => setPopupVisibleCompania(false)}
              // selectionMode="multiple"
              uniqueId={"administracionCompaniaBuscar"}
            />
          )}

        </React.Fragment>
      </PortletBody>
    </>
  );
};

export default injectIntl(CompaniaEditPage);
