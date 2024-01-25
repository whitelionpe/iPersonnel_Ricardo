import React, { Fragment, useState, useRef, useEffect } from "react";
import { injectIntl } from "react-intl";
import { Button, Popup } from "devextreme-react";
import {
  PortletBody,
  PortletHeader,
  PortletHeaderToolbar
} from "../../../../partials/content/Portlet";

import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import HeaderInformation from "../../../../partials/components/HeaderInformation";
import DataGridDynamic from "../../../../partials/components/DataGridDynamic/DataGridDynamic";

import PersonaTextAreaPopup from "../../../../partials/components/PersonaTextAreaPopup/PersonaTextAreaPopup";
import AdministracionUnidadOrganizativaBuscar from "../../../../partials/components/AdministracionUnidadOrganizativaBuscar";
import AsistenciaPersonaBuscar from "../../../../partials/components/AsistenciaPersonaBuscar";


import {
  IncidenciaLeyenda
} from "./IncidenciasUtil";
import "./IncidenciaPage.css";
import ReporteIncidenciaListarFilter from "./ReporteIncidenciaListarFilter";
import useReporteIncidenciaEdit from "./useReporteIncidenciaEdit";
import ReporteIncidenciaDetalleEdit from "./ReporteIncidenciaDetalleEdit";
import ReporteIncidenciaDetalleJustificacionEditPage from "./ReporteIncidenciaDetalleJustificacionEditPage";
import AsistenciaPersonaPerfilBuscar from "../../../../partials/components/AsistenciaPersonaPerfilBuscar";

