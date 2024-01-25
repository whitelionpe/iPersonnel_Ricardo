import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";

import { isNotEmpty } from "../../../../../_metronic";
import { handleErrorMessages, handleSuccessMessages, handleInfoMessages } from "../../../../store/ducks/notify-messages";
import { useStylesEncabezado, useStylesTab } from "../../../../store/config/Styles";

import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import BuildIcon from '@material-ui/icons/Build';
import AccountTreeIcon from '@material-ui/icons/AccountTree';
import AssignmentTurnedInOutlinedIcon from '@material-ui/icons/AssignmentTurnedInOutlined';
import LocalShippingOutlinedIcon from '@material-ui/icons/LocalShippingOutlined';

import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";

import PerfilEditPage from "./PerfilEditPage";
import PerfilListPage from "./PerfilListPage";

import PersonIcon from '@material-ui/icons/Person';
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";

import {
  service as servicePerfil
} from "../../../../api/acreditacion/perfil.api";

import Confirm from "../../../../partials/components/Confirm";
import { getButtonPermissions, defaultPermissions, setDisabledTabs } from '../../../../../_metronic/utils/securityUtils'
import TabNavContainer from "../../../../partials/components/Tabs/TabNavContainer";
import EntidadDatoIndexPage from "../perfil/entidadDato/EntidadDatoIndexPage";
import PerfilDivisionIndexPage from "../perfil/division/PerfilDivisionIndexPage";
import PerfilRequisitoIndexPage from "../perfil/requisito/PerfilRequisitoIndexPage";
import PerfilTipoVehiculoIndexPage from "../perfil/tipoVehiculo/PerfilTipoVehiculoIndexPage";


