import React, { useEffect, useState, Fragment } from "react";
import Form, { Item, GroupItem } from "devextreme-react/form";
import TransporteRutaBuscar from '../../../../../partials/components/transporte/popUps/TransporteRutaBuscar';
import TransporteVehiculosBuscar from '../../../../../partials/components/transporte/popUps/TransporteVehiculosBuscar';
import TransportePersonasBuscar from '../../../../../partials/components/transporte/popUps/TransportePersonasBuscar';
import TransporteChoferBuscar from '../../../../../partials/components/transporte/popUps/TransporteChoferBuscar';
import AdministracionCompaniaBuscar from "../../../../../partials/components/AdministracionCompaniaBuscar";
import AdministracionPersonaBuscar from "../../../../../partials/components/AdministracionPersonaBuscar";

import { isNotEmpty } from "../../../../../../_metronic";
import Constants from "../../../../../store/config/Constants";

import { injectIntl } from "react-intl";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";

const ProgramacionesManifiestosFilter = (props) => {

  const { intl, setLoading } = props;

    const filterData = props.filterData;
    const setFilterData = props.setFilterData;

    const [popUpVisibleRuta, setpopUpVisibleRuta] = useState(false);
    const [isVisibleVehiculoPopup, setIsVisibleVehiculoPopup] = useState(false);
    const [isVisiblePopUpPasajero, setIsVisiblePopUpPasajero] = useState(false);
    const [isVisiblePopUpChofer, setIsVisiblePopUpChofer] = useState(false);
    const [popupVisibleCompania, setPopupVisibleCompania] = useState(false);

    const appBarForm = { marginBottom: "10px", padding: "10px" };

    const seleccionarChofer = async (data) => {
      console.log("seleccionarChofer|data:",data);
    if (data.length > 0) {
      let { CodigoTrabajador, NombreCompleto } = data[0];
      let datos = { ...filterData, CodigoChofer: CodigoTrabajador, NombreChofer: NombreCompleto };
      setFilterData(datos);
      }
      setIsVisiblePopUpChofer(false); 

    };

    const seleccionarPersonas = async (data) => {
      console.log("seleccionarPersonas|data:",data);
      if (data.length > 0) {
        let { IdPersona, NombreCompleto } = data[0];
        let datos = { ...filterData, CodigoPasajero: IdPersona, NombrePasajero: NombreCompleto };
        setFilterData(datos);
    }
    setIsVisiblePopUpPasajero(false); 

    };


    const selectVehiculo = async (data) => {
      console.log("selectVehiculo|data:",data);
      if (data.length > 0) {
        let { IdVehiculo, Placa } = data[0];
        let datos = { ...filterData, CodigoVehiculo:IdVehiculo, Placa };
        setFilterData(datos);
    }
    setIsVisibleVehiculoPopup(false); 
    };


    const selectRuta = async (data) => {
      console.log("selectRuta|data:",data);
         if (data.length > 0) {
             let datos = {
                 ...filterData,
                 Rutas: data.map(x => (x.IdRuta)).join(','),
                 RutasStr: data.map(x => (x.Ruta)).join(', ')
             };
             setFilterData(datos);
         }
         setpopUpVisibleRuta(false); 
    };

    // const selectCompania = (dataPopup) => {
    //   const { IdCompania, Compania } = dataPopup[0];
    //   filterData.IdCompania = IdCompania;
    //   filterData.Compania = Compania;
    //   let datos = { ...filterData, IdCompania: IdCompania, Compania: Compania };
    //   setFilterData(datos);
    //   setPopupVisibleCompania(false);
    // }

    return (
        <Fragment>

            <Form formData={filterData} style={appBarForm} validationGroup="FormEdicion" >

                <GroupItem itemType="group" colCount={3}>

                <Item
                  dataField="Compania"
                  label={{ text: intl.formatMessage({ id: "ADMINISTRATION.COMPANY.COMPANY" }) }}
                  readOnly={true}
                  editorOptions={{
                    readOnly: true,
                    hoverStateEnabled: false,
                    inputAttr: { 'style': 'text-transform: uppercase' },
                    showClearButton: true,
                    value:isNotEmpty(Constants.DESCRIPCION_COMPANIA_DEFAULT) ? Constants.DESCRIPCION_COMPANIA_DEFAULT:"",
                    buttons: [{
                      name: 'search',
                      location: 'after',
                      useSubmitBehavior: true,
                      options: {
                        stylingMode: 'text',
                        icon: 'search',
                        disabled: true,
                        onClick: () => {
                          setPopupVisibleCompania(true);
                        },
                      }
                    }]
                  }}
                />
                
                    <Item dataField="FechaDesde"
                          label={{ text: intl.formatMessage({ id: "ASSISTANCE.PERSON.JUSTIFICATION.DATE.FROM" }) }}
                          isRequired={true}
                          editorType="dxDateBox"
                                editorOptions={{
                                    type: "datetime",
                                    showClearButton: true,
                                    displayFormat: "dd/MM/yyyy HH:mm",
                                }}


                    />
                    <Item dataField="FechaHasta"
                          label={{ text: intl.formatMessage({ id: "ASSISTANCE.PERSON.JUSTIFICATION.DATE.UNTIL" }) }}
                          isRequired={true}
                          editorType="dxDateBox"
                                editorOptions={{
                                    type: "datetime",
                                    showClearButton: true,
                                    displayFormat: "dd/MM/yyyy HH:mm",
                                }}

                    />

                    <Item
                        dataField="RutasStr"
                        label={{ text: intl.formatMessage({ id: "CONFIG.MENU.TRANSPORTE.RUTA" }) }}
                        isRequired={true}
                        editorOptions={{
                            hoverStateEnabled: false,
                            inputAttr: { style: "text-transform: uppercase" },
                            showClearButton: true,
                            buttons: [{
                                name: "search",
                                location: "after",
                                useSubmitBehavior: true,

                                options: {
                                    stylingMode: "text",
                                    icon: "search",
                                    readOnly: false,
                                    onClick: (evt) => {
                                      setpopUpVisibleRuta(true);
                                    },
                                },
                            }]
                        }}
                    />

                    <Item
                        dataField="Placa" 
                        label={{ text: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.VEHICLE" }) }}
                        editorOptions={{
                            hoverStateEnabled: false,
                            inputAttr: { style: "text-transform: uppercase" },
                            showClearButton: true,
                            buttons: [{
                                name: "search",
                                location: "after",
                                useSubmitBehavior: true,

                                options: {
                                    stylingMode: "text",
                                    icon: "search",
                                    readOnly: false,
                                    onClick: (evt) => {
                                        setIsVisibleVehiculoPopup(true);
                                    },
                                },
                            }]
                        }}
                    />



                    <Item
                        dataField="NombreChofer"
                        label={{ text: intl.formatMessage({ id: "ACCESS.VEHICLE.MARK.DRIVER" }) }}
                        editorOptions={{
                            hoverStateEnabled: false,
                            inputAttr: { style: "text-transform: uppercase" },
                            showClearButton: true,
                            buttons: [{
                                name: "search",
                                location: "after",
                                useSubmitBehavior: true,

                                options: {
                                    stylingMode: "text",
                                    icon: "search",
                                    readOnly: false,
                                    onClick: (evt) => {
                                         setIsVisiblePopUpChofer(true);
                                    },
                                },
                            }]
                        }}
                    />

                    <Item
                        dataField="NombrePasajero"
                        label={{ text: intl.formatMessage({ id: "ACCESS.VEHICLE.MARK.PASSENGERS" }) }}
                        editorOptions={{
                            hoverStateEnabled: false,
                            inputAttr: { style: "text-transform: uppercase" },
                            showClearButton: true,
                            buttons: [{
                                name: "search",
                                location: "after",
                                useSubmitBehavior: true,
                                options: {
                                    stylingMode: "text",
                                    icon: "search",
                                    readOnly: false,
                                    onClick: (evt) => {
                                        setIsVisiblePopUpPasajero(true);
                                    },
                                },
                            }]
                        }}
                    />
                </GroupItem>

            </Form>

      {/*******>POPUP DE RUTA>******** */}
          {popUpVisibleRuta && (
            <TransporteRutaBuscar
                selectData={selectRuta}
                showPopup={{ isVisiblePopUp: popUpVisibleRuta, setisVisiblePopUp: setpopUpVisibleRuta }}
                cancelarEdicion={() => setpopUpVisibleRuta(false)}
                uniqueId={"TransporteRutaBuscarProgramacionManifiestoReporte002"}
                showButton={true}
                selectionMode ={"multiple"}
            />
          )}

      {/*******>POPUP DE VEHICULOS>******** */}
          {isVisibleVehiculoPopup && (
            <TransporteVehiculosBuscar
            selectData={selectVehiculo}
            showPopup={{ isVisiblePopUp: isVisibleVehiculoPopup, setisVisiblePopUp: setIsVisibleVehiculoPopup }}
            cancelarEdicion={() => setIsVisibleVehiculoPopup(false)}
            uniqueId={"TransporteVehiculosBuscarReporte002"}
            showButton={true}
            />
          )}

      {/*******>POPUP DE PASAJEROS>******** */}
          {isVisiblePopUpPasajero && (
            // <TransportePersonasBuscar
            // selectData={seleccionarPersonas}
            // showPopup={{ isVisiblePopUp: isVisiblePopUpPasajero, setisVisiblePopUp: setIsVisiblePopUpPasajero }}
            // cancelarEdicion={() => setIsVisiblePopUpPasajero(false)}
            // uniqueId={"TransportePersonasBuscarReporte002"}
            // showButton={true}
            // />
                <AdministracionPersonaBuscar
                agregar={seleccionarPersonas}
                showPopup={{ isVisiblePopUp: isVisiblePopUpPasajero, setisVisiblePopUp: setIsVisiblePopUpPasajero }}
                cancelar={() => setIsVisiblePopUpPasajero(false)}
                uniqueId={"AdministracionPersonaBuscarReporte002"}
                />
          )}

      {/*******>POPUP DE CHOFER>******** */}
          {isVisiblePopUpChofer && (
            <TransporteChoferBuscar
            selectData={seleccionarChofer}
            showPopup={{ isVisiblePopUp: isVisiblePopUpChofer, setisVisiblePopUp: setIsVisiblePopUpChofer }}
            cancelarEdicion={() => setIsVisiblePopUpChofer(false)}
            uniqueId={"TransporteChoferBuscarReporte002"}
            showButton={true}
            />
          )}

        {/*******>POPUP DE COMPANIAS>******** */}
        {/* {popupVisibleCompania && (
          <AdministracionCompaniaBuscar
            selectData={selectCompania}
            showPopup={{ isVisiblePopUp: popupVisibleCompania, setisVisiblePopUp: setPopupVisibleCompania }}
            cancelarEdicion={() => setPopupVisibleCompania(false)}
            uniqueId={"administracionCompaniaBuscarReporte002"}
            />
        )} */}

        </Fragment>
    );
};

export default injectIntl(WithLoandingPanel(ProgramacionesManifiestosFilter));
