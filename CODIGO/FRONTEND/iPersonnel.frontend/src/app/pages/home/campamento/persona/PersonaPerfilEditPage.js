import React, { useEffect, useState } from "react";
import Form, { Item, GroupItem } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";
import { useSelector } from "react-redux";
import { Popup } from 'devextreme-react/popup';
import { handleInfoMessages } from "../../../../store/ducks/notify-messages";
import DataGrid, {
  Column,
  Editing,
  Paging,
  Selection,
  FilterRow,

} from 'devextreme-react/data-grid';
//Multi-idioma
import { injectIntl } from "react-intl";
import { listarEstadoSimple, isRequired, isModified } from "../../../../../_metronic";
//import { listarEstadoSimple } from "../../../../api/sistema/entidad.api";
import { obtenerTodos as obtenerPerfiles } from "../../../../api/acceso/perfil.api";

const PersonaPerfilEditPage = props => {

  //multi-idioma
  const { intl, modoEdicion, settingDataField, accessButton } = props;

  const perfil = useSelector(state => state.perfil.perfilActual);

  const [estadoSimple, setEstadoSimple] = useState([]);
  const [perfiles, setPerfiles] = useState([]);
  const classesEncabezado = useStylesEncabezado();

  const [isVisiblePopUpPerfil, setisVisiblePopUpPerfil] = useState(false);

  async function cargarCombos() {
    let estadoSimple = listarEstadoSimple();
    let perfiles = await obtenerPerfiles({ IdDivision: perfil.IdDivision, IdCliente: perfil.IdCliente });

    setEstadoSimple(estadoSimple);
    setPerfiles(perfiles);
  }

  function grabar(e) {

    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (Date.parse(new Date(props.dataRowEditNew.FechaInicio)) > Date.parse(new Date(props.dataRowEditNew.FechaFin))) {
        handleInfoMessages(intl.formatMessage({ id: "ACCESS.PERSON.STARTDATE.VALID" }));
        return;
      }
      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregarPerfil(props.dataRowEditNew);
      } else {
        props.actualizarPerfil(props.dataRowEditNew);
      }
    }
  }

  const onRowDblClickPerfil = row => {
    const { IdPerfil, Perfil } = row.data
    props.dataRowEditNew.IdPerfil = IdPerfil;
    props.dataRowEditNew.Perfil = Perfil;
    setisVisiblePopUpPerfil(false);
  }

  useEffect(() => {
    cargarCombos();
  }, []);

  return (
    <>
      <PortletHeader
        title={props.titulo}
        toolbar={
          <PortletHeaderToolbar>

            <Button
              icon="fa fa-save"
              type="default"
              hint={intl.formatMessage({ id: "ACTION.RECORD" })}
              onClick={grabar}
              useSubmitBehavior={true}
              validationGroup="FormEdicion"
              visible={modoEdicion}
              disabled={!accessButton.grabar}
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
              <Item dataField="Perfil" with="50"
                isRequired={modoEdicion}
                label={{ text: intl.formatMessage({ id: "ACCESS.PERSON.PROFILE" }) }}
                editorOptions={{
                  //readOnly: true,
                  readOnly: !props.dataRowEditNew.esNuevoRegistro ? true : false,
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
                      //disabled: !props.dataRowEditNew.esNuevoRegistro ? true : false,
                      onClick: () => {
                        setisVisiblePopUpPerfil(true);
                      },

                    }
                  }]

                }}

              />
              <Item />

              <Item dataField="FechaInicio"
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.STARTDATE" }) }}
                //isRequired={true}
                isRequired={modoEdicion ? isRequired('FechaInicio', settingDataField) : false}
                editorType="dxDateBox"
                dataType="date"
                editorOptions={{
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  displayFormat: "dd/MM/yyyy",
                  readOnly: !(modoEdicion ? isModified('FechaInicio', settingDataField) : false)
                }}
              />

              <Item dataField="FechaFin"
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.ENDDATE" }) }}
                //isRequired={true}
                isRequired={modoEdicion ? isRequired('FechaFin', settingDataField) : false}
                editorType="dxDateBox"
                dataType="date"
                editorOptions={{
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  displayFormat: "dd/MM/yyyy",
                  readOnly: !(modoEdicion ? isModified('FechaFin', settingDataField) : false)
                }}
              />
              <Item
                dataField="Activo"
                label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
                editorType="dxSelectBox"
                isRequired={modoEdicion}
                editorOptions={{
                  items: estadoSimple,
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                  readOnly: !(modoEdicion ? (props.dataRowEditNew.esNuevoRegistro ? false : true) : false)
                  // disabled: props.dataRowEditNew.esNuevoRegistro ? true : !props.modoEdicion,
                }}
              />

            </GroupItem>
          </Form>


          <Popup
            visible={isVisiblePopUpPerfil}
            dragEnabled={false}
            closeOnOutsideClick={true}
            showTitle={true}
            title={intl.formatMessage({ id: "ACCESS.PERSON.PROFILES" })}
            height={580}
            width={700}
            onHiding={() => setisVisiblePopUpPerfil(!isVisiblePopUpPerfil)}
          >
            <DataGrid
              dataSource={perfiles}
              showBorders={true}
              focusedRowEnabled={true}
              keyExpr="IdPerfil" 
              onRowDblClick={onRowDblClickPerfil}
            >

              <Editing
                mode="cell"
                allowUpdating={true}
              >
              </Editing>

              <Paging enabled={true} defaultPageSize={10} />
              <Selection mode="single" />
              <FilterRow visible={true} />
              <Column dataField="IdPerfil" caption={intl.formatMessage({ id: "COMON.CODE" })} editorOptions={false} allowEditing={false} visible={true} />
              <Column dataField="Perfil" caption={intl.formatMessage({ id: "ACCESS.PERSON.DESCRIPTION" })} editorOptions={false} allowEditing={false} />
            </DataGrid>

          </Popup>

        </React.Fragment>
      </PortletBody>
    </>
  );

};

export default injectIntl(PersonaPerfilEditPage);
