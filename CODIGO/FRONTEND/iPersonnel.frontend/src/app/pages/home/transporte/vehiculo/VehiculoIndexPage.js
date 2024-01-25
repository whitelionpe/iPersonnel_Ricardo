import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import { useStylesEncabezado, useStylesTab, } from "../../../../store/config/Styles";
import AvatarFoto from "../../../../partials/content/avatarFoto";
import { isNotEmpty } from "../../../../../_metronic";
import { useSelector } from "react-redux";
import { getButtonPermissions, defaultPermissions, setDisabledTabs } from '../../../../../_metronic/utils/securityUtils'
import {
  handleErrorMessages,
  handleSuccessMessages,
  handleInfoMessages,
} from "../../../../store/ducks/notify-messages";

//Doc
// import { obtener as obtenerMenu } from "../../../../api/sistema/menu.api";
import { serviceMenu } from "../../../../api/sistema/menu.api";


//Iconos:
import DirectionsCar from "@material-ui/icons/DirectionsCar";
import FormatListNumberedIcon from "@material-ui/icons/FormatListNumbered";
import PlaylistAddCheckIcon from '@material-ui/icons/PlaylistAddCheck';
import FindInPageIcon from '@material-ui/icons/FindInPage';
import GroupWorkIcon from '@material-ui/icons/GroupWork';
import PanToolIcon from '@material-ui/icons/PanTool';
import DescriptionIcon from '@material-ui/icons/Description';
import SettingsIcon from '@material-ui/icons/Settings';

//Componentes:
import VehiculoListPage from "../../administracion/vehiculo/VehiculoListPage";
import VehiculoEditPage from "../../administracion/vehiculo/VehiculoEditPage";
import VehiculoFotoEditPage from "../../administracion/vehiculo/VehiculoFotoEditPage";

import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";

//Api:
import {
  //listar as ListarVehiculo,
  // crear as crearVehiculo,
  // actualizar as actualizaVehiculo,
  obtener as obtenerVehiculo,
  eliminar as eliminarVehiculo,
} from "../../../../api/administracion/vehiculo.api";

import {
  obtener as obtenerFoto,
  crear as crearFoto,
  actualizar as actualizarFoto,
} from "../../../../api/administracion/vehiculoFoto.api";


import VehiculoRequisitoIndexPage from "./requisito/VehiculoRequisitoIndexPage";
import VehiculoContratoIndexPage from "../../administracion/vehiculo/contrato/VehiculoContratoIndexPage";
import VehiculoAsientos from "./asientos/VehiculoAsientos";

import TouchAppIcon from "@material-ui/icons/TouchApp";
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import TabNavContainer from "../../../../partials/components/Tabs/TabNavContainer";

export const initialFilter = {
  IdCliente: '',
  Activo: 'S',
};

