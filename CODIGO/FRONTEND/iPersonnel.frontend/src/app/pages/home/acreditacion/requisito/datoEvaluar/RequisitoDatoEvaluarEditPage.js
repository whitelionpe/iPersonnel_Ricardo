import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Form, { Item, GroupItem, SimpleItem, PatternRule } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../../store/config/Styles";
import { injectIntl } from "react-intl";
//import PropTypes from 'prop-types'
//import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";
//import { isNotEmpty } from "../../../../../../_metronic";
import { isNotEmpty } from "../../../../../../_metronic";
import { listarEstadoSimple } from "../../../../../../_metronic/utils/utils";

//import { listar as listarDatoEvaluar } from "../../../../../api/acreditacion/datosEvaluar.api";
import { isRequired, isModified } from "../../../../../../_metronic/utils/securityUtils";
import AcreditacionDatoEvaluarBuscar from "../../../../../partials/components/AcreditacionDatoEvaluarBuscar";


const RequisitoDatoEvaluarEditPage = props => {

  const { intl, modoEdicion, settingDataField } = props;
  const [estadoSimple, setEstadoSimple] = useState([]);
  const [datosEvaluar, setDatosEvaluar] = useState([]);
  const classesEncabezado = useStylesEncabezado();
  //const [currentEditorType, setCurrentEditorType] = useState("dxTextBox");
  //const [isVisibleValorDefecto, setIsVisibleValorDefecto] = useState(true);
  const perfil = useSelector(state => state.perfil.perfilActual);

  const [isVisiblePopUpDatoEvaluar, setisVisiblePopUpDatoEvaluar] = useState(false);
  const [filtroLocal, setFiltroLocal] = useState({
    IdDatoEvaluar: "",
    IdEntidad: props.varTipoEntidad
  });

  //datosEvaluar
  useEffect(() => {
    cargarCombos();
  }, []);

  async function cargarCombos() {
    let estadoSimple = listarEstadoSimple();
    //let datoEvaluar = await listarDatoEvaluar({ IdCliente: perfil.IdCliente });

    setEstadoSimple(estadoSimple);
    //setDatosEvaluar(datoEvaluar);
  }


  const agregar = (dataPopup) => {
    const { IdDatoEvaluar, DatoEvaluar, Tipo } = dataPopup[0];
    setisVisiblePopUpDatoEvaluar(false);
    if (isNotEmpty(IdDatoEvaluar)) {
      props.setDataRowEditNew({
        ...props.dataRowEditNew,
        IdDatoEvaluar: IdDatoEvaluar,
        DatoEvaluar: DatoEvaluar,
        Tipo: Tipo
      });
      console.log("setDataRowEditNew", props.setDataRowEditNew);
    }
    console.log("setDataRowEditNew", props.setDataRowEditNew);
  };


  function grabar(e) {

    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregarDatoEvaluar(props.dataRowEditNew);
      } else {
        props.actualizarDatoEvaluar(props.dataRowEditNew);
      }
    }
  }

  return (
    <>

      {props.showButton && (
        <HeaderInformation data={props.getInfo()} visible={true} labelLocation={'left'} colCount={3}
          toolbar={
            <PortletHeader
              title=""
              toolbar={
                <PortletHeaderToolbar>
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
                </PortletHeaderToolbar>
              }
            />

          } />)}

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
              <SimpleItem dataField="IdRequisito" visible={false}></SimpleItem>
              <SimpleItem dataField="IdDatoEvaluar" visible={false}></SimpleItem>

              <Item dataField="DatoEvaluar" with="50"
                isRequired={modoEdicion}
                label={{ text: intl.formatMessage({ id: "ACCREDITATION.DATAEVALUATE" }) }}
                editorOptions={{
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
                      readOnly: props.dataRowEditNew.esNuevoRegistro ? true : false,
                      onClick: () => {
                        setisVisiblePopUpDatoEvaluar(true);
                      },

                    }
                  }]
                }}
              />

              <Item
                dataField="Orden"
                label={{ text: intl.formatMessage({ id: "ACCREDITATION.REQUIREMENT.ORDER" }) }}
                isRequired={modoEdicion ? isRequired("Orden", settingDataField) : false}
                editorType="dxNumberBox"
                dataType="number"
                editorOptions={{
                  readOnly: !(modoEdicion ? isModified("Orden", settingDataField) : false),
                  inputAttr: { style: "text-transform: uppercase; text-align: right" },
                  showSpinButtons: true,
                  showClearButton: true,
                  min: 0
                }}
              >
                <PatternRule
                  pattern={/[0-9]/}
                  message={intl.formatMessage({ id: "COMMON.ENTER.NUMERIC.DATA" })}
                />
              </Item>
              <Item />
              <Item
                dataField="Activo"
                label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
                editorType="dxSelectBox"
                isRequired={true}
                editorOptions={{
                  readOnly: !props.modoEdicion,
                  items: estadoSimple,
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                  readOnly: props.dataRowEditNew.esNuevoRegistro ? true : !props.modoEdicion,
                }}
              />

            </GroupItem>
          </Form>


          {/*** PopUp -> Buscar Rquisitos ****/}
          {isVisiblePopUpDatoEvaluar && (
            <AcreditacionDatoEvaluarBuscar
              dataSource={datosEvaluar}
              selectData={agregar}
              showPopup={{ isVisiblePopUp: isVisiblePopUpDatoEvaluar, setisVisiblePopUp: setisVisiblePopUpDatoEvaluar }}
              cancelarEdicion={() => setisVisiblePopUpDatoEvaluar(false)}
              selectionMode={"row"}
              filtro={filtroLocal}
              varIdRequisito={props.varIdRequisito}
            />
          )}

        </React.Fragment>
      </PortletBody>
    </>
  );

};

export default injectIntl(RequisitoDatoEvaluarEditPage);
