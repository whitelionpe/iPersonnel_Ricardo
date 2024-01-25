import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { useSelector } from "react-redux";
import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import DevicesOtherOutlinedIcon from '@material-ui/icons/DevicesOtherOutlined';
import PhotoCameraOutlinedIcon from '@material-ui/icons/PhotoCameraOutlined';
import PermDataSettingIcon from '@material-ui/icons/PermDataSetting';
import BallotIcon from '@material-ui/icons/Ballot';

import { handleErrorMessages, handleSuccessMessages } from "../../../../store/ducks/notify-messages";
import { getButtonPermissions, defaultPermissions, setDisabledTabs } from '../../../../../_metronic/utils/securityUtils'
import { isNotEmpty } from "../../../../../_metronic";
import { useStylesTab } from "../../../../store/config/Styles";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import Confirm from "../../../../partials/components/Confirm";
import TabNavContainer from "../../../../partials/components/Tabs/TabNavContainer";
import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";

import { uploadFile } from "../../../../api/helpers/fileBase64.api";
import { obtenerTodos as obtenerTipoEquipoApi } from "../../../../api/sistema/tipoequipo.api";
import { serviceEquipo } from "../../../../api/sistema/equipo.api";
import { obtener as obtenerFoto, crear as crearFoto, actualizar as actualizarFoto } from "../../../../api/sistema/equipoFoto.api";
import { listar as listarEquipoMant, obtener as obtenerEquipoMant, crear as crearEquipoMant, actualizar as actualizarEquipoMant, eliminar as eliminarEquipoMant, eliminarxtipo as eliminarFotoByTipo, } from "../../../../api/sistema/equipomantenimiento.api";
import { serviceEquipoAsignado } from "../../../../api/sistema/equipoAsignado.api";
import { obtenerModuloConLicencia } from "../../../../api/sistema/modulo.api";

import EquipoListPage from "./EquipoListPage";
import EquipoEditPage from "./EquipoEditPage";
import EquipoFotoEditPage from "./EquipoFotoEditPage";
import EquipoMantenimientoListPage from "./EquipoMantenimientoListPage";
import EquipoMantenimientoEditPage from "./EquipoMantenimientoEditPage";
import EquipoEditAsignacionPage from "./EquipoEditAsignacionPage";
import EquipoListarAsignacionPage from "./EquipoListarAsignacionPage";
import { obtener as obtenerSistemaConfiguracion } from "../../../../api/sistema/configuracion.api";


