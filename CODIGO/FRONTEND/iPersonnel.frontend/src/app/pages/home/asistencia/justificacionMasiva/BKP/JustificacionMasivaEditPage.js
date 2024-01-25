import React, { Fragment, useEffect, useState } from 'react';
import { useSelector } from "react-redux";
import Form, { Item, GroupItem } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import { AppBar } from "@material-ui/core";
import { Toolbar } from "@material-ui/core";
import { Typography } from "@material-ui/core";
import { useStylesEncabezado } from "../../../../store/config/Styles";
import { injectIntl } from "react-intl";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";

import {
  handleErrorMessages,
  handleInfoMessages
} from "../../../../store/ducks/notify-messages";

//Combos
import { obtenerTodos as listarJustificaciones } from "../../../../api/asistencia/justificacion.api";
import AdministracionCompaniaBuscar from "../../../../partials/components/AdministracionCompaniaBuscar";
import AsistenciaJustificacionBuscar from "../../../../partials/components/AsistenciaJustificacionBuscar";
import AsistenciaBuscarPersonaFilter from "../../../../partials/components/AsistenciaBuscarPersonaFilter";


//Utils
import { DataGrid, Column, Editing, Button as ColumnButton, Summary, TotalItem } from "devextreme-react/data-grid";
import { PersonaCondicionLabel } from "../../../../partials/content/Grid/DoubleLineLabel";
import CustomTabNav from '../../../../partials/components/Tabs/CustomTabNav';
// import { isNotEmpty } from '../../../../../_metronic';
import FileUploader from "../../../../partials/content/FileUploader";
import FileViewer from "../../../../partials/content/FileViewer";
import { downloadFile } from "../../../../api/helpers/fileBase64.api";
import { listarEstado, isNotEmpty } from "../../../../../_metronic";
 
import { serviceCompania } from "../../../../api/administracion/compania.api"; 

