import React, { Fragment, useEffect, useState } from 'react';
import { injectIntl } from "react-intl";
import { useSelector } from "react-redux";
import Form, { Item, GroupItem } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar, Portlet } from "../../../../../partials/content/Portlet";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import PropTypes from 'prop-types';
import { isNotEmpty, dateFormat, listarEstadoSimple, listarCondicion, getStartAndEndOfMonthByDay } from "../../../../../../_metronic";
import AdministracionCompaniaBuscar from "../../../../../partials/components/AdministracionCompaniaBuscar";
import AdministracionUnidadOrganizativaBuscar from "../../../../../partials/components/AdministracionUnidadOrganizativaBuscar";

//ADD
import { handleErrorMessages, handleSuccessMessages } from "../../../../../store/ducks/notify-messages";
import AdministracionCentroCostoBuscar from '../../../../../partials/components/AdministracionCentroCostoBuscar';
import PersonaTextAreaPopup from '../../../../../partials/components/PersonaTextAreaPopup/PersonaTextAreaPopup';
import AdministracionPosicionBuscar from "../../../../../partials/components/AdministracionPosicionBuscar";

import { serviceCompania } from "../../../../../api/administracion/compania.api";
import { servicePlanilla } from "../../../../../api/asistencia/planilla.api";
import { obtenerTodos as obtenerTodosTipoPosicion } from "../../../../../api/administracion/tipoPosicion.api";

import { obtenerTodos as obtenerCmbServicio } from "../../../../../api/casino/comedorServicio.api";
import { obtenerTodos as obtenerCmbComedor } from "../../../../../api/casino/comedor.api";

