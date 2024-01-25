import React, { useState, useEffect, Fragment, useRef } from 'react';
import HeaderInformation from "../../../../partials/components/HeaderInformation";

import { Button } from "devextreme-react";
import { injectIntl } from "react-intl";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import { isNotEmpty } from "../../../../../_metronic";

import Scheduler, { Resource, View } from 'devextreme-react/scheduler';
import { locale, loadMessages } from "devextreme/localization";
import esMessages from "devextreme/localization/messages/es.json";
import { DiasSemana, getStartAndEndOfMonthByDay, addDaysToDate, Meses, truncateDate, convertyyyyMMddToFormatDate } from '../../../../../_metronic/utils/utils';
import './FeriadoListPage.css'
import { useSelector } from "react-redux";
import ScrollView from 'devextreme-react/scroll-view';
import ContextMenu from 'devextreme-react/context-menu';
import CalendarioRango from '../../../../partials/components/CalendarioRango/CalendarioRango';
const FeriadoListPage = (props) => {
    const { intl, accessButton } = props;
    const dataRowEditNew = props.dataRowEditNew;
    loadMessages(esMessages);

    const usuario = useSelector(state => state.auth.user);
    const perfil = useSelector(state => state.perfil.perfilActual);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [myScheduler, setMyScheduler] = useState(null);
    let FechaInicio = "";
    let FechaFin = "";
    const ListaMeses = Meses();
    const [contextMenuEvent, setContextMenuEvent] = useState({
        evento: null,
        target: '.dx-scheduler-appointment',
        type: '1'
    });

    const itemClickFeriadoEdit = (e) => {
        props.editarFeriados(e.appointmentData);
    }

    const itemClickFeriadoDelete = (e) => {
        let items = document.getElementById("1");
        items.parentElement.parentElement.parentElement.parentElement.style.display = "none";
        //------------------------------------------
        props.setMensajeEliminar(intl.formatMessage({ id: "ADMINISTRATION.HOLIDAY.REMOVE.MSG" }) + e.appointmentData.Feriado);
        props.eliminarFeriados(e.appointmentData, false, 1);
    }

    const itemClickReservaNuevo = (e) => {
        props.nuevoRegistro();
    }

    const itemClickGeneral = (e, tipo) => {
      // console.log("itemClickGeneral|e|tipo:",e,tipo);
        switch (tipo) {
            case 1: itemClickFeriadoEdit(e); break;
            case 2: itemClickFeriadoDelete(e); break;
        }
        //------------------------------------------
        let items = document.getElementById("1");
        if(items != null)
        {
          items.parentElement.parentElement.parentElement.parentElement.style.display = "none";
        }
        //------------------------------------------
    }
 
    // "ADMINISTRATION.HOLIDAY.MODIFY": "Modify Holiday",
    // "ADMINISTRATION.HOLIDAY.REMOVE": "Delete Holiday",
    // "ADMINISTRATION.HOLIDAY.REGISTER": "Register Holiday",

    const opcionMenu = [
        { id: 1, text: intl.formatMessage({ id: "ADMINISTRATION.HOLIDAY.MODIFY" }), onItemClick: (e) => { itemClickGeneral(e, 1); } },
        { id: 2, text: intl.formatMessage({ id: "ADMINISTRATION.HOLIDAY.REMOVE" }), onItemClick: (e) => { itemClickGeneral(e, 2); } },
    ];

    const opcionMenuNuevo = [
        { id: 1, text: intl.formatMessage({ id: "ADMINISTRATION.HOLIDAY.REGISTER" }), onItemClick: itemClickReservaNuevo },
    ];

    const [contView, setContView] = useState(2);
    const [rangoFecha, setRangoFecha] = useState({
        FechaInicio: props.dataRowEditNew.FechaInicio,
        FechaFin: props.dataRowEditNew.FechaFin
    });

    const renderDiasSemana = (cellData) => {
        let dias = DiasSemana();
        let nombre = dias[cellData.date.getDay()];

        return (
            <React.Fragment>
                <div className="name">{intl.formatMessage({ id: nombre.Descripcion })}</div>
            </React.Fragment>
        );
    }


    const onOptionChanged = async (e) => {
        if (e.fullName == "selectedCellData") {
            if (e.value.length > 0) {
                let fi = e.value[0].startDate;
                let ff = e.value[e.value.length - 1].startDate;
                if (fi != props.dataRowEditNew.FechaInicio || ff != props.dataRowEditNew.FechaFin) {
                    props.dataRowEditNew.FechaInicio = fi;
                    props.dataRowEditNew.FechaFin = ff;
                }
            }
        }
    }

    const realizarCargaBusqueda = async (Fechas) => {
      
        let { FechaInicio, FechaFin } = Fechas;

        // console.log("realizarCargaBusqueda|Fechas:",Fechas);
        // console.log("realizarCargaBusqueda|FechaInicio:",FechaInicio);
        // console.log("realizarCargaBusqueda|FechaFin:",FechaFin);

        setCurrentDate(FechaInicio);
        props.setDataRowEditNew({ ...dataRowEditNew, FechaInicio, FechaFin });

        if (myScheduler != null) {
            myScheduler.option('currentDate', FechaInicio);
        }

        await props.buscarFeriados(FechaInicio, FechaFin);
    }


    const appointmentTemplate = (itemData, itemIndex, itemElement) => {
        let { Activo } = itemData.appointmentData;
        let elemento = '<div class="div_reserva_item">';
 
        elemento += ` <span>Feriado: ${itemData.appointmentData.Feriado}</span>`;
        elemento += ` <span>Temporal: ${itemData.appointmentData.TemporalDescripcion}</span>`;
        elemento += ` <span>Plantilla: ${itemData.appointmentData.PlantillaDescripcion}</span>`;
        elemento += ` <span>Fecha: ${itemData.appointmentData.FechaDescripcion}</span>`;
        elemento += '</div>';

        itemElement.classList.add('celda_Hijo_General');

        if (Activo == 'S') {
          itemElement.classList.add('item_checkout');
        } else {
            itemElement.classList.add('item_ocupado');
        }

        itemElement.classList.add('div_reserva_item');
        itemElement.innerHTML += elemento;
    }

    const appointmentDragging_config = {
        autoScroll: false,
        onDragMove: (e) => { e.cancel = true; },
        onDragStart: (e) => { e.cancel = true; }

    };

    const onAppointmentFormOpeningEvento = async (data) => {
            data.cancel = true;
            return;
    };

    const onCellContextMenu = (e) => {
       console.log("onCellContextMenu|e:",e);
      const rangeDate  = {
        FechaInicioSelected:e.cellData.startDate,
        FechaFinSelected:e.cellData.endDate
      }
      props.setDateSelected(rangeDate);

        let elementos = document.getElementsByClassName("divMenuCalendar");
        for (let i = 0; i < elementos.length; i++) {
            let item = elementos[i];
            let Id = elementos[i].id;
            if (Id == 0) {
                item.classList.remove('disabled_option');
            }
        }
        contextMenuEvent.evento = e;
    }

    const onAppointmentContextMenu = (e) => {
        
        let items = document.getElementById("1");

        if (items != null) {
            items.parentElement.parentElement.parentElement.parentElement.style.display = "";
        }

        //------------------------------------------
        let elementos = document.getElementsByClassName("divMenuCalendar")
        //debugger;
        for (let i = 0; i < elementos.length; i++) {
            let item = elementos[i];
            let Id = elementos[i].id;
                if ( Id == 1 || Id == 2 ) {
                    item.classList.remove('disabled_option');
                } 
        }
        contextMenuEvent.evento = e;
    }

    const onContextMenuItemClick = (e) => {
        let Id = e.itemData.id; // 1= Editar | 2=Eliminar 

        if (Id == 1 || Id == 2) {
            e.itemData.onItemClick(contextMenuEvent.evento, e);
        }
    }

    const onContextMenuItemClickNuevo = (e) => {
      // console.log("onContextMenuItemClickNuevo|e:",e);
        e.itemData.onItemClick(contextMenuEvent.evento, e);
    }


    const AppointmentMenuTemplate = (e) => {

        let Id = e.id; // 1=Editar  | 2=Eliminar 
        if (Id == 1 || Id == 2) {
            return <div class="divMenuCalendar" id={`${Id}`}><div className="item-badge item_opt_color_reserva" ></div>{e.text}</div>
        }
    }

    const AppointmentMenuTemplateNuevo = (e) => {
      // console.log("AppointmentMenuTemplateNuevo|e:",e);
        let Id = 0;
        return <div class="divMenuCalendar" id={`${Id}`}><div className="item-badge item_opt_color_reserva" ></div>{e.text}</div>

    }

    const dataCellComponent = (e) => {
        let dia = e.data.startDate.getDate();
        let fecha1 = truncateDate(e.data.startDate);
        let fecha2 = truncateDate(new Date());

        let esFechaActual = fecha1.getTime() == fecha2.getTime();

        return (esFechaActual) ? (
            <div className={"celda_inicio_mes"}>
                <div className={"celda_calendario_p"}>
                    <div className={"celda_calendario_h"}>
                        {e.data.text}
                    </div>
                </div>
            </div>
        ) : (
                <div className={"celda_calendario_p"}>
                    <div className={"celda_calendario_h"}>
                        {e.data.text}
                    </div>
                </div>
            );


    }

    const onAppointmentClick = (e) => {
        removeClassAllByClass('item_reservado_click', 'item_reservado_click');
        e.appointmentElement.children[0].classList.add('item_reservado_click');
        e.cancel = true;
    }

    function removeClassAllByClass(keyBusqueda, clase) {
        let elementos = document.getElementsByClassName(keyBusqueda)
        for (let i = 0; i < elementos.length; i++) {
            elementos[i].classList.remove(clase);
        }
    }


    const initializedScheduler = (e) => {
        setMyScheduler(e.component);
    }

    useEffect(() => {
        // props.validarCampamentos();
    }, []);

    return (

        <Fragment>
            {props.showButton && (
                <HeaderInformation 
                data={props.getInfo()} 
                visible={true} 
                labelLocation={'left'} 
                colCount={6}
                    toolbar={
                        <PortletHeader
                            title=""
                            /* toolbar={
                                <PortletHeaderToolbar>
                                    <PortletHeaderToolbar>
                                    <Button
                                            icon="fa fa-times-circle"
                                            type="normal"
                                            hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
                                            onClick={props.cancelarEdicion}
                                        />
                                    </PortletHeaderToolbar>
                                </PortletHeaderToolbar>
                            } */
                        />

                    }

                    componenteAdicional={<CalendarioRango
                        intl={intl}
                        FechaInicio={props.dataRowEditNew.FechaInicio}
                        ejecutarCambioRango={realizarCargaBusqueda}
                    />}

                />)}

            < PortletBody >

                < ScrollView id="scrollview" >
                    <div className="text-content">

                        <Scheduler
                            id="calendario_reserva"
                            dataSource={props.feriados}
                            defaultCurrentView="month"
                            defaultCurrentDate={currentDate}
                            allDayExpr="AllDay"
                            height={600}
                            className="css_calendario"
                            onOptionChanged={onOptionChanged}
                            appointmentTemplate={appointmentTemplate}
                            appointmentDragging={appointmentDragging_config}
                            onAppointmentFormOpening={onAppointmentFormOpeningEvento}
                            onAppointmentContextMenu={onAppointmentContextMenu}
                            dataCellComponent={dataCellComponent}
                            onCellContextMenu={onCellContextMenu}
                            onAppointmentClick={onAppointmentClick}
                            onInitialized={initializedScheduler}
                        >
                            <View
                                type="month"
                                dateCellRender={renderDiasSemana}
                                name="messes"
                                intervalCount={contView}
                            />
                        </Scheduler>

                        <ContextMenu
                            id="contexMenuScheduler"
                            dataSource={opcionMenu}
                            width={200}
                            //target={contextMenuEvent.target}
                            target={".dx-scheduler-appointment"}
                            disabled={false}
                            onItemClick={onContextMenuItemClick}
                            itemRender={AppointmentMenuTemplate}
                        />

                        <ContextMenu
                            id="contexMenuSchedulerNuevo"
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

        </Fragment >

    );
};



export default injectIntl(FeriadoListPage);
