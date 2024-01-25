import React, { useEffect, useState } from "react";

import {
  handleErrorMessages,
  handleSuccessMessages,
} from "../../../../store/ducks/notify-messages";
import {
  useStylesEncabezado,
  useStylesTab,
} from "../../../../store/config/Styles";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import { useSelector } from "react-redux";
import { isNotEmpty } from "../../../../../_metronic";
import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";
import {
  obtener,
  crear,
  actualizar,
  eliminar,
} from "../../../../api/administracion/posicion.api";
import PosicionListPage from "./PosicionListPage";
import PosicionEditPage from "./PosicionEditPage";

import { injectIntl } from "react-intl"; //Multi-idioma
import FormatListNumberedIcon from "@material-ui/icons/FormatListNumbered";
import ViewWeekIcon from "@material-ui/icons/ViewWeek";
import PeopleIcon from "@material-ui/icons/People";
import {
  servicioPersonaPosicion
} from "../../../../api/administracion/personaPosicion.api";
import PersonaPosicionListPage from "../persona/posicion/PersonaPosicionListOtroPage";

//-customerDataGrid
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';

import { getButtonPermissions, defaultPermissions, setDisabledTabs } from '../../../../../_metronic/utils/securityUtils'
import TabNavContainer from "../../../../partials/components/Tabs/TabNavContainer";
import Confirm from "../../../../partials/components/Confirm";

export const initialFilter = {
  Activo: 'S',
  IdCliente: '',
  IdFuncion: '',
  Funcion: '',
  IdUnidadOrganizativa: '',
  Contratista: 'N'
};

