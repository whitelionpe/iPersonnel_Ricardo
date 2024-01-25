import React, { useEffect, useState } from "react";
import { FormattedMessage, injectIntl } from "react-intl";
import Form, { Item, GroupItem } from "devextreme-react/form";

import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../../store/config/Styles";
import { useSelector } from "react-redux";

import AdministracionUnidadOrganizativaBuscar from "../../../../../partials/components/AdministracionUnidadOrganizativaBuscar";
import AdministracionPosicionBuscar from "../../../../../partials/components/AdministracionPosicionBuscar";
import AdministracionCompaniaBuscar from "../../../../../partials/components/AdministracionCompaniaBuscar";
import { dateFormat, isNotEmpty } from "../../../../../../_metronic";

import { listarEstadoSimple, listarDivision, listarTipoPosicion } from "../../../../../../_metronic";
import { handleInfoMessages, handleWarningMessages } from "../../../../../store/ducks/notify-messages";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import PropTypes from 'prop-types';
import { isRequired, isModified } from "../../../../../../_metronic/utils/securityUtils";
import ControlSwitch from "../../../../../store/ducks/componente/componenteSwitch";
import { obtenerTodos as obtenerMotivosCese } from "../../../../../api/administracion/motivoCese.api";
import { servicioPersonaPosicion } from "../../../../../api/administracion/personaPosicion.api";
import { servicePersonaContrato } from "../../../../../api/administracion/personaContrato.api";
import { obtenerTodos as listarFuncion } from "../../../../../api/administracion/funcion.api";

