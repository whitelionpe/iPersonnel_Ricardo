import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { handleErrorMessages, handleSuccessMessages, handleInfoMessages } from "../../../../store/ducks/notify-messages";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import Confirm from "../../../../partials/components/Confirm";
import { getButtonPermissions, defaultPermissions, setDisabledTabs } from '../../../../../_metronic/utils/securityUtils'

import { useStylesTab } from "../../../../store/config/Styles";

import { useSelector } from "react-redux";
import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";

import { uploadFile } from "../../../../api/helpers/fileBase64.api";
//import { obtener as obtenerMenu } from "../../../../api/sistema/menu.api";

import {
  servicePersona
} from "../../../../api/administracion/persona.api";

import { listar as listarDato, eliminar as eliminarDato, obtener as obtenerDato, crear as crearDato, actualizar as actualizarDato } from "../../../../api/administracion/personaDatos.api";
import { obtener as obtenerFoto, crear as crearFoto, actualizar as actualizarFoto, eliminarxtipo as eliminarFotoByTipo } from "../../../../api/administracion/personaFoto.api";
import { listar as listarIndiscip, eliminar as eliminarIndiscip, obtener as obtenerIndiscip, crear as crearIndiscip, actualizar as actualizarIndiscip } from "../../../../api/administracion/personaIndisciplina.api";
import { listar as listarVisita, eliminar as eliminarVisita, obtener as obtenerVisita, crear as crearVisita, actualizar as actualizarVisita } from "../../../../api/administracion/personaVisita.api";

import PersonaListPage from "./PersonaListPage";
import PersonaEditTabPage from "./PersonaEditTabPage";
import PersonaCaracteristicaIndexPage from "./caracteristica/PersonaCaracteristicaIndexPage";
//import PersonaPosicionIndexPage from "./posicion/PersonaPosicionIndexPage";
import PersonaDatosListPage from "./PersonaDatosListPage";
import PersonaDatosEditPage from "./PersonaDatosEditPage";
import PersonaFotoEditPage from "./PersonaFotoEditPage";
import PersonaIndisciplinaListPage from "./PersonaIndisciplinaListPage";
import PersonaIndisciplinaEditPage from "./PersonaIndisciplinaEditPage";
import PersonaContratoIndexPage from "./contrato/PersonaContratoIndexPage"
//import PersonaRegimenIndexPage from "./regimen/PersonaRegimenIndexPage";
import PersonaVisitaListPage from "./visita/PersonaVisitaListPage";
import PersonaVisitaEditPage from "./visita/PersonaVisitaEditPage";
import AvatarFoto from "../../../../partials/content/avatarFoto";
import TabNavContainer from "../../../../partials/components/Tabs/TabNavContainer";
import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import PlaylistAddCheckOutlinedIcon from '@material-ui/icons/PlaylistAddCheckOutlined';
//import BusinessCenterOutlinedIcon from '@material-ui/icons/BusinessCenterOutlined';
import TransferWithinAStationSharpIcon from '@material-ui/icons/TransferWithinAStationSharp';
import UsbOutlinedIcon from '@material-ui/icons/UsbOutlined';
import AccountCircleOutlinedIcon from '@material-ui/icons/AccountCircleOutlined';
import GavelIcon from '@material-ui/icons/Gavel';
import DescriptionIcon from '@material-ui/icons/Description';
//import Security from '@material-ui/icons/Security';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';

import { TYPE_SISTEMA_ENTIDAD, isNotEmpty, dateFormat } from "../../../../../_metronic";
//import { serviceRepositorio } from "../../../../api/sistema/repositorio.api";
import {
  obtener as obtenerSistemaConfiguracion
} from "../../../../api/sistema/configuracion.api";
import { service } from "../../../../api/acreditacion/perfil.api";

export const initialFilter = {
  Activo: 'S',
  IdCliente: '',
  Condicion: 'TRABAJADOR',
  IdCaracteristica:'',
  IdCaracteristicaDetalle:'',
  Compania:''
};

