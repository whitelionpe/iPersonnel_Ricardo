import React, { useEffect, useState } from "react";
import { handleErrorMessages, handleSuccessMessages } from "../../../../store/ducks/notify-messages";
import { useStylesEncabezado, useStylesTab } from "../../../../store/config/Styles";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import Confirm from "../../../../partials/components/Confirm";
import { useSelector } from "react-redux";
import { isNotEmpty } from "../../../../../_metronic";
import { getButtonPermissions, defaultPermissions, setDisabledTabs } from '../../../../../_metronic/utils/securityUtils'
import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";
import { eliminar, obtener, listar, crear, actualizar } from "../../../../api/acceso/horario.api";
import { listar as listarDias, crear as crearDia, actualizar as actualizarDia, eliminar as eliminarDia, validaExiste as ValidaExisteHorarios } from "../../../../api/acceso/horarioDia.api";
import HorarioListPage from "./HorarioListPage";
import HorarioEditPage from "./HorarioEditPage";
import HorarioDetalleListPage from "./HorarioDetalleListPage";
import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import AccessTime from '@material-ui/icons/AccessTime';
import BlurLinear from '@material-ui/icons/BlurLinear';

//Multi-idioma
import { injectIntl } from "react-intl";

import TabNavContainer from "../../../../partials/components/Tabs/TabNavContainer";

const varFechaReferencia = "20200525"; //Fecha de referencia del calendario.

