import React, { Fragment, useEffect, useState } from 'react';
import { injectIntl } from "react-intl";
import { useSelector } from "react-redux";
import Form, { Item, GroupItem } from "devextreme-react/form";
import { Button } from "devextreme-react";

import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import { isNotEmpty, dateFormat, listarEstadoSimple, getStartAndEndOfMonthByDay, getDateOfDay } from "../../../../../../_metronic";
import AdministracionUnidadOrganizativaBuscar from "../../../../../partials/components/AdministracionUnidadOrganizativaBuscar";
import { handleErrorMessages } from "../../../../../store/ducks/notify-messages";
import AdministracionCentroCostoBuscar from '../../../../../partials/components/AdministracionCentroCostoBuscar';
import PersonaTextAreaCodigosPopup from '../../../../../partials/components/PersonaTextAreaPopup/PersonaTextAreaCodigosPopup';

import AdministracionPosicionBuscar from "../../../../../partials/components/AdministracionPosicionBuscar";
import { serviceCompania } from "../../../../../api/administracion/compania.api";
import { servicePlanilla } from "../../../../../api/asistencia/planilla.api";
// 2.
import AsistenciaPersonaBuscarReporte from '../../../../../partials/components/AsistenciaPersonaBuscarReporte';

const ResultadoCalculoAsistenciaFilterPage = (props) => {
  const { intl, setLoading, dataMenu, dataRowEditNew } = props;
  const { IdCliente, IdDivision } = useSelector(state => state.perfil.perfilActual);
  const [viewFilter, setViewFilter] = useState(true);
  const [companiaData, setCompaniaData] = useState([]);
  const [varIdCompania, setVarIdCompania] = useState("");
  const [Filtros, setFiltros] = useState({ FlRepositorio: "1", IdUnidadOrganizativa: "" });
  const [planillas, setPlanilla] = useState([]);
 
  const [popupVisiblePersonas, setPopupVisiblePersonas] = useState(false);
  const [popupVisibleUnidad, setPopupVisibleUnidad] = useState(false);
  const [popupVisiblePosicion, setPopupVisiblePosicion] = useState(false);
  const [isVisibleCentroCosto, setisVisibleCentroCosto] = useState(false);
  const [popupVisibleCodigoPlanilla, setPopupVisibleCodigoPlanilla] = useState(false);

 
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


  //ADD-> LISTADOS
  async function listarPlanilla(strIdCompania) {
    setLoading(true);

    if (!isNotEmpty(strIdCompania)) return;

    await servicePlanilla.listar(
      {
        IdCliente
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

  async function listarCompanias() {

    let data = await serviceCompania.obtenerTodosConfiguracion({
      IdCliente: IdCliente,
      IdModulo: dataMenu.info.IdModulo,
      IdAplicacion: dataMenu.info.IdAplicacion,
      IdConfiguracion: "ID_COMPANIA"
    }
    ).catch(err => { handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err) });
    setCompaniaData(data);

  }

  async function getCompanySeleccionada(idCompania, company) {
    if (isNotEmpty(idCompania)) {
      setVarIdCompania(idCompania);
    }
  }

  useEffect(() => {
    if (!isNotEmpty(varIdCompania)) {

      if (companiaData.length > 0) {
        const { IdCompania } = companiaData[0];
        var company = companiaData.filter(x => x.IdCompania === IdCompania);
        getCompanySeleccionada(IdCompania, company);
        props.setDataIdCompania(companiaData)

        listarPlanilla(IdCompania);

      }

    }
  }, [companiaData]);


  // ADD
  useEffect(() => {
    listarCompanias();

  }, []);


  //LIMPIAR FORMULARIO
  const clearRefresh = () => {
    const { FechaInicio, FechaFin } = getDateOfDay();
    props.setDataRowEditNew({
      IdCompania: varIdCompania,
      //IdDivision: '',
      IdUnidadOrganizativa: '',
      IdPosicion: '',
      Personas: '',
      IdCentroCosto: '',
      IdPlanilla: '',
      CodigoPlanilla:'',
      Activo: 'S',
      FechaInicio: FechaInicio,
      FechaFin: FechaFin,

    });

    props.clearDataGrid();
  }

  // LISTAR REGISTROS: GRID
  const getFiltrar = async () => {

    let filtro = {
      IdCliente: IdCliente,
      IdDivision: isNotEmpty(IdDivision) ? IdDivision : "%",
      IdCompania: varIdCompania,
      IdUnidadOrganizativa: isNotEmpty(dataRowEditNew.IdUnidadOrganizativa) ? dataRowEditNew.IdUnidadOrganizativa : "",
      IdPosicion: isNotEmpty(dataRowEditNew.IdPosicion) ? dataRowEditNew.IdPosicion : "",
      Personas: isNotEmpty(dataRowEditNew.Personas) ? dataRowEditNew.Personas : "",
      IdCentroCosto: isNotEmpty(dataRowEditNew.IdCentroCosto) ? dataRowEditNew.IdCentroCosto : "",
      IdPlanilla: isNotEmpty(dataRowEditNew.IdPlanilla) ? dataRowEditNew.IdPlanilla : "",
      CodigoPlanilla: isNotEmpty(dataRowEditNew.CodigoPlanilla) ?dataRowEditNew.CodigoPlanilla:"",
      Estado: isNotEmpty(dataRowEditNew.Activo) ? dataRowEditNew.Activo : "",
      FechaInicio: dateFormat(dataRowEditNew.FechaInicio, 'yyyyMMdd'),
      FechaFin: dateFormat(dataRowEditNew.FechaFin, 'yyyyMMdd'),

    }

    props.filtrarReporte(filtro);

  }
  //OCULTAR FILTROS
  const hideFilter = () => {
    let form = document.getElementById("FormFilter");
    if (viewFilter) {
      setViewFilter(false);
      form.classList.add('hidden');
    } else {
      form.classList.remove('hidden');
      setViewFilter(true);
    }
  }

  const datosGenerales = (e) => {
    return (
      <>

        <Form formData={dataRowEditNew} validationGroup="FormEdicion">
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
                    // props.setFocusedRowKey();
                    //JDL->2022-11-25->Actualizar plantilla por compania.
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
              label={{ text: intl.formatMessage({ id: "ASISTENCIA.REPORT.TRABAJADORSINHORARIO.TIPOPLANTILLA" }) }}
              editorType="dxSelectBox"
              colSpan={2}            
              editorOptions={{
                items: planillas,
                valueExpr: "IdPlanilla",
                displayExpr: "Planilla",
                searchEnabled: true,
                showClearButton: true,
               
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
        <Form formData={dataRowEditNew} validationGroup="FormEdicion">
          <GroupItem itemType="group" colCount={2} >
            
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

           <Item
              dataField="Activo"
              label={{ text: intl.formatMessage({ id: "CASINO.REPORT.WORKINGSTATUS" }) }}
              editorType="dxSelectBox"
              editorOptions={{
                items: listarEstadoSimple(),
                valueExpr: "Valor",
                displayExpr: "Descripcion",
                showClearButton: true,
                
              }}
            />

          </GroupItem>
        </Form>
      </>
    );
  }

  
  const fechas = (e) => {
    return (
      <>

        <Form formData={dataRowEditNew} validationGroup="FormEdicion">
          <GroupItem itemType="group" colCount={2} >

            <Item
              dataField="FechaInicio"
              label={{
                text: intl.formatMessage({ id: "ACREDITATION.R001.REPORT.PERIOD" }),
              }}
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
              isRequired={true}
              editorType="dxDateBox"
              dataType="date"
              editorOptions={{
                inputAttr: { style: "text-transform: uppercase" },
                displayFormat: "dd/MM/yyyy",
              }}
            />

          </GroupItem>
        </Form>
      </>
    );
  }


  async function agregarPersonaAsistencia(personas) {
    dataRowEditNew.ListaPersona = personas.map(x => ({ Documento: x.Documento, NombreCompleto: x.NombreCompleto }));
    let cadenaMostrar = personas.map(x => (x.NombreCompleto)).join(', ');
    if (cadenaMostrar.length > 100) {
      cadenaMostrar = cadenaMostrar.substring(0, 100) + '...';
    }
    dataRowEditNew.ListaPersonaView = cadenaMostrar;
    dataRowEditNew.Personas = personas.map(x => (x.Documento)).join('|');

    setPopupVisiblePersonas(false);
  }

  return (

    <Fragment>
      <PortletHeader
        title={""}
        toolbar={
          <PortletHeaderToolbar>

            <Button icon={viewFilter ? "chevronup" : "chevrondown"}
              type="default"
              hint={viewFilter ? intl.formatMessage({ id: "COMMON.HIDE" }) : intl.formatMessage({ id: "COMMON.SHOW" })}
              onClick={hideFilter} />
            &nbsp;
            <Button
              icon="fa fa-search"
              type="default"
              hint={intl.formatMessage({ id: "ACTION.FILTER" })}
              onClick={getFiltrar}
              useSubmitBehavior={true}
              validationGroup="FormEdicion"
            />

            &nbsp;
            <Button icon="refresh"
              type="default"
              hint={intl.formatMessage({ id: "ACTION.CLEAN" })}
              onClick={clearRefresh} />

            &nbsp;
            <Button
              icon="fa fa-file-excel"
              type="default"
              hint={intl.formatMessage({ id: "ACTION.EXPORT" })}
              onClick={props.exportReport}
            />

          </PortletHeaderToolbar>

        } />

      <PortletBody >
        <React.Fragment>
          
          <Form id="FormFilter" formData={dataRowEditNew} validationGroup="FormEdicion" >
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

                <div className="col-md-6" >
                  <fieldset className="scheduler-border" >
                    <legend className="scheduler-border" > <h5>-</h5></legend>
                    {fechas()}
                  </fieldset>
                </div>
              </div>

            </GroupItem>
          </Form>

        </React.Fragment>
      </PortletBody>

      {/*******>POPUP DE UNIDAD ORGA.>******** */}
      {popupVisibleUnidad && (
        <AdministracionUnidadOrganizativaBuscar
          selectData={selectUnidadOrganizativa}
          showPopup={{ isVisiblePopUp: popupVisibleUnidad, setisVisiblePopUp: setPopupVisibleUnidad }}
          cancelarEdicion={() => setPopupVisibleUnidad(false)}
          selectionMode={"multiple"}
          showCheckBoxesModes={"normal"}
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

     
  {/*******>POPUP NUMERO CODIGO PLANILLA>******** */}
        {popupVisibleCodigoPlanilla && (
          <PersonaTextAreaCodigosPopup
            isVisiblePopupDetalle={popupVisibleCodigoPlanilla}
            setIsVisiblePopupDetalle={setPopupVisibleCodigoPlanilla}
            obtenerCodigoIngresado={obtenerCodigoPlanilla}
        
          />
        )} 
      {popupVisiblePersonas && (
        <AsistenciaPersonaBuscarReporte
          showPopup={{ isVisiblePopUp: popupVisiblePersonas, setisVisiblePopUp: setPopupVisiblePersonas }}
          cancelar={() => setPopupVisiblePersonas(false)}
          agregar={agregarPersonaAsistencia}
          selectionMode={"multiple"}
          uniqueId={"ReportePersonalConHorario_AsistenciaPersonaBuscar"}
          varIdCompania={varIdCompania}
        />
      )}

    </Fragment >
  );
};


export default injectIntl(WithLoandingPanel(ResultadoCalculoAsistenciaFilterPage));
