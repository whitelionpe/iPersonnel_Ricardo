import React, { useEffect, useState } from "react";
import { handleErrorMessages, handleSuccessMessages,handleInfoMessages, confirmAction } from "../../../../store/ducks/notify-messages";

import { useSelector } from "react-redux";
import { dateFormat, isNotEmpty } from "../../../../../_metronic";
import { service } from "../../../../api/transporte/manifiesto.api";
import { service as serviceManifiestoDetalle } from "../../../../api/transporte/manifiestoDetalle.api";

import ManifiestoListPage from "./ManifiestoListPage";
import ManifiestoEditPage from "./ManifiestoEditPage";
import ManifiestoAsientos from "./ManifiestoAsientos";
import ManifiestoAsignacion from "./ManifiestoAsignacion";
import ManifiestoReporte from "./ManifiestoReporte";

// import RutaParaderoIndex from "../rutaParadero/RutaParaderoIndex";

import {  useStylesTab } from "../../../../store/config/Styles";
import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";

import TabNavContainer from "../../../../partials/components/Tabs/TabNavContainer";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import { injectIntl } from "react-intl";

import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import { getButtonPermissions, defaultPermissions, setDisabledTabs } from '../../../../../_metronic/utils/securityUtils'
import AirportShuttle from '@material-ui/icons/AirportShuttle';
import AirlineSeatReclineNormal from '@material-ui/icons/AirlineSeatReclineNormal';
import ListAlt from '@material-ui/icons/ListAlt';
import Assignment from '@material-ui/icons/Assignment';

import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';

import TransporteManifiestoTrabajadoresObservados from "../../../../partials/components/transporte/popUps/TransporteManifiestoTrabajadoresObservados";


export const initialFilter = {
  IdCliente:'1',
	Activo: 'S',
  FechaInicio:new Date(),
};

