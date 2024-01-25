import React, { Fragment, useEffect, useState } from 'react';
import { useSelector } from "react-redux";
import Form, { Item, GroupItem, EmptyItem } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";
import { injectIntl } from "react-intl";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import Tooltip from '@material-ui/core/Tooltip';
import Badge from '@material-ui/core/Badge';

import {
  handleErrorMessages,
  handleSuccessMessages,
  handleWarningMessages,
  handleInfoMessages,
  confirmAction
} from "../../../../store/ducks/notify-messages";

import AsistenciaPersonaBuscar from "../../../../partials/components/AsistenciaPersonaBuscar";

//Utils
import { listarEstado, isNotEmpty, convertyyyyMMddToFormatDate, dateFormat } from "../../../../../_metronic";

import AsistenciaHorarioBuscar from "../../../../partials/components/AsistenciaHorarioBuscar";

import { obtener as obtenerConfiguracion } from "../../../../api/sistema/configuracion.api";
import Confirm from "../../../../partials/components/Confirm";
import FieldsetAcreditacion from '../../../../partials/content/Acreditacion/FieldsetAcreditacion/FieldsetAcreditacion';

const HorarioMasivoFormWizardPage = (props) => {

  const { intl, setLoading, varIdCompania, companiaData, getCompanySeleccionada, dataRowEditNew } = props;
  const classesEncabezado = useStylesEncabezado();

  const { IdCliente } = useSelector(state => state.perfil.perfilActual);


  const [habilitarFecha, setHabilitarFecha] = useState(true);

  const [strPersonas, setStrPersonas] = useState("");
  const [isVisiblePopUpPersonas, setisVisiblePopUpPersonas] = useState(false);

  const [isVisiblePopUpHorario, setisVisiblePopUpHorario] = useState(false);
  const [indefinidoValue, setIndefinidoValue] = useState(false);
  const [fechaFinValue, setFechaFinValue] = useState();
  const [estado, setEstado] = useState([]);

  const [cicloMax, setCicloMax] = useState(0);

  const [filtroLocal, setFiltroLocal] = useState({
    IdCliente: IdCliente,
    IdCompania: "",
  });



  async function cargarCombos() {
    let estado = listarEstado();
    setEstado(estado);
  }


  const procesarHorario = async (e) => {

    let result = e.validationGroup.validate();
    if (!result.isValid) {
      return;
    }
    //Existe trabajadores
    if (props.dataPersonasTemporal.length > 0) {
      //Despues de la validación existe trabajadores observados  Observado =N
      var personas = props.dataPersonasTemporal.filter(x => x.Observado === 'N');
      if (personas.length > 0) {
        //confirmar si continua proceso de asignacion de horario
        var response = await confirmAction(intl.formatMessage({ id: "ASSISTANCE.MASSIVE.SCHEDULES.MSG.REPLACE" }), intl.formatMessage({ id: "COMMON.YES" }), intl.formatMessage({ id: "COMMON.NOT" }));
        if (response.isConfirmed) {
          //Procesar personas aquellos trabajadores sin observación     
          props.procesarPersonas(personas);
        }
      }
      else {
        handleInfoMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), intl.formatMessage({ id: "ASSISTANCE.MASSIVE.SCHEDULES.MSG" }));

      }
    } else {
      handleInfoMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), intl.formatMessage({ id: "ASSISTANCE.MASSIVE.SCHEDULES.MSG.MISSINGADD" }));
    }

  }

  const agregarPersona = (personas) => {
    //console.log("JDL->Wizard->agregarPersona->", personas);
    let arrayIdPersonas = [];
    personas.map(x => {
      arrayIdPersonas.push(x.IdPersona);
    })
    //let strPersonas = arrayIdPersonas.join(',');
    //setStrPersonas(strPersonas);
    // props.setDataRowEditNew({ ...dataRowEditNew });
    props.validarPersona(personas);
  }

  const agregarHorario = (horarios) => {

    const { IdHorario, Horario, IdCompania, Semanal, Ciclo } = horarios[0];
    dataRowEditNew.IdHorario = IdHorario;
    dataRowEditNew.Horario = Horario;
    dataRowEditNew.IdCompania = IdCompania;
    if (Semanal === 'N') {
      setCicloMax(Ciclo);
    }
    else {
      setCicloMax(1);
    }
    disabledButtonNew();
  };

  async function onValueChangedInfinido(value) {

    if (value === "S") {
      setIndefinidoValue(true);
      let fechaFin;
      await obtenerConfiguracion({ IdCliente: IdCliente, IdConfiguracion: "FECHAMINMAX" })
        .then(result => {
          fechaFin = convertyyyyMMddToFormatDate(result.Valor2);
          setFechaFinValue(fechaFin);
        }).finally(x => {
          if (!isNotEmpty(fechaFin)) handleWarningMessages("Aviso", "No tiene configurado fecha máximo.");
        });

    } else {
      dataRowEditNew.FechaFin = '';
      setFechaFinValue();
      setIndefinidoValue(false);
    }

  }


  function AddPeople() {
    setisVisiblePopUpPersonas(true);
  }


  function disabledButtonNew() {
    if (isNotEmpty(dataRowEditNew.IdCompania) &&
      isNotEmpty(dataRowEditNew.IdHorario) &&
      isNotEmpty(dataRowEditNew.FechaInicio) &&
      isNotEmpty(dataRowEditNew.FechaFin)) {
      props.setDisabledPeopleButton(false);
    } else {
      props.setDisabledPeopleButton(true);
    }
  }


  useEffect(() => {
    cargarCombos();
    //dataRowEditNew.FechaInicio = new Date();
    dataRowEditNew.Indefinido = 'N';
  }, []);


  return (
    <Fragment>

      <PortletHeader
        title={props.titulo}
        toolbar={
          <PortletHeaderToolbar>

            <Button
              icon="fa flaticon2-gear"
              type="default"
              hint={intl.formatMessage({ id: "ACTION.PROCESS" })}
              onClick={procesarHorario}
              useSubmitBehavior={true}
              validationGroup="FormEdicion"
              visible={props.modoEdicion ? true : false}
            />
            {/* &nbsp;
            <Button
              icon="clearformat"
              type="normal"
              hint={intl.formatMessage({ id: "ACTION.CLEAN" })}
              onClick={limpiar}
              visible={props.modoEdicion ? true : false}
            /> */}
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

      <PortletBody >
        <FieldsetAcreditacion title={intl.formatMessage({ id: "COMMON.DATA" })}>
          <Form formData={dataRowEditNew} validationGroup="FormEdicion" disabled={props.disabledFiltrosFrm} >
            <GroupItem itemType="group" colCount={4} colSpan={2}>

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
                    }
                  }
                }}
              />

              <Item
                dataField="Horario"
                isRequired={true}
                label={{ text: intl.formatMessage({ id: "ASSISTANCE.SCHEDULE" }), }}
                editorOptions={{
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
                        disabled: props.modoEdicion ? (isNotEmpty(varIdCompania) ? false : true) : true,
                        onClick: (evt) => {
                          setFiltroLocal({ IdCliente: IdCliente, IdCompania: varIdCompania });
                          setisVisiblePopUpHorario(true);
                        },
                      },
                    },
                  ],
                }}
              />

              <Item
                dataField="Indefinido"
                label={{ text: intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.UNDEFINED" }) }}
                editorType="dxSelectBox"
                isRequired={true}
                editorOptions={{
                  items: estado,
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                  readOnly: props.modoEdicion ? false : true,
                  onValueChanged: (e) => onValueChangedInfinido(e.value)
                }}
              />

              <Item
                dataField="DiaInicio"
                label={{ text: intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.START.DAY", }), }}
                isRequired={true}
                editorType="dxNumberBox"
                dataType="number"
                editorOptions={{
                  inputAttr: { style: "text-transform: uppercase; text-align: right", },
                  showSpinButtons: true,
                  showClearButton: false,
                  disabled: isNotEmpty(dataRowEditNew.IdHorario) ? false : true,
                  min: 1,
                  max: cicloMax,
                  readOnly: props.modoEdicion ? false : true,
                }}
              />

              <Item
                dataField="FechaInicio"
                label={{ text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.STARTDATE" }), }}
                isRequired={true}
                editorType="dxDateBox"
                dataType="datetime"
                editorOptions={{
                  inputAttr: { style: "text-transform: uppercase" },
                  displayFormat: "dd/MM/yyyy",
                  min: new Date(),
                  max: dataRowEditNew.FechaFin,
                  readOnly: props.modoEdicion ? false : true,
                  onValueChanged: disabledButtonNew
                }}
              />

              <Item
                dataField="FechaFin"
                label={{ text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.ENDDATE" }), }}
                isRequired={habilitarFecha}
                visible={habilitarFecha}
                editorType="dxDateBox"
                dataType="datetime"
                editorOptions={{
                  inputAttr: { style: "text-transform: uppercase" },
                  displayFormat: "dd/MM/yyyy",
                  //value: fechaFinValue ? fechaFinValue : dataRowEditNew.FechaFin,
                  readOnly: props.modoEdicion ? indefinidoValue : true, //!dataRowEditNew.esNuevoRegistro,
                  min: dataRowEditNew.FechaInicio,
                  onValueChanged: disabledButtonNew
                }}
              />


              <Item label={{ text: intl.formatMessage({ id: "ADMINISTRATION.POSITION.WORKER" }), }} >

                <Button
                  icon="group"
                  type="default"
                  hint={intl.formatMessage({ id: "ACTION.SEARCH" }) + " " + intl.formatMessage({ id: "ADMINISTRATION.POSITION.WORKER" })}
                  onClick={AddPeople}
                  disabled={props.disabledPeopleButton}
                  visible={props.modoEdicion ? true : false}
                />

              </Item>

            </GroupItem>

          </Form>
        </FieldsetAcreditacion>
      </PortletBody>


      {/* POPUP-> buscar persona */}
      {isVisiblePopUpPersonas && (
        <AsistenciaPersonaBuscar
          showPopup={{ isVisiblePopUp: isVisiblePopUpPersonas, setisVisiblePopUp: setisVisiblePopUpPersonas }}
          cancelar={() => setisVisiblePopUpPersonas(false)}
          agregar={agregarPersona}
          selectionMode={"multiple"}
          uniqueId={"AsistenciaCargaMasivoWizard"}
          filtro={filtroLocal}
          varIdCompania={varIdCompania}
        />
      )}
      {/* POPUP-> BUSCAR HORARIOS */}
      {isVisiblePopUpHorario && (
        <AsistenciaHorarioBuscar
          selectData={agregarHorario}
          showPopup={{ isVisiblePopUp: isVisiblePopUpHorario, setisVisiblePopUp: setisVisiblePopUpHorario }}
          cancelar={() => setisVisiblePopUpHorario(false)}
          uniqueId={"AsistenciaHorarioMasivoFormWizardPage"}
          filtro={filtroLocal}
          setLoading={setLoading}
        />
      )}


    </Fragment >
  );
};


export default injectIntl(WithLoandingPanel(HorarioMasivoFormWizardPage));
