import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";
import BusinessIcon from '@material-ui/icons/Business';
import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import PlaylistAddCheckOutlinedIcon from '@material-ui/icons/PlaylistAddCheckOutlined';
import SupervisedUserCircleIcon from "@material-ui/icons/SupervisedUserCircle";
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';

import { handleErrorMessages, handleSuccessMessages, handleInfoMessages } from "../../../../store/ducks/notify-messages";
import { useStylesEncabezado, useStylesTab } from "../../../../store/config/Styles";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import Confirm from "../../../../partials/components/Confirm";
import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";
import CompaniaListPage from "./CompaniaListPage";
import CompaniaEditPage from "./CompaniaEditPage";
import CompanyCharacteristicIndexPage from "./caracteristica/CompanyCharacteristicIndexPage";
import CompaniaUsuarioIndexPage from "./usuarios/CompaniaUsuarioIndexPage";
import TabNavContainer from "../../../../partials/components/Tabs/TabNavContainer";
import { getButtonPermissions, defaultPermissions, setDisabledTabs } from '../../../../../_metronic/utils/securityUtils'
import CompaniaUsuarioAddListPage from "./usuarios/CompaniaUsuarioAddListPage";
import SeguridadPerfilBuscar from "../../../../partials/components/SeguridadPerfilBuscar";
import UsuarioCompaniaEditPage from "./usuarios/UsuarioCompaniaEditPage";
import { dateFormat, isNotEmpty, listarEstadoSimple, PatterRuler } from "../../../../../_metronic";

import { obtener_medidas as obtenerSistemaConfiguracionMedidas } from "../../../../api/sistema/configuracion.api";
import { eliminar, obtener, listar, crear, actualizar } from "../../../../api/administracion/compania.api";
import { serviceUser } from '../../../../api/seguridad/usuario.api';
import { serviceUsuarioPerfil } from "../../../../api/seguridad/usuarioPerfil.api";
import { servicePerfil } from "../../../../api/seguridad/perfil.api";
import { crear as crearUCompania, eliminar as eliminarUCompania } from "../../../../api/seguridad/usuarioCompania.api";
import { obtener as obtenerLicencia } from "../../../../api/sistema/licencia.api";

export const initialFilter = {
  Activo: 'S',
  IdCliente: "1",
  IdCompania: ""
};

