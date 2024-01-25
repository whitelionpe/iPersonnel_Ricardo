import React, { useEffect, useState } from 'react';
import { injectIntl } from "react-intl";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import { useSelector } from "react-redux";
import { convertyyyyMMddToDateTime, dateFormat, dateFromString, isNotEmpty } from "../../../../../_metronic";
import LocalMallOutlinedIcon from '@material-ui/icons/LocalMallOutlined';
import TabNavContainer from "../../../../partials/components/Tabs/TabNavContainer";

import { servicePersona } from "../../../../api/administracion/persona.api";
import { eliminar, checkin, checkout, reservamasiva, actualizar } from "../../../../api/campamento/reserva.api";
import { obtener as obtnerCampamento } from "../../../../api/campamento/campamento.api";

import {
  handleErrorMessages,
  handleSuccessMessages, handleInfoMessages
} from "../../../../store/ducks/notify-messages";

/******************************************* */
import MasivoPersonaReserva from './MasivoPersonaReserva';
import ReservaFiltrarListPage from './ReservaFiltrarListPage';

import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import ReservaEditDatePage from './ReservaEditDatePage';
import Confirm from '../../../../partials/components/Confirm';
import ReservaCheckinPage from './ReservaCheckinPage';
import ReservaCheckoutPage from './ReservaCheckoutPage';
import { getMinutes } from 'date-fns';

export const initialFilter = {
  IdCliente: '',
  IdCampamento: "",
  IdTipoModulo: "",
  IdModulo: "",
  Modulo: "",
  IdHabitacion: "",
  Habitacion: "",
  IdTipoHabitacion: "",
  Personas: '',
  IdCompaniaContratista: ""
};
/******************************************* */

