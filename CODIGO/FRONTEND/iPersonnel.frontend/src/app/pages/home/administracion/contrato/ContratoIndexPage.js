import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";
import AccountTreeIcon from "@material-ui/icons/AccountTree";
import { dateFormat, isNotEmpty } from "../../../../../_metronic";
import {
  handleErrorMessages,
  handleSuccessMessages,
  handleInfoMessages
} from "../../../../store/ducks/notify-messages";
import {
  useStylesEncabezado,
  useStylesTab
} from "../../../../store/config/Styles";
import Confirm from "../../../../partials/components/Confirm";

import FormatListNumberedIcon from "@material-ui/icons/FormatListNumbered";
import InsertDriveFile from "@material-ui/icons/InsertDriveFile";
import PeopleAltOutlinedIcon from "@material-ui/icons/PeopleAltOutlined";
import Description from "@material-ui/icons/Description";
import ListAltIcon from "@material-ui/icons/ListAlt";

import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";

import {
  obtener,
  crear,
  actualizar,
  eliminar
} from "../../../../api/administracion/contrato.api";

import { listar as listarContratoServicios } from "../../../../api/administracion/contratoServicio.api";

import ContratoListPage from "./ContratoListPage";
import ContratoEditPage from "./ContratoEditPage";
import ContratoDivisionListPage from "./division/ContratoDivisionListPage";
import ContratoDivisionEditPage from "./division/ContratoDivisionEditPage";
import ContratoDivisionOperadorEditPage from "./division/ContratoDivisionOperadorEditPage";

import ContratoSubcontratistaListPage from "./subContratista/ContratoSubcontratistaListPage";
import ContratoSubcontratistaEditPage from "./subContratista/ContratoSubcontratistaEditPage";
import ContratoAdendaListPage from "./adenda/ContratoAdendaListPage";
import ContratoAdendaEditPage from "./adenda/ContratoAdendaEditPage";
import ContratoUnidadOrganizativaListPage from "./unidadOrganizativa/ContratoUnidadOrganizativaListPage";
import ContratoUnidadOrganizativaEditPage from "./unidadOrganizativa/ContratoUnidadOrganizativaEditPage";
import ContratoCentroCostoEditPage from "./centroCosto/ContratoCentroCostoEditPage";
import ContratoVehiculoListPage from "./tipoVehiculo/ContratoVehiculoListPage";
import ContratoVehiculoEditPage from "./tipoVehiculo/ContratoVehiculoEditPage";

import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import { uploadFile } from "../../../../api/helpers/fileBase64.api";
//import { obtener as obtenerMenu } from "../../../../api/sistema/menu.api";
//import { obtener as obtenerMenuPersonalizado } from "../../../../api/sistema/menuPersonalizado.api";
import { servicioPersonaPosicion } from "../../../../api/administracion/personaPosicion.api";

import {
  obtener as obtenerDivision,
  listar as listarDivision,
  crear as crearDivision,
  actualizar as actualizarDivision,
  eliminar as eliminarDivison
} from "../../../../api/administracion/contratoDivision.api";

import {
  listar as listarOperador,
  crear as crearOperador,
  actualizar as actualizarOperador,
  eliminar as eliminarOperador
} from "../../../../api/administracion/contratoDivisionOperador.api";

import {
  obtener as obtenerSubcontratista,
  listar as listarSubcontratista,
  crear as crearSubcontratista,
  actualizar as actualizarSubcontratista,
  eliminar as eliminarSubcontratista
} from "../../../../api/administracion/contratoSubcontratista.api";

import {
  obtener as obtenerAdenda,
  listar as listarAdenda,
  crear as crearAdenda,
  actualizar as actualizarAdenda,
  eliminar as eliminarAdenda
} from "../../../../api/administracion/contratoAdenda.api";

import {
  obtener as obtenerCentroCosto,
  crear as crearCentroCosto,
  actualizar as actualizarCentroCosto,
  eliminar as eliminarCentroCosto
} from "../../../../api/administracion/contratoCentroCosto.api";

import {
  serviceContratoUnidad
} from "../../../../api/administracion/contratoUnidadOrganizativa.api";

import {
  obtener as obtenerVehiculo,
  listar as listarVehiculo,
  crear as crearVehiculo,
  actualizar as actualizarVehiculo,
  eliminar as eliminarVehiculo
} from "../../../../api/administracion/contratoVehiculo.api";

import { listarTreeview as listarTreeviewUnidadOrganizativa } from "../../../../api/administracion/unidadOrganizativa.api";
import { listar as listarCompanias } from "../../../../api/administracion/compania.api";
import { serviceUnidadCentroCosto } from "../../../../api/administracion/unidadOrganizativaCentroCosto.api";

//Custom grid: ::::::::::::::::::::::::::::::::
import ArrayStore from "devextreme/data/array_store";
import DataSource from "devextreme/data/data_source";
//:::::::::::::::::::::::::::::::::::::::::::::
import { getButtonPermissions, defaultPermissions, setDisabledTabs } from '../../../../../_metronic/utils/securityUtils'
import TabNavContainer from "../../../../partials/components/Tabs/TabNavContainer"
import AdministracionContratoPersonas from "./AdministracionContratoPersonas";
import AdministracionUnidadOrganizativaBuscar from "../../../../partials/components/AdministracionUnidadOrganizativaBuscar";
import AdministracionUnidadOrganizativaDotacionBuscar from "../../../../partials/components/AdministracionUnidadOrganizativaDotacionBuscar";
import ContratoUnidadOrganizativaListPage_v2 from "./unidadOrganizativa/ContratoUnidadOrganizativaListPage_v2";
import AdministracionContratoUnidadOrganizativaDotacionBuscar
  from "../../../../partials/components/AdministracionContratoUnidadOrganizativaDotacionBuscar";
import AdministracionContratoUnidadOrganizativaBuscar
  from "../../../../partials/components/AdministracionContratoUnidadOrganizativaBuscar";

