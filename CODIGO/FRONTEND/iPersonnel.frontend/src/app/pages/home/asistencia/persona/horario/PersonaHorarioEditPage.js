import React, { useEffect, useState } from "react";
import Form, { Item, GroupItem, PatternRule, SimpleItem } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../../store/config/Styles";
import { useSelector } from "react-redux";
import { handleErrorMessages, handleInfoMessages } from "../../../../../store/ducks/notify-messages";
import { isRequired, isModified } from "../../../../../../_metronic/utils/securityUtils";
import { injectIntl } from "react-intl";
import { listarEstado, isNotEmpty, convertyyyyMMddToFormatDate, dateFormat, convertyyyyMMddToDate } from "../../../../../../_metronic";
import { obtener } from "../../../../../api/sistema/configuracion.api";
import { handleWarningMessages } from "../../../../../store/ducks/notify-messages";
import AsistenciaHorarioBuscar from "../../../../../partials/components/AsistenciaHorarioBuscar";
import { validar } from "../../../../../api/asistencia/personaHorario.api";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";
import { obtenerTitulo } from "../../../../../api/asistencia/horario.api";
import { servicePersona } from "../../../../../api/administracion/persona.api";
import './PersonaHorarioPage.css'
const PersonaHorarioEditPage = props => {

  const { intl, modoEdicion, settingDataField, accessButton, dataRowEditNew, setDataRowEditNew, varIdCompania, getInfo, setLoading, selected,
    varIdPersona, fechasContrato, isVisibleAlert } = props;
  const perfil = useSelector(state => state.perfil.perfilActual);
  const classesEncabezado = useStylesEncabezado();

  const [isVisiblePopUpHorario, setisVisiblePopUpHorario] = useState(false);
  const [estado, setEstado] = useState([]);
  const [indefinidoValue, setIndefinidoValue] = useState(false);
  const [fechaFinValue, setFechaFinValue] = useState();
  const [cicloMax, setCicloMax] = useState(1);
  const [esSemanal, setEsSemanal] = useState("");
  const [filtroLocal, setFiltroLocal] = useState({ IdCliente: perfil.IdCliente, IdDivision: perfil.IdDivision, IdCompania: varIdCompania });
  const [personaHorario, setPersonaHorario] = useState({});
  const [esNuevoRegistro, setEsNuevoRegistro] = useState(false);



  async function cargarCombos() {
    let estado = listarEstado();
    setEstado(estado);
  }

  async function grabar(e) {
    console.log("Grabar", { dataRowEditNew });
    const { IdCliente, IdPersona, FechaInicio, FechaFin, IdCompania, IdSecuencial, esNuevoRegistro
    } = dataRowEditNew;
    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (Date.parse(new Date(dataRowEditNew.FechaInicio)) > Date.parse(new Date(dataRowEditNew.FechaFin))) {
        handleInfoMessages(intl.formatMessage({ id: "ACCESS.PERSON.STARTDATE.VALID" }));
        return;
      }

      // if (isNotEmpty(dataRowEditNew.FechaFinMaxHorarioVencido) && Date.parse(new Date(dataRowEditNew.FechaFinMaxHorarioVencido)) >= Date.parse(new Date(dataRowEditNew.FechaInicio))) {
      //   handleInfoMessages(intl.formatMessage({ id: "ASISTENCIA.PERSONA.HORARIO.FECHAHORARIOVENCIDOMAYOR" }));
      //   return;
      // }

      //Metodo para validar servidor
      await validar({
        IdCliente,
        IdPersona,
        FechaInicio: dateFormat(FechaInicio, 'yyyyMMdd'),
        FechaFin: dateFormat(FechaFin, 'yyyyMMdd'),
        IdCompania,
        IdDivision: perfil.IdDivision,
        IdSecuencial: esNuevoRegistro ? 0 : IdSecuencial
      })
        .then(response => {
          const { Confirmar, MensajeValidacion } = response;
          // console.log("***validar:> ",response);
          // console.log("Confirmar:>",Confirmar);
          // console.log("MensajeValidacion:>",MensajeValidacion);
          if (Confirmar === 0 && isNotEmpty(MensajeValidacion)) {
            // handleInfoMessages(MensajeValidacion); 
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), MensajeValidacion, true);
          } else {
            if (dataRowEditNew.esNuevoRegistro) {
              props.agregarPersonaHorario(dataRowEditNew, undefined, Confirmar);
            } else {
              props.actualizarPersonaHorario(dataRowEditNew);
            }
          }
        });

    }
  }


  async function onValueChangedInfinido(value) {

    if (value === "S") {
      setIndefinidoValue(true);
      let fechaFin;
      await obtener({ IdCliente: perfil.IdCliente, IdConfiguracion: "FECHAMINMAX" })
        .then(result => {
          fechaFin = convertyyyyMMddToDate(result.Valor2);
          setFechaFinValue(fechaFin);
        }).finally(x => {
          if (!isNotEmpty(fechaFin)) handleWarningMessages("Aviso", "No tiene configurado fecha máximo.");
        });

    } else {
      setIndefinidoValue(false);
      //FechaFinNoIndefinida : Es calculado en el Index. LSF
      setDataRowEditNew({ ...dataRowEditNew, FechaFin: dataRowEditNew.FechaFinNoIndefinida });
      setFechaFinValue(null);
    }

  }

  async function onValueChangedFechaInicio() {
    let diaInicio = (new Date(dataRowEditNew.FechaInicio)).getDay();
    if (diaInicio === 0) diaInicio = 7;
    if (esSemanal === 'S')
      setDataRowEditNew({ ...dataRowEditNew, DiaInicio: diaInicio });
  }

  /*HORARIO**********************************************************/
  const seleccionarHorario = (horarios) => {
    const { IdCliente, IdHorario, Horario, IdCompania } = horarios[0];
    dataRowEditNew.IdHorario = IdHorario;
    dataRowEditNew.Horario = Horario;
    dataRowEditNew.IdCompania = IdCompania;

    obtenerHorario(IdCliente, IdCompania, IdHorario);

  };

  const obtenerHorario = async (IdCliente, IdCompania, IdHorario) => {
    setLoading(true);
    await obtenerTitulo({
      IdCliente: IdCliente,
      IdDivision: perfil.IdDivision,
      IdCompania: IdCompania,
      IdHorario: IdHorario
    }).then(data => { 
      const { Ciclo, Semanal } = data;
      let diaInicio = 1;
      setPersonaHorario(data);
      setEsSemanal(Semanal);
      setCicloMax(Ciclo);

      if (Semanal === "S") {
        setCicloMax(7); 
        if (isNotEmpty(dataRowEditNew.FechaInicio)) {
          diaInicio = (new Date(dataRowEditNew.FechaInicio)).getDay();  
        }
      }
      
      setDataRowEditNew({ ...dataRowEditNew, DiaInicio: diaInicio }) 

    }).finally(() => { setLoading(false) });
  }


  useEffect(() => {
    // console.log("*useEffect():::dataRowEditNew::::>>> ",dataRowEditNew);
    cargarCombos();
    if (props.titulo === "Nuevo") {
      setEsNuevoRegistro(true);
    } else {
      const { IdCliente, IdCompania, IdHorario } = selected;
      if (isNotEmpty(IdHorario)) obtenerHorario(IdCliente, IdCompania, IdHorario);
    }
  }, []);

  return (
    <>
      <HeaderInformation data={getInfo()} visible={true} labelLocation={'left'} colCount={6}
        toolbar={
          <PortletHeader
            title={""}
            toolbar={
              <PortletHeaderToolbar>

                <Button
                  icon="fa fa-save"
                  type="default"
                  hint={intl.formatMessage({ id: "ACTION.RECORD" })}
                  useSubmitBehavior={true}
                  validationGroup="FormEdicion"
                  onClick={grabar}
                  visible={modoEdicion}
                  disabled={isVisibleAlert}
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
        }
      />
      <PortletBody >
        <React.Fragment>
          <Form formData={dataRowEditNew} validationGroup="FormEdicion" >
            <GroupItem itemType="group" colCount={2} colSpan={2} >
              <Item colSpan={2}>
                <AppBar position="static" className={classesEncabezado.secundario}>
                  <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                    <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                      {intl.formatMessage({ id: "COMMON.DETAIL" })}
                    </Typography>
                  </Toolbar>
                </AppBar>
              </Item>
              <Item dataField="IdDivision" visible={false} />
              <Item dataField="IdCompania" visible={false} />
              <Item dataField="IdHorario" visible={false} />


              <Item
                dataField="Horario"
                isRequired={modoEdicion}
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
                        onClick: (evt) => {
                          setFiltroLocal({ IdCliente: perfil.IdCliente, IdDivision: perfil.IdDivision, IdCompania: varIdCompania });
                          setisVisiblePopUpHorario(true);
                        },
                      },
                    },
                  ],
                }}
              />

              <GroupItem>
                <SimpleItem
                  cssClass="detalle_barraTextDetalle"
                >
                  <h6 style={{ color: personaHorario.ColorTitulo }}>{personaHorario.Titulo} </h6>
                </SimpleItem>
              </GroupItem >


              <Item
                dataField="Indefinido"
                label={{ text: intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.UNDEFINED" }) }}
                editorType="dxSelectBox"
                isRequired={modoEdicion}
                editorOptions={{
                  items: estado,
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                  onValueChanged: (e) => onValueChangedInfinido(e.value),
                  readOnly: (modoEdicion && !esNuevoRegistro) ? true : false
                }}
              />

              <Item
                dataField="DiaInicio"
                label={{ text: intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.START.DAY", }), }}
                isRequired={modoEdicion}
                editorType="dxNumberBox"
                dataType="number"
                editorOptions={{
                  inputAttr: {
                    style: "text-transform: uppercase; text-align: right",
                  },
                  showSpinButtons: true,
                  // showClearButton: true, //--->LSF
                  min: 1,
                  max: cicloMax,
                  readOnly: (esSemanal === 'S') ? true : false
                }}
              >
                <PatternRule pattern={/[0-9]/} message={intl.formatMessage({ id: "COMMON.ENTER.NUMERIC.DATA" })} />
              </Item>

            </GroupItem>

            <GroupItem itemType="group" colCount={2} colSpan={2}>
              <Item dataField="FechaInicio"
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.STARTDATE" }) }}
                isRequired={modoEdicion ? isRequired('FechaInicio', settingDataField) : false}
                editorType="dxDateBox"
                dataType="date"
                editorOptions={{
                  displayFormat: "dd/MM/yyyy", 
                  readOnly: (!esNuevoRegistro)?true:false, //---->LSF
                  // readOnly: (modoEdicion && !esNuevoRegistro) ? true : false,
                  min: fechasContrato.FechaInicioContrato,
                  max: fechasContrato.FechaFinContrato,
                  onValueChanged: (e) => onValueChangedFechaInicio(e.value),
                }}
              />

              <Item dataField="FechaFin"
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.ENDDATE" }) }}
                isRequired={modoEdicion ? isRequired('FechaFin', settingDataField) : false}
                editorType="dxDateBox"
                dataType="date"
                editorOptions={{
                  displayFormat: "dd/MM/yyyy",
                  value: isNotEmpty(fechaFinValue) ? fechaFinValue : dataRowEditNew.FechaFin, 
                  readOnly: (!esNuevoRegistro)?true:false, //---->LSF
                  min: fechasContrato.FechaInicioContrato,
                  max: fechasContrato.FechaFinContrato
                }}
              />

            </GroupItem>
          </Form>

          {/*POPUP HORARIO------------------------------ */}
          {isVisiblePopUpHorario && (
            <AsistenciaHorarioBuscar
              selectData={seleccionarHorario}
              showPopup={{ isVisiblePopUp: isVisiblePopUpHorario, setisVisiblePopUp: setisVisiblePopUpHorario }}
              cancelar={() => setisVisiblePopUpHorario(false)}
              filtro={filtroLocal}
              uniqueId={"PersonaHorarioEditPage"}
              setLoading={setLoading}
            />
          )}

        </React.Fragment>
      </PortletBody>
    </>
  );

};

export default injectIntl(PersonaHorarioEditPage);
