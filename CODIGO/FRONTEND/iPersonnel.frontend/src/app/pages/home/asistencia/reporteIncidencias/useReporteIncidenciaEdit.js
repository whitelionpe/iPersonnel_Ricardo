import React, { Fragment, useEffect, useState, useRef } from "react";
import { isNotEmpty, dateFormat, PaginationSetting, convertyyyyMMddToDate } from "../../../../../_metronic";
import { useSelector } from "react-redux";

import {
    crearArregloColumnasHeader,
    obtenerColumnasHeaderReporte,
    obtenerColumnasDataFieldReporte,
    //cellRenderIncidencia,
    onCellPreparedDay,
    ItemCellIncidencia
} from "./IncidenciasUtil";

import { Tooltip as ToolTipoReact } from "devextreme-react/tooltip";
import { consultaIncidencia, consultaIncidenciaDia, consultaPersonaDetalleDias } from '../../../../api/asistencia/incidencia.api';
import { handleErrorMessages, handleSuccessMessages, handleWarningMessages } from "../../../../store/ducks/notify-messages";
import { listar as listarJustificacion } from "../../../../api/asistencia/justificacion.api";
import { uploadFile } from "../../../../api/helpers/fileBase64.api";
import { crear, obtenerResumen } from "../../../../api/asistencia/personaJustificacion.api";
import { obtener as obtenerConfig } from "../../../../api/sistema/configuracion.api"
import { crearjustificacionmasivoxpersona } from "../../../../api/asistencia/personaJustificacion.api";


import './ReporteIncidencia.css';
import { set } from "lodash";
import AsistenciaPersonaJustificacionResumenDiaPopOver from "../../../../partials/components/AsistenciaPersonaJustificacionResumenDiaPopOver";
import ReporteIncidenciaJustificacionMasivaEditPage from "./ReporteIncidenciaJustificacionMasivaEditPage";
import { ValidarPersona as validarPersonasSeleccionadas, crearMasivo as RegistrarJustificacionMasiva } from "../../../../api/asistencia/personaJustificacion.api";
import { obtener as obtenerJusti } from "../../../../api/asistencia/justificacion.api";

