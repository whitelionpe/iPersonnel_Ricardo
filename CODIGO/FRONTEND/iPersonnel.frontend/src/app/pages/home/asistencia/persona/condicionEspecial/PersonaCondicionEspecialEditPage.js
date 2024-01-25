import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { useSelector } from "react-redux";
import Form, { Item, GroupItem, RequiredRule, PatternRule, StringLengthRule } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../../store/config/Styles";
import AdministracionCompaniaBuscar from "../../../../../partials/components/AdministracionCompaniaBuscar";

import { listarEstadoSimple,listarEstado, PatterRuler } from "../../../../../../_metronic";
import { isRequired, isModified } from "../../../../../../_metronic/utils/securityUtils";

import { ObtenerCondicionEspecialPorCompania }  from "../../../../../api/asistencia/condicionEspecial.api";
import Alerts from "../../../../../partials/components/Alert/Alerts";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";


const PersonaCondicionEspecialEditPage = props => {
  const { intl, modoEdicion, settingDataField, accessButton,varIdPersona,fechasContrato } = props;
  const {IdCliente} = useSelector(state => state.perfil.perfilActual);

  const [estadoSimple, setEstadoSimple] = useState([]);
  const [estado, setEstado] = useState([]);
  const [cboCondicionEspecial, setCboCondicionEspecial] = useState([]);


  const classesEncabezado = useStylesEncabezado();

  const [isVisiblePopUpCompaniaMandante, setisVisiblePopUpCompaniaMandante] = useState(false);
  const [companiaContratista, setCompaniaContratista] = useState("N");

  const [isVisibleAlert, setIsVisibleAlert] = useState(false);


  async function cargarCombos() {
    let estadoSimple = listarEstadoSimple();
    let estado = listarEstado();
    let dataCondicionEspecial = await ObtenerCondicionEspecialPorCompania({
      IdCliente:IdCliente,
      IdPersona:varIdPersona
    });

    setEstado(estado);
    setEstadoSimple(estadoSimple);
    setCboCondicionEspecial(dataCondicionEspecial);

    if(dataCondicionEspecial.length === 0){
      setIsVisibleAlert(true);
    }else
    {
      setIsVisibleAlert(false);
    } 

  }

  function grabar(e) {
    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregarPersonaCondicionEspecial(props.dataRowEditNew);
      } else {
        props.actualizarPersonaCondicionEspecial(props.dataRowEditNew);
      }
    }
  }
  const selectCompaniaMandante = (mandante) => {
    const { IdCompania, Compania } = mandante[0];
    props.dataRowEditNew.IdCompania = IdCompania;
    props.dataRowEditNew.CompaniaMandante = Compania;
  }

  const isRequiredRule = (id) => {
    return modoEdicion ? false : isRequired(id, settingDataField);
  }

  const onValueChangedCondicionEspecial = (e) =>{
    const resultado = cboCondicionEspecial.find( x => x.IdCondicionEspecial === e.value );
    if(resultado){
      props.dataRowEditNew.IdCompania  = resultado.IdCompania;
     }
  }

  useEffect(() => {
    cargarCombos();
  }, []);

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
    
    <Item
      colSpan={1}
      dataField="Compania"
      isRequired={modoEdicion ? isRequired('IdCompania', settingDataField) : false}
      label={{ text: intl.formatMessage({ id: "ASSISTANCE.SPECIAL.CONDITIONS.COMAPNY" }), }}
      visible={false}
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
                setCompaniaContratista("N");
                setisVisiblePopUpCompaniaMandante(true);
              },
            },
          },
        ],
      }}
      />

<GroupItem itemType="group" colCount={2} colSpan={2}>

            <Item
              dataField="IdCondicionEspecial"
              label={{ text: intl.formatMessage({ id: "ASSISTANCE.SPECIAL.CONDITIONS" }) }}
              editorType="dxSelectBox"
              isRequired={modoEdicion}
              editorOptions={{
                maxLength: 20,
                items: cboCondicionEspecial,
                valueExpr: "IdCondicionEspecial",
                displayExpr: "CondicionEspecial",
                onValueChanged: (e) => onValueChangedCondicionEspecial(e),
                readOnly: !props.dataRowEditNew.esNuevoRegistro ? true : false
              }}
              />
              </GroupItem>




              <Item dataField="FechaInicio"
                          label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.STARTDATE" }) }}
                          isRequired={true}  
                          editorType="dxDateBox"
                          editorOptions={{
                              type: "date",
                              inputAttr: { 'style': 'text-transform: uppercase' },
                              displayFormat: "dd/MM/yyyy",
                              min: fechasContrato.FechaInicioContrato,
                              max: fechasContrato.FechaFinContrato
                          }}
                      />

                      <Item dataField="FechaFin"
                          label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.ENDDATE" }) }}
                          isRequired={true}  
                          editorType="dxDateBox"
                          editorOptions={{
                              type: "date",
                              inputAttr: { 'style': 'text-transform: uppercase' },
                              displayFormat: "dd/MM/yyyy",
                              min: fechasContrato.FechaInicioContrato,
                              max: fechasContrato.FechaFinContrato
                          }}
                      />

              <Item
                dataField="Activo"
                label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
                editorType="dxSelectBox"
                editorOptions={{
                  items: estadoSimple,
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                  readOnly: !(modoEdicion ? (props.dataRowEditNew.esNuevoRegistro ? false : true) : false)
                }}
              />

              <Item dataField="IdCliente" visible={false} />

            </GroupItem>
          </Form>
          <AdministracionCompaniaBuscar
            selectData={selectCompaniaMandante}
            showPopup={{ isVisiblePopUp: isVisiblePopUpCompaniaMandante, setisVisiblePopUp: setisVisiblePopUpCompaniaMandante }}
            cancelarEdicion={() => setisVisiblePopUpCompaniaMandante(false)}
            uniqueId={"administracionCompaniaBuscar"}
            contratista={companiaContratista}

          />

            {isVisibleAlert && (
            <Alerts
            severity={"info"}
            msg1={ intl.formatMessage({ id: "ASSISTANCE.SPECIAL.CONDITIONS.MSG1" }) }
            msg2={intl.formatMessage({ id: "ASSISTANCE.SPECIAL.CONDITIONS.MSG2" }) }
            /> 
            )}

        </React.Fragment>
      </PortletBody>
    </>
  );
};

export default injectIntl(PersonaCondicionEspecialEditPage);
