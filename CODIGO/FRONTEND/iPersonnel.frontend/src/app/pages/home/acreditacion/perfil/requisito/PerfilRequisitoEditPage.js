import React, { useEffect, useState } from "react";
import Form, { Item, GroupItem, SimpleItem, PatternRule } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../../store/config/Styles";
import { injectIntl } from "react-intl";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";
import { isNotEmpty } from "../../../../../../_metronic";
import { listarEstadoSimple } from "../../../../../../_metronic/utils/utils";
import { handleInfoMessages } from "../../../../../store/ducks/notify-messages";
import AcreditacionRequisitoBuscar from "../../../../../partials/components/AcreditacionRequisitoBuscar";
import RequisitoDatoEvaluarListPage from "../../requisito/datoEvaluar/RequisitoDatoEvaluarListPage";

import {  listar } from "../../../../../api/acreditacion/requisitoDatoEvaluar.api";


const PerfilRequisitoEditPage = props => {
  const { intl, setLoading, modoEdicion, settingDataField } = props;
  const [estadoSimple, setEstadoSimple] = useState([]);
  const classesEncabezado = useStylesEncabezado();
  const [isVisiblePopUpRequisitos, setisVisiblePopUpRequisitos] = useState(false);
  const [listaDatosEvaluar, setListaDatosEvaluar] = useState([]);

  useEffect(() => {
    cargarCombos();
  }, []);

  async function cargarCombos() {
    let estadoSimple = listarEstadoSimple();
    setEstadoSimple(estadoSimple);
  }

  function grabar(e) {

    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregar(props.dataRowEditNew);
      } else {
        props.actualizar(props.dataRowEditNew);
      }
    }
  }

  async function agregar(dataPopup) {
    const { IdCliente, Requisito, IdRequisito, Orden } = dataPopup[0];

    console.log("agregar|dataPopup[0]:",dataPopup[0]);

    if (isNotEmpty(IdRequisito)) {
      props.dataRowEditNew.Requisito = Requisito;
      props.dataRowEditNew.IdRequisito = IdRequisito;
      props.dataRowEditNew.Orden = Orden;
      setisVisiblePopUpRequisitos(false);
      //Obtener dato a evaluar de acuerdo requisito seleccionado.
      obtenerDatoEvaluar({ IdCliente, IdRequisito });
    } else {
      handleInfoMessages(intl.formatMessage({ id: "MESSAGES.SELECT.ROW" }));
    }

  }

  async function obtenerDatoEvaluar(params) {
    setLoading(true);
    await listar(params).then(response => {
      setListaDatosEvaluar(response);
      console.log("obtenerDatoEvaluar|response:",response);
    }).finally(() => { setLoading(false); });

  }

  //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  return (
    <>

      <HeaderInformation data={props.getInfo()} visible={true} labelLocation={'left'} colCount={4}
        toolbar={
          <PortletHeader
            title=""
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
              <Item colSpan={2}>
                <AppBar position="static" className={classesEncabezado.secundario}>
                  <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                    <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                      {intl.formatMessage({ id: "COMMON.DETAIL" })}
                    </Typography>
                  </Toolbar>
                </AppBar>
              </Item>

              <SimpleItem dataField="IdCliente" visible={false}></SimpleItem>
              <SimpleItem dataField="IdPerfil" visible={false}></SimpleItem>
              <SimpleItem dataField="IdRequisito" visible={false}></SimpleItem>

              <Item
                colSpan={1} dataField="Requisito" isRequired={true} label={{ text: intl.formatMessage({ id: "ACCREDITATION.REQUIREMENT" }), }}
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
                          setisVisiblePopUpRequisitos(true);
                        },
                      },
                    },
                  ],
                }}
              />

              <Item
                dataField="Activo"
                label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
                editorType="dxSelectBox"
                isRequired={true}
                editorOptions={{
                  //readOnly: !props.modoEdicion,
                  items: estadoSimple,
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                  readOnly: props.dataRowEditNew.esNuevoRegistro ? true : !props.modoEdicion,
                }}
              />
            </GroupItem>
          </Form>
          {/*---SI NUEVO REGISTRO, MOSTAR DATO A EVALUAR--------------------------------- */}
          {props.dataRowEditNew.esNuevoRegistro && (<>
            <br />
            <br />
            <AppBar position="static" className={classesEncabezado.secundario}>
              <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                  {intl.formatMessage({ id: "COMMON.DETAIL" }) + " - " + intl.formatMessage({ id: "ACCREDITATION.DATAEVALUATE" })}
                </Typography>
              </Toolbar>
            </AppBar>
            <RequisitoDatoEvaluarListPage
              showButton={false}
              getInfo={{}}
              datosEvaluarDetalle={listaDatosEvaluar}
              verRegistroDblClick={() => { }}
              seleccionarRegistro={() => { }}
              focusedRowKey={0}
            />
          </>)
          }

          {/*---POPUP REQUISITOS   --------------------------------- */}
          <AcreditacionRequisitoBuscar
            selectData={agregar}
            showPopup={{ isVisiblePopUp: isVisiblePopUpRequisitos, setisVisiblePopUp: setisVisiblePopUpRequisitos }}
            cancelarEdicion={() => setisVisiblePopUpRequisitos(false)}
            selectionMode={"row"}
            IdEntidad={ props.dataRowEditNew.IdEntidad}
          />


        </React.Fragment>
      </PortletBody>
    </>
  );

};

export default injectIntl(WithLoandingPanel(PerfilRequisitoEditPage));

