import React, { useState, useEffect, Fragment, useRef } from 'react';
import HeaderInformation from "../../../../partials/components/HeaderInformation";

import { Button } from "devextreme-react";
import { injectIntl } from "react-intl";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import Scheduler, { View } from 'devextreme-react/scheduler';
import { loadMessages } from "devextreme/localization";
import esMessages from "devextreme/localization/messages/es.json";
import { DiasSemana, Meses, truncateDate, convertyyyyMMddToFormatDate } from '../../../../../_metronic/utils/utils';
import './ReservaListPage.css'
import { useSelector } from "react-redux";
import ScrollView from 'devextreme-react/scroll-view';
import ContextMenu from 'devextreme-react/context-menu';
import CalendarioRango from '../../../../partials/components/CalendarioRango/CalendarioRango';

const ReservaListPage = (props) => {
    const { intl, accessButton } = props;

    loadMessages(esMessages);
    const hidSelected = useRef(null);
    // const [isSelected, setIsSelected] = useState(false);
    //const usuario = useSelector(state => state.auth.user);
    //const perfil = useSelector(state => state.perfil.perfilActual);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [myScheduler, setMyScheduler] = useState(null);
    //let FechaInicio = "";
    //let FechaFin = "";
    //const ListaMeses = Meses();
    const [contextMenuEvent, setContextMenuEvent] = useState({
        evento: null,
        target: '.dx-scheduler-appointment',
        type: '1'
    });

    const itemClickReservaEdit = (e) => {
        props.editarReservas(e.appointmentData);
    }

    const itemClickReservaDelete = (e) => {
        let items = document.getElementById("1");
        items.parentElement.parentElement.parentElement.parentElement.style.display = "none";
        //------------------------------------------
        props.setMensajeEliminar("¿Desea eliminar todas las reservas asignadas del N° " + e.appointmentData.IdReserva);
        props.eliminarReserva(e.appointmentData, false, 1);
    }

    const itemClickReservaDiaDelete = (e) => {
        //------------------------------------------
        let items = document.getElementById("1");
        items.parentElement.parentElement.parentElement.parentElement.style.display = "none";
        //------------------------------------------
        props.setMensajeEliminar("¿Desea eliminar la reserva del día seleccionado?");
        props.eliminarReserva(e.appointmentData, false, 2);
    }

    const itemClickReservaCheckIn = (e) => {

        let { Fecha } = e.appointmentData;

        props.setMensajeEliminar(`¿Desea realizar check-in a la reserva N°${e.appointmentData.IdReserva} a partidir del ${convertyyyyMMddToFormatDate(Fecha)}?`);
        props.eliminarReserva(e.appointmentData, false, 3);
        //------------------------------------------
        let items = document.getElementById("1");
        items.parentElement.parentElement.parentElement.parentElement.style.display = "none";
        //------------------------------------------
    }

    const itemClickReservaCheckOut = (e) => {
        let { Fecha } = e.appointmentData;
        props.setMensajeEliminar(`¿Desea realizar check-out a la reserva N°${e.appointmentData.IdReserva} en el día ${convertyyyyMMddToFormatDate(Fecha)}?`);
        props.eliminarReserva(e.appointmentData, false, 4);

    }

    const itemClickReservaNuevo = (e) => { 
        let { FechaInicio, FechaFin } = props.dataRowEditNew;
        const { startDate } = e.cellData || { startDate: new Date() };
 
        if (hidSelected.current.value === "0") {
            FechaInicio = startDate;
            FechaFin = startDate;
        } else { 
            if (FechaFin < startDate) {
                FechaInicio = FechaFin;
                FechaFin = startDate;
            } else if (FechaFin !== startDate) {
                FechaInicio = startDate;
            }
        } 

        props.setDataRowEditNew(prev => ({ ...prev, FechaInicio, FechaFin }));  
        props.nuevoRegistro(FechaInicio, FechaFin);

    }

    const itemClickGeneral = (e, tipo) => {

        switch (tipo) {
            case 1: itemClickReservaEdit(e); break;
            case 2: itemClickReservaDelete(e); break;
            case 3: itemClickReservaDiaDelete(e); break;
            case 4: itemClickReservaCheckIn(e); break;
            case 5: itemClickReservaCheckOut(e); break;
            default: break;
        }
        //------------------------------------------
        let items = document.getElementById("1");
        items.parentElement.parentElement.parentElement.parentElement.style.display = "none";
        //------------------------------------------
    }

    const opcionMenu = [
        { id: 1, text: 'Modificar reserva', onItemClick: (e) => { itemClickGeneral(e, 1); } },
        { id: 2, text: 'Eliminar reserva', onItemClick: (e) => { itemClickGeneral(e, 2); } },
        { id: 3, text: 'Eliminar día reservado', onItemClick: (e) => { itemClickGeneral(e, 3); } },
        { id: 4, text: 'Check-In', onItemClick: (e) => { itemClickGeneral(e, 4); } },
        { id: 5, text: 'Check-Out', onItemClick: (e) => { itemClickGeneral(e, 5); }, beginGroup: true, }
    ];

    const opcionMenuNuevo = [
        { id: 1, text: 'Realizar reserva', onItemClick: itemClickReservaNuevo },
    ];

    const [contView, setContView] = useState(2);
    /*const [rangoFecha, setRangoFecha] = useState({
        FechaInicio: props.dataRowEditNew.FechaInicio,
        FechaFin: props.dataRowEditNew.FechaFin
    });*/

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
        if (e.fullName === "selectedCellData") {
            let array = [];
            if (e.value.length > 0) array = array.concat(...e.value);
            //if (e.previousValue.length > 0) array = array.concat(...e.previousValue);

            if (array.length > 0) {
                let FechaInit = array[0].startDate;
                let rango = array.reduce((data, item) => {
                    if (item.startDate > data.ff) data.ff = item.startDate;
                    if (item.startDate < data.fi) data.fi = item.startDate;
                    return data;
                }, { fi: FechaInit, ff: FechaInit });
 
                let { fi, ff } = rango;
                if (fi !== props.dataRowEditNew.FechaInicio || ff !== props.dataRowEditNew.FechaFin) {
                    hidSelected.current.value = "1";
                    props.dataRowEditNew.FechaInicio = fi;
                    props.dataRowEditNew.FechaFin = ff;
                }
            }
        }
    }

    const realizarCargaBusqueda = async (Fechas) => {
        let { FechaInicio, FechaFin } = Fechas;
        setCurrentDate(FechaInicio);
        props.setDataRowEditNew(prev => ({ ...prev, FechaInicio, FechaFin }));

        if (myScheduler != null) {
            myScheduler.option('currentDate', FechaInicio);
        }
        await props.buscarReservas(FechaInicio, FechaFin);
    }


    const appointmentTemplate = (itemData, itemIndex, itemElement) => {

        /*
        EstadoCama -> O = Ocupado | L = Libre | R=Reservado
        EstadoReserva -> I = Inactivo | A = Aprobado | p = Pendiente
        */

        let { Estado, EstadoCama } = itemData.appointmentData;
        //let { IdPersona } = props.dataRowEditNew;
        let elemento = '<div class="div_reserva_item">';
        let EstadoReserva = '';

        if (Estado === 'A') {
            EstadoReserva = EstadoCama === 'O' ? 'A' : 'P';
        } else if (Estado === 'I') {
            EstadoReserva = EstadoCama === 'O' ? 'I' : 'P';
        } else {
            //Reserva
            EstadoReserva = EstadoCama === 'R' ? 'P' : 'I';
        }


        if (EstadoReserva === 'A') {
            elemento += ` <span>Ocupado: ${itemData.appointmentData.IdReserva}</span>`;
        } else if (EstadoReserva === 'I') {
            elemento += ` <span>Finalizado: ${itemData.appointmentData.IdReserva}</span>`;
        } else {
            elemento += ` <span>Reserva: ${itemData.appointmentData.IdReserva}</span>`;
        }

        elemento += ` <span>Campamento: ${itemData.appointmentData.Campamento}</span>`;
        elemento += ` <span>Modulo: ${itemData.appointmentData.Modulo}</span>`;
        elemento += ` <span>Habitación: ${itemData.appointmentData.Habitacion}</span>`;
        elemento += '</div>';

        itemElement.classList.add('celda_Hijo_General');

        if (EstadoReserva === 'A') {
            itemElement.classList.add('item_ocupado');
        } else if (EstadoReserva === 'I') {
            itemElement.classList.add('item_checkout');
        } else {
            itemElement.classList.add('item_reservado');
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
        let infoData = data.appointmentData;

        if (!infoData.hasOwnProperty('IdReserva')) {
            data.cancel = true;
            return;
        }

        let form = data.form;
        let blancos = [];
        for (let x = 0; x <= 12; x++) blancos.push({ itemType: "empty" });
        form.option('items', blancos);

        let popup = data.popup;

        popup.option("toolbarItems[0].options.visible", false);
        popup.option("toolbarItems[0].options.text", "Cerrar");
        popup.option("position", "top");

        let objReserva = await props.retornarReserva(infoData);

        if (objReserva.length === 0) {
            data.cancel = true;
            return;
        }

        let items = crearFormulario(objReserva);
        form.option('items', items);

    };

    const crearFormulario = (objReserva) => {
        let strTurno = objReserva.Turno === 'F' ? 'Full' : objReserva.Turno === 'D' ? 'Dia' : 'Noche';

        let lstServicios = objReserva.Servicios != null ? objReserva.Servicios.split('|').map(x => ({
            label: { text: x.split('@')[1] },
            cssClass: 'css_servicio_item badge badge badge-info'
        })) : "";

        let css_color_estado = '';
        let strEstado = '';
        switch (objReserva.Estado) {
            case 'P': css_color_estado = 'item_cuadro_r'; strEstado = 'Reservado'; break;
            case 'A': css_color_estado = 'item_cuadro_i'; strEstado = 'Ocupado'; break;
            case 'I': css_color_estado = 'item_cuadro_o'; strEstado = 'Finalizado'; break;
            default: break;
        }


        let items = [
            { label: { text: 'Campamento' }, editorType: 'dxTextBox', editorOptions: { value: objReserva.Campamento, readOnly: true } },
            { label: { text: 'Estado' }, editorType: 'dxTextBox', editorOptions: { value: strEstado, readOnly: true }, cssClass: `${css_color_estado} item_cuadro` },
            { label: { text: 'FechaInicio' }, editorType: 'dxDateBox', editorOptions: { value: objReserva.FechaInicio, displayFormat: "dd/MM/yyyy", readOnly: true } },
            { label: { text: 'FechaFin' }, editorType: 'dxDateBox', editorOptions: { value: objReserva.FechaFin, displayFormat: "dd/MM/yyyy", readOnly: true } },
            { label: { text: 'TipoModulo' }, editorType: 'dxTextBox', editorOptions: { value: objReserva.TipoModulo, readOnly: true } },
            { label: { text: 'Modulo' }, editorType: 'dxTextBox', editorOptions: { value: objReserva.Modulo, readOnly: true } },
            { label: { text: 'TipoHabitacion' }, editorType: 'dxTextBox', editorOptions: { value: objReserva.TipoHabitacion, readOnly: true } },
            { label: { text: 'Habitacion' }, editorType: 'dxTextBox', editorOptions: { value: objReserva.Habitacion, readOnly: true } },
            { label: { text: 'Cama' }, editorType: 'dxTextBox', editorOptions: { value: objReserva.Cama, readOnly: true } },
            { label: { text: 'Turno' }, editorType: 'dxTextBox', editorOptions: { value: strTurno, readOnly: true } },

            { label: { text: 'Servicios' } },
            { itemType: "empty" },
        ];

        items.unshift({
            label: { text: `Detalle de reserva N° ${objReserva.IdReserva} - ${convertyyyyMMddToFormatDate(objReserva.Fecha)}` },
            colSpan: 2,
            cssClass: 'reserva_detalle_titulo'
        });

        if (lstServicios.length > 0) {
            let grupo = { itemType: "group", colSpan: 2, colCount: 4, items: lstServicios, }
            items.push(grupo);
        } else {
            items.push({ label: { text: '[Sin servicios adicionales]' } });
        }

        return items;
    }

    const onCellContextMenu = (e) => {
        let elementos = document.getElementsByClassName("divMenuCalendar");
        for (let i = 0; i < elementos.length; i++) {
            let item = elementos[i];
            let Id = elementos[i].id;
            if (Id === 0) {
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
        let Estado = e.appointmentData.Estado;
        //debugger;
        for (let i = 0; i < elementos.length; i++) {
            let item = elementos[i];
            let Id = elementos[i].id;

            if (Estado === 'P') {
                if (Id === 1 || Id === 2 || Id === 3 || Id === 4) {

                    item.classList.remove('disabled_option');
                } else {
                    item.classList.add('disabled_option');
                }
            } else if (Estado === 'A') {
                if (Id === 5) {
                    item.classList.remove('disabled_option');
                } else {
                    item.classList.add('disabled_option');
                }

            } else if (Estado === 'I') {
                item.classList.add('disabled_option');
            }

        }
        contextMenuEvent.evento = e;
    }

    const onContextMenuItemClick = (e) => {
        let Estado = contextMenuEvent.evento.appointmentData.Estado; //Estado == 'P' | Estado == 'A'
        let Id = e.itemData.id; // 1=Ampliar reserva | 2=Eliminar reserva | 3=Eliminar día reservado | 4=Check-In | 5=Check-Out

        if (Estado === 'P' && (Id === 1 || Id === 2 || Id === 3 || Id === 4)) {
            e.itemData.onItemClick(contextMenuEvent.evento, e);
        }

        if (Estado === 'A' && (Id === 5)) {
            e.itemData.onItemClick(contextMenuEvent.evento, e);
        }
    }

    const onContextMenuItemClickNuevo = (e) => {
        e.itemData.onItemClick(contextMenuEvent.evento, e);
    }


    const AppointmentMenuTemplate = (e) => {
        let Estado = contextMenuEvent.evento.appointmentData.Estado; //Estado == 'P' | Estado == 'A'
        let Id = e.id; // 1=Ampliar reserva | 2=Eliminar reserva | 3=Eliminar día reservado | 4=Check-In | 5=Check-Out

        if (Estado === 'P' && (Id === 1 || Id === 2 || Id === 3)) {
            return <div className="divMenuCalendar" id={`${Id}`}><div className="item-badge item_opt_color_reserva" ></div>{e.text}</div>
        } else if (Estado === 'P' && Id === 4) {
            return <div className="divMenuCalendar" id={`${Id}`}><div className="item-badge item_opt_color_checkin" ></div>{e.text}</div>
        } else if (Estado === 'A' && (Id === 5)) {
            return <div className="divMenuCalendar" id={`${Id}`}><div className="item-badge item_opt_color_checkout" ></div>{e.text}</div>
        } else {
            if (Id === 4) {
                return <div className='divMenuCalendar disabled_option' id={`${Id}`}><div className="item-badge item_opt_color_checkin" ></div>{e.text}</div>

            } else if (Id === 5) {
                return <div className='divMenuCalendar disabled_option' id={`${Id}`}><div className="item-badge item_opt_color_checkout" ></div>{e.text}</div>

            } else {
                return <div className='divMenuCalendar disabled_option' id={`${Id}`}><div className="item-badge item_opt_color_reserva" ></div>{e.text}</div>
            }
        }
    }

    const AppointmentMenuTemplateNuevo = (e) => {
        let Id = 0;
        return <div className="divMenuCalendar" id={`${Id}`}><div className="item-badge item_opt_color_reserva" ></div>{e.text}</div>

    }

    const dataCellComponent = (e) => {
        //let dia = e.data.startDate.getDate();
        let fecha1 = truncateDate(e.data.startDate);
        let fecha2 = truncateDate(new Date());

        let esFechaActual = fecha1.getTime() === fecha2.getTime();

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
        props.validarCampamentos();
    }, []);

    return (

        <Fragment>
            <input type='hidden' value={"0"} ref={hidSelected} />
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
                                            onClick={() => {
                                                let FechaInicio = props.dataRowEditNew.FechaInicio;
                                                let FechaFin = props.dataRowEditNew.FechaFin;

                                                if (!hidSelected.current || hidSelected.current.value === "0") {
                                                    FechaInicio = new Date();
                                                    FechaFin = new Date();
                                                }
                                                props.setDataRowEditNew(prev => ({ ...prev, FechaInicio, FechaFin }));
                                                props.nuevoRegistro(FechaInicio, FechaFin);
                                            }}
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
                        FechaInicio={props.dataRowEditNew.FechaInicio}
                        ejecutarCambioRango={realizarCargaBusqueda}
                    />}

                />)}

            < PortletBody >

                {/* ref={this.getInstance} */}
                < ScrollView id="scrollview" >
                    <div className="text-content">

                        <Scheduler
                            id="calendario_reserva"
                            dataSource={props.reservas}
                            defaultCurrentView="month"
                            defaultCurrentDate={currentDate}
                            allDayExpr="AllDay"
                            height={600}
                            className="css_calendario"
                            //customizeDateNavigatorText={customizeHeaderScheluder}
                            onOptionChanged={onOptionChanged}
                            // onCellClick={(e) => {  }}
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



export default injectIntl(ReservaListPage);
