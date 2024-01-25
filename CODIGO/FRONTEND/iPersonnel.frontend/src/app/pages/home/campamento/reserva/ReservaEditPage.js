import React, { Fragment, useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import Form, {
  Item,
  GroupItem,
  SimpleItem,
  ButtonItem,
  EmptyItem
} from "devextreme-react/form";
import { Button } from "devextreme-react";
import {
  PortletBody,
  PortletHeader,
  PortletHeaderToolbar
} from "../../../../partials/content/Portlet";
import { AppBar, Toolbar, Typography } from "@material-ui/core";
import { useStylesEncabezado } from "../../../../store/config/Styles";
import { injectIntl } from "react-intl";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import HeaderInformation from "../../../../partials/components/HeaderInformation";
import { isNotEmpty } from "../../../../../_metronic";
import {
  handleInfoMessages,
  handleErrorMessages
} from "../../../../store/ducks/notify-messages";
import { DataGrid, Column } from "devextreme-react/data-grid";

//Combos
import { campamentos as listarCampamentos } from "../../../../api/campamento/perfilDetalle.api";
import { listar as listarModulo } from "../../../../api/campamento/tipoModulo.api";
import { listar as listarTipoHabitacion } from "../../../../api/campamento/tipoHabitacion.api";
import { listar as listarServicios } from "../../../../api/campamento/servicio.api";
import {
  regimen as personasRegimen,
  guardia as personaGuardia
} from "../../../../api/administracion/personaRegimen.api";
import {
  listartipomodulo as listartipomoduloPerfil,
  listartipohabitacion as listartipohabitacionPerfil
} from "../../../../api/campamento/perfilDetalle.api";

import { obtener as obtnerCampamento } from "../../../../api/campamento/campamento.api";

//Utils
import { PaginationSetting } from "../../../../../_metronic/utils/utils";
import {
  getEstadoCeldaDia,
  getClassCeldaByEstado,
  esDiaDisponible,
  cellRenderHabitacion,
  onCellPreparedDay,
  crearArregloColumnasHeader
} from "./ReservasUtil";

import "./ReservaEditPage.css";

import ReservaDetallePersonaPopup from "./ReservaDetallePersonaPopup";

import SimpleDropDownBoxGrid from "../../../../partials/components/SimpleDropDownBoxGrid/SimpleDropDownBoxGrid";
import DataGridDynamic from "../../../../partials/components/DataGridDynamic/DataGridDynamic";
// import CustomTabNav from "../../../../partials/components/Tabs/CustomTabNav";

import { listar as listarDia } from "../../../../api/administracion/regimenGuardiaDia.api";
import styled from "@emotion/styled";
import Confirm from "../../../../partials/components/Confirm";

export const DivMensajeCamaExclusiva = styled.div`
  color: rgb(255, 127, 42);
  font-weight: bold;
  margin-bottom: 7px;
  margin-top: 15px;
`;

const ReservaEditPage = props => {
  const { intl, setLoading, combosReserva } = props;
  const classesEncabezado = useStylesEncabezado();
  const [listaParaReserva, setListaParaReserva] = useState([]);
  const perfil = useSelector(state => state.perfil.perfilActual);
  const IdPersona = props.dataRowEditNew.IdPersona;

  const [mensajeConfirm, setMensajeConfirm] = useState('');
  const [perfiles, setPerfiles] = useState([]);
  const [campamentos, setCampamentos] = useState([]);
  const [tipomodulos, setTipomodulos] = useState([]);
  const [tipoHabitaciones, setTipoHabitaciones] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [regimenes, setRegimenes] = useState([]);
  const [guardias, setGuardias] = useState([]);

  const [reservas, setReservas] = useState([]); //Lista de los dias que se reservan. {Fecha, Cama, }
  const [diasBloqueados, setDiasBloqueados] = useState([]); //Lista de dias bloqueados porque el trabajador ya cuenta con reserva.
  const [contextMenuEvent, setContextMenuEvent] = useState();
  const [isVisiblePopupDetalle, setIsVisiblePopupDetalle] = useState(false);
  const [datosReservaDetalle, setDatosReservaDetalle] = useState({
    DetalleServicios: []
  });
  const [servicioSeleccionados, setServiciosSeleccionados] = useState([]);
  const [listarDias, setListarDias] = useState([]);
  const [listarGuardiasDia, setListarGuardiasDia] = useState([]);
  const [visibleGuardia, setVisibleGuardia] = useState(false);
  const [visibleCamaExclusiva, setVisibleCamaExclusiva] = useState(false);
  const [msgCamaExclusiva, setMsgCamaExclusiva] = useState(false);

  const [viewPagination, setViewPagination] = useState(false);
  const [tramaPintar, setTramaPintar] = useState("");
  const btnSearch = useRef(null);
  let dataGridRef = React.useRef();
  const [isVisibleConfirm, setIsVisibleConfirm] = useState(false);
  const [, setInstance] = useState({});

  //:::::::::::::::::::::::::::::::::::::::::::::

  useEffect(() => {
    //console.log("datos", { data: props.dataRowEditNew });
    cargarCombos();
    //props.dataRowEditNew.IdPerfil = "";
  }, []);

  // useEffect(() => {
  //     buscarReservas();
  // }, [currentPage]);

  // function calcularPaginacion(resultados) {
  //     if (resultados.length > 0) {
  //         let totalRegistros = resultados[0].TotalCount;

  //         if (totalRegistros > pageSize) {
  //             let totalRegistroResultado = resultados.length;

  //             setTotalPages(Math.round(totalRegistros / pageSize));
  //             setSummaryCountText(`${totalRegistroResultado} de ${totalRegistros} registros`);
  //             setViewPagination(true);
  //         } else {
  //             setViewPagination(false);
  //         }
  //     } else {
  //         setViewPagination(false);
  //     }
  // }

  async function cargarCombos() {
    setLoading(true);
    let IdCliente = perfil.IdCliente;
    let IdDivision = perfil.IdDivision;
    const {
      Perfiles,
      Campamentos,
      TipoHabitacion,
      TipoModulos,
      Servicios,
      Regimen
    } = combosReserva;



    let cargaCampamentoPerfil = await CargarValoresPorDefecto(Regimen, Perfiles, Campamentos);

    setPerfiles(Perfiles);
    if (!cargaCampamentoPerfil) {
      setCampamentos(Campamentos);
    }
    setTipomodulos(TipoModulos);
    setTipoHabitaciones(TipoHabitacion);
    setServicios(Servicios);
    setRegimenes(Regimen);

    setLoading(false);

    if (!props.dataRowEditNew.esNuevoRegistro) {
      let idReserva = props.dataRowEditNew.IdReserva;
      let datosReserva = await props.buscarDisponibilidadReservas(
        servicioSeleccionados,
        0,
        PaginationSetting.TOTAL_RECORDS
      );

      // console.log("cargarCombos|datosReserva:",datosReserva);

      if (datosReserva.IdError === 0) {
        let bloqueados = datosReserva.reservas.filter(
          x => x.IdReserva !== idReserva
        );
        let antiguasReservas = datosReserva.reservas
          .filter(x => x.IdReserva === idReserva)
          .map(x => ({
            Fecha: x.Fecha,
            IdCama: x.IdCama,
            IdModulo: x.IdModulo,
            IdHabitacion: x.IdHabitacion
            /*Cama: x.Cama,
                        Habitacion: x.Habitacion*/
          }));

        setDiasBloqueados(bloqueados);
        cargarValoresReserva(antiguasReservas);
        setListaParaReserva(datosReserva.resultados);
        // setReservasHeader(datosReserva.headerColumns);
        //------------ EGSC
        //Creando columnas dinamicas:
        let header_json = crearArregloColumnasHeader(
          datosReserva.headerColumns || [],
          intl,
          { cellRender: cellRenderReservaDia }
        );
        if (header_json.length > 0) {
          setColumnasDinamicas(header_json);
        }

        //Mostrar datos cama exclusiva y paginado:
        setTimeout(() => {
          setViewPagination(true);
          let camasExclusivas = datosReserva.resultados.filter(
            x => x.FL_CAMA_EXCLUSIVA === "S"
          );
          if (camasExclusivas.length > 0) {
            let camas = camasExclusivas.map(x => x.Habitacion).join(",");
            setMsgCamaExclusiva(
              `La persona cuenta con cama exclusiva en habitación: ${camas}`
            );
            setVisibleCamaExclusiva(true);
          } else {
            if (visibleCamaExclusiva) setVisibleCamaExclusiva(false);
          }
        }, 500);
      }
    }
  }

  const CargarValoresPorDefecto = async (
    tmp_regimen,
    tmp_perfiles,
    tmp_campamento
  ) => {
    let IdCliente = perfil.IdCliente;
    let IdDivision = perfil.IdDivision;
    let IdPersona = props.dataRowEditNew.IdPersona;
    let IdRegimen = "";
    let IdGuardia = "";
    let tmp_guardia = [];
    let tmp_dias = [];
    let tmp_visible_guardia = false;
    let nomDias = [];
    let IdCampamento = "";
    let IdPerfil = props.dataRowEditNew.IdPerfil;
    let tmp_campamentos_perfil = [];
    let cargaCampamentoPerfil = false;
    //setLoading(true);
    //console.log("carga regimen", tmp_regimen);
    if (tmp_regimen.length > 0) {
      //console.log("ingresa a la carga de personaGuardia");
      IdRegimen = tmp_regimen[0].IdRegimen;
      tmp_guardia = await personaGuardia({
        IdCliente,
        IdDivision,
        IdPersona,
        IdRegimen
      });

      if (tmp_guardia.length > 0) {
        IdGuardia = tmp_guardia[0].IdGuardia;
        tmp_dias = await listarDia({
          IdCliente,
          IdDivision,
          IdRegimen,
          IdGuardia
        });

        if (tmp_dias.length > 0) {
          let dias = tmp_dias[0];
          nomDias = Object.keys(dias)
            .map(x => {
              if (!isNaN(x)) {
                return { IdDia: x, Turno: dias[x] };
              }
            })
            .filter(x => x != undefined);

          tmp_visible_guardia = true;
        } else {
          tmp_visible_guardia = false;
        }
      }
    }

    if (tmp_perfiles.length > 0) {
      IdPerfil = IdPerfil === "" ? tmp_perfiles[0].IdPerfil : IdPerfil;
      tmp_campamentos_perfil = await listarCampamentos({
        IdCliente,
        IdDivision,
        IdPerfil
      });
    }

    //setLoading(false);
    if (tmp_campamentos_perfil.length > 0) {
      IdCampamento = tmp_campamentos_perfil[0].IdCampamento;
      cargaCampamentoPerfil = true;
      setCampamentos(tmp_campamentos_perfil);
    } else if (tmp_campamento.length > 0) {
      ////console.log("se va setear campamento: ", tmp_campamento[0].IdCampamento);
      IdCampamento = tmp_campamento[0].IdCampamento;
    }

    if (nomDias.length > 0) setListarDias(nomDias);
    if (tmp_dias.length > 0) setListarGuardiasDia(tmp_dias);
    if (tmp_guardia.length > 0) setGuardias(tmp_guardia);

    props.setDataRowEditNew(prev => ({
      ...prev,
      IdRegimen,
      IdGuardia,
      IdCampamento
    }));
    setVisibleGuardia(tmp_visible_guardia);
    return cargaCampamentoPerfil;
  };

  const onValueChangedPerfil = async valor => {
    let tmp_campamentos = await listarCampamentos({
      IdCliente: perfil.IdCliente,
      IdDivision: perfil.IdDivision,
      IdPerfil: valor
    });
    setCampamentos(tmp_campamentos);

    if (tmp_campamentos.length > 0) {
      //Se selecciona campamento por defecto:
      props.setDataRowEditNew({
        ...props.dataRowEditNew,
        IdCampamento: tmp_campamentos[0].IdCampamento
      });
    }
    document.getElementById("btnBuscar").click();
  };

  const onValueChangedCampamento = async valor => {
    setLoading(true);
    let IdCliente = perfil.IdCliente;
    let IdDivision = perfil.IdDivision;
    let IdPerfil = props.dataRowEditNew.IdPerfil;
    let IdCampamento = valor;

    //////console.log("onValueChangedCampamento", IdPerfil, IdCampamento);

    let [tmp_tipomodulos, tmp_tipoHabitaciones] = await Promise.all([
      listartipomoduloPerfil({ IdCliente, IdDivision, IdPerfil, IdCampamento }),
      listartipohabitacionPerfil({
        IdCliente,
        IdDivision,
        IdPerfil,
        IdCampamento
      })
    ]).finally(() => {
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

    setReservas([]);
    document.getElementById("btnBuscar").click();
  };

  // const seleccionarServicio = (e, idServicio) => {

  //     setServicios(
  //         servicios.map((x, i) => (
  //             x.IdServicio == idServicio ? { ...x, Check: e.value } : x
  //         ))
  //     );

  // }

  const onBuscarFiltros = e => {
    //console.log({ value: e.value, item: e.component.option("name"), btnSearch });
    //buscarReservas(0, PaginationSetting.TOTAL_RECORDS);
    buscarReservas_onClick(e, true);


  };

  const currentDate = new Date(2017, 4, 23);
  const views = ["month"];

  const grabar = async e => {
    let result = e.validationGroup.validate();
    if (!result.isValid) {
      return;
    }

    if (reservas.length > 0) {
      setLoading(true);
      try {
        const camp = await obtnerCampamento({
          idCliente: 0,
          idDivision: perfil.IdDivision,
          idCampamento: props.dataRowEditNew.IdCampamento
        });

        let fechaInicioString = reservas[0].Fecha;
        let fechaString = reservas[0].Fecha;

        for (let i = 0; i < reservas.length; i++) {
          let currentFecha = reservas[i].Fecha;
          if (fechaInicioString > currentFecha) fechaInicioString = currentFecha;
          if (fechaString < currentFecha) fechaString = currentFecha;
        }

        const fechaInicioFormateada = fechaInicioString.substring(6) + '/' + fechaInicioString.substring(4, 6) + '/' + fechaInicioString.substring(0, 4);
        const horaCheckout = camp?.HoraCheckOut?.substring(11, 16); 
        const fechaFormateada = fechaString.substring(6) + '/' + fechaString.substring(4, 6) + '/' + fechaString.substring(0, 4);
        setMensajeConfirm(
          `${intl.formatMessage({ id: "CAMP.RESERVATION.RESERVATION_FROM" })} ${fechaInicioFormateada} ${intl.formatMessage({ id: "CAMP.RESERVATION.RESERVATION_TO" })} ${fechaFormateada}. ${intl.formatMessage({ id: "CAMP.RESERVATION.CHECKOUT_DATE_ALERT" })} ${fechaFormateada} ${intl.formatMessage({ id: "CAMP.RESERVATION.CHECKOUT_TIME_ALERT" })} ${horaCheckout} ${intl.formatMessage({ id: "CAMP.RESERVATION.CHECKOUT_ARE_YOU_SURE" })}`
        );
        setIsVisibleConfirm(true);
      } catch (err) {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err);
      } finally {
        setLoading(false);
      }
    } else {
      handleInfoMessages("Debe realizar una reserva de cama como mínimo.");
    }
  };

  const confirmGrabar = () => {
    if (props.dataRowEditNew.esNuevoRegistro) {
      props.grabar(reservas);
    } else {
      props.actualizar(reservas);
    }
  };

  const buscarReservas_onClick = async (e, noValidate) => {
    let _returnValidate = true;

    var RangoSeleccionado =
      props.dataRowEditNew.FechaFin - props.dataRowEditNew.FechaInicio + 1;
    let CantidadDiasSeleccionados =
      RangoSeleccionado / (1000 * 60 * 60 * 24) + 1; // (1000*60*60*24) --> milisegundos -> segundos -> minutos -> horas -> días
    let filterName = campamentos.filter(
      x => x.IdCampamento === props.dataRowEditNew.IdCampamento
    );
    //console.log("buscarReservas_onClick|filterName", filterName);
    await obtnerCampamento({
      IdDivision: perfil.IdDivision,
      IdCampamento: props.dataRowEditNew.IdCampamento
    })
      .then(data => {
        if (
          Math.round(CantidadDiasSeleccionados) > parseInt(data.DiasPermanencia)
        ) {
          _returnValidate = false;
          //  handleInfoMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), intl.formatMessage({ id: "CAMP.RESERVATION.MSG.VALID.PERMANENCE" }) + data.DiasPermanencia + intl.formatMessage({ id: "CAMP.RESERVATION.MSG.VALID.DAYS" }))

          handleInfoMessages(
            intl.formatMessage({ id: "MESSAGES.INFO" }),
            intl.formatMessage({ id: "CAMP.RESERVATION.MSG.VALID.HOTEL" }) +
            filterName[0].Campamento +
            intl.formatMessage({
              id: "CAMP.RESERVATION.MSG.VALID.PERMANENCE"
            }) +
            data.DiasPermanencia +
            intl.formatMessage({ id: "CAMP.RESERVATION.MSG.VALID.DAYS" }) +
            intl.formatMessage({ id: "CAMP.RESERVATION.MSG.VALID.DATES" }) +
            data.DiasPermanencia +
            intl.formatMessage({ id: "CAMP.RESERVATION.MSG.VALID.DAYS" })
          );
        }
      })
      .catch(err => { })
      .finally(() => { });

    if (_returnValidate) {
      if (!noValidate) {
        let result = e.validationGroup.validate();
        let fl = !result.isValid;
        setEvaluarRequerido(fl);
        if (fl) {
          return;
        }
      }

      buscarReservas(0, PaginationSetting.TOTAL_RECORDS);
    }
  };

  const buscarReservas = async (skip, take) => {
    let datosReserva = await props.buscarDisponibilidadReservas(
      servicioSeleccionados,
      skip,
      take
    ); //Pagina 1 de [0 a 20]

    if (datosReserva.IdError == 0) {
      //Evaluar si las de estado P se deben incluir como bloqueados:
      setDiasBloqueados(datosReserva.reservas);

      setListaParaReserva(datosReserva.resultados);
      // setReservasHeader(datosReserva.headerColumns);
      //calcularPaginacion(datosReserva.resultados);

      //Creando columnas dinamicas:
      let header_json = crearArregloColumnasHeader(
        datosReserva.headerColumns || [],
        intl,
        { cellRender: cellRenderReservaDia }
      );

      if (header_json.length > 0) {
        setColumnasDinamicas(header_json);
      }

      //Mostrar datos cama exclusiva y paginado:
      setTimeout(() => {
        setViewPagination(true);
        let camasExclusivas = datosReserva.resultados.filter(
          x => x.FL_CAMA_EXCLUSIVA === "S"
        );
        if (camasExclusivas.length > 0) {
          let camas = camasExclusivas.map(x => x.Habitacion).join(",");
          setMsgCamaExclusiva(
            `La persona cuenta con cama exclusiva en habitación: ${camas}`
          );
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
            x => x.Fecha == fechaSeleccionada
          );
          flCambio = existeBloqueo.length == 0; //Si no existe fecha bloqueada se permite el cambio

          if (flCambio) {
            pinterElementoSeleccionado(e.cellElement);
            //Se valida si ya existe un seleccionado en el mismo dia y se remueve:
            let reservaAnterior = tmp_reservas.filter(
              x => x.Fecha == fechaSeleccionada
            );
            if (reservaAnterior.length > 0) {
              tmp_reservas = tmp_reservas.filter(
                x => x.Fecha != fechaSeleccionada
              );
            }
          } else {
            handleInfoMessages(
              "Ya se cuenta con una reserva asignada en el día seleccionado."
            );
          }
        } else if (estadoCeldActual == "SE") {
          //Se retorna al estado anterior:
          flCambio = false;
          //Se remueve reserva:
          tmp_reservas = tmp_reservas.filter(x => x.Fecha != fechaSeleccionada);
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

  function cargarValoresReserva(arrayReserva) {
    let trama = arrayReserva
      .map(x => `${x.Fecha}@${x.IdCama}@${x.IdModulo}@${x.IdHabitacion}`)
      .join("|");
    setTramaPintar(trama);
    setReservas(arrayReserva);
  }

  function cellRenderReservaDia(param) {
    if (param && param.data) {
      /*let columnValid = param.column.dataField.substring(0, 2);
            if (columnValid === 'K_') {*/

      if (param.text != "") {
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
        let currentIdPersona = props.dataRowEditNew.IdPersona;

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

        let strHidden = document.getElementById("hidTrama").value;
        let fechaSeleccionada = "";
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
              x.Fecha == fecha &&
              x.IdCama == IdCama &&
              x.IdHabitacion == IdHabitacion
          ); // Se modifico 05-10-2021 para pintar camas iguales en diferentes habitaciones
        }

        if (fechaSeleccionada.length > 0) {
          leyenda = "SE";
          css_clase = getClassCeldaByEstado("SE");
        }

        return (
          <Fragment>
            <span id={`${IdCama}_${fecha}`} className={css_clase}>
              {leyenda}
            </span>
            <input type="hidden" value={param.text} />
          </Fragment>
        );
      }

      //}
    }
  }

  // const eliminarReservas = (fecha) => {
  //     //  setNuevasReservas(nuevasReservas.filter(x => x.Fecha != fecha));
  // }

  const onCellHoverChanged = e => {
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

      console.log('e:', e, 'rowIndex', e.rowIndex, 'columnIndex', e.columnIndex);

      showSelection(e, selectedRange);
    } else {
      isSelectionStopped = true;
    }
  };

  let selectedRange = {};
  let isSelectionStopped = true;

  const onCellClick = e => {
    selectedRange.startRowIndex = e.rowIndex;
    selectedRange.endRowIndex = e.rowIndex;
    selectedRange.startColumnIndex = e.columnIndex;
    selectedRange.endColumnIndex = e.columnIndex;
    isSelectionStopped = false;
    showSelection(e, selectedRange);
  };

  function showSelection(e, selectedRange) {
    let elems = document.querySelectorAll(".cell-selected");

    [].forEach.call(elems, function (el) {
      el.classList.remove("cell-selected");
    });

    foreachRange(selectedRange, function (rowIndex, columnIndex) {
      e.component
        .getCellElement(rowIndex, columnIndex)
        .classList.add("cell-selected");
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

  function showSelectionCompleteRow(selectedRange) {
    let elems = document.querySelectorAll(".cell-selected");

    [].forEach.call(elems, function (el) {
      el.classList.remove("cell-selected");
    });

    foreachRange(selectedRange, function (rowIndex, columnIndex) {
      dataGridRef.current.instance
        .getCellElement(rowIndex, columnIndex)
        .classList.add("cell-selected");
    });
  }

  const onContextMenuPreparing = e => {
    //if (e.dataField)
    let columnValid = e.column.dataField.substring(0, 2);

    if (columnValid === "K_") {
      let esMismaFila = e.rowIndex == selectedRange.startRowIndex;
      let estaEnRangoDeColumnas =
        e.columnIndex <= selectedRange.endColumnIndex ||
        e.columnIndex >= selectedRange.startColumnIndex;
      let columna = e.column.dataField;
      let data = e.row.data;
      let itemSeleccionar = {
        text: "Seleccionar",
        icon: "isnotblank",
        onItemClick: e => {
          eventoSeleccionarClick(e, data);
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

  async function eventoSeleccionarClick(e, data) {
    let elems = document.querySelectorAll(".cell-selected");
    let tmp_reservas = reservas;
    let dias_alerta = [];
    let _returnValidate = true;

    // await obtnerCampamento({
    //   IdDivision: perfil.IdDivision,
    //   IdCampamento:props.dataRowEditNew.IdCampamento,
    // }).then(data => {
    //     if(elems.length > parseInt(data.DiasPermanencia) || reservas.length >= 15) {
    //       _returnValidate = false;
    //       handleInfoMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), intl.formatMessage({ id: "CAMP.RESERVATION.MSG.VALID.PERMANENCE" }) + data.DiasPermanencia + intl.formatMessage({ id: "CAMP.RESERVATION.MSG.VALID.DAYS" }))
    //       }
    //   }).catch(err => {}).finally(() => {
    // });

    // if(_returnValidate){

    if (data.FL_CAMA_EXCLUSIVA === "S") {
      props.dataRowEditNew.FlgCamaExclusiva = "S";
    } else {
      props.dataRowEditNew.FlgCamaExclusiva = "N";
    }

    //console.log("--> 1");
    for (let i = 0; i < elems.length; i++) {
      //console.log("--> 2");
      let estadoCeldActual = elems[i].children[0].innerHTML;
      let fechaSeleccionada = elems[i].children[0].id.split("_")[1];
      let flCambio = false;

      if (esDiaDisponible(estadoCeldActual)) {
        //console.log("--> 3");
        let existeBloqueo = diasBloqueados.filter(
          x => x.Fecha == fechaSeleccionada
        );
        flCambio = existeBloqueo.length == 0; //Si no existe fecha bloqueada se permite el cambio

        if (flCambio) {
          //Se valida si ya existe un seleccionado en el mismo dia y se remueve:
          let reservaAnterior = tmp_reservas.filter(
            x => x.Fecha == fechaSeleccionada
          );
          pinterElementoSeleccionado(elems[i]);
          if (reservaAnterior.length > 0) {
            tmp_reservas = tmp_reservas.filter(
              x => x.Fecha != fechaSeleccionada
            );
          }
        } else {
          dias_alerta.push(fechaSeleccionada);
        }
      }
      //console.log("--> 4");

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
      //console.log("--> 5");
    }

    //console.log("--> 6");
    cargarValoresReserva(tmp_reservas);
    //console.log("--> 7");
    if (dias_alerta.length > 0) {
      let strDias = dias_alerta.map(x => x.substring(6)).join(", ");
      handleInfoMessages(
        "Ya se cuenta con una reserva asignada en los dias: " + strDias
      );
    }
    //console.log("--> 8");

    // }
  }

  async function eventoDetalleClick(e, data, columna) {
    //////console.log("eventoDetalleClick", data, columna);

    let [idReserva, turno, estado, idPersona, EstadoCama] = data[columna].split(
      "_"
    );

    if (idReserva != 0 && EstadoCama != "L") {
      setLoading(true);
      let param = {
        IdCampamento: data.IdCampamento,
        IdReserva: idReserva,
        Fecha: columna.split("_")[1]
      };
      let objReserva = await props.retornarReserva(param);
      //////console.log("se carga info: ", objReserva);

      if (objReserva.length != 0) {
        let strTurno =
          objReserva.Turno == "F"
            ? "Full"
            : objReserva.Turno == "D"
              ? "Dia"
              : "Noche";
        let css_color_estado = "";
        let strEstado = "";
        switch (objReserva.Estado) {
          case "P":
            css_color_estado = "item_cuadro item_cuadro_r";
            strEstado = "Reservado";
            break;
          case "A":
            css_color_estado = "item_cuadro item_cuadro_i";
            strEstado = "Ocupado";
            break;
          case "I":
            css_color_estado = "item_cuadro item_cuadro_o";
            strEstado = "Finalizado";
            break;
        }

        objReserva.cssEstado = css_color_estado;
        objReserva.Turno = strTurno;
        objReserva.Estado = strEstado;

        let lstServicios =
          objReserva.Servicios != null
            ? objReserva.Servicios.split("|").map(x => x.split("@")[1])
            : [];
        //////console.log("servicios ", lstServicios);
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
    // console.log("pinterElementoSeleccionado|elemento:",elemento);
    elemento.children[0].innerHTML = "SE";
    elemento.children[0].classList.add("celda_SE");
    elemento.classList.remove("cell-selected");
  }

  const onContextMenuItemClick = e => {
    e.itemData.onItemClick(contextMenuEvent, e);
  };

  // const onChangePage = async (page) => {
  //     let newShowMax = showMax;

  //     setCurrentPage(page);

  //     if (page === totalPages) { //Estoy en la ultima pagina:
  //         newShowMax = 2;
  //     } else {
  //         //Retorno de ultima pagina:
  //         if (totalPages - page >= Math.floor(PaginationSetting.SHOW_MAX / 2)) {
  //             newShowMax = PaginationSetting.SHOW_MAX;
  //         } else {
  //             newShowMax = totalPages - page + 1
  //             //console.log(".................> ", newShowMax);
  //         }
  //     }
  //     if (showMax !== newShowMax) setShowMax(newShowMax);

  // }

  const onValueChangedRegimen = async valor => {
    let IdCliente = perfil.IdCliente;
    let IdDivision = perfil.IdDivision;
    let IdPersona = props.dataRowEditNew.IdPersona;
    let IdRegimen = valor;

    //console.log("onValueChangedCampamento", IdRegimen);

    if (isNotEmpty(IdRegimen)) {
      setLoading(true);
      //console.log(`valores [${IdRegimen}]`);
      let tmp_guardia = await personaGuardia({
        IdCliente,
        IdDivision,
        IdPersona,
        IdRegimen
      }).finally(() => {
        setLoading(false);
      });

      setGuardias(tmp_guardia);
    }
  };

  const onValueChangedGuardia = async valor => {
    //console.log("onValueChangedGuardia", valor);

    if (!isNotEmpty(valor)) {
      return;
    }
    setLoading(true);
    let IdCliente = perfil.IdCliente;
    let IdDivision = perfil.IdDivision;
    let IdPersona = props.dataRowEditNew.IdPersona;
    let IdRegimen = props.dataRowEditNew.IdRegimen;
    let IdGuardia = valor;

    setLoading(true);
    await listarDia({
      IdCliente,
      IdDivision,
      IdRegimen,
      IdGuardia
    })
      .then(data => {
        if (data.length > 0) {
          let dias = data[0];
          let nomDias = Object.keys(dias)
            .map(x => {
              if (!isNaN(x)) {
                return { IdDia: x, Turno: dias[x] };
              }
            })
            .filter(x => x != undefined);

          setListarDias(nomDias);

          ////console.log("****-->", nomDias);
          nomDias
            .filter(b => b.Turno === "D")
            .map((x, i) => {
              ////console.log("->>> ", x.IdDia,);
            });

          setVisibleGuardia(true);
        } else {
          setVisibleGuardia(false);
        }
        setListarGuardiasDia(data);
        ////console.log("===> ", data);
        //listarGuardiasDia
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err);
        setVisibleGuardia(false);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const onCellPreparedGuardias = e => {
    //////console.log("onCellPrepared", e.rowType);
    if (e.rowType === "data") {
      //////console.log("onCellPrepared.dataField", e.column.dataField);
      let columnValid = e.column.dataField;
      if (columnValid) {
        e.cellElement.classList.add("celda_Padre");
      }
    }
  };

  const cellRenderDay = param => {
    if (param && param.data) {
      let columnId = param.column.dataField;
      let columnValue = param.value;
      if (param.text != "") {
        return (
          <Fragment>
            <span className="celda_Hijo_General">{param.text}</span>
          </Fragment>
        );
      }
    }
  };

  /**************************************************************************************************** */
  /** TABS:       ************************************************************************************* */
  const [evaluarRequerido, setEvaluarRequerido] = useState(false);

  const renderReserva = e => {
    return (
      <Form formData={props.dataRowEditNew} validationGroup="FormEdicion">
        <GroupItem itemType="group" colCount={2} colSpan={2}>
          <SimpleItem dataField="IdCliente" visible={false}></SimpleItem>
          <SimpleItem dataField="IdDivision" visible={false}></SimpleItem>
          <SimpleItem dataField="IdCampamento" visible={false}></SimpleItem>

          <Item
            name="IdPerfil"
            dataField="IdPerfil"
            label={{
              text: intl.formatMessage({ id: "CAMP.RESERVATION.PROFILE" })
            }}
            editorType="dxSelectBox"
            isRequired={false}
            editorOptions={{
              readOnly: !props.modoEdicion,
              items: perfiles,
              valueExpr: "IdPerfil",
              displayExpr: "Perfil",
              disabled: !props.dataRowEditNew.esNuevoRegistro,
              onValueChanged: e => onValueChangedPerfil(e.value)
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
              readOnly: !props.modoEdicion,
              items: [
                { valor: 0, descripcion: "Todas las camas" }, // { valor: 1, descripcion: "SI" },
                { valor: 2, descripcion: "Camas disponibles" }
              ],
              valueExpr: "valor",
              displayExpr: "descripcion",
              disabled: !props.dataRowEditNew.esNuevoRegistro
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
              min: props.fechasContrato.FechaInicioContrato,
              max: props.fechasContrato.FechaFinContrato,
              inputAttr: { style: "text-transform: uppercase" },
              displayFormat: "dd/MM/yyyy",
              /*onKeyUp: evt => {
                if (evt.event.keyCode === 13) {
                  onBuscarFiltros(evt);
                }
              },*/
              onValueChanged: (e) => {
                onBuscarFiltros(e);
              },
              /* onClosed: evt => {
                 onBuscarFiltros(evt);
               }*/
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
              min: props.fechasContrato.FechaInicioContrato,
              max: props.fechasContrato.FechaFinContrato,
              inputAttr: { style: "text-transform: uppercase" },
              displayFormat: "dd/MM/yyyy",
              onValueChanged: (e) => {
                onBuscarFiltros(e);
              },
              /*onKeyUp: evt => {
                if (evt.event.keyCode === 13) {
                  onBuscarFiltros(evt);
                }
              },*/
              /*onClosed: evt => {
                onBuscarFiltros(evt);
              }*/
            }}
          />
        </GroupItem>
      </Form>
    );
  };

  const renderCampamento = e => {
    ////console.log("renderCampamento", e, props.dataRowEditNew);
    return (
      <Form formData={props.dataRowEditNew} validationGroup="FormEdicion">
        <GroupItem itemType="group" colCount={2} colSpan={2}>
          <Item
            dataField="IdCampamento"
            label={{
              text: intl.formatMessage({ id: "CAMP.RESERVATION.CAMP" })
            }}
            editorType="dxSelectBox"
            isRequired={true}
            editorOptions={{
              readOnly: !props.modoEdicion,
              items: campamentos,
              valueExpr: "IdCampamento",
              displayExpr: "Campamento",
              disabled: !props.dataRowEditNew.esNuevoRegistro,
              placeholder: "Seleccione..",
              onValueChanged: e => onValueChangedCampamento(e.value)
            }}
          />

          <Item dataField="Servicios">
            <SimpleDropDownBoxGrid
              ColumnDisplay={"Servicio"}
              placeholder={"Select a value.."}
              SelectionMode="multiple"
              dataSource={servicios}
              Columnas={[
                {
                  dataField: "Servicio",
                  caption: intl.formatMessage({
                    id: "CAMP.RESERVATION.SERVICES"
                  }),
                  width: "100%"
                }
              ]}
              setSeleccionados={setServiciosSeleccionados}
              Seleccionados={servicioSeleccionados}
              pageSize={10}
              pageEnabled={true}
            />
          </Item>

          <Item
            dataField="IdTipoModulo"
            label={{
              text: intl.formatMessage({ id: "CAMP.RESERVATION.MODULETYPE" })
            }}
            editorType="dxSelectBox"
            isRequired={false}
            editorOptions={{
              readOnly: !props.modoEdicion,
              items: tipomodulos,
              valueExpr: "IdTipoModulo",
              displayExpr: "TipoModulo",
              disabled: !props.dataRowEditNew.esNuevoRegistro
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
              readOnly: !props.modoEdicion,
              items: tipoHabitaciones,
              valueExpr: "IdTipoHabitacion",
              displayExpr: "TipoHabitacion",
              disabled: !props.dataRowEditNew.esNuevoRegistro
            }}
          />
        </GroupItem>
      </Form>
    );
  };

  const renderRegimen = e => {
    ////console.log("renderRegimen", e, props.dataRowEditNew);
    return (
      <Form formData={props.dataRowEditNew} validationGroup="FormEdicion">
        <GroupItem itemType="group" colCount={2} colSpan={2}>
          <Item
            dataField="IdRegimen"
            label={{
              text: intl.formatMessage({ id: "ADMINISTRATION.REGIME" })
            }}
            editorType="dxSelectBox"
            editorOptions={{
              readOnly: true,
              items: regimenes,
              maxLength: 50,
              inputAttr: { style: "text-transform: uppercase" },

              valueExpr: "IdRegimen",
              displayExpr: "Regimen",
              disabled: !props.dataRowEditNew.esNuevoRegistro,
              placeholder: "Seleccione..",
              onValueChanged: e => onValueChangedRegimen(e.value)
            }}
          />

          <Item
            dataField="IdGuardia"
            label={{ text: intl.formatMessage({ id: "ADMINISTRACION.GUARD" }) }}
            editorType="dxSelectBox"
            editorOptions={{
              readOnly: true,
              items: guardias,
              maxLength: 50,
              inputAttr: { style: "text-transform: uppercase" },

              valueExpr: "IdGuardia",
              displayExpr: "Guardia",
              disabled: !props.dataRowEditNew.esNuevoRegistro,
              placeholder: "Seleccione..",
              onValueChanged: e => onValueChangedGuardia(e.value)
            }}
          />

          <Item colSpan={2}>
            {visibleGuardia ? (
              <DataGrid
                id="gridViewDiasGuardia"
                dataSource={listarGuardiasDia}
                showBorders={true}
                keyExpr="IdGuardia"
                onCellPrepared={onCellPreparedGuardias}
              >
                <Column caption="DIAS DE TRABAJO" alignment="center">
                  {listarDias
                    .filter(b => b.Turno === "D")
                    .map((x, i) => (
                      <Column
                        dataField={x.IdDia}
                        caption={x.IdDia}
                        alignment="center"
                        width={30}
                        allowSorting={false}
                        cellRender={cellRenderDay}
                      />
                    ))}
                </Column>
                <Column caption="DESCANSO" alignment="center">
                  {listarDias
                    .filter(b => b.Turno === "L")
                    .map((x, i) => (
                      <Column
                        dataField={x.IdDia}
                        caption={x.IdDia}
                        alignment="center"
                        allowSorting={false}
                        width={30}
                        cellRender={cellRenderDay}
                      />
                    ))}
                </Column>
              </DataGrid>
            ) : (
              <div>-</div>
            )}
          </Item>
        </GroupItem>
      </Form>
    );
  };

  const elementos = [
    {
      id: "idGeneral",
      nombre: intl.formatMessage({ id: "CAMP.RESERVATION.GENERAL" }),
      bodyRender: e => {
        return renderReserva();
      }
    },
    {
      id: "idCampamento",
      nombre: intl.formatMessage({ id: "CAMP.PROFILE.MENU" }),
      bodyRender: e => {
        return renderCampamento();
      }
    }
    // SE COMENTÓ ESTA PESTAÑA PORQUE NO SE USA EN BOROO - FZARATE 12/09/22
    // {
    //   id: "idRegimen",
    //   nombre: intl.formatMessage({ id: "CAMP.RESERVATION.REGIME" }),
    //   bodyRender: e => {
    //     return renderRegimen();
    //   }
    // }
  ];

  /**************************************************************************************************** */

  // function Alert(props) {
  //     return <MuiAlert elevation={6} variant="filled" {...props} />;
  // }

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

  const [columnasDinamicas, setColumnasDinamicas] = useState([]);

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

    selectedRange.startRowIndex = dataGridRef.current._instance.getRowIndexByKey(dataGridRef.current._instance.getSelectedRowKeys()[0]);
    selectedRange.endRowIndex = dataGridRef.current._instance.getRowIndexByKey(dataGridRef.current._instance.getSelectedRowKeys()[0]);
    selectedRange.startColumnIndex = 5; // 5 es el número de columnas fijas
    selectedRange.endColumnIndex = 5 + selectedRowData.TOT_DIAS_RESERVAS - 1;

    showSelectionCompleteRow(selectedRange);
    eventoSeleccionarClick(e, selectedRowData);
  };

  return (
    <Fragment>
      <HeaderInformation
        data={props.getInfo()}
        visible={true}
        labelLocation={"left"}
        colCount={6}
        toolbar={
          <PortletHeader
            title={""}
            toolbar={
              <PortletHeaderToolbar>
                <Button
                  id="btnBuscar"
                  icon="fa fa-search"
                  type="default"
                  hint={intl.formatMessage({ id: "ACTION.SEARCH" })}
                  // onClick={(e) => {
                  //     ////console.log(servicioSeleccionados);
                  //     let result = e.validationGroup.validate();
                  //     let fl = !result.isValid;
                  //     setEvaluarRequerido(fl);
                  //     if (fl) {
                  //         return;
                  //     }
                  //     buscarReservas(0, PaginationSetting.TOTAL_RECORDS);
                  // }}
                  onClick={e => buscarReservas_onClick(e, false)}
                  useSubmitBehavior={true}
                  validationGroup="FormEdicion"
                  visible={props.modoEdicion}
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
                  visible={props.modoEdicion}
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
        <React.Fragment>
          <Form formData={props.dataRowEditNew} validationGroup="FormEdicion">
            <GroupItem itemType="group" colCount={2} colSpan={2}>
              <div className="row">
                <div className="col-md-6">
                  <fieldset className="scheduler-border" >
                    <legend className="scheduler-border" > <h5>{intl.formatMessage({ id: "CAMP.RESERVATION.GENERAL" })} </h5></legend>
                    {renderReserva()}
                  </fieldset>
                </div>

                <div className="col-md-6">
                  <fieldset className="scheduler-border" >
                    <legend className="scheduler-border" >
                      <h5>{intl.formatMessage({ id: "CAMP.PROFILE.MENU" })} </h5>
                    </legend>
                    {renderCampamento()}
                  </fieldset>
                </div>
              </div>
            </GroupItem>

            <GroupItem name="grupo_pasajeros" colCount={4}>
              {visibleCamaExclusiva ? (
                <DivMensajeCamaExclusiva>
                  {msgCamaExclusiva}
                </DivMensajeCamaExclusiva>
              ) : null}
            </GroupItem>
            <GroupItem name="grupo_pasajeros" colCount={4}>
              <Item colSpan={4}>
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

          {/* <PortletHeader
            title={""}
            toolbar={
              <PortletHeaderToolbar> */}
          <div className="row" style={{ marginTop: '-26px', marginBottom: '10px' }}>
            <div className="col-3 offset-9" style={{ textAlign: 'right', paddingRight: '14px' }}>
              <Button
                className="button-yellow narrow-button"
                icon="fa fa-check"
                type="default"
                text={`${intl.formatMessage({ id: "CASINO.COMPANY.GROUP.TOSELECT" })} ${intl.formatMessage({ id: "CAMP.ROOM.BED" })}`}
                onClick={seleccionarFila}
                useSubmitBehavior={true}
              />
            </div>
          </div>
          {/* </PortletHeaderToolbar>
            }
          /> */}

          <div className="row row_max_width">
            <div className="col-12">
              <input
                type="hidden"
                value={tramaPintar}
                id="hidTrama"
                name="hidTrama"
              />
              <DataGridDynamic
                id="datagrid_sin_sombra"
                intl={intl}
                dataGridRef={dataGridRef}
                dataSource={listaParaReserva}
                staticColumns={columnasEstaticas}
                dynamicColumns={columnasDinamicas}
                isLoadedResults={viewPagination}
                setIsLoadedResults={setViewPagination}
                refreshDataSource={buscarReservas}
                keyExpr={"RowIndex"} //IdCama
                selectionMode="single"
                events={{
                  onCellPrepared: onCellPreparedDay,
                  onCellDblClick: seleccionarCuadro,
                  onCellClick: onCellClick,
                  onCellHoverChanged: e => onCellHoverChanged(e),
                  onContextMenuPreparing: onContextMenuPreparing
                }}

              />
            </div>
          </div>

          {/* <div className="row row_max_width"></div> */}
        </React.Fragment>
      </PortletBody>

      <ReservaDetallePersonaPopup
        isVisiblePopupDetalle={isVisiblePopupDetalle}
        setIsVisiblePopupDetalle={setIsVisiblePopupDetalle}
        datosReservaDetalle={datosReservaDetalle}
      />

      <Confirm
        message={mensajeConfirm}
        isVisible={isVisibleConfirm}
        setIsVisible={setIsVisibleConfirm}
        setInstance={setInstance}
        onConfirm={confirmGrabar}
        title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
        confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
        cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
        size="lg"
      />
    </Fragment>
  );
};

export default injectIntl(WithLoandingPanel(ReservaEditPage));