const HorarioIndexPage = (props) => {
  //Multi idioma
  const { intl, setLoading, dataMenu } = props;

  const usuario = useSelector(state => state.auth.user);
  const perfil = useSelector(state => state.perfil.perfilActual);

  const [varIdHorario, setVarIdHorario] = useState("");
  const [focusedRowKey, setFocusedRowKey] = useState();
  const [horariosData, setHorariosData] = useState([]);

  //Datos principales
  const [selected, setSelected] = useState({ IdCliente: perfil.IdCliente, IdDivision: perfil.IdDivision });

  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);

  const [listarTabs, setListarTabs] = useState([]);

  const classesEncabezado = useStylesEncabezado();
  const classes = useStylesTab();
  const [tabIndex, setTabIndex] = useState(0);

  const handleChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const [isVisible, setIsVisible] = useState(false);
  const [instance, setInstance] = useState({});

  //::::::::::::::::::::::::::::FUNCIONES PARA GESTION PERFIL-:::::::::::::::::::::::::::::::::::

  async function agregarHorario(data) {
    setLoading(true);
    const { IdCliente, IdDivision } = selected;
    const { IdHorario, Horario, Activo } = data;
    let param = {
      IdCliente,
      IdDivision,
      IdHorario: isNotEmpty(IdHorario) ? IdHorario.toUpperCase() : "",
      Horario: isNotEmpty(Horario) ? Horario.toUpperCase() : "",
      Activo: Activo,
      IdUsuario: usuario.username
    };
    await crear(param)
      .then(response => {
        if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));

        listarHorarios();
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
  }

  async function actualizarHorario(data) {
    setLoading(true);
    const { IdCliente, IdDivision } = selected;
    const { IdHorario, Horario, Activo } = data;
    let params = {
      IdCliente,
      IdDivision,
      IdHorario: isNotEmpty(IdHorario) ? IdHorario.toUpperCase() : "",
      Horario: isNotEmpty(Horario) ? Horario.toUpperCase() : "",
      Activo: Activo,
      IdUsuario: usuario.username
    };
    await actualizar(params).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      listarHorarios();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function eliminarRegistro(data, confirm) {

    setSelected(data);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdHorario, IdCliente, IdDivision } = data;
      await eliminar({
        IdCliente,
        IdDivision,
        IdHorario,
      }).then(() => {
        setFocusedRowKey();
        setVarIdHorario("");
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
      listarHorarios();
    }
  }

  async function listarHorarios() {
    setLoading(true);
    await listar({
      IdCliente: perfil.IdCliente,
      IdDivision: perfil.IdDivision
    }).then(horarios => {
      setModoEdicion(false);
      setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
      setHorariosData(horarios);
      changeTabIndex(0);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });

  }

  async function obtenerHorario() {
    setLoading(true);
    const { IdCliente, IdDivision, IdHorario } = selected;
    await obtener({
      IdCliente,
      IdDivision,
      IdHorario
    }).then(horario => {
      setDataRowEditNew({ ...horario, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });

  }

  const nuevoRegistro = () => {
    changeTabIndex(1);
    let horario = {
      Activo: "S",
      FechaRegistro: new Date().toJSON().slice(0, 10)
    };
    setDataRowEditNew({ ...horario, esNuevoRegistro: true });
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
    setVarIdHorario("");
  };


  const editarRegistro = dataRow => {
    changeTabIndex(1);
    const { IdHorario } = dataRow;
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    setModoEdicion(true);
    obtenerHorario(IdHorario);
  };

  const cancelarEdicion = () => {
    changeTabIndex(0);
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };

  const seleccionarRegistro = dataRow => {
    const { IdHorario, RowIndex } = dataRow;

    if (IdHorario !== varIdHorario) {
      setSelected(dataRow);
      setVarIdHorario(IdHorario);
      setFocusedRowKey(RowIndex);
      setModoEdicion(false);
      setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
    }
  }

  const verRegistroDblClick = async (dataRow) => {
    changeTabIndex(1);
    setModoEdicion(false);
    await obtenerHorario(dataRow);
  };

  /************--Configuración de acceso de botones***********************/
  const [accessButton, setAccessButton] = useState(defaultPermissions);

  const loadControlsPermission = () => {
    const numeroTabs = 3; //Nùmero de tab del formulario.
    let buttonsPermissions = getButtonPermissions(dataMenu.objetos);
    let newTabs = setDisabledTabs(dataMenu.objetos, numeroTabs);
    setAccessButton({ ...accessButton, ...buttonsPermissions, Tabs: newTabs });
  }
  /***********************************************************************/

  useEffect(() => {
    listarHorarios();
    loadControlsPermission();
  }, []);

  //::::::::::::::::::::::FUNCIONES DETALLE HORARIO :::::::::::::::::::::::::::::::::::::::::::::::::

  async function listarHorarioDia() {
    setLoading(true);
    let sCheduler = [];
    const { IdCliente, IdDivision, IdHorario } = selected;
    await listarDias({ IdCliente, IdDivision, IdHorario, FechaReferencia: varFechaReferencia })
      .then(horarioDia => {
        //Construir data del calendario
        if (isNotEmpty(horarioDia)) {
          horarioDia.map(data => {
            var x = new Date(data.HoraInicio);
            var y = new Date(data.HoraFin);
            let row = {
              text: data.Evento,
              startDate: new Date(x.getFullYear(), x.getMonth(), x.getDate(), x.getHours(), x.getMinutes()),
              endDate: new Date(y.getFullYear(), y.getMonth(), y.getDate(), y.getHours(), y.getMinutes()),
              IdHorario: data.IdHorario,
              Dia: data.Dia,
              Intervalo: data.Intervalo,
            };
            sCheduler.push(row);
          });
        }
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false) });
    setListarTabs(sCheduler);
    setModoEdicion(false);
  }

  async function crearHorarioDia(data, isRemove) {
    setLoading(true);
    const { IdCliente, IdDivision, IdHorario } = selected;
    const { HoraInicio, HoraFin, Dia, Intervalo } = data;
    let param = {
      IdCliente,
      IdDivision,
      IdHorario,
      Intervalo: isNotEmpty(Intervalo) ? Intervalo : 0,
      Dia: isNotEmpty(Dia) ? Dia : "",
      HoraInicio: isNotEmpty(HoraInicio) ? HoraInicio : "",
      HoraFin: isNotEmpty(HoraFin) ? HoraFin : "",
      IdUsuario: usuario.username
    };
    if (isRemove) {
      await Promise.all(
        data.arrayRemove.map(async (item) => {
          await eliminarDia({ ...item, IdUsuario: usuario.username });
        })
      )
    }
    await crearDia(param)
      .then(response => {
        if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
        listarHorarioDia();
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
  }

  async function actualizarHorarioDia(data, isRemove) {
    setLoading(true);
    const { IdCliente, IdDivision, IdHorario } = selected;
    const { HoraInicio, HoraFin, Dia, Intervalo } = data;
    let param = {
      IdCliente,
      IdDivision,
      IdHorario,
      Intervalo: isNotEmpty(Intervalo) ? Intervalo : 0,
      Dia: isNotEmpty(Dia) ? Dia : "",
      HoraInicio: isNotEmpty(HoraInicio) ? HoraInicio : "",
      HoraFin: isNotEmpty(HoraFin) ? HoraFin : "",
      IdUsuario: usuario.username
    };
    if (isRemove) {
      await Promise.all(
        data.arrayRemove.map(async (item) => {
          await eliminarDia({ ...item, IdUsuario: usuario.username });
        })
      )
    }
    //>Eliminar con datos del cliente
    await actualizarDia(param).then(data => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      listarHorarioDia();
    }).catch(err => { }).finally(() => { setLoading(false); });

  }

  async function eliminarHorarioDia(data) {
    setLoading(true);
    const { IdCliente, IdDivision, IdHorario } = selected;
    const { HoraInicio, HoraFin, Dia, Intervalo } = data;
    await eliminarDia({
      IdCliente,
      IdDivision,
      IdHorario,
      Intervalo: isNotEmpty(Intervalo) ? Intervalo : 0,
      Dia: isNotEmpty(Dia) ? Dia : "",
      HoraInicio: isNotEmpty(HoraInicio) ? HoraInicio : "",
      HoraFin: isNotEmpty(HoraFin) ? HoraFin : "",
      IdUsuario: usuario.username
    }).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      listarHorarioDia();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }


  //Datos Principales
  const changeTabIndex = (index) => {
    handleChange(null, index);
  }

  function getInfo() {
    const { IdHorario, Horario } = selected;
    return [
      { text: [intl.formatMessage({ id: "COMMON.CODE" })], value: IdHorario, colSpan: 2 },
      { text: [intl.formatMessage({ id: "ACCESS.SCHEDULE.SCHEDULE" })], value: Horario, colSpan: 4 }
    ];
  }

  //:::::::::::::::::::::::::::::::::::::::::::::-Configuración de tabs-:::::::::::::::::::::::::::::::::
  const titleHeaderToolbar = () => {
    let tabsTitles = [
      "", 
      "",
      "COMMON.DETAIL"
    ];

    let sufix = tabsTitles[tabIndex] !== "" ? (" - " + `${intl.formatMessage({ id: tabsTitles[tabIndex] })}`): "";
    
    return `${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} ` + " " + sufix;
  }
  const tabsDisabled = () => {
    return isNotEmpty(varIdHorario) ? false : true;
  }

  const tabContent_HorarioListPage = () => {
    return <HorarioListPage
      horariosData={horariosData}
      titulo={titulo}
      editarRegistro={editarRegistro}
      eliminarRegistro={eliminarRegistro}
      nuevoRegistro={nuevoRegistro}
      seleccionarRegistro={seleccionarRegistro}
      verRegistroDblClick={verRegistroDblClick}
      focusedRowKey={focusedRowKey}
      accessButton={accessButton}
    />
  }

  const tabContent_HorarioEditPage = () => {
    return <>
      <HorarioEditPage
        titulo={titulo}
        modoEdicion={modoEdicion}
        dataRowEditNew={dataRowEditNew}
        actualizarHora={actualizarHorario}
        agregarHora={agregarHorario}
        cancelarEdicion={cancelarEdicion}
        accessButton={accessButton}
        settingDataField={dataMenu.datos}
      />
      <div className="container_only">
        <div className="float-right">
          <ControlSwitch
            checked={auditoriaSwitch}
            onChange={e => { setAuditoriaSwitch(e.target.checked) }}
          /><b> {intl.formatMessage({ id: "AUDIT.DATA" })} </b>
        </div>
      </div>
      {auditoriaSwitch && (<AuditoriaPage dataRowEditNew={dataRowEditNew} />)}
    </>
  }

  const tabContent_HorarioDetalleListPage = () => {
    return <>
      <HorarioDetalleListPage
        horarioDias={listarTabs}
        nuevoRegistro={crearHorarioDia}
        cancelarEdicion={cancelarEdicion}
        actualizarHorarioDia={actualizarHorarioDia}
        eliminarHorarioDia={eliminarHorarioDia}
        getInfo={getInfo}
        idHorario={varIdHorario}
        listarHorarioDia={listarHorarioDia}
      />
    </>
  }

  //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  return (
    <>
      <TabNavContainer
        title={intl.formatMessage({ id: "ACCESS.PROFILE.MENU" })}
        submenu={intl.formatMessage({ id: "CONFIG.MENU.ACCESO.HORARIOS_Y_GRUPOS" })}
        subtitle={`${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} `}     
        nombrebarra={titleHeaderToolbar()} 
        tabIndex={tabIndex}
        handleChange={handleChange}
        componentTabsHeaders={[
          {
            label: intl.formatMessage({ id: "ACTION.LIST" }),
            icon: <FormatListNumberedIcon fontSize="large" />,
          },
          {
            label: intl.formatMessage({ id: "ACCESS.SCHEDULE.SCHEDULE" }),
            icon: <AccessTime fontSize="large" />,
            onClick: (e) => { obtenerHorario(selected) },
            disabled: tabsDisabled()
          },
          {
            label: intl.formatMessage({ id: "COMMON.DETAIL" }),
            icon: <BlurLinear fontSize="large" />,
            onClick: (e) => { listarHorarioDia() },
            disabled: !tabsDisabled() && accessButton.Tabs[2] ? false : true
          }
        ]}
        className={classes.tabContent}
        componentTabsBody={
          [
            tabContent_HorarioListPage(),
            tabContent_HorarioEditPage(),
            tabContent_HorarioDetalleListPage()
          ]
        }
      />
      <Confirm
        message={intl.formatMessage({ id: "ACCESS.SCHEDULE.REMOVE" })}
        isVisible={isVisible}
        setIsVisible={setIsVisible}
        setInstance={setInstance}
        onConfirm={() => eliminarRegistro(selected, true)}
        title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
        confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
        cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
      />
    </>
  );
};

export default injectIntl(WithLoandingPanel(HorarioIndexPage));
