import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
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
import PropTypes from 'prop-types';
import AdministracionPersonaBuscar from "../../../../../partials/components/AdministracionPersonaBuscar";
import AdministracionDivisionBuscar from "../../../../../partials/components/AdministracionDivisionBuscar";
import AdministracionCompaniaBuscar from "../../../../../partials/components/AdministracionCompaniaBuscar";

import { isNotEmpty, PatterRuler,dateFormat } from "../../../../../../_metronic";
import { isRequired, isModified } from "../../../../../../_metronic/utils/securityUtils";
import { handleInfoMessages } from "../../../../../store/ducks/notify-messages";

const PersonaVisitaEditPage = props => {
  const { intl, modoEdicion, settingDataField, accessButton, maxDiasVisita } = props;
  const [isVisiblePopUpPersonas, setisVisiblePopUpPersonas] = useState(false);
  const [isVisiblePopUpDivision, setisVisiblePopUpDivision] = useState(false);
  const [popupVisibleCompania, setPopupVisibleCompania] = useState(false);

  const classesEncabezado = useStylesEncabezado();

  function grabar(e) {

     let result = e.validationGroup.validate();
     if (result.isValid) {

      var date_1 = new Date(props.dataRowEditNew.FechaInicio);
      var date_2 = new Date(props.dataRowEditNew.FechaFin);
      var day_as_milliseconds = 86400000;
      var diff_in_millisenconds = date_2 - date_1;
      var diff_in_days = diff_in_millisenconds / day_as_milliseconds;

      if(parseInt((diff_in_days)+1) > parseInt(maxDiasVisita)){
          handleInfoMessages(intl.formatMessage({ id: "ADMINISTRATION.PERSON.MSG.VISIT" }) +" "+ maxDiasVisita.toString() + " "+intl.formatMessage({ id: "ACCESS.HORARIO_DIA.DIAS" })  );
          return;
      }

       if (props.dataRowEditNew.esNuevoRegistro) {
         props.agregarVisita(props.dataRowEditNew);
       } else {
         props.actualizarVisita(props.dataRowEditNew);
       }
     }
  }

  const agregarPersona = (data) => {
    const { IdPersona, NombreCompleto } = data[0];
    props.dataRowEditNew.IdPersonaResponsable = IdPersona;
    props.dataRowEditNew.PersonaResponsable = NombreCompleto;
    setisVisiblePopUpPersonas(false);

  }

  const isRequiredRule = (id) => {
    return modoEdicion ? false : isRequired(id, settingDataField);
  }

  const selectDataDivisiones = (data) => {
    props.setDataRowEditNew({
      ...props.dataRowEditNew,
      IdDivision: data.IdDivision,
      Division: `${data.IdDivision} - ${data.Division}`,
    });
    setisVisiblePopUpDivision(false);
  }

  const selectCompania = dataPopup => {
    const { IdCompania, Compania } = dataPopup[0];
     if (isNotEmpty(IdCompania)) {
       props.dataRowEditNew.Compania = Compania;  
       props.dataRowEditNew.IdCompania = IdCompania;
     }
    setPopupVisibleCompania(false);
  }

  async function onValueChangedPersonaNatural(e) {
    if(isNotEmpty(e.value)){
      if(e.value) props.dataRowEditNew.Compania = "";
       props.setDataRowEditNew({
         ...props.dataRowEditNew,
         PersonaNatural : e.value,
       });
    }
  }

  useEffect(() => {
  }, []);

  return (
    <>
      {(props.showButtons) ?
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
        : null}
      <PortletBody >
        <React.Fragment>
          <Form formData={props.dataRowEditNew} validationGroup="FormEdicion" >

            <GroupItem itemType="group" colCount={2} colSpan={2}>
              <Item colSpan={2}>
                <Button
                  onClick={grabar}
                  useSubmitBehavior={true}
                  validationGroup="FormEdicion"
                  className="hidden"
                />
                <AppBar position="static" className={classesEncabezado.secundario}>
                  <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                    <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                      {intl.formatMessage({ id: "COMMON.DETAIL" })}
                    </Typography>
                  </Toolbar>
                </AppBar>
              </Item>
              <Item dataField="IdPersona" visible={false} />
              <Item dataField="IdPersonaResponsable" visible={false} />
              <Item dataField="IdSecuencial" visible={false} />
              <Item dataField="IdDivision" visible={false} />
              <Item
                dataField="Division"
                isRequired={true}
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.DIVISION.NAME" }) }}
                editorOptions={{
                  readOnly: modoEdicion && props.dataRowEditNew.esNuevoRegistro ? false : true ,
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
                        onClick: (evt) => {
                          setisVisiblePopUpDivision(true);
                        },
                      },
                    },
                  ],
                }}
              />
              <Item
                dataField="PersonaResponsable"
                isRequired={modoEdicion ? isRequired('PersonaResponsable', settingDataField) : false}
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.RESPONSIBLE" }), }}
                editorOptions={{
                  readOnly: (modoEdicion ? isModified('PersonaResponsable', settingDataField) : false),
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
                        disabled: !props.dataRowEditNew.esNuevoRegistro ? true : false,
                        onClick: () => {
                          setisVisiblePopUpPersonas(true);
                        },
                      },
                    },
                  ],
                }}
              />

              <Item
                dataField="PersonaNatural"
                label={{
                  text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.NATURAL" })
                }}
                isRequired={modoEdicion ? isRequired('PersonaNatural', settingDataField) : false}
                editorType="dxCheckBox"
                editorOptions={{
                  readOnly: !(modoEdicion ? isModified('PersonaNatural', settingDataField) : false),
                  onValueChanged:(e) => onValueChangedPersonaNatural(e)
                }}
              />

              <Item
                  dataField="Compania"
                  label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.COMPANY" }) }}
                  isRequired={props.dataRowEditNew.PersonaNatural ? false : true }
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
                       disabled: props.dataRowEditNew.PersonaNatural ? true : false,
                      onClick: () => {
                        setPopupVisibleCompania(true);
                      },
                    }
                  }]
                }}
              />
              {/* <Item/> */}

              <Item dataField="FechaInicio"
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.STARTDATE" }) }}
                isRequired={modoEdicion ? isRequired('FechaInicio', settingDataField) : false}
                editorType="dxDateBox"
                dataType="date"
                editorOptions={{
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  displayFormat: "dd/MM/yyyy",
                  readOnly: !(modoEdicion ? isModified('FechaInicio', settingDataField) : false),
                  min:new Date(),
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
                   min:new Date(),
                }}
              />

              <Item
                dataField="Motivo"
                label={{ text: intl.formatMessage({ id: "ACCESS.EXONERATION.REASON" }) }}
                colSpan={2}
                editorType="dxTextArea"
                editorOptions={{
                  maxLength: 4000,
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  height: 200,
                  readOnly: !(modoEdicion ? isModified('Motivo', settingDataField) : false)
                }}
              >
                {(isRequiredRule("Motivo")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={200} />}
                <PatternRule pattern={PatterRuler.LETRAS_DESCRIPCION} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS" })} />
              </Item>


            </GroupItem>
          </Form>

          {/* POPUP-> buscar persona */}
          <AdministracionPersonaBuscar
            showPopup={{ isVisiblePopUp: isVisiblePopUpPersonas, setisVisiblePopUp: setisVisiblePopUpPersonas }}
            cancelar={() => setisVisiblePopUpPersonas(false)}
            agregar={agregarPersona}
            selectionMode={"row"}
            condicion= {"TRABAJADOR"}
            uniqueId={"administracionPersonaBuscarVisita"}
            allowFilteringColumn = {false}
          />
          {/* POPUP-> Buscar Divisiòn */}
          <AdministracionDivisionBuscar
            selectData={selectDataDivisiones}
            showPopup={{ isVisiblePopUp: isVisiblePopUpDivision, setisVisiblePopUp: setisVisiblePopUpDivision }}
            cancelarEdicion={() => setisVisiblePopUpDivision(false)}
          />

        {/*** PopUp -> Buscar Grupo ****/}
        {popupVisibleCompania && (
        <AdministracionCompaniaBuscar
        selectData={selectCompania}
        showPopup={{ isVisiblePopUp: popupVisibleCompania, setisVisiblePopUp: setPopupVisibleCompania }}
        cancelarEdicion={() => setPopupVisibleCompania(false)}
        uniqueId={"administracionCompaniaBuscar"}
      />
          )}

        </React.Fragment>
      </PortletBody>
    </>
  );

};

PersonaVisitaEditPage.propTypes = {
  showButtons: PropTypes.bool,

}
PersonaVisitaEditPage.defaultProps = {
  showButtons: true,

}

export default injectIntl(PersonaVisitaEditPage);
