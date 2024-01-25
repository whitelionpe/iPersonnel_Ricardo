import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import {
  handleErrorMessages,
  handleSuccessMessages,
} from "../../../../store/ducks/notify-messages";
import {
  useStylesEncabezado,
  useStylesTab,
} from "../../../../store/config/Styles";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import Confirm from "../../../../partials/components/Confirm";
import Alerts from "../../../../partials/components/Alert/Alerts";
import { useSelector } from "react-redux";
import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";
import { dateFormat, isNotEmpty } from "../../../../../_metronic";
import { getButtonPermissions, defaultPermissions, setDisabledTabs } from '../../../../../_metronic/utils/securityUtils'
import FormatListNumberedIcon from "@material-ui/icons/FormatListNumbered";
import PersonIcon from "@material-ui/icons/Person";
import AssignmentIndIcon from "@material-ui/icons/AssignmentInd";
import BusinessIcon from '@material-ui/icons/Business';
import UsuarioListPage from "./UsuarioListPage";
import UsuarioEditPage from "./UsuarioEditPage";
import UsuarioPerfilEditPage from "../usuario/UsuarioPerfilEditPage";
import UsuarioPerfilListPage from "../usuario/UsuarioPerfilListPage";

import UsuarioCompaniaListPage from "../usuario/UsuarioCompaniaListPage";
import UsuarioFotoPage from "../usuario/UsuarioFotoPage";
import UsuarioCompaniaEditPage from "../usuario/UsuarioCompaniaEditPage";
import AccountCircleOutlinedIcon from "@material-ui/icons/AccountCircleOutlined";

import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import TabNavContainer from "../../../../partials/components/Tabs/TabNavContainer";

import { obtener as obtenerSistemaConfiguracion } from "../../../../api/sistema/configuracion.api";
import { serviceUsuarioPerfil } from "../../../../api/seguridad/usuarioPerfil.api";
import { servicePerfil } from "../../../../api/seguridad/perfil.api";
import { listar as listarUCompania, obtener as obtenerUCompania, crear as crearUCompania, actualizar as actualizarUCompania, eliminar as eliminarUCompania } from "../../../../api/seguridad/usuarioCompania.api";
import { serviceUser } from "../../../../api/seguridad/usuario.api";
import { serviceUsuarioClave } from "../../../../api/seguridad/usuarioClave.api";
import {
  crear as crearFoto,
  obtener as obtenerFoto,
  actualizar as actualizarFoto,
} from "../../../../api/seguridad/usuarioFoto.api";
import { obtener_medidas as obtenerSistemaConfiguracionMedidas } from "../../../../api/sistema/configuracion.api";
import './UsuarioPage.css';

export const initialFilter = {
  Activo: 'S',
  IdCliente: '',
  IdUsuario: '',
  IdPerfil: '',
  IdModulo: '',
  IdAplicacion: '',
  Contratista: ''
};

