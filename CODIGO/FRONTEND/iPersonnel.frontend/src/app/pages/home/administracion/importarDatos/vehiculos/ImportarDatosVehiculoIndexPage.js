import React, { useEffect, useState } from "react";
import {
  handleErrorMessages,
   handleInfoMessages,
   handleSuccessMessages
} from "../../../../../store/ducks/notify-messages";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import { getButtonPermissions, defaultPermissions, setDisabledTabs } from '../../../../../../_metronic/utils/securityUtils'
import { useSelector } from "react-redux";
import { isNotEmpty} from "../../../../../../_metronic";
import CheckCircle from "@material-ui/icons/CheckCircle";
import HighlightOff from "@material-ui/icons/HighlightOff";

import {
  useStylesEncabezado,
  useStylesTab,
} from "../../../../../store/config/Styles";

//Multi-idioma
import { injectIntl } from "react-intl";

//Aditional
import { service as serviceSistemaImportacion } from "../../../../../api/sistema/importacionTabla.api"
import { service } from "../../../../../api/administracion/importacion.api";

import { PortletBody, PortletHeader, PortletHeaderToolbar,Portlet } from "../../../../../partials/content/Portlet";
import AppBar from '@material-ui/core/AppBar';
import PropTypes from 'prop-types';

import CustomBreadcrumbs from "../../../../../partials/layout/CustomBreadcrumbs";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";
import { Button } from "devextreme-react";
import { DataGrid, Column, Paging, Pager, FilterRow, HeaderFilter, FilterPanel, Selection, Editing,Summary,TotalItem , Button as ColumnButton, } from "devextreme-react/data-grid";
import TabNavContainer from "../../../../../partials/components/Tabs/TabNavContainer";

