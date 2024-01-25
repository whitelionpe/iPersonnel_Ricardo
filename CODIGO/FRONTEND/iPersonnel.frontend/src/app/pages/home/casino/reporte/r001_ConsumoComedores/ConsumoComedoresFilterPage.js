import React, { Fragment, useEffect, useState } from 'react';
import { injectIntl } from "react-intl";
import { useSelector } from "react-redux";

import Form, { Item, GroupItem } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar, Portlet } from "../../../../../partials/content/Portlet";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";

import PropTypes from 'prop-types';
import {
    isNotEmpty, dateFormat, getStartAndEndOfMonthByDay
} from "../../../../../../_metronic";

import AdministracionCompaniaBuscar from "../../../../../partials/components/AdministracionCompaniaBuscar";
import AdministracionUnidadOrganizativaBuscar from "../../../../../partials/components/AdministracionUnidadOrganizativaBuscar";
import { obtenerTodos as obtenerCmbComedor } from "../../../../../api/casino/comedor.api";
import { obtenerTodos as obtenerCmbServicio } from "../../../../../api/casino/comedorServicio.api";

import AdministracionCentroCostoBuscar from '../../../../../partials/components/AdministracionCentroCostoBuscar';
import PersonaTextAreaPopup from '../../../../../partials/components/PersonaTextAreaPopup/PersonaTextAreaPopup';


