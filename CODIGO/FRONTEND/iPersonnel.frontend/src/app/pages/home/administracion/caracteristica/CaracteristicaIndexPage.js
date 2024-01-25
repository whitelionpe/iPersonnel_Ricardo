import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";

import { isNotEmpty } from "../../../../../_metronic";
import { handleErrorMessages, handleSuccessMessages } from "../../../../store/ducks/notify-messages";
import { useStylesEncabezado, useStylesTab } from "../../../../store/config/Styles";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import Confirm from "../../../../partials/components/Confirm";
import { getButtonPermissions, defaultPermissions, setDisabledTabs } from '../../../../../_metronic/utils/securityUtils'

import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import WbIncandescentIcon from '@material-ui/icons/WbIncandescent';
import ScatterPlotIcon from '@material-ui/icons/ScatterPlot';

import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";

import { eliminar, obtener, listar, crear, actualizar } from "../../../../api/administracion/caracteristica.api";
import {
  eliminar as eliminarDetalle,
  obtener as obtenerDetalle,
  listar as listarDetalle,
  crear as crearDetalle,
  actualizar as actualizarDetalle
} from "../../../../api/administracion/caracteristicaDetalle.api";

import CaracteristicaListPage from "./CaracteristicaListPage";
import CaracteristicaEditPage from "./CaracteristicaEditPage";
import CaracteristicaDetalleListPage from "../caracteristicaDetalle/CaracteristicaDetalleListPage";
import CaracteristicaDetalleEditPage from "../caracteristicaDetalle/CaracteristicaDetalleEditPage";

// .::: Filtro CustonDataGrid Ini :::.
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
// .::: Filtro CustonDataGrid End :::.
import TabNavContainer from "../../../../partials/components/Tabs/TabNavContainer";