const useReporteIncidenciaEdit = ({
    intl,
    setDataRowEditNew,
    dataRowEditNew,
    initDataRowEdit,
    cmbIncidencia,
    setLoading,
    dataMenu,
    popupVisiblePersonas,
    setPopupVisiblePersonas,
    CargarPlanilla,
    setCabeceraReporte,
    cmbLeyenda,
    cmbTipoBusqueda,

    filterDataRow,
    setFilterDataRow
}) => {
    const initIncidenciaData = {
        Incidencia: { IdPersona: 0, Fecha: '', NombreCompleto: '', Posicion: '' },
        DetalleIncidencia: []
    };
    const INIT_COLUMN = 4;
    const usuario = useSelector(state => state.auth.user);
    const perfil = useSelector(state => state.perfil.perfilActual);
    //const [isVisibleCentroCosto, setisVisibleCentroCosto] = useState(false);
    const [listaParaReserva, setListaParaReserva] = useState([]);
    const [viewPagination, setViewPagination] = useState(false);
    const [columnasFecha, setColumnasFechas] = useState([]);
    const [daysColumns, setDaysColumns] = useState([]);
    const [Incidencia, setIncidencia] = useState(initIncidenciaData);
    const [listaJustificacion, setListaJustificacion] = useState(initIncidenciaData);
    const [isVisibleDetalle, setisVisibleDetalle] = useState(false);
    const [isVisibleJustificacion, setIsVisibleJustificacion] = useState(false);
    const hidRangeSelected = useRef(null);
    const hidControlSelected = useRef(null);
    const [incidentList, setIncidentList] = useState([]);
    const [justificationList, setJustificationList] = useState([]);
    const [maxSizeFile, setMaxSizeFile] = useState(null);
    //const [isControlPressed, setIsControlPressed] = useState(false);
    const clearSelectedRange = { row: -1, endRow: -1, startColumn: -1, endColumn: -1 }
    const [isActiveFilters, setIsActiveFilters] = useState(true);
    const [isActiveLeyend, setIsActiveLeyend] = useState(false);



    //Temporales:
    let tempSelectedRange = { ...clearSelectedRange };
    let tempPersonas = [];
    let isSelectionStopped = true;

    const [varIdCompania, setVarIdCompania] = useState("");
    const [varIdPersona, setVarIdPersona] = useState("");
    const [varFecha, setVarFecha] = useState(new Date());


    const [incidenciasSeleccionados, setIncidenciasSeleccionados] = useState([]);
    const [incidencias, setIncidencias] = useState([]);

    const [showPopupResumen, setShowPopupResumen] = useState(false);
    const [dataResumen, setDataResumen] = useState(null);
    const [showPopupJustificacionMasiva, setShowPopupJustificacionMasiva] = useState(false);
    const [selectedRow, setSelectedRow] = useState([]);
    const [personasValidadas, setPersonasValidadas] = useState([]);

    const [dataRow, setDataRow] = useState([]);

    //======================================== 
    useEffect(() => {
        if (isNotEmpty(dataRowEditNew.IdCompania)) {
            setVarIdCompania(dataRowEditNew.IdCompania);
        }
    }, [dataRowEditNew])


    useEffect(() => {
        setIsVisibleJustificacion(false);
        buscarReservas(0, PaginationSetting.TOTAL_RECORDS);
        setLoading(false);
    }, [])

    const onCellPreparedPosition = e => {
        if (e.rowType === "data") {
            let datos = e.text.split(",");
            let { IdPersona } = e.data;
            return (
                <>
                    <span id={`DA_${IdPersona}_position`}>{datos[0]}</span>

                    <ToolTipoReact
                        target={`#DA_${IdPersona}_position`}
                        showEvent="dxhoverstart"
                        hideEvent="dxhoverend"
                        position="right"
                    >
                        {datos.map((x, i) => (
                            <Fragment key={`K_${IdPersona}_${i}`}>
                                <span>{x}</span>
                                <br />
                            </Fragment>
                        ))}
                    </ToolTipoReact>
                </>
            );
        }
    };

    const columnasEstaticas = [
        {
            dataField: "Columnas",
            caption: intl.formatMessage({ id: "ASSISTANCE.INFO.PERSON" }),
            items: [
                {
                    dataField: "IdPersona",
                    caption: intl.formatMessage({ id: "COMMON.CODE" }),
                    width: "90"
                },
                {
                    dataField: "NombreCompleto",
                    caption: intl.formatMessage({ id: "ADMINISTRATION.PERSON" }),
                    width: "150"
                },
                {
                    dataField: "Documento",
                    caption: intl.formatMessage({ id: "ADMINISTRATION.PERSON.DOCUMENT" }),
                    width: "90"
                },
                {
                    dataField: "Posicion",
                    caption: intl.formatMessage({ id: "ADMINISTRATION.POSITION" }),
                    width: "90",
                    events: {
                        cellRender: onCellPreparedPosition
                    }
                }
            ]
        }
    ];

    const selectPersonas = data => {

        if (isNotEmpty(data)) {
            let strPersonas = data.split("|").join(",");

            setDataRowEditNew(prev => ({ ...prev, Personas: strPersonas }));
        }
    };


    async function agregarPersonaAsistencia(personas) {
        //setLoading(true); 
        dataRowEditNew.ListaPersona = personas.map(x => ({ IdPersona: x.IdPersona, NombreCompleto: x.NombreCompleto }));
        let cadenaMostrar = personas.map(x => (x.NombreCompleto)).join(', ');

        if (cadenaMostrar.length > 100) {
            cadenaMostrar = cadenaMostrar.substring(0, 100) + '...';
        }
        dataRowEditNew.ListaPersonaView = cadenaMostrar;
        dataRowEditNew.Personas = personas.map(x => (x.IdPersona)).join(',');
        console.log("2:::dataRowEditNew::> ", dataRowEditNew);
        setPopupVisiblePersonas(false);
    }

    const selectUnidadOrganizativa = async selectedRow => {
        let strUnidadesOrganizativas = selectedRow
            .map(x => x.IdUnidadOrganizativa)
            .join("|");
        let UnidadesOrganizativasDescripcion = selectedRow
            .map(x => x.Menu)
            .join(",");
        // props.dataRowEditNew.UnidadesOrganizativas = strUnidadesOrganizativas;
        setDataRowEditNew({
            ...dataRowEditNew,
            IdUnidadOrganizativa: strUnidadesOrganizativas,
            UnidadesOrganizativasDescripcion: UnidadesOrganizativasDescripcion
        });

    };

    const obtenerResumenDia = async (fecha, idPersona) => {
        if (!isNotEmpty(fecha)) return;
        setLoading(true);
        let array = [];
        setDataResumen([]);
        await obtenerResumen({
            IdDivision: perfil.IdDivision,
            IdCompania: varIdCompania,
            IdPersona: idPersona,
            Fecha: fecha// dateFormat(fecha, 'yyyyMMdd')
        }).then(response => {
            console.log("obtenerResumenDia() ::> response ::> ", response);
            array.push(response[0]); // Horario
            array.push(response[1]); // Marcaciones
            array.push(response[2]); // Incidencias
            array.push(response[3]); // Justificaciones 
            array.push(response[4]); // EstaProcesado 
            array.push(response[5]); // Eventos 
            array.push(response[6]); // HorarioFlexible 
            array.push(response[7]); // Observación 
            array.push(response[8]); // Otras Justificaciones Sin Incidentes 
            array.push(response[9]); // Evento Marcacion
            array.push(response[10]); // Planilla Primera/Ultima Marca

            setDataResumen(array);
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => {
            setLoading(false);
        });

    };

    const onItemClickVerResumen = async (e) => {
        let { Fechas, Personas } = e.itemData.data;
        let FechaMayor = new Date();

        if (Fechas.length > 0) {
            FechaMayor = Fechas.reduce(
                function (prev, current) {
                    return convertyyyyMMddToDate(prev.fecha) >
                        convertyyyyMMddToDate(current.fecha) ?
                        prev : current
                    // return prev.fecha > current.fecha? prev.fecha:current.fecha
                }
            );
        }

        window.localStorage.setItem('dateSelectedDay',
            convertyyyyMMddToDate(FechaMayor.fecha));

        await obtenerResumenDia(FechaMayor.fecha, FechaMayor.IdPersona);
        setShowPopupResumen(true);
    }

    const onItemClickAddJustification = async (e) => {
        let { Fechas, Personas } = e.itemData.data;
        setLoading(true);

        console.log("**onItemClickAddJustification***dataRowEditNew:> ", dataRowEditNew);

        setDataRow({
            ...dataRowEditNew,
            IdPersona: Fechas[0].IdPersona,
            FechaAsistencia: Fechas[0].fecha,
            esNuevoRegistro: true,
            CompensarHorasExtras: 'N',
            CompensarHEPorPagar: 'N',
            FechaInicio: convertyyyyMMddToDate(Fechas[0].fecha),
            FechaFin: convertyyyyMMddToDate(Fechas[0].fecha),
            IdJustificacion: "",
            Justificacion: "",
            AplicaPorDia: dataRowEditNew.JustificacionDiaCompleto
        })


        let promesas = [
            // listarJustificacion({
            //     IdCliente: perfil.IdCliente,
            //     IdCompania: dataRowEditNew.IdCompania,
            //     IdJustificacion: '%',
            // }),
            // consultaPersonaDetalleDias({
            //     datosPersonas: JSON.stringify(Personas)
            // }),
            obtenerConfig({ IdCliente: perfil.IdCliente, IdConfiguracion: 'SIZEMAXFILEUPLOAD' })
        ];

        let [sizeMaxFileUpload] = await Promise.all(promesas)
            .then(resp => (resp))
            .catch(err => ([[], []]));
        // justificaciones, incidencias,
        // setJustificationList(justificaciones);

        if (!!sizeMaxFileUpload) {
            let valorMB = sizeMaxFileUpload.Valor1 || 5;
            let valorBytes = valorMB * 1024 * 1024;
            setMaxSizeFile(valorBytes);
        }

        // if (!!incidencias && incidencias.length > 0) {
        //     setIncidentList(incidencias);
        // }
        setIsVisibleJustificacion(true);
        //setLoading(false);
    }

    const ContextMenuItems = [
        {
            id: 1,
            text: "Añadir justificación",
            icon: "add",
            onItemClick: onItemClickAddJustification
        }, {
            id: 2,
            text: "Ver Resumen Día",
            icon: "info",
            onItemClick: onItemClickVerResumen

        }
    ]

    const onCellPrepared = (e) => {
        console.log("***onCellPrepared ::> ", e);
        //console.log("onCellPrepared", { e });
    }
    const onCellDblClick = async (e) => {
        console.log("onCellDblClick", { e });

        let dataField = e.column.dataField;

        if (!isNotEmpty(e.column.dataField)) {
            return;
        }

        if (dataField !== "" && dataField.startsWith("K")) {
            console.log(" e.row.cells[e.columnIndex].value : ", e.row.cells[e.columnIndex].value);
            let dataValue = e.row.cells[e.columnIndex].value || '|0';
            if (dataValue.split("|")[1] === "0") {
                return false;
            }
            /******************************** */
            setLoading(true);

            //setIncidencia(initIncidenciaData);
            let Fecha = dataField.split("_")[1];
            let { IdCliente, IdPersona, NombreCompleto, Posicion } = e.data;

            let info = await consultaIncidenciaDia({ IdCliente, IdPersona, Fecha })
                .then(resp => (resp))
                .catch(err => ([]));

            setIncidencia({
                Incidencia: {
                    IdPersona,
                    Fecha,
                    NombreCompleto,
                    Posicion
                },
                DetalleIncidencia: info
            });

            setisVisibleDetalle(true);
            setLoading(false);
        }
    }

    const onCellClick = (e) => {
        //console.log("onCellClick", { e, hid: hidRangeSelected.current.value });

        if (e.rowType === 'header') {
            return;
        }

        let isControlPressed = hidControlSelected.current.value === "1";

        if (isControlPressed) {
            //console.log("Con control");
        }

        let { rowIndex: row, columnIndex: col, data: { IdPersona } } = e;
        showSelection(e, row, col, col, row);

        //Si la tecla control esta presionado se guarda dentro del arreglo, sino se crea uno nuevo.
        if (isControlPressed) {
            updateSelectedValues(row, col, IdPersona);

        } else {
            hidRangeSelected.current.value = JSON.stringify([[row, col, IdPersona]]);
        }

        //En caso se de click mientras se esta seleccionando el HoverChanged no se debe limpiar
        if (isSelectionStopped) {
            tempSelectedRange = { ...clearSelectedRange };
            tempPersonas = [];
        }

    }

    const onCellHoverChanged = (e) => {
        let { event: { buttons }, rowIndex: row, columnIndex: col, rowType } = e;

        if (col >= INIT_COLUMN && rowType !== 'header') {
            if (buttons === 1) {
                let currentInitCol = tempSelectedRange.startColumn === -1 ? col : tempSelectedRange.startColumn;
                let currentInitRow = tempSelectedRange.row === -1 ? row : tempSelectedRange.row;

                if (isSelectionStopped) {
                    isSelectionStopped = false;
                    tempSelectedRange = { row, endRow: row, startColumn: col, endColumn: col };
                }
                //console.log("onCellHoverChanged", { e, buttons, currentInitRow, currentInitCol, col, row });
                showSelection(e, currentInitRow, currentInitCol, col, row);
                //Si no se agrego el id persona: 
                let IdPersona = e.data.IdPersona;
                let objPersona = tempPersonas.find(x => x[1] === IdPersona);
                //console.log({ IdPersona, objPersona });
                if (!objPersona) {
                    tempPersonas.push([row, IdPersona]);
                }

            } else {
                //console.log("onCellHover Final", { e, buttons, isSelectionStopped, tempSelectedRange, col, row });
                if (!isSelectionStopped) {
                    isSelectionStopped = true;
                    //console.log("XX=>", { tempSelectedRange, tempPersonas, row });

                    let countInicial = tempSelectedRange.row || 0;
                    let countFinal = row || 0;

                    for (let r = countInicial; r <= countFinal; r++) {
                        let arrayPersona = tempPersonas.find(x => x[0] === r);
                        //console.log("Persona encontrada ::", { arrayPersona });
                        if (!!arrayPersona) {
                            let [, IdPersona] = arrayPersona;
                            //console.log({ arrayPersona, IdPersona, r });
                            for (let c = tempSelectedRange.startColumn; c <= col; c++) {
                                updateSelectedValues(r, c, IdPersona);
                            }
                        }

                    }
                    tempSelectedRange = { ...clearSelectedRange };
                    tempPersonas = [];
                }
            }
        }
    }

    const updateSelectedValues = (row, col, IdPersona) => {
        let oldSelected = [];
        let hidValue = hidRangeSelected.current.value;

        if (hidValue !== "") {
            oldSelected = JSON.parse(hidValue);
        }

        let existsElement = oldSelected.find(x => x[0] === row && x[1] === col);


        if (!existsElement) {
            oldSelected.push([row, col, IdPersona]);
            hidRangeSelected.current.value = JSON.stringify(oldSelected);
        }
        //console.log("data ===>", { hidValue, oldSelected, row, col, existsElement });
    }

    const showSelection = (e, row, startColumn, endColumn, endRow) => {
        //console.log("->", { e, row, startColumn, endColumn });
        //let { row, startColumn, endColumn } = selectedRange;
        //Se borra los anteriores: 
        let elems = document.querySelectorAll(".cell-selected");
        let isControlPressed = hidControlSelected.current.value === "1";
        //Solo si no esta presionado el control se  borra los seleccionados.
        if (!!elems && elems.length > 0 && !isControlPressed) {
            elems.forEach(x => {
                x.classList.remove("cell-selected");
            });
        }
        //console.log("Se borro clases");
        //Se agrega los nuevos:
        let colIni = Math.min(startColumn, endColumn);
        let colMax = Math.max(startColumn, endColumn);
        let rowIni = Math.min(row, endRow);
        let rowMax = Math.max(row, endRow);

        for (let r = rowIni; r <= rowMax; r++) {
            for (let i = colIni; i <= colMax; i++) {
                let elemento = e.component.getCellElement(r, i);
                if (!!elemento) {
                    elemento.classList.add("cell-selected");
                }
            }
        }

    }

    const onContextMenuPreparing = (e) => {
        // console.log(" onContextMenuPreparing ===>", { e });

        //Se restringe para que no salga en las cabeceras
        if (e.row === undefined || e.row.rowType === 'header') {
            return;
        }

        //Se restringe para que el click sea dentro de una celda.
        if (e.column === undefined || e.column.dataField === undefined) {
            return false;
        }

        //Solo seldas de fecha (Inician con "K_" desde la base de datos)
        let columnValid = e.column.dataField.substring(0, 2);
        let varContextMenuItems = [];
        if (columnValid === "K_") {
            let strValueRange = hidRangeSelected.current.value;
            let aFechas = [];
            let aPersonas = [];
            if (strValueRange !== "") {
                let arrayData = JSON.parse(strValueRange);
                //Por celda seleccionado
                for (let i = 0; i < arrayData.length; i++) {
                    let [row, col, IdPersona] = arrayData[i];
                    let columnName = e.row.cells[col].column.dataField;
                    let datosPersona = listaParaReserva.find(x => x.IdPersona === IdPersona);
                    let value = datosPersona[columnName] || '|0';
                    let [, fecha] = columnName.split('_');
                    let [IdIncidencia, TotalIncidencias, JustificadoCompleto, EsJustificable, JustificacionDiaCompleto] = value.split('|');
                    console.log("**value.split('|')**:>", value.split('|'));

                    let { //IdPersona,
                        NombreCompleto,
                        Documento,
                        Posicion } = datosPersona;

                    let registro = {
                        IdPersona,
                        NombreCompleto,
                        Documento,
                        Posicion,
                        fecha,
                        IdIncidencia,
                        TotalIncidencias
                    };
                    aFechas.push(registro);
                    //console.log({ registro, IdPersona, columnName, value, row, col });

                    let itemPersona = aPersonas.find(x => x.IdPersona === IdPersona);
                    if (!itemPersona) {
                        aPersonas.push({ IdPersona, Fechas: fecha, IdIncidencia: '' });
                    } else {
                        aPersonas = aPersonas.map(x => {
                            if (x.IdPersona === IdPersona) {
                                return {
                                    ...x, Fechas: `${x.Fechas},${fecha}`
                                }
                            } else {
                                return x;
                            }
                        });
                    }

                    if (JustificadoCompleto !== 'S' && EsJustificable == 'S') { //&& TotalIncidencias !== '0' 
                        //Si no tiene Justificacion y Tiene Incidencias Justificables = Muestra todo 
                        varContextMenuItems = ContextMenuItems;
                    } else {
                        //Si no , solo muestra el resumen
                        varContextMenuItems = ContextMenuItems.filter(x => x.id == 2);
                    }

                    dataRowEditNew.JustificacionDiaCompleto = JustificacionDiaCompleto == 'S' ? 'S' : 'N';
                }
            }

            if (aFechas.length === 0) {
                return false;
            }

            //Restringimos opciones de acuerdo al evento  
            //Se agrega el valor seleccionado al menu desplegable: 
            let myContextMenuItems = (varContextMenuItems.length > 0 ? varContextMenuItems : ContextMenuItems)
                .map(x => ({
                    ...x,
                    data: { Fechas: aFechas, Personas: aPersonas }
                }))

            e.items = myContextMenuItems;

            //Debe cargar solo el justificar solo para incidencias justificables
            //debe cargar el ver resumen  para todaas fechas y personas
            //cuando se seleccione varias fechas y personas , ya no se debe ver el resumen porqe es unitario
        }
    }

    const onKeyDown = (e) => {
        //console.log("onKeyDown", { key: e.event.key, keyCode: e.event.keyCode });
        if (e.event.key === "Control") {
            //console.log("onKeyDown", { key: e.event.key, keyCode: e.event.keyCode });
            //console.log({ e });
            //setIsControlPressed(true);
            hidControlSelected.current.value = "1";
        } else {
            //setIsControlPressed(false);
            hidControlSelected.current.value = "";
        }

        /*
        key: "Control"
keyCode: 17
        */
    }

    const eventKeyUp = (e) => {
        //console.log("onkeyUp", { key: e.event.key, keyCode: e.event.keyCode });
        //console.log("onkeyUp", { e, key: e.key, keycode: e.keyCode, ctrl: e.ctrlKey });
        if (e.key === "Control") {
            hidControlSelected.current.value = "";
            //setIsControlPressed(false);
        }
    }

    const onSelectionChanged = (e) => {
        setSelectedRow(e.selectedRowsData);
    }

    const dataGridEvents = {
        onCellPrepared: onCellPreparedDay,
        //onCellDblClick,
        onCellClick,
        onCellHoverChanged,
        onContextMenuPreparing,
        onKeyDown,
        //onKeyUp
        onSelectionChanged,
    }

    //selectedRange
    const cellRenderIncidencia = (param, listaIncidencia) => {
        if (param && param.data) {
            if (param.text !== "") {
                let fecha = param.column.dataField.split("_")[1];
                let IdPersona = param.data.IdPersona;
                let [IdIncidencia, TotalIncidencias, JustificadoCompleto] = param.text.split("|");
                let Incidencia = "";
                let Color = "";

                if (IdIncidencia !== "") {
                    let objIncidencia = listaIncidencia.find(
                        x => x.IdIncidencia === IdIncidencia
                    );

                    if (!!objIncidencia) {
                        Incidencia = objIncidencia.Incidencia;
                        Color = objIncidencia.Color;
                    }
                }

                return (
                    <ItemCellIncidencia
                        JustificadoCompleto={JustificadoCompleto}
                        IdIncidencia={IdIncidencia}
                        Incidencia={Incidencia}
                        TotalIncidencias={TotalIncidencias}
                        Color={Color}
                        IdPersona={IdPersona}
                        Fecha={fecha}
                        intl={intl}
                    />
                );
            }
        }

    };

    const buscarReservas = async (skip, take, sendParameters, parameters) => {
        // setLoading(true);
        try {

            let datosReserva = await consultarIncidencias(skip, take, sendParameters, parameters); //Pagina 1 de [0 a 20]  

            if (datosReserva.IdError === 0) {

                setListaParaReserva(datosReserva.resultados);
                let nameDays = intl.formatMessage({ id: "ASISTENCIA.REPORT.INCIDENCIAS.DAYS" }).split(',');
                //Creando columnas dinamicas:
                let header_json = crearArregloColumnasHeader(
                    datosReserva.headerColumns || [],
                    intl,
                    {
                        cellRender: e => cellRenderIncidencia(e, cmbLeyenda),//ListaLeyenda
                        onCellPrepared: onCellPrepared,

                        //onCellDblClick: onCellDblClick,
                        //onCellClick: onCellClick,
                        //onCellHoverChanged: onCellHoverChanged,
                        //onContextMenuPreparing: onContextMenuPreparing
                    },
                    nameDays
                );

                let columnasHeaderReporte = obtenerColumnasHeaderReporte(
                    datosReserva.headerColumns || [],
                    nameDays,
                    intl
                );
                setCabeceraReporte(columnasHeaderReporte);

                if (header_json.length > 0) {
                    setColumnasFechas(header_json);
                }

                setTimeout(() => {
                    setViewPagination(true);
                }, 500);
            } else {
                setViewPagination(false);
                setColumnasFechas([]);
                setDaysColumns([]);
            }

        } catch (error) {
            console.log(":>catch error:> ", error);
            setViewPagination(false);
            setColumnasFechas([]);
            setDaysColumns([]);
            setLoading(false);
        }
        finally {
            setLoading(false);


        }

    };

    const consultarIncidencias = async (skip, take, sendParameters, parameters) => {
        let varIncidencias = '';
        if (incidenciasSeleccionados.length > 0) {
            varIncidencias = incidenciasSeleccionados.map(function (item) {
                return item['IdIncidencia'];
            }).join();
            dataRowEditNew.Incidencias = varIncidencias;
        } else {
            dataRowEditNew.Incidencias = "";
        }
        //LSF : AGREGAR El IdPerfil 

        let data = sendParameters ? parameters : dataRowEditNew;
        let {
            IdCompania,
            IdUnidadOrganizativa,
            IdPlanilla,
            IdZona,
            Personas,
            FechaInicio: FechaIniConsulta, //: dateFormat(FechaInicio, "yyyyMMdd"), //(new Date(FechaInicio)).toLocaleString()
            FechaFin: FechaFinConsulta, //: dateFormat(FechaFin,"yyyyMMdd"), //(new Date(FechaFin)).toLocaleString()
            IdIncidencia,
            IdTipoBusqueda
        } = data;

        let params = {
            idCliente: perfil.IdCliente,
            idCompania: isNotEmpty(IdCompania) ? IdCompania : "",
            idUnidadOrganizativa: isNotEmpty(IdUnidadOrganizativa) ? IdUnidadOrganizativa : "",
            idPlanilla: isNotEmpty(IdPlanilla) ? IdPlanilla : "",
            personas: isNotEmpty(Personas) ? Personas : "",
            fechaInicio: dateFormat(FechaIniConsulta, "yyyyMMdd"),
            fechaFin: dateFormat(FechaFinConsulta, "yyyyMMdd"),
            incidencias: isNotEmpty(varIncidencias) ? varIncidencias : "",
            idPerfil: perfil.IdPerfil,
            skip,
            take,
            orderField: "NombreCompleto",
            orderDesc: 0
        };


        setLoading(true);
        let datosReserva = await consultaIncidencia(params)
            .catch(err => {
                handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err);
                return { IdErro: 1, reservas: [] };
            })
            .finally(() => {
                setLoading(false);
            });

        if (typeof datosReserva === "object" && datosReserva !== null) {
            datosReserva.IdError = 0;
            return datosReserva;
        } else {
            return { IdErro: 1, reservas: [] };
        }

        return datosReserva;
    };

    async function agregarPersonaJustificacion(datarow) {
        setLoading(true);
        document.getElementById("btnUploadFile").click();
        let pathFile = '';
        const { IdPersona, IdCompania, IdJustificacion, Observacion, NombreArchivo, FechaArchivo, FileBase64,
            FechaInicio, FechaFin, FechaAsistencia, FechaHoraInicio, FechaHoraFin, DiaCompleto, Activo, CompensarHorasExtras,
            CompensarHEPorPagar, Turno } = datarow;

        let objJustificacion = listaJustificacion.find(x => x.IdJustificacion === IdJustificacion);

        let params = {
            IdCliente: perfil.IdCliente
            , IdPersona
            , IdCompania: isNotEmpty(IdCompania) ? IdCompania : ""
            , IdJustificacion: isNotEmpty(IdJustificacion) ? IdJustificacion : ""
            , IdSecuencialJustificacion: 0
            , Observacion: isNotEmpty(Observacion) ? Observacion.toUpperCase() : ""
            , NombreArchivo: isNotEmpty(NombreArchivo) ? NombreArchivo : ""
            , IdItemSharepoint: ""
            , FechaArchivo: isNotEmpty(FechaArchivo) ? FechaArchivo : ""
            , FileBase64: isNotEmpty(FileBase64) ? FileBase64 : ""
            , PathFile: isNotEmpty(pathFile) ? pathFile : ""
            , ClaseArchivo: isNotEmpty(objJustificacion.Justificacion) ? objJustificacion.Justificacion : ""
            , FechaInicio: dateFormat(FechaInicio, 'yyyyMMdd')
            , FechaFin: dateFormat(FechaFin, 'yyyyMMdd')
            , Turno
            //Detalle -- PersonaJustificacionDia
            , DiaCompleto: DiaCompleto
            , FechaAsistencia: dateFormat(FechaAsistencia, 'yyyyMMdd')
            , FechaHoraInicio: dateFormat(FechaHoraInicio, "yyyyMMdd hh:mm") //DiaCompleto === 'N' ? dateFormat(FechaHoraInicio, "yyyyMMdd hh:mm") : dateFormat(FechaAsistencia, 'yyyyMMdd') + ' 00:00'
            , FechaHoraFin: dateFormat(FechaHoraFin, "yyyyMMdd hh:mm")//DiaCompleto === 'N' ? dateFormat(FechaHoraFin, "yyyyMMdd hh:mm") : dateFormat(FechaAsistencia, 'yyyyMMdd') + ' 00:00'
            , CompensarHorasExtras: CompensarHorasExtras || 0
            , CompensarHEPorPagar: CompensarHEPorPagar || 0
            , IdUsuario: usuario.username
            , Activo: 'S'

            , IdModulo: dataMenu.info.IdModulo
            , IdAplicacion: dataMenu.info.IdAplicacion
            , IdMenu: dataMenu.info.IdMenu
        };
        setIsVisibleJustificacion(false);

        console.log("**params :> ",params);
        console.log("isNotEmpty(FileBase64) :> ",isNotEmpty(FileBase64));
        if (isNotEmpty(FileBase64)) {
            /*if (!isNotEmpty(pathFile)) {
                handleInfoMessages(intl.formatMessage({ id: "MESSAGES.NOT.PATH.UPLOAD" }));
                return;
            }*/
            await uploadFile(params).then(response => { 
                console.log("LSF****** agregarPersonaJustificacion() - response :> ",response);
                const { nombreArchivo } = response; //,idItemSharepoint
                params.NombreArchivo = nombreArchivo;
                // params.IdItemSharepoint = isNotEmpty(idItemSharepoint)?idItemSharepoint:'';
                crear(params)
                    .then((response) => {
                        if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
                        buscarReservas(0, PaginationSetting.TOTAL_RECORDS);
                    })
                    .catch((err) => {
                        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
                    }).finally(() => { setLoading(false); });
            }).catch((err) => {
                handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
            }).finally(() => { setLoading(false); });
        } else {
            await crear(params)
                .then((response) => {
                    if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
                })
                .catch((err) => {
                    handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
                }).finally(() => { setLoading(false); });
        }
    }

    const saveJustificationsByPeople = async (params) => {
        setLoading(true);
        await crearjustificacionmasivoxpersona(params)
            .then(resp => {
                console.log(resp);
                let { isOk, message } = resp;

                if (isOk === 1) {
                    handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }),
                        intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
                } else {
                    handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), message, true)
                }
            })
            .catch(err => {
                //console.log(err);
                handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
            })
            .finally(fin => {
                setIsVisibleJustificacion(false);
                buscarReservas(0, PaginationSetting.TOTAL_RECORDS);
                setLoading(false);
            })
            ;
    }

    const onFieldDataChanged = async (data) => {
        setIsVisibleJustificacion(false);
        await buscarReservas(0, PaginationSetting.TOTAL_RECORDS);
        setLoading(false);
    }
    const buscar = async () => {
        setFilterDataRow({
            ...dataRowEditNew,
        });
        await buscarReservas(0, PaginationSetting.TOTAL_RECORDS);
        setLoading(false);
    }


    const refreshDataSource = async () => {
        //setLoading(true);
        setDataRowEditNew({ ...initDataRowEdit }); //--->LSF 
        //console.log("refreshDataSource", { initDataRowEdit });
        setIsVisibleJustificacion(false); //---->LSF 24052023 Comentado
        await buscarReservas(0, PaginationSetting.TOTAL_RECORDS, true, initDataRowEdit);
        setLoading(false);
    }

    const reloadSavedJustification = async () => {
        setIsVisibleJustificacion(false);
        await buscarReservas(0, PaginationSetting.TOTAL_RECORDS, true, filterDataRow);
        setLoading(false);
    }

    ///////////////////////////////////////////////////////////////////////////
    //POP UP DE RESUMEN
    ///////////////////////////////////////////////////////////////////////////
    const contentRenderPopUpInformation = () => {
        var dateSelectedDay = window.localStorage.getItem('dateSelectedDay');

        console.log('dateSelectedDay==> ', dateSelectedDay);
        return (
            <>
                <AsistenciaPersonaJustificacionResumenDiaPopOver
                    dataResumen={dataResumen}
                    varFecha={dateSelectedDay}
                    showTitleInside={false}
                    idModulo={dataMenu.info.IdModulo}
                    idMenu={dataMenu.info.IdMenu}
                    idAplicacion={dataMenu.info.IdAplicacion}
                />
            </>
        );
    }


    ///////////////////////////////////////////////////////////////////////////
    //POP UP DE JUSTIFICACION MASIVA
    /////////////////////////////////////////////////////////////////////////// 

    const contentRenderPopUpJustificacionMasiva = () => {
        console.log("ENTER::> contentRenderPopUpJustificacionMasiva :::::***dataRowEditNew ::> ", dataRowEditNew);
        //Enviar listado de Personas 
        //Enviar listado de Fechas

        return (
            <>
                <ReporteIncidenciaJustificacionMasivaEditPage
                    intl={intl}
                    dataRowEditNew={dataRowEditNew}
                    height={"750px"}
                    width={"1000px"}
                    // justificationList={justificationList}
                    // incidentList={incidentList}
                    setLoading={setLoading}
                    // seleccionarJustificacion={seleccionarJustificacion}
                    obtenerAsistenciaJustificacion={obtenerAsistenciaJustificacion}

                    cancelarEdicion={cancelarEdicion}
                    selectedRow={selectedRow}
                    varIdCompania={varIdCompania}
                    personasValidadas={personasValidadas}
                    setPersonasValidadas={setPersonasValidadas}
                    eliminarRegistro={eliminarPersonaSeleccion}
                    registrarPersonaJustificacionMasiva={registrarPersonaJustificacionMasiva}
                    obtenerJustificacionFechaPersona={obtenerJustificacionFechaPersona}
                // saveJustificationsByPeople={saveJustificationsByPeople}
                // maxSizeFile={maxSizeFile}  
                />
            </>
        );
    }

    const abrirJustificacionMasiva = async () => {
        //Validamos la información
        if (!validarDatos()) { return; }

        //Obtenemos PersonasValidadas 
        let personas = selectedRow.map(x => x.IdPersona).join(',');
        await obtenerJustificacionFechaPersona(personas);
        // personasValidadas = selectedRow;

        console.log("---> dataRowEditNew :> ", dataRowEditNew);
        setDataRowEditNew({
            ...dataRowEditNew,
            Justificacion: "",
            IdJustificacion: "",
            CompensarHorasExtras: "N",
            CompensarHEPorPagar: "N",
            AplicaPorDia: "N",
            AplicaPorHora: "N",
            DiaCompleto: "N",
            Observacion: "",
            FechaHoraInicio: dataRowEditNew.FechaInicio,
            FechaHoraFin: dataRowEditNew.FechaFin,
            IdJustificacion: "",
            FileBase64: "",
            NombreArchivo: "",
            FechaArchivo: "",
            EsSubsidio:"N",
            EnfermedadInicio: dataRowEditNew.FechaInicio,
            EnfermedadFin: dataRowEditNew.FechaFin,
            CertificadoInicio: dataRowEditNew.FechaInicio
        });

 
        //Abrir PopUp de Justificacion [Cuerpo JustificacionMasivaEditPage]  
        setShowPopupJustificacionMasiva(true);


    }

    //Metodos Obtención Datos
    function validarDatos() {
        let result = true;

        if (selectedRow.length === 0) {
            handleWarningMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), intl.formatMessage({ id: "ASSISTANCE.INCIDENCE.JUSTIFICATION.MASSIVE.VALIDATE_PERSON_SELECTED" }));
            result = false;
        }

        return result;
    }

    const obtenerJustificacionFechaPersona = async (personas) => {
        console.log("ENTER :> obtenerJustificacionFechaPersona()");
        setLoading(true);

        const { FechaInicio, FechaFin } = dataRowEditNew;

        console.log("PARAMTETROS : ", {
            IdCliente: perfil.IdCliente,
            IdCompania: varIdCompania,
            Personas: personas,
            FechaInicio: FechaInicio,
            FechaFin: FechaFin,
            DiaCompleto: "N",
        });

        await validarPersonasSeleccionadas({
            IdCliente: perfil.IdCliente,
            IdCompania: varIdCompania,
            Personas: personas,
            FechaInicio: FechaInicio,
            FechaFin: FechaFin,
            DiaCompleto: "N",
        }).then(data => {
            console.log("data :> ", data);
            setPersonasValidadas(data);

        }).finally(() => { setLoading(false) });

        console.log("--END--");
    }

    const obtenerAsistenciaJustificacion = async (idJustificacion) => {
        console.log("ENTER :> obtenerAsistenciaJustificacion()");
        setLoading(true);
        await obtenerJusti({
            IdCliente: perfil.IdCliente,
            IdCompania: varIdCompania,
            IdJustificacion: idJustificacion,
        }).then(data => {
            const { AplicaPorDia, AplicaPorHora, RequiereObservacion, RequiereAutorizacion } = data;
            let DiaCompleto = AplicaPorDia;

            let HoraDefecto = new Date();
            console.log("**data ::> ", data, " | HoraDefecto :> ", HoraDefecto);

            setDataRowEditNew({
                ...dataRowEditNew, ...data,
                DiaCompleto,
                FechaHoraInicio: dataRowEditNew.FechaInicio,
                FechaHoraFin: dataRowEditNew.FechaFin,

                // HoraEntradaInicio,
                // HoraEntradaFin,
                // HoraSalidaFin, Turno,
                // FechaHoraInicio, FechaHoraFin
            });

        }).finally(() => { setLoading(false) });
    }

    //Acciones y Eventos
    const cancelarEdicion = async () => {
        setShowPopupJustificacionMasiva(false);
    };

    const eliminarPersonaSeleccion = (data) => {
        setLoading(true);
        if (personasValidadas.length > 0) {
            let resultado = personasValidadas.filter(x => x.IdPersona != data.IdPersona);
            setPersonasValidadas(resultado);

        }

        setTimeout(() => {
            setLoading(false);
        }, 500);
    }

    const registrarPersonaJustificacionMasiva = async (datarow) => {
        // console.log("ENTER registrarPersonaJustificacionMasiva()");
        setLoading(true);
        const { IdCompania, IdJustificacion, Observacion, NombreArchivo, FechaArchivo, FileBase64, Justificacion,
            FechaInicio, FechaFin, FechaAsistencia, FechaHoraInicio, FechaHoraFin, DiaCompleto, Activo, CompensarHorasExtras,
            CompensarHEPorPagar, Turno,
            EsSubsidio,
            EnfermedadInicio,
            EnfermedadFin,
            CertificadoInicio } = datarow;

        let personasValidas = personasValidadas.filter(x => x.EsValida === 'S');
        let personas = personasValidas.map(x => x.IdPersona).join(',');

        let params = {
            IdCliente: perfil.IdCliente
            , IdDivision : perfil.IdDivision
            , Personas: personas
            , IdCompania: isNotEmpty(IdCompania) ? IdCompania : ""
            , IdJustificacion: isNotEmpty(IdJustificacion) ? IdJustificacion : ""
            , IdSecuencialJustificacion: 0
            , Observacion: isNotEmpty(Observacion) ? Observacion.toUpperCase() : ""
            , NombreArchivo: isNotEmpty(NombreArchivo) ? NombreArchivo : ""
            , IdItemSharepoint: ""
            , FechaArchivo: isNotEmpty(FechaArchivo) ? FechaArchivo : ""
            , FileBase64: isNotEmpty(FileBase64) ? FileBase64 : ""
            , ClaseArchivo: isNotEmpty(Justificacion) ? Justificacion : ""
            , FechaInicio: dateFormat(FechaInicio, 'yyyyMMdd')
            , FechaFin: dateFormat(FechaFin, 'yyyyMMdd')
            , Turno
            //Detalle -- PersonaJustificacionDia
            , DiaCompleto: DiaCompleto
            , FechaAsistencia: dateFormat(FechaAsistencia, 'yyyyMMdd')
            , FechaHoraInicio: dateFormat(FechaHoraInicio, "yyyyMMdd hh:mm")
            , FechaHoraFin: dateFormat(FechaHoraFin, "yyyyMMdd hh:mm")
            , Activo: Activo
            , CompensarHorasExtras: CompensarHorasExtras
            , CompensarHEPorPagar: "S" //CompensarHEPorPagar
            , IdUsuario: usuario.username
            , PathFile: ""
            , IdModulo: dataMenu.info.IdModulo
            , IdAplicacion: dataMenu.info.IdAplicacion
            , IdMenu: dataMenu.info.IdMenu
            , EnfermedadInicio: EsSubsidio === "S" ? dateFormat(EnfermedadInicio, 'yyyyMMdd') : ''
            , EnfermedadFin: EsSubsidio === "S" ? dateFormat(EnfermedadFin, 'yyyyMMdd') : ''
            , CertificadoInicio: EsSubsidio === "S" ? dateFormat(CertificadoInicio, 'yyyyMMdd') : ''
         
        };
        console.log("**params :> ",params);
        console.log("isNotEmpty(FileBase64) :> ",isNotEmpty(FileBase64));
        if (isNotEmpty(FileBase64)) { 
            await uploadFile(params).then(response => {
                console.log("LSF****** registrarPersonaJustificacionMasiva() - response :> ",response);
                const { nombreArchivo,idItemSharepoint } = response; // 
                params.NombreArchivo = nombreArchivo;
                params.IdItemSharepoint = isNotEmpty(idItemSharepoint)?idItemSharepoint:'';
                //crear(params)
                RegistrarJustificacionMasiva(params)
                    .then((response) => {
                        if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
                        //listarJustificacionDia();
                        //setModoEdicion(false);
                        onFieldDataChanged(dataRowEditNew);
                        setShowPopupJustificacionMasiva(false);
                    })
                    .catch((err) => {
                        if (err.response.status == 400)
                            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), intl.formatMessage({ id: err.response.data.responseException.exceptionMessage }), true)
                        else
                            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
                    }).finally(() => { setLoading(false); });
            }).catch((err) => {
                handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
            }).finally(() => { setLoading(false); });
        } else {
            await RegistrarJustificacionMasiva(params)
                .then((response) => {
                    if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
                    //listarJustificacionDia();
                    // setModoEdicion(false);
                    onFieldDataChanged(dataRowEditNew);
                    setShowPopupJustificacionMasiva(false);
                })
                .catch((err) => {
                    if (err.response.status == 400)
                        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), intl.formatMessage({ id: err.response.data.responseException.exceptionMessage }), true)
                    else
                        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)

                }).finally(() => { setLoading(false); });
        }

    }

    return {
        //Propiedades:
        columnasEstaticas,
        listaParaReserva,
        viewPagination,
        columnasFecha,
        isVisibleJustificacion,
        hidRangeSelected,
        hidControlSelected,
        //Metodos:
        selectPersonas,
        agregarPersonaAsistencia,
        dataGridEvents,
        eventKeyUp,
        buscarReservas,
        selectUnidadOrganizativa,
        setViewPagination,
        setIsVisibleJustificacion,
        agregarPersonaJustificacion,
        justificationList,
        incidentList,
        maxSizeFile,
        saveJustificationsByPeople,
        onFieldDataChanged,
        isActiveFilters,
        setIsActiveFilters,
        refreshDataSource,
        varIdCompania,
        setVarIdCompania,

        incidencias,
        incidenciasSeleccionados,
        setIncidenciasSeleccionados,

        //PopUp Resumen del Día
        showPopupResumen,
        setShowPopupResumen,
        contentRenderPopUpInformation,

        //Detalle
        isVisibleDetalle,
        setisVisibleDetalle,
        Incidencia,

        //PopUp Justificacion Masiva
        abrirJustificacionMasiva,
        showPopupJustificacionMasiva,
        setShowPopupJustificacionMasiva,
        contentRenderPopUpJustificacionMasiva,

        setSelectedRow,

        isActiveLeyend,
        setIsActiveLeyend,

        usuario,
        reloadSavedJustification,

        setDataRow,
        dataRow,

        buscar 

    };
};

export default useReporteIncidenciaEdit;
