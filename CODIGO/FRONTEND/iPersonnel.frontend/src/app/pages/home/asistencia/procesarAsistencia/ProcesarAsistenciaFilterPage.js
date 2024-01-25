import React, { Fragment, useEffect, useState } from 'react';
import { injectIntl } from "react-intl";
import { useSelector } from "react-redux";
import Form, { Item, GroupItem } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import { isNotEmpty, dateFormat, getDateOfDay } from "../../../../../_metronic";
import AdministracionUnidadOrganizativaBuscar from "../../../../partials/components/AdministracionUnidadOrganizativaBuscar";

//ADD
import { confirmAction, handleErrorMessages, handleInfoMessages } from "../../../../store/ducks/notify-messages";
import AdministracionCentroCostoBuscar from '../../../../partials/components/AdministracionCentroCostoBuscar';
import PersonaTextAreaPopup from '../../../../partials/components/PersonaTextAreaPopup/PersonaTextAreaPopup';
import AdministracionPosicionBuscar from "../../../../partials/components/AdministracionPosicionBuscar";

import { serviceCompania } from "../../../../api/administracion/compania.api";
import { servicePlanilla } from "../../../../api/asistencia/planilla.api";
import Alert from '@material-ui/lab/Alert';


const ProcesarAsistencialFilterPage = (props) => {
  const { intl, setLoading, dataMenu, dataRowEditNew, varIdCompania, setVarIdCompania, varIdProceso, procesoLog, varEnabledButton } = props;
  const { IdCliente, IdDivision } = useSelector(state => state.perfil.perfilActual);
  const [viewFilter, setViewFilter] = useState(true);
  const [popupVisibleUnidad, setPopupVisibleUnidad] = useState(false);

  //ADD
  const [companiaData, setCompaniaData] = useState([]);

  const [popupVisiblePosicion, setPopupVisiblePosicion] = useState(false);
  const [isVisibleCentroCosto, setisVisibleCentroCosto] = useState(false);
  //const [Filtros, setFiltros] = useState({ FlRepositorio: "1", IdUnidadOrganizativa: "" });
  const [planillas, setPlanilla] = useState([]);
  const [popupVisiblePersonas, setPopupVisiblePersonas] = useState(false);

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

    await serviceCompania.obtenerTodosConfiguracion({
      IdCliente: IdCliente,
      IdModulo: dataMenu.info.IdModulo,
      IdAplicacion: dataMenu.info.IdAplicacion,
      IdConfiguracion: "ID_COMPANIA"
    }).then(response => {
      setCompaniaData(response);
      console.log("listarCompania,response", response);
    }).catch(err => { handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err) });


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
        //props.setDataIdCompania(companiaData)

        //JDL-2022-11-25->Se debe seleccionar compania por defecto.
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
      IdDivision: '',
      IdUnidadOrganizativa: '',
      Personas: '',
      IdPlanilla: '',
      FechaInicio: FechaInicio,
      FechaFin: FechaFin,

    });

    props.clearDataGrid();
  }

  // LISTAR REGISTROS: GRID
  const ejecutarProceso = async (e) => {

    let result = e.validationGroup.validate();
    if (result.isValid) {

      //validar que la fecha de Fin sea mayor a la fecha de Inicio 
      if (Date.parse(new Date(dataRowEditNew.FechaInicio)) > Date.parse(new Date(dataRowEditNew.FechaFin))) {
        handleInfoMessages(intl.formatMessage({ id: "ACCESS.PERSON.STARTDATE.VALID" }));
        return;
      }

      let filtro = {
        IdCliente: IdCliente,
        IdDivision: isNotEmpty(IdDivision) ? IdDivision : "%",
        IdCompania: varIdCompania,
        IdUnidadOrganizativa: isNotEmpty(dataRowEditNew.IdUnidadOrganizativa) ? dataRowEditNew.IdUnidadOrganizativa : "",
        Personas: isNotEmpty(dataRowEditNew.Personas) ? dataRowEditNew.Personas : "",
        IdPlanilla: isNotEmpty(dataRowEditNew.IdPlanilla) ? dataRowEditNew.IdPlanilla : "",
        FechaInicio: dateFormat(dataRowEditNew.FechaInicio, 'yyyyMMdd'),
        FechaFin: dateFormat(dataRowEditNew.FechaFin, 'yyyyMMdd'),

      }
      //Confirmar ejecucion del proceso de asistencia....
      var response = await confirmAction(intl.formatMessage({ id: "ASSISTANCE.PROCESS.END.MSG" }), intl.formatMessage({ id: "COMMON.YES" }), intl.formatMessage({ id: "COMMON.NOT" }));
      if (!response.isConfirmed) return;

      props.procesarAsistencia(filtro);

    }

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
        <Form formData={dataRowEditNew} validationGroup="FormEdicion">
          <GroupItem itemType="group" colCount={2} >


            <Item
              colSpan={2}
              dataField="IdPlanilla"
              label={{ text: intl.formatMessage({ id: "ASISTENCIA.REPORT.TRABAJADORSINHORARIO.TIPOPLANTILLA" }) }}
              editorType="dxSelectBox"
              editorOptions={{
                items: planillas,
                valueExpr: "IdPlanilla",
                displayExpr: "Planilla",
                searchEnabled: true,
                showClearButton: true,
                //onValueChanged: (e) => { valueChangedTipoPlantilla(e.value); }
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

  const showInforUltimoProceso = () => {
    return <>
      &nbsp;
      {(isNotEmpty(varIdProceso)) ? (
        <Alert severity="success" onClose={() => { }}>
          <span>
            &nbsp;
            <span>  <i class="fa flaticon2-calendar-1"></i>  {intl.formatMessage({ id: "ASSISTANCE.PROCESS.LAST.RUN" })} -> {dateFormat(procesoLog.FechaCreacion, 'dd/MM/yyyy hh:mm')} </span>
            &nbsp;
            <span> <i class="fa flaticon2-user"></i> {procesoLog.IdUsuarioCreacion} </span>
            &nbsp;
            <span> {intl.formatMessage({ id: "ASSISTANCE.PROCESS.BETWEEN" })}  {dateFormat(procesoLog.FechaInicio, 'dd/MM/yyyy')} & {dateFormat(procesoLog.FechaFin, 'dd/MM/yyyy')} </span>

          </span>
        </Alert>
      ) : (<></>)
      }
    </>
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
              icon="fa flaticon2-gear"
              type="default"
              hint={intl.formatMessage({ id: "ACTION.PROCESS" })}
              onClick={ejecutarProceso}
              useSubmitBehavior={true}
              disabled={varEnabledButton}
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
                      <h5>{intl.formatMessage({ id: "ASSISTANCE.MAIN" })} </h5>
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

          {showInforUltimoProceso()}

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


export default injectIntl(WithLoandingPanel(ProcesarAsistencialFilterPage));
