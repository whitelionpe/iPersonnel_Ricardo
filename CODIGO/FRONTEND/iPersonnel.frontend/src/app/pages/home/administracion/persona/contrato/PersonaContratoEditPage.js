import React, { useState } from "react";
import { injectIntl } from "react-intl";
import Form, { Item, GroupItem, EmptyItem } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";

/**Popups********************************************************************************************* */
import AdministracionContratoBuscar from "../../../../../partials/components/AdministracionContratoBuscar";
import AdministracionUnidadOrganizativaContratoBuscar from "../../../../../partials/components/AdministracionUnidadOrganizativaContratoBuscar";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import { isRequired, isModified } from "../../../../../../_metronic/utils/securityUtils";
import { isNotEmpty } from "../../../../../../_metronic/utils/utils";
import { handleInfoMessages } from "../../../../../store/ducks/notify-messages";
import PersonaContratoPosicion from "./PersonaContratoPosicion";
import PersonaContratoMotivoCese from "./PersonaContratoMotivoCese";
import AdministracionCompaniaBuscar from "../../../../../partials/components/AdministracionCompaniaBuscar";
import AdministracionPosicionBuscar from "../../../../../partials/components/AdministracionPosicionBuscar";
import usePersonaContratoEdit from "./usePersonaContratoEdit";
import FieldsetAcreditacion from '../../../../../partials/content/Acreditacion/FieldsetAcreditacion/FieldsetAcreditacion';

