import React, { Fragment, useEffect, useState } from 'react';
import { injectIntl } from "react-intl";
import { useSelector } from "react-redux";

import Form, { Item, GroupItem } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";

import {
  isNotEmpty, dateFormat
} from "../../../../../../_metronic";

import { listarTipoModuloPorCampamento } from '../../../../../api/campamento/tipoModulo.api';
import { obtenerTodos } from '../../../../../api/campamento/campamento.api';
import CampamentoModuloBuscar from '../../../../../partials/components/CampamentoModuloBuscar';
import CampamentoHabitacionBuscar from '../../../../../partials/components/CampamentoHabitacionBuscar';


const ReporteCamaPorDiaFilterPage = (props) => {

  const { intl, setLoading } = props;
  const { IdDivision } = useSelector(state => state.perfil.perfilActual);
  const [viewFilter, setViewFilter] = useState(true);
  const [tipomodulos, setTipomodulos] = useState([]);
  const [campamentos, setCampamentos] = useState([]);
  const [popupVisibleModulo, setPopupVisibleModulo] = useState(false);
  const [popupVisibleHabitacion, setPopupVisibleHabitacion] = useState(false);
  const [ifThereAreNoChangesLoadFromStorage, setIfThereAreNoChangesLoadFromStorages] = useState(true);



  async function cargarCombos() {
    try {
      const tmp_campamentos = await obtenerTodos({ IdDivision });
      setCampamentos(tmp_campamentos);
    } catch (error) {
      console.log(error);
    }
  }

  const selectModulo = data => props.setDataRowEditNew({ ...props.dataRowEditNew, IdModulo: data[0].IdModulo, Modulo: data[0].Modulo, IdHabitacion: "", Habitacion: "" });
  const selectHabitacion = data => props.setDataRowEditNew({ ...props.dataRowEditNew, IdHabitacion: data[0].IdHabitacion, Habitacion: data[0].Habitacion });

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
      IdDivision,
      Fecha: new Date(),
      IdCampamento: '',
      IdTipoModulo: '',
      IdModulo: '',
      IdHabitacion: '',
      Inactivas: false
    });
    //Index.props.limpiarGrilla()
    props.clearDataGrid();
  }
  /*Filtro para obtener lista de requisitos*********************************/


  const filtrar = async (e) => {

    let result = e.validationGroup.validate();
    if (result.isValid) {
      let filtro = {
        IdDivision: isNotEmpty(IdDivision) ? IdDivision : "%",
        Fecha: dateFormat(props.dataRowEditNew.Fecha, 'yyyyMMdd'),
        IdCampamento: isNotEmpty(props.dataRowEditNew.IdCampamento) ? props.dataRowEditNew.IdCampamento : "",
        IdTipoModulo: isNotEmpty(props.dataRowEditNew.IdTipoModulo) ? props.dataRowEditNew.IdTipoModulo : "",
        IdModulo: isNotEmpty(props.dataRowEditNew.IdModulo) ? props.dataRowEditNew.IdModulo : "",
        IdHabitacion: isNotEmpty(props.dataRowEditNew.IdHabitacion) ? props.dataRowEditNew.IdHabitacion : "",
        Inactivas: props.dataRowEditNew.Inactivas === true ? 'S' : 'N'
      }
      props.filtrarReporte(filtro);
    }
  };

  const onValueChangedCampamento = async valor => {
    setLoading(true);
    let IdCampamento = valor;
    try {
      const tmp_tipomodulos = await listarTipoModuloPorCampamento({ idDivision: IdDivision, idCampamento: IdCampamento })
      setTipomodulos(tmp_tipomodulos);
      props.setDataRowEditNew({ ...props.dataRowEditNew, Modulo: "", IdModulo: "", Habitacion: "", IdHabitacion: "", IdTipoModulo: "" });
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
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
        <fieldset className="scheduler-border"  >
          <legend className="scheduler-border" >   <h5>{intl.formatMessage({ id: "ACTION.SEARCH" })} </h5></legend>
          <Form id="FormFilter" formData={props.dataRowEditNew} validationGroup="FormEdicion" >
            <GroupItem itemType="group" colCount={3} colSpan={1}>
              <Item
                dataField="Fecha"
                label={{
                  text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.DATE" })
                }}
                isRequired={true}
                editorType="dxDateBox"
                dataType="datetime"
                editorOptions={{
                  inputAttr: { style: "text-transform: uppercase" },
                  displayFormat: "dd/MM/yyyy",
                }}
              />

              <Item
                dataField="IdCampamento"
                label={{
                  text: intl.formatMessage({ id: "CAMP.RESERVATION.CAMP" })
                }}
                editorType="dxSelectBox"
                editorOptions={{
                  items: campamentos,
                  valueExpr: "IdCampamento",
                  displayExpr: "Campamento",
                  placeholder: "Seleccione..",
                  onValueChanged: e => onValueChangedCampamento(e.value)
                }}
              />

              <Item
                dataField="IdTipoModulo"
                label={{
                  text: intl.formatMessage({ id: "CAMP.RESERVATION.MODULETYPE" })
                }}
                editorType="dxSelectBox"
                isRequired={false}
                editorOptions={{
                  items: tipomodulos,
                  valueExpr: "IdTipoModulo",
                  displayExpr: "TipoModulo",
                  onValueChanged: e => props.setDataRowEditNew({ ...props.dataRowEditNew, IdTipoModulo: e.value, IdModulo: "", Modulo: "", IdHabitacion: "", Habitacion: "" })
                }}
              />

              <Item
                dataField="Modulo"
                label={{ text: intl.formatMessage({ id: "CAMP.RESERVATION.MODULE" }) }}
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
                          setPopupVisibleModulo(true);
                        }
                      }
                    }
                  ]
                }}
              />

              <Item
                dataField="Habitacion"
                label={{ text: intl.formatMessage({ id: "CAMP.RESERVATION.ROOM" }) }}
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
                          setPopupVisibleHabitacion(true);
                        }
                      }
                    }
                  ]
                }}
              />

              <Item
                dataField="Inactivas"
                label={{
                  text: "Check",
                  visible: false
                }}
                editorType="dxCheckBox"
                editorOptions={{
                  text: intl.formatMessage({ id: "CAMP.REPORT.SHOW_INACTIVE_BEDS" }),
                  width: "100%",
                  onValueChanged: e => props.setDataRowEditNew({ ...props.dataRowEditNew, Inactivas: e.value })
                }}
              />
            </GroupItem>
          </Form>
        </fieldset>
      </PortletBody>

      {
        popupVisibleModulo && (
          <CampamentoModuloBuscar
            selectData={selectModulo}
            showPopup={{ isVisiblePopUp: popupVisibleModulo, setisVisiblePopUp: setPopupVisibleModulo }}
            cancelarEdicion={() => setPopupVisibleModulo(false)}
            uniqueId="moduloBuscarList"
            idDivision={IdDivision}
            dataRowEditNew={props.dataRowEditNew}
          />
        )
      }

      {
        popupVisibleHabitacion && (
          <CampamentoHabitacionBuscar
            selectData={selectHabitacion}
            showPopup={{ isVisiblePopUp: popupVisibleHabitacion, setisVisiblePopUp: setPopupVisibleHabitacion }}
            cancelarEdicion={() => setPopupVisibleHabitacion(false)}
            uniqueId="habitacionBuscarList"
            idDivision={IdDivision}
            dataRowEditNew={props.dataRowEditNew}
          />
        )
      }

    </Fragment >

  );
};



export default injectIntl(WithLoandingPanel(ReporteCamaPorDiaFilterPage));
