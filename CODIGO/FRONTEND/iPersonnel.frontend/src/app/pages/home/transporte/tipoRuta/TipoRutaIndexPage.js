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
import DirectionsBus from '@material-ui/icons/DirectionsBus';
import MergeType from '@material-ui/icons/MergeType';

import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";

import { service } from "../../../../api/transporte/tipoRuta.api";
import TipoRutaListPage from "./TipoRutaListPage";
import TipoRutaEditPage from "./TipoRutaEditPage";
import TabNavContainer from "../../../../partials/components/Tabs/TabNavContainer";

const TipoRutaIndexPage = (props) => {
  const { intl, setLoading, dataMenu } = props;
  const usuario = useSelector(state => state.auth.user);
  const classes = useStylesTab();

  const [listarTabs, setListarTabs] = useState([]);
  const [varIdTipoRuta, setVarIdTipoRuta] = useState("");
  const [focusedRowKey, setFocusedRowKey] = useState();

  const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const [selected, setSelected] = useState({});
  const [tabIndex, setTabIndex] = useState(0);
  const handleChange = (event, newValue) => { setTabIndex(newValue); };

  async function agregarTipoRuta(dataRow) {
    setLoading(true);
    const { IdTipoRuta, TipoRuta, Activo } = dataRow;
    let params = {
      IdTipoRuta: isNotEmpty(IdTipoRuta) ? IdTipoRuta.toUpperCase() : "",
      TipoRuta: isNotEmpty(TipoRuta) ? TipoRuta.toUpperCase() : "",
      Activo: Activo,
      IdUsuario: usuario.username
    };
    await service.crear(params)
      .then(response => {
        if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
        setModoEdicion(false);
        listarTipoRuta();
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
      }).finally(() => { setLoading(false); });
  }

  async function actualizarTipoRuta(dataRow) {
    setLoading(true);
    const { IdTipoRuta, TipoRuta, Activo } = dataRow;
    let params = {
      IdTipoRuta: IdTipoRuta.toUpperCase(),
      TipoRuta: TipoRuta.toUpperCase(),
      Activo: Activo,
      IdUsuario: usuario.username
    };
    await service.actualizar(params)
      .then(() => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
        setModoEdicion(false);
        listarTipoRuta();
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
      }).finally(() => { setLoading(false); });
  }

  async function eliminarRegistro(dataRow) {
    var response = await confirmAction(intl.formatMessage({ id: "ALERT.REMOVE" }),intl.formatMessage({ id: "COMMON.YES" }),intl.formatMessage({ id: "COMMON.NOT" }));
    if(response.isConfirmed){
      setLoading(true);
      const { IdTipoRuta} = dataRow;
      await service.eliminar({
        IdTipoRuta: IdTipoRuta
      })
        .then(response => {
          handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
          setVarIdTipoRuta("");
          setFocusedRowKey();
        })
        .catch(err => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
        }).finally(() => { setLoading(false); });
      listarTipoRuta();
    }
  }


  async function listarTipoRuta() {
    let data = await service.listar({
      NumPagina: 0,
      TamPagina: 0
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    });
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setListarTabs(data);
    changeTabIndex(0);
  }

  async function obtenerTipoRuta() {
    setLoading(true);
    const { IdTipoRuta } = selected;
    await service.obtener({
      IdTipoRuta
    }).then(TipoRuta => {
      setDataRowEditNew({ ...TipoRuta, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });

  }

  const nuevoRegistro = () => {
    changeTabIndex(1);
    let TipoRuta = { Activo: "S" };
    setDataRowEditNew({ ...TipoRuta, esNuevoRegistro: true });
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
    setVarIdTipoRuta("");
  };

  const editarRegistro = dataRow => {
    changeTabIndex(1);
    setModoEdicion(true);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    obtenerTipoRuta(dataRow);
  };

  const cancelarEdicion = () => {
    changeTabIndex(0);
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
    setDataRowEditNew({});
  };


  const seleccionarRegistro = dataRow => {
    const { IdTipoRuta, RowIndex } = dataRow;
    setModoEdicion(false);
    setSelected(dataRow);
    setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
    setVarIdTipoRuta(IdTipoRuta);
    setFocusedRowKey(RowIndex);
    
  };

  const verRegistroDblClick = async (dataRow) => {
    changeTabIndex(1);
    setModoEdicion(false);
    await obtenerTipoRuta(dataRow);
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
    listarTipoRuta();
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
    return isNotEmpty(varIdTipoRuta) ? true : false;

  }

  const tabContent_TipoRutaListPage = () => {
    return <TipoRutaListPage
      tipoRutas = {listarTabs}
      titulo={titulo}
      editarRegistro={editarRegistro}
      eliminarRegistro={eliminarRegistro}
      nuevoRegistro={nuevoRegistro}
      seleccionarRegistro={seleccionarRegistro}
      verRegistroDblClick={verRegistroDblClick}
      focusedRowKey={focusedRowKey}
      accessButton={accessButton}
    />
  }

  const tabContent_TipoRutaEditTabPage = () => {
    return <>
      <TipoRutaEditPage
        titulo={titulo}
        modoEdicion={modoEdicion}
        dataRowEditNew={dataRowEditNew}
        actualizarTipoRuta={actualizarTipoRuta}
        agregarTipoRuta={agregarTipoRuta}
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
            label: intl.formatMessage({ id: "TRANSPORTE.ROUTE.TYPE" }),
            icon: <MergeType fontSize="large" />,
            onClick: (e) => { obtenerTipoRuta(selected) },
            disabled: !tabsDisabled()
          }
        ]}
        className={classes.tabContent}
        componentTabsBody={
          [
            tabContent_TipoRutaListPage(),
            tabContent_TipoRutaEditTabPage()
          ]
        }
      />

    </>
  );
};

export default injectIntl(WithLoandingPanel(TipoRutaIndexPage));