const VehiculoIndexPage = (props) => {
  const { intl, setLoading, dataMenu } = props;
  const classesEncabezado = useStylesEncabezado();
  const classes = useStylesTab();
  const [focusedRowKey, setFocusedRowKey] = useState();
  const usuario = useSelector((state) => state.auth.user);
  const perfil = useSelector((state) => state.perfil.perfilActual);
  const [listarTabs, setListarTabs] = useState([]); //Lista de tabs
  const [tituloTabs, setTituloTabs] = useState(
    intl.formatMessage({ id: "ACTION.LIST" })
  );

  const [modoEdicionTabs, setModoEdicionTabs] = useState(false);
  const [varIdVehiculo, setVarIdVehiculo] = useState("");
  const [varIdTipoVehiculo, setVarIdTipoVehiculo] = useState("");
  const [varPlaca, setPlaca] = useState("");
  const [fotoPerfil, setFotoPerfil] = useState("");
  const [tabIndex, setTabIndex] = useState(0);
  const [vehiculos, setVehiculos] = useState([]);
  const [dataRowEditNewTabs, setDataRowEditNewTabs] = useState({});
  const [dataRowEditNewFoto, setDataRowEditNewFoto] = useState({});
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);


  const [filtroLocal, setFiltroLocal] = useState({
    TransportePasajeros: "S",
  });

  //Recuperar-Desde-Mennu-RutaArchivo.
  const [pathFile, setPathFile] = useState();
  //Datos principales
  const [selected, setSelected] = useState({});

  const handleChange = (event, newValue) => {
    //Estado cambio de tabs
    setTabIndex(newValue);
  };

  const [isVisible, setIsVisible] = useState(false);
  const [instance, setInstance] = useState({});

  //FILTRO
  const [isFirstDataLoad, setIsFirstDataLoad] = useState(true);
  const [filterData, setFilterData] = useState({ ...initialFilter });
  const [refreshData, setRefreshData] = useState(false);
  const ds = new DataSource({ store: new ArrayStore({ data: [], key: 'RowIndex' }), reshapeOnPush: false });
  const [dataSource] = useState(ds);

  const refresh = () => dataSource.refresh();
  const resetLoadOptions = () => dataSource.resetLoadOptions();
  //FILTRO DE MARCAS

  //Configuración Botones
  const [accessButton, setAccessButton] = useState(defaultPermissions);

  const loadControlsPermission = () => {
    let buttonsPermissions = getButtonPermissions(dataMenu.objetos);
    let newTabs = setDisabledTabs(dataMenu.objetos, 5);
    setAccessButton({ ...accessButton, ...buttonsPermissions, Tabs: newTabs });
  }

  //++++++++Variable (totalRowIndex) para controlar bloqueo de tabs cuando se cambia de búsqueda de un registro en la grilla.++++++++++++++
  const [totalRowIndex, setTotalRowIndex] = useState(0);
  //:::::::::::::::::::::::::::::::::::::::::::::-funciones-:::::::::::::::::::::::::::::::::


  const nuevoRegistroTabs = () => {
    limpiarDatosVehiculo();
    setTituloTabs(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicionTabs(true);
    setTabIndex(1);
  };

  const cancelarEdicion = () => {
    setTabIndex(0);
    setModoEdicionTabs(false);
    setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
    limpiarDatosVehiculo();
  };

  const limpiarDatosVehiculo = () => {
    let nuevo = { Activo: "S" };
    setFotoPerfil("");
    setVarIdVehiculo("");
    setPlaca("");
    setDataRowEditNewTabs({ ...nuevo, esNuevoRegistro: true, isReadOnly: false, });
    setDataRowEditNewFoto({ ...nuevo, esNuevoRegistro: true, isReadOnly: false, });
  };

  const seleccionarRegistro = (dataRow) => {
    const { IdVehiculo, RowIndex, Placa, IdTipoVehiculo } = dataRow;
    setVarIdVehiculo(IdVehiculo);
    setVarIdTipoVehiculo(IdTipoVehiculo);
    setPlaca(Placa);
    setSelected(dataRow)
    obtenerFotoPerfilLocal(dataRow);
    setFocusedRowKey(RowIndex);
  };


  async function cargarVehiculo(IdVehiculo) {
    if (isNotEmpty(IdVehiculo)) {
      let vehiculo_tmp = await obtenerVehiculo({
        IdVehiculo,
        IdCliente: perfil.IdCliente,
        Placa: "",
      }).catch((err) => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      });
      return vehiculo_tmp;
    }
    return null;
  }

  async function verVehiculo(IdVehiculo) {
    setLoading(true);
    await cargarVehiculo(IdVehiculo).then(vehiculo => {
      if (vehiculo != null) {
        setDataRowEditNewTabs({
          ...vehiculo,
          esNuevoRegistro: false,
          isReadOnly: true,
        });
      }
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  const editarRegistro = async (dataRow) => {

    const { IdVehiculo, Placa } = dataRow;
    setVarIdVehiculo(IdVehiculo);
    setPlaca(Placa);
    let vehiculo = await cargarVehiculo(IdVehiculo);

    if (vehiculo != null) {
      setDataRowEditNewTabs({
        ...vehiculo,
        esNuevoRegistro: false,
        isReadOnly: false,
      });
      setTituloTabs(intl.formatMessage({ id: "ACTION.EDIT" }));
      setTabIndex(1);
      setModoEdicionTabs(true);

    }
  };

  const eliminarRegistro = async (dataRow) => {
    const { IdVehiculo } = dataRow;
    await eliminarVehiculo({
      IdCliente: perfil.IdCliente,
      IdVehiculo,
      IdUsuario: usuario.username,
    })
      .then(() => {
        handleSuccessMessages(
          intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" })
        );
      })
      .catch((err) => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      });
  };


  //Datos Principales
  const getInfo = () => {
    return [
      { text: [intl.formatMessage({ id: "COMMON.CODE" })], value: varIdVehiculo, colSpan: 2 },
      { text: [intl.formatMessage({ id: "ACCESS.PERSON.MARK.LICENSEPLATE" })], value: varPlaca, colSpan: 4 }
    ];
  };

  /***********************   FOTO   ********************************************** */
  function obtenerFotoPerfilLocal(dataRow) {
    const { FotoPC } = dataRow;
    setFotoPerfil(FotoPC)
  }

  async function obtenerVehiculoFoto(idVehiculo) {
    setLoading(true);

    if (isNotEmpty(idVehiculo)) {
      let vehiculoFoto = await obtenerFoto({
        IdVehiculo: idVehiculo,
        IdCliente: perfil.IdCliente,
      }).catch((err) => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });

      if (isNotEmpty(vehiculoFoto)) {
        setFotoPerfil(vehiculoFoto.FotoPC); //if (esPerfil)
        setDataRowEditNewFoto({ ...vehiculoFoto, esNuevoRegistro: false });
      } else {
        setFotoPerfil("");
        setDataRowEditNewFoto({ ...vehiculoFoto, esNuevoRegistro: true });
      }
    }
  }


  //Cong Doc
  async function obtenerConfiguracion() {
    let datosMenu = await serviceMenu.obtener({
      IdCliente: perfil.IdCliente,
      IdModulo: dataMenu.info.IdModulo,
      IdAplicacion: dataMenu.info.IdAplicacion,
      IdMenu: dataMenu.info.IdMenu //'0401'   
    });
    const { Repositorio } = datosMenu;
    setPathFile(Repositorio);
  }

  /***********************************************************************/
  useEffect(() => {
    //CargaGrillaInicial();
    obtenerConfiguracion();
    loadControlsPermission();
  }, []);


  //:::::::::::::::::::::::::::::::::::::::::::::-Configuración de tabs-:::::::::::::::::::::::::::::::::
  const titleHeaderToolbar = () => {
    let tabsTitles = [
      "",
      "",
      "ADMINISTRATION.CONTRACT.CONTRACT",
      "ACCESS.PERSON.MENU.REQUIREMENTS",
      "TRANSPORTE.SEATING.CONFIGURATION",
    ];
    
    let sufix = tabsTitles[tabIndex] !== "" ? (" - " + `${intl.formatMessage({ id: tabsTitles[tabIndex] })}`) : "";

    return `${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} ` + " " + sufix;
  }
  
  const tabsDisabled = () => {
    return isNotEmpty(varIdVehiculo) ? false : true;
  }

  const tabContent_VehiculoListPage = () => {
    return <VehiculoListPage
      data={vehiculos}
      nuevoRegistro={nuevoRegistroTabs}
      editarRegistro={editarRegistro}
      eliminarRegistro={eliminarRegistro}
      titulo={tituloTabs}
      seleccionarRegistro={seleccionarRegistro}
      focusedRowKey={focusedRowKey}
      setFocusedRowKey={setFocusedRowKey}
      showButtons={false}
      //=>..CustomerDataGrid
      filterData={filterData}
      setFilterData={setFilterData}
      isFirstDataLoad={isFirstDataLoad}
      setIsFirstDataLoad={setIsFirstDataLoad}
      dataSource={dataSource}
      refresh={refresh}
      resetLoadOptions={resetLoadOptions}
      refreshData={refreshData}
      setRefreshData={setRefreshData}
      filtroLocal = {filtroLocal}
      uniqueId={"VehiculoListPageTransportes"}
      setVarIdVehiculo={setVarIdVehiculo}
      totalRowIndex = {totalRowIndex}
      setTotalRowIndex={setTotalRowIndex}
      isModuloEmbarque = {true}

    />
  }

  const tabContent_VehiculoEditTabPage = () => {
    return <>
      <VehiculoEditPage
        dataRowEditNew={dataRowEditNewTabs}
        modoEdicion={modoEdicionTabs}
        cancelarEdicion={cancelarEdicion}
        titulo={tituloTabs}
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
        <AuditoriaPage dataRowEditNew={dataRowEditNewTabs} />
      )}
    </>
  }

  const tabContent_VehiculoContratoListPage = () => {
    return <>
      <VehiculoContratoIndexPage
        varIdVehiculo={varIdVehiculo}
        cancelarEdicion={cancelarEdicion}
        getInfo={getInfo}
        accessButton={accessButton}
        settingDataField={dataMenu.datos}
        selectedIndex={selected}
        ocultarEdit={true}
        showButtons={false}
      />
    </>
  }

  const tabContent_VehiculoRequisitoIndexPage = () => {
    return <>
      <VehiculoRequisitoIndexPage
        varIdVehiculo={varIdVehiculo}
        cancelarEdicion={cancelarEdicion}
        getInfo={getInfo}
        accessButton={accessButton}
        settingDataField={dataMenu.datos}
        idAplicacion={dataMenu.info.IdAplicacion}
        idModulo={dataMenu.info.IdModulo}
        idMenu={dataMenu.info.IdMenu}
      />
    </>
  }

  const tabContent_VehiculoAsientos = () => {
    return <>
       <VehiculoAsientos
        // varIdVehiculo={varIdVehiculo}
        // cancelarEdicion={cancelarEdicion}
        // getInfo={getInfo}
        // accessButton={accessButton}
        // settingDataField={dataMenu.datos}
        // pathFile={pathFile}

        CodigoVehiculo={varIdVehiculo}
        Placa={selected.Placa}
        cancelarEdicion={cancelarEdicion}
        getInfo={getInfo}
        showHeaderInformation={true}
      /> 
    </>
  }

  /************************************************************************/

  return (
    <> 
      <TabNavContainer
        title={intl.formatMessage({ id: "TRANSPORT.MAIN" })}
        //submenu={intl.formatMessage({ id: "CONFIG.MENU.TRANSPORTE.GESTIÓN" })}
        subtitle={`${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} `}        
        nombrebarra={titleHeaderToolbar()}
        tabIndex={tabIndex}
        handleChange={handleChange}
        componentTabsHeaders={[
          {
            label: intl.formatMessage({ id: "ACTION.LIST" }),
            icon: <FormatListNumberedIcon fontSize="large" />
          },
          {
            label: intl.formatMessage({ id: "ACCESS.VEHICLE.TAB" }),
            icon: <AvatarFoto size={classes.avatarSmall} id={"FotoPC"} imagenB64={fotoPerfil} />,
            onClick: (e) => { verVehiculo(varIdVehiculo) },
            className: classes.avatarContent,
            disabled: tabsDisabled()
          },
          {
            label: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CONTRACT" }),
            icon: <DescriptionIcon fontSize="large" />,
            disabled: !tabsDisabled() && accessButton.Tabs[2] ? false : true
          },
          {
            label: intl.formatMessage({ id: "ACCESS.PERSON.MENU.REQUIREMENTS" }),
            icon: <PlaylistAddCheckIcon fontSize="large" />,
            disabled: !tabsDisabled() && accessButton.Tabs[3] ? false : true
          },
          {
            label: intl.formatMessage({ id: "TRANSPORTE.SEATING.CONFIGURATION" }),
            icon: <SettingsIcon fontSize="large" />,
            disabled: !tabsDisabled() && accessButton.Tabs[4] ? false : true
          },

        ]}
        className={classes.tabContent}
        componentTabsBody={
          [
            tabContent_VehiculoListPage(),
            tabContent_VehiculoEditTabPage(),
            tabContent_VehiculoContratoListPage(),
            tabContent_VehiculoRequisitoIndexPage(),
            tabContent_VehiculoAsientos(),
          ]
        }
      />


    </>
  );
};




export default injectIntl(WithLoandingPanel(VehiculoIndexPage));