const PosicionIndexPage = (props) => {
  const { intl, setLoading, dataMenu } = props;
  const usuario = useSelector((state) => state.auth.user);
  const perfil = useSelector((state) => state.perfil.perfilActual);

  const [focusedRowKey, setFocusedRowKey] = useState();
  const [varIdPosicion, setIdPosicion] = useState("");
  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const [titulo, setTitulo] = useState(
    intl.formatMessage({ id: "ACTION.LIST" })
  );
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
  const classesEncabezado = useStylesEncabezado();

  const [selected, setSelected] = useState({});
  const [isVisible, setIsVisible] = useState(false);
  const [instance, setInstance] = useState({});

  /************************************************* */
  const [tabIndex, setTabIndex] = useState(0);
  const classes = useStylesTab();
  const [listarTabs, setListarTabs] = useState([]);
  const [varReadOnlyOptions, setVarOptReadListPosition] = useState("1");
  //*********************** ----- */
  const [modoEdicionTabs, setModoEdicionTabs] = useState(false);
  const [tituloTabs, setTituloTabs] = useState(
    intl.formatMessage({ id: "ACTION.LIST" })
  );

  //FILTRO- CustomerDataGrid
  const [isFirstDataLoad, setIsFirstDataLoad] = useState(true);
  const [refreshData, setRefreshData] = useState(false);
  const ds = new DataSource({ store: new ArrayStore({ data: [], key: 'RowIndex' }), reshapeOnPush: false });
  const [dataSource] = useState(ds);

  const refresh = () => dataSource.refresh();
  const resetLoadOptions = () => dataSource.resetLoadOptions();

  /**Configuración Botones**************************************** */
  const [accessButton, setAccessButton] = useState(defaultPermissions);

  const loadControlsPermission = () => {
    const numeroTabs = 3; //Nùmero de tab del formulario.
    let buttonsPermissions = getButtonPermissions(dataMenu.objetos);
    let newTabs = setDisabledTabs(dataMenu.objetos, numeroTabs);
    setAccessButton({ ...accessButton, ...buttonsPermissions, Tabs: newTabs });
  }

  //++++++++Variable (totalRowIndex) para controlar bloqueo de tabs cuando se cambia de búsqueda de un registro en la grilla.++++++++++++++
  const [totalRowIndex, setTotalRowIndex] = useState(0);
  //:::::::::::::::::::::::::::::::::::::::::::::-funciones-:::::::::::::::::::::::::::::::::


  async function handleChange(event, newValue) {
    setVarOptReadListPosition("0");
    if (newValue === 1) {
      setVarOptReadListPosition("1");
      await obtenerPosicion(selected);
    }

    setTabIndex(newValue);
  }

  const getInfo = () => {
    const { IdPosicion, Posicion } = selected;
    return [
      { text: [intl.formatMessage({ id: "COMMON.CODE" })], value: IdPosicion, colSpan: 2 },
      { text: [intl.formatMessage({ id: "ADMINISTRATION.POSITION" })], value: Posicion, colSpan: 4 }
    ];
  };

  async function listarPersonaPosicion() {
console.log("*** listarPersonaPosicion - INICIO");
    const { IdCliente, IdPosicion, IdUnidadOrganizativa } = selected;

    setModoEdicionTabs(false);
    setLoading(true);
    await servicioPersonaPosicion.listar({
      IdPersona: 0,
      IdCliente,
      IdCompania: "%",
      IdPosicion,
      IdUnidadOrganizativa,
      NumPagina: 0,
      TamPagina: 0,
    }).then(personaPosicions => {
      console.log("*** listarPersonaPosicion - FIN");
      setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
      setListarTabs(personaPosicions);
    }).catch((err) => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });
  }

  const seleccionarRegistroPersona = () => { };

  /************************************************* */
  async function agregarPosicion(data) {
    setLoading(true);
    const {
      IdCliente
      , IdPosicion
      , Posicion
      , IdTipoPosicion
      , IdDivision
      , IdUnidadOrganizativa
      , IdFuncion
      , IdPosicionPadre
      , Confianza
      , Fiscalizable
      , JefeUnidadOrganizativa
      , Activo
    } = data;
    let param = {
      IdCliente,
      IdUnidadOrganizativa: isNotEmpty(IdUnidadOrganizativa) ? IdUnidadOrganizativa.toUpperCase() : "",
      IdTipoPosicion: isNotEmpty(IdTipoPosicion) ? IdTipoPosicion.toUpperCase() : "",
      IdDivision: isNotEmpty(IdDivision) ? IdDivision : "",
      IdFuncion: isNotEmpty(IdFuncion) ? IdFuncion.toUpperCase() : "",
      IdPosicion: isNotEmpty(IdPosicion) ? IdPosicion.toUpperCase() : "",
      Posicion: isNotEmpty(Posicion) ? Posicion.toUpperCase() : "",
      Confianza: Confianza ? "S" : "N",
      Fiscalizable: Fiscalizable ? "S" : "N",
      Contratista: "N",
      IdPosicionPadre: isNotEmpty(IdPosicionPadre) ? IdPosicionPadre : "",
      JefeUnidadOrganizativa: isNotEmpty(JefeUnidadOrganizativa) ? JefeUnidadOrganizativa : "",
      Activo,
      IdUsuario: usuario.username,
    };
    await crear(param)
      .then((response) => {
        if (response)
          handleSuccessMessages(
            intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" })
          );
        listarPosiciones(data);
      })
      .catch((err) => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
  }

  async function actualizarPosicion(posicion) {
    setLoading(true);

    const {
      IdCliente
      , IdPosicion
      , Posicion
      , IdTipoPosicion
      , IdDivision
      , IdUnidadOrganizativa
      , IdFuncion
      , IdPosicionPadre
      , Confianza
      , Fiscalizable
      , JefeUnidadOrganizativa
      , Activo
    } = posicion;
    let params = {
      IdCliente,
      IdUnidadOrganizativa: isNotEmpty(IdUnidadOrganizativa) ? IdUnidadOrganizativa.toUpperCase() : "",
      IdTipoPosicion: isNotEmpty(IdTipoPosicion) ? IdTipoPosicion.toUpperCase() : "",
      IdDivision: isNotEmpty(IdDivision) ? IdDivision : "",
      IdFuncion: isNotEmpty(IdFuncion) ? IdFuncion.toUpperCase() : "",
      IdPosicion: isNotEmpty(IdPosicion) ? IdPosicion.toUpperCase() : "",
      Posicion: isNotEmpty(Posicion) ? Posicion.toUpperCase() : "",
      Confianza: Confianza ? "S" : "N",
      Fiscalizable: Fiscalizable ? "S" : "N",
      Contratista: "N",
      IdPosicionPadre: isNotEmpty(IdPosicionPadre) ? IdPosicionPadre : "",
      JefeUnidadOrganizativa: isNotEmpty(JefeUnidadOrganizativa) ? JefeUnidadOrganizativa : "",
      Activo,
      IdUsuario: usuario.username,
    };
    await actualizar(params)
      .then(() => {
        handleSuccessMessages(
          intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" })
        );
        listarPosiciones(posicion);

      })
      .catch((err) => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
  }

  async function eliminarRegistro(dataRow, confirm) {
    setSelected(dataRow);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdPosicion } = selected;
      await eliminar(
        {
          IdCliente: perfil.IdCliente,
          IdPosicion: IdPosicion,
          IdUsuario: usuario.username,
        }
      ).then(response => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
      }).finally(() => { setLoading(false); });
      listarPosiciones();
    }
  }

  async function listarPosiciones(filtro) {
    setModoEdicion(false);
    setRefreshData(true);//Actualizar CustomDataGrid
    setTabIndex(0);
  }

  async function obtenerPosicion(filtro) {
    setLoading(true);
    const { IdPosicion, IdCliente, UnidadOrganizativa } = filtro;
    await obtener({
      IdPosicion,
      IdCliente
    }).then(posicion => {
      setDataRowEditNew({ ...posicion, esNuevoRegistro: false, UnidadOrganizativa });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }


  const nuevoRegistro = () => {
    console.log("***nuevoRegistro - INICIO");
    let posicion = {
      IdPosicion: "",
      IdCliente: perfil.IdCliente,
      IdDivision: perfil.IdDivision,
      IdUnidadOrganizativa: "",
      JefeUnidadOrganizativa: 'N',
      Activo: "S",
      Fiscalizable: "S"
    };
    setIdPosicion("");
    setSelected({});
    setDataRowEditNew({ ...posicion, esNuevoRegistro: true });
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
    setTabIndex(1);
    console.log("***nuevoRegistro - FIN");
  };

  const editarRegistro = async (dataRow) => {
    setModoEdicion(true);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    setTabIndex(1);
    await obtenerPosicion(dataRow);
  };

  const cancelarEdicion = () => {
    retornarAlListado();
  };

  const retornarAlListado = () => {
    setModoEdicion(false);
    setDataRowEditNew({});
    setIdPosicion("");
    setSelected({});
    setTabIndex(0);
  };
  const seleccionarRegistro = (dataRow) => {
    const { RowIndex, IdPosicion } = dataRow;
    setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
    if (IdPosicion != varIdPosicion) {
      setIdPosicion(IdPosicion);
      setSelected(dataRow);
      setFocusedRowKey(RowIndex);
    }
  };

  const verRegistroDblClick = async (dataRow) => {
    setTabIndex(1);
    setModoEdicion(false);
    await obtenerPosicion(dataRow);
  };


  useEffect(() => {
    loadControlsPermission();
  }, []);

  //:::::::::::::::::::::::::::::::::::::::::::::-Configuración de tabs-:::::::::::::::::::::::::::::::::
  const titleHeaderToolbar = () => {
    let tabsTitles = [
      "",
      "",
      "ADMINISTRATION.ORGANIZATIONALUNIT.PERSONS.TAB"
    ];

    let sufix = tabsTitles[tabIndex] !== "" ? (" - " + `${intl.formatMessage({ id: tabsTitles[tabIndex] })}`) : "";


    return `${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} ` + " " + sufix;
  }
  const tabsDisabled = () => {
    return isNotEmpty(varIdPosicion) ? false : true;
  }

  const tabContent_PosicionListPage = () => {
    return <PosicionListPage
      editarRegistro={editarRegistro}
      eliminarRegistro={eliminarRegistro}
      nuevoRegistro={nuevoRegistro}
      seleccionarRegistro={seleccionarRegistro}
      focusedRowKey={focusedRowKey}
      setFocusedRowKey={setFocusedRowKey}
      verRegistroDblClick={verRegistroDblClick}
      getInfo={getInfo}
      showHeaderInformation={false}
      selected={{ IdUnidadOrganizativa: "" }}
      //Propiedades del customerDataGrid 
      uniqueId={"IndexPosicionesList"}
      isFirstDataLoad={isFirstDataLoad}
      setIsFirstDataLoad={setIsFirstDataLoad}
      dataSource={dataSource}
      refresh={refresh}
      resetLoadOptions={resetLoadOptions}
      refreshData={refreshData}
      setRefreshData={setRefreshData}
      setIdPosicion={setIdPosicion}
      totalRowIndex={totalRowIndex}
      setTotalRowIndex={setTotalRowIndex}
    />
  }

  const tabContent_PosicionEditPage = () => {
    return <>
      <PosicionEditPage
        titulo={titulo}
        modoEdicion={modoEdicion}
        dataRowEditNew={dataRowEditNew}
        actualizarPosicion={actualizarPosicion}
        agregarPosicion={agregarPosicion}
        cancelarEdicion={cancelarEdicion}
        accessButton={accessButton}
        settingDataField={dataMenu.datos}
      />
      <div className="col-12 d-inline-block">
        <div className="float-right">
          <ControlSwitch
            checked={auditoriaSwitch}
            onChange={(e) => {
              setAuditoriaSwitch(e.target.checked);
            }}
          />
          <b>
            {" "}
            {intl.formatMessage({
              id: "AUDIT.DATA",
            })}{" "}
          </b>
        </div>
      </div>
      {auditoriaSwitch && (
        <AuditoriaPage dataRowEditNew={dataRowEditNew} />
      )}
    </>
  }

  const tabContent_PersonaPosicionListPage = () => {
    return <>
      <>
        <PersonaPosicionListPage
          personaPosicions={listarTabs}
          readOnlyOptions={varReadOnlyOptions}
          cancelarEdicion={retornarAlListado}
          getInfo={getInfo}
          seleccionarRegistro={seleccionarRegistroPersona}
        />
      </>
    </>
  }

  //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  return (
    <>
      <TabNavContainer
        title={intl.formatMessage({ id: "ADMINISTRATION.POSITION.MENU" })}
        submenu={intl.formatMessage({ id: "ADMINISTRATION.POSITION.SUBMENU" })}
        subtitle={intl.formatMessage({ id: "ADMINISTRATION.POSITION.MAINTENANCE" })}
        nombrebarra={titleHeaderToolbar()}
        tabIndex={tabIndex}
        handleChange={handleChange}
        componentTabsHeaders={[
          {
            label: intl.formatMessage({ id: "ACTION.LIST" }),
            icon: <FormatListNumberedIcon fontSize="large" />,
            // onClick: () => { retornarAlListado() },
          },
          {
            label: intl.formatMessage({ id: "ADMINISTRATION.ORGANIZATIONALUNIT.POSITIONS.TAB" }),
            icon: <ViewWeekIcon fontSize="large" />,
            disabled: tabsDisabled()
          },
          {
            label: intl.formatMessage({ id: "ADMINISTRATION.POSITION.WORKER" }),
            icon: <PeopleIcon fontSize="large" />,
            onClick: (e) => { listarPersonaPosicion() },
            disabled: !tabsDisabled() && accessButton.Tabs[2] ? false : true
          }
        ]}
        className={classes.tabContent}
        componentTabsBody={
          [
            tabContent_PosicionListPage(),
            tabContent_PosicionEditPage(),
            tabContent_PersonaPosicionListPage()
          ]
        }
      />
      <Confirm
        message={intl.formatMessage({ id: "ALERT.REMOVE" })}
        isVisible={isVisible}
        setIsVisible={setIsVisible}
        setInstance={setInstance}
        onConfirm={() => eliminarRegistro(selected, true)}
        title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
        confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
        cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
      />
    </>


  );
};



export default injectIntl(WithLoandingPanel(PosicionIndexPage));