const PersonaContratoEditPage = ({
  intl,
  setLoading,
  modoEdicion,
  settingDataField,
  accessButton,
  dataRowEditNew,
  setDataRowEditNew,
  ocultarEdit,
  agregarRegistro,
  actualizarRegistro,
  titulo,
  cancelarEdicion,
  posicionDefault,
  set,
  fechasContrato,
  setFechasContrato,
  motivoCeseSwitch,
  setMotivoCeseSwitch
}) => {

  //const [motivoCeseSwitch, setMotivoCeseSwitch] = useState(false);

  const {
    classesEncabezado,
    cmbDivision,
    cmbCentroCosto,
    cmbSubContratista,
    cmbFuncion,
    cmbTipoPosicion,
    estadoSimple,
    motivoCese,
    filtroLocal,
    popupVisibleCompania,
    popupVisiblePosicion,
    grabar,
    setPopupVisibleCompania,
    eventClickSearchContract,
    setPopupVisibleUnidad,
    setPopupVisiblePosicion,
    setFiltroLocal,
    agregarContrato,
    popupVisibleContrato,
    setPopupVisibleContrato,
    popupVisibleUnidad,
    selectUnidadOrganizativa,
    selectCompaniaContratista,
    agregarPopupPosicion,

  } = usePersonaContratoEdit({
    intl,
    posicionDefault,
    dataRowEditNew,
    setLoading,
    setDataRowEditNew,
    agregarRegistro,
    actualizarRegistro,
    modoEdicion,
    setFechasContrato,
    motivoCeseSwitch
  });


  return (
    <>

      <PortletHeader
        title={titulo}
        toolbar={
          <PortletHeaderToolbar>

            <Button
              icon="fa fa-save"
              type="default"
              hint={intl.formatMessage({ id: "ACTION.RECORD" })}
              onClick={grabar}
              useSubmitBehavior={true}
              validationGroup="FormEdicion"
              visible={!ocultarEdit}
              disabled={!accessButton.grabar}
            />
            &nbsp;
            <Button
              icon="fa fa-times-circle"
              type="normal"
              hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
              onClick={cancelarEdicion}
            />

          </PortletHeaderToolbar>
        }
      />
      <PortletBody >
        <React.Fragment>

        <FieldsetAcreditacion title={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CONTRACT" })}>

          <Form formData={dataRowEditNew} validationGroup="FormEdicion" >
            <GroupItem itemType="group" colCount={2} colSpan={2}>
              <Item
                dataField="CompaniaContratista"
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.COMPANY.COMPANY" }) }}
                isRequired={modoEdicion ? isRequired('CompaniaContratista', settingDataField) : false}
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
                      disabled: !(modoEdicion && dataRowEditNew.esNuevoRegistro ? isModified('CompaniaContratista', settingDataField) : false),
                      onClick: () => {
                        setPopupVisibleCompania(true);
                      },
                    }
                  }]
                }}
              />


              <Item
                dataField="IdContrato"
                colSpan={1}
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CONTRACT" }) }}
                isRequired={true}//{modoEdicion ? isRequired('IdContrato', settingDataField) : false}
                editorOptions={{
                  hoverStateEnabled: false,
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  showClearButton: true,
                  readOnly: ocultarEdit,
                  buttons: [{
                    name: 'search',
                    location: 'after',
                    useSubmitBehavior: true,
                    options: {
                      disabled: !(modoEdicion && dataRowEditNew.esNuevoRegistro ? isModified('CompaniaContratista', settingDataField) : false),
                      stylingMode: 'text',
                      icon: 'search',
                      onClick: eventClickSearchContract,
                    }
                  }]
                }}
              />

              <Item dataField="Contrato"
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.SUBJECT" }) }}
                isRequired={false} // Por Regla
                editorOptions={{
                  //readOnly: !(modoEdicion ? isModified('Contrato', settingDataField) : false),
                  maxLength: 50,
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  readOnly: true
                }}
              />

              <Item dataField="CompaniaMandante"
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CLIENTCOMPANY.ABR" }) }}
                //isRequired={modoEdicion ? isRequired('CompaniaMandante', settingDataField) : false}
                editorOptions={{
                  //readOnly: !(modoEdicion ? isModified('CompaniaMandante', settingDataField) : false),
                  maxLength: 50,
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  readOnly: true

                }}
              />

              <Item
                dataField="IdDivision"
                label={{ text: intl.formatMessage({ id: "SYSTEM.DIVISION" }) }}
                editorType="dxSelectBox"
                isRequired={modoEdicion ? isRequired('IdDivision', settingDataField) : false}
                editorOptions={{
                  items: cmbDivision,
                  valueExpr: "IdDivision",
                  displayExpr: "Division",
                  showClearButton: true,
                  readOnly: !(modoEdicion && dataRowEditNew.esNuevoRegistro)
                }}
              />

              <Item
                colSpan={2}
                dataField="UnidadOrganizativa"
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.ORGANIZATIONALUNIT.ORGANIZATIONALUNIT" }) }}
                editorOptions={{
                  hoverStateEnabled: false,
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  showClearButton: true,
                  readOnly: true,
                  buttons: [{
                    name: 'search',
                    location: 'after',
                    useSubmitBehavior: true,
                    options: {
                      stylingMode: 'text',
                      icon: 'search',
                      disabled: ocultarEdit ? true : !modoEdicion,
                      onClick: () => {
                        if (!isNotEmpty(dataRowEditNew.IdContrato)) { handleInfoMessages(intl.formatMessage({ id: "ACCREDITATION.COMPANY.DATA.CONTRACT" })); return; }
                        const { IdContrato, IdCompaniaMandante, IdCompaniaContratista } = dataRowEditNew;
                        setFiltroLocal({ IdContrato, IdCompaniaMandante, IdCompaniaContratista });
                        setPopupVisibleUnidad(true);
                      },
                    }
                  }]
                }}
              />

              <Item
                dataField="IdCentroCosto"
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CENTROCOSTO" }) }}
                editorType="dxSelectBox"
                editorOptions={{
                  items: cmbCentroCosto,
                  valueExpr: "IdCentroCosto",
                  displayExpr: "CentroCosto",
                  showClearButton: true,
                  readOnly: ocultarEdit ? true : !modoEdicion
                }}
              />

              <Item
                dataField="IdCompaniaSubContratista"
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.SUBCONTRACTOR" }) }}
                editorType="dxSelectBox"
                editorOptions={{
                  items: cmbSubContratista,
                  valueExpr: "IdCompaniaSubContratista",
                  displayExpr: "CompaniaSubContratista",
                  showClearButton: true,
                  readOnly: !(modoEdicion && dataRowEditNew.esNuevoRegistro)
                }}
              />

              <Item dataField="FechaInicio"
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.STARTDATE" }) }}
                isRequired={modoEdicion ? isRequired('FechaInicio', settingDataField) : false}
                editorType="dxDateBox"
                dataType="date"
                editorOptions={{
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  displayFormat: "dd/MM/yyyy",
                  //readOnly: !(modoEdicion ? isModified('FechaInicio', settingDataField) : false),
                  min: fechasContrato.FechaInicioContrato,
                  max: fechasContrato.FechaFinContrato,
                  readOnly: ocultarEdit ? true : !modoEdicion
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
                  //readOnly: !(modoEdicion ? isModified('FechaFin', settingDataField) : false),
                  min: fechasContrato.FechaInicioContrato,
                  max: fechasContrato.FechaFinContrato,
                  readOnly: ocultarEdit ? true : !modoEdicion
                }}
              />
              <Item />

              <Item dataField="CodigoPlanilla"
                label={{ text: intl.formatMessage({ id: "CASINO.REPORT.SPREADCODE" }) }}
                isRequired={false}
                editorOptions={{
                  readOnly: !(modoEdicion),
                  maxLength: 20,
                  inputAttr: { 'style': 'text-transform: uppercase' },
                }}
              />

            </GroupItem>

            <GroupItem colSpan={2}  >
              <fieldset className="scheduler-border" >
                <legend className="scheduler-border" >
                  <h5>{intl.formatMessage({ id: "ADMINISTRATION.PERSON.CONTRACT.FUNCTION.TITLE" })} </h5>

                </legend>
                <PersonaContratoPosicion
                  intl={intl}
                  modoEdicion={modoEdicion}
                  dataRowEditNew={dataRowEditNew}
                  ocultarEdit={ocultarEdit}
                  cmbFuncion={cmbFuncion}
                  cmbTipoPosicion={cmbTipoPosicion}
                  estadoSimple={estadoSimple}
                  isRequired={isRequired}
                  isModified={isModified}
                  settingDataField={settingDataField}
                  setFiltroLocal={setFiltroLocal}
                  setPopupVisiblePosicion={setPopupVisiblePosicion}
                />
              </fieldset>
            </GroupItem>


            <GroupItem itemType="group" colCount={2} colSpan={2}>
              <GroupItem colSpan={2} >
                {!(dataRowEditNew.esNuevoRegistro) &&
                  <fieldset className="scheduler-border" >
                    <legend className="scheduler-border" >
                      <h5>{intl.formatMessage({ id: "ADMINISTRATION.REASONCEASE" })} </h5>
                    </legend>
                    <PersonaContratoMotivoCese
                      dataRowEditNew={dataRowEditNew}
                      setDataRowEditNew={setDataRowEditNew}
                      intl={intl}
                      modoEdicion={modoEdicion}
                      motivoCese={motivoCese}
                      disabledControlSwitch={ocultarEdit ? true : false}
                      motivoCeseSwitch={motivoCeseSwitch}
                      setMotivoCeseSwitch={setMotivoCeseSwitch}
                    />
                  </fieldset>
                }
              </GroupItem>
            </GroupItem>

            <GroupItem colCount={2} >
              <EmptyItem />
              <Item colSpan={1}
                dataField="Activo"
                label={{ text: "Activo" }}
                editorType="dxSelectBox"
                isRequired={true}
                editorOptions={{
                  items: estadoSimple,
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                  disabled: dataRowEditNew.esNuevoRegistro || ocultarEdit ? true : false,
                }}
              />
            </GroupItem>

          </Form>
         </FieldsetAcreditacion>

          {/*******>POPUP DE CONTRATO>****************************** */}
          {popupVisibleContrato && (
            <AdministracionContratoBuscar
              uniqueId={"AdministracionContratoBuscarPersonas"}
              selectData={agregarContrato}
              showPopup={{ isVisiblePopUp: popupVisibleContrato, setisVisiblePopUp: setPopupVisibleContrato }}
              cancelar={() => setPopupVisibleContrato(false)}
              filtro={filtroLocal}
              height="590px"
            />
          )}

          {/*******>POPUP DE UNIDAD ORGA.>*********************** */}
          {popupVisibleUnidad && (
            <AdministracionUnidadOrganizativaContratoBuscar
              selectData={selectUnidadOrganizativa}
              showPopup={{ isVisiblePopUp: popupVisibleUnidad, setisVisiblePopUp: setPopupVisibleUnidad }}
              cancelar={() => setPopupVisibleUnidad(false)}
              uniqueId={"PersonaContratoEditPage"}
              selectionMode={"row"}
              filtro={filtroLocal}
            />
          )}

          {/*** PopUp -> Buscar Grupo ****/}
          {popupVisibleCompania && (
            <AdministracionCompaniaBuscar
              selectData={selectCompaniaContratista}
              showPopup={{ isVisiblePopUp: popupVisibleCompania, setisVisiblePopUp: setPopupVisibleCompania }}
              cancelarEdicion={() => setPopupVisibleCompania(false)}
              uniqueId={"administracionCompaniaBuscar"}
            />
          )}

          {/*******>POPUP DE UNIDAD ORGA. CON POSICIONES>******** */}
          {popupVisiblePosicion && (
            <AdministracionPosicionBuscar
              selectData={agregarPopupPosicion}
              showPopup={{ isVisiblePopUp: popupVisiblePosicion, setisVisiblePopUp: setPopupVisiblePosicion }}
              cancelar={() => setPopupVisiblePosicion(false)}
              filtro={filtroLocal}
            />
          )}
        </React.Fragment>
      </PortletBody>
    </>
  );


};

export default injectIntl(WithLoandingPanel(PersonaContratoEditPage));