const EquipoIndexPage = (props) => {
  const { intl, setLoading, dataMenu } = props;

  const usuario = useSelector(state => state.auth.user);
  const perfil = useSelector(state => state.perfil.perfilActual);
  const classes = useStylesTab();

  const [tabIndex, setTabIndex] = useState(0);
  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.EDIT" }));
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
  const [listar, setListar] = useState([]);
  const [selected, setSelected] = useState({});
  const [tipoEquipos, setTipoEquipos] = useState([]);
  const [varIdEquipo, setVarIdEquipo] = useState("");
  const [, setVarIdTipoEquipoHijo] = useState("%");
  const [focusedRowKey, setFocusedRowKey] = useState();
  const [focusedRowKeyEquipoMant, setFocusedRowKeyEquipoMant] = useState();
  const [focusedRowKeyEquipoAsig, setFocusedRowKeyEquipoAsig] = useState();
  const [listarTabs, setListarMant] = useState([]);
  const [listarAsignacion, setListarAsignacion] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [confirmarDeletexFoto, setConfirmarDeletexFoto] = useState(false);
  const [, setInstance] = useState({});
  const [dataRowEditNewMant, setDataRowEditNewMant] = useState({});
  const [dataRowEditNewAsignar, setDataRowEditNewAsignar] = useState([]);
  const [tituloTabs, setTituloTabs] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  const [accessButton, setAccessButton] = useState(defaultPermissions);
  const [moduloData, setModuloData] = useState([]);

  const [alturaSugerido, setAlturaSugerido] = useState();
  const [anchoSugerido, setAnchoSugerido] = useState();
  const [alturaSugeridoRadio, setAlturaSugeridoRadio] = useState();
  const [anchoSugeridoRadio, setAnchoSugeridoRadio] = useState();
  const [selectedDeletexFoto, setSelectedDeletexFoto] = useState({});

  const handleChange = (event, newValue) => {
    setTabIndex(newValue);
  };
  const changeTabIndex = (index) => {
    handleChange(null, index);
  }

  //::::::::::::::::::::::::::::::::::::::::::::: EQUIPO :::::::::::::::::::::::::::::::::
  async function listarEquipo() {
    setLoading(true);
    changeTabIndex(0);
    setModoEdicion(false);

    await serviceEquipo.listar({
      IdCliente: perfil.IdCliente,
      IdTipoEquipo: '%',
      IdModelo: '%',
      IdTipoLectura: '%',
      NumPagina: 0,
      TamPagina: 0
    }).then(equipos => {
      setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
      setListar(equipos);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });
  }

  async function agregarEquipo(equipo) {
    setLoading(true);
    const { IdEquipo
      , Equipo
      , IdTipoEquipo
      , IdModelo
      , IdEquipoPadre
      , MacAddress
      , NumeroSerie
      , FuncionEntradaSalida
      , IP
      , Mascara
      , Gateway
      , IPServer
      , HostName
      , COMVirtual
      , SalidaVerde
      , SalidaRojo
      , BitsxSegundo
      , BitsDatos
      , Paridad
      , BitsParada
      , IdTipoLectura
      , DiferenciaHoraria
      , Activo

      , UsoGeolocalizacion
      , NumeroPuerto
      , HablitarControlxPin
      , Licencia
      , PrinterName

    } = equipo;

    let data = {
      IdEquipo: isNotEmpty(IdEquipo) ? IdEquipo.toUpperCase() : ""
      , Equipo: isNotEmpty(Equipo) ? Equipo.toUpperCase() : ""
      , IdTipoEquipo: isNotEmpty(IdTipoEquipo) ? IdTipoEquipo.toUpperCase() : ""
      , IdModelo: isNotEmpty(IdModelo) ? IdModelo.toUpperCase() : ""
      , IdEquipoPadre: isNotEmpty(IdEquipoPadre) ? IdEquipoPadre : ""
      , MacAddress: isNotEmpty(MacAddress) ? MacAddress.toUpperCase() : ""
      , NumeroSerie: isNotEmpty(NumeroSerie) ? NumeroSerie.toUpperCase() : ""
      , FuncionEntradaSalida: isNotEmpty(FuncionEntradaSalida) ? FuncionEntradaSalida : ""
      , IP: isNotEmpty(IP) ? IP.toUpperCase() : ""
      , Mascara: isNotEmpty(Mascara) ? Mascara.toUpperCase() : ""
      , Gateway: isNotEmpty(Gateway) ? Gateway.toUpperCase() : ""
      , IPServer: isNotEmpty(IPServer) ? IPServer.toUpperCase() : ""
      , HostName: isNotEmpty(HostName) ? HostName.toUpperCase() : ""
      , COMVirtual: isNotEmpty(COMVirtual) ? COMVirtual.toUpperCase() : ""
      , SalidaVerde: isNotEmpty(SalidaVerde) ? SalidaVerde.toUpperCase() : ""
      , SalidaRojo: isNotEmpty(SalidaRojo) ? SalidaRojo.toUpperCase() : ""
      , BitsxSegundo: isNotEmpty(BitsxSegundo) ? BitsxSegundo.toUpperCase() : ""
      , BitsDatos: isNotEmpty(BitsDatos) ? BitsDatos.toUpperCase() : ""
      , Paridad: isNotEmpty(Paridad) ? Paridad.toUpperCase() : ""
      , BitsParada: isNotEmpty(BitsParada) ? BitsParada.toUpperCase() : ""
      , IdTipoLectura: isNotEmpty(IdTipoLectura) ? IdTipoLectura.toUpperCase() : ""
      , DiferenciaHoraria: isNotEmpty(DiferenciaHoraria) ? DiferenciaHoraria : ""
      , IdCliente: perfil.IdCliente
      , Activo
      , IdUsuario: usuario.username

      , UsoGeolocalizacion: isNotEmpty(UsoGeolocalizacion) ? UsoGeolocalizacion.toUpperCase() : ""
      , NumeroPuerto: isNotEmpty(NumeroPuerto) ? NumeroPuerto.toUpperCase() : ""
      , HablitarControlxPin: isNotEmpty(HablitarControlxPin) ? HablitarControlxPin.toUpperCase() : ""
      , Licencia: isNotEmpty(Licencia) ? Licencia.toUpperCase() : ""
      , PrinterName: isNotEmpty(PrinterName) ? PrinterName.toUpperCase() : ""

    };

    await serviceEquipo.crear(data).then(response => {
      if (response)
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      setModoEdicion(false);
      listarEquipo();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });
  }

  async function actualizarEquipo(equipo) {
    setLoading(true);
    const { IdEquipo
      , Equipo
      , IdTipoEquipo
      , IdModelo
      , IdEquipoPadre
      , MacAddress
      , NumeroSerie
      , FuncionEntradaSalida
      , IP
      , Mascara
      , Gateway
      , IPServer
      , HostName
      , COMVirtual
      , SalidaVerde
      , SalidaRojo
      , BitsxSegundo
      , BitsDatos
      , Paridad
      , BitsParada
      , IdTipoLectura
      , DiferenciaHoraria
      , Activo

      , UsoGeolocalizacion
      , NumeroPuerto
      , HablitarControlxPin
      , Licencia
      , PrinterName

    } = equipo;

    let data = {
      IdEquipo: isNotEmpty(IdEquipo) ? IdEquipo.toUpperCase() : ""
      , Equipo: isNotEmpty(Equipo) ? Equipo.toUpperCase() : ""
      , IdTipoEquipo: isNotEmpty(IdTipoEquipo) ? IdTipoEquipo.toUpperCase() : ""
      , IdModelo: isNotEmpty(IdModelo) ? IdModelo.toUpperCase() : ""
      , IdEquipoPadre: isNotEmpty(IdEquipoPadre) ? IdEquipoPadre : ""
      , MacAddress: isNotEmpty(MacAddress) ? MacAddress.toUpperCase() : ""
      , NumeroSerie: isNotEmpty(NumeroSerie) ? NumeroSerie.toUpperCase() : ""
      , FuncionEntradaSalida: isNotEmpty(FuncionEntradaSalida) ? FuncionEntradaSalida : ""
      , IP: isNotEmpty(IP) ? IP.toUpperCase() : ""
      , Mascara: isNotEmpty(Mascara) ? Mascara.toUpperCase() : ""
      , Gateway: isNotEmpty(Gateway) ? Gateway.toUpperCase() : ""
      , IPServer: isNotEmpty(IPServer) ? IPServer.toUpperCase() : ""
      , HostName: isNotEmpty(HostName) ? HostName.toUpperCase() : ""
      , COMVirtual: isNotEmpty(COMVirtual) ? COMVirtual.toUpperCase() : ""
      , SalidaVerde: isNotEmpty(SalidaVerde) ? SalidaVerde.toUpperCase() : ""
      , SalidaRojo: isNotEmpty(SalidaRojo) ? SalidaRojo.toUpperCase() : ""
      , BitsxSegundo: isNotEmpty(BitsxSegundo) ? BitsxSegundo.toUpperCase() : ""
      , BitsDatos: isNotEmpty(BitsDatos) ? BitsDatos.toUpperCase() : ""
      , Paridad: isNotEmpty(Paridad) ? Paridad.toUpperCase() : ""
      , BitsParada: isNotEmpty(BitsParada) ? BitsParada.toUpperCase() : ""
      , IdTipoLectura: isNotEmpty(IdTipoLectura) ? IdTipoLectura.toUpperCase() : ""
      , DiferenciaHoraria: isNotEmpty(DiferenciaHoraria) ? DiferenciaHoraria : ""
      , IdCliente: perfil.IdCliente
      , Activo
      , IdUsuario: usuario.username

      , UsoGeolocalizacion: isNotEmpty(UsoGeolocalizacion) ? UsoGeolocalizacion.toUpperCase() : ""
      , NumeroPuerto: isNotEmpty(NumeroPuerto) ? NumeroPuerto.toUpperCase() : ""
      , HablitarControlxPin: isNotEmpty(HablitarControlxPin) ? HablitarControlxPin.toUpperCase() : ""
      , Licencia: isNotEmpty(Licencia) ? Licencia.toUpperCase() : ""
      , PrinterName: isNotEmpty(PrinterName) ? PrinterName.toUpperCase() : ""

    };
    await serviceEquipo.actualizar(data).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      setModoEdicion(false);
      listarEquipo();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });
  }

  async function eliminarEquipo(equipo, confirm) {
    setSelected(equipo);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdEquipo, IdCliente } = equipo;
      await serviceEquipo.eliminar({
        IdEquipo,
        IdCliente,
        IdUsuario: usuario.username
      }).then(response => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
      }).finally(() => { setLoading(false); });
      listarEquipo();
    }
  }

  async function obtenerEquipo() {
    setLoading(true);
    const { IdCliente, IdEquipo } = selected;
    await serviceEquipo.obtener({ IdEquipo, IdCliente }).then(equipo => {
      setDataRowEditNew({ ...equipo, esNuevoRegistro: false })
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });
  }

  async function ListarTipoEquipo(fitro) {
    setLoading(true);
    const { IdTipoEquipo, IdTipoEquipoHijo } = fitro;
    await obtenerTipoEquipoApi({
      IdTipoEquipo,
      IdTipoEquipoHijo
    }).then(tipequipos => {
      setTipoEquipos(tipequipos);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });
  }

  const nuevoRegistroEquipo = async (dataRow) => {
    changeTabIndex(1);
    const { IdEquipo, IdTipoEquipoHijo } = dataRow;
    let equipo = {};
    if (isNotEmpty(IdEquipo)) {
      await ListarTipoEquipo({ IdTipoEquipo: '%', IdTipoEquipoHijo });
      equipo = { Activo: "S", IdEquipoPadre: IdEquipo };
    } else {
      await ListarTipoEquipo({ IdTipoEquipo: '%', IdTipoEquipoHijo: '%' });
      equipo = { Activo: "S", IdEquipoPadre: "" };
    }
    setDataRowEditNew({ ...equipo, esNuevoRegistro: true });
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
  }

  const editarRegistroEquipo = async (dataRow) => {
    // console.log("editarRegistroEquipo|dataRow:",dataRow);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    await obtenerEquipo();
    await ListarTipoEquipo({ IdTipoEquipo: '%', IdTipoEquipoHijo: '%' });
    changeTabIndex(1);
    setModoEdicion(true);
  }

  const cancelarEdicion = () => {
    changeTabIndex(0);
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  }

  const seleccionarRegistro = dataRow => {
    const { IdEquipo, IdTipoEquipoHijo } = dataRow;
    setSelected(dataRow);
    if (IdEquipo !== varIdEquipo) {
      setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
      setVarIdEquipo(IdEquipo);
      setVarIdTipoEquipoHijo(isNotEmpty(IdTipoEquipoHijo) ? IdTipoEquipoHijo : '%');
      setFocusedRowKey(IdEquipo);
    }
  }

  const verRegistroDblClick = async (dataRow) => {
    changeTabIndex(1);
    setModoEdicion(false);
    await obtenerEquipo();
    setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));

  }

  const loadControlsPermission = () => {
    const numeroTabs = 5;
    let buttonsPermissions = getButtonPermissions(dataMenu.objetos);
    let newTabs = setDisabledTabs(dataMenu.objetos, numeroTabs);
    setAccessButton({ ...accessButton, ...buttonsPermissions, Tabs: newTabs });
  }

  const tabContent_EquipoListPage = () => {
    return <EquipoListPage
      equipos={listar}
      editarRegistro={editarRegistroEquipo}
      eliminarRegistro={eliminarEquipo}
      nuevoRegistro={nuevoRegistroEquipo}
      insertarRegistro={nuevoRegistroEquipo}
      seleccionarRegistro={seleccionarRegistro}
      verRegistroDblClick={verRegistroDblClick}
      modoEdicion={modoEdicion}
      focusedRowKey={focusedRowKey}
      accessButton={accessButton}
    />
  }

  const tabContent_EquipoEditPage = () => {
    return <>
      <EquipoEditPage
        modoEdicion={modoEdicion}
        dataRowEditNew={dataRowEditNew}
        actualizarEquipo={actualizarEquipo}
        agregarEquipo={agregarEquipo}
        cancelarEdicion={cancelarEdicion}
        titulo={titulo}
        tipoEquipos={tipoEquipos}
        accessButton={accessButton}
        settingDataField={dataMenu.datos}

      />
      <div className="container_only">
        <div className="float-right">
          <ControlSwitch checked={auditoriaSwitch}
            onChange={e => { setAuditoriaSwitch(e.target.checked) }}
          /><b>  {intl.formatMessage({ id: "AUDIT.DATA" })}</b>
        </div>
      </div>
      {auditoriaSwitch && (<AuditoriaPage dataRowEditNew={dataRowEditNew} />)}
    </>
  }

  //::::::::::::::::::::::::::::::::::::::::::::: FOTO :::::::::::::::::::::::::::::::::
  async function obtenerEquipoFoto(data) {
    setLoading(true);
    const { IdEquipo, IdCliente } = selected;
    if (isNotEmpty(IdEquipo)) {
      let equipoFoto = await obtenerFoto({ IdEquipo, IdCliente }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
      });
      if (isNotEmpty(equipoFoto)) {
        setDataRowEditNewMant({ ...equipoFoto, esNuevoRegistro: false });
      } else {
        let equipo = { IdEquipo, ...selected };
        setDataRowEditNewMant({ ...equipo, esNuevoRegistro: true });

      }
      setLoading(false);
    }
  }

  async function agregarEquipoFoto(equipoFoto) {
    setLoading(true);
    const { IdEquipo, IdCliente, Foto1, Foto2, Foto3, Activo } = equipoFoto;
    let params = {
      IdEquipo
      , IdCliente
      , Foto1: isNotEmpty(Foto1) ? Foto1 : ""
      , Foto2: isNotEmpty(Foto2) ? Foto2 : ""
      , Foto3: isNotEmpty(Foto3) ? Foto3 : ""
      , FechaRegistro: new Date()
      , Activo: Activo
      , IdUsuario: usuario.username
    };
    await crearFoto(params).then(response => {
      if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      obtenerEquipoFoto({ IdEquipo: varIdEquipo });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });
  }

  async function actualizarequipoFoto(equipoFoto) {
    setLoading(true);
    const { IdEquipo, IdCliente, Foto1, Foto2, Foto3, Activo } = equipoFoto;
    let params = {
      IdEquipo
      , IdCliente
      , Foto1: isNotEmpty(Foto1) ? Foto1 : ""
      , Foto2: isNotEmpty(Foto2) ? Foto2 : ""
      , Foto3: isNotEmpty(Foto3) ? Foto3 : ""
      , FechaRegistro: new Date()
      , Activo: Activo
      , IdUsuario: usuario.username
    };
    await actualizarFoto(params).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      obtenerEquipoFoto({ IdEquipo });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });
  }

  const tabContent_EquipoFotoEditPage = () => {
    return <>
      <EquipoFotoEditPage
        dataRowEditNew={dataRowEditNewMant}
        actualizarFoto={actualizarequipoFoto}
        agregarFoto={agregarEquipoFoto}
        cancelarEdicion={cancelarEdicion}
        titulo={tituloTabs}
        size={classes.cardLarge}
        getInfo={getInfo}
      />
      <div className="container_only">
        <div className="float-right">
          <ControlSwitch checked={auditoriaSwitch}
            onChange={e => { setAuditoriaSwitch(e.target.checked) }}
          /><b>  {intl.formatMessage({ id: "AUDIT.DATA" })}</b>
        </div>
      </div>
      {auditoriaSwitch && (<AuditoriaPage dataRowEditNew={dataRowEditNewMant} />)}
    </>
  }

  //==================== MANTENIMIENTO ============================
  const editarEquipoMantenimiento = (dataRow) => {
    const { RowIndex } = dataRow;
    setModoEdicion(true);
    setTituloTabs(intl.formatMessage({ id: "ACTION.EDIT" }));
    obtenerEquipoMantenimiento(dataRow);
    setFocusedRowKeyEquipoMant(RowIndex);
  }

  const seleccionarEquipoMantenimiento = (dataRow) => {
    const { RowIndex } = dataRow;
    setFocusedRowKeyEquipoMant(RowIndex);
  }

  async function agregarEquipoMantenimiento(equipoMantenimiento) {
    setLoading(true);
    const {
      IdSecuencial,
      IdTipoMantenimiento,
      Observacion,
      Descripcion,
      Tecnico,
      FechaInicio,
      FechaFin,
      Foto1,
      Foto2,
      Foto3,
      NombreArchivo,
      IdItemSharepoint,
      FileBase64,
      TipoMantenimiento,
      FechaArchivo
    } = equipoMantenimiento;
    let params = {
      IdCliente: perfil.IdCliente,
      IdEquipo: varIdEquipo,
      IdSecuencial: isNotEmpty(IdSecuencial) ? IdSecuencial : 0,
      IdTipoMantenimiento: isNotEmpty(IdTipoMantenimiento) ? IdTipoMantenimiento : "",
      Observacion: isNotEmpty(Observacion) ? Observacion : "",
      Descripcion: isNotEmpty(Descripcion) ? Descripcion : "",
      Tecnico: isNotEmpty(Tecnico) ? Tecnico : "",
      FechaInicio: isNotEmpty(FechaInicio) ? FechaInicio : "",
      FechaFin: isNotEmpty(FechaFin) ? FechaInicio : "",
      Foto1: isNotEmpty(Foto1) ? Foto1 : "",
      Foto2: isNotEmpty(Foto2) ? Foto2 : "",
      Foto3: isNotEmpty(Foto3) ? Foto3 : "",
      FileBase64: isNotEmpty(FileBase64) ? FileBase64 : "",
      NombreArchivo: isNotEmpty(NombreArchivo) ? NombreArchivo : "",
      IdItemSharepoint: "",

      ClaseArchivo: isNotEmpty(TipoMantenimiento) ? TipoMantenimiento : "",
      FechaArchivo: isNotEmpty(FechaArchivo) ? FechaArchivo : "",
      IdUsuario: usuario.username,
      PathFile: "",
      IdModulo: dataMenu.info.IdModulo,
      IdAplicacion: dataMenu.info.IdAplicacion,
      IdMenu: dataMenu.info.IdMenu
    };
    if (isNotEmpty(FileBase64)) {
      await uploadFile(params).then(response => {
        //Recuperar Nombre archivo.
        const { nombreArchivo, idItemSharepoint } = response;
        params.NombreArchivo = nombreArchivo;
        params.IdItemSharepoint = idItemSharepoint;

        crearEquipoMant(params)
          .then((response) => {
            if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
            listarEquipoMantenimiento();
          })
          .catch((err) => {
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
          }).finally(() => { setLoading(false); });
      }).catch((err) => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
    }else {
      await crearEquipoMant(params)
        .then((response) => {
          if (response)
            handleSuccessMessages(
              intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" })
            );

          listarEquipoMantenimiento();
        })
        .catch((err) => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
        }).finally(() => { setLoading(false); });
    }
  }

  async function actualizarEquipoMantenimiento(dataRow) {
    setLoading(true);
    const {
      IdSecuencial,
      IdTipoMantenimiento,
      Observacion,
      Descripcion,
      Tecnico,
      FechaInicio,
      FechaFin,
      Foto1,
      Foto2,
      Foto3,
      NombreArchivo,
      FileBase64,
      TipoMantenimiento,
      FechaArchivo,IdItemSharepoint
    } = dataRow;
    let params = {
      IdCliente: perfil.IdCliente,
      IdEquipo: varIdEquipo,
      IdSecuencial: isNotEmpty(IdSecuencial) ? IdSecuencial : 0,
      IdTipoMantenimiento: isNotEmpty(IdTipoMantenimiento) ? IdTipoMantenimiento : "",
      Observacion: isNotEmpty(Observacion) ? Observacion : "",
      Descripcion: isNotEmpty(Descripcion) ? Descripcion : "",
      Tecnico: isNotEmpty(Tecnico) ? Tecnico : "",
      FechaInicio: isNotEmpty(FechaInicio) ? FechaInicio : "",
      FechaFin: isNotEmpty(FechaFin) ? FechaFin : "",
      // FechaInicio: isNotEmpty(FechaInicio) ? `${(new Date(FechaInicio)).toLocaleDateString()} ${(new Date(FechaInicio)).toLocaleTimeString()}` : "",
      // FechaFin: isNotEmpty(FechaFin) ? `${(new Date(FechaFin)).toLocaleDateString()} ${(new Date(FechaFin)).toLocaleTimeString()}` : "",
      Foto1: isNotEmpty(Foto1) ? Foto1 : "",
      Foto2: isNotEmpty(Foto2) ? Foto2 : "",
      Foto3: isNotEmpty(Foto3) ? Foto3 : "",
      FileBase64: isNotEmpty(FileBase64) ? FileBase64 : "",
      NombreArchivo: isNotEmpty(NombreArchivo) ? NombreArchivo : "",
      IdItemSharepoint: isNotEmpty(IdItemSharepoint) ? IdItemSharepoint : "",

      ClaseArchivo: isNotEmpty(TipoMantenimiento) ? TipoMantenimiento : "",
      FechaArchivo: isNotEmpty(FechaArchivo) ? FechaArchivo : "",
      IdUsuario: usuario.username,
      path: "",
      IdModulo: dataMenu.info.IdModulo,
      IdAplicacion: dataMenu.info.IdAplicacion,
      IdMenu: dataMenu.info.IdMenu
    };
    if (isNotEmpty(FileBase64)) {
      await uploadFile(params).then(response => {
        //Recuperar Nombre archivo.
        const { nombreArchivo, idItemSharepoint } = response;
        params.NombreArchivo = nombreArchivo;
        params.IdItemSharepoint = idItemSharepoint;

        actualizarEquipoMant(params)
          .then(() => {
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
            listarEquipoMantenimiento();
          })
          .catch((err) => {
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
          }).finally(() => { setLoading(false); });
      }).catch((err) => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
    }
    else {
      await actualizarEquipoMant(params)
        .then(() => {
          handleSuccessMessages(
            intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" })
          );
          listarEquipoMantenimiento();
        })
        .catch((err) => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
        }).finally(() => { setLoading(false); });
    }
  }

  async function eliminarEquipoMantenimiento(equipoMantenimiento, confirm) {
    setSelected(equipoMantenimiento);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdCliente, IdEquipo, IdSecuencial } = equipoMantenimiento;
      await eliminarEquipoMant({
        IdCliente,
        IdEquipo,
        IdSecuencial,
        IdUsuario: usuario.username,
      })
        .then(() => {
          handleSuccessMessages(
            intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" })
          );
        })
        .catch((err) => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
        }).finally(() => { setLoading(false); });
      listarEquipoMantenimiento();
    }
  }


  async function eliminarRegistroxFoto(selectedDelete, confirm) {
    setSelectedDeletexFoto(selectedDelete);
    setConfirmarDeletexFoto(true);

    if (confirm) {
      setLoading(true);
      const { IdCliente, IdEquipo, IdSecuencial, TipoFoto } = selectedDeletexFoto;
      await eliminarFotoByTipo({
        IdCliente,
        IdEquipo,
        IdSecuencial,
        IdUsuario: usuario.username,
        TipoFoto: TipoFoto
      })
        .then((response) => {
          handleSuccessMessages(
            intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" })
          );
        })
        .catch((err) => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
        listarEquipoMantenimiento()
        setDataRowEditNewMant({});
    }

  };

  async function obtenerEquipoMantenimiento(filtro) {
    setLoading(true);
    const { IdCliente, IdEquipo, IdSecuencial } = filtro;
    await obtenerEquipoMant({
      IdCliente,
      IdEquipo,
      IdSecuencial
    }).then(equipoMantenimiento => {
      setDataRowEditNewMant({ ...equipoMantenimiento, esNuevoRegistro: false });
    }).catch((err) => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });
  }

  async function obtenerConfiguracion() {
    await Promise.all([
      obtenerSistemaConfiguracion({ IdCliente: perfil.IdCliente, IdConfiguracion: 'MAXIMAGESIZECLIENTE' }),
      obtenerSistemaConfiguracion({ IdCliente: perfil.IdCliente, IdConfiguracion: 'CLIENTIMAGERATIO' }),
      obtenerSistemaConfiguracion({ IdCliente: perfil.IdCliente, IdConfiguracion: 'SIZEMAXPHOTOUPLOAD' })
    ])
      .then(resp => {
        setAlturaSugerido(resp[0].Valor1)
        setAnchoSugerido(resp[0].Valor2)
        setAlturaSugeridoRadio(resp[1].Valor1)
        setAnchoSugeridoRadio(resp[1].Valor2)

      })
  }

  async function listarEquipoMantenimiento() {
    setLoading(true);
    setModoEdicion(false);
    await listarEquipoMant({
      IdCliente: perfil.IdCliente,
      IdEquipo: varIdEquipo
    }).then(equiposMant => {

      setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
      setListarMant(equiposMant);
      obtenerConfiguracion();
    }).catch((err) => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });

  }

  const tabContent_EquipoMantenimientoListPage = () => {
    return <>
      {modoEdicion && (
        <>

          <EquipoMantenimientoEditPage
            dataRowEditNew={dataRowEditNewMant}
            actualizarEquipoMantenimiento={actualizarEquipoMantenimiento}
            agregarEquipoMantenimiento={agregarEquipoMantenimiento}
            cancelarEdicion={cancelarEdicionTabs}
            eliminarRegistroxFoto={eliminarRegistroxFoto}
            titulo={tituloTabs}
            size={classes.cardLarge}
            accessButton={accessButton}
            modoEdicion={modoEdicion}
            settingDataField={dataMenu.datos}
            idAplicacion={dataMenu.info.IdAplicacion}
            idModulo={dataMenu.info.IdModulo}
            idMenu={dataMenu.info.IdMenu}

            medidaSugeridas={{
              width: anchoSugerido, height: alturaSugerido,
              width_radio: anchoSugeridoRadio, height_radio: alturaSugeridoRadio
            }}

          />
          <div className="container_only">
            <div className="float-right">
              <ControlSwitch
                checked={auditoriaSwitch}
                onChange={(e) => {
                  setAuditoriaSwitch(e.target.checked);
                }}
              />
              <b> {intl.formatMessage({ id: "AUDIT.DATA" })}</b>
            </div>
          </div>
          {auditoriaSwitch && (
            <AuditoriaPage dataRowEditNew={dataRowEditNewMant} />
          )}
        </>
      )}
      {!modoEdicion && (
        <>
          <EquipoMantenimientoListPage
            equiposMant={listarTabs}
            editarRegistro={editarEquipoMantenimiento}
            eliminarRegistro={eliminarEquipoMantenimiento}
            nuevoRegistro={nuevoRegistroTabs}
            cancelarEdicion={cancelarEdicion}
            seleccionarRegistro={seleccionarEquipoMantenimiento}
            focusedRowKey={focusedRowKeyEquipoMant}
            getInfo={getInfo}
            accessButton={accessButton}
            idAplicacion={dataMenu.info.IdAplicacion}
            idModulo={dataMenu.info.IdModulo}
            idMenu={dataMenu.info.IdMenu}
          />
        </>
      )}
    </>
  }

  //:::::::::::::::::::::::::::::::::::::ASIGNACION ::::::::::::::::::::::::::::
  const editarEquipoAsignacion = (dataRow) => {
    const { RowIndex } = dataRow;
    setModoEdicion(true);
    setTituloTabs(intl.formatMessage({ id: "ACTION.EDIT" }));
    setDataRowEditNewAsignar(dataRow);
    setFocusedRowKeyEquipoAsig(RowIndex);
  }

  async function actualizarEquipoAsignar(items) {

    setLoading(true);
    const { IdEquipo, IdModuloAlternativo } = items;

    let data = {
      IdEquipo: isNotEmpty(IdEquipo) ? IdEquipo.toUpperCase() : ""
      , IdDivision: perfil.IdDivision
      , IdModuloAlternativo: isNotEmpty(IdModuloAlternativo) ? IdModuloAlternativo.toUpperCase() : ""
    };
    await serviceEquipoAsignado.actualizar_asignado(data).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      setModoEdicion(false);
      listarAsignacionAlternativo();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });
  }

  const seleccionarEquipoAsignacion = (dataRow) => {
    const { RowIndex } = dataRow;
    setFocusedRowKeyEquipoAsig(RowIndex);
  }

  async function listarAsignacionAlternativo() {
    setLoading(true);
    setModoEdicion(false);

    await serviceEquipoAsignado.listar_asignado({
      IdCliente: perfil.IdCliente,
      IdEquipo: varIdEquipo
    }).then(response => {
      setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
      setListarAsignacion(response);
    }).catch((err) => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });
  }

  async function listarModulo() {
    let listData = await obtenerModuloConLicencia({
      IdCliente: perfil.IdCliente
    }).catch(err => { handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err) });

    let arraysData = [];
    listData.map(item => {
      const { IdModulo, Modulo } = item;
      let setData = {
        IdModuloAlternativo: IdModulo,
        ModuloAlternativo: Modulo
      };
      arraysData.push(setData);
    });

    setModuloData(arraysData);
  }

  const tabContent_EquipoAsignacionListPage = () => {
    return <>
      {modoEdicion && (
        <>
          <EquipoEditAsignacionPage
            dataRowEditNew={dataRowEditNewAsignar}
            actualizarEquipoAsignar={actualizarEquipoAsignar}
            cancelarEdicion={cancelarEdicionTabs}
            titulo={tituloTabs}
            size={classes.cardLarge}
            accessButton={accessButton}
            modoEdicion={modoEdicion}
            settingDataField={dataMenu.datos}
            idAplicacion={dataMenu.info.IdAplicacion}
            idModulo={dataMenu.info.IdModulo}
            idMenu={dataMenu.info.IdMenu}
            moduloData={moduloData}
          />
          <div className="container_only">
            <div className="float-right">
              <ControlSwitch
                checked={auditoriaSwitch}
                onChange={(e) => {
                  setAuditoriaSwitch(e.target.checked);
                }}
              />
              <b> {intl.formatMessage({ id: "AUDIT.DATA" })}</b>
            </div>
          </div>
          {auditoriaSwitch && (
            <AuditoriaPage dataRowEditNew={dataRowEditNewAsignar} />
          )}
        </>
      )}
      {!modoEdicion && (
        <>
          <EquipoListarAsignacionPage
            equiposAsignacion={listarAsignacion}
            editarRegistro={editarEquipoAsignacion}
            cancelarEdicion={cancelarEdicion}
            seleccionarRegistro={seleccionarEquipoAsignacion}
            focusedRowKey={focusedRowKeyEquipoAsig}
            getInfo={getInfo}
            accessButton={accessButton}
            idAplicacion={dataMenu.info.IdAplicacion}
            idModulo={dataMenu.info.IdModulo}
            idMenu={dataMenu.info.IdMenu}
          />
        </>
      )}
    </>
  }

  //:::::::::::::::::::::::::::::::::::::::::::: CONFIG :::::::::::::::::::::::::::::::::
  const getInfo = () => {
    const { TipoEquipo, Equipo, IP } = selected;
    return [
      { text: [intl.formatMessage({ id: "SYSTEM.TEAM.TEAMTYPE" })], value: TipoEquipo, colSpan: 2 },
      { text: [intl.formatMessage({ id: "SYSTEM.DEVICE" })], value: Equipo, colSpan: 2 },
      { text: [intl.formatMessage({ id: "SYSTEM.TEAM.IP" })], value: IP, colSpan: 2 }
    ];
  }

  const nuevoRegistroTabs = () => {
    let nuevo = { Activo: "S" };
    setDataRowEditNewMant({ ...nuevo, esNuevoRegistro: true });
    setTituloTabs(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
  }

  const cancelarEdicionTabs = () => {
    setModoEdicion(false);
    setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNewMant({});
  }

  const titleHeaderToolbar = () => {
    let tabsTitles = [
      "",
      "",
      "SYSTEM.TEAM.PHOTO",
      "SYSTEM.MAINTENANCETYPE.TAB",
      "SYSTEM.TEAM.ASSIGNMENT"
    ];

    let sufix = tabsTitles[tabIndex] !== "" ? (` - ${intl.formatMessage({ id: tabsTitles[tabIndex] })}`) : "";
    return `${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} ${sufix}`;
  }

  const tabsDisabled = () => {
    return isNotEmpty(varIdEquipo) ? false : true;
    //return true;
  }

  async function eliminarListRowTab(selected, confirm) {
    let currentTab = tabIndex;
    switch (currentTab) {
      case 0:
        eliminarEquipo(selected, confirm);
        break;
      case 3:
        eliminarEquipoMantenimiento(selected, confirm);
        break;
      default:
        return;
    }
  }

  useEffect(() => {
    listarEquipo();
    listarModulo();
    // obtenerConfigEquipoMantenimiento();
    loadControlsPermission();
  }, []);

  return (
    <>
      <TabNavContainer
        title={intl.formatMessage({ id: "SYSTEM" }) + " / " + intl.formatMessage({ id: "SYSTEM.TYPE.DEVICE.CONFIGURATION" })}
        subtitle={intl.formatMessage({ id: "SYSTEM.TEAM.MAINTENANCE" })}
        nombrebarra={titleHeaderToolbar()}
        tabIndex={tabIndex}
        handleChange={handleChange}
        //value={''}
        componentTabsHeaders={[
          {
            label: intl.formatMessage({ id: "ACTION.LIST" }),
            icon: <FormatListNumberedIcon fontSize="large" />,
            //onClick: () => { listarUsuarios() },
          },
          {
            label: intl.formatMessage({ id: "SYSTEM.DEVICE" }),
            icon: <DevicesOtherOutlinedIcon fontSize="large" />,
            onClick: (e) => { obtenerEquipo() },
            disabled: tabsDisabled()
          },
          {
            label: intl.formatMessage({ id: "SYSTEM.TEAM.PHOTO" }),
            icon: <PhotoCameraOutlinedIcon fontSize="large" />,
            onClick: (e) => { obtenerEquipoFoto() },
            disabled: !tabsDisabled() && accessButton.Tabs[2] ? false : true
          }
          , {
            label: intl.formatMessage({ id: "SYSTEM.MAINTENANCETYPE.TAB" }),
            icon: <PermDataSettingIcon fontSize="large" />,
            onClick: () => { listarEquipoMantenimiento() },
            disabled: !tabsDisabled() && accessButton.Tabs[3] ? false : true
          }
          , {
            label: intl.formatMessage({ id: "SYSTEM.TEAM.ASSIGNMENT" }),
            icon: <BallotIcon fontSize="large" />,
            onClick: () => { listarAsignacionAlternativo() },
            disabled: tabsDisabled()
          }
        ]}
        className={classes.tabContent}
        componentTabsBody={
          [
            tabContent_EquipoListPage(),
            tabContent_EquipoEditPage(),
            tabContent_EquipoFotoEditPage(),
            tabContent_EquipoMantenimientoListPage(),
            tabContent_EquipoAsignacionListPage()
          ]
        }
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

      <Confirm
        message={intl.formatMessage({ id: "IDENTIFICATION.PHOTOCHECK.PRINT.CONFIRM" })}
        isVisible={confirmarDeletexFoto}
        setIsVisible={setConfirmarDeletexFoto}
        setInstance={setInstance}
        onConfirm={() => eliminarRegistroxFoto(selectedDeletexFoto, true)}
        title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
        confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
        cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
      />

    </>
  );
};


export default injectIntl(WithLoandingPanel(EquipoIndexPage)); 
