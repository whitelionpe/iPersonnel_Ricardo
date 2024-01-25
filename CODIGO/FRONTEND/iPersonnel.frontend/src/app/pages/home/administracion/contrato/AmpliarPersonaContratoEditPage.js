
import React, { useEffect, useState } from "react";
import { Button } from "devextreme-react";
import { injectIntl } from "react-intl";
import { useStylesEncabezado } from "../../../../store/config/Styles";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import { Popup } from "devextreme-react/popup";
import { Portlet, PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import { getDateOfDay, isNotEmpty, dateFormat, dateFromString } from "../../../../../_metronic";
import { handleInfoMessages, handleErrorMessages } from "../../../../store/ducks/notify-messages";

import Form, { Item, EmptyItem, GroupItem } from "devextreme-react/form";
import AdministracionPersonaContratoResultado from "../../../../partials/components/AdministracionContratoPersonaResultado";
import { servicePersonaContrato } from "../../../../api/administracion/personaContrato.api";
import HeaderInformation from "../../../../partials/components/HeaderInformation";

import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";

import Confirm from "../../../../partials/components/Confirm";

const AmpliarPersonaContratoEditPage = (props) => {
  //console.log("LOAD AMPLIAR " + JSON.stringify(props.dataContract));
  const { intl, setLoading, showPopup } = props;
  const classesEncabezado = useStylesEncabezado();
  const [fechasContrato, setFechasContrato] = useState([]);

  const [resultadoProceso, setResultadoProceso] = useState([]);

  const [showConfirm, setShowConfirm] = useState(false);
  const [instance, setInstance] = useState({});



  const [formDataContract, setFormDataContract] = useState({
    IdCliente: props.dataContract.IdCliente,
    FechaInicio: props.dataContract.FechaInicio,//getDateOfDay().FechaInicio,
    FechaFin: props.dataContract.FechaFin,
    IdContrato: props.dataContract.IdContrato,
    Asunto: props.dataContract.Asunto,
    IdCompaniaMandante: props.dataContract.IdCompaniaMandante,
    CompaniaMandante: props.dataContract.CompaniaMandante,
    IdCompaniaContratista: props.dataContract.IdCompaniaContratista,
    CompaniaContratista: props.dataContract.CompaniaContratista,
    Dotacion: props.dataContract.Dotacion,
    IdTipoContrato: props.dataContract.IdTipoContrato,
    Servicios: props.dataContract.Servicios,
    IdDivision: "",
    Division: "",
    IdCentroCosto: "",
    CentroCosto: "",
    IdUnidadOrganizativa: "",
    UnidadOrganizativa: "",
    IdCompaniaSubContratista: "",
    CompaniaSubContratista: "",
    IdContratoPrevia: props.dataContract.IdContrato,
    IdCompaniaContratistaPrevia: props.dataContract.IdCompaniaContratista,
    IdCompaniaMandantePrevia: props.dataContract.IdCompaniaMandante,
    IdPersonaList: props.dataWorkers.map(x => x.IdPersona).toString()
  });

  const [popupVisiblePersonaContratoResultado, setPopupVisiblePersonaContratoResultado] = useState(false);


  function grabar(e) {

    let result = e.validationGroup.validate();
    if (result.isValid) {

      const {
        IdCompaniaMandante
        , IdCompaniaContratista
        , FechaFin
        , IdPersonaList } = formDataContract;


      servicePersonaContrato.validarAmpliarContratoPersona({
        IdCompaniaMandante: IdCompaniaMandante,
        IdCompaniaContratista: IdCompaniaContratista,
        FechaFin: FechaFin,
        IdPersonaList: IdPersonaList
      }).then(result => {
        let cantPersonas = JSON.stringify(result[0].Cantidad);
        if (cantPersonas > 0) {
          setShowConfirm(true);
          //setfinalizarAmpliarContrato(true);
        }
        else {
          ampliarContrato();
        }
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => {
        setLoading(false);
      });
    }

  }

  const eventConfirm = async () => {
    ampliarContrato();
    setShowConfirm(false);
  }

  async function ampliarContrato() {//datos
    setLoading(true);
    const { IdCliente
      , IdCompaniaMandante
      , IdCompaniaContratista
      , IdContrato
      , IdDivision
      , IdUnidadOrganizativa
      , IdCompaniaSubContratista
      , IdCentroCosto
      , FechaInicio
      , FechaFin
      , IdPersonaList
      , IdCompaniaMandantePrevia
      , IdCompaniaContratistaPrevia } = formDataContract;
    let params = {
      IdCliente: isNotEmpty(IdCliente) ? IdCliente : ""
      , IdCompaniaMandante: isNotEmpty(IdCompaniaMandante) ? IdCompaniaMandante : ""
      , IdCompaniaContratista: isNotEmpty(IdCompaniaContratista) ? IdCompaniaContratista : ""
      , IdContrato
      , IdDivision: isNotEmpty(IdDivision) ? IdDivision : ""
      , IdUnidadOrganizativa: isNotEmpty(IdUnidadOrganizativa) ? IdUnidadOrganizativa : ""
      , IdCompaniaSubContratista: isNotEmpty(IdCompaniaSubContratista) ? IdCompaniaSubContratista : ""
      , IdCentroCosto: isNotEmpty(IdCentroCosto) ? IdCentroCosto : ""
      , FechaInicio: dateFormat(FechaInicio, 'yyyyMMdd')
      , FechaFin: dateFormat(FechaFin, 'yyyyMMdd')
      , IdPersonaList: isNotEmpty(IdPersonaList) ? IdPersonaList : ""
      , IdCompaniaMandantePrevia: isNotEmpty(IdCompaniaMandantePrevia) ? IdCompaniaMandantePrevia : ""
      , IdCompaniaContratistaPrevia: isNotEmpty(IdCompaniaContratistaPrevia) ? IdCompaniaContratistaPrevia : ""
    };

    await servicePersonaContrato.ampliarContratoPersona(params).then(result => {
      setResultadoProceso(result);
      //setfinalizarAmpliarContrato(true);
      setPopupVisiblePersonaContratoResultado(true);

    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => {
      setLoading(false);
    });
  }

  return (
    <>
      <Popup
        visible={showPopup.isVisiblePopUp}//{isVisiblePopUp}
        onHiding={() => showPopup.setisVisiblePopUp(!showPopup.isVisiblePopUp)}
        showTitle={true}
        title={(intl.formatMessage({ id: "ADMINISTRATION.PERSON.ENLARGE.CONTRACT" })).toUpperCase()}
        width={"750px"}
        height={"500px"}
        dragEnabled={false}
        position="center"
      //closeOnOutsideClick={false}
      >
        <Portlet>

          <PortletHeader
            title={intl.formatMessage({ id: "ADMINISTRATION.PERSON.ENLARGE.CONTRACT" })}
            toolbar={
              <PortletHeaderToolbar>

                <Button
                  icon="fa fa-save"
                  type="default"
                  hint={intl.formatMessage({ id: "ACTION.RECORD" })}
                  onClick={grabar}
                  useSubmitBehavior={true}
                  validationGroup="FormEdicion"
                  disabled={showConfirm}
                />
                &nbsp;
                <Button
                  icon="fa fa-times-circle"
                  type="normal"
                  hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
                  onClick={props.cancelar}
                />

              </PortletHeaderToolbar>
            }
          />

          <PortletBody >
            <Form formData={formDataContract} validationGroup="FormEdicion">
              <GroupItem itemType="group" colCount={2} colSpan={2}>
                <Item colSpan={2}>
                  <AppBar position="static" className={classesEncabezado.secundario}>
                    <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                      <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                        {/* {intl.formatMessage({ id: "ACTION.NEW" }) + " " + intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CONTRACT" })} */}
                        {(intl.formatMessage({ id: "ADMINISTRATION.PERSON.ENLARGE.CONTRACT" })).toUpperCase()}
                      </Typography>
                    </Toolbar>
                  </AppBar>
                </Item>

                <Item dataField="IdContrato"
                  label={{ text: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CONTRACT" }), }}
                  editorOptions={{
                    maxLength: 50,
                    inputAttr: { 'style': 'text-transform: uppercase' },
                    readOnly: true,
                    //disabled: true
                  }}
                />

                <Item dataField="Dotacion"
                  label="Dotacion"
                  editorOptions={{
                    maxLength: 50,
                    inputAttr: { 'style': 'text-transform: uppercase' },
                    readOnly: true,
                    //disabled: true
                  }}
                />


                <Item dataField="CompaniaMandante"
                  label={{ text: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CLIENTCOMPANY" }), }}
                  editorOptions={{
                    maxLength: 50,
                    inputAttr: { 'style': 'text-transform: uppercase' },
                    readOnly: true,
                    //disabled: true
                  }}
                />

                <Item dataField="CompaniaContratista"
                  label={{ text: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CONTRACTORCOMPANY" }), }}
                  editorOptions={{
                    maxLength: 50,
                    inputAttr: { 'style': 'text-transform: uppercase' },
                    readOnly: true,
                    //disabled: true
                  }}
                />

                <Item dataField="Asunto"
                  colSpan={2}
                  label={{ text: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.SUBJECT" }), }}
                  editorOptions={{
                    maxLength: 50,
                    inputAttr: { 'style': 'text-transform: uppercase' },
                    readOnly: true,
                    //disabled: true
                  }}
                />

                <Item dataField="FechaInicio"
                  label="FechaInicio"
                  editorType={"dxDateBox"}
                  dataType="date"
                  editorOptions={{
                    maxLength: 50,
                    inputAttr: { 'style': 'text-transform: uppercase' },
                    displayFormat: "dd/MM/yyyy",
                    readOnly: true,
                    //disabled: true
                  }}
                />

                <Item dataField="FechaFin"
                  label="FechaFin"
                  editorType={"dxDateBox"}
                  dataType="date"
                  editorOptions={{
                    maxLength: 50,
                    inputAttr: { 'style': 'text-transform: uppercase' },
                    displayFormat: "dd/MM/yyyy",
                    readOnly: true,
                    //disabled: true
                  }}
                />

                {/* <Item dataField="FechaInicio"
                  label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.ENDDATE" }) }}
                  editorType="dxDateBox"
                  isRequired={false}
                  dataType="date"
                  editorOptions={{
                    inputAttr: { 'style': 'text-transform: uppercase' },
                    displayFormat: "dd/MM/yyyy",
                    min: fechasContrato.FechaInicioContrato,
                    max: getDateOfDay().FechaInicio,
                    disabled: true,
                    readOnly: true
                  }}
                /> */}
                <EmptyItem />

                <Item dataField="FechaFin"
                  label={{ text: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.EXPANDUPTO" }) }}
                  editorType="dxDateBox"
                  dataType="date"
                  isRequired={true}
                  editorOptions={{
                    inputAttr: { 'style': 'text-transform: uppercase' },
                    displayFormat: "dd/MM/yyyy",
                    min: props.dataContract.FechaInicio,//fechasContrato.FechaInicioContrato,
                    max: props.dataContract.FechaFin,//fechasContrato.FechaFinContrato,
                    readOnly: false
                  }}
                />

              </GroupItem>


            </Form>

            {popupVisiblePersonaContratoResultado && (
              <AdministracionPersonaContratoResultado
                dataSourceContract={resultadoProceso}
                showPopup={{ isVisiblePopUp: popupVisiblePersonaContratoResultado, setisVisiblePopUp: setPopupVisiblePersonaContratoResultado }}
                cancelar={() => popupVisiblePersonaContratoResultado(false)}
              />
            )}

          </PortletBody>

          <h6>{intl.formatMessage({ id: "ADMINISTRATION.PERSON.CONTRACT.NOTE1" })}</h6>
          <h6>{intl.formatMessage({ id: "ADMINISTRATION.PERSON.CONTRACT.NOTE2" })}</h6>
          <h6>{intl.formatMessage({ id: "ADMINISTRATION.PERSON.CONTRACT.NOTE3" })}</h6>

        </Portlet>
      </Popup>

      <Confirm
        message={intl.formatMessage({ id: "ADMINISTRATION.PERSON.CONTRACT.CONFIRM.AMPLIAR" })}
        isVisible={showConfirm}
        setIsVisible={setShowConfirm}
        setInstance={setInstance}
        onConfirm={eventConfirm}
        title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
        confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
        cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
      />

    </>
  );

};


export default injectIntl(WithLoandingPanel(AmpliarPersonaContratoEditPage)); 
