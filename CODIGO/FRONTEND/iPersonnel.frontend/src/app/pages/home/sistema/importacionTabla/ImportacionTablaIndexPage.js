import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";

import PropTypes from 'prop-types';
import { isNotEmpty } from "../../../../../_metronic";
import { getButtonPermissions, defaultPermissions } from '../../../../../_metronic/utils/securityUtils'
import { Portlet } from "../../../../partials/content/Portlet";
import { handleErrorMessages, handleInfoMessages, handleSuccessMessages } from "../../../../store/ducks/notify-messages";
import { useStylesEncabezado, useStylesTab } from "../../../../store/config/Styles";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import Confirm from "../../../../partials/components/Confirm";
import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import TabOutlined from '@material-ui/icons/TabOutlined';
import Ballot from '@material-ui/icons/Ballot';
import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";
import { service } from "../../../../api/sistema/importacionTabla.api";
import { service as serviceDetalle } from "../../../../api/sistema/importacionDetalle.api";
import ImportacionTablaEditPage from "./ImportacionTablaEditPage";
import ImportacionTablaListPage from "./ImportacionTablaListPage";
import ImportacionDetalleEditPage from "../importacionDetalle/ImportacionDetalleEditPage";
import ImportacionDetalleBD from "../importacionDetalle/ImportacionDetalleBD";

import ImportacionDetalleListPage from "../importacionDetalle/ImportacionDetalleListPage";
import TabNavContainer from "../../../../partials/components/Tabs/TabNavContainer";

