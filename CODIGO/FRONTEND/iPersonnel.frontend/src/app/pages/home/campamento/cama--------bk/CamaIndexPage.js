import React, { useEffect, useState, Fragment } from "react";
import { injectIntl } from "react-intl";
import { Portlet } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import {
  handleErrorMessages,
  handleSuccessMessages,
  handleInfoMessages,
  handleWarningMessages
} from "../../../../store/ducks/notify-messages";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import Confirm from "../../../../partials/components/Confirm";
import {
  getButtonPermissions,
  defaultPermissions,
  setDisabledTabs
} from "../../../../../_metronic/utils/securityUtils";

import {
  useStylesEncabezado,
  useStylesTab
} from "../../../../store/config/Styles";
import CustomBreadcrumbs from "../../../../partials/layout/CustomBreadcrumbs";
import { useSelector } from "react-redux";
import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";
import TabNavContainer from "../../../../partials/components/Tabs/TabNavContainer";

import CamaListPage from "./CamaListPage";
import HabitacionCamaEditPage from "../habitacionCama/HabitacionCamaEditPage";
import { servicePersona } from "../../../../api/administracion/persona.api";

import {
  eliminar as eliminarHabCama,
  obtener as obtenerHabCama,
  listar as listarHabCama,
  crear as crearHabCama,
  actualizar as actualizarHabCama
} from "../../../../api/campamento/habitacionCama.api";

import { isNotEmpty, dateFormat } from "../../../../../_metronic";

import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import PropTypes from "prop-types";

import FormatListNumberedIcon from "@material-ui/icons/FormatListNumbered";
import HotelIcon from "@material-ui/icons/Hotel";
import LocalMallOutlinedIcon from "@material-ui/icons/LocalMallOutlined";
import AirlineSeatFlatAngled from "@material-ui/icons/AirlineSeatFlatAngled";

import ArrayStore from "devextreme/data/array_store";
import DataSource from "devextreme/data/data_source";

/********************************************* */
import CamaExclusivaByCamaEditPage from "../camaExclusiva/CamaExclusivaByCamaEditPage";
import CamaExclusivaByCamaListPage from "../camaExclusiva/CamaExclusivaByCamaListPage";
import ReservaByCamaListPage from "../reserva/ReservaByCamaListPage";

import {
  crear as crearExclusiva,
  actualizar as actualizarExclusiva,
  obtener as obtenerExclusiva,
  eliminar as eliminarExclusiva,
  listarbycama as listarExclusiva
} from "../../../../api/campamento/camaExclusiva.api";

import { getStartAndEndOfMonthByDay } from "../../../../../_metronic/utils/utils";

import {
  reservasPorCama as listarReservasCama,
  obtener as obtenerReserva
} from "../../../../api/campamento/reserva.api";

import { listar as listarCampamentos } from "../../../../api/campamento/campamento.api";

/********************************************* */

export const initialFilter = {
  Activo: "S",
  IdCliente: "1",
  IdDivision: "",
  MostrarCamaExclusiva: "N"
};

