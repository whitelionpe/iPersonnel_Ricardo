import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { handleErrorMessages} from "../../../../store/ducks/notify-messages";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import { getButtonPermissions, defaultPermissions, setDisabledTabs } from '../../../../../_metronic/utils/securityUtils'
import { useStylesTab } from "../../../../store/config/Styles";
import { useSelector } from "react-redux";
import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";

import { obtener } from "../../../../api/asistencia/persona.api";
import PersonaListPage from "../../acreditacion/persona/PersonaListPage";
import PersonaEditTabPage from "../../administracion/persona/PersonaEditTabPage";
import PersonaContratoIndexPage from "../../administracion/persona/contrato/PersonaContratoIndexPage";
import SolicitudIndexPage from "./solicitud/SolicitudIndexPage";
import AvatarFoto from "../../../../partials/content/avatarFoto";
import { isNotEmpty, TYPE_SISTEMA_ENTIDAD } from "../../../../../_metronic";
import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import AssignmentIcon from '@material-ui/icons/Assignment';
import DescriptionIcon from '@material-ui/icons/Description';

import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
//import { obtener as obtenerMenu } from "../../../../api/sistema/menu.api";
import TabNavContainer from "../../../../partials/components/Tabs/TabNavContainer";
import {
  servicePersona 
} from "../../../../api/administracion/persona.api";
//import { serviceRepositorio } from "../../../../api/sistema/repositorio.api";
export const initialFilter = {
  Activo: 'S',
  IdCliente: '',
  IdPersona: '',
  Condicion: 'TRABAJADOR',
  ControlarAsistencia: 'S',
  MostrarPersonas: "1"
};


