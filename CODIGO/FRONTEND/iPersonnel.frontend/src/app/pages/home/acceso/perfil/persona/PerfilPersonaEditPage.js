import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { useSelector } from "react-redux";

import { Button } from "devextreme-react";
import Form, { Item, GroupItem, ButtonItem } from "devextreme-react/form";
import { DataGrid, Column, Paging, Pager, Button as ColumnButton, } from "devextreme-react/data-grid";

import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";

import { useStylesEncabezado } from "../../../../../store/config/Styles";
import { handleInfoMessages } from "../../../../../store/ducks/notify-messages";
import { servicePersona } from "../../../../../api/administracion/persona.api";
import { listarEstadoSimple } from "../../../../../../_metronic";
import AccesoPersonaPerfilBuscar from "../../../../../partials/components/AccesoPersonaPerfilBuscar";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";
import { custom } from "devextreme/ui/dialog";
import { DoubleLinePersona as DoubleLineLabel } from "../../../../../partials/content/Grid/DoubleLineLabel";


const PerfilPersonalEditPage = props => {
  const { intl, modoEdicion, settingDataField } = props;
  const perfil = useSelector(state => state.perfil.perfilActual);

  const [estadoSimple, setEstadoSimple] = useState([]);

  const classesEncabezado = useStylesEncabezado();

  const [isVisiblePopUpPersona, setisVisiblePopUpPersona] = useState(false);
  const [Filtros, setFiltros] = useState({ Filtro: "1" });
  const { IdCliente } = useSelector(state => state.perfil.perfilActual);

  async function cargarCombos() {
    let estadoSimple = listarEstadoSimple();
    setEstadoSimple(estadoSimple);

  }

  function grabar(e) {
    let result = e.validationGroup.validate();

    //Funcion general para todos
    if (fechaInicioEsMayorQueFechaFin()) {
      handleInfoMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), intl.formatMessage({ id: "ADMINISTRATION.PERSON.REGIME.VALIDATION.MESSAGE" }));
      return;
    }

    if (fechaInicioEsMayorQueFechaFin()) {
      handleInfoMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), intl.formatMessage({ id: "ADMINISTRATION.PERSON.REGIME.VALIDATION.MESSAGE" }));
      return;
    }
    //Validar curce de periodo..

    if (result.isValid) {
      if (props.dataRowEditNew.esNuevoRegistro) {

        let newArray = [...props.grillaPersona];

        if (newArray.length == 0) {
          handleInfoMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), intl.formatMessage({ id: "ADMINISTRATION.PERSON.REGIME.VALIDATION.MESSAGE.PERSON" }));
          return;
        }

        newArray.map(x => {
          x.FechaInicio = props.dataRowEditNew.FechaInicio;
          x.FechaFin = props.dataRowEditNew.FechaFin;
        });

        props.agregarPerfil(newArray);
        //}
      } else {
        props.agregarPerfil(props.dataRowEditNew);
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
    listar_Personas();
  }, []);


  const agregarDatosGrilla = (personas) => {

    props.setGrillaPersona([]);

    let newArray = [...props.grillaPersona];

    //console.log("personas", personas);

    personas.map(async (data) => {
      //Apellido Nombre
      let { IdPersona, NombreCompleto, Apellido, Nombre, TipoDocumentoAlias, Documento, Activo } = data;

      let foundIndex = newArray.findIndex(x => x.IdPersona === IdPersona);

      if (foundIndex == -1) {
        newArray.push({ IdPersona, NombreCompleto: `${Apellido} ${Nombre}`, TipoDocumento: TipoDocumentoAlias, Documento, Activo, Apellido, Nombre });
        newArray.map((x, i) => x.RowIndex = i + 1);
      }
    });
    props.setGrillaPersona(newArray);
    //evaluarMensaje(newArray);
  };
  //Validar 


  function fechaInicioEsMayorQueFechaFin() {
    let fechaInicio = new Date(props.dataRowEditNew.FechaInicio);
    let fechaFin = new Date(props.dataRowEditNew.FechaFin);

    return fechaInicio.getTime() > fechaFin.getTime();
  }

 

  function onCellPrepared(e) {
    if (e.rowType === 'data') {
      if (e.data.Activo === 'N') {
        e.cellElement.style.color = 'red';
      }
    }
  }

  const eliminarRegistro = (evt) => {
    let data = evt.row.data;

    let dialog = custom({
      showTitle: false,
      messageHtml: intl.formatMessage({ id: "ALERT.REMOVE" }),
      buttons: [
        {
          text: "Si",
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
                  hint={intl.formatMessage({ id: "ADMINISTRATION.PERSON.REGIME.ADD.PERSON" })}
                  useSubmitBehavior={true}
                  onClick={function (evt) {
                    setFiltros({ ...Filtros, IdCliente })
                    setisVisiblePopUpPersona(true);
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
                      {intl.formatMessage({ id: "ACCESS.PERSON.PROFILE.ADD" })}
                    </Typography>
                  </Toolbar>
                </AppBar>
              </Item>
              <Item dataField="IdPerfil" visible={false} />

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
                    //reprint();
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
                    //reprint();
                  },
                }}
              />

              <Item
                dataField="Activo"
                label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
                editorType="dxSelectBox"
                colSpan={2}
                isRequired={modoEdicion}
                visible={false}
                editorOptions={{
                  items: estadoSimple,
                  valueExpr: "Valor",
                  displayExpr: "Descripcion"
                }}
              />

              <Item dataField="IdPersona" visible={false} />

              <Item />
            </GroupItem>
          </Form>

          <DataGrid
            dataSource={props.grillaPersona}
            showBorders={true}
            focusedRowEnabled={true}
            keyExpr="RowIndex"
            onCellPrepared={onCellPrepared}
          >
            <Column dataField="RowIndex" caption="#" width={"6%"} alignment={"center"} allowSorting={false} allowSearch={false} allowFiltering={false} />
            <Column dataField="IdPersona" caption={intl.formatMessage({ id: "COMMON.CODE" })} alignment={"center"} width={"6%"} allowSorting={false} allowSearch={false} allowFiltering={false} />
            <Column dataField="NombreCompleto" cellRender={DoubleLineLabel} caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.FULLNAME" })} width={"40%"} allowSorting={true} allowSearch={true} allowFiltering={true} />
            <Column dataField="TipoDocumento" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.TYPE" })} width={"10%"} allowSorting={false} allowSearch={false} allowFiltering={false} />
            <Column dataField="Documento" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.DOCUMENT" })} width={"10%"} />
            <Column dataField="Mensaje" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.REGIME.MESSAGE" })} width={"20%"} />
            <Column type="buttons" width={70} visible={props.showButtons}
            //  visible={props.dataRowEditNew.esNuevoRegistro} 
              >
              <ColumnButton icon="trash" hint={intl.formatMessage({ id: "ACTION.REMOVE", })} onClick={eliminarRegistro} />
            </Column>

            <Paging defaultPageSize={9999} />
            <Pager showPageSizeSelector={false} />
          </DataGrid>


          <AccesoPersonaPerfilBuscar
            showPopup={{ isVisiblePopUp: isVisiblePopUpPersona, setisVisiblePopUp: setisVisiblePopUpPersona }}
            cancelar={() => setisVisiblePopUpPersona(false)}
            agregar={agregarDatosGrilla}
            selectionMode={"multiple"}
            condicion={"TRABAJADOR"}
            uniqueId={"AccesoPersonaPerfilX"}
          />
          
        </React.Fragment>
      </PortletBody>
    </>
  );
};

export default injectIntl(PerfilPersonalEditPage);
