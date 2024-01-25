import React, { Fragment, useEffect, useState, useRef } from 'react';
import { useSelector } from "react-redux";
import Form, { Item, GroupItem, SimpleItem, ButtonItem, EmptyItem } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";
import { injectIntl } from "react-intl";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import HeaderInformation from "../../../../partials/components/HeaderInformation";
import { handleInfoMessages } from "../../../../store/ducks/notify-messages";
import { Tooltip } from 'devextreme-react/tooltip';
import { DataGrid, Column } from "devextreme-react/data-grid";

//Combos
import { listarPerfilActual as listarPerfilPersona } from "../../../../api/campamento/personaPerfil.api";
import { campamentos as listarCampamentos } from "../../../../api/campamento/perfilDetalle.api";
import { listar as listarModulo } from "../../../../api/campamento/tipoModulo.api";
import { listar as listarTipoHabitacion } from "../../../../api/campamento/tipoHabitacion.api";
import { listar as listarServicios } from "../../../../api/campamento/servicio.api";
import {
    listartipomodulo as listartipomoduloPerfil,
    listartipohabitacion as listartipohabitacionPerfil
} from "../../../../api/campamento/perfilDetalle.api";
import CampamentoPerfilBuscar from "../../../../partials/components/CampamentoPerfilBuscar";

//Utils
import { Meses } from '../../../../../_metronic/utils/utils';
import { getEstadoCeldaDia, getClassCeldaByEstado } from '../reserva/ReservasUtil';
import '../reserva/ReservaEditPage.css';

import Pagination from "react-bootstrap-4-pagination";
import { Popup } from 'devextreme-react/popup';

import SimpleDropDownBoxGrid from '../../../../partials/components/SimpleDropDownBoxGrid/SimpleDropDownBoxGrid';

