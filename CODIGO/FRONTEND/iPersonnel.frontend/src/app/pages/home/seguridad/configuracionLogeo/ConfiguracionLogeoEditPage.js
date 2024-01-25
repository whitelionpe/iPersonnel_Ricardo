import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";

import Form, {
  Item,
  GroupItem,
  //SimpleItem,
  ButtonItem,
  RequiredRule,
  StringLengthRule,
  PatternRule,
  //Label
} from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";

import { listarTipoNivel, PatterRuler,isNotEmpty } from "../../../../../_metronic";
import { isRequired, isModified } from "../../../../../_metronic/utils/securityUtils";
import { handleErrorMessages, handleInfoMessages } from "../../../../store/ducks/notify-messages";

const ConfiguracionLogeoEditPage = props => {
  const { intl, accessButton, modoEdicion, settingDataField,setDataRowEditNew } = props;

  const classesEncabezado = useStylesEncabezado();
  const [tipoNiveles, setTipoNiveles] = useState([]);
  const [principal, setPrincipal] = useState(false);

  async function cargarCombos() {
    let tipoNiveles = listarTipoNivel;

    setTipoNiveles(tipoNiveles);
  }

  function grabar(e) {
    //PENDIENTE-> La deficion de valiacion campos {<Item> ocultando columnas como por ejemplo: NivelSeguridadClave,LongitudClave }
    //let result = e.validationGroup.validate();    
    //if (result.isValid) {
      //console.log("grabar|props.dataRowEditNew.DobleAutenticacion",props.dataRowEditNew.DobleAutenticacion);
      if(props.dataRowEditNew.DobleAutenticacion){
        if( (props.dataRowEditNew.DobleAutenticacionEmail === false) && (props.dataRowEditNew.DobleAutenticacionTelefono === false) ){
            handleInfoMessages(intl.formatMessage({ id: "SECURITY.SETTING.AUTHENTICATION.MODE.MSG" }));
            return;
        }
      }

      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregarConfiguracionLogeo(props.dataRowEditNew);
      } else {
        props.actualizarConfiguracionLogeo(props.dataRowEditNew);
      }
   //}

  }

  async function onValueChangedPrincipal(value) {
    setPrincipal(value);
  }

  async function onValueChangedDobleAutenticacion(e) {
    if(isNotEmpty(e.value)){
      setDataRowEditNew({
        ...props.dataRowEditNew,
        DobleAutenticacion:e.value,
        DobleAutenticacionEmail:false,
        DobleAutenticacionTelefono:false
      });
    }
  }

  const isRequiredRule = (id) => {
    return modoEdicion ? false : isRequired(id, settingDataField);
  }

  useEffect(() => {
    cargarCombos();
  }, []);


  const configruracionContrasenia = (e) => {
    return (
      <>

        <Form formData={props.dataRowEditNew} validationGroup="FormEdicion">
          <GroupItem itemType="group" colCount={4} >

            <Item colSpan={4}  
              label={{ text: intl.formatMessage({ id: "SECURITY.SETTING.LOGING.SECURITY.LEVEL" }) }}
               isRequired={modoEdicion ? isRequired('NivelSeguridadClave', settingDataField) : false}
            ></Item>
            <Item
              dataField="NivelSeguridadClave"
              label={{  visible: false }}
              editorType="dxSelectBox"
              // isRequired={modoEdicion ? isRequired('NivelSeguridadClave', settingDataField) : false}
              colSpan={4}
              editorOptions={{
                readOnly: !(modoEdicion ? isModified('NivelSeguridadClave', settingDataField) : false),
                items: tipoNiveles,
                valueExpr: "Valor",
                displayExpr: "Descripcion",
              }}
            />
            <Item colSpan={2}  
              label={{ text: intl.formatMessage({ id: "SECURITY.SETTING.LOGING.MINIMUM.KEY.LENGTH" }) }}
              isRequired={modoEdicion ? isRequired('LongitudClave', settingDataField) : false}
            ></Item>
            <Item
              dataField="LongitudClave"
              label={{  visible: false }}
              isRequired={modoEdicion ? isRequired('LongitudClave', settingDataField) : false}
              colSpan={2}
              editorType="dxNumberBox"
              dataType="number"
              editorOptions={{
                readOnly: !(modoEdicion ? isModified('LongitudClave', settingDataField) : false),
                inputAttr: { style: "text-transform: uppercase; text-align: right" },
                showSpinButtons: true,
                showClearButton: true,
                min:0
              }}
            >
              {/* <PatternRule pattern={/[0-9]/} message={intl.formatMessage({ id: "COMMON.ENTER.NUMERIC.DATA" })} /> */}
              <PatternRule pattern={PatterRuler.SOLO_NUMEROS} message={intl.formatMessage({ id: "COMMON.ENTER.NUMERIC.DATA" })} />

            </Item>

            <Item dataField="CambiarPrimeraClave"
              label={{
                text: "Check",
                visible: false
              }}
              editorType="dxCheckBox"
              isRequired={modoEdicion ? isRequired('CambiarPrimeraClave', settingDataField) : false}
              colSpan={4}
              editorOptions={{
                readOnly: !(modoEdicion ? isModified('CambiarPrimeraClave', settingDataField) : false),
                text: intl.formatMessage({ id: "SECURITY.SETTING.LOGING.INFORMATIVE.CHANGE.FIRST.KEY" }),
                width: "100%"
              }}
            />

            <Item dataField="CaducaClave"
              label={{
                text: "Check",
                visible: false
              }}
              editorType="dxCheckBox"
              isRequired={modoEdicion ? isRequired('CaducaClave', settingDataField) : false}
              colSpan={4}
              editorOptions={{
                readOnly: !(modoEdicion ? isModified('CaducaClave', settingDataField) : false),
                text: intl.formatMessage({ id: "SECURITY.SETTING.LOGING.INFORMATIVE.EXPIRE.KEY" }),
                width: "100%"
              }}
            />

            <Item colSpan={2}
              label={{ text: intl.formatMessage({ id: "SECURITY.SETTING.LOGING.INFORMATIVE.KEY.PERIOD" }) }}
            ></Item>
            <Item
              dataField="PeriodoClave"
              label={{ text: intl.formatMessage({ id: "SECURITY.SETTING.LOGING.INFORMATIVE.KEY.PERIOD" }), visible: false }}
              editorType="dxNumberBox"
              isRequired={modoEdicion ? isRequired('PeriodoClave', settingDataField) : false}
              colSpan={2}
              dataType="number"
              editorOptions={{
                readOnly: !(modoEdicion ? isModified('PeriodoClave', settingDataField) : false),
                inputAttr: { style: "text-transform: uppercase; text-align: right" },
                showSpinButtons: true,
                showClearButton: true,
                min:0
              }}
            >
              {/* <PatternRule pattern={/[0-9]/} message={intl.formatMessage({ id: "COMMON.ENTER.NUMERIC.DATA" })} /> */}
              <PatternRule pattern={PatterRuler.SOLO_NUMEROS} message={intl.formatMessage({ id: "COMMON.ENTER.NUMERIC.DATA" })} />
            </Item>
            <Item></Item>

          </GroupItem>
        </Form>
      </>
    );
  }
  
  const configuracionAcceso = (e) => {
    return (
      <>
        <Form formData={props.dataRowEditNew} validationGroup="FormEdicion">
          <GroupItem itemType="group" colCount={3}  >
            <Item colSpan={2}
              label={{ text: intl.formatMessage({ id: "SECURITY.SETTING.LOGING.INFORMATIVE.NUMBER.OF.ATTEMPTS" }) }}
              isRequired={modoEdicion ? isRequired('NumeroIntentosClave', settingDataField) : false}
            ></Item>
            <Item
              dataField="NumeroIntentosClave"
              label={{ text: intl.formatMessage({ id: "SECURITY.SETTING.LOGING.INFORMATIVE.NUMBER.OF.ATTEMPTS" }), visible: false }}
              isRequired={modoEdicion ? isRequired('NumeroIntentosClave', settingDataField) : false}

              editorType="dxNumberBox"
              dataType="number"
              editorOptions={{
                readOnly: !(modoEdicion ? isModified('NumeroIntentosClave', settingDataField) : false),
                inputAttr: { style: "text-transform: uppercase; text-align: right" },
                showSpinButtons: true,
                showClearButton: true,
                min:0

              }}
            >
              {/* <PatternRule pattern={/[0-9]/} message={intl.formatMessage({ id: "COMMON.ENTER.NUMERIC.DATA" })} /> */}
              <PatternRule pattern={PatterRuler.SOLO_NUMEROS} message={intl.formatMessage({ id: "COMMON.ENTER.NUMERIC.DATA" })} />
            </Item>
            <Item colSpan={2}
              label={{ text: intl.formatMessage({ id: "SECURITY.SETTING.LOGING.INFORMATIVE.UNLOCKING.TIME" }) }}
              isRequired={modoEdicion ? isRequired('TiempoDesbloqueoUsuario', settingDataField) : false}
            >
            </Item>
            <Item
              dataField="TiempoDesbloqueoUsuario"
              label={{ text: intl.formatMessage({ id: "SECURITY.SETTING.LOGING.INFORMATIVE.UNLOCKING.TIME" }), visible: false }}
              isRequired={modoEdicion ? isRequired('TiempoDesbloqueoUsuario', settingDataField) : false}

              editorType="dxNumberBox"
              dataType="number"
              editorOptions={{
                readOnly: !(modoEdicion ? isModified('TiempoDesbloqueoUsuario', settingDataField) : false),
                inputAttr: { style: "text-transform: uppercase; text-align: right" },
                showSpinButtons: true,
                showClearButton: true,
                min:0
              }}
            >
              {/* <PatternRule pattern={/[0-9]/} message={intl.formatMessage({ id: "COMMON.ENTER.NUMERIC.DATA" })} /> */}
              <PatternRule pattern={PatterRuler.SOLO_NUMEROS} message={intl.formatMessage({ id: "COMMON.ENTER.NUMERIC.DATA" })} />
            </Item>

            <Item colSpan={2}
              label={{ text: intl.formatMessage({ id: "SECURITY.SETTING.LOGING.INFORMATIVE.INACTIVATION.PERIOD" }) }}
              isRequired={modoEdicion ? isRequired('PeriodoInactivacion', settingDataField) : false}>
            </Item>
            <Item
              dataField="PeriodoInactivacion"
              label={{ text: intl.formatMessage({ id: "SECURITY.SETTING.LOGING.INFORMATIVE.INACTIVATION.PERIOD" }), visible: false }}
              isRequired={modoEdicion ? isRequired('PeriodoInactivacion', settingDataField) : false}
              editorType="dxNumberBox"
              dataType="number"
              editorOptions={{
                readOnly: !(modoEdicion ? isModified('PeriodoInactivacion', settingDataField) : false),
                inputAttr: { style: "text-transform: uppercase; text-align: right" },
                showSpinButtons: true,
                showClearButton: true,
                min:0
              }}
            >
              {/* <PatternRule pattern={/[0-9]/} message={intl.formatMessage({ id: "COMMON.ENTER.NUMERIC.DATA" })} /> */}
              <PatternRule pattern={PatterRuler.SOLO_NUMEROS} message={intl.formatMessage({ id: "COMMON.ENTER.NUMERIC.DATA" })} />
            </Item>

            <Item dataField="DobleAutenticacion"
              label={{
                text: "Check",
                visible: false
              }}
              editorType="dxCheckBox"
              colSpan={3}
              editorOptions={{
                //readOnly: !(modoEdicion ? isModified('DobleAutenticacion', settingDataField) : false),
                text: intl.formatMessage({ id: "SECURITY.SETTING.LOGING.AUTHENTICATION.DOUBLE" }),
                width: "100%",
                onValueChanged:(e) => onValueChangedDobleAutenticacion(e)
              }}
            />

            <Item dataField="DobleAutenticacionEmail"
              label={{
                text: "Check",
                visible: false
              }}
              editorType="dxCheckBox"
              //isRequired={modoEdicion ? isRequired('DobleAutenticacionEmail', settingDataField) : false}
              colSpan={3}
              editorOptions={{
               // readOnly: !(modoEdicion ? isModified('DobleAutenticacionEmail', settingDataField) : false),
                text: intl.formatMessage({ id: "SECURITY.SETTING.LOGING.AUTHENTICATION.MAIL" }),
                width: "100%",
                disabled: props.dataRowEditNew.DobleAutenticacion === true ? false: true ,
              }}
            />
            <Item dataField="DobleAutenticacionTelefono"
              label={{
                text: "Check",
                visible: false
              }}
              editorType="dxCheckBox"
              //isRequired={modoEdicion ? isRequired('DobleAutenticacionTelefono', settingDataField) : false}
              colSpan={3}
              editorOptions={{
                //readOnly: !(modoEdicion ? isModified('DobleAutenticacionTelefono', settingDataField) : false),
                text: intl.formatMessage({ id: "SECURITY.SETTING.LOGING.AUTHENTICATION.TELEPHONE" }),
                width: "100%",
                disabled: props.dataRowEditNew.DobleAutenticacion === true ? false: true,
              }}
            />
            <Item colSpan={4}>
            </Item>

          </GroupItem>
        </Form>
      </>
    );
  }

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
              //disabled={!accessButton.grabar}
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
            <GroupItem itemType="group" colCount={4} colSpan={4}>

              <GroupItem colSpan={4}>
                <AppBar position="static" className={classesEncabezado.secundario}>
                  <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                    <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                      {intl.formatMessage({ id: "COMMON.DETAIL" })}
                    </Typography>
                  </Toolbar>
                </AppBar>
              </GroupItem>

              <Item dataField="IdConfiguracionLogeo"
                label={{ text: intl.formatMessage({ id: "COMMON.CODE" }) }}
                isRequired={modoEdicion}
                colSpan={2}
                editorOptions={{
                  maxLength: 10,
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  readOnly: !props.dataRowEditNew.esNuevoRegistro ? true : false
                }}
              >
                <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} />
                <PatternRule pattern={PatterRuler.CODE} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS.NUMERIC" })} />
              </Item>

              <Item dataField="ConfiguracionLogeo"
                label={{ text: intl.formatMessage({ id: "COMMON.DESCRIPTION" }) }}
                isRequired={modoEdicion ? isRequired('ConfiguracionLogeo', settingDataField) : false}
                colSpan={2}
                editorOptions={{
                  readOnly: !(modoEdicion ? isModified('ConfiguracionLogeo', settingDataField) : false),
                  maxLength: 50,
                  inputAttr: { 'style': 'text-transform: uppercase' },
                }}
              >
                {(isRequiredRule("ConfiguracionLogeo")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={50} />}
                <PatternRule pattern={PatterRuler.LETRAS_DESCRIPCION} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS" })} />
              </Item>

              <GroupItem itemType="group" colCount={4} colSpan={4}>

                <GroupItem colSpan={2} >

                  <fieldset className="scheduler-border" >
                    <legend className="scheduler-border" >
                      <h5>{intl.formatMessage({ id: "SECURITY.SETTING.LOGING.PASSWORD.SETTING" })} </h5>
                    </legend>
                    {configruracionContrasenia()}
                  </fieldset>

                </GroupItem>

                <GroupItem colSpan={2}  >
                  <fieldset className="scheduler-border" >
                    <legend className="scheduler-border" >
                      <h5>{intl.formatMessage({ id: "SECURITY.SETTING.LOGING.ACCESS.SETTING" })} </h5>
                    </legend>
                    {configuracionAcceso()}
                  </fieldset>

                </GroupItem>
              </GroupItem>

              <Item dataField="Principal"
                label={{
                  text: "Check",
                  visible: false
                }}
                isRequired={modoEdicion ? isRequired('Principal', settingDataField) : false}
                editorType="dxCheckBox"
                colSpan={4}
                editorOptions={{
                  readOnly: !(modoEdicion ? isModified('Principal', settingDataField) : false),
                  value: props.dataRowEditNew.Principal,
                  onValueChanged: (e => onValueChangedPrincipal(e.value)),
                  text: intl.formatMessage({ id: "SECURITY.SETTING.LOGING.MAIN" }),
                  width: "100%"
                }}
              />

            </GroupItem>

          </Form>

        </React.Fragment>
      </PortletBody>
    </>
  );

};

export default injectIntl(ConfiguracionLogeoEditPage);
