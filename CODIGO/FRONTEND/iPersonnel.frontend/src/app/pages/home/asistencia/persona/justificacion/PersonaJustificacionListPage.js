import React, { useState, useEffect, Fragment } from 'react';
import HeaderInformation from "../../../../../partials/components/HeaderInformation";
import { Button, Popover, Popup } from "devextreme-react";
import { injectIntl } from "react-intl";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import Scheduler, { View } from 'devextreme-react/scheduler';
import { dateFormat, DiasSemana, getDayWeek, isNotEmpty } from '../../../../../../_metronic/utils/utils';
import './PersonaJustificacionPage.css'
import ScrollView from 'devextreme-react/scroll-view';
import ContextMenu from 'devextreme-react/context-menu';
import CalendarioRango from '../../../../../partials/components/CalendarioRango/CalendarioRango';
import { listarEstadoSimple, listarEstado } from "../../../../../../_metronic";
import { useSelector } from "react-redux";
import { obtenerTodos as obtenerPersonaPlanilla } from "../../../../../api/asistencia/personaPlanilla.api";
import Alert from '@material-ui/lab/Alert';
import AsistenciaPersonaJustificacionResumenDiaPopOver from '../../../../../partials/components/AsistenciaPersonaJustificacionResumenDiaPopOver';
import { handleErrorMessages } from '../../../../../store/ducks/notify-messages';
import AsistenciaPersonaJustificacionMarcacionPopUp from '../../../../../partials/components/AsistenciaPersonaJustificacionMarcacionPopUp';

