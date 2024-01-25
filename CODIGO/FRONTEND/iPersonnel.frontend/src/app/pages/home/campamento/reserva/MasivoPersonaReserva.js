import React, { Fragment, useEffect, useState } from 'react';
import { useSelector } from "react-redux";
import Form, { Item, GroupItem, EmptyItem } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import { AppBar, Toolbar, Typography } from "@material-ui/core";
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
import { PaginationSetting, getStartAndEndOfMonthByDay } from '../../../../../_metronic/utils/utils';
import {
  esDiaDisponible, crearArregloColumnasHeader, cellRenderReserva,
  cellRenderHabitacion, onCellPreparedDay
} from '../reserva/ReservasUtil';
import ReservaDetalleCamaPopup from '../reserva/ReservaDetalleCamaPopup';
import { DataGrid, Column, Editing, Button as ColumnButton, MasterDetail, Summary, TotalItem } from "devextreme-react/data-grid";

import { DoubleLinePersona as DoubleLineLabel, PersonaCondicionLabel } from "../../../../partials/content/Grid/DoubleLineLabel";


import '../reserva/ReservaEditPage.css';
import SimpleDropDownBoxGrid from '../../../../partials/components/SimpleDropDownBoxGrid/SimpleDropDownBoxGrid';
import DataGridDynamic from '../../../../partials/components/DataGridDynamic/DataGridDynamic';
import PersonaTextAreaPopup from '../../../../partials/components/PersonaTextAreaPopup/PersonaTextAreaPopup';
import CustomTabNav from '../../../../partials/components/Tabs/CustomTabNav';

import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';

import Accordion from 'devextreme-react/accordion';
import CampamentoPersonaAsignarMultiple from '../../../../partials/components/CampamentoPersonaAsignarMultiple';