const ImportarDatosIndexPage = (props) => {

  const perfil = useSelector((state) => state.perfil.perfilActual);
  const { intl, setLoading, dataMenu } = props;
  const [dataTables, setDataTables] = useState([]);
  const [focusedRowKey, setFocusedRowKey] = useState();
  const [dataRowEditNew, setDataRowEditNew] = useState({Tabla:"ADMINISTRACION_IMPORTAR_VEHICULO"});
  const classes = useStylesTab();
  const classesEncabezado = useStylesEncabezado();
  const [dataProcesados,setDataProcesados] = useState ([]);
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    setTabIndex(newValue);
  };
 
  //Datos principales
  const [tabIndex, setTabIndex] = useState(0);
 
  const [accessButton, setAccessButton] = useState(defaultPermissions);

  const loadControlsPermission = () => {
    const numeroTabs = 2; //Nùmero de tab del formulario.
    let buttonsPermissions = getButtonPermissions(dataMenu.objetos);
    let newTabs = setDisabledTabs(dataMenu.objetos, numeroTabs);
    setAccessButton({ ...accessButton, ...buttonsPermissions, Tabs: newTabs });
  }

  async function cargarCombos() {
    let getDataTables =  await  serviceSistemaImportacion.obtenerTodos({IdDivision:perfil.IdDivision, Tabla:'%'});
    setDataTables(getDataTables);
  }
  
  useEffect(() => {
    loadControlsPermission();
    cargarCombos();
  }, []);

  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  const textEditing = {
    confirmDeleteMessage:'',
    editRow: intl.formatMessage({ id: "ACTION.EDIT" }),
    deleteRow: intl.formatMessage({ id: "ACTION.REMOVE" }),
}

  const changeTabIndex = (index) => {
    handleChange(null, index);
  };

  function onCellPrepared(e) {
    if (e.rowType === 'data') {
        if (e.data.Procesado === 'N') {
            e.cellElement.style.color = 'red';
        }
    }
}

  async function eventDownloadHeaders (e){ 
     const { Tabla } = dataRowEditNew;
    await service.descargarPlantillaVehiculo({ Tabla })
        .then(resp => {
            if (resp.error === 0) {
                let temp = `data:application/vnd.ms-excel;base64,${encodeURIComponent(resp.fileBase64)}`;
                let download = document.getElementById('iddescargaformato');
                download.href = temp;
                download.download = `${resp.nombre}.xlsx`;
                download.click();
            }
        })
  }

   const eventLoadData = async (e) => {

     let inputFile = document.getElementById(`btn_Excel_0001`);
     if (inputFile.files.length > 0) {
         let x = inputFile.files[0];
         if (x != "" && x != undefined) {
             let fileRequisito = await fileToBase64(x);
             let archivo = isNotEmpty(fileRequisito[0]) ? fileRequisito[0] : "";
             if (archivo != "") {

                let { Tabla } = dataRowEditNew;

                let param = {
                  Tabla: isNotEmpty(Tabla) ? Tabla : ""
                }
                 setLoading(true);
                 await service.cargarDatosVehiculo({
                     ...param,
                     File: archivo
                 })
                     .then(async res => {
                      setDataProcesados(res.data);
                      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "ADMINISTRATION.MASIVO.MESSAGES.SUCCESS" }));
                     })
                     .catch(res => {
                         handleErrorMessages(intl.formatMessage({ id: "MESSAGES.ERROR" }), res);
                     })
                     .finally(res => {
                         setLoading(false);
                     })
             } else {
                 //Seleccion un archivo
                 handleInfoMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), intl.formatMessage({ id: "ADMINISTRATION.MASIVO.VALIDAREXCEL.MENSAJE" }));
             }
         } else {
             //Seleccione un archivo
             handleInfoMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), intl.formatMessage({ id: "ADMINISTRATION.MASIVO.VALIDAREXCEL.MENSAJE" }));
         }
     } else {
      handleInfoMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), intl.formatMessage({ id: "ADMINISTRATION.MASIVO.VALIDAREXCEL.MENSAJE" }));
     }

     document.getElementById(`btn_Excel_0001`).value = null;
 }

    /********************************************** */
    // Convert 64:
    /**********************************************/
    async function fileToBase64(file) {
      // create function which return resolved promise | with data:base64 string
      function getBase64(file) {
          const reader = new FileReader()
          return new Promise(resolve => {
              reader.onload = ev => {
                  resolve(ev.target.result)
              }
              reader.readAsDataURL(file)
          })
      }
      // here will be array of promisified functions
      const promises = []
      // loop through fileList with for loop
      promises.push(getBase64(file))
      // array with base64 strings
      return await Promise.all(promises);
  }

  //:::::::::::::::::::::::::::::::::::::::::::::-Configuración de tabs-:::::::::::::::::::::::::::::::::
  const tabContent_Procesados = () => {
    return <>
           <br></br>
                <DataGrid
                    dataSource={dataProcesados.filter(x => x.Procesado === 'S')}
                    showBorders={true}
                    keyExpr="RowIndex"
                    focusedRowEnabled={true}
                    focusedRowKey={focusedRowKey}
                    repaintChangesOnly={true}
                >
                    <Editing
                      mode="row"
                      useIcons={true}
                      allowUpdating={false}
                      allowDeleting={false}
                      texts={textEditing}
                    />
                  <Column dataField="Placa" caption={intl.formatMessage({ id: "ADMINISTRATION.VEHICLE.PLATE" })} width={"15%"} alignment={"center"} />
                <Column dataField="Potencia" caption={intl.formatMessage({ id: "ADMINISTRATION.VEHICLE.POWER" })} width={"15%"} alignment={"left"} />
                <Column dataField="Serie" caption={intl.formatMessage({ id: "ADMINISTRATION.VEHICLE.SERIE" })} width={"15%"} alignment={"left"} />
                <Column dataField="Mensaje" caption={intl.formatMessage({ id: "ADMINISTRATION.MASIVO.GRID.MENSAJE" })} width={"45%"} alignment={"left"} />
     
                <Summary>
                        <TotalItem
                        cssClass="classColorPaginador_"
                            column="Documento"
                            summaryType="count"
                            displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
                        />
               </Summary>

                <Paging defaultPageSize={15} />
                <Pager showPageSizeSelector={false} />
                </DataGrid>

    </>
  }

  const tabContent_NoProcesados = () => {
    return <>
           <br></br>
                <DataGrid
                    dataSource={dataProcesados.filter(x => x.Procesado === 'N')}
                    showBorders={true}
                    keyExpr="RowIndex"
                    focusedRowEnabled={true}
                    onCellPrepared = { onCellPrepared }
                    repaintChangesOnly={true}
                >
                    <Editing
                      mode="row"
                      useIcons={true}
                      allowUpdating={false}
                      allowDeleting={false}
                      texts={textEditing}
                    />
                <Column dataField="Placa" caption={intl.formatMessage({ id: "ADMINISTRATION.VEHICLE.PLATE" })} width={"15%"} alignment={"center"} />
                <Column dataField="Potencia" caption={intl.formatMessage({ id: "ADMINISTRATION.VEHICLE.POWER" })} width={"15%"} alignment={"left"} />
                <Column dataField="Serie" caption={intl.formatMessage({ id: "ADMINISTRATION.VEHICLE.SERIE" })} width={"15%"} alignment={"left"} />
                <Column dataField="Mensaje" caption={intl.formatMessage({ id: "ADMINISTRATION.MASIVO.GRID.MENSAJE" })} width={"45%"} alignment={"left"} />
     
                <Summary>
                        <TotalItem
                        cssClass="classColorPaginador_"
                            column="Documento"
                            summaryType="count"
                            displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
                        />
               </Summary>

                <Paging defaultPageSize={15} />
                <Pager showPageSizeSelector={false} />
                </DataGrid>

    </>
  }

  //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  return (
   <>
