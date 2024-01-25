import React, { useEffect, useState, Fragment } from "react";
import Form, { Item, GroupItem, EmptyItem } from "devextreme-react/form";
import AdministracionPersonaBuscar from "../../../../../partials/components/AdministracionPersonaBuscar";
import TransporteRutaBuscar from '../../../../../partials/components/transporte/popUps/TransporteRutaBuscar';
import AdministracionCompaniaBuscar from "../../../../../partials/components/AdministracionCompaniaBuscar";
import { injectIntl } from "react-intl";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";

const PersonalNoAbordoFilter = (props) => {

    const { intl, setLoading } = props;
    const filterData = props.filterData;
    const setFilterData = props.setFilterData;

    const [isVisiblePopUpPasajero, setisVisiblePopUpPasajero] = useState(false);
    const [isVisiblePopUpRutas, setisVisiblePopUpRutas] = useState(false);
    const [isVisiblePopUpCompania, setisVisiblePopUpCompania] = useState(false);

    const appBarForm = { marginBottom: "10px", padding: "10px" };

    const agregarPasajeroAdministrador = (data) => {
        //  console.log("agregarPasajeroAdministrador", data);
        if (data.length > 0) {
            let { IdPersona, NombreCompleto } = data[0];
            let datos = { ...filterData, CodigoPasajero: IdPersona, NombrePasajero: NombreCompleto };
            setFilterData(datos);
        }
        setisVisiblePopUpPasajero(false);
    }

    const agregarRutasAdministrador = (data) => {
        //  console.log("agregarRutasAdministrador", data);
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

    const selectCompania = (data) => {
        //  console.log("selectCompania|data:", data);
        if (data.length > 0) {
            let { IdCompania, Compania } = data[0];
            let datos = { ...filterData, IdCompania, Compania };
            setFilterData(datos);
        }
        setisVisiblePopUpCompania(false);
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
                    <EmptyItem />

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
                                        setisVisiblePopUpRutas(false);
                                        setisVisiblePopUpRutas(true);
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

                    <Item
                        dataField="Compania"
                        label={{ text: intl.formatMessage({ id: "ADMINISTRATION.COMPANY.COMPANY" }) }}
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
                                         setisVisiblePopUpCompania(true);
                                    },
                                },
                            }]
                        }}
                    />
                </GroupItem>
            </Form>

            {/* POPUP-> buscar pasajero */}
            <AdministracionPersonaBuscar
                showPopup={{ isVisiblePopUp: isVisiblePopUpPasajero, setisVisiblePopUp: setisVisiblePopUpPasajero }}
                cancelar={() => setisVisiblePopUpPasajero(false)}
                agregar={agregarPasajeroAdministrador}
                selectionMode={"single"}
                uniqueId={"pasajeroBuscarRptPersonalNoAbordoFilterPageReporte004"}
            />

            {/* POPUP-> buscar rutas */}
            <TransporteRutaBuscar
                showPopup={{ isVisiblePopUp: isVisiblePopUpRutas, setisVisiblePopUp: setisVisiblePopUpRutas }}
                cancelar={() => setisVisiblePopUpRutas(false)}
                selectData={agregarRutasAdministrador}
                selectionMode={"multiple"}
                uniqueId={"rutasBuscarRptPersonalNoAbordoFilterPageReporte004"}
                filtro ={{}}
            />

          {/*******>POPUP DE COMPANIAS>******** */}
            {isVisiblePopUpCompania && (
              <AdministracionCompaniaBuscar
                selectData={selectCompania} 
                showPopup={{ isVisiblePopUp: isVisiblePopUpCompania, setisVisiblePopUp: setisVisiblePopUpCompania }}
                cancelarEdicion={() => setisVisiblePopUpCompania(false)}
                uniqueId={"administracionCompaniaBuscarReporte002"}
                />
            )}


        </Fragment>
    );
};

export default injectIntl(WithLoandingPanel(PersonalNoAbordoFilter));