const ImportacionTablaIndexPage = (props) => {
    const { intl, setLoading, dataMenu } = props;
    const perfil = useSelector(state => state.perfil.perfilActual);

    const classesEncabezado = useStylesEncabezado();
    const classes = useStylesTab();

    const [importacionData, setImportacionData] = useState([]);
    const [varIdTabla, setVarIdTabla] = useState("");
    const [focusedRowKey, setFocusedRowKey] = useState();
    const [focusedRowKeyDetalle, setFocusedRowKeyDetalle] = useState();


    const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
    const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
    const [dataRowEditNew, setDataRowEditNew] = useState({});
    const [modoEdicion, setModoEdicion] = useState(false);
    const [selected, setSelected] = useState({});
    const [selectedDelete, setSelectedDelete] = useState({});

    const [isImportBD, setIsImportBD] = useState(false);

    const [tabIndex, setTabIndex] = useState(0);
    const handleChange = (event, newValue) => { setTabIndex(newValue); };

    const [listarTabs, setListarTabs] = useState([]);
    const [tituloTabs, setTituloTabs] = useState(intl.formatMessage({ id: "ACTION.LIST" }));

    const [isVisible, setIsVisible] = useState(false);
    const [instance, setInstance] = useState({});

    const [dataTableFromBD, setDataTableFromBD] = useState([]);


    //::::::::::::::::::::::FUNCION TABLA:::::::::::::::::::::::::::::::::::::::::::::::::

    async function agregarImportacion(dataRow) {
        setLoading(true);
        const { Tabla, Descripcion, Prioridad, Importar } = dataRow;
        let params = {
             IdDivision: perfil.IdDivision
            ,Tabla: isNotEmpty(Tabla) ? Tabla.toUpperCase() : ""
            ,Descripcion: isNotEmpty(Descripcion) ? Descripcion.toUpperCase() : ""
            ,Prioridad: isNotEmpty(Prioridad) ? Prioridad : 0
            ,Importar: isNotEmpty(Importar) ? Importar.toUpperCase() : ""
        }
        await service.crear(params).then(response => {
            if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
            setModoEdicion(false);
            listarImportacion();
            setFocusedRowKey();
            setVarIdTabla("");
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
    }

    async function actualizarImportacion(dataRow) {
        setLoading(true);
        const { IdCliente, IdDivision, Tabla,Descripcion, Prioridad, Importar } = dataRow;
        let params = {
              IdCliente: IdCliente
            , IdDivision: IdDivision
            , Tabla: isNotEmpty(Tabla) ? Tabla.toUpperCase() : ""
            , Descripcion: isNotEmpty(Descripcion) ? Descripcion.toUpperCase() : ""
            , Prioridad: isNotEmpty(Prioridad) ? Prioridad : 0
            , Importar: isNotEmpty(Importar) ? Importar.toUpperCase() : ""
        }
        await service.actualizar(params).then(response => {
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
            setModoEdicion(false);
            listarImportacion();
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
    }

    async function eliminarRegistro(dataRow, confirm) {
        setSelectedDelete(dataRow);
        setIsVisible(true);
        if (confirm) {
            setLoading(true);
            const { IdCliente,IdDivision,Tabla } = selectedDelete;
            await service.eliminar({
                IdCliente: IdCliente
              , IdDivision: IdDivision
              , Tabla: Tabla
            }).then(response => {
                handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
            }).catch(err => {
                handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
            }).finally(() => { setLoading(false); });
            listarImportacion();
            setFocusedRowKey();
            setVarIdTabla("");
        }
    }

    async function listarImportacion() {
        setLoading(true);
        await service.listar(
            {
               IdDivision : '%'
              ,Tabla :'%'
              ,NumPagina: 0
              ,TamPagina: 0
            }
        ).then(data => {
            setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
            setImportacionData(data);
            changeTabIndex(0);
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
    }

    async function obtenerImportacion() {
        setLoading(true);
        const { IdCliente,IdDivision,Tabla } = selected;
        await service.obtener({ 
           IdCliente :IdCliente
          ,IdDivision : IdDivision
          ,Tabla :Tabla
        }).then(data => {
            setDataRowEditNew({ ...data, esNuevoRegistro: false });
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
    }


    const nuevoRegistro = () => {
        changeTabIndex(1);
        let data = { Activo: "S" ,Importar:'S' };
        setDataRowEditNew({ ...data, esNuevoRegistro: true });
        setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
        setModoEdicion(true);
    };

    const editarRegistro = async (dataRow) => {
        changeTabIndex(1);
        const { IdImportacion, RowIndex } = dataRow;
        setModoEdicion(true);
        setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
        await obtenerImportacion();
    };

    const cancelarEdicion = () => {
        changeTabIndex(0);
        setModoEdicion(false);
        setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
        setDataRowEditNew({});
    };

    const seleccionarRegistro = dataRow => {
        const { Tabla, RowIndex } = dataRow;
        setModoEdicion(false);
        setSelected(dataRow);
        setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
        setVarIdTabla(Tabla);
        setFocusedRowKey(RowIndex);
    
    }

    const verRegistroDblClick = async (dataRow) => {
        changeTabIndex(1);
        setModoEdicion(false);
        await obtenerImportacion(dataRow);
    };

    const nextDetail = async () => {
      listarDetalle() 
      changeTabIndex(2);
  };

    

    //::::::::::::::::::::::FUNCION DETALLE:::::::::::::::::::::::::::::::::::::::::::::::::

  async function agregarDetalle(dataRow) {
    setLoading(true);
    const { Campo, Obligatorio, Editable, Importar,TipoDato,TamanioDato,Formato,Titulo, Orden} = dataRow;
    let params = {
        IdDivision : perfil.IdDivision
      , Tabla: varIdTabla
      , Campo: isNotEmpty(Campo) ? Campo.toUpperCase() : ""
      , Obligatorio: isNotEmpty(Obligatorio) ? Obligatorio.toUpperCase() : ""
      , Editable: isNotEmpty(Editable) ? Editable.toUpperCase() : ""
      , Importar: isNotEmpty(Importar) ? Importar.toUpperCase() : ""
      , TipoDato: isNotEmpty(TipoDato) ? TipoDato.toUpperCase() : ""
      , TamanioDato: isNotEmpty(TamanioDato) ? TamanioDato : 0
      , Formato: isNotEmpty(Formato) ? Formato : ""
      , Titulo: isNotEmpty(Titulo) ? Titulo : ""
      , Orden: isNotEmpty(Orden) ? Orden : 0
    };
    await serviceDetalle.crear(params).then(response => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      listarDetalle();
      setFocusedRowKeyDetalle();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }


  async function actualizarDetalle(dataRow) {
    setLoading(true);
    const { IdCliente, IdDivision,Tabla,Campo, Obligatorio, Editable, Importar,TipoDato,TamanioDato,Formato,Titulo, Orden } = dataRow;
    let params = {
        IdCliente : IdCliente
      , IdDivision : IdDivision
      , Tabla: Tabla
      , Campo: Campo
      , Obligatorio: isNotEmpty(Obligatorio) ? Obligatorio.toUpperCase() : ""
      , Editable: isNotEmpty(Editable) ? Editable.toUpperCase() : ""
      , Importar: isNotEmpty(Importar) ? Importar.toUpperCase() : ""
      , TipoDato: isNotEmpty(TipoDato) ? TipoDato.toUpperCase() : ""
      , TamanioDato: isNotEmpty(TamanioDato) ? TamanioDato : 0
      , Formato: isNotEmpty(Formato) ? Formato : ""
      , Titulo: isNotEmpty(Titulo) ? Titulo : ""
      , Orden: isNotEmpty(Orden) ? Orden : 0
    };
    await serviceDetalle.actualizar(params).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      listarDetalle();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function eliminarRegistroDetalle(dataRow, confirm) {
    setSelectedDelete(dataRow);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdDivision, Tabla, Campo } = selectedDelete;
      await serviceDetalle.eliminar({
          IdDivision : IdDivision
        , Tabla: Tabla
        , Campo: Campo
      }).then(response => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
      listarDetalle();
    }
  }

  async function listarDetalle() {
    setLoading(true);

    await serviceDetalle.listar({
      IdDivision: perfil.IdDivision,
      Tabla: varIdTabla,
      Campo: '%',
      NumPagina: 0,
      TamPagina: 0
    }).then(data => {
      setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
      setListarTabs(data);
      setModoEdicion(false);
      setFocusedRowKeyDetalle();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });

  }


  async function obtenerDetalle(dataRow) {
      setLoading(true);
      const { IdDivision, Tabla, Campo } = dataRow;
      await serviceDetalle.obtener({
        IdDivision: IdDivision,
        Tabla: Tabla,
        Campo: Campo,
      }).then(data => {
        setDataRowEditNew({ ...data, esNuevoRegistro: false });
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      })
        .finally(() => { setLoading(false); });
  }

  const seleccionarRegistroDetalle = dataRow => {
      const { RowIndex } = dataRow;
      setFocusedRowKeyDetalle(RowIndex);
  }

  const editarRegistroDetalle = async (dataRow) => {
    const { IdDivision, Tabla, Campo } = dataRow;
    setIsImportBD(false);
    setModoEdicion(true);
    setTituloTabs(intl.formatMessage({ id: "ACTION.EDIT" }));
    await obtenerDetalle(dataRow);
  };

  const nuevoRegistroDetalle = () => {
    let nuevo = { Activo: "S" };
    setIsImportBD(false);
    setDataRowEditNew({ ...nuevo, esNuevoRegistro: true });
    setTituloTabs(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
  };


  const cancelarEdicionDetalle = () => {
    setModoEdicion(false);
    setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };

   //:::::::::::::::::::::: FUNCION CARGA DESDE BASE DE DATOS :::::::::::::::::::::::::::::::::::::::::::::::::



  const importarFromBD =  async () => {
    setLoading(true);
    await serviceDetalle.obtenerDetalleTabla({
      Tabla: varIdTabla,
    }).then(data => {
      // console.log("importarFromBD|data:",data);
      if(data){

        if (data.length === 0){
          handleInfoMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), intl.formatMessage({ id: "SYSTEM.IMPORT.DATABD.VALIDATIONIMPORTED" })) ;
        return;
        }  

        if(data[0].IfExist === 1){
          setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
          setDataTableFromBD(data);
          setModoEdicion(true);
          setIsImportBD(true);
          handleInfoMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), intl.formatMessage({ id: "SYSTEM.IMPORT.DATABD.INFO" }))

        }else{
          handleInfoMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), intl.formatMessage({ id: "SYSTEM.IMPORT.DATABD.VALIDATIONEXISTS" }))
          setModoEdicion(false);
          setIsImportBD(false);
        }
      }
      
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });


}

async function agregarCamposFromBD(arrayFields) {
  // console.log("agregarCamposFromBD|arrayFields:",arrayFields);
  setLoading(true);
  let params = {
      IdDivision : perfil.IdDivision
    , Tabla: varIdTabla
    , arrayFields : arrayFields
  };
  await serviceDetalle.crearDetalleTablaDesdeBD(params).then(response => {
    // if (response)
    handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.IMPORT.BD" }));
    listarDetalle();
    setModoEdicion(false);
  }).catch(err => {
    handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
  }).finally(() => { setLoading(false); });
}


    /************--Configuración de acceso de botones*************/
    const [accessButton, setAccessButton] = useState(defaultPermissions);

    const loadControlsPermission = () => {
        let buttonsPermissions = getButtonPermissions(dataMenu.objetos);
        setAccessButton({ ...accessButton, ...buttonsPermissions });
    }
    /***********************************************************************/

    const changeTabIndex = (index) => {
        handleChange(null, index);
    }

    useEffect(() => {
      // console.log("useEffect|entro");
        listarImportacion();
        loadControlsPermission();
    },[]);

    const getInfo = () => {
      const { Tabla,Descripcion } = selected;
      return [
        { text: [intl.formatMessage({ id: "SYSTEM.IMPORT.TABLE" })], value: Tabla, colSpan: 2 },
        { text: [intl.formatMessage({ id: "SYSTEM.IMPORT.DESCRIPTION" })], value: Descripcion, colSpan: 4 }
      ];
    }

//:::::::::::::::::::: CONFIG TABS :::::::::::::::::::::::::::::::::::

async function eliminarListRowTab(selected, confirm) {
  let currentTab = tabIndex;
  switch (currentTab) {
    case 0:
      eliminarRegistro(selected, confirm);
      break;
    case 2:
      eliminarRegistroDetalle(selected, confirm) 
      break;
 
  }
}


   const titleHeaderToolbar = () => {
    return `${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} `;
  }

  const tabsDisabled = () => {
    return isNotEmpty(varIdTabla) ? false : true;
  }

  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::-Configuración - Tabs::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::


    const tabContent_ImportacionTablaListPage = () => {
      return <>
         <ImportacionTablaListPage
            titulo={titulo}
            importacionData={importacionData}
            editarRegistro={editarRegistro}
            eliminarRegistro={eliminarRegistro}
            nuevoRegistro={nuevoRegistro}
            seleccionarRegistro={seleccionarRegistro}
            verRegistroDblClick={verRegistroDblClick}
            nextDetail ={nextDetail}
            focusedRowKey={focusedRowKey}
            accessButton={accessButton}
        />
      </>
    }
  
    const tabContent_ImportacionTablaEditPage = () => {
      return <>
         <ImportacionTablaEditPage
          modoEdicion={modoEdicion}
          dataRowEditNew={dataRowEditNew}
          actualizarImportacion={actualizarImportacion}
          agregarImportacion={agregarImportacion}
          cancelarEdicion={cancelarEdicion}
          titulo={titulo}
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


    const tabContent_ImportacionTablaDetalleListPage = () => {
      return <>
        {modoEdicion && (
          <>
          {isImportBD ? (
        <ImportacionDetalleBD
        dataFromBD = { dataTableFromBD }
        setDataTableFromBD = {setDataTableFromBD}
        agregarCamposFromBD = {agregarCamposFromBD}
        cancelarEdicion={cancelarEdicionDetalle}
        modoEdicion={modoEdicion}
        accessButton={accessButton}
        settingDataField={dataMenu.datos}
        getInfo={getInfo}
        
        />
          ): (

            <ImportacionDetalleEditPage
                dataRowEditNew={dataRowEditNew}
                setDataRowEditNew ={setDataRowEditNew}
                actualizarDetalle={actualizarDetalle}
                agregarDetalle={agregarDetalle}
                cancelarEdicion={cancelarEdicionDetalle}
                titulo={tituloTabs}
                modoEdicion={modoEdicion}
                accessButton={accessButton}
                settingDataField={dataMenu.datos}
                getInfo={getInfo}
            />
          )} 
            

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
            <ImportacionDetalleListPage
               importacionDetalleData = { listarTabs }
               seleccionarRegistro = {seleccionarRegistroDetalle}
               importarFromBD={importarFromBD}
               eliminarRegistro={eliminarRegistroDetalle}
               editarRegistro={editarRegistroDetalle}
               nuevoRegistro={nuevoRegistroDetalle}
               cancelarEdicion={cancelarEdicion}
               getInfo={getInfo}
               focusedRowKey ={focusedRowKeyDetalle}
               accessButton={accessButton}
            />
          </>
        )}
      </>
    }
  

    return (
        <>
       
     <TabNavContainer
      title={intl.formatMessage({ id: "SYSTEM" })} 
      submenu={intl.formatMessage({ id: "SYSTEM.CONFIGURATION" })}
      subtitle={`${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} `}
      nombrebarra={titleHeaderToolbar()}
      tabIndex={tabIndex}
      handleChange={handleChange}
      componentTabsHeaders={[
        {
          label: intl.formatMessage({ id: "ACTION.LIST" }),
          icon: <FormatListNumberedIcon fontSize="large" />,
          disabled: false,
        },
        {
          label: intl.formatMessage({ id: "SYSTEM.IMPORT.TABLE" }),
          icon: <TabOutlined fontSize="large" />,
          onClick: () => { obtenerImportacion(selected) },
          disabled: !tabsDisabled() && accessButton.Tabs[1] ? false : true
        },
        {
          label: intl.formatMessage({ id: "SYSTEM.IMPORT.DETAIL" }),
          icon: <Ballot fontSize="large" />,
          onClick: () => { listarDetalle() },
          disabled: !tabsDisabled() && accessButton.Tabs[2] ? false : true
        },

      ]}
      className={classes.tabContent}
      componentTabsBody={
        [
          tabContent_ImportacionTablaListPage(),
          tabContent_ImportacionTablaEditPage(),
          tabContent_ImportacionTablaDetalleListPage(),

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


//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::


function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <Portlet
            component="div"
            role="tabpanel"
            hidden={value !== index}
            id={`vertical-tabpanel-${index}`}
            aria-labelledby={`vertical-tab-${index}`}
            {...other}
        >
            {value === index && <>{children}</>}
        </Portlet>
    );
}
TabPanel.propTypes =
{
    children: PropTypes.node,
    index: PropTypes.any.isRequired,
    value: PropTypes.any.isRequired,
};
function tabPropsIndex(index) {
    return {
        id: `vertical-tab-${index}`,
        'aria-controls': `vertical-tabpanel-${index}`,
    };
}

export default injectIntl(WithLoandingPanel(ImportacionTablaIndexPage));
