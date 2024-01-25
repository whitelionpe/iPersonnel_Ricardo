import React, { Fragment, useEffect, useState } from 'react';
import { injectIntl } from "react-intl";
import { useSelector } from "react-redux";
import Form, { Item, GroupItem } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import { isNotEmpty, dateFormat, listarEstadoSimple, getStartAndEndOfMonthByDay } from "../../../../../../_metronic";
import AdministracionUnidadOrganizativaBuscar from "../../../../../partials/components/AdministracionUnidadOrganizativaBuscar";

//ADD
import { handleErrorMessages } from "../../../../../store/ducks/notify-messages";
import AdministracionCentroCostoBuscar from '../../../../../partials/components/AdministracionCentroCostoBuscar';
import PersonaTextAreaPopup from '../../../../../partials/components/PersonaTextAreaPopup/PersonaTextAreaPopup';
import AdministracionPosicionBuscar from "../../../../../partials/components/AdministracionPosicionBuscar";

import { serviceCompania } from "../../../../../api/administracion/compania.api";
//import { servicePlanilla } from "../../../../../api/asistencia/planilla.api";

import AdministracionCompaniaBuscar from "../../../../../partials/components/AdministracionCompaniaBuscar";

const PermanenciaTrabajadorFilterPage = (props) => {
  const { intl, setLoading, dataMenu, dataRowEditNew } = props;
  const { IdCliente, IdDivision } = useSelector(state => state.perfil.perfilActual);
  const [viewFilter, setViewFilter] = useState(true);
  const [popupVisibleUnidad, setPopupVisibleUnidad] = useState(false);
  const { FechaInicio, FechaFin } = getStartAndEndOfMonthByDay();

  //ADD
  const [companiaData, setCompaniaData] = useState([]);

  const [varIdCompania, setVarIdCompania] = useState("");
  const [popupVisiblePosicion, setPopupVisiblePosicion] = useState(false);
  const [isVisibleCentroCosto, setisVisibleCentroCosto] = useState(false);
  const [Filtros, setFiltros] = useState({ FlRepositorio: "1", IdUnidadOrganizativa: "" });
  const [planillas, setPlanilla] = useState([]);
  const [popupVisiblePersonas, setPopupVisiblePersonas] = useState(false);

  const [popupVisibleCompania, setPopupVisibleCompania] = useState(false);

  async function cargarCombos() {
    //ADD    

  }

  const selectCompania = (dataPopup) => {

    const { IdCompania, Compania } = dataPopup[0];
    setVarIdCompania(IdCompania);
    props.dataRowEditNew.IdCompania = IdCompania;
    props.dataRowEditNew.Compania = Compania;
    setPopupVisibleCompania(false);
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

  const selectPersonas = (data) => {
    if (isNotEmpty(data)) {
      let strPersonas = data.split('|').join(',');
      dataRowEditNew.Personas = strPersonas;
    }
  }

  const agregarCentroCosto = (dataPopup) => {
    const { IdCentroCosto, CentroCosto } = dataPopup[0];
    dataRowEditNew.IdCentroCosto = IdCentroCosto;
    dataRowEditNew.CentroCosto = CentroCosto;
    setisVisibleCentroCosto(false);
  };


  //ADD-> LISTADOS
  // async function listarPlanilla(strIdCompania) {
  //   setLoading(true);

  //   if (!isNotEmpty(strIdCompania)) return;

  //   await servicePlanilla.listar(
  //     {
  //       IdCliente
  //       , IdCompania: strIdCompania
  //       , IdPlanilla: '%'
  //       , NumPagina: 0
  //       , TamPagina: 0
  //     }
  //   ).then(planillas => {
  //     setPlanilla(planillas);
  //   }).catch(err => {
  //     handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
  //   }).finally(() => { setLoading(false); });

  // }

  // async function listarCompanias() {

  //   let data = await serviceCompania.obtenerTodosConfiguracion({
  //     IdCliente: IdCliente,
  //     IdModulo: dataMenu.info.IdModulo,
  //     IdAplicacion: dataMenu.info.IdAplicacion,
  //     IdConfiguracion: "ID_COMPANIA"
  //   }
  //   ).catch(err => { handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err) });
  //   setCompaniaData(data);

  // }

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

        //JDL-2022-11-25->Se debe seleccionar compania por defecto.
        //listarPlanilla(IdCompania);

      }

    }
  }, [companiaData]);


  // ADD
  useEffect(() => {
    //listarCompanias();
    cargarCombos();
  }, []);


  //LIMPIAR FORMULARIO
  const clearRefresh = () => {

    props.setDataRowEditNew({
      IdCompania: varIdCompania,
      IdDivision: '',
      IdUnidadOrganizativa: '',
      IdPosicion: '',
      Personas: '',
      IdCentroCosto: '',
      Activo: '',
      FechaInicio: dateFormat(FechaInicio, 'yyyyMMdd'),
      FechaFin: dateFormat(FechaFin, 'yyyyMMdd'),

    });

    props.clearDataGrid();
  }

  // LISTAR REGISTROS: GRID
  const getFiltrar = async () => {

    let filtro = {
      //IdCliente: IdCliente,
      idDivision: isNotEmpty(IdDivision) ? IdDivision : "%",
      IdCompania: varIdCompania,
      IdUnidadOrganizativa: isNotEmpty(dataRowEditNew.IdUnidadOrganizativa) ? dataRowEditNew.IdUnidadOrganizativa : "",
      IdPosicion: isNotEmpty(dataRowEditNew.IdPosicion) ? dataRowEditNew.IdPosicion : "",
      Personas: isNotEmpty(dataRowEditNew.Personas) ? dataRowEditNew.Personas : "",
      IdCentroCosto: isNotEmpty(dataRowEditNew.IdCentroCosto) ? dataRowEditNew.IdCentroCosto : "",
      //IdPlanilla: isNotEmpty(dataRowEditNew.IdPlanilla) ? dataRowEditNew.IdPlanilla : "",
      Estado: isNotEmpty(dataRowEditNew.Activo) ? dataRowEditNew.Activo : "",
      FechaInicio: isNotEmpty(dataRowEditNew.FechaInicio) ? (dateFormat(dataRowEditNew.FechaInicio, 'yyyyMMdd') == "NaNaNaN" ? dataRowEditNew.FechaInicio : dateFormat(dataRowEditNew.FechaInicio, 'yyyyMMdd')) : "",
      FechaFin: isNotEmpty(dataRowEditNew.FechaFin) ? (dateFormat(dataRowEditNew.FechaFin, 'yyyyMMdd') == "NaNaNaN" ? dataRowEditNew.FechaFin : dateFormat(dataRowEditNew.FechaFin, 'yyyyMMdd')) : "",

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

            {/* <Item
              colSpan={2}
              dataField="IdCompania"
              label={{ text: intl.formatMessage({ id: "ADMINISTRATION.COMPANY.COMPANY" }) }}
              editorType="dxSelectBox"
              isRequired={true}
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
            /> */}

            <Item
              colSpan={2}
              dataField="Compania"
              label={{ text: intl.formatMessage({ id: "ADMINISTRATION.COMPANY.COMPANY" }) }}
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
              colSpan={2}
              dataField="UnidadesOrganizativas"
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

            <Item
              colSpan={2}
              dataField="Posicion"
              label={{ text: intl.formatMessage({ id: "ADMINISTRATION.POSITION" }) }}
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

  const grupoControl = (e) => {
    return (
      <>
        <Form formData={dataRowEditNew} validationGroup="FormEdicion">
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

            <Item
              dataField="Activo"
              colSpan={2}
              label={{ text: intl.formatMessage({ id: "CASINO.REPORT.WORKINGSTATUS" }) }}
              editorType="dxSelectBox"
              editorOptions={{
                items: listarEstadoSimple(),
                valueExpr: "Valor",
                displayExpr: "Descripcion",
                showClearButton: true,
                //onValueChanged: (e) => { valueChangedEstado(e.value); }
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
          <Form id="FormFilter" formData={dataRowEditNew} validationGroup="FormEdicion" >
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
                      <h5>{intl.formatMessage({ id: "ADMINISTRATION.POSITION.WORKER" })} </h5>
                    </legend>
                    {grupoControl()}
                  </fieldset>

                  <fieldset className="scheduler-border" >
                    <legend className="scheduler-border" >   <h5>{intl.formatMessage({ id: "ACCESS.DATE" })} </h5></legend>
                    {fechas()}
                  </fieldset>
                </div>


              </div>



              {/* <div className="col-md-6" style={{ marginTop: "10px" }}>
             
              </div> */}
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

      {/*******>POPUP NUMERO DE DOCUMENTOS>******** */}
      {popupVisiblePersonas && (
        <PersonaTextAreaPopup
          isVisiblePopupDetalle={popupVisiblePersonas}
          setIsVisiblePopupDetalle={setPopupVisiblePersonas}
          obtenerNumeroDocumento={selectPersonas}
        // datosReservaDetalle={datosReservaDetalle}
        />
      )}

      {/*******>POPUP DE COMPANIAS>******** */}
      {popupVisibleCompania && (
        <AdministracionCompaniaBuscar
          selectData={selectCompania}
          showPopup={{ isVisiblePopUp: popupVisibleCompania, setisVisiblePopUp: setPopupVisibleCompania }}
          cancelarEdicion={() => setPopupVisibleCompania(false)}
          uniqueId={"ReportecompaniabuscarRequisitoPage"}
        />

      )}

    </Fragment >
  );
};


export default injectIntl(WithLoandingPanel(PermanenciaTrabajadorFilterPage));
