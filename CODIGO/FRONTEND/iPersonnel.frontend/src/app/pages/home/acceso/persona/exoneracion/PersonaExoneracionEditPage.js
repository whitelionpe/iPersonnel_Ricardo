import React, { useEffect, useState } from "react";
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
import { useSelector } from "react-redux";
import { handleInfoMessages } from "../../../../../store/ducks/notify-messages";

//Multi-idioma
import { injectIntl } from "react-intl";

import { isNotEmpty, PatterRuler } from "../../../../../../_metronic";
import { isRequired, isModified } from "../../../../../../_metronic/utils/securityUtils";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";

import AccesoExoneracionBuscar from "../../../../../partials/components/AccesoExoneracionBuscar";

const PersonaExoneracionEditPage = props => {

  //Multi idioma
  const { intl, modoEdicion, settingDataField, accessButton,fechasContrato } = props;
  const perfil = useSelector(state => state.perfil.perfilActual);
  const classesEncabezado = useStylesEncabezado();
  const [isVisiblePopUpMotivoExoneracion, setisVisiblePopUpMotivoExoneracion] = useState(false);

  function grabar(e) {

    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (Date.parse(new Date(props.dataRowEditNew.FechaInicio)) > Date.parse(new Date(props.dataRowEditNew.FechaFin))) {
        handleInfoMessages(intl.formatMessage({ id: "ACCESS.PERSON.STARTDATE.VALID" }));
        return
      }
      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregarExoneracion(props.dataRowEditNew);
      } else {
        props.actualizarExoneracion(props.dataRowEditNew);
      }
    }
  }

  const agregar = (dataPopup) => {
    const { IdExoneracion, Motivo } = dataPopup[0];
    setisVisiblePopUpMotivoExoneracion(false);
    if (isNotEmpty(IdExoneracion)) {
      props.setDataRowEditNew({
        ...props.dataRowEditNew,
        IdExoneracion: IdExoneracion,
        Motivo: Motivo,
      });
    }
  };


  const isRequiredRule = (id) => {
    return modoEdicion ? false : isRequired(id, settingDataField);
  }

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
                      {intl.formatMessage({ id: "ACCESS.PERSON.EXONERACION.EDIT" })}
                    </Typography>
                  </Toolbar>
                </AppBar>
              </Item>
              <Item dataField="IdPersona" visible={false} />
              <Item dataField="IdSecuencial" visible={false} />

              <Item dataField="IdExoneracion" visible={false} />

              <Item dataField="Motivo" with="50"
                isRequired={modoEdicion}
                label={{ text: intl.formatMessage({ id: "ACCESS.PERSON.EXONERACION" }) }}
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
                        setisVisiblePopUpMotivoExoneracion(true);
                      },

                    }
                  }]

                }}
              />

              <Item />
              <Item dataField="Observacion"
                colSpan={2}
                label={{ text: intl.formatMessage({ id: "ACCESS.PERSON.EXONERACION.OBSERVATION" }) }}
                isRequired={modoEdicion ? isRequired('Observacion', settingDataField) : false}
                editorOptions={{
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  maxLength: 100,
                  readOnly: !(modoEdicion ? isModified('Observacion', settingDataField) : false)
                }}
              >
                {(isRequiredRule("Observacion")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={100} />}
                <PatternRule pattern={PatterRuler.LETRAS_DESCRIPCION} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS" })} />
              </Item>



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

          {/*** PopUp -> Buscar Rquisitos ****/}
          {isVisiblePopUpMotivoExoneracion && (
            <AccesoExoneracionBuscar
              selectData={agregar}
              showPopup={{ isVisiblePopUp: isVisiblePopUpMotivoExoneracion, setisVisiblePopUp: setisVisiblePopUpMotivoExoneracion }}
              cancelarEdicion={() => setisVisiblePopUpMotivoExoneracion(false)}
              selectionMode={"row"}
            />
          )}

        </React.Fragment>
      </PortletBody>
    </>
  );

};

export default injectIntl(PersonaExoneracionEditPage);
