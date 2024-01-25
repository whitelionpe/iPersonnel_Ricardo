import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import Form, { Item, GroupItem, RequiredRule, PatternRule, StringLengthRule } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";

import { serviceEntidad } from "../../../../api/sistema/entidad.api";

import { listarEstadoSimple, PatterRuler } from "../../../../../_metronic";
import { isRequired, isModified } from "../../../../../_metronic/utils/securityUtils";
import { serviceTipoCredencial } from "../../../../api/identificacion/tipoCredencial.api";

import { serviceLocal } from "../../../../api/serviceLocal.api";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import { handleErrorMessages, handleSuccessMessages } from "../../../../store/ducks/notify-messages";


const TipoCredencialEditPage = props => {
  const { intl, modoEdicion, settingDataField, accessButton, setLoading, dataRowEditNew } = props;
  const [estadoSimple, setEstadoSimple] = useState([]);
  const classesEncabezado = useStylesEncabezado();
  const [entidades, setEntidades] = useState([]);


  async function cargarCombos() {
    let estadoSimple = listarEstadoSimple();
    let entidades = await serviceEntidad.obtenerTodos({ ImprimirFotocheck: "S" });

    setEstadoSimple(estadoSimple);
    setEntidades(entidades);
  }

  function grabar(e) {
    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (dataRowEditNew.esNuevoRegistro) {
        props.agregarTipoCredencial(dataRowEditNew);
      } else {
        props.actualizarTipoCredencial(dataRowEditNew);
      }
    }
  }

  const isRequiredRule = (id) => {
    return modoEdicion ? false : isRequired(id, settingDataField);
  }

  async function editarDisenio(e) {
    let result = e.validationGroup.validate();
    if (result.isValid) {
      //Obtener configuración inicial para generar Archivo .DAT
      //Call method editBadge 
      //Función para imprimir PrintBadge
      //1-Obtener estructura de datos de base de datos
      //2-LocalHost: Generar Archivos: XX.Data, imagen, .BAT
      //3-Abrir archivo programar PrintBadge.Exe 
      //4-Actualizar regisro como impreso.
      setLoading(true);
      //Get Data
      await serviceTipoCredencial.obtenerEditBadge(dataRowEditNew).then(async (data) => {
        //Print
        const { IdTipoCredencial } = dataRowEditNew;
        //console.log("obtenerEditBadge.response", data);
        await serviceLocal.EditBadge({ data, IdTipoCredencial }).then(response => {
          //console.log("response-localhost-printBadge-->", response);
          //if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.EDITBADGE.SUCESS" }));
        }).catch(err => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        });

      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
    }
  }

  async function uploadDisenio(e) {
    let result = e.validationGroup.validate();
    if (result.isValid) {
      //Subir archivo
      props.uploadFileDesign(dataRowEditNew);
    }
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
              icon="rename"
              type="default"
              hint={intl.formatMessage({ id: "ACTION.DESIGN.FOTOCHECK" })}
              onClick={editarDisenio}
              useSubmitBehavior={true}
              validationGroup="FormEdicion"
              visible={modoEdicion}
              disabled={dataRowEditNew.esNuevoRegistro ? true : false}
            //disabled={!accessButton.grabar}
            />
            &nbsp;

            <Button
              icon="fa fa-upload"
              type="default"
              hint={intl.formatMessage({ id: "ACTION.UPLOAD.FOTOCHECK" })}
              onClick={uploadDisenio}
              useSubmitBehavior={true}
              validationGroup="FormEdicion"
              visible={modoEdicion}
              disabled={dataRowEditNew.esNuevoRegistro ? true : false}
            //disabled={!accessButton.grabar}
            />
            &nbsp;
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
          <Form formData={dataRowEditNew} validationGroup="FormEdicion" >
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

              <Item dataField="IdTipoCredencial"
                label={{ text: intl.formatMessage({ id: "COMMON.CODE" }) }}
                //isRequired={true}
                editorOptions={{
                  maxLength: 10,
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  readOnly: true,//!dataRowEditNew.esNuevoRegistro ? true : false
                  placeholder: intl.formatMessage({ id: "COMMON.CODE.AUTO" }).toUpperCase()
                }}
              >
                <PatternRule pattern={PatterRuler.CODE} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS.NUMERIC" })} />
              </Item>

              <Item dataField="TipoCredencial"
                isRequired={modoEdicion ? isRequired('TipoCredencial', settingDataField) : false}
                label={{ text: intl.formatMessage({ id: "COMMON.DESCRIPTION" }) }}
                colSpan={2}
                editorOptions={{
                  maxLength: 50,
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  readOnly: !(modoEdicion ? isModified('TipoCredencial', settingDataField) : false)
                }}
              >
                {(isRequiredRule("TipoCredencial")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={50} />}
                <PatternRule pattern={PatterRuler.LETRAS_DESCRIPCION} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS.NUMERIC" })} />
              </Item>

              <Item
                dataField="IdEntidad"
                label={{ text: intl.formatMessage({ id: "IDENTIFICATION.CREDENTIALTYPE.ENTITY" }) }}
                editorType="dxSelectBox"
                isRequired={modoEdicion ? isRequired('IdEntidad', settingDataField) : false}
                editorOptions={{
                  items: entidades,
                  valueExpr: "IdEntidad",
                  displayExpr: "Entidad",
                  placeholder: "Seleccione una Entidad",
                  readOnly: (modoEdicion ? (dataRowEditNew.esNuevoRegistro ? false : true) : false) //!(modoEdicion ? isModified('IdEntidad', settingDataField) : false)
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
                  readOnly: !(modoEdicion ? (dataRowEditNew.esNuevoRegistro ? false : true) : false)
                }}
              />
              <Item dataField="IdCliente" visible={false} />


            </GroupItem>

          </Form>


          {/* <div className="col-12">
            <div className="row mt-3">
              <div className="col-12 col-md-6">
                <fieldset className="scheduler-border">
                  <legend className="scheduler-border" >
                    <h5> {intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.ACTIONS" })}</h5>
                  </legend>
                  <div className="row">
                    <div className="col-12">
                      <i className="dx-icon dx-icon-rename" />: {intl.formatMessage({ id: "ACTION.DESIGN.FOTOCHECK" })}
                    </div>
                    <div className="col-12">
                      <i className="fas fa-upload" />: {intl.formatMessage({ id: "ACTION.UPLOAD.FOTOCHECK" })}
                    </div>

                  </div>
                </fieldset>
              </div>
              <div className="col-12 col-md-6" />

            </div>
          </div> */}


        </React.Fragment>
      </PortletBody>
    </>
  );
};



export default injectIntl(WithLoandingPanel(TipoCredencialEditPage));
