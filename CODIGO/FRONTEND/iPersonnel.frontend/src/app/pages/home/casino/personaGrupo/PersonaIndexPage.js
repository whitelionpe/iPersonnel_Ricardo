import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import DescriptionIcon from '@material-ui/icons/Description';
import AccountCircleOutlinedIcon from '@material-ui/icons/AccountCircleOutlined';
import GroupWorkSharpIcon from '@material-ui/icons/GroupWorkSharp';
import AttachMoneyIcon from '@material-ui/icons/AttachMoney';
import TouchAppIcon from "@material-ui/icons/TouchApp";
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';

import { dateFormat, getDateOfDay, isNotEmpty, TYPE_SISTEMA_ENTIDAD } from "../../../../../_metronic";
import { TYPE_IDENTIFICACION_TIPOIDENTIFICACION } from "../../../../../_metronic";
import { handleErrorMessages, handleSuccessMessages, handleInfoMessages } from "../../../../store/ducks/notify-messages";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import Confirm from "../../../../partials/components/Confirm";
import { useStylesEncabezado, useStylesTab } from "../../../../store/config/Styles";
import { useSelector } from "react-redux";
import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";
import PersonaListPage from "./PersonaListPage";
import PersonaEditTabPage from "../../administracion/persona/PersonaEditTabPage";
import PersonaFotoEditPage from "../../administracion/persona/PersonaFotoEditPage";
import PersonaContratoIndexPage from "../../administracion/persona/contrato/PersonaContratoIndexPage";
import PersonaGrupoIndexPage from "./grupo/PersonaGrupoIndexPage";
import PersonaCategoriaCostoIndexPage from "./categoria/PersonaCategoriaCostoIndexPage";
import AvatarFoto from "../../../../partials/content/avatarFoto";//"./avatarFoto";
import MarcacionListPage from './../marcacion/MarcacionListPage';
import MarcacionEditPage from './../marcacion/MarcacionEditPage';
import { getButtonPermissions, defaultPermissions, setDisabledTabs, getDisableTab } from '../../../../../_metronic/utils/securityUtils'
import TabNavContainer from "../../../../partials/components/Tabs/TabNavContainer";
import CasinoMarcacionMotivoPopUp from "../../../../partials/components/CasinoMarcacionMotivoPopUp";

import { servicePersona } from "../../../../api/administracion/persona.api";
import { obtener as obtenerFoto } from "../../../../api/administracion/personaFoto.api";
import { obtener_medidas as obtenerSistemaConfiguracionMedidas } from "../../../../api/sistema/configuracion.api";
import {
  eliminar as eliminarMar,
  obtener as obtenerMar,
  listar as listarMar,
  crear as crearMar,
  actualizar as actualizarMar
} from "../../../../api/casino/marcacion.api";

export const initialFilter = {
  Activo: 'S',
  Estado: 'S',
  MostrarGrupo: "1",
  Condicion: 'TRABAJADOR',
  IdFuncion: ''
};
export const initialFilterMarcas = {
  IdCliente: '',
  IdPersona: '',
  IdDivision: '',
  FechaInicio: new Date((new Date()).getFullYear(), (new Date()).getMonth(), 1),
  FechaFin: new Date((new Date()).getFullYear(), (new Date()).getMonth(), (new Date()).getDate() + 26)
};


