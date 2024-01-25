import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { handleErrorMessages, handleSuccessMessages } from "../../../../store/ducks/notify-messages";
import { useStylesEncabezado, useStylesTab } from "../../../../store/config/Styles";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import Confirm from "../../../../partials/components/Confirm";
import { useSelector } from "react-redux";
import { dateFormat, isNotEmpty } from "../../../../../_metronic";
import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";
import { getButtonPermissions, defaultPermissions, setDisabledTabs } from '../../../../../_metronic/utils/securityUtils'
import { eliminar, obtener, listar, crear, actualizar } from "../../../../api/casino/comedor.api";
import ComedorListPage from "./ComedorListPage";
import ComedorEditPage from "./ComedorEditPage";
import {
  eliminar as eliminarComServicio, obtener as obtenerComServicio, listar as listarComServicio, crear as crearComServicio, actualizar as actualizarComServicio
} from "../../../../api/casino/comedorServicio.api";
import ComedorServicioListPage from "../comedorServicio/ComedorServicioListPage";
import ComedorServicioEditPage from "../comedorServicio/ComedorServicioEditPage";
import {
  eliminar as eliminarCSC, obtener as obtenerCSC, listar as listarCSC, crear as crearCSC, actualizar as actualizarCSC
} from "../../../../api/casino/comedorServicioCosto.api";
import ComedorServicioCostoEditPage from "../comedorServicioCosto/ComedorServicioCostoEditPage";
import {
  eliminar as eliminarComEquipo, obtener as obtenerComEquipo, listar as listarComEquipo, crear as crearComEquipo, actualizar as actualizarComEquipo
} from "../../../../api/casino/comedorEquipo.api";
import ComedorEquipoListPage from "../comedorEquipo/ComedorEquipoListPage";
import ComedorEquipoEditPage from "../comedorEquipo/ComedorEquipoEditPage";
import {
  listar as listarCategoriaCosto
} from "../../../../api/casino/categoriaCosto.api";
import {
  listar as listarCSE, crear as crearCSE, eliminar as eliminarCSE
} from "../../../../api/casino/servicioExcluyente.api";
import TabNavContainer from "../../../../partials/components/Tabs/TabNavContainer";
import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import KitchenIcon from '@material-ui/icons/Kitchen';
import RoomServiceIcon from '@material-ui/icons/RoomService';
import RestaurantIcon from '@material-ui/icons/Restaurant';

