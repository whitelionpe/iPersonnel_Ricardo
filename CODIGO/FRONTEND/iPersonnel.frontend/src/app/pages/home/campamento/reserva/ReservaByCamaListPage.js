import React, { useState, useEffect, Fragment, useRef } from 'react';
import HeaderInformation from "../../../../partials/components/HeaderInformation";

import { Button } from "devextreme-react";
import { injectIntl } from "react-intl";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import { isNotEmpty } from "../../../../../_metronic";

import Scheduler, { Resource, View } from 'devextreme-react/scheduler';
import { locale, loadMessages } from "devextreme/localization";
import esMessages from "devextreme/localization/messages/es.json";
import { DiasSemana, Meses, truncateDate, convertyyyyMMddToFormatDate } from '../../../../../_metronic/utils/utils';
import './ReservaListPage.css'
import { useSelector } from "react-redux";
import ScrollView from 'devextreme-react/scroll-view';
import ContextMenu from 'devextreme-react/context-menu';
import CalendarioRango from '../../../../partials/components/CalendarioRango/CalendarioRango';

const ReservaByCamaListPage = (props) => {

  console.log("ReservaByCamaListPage|props:",props);

    const { intl } = props;
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
        setCurrentDate(FechaInicio);
        props.setDataRowEditNew({ ...dataRowEditNew, FechaInicio, FechaFin });

        if (myScheduler != null) {
            myScheduler.option('currentDate', FechaInicio);
        }

        await props.buscarReservas(FechaInicio, FechaFin);
    }


    const appointmentTemplate = (itemData, itemIndex, itemElement) => {
        let { IdReserva, Turno, Estado } = itemData.appointmentData;
        let { IdPersona } = props.dataRowEditNew;
        let elemento = '<div class="div_reserva_item">';

        if (Estado == 'A') {
            elemento += ` <span>Ocupado: ${itemData.appointmentData.IdReserva}</span>`;
        } else if (Estado == 'I') {
            elemento += ` <span>Finalizado: ${itemData.appointmentData.IdReserva}</span>`;
        } else {
            elemento += ` <span>Reserva: ${itemData.appointmentData.IdReserva}</span>`;
        }
        elemento += ` <span>${itemData.appointmentData.TipoDocumento}: ${itemData.appointmentData.Documento}</span>`;
        elemento += ` <span>${itemData.appointmentData.Apellido}</span>`;
        elemento += ` <span>${itemData.appointmentData.Nombre}</span>`;

        elemento += '</div>';

        itemElement.classList.add('celda_Hijo_General');

        if (Estado == 'A') {
            itemElement.classList.add('item_ocupado');
        } else if (Estado == 'I') {
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

        if (objReserva.length == 0) {
            data.cancel = true;
            return;
        }

        let items = crearFormulario(objReserva);
        form.option('items', items);

    };

    const crearFormulario = (objReserva) => {
        let strTurno = objReserva.Turno == 'F' ? 'Full' : objReserva.Turno == 'D' ? 'Dia' : 'Noche';

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
        }


        let items = [
            { label: { text: 'Campamento' }, editorType: 'dxTextBox', editorOptions: { value: objReserva.Campamento, readOnly: true } },
            { label: { text: 'Estado' }, editorType: 'dxTextBox', editorOptions: { value: strEstado, readOnly: true }, cssClass: `${css_color_estado} item_cuadro` },
            { label: { text: 'FechaInicio' }, editorType: 'dxDateBox', editorOptions: { value: objReserva.FechaInicio, displayFormat: "dd/MM/yyyy", readOnly: true } },
            { label: { text: 'FechaFin' }, editorType: 'dxDateBox', editorOptions: { value: objReserva.FechaFin, displayFormat: "dd/MM/yyyy", readOnly: true } },
            { label: { text: 'Turno' }, editorType: 'dxTextBox', editorOptions: { value: strTurno, readOnly: true } },
            { itemType: "empty" },

            { label: { text: 'Servicios' } },
            { itemType: "empty" },
        ];


        /*elemento += ` <span>${item.Data.TipoDocumento}: ${itemData.appointmentData.Documento}</span>`;
        elemento += ` <span>${itemData.appointmentData.Apellido}</span>`;
        elemento += ` <span>${itemData.appointmentData.Nombre}</span>`;*/


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

        items.push(
            {
                label: { text: `Datos de persona:` },
                colSpan: 2,
                cssClass: 'item_top_0'
            },
            { label: { text: 'Nombre' }, editorType: 'dxTextBox', editorOptions: { value: objReserva.Nombre, readOnly: true } },
            { label: { text: 'Apellido' }, editorType: 'dxTextBox', editorOptions: { value: objReserva.Apellido, readOnly: true } },

            { label: { text: 'Tipo Documento' }, editorType: 'dxTextBox', editorOptions: { value: objReserva.TipoDocumento, readOnly: true } },
            { label: { text: 'Documento' }, editorType: 'dxTextBox', editorOptions: { value: objReserva.Documento, readOnly: true } },

            { label: { text: 'Compañia' }, editorType: 'dxTextBox', editorOptions: { value: objReserva.Compania, readOnly: true } },
            { label: { text: 'Unid.Organizativa' }, editorType: 'dxTextBox', editorOptions: { value: objReserva.UnidadOrganizativa, readOnly: true } },

        );



        return items;
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

            if (Estado == 'P') {
                if (Id == 1 || Id == 2 || Id == 3 || Id == 4) {

                    item.classList.remove('disabled_option');
                } else {
                    item.classList.add('disabled_option');
                }
            } else if (Estado == 'A') {
                if (Id == 5) {
                    item.classList.remove('disabled_option');
                } else {
                    item.classList.add('disabled_option');
                }

            } else if (Estado == 'I') {
                item.classList.add('disabled_option');
            }

        }
        contextMenuEvent.evento = e;
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
        props.validarCampamentos();
    }, []);


    return (


        <Fragment>
            {props.showButton && (
                <HeaderInformation data={props.getInfo()} visible={true} labelLocation={'left'} colCount={2}
                    arrayColSize={[8, 3, 1]}
                    toolbar={
                        <PortletHeader
                            title=""
                            toolbar={
                                <PortletHeaderToolbar>
                                    <PortletHeaderToolbar>
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
                            onOptionChanged={onOptionChanged}
                            appointmentTemplate={appointmentTemplate}
                            appointmentDragging={appointmentDragging_config}
                            onAppointmentFormOpening={onAppointmentFormOpeningEvento}
                            onAppointmentContextMenu={onAppointmentContextMenu}
                            dataCellComponent={dataCellComponent}
                            // onCellContextMenu={onCellContextMenu}
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

                    </div>
                </ScrollView >
            </PortletBody >

        </Fragment >

    );
};

export default injectIntl(ReservaByCamaListPage);
