import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { useSelector } from "react-redux";

import { Button } from "devextreme-react";
import Form, { Item, GroupItem, ButtonItem } from "devextreme-react/form";
import { DataGrid, Column, Paging, Pager, Button as ColumnButton, } from "devextreme-react/data-grid";

import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";

import { useStylesEncabezado } from "../../../../store/config/Styles";
import { handleInfoMessages } from "../../../../store/ducks/notify-messages";
import { servicePersona } from "../../../../api/administracion/persona.api";
import { listarEstadoSimple, isRequired, isModified, isNotEmpty } from "../../../../../_metronic";
//import AdministracionPersonaBuscar from "../../../../partials/components/AdministracionPersonaBuscar";
import AdministracionPersonaRegimenBuscar from "../../../../partials/components/AdministracionPersonaRegimenBuscar";
import HeaderInformation from "../../../../partials/components/HeaderInformation";
import { custom } from "devextreme/ui/dialog";
import { DoubleLinePersona as DoubleLineLabel } from "../../../../partials/content/Grid/DoubleLineLabel";
import { obtenerTodos as obtenerTodosGuardia } from "../../../../api/administracion/regimenGuardia.api";


const RegimenPersonaEditPage = props => {
  const { intl, modoEdicion, settingDataField } = props;
  const perfil = useSelector(state => state.perfil.perfilActual);

  const [estadoSimple, setEstadoSimple] = useState([]);
  const [guardia, setGuardia] = useState([]);

  const classesEncabezado = useStylesEncabezado();

  const [isVisiblePopUpPersona, setisVisiblePopUpPersona] = useState(false);
  const [Filtros, setFiltros] = useState({ Filtro: "1" });
  const { IdCliente } = useSelector(state => state.perfil.perfilActual);

  async function cargarCombos() {

    if (perfil.IdCliente) {
      let regimenGuardia = await obtenerTodosGuardia({ IdCliente: perfil.IdCliente, IdDivision: perfil.IdDivision, IdRegimen: props.IdRegimenes });
      let estadoSimple = listarEstadoSimple();

      setGuardia(regimenGuardia);
      setEstadoSimple(estadoSimple);
    }
  }

  function grabar(e) {
    let result = e.validationGroup.validate();

    if (fechaInicioEsMayorQueFechaFin()) {
      //alert("La fecha de inicio no puede ser mayor que la fecha fin");
      handleInfoMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), intl.formatMessage({ id: "ADMINISTRATION.PERSON.REGIME.VALIDATION.MESSAGE" }));
      return;
    }

    if (result.isValid) {
      if (props.dataRowEditNew.esNuevoRegistro) {

        let newArray = [...props.grillaPersona];

        if (newArray.length == 0) {
          handleInfoMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), intl.formatMessage({ id: "ADMINISTRATION.PERSON.REGIME.VALIDATION.MESSAGE.PERSON" }));
          return;
        }

        let evaluation = newArray.find(element => (element.Mensaje) && element.Mensaje.length > 0 && element.Mensaje != "Actualizado...");
        if (evaluation) {
          handleInfoMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), intl.formatMessage({ id: "ADMINISTRATION.PERSON.REGIME.VALIDATION.MESSAGE.ALERT" }));
          return;
        }


        newArray.map(x => {
          x.FechaInicio = new Date(props.dataRowEditNew.FechaInicio);
          x.FechaFin = new Date(props.dataRowEditNew.FechaFin);
          x.IdGuardia = props.dataRowEditNew.IdGuardia;
        });


        let actualizaciones = newArray.filter(element => element.Mensaje == "Actualizado...");
        //debugger;
        if (actualizaciones) {
          for (let currentInternal of actualizaciones) {
            props.actualizarPersonaRegimen(currentInternal);
          }
        }


        let inserciones = newArray.filter(element => element.Mensaje != "Actualizado...");
        if (inserciones) {
          props.agregarPersonaRegimen(inserciones);
        }

        //debugger;

        //}
      } else {
        props.actualizarPersonaRegimen(props.dataRowEditNew);
      }
    }
  }


  async function listar_Personas() {

    if (!props.dataRowEditNew.esNuevoRegistro) {
      let persona = await servicePersona.obtener({
        IdCliente: perfil.IdCliente,
        IdPersona: props.dataRowEditNew.IdPersona
      });
    }
  }

  useEffect(() => { 
    cargarCombos();
    // listar_Personas();//LSF--No se usa-20240108
  }, []);

  /*   const obtenerMensaje = rowData => {
      return rowData.Mensaje === "Rango de Fecha";
    } */

  const agregarDatosGrilla = (personas) => {

    props.setGrillaPersona([]);
    let str_repetidos = '';
    let newArray = [...props.grillaPersona];

    personas.map(async (data) => {
      //Apellido Nombre
      let { IdPersona, NombreCompleto, Apellido, Nombre, TipoDocumento, Documento, Activo } = data;

      //debugger;

      let foundIndex = newArray.findIndex(x => x.IdPersona == IdPersona);

      if (foundIndex == -1) {
        newArray.push({ IdPersona, NombreCompleto: `${Apellido} ${Nombre}`, TipoDocumento, Documento, Activo, Apellido, Nombre });
        newArray.map((x, i) => x.RowIndex = i + 1);
      } else {
        str_repetidos += `${Documento} - ${NombreCompleto}.\r\n`;
      }
    });

    /*   if (str_repetidos != '') {
        handleErrorMessages({ response: { data: `Personas ya existen:\r\n${str_repetidos}`, status: 400 } });
      } */

    setisVisiblePopUpPersona(false);

    props.setGrillaPersona(newArray);
    evaluarMensaje(newArray);
  };


  function fechaInicioEsMayorQueFechaFin() {
    let fechaInicio = new Date(props.dataRowEditNew.FechaInicio);
    let fechaFin = new Date(props.dataRowEditNew.FechaFin);

    return fechaInicio.getTime() > fechaFin.getTime();
  }

  function reprint() {

    if (fechaInicioEsMayorQueFechaFin()) {
      //alert("La fecha de inicio no puede ser mayor que la fecha fin");
      handleInfoMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), intl.formatMessage({ id: "ADMINISTRATION.PERSON.REGIME.VALIDATION.MESSAGE" }));
      return;
    }

    let newArray = [...props.grillaPersona];
    evaluarMensaje(newArray);
  }

  function evaluarMensaje(newArray) {

    if (newArray.length === 0) {
      return;
    }

    for (var current of newArray) {
      current.Mensaje = "";
    }
    if (props.dataRowEditNew.currentUsers) {

      if (props.dataRowEditNew.currentUsers.length > 0) {
        console.log("***props.dataRowEditNew.currentUsers :> ", props.dataRowEditNew.currentUsers);
        let data = props.dataRowEditNew.currentUsers.map(data => {
          data.FechaInicio = data.FechaInicio.split('T')[0];
          data.FechaFin = data.FechaFin.split('T')[0];
          return data;
        });

        let fechaInicio = formater(new Date(props.dataRowEditNew.FechaInicio));
        let fechaFin = formater(new Date(props.dataRowEditNew.FechaFin));


        for (let currentExternal of data) {

          for (let currentInternal of newArray) {

            if (currentExternal.Documento === currentInternal.Documento
              && currentExternal.FechaInicio === fechaInicio
              && currentExternal.FechaFin === fechaFin
              //&& props.dataRowEditNew.IdGuardia == currentExternal.IdGuardia
            ) {
              currentInternal.Mensaje = intl.formatMessage({ id: "REGIMEN.PERSON.EXISTS.DATE.MSG" });
              currentInternal.IdSecuencial = currentExternal.IdSecuencial
              //e.cellElement.style.color = "red";
            }
            else if (currentExternal.Documento === currentInternal.Documento
              && ((fechaInicio <= currentExternal.FechaInicio && currentExternal.FechaInicio <= fechaFin) ||
                (fechaInicio <= currentExternal.FechaFin && currentExternal.FechaFin <= fechaFin))
            ) {
              currentInternal.Mensaje = intl.formatMessage({ id: "REGIMEN.PERSON.EXISTS.DATE.MSG" });
              currentInternal.IdSecuencial = currentExternal.IdSecuencial;
            }
          }
        }
        props.setGrillaPersona(newArray);
      }
    }
  }

  function formater(d) {
    //debugger;
    return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2);


  }
  function onCellPrepared(e) {
    if (e.rowType === 'data') {
      if (isNotEmpty(e.data.Mensaje)) {
        if (e.data.Mensaje == "Actualizado...") {
          e.cellElement.style.color = 'green';
        }
        else {
          e.cellElement.style.color = 'red';
        }

      }
    }
  }

  function onValueGuardia(guardia) {


    let newArray = [...props.grillaPersona];
    evaluarMensaje(newArray);

  }

  function editarGuardia(evt) {
    let data = evt.row.data;

    let newArray = [...props.grillaPersona];

    newArray.filter(s => s.Documento == data.Documento).map(d => {
      d.Mensaje = "Actualizado...";
      d.IdSecuencial = isNotEmpty(data.IdSecuencial) ? data.IdSecuencial : 0;
      d.IdRegimen = props.IdRegimenes;
      return d;
    });

    props.setGrillaPersona(newArray);

  }

  const eliminarRegistro = (evt) => {
    let data = evt.row.data;

    let dialog = custom({
      showTitle: false,
      messageHtml: intl.formatMessage({ id: "ALERT.REMOVE" }),
      buttons: [
        {
          text: "Yes",
          onClick: (e) => {
            let newArray = props.grillaPersona.filter(x => x.IdPersona != data.IdPersona);

            newArray.map((x, i) => {
              x.RowIndex = i + 1;
            });
            props.setGrillaPersona(newArray);
          }
        },
        { text: "No", },
      ]
    });
    dialog.show();

  };






  return (
    <>
      <HeaderInformation data={props.getInfo()} visible={true} labelLocation={'left'} colCount={6}
        toolbar={
          <PortletHeader
            title={""}
            toolbar={
              <PortletHeaderToolbar> 
                <Button
                  icon="group"
                  type="default"
                  visible={props.dataRowEditNew.esNuevoRegistro}
                  hint={intl.formatMessage({ id: "ADMINISTRATION.PERSON.REGIME.ADD.PERSON" })}
                  useSubmitBehavior={true}
                  onClick={function (evt) {
                    if (props.dataRowEditNew.IdGuardia) {
                      setFiltros({ ...Filtros, IdCliente })
                      setisVisiblePopUpPersona(true);
                    }
                    else {
                      //alert("Primero selecciona un regimen");
                      handleInfoMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), intl.formatMessage({ id: "ADMINISTRATION.PERSON.REGIME.VALIDATION.MESSAGE.ALERT.GUARDIA" }));
                    }
                  }}
                />
                &nbsp;
                <Button
                  icon="fa fa-save"
                  type="default"
                  hint={intl.formatMessage({ id: "ACTION.RECORD" })}
                  useSubmitBehavior={true}
                  validationGroup="FormEdicion"
                  onClick={grabar}
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
        } />


      <PortletBody >
        <React.Fragment>
          <Form formData={props.dataRowEditNew} validationGroup="FormEdicion" >
            <GroupItem itemType="group" colCount={2} colSpan={2}>
              <Item colSpan={2}>
                <AppBar position="static" className={classesEncabezado.secundario}>
                  <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                    <Typography variant="h6" color="inherit" className={classesEncabezado.title}> 
                      {
                        props.dataRowEditNew.esNuevoRegistro ? intl.formatMessage({ id: "ADMINISTRATION.PERSON.REGIME.ADD" }) :
                          intl.formatMessage({ id: "ADMINISTRATION.PERSON.REGIME.EDIT.PERSON" }) 
                      } 

                    </Typography>
                  </Toolbar>
                </AppBar>
              </Item>
              <Item dataField="IdSecuencial" visible={false} />
              <Item dataField="IdRegimen" visible={false} />

              <Item
                dataField="NombreCompleto"
                label={{ text: intl.formatMessage({ id: "DEMOBILIZATION.PEOPLE.WORKER" }) }}
                // isRequired={modoEdicion}
                visible={!props.dataRowEditNew.esNuevoRegistro}
                editorOptions={{
                  readOnly: true
                }}
              />

              <Item
                dataField="IdGuardia"
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.REGIME.GUARD" }) }}
                editorType="dxSelectBox"
                isRequired={true}
                //isRequired={modoEdicion ? isRequired('IdGuardia', settingDataField) : false}
                editorOptions={{
                  onValueChanged: (e) => onValueGuardia(e.value),
                  items: guardia,
                  valueExpr: "IdGuardia",
                  displayExpr: "Guardia",
                  searchEnabled: true
                }}
              >
              </Item> 
              <Item 
                visible={props.dataRowEditNew.esNuevoRegistro}/>

              <Item
                dataField="FechaInicio"
                label={{ text: intl.formatMessage({ id: "CASINO.PERSON.GROUP.STARTDATE" }) }}
                editorType="dxDateBox"
                dataType="date"
                isRequired={modoEdicion}
                editorOptions={{
                  displayFormat: "dd/MM/yyyy",
                  //readOnly: !(modoEdicion ? isModified('FechaInicio', settingDataField) : false)
                  onClosed: (evt) => {
                    reprint();
                  },
                }}
              />
              <Item
                dataField="FechaFin"
                label={{ text: intl.formatMessage({ id: "CASINO.PERSON.GROUP.ENDDATE" }) }}
                editorType="dxDateBox"
                isRequired={modoEdicion}
                dataType="date"
                editorOptions={{
                  displayFormat: "dd/MM/yyyy",
                  //readOnly: !(modoEdicion ? isModified('FechaFin', settingDataField) : false)
                  onClosed: (evt) => {
                    reprint();
                  },
                }}
              />

              <Item
                dataField="Activo"
                label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
                editorType="dxSelectBox"
                colSpan={1}
                isRequired={modoEdicion}
                visible={!props.dataRowEditNew.esNuevoRegistro}
                editorOptions={{
                  items: estadoSimple,
                  valueExpr: "Valor",
                  displayExpr: "Descripcion"
                }}
              />

              <Item dataField="IdPersona" visible={false}
                colSpan={2} />

              <Item />
            </GroupItem>
          </Form>

          {props.dataRowEditNew.esNuevoRegistro  && (
            <DataGrid
              dataSource={props.grillaPersona}
              showBorders={true}
              focusedRowEnabled={true}
              keyExpr="RowIndex"
              onCellPrepared={onCellPrepared}
            >
              <Column dataField="RowIndex" caption="#" width={"6%"} alignment={"center"} allowSorting={false} allowSearch={false} allowFiltering={false} />
              <Column dataField="IdPersona" caption={intl.formatMessage({ id: "COMMON.CODE" })} alignment={"center"} width={"6%"} allowSorting={false} allowSearch={false} allowFiltering={false} />
              <Column dataField="NombreCompleto" cellRender={DoubleLineLabel} caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.FULLNAME" })} width={"20%"} allowSorting={true} allowSearch={true} allowFiltering={true} />
              <Column dataField="TipoDocumento" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.TYPE" })} width={"10%"} allowSorting={false} allowSearch={false} allowFiltering={false} />
              <Column dataField="Documento" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.DOCUMENT" })} width={"10%"} />
              <Column dataField="Mensaje" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.REGIME.MESSAGE" })} width={"30%"} />
              <Column type="buttons" width={70}
                // visible={props.showButtons} 
                visible={props.dataRowEditNew.esNuevoRegistro}  >
                <ColumnButton icon="redo" hint={intl.formatMessage({ id: "ADMINISTRATION.PERSON.REGIME.MIGRATE", })} onClick={editarGuardia} />
                <ColumnButton icon="trash" hint={intl.formatMessage({ id: "ACTION.REMOVE", })} onClick={eliminarRegistro} />
              </Column>
              <Paging defaultPageSize={9999} />
              <Pager showPageSizeSelector={false} />
            </DataGrid>
          )}
 
          {/* ------------------------------- */}
          {/* <AdministracionPersonaBuscar
            showPopup={{ isVisiblePopUp: isVisiblePopUpPersona, setisVisiblePopUp: setisVisiblePopUpPersona }}
            cancelar={() => (false)}
            agregar={agregarDatosGrilla}
            selectionMode={"multiple"}
          //uniqueId = {"personasBuscarEditPage"}
          /> */}
          {isVisiblePopUpPersona && (
            <AdministracionPersonaRegimenBuscar
              showPopup={{ isVisiblePopUp: isVisiblePopUpPersona, setisVisiblePopUp: setisVisiblePopUpPersona }}
              cancelar={() => setisVisiblePopUpPersona(false)}//(false)
              agregar={agregarDatosGrilla}
              selectionMode={"multiple"}
              uniqueId={"regimenPersonaBuscarEditPage"}
            />
          )}

        </React.Fragment>
      </PortletBody>
    </>
  );
};

export default injectIntl(RegimenPersonaEditPage);
