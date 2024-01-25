import React, { Fragment, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Form, { Item, GroupItem } from "devextreme-react/form";
import { injectIntl } from "react-intl";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";

//FILTROS :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
import AdministracionCompaniaBuscar from "../../../../../partials/components/AdministracionCompaniaBuscar";
import AdministracionUnidadOrganizativaContratoBuscar from "../../../../../partials/components/AdministracionUnidadOrganizativaContratoBuscar";
import {
  listarEstado,
  TYPE_SISTEMA_ENTIDAD,
  isNotEmpty,
  listarEstadoSimple,
  listarTipoReporteSunafil
} from "../../../../../../_metronic";
import { obtenerTodos as obtenerTodosCaracteristicaDetalle } from "../../../../../api/administracion/caracteristicaDetalle.api";
import { obtenerTodos as obtenerTipoEquipo } from "../../../../../api/sistema/tipoequipo.api";
import PersonaTextAreaPopup from "../../../../../partials/components/PersonaTextAreaPopup/PersonaTextAreaPopup";
import { obtenerTodos as obtenerTodosCaracteristica } from "../../../../../api/administracion/caracteristica.api";
import { PortletBody } from "../../../../../partials/content/Portlet";
import { serviceCompania } from "../../../../../api/administracion/compania.api";
import { handleErrorMessages } from "../../../../../store/ducks/notify-messages";
import AdministracionCentroCostoBuscar from "../../../../../partials/components/AdministracionCentroCostoBuscar";
import PersonaTextAreaCodigosPopup from "../../../../../partials/components/PersonaTextAreaPopup/PersonaTextAreaCodigosPopup";
import AdministracionPosicionBuscar from "../../../../../partials/components/AdministracionPosicionBuscar";
import AsistenciaPersonaBuscarReporte from "../../../../../partials/components/AsistenciaPersonaBuscarReporte";
import { servicePlanilla } from "../../../../../api/asistencia/planilla.api";
import AdministracionUnidadOrganizativaBuscar from "../../../../../partials/components/AdministracionUnidadOrganizativaBuscar";
import { serviceGrupo } from "../../../../../api/asistencia/grupo.api";
import { obtenerTodos as obtenerTodosDivisiones ,ObtenerTodosClientePadre as obtenerTodosDivision } from "../../../../../api/sistema/division.api";
 


//import { obtenerTodos as obtenerPersonaCredenciales } from "../../../../../api/identificacion/personaCredencial.api";

const ReporteSunafilFilterPage = props => {
  const { intl, setLoading, dataMenu, dataRowEditNew } = props;
  const perfil = useSelector(state => state.perfil.perfilActual);
  const { IdCliente } = useSelector(state => state.perfil.perfilActual);
  const [popupVisibleCompania, setPopupVisibleCompania] = useState(false);
  const [popupVisibleUnidad, setPopupVisibleUnidad] = useState(false);
  const listadoSimple = listarEstado();

  const [popupVisiblePersonas, setPopupVisiblePersonas] = useState(false);
  const [popupVisiblePosicion, setPopupVisiblePosicion] = useState(false);
  const [isVisibleCentroCosto, setisVisibleCentroCosto] = useState(false);
  const [popupVisibleCodigoPlanilla, setPopupVisibleCodigoPlanilla] = useState(false);

  const [companiaData, setCompaniaData] = useState([]);
  const [varIdCompania, setVarIdCompania] = useState("");
  const [Filtros, setFiltros] = useState({ FlRepositorio: "1", IdUnidadOrganizativa: "" });
  const [planillas, setPlanilla] = useState([]);
  
  const [cmbDivisiones, setCmbDivisiones] = useState([]);

  async function listarCompanias() {
    let data = await serviceCompania.obtenerTodosConfiguracion({
      IdCliente: perfil.IdCliente,
      IdModulo: dataMenu.info.IdModulo,
      IdAplicacion: dataMenu.info.IdAplicacion,
      IdConfiguracion: "ID_COMPANIA"
    }
    ).catch(err => { handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err) });
    setCompaniaData(data);
  }
  
  async function listarDivisiomes() {
    
    let divisiones = await obtenerTodosDivision({ IdCliente: IdCliente });
    setCmbDivisiones(divisiones);   

  }

  async function listarPlanilla(strIdCompania) {
    setLoading(true);

    if (!isNotEmpty(strIdCompania)) return;

    await servicePlanilla.listar(
      {
        IdCliente: perfil.IdCliente
        , IdCompania: strIdCompania
        , IdPlanilla: '%'
        , NumPagina: 0
        , TamPagina: 0
      }
    ).then(planillas => {
      setPlanilla(planillas);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });

  }

  const selectUnidadOrganizativa = async (selectedRow) => {
    let strUnidadesOrganizativas = selectedRow.map(x => x.IdUnidadOrganizativa).join('|');
    let UnidadesOrganizativasDescripcion = selectedRow.map(x => x.Menu).join(',');
    dataRowEditNew.IdUnidadOrganizativa = strUnidadesOrganizativas;
    dataRowEditNew.UnidadesOrganizativas = UnidadesOrganizativasDescripcion;
    setPopupVisibleUnidad(false);
  };

  const selectPosicion = async (dataPopup) => {
    const { IdPosicion, Posicion } = dataPopup[0];
    dataRowEditNew.IdPosicion = IdPosicion;
    dataRowEditNew.Posicion = Posicion;
    setPopupVisiblePosicion(false);
  }

  const obtenerCodigoPlanilla = (data) => {
    if (isNotEmpty(data)) {
      let strCodigos = data.split('|').join(',');
      dataRowEditNew.CodigoPlanilla = strCodigos;
    }
  }

  const agregarCentroCosto = (dataPopup) => {
    const { IdCentroCosto, CentroCosto } = dataPopup[0];
    dataRowEditNew.IdCentroCosto = IdCentroCosto;
    dataRowEditNew.CentroCosto = CentroCosto;
    setisVisibleCentroCosto(false);
  };

  async function getCompanySeleccionada(idCompania, company) {
    if (isNotEmpty(idCompania)) {
      setVarIdCompania(idCompania);
    }
  }

  async function agregarPersonaAsistencia(personas) {
    //setLoading(true); 
    dataRowEditNew.ListaPersona = personas.map(x => ({ Documento: x.Documento, NombreCompleto: x.NombreCompleto }));
    let cadenaMostrar = personas.map(x => (x.NombreCompleto)).join(', ');

    if (cadenaMostrar.length > 100) {
      cadenaMostrar = cadenaMostrar.substring(0, 100) + '...';
    }
    dataRowEditNew.ListaPersonaView = cadenaMostrar;
    dataRowEditNew.Personas = personas.map(x => (x.Documento)).join('|');
    setPopupVisiblePersonas(false);
  }

  useEffect(() => {
    console.log("***[companiaData]");
    if (!isNotEmpty(varIdCompania)) {

      if (companiaData.length > 0) {
        const { IdCompania } = companiaData[0];
        var company = companiaData.filter(x => x.IdCompania === IdCompania);
        getCompanySeleccionada(IdCompania, company);
        // props.setDataIdCompania(companiaData)

        listarPlanilla(IdCompania);
      }

    }
  }, [companiaData]);

  useEffect(() => {
    listarCompanias();
    listarDivisiomes();
  }, []);

  const datosGenerales = (e) => {
    return (
      <>

        <Form formData={props.dataRowEditNew} validationGroup="FormEdicion">
          <GroupItem itemType="group" colCount={2} >
            <Item dataField="IdUnidadOrganizativa" visible={false} />
            <Item dataField="IdPerfil" visible={false} />

            <Item
              dataField="IdCompania"
              label={{ text: intl.formatMessage({ id: "ADMINISTRATION.COMPANY.COMPANY" }) }}
              editorType="dxSelectBox"
              isRequired={true}
              colSpan={2}
              editorOptions={{
                items: companiaData,
                valueExpr: "IdCompania",
                displayExpr: "Compania",
                //showClearButton: true,
                searchEnabled: true,
                value: varIdCompania,
                onValueChanged: (e) => {
                  if (isNotEmpty(e.value)) {
                    var company = companiaData.filter(x => x.IdCompania === e.value);
                    getCompanySeleccionada(e.value, company);
                    listarPlanilla(e.value);
                  }
                },
              }}
            />

            <Item
              dataField="UnidadesOrganizativas"
              label={{ text: intl.formatMessage({ id: "ADMINISTRATION.POSITION.ORGANIZATIONALUNIT" }) }}
              colSpan={2}
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
                    disabled: false,
                    onClick: () => {
                      setPopupVisibleUnidad(true);
                    },
                  }
                }]
              }}
            />

            <Item
              dataField="CentroCosto"
              label={{ text: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CENTROCOSTO" }), }}
              colSpan={2}
              editorOptions={{
                readOnly: true,
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
                      disabled: false,
                      onClick: () => {
                        setFiltros({ FlRepositorio: "1", IdUnidadOrganizativa: "" })
                        setisVisibleCentroCosto(true);
                      },
                    },
                  },
                ],
              }}
            />

            <Item
              dataField="IdPlanilla"
              colSpan={2}
              label={{ text: intl.formatMessage({ id: "ASSISTANCE.PAYROLL" }) }}
              editorType="dxSelectBox"
              editorOptions={{
                items: planillas,
                valueExpr: "IdPlanilla",
                displayExpr: "Planilla",
                searchEnabled: true,
                showClearButton: true,
              }}
            />

            <Item
              dataField="IdDivision"
              colSpan={2}
              label={{ text: intl.formatMessage({ id: "SYSTEM.DIVISION" }) }}
              // isRequired={true}
              editorType="dxSelectBox"
              editorOptions={{
                items: cmbDivisiones,//cmbDivisiones,
                valueExpr: "IdDivision",
                displayExpr: "Division",
                searchEnabled: true,
                showClearButton: true,
                // searchEnabled: true,
                // showClearButton: true,
              }}
            />


          </GroupItem>
        </Form>
      </>
    );
  }

  const grupoControl = (e) => {
    return (
      <>
        <Form formData={props.dataRowEditNew} validationGroup="FormEdicion">
          <GroupItem itemType="group" colCount={2} >

            <Item
              dataField="ListaPersonaView"
              label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.REGIME.PERSON" }) }}
              colSpan={2}
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
                    disabled: false,
                    onClick: () => {
                      setPopupVisiblePersonas(true);
                    },
                  }
                }]
              }} />

            <Item
              dataField="Activo"
              label={{ text: intl.formatMessage({ id: "CASINO.REPORT.WORKINGSTATUS" }) }}
              editorType="dxSelectBox"
              colSpan={2}
              editorOptions={{
                items: listarEstadoSimple(),
                valueExpr: "Valor",
                displayExpr: "Descripcion",
                showClearButton: true,
              }}
            />

            <Item
              dataField="Posicion"
              label={{ text: intl.formatMessage({ id: "ADMINISTRATION.POSITION" }) }}
              colSpan={2}
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
                    disabled: false,
                    onClick: () => {
                      setPopupVisiblePosicion(true);
                    },
                  }
                }]
              }}
            />

            <Item
              dataField="CodigoPlanilla"
              label={{ text: intl.formatMessage({ id: "CASINO.REPORT.SPREADCODE" }), }}
              colSpan={2}
              editorOptions={{
                readOnly: true,
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
                      disabled: false,
                      onClick: () => {
                        setPopupVisibleCodigoPlanilla(true);
                      },
                    },
                  },
                ],
              }}
            />
            {/* <Item colSpan={2}>
              &nbsp; 
            </Item> */}



          </GroupItem>
        </Form>
      </>
    );
  }

  const fechas = (e) => {
    return (
      <>
        <Form formData={props.dataRowEditNew} validationGroup="FormEdicion">
          <GroupItem itemType="group" colCount={4} >

            <Item
              dataField="FechaInicio"
              label={{
                text: intl.formatMessage({ id: "ACREDITATION.R001.REPORT.PERIOD" }),
              }}
              colSpan={1}
              isRequired={true}
              editorType="dxDateBox"
              dataType="date"
              editorOptions={{
                inputAttr: { style: "text-transform: uppercase" },
                displayFormat: "dd/MM/yyyy",
              }}
            />

            <Item
              dataField="FechaFin"
              label={{
                text: intl.formatMessage({ id: "COMMON.DATE_TO" }),
              }}
              colSpan={1}
              isRequired={true}
              editorType="dxDateBox"
              dataType="date"
              editorOptions={{
                inputAttr: { style: "text-transform: uppercase" },
                displayFormat: "dd/MM/yyyy",
              }}
            />

            <Item
              dataField="TipoReporte"
              colSpan={1}
              label={{ text: intl.formatMessage({ id: "ACCESS.REPORT.TYPE" }) }}  
              editorType="dxSelectBox"
              editorOptions={{
                items: listarTipoReporteSunafil(),
                valueExpr: "Valor",
                displayExpr: "Descripcion", 
              }}
            /> 

          </GroupItem>
        </Form>
      </>
    );
  }

  return (
    <Fragment>
      {/* <PortletBody > */}
      <React.Fragment>
        <Form formData={props.dataRowEditNew} validationGroup="FormEdicion">
          <GroupItem itemType="group" colCount={2} colSpan={2}>
            <div className="row">

              <div className="col-md-6">
                <fieldset className="scheduler-border" >
                  <legend className="scheduler-border" > <h5>{intl.formatMessage({ id: "ACCREDITATION.PEOPLE.GENERALDATA" })} </h5></legend>
                  {datosGenerales()}
                </fieldset>
              </div>

              <div className="col-md-6">
                <fieldset className="scheduler-border" >
                  <legend className="scheduler-border" >
                    <h5>{intl.formatMessage({ id: "ADMINISTRATION.POSITION.WORKER" })} </h5>
                  </legend>
                  {grupoControl()}
                </fieldset>
              </div>

              <div className="col-md-12">
                <fieldset className="scheduler-border" >
                  <legend className="scheduler-border" >
                    <h5>{intl.formatMessage({ id: "ACCESS.RANGE.DATE" })} </h5>
                  </legend>

                  {fechas()}
                </fieldset>
              </div>


            </div>
          </GroupItem>
        </Form>
      </React.Fragment>
      {/* </PortletBody> */}

      {/*******>POPUP DE UNIDAD ORGA.>*********************** */}
      {popupVisibleUnidad && (
        <AdministracionUnidadOrganizativaBuscar
          selectData={selectUnidadOrganizativa}
          showPopup={{ isVisiblePopUp: popupVisibleUnidad, setisVisiblePopUp: setPopupVisibleUnidad }}
          cancelarEdicion={() => setPopupVisibleUnidad(false)}
          selectionMode={"multiple"}
          showCheckBoxesModes={"normal"}
        />
      )}

      {/*******>POPUP CENTRO DE COSTOS>******** */}
      {isVisibleCentroCosto && (
        <AdministracionCentroCostoBuscar
          selectData={agregarCentroCosto}
          showButton={false}
          showPopup={{ isVisiblePopUp: isVisibleCentroCosto, setisVisiblePopUp: setisVisibleCentroCosto }}
          cancelarEdicion={() => setisVisibleCentroCosto(false)}
          uniqueId={"centrCostoConsumo01Page"}
          selectionMode={"row"}
          Filtros={Filtros}
        />
      )}





      {/*******>POPUP DE UNIDAD ORGA. CON POSICIONES>******** */}
      {popupVisiblePersonas && (
        <AsistenciaPersonaBuscarReporte
          showPopup={{ isVisiblePopUp: popupVisiblePersonas, setisVisiblePopUp: setPopupVisiblePersonas }}
          cancelar={() => setPopupVisiblePersonas(false)}
          agregar={agregarPersonaAsistencia}
          selectionMode={"multiple"}
          uniqueId={"ReporteMarcas_AsistenciaPersonaBuscar"}
          varIdCompania={varIdCompania}
        />
      )}

      {/*******>POPUP DE UNIDAD ORGA. CON POSICIONES>******** */}
      {popupVisiblePosicion && (
        < AdministracionPosicionBuscar
          selectData={selectPosicion}
          showPopup={{ isVisiblePopUp: popupVisiblePosicion, setisVisiblePopUp: setPopupVisiblePosicion }}
          cancelarEdicion={() => setPopupVisiblePosicion(false)}
          uniqueId={"posionesBuscarPersonaListR003"}
        />
      )}

      {/*******>POPUP NUMERO CODIGO PLANILLA>******** */}
      {popupVisibleCodigoPlanilla && (
        <PersonaTextAreaCodigosPopup
          isVisiblePopupDetalle={popupVisibleCodigoPlanilla}
          setIsVisiblePopupDetalle={setPopupVisibleCodigoPlanilla}
          obtenerCodigoIngresado={obtenerCodigoPlanilla}
        />
      )}



    </Fragment>
  );
};

export default injectIntl(WithLoandingPanel(ReporteSunafilFilterPage));