const ReporteBuscarPage = (props) => {
    const { intl, setLoading } = props;
    const classesEncabezado = useStylesEncabezado();
    const [listaParaReserva, setListaParaReserva] = useState([]);
    const perfil = useSelector(state => state.perfil.perfilActual);
    const IdPersona = props.dataRowEditNew.IdPersona;

    const [perfiles, setPerfiles] = useState([]);
    const [campamentos, setCampamentos] = useState([]);
    const [tipomodulos, setTipomodulos] = useState([]);
    const [tipoHabitaciones, setTipoHabitaciones] = useState([]);
    const [servicios, setServicios] = useState([]);
    const [reservasHeader, setReservasHeader] = useState([]);
    const ListaMeses = Meses();
    const [nuevasReservas, setNuevasReservas] = useState([]); //Lista de los dias que se reservan. {Fecha, Cama, }
    const [diasBloqueados, setDiasBloqueados] = useState([]); //Lista de dias bloqueados porque el trabajador ya cuenta con reserva.
    const [contextMenuEvent, setContextMenuEvent] = useState();
    const [isVisiblePopupDetalle, setIsVisiblePopupDetalle] = useState(false);
    const [datosReservaDetalle, setDatosReservaDetalle] = useState({ DetalleServicios: [] });
    const [servicioSeleccionados, setServiciosSeleccionados] = useState([]);

    //Filtros
    const [popupVisibleCampamentoPerfil, setPopupVisibleCampamentoPerfil] = useState(false);

    //let summaryCountFormat = '{0} de {1} registros';
    const [summaryCountText, setSummaryCountText] = useState('0 de 0');
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 20;
    const [showMax, setShowMax] = useState(5);
    const [viewPagination, setViewPagination] = useState(false);
    //:::::::::::::::::::::::::::::::::::::::::::::

    useEffect(() => {
        cargarCombos();
    }, []);

    useEffect(() => {
        buscarReservas();
    }, [currentPage]);


    /*  function calcularPaginacion(resultados) {
         if (resultados.length > 0) {
             let totalRegistros = resultados[0].TotalCount;
 
             if (totalRegistros > pageSize) {
                 let totalRegistroResultado = resultados.length;
 
                 setTotalPages(Math.round(totalRegistros / pageSize));
                 setSummaryCountText(`${totalRegistroResultado} de ${totalRegistros} registros`);
                 setViewPagination(true);
 
                 //setCurrentPage(page);
                 let originalShowMax = 5;
                 let newShowMax = totalPages - currentPage >= Math.floor(originalShowMax / 2) ? originalShowMax : totalPages - currentPage + 1;
                 newShowMax = newShowMax > 3 ? newShowMax : 3;
                 if (currentPage === totalPages) newShowMax = 2;
                 if (showMax !== newShowMax) setShowMax(newShowMax);
 
             } else {
                 setViewPagination(false);
             }
         } else {
             setViewPagination(false);
         }
     } */

    async function cargarCombos() {
        setLoading(true);
        let IdCliente = perfil.IdCliente;
        let IdDivision = perfil.IdDivision;

        let [tmp_perfiles,
            tmp_campamentos,
            tmp_tipoHabitaciones,
            tmp_tipomodulos,
            tmp_Servicios] = await Promise.all([
                listarPerfilPersona({ IdCliente, IdDivision, IdPersona, IdPerfil: '', IdSecuencial: '' }),
                listarCampamentos({ IdCliente, IdDivision, IdPerfil: '' }),
                listarTipoHabitacion({ IdCliente, IdDivision, numPagina: 0, tamPagina: 0 }),
                listarModulo({ IdCliente, IdDivision, numPagina: 0, tamPagina: 0 }),
                listarServicios({ IdCliente, IdDivision, numPagina: 0, tamPagina: 0 })])
                .finally(() => { setLoading(false); });

        if (tmp_perfiles.length > 0) {
            tmp_perfiles.unshift({ IdPerfil: '', Perfil: '-- Todos --' });
        }
        if (tmp_tipoHabitaciones.length > 0) {
            tmp_tipoHabitaciones.unshift({ IdTipoHabitacion: '', TipoHabitacion: '-- Todos --' });
        }
        if (tmp_tipomodulos.length > 0) {
            tmp_tipomodulos.unshift({ IdTipoModulo: '', TipoModulo: '-- Todos --' });
        }

        setPerfiles(tmp_perfiles);
        setCampamentos(tmp_campamentos);
        setTipomodulos(tmp_tipomodulos);
        setTipoHabitaciones(tmp_tipoHabitaciones);
        //setServicios(tmp_Servicios.map(x => ({ IdServicio: x.IdServicio, Servicio: x.Servicio, Check: false })));
        setServicios(tmp_Servicios.map(x => ({ IdServicio: x.IdServicio, Servicio: x.Servicio, Check: true })));

        if (!props.dataRowEditNew.esNuevoRegistro) {
            let idReserva = props.dataRowEditNew.IdReserva;
            let datosReserva = await props.buscarDisponibilidadReservas(servicioSeleccionados, ((currentPage - 1) * pageSize), pageSize);

            if (datosReserva.IdError == 0) {

                let bloqueados = datosReserva.reservas.filter(x => x.IdReserva != idReserva);
                let antiguasReservas = datosReserva.reservas.filter(x => x.IdReserva == idReserva).map(x => (
                    {
                        Fecha: x.Fecha,
                        IdCama: x.IdCama,
                        IdModulo: x.IdModulo,
                        IdHabitacion: x.IdHabitacion,
                        /*Cama: x.Cama,
                        Habitacion: x.Habitacion*/
                    }
                ));

                setDiasBloqueados(bloqueados);
                setNuevasReservas(antiguasReservas);
                setListaParaReserva(datosReserva.resultados)
                setReservasHeader(datosReserva.headerColumns);

                //calcularPaginacion(datosReserva.resultados);

            }
        }

    }


    const selectCampamentoPerfil = dataPopup => {
        const { IdCliente, IdDivision, IdPerfil, Perfil } = dataPopup[0];
        //console.log("selectCampamentoPerfil", IdPerfil, Perfil);
        //props.dataRowEditNew.IdPerfil = IdPerfil;
        //props.dataRowEditNew.Perfil = Perfil;

        props.setDataRowEditNew({ ...props.dataRowEditNew, IdPerfil, Perfil });
        //console.log("selectCampamentoPerfil", IdPerfil, Perfil);
        setPopupVisibleCampamentoPerfil(false);
    }





    const onValueChangedPerfil = async (valor) => {
        let tmp_campamentos = await listarCampamentos({
            IdCliente: perfil.IdCliente,
            IdDivision: perfil.IdDivision,
            IdPerfil: valor
        });
        setCampamentos(tmp_campamentos);
    }

    const onValueChangedCampamento = async (valor) => {
        setLoading(true);
        let IdCliente = perfil.IdCliente;
        let IdDivision = perfil.IdDivision;
        let IdPerfil = props.dataRowEditNew.IdPerfil;
        let IdCampamento = valor;

        //console.log("onValueChangedCampamento", IdPerfil, IdCampamento);

        let [
            tmp_tipomodulos,
            tmp_tipoHabitaciones
        ] = await Promise.all([
            listartipomoduloPerfil({ IdCliente, IdDivision, IdPerfil, IdCampamento }),
            listartipohabitacionPerfil({ IdCliente, IdDivision, IdPerfil, IdCampamento })])
            .finally(() => { setLoading(false); });

        if (tmp_tipoHabitaciones.length > 0) {
            tmp_tipoHabitaciones.unshift({ IdTipoHabitacion: '', TipoHabitacion: '-- Todos --' });
        }
        if (tmp_tipomodulos.length > 0) {
            tmp_tipomodulos.unshift({ IdTipoModulo: '', TipoModulo: '-- Todos --' });
        }

        setTipomodulos(tmp_tipomodulos);
        setTipoHabitaciones(tmp_tipoHabitaciones);
    }



    const seleccionarServicio = (e, idServicio) => {

        setServicios(
            servicios.map((x, i) => (
                x.IdServicio == idServicio ? { ...x, Check: e.value } : x
            ))
        );

    }

    const onBuscarFiltros = (e) => {
        //////////console.log(e);
    }

    const currentDate = new Date(2017, 4, 23);
    const views = ['month'];



    const buscarReservas = async (e) => {
        let datosReserva = await props.buscarDisponibilidadReservas(servicioSeleccionados, ((currentPage - 1) * pageSize), pageSize);//Pagina 1 de [0 a 20]

        if (datosReserva.IdError == 0) {
            //Evaluar si las de estado P se deben incluir como bloqueados:
            setDiasBloqueados(datosReserva.reservas);
            setListaParaReserva(datosReserva.resultados)
            setReservasHeader(datosReserva.headerColumns);
            //calcularPaginacion(datosReserva.resultados);
            /*
            if (datosReserva.resultados.length > 0) {
                let totalRegistros = datosReserva.resultados[0].TotalCount;
                let totalRegistroResultado = datosReserva.resultados.length;

                setTotalPages(Math.round(totalRegistros / pageSize));
                setSummaryCountText(`${totalRegistroResultado} de ${totalRegistros} registros`);
                setViewPagination(true);
            } else {
                setViewPagination(false);
            }*/

        }

    }

    const seleccionarCuadro = (e) => {

        if (e.column.dataField.length > 0) {
            let columnValid = e.column.dataField.substring(0, 2);

            if (columnValid === 'K_') {
                let tmp_reservas = nuevasReservas;
                let estadoCeldActual = e.cellElement.childNodes[0].innerText;
                let fechaSeleccionada = e.column.dataField.split('_')[1];
                let flCambio = false;

                if (estadoCeldActual == 'LF' || estadoCeldActual == 'LD' || estadoCeldActual == 'LN') {

                    let existeBloqueo = diasBloqueados.filter(x => x.Fecha == fechaSeleccionada);
                    flCambio = existeBloqueo.length == 0;//Si no existe fecha bloqueada se permite el cambio

                    if (flCambio) {
                        pinterElementoSeleccionado(e.cellElement);
                        //Se valida si ya existe un seleccionado en el mismo dia y se remueve:
                        let reservaAnterior = tmp_reservas.filter(x => x.Fecha == fechaSeleccionada);
                        if (reservaAnterior.length > 0) {
                            tmp_reservas = tmp_reservas.filter(x => x.Fecha != fechaSeleccionada);
                        }
                    } else {
                        handleInfoMessages("Ya se cuenta con una reserva asignada en el día seleccionado.");
                    }

                } else if (estadoCeldActual == 'SE') {
                    //Se retorna al estado anterior:
                    flCambio = false;
                    //Se remueve reserva:
                    tmp_reservas = tmp_reservas.filter(x => x.Fecha != fechaSeleccionada);
                    setNuevasReservas(tmp_reservas);
                }

                if (flCambio) {
                    pinterElementoSeleccionado(e.cellElement);
                    let nuevaRserva = {
                        Fecha: fechaSeleccionada,
                        IdCama: e.data.IdCama,
                        IdModulo: e.data.IdModulo,
                        IdHabitacion: e.data.IdHabitacion,
                        Cama: e.data.Cama,
                        Habitacion: e.data.Habitacion
                    };
                    setNuevasReservas([...tmp_reservas, nuevaRserva]);
                }
            }
        }
    }

    const onCellPrepared = (e) => {

        if (e.rowType === 'data') {
            let columnValid = e.column.dataField.substring(0, 2);

            if (columnValid === 'K_') {
                e.cellElement.classList.add("celda_Padre");
            }

        }


    }


    const cellRenderHabitacion = (param) => {
        if (param && param.data) {
            if (param.column.dataField == 'Habitacion') {
                ////////console.log("se repinta", param);
                return (param.data.Servicios != '') ?
                    <Fragment>
                        <div className="label" id={`${param.data.IdHabitacion}_${param.data.IdCama}`} >
                            {param.text}
                        </div>
                        <Tooltip
                            target={`#${param.data.IdHabitacion}_${param.data.IdCama}`}
                            showEvent="dxhoverstart"
                            hideEvent="dxhoverend"
                            position="right"
                        >
                            <div>{param.data.Servicios.split('|').map(x => (<Fragment><span>{x.split('@')[1]}</span><br /></Fragment>))}</div>
                        </Tooltip>
                    </Fragment >
                    : param.text;
            }
        }

    }


    const cellRenderReserva = (param) => {


        if (param && param.data) {

            let columnValid = param.column.dataField.substring(0, 2);

            if (columnValid === 'K_') {

                if (param.text != '') {
                    let fecha = param.column.dataField.split('_')[1];
                    let IdCama = param.data.IdCama;
                    let [idReserva, turno, estado, idPersona, EstadoCama] = param.text.split('_');
                    let currentIdPersona = props.dataRowEditNew.IdPersona;
                    let leyenda = getEstadoCeldaDia(currentIdPersona, idReserva, turno, estado, idPersona, EstadoCama);
                    let css_clase = getClassCeldaByEstado(leyenda);

                    //Se busca si ya esta seleccionado:
                    ////////console.log(nuevasReservas, fecha, IdCama);
                    let fechaSeleccionada = nuevasReservas.filter(x => x.Fecha == fecha && x.IdCama == IdCama);

                    if (fechaSeleccionada.length > 0) {
                        leyenda = "SE";
                        css_clase = getClassCeldaByEstado('SE');
                    }

                    return <Fragment>
                        <span id={`${IdCama}_${fecha}`} className={css_clase}>{leyenda}</span>
                        <input type="hidden" value={param.text} />
                    </Fragment>

                }

            }
        }
    }

    const eliminarReservas = (fecha) => {
        setNuevasReservas(nuevasReservas.filter(x => x.Fecha != fecha));
    }

    const onCellHoverChanged = (e) => {
        var event = e.event;

        if (event.buttons === 1) {

            if (isSelectionStopped) {
                isSelectionStopped = false;
                selectedRange = {};
            }
            if (selectedRange.startRowIndex === undefined) {
                selectedRange.startRowIndex = e.rowIndex;
            }
            if (selectedRange.startColumnIndex === undefined) {
                selectedRange.startColumnIndex = e.columnIndex;
            }

            selectedRange.endRowIndex = e.rowIndex;
            selectedRange.endColumnIndex = e.columnIndex;

            showSelection(e, selectedRange);

        }
        else {
            isSelectionStopped = true;
        }

    }

    let selectedRange = {};
    let isSelectionStopped = true;

    const onCellClick = (e) => {
        selectedRange.startRowIndex = e.rowIndex;
        selectedRange.endRowIndex = e.rowIndex;
        selectedRange.startColumnIndex = e.columnIndex;
        selectedRange.endColumnIndex = e.columnIndex;
        isSelectionStopped = false;
        showSelection(e, selectedRange);
    }


    function showSelection(e, selectedRange) {

        let elems = document.querySelectorAll(".cell-selected");

        [].forEach.call(elems, function (el) {
            el.classList.remove("cell-selected");
        });

        foreachRange(selectedRange, function (rowIndex, columnIndex) {
            e.component.getCellElement(rowIndex, columnIndex).classList.add("cell-selected");
        });
    }

    function foreachRange(selectedRange, func) {
        if (selectedRange.startRowIndex >= 0) {
            var minColumnIndex = Math.min(selectedRange.startColumnIndex, selectedRange.endColumnIndex);
            var maxColumnIndex = Math.max(selectedRange.startColumnIndex, selectedRange.endColumnIndex);

            let rowIndex = selectedRange.startRowIndex;
            for (var columnIndex = minColumnIndex; columnIndex <= maxColumnIndex; columnIndex++) {
                func(rowIndex, columnIndex);
            }
        }
    }

    const onContextMenuPreparing = (e) => {

        //if (e.dataField)

        let columnValid = e.column.dataField.substring(0, 2);

        if (columnValid === 'K_') {
            let esMismaFila = e.rowIndex == selectedRange.startRowIndex;
            let estaEnRangoDeColumnas = e.columnIndex <= selectedRange.endColumnIndex || e.columnIndex >= selectedRange.startColumnIndex;
            let columna = e.column.dataField;
            let data = e.row.data;
            let itemSeleccionar = { text: 'Seleccionar', icon: "isnotblank", onItemClick: (e) => { eventoSeleccionarClick(e, data) } };
            let itemVerDetalle = { text: 'Ver detalle reserva', onItemClick: (e) => { eventoDetalleClick(e, data, columna) } };

            if (esMismaFila && estaEnRangoDeColumnas) {
                e.items = [itemSeleccionar, itemVerDetalle];
                //setContextMenuEvent(e);
            } else {
                e.items = [itemVerDetalle];
            }
        }

    }

    function eventoSeleccionarClick(e, data) {
        let elems = document.querySelectorAll(".cell-selected");
        let tmp_reservas = nuevasReservas;
        let dias_alerta = [];

        for (let i = 0; i < elems.length; i++) {

            let estadoCeldActual = elems[i].children[0].innerHTML;
            let fechaSeleccionada = elems[i].children[0].id.split('_')[1];
            let flCambio = false;

            if (estadoCeldActual == 'LF' || estadoCeldActual == 'LD' || estadoCeldActual == 'LN') {

                let existeBloqueo = diasBloqueados.filter(x => x.Fecha == fechaSeleccionada);
                flCambio = existeBloqueo.length == 0;//Si no existe fecha bloqueada se permite el cambio

                if (flCambio) {
                    //Se valida si ya existe un seleccionado en el mismo dia y se remueve:
                    let reservaAnterior = tmp_reservas.filter(x => x.Fecha == fechaSeleccionada);
                    pinterElementoSeleccionado(elems[i]);
                    if (reservaAnterior.length > 0) {
                        tmp_reservas = tmp_reservas.filter(x => x.Fecha != fechaSeleccionada);
                    }
                } else {
                    dias_alerta.push(fechaSeleccionada);
                }

            }

            if (flCambio) {
                pinterElementoSeleccionado(elems[i]);
                let nuevaRserva = {
                    Fecha: fechaSeleccionada,
                    IdCama: data.IdCama,
                    IdModulo: data.IdModulo,
                    IdHabitacion: data.IdHabitacion,
                    Cama: data.Cama,
                    Habitacion: data.Habitacion
                };
                tmp_reservas.push(nuevaRserva);
            }

        }


        setNuevasReservas(tmp_reservas);

        if (dias_alerta.length > 0) {
            let strDias = dias_alerta.map(x => (x.substring(6))).join(', ')
            handleInfoMessages("Ya se cuenta con una reserva asignada en los dias: " + strDias);
        }
    }

    async function eventoDetalleClick(e, data, columna) {
        //console.log("eventoDetalleClick", data, columna);


        let [idReserva, turno, estado, idPersona, EstadoCama] = data[columna].split('_');

        if (idReserva != 0 && EstadoCama != 'L') {
            setLoading(true);
            let param = {
                IdCampamento: data.IdCampamento,
                IdReserva: idReserva,
                Fecha: columna.split('_')[1],
            };
            let objReserva = await props.retornarReserva(param);
            //console.log("se carga info: ", objReserva);

            if (objReserva.length != 0) {
                let strTurno = objReserva.Turno == 'F' ? 'Full' : objReserva.Turno == 'D' ? 'Dia' : 'Noche';
                let css_color_estado = '';
                let strEstado = '';
                switch (objReserva.Estado) {
                    case 'P': css_color_estado = 'item_cuadro item_cuadro_r'; strEstado = 'Reservado'; break;
                    case 'A': css_color_estado = 'item_cuadro item_cuadro_i'; strEstado = 'Ocupado'; break;
                    case 'I': css_color_estado = 'item_cuadro item_cuadro_o'; strEstado = 'Finalizado'; break;
                }

                objReserva.cssEstado = css_color_estado;
                objReserva.Turno = strTurno;
                objReserva.Estado = strEstado;

                let lstServicios = objReserva.Servicios != null ? objReserva.Servicios.split('|').map(x => (x.split('@')[1])) : [];
                //console.log("servicios ", lstServicios);
                objReserva.DetalleServicios = lstServicios;
                setDatosReservaDetalle(objReserva);

                setIsVisiblePopupDetalle(true);

            }
            setLoading(false);
            //DetalleServicios

        } else {
            handleInfoMessages("Día sin reserva.");
        }
    }

    function pinterElementoSeleccionado(elemento) {
        elemento.children[0].innerHTML = "SE";
        elemento.children[0].classList.add('celda_SE');
        elemento.classList.remove('cell-selected');
    }

    const onContextMenuItemClick = (e) => {
        e.itemData.onItemClick(contextMenuEvent, e);
    }



    const onChangePage = async (page) => {
        //console.log("onChangePage-->", page);
        setCurrentPage(page);

        //btnBuscarRef.onClick();
        /*calculateAdjustmentForShowMaxButtonsForPagination(page);
        await loadData({ optionsPart: { currentPage: page, pageSize } });*/
    }





    return (
        <Fragment>
            <HeaderInformation data={props.getInfo()} visible={true} labelLocation={'left'} colCount={6}
                toolbar={
                    <PortletHeader
                        title={""}
                        toolbar={
                            <PortletHeaderToolbar>
                                <Button
                                    icon="fa fa-search"
                                    type="default"
                                    hint={intl.formatMessage({ id: "ACTION.SEARCH" })}
                                    onClick={(e) => {
                                        //console.log(servicioSeleccionados);
                                        let result = e.validationGroup.validate();
                                        if (!result.isValid) {
                                            return;
                                        }
                                        buscarReservas(e);
                                    }}
                                    useSubmitBehavior={true}
                                    validationGroup="FormEdicion"
                                    visible={props.modoEdicion}

                                />
                                &nbsp;
                                {/* <Button
                                    icon="fa fa-save"
                                    type="default"
                                    hint={intl.formatMessage({ id: "ACTION.RECORD" })}
                                    onClick={grabar}
                                    useSubmitBehavior={true}
                                    validationGroup="FormEdicion"
                                    visible={props.modoEdicion}

                                />
                                &nbsp; */}
                                <Button
                                    icon="fa fa-times-circle"
                                    type="normal"
                                    hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
                                    onClick={props.cancelarEdicion}
                                />
                            </PortletHeaderToolbar>
                        }
                    />
                } />

            <PortletBody >
                <React.Fragment>
                    <Form formData={props.dataRowEditNew} validationGroup="FormEdicion" >
                        <GroupItem itemType="group" colCount={2} colSpan={2}>
                            <Item colSpan={2}>
                                <AppBar position="static" className={classesEncabezado.secundario}>
                                    <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                                        <Typography variant="h6" color="inherit" className={classesEncabezado.title}>

                                            {props.dataRowEditNew.esNuevoRegistro ?
                                                intl.formatMessage({ id: "CAMP.RESERVATION.TAB" })
                                                :
                                                `${intl.formatMessage({ id: "CAMP.RESERVATION.TAB" })} N° ${props.dataRowEditNew.IdReserva}`
                                            }
                                        </Typography>
                                    </Toolbar>
                                </AppBar>
                            </Item>

                            <SimpleItem dataField="IdCliente" visible={false}></SimpleItem>
                            <SimpleItem dataField="IdDivision" visible={false}></SimpleItem>
                            <SimpleItem dataField="IdCampamento" visible={false}></SimpleItem>

                            {/* <Item
                                dataField="IdPerfil"
                                label={{ text: intl.formatMessage({ id: "CAMP.RESERVATION.PROFILE" }) }}
                                editorType="dxSelectBox"
                                isRequired={false}
                                editorOptions={{
                                    //readOnly: !props.modoEdicion,
                                    items: perfiles,
                                    valueExpr: "IdPerfil",
                                    displayExpr: "Perfil",
                                    disabled: !props.dataRowEditNew.esNuevoRegistro,
                                    onValueChanged: (e) => onValueChangedPerfil(e.value),

                                }}
                            /> */}

                            <Item
                                dataField="Tipo"
                                label={{ text: intl.formatMessage({ id: "COMMON.TYPE" }) }}
                                editorType="dxSelectBox"
                                isRequired={false}
                                editorOptions={{
                                    //readOnly: !props.modoEdicion,
                                    items: [{ valor: 0, descripcion: "Todas las camas" },
                                        // { valor: 1, descripcion: "SI" },
                                        //{ valor: 2, descripcion: "Camas disponibles" },
                                    ],
                                    valueExpr: "valor",
                                    displayExpr: "descripcion",
                                    //disabled: !props.dataRowEditNew.esNuevoRegistro,
                                }}
                            />
                            <Item />

                            <Item
                                colSpan={4}
                                dataField="Perfil"
                                label={{ text: intl.formatMessage({ id: "ACCESS.PROFILE" }) }}
                                editorOptions={{
                                    readOnly: true,
                                    hoverStateEnabled: false,
                                    inputAttr: { 'style': 'text-transform: uppercase' },
                                    showClearButton: true,
                                    buttons: [{
                                        name: 'search',
                                        location: 'after',
                                        useSubmitBehavior: true,
                                        options: {
                                            stylingMode: 'text',
                                            icon: 'search',
                                            disabled: false,
                                            onClick: () => {
                                                setPopupVisibleCampamentoPerfil(true);
                                            },
                                        }
                                    }]
                                }}
                            />


                            <Item
                                dataField="IdCampamento"
                                label={{ text: intl.formatMessage({ id: "CAMP.RESERVATION.CAMP" }) }}
                                editorType="dxSelectBox"
                                isRequired={true}
                                editorOptions={{
                                    //readOnly: !props.modoEdicion,
                                    items: campamentos,
                                    valueExpr: "IdCampamento",
                                    displayExpr: "Campamento",
                                    //disabled: !props.dataRowEditNew.esNuevoRegistro,
                                    placeholder: "Seleccione..",
                                    onValueChanged: (e) => onValueChangedCampamento(e.value),
                                }}
                            />

                            <Item
                                dataField="FechaInicio"
                                label={{
                                    text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.STARTDATE" }),
                                }}
                                isRequired={true}
                                editorType="dxDateBox"
                                dataType="datetime"
                                editorOptions={{
                                    inputAttr: { style: "text-transform: uppercase" },
                                    displayFormat: "dd/MM/yyyy",
                                    onKeyUp: (evt) => {
                                        if (evt.event.keyCode === 13) {
                                            onBuscarFiltros(evt);
                                        }
                                    },
                                    onClosed: (evt) => {
                                        onBuscarFiltros(evt);
                                    },
                                }}
                            />

                            <Item
                                dataField="FechaFin"
                                label={{
                                    text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.ENDDATE" }),
                                }}
                                isRequired={true}
                                editorType="dxDateBox"
                                dataType="datetime"
                                editorOptions={{
                                    inputAttr: { style: "text-transform: uppercase" },
                                    displayFormat: "dd/MM/yyyy",
                                    onKeyUp: (evt) => {
                                        if (evt.event.keyCode === 13) {
                                            onBuscarFiltros(evt);
                                        }
                                    },
                                    onClosed: (evt) => {
                                        onBuscarFiltros(evt);
                                    },
                                }}
                            />

                            <Item
                                dataField="IdTipoModulo"
                                label={{ text: intl.formatMessage({ id: "CAMP.RESERVATION.MODULETYPE" }) }}
                                editorType="dxSelectBox"
                                isRequired={false}
                                editorOptions={{
                                    //readOnly: !props.modoEdicion,
                                    items: tipomodulos,
                                    valueExpr: "IdTipoModulo",
                                    displayExpr: "TipoModulo",
                                    //disabled: !props.dataRowEditNew.esNuevoRegistro,
                                }}
                            />

                            <Item
                                dataField="IdTipoHabitacion"
                                label={{ text: intl.formatMessage({ id: "CAMP.RESERVATION.ROOMTYPE" }) }}
                                editorType="dxSelectBox"
                                isRequired={false}
                                editorOptions={{
                                    //readOnly: !props.modoEdicion,
                                    items: tipoHabitaciones,
                                    valueExpr: "IdTipoHabitacion",
                                    displayExpr: "TipoHabitacion",
                                    //disabled: !props.dataRowEditNew.esNuevoRegistro,
                                }}
                            />


                            {/*  <Item
                                dataField="conCamas"
                                label={{ text: intl.formatMessage({ id: "CAMP.RESERVATION.TOSHOW" }) }}
                                editorType="dxSelectBox"
                                isRequired={false}
                                editorOptions={{
                                    readOnly: !props.modoEdicion,
                                    items: [{ valor: 0, descripcion: "Todas las camas" },
                                    // { valor: 1, descripcion: "SI" },
                                    { valor: 2, descripcion: "Camas disponibles" },
                                    ],
                                    valueExpr: "valor",
                                    displayExpr: "descripcion",
                                    disabled: !props.dataRowEditNew.esNuevoRegistro,
                                }}
                            />

 */}
                            <Item
                                dataField="Servicios"
                            >

                                <SimpleDropDownBoxGrid
                                    ColumnDisplay={"Servicio"}
                                    placeholder={"Select a value.."}
                                    SelectionMode="multiple"
                                    dataSource={servicios}
                                    Columnas={[{ dataField: "Servicio", caption: intl.formatMessage({ id: "CAMP.RESERVATION.SERVICES" }), width: '100%' }]}
                                    setSeleccionados={setServiciosSeleccionados}
                                    Seleccionados={servicioSeleccionados}
                                    pageSize={10}
                                    pageEnabled={true}
                                />

                            </Item>


                        </GroupItem>

                        <EmptyItem />


                        <GroupItem name="grupo_pasajeros" colCount={4}>

                            <Item colSpan={4}>
                                <AppBar position="static" className={classesEncabezado.secundario}>
                                    <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                                        <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                                            {intl.formatMessage({ id: "CAMP.RESERVATION.RESERVATIONDETAILS" })}
                                        </Typography>
                                    </Toolbar>
                                </AppBar>
                            </Item>

                        </GroupItem>

                    </Form>

                    <CampamentoPerfilBuscar
                        selectData={selectCampamentoPerfil}
                        showPopup={{ isVisiblePopUp: popupVisibleCampamentoPerfil, setisVisiblePopUp: setPopupVisibleCampamentoPerfil }}
                        cancelarEdicion={() => setPopupVisibleCampamentoPerfil(false)}
                        uniqueId={"campamentoPerfilListPage"}
                    />


                    <div className="row row_max_width">
                        <div className="col-12">
                            <DataGrid
                                dataSource={listaParaReserva}
                                //dataSource={dataSource}
                                //ref={gridRef}
                                showBorders={true}
                                focusedRowEnabled={true}
                                keyExpr="IdCama"
                                onCellDblClick={seleccionarCuadro}
                                onCellClick={onCellClick}
                                onCellHoverChanged={onCellHoverChanged}
                                onCellPrepared={onCellPrepared}
                                onContextMenuPreparing={onContextMenuPreparing}
                                id="datagrid_sin_sombra"
                            >
                                <Column caption={intl.formatMessage({ id: "CAMP.RESERVATION.BEDINFORMATION" })} alignment="center">
                                    <Column dataField="TipoModulo" caption={intl.formatMessage({ id: "CAMP.RESERVATION.MODULETYPE" })} width={"90"} />
                                    <Column dataField="Modulo" caption={intl.formatMessage({ id: "CAMP.RESERVATION.MODULE" })} width={"70"} />
                                    <Column dataField="TipoHabitacion" caption={intl.formatMessage({ id: "CAMP.RESERVATION.ROOMTYPE.ABR" })} width={"90"} />
                                    <Column dataField="Habitacion" caption={intl.formatMessage({ id: "CAMP.RESERVATION.ROOM" })} width={"90"} cellRender={cellRenderHabitacion} />
                                    <Column dataField="Cama" caption={intl.formatMessage({ id: "CAMP.RESERVATION.BED" })} width={"90"} />
                                </Column>


                                {/*       {reservasHeader.map((x, i) => (
                                    <Column caption={intl.formatMessage({ id: ListaMeses[x.mes - 1].Descripcion })} key={x.key} alignment={"center"} >

                                        {x.detalle.map((x2, y) => (
                                            <Column dataField={x2.key} caption={x2.dia} key={x2.key}
                                                cellRender={cellRenderReserva} alignment={"center"} width={30} />
                                        ))}
                                    </Column>
                                ))} */}

                            </DataGrid>
                            {/* *********************************************************** */}
                            {viewPagination ? (
                                <div className="vcg-wrapper-pagination">
                                    <span className="dx-datagrid-summary-item dx-datagrid-text-content summaryPagination classColorPaginador_" >{summaryCountText}</span>
                                    <Pagination
                                        threeDots
                                        prevNext
                                        shadow={false}//paginationShadow
                                        size={'md'}//paginationSize
                                        totalPages={totalPages}
                                        showMax={10}
                                        color="#337ab7"
                                        activeBgColor="#337ab7"
                                        activeBorderColor="#164873"
                                        currentPage={currentPage}
                                        onClick={onChangePage}
                                    />
                                </div>) : null}
                            {/* *********************************************************** */}




                        </div>

                    </div>


                </React.Fragment>
            </PortletBody>


            <Popup
                visible={isVisiblePopupDetalle}
                onHiding={(e) => { setIsVisiblePopupDetalle(false) }}
                dragEnabled={false}
                closeOnOutsideClick={true}
                showTitle={false}
                width={450}
            >
                <Form formData={datosReservaDetalle}
                    readOnly={true}
                    labelLocation={"top"}
                    colCount={2}
                >
                    <SimpleItem cssClass="reserva_detalle_titulo" colSpan="2">
                        <span>Detalle de reserva N° {datosReservaDetalle.IdReserva}</span>
                    </SimpleItem>

                    <SimpleItem dataField="Campamento" editorOptions={{ readOnly: true }}  ></SimpleItem>
                    <SimpleItem dataField="Estado" editorOptions={{ readOnly: true }} cssClass={datosReservaDetalle.cssEstado}  ></SimpleItem>
                    <SimpleItem dataField="FechaInicio" editorOptions={{ readOnly: true, displayFormat: "dd/MM/yyyy", }}  ></SimpleItem>
                    <SimpleItem dataField="FechaFin" editorOptions={{ readOnly: true, displayFormat: "dd/MM/yyyy", }}  ></SimpleItem>
                    <SimpleItem dataField="TipoModulo" editorOptions={{ readOnly: true }}  ></SimpleItem>
                    <SimpleItem dataField="Modulo" editorOptions={{ readOnly: true }} ></SimpleItem>
                    <SimpleItem dataField="TipoHabitacion" editorOptions={{ readOnly: true }} ></SimpleItem>
                    <SimpleItem dataField="Habitacion" editorOptions={{ readOnly: true }}  ></SimpleItem>
                    <SimpleItem dataField="Cama" editorOptions={{ readOnly: true }} ></SimpleItem>
                    <SimpleItem dataField="Turno" editorOptions={{ readOnly: true }}  ></SimpleItem>
                    <SimpleItem>Servicios</SimpleItem>
                    <EmptyItem></EmptyItem>

                    {datosReservaDetalle.DetalleServicios.length > 0 ?
                        (
                            <GroupItem itemType="group" colCount={4} colSpan={2}>
                                {
                                    datosReservaDetalle.DetalleServicios.map(x => (
                                        <SimpleItem cssClass="css_servicio_item badge badge badge-info">{x}</SimpleItem>
                                    ))
                                }
                            </GroupItem>
                        )
                        :
                        (<SimpleItem colSpan={2}>[Sin servicios adicionales]</SimpleItem>)}

                    <ButtonItem
                        colSpan={2}
                        horizontalAlignment="right"
                        buttonOptions={{
                            text: "Cerrar",
                            type: "default",
                            // icon: "search",
                            useSubmitBehavior: false,
                            onClick: (e) => { setIsVisiblePopupDetalle(false) },
                        }}
                    />
                </Form>
            </Popup>
        </Fragment >


    );
};

export default injectIntl(WithLoandingPanel(ReporteBuscarPage));
