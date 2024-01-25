import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";

import PropTypes from 'prop-types';
import { isNotEmpty } from "../../../../../_metronic";
import { Portlet } from "../../../../partials/content/Portlet";
import { handleErrorMessages, handleSuccessMessages } from "../../../../store/ducks/notify-messages";
import { useStylesEncabezado, useStylesTab } from "../../../../store/config/Styles";
import CustomBreadcrumbs from "../../../../partials/layout/CustomBreadcrumbs";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import Confirm from "../../../../partials/components/Confirm";
import { getButtonPermissions, defaultPermissions, setDisabledTabs } from '../../../../../_metronic/utils/securityUtils'

import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import FolderSpecialIcon from '@material-ui/icons/FolderSpecial';
import StyleIcon from '@material-ui/icons/Style';
import TabNavContainer from "../../../../partials/components/Tabs/TabNavContainer";


import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";

// import HeaderInformation from "../../../../partials/components/HeaderInformation";

import { obtener, listar, crear, actualizar, eliminar } from "../../../../api/administracion/marca.api";
import MarcaListPage from "./MarcaListPage";
import MarcaEditPage from "./MarcaEditPage";

import {
  eliminar as eliminarDetalle,
  obtener as obtenerDetalle,
  listar as listarDetalle,
  crear as crearDetalle,
  actualizar as actualizarDetalle
} from "../../../../api/administracion/marcaModelo.api";
import MarcaModeloListPage from "../marcaModelo/MarcaModeloListPage";
import MarcaModeloEditPage from "../marcaModelo/MarcaModeloEditPage";


