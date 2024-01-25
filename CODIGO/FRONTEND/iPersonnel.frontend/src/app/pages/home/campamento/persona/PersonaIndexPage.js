import React, { useEffect, useState } from "react";
import {
  handleErrorMessages,
  handleSuccessMessages,
  handleWarningMessages,
  handleInfoMessages
} from "../../../../store/ducks/notify-messages";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import Confirm from "../../../../partials/components/Confirm";

import { useSelector } from "react-redux";
import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";
import { servicePersona } from "../../../../api/administracion/persona.api";
import { obtener as obtenerFoto } from "../../../../api/administracion/personaFoto.api";
import PersonaListPage from "../../administracion/persona/PersonaListPage";
import PersonaEditTabPage from "../../administracion/persona/PersonaEditTabPage";
import PersonaFotoEditPage from "../../administracion/persona/PersonaFotoEditPage";
import PersonaContratoIndexPage from "../../administracion/persona/contrato/PersonaContratoIndexPage";
import AvatarFoto from "../../../../partials/content/avatarFoto";
import {
  isNotEmpty,
  validarUsoLicencia,
  dateFormat,
  TYPE_SISTEMA_ENTIDAD
} from "../../../../../_metronic";
import FormatListNumberedIcon from "@material-ui/icons/FormatListNumbered";
import AccountCircleOutlinedIcon from "@material-ui/icons/AccountCircleOutlined";
import DescriptionIcon from "@material-ui/icons/Description";
import LocalMallOutlinedIcon from "@material-ui/icons/LocalMallOutlined";
import AirlineSeatFlatAngled from "@material-ui/icons/AirlineSeatFlatAngled";
import SupervisedUserCircle from "@material-ui/icons/SupervisedUserCircle";

import {
  useStylesEncabezado,
  useStylesTab
} from "../../../../store/config/Styles";

import { injectIntl } from "react-intl";
import ArrayStore from "devextreme/data/array_store";
import DataSource from "devextreme/data/data_source";

import ReservaListPage from "../reserva/ReservaListPage";
import ReservaEditPage from "../reserva/ReservaEditPage";
import {
  getStartAndEndOfMonthByDay,
  convertyyyyMMddToFormatDate,
  convertyyyyMMddToDate
} from "../../../../../_metronic/utils/utils";
import {
  crear as crearReserva,
  actualizar as actualizarReserva,
  reservas as listarReservas
} from "../../../../api/campamento/reserva.api";

import {
  reservasPorPersona as listarReservasPersona,
  obtener as obtenerReserva,
  eliminar as eliminarReservas,
  checkin,
  checkout
} from "../../../../api/campamento/reserva.api";

import PersonaPerfilIndexPage from "./perfil/PersonaPerfilIndexPage";

import { eliminar as eliminarReservasDias } from "../../../../api/campamento/reservadia.api";
import CamaExclusivaListPage from "../camaExclusiva/CamaExclusivaListPage";
import CamaExclusivaEditPage from "../camaExclusiva/CamaExclusivaEditPage";
import {
  crear as crearExclusiva,
  actualizar as actualizarExclusiva,
  obtener as obtenerExclusiva,
  eliminar as eliminarExclusiva,
  listar as listarExclusiva
} from "../../../../api/campamento/camaExclusiva.api";

import {
  getButtonPermissions,
  defaultPermissions,
  setDisabledTabs,
  getDisableTab
} from "../../../../../_metronic/utils/securityUtils";
import { listar as listarCampamentos } from "../../../../api/campamento/campamento.api";

import TabNavContainer from "../../../../partials/components/Tabs/TabNavContainer";

//Combos
import { listarPerfilActual as listarPerfilPersona } from "../../../../api/campamento/personaPerfil.api";
import { campamentos as listarCampamentosByPerfil } from "../../../../api/campamento/perfilDetalle.api";
import { listar as listarModulo } from "../../../../api/campamento/tipoModulo.api";
import { listar as listarTipoHabitacion } from "../../../../api/campamento/tipoHabitacion.api";
import { listar as listarServicios } from "../../../../api/campamento/servicio.api";
import { regimen as personasRegimen } from "../../../../api/administracion/personaRegimen.api";


export const initialFilter = {
  IdCliente: "",
  Activo: "S",
  Condicion: "TRABAJADOR"
};

export const initialFilterMarcas = {
  IdCliente: "",
  IdPersona: "",
  TipoMarca: "T", //T: Persona
  FlFecha: "3", //Para obtener marcas en un rango de fecha truncadas en dias.
  FechaMarca: Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate()
  ),
  FechaInicio: new Date(),//EGSC
  FechaFin: new Date()//EGSC
};

