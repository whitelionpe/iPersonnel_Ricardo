import React, { useEffect, useState, Fragment } from "react";
import Form, { Item, GroupItem } from "devextreme-react/form";

import TransporteRutaBuscar from '../../../../../partials/components/transporte/popUps/TransporteRutaBuscar';
import TransporteVehiculosBuscar from '../../../../../partials/components/transporte/popUps/TransporteVehiculosBuscar';
import TransporteChoferBuscar from '../../../../../partials/components/transporte/popUps/TransporteChoferBuscar';
import AdministracionPersonaBuscar from "../../../../../partials/components/AdministracionPersonaBuscar";

import { injectIntl } from "react-intl";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";

const ProgramacionesManifiestosUrbanitoFilter = (props) => {

  const { intl, setLoading } = props;

    const filterData = props.filterData;
    const setFilterData = props.setFilterData;

    const [isVisiblePopUpChofer, setisVisiblePopUpChofer] = useState(false);
    const [isVisiblePopUpPasajero, setisVisiblePopUpPasajero] = useState(false);
    const [isVisiblePopUpVehiculos, setisVisiblePopUpVehiculos] = useState(false);
    const [isVisiblePopUpRutas, setisVisiblePopUpRutas] = useState(false);

    const [filtroLocal, setFiltroLocal] = useState({
        IdTipoRuta: "URBANO",
      });

    const appBarForm = { marginBottom: "10px", padding: "10px" };

    const seleccionarChofer = (data) => {
        //  console.log("seleccionarChofer", data);
        if (data.length > 0) {
            let { IdPiloto : IdPersona, NombreCompleto } = data[0];
            let datos = { ...filterData, IdPersona, NombreChofer: NombreCompleto };
            setFilterData(datos);
        }
        setisVisiblePopUpChofer(false);
    }

    const seleccionarPasajero = (data) => {
        //  console.log("seleccionarPasajero", data);
        if (data.length > 0) {
            let { IdPasajero : IdPersona, NombreCompleto } = data[0];
            let datos = { ...filterData, IdPersona, NombrePasajero: NombreCompleto };
            setFilterData(datos);
        }
    }

    const selectVehiculo = async (data) => {
      // console.log("selectVehiculo|data:",data);
      if (data.length > 0) {
        let { IdVehiculo, Placa } = data[0];
        let datos = { ...filterData, IdVehiculo, Placa };
        setFilterData(datos);
    }
    setisVisiblePopUpVehiculos(false); 
    };

    const selectRuta = (data) => {
        if (data.length > 0) {
            let datos = {
                ...filterData,
                Rutas: data.map(x => (x.IdRuta)).join(','),
                RutasStr: data.map(x => (x.Ruta)).join(', ')
            };
            setFilterData(datos);
        }
        setisVisiblePopUpRutas(false); 
    }

    return (
        <Fragment>

            <Form formData={filterData} style={appBarForm} validationGroup="FormEdicion" >

                <GroupItem itemType="group" colCount={3}>
                    <Item dataField="FechaDesde"
                          label={{ text: intl.formatMessage({ id: "ASSISTANCE.PERSON.JUSTIFICATION.DATE.FROM" }) }}
                          editorType="dxDateBox"
                        editorOptions={{
                            type: "date",
                            showClearButton: true,
                            displayFormat: "dd/MM/yyyy",
                        }}
                    />
                    
                    <Item dataField="FechaHasta"
                          label={{ text: intl.formatMessage({ id: "ASSISTANCE.PERSON.JUSTIFICATION.DATE.UNTIL" }) }}
                          editorType="dxDateBox"
                        editorOptions={{
                            type: "date",
                            showClearButton: true,
                            displayFormat: "dd/MM/yyyy",
                        }}
                    />

                    <Item
                        dataField="RutasStr"
                        label={{ text: intl.formatMessage({ id: "CONFIG.MENU.TRANSPORTE.RUTA" }) }}
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
                                        setisVisiblePopUpRutas(true);
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
                                        setisVisiblePopUpVehiculos(true);
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
                                        setisVisiblePopUpChofer(true);
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
                                        setisVisiblePopUpPasajero(true);
                                    },
                                },
                            }]
                        }}
                    />
                </GroupItem>
            </Form>

      {/*******>POPUP DE RUTA>******** */}
        {isVisiblePopUpRutas && (
          <TransporteRutaBuscar
              selectData={selectRuta}
              showPopup={{ isVisiblePopUp: isVisiblePopUpRutas, setisVisiblePopUp: setisVisiblePopUpRutas }}
              cancelarEdicion={() => setisVisiblePopUpRutas(false)}
              uniqueId={"TransporteRutaBuscarProgramacionManifiestoReporte006"}
              showButton={true}
              selectionMode ={"multiple"}
              filtro ={filtroLocal}
          />
        )}

      {/*******>POPUP DE PASAJEROS>******** */}
          {isVisiblePopUpPasajero && (
          <AdministracionPersonaBuscar
          agregar={seleccionarPasajero}
          showPopup={{ isVisiblePopUp: isVisiblePopUpPasajero, setisVisiblePopUp: setisVisiblePopUpPasajero }}
          cancelar={() => setisVisiblePopUpPasajero(false)}
          uniqueId={"AdministracionPersonaBuscarReporte006"}
          />
          )}

      {/*******>POPUP DE CHOFER>******** */}
          {isVisiblePopUpChofer && (
            <TransporteChoferBuscar
            selectData={seleccionarChofer}
            showPopup={{ isVisiblePopUp: isVisiblePopUpChofer, setisVisiblePopUp: setisVisiblePopUpChofer }}
            cancelarEdicion={() => setisVisiblePopUpChofer(false)}
            uniqueId={"TransporteChoferBuscarReporte006"}
            showButton={true}
            />
          )}

      {/*******>POPUP DE VEHICULOS>******** */}
             {isVisiblePopUpVehiculos && (
            <TransporteVehiculosBuscar
            selectData={selectVehiculo}
            showPopup={{ isVisiblePopUp:isVisiblePopUpVehiculos, setisVisiblePopUp: setisVisiblePopUpVehiculos }}
            cancelarEdicion={() => setisVisiblePopUpVehiculos(false)}
            uniqueId={"TransporteVehiculosBuscarReporte006"}
            showButton={true}
            />
      )}

        </Fragment>
    );
};
export default injectIntl(WithLoandingPanel(ProgramacionesManifiestosUrbanitoFilter));