const MarcaIndexPage = (props) => {
  const { intl, setLoading, dataMenu } = props;
  const usuario = useSelector(state => state.auth.user);
  const perfil = useSelector(state => state.perfil.perfilActual);
  const classesEncabezado = useStylesEncabezado();
  const classes = useStylesTab();

  const [marcas, setMarcas] = useState([]);
  const [varIdMarca, setVarIdMarca] = useState("");
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

  const [isVisible, setIsVisible] = useState(false);
  const [instance, setInstance] = useState({});

  const [focusedRowKeyDetalle, setFocusedRowKeyDetalle] = useState();

  //::::::::::::::::::::::::-variables-modelo-::::::::::::::::::::::::::::::::://
  const [modoEdicionTabs, setModoEdicionTabs] = useState(false);
  const [dataRowEditNewTabs, setDataRowEditNewTabs] = useState({});
  const [tituloTabs, setTituloTabs] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  const [listarTabs, setListarTabs] = useState([]);

  //::::Función Marca:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  async function agregarMarca(marca) {
    setLoading(true);
    const { IdMarca, Marca, Activo } = marca;
    let params = {
      IdMarca: isNotEmpty(IdMarca) ? IdMarca.toUpperCase() : "",
      Marca: isNotEmpty(Marca) ? Marca.toUpperCase() : "",
      IdCliente: perfil.IdCliente,
      Activo: Activo,
      IdUsuario: usuario.username
    };
    await crear(params)
      .then(response => {
        if (response)
          handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
        setModoEdicion(false);
        listarMarca();
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
      }).finally(() => { setLoading(false); });
  }

  async function actualizarMarca(marca) {
    setLoading(true);
    const { IdMarca, Marca, Activo } = marca;
    let params = {
      IdMarca: isNotEmpty(IdMarca) ? IdMarca.toUpperCase() : "",
      Marca: isNotEmpty(Marca) ? Marca.toUpperCase() : "",
      IdCliente: perfil.IdCliente,
      Activo: Activo,
      IdUsuario: usuario.username
    };
    await actualizar(params)
      .then(response => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
        setModoEdicion(false);
        listarMarca();
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
      }).finally(() => { setLoading(false); });
  }

  async function eliminarRegistro(marca, confirm) {
    setSelected(marca);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdCliente, IdMarca } = marca;
      await eliminar({
        IdCliente: IdCliente,
        IdMarca: IdMarca,
        IdUsuario: usuario.username
      })
        .then(response => {
          handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
        })
        .catch(err => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
        }).finally(() => { setLoading(false); });
      listarMarca();
    }
  }

  async function listarMarca() {
    setLoading(true);
    await listar({
      IdCliente: perfil.IdCliente
    }).then(marca => {
      setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
      setMarcas(marca);
      changeTabIndex(0);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });

  }

  async function obtenerMarca() {
    setLoading(true);
    const { IdCliente, IdMarca } = selected;
    await obtener({
      IdCliente: IdCliente,
      IdMarca: IdMarca
    }).then(marca => {
      setDataRowEditNew({ ...marca, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });
  }


  const nuevoRegistro = () => {
    changeTabIndex(1);
    //const { IdCliente } = selected;
    let marca = { Activo: "S" };
    setDataRowEditNew({ ...marca, esNuevoRegistro: true });
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
    setVarIdMarca("");
  };

  const editarRegistro = dataRow => {
    changeTabIndex(1);
    const { IdMarca } = dataRow;
    setModoEdicion(true);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    obtenerMarca();
  };

  const cancelarEdicion = () => {
    changeTabIndex(0);
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
    setDataRowEditNewTabs({});
  };

  const seleccionarRegistro = dataRow => {
    const { IdMarca, RowIndex } = dataRow;
    setModoEdicion(false);
    setSelected(dataRow);
    setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
    if (IdMarca != varIdMarca) {
      setVarIdMarca(IdMarca);
      setFocusedRowKey(RowIndex);
    }
  };

  const verRegistroDblClick = async (dataRow) => {
    changeTabIndex(1);
    setModoEdicion(false);
    await obtenerMarca();
  };


  //Botones
  const [accessButton, setAccessButton] = useState(defaultPermissions);

  const loadControlsPermission = () => {
    const numeroTabs = 5;
    let buttonsPermissions = getButtonPermissions(dataMenu.objetos);
    let newTabs = setDisabledTabs(dataMenu.objetos, numeroTabs);
    setAccessButton({ ...accessButton, ...buttonsPermissions, Tabs: newTabs });
  }


  //:::Función Detalle Marca:::::::::::::::::::::::::::::::://

  async function listarMarcaModelo() {
    setLoading(true);
    setModoEdicionTabs(false);
    await listarDetalle({
      IdMarca: varIdMarca,
      IdCliente: perfil.IdCliente,
      NumPagina: 0,
      TamPagina: 0
    }).then(marcaModelo => {
      setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
      setListarTabs(marcaModelo);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });

  }


  async function agregarMarcaModelo(marcaModelo) {
    setLoading(true);
    const { IdModelo, IdMarca, Modelo, Activo } = marcaModelo;

    let params = {
      IdMarca: varIdMarca,
      IdModelo: isNotEmpty(IdModelo) ? IdModelo.toUpperCase() : "",
      Modelo: isNotEmpty(Modelo) ? Modelo.toUpperCase() : "",
      IdCliente: perfil.IdCliente,
      Activo: Activo,
      IdUsuario: usuario.username
    };
    await crearDetalle(params)
      .then(response => {
        if (response)
          handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
        listarMarcaModelo();
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
      }).finally(() => { setLoading(false); });
  }

  async function actualizarMarcaModelo(marcaModelo) {
    setLoading(true);
    const { IdModelo, IdMarca, Modelo, Activo } = marcaModelo;

    let params = {
      IdMarca: varIdMarca,
      IdModelo: isNotEmpty(IdModelo) ? IdModelo.toUpperCase() : "",
      Modelo: isNotEmpty(Modelo) ? Modelo.toUpperCase() : "",
      IdCliente: perfil.IdCliente,
      Activo: Activo,
      IdUsuario: usuario.username
    };
    await actualizarDetalle(params)
      .then(response => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
        listarMarcaModelo();
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
      }).finally(() => { setLoading(false); });
  }

  const nuevoRegistroDetalle = () => {
    let marcaModulo = {
      Activo: "S"
    };
    setDataRowEditNewTabs({ ...marcaModulo, esNuevoRegistro: true });
    setTituloTabs(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicionTabs(true);
  };

  const editarRegistroDetalle = dataRow => {
    setModoEdicionTabs(true);
    setTituloTabs(intl.formatMessage({ id: "ACTION.EDIT" }));
    obtenerMarcaModelo(dataRow);
  };

  const cancelarEdicionDetalle = () => {
    setModoEdicionTabs(false);
    setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNewTabs({});
  };

  async function obtenerMarcaModelo(filtro) {
    setLoading(true);
    const { IdCliente, IdMarca, IdModelo } = filtro;
    /* if (IdModelo) {
         let marcaModelo =*/
    await obtenerDetalle({
      IdCliente: IdCliente,
      IdModelo: IdModelo,
      IdMarca: IdMarca
    }).then(marcaModelo => {
      setDataRowEditNewTabs({ ...marcaModelo, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });
  }

  async function eliminarRegistroDetalle(marcaModelo, confirm) {
    setSelected(marcaModelo);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdMarca, IdModelo, IdCliente } = marcaModelo;
      await eliminarDetalle({
        IdModelo: IdModelo,
        IdMarca: IdMarca,
        IdCliente: IdCliente,
        IdUsuario: usuario.username
      })
        .then(() => {
          handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
        })
        .catch(err => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
        }).finally(() => { setLoading(false); });
      listarMarcaModelo(marcaModelo);
    }
  }


  const seleccionarRegistroDetalle = dataRow => {
    const { RowIndex } = dataRow;
    setFocusedRowKeyDetalle(RowIndex);
  };


  const changeTabIndex = (index) => {
    handleChange(null, index);
  }

  const getInfo = () => {
    const { IdMarca, Marca } = selected;
    return [
      { text: [intl.formatMessage({ id: "COMMON.CODE" })], value: IdMarca, colSpan: 2 },
      { text: [intl.formatMessage({ id: "MARCA" })], value: Marca, colSpan: 4 }
    ];
  }


  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

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
    listarMarca();
    loadControlsPermission();
  }, []);

  //:::::::::::::::::::::::::::::::::::::::::::::-Configuración de tabs-:::::::::::::::::::::::::::::::::
  const titleHeaderToolbar = () => {
    let tabsTitles = [
      "",
      "",
      "ADMINISTRATION.MODELBRAND.MODEL"
    ];

    let sufix = tabsTitles[tabIndex] !== "" ? (" - " + `${intl.formatMessage({ id: tabsTitles[tabIndex] })}`) : "";

    return `${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} ` + " " + sufix;
  }
  const tabsDisabled = () => {
    return isNotEmpty(varIdMarca) ? false : true;
    //return true;
  }



  const tabContent_MarcaListPage = () => {
    return<MarcaListPage
      marcas={marcas}
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


  const tabContent_MarcaEditTabPage = () => {
    return <>
      <MarcaEditPage
        titulo={titulo}
        modoEdicion={modoEdicion}
        dataRowEditNew={dataRowEditNew}
        actualizarMarca={actualizarMarca}
        agregarMarca={agregarMarca}
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

  const tabContent_MarcaModeloEditPage = () => {
    return <>
      {modoEdicionTabs && (
        <>
          <MarcaModeloEditPage
            dataRowEditNew={dataRowEditNewTabs}
            actualizarModelo={actualizarMarcaModelo}
            agregarModelo={agregarMarcaModelo}
            cancelarEdicion={cancelarEdicionDetalle}
            titulo={tituloTabs}
            getInfo={getInfo}
            modoEdicion={modoEdicionTabs}
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
          {auditoriaSwitch && (<AuditoriaPage dataRowEditNew={dataRowEditNewTabs} />)}
        </>
      )}
      {!modoEdicionTabs && (
        <>
          <MarcaModeloListPage
            marcaModelos={listarTabs}
            editarRegistro={editarRegistroDetalle}
            eliminarRegistro={eliminarRegistroDetalle}
            nuevoRegistro={nuevoRegistroDetalle}
            cancelarEdicion={cancelarEdicion}
            getInfo={getInfo}
            seleccionarRegistro={seleccionarRegistroDetalle}
            focusedRowKey={focusedRowKeyDetalle}
            accessButton={accessButton}
          />
        </>
      )}
    </>
  }


  return (
    <>

      <TabNavContainer
        title={intl.formatMessage({ id: "ADMINISTRATION.BRAND.MENU" })}
        submenu={intl.formatMessage({ id: "ADMINISTRATION.BRAND.SUBMENU" })}
        subtitle={intl.formatMessage({ id: "ADMINISTRATION.BRAND.MAINTENANCE" })}
        nombrebarra={titleHeaderToolbar()}
        tabIndex={tabIndex}
        handleChange={handleChange}
        componentTabsHeaders={[
          {
            label: intl.formatMessage({ id: "ACTION.LIST" }),
            icon: <FormatListNumberedIcon fontSize="large" />
          },
          {
            label: intl.formatMessage({ id: "ADMINISTRATION.BRAND.BRAND" }),
            icon: <FolderSpecialIcon fontSize="large" />,
            onClick: (e) => { obtenerMarca() },
            disabled: !tabsDisabled() && accessButton.Tabs[2] ? false : true
          },
          {
            label: intl.formatMessage({ id: "ADMINISTRATION.MODELBRAND.MODEL" }),
            icon: <StyleIcon fontSize="large" />,
            onClick: (e) => { listarMarcaModelo() },
            disabled: !tabsDisabled() && accessButton.Tabs[2] ? false : true
          }
        ]}
        className={classes.tabContent}
        componentTabsBody={
          [
             tabContent_MarcaListPage(),
             tabContent_MarcaEditTabPage(),
             tabContent_MarcaModeloEditPage()
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



export default injectIntl(WithLoandingPanel(MarcaIndexPage));