const ManifiestoIndexPage = (props) => {
  const usuario = useSelector(state => state.auth.user);
  const { intl, setLoading, dataMenu } = props;

  const classes = useStylesTab();

  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [paraderos, setParaderos] = useState([]);
  const [dataParaderosPorRuta] = useState([]);
  const [varIdManifiesto, setVarIdManifiesto] = useState("");
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
  const [dataParaderosSeleccionados, setDataParaderosSeleccionados] = useState([]);
  const [tabIndex, setTabIndex] = useState(0);
  const [selected, setSelected] = useState({});

  const [listarTabs, setListarTabs] = useState([]);
  const handleChange = (event, newValue) => { setTabIndex(newValue); };
  const [focusedRowKey, setFocusedRowKey] = useState();

  const [asignacion, setAsignacion] = useState([]);
	const [numeroAsientosAsignados, setNumeroAsientosAsignados] = useState();
	const [isVisibleTrabajadorObservado, setIsVisibleTrabajadorObservado] = useState(false);
	const [trabajadoresObservados, setTrabajadoresObservados] = useState([]);
	const [dataReporteUrbanito, setDataReporteUrbanito] = useState([]);
    //++++++++Variable (totalRowIndex) para controlar bloqueo de tabs cuando se cambia de búsqueda de un registro en la grilla.++++++++++++++
  const [totalRowIndex, setTotalRowIndex] = useState(0);

	const [esModificable, setEsModificable] = useState(true);
    //::::::::::::::::::::: FILTRO ::::::::::::::::::::::::::::::::
    const [isFirstDataLoad, setIsFirstDataLoad] = useState(true);
    const [refreshData, setRefreshData] = useState(false);
    const ds = new DataSource({ store: new ArrayStore({ data: [], key: 'RowIndex' }), reshapeOnPush: false });
    const [dataSource] = useState(ds);
  
    const refresh = () => dataSource.refresh();
    const resetLoadOptions = () => dataSource.resetLoadOptions();
   //:::::::::::::::::::::  ::::::::::::::::::::::::::::::::

  /***********************[Función Ruta....]*********************************/
  const configurarRutaParadero = () => {
    changeTabIndex(2);
    setModoEdicion(true);
  }

  const seleccionarRegistro = data => {
    const { IdManifiesto, RowIndex,NumeroAsientosReservados,Cerrado,CerradoManual } = data;
    setSelected(data);
    // console.log("seleccionarRegistro|data:",data);
    setFocusedRowKey(RowIndex);
    setVarIdManifiesto(IdManifiesto);
   // ----------------------------------------
		if (NumeroAsientosReservados > 0 || Cerrado === 'S' || CerradoManual === 'S') {
			setEsModificable(true);
		} else {
			setEsModificable(false)
		}

  }

  const verRegistroDblClick = async () => {
    changeTabIndex(1);
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
    await obtenerRuta();
  };

  async function agregarManifiesto(dataRow) {
    // console.log("agregarManifiesto|dataRow:",dataRow);
    const {IdProgramacion, IdVehiculo, Unidad, IdPiloto, IdCopiloto, Cerrado, CerradoManual, Aprobado, IdUsuarioAprobador, RegistradoPiloto, RegistradoCopiloto, NumeroMaximoPasajeros, Kilometraje, Llegada,Activo } = dataRow;
    await service.crear({
        IdProgramacion: IdProgramacion.toUpperCase()
      , Unidad:  isNotEmpty(Unidad) ? Unidad.toUpperCase() : '' 
      , Cerrado: 'N' 
      , CerradoManual : 'N' 
      , Aprobado : 'N'  
      , RegistradoPiloto : 'N' 
      , RegistradoCopiloto: 'N'
      , IdUsuarioAprobador: ''
      , IdVehiculo:  isNotEmpty(IdVehiculo) ? IdVehiculo: 0 
      , IdPiloto :  isNotEmpty(IdPiloto) ? IdPiloto : 0 
      , IdCopiloto : isNotEmpty(IdCopiloto) ? IdCopiloto: null
      , NumeroMaximoPasajeros : isNotEmpty(NumeroMaximoPasajeros) ? NumeroMaximoPasajeros : 0
      // FechaEmbarque   --Preguntar en que momento se actuliza estos datos.
      // RegistradoVehiculo --Preguntar en que momento se actuliza estos datos.
      , Kilometraje : isNotEmpty(Kilometraje) ? Kilometraje : 0 
      // Salida --Preguntar en que momento se actuliza estos datos.
      , Llegada : ''
      , Activo : Activo
      , IdUsuarioCreacion : usuario.username
    }).then(response => {
      if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      setModoEdicion(false);
      setVarIdManifiesto("");
      listarManifiesto();
      changeTabIndex(0);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);

    });
  }


  async function actualizarManifiesto(dataRow) {
    const {IdManifiesto,IdProgramacion, IdVehiculo, Unidad, IdPiloto, IdCopiloto, Cerrado, CerradoManual, Aprobado, IdUsuarioAprobador, RegistradoPiloto, RegistradoCopiloto, NumeroMaximoPasajeros, Kilometraje, Llegada,Activo } = dataRow;
    // console.log("actualizarManifiesto|dataRow:",dataRow);
    await service.actualizar({
        IdManifiesto : IdManifiesto
      , IdProgramacion: IdProgramacion.toUpperCase()
      , Unidad: Unidad.toUpperCase()
      , Cerrado: Cerrado.toUpperCase()
      , CerradoManual : CerradoManual.toUpperCase()
      , Aprobado : Aprobado.toUpperCase()
      , RegistradoPiloto : 'N' 
      , RegistradoCopiloto: 'N'
      , IdUsuarioAprobador: ''
      , IdVehiculo: IdVehiculo
      , IdPiloto : IdPiloto
      , IdCopiloto : isNotEmpty(IdCopiloto) ? IdCopiloto: null
      , NumeroMaximoPasajeros :NumeroMaximoPasajeros
      // FechaEmbarque   --Preguntar en que momento se actuliza estos datos.
      // RegistradoVehiculo --Preguntar en que momento se actuliza estos datos.
      , Kilometraje : Kilometraje
      // Salida --Preguntar en que momento se actuliza estos datos.
      , Llegada : isNotEmpty(Llegada) ? dateFormat(Llegada, 'yyyyMMdd') : ''
      , Activo : Activo
      , IdUsuarioCreacion : usuario.username
    }).then(response => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      setModoEdicion(false);
      setVarIdManifiesto("");
      listarManifiesto();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);

    });
  }

  async function eliminarRegistro(dataRow) {
    var response = await confirmAction(intl.formatMessage({ id: "ALERT.REMOVE" }),intl.formatMessage({ id: "COMMON.YES" }),intl.formatMessage({ id: "COMMON.NOT" }));
    if(response.isConfirmed){
      const { IdManifiesto } = dataRow;
      await service.eliminar({IdManifiesto}).then(response => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
        setVarIdManifiesto("");
        setFocusedRowKey();
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
      });
      listarManifiesto();
    }
  }

  async function listarManifiesto() {
    // let data = await service.listar({IdManifiesto:'%',NumPagina:0 ,TamPagina:0});
    changeTabIndex(0);
    setRefreshData(true);
  }

  async function obtenerRuta() {
    setLoading(true);
    const { IdManifiesto } = selected;
    await service.obtener({
      IdManifiesto
    }).then(data => {
      setDataRowEditNew({ ...data, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });

  }

  async function nuevoRegistro() {
    let Manifiesto = { Activo: "S" , IdManifiesto: intl.formatMessage({ id: "COMMON.CODE.AUTO" }).toUpperCase() };
    setDataRowEditNew({...Manifiesto, esNuevoRegistro: true });
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
    setDataParaderosSeleccionados([]);
    changeTabIndex(1);
  };

  
  const editarRegistro = () => {
    changeTabIndex(1);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    obtenerRuta();
    setModoEdicion(true);
  };

  const cancelarEdicion = () => {
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    changeTabIndex(0);
    seleccionarRegistro(selected);
  };


  //  ::::::::::::::::::::::::::::::::::::::: Metodos Manifiesto Asignación :::::::::::::::::::::::::::::::::::::::::

   async function listarAsignacionAsientos(idManifiesto) {
	 	let asignacion = await serviceManifiestoDetalle.listar({
      IdManifiesto:idManifiesto,
      NumPagina :0,
      TamPagina: 0
     });

	 	setAsignacion(asignacion);
	 	setNumeroAsientosAsignados(asignacion.filter(x => x.NumeroDocumento != '').length);
     setModoEdicion(false)
	 }

	async function agregarManifiestoDetalle(arrayTrabajadores) {
		const { IdManifiesto } = selected
		const { IdParaderoOrigen, IdParaderoDestino } = dataRowEditNew

		let dataSelected = [];

		arrayTrabajadores.map((data) => {
      // console.log("agregarManifiestoDetalle|data",data);
			dataSelected.push({
				CodigoTrabajador: data.IdPersona,
				NombreCompleto: data.NombreCompleto,
				Documento: data.Documento,
				CodigoCompaniaContratista: data.IdCompania
			})
		});

		if (arrayTrabajadores.length > 0) {
			let params = {
				IdManifiesto: IdManifiesto,
				IdParaderoOrigen: IdParaderoOrigen,
				IdParaderoDestino: IdParaderoDestino,
				Pasajeros: dataSelected,
				CodigoCompaniaContratista: "",
				IdUsuario: usuario.username
			};
			await serviceManifiestoDetalle.asignarMasivo(params)
				.then((response) => {
          // console.log("agregarManifiestoDetalle|response:",response);
					if (response && response.length === 0) {
						 listarAsignacionAsientos(varIdManifiesto);
						handleSuccessMessages("Éxito!", "Se registró con éxito");
					} else {
						setTrabajadoresObservados(response);
						setIsVisibleTrabajadorObservado(true);
						 listarAsignacionAsientos(varIdManifiesto);
					}
				})
				.catch((err) => {
					handleErrorMessages("Alerta!", err);
				});
		}
	}

  // Metodos Urbanito
	// const generarReporte = idManifiesto => {
	// 	listarAsignacionAsientosUrbanito(idManifiesto);
	// 	listarCabeceraReporte(idManifiesto, varIdProgramacion);
	// 	// listarAsientos(idManifiesto);
	// }

  // async function listarCabeceraReporte(idProgramacion, idManifiesto) {
	// 	let cabeceraM = await service.listarReporteUrbano(idProgramacion, idManifiesto);
	// 	setCabecera(cabeceraM);
	// 	return cabeceraM;
	// }

  async function listarAsignacionAsientosUrbanito(idManifiesto) {
		await service.listarReporteUrbanito({
      IdManifiesto : idManifiesto,
      NumPagina : 0,
      TamPagina : 0,
    }).then(data => {
			//  console.log("listarAsignacionAsientosUrbanito|data:",data);
			setDataReporteUrbanito(data);
		}).catch(err => {
			 handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
		}).finally(() => { });
	}


  const getInfo = () => {
    const { IdManifiesto, Ruta, FechaProgramada, HoraProgramada, Placa, Unidad } = selected;
    return [
      { text: [intl.formatMessage({ id: "COMMON.CODE" })], value: IdManifiesto, colSpan: 1 },
      { text: [intl.formatMessage({ id: "TRANSPORTE.ROUTE" })], value: Ruta, colSpan: 1 },
      { text: [intl.formatMessage({ id: "TRANSPORTE.PROGRAMMING.DATE" })], value: FechaProgramada, colSpan: 1 },
      { text: [intl.formatMessage({ id: "ACCESS.PERSON.MARK.LICENSEPLATE" })], value: Placa, colSpan: 1 },
      { text: [intl.formatMessage({ id: "SYSTEM.REPOSITORY.UNIT" })], value: Unidad, colSpan: 1 },
    ];
  }

   //:::::::::::::::::::::::::::::::::::::::::::::-Configuración de tabs-:::::::::::::::::::::::::::::::::
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

   const titleHeaderToolbar = () => {
    let tabsTitles = [
      "",
      "",
      intl.formatMessage({ id: "TRANSPORTE.MANIFEST.SEATS" }),
      intl.formatMessage({ id:"TRANSPORTE.MANIFEST.ASSIGNMENT" }), 
      intl.formatMessage({ id:"COMMON.REPORT" }),
    ];
    let sufix = tabsTitles[tabIndex] !== "" ? (" - " + `${intl.formatMessage({ id: tabsTitles[tabIndex] })}`) : "";
    return `${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} ` + " " + sufix;
  }

  const tabsDisabled = () => {
    return isNotEmpty(varIdManifiesto) ? true : false;
  }

  useEffect(() => {
    loadControlsPermission();
    listarManifiesto();
  }, []);

  const tabContent_ManifiestoListPage = () => {
    return <>
      <ManifiestoListPage
        titulo={titulo}
        editarRegistro={editarRegistro}
        eliminarRegistro={eliminarRegistro}
        nuevoRegistro={nuevoRegistro}
        seleccionarRegistro={seleccionarRegistro}
        verRegistroDblClick={verRegistroDblClick}
        configurarRutaParadero={configurarRutaParadero}
        focusedRowKey={focusedRowKey}
        setFocusedRowKey={setFocusedRowKey}
        isFirstDataLoad={isFirstDataLoad}
        setIsFirstDataLoad={setIsFirstDataLoad}
        dataSource={dataSource}
        refresh={refresh}
        resetLoadOptions={resetLoadOptions}
        refreshData={refreshData}
        setRefreshData={setRefreshData}
        showButtons={true}
        uniqueId ={"ManifiestoListPage1"}
        setVarIdManifiesto={setVarIdManifiesto}
        totalRowIndex = {totalRowIndex}
        setTotalRowIndex={setTotalRowIndex}
        showHeaderInformation ={false}
        getInfo ={getInfo}
      />
    </>
  }

  const tabContent_ManifiestoEditPage = () => {
    return <>
        <ManifiestoEditPage
          modoEdicion={modoEdicion}
          setModoEdicion={setModoEdicion}
          dataRowEditNew={dataRowEditNew}
          setDataRowEditNew = {setDataRowEditNew}
          setDataParaderosSeleccionados={setDataParaderosSeleccionados}
          dataParaderosSeleccionados={dataParaderosSeleccionados}
          actualizarManifiesto={actualizarManifiesto}
          agregarManifiesto={agregarManifiesto}
          cancelarEdicion={cancelarEdicion}
          setTitulo={titulo}
          titulo={titulo}
          paraderos={paraderos}
          dataParaderosPorRuta={dataParaderosPorRuta}
          varIdManifiesto={varIdManifiesto}
          accessButton = {accessButton}
          settingDataField={dataMenu.datos}
          setRefreshData = {setRefreshData}
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

   const tabContent_ManifiestoAsientos = () => {
     return <>
         <ManifiestoAsientos
          //  selectedIndex={selected}
          //  modoEdicion={modoEdicion}
          //  cancelarEdicion={cancelarEdicion}
          //  accessButton = {accessButton}
          //  settingDataField={dataMenu.datos}
          esModificable={esModificable}
          IdManifiesto={varIdManifiesto}
          IdVehiculo={selected.IdVehiculo}
          FechaProgramacion={new Date(selected.FechaProgramacion)}
          // listarAsignacionAsientos={listarAsignacionAsientos}
          // asignacion={asignacion}
          // asientos={asientos}
          cancelarEdicion={cancelarEdicion}
          getInfo ={getInfo}
         />
     </>
   }

   const tabContent_ManifiestoAsignacion = () => {
    return <>
            <ManifiestoAsignacion
              asignacion={asignacion}
              cancelarEdicion={cancelarEdicion}
              agregarManifiestoDetalle={agregarManifiestoDetalle}
              varIdManifiesto={varIdManifiesto}
              fechaProgramacion={new Date(selected.fechaProgramacion)}
              dataRowEditNew={dataRowEditNew}
              setDataRowEditNew={setDataRowEditNew}
              selected={selected}
              numeroAsientosAsignados={numeroAsientosAsignados}
              getInfo ={getInfo}
            />

            {isVisibleTrabajadorObservado && (
              <TransporteManifiestoTrabajadoresObservados
                isVisible={isVisibleTrabajadorObservado}
                setIsVisible={setIsVisibleTrabajadorObservado}
                source={trabajadoresObservados}
              />
            )} 
    </>
  }

  const tabContent_ManifiestoReporte = () => {
    return <>
            <ManifiestoReporte
                dataReporteUrbanito={dataReporteUrbanito}
                // cabecera={[]} //{cabecera}
                cancelarEdicion={cancelarEdicion}
              />
          </>
  }

  return (
    <>
      <TabNavContainer
        title={intl.formatMessage({ id: "TRANSPORT.MAIN" })}
        submenu={intl.formatMessage({ id: "CONFIG.MENU.TRANSPORTE.GESTIÓN" })}
        subtitle={`${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} `}        
        nombrebarra={titleHeaderToolbar()}
        tabIndex={tabIndex}
        handleChange={handleChange}
        componentTabsHeaders={[
          {  
            label: intl.formatMessage({ id: "ACTION.LIST" }),
            icon: <FormatListNumberedIcon fontSize="large" />,
          },
          {
             label: intl.formatMessage({ id: "CONFIG.MENU.TRANSPORTE.MANIFIESTO" }),
             icon: <AirportShuttle fontSize="large" />,
             onClick: (e) => { obtenerRuta() },
             disabled: !tabsDisabled()
          },
          {
             label: intl.formatMessage({ id: "TRANSPORTE.MANIFEST.SEATS" }),
             icon: <AirlineSeatReclineNormal fontSize="large" />,
             onClick: () => { setModoEdicion(false) },
             disabled: !tabsDisabled()
           },
          {
             label: intl.formatMessage({ id: "TRANSPORTE.MANIFEST.ASSIGNMENT" }),
             icon: <ListAlt fontSize="large" />,
             onClick: () => {  listarAsignacionAsientos(varIdManifiesto) },
             disabled: !tabsDisabled()
           },    
           {
            label: intl.formatMessage({ id: "COMMON.REPORT" }),
            icon: <Assignment fontSize="large" />,
            onClick: () => {  listarAsignacionAsientosUrbanito(varIdManifiesto) },
            disabled: !tabsDisabled()
          }           
        ]}
        className={classes.tabContent}
        componentTabsBody={
          [
            tabContent_ManifiestoListPage(),
            tabContent_ManifiestoEditPage(),
            tabContent_ManifiestoAsientos(),
            tabContent_ManifiestoAsignacion(),
            tabContent_ManifiestoReporte(),

          ]
        }
      />

    </>
  );

};

export default injectIntl(WithLoandingPanel(ManifiestoIndexPage));