const ConsumoComedoresFilterPage = (props) => {

    const { intl,dataRowEditNew } = props;
    const { IdCliente, IdDivision } = useSelector(state => state.perfil.perfilActual);
    const [viewFilter, setViewFilter] = useState(true);
    const [cmbComedor, setCmbComedor] = useState([]);
    const [cmbServicio, setCmbServicio] = useState([]);
    const perfil = useSelector(state => state.perfil.perfilActual);
    const [Filtros, setFiltros] = useState({ FlRepositorio: "1", IdUnidadOrganizativa: "" });
    const [isVisibleCentroCosto, setisVisibleCentroCosto] = useState(false);
    const [popupVisiblePersonas, setPopupVisiblePersonas] = useState(false);
    const [ifThereAreNoChangesLoadFromStorage, setIfThereAreNoChangesLoadFromStorages] = useState(true);
    const { FechaInicio, FechaFin } = getStartAndEndOfMonthByDay();

    const [popupVisibleCompania, setPopupVisibleCompania] = useState(false);
    const [popupVisibleUnidad, setPopupVisibleUnidad] = useState(false);


    async function cargarCombos() {
        let cmbComedorX = await obtenerCmbComedor({ IdCliente: IdCliente, IdDivision: IdDivision, IdTipo: '%' });
        setCmbComedor(cmbComedorX);
    }

    const selectCompania = dataPopup => {
        const { IdCompania, Compania } = dataPopup[0];
        dataRowEditNew.IdCompania = IdCompania;
        dataRowEditNew.Compania = Compania;
        setPopupVisibleCompania(false);
    };

    const selectUnidadOrganizativa = async (selectedRow) => {
        let strUnidadesOrganizativas = selectedRow.map(x => x.IdUnidadOrganizativa).join('|');
        let UnidadesOrganizativasDescripcion = selectedRow.map(x => x.Menu).join(',');
        dataRowEditNew.UnidadesOrganizativas = strUnidadesOrganizativas;
        dataRowEditNew.UnidadesOrganizativasDescripcion = UnidadesOrganizativasDescripcion;
        setPopupVisibleUnidad(false);
    };

    async function CargarServicios(idComedor) {
        let cmbServicioX = await obtenerCmbServicio({ IdCliente: perfil.IdCliente, IdDivision: perfil.IdDivision, IdComedor: idComedor });
        setCmbServicio(cmbServicioX);
    }

    const selectPersonas = (data) => {
        if (isNotEmpty(data)) {
            let strPersonas = data.split('|').join(',');
            dataRowEditNew.Personas = strPersonas;
        }
    };

    const agregarCentroCosto = (dataPopup) => {
        const { IdCentroCosto, CentroCosto } = dataPopup[0];
        if (isNotEmpty(IdCentroCosto)) {
            props.setDataRowEditNew({
                ...dataRowEditNew,
                IdCentroCosto: IdCentroCosto,
                CentroCosto: CentroCosto,
            });
        }
        setisVisibleCentroCosto(false);
    };

    useEffect(() => {
        cargarCombos();
        if (ifThereAreNoChangesLoadFromStorage) setIfThereAreNoChangesLoadFromStorages(false);
    }, [ifThereAreNoChangesLoadFromStorage]);

    useEffect(() => {
        if (props.refreshData) {
            props.refresh();
            props.setRefreshData(false);
        }
    }, [props.refreshData]);


    const eventRefresh = () => {
        props.setDataRowEditNew({
            IdCliente,
            IdDivision,
            IdComedor: '',
            IdServicio: '',
            IdUnidadOrganizativa: '',
            IdCompania: '',
            Compania: '',
            IdCentroCosto: '',
            CentroCosto: '',
            Personas: '',
            FechaInicio: FechaInicio,
            FechaFin: FechaFin
        });
        //Index.props.limpiarGrilla()
        props.clearDataGrid();
    }
    /*Filtro para obtener lista de requisitos*********************************/


    const filtrar = async (e) => {
       
        let result = e.validationGroup.validate();
        if (result.isValid) {
            let filtro = {
                IdCliente,
                IdDivision,
                IdComedor: isNotEmpty(dataRowEditNew.IdComedor) ? dataRowEditNew.IdComedor : "",
                IdServicio: isNotEmpty(dataRowEditNew.IdServicio) ? dataRowEditNew.IdServicio : "",
                IdCompania: isNotEmpty(dataRowEditNew.IdCompania) ? dataRowEditNew.IdCompania : "",
                IdCentroCosto: isNotEmpty(dataRowEditNew.IdCentroCosto) ? dataRowEditNew.IdCentroCosto : "",
                FechaInicio: dateFormat(dataRowEditNew.FechaInicio, 'yyyyMMdd'),
                FechaFin: dateFormat(dataRowEditNew.FechaFin, 'yyyyMMdd'),
                Personas: isNotEmpty(dataRowEditNew.Personas) ? dataRowEditNew.Personas : "",
                IdUnidadOrganizativa: isNotEmpty(dataRowEditNew.UnidadesOrganizativas) ? dataRowEditNew.UnidadesOrganizativas : "",
            }
            props.filtrarReporte(filtro);
        }
    };



    const hideFilter = () => {
        let form = document.getElementById("FormFilter");
        if (viewFilter) {
            setViewFilter(false);
            form.classList.add('hidden');
        } else {
            form.classList.remove('hidden');
            setViewFilter(true);
        }
    }

    return (
        <Fragment>
            <PortletHeader
                title=''
                toolbar={
                    <PortletHeaderToolbar>

                        <Button icon={viewFilter ? "chevronup" : "chevrondown"}
                            type="default"
                            hint={viewFilter ? intl.formatMessage({ id: "COMMON.HIDE" }) : intl.formatMessage({ id: "COMMON.SHOW" })}
                            onClick={hideFilter} />
                        &nbsp;
                        <Button
                            id="btnSearch"
                            icon="fa fa-search"
                            type="default"
                            hint={intl.formatMessage({ id: "ACTION.FILTER" })}
                            onClick={filtrar}
                            useSubmitBehavior={true}
                            validationGroup="FormEdicion"
                        />

                        &nbsp;
                        <Button icon="refresh"
                            type="default"
                            hint={intl.formatMessage({ id: "ACTION.CLEAN" })}
                            onClick={eventRefresh} />

                        &nbsp;
                        <Button
                            icon="fa fa-file-excel"
                            type="default"
                            hint={intl.formatMessage({ id: "ACTION.EXPORT" })}
                            onClick={props.exportReport}
                        />

                    </PortletHeaderToolbar>

                } />

            <PortletBody >
                <React.Fragment>
                    <Form id="FormFilter" formData={dataRowEditNew} validationGroup="FormEdicion" >
                        <GroupItem itemType="group" colCount={3} colSpan={1}>
                            <Item
                                dataField="IdComedor"
                                label={{ text: intl.formatMessage({ id: "CASINO.DINNINGROOM" }) }}
                                editorType="dxSelectBox"
                                editorOptions={{
                                    items: cmbComedor,
                                    valueExpr: "IdComedor",
                                    displayExpr: "Comedor",
                                    showClearButton: true,
                                    onValueChanged: (e) => {
                                        if (isNotEmpty(e.value)) {
                                            CargarServicios(e.value);
                                        }
                                    },

                                }}
                            />

                            <Item
                                dataField="IdServicio"
                                editorType="dxSelectBox"
                                label={{ text: intl.formatMessage({ id: "CASINO.DINNINGROOM.SERVICE" }) }}
                                editorOptions={{
                                    items: cmbServicio,
                                    valueExpr: "IdServicio",
                                    showClearButton: true,
                                    displayExpr: function (item) {
                                        if (item) {
                                            return item.Servicio + "- [" + item.HoraInicio + " " + item.HoraFin + "]";
                                        }
                                    },
                                }}
                            />

                            <Item
                                dataField="Compania"
                                label={{ text: intl.formatMessage({ id: "CASINO.CONSOLIDATED.REPORT.DININGROOMS" }) }}
                                editorOptions={{
                                    readOnly: true,
                                    hoverStateEnabled: false,
                                    inputAttr: { 'style': 'text-transform: uppercase' },
                                    showClearButton: true,
                                    buttons: [{
                                        name: 'search',
                                        location: 'after',
                                        useSubmitBehavior: true,
                                        options: {
                                            stylingMode: 'text',
                                            icon: 'search',
                                            disabled: false,
                                            onClick: () => {
                                                setPopupVisibleCompania(true);
                                            },
                                        }
                                    }]
                                }}
                            />

                            <Item
                                colSpan={1} dataField="CentroCosto"
                                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CENTROCOSTO" }), }}
                                editorOptions={{
                                    readOnly: true,
                                    hoverStateEnabled: false,
                                    inputAttr: { style: "text-transform: uppercase" },
                                    showClearButton: true,
                                    buttons: [
                                        {
                                            name: "search",
                                            location: "after",
                                            useSubmitBehavior: true,
                                            options: {
                                                stylingMode: "text",
                                                icon: "search",
                                                disabled: false,
                                                onClick: () => {
                                                    setFiltros({ FlRepositorio: "1", IdUnidadOrganizativa: "" })
                                                    setisVisibleCentroCosto(true);
                                                },
                                            },
                                        },
                                    ],
                                }}
                            />

                            <Item
                                dataField="FechaInicio"
                                label={{ text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.STARTDATE" }) }}
                                isRequired={true}
                                editorType="dxDateBox"
                                dataType="date"
                                editorOptions={{
                                    inputAttr: { style: "text-transform: uppercase" },
                                    displayFormat: "dd/MM/yyyy",
                                }}
                            />

                            <Item
                                dataField="FechaFin"
                                label={{ text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.ENDDATE" }) }}
                                isRequired={true}
                                editorType="dxDateBox"
                                dataType="date"
                                editorOptions={{
                                    inputAttr: { style: "text-transform: uppercase" },
                                    displayFormat: "dd/MM/yyyy",
                                }}
                            />
                            <Item dataField="Personas"
                                label={{ text: intl.formatMessage({ id: "CASINO.PERSON.GROUP.PERSONS" }) }}
                                editorOptions={{
                                    //readOnly: true,
                                    hoverStateEnabled: false,
                                    inputAttr: { 'style': 'text-transform: uppercase' },
                                    showClearButton: true,
                                    buttons: [{
                                        name: 'search',
                                        location: 'after',
                                        useSubmitBehavior: true,
                                        showClearButton: true,
                                        options: {
                                            stylingMode: 'text',
                                            icon: 'search',
                                            disabled: false,
                                            onClick: () => {
                                                setPopupVisiblePersonas(true);
                                            },
                                        }
                                    }]
                                }} />
                            <Item
                                dataField="UnidadesOrganizativasDescripcion"
                                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.POSITION.ORGANIZATIONALUNIT" }) }}
                                editorOptions={{
                                    readOnly: true,
                                    hoverStateEnabled: false,
                                    inputAttr: { 'style': 'text-transform: uppercase' },
                                    showClearButton: true,
                                    buttons: [{
                                        name: 'search',
                                        location: 'after',
                                        useSubmitBehavior: true,
                                        options: {
                                            stylingMode: 'text',
                                            icon: 'search',
                                            disabled: false,
                                            onClick: () => {
                                                setPopupVisibleUnidad(true);
                                            },
                                        }
                                    }]
                                }}
                            />
                        </GroupItem>
                    </Form>
                </React.Fragment>
            </PortletBody>

            {/*******>POPUP DE COMPANIAS>******** */}
            {popupVisibleCompania && (
                <AdministracionCompaniaBuscar
                    selectData={selectCompania}
                    showPopup={{ isVisiblePopUp: popupVisibleCompania, setisVisiblePopUp: setPopupVisibleCompania }}
                    cancelarEdicion={() => setPopupVisibleCompania(false)}
                    uniqueId={"casinoCompaniabuscarRequisitoPage"}
                />
            )}


            {/*******>POPUP DE UNIDAD ORGA.>******** */}
            {popupVisibleUnidad && (
                <AdministracionUnidadOrganizativaBuscar
                    selectData={selectUnidadOrganizativa}
                    showPopup={{ isVisiblePopUp: popupVisibleUnidad, setisVisiblePopUp: setPopupVisibleUnidad }}
                    cancelarEdicion={() => setPopupVisibleUnidad(false)}
                    selectionMode={"multiple"}
                    showCheckBoxesModes={"normal"}
                />
            )}

            {popupVisiblePersonas && (
                <PersonaTextAreaPopup
                    isVisiblePopupDetalle={popupVisiblePersonas}
                    setIsVisiblePopupDetalle={setPopupVisiblePersonas}
                    obtenerNumeroDocumento={selectPersonas}
                />
            )}

            {isVisibleCentroCosto && (
                <AdministracionCentroCostoBuscar
                    selectData={agregarCentroCosto}
                    showButton={false}
                    showPopup={{ isVisiblePopUp: isVisibleCentroCosto, setisVisiblePopUp: setisVisibleCentroCosto }}
                    cancelarEdicion={() => setisVisibleCentroCosto(false)}
                    uniqueId={"casinoCentrCostoConsumo01Page"}
                    selectionMode={"row"}
                    Filtros={Filtros}
                />
            )}

        </Fragment >

    );
};


export default injectIntl(WithLoandingPanel(ConsumoComedoresFilterPage));