const PersonaIndexPage = (props) => {
  const perfil = useSelector(state => state.perfil.perfilActual);

  const { intl, setLoading, dataMenu } = props;
  const numeroTabs = 4; //Definicion numero de tabs que contiene el formulario.

  const [varIdDocumento, setVarIdDocumento] = useState("");
  const [varIdCompania, setVarIdCompania] = useState("");
  const [varIdPersona, setVarIdPersona] = useState("");

  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
  const [focusedRowKey, setFocusedRowKey] = useState();
  const [selected, setSelected] = useState({});
  const classes = useStylesTab();
  const [tabIndex, setTabIndex] = useState(0);
  //const [pathFile, setPathFile] = useState();
  const [dataCombos, setDataCombos] = useState([]);

  const handleChange = (event, newValue) => {
    //Estado cambio de tabs
    setTabIndex(newValue);
  };
  const [fotoPerfil, setFotoPerfil] = useState("");
  const [fechaFinContrato, setFechaFinContrato] = useState();

  //FILTRO
  const [isFirstDataLoad, setIsFirstDataLoad] = useState(true);
  const [refreshData, setRefreshData] = useState(false);
  const ds = new DataSource({ store: new ArrayStore({ data: [], key: 'RowIndex' }), reshapeOnPush: false });
  const [dataSource] = useState(ds);

  const refresh = () => dataSource.refresh();
  const resetLoadOptions = () => dataSource.resetLoadOptions();

  const [filterData, setFilterData] = useState({ ...initialFilter });
  //++++++++Variable (totalRowIndex) para controlar bloqueo de tabs cuando se cambia de búsqueda de un registro en la grilla.++++++++++++++
  const [totalRowIndex, setTotalRowIndex] = useState(0);

  //:::::::::::::::::::::::::::::::::::::::::::::-Configuración de tabs-:::::::::::::::::::::::::::::::::
  const [accessButton, setAccessButton] = useState(defaultPermissions);

  const loadControlsPermission = () => {
    let buttonsPermissions = getButtonPermissions(dataMenu.objetos);
    let newTabs = setDisabledTabs(dataMenu.objetos, numeroTabs);
    setAccessButton({ ...accessButton, ...buttonsPermissions, Tabs: newTabs });
  }

  const titleHeaderToolbar = () => {
    let tabsTitles = [
      "", 
      "",
      "ADMINISTRATION.CONTRACT.CONTRACT",
      "ADMINISTRATION.REQUEST.TAB"
    ];

    let sufix = tabsTitles[tabIndex] !== "" ? (" - " + `${intl.formatMessage({ id: tabsTitles[tabIndex] })}`): "";
    //`${intl.formatMessage({ id: "ADMINISTRATION.PERSON.MAINTENANCE" })}   
    return `${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} ` + " " + sufix;
  }

  const tabsDisabled = () => {
    return isNotEmpty(varIdPersona) ? false : true;
  }

  //:::::::::::::::::::::::::::::::::::::::::::::-funciones-Persona-:::::::::::::::::::::::::::::::::

  async function cargarCombos() {
    setLoading(true);
     let array = [];
     setDataCombos([]);
    await servicePersona.listarCombosPersona({ IdPais: perfil.IdPais }).then(data => {
       array.push(data[0].filter(k => k.IdEntidad === TYPE_SISTEMA_ENTIDAD.PERSONAS)); // Combo Tipo Documentos 
       array.push(data[1]); // Combo Tipo de Sangre
       array.push(data[2]); // Combo Estado Civil 
       array.push(data[3]); // Combo Licencia Conducir
    setDataCombos(array);
    }).finally(() => { 
      setLoading(false);
    });    
}


  async function listadoPersonas() {
    setRefreshData(true);//Actualizar CustomDataGrid

    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    changeTabIndex(0);
    setModoEdicion(false);

  }


  async function obtenerPersona(filtro) {
    setLoading(true);
    let persona;
    const { IdPersona, IdCliente } = filtro;
    persona = await obtener({ IdPersona, IdCliente }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    });
    setDataRowEditNew({ ...persona, esNuevoRegistro: false });
    setLoading(false);

  }


  const cancelarEdicion = () => {
    changeTabIndex(0);
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };

  const seleccionarRegistro = async (dataRow) => {
    //debugger;
    const { Documento, IdCompania, RowIndex, FechaFinContrato, IdPersona } = dataRow;
    setSelected(dataRow);
    setFocusedRowKey(RowIndex);
    setVarIdDocumento(Documento);
    setVarIdCompania(IdCompania);
    setVarIdPersona(IdPersona);
    obtenerFotoPerfilLocal(dataRow);
    setFechaFinContrato(FechaFinContrato);
  }

  const verRegistroDblClick = async (dataRow) => {
    changeTabIndex(1);
    setModoEdicion(false);
    obtenerPersona(dataRow);
  };


  async function obtenerConfiguracion() {
    // let param = {
    //   IdCliente: perfil.IdCliente,
    //   IdPerfil: perfil.IdPerfil,
    //   IdModulo: dataMenu.info.IdModulo,
    //   IdAplicacion: dataMenu.info.IdAplicacion,
    //   IdMenu: dataMenu.info.IdMenu //'040401'
    // };
    // //Obtener Ruta  del servidor para subir archivos
    // await serviceRepositorio.obtenerMenu(param).then(datosMenu => {
    //   const { Repositorio } = datosMenu;
    //   setPathFile(Repositorio);
    // });

  }


  useEffect(() => {
    cargarCombos();
    loadControlsPermission();
    obtenerConfiguracion();
  }, []);


  //:::::::::::::::::::::::::::::::::::::::::::::-funciones-persona-foto:::::::::::::::::::::::::::::::::
  function obtenerFotoPerfilLocal(dataRow) {
    const { FotoPC } = dataRow;
    setFotoPerfil(FotoPC)
  }


  //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  //Datos Principales
  const getInfo = () => {
    const { IdPersona, NombreCompleto } = selected;
    return [
      { text: [intl.formatMessage({ id: "COMMON.CODE" })], value: IdPersona, colSpan: 2 },
      { text: [intl.formatMessage({ id: "ADMINISTRATION.PERSON.NAME" })], value: NombreCompleto, colSpan: 3 }
    ];
  }


  const changeTabIndex = (index) => {
    handleChange(null, index);
  }


  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::-Configuración - Tabs::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::


  const tabContent_PersonaListPage = () => {
    return <>
      <PersonaListPage
        titulo={titulo}
        showButtons={false}
        seleccionarRegistro={seleccionarRegistro}
        verRegistroDblClick={verRegistroDblClick}
        uniqueId={"acreditacionPersonaList"}
        focusedRowKey={focusedRowKey}
        setFocusedRowKey={setFocusedRowKey}
        isFirstDataLoad={isFirstDataLoad} 
        setIsFirstDataLoad={setIsFirstDataLoad}
        dataSource={dataSource}
        refresh={refresh}
        resetLoadOptions={resetLoadOptions}
        refreshData={refreshData}
        setRefreshData={setRefreshData}
        filterData={filterData}
        setFilterData={setFilterData}
        setVarIdPersona={setVarIdPersona}
        totalRowIndex = {totalRowIndex}
        setTotalRowIndex={setTotalRowIndex}

      />
    </>
  }

  const tabContent_PersonaEditPage = () => {
    return <>
      <PersonaEditTabPage
        modoEdicion={modoEdicion}
        titulo={titulo}
        dataRowEditNew={dataRowEditNew}
        idPersona={varIdPersona}
        setDataRowEditNew={setDataRowEditNew}
        cancelarEdicion={cancelarEdicion}
        //req y edit
        settingDataField={dataMenu.datos}
        accessButton={accessButton}
        getInfo={getInfo}
        dataCombos = {dataCombos}
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
  }


  const tabContent_PersonaContrato = () => {
    return <>
      <PersonaContratoIndexPage
        varIdPersona={varIdPersona}
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
        varIdDocumento={varIdDocumento}
        selectedIndex={selected}
        getInfo={getInfo}
        accessButton={accessButton}
        settingDataField={dataMenu.datos}
        cancelarEdicion={cancelarEdicion}
        dataMenu={dataMenu}
      />
    </>
  }



  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  return <>
      <TabNavContainer
        title={intl.formatMessage({ id: "ACCREDITATION.MAIN" })}
        subtitle={`${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} `}
        nombrebarra={titleHeaderToolbar()}
        tabIndex={tabIndex}
        handleChange={handleChange}
        componentTabsHeaders={[
          {
            label: intl.formatMessage({ id: "ACTION.LIST" }),
            icon: <FormatListNumberedIcon fontSize="large" />,
            disabled: false,
            // onClick: () => { listadoPersonas() }
          },
          {
            label: intl.formatMessage({ id: "ADMINISTRATION.PERSON" }),
            icon: <AvatarFoto size={classes.avatarSmall} id={"FotoPerfil"} imagenB64={fotoPerfil} />,
            className: classes.avatarContent,
            onClick: () => { obtenerPersona(selected) },
            disabled: tabsDisabled()
          },
          {
            label: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CONTRACT" }),
            icon: < DescriptionIcon fontSize="large" />,
            disabled: !tabsDisabled() && accessButton.Tabs[2] ? false : true
          },
          {
            label: intl.formatMessage({ id: "ADMINISTRATION.REQUEST.TAB" }),
            icon: <AssignmentIcon fontSize="large"/>,
            disabled: !tabsDisabled() && accessButton.Tabs[3] ? false : true
          }

        ]}
        className={classes.tabContent}
        componentTabsBody={
          [
            tabContent_PersonaListPage(),
            tabContent_PersonaEditPage(),
            tabContent_PersonaContrato(),
            tabContent_SolicitudListPage()
          ]
        }

      />

    </>
  

};


export default injectIntl(WithLoandingPanel(PersonaIndexPage));
