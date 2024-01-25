import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import Form, { Item, GroupItem } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../../store/config/Styles";
import { useSelector } from "react-redux";

import AdministracionContratoBuscar from "../../../../../partials/components/AdministracionContratoBuscar";
import AdministracionCompaniaBuscar from "../../../../../partials/components/AdministracionCompaniaBuscar";

import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import { handleInfoMessages } from "../../../../../store/ducks/notify-messages";

import { PatterRuler, isNotEmpty ,listarEstadoSimple} from "../../../../../../_metronic";

import { isRequired, isModified } from "../../../../../../_metronic/utils/securityUtils";

import { obtenerTodos as obtenerCmbDivision } from "../../../../../api/administracion/contratoDivision.api";
import { serviceContratoUnidad } from "../../../../../api/administracion/contratoUnidadOrganizativa.api";
import { obtenerTodos as obtenerCmbSubContratista } from "../../../../../api/administracion/contratoSubcontratista.api";
import { obtenerTodos as obtenerCmbCentroCosto } from "../../../../../api/administracion/contratoCentroCosto.api";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";


const VehiculoContratoEditPage = props => {
  const { intl, setLoading, modoEdicion, settingDataField, accessButton, dataRowEditNew, ocultarEdit, setDataRowEditNew,setFechasContrato,fechasContrato } = props;
  const { IdCliente } = useSelector(state => state.perfil.perfilActual);
  const classesEncabezado = useStylesEncabezado();
  const [popupVisibleContrato, setPopupVisibleContrato] = useState(false);
  const [filtroLocal, setFiltroLocal] = useState({
    IdCliente, IdCompaniaMandante: "", IdCompaniaContratista: "", IdContrato: "", IdUnidadOrganizativa: "", Contratista: "", Activo:'S'
  });
  const [cmbDivision, setCmbDivision] = useState([]);
  const [cmbUnidadOrganizativa, setCmbUnidadOrganizativa] = useState([]);
  const [cmbSubContratista, setCmbSubContratista] = useState([]);
  const [cmbCentroCosto, setCmbCentroCosto] = useState([]);

  const [popupVisibleCompania, setPopupVisibleCompania] = useState(false);


  async function onChangeUO(target) {
    let cmbCentroCosto = await obtenerCmbCentroCosto({
      IdCliente: IdCliente,
      IdCompaniaMandante: props.dataRowEditNew.IdCompaniaMandante,
      IdCompaniaContratista: props.dataRowEditNew.IdCompaniaContratista,
      IdContrato: props.dataRowEditNew.IdContrato,
      IdUnidadOrganizativa: props.dataRowEditNew.IdUnidadOrganizativa,
      IdCentroCosto: ''
    });
    setCmbCentroCosto(cmbCentroCosto);
  }


  async function cargarCombos(filtro) {

    const { IdContrato, IdCompaniaMandante, IdCompaniaContratista, IdUnidadOrganizativa } = filtro;

    if (!isNotEmpty(IdContrato)) return;

    setLoading(true);

    let cmbDivision = await obtenerCmbDivision({
      IdCliente: IdCliente,
      IdContrato: IdContrato,
      IdCompaniaMandante: IdCompaniaMandante,
      IdCompaniaContratista: IdCompaniaContratista,
      IdDivision: '%'
    });

    let cmbUnidadOrganizativa = await serviceContratoUnidad.obtenerTodos({
      IdCliente: IdCliente,
      IdContrato: IdContrato,
      IdCompaniaMandante: IdCompaniaMandante,
      IdCompaniaContratista: IdCompaniaContratista,
      IdUnidadOrganizativa: ''

    });

    let cmbSubContratista = await obtenerCmbSubContratista({
      IdCliente: IdCliente,
      IdCompaniaMandante: IdCompaniaMandante,
      IdCompaniaContratista: IdCompaniaContratista,
      IdContrato: IdContrato
    });

    let cmbCentroCosto = await obtenerCmbCentroCosto({
      IdCliente: IdCliente,
      IdCompaniaMandante: IdCompaniaMandante,
      IdCompaniaContratista: IdCompaniaContratista,
      IdContrato: IdContrato,
      IdUnidadOrganizativa: IdUnidadOrganizativa,
      IdCentroCosto: ''
    });

    setCmbDivision(cmbDivision);
    setCmbUnidadOrganizativa(cmbUnidadOrganizativa);
    setCmbSubContratista(cmbSubContratista);
    setCmbCentroCosto(cmbCentroCosto);

    setLoading(false);
  }

  function grabar(e) {
    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (dataRowEditNew.esNuevoRegistro) {
        props.agregarContrato(dataRowEditNew);
      } else {
        props.actualizarContrato(dataRowEditNew);
      }
    }
  }

  /*POPUP CONTRATO*********************************************************/
  const seleccionarContrato = (contrato) => {
    const { IdContrato, Contrato, FechaInicio, FechaFin, IdCompaniaMandante, CompaniaMandante, IdCompaniaContratista,
    CompaniaContratista } = contrato[0];
    dataRowEditNew.IdContrato = IdContrato;
    dataRowEditNew.Contrato = Contrato;
   
    dataRowEditNew.FechaFin = FechaFin;
    dataRowEditNew.IdCompaniaMandante = IdCompaniaMandante;
    dataRowEditNew.CompaniaMandante = CompaniaMandante;
    dataRowEditNew.IdCompaniaContratista = IdCompaniaContratista;
    dataRowEditNew.CompaniaContratista = CompaniaContratista;

    setFechasContrato({ FechaInicioContrato: FechaInicio, FechaFinContrato: FechaFin });

    let NuevaFechaInicio = dataRowEditNew.FechaInicio;
    if (Date.parse(new Date(FechaInicio)) > Date.parse(new Date())) {
        NuevaFechaInicio = FechaInicio;
    } else {
        NuevaFechaInicio = new Date();
    }

    dataRowEditNew.FechaInicio = NuevaFechaInicio;
    cargarCombos(contrato[0]);
  };

  const selectCompaniaContratista = dataPopup => {
    const { IdCompania, Compania } = dataPopup[0];
    if (isNotEmpty(IdCompania)) {
        setDataRowEditNew(prev => ({
            ...prev,
            IdCompaniaContratista: IdCompania,
            CompaniaContratista: Compania
        }))

        //La busqueda de contrato solo es por compañia contratista, no mandante
        setFiltroLocal(prev => ({
            ...prev,
            IdCompaniaContratista: IdCompania,
            CompaniaContratista: Compania,
            IdCompaniaMandante: '',
            CompaniaMandante: ''
        }));
        //props.dataRowEditNew.IdCompaniaContratista = IdCompania;
        //props.dataRowEditNew.CompaniaContratista = Compania;
    }
    setPopupVisibleCompania(false);
}

  useEffect(() => {
    if (dataRowEditNew) cargarCombos(dataRowEditNew);
  }, [dataRowEditNew]);

  /*******************************************************************************************/
  return (
    <>
      <HeaderInformation data={props.getInfo()} visible={true} labelLocation={'left'} colCount={6}
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
                  visible={!ocultarEdit}
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
        } />

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
              <Item dataField="IdSecuencial" visible={false} />
              <Item dataField="IdCompaniaMandante" visible={false} />
              {/* <Item dataField="IdCompaniaContratista" visible={false} /> */}
              <Item dataField="IdDivision" visible={false} />

              <Item
                dataField="CompaniaContratista"
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.COMPANY.COMPANY" }) }}
                isRequired={true}
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
                      disabled: (modoEdicion && dataRowEditNew.esNuevoRegistro) ? false: true,
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
                isRequired={modoEdicion ? isRequired('IdContrato', settingDataField) : false}
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
                      stylingMode: 'text',
                      icon: 'search',
                      onClick: (evt) => {
                        //Necesito Compania Mandante y Contratista.
                        const { IdCompaniaContratista, IdCompaniaMandante } = props.dataRowEditNew;
                        // Deben existir
                        setFiltroLocal({ ...filtroLocal, IdCompaniaContratista, IdCompaniaMandante });
                        setPopupVisibleContrato(true);
                      },
                    }
                  }]
                }}
              />

              <Item dataField="Contrato"
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.SUBJECT" }) }}
                isRequired={modoEdicion ? isRequired('Contrato', settingDataField) : false}
                editorOptions={{
                  readOnly: !(modoEdicion ? isModified('Contrato', settingDataField) : false),
                  maxLength: 50,
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  readOnly: ocultarEdit,
                }}
              />

              <Item dataField="CompaniaMandante"
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CLIENTCOMPANY.ABR" }) }}
                isRequired={modoEdicion ? isRequired('CompaniaMandante', settingDataField) : false}
                editorOptions={{
                  readOnly: !(modoEdicion ? isModified('CompaniaMandante', settingDataField) : false),
                  maxLength: 50,
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  readOnly: ocultarEdit,
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
                  placeholder: "Seleccione..",
                  readOnly: ocultarEdit,
                }}
              />

              <Item
                dataField="IdUnidadOrganizativa"
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.POSITION.ORGANIZATIONALUNIT" }) }}
                editorType="dxSelectBox"
                isRequired={modoEdicion ? isRequired('IdUnidadOrganizativa', settingDataField) : false}
                editorOptions={{
                  items: cmbUnidadOrganizativa,
                  valueExpr: "IdUnidadOrganizativa",
                  displayExpr: "UnidadOrganizativa",
                  onValueChanged: (e) => onChangeUO(e.value),
                  showClearButton: true,
                  readOnly: ocultarEdit,
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
                  readOnly: ocultarEdit
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
                  readOnly: ocultarEdit
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
                  min: fechasContrato.FechaInicioContrato,
                  max: fechasContrato.FechaFinContrato,
                  readOnly: ocultarEdit
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
                  min: fechasContrato.FechaInicioContrato,
                  max: fechasContrato.FechaFinContrato,
                  readOnly: ocultarEdit,
                }}
              />

              <Item
              dataField="Activo"
              label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
              editorType="dxSelectBox"
              editorOptions={{
                items: listarEstadoSimple(),
                valueExpr: "Valor",
                displayExpr: "Descripcion",
                readOnly: dataRowEditNew.esNuevoRegistro || ocultarEdit ? true : false,
              }}
            />

            </GroupItem>


          </Form>

        {/*** PopUp Buscar Compania Contrastista ****/}
        {popupVisibleCompania && (
            <AdministracionCompaniaBuscar
              selectData={selectCompaniaContratista}
              showPopup={{ isVisiblePopUp: popupVisibleCompania, setisVisiblePopUp: setPopupVisibleCompania }}
              cancelarEdicion={() => setPopupVisibleCompania(false)}
              uniqueId={"administracionCompaniaBuscarVehiculo"}
            />
          )}


          {/*******>POPUP Buscar Contrato ****************************** */}
          {popupVisibleContrato && (
            <AdministracionContratoBuscar
              selectData={seleccionarContrato}
              showPopup={{ isVisiblePopUp: popupVisibleContrato, setisVisiblePopUp: setPopupVisibleContrato }}
              cancelar={() => setPopupVisibleContrato(false)}
              filtro={filtroLocal}
              dataRowEditNew={dataRowEditNew}
            />
          )}

        </React.Fragment>
      </PortletBody>
    </>
  );


};

export default injectIntl(WithLoandingPanel(VehiculoContratoEditPage));
