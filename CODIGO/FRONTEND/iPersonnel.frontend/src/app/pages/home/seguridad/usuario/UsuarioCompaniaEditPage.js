import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { useSelector } from "react-redux";
import Form, { Item, GroupItem, } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";
import AdministracionCompaniaBuscar from "../../../../partials/components/AdministracionCompaniaBuscar";
import AdministracionCompaniaMandanteBuscar from "../../../../partials/components/AdministracionCompaniaMandanteBuscar";

import { listarEstadoSimple, listarEstado } from "../../../../../_metronic";
import { isRequired } from "../../../../../_metronic/utils/securityUtils";
//import Alerts from "../../../../partials/components/Alert/Alerts";
import HeaderInformation from "../../../../partials/components/HeaderInformation";


const UsuarioCompaniaEditPage = props => {
  const { intl, modoEdicion, settingDataField, accessButton, selectedIndex } = props;
  const { IdCliente } = useSelector(state => state.perfil.perfilActual);
  const [estadoSimple, setEstadoSimple] = useState([]);
  const [estado, setEstado] = useState([]);
  const classesEncabezado = useStylesEncabezado();

  const [isVisiblePopUpCompaniaMandante, setisVisiblePopUpCompaniaMandante] = useState(false);
  const [isVisiblePopUpCompaniaContratista, setisVisiblePopUpCompaniaContratista] = useState(false);

  const [companiaContratista, setCompaniaContratista] = useState("N");


  async function cargarCombos() {
    let estadoSimple = listarEstadoSimple();
    let estado = listarEstado();

    setEstado(estado);
    setEstadoSimple(estadoSimple);

  }

  function grabar(e) {
    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregarUsuarioCompania(props.dataRowEditNew);
      } else {
        props.actualizarUsuarioCompania(props.dataRowEditNew);
      }
    }
  }
  const selectCompaniaMandante = (mandante) => {
    const { IdCompania, Compania } = mandante[0];
    props.dataRowEditNew.IdCompania = IdCompania;
    props.dataRowEditNew.Compania = Compania;
  }

  const selectCompaniaContratista = (contratista) => {
    const { IdCompania, Compania } = contratista[0];
    props.dataRowEditNew.IdCompania = IdCompania;
    props.dataRowEditNew.Compania = Compania;
  }

  useEffect(() => {
    cargarCombos();
  }, []);

  useEffect(() => {
    if (selectedIndex) {
     // console.log("selectedIndex",selectedIndex);
      const { Contratista, IdCompania, Compania } = selectedIndex;
      props.dataRowEditNew.IdCompania = IdCompania;
      props.dataRowEditNew.Compania = Compania;
      props.dataRowEditNew.Contratista = Contratista;
      setCompaniaContratista(Contratista);
    }
  }, [selectedIndex]);

  return (
    <>
      <HeaderInformation data={props.getInfo()} visible={true} labelLocation={'left'} colCount={6}
        toolbar={
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
                      {intl.formatMessage({ id: "COMMON.DETAIL" })}
                    </Typography>
                  </Toolbar>
                </AppBar>
              </Item>

              <Item dataField="IdCompania" visible={false} />
              <Item dataField="IdUsuario" visible={false} />

              <Item
                colSpan={1}
                dataField="Compania"
                isRequired={modoEdicion ? isRequired('IdCompania', settingDataField) : false}
                label={{ text: intl.formatMessage({ id: "ASSISTANCE.SPECIAL.CONDITIONS.COMAPNY" }), }}
                visible={true}
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
                        disabled: !props.dataRowEditNew.esNuevoRegistro,
                        onClick: (evt) => {
                          //Se obtiene desde usuario valor contratista S: Contratista ; N: Mandante
                          const { Contratista } = selectedIndex;
                          //console.log("clikc.compania.Contratista", Contratista);
                          if (Contratista === "S") {
                            setisVisiblePopUpCompaniaContratista(true);
                          } else {
                            setisVisiblePopUpCompaniaMandante(true);
                          }

                        },
                      },
                    },
                  ],
                }}
              />

              <Item />

              <Item dataField="FechaInicio"
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.STARTDATE" }) }}
                // isRequired={modoEdicion ? isRequired('FechaInicio', settingDataField) : false}  
                isRequired={true}
                editorType="dxDateBox"
                editorOptions={{
                  type: "date",
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  displayFormat: "dd/MM/yyyy",
                  // readOnly: !(modoEdicion ? isModified('FechaInicio', settingDataField) : false)
                }}
              />

              <Item dataField="FechaFin"
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.ENDDATE" }) }}
                // isRequired={modoEdicion ? isRequired('FechaFin', settingDataField) : false}
                isRequired={true}
                editorType="dxDateBox"
                editorOptions={{
                  type: "date",
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  displayFormat: "dd/MM/yyyy",
                  // readOnly: !(modoEdicion ? isModified('FechaFin', settingDataField) : false)
                }}
              />

              <Item dataField="IdCliente" visible={false} />

            </GroupItem>
          </Form>

          {isVisiblePopUpCompaniaMandante && (
            <AdministracionCompaniaMandanteBuscar
              selectData={selectCompaniaMandante}
              showPopup={{ isVisiblePopUp: isVisiblePopUpCompaniaMandante, setisVisiblePopUp: setisVisiblePopUpCompaniaMandante }}
              cancelarEdicion={() => setisVisiblePopUpCompaniaMandante(false)}
              uniqueId={"administracionCompaniaMandanteBuscar"}
              contratista={companiaContratista}
              isContratista={"N"}
            />
          )}

          {isVisiblePopUpCompaniaContratista && (
            <AdministracionCompaniaBuscar
              selectData={selectCompaniaContratista}
              showPopup={{ isVisiblePopUp: isVisiblePopUpCompaniaContratista, setisVisiblePopUp: setisVisiblePopUpCompaniaContratista }}
              cancelarEdicion={() => setisVisiblePopUpCompaniaContratista(false)}
              uniqueId={"administracionCompaniaContratistaBuscar"}
              contratista={companiaContratista}
              isContratista={"S"}
            />
          )}


        

        </React.Fragment>
      </PortletBody>
    </>
  );
};

export default injectIntl(UsuarioCompaniaEditPage);