<a id="iddescargaformato" className="" ></a>
<CustomBreadcrumbs
            Title={intl.formatMessage({ id: "ADMINISTRATION.PERSON.MENU" })}
            SubMenu={intl.formatMessage({ id: "CONFIG.MENU.ADMINISTRACION.IMPORTAR_DATOS" })}
            Subtitle={intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })}
          />

<Portlet>  

<AppBar position="static" className={classesEncabezado.principal}>
  <Toolbar variant="dense" className={classesEncabezado.toolbar}>
  <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
  {intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })}
  </Typography>
  </Toolbar>
</AppBar>


<PortletBody> 

<div className="col-12">
          
      <div className="row">

          <div style={{width:"35%", paddingRight:"10px", paddingLeft:"10px"}} > 
          <h5 className="card-title">{intl.formatMessage({ id: "ADMINISTRATION.MASIVO.STEPONE" })}</h5>
          <p className="card-text">{intl.formatMessage({ id: "ADMINISTRATION.MASIVO.STEPONE.DESCRIPTION" })}</p>
          </div>

          <div>
              <input 
              type="button" 
              className="btn btn-primary classCerrarSesion"
              value="Descargar" 
              style={{width:"96px", marginRight:"50px"}}
              onClick={eventDownloadHeaders}
              />
          </div>

          <div style={{width:"25%", paddingRight:"10px", paddingLeft:"20px"}} >
          <h5 className="card-title">{intl.formatMessage({ id: "ADMINISTRATION.MASIVO.STEPTWO" })}</h5>
          <p className="card-text">{intl.formatMessage({ id: "ADMINISTRATION.MASIVO.STEPTWO.DESCRIPTION" })}</p>
          </div>

        <div>
        <input className="form-control"
                      type="file"
                      id="btn_Excel_0001"
                      accept={'.xls, .xlsx'}
              />
        </div>  
        &nbsp;  &nbsp;  &nbsp;  &nbsp; 
        <div>
            <input 
              type="button"
              className="btn btn-primary classCerrarSesion"
              value="Subir Archivo" 
              onClick={eventLoadData} 
              />
        </div>  
      </div>
                  
</div>
<br></br>


    <TabNavContainer
      isVisibleCustomBread = {false}
      isVisibleAppBar = {false}
      tabIndex={tabIndex}
      handleChange={handleChange}
      orientation ={"horizontal"}
      componentTabsHeaders={[
        {
          label: intl.formatMessage({ id: "ADMINISTRATION.MASIVO.PROCESADOS" }),
          icon: <CheckCircle fontSize="large" />,
          className:classes.tabContent
        },
         {
           label: intl.formatMessage({ id: "ADMINISTRATION.MASIVO.NOPROCESADOS" }),
           icon: <HighlightOff fontSize="large" />,
           className: classes.tabContent,
         },
      ]}
      className={classes.tabContent}
      componentTabsBody={
        [
        tabContent_Procesados(),
        tabContent_NoProcesados(),
        ]
      }

    />
       
       </PortletBody> 

    </Portlet>

      
  
    </>
  );
};

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <Portlet
      component="div"
      role="tabpanel"
      hidden={value !== index} //view
      //id={`wrapped-tabpanel-${index}`}
      //aria-labelledby={`wrapped-tab-${index}`}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
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
    id: `simple-tabpanel-${index}`,
    'aria-controls': `simple-tab-${index}`,
  };
}

export default injectIntl(WithLoandingPanel(ImportarDatosIndexPage));