const PersonaIndexPage = props => {
  const usuario = useSelector(state => state.auth.user);
  const perfil = useSelector(state => state.perfil.perfilActual);
  const { intl, setLoading, dataMenu } = props;
  const [listarTabs, setListarTabs] = useState([]);

  const [focusedRowKey, setFocusedRowKey] = useState();
  const [varIdPersona, setVarIdPersona] = useState("");
  //const [nombrePersona, setNombrePersona] = useState("");
  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const [titulo, setTitulo] = useState(
    intl.formatMessage({ id: "ACTION.LIST" })
  );

  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
  const [dataRowEditNewTabs, setDataRowEditNewTabs] = useState({});
  const [tituloTabs, setTituloTabs] = useState(
    intl.formatMessage({ id: "ACTION.LIST" })
  );

  const classes = useStylesTab();
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    //Estado cambio de tabs
    setValue(newValue);
    setTabIndex(newValue);
  };
  const [fotoPerfil, setFotoPerfil] = useState("");

  //Datos principales
  const [selected, setSelected] = useState({});
  const [selectedDelete, setSelectedDelete] = useState({});

  const [tabIndex, setTabIndex] = useState(0);
  const [nivelDelete, setNivelDelete] = useState(0);
  const [mensajeEliminar, setMensajeEliminar] = useState(
    intl.formatMessage({ id: "ALERT.REMOVE" })
  );

  const [fechasContrato, setFechasContrato] = useState({
    FechaInicioContrato: null,
    FechaFinContrato: null
  });

  //FILTRO
  const [isFirstDataLoad, setIsFirstDataLoad] = useState(true);
  const [refreshData, setRefreshData] = useState(false);
  const ds = new DataSource({
    store: new ArrayStore({ data: [], key: "RowIndex" }),
    reshapeOnPush: false
  });
  const [dataSource] = useState(ds);

  const refresh = () => dataSource.refresh();
  const resetLoadOptions = () => dataSource.resetLoadOptions();

  const [isVisible, setIsVisible] = useState(false);
  const [instance, setInstance] = useState({});

  //Reservas:
  const [reservas, setReservas] = useState([]);

  const [combosReserva, setCombosReservas] = useState({
    Perfiles: [],
    Campamentos: [],
    TipoHabitacion: [],
    TipoModulos: [],
    Servicios: [],
    Regimen: []
  });
  /*********************************************************** */
  //console.log(dataMenu);
  const [accessButton, setAccessButton] = useState(defaultPermissions);
  const [dataCombos, setDataCombos] = useState([]);

  //++++++++Variable (totalRowIndex) para controlar bloqueo de tabs cuando se cambia de búsqueda de un registro en la grilla.++++++++++++++
  const [totalRowIndex, setTotalRowIndex] = useState(0);

  /*********************************************************** */
  //:::::::::::::::::::::::::::::::::::::::::::::-funciones-:::::::::::::::::::::::::::::::::

  async function cargarCombos() {
    setLoading(true);
    let array = [];
    setDataCombos([]);
    await servicePersona
      .listarCombosPersona({ IdPais: perfil.IdPais })
      .then(data => {
        array.push(
          data[0].filter(k => k.IdEntidad === TYPE_SISTEMA_ENTIDAD.PERSONAS)
        ); // Combo Tipo Documentos
        array.push(data[1]); // Combo Tipo de Sangre
        array.push(data[2]); // Combo Estado Civil
        array.push(data[3]); // Combo Licencia Conducir
        setDataCombos(array);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  async function obtenerPersona(
    idPersona,
    validateSensitiveInformation = false
  ) { 
    setLoading(true);
    let persona;
    const { IdPersona, IdCliente } = selected;
    if (isNotEmpty(idPersona)) {
      persona = await servicePersona
        .obtener({ IdPersona, IdCliente })
        .catch(err => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err);
        });

      if (validateSensitiveInformation) {
        clearSensitiveInformation(dataMenu.protecion_datos, persona);
      }
      setDataRowEditNew({ ...persona, esNuevoRegistro: false }); 
    }
    setLoading(false);
  }

  const cancelarEdicion = () => {
    changeTabIndex(0);
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
    setDataRowEditNewTabs({});
  };

  const seleccionarRegistro = async dataRow => {
    const { IdPersona, RowIndex } = dataRow;
    setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
    //console.log("seleccionarRegistro", dataRow);
    //console.log("seleccionarRegistro", varIdPersona);

    if (IdPersona !== varIdPersona) {
      setSelected(dataRow);
      setVarIdPersona(IdPersona);
      //await obtenerPersonaFoto(IdPersona, true);
      obtenerFotoPerfilLocal(dataRow);
      setFocusedRowKey(RowIndex);
      //setModoDetalle(true);
    }
  };

  const verRegistroDblClick = async dataRow => {
    changeTabIndex(1);
    await obtenerPersona(dataRow.IdPersona, true);
  };

  function clearSensitiveInformation(input, target) {
    input.forEach(element => {
      let hasProperty = target.hasOwnProperty(element.Campo);
      if (hasProperty) {
        target[element.Campo] = " ";
      }
    });
  }

  useEffect(() => {
    cargarCombos();
  }, []);

  //:::::::::::::::::::::::::::::::::::::::::::::-funciones-persona-foto:::::::::::::::::::::::::::::::::
  function obtenerFotoPerfilLocal(dataRow) {
    const { FotoPC } = dataRow;
    setFotoPerfil(FotoPC);
  }

  async function obtenerPersonaFoto(idPersona, esPerfil) {
    setLoading(true);
    const { IdPersona, IdCliente } = selected;
    await obtenerFoto({ IdPersona, IdCliente })
      .then(personaFoto => {
        if (isNotEmpty(personaFoto)) {
          setFotoPerfil(personaFoto.FotoPC); //if (esPerfil)
          setDataRowEditNewTabs({ ...personaFoto, esNuevoRegistro: false });
        } else {
          setFotoPerfil("");
          setDataRowEditNewTabs({ ...selected, esNuevoRegistro: true });
        }
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  const changeTabIndex = index => {
    handleChange(null, index);
  };

  const getInfo = () => {
    const { Nombre, Apellido } = selected;
    return [
      {
        text: [intl.formatMessage({ id: "COMMON.CODE" })],
        value: varIdPersona,
        colSpan: 2
      },
      {
        text: [intl.formatMessage({ id: "ADMINISTRATION.PERSON.NAME" })],
        value: Nombre + " " + Apellido,
        colSpan: 4
      }
    ];
  };

  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  //Reservas
  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  const loadCombosNewReservation = async () => {
    const { IdCliente, IdDivision } = perfil;
    const IdPersona = varIdPersona;
    const FechaInicio = dateFormat(dataRowEditNew.FechaInicio, "yyyyMMdd");
    const FechaFin = dateFormat(dataRowEditNew.FechaFin, "yyyyMMdd");

    let [
      tmp_perfiles,
      tmp_campamentos,
      tmp_tipoHabitaciones,
      tmp_tipomodulos,
      tmp_Servicios,
      tmp_regimen
    ] = await Promise.all([
      listarPerfilPersona({ IdCliente, IdDivision, IdPersona, IdPerfil: "", flDetalle: "S", FechaInicio, FechaFin }),
      listarCampamentosByPerfil({ IdCliente, IdDivision, IdPerfil: "" }),
      listarTipoHabitacion({ IdCliente, IdDivision, numPagina: 0, tamPagina: 0 }),
      listarModulo({ IdCliente, IdDivision, numPagina: 0, tamPagina: 0 }),
      listarServicios({ IdCliente, IdDivision, numPagina: 0, tamPagina: 0 }),
      personasRegimen({ IdCliente, IdDivision, IdPersona })
    ]);


    ////console.log("se carga campamento", cargaCampamentoPerfil);
    if (tmp_perfiles.length > 0) {
      tmp_perfiles.unshift({ IdPerfil: "", Perfil: "-- Todos --" });

      //Se obtiene el perfil por fecha: 
      let perfilDefault = tmp_perfiles.find(x => x.Selected === "S")

      //console.log("Setear perfil", { perfilDefault, tmp_perfiles });

      setDataRowEditNew(prev => ({
        ...prev,
        IdPerfil: (!!perfilDefault) ? perfilDefault.IdPerfil : ""
      }));

    }
    if (tmp_tipoHabitaciones.length > 0) {
      tmp_tipoHabitaciones.unshift({ IdTipoHabitacion: "", TipoHabitacion: "-- Todos --" });
    }
    if (tmp_tipomodulos.length > 0) {
      tmp_tipomodulos.unshift({ IdTipoModulo: "", TipoModulo: "-- Todos --" });
    }




    setCombosReservas({
      Perfiles: tmp_perfiles,
      Campamentos: tmp_campamentos,
      TipoModulos: tmp_tipomodulos,
      TipoHabitacion: tmp_tipoHabitaciones,
      Servicios: tmp_Servicios.map(x => ({
        IdServicio: x.IdServicio,
        Servicio: x.Servicio,
        Check: true
      })),
      Regimen: tmp_regimen
    });
  }

  const nuevoRegistro = async (FechaInicio, FechaFin) => {
    let rangeOk = false;
    setLoading(true); 
    await servicePersona
      .obtenerPeriodo({
        IdPersona: varIdPersona,
        FechaInicio: dateFormat(FechaInicio, "yyyyMMdd"),//egsc
        FechaFin: dateFormat(FechaFin, "yyyyMMdd")
      })
      .then(response => {
        //console.log("obtenerPeriodo|response:", response);
        if (response) {
          if (!isNotEmpty(response.MensajeValidacion)) {
            rangeOk = true;
            setFechasContrato({
              FechaInicioContrato: response.FechaInicio,
              FechaFinContrato: response.FechaFin
            });
          } else {
            setFechasContrato({
              FechaInicioContrato: null,
              FechaFinContrato: null
            });
            handleInfoMessages(
              intl.formatMessage({ id: "MESSAGES.INFO" }),
              response.MensajeValidacion
            );
          }
        }
      });

    if (rangeOk) {
      let nextRow = true;

      //Se cagan los combos de filtro:
      await loadCombosNewReservation();

      await validarUsoLicencia({
        IdCliente: perfil.IdCliente,
        IdModulo: dataMenu.info.IdModulo
      }).then(response => {
        nextRow = response;

        if (nextRow) {
          let datoEvaluar = {
            IdReserva: 0,
            FechaInicio,
            FechaFin,
            Activo: "S",
            esNuevoRegistro: true,
            IdPersona: varIdPersona,
            IdTipoHabitacion: "",
            IdTipoModulo: "",
            conCamas: 2,
          };

          //console.log("Se envia:", { data: { ...dataRowEditNew }, datoEvaluar });
          setDataRowEditNew(prev => ({ ...prev, ...datoEvaluar }));
          setTituloTabs(intl.formatMessage({ id: "ACTION.NEW" }));
          setLoading(false);
          setModoEdicion(true);
        }
      });
    }else{
      setLoading(false); 
    }
  };

  const cancelarEdicionReserva = () => {
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
    setDataRowEditNewTabs({});
  };

  const grabarReservasPersona = async nuevasReservas => {
    nuevasReservas = nuevasReservas.map(x => ({
      Fecha: x.Fecha,
      IdCama: x.IdCama,
      IdHabitacion: x.IdHabitacion,
      IdModulo: x.IdModulo
    }));

    let {
      FechaInicio,
      FechaFin,
      IdCampamento,
      FlgCamaExclusiva
    } = dataRowEditNew;

    FlgCamaExclusiva = isNotEmpty(FlgCamaExclusiva) ? FlgCamaExclusiva : "N";

    let param = {
      IdCliente: perfil.IdCliente,
      IdDivision: perfil.IdDivision,
      IdCampamento,
      IdPersona: varIdPersona,
      FechaInicio: dateFormat(FechaInicio, "yyyyMMdd"), //new Date(FechaInicio).toLocaleString(),
      FechaFin: dateFormat(FechaFin, "yyyyMMdd"), //new Date(FechaFin).toLocaleString(),
      Turno: "F", //Por ahora FULL
      Estado: "P", //Pendientes
      IdUsuario: usuario.username,
      reservas: JSON.stringify(nuevasReservas),
      FlgCamaExclusiva: FlgCamaExclusiva
    };

    // console.log("Se envian los parametros",{param});
    //crearReserva:
    await crearReserva(param)
      .then(response => {
        // if (response)
        handleSuccessMessages(
          intl.formatMessage({ id: "MESSAGES.SUCESS" }),
          intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" })
        );

        let { FechaInicio, FechaFin } = getStartAndEndOfMonthByDay(new Date());
        FechaFin = new Date(
          FechaFin.getFullYear(),
          FechaFin.getMonth() + 1,
          FechaFin.getDate()
        );
        //console.log("Dispara desde el grabar");
        buscarReservas(FechaInicio, FechaFin);
        setModoEdicion(false);
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const actualizarReservasPersona = async nuevasReservas => {
    nuevasReservas = nuevasReservas.map(x => ({
      Fecha: x.Fecha,
      IdCama: x.IdCama,
      IdHabitacion: x.IdHabitacion,
      IdModulo: x.IdModulo
    }));

    let { FechaInicio, FechaFin, IdCampamento, IdReserva } = dataRowEditNew;

    let param = {
      IdCliente: perfil.IdCliente,
      IdDivision: perfil.IdDivision,
      IdCampamento,
      IdPersona: varIdPersona,
      FechaInicio: dateFormat(FechaInicio, "yyyyMMdd"), //new Date(FechaInicio).toLocaleString(),
      FechaFin: dateFormat(FechaFin, "yyyyMMdd"), //new Date(FechaFin).toLocaleString(),
      Turno: "F", //Por ahora FULL
      Estado: "P", //Pendientes
      IdUsuario: usuario.username,
      reservas: JSON.stringify(nuevasReservas),
      IdReserva
    };

    //crearReserva:
    await actualizarReserva(param)
      .then(response => {
        // if (response)
        handleSuccessMessages(
          intl.formatMessage({ id: "MESSAGES.SUCESS" }),
          intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" })
        );
        setModoEdicion(false);

        let { FechaInicio, FechaFin } = getStartAndEndOfMonthByDay(new Date());
        FechaFin = new Date(
          FechaFin.getFullYear(),
          FechaFin.getMonth() + 1,
          FechaFin.getDate()
        );

        buscarReservas(FechaInicio, FechaFin);
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const retornarReserva = async infoData => {
    let objReserva = [];
    //setLoading(true);
    //console.log(infoData);

    let param = {
      IdCliente: perfil.IdCliente,
      IdDivision: perfil.IdDivision,
      IdCampamento: infoData.IdCampamento,
      IdReserva: infoData.IdReserva,
      //Fecha: convertyyyyMMddToDate(infoData.Fecha).toLocaleString(),
      Fecha: infoData.Fecha // dateFormat( new Date(infoData.Fecha) , "yyyyMMdd")
    };

    await obtenerReserva(param)
      .then(resp => {
        objReserva = resp;
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err);
        objReserva = [];
      })
      .finally(() => {
        /*setLoading(false); */
      });

    return objReserva;
  };
  //  FechaInicio: new Date(FechaInicio).toLocaleString(),

  const buscarReservas = async (FechaInicio, FechaFin) => {
    setLoading(true);
    //let { IdPersona } = props.dataRowEditNew

    //console.log("Consultando del ", FechaInicio, " al ", FechaFin);

    await listarReservasPersona({
      IdCliente: perfil.IdCliente,
      IdDivision: perfil.IdDivision,
      IdCampamento: "",
      IdTipoModulo: "",
      IdTipoHabitacion: "",
      IdModulo: "",
      IdHabitacion: "",
      IdCama: "",
      IdTipoCama: "",
      FechaInicio: dateFormat(FechaInicio, "yyyyMMdd"), //new Date(FechaInicio).toLocaleString(),
      FechaFin: dateFormat(FechaFin, "yyyyMMdd"), //new Date(FechaFin).toLocaleString(),
      IdPersona: varIdPersona
      //servicios: "",
    })
      .then(resp => {
        //console.log("resp==>", resp);
        let infoReservas = resp.resultados.map(x => ({
          ...x,
          text: x.IdCama,
          startDate: x.Fecha,
          endDate: x.Fecha
        }));
        //console.log("buscarReservas FechaInicio", { FechaInicio, FechaFin });
        setDataRowEditNew({ ...dataRowEditNew, FechaInicio, FechaFin });

        //console.log("---------------------------------");
        //console.log(infoReservas);
        //console.log("---------------------------------");
        setReservas(infoReservas);
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const buscarDisponibilidadReservas = async (servicios, skip, take) => {
    setLoading(true);
    let {
      IdCampamento,
      IdTipoModulo,
      IdTipoHabitacion,
      FechaInicio,
      FechaFin,
      conCamas,
      IdReserva,
      IdPerfil
    } = dataRowEditNew;

    let strServicios = servicios
      .filter(x => x.Check)
      .map(x => x.IdServicio)
      .join("|");

    let datosReserva = await listarReservas({
      IdCliente: perfil.IdCliente,
      IdDivision: perfil.IdDivision,
      IdCampamento,
      IdTipoModulo,
      IdTipoHabitacion,
      IdModulo: "",
      IdHabitacion: "",
      IdCama: "",
      IdTipoCama: "",
      FechaInicio: dateFormat(FechaInicio, "yyyyMMdd"), // new Date(FechaInicio).toLocaleString(), //Cambiar
      FechaFin: dateFormat(FechaFin, "yyyyMMdd"), // new Date(FechaFin).toLocaleString(), //Cambiar
      IdPersona: varIdPersona,
      servicios: strServicios,
      conCamas,
      IdReserva,
      IdPerfil,
      skip,
      take,
      OrderField: "TipoModulo",
      OrderDesc: 0
    })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err);
        return { IdErro: 1, reservas: [] };
      })
      .finally(() => {
        setLoading(false);
      });

    //console.log("----------->", datosReserva);
    if (typeof datosReserva === "object" && datosReserva !== null) {
      datosReserva.IdError = 0;
      return datosReserva;
    } else {
      return { IdErro: 1, reservas: [] };
    }

    return datosReserva;
  };

  const eliminarReserva = async data => {
    //console.log("eliminarReserva|data:", data);

    let param = {
      IdCliente: perfil.IdCliente,
      IdDivision: perfil.IdDivision,
      IdCampamento: data.IdCampamento,
      IdReserva: data.IdReserva
    };

    setLoading(true);
    await eliminarReservas(param)
      .then(response => {
        handleSuccessMessages(
          intl.formatMessage({ id: "MESSAGES.SUCESS" }),
          intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" })
        );

        setDataRowEditNew({});
        /*let { FechaInicio, FechaFin } = getStartAndEndOfMonthByDay(new Date());
     FechaFin = new Date(FechaFin.getFullYear(), FechaFin.getMonth() + (1), FechaFin.getDate());*/
        let fechaInicio = dataRowEditNew.FechaInicio;
        let { FechaInicio, FechaFin } = getStartAndEndOfMonthByDay(
          fechaInicio,
          2
        );
        buscarReservas(FechaInicio, FechaFin);
        setModoEdicion(false);
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const eliminarReservaDia = async data => {   
    let param = {
      IdCliente: perfil.IdCliente,
      IdDivision: perfil.IdDivision,
      IdCampamento: data.IdCampamento,
      IdReserva: data.IdReserva,
      Fecha: data.Fecha,
      IdUsuario: usuario.username
    };

    setLoading(true);
    await eliminarReservasDias(param)
      .then(response => {
        handleSuccessMessages(
          intl.formatMessage({ id: "MESSAGES.SUCESS" }),
          intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" })
        );

        setDataRowEditNew({});
        /*let { FechaInicio, FechaFin } = getStartAndEndOfMonthByDay(new Date());
     FechaFin = new Date(FechaFin.getFullYear(), FechaFin.getMonth() + (1), FechaFin.getDate());*/
        let fechaInicio = dataRowEditNew.FechaInicio;
        let { FechaInicio, FechaFin } = getStartAndEndOfMonthByDay(
          fechaInicio,
          2
        );
        buscarReservas(FechaInicio, FechaFin);
        setModoEdicion(false);
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const editarReservas = async data => {
    //Obtener reserva actual
    //validar estado de la reserva
    //Setear la disponbilidad
    //Cargar pantalla de nuevo

    setLoading(true);
    //console.log("Se edita: ", data);

    let infoReserva = await retornarReserva(data);

    //console.log("datosReserva", infoReserva);

    let datoEvaluar = {
      IdReserva: infoReserva.IdReserva,
      FechaInicio: infoReserva.FechaInicio,
      FechaFin: infoReserva.FechaFin,
      IdCampamento: infoReserva.IdCampamento,
      Activo: "S",
      esNuevoRegistro: false,
      IdPersona: varIdPersona,
      IdPerfil: "",
      IdTipoHabitacion: "",
      IdTipoModulo: "",
      conCamas: 0,
      IdReserva: infoReserva.IdReserva
    };

    //console.log("datosReserva: ", datoEvaluar);
    setDataRowEditNew(datoEvaluar);
    setTituloTabs(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
    setLoading(false);
    /*
     let datoEvaluar = {
                FechaInicio: dataRowEditNew.FechaInicio,
                FechaFin: dataRowEditNew.FechaFin,
                Activo: "S",
                esNuevoRegistro: true,
                IdPersona: varIdPersona,
                IdPerfil: '',
                IdTipoHabitacion: '',
                IdTipoModulo: '',
                conCamas: 2
            };
            setDataRowEditNew(datoEvaluar);
            setTituloTabs(intl.formatMessage({ id: "ACTION.NEW" }));
            setModoEdicion(true);
    */
  };

  const reservaCheckIn = async data => {
    //console.log("Se realiza reservaCheckIn: ", data);
    //----------------------------------------------
    let param = {
      IdCliente: perfil.IdCliente,
      IdDivision: perfil.IdDivision,
      IdCampamento: data.IdCampamento,
      IdReserva: data.IdReserva,
      Fecha: data.Fecha,
      IdUsuario: usuario.username
    };

    setLoading(true);
    await checkin(param)
      .then(response => {
        handleSuccessMessages(
          intl.formatMessage({ id: "MESSAGES.SUCESS" }),
          "Check-In realizado con éxito"
        );
        setDataRowEditNew({});
        /*let { FechaInicio, FechaFin } = getStartAndEndOfMonthByDay(new Date());
      FechaFin = new Date(FechaFin.getFullYear(), FechaFin.getMonth() + (1), FechaFin.getDate());*/
        let fechaInicio = dataRowEditNew.FechaInicio;
        let { FechaInicio, FechaFin } = getStartAndEndOfMonthByDay(
          fechaInicio,
          2
        );
        buscarReservas(FechaInicio, FechaFin);
        setModoEdicion(false);
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const reservaCheckOut = async data => {
    //console.log("Se realiz reservaCheckOut: ", data);

    //----------------------------------------------
    let param = {
      IdCliente: perfil.IdCliente,
      IdDivision: perfil.IdDivision,
      IdCampamento: data.IdCampamento,
      IdReserva: data.IdReserva,
      IdUsuario: usuario.username,
      Fecha: data.Fecha
    };

    setLoading(true);
    await checkout(param)
      .then(response => {
        handleSuccessMessages(
          intl.formatMessage({ id: "MESSAGES.SUCESS" }),
          "Check-Out realizado con éxito"
        );
        setDataRowEditNew({});
        /*let { FechaInicio, FechaFin } = getStartAndEndOfMonthByDay(new Date());
      FechaFin = new Date(FechaFin.getFullYear(), FechaFin.getMonth() + (1), FechaFin.getDate());*/
        let fechaInicio = dataRowEditNew.FechaInicio;
        let { FechaInicio, FechaFin } = getStartAndEndOfMonthByDay(
          fechaInicio,
          2
        );
        buscarReservas(FechaInicio, FechaFin);
        setModoEdicion(false);
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  //:::::::::::::::::::::::::::::::::::::::::::::-FUNCION GRUPO PERSONA:::::::::::::::::::::::::::::::::

  async function agregarCamaExclusiva(dataCamaExclusiva) {
    setLoading(true);
    const {
      IdCampamento,
      IdModulo,
      IdHabitacion,
      IdCama,
      FechaInicio,
      FechaFin,
      Activo
    } = dataCamaExclusiva;
    let params = {
      IdCliente: perfil.IdCliente,
      IdPersona: varIdPersona,
      IdSecuencial: 0,
      IdDivision: perfil.IdDivision,
      IdCampamento: isNotEmpty(IdCampamento) ? IdCampamento : "",
      IdModulo: isNotEmpty(IdModulo) ? IdModulo : "",
      IdHabitacion: isNotEmpty(IdHabitacion) ? IdHabitacion : "",
      IdCama: isNotEmpty(IdCama) ? IdCama : "",
      FechaInicio: isNotEmpty(FechaInicio) ? FechaInicio : "",
      FechaFin: isNotEmpty(FechaFin) ? FechaFin : "",
      Activo: Activo,
      IdUsuario: usuario.username
    };
    await crearExclusiva(params)
      .then(response => {
        if (response)
          handleSuccessMessages(
            intl.formatMessage({ id: "MESSAGES.SUCESS" }),
            intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" })
          );
        listarCamaExclusiva();
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  async function actualizarCamaExclusiva(dataRow) {
    setLoading(true);
    const {
      IdCliente,
      IdPersona,
      IdSecuencial,
      IdDivision,
      IdCampamento,
      IdModulo,
      IdHabitacion,
      IdCama,
      FechaInicio,
      FechaFin,
      Activo
    } = dataRow;
    let params = {
      IdCliente: IdCliente,
      IdPersona: IdPersona,
      IdSecuencial: IdSecuencial,
      IdDivision: IdDivision,
      IdCampamento: isNotEmpty(IdCampamento) ? IdCampamento : "",
      IdModulo: isNotEmpty(IdModulo) ? IdModulo : "",
      IdHabitacion: isNotEmpty(IdHabitacion) ? IdHabitacion : "",
      IdCama: isNotEmpty(IdCama) ? IdCama : "",
      FechaInicio: isNotEmpty(FechaInicio) ? FechaInicio : "",
      FechaFin: isNotEmpty(FechaFin) ? FechaFin : "",
      Activo: Activo,
      IdUsuario: usuario.username
    };
    await actualizarExclusiva(params)
      .then(() => {
        handleSuccessMessages(
          intl.formatMessage({ id: "MESSAGES.SUCESS" }),
          intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" })
        );
        listarCamaExclusiva();
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  async function eliminarRegistroCamaExclusiva(dataRow, confirm) {
    setSelectedDelete(dataRow);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdCliente, IdPersona, IdSecuencial } = selectedDelete;
      await eliminarExclusiva({
        IdCliente,
        IdPersona,
        IdSecuencial
      })
        .then(() => {
          handleSuccessMessages(
            intl.formatMessage({ id: "MESSAGES.SUCESS" }),
            intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" })
          );
        })
        .catch(err => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err);
        })
        .finally(() => {
          setLoading(false);
        });
      listarCamaExclusiva();
    }
  }

  async function listarCamaExclusiva() {
    setLoading(true);
    await listarExclusiva({
      IdCliente: perfil.IdCliente,
      IdDivision: perfil.IdDivision,
      IdPersona: varIdPersona,
      NumPagina: 0,
      TamPagina: 0
    })
      .then(data => {
        setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
        setListarTabs(data);
        //console.log("listarCamaExclusiva-data", data);
        setModoEdicion(false);
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  async function obtenerCamaExclusiva(dataRow) {
    setLoading(true);
    const { IdCliente, IdPersona, IdSecuencial } = dataRow;
    await obtenerExclusiva({
      IdCliente,
      IdPersona,
      IdSecuencial
    })
      .then(CamaExclusiva => {
        //console.log("obtenerCamaExclusiva|CamaExclusiva:", CamaExclusiva);
        setDataRowEditNew({ ...CamaExclusiva, esNuevoRegistro: false });
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  const editarRegistroCamaExclusiva = async dataRow => {
    let { IdPersona } = dataRow;

    await servicePersona
      .obtenerPeriodo({
        IdPersona: IdPersona,
        FechaInicio: dateFormat(new Date(), "yyyyMMdd"),
        FechaFin: dateFormat(new Date(), "yyyyMMdd")
      })
      .then(response => {
        if (response) {
          if (!isNotEmpty(response.MensajeValidacion)) {
            setFechasContrato({
              FechaInicioContrato: response.FechaInicio,
              FechaFinContrato: response.FechaFin
            });
          } else {
            setFechasContrato({
              FechaInicioContrato: null,
              FechaFinContrato: null
            });
            handleInfoMessages(
              intl.formatMessage({ id: "MESSAGES.INFO" }),
              response.MensajeValidacion
            );
          }
        }
      });

    setModoEdicion(true);
    setTituloTabs(intl.formatMessage({ id: "ACTION.EDIT" }));
    obtenerCamaExclusiva(dataRow);
  };

  const nuevoRegistroTabsCamaExclusiva = async () => {
    let _return = false;

    await servicePersona
      .obtenerPeriodo({
        IdPersona: varIdPersona,
        FechaInicio: dateFormat(new Date(), "yyyyMMdd"),
        FechaFin: dateFormat(new Date(), "yyyyMMdd")
      })
      .then(response => {
        if (response) {
          if (!isNotEmpty(response.MensajeValidacion)) {
            _return = true;
            setFechasContrato({
              FechaInicioContrato: response.FechaInicio,
              FechaFinContrato: response.FechaFin
            });
          } else {
            setFechasContrato({
              FechaInicioContrato: null,
              FechaFinContrato: null
            });
            handleInfoMessages(
              intl.formatMessage({ id: "MESSAGES.INFO" }),
              response.MensajeValidacion
            );
          }
        }
      });

    if (_return) {
      let nextRow = true;
      await validarUsoLicencia({
        IdCliente: perfil.IdCliente,
        IdModulo: dataMenu.info.IdModulo
      }).then(response => {
        nextRow = response;

        if (nextRow) {
          let nuevo = { Activo: "S" };
          setDataRowEditNew({
            ...nuevo,
            esNuevoRegistro: true,
            FechaInicio: new Date()
          });
          setTituloTabs(intl.formatMessage({ id: "ACTION.NEW" }));
          setModoEdicion(true);
        }
      });
    }
  };

  const cancelarEdicionTabsCamaExclusiva = () => {
    setModoEdicion(false);
    setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };

  async function eliminarListRowTab(dataRow, confirm, nivel) {
    //console.log("eliminarListRowTab|tabIndex:", tabIndex);

    //console.log("eliminarListRowTab|nivelDelete:", nivelDelete);

    if (confirm) {
      switch (tabIndex) {
        case 0: //tab listar
        /*eliminarReservaDia(selected);
        break;*/
        case 5: //tab listar
          switch (nivelDelete) {
            case 1:
              eliminarReserva(selected);
              break;
            case 2:
              eliminarReservaDia(selected);
              break;
            case 3:
              reservaCheckIn(selected);
              break;
            case 4:
              reservaCheckOut(selected);
              break;
            default: break;
          }
          break;
        case 6:
          eliminarRegistroCamaExclusiva(selected, confirm);
          break;
        default: break;
      }
    } else {
      const { Nombre, Apellido } = selected;
      setIsVisible(true);
      setSelected({ ...dataRow, Nombre, Apellido });
      setNivelDelete(nivel);
    }
  }
  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  //Validar permiso campamento:

  const validarCampamentos = async () => {
    setLoading(true);

    let superAdministrador = usuario.superAdministrador;
    let buttonsPermissions = getButtonPermissions(
      dataMenu.objetos,
      superAdministrador
    );

    //Validar si tiene Permiso como administador de sistema.
    let tmp_campamentos = await listarCampamentos({
      IdCliente: perfil.IdCliente,
      IdDivision: perfil.IdDivision,
      IdUsuario: usuario.username,
      numPagina: 0,
      tamPagina: 0
    })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err);
      })
      .finally(() => {
        setLoading(false);
      });

    tmp_campamentos = tmp_campamentos || [];

    if (tmp_campamentos.length === 0) {
      handleWarningMessages(
        intl.formatMessage({ id: "MESSAGES.WARNING" }),
        intl.formatMessage({ id: "MESSAGES.NO.ACCESS.CAMP" })
      );
      cancelarEdicion();
    } else {
      setAccessButton({ ...accessButton, ...buttonsPermissions });
    }
  };

  const getNombreBarrar = () => {
    /*return `${intl.formatMessage({ id: "CAMP.RESERVATION.CAMPMANAGEMENT" })}  -          
           ${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} `; */

    let tabsTitles = [
      "",
      "",
      "ADMINISTRATION.PERSON.PHOTO",
      "ADMINISTRATION.CONTRACT.CONTRACT",
      "ACCESS.PERSON.MENU.PROFILE",
      "CAMP.RESERVATION.TAB",
      "SECURITY.PROFILE.MENU.CHARACTERISTIC"
    ];

    let sufix =
      tabsTitles[tabIndex] !== ""
        ? " - " + `${intl.formatMessage({ id: tabsTitles[tabIndex] })}`
        : "";
    return (
      `${intl.formatMessage({
        id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}`
      })} ` +
      " " +
      sufix
    ); // return `${intl.formatMessage({ id: `${"CAMP.RESERVATION.CAMPMANAGEMENT" ? "CAMP.RESERVATION.CAMPMANAGEMENT" : ""}` })}` + " " + sufix;
  };

  const tabsDisabled = () => {
    return isNotEmpty(varIdPersona) ? false : true;
  };

  const comp_PersonaListPage = () => {
    return (
      <PersonaListPage
        titulo={titulo}
        seleccionarRegistro={seleccionarRegistro}
        verRegistroDblClick={verRegistroDblClick}
        focusedRowKey={focusedRowKey}
        setFocusedRowKey={setFocusedRowKey}
        showButtons={false}
        uniqueId={"campamentoPersonaList"}
        //=>..CustomerDataGrid
        //filterData={filterData}
        //setFilterData={setFilterData}
        isFirstDataLoad={isFirstDataLoad}
        setIsFirstDataLoad={setIsFirstDataLoad}
        dataSource={dataSource}
        refresh={refresh}
        resetLoadOptions={resetLoadOptions}
        refreshData={refreshData}
        setRefreshData={setRefreshData}
        setVarIdPersona={setVarIdPersona}
        totalRowIndex={totalRowIndex}
        setTotalRowIndex={setTotalRowIndex}
        accessButton={accessButton}
      />
    );
  };

  const comp_PersonaEditTabPage = () => {
    return (
      <>
        <PersonaEditTabPage
          modoEdicion={modoEdicion}
          titulo={titulo}
          dataRowEditNew={dataRowEditNew}
          idPersona={varIdPersona}
          setDataRowEditNew={setDataRowEditNew}
          cancelarEdicion={cancelarEdicion}
          settingDataField={dataMenu.datos}
          getInfo={getInfo}
          dataCombos={dataCombos}
          accessButton={accessButton}
        />

        <div className="container_only">
          <div className="float-right">
            <ControlSwitch
              checked={auditoriaSwitch}
              onChange={e => {
                setAuditoriaSwitch(e.target.checked);
              }}
            />
            <b> {intl.formatMessage({ id: "AUDIT.DATA" })} </b>
          </div>
        </div>
        {auditoriaSwitch && <AuditoriaPage dataRowEditNew={dataRowEditNew} />}
      </>
    );
  };

  const comp_PersonaFotoEditPage = () => {
    return (
      <>
        <PersonaFotoEditPage
          setDataRowEditNew={setDataRowEditNewTabs}
          dataRowEditNew={dataRowEditNewTabs}
          cancelarEdicion={cancelarEdicion}
          titulo={tituloTabs}
          size={classes.avatarLarge}
          getInfo={getInfo}
        />
        <div className="container_only">
          <div className="float-right">
            <ControlSwitch
              checked={auditoriaSwitch}
              onChange={e => {
                setAuditoriaSwitch(e.target.checked);
              }}
            />
            <b> {intl.formatMessage({ id: "AUDIT.DATA" })}</b>
          </div>
        </div>
        {auditoriaSwitch && (
          <AuditoriaPage dataRowEditNew={dataRowEditNewTabs} />
        )}
      </>
    );
  };

  const tabContent_PersonaContrato = () => {
    return (
      <>
        <PersonaContratoIndexPage
          varIdPersona={varIdPersona}
          selectedIndex={selected}
          cancelarEdicion={cancelarEdicion}
          getInfo={getInfo}
          settingDataField={dataMenu.datos}
          accessButton={accessButton}
          showButtons={false}
          ocultarEdit={true}
        />
      </>
    );
  };

  const comp_Reserva = () => {
    return (
      <>
        {!modoEdicion ? (
          <ReservaListPage
            setDataRowEditNew={setDataRowEditNew}
            dataRowEditNew={dataRowEditNew}
            cancelarEdicion={cancelarEdicion}
            titulo={tituloTabs}
            size={classes.avatarLarge}
            getInfo={getInfo}
            showButton={true}
            nuevoRegistro={nuevoRegistro}
            reservas={reservas}
            retornarReserva={retornarReserva}
            buscarReservas={buscarReservas}
            eliminarReserva={eliminarListRowTab}
            editarReservas={editarReservas}
            setMensajeEliminar={setMensajeEliminar}
            validarCampamentos={validarCampamentos}
            accessButton={accessButton}
          // selectedIndex ={selected}
          />
        ) : (
          <ReservaEditPage
            titulo={tituloTabs}
            getInfo={getInfo}
            showButton={true}
            modoEdicion={true}
            setDataRowEditNew={setDataRowEditNew}
            dataRowEditNew={dataRowEditNew}
            cancelarEdicion={cancelarEdicionReserva}
            grabar={grabarReservasPersona}
            actualizar={actualizarReservasPersona}
            size={classes.avatarLarge}
            buscarDisponibilidadReservas={buscarDisponibilidadReservas}
            retornarReserva={retornarReserva}
            fechasContrato={fechasContrato}
            combosReserva={combosReserva}
          />
        )}
      </>
    );
  };

  const comp_Exclusiva = () => {
    return (
      <>
        {modoEdicion && (
          <>
            <CamaExclusivaEditPage
              dataRowEditNew={dataRowEditNew}
              setDataRowEditNew={setDataRowEditNew}
              actualizarCamaExclusiva={actualizarCamaExclusiva}
              agregarCamaExclusiva={agregarCamaExclusiva}
              cancelarEdicion={cancelarEdicionTabsCamaExclusiva}
              getInfo={getInfo}
              titulo={tituloTabs}
              modoEdicion={modoEdicion}
              settingDataField={dataMenu.datos}
              accessButton={accessButton}
              setLoading={setLoading}
              fechasContrato={fechasContrato}
            />
            <div className="container_only">
              <div className="float-right">
                <ControlSwitch
                  checked={auditoriaSwitch}
                  onChange={e => {
                    setAuditoriaSwitch(e.target.checked);
                  }}
                />
                <b> {intl.formatMessage({ id: "AUDIT.DATA" })}</b>
              </div>
            </div>
            {auditoriaSwitch && (
              <AuditoriaPage dataRowEditNew={dataRowEditNew} />
            )}
          </>
        )}
        {!modoEdicion && (
          <>
            <CamaExclusivaListPage
              camaExclusiva={listarTabs}
              editarRegistro={editarRegistroCamaExclusiva}
              eliminarRegistro={eliminarRegistroCamaExclusiva}
              nuevoRegistro={nuevoRegistroTabsCamaExclusiva}
              cancelarEdicion={cancelarEdicion}
              getInfo={getInfo}
              accessButton={accessButton}
              validarCampamentos={validarCampamentos}
            />
          </>
        )}
      </>
    );
  };

  const tabContent_PersonaPerfilIndexPage = () => {
    return <>
      <PersonaPerfilIndexPage
        varIdPersona={varIdPersona}
        moduloCompania={selected}
        cancelarEdicion={cancelarEdicion}
        getInfo={getInfo}
        accessButton={accessButton}
        settingDataField={dataMenu.datos}
      />
    </>
  }

  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  return (
    <>
      <TabNavContainer
        title={intl.formatMessage({ id: "CAMP.PROFILE.MENU" })}
        submenu={intl.formatMessage({ id: "CAMP.CAMP.MANAGEMENT" })}
        subtitle={intl.formatMessage({
          id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}`
        })}
        nombrebarra={getNombreBarrar()}
        tabIndex={tabIndex}
        handleChange={handleChange}
        value={value}
        componentTabsHeaders={[
          {
            label: intl.formatMessage({ id: "ACTION.LIST" }),
            icon: <FormatListNumberedIcon fontSize="large" />,
            disabled: false,
            onClick: e => { }
          },
          {
            label: intl.formatMessage({ id: "ACCESS.PERSON.MENU.PERSON" }),
            icon: (<AvatarFoto size={classes.avatarSmall} id={"FotoPerfil"} imagenB64={fotoPerfil} />),
            disabled: tabsDisabled(),
            className: classes.avatarContent,
            onClick: () => { obtenerPersona(varIdPersona, true); }
          },
          {
            label: intl.formatMessage({ id: "ADMINISTRATION.PERSON.PHOTO" }),
            icon: <AccountCircleOutlinedIcon fontSize="large" />,
            disabled: tabsDisabled(),
            onClick: e => {
              obtenerPersonaFoto(varIdPersona, false);
            }
          },
          {
            label: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CONTRACT" }),
            icon: <DescriptionIcon fontSize="large" />,
            disabled: tabsDisabled()
          },
          {
            label: intl.formatMessage({ id: "ACCESS.PERSON.MENU.PROFILE" }),
            icon: <SupervisedUserCircle fontSize="large" />,
            disabled: !tabsDisabled() && accessButton.Tabs[4] ? false : true
          },
          {
            label: intl.formatMessage({ id: "CAMP.RESERVATION.TAB" }),
            icon: <LocalMallOutlinedIcon fontSize="large" />,
            disabled: tabsDisabled(),
            onClick: () => {
              validarCampamentos();
              setModoEdicion(false);
              let { FechaInicio, FechaFin } = getStartAndEndOfMonthByDay(new Date());
              FechaFin = new Date(FechaFin.getFullYear(), FechaFin.getMonth() + 1, FechaFin.getDate());
              buscarReservas(FechaInicio, FechaFin);
            }
          },
          {
            label: intl.formatMessage({
              id: "CAMP.BED_MANAGEMENT.TAB.EXCLUSIVE"
            }),
            icon: <AirlineSeatFlatAngled fontSize="large" />,
            disabled: tabsDisabled(),
            onClick: e => {
              validarCampamentos();
              listarCamaExclusiva();
            }
          }
        ]}
        className={classes.tabContent}
        componentTabsBody={[
          comp_PersonaListPage(),
          comp_PersonaEditTabPage(),
          comp_PersonaFotoEditPage(),
          tabContent_PersonaContrato(),
          tabContent_PersonaPerfilIndexPage(),
          comp_Reserva(),
          comp_Exclusiva()
        ]}
      />
      <Confirm
        message={mensajeEliminar}
        isVisible={isVisible}
        setIsVisible={setIsVisible}
        setInstance={setInstance}
        onConfirm={() => eliminarListRowTab(selected, true, 0)}
        title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
        confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
        cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
      />
    </>
  );
};

export default injectIntl(WithLoandingPanel(PersonaIndexPage));
