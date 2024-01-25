import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import Confirm from "../../../../partials/components/Confirm";
import { getButtonPermissions, defaultPermissions, setDisabledTabs } from '../../../../../_metronic/utils/securityUtils'
import {
  useStylesEncabezado,
  useStylesTab,
} from "../../../../store/config/Styles";
import AvatarFoto from "../../../../partials/content/avatarFoto"; //"./avatarFoto";
import { dateFormat, isNotEmpty } from "../../../../../_metronic";
import { useSelector } from "react-redux";
import {
  handleErrorMessages,
  handleSuccessMessages,
  handleInfoMessages,
} from "../../../../store/ducks/notify-messages";

//Iconos:
import DirectionsCar from "@material-ui/icons/DirectionsCar";
import FormatListNumberedIcon from "@material-ui/icons/FormatListNumbered";
import PlaylistAddCheckOutlinedIcon from "@material-ui/icons/PlaylistAddCheckOutlined";
import UsbOutlinedIcon from "@material-ui/icons/UsbOutlined";
import BusinessIcon from '@material-ui/icons/Business';

//Componentes:
import VehiculoListPage from "./VehiculoListPage";
import VehiculoEditPage from "./VehiculoEditPage";
import VehiculoFotoEditPage from "./VehiculoFotoEditPage";
import VehiculoDatosListPage from "./VehiculoDatosListPage";
import VehiculoDatosEditPage from "./VehiculoDatosEditPage";

import VehiculoCaracteristicasIndexPage from "./caracteristica/VehiculoCaracteristicasIndexPage";
import VehiculoCompaniaIndexPage from "./compania/VehiculoCompaniaIndexPage";
import VehiculoContratoIndexPage from "./contrato/VehiculoContratoIndexPage";

import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";
import TabNavContainer from "../../../../partials/components/Tabs/TabNavContainer";
import DescriptionIcon from '@material-ui/icons/Description';

//Api:
import {
  listar as ListarVehiculo,
  crear as crearVehiculo,
  actualizar as actualizaVehiculo,
  obtener as obtenerVehiculo,
  eliminar as eliminarVehiculo,
} from "../../../../api/administracion/vehiculo.api";

import {
  obtener as obtenerFoto,
  crear as crearFoto,
  actualizar as actualizarFoto,
  eliminarxtipo as eliminarFotoByTipo
} from "../../../../api/administracion/vehiculoFoto.api";

import {
  listar as ListarVehiculoDato,
  crear as crearVehiculoDato,
  actualizar as actualizaVehiculoDato,
  obtener as obtenerVehiculoDato,
  eliminar as eliminarVehiculoDato,
} from "../../../../api/administracion/vehiculoDatos.api";

//-customerDataGrid
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import { obtener as obtenerSistemaConfiguracion, obtener_medidas as obtenerSistemaConfiguracionMedidas } from "../../../../api/sistema/configuracion.api";

export const initialFilter = {
  Activo: 'S',
  IdCliente: ''
};

