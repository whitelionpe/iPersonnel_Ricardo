import React, { Fragment, useEffect, useState, useRef } from 'react';
import { useSelector } from "react-redux";
import Form, { 
  Item,
  GroupItem,
  SimpleItem,
  RequiredRule,
  StringLengthRule,
  PatternRule
  } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import { injectIntl } from "react-intl";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import HeaderInformation from "../../../../partials/components/HeaderInformation";
import { listarEstadoSimple,listarEstado, isNotEmpty,PatterRuler } from "../../../../../_metronic";


const FeriadoEditPage = (props) => {
    const { intl, modoEdicion,setLoading } = props;

    console.log("FeriadoEditPage|dateSelected:",props.dateSelected);

    const perfil = useSelector(state => state.perfil.perfilActual);
    const [estadoSimple, setEstadoSimple] = useState([]);
    const [estado, setEstado] = useState([]);

    async function cargarCombos() {
      let estadoSimple = listarEstadoSimple();
      let data = listarEstado();
      setEstadoSimple(estadoSimple);
      setEstado(data);
  }

function grabar(e) {
  let result = e.validationGroup.validate();
  if (result.isValid) {
    if (props.dataRowEditNew.esNuevoRegistro) {
      props.grabar(props.dataRowEditNew);
    } else {
      props.actualizar(props.dataRowEditNew);
    }
  }
}

// const isRequiredRule = (id) => {
//   return modoEdicion ? false : isRequired(id, settingDataField);
// }


    useEffect(() => {
       cargarCombos();
    }, []);
   
    /**************************************************************************************************** */

    return (
        <Fragment>
            <HeaderInformation
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
                                    visible={props.modoEdicion}

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

                  <Item
                  dataField="Mes"
                  label={{ text: intl.formatMessage({ id: "SYSTEM.COUNTRY.HOLIDAY.MONTH" }) }}
                  editorOptions={{
                    readOnly:true
                  }}
              />

                <Item
                  dataField="Dia"
                  label={{ text: intl.formatMessage({ id: "SYSTEM.COUNTRY.HOLIDAY.DAY" }) }}
                  editorOptions={{
                     readOnly:true
                  }}
              />

              <Item
                  dataField="Temporal"
                  label={{ text: intl.formatMessage({ id: "ADMINISTRATION.HOLIDAY.TEMPORARY" }) }}
                  editorType="dxSelectBox"
                  isRequired={modoEdicion}
                  editorOptions={{
                      items: estado,
                      valueExpr: "Valor",
                      displayExpr: "Descripcion",
                  }}
              />
           
              <Item dataField="Feriado"
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.HOLIDAY" }) }}
                isRequired={modoEdicion}
                // isRequired={modoEdicion ? isRequired('Feriado', settingDataField) : false}
                editorOptions={{
                  // readOnly: !(modoEdicion ? isModified('Feriado', settingDataField) : false),
                  maxLength: 50,
                  inputAttr: { 'style': 'text-transform: uppercase' },
                }}
              >
                {/* {(isRequiredRule("Feriado")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={100} />} */}
                <PatternRule pattern={PatterRuler.LETRAS_DESCRIPCION} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS" })} /> 
              </Item>

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
                      }}
                  />

            </GroupItem>
            </Form>

        </React.Fragment>
    </PortletBody>

        </Fragment >


    );
};

export default injectIntl(WithLoandingPanel(FeriadoEditPage));
