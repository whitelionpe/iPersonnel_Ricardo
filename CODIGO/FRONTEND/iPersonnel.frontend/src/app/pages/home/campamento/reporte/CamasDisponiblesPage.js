import React, { Fragment, useEffect, useState, useRef } from 'react';
import { useSelector } from "react-redux";
import Form, { Item, GroupItem, EmptyItem } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";

import { useStylesEncabezado } from "../../../../store/config/Styles";
import { injectIntl } from "react-intl";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import HeaderInformation from "../../../../partials/components/HeaderInformation";
import { handleInfoMessages } from "../../../../store/ducks/notify-messages";

//Combos 
import { campamentos as listarCampamentos } from "../../../../api/campamento/perfilDetalle.api";
import { listar as listarModulo } from "../../../../api/campamento/tipoModulo.api";
import { listar as listarTipoHabitacion } from "../../../../api/campamento/tipoHabitacion.api";
import { listar as listarServicios } from "../../../../api/campamento/servicio.api";
import {
    listartipomodulo as listartipomoduloPerfil,
    listartipohabitacion as listartipohabitacionPerfil
} from "../../../../api/campamento/perfilDetalle.api";
import CampamentoPerfilBuscar from "../../../../partials/components/CampamentoPerfilBuscar";

//Utils
import { getStartAndEndOfMonthByDay, isNotEmpty, truncateDate } from '../../../../../_metronic/utils/utils';

import {
    esDiaDisponible, crearArregloColumnasHeader, cellRenderReserva,
} from '../reserva/ReservasUtil';
import ReservaDetalleCamaPopup from '../reserva/ReservaDetalleCamaPopup';

import SimpleDropDownBoxGrid from '../../../../partials/components/SimpleDropDownBoxGrid/SimpleDropDownBoxGrid';
import DataGridDynamic from '../../../../partials/components/DataGridDynamic/DataGridDynamic';
import ReservaLeyenda from '../reserva/ReservaLeyenda';
import './CamasDisponiblesPage.css';
import { AppBar, Toolbar, Typography } from '@material-ui/core';
import CampamentoModuloBuscar from '../../../../partials/components/CampamentoModuloBuscar';
import CampamentoHabitacionBuscar from '../../../../partials/components/CampamentoHabitacionBuscar';