const PersonaPosicionEditPage = props => {

  const { IdCliente, IdDivision } = useSelector(state => state.perfil.perfilActual);
  const { dataRowEditNew, intl, setLoading, idMotivoCese, modoEdicion, settingDataField, accessButton, varIdPersona } = props;

  const [estadoSimple, setEstadoSimple] = useState([]);
  const classesEncabezado = useStylesEncabezado();

  const [popupVisibleCompania, setPopupVisibleCompania] = useState(false);
  const [popupVisiblePosicion, setPopupVisiblePosicion] = useState(false);
  const [popupVisibleUnidad, setPopupVisibleUnidad] = useState(false);

  const [cmbFuncion, setCmbFuncion] = useState([]);
  const [cmbTipoPosicion, setCmbTipoPosicion] = useState([]);
  const [cmbDivision, setCmbDivision] = useState([]);
  const [motivoCese, setMotivoCese] = useState([]);
  const [motivoCeseSwitch, setMotivoCeseSwitch] = useState(false);

  const [filtroLocal, setFiltroLocal] = useState({
    IdCliente, IdDivision: "", IdUnidadOrganizativa: "", IdFuncion: "", IdTipoPosicion: ""
  });

  async function cargarCombos() {
    setLoading(true);
    const { FlgContratista } = dataRowEditNew;
    let estadoSimple = listarEstadoSimple();
    let cmbDivision = await listarDivision({ IdCliente });
    let cmbTipoPosicion = await listarTipoPosicion({ IdCliente });
    let cmbFuncion = await listarFuncion({ IdCliente, Contratista: isNotEmpty(FlgContratista) ? FlgContratista : "" });
    let motivoCese = await obtenerMotivosCese({ IdCliente }).finally(() => { setLoading(false); });

    setCmbDivision(cmbDivision);
    setCmbTipoPosicion(cmbTipoPosicion);
    setCmbFuncion(cmbFuncion);
    setEstadoSimple(estadoSimple);
    setMotivoCese(motivoCese);

  }


  const selectCompania = async dataPopup => {
    // console.log("selectCompania|Ingreso");
    const { IdCompania, Compania, Contratista } = dataPopup[0];

    dataRowEditNew.IdCompania = IdCompania;
    dataRowEditNew.Compania = Compania;
    dataRowEditNew.FlgContratista = Contratista;

    if (Contratista === 'S') {
      setLoading(true);
      await servicePersonaContrato.obtenerTodos({
        IdCliente: IdCliente,
        IdPersona: varIdPersona,
        IdCompaniaMandante: "",
        IdCompaniaContratista: IdCompania,
        IdDivision: IdDivision,
        IdContrato: ""
      }).then(async response => {

        if (response.length > 0) {

          props.setDataRowEditNew({
            ...dataRowEditNew,
            IdContrato: response[0].IdContrato,
            IdDivision: response[0].IdDivision,
            IdUnidadOrganizativa: response[0].IdUnidadOrganizativa,
            UnidadOrganizativa: response[0].UnidadOrganizativa,
            FechaInicio: new Date(),
            FechaFin: response[0].FechaFin,
            IdFuncion: '',
            IdTipoPosicion: '',
            IdPosicion: '',
            Posicion: '',
            FechaMin: response[0].FechaInicio,
            FechaMax: response[0].FechaFin,
          });

          await listarFuncion({ IdCliente, Contratista: 'S' }).then(data => {
            setCmbFuncion(data);
          });
        }
        else {
          props.setDataRowEditNew({
            ...dataRowEditNew,
            IdContrato: '',
            IdDivision: '',
            IdUnidadOrganizativa: '',
            UnidadOrganizativa: '',
            FechaInicio: new Date(),
            FechaFin: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
            IdFuncion: '',
            IdTipoPosicion: '',
            IdPosicion: '',
            Posicion: '',
            FechaMax: null,
            FechaMin: null,
          });
          handleInfoMessages(intl.formatMessage({ id: "ADMINISTRATION.MESSAGE.PERSON.NOTCONTRACT" }));
        }

      }).finally(() => setLoading(false));

    }
    else {
      let data = await listarFuncion({ IdCliente, Contratista: 'N' });
      setCmbFuncion(data);

      props.setDataRowEditNew({
        ...dataRowEditNew,
        IdContrato: '',
        IdDivision: '',
        IdUnidadOrganizativa: '',
        UnidadOrganizativa: '',
        FechaInicio: new Date(),
        FechaFin: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
        IdFuncion: '',
        IdTipoPosicion: '',
        IdPosicion: '',
        Posicion: '',
        FechaMax: null,
        FechaMin: null,
        FechaInicioContrato: null,
        FechaFinContrato: null,
        Asunto: ''
      });
    }
    setPopupVisibleCompania(false);

  }

  const agregarPopupPosicion = (posiciones) => {
    const { IdDivision, IdPosicion, Posicion, IdFuncion, IdTipoPosicion, Contratista, Fiscalizable, Confianza, PosicionPadre, PersonaPosicionPadre } = posiciones[0];
    // console.log("agregarPopupPosicion|posiciones:", posiciones);
    dataRowEditNew.IdDivision = IdDivision;
    dataRowEditNew.IdPosicion = IdPosicion;
    dataRowEditNew.Posicion = Posicion;
    dataRowEditNew.IdFuncion = IdFuncion;
    dataRowEditNew.IdTipoPosicion = IdTipoPosicion;

    dataRowEditNew.Contratista = Contratista;
    dataRowEditNew.Fiscalizable = Fiscalizable;
    dataRowEditNew.Confianza = Confianza;
    dataRowEditNew.PosicionPadre = PosicionPadre;
    dataRowEditNew.PersonaPosicionPadre = PersonaPosicionPadre;
  }

  const selectUnidadOrganizativa = async (dataPopup) => {

    const { IdUnidadOrganizativa, UnidadOrganizativa } = dataPopup;
    dataRowEditNew.IdUnidadOrganizativa = IdUnidadOrganizativa;
    dataRowEditNew.UnidadOrganizativa = UnidadOrganizativa;
    setPopupVisibleUnidad(false);
  }

  async function grabar(e) {

    let result = e.validationGroup.validate();
    if (result.isValid) {
      setLoading(true);
      const { IdCompania, IdUnidadOrganizativa, IdPosicion, FechaInicio, FechaFin } = dataRowEditNew;

      await servicioPersonaPosicion.validar({
        IdCliente: IdCliente,
        IdCompania,
        IdUnidadOrganizativa,
        IdPersona: varIdPersona,
        IdPosicion,
        FechaInicio: dateFormat(FechaInicio, 'yyyyMMdd'),
        FechaFin: dateFormat(FechaFin, 'yyyyMMdd')
      }).then(response => {
        const { Confirmar, MensajeValidacion } = response;
        if (Confirmar === 0 && isNotEmpty(MensajeValidacion)) {
          handleWarningMessages(MensajeValidacion);
        } else {
          if (dataRowEditNew.esNuevoRegistro) {
            props.agregarPosicion(dataRowEditNew, undefined, Confirmar, MensajeValidacion);
          } else {
            props.actualizarPosicion(dataRowEditNew, undefined, Confirmar, MensajeValidacion);
          }
        }
      }).finally(() => { setLoading(false) })

    }
  }


  useEffect(() => {
    cargarCombos();
  }, []);


  useEffect(() => {

    //Activar o desactivar Shitch del motivo del cese.
    if (isNotEmpty(idMotivoCese)) {
      setMotivoCeseSwitch(true);
    }
    else {
      setMotivoCeseSwitch(false);
    }

  }, [idMotivoCese]);


  const switchControlCese = () => {
    return (
      <>
        <ControlSwitch
          checked={motivoCeseSwitch}
          onChange={e => {
            setMotivoCeseSwitch(e.target.checked)
            if (e.target.checked) {
              dataRowEditNew.IdMotivoCese = '';
              dataRowEditNew.FechaCese = new Date();
              dataRowEditNew.FechaFin = new Date();
            } else {
              dataRowEditNew.IdMotivoCese = '';
              dataRowEditNew.FechaCese = '';
            }
          }}
          disabled={props.disabledControlSwitch}
        />
      </>)
  }


  const DatosGenerales = (e) => {
    return (
      <>

        <Form formData={props.dataRowEditNew} validationGroup="FormEdicion">
          <GroupItem itemType="group" colCount={2} >

            <Item dataField="IdPersona" visible={false} />
            <Item dataField="IdSecuencial" visible={false} />
            <Item dataField="IdPosicion" visible={false} />
            <Item dataField="IdCompania" visible={false} />
            <Item dataField="IdUnidadOrganizativa" visible={false} />

            <Item
              dataField="Compania"
              label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.COMPANY" }) }}
              isRequired={modoEdicion ? isRequired('IdCompania', settingDataField) : false}
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
                    disabled: !dataRowEditNew.esNuevoRegistro ? true : false, //Parte de la llave
                    onClick: () => {
                      setPopupVisibleCompania(true);
                    },
                  }
                }]
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
                readOnly: (dataRowEditNew.FlgContratista === 'N' && modoEdicion === true) ? false : true
              }}
            />

            <Item
              dataField="UnidadOrganizativa"
              label={{ text: intl.formatMessage({ id: "ADMINISTRATION.ORGANIZATIONALUNIT.ORGANIZATIONALUNIT" }) }}
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
                    disabled: (dataRowEditNew.FlgContratista === 'N' && modoEdicion === true) ? false : true,
                    onClick: () => {
                      setPopupVisibleUnidad(true);
                    },
                  }
                }]
              }}
            />

            <Item
              dataField="CodigoPlanilla"
              label={{ text: intl.formatMessage({ id: "ACCESS.PERSON.POSITION.PAYROLL" }) }}
              visible={(dataRowEditNew.FlgContratista === 'N' && modoEdicion === true) ? true : false}
              editorOptions={{
                maxLength: 50,
                inputAttr: { style: "text-transform: uppercase" },
              }}
            />

          </GroupItem>
        </Form>
      </>
    );
  }

  const datosContrato = (e) => {
    return (
      <>

        <Form formData={props.dataRowEditNew} validationGroup="FormEdicion">
          <GroupItem itemType="group" colCount={2} >

            <Item
              dataField="IdContrato"
              label={{ text: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CONTRACT" }) }}
              editorOptions={{
                readOnly: true
              }}
            />

            <Item
              dataField="Asunto"
              label={{ text: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.SUBJECT" }) }}
              editorOptions={{
                readOnly: true
              }}
            />

            <Item dataField="FechaInicioContrato"
              label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.STARTDATE" }) }}
              editorType="dxDateBox"
              dataType="date"
              editorOptions={{
                displayFormat: "dd/MM/yyyy",
                readOnly: true,
              }}
            />

            <Item dataField="FechaFinContrato"
              label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.ENDDATE" }) }}
              editorType="dxDateBox"
              dataType="date"
              editorOptions={{
                displayFormat: "dd/MM/yyyy",
                readOnly: true,
              }}
            />

          </GroupItem>
        </Form>
      </>
    );
  }

  const datosPosicion = (e) => {
    return (
      <>

        <Form formData={props.dataRowEditNew} validationGroup="FormEdicion">

          <GroupItem itemType="group" colCount={2} >

            <Item
              dataField="IdFuncion"
              label={{ text: intl.formatMessage({ id: "ADMINISTRATION.POSITION.FUNCTION" }) }}
              editorType="dxSelectBox"
              isRequired={false}
              editorOptions={{
                items: cmbFuncion,
                valueExpr: "IdFuncion",
                displayExpr: "Funcion",
                showClearButton: true,
                readOnly: props.dataRowEditNew.esNuevoRegistro ? false : true
              }}
            />
            <Item></Item>

            <Item
              dataField="IdTipoPosicion"
              label={{ text: intl.formatMessage({ id: "ADMINISTRATION.POSITION.POSITIONTYPE" }) }}
              isRequired={false}
              editorType="dxSelectBox"
              editorOptions={{
                items: cmbTipoPosicion,
                valueExpr: "IdTipoPosicion",
                displayExpr: "TipoPosicion",
                showClearButton: true,
                readOnly: props.dataRowEditNew.esNuevoRegistro ? false : true
              }}
            />

            <Item
              dataField="Posicion"
              label={{ text: intl.formatMessage({ id: "ADMINISTRATION.POSITION" }) }}
              isRequired={modoEdicion ? isRequired('Posicion', settingDataField) : false}
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
                    disabled: !dataRowEditNew.esNuevoRegistro ? true : false, //Parte de la llave
                    onClick: () => {
                      const { IdDivision, IdUnidadOrganizativa, IdFuncion, IdTipoPosicion, IdCompania } = dataRowEditNew;
                      if (!isNotEmpty(IdCompania)) { handleInfoMessages("Seleccione una Compañia"); return; }
                      if (!isNotEmpty(IdDivision)) { handleInfoMessages("Seleccione una División"); return; }
                      if (!isNotEmpty(IdUnidadOrganizativa)) { handleInfoMessages("Seleccione una Unidad Organizativa"); return; }
                      // if (!isNotEmpty(IdFuncion)) { handleInfoMessages("Seleccione una Función"); return; }
                      // if (!isNotEmpty(IdTipoPosicion)) { handleInfoMessages("Seleccione un Tipo Posición"); return; }
                      setFiltroLocal({ IdDivision, IdUnidadOrganizativa, IdFuncion, IdTipoPosicion, IdCompania, FlgContratista: dataRowEditNew.FlgContratista === 'N' });
                      setPopupVisiblePosicion(true);
                    },
                  }
                }]
              }}
            />



            <Item dataField="FechaInicio"
              label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.STARTDATE" }) }}
              isRequired={modoEdicion ? isRequired('FechaInicio', settingDataField) : false}
              editorType="dxDateBox"
              dataType="date"
              editorOptions={{
                displayFormat: "dd/MM/yyyy",
                readOnly: !(modoEdicion ? isModified('FechaInicio', settingDataField) : false),
                min: dataRowEditNew.FlgContratista === 'S' ? dataRowEditNew.FechaMin : null,
                max: dataRowEditNew.FlgContratista === 'S' ? dataRowEditNew.FechaMax : null,
              }}
            />

            <Item dataField="FechaFin"
              label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.ENDDATE" }) }}
              isRequired={modoEdicion ? isRequired('FechaFin', settingDataField) : false}
              editorType="dxDateBox"
              dataType="date"
              editorOptions={{
                displayFormat: "dd/MM/yyyy",
                readOnly: !motivoCeseSwitch ? !(modoEdicion ? isModified('FechaFin', settingDataField) : false) : true,
                min: dataRowEditNew.FlgContratista === 'S' ? dataRowEditNew.FechaMin : null,
                max: dataRowEditNew.FlgContratista === 'S' ? dataRowEditNew.FechaMax : null,
              }}
            />

            <Item />

            <Item
              dataField="Activo"
              label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
              editorType="dxSelectBox"
              isRequired={modoEdicion}
              editorOptions={{
                items: estadoSimple,
                valueExpr: "Valor",
                displayExpr: "Descripcion",
                readOnly: !(modoEdicion ? (dataRowEditNew.esNuevoRegistro ? false : true) : false)
              }}
            />

            <GroupItem itemType="group" colCount={2} colSpan={2}>
              <GroupItem colSpan={2} >
                <fieldset className="scheduler-border" >
                  <legend className="scheduler-border" >
                    <h5>{intl.formatMessage({ id: "DETALLE POSICIÓN" })} </h5>
                  </legend>
                  {DetallePosicion()}
                </fieldset>
              </GroupItem>
            </GroupItem>

          </GroupItem>
        </Form>
      </>
    );
  }

  const DetallePosicion = (e) => {
    return (
      <>

        <Form formData={props.dataRowEditNew} validationGroup="FormEdicion">
          <GroupItem itemType="group" colCount={2} >

            <GroupItem itemType="group" colCount={2} colSpan={2}>

              <Item dataField="PersonaPosicionPadre"
                label={{ text: intl.formatMessage({ id: "ACCESS.PERSON.POSITION.FATHER" }) }}
                colSpan={1}
                editorOptions={{
                  readOnly: true,
                  inputAttr: { 'style': 'text-transform: uppercase' }
                }}
              />

              <Item dataField="PosicionPadre"
                label={{ text: intl.formatMessage({ id: "ACCESS.PERSON.POSITION.FATHER.POSITION" }) }}
                colSpan={1}
                editorOptions={{
                  readOnly: true,
                  inputAttr: { 'style': 'text-transform: uppercase' }
                }}
              />
            </GroupItem>

            <GroupItem itemType="group" colSpan={2}>

              <Item
                dataField="Contratista"
                label={{
                  text: "Check",
                  visible: false
                }}
                editorType="dxCheckBox"
                editorOptions={{
                  value:
                    dataRowEditNew.Contratista === "S" ? true : false,
                  readOnly: true,
                  text: intl.formatMessage({ id: "ACCESS.PERSON.POSITION.CONTRACTOR" }),
                  width: "100%"
                }}
              />

              <Item
                dataField="Fiscalizable"
                label={{
                  text: "Check",
                  visible: false
                }}
                editorType="dxCheckBox"
                editorOptions={{
                  value:
                    dataRowEditNew.Fiscalizable === "S" ? true : false,
                  readOnly: true,
                  text: intl.formatMessage({ id: "ADMINISTRATION.POSITION.CONTROLLABLE" }),
                  width: "100%"
                }}
              />

              <Item
                dataField="Confianza"
                label={{
                  text: "Check",
                  visible: false
                }}
                editorType="dxCheckBox"
                editorOptions={{
                  value: dataRowEditNew.Confianza === "S" ? true : false,
                  readOnly: true,
                  text: intl.formatMessage({ id: "ADMINISTRATION.POSITION.TRUST" }),
                  width: "100%"
                }}
              />

            </GroupItem>

          </GroupItem>
        </Form>
      </>
    );
  }

  const MotivoCese = (e) => {
    return (
      <>
        <Form formData={props.dataRowEditNew} validationGroup="FormEdicion">
          <GroupItem itemType="group" colCount={3} >
            <Item render={switchControlCese}
              label={{ text: intl.formatMessage({ id: "ADMINISTRATION.CESSATION.ACTIVITE" }) }}
              readOnly={true}
              editorOptions={{
                readOnly: true
              }}
            >
            </Item>
            <Item
              dataField="IdMotivoCese"
              label={{ text: intl.formatMessage({ id: "ADMINISTRATION.REASONCEASE" }) }}
              editorType="dxSelectBox"
              isRequired={modoEdicion ? motivoCeseSwitch : false}
              editorOptions={{
                items: motivoCese,
                valueExpr: "IdMotivoCese",
                displayExpr: "MotivoCese",
                readOnly: !(modoEdicion ? motivoCeseSwitch : false)
              }}
            />
            <Item dataField="FechaCese"
              label={{ text: intl.formatMessage({ id: "ADMINISTRATION.CESSATION.DATE" }) }}
              isRequired={modoEdicion ? motivoCeseSwitch : false}
              editorType="dxDateBox"
              dataType="date"
              editorOptions={{
                inputAttr: { 'style': 'text-transform: uppercase' },
                displayFormat: "dd/MM/yyyy",
                readOnly: !(modoEdicion ? motivoCeseSwitch : false),
                onValueChanged: ((e) => {
                  dataRowEditNew.FechaFin = e.value;
                })
              }}
            />
          </GroupItem>
        </Form>
      </>
    );
  }

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
          <Form formData={dataRowEditNew} validationGroup="FormEdicion" readOnly={isNotEmpty(idMotivoCese) ? true : false}>

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



            </GroupItem>

            <GroupItem itemType="group" colCount={2} colSpan={2}>

              <GroupItem colSpan={2} >

                <fieldset className="scheduler-border" >
                  <legend className="scheduler-border" >
                    <h5>{intl.formatMessage({ id: "ACCREDITATION.PEOPLE.GENERALDATA" })} </h5>
                  </legend>
                  {DatosGenerales()}
                </fieldset>

              </GroupItem>

              <GroupItem colSpan={2} >

                <fieldset className="scheduler-border" >
                  <legend className="scheduler-border" >
                    <h5>{intl.formatMessage({ id: "ACREDITATION.CONTRACT.DATA" })} </h5>
                  </legend>
                  {datosContrato()}
                </fieldset>

              </GroupItem>

              <GroupItem colSpan={2}  >
                <fieldset className="scheduler-border" >
                  <legend className="scheduler-border" >
                    <h5>{intl.formatMessage({ id: "Función y Posición" })} </h5>
                  </legend>
                  {datosPosicion()}
                </fieldset>
              </GroupItem>

              <GroupItem itemType="group" colCount={2} colSpan={2}>
                <GroupItem colSpan={2} >
                  {!(dataRowEditNew.esNuevoRegistro) &&
                    <fieldset className="scheduler-border" >
                      <legend className="scheduler-border" >
                        <h5>{intl.formatMessage({ id: "ADMINISTRATION.REASONCEASE" })} </h5>
                      </legend>
                      {MotivoCese()}
                    </fieldset>
                  }
                </GroupItem>
              </GroupItem>


            </GroupItem>

          </Form>



          {/*******>POPUP DE COMPANIAS>******** */}
          {popupVisibleCompania && (
            <AdministracionCompaniaBuscar
              selectData={selectCompania}
              showPopup={{ isVisiblePopUp: popupVisibleCompania, setisVisiblePopUp: setPopupVisibleCompania }}
              cancelarEdicion={() => setPopupVisibleCompania(false)}
              uniqueId={"AdministracionCompaniaBuscar"}
              selectionMode={"row"}
            />
          )}


          {/*******>POPUP DE UNIDAD ORGA.>******** */}
          {popupVisibleUnidad && (
            <AdministracionUnidadOrganizativaBuscar
              selectData={selectUnidadOrganizativa}
              showPopup={{ isVisiblePopUp: popupVisibleUnidad, setisVisiblePopUp: setPopupVisibleUnidad }}
              cancelarEdicion={() => setPopupVisibleUnidad(false)}
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

PersonaPosicionEditPage.propTypes = {
  showButtons: PropTypes.bool,
  cargaExterna: PropTypes.bool,
}
PersonaPosicionEditPage.defaultProps = {
  showButtons: true,
  cargaExterna: false
}

export default injectIntl(WithLoandingPanel(PersonaPosicionEditPage));