const CamaIndexPage = props => {
  const usuario = useSelector(state => state.auth.user);
  const { IdCliente, IdDivision } = useSelector(
    state => state.perfil.perfilActual
  );
  const { intl, setLoading, dataMenu } = props;
  const [titulo, setTitulo] = useState(
    intl.formatMessage({ id: "ACTION.LIST" })
  );
  const [focusedRowKey, setFocusedRowKey] = useState();

  const classesEncabezado = useStylesEncabezado();
  const classes = useStylesTab();
  const [tabIndex, setTabIndex] = useState(0);

  const [tituloTabs, setTituloTabs] = useState(
    intl.formatMessage({ id: "ACTION.LIST" })
  );
  const [modoEdicion, setModoEdicion] = useState(false);

  const [varIdHabitacionCama, setVarIdHabitacionCama] = useState("");
  const [selected, setSelected] = useState({});

  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [instance, setInstance] = useState({});

  const [fechasContrato, setFechasContrato] = useState({
    FechaInicioContrato: null,
    FechaFinContrato: null
  });
  const [disabledSave, setDisabledSave] = useState(false);

  const handleChange = (event, newValue) => {
    setTabIndex(newValue);
  };
  //FILTRO
  const [isFirstDataLoad, setIsFirstDataLoad] = useState(true);
  const [refreshData, setRefreshData] = useState(false);
  const ds = new DataSource({
    store: new ArrayStore({ data: [], key: "RowIndex" }),
    reshapeOnPush: false
  });

  const [filterData, setFilterData] = useState({
    ...initialFilter, IdCliente,
    IdDivision: isNotEmpty(IdDivision) ? IdDivision : ""
  });

  const [dataSource] = useState(ds);

  const refresh = () => dataSource.refresh();
  const resetLoadOptions = () => dataSource.resetLoadOptions();

  //EGSC------------------------------------------------------
  const perfil = useSelector(state => state.perfil.perfilActual);
  const [listarTabs, setListarTabs] = useState([]);
  //Reservas:
  const [reservas, setReservas] = useState([]);
    //++++++++Variable (totalRowIndex) para controlar bloqueo de tabs cuando se cambia de búsqueda de un registro en la grilla.++++++++++++++
    const [totalRowIndex, setTotalRowIndex] = useState(0);

  //----------------------------------------------------------

  /***Configuración Tabs*************************************** */
  const [accessButton, setAccessButton] = useState(defaultPermissions);

  const loadControlsPermission = () => {
    const numeroTabs = 4; //Nùmero de tab del formulario.
    let buttonsPermissions = getButtonPermissions(dataMenu.objetos);
    let newTabs = setDisabledTabs(dataMenu.objetos, numeroTabs);
    setAccessButton({ ...accessButton, ...buttonsPermissions, Tabs: newTabs });
  };

  //::::::::::::::::::::::FUNCION HABITACIÓN CAMA:::::::::::::::::::::::::::::::::::::::::::::::::

  async function actualizarHabitacionCama(habitacionCama) {
    setLoading(true);
    const {
      IdCliente,
      IdDivision,
      IdCampamento,
      IdModulo,
      IdHabitacion,
      IdCama,
      Cama,
      IdTipoCama,
      Activo
    } = habitacionCama;
    let params = {
      IdCliente,
      IdDivision,
      IdCampamento,
      IdModulo,
      IdHabitacion,
      IdCama: isNotEmpty(IdCama) ? IdCama.toUpperCase() : "",
      Cama: isNotEmpty(Cama) ? Cama.toUpperCase() : "",
      IdTipoCama: isNotEmpty(IdTipoCama) ? IdTipoCama.toUpperCase() : "",
      Activo,
      IdUsuario: usuario.username
    };
    await actualizarHabCama(params)
      .then(() => {
        handleSuccessMessages(
          intl.formatMessage({ id: "MESSAGES.SUCESS" }),
          intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" })
        );
        setModoEdicion(false);
        listadoCamas();
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  async function eliminarRegistroHabitacionCama(habitacionCama, confirm) {
    setSelected(habitacionCama);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const {
        IdCampamento,
        IdModulo,
        IdHabitacion,
        IdCama,
        IdCliente,
        IdDivision
      } = habitacionCama;
      await eliminarHabCama({
        IdCampamento: IdCampamento,
        IdModulo: IdModulo,
        IdHabitacion: IdHabitacion,
        IdCama: IdCama,
        IdCliente: IdCliente,
        IdDivision: IdDivision,
        IdUsuario: usuario.username
      })
        .then(response => {
          setRefreshData(true);
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
      listadoCamas();
    }
  }

  async function listadoCamas() {
    changeTabIndex(0);
    setModoEdicion(false);
    setTimeout(function() {
      setRefreshData(true); //Actualizar CustomDataGrid
    }, 300);
  }

  async function obtenerHabitacionCama() {
    const {
      IdCliente,
      IdDivision,
      IdCampamento,
      IdModulo,
      IdHabitacion,
      IdCama
    } = selected;
    setLoading(true);
    await obtenerHabCama({
      IdCliente: IdCliente,
      IdDivision: IdDivision,
      IdCampamento: IdCampamento,
      IdModulo: IdModulo,
      IdHabitacion: IdHabitacion,
      IdCama: IdCama
    })
      .then(habitacionCama => {
        setDataRowEditNew({ ...habitacionCama, esNuevoRegistro: false });
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  const editarRegistroHabitacionCama = dataRow => {
    changeTabIndex(1);
    const { RowIndex } = dataRow;
    setModoEdicion(true);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    obtenerHabitacionCama(dataRow);
    setFocusedRowKey(RowIndex);
  };

  const seleccionarRegistro = dataRow => {
    const { IdCama, RowIndex } = dataRow;
    setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));

    console.log("seleccionarRegistro", { dataRow, varIdHabitacionCama });
    if (RowIndex !== varIdHabitacionCama) {
      //EGSC - Se cambio por RowIndex | IdCama se repite por habitación
      setVarIdHabitacionCama(RowIndex);
      setFocusedRowKey(RowIndex);
      setModoEdicion(false);
      setSelected(dataRow);
    }
  };

  const verRegistroCamaDblClick = async dataRow => {
    changeTabIndex(1);
    setModoEdicion(false);
    obtenerHabitacionCama(dataRow);
  };

  const changeTabIndex = index => {
    handleChange(null, index);
  };

  const cancelarEdicionTabs = indice => {
    changeTabIndex(indice);
    //setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
    switch (indice) {
      case 0:
        listadoCamas();
        break;
    }
  };

  async function eliminarListRowTab(dataRow, isConfirm) {
    if (isConfirm) {
      switch (tabIndex) {
        case 0: //tab listar
          eliminarRegistroHabitacionCama(selected, isConfirm);
          break;
        case 2: //tab listar
          eliminarRegistroCamaExclusiva();
          break;
      }
    } else {
      setIsVisible(true);

      let { Campamento, Modulo, Habitacion, Cama } = selected;
      setSelected({ ...dataRow, Campamento, Modulo, Habitacion, Cama });
    }
  }

  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  async function listarCamaExclusiva() {
    setLoading(true);
    const { IdCampamento, IdModulo, IdHabitacion, IdCama } = selected;
    await listarExclusiva({
      IdCliente: perfil.IdCliente,
      IdDivision: perfil.IdDivision,
      IdCampamento,
      IdModulo,
      IdHabitacion,
      IdCama,
      NumPagina: 0,
      TamPagina: 0
    })
      .then(data => {
        setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
        setListarTabs(data);
        setModoEdicion(false);
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  useEffect(() => {
    loadControlsPermission();
  }, []);

  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  const editarRegistroCamaExclusiva = async dataRow => {
    const { IdPersona } = dataRow;

    await servicePersona
      .obtenerPeriodo({
        IdPersona: IdPersona,
        FechaInicio: dateFormat(new Date(), "yyyyMMdd"),
        FechaFin: dateFormat(new Date(), "yyyyMMdd")
      })
      .then(response => {
        //  console.log("editarRegistroCamaExclusiva|response:",response);
        if (response) {
          if (!isNotEmpty(response.MensajeValidacion)) {
            setDisabledSave(false);
            setFechasContrato({
              FechaInicioContrato: response.FechaInicio,
              FechaFinContrato: response.FechaFin
            });
          } else {
            setFechasContrato({
              FechaInicioContrato: null,
              FechaFinContrato: null
            });
            setDisabledSave(true);
            handleInfoMessages(
              intl.formatMessage({ id: "MESSAGES.INFO" }),
              response.MensajeValidacion
            );
          }
        }
      });

    setDataRowEditNew({ esNuevoRegistro: false });
    obtenerCamaExclusiva(dataRow);
    setModoEdicion(true);
    setTituloTabs(intl.formatMessage({ id: "ACTION.EDIT" }));
  };

  const eliminarRegistroCamaExclusiva = async () => {
    setLoading(true);
    const { IdCliente, IdPersona, IdSecuencial } = selected;
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
        listarCamaExclusiva();
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  async function obtenerCamaExclusiva(dataRow) {
    setLoading(true);
    const { IdCliente, IdPersona, IdSecuencial } = dataRow;
    await obtenerExclusiva({
      IdCliente,
      IdPersona,
      IdSecuencial
    })
      .then(CamaExclusiva => {
        setDataRowEditNew({ ...CamaExclusiva, esNuevoRegistro: false });
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  const nuevoRegistroTabsCamaExclusiva = e => {
    let nuevo = { Activo: "S" };
    setFechasContrato({ FechaInicioContrato: null, FechaFinContrato: null });
    setDataRowEditNew({
      ...nuevo,
      esNuevoRegistro: true,
      FechaInicio: new Date()
    });
    setTituloTabs(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
  };
  const cancelarEdicion = e => {
    changeTabIndex(0);
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
    //setDataRowEditNewTabs({});
  };

  const getInfo = () => {
    const { Campamento, Habitacion, Cama, Modulo } = selected;
    return [
      {
        text: [intl.formatMessage({ id: "CAMP.RESERVATION.CAMP" })],
        value: Campamento
      },
      {
        text: [intl.formatMessage({ id: "CAMP.BED_MANAGEMENT.MODULE" })],
        value: Modulo
      },
      {
        text: [intl.formatMessage({ id: "CAMP.BED_MANAGEMENT.ROOM" })],
        value: Habitacion
      },
      {
        text: [intl.formatMessage({ id: "CAMP.BED_MANAGEMENT.BED" })],
        value: Cama
      }
    ];
  };

  const actualizarCamaExclusiva = async dataRow => {
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
  };

  const cancelarEdicionTabsCamaExclusiva = () => {
    setModoEdicion(false);
    setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };

  ///////////////////////////////////////////////////////////////
  async function agregarCamaExclusiva(dataCamaExclusiva) {
    setLoading(true);
    let { FechaInicio, FechaFin, Activo, IdPersona } = dataCamaExclusiva;
    let { IdCampamento, IdModulo, IdHabitacion, IdCama } = selected;

    let params = {
      IdCliente: perfil.IdCliente,
      IdPersona,
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
  ///////////////////////////////////////////////////////////////

  /*** Reservas **************************************************** */

  const buscarReservas = async (FechaInicio, FechaFin) => {
    //console.log("buscarReservas|FechaInicio|FechaFin",FechaInicio,FechaFin);
    setLoading(true);

    let { IdCampamento, IdModulo, IdHabitacion, IdCama } = selected;
    await listarReservasCama({
      IdCliente: perfil.IdCliente,
      IdDivision: perfil.IdDivision,
      IdCampamento,
      IdModulo,
      IdHabitacion,
      IdCama,
      FechaInicio: dateFormat(FechaInicio, "yyyyMMdd"), //new Date(FechaInicio).toLocaleString(),
      FechaFin: dateFormat(FechaFin, "yyyyMMdd") //new Date(FechaFin).toLocaleString(),
    })
      .then(resp => {
        //console.log("==>", resp);
        let infoReservas = resp.map(x => ({
          ...x,
          text: x.IdCama,
          startDate: x.Fecha,
          endDate: x.Fecha
        }));
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

  const retornarReserva = async infoData => {
    let objReserva = [];
    //setLoading(true);

    let param = {
      IdCliente: perfil.IdCliente,
      IdDivision: perfil.IdDivision,
      IdCampamento: infoData.IdCampamento,
      IdReserva: infoData.IdReserva,
      Fecha: infoData.Fecha // dateFormat( new Date(infoData.Fecha), "yyyyMMdd") // convertyyyyMMddToDate(infoData.Fecha).toLocaleString(),
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
  /***************************************************************** */

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

  //:::::::::::::::::::::::::::::::::::::::::::::-Configuración de tabs-:::::::::::::::::::::::::::::::::
  const titleHeaderToolbar = () => {
    let tabsTitles = [
      "",
      "CAMP.BED_MANAGEMENT.BED",
      "CAMP.BED_MANAGEMENT.TAB.EXCLUSIVE",
      "CAMP.BED_MANAGEMENT.TAB.OCCUPABILITY"
    ];

    let sufix =
      tabsTitles[tabIndex] !== ""
        ? " - " + `${intl.formatMessage({ id: tabsTitles[tabIndex] })}`
        : "";

    return (
      `${intl.formatMessage({
        id: `${
          isNotEmpty("CAMP.RESERVATION.CAMPMANAGEMENT")
            ? "CAMP.RESERVATION.CAMPMANAGEMENT"
            : ""
        }`
      })}` +
      " " +
      sufix
    );
  };
  const tabsDisabled = () => {
    return isNotEmpty(varIdHabitacionCama) ? false : true;
  };

  const tabContent_CamaListPage = () => {
    return (
      <CamaListPage
        titulo={titulo}
        editarRegistro={editarRegistroHabitacionCama}
        eliminarRegistro={eliminarRegistroHabitacionCama}
        seleccionarRegistro={seleccionarRegistro}
        focusedRowKey={focusedRowKey}
        setFocusedRowKey={setFocusedRowKey}
        verRegistroDblClick={verRegistroCamaDblClick}
        accessButton={accessButton}
        isFirstDataLoad={isFirstDataLoad}
        setIsFirstDataLoad={setIsFirstDataLoad}
        dataSource={dataSource}
        refresh={refresh}
        resetLoadOptions={resetLoadOptions}
        refreshData={refreshData}
        setRefreshData={setRefreshData}
        filterData={filterData}
        setFilterData={setFilterData}
        setVarIdHabitacionCama={setVarIdHabitacionCama}
        totalRowIndex = {totalRowIndex}
        setTotalRowIndex={setTotalRowIndex}
      />
    );
  };

  const tabContent_HabitacionCamaEditPage = () => {
    return (
      <>
        <HabitacionCamaEditPage
          titulo={titulo}
          modoEdicion={modoEdicion}
          dataRowEditNew={dataRowEditNew}
          actualizarHabitacionCama={actualizarHabitacionCama}
          cancelarEdicion={() => cancelarEdicionTabs(0)}
          accessButton={accessButton}
          settingDataField={dataMenu.datos}
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
        {auditoriaSwitch && <AuditoriaPage dataRowEditNew={dataRowEditNew} />}
      </>
    );
  };

  const tabContent_CamaExclusivaByCamaListPage = () => {
    return (
      <>
        {modoEdicion ? (
          <Fragment>
            <CamaExclusivaByCamaEditPage
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
              fechasContrato={fechasContrato}
              setFechasContrato={setFechasContrato}
              disabledSave={disabledSave}
              setDisabledSave={setDisabledSave}
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
          </Fragment>
        ) : (
          <CamaExclusivaByCamaListPage
            camaExclusiva={listarTabs}
            editarRegistro={editarRegistroCamaExclusiva}
            eliminarRegistro={eliminarListRowTab}
            nuevoRegistro={nuevoRegistroTabsCamaExclusiva}
            cancelarEdicion={cancelarEdicion}
            getInfo={getInfo}
            accessButton={accessButton}
            validarCampamentos={validarCampamentos}
          />
        )}
      </>
    );
  };

  const tabContent_ReservaByCamaListPage = () => {
    return (
      <>
        <ReservaByCamaListPage
          setDataRowEditNew={setDataRowEditNew}
          dataRowEditNew={dataRowEditNew}
          cancelarEdicion={cancelarEdicion}
          titulo={tituloTabs}
          size={classes.avatarLarge}
          getInfo={getInfo}
          showButton={true}
          reservas={reservas}
          retornarReserva={retornarReserva}
          buscarReservas={buscarReservas}
          accessButton={accessButton}
          validarCampamentos={validarCampamentos}
        />
      </>
    );
  };

  //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  return (
    <>
      <TabNavContainer
        title={intl.formatMessage({ id: "CAMP.BED_MANAGEMENT.MENU" })}
        submenu={intl.formatMessage({ id: "CAMP.CAMP.MANAGEMENT" })}
        subtitle={intl.formatMessage({
          id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}`
        })}
        nombrebarra={titleHeaderToolbar()}
        tabIndex={tabIndex}
        handleChange={handleChange}
        componentTabsHeaders={[
          {
            label: intl.formatMessage({ id: "ACTION.LIST" }),
            icon: <FormatListNumberedIcon fontSize="large" />,
            // onClick: () => {listadoCamas();}
          },
          {
            label: intl.formatMessage({ id: "CAMP.BED_MANAGEMENT.BED" }),
            icon: <HotelIcon fontSize="large" />,
            onClick: e => {
              obtenerHabitacionCama(selected);
            },
            disabled: tabsDisabled()
          },
          {
            label: intl.formatMessage({
              id: "CAMP.BED_MANAGEMENT.TAB.EXCLUSIVE"
            }),
            icon: <AirlineSeatFlatAngled fontSize="large" />,
            onClick: e => {
              validarCampamentos();
              listarCamaExclusiva();
            },
            disabled: !tabsDisabled() && accessButton.Tabs[2] ? false : true
          },
          {
            label: intl.formatMessage({
              id: "CAMP.BED_MANAGEMENT.TAB.OCCUPABILITY"
            }),
            icon: <LocalMallOutlinedIcon fontSize="large" />,
            onClick: () => {
              validarCampamentos();
              setModoEdicion(false);
              let { FechaInicio, FechaFin } = getStartAndEndOfMonthByDay(
                new Date(),
                2
              );
              //FechaFin = new Date(FechaFin.getFullYear(), FechaFin.getMonth() + (1), FechaFin.getDate());
              buscarReservas(FechaInicio, FechaFin);
            },
            disabled: !tabsDisabled() && accessButton.Tabs[3] ? false : true
          }
        ]}
        className={classes.tabContent}
        componentTabsBody={[
          tabContent_CamaListPage(),
          tabContent_HabitacionCamaEditPage(),
          tabContent_CamaExclusivaByCamaListPage(),
          tabContent_ReservaByCamaListPage()
        ]}
      />
      <Confirm
        message={intl.formatMessage({ id: "ALERT.REMOVE" })}
        isVisible={isVisible}
        setIsVisible={setIsVisible}
        setInstance={setInstance}
        onConfirm={() => eliminarListRowTab(selected, true)}
        title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
        confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
        cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
      />
    </>
  );
};

export default injectIntl(WithLoandingPanel(CamaIndexPage));
