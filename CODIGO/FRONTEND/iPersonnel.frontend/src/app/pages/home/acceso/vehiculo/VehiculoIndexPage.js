import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import { useStylesTab, } from "../../../../store/config/Styles";
import AvatarFoto from "../../../../partials/content/avatarFoto";
import { isNotEmpty } from "../../../../../_metronic";
import { useSelector } from "react-redux";
import { getButtonPermissions, defaultPermissions, setDisabledTabs } from '../../../../../_metronic/utils/securityUtils'
import {
  handleErrorMessages,
  handleSuccessMessages,
} from "../../../../store/ducks/notify-messages";
//Iconos:
import DirectionsCar from "@material-ui/icons/DirectionsCar";
import FormatListNumberedIcon from "@material-ui/icons/FormatListNumbered";
import PlaylistAddCheckIcon from '@material-ui/icons/PlaylistAddCheck';
import FindInPageIcon from '@material-ui/icons/FindInPage';
import GroupWorkIcon from '@material-ui/icons/GroupWork';
import PanToolIcon from '@material-ui/icons/PanTool';
import Description from "@material-ui/icons/Description";
import TouchAppIcon from "@material-ui/icons/TouchApp";
import SupervisedUserCircle from "@material-ui/icons/SupervisedUserCircle";
//Componentes:
import VehiculoListPage from "../../administracion/vehiculo/VehiculoListPage";
import VehiculoEditPage from "../../administracion/vehiculo/VehiculoEditPage";
import VehiculoFotoEditPage from "../../administracion/vehiculo/VehiculoFotoEditPage";

import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";

//Api:
import {
  obtener as obtenerVehiculo,
  eliminar as eliminarVehiculo,
} from "../../../../api/administracion/vehiculo.api";

import {
  obtener as obtenerFoto,
} from "../../../../api/administracion/vehiculoFoto.api";

import VehiculoRequisitoIndexPage from "./requisito/VehiculoRequisitoIndexPage";
import VehiculoExoneracionIndexPage from "./exoneracion/VehiculoExoneracionIndexPage";
import VehiculoGrupoIndexPage from "./grupo/VehiculoGrupoIndexPage";
import VehiculoRestriccionIndexPage from "./restriccion/VehiculoRestriccionIndexPage";
import VehiculoContratoIndexPage from "../../administracion/vehiculo/contrato/VehiculoContratoIndexPage";
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import TabNavContainer from "../../../../partials/components/Tabs/TabNavContainer";
import VehiculoMarcacionIndexPage from "./marcacion/VehiculoMarcacionIndexPage";
import PerfilIndexPage from "./perfil/PerfilIndexPage";


export const initialFilter = {
  IdCliente: '',
  Activo: 'S',
};