const CaracteristicaIndexPage = (props) => {
  const { intl, setLoading, dataMenu } = props;
  const usuario = useSelector(state => state.auth.user);
  const perfil = useSelector(state => state.perfil.perfilActual);
  const classesEncabezado = useStylesEncabezado();
  const classes = useStylesTab();

  const [caracteristicas, setCaracteristicas] = useState([]);
  const [varIdCaracteristica, setVarIdCaracteristica] = useState("");
  const [focusedRowKey, setFocusedRowKey] = useState(0);

  const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const [selected, setSelected] = useState({
    IdCliente: perfil.IdCliente
  });
  const [tabIndex, setTabIndex] = useState(0);
  const handleChange = (event, newValue) => { setTabIndex(newValue); };
  const [focusedRowKeyDetalle, setFocusedRowKeyDetalle] = useState();

  const [isVisible, setIsVisible] = useState(false);
  const [instance, setInstance] = useState({});

//++++++++Variable (totalRowIndex) para controlar bloqueo de tabs cuando se cambia de búsqueda de un registro en la grilla.++++++++++++++
const [totalRowIndex, setTotalRowIndex] = useState(0);

  //:::::::::::::::::::::::::::::::::::::::::::::-variables-caracteristica detalle-:::::::::::::::::::::::::::::::::
  const [tituloTabs, setTituloTabs] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  const [listarTabs, setListarTabs] = useState([]);

  // :::::: FILTRO- CustomerDataGrid INI ::::::
  const [isFirstDataLoad, setIsFirstDataLoad] = useState(true);
  const [refreshData, setRefreshData] = useState(false);

  const ds = new DataSource({ store: new ArrayStore({ data: [], key: 'RowIndex' }), reshapeOnPush: false });
  const [dataSource] = useState(ds);

  const refresh = () => dataSource.refresh();
  const resetLoadOptions = () => dataSource.resetLoadOptions();
  // :::::: FILTRO- CustomerDataGrid INI ::::::

  //::::Función Cracteristica:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  async function agregarCaracteristica(caracteristica) {
    setLoading(true);
    const { IdCaracteristica, Caracteristica, Alias, IdEntidad, Activo } = caracteristica;
    let params = {
      IdCaracteristica: isNotEmpty(IdCaracteristica) ? IdCaracteristica.toUpperCase() : "",
      Caracteristica: isNotEmpty(Caracteristica) ? Caracteristica.toUpperCase() : "",
      Alias: Alias.toUpperCase(),
      IdCliente: perfil.IdCliente,
      IdEntidad: IdEntidad,
      Activo: Activo,
      IdUsuario: usuario.username
    };
    await crear(params)
      .then(response => {
        if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
        setModoEdicion(false);
        listarCaracteristica();
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
      }).finally(() => { setLoading(false); });
  }

  async function actualizarCaracteristica(caracteristica) {
    setLoading(true);
    const { IdCaracteristica, Caracteristica, Alias, IdEntidad, Activo } = caracteristica;
    let params = {
      IdCaracteristica: isNotEmpty(IdCaracteristica) ? IdCaracteristica.toUpperCase() : "",
      Caracteristica: isNotEmpty(Caracteristica) ? Caracteristica.toUpperCase() : "",
      Alias: Alias.toUpperCase(),
      IdCliente: perfil.IdCliente,
      IdEntidad: IdEntidad,
      Activo: Activo,
      IdUsuario: usuario.username
    };
    await actualizar(params)
      .then(() => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
        setModoEdicion(false);
        listarCaracteristica();
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
      }).finally(() => { setLoading(false); });
  }

  async function eliminarRegistro(caracteristica, confirm) {
    setSelected(caracteristica);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdCaracteristica, IdCliente, IdDivision } = caracteristica;
      await eliminar({
        IdCaracteristica: IdCaracteristica,
        IdCliente: IdCliente,
        IdDivision: IdDivision,
        IdUsuario: usuario.username
      })
        .then(response => {
          handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
          setVarIdCaracteristica("");
          setFocusedRowKey();
        })
        .catch(err => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
        }).finally(() => { setLoading(false); });
      listarCaracteristica();
    }
  }

  async function listarCaracteristica() {
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    changeTabIndex(0);
    setRefreshData(true);//Actualizar CustomDataGrid
    setModoEdicion(false);

  }

  async function obtenerCaracteristica() {
    setLoading(true);
    const { IdCliente, IdCaracteristica } = selected;
    await obtener({
      IdCaracteristica,
      IdCliente
    }).then(caracteristica => {
      setDataRowEditNew({ ...caracteristica, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });

  }

  const nuevoRegistro = () => {
    changeTabIndex(1);
    let caracteristica = { Activo: "S" };
    setDataRowEditNew({ ...caracteristica, esNuevoRegistro: true });
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
    setVarIdCaracteristica("");
  };

  const editarRegistro = dataRow => {
    changeTabIndex(1);
    const { IdCaracteristica } = dataRow;
    setModoEdicion(true);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    obtenerCaracteristica(dataRow);
  };

  const cancelarEdicion = () => {
    changeTabIndex(0);
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
    setDataRowEditNew({});
  };


  const seleccionarRegistro = dataRow => {
    const { IdCaracteristica, RowIndex } = dataRow;
    setModoEdicion(false);
    setSelected(dataRow);
    setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
    if (IdCaracteristica != varIdCaracteristica) {
      setVarIdCaracteristica(IdCaracteristica);
      setFocusedRowKey(RowIndex);
    }
  };

  const verRegistroDblClick = async (dataRow) => {
    changeTabIndex(1);
    setModoEdicion(false);
    await obtenerCaracteristica(dataRow);
  };

  //Botones
  const [accessButton, setAccessButton] = useState(defaultPermissions);

  const loadControlsPermission = () => {
    const numeroTabs = 3;
    let buttonsPermissions = getButtonPermissions(dataMenu.objetos);
    let newTabs = setDisabledTabs(dataMenu.objetos, numeroTabs);
    setAccessButton({ ...accessButton, ...buttonsPermissions, Tabs: newTabs });
  }

  //:::::::::::::::::::::::::::::::::::::::::::::-funciones-caracteristica detalle-:::::::::::::::::::::::::::::::::
  async function listarCaracteristicaDetalle() {
    setLoading(true);
    setModoEdicion(false);
    await listarDetalle({
      IdCaracteristica: varIdCaracteristica,
      IdCliente: perfil.IdCliente,
      NumPagina: 0,
      TamPagina: 0
    }).then(caracteristicaDetalle => {
      setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
      setListarTabs(caracteristicaDetalle);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });

  }


  async function agregarCaracteristicaDetalle(caracteristicaDetalle) {
    setLoading(true);
    const { IdCaracteristica, IdCaracteristicaDetalle, CaracteristicaDetalle, Activo } = caracteristicaDetalle;

    let params = {
      IdCaracteristica: varIdCaracteristica,
      IdCliente: perfil.IdCliente,
      IdCaracteristicaDetalle: isNotEmpty(IdCaracteristicaDetalle) ? IdCaracteristicaDetalle.toUpperCase() : "",
      CaracteristicaDetalle: isNotEmpty(CaracteristicaDetalle) ? CaracteristicaDetalle.toUpperCase() : "",
      Activo: Activo,
      IdUsuario: usuario.username
    };
    await crearDetalle(params)
      .then(response => {
        if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
        listarCaracteristicaDetalle();
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
      }).finally(() => { setLoading(false); });
  }

  async function actualizarCaracteristicaDetalle(caracteristicaDetalle) {
    setLoading(true);
    const { IdCaracteristica, IdCaracteristicaDetalle, CaracteristicaDetalle, Activo } = caracteristicaDetalle;

    let params = {
      IdCaracteristica: varIdCaracteristica,
      IdCliente: perfil.IdCliente,
      IdCaracteristicaDetalle: isNotEmpty(IdCaracteristicaDetalle) ? IdCaracteristicaDetalle.toUpperCase() : "",
      CaracteristicaDetalle: isNotEmpty(CaracteristicaDetalle) ? CaracteristicaDetalle.toUpperCase() : "",
      Activo: Activo,
      IdUsuario: usuario.username
    };
    await actualizarDetalle(params)
      .then(response => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
        listarCaracteristicaDetalle();
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
      }).finally(() => { setLoading(false); });
  }


  const seleccionarRegistroDetalle = dataRow => {
    const { RowIndex } = dataRow;
    setFocusedRowKeyDetalle(RowIndex);
  };

  const nuevoRegistroDetalle = () => {
    let caracteristicaDetalle = {
      Activo: "S"
    };
    setDataRowEditNew({ ...caracteristicaDetalle, esNuevoRegistro: true });
    setTituloTabs(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
  };

  const editarRegistroDetalle = dataRow => {
    setModoEdicion(true);
    setTituloTabs(intl.formatMessage({ id: "ACTION.EDIT" }));
    obtenerCaracteristicaDetalle(dataRow);
  };

  const cancelarEdicionDetalle = () => {
    setModoEdicion(false);
    setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };

  async function obtenerCaracteristicaDetalle(filtro) {
    setLoading(true);
    const { IdCliente, IdCaracteristica, IdCaracteristicaDetalle } = filtro;
    await obtenerDetalle({
      IdCaracteristicaDetalle: IdCaracteristicaDetalle,
      IdCaracteristica: IdCaracteristica,
      IdCliente: IdCliente
    }).then(caracteristicaDetalle => {
      setDataRowEditNew({ ...caracteristicaDetalle, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });
  }

  async function eliminarRegistroDetalle(caracteristicaDetalle, confirm) {
    setSelected(caracteristicaDetalle);
    setIsVisible(true);
    if (confirm) {
      const { IdCliente, IdCaracteristica, IdCaracteristicaDetalle } = caracteristicaDetalle;
      await eliminarDetalle({
        IdCaracteristicaDetalle: IdCaracteristicaDetalle,
        IdCaracteristica: IdCaracteristica,
        IdCliente: IdCliente,
        IdUsuario: usuario.username
      })
        .then(response => {
          handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
        })
        .catch(err => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
        });
      listarCaracteristicaDetalle(caracteristicaDetalle);
    }
  }

  const changeTabIndex = (index) => {
    handleChange(null, index);
  }

  const getInfo = () => {
    const { IdCaracteristica, Caracteristica } = selected;
    return [
      { text: [intl.formatMessage({ id: "COMMON.CODE" })], value: IdCaracteristica, colSpan: 2 },
      { text: [intl.formatMessage({ id: "CARACTERÍSTICA" })], value: Caracteristica, colSpan: 4 }
    ];
  }


  async function eliminarListRowTab(selected, confirm) {
    let currentTab = tabIndex;
    switch (currentTab) {
      case 0:
        eliminarRegistro(selected, confirm);
        break;
      case 2:
        eliminarRegistroDetalle(selected, confirm);
        break;
    }
  }

  useEffect(() => {
    listarCaracteristica();
    loadControlsPermission();
  }, []);


  //:::::::::::::::::::::::::::::::::::::::::::::-Configuración de tabs-:::::::::::::::::::::::::::::::::
  const titleHeaderToolbar = () => {
    let tabsTitles = [
      "",
      "",
      "ADMINISTRATION.CHARACTERISTIC.DETAIL"
    ];

    let sufix = tabsTitles[tabIndex] !== "" ? (" - " + `${intl.formatMessage({ id: tabsTitles[tabIndex] })}`) : "";

    return `${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} ` + " " + sufix;
  }
  const tabsDisabled = () => {
    return isNotEmpty(varIdCaracteristica) ? true : false;

  }


  const tabContent_CaracteristicaListPage = () => {
    return <CaracteristicaListPage
      titulo={titulo}
      editarRegistro={editarRegistro}
      eliminarRegistro={eliminarRegistro}
      nuevoRegistro={nuevoRegistro}
      seleccionarRegistro={seleccionarRegistro}
      verRegistroDblClick={verRegistroDblClick}
      focusedRowKey={focusedRowKey}
      setFocusedRowKey={setFocusedRowKey}
      accessButton={accessButton}
      //::::::::::::::::::::::::::::::::::::::::
      isFirstDataLoad={isFirstDataLoad}
      setIsFirstDataLoad={setIsFirstDataLoad}
      dataSource={dataSource}
      refresh={refresh}
      resetLoadOptions={resetLoadOptions}
      refreshData={refreshData}
      setRefreshData={setRefreshData}
      showButtons={true}
      uniqueId={"ListarCaracteristicaIndexPage"}
    //::::::::::::::::::::::::::::::::::::::::
    setVarIdCaracteristica={setVarIdCaracteristica}
    totalRowIndex = {totalRowIndex}
    setTotalRowIndex={setTotalRowIndex}
    />
  }


  const tabContent_CaracteristicaEditTabPage = () => {
    return <>
      <CaracteristicaEditPage
        titulo={titulo}
        modoEdicion={modoEdicion}
        dataRowEditNew={dataRowEditNew}
        actualizarCaracteristica={actualizarCaracteristica}
        agregarCaracteristica={agregarCaracteristica}
        cancelarEdicion={cancelarEdicion}

        accessButton={accessButton}
        settingDataField={dataMenu.datos}
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

  const tabContent_CaracteristicaDetalleLitPage = () => {
    return <>

      {modoEdicion && (
        <>
          <CaracteristicaDetalleEditPage
            dataRowEditNew={dataRowEditNew}
            actualizarCaracteristica={actualizarCaracteristicaDetalle}
            agregarCaracteristica={agregarCaracteristicaDetalle}
            cancelarEdicion={cancelarEdicionDetalle}
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
          <CaracteristicaDetalleListPage
            caracteristicaDetalles={listarTabs}
            editarRegistro={editarRegistroDetalle}
            eliminarRegistro={eliminarRegistroDetalle}
            nuevoRegistro={nuevoRegistroDetalle}
            cancelarEdicion={cancelarEdicion}
            seleccionarRegistro={seleccionarRegistroDetalle}
            focusedRowKey={focusedRowKeyDetalle}
            getInfo={getInfo}
            accessButton={accessButton}
          />
        </>
      )}

    </>
  }

  return (
    <>
      <TabNavContainer
        title={intl.formatMessage({ id: "ADMINISTRATION.PERSON.MENU" })}
        submenu={intl.formatMessage({ id: "ADMINISTRATION.CHARACTERISTIC.SUBMENU" })}
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
            label: intl.formatMessage({ id: "IDENTIFICATION.ADDITIONAL.DATA" }),
            icon: <WbIncandescentIcon fontSize="large" />,
            onClick: (e) => { obtenerCaracteristica(selected) },
            disabled: !tabsDisabled()
          },
          {
            label: intl.formatMessage({ id: "ADMINISTRATION.CHARACTERISTIC.DETAIL" }),
            icon: <ScatterPlotIcon fontSize="large" />,
            onClick: (e) => { listarCaracteristicaDetalle() },
            disabled: tabsDisabled() && accessButton.Tabs[2] ? false : true
          }
        ]}
        className={classes.tabContent}
        componentTabsBody={
          [
            tabContent_CaracteristicaListPage(),
            tabContent_CaracteristicaEditTabPage(),
            tabContent_CaracteristicaDetalleLitPage()
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

export default injectIntl(WithLoandingPanel(CaracteristicaIndexPage));