const MasivoPersonaIndex = (props) => {
  const usuario = useSelector(state => state.auth.user);
  const { intl, setLoading, dataMenu } = props;

  /************************************ */
  const perfil = useSelector(state => state.perfil.perfilActual);
  const getInfo = () => {
    const { CompaniaContratista, NombreCompleto, Campamento, Modulo, Habitacion, Cama } = selected;
    return [
      {
        text: [intl.formatMessage({ id: "ADMINISTRATION.PERSON.COMPANY" })],
        value: CompaniaContratista,
        colSpan: 4
      },
      {
        text: [intl.formatMessage({ id: "ADMINISTRATION.PERSON.NAME" })],
        value: NombreCompleto,
        colSpan: 4
      },
      {
        text: [intl.formatMessage({ id: "CAMP.RESERVATION.CAMP" })],
        value: Campamento,
        colSpan: 2
      },
      {
        text: [intl.formatMessage({ id: "CAMP.RESERVATION.MODULE" })],
        value: Modulo,
        colSpan: 2
      },
      {
        text: [intl.formatMessage({ id: "CAMP.RESERVATION.ROOM" })],
        value: Habitacion,
        colSpan: 2
      },
      {
        text: [intl.formatMessage({ id: "CAMP.RESERVATION.BED" })],
        value: Cama,
        colSpan: 2
      },
    ];
  };
  const [dataRowEditNew, setDataRowEditNew] = useState({ esNuevoRegistro: true, Tipo: 0 });
  const [selected, setSelected] = useState({});
  const [selectedAccion, setSelectedAccion] = useState({});
  const retornarReserva = async (infoData) => { }
  const consultarDisponibilidadCamas = async (servicios, skip, take) => { }
  const [personasValidadas, setPersonasValidadas] = useState([]);
  const [procesados, setProcesados] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [focusedRowKey, setFocusedRowKey] = useState("");
  const [varIdReserva, setVarIdReserva] = useState("");
  const [totalRowIndex, setTotalRowIndex] = useState(0);
  const [isVisibleEditPopup, setIsVisibleEditPopup] = useState(false);
  const [isVisibleCheckinPopup, setIsVisibleCheckinPopup] = useState(false);
  const [isVisibleCheckoutPopup, setIsVisibleCheckoutPopup] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [opcionConfirm, setOpcionConfirm] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [, setInstance] = useState();
  /************************************ */
  //FILTRO
  const [isFirstDataLoad, setIsFirstDataLoad] = useState(true);
  const [refreshData, setRefreshData] = useState(false);
  const ds = new DataSource({ store: new ArrayStore({ data: [], key: 'RowIndex' }), reshapeOnPush: false });
  const [dataSource] = useState(ds);
  const [filterData, setFilterData] = useState({ ...initialFilter });

  const refresh = () => dataSource.refresh();
  const resetLoadOptions = () => dataSource.resetLoadOptions();

  const [value, setValue] = useState(0);
  const [tabIndex, setTabIndex] = useState(0);

  const handleChange = (event, newValue) => {
    //Estado cambio de tabs
    setValue(newValue);
    setTabIndex(newValue);
  };

  const seleccionarRegistro = data => {
    const { RowIndex, IdReserva } = data
    if (IdReserva !== varIdReserva) {
      setVarIdReserva(IdReserva);
      setFocusedRowKey(RowIndex);
    }
  };

  const cancelarEdicion = () => {
    setIsVisibleEditPopup(false);
    setSelected({});
  };

  const cancelarCheckin = () => {
    setIsVisibleCheckinPopup(false);
  };

  const cancelarCheckout = () => {
    setIsVisibleCheckoutPopup(false);
  };

  const editarRegistro = data => {
    setSelected({ ...data, FechaInicio: dateFromString(data.FechaInicioReserva), FechaFin: dateFromString(data.FechaFinReserva) });
    setIsVisibleEditPopup(true);
  };

  const mostrarPopupCheckin = data => {
    let hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    let fechaInicio = dateFromString(data.FechaInicioReserva);
    if (fechaInicio > hoy) {
      handleInfoMessages(intl.formatMessage({ id: "CAMP.RESERVATION.START_DATE_CHECKIN_ALERT" }));
      return;
    }
    let estado = "";
    switch (data.EstadoCama) {
      case "O":
        estado = "Ocupado";
        break;
      case "R":
        estado = "Reservado";
        break;
      case "F":
        estado = "Finalizado";
        break;
      default:
        break;
    };
    let fechaFin = dateFromString(data.FechaFinReserva);
    let fechaCheckin = new Date();
    if (fechaFin < fechaCheckin) {
      const fechaHoy = new Date();
      fechaCheckin = new Date(fechaInicio);
      fechaCheckin.setHours(fechaHoy.getHours(), fechaHoy.getMinutes());
    }
    setSelected({ ...data, FechaInicio: fechaInicio, FechaFin: fechaFin, FechaCheckIn: fechaCheckin, EstadoCama: estado })
    setIsVisibleCheckinPopup(true);
  };

  const mostrarPopupCheckout = data => {
    let hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    if (dateFromString(data.FechaCheckIn).getTime() === hoy.getTime()) {
      handleInfoMessages(intl.formatMessage({ id: "CAMP.RESERVATION.SAME_DAY_CHECKOUT_ALERT" }));
      return;
    }
    let estado = "";
    switch (data.EstadoCama) {
      case "O":
        estado = "Ocupado";
        break;
      case "R":
        estado = "Reservado";
        break;
      case "F":
        estado = "Finalizado";
        break;
      default:
        break;
    };
    let fechaCheckin = convertyyyyMMddToDateTime(data.FechaCheckIn);
    setSelected({ ...data, FechaInicio: dateFromString(data.FechaInicioReserva), FechaFin: dateFromString(data.FechaFinReserva), FechaCheckIn: fechaCheckin, FechaCheckOut: new Date(), EstadoCama: estado });
    setIsVisibleCheckoutPopup(true);
  };

  const mostrarDetalle = data => {
    let fechaCheckin = convertyyyyMMddToDateTime(data.FechaCheckIn);
    let fechaCheckout = convertyyyyMMddToDateTime(data.FechaCheckOut);
    setSelected({
      ...data,
      FechaInicio: dateFromString(data.FechaInicioReserva),
      FechaFin: dateFromString(data.FechaFinReserva),
      FechaCheckIn: fechaCheckin,
      FechaCheckOut: fechaCheckout,
      EstadoCama: 'Finalizado',
      SoloLectura: true
    });
    setIsVisibleCheckoutPopup(true);
  };

  const eliminarRegistro = (data, confirm) => {
    setSelectedAccion(data);
    setOpcionConfirm(1);
    setIsVisible(true);
    setMensaje(intl.formatMessage({ id: "ALERT.REMOVE" }));
    if (confirm) {
      setLoading(true);
      const { IdCampamento, IdReserva } = data;
      const param = {
        idCliente: perfil.IdCliente,
        idDivision: perfil.IdDivision,
        idCampamento: IdCampamento,
        idReserva: IdReserva
      };
      eliminar(param).then(response => {
        handleSuccessMessages(
          intl.formatMessage({ id: "MESSAGES.SUCESS" }),
          intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" })
        );
        setSelectedAccion({});
        setMensaje("");
        setOpcionConfirm(0);
        setRefreshData(true);
      }).catch(error => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), error);
      }).finally(() => {
        setLoading(false);
      });
    }
  };

  const checkIn = (data) => {
    setLoading(true);
    const { IdCampamento, IdReserva, FechaCheckIn } = data;
    const param = {
      idCliente: perfil.IdCliente,
      idDivision: perfil.IdDivision,
      idCampamento: IdCampamento,
      idReserva: IdReserva,
      fecha: dateFormat(FechaCheckIn, 'yyyyMMdd hh:mm'),
      idUsuario: usuario.username
    }
    checkin(param).then(response => {
      handleSuccessMessages(
        intl.formatMessage({ id: "MESSAGES.SUCESS" }),
        intl.formatMessage({ id: "CAMP.CAMP.CHECKIN.SUCCESS" })
      );
      setRefreshData(true);
      setIsVisibleCheckinPopup(false);
    }).catch(error => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), error);
    }).finally(() => {
      setLoading(false);
    });
  };

  const checkOut = (data) => {
    setLoading(true);
    const { IdCampamento, IdReserva, FechaCheckOut } = data;
    const param = {
      idCliente: perfil.IdCliente,
      idDivision: perfil.IdDivision,
      idCampamento: IdCampamento,
      idReserva: IdReserva,
      fecha: dateFormat(FechaCheckOut, 'yyyyMMdd hh:mm'),
      idUsuario: usuario.username
    }
    checkout(param).then(response => {
      handleSuccessMessages(
        intl.formatMessage({ id: "MESSAGES.SUCESS" }),
        intl.formatMessage({ id: "CAMP.CAMP.CHECKOUT.SUCCESS" })
      );
      setRefreshData(true);
      setIsVisibleCheckoutPopup(false);
    }).catch(error => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), error);
    }).finally(() => {
      setLoading(false);
    });
  };

  const actualizarReserva = async data => {
    let nuevasFechas = [];
    for (var fecha = new Date(data.FechaInicio); fecha <= data.FechaFin; fecha.setDate(fecha.getDate() + 1)) {
      nuevasFechas.push({
        Fecha: dateFormat(fecha, 'yyyyMMdd'),
        IdCama: data.IdCama,
        IdHabitacion: data.IdHabitacion,
        IdModulo: data.IdModulo
      });
    }
    let { FechaInicio, FechaFin, IdCampamento, IdReserva, IdPersona } = data;
    let param = {
      IdCliente: perfil.IdCliente,
      IdDivision: perfil.IdDivision,
      IdCampamento,
      IdPersona,
      FechaInicio: dateFormat(FechaInicio, 'yyyyMMdd'),
      FechaFin: dateFormat(FechaFin, 'yyyyMMdd'),
      Turno: "F",
      Estado: "P",
      IdUsuario: usuario.username,
      reservas: JSON.stringify(nuevasFechas),
      IdReserva
    };

    /**************************************** */
    //Validar: 
    let mensaje = await validarRangoPermanencia();

    if (mensaje !== '') {
      setIsVisibleEditPopup(false);
      handleInfoMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), mensaje);
      return;
    }
    /**************************************** */

    setLoading(true);
    actualizar(param).then(response => {
      handleSuccessMessages(
        intl.formatMessage({ id: "MESSAGES.SUCESS" }),
        intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" })
      );
      setIsVisibleEditPopup(false);
      setRefreshData(true);
    }).catch(error => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), error);
    }).finally(() => {
      setLoading(false);
    });
  };

  const validarRangoPermanencia = async () => {
    let mensaje = '';
    //console.log("buscarReservas_onClick", { selected });

    var RangoSeleccionado = selected.FechaFin - selected.FechaInicio + 1;
    let CantidadDiasSeleccionados = RangoSeleccionado / (1000 * 60 * 60 * 24) + 1; // (1000*60*60*24) --> milisegundos -> segundos -> minutos -> horas -> días
    let filterName = selected.Campamento;
    //console.log("buscarReservas_onClick|filterName", filterName);
    await obtnerCampamento({
      IdDivision: perfil.IdDivision,
      IdCampamento: selected.IdCampamento
    })
      .then(data => {
        if (Math.round(CantidadDiasSeleccionados) > parseInt(data.DiasPermanencia)) {
          mensaje = intl.formatMessage({ id: "CAMP.RESERVATION.MSG.VALID.HOTEL" }) +
            filterName +
            intl.formatMessage({ id: "CAMP.RESERVATION.MSG.VALID.PERMANENCE" }) +
            data.DiasPermanencia +
            intl.formatMessage({ id: "CAMP.RESERVATION.MSG.VALID.DAYS" }) +
            intl.formatMessage({ id: "CAMP.RESERVATION.MSG.VALID.DATES" }) +
            data.DiasPermanencia +
            intl.formatMessage({ id: "CAMP.RESERVATION.MSG.VALID.DAYS" })
            ;
        }
      })
      .catch(err => { })
      .finally(() => { });
    return mensaje;
  };

  const componenteMasivoPersonaReserva = () => {
    return !modoEdicion
      ? <>
        <ReservaFiltrarListPage
          // titulo={titulo}
          showButtons={false}
          seleccionarRegistro={seleccionarRegistro}
          editarRegistro={editarRegistro}
          eliminarRegistro={eliminarRegistro}
          checkIn={mostrarPopupCheckin}
          checkOut={mostrarPopupCheckout}
          detail={mostrarDetalle}
          // verRegistroDblClick={verRegistroDblClick}
          uniqueId={"campamentoReservaList"}
          focusedRowKey={focusedRowKey}
          setFocusedRowKey={setFocusedRowKey}
          isFirstDataLoad={isFirstDataLoad}
          setIsFirstDataLoad={setIsFirstDataLoad}
          dataSource={dataSource}
          refresh={refresh}
          resetLoadOptions={resetLoadOptions}
          refreshData={refreshData}
          setRefreshData={setRefreshData}
          filterData={filterData}
          setFilterData={setFilterData}
          setVarIdReserva={setVarIdReserva}
          totalRowIndex={totalRowIndex}
          setTotalRowIndex={setTotalRowIndex}
          setModoEdicion={setModoEdicion}
        />
        {isVisibleEditPopup && (
          <ReservaEditDatePage
            isVisiblePopup={isVisibleEditPopup}
            setIsVisiblePopup={setIsVisibleEditPopup}
            setDataRowEditNew={setSelected}
            dataRowEditNew={selected}
            cancelarEdicion={cancelarEdicion}
            titulo={`${intl.formatMessage({ id: "ACTION.EDIT" })} ${intl.formatMessage({ id: "CAMP.RESERVATION.TAB" })}`}
            getInfo={getInfo}
            actualizar={actualizarReserva}
          />
        )}
        {
          isVisibleCheckinPopup && (
            <ReservaCheckinPage
              isVisiblePopup={isVisibleCheckinPopup}
              setIsVisiblePopup={setIsVisibleCheckinPopup}
              dataRowEditNew={selected}
              cancelarCheckin={cancelarCheckin}
              titulo={intl.formatMessage({ id: "CAMP.CAMP.CHECKIN" }).toUpperCase()}
              checkin={checkIn}
            />
          )
        }
        {
          isVisibleCheckoutPopup && (
            <ReservaCheckoutPage
              isVisiblePopup={isVisibleCheckoutPopup}
              setIsVisiblePopup={setIsVisibleCheckoutPopup}
              dataRowEditNew={selected}
              cancelarCheckout={cancelarCheckout}
              checkout={checkOut}
            />
          )
        }
      </>
      : <MasivoPersonaReserva
        getInfo={getInfo}
        dataRowEditNew={dataRowEditNew}
        setDataRowEditNew={setDataRowEditNew}
        consultarDisponibilidadCamas={consultarDisponibilidadCamas}
        retornarReserva={retornarReserva}
        validarDatosPersona={validarDatosPersona}
        personasValidadas={personasValidadas}
        setPersonasValidadas={setPersonasValidadas}
        procesarPersonas={procesarPersonas}
        procesados={procesados}
        setProcesados={setProcesados}
        setModoEdicion={setModoEdicion}
      />
  }

  const validarDatosPersona = async (personas) => {
    setPersonasValidadas(personas);
    setProcesados(false);
  }

  const procesarPersonas = async (personas) => {
    //console.log(dataRowEditNew);
    //console.log(personas);

    let param = {
      IdCliente: perfil.IdCliente,
      IdDivision: perfil.IdDivision,
      IdPerfil: dataRowEditNew.IdPerfil,
      IdCampamento: dataRowEditNew.IdCampamento,
      FechaInicio: dateFormat(dataRowEditNew.FechaInicio, "yyyyMMdd"),  //new Date(dataRowEditNew.FechaInicio).toLocaleString(),
      FechaFin: dateFormat(dataRowEditNew.FechaFin, "yyyyMMdd"), //new Date(dataRowEditNew.FechaFin).toLocaleString(),
      ListaPersona: personas,
      IdUsuario: usuario.username,
      Regimen: dataRowEditNew.Tipo == "0" ? "0" : "1"
    };

    setLoading(true);
    await reservamasiva(param).then(resp => {
      //console.log(resp);
      setPersonasValidadas(resp);
      setProcesados(true);
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
    }).catch(error => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.ERROR" }), error);
      setProcesados(false);
    }).finally(() => {
      setLoading(false);
    });

  }

  const mostrarAccionConfirm = (dataRow, confirm) => {
    if (confirm) {
      switch (opcionConfirm) {
        case 1:
          eliminarRegistro(dataRow, true);
          break;
        case 2:
          checkIn(dataRow, true);
          break;
        case 3:
          checkOut(dataRow, true);
          break;
        default:
          return;
      }
    }
  };

  return (
    <div className="TabNavContainerScrollableTable">
      <TabNavContainer
        title={intl.formatMessage({ id: "CAMP.PROFILE.MENU" })}
        submenu={intl.formatMessage({ id: "CONFIG.MENU.CAMPAMENTOS.GESTIÓN_DE_CAMPAMENTO"})}
        subtitle={intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })}
        nombrebarra={intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })}
        tabIndex={tabIndex}
        handleChange={handleChange}
        value={value}
        componentTabsHeaders={[
          {
            label: intl.formatMessage({ id: "CAMP.RESERVATION.TAB" }),
            icon: <LocalMallOutlinedIcon fontSize="large" />,
            onclick: () => { }
          }
        ]}//{label,icon,onClick}
        componentTabsBody={[
          componenteMasivoPersonaReserva(),
        ]}
      />
      <Confirm
        message={mensaje}
        isVisible={isVisible}
        setIsVisible={setIsVisible}
        setInstance={setInstance}
        onConfirm={() => mostrarAccionConfirm(selectedAccion, true)}
        title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
        confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
        cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
      />
    </div>
  );
};

export default injectIntl(WithLoandingPanel(MasivoPersonaIndex));