const PersonaIndexPage = (props) => {
  const usuario = useSelector(state => state.auth.user);
  const perfil = useSelector(state => state.perfil.perfilActual);
  const { intl, setLoading, dataMenu } = props;
  const numeroTabs = 10; //Definición número de tabs que contiene el formulario.

  const [varIdPersona, setVarIdPersona] = useState("");
  const [imagenConfiguracion, setImagenConfiguracion] = useState({ width: 100, height: 100, minRange: 0.2, maxRange: 0.2, weight: 5242880 });

  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  //const [tiposDocumento, setTiposDocumento] = useState([]);
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
  const [focusedRowKey, setFocusedRowKey] = useState();
  //const [focusedRowKeyIndiscip, setFocusedRowKeyIndiscip] = useState();

  const [selected, setSelected] = useState({});
  const [selectedDelete, setSelectedDelete] = useState({});

  const classes = useStylesTab();
  const [tabIndex, setTabIndex] = useState(0);

  const [modoEdicionTabs, setModoEdicionTabs] = useState(false);
  const [dataRowEditNewTabs, setDataRowEditNewTabs] = useState({});
  const [tituloTabs, setTituloTabs] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  const [listarTabs, setListarTabs] = useState([]);

  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  //const [instance, setInstance] = useState({});

  const [dataCombos, setDataCombos] = useState([]);
  const [maxDiasVisita, setMaxDiasVisita] = useState(7);
  //++++++++Variable (totalRowIndex) para controlar bloqueo de tabs cuando se cambia de búsqueda de un registro en la grilla.++++++++++++++
  const [totalRowIndex, setTotalRowIndex] = useState(0);

  const [alturaSugerido, setAlturaSugerido] = useState();
  const [anchoSugerido, setAnchoSugerido] = useState();
  const [alturaSugeridoRadio, setAlturaSugeridoRadio] = useState();
  const [anchoSugeridoRadio, setAnchoSugeridoRadio] = useState();

  const [activarTxtUbigeo, setActivarTxtUbigeo] = useState(false);

  const handleChange = (event, newValue) => {
    //Estado cambio de tabs
    setTabIndex(newValue);
  };
  const [fotoPerfil, setFotoPerfil] = useState("");

  const [maxLengthDocumento, setMaxLengthDocumento] = useState(20); // Se le asigna el valor 20 el campo Documento porque es el valor maximo en la tabla Administracion_Persona
  const [valLongitudExacta, setValLongitudExacta] = useState("N"); // Se le asigna el valor 20 el campo Documento porque es el valor maximo en la tabla Administracion_Persona

  //FILTRO
  const [isFirstDataLoad, setIsFirstDataLoad] = useState(true);
  const [refreshData, setRefreshData] = useState(false);
  const ds = new DataSource({ store: new ArrayStore({ data: [], key: 'RowIndex' }), reshapeOnPush: false });
  const [dataSource] = useState(ds);

  const refresh = () => dataSource.refresh();
  const resetLoadOptions = () => dataSource.resetLoadOptions();


  //:::::::::::::::::::::::::::::::::::::::::::::-Configuración de tabs-:::::::::::::::::::::::::::::::::
  const [accessButton, setAccessButton] = useState(defaultPermissions);
  const loadControlsPermission = () => {
    let buttonsPermissions = getButtonPermissions(dataMenu.objetos);
    let newTabs = setDisabledTabs(dataMenu.objetos, numeroTabs);
    setAccessButton({ ...accessButton, ...buttonsPermissions, Tabs: newTabs });
    //Pendiente-JDEL- 2020-12-02
    //obtenerTabsHeaderAndBody(newTabs);
  }

  const titleHeaderToolbar = () => {
    let tabsTitles = [
      "",
      "",
      "ADMINISTRATION.PERSON.PHOTO",
      "ADMINISTRATION.CONTRACT.CONTRACT",
      "ADMINISTRATION.PERSON.VISIT",
      "ASSISTANCE.JUSTIFICACION.OTHERDATA",
      "ADMINISTRATION.CHARACTERISTIC",
      "ADMINISTRATION.PERSON.INDISCIPLINE"
    ];

    let sufix = tabsTitles[tabIndex] !== "" ? (` - ${intl.formatMessage({ id: tabsTitles[tabIndex] })}`) : "";

    return `${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })}  ${sufix} `;
  }

  const tabsDisabled = () => {
    return isNotEmpty(varIdPersona) ? true : false;
  }

  //:::::::::::::::::::::::::::::::::::::::::::::-funciones-Persona-:::::::::::::::::::::::::::::::::

  async function cargarCombos() {
    setLoading(true);
    let array = [];
    setDataCombos([]);
    await servicePersona.listarCombosPersona({ IdPais: perfil.IdPais }).then(data => {
      array.push(data[0].filter(k => k.IdEntidad === TYPE_SISTEMA_ENTIDAD.PERSONAS)); // Combo Tipo Documentos 
      array.push(data[1]); // Combo Tipo de Sangre
      array.push(data[2]); // Combo Estado Civil 
      array.push(data[3]); // Combo Licencia Conducir
      array.push(data[4]);// Combo Paises
      setDataCombos(array);
    }).finally(() => {
      setLoading(false);
    });
  }

  async function agregarPersona(persona) {
    setLoading(true);
    const {
      IdPersona
      , Nombre
      , Apellido
      , Direccion
      , IdTipoDocumento
      , Documento
      , Sexo
      , IdEstadoCivil
      , IdTipoSangre
      , Alergia
      , FechaRegistro
      , FechaNacimiento
      , TelefonoMovil
      , TelefonoFijo
      , Email
      , EmergenciaNombre
      , EmergenciaTelefono
      , IdLicenciaConducir
      , NumeroLicenciaConducir
      , Discapacidad
      , NumeroHijos
      , IdUbigeoNacimiento
      , IdUbigeoResidencia
      , Activo
      , IdPais
      , LugarNacimiento
      , LugarResidencia
    } = persona;

    const params = {
      IdCliente: perfil.IdCliente,
      IdPersona: isNotEmpty(IdPersona) ? IdPersona : 0,
      Documento: isNotEmpty(Documento) ? Documento.toUpperCase() : "",
      IdTipoDocumento: isNotEmpty(IdTipoDocumento) ? IdTipoDocumento : "",
      Nombre: isNotEmpty(Nombre) ? Nombre.toUpperCase() : "",
      Apellido: isNotEmpty(Apellido) ? Apellido.toUpperCase() : "",
      Direccion: isNotEmpty(Direccion) ? Direccion.toUpperCase() : "",
      Sexo: isNotEmpty(Sexo) ? Sexo : "",
      IdEstadoCivil: isNotEmpty(IdEstadoCivil) ? IdEstadoCivil : "",
      IdUbigeoNacimiento: isNotEmpty(IdUbigeoNacimiento) ? IdUbigeoNacimiento : "",
      IdUbigeoResidencia: isNotEmpty(IdUbigeoResidencia) ? IdUbigeoResidencia : "",
      IdTipoSangre: isNotEmpty(IdTipoSangre) ? IdTipoSangre : "",
      FechaRegistro: isNotEmpty(FechaRegistro) ? FechaRegistro : "",
      FechaNacimiento: isNotEmpty(FechaNacimiento) ? FechaNacimiento : "",
      Email: isNotEmpty(Email) ? Email.toUpperCase() : "",
      EmergenciaNombre: isNotEmpty(EmergenciaNombre) ? EmergenciaNombre.toUpperCase() : "",
      EmergenciaTelefono: isNotEmpty(EmergenciaTelefono) ? EmergenciaTelefono.toUpperCase() : "",
      Alergia: isNotEmpty(Alergia) ? Alergia.toUpperCase() : "",
      TelefonoMovil: isNotEmpty(TelefonoMovil) ? TelefonoMovil.toUpperCase() : "",
      TelefonoFijo: isNotEmpty(TelefonoFijo) ? TelefonoFijo.toUpperCase() : "",
      IdPaisLicenciaConducir: "",
      IdLicenciaConducir: isNotEmpty(IdLicenciaConducir) ? IdLicenciaConducir : "",
      NumeroLicenciaConducir: isNotEmpty(NumeroLicenciaConducir) ? NumeroLicenciaConducir.toUpperCase() : "",
      Discapacidad: isNotEmpty(Discapacidad) ? Discapacidad : "",
      NumeroHijos: isNotEmpty(NumeroHijos) ? NumeroHijos : 0,
      Activo: Activo,
      IdUsuario: usuario.username,
      IdPais: isNotEmpty(IdPais) ? IdPais : "",
      LugarNacimiento: isNotEmpty(LugarNacimiento) ? LugarNacimiento.toUpperCase() : "",
      LugarResidencia: isNotEmpty(LugarResidencia) ? LugarResidencia.toUpperCase() : "",
    };

    await servicePersona.crear(params).then(response => {
      //console.log("agregarPersona:response",response);
      //debugger;
      if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));

      setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
      changeTabIndex(0);
      setModoEdicion(false);
      setModoEdicionTabs(false);

      const { Documento } = response;

      setTimeout(() => {
        dataSource.loadDataWithFilter({ data: { IdCliente: perfil.IdCliente, Documento, Condicion: "LIBRE", Activo: "S" } });
        setVarIdPersona("");
        setFocusedRowKey();
      }, 500)

    })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      })
      .finally(() => { setLoading(false); });
  }



  async function actualizarPersona(persona) {
    setLoading(true);
    const {
      IdPersona
      , IdCliente
      , Nombre
      , Apellido
      , Direccion
      , IdTipoDocumento
      , Documento
      , Sexo
      , IdEstadoCivil
      , IdTipoSangre
      , Alergia
      , FechaRegistro
      , FechaNacimiento
      , TelefonoMovil
      , TelefonoFijo
      , Email
      , EmergenciaNombre
      , EmergenciaTelefono
      , IdLicenciaConducir
      , NumeroLicenciaConducir
      , Discapacidad
      , NumeroHijos
      , IdUbigeoNacimiento
      , IdUbigeoResidencia
      , Activo
      , IdPais
      , LugarNacimiento
      , LugarResidencia
    } = persona;
    // const { IdUbigeoNacimiento, IdUbigeoResidencia } = ubigeo;

    const params = {
      IdPersona: isNotEmpty(IdPersona) ? IdPersona : 0,
      IdCliente,
      Documento: isNotEmpty(Documento) ? Documento.toUpperCase() : "",
      IdTipoDocumento: isNotEmpty(IdTipoDocumento) ? IdTipoDocumento : "",
      Nombre: isNotEmpty(Nombre) ? Nombre.toUpperCase() : "",
      Apellido: isNotEmpty(Apellido) ? Apellido.toUpperCase() : "",
      Direccion: isNotEmpty(Direccion) ? Direccion.toUpperCase() : "",
      Sexo: isNotEmpty(Sexo) ? Sexo : "",
      IdEstadoCivil: isNotEmpty(IdEstadoCivil) ? IdEstadoCivil : "",
      IdUbigeoNacimiento: isNotEmpty(IdUbigeoNacimiento) ? IdUbigeoNacimiento : "",
      IdUbigeoResidencia: isNotEmpty(IdUbigeoResidencia) ? IdUbigeoResidencia : "",
      IdTipoSangre: isNotEmpty(IdTipoSangre) ? IdTipoSangre : "",
      FechaRegistro: isNotEmpty(FechaRegistro) ? FechaRegistro : "",
      FechaNacimiento: isNotEmpty(FechaNacimiento) ? FechaNacimiento : "",
      Email: isNotEmpty(Email) ? Email.toUpperCase() : "",
      EmergenciaNombre: isNotEmpty(EmergenciaNombre) ? EmergenciaNombre.toUpperCase() : "",
      EmergenciaTelefono: isNotEmpty(EmergenciaTelefono) ? EmergenciaTelefono.toUpperCase() : "",
      Alergia: isNotEmpty(Alergia) ? Alergia.toUpperCase() : "",
      TelefonoMovil: isNotEmpty(TelefonoMovil) ? TelefonoMovil.toUpperCase() : "",
      TelefonoFijo: isNotEmpty(TelefonoFijo) ? TelefonoFijo.toUpperCase() : "",
      IdPaisLicenciaConducir: "",
      IdLicenciaConducir: isNotEmpty(IdLicenciaConducir) ? IdLicenciaConducir : "",
      NumeroLicenciaConducir: isNotEmpty(NumeroLicenciaConducir) ? NumeroLicenciaConducir.toUpperCase() : "",
      Discapacidad: isNotEmpty(Discapacidad) ? Discapacidad : "",
      NumeroHijos: isNotEmpty(NumeroHijos) ? NumeroHijos : 0,
      Activo: Activo,
      IdUsuario: usuario.username,
      IdPais: isNotEmpty(IdPais) ? IdPais : "",
      LugarNacimiento: isNotEmpty(LugarNacimiento) ? LugarNacimiento.toUpperCase() : "",
      LugarResidencia: isNotEmpty(LugarResidencia) ? LugarResidencia.toUpperCase() : "",
    };
    await servicePersona.actualizar(params)
      .then(() => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
        setModoEdicion(false);
        listadoPersonas();
        //setRefreshData(true);//Actualizar CustomDataGrid
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      })
      .finally(() => { setLoading(false) });
  }

  async function eliminarRegistro(persona, confirm) {
    setSelectedDelete(persona);
    setShowConfirmDelete(true);
    if (confirm) {
      setLoading(true);
      const { IdPersona, IdCliente } = persona;
      await servicePersona.eliminar({ IdPersona, IdCliente, IdUsuario: usuario.username })
        .then(() => {
          handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
          listadoPersonas();
          //setRefreshData(true);//Actualizar CustomDataGrid
        })
        .catch(err => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        })
        .finally(() => { setLoading(false); });
    }
  }

  async function eliminarRegistroFoto(persona, confirm) {
    setSelectedDelete(persona);
    setShowConfirmDelete(true);
    if (confirm) {
      setLoading(true);
      const { IdPersona, TipoFoto } = persona;

      //console.log({ IdPersona, TipoFoto });
      setLoading(false);
      /*
       [HttpDelete("eliminarxtipo")]
        public async Task<ActionResult<dynamic>> EliminarPorTipo([FromQuery] int idPersona,  string TipoFoto)
      */
      await eliminarFotoByTipo({ IdPersona, TipoFoto })
        .then(() => {
          handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
          obtenerPersonaFoto(IdPersona, false)
          //setRefreshData(true);//Actualizar CustomDataGrid
        })
        .catch(err => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        })
        .finally(() => { setLoading(false); });
    }
  }

  async function listadoPersonas() {
    setRefreshData(true);//Actualizar CustomDataGrid
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    changeTabIndex(0);
    setModoEdicion(false);
    setModoEdicionTabs(false);
  }


  async function obtenerPersona(filtro) {
    setLoading(true);

    setDataRowEditNew({});
    let persona;
    const { IdPersona, IdCliente } = filtro;
    persona = await servicePersona.obtener({ IdPersona, IdCliente }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    });
    setDataRowEditNew({ ...persona, esNuevoRegistro: false,
      IdPaisNacimiento:isNotEmpty(persona.IdPaisNacimiento)?persona.IdPaisNacimiento:perfil.IdPais,
      IdPaisResidencia:isNotEmpty(persona.IdPaisResidencia)?persona.IdPaisResidencia:perfil.IdPais}); 
    setLoading(false)
  }

  const nuevoRegistro = () => {
    const { IdCliente } = selected;

    let persona = {
      IdCliente,
      IdPersona: 0,
      Activo: "S",
      FechaRegistro: new Date().toJSON().slice(0, 10),
      IdPaisNacimiento:perfil.IdPais,
      IdPaisResidencia:perfil.IdPais
    };

    setDataRowEditNew({});
    setDataRowEditNew({ ...persona, esNuevoRegistro: true });
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setFotoPerfil("");
    setVarIdPersona("");
    //Ubigeo limpiar
    setModoEdicion(true);
    changeTabIndex(1);

  };

  const editarRegistro = async (dataRow) => {
    setLoading(true);
    setDataRowEditNewTabs({});
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    changeTabIndex(1);
    await obtenerPersona(dataRow);
    setModoEdicion(true);

  };

  const cancelarEdicion = () => {
    changeTabIndex(0);
    setModoEdicion(false);
    //setModoEdicionHijo(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
    setDataRowEditNewTabs({});

  };

  const seleccionarRegistro = async (dataRow) => {
    const { IdPersona, RowIndex } = dataRow;
    setSelected(dataRow);
    setVarIdPersona(IdPersona);
    obtenerFotoPerfilLocal(dataRow);
    setFocusedRowKey(RowIndex);
    //setFechaFinContrato(FechaFinContrato);
  }

  const verRegistroDblClick = async (dataRow) => {
    obtenerPersona(dataRow);
    changeTabIndex(1);
    setModoEdicion(false);
  };

  useEffect(() => {
    cargarCombos();
    obtenerConfiguracion();
    loadControlsPermission();
    configurationDiasPermanencia();
    setRefreshData(true);
  }, []);


  const changeTabIndex = (index) => {
    handleChange(null, index);
  }

  //:::::::::::::::::::::::::::::::::::::::::::::-funciones-persona-datos-:::::::::::::::::::::::::::::::::

  async function listarPersonaDatos() {
    setLoading(true);
    const { IdPersona, IdCliente } = selected;
    await listarDato({
      IdPersona, IdCliente, NumPagina: 0, TamPagina: 0
    }).then(datos => {
      setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
      setListarTabs(datos);
      setModoEdicionTabs(false);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });

  }

  async function agregarPersonaDatos(datos) {
    setLoading(true);
    const { IdCliente, IdPersona, TipoDato, Dato, Valor, Activo } = datos;
    let params = {
      IdPersona
      , IdCliente
      , IdSecuencial: 0
      , TipoDato: isNotEmpty(TipoDato) ? TipoDato : ""
      , Dato: isNotEmpty(Dato) ? Dato.toUpperCase() : ""
      , Valor: isNotEmpty(Valor) ? Valor.toUpperCase() : ""
      , Activo
      , IdUsuario: usuario.username
    };
    await crearDato(params).then(response => {
      if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      listarPersonaDatos();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function actualizarPersonaDatos(datos) {
    setLoading(true);
    const { IdPersona, IdCliente, IdSecuencial, TipoDato, Dato, Valor, Activo } = datos;
    let params = {
      IdPersona
      , IdCliente
      , IdSecuencial
      , TipoDato: isNotEmpty(TipoDato) ? TipoDato : ""
      , Dato: isNotEmpty(Dato) ? Dato.toUpperCase() : ""
      , Valor: isNotEmpty(Valor) ? Valor.toUpperCase() : ""
      , Activo
      , IdUsuario: usuario.username
    };
    await actualizarDato(params).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      listarPersonaDatos();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function eliminarPersonaDatos(datos, confirm) {
    setSelectedDelete(datos);
    setShowConfirmDelete(true);
    if (confirm) {
      setLoading(true);
      const { IdCliente, IdPersona, IdSecuencial } = datos;
      await eliminarDato({ IdCliente, IdPersona, IdSecuencial, IdUsuario: usuario.username }).then(response => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
      listarPersonaDatos();
    }
  }

  async function obtenerPersonaDatos(filtro) {
    setLoading(true);
    const { IdCliente, IdPersona, IdSecuencial } = filtro;
    await obtenerDato({ IdCliente, IdPersona, IdSecuencial })
      .then(dato => {
        setDataRowEditNewTabs({ ...dato, esNuevoRegistro: false });
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false) });

  }

  const editarPersonaDatos = dataRow => {
    setModoEdicionTabs(true);
    setTituloTabs(intl.formatMessage({ id: "ACTION.EDIT" }));
    obtenerPersonaDatos(dataRow);
  };


  //:::::::::::::::::::::::::::::::::::::::::::::-funciones-persona-foto:::::::::::::::::::::::::::::::::
  function obtenerFotoPerfilLocal(dataRow) {
    const { FotoPC } = dataRow;
    setFotoPerfil(FotoPC)
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
          setDataRowEditNewTabs({
            ...selected,
            esNuevoRegistro: true,
            FotoPC: null,
            FotoMovil: null,
            FotoExtra: null
          });
        }
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false) });
  }

  async function agregarPersonaFoto(personaFoto) {
    setLoading(true);
    const { IdPersona, IdCliente, FotoPC, FotoMovil, FotoExtra, Activo } = personaFoto;
    let params = {
      IdPersona
      , IdCliente
      , FotoPC: isNotEmpty(FotoPC) ? FotoPC : ""
      , FotoMovil: isNotEmpty(FotoMovil) ? FotoMovil : ""
      , FotoExtra: isNotEmpty(FotoExtra) ? FotoExtra : ""
      , FechaRegistro: new Date()
      , Activo: Activo
      , IdUsuario: usuario.username
    };
    await crearFoto(params).then(response => {
      if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      obtenerPersonaFoto(varIdPersona, true);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function actualizarPersonaFoto(personaFoto) {
    setLoading(true);
    const { IdPersona, IdCliente, FotoPC, FotoMovil, FotoExtra, Activo } = personaFoto;
    let params = {
      IdPersona
      , IdCliente
      , FotoPC: isNotEmpty(FotoPC) ? FotoPC : ""
      , FotoMovil: isNotEmpty(FotoMovil) ? FotoMovil : ""
      , FotoExtra: isNotEmpty(FotoExtra) ? FotoExtra : ""
      , FechaRegistro: new Date()
      , Activo
      , IdUsuario: usuario.username
    };
    await actualizarFoto(params).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      obtenerPersonaFoto(varIdPersona, true);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }


  //:::::::::::::::::::::::Función Persona Indisciplina::::::::::::::::::::::::::::::::::::::::

  async function listarPersonaIndisciplina() {
    setLoading(true);
    setListarTabs([]);
    await listarIndiscip({
      IdCliente: perfil.IdCliente,
      IdPersona: varIdPersona,
      IdIndisciplina: "%"
    }).then(perindisciplinas => {
      console.log("test_mas",perindisciplinas)
      setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
      setListarTabs(perindisciplinas);
      setModoEdicionTabs(false);
    }).catch((err) => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });

  }

  async function agregarPersonaIndisciplina(indisciplina) {

    const { IdIndisciplina, IdSecuencial, Severidad, Observacion, NombreArchivo, FileBase64, Indisciplina, FechaArchivo, Activo } = indisciplina;
    let params = {
      IdPersona: varIdPersona,
      IdCliente: perfil.IdCliente,
      IdIndisciplina: isNotEmpty(IdIndisciplina) ? IdIndisciplina.toUpperCase() : "",
      IdSecuencial: isNotEmpty(IdSecuencial) ? IdSecuencial : 0,
      Severidad: isNotEmpty(Severidad) ? Severidad : 0,
      Observacion: isNotEmpty(Observacion) ? Observacion.toUpperCase() : "",
      FileBase64: isNotEmpty(FileBase64) ? FileBase64 : "",
      NombreArchivo: isNotEmpty(NombreArchivo) ? NombreArchivo : "",
      IdItemSharepoint: "",
      ClaseArchivo: isNotEmpty(Indisciplina) ? Indisciplina : "",
      FechaArchivo: isNotEmpty(FechaArchivo) ? FechaArchivo : "",
      Activo: Activo,
      IdUsuario: usuario.username,
      PathFile: "",
      IdModulo: dataMenu.info.IdModulo,
      IdAplicacion: dataMenu.info.IdAplicacion,
      IdMenu: dataMenu.info.IdMenu,

    };
    if (isNotEmpty(FileBase64)) {
      setLoading(true);
      await uploadFile(params).then(response => {
        //Recuperar Nombre archivo.
        const { nombreArchivo, idItemSharepoint} = response;

        params.NombreArchivo = nombreArchivo;
        params.IdItemSharepoint = idItemSharepoint;

        crearIndiscip(params)
          .then((response) => {
            if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
            listarPersonaIndisciplina();
          })
          .catch((err) => {
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
          }).finally(() => { setLoading(false); });
      }).catch((err) => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
    }
    else {
      setLoading(true);
      await crearIndiscip(params)
        .then((response) => {
          if (response)
            handleSuccessMessages(
              intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" })
            );
          listarPersonaIndisciplina();
        })
        .catch((err) => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false) });
    }
  }

  async function actualizarPersonaIndisciplina(dataRow) {

    const { IdIndisciplina, IdSecuencial, Severidad, Observacion, NombreArchivo, FileBase64, Indisciplina, FechaArchivo, Activo ,IdItemSharepoint} = dataRow;
    let params = {
      IdPersona: varIdPersona,
      IdCliente: perfil.IdCliente,
      IdIndisciplina: isNotEmpty(IdIndisciplina) ? IdIndisciplina.toUpperCase() : "",
      IdSecuencial: isNotEmpty(IdSecuencial) ? IdSecuencial : 0,
      Severidad: isNotEmpty(Severidad) ? Severidad : 0,
      Observacion: isNotEmpty(Observacion) ? Observacion.toUpperCase() : "",
      FileBase64: isNotEmpty(FileBase64) ? FileBase64 : "",
      NombreArchivo: isNotEmpty(NombreArchivo) ? NombreArchivo : "",
      IdItemSharepoint: isNotEmpty(IdItemSharepoint) ? IdItemSharepoint : "",
      ClaseArchivo: isNotEmpty(Indisciplina) ? Indisciplina : "",
      FechaArchivo: isNotEmpty(FechaArchivo) ? FechaArchivo : "",
      Activo: Activo,
      IdUsuario: usuario.username,
      PathFile: "",
      IdModulo: dataMenu.info.IdModulo,
      IdAplicacion: dataMenu.info.IdAplicacion,
      IdMenu: dataMenu.info.IdMenu
    };
    if (isNotEmpty(FileBase64)) {
      setLoading(true);
      await uploadFile(params).then(response => {
        //Recuperar Nombre archivo.
        const { nombreArchivo ,idItemSharepoint} = response;
        params.NombreArchivo = nombreArchivo;
        params.IdItemSharepoint = idItemSharepoint;
        actualizarIndiscip(params)
          .then(() => {
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
            listarPersonaIndisciplina();
          })
          .catch((err) => {
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
          }).finally(() => { setLoading(false); });
      }).catch((err) => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
    }
    else {
      setLoading(true);
      await actualizarIndiscip(params)
        .then(() => {
          handleSuccessMessages(
            intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" })
          );
          listarPersonaIndisciplina();
        })
        .catch((err) => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
    }
  }

  async function eliminarPersonaIndisciplina(indisciplina, confirm) {
    setSelectedDelete(indisciplina);
    setShowConfirmDelete(true);
    if (confirm) {
      setLoading(true);
      const { IdCliente, IdSecuencial, IdPersona } = indisciplina;
      await eliminarIndiscip({
        IdCliente,
        IdSecuencial,
        IdPersona,
        IdUsuario: usuario.username,
      }).then(() => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
      listarPersonaIndisciplina();
    }
  }

  async function obtenerPersonaIndisciplina(filtro) {
    setLoading(true);
    const { IdCliente, IdPersona, IdSecuencial, IdIndisciplina } = filtro;

    await obtenerIndiscip({
      IdCliente,
      IdPersona,
      IdSecuencial,
      IdIndisciplina
    }).then(indiciplina => {
      // console.log("obtenerPersonaIndisciplina|indiciplina:",indiciplina);
      setDataRowEditNewTabs({ ...indiciplina, esNuevoRegistro: false });
    }).catch((err) => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false) });
  }

  const editarPersonaIdIndisciplina = (dataRow) => {
    setModoEdicionTabs(true);
    setTituloTabs(intl.formatMessage({ id: "ACTION.EDIT" }));
    obtenerPersonaIndisciplina(dataRow);
  };

  const seleccionarPersonaIdIndisciplina = (dataRow) => { };

  async function obtenerConfiguracion() {
    await Promise.all([
      obtenerSistemaConfiguracion({ IdCliente: perfil.IdCliente, IdConfiguracion: 'MAXIMAGESIZECLIENTE' }),
      obtenerSistemaConfiguracion({ IdCliente: perfil.IdCliente, IdConfiguracion: 'CLIENTIMAGERATIO' }),
      obtenerSistemaConfiguracion({ IdCliente: perfil.IdCliente, IdConfiguracion: 'SIZEMAXPHOTOUPLOAD' }),
      obtenerSistemaConfiguracion({ IdCliente: perfil.IdCliente, IdConfiguracion: 'ACTIVAR_TXT_UBIGEO' })
    ])
      .then(resp => {
        let weight = resp[2].Valor1 || 5; //Default 5MB; 
        setImagenConfiguracion({
          height: resp[0].Valor1,
          width: resp[0].Valor2,
          minRange: resp[1].Valor1,
          maxRange: resp[1].Valor2,
          weight: (weight * 1024 * 1024)////Se debe convertir de MB a bytes
        });

        setAlturaSugerido(resp[0].Valor1)
        setAnchoSugerido(resp[0].Valor2)

        setAlturaSugeridoRadio(resp[1].Valor1)
        setAnchoSugeridoRadio(resp[1].Valor2)

        //configuración para ACTIVAR_TXT_UBIGEO
        if(isNotEmpty(resp[3])) {
          let flg = isNotEmpty(resp[3].Valor1) && resp[3].Valor1.toUpperCase() === "S"
          setActivarTxtUbigeo(flg);
        }
        else{
          setActivarTxtUbigeo(false)
        }
      })
  }


  //::::::::::-Funciones, Persona Visita-:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  async function configurationDiasPermanencia() {
    setLoading(true);
    await service.obtenerDiasVisita()
      .then(result => {
        setMaxDiasVisita(result.DiasPermanencia);
      }).finally(() => { setLoading(false); });
  }

  async function agregarPersonaVisita(visita) {
    setLoading(true);
    const { IdPersona, IdCliente, IdSecuencial, IdDivision, IdPersonaResponsable, Motivo, PersonaNatural, IdCompania, Compania, FechaInicio, FechaFin } = visita;
    //  console.log("agregarPersonaVisita|visita:",visita);
    let params = {
      IdPersona
      , IdCliente
      , IdSecuencial: isNotEmpty(IdSecuencial) ? IdSecuencial : 0
      , IdDivision: isNotEmpty(IdDivision) ? IdDivision : ""
      , IdPersonaResponsable: isNotEmpty(IdPersonaResponsable) ? IdPersonaResponsable : ""
      , Motivo: isNotEmpty(Motivo) ? Motivo.toUpperCase() : ""
      , PersonaNatural: PersonaNatural ? "S" : "N"
      , IdCompania: isNotEmpty(IdCompania) ? IdCompania : ""
      , Compania: isNotEmpty(Compania) ? Compania.toUpperCase() : ""
      , FechaInicio: dateFormat(FechaInicio, 'yyyyMMdd')
      , FechaFin: dateFormat(FechaFin, 'yyyyMMdd')
      , IdUsuario: usuario.username
    };
    await crearVisita(params).then(response => {
      if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      listarPersonaVisita();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function actualizarPersonaVisita(visita) {
    setLoading(true);
    const { IdPersona, IdCliente, IdSecuencial, IdDivision, IdPersonaResponsable, Motivo, PersonaNatural, IdCompania, Compania, FechaInicio, FechaFin } = visita;
    let params = {
      IdPersona
      , IdCliente
      , IdSecuencial: isNotEmpty(IdSecuencial) ? IdSecuencial : 0
      , IdDivision: isNotEmpty(IdDivision) ? IdDivision : ""
      , IdPersonaResponsable: isNotEmpty(IdPersonaResponsable) ? IdPersonaResponsable : ""
      , Motivo: isNotEmpty(Motivo) ? Motivo.toUpperCase() : ""
      , PersonaNatural: PersonaNatural ? "S" : "N"
      , IdCompania: isNotEmpty(IdCompania) ? IdCompania : ""
      , Compania: isNotEmpty(Compania) ? Compania.toUpperCase() : ""
      , FechaInicio: dateFormat(FechaInicio, 'yyyyMMdd')
      , FechaFin: dateFormat(FechaFin, 'yyyyMMdd')
      , IdUsuario: usuario.username
    };
    await actualizarVisita(params).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      listarPersonaVisita();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function eliminarPersonaVisita(visita, confirm) {
    setSelectedDelete(visita);
    setShowConfirmDelete(true);
    if (confirm) {
      setLoading(true);
      const { IdPersona, IdCliente, IdSecuencial } = visita;
      await eliminarVisita({ IdPersona: IdPersona, IdSecuencial: IdSecuencial, IdCliente: IdCliente, IdUsuario: usuario.username }).then(response => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
      listarPersonaVisita();
    }
  }

  async function listarPersonaVisita() {
    setLoading(true);
    setModoEdicionTabs(false);
    await listarVisita({
      IdPersona: varIdPersona, IdCliente: perfil.IdCliente, NumPagina: 0, TamPagina: 0
    }).then(response => {
      setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
      setListarTabs(response);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function obtenerPersonaVisita(filtro) {
    setLoading(true);
    const { IdPersona, IdCliente, IdSecuencial } = filtro;

    await obtenerVisita({ IdPersona, IdCliente, IdSecuencial })
      .then(response => {
        let PersonaNatural = response.PersonaNatural === "S" ? true : false;
        setDataRowEditNewTabs({ ...response, PersonaNatural, esNuevoRegistro: false });
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      })
      .finally(() => { setLoading(false) });
  }

  const editarPersonaVisita = dataRow => {
    setModoEdicionTabs(true);
    setTituloTabs(intl.formatMessage({ id: "ACTION.EDIT" }));
    obtenerPersonaVisita(dataRow);
  };

  const nuevoPersonaVisita = () => {
    let hoy = new Date();
    var FechaFin = new Date().setDate(new Date().getDate() + parseInt(maxDiasVisita - 1));
    let nuevo = {
      FechaInicio: hoy,
      Activo: "S",
      ...selected,
      IdDivision: perfil.IdDivision,
      Division: perfil.Division
    };
    setDataRowEditNewTabs({ ...nuevo, FechaFin, esNuevoRegistro: true });
    setTituloTabs(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicionTabs(true);

  };

  //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  const nuevoRegistroTabs = () => {
    //console.log("nuevoRegistroTabs|");
    let nuevo = { Activo: "S", ...selected };
    setDataRowEditNew({ ...nuevo, esNuevoRegistro: true });
    setDataRowEditNewTabs({ ...nuevo, esNuevoRegistro: true });
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
    setModoEdicionTabs(true);
    //setModoEdicionHijo(false);
  };

  const cancelarEdicionTabs = () => {
    setModoEdicion(false);
    setModoEdicionTabs(false);
    //setModoEdicionHijo(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
    setDataRowEditNewTabs({});
  };


  //Datos Principales
  const getInfo = () => {

    const { IdPersona, NombreCompleto } = selected;
    return [

      { text: [intl.formatMessage({ id: "COMMON.CODE" })], value: IdPersona, colSpan: 2 },
      { text: [intl.formatMessage({ id: "ADMINISTRATION.PERSON.NAME" })], value: NombreCompleto, colSpan: 4 },
      // { text: [intl.formatMessage({ id: "ADMINISTRATION.PERSON.CONDITION" })], value: Condicion, colSpan: 1 },

    ];
  }

  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  async function eliminarListRowTab(rowData, confirm) {
    let currentTab = tabIndex;
    switch (currentTab) {
      case 0:
        eliminarRegistro(rowData, confirm);
        break;

      case 2://Foto
        eliminarRegistroFoto(rowData, confirm);
        break;
      // case 3:
      //   eliminarPersonaContrato(rowData, confirm);
      //   break;
      case 5:
        eliminarPersonaDatos(rowData, confirm);
        break;
      // case 6:
      //   eliminarRegistroRegimen(rowData, confirm);
      //   break;
      case 4:
        eliminarPersonaVisita(rowData, confirm);
        break;
      // case 8:
      //   eliminarRegistroCaracteristica(rowData, confirm);
      //   break;
      case 7:
        eliminarPersonaIndisciplina(rowData, confirm);
        break;
      default: break;
    }
  }

  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::-Configuración - Tabs::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::


  const tabContent_PersonaListPage = () => {
    return <>
      <PersonaListPage
        titulo={titulo}
        editarRegistro={editarRegistro}
        eliminarRegistro={eliminarRegistro}
        nuevoRegistro={nuevoRegistro}
        seleccionarRegistro={seleccionarRegistro}
        verRegistroDblClick={verRegistroDblClick}
        focusedRowKey={focusedRowKey}
        setFocusedRowKey={setFocusedRowKey}
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
    </>
  }

  const tabContent_PersonaEditPage = () => {
    return <>
      <PersonaEditTabPage
        modoEdicion={modoEdicion}
        titulo={titulo}
        dataRowEditNew={dataRowEditNew}
        idPersona={varIdPersona}
        setDataRowEditNew={setDataRowEditNew}
        actualizarPersona={actualizarPersona}
        agregarPersona={agregarPersona}
        cancelarEdicion={cancelarEdicion}
        //req y edit
        settingDataField={dataMenu.datos}
        accessButton={accessButton}
        getInfo={getInfo}
        dataCombos={dataCombos}
        activarTxtUbigeo={activarTxtUbigeo}
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

  }

  const tabContent_PersonaFotoEditPage = () => {
    return <>
      <PersonaFotoEditPage
        modoEdicion={modoEdicion}
        setDataRowEditNew={setDataRowEditNewTabs}
        dataRowEditNew={dataRowEditNewTabs}
        actualizarFoto={actualizarPersonaFoto}
        agregarFoto={agregarPersonaFoto}
        cancelarEdicion={cancelarEdicion}
        titulo={tituloTabs}
        size={classes.avatarLarge}
        uploadImagen={true}
        getInfo={getInfo}
        imagenConfiguracion={imagenConfiguracion}
        eliminarRegistro={eliminarRegistroFoto}
        editable={true}
        medidaSugeridas={{
          width: anchoSugerido, height: alturaSugerido,
          width_radio: anchoSugeridoRadio, height_radio: alturaSugeridoRadio
        }}

      />

      <div className="container_only">
        <div className="float-right">
          <ControlSwitch checked={auditoriaSwitch}
            onChange={e => { setAuditoriaSwitch(e.target.checked) }}
          /><b> {intl.formatMessage({ id: "AUDIT.DATA" })}</b>
        </div>
      </div>
      {auditoriaSwitch && (<AuditoriaPage dataRowEditNew={dataRowEditNewTabs} />)}
    </>
  }

  const tabContent_PersonaVisita = () => {
    return <>
      {modoEdicionTabs && (
        <>
          <PersonaVisitaEditPage
            modoEdicion={modoEdicionTabs}
            dataRowEditNew={dataRowEditNewTabs}
            setDataRowEditNew={setDataRowEditNew}
            actualizarVisita={actualizarPersonaVisita}
            agregarVisita={agregarPersonaVisita}
            cancelarEdicion={cancelarEdicionTabs}
            titulo={tituloTabs}
            settingDataField={dataMenu.datos}
            accessButton={accessButton}
            maxDiasVisita={maxDiasVisita}

          />
          <div className="container_only">
            <div className="float-right">
              <ControlSwitch checked={auditoriaSwitch}
                onChange={e => { setAuditoriaSwitch(e.target.checked) }}
              /><b> {intl.formatMessage({ id: "AUDIT.DATA" })}</b>
            </div>
          </div>
          {auditoriaSwitch && (<AuditoriaPage dataRowEditNew={dataRowEditNewTabs} />)}
        </>
      )}
      {!modoEdicionTabs && (
        <>
          <PersonaVisitaListPage
            personasVisita={listarTabs}
            editarRegistro={editarPersonaVisita}
            eliminarRegistro={eliminarPersonaVisita}
            nuevoRegistro={nuevoPersonaVisita}
            cancelarEdicion={cancelarEdicion}
            getInfo={getInfo}
            accessButton={accessButton}
          />
        </>
      )}
    </>

  }

  const tabContent_PersonaContrato = () => {
    return <>

      <PersonaContratoIndexPage
        varIdPersona={varIdPersona}
        cancelarEdicion={cancelarEdicion}
        getInfo={getInfo}
        accessButton={accessButton}
        settingDataField={dataMenu.datos}
        selectedIndex={selected}
        ocultarEdit={false}
      />


    </>

  }


  const tabContent_PersonaDatos = () => {
    return <>
      {modoEdicionTabs && (
        <>
          <PersonaDatosEditPage
            modoEdicion={modoEdicionTabs}
            dataRowEditNew={dataRowEditNewTabs}
            actualizarDatos={actualizarPersonaDatos}
            agregarDatos={agregarPersonaDatos}
            cancelarEdicion={cancelarEdicionTabs}
            titulo={tituloTabs}
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
          {auditoriaSwitch && (<AuditoriaPage dataRowEditNew={dataRowEditNewTabs} />)}
        </>
      )}
      {!modoEdicionTabs && (
        <>
          <PersonaDatosListPage
            personaDatos={listarTabs}
            editarRegistro={editarPersonaDatos}
            eliminarRegistro={eliminarPersonaDatos}
            nuevoRegistro={nuevoRegistroTabs}
            cancelarEdicion={cancelarEdicion}
            getInfo={getInfo}
            accessButton={accessButton}
            settingDataField={dataMenu.datos}
          />
        </>
      )}
    </>

  }

  const tabContent_PersonaCaracteristica = () => {
    return <>
      <PersonaCaracteristicaIndexPage
        varIdPersona={varIdPersona}
        cancelarEdicion={cancelarEdicion}
        getInfo={getInfo}
        accessButton={accessButton}
        settingDataField={dataMenu.datos}
        pathFile={""}
      />
    </>

  }
  const tabContent_PersonaIndisciplina = () => {
    return <>
      {modoEdicionTabs && (
        <>
          <PersonaIndisciplinaEditPage
            modoEdicion={modoEdicionTabs}
            dataRowEditNew={dataRowEditNewTabs}
            actualizarPersonaIndisciplina={actualizarPersonaIndisciplina}
            agregarPersonaIndisciplina={agregarPersonaIndisciplina}
            cancelarEdicion={cancelarEdicionTabs}
            titulo={tituloTabs}
            accessButton={accessButton}
            settingDataField={dataMenu.datos}
            idAplicacion={dataMenu.info.IdAplicacion}
            idModulo={dataMenu.info.IdModulo}
            idMenu={dataMenu.info.IdMenu}
          />
          <div className="container_only">
            <div className="float-right">
              <ControlSwitch checked={auditoriaSwitch}
                onChange={e => { setAuditoriaSwitch(e.target.checked) }}
              /><b> {intl.formatMessage({ id: "AUDIT.DATA" })}</b>
            </div>
          </div>
          {auditoriaSwitch && (<AuditoriaPage dataRowEditNew={dataRowEditNewTabs} />)}
        </>
      )}
      {!modoEdicionTabs && (
        <>
          <PersonaIndisciplinaListPage
            personaIndisciplinas={listarTabs}
            editarRegistro={editarPersonaIdIndisciplina}
            eliminarRegistro={eliminarPersonaIndisciplina}
            nuevoRegistro={nuevoRegistroTabs}
            seleccionarRegistro={seleccionarPersonaIdIndisciplina}
            cancelarEdicion={cancelarEdicion}
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


  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  return <>
    <input type="hidden" value={varIdPersona} id="hidIdPersona" name="hidIdPersona" />
    <input type="hidden" value={fotoPerfil} id="hidIdPersona" name="hidFotoPerfil" />

    <TabNavContainer
      title={intl.formatMessage({ id: "ADMINISTRATION.PERSON.MENU" })}
      submenu={`${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} `}
      subtitle=''
      nombrebarra={titleHeaderToolbar()}
      tabIndex={tabIndex}
      handleChange={handleChange}
      componentTabsHeaders={[
        {
          label: intl.formatMessage({ id: "ACTION.LIST" }),
          icon: <FormatListNumberedIcon fontSize="large" />,
          disabled: false,
        },
        {
          label: intl.formatMessage({ id: "ADMINISTRATION.PERSON" }),
          icon: <AvatarFoto size={classes.avatarSmall} id={"FotoPerfil"} imagenB64={fotoPerfil} />,
          className: classes.avatarContent,
          onClick: () => { obtenerPersona(selected); },
          disabled: !tabsDisabled()
        },
        {
          label: intl.formatMessage({ id: "ADMINISTRATION.PERSON.PHOTO" }),
          icon: <AccountCircleOutlinedIcon fontSize="large" />,
          onClick: () => { obtenerPersonaFoto(varIdPersona, false) },
          disabled: tabsDisabled() && accessButton.Tabs[2] ? false : true
        },
        {
          label: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CONTRACT" }),
          icon: <DescriptionIcon fontSize="large" />,
          disabled: tabsDisabled() && accessButton.Tabs[3] ? false : true
        },
        {
          label: intl.formatMessage({ id: "ADMINISTRATION.PERSON.VISIT" }),
          icon: <TransferWithinAStationSharpIcon fontSize="large" />,
          onClick: () => { listarPersonaVisita() },
          disabled: tabsDisabled() && accessButton.Tabs[4] ? false : true
        },
        {
          label: intl.formatMessage({ id: "ASSISTANCE.JUSTIFICACION.OTHERDATA" }),
          icon: <UsbOutlinedIcon fontSize="large" />,
          onClick: () => { listarPersonaDatos() },
          disabled: tabsDisabled() && accessButton.Tabs[5] ? false : true
        },
        {
          label: intl.formatMessage({ id: "ADMINISTRATION.CHARACTERISTIC" }),
          icon: <PlaylistAddCheckOutlinedIcon fontSize="large" />,
          disabled: tabsDisabled() && accessButton.Tabs[6] ? false : true
        },
        {
          label: intl.formatMessage({ id: "ADMINISTRATION.PERSON.INDISCIPLINE" }),
          icon: <GavelIcon fontSize="large" />,
          onClick: () => { listarPersonaIndisciplina() },
          disabled: tabsDisabled() && accessButton.Tabs[7] ? false : true
        }
      ]}
      className={classes.tabContent}
      componentTabsBody={
        [
          tabContent_PersonaListPage(),
          tabContent_PersonaEditPage(),
          tabContent_PersonaFotoEditPage(),
          tabContent_PersonaContrato(),
          tabContent_PersonaVisita(),
          tabContent_PersonaDatos(),
          tabContent_PersonaCaracteristica(),
          tabContent_PersonaIndisciplina(),
        ]
      }

    />
    <Confirm
      message={intl.formatMessage({ id: "ALERT.REMOVE" })}
      isVisible={showConfirmDelete}
      setIsVisible={setShowConfirmDelete}
      onConfirm={() => eliminarListRowTab(selectedDelete, true)}
      title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
      confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
      cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
    />

  </>
};

export default injectIntl(WithLoandingPanel(PersonaIndexPage));
