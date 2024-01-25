import React, { useState } from "react";
import { Button as Button } from "devextreme-react";
import ScrollView from 'devextreme-react/scroll-view';
import Scheduler, { Resource, View } from 'devextreme-react/scheduler';
import { useSelector } from "react-redux";
import PropTypes from "prop-types";
import { injectIntl } from "react-intl";
import ContextMenu from 'devextreme-react/context-menu';
import { dateFormat } from "../../../../../_metronic";
import HeaderInformation from "../../../../partials/components/HeaderInformation";
import { Portlet, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";

import Confirm from "../../../../partials/components/Confirm";

import { validar } from "../../../../api/acceso/horarioDia.api";

const currentDate = new Date(2020, 4, 25);//Configuración inicial:04 es Mayo porque mes inicia en 0
//const views = ['week'];// ['workWeek'];
const dayOfWeekNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const HorarioDetalleListPage = props => {

    const { intl, idHorario, showButtons } = props;
    const { IdCliente, IdDivision } = useSelector(state => state.perfil.perfilActual);

    const [contextMenuEvent, setContextMenuEvent] = useState();
    const [isVisibleConfirm, setIsVisibleConfirm] = useState(false);
    const [instanceConfirm, setInstanceConfirm] = useState({});

    //Configuración edición del calendario
    const editingScheduler = {
        allowAdding: showButtons,
        allowDeleting: showButtons,
        allowResizing: showButtons,
        allowDragging: showButtons,
        allowUpdating: showButtons
    }

    const confirmar = (data) => {

        if (data.Accion === 'CREAR') {
            props.nuevoRegistro(data, true);
        }
        if (data.Accion === 'ACTUALIZAR') {
            props.actualizarHorarioDia(data, true);
        }
    }

    const showAddedToast = async (e) => {
        //Agregar desde Appointment
        var days = ['DO', 'LU', 'MA', 'MI', 'JU', 'VI', 'SA'];
        var x = new Date(e.appointmentData.startDate);
        var y = new Date(e.appointmentData.endDate);
        var dayName = days[x.getDay()];
        let param = { IdCliente, IdDivision, Accion: 'CREAR', HoraInicio: dateFormat(x, "hh:mm"), HoraFin: dateFormat(y, "hh:mm"), Dia: dayName, Intervalo: 0 }

        await validar(param).then(response => {
            if (response.length > 0) {
                setIsVisibleConfirm(true);
                setInstanceConfirm({ ...param, ...{ arrayRemove: response } });
            } else {
                props.nuevoRegistro(param);
            }
        });

    }

    const showUpdatedToast = async (e) => {
        //Actualizar cuando se arrastrar Appointment
        const { Dia, Intervalo } = e.appointmentData;
        var x = new Date(e.appointmentData.startDate);
        var y = new Date(e.appointmentData.endDate);
        let param = { idHorario, IdCliente, IdDivision, Accion: 'ACTUALIZAR', HoraInicio: dateFormat(x, "hh:mm"), HoraFin: dateFormat(y, "hh:mm"), Dia, Intervalo };
        //Validar
        await validar(param).then(response => {
            if (response.length > 0) {
                setIsVisibleConfirm(true);
                setInstanceConfirm({ ...param, ...{ arrayRemove: response } });
            } else {
                props.actualizarHorarioDia(param);
            }
        });
    }
    const showDeletedToast = (e) => {
        //Eliminar dentro tooltip Appointment
        const { Dia, Intervalo } = e.appointmentData;
        var x = new Date(e.appointmentData.startDate);
        var y = new Date(e.appointmentData.endDate);
        props.eliminarHorarioDia({ HoraInicio: dateFormat(x, "hh:mm"), HoraFin: dateFormat(y, "hh:mm"), Dia, Intervalo });

    }
    const onAppointmentFormOpening = (data) => {
        //Personalizar formulario Appointment
        let form = data.form;
        form.option('items', [{
            dataField: 'startDate',
            label: { text: [intl.formatMessage({ id: "ACCESS.SCHEDULE.SCHEDULE.START" })] },
            editorType: 'dxDateBox',
            format: "HH:mm",
            editorOptions: {
                type: 'time',
                maxLength: 5,
                displayFormat: "HH:mm",
                useMaskBehavior: true,
            }
        }, {
            name: 'endDate',
            dataField: 'endDate',
            label: { text: [intl.formatMessage({ id: "ACCESS.SCHEDULE.SCHEDULE.END" })] },
            editorType: 'dxDateBox',
            format: "HH:mm",
            editorOptions: {
                type: 'time',
                maxLength: 5,
                displayFormat: "HH:mm",
                useMaskBehavior: true,
            }
        }]);

    }

    function onCellContextMenu(e) {
        //Obtener evento clik
        setContextMenuEvent(e);
    }

    //Eventos del menu.
    function onContextMenuItemClick(e) {
        //Ejecutar el evento...
        if (props.showButtons) {
            e.itemData.onItemClick(contextMenuEvent, e);
        }
    }

    const cellContextMenuItems = [
        //Opciones del menuContextual        
        { text: [intl.formatMessage({ id: "ACCESS.SCHEDULE.SCHEDULE.INTERVAL.ADD" })], onItemClick: createAppointment },

    ];
    function createAppointment(e) {
        //Crear intervalo desde menu contextual
        var days = ['DO', 'LU', 'MA', 'MI', 'JU', 'VI', 'SA'];
        var x = new Date(e.cellData.startDate);
        var y = new Date(e.cellData.endDate);
        var dayName = days[x.getDay()];

        props.nuevoRegistro({ HoraInicio: dateFormat(x, "hh:mm"), HoraFin: dateFormat(y, "hh:mm"), Dia: dayName, Intervalo: 0 });

    }
    //Configuracion de colores Appointment
    const intervalos = [
        {
            text: 'INTERVALO 1',
            id: 1,
            color: '#727bd2'
        }, {
            text: 'INTERVALO 2',
            id: 2,
            color: '#32c9ed'
        }, {
            text: 'INTERVALO 3',
            id: 3,
            color: '#2a7ee4'
        }, {
            text: 'INTERVALO 4',
            id: 4,
            color: '#7b49d3'
        },
        {
            text: 'INTERVALO 5',
            id: 5,
            color: 'red'
        }
    ];

    function renderDateCell(cellData) {
        return (
            <React.Fragment>
                <div className="name">{dayOfWeekNames[cellData.date.getDay()]}</div>
                {/* <div className="number">{cellData.date.getDate()}</div> */}
            </React.Fragment>
        );
    }

    return (

        <>
            <Portlet>
                <HeaderInformation data={props.getInfo()} visible={true} labelLocation={'left'} colCount={3}
                    toolbar={
                        <PortletHeader
                            title=""
                            toolbar={
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
                            }
                        />

                    } />

                <ScrollView id="scroll">

                    <Scheduler
                        dataSource={props.horarioDias}
                        //views={views}
                        defaultCurrentView="week"//"workWeek"
                        defaultCurrentDate={currentDate}
                        startDayHour={0}
                        endDayHour={24}
                        height={"100%"}
                        width={"100%"}
                        editing={editingScheduler}
                        onAppointmentAdded={showAddedToast}
                        onAppointmentUpdated={showUpdatedToast}
                        onAppointmentDeleted={showDeletedToast}
                        onAppointmentFormOpening={onAppointmentFormOpening}

                        showAllDayPanel={false}
                        firstDayOfWeek={1} //| 2 | 3 | 4 | 5 | 6 | 0
                        //recurrenceEditMode="occurrence"  'dialog' | 'occurrence' | 'series';
                        focusStateEnabled={true}
                        onCellContextMenu={onCellContextMenu}
                    >
                        <View
                            type="week"
                            // groups={typeGroups}
                            dateCellRender={renderDateCell}

                        />
                        <Resource
                            dataSource={intervalos}
                            allowMultiple={false}
                            fieldExpr="Intervalo"
                            label="Intervalo"
                        />
                    </Scheduler>
                    <ContextMenu
                        dataSource={cellContextMenuItems}//{contextMenuItems}
                        width={"40%"}
                        target={'.dx-scheduler-date-table-cell'}//{target}
                        disabled={false}
                        onItemClick={onContextMenuItemClick}
                    />
                </ScrollView>
            </Portlet>
            <Confirm
                message={intl.formatMessage({ id: "MESSAGES.INTERVAL.INTERSECTION" })}
                isVisible={isVisibleConfirm}
                setIsVisible={setIsVisibleConfirm}
                setInstance={setInstanceConfirm}
                onConfirm={() => { confirmar(instanceConfirm); }}
                onHide={() => { props.listarHorarioDia() }}
                title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
                confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
                cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
            />
        </>
    );
};
HorarioDetalleListPage.prototype = {
    showButtons: PropTypes.bool,
    showHeaderInformation: PropTypes.bool,
    idHorario: PropTypes.string,
}
HorarioDetalleListPage.defaultProps = {
    showButtons: true,
    showHeaderInformation: true,
    idHorario: "",
}


export default injectIntl(HorarioDetalleListPage);
