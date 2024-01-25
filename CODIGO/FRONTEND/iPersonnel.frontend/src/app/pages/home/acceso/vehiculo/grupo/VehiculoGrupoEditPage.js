import React, { useEffect, useState } from "react";
import Form, { Item, GroupItem, PatternRule } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../../store/config/Styles";
import { useSelector } from "react-redux";
import { handleInfoMessages } from "../../../../../store/ducks/notify-messages";

import { obtenerTodos as obtenerGrupos, } from "../../../../../api/acceso/grupo.api";
import { injectIntl } from "react-intl";
import { isNotEmpty, listarEstadoSimple } from "../../../../../../_metronic";
import { isRequired, isModified } from "../../../../../../_metronic/utils/securityUtils";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";
import AccesoGrupoBuscar from "../../../../../partials/components/AccesoGrupoBuscar";

const VehiculoGrupoEditPage = props => {

  const { intl, modoEdicion, settingDataField, accessButton, fechasContrato } = props;
  const classesEncabezado = useStylesEncabezado();
  const [isVisiblePopUpGrupo, setisVisiblePopUpGrupo] = useState(false);

  function grabar(e) {

    if (Date.parse(new Date(props.dataRowEditNew.FechaInicio)).toLocaleString() >= Date.parse(new Date(props.dataRowEditNew.FechaFin)).toLocaleString()) {
      handleInfoMessages(intl.formatMessage({ id: "ACCESS.PERSON.STARTDATE.VALID" }));
      return;
    }

    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregarGrupo(props.dataRowEditNew);
      } else {
        props.actualizarGrupo(props.dataRowEditNew);
      }
    }
  }

  const agregar = (dataPopup) => {
    const { IdGrupo, Grupo } = dataPopup[0];
    if (isNotEmpty(IdGrupo)) {
      props.dataRowEditNew.IdGrupo = IdGrupo;
      props.dataRowEditNew.Grupo = Grupo;
    }
    setisVisiblePopUpGrupo(false);
  };

  useEffect(() => {
   
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
                  useSubmitBehavior={true}
                  validationGroup="FormEdicion"
                  onClick={grabar}
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
                      {intl.formatMessage({ id: "ACCESS.PERSON.GRUPO.ADD" })}
                    </Typography>
                  </Toolbar>
                </AppBar>
              </Item>
              <Item dataField="IdGrupo" visible={false} />
              <Item dataField="Grupo" with="50"
                isRequired={modoEdicion}
                label={{ text: intl.formatMessage({ id: "ACCESS.PERSON.GRUPO" }) }}
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
                        setisVisiblePopUpGrupo(true);
                      },
                    }
                  }]

                }}
              />
              <Item />

            </GroupItem>

            <GroupItem itemType="group" colCount={2} colSpan={2}>
              <Item dataField="FechaInicio"
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.STARTDATE" }) }}
                isRequired={modoEdicion ? isRequired('FechaInicio', settingDataField) : false}
                editorType="dxDateBox"
                dataType="date"
                editorOptions={{
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  displayFormat: "dd/MM/yyyy",
                  readOnly: !(modoEdicion ? isModified('FechaInicio', settingDataField) : false),
                  min: fechasContrato.FechaInicioContrato,
                  max: fechasContrato.FechaFinContrato
                }}
              />

              <Item dataField="FechaFin"
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.ENDDATE" }) }}
                isRequired={modoEdicion ? isRequired('FechaFin', settingDataField) : false}
                editorType="dxDateBox"
                dataType="date"
                editorOptions={{
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  displayFormat: "dd/MM/yyyy",
                  readOnly: !(modoEdicion ? isModified('FechaFin', settingDataField) : false),
                  min: fechasContrato.FechaInicioContrato,
                  max: fechasContrato.FechaFinContrato
                }}
              />

            </GroupItem>
          </Form>

          {/*** PopUp -> Buscar Grupo ****/}
          {isVisiblePopUpGrupo && (
            <AccesoGrupoBuscar
              selectData={agregar}
              showPopup={{ isVisiblePopUp: isVisiblePopUpGrupo, setisVisiblePopUp: setisVisiblePopUpGrupo }}
              cancelarEdicion={() => setisVisiblePopUpGrupo(false)}
              selectionMode={"row"}
            />
          )}

        </React.Fragment>
      </PortletBody>
    </>
  );

};

export default injectIntl(VehiculoGrupoEditPage);