const MasivoPersonaReserva = (props) => {

  const { intl, setLoading } = props;
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
  const [habilitarFecha, setHabilitarFecha] = useState(true);
  const [isVisiblePopupPersona, setIsVisiblePopupPersona] = useState(false);

  const [strPersonas, setStrPersonas] = useState("");
  const [tipoDocumento, setTipoDocumento] = useState("");
  const flLimpiar = props.procesados;

  const elementos = [
    {
      id: "idCorrectos",
      nombre: intl.formatMessage({ id: "ASSISTANCE.JUSTIFICATION.MASSIVE.CORRECT" }),
      icon: <i class="icon dx-icon-check" />,
      bodyRender: (e) => { return renderGrillaCorrecta() }
    },
    {
      id: "idIncorrecto",
      nombre: intl.formatMessage({ id: "ASSISTANCE.JUSTIFICATION.MASSIVE.WRONG" }),
      icon: <i class="icon dx-icon-close" />,
      bodyRender: (e) => { return renderGrillaIncorrecta() }
    }
  ]

  const elementosProcesados = [
    {
      id: "idCorrectos",
      nombre: intl.formatMessage({ id: "ASSISTANCE.JUSTIFICATION.MASSIVE.PROCESSED" }),
      icon: <i class="icon dx-icon-check" />,
      bodyRender: (e) => { return renderGrillaProcesado() }
    },
    {
      id: "idIncorrecto",
      nombre: intl.formatMessage({ id: "ASSISTANCE.JUSTIFICATION.MASSIVE.NOTPROCESSED" }),
      icon: <i class="icon dx-icon-close" />,
      bodyRender: (e) => { return renderGrillaNoProcesado() }
    }
  ];



  const obtenerCampoActivo = rowData => {
    return rowData.Estado === "S";
  };

  function onCellPrepared(e) {
    if (e.rowType === 'data') {
      if (e.data.Activo === 'N') {
        e.cellElement.style.color = 'red';
      }
    }
  }

  function ColorRojo(e) {
    e.cellElement.style.color = 'red';
  }

  const eliminarRegistro = (evt) => {
    let { IdPersona } = evt.row.data;
    let tmp = props.personasValidadas.filter(x => x.IdPersona !== IdPersona);
    props.setPersonasValidadas(tmp);
    //setPersonasValidadas
  };


  const renderGrillaCorrecta = () => {
    return (
      <DataGrid
        dataSource={props.personasValidadas.filter(x => x.EXISTE === 'S')}
        showBorders={true}
        focusedRowEnabled={true}
        keyExpr="IdPersona"
        onCellPrepared={onCellPrepared}
      // remoteOperations={true}
      >
        <Column dataField="Condicion" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.CONDITION" })} width={"10%"} cellRender={PersonaCondicionLabel} />
        <Column dataField="IdPersona" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"10%"} alignment={"left"} />
        <Column dataField="NombreCompleto" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.FULLNAME" })} alignment={"left"} />
        <Column dataField="Compania" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.COMPANY" })} alignment={"left"} />
        <Column dataField="TipoDocumento" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.TYPE.DOCU" })} width={"10%"} alignment={"left"} />
        <Column dataField="Documento" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.DOCUMENT" })} width={"10%"} alignment={"left"} />
        <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} calculateCellValue={obtenerCampoActivo} width={"8%"} />
        <Column type="buttons" width={95} visible={props.showButtons} >
          <ColumnButton icon="trash" hint={intl.formatMessage({ id: "ACTION.REMOVE", })} onClick={eliminarRegistro} />
        </Column>

        <Summary>
          <TotalItem
          cssClass="classColorPaginador_"
            column="Condicion"
            summaryType="count"
            displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
          />
        </Summary>

      </DataGrid>
    );
  }
  const renderGrillaIncorrecta = () => {

    return (
      <DataGrid
        dataSource={props.personasValidadas.filter(x => x.EXISTE === 'N')}
        showBorders={true}
        focusedRowEnabled={true}
        keyExpr="IdPersona"
        onCellPrepared={ColorRojo}
      // remoteOperations={true}
      >
        <Column dataField="Condicion" caption={intl.formatMessage({ id: "COMMON.TYPE" })} width={"20%"} alignment={"left"} />
        <Column dataField="Documento" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.DOCUMENT" })} width={"40%"} alignment={"left"} />
        <Column dataField="TipoDocumento" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.TYPE.DOCU" })} width={"20%"} alignment={"left"} />

        <Summary>
          <TotalItem
          cssClass="classColorPaginador_"
            column="Condicion"
            summaryType="count"
            displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
          />
        </Summary>
      </DataGrid>
    );

  }


  const renderGrillaProcesado = () => {
    return (
      <DataGrid
        dataSource={props.personasValidadas.filter(x => x.Error === 0)}
        showBorders={true}
        focusedRowEnabled={true}
        keyExpr="IdPersona"
        onCellPrepared={onCellPrepared}
        className="tablaScrollHorizontal"
        allowColumnResizing={true}
        columnAutoWidth={true}
        repaintChangesOnly={true}
        scrolling={{ showScrollbar: 'always' }}
      // remoteOperations={true}
      >
        <Column dataField="IdPersona" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"100px"} alignment={"left"} />
        <Column dataField="NombreCompleto" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.FULLNAME" })} width="200px" alignment={"left"} />
        <Column dataField="Compania" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.COMPANY" })} width="150px" alignment={"left"} />
        <Column dataField="TipoDocumento" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.TYPE.DOCU" })} alignment={"left"} width={"100px"} />
        <Column dataField="Documento" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.DOCUMENT" })} alignment={"left"} width={"100px"} />
        <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} calculateCellValue={obtenerCampoActivo} width={"50px"} />
        <Column dataField="Campamento" caption={intl.formatMessage({ id: "CAMP.RESERVATION.CAMP" })} alignment="left" width="100px" />
        <Column dataField="Modulo" caption={intl.formatMessage({ id: "CAMP.RESERVATION.MODULE" })} alignment="left" width="100px" />
        <Column dataField="Habitacion" caption={intl.formatMessage({ id: "CAMP.RESERVATION.ROOM" })} alignment="left" width="100px" />
        <Column dataField="Cama" caption={intl.formatMessage({ id: "CAMP.RESERVATION.BED" })} alignment="left" width="100px" />
        <Column dataField="Mensaje" caption={"Mensaje"} width={"250px"} alignment={"left"} />
        <Summary>
          <TotalItem
          cssClass="classColorPaginador_"
            column="IdPersona"
            summaryType="count"
            displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
          />
        </Summary>
      </DataGrid>
    );
  }

  const renderGrillaNoProcesado = () => {

    return (
      <DataGrid
        dataSource={props.personasValidadas.filter(x => x.Error === 1)}
        showBorders={true}
        focusedRowEnabled={true}
        keyExpr="IdPersona"
        onCellPrepared={onCellPrepared}
      // remoteOperations={true}
      >
        <Column dataField="IdPersona" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"10%"} alignment={"left"} />
        <Column dataField="NombreCompleto" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.FULLNAME" })} alignment={"left"} />
        <Column dataField="Compania" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.COMPANY" })} alignment={"left"} />
        <Column dataField="TipoDocumento" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.TYPE.DOCU" })} alignment={"left"} width={"8%"} />
        <Column dataField="Documento" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.DOCUMENT" })} alignment={"left"} width={"10%"} />
        <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} calculateCellValue={obtenerCampoActivo} width={"8%"} />
        <Column dataField="Mensaje" caption={"Mensaje"} width={"30%"} alignment={"left"} />
        <Summary>
          <TotalItem
          cssClass="classColorPaginador_"
            column="IdPersona"
            summaryType="count"
            displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
          />
        </Summary>
      </DataGrid>
    );

  }



  //----------------------------------------------------------------------------
  const buscarReservas = async (skip, take) => {

    let datosReserva = await props.consultarDisponibilidadCamas(servicioSeleccionados, skip, take);//Pagina 1 de [0 a 20]

    if (datosReserva.IdError == 0) {
      setListaParaReserva(datosReserva.resultados)

      //Creando columnas dinamicas:
      let header_json = crearArregloColumnasHeader((datosReserva.headerColumns || []), intl, { cellRender: cellRenderReserva });

      if (header_json.length > 0) {
        setColumnasFechas(header_json);
      }

      setTimeout(() => {
        setViewPagination(true);
      }, 500);


    } else {
      setViewPagination(false);
      setColumnasFechas([]);
    }

  }

  const onValueChangedCampamento = async (valor) => {
    setLoading(true);
    let IdCliente = perfil.IdCliente;
    let IdDivision = perfil.IdDivision;
    let IdPerfil = props.dataRowEditNew.IdPerfil;
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
  }, []);




  async function cargarCombos() {
    setLoading(true);
    let { FechaInicio, FechaFin } = getStartAndEndOfMonthByDay(new Date(), 1);
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
    props.setDataRowEditNew({ ...props.dataRowEditNew, IdCampamento, FechaInicio, FechaFin, });
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
    props.setDataRowEditNew({ ...props.dataRowEditNew, IdCampamento, IdPerfil, Perfil });
    setPopupVisibleCampamentoPerfil(false);
  }



  // const columnasEstaticas = [
  //     {
  //         dataField: "Columnas", caption: intl.formatMessage({ id: "CAMP.RESERVATION.BEDINFORMATION" }),
  //         items: [
  //             { dataField: "TipoModulo", caption: "Código", width: '90' },
  //             { dataField: "Modulo", caption: "Nombres", width: '150' },
  //             { dataField: "TipoHabitacion", caption: intl.formatMessage({ id: "CAMP.RESERVATION.ROOMTYPE.ABR" }), width: '90' },
  //         ]
  //     }
  // ];

  const onValueChangedTipo = (valor) => {

    setHabilitarFecha(valor === 0);
  }

  const obtenerNumeroDocumento = (data) => {

    if (data !== '') {
      props.validarDatosPersona(data);
      let personas = data.map(persona => persona.Documento).join(',');
      props.setDataRowEditNew({
        ...props.dataRowEditNew,
        Personas: personas
      });
      setStrPersonas(personas);
    } else {
      props.setDataRowEditNew({ ...props.dataRowEditNew, Personas: '' });
    }
  }

  const grabar = (e) => {
    let result = e.validationGroup.validate();
    if (!result.isValid) {
      return;
    }

    if (strPersonas.length > 0) {
      //Se valida el registro de personas:
      let lista = props.personasValidadas.filter(x => x.EXISTE === 'S').map(x => (x.IdPersona));
      if (lista.length > 0) {
        props.procesarPersonas(lista.join('|'));
      }
      //Validar rango de fechas.
      //Asignar el tipo de regimen
    } else {
      handleInfoMessages(intl.formatMessage({ id: "CAMP.RESERVATION.MSG.ADD.PEOPLES" }));
    }
  }


  return (
    <Fragment>
      <PortletHeader
        title={""}
        toolbar={
          <PortletHeaderToolbar>
            <Button
              icon="fa fa-save"
              type="default"
              hint={intl.formatMessage({ id: "ACTION.RECORD" })}
              onClick={grabar}
              useSubmitBehavior={true}
              validationGroup="FormEdicion"
              disabled={props.procesados}
            //visible={props.modoEdicion}

            />
            &nbsp;
            <Button
              icon="fa fa-times-circle"
              type="normal"
              hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
              onClick={() => props.setModoEdicion(false)}
            />
          </PortletHeaderToolbar>
        }
      />

      <PortletBody >
        <React.Fragment>
          <Form formData={props.dataRowEditNew} validationGroup="FormEdicion" >
            <GroupItem itemType="group" colCount={3} colSpan={1}>
              <Item colSpan={3}>
                <AppBar position="static" className={classesEncabezado.secundario}>
                  <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                    <Typography variant="h6" color="inherit" className={classesEncabezado.title}>

                      {props.dataRowEditNew.esNuevoRegistro ?
                        intl.formatMessage({ id: "CAMP.RESERVATION.TAB" })
                        :
                        `${intl.formatMessage({ id: "CAMP.RESERVATION.TAB" })} N° ${props.dataRowEditNew.IdReserva}`
                      }
                    </Typography>
                  </Toolbar>
                </AppBar>
              </Item>

              <Item
                dataField="Perfil"
                isRequired={true}
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
                dataField="IdCampamento"
                label={{ text: intl.formatMessage({ id: "CAMP.RESERVATION.CAMP" }) }}
                editorType="dxSelectBox"
                isRequired={true}
                editorOptions={{
                  //readOnly: !props.modoEdicion,
                  items: campamentos,
                  valueExpr: "IdCampamento",
                  displayExpr: "Campamento",
                  //disabled: !props.dataRowEditNew.esNuevoRegistro,
                  placeholder: "Seleccione..",
                  onValueChanged: (e) => onValueChangedCampamento(e.value),
                }}
              />


              <Item
                dataField="Personas"
                isRequired={true}
                label={{ text: intl.formatMessage({ id: "CONFIG.MENU.CAMPAMENTOS.PERSONAS" }) }}
                colSpan={1}
                editorOptions={{
                  readOnly: true,
                  hoverStateEnabled: false,
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  showClearButton: true,
                  buttons: [{
                    name: 'search',
                    location: 'after',
                    useSubmitBehavior: true,
                    maxLength: 20,
                    options: {
                      stylingMode: 'text',
                      icon: 'search',
                      disabled: false,
                      onClick: () => {
                        // console.log("popup personas");
                        setIsVisiblePopupPersona(true);
                      },
                    }
                  }]
                }}
              />



              <Item
                dataField="Tipo"
                label={{ text: intl.formatMessage({ id: "COMMON.TYPE" }) }}
                editorType="dxSelectBox"
                isRequired={false}
                editorOptions={{
                  //readOnly: !props.modoEdicion,
                  items: [{ valor: 0, descripcion: "Rango de Fechas" },
                  // { valor: 1, descripcion: "SI" },
                  { valor: 2, descripcion: "Por régimen del trabajador" },
                  ],
                  valueExpr: "valor",
                  displayExpr: "descripcion",
                  onValueChanged: (e) => onValueChangedTipo(e.value),
                }}
              />


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
                isRequired={habilitarFecha}
                visible={habilitarFecha}
                editorType="dxDateBox"
                dataType="datetime"
                editorOptions={{
                  inputAttr: { style: "text-transform: uppercase" },
                  displayFormat: "dd/MM/yyyy",

                }}
              />
            </GroupItem>

            <GroupItem name="grupo_pasajeros" colCount={1} colSpan={3} >

              <Item>
                <AppBar position="static" className={classesEncabezado.secundario}>
                  <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                    <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                      {(flLimpiar) ?
                        intl.formatMessage({ id: "CAMP.RESERVATION.MSG.PROCCES" })
                        :
                        intl.formatMessage({ id: "CAMP.RESERVATION.MSG.VALID" })
                      }
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

          <div className="row">
            <div className="col-12">
              <CustomTabNav
                elementos={(flLimpiar ? elementosProcesados : elementos)}
                tabActivo={0}
                validateRequerid={false}
                evaluateRequerid={false}
              />
            </div>
          </div>

        </React.Fragment>
      </PortletBody>

      <ReservaDetalleCamaPopup
        isVisiblePopupDetalle={isVisiblePopupDetalle}
        setIsVisiblePopupDetalle={setIsVisiblePopupDetalle}
        datosReservaDetalle={datosReservaDetalle}
      />

      {/* <PersonaTextAreaPopup
        isVisiblePopupDetalle={isVisiblePopupPersona}
        setIsVisiblePopupDetalle={setIsVisiblePopupPersona}
        obtenerNumeroDocumento={obtenerNumeroDocumento}
      // datosReservaDetalle={datosReservaDetalle}
      /> */}

      <CampamentoPersonaAsignarMultiple
        showPopup={{ isVisiblePopUp: isVisiblePopupPersona, setisVisiblePopUp: setIsVisiblePopupPersona }}
        cancelar={() => setIsVisiblePopupPersona(false)}
        agregar={obtenerNumeroDocumento}
        selectionMode="multiple"
        uniqueId="CampamentoPersonaAsignarMultiple"
      />


    </Fragment >
  );
};


export default injectIntl(WithLoandingPanel(MasivoPersonaReserva));