const PersonaIndexPage = (props) => {
  const { intl, setLoading, dataMenu, selectedIndex } = props;
  const usuario = useSelector(state => state.auth.user);
  const perfil = useSelector(state => state.perfil.perfilActual);
  const [varIdPersona, setVarIdPersona] = useState("");

  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
  const [focusedRowKey, setFocusedRowKey] = useState();
  const [focusedRowKeyMarcacion, setFocusedRowKeyMarcacion] = useState();

  const [selected, setSelected] = useState({});
  const [selectedDelete, setSelectedDelete] = useState({});
  const classes = useStylesTab();
  const [tabIndex, setTabIndex] = useState(0);

  const [tituloTabs, setTituloTabs] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  const [listarTabs, setListarTabs] = useState([]);
  const [fechaInicio, setFechaInicio] = useState(new Date());
  const [fechaFin, setFechaFin] = useState(new Date());

  const handleChange = (event, newValue) => { setTabIndex(newValue); };
  const [fotoPerfil, setFotoPerfil] = useState("");
  const [listarCabeceraMarcacion, setListarCabeceraMarcacion] = useState([]);

  const [alturaSugerido, setAlturaSugerido] = useState();
  const [anchoSugerido, setAnchoSugerido] = useState();
  const [alturaSugeridoRadio, setAlturaSugeridoRadio] = useState();
  const [anchoSugeridoRadio, setAnchoSugeridoRadio] = useState();

  //FILTRO
  const [isFirstDataLoad, setIsFirstDataLoad] = useState(true);
  const [refreshData, setRefreshData] = useState(false);
  const ds = new DataSource({ store: new ArrayStore({ data: [], key: 'RowIndex' }), reshapeOnPush: false });
  const [dataSource] = useState(ds);

  const refresh = () => dataSource.refresh();
  const resetLoadOptions = () => dataSource.resetLoadOptions();

  const [isVisible, setIsVisible] = useState(false);
  const [instance, setInstance] = useState({});
  const [dataCombos, setDataCombos] = useState([]);

  const [modeView, setModeView] = useState(false);
  const [isVisiblePopUpMotivo, setisVisiblePopUpMotivo] = useState(false);

  //PD
  const [fechasContrato, setFechasContrato] = useState({ FechaInicioContrato: null, FechaFinContrato: null });
  //++++++++Variable (totalRowIndex) para controlar bloqueo de tabs cuando se cambia de búsqueda de un registro en la grilla.++++++++++++++
  const [totalRowIndex, setTotalRowIndex] = useState(0);

  /*********************************************************** */
  const [accessButton, setAccessButton] = useState(defaultPermissions);
  const loadControlsPermission = () => {
    const numeroTabs = 7; //Nùmero de tab del formulario.
    let buttonsPermissions = getButtonPermissions(dataMenu.objetos);
    let newTabs = setDisabledTabs(dataMenu.objetos, numeroTabs);
    setAccessButton({ ...accessButton, ...buttonsPermissions, Tabs: newTabs });
  }
  //:::::::::::::::::::::::::::::::::::::::::::::-funciones-:::::::::::::::::::::::::::::::::
  async function cargarCombos() {
    setLoading(true);
    let array = [];
    setDataCombos([]);
    await servicePersona.listarCombosPersona({ IdPais: perfil.IdPais }).then(data => {
      array.push(data[0].filter(k => k.IdEntidad === TYPE_SISTEMA_ENTIDAD.PERSONAS)); // Combo Tipo Documentos 
      array.push(data[1]); // Combo Tipo de Sangre
      array.push(data[2]); // Combo Estado Civil 
      array.push(data[3]); // Combo Licencia Conducir
      setDataCombos(array);
    }).finally(() => {
      setLoading(false);
    });
  }

  async function obtenerPersona(idPersona, validateSensitiveInformation = false) {
    setLoading(true);
    let persona;
    const { IdPersona, IdCliente } = selected;
    if (isNotEmpty(idPersona)) {
      persona = await servicePersona.obtener({ IdPersona, IdCliente }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
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

  };

  const seleccionarRegistro = async (dataRow) => {

    const { IdPersona, RowIndex } = dataRow;
    setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
    if (IdPersona !== varIdPersona) {
      setSelected(dataRow);
      setVarIdPersona(IdPersona);
      obtenerFotoPerfilLocal(dataRow);
      setModoEdicion(false);
      setFocusedRowKey(RowIndex);

    }

  }

  const seleccionarRegistroMarcacion = async (dataRow) => {
    const { RowIndex } = dataRow;
    if (RowIndex > 0) setFocusedRowKeyMarcacion(RowIndex);

  }

  const verRegistroDblClick = async (dataRow) => {
    changeTabIndex(1);
    await obtenerPersona(dataRow.IdPersona, true);
  };

  function clearSensitiveInformation(input, target) {
    input.forEach((element) => {
      let hasProperty = target.hasOwnProperty(element.Campo);
      if (hasProperty) {
        target[element.Campo] = " ";
      }
    })
  }

  useEffect(() => {
    cargarCombos();
    loadControlsPermission();
  }, []);

  //Datos Principales
  const getInfo = () => {
    const { IdPersona, NombreCompleto } = selected;
    return [
      { text: [intl.formatMessage({ id: "COMMON.CODE" })], value: IdPersona, colSpan: 2 },
      { text: [intl.formatMessage({ id: "CASINO.PERSON.GROUP.LASTNAMEANDNAME" })], value: NombreCompleto, colSpan: 4 },
    ];
  }


  const changeTabIndex = (index) => {
    handleChange(null, index);
  }

  //::::::::::::::::::::::::::::::::::-FUNCIONES PERSONA FOTO:::::::::::::::::::::::::::::::::
  function obtenerFotoPerfilLocal(dataRow) {
    const { FotoPC } = dataRow;
    setFotoPerfil(FotoPC)
  }


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

  async function obtenerPersonaFoto(idPersona, esPerfil) {
    setLoading(true);
    const { IdPersona, IdCliente } = selected;

    await validateConfigurationImageLength(IdCliente);

    await obtenerFoto({ IdPersona, IdCliente })
      .then(personaFoto => {
        if (isNotEmpty(personaFoto)) {
          setFotoPerfil(personaFoto.FotoPC); //if (esPerfil)  
          setDataRowEditNew({ ...personaFoto, esNuevoRegistro: false });
        } else {
          setFotoPerfil("");
          setDataRowEditNew({ ...selected, esNuevoRegistro: true });
        }
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false) });
  }


  //:: MARCACIONES :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  async function agregarMarcacion(dataRow) {
    setLoading(true);

    const { IdComedor, IdServicio, FechaMarca, IdTipoIdentificacion, Identificacion, IdEquipo,
      Automatico, Online, ConsumoNegado, CostoAsumidoEmpresa, CostoAsumidoTrabajador, IdCentroCosto, FechaRegistro, NumeroServicios
    } = dataRow;

    let params = {
      IdCliente: perfil.IdCliente
      , IdSecuencial: 0
      , IdDivision: perfil.IdDivision
      , IdComedor: isNotEmpty(IdComedor) ? IdComedor.toUpperCase() : ""
      , IdServicio: isNotEmpty(IdServicio) ? IdServicio.toUpperCase() : ""
      , FechaMarca: dateFormat(FechaMarca, 'yyyyMMdd hh:mm')
      , IdTipoIdentificacion: isNotEmpty(IdTipoIdentificacion) ? IdTipoIdentificacion.toUpperCase() : ""
      , Identificacion: isNotEmpty(Identificacion) ? Identificacion.toUpperCase() : ""
      , IdPersona: varIdPersona
      , IdEquipo: isNotEmpty(IdEquipo) ? IdEquipo.toUpperCase() : ""
      , OrigenRegistro: 'W'// Web
      , Automatico
      , Online
      , ConsumoNegado: isNotEmpty(ConsumoNegado) ? ConsumoNegado.toUpperCase() : ""
      , CostoAsumidoEmpresa: isNotEmpty(CostoAsumidoEmpresa) ? CostoAsumidoEmpresa : 0
      , CostoAsumidoTrabajador: isNotEmpty(CostoAsumidoTrabajador) ? CostoAsumidoTrabajador : 0
      , IdCentroCosto: isNotEmpty(IdCentroCosto) ? IdCentroCosto.toUpperCase() : ""
      , NumeroServicios: isNotEmpty(NumeroServicios) ? NumeroServicios : 0
      , Hash: ""
      , FechaRegistro: dateFormat(FechaRegistro, 'yyyyMMdd')
      , IdUsuario: usuario.username
      , IdCompania: perfil.IdCompania
    };
    await crearMar(params).then(response => {
      setModoEdicion(false);
      setRefreshData(true);
      if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      //listarMarcacion();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false) });
  }

  async function actualizarMarcacion(dataRow) {
    setLoading(true);
    const { IdCliente, IdSecuencial, IdDivision, IdComedor, IdServicio, FechaMarca, IdTipoIdentificacion, Identificacion, IdPersona, IdEquipo,
      Automatico, Online, ConsumoNegado, IdCentroCosto, NumeroServicios
    } = dataRow;

    let params = {
      IdCliente: IdCliente
      , IdSecuencial: IdSecuencial
      , IdDivision: IdDivision
      , IdComedor: isNotEmpty(IdComedor) ? IdComedor.toUpperCase() : ""
      , IdServicio: isNotEmpty(IdServicio) ? IdServicio.toUpperCase() : ""
      , FechaMarca: dateFormat(FechaMarca, 'yyyyMMdd hh:mm')
      , IdTipoIdentificacion: isNotEmpty(IdTipoIdentificacion) ? IdTipoIdentificacion.toUpperCase() : ""
      , Identificacion: isNotEmpty(Identificacion) ? Identificacion.toUpperCase() : ""
      , IdPersona: varIdPersona
      , IdEquipo: isNotEmpty(IdEquipo) ? IdEquipo.toUpperCase() : ""
      , OrigenRegistro: 'W'// Web
      , Automatico
      , Online
      , ConsumoNegado: isNotEmpty(ConsumoNegado) ? ConsumoNegado.toUpperCase() : ""
      , IdCentroCosto: isNotEmpty(IdCentroCosto) ? IdCentroCosto.toUpperCase() : ""
      , NumeroServicios: isNotEmpty(NumeroServicios) ? NumeroServicios : 0
      , Hash: ""
      , IdUsuario: usuario.username
    };

    await actualizarMar(params).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      listarMarcacion();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false) });
  }

  async function eliminarMarcacion(dataRow, confirm) {
    setSelectedDelete(dataRow);
    setIsVisible(true);
    if (confirm) {
      setisVisiblePopUpMotivo(true);
    }
  }

  const confirmarEliminar = async () => {
    setLoading(true);
    const { IdCliente, IdSecuencial } = selectedDelete;
    const { Motivo } = dataRowEditNew;
    await eliminarMar({
      IdCliente,
      IdSecuencial,
      Motivo: isNotEmpty(Motivo) ? Motivo.toUpperCase() : ""
    }).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false) });
    listarMarcacion();
    setisVisiblePopUpMotivo(false);
  };


  async function listarMarcacion() {
    //console.log("listarMarcacion");
    setLoading(true);
    await listarMar({
      IdCliente: perfil.IdCliente,
      IdDivision: perfil.IdDivision,
      NumPagina: 0,
      TamPagina: 0
    }).then(data => {
      setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
      setListarTabs(data);
      setModoEdicion(false);
      setRefreshData(true);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false) });

  }

  async function obtenerMarcacion(dataRow) {
    setLoading(true);
    const { IdCliente, IdPersona, IdSecuencial } = dataRow;
    await obtenerMar({
      IdCliente,
      IdPersona: varIdPersona,
      IdSecuencial
    }).then(data => {
      const { Automatico } = data;
      data.Automatico = Automatico === "S" ? "S" : "N";
      setDataRowEditNew({ ...data, esNuevoRegistro: false });
      setModoEdicion(true);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false) });

  }

  const editarRegistroMarcacion = async (dataRow) => {
    setModeView(false);
    await servicePersona.obtenerPeriodo({
      IdCliente: perfil.IdCliente,
      IdPersona: varIdPersona,
      FechaInicio: dateFormat(new Date(), 'yyyyMMdd'),
      FechaFin: dateFormat(new Date(), 'yyyyMMdd'),
    }).then(response => {
      if (response) {
        if (!isNotEmpty(response.MensajeValidacion)) {
          setFechasContrato({ FechaInicioContrato: response.FechaInicio, FechaFinContrato: response.FechaFin });
        } else {
          setFechasContrato({ FechaInicioContrato: null, FechaFinContrato: null });
          handleInfoMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), response.MensajeValidacion);
        }
      }
    }).finally(x => {
      setLoading(false);
    });

    setDataRowEditNew({});
    setTituloTabs(intl.formatMessage({ id: "ACTION.EDIT" }));
    obtenerMarcacion(dataRow);
  };

  const verRegistro = async (dataRow) => {
    setModeView(true);
    setTituloTabs(intl.formatMessage({ id: "ACTION.VIEW" }));
    obtenerMarcacion(dataRow);
  };

  const nuevoRegistroTabsMarcacion = async () => {
    setModeView(false);
    let dateNow = new Date();
    setLoading(true);

    await servicePersona.obtenerPeriodo({
      IdCliente: perfil.IdCliente,
      IdPersona: varIdPersona,
      FechaInicio: dateFormat(new Date(), 'yyyyMMdd'),
      FechaFin: dateFormat(new Date(), 'yyyyMMdd'),
    }).then(response => {
      if (response) {
        if (!isNotEmpty(response.MensajeValidacion)) {
          setFechasContrato({ FechaInicioContrato: response.FechaInicio, FechaFinContrato: response.FechaFin });

          let nuevo = {
            Activo: "S",
            Online: "S",
            FechaRegistro: dateNow,
            FechaMarca: dateNow,
            IdTipoIdentificacion: TYPE_IDENTIFICACION_TIPOIDENTIFICACION.DOCUMENTO_DE_IDENTIDAD,
            Identificacion: selected.Documento
          };
          setDataRowEditNew({ ...nuevo, Automatico: "N", ConsumoNegado: "N", Online: "S", esNuevoRegistro: true });
          setTituloTabs(intl.formatMessage({ id: "ACTION.NEW" }));
          setModoEdicion(true);
          changeTabIndex(6);
          setLoading(false);

        } else {
          setFechasContrato({ FechaInicioContrato: null, FechaFinContrato: null });
          handleInfoMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), response.MensajeValidacion);
        }
      }
    }).finally(x => {
      setLoading(false);
    });


  };

  const cancelarEdicionTabsMarcacion = () => {
    changeTabIndex(6);
    setModoEdicion(false);
    setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});

  };



  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  async function eliminarListRowTab(selected, confirm) {
    let currentTab = tabIndex;
    switch (currentTab) {
      case 6:
        eliminarMarcacion(selected, confirm);
        break;
    }
  }

  //:::::::::::::::::::::::::::::::::::::::::::::-Configuración de tabs-:::::::::::::::::::::::::::::::::
  const titleHeaderToolbar = () => {
    let tabsTitles = [
      "",
      "",
      "CASINO.PERSON.GROUP.PHOTO",
      "ADMINISTRATION.CONTRACT.CONTRACT",
      "CASINO.PERSON.GROUP.GROUP",
      "CASINO.PERSON.CATEGORY_COST.TAB",
      "ACCESS.PERSON.MARK.TAB"
    ];

    let sufix = tabsTitles[tabIndex] !== "" ? (" - " + `${intl.formatMessage({ id: tabsTitles[tabIndex] })}`) : "";

    return `${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} ` + " " + sufix;
  }
  const tabsDisabled = () => {
    return isNotEmpty(varIdPersona) ? false : true;
    //return true;
  }

  const tabContent_PersonaListPage = () => {
    return <PersonaListPage
      titulo={titulo}
      seleccionarRegistro={seleccionarRegistro}
      verRegistroDblClick={verRegistroDblClick}
      focusedRowKey={focusedRowKey}
      setFocusedRowKey={setFocusedRowKey}
      showButtons={false}

      uniqueId={"CasinoPersonaList"}
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
    />
  }


  const tabContent_PersonaEditTabPage = () => {
    return <>
      <PersonaEditTabPage
        modoEdicion={modoEdicion}
        titulo={titulo}
        dataRowEditNew={dataRowEditNew}
        idPersona={varIdPersona}
        setDataRowEditNew={setDataRowEditNew}
        cancelarEdicion={cancelarEdicion}
        //req y edit
        settingDataField={dataMenu.datos}
        accessButton={accessButton}
        getInfo={getInfo}
        dataCombos={dataCombos}
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
        setDataRowEditNew={setDataRowEditNew}
        dataRowEditNew={dataRowEditNew}
        cancelarEdicion={cancelarEdicion}
        titulo={tituloTabs}
        size={classes.avatarLarge}
        getInfo={getInfo}

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
      {auditoriaSwitch && (<AuditoriaPage dataRowEditNew={dataRowEditNew} />)}
    </>
  }


  const tabContent_PersonaContrato = () => {
    return <>
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

  }


  const tabContent_PersonaGrupoListPage = () => {
    return <>

      <PersonaGrupoIndexPage
        varIdPersona={varIdPersona}
        cancelarEdicion={cancelarEdicion}
        getInfo={getInfo}
        accessButton={accessButton}
        settingDataField={dataMenu.datos}
        dataMenu={dataMenu}
      />

    </>
  }

  const tabContent_PersonaCategoriaCostoListPage = () => {
    return <>

      <PersonaCategoriaCostoIndexPage
        varIdPersona={varIdPersona}
        cancelarEdicion={cancelarEdicion}
        getInfo={getInfo}
        accessButton={accessButton}
        settingDataField={dataMenu.datos}
      />

    </>
  }

  const tabContent_MarcacionListPage = () => {
    return <>
      {modoEdicion && (
        <>
          <MarcacionEditPage
            dataRowEditNew={dataRowEditNew}
            setDataRowEditNew={setDataRowEditNew}
            agregar={agregarMarcacion}
            actualizar={actualizarMarcacion}
            cancelarEdicion={cancelarEdicionTabsMarcacion}
            titulo={tituloTabs}
            modoEdicion={modoEdicion}
            settingDataField={dataMenu.datos}
            accessButton={accessButton}
            varIdPersona={varIdPersona}
            setLoading={setLoading}
            getInfo={getInfo}
            fechasContrato={fechasContrato}
            modeView={modeView}
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
        <MarcacionListPage
          dataRowEditNew={dataRowEditNew}
          personaMarcacionData={listarTabs}
          focusedRowKey={focusedRowKeyMarcacion}
          seleccionarRegistro={seleccionarRegistroMarcacion}
          verRegistro={verRegistro}
          editarRegistro={editarRegistroMarcacion}
          eliminarRegistro={eliminarMarcacion}
          cancelarEdicion={cancelarEdicion}
          nuevoRegistro={nuevoRegistroTabsMarcacion}
          varIdPersona={varIdPersona}
          columnas={listarCabeceraMarcacion}
          getInfo={getInfo}
          accessButton={accessButton}
          //=>..CustomerDataGrid
          // filterData={filterData}
          // setFilterData={setFilterData}
          isFirstDataLoad={isFirstDataLoad}
          setIsFirstDataLoad={setIsFirstDataLoad}
          dataSource={dataSource}
          refresh={refresh}
          resetLoadOptions={resetLoadOptions}
          refreshData={refreshData}
          setRefreshData={setRefreshData}
          uniqueId={"MarcacionListPersonaIndex"}
          fechaInicio={fechaInicio}
          fechaFin={fechaFin}
          setFechaInicio={setFechaInicio}
          setFechaFin={setFechaFin}
        />
      )}

    </>
  }

  //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  return (
    <>
      <TabNavContainer
        title={intl.formatMessage({ id: "CASINO.PERSON.GROUP.MENU" })}
        submenu={intl.formatMessage({ id: "CONFIG.MENU.COMEDORES.GESTIÓN_COMEDORES" })}
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
            label: intl.formatMessage({ id: "CASINO.PERSON.GROUP.PERSON" }),
            icon: <AvatarFoto size={classes.avatarSmall} id={"FotoPerfil"} imagenB64={fotoPerfil} />,
            onClick: (e) => { obtenerPersona(selected) },
            className: classes.avatarContent,
            disabled: tabsDisabled()
          },
          {
            label: intl.formatMessage({ id: "CASINO.PERSON.GROUP.PHOTO" }),
            icon: <AccountCircleOutlinedIcon fontSize="large" />,
            onClick: (e) => { obtenerPersonaFoto() },
            disabled: !tabsDisabled() && accessButton.Tabs[2] ? false : true
          },
          {
            label: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CONTRACT" }),
            icon: < DescriptionIcon fontSize="large" />,
            disabled: !tabsDisabled() && accessButton.Tabs[3] ? false : true
          },
          {
            label: intl.formatMessage({ id: "CASINO.PERSON.GROUP.GROUP" }),
            icon: <GroupWorkSharpIcon fontSize="large" />,
            disabled: !tabsDisabled() && accessButton.Tabs[4] ? false : true
          },
          {
            label: intl.formatMessage({ id: "CASINO.PERSON.CATEGORY_COST.TAB" }),
            icon: <AttachMoneyIcon fontSize="large" />,
            disabled: !tabsDisabled() && accessButton.Tabs[5] ? false : true
          },
          {
            label: intl.formatMessage({ id: "ACCESS.PERSON.MARK.TAB" }),
            icon: <TouchAppIcon fontSize="large" />,
            onClick: () => { listarMarcacion() },
            disabled: !tabsDisabled() && accessButton.Tabs[6] ? false : true

          }
        ]}
        className={classes.tabContent}
        componentTabsBody={
          [
            tabContent_PersonaListPage(),
            tabContent_PersonaEditTabPage(),
            tabContent_PersonaFotoEditPage(),
            tabContent_PersonaContrato(),
            tabContent_PersonaGrupoListPage(),
            tabContent_PersonaCategoriaCostoListPage(),
            tabContent_MarcacionListPage()
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

      {isVisiblePopUpMotivo && (
        <CasinoMarcacionMotivoPopUp
          dataRowEditNew={dataRowEditNew}
          showPopup={{ isVisiblePopUp: isVisiblePopUpMotivo, setisVisiblePopUp: setisVisiblePopUpMotivo }}
          cancelar={() => setisVisiblePopUpMotivo(false)}
          confirmar={confirmarEliminar}
        />
      )}

    </>
  );
};



export default injectIntl(WithLoandingPanel(PersonaIndexPage));