const UsuarioIndex = (props) => {
  const { intl, setLoading, dataMenu } = props;
  const usuario = useSelector((state) => state.auth.user);
  const perfil = useSelector((state) => state.perfil.perfilActual);

  const [varIdUsuario, setVarIdUsuario] = useState("");
  const [imagenConfiguracion, setImagenConfiguracion] = useState({ width: 100, height: 100, minRange: 0.2, maxRange: 0.2, weight: 5242880 });

  const [focusedRowKey, setFocusedRowKey] = useState();
  const [perfilesData, setPerfilesData] = useState([]);
  const [gridBoxValue, setGridBoxValue] = useState([]);

  const [alturaSugerido, setAlturaSugerido] = useState();
  const [anchoSugerido, setAnchoSugerido] = useState();
  const [alturaSugeridoRadio, setAlturaSugeridoRadio] = useState();
  const [anchoSugeridoRadio, setAnchoSugeridoRadio] = useState();

  //Datos principales
  const [selected, setSelected] = useState({});
  const [selectedDelete, setSelectedDelete] = useState({});
  const [isVisibleAlert, setIsVisibleAlert] = useState(true);

  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);

  const [titulo, setTitulo] = useState(
    intl.formatMessage({ id: "ACTION.LIST" })
  );
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
  const [tituloTabs, setTituloTabs] = useState(
    intl.formatMessage({ id: "ACTION.LIST" })
  );
  const [listarTabs, setListarTabs] = useState([]);

  const classesEncabezado = useStylesEncabezado();
  const classes = useStylesTab();
  const [tabIndex, setTabIndex] = useState(0);

  const [isVisible, setIsVisible] = useState(false);
  const [instance, setInstance] = useState({});

  const handleChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const [totalRowIndex, setTotalRowIndex] = useState(0);

  //FILTRO- CustomerDataGrid
  const [isFirstDataLoad, setIsFirstDataLoad] = useState(true);
  const [refreshData, setRefreshData] = useState(false);
  const ds = new DataSource({ store: new ArrayStore({ data: [], key: 'RowIndex' }), reshapeOnPush: false });
  const [dataSource] = useState(ds);

  const refresh = () => dataSource.refresh();
  const resetLoadOptions = () => dataSource.resetLoadOptions();


  /**Configuración Botones**************************************** */
  const [accessButton, setAccessButton] = useState(defaultPermissions);

  const loadControlsPermission = () => {
    const numeroTabs = 6; //Nùmero de tab del formulario.
    let buttonsPermissions = getButtonPermissions(dataMenu.objetos);
    let newTabs = setDisabledTabs(dataMenu.objetos, numeroTabs);

    setAccessButton({ ...accessButton, ...buttonsPermissions, Tabs: newTabs });
  }

  /*********************************************************** */
  // const [moduloData, setModuloData] = useState([]);
  const [focusedRowKeyUsuarioCompania, setFocusedRowKeyUsuarioCompania] = useState();
  //::::::::::::::::::::::::::::FUNCIONES USUARIO:::::::::::::::::::::::::::::::::::

  async function restablecerPassword(dataRow) {
    setLoading(true);
    const { IdUsuario } = dataRow;
    await serviceUsuarioClave.resetearPassword({
      IdUsuario: isNotEmpty(IdUsuario) ? IdUsuario.toUpperCase() : "",
      IdTipoAplicacion: "WEB"
    }).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "SECURITY.USER.SUCCESSFULLY.RESTORED" }));
      setModoEdicion(false);
      listarUsuarios();
    }).catch((err) => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function blockAndUnlockUserAccount(dataRow, blockUser = true, refreshListUser = true) {
    setLoading(true);
    const { IdUsuario } = dataRow;

    if (blockUser) {
      //-> API. Bloquear cuenta de usuario.
      await serviceUser.bloquearUsuario({
        IdUsuario,
        IdTipoAplicacion: "WEB"
      }).then(() => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
        if (refreshListUser) {
          setModoEdicion(false);
          listarUsuarios();
        }
      }).catch((err) => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
    }

    if (!blockUser) {
      //-> API. Desbloquer cuenta de usuario.
      await serviceUser.desBloquearUsuario({
        IdUsuario,
        IdTipoAplicacion: "WEB"
      }).then(() => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
        if (refreshListUser) {
          setModoEdicion(false);
          listarUsuarios();
        }
      }).catch((err) => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
    }

  }

  async function listarUsuarios() {
    //setModoEdicion(false);
    setRefreshData(true);//Actualizar CustomDataGrid
    changeTabIndex(0);
  }

  async function agregarUsuario(dataRow) {
    //console.log("agregarUsuario.dataRow", dataRow);
    setLoading(true);
    const {
      IdUsuario
      , Nombre
      , Apellido
      , IdTipoDocumento
      , Documento
      , Correo
      , Telefono
      , Bloqueado
      , CaducaClave
      , PrimeraClaveCambiada
      , SuperAdministrador
      , ValidarAd
      , IdPersona
      , IdConfiguracionLogeo
      , Activo
      , ValidaEmailAD
    } = dataRow;

    let param = {
      IdCliente: perfil.IdCliente,
      IdUsuario: isNotEmpty(IdUsuario) ? IdUsuario.toUpperCase() : "",
      Nombre: isNotEmpty(Nombre) ? Nombre.toUpperCase() : "",
      Apellido: isNotEmpty(Apellido) ? Apellido.toUpperCase() : "",
      IdTipoDocumento: isNotEmpty(IdTipoDocumento) ? IdTipoDocumento.toUpperCase() : "",
      Documento: Documento,
      Correo: isNotEmpty(Correo) ? Correo.toUpperCase() : "",
      Telefono: isNotEmpty(Telefono) ? Telefono.toUpperCase() : "",
      Bloqueado: Bloqueado ? "S" : "N",
      CaducaClave: CaducaClave ? "S" : "N",
      PrimeraClaveCambiada: PrimeraClaveCambiada ? "S" : "N",
      SuperAdministrador: SuperAdministrador ? "S" : "N",
      ValidarAd: ValidarAd ? "S" : "N",
      IdPersona: isNotEmpty(IdPersona) ? IdPersona : 0, //pendiente
      IdConfiguracionLogeo: isNotEmpty(IdConfiguracionLogeo) ? IdConfiguracionLogeo : "S",
      Activo: Activo,
      IdUsuarioCreacion: usuario.username,
      ValidaEmailAD: ValidaEmailAD
    }//;
    await serviceUser.crear(param).then(result => {
      //console.log("agregarUsuario.crear.then",result);
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));

      listarUsuarios();
      setModoEdicion(false);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function agregarUsuarioFoto(dataRow, flIdUsuario) {
    setLoading(true);
    const { Foto, IdUsuario } = dataRow;
    let param = {
      IdCliente: perfil.IdCliente,
      IdUsuario: flIdUsuario ? IdUsuario : varIdUsuario,
      Foto: Foto,
      IdUsuarioCreacion: usuario.username,
    };

    await crearFoto(param)
      .then((response) => {
        handleSuccessMessages(
          intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" })
        );

        listarUsuarios();
        setModoEdicion(false);
      })
      .catch((err) => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
  }

  async function actualizarUsuario(dataRow) {
    setLoading(true);
    const {
      IdUsuario
      , Nombre
      , Apellido
      , IdTipoDocumento
      , Documento
      , Correo
      , Telefono
      , Bloqueado
      , CaducaClave
      , PrimeraClaveCambiada
      , SuperAdministrador
      , ValidarAd
      , IdPersona
      , IdConfiguracionLogeo
      , Activo
      , ValidaEmailAD
    } = dataRow;

    let param = {
      IdCliente: perfil.IdCliente,
      IdUsuario: isNotEmpty(IdUsuario) ? IdUsuario.toUpperCase() : "",
      Nombre: isNotEmpty(Nombre) ? Nombre.toUpperCase() : "",
      Apellido: isNotEmpty(Apellido) ? Apellido.toUpperCase() : "",
      IdTipoDocumento: isNotEmpty(IdTipoDocumento) ? IdTipoDocumento.toUpperCase() : "",
      Documento: Documento,
      Correo: Correo,
      Telefono: isNotEmpty(Telefono) ? Telefono.toUpperCase() : "",
      Bloqueado: Bloqueado ? "S" : "N",
      CaducaClave: CaducaClave ? "S" : "N",
      PrimeraClaveCambiada: PrimeraClaveCambiada ? "S" : "N",
      SuperAdministrador: SuperAdministrador ? "S" : "N",
      ValidarAd: ValidarAd ? "S" : "N",
      IdPersona: isNotEmpty(IdPersona) ? IdPersona : 0, //pendiente
      IdConfiguracionLogeo: isNotEmpty(IdConfiguracionLogeo) ? IdConfiguracionLogeo : "S",
      Activo: Activo,
      IdUsuarioCreacion: usuario.username,
      ValidaEmailAD: ValidaEmailAD
    };


    await serviceUser.actualizar(param)
      .then(() => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
        listarUsuarios();
        setModoEdicion(false);
      })
      .catch((err) => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });


  }

  async function eliminarUsuario(dataRow, confirm) {
    setSelectedDelete(dataRow);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdUsuario } = dataRow;
      await serviceUser.eliminar({
        IdCliente: perfil.IdCliente,
        IdUsuario: IdUsuario,
      }).then(() => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }),
          intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
        listarUsuarios();
      }).catch((err) => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });

    }
  }

  async function obtenerUsuarioPersona(usuario) {
    setLoading(true);
    const { IdUsuario } = usuario;
    await serviceUser.obtenerPersona({
      IdCliente: perfil.IdCliente,
      IdUsuario,
    }).then(usuario => {
      if (isNotEmpty(usuario.IdPersona)) {
        setIsVisibleAlert(false);
      } else {
        setIsVisibleAlert(true);
      }
      setSelected({ ...usuario, modoEdicion, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });

  }

  async function obtenerUsuario(filtro) {
    setLoading(true);
    const { IdCliente, IdUsuario } = filtro;
    await serviceUser.obtener({
      IdCliente,
      IdUsuario,
    }).then(usuario => {
      console.log("**********obtenerUsuario:>", usuario);
      usuario.Bloqueado = usuario.Bloqueado === "S" ? true : false;
      usuario.CaducaClave = usuario.CaducaClave === "S" ? true : false;
      usuario.PrimeraClaveCambiada = usuario.PrimeraClaveCambiada === "S" ? true : false;
      usuario.SuperAdministrador = usuario.SuperAdministrador === "S" ? true : false;
      usuario.ValidarAd = usuario.ValidarAd === "S" ? true : false;

      setDataRowEditNew({ ...usuario, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });

  }

  const nuevoRegistro = () => {
    setDataRowEditNew({});
    let usuario = { Activo: "S", Bloqueado: false, CaducaClave: false, PrimeraClaveCambiada: false, SuperAdministrador: false };
    setDataRowEditNew({ ...usuario, esNuevoRegistro: true });
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
    changeTabIndex(1);
  };

  const editarRegistro = dataRow => {
    changeTabIndex(1);
    setModoEdicion(true);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    obtenerUsuario(dataRow);
  };

  const cancelarEdicion = () => {
    changeTabIndex(0);
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };

  const seleccionarRegistro = dataRow => {
    const { IdUsuario, RowIndex } = dataRow;
    setModoEdicion(false);
    //Datos Principales
    setSelected(dataRow);
    setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
    if (IdUsuario != varIdUsuario) {
      setVarIdUsuario(IdUsuario);
      setFocusedRowKey(RowIndex);
    }
  };

  const verRegistroDblClick = async (dataRow) => {
    changeTabIndex(1);
    setModoEdicion(false);
    await obtenerUsuario(dataRow);
  };

  async function obtenerConfiguracion() {

    await Promise.all([
      obtenerSistemaConfiguracion({ IdCliente: perfil.IdCliente, IdConfiguracion: 'MAXIMAGESIZECLIENTE' }),
      obtenerSistemaConfiguracion({ IdCliente: perfil.IdCliente, IdConfiguracion: 'CLIENTIMAGERATIO' }),
      obtenerSistemaConfiguracion({ IdCliente: perfil.IdCliente, IdConfiguracion: 'SIZEMAXPHOTOUPLOAD' })
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
      })

  }


  useEffect(() => {

    obtenerConfiguracion();
    listarUsuarios();
    loadControlsPermission();
  }, []);

  //::::::::::::::::::::::FUNCION PERFILES::::::::::::::::::::::::::::::::::::



  async function agregarUsuarioPerfil(perfiles) {
    var response = "";
    setLoading(true);
    perfiles.map(async (data) => {
      const { IdPerfil } = data;
      let params = {
        IdCliente: perfil.IdCliente,
        IdUsuario: varIdUsuario,
        IdPerfil: isNotEmpty(IdPerfil) ? IdPerfil.toUpperCase() : "",
        Activo: 'S',
        IdUsuarioModify: usuario.username,
      };
      await serviceUsuarioPerfil.crear(params).then(response => {
        listar_UsuarioPerfil(params);
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
    });

    for (let i = 0; i < perfiles.length; i++) {
      if (i === perfiles.length - 1) {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      }
    }
  }

  async function actualizarUsuarioPerfil(dataRow) {
    setLoading(true);
    const { IdUsuario, IdPerfil, Activo } = dataRow;
    let params = {
      IdCliente: perfil.IdCliente,
      IdUsuario: varIdUsuario,
      IdPerfil: isNotEmpty(IdPerfil) ? IdPerfil.toUpperCase() : "",
      Activo: Activo,
      IdUsuarioModify: usuario.username,
    };
    await serviceUsuarioPerfil.actualizar(params)
      .then(() => {
        handleSuccessMessages(
          intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" })
        );
        listar_UsuarioPerfil();
      })
      .catch((err) => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
  }

  async function eliminarRegistroUsuarioPerfil(dataRow, confirm) {
    setSelectedDelete(dataRow);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdPerfil, IdUsuario, IdCliente } = dataRow;
      await serviceUsuarioPerfil.eliminar({
        IdCliente: IdCliente,
        IdUsuario: IdUsuario,
        IdPerfil: IdPerfil,
      })
        .then((response) => {
          handleSuccessMessages(
            intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" })
          );
        })
        .catch((err) => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
      listar_UsuarioPerfil();
    }
  }

  async function listar_UsuarioPerfil() {
    setLoading(true);
    setModoEdicion(false);
    await serviceUsuarioPerfil.listar({
      IdCliente: perfil.IdCliente,
      IdPerfil: "%",
      IdUsuario: varIdUsuario,
      NumPagina: 0,
      TamPagina: 0,
    }).then(usuarioPerfil => {
      setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
      setListarTabs(usuarioPerfil);
    }).catch((err) => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });

  }

  async function obtener_UsuarioPerfil(dataRow) {
    setLoading(true);
    const { IdPerfil, IdUsuario, IdCliente } = dataRow;
    await serviceUsuarioPerfil.obtener({
      IdCliente: IdCliente,
      IdUsuario: IdUsuario,
      IdPerfil: IdPerfil
    }).then(perfilRequisito => {
      setDataRowEditNew({ ...perfilRequisito, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }


  const nuevoRegistroTabs = () => {
    let nuevo = { Activo: "S" };
    setDataRowEditNew({ ...nuevo, esNuevoRegistro: true });
    setTituloTabs(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
    listar_Perfiles();
  };

  const editarRegistroUsuarioPerfil = (dataRow) => {
    const { RowIndex, IdUsuario, UsuarioNombre, IdPerfil } = dataRow;
    setModoEdicion(true);
    setTituloTabs(intl.formatMessage({ id: "ACTION.EDIT" }));
    obtener_UsuarioPerfil(dataRow);
    setFocusedRowKey(RowIndex);
    setGridBoxValue([IdPerfil]);
  };

  const seleccionarUsuarioPerfil = (dataRow) => {
    const { RowIndex } = dataRow;
    setFocusedRowKey(RowIndex);
  };

  async function listar_Perfiles() {
    let data = await servicePerfil.listarPendientes({
      IdCliente: perfil.IdCliente,
      IdUsuario: varIdUsuario,
      NumPagina: 0,
      TamPagina: 0,
    }).catch((err) => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    });
    setPerfilesData(data);
  }


  /*USUARIO COMPAÑÍA*********************************************************/

  const listar_UsuarioCompania = async () => {
    setLoading(true);
    setModoEdicion(false);
    await listarUCompania({
      IdCliente: perfil.IdCliente,
      IdCompania: "%",
      IdUsuario: varIdUsuario,
      NumPagina: 0,
      TamPagina: 0,
    }).then(usuarioCompania => {
      setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
      setListarTabs(usuarioCompania);
    }).catch((err) => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });

  }


  async function agregarUsuarioCompania(datarow) {
    setLoading(true);
    const { IdCompania, IdSecuencial, FechaInicio, FechaFin } = datarow;
    let data = {
      IdCliente: perfil.IdCliente
      , IdUsuario: varIdUsuario
      , IdCompania: isNotEmpty(IdCompania) ? IdCompania.toUpperCase() : ""
      , IdSecuencial: 0
      , FechaInicio: dateFormat(FechaInicio, 'yyyyMMdd') //(new Date(FechaInicio)).toLocaleString()
      , FechaFin: dateFormat(FechaFin, 'yyyyMMdd')//(new Date(FechaFin)).toLocaleString()
    };
    await crearUCompania(data).then(response => {
      if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      listar_UsuarioCompania();
      setModoEdicion(false);

    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function actualizarUsuarioCompania(datarow) {
    setLoading(true);
    const { IdCompania, IdSecuencial, FechaInicio, FechaFin } = datarow;
    let data = {
      IdCliente: perfil.IdCliente
      , IdUsuario: varIdUsuario
      , IdCompania: isNotEmpty(IdCompania) ? IdCompania.toUpperCase() : ""
      , IdSecuencial: IdSecuencial
      , FechaInicio: dateFormat(FechaInicio, 'yyyyMMdd')//(new Date(FechaInicio)).toLocaleString()
      , FechaFin: dateFormat(FechaFin, 'yyyyMMdd')//(new Date(FechaFin)).toLocaleString()
    };
    await actualizarUCompania(data).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      setModoEdicion(false);
      listar_UsuarioCompania();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function eliminarUsuarioCompania(usuarioCompaniaObj, confirm) {
    setSelectedDelete(usuarioCompaniaObj);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdCliente, IdCompania, IdUsuario, IdSecuencial } = usuarioCompaniaObj;
      await eliminarUCompania({ IdCliente: IdCliente, IdCompania: IdCompania, IdUsuario: IdUsuario, IdSecuencial: IdSecuencial }).then(response => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
      listar_UsuarioCompania();
    }
  }

  async function obtenerUsuarioCompania(dataRow) {
    setLoading(true);
    const { IdCliente, IdCompania, IdUsuario, IdSecuencial } = dataRow;
    await obtenerUCompania({ IdCliente, IdCompania, IdUsuario, IdSecuencial }).then(data => {
      setDataRowEditNew({ ...data, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  const seleccionarUsuarioCompania = (dataRow) => {
    const { RowIndex } = dataRow;
    setFocusedRowKeyUsuarioCompania(RowIndex);
  };

  const nuevoUsuarioCompania = () => {
    let data = {};
    setDataRowEditNew({ ...data, esNuevoRegistro: true });
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
  };

  const editarUsuarioCompania = async (dataRow) => {
    setModoEdicion(true);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    obtenerUsuarioCompania(dataRow);
  };


  //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  const cancelarEdicionTabs = () => {
    setModoEdicion(false);
    setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };

  //Datos Principales
  const changeTabIndex = (index) => {
    handleChange(null, index);
  };

  const getInfo = () => {
    const { IdUsuario, Nombre, Apellido } = selected;
    return [
      { text: [intl.formatMessage({ id: "SECURITY.USER.IDENTIFIER" })], value: IdUsuario, colSpan: 2 },
      { text: [intl.formatMessage({ id: "SECURITY.USER.USER" })], value: Nombre + " " + Apellido, colSpan: 4 }
    ];

  };

  //::::: - FOTO - ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  async function validateConfigurationImageLength(IdCliente) {
    await obtenerSistemaConfiguracionMedidas({ IdCliente: IdCliente, IdImageSize: "MAXIMAGESIZECLIENTE", idImageRatio: "CLIENTIMAGERATIO" })
      .then(result => {
        if (result === "") {
          setAlturaSugerido(0)
          setAnchoSugerido(0)
          setAlturaSugeridoRadio(0)
          setAnchoSugeridoRadio(0)

        } else {
          setAlturaSugerido(result.AltoMedida)
          setAnchoSugerido(result.AnchoMedida)
          setAlturaSugeridoRadio(result.AltoMedidaRadio)
          setAnchoSugeridoRadio(result.AnchoMedidaRadio)
        }
      }).finally();
  }

  async function obtenerUsuarioFoto() {
    //debugger;
    if (isNotEmpty(varIdUsuario)) {
      setLoading(true);

      await validateConfigurationImageLength(perfil.IdCliente);
      await obtenerFoto({
        IdUsuario: varIdUsuario,
        IdCliente: perfil.IdCliente,
      }).then(usuarioFoto => {
        if (isNotEmpty(usuarioFoto)) {
          // console.log("**obtenerUsuarioFoto...usuarioFoto**:> ", { ...usuarioFoto, esNuevoRegistro: false });
          setDataRowEditNew({ ...usuarioFoto, esNuevoRegistro: false });
        } else {
          // console.log("**obtenerUsuarioFoto...selected**:> ", { ...selected, esNuevoRegistro: true });
          setDataRowEditNew({ ...selected, esNuevoRegistro: true });
        }
      }).catch((err) => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });

    }
  }

  async function actualizarUsuarioFoto(usuarioFoto) {
    setLoading(true);
    const { IdUsuario, IdCliente, Foto } = usuarioFoto;
    let params = {
      IdUsuarioFoto: IdUsuario,
      IdCliente,
      Foto: isNotEmpty(Foto) ? Foto : "",
      FechaRegistro: new Date(),
      IdUsuario: usuario.username,
    };

    await actualizarFoto(params)
      .then(() => {
        handleSuccessMessages(
          intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" })
        );
        obtenerUsuarioFoto();
      })
      .catch((err) => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
  }

  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  async function eliminarListRowTab(rowData, confirm) {
    let currentTab = tabIndex;
    switch (currentTab) {
      case 0:
        eliminarUsuario(rowData, confirm);
        break;
      case 3:
        eliminarRegistroUsuarioPerfil(rowData, confirm);
        break;
      case 4:
        eliminarUsuarioCompania(rowData, confirm);
        break;
    }
  }

  //:::::::::::::::::::::::::::::::::::::::::::::-Configuración de tabs-:::::::::::::::::::::::::::::::::
  const titleHeaderToolbar = () => {
    let tabsTitles = [
      "",
      "",
      "SECURITY.USER.PHOTO",
      "SECURITY.USER.PROFILES",
      "SECURITY.USER.COMPANY"
    ];

    let sufix = tabsTitles[tabIndex] !== "" ? (" - " + `${intl.formatMessage({ id: tabsTitles[tabIndex] })}`) : "";

    return `${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} ` + "  " + sufix;
  }
  const tabsDisabled = () => {
    return isNotEmpty(varIdUsuario) ? false : true;
    //return true;
  }
  const tabContent_UsuarioListPage = () => {
    return <UsuarioListPage
      editarRegistro={editarRegistro}
      eliminarRegistro={eliminarUsuario}
      nuevoRegistro={nuevoRegistro}
      seleccionarRegistro={seleccionarRegistro}
      verRegistroDblClick={verRegistroDblClick}
      focusedRowKey={focusedRowKey}
      setFocusedRowKey={setFocusedRowKey}
      showHeaderInformation={false}
      selected={{ IdPerfil: "" }}

      //Propiedades del customerDataGrid 
      uniqueId={"UsuariosListado"}
      isFirstDataLoad={isFirstDataLoad}
      setIsFirstDataLoad={setIsFirstDataLoad}
      dataSource={dataSource}
      refresh={refresh}
      resetLoadOptions={resetLoadOptions}
      refreshData={refreshData}
      setRefreshData={setRefreshData}
      accessButton={accessButton}
      getInfo={getInfo}
      setVarIdUsuario={setVarIdUsuario}
      totalRowIndex={totalRowIndex}
      setTotalRowIndex={setTotalRowIndex}
    />
  }
  const tabContent_UsuarioEditPage = () => {
    return <>
      <UsuarioEditPage
        titulo={titulo}
        dataRowEditNew={dataRowEditNew}
        setDataRowEditNew={setDataRowEditNew}
        modoEdicion={modoEdicion}
        actualizarUsuario={actualizarUsuario}
        agregarUsuario={agregarUsuario}
        restablecerPassword={restablecerPassword}
        cancelarEdicion={cancelarEdicion}
        agregarUsuarioFoto={agregarUsuarioFoto}
        accessButton={accessButton}
        settingDataField={dataMenu.datos}
        blockAndUnlockUserAccount={blockAndUnlockUserAccount}
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
        <AuditoriaPage dataRowEditNew={dataRowEditNew} />
      )}
    </>
  }
  const tabContent_UsuarioFotoPage = () => {
    return <>
      <UsuarioFotoPage
        modoEdicion={modoEdicion}
        setDataRowEditNew={setDataRowEditNew}
        dataRowEditNew={dataRowEditNew}
        actualizarFoto={actualizarUsuarioFoto}
        agregarFoto={agregarUsuarioFoto}
        cancelarEdicion={cancelarEdicion}
        titulo={tituloTabs}
        size={classes.avatarLarge}
        uploadImagen={true}
        getInfo={getInfo}
        imagenConfiguracion={imagenConfiguracion}

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
        <AuditoriaPage dataRowEditNew={dataRowEditNew} />
      )}
    </>
  }
  const tabContent_UsuarioPerfil = () => {
    return <>
      {modoEdicion && (
        <>
          <UsuarioPerfilEditPage
            dataRowEditNew={dataRowEditNew}
            actualizarUsuarioPerfil={actualizarUsuarioPerfil}
            agregarUsuarioPerfil={agregarUsuarioPerfil}
            cancelarEdicion={cancelarEdicionTabs}
            perfilesData={perfilesData}
            gridBoxValue={gridBoxValue}
            setGridBoxValue={setGridBoxValue}
            titulo={tituloTabs}

            modoEdicion={modoEdicion}
            accessButton={accessButton}
            settingDataField={dataMenu.datos}
            setModoEdicion={setModoEdicion}

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
            <AuditoriaPage dataRowEditNew={dataRowEditNew} />
          )}
        </>
      )}
      {!modoEdicion && (
        <>
          <UsuarioPerfilListPage
            usuarioPerfilData={listarTabs}
            editarRegistro={editarRegistroUsuarioPerfil}
            eliminarRegistro={eliminarRegistroUsuarioPerfil}
            nuevoRegistro={nuevoRegistroTabs}
            cancelarEdicion={cancelarEdicion}
            seleccionarRegistro={seleccionarUsuarioPerfil}
            focusedRowKey={focusedRowKey}
            getInfo={getInfo}

            accessButton={accessButton}
          />
        </>
      )}
    </>
  }

  const tabContent_UsuarioCompania = () => {
    return <>
      {isVisibleAlert && (
        <Alerts
          severity={"warning"}
          msg1={intl.formatMessage({ id: "SECURITY.USER.PERSON.MESSAGE" })}
        />
      )}

      {modoEdicion && (
        <>
          <UsuarioCompaniaEditPage
            dataRowEditNew={dataRowEditNew}
            actualizarUsuarioCompania={actualizarUsuarioCompania}
            agregarUsuarioCompania={agregarUsuarioCompania}
            cancelarEdicion={cancelarEdicionTabs}
            titulo={tituloTabs}

            modoEdicion={modoEdicion}
            accessButton={accessButton}
            settingDataField={dataMenu.datos}
            getInfo={getInfo}
            varIdUsuario={varIdUsuario}
            selectedIndex={selected}

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
            <AuditoriaPage dataRowEditNew={dataRowEditNew} />
          )}
        </>
      )}
      {!modoEdicion && (
        <>
          <UsuarioCompaniaListPage
            usuarioCompaniaData={listarTabs}
            cancelarEdicion={cancelarEdicion}
            getInfo={getInfo}
            accessButton={accessButton}

            editarRegistro={editarUsuarioCompania}
            eliminarRegistro={eliminarUsuarioCompania}
            nuevoRegistro={nuevoUsuarioCompania}
            seleccionarRegistro={seleccionarUsuarioCompania}
            focusedRowKey={focusedRowKeyUsuarioCompania}
          />
        </>
      )}
    </>
  }


  //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  return (
    <>

      <TabNavContainer
        title={intl.formatMessage({ id: "SECURITY.USER.MENU" })}
        subtitle={intl.formatMessage({ id: "SECURITY.USER.USERS" })}
        nombrebarra={titleHeaderToolbar()}
        tabIndex={tabIndex}
        handleChange={handleChange}
        componentTabsHeaders={[
          {
            label: intl.formatMessage({ id: "ACTION.LIST" }),
            icon: <FormatListNumberedIcon fontSize="large" />,
            // onClick: () => { listarUsuarios() },
          },
          {
            label: intl.formatMessage({ id: "SECURITY.USER.USERS" }),
            icon: <PersonIcon fontSize="large" />,
            onClick: (e) => { obtenerUsuario(selected) },
            disabled: tabsDisabled()
          },
          {
            label: intl.formatMessage({ id: "SECURITY.USER.PHOTO" }),
            icon: <AccountCircleOutlinedIcon fontSize="large" />,
            onClick: (e) => {
              obtenerUsuarioFoto() //--> LSF 12062023
            },//varIdUsuario, false
            disabled: !tabsDisabled() && accessButton.Tabs[2] ? false : true
          },
          {
            label: intl.formatMessage({ id: "SECURITY.USER.PROFILES" }),
            icon: <AssignmentIndIcon fontSize="large" />,
            onClick: () => {
              listar_UsuarioPerfil() //--> LSF 12062023
            },
            disabled: !tabsDisabled() && accessButton.Tabs[3] ? false : true
          },
          {
            label: intl.formatMessage({ id: "SECURITY.USER.COMPANY" }),
            icon: <BusinessIcon fontSize="large" />,
            onClick: () => { obtenerUsuarioPersona(selected); listar_UsuarioCompania() },
            disabled: !tabsDisabled() && accessButton.Tabs[4] ? false : true
            //disabled: !tabsDisabled() ? false : true
          }
        ]}
        className={classes.tabContent}
        componentTabsBody={
          [
            tabContent_UsuarioListPage(),
            tabContent_UsuarioEditPage(),
            tabContent_UsuarioFotoPage(),
            tabContent_UsuarioPerfil(),
            tabContent_UsuarioCompania()
          ]
        }
      />

      <Confirm
        message={intl.formatMessage({ id: "ALERT.REMOVE" })}
        isVisible={isVisible}
        setIsVisible={setIsVisible}
        setInstance={setInstance}
        onConfirm={() => eliminarListRowTab(selectedDelete, true)}
        title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
        confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
        cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
      />
    </>
  );
};

//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::


export default injectIntl(WithLoandingPanel(UsuarioIndex));
