import React, { useState, useEffect } from 'react';
import { injectIntl } from "react-intl";
import { DataGrid, Column, Editing, Summary, TotalItem, Button as ColumnButton } from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";
import CalendarioRango from '../../../../../partials/components/CalendarioRango/CalendarioRango';
import ScrollView from 'devextreme-react/scroll-view';
import Scheduler, { Resource, View } from 'devextreme-react/scheduler';
import { convertyyyyMMddToDate, dateFormat, DiasSemana, getDayWeek } from '../../../../../../_metronic/utils/utils';
import { isNotEmpty } from "../../../../../../_metronic";
import "../../../campamento/reserva/ReservaListPage.css";
import Tooltip from '@material-ui/core/Tooltip';
import './PersonaHorarioPage.css'
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import { handleInfoMessages } from '../../../../../store/ducks/notify-messages';

const PersonaHorarioListPage = props => {

  const { intl, accessButton, getInfo, selectedIndex, setLoading } = props;
  const [currentDate, setCurrentDate] = useState(new Date());//Del seleccionar> 
  const [changedDate, setChangedDate] = useState('');
  const [myScheduler, setMyScheduler] = useState(null);
  const [contView, setContView] = useState(2);

  const editarRegistro = evt => {
    const { HorarioActual } = evt.row.data;
 
    props.editarRegistro(evt.row.data);
  };

  const eliminarRegistro = evt => {
    evt.cancel = true;
    props.eliminarRegistro(evt.row.data);
  };

  const seleccionarRegistro = evt => {
    setLoading(true);
    // console.log("seleccionarRegistro|evt:",evt);
    if (evt.rowIndex === -1) return;
    //Permite realizar cambio del calendario según registro seleccionado.
    const { HorarioActual, FechaInicio, FechaFin } = evt.row.data;
    let fecha = new Date();
    // Cambiar calendario según horario actual donde: S: Actual,N :Pasado y F: Futuro. 
    if (HorarioActual === "S") {
      fecha = convertyyyyMMddToDate(dateFormat(FechaInicio, 'yyyyMMdd'));
    } else if (HorarioActual === "N") {
      fecha = convertyyyyMMddToDate(dateFormat(FechaFin, 'yyyyMMdd'));
    } else if (HorarioActual === "F") {
      fecha = convertyyyyMMddToDate(dateFormat(FechaInicio, 'yyyyMMdd'));
    }
    setChangedDate(fecha);
    if (isNotEmpty(evt.row.data)) props.seleccionarRegistro(evt.row.data);
    setLoading(false);
  }

  /**********************Funciones del Calendario**************************************************************************/
  const renderDiasSemana = (cellData) => {
    let dias = DiasSemana();
    let nombre = dias[cellData.date.getDay()];

    return (
      <React.Fragment>
        <div className="name">{intl.formatMessage({ id: nombre.Descripcion })}</div>
      </React.Fragment>
    );
  }
  //Calendario.->
  const ejecutarCambioFecha = async (Fechas) => {
    // console.log("ejecutarCambioFecha|Fechas:",Fechas);
    //-Cargar calendario con data según fecha actual y luego cambio  
    const { FechaInicio, FechaFin } = Fechas;
    setCurrentDate(FechaInicio);
    myScheduler.option('currentDate', FechaInicio);
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    //Obtener horario, marcas, feriados de una persona en particular.
    // console.log("::1::ejecutarCambioFecha", Fechas, selectedIndex);
    await props.listarPersonaHorarioDia({ ...selectedIndex, FechaInicio, FechaFin });
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  }

  const initializedScheduler = (e) => {
    setMyScheduler(e.component);
  }

  const catalogoColores = [
    {
      text: 'Trabaja Día',
      id: 'Green',
      color: '#4FA93D', //'#00b71fa2'
    }, {
      text: 'Trabaja Noche',
      id: 'Blue',
      color: '#007cb7'
    }, {
      text: 'Feriado',
      id: 'Red',
      color: '#d60202'//'#df2344'
    },
    {
      text: 'Descanso',
      id: 'Gray',
      color: '#808080'
    }
  ];

  function getIdColor(id) {
    return catalogoColores.find(d => d.id === id).color;
  }

  const onAppointmentFormOpeningEvento = async (event) => {
    let infoData = event.appointmentData;

    if (infoData.descanso != "X") {
      event.cancel = true;
      return;
    }

    let popup = event.popup;
    popup.option("toolbarItems[0].options.visible", true); 
    popup.option("toolbarItems[0].options.text", "Cerrar");
    popup.option("position", "top");

    let form = event.form;

    //Obtener marca de persona por FECHA.
    let listarMarcas = await props.obtenerPersonaMarca(dateFormat(infoData.startDate, 'yyyyMMdd'));
 
    //construir formulario
    let items = crearFormulario(listarMarcas, infoData.startDate, infoData.turno);
    form.option('items', items);

  }

  function customMarkup(data) {
    var div = document.createElement("div");
    div.className = 'table-responsive';
    let row = '';
    let table = '';
    table = `<table class="table table-striped"> 
      <thead>
        <tr>
        <th scope="col">${(intl.formatMessage({ id: "ACCESS.PERSON.MARK.HOUR" })).toUpperCase()}</th>
        <th scope="col">${(intl.formatMessage({ id: "ACCESS.PERSON.MARK.ZONE" })).toUpperCase()}</th>
        <th scope="col">${(intl.formatMessage({ id: "ACCESS.PERSON.MARK.EQUIPMENT" })).toUpperCase()}</th>        
      </tr>
    </thead>
    <tbody>`;
    data.map(item => {
      row += `<tr>
          <td>${dateFormat(item.FechaMarca, 'hh:mm')}</td> <td>${item.Zona}</td> <td>${item.Equipo} </td>
      </tr>`
    });
    table += row;
    table += `
    </tbody>
    <tfoot>
      <tr>
        <td></td>
        <td>${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })}</td>
        <td>${data.length}</td>
      </tr>
    </tfoot>
  </table>`;
    div.innerHTML = table;
    return div;
  }

  const crearFormulario = (objData, fecha, turno) => {
console.log("***crearFormulario:> objData, fecha, turno :> " ,objData, fecha, turno);
    let css_color_turno = '';
    let dscTurno = '';
    switch (turno) {
      case 'D': css_color_turno = 'item_cuadro_green'; dscTurno = 'DÍA'; break;
      case 'N': css_color_turno = 'item_cuadro_blue'; dscTurno = 'NOCHE'; break;
    }
    //Construir dos controles.
    let items = [
      { label: { text: 'Fecha' }, editorType: 'dxDateBox', editorOptions: { value: fecha, displayFormat: "dd/MM/yyyy", readOnly: true } },
      { label: { text: 'Turno: ' }, editorType: 'dxTextBox', editorOptions: { value: dscTurno, readOnly: true }, cssClass: `${css_color_turno} item_cuadro` },

    ];
    //Asignar un titulo.
    items.unshift({
      label: { text: 'DETALLE DE MARCAS' },
      colSpan: 2,
      cssClass: 'reserva_detalle_titulo',
    });
    //Agregar un tabla de marcas
    items.push({
      colSpan: 2,
      template: customMarkup(objData)
    })

    return items;
  }

  const appointmentDragging_config = {
    autoScroll: false,
    onDragMove: (e) => { e.cancel = true; },
    onDragStart: (e) => { e.cancel = true; }
  };

  function cellRenderColumn(e) {

    if (e && e.data) {
      const { HorarioActual } = e.data;

      if (HorarioActual === 'S') {
        return <Tooltip title={<span style={{ fontSize: "10px" }}> {intl.formatMessage({ id: "CAMP.EXCLUSIVE.CURRENT" })} </span>} >
          <i className="fas fa-circle  text-success icon-10x" ></i>
        </Tooltip>
      }
      else if (HorarioActual === 'N') {
        return <Tooltip title={<span style={{ fontSize: "10px" }}> {intl.formatMessage({ id: "CAMP.EXCLUSIVE.NOTCURRENT" })} </span>} >
          <i className="fas fa-circle  text-danger icon-10x" ></i>
        </Tooltip>
      }
      else {
        return <Tooltip title={<span style={{ fontSize: "10px" }}> {intl.formatMessage({ id: "CAMP.EXCLUSIVE.FUTURE" })} </span>} >
          <i className="fas fa-circle  text-info icon-10x" ></i>
        </Tooltip>
      }

    }

  }

  const viewPoppup = evt => {
    props.viewPoppup(evt.row.data);
  };

  const renderAppointmentTooltip = (evt) => {
    const { appointmentData } = evt;
    const { startDate, text, color, inicioHorario, idHorario, dayWeek, turno } = appointmentData;
    return (
      <div className="card" >
        <div className="card-body"> 
          <div className="row">
            <div className="col-md-3">
              <div style={{ backgroundColor: getIdColor(color), color: 'white', borderRadius: '3px' }} >
                {(inicioHorario === "S") ? (<i className="flaticon2-time" style={{ fontSize: "60px" }} />) : (<i className="flaticon2-calendar-9" style={{ fontSize: "60px" }} />)}
              </div>
            </div>
            <div className="col-md-9">

              <div className="row">
                <div className="col-md-12">
                  <h4 className="text-primary" >{getDayWeek(startDate)} </h4>
                  <div style={{ borderTopStyle: 'solid', borderTopColor: getIdColor(color), margin: '4px' }} />
                </div>
              </div>
              <div className="row">
                <div className="col-md-6"> {isNotEmpty(idHorario) && <h6>{intl.formatMessage({ id: "ACCESS.SCHEDULE.SCHEDULE" }).toUpperCase()}  : {idHorario} </h6>} </div>
                <div className="col-md-6"> {isNotEmpty(idHorario) && <h6>{intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY" }).toUpperCase()} : {dayWeek}</h6>} </div>
              </div>
              <div className="row">
                <div className="col-md-2" >
                  {isNotEmpty(idHorario) && (turno === 'D') ? (<i className="fas fa-sun  text-warning" style={{ fontSize: "30px" }} />) : (<i className="fas fa-moon" style={{ fontSize: "30px" }} />)}
                </div>
                <div className="col-md-10" style={{ textAlign: 'left', marginTop: '5px' }}>
                  {isNotEmpty(idHorario) ? (<h5> &nbsp; {text} </h5>) : (<h5> {text}</h5>)}
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

    );
  };

  const renderAppointment = (evt) => {
    const { appointmentData } = evt.data;
    const { text, inicioHorario, idHorario } = appointmentData;
    return (
      <>
        {
          (inicioHorario === "S" && isNotEmpty(idHorario)) ? (
            <span >
              <i className="flaticon2-time"></i>
            </span>
          ) : (<></>)
        }
        <span style={{ fontSize: '9px' }}> {text} </span>
      </>
    );
  };

  const obtenerIndefinido = rowData => {
    return rowData.Indefinido === "S";
  };

  /************************************************************************************************************/

  return (
    <>
      <HeaderInformation data={getInfo()} visible={true} labelLocation={'left'} colCount={6}
        toolbar={
          <PortletHeader
            title={""}
            toolbar={
              <PortletHeaderToolbar>
                <Button
                  icon="plus"
                  type="default"
                  hint={intl.formatMessage({ id: "ACTION.NEW" })}
                  onClick={props.nuevoRegistro}
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
            }
          />
        }
      />
      <PortletBody>

        <DataGrid
          dataSource={props.personaHorario}
          showBorders={true}
          focusedRowEnabled={true}
          keyExpr="RowIndex"
          onEditingStart={editarRegistro}
          onRowRemoving={eliminarRegistro}
          onFocusedRowChanged={seleccionarRegistro}
          focusedRowKey={props.focusedRowKey}
          repaintChangesOnly={true}
        >
          <Column cellRender={cellRenderColumn} width={"5%"} alignment={"center"} />
          <Column dataField="IdHorario" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"10%"} alignment={"center"} />
          <Column dataField="Horario" caption={intl.formatMessage({ id: "ASSISTANCE.SCHEDULE" })} width={"25%"} />
          <Column dataField="Compania" caption={intl.formatMessage({ id: "ASSISTANCE.SPECIAL.CONDITIONS.COMAPNY" })} width={"20%"} alignment={"left"} />
          <Column dataField="FechaInicio" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.STARTDATE" })} dataType="date" format="dd/MM/yyyy" alignment={"center"} width={"10%"} />
          <Column dataField="FechaFin" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.ENDDATE" })} dataType="date" format="dd/MM/yyyy" alignment={"center"} width={"10%"} />
          <Column dataField="DiaInicio" caption={intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.START" })} alignment={"center"} width={"8%"} />
          <Column dataField="Indefinido" caption={intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.UNDEFINED" })} calculateCellValue={obtenerIndefinido} alignment={"center"} width={"8%"} />

          <Column type="buttons" visible={props.showButtons} >
            <ColumnButton icon="clock" hint={intl.formatMessage({ id: "ASSISTANCE.PERSON.SCHEDULE.VIEW", })} onClick={viewPoppup} />
            <ColumnButton icon="edit" hint={intl.formatMessage({ id: "ACTION.EDIT", })} onClick={editarRegistro} />
            <ColumnButton icon="trash" hint={intl.formatMessage({ id: "ACTION.REMOVE", })} onClick={eliminarRegistro} />
          </Column>

          <Summary>
            <TotalItem
            cssClass="classColorPaginador_"
              column="IdHorario"
              alignment="left"
              summaryType="count"
              displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
            />
          </Summary>

        </DataGrid>
        <br />

        {/* CALENDARIO */}
        {props.personaHorario.length > 0 && (
          <div className="content">
            <div className="row">
              <div className="col-md-4" >
                <CalendarioRango
                  intl={intl}
                  FechaInicio={currentDate}
                  ejecutarCambioRango={ejecutarCambioFecha}
                  cambiarFechaActual={changedDate}
                />
              </div>
              <div className="col-md-8" >
              </div>
            </div>
            <div className="row">
              <ScrollView id="scrollview" >

                <Scheduler
                  // id="calendario_horario"
                  dataSource={props.personaHorarioDia}
                  defaultCurrentView="month"
                  defaultCurrentDate={currentDate}
                  //adaptivityEnabled={true}
                  firstDayOfWeek={1}
                  height={500}
                  editing={false}
                  onInitialized={initializedScheduler}
                  onAppointmentFormOpening={onAppointmentFormOpeningEvento}
                  appointmentDragging={appointmentDragging_config}
                  appointmentTooltipRender={(e) => renderAppointmentTooltip(e)}
                  appointmentComponent={(e) => renderAppointment(e)}
                >
                  <View
                    type="month"
                    dateCellRender={renderDiasSemana}
                    name="messes"
                    intervalCount={contView}
                  />
                  <Resource
                    dataSource={catalogoColores}
                    allowMultiple={false}
                    fieldExpr="color"
                    label="color"
                  />
                </Scheduler>
              </ScrollView >
            </div>
          </div>

        )}


      </PortletBody>

    </>
  );
};

// export default injectIntl(PersonaHorarioListPage);
export default injectIntl(WithLoandingPanel(PersonaHorarioListPage));
