import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";

import { isNotEmpty } from "../../../../../_metronic";
import { confirmAction, handleErrorMessages, handleSuccessMessages } from "../../../../store/ducks/notify-messages";
import { useStylesTab } from "../../../../store/config/Styles";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import Confirm from "../../../../partials/components/Confirm";
import { getButtonPermissions, defaultPermissions, setDisabledTabs } from '../../../../../_metronic/utils/securityUtils'

import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import DateRange from '@material-ui/icons/DateRange';

import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";

import { service } from "../../../../api/transporte/tipoProgramacion.api";
import TipoProgramacionListPage from "./TipoProgramacionListPage";
import TipoProgramacionEditPage from "./TipoProgramacionEditPage";
import TabNavContainer from "../../../../partials/components/Tabs/TabNavContainer";

const TipoProgramacionIndexPage = (props) => {
  const { intl, setLoading, dataMenu } = props;
  const usuario = useSelector(state => state.auth.user);
  const classes = useStylesTab();

  const [listarTabs, setListarTabs] = useState([]);
  const [varIdTipoProgramacion, setVarIdTipoProgramacion] = useState("");
  const [focusedRowKey, setFocusedRowKey] = useState();

  const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const [selected, setSelected] = useState({});
  const [tabIndex, setTabIndex] = useState(0);
  const handleChange = (event, newValue) => { setTabIndex(newValue); };

  
  
  async function agregarTipoProgramacion(dataRow) {
    console.log("agregarTipoProgramacion", dataRow);
    setLoading(true);
    const { IdTipoProgramacion, TipoProgramacion, Activo, IdCaracteristica, IdCaracteristicaDetalle, AplicaPara, AplicaCaracteristica } = dataRow;
    let params = {
      IdTipoProgramacion: isNotEmpty(IdTipoProgramacion) ? IdTipoProgramacion.toUpperCase() : "",
      TipoProgramacion: isNotEmpty(TipoProgramacion) ? TipoProgramacion.toUpperCase() : "",
      AplicaPara,
      AplicaCaracteristica: AplicaCaracteristica ? "S" : "N",
      IdCaracteristica: isNotEmpty(IdCaracteristica) ? IdCaracteristica : "",
      IdCaracteristicaDetalle: isNotEmpty(IdCaracteristicaDetalle) ? IdCaracteristicaDetalle : "",
      IdUsuario: usuario.username,
      Activo,
    };
    await service.crear(params)
      .then(response => {
        if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
        setModoEdicion(false);
        listarTipoProgramacion();
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
      }).finally(() => { setLoading(false); });
  }

  async function actualizarTipoProgramacion(dataRow) {
    console.log("actualizarTipoProgramacion", dataRow);
    setLoading(true);
    const { IdTipoProgramacion, TipoProgramacion, Activo, IdCaracteristica, IdCaracteristicaDetalle, AplicaPara, AplicaCaracteristica } = dataRow;
    let params = {
      IdTipoProgramacion: IdTipoProgramacion.toUpperCase(),
      TipoProgramacion: TipoProgramacion.toUpperCase(),
      AplicaPara,
      AplicaCaracteristica: AplicaCaracteristica ? "S" : "N",
      IdCaracteristica: isNotEmpty(IdCaracteristica) ? IdCaracteristica : "",
      IdCaracteristicaDetalle: isNotEmpty(IdCaracteristicaDetalle) ? IdCaracteristicaDetalle : "",

      Activo,
      IdUsuario: usuario.username
    };
    await service.actualizar(params)
      .then(() => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
        setModoEdicion(false);
        listarTipoProgramacion();
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
      }).finally(() => { setLoading(false); });
  }

  async function eliminarRegistro(dataRow) {
    var response = await confirmAction(intl.formatMessage({ id: "ALERT.REMOVE" }), intl.formatMessage({ id: "COMMON.YES" }), intl.formatMessage({ id: "COMMON.NOT" }));
    if (response.isConfirmed) {
      setLoading(true);
      const { IdTipoProgramacion } = dataRow;
      await service.eliminar({
        IdTipoProgramacion: IdTipoProgramacion
      })
        .then(response => {
          handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
          setVarIdTipoProgramacion("");
          setFocusedRowKey();
        })
        .catch(err => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
        }).finally(() => { setLoading(false); });
      listarTipoProgramacion();
    }
  }


  async function listarTipoProgramacion() {
    let data = await service.listar({
      IdTipoProgramacion: '%',
      NumPagina: 0,
      TamPagina: 0
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    });
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setListarTabs(data);
    changeTabIndex(0);
  }

  async function obtenerTipoProgramacion() {
    setLoading(true);
    const { IdTipoProgramacion } = selected;
    await service.obtener({
      IdTipoProgramacion
    }).then(response => {
     console.log(response);
      const { AplicaCaracteristica } = response;
     
      setDataRowEditNew({ ...response, esNuevoRegistro: false, AplicaCaracteristica: AplicaCaracteristica=="S"?true:false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });

  }

  const nuevoRegistro = () => {
    changeTabIndex(1);
    let TipoProgramacion = { Activo: "S", AplicaCaracteristica: false, IdTipoProgramacion: intl.formatMessage({ id: "COMMON.CODE.AUTO" }).toUpperCase() };
    setDataRowEditNew({ ...TipoProgramacion, esNuevoRegistro: true });
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
    setVarIdTipoProgramacion("");
  };

  const editarRegistro = dataRow => {
    changeTabIndex(1);
    setModoEdicion(true);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    obtenerTipoProgramacion(dataRow);
  };

  const cancelarEdicion = () => {
    changeTabIndex(0);
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
    setDataRowEditNew({});
  };


  const seleccionarRegistro = dataRow => {
    const { IdTipoProgramacion, RowIndex } = dataRow;
    setModoEdicion(false);
    setSelected(dataRow);
    setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
    setVarIdTipoProgramacion(IdTipoProgramacion);
    setFocusedRowKey(RowIndex);

  };

  const verRegistroDblClick = async (dataRow) => {
    changeTabIndex(1);
    setModoEdicion(false);
    await obtenerTipoProgramacion(dataRow);
  };

  //Botones
  const [accessButton, setAccessButton] = useState(defaultPermissions);

  const loadControlsPermission = () => {
    const numeroTabs = 3;
    let buttonsPermissions = getButtonPermissions(dataMenu.objetos);
    let newTabs = setDisabledTabs(dataMenu.objetos, numeroTabs);
    setAccessButton({ ...accessButton, ...buttonsPermissions, Tabs: newTabs });
  }

  const changeTabIndex = (index) => {
    handleChange(null, index);
  }

  useEffect(() => {
    listarTipoProgramacion();
    loadControlsPermission();
  }, []);


  //:::::::::::::::::::::::::::::::::::::::::::::-Configuración de tabs-:::::::::::::::::::::::::::::::::
  const titleHeaderToolbar = () => {
    let tabsTitles = [
      "",
      "",
    ];

    let sufix = tabsTitles[tabIndex] !== "" ? (" - " + `${intl.formatMessage({ id: tabsTitles[tabIndex] })}`) : "";

    return `${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} ` + " " + sufix;
  }
  const tabsDisabled = () => {
    return isNotEmpty(varIdTipoProgramacion) ? true : false;

  }

  const tabContent_TipoProgramacionListPage = () => {
    return <TipoProgramacionListPage
      dataTipoProgramacion={listarTabs}
      //titulo={titulo}
      editarRegistro={editarRegistro}
      eliminarRegistro={eliminarRegistro}
      nuevoRegistro={nuevoRegistro}
      seleccionarRegistro={seleccionarRegistro}
      verRegistroDblClick={verRegistroDblClick}
      focusedRowKey={focusedRowKey}
      accessButton={accessButton}
    />
  }

  const tabContent_TipoProgramacionEditTabPage = () => {
    return <>
      <TipoProgramacionEditPage
        titulo={titulo}
        modoEdicion={modoEdicion}
        dataRowEditNew={dataRowEditNew}
        actualizarTipoProgramacion={actualizarTipoProgramacion}
        agregarTipoProgramacion={agregarTipoProgramacion}
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

  return (
    <>
      <TabNavContainer
        title={intl.formatMessage({ id: "TRANSPORT.MAIN" })}
        submenu={intl.formatMessage({ id: "CONFIG.MENU.TRANSPORTE.CONFIGURACIÓN" })}
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
            label: intl.formatMessage({ id: "CONFIG.MENU.TRANSPORTE.TIPO_PROGRAMACIÓN" }),
            icon: <DateRange fontSize="large" />,
            onClick: (e) => { obtenerTipoProgramacion(selected) },
            disabled: !tabsDisabled()
          }
        ]}
        className={classes.tabContent}
        componentTabsBody={
          [
            tabContent_TipoProgramacionListPage(),
            tabContent_TipoProgramacionEditTabPage()
          ]
        }
      />

    </>
  );
};

export default injectIntl(WithLoandingPanel(TipoProgramacionIndexPage));
