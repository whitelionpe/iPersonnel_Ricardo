import React, { useState, useEffect, useRef } from "react";
import { injectIntl } from "react-intl";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import { Button } from "devextreme-react";
import Form, { Item, GroupItem } from "devextreme-react/form";
import { isNotEmpty, listarEstado, } from "../../../../../_metronic";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { obtener as obtenerCampamento } from "../../../../api/campamento/campamento.api";
import { obtenerTodos as listarCampamentos } from "../../../../api/campamento/campamento.api";
import { dateFormat, PaginationSetting } from "../../../../../_metronic/utils/utils";
import DataGridDynamic from "../../../../partials/components/DataGridDynamic/DataGridDynamic";
import { handleErrorMessages, handleInfoMessages, handleSuccessMessages } from "../../../../store/ducks/notify-messages";
import {
  getEstadoCeldaDia, getClassCeldaByEstado, esDiaDisponible,
  cellRenderHabitacion, onCellPreparedDay, crearArregloColumnasHeader
} from '../reserva/ReservasUtil';
import WithLoandingPanel from "../../../../partials/content/withLoandingPanel";
import { listarTipoModuloPorCampamento } from "../../../../api/campamento/tipoModulo.api";
import { listarTipoHabitacionPorCampamento } from "../../../../api/campamento/tipoHabitacion.api";
import CampamentoModuloBuscar from "../../../../partials/components/CampamentoModuloBuscar";
import CampamentoHabitacionBuscar from "../../../../partials/components/CampamentoHabitacionBuscar";
import { crear as crearReserva, reservas as listarReservas } from "../../../../api/campamento/reserva.api";
import AdministracionPersonaBuscar from "../../../../partials/components/AdministracionPersonaBuscar";
import '../reserva/ReservaEditPage.css';
import ReservaDetalleCamaPopup from "../reserva/ReservaDetalleCamaPopup";
import { AppBar, Toolbar, Typography } from "@material-ui/core";
import { useStylesEncabezado } from "../../../../store/config/Styles";
import Confirm from "../../../../partials/components/Confirm";