const JustificacionMasivaEditPage = (props) => {

  const { intl, setLoading, idModulo, idMenu, idAplicacion } = props;
  const classesEncabezado = useStylesEncabezado();

  const { IdCliente } = useSelector(state => state.perfil.perfilActual);

  const [fileBase64, setFileBase64] = useState();
  const [isVisiblePopUpFile, setisVisiblePopUpFile] = useState(false);

  const [habilitarFecha] = useState(true);
  const [popupVisibleCompania, setPopupVisibleCompania] = useState(false);
  const [isVisiblePopUpJustificacion, setisVisiblePopUpJustificacion] = useState(false);

  const [strPersonas, setStrPersonas] = useState("");
  const flLimpiar = props.procesados;
  const [isVisiblePopUpPersonas, setisVisiblePopUpPersonas] = useState(false);

  const [estado, setEstado] = useState([]);
  const [isCHE, setIsCHE] = useState(true);

  const [, setItemRequiereObservacion] = useState(true);
  const [itemAplicaPorDia, setItemAplicaPorDia] = useState();
  const [itemAplicaPorHora, setItemAplicaPorHora] = useState(false);

  const [, setIsDayComplete] = useState(true);

  const [companiaData, setCompaniaData] = useState([]);
  const [varIdCompania, setVarIdCompania] = useState("");
  const [varCompania, setVarCompania] = useState("");
  

  const [filtroLocal, setFiltroLocal] = useState({
    IdCliente: "",
    IdCompania: "",
  });

  const textEditing = {
    confirmDeleteMessage: '',
    editRow: intl.formatMessage({ id: "ACTION.EDIT" }),
    deleteRow: intl.formatMessage({ id: "ACTION.REMOVE" }),
  };

  async function cargarCombos() { 
    let estado = listarEstado();
    setEstado(estado);

    listarCompanias();

  }

  const elementos = [
    {
      id: "idCorrectos",
      nombre: intl.formatMessage({ id: "ASSISTANCE.JUSTIFICATION.MASSIVE.CORRECT" }),
      icon: <i class="icon dx-icon-check" />,
      backgroundColor: "#74ce92",
      bodyRender: (e) => { return renderGrillaCorrecta() }
    },
    {
      id: "idIncorrecto",
      nombre: intl.formatMessage({ id: "ASSISTANCE.JUSTIFICATION.MASSIVE.WRONG" }),
      icon: <i class="icon dx-icon-close" />,
      backgroundColor: "#cc7a7a",
      bodyRender: (e) => { return renderGrillaIncorrecta() }
    }
  ]

  const elementosProcesados = [
    {
      id: "idCorrectos",
      nombre: intl.formatMessage({ id: "ASSISTANCE.JUSTIFICATION.MASSIVE.PROCESSED" }),
      icon: <i class="icon dx-icon-check" />,
      backgroundColor: "#74ce92",
      bodyRender: (e) => { return renderGrillaProcesado() }
    },
    {
      id: "idIncorrecto",
      nombre: intl.formatMessage({ id: "ASSISTANCE.JUSTIFICATION.MASSIVE.NOTPROCESSED" }),
      icon: <i class="icon dx-icon-close" />,
      backgroundColor: "#cc7a7a",

      bodyRender: (e) => { return renderGrillaNoProcesado() }
    }
  ];

  const elementosEditar = [
    {
      id: "idGriaEditarPersonasMasivo",
      nombre: intl.formatMessage({ id: "ASSISTANCE.JUSTIFICATION.MASSIVE.PROCESSED" }),
      icon: <i class="icon dx-icon-check" />,
      backgroundColor: "#74ce92",
      bodyRender: (e) => { return renderGridRegistroMasivoEdit() }
    }
  ];

  const obtenerCampoActivo = rowData => {
    return rowData.Activo === "S";
  };

  const obtenerCampoEstado = rowData => {
    return rowData.Estado === "S";
  };

  function onCellPrepared(e) {
    if (e.rowType === 'data') {

      if (e.data.Activo === 'N') {
        e.cellElement.style.color = 'red';
      }

      if (e.data.Condicion === 'CESADO') {
        e.cellElement.style.color = 'orange';
      }
    }
  }

  function ColorRojo(e) {
    if (e.rowType === 'data') {
      e.cellElement.style.color = 'red';
    }
  }

  const eliminarRegistro = (evt) => {
    let { IdPersona } = evt.row.data;
    let tmp = props.personasValidadas.filter(x => x.IdPersona !== IdPersona);
    props.setPersonasValidadas(tmp);
  };

  const eliminarRegistroFromEditPage = evt => {
    evt.cancel = true;
    props.eliminarRegistroFromEditPage(evt.data);
  };


  const renderGrillaCorrecta = () => {
    return (
      <DataGrid
        dataSource={props.personasValidadas.filter(x => x.EXISTE === 'S')}
        showBorders={true}
        focusedRowEnabled={true}
        keyExpr="IdPersona"
        onCellPrepared={onCellPrepared}
      >
        <Column dataField="Condicion" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.CONDITION" })} width={"10%"} alignment={"center"} cellRender={PersonaCondicionLabel} />
        <Column dataField="IdPersona" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"10%"} alignment={"left"} />
        <Column dataField="NombreCompleto" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.FULLNAME" })} width={"40%"} alignment={"left"} />
        <Column dataField="TipoDocumento" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.TYPE.DOCU" })} width={"10%"} alignment={"left"} />
        <Column dataField="Documento" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.DOCUMENT" })} width={"10%"} alignment={"left"} />
        <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.STATE" })} calculateCellValue={obtenerCampoActivo} width={"8%"} />
        <Column type="buttons" width={95} visible={props.showButtons} >
          <ColumnButton icon="trash" hint={intl.formatMessage({ id: "ACTION.REMOVE", })} onClick={eliminarRegistro} />
        </Column>
        <Summary>
          <TotalItem
          cssClass="classColorPaginador_"
            column="Condicion"
            alignment="left"
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
      >
        <Column dataField="TipoDocumento" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.TYPE.DOCU" })} width={"10%"} alignment={"left"} />
        <Column dataField="Documento" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.DOCUMENT" })} width={"15%"} alignment={"left"} />
        <Column dataField="NombreCompleto" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.FULLNAME" })} alignment={"left"} />
        <Column dataField="Mensaje" caption={intl.formatMessage({ id: "ASSISTANCE.JUSTIFICATION.MASSIVE.MESSAGE" })} width={"30%"} alignment={"left"} />
        <Summary>
          <TotalItem
          cssClass="classColorPaginador_"
            column="TipoDocumento"
            alignment="left"
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
      >
        <Column dataField="IdPersona" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"10%"} alignment={"left"} />
        <Column dataField="NombreCompleto" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.FULLNAME" })} width={"30%"} alignment={"left"} />
        <Column dataField="TipoDocumento" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.TYPE.DOCU" })} width={"10%"} alignment={"left"} />
        <Column dataField="Documento" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.DOCUMENT" })} width={"10%"} alignment={"left"} />
        <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.STATE" })} calculateCellValue={obtenerCampoEstado} width={"8%"} />
        <Column dataField="Mensaje" caption={intl.formatMessage({ id: "ASSISTANCE.JUSTIFICATION.MASSIVE.MESSAGE" })} width={"30%"} alignment={"left"} />
        <Summary>
          <TotalItem
          cssClass="classColorPaginador_"
            column="IdPersona"
            alignment="left"
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
        onCellPrepared={ColorRojo}
      >
        <Column dataField="IdPersona" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"10%"} alignment={"left"} />
        <Column dataField="NombreCompleto" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.FULLNAME" })} width={"30%"} alignment={"left"} />
        <Column dataField="TipoDocumento" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.TYPE.DOCU" })} width={"10%"} alignment={"left"} />
        <Column dataField="Documento" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.DOCUMENT" })} width={"10%"} alignment={"left"} />
        <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.STATE" })} calculateCellValue={obtenerCampoEstado} width={"8%"} />
        <Column dataField="Mensaje" caption={intl.formatMessage({ id: "ASSISTANCE.JUSTIFICATION.MASSIVE.MESSAGE" })} width={"30%"} alignment={"left"} />
        <Summary>
          <TotalItem
          cssClass="classColorPaginador_"
            column="IdPersona"
            alignment="left"
            summaryType="count"
            displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
          />
        </Summary>
      </DataGrid>
    );

  }

  const renderGridRegistroMasivoEdit = () => {
    return (
      <DataGrid
        dataSource={props.justificacionMasivaPersonas}
        showBorders={true}
        focusedRowEnabled={true}
        keyExpr="IdPersona"
        onCellPrepared={onCellPrepared}
        onRowRemoving={eliminarRegistroFromEditPage}
      >
        <Editing
          mode="row"
          useIcons={true}
          allowUpdating={false}
          allowDeleting={true}
          texts={textEditing}
        />
        <Column dataField="IdPersona" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"10%"} alignment={"left"} />
        <Column dataField="NombreCompleto" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.FULLNAME" })} width={"30%"} alignment={"left"} />
        <Column dataField="TipoDocumento" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.TYPE.DOCU" })} width={"10%"} alignment={"left"} />
        <Column dataField="Documento" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.DOCUMENT" })} width={"10%"} alignment={"left"} />
        <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.STATE" })} calculateCellValue={obtenerCampoActivo} width={"8%"} />
        <Column dataField="Status" caption={intl.formatMessage({ id: "ASSISTANCE.JUSTIFICATION.MASSIVE.STATUS" })} width={"30%"} alignment={"left"} />
        <Summary>
          <TotalItem
          cssClass="classColorPaginador_"
            column="IdPersona"
            alignment="left"
            summaryType="count"
            displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
          />
        </Summary>
      </DataGrid>
    );
  }

  //----------------------------------------------------------------------------
 
  useEffect(() => {
    if (!isNotEmpty(varIdCompania)) { 
      if (companiaData.length > 0) {
        const { IdCompania } = companiaData[0];
        var company = companiaData.filter(x => x.IdCompania === IdCompania);
        getCompanySeleccionada(IdCompania, company); 
      }
    }
  }, [companiaData]);
  
  useEffect(() => { 
    cargarCombos(); 
  }, []);

  

  async function descargarArchivo() {

    if (!isNotEmpty(fileBase64)) {
      let params = {
        FileName: props.dataRowEditNew.NombreArchivo,
        FileType: "data:application/pdf;base64,",
        path: "",
        idModulo,
        idAplicacion,
        idMenu
      };
      setLoading(true);
      await downloadFile(params)
        .then(data => {
          setFileBase64(data.fileBase64);
          document.getElementById("fileOpenWindow").click()
        })
        .catch((err) => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
        }).finally(() => setLoading(false));

    } else {
      document.getElementById("fileOpenWindow").click()
    }
  }


  const agregarPersona = (personas) => {

    let arrayDocumentos = [];
    personas.map(x => {
      arrayDocumentos.push(x.Documento);
    })

    let strPersonas = arrayDocumentos.join(',');
    setStrPersonas(strPersonas);
    props.setDataRowEditNew({ ...props.dataRowEditNew, Personas: strPersonas });
    props.validarDatosPersona(personas);
  }


  const selectCompania = async (dataPopup) => {

    const { IdCompania, Compania } = dataPopup[0];
    props.dataRowEditNew.IdJustificacion = '';
    props.dataRowEditNew.Justificacion = '';
    props.setDataRowEditNew({ ...props.dataRowEditNew, IdCompania, Compania });
    setFiltroLocal({ IdCompania });

    let tmp_justificaciones = await listarJustificaciones({
      IdCliente: IdCliente,
      IdCompania: IdCompania
    });
    props.setJustificaciones(tmp_justificaciones);

    setPopupVisibleCompania(false);
  }

  const agregarJustificacion = (justificaciones) => {
    const { IdJustificacion, Justificacion, AplicaPorDia, AplicaPorHora, RequiereObservacion } = justificaciones[0];
    //let seleccionado = justificaciones[0];

    props.dataRowEditNew.IdJustificacion = IdJustificacion;
    props.dataRowEditNew.Justificacion = Justificacion;
    setItemRequiereObservacion(RequiereObservacion);
    setItemAplicaPorDia(AplicaPorDia);
    setItemAplicaPorHora(AplicaPorHora);
  };


  const grabar = (e) => {
    let result = e.validationGroup.validate();

    if (!result.isValid) {
      return;
    }

    document.getElementById("btnUploadFile").click();

    if (props.dataRowEditNew.esNuevoRegistro) {

      if (strPersonas.length > 0) {
        //Se valida el registro de personas:
        let lista = props.personasValidadas.filter(x => x.EXISTE === 'S').map(x => (x.IdPersona));
        if (lista.length > 0) {
          props.procesarPersonas(lista.join('|'));
        } else {
          handleInfoMessages(intl.formatMessage({ id: "ASSISTANCE.JUSTIFICATION.MASSIVE.MESSAGE.NORECORDS" }));
        }
      } else {
        handleInfoMessages(intl.formatMessage({ id: "ASSISTANCE.JUSTIFICATION.MASSIVE.MESSAGE.NOPERSONS" }));
      }
    }
    else {
      var lista = props.dataRowEditNew.Personas.split(',');
      props.actualizarJustificacionMasiva(lista.join('|'));
    }
  }

  const onFileUploader = (data) => {
    const { file, fileName, fileDate } = data;
    props.dataRowEditNew.FileBase64 = file;
    props.dataRowEditNew.NombreArchivo = fileName;
    props.dataRowEditNew.FechaArchivo = fileDate;
  }


  function onValueChangedDiaCompleto(value) {
    if (value === "S") {
      setIsDayComplete(true)

    } else {
      setIsDayComplete(false)

    }
  }

  
  async function listarCompanias() { 
    let data = await serviceCompania.obtenerTodosConfiguracion({
      IdCliente: IdCliente,
      IdModulo: idModulo,
      IdAplicacion: idAplicacion,
      IdConfiguracion: "ID_COMPANIA"
    }
    ).catch(err => { handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err) });
    setCompaniaData(data); 
  }
  
  async function getCompanySeleccionada(idCompania, company) {
    if (isNotEmpty(idCompania)) 
      setVarIdCompania(idCompania);   
  }


  return (
    <Fragment>

      <PortletHeader
        title={props.titulo}
        toolbar={
          <PortletHeaderToolbar>
            <Button
              icon="exportpdf"
              type="default"
              hint={intl.formatMessage({ id: "ACTION.DOWNLOAD" })}
              onClick={descargarArchivo}
              visible={isNotEmpty(props.dataRowEditNew.NombreArchivo) && !props.dataRowEditNew.esNuevoRegistro ? true : false}
            />
            &nbsp;
            <Button
              icon={props.dataRowEditNew.esNuevoRegistro ? "preferences" : "fa fa-save"}
              type="default"
              hint={props.dataRowEditNew.esNuevoRegistro ? intl.formatMessage({ id: "ACTION.PROCESS" }) : intl.formatMessage({ id: "ACTION.RECORD" })}
              onClick={grabar}
              useSubmitBehavior={true}
              validationGroup="FormEdicion"
              disabled={props.procesados}
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


      <PortletBody >
        <React.Fragment>
          <Form formData={props.dataRowEditNew} validationGroup="FormEdicion" >


            <GroupItem itemType="group" colCount={3} colSpan={2}>

              <Item colSpan={3}>
                <AppBar position="static" className={classesEncabezado.secundario}>
                  <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                    <Typography variant="h6" color="inherit" className={classesEncabezado.title}>{intl.formatMessage({ id: "COMMON.DATA" })}  </Typography>
                  </Toolbar>
                </AppBar>
              </Item>

              <Item
                dataField="IdCompania"
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.COMPANY.COMPANY" }) }}
                editorType="dxSelectBox"
                isRequired={true}
                editorOptions={{
                  items: companiaData,
                  valueExpr: "IdCompania",
                  displayExpr: "Compania",
                  //showClearButton: true,
                  searchEnabled: true,
                  value: varIdCompania,
                  onValueChanged: (e) => {
                    if (isNotEmpty(e.value)) {
                      var company = companiaData.filter(x => x.IdCompania === e.value);
                      getCompanySeleccionada(e.value, company);  
                   }

                  },
                }}
              />
 

              <Item
                dataField="Justificacion"
                isRequired={true}
                label={{ text: intl.formatMessage({ id: "ASSISTANCE.PERSON.JUSTIFICATION" }), }}
                editorOptions={{
                  //readOnly: (modoEdicion ? (dataRowEditNew.esNuevoRegistro ? false : true) : false),
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
                        onClick: (evt) => {
                          // setFiltroLocal({ IdCliente: perfil.IdCliente, IdPersona: varIdPersona });
                          setisVisiblePopUpJustificacion(true);
                        },
                      },
                    },
                  ],
                }}
              />


              {/* <Item
                                  dataField="IdJustificacion"
                                  label={{ text: intl.formatMessage({ id: "ASSISTANCE.JUSTIFICACION" }) }}
                                  editorType="dxSelectBox"
                                  isRequired={true}
                                  editorOptions={{
                                  items: props.justificaciones,
                                  valueExpr: "IdJustificacion",
                                  displayExpr: "Justificacion",
                                  placeholder: "Seleccione..",
                                  }}
                                  /> */}

              <Item
                dataField="Personas"
                isRequired={true}
                label={{ text: intl.formatMessage({ id: "ASSISTANCE.JUSTIFICATION.MASSIVE.PERSONS" }) }}
                editorOptions={{ 
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
                      disabled: isNotEmpty(props.dataRowEditNew.Compania) && props.dataRowEditNew.esNuevoRegistro ? false : true,
                      onClick: () => {
                        setisVisiblePopUpPersonas(true);
                      },
                    }
                  }]
                }}
              />

              <Item
                dataField="FechaInicio"
                label={{ text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.STARTDATE" }), }}
                isRequired={true}
                editorType="dxDateBox"
                dataType="datetime"
                editorOptions={{
                  inputAttr: { style: "text-transform: uppercase" },
                  displayFormat: "dd/MM/yyyy",
                  readOnly: !props.dataRowEditNew.esNuevoRegistro
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
                  readOnly: !props.dataRowEditNew.esNuevoRegistro
                }}
              />

              <Item
                dataField="DiaCompleto"
                label={{ text: intl.formatMessage({ id: "ASSISTANCE.PERSON.JUSTIFICATION.DAY" }) }}
                editorType="dxSelectBox"
                editorOptions={{
                  items: estado,
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                  onValueChanged: (e) => onValueChangedDiaCompleto(e.value),
                  value: props.dataRowEditNew.esNuevoRegistro ? itemAplicaPorDia : props.dataRowEditNew.DiaCompleto,
                  //readOnly: true
                }}
              />

              <Item
                dataField="FechaHoraInicio"
                label={{ text: intl.formatMessage({ id: "ACCESS.PERSON.GRUPO.STARTTIME" }) }}
                isRequired={itemAplicaPorHora === 'S'}
                editorType="dxDateBox"
                editorOptions={{
                  showClearButton: true,
                  useMaskBehavior: true,
                  maxLength: 5,
                  displayFormat: "HH:mm",
                  type: "time",
                  // min: horaEntradaMin,
                  // max: horaEntradaMax,
                  //  value: props.dataRowEditNew.DiaCompleto === 'N' ? personaHorario.HoraEntrada : "00:00",
                  disabled: props.dataRowEditNew.DiaCompleto === 'N' ? false : true
                }}
              />

              <Item
                dataField="FechaHoraFin"
                label={{ text: intl.formatMessage({ id: "CASINO.DINNINGROOM.SERVICE.ENDTIME" }) }}
                isRequired={itemAplicaPorHora === 'S'}
                editorType="dxDateBox"
                editorOptions={{
                  showClearButton: true,
                  useMaskBehavior: true,
                  maxLength: 5,
                  displayFormat: "HH:mm",
                  type: "time",
                  // min: horaSalidaMin,
                  // max: horaSalidaMax,
                  // value: dataRowEditNew.DiaCompleto === 'N' ? personaHorario.HoraEntrada : "00:00",
                  disabled: props.dataRowEditNew.DiaCompleto === 'N' ? false : true
                }}
              />

              <Item
                dataField="CompensarHorasExtras"
                label={{ text: intl.formatMessage({ id: "ASSISTANCE.PERSON.JUSTIFICATION.CHE" }) }}
                editorType="dxSelectBox"
                isRequired={true}
                editorOptions={{
                  items: estado,
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                  onValueChanged: (e) => { e.value === 'S' ? setIsCHE(false) : setIsCHE(true) }
                }}
              />

              <Item
                dataField="CompensarHEPorPagar"
                label={{ text: intl.formatMessage({ id: "ASSISTANCE.PERSON.JUSTIFICATION.HE" }) }}
                editorType="dxSelectBox"
                isRequired={true}
                editorOptions={{
                  items: estado,
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                  readOnly: isCHE
                }}
              />

            </GroupItem>

            <GroupItem itemType="group" colCount={3} >

              <Item dataField="Observacion"
                label={{ text: intl.formatMessage({ id: "ACCESS.PERSON.EXONERACION.OBSERVATION" }) }}
                colSpan={3}
                editorType="dxTextArea"
                editorOptions={{
                  maxLength: 500,
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  height: 60
                }}
              >
              </Item>

              <GroupItem itemType="group" colCount={2} colSpan={2}>
                <Item colSpan={2}>
                  <AppBar position="static" className={classesEncabezado.secundario}>
                    <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                      <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                        {intl.formatMessage({ id: "COMMON.FILE" })}
                      </Typography>
                    </Toolbar>
                  </AppBar>
                </Item>
                <Item colSpan={2}>
                  {/* Componente-> Cargar un documento .PDF*/}
                  <FileUploader
                    agregarFotoBd={(data) => onFileUploader(data)}
                    fileNameX={props.dataRowEditNew.NombreArchivo}
                    fileDateX={props.dataRowEditNew.FechaArchivo}
                  />
                </Item>

              </GroupItem>

            </GroupItem>



            {props.dataRowEditNew.esNuevoRegistro && (
              <GroupItem name="grupo_pasajeros" colCount={1} colSpan={3} >

                <Item>
                  <AppBar position="static" className={classesEncabezado.secundario}>
                    <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                      <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                        {(flLimpiar) ?
                          intl.formatMessage({ id: "ASSISTANCE.JUSTIFICATION.MASSIVE.TITLE.PROCESSED" })  // "DETALLE DE PERSONAS JUSTIFICADAS PROCESADAS"
                          :
                          intl.formatMessage({ id: "ASSISTANCE.JUSTIFICATION.MASSIVE.TITLE.VALIDATED" })  // "DETALLE DE PERSONAS VALIDADAS"
                        }
                      </Typography>
                    </Toolbar>
                  </AppBar>
                </Item>

              </GroupItem>
            )}

          </Form>

          {props.dataRowEditNew.esNuevoRegistro && (
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
          )}

          {!props.dataRowEditNew.esNuevoRegistro && (
            <div className="row">
              <div className="col-12">
                <CustomTabNav
                  elementos={elementosEditar}
                  tabActivo={0}
                  validateRequerid={false}
                  evaluateRequerid={false}
                />
              </div>
            </div>

          )}

        </React.Fragment>

      </PortletBody>


      {/*POPUP DE COMPANIAS*/}
      {/* <AdministracionCompaniaBuscar
        selectData={selectCompania}
        showPopup={{ isVisiblePopUp: popupVisibleCompania, setisVisiblePopUp: setPopupVisibleCompania }}
        cancelarEdicion={() => setPopupVisibleCompania(false)}
        uniqueId={"administracionCompaniaBuscar"}
        isControlarAsistencia={"S"}
      /> */}

      {/*POPUP JUSTIFICACIÓN*/}
      {isVisiblePopUpJustificacion && (
        <AsistenciaJustificacionBuscar
          selectData={agregarJustificacion}
          showPopup={{ isVisiblePopUp: isVisiblePopUpJustificacion, setisVisiblePopUp: setisVisiblePopUpJustificacion }}
          cancelar={() => setisVisiblePopUpJustificacion(false)}
          filtro={filtroLocal}
          varIdCompania={varIdCompania}
        />
      )}

      {/* POPUP-> buscar persona */}
      {isVisiblePopUpPersonas && (
        <AsistenciaBuscarPersonaFilter
          showPopup={{ isVisiblePopUp: isVisiblePopUpPersonas, setisVisiblePopUp: setisVisiblePopUpPersonas }}
          cancelar={() => setisVisiblePopUpPersonas(false)}
          agregar={agregarPersona}
          selectionMode={"multiple"}
          uniqueId={"PersonaJustificacionEditPage"}
          filtro={filtroLocal}
        />
      )}

      {/* POPUP-> Ver Archvos*/}
      <FileViewer
        showPopup={{ isVisiblePopUp: isVisiblePopUpFile, setisVisiblePopUp: setisVisiblePopUpFile }}
        cancelar={() => setisVisiblePopUpFile(false)}
        fileBase64={fileBase64}
        fileName={props.dataRowEditNew.NombreArchivo}
      />


    </Fragment >
  );
};


export default injectIntl(WithLoandingPanel(JustificacionMasivaEditPage));