const CompaniaIndexPage = (props) => {

  const { intl, setLoading, dataMenu } = props;
  const usuario = useSelector(state => state.auth.user);
  const perfil = useSelector(state => state.perfil.perfilActual);
  const classes = useStylesTab();

  const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);//COMPANIA
  const [modoEdicionUser, setModoEdicionUser] = useState(false);//USER

  //getInfo
  const [selectedCompania, setSelectedCompania] = useState({ IdCliente: perfil.IdCliente });
  const [selectedUsuario, setSelectedUsuario] = useState({ IdUsuario: "", NombreCompleto: "" });

  const [IdCompaniaX, setIdCompaniaX] = useState("");
  const [CompaniaX, setCompaniaX] = useState("");

  //selectFocus
  const [focusedRowKey, setFocusedRowKey] = useState();//USUARIOS
  const [focusedPerfilRowKey, setFocusedPerfilesRowKey] = useState();//PERFILES

  const [tabIndex, setTabIndex] = useState(0);
  const handleChange = (event, newValue) => { setTabIndex(newValue); };
  const [isVisible, setIsVisible] = useState(false);
  const [indicadorDelete, setIndicadorDelete] = useState(0);

  // const [instance, setInstance] = useState({});
  const [alturaSugerido, setAlturaSugerido] = useState();
  const [anchoSugerido, setAnchoSugerido] = useState();
  const [alturaSugeridoRadio, setAlturaSugeridoRadio] = useState();
  const [anchoSugeridoRadio, setAnchoSugeridoRadio] = useState();
  const [totalRowIndex, setTotalRowIndex] = useState(0);

  //FILTRO
  const [isFirstDataLoad, setIsFirstDataLoad] = useState(true);
  const [refreshData, setRefreshData] = useState(false);
  const ds = new DataSource({ store: new ArrayStore({ data: [], key: 'RowIndex' }), reshapeOnPush: false });
  const [dataSource] = useState(ds);
  const refresh = () => dataSource.refresh();
  const resetLoadOptions = () => dataSource.resetLoadOptions();

  //POPUP PERSONAS MODAL
  const [popupVisiblePerfil, setPopupVisiblePerfil] = useState(false);
  //POPUP OBJETOS
  const [popupVisiblePerfilObjeto, setPopupVisiblePerfilObjeto] = useState(false);

  //PERFILES
  const [listarTabs, setListarTabs] = useState([]);
  const [varIdUsuario, setVarIdUsuario] = useState("");
  const [tituloTabs, setTituloTabs] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  const [selectedDelete, setSelectedDelete] = useState({});

  //OBJETOS
  const [perfilesData, setPerfilesData] = useState([]);

  //CONFIGURACION TABS
  const [accessButton, setAccessButton] = useState(defaultPermissions);
  //USER: AGREGAR DATOS A LA GRILLA
  const [grillaAutorizadorUsuario, setGrillaAutorizadorUsuario] = useState([]);



  //TABS INICIALES
  // const [componentTabsHeaders,setComponentTabsHeaders]=useState([
  //         {
  //           label: intl.formatMessage({ id: "ACTION.LIST" }),
  //           icon: <FormatListNumberedIcon fontSize="large" />,
  //         },
  //         {
  //           label: intl.formatMessage({ id: "ADMINISTRATION.COMPANY.COMPANY" }),
  //           icon: <BusinessIcon fontSize="large" />,
  //           onClick: (e) => { obtenerCompania() },
  //           disabled: tabsDisabled()
  //         },
  //         {
  //           label: intl.formatMessage({ id: "ADMINISTRATION.CHARACTERISTIC" }),
  //           icon: <PlaylistAddCheckOutlinedIcon fontSize="large" />,
  //           disabled: tabsDisabled()
  //         },
  //         {
  //           label: intl.formatMessage({ id: "SECURITY.USER.USERS" }),
  //           icon: <SupervisedUserCircleIcon fontSize="large" />,
  //           onClick: (e) => { listarUsuariosAsignarCompania() },
  //           disabled: tabsDisabled()
  //         }
  //       ])

  const [licenciaAcreditacion, setLicenciaAcreditacion] = useState(false);

  //:::::::::::::::::::::::::::::::: GENERAL :::::::::::::::::::::::::::::::::::::::::::::
  const getInfo = () => {
    return [
      { text: [intl.formatMessage({ id: "COMMON.CODE" })], value: IdCompaniaX, colSpan: 2 },
      { text: [intl.formatMessage({ id: "ADMINISTRATION.PERSON.NAME" })], value: CompaniaX, colSpan: 4 },
    ];
  }

  const getInfoUsuarioAsignado = () => {
    const { IdUsuario, NombreCompleto } = selectedUsuario;
    return [
      { text: [intl.formatMessage({ id: "COMMON.CODE" })], value: IdUsuario, colSpan: 2 },
      { text: [intl.formatMessage({ id: "ADMINISTRATION.PERSON.NAME" })], value: NombreCompleto, colSpan: 4 },
    ];
  }

  const changeTabIndex = (index) => {
    handleChange(null, index);
  }

  const titleHeaderToolbar = () => {
    return `${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} `;
  }
  const tabsDisabled = () => {
    return isNotEmpty(IdCompaniaX) ? false : true;
  }

  //CONFIGURACION TABS
  const loadControlsPermission = () => {
    const numeroTabs = 3; //Nùmero de tab del formulario.
    let buttonsPermissions = getButtonPermissions(dataMenu.objetos);
    let newTabs = setDisabledTabs(dataMenu.objetos, numeroTabs);
    setAccessButton({ ...accessButton, ...buttonsPermissions });
  }

  async function obtenerLicenciaAcreditacion() {
    setLoading(true);
    await obtenerLicencia({
      IdModulo: "06",//---> MOdulo de Acreditacion
      IdCliente: perfil.IdCliente
    }).then(licencia => {
      console.log("obtenerLicenciaAcreditacion() - licencia :>", licencia);
      if (isNotEmpty(licencia))
        setLicenciaAcreditacion(true);
      else
        setLicenciaAcreditacion(false); 
    }).catch(err => { 
      setLicenciaAcreditacion(false); 
    }).finally(() => { setLoading(false); });
  }
 
  //:::::::::::::::::::::::::::::::: HELPERS :::::::::::::::::::::::::::::::::::::::::::::
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
  async function obtenerCompania() {
    const { IdCliente, IdCompania } = selectedCompania;
    validateConfigurationImageLength(IdCliente)
    await obtener({
      IdCompania, IdCliente
    }).then(async compania => {
      const usuario = await serviceUser.obtener({ idCliente: IdCliente, idUsuario: IdCompania });
      setDataRowEditNew({ ...compania, esNuevoRegistro: false, IdUsuario: usuario?.IdUsuario });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    });
  }

  // ELIMINAR POR INDICE
  async function eliminarListRowTab(rowData, confirm) {
    let currentTab = indicadorDelete;
    switch (currentTab) {
      case 1:
        eliminarRegistroUsuarioPerfil(rowData, confirm);
        break;
      case 2:
        eliminarUsuarioCompania(rowData, confirm);
        break;
    }
  }
  //::::::::::::::::::::::::::::::::MODULO: COMPAÑIA :::::::::::::::::::::::::::::::::::::::::::::
  const nuevoRegistro = () => {
    changeTabIndex(1);
    setSelectedCompania({});
    setDataRowEditNew({});
    let compania = { Activo: "S", IdCliente: perfil.IdCliente, ControlarAsistencia: "N", Contratista: 'S', CrearUsuario: false };

    validateConfigurationImageLength(perfil.IdCliente)
    setDataRowEditNew({ ...compania, esNuevoRegistro: true });
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
  };

  const editarRegistro = async (dataRow) => {
    changeTabIndex(1);
    setSelectedCompania(dataRow);
    const { RowIndex } = dataRow;
    setFocusedRowKey(RowIndex);
    obtenerCompania();
    setModoEdicion(true);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
  };

  const cancelarEdicion = () => {
    changeTabIndex(0);
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };

  const seleccionarRegistro = dataRow => {
    const { IdCompania, RowIndex, Compania } = dataRow;
    setIdCompaniaX(IdCompania)
    setCompaniaX(Compania)

    setModoEdicion(false);
    setSelectedCompania(dataRow);
    setFocusedRowKey(RowIndex);
  }

  const verRegistroDblClick = async () => {
    changeTabIndex(1);
    setModoEdicion(false);
    await obtenerCompania();
  }

  async function finalizarEdicion() {
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    cancelarEdicion();
    setModoEdicion(false);
  }

  async function actualizarCompania(compania) {
    setLoading(true);
    const { IdCliente, IdCompania, Compania, Alias, Direccion, Contratista,
      IdPais, Documento, IdTipoDocumento, IdCategoria, Logo, LogoAltura, LogoAncho,
      ControlarAsistencia, Activo, NombreContacto, Email, Telefono, FileBase64, CrearUsuario, UsuarioCreado } = compania;

    let params = {
      IdCliente
      , IdDivision: perfil.IdDivision
      , IdCompania: IdCompania.toUpperCase()
      , Compania: isNotEmpty(Compania) ? Compania.toUpperCase() : ""
      , Alias: isNotEmpty(Alias) ? Alias.toUpperCase() : ""
      , Direccion: isNotEmpty(Direccion) ? Direccion.toUpperCase() : ""
      , Contratista: isNotEmpty(Contratista) ? Contratista : ""
      , IdPais: isNotEmpty(IdPais) ? IdPais : ""
      , IdTipoDocumento: isNotEmpty(IdTipoDocumento) ? IdTipoDocumento : ""
      , Documento: isNotEmpty(Documento) ? Documento : ""
      , IdCategoria: isNotEmpty(IdCategoria) ? IdCategoria : ""
      , Logo: isNotEmpty(FileBase64) ? FileBase64 : ""
      , LogoAltura: isNotEmpty(LogoAltura) ? LogoAltura : 0
      , LogoAncho: isNotEmpty(LogoAncho) ? LogoAncho : 0
      , ControlarAsistencia
      , Activo
      , NombreContacto: isNotEmpty(NombreContacto) ? NombreContacto.toUpperCase() : ""
      , Email: isNotEmpty(Email) ? Email.toUpperCase() : ""
      , Telefono: isNotEmpty(Telefono) ? Telefono.toUpperCase() : ""
      , PathFile: ""
      , IdUsuario: usuario.username
      , CrearUsuario
      , UsuarioCreado
    };

    await actualizar(params).then(response => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      setModoEdicion(false);
      finalizarEdicion();
      setRefreshData(true);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });
  }

  async function eliminarRegistro(compania, confirm) {
    setSelectedCompania(compania);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdCliente, IdCompania } = compania;
      await eliminar({ IdCliente, IdCompania, IdUsuario: usuario.username, IdDivision: perfil.IdDivision }).then(response => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
        finalizarEdicion();
        setRefreshData(true);
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
      }).finally(() => { setLoading(false); });
    }
  }

  async function agregarCompania(compania) {
    setLoading(true);
    const { IdCliente, IdCompania, Compania, Alias, Direccion, Contratista,
      IdPais, Documento, IdTipoDocumento, IdCategoria, Logo, LogoAltura, LogoAncho,
      ControlarAsistencia, Activo, NombreContacto, Email, Telefono, FileBase64, CrearUsuario, UsuarioCreado } = compania;
    let params = {
      IdCliente
      , IdDivision: perfil.IdDivision
      , IdCompania: IdCompania.toUpperCase()
      , Compania: isNotEmpty(Compania) ? Compania.toUpperCase() : ""
      , Alias: isNotEmpty(Alias) ? Alias.toUpperCase() : ""
      , Direccion: isNotEmpty(Direccion) ? Direccion.toUpperCase() : ""
      , Contratista: isNotEmpty(Contratista) ? Contratista : ""
      , IdPais: isNotEmpty(IdPais) ? IdPais : ""
      , IdTipoDocumento: isNotEmpty(IdTipoDocumento) ? IdTipoDocumento : ""
      , Documento: isNotEmpty(Documento) ? Documento : ""
      , IdCategoria: isNotEmpty(IdCategoria) ? IdCategoria : ""
      , Logo: isNotEmpty(FileBase64) ? FileBase64 : ""
      , LogoAltura: isNotEmpty(LogoAltura) ? LogoAltura : 0
      , LogoAncho: isNotEmpty(LogoAncho) ? LogoAncho : 0
      , ControlarAsistencia
      , Activo
      , NombreContacto: isNotEmpty(NombreContacto) ? NombreContacto.toUpperCase() : ""
      , Email: isNotEmpty(Email) ? Email.toUpperCase() : ""
      , Telefono: isNotEmpty(Telefono) ? Telefono.toUpperCase() : ""
      , PathFile: ""
      , IdUsuario: usuario.username
      , CrearUsuario
      , UsuarioCreado
    };
    crear(params)
      .then((response) => {
        if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
        finalizarEdicion();
        setRefreshData(true);

      })
      .catch((err) => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
      }).finally(() => { setLoading(false); });
  }

  //::::::::::::::::::::::::::::::::MODULO: ASIGNACION USUARIOS:::::::::::::::::::::::::::::::::::::::::::::
  //LISTA PERFILES 
  async function listar_UsuarioPerfil(IdUsuario_) {
    setLoading(true);
    setModoEdicion(false);
    await serviceUsuarioPerfil.listar({
      IdCliente: perfil.IdCliente,
      IdPerfil: "%",
      IdUsuario: IdUsuario_,
      NumPagina: 0,
      TamPagina: 0,
    }).then(usuarioPerfil => {
      setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
      setListarTabs(usuarioPerfil);
    }).catch((err) => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  //SELECT USUARIOS
  const seleccionarUsuario = (dataRow) => {
    setSelectedUsuario(dataRow)//SELECCIONAMOS EL REGISTRO, CABECERA USUARIO
    const { RowIndex } = dataRow;
    setFocusedRowKey(RowIndex);
  }

  //SELECT PERFILES
  const seleccionarUsuarioPerfil = (dataRow) => {
    const { RowIndex } = dataRow;
    setFocusedPerfilesRowKey(RowIndex);
  }

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

  //ABRE EL MODAL
  const nuevoRegistroTabs = () => {
    let nuevo = { Activo: "S" };
    setDataRowEditNew({ ...nuevo, esNuevoRegistro: true });
    setTituloTabs(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
  }

  function agregarPerfiles(perfiles) {
    if (perfiles.length > 0) {
      agregarUsuarioPerfil(perfiles);
    }
  }

  //POPUP: LISTA TODOS LOS OBJETOS
  const mostrarPopUpObjetos = () => {
    listar_Perfiles();
    setPopupVisiblePerfilObjeto(true);
  }

  //POPUP: LISTA PERFILES
  const mostrarPopUpPerfiles = dataRow => {
    const { IdUsuario } = dataRow
    setVarIdUsuario(IdUsuario)
    listar_UsuarioPerfil(IdUsuario)
    setPopupVisiblePerfil(true);
  }

  //ELIMINAR PERFIL DE USUARIO
  async function eliminarRegistroUsuarioPerfil(dataRow, confirm) {
    setSelectedDelete(dataRow);//ENTREGO EL REGISTRO AL CONFIRM
    setIsVisible(true);// MUESTRO L MODAL
    setIndicadorDelete(1)
    // AQUI NO INGRESO A LA PRIMERA, PERO SI A LA SEGUNDA CON EL CONFIRM
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
      listar_UsuarioPerfil(varIdUsuario);
    }
  }

  //AGREGAR NUEVOS PERFILES
  async function agregarUsuarioPerfil(perfiles) {
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
        listar_UsuarioPerfil(varIdUsuario);
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

  const nuevoRegistroUsuario = () => {
    setModoEdicionUser(true);
    setDataRowEditNew({});
  };

  const cancelarRegistroUsuario = (evtx) => {
    // setSelectedCompaniaCancelar(evtx)
    setModoEdicionUser(false);//CREAR ASIGNAR USUARIO
  };

  //REGISTRAR USUARIO A COMPAÑIA
  async function agregarUsuarioCompania(datarow) {
    setLoading(true);
    const { IdCompania, IdUsuario, FechaInicio, FechaFin } = datarow;
    let data = {
      IdCliente: perfil.IdCliente
      , IdUsuario: IdUsuario
      , IdCompania: isNotEmpty(IdCompania) ? IdCompania.toUpperCase() : ""
      , IdSecuencial: 0
      , FechaInicio: dateFormat(FechaInicio, 'yyyyMMdd') //(new Date(FechaInicio)).toLocaleString()
      , FechaFin: dateFormat(FechaFin, 'yyyyMMdd')//(new Date(FechaFin)).toLocaleString()
    };
    await crearUCompania(data).then(response => {
      if (response) {
        handleSuccessMessages(intl.formatMessage({ id: "CASINO.MASIVO.MESSAGES.SUCCESS" }));
        setRefreshData(true);
        setModoEdicionUser(false);
      }
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });

  }

  //ELIMINAR USUARIO
  async function eliminarUsuarioCompania(usuarioCompaniaObj, confirm) {
    setSelectedDelete(usuarioCompaniaObj);
    setIsVisible(true);
    setIndicadorDelete(2)
    if (confirm) {
      setLoading(true);
      const { IdCliente, IdCompania, IdUsuario, IdSecuencial } = usuarioCompaniaObj;
      await eliminarUCompania({ IdCliente: IdCliente, IdCompania: IdCompania, IdUsuario: IdUsuario, IdSecuencial: IdSecuencial }).then(response => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
      setRefreshData(true);
    }
  }

  async function listarUsuariosAsignarCompania() {
    setRefreshData(true);
    setModoEdicionUser(false);
  }

  //:::::::::::::::::::::::::::::::: USEEFFETS :::::::::::::::::::::::::::::::::::::::::::::
  useEffect(() => {
    loadControlsPermission();
    obtenerLicenciaAcreditacion();
  }, []);

  const tabContent_CompaniaListPage = () => {
    return <CompaniaListPage
      titulo={titulo}
      editarRegistro={editarRegistro}
      eliminarRegistro={eliminarRegistro}
      nuevoRegistro={nuevoRegistro}
      seleccionarRegistro={seleccionarRegistro}
      verRegistroDblClick={verRegistroDblClick}
      focusedRowKey={focusedRowKey}
      setFocusedRowKey={setFocusedRowKey}
      dataSource={dataSource}
      refresh={refresh}
      resetLoadOptions={resetLoadOptions}
      refreshData={refreshData}
      setRefreshData={setRefreshData}
      showButtons={true}
      pathFile={""}
      totalRowIndex={totalRowIndex}
      setTotalRowIndex={setTotalRowIndex}
      licenciaAcreditacion={licenciaAcreditacion}
    />
  }


  const tabContent_CompaniaEditPage = () => {
    return <>
      <CompaniaEditPage
        modoEdicion={modoEdicion}
        titulo={titulo}
        selectedIndex={selectedCompania}
        dataRowEditNew={dataRowEditNew}
        pathFile={""}
        actualizarCompania={actualizarCompania}
        agregarCompania={agregarCompania}
        cancelarEdicion={cancelarEdicion}
        accessButton={accessButton}
        settingDataField={dataMenu.datos}
        medidaSugeridas={{
          width: anchoSugerido, height: alturaSugerido,
          width_radio: anchoSugeridoRadio, height_radio: alturaSugeridoRadio
        }}
        licenciaAcreditacion={licenciaAcreditacion}
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

  const tabContent_CompanyCharacteristic = () => {
    return <>
      <CompanyCharacteristicIndexPage
        varIdCompania={IdCompaniaX}
        cancelarEdicion={cancelarEdicion}
        getInfo={getInfo}
        accessButton={accessButton}
        settingDataField={dataMenu.datos}
        pathFile={""}
      />
    </>
  }

  const tabContent_CompaniaListUserAssingPage = () => {
    return <>
      {modoEdicionUser && (
        <>
          <UsuarioCompaniaEditPage
            dataRowEditNew={dataRowEditNew}
            cancelarRegistroUsuario={(evtx) => { cancelarRegistroUsuario(evtx) }}
            titulo={tituloTabs}
            modoEdicion={modoEdicionUser}
            accessButton={accessButton}
            getInfo={getInfo}
            varIdUsuario={varIdUsuario}
            selectedIndex={selectedCompania}
            agregarUsuarioCompania={agregarUsuarioCompania}
            grillaAutorizadorUsuario={grillaAutorizadorUsuario}//ENVIA
            setGrillaAutorizadorUsuario={setGrillaAutorizadorUsuario}//RECIBE
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
      {!modoEdicionUser && (
        <>
          <CompaniaUsuarioIndexPage
            mostrarPopUpPerfiles={mostrarPopUpPerfiles}// HABILITAR
            eliminarRegistro={eliminarUsuarioCompania}
            nuevoRegistroUsuario={nuevoRegistroUsuario}
            seleccionarUsuario={seleccionarUsuario}
            focusedRowKey={focusedRowKey}
            setFocusedRowKey={setFocusedRowKey}
            showHeaderInformation={false}
            selectedCompania={selectedCompania}
            getInfo={getInfo}
            uniqueId={"UsuariosListadoxx"}
            // isFirstDataLoad={isFirstDataLoad}
            // setIsFirstDataLoad={setIsFirstDataLoad}
            dataSource={dataSource}
            refresh={refresh}
            resetLoadOptions={resetLoadOptions}
            refreshData={refreshData}
            setRefreshData={setRefreshData}
            accessButton={accessButton}
            totalRowIndex={totalRowIndex}
            setTotalRowIndex={setTotalRowIndex}
          />
        </>
      )}
    </>
  }

  return (
    <>
      <TabNavContainer
        title={intl.formatMessage({ id: "ADMINISTRATION.COMPANY.MENU" })}
        submenu={intl.formatMessage({ id: "ADMINISTRATION.COMPANY.SUBMENU" })}
        subtitle={intl.formatMessage({ id: "ADMINISTRATION.COMPANY.MAINTENANCE" })}
        nombrebarra={titleHeaderToolbar()}
        tabIndex={tabIndex}
        handleChange={handleChange}
        componentTabsHeaders={[
          {
            label: intl.formatMessage({ id: "ACTION.LIST" }),
            icon: <FormatListNumberedIcon fontSize="large" />,
          },
          {
            label: intl.formatMessage({ id: "ADMINISTRATION.COMPANY.COMPANY" }),
            icon: <BusinessIcon fontSize="large" />,
            onClick: (e) => { obtenerCompania() },
            disabled: tabsDisabled()
          },
          {
            label: intl.formatMessage({ id: "ADMINISTRATION.CHARACTERISTIC" }),
            icon: <PlaylistAddCheckOutlinedIcon fontSize="large" />,
            disabled: tabsDisabled()
          },
          {
            label: ( intl.formatMessage({ id: "SECURITY.USER.USERS" }) + " " + intl.formatMessage({ id: "ACCREDITATION.MAIN" }) ),
            icon: <SupervisedUserCircleIcon fontSize="large" />,
            onClick: (e) => { listarUsuariosAsignarCompania() },
            disabled: tabsDisabled()
          }
        ]}
        className={classes.tabContent}
        componentTabsBody={
          [
            tabContent_CompaniaListPage(),
            tabContent_CompaniaEditPage(),
            tabContent_CompanyCharacteristic(),
            tabContent_CompaniaListUserAssingPage()
          ]
        }
      />

      <Confirm
        message={intl.formatMessage({ id: "ALERT.REMOVE" })}
        isVisible={isVisible}
        setIsVisible={setIsVisible}
        // setInstance={setInstance}
        onConfirm={() => eliminarListRowTab(selectedDelete, true)}
        title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
        confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
        cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
      />

      {/* =========== POPUP: LISTA TODOS LOS PERFIL SELECCIONADOS============== */}
      {popupVisiblePerfil && (
        <CompaniaUsuarioAddListPage
          uniqueId={"ListContratoXPersona"}
          showPopup={{ isVisiblePopUpPerfil: popupVisiblePerfil, setIsVisiblePopUpPerfil: setPopupVisiblePerfil }}
          accessButton={accessButton}
          focusedPerfilRowKey={focusedPerfilRowKey}
          usuarioPerfilData={listarTabs}
          eliminarRegistro={eliminarRegistroUsuarioPerfil}
          nuevoRegistro={nuevoRegistroTabs}
          seleccionarRegistro={seleccionarUsuarioPerfil}
          getInfoUsuarioAsignado={getInfoUsuarioAsignado}
          mostrarPopUpObjetos={mostrarPopUpObjetos}
        />
      )}

      {/* =========== POPUP: MUESTRA TODOS PERFILES PARA SELECCIONAR ============== */}
      {popupVisiblePerfilObjeto && (
        <SeguridadPerfilBuscar
          dataSource={perfilesData}
          showPopup={{ isVisiblePopUp: popupVisiblePerfilObjeto, setisVisiblePopUp: setPopupVisiblePerfilObjeto }}
          agregar={agregarPerfiles}
          selectionMode={"multiple"}
          showButton={true}
          setModoEdicion={setPopupVisiblePerfilObjeto}
        />
      )}
    </>
  );

}

export default injectIntl(WithLoandingPanel(CompaniaIndexPage));