const ComedorIndexPage = (props) => {
  const { intl, setLoading, dataMenu } = props;

  const usuario = useSelector(state => state.auth.user);
  const perfil = useSelector(state => state.perfil.perfilActual);


  const [varIdComedor, setVarIdComedor] = useState("");
  const [focusedRowKey, setFocusedRowKey] = useState(0);
  const [focusedRowKeyComedorServicio, setFocusedRowKeyComedorServicio] = useState(0);

  const [formatCurrency, setFormatCurrency] = useState("");
  const [allowDeploy, setAllowDeploy] = useState(false);

  const [comedores, setComedores] = useState([]);
  const [comedorServicioCosto, setComedorServicioCosto] = useState([]);
  const [servicioExcluyente, setServicioExcluyente] = useState([]);

  //Datos principales
  const [selected, setSelected] = useState({});
  const [selectedDataServicios, setSelectedDataServicios] = useState({});


  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);

  const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
  const [tituloTabs, setTituloTabs] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  const [listarTabs, setListarTabs] = useState([]);

  const classesEncabezado = useStylesEncabezado();
  const classes = useStylesTab();
  const [tabIndex, setTabIndex] = useState(0);
  //const [path, setPath] = useState();


  const handleChange = (event, newValue) => {
    //Estado cambio de tabs
    setTabIndex(newValue);
  };

  const [isVisible, setIsVisible] = useState(false);
  const [instance, setInstance] = useState({});

  const [isVisibleFrmServicioCosto, setisVisibleFrmServicioCosto] = useState(false);
  const [isDeleteServicioCosto, setisDeleteServicioCosto] = useState(false);

  const [collapsed, setCollapsed] = useState(false);
  const [expandRow, setExpandRow] = useState(0);


  //::::::::::::::::::::::::::::FUNCIONES PARA COMEDOR-:::::::::::::::::::::::::::::::::::

  async function agregarComedor(data) {
    setLoading(true);
    const { IdComedor, Comedor, IdTipo, Activo, ControlarAforo, TotalAforo, IdPais, IdMoneda, DiferenciarCostos, IdZona } = data;
    let param = {
      IdComedor: isNotEmpty(IdComedor) ? IdComedor.toUpperCase() : "",
      Comedor: isNotEmpty(Comedor) ? Comedor.toUpperCase() : "",
      IdTipo: isNotEmpty(IdTipo) ? IdTipo.toUpperCase() : "",
      IdCliente: perfil.IdCliente,
      IdDivision: perfil.IdDivision,
      ControlarAforo: ControlarAforo,
      TotalAforo: isNotEmpty(TotalAforo) ? TotalAforo : "0",
      IdPais: isNotEmpty(IdPais) ? IdPais : "",
      IdMoneda: isNotEmpty(IdMoneda) ? IdMoneda : "",
      DiferenciarCostos: (DiferenciarCostos) ? "S" : "N",
      IdZona: isNotEmpty(IdZona) ? IdZona.toUpperCase() : "",
      Activo: Activo,
      IdUsuario: usuario.username
    };
    await crear(param)
      .then(response => {
        if (response)
          handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
        setModoEdicion(false);
        listarComedores();
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
  }


  async function actualizarComedor(comedor) {
    setLoading(true);
    const { IdComedor, Comedor, IdTipo, Activo, ControlarAforo, TotalAforo, IdPais, IdMoneda, DiferenciarCostos, IdZona } = comedor;
    let params = {
      IdComedor: isNotEmpty(IdComedor) ? IdComedor.toUpperCase() : "",
      Comedor: isNotEmpty(Comedor) ? Comedor.toUpperCase() : "",
      IdTipo: isNotEmpty(IdTipo) ? IdTipo.toUpperCase() : "",
      IdCliente: perfil.IdCliente,
      IdDivision: perfil.IdDivision,
      ControlarAforo: ControlarAforo,
      TotalAforo: isNotEmpty(TotalAforo) ? TotalAforo : "0",
      IdPais: isNotEmpty(IdPais) ? IdPais : "",
      IdMoneda: isNotEmpty(IdMoneda) ? IdMoneda : "",
      DiferenciarCostos: (DiferenciarCostos) ? "S" : "N",
      IdZona: isNotEmpty(IdZona) ? IdZona.toUpperCase() : "",
      Activo,
      IdUsuario: usuario.username,
      IdModulo: dataMenu.info.IdModulo
    };
    await actualizar(params)
      .then(response => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
        setModoEdicion(false);
        listarComedores();
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
  }


  async function eliminarRegistro(comedor, confirm) {
    setSelected(comedor);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdCliente, IdDivision, IdComedor } = comedor;
      await eliminar({
        IdCliente: IdCliente,
        IdDivision: IdDivision,
        IdComedor: IdComedor,
        IdUsuario: usuario.username
      })
        .then(response => {
          handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
        })
        .catch(err => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
      listarComedores();
    }
  }


  async function listarComedores() {
    setLoading(true);
    await listar({
      IdCliente: perfil.IdCliente,
      IdDivision: perfil.IdDivision,
      IdComedor: '%',
      NumPagina: 0,
      TamPagina: 0
    }).then(comedores => {
      setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
      setComedores(comedores);
      setModoEdicion(false);
      changeTabIndex(0);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });

  }

  async function obtenerComedor(filtro) {
    setLoading(true);
    const { IdCliente, IdDivision, IdComedor } = filtro;
    await obtener({
      IdCliente: IdCliente,
      IdDivision: IdDivision,
      IdComedor: IdComedor
    }).then(comedor => {
      comedor.DiferenciarCostos = comedor.DiferenciarCostos === "S" ? true : false;
      setDataRowEditNew({ ...comedor, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  const nuevoRegistro = () => {
    changeTabIndex(1);
    let comedor = {
      Activo: "S",
      ControlarAforo: "N",
      FechaRegistro: new Date().toJSON().slice(0, 10),
      IdPais: perfil.IdPais
    };
    setDataRowEditNew({ ...comedor, esNuevoRegistro: true });
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
    setVarIdComedor("");

  };

  const editarRegistro = async (dataRow) => {
    changeTabIndex(1);
    const { IdComedor } = dataRow;
    obtenerComedor(dataRow);
    setModoEdicion(true);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));

  };

  const cancelarEdicion = () => {
    changeTabIndex(0);
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
    setVarIdComedor("");
  };


  const seleccionarRegistro = dataRow => {
    const { IdComedor, DiferenciarCostos, RowIndex, Formato } = dataRow;

    setSelected(dataRow);
    setVarIdComedor(IdComedor);
    setFocusedRowKey(RowIndex);
    setFormatCurrency(Formato)
    if (DiferenciarCostos === true || DiferenciarCostos === "S") {
      setAllowDeploy(true);
    }
    else {
      setAllowDeploy(false);
    }
    setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
    setModoEdicion(false);
  }

  const verRegistroDblClick = async (dataRow) => {
    changeTabIndex(1);
    //setModoEdicion(false);
    await obtenerComedor(dataRow);
  };


  /******Configuración de acceso de botones****************** */
  const [accessButton, setAccessButton] = useState(defaultPermissions);

  const loadControlsPermission = () => {
    const numeroTabs = 4; //Nùmero de tab del formulario.
    let buttonsPermissions = getButtonPermissions(dataMenu.objetos);
    let newTabs = setDisabledTabs(dataMenu.objetos, numeroTabs);
    setAccessButton({ ...accessButton, ...buttonsPermissions, Tabs: newTabs });
  }


  //::::::::::::::::::::::FUNCION SERVICIOS:::::::::::::::::::::::::::::::::::::::::::::::::

  async function agregarComedorServicio(dataComedorServicio) {
    setLoading(true);

    const { IdServicio, HoraInicio, HoraFin, Servicio, Orden,
      Costo, NumeroConsumos, Excluyente, Especial, Activo, AplicaDiaSiguiente } = dataComedorServicio;
    let params = {
      IdComedor: varIdComedor
      , IdServicio: isNotEmpty(IdServicio) ? IdServicio.toUpperCase() : ""
      , HoraInicio: isNotEmpty(HoraInicio) ? dateFormat(HoraInicio, "hh:mm") : ""
      , HoraFin: isNotEmpty(HoraFin) ? dateFormat(HoraFin, "hh:mm") : ""
      , Servicio: isNotEmpty(Servicio) ? Servicio.toUpperCase() : ""
      , Especial: (Especial) ? "S" : "N"
      , Orden: (Orden === undefined ? 0 : Orden)
      , Costo: (Costo === undefined ? 0 : Costo)
      , NumeroConsumos: (NumeroConsumos === undefined ? 0 : NumeroConsumos)
      , Excluyente: Excluyente
      , Activo
      , IdCliente: perfil.IdCliente
      , IdDivision: perfil.IdDivision
      , IdUsuario: usuario.username
      , AplicaDiaSiguiente:AplicaDiaSiguiente
    };
    await crearComServicio(params).then(response => {
      if (response)
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      listarComedorServicio();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }


  async function actualizarComedorServicio(comedorServicio, selectedRow) {
    setLoading(true);
    const { IdComedor, IdServicio, HoraInicio, HoraFin, Servicio, Orden, Costo,
      NumeroConsumos, Excluyente, Especial, Activo, AplicaDiaSiguiente } = comedorServicio;

    let params = {
      IdComedor: varIdComedor
      , IdServicio: isNotEmpty(IdServicio) ? IdServicio.toUpperCase() : ""
      , HoraInicio: isNotEmpty(HoraInicio) ? dateFormat(HoraInicio, "hh:mm") : ""
      , HoraFin: isNotEmpty(HoraFin) ? dateFormat(HoraFin, "hh:mm") : ""
      , Servicio: isNotEmpty(Servicio) ? Servicio.toUpperCase() : ""
      , Especial: (Especial) ? "S" : "N"
      , Orden: (Orden === undefined ? 0 : Orden)
      , Costo: (Costo === undefined ? 0 : Costo)
      , NumeroConsumos: (NumeroConsumos === undefined ? 0 : NumeroConsumos)
      , Excluyente: Excluyente
      , Activo
      , IdCliente: perfil.IdCliente
      , IdDivision: perfil.IdDivision
      , IdUsuario: usuario.username
      , AplicaDiaSiguiente:AplicaDiaSiguiente
    };
    await actualizarComServicio(params).then(() => {

      AgregarServicioExcluyente(comedorServicio, selectedRow);
      listarCasinoServicioExcluyente(comedorServicio);
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));

      listarComedorServicio();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function AgregarServicioExcluyente(dataRow, selectedRow) {
    const { IdCliente, IdDivision, IdComedor, IdServicio } = dataRow;

    await eliminarCSE({
      IdCliente: IdCliente,
      IdDivision: IdDivision,
      IdComedor: IdComedor,
      IdServicio: IdServicio
    });

    for (let i = 0; i < selectedRow.length; i++) {

      if (isNotEmpty(IdCliente) &&
        isNotEmpty(IdDivision) &&
        isNotEmpty(selectedRow[i].IdComedor) &&
        isNotEmpty(selectedRow[i].IdServicio)) {
        await crearCSE({
          IdCliente: IdCliente,
          IdDivision: IdDivision,
          IdComedor: IdComedor,
          IdSecuencial: 0,
          IdServicio: IdServicio,
          IdComedorExcluyente: selectedRow[i].IdComedor,
          IdServicioExcluyente: selectedRow[i].IdServicio,
          Activo: "S",
          IdUsuario: usuario.username
        }).then(response => {

        }).catch(err => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
      }
    }
  }


  async function eliminarRegistroComedorServicio(comedorServicio, confirm) {
    setisDeleteServicioCosto(false);
    setSelected(comedorServicio);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdComedor, IdServicio, IdCliente, IdDivision } = comedorServicio;
      await eliminarComServicio({
        IdComedor: IdComedor,
        IdServicio: IdServicio,
        IdCliente: IdCliente,
        IdDivision: IdDivision,
        IdUsuario: usuario.username
      }).then(response => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
      listarComedorServicio();
    }
  }

  async function listarComedorServicio() {
    setLoading(true);

    await listarComServicio({
      IdComedor: varIdComedor,
      IdCliente: perfil.IdCliente,
      IdDivision: perfil.IdDivision,
      NumPagina: 0, TamPagina: 0
    }).then(comedoresServicio => {
      setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
      setModoEdicion(false);
      setListarTabs(comedoresServicio);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }


  async function obtenerComedorServicio(filtro) {
    setLoading(true);
    const { IdComedor, IdServicio, IdCliente, IdDivision } = filtro;
    await obtenerComServicio({
      IdComedor: IdComedor,
      IdServicio: IdServicio,
      IdCliente: IdCliente,
      IdDivision: IdDivision
    }).then(comedorServicio => {
      comedorServicio.Especial = comedorServicio.Especial === "S" ? true : false;
      setDataRowEditNew({ ...comedorServicio, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    })
      .finally(() => { setLoading(false); });
  }

  async function listarCasinoServicioExcluyente(rowData) {
    setLoading(true);
    const { IdComedor, IdServicio, IdCliente, IdDivision } = rowData;
    await listarCSE({
      IdCliente: IdCliente,
      IdDivision: IdDivision,
      IdComedor: IdComedor,
      IdServicio: IdServicio,
      NumPagina: 0,
      TamPagina: 0
    }).then(data => {
      setServicioExcluyente(data);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    })
      .finally(() => { setLoading(false); });
  }


  const editarRegistroComedorServicio = dataRow => {
    setisVisibleFrmServicioCosto(false);
    setModoEdicion(true);
    setTituloTabs(intl.formatMessage({ id: "ACTION.EDIT" }));
    obtenerComedorServicio(dataRow);
    listarCasinoServicioExcluyente(dataRow);
  };

  const nuevoComedorServicio = () => {
    setisVisibleFrmServicioCosto(false);
    let nuevo = { Activo: "S", HoraInicio: "2020-01-01 00:00:00.000", HoraFin: "2020-01-01 00:00:00.000", NumeroConsumos: 1, AplicaDiaSiguiente: "N" };
    setDataRowEditNew({ ...nuevo, esNuevoRegistro: true });
    setTituloTabs(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
  };

  const cancelarEdicionTabs = () => {
    setModoEdicion(false);
    setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };

  const seleccionarComedorServicio = dataRow => {

    const { IdComedor, RowIndex } = dataRow;
    setSelectedDataServicios(dataRow);
    setFocusedRowKeyComedorServicio(RowIndex);
    //Control externo.
    setExpandRow(RowIndex);
    setCollapsed(false);

  }

  //::::::::::::::::::::::FUNCION COMEDOR SERVICIOS COSTO  ( MASTERDETAIL ) :::::::::::::::::::::::::::::::::::::::::::::::::

  const nuevoComedorServicioCosto = (dataRow) => {
    const { IdCliente, IdDivision, IdComedor, IdServicio, Costo } = dataRow;
    setDataRowEditNew({ IdCliente: IdCliente, IdDivision: IdDivision, IdComedor: IdComedor, IdServicio: IdServicio, PorcentajeAsumidoEmpresa: 1, Costo: Costo, esNuevoRegistro: true });
    setTituloTabs(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
    setisVisibleFrmServicioCosto(true);
  };

  const seleccionarComedorServicioCosto = async (dataRow) => {
    //Crear un registro en el navegador
    localStorage.setItem('dataRowAplication', JSON.stringify(dataRow));
  }


  const verRegistroDblClickDetail = async (dataRow) => {
    const { IdCategoriaCosto, Pendiente } = dataRow;
    const { IdCliente, IdDivision, IdComedor, IdServicio, Costo } = selectedDataServicios;
    if (Pendiente === "S") {
      setDataRowEditNew({
        IdCliente: IdCliente,
        IdDivision: IdDivision,
        IdComedor: IdComedor,
        IdServicio: IdServicio,
        IdCategoriaCosto: IdCategoriaCosto,
        PorcentajeAsumidoEmpresa: 1,
        Costo: Costo,
        esNuevoRegistro: true
      });
      changeTabIndex(2);
      setModoEdicion(true);
      setisVisibleFrmServicioCosto(true);
      // await obtenerComedorServicioCosto(dataRow);
    }

  };



  const editarComedorServicioCosto = async (dataRow) => {

    // setFocusedRowKeyComedorServicioCosto(RowIndex);
    await obtenerComedorServicioCosto(dataRow);
    setTituloTabs(intl.formatMessage({ id: "ACTION.EDIT" }));
    setModoEdicion(true);


  };

  async function eliminarComedorServicioCosto(dataRow, confirm) {
    setisDeleteServicioCosto(true);
    setSelected(dataRow);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdCliente, IdDivision, IdComedor, IdServicio, IdCategoriaCosto } = dataRow;
      await eliminarCSC({
        IdCliente: IdCliente
        , IdDivision: IdDivision
        , IdComedor: IdComedor
        , IdServicio: IdServicio
        , IdCategoriaCosto: IdCategoriaCosto
      }).then(response => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
      listarComedorServicioCosto();
    }
  }


  async function agregarComedorServicioCosto(dataRow) {
    setLoading(true);

    const { IdCliente, IdDivision, IdComedor, IdServicio, IdCategoriaCosto, PorcentajeAsumidoEmpresa, PorcentajeAsumidoTrabajador } = dataRow;
    let params = {
      IdCliente: IdCliente
      , IdDivision: IdDivision
      , IdComedor: IdComedor
      , IdServicio: IdServicio
      , IdCategoriaCosto: isNotEmpty(IdCategoriaCosto) ? IdCategoriaCosto.toUpperCase() : ""
      , PorcentajeAsumidoEmpresa: (PorcentajeAsumidoEmpresa === undefined) ? 0 : PorcentajeAsumidoEmpresa
      , PorcentajeAsumidoTrabajador: (PorcentajeAsumidoTrabajador === undefined) ? 0 : PorcentajeAsumidoTrabajador
      , IdUsuario: usuario.username
    };
    await crearCSC(params).then(response => {
      if (response)
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      listarComedorServicioCosto();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }


  async function actualizarComedorServicioCosto(dataRow) {

    setLoading(true);
    const { IdCliente, IdDivision, IdComedor, IdServicio, IdCategoriaCosto, PorcentajeAsumidoEmpresa, PorcentajeAsumidoTrabajador } = dataRow;
    let params = {
      IdCliente: IdCliente
      , IdDivision: IdDivision
      , IdComedor: IdComedor
      , IdServicio: IdServicio
      , IdCategoriaCosto: isNotEmpty(IdCategoriaCosto) ? IdCategoriaCosto.toUpperCase() : ""
      , PorcentajeAsumidoEmpresa: (PorcentajeAsumidoEmpresa === undefined) ? 0 : PorcentajeAsumidoEmpresa
      , PorcentajeAsumidoTrabajador: (PorcentajeAsumidoTrabajador === undefined) ? 0 : PorcentajeAsumidoTrabajador
      , IdUsuario: usuario.username
    };
    await actualizarCSC(params).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      listarComedorServicioCosto();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }


  async function listarComedorServicioCosto() {

    setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
    setModoEdicion(false);

    // setLoading(true);

    // await listarCSC({
    //     IdCliente: '%'
    //     , IdDivision: '%'
    //     , IdComedor: '%'
    //     , IdServicio: '%'
    //     , NumPagina: 0
    //     , TamPagina: 0
    // }).then(comedoresServicio => {
    //     setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
    //     setModoEdicion(false);
    //     setListarTabs(comedoresServicio);
    // }).catch(err => {
    //     handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    // }).finally(() => { setLoading(false); });

  }

  async function obtenerComedorServicioCosto(dataRow) {
    setLoading(true);
    setisVisibleFrmServicioCosto(true);
    const { IdCliente, IdDivision, IdComedor, IdServicio, IdCategoriaCosto } = dataRow;
    await obtenerCSC({
      IdCliente: IdCliente
      , IdDivision: IdDivision
      , IdComedor: IdComedor
      , IdServicio: IdServicio
      , IdCategoriaCosto: IdCategoriaCosto
    }).then(comedorServicio => {
      setDataRowEditNew({ ...comedorServicio, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    })
      .finally(() => { setLoading(false); });
  }

  //::::::::::::::::::::::FUNCION EQUIPOS:::::::::::::::::::::::::::::::::::::::::::::::::

  async function agregarComedorEquipo(dataComedorEquipo) {
    setLoading(true);
    const { IdCliente, IdDivision, IdComedor, IdEquipo, Activo, IdModulo, IdEquipoPrinter, PermiteSeleccionarServicio } = dataComedorEquipo;
    let params = {
      IdComedor: varIdComedor
      , IdEquipo: isNotEmpty(IdEquipo) ? IdEquipo.toUpperCase() : ""
      , Activo: Activo
      , IdCliente: perfil.IdCliente
      , IdDivision: perfil.IdDivision
      , IdUsuario: usuario.username
      , IdModulo: dataMenu.info.IdModulo
      , IdEquipoPrinter: IdEquipoPrinter
      , PermiteSeleccionarServicio : PermiteSeleccionarServicio
    };
    await crearComEquipo(params).then(response => {
      if (response)
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      listarComedorEquipo();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }


  async function actualizarComedorEquipo(comedorEquipo) {
    setLoading(true);
    const { IdCliente, IdDivision, IdComedor, IdEquipo, Activo, IdEquipoPrinter, PermiteSeleccionarServicio } = comedorEquipo;
    let params = {
      IdComedor: varIdComedor
      , IdEquipo: isNotEmpty(IdEquipo) ? IdEquipo.toUpperCase() : ""
      , Activo: Activo
      , IdCliente: perfil.IdCliente
      , IdDivision: perfil.IdDivision
      , IdUsuario: usuario.username
      , IdEquipoPrinter: IdEquipoPrinter
      , PermiteSeleccionarServicio : PermiteSeleccionarServicio
    };
    await actualizarComEquipo(params).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      listarComedorEquipo();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function eliminarRegistroComedorEquipo(comedorEquipo, confirm) {
    setSelected(comedorEquipo);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdComedor, IdEquipo, IdCliente, IdDivision } = comedorEquipo;
      await eliminarComEquipo({
        IdComedor: IdComedor,
        IdEquipo: IdEquipo,
        IdCliente: IdCliente,
        IdDivision: IdDivision,
        IdUsuario: usuario.username,
        IdModulo: dataMenu.info.IdModulo
      }).then(response => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
      listarComedorEquipo();
    }
  }

  async function listarComedorEquipo() {
    setLoading(true);

    await listarComEquipo({
      IdComedor: varIdComedor,
      IdCliente: perfil.IdCliente,
      IdDivision: perfil.IdDivision,
      IdEquipo: '%',
      NumPagina: 0, TamPagina: 0
    }).then(comedoresEquipo => {
      setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
      setListarTabs(comedoresEquipo);
      setModoEdicion(false);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });

  }


  async function obtenerComedorEquipo(filtro) {
    setLoading(true);
    const { IdComedor, IdEquipo, IdCliente, IdDivision } = filtro;
    await obtenerComEquipo({
      IdComedor: IdComedor,
      IdEquipo: IdEquipo,
      IdCliente: IdCliente,
      IdDivision: IdDivision
    }).then(data => {
      setDataRowEditNew({ ...data, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    })
      .finally(() => { setLoading(false); });
  }

  const editarRegistroComedorEquipo = async dataRow => {
    setDataRowEditNew({});
    await obtenerComedorEquipo(dataRow);
    setModoEdicion(true);
    setTituloTabs(intl.formatMessage({ id: "ACTION.EDIT" }));
  };

  const nuevoRegistroTabsEquipo = () => {
    let nuevo = { Activo: "S", PermiteSeleccionarServicio: "N" };
    setDataRowEditNew({ ...nuevo, esNuevoRegistro: true });
    setTituloTabs(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
  };


  const cancelarEdicionTabsEquipo = () => {
    setModoEdicion(false);
    setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };

  //Datos Iniciales

  async function ListarCategorias() {
    await listarCategoriaCosto({
      IdCliente: perfil.IdCliente,
      NumPagina: 0,
      TamPagina: 0
    }).then(data => {
      setComedorServicioCosto(data);
    }).catch(err => {
    }).finally(() => { setLoading(false); });

  }

  //Datos Princ(ipales
  const changeTabIndex = (index) => {
    handleChange(null, index);
  }

  const getInfo = () => {
    const { IdComedor, Comedor } = selected;
    return [
      { text: [intl.formatMessage({ id: "COMMON.CODE" })], value: IdComedor, colSpan: 2 },
      { text: [intl.formatMessage({ id: "CASINO.DINNINGROOM" })], value: Comedor, colSpan: 4 }
    ];
  }


  useEffect(() => {
    listarComedores();
    loadControlsPermission();
    ListarCategorias();
  }, []);


  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  async function eliminarListRowTab(selected, confirm) {
    let currentTab = tabIndex;
    switch (currentTab) {
      case 0:
        eliminarRegistro(selected, confirm);
        break;
      case 2:
        isDeleteServicioCosto ? eliminarComedorServicioCosto(selected, confirm) : eliminarRegistroComedorServicio(selected, confirm);
        break;
      case 3:
        eliminarRegistroComedorEquipo(selected, confirm);
        break;
    }
  }




  //:::::::::::::::::::::::::::::::::::::::::::::-Configuración de tabs-:::::::::::::::::::::::::::::::::
  const titleHeaderToolbar = () => {
    let tabsTitles = [
      "",
      "",
      "",
      "CASINO.DINNINGROOM.SERVICE.TEAMS"
    ];

    let sufix = tabsTitles[tabIndex] !== "" ? (" - " + `${intl.formatMessage({ id: tabsTitles[tabIndex] })}`) : "";

    return `${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} ` + " " + sufix;
  }
  const tabsDisabled = () => {
    return isNotEmpty(varIdComedor) ? false : true;
    //return true;
  }

  const tabContent_ComedorListPage = () => {
    return <ComedorListPage
      comedores={comedores}
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


  const tabContent_ComedorEditPage = () => {
    return <>
      <ComedorEditPage
        titulo={titulo}
        modoEdicion={modoEdicion}
        dataRowEditNew={dataRowEditNew}
        actualizarComedor={actualizarComedor}
        agregarComedor={agregarComedor}
        cancelarEdicion={cancelarEdicion}

        //req y edit
        settingDataField={dataMenu.datos}
        accessButton={accessButton}
        dataMenu={dataMenu}
      />
      <div className="container_only">
        <div className="float-right">
          <ControlSwitch
            checked={auditoriaSwitch}
            onChange={e => { setAuditoriaSwitch(e.target.checked) }}
          /><b> {intl.formatMessage({ id: "AUDIT.DATA" })}</b>
        </div>
      </div>
      {auditoriaSwitch && (<AuditoriaPage dataRowEditNew={dataRowEditNew} />)}
    </>
  }

  const tabContent_ComedorServicioListPage = () => {
    return <>
      {modoEdicion && (
        <>
          {!isVisibleFrmServicioCosto && (
            <ComedorServicioEditPage
              dataRowEditNew={dataRowEditNew}
              setDataRowEditNew={setDataRowEditNew}
              actualizarComedorServicio={actualizarComedorServicio}
              agregarComedorServicio={agregarComedorServicio}
              cancelarEdicion={cancelarEdicionTabsEquipo}
              titulo={tituloTabs}
              modoEdicion={modoEdicion}
              accessButton={accessButton}
              settingDataField={dataMenu.datos}
              formatCurrency={formatCurrency}
              servicioExcluyente={servicioExcluyente}

            />
          )}

          {isVisibleFrmServicioCosto && (
            <ComedorServicioCostoEditPage
              dataRowEditNew={dataRowEditNew}
              actualizarComedorServicioCosto={actualizarComedorServicioCosto}
              agregarComedorServicioCosto={agregarComedorServicioCosto}
              cancelarEdicion={cancelarEdicionTabsEquipo}
              comedorServicioCosto={comedorServicioCosto}
              titulo={tituloTabs}
              modoEdicion={modoEdicion}
              accessButton={accessButton}
              settingDataField={dataMenu.datos}
              formatCurrency={formatCurrency}
            />
          )}


          <div className="container_only">
            <div className="float-right">
              <ControlSwitch checked={auditoriaSwitch}
                onChange={e => { setAuditoriaSwitch(e.target.checked) }}
              /><b> {intl.formatMessage({ id: "AUDIT.DATA" })}</b>
            </div>
          </div>
          {auditoriaSwitch && (<AuditoriaPage dataRowEditNew={dataRowEditNew} />)}
        </>
      )}
      {!modoEdicion && (
        <>
          <ComedorServicioListPage
            comedoresServicio={listarTabs}
            editarRegistro={editarRegistroComedorServicio}
            eliminarRegistro={eliminarRegistroComedorServicio}
            nuevoRegistro={nuevoComedorServicio}
            cancelarEdicion={cancelarEdicion}
            seleccionarComedorServicio={seleccionarComedorServicio}
            getInfo={getInfo}
            accessButton={accessButton}
            focusedRowKeyComedorServicio={focusedRowKeyComedorServicio}
            formatCurrency={formatCurrency}
            allowDeploy={allowDeploy}


            titulo={tituloTabs}
            nuevoComedorServicioCosto={nuevoComedorServicioCosto}
            seleccionarComedorServicioCosto={seleccionarComedorServicioCosto}
            //verRegistroDblClickDetail={verRegistroDblClickDetail}
            editarComedorServicioCosto={editarComedorServicioCosto}
            eliminarComedorServicioCosto={eliminarComedorServicioCosto}
            expandRow={{ expandRow, setExpandRow }}
            collapsedRow={{ collapsed, setCollapsed }}
          />
        </>
      )}
    </>
  }

  const tabContent_ComedorEquipoListPage = () => {
    return <>
      {modoEdicion && (
        <>
          <ComedorEquipoEditPage
            dataRowEditNew={dataRowEditNew}
            actualizarComedorEquipo={actualizarComedorEquipo}
            agregarComedorEquipo={agregarComedorEquipo}
            cancelarEdicion={cancelarEdicionTabsEquipo}
            titulo={tituloTabs}
            modoEdicion={modoEdicion}
            accessButton={accessButton}
            settingDataField={dataMenu.datos}
          />
          <div className="container_only">
            <div className="float-right">
              <ControlSwitch checked={auditoriaSwitch}
                onChange={e => { setAuditoriaSwitch(e.target.checked) }}
              /><b> {intl.formatMessage({ id: "AUDIT.DATA" })}</b>
            </div>
          </div>
          {auditoriaSwitch && (<AuditoriaPage dataRowEditNew={dataRowEditNew} />)}
        </>
      )}
      {!modoEdicion && (
        <>
          <ComedorEquipoListPage
            comedoresEquipo={listarTabs}
            editarRegistro={editarRegistroComedorEquipo}
            eliminarRegistro={eliminarRegistroComedorEquipo}
            nuevoRegistro={nuevoRegistroTabsEquipo}
            cancelarEdicion={cancelarEdicion}
            getInfo={getInfo}
            accessButton={accessButton}
          />
        </>
      )}
    </>
  }

  //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  return (
    <>
      <TabNavContainer
        title={intl.formatMessage({ id: "CASINO.DINNINGROOM.MENU" })}
        subtitle={intl.formatMessage({ id: "CASINO.DINNINGROOM.SUBMENU" })}
        nombrebarra={titleHeaderToolbar()}
        tabIndex={tabIndex}
        handleChange={handleChange}
        componentTabsHeaders={[
          {
            label: intl.formatMessage({ id: "ACTION.LIST" }),
            icon: <FormatListNumberedIcon fontSize="large" />,
          },
          {
            label: intl.formatMessage({ id: "CASINO.DINNINGROOM" }),
            icon: <RestaurantIcon fontSize="large" />,
            onClick: (e) => { obtenerComedor(selected) },
            disabled: tabsDisabled()
          },
          {
            label: intl.formatMessage({ id: "CASINO.DINNINGROOM.SERVICE.SERVICES" }),
            icon: <RoomServiceIcon fontSize="large" />,
            onClick: (e) => { listarComedorServicio() },
            disabled: !tabsDisabled() && accessButton.Tabs[2] ? false : true
          },
          {
            label: intl.formatMessage({ id: "CASINO.DINNINGROOM.SERVICE.TEAMS" }),
            icon: <KitchenIcon fontSize="large" />,
            onClick: () => { listarComedorEquipo() },
            disabled: !tabsDisabled() && accessButton.Tabs[3] ? false : true
          }
        ]}
        className={classes.tabContent}
        componentTabsBody={
          [
            tabContent_ComedorListPage(),
            tabContent_ComedorEditPage(),
            tabContent_ComedorServicioListPage(),
            tabContent_ComedorEquipoListPage()
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
    </>
  );
};




export default injectIntl(WithLoandingPanel(ComedorIndexPage));
