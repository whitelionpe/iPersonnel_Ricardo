import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import { useStylesEncabezado, useStylesTab, } from "../../../../store/config/Styles";
import AvatarFoto from "../../../../partials/content/avatarFoto";
import { isNotEmpty } from "../../../../../_metronic";
import { useSelector } from "react-redux";
import { getButtonPermissions, defaultPermissions, setDisabledTabs } from '../../../../../_metronic/utils/securityUtils'
import { handleErrorMessages } from "../../../../store/ducks/notify-messages";
//Doc
//import { obtener as obtenerMenu } from "../../../../api/sistema/menu.api";
import FormatListNumberedIcon from "@material-ui/icons/FormatListNumbered";
//import LocalShippingIcon from '@material-ui/icons/LocalShipping';
import AssignmentIcon from '@material-ui/icons/Assignment';
import DescriptionIcon from '@material-ui/icons/Description';

//Componentes:
import VehiculoListPage from "../../acreditacion/vehiculo/VehiculoListPage";
import VehiculoEditPage from "../../administracion/vehiculo/VehiculoEditPage";

import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";

//Api:
import { obtener as obtenerVehiculo } from "../../../../api/administracion/vehiculo.api";
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import TabNavContainer from "../../../../partials/components/Tabs/TabNavContainer";
import SolicitudIndexPage from "./solicitud/SolicitudIndexPage";
import VehiculoContratoIndexPage from "../../administracion/vehiculo/contrato/VehiculoContratoIndexPage";
//import { serviceRepositorio } from "../../../../api/sistema/repositorio.api";


export const initialFilter = {
  IdCliente: '',
  Activo: 'S',
  MostrarVehiculos:'1'
};

const VehiculoIndexPage = (props) => {
  const { intl, setLoading, dataMenu } = props;
  const numeroTabs = 4;
  const classesEncabezado = useStylesEncabezado();
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
  const [vehiculos, setVehiculos] = useState([]);
  const [dataRowEditNewTabs, setDataRowEditNewTabs] = useState({});
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);

  //Recuperar-Desde-Mennu-RutaArchivo.
  //const [pathFile, setPathFile] = useState();
  //Datos principales
  const [selected, setSelected] = useState({});
  //++++++++Variable (totalRowIndex) para controlar bloqueo de tabs cuando se cambia de búsqueda de un registro en la grilla.++++++++++++++
  const [totalRowIndex, setTotalRowIndex] = useState(0);

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
  //Configuración Botones
  const [accessButton, setAccessButton] = useState(defaultPermissions);

  const loadControlsPermission = () => {
    let buttonsPermissions = getButtonPermissions(dataMenu.objetos);
    let newTabs = setDisabledTabs(dataMenu.objetos, numeroTabs);
    setAccessButton({ ...accessButton, ...buttonsPermissions, Tabs: newTabs });
  }

  //:::::::::::::::::::::::::::::::::::::::::::::-funciones-:::::::::::::::::::::::::::::::::

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
    //setDataRowEditNewDato({ ...nuevo, esNuevoRegistro: true, isReadOnly: false, });
  };

  const seleccionarRegistro = async (dataRow) => {
    //debugger;
    const { IdVehiculo, RowIndex, Placa, IdTipoVehiculo } = dataRow;
    setSelected(dataRow)
    setVarIdVehiculo(IdVehiculo);
    setVarIdTipoVehiculo(IdTipoVehiculo);
    setPlaca(Placa);
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


  //Datos Principales
  const getInfo = () => {
    return [
      { text: [intl.formatMessage({ id: "COMMON.CODE" })], value: varIdVehiculo, colSpan: 2 },
      { text: [intl.formatMessage({ id: "ACCESS.PERSON.MARK.LICENSEPLATE" })], value: varPlaca, colSpan: 4 }
    ];
  };



  //Cong Doc
  async function obtenerConfiguracion() {
    // let datosMenu = await serviceRepositorio.obtenerMenu({
    //   IdCliente: perfil.IdCliente,
    //   IdModulo: dataMenu.info.IdModulo,
    //   IdAplicacion: dataMenu.info.IdAplicacion,
    //   IdMenu: dataMenu.info.IdMenu //'0401'   
    // });
    // const { Repositorio } = datosMenu;
    // setPathFile(Repositorio);
  }

  /***********************************************************************/
  useEffect(() => {
    obtenerConfiguracion();
    loadControlsPermission();
  }, []);


  //:::::::::::::::::::::::::::::::::::::::::::::-Configuración de tabs-:::::::::::::::::::::::::::::::::
  const titleHeaderToolbar = () => {
    let tabsTitles = [
      "",
      "",
      "ADMINISTRATION.CONTRACT.CONTRACT",
      "ADMINISTRATION.REQUEST.TAB"
    ];

    let sufix = tabsTitles[tabIndex] !== "" ? (" - " + `${intl.formatMessage({ id: tabsTitles[tabIndex] })}`) : "";

    return `${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} ` + " " + sufix;
  }


  const tabsDisabled = () => {
    return isNotEmpty(varIdVehiculo) ? false : true;
    //return true;
  }

  const tabContent_VehiculoListPage = () => {
    return <VehiculoListPage
      data={vehiculos}
      titulo={tituloTabs}
      seleccionarRegistro={seleccionarRegistro}
      focusedRowKey={focusedRowKey}
      setFocusedRowKey={setFocusedRowKey}
      showButtons={false}
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


  const tabContent_VehiculoContrato = () => {
    return <>
      <VehiculoContratoIndexPage
        varIdVehiculo={varIdVehiculo}
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

  const tabContent_SolicitudListPage = () => {
    return <>
      <SolicitudIndexPage
        varPlaca={varPlaca}
        selectedIndex={selected}
        getInfo={getInfo}
        accessButton={accessButton}
        settingDataField={dataMenu.datos}
        cancelarEdicion={cancelarEdicion}
        dataMenu={dataMenu}
      />
    </>
  }




  /************************************************************************/

  return (
    <>
      <TabNavContainer
        title={intl.formatMessage({ id: "ACCREDITATION.MAIN" })}
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
            label: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CONTRACT" }),
            icon: < DescriptionIcon fontSize="large" />,
            disabled: !tabsDisabled() && accessButton.Tabs[2] ? false : true
          },
          {
            label: intl.formatMessage({ id: "ADMINISTRATION.REQUEST.TAB" }),
            icon: <AssignmentIcon fontSize="large" />,
            disabled: !tabsDisabled() && accessButton.Tabs[3] ? false : true
          }
        ]}
        className={classes.tabContent}
        componentTabsBody={
          [
            tabContent_VehiculoListPage(),
            tabContent_VehiculoEditTabPage(),
            tabContent_VehiculoContrato(),
            tabContent_SolicitudListPage()
          ]
        }
      />


    </>
  );
};


export default injectIntl(WithLoandingPanel(VehiculoIndexPage));