const PersonaJustificacionListPage = (props) => {
  const { intl, accessButton, dataRowEditNew, showButtons, setLoading, personaJustificacionDias, varIdPersona,
    varIdCompania, dataResumen, getInfo, dataZona, dataTipoIdentificacion, idModulo, idAplicacion, idMenu } = props;

  const [currentDate, setCurrentDate] = useState(new Date());
  const [myScheduler, setMyScheduler] = useState(null);
  const [contextMenuEvent, setContextMenuEvent] = useState({
    evento: null,
    target: '.dx-scheduler-appointment',
    type: '1'
  });
  const [contView, setContView] = useState(2);
  const [estadoSimple, setEstadoSimple] = useState([]);
  const [estado, setEstado] = useState([]);
  const perfil = useSelector(state => state.perfil.perfilActual);
  const usuario = useSelector(state => state.auth.user);
  const [isVisibleAlert, setIsVisibleAlert] = useState(false);
  const [dataPlanilla, setDataPlanilla] = useState([]);
  const [showPopupResumen, setShowPopupResumen] = useState(false);
  const [showPopupMarcacion, setShowPopupMarcacion] = useState(false);
  let applyTodayDay = (null);

  async function cargarCombos() {
    let estadoSimple = listarEstadoSimple();
    setEstadoSimple(estadoSimple);

    let estado = listarEstado();
    setEstado(estado);

    let dataPlanilla = await obtenerPersonaPlanilla({
      IdCliente: perfil.IdCliente,
      IdPersona: varIdPersona,
      IdCompania: varIdCompania,
      IdPlanilla: '%'
    });
    setDataPlanilla(dataPlanilla);
    if (dataPlanilla.length === 0) {
      setIsVisibleAlert(true);
    } else {
      setIsVisibleAlert(false);
    }

  }

  const renderDias = (cellData) => {
    let dias = DiasSemana();
    let nombre = dias[cellData.date.getDay()];
    return (
      <React.Fragment>
        <div className="name ">{intl.formatMessage({ id: nombre.Descripcion })}</div>
      </React.Fragment>
    );
  }

  const onOptionChanged = async (e) => {
    if (e.fullName == "selectedCellData") {
      if (e.value.length > 0) {
        let fi = e.value[0].startDate;
        let ff = e.value[e.value.length - 1].startDate;

        if (fi != dataRowEditNew.FechaInicio || ff != dataRowEditNew.FechaFin) {
          dataRowEditNew.FechaInicio = fi;
          dataRowEditNew.FechaFin = ff;
          //LSF
          applyTodayDay = { FechaInicio: dataRowEditNew.FechaInicio, FechaFin: dataRowEditNew.FechaFin }
        }
      }
    } else {
      applyTodayDay = null;
    }
  }

  const realizarCargaBusqueda = async (Fechas) => {
    let { FechaInicio, FechaFin } = Fechas;

    setCurrentDate(FechaInicio);
    props.setDataRowEditNew({ ...dataRowEditNew, FechaInicio, FechaFin });

    if (myScheduler != null) {
      myScheduler.option('currentDate', FechaInicio);
    }
    props.listarJustificacionDia({ FechaInicio, FechaFin });
  }

  const appointmentDragging_config = {
    autoScroll: false,
    onDragMove: (e) => { e.cancel = true; },
    onDragStart: (e) => { e.cancel = true; }
  };

  const initializedScheduler = (e) => {
    setMyScheduler(e.component);
  }

  //***..ContextMenu ACCION NUEVO..******************************************************/
  const itemClickJustificacionNuevo = async (e) => {
    var dateSelectedDay = window.localStorage.getItem('dateSelectedDay');

    dataRowEditNew.FechaInicio = dateSelectedDay;
    dataRowEditNew.FechaFin = dateSelectedDay;

    props.nuevoRegistro();
  }

  const onContextMenuItemClickNuevo = (e) => {
    let Id = e.itemData.id;

    if (Id == 11 || Id == 12 || Id == 13) {
      e.itemData.onItemClick(contextMenuEvent.evento, e);
    }
  }

  const AppointmentMenuTemplateNuevo = (e) => {
    if (e.id == 11)
      return <div className="divMenuCalendar" id={`${e.id}`}><i className="flaticon2-add-1 icon-nm text-warning " ></i> {e.text}</div>

    if (e.id == 12)
      return <div className="divMenuCalendar" id={`${e.id}`}><i className="flaticon2-add-1 icon-nm text-warning " ></i> {e.text}</div>

    if (e.id == 13)
      return <div className="divMenuCalendar" id={`${e.id}`}><i className="flaticon2-information icon-nm text-primary" ></i> {e.text}</div>

  }

  //Opciones del ContextMenuCellCalendar*************************************************/
  const opcionMenuNuevo = [
    { id: 11, visible: true, text: intl.formatMessage({ id: "ACTION.ADD" }) + " " + intl.formatMessage({ id: "ASSISTANCE.PERSON.JUSTIFICATION" }), onItemClick: itemClickJustificacionNuevo },
    { id: 12, visible: true, text: intl.formatMessage({ id: "ACTION.ADD" }) + " " + intl.formatMessage({ id: "ACCESS.PERSON.MARK" }), onItemClick: (e) => { itemClickAgregarMarca(e) } }, // (e) => { } 
    { id: 13, visible: true, text: intl.formatMessage({ id: "ACTION.VIEW" }) + " " + intl.formatMessage({ id: "COMMON.SUMMARY" }), onItemClick: (e) => { itemClickJustificacionVerResumen(e) } },
  ];

  //***..ContextMenu ACCION EDIT/REMOVE/JUSTIFICATE/SUMMARY..****************************/
  //Eventos de las opciones del ContextMenu
  const itemClickJustificacionEdit = (e) => {
    props.editarRegistro(e.appointmentData);
  }

  const itemClickJustificacionDelete = (e) => {
    props.eliminarRegistro(e.appointmentData);
  }

  const itemClickJustificacionJustificar = (e) => {
    props.justificarRegistro(e.appointmentData);
  }

  const itemClickJustificacionVerResumen = async (e) => {
    var dateSelectedDay = window.localStorage.getItem('dateSelectedDay');
    props.obtenerResumenDia(dateSelectedDay);
    setShowPopupResumen(true);
  }

  const itemClickAgregarMarca = async (e) => {
    var dateSelectedDay = window.localStorage.getItem('dateSelectedDay');
    props.obtenerDatosMarcaDia(dateSelectedDay);
    setShowPopupMarcacion(true);
  }

  //Opciones del ContextMenuAppoinment***********************************************/
  const opcionMenu = [
    { id: 1, text: intl.formatMessage({ id: "ACTION.EDIT" }), onItemClick: (e) => { if (e.appointmentData.Origen === 'JUSTIFICACION') itemClickJustificacionEdit(e, 1); } },
    { id: 2, text: intl.formatMessage({ id: "ACTION.REMOVE" }), onItemClick: (e) => { if (e.appointmentData.Origen === 'JUSTIFICACION') itemClickJustificacionDelete(e, 2); } },
    { id: 3, text: intl.formatMessage({ id: "ACTION.JUSTIFICATE" }), onItemClick: (e) => { if (e.appointmentData.Origen === 'INCIDENCIA') itemClickJustificacionJustificar(e, 3); } },
    { id: 7, text: intl.formatMessage({ id: "ACTION.ADD" }) + " " + intl.formatMessage({ id: "ACCESS.PERSON.MARK" }), onItemClick: (e) => { itemClickAgregarMarca(e); } },
    { id: 4, text: intl.formatMessage({ id: "ACTION.VIEW" }) + " " + intl.formatMessage({ id: "COMMON.SUMMARY" }), onItemClick: (e) => { itemClickJustificacionVerResumen(e); } },
    { id: 6, text: intl.formatMessage({ id: "ASSISTANCE.PERSON.JUSTIFICATION.NO_OPTIONS" }), onItemClick: (e) => { } },

  ];
  const [optionsContextMenu, setOptionsContextMenu] = useState(opcionMenu);

  //Asignacion de Evento a las opciones del ContextMenu******************************/
  const onContextMenuItemClickEdit = (e) => {
    let Id = e.itemData.id;

    if (Id == 1 || Id == 2 || Id == 3 || Id == 4) {
      e.itemData.onItemClick(contextMenuEvent.evento, e);
    }
  }

  const AppointmentMenuTemplateEdit = (e) => {
    let Id = e.id;

    if (Id == 1) {
      return <div className="divMenuCalendar" id={`${Id}`}><i className="flaticon2-edit text-primary" ></i> {e.text}</div>
    }
    if (Id == 2) {
      return <div className="divMenuCalendar" id={`${Id}`}><i className="flaticon2-trash text-dark" ></i> {e.text}</div>
    }
    if (Id == 3) {
      return <div className="divMenuCalendar" id={`${Id}`}><i className="flaticon2-notepad text-dark" ></i> {e.text}</div>
    }
    if (Id == 4) {
      return <div className="divMenuCalendar" id={`${Id}`}><i className="flaticon2-information icon-nm text-primary" ></i> {e.text}</div>
    }
    if (Id == 6) {
      return <div className="divMenuCalendar" id={`${Id}`}>{e.text}</div>
    }
    if (Id == 7) {
      return <div className="divMenuCalendar" id={`${Id}`}><i className="flaticon2-add-1 icon-nm text-warning " ></i> {e.text}</div>
    }
  }

  //Metodos usados en el Scheduler***************************************************/
  const onAppointmentFormOpeningEvento = async (data) => {
    let infoData = data.appointmentData;
    let form = data.form;

    data.cancel = true;
    return;
  };

  const onCellContextMenu = (e) => {
    window.localStorage.setItem('dateSelectedDay', e.cellData.startDate);

    contextMenuEvent.evento = e;
  }

  const onAppointmentContextMenu = (e) => {
    window.localStorage.setItem('dateSelectedDay', e.appointmentData.FechaAsistencia);

    if (e.appointmentData.Origen === "INCIDENCIA") {
      if (e.appointmentData.IdEvento == 'C01' || e.appointmentData.IdEvento == 'C02' || e.appointmentData.IdEvento == 'C04' || e.appointmentData.IdEvento == 'C11') {
        setOptionsContextMenu(opcionMenu.filter(item => item.id === 3 || item.id === 4));
      } else {
        // setOptionsContextMenu(opcionMenu.filter(item => item.id === 6));
        setOptionsContextMenu(opcionMenu.filter(item => item.id === 4));
      }
    } else if (e.appointmentData.Origen === "JUSTIFICACION") {
      setOptionsContextMenu(opcionMenu.filter(item => item.id !== 3 && item.id !== 6));
    } else if (e.appointmentData.Origen === "FERIADO" || e.appointmentData.Origen === "DESCANSO") {
      setOptionsContextMenu(opcionMenu.filter(item => item.id === 6));
    }

    contextMenuEvent.evento = e;
  }

  const contentCalendar = (itemData, itemIndex, itemElement) => {
    let { Origen, Color, startDate, text, Saldo, HoraEntrada, HoraSalida } = itemData.appointmentData;

    let elemento = '<div class="div_justi_item">';
    let estilo = 'div_justi_item';
    switch (Origen) {
      case 'JUSTIFICACION':
        elemento += ` <h6 class="badge badge-light"> ${dateFormat(startDate, 'hh:mm')} </h6> ${text}`;
        itemElement.classList.add('item_justificacion');
        break;
      case 'FERIADO':
        elemento += ` <span> ${text}</span>`;
        itemElement.classList.add('item_feriado');
        break;
      case 'DESCANSO':
        elemento += ` <span> ${text}</span>`;
        itemElement.style.backgroundColor = Color;
        itemElement.style.color = 'white';
        break;
      case 'INCIDENCIA':
        estilo = 'div_inc_item';
        elemento += ` <h6 class="badge badge-light" style ='color:${Color};'> 
                        ${dateFormat(HoraEntrada, 'hh:mm') + " - " + dateFormat(HoraSalida, 'hh:mm')}  
                      </h6>   
                      ${text} [${Saldo} min]   
                     `;
        itemElement.style.backgroundColor = Color;
        itemElement.style.color = 'white';
        break;
      default:
        elemento += `<span style='background-color:${Color}'> ${text}</span>`;
        break;
    }
    elemento += '</div>';
    itemElement.classList.add('celda_Hijo_General');
    itemElement.classList.add(estilo);//'div_justi_item'
    itemElement.innerHTML += elemento;
  }


  const renderAppointmentTooltip = (evt) => {
    const { appointmentData } = evt;
    const { startDate, endDate, text, color, diaCompleto, justificacion, Origen,
      Evento, HoraEntrada, HoraSalida, IdJustificacion, MostrarHora, Icon,
      MostrarEliminarEditarJust } = appointmentData;

    return (
      <div className="card" >
        <div className="card-body">
          <div id="DivEventoDetalle">

            <div className="row">
              <div className="col-md-3">
                <div style={{ backgroundColor: color, color: 'white', borderRadius: '3px' }} >

                  {isNotEmpty(Icon)
                    ? (<i className={Icon} style={{ fontSize: "45px" }} />)
                    : (<i className="flaticon2-information" style={{ fontSize: "45px" }} />)}

                </div>
              </div>
              <div className="col-md-9">
                <div className="row">
                  <div className="col-md-12">
                    <h5 className="text-primary" >{getDayWeek(startDate)} </h5>
                    <div style={{ borderTopStyle: 'solid', borderTopColor: color, margin: '4px' }} />
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-12" style={{ textAlign: 'left', wordWrap: "break-word" }}>
                    {MostrarHora === 'S' ?
                      (<h6>  {dateFormat(HoraEntrada, 'hh:mm')} - {dateFormat(HoraSalida, 'hh:mm')} {Evento} </h6>) :
                      Origen === 'FERIADO' ? (<h6> {Origen} : {Evento} </h6>) : (<h6>  {Evento} </h6>)}
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6" >

                  </div>
                  <div className="col-md-6" style={{ textAlign: 'right' }}>
                    {(isNotEmpty(MostrarEliminarEditarJust) && MostrarEliminarEditarJust === 'S') ?
                      (<i className="flaticon2-edit text-info" style={{ fontSize: '10px' }} onClick={() => props.editarRegistro(appointmentData)} >{intl.formatMessage({ id: "ACTION.EDIT" })}</i>)
                      : (<></>)}&nbsp;&nbsp;&nbsp;
                    {(isNotEmpty(MostrarEliminarEditarJust) && MostrarEliminarEditarJust === 'S') ?
                      (<i className="flaticon2-trash text-dark" style={{ fontSize: '10px' }} onClick={() => props.eliminarRegistro(appointmentData)} >{intl.formatMessage({ id: "ACTION.REMOVE" })} </i>)
                      : (<></>)}
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>

    );
  };


  ///////////////////////////////////////////////////////////////////////////
  //POP UP DE RESUMEN
  ///////////////////////////////////////////////////////////////////////////
  const contentRenderPopUpInformation = () => {
    var dateSelectedDay = window.localStorage.getItem('dateSelectedDay');
    return (
      <>
        <AsistenciaPersonaJustificacionResumenDiaPopOver
          dataResumen={dataResumen}
          varFecha={dateSelectedDay}
          showTitleInside={false}
          idAplicacion={idAplicacion}
          idMenu={idMenu}
          idModulo={idModulo}
        />
      </>
    );
  }
  ///////////////////////////////////////////////////////////////////////////
  //POP DE MARCACION
  ///////////////////////////////////////////////////////////////////////////
  const cancelarMarcacion = () => {
    setShowPopupMarcacion(!showPopupMarcacion);
  }

  const contentRenderPopUpMark = () => {
    var dateSelectedDay = window.localStorage.getItem('dateSelectedDay');
    return (
      <>
        <AsistenciaPersonaJustificacionMarcacionPopUp
          varIdPersona={varIdPersona}
          varFecha={dateSelectedDay}
          dataRowEditNew={dataRowEditNew}
          modeView={false}
          getInfo={getInfo}
          dataZona={dataZona}
          dataTipoIdentificacion={dataTipoIdentificacion}
          cancelarMarcacion={cancelarMarcacion}
          agregarMarcacion={agregarMarcacion}
        />
      </>
    );
  }

  const agregarMarcacion = async (datarow) => {
    props.agregarMarcacion(datarow);
  }

  //************************************************************************************/

  const agregarNuevaJustificacion = () => {
    //LSF 
    if (isNotEmpty(applyTodayDay)) {
      dataRowEditNew.FechaInicio = applyTodayDay.FechaInicio;
      dataRowEditNew.FechaFin = applyTodayDay.FechaFin;
      dataRowEditNew.EnfermedadInicio = applyTodayDay.FechaInicio;
      dataRowEditNew.EnfermedadFin = applyTodayDay.FechaFin;
      dataRowEditNew.CertificadoInicio = applyTodayDay.FechaInicio;
    } else {
      dataRowEditNew.FechaInicio = new Date();
      dataRowEditNew.FechaFin = new Date();
      dataRowEditNew.EnfermedadInicio = new Date();
      dataRowEditNew.EnfermedadFin = new Date();
      dataRowEditNew.CertificadoInicio = new Date();
    }

    props.nuevoRegistro();
  }


  useEffect(() => {
    cargarCombos();
  }, []);

  return (
    <>
      <Fragment>
        <div id='divIdPersonaJustificacion'>
          {props.showButton && (
            <HeaderInformation data={props.getInfo()} visible={true} labelLocation={'left'} colCount={6}
              toolbar={
                <PortletHeader
                  title=""
                  toolbar={
                    <PortletHeaderToolbar>
                      <PortletHeaderToolbar>
                        <Button
                          icon="plus"
                          type="default"
                          hint={intl.formatMessage({ id: "ACTION.NEW" })}
                          onClick={agregarNuevaJustificacion}
                          disabled={!accessButton.nuevo}
                        />
                        &nbsp;
                        <Button
                          icon="fa fa-times-circle"
                          type="normal"
                          hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
                          onClick={props.cancelarEdicion}
                        />
                      </PortletHeaderToolbar>
                    </PortletHeaderToolbar>
                  }
                />

              }
              componenteAdicional={<CalendarioRango
                intl={intl}
                FechaInicio={dataRowEditNew.FechaInicio}
                ejecutarCambioRango={realizarCargaBusqueda}
              />}

            />
          )}

          {isVisibleAlert && (
            <Alert severity="warning" variant="outlined">
              <div style={{ color: 'red' }} >
                {intl.formatMessage({ id: "ASSISTANCE.JUSTIFICATION.MASSIVE.MESSAGE.PLANILLA" })}
              </div>
            </Alert>
          )}

          < PortletBody >
            <div>
              <i className="flaticon2-bell-1 text-success" />
              {intl.formatMessage({ id: "ASSISTANCE.PERSON.JUSTIFICATION.LEYENDRIGHTCLICK" })}
            </div>
            < ScrollView id="scrollview" >
              <div className="text-content">

                <Scheduler
                  id="calendario_justificacion"
                  dataSource={personaJustificacionDias}
                  defaultCurrentView="month"
                  defaultCurrentDate={currentDate}
                  //adaptivityEnabled={true}
                  //allDayExpr="AllDay"
                  height={600}
                  firstDayOfWeek={1}
                  //className="css_calendario"
                  //dataCellRender={renderDataCell}
                  onOptionChanged={onOptionChanged}
                  ppointmentDragging={appointmentDragging_config}
                  onCellContextMenu={onCellContextMenu}
                  onInitialized={initializedScheduler}
                  //onAppointmentUpdated={showUpdatedToast}
                  onAppointmentFormOpening={onAppointmentFormOpeningEvento}
                  onAppointmentContextMenu={onAppointmentContextMenu}
                  appointmentTemplate={contentCalendar}
                  editing={{ allowAdding: true, allowDeleting: false, allowDragging: false, allowUpdating: true }}
                  remoteFiltering={true}
                  appointmentTooltipRender={(e) => renderAppointmentTooltip(e)}
                >
                  <View
                    type="month"
                    dateCellRender={renderDias}
                    name="messes"
                    intervalCount={contView}
                  />
                </Scheduler>
                <ContextMenu
                  id="contexMenuOptions"
                  dataSource={optionsContextMenu}//{optionsContextMenu}
                  width={200}
                  target={".dx-scheduler-appointment"}
                  disabled={false}
                  onItemClick={onContextMenuItemClickEdit}
                  itemRender={AppointmentMenuTemplateEdit}
                />
                <ContextMenu
                  id="schedulerNuevo"
                  dataSource={opcionMenuNuevo}
                  width={200}
                  target={".dx-scheduler-date-table-cell"}
                  disabled={false}
                  onItemClick={onContextMenuItemClickNuevo}
                  itemRender={AppointmentMenuTemplateNuevo}
                />
              </div>
            </ScrollView >
          </PortletBody >
        </div>
      </Fragment >

      {showPopupResumen && (
        <Popup
          visible={showPopupResumen}
          dragEnabled={false}
          closeOnOutsideClick={true}
          showTitle={true}
          height={"500px"}
          width={"760px"}
          title={(intl.formatMessage({ id: "COMMON.SUMMARY.DAY" })).toUpperCase()}
          contentRender={contentRenderPopUpInformation}
          onHiding={() => setShowPopupResumen(!showPopupResumen)}
        >
        </Popup>
      )}

      {showPopupMarcacion && (
        <Popup
          visible={showPopupMarcacion}
          dragEnabled={false}
          closeOnOutsideClick={true}
          showTitle={false}
          height={"300px"}
          width={"700px"}
          title={(intl.formatMessage({ id: "ADMINISTRATION.BRAND.ADD" })).toUpperCase()}
          contentRender={contentRenderPopUpMark}
          onHiding={() => setShowPopupMarcacion(!showPopupMarcacion)}
        >
        </Popup>
      )}

    </>
  );
};

export default injectIntl(PersonaJustificacionListPage);