const ReporteIncidenciaEditPage = ({
  intl,
  setLoading,
  dataMenu,
  setDataRowEditNew,
  dataRowEditNew,
  initDataRowEdit,

  companiaData,
  cmbPlanilla,
  lstZona,
  cmbIncidencia,

  CargarPlanilla,
  exportIncidenciaExcel,
  setCabeceraReporte,
  cmbLeyenda,

  cmbTipoBusqueda,
  CargarIncidencia,

  filterDataRow,
  setFilterDataRow

}) => {

  const dataGridRef = useRef(null);
  const [popupVisiblePersonas, setPopupVisiblePersonas] = useState(false);
  const [popupVisibleUnidad, setPopupVisibleUnidad] = useState(false);
  const [isVisiblePopUpJustificacion, setisVisiblePopUpJustificacion] = useState(false);

  const [filtroLocal, setFiltroLocal] = useState({
    IdCliente: "",
    IdCompania: "",
  });


  const { columnasEstaticas,
    listaParaReserva,
    viewPagination,
    columnasFecha,
    isVisibleJustificacion,
    hidRangeSelected,
    hidControlSelected,
    selectPersonas,
    agregarPersonaAsistencia,
    dataGridEvents,
    eventKeyUp,
    buscarReservas,
    selectUnidadOrganizativa,
    setViewPagination,
    setIsVisibleJustificacion,
    agregarPersonaJustificacion,

    justificationList,
    incidentList,
    maxSizeFile,
    saveJustificationsByPeople,
    onFieldDataChanged,
    isActiveFilters,
    setIsActiveFilters,
    refreshDataSource,
    varIdCompania,
    setVarIdCompania,

    incidencias,
    incidenciasSeleccionados,
    setIncidenciasSeleccionados,

    showPopupResumen,
    setShowPopupResumen,
    contentRenderPopUpInformation,

    isVisibleDetalle,
    setisVisibleDetalle,
    Incidencia,

    abrirJustificacionMasiva,
    showPopupJustificacionMasiva,
    setShowPopupJustificacionMasiva,
    contentRenderPopUpJustificacionMasiva,

    setSelectedRow,

    isActiveLeyend,
    setIsActiveLeyend,

    usuario,
    reloadSavedJustification,

    setDataRow,
    dataRow,

    buscar 

  } = useReporteIncidenciaEdit({
    intl,
    setDataRowEditNew,
    dataRowEditNew,
    initDataRowEdit,
    cmbIncidencia,
    setLoading,
    dataMenu,
    popupVisiblePersonas,
    setPopupVisiblePersonas,
    CargarPlanilla,
    setCabeceraReporte,
    cmbLeyenda,

    cmbTipoBusqueda,

    isVisiblePopUpJustificacion,
    setisVisiblePopUpJustificacion,


    filterDataRow,
    setFilterDataRow

  });

  return (
    <Fragment>
      <HeaderInformation
        visible={true}
        labelLocation={"left"}
        colCount={1}
        toolbar={
          <PortletHeader
            title={""}
            toolbar={
              <PortletHeaderToolbar>
                <Button
                  icon={isActiveFilters ? "chevronup" : "chevrondown"}
                  type="default"
                  hint={isActiveFilters ? intl.formatMessage({ id: "COMMON.HIDE" }) : intl.formatMessage({ id: "COMMON.SHOW" })}
                  onClick={() => setIsActiveFilters(!isActiveFilters)}
                />
                &nbsp;
                <Button
                  icon="fa fa-search"
                  type="default"
                  hint={intl.formatMessage({ id: "ACTION.FILTER" })}
                  onClick={buscar} //() => onFieldDataChanged(dataRowEditNew) 
                />
                &nbsp;
                <Button icon="refresh" //fa fa-broom
                  type="default"
                  hint={intl.formatMessage({ id: "ACTION.CLEAN" })}
                  onClick={refreshDataSource}
                />
                &nbsp;
                <Button
                  icon="fa fa-file-excel"
                  type="default"
                  hint={intl.formatMessage({ id: "ACTION.EXPORT" })}
                  onClick={exportIncidenciaExcel}
                />
                &nbsp;

                <Button
                  icon="fa fa-plus"
                  type="default"
                  hint={intl.formatMessage({ id: "ACTION.ADD" }) + " " + intl.formatMessage({ id: "ASISTENCIA.PERSONA.BOLSAHORAS.JUSTIFICACION" })}
                  onClick={() => abrirJustificacionMasiva(dataRowEditNew)}
                />
                &nbsp;
              </PortletHeaderToolbar>
            }
          />
        }
      />

      <PortletBody key="PortleBodyReporteIncidencia">
        <React.Fragment>
          <input type="hidden" ref={hidRangeSelected} />
          <input type="hidden" ref={hidControlSelected} />

          <ReporteIncidenciaListarFilter
            intl={intl}
            dataRowEditNew={dataRowEditNew}
            companiaData={companiaData}
            cmbPlanilla={cmbPlanilla}
            lstZona={lstZona}
            cmbIncidencia={cmbIncidencia}

            setDataRowEditNew={setDataRowEditNew}
            setPopupVisibleUnidad={setPopupVisibleUnidad}
            setPopupVisiblePersonas={setPopupVisiblePersonas}
            isActiveFilters={isActiveFilters}

            varIdCompania={varIdCompania}
            setVarIdCompania={setVarIdCompania}
            CargarPlanilla={CargarPlanilla}

            incidencias={incidencias}
            incidenciasSeleccionados={incidenciasSeleccionados}
            setIncidenciasSeleccionados={setIncidenciasSeleccionados}

            cmbTipoBusqueda={cmbTipoBusqueda}
            CargarIncidencia={CargarIncidencia}

          />
          <br></br>
          <div id="divGrid" onKeyUp={eventKeyUp}>
            <DataGridDynamic
              id="dg_reporteInidencias"
              intl={intl}
              dataSource={listaParaReserva}
              staticColumns={columnasEstaticas}
              dynamicColumns={columnasFecha}
              isLoadedResults={viewPagination}
              setIsLoadedResults={setViewPagination}
              refreshDataSource={buscarReservas}
              keyExpr={"IdPersona"}
              dataGridRef={dataGridRef}
              events={{ ...dataGridEvents }}
              selectionMode={"multiple"}
            // setSelectedRow={setSelectedRow}
            />
            <div id="div_sp">

            </div>
          </div>


        </React.Fragment>
      </PortletBody>

      <PortletBody>
        <div>
          <Button
            text={intl.formatMessage({ id: "COMMON.LEGEND" })}
            icon={isActiveLeyend ? "chevronup" : "chevrondown"}
            type="default"
            hint={isActiveLeyend ? intl.formatMessage({ id: "COMMON.HIDE" }) : intl.formatMessage({ id: "COMMON.SHOW" })}
            onClick={() => setIsActiveLeyend(!isActiveLeyend)}
          />
        </div>
        <div>
          {isActiveLeyend && (
            <IncidenciaLeyenda Incidencias={cmbLeyenda} />
          )}
        </div>
      </PortletBody>

      {/*******>POPUP DE UNIDAD ORGA.>******** */}
      {popupVisibleUnidad && (
        <AdministracionUnidadOrganizativaBuscar
          selectData={selectUnidadOrganizativa}
          showPopup={{
            isVisiblePopUp: popupVisibleUnidad,
            setisVisiblePopUp: setPopupVisibleUnidad
          }}
          cancelarEdicion={() => setPopupVisibleUnidad(false)}
          selectionMode={"multiple"}
          showCheckBoxesModes={"normal"}
        />
      )}

      {/*******>POPUP BUSCAR POR PERSONAS.>******** */}
      {popupVisiblePersonas && (
        <AsistenciaPersonaBuscar
          showPopup={{ isVisiblePopUp: popupVisiblePersonas, setisVisiblePopUp: setPopupVisiblePersonas }}
          cancelar={() => setPopupVisiblePersonas(false)}
          agregar={agregarPersonaAsistencia}
          selectionMode={"multiple"}
          uniqueId={"GestionIncidenicas_AsistenciaPersonaBuscar"}
          varIdCompania={varIdCompania}
        />
      )}

      {/*
      //--->>>> COMENTADO PARA ATENDER OBSERVACIONES EN BORO - LSF - 17/05/2023
      {popupVisiblePersonas && (
        <AsistenciaPersonaPerfilBuscar
          showPopup={{ isVisiblePopUp: popupVisiblePersonas, setisVisiblePopUp: setPopupVisiblePersonas }}
          cancelar={() => setPopupVisiblePersonas(false)}
          agregar={agregarPersonaAsistencia}
          selectionMode={"multiple"}
          uniqueId={"GestionIncidenicas_AsistenciaPersonaPerfilBuscar"}
          varIdCompania={varIdCompania}
        />
      )}  */}


      {/*******>POPUP DETALLE DOBLE CLICK.>******** */}
      {/* <ReporteIncidenciaDetalle
        showPopup={{
          isVisiblePopUp: isVisibleDetalle,
          setisVisiblePopUp: setisVisibleDetalle
        }}
        intl={intl}
        IncidenciaData={Incidencia}
        height={"350px"}
        width={"600px"}
      /> */}

      {/*******>POPUP JUSTIFICACIÓN - OPCIONES CLICK DERECHO.>******** */}
      {/* <ReporteIncidenciaDetalleEdit
        showPopup={{
          isVisiblePopUp: isVisibleJustificacion,
          setisVisiblePopUp: setIsVisibleJustificacion
        }}
        intl={intl}
        dataRowEditNew={dataRowEditNew}
        height={"400px"}
        width={"1000px"}
        justificationList={justificationList}
        incidentList={incidentList}
        setLoading={setLoading}
        saveJustificationsByPeople={saveJustificationsByPeople}
        maxSizeFile={maxSizeFile}
        dataMenu={dataMenu}
        // varIdCompania={varIdCompania}
        // varIdPersona={varIdPersona}
        // varFecha={varFecha}
      /> */}
      {isVisibleJustificacion && (
        <ReporteIncidenciaDetalleJustificacionEditPage
          showPopup={{
            isVisiblePopUp: isVisibleJustificacion,
            setisVisiblePopUp: setIsVisibleJustificacion
          }}
          intl={intl}
          dataRowEditNew={dataRow}
          height={"600px"}
          width={"1100px"}
          //justificationList={justificationList}
          //incidentList={incidentList}
          setLoading={setLoading}
          // saveJustificationsByPeople={saveJustificationsByPeople}
          reloadSavedJustification={reloadSavedJustification}
          maxSizeFile={maxSizeFile}
          dataMenu={dataMenu}
          usuario={usuario}
        />
      )}



      {/*******>POPUP RESUMEN DEL DÍA>******** */}
      {showPopupResumen && (
        <Popup
          visible={showPopupResumen}
          dragEnabled={false}
          closeOnOutsideClick={false}
          showTitle={true}
          height={"500px"}
          width={"760px"}
          title={(intl.formatMessage({ id: "COMMON.SUMMARY.DAY" })).toUpperCase()}
          contentRender={contentRenderPopUpInformation}
          onHiding={() => setShowPopupResumen(!showPopupResumen)}
        >
        </Popup>
      )}



      {/*******>POPUP JUSTIFICACIÓN MASIVA - BOTÓN SUPERIOR.>******** */}
      {showPopupJustificacionMasiva && (
        <Popup
          visible={showPopupJustificacionMasiva}
          dragEnabled={false}
          closeOnOutsideClick={false}
          showTitle={true}
          height={"750px"}
          width={"1000px"}
          title={(intl.formatMessage({ id: "ASSISTANCE.INCIDENCE.JUSTIFICATION.MASSIVE.POPUP_TITLE" })).toUpperCase()}
          contentRender={contentRenderPopUpJustificacionMasiva}
          onHiding={() => setShowPopupJustificacionMasiva(!showPopupJustificacionMasiva)}
        >
        </Popup>
      )}




    </Fragment>
  );
};

export default injectIntl(WithLoandingPanel(ReporteIncidenciaEditPage));
