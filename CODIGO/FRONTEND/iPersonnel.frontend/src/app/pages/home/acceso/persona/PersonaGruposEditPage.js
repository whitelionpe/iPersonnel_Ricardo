import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { useSelector } from "react-redux";
import { Button } from "devextreme-react";
import Form, { Item, GroupItem, ButtonItem } from "devextreme-react/form";
import { DataGrid, Column, Selection, Paging, Pager, Button as ColumnButton, } from "devextreme-react/data-grid";

import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { custom } from "devextreme/ui/dialog";

import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import { useStylesEncabezado } from "../../../../store/config/Styles";
import { handleInfoMessages } from "../../../../store/ducks/notify-messages";
import { listarEstadoSimple, isRequired, isModified, isNotEmpty } from "../../../../../_metronic";
import AccesoPersonaGrupoBuscar from "../../../../partials/components/AccesoPersonaGrupoBuscar";
import HeaderInformation from "../../../../partials/components/HeaderInformation";
import { DoubleLinePersona as DoubleLineLabel } from "../../../../partials/content/Grid/DoubleLineLabel";

import { servicePersona } from "../../../../api/administracion/persona.api";
import './PersonaGruposEditPage.css';

const PersonaGruposEditPage = props => {
  const { intl, modoEdicion, settingDataField } = props;

  const perfil = useSelector(state => state.perfil.perfilActual);
  const [estadoSimple, setEstadoSimple] = useState([]);
  const classesEncabezado = useStylesEncabezado();
  const [isVisiblePopUpPersona, setisVisiblePopUpPersona] = useState(false);
  const [Filtros, setFiltros] = useState({ Filtro: "1" });
  const { IdCliente } = useSelector(state => state.perfil.perfilActual);
  const [selectedRowTemporal, setSelectedRowTemporal] = useState([]);
  const [itemsSelected, setItemsSelected] = useState([]);//Tambien permmite el refresh o reload del select multiple

  async function cargarCombos() {
    let estadoSimple = listarEstadoSimple();
    setEstadoSimple(estadoSimple);
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

        newArray.map(x => {
          x.FechaInicio = new Date(props.dataRowEditNew.FechaInicio).toLocaleString();
          x.FechaFin = new Date(props.dataRowEditNew.FechaFin).toLocaleString();
        });

        props.agregarPersonaGrupo(newArray);
        //}
      } else {
        props.actualizarPersonaGrupo(props.dataRowEditNew);
      }
    }
  }

  function eliminarSelect(e) {
    let newArray = [...props.grillaPersona];
    console.log("test_oo", selectedRowTemporal)
    selectedRowTemporal.forEach(rd => {
      newArray = newArray.filter(t => t.IdPersona !== rd.IdPersona);
    });

    newArray.map((x, i) => x.RowIndex = i + 1);

    props.setGrillaPersona([]);
    props.setGrillaPersona(newArray);
    setItemsSelected([]);

  }

  const seleccionarRegistro = evt => {
    if (props.selectionMode === "row" || props.selectionMode === "single") {
      if (isNotEmpty(evt.data))
        setSelectedRowTemporal([{ ...evt.data }]);
    }
  }

  function onSelectionChanged(e) {
    setSelectedRowTemporal(e.selectedRowsData);
    setItemsSelected(e.selectedRowKeys.length && e.selectedRowKeys || []);
  }

  useEffect(() => {
    cargarCombos();
  }, []);


  const agregarDatosGrilla = (personas) => {
    props.setGrillaPersona([]);
    let str_repetidos = '';
    let newArray = [...props.grillaPersona];

    personas.map(async (data) => {
      //Apellido Nombre
      let { IdPersona, NombreCompleto, Apellido, Nombre, TipoDocumento, Documento, Activo } = data;

      let foundIndex = newArray.findIndex(x => x.IdPersona == IdPersona);

      if (foundIndex == -1) {
        newArray.push({ IdPersona, NombreCompleto: `${Apellido} ${Nombre}`, TipoDocumento, Documento, Activo, Apellido, Nombre });
        newArray.map((x, i) => x.RowIndex = i + 1);
      } else {
        str_repetidos += `${Documento} - ${NombreCompleto}.\r\n`;
      }
    });

    props.dataRowEditNew.esNuevoRegistro = true;//permite habilitar boton guardar
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

        let data = props.dataRowEditNew.currentUsers.map(data => {
          data.FechaInicio = data.FechaInicio.split('T')[0];
          data.FechaFin = data.FechaFin.split('T')[0];
          return data;
        });

        let fechaInicio = formater(new Date(props.dataRowEditNew.FechaInicio));
        let fechaFin = formater(new Date(props.dataRowEditNew.FechaFin));

        for (let currentExternal of data) {

          for (let currentInternal of newArray) {

            if (currentExternal.Documento === currentInternal.Documento && currentExternal.FechaInicio === fechaInicio && currentExternal.FechaFin === fechaFin) {
              currentInternal.Mensaje = "Rango de fecha de la persona ya existe.";
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
          text: "Yes",
          onClick: (e) => {
            let newArray = props.grillaPersona.filter(x => x.IdPersona != data.IdPersona);

            newArray.map((x, i) => {
              x.RowIndex = i + 1;
            });

            //Se valida para que el boton guardar se habilite o deshabilite
            newArray.length > 0 ? (props.dataRowEditNew.esNuevoRegistro = true) : (props.dataRowEditNew.esNuevoRegistro = false)
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
                  disabled={!props.dataRowEditNew.esNuevoRegistro ? true : false}
                />
                &nbsp;
                <Button
                  icon="fa fa-trash"
                  type="default"
                  hint={intl.formatMessage({ id: "ACTION.REMOVE" })}
                  useSubmitBehavior={true}
                  validationGroup="FormEdicion"
                  onClick={eliminarSelect}
                  disabled={!props.dataRowEditNew.esNuevoRegistro ? true : false}
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
                      {intl.formatMessage({ id: "ADMINISTRATION.PERSON.REGIME.ADD" })}
                    </Typography>
                  </Toolbar>
                </AppBar>
              </Item>
              <Item dataField="IdGrupo" visible={false} />

              <Item
                dataField="FechaInicio"
                label={{ text: intl.formatMessage({ id: "CASINO.PERSON.GROUP.STARTDATE" }) }}
                editorType="dxDateBox"
                dataType="date"
                isRequired={modoEdicion}
                editorOptions={{
                  displayFormat: "dd/MM/yyyy",
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
                  onClosed: (evt) => {
                    reprint();
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

            </GroupItem>
          </Form>

          <DataGrid
            dataSource={props.grillaPersona}
            showBorders={true}
            focusedRowEnabled={true}
            keyExpr="RowIndex"
            onCellPrepared={onCellPrepared}
            // onFocusedRowChanged={seleccionarRegistro}
            //add
            selectedRowKeys={itemsSelected}
            onSelectionChanged={onSelectionChanged}
          >

            <Selection mode={"multiple"} />
            <Column dataField="RowIndex" caption="#" width={"8%"} alignment={"center"} allowSorting={false} allowSearch={false} allowFiltering={false} />
            <Column dataField="IdPersona" caption={intl.formatMessage({ id: "COMMON.CODE" })} alignment={"center"} width={"10%"} allowSorting={false} allowSearch={false} allowFiltering={false} />
            <Column dataField="NombreCompleto" cellRender={DoubleLineLabel} caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.FULLNAME" })} width={"37%"} allowSorting={true} allowSearch={true} allowFiltering={true} />
            <Column dataField="TipoDocumento" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.TYPE" })} width={"10%"} allowSorting={false} allowSearch={false} allowFiltering={false} />
            <Column dataField="Documento" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.DOCUMENT" })} width={"15%"} />
            <Column dataField="Mensaje" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.REGIME.MESSAGE" })} width={"20%"} />
            <Column type="buttons" width={70} visible={props.showButtons}
            >
              <ColumnButton icon="trash" hint={intl.formatMessage({ id: "ACTION.REMOVE", })} onClick={eliminarRegistro} />
            </Column>

            <Paging defaultPageSize={9999} />
            <Pager showPageSizeSelector={false} />
          </DataGrid>
          <AccesoPersonaGrupoBuscar
            showPopup={{ isVisiblePopUp: isVisiblePopUpPersona, setisVisiblePopUp: setisVisiblePopUpPersona }}
            cancelar={() => (false)}
            agregar={agregarDatosGrilla}
            selectionMode={"multiple"}
          />
        </React.Fragment>
      </PortletBody>
    </>
  );
};

export default injectIntl(PersonaGruposEditPage);