const CamasDisponiblesPage = ({
    intl, setLoading,
    columnasEstaticasAdicionales = [],
    dataRowEditNew,
    setDataRowEditNew,
    retornarReserva,
    getInfo,
    descargaExcel,
    consultarDisponibilidadCamas,
    forceViewPaginacion = false
}) => {
    const classesEncabezado = useStylesEncabezado();
    const [listaParaReserva, setListaParaReserva] = useState([]);
    const perfil = useSelector(state => state.perfil.perfilActual);

    const [campamentos, setCampamentos] = useState([]);
    const [tipomodulos, setTipomodulos] = useState([]);
    const [tipoHabitaciones, setTipoHabitaciones] = useState([]);
    const [servicios, setServicios] = useState([]);
    const [isVisiblePopupDetalle, setIsVisiblePopupDetalle] = useState(false);
    const [datosReservaDetalle, setDatosReservaDetalle] = useState({ DetalleServicios: [] });
    const [servicioSeleccionados, setServiciosSeleccionados] = useState([]);
    const [popupVisibleCampamentoPerfil, setPopupVisibleCampamentoPerfil] = useState(false);
    const [viewPagination, setViewPagination] = useState(false);
    const [columnasFecha, setColumnasFechas] = useState([]);
    const dataGridRef = useRef(null);

    const [width, setWidth] = useState(window.innerWidth);
    const [height, setHeight] = useState(window.innerHeight);
    const [popupVisibleModulo, setPopupVisibleModulo] = useState(false);
    const [popupVisibleHabitacion, setPopupVisibleHabitacion] = useState(false);
    const buscarReservas = async (skip, take) => {

        skip = isNotEmpty(skip) ? skip : 0;
        take = isNotEmpty(take) ? take : 20;

        let datosReserva = await consultarDisponibilidadCamas(servicioSeleccionados, skip, take);//Pagina 1 de [0 a 20]


        setListaParaReserva(datosReserva.resultados)

        if (forceViewPaginacion) {
            setViewPagination(true);
        }
        //Creando columnas dinamicas:
        let header_json = crearArregloColumnasHeader((datosReserva.headerColumns || []), intl, { cellRender: cellRenderReserva });

        if (header_json.length > 0) {
            setColumnasFechas(header_json);
        }




    }


    const selectCampamentoPerfil3333 = async () => {
        buscarReservas();
    }

    const onValueChangedCampamento = async (valor) => {
        setLoading(true);
        let IdCliente = perfil.IdCliente;
        let IdDivision = perfil.IdDivision;
        let IdPerfil = dataRowEditNew.IdPerfil;
        let IdCampamento = valor;

        let [
            tmp_tipomodulos,
            tmp_tipoHabitaciones
        ] = await Promise.all([
            listartipomoduloPerfil({ IdCliente, IdDivision, IdPerfil, IdCampamento }),
            listartipohabitacionPerfil({ IdCliente, IdDivision, IdPerfil, IdCampamento })])
            .finally(() => { setLoading(false); });

        if (tmp_tipoHabitaciones.length > 0) {
            tmp_tipoHabitaciones.unshift({ IdTipoHabitacion: '', TipoHabitacion: '-- Todos --' });
        }
        if (tmp_tipomodulos.length > 0) {
            tmp_tipomodulos.unshift({ IdTipoModulo: '', TipoModulo: '-- Todos --' });
        }

        setTipomodulos(tmp_tipomodulos);
        setTipoHabitaciones(tmp_tipoHabitaciones);
    }



    useEffect(() => {
        cargarCombos();

        window.addEventListener("resize", updateWidthAndHeight);
        return () => window.removeEventListener("resize", updateWidthAndHeight);

    }, []);

    const updateWidthAndHeight = () => {
        setWidth(window.innerWidth);
        setHeight(window.innerHeight);
    };


    async function cargarCombos() {
        setLoading(true);
        let { FechaInicio, FechaFin } = getStartAndEndOfMonthByDay(new Date(), 1);
        FechaInicio = truncateDate(new Date());
        let IdCliente = perfil.IdCliente;
        let IdDivision = perfil.IdDivision;
        let IdCampamento = "";
        let [tmp_campamento,
            tmp_tipoHabitaciones,
            tmp_tipomodulos,
            tmp_Servicios
        ] = await Promise.all([
            listarCampamentos({ IdCliente, IdDivision, IdPerfil: '' }),
            listarTipoHabitacion({ IdCliente, IdDivision, numPagina: 0, tamPagina: 0 }),
            listarModulo({ IdCliente, IdDivision, numPagina: 0, tamPagina: 0 }),
            listarServicios({ IdCliente, IdDivision, numPagina: 0, tamPagina: 0 })
        ])
            .finally(() => { });


        if (tmp_campamento.length > 0) {
            IdCampamento = tmp_campamento[0].IdCampamento;
        }

        if (tmp_tipoHabitaciones.length > 0) {
            tmp_tipoHabitaciones.unshift({ IdTipoHabitacion: '', TipoHabitacion: '-- Todos --' });
        }
        if (tmp_tipomodulos.length > 0) {
            tmp_tipomodulos.unshift({ IdTipoModulo: '', TipoModulo: '-- Todos --' });
        }


        setCampamentos(tmp_campamento);
        setTipomodulos(tmp_tipomodulos);
        setTipoHabitaciones(tmp_tipoHabitaciones);
        setServicios(tmp_Servicios.map(x => ({ IdServicio: x.IdServicio, Servicio: x.Servicio, Check: true })));
        setDataRowEditNew({ ...dataRowEditNew, IdCampamento, FechaInicio, FechaFin, conCamas: 0 });
        setLoading(false);
    }


    const selectCampamentoPerfil = async (dataPopup) => {
        const { IdCliente, IdDivision, IdPerfil, Perfil } = dataPopup[0];
        let IdCampamento = '';
        let tmp_campamentos = await listarCampamentos({
            IdCliente: perfil.IdCliente,
            IdDivision: perfil.IdDivision,
            IdPerfil
        });
        setCampamentos(tmp_campamentos);

        if (tmp_campamentos.length > 0) {
            //Se selecciona campamento por defecto:
            IdCampamento = tmp_campamentos[0].IdCampamento;
        }
        setDataRowEditNew({ ...dataRowEditNew, IdCampamento, IdPerfil, Perfil });
        setPopupVisibleCampamentoPerfil(false);
    }

    const seleccionarCuadro = async (e) => {

        if (e.column.dataField.length > 0) {
            let columnValid = e.column.dataField.substring(0, 2);

            if (columnValid === 'K_') {
                //console.log(e);
                let estadoCeldActual = e.cellElement.childNodes[0].innerText;

                if (!esDiaDisponible(estadoCeldActual)) {


                    let [idReserva, turno, estado, idPersona, EstadoCama] = e.value.split('_');

                    if (idReserva != 0 && EstadoCama != 'L') {
                        setLoading(true);
                        let param = {
                            IdCampamento: e.data.IdCampamento,
                            IdReserva: idReserva,
                            Fecha: e.column.dataField.split('_')[1],
                        };
                        let objReserva = await retornarReserva(param);
                        ////console.log("se carga info: ", objReserva);

                        if (objReserva.length != 0) {
                            let strTurno = objReserva.Turno == 'F' ? 'Full' : objReserva.Turno == 'D' ? 'Dia' : 'Noche';
                            let css_color_estado = '';
                            let strEstado = '';
                            switch (objReserva.Estado) {
                                case 'P': css_color_estado = 'item_cuadro item_cuadro_r'; strEstado = 'Reservado'; break;
                                case 'A': css_color_estado = 'item_cuadro item_cuadro_i'; strEstado = 'Ocupado'; break;
                                case 'I': css_color_estado = 'item_cuadro item_cuadro_o'; strEstado = 'Finalizado'; break;
                            }

                            objReserva.cssEstado = css_color_estado;
                            objReserva.Turno = strTurno;
                            objReserva.Estado = strEstado;

                            let lstServicios = objReserva.Servicios != null ? objReserva.Servicios.split('|').map(x => (x.split('@')[1])) : [];
                            ////console.log("servicios ", lstServicios);
                            objReserva.DetalleServicios = lstServicios;
                            setDatosReservaDetalle(objReserva);

                            setIsVisiblePopupDetalle(true);

                        }
                        setLoading(false);
                        //DetalleServicios

                    } else {
                        handleInfoMessages("Día sin reserva.");
                    }

                }

            }
        }
    }

    const columnasEstaticas = [
        {
            dataField: "Columnas", caption: intl.formatMessage({ id: "CAMP.RESERVATION.BEDINFORMATION" }),
            items: [
                { dataField: "TipoModulo", caption: intl.formatMessage({ id: "CAMP.RESERVATION.MODULETYPE" }), width: '90' },
                { dataField: "Modulo", caption: intl.formatMessage({ id: "CAMP.RESERVATION.MODULE" }), width: '70' },
                { dataField: "TipoHabitacion", caption: intl.formatMessage({ id: "CAMP.RESERVATION.ROOMTYPE.ABR" }), width: '90' },
                ...columnasEstaticasAdicionales,
                { dataField: "Cama", caption: intl.formatMessage({ id: "CAMP.RESERVATION.BED" }), width: '90', },
            ]
        }
    ];

    const cssClsMaxWidth = {
        width: `${((width <= 1025) ? width - 80 : width - 130)}px`
    }

    const selectModulo = data => setDataRowEditNew({ ...dataRowEditNew, IdModulo: data[0].IdModulo, Modulo: data[0].Modulo, IdHabitacion: "", Habitacion: "" });

    const selectHabitacion = data => setDataRowEditNew({ ...dataRowEditNew, IdHabitacion: data[0].IdHabitacion, Habitacion: data[0].Habitacion });


    return (
        <Fragment>

            <HeaderInformation data={getInfo()} visible={true} labelLocation={'left'} colCount={1}
                toolbar={
                    <PortletHeader
                        title={""}
                        toolbar={
                            <PortletHeaderToolbar>
                                <Button
                                    icon="fa fa-search"
                                    type="default"
                                    hint={intl.formatMessage({ id: "ACTION.SEARCH" })}
                                    onClick={() => {
                                        // console.log(servicioSeleccionados);
                                        // let result = e.validationGroup.validate();
                                        // if (!result.isValid) {
                                        //     return;
                                        // }
                                        // console.log("buscarReservas", e);
                                        selectCampamentoPerfil3333();
                                    }}
                                    useSubmitBehavior={true}
                                    validationGroup="FormEdicion"

                                />
                                &nbsp;
                                <Button
                                    icon="fa fa-file-excel"
                                    type="normal"
                                    hint={intl.formatMessage({ id: "ACTION.EXPORT" })}
                                    onClick={async () => {
                                        descargaExcel(servicioSeleccionados, 0, 0);
                                    }}
                                />
                            </PortletHeaderToolbar>
                        }
                    />
                } />

            <PortletBody >
                <React.Fragment>
                    <Form formData={dataRowEditNew} validationGroup="FormEdicion" >
                        <GroupItem itemType="group" colCount={2} colSpan={1}>
                            <Item colSpan={2}>
                                <AppBar position="static" className={classesEncabezado.secundario}>
                                    <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                                        <Typography variant="h6" color="inherit" className={classesEncabezado.title}>

                                            {dataRowEditNew.esNuevoRegistro ?
                                                intl.formatMessage({ id: "CAMP.RESERVATION.TAB" })
                                                :
                                                `${intl.formatMessage({ id: "CAMP.RESERVATION.TAB" })} N° ${dataRowEditNew.IdReserva}`
                                            }
                                        </Typography>
                                    </Toolbar>
                                </AppBar>
                            </Item>

                            <GroupItem itemType="group" colCount={2} colSpan={2}>
                                <div className="row">
                                    <div className="col-md-6">
                                        <fieldset className="scheduler-border" >
                                            <legend className="scheduler-border" > <h5>{intl.formatMessage({ id: "CAMP.RESERVATION.GENERAL" })} </h5></legend>
                                            <Form formData={dataRowEditNew} validationGroup="FormEdicion" >
                                                <GroupItem itemType="group" colCount={2} colSpan={1}>
                                                    <Item
                                                        dataField="Perfil"
                                                        label={{ text: intl.formatMessage({ id: "ACCESS.PROFILE" }) }}
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
                                                                        setPopupVisibleCampamentoPerfil(true);
                                                                    },
                                                                }
                                                            }]
                                                        }}
                                                    />
                                                    <Item
                                                        dataField="conCamas"
                                                        label={{ text: intl.formatMessage({ id: "COMMON.TYPE" }) }}
                                                        editorType="dxSelectBox"
                                                        isRequired={false}
                                                        editorOptions={{
                                                            items: [
                                                                { valor: 0, descripcion: "Todas las camas" },
                                                                { valor: 2, descripcion: "Camas disponibles en el rango" },
                                                                { valor: 1, descripcion: "Camas disponibles en el rango total" },
                                                            ],
                                                            valueExpr: "valor",
                                                            displayExpr: "descripcion",
                                                        }}
                                                    />
                                                    <Item dataField="Servicios" colSpan={2}  >
                                                        <SimpleDropDownBoxGrid
                                                            ColumnDisplay={"Servicio"}
                                                            placeholder={"Select a value.."}
                                                            SelectionMode="multiple"
                                                            dataSource={servicios}
                                                            Columnas={[{ dataField: "Servicio", caption: intl.formatMessage({ id: "CAMP.RESERVATION.SERVICES" }), width: '100%' }]}
                                                            setSeleccionados={setServiciosSeleccionados}
                                                            Seleccionados={servicioSeleccionados}
                                                            pageSize={10}
                                                            pageEnabled={true}
                                                        />
                                                    </Item>


                                                    <Item
                                                        dataField="FechaInicio"
                                                        label={{
                                                            text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.STARTDATE" }),
                                                        }}
                                                        isRequired={true}
                                                        editorType="dxDateBox"
                                                        dataType="datetime"
                                                        editorOptions={{
                                                            inputAttr: { style: "text-transform: uppercase" },
                                                            displayFormat: "dd/MM/yyyy",
                                                        }}
                                                    />

                                                    <Item
                                                        dataField="FechaFin"
                                                        label={{
                                                            text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.ENDDATE" }),
                                                        }}
                                                        isRequired={true}
                                                        editorType="dxDateBox"
                                                        dataType="datetime"
                                                        editorOptions={{
                                                            inputAttr: { style: "text-transform: uppercase" },
                                                            displayFormat: "dd/MM/yyyy",
                                                        }}
                                                    />
                                                </GroupItem>
                                            </Form>
                                        </fieldset>
                                    </div>

                                    <div className="col-md-6">
                                        <fieldset className="scheduler-border" >
                                            <legend className="scheduler-border" >
                                                <h5>{intl.formatMessage({ id: "CAMP.PROFILE.MENU" })} </h5>
                                            </legend>
                                            <Form formData={dataRowEditNew} validationGroup="FormEdicion" >
                                                <GroupItem itemType="group" colCount={2} colSpan={1}>
                                                    <Item
                                                        dataField="IdCampamento"
                                                        label={{ text: intl.formatMessage({ id: "CAMP.RESERVATION.CAMP" }) }}
                                                        editorType="dxSelectBox"
                                                        isRequired={true}
                                                        editorOptions={{
                                                            items: campamentos,
                                                            valueExpr: "IdCampamento",
                                                            displayExpr: "Campamento",
                                                            placeholder: "Seleccione..",
                                                            onValueChanged: (e) => onValueChangedCampamento(e.value),
                                                        }}
                                                    />
                                                    <EmptyItem />
                                                    <Item
                                                        dataField="IdTipoModulo"
                                                        label={{ text: intl.formatMessage({ id: "CAMP.RESERVATION.MODULETYPE" }) }}
                                                        editorType="dxSelectBox"
                                                        isRequired={false}
                                                        editorOptions={{
                                                            items: tipomodulos,
                                                            valueExpr: "IdTipoModulo",
                                                            displayExpr: "TipoModulo",
                                                        }}
                                                    />

                                                    <Item
                                                        dataField="Modulo"
                                                        label={{ text: intl.formatMessage({ id: "CAMP.RESERVATION.MODULE" }) }}
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
                                                                            setPopupVisibleModulo(true);
                                                                        }
                                                                    }
                                                                }
                                                            ]
                                                        }}
                                                    />


                                                    <Item
                                                        dataField="IdTipoHabitacion"
                                                        label={{ text: intl.formatMessage({ id: "CAMP.RESERVATION.ROOMTYPE" }) }}
                                                        editorType="dxSelectBox"
                                                        isRequired={false}
                                                        editorOptions={{
                                                            items: tipoHabitaciones,
                                                            valueExpr: "IdTipoHabitacion",
                                                            displayExpr: "TipoHabitacion",
                                                        }}
                                                    />


                                                    <Item
                                                        dataField="Habitacion"
                                                        label={{ text: intl.formatMessage({ id: "CAMP.RESERVATION.ROOM" }) }}
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
                                                                            setPopupVisibleHabitacion(true);
                                                                        }
                                                                    }
                                                                }
                                                            ]
                                                        }}
                                                    />
                                                </GroupItem>
                                            </Form>
                                        </fieldset>
                                    </div>
                                </div>
                            </GroupItem>
                        </GroupItem>

                        <EmptyItem />


                        <GroupItem name="grupo_pasajeros" colCount={1} colSpan={3} >

                            <Item>
                                <AppBar position="static" className={classesEncabezado.secundario}>
                                    <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                                        <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                                            {intl.formatMessage({ id: "CAMP.RESERVATION.RESERVATIONDETAILS" })}
                                        </Typography>
                                    </Toolbar>
                                </AppBar>
                            </Item>

                        </GroupItem>

                    </Form>

                    <CampamentoPerfilBuscar
                        selectData={selectCampamentoPerfil}
                        showPopup={{ isVisiblePopUp: popupVisibleCampamentoPerfil, setisVisiblePopUp: setPopupVisibleCampamentoPerfil }}
                        cancelarEdicion={() => setPopupVisibleCampamentoPerfil(false)}
                        uniqueId={"campamentoPerfilListPage"}
                    />

                    {/* <div style={cssClsMaxWidth}>
                        <div className="row">
                            <div className="col-12"> */}

                    <PortletBody >
                        <React.Fragment>

                            <DataGridDynamic

                                intl={intl}
                                dataSource={listaParaReserva}
                                staticColumns={columnasEstaticas}
                                dynamicColumns={columnasFecha}
                                isLoadedResults={viewPagination}
                                setIsLoadedResults={setViewPagination}
                                refreshDataSource={buscarReservas}
                                keyExpr={"IdCama"}


                            />
                        </React.Fragment>
                    </PortletBody>
                    {/* </div>
                        </div>
                    </div> */}

                    <ReservaLeyenda />

                </React.Fragment>
            </PortletBody>

            <ReservaDetalleCamaPopup
                isVisiblePopupDetalle={isVisiblePopupDetalle}
                setIsVisiblePopupDetalle={setIsVisiblePopupDetalle}
                datosReservaDetalle={datosReservaDetalle}
            />


            {
                popupVisibleModulo && (
                    <CampamentoModuloBuscar
                        selectData={selectModulo}
                        showPopup={{ isVisiblePopUp: popupVisibleModulo, setisVisiblePopUp: setPopupVisibleModulo }}
                        cancelarEdicion={() => setPopupVisibleModulo(false)}
                        uniqueId="moduloBuscarList"
                        idDivision={perfil.IdDivision}
                        dataRowEditNew={dataRowEditNew}
                    />
                )
            }

            {
                popupVisibleHabitacion && (
                    <CampamentoHabitacionBuscar
                        selectData={selectHabitacion}
                        showPopup={{ isVisiblePopUp: popupVisibleHabitacion, setisVisiblePopUp: setPopupVisibleHabitacion }}
                        cancelarEdicion={() => setPopupVisibleHabitacion(false)}
                        uniqueId="habitacionBuscarList"
                        idDivision={perfil.IdDivision}
                        dataRowEditNew={dataRowEditNew}
                    />
                )
            }

        </Fragment >
    );
};


export default injectIntl(WithLoandingPanel(CamasDisponiblesPage));
