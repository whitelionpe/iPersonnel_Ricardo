import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";//Multi-idioma
import Form, { Item, GroupItem } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../../store/config/Styles";
//import { service as serviceRequisito } from "../../../../api/acreditacion/requisito.api";
import AcreditacionRequisitoBuscar from "../../../../../partials/components/AcreditacionRequisitoBuscar";
import { handleInfoMessages } from "../../../../../store/ducks/notify-messages";
import { isNotEmpty } from "../../../../../../_metronic";

import { listar } from "../../../../../api/acreditacion/requisitoDatoEvaluar.api";
import WithLoandingPanel from "../../../../../partials/content/withLoandingPanel";
import RequisitoDatoEvaluarListPage from "../../requisito/datoEvaluar/RequisitoDatoEvaluarListPage";


const AutorizadorRequisitoEditPage = props => {

  const { intl, setLoading } = props;
  const classesEncabezado = useStylesEncabezado();
  const [isVisiblePopUpRequisitos, setisVisiblePopUpRequisitos] = useState(false);
  const [listaDatosEvaluar, setListaDatosEvaluar] = useState([]);


  function grabar(e) {
    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregarRegistro(props.dataRowEditNew);
      } else {
        //props.actualizarRegistro(props.dataRowEditNew);
      }
    }
  }

  function agregar(dataPopup) {
    const {IdCliente ,Requisito, IdRequisito, Orden } = dataPopup[0];

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
    }).finally(() => { setLoading(false); });

  }

  //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  useEffect(() => {
    //cargarCombos();
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
                      {intl.formatMessage({ id: "COMMON.DETAIL" })}
                    </Typography>
                  </Toolbar>
                </AppBar>
              </Item>
              <Item dataField="IdCliente" visible={false} />
              <Item dataField="IdAutorizador" visible={false} />
              <Item dataField="IdRequisito" visible={false} />
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


            </GroupItem>
          </Form>
          {/*---SI NUEVO REGISTRO, MOSTAR DATO A EVALUAR-++++++++++++++++++++++++++- */}
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

          {/* POPUP REQUISITOS   ++++++++++++++++++++++++++- */}
          <AcreditacionRequisitoBuscar
            selectData={agregar}
            showPopup={{ isVisiblePopUp: isVisiblePopUpRequisitos, setisVisiblePopUp: setisVisiblePopUpRequisitos }}
            cancelarEdicion={() => setisVisiblePopUpRequisitos(false)}
            selectionMode={"row"}
          />


        </React.Fragment>
      </PortletBody>
    </>
  );
};

export default injectIntl(WithLoandingPanel(AutorizadorRequisitoEditPage));
