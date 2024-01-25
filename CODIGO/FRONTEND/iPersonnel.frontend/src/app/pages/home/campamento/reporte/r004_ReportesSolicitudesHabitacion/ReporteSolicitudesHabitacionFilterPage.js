import React, { Fragment, useEffect, useState } from 'react';
import { injectIntl } from "react-intl";
import { useSelector } from "react-redux";

import Form, { Item, GroupItem } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar, Portlet } from "../../../../../partials/content/Portlet";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";

import {
  isNotEmpty, dateFormat, getStartAndEndOfMonthByDay, listarEstadoAprobacion
} from "../../../../../../_metronic";

import AdministracionCompaniaBuscar from "../../../../../partials/components/AdministracionCompaniaBuscar";


const ReporteSolicitudesHabitacionFilterPage = (props) => {

  const { intl } = props;
  const { IdCliente, IdDivision } = useSelector(state => state.perfil.perfilActual);
  const [viewFilter, setViewFilter] = useState(true);
  const [estadosAprobacion, setEstadosAprobacion] = useState([]);
  const [filtros, setFiltros] = useState({ IdCliente, IdDivision });
  const [ifThereAreNoChangesLoadFromStorage, setIfThereAreNoChangesLoadFromStorages] = useState(true);
  const { FechaInicio, FechaFin } = getStartAndEndOfMonthByDay();

  const [popupVisibleCompania, setPopupVisibleCompania] = useState(false);


  async function cargarCombos() {
    let dataEstados = listarEstadoAprobacion();
    setEstadosAprobacion(dataEstados);
  }

  const selectCompania = dataPopup => {
    const { IdCompania, Compania } = dataPopup[0];
    props.dataRowEditNew.IdCompania = IdCompania;
    props.dataRowEditNew.Compania = Compania;
    setPopupVisibleCompania(false);
  };

  useEffect(() => {
    cargarCombos();
    if (ifThereAreNoChangesLoadFromStorage) setIfThereAreNoChangesLoadFromStorages(false);
  }, [ifThereAreNoChangesLoadFromStorage]);

  useEffect(() => {
    if (props.refreshData) {
      props.refresh();
      props.setRefreshData(false);
    }
  }, [props.refreshData]);


  const eventRefresh = () => {
    props.setDataRowEditNew({
      IdCliente,
      IdDivision,
      FechaInicio,
      FechaFin
    });
    props.clearDataGrid();
  }
  /*Filtro para obtener lista de requisitos*********************************/


  const filtrar = async (e) => {

    let result = e.validationGroup.validate();
    if (result.isValid) {
      let filtro = {
        IdCliente: IdCliente,
        IdDivision: isNotEmpty(IdDivision) ? IdDivision : "%",
        IdCompaniaContratista: isNotEmpty(props.dataRowEditNew.IdCompania) ? props.dataRowEditNew.IdCompania : "",
        CompaniaContratista: isNotEmpty(props.dataRowEditNew.Compania) ? props.dataRowEditNew.Compania : "",
        FechaInicio: dateFormat(props.dataRowEditNew.FechaInicio, 'yyyyMMdd'),
        FechaFin: dateFormat(props.dataRowEditNew.FechaFin, 'yyyyMMdd'),
        EstadoSolicitud: isNotEmpty(props.dataRowEditNew.EstadoSolicitud) ? props.dataRowEditNew.EstadoSolicitud : ""
      }
      props.filtrarReporte(filtro);
    }
  };



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


  return (
    <Fragment>
      <PortletHeader
        title=''
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
              onClick={filtrar}
              useSubmitBehavior={true}
              validationGroup="FormEdicion"
            />

            &nbsp;
            <Button icon="refresh"
              type="default"
              hint={intl.formatMessage({ id: "ACTION.CLEAN" })}
              onClick={eventRefresh} />

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
            <GroupItem colSpan={2} colCount={2}>
              {/* cssClass="tituloGrupo" caption={intl.formatMessage({id: "ACCREDITATION.PEOPLE.GENERALDATA"})} */}
              <Item
                dataField="Compania"
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.COMPANY" }) }}
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
                dataField="EstadoSolicitud"
                label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
                editorType="dxSelectBox"
                editorOptions={{
                  items: estadosAprobacion,
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                  showClearButton: true
                }}
              />
              <Item
                dataField="FechaInicio"
                label={{
                  text: intl.formatMessage({ id: "COMMON.STARTDATE" }),
                }}
                isRequired={true}
                editorType="dxDateBox"
                dataType="datetime"
                editorOptions={{
                  inputAttr: { style: "text-transform: uppercase" },
                  displayFormat: "dd/MM/yyyy"
                }}
              />

              <Item
                dataField="FechaFin"
                label={{
                  text: intl.formatMessage({ id: "COMMON.ENDDATE" }),
                }}
                isRequired={true}
                editorType="dxDateBox"
                dataType="datetime"
                editorOptions={{
                  inputAttr: { style: "text-transform: uppercase" },
                  displayFormat: "dd/MM/yyyy"
                }}
              />
            </GroupItem>
          </Form>
        </React.Fragment>
      </PortletBody>

      {/*******>POPUP DE COMPANIAS>******** */}
      <AdministracionCompaniaBuscar
        selectData={selectCompania}
        showPopup={{ isVisiblePopUp: popupVisibleCompania, setisVisiblePopUp: setPopupVisibleCompania }}
        cancelarEdicion={() => setPopupVisibleCompania(false)}
        uniqueId={"companiabuscarRequisitoPage"}
      />

    </Fragment >

  );
};



export default injectIntl(WithLoandingPanel(ReporteSolicitudesHabitacionFilterPage));