const VehiculoIndexPage = (props) => {
  const { intl, setLoading, dataMenu } = props;
  const classes = useStylesTab();
  const [focusedRowKey, setFocusedRowKey] = useState();
  const usuario = useSelector((state) => state.auth.user);
  const perfil = useSelector((state) => state.perfil.perfilActual);
  const [tituloTabs, setTituloTabs] = useState(
    intl.formatMessage({ id: "ACTION.LIST" })
  );

  const [modoEdicionTabs, setModoEdicionTabs] = useState(false);
  const [varIdVehiculo, setVarIdVehiculo] = useState("");
  const [varIdTipoVehiculo, setVarIdTipoVehiculo] = useState("");
  const [varPlaca, setPlaca] = useState("");
  const [fotoPerfil, setFotoPerfil] = useState("");
  const [tabIndex, setTabIndex] = useState(0);
  const [vehiculos] = useState([]);
  const [dataRowEditNewTabs, setDataRowEditNewTabs] = useState({});
  const [dataRowEditNewFoto, setDataRowEditNewFoto] = useState({});
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);

  //Datos principales
  const [selected, setSelected] = useState({});

  const handleChange = (event, newValue) => {
    //Estado cambio de tabs
    setTabIndex(newValue);
  };

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
    let newTabs = setDisabledTabs(dataMenu.objetos, 10);
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

  /***********************************************************************/
  useEffect(() => {
    loadControlsPermission();
  }, []);

  //:::::::::::::::::::::::::::::::::::::::::::::-Configuración de tabs-:::::::::::::::::::::::::::::::::
  const titleHeaderToolbar = () => {
    let tabsTitles = [
      "",
      "",
      "ACCESS.VEHICLE.PHOTO",
      "ADMINISTRATION.CONTRACT.CONTRACT",
      "ACCESS.PERSON.MENU.REQUIREMENTS",
      "ACCESS.PERSON.MENU.EXONERATION",
      "ACCESS.PERSON.MENU.PROFILE",
      "ACCESS.PERSON.MENU.GROUP",
      "ACCESS.PERSON.MENU.RESTRICTION",
      "ACCESS.PERSON.MARK.TAB"
    ];

    let sufix = tabsTitles[tabIndex] !== "" ? (` - ${intl.formatMessage({ id: tabsTitles[tabIndex] })}`) : "";

    return `${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} ${sufix}`;
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
      setVarIdVehiculo={setVarIdVehiculo}
      totalRowIndex = {totalRowIndex}
      setTotalRowIndex={setTotalRowIndex}
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

  const tabContent_VehiculoFotoPage = () => {
    return <>
      <VehiculoFotoEditPage
        cancelarEdicion={cancelarEdicion}
        dataRowEditNew={dataRowEditNewFoto}
        size={classes.avatarLarge}
        uploadImagen={false}
        idVehiculo={varIdVehiculo}
        getInfo={getInfo}

      />
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

  const tabContent_VehiculoExoneracionIndexPage = () => {
    return <>
      <VehiculoExoneracionIndexPage
        varIdVehiculo={varIdVehiculo}
        cancelarEdicion={cancelarEdicion}
        getInfo={getInfo}
        accessButton={accessButton}
        settingDataField={dataMenu.datos}
      />
    </>
  }

  
  const tabContent_VehiculoPerfilIndexPage = () => {
    return <>
      <PerfilIndexPage
        varIdVehiculo={varIdVehiculo}
        moduloCompania={selected}
        cancelarEdicion={cancelarEdicion}
        getInfo={getInfo}
        accessButton={accessButton}
        settingDataField={dataMenu.datos}
      />
    </>
  }


  const tabContent_VehiculoGrupoIndexPage = () => {
    return <>
      <VehiculoGrupoIndexPage
        varIdVehiculo={varIdVehiculo}
        cancelarEdicion={cancelarEdicion}
        getInfo={getInfo}
        accessButton={accessButton}
        settingDataField={dataMenu.datos}
      />
    </>
  }

  const tabContent_VehiculoRestriccionIndexPage = () => {
    return <>
      <VehiculoRestriccionIndexPage
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

  const tabContent_VehiculoMarcacionIndexPage = () => {
    return <>
      <VehiculoMarcacionIndexPage
        varIdVehiculo={varIdVehiculo}
        varIdTipoVehiculo={varIdTipoVehiculo}
        selectedIndex={selected}
        getInfo={getInfo}
        accessButton={accessButton}
        settingDataField={dataMenu.datos}
        cancelarEdicion={cancelarEdicion}
        showButtons={true}
      />
    </>
  }

  // console.log("accessButton:",accessButton);
  /************************************************************************/

  return (
    <> 
      <TabNavContainer
        title={intl.formatMessage({ id: "ACCESS.VEHICLE.MENU" })}
        submenu={intl.formatMessage({ id: "ACCESS.VEHICLE.SUBMENU" })}
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
            icon: <AvatarFoto size={classes.avatarSmall}
              id={"FotoPC"}
              imagenB64={fotoPerfil} />,
            onClick: (e) => { verVehiculo(varIdVehiculo) },
            className: classes.avatarContent,
            disabled: tabsDisabled()
          },
          {
            label: intl.formatMessage({ id: "ACCESS.VEHICLE.PHOTO" }),
            icon: <DirectionsCar fontSize="large" />,
            onClick: (e) => { obtenerVehiculoFoto(varIdVehiculo) },
            disabled: !tabsDisabled() && accessButton.Tabs[2] ? false : true
          },
          {
            label: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CONTRACT" }),
            icon: <Description fontSize="large" />,
            disabled: !tabsDisabled() && accessButton.Tabs[3] ? false : true
          },
          {
            label: intl.formatMessage({ id: "ACCESS.PERSON.MENU.REQUIREMENTS" }),
            icon: <PlaylistAddCheckIcon fontSize="large" />,
            disabled: !tabsDisabled() && accessButton.Tabs[4] ? false : true
          },
          {
            label: intl.formatMessage({ id: "ACCESS.PERSON.MENU.EXONERATION" }),
            icon: <FindInPageIcon fontSize="large" />,
            disabled: !tabsDisabled() && accessButton.Tabs[5] ? false : true
          },
          {
            label: intl.formatMessage({ id: "ACCESS.PERSON.MENU.PROFILE" }),
            icon: <SupervisedUserCircle fontSize="large" />,
            disabled: !tabsDisabled() && accessButton.Tabs[6] ? false : true
          },
          {
            label: intl.formatMessage({ id: "ACCESS.PERSON.MENU.GROUP" }),
            icon: <GroupWorkIcon fontSize="large" />,
            disabled: !tabsDisabled() && accessButton.Tabs[7] ? false : true
          },
          {
            label: intl.formatMessage({ id: "ACCESS.PERSON.MENU.RESTRICTION" }),
            icon: <PanToolIcon fontSize="large" />,
            disabled: !tabsDisabled() && accessButton.Tabs[8] ? false : true
          },
          {
            label: intl.formatMessage({ id: "ACCESS.PERSON.MARK.TAB" }),
            icon: <TouchAppIcon fontSize="large" />,
            disabled: !tabsDisabled() && accessButton.Tabs[9] ? false : true
          },
       
        ]}
        className={classes.tabContent}
        componentTabsBody={
          [
            tabContent_VehiculoListPage(),
            tabContent_VehiculoEditTabPage(),
            tabContent_VehiculoFotoPage(),
            tabContent_VehiculoContratoListPage(),
            tabContent_VehiculoRequisitoIndexPage(),
            tabContent_VehiculoExoneracionIndexPage(),
            tabContent_VehiculoPerfilIndexPage(),
            tabContent_VehiculoGrupoIndexPage(),
            tabContent_VehiculoRestriccionIndexPage(),
            tabContent_VehiculoMarcacionIndexPage(),
           
          ]
        }
      />

    </>
  );
};
export default injectIntl(WithLoandingPanel(VehiculoIndexPage));