const DetalleDiarioConcumoFilterPage = (props) => {
  const { intl, setLoading, dataMenu } = props;

  //SELECTORS
  const { IdCliente, IdDivision } = useSelector(state => state.perfil.perfilActual);
  const perfil = useSelector(state => state.perfil.perfilActual);

  //SATES
  const [viewFilter, setViewFilter] = useState(true);
  const [popupVisibleCompania, setPopupVisibleCompania] = useState(false);
  const [popupVisibleUnidad, setPopupVisibleUnidad] = useState(false);
  const { FechaInicio, FechaFin } = getStartAndEndOfMonthByDay();
  const [companiaData, setCompaniaData] = useState([]);
  const [varIdCompania, setVarIdCompania] = useState("");
  const [selectedCompany, setSelectedCompany] = useState({});
  const [isVisibleCentroCosto, setisVisibleCentroCosto] = useState(false);
  const [Filtros, setFiltros] = useState({ FlRepositorio: "1", IdUnidadOrganizativa: "" });
  const [popupVisiblePersonas, setPopupVisiblePersonas] = useState(false);
  const [cmbComedor, setCmbComedor] = useState([]);
  const [cmbServicio, setCmbServicio] = useState([]);

  props.dataRowEditNew.FechaInicio = dateFormat(FechaInicio, 'yyyyMMdd');
  props.dataRowEditNew.FechaFin = dateFormat(FechaFin, 'yyyyMMdd');

  //SELECCIONES
  const selectCompania = (dataPopup) => {
    const { IdCompania, Compania } = dataPopup[0];
    props.dataRowEditNew.IdCompania = IdCompania;
    props.dataRowEditNew.Compania = Compania;
    setPopupVisibleCompania(false);
  }

  const selectUnidadOrganizativa = async (selectedRow) => {
    let strUnidadesOrganizativas = selectedRow.map(x => x.IdUnidadOrganizativa).join('|');
    let UnidadesOrganizativasDescripcion = selectedRow.map(x => x.Menu).join(',');
    props.dataRowEditNew.IdUnidadOrganizativa = strUnidadesOrganizativas;
    props.dataRowEditNew.UnidadesOrganizativas = UnidadesOrganizativasDescripcion;
    setPopupVisibleUnidad(false);
  };

  const selectPersonas = (data) => {
    if (isNotEmpty(data)) {
      let strPersonas = data.split('|').join(',');
      props.dataRowEditNew.Personas = strPersonas;
    }
  }

  const agregarCentroCosto = (dataPopup) => {
    const { IdCentroCosto, CentroCosto } = dataPopup[0];
    props.dataRowEditNew.IdCentroCosto = IdCentroCosto;
    props.dataRowEditNew.CentroCosto = CentroCosto;
    setisVisibleCentroCosto(false);
  };

  //ADD-> LISTADOS
  async function listaComedores() {
    await Promise.all([
      obtenerCmbComedor({ IdCliente: perfil.IdCliente, IdDivision: perfil.IdDivision, IdTipo: '%' }),
    ])
      .then(resp => {
        setCmbComedor(resp[0]);
      })
      .finally(resp => {
        setLoading(false);
      })
  }

  async function CargarServicios(idComedor) {
    let cmbServicioX = await obtenerCmbServicio({ IdCliente: perfil.IdCliente, IdDivision: perfil.IdDivision, IdComedor: idComedor });
    setCmbServicio(cmbServicioX);
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
      changeValueCompany(company[0]);
    } else {
      changeValueCompany(null);
    }
  }

  const changeValueCompany = (company) => {
    if (isNotEmpty(company)) {
      const { IdCompania } = company;
      setSelectedCompany(company);
      setVarIdCompania(IdCompania);
    } else {
      setSelectedCompany("");
      setVarIdCompania("");
    }
  }

  // EFFECTS
  useEffect(() => {
    if (!isNotEmpty(varIdCompania)) {
      if (companiaData.length > 0) {
        const { IdCompania } = companiaData[0];
        var company = companiaData.filter(x => x.IdCompania === IdCompania);
        getCompanySeleccionada(IdCompania, company);
        props.setDataIdCompania(companiaData)

      }
    }
  }, [companiaData]);

  useEffect(() => {
    listarCompanias();
    listaComedores();
  }, []);


  //FUNCTIONS
  const clearRefresh = () => {

    props.setDataRowEditNew({
      TipoReporte: 'S',
      IdDivision: '',

      IdCompania: '',
      IdUnidadOrganizativa: '',
      Personas: '',
      IdComedor: '',
      IdServicio: '',
      IdCentroCosto: '',

      FechaInicio: dateFormat(FechaInicio, 'yyyyMMdd'),
      FechaFin: dateFormat(FechaFin, 'yyyyMMdd'),

    });
    props.clearDataGrid();
  }

  // LISTAR REGISTROS: GRID
  const getFiltrar = async () => {

    let filtro = {

      IdCliente: IdCliente,
      IdDivision: isNotEmpty(IdDivision) ? IdDivision : "%",

      IdCompania: isNotEmpty(props.dataRowEditNew.IdCompania) ? props.dataRowEditNew.IdCompania : "%",
      IdUnidadOrganizativa: isNotEmpty(props.dataRowEditNew.IdUnidadOrganizativa) ? props.dataRowEditNew.IdUnidadOrganizativa : "",
      Personas: isNotEmpty(props.dataRowEditNew.Personas) ? props.dataRowEditNew.Personas : "",
      IdComedor: isNotEmpty(props.dataRowEditNew.IdComedor) ? props.dataRowEditNew.IdComedor : "",
      IdServicio: isNotEmpty(props.dataRowEditNew.IdServicio) ? props.dataRowEditNew.IdServicio : "",
      IdCentroCosto: isNotEmpty(props.dataRowEditNew.IdCentroCosto) ? props.dataRowEditNew.IdCentroCosto : "",

      FechaInicio: isNotEmpty(props.dataRowEditNew.FechaInicio) ? (dateFormat(props.dataRowEditNew.FechaInicio, 'yyyyMMdd') == "NaNaNaN" ? props.dataRowEditNew.FechaInicio : dateFormat(props.dataRowEditNew.FechaInicio, 'yyyyMMdd')) : "",
      FechaFin: isNotEmpty(props.dataRowEditNew.FechaFin) ? (dateFormat(props.dataRowEditNew.FechaFin, 'yyyyMMdd') == "NaNaNaN" ? props.dataRowEditNew.FechaFin : dateFormat(props.dataRowEditNew.FechaFin, 'yyyyMMdd')) : "",

      
      OrderField: "TipoModulo",
      OrderDesc: 0,
      skip: "0",
      take: "20"
 
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

        <Form formData={props.dataRowEditNew} validationGroup="FormEdicion">
          <GroupItem itemType="group">

            <Item
              dataField="Compania"
              colSpan={2}
              label={{ text: intl.formatMessage({ id: "CASINO.CONSOLIDATED.REPORT.DININGROOMS" }) }}
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
                      setPopupVisibleCompania(true);
                    },
                  }
                }]
              }}
            />

            <Item
              dataField="UnidadesOrganizativas"
              colSpan={2}
              label={{ text: intl.formatMessage({ id: "ADMINISTRATION.POSITION.ORGANIZATIONALUNIT" }) }}
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
              dataField="IdComedor"
              colSpan={1}
              label={{ text: intl.formatMessage({ id: "CASINO.DINNINGROOM" }) }}
              editorType="dxSelectBox"
              editorOptions={{
                items: cmbComedor,
                valueExpr: "IdComedor",
                displayExpr: "Comedor",
                showClearButton: true,
                onValueChanged: (e) => {
                  if (isNotEmpty(e.value)) {
                    CargarServicios(e.value);
                  }
                },
              }}
            />

            <Item
              dataField="IdServicio"
              colSpan={1}
              editorType="dxSelectBox"
              label={{ text: intl.formatMessage({ id: "CASINO.DINNINGROOM.SERVICE" }) }}
              editorOptions={{
                items: cmbServicio,
                valueExpr: "IdServicio",
                showClearButton: true,
                displayExpr: function (item) {
                  if (item) {
                    return item.Servicio + "- [" + item.HoraInicio + " " + item.HoraFin + "]";
                  }
                },
              }}
            />

            <Item
              colSpan={2}
              dataField="CentroCosto"
              label={{ text: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CENTROCOSTO" }), }}
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

          </GroupItem>
        </Form>
      </>
    );
  }

  const grupoTrabajador = (e) => {
    return (
      <>

        <Form formData={props.dataRowEditNew} validationGroup="FormEdicion">
          <GroupItem itemType="group" colCount={2} >

            <Item
              colSpan={2}
              dataField="Personas"
              label={{ text: intl.formatMessage({ id: "SECURITY.USER.DOCUMENTNUMBER" }) }}
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

          </GroupItem>
        </Form>
      </>
    );
  }

  const fechas = (e) => {
    return (
      <>

        <Form formData={props.dataRowEditNew} validationGroup="FormEdicion">
          <GroupItem itemType="group" colCount={2} >

            <Item
              dataField="FechaInicio"
              label={{
                text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.STARTDATE" }),
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
                text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.ENDDATE" }),
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
          <Form id="FormFilter" formData={props.dataRowEditNew} validationGroup="FormEdicion" >
            <GroupItem itemType="group" colCount={2} colSpan={2}>

              <div className="row">

                <div className="col-md-6">
                  <fieldset className="scheduler-border" >
                    <legend className="scheduler-border" >   <h5>{intl.formatMessage({ id: "ACCREDITATION.PEOPLE.GENERALDATA" })} </h5></legend>
                    {datosGenerales()}
                  </fieldset>
                </div>

                <div className="col-md-6">
                  <fieldset className="scheduler-border" >
                    <legend className="scheduler-border" >
                      <h5>{intl.formatMessage({ id: "ACCREDITATION.REQUIREMENT" })} </h5>
                    </legend>
                    {grupoControl()}
                  </fieldset>
                </div>

                <div className="col-md-6" style={{ marginTop: "10px" }}>
                  <fieldset className="scheduler-border" >
                    <legend className="scheduler-border" >   <h5> {intl.formatMessage({ id: "ADMINISTRATION.POSITION.WORKER" })}   </h5></legend>
                    {grupoTrabajador()}
                  </fieldset>
                </div>

                <div className="col-md-6" style={{ marginTop: "10px" }}>
                  <fieldset className="scheduler-border" >
                    <legend className="scheduler-border" >   <h5>{intl.formatMessage({ id: "ACCESS.DATE" })} </h5></legend>
                    {fechas()}
                  </fieldset>
                </div>
              </div>

            </GroupItem>
          </Form>

        </React.Fragment>
      </PortletBody>

      {/*******>POPUP DE COMPANIAS>******** */}
      {popupVisibleCompania && (
        <AdministracionCompaniaBuscar
          selectData={selectCompania}
          showPopup={{ isVisiblePopUp: popupVisibleCompania, setisVisiblePopUp: setPopupVisibleCompania }}
          cancelarEdicion={() => setPopupVisibleCompania(false)}
          uniqueId={"ReportecompaniabuscarRequisitoPage"}
        />
      )}


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

      {/*******>POPUP NUMERO DE DOCUMENTOS>******** */}
      {popupVisiblePersonas && (
        <PersonaTextAreaPopup
          isVisiblePopupDetalle={popupVisiblePersonas}
          setIsVisiblePopupDetalle={setPopupVisiblePersonas}
          obtenerNumeroDocumento={selectPersonas}
        // datosReservaDetalle={datosReservaDetalle}
        />
      )}

    </Fragment >
  );
};


function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <Portlet
      component="div"
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <>{children}</>}
    </Portlet>
  );
}

TabPanel.propTypes =
{
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

export default injectIntl(WithLoandingPanel(DetalleDiarioConcumoFilterPage));
