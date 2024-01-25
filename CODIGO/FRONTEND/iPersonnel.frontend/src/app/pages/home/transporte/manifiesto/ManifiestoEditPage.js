import React, { useEffect, useState } from "react";
import Form, { Item, GroupItem,SimpleItem } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { listarEstadoSimple, listarEstadoCierre, listarEstadoAprobado, dateFormat } from "../../../../../_metronic";

import {
  service
} from "../../../../api/transporte/manifiesto.api";

import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";

import { Portlet,PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import { injectIntl } from "react-intl";
import { isRequired, isModified } from "../../../../../_metronic/utils/securityUtils";
import TransporteProgramacionBuscar from '../../../../partials/components/transporte/popUps/TransporteProgramacionBuscar';
import TransporteVehiculosBuscar from '../../../../partials/components/transporte/popUps/TransporteVehiculosBuscar';
import TransportePersonasBuscar from '../../../../partials/components/transporte/popUps/TransportePersonasBuscar';
import { handleErrorMessages, handleSuccessMessages } from "../../../../store/ducks/notify-messages";

const bgColors = {
  "A": "bg-success",
  "C": "bg-red",
};

const ManifiestoEditPage = props => {

  const { intl, setLoading,accessButton,modoEdicion,settingDataField,dataRowEditNew } = props;

  const { esModificable } = props;
  const classesEncabezado = useStylesEncabezado();
  const [isVisiblePopUp, setIsVisiblePopUp] = useState(false);
  const [isVisiblePilotoPopup, setIsVisiblePilotoPopup] = useState(false);
  const [isVisibleCopilotoPopup, setIsVisibleCopilotoPopup] = useState(false);
  const [isVisibleVehiculoPopup, setIsVisibleVehiculoPopup] = useState(false);
  const [estadoSimple, setEstadoSimple] = useState([]);
  const [estadoCierre, setEstadoCierre] = useState([]);
  const [estadoAprobado, setEstadoAprobado] = useState([]);

  async function cargarCombos() {
    let estadoSimple = listarEstadoSimple();
    setEstadoSimple(estadoSimple);
    let estadoCierre = listarEstadoCierre();
    setEstadoCierre(estadoCierre);
    let estadoAprobado = listarEstadoAprobado();
    setEstadoAprobado(estadoAprobado);
  }

  function grabar(e) {
    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (dataRowEditNew.esNuevoRegistro) {
        props.agregarManifiesto(dataRowEditNew);
      } else {
        props.actualizarManifiesto(dataRowEditNew);
      }
    }

  }

   const toggleCerrarManifiesto = async () => {
     if (dataRowEditNew.IdManifiesto) {
       const { IdManifiesto, CerradoManual } = dataRowEditNew;
       await service.actualizarEstados({ 
         IdManifiesto, 
         CerradoManual: (CerradoManual === 'S' ? 'N' : 'S')
         }).then(() => {
         const cerrado = CerradoManual === 'S' ? intl.formatMessage({ id: "TRANSPORTE.MANIFEST.OPEN" }) : intl.formatMessage({ id: "TRANSPORTE.MANIFEST.CLOSE" });
         handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), `El manifiesto ha sido ${cerrado}`);
         props.setDataRowEditNew({ ...dataRowEditNew, CerradoManual: (CerradoManual === 'S' ? 'N' : 'S') });
         renderEtiquetaCerrado();
       })
        .catch(err => {
           handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
         })
         .finally(props.onToggleCerrarManifiesto);
     }
     props.setRefreshData(true);
   }

   const renderEtiquetaCerrado = () => {
     const estado = dataRowEditNew.CerradoManual === 'S' ? intl.formatMessage({ id: "TRANSPORTE.MANIFEST.CLOSE" }).toUpperCase() : intl.formatMessage({ id: "TRANSPORTE.MANIFEST.OPEN" }).toUpperCase();
     const estadoColor = dataRowEditNew.CerradoManual === 'S' ? 'C' : 'A';
     return (
       <div className={'box-info ' + bgColors[estadoColor[0]]}>
         <span className="text-light font-1">
           {estado}
         </span>
       </div>
     );
   }

  const selectProgramacion = async (datos) => {
    const { IdProgramacion, TipoProgramacion, Ruta,FechaProgramacion,Origen,Destino ,Fecha, Hora } = datos[0];
    props.dataRowEditNew.IdProgramacion = IdProgramacion;
    props.dataRowEditNew.TipoProgramacion = TipoProgramacion;
    props.dataRowEditNew.Ruta = Ruta;
    props.dataRowEditNew.FechaProgramacion = FechaProgramacion;
    props.dataRowEditNew.Origen = Origen;
    props.dataRowEditNew.Destino = Destino;
    props.dataRowEditNew.Fecha = Fecha;
    props.dataRowEditNew.Hora = Hora;
    setIsVisiblePopUp(false);
};