const VehiculoIndexPage = (props) => {
  const { intl, setLoading, dataMenu } = props;
  const classesEncabezado = useStylesEncabezado();
  const classes = useStylesTab();
  const [focusedRowKey, setFocusedRowKey] = useState();
  const usuario = useSelector((state) => state.auth.user);
  const perfil = useSelector((state) => state.perfil.perfilActual);
  const [listarTabs, setListarTabs] = useState([]); //Lista de tabs
  const [tituloTabs, setTituloTabs] = useState(intl.formatMessage({ id: "ACTION.LIST" }));

  const [modoEdicionTabs, setModoEdicionTabs] = useState(false);
  const [varIdVehiculo, setVarIdVehiculo] = useState("");
  const [varPlaca, setPlaca] = useState("");
  const [fotoPerfil, setFotoPerfil] = useState("");
  const [tabIndex, setTabIndex] = useState(0);
  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [instance, setInstance] = useState({});
  const [selected, setSelected] = useState({});
  const [selectedDelete, setSelectedDelete] = useState({});
  const [imagenConfiguracion, setImagenConfiguracion] = useState({ width: 100, height: 100, minRange: 0.2, maxRange: 0.2, weight: 5242880 });
  const [showConfirm, setShowConfirm] = useState(false);

  const [alturaSugerido, setAlturaSugerido] = useState();
  const [anchoSugerido, setAnchoSugerido] = useState();
  const [alturaSugeridoRadio, setAlturaSugeridoRadio] = useState();
  const [anchoSugeridoRadio, setAnchoSugeridoRadio] = useState();

  //FILTRO- CustomerDataGrid
  const [isFirstDataLoad, setIsFirstDataLoad] = useState(true);
  const [refreshData, setRefreshData] = useState(false);
  const ds = new DataSource({ store: new ArrayStore({ data: [], key: 'RowIndex' }), reshapeOnPush: false });
  const [dataSource] = useState(ds);

  const refresh = () => dataSource.refresh();
  const resetLoadOptions = () => dataSource.resetLoadOptions();

  //++++++++Variable (totalRowIndex) para controlar bloqueo de tabs cuando se cambia de búsqueda de un registro en la grilla.++++++++++++++
  const [totalRowIndex, setTotalRowIndex] = useState(0);

  //:::::::::::::::::::::::::::::::::::::::::::::-funciones-:::::::::::::::::::::::::::::::::
  const handleChange = (event, newValue) => {
    setTabIndex(newValue);
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

        setAlturaSugerido(resp[0].Valor1)
        setAnchoSugerido(resp[0].Valor2)
        setAlturaSugeridoRadio(resp[1].Valor1)
        setAnchoSugeridoRadio(resp[1].Valor2)

      })
  }

  useEffect(() => {
    loadControlsPermission();
    obtenerConfiguracion();
  }, []);


  const nuevoRegistroTabs = () => {
    limpiarDatosVehiculo();
    setTabIndex(1);
    let vehiculo = {
      IdCliente: perfil.IdCliente,
      Activo: "S"
    };

    setDataRowEditNew({ ...vehiculo, esNuevoRegistro: true });
    setTituloTabs(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicionTabs(true);
    setVarIdVehiculo("");

  };

  const cancelarEdicion = () => {
    setTabIndex(0);
    setModoEdicionTabs(false);
    setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
    limpiarDatosVehiculo();
  };

  const limpiarDatosVehiculo = () => {
    setFotoPerfil("");
    setVarIdVehiculo("");
    setPlaca("");
    setDataRowEditNew({});

  };

  const seleccionarRegistro = (dataRow) => {
    const { IdVehiculo, RowIndex, Placa } = dataRow;
    if (IdVehiculo !== varIdVehiculo) {
      setSelected(dataRow);
      setVarIdVehiculo(IdVehiculo);
      setPlaca(Placa);
      obtenerFotoPerfilLocal(dataRow);
      setFocusedRowKey(RowIndex);
    }
  };

  /****Configuración Botones************************* */
  const [accessButton, setAccessButton] = useState(defaultPermissions);

  const loadControlsPermission = () => {
    const numeroTabs = 7; //Nùmero de tab del formulario.
    let buttonsPermissions = getButtonPermissions(dataMenu.objetos);
    let newTabs = setDisabledTabs(dataMenu.objetos, numeroTabs);
    setAccessButton({ ...accessButton, ...buttonsPermissions, Tabs: newTabs });
  }

  async function agregarVehiculo(vehiculo) {
    setLoading(true);
    const {
      IdVehiculo,
      Placa,
      IdTipoVehiculo,
      FechaRegistro,
      IdCombustible,
      IdMarca,
      IdModelo,
      IdColor,
      Potencia,
      Anno,
      Serie,
      Activo,
      NumAsientos,
      TransportePasajeros
    } = vehiculo;

    const params = {
      IdCliente: perfil.IdCliente,
      IdVehiculo: isNotEmpty(IdVehiculo) ? IdVehiculo : 0,
      Placa: isNotEmpty(Placa) ? Placa.toUpperCase() : "",
      IdTipoVehiculo: isNotEmpty(IdTipoVehiculo)
        ? IdTipoVehiculo.toUpperCase()
        : "",
      FechaRegistro: dateFormat(FechaRegistro, "yyyyMMdd hh:mm"),
      IdCombustible: isNotEmpty(IdCombustible)
        ? IdCombustible.toUpperCase()
        : "",
      IdMarca: isNotEmpty(IdMarca) ? IdMarca.toUpperCase() : "",
      IdModelo: isNotEmpty(IdModelo) ? IdModelo.toUpperCase() : "",
      IdColor: isNotEmpty(IdColor) ? IdColor.toUpperCase() : "",
      Potencia: isNotEmpty(Potencia) ? Potencia.toUpperCase() : "",
      Anno: isNotEmpty(Anno) ? Anno.toUpperCase() : "",
      Serie: isNotEmpty(Serie) ? Serie.toUpperCase() : "",
      Activo: isNotEmpty(Activo) ? Activo.toUpperCase() : "",
      NumAsientos: isNotEmpty(NumAsientos) ? NumAsientos : 0,
      TransportePasajeros: isNotEmpty(TransportePasajeros) ? TransportePasajeros.toUpperCase() : "",
      IdUsuarioCreacion: usuario.username,
      IdUsuarioModificacion: usuario.username,
    };
    await crearVehiculo(params)
      .then((response) => {
        if (response)
          handleSuccessMessages(
            intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" })
          );
        setTabIndex(0);
        setRefreshData(true);//Actualizar CustomDataGrid
      })
      .catch((err) => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false) });
  }

  async function vehiculoObtener(IdVehiculo) {
    setLoading(true);
    await obtenerVehiculo({
      IdVehiculo,
      IdCliente: perfil.IdCliente,
      Placa: "",
    }).then(vehiculo => {
      setDataRowEditNew({
        ...vehiculo,
        esNuevoRegistro: false,
      });
    }).catch((err) => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false) });

  }

  async function verVehiculo(IdVehiculo) {
    setModoEdicionTabs(false);
    setTituloTabs(intl.formatMessage({ id: "ACTION.VIEW" }));
    await vehiculoObtener(IdVehiculo);
  }

  const editarRegistro = async (dataRow) => {
    setTabIndex(1);
    const { IdVehiculo } = dataRow;
    setModoEdicionTabs(true);
    setTituloTabs(intl.formatMessage({ id: "ACTION.EDIT" }));
    setDataRowEditNew({});
    await vehiculoObtener(IdVehiculo);

  };

  const eliminarRegistro = async (dataRow, confirm) => {
    setSelected(dataRow);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdVehiculo } = dataRow;
      await eliminarVehiculo({
        IdCliente: perfil.IdCliente,
        IdVehiculo,
        IdUsuario: usuario.username,
      }).then(() => {
        handleSuccessMessages(
          intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" })
        );
        setRefreshData(true);
      })
        .catch((err) => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false) });
    }
  };

  async function actualizarVehiculo(vehiculo) {
    setLoading(true);
    let params = getDatosParametro(vehiculo);
    await actualizaVehiculo(params)
      .then(() => {
        handleSuccessMessages(
          intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" })
        );
        setModoEdicionTabs(false);
        setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
        setTabIndex(0);
        setRefreshData(true);
      })
      .catch((err) => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false) });
  }

  const getDatosParametro = (vehiculo) => {
    const {
      IdVehiculo,
      Placa,
      IdTipoVehiculo,
      FechaRegistro,
      IdCombustible,
      IdMarca,
      IdModelo,
      IdColor,
      Potencia,
      Anno,
      Serie,
      Activo,
      NumAsientos,
      TransportePasajeros
    } = vehiculo;

    return {
      IdCliente: perfil.IdCliente,
      IdVehiculo,
      Placa: isNotEmpty(Placa) ? Placa.toUpperCase() : "",
      IdTipoVehiculo: isNotEmpty(IdTipoVehiculo)
        ? IdTipoVehiculo.toUpperCase()
        : "",
      FechaRegistro: dateFormat(FechaRegistro, "yyyyMMdd hh:mm"),  //new Date(FechaRegistro).toLocaleString(),
      IdCombustible: isNotEmpty(IdCombustible)
        ? IdCombustible.toUpperCase()
        : "",
      IdMarca: isNotEmpty(IdMarca) ? IdMarca.toUpperCase() : "",
      IdModelo: isNotEmpty(IdModelo) ? IdModelo.toUpperCase() : "",
      IdColor: isNotEmpty(IdColor) ? IdColor.toUpperCase() : "",
      Potencia: isNotEmpty(Potencia) ? Potencia.toUpperCase() : "",
      Anno: isNotEmpty(Anno) ? Anno.toUpperCase() : "",
      Serie: isNotEmpty(Serie) ? Serie.toUpperCase() : "",
      Activo: isNotEmpty(Activo) ? Activo.toUpperCase() : "",
      NumAsientos: isNotEmpty(NumAsientos) ? NumAsientos : 0,
      TransportePasajeros: isNotEmpty(TransportePasajeros) ? TransportePasajeros.toUpperCase() : "",
      IdUsuarioCreacion: usuario.username,
      IdUsuarioModificacion: usuario.username,
    };
  };

  const getInfo = () => {
    return [
      { text: [intl.formatMessage({ id: "COMMON.CODE" })], value: varIdVehiculo, colSpan: 2 },
      { text: [intl.formatMessage({ id: "ACCESS.PERSON.MARK.LICENSEPLATE" })], value: varPlaca, colSpan: 4 }
    ];
  }

  /***********************   FOTO   ********************************************** */
  function obtenerFotoPerfilLocal(dataRow) {
    const { FotoPC } = dataRow;
    setFotoPerfil(FotoPC)
  }
  async function obtenerVehiculoFoto(idVehiculo) {
    if (isNotEmpty(idVehiculo)) {
      setLoading(true);
      await obtenerFoto({
        IdVehiculo: idVehiculo,
        IdCliente: perfil.IdCliente,
      }).then(vehiculoFoto => {
        if (isNotEmpty(vehiculoFoto)) {
          setFotoPerfil(vehiculoFoto.FotoPC); //if (esPerfil)
          setDataRowEditNew({ ...vehiculoFoto, esNuevoRegistro: false });
        } else {
          setFotoPerfil("");
          setDataRowEditNew({ ...vehiculoFoto, esNuevoRegistro: true });
        }
      }).catch((err) => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => {
        setLoading(false);
      });

    }

  }

  const agregarFotoVehiculo = async (vehiculoFoto) => {
    const {
      IdVehiculo,
      IdCliente,
      FotoPC,
      FotoMovil,
      FotoExtra,
      Activo,
    } = vehiculoFoto;
    let params = {
      IdVehiculo,
      IdCliente,
      FotoPC: isNotEmpty(FotoPC) ? FotoPC : "",
      FotoMovil: isNotEmpty(FotoMovil) ? FotoMovil : "",
      FotoExtra: isNotEmpty(FotoExtra) ? FotoExtra : "",
      FechaRegistro: dateFormat(new Date(), "yyyyMMdd hh:mm"),
      Activo: Activo,
      IdUsuario: usuario.username,
    };
    await crearFoto(params)
      .then((response) => {
        if (response)
          handleSuccessMessages(
            intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" })
          );
        obtenerVehiculoFoto(varIdVehiculo);
      })
      .catch((err) => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      });
  };
  const actualizarFotoVehiculo = async (vehiculoFoto) => {

    const {
      IdVehiculo,
      IdCliente,
      FotoPC,
      FotoMovil,
      FotoExtra,
      Activo,
    } = vehiculoFoto;
    let params = {
      IdVehiculo,
      IdCliente,
      FotoPC: isNotEmpty(FotoPC) ? FotoPC : "",
      FotoMovil: isNotEmpty(FotoMovil) ? FotoMovil : "",
      FotoExtra: isNotEmpty(FotoExtra) ? FotoExtra : "",
      FechaRegistro: dateFormat(new Date(), "yyyyMMdd hh:mm"),
      Activo,
      IdUsuario: usuario.username,
    };
    await actualizarFoto(params)
      .then(() => {
        handleSuccessMessages(
          intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" })
        );
        obtenerVehiculoFoto(IdVehiculo);
      })
      .catch((err) => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      });
  };

  /***********************   DATOS   ********************************************** */

  async function listarVehiculoDatos() {
    setLoading(true);
    setModoEdicionTabs(false);
    setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
    let datos = await ListarVehiculoDato({
      IdVehiculo: varIdVehiculo,
      IdCliente: perfil.IdCliente,
    }).then(datos => {
      setListarTabs(datos);
    }).catch((err) => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function nuevoRegistroDatoVehiculo() {
    setTituloTabs(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicionTabs(true);

    setDataRowEditNew({
      Activo: "S",
      esNuevoRegistro: true,
      isReadOnly: false,
    });
  }


  async function obtenerVehiculoDatos(dataRow) {
    const { IdCliente, IdVehiculo, IdSecuencial } = dataRow;
    await obtenerVehiculoDato({
      IdVehiculo: IdVehiculo,
      IdCliente: IdCliente,
      IdSecuencial: IdSecuencial,
    }).then(dato => {
      setDataRowEditNew({ ...dato, esNuevoRegistro: false });
    }).catch((err) => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    });

  }

  const editarRegistroDatoVehiculo = async (datos) => {
    obtenerVehiculoDatos(datos);
    setTituloTabs(intl.formatMessage({ id: "ACTION.EDIT" }));
    setModoEdicionTabs(true);
  };

  const eliminarRegistroDatoVehiculo = async (datos, confirm) => {
    setSelected(datos);
    setIsVisible(true);
    if (confirm) {
      const { IdSecuencial } = datos;
      await eliminarVehiculoDato({
        IdVehiculo: varIdVehiculo,
        IdCliente: perfil.IdCliente,
        IdSecuencial,
        IdUsuario: usuario.username,
      })
        .then((response) => {
          handleSuccessMessages(
            intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" })
          );
        })
        .catch((err) => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        });
      listarVehiculoDatos();
    }
  };

  const actualizarVehiculoDatos = async (datos) => {
    const {
      IdVehiculo,
      IdCliente,
      IdSecuencial,
      TipoDato,
      Valor,
      Dato,
      Activo,
    } = datos;
    let params = {
      IdVehiculo,
      IdCliente,
      IdSecuencial,
      TipoDato: isNotEmpty(TipoDato) ? TipoDato : "",
      Dato: isNotEmpty(Dato) ? Dato.toUpperCase() : "",
      Valor: isNotEmpty(Valor) ? Valor.toUpperCase() : "",
      Activo,
      IdUsuario: usuario.username,
    };
    await actualizaVehiculoDato(params)
      .then(() => {
        handleSuccessMessages(
          intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" })
        );
        listarVehiculoDatos();
      })
      .catch((err) => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      });
  };
  const agregarVehiculoDatos = async (datos) => {

    const { IdCliente, IdVehiculo, TipoDato, Dato, Valor, Activo } = datos;
    let params = {
      IdVehiculo: varIdVehiculo,
      IdCliente: perfil.IdCliente,
      IdSecuencial: 0,
      TipoDato: isNotEmpty(TipoDato) ? TipoDato : "",
      Dato: isNotEmpty(Dato) ? Dato.toUpperCase() : "",
      Valor: isNotEmpty(Valor) ? Valor.toUpperCase() : "",
      Activo,
      IdUsuario: usuario.username,
    };

    await crearVehiculoDato(params)
      .then((response) => {
        if (response)
          handleSuccessMessages(
            intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" })
          );
        listarVehiculoDatos();
      })
      .catch((err) => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      });
  };


  const eliminarRegistroFoto = async (datos, confirm) => {
    setSelectedDelete(datos);
    setIsVisible(true);
    if (confirm) {
      const { IdVehiculo, TipoFoto } = selectedDelete;
      await eliminarFotoByTipo({
        IdVehiculo: IdVehiculo,
        TipoFoto: TipoFoto
      })
        .then((response) => {
          handleSuccessMessages(
            intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" })
          );
        })
        .catch((err) => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        });
      obtenerVehiculoFoto(varIdVehiculo);
    }
  };

  const cancelarEdicionDatos = () => {
    setModoEdicionTabs(false);
    setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };

  async function eliminarListRowTab(selected, confirm) {
    let currentTab = tabIndex;
    switch (currentTab) {
      case 0:
        eliminarRegistro(selected, confirm);
        break;
      case 2:
        eliminarRegistroFoto(selected, confirm);
        break;
      case 4:
        eliminarRegistroDatoVehiculo(selected, confirm);
        break;
    }
  }

  //:::::::::::::::::::::::::::::::::::::::::::::-Configuración de tabs-:::::::::::::::::::::::::::::::::
  const titleHeaderToolbar = () => {
    let tabsTitles = [
      "",
      "",
      "ADMINISTRATION.VEHICLE.PHOTO",
      "ADMINISTRATION.CONTRACT.CONTRACT",
      "ADMINISTRATION.VEHICLE.DATA",
      "ADMINISTRATION.VEHICLE.CHARACTERISTIC",
    ];

    let sufix = tabsTitles[tabIndex] !== "" ? (" - " + `${intl.formatMessage({ id: tabsTitles[tabIndex] })}`) : "";

    return `${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} ` + "  " + sufix;
  }
  const tabsDisabled = () => {
    return isNotEmpty(varIdVehiculo) ? false : true;
  }

  const tabContent_VehiculoListPage = () => {
    return <VehiculoListPage
      nuevoRegistro={nuevoRegistroTabs}
      editarRegistro={editarRegistro}
      eliminarRegistro={eliminarRegistro}
      titulo={tituloTabs}
      seleccionarRegistro={seleccionarRegistro}
      focusedRowKey={focusedRowKey}
      setFocusedRowKey={setFocusedRowKey}
      //Propiedades del customerDataGrid 
      isFirstDataLoad={isFirstDataLoad}
      setIsFirstDataLoad={setIsFirstDataLoad}
      dataSource={dataSource}
      refresh={refresh}
      resetLoadOptions={resetLoadOptions}
      refreshData={refreshData}
      setRefreshData={setRefreshData}
      accessButton={accessButton}
      uniqueId={"VehiculoListPagePrincipal"}
      setVarIdVehiculo={setVarIdVehiculo}
      totalRowIndex={totalRowIndex}
      setTotalRowIndex={setTotalRowIndex}
    />
  }

  const tabContent_VehiculoEditPage = () => {
    return <>
      <VehiculoEditPage
        dataRowEditNew={dataRowEditNew}
        modoEdicion={modoEdicionTabs}
        cancelarEdicion={cancelarEdicion}
        agregarVehiculo={agregarVehiculo}
        actualizarVehiculo={actualizarVehiculo}
        titulo={tituloTabs}

        settingDataField={dataMenu.datos}
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

  const tabContent_VehiculoFotoEditPage = () => {
    return <>
      <VehiculoFotoEditPage
        cancelarEdicion={cancelarEdicion}
        dataRowEditNew={dataRowEditNew}
        size={classes.avatarLarge}
        uploadImagen={true}
        agregarFoto={agregarFotoVehiculo}
        actualizarFoto={actualizarFotoVehiculo}
        idVehiculo={varIdVehiculo}
        getInfo={getInfo}
        imagenConfiguracion={imagenConfiguracion}
        eliminarRegistro={eliminarRegistroFoto}

        medidaSugeridas={{
          width: anchoSugerido, height: alturaSugerido,
          width_radio: anchoSugeridoRadio, height_radio: alturaSugeridoRadio
        }}

      />
    </>
  }

  const tabContent_VehiculoDatosListPage = () => {
    return <>
      {modoEdicionTabs ? (
        <>
          <VehiculoDatosEditPage
            modoEdicion={modoEdicionTabs}
            dataRowEditNew={dataRowEditNew}
            actualizarDatos={actualizarVehiculoDatos}
            agregarDatos={agregarVehiculoDatos}
            cancelarEdicion={cancelarEdicionDatos}
            titulo={tituloTabs}
            getInfo={getInfo}
            accessButton={accessButton}
            settingDataField={dataMenu.datos}
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
      ) : (
        <VehiculoDatosListPage
          editarRegistro={editarRegistroDatoVehiculo}
          eliminarRegistro={eliminarRegistroDatoVehiculo}
          nuevoRegistro={nuevoRegistroDatoVehiculo}
          cancelarEdicion={cancelarEdicion}
          vehiculoDatos={listarTabs}
          getInfo={getInfo}
          accessButton={accessButton}
        />
      )}
    </>
  }

  const tabContent_VehiculoCaracteristicasListPage = () => {
    return <>

      <VehiculoCaracteristicasIndexPage
        varIdVehiculo={varIdVehiculo}
        cancelarEdicion={cancelarEdicion}
        getInfo={getInfo}
        accessButton={accessButton}
        settingDataField={dataMenu.datos}
      />

    </>
  }

  // const tabContent_VehiculoCompaniaListPage = () => {
  //   return <>

  //     <VehiculoCompaniaIndexPage
  //       varIdVehiculo={varIdVehiculo}
  //       cancelarEdicion={cancelarEdicion}
  //       getInfo={getInfo}
  //       accessButton={accessButton}
  //       settingDataField={dataMenu.datos}
  //     />

  //   </>
  // }

  const tabContent_VehiculoContratoListPage = () => {
    return <>

      <VehiculoContratoIndexPage
        varIdVehiculo={varIdVehiculo}
        cancelarEdicion={cancelarEdicion}
        getInfo={getInfo}
        accessButton={accessButton}
        settingDataField={dataMenu.datos}
        selectedIndex={selected}
        ocultarEdit={false}
      />

    </>
  }

  //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  return (
    <>
      <TabNavContainer
        title={intl.formatMessage({ id: "ADMINISTRATION.VEHICLE.MENU" })}
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
            label: intl.formatMessage({ id: "ADMINISTRATION.VEHICLE.TAB" }),
            icon: <AvatarFoto size={classes.avatarSmall}
              id={"FotoPC"}
              imagenB64={fotoPerfil} />,
            className: classes.avatarContent,
            onClick: (e) => { verVehiculo(varIdVehiculo) },
            disabled: tabsDisabled()
          },
          {
            label: intl.formatMessage({ id: "ADMINISTRATION.VEHICLE.PHOTO" }),
            icon: <DirectionsCar fontSize="large" />,
            onClick: (e) => { obtenerVehiculoFoto(varIdVehiculo); },
            disabled: !tabsDisabled() && accessButton.Tabs[2] ? false : true
          },
          {
            label: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CONTRACT" }),
            icon: <DescriptionIcon fontSize="large" />,
            disabled: !tabsDisabled() && accessButton.Tabs[3] ? false : true
          },
          {
            label: intl.formatMessage({ id: "ADMINISTRATION.VEHICLE.DATA" }),
            icon: <UsbOutlinedIcon fontSize="large" />,
            onClick: () => { listarVehiculoDatos() },
            disabled: !tabsDisabled() && accessButton.Tabs[4] ? false : true
          },
          {
            label: intl.formatMessage({ id: "ADMINISTRATION.VEHICLE.CHARACTERISTIC" }),
            icon: <PlaylistAddCheckOutlinedIcon fontSize="large" />,
            disabled: !tabsDisabled() && accessButton.Tabs[5] ? false : true
          },
          // {
          //   label: intl.formatMessage({ id: "ADMINISTRATION.COMPANY.COMPANY" }),
          //   icon: <BusinessIcon fontSize="large" />,
          //   disabled: !tabsDisabled() && accessButton.Tabs[6] ? false : true
          // }
        ]}
        className={classes.tabContent}
        componentTabsBody={
          [
            tabContent_VehiculoListPage(),
            tabContent_VehiculoEditPage(),
            tabContent_VehiculoFotoEditPage(),
            tabContent_VehiculoContratoListPage(),
            tabContent_VehiculoDatosListPage(),
            tabContent_VehiculoCaracteristicasListPage(),
            // tabContent_VehiculoCompaniaListPage()
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


export default injectIntl(WithLoandingPanel(VehiculoIndexPage));
