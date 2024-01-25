import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl"; //Multi-idioma
import {
  Portlet,
  PortletBody,
} from "../../../content/Portlet";

import { isNotEmpty } from "../../../../../_metronic";

import { handleErrorMessages, handleInfoMessages, handleSuccessMessages } from "../../../../store/ducks/notify-messages";
import {
  DataGrid,
  Column,
  Editing,
  Paging,
} from "devextreme-react/data-grid";

import { Popup } from "devextreme-react/popup";
import PropTypes from "prop-types";
import { AppBar } from "@material-ui/core";
import { Tabs } from '@material-ui/core';
import { Tab } from '@material-ui/core';
import CheckCircle from "@material-ui/icons/CheckCircle";
import HighlightOff from "@material-ui/icons/HighlightOff";
import { useStylesTab } from "../../../../store/config/Styles";
import { service } from "../../../../api/transporte/programacionPasajero.api";

const TransporteProgramacionCargaExcelPopUp = (props) => {
  const { intl, IdProgramacion } = props;
  const [tabIndex, setTabIndex] = useState(0);
  const classes = useStylesTab();
  const [dataProcesados, setDataProcesados] = useState([]);
  const usuario = useSelector(state => state.auth.user);
  const splashScreen = document.getElementById("splash-screen");

  const handleChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const textEditing = {
    confirmDeleteMessage: '',
    editRow: intl.formatMessage({ id: "ACTION.EDIT" }),
    deleteRow: intl.formatMessage({ id: "ACTION.REMOVE" }),
  }

  function onCellPrepared(e) {
    if (e.rowType === 'data') {
      if (e.data.Procesado === 'N') {
        e.cellElement.style.color = 'red';
      }
    }
  }

  async function eventDownloadHeaders(e) {
    await service.descargarPlantillaPasajeros({ IdProgramacion: isNotEmpty(IdProgramacion) ? IdProgramacion : "" }).then(resp => {
      //  console.log("eventDownloadHeaders|resp:",resp);
      if (resp.result.error === 0) {
        let temp = `data:application/vnd.ms-excel;base64,${encodeURIComponent(resp.result.fileBase64)}`;
        let download = document.getElementById('iddescargaformato');
        download.href = temp;
        download.download = `${resp.result.nombre}.xlsx`;
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

          let param = {
            IdProgramacion: isNotEmpty(IdProgramacion) ? IdProgramacion : "",
            IdUsuarioCreacion: usuario.username,
          }
          splashScreen.classList.remove("hidden");
          await service.cargarPasajerosExcel({
            ...param,
            File: archivo
          })
            .then(async res => {
              // console.log("eventLoadData|res:",res);
              setDataProcesados(res.result.data);
              props.dataSource.loadDataWithFilter({ data: { IdProgramacion: IdProgramacion } });
              handleSuccessMessages(intl.formatMessage({ id: "ADMINISTRATION.MASIVO.MESSAGES.SUCCESS" }));

            })
            .catch(err => {
              // handleErrorMessages(err);
              handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);

            })
            .finally(res => {
              // setLoading(false);
              splashScreen.classList.add("hidden");

            })
        } else {
          //Seleccion un archivo
          handleInfoMessages(intl.formatMessage({ id: "ADMINISTRATION.MASIVO.VALIDAREXCEL.MENSAJE" }));

        }
      } else {
        //Seleccione un archivo
        handleInfoMessages(intl.formatMessage({ id: "ADMINISTRATION.MASIVO.VALIDAREXCEL.MENSAJE" }));

      }
    } else {
      //Seleccione un archivo
      handleInfoMessages(intl.formatMessage({ id: "ADMINISTRATION.MASIVO.VALIDAREXCEL.MENSAJE" }));

    }

    splashScreen.classList.add("hidden");

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

  useEffect(() => {
  }, []);


  return (
    <>
      <a id="iddescargaformato" className="" ></a>
      <Popup
        className="popup-sin-padding"
        visible={props.showPopup.isVisiblePopUp}
        dragEnabled={false}
        closeOnOutsideClick={false}
        showTitle={true}
        height={"620px"}
        width={"700px"}
        title={(intl.formatMessage({ id: "IMPORTAR PASAJEROS" })).toUpperCase()}
        onHiding={() => props.showPopup.setisVisiblePopUp(!props.showPopup.isVisiblePopUp)}
      >
        <Portlet>

          <PortletBody>

            <div className="col-12">
              <div>
                <ul className="list-group list-group-flush">
                  <li className="list-group-item card-custom-masivo" style={{ paddingTop: '0' }}>
                    <div className="row">
                      <div className="col-10">
                        <h5 className="card-title">1° Descargar la plantilla</h5>
                        <p className="card-text">Descargue el documento Excel para poder ingresar los datos del pasajero.</p>

                      </div>

                      <div className="col-2">
                        <input
                          type="button"
                          className="btn btn-primary btn-azul card-button-azul"
                          value="Descargar"
                          style={{ width: "96px" }}
                          onClick={eventDownloadHeaders}
                        />


                      </div>
                    </div>
                  </li>
                  <li className="list-group-item card-custom-masivo">
                    <div className="row" >
                      <div className="col-10">
                        <h5 className="card-title">2° Subir plantilla</h5>
                        <p className="card-text">Seleccione el documento Excel para poder subir el archivo.</p>

                        <div className="mb-3">
                          <input className="form-control "
                            style={{ width: "80%" }}
                            type="file"
                            id="btn_Excel_0001"
                            accept={'.xls, .xlsx'}
                          />
                        </div>

                      </div>

                      <div className="col-2" style={{ paddingTop: '55px' }}>
                        {/* &nbsp; */}
                        <input
                          type="button"
                          className="btn btn-primary btn-azul card-button-azul"
                          value="Subir Archivo"
                          onClick={eventLoadData}
                        />

                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <AppBar position="static">
              <Tabs
                orientation="horizontal"
                value={tabIndex}
                onChange={handleChange}
                aria-label="Vertical tabs"
                className={classes.tabs}
                indicatorColor="primary"
                textColor="primary"

              >
                <Tab label={intl.formatMessage({ id: "PROCESADOS" })}
                  icon={<CheckCircle fontSize="small" />}
                  className={classes.tabContent}
                  {...tabPropsIndex(0)}

                />
                <Tab label={intl.formatMessage({ id: "NO PROCESADOS" })}
                  icon={<HighlightOff fontSize="small" />}
                  className={classes.tabContent}
                  {...tabPropsIndex(1)}
                />
              </Tabs>
            </AppBar>

            <TabPanel value={tabIndex} className={classes.TabPanel} index={0} >
              <br></br>
              <DataGrid
                id="gridReporteGeneral"
                dataSource={dataProcesados.filter(x => x.Procesado === 'S')}
                showBorders={true}
                keyExpr="RowIndex"
                focusedRowEnabled={true}
                repaintChangesOnly={true}
              >
                <Editing
                  mode="row"
                  useIcons={true}
                  allowUpdating={false}
                  allowDeleting={false}
                  texts={textEditing}
                />
                <Column dataField="Documento" caption={intl.formatMessage({ id: "Documento" })} width={"25%"} alignment={"center"} />
                <Column dataField="ApellidoNombres" caption={intl.formatMessage({ id: "Nombres" })} alignment={"left"} />
                <Column dataField="Mensaje" caption={intl.formatMessage({ id: "Mensaje" })} alignment={"left"} />
                {/* <Summary>
                        <TotalItem
                         cssClass="classColorPaginador_"
                            column="Documento"
                            summaryType="count"
                            displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
                        />
               </Summary> */}
                <Paging enabled={true} defaultPageSize={6} />
              </DataGrid>

            </TabPanel>

            <TabPanel value={tabIndex} className={classes.TabPanel} index={1}>
              <br></br>
              <DataGrid
                id="gridReporteGeneral"
                dataSource={dataProcesados.filter(x => x.Procesado === 'N')}
                showBorders={true}
                keyExpr="RowIndex"
                focusedRowEnabled={true}
                repaintChangesOnly={true}
                onCellPrepared={onCellPrepared}

              >
                <Editing
                  mode="row"
                  useIcons={true}
                  allowUpdating={false}
                  allowDeleting={false}
                  texts={textEditing}
                />
                <Column dataField="Documento" caption={intl.formatMessage({ id: "Documento" })} width={"20%"} alignment={"center"} />
                <Column dataField="ApellidoNombres" caption={intl.formatMessage({ id: "Nombres" })} alignment={"left"} />
                <Column dataField="Mensaje" caption={intl.formatMessage({ id: "Mensaje" })} width={"50%"} alignment={"left"} />
                {/* <Summary>
                        <TotalItem
                         cssClass="classColorPaginador_"
                            column="Documento"
                            summaryType="count"
                            displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
                        />
               </Summary> */}

                <Paging enabled={true} defaultPageSize={6} />
              </DataGrid>
            </TabPanel>
          </PortletBody>

        </Portlet>
      </Popup>
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
};

TransporteProgramacionCargaExcelPopUp.propTypes = {
  showButton: PropTypes.bool,
  selectionMode: PropTypes.string,
  uniqueId: PropTypes.string,
};
TransporteProgramacionCargaExcelPopUp.defaultProps = {
  showButton: true,
  selectionMode: "row", //['multiple', 'row']
  uniqueId: "TransporteProgramacionCargaExcelPopUp",
};
export default injectIntl(TransporteProgramacionCargaExcelPopUp);