const selectVehiculo = async (datos) => {
  const { IdVehiculo, TipoVehiculo, Placa,NumAsientos,NumeroAsientosActivos} = datos[0];
  props.dataRowEditNew.IdVehiculo = IdVehiculo;
  props.dataRowEditNew.TipoVehiculo = TipoVehiculo;
  props.dataRowEditNew.Placa = Placa;
  props.dataRowEditNew.NumeroAsientos = NumAsientos;
  props.dataRowEditNew.NumeroMaximoPasajeros = NumeroAsientosActivos;
  setIsVisibleVehiculoPopup(false);
};

const selectPiloto = async (datos) => {
  const { IdPersona, NombreCompleto, Documento} = datos[0];
  props.dataRowEditNew.IdPiloto = IdPersona;
  props.dataRowEditNew.DocumentoPiloto = Documento;
  props.dataRowEditNew.NombrePiloto = NombreCompleto;
  setIsVisiblePilotoPopup(false);
};

const selectCopiloto = async (datos) => {
  const { IdPersona, NombreCompleto, Documento} = datos[0];
  props.dataRowEditNew.IdCopiloto = IdPersona;
  props.dataRowEditNew.DocumentoCopiloto = Documento;
  props.dataRowEditNew.NombreCopiloto = NombreCompleto;
  setIsVisibleCopilotoPopup(false);
};


  useEffect(() => {
    cargarCombos();
  }, []);

  return (
    <>
      {/* <div> */}
        <Portlet>
          <PortletHeader
            title={props.titulo}
            toolbar={
              <PortletHeaderToolbar>
                <Button
                  icon="fa fa-save"
                  type="default"
                  hint={intl.formatMessage({ id: "ACTION.RECORD" })}
                  onClick={grabar}
                  useSubmitBehavior={true}
                  validationGroup="FormEdicion"
                  //disabled={!esModificable && (estadoCodigo !== 'E')}
                  visible={modoEdicion}
                />
                &nbsp;
                <Button
                  icon="fa fa-times-circle"
                  type="normal"
                  hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
                  onClick={props.cancelarEdicion}
                />
              </PortletHeaderToolbar>
            }
          />
          <PortletHeader
            toolbar={
              <PortletHeaderToolbar>
                <Button
                  visible={modoEdicion}
                  icon={dataRowEditNew.CerradoManual === 'S' ? 'fa fa-unlock' : 'fa fa-lock'}
                  type={dataRowEditNew.CerradoManual === 'S' ? 'default' : 'danger'}
                  text={dataRowEditNew.CerradoManual === 'S' ? intl.formatMessage({ id: "TRANSPORTE.MANIFEST.TOOPEN" })  :  intl.formatMessage({ id: "TRANSPORTE.MANIFEST.CLOSE" }) }
                  disabled={!dataRowEditNew.IdManifiesto}
                  onClick={toggleCerrarManifiesto}
                />
                <Button visible={false}
                  className="ml-3"
                  icon="fa fa-check"
                  type="success"
                  text="Aprobar"
                  disabled={!dataRowEditNew || !dataRowEditNew.IdManifiesto || dataRowEditNew.Aprobado === 'S'}
                  // onClick={aprobarManifiesto}
                />
              </PortletHeaderToolbar>
            }
          />
          <PortletBody>
            <React.Fragment>              
              <Form formData={dataRowEditNew} validationGroup="FormEdicion" >
                <Item colSpan={2}>
                  <AppBar position="static" className={classesEncabezado.secundario}>
                    <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                      <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                        {intl.formatMessage({ id: "TRANSPORTE.MANIFEST.DATA" })}
                      </Typography>
                    </Toolbar>
                  </AppBar>
                </Item>
                <GroupItem
                  itemType="group"
                  colCount={3}
                  colSpan={3}
                >
         
                <Item dataField="IdProgramacion" 
                isRequired={true}
                label={{ text: intl.formatMessage({ id: "SYSTEM.PROCESS.PROGRAMMING" }) }}
                editorOptions={{
                  readOnly: true,
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  buttons: [{
                    name: 'search',
                    location: 'after',
                    useSubmitBehavior: true,
                    readOnly: props.dataRowEditNew && props.dataRowEditNew.ReadOnly,
                    options: {
                      stylingMode: 'text',
                      icon: 'search',
                      disabled: modoEdicion ? false : true,
                      onClick: () => {
                        setIsVisiblePopUp(true);
                      }
                    }
                  }]
                }}
              />

                  <Item dataField="TipoProgramacion"
                    isRequired={false}
                    label={{ text: intl.formatMessage({ id: "COMMON.TYPE" }) }}
                    editorOptions={{
                      maxLength: 10,
                      readOnly: true
                    }}
                  />
                  <Item dataField="IdManifiesto"
                    isRequired={false}
                    label={{ text: intl.formatMessage({ id: "CONFIG.MENU.TRANSPORTE.MANIFIESTO" }) }}
                    editorOptions={{
                      maxLength: 10,
                      inputAttr: { 'style': 'text-transform: uppercase' },
                      readOnly: true,
                      placeholder: intl.formatMessage({ id: "COMMON.CODE.AUTO" })
                    }}
                  />
                </GroupItem>

                <GroupItem
                  itemType="group"
                  colCount={3}
                  colSpan={3}
                >
                  <Item dataField="Ruta"
                    isRequired={false}
                    label={{ text: intl.formatMessage({ id: "TRANSPORTE.ROUTE" }) }}
                    editorOptions={{
                      maxLength: 10,
                      readOnly: true
                    }}
                  />
                  <Item dataField="Origen"
                    isRequired={false}
                    label={{ text: intl.formatMessage({ id: "SYSTEM.CONFIGURATIONS.ORIGEN" }) }}
                    editorOptions={{
                      maxLength: 10,
                      readOnly: true,
                    }}
                  />
                  <Item dataField="Destino"
                    isRequired={false}
                    label={{ text: intl.formatMessage({ id: "SYSTEM.CONFIGURATIONS.DESTINO" }) }}
                    editorOptions={{
                      maxLength: 10,
                      readOnly: true,
                    }}
                  />
                </GroupItem>
                
                <GroupItem
                  itemType="group"
                  colCount={3}
                  colSpan={3}
                >
                  <Item dataField="Fecha"
                    isRequired={false}
                    label={{ text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.DATE" }) }}
                    editorOptions={{
                      maxLength: 10,
                      readOnly: true,

                    }}
                  />
                  <Item dataField="Hora"
                    isRequired={false}
                    label={{ text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.HOUR" }) }}
                    editorOptions={{
                      maxLength: 10,
                      readOnly: true,
                      
                    }}
                  />
                  <SimpleItem
                    visible={dataRowEditNew.esNuevoRegistro ? false :true}
                    dataField="Cerrado"
                    label={{ visible: false }}
                    render={renderEtiquetaCerrado}
                  />
                </GroupItem>
                <Item
                  colSpan={2}
                  // visible={fechaProgramacionValidacion || props.dataRowEditNew.IdProgramacion ? true : false}
                >
                  <AppBar position="static" className={classesEncabezado.secundario}>
                    <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                      <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                        {/* Datos del Vehículo y Choferes */}
                        {intl.formatMessage({ id: "TRANSPORTE.MANIFEST.DATA.VEHICLE" })}
                      </Typography>
                    </Toolbar>
                  </AppBar>
                </Item>
                <GroupItem
                  itemType="group"
                  colCount={3}
                  colSpan={3}
                  // visible={fechaProgramacionValidacion || props.dataRowEditNew.IdProgramacion ? true : false}
                >
                  <Item dataField="Placa" 
                    isRequired={true}
                    label={{ text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.PLATE" }) }}
                    editorOptions={{
                      readOnly: true,
                      inputAttr: { 'style': 'text-transform: uppercase' },
                      buttons: [{
                        name: 'search',
                        location: 'after',
                        useSubmitBehavior: true,
                        readOnly: props.dataRowEditNew && props.dataRowEditNew.ReadOnly,
                        options: {
                          stylingMode: 'text',
                          icon: 'search',
                          disabled: modoEdicion ? false : true,
                          onClick: () => {
                            setIsVisibleVehiculoPopup(true);
                            }
                          }
                        }]
                      }}
                  />

                  <Item dataField="TipoVehiculo"
                    isRequired={false}
                    label={{ text: intl.formatMessage({ id: "ADMINISTRATION.VEHICLE.VEHICLETYPE" }) }}
                    editorOptions={{
                      maxLength: 10,
                      readOnly: true
                    }}
                  />

                  <Item dataField="NumeroAsientos"
                    isRequired={false}
                    label={{ text: intl.formatMessage({ id: "TRANSPORTE.MANIFEST.NUMBERSEATS" }) }}
                    editorOptions={{
                      maxLength: 10,
                      readOnly: true
                    }}
                  />

                </GroupItem>
                <GroupItem
                  itemType="group"
                  colCount={3}
                  colSpan={3}
                >
                  <Item dataField="NumeroMaximoPasajeros"
                    isRequired={true}
                    itemType="dxNumberBox"
                    label={{ text: intl.formatMessage({ id: "TRANSPORTE.MANIFEST.MAXIMUMPASSENGERS" }) }}
                    editorOptions={{
                      maxLength: 3,
                      max: props.dataRowEditNew.NumeroAsientos,
                      min: 0,
                      showSpinButtons: true,
                    }}
                  />
                  <Item dataField="NumeroAsientosLibres"
                    isRequired={false}
                    label={{ text: intl.formatMessage({ id: "TRANSPORTE.MANIFEST.FREESEATS" }) }}
                    editorOptions={{
                      readOnly: true
                    }}
                  />

                  <Item dataField="NumeroAsientosReservados"
                    isRequired={false}
                    label={{ text: intl.formatMessage({ id: "TRANSPORTE.MANIFEST.RESERVEDSEATS" }) }}
                    editorOptions={{
                      readOnly: true
                    }}
                  />
                </GroupItem>
                <GroupItem
                  itemType="group"
                  colCount={3}
                  colSpan={3}
                >

                  <Item dataField="DocumentoPiloto" 
                    isRequired={true}
                    label={{ text: intl.formatMessage({ id: "TRANSPORTE.MANIFEST.PILOT.DOCUMENT" }) }}
                    editorOptions={{
                      readOnly: true,
                      inputAttr: { 'style': 'text-transform: uppercase' },
                      buttons: [{
                        name: 'search',
                        location: 'after',
                        useSubmitBehavior: true,
                        readOnly: props.dataRowEditNew && props.dataRowEditNew.ReadOnly,
                        options: {
                          stylingMode: 'text',
                          icon: 'search',
                          disabled: modoEdicion ? false : true,
                          onClick: () => {
                            setIsVisiblePilotoPopup(true);
                            }
                          }
                        }]
                      }}
                  />

                  <Item dataField="NombrePiloto"
                    isRequired={false}
                    label={{ text: intl.formatMessage({ id: "TRANSPORTE.MANIFEST.PILOT.NAMES" }) }}
                    colSpan={2}
                    editorOptions={{
                      maxLength: 20,
                      readOnly: true
                    }}
                  />
                </GroupItem>
                <GroupItem
                  itemType="group"
                  colCount={3}
                  colSpan={3}
                >
                
                <Item dataField="DocumentoCopiloto" 
                    label={{ text: intl.formatMessage({ id: "TRANSPORTE.MANIFEST.COPILOT.DOCUMENT" }) }}
                    editorOptions={{
                      readOnly: true,
                      inputAttr: { 'style': 'text-transform: uppercase' },
                      buttons: [{
                        name: 'search',
                        location: 'after',
                        useSubmitBehavior: true,
                        readOnly: props.dataRowEditNew && props.dataRowEditNew.ReadOnly,
                        options: {
                          stylingMode: 'text',
                          icon: 'search',
                          disabled: modoEdicion ? false : true,
                          onClick: () => {
                            setIsVisibleCopilotoPopup(true);
                            }
                          }
                        }]
                      }}
                  />

                  <Item dataField="NombreCopiloto"
                    label={{ text: intl.formatMessage({ id: "TRANSPORTE.MANIFEST.COPILOT.NAMES" }) }}
                    colSpan={2}
                    editorOptions={{
                      maxLength: 20,
                      readOnly: true
                    }}
                  />
                </GroupItem>
                <GroupItem
                  itemType="group"
                  colCount={3}
                  colSpan={3}
                >
                  <Item dataField="Kilometraje"
                    isRequired={true}
                    itemType="dxNumberBox"
                    label={{ text: intl.formatMessage({ id: "TRANSPORTE.MANIFEST.MILEAGE" }) }}
                    visible={true}
                    editorOptions={{
                      maxLength: 7,
                      max: 9999999,
                      min: 0,
                      showSpinButtons: true,
                      visible: true,
                      // readOnly: !esModificable,
                    }}
                  />
                  <Item dataField="Unidad"
                    isRequired={true}
                    label={{ text: intl.formatMessage({ id: "SYSTEM.REPOSITORY.UNIT" }) }}
                    editorOptions={{
                      maxLength: 10,
                      inputAttr: { 'style': 'text-transform: uppercase' },
                      // readOnly: !esModificable,
                    }}
                  />
                </GroupItem>

                <Item colSpan={2} visible={props.dataRowEditNew && !props.dataRowEditNew.esNuevoRegistro} >
                  <AppBar position="static" className={classesEncabezado.secundario}>
                    <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                      <Typography variant="h6" color="inherit" className={classesEncabezado.title}>{intl.formatMessage({ id: "TRANSPORTE.MANIFEST.DATATRAVEL" })}</Typography>
                    </Toolbar>
                  </AppBar>
                </Item>

                <GroupItem itemType="group" colCount={3} colSpan={3} visible={props.dataRowEditNew && !props.dataRowEditNew.esNuevoRegistro} >
                  <Item dataField="SalidaFormateada"
                    isRequired={false}
                    label={{ text: intl.formatMessage({ id: "TRANSPORTE.MANIFEST.DATETIMEDEPARTURE" }) }}
                    editorOptions={{
                      maxLength: 50,
                      disabled: !props.dataRowEditNew.esNuevoRegistro ? false : true,
                      readOnly: true
                    }}
                  />
                  <Item dataField="Llegada"
                    isRequired={false}
                    label={{ text: intl.formatMessage({ id: "TRANSPORTE.MANIFEST.ARRIVALDATETIME" }) }}
                    editorType="dxDateBox"
                    editorOptions={{
                      type: "datetime",
                      displayFormat: "dd/MM/yyyy HH:mm",
                      // readOnly: (!!props.dataRowEditNew && estadoCodigo !== 'E'),
                    }}
                  />
                </GroupItem>

                <Item
                  colSpan={2}
                  // visible={props.dataRowEditNew && !props.dataRowEditNew.esNuevoRegistro}
                >
                  <AppBar position="static" className={classesEncabezado.secundario}>
                    <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                      <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                        {intl.formatMessage({ id: "TRANSPORTE.MANIFEST.CLOSINGANDAPPROVAL" })}
                      </Typography>
                    </Toolbar>
                  </AppBar>
                </Item>

                <GroupItem
                  itemType="group"
                  colCount={3}
                  colSpan={3}
                  // visible={props.dataRowEditNew && !props.dataRowEditNew.esNuevoRegistro}
                >
                  <Item
                    dataField="Cerrado"
                    label={{ text: intl.formatMessage({ id: "TRANSPORTE.MANIFEST.THEMANIFESTIS" }) }}
                    editorType="dxSelectBox"
                    isRequired={false}
                    editorOptions={{
                      items: estadoCierre,
                      valueExpr: "Valor",
                      displayExpr: "Descripcion",
                      visible: props.dataRowEditNew && !props.dataRowEditNew.esNuevoRegistro,
                      readOnly: true,
                    }}
                  />
                  <Item
                    dataField="CerradoManual"
                    label={{ text: intl.formatMessage({ id: "TRANSPORTE.MANIFEST.CLOSEMANUAL" }) }}
                    editorType="dxSelectBox"
                    isRequired={true}
                    visible={false}
                    editorOptions={{
                      items: estadoCierre,
                      valueExpr: "Valor",
                      displayExpr: "Descripcion",
                      visible: false
                    }}
                  />
                </GroupItem>
                <GroupItem
                  itemType="group"
                  colCount={3}
                  colSpan={3}
                  // visible={props.dataRowEditNew && !props.dataRowEditNew.esNuevoRegistro}
                >
                  <Item
                    dataField="Aprobado"
                    label={{ text: intl.formatMessage({ id: "TRANSPORTE.MANIFEST.STATUS" }) }}
                    editorType="dxSelectBox"
                    isRequired={false}
                    editorOptions={{
                      items: estadoAprobado,
                      valueExpr: "Valor",
                      displayExpr: "Descripcion",
                      readOnly: true,
                    }}
                  />
                  <Item dataField="IdUsuarioAprobador"
                    isRequired={false}
                    label={{ text: intl.formatMessage({ id: "TRANSPORTE.MANIFEST.APPROVER" }) }}
                    editorOptions={{
                      maxLength: 50,
                      inputAttr: { 'style': 'text-transform: uppercase' },
                      readOnly: true,
                    }}
                  />
                  <Item dataField="FechaActualizacion"
                    isRequired={false}
                    label={{ text: intl.formatMessage({ id: "TRANSPORTE.MANIFEST.DATEANDTIME" }) }}
                    editorOptions={{
                      maxLength: 50,
                      readOnly: true
                    }}
                  />

                  <Item
                    dataField="RegistradoPiloto"
                    label={{ text: intl.formatMessage({ id: "TRANSPORTE.MANIFEST.REGISTERPILOT" }) }}
                    editorType="dxSelectBox"
                    isRequired={true}
                    visible={false}
                    editorOptions={{
                      items: estadoSimple,
                      valueExpr: "Valor",
                      displayExpr: "Descripcion",
                      visible: false,
                    }}
                  />

                  <Item
                    dataField="RegistradoCopiloto"
                    label={{ text: intl.formatMessage({ id: "TRANSPORTE.MANIFEST.REGISTERCOPILOT" }) }}
                    editorType="dxSelectBox"
                    isRequired={true}
                    visible={false}
                    editorOptions={{
                      items: estadoSimple,
                      valueExpr: "Valor",
                      displayExpr: "Descripcion",
                      visible: false,
                    }}
                  />

                  <Item
                    dataField="Activo"
                    label={{ text: intl.formatMessage({ id: "COMMON.ACTIVE" }) }}
                    editorType="dxSelectBox"
                    isRequired={true}
                    visible={false}
                    editorOptions={{
                      items: estadoSimple,
                      valueExpr: "Valor",
                      displayExpr: "Descripcion",
                      disabled: props.dataRowEditNew.esNuevoRegistro ? true : false,
                      visible: false,
                    }}
                  />
                </GroupItem>
              </Form>
              
            </React.Fragment>
          </PortletBody>
        </Portlet>

      {isVisiblePopUp && (
        <TransporteProgramacionBuscar
        selectData={selectProgramacion}
        showPopup={{ isVisiblePopUp: isVisiblePopUp, setisVisiblePopUp: setIsVisiblePopUp }}
        cancelarEdicion={() => setIsVisiblePopUp(false)}
        uniqueId={"TransporteProgramacionBuscar"}
        showButton={true}
        />
      )}

    {isVisibleVehiculoPopup && (
        <TransporteVehiculosBuscar
        selectData={selectVehiculo}
        showPopup={{ isVisiblePopUp: isVisibleVehiculoPopup, setisVisiblePopUp: setIsVisibleVehiculoPopup }}
        cancelarEdicion={() => setIsVisibleVehiculoPopup(false)}
        uniqueId={"TransporteVehiculosBuscar"}
        showButton={true}
        />
      )}

     {isVisiblePilotoPopup && (
        <TransportePersonasBuscar
        selectData={selectPiloto}
        showPopup={{ isVisiblePopUp: isVisiblePilotoPopup, setisVisiblePopUp: setIsVisiblePilotoPopup }}
        cancelarEdicion={() => setIsVisiblePilotoPopup(false)}
        uniqueId={"TransportePersonasBuscarPiloto"}
        showButton={true}
        />
      )}

      {isVisibleCopilotoPopup && (
        <TransportePersonasBuscar
        selectData={selectCopiloto}
        showPopup={{ isVisiblePopUp: isVisibleCopilotoPopup, setisVisiblePopUp: setIsVisibleCopilotoPopup }}
        cancelarEdicion={() => setIsVisibleCopilotoPopup(false)}
        uniqueId={"TransportePersonasBuscarCopiloto"}
        showButton={true}
        />
      )}

      {/* </div> */}
    </>
  );

};
export default injectIntl(ManifiestoEditPage);