//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
const PerfilIndexPage = (props) => {
  const { intl, setLoading, dataMenu } = props;
  const usuario = useSelector(state => state.auth.user);
  const perfil = useSelector(state => state.perfil.perfilActual);
  const [listarTabs, setListarTabs] = useState([]);

  const [varIdPerfil, setvarIdPerfil] = useState("");
  const [varVisita, setVisita] = useState("");
  const [varEntidadVehiculo, setVarEntidadVehiculo] = useState(false);

  const [instance, setInstance] = useState({});
  const [selected, setSelected] = useState({});
  const [selectedDelete, setSelectedDelete] = useState({});


  const [focusedRowKey, setFocusedRowKey] = useState(0);

  const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);

  //const classesEncabezado = useStylesEncabezado();
  const classes = useStylesTab();
  const [modoEdicion, setModoEdicion] = useState(false);

  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [tabIndex, setTabIndex] = useState(0);
  const handleChange = (event, newValue) => { setTabIndex(newValue); };
  const [isVisible, setIsVisible] = useState(false);


  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  useEffect(() => {
    listarPerfiles();
    loadControlsPermission();
  }, []);

  const getInfo = () => {

    return [
      { text: intl.formatMessage({ id: "COMMON.CODE" }), value: selected.IdPerfil, colSpan: 1 },
      { text: intl.formatMessage({ id: "ACCREDITATION.PROFILE" }), value: selected.Perfil, colSpan: 1 },
      { text: intl.formatMessage({ id: "ACCREDITATION.PROFILE.ENTITY.ASSIGNEDTO" }), value: selected.Entidad, colSpan: 1 }
    ];

  }

  const changeTabIndex = (index) => {
    handleChange(null, index);
  }


  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  //:::::::::::::-Perfil     :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  const listarPerfiles = async () => {
    //disabledTabs(true);
    setLoading(true);
    let perfilestmp = await servicePerfil.listar({ IdCliente: perfil.IdCliente }).finally(() => { setLoading(false); });
    setModoEdicion(false);
    setListarTabs(perfilestmp.map(x => ({ ...x, refreshdata: true, divisiones: [] })));
  }

  const cargarPerfil = async () => {
    setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
    let params = {
      IdCliente: perfil.IdCliente,
      IdPerfil: varIdPerfil
    };
    setLoading(true);
    let perfiltmp = await servicePerfil.obtener(params).finally(() => { setLoading(false); });
    setDataRowEditNew({ ...perfiltmp, esNuevoRegistro: false });
  }

  const cancelarEdicion = async () => {
    changeTabIndex(0);
    setModoEdicion(false);
    setDataRowEditNew({});
  }

  const editarRegistroPerfil = async (dataRow) => {
    let params = {
      IdCliente: perfil.IdCliente,
      IdPerfil: dataRow.IdPerfil
    };
    setLoading(true);
    let perfiltmp = await servicePerfil.obtener(params).finally(() => { setLoading(false); });
    setDataRowEditNew({ ...perfiltmp, esNuevoRegistro: false });
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    setModoEdicion(true);
  }

  const nuevoRegistroPerfil = async () => {
    let perfiltmp = { Activo: "S", Visita: "N", esNuevoRegistro: true };
    setDataRowEditNew(perfiltmp);
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
  }


  const verRegistroDblClickPerfil = async (dataRow) => {
    const { IdCliente, IdDivision } = dataRow;
    setLoading(true);
    let perfil = await servicePerfil.obtener({ IdCliente, IdDivision }).finally(() => { setLoading(false); });
    setDataRowEditNew({ ...perfil, esNuevoRegistro: false });
    setSelected(perfil);
    setvarIdPerfil(perfil.IdPerfil);
    changeTabIndex(1);
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
  }

  const seleccionarRegistroPerfil = (dataRow) => {
    //console.log("seleccionarRegistroPerfil", dataRow);
    const { IdPerfil, RowIndex, IdEntidad, Visita } = dataRow;
    setSelected(dataRow);
    setModoEdicion(false);
    setvarIdPerfil(IdPerfil);
    setVisita(Visita);
    setFocusedRowKey(RowIndex);
    setDataRowEditNew(dataRow);
    setVarEntidadVehiculo(IdEntidad === "V" ? true : false);

  }

  const agregarRegistroPerfil = async (dataRow) => {
    const { IdPerfil, Perfil, Alias, Descripcion, IdEntidad, TipoOperacion, Visita, Activo, IdPerfilAcceso } = dataRow;
    let params = {
      IdCliente: perfil.IdCliente,
      IdPerfil,
      Perfil: isNotEmpty(Perfil) ? Perfil.toUpperCase() : "",
      Alias: isNotEmpty(Alias) ? Alias.toUpperCase() : "",
      Descripcion: isNotEmpty(Descripcion) ? Descripcion.toUpperCase() : "",
      IdPerfilAcceso: isNotEmpty(IdPerfilAcceso) ? IdPerfilAcceso : "",
      IdEntidad: IdEntidad,
      TipoOperacion: TipoOperacion,
      Visita,
      Activo,
      IdUsuario: usuario.username,
    };
    setLoading(true);
    servicePerfil.crear(params).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      setModoEdicion(false);
      setDataRowEditNew({});
      listarPerfiles();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });

  }

  const actualizarRegistroPerfil = async (dataRow) => {
    const { IdPerfil, Perfil, Alias, Descripcion, IdEntidad, TipoOperacion, Visita, Activo, IdPerfilAcceso } = dataRow;
    let params = {
      IdCliente: perfil.IdCliente,
      IdPerfil,
      Alias: isNotEmpty(Alias) ? Alias.toUpperCase() : "",
      Perfil: isNotEmpty(Perfil) ? Perfil.toUpperCase() : "",
      Descripcion: isNotEmpty(Descripcion) ? Descripcion.toUpperCase() : "",
      IdEntidad,
      TipoOperacion: TipoOperacion,
      Visita,
      Activo,
      IdUsuario: usuario.username,
      IdPerfilAcceso: isNotEmpty(IdPerfilAcceso) ? IdPerfilAcceso : "",
    };

    setLoading(true);
    servicePerfil.actualizar(params).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      setModoEdicion(false);
      setDataRowEditNew({});
      setDataRowEditNew({ ...dataRow, esNuevoRegistro: false });
      listarPerfiles();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });

  }

  const eliminarRegistroPerfil = async (dataRow, confirm) => {
    setSelectedDelete(dataRow);
    setIsVisible(true);
    if (confirm) {
      let { IdCliente, IdPerfil } = dataRow;
      let params = {
        IdCliente,
        IdPerfil,
      };
      setLoading(true);
      await servicePerfil.eliminar(params).then(() => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
        setModoEdicion(false);
        setDataRowEditNew({});
        listarPerfiles();
        setvarIdPerfil("");
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
    }
  }

  /************--Configuración de acceso de botones*************/
  const [accessButton, setAccessButton] = useState(defaultPermissions);

  const loadControlsPermission = () => {
    let buttonsPermissions = getButtonPermissions(dataMenu.objetos);
    let newTabs = setDisabledTabs(dataMenu.objetos, 4);
    setAccessButton({ ...accessButton, ...buttonsPermissions, Tabs: newTabs });
  }

  //:::::::::::::::::::::::::::::::::::::::::::::-Configuración de tabs-:::::::::::::::::::::::::::::::::
  const titleHeaderToolbar = () => {
    let tabsTitles = [
      "",
      "ACCREDITATION.PROFILE.TAB",
      "ACCREDITATION.REQUIREMENT.CONFIGURE.DATA.TAB",
      "SYSTEM.DIVISIONS",
      "ACCESS.PERSON.REQUIREMENTS",
      "ADMINISTRATION.CONTRACT.TYPEVEHICLE"
    ];

    let sufix = tabsTitles[tabIndex] !== "" ? (" - " + `${intl.formatMessage({ id: tabsTitles[tabIndex] })}`) : "";
    return `${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} ` + " " + sufix;
  }

  const tabsDisabled = () => {
    return isNotEmpty(varIdPerfil) ? false : true;
    //return true;
  }

  const tabContent_PerfilListPage = () => {
    return <>
      {!modoEdicion && (
        <PerfilListPage
          editarRegistro={editarRegistroPerfil}
          eliminarRegistro={eliminarRegistroPerfil}
          showButton={true}
          getInfo={getInfo}
          nuevoRegistro={nuevoRegistroPerfil}
          perfiles={listarTabs}
          verRegistroDblClick={verRegistroDblClickPerfil}
          seleccionarRegistro={seleccionarRegistroPerfil}
          focusedRowKey={focusedRowKey}
        />
      )}
      {modoEdicion && (<>
        <PerfilEditPage
          dataRowEditNew={dataRowEditNew}
          modoEdicion={modoEdicion}
          titulo={titulo}
          cancelarEdicion={cancelarEdicion}
          setDataRowEditNew={setDataRowEditNew}
          agregar={agregarRegistroPerfil}
          actualizar={actualizarRegistroPerfil}
          accessButton={accessButton}
          settingDataField={dataMenu.datos}
          IdCliente={perfil.IdCliente}
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
      )}
    </>
  }

  const tabContent_PerfilEditPage = () => {
    return <>
      <PerfilEditPage
        dataRowEditNew={dataRowEditNew}
        modoEdicion={modoEdicion}
        titulo={titulo}
        cancelarEdicion={cancelarEdicion}
        setDataRowEditNew={setDataRowEditNew}
        agregar={agregarRegistroPerfil}
        actualizar={actualizarRegistroPerfil}
        IdCliente={perfil.IdCliente}
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

  const tabContent_PerfilDivisionIndexPage = () => {
    return <PerfilDivisionIndexPage
      varIdPerfil={varIdPerfil}
      varVisita={varVisita}
      selectedIndex={selected}
      cancelarEdicion={cancelarEdicion}
      getInfo={getInfo}
      accessButton={accessButton}
      settingDataField={dataMenu.datos}
    />
  }
  const tabContent_PerfilRequisitoIndexage = () => {
    return <PerfilRequisitoIndexPage
      varIdPerfil={varIdPerfil}
      selectedIndex={selected}
      cancelarEdicion={cancelarEdicion}
      getInfo={getInfo}
      accessButton={accessButton}
      settingDataField={dataMenu.datos}
    />
  }

  const tabContent_PerfilEntidadDatoListPage = () => {
    return <>
      <EntidadDatoIndexPage
        varIdPerfil={varIdPerfil}
        selected={selected}
        cancelarEdicion={cancelarEdicion}
        getInfo={getInfo}
        accessButton={accessButton}
        settingDataField={dataMenu.datos}
      />
    </>
  }

  const tabContent_PerfilTipoVehiculoiIndexage = () => {
    return <PerfilTipoVehiculoIndexPage
      varIdPerfil={varIdPerfil}
      selectedIndex={selected}
      cancelarEdicion={cancelarEdicion}
      getInfo={getInfo}
      accessButton={accessButton}
      settingDataField={dataMenu.datos}
    />
  }


  //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  return (
    <>
      <TabNavContainer
        title={intl.formatMessage({ id: "ACCREDITATION.REQUIREMENT.PATHNAME" })}
        subtitle={`${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} `}
        nombrebarra={titleHeaderToolbar()}
        tabIndex={tabIndex}
        handleChange={handleChange}
        componentTabsHeaders={[
          {
            label: intl.formatMessage({ id: "ACTION.LIST" }),
            icon: <FormatListNumberedIcon fontSize="large" />,
            onClick: () => { listarPerfiles() },
          },
          {
            label: intl.formatMessage({ id: "ACCREDITATION.PROFILE.TAB" }),
            icon: <PersonIcon fontSize="large" />,
            onClick: (e) => { cargarPerfil() },
            disabled: tabsDisabled()
          },
          {
            label: intl.formatMessage({ id: "ACCREDITATION.REQUIREMENT.CONFIGURE.DATA.TAB" }),
            icon: <BuildIcon fontSize="large" />,
            disabled: tabsDisabled(),//!tabsDisabled() && accessButton.Tabs[3] ? false : true,
            //onClick: (e) => { initialMethods() },
          },
          {
            label: intl.formatMessage({ id: "SYSTEM.DIVISIONS" }),
            icon: <AccountTreeIcon fontSize="large" />,
            disabled: tabsDisabled()
            //onClick: (e) => { goTabMenu() },
          },
          {
            label: intl.formatMessage({ id: "ACCESS.PERSON.REQUIREMENTS" }),
            icon: <AssignmentTurnedInOutlinedIcon fontSize="large" />,
            disabled: tabsDisabled()
            //onClick: (e) => { goTabMenu() },
          },
          {
            label: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.TYPEVEHICLE" }),
            icon: <LocalShippingOutlinedIcon fontSize="large" />,
            disabled: !tabsDisabled() && varEntidadVehiculo ? false : true
            //onClick: (e) => { goTabMenu() },
          }
        ]}
        className={classes.tabContent}
        componentTabsBody={
          [
            tabContent_PerfilListPage(),
            tabContent_PerfilEditPage(),
            tabContent_PerfilEntidadDatoListPage(),
            tabContent_PerfilDivisionIndexPage(),
            tabContent_PerfilRequisitoIndexage(),
            tabContent_PerfilTipoVehiculoiIndexage()
          ]
        }
      />
      <Confirm
        message={intl.formatMessage({ id: "ALERT.REMOVE" })}
        isVisible={isVisible}
        setIsVisible={setIsVisible}
        setInstance={setInstance}
        onConfirm={() => eliminarRegistroPerfil(selectedDelete, true)}
        title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
        confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
        cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
      />


    </>
  );
};

export default injectIntl(WithLoandingPanel(PerfilIndexPage));