//::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
const ContratoIndexPage = props => {
  const { intl, setLoading, dataMenu } = props;
  // console.log('dataMenu', dataMenu);
  const usuario = useSelector(state => state.auth.user);
  const perfil = useSelector(state => state.perfil.perfilActual);

  //const [contrato, setContrato] = useState([]);
  const [varIdContrato, setVarIdContrato] = useState("");
  const [varCurrentContrato, setCurrentContrato] = useState({
    IdContrato: "",
    IdCompaniaMandante: "",
    IdCompaniaContratista: "",
    CompaniaMandante: "",
    CompaniaContratista: "",
    Documento: ""
  });
  const [focusedRowKey, setFocusedRowKey] = useState();

  const [titulo, setTitulo] = useState(
    intl.formatMessage({ id: "ACTION.LIST" })
  );
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);

  const classes = useStylesTab();

  const [selected, setSelected] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);

  const [tabIndex, setTabIndex] = useState(0);
  const handleChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const [dataRowEditNew, setDataRowEditNew] = useState({});

  const [filtroLocal, setFiltroLocal] = useState({
    IdCliente: "",
    IdCompaniaMandante: "",
    IdCompaniaContratista: "",
    IdContrato: ""
  });

  //Recuperar-Desde-Mennu-RutaArchivo.
  //const [pathFile, setPathFile] = useState();
  const [listarTabs, setListarTabs] = useState([]);
  const [grillaPersona, setGrillaPersona] = useState([]);
  const [OperadormodoEdicion, setOperadorModoEdicion] = useState(false);
  const [companias, setCompanias] = useState([]);
  const [unidadesOrganizativas, setUnidadesOrganizativas] = useState([]);
  //const [pathFileAdenda, setPathFileAdenda] = useState();
  const [TipoVehiculos] = useState([]);
  const [nivel, setNivel] = useState(false);

  const [isVisible, setIsVisible] = useState(false);
  const [isVisibleAlert, setIsVisibleAlert] = useState(false);
  const [isVisibleUnidadOrganizativa, setisVisibleUnidadOrganizativa] = useState(false);
  const [isVisibleUnidadOrganizativaDotacion, setisVisibleUnidadOrganizativaDotacion] = useState(false);

  const [popupVisibleContrato, setPopupVisibleContrato] = useState(false);

  // let datacheck = [];

  const [dataCheck, setDatacheck] = useState([]);

  //++++++++Variable (totalRowIndex) para controlar bloqueo de tabs cuando se cambia de búsqueda de un registro en la grilla.++++++++++++++
  const [totalRowIndex, setTotalRowIndex] = useState(0);

  //: FILTRO  :::::::::::::::::::::::::::::::::::::::::::::
  const [isFirstDataLoad, setIsFirstDataLoad] = useState(true);
  const [refreshData, setRefreshData] = useState(false);
  const ds = new DataSource({
    store: new ArrayStore({ data: [], key: "RowIndex" }),
    reshapeOnPush: false
  });
  const [dataSource] = useState(ds);

  const refresh = () => dataSource.refresh();
  const resetLoadOptions = () => dataSource.resetLoadOptions();
  //:::::::::::::::::::::::::::::::::::::::::::::::::::::::

  /**Configuración Botones**************************************** */
  const [accessButton, setAccessButton] = useState(defaultPermissions);

  const loadControlsPermission = () => {
    const numeroTabs = 8; //Nùmero de tab del formulario.
    let buttonsPermissions = getButtonPermissions(dataMenu.objetos);
    let newTabs = setDisabledTabs(dataMenu.objetos, numeroTabs);
    setAccessButton({ ...accessButton, ...buttonsPermissions, Tabs: newTabs });
  }

  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  const [dataContract, setDataContract] = useState({});
  const [dataContractAux, setDataContractAux] = useState({});

  /* async function obtenerConfiguracion() {
    let param = {
      IdCliente: "1",
      IdPerfil: perfil.IdPerfil,
      IdModulo: dataMenu.info.IdModulo,
      IdAplicacion: dataMenu.info.IdAplicacion,
      IdMenu: dataMenu.info.IdMenu         
    };
    //Obtener Ruta  del servidor para subir archivos
    await obtenerMenuPersonalizado(param).then(datosMenu => {
      const { Repositorio } = datosMenu;
      setPathFile(Repositorio);
    });

  } */



  async function obtenerConfiguracion() {
    //Obtener ruta del repositorio de archivos.
    // let datosMenu = await obtenerMenuPersonalizado({
    //   IdCliente: perfil.IdCliente,
    //   IdModulo: dataMenu.info.IdModulo,
    //   IdAplicacion: dataMenu.info.IdAplicacion,
    //   IdMenu: dataMenu.info.IdMenu //'0302'         
    // });
    // const { Repositorio } = datosMenu;
    // setPathFile(Repositorio);

    // let datosMenuAdenda = await obtenerMenuPersonalizado({
    //   IdCliente: perfil.IdCliente,
    //   IdModulo: dataMenu.info.IdModulo,
    //   IdAplicacion: dataMenu.info.IdAplicacion,
    //   IdMenu: dataMenu.info.IdMenu
    // });
    // setPathFileAdenda(datosMenuAdenda.Repositorio);
  }

  async function agregarContrato(dataRow) {
    const {
      Activo,
      Asunto,
      Dotacion,
      ValidarDotacion,
      FechaFin,
      FechaInicio,
      IdCompaniaContratista,
      IdCompaniaMandante,
      IdContrato,
      IdTipoContrato,

      FileBase64,
      NombreArchivo,
      // ClaseArchivo,
      FechaArchivo,
      Servicios
    } = dataRow;

    let params = {
      IdCliente: perfil.IdCliente,
      IdDivision: perfil.IdDivision,
      IdUsuario: usuario.username,
      Activo,
      Asunto: isNotEmpty(Asunto) ? Asunto.toUpperCase() : "",
      Dotacion: isNotEmpty(Dotacion) ? Dotacion : 0,
      ValidarDotacion: isNotEmpty(ValidarDotacion) ? ValidarDotacion.toUpperCase() : "",
      FechaFin: dateFormat(FechaFin, "yyyyMMdd"),//new Date(FechaFin).toLocaleString(),
      FechaInicio: dateFormat(FechaInicio, "yyyyMMdd"), //new Date(FechaInicio).toLocaleString(),
      IdCompaniaContratista,
      IdCompaniaMandante,
      IdContrato: isNotEmpty(IdContrato) ? IdContrato.toUpperCase() : "",
      IdTipoContrato,
      FileBase64: isNotEmpty(FileBase64) ? FileBase64 : "",
      NombreArchivo: isNotEmpty(NombreArchivo) ? NombreArchivo : "",
      IdItemSharepoint: "",
      ClaseArchivo: isNotEmpty(IdContrato) ? IdContrato : "",
      FechaArchivo: isNotEmpty(FechaArchivo) ? dateFormat(FechaArchivo, "yyyyMMdd hh:mm") : "", // new Date(FechaArchivo).toLocaleString()   : "",
      PathFile: "",
      Servicios: isNotEmpty(Servicios) ? Servicios + "|" : "",
      IdModulo: dataMenu.info.IdModulo,
      IdAplicacion: dataMenu.info.IdAplicacion,
      IdMenu: dataMenu.info.IdMenu
    };

    if (isNotEmpty(FileBase64)) {
      //Requisito con archivo.
      // if (!isNotEmpty(params.PathFile)) {
      //   handleInfoMessages(
      //     intl.formatMessage({ id: "MESSAGES.NOT.PATH.UPLOAD" })
      //   );
      //   return;
      // }
      setLoading(true);
      await uploadFile(params).then(response => {
        //Recuperar Nombre archivo.
        const { nombreArchivo, idItemSharepoint } = response;
        params.NombreArchivo = nombreArchivo;
        params.IdItemSharepoint = idItemSharepoint;

        crear(params)
          .then(response => {

            if (response) {
              handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));

              //setModoEdicion(false);
              setRefreshData(true); //Actualizar CustomDataGrid
              listarContrato();

              const { IdContrato } = response;
              setTimeout(() => {
                dataSource.loadDataWithFilter({ data: { IdCliente: perfil.IdCliente, IdContrato } });
                setVarIdContrato("");
                setFocusedRowKey();
              }
                , 500)

            }
          })
          .catch(err => {
            handleErrorMessages(
              intl.formatMessage({ id: "MESSAGES.ERROR" }),
              err
            );
          })
          .finally(() => {
            setLoading(false);
          });
      }).catch((err) => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
    } else {
      setLoading(true);
      //Contrato sin archivo.
      await crear(params)
        .then(response => {
          if (response) {
            handleSuccessMessages(
              intl.formatMessage({ id: "MESSAGES.SUCESS" }),
              intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" })
            );
            //setModoEdicion(false);
            setRefreshData(true); //Actualizar CustomDataGrid
            listarContrato();

            const { IdContrato } = response;
            setTimeout(() => {
              dataSource.loadDataWithFilter({ data: { IdCliente: perfil.IdCliente, IdContrato } });
              setVarIdContrato("");
              setFocusedRowKey();
            }
              , 500)

          }

        })
        .catch(err => {
          handleErrorMessages(
            intl.formatMessage({ id: "MESSAGES.ERROR" }),
            err
          );
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }

  async function actualizarContrato(dataRow) {
    const {
      Activo,
      Asunto,
      Dotacion,
      ValidarDotacion,
      FechaFin,
      FechaInicio,
      IdCompaniaContratista,
      IdCompaniaMandante,
      IdContrato,
      IdTipoContrato,
      FileBase64,
      NombreArchivo,
      // ClaseArchivo,
      FechaArchivo,
      Servicios, IdItemSharepoint
    } = dataRow;

    let params = {
      IdCliente: perfil.IdCliente,
      IdDivision: perfil.IdDivision,
      IdUsuario: usuario.username,
      Activo,
      Asunto: isNotEmpty(Asunto) ? Asunto.toUpperCase() : "",
      Dotacion: isNotEmpty(Dotacion) ? Dotacion : 0,
      ValidarDotacion: isNotEmpty(ValidarDotacion) ? ValidarDotacion.toUpperCase() : "",
      FechaFin: dateFormat(FechaFin, "yyyyMMdd"), //new Date(FechaFin).toLocaleString(),
      FechaInicio: dateFormat(FechaInicio, "yyyyMMdd"), //new Date(FechaInicio).toLocaleString(),
      IdCompaniaContratista,
      IdCompaniaMandante,
      IdContrato,
      IdTipoContrato,
      FileBase64: isNotEmpty(FileBase64) ? FileBase64 : "",
      NombreArchivo: isNotEmpty(NombreArchivo) ? NombreArchivo : "",
      IdItemSharepoint: isNotEmpty(IdItemSharepoint) ? IdItemSharepoint : "",
      ClaseArchivo: isNotEmpty(IdContrato) ? IdContrato : "",
      FechaArchivo: isNotEmpty(FechaArchivo) ? dateFormat(FechaArchivo, "yyyyMMdd hh:mm") : "", //new Date(FechaArchivo).toLocaleString() : "",
      PathFile: "",
      Servicios: isNotEmpty(Servicios) ? Servicios + "|" : "",
      IdModulo: dataMenu.info.IdModulo,
      IdAplicacion: dataMenu.info.IdAplicacion,
      IdMenu: dataMenu.info.IdMenu
    };


    if (isNotEmpty(FileBase64)) {
      //Requisito con archivo.
      // if (!isNotEmpty(params.PathFile)) {
      //   handleInfoMessages(
      //     intl.formatMessage({ id: "MESSAGES.NOT.PATH.UPLOAD" })
      //   );
      //   return;
      // }
      setLoading(true);
      await uploadFile(params).then(response => {
        //Recuperar Nombre archivo.
        const { nombreArchivo, idItemSharepoint } = response;
        params.NombreArchivo = nombreArchivo;
        params.IdItemSharepoint = idItemSharepoint;

        actualizar(params)
          .then(response => {
            if (response)
              handleSuccessMessages(
                intl.formatMessage({ id: "MESSAGES.SUCESS" }),
                intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" })
              );
            //setModoEdicion(false);
            setRefreshData(true); //Actualizar CustomDataGrid
            listarContrato();
          })
          .catch(err => {
            handleErrorMessages(
              intl.formatMessage({ id: "MESSAGES.ERROR" }),
              err
            );
          })
          .finally(() => {
            setLoading(false);
          });
      }).catch((err) => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
    } else {
      setLoading(true);
      //Contrato sin archivo.
      await actualizar(params)
        .then(response => {
          if (response)
            handleSuccessMessages(
              intl.formatMessage({ id: "MESSAGES.SUCESS" }),
              intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" })
            );
          //setModoEdicion(false);
          setRefreshData(true); //Actualizar CustomDataGrid
          listarContrato();
        })
        .catch(err => {
          handleErrorMessages(
            intl.formatMessage({ id: "MESSAGES.ERROR" }),
            err
          );
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }

  async function eliminarRegistro(data) {
    const {
      IdContrato,
      IdCliente,
      IdCompaniaContratista,
      IdCompaniaMandante
    } = data;
    setLoading(true);
    await eliminar({
      IdCliente: IdCliente,
      IdContrato,
      IdCompaniaContratista,
      IdCompaniaMandante
    })
      .then(response => {
        handleSuccessMessages(
          intl.formatMessage({ id: "MESSAGES.SUCESS" }),
          intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" })
        );
        setRefreshData(true); //Actualizar CustomDataGrid
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      })
      .finally(() => {
        setLoading(false);
      });

    listarContrato();
  }

  async function listarContrato() {
    //setLoading(true);
    //let contratos = await listar({ IdCliente: perfil.IdCliente, NumPagina: 0, TamPagina: 0 }).finally(() => { setLoading(false); });
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setModoEdicion(false);
    setOperadorModoEdicion(false);
    //setRefreshData(true);//Actualizar CustomDataGrid

    //setListarTabs(contratos);
  }

  async function obtenerContrato(filtro) {

    const {
      IdContrato,
      IdCliente,
      IdCompaniaContratista,
      IdCompaniaMandante
    } = filtro;

    if (IdContrato) {
      setLoading(true);
      let contrato = await obtener({
        IdCliente: IdCliente,
        IdContrato,
        IdCompaniaContratista,
        IdCompaniaMandante
      }).finally(() => {
        // setLoading(false);
      });

      let contratoServicios = await listarContratoServicios({
        IdCliente: IdCliente,
        IdCompaniaMandante: IdCompaniaMandante,
        IdCompaniaContratista: IdCompaniaContratista,
        IdContrato: IdContrato,
        IdServicio: '%',
        NumPagina: 0,
        TamPagina: 0
      }).finally(() => {
        setLoading(false);
      });

      let strServicios = contratoServicios.filter(x => x.Check).map(x => (x.IdServicio)).join('|');

      let dataCheckAux = [];

      if (contratoServicios.length > 0) {
        for (let i = 0; i < contratoServicios.length; i++) {
          if (!dataCheckAux.find(x => x.IdServicio === contratoServicios[i].IdServicio))
            dataCheckAux.push(contratoServicios[i].IdServicio);
        }
        setDatacheck(dataCheckAux);

      } else {
        setDatacheck([]);
      }
      // contrato.Servicios
      setDataRowEditNew({ ...contrato, Servicios: strServicios, esNuevoRegistro: false });
    }
  }

  const nuevoRegistro = () => {
    let contrato = { Activo: "S", ValidarDotacion: "S" };
    setDatacheck([]);
    setDataRowEditNew({ ...contrato, esNuevoRegistro: true });
    setGrillaPersona([]);
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
  };

  const editarRegistro = dataRow => {
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    obtenerContrato(dataRow);
    setModoEdicion(true);

  };

  const cancelarEdicion = () => {
    changeTabIndex(0);
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setVarIdContrato("");
    setCurrentContrato({
      IdContrato: "",
      IdCompaniaMandante: "",
      IdCompaniaContratista: "",
      CompaniaMandante: "",
      CompaniaContratista: ""
    });
    setDatacheck([]);
    listarContrato();
  };

  const cargarRegistroSeleccioando = () => {
    obtenerContrato(selected);
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
  };

  const seleccionarRegistro = dataRow => {
    console.log("seleccionarRegistro :> ", dataRow);
    const {
      IdContrato,
      RowIndex,
      IdCompaniaMandante,
      IdCompaniaContratista,
      CompaniaMandante,
      CompaniaContratista
    } = dataRow;

    setSelected(dataRow);
    // setFiltroLocal({ IdCliente:perfil.IdCliente ,IdCompaniaMandante:IdCompaniaMandante, IdCompaniaContratista:IdCompaniaContratista,IdContrato:IdContrato })
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    if (IdContrato !== varIdContrato) {
      setVarIdContrato(IdContrato);
      setCurrentContrato({
        IdContrato,
        IdCompaniaMandante,
        IdCompaniaContratista,
        CompaniaMandante,
        CompaniaContratista
      });
      setFocusedRowKey(RowIndex);
    }
    setDataRowEditNew(dataRow);
  };


  const verRegistroDblClick = dataRow => {
    obtenerContrato(dataRow);
    setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
    changeTabIndex(1);
    setModoEdicion(false);
  };

  const mostrarPopUpPersonas = dataRow => {
    const { IdCompaniaMandante, IdCompaniaContratista, IdContrato } = dataRow;
    setFiltroLocal({ IdCliente: perfil.IdCliente, IdCompaniaMandante: IdCompaniaMandante, IdCompaniaContratista: IdCompaniaContratista, IdContrato: IdContrato })
    setPopupVisibleContrato(true);

    setDataContract(dataRow);

    //console.log("JULIO SELECTED", selected);
    //console.log("dataRowEditNew inicial", dataRowEditNew);
    obtenerContrato(selected);
    setDataContractAux(dataRowEditNew);
  };

  const changeTabIndex = index => {
    handleChange(null, index);
  };

  useEffect(() => {
    obtenerConfiguracion();
    loadControlsPermission();

    listarCompanias({
      IdCliente: perfil.IdCliente,
      IdTipoDocumento: "%",
      IdCategoria: "%",
      NumPagina: 0,
      TamPagina: 0
    }).then(res => {
      setCompanias(res);
    });

    /*listarTreeviewUnidadOrganizativa({
      IdCliente: perfil.IdCliente,
      IdDivision: perfil.IdDivision,
      ShowIconAction: 1,
      Activo: "S"
    }).then(res => {
      setUnidadesOrganizativas(res);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    });*/

    // obtenerTodosTipoVehiculos({
    //   IdCliente: perfil.IdCliente
    // }).then(res => {
    //   setTipoVehiculos(res);
    // });

  }, []);

  const getInfo = () => {
    return [
      {
        text: intl.formatMessage({
          id: "ADMINISTRATION.CONTRACT.CLIENTCOMPANY.ABR"
        }),
        value: varCurrentContrato.CompaniaMandante,
        colSpan: 1
      },
      {
        text: intl.formatMessage({
          id: "ADMINISTRATION.CONTRACT.CONTRACTORCOMPANY.ABR"
        }),
        value: varCurrentContrato.CompaniaContratista,
        colSpan: 1
      },
      {
        text: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CONTRACT" }),
        value: varCurrentContrato.IdContrato,
        colSpan: 1
      }
    ];
  };

  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  const listarContratoDivision = async () => {
    setLoading(true);
    setListarTabs([]);

    let contratosdivision = await listarDivision({
      IdCliente: perfil.IdCliente,
      IdContrato: varCurrentContrato.IdContrato,
      IdCompaniaMandante: varCurrentContrato.IdCompaniaMandante,
      IdCompaniaContratista: varCurrentContrato.IdCompaniaContratista
    }).finally(() => {
      setLoading(false);
    });
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setModoEdicion(false);
    setListarTabs(contratosdivision);
  };

  const cargarDatosContratoDivision = async () => {
    await listarContratoDivision();
    setLoading(true);
    let personas = await servicioPersonaPosicion.personas({
      IdCliente: perfil.IdCliente,
      IdCompania: varCurrentContrato.IdCompaniaMandante
    }).finally(() => {
      setLoading(false);
    });
    setGrillaPersona(personas);
  };

  const actualizarContratoDivision = async dataRow => {
    const {
      Activo,
      IdDivision
    } = dataRow;

    let params = {
      IdCliente: perfil.IdCliente,
      IdContrato: varCurrentContrato.IdContrato,
      IdCompaniaMandante: varCurrentContrato.IdCompaniaMandante,
      IdCompaniaContratista: varCurrentContrato.IdCompaniaContratista,
      IdUsuario: usuario.username,
      Activo,
      IdDivision
    };

    setLoading(true);
    await actualizarDivision(params)
      .then(response => {
        if (response)
          handleSuccessMessages(
            intl.formatMessage({ id: "MESSAGES.SUCESS" }),
            intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" })
          );
        setModoEdicion(false);
        listarContratoDivision();
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const agregarContratoDivision = async dataRow => {
    const {
      Activo,
      IdDivision
    } = dataRow;

    let params = {
      IdCliente: perfil.IdCliente,
      IdContrato: varCurrentContrato.IdContrato,
      IdCompaniaMandante: varCurrentContrato.IdCompaniaMandante,
      IdCompaniaContratista: varCurrentContrato.IdCompaniaContratista,
      IdUsuario: usuario.username,
      Activo,
      IdDivision
    };

    setLoading(true);
    //Contrato sin archivo.
    await crearDivision(params)
      .then(response => {
        if (response)
          handleSuccessMessages(
            intl.formatMessage({ id: "MESSAGES.SUCESS" }),
            intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" })
          );
        setModoEdicion(false);
        listarContratoDivision();
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const cancelarEdicionDivision = () => {
    changeTabIndex(2);
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
  };

  const eliminarRegistroContratoDivision = async data => {
    const {
      IdDivision
    } = data;
    setLoading(true);
    await eliminarDivison({
      IdCliente: perfil.IdCliente,
      IdContrato: varCurrentContrato.IdContrato,
      IdCompaniaMandante: varCurrentContrato.IdCompaniaMandante,
      IdCompaniaContratista: varCurrentContrato.IdCompaniaContratista,
      IdDivision
    })
      .then(response => {
        handleSuccessMessages(
          intl.formatMessage({ id: "MESSAGES.SUCESS" }),
          intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" })
        );
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      })
      .finally(() => {
        setLoading(false);
      });
    listarContratoDivision();
  };

  const editarRegistroContratoDivision = async dataRow => {
    setGrillaPersona([]);
    setModoEdicion(true);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    setLoading(true);

    const IdDivision = dataRow.IdDivision;
    const param = {
      IdCliente: perfil.IdCliente,
      IdContrato: varCurrentContrato.IdContrato,
      IdCompaniaMandante: varCurrentContrato.IdCompaniaMandante,
      IdCompaniaContratista: varCurrentContrato.IdCompaniaContratista,
      IdDivision
    };

    let contratoDivision = await obtenerDivision(param).finally(() => {
      setLoading(false);
    });
    let operadores = await listarOperador(param).finally(() => {
      setLoading(false);
    });
    setDataRowEditNew({
      ...contratoDivision,
      esNuevoRegistro: false
    });

    setGrillaPersona(
      operadores.map(x => ({
        ...x,
        esNuevoRegistro: false,
        Division: contratoDivision.Division
      }))
    );
  };

  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  //Operador:     ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  const crearContratoDivisionOperador = async dataRow => {
    const { Activo, IdPersona, NombreCompleto, IdDivision } = dataRow;

    let params = {
      IdCliente: perfil.IdCliente,
      IdContrato: varCurrentContrato.IdContrato,
      IdCompaniaMandante: varCurrentContrato.IdCompaniaMandante,
      IdCompaniaContratista: varCurrentContrato.IdCompaniaContratista,
      IdUsuario: usuario.username,
      Activo,
      IdDivision,
      IdPersona
    };

    setLoading(true);
    await crearOperador(params)
      .then(response => {
        if (response) {
          handleSuccessMessages(
            intl.formatMessage({ id: "MESSAGES.SUCESS" }),
            intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" })
          );
          setModoEdicion(false);
          setOperadorModoEdicion(false);
          setDataRowEditNew({});
          listarContratoDivision();
        } else {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.ERROR" }), {
            response: {
              data: `No se pudo registrar el operador ${NombreCompleto}.\r\n`,
              status: 400
            }
          });
        }
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.ERROR" }), {
          response: {
            data: `No se pudo registrar el operador ${NombreCompleto}.\r\n`,
            status: 400
          }
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const actualizarContratoDivisionOperador = async dataRow => {
    const { Activo, IdPersona, NombreCompleto, IdDivision } = dataRow;

    let params = {
      IdCliente: perfil.IdCliente,
      IdContrato: varCurrentContrato.IdContrato,
      IdCompaniaMandante: varCurrentContrato.IdCompaniaMandante,
      IdCompaniaContratista: varCurrentContrato.IdCompaniaContratista,
      IdUsuario: usuario.username,
      Activo,
      IdDivision,
      IdPersona
    };

    setLoading(true);
    await actualizarOperador(params)
      .then(response => {
        handleSuccessMessages(
          intl.formatMessage({ id: "MESSAGES.SUCESS" }),
          intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" })
        );
        setModoEdicion(false);
        setOperadorModoEdicion(false);
        setDataRowEditNew({});
        listarContratoDivision();
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.ERROR" }), {
          response: {
            data: `No se pudo registrar el operador ${NombreCompleto}.\r\n`,
            status: 400
          }
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const editarContratoDivisionOperador = async data => {
    let {
      IdDivision,
      Division,
      Activo,
      TipoDocumento,
      NombreCompleto,
      IdPersona,
      Documento,
      IdUsuarioCreacion,
      IdUsuarioModificacion,
      FechaCreacion,
      FechaModificacion
    } = data;

    setModoEdicion(true);
    setOperadorModoEdicion(true);
    setDataRowEditNew({
      ...varCurrentContrato,
      esNuevoRegistro: false,
      IdDivision,
      Division,
      //TipoDocumento: "Tipo Documento",
      Activo,
      NombreCompleto,
      IdPersona,
      Documento,
      TipoDocumento,
      IdUsuarioCreacion,
      IdUsuarioModificacion,
      FechaCreacion,
      FechaModificacion
    });
  };

  const eliminarContratoDivisionOperador = async data => {
    let { IdDivision, Activo, IdPersona, NombreCompleto } = data;

    let params = {
      IdCliente: perfil.IdCliente,
      IdContrato: varCurrentContrato.IdContrato,
      IdCompaniaMandante: varCurrentContrato.IdCompaniaMandante,
      IdCompaniaContratista: varCurrentContrato.IdCompaniaContratista,
      IdUsuario: usuario.username,
      Activo,
      IdDivision,
      IdPersona
    };

    setLoading(true);
    await eliminarOperador(params)
      .then(response => {
        handleSuccessMessages(
          intl.formatMessage({ id: "MESSAGES.SUCESS" }),
          intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" })
        );
        setModoEdicion(false);
        setOperadorModoEdicion(false);
        setDataRowEditNew({});
        listarContratoDivision();
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.ERROR" }), {
          response: {
            data: `No se pudo elimininar el operador ${NombreCompleto}.\r\n`,
            status: 400
          }
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const cancelarEdicionDivisionOperador = async () => {
    setModoEdicion(false);
    setOperadorModoEdicion(false);
    setDataRowEditNew({});
  };

  const agregarOperador = evt => {
    let { IdDivision, Division } = evt.row.data;
    setModoEdicion(true);
    setOperadorModoEdicion(true);
    setDataRowEditNew({
      ...varCurrentContrato,
      esNuevoRegistro: true,
      IdDivision,
      Division,
      TipoDocumento: "Tipo Documento",
      Activo: "S"
    });
  };

  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  //Subcontratista:   ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  const cargarDatosContratoSubcontratista = async () => {
    setLoading(true);
    setListarTabs([]);

    let contratoSubcontratista = await listarSubcontratista({
      IdCliente: perfil.IdCliente,
      IdContrato: varCurrentContrato.IdContrato,
      IdCompaniaMandante: varCurrentContrato.IdCompaniaMandante,
      IdCompaniaContratista: varCurrentContrato.IdCompaniaContratista
    }).finally(() => {
      setLoading(false);
    });

    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setModoEdicion(false);
    setListarTabs(contratoSubcontratista);
  };

  const editarRegistroContratoSubContratista = async dataRow => {
    let { IdCompaniaSubContratista } = dataRow;

    let params = {
      IdCliente: perfil.IdCliente,
      IdContrato: varCurrentContrato.IdContrato,
      IdCompaniaMandante: varCurrentContrato.IdCompaniaMandante,
      IdCompaniaContratista: varCurrentContrato.IdCompaniaContratista,
      IdCompaniaSubContratista
    };

    setLoading(true);
    let subcontratista = await obtenerSubcontratista(params).finally(() => {
      setLoading(false);
    });
    setDataRowEditNew({ ...subcontratista, esNuevoRegistro: false });
    setGrillaPersona([]);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    setModoEdicion(true);
  };
  const eliminarRegistroContratoSubContratista = async dataRow => {
    let { IdCompaniaSubContratista } = dataRow;

    let params = {
      IdCliente: perfil.IdCliente,
      IdContrato: varCurrentContrato.IdContrato,
      IdCompaniaMandante: varCurrentContrato.IdCompaniaMandante,
      IdCompaniaContratista: varCurrentContrato.IdCompaniaContratista,
      IdCompaniaSubContratista
    };

    setLoading(true);
    await eliminarSubcontratista(params)
      .then(response => {
        handleSuccessMessages(
          intl.formatMessage({ id: "MESSAGES.SUCESS" }),
          intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" })
        );
        setModoEdicion(false);
        setOperadorModoEdicion(false);
        setDataRowEditNew({});
        cargarDatosContratoSubcontratista();
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      })
      .finally(() => {
        setLoading(false);
      });
  };
  const actualizarContratoSubContratista = async dataRow => {
    const {
      Activo,
      IdCompaniaSubContratista,
      IdCompaniaSubContratistaPadre
    } = dataRow;

    let params = {
      IdCliente: perfil.IdCliente,
      IdContrato: varCurrentContrato.IdContrato,
      IdCompaniaMandante: varCurrentContrato.IdCompaniaMandante,
      IdCompaniaContratista: varCurrentContrato.IdCompaniaContratista,
      IdUsuario: usuario.username,
      Activo,
      IdCompaniaSubContratista: isNotEmpty(IdCompaniaSubContratista)
        ? IdCompaniaSubContratista
        : "",
      IdCompaniaSubContratistaPadre: isNotEmpty(IdCompaniaSubContratistaPadre)
        ? IdCompaniaSubContratistaPadre
        : ""
    };

    setLoading(true);
    await actualizarSubcontratista(params)
      .then(response => {
        handleSuccessMessages(
          intl.formatMessage({ id: "MESSAGES.SUCESS" }),
          intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" })
        );
        setModoEdicion(false);
        setOperadorModoEdicion(false);
        setDataRowEditNew({});
        cargarDatosContratoSubcontratista();
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const agregarContratoSubcontratista = async dataRow => {
    const {
      Activo,
      IdCompaniaSubContratista,
      IdCompaniaSubContratistaPadre
    } = dataRow;

    let params = {
      IdCliente: perfil.IdCliente,
      IdContrato: varCurrentContrato.IdContrato,
      IdCompaniaMandante: varCurrentContrato.IdCompaniaMandante,
      IdCompaniaContratista: varCurrentContrato.IdCompaniaContratista,
      IdUsuario: usuario.username,
      Activo,
      IdCompaniaSubContratista: isNotEmpty(IdCompaniaSubContratista)
        ? IdCompaniaSubContratista
        : "",
      IdCompaniaSubContratistaPadre: isNotEmpty(IdCompaniaSubContratistaPadre)
        ? IdCompaniaSubContratistaPadre
        : ""
    };

    setLoading(true);
    await crearSubcontratista(params)
      .then(response => {
        handleSuccessMessages(
          intl.formatMessage({ id: "MESSAGES.SUCESS" }),
          intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" })
        );
        setModoEdicion(false);
        setOperadorModoEdicion(false);
        setDataRowEditNew({});
        cargarDatosContratoSubcontratista();
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const nuevoSubcontratista = evt => {
    let data = evt.row.data;
    let { IdCompaniaSubContratista } = data;
    let contrato = {
      Activo: "S",
      IdCompaniaSubContratistaPadre: IdCompaniaSubContratista
    };
    setDataRowEditNew({ ...contrato, esNuevoRegistro: true });
    setGrillaPersona([]);
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
  };

  const cancelarEdicionSubcontratista = () => {
    setModoEdicion(false);
    setOperadorModoEdicion(false);
    setDataRowEditNew({});
    setTabIndex(0);
  };

  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  //Adenda:           ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  const cargarDatosContratoAdenda = async () => {
    setLoading(true);
    setListarTabs([]);

    let contratoAdenda = await listarAdenda({
      IdCliente: perfil.IdCliente,
      IdContrato: varCurrentContrato.IdContrato,
      IdCompaniaMandante: varCurrentContrato.IdCompaniaMandante,
      IdCompaniaContratista: varCurrentContrato.IdCompaniaContratista
    }).finally(() => {
      setLoading(false);
    });

    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setModoEdicion(false);
    setListarTabs(contratoAdenda);
  };

  const editarRegistroContratoAdenda = async dataRow => {
    let { IdAdenda } = dataRow;

    let params = {
      IdCliente: perfil.IdCliente,
      IdContrato: varCurrentContrato.IdContrato,
      IdCompaniaMandante: varCurrentContrato.IdCompaniaMandante,
      IdCompaniaContratista: varCurrentContrato.IdCompaniaContratista,
      IdAdenda
    };

    setLoading(true);
    let adenda = await obtenerAdenda(params).finally(() => {
      setLoading(false);
    });
    setDataRowEditNew({ ...adenda, esNuevoRegistro: false });
    setGrillaPersona([]);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    setModoEdicion(true);
  };

  const eliminarRegistroContratoAdenda = async dataRow => {
    let { IdAdenda } = dataRow;

    let params = {
      IdCliente: perfil.IdCliente,
      IdContrato: varCurrentContrato.IdContrato,
      IdCompaniaMandante: varCurrentContrato.IdCompaniaMandante,
      IdCompaniaContratista: varCurrentContrato.IdCompaniaContratista,
      IdAdenda
    };

    setLoading(true);
    await eliminarAdenda(params)
      .then(response => {
        handleSuccessMessages(
          intl.formatMessage({ id: "MESSAGES.SUCESS" }),
          intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" })
        );
        setModoEdicion(false);
        setOperadorModoEdicion(false);
        setDataRowEditNew({});
        cargarDatosContratoAdenda();
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const nuevoAdenda = evt => {
    let data = evt.row.data;
    let { IdAdenda } = data;
    let contrato = { Activo: "S" };
    setDataRowEditNew({ ...contrato, esNuevoRegistro: true });
    setGrillaPersona([]);
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
  };

  const actualizarContratoAdenda = async dataRow => {
    const {
      IdAdenda,
      Asunto,
      FechaInicio,
      FechaFin,
      FileBase64,
      NombreArchivo,
      FechaArchivo, IdItemSharepoint
    } = dataRow;

    let params = {
      IdCliente: perfil.IdCliente,
      IdContrato: varCurrentContrato.IdContrato,
      IdCompaniaMandante: varCurrentContrato.IdCompaniaMandante,
      IdCompaniaContratista: varCurrentContrato.IdCompaniaContratista,
      IdUsuario: usuario.username,
      IdAdenda,
      Asunto,
      FechaInicio: dateFormat(FechaInicio, "yyyyMMdd"),
      FechaFin: dateFormat(FechaFin, "yyyyMMdd"),
      FileBase64: isNotEmpty(FileBase64) ? FileBase64 : "",
      NombreArchivo: isNotEmpty(NombreArchivo) ? NombreArchivo : "",
      IdItemSharepoint: isNotEmpty(IdItemSharepoint) ? IdItemSharepoint : "",
      ClaseArchivo: isNotEmpty(IdAdenda) ? IdAdenda : "",
      FechaArchivo: isNotEmpty(FechaArchivo) ? dateFormat(FechaArchivo, "yyyyMMdd") : "",
      PathFile: "",
      IdModulo: dataMenu.info.IdModulo,
      IdAplicacion: dataMenu.info.IdAplicacion,
      IdMenu: '030201' // 05-07-2022 SE ESTÁ ASIGNANDO EL IDMENU PORQUE UN FORMULARIO NO PUEDE TENER MÁS DE UNA RUTA Y LAS ADENDAS TIENEN SU PROPIO DIRECTORIO
    };

    ///************************************************** */
    if (isNotEmpty(FileBase64)) {
      //Requisito con archivo.
      setLoading(true);
      await uploadFile(params).then(response => {
        //Recuperar Nombre archivo.
        const { nombreArchivo, idItemSharepoint } = response;
        params.NombreArchivo = nombreArchivo;
        params.IdItemSharepoint = idItemSharepoint;

        actualizarAdenda(params)
          .then(response => {
            handleSuccessMessages(
              intl.formatMessage({ id: "MESSAGES.SUCESS" }),
              intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" })
            );
            setModoEdicion(false);
            setOperadorModoEdicion(false);
            setDataRowEditNew({});
            cargarDatosContratoAdenda();
          })
          .catch(err => {
            handleErrorMessages(
              intl.formatMessage({ id: "MESSAGES.ERROR" }),
              err
            );
          })
          .finally(() => {
            setLoading(false);
          });
      }).catch((err) => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
    } else {
      setLoading(true);
      //Contrato sin archivo.
      await actualizarAdenda(params)
        .then(response => {
          handleSuccessMessages(
            intl.formatMessage({ id: "MESSAGES.SUCESS" }),
            intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" })
          );
          setModoEdicion(false);
          setOperadorModoEdicion(false);
          setDataRowEditNew({});
          cargarDatosContratoAdenda();
        })
        .catch(err => {
          handleErrorMessages(
            intl.formatMessage({ id: "MESSAGES.ERROR" }),
            err
          );
        })
        .finally(() => {
          setLoading(false);
        });
    }

    //*************************************************** */
  };

  const agregarContratoAdenda = async dataRow => {
    const {
      IdAdenda,
      Asunto,
      FechaInicio,
      FechaFin,
      FileBase64,
      NombreArchivo,
      FechaArchivo
    } = dataRow;

    let params = {
      IdCliente: perfil.IdCliente,
      IdContrato: varCurrentContrato.IdContrato,
      IdCompaniaMandante: varCurrentContrato.IdCompaniaMandante,
      IdCompaniaContratista: varCurrentContrato.IdCompaniaContratista,
      IdUsuario: usuario.username,
      IdAdenda: isNotEmpty(IdAdenda) ? IdAdenda.toUpperCase() : "",
      Asunto: isNotEmpty(Asunto) ? Asunto.toUpperCase() : "",
      FechaInicio: dateFormat(FechaInicio, "yyyyMMdd"),
      FechaFin: dateFormat(FechaFin, "yyyyMMdd"),

      FileBase64: isNotEmpty(FileBase64) ? FileBase64 : "",
      NombreArchivo: isNotEmpty(NombreArchivo) ? NombreArchivo : "",
      IdItemSharepoint: "",
      ClaseArchivo: isNotEmpty(IdAdenda) ? IdAdenda : "",
      FechaArchivo: isNotEmpty(FechaArchivo)
        ? dateFormat(FechaArchivo, "yyyyMMdd")
        : "",
      PathFile: "",
      IdModulo: dataMenu.info.IdModulo,
      IdAplicacion: dataMenu.info.IdAplicacion,
      IdMenu: '030201' // 05-07-2022 SE ESTÁ ASIGNANDO EL IDMENU PORQUE UN FORMULARIO NO PUEDE TENER MÁS DE UNA RUTA Y LAS ADENDAS TIENEN SU PROPIO DIRECTORIO
    };

    setLoading(true);

    ///************************************************** */
    if (isNotEmpty(FileBase64)) {
      //Requisito con archivo.
      setLoading(true);
      await uploadFile(params).then(response => {
        //Recuperar Nombre archivo.
        const { nombreArchivo, idItemSharepoint } = response;
        params.NombreArchivo = nombreArchivo;
        params.IdItemSharepoint = idItemSharepoint;

        crearAdenda(params)
          .then(response => {
            handleSuccessMessages(
              intl.formatMessage({ id: "MESSAGES.SUCESS" }),
              intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" })
            );
            setModoEdicion(false);
            setOperadorModoEdicion(false);
            setDataRowEditNew({});
            cargarDatosContratoAdenda();
          })
          .catch(err => {
            handleErrorMessages(
              intl.formatMessage({ id: "MESSAGES.ERROR" }),
              err
            );
          })
          .finally(() => {
            setLoading(false);
          });
      }).catch((err) => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
    } else {
      setLoading(true);
      //Contrato sin archivo.
      await crearAdenda(params)
        .then(response => {
          handleSuccessMessages(
            intl.formatMessage({ id: "MESSAGES.SUCESS" }),
            intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" })
          );
          setModoEdicion(false);
          setOperadorModoEdicion(false);
          setDataRowEditNew({});
          cargarDatosContratoAdenda();
        })
        .catch(err => {
          handleErrorMessages(
            intl.formatMessage({ id: "MESSAGES.ERROR" }),
            err
          );
        })
        .finally(() => {
          setLoading(false);
        });
    }

    //*************************************************** */
  };

  const cancelarEdicionAdenda = () => {
    setModoEdicion(false);
    setOperadorModoEdicion(false);
    setDataRowEditNew({});
  };

  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  //Unidad Organizativa:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  const cargarDatosUnidadOrganizativa = async () => {
    setLoading(true);
    setListarTabs([]);

    let contratoUnidadOrganizativa = await serviceContratoUnidad.listar({
      IdCliente: perfil.IdCliente,
      IdContrato: varCurrentContrato.IdContrato,
      IdCompaniaMandante: varCurrentContrato.IdCompaniaMandante,
      IdCompaniaContratista: varCurrentContrato.IdCompaniaContratista
    }).finally(() => {
      setLoading(false);
    });

    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setModoEdicion(false);
    setListarTabs(contratoUnidadOrganizativa);
    console.log("***cargarDatosUnidadOrganizativa :> ", contratoUnidadOrganizativa);
  };

  const editarRegistroContratoUndOrganizativa = async dataRow => {
    console.log("editarRegistroContratoUndOrganizativa - dataRow :> ", dataRow);
    let { IdUnidadOrganizativa, Activo,ValidarDotacion } = dataRow;

    let params = {
      IdCliente: perfil.IdCliente,
      IdContrato: varCurrentContrato.IdContrato,
      IdCompaniaMandante: varCurrentContrato.IdCompaniaMandante,
      IdCompaniaContratista: varCurrentContrato.IdCompaniaContratista,
      IdUnidadOrganizativa,
      Activo
    };

    setLoading(true);
    let undOrganizativa = await serviceContratoUnidad.obtener(params).finally(
      () => {
        setLoading(false);
      }
    );
    setDataRowEditNew({ ...undOrganizativa, esNuevoRegistro: false,ValidarDotacion });
    setGrillaPersona([]);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    setModoEdicion(true);
  };

  const eliminarRegistroContratoUndOrganizativa = async dataRow => {
    let { IdUnidadOrganizativa } = dataRow;

    let params = {
      IdCliente: perfil.IdCliente,
      IdContrato: varCurrentContrato.IdContrato,
      IdCompaniaMandante: varCurrentContrato.IdCompaniaMandante,
      IdCompaniaContratista: varCurrentContrato.IdCompaniaContratista,
      IdUnidadOrganizativa
    };

    setLoading(true);
    await serviceContratoUnidad.eliminar(params)
      .then(response => {
        handleSuccessMessages(
          intl.formatMessage({ id: "MESSAGES.SUCESS" }),
          intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" })
        );
        setModoEdicion(false);
        setOperadorModoEdicion(false);
        setDataRowEditNew({});
        cargarDatosUnidadOrganizativa();
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const actualizarContratoUndOrganizativa = async dataRow => {
    const { IdUnidadOrganizativa, Activo, Dotacion, IdGrupoAcceso } = dataRow;

    let params = {
      IdCliente: perfil.IdCliente,
      IdContrato: varCurrentContrato.IdContrato,
      IdCompaniaMandante: varCurrentContrato.IdCompaniaMandante,
      IdCompaniaContratista: varCurrentContrato.IdCompaniaContratista,
      IdUsuario: usuario.username,
      IdUnidadOrganizativa,
      Activo,
      Dotacion,
      IdGrupoAcceso
    };

    ///************************************************** */
    setLoading(true);
    await serviceContratoUnidad.actualizar(params)
      .then(response => {
        handleSuccessMessages(
          intl.formatMessage({ id: "MESSAGES.SUCESS" }),
          intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" })
        );
        setModoEdicion(false);
        setOperadorModoEdicion(false);
        setDataRowEditNew({});
        cargarDatosUnidadOrganizativa();
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      })
      .finally(() => {
        setLoading(false);
      });
    //*************************************************** */
  };

  // const agregarContratoUndOrganizativa = async unidadesOrganizativas => {
  //   //JDL->2023-08-21
  //   //console.log("agregarCoitratoUnidadOrgainzativa", unidadesOrganizativas);

  //   const unidades = unidadesOrganizativas.map(unidad => {
  //     return { IdUnidadOrganizativa: unidad.IdUnidadOrganizativa, Activo: 'S' }
  //   });

  //   let params = {
  //     IdCliente: perfil.IdCliente,
  //     IdContrato: varCurrentContrato.IdContrato,
  //     IdCompaniaMandante: varCurrentContrato.IdCompaniaMandante,
  //     IdCompaniaContratista: varCurrentContrato.IdCompaniaContratista,
  //     IdUsuario: usuario.username,
  //     IdsUnidadOrganizativas: unidades
  //   };

  //   //console.log("params->", params);
  //   ///************************************************** */

  //   setLoading(true);

  //   await serviceContratoUnidad.crear(params)
  //     .then(response => {
  //       handleSuccessMessages(
  //         intl.formatMessage({ id: "MESSAGES.SUCESS" }),
  //         intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" })
  //       );
  //       setModoEdicion(false);
  //       setOperadorModoEdicion(false);
  //       setDataRowEditNew({});
  //       cargarDatosUnidadOrganizativa();
  //     })
  //     .catch(err => {
  //       handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
  //     })
  //     .finally(() => {
  //       setLoading(false);
  //     });

  //   //*************************************************** */
  // };
  const agregarContratoUndOrganizativa = async (unidadesOrganizativas,dotacion) => {
     //->LSF 20230919
    console.log("agregarContratoUndOrganizativa + Dotacion", unidadesOrganizativas);
    console.log("dotacion", dotacion);

    const unidades = unidadesOrganizativas.map(unidad => {
      return { IdUnidadOrganizativa: unidad.IdUnidadOrganizativa, Activo: 'S' }
    });

    let params = {
      IdCliente: perfil.IdCliente,
      IdContrato: varCurrentContrato.IdContrato,
      IdCompaniaMandante: varCurrentContrato.IdCompaniaMandante,
      IdCompaniaContratista: varCurrentContrato.IdCompaniaContratista,
      IdUsuario: usuario.username,
      IdsUnidadOrganizativas: unidades ,
      Dotacion: isNotEmpty(dotacion)?dotacion:''
    };

    console.log("params->", params);
    ///************************************************** */
 
    setLoading(true);

    await serviceContratoUnidad.crear(params)
      .then(response => {
        handleSuccessMessages(
          intl.formatMessage({ id: "MESSAGES.SUCESS" }),
          intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" })
        );
        setModoEdicion(false);
        setOperadorModoEdicion(false);
        setDataRowEditNew({});
        cargarDatosUnidadOrganizativa();
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      })
      .finally(() => {
        setLoading(false);
      });

    //*************************************************** */
  };

  const cancelarEdicionUndOrganizativa = () => {
    setModoEdicion(false);
    setOperadorModoEdicion(false);
    setDataRowEditNew({});
  };

  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  //Eventos centro de costo:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  const editarRegistroCentroCosto = async dataRow => {
    let {
      UnidadOrganizativa,
      IdUnidadOrganizativa,
      IdCentroCosto,
      Activo
    } = dataRow;

    let params = {
      IdCliente: perfil.IdCliente,
      IdContrato: varCurrentContrato.IdContrato,
      IdCompaniaMandante: varCurrentContrato.IdCompaniaMandante,
      IdCompaniaContratista: varCurrentContrato.IdCompaniaContratista,
      IdUnidadOrganizativa,
      IdCentroCosto,
      Activo
    };

    setLoading(true);
    let centroCosto = await obtenerCentroCosto(params).finally(() => {
      setLoading(false);
    });
    setDataRowEditNew({
      ...centroCosto,
      esNuevoRegistro: false,
      UnidadOrganizativa
    });
    //setGrillaPersona([]);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    setModoEdicion(true);
    setOperadorModoEdicion(true);
  };

  const eliminarRegistroCentroCosto = async dataRow => {
    let { IdUnidadOrganizativa, IdCentroCosto, Activo } = dataRow;

    let params = {
      IdCliente: perfil.IdCliente,
      IdContrato: varCurrentContrato.IdContrato,
      IdCompaniaMandante: varCurrentContrato.IdCompaniaMandante,
      IdCompaniaContratista: varCurrentContrato.IdCompaniaContratista,
      IdUnidadOrganizativa,
      IdCentroCosto
    };

    setLoading(true);
    await eliminarCentroCosto(params)
      .then(response => {
        handleSuccessMessages(
          intl.formatMessage({ id: "MESSAGES.SUCESS" }),
          intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" })
        );
        setModoEdicion(false);
        setOperadorModoEdicion(false);
        setDataRowEditNew({});
        cargarDatosUnidadOrganizativa();
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const nuevoRegistroCentroCosto = dataRow => {
    //console.log("nuevoRegistroCentroCosto:dataRow:",dataRow);
    let { IdUnidadOrganizativa, UnidadOrganizativa } = dataRow;

    listarCentroCostoByUnidadOrganizativa(dataRow);
    setModoEdicion(true);
    setOperadorModoEdicion(true);
    setDataRowEditNew({
      ...varCurrentContrato,
      esNuevoRegistro: true,
      IdUnidadOrganizativa,
      UnidadOrganizativa,
      Activo: "S"
    });


  };

  const actualizarContratoCentroCosto = async dataRow => {
    const { IdUnidadOrganizativa, IdCentroCosto, Activo } = dataRow;

    let params = {
      IdCliente: perfil.IdCliente,
      IdContrato: varCurrentContrato.IdContrato,
      IdCompaniaMandante: varCurrentContrato.IdCompaniaMandante,
      IdCompaniaContratista: varCurrentContrato.IdCompaniaContratista,
      IdUsuario: usuario.username,
      IdUnidadOrganizativa,
      IdCentroCosto,
      Activo
    };

    ///************************************************** */
    setLoading(true);
    actualizarCentroCosto(params)
      .then(response => {
        handleSuccessMessages(
          intl.formatMessage({ id: "MESSAGES.SUCESS" }),
          intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" })
        );
        setModoEdicion(false);
        setOperadorModoEdicion(false);
        setDataRowEditNew({});
        cargarDatosUnidadOrganizativa();
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      })
      .finally(() => {
        setLoading(false);
      });
    //*************************************************** */
  };

  const agregarContratoCentroCosto = async dataRow => {
    const { IdUnidadOrganizativa, IdCentroCosto, Activo } = dataRow;

    let params = {
      IdCliente: perfil.IdCliente,
      IdContrato: varCurrentContrato.IdContrato,
      IdCompaniaMandante: varCurrentContrato.IdCompaniaMandante,
      IdCompaniaContratista: varCurrentContrato.IdCompaniaContratista,
      IdUsuario: usuario.username,
      IdUnidadOrganizativa,
      IdCentroCosto,
      Activo
    };

    ///************************************************** */

    setLoading(true);

    crearCentroCosto(params)
      .then(response => {
        handleSuccessMessages(
          intl.formatMessage({ id: "MESSAGES.SUCESS" }),
          intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" })
        );
        setModoEdicion(false);
        setOperadorModoEdicion(false);
        setDataRowEditNew({});
        cargarDatosUnidadOrganizativa();
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      })
      .finally(() => {
        setLoading(false);
      });

    //*************************************************** */
  };

  const cancelarEdicionCentroCosto = () => {
    setModoEdicion(false);
    setOperadorModoEdicion(false);
    setDataRowEditNew({});
  };

  async function listarCentroCostoByUnidadOrganizativa(dataRow) {

    const { IdUnidadOrganizativa } = dataRow;
    //console.log("listarCentroCostoByUnidadOrganizativa:dataRow",dataRow);

    await serviceUnidadCentroCosto.listar({
      IdCliente: perfil.IdCliente,
      IdUnidadOrganizativa: IdUnidadOrganizativa,
      IdCentroCosto: '%',
      NumPagina: 0,
      TamPagina: 0
    }).then(uoCentroCostos => {
      // setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
      // setCentroCostos(uoCentroCostos);
      //console.log("listarCentroCostoByUnidadOrganizativa:uoCentroCostos",uoCentroCostos);
      (uoCentroCostos.length === 0) ? setIsVisibleAlert(true) : setIsVisibleAlert(false);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => {
      setLoading(false);
    });
  }

  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  //Tipo Vehiculo      :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  const cargarDatosTipoVehiculo = async () => {
    setLoading(true);
    setListarTabs([]);

    let contratoVehiculo = await listarVehiculo({
      IdCliente: perfil.IdCliente,
      IdContrato: varCurrentContrato.IdContrato,
      IdCompaniaMandante: varCurrentContrato.IdCompaniaMandante,
      IdCompaniaContratista: varCurrentContrato.IdCompaniaContratista
    }).finally(() => {
      setLoading(false);
    });

    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setModoEdicion(false);
    setListarTabs(contratoVehiculo);
  };

  const editarRegistroContratoTipoVehiculo = async dataRow => {
    let { IdTipoVehiculo, Dotacion, Activo } = dataRow;

    let params = {
      IdCliente: perfil.IdCliente,
      IdContrato: varCurrentContrato.IdContrato,
      IdCompaniaMandante: varCurrentContrato.IdCompaniaMandante,
      IdCompaniaContratista: varCurrentContrato.IdCompaniaContratista,
      IdTipoVehiculo,
      Dotacion,
      Activo
    };

    setLoading(true);
    let vehiculo = await obtenerVehiculo(params).finally(() => {
      setLoading(false);
    });
    setDataRowEditNew({ ...vehiculo, esNuevoRegistro: false });
    setGrillaPersona([]);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    setModoEdicion(true);
  };

  const eliminarRegistroContratoTipoVehiculo = async dataRow => {
    let { IdTipoVehiculo } = dataRow;

    let params = {
      IdCliente: perfil.IdCliente,
      IdContrato: varCurrentContrato.IdContrato,
      IdCompaniaMandante: varCurrentContrato.IdCompaniaMandante,
      IdCompaniaContratista: varCurrentContrato.IdCompaniaContratista,
      IdTipoVehiculo
    };

    setLoading(true);
    await eliminarVehiculo(params)
      .then(response => {
        handleSuccessMessages(
          intl.formatMessage({ id: "MESSAGES.SUCESS" }),
          intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" })
        );
        setModoEdicion(false);
        setOperadorModoEdicion(false);
        setDataRowEditNew({});
        cargarDatosTipoVehiculo();
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const actualizarContratoTipoVehiculo = async dataRow => {
    const { IdTipoVehiculo, Dotacion, ValidarDotacion, Activo } = dataRow;

    let params = {
      IdCliente: perfil.IdCliente,
      IdContrato: varCurrentContrato.IdContrato,
      IdCompaniaMandante: varCurrentContrato.IdCompaniaMandante,
      IdCompaniaContratista: varCurrentContrato.IdCompaniaContratista,
      IdUsuario: usuario.username,
      IdTipoVehiculo,
      Dotacion,
      ValidarDotacion,
      Activo
    };

    ///************************************************** */
    setLoading(true);
    actualizarVehiculo(params)
      .then(response => {
        handleSuccessMessages(
          intl.formatMessage({ id: "MESSAGES.SUCESS" }),
          intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" })
        );
        setModoEdicion(false);
        setOperadorModoEdicion(false);
        setDataRowEditNew({});
        cargarDatosTipoVehiculo();
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      })
      .finally(() => {
        setLoading(false);
      });
    //*************************************************** */
  };

  const agregarContratoTipoVehiculo = async dataRow => {
    const { IdTipoVehiculo, Dotacion, ValidarDotacion, Activo } = dataRow;

    let params = {
      IdCliente: perfil.IdCliente,
      IdContrato: varCurrentContrato.IdContrato,
      IdCompaniaMandante: varCurrentContrato.IdCompaniaMandante,
      IdCompaniaContratista: varCurrentContrato.IdCompaniaContratista,
      IdUsuario: usuario.username,
      IdTipoVehiculo,
      Dotacion: isNotEmpty(Dotacion) ? Dotacion : 0,
      ValidarDotacion,
      Activo
    };

    ///************************************************** */

    setLoading(true);

    crearVehiculo(params)
      .then(response => {
        handleSuccessMessages(
          intl.formatMessage({ id: "MESSAGES.SUCESS" }),
          intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" })
        );
        setModoEdicion(false);
        setOperadorModoEdicion(false);
        setDataRowEditNew({});
        cargarDatosTipoVehiculo();
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      })
      .finally(() => {
        setLoading(false);
      });

    //*************************************************** */
  };

  const cancelarEdicionTipoVehiculo = () => {
    setModoEdicion(false);
    setOperadorModoEdicion(false);
    setDataRowEditNew({});
  };



  async function eliminarListRowTab(dataRow, confirm, _nivel) {
    if (confirm) {
      switch (tabIndex) {
        case 0:
          eliminarRegistro(selected);
          break;
        case 2:
          nivel == 0
            ? eliminarRegistroContratoDivision(selected)
            : eliminarContratoDivisionOperador(selected);
          break;
        case 3:
          nivel == 0
            ? eliminarRegistroContratoUndOrganizativa(selected)
            : eliminarRegistroCentroCosto(selected);
          break;
        case 4:
          eliminarRegistroContratoSubContratista(selected);
          break;
        case 5:
          eliminarRegistroContratoTipoVehiculo(selected);
          break;
        case 6:
          eliminarRegistroContratoAdenda(selected);
          break;
      }
    } else {
      setIsVisible(true);
      setNivel(_nivel);
      setSelected(dataRow);
    }
  }


  //:::::::::::::::::::::::::::::::::::::::::::::-Configuración de tabs-:::::::::::::::::::::::::::::::::
  const titleHeaderToolbar = () => {
    let tabsTitles = [
      "",
      "",
      "ADMINISTRATION.CONTRACT.DIVISION_AND_OPERATORS",
      "ADMINISTRATION.ORGANIZATIONALUNIT.COSTCENTER.UO.TAB",
      "ADMINISTRATION.CONTRACT.SUBCONTRACTORS",
      "ADMINISTRATION.CONTRACT.VEHICLE.TAB",
      "ADMINISTRATION.CONTRACT.ADDENDUM",
      "ADMINISTRATION.CONTRACT.PERSONS",
    ];

    let sufix = tabsTitles[tabIndex] !== "" ? (" - " + `${intl.formatMessage({ id: tabsTitles[tabIndex] })}`) : "";

    return `${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} ` + "  " + sufix;
  }
  const tabsDisabled = () => {
    return isNotEmpty(varIdContrato) ? false : true;
    //return true;
  }

  const tabContent_ContratoListPage = () => {
    return <>{!modoEdicion && (
      <ContratoListPage
        Contrato={listarTabs}
        editarRegistro={editarRegistro}
        eliminarRegistro={eliminarListRowTab}
        nuevoRegistro={nuevoRegistro}
        seleccionarRegistro={seleccionarRegistro}
        verRegistroDblClick={verRegistroDblClick}
        mostrarPopUpPersonas={mostrarPopUpPersonas}
        focusedRowKey={focusedRowKey}
        setFocusedRowKey={setFocusedRowKey}
        pathFile={""}
        //Custom grid: ::::::::::::::::::::::::::::::::
        isFirstDataLoad={isFirstDataLoad}
        setIsFirstDataLoad={setIsFirstDataLoad}
        dataSource={dataSource}
        refresh={refresh}
        resetLoadOptions={resetLoadOptions}
        refreshData={refreshData}
        setRefreshData={setRefreshData}
        dataMenuInfo={dataMenu.info}
        setVarIdContrato={setVarIdContrato}
        totalRowIndex={totalRowIndex}
        setTotalRowIndex={setTotalRowIndex}
        accessButton={accessButton}
        showButtons={true}
      //::::::::::::::::::::::::::::::::::::::::
      />
    )
    }
      {
        modoEdicion && (
          <>
            <ContratoEditPage
              titulo={titulo}
              modoEdicion={modoEdicion}
              dataRowEditNew={dataRowEditNew}
              setDataRowEditNew={setDataRowEditNew}
              actualizarContrato={actualizarContrato}
              agregarContrato={agregarContrato}
              cancelarEdicion={cancelarEdicion}
              dataCheck={dataCheck}
              setDatacheck={setDatacheck}
              idAplicacion={dataMenu.info.IdAplicacion}
              idModulo={dataMenu.info.IdModulo}
              idMenu={dataMenu.info.IdMenu}
              accessButton={accessButton}
            />
            <div className="container_only">
              <div className="float-right">
                <ControlSwitch
                  checked={auditoriaSwitch}
                  onChange={e => {
                    setAuditoriaSwitch(e.target.checked);
                  }}
                />
                <b> {intl.formatMessage({ id: "AUDIT.DATA" })}</b>
              </div>
            </div>
            {auditoriaSwitch && (
              <AuditoriaPage dataRowEditNew={dataRowEditNew} />
            )}
          </>
        )
      }
    </>
  }


  const tabContent_ContratoEditPage = () => {
    return <>
      <ContratoEditPage
        titulo={intl.formatMessage({ id: "ACTION.VIEW" })}
        modoEdicion={modoEdicion}
        dataRowEditNew={dataRowEditNew}
        cancelarEdicion={cancelarEdicion}
        dataCheck={dataCheck}
        setDatacheck={setDatacheck}
        idAplicacion={dataMenu.info.IdAplicacion}
        idModulo={dataMenu.info.IdModulo}
        idMenu={dataMenu.info.IdMenu}
        accessButton={accessButton}

      />
      <div className="container_only">
        <div className="float-right">
          <ControlSwitch
            checked={auditoriaSwitch}
            onChange={e => {
              setAuditoriaSwitch(e.target.checked);
            }}
          />
          <b> {intl.formatMessage({ id: "AUDIT.DATA" })}</b>
        </div>
      </div>
      {auditoriaSwitch && (
        <AuditoriaPage dataRowEditNew={dataRowEditNew} />
      )}
    </>
  }

  const tabContent_ContratoDivisionListPage = () => {
    return <>
      {!modoEdicion ? (
        <ContratoDivisionListPage
          ContratoDivision={listarTabs}
          editarRegistro={editarRegistroContratoDivision}
          eliminarRegistro={eliminarListRowTab}
          nuevoRegistro={nuevoRegistro}
          cancelarEdicion={cancelarEdicion}
          agregarOperador={agregarOperador}
          getInfo={getInfo}
          showButton={true}
          grillaPersona={grillaPersona}
          editarRegistroOperador={editarContratoDivisionOperador}
          eliminarRegistroOperador={eliminarListRowTab}
          accessButton={accessButton}
        />
      ) : !OperadormodoEdicion ? (
        <>
          <ContratoDivisionEditPage
            titulo={titulo}
            modoEdicion={modoEdicion}
            dataRowEditNew={dataRowEditNew}
            setDataRowEditNew={setDataRowEditNew}
            actualizarContratoDivision={actualizarContratoDivision}
            agregarContratoDivision={agregarContratoDivision}
            cancelarEdicion={cancelarEdicionDivision}
            Contrato={varCurrentContrato}
            getInfo={getInfo}
            showButton={true}
            grillaPersona={grillaPersona}
            setGrillaPersona={setGrillaPersona}
            accessButton={accessButton}

          />
          <div className="container_only">
            <div className="float-right">
              <ControlSwitch
                checked={auditoriaSwitch}
                onChange={e => {
                  setAuditoriaSwitch(e.target.checked);
                }}
              />
              <b> {intl.formatMessage({ id: "AUDIT.DATA" })}</b>
            </div>
          </div>
          {auditoriaSwitch && (
            <AuditoriaPage dataRowEditNew={dataRowEditNew} />
          )}
        </>
      ) : (
        <>
          <ContratoDivisionOperadorEditPage
            titulo={titulo}
            modoEdicion={modoEdicion}
            dataRowEditNew={dataRowEditNew}
            setDataRowEditNew={setDataRowEditNew}
            actualizarContratoDivisionOperador={
              actualizarContratoDivisionOperador
            }
            agregarContratoDivisionOperador={
              crearContratoDivisionOperador
            }
            cancelarEdicion={cancelarEdicionDivisionOperador}
            getInfo={getInfo}
            showButton={true}
            grillaPersona={grillaPersona}
            setGrillaPersona={setGrillaPersona}
            accessButton={accessButton}
          />
          <div className="container_only">
            <div className="float-right">
              <ControlSwitch
                checked={auditoriaSwitch}
                onChange={e => {
                  setAuditoriaSwitch(e.target.checked);
                }}
              />
              <b> {intl.formatMessage({ id: "AUDIT.DATA" })}</b>
            </div>
          </div>
          {auditoriaSwitch && (
            <AuditoriaPage dataRowEditNew={dataRowEditNew} />
          )}
        </>
      )}
    </>
  }

  const tabContent_ContratoUnidadOrganizativaListPage = () => {

    /*return <>
      <ContratoUnidadOrganizativaListPage_v2
        getInfo={getInfo}
        contratoActual={varCurrentContrato}
        setLoading={setLoading}
      />
    </>*/

    return <>
      {!modoEdicion ? (
        <>
          <ContratoUnidadOrganizativaListPage
            UnidadesOrganizativas={listarTabs}
            editarRegistro={editarRegistroContratoUndOrganizativa}
            eliminarRegistro={eliminarListRowTab}
            nuevoRegistro={() => {
              console.log("selected.ValidarDotacion :> ", selected.ValidarDotacion);
              console.log("selected :> ", selected);
              if (selected.ValidarDotacion == "Y") {
                setisVisibleUnidadOrganizativaDotacion(true);
              } else {
                setisVisibleUnidadOrganizativa(true);
              }
            }}
            showButton={true}
            getInfo={getInfo}
            editarRegistroCentroCosto={editarRegistroCentroCosto}
            eliminarRegistroCentroCosto={eliminarListRowTab}
            nuevoRegistroCentroCosto={nuevoRegistroCentroCosto}
            cancelarEdicion={cancelarEdicion}
            accessButton={accessButton}

          />
          {
            isVisibleUnidadOrganizativa && (
              <AdministracionContratoUnidadOrganizativaBuscar
                contratoActual = {varCurrentContrato}
                selectData={agregarContratoUndOrganizativa}
                showPopup={{ isVisiblePopUp: isVisibleUnidadOrganizativa, setisVisiblePopUp: setisVisibleUnidadOrganizativa }}
                cancelarEdicion={() => setisVisibleUnidadOrganizativa(false)}
                IdCliente={perfil.IdCliente}
                selectionMode="multiple"
                showCheckBoxesModes="normal"
              />
            )
          }
          {
            isVisibleUnidadOrganizativaDotacion && (
              <AdministracionContratoUnidadOrganizativaDotacionBuscar
                contratoActual = {varCurrentContrato}
                selectData={agregarContratoUndOrganizativa}//agregarContratoUndOrganizativaDotacion
                showPopup={{ isVisiblePopUp: isVisibleUnidadOrganizativaDotacion, setisVisiblePopUp: setisVisibleUnidadOrganizativaDotacion }}
                cancelarEdicion={() => setisVisibleUnidadOrganizativaDotacion(false)}
                IdCliente={perfil.IdCliente}
                selectionMode="multiple"
                showCheckBoxesModes="normal"
              />
            )
          }
        </>
      ) : !OperadormodoEdicion ? (
        <>
          <ContratoUnidadOrganizativaEditPage
            titulo={titulo}
            modoEdicion={modoEdicion}
            dataRowEditNew={dataRowEditNew}
            setDataRowEditNew={setDataRowEditNew}
            actualizarContratoUndOrganizativa={
              actualizarContratoUndOrganizativa
            }
            agregarContratoUndOrganizativa={
              agregarContratoUndOrganizativa
            }
            cancelarEdicion={cancelarEdicionUndOrganizativa}
            UnidadesOrganizativas={unidadesOrganizativas}
            IdCliente={perfil.IdCliente}
            showButton={true}
            getInfo={getInfo}
            accessButton={accessButton}

          />
          <div className="container_only">
            <div className="float-right">
              <ControlSwitch
                checked={auditoriaSwitch}
                onChange={e => {
                  setAuditoriaSwitch(e.target.checked);
                }}
              />
              <b> {intl.formatMessage({ id: "AUDIT.DATA" })}</b>
            </div>
          </div>
          {auditoriaSwitch && (
            <AuditoriaPage dataRowEditNew={dataRowEditNew} />
          )}
        </>
      ) : (
        <>
          <ContratoCentroCostoEditPage
            titulo={titulo}
            modoEdicion={modoEdicion}
            dataRowEditNew={dataRowEditNew}
            setDataRowEditNew={setDataRowEditNew}
            actualizarContratoCentroCosto={
              actualizarContratoCentroCosto
            }
            agregarContratoCentroCosto={agregarContratoCentroCosto}
            cancelarEdicion={cancelarEdicionCentroCosto}
            showButton={true}
            getInfo={getInfo}
            isVisibleAlert={isVisibleAlert}
            accessButton={accessButton}

          />
          <div className="container_only">
            <div className="float-right">
              <ControlSwitch
                checked={auditoriaSwitch}
                onChange={e => {
                  setAuditoriaSwitch(e.target.checked);
                }}
              />
              <b> {intl.formatMessage({ id: "AUDIT.DATA" })}</b>
            </div>
          </div>
          {auditoriaSwitch && (
            <AuditoriaPage dataRowEditNew={dataRowEditNew} />
          )}
        </>
      )}
    </>
  }

  const tabContent_ContratoSubcontratistaListPage = () => {
    return <>
      {!modoEdicion ? (
        <ContratoSubcontratistaListPage
          Subcontratistas={listarTabs}
          editarRegistro={editarRegistroContratoSubContratista}
          eliminarRegistro={eliminarListRowTab}
          nuevoRegistro={nuevoRegistro}
          showButton={true}
          getInfo={getInfo}
          agregarSubcontratista={nuevoSubcontratista}
          cancelarEdicion={cancelarEdicion}
          accessButton={accessButton}

        />
      ) : (
        <>
          <ContratoSubcontratistaEditPage
            titulo={titulo}
            modoEdicion={modoEdicion}
            dataRowEditNew={dataRowEditNew}
            setDataRowEditNew={setDataRowEditNew}
            actualizarContratoSubContratista={
              actualizarContratoSubContratista
            }
            agregarContratoSubcontratista={
              agregarContratoSubcontratista
            }
            cancelarEdicion={cancelarEdicionSubcontratista}
            companias={companias}
            pathFile={""}
            showButton={true}
            getInfo={getInfo}
            accessButton={accessButton}

          />
          <div className="container_only">
            <div className="float-right">
              <ControlSwitch
                checked={auditoriaSwitch}
                onChange={e => {
                  setAuditoriaSwitch(e.target.checked);
                }}
              />
              <b> {intl.formatMessage({ id: "AUDIT.DATA" })}</b>
            </div>
          </div>
          {auditoriaSwitch && (
            <AuditoriaPage dataRowEditNew={dataRowEditNew} />
          )}
        </>
      )}
    </>
  }

  const tabContent_ContratoVehiculoListPage = () => {
    return <>
      {!modoEdicion ? (
        <ContratoVehiculoListPage
          UnidadesOrganizativas={listarTabs}
          editarRegistro={editarRegistroContratoTipoVehiculo}
          eliminarRegistro={eliminarListRowTab}
          nuevoRegistro={nuevoRegistro}
          showButton={true}
          getInfo={getInfo}
          cancelarEdicion={cancelarEdicion}
          accessButton={accessButton}

        />
      ) : (
        <>
          <ContratoVehiculoEditPage
            titulo={titulo}
            modoEdicion={modoEdicion}
            dataRowEditNew={dataRowEditNew}
            setDataRowEditNew={setDataRowEditNew}
            actualizarContratoTipoVehiculo={
              actualizarContratoTipoVehiculo
            }
            agregarContratoTipoVehiculo={
              agregarContratoTipoVehiculo
            }
            cancelarEdicion={cancelarEdicionTipoVehiculo}
            TipoVehiculos={TipoVehiculos}
            showButton={true}
            getInfo={getInfo}
            accessButton={accessButton}

          />
          <div className="container_only">
            <div className="float-right">
              <ControlSwitch
                checked={auditoriaSwitch}
                onChange={e => {
                  setAuditoriaSwitch(e.target.checked);
                }}
              />
              <b> {intl.formatMessage({ id: "AUDIT.DATA" })}</b>
            </div>
          </div>
          {auditoriaSwitch && (
            <AuditoriaPage dataRowEditNew={dataRowEditNew} />
          )}
        </>
      )}
    </>
  }

  const tabContent_ContratoAdendaListPage = () => {
    return <>
      {!modoEdicion ? (
        <ContratoAdendaListPage
          Adendas={listarTabs}
          editarRegistro={editarRegistroContratoAdenda}
          eliminarRegistro={eliminarListRowTab}
          nuevoRegistro={nuevoRegistro}
          showButton={true}
          getInfo={getInfo}
          cancelarEdicion={cancelarEdicion}
          idAplicacion={dataMenu.info.IdAplicacion}
          idModulo={dataMenu.info.IdModulo}
          idMenu="030201" // 05-07-2022 SE ESTÁ ASIGNANDO EL IDMENU PORQUE UN FORMULARIO NO PUEDE TENER MÁS DE UNA RUTA Y LAS ADENDAS TIENEN SU PROPIO DIRECTORIO
          accessButton={accessButton}

        />
      ) : (
        <>
          <ContratoAdendaEditPage
            titulo={titulo}
            modoEdicion={modoEdicion}
            dataRowEditNew={dataRowEditNew}
            setDataRowEditNew={setDataRowEditNew}
            actualizarContratoAdenda={actualizarContratoAdenda}
            agregarContratoAdenda={agregarContratoAdenda}
            cancelarEdicion={cancelarEdicionAdenda}
            companias={companias}
            showButton={true}
            getInfo={getInfo}
            idAplicacion={dataMenu.info.IdAplicacion}
            idModulo={dataMenu.info.IdModulo}
            idMenu="030201" // 05-07-2022 SE ESTÁ ASIGNANDO EL IDMENU PORQUE UN FORMULARIO NO PUEDE TENER MÁS DE UNA RUTA Y LAS ADENDAS TIENEN SU PROPIO DIRECTORIO
            accessButton={accessButton}
          />
          <div className="container_only">
            <div className="float-right">
              <ControlSwitch
                checked={auditoriaSwitch}
                onChange={e => {
                  setAuditoriaSwitch(e.target.checked);
                }}
              />
              <b> {intl.formatMessage({ id: "AUDIT.DATA" })}</b>
            </div>
          </div>
          {auditoriaSwitch && (
            <AuditoriaPage dataRowEditNew={dataRowEditNew} />
          )}
        </>
      )}
    </>
  }


  //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  return (
    <>
      <a id="iddescarga" className="" ></a>
      <TabNavContainer
        title={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.MENU" })}
        subtitle={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.MAINTENANCE" })}
        nombrebarra={titleHeaderToolbar()}
        tabIndex={tabIndex}
        handleChange={handleChange}
        componentTabsHeaders={[
          {
            label: intl.formatMessage({ id: "ACTION.LIST" }),
            icon: <FormatListNumberedIcon fontSize="large" />,
          },
          {
            label: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CONTRACT" }),
            icon: <InsertDriveFile fontSize="large" />,
            onClick: (e) => { cargarRegistroSeleccioando() },
            disabled: tabsDisabled()
          },
          {
            label: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.DIVISION_AND_OPERATORS" }),
            icon: <PeopleAltOutlinedIcon fontSize="large" />,
            onClick: (e) => { cargarDatosContratoDivision() },
            disabled: !tabsDisabled() && accessButton.Tabs[2] ? false : true
          },
          {
            label: intl.formatMessage({ id: "ADMINISTRATION.ORGANIZATIONALUNIT.COSTCENTER.UO.TAB" }),
            icon: <AccountTreeIcon fontSize="large" />,
            onClick: () => { cargarDatosUnidadOrganizativa() },
            disabled: !tabsDisabled() && accessButton.Tabs[3] ? false : true
          },
          {
            label: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.SUBCONTRACTORS" }),
            icon: <Description fontSize="large" />,
            onClick: () => { cargarDatosContratoSubcontratista() },
            disabled: !tabsDisabled() && accessButton.Tabs[4] ? false : true
          },
          {
            label: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.VEHICLE.TAB" }), //The change was request by jincil
            icon: <Description fontSize="large" />,
            onClick: () => { cargarDatosTipoVehiculo() },
            disabled: !tabsDisabled() && accessButton.Tabs[5] ? false : true
          },
          {
            label: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.ADDENDUM" }),
            icon: <ListAltIcon fontSize="large" />,
            onClick: () => { cargarDatosContratoAdenda() },
            disabled: !tabsDisabled() && accessButton.Tabs[6] ? false : true
          },
        ]}
        className={classes.tabContent}
        componentTabsBody={
          [
            tabContent_ContratoListPage(),
            tabContent_ContratoEditPage(),
            tabContent_ContratoDivisionListPage(),
            tabContent_ContratoUnidadOrganizativaListPage(),
            tabContent_ContratoSubcontratistaListPage(),
            tabContent_ContratoVehiculoListPage(),
            tabContent_ContratoAdendaListPage(),
          ]
        }
      />


      <Confirm
        message={intl.formatMessage({ id: "ALERT.REMOVE" })}
        isVisible={isVisible}
        setIsVisible={setIsVisible}
        onConfirm={() => eliminarListRowTab({}, true)}
        title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
        confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
        cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}

      />

      {/*******>POPUP DE PERSONAS POR CONTRATO>****************************** */}
      {popupVisibleContrato && (
        <AdministracionContratoPersonas
          uniqueId={"ListContratoXPersona"}
          showPopup={{ isVisiblePopUp: popupVisibleContrato, setisVisiblePopUp: setPopupVisibleContrato }}
          cancelar={() => setPopupVisibleContrato(false)}
          filtroLocal={filtroLocal}
          getInfo={getInfo}
          accessButton={accessButton}
          dataContract={dataContract}
          dataContractAux={dataContractAux}
        />
      )}

    </>
  );
};




export default injectIntl(WithLoandingPanel(ContratoIndexPage));
