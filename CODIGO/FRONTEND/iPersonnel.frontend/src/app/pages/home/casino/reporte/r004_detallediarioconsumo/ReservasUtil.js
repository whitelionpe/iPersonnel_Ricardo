import React, { Fragment } from 'react';
import { Meses, convertyyyyMMddToDate, PaginationSetting } from '../../../../../../_metronic/utils/utils';
import { Tooltip } from 'devextreme-react/tooltip';

//Retorna el estado de la reserva segun el turno, estado y persona que reservo.
/*
LX	-> Libre: Dia(LD) Noche(LN) Full(LF)    -> idreserva=''
O   -> Ocupado
R   -> Reservado
F   -> Finalizado 
EX  -> Cama Exclusiva
ND  -> No disponible
*/
export const getEstadoCeldaDia = (currentIdPersona, idReserva, turno, estado, idPersona, estadoCama, camaExclusiva) => {
    //estado        => A=Aprobado | P=Pendiente | I=Inactiva
    //estadoCama    => O=Ocupado | R=Reservado | F=Finalizado | L=Libre | 0=Sin Estado
    //camaExclusiva => S=Si Exclusiva | L=No Exclusiva(Libre) | N=Excluir (Exclusiva otra persona)
    // let estadoCelda = '';

    // if (idReserva == '0' || (idReserva != '0' && estadoCama == 'L')) {
    //     if (camaExclusiva === 'S') {
    //         estadoCelda = 'EX';
    //     } else if (camaExclusiva === 'N') {
    //         estadoCelda = 'ND'
    //     } else {
    //         estadoCelda = 'LF'
    //     }

    // } else {
    //     if (estado == 'A') {
    //         estadoCelda = 'O';
    //     } else if (estado == 'P') {
    //         estadoCelda = 'R';
    //     } else if (estado == 'I' && estadoCama != 'L') {
    //         estadoCelda = 'F';
    //     }
    // }

    // return estadoCelda;

}

//Retorna la clase css de acuerdo al estado generado de la celda
export const getClassCeldaByEstado = (estadoCelda) => {
    // let str_css = 'celda_Hijo_General ';

    // switch (estadoCelda) {
    //     case 'LF': str_css += 'celda_LF'; break;
    //     case 'LD': str_css += 'celda_LD'; break;
    //     case 'LN': str_css += 'celda_LN'; break;
    //     case 'R': str_css += 'item_opt_color_reserva item_color_font'; break;
    //     case 'O': str_css += 'item_opt_color_checkin item_color_font'; break;
    //     case 'F': str_css += 'item_opt_color_checkout item_color_font'; break;
    //     case 'EX': str_css += 'celda_EX'; break;
    //     case 'ND': str_css += 'celda_ND'; break;
    // }
    // return str_css;
}

export function esDiaDisponible(estadoCeldActual) {
    return estadoCeldActual === 'LF' || estadoCeldActual === 'LD' || estadoCeldActual === 'LN' || estadoCeldActual === 'EX';
}

export const ReservaEstados = () => {
    // return [
    //     { text: "Libre", Id: "LF", color: "white", },
    //     { text: "Libre Día", Id: "LD", color: "white", },
    //     { text: "Libre Noche", Id: "LN", color: "white", },
    //     { text: "Ocupado por otro trabajador", Id: "OC", color: "#a8a9aa", },
    //     { text: "Reservado por otro trabajador", Id: "RE", color: "#d2d2d8", },
    //     { text: "Ocupado por el mismo trabajador", Id: "OT", color: "#005400", },
    //     { text: "Exclusiva otro trabajador", Id: "EF", color: "#970e00", },
    //     { text: "Exclusiva otro trabajador Día", Id: "ED", color: "#970e00", },
    //     { text: "Exclusiva otro trabajador Noche", Id: "EN", color: "#970e00", },
    //     { text: "Reservado por el mismo trabjador", Id: "RT", color: "#8cde8f", },
    //     { text: "Seleccionado para generar reserva", Id: "SE", color: "#000a8d", },
    //     { text: "No disponible por estar reservado u ocupado por el trabajador", Id: "XX", color: "#000100", },
    // ];
}

export const crearArregloColumnasHeader = (array_header, intl, eventos) => {

 
    let header_json = [];
    let ListaMeses = Meses();
    for (let i = 0; i < array_header.length; i++) {
        let item = array_header[i];
        let mes = {
            dataField: item.key,
            isValues: true,
            caption: intl.formatMessage({ id: ListaMeses[item.mes - 1].Descripcion }),
            items: []
        }

        for (let j = 0; j < item.detalle.length; j++) {
            mes.items.push({
                dataField: item.detalle[j].key,
                caption: item.detalle[j].dia,
                key: item.detalle[j].key,
                alignment: "center",
                width: 30,
                // events: eventos
                
            });
        }
        header_json.push(mes);
    }
    return header_json;
}

export const ItemFormReservation = () => {

}


export const cellRenderReserva = (param) => {
    console.log('1111111111111')

    if (param && param.data) {

        if (param.text != '') {
            let fecha = param.column.dataField.split('_')[1];
            let IdCama = param.data.IdCama;

            let [idReserva, turno, estado, idPersona, EstadoCama, CamaExclusiva] = param.text.split('_');
            let currentIdPersona = 0;
            let leyenda = getEstadoCeldaDia(currentIdPersona, idReserva, turno, estado, idPersona, EstadoCama, CamaExclusiva);
            let css_clase = getClassCeldaByEstado(leyenda);

            return <Fragment>
                <span id={`${IdCama}_${fecha}`} >{leyenda}</span>
                <input type="hidden" value={param.text} />
            </Fragment>

        }
    }
}

export const cellRenderHabitacion = (param) => {
   
    // if (param && param.data) {
    //     if (param.column.dataField == 'Habitacion') {
    //         //////////console.log("se repinta", param);
    //         return (param.data.Servicios != '') ?
    //             <Fragment>
    //                 <div className="label" id={`${param.data.IdHabitacion}_${param.data.IdCama}`} >
    //                     {param.text}
    //                 </div>
    //                 <Tooltip
    //                     target={`#${param.data.IdHabitacion}_${param.data.IdCama}`}
    //                     showEvent="dxhoverstart"
    //                     hideEvent="dxhoverend"
    //                     position="right"
    //                 >
    //                     <div>{param.data.Servicios.split('|').map(x => (<Fragment><span>{x.split('@')[1]}</span><br /></Fragment>))}</div>
    //                 </Tooltip>
    //             </Fragment >
    //             : param.text;
    //     }
    // }

}

export const onCellPreparedDay = (e) => {
    if (e.rowType === 'data') {
       
        let columnValid = e.column.dataField.substring(0, 2);

        console.log('jorge',)

        if (columnValid === 'K_') {
            e.cellElement.classList.add("celda_Padre");
        }
    }
}