const CamaListPage = props => {
  const INIT_COLUMN = 5;
  const { intl, setLoading } = props;
  const { IdDivision, IdCliente } = useSelector(
    state => state.perfil.perfilActual
  );
  const usuario = useSelector(state => state.auth.user);
  const btnSearch = useRef(null);
  const classesEncabezado = useStylesEncabezado();
  //const [selectedRow, setSelectedRow] = useState([]);
  const dataGridRef = useRef(null);
  const hidRangeSelected = useRef(null);
  const hidTrama = useRef(null);

  //const [camasExclusiva, setCamaExclusiva] = useState([]);
  const [campamentos, setCampamentos] = useState([]);
  const [popupVisibleModulo, setPopupVisibleModulo] = useState(false);
  const [popupVisibleHabitacion, setPopupVisibleHabitacion] = useState(false);
  const [popupVisiblePersona, setPopupVisiblePersona] = useState(false);
  const [mensajeConfirm, setMensajeConfirm] = useState('');
  const [confirmTitle, setConfirmTitle] = useState('');
  const [isVisibleConfirm, setIsVisibleConfirm] = useState(false);
  const [, setInstance] = useState({});
  //const [servicioSeleccionados, setServiciosSeleccionados] = useState([]);
  //const [estadoSimple, setEstadoSimple] = useState([]);
  //const [evaluarRequerido, setEvaluarRequerido] = useState(false);
  const [diasBloqueados, setDiasBloqueados] = useState([]); //Lista de dias bloqueados porque el trabajador ya cuenta con reserva.
  const [listaParaReserva, setListaParaReserva] = useState([]);
  const [columnasDinamicas, setColumnasDinamicas] = useState([]);
  const [viewPagination, setViewPagination] = useState(false);
  //const [msgCamaExclusiva, setMsgCamaExclusiva] = useState(false);
  const [visibleCamaExclusiva, setVisibleCamaExclusiva] = useState(false);
  //const [tramaPintar, setTramaPintar] = useState("");
  const [reservas, setReservas] = useState([]); //Lista de los dias que se reservan. {Fecha, Cama, }
  const [datosReservaDetalle, setDatosReservaDetalle] = useState({ DetalleServicios: [] });

  const [tempReserva, setTempReserva] = useState([]); // variable para almacenar temporalmente los datos de las reservas
  const [dataRowEditNew, setDataRowEditNew] = useState({ IdTipoModulo: "", IdTipoHabitacion: "", FechaInicio: new Date(), conCamas: 0 });
  const [tipomodulos, setTipomodulos] = useState([]);
  const [tipoHabitaciones, setTipoHabitaciones] = useState([]);
  //let persona = { IdPersona: 0, NombreCompleto: '' };
  //Variables de CustomerDataGrid
  //const [isActiveFilters, setIsActiveFilters] = useState(false);
  //const [customDataGridIsBusy, setCustomDataGridIsBusy] = useState(false);

  //const { filterData, setFilterData } = props;
  // ------------------------------
  const [
    ifThereAreNoChangesLoadFromStorage,
    setIfThereAreNoChangesLoadFromStorages
  ] = useState(true);
  //const resetLoadOptions = props.resetLoadOptions;
  //Filtros
  //const [popupVisibleCampamentoPerfil, setPopupVisibleCampamentoPerfil] = useState(false);
  const [isVisiblePopupDetalle, setIsVisiblePopupDetalle] = useState(false);

  //let selectedRange = {};
  const clearSelectedRange = { startRowIndex: -1, endRowIndex: -1, startColumnIndex: -1, endColumnIndex: -1 }
  let isSelectionStopped = true;
  let tempSelectedRange = { ...clearSelectedRange };

  async function cargarCombos() {
    //let estadoSimples = listarEstado();
    //setEstadoSimple(estadoSimples);
    try {
      const tmp_campamentos = await listarCampamentos({ IdDivision });
      setCampamentos(tmp_campamentos);
      if (tmp_campamentos.length > 0) {
        let FechaFin = new Date(dataRowEditNew.FechaInicio);
        FechaFin.setDate(FechaFin.getDate() + tmp_campamentos[0].DiasPermanencia - 1);
        setDataRowEditNew({
          ...dataRowEditNew,
          IdCampamento: tmp_campamentos[0].IdCampamento,
          DiasPermanencia: tmp_campamentos[0].DiasPermanencia,
          FechaFin
        });
      }
    } catch (error) {
      //console.log(error);
    }
  }
  /*
    const seleccionarRegistro = evt => {
      if (evt.rowIndex === -1) return;
      if (isNotEmpty(evt.row.data)) props.seleccionarRegistro(evt.row.data);
    };
  
    const seleccionarRegistroDblClick = evt => {
      if (isNotEmpty(evt.data)) {
        props.verRegistroDblClick(evt.data);
      }
    };
  
    const obtenerCampoActivo = rowData => {
      return rowData.Activo === "S";
    };
  
    function onCellPrepared(e) {
      if (e.rowType === "data") {
        if (e.data.Activo === "N") {
          e.cellElement.style.color = "red";
        }
      }
    }
  */
  const columnasEstaticas = [
    {
      dataField: "Columnas",
      caption: intl.formatMessage({ id: "CAMP.RESERVATION.BEDINFORMATION" }),
      items: [
        {
          dataField: "TipoModulo",
          caption: intl.formatMessage({ id: "CAMP.RESERVATION.MODULETYPE" }),
          width: "90"
        },
        {
          dataField: "Modulo",
          caption: intl.formatMessage({ id: "CAMP.RESERVATION.MODULE" }),
          width: "70"
        },
        {
          dataField: "TipoHabitacion",
          caption: intl.formatMessage({ id: "CAMP.RESERVATION.ROOMTYPE.ABR" }),
          width: "90"
        },
        {
          dataField: "Habitacion",
          caption: intl.formatMessage({ id: "CAMP.RESERVATION.ROOM" }),
          width: "90",
          events: { cellRender: cellRenderHabitacion }
        },
        {
          dataField: "Cama",
          caption: intl.formatMessage({ id: "CAMP.RESERVATION.BED" }),
          width: "90"
        }
      ]
    }
  ];

  function cellRenderReservaDia(param) {
    //console.log("cellRenderReservaDia", { param });
    //console.log("cellRenderReservaDia", { param });
    if (param && param.data) {
      /*let columnValid = param.column.dataField.substring(0, 2);
            if (columnValid === 'K_') {*/

      if (param.text !== "") {
        let fecha = param.column.dataField.split("_")[1];
        let IdCama = param.data.IdCama;
        let IdHabitacion = param.data.IdHabitacion;

        //Estado => A=Aprobado | P=Pendiente | I=Inactiva
        //EstadoCama => O=Ocupado | R=Reservado | F=Finalizado | L=Libre | 0=Sin Estado
        //CamaExclusiva => S=Si Exclusiva | N=No Exclusiva | E=Excluir (Exclusiva otra persona)
        let [
          idReserva,
          turno,
          estado,
          idPersona,
          EstadoCama,
          CamaExclusiva
        ] = param.text.split("_");
        let currentIdPersona = dataRowEditNew.IdPersona;

        let leyenda = getEstadoCeldaDia(
          currentIdPersona,
          idReserva,
          turno,
          estado,
          idPersona,
          EstadoCama,
          CamaExclusiva
        );
        let css_clase = getClassCeldaByEstado(leyenda);

        //Se busca si ya esta seleccionado:
        //console.log("cellRenderReserva 2 : ", reservas, fecha, IdCama);
        //console.log("hidden", document.getElementById('hidTrama').value);

        let strHidden = hidTrama.current.value; // document.getElementById("hidTrama").value;
        let fechaSeleccionada = "";

        //console.log("=>", { strHidden });
        if (strHidden !== "") {
          let valoresPintar = strHidden.split("|").map(x => {
            let valores = x.split("@");
            return {
              Fecha: valores[0],
              IdCama: valores[1],
              IdModulo: valores[2],
              IdHabitacion: valores[3]
            };
          });

          //let fechaSeleccionada = reservas.filter(x => x.Fecha == fecha && x.IdCama == IdCama);
          fechaSeleccionada = valoresPintar.filter(
            x =>
              x.Fecha === fecha &&
              x.IdCama === IdCama &&
              x.IdHabitacion === IdHabitacion
          ); // Se modifico 05-10-2021 para pintar camas iguales en diferentes habitaciones
        }
        //console.log("=>|", { fechaSeleccionada });

        if (fechaSeleccionada.length > 0) {
          leyenda = "SE";
          css_clase = getClassCeldaByEstado("SE");
        }

        return (
          <>
            <span id={`${IdCama}_${fecha}`} className={css_clase}>
              {leyenda}
            </span>
            <input type="hidden" value={param.text} />
          </>
        );
      }

      //}
    }
  }

  /*
    const textEditing = {
      confirmDeleteMessage: "",
      editRow: intl.formatMessage({ id: "ACTION.EDIT" }),
      deleteRow: intl.formatMessage({ id: "ACTION.REMOVE" })
    };
  */
  useEffect(() => {
    cargarCombos();
    if (ifThereAreNoChangesLoadFromStorage)
      setIfThereAreNoChangesLoadFromStorages(false);
  }, [ifThereAreNoChangesLoadFromStorage]);

  useEffect(() => {
    if (props.refreshData) {
      props.refresh();
      props.setRefreshData(false);
    }
  }, [props.refreshData]);

  function pinterElementoSeleccionado(elemento) {
    elemento.children[0].innerHTML = "SE";
    elemento.children[0].classList.add("celda_SE");
    elemento.classList.remove("cell-selected");
    showSelection();
  }
  /*
    const pintarElementosReservados = (idHtml) => {
      let elemento = document.getElementById(idHtml);
      elemento.innerHTML = "R";
      elemento.classList.add("item_opt_color_reserva");
      elemento.classList.add("item_color_font");
    };
  */
  function cargarValoresReserva(arrayReserva) {
    //console.log("cargarValoresReserva", { arrayReserva });
    let trama = arrayReserva
      .map(x => `${x.Fecha}@${x.IdCama}@${x.IdModulo}@${x.IdHabitacion}`)
      .join("|");

    hidTrama.current.value = trama;
    //setTramaPintar(trama);
    setReservas(arrayReserva);
    showSelection();
  }

  const seleccionarCuadro = e => {
    if (e.column.dataField.length > 0) {
      let columnValid = e.column.dataField.substring(0, 2);
      let { FL_CAMA_EXCLUSIVA } = e.row.data;
      if (columnValid === "K_") {
        let tmp_reservas = reservas;
        let estadoCeldActual = e.cellElement.childNodes[0].innerText;
        let fechaSeleccionada = e.column.dataField.split("_")[1];
        let flCambio = false;

        if (esDiaDisponible(estadoCeldActual)) {
          ////console.log("bloqueos --> ", diasBloqueados, fechaSeleccionada);
          let existeBloqueo = diasBloqueados.filter(
            x => x.Fecha === fechaSeleccionada
          );
          flCambio = existeBloqueo.length === 0; //Si no existe fecha bloqueada se permite el cambio

          if (flCambio) {
            pinterElementoSeleccionado(e.cellElement);
            //Se valida si ya existe un seleccionado en el mismo dia y se remueve:
            let reservaAnterior = tmp_reservas.filter(
              x => x.Fecha === fechaSeleccionada
            );
            if (reservaAnterior.length > 0) {
              tmp_reservas = tmp_reservas.filter(
                x => x.Fecha !== fechaSeleccionada
              );
            }
          } else {
            handleInfoMessages(
              "Ya se cuenta con una reserva asignada en el día seleccionado."
            );
          }
        } else if (estadoCeldActual === "SE") {
          //Se retorna al estado anterior:
          flCambio = false;
          //Se remueve reserva:
          tmp_reservas = tmp_reservas.filter(x => x.Fecha !== fechaSeleccionada);
          //reservas = tmp_reservas;

          props.setDataRowEditNew(prev => ({
            ...prev,
            FlgCamaExclusiva: FL_CAMA_EXCLUSIVA
          }));
          cargarValoresReserva(tmp_reservas);
        }

        if (flCambio) {
          pinterElementoSeleccionado(e.cellElement);
          let nuevo = {
            Fecha: fechaSeleccionada,
            IdCampamento: e.data.IdCampamento,
            IdCama: e.data.IdCama,
            IdModulo: e.data.IdModulo,
            IdHabitacion: e.data.IdHabitacion,
            Cama: e.data.Cama,
            Habitacion: e.data.Habitacion
          };
          //console.log("nuevas reservas:", tmp_reservas, nuevo)
          //tmp_reservas.push(nuevo);
          //reservas = tmp_reservas;
          props.setDataRowEditNew(prev => ({
            ...prev,
            FlgCamaExclusiva: FL_CAMA_EXCLUSIVA
          }));
          cargarValoresReserva([...tmp_reservas, nuevo]);
        }
      }
    }
  };

  const buscarDisponibilidadReservas = async (skip, take) => {
    setLoading(true);
    let {
      IdCampamento,
      IdTipoModulo,
      IdModulo,
      IdTipoHabitacion,
      IdHabitacion,
      conCamas,
      FechaInicio,
      FechaFin
    } = dataRowEditNew;

    let datosReserva;

    try {
      datosReserva = await listarReservas({
        IdCliente,
        IdDivision,
        IdCampamento,
        IdTipoModulo,
        IdModulo,
        IdTipoHabitacion,
        IdHabitacion,
        IdCama: "",
        IdTipoCama: "",
        FechaInicio: dateFormat(FechaInicio, "yyyyMMdd"), // new Date(FechaInicio).toLocaleString(), //Cambiar
        FechaFin: dateFormat(FechaFin, "yyyyMMdd"), // new Date(FechaFin).toLocaleString(), //Cambiar
        IdPersona: 0,
        servicios: "",
        conCamas,
        IdReserva: 0,
        IdPerfil: "",
        skip,
        take,
        OrderField: "TipoModulo",
        OrderDesc: 0
      });
    } catch (err) {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err);
      //console.log(err);
      return { IdErro: 1, reservas: [] };
    } finally {
      setLoading(false);
    }

    if (typeof datosReserva === "object" && datosReserva !== null) {
      datosReserva.IdError = 0;
      return datosReserva;
    } else {
      return { IdErro: 1, reservas: [] };
    }

  };

  const buscarReservas = async (skip, take) => {
    let datosReserva = await buscarDisponibilidadReservas(
      skip,
      take
    ); //Pagina 1 de [0 a 20]


    //console.log("datosReserva", datosReserva);

    let { headerColumns, reservas, resultados, IdError } = datosReserva;

    //setListaParaReserva(resultados);
    //EGSC

    if (IdError === 0) {
      //Evaluar si las de estado P se deben incluir como bloqueados:
      setDiasBloqueados(reservas);

      setListaParaReserva(resultados);
      // setReservasHeader(datosReserva.headerColumns);
      //calcularPaginacion(datosReserva.resultados);

      //Creando columnas dinamicas:
      let header_json = crearArregloColumnasHeader(
        headerColumns || [],
        intl,
        { cellRender: cellRenderReservaDia }
      );

      if (header_json.length > 0) {
        setColumnasDinamicas(header_json);
      }

      //Mostrar datos cama exclusiva y paginado:
      setTimeout(() => {
        setViewPagination(true);
        let camasExclusivas = resultados.filter(
          x => x.FL_CAMA_EXCLUSIVA === "S"
        );
        if (camasExclusivas.length > 0) {
          let camas = camasExclusivas.map(x => x.Habitacion).join(",");
          /*setMsgCamaExclusiva(
            `La persona cuenta con cama exclusiva en habitación: ${camas}`
          );*/
          setVisibleCamaExclusiva(true);
        } else {
          if (visibleCamaExclusiva) setVisibleCamaExclusiva(false);
        }
      }, 500);
    } else {
      setViewPagination(false);
      setColumnasDinamicas([]);
      setVisibleCamaExclusiva(false);
    }

  };

  const buscarReservas_onClick = async (e, noValidate) => {

    //console.log(PaginationSetting.TOTAL_RECORDS)
    buscarReservas(0, PaginationSetting.TOTAL_RECORDS);


  };

  const grabar = async e => {
    if (reservas.length > 0) {
      if (reservas[0]?.IdPersona !== 0) {
        setLoading(true);
        try {
          const camp = await obtenerCampamento({
            idCliente: 0,
            idDivision: IdDivision,
            idCampamento: reservas[0].IdCampamento
          });
          const fechaInicioString = reservas[0].Fecha;
          const fechaInicioFormateada = fechaInicioString.substring(6) + '/' + fechaInicioString.substring(4, 6) + '/' + fechaInicioString.substring(0, 4);
          const horaCheckout = camp?.HoraCheckOut?.substring(11, 16);
          const fechaString = reservas[reservas.length - 1].Fecha;
          const fechaFormateada = fechaString.substring(6) + '/' + fechaString.substring(4, 6) + '/' + fechaString.substring(0, 4);
          const nombrePersona = reservas[0].NombreCompleto;
          setMensajeConfirm(
            `${intl.formatMessage({ id: "CAMP.RESERVATION.RESERVATION_FROM" })} ${fechaInicioFormateada} ${intl.formatMessage({ id: "CAMP.RESERVATION.RESERVATION_TO" })} ${fechaFormateada}. ${intl.formatMessage({ id: "CAMP.RESERVATION.CHECKOUT_DATE_ALERT" })} ${fechaFormateada} ${intl.formatMessage({ id: "CAMP.RESERVATION.CHECKOUT_TIME_ALERT" })} ${horaCheckout} ${intl.formatMessage({ id: "CAMP.RESERVATION.CHECKOUT_ARE_YOU_SURE" })}`
          );
          setConfirmTitle(`${intl.formatMessage({ id: "CAMP.RESERVATION.RESERVATION_FOR" })}: ${nombrePersona}`);
          setIsVisibleConfirm(true);
        } catch (err) {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err);
        } finally {
          setLoading(false);
        }
      }
      else handleInfoMessages("Debe seleccionar una persona para generar la reserva.");
    } else {
      handleInfoMessages("Debe realizar una reserva de cama como mínimo.");
    }
  };

  const confirmGrabar = () => {
    guardar(reservas, dataRowEditNew.FlgCamaExclusiva);
  };

  const guardar = (nuevasReservas, flagCamaExclusiva) => {
    const { IdPersona, IdCampamento, Fecha: FechaInicio } = nuevasReservas[0];
    const { Fecha: FechaFin } = nuevasReservas[nuevasReservas.length - 1];
    const FlgCamaExclusiva = isNotEmpty(flagCamaExclusiva) ? flagCamaExclusiva : 'N';

    nuevasReservas = nuevasReservas.map(x => ({
      Fecha: x.Fecha,
      IdCama: x.IdCama,
      IdHabitacion: x.IdHabitacion,
      IdModulo: x.IdModulo
    }));

    let param = {
      IdCliente,
      IdDivision,
      IdCampamento,
      IdPersona,
      FechaInicio,
      FechaFin,
      Turno: "F", //Por ahora FULL
      Estado: "P", //Pendientes
      IdUsuario: usuario.username,
      reservas: JSON.stringify(nuevasReservas),
      FlgCamaExclusiva
    };
    setLoading(true);
    //crearReserva:
    crearReserva(param).then(response => {
      // if (response)
      handleSuccessMessages(
        intl.formatMessage({ id: "MESSAGES.SUCESS" }),
        intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" })
      );

      //Se limpian las reservas y los temporales:
      setReservas([]);
      setTempReserva([]);
      hidTrama.current.value = "";
      setJsonValues(-1, -1, -1, -1);
      //Se carga de nuevo:
      buscarReservas(0, PaginationSetting.TOTAL_RECORDS);
      /*for (let i = 0; i < nuevasReservas.length; i++) {
        pintarElementosReservados(nuevasReservas[i].IdCama + '_' + nuevasReservas[i].Fecha);
      }*/
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err);
    }).finally(() => {
      setLoading(false);
    });
  };
  /*
    const css_caja_estado = {
      color: "white",
      padding: "5px 10px 5px 10px",
      textAlign: "center"
    };
  
    const css_caja_estado_negro = {
      color: "black",
      padding: "5px 10px 5px 10px",
      textAlign: "center"
    };
  */
  /*const cellEstadoCamaRender = e => {
    let estado = "";
    let css = "";
    switch (e.text) {
      case "L":
        estado = "Libre";
        break;
      case "A":
        estado = "Asignado";
        break;
      case "R":
        css = "item_reservado";
        estado = "Reservado";
        break;
      case "O":
        css = "item_ocupado";
        estado = "Ocupado";
        break;
      default:
        return;
    }

    return css === "" ? (
      <span className={css} style={css_caja_estado_negro}>
        {estado}
      </span>
    ) : (
      <span className={css} style={css_caja_estado}>
        {estado}
      </span>
    );
  };*/

  function showSelection() {
    let strValueRange = hidRangeSelected.current.value;
    if (strValueRange === "") {
      return;
    }
    let selectedRange = JSON.parse(strValueRange);


    //let elems = document.querySelectorAll(".cell-selected");
    let myInstance = dataGridRef.current.instance;

    //console.log("Seleccionados:", { selectedRange, myInstance });

    //console.log("elems", { elems });

    //Se borra todas las celdas seleccionadas anteriormente:
    clearPreviousSelection();

    //console.log("Prueba");
    //console.log({ cell: myInstance.getCellElement(0, 0) });

    foreachRange(selectedRange, function (rowIndex, columnIndex) {
      let getCell = myInstance.getCellElement(rowIndex, columnIndex);
      // console.log({ rowIndex, columnIndex, getCell });

      if (!!getCell) {
        getCell.classList.add("cell-selected");
      }
    });
  }

  function foreachRange(selectedRange, func) {
    if (selectedRange.startRowIndex >= 0) {
      var minColumnIndex = Math.min(
        selectedRange.startColumnIndex,
        selectedRange.endColumnIndex
      );
      var maxColumnIndex = Math.max(
        selectedRange.startColumnIndex,
        selectedRange.endColumnIndex
      );

      let rowIndex = selectedRange.startRowIndex;
      for (
        var columnIndex = minColumnIndex;
        columnIndex <= maxColumnIndex;
        columnIndex++
      ) {
        func(rowIndex, columnIndex);
      }
    }
  }

  const setJsonValues = (rowStart, rowEnd, colStart, colEnd) => {
    let cadenaJson = JSON.stringify({
      startRowIndex: rowStart,
      endRowIndex: rowEnd,
      startColumnIndex: colStart,
      endColumnIndex: colEnd
    });
    hidRangeSelected.current.value = cadenaJson;
  }

  const onCellClick = e => {
    if (e.rowType === 'header') {
      return;
    }
    setJsonValues(e.rowIndex, e.rowIndex, e.columnIndex, e.columnIndex);
    //isSelectionStopped = false;
    showSelection();

    if (isSelectionStopped) {
      tempSelectedRange = { ...clearSelectedRange };
    }

  };

  const onCellHoverChanged = e => {
    let { event: { buttons }, rowIndex: row, columnIndex: col, rowType } = e;

    //Solo los que estan dentro del rango
    if (col >= INIT_COLUMN && rowType !== 'header') {
      //console.log("=>", { buttons, col, row, isSelectionStopped, tempSelectedRange });
      if (buttons === 1) { //Se esta seleccionando:
        let currentInitCol = tempSelectedRange.startColumnIndex === -1 ? col : tempSelectedRange.startColumnIndex;
        let currentInitRow = tempSelectedRange.startRowIndex === -1 ? row : tempSelectedRange.startRowIndex;

        tempSelectedRange.startColumnIndex = currentInitCol;
        tempSelectedRange.startRowIndex = currentInitRow;
        setJsonValues(currentInitRow, row, currentInitCol, col);

        if (isSelectionStopped) {//Se guardan los ultimos valores
          isSelectionStopped = false;
          tempSelectedRange.endRowIndex = row;
          tempSelectedRange.endColumnIndex = col;
          setJsonValues(currentInitRow, row, currentInitCol, col);
        }
        showSelection();
      } else { //Se detuvo la seleccion:
        if (!isSelectionStopped) {
          //console.log("Se detiene la seleccion");
          isSelectionStopped = true;
          tempSelectedRange = { ...clearSelectedRange };
        }
      }

    }
  };

  const onContextMenuPreparing = e => {

    //Se restringe para que no salga en las cabeceras
    if (e.row === undefined || e.row.rowType === 'header') {
      return;
    }

    //Se restringe para que el click sea dentro de una celda.
    if (e.column === undefined || e.column.dataField === undefined) {
      return false;
    }

    let columnValid = e.column?.dataField?.substring(0, 2);

    if (columnValid === "K_") {
      let strValueRange = hidRangeSelected.current.value;

      if (strValueRange === "") {
        return;
      }
      let selectedRange = JSON.parse(strValueRange);
      let esMismaFila = e.rowIndex === selectedRange.startRowIndex;
      let estaEnRangoDeColumnas =
        e.columnIndex <= selectedRange.endColumnIndex ||
        e.columnIndex >= selectedRange.startColumnIndex;
      let columna = e.column.dataField;
      let data = e.row.data;
      let itemSeleccionar = {
        text: "Seleccionar",
        icon: "isnotblank",
        onItemClick: (eventoClick) => {
          //console.log("eventoClick", { eventoClick, dataGridRef });
          abrirModalPersonas(data);
        }
      };
      let itemVerDetalle = {
        text: "Ver detalle reserva",
        onItemClick: e => {
          eventoDetalleClick(e, data, columna);
        }
      };

      if (esMismaFila && estaEnRangoDeColumnas) {
        e.items = [itemSeleccionar, itemVerDetalle];
        //setContextMenuEvent(e);
      } else {
        e.items = [itemVerDetalle];
      }
    }
  };

  const abrirModalPersonas = (data) => {
    //console.log("abrirModalPersonas", { eventoClick, eventoPreparing, data });
    setPopupVisiblePersona(true);
    setTempReserva(data);
    showSelection();
  };

  const agregarPersona = event => {
    hidTrama.current.value = "";
    clearPreviousSelection();
    showSelection();
    eventoSeleccionarClick(event, tempReserva);

  };

  const clearPreviousSelection = () => {

    let elems = document.querySelectorAll(".cell-selected");
    //console.log("clearPreviousSelection", { elems });
    [].forEach.call(elems, function (el) {
      el.classList.remove("cell-selected");
    });
  }

  async function eventoDetalleClick(e, data, columna) {

    let [idReserva, turno, estado, idPersona, EstadoCama] = data[columna].split("_");

    if (idReserva !== 0 && EstadoCama !== "L") {
      setLoading(true);
      let param = {
        IdCampamento: data.IdCampamento,
        IdReserva: idReserva,
        Fecha: columna.split("_")[1]
      };
      let objReserva = await props.retornarReserva(param);

      if (objReserva.length !== 0) {
        let strTurno = objReserva.Turno === 'F' ? 'Full' : objReserva.Turno === 'D' ? 'Dia' : 'Noche';
        let css_color_estado = '';
        let strEstado = '';
        switch (objReserva.Estado) {
          case 'P': css_color_estado = 'item_cuadro item_cuadro_r'; strEstado = 'Reservado'; break;
          case 'A': css_color_estado = 'item_cuadro item_cuadro_i'; strEstado = 'Ocupado'; break;
          case 'I': css_color_estado = 'item_cuadro item_cuadro_o'; strEstado = 'Finalizado'; break;
          default: break;
        }

        objReserva.cssEstado = css_color_estado;
        objReserva.Turno = strTurno;
        objReserva.Estado = strEstado;

        let lstServicios = objReserva.Servicios != null ? objReserva.Servicios.split('|').map(x => (x.split('@')[1])) : [];
        ////console.log("servicios ", lstServicios);
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

  async function eventoSeleccionarClick(e, data) {
    let elems = document.querySelectorAll(".cell-selected");
    //console.log("Seleccionados:", { elems });
    let tmp_reservas = reservas;
    let dias_alerta = [];
    const { IdPersona, NombreCompleto } = e?.[0];

    if (data.FL_CAMA_EXCLUSIVA === "S") {
      dataRowEditNew.FlgCamaExclusiva = "S";
    } else {
      dataRowEditNew.FlgCamaExclusiva = "N";
    }

    for (let i = 0; i < elems.length; i++) {
      let estadoCeldActual = elems[i].children[0].innerHTML;
      let fechaSeleccionada = elems[i].children[0].id.split("_")[1];
      let flCambio = false;

      if (esDiaDisponible(estadoCeldActual)) {
        let existeBloqueo = diasBloqueados.filter(
          x => x.Fecha === fechaSeleccionada
        );
        flCambio = existeBloqueo.length === 0; //Si no existe fecha bloqueada se permite el cambio

        if (flCambio) {

          //Se limpia el registro seleccionado por otro trabajador:
          //console.log({ tmp_reservas, IdPersona });
          tmp_reservas = tmp_reservas.filter(x => x.IdPersona === IdPersona);

          //Se valida si ya existe un seleccionado en el mismo dia y se remueve:
          let reservaAnterior = tmp_reservas.filter(
            x => x.Fecha === fechaSeleccionada
          );
          pinterElementoSeleccionado(elems[i]);
          if (reservaAnterior.length > 0) {
            tmp_reservas = tmp_reservas.filter(
              x => x.Fecha !== fechaSeleccionada
            );
          }
        } else {
          dias_alerta.push(fechaSeleccionada);
        }
      }

      if (flCambio) {
        pinterElementoSeleccionado(elems[i]);

        let nuevaRserva = {
          IdPersona,
          NombreCompleto,
          Fecha: fechaSeleccionada,
          IdCampamento: data.IdCampamento,
          IdCama: data.IdCama,
          IdModulo: data.IdModulo,
          IdHabitacion: data.IdHabitacion,
          Cama: data.Cama,
          Habitacion: data.Habitacion
        };
        tmp_reservas.push(nuevaRserva);
      }
    }

    cargarValoresReserva(tmp_reservas);
    if (dias_alerta.length > 0) {
      let strDias = dias_alerta.map(x => x.substring(6)).join(", ");
      handleInfoMessages(
        "Ya se cuenta con una reserva asignada en los dias: " + strDias
      );
    }
    showSelection();
  }

  const onValueChangedCampamento = async valor => {
    setLoading(true);
    let IdCampamento = valor;

    let [tmp_tipomodulos, tmp_tipoHabitaciones] = await Promise.all([
      listarTipoModuloPorCampamento({ idDivision: IdDivision, idCampamento: IdCampamento }),
      listarTipoHabitacionPorCampamento({ idDivision: IdDivision, idCampamento: IdCampamento })
    ]).catch(error => {
      //console.log(error);
    }).finally(() => {
      setLoading(false);
    });

    if (tmp_tipoHabitaciones.length > 0) {
      tmp_tipoHabitaciones.unshift({
        IdTipoHabitacion: "",
        TipoHabitacion: "-- Todos --"
      });
    }
    if (tmp_tipomodulos.length > 0) {
      tmp_tipomodulos.unshift({ IdTipoModulo: "", TipoModulo: "-- Todos --" });
    }

    setTipomodulos(tmp_tipomodulos);
    setTipoHabitaciones(tmp_tipoHabitaciones);
    setDataRowEditNew({ ...dataRowEditNew, Modulo: "", IdModulo: "", Habitacion: "", IdHabitacion: "", IdTipoModulo: "", IdTipoHabitacion: "" });
    setReservas([]);
  };

  const selectModulo = data => setDataRowEditNew({ ...dataRowEditNew, IdModulo: data[0].IdModulo, Modulo: data[0].Modulo, IdHabitacion: "", Habitacion: "" });

  const selectHabitacion = data => setDataRowEditNew({ ...dataRowEditNew, IdHabitacion: data[0].IdHabitacion, Habitacion: data[0].Habitacion });

  const seleccionarFila = e => {
    let selectedRowData = dataGridRef.current._instance.getSelectedRowsData()[0];
    if (!selectedRowData) {
      handleInfoMessages(intl.formatMessage({ id: "CAMP.CAMP.BED.NOT_SELECTED_ALERT" }));
      return;
    }
    let validacion = 0;

    for (let prop in selectedRowData) {
      if (prop.split('_')[0] === 'K') {
        const detalleReserva = selectedRowData[prop].split('_');
        if (detalleReserva[4] !== 'L' && detalleReserva[4] !== '0') validacion++;
      }
    }

    if (validacion > 0) {
      handleInfoMessages(intl.formatMessage({ id: "CAMP.CAMP.BED.HAS_RESERVATION_ALERT" }));
      return;
    }

    setJsonValues(
      dataGridRef.current._instance.getRowIndexByKey(dataGridRef.current._instance.getSelectedRowKeys()[0]),
      dataGridRef.current._instance.getRowIndexByKey(dataGridRef.current._instance.getSelectedRowKeys()[0]),
      INIT_COLUMN,
      INIT_COLUMN + selectedRowData.TOT_DIAS_RESERVAS - 1
    );

    abrirModalPersonas(selectedRowData);
  };

  const mostrarDetalleFila = e => {
    let selectedRow = dataGridRef.current._instance.getSelectedRowsData()[0];
    if (!selectedRow) {
      handleInfoMessages(intl.formatMessage({ id: "CAMP.CAMP.BED.NOT_SELECTED_ALERT" }));
      return;
    }
    let column = '';
    for (let prop in selectedRow) {
      if (prop.split('_')[0] === 'K') {
        const [idReserva, , , , EstadoCama] = selectedRow[prop].split('_');
        console.log('idReserva', idReserva, 'EstadoCama', EstadoCama);
        if (idReserva !== '0' && EstadoCama !== "L") {
          column = prop;
          break;
        }
      }
    }
    if (column === '') {
      handleInfoMessages(intl.formatMessage({ id: "CAMP.BED.NO_RESERVATION_ALERT" }));
      return;
    }

    eventoDetalleClick(e, selectedRow, column);
  };

  useEffect(() => {
    cargarCombos();
  }, []);

  return (
    <>
      <input type="hidden" ref={hidRangeSelected} />
      <input type="hidden" ref={hidTrama} />
      <PortletHeader
        title={intl.formatMessage({ id: "ACTION.LIST" })}
        toolbar={
          <PortletHeaderToolbar>
            <Button
              id="btnBuscar"
              icon="fa fa-search"
              type="default"
              hint={intl.formatMessage({ id: "ACTION.SEARCH" })}
              onClick={e => buscarReservas_onClick(e, false)}
              useSubmitBehavior={true}
              validationGroup="FormEdicion"
              ref={btnSearch}
            />
            &nbsp;
            <Button
              icon="fa fa-save"
              type="default"
              hint={intl.formatMessage({ id: "ACTION.RECORD" })}
              onClick={grabar}
              useSubmitBehavior={true}
              validationGroup="FormEdicion"
            />
          </PortletHeaderToolbar>
        }
      />
      <PortletBody>
        <Form formData={dataRowEditNew} validationGroup="FormEdicion">
          <GroupItem itemType="group" colCount={3} colSpan={3}>
            <Item
              dataField="IdCampamento"
              label={{
                text: intl.formatMessage({ id: "CAMP.RESERVATION.CAMP" })
              }}
              editorType="dxSelectBox"
              isRequired={true}
              editorOptions={{
                items: campamentos,
                valueExpr: "IdCampamento",
                displayExpr: "Campamento",
                placeholder: "Seleccione..",
                onValueChanged: e => onValueChangedCampamento(e.value)
              }}
            />

            <Item
              dataField="IdTipoModulo"
              label={{
                text: intl.formatMessage({ id: "CAMP.RESERVATION.MODULETYPE" })
              }}
              editorType="dxSelectBox"
              isRequired={false}
              editorOptions={{
                items: tipomodulos,
                valueExpr: "IdTipoModulo",
                displayExpr: "TipoModulo",
                onValueChanged: e => setDataRowEditNew({ ...dataRowEditNew, IdTipoModulo: e.value, IdModulo: "", Modulo: "", IdHabitacion: "", Habitacion: "" })
              }}
            />

            <Item
              dataField="Modulo"
              label={{ text: intl.formatMessage({ id: "CAMP.RESERVATION.MODULE" }) }}
              editorOptions={{
                readOnly: true,
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
                      disabled: false,
                      onClick: () => {
                        setPopupVisibleModulo(true);
                      }
                    }
                  }
                ]
              }}
            />

            <Item
              dataField="IdTipoHabitacion"
              label={{
                text: intl.formatMessage({ id: "CAMP.RESERVATION.ROOMTYPE" })
              }}
              editorType="dxSelectBox"
              isRequired={false}
              editorOptions={{
                items: tipoHabitaciones,
                valueExpr: "IdTipoHabitacion",
                displayExpr: "TipoHabitacion",
                onValueChanged: e => setDataRowEditNew({ ...dataRowEditNew, IdTipoHabitacion: e.value, IdHabitacion: "", Habitacion: "" })
              }}
            />

            <Item
              dataField="Habitacion"
              label={{ text: intl.formatMessage({ id: "CAMP.RESERVATION.ROOM" }) }}
              editorOptions={{
                readOnly: true,
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
                      disabled: false,
                      onClick: () => {
                        setPopupVisibleHabitacion(true);
                      }
                    }
                  }
                ]
              }}
            />

            <Item
              dataField="conCamas"
              label={{
                text: intl.formatMessage({ id: "CAMP.RESERVATION.TOSHOW" })
              }}
              editorType="dxSelectBox"
              isRequired={false}
              editorOptions={{
                items: [
                  { valor: 0, descripcion: "Todas las camas" }, // { valor: 1, descripcion: "SI" },
                  { valor: 2, descripcion: "Camas disponibles" }
                ],
                valueExpr: "valor",
                displayExpr: "descripcion",
              }}
            />

            <Item
              dataField="FechaInicio"
              label={{
                text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.STARTDATE" })
              }}
              isRequired={true}
              editorType="dxDateBox"
              dataType="datetime"
              editorOptions={{
                inputAttr: { style: "text-transform: uppercase" },
                displayFormat: "dd/MM/yyyy",
                onValueChanged: e => setDataRowEditNew({ ...dataRowEditNew, FechaInicio: e.value })
              }}
            />

            <Item
              dataField="FechaFin"
              label={{
                text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.ENDDATE" })
              }}
              isRequired={true}
              editorType="dxDateBox"
              dataType="datetime"
              editorOptions={{
                min: dataRowEditNew.FechaInicio,
                inputAttr: { style: "text-transform: uppercase" },
                displayFormat: "dd/MM/yyyy"
              }}
            />
            <Item />
            <Item colSpan={3}>
              <AppBar
                position="static"
                className={classesEncabezado.secundario}
              >
                <Toolbar
                  variant="dense"
                  className={classesEncabezado.toolbar}
                >
                  <Typography
                    variant="h6"
                    color="inherit"
                    className={classesEncabezado.title}
                  >
                    {intl.formatMessage({
                      id: "CAMP.RESERVATION.RESERVATIONDETAILS"
                    })}
                  </Typography>
                </Toolbar>
              </AppBar>
            </Item>
          </GroupItem>
        </Form>

        <div className="row" style={{ marginTop: '-26px', marginBottom: '10px' }}>
          <div className="col-3 offset-9" style={{ textAlign: 'right', paddingRight: '14px' }}>
            <Button
              className="narrow-button"
              icon="fa fa-check"
              type="default"
              text={`${intl.formatMessage({ id: "CASINO.COMPANY.GROUP.TOSELECT" })} ${intl.formatMessage({ id: "CAMP.ROOM.BED" })}`}
              onClick={seleccionarFila}
              useSubmitBehavior={true}
            />&nbsp;
            <Button
              className="narrow-button"
              icon="fas fa-eye"
              type="default"
              text={intl.formatMessage({ id: "CAMP.PROFILE.DETAIL.DETAIL" })}
              onClick={mostrarDetalleFila}
              useSubmitBehavior={true}
            />
          </div>
        </div>

        <div className="row row_max_width pt-1">
          <div className="col-12">
            {/* <input type="hidden" value={tramaPintar} id="hidTrama" name="hidTrama" /> */}
            <DataGridDynamic
              id="datagrid_sin_sombra"
              intl={intl}
              dataSource={listaParaReserva}
              staticColumns={columnasEstaticas}
              dynamicColumns={columnasDinamicas}
              isLoadedResults={viewPagination}
              setIsLoadedResults={setViewPagination}
              refreshDataSource={buscarReservas}
              keyExpr={"RowIndex"} //IdCama
              events={{
                onCellPrepared: onCellPreparedDay,
                onCellDblClick: seleccionarCuadro,
                onCellClick: onCellClick,
                onCellHoverChanged: e => onCellHoverChanged(e),
                onContextMenuPreparing: onContextMenuPreparing
              }}
              dataGridRef={dataGridRef}
            />
          </div>
        </div>
      </PortletBody>
      {
        popupVisibleModulo && (
          <CampamentoModuloBuscar
            selectData={selectModulo}
            showPopup={{ isVisiblePopUp: popupVisibleModulo, setisVisiblePopUp: setPopupVisibleModulo }}
            cancelarEdicion={() => setPopupVisibleModulo(false)}
            uniqueId="moduloBuscarList"
            idDivision={IdDivision}
            dataRowEditNew={dataRowEditNew}
          />
        )
      }

      {
        popupVisibleHabitacion && (
          <CampamentoHabitacionBuscar
            selectData={selectHabitacion}
            showPopup={{ isVisiblePopUp: popupVisibleHabitacion, setisVisiblePopUp: setPopupVisibleHabitacion }}
            cancelarEdicion={() => setPopupVisibleHabitacion(false)}
            uniqueId="habitacionBuscarList"
            idDivision={IdDivision}
            dataRowEditNew={dataRowEditNew}
          />
        )
      }

      {/* POPUP-> buscar persona */}
      {popupVisiblePersona && (
        <AdministracionPersonaBuscar
          showPopup={{ isVisiblePopUp: popupVisiblePersona, setisVisiblePopUp: setPopupVisiblePersona }}
          cancelar={() => { setPopupVisiblePersona(false); setTempReserva([]); showSelection(); }}
          agregar={agregarPersona}
          selectionMode={"single"}
          uniqueId={"personasBuscarUsuarioEditPage"}
        />
      )}

      <ReservaDetalleCamaPopup
        isVisiblePopupDetalle={isVisiblePopupDetalle}
        setIsVisiblePopupDetalle={setIsVisiblePopupDetalle}
        datosReservaDetalle={datosReservaDetalle}
        width={510}
        height={600}
      />
      <Confirm
        message={mensajeConfirm}
        isVisible={isVisibleConfirm}
        setIsVisible={setIsVisibleConfirm}
        setInstance={setInstance}
        onConfirm={confirmGrabar}
        title={confirmTitle}
        confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
        cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
        size="lg"
      />
    </>
  );
};
CamaListPage.propTypes = {
  titulo: PropTypes.string,
  modoEdicion: PropTypes.bool,
  showButtons: PropTypes.bool,
  showAppBar: PropTypes.bool,
  showHeaderInformation: PropTypes.bool,
  uniqueId: PropTypes.string,
  selected: PropTypes.object
};
CamaListPage.defaultProps = {
  titulo: "",
  modoEdicion: false,
  showButtons: true,
  showAppBar: true,
  showHeaderInformation: false,
  uniqueId: "camaList",
  selected: { IdDivision: "" }
};

export default injectIntl(WithLoandingPanel(CamaListPage));
