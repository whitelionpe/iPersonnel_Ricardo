import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import Form, {
  Item,
  GroupItem,
  RequiredRule,
  StringLengthRule,
  PatternRule
} from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";

import { listarEstadoSimple, PatterRuler, isNotEmpty } from "../../../../../_metronic";
import { isRequired, isModified } from "../../../../../_metronic/utils/securityUtils";

import { obtenerTodos as obtenerCmbTipoPosicion } from "../../../../api/administracion/tipoPosicion.api";
import { obtenerTodos as obtenerCmbFuncion } from "../../../../api/administracion/funcion.api";
import { obtenerTodos as obtenerPosicion } from "../../../../api/administracion/posicion.api";
import { obtenerTodos as obtenerTodosDivisiones } from "../../../../api/sistema/division.api";
import { handleInfoMessages } from "../../../../store/ducks/notify-messages";
import AdministracionPosicionBuscar from "../../../../partials/components/AdministracionPosicionBuscar";
import AdministracionUnidadOrganizativaBuscar from "../../../../partials/components/AdministracionUnidadOrganizativaBuscar";
import { useSelector } from "react-redux";

const PosicionEditPage = props => {

  const { intl, modoEdicion, settingDataField, accessButton } = props;

  const { IdCliente } = useSelector((state) => state.perfil.perfilActual);
  const [estadoSimple, setEstadoSimple] = useState([]);
  const classesEncabezado = useStylesEncabezado();
  const [cmbTipoPosicion, setCmbTipoPosicion] = useState([]);
  const [cmbFuncion, setCmbFuncion] = useState([]);
  const [cmbDivisiones, setCmbDivisiones] = useState([]);
  //const [popupVisiblePosicion, setPopupVisiblePosicion] = useState(false);
  const [popupVisibleUnidad, setPopupVisibleUnidad] = useState(false);
 /*  const [filtroLocal, setFiltroLocal] = useState({
    IdCliente, IdDivision: "", IdUnidadOrganizativa: "", IdFuncion: "", IdTipoPosicion: ""
  }); */


  async function cargarCombos() {
    let estadoSimple = listarEstadoSimple();
    //Listar divisiones
    await obtenerTodosDivisiones({
      IdCliente,
    }).then(divisiones => {
      setCmbDivisiones(divisiones);
    });
    //Listar Tipo posicion
    await obtenerCmbTipoPosicion({
      IdCliente,
    }).then(cmbTipoPosicion => {
      setCmbTipoPosicion(cmbTipoPosicion);
    });
    //Listar Funciones
    await obtenerCmbFuncion({ IdCliente }).then(cmbFuncion => {
      setCmbFuncion(cmbFuncion);
    });
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

  const isRequiredRule = (id) => {
    return modoEdicion ? false : isRequired(id, settingDataField);
  }


  const selectUnidadOrganizativa = async (dataPopup) => {

    const { IdUnidadOrganizativa, UnidadOrganizativa } = dataPopup;
    props.dataRowEditNew.IdUnidadOrganizativa = IdUnidadOrganizativa;
    props.dataRowEditNew.UnidadOrganizativa = UnidadOrganizativa;
    setPopupVisibleUnidad(false);


  };

  const agregarPopupPosicion = (pposiciones) => {
    const { IdPosicion, Posicion } = pposiciones[0];

    props.dataRowEditNew.IdPosicionPadre = IdPosicion;
    props.dataRowEditNew.PosicionPadre = Posicion;

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
              id="idGrabarUO"
              icon="fa fa-save"
              type="default"
              hint={intl.formatMessage({ id: "ACTION.RECORD" })}
              useSubmitBehavior={true}
              disabled={!props.modoEdicion}
              validationGroup="FormEdicion"
              onClick={grabar}
              visible={false}
            />
            &nbsp;
            <Button
              icon="fa fa-times-circle"
              type="normal"
              hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
              onClick={props.cancelarEdicion}
              disabled={!props.modoEdicion}
              visible={false}
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
              <Item dataField="IdUnidadOrganizativa" visible={false} />
              <Item dataField="IdPosicionPadre" visible={false} />


              <Item
                dataField="IdPosicion"
                label={{ text: intl.formatMessage({ id: "COMMON.CODE" }) }}
                isRequired={true}
                editorOptions={{
                  maxLength: 20,
                  inputAttr: { style: "text-transform: uppercase" },
                  readOnly: props.dataRowEditNew.esNuevoRegistro ? false : true,
                }}
              >
                <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} />
                <PatternRule pattern={PatterRuler.CODE} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS.NUMERIC" })} />
              </Item>

              <Item />

              <Item
                dataField="Posicion"
                isRequired={true}
                label={{
                  text: intl.formatMessage({ id: "ADMINISTRATION.POSITION" }),
                }}
                colSpan={2}
                editorOptions={{
                  maxLength: 100,
                  inputAttr: { style: "text-transform: uppercase" },
                  readOnly: !props.modoEdicion,
                }}
              >
                {(isRequiredRule("Posicion")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={100} />}
                <PatternRule pattern={PatterRuler.LETRAS_DESCRIPCION} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS" })} />
              </Item>

              <Item
                dataField="IdTipoPosicion"
                label={{
                  text: intl.formatMessage({
                    id: "ADMINISTRATION.POSITION.POSITIONTYPE",
                  }),
                }}
                editorType="dxSelectBox"
                editorOptions={{
                  items: cmbTipoPosicion,
                  valueExpr: "IdTipoPosicion",
                  displayExpr: "TipoPosicion",
                  showClearButton: true,
                  readOnly: !props.modoEdicion,
                }}
              />

              <Item
                dataField="IdDivision"
                label={{text: intl.formatMessage({    id: "SYSTEM.DIVISION" }) }}
                editorType="dxSelectBox"
                editorOptions={{
                  items: cmbDivisiones,
                  valueExpr: "IdDivision",
                  displayExpr: "Division",
                  showClearButton: true,
                  readOnly: !props.modoEdicion,
                }}
              />
              <Item
                dataField="UnidadOrganizativa"
                label={{ text: intl.formatMessage({id: "ADMINISTRATION.ORGANIZATIONALUNIT.COSTCENTER.UO.TAB" })  }}
                colSpan={2}
                editorOptions={{
                  //readOnly: true,
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
                        disabled: props.dataRowEditNew.esNuevoRegistro
                          ? false
                          : !props.modoEdicion,
                        onClick: () => {
                          setPopupVisibleUnidad(true);
                        },
                      },
                    },
                  ],
                }}
              />


              <Item
                dataField="IdFuncion"
                label={{
                  text: intl.formatMessage({
                    id: "ADMINISTRATION.POSITION.FUNCTION",
                  }),
                }}
                editorType="dxSelectBox"
                editorOptions={{
                  items: cmbFuncion,
                  valueExpr: "IdFuncion",
                  displayExpr: "Funcion",
                  showClearButton: true,
                  readOnly: !props.modoEdicion,
                }}
              />

            </GroupItem>


            <GroupItem itemType="group" colCount={2} colSpan={2}>
              <GroupItem cssClass={"card"} colSpan={1} >
                <GroupItem cssClass={"card-body"} >
                  <Item
                    dataField="Contratista"
                    label={{
                      text: "Check",
                      visible: false
                    }}
                    editorType="dxCheckBox"
                    editorOptions={{
                      value:
                        props.dataRowEditNew.Contratista === "S" ? true : false,
                      readOnly: !props.modoEdicion,
                      text: intl.formatMessage({ id: "ACCESS.PERSON.POSITION.CONTRACTOR" }),
                      width: "100%"
                    }}
                  />

                  <Item
                    dataField="Fiscalizable"
                    label={{
                      text: "Check",
                      visible: false
                    }}
                    editorType="dxCheckBox"
                    editorOptions={{
                      value:
                        props.dataRowEditNew.Fiscalizable === "S" ? true : false,
                      readOnly: !props.modoEdicion,
                      text: intl.formatMessage({ id: "ADMINISTRATION.POSITION.CONTROLLABLE" }),
                      width: "100%"
                    }}
                  />

                  <Item
                    dataField="Confianza"
                    label={{
                      text: "Check",
                      visible: false
                    }}
                    editorType="dxCheckBox"
                    editorOptions={{
                      value: props.dataRowEditNew.Confianza === "S" ? true : false,
                      readOnly: !props.modoEdicion,
                      text: intl.formatMessage({ id: "ADMINISTRATION.POSITION.TRUST" }),
                      width: "100%"
                    }}
                  />

                </GroupItem>

              </GroupItem>

              <Item
                dataField="Activo"
                label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
                editorType="dxSelectBox"
                isRequired={true}
                colSpan={1}
                editorOptions={{
                  items: estadoSimple,
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                  disabled: props.dataRowEditNew.esNuevoRegistro ? true : !props.modoEdicion
                }}
              />
            </GroupItem>



            <GroupItem itemType="group" colCount={2} colSpan={2}>
              <Item
                dataField="nombresPersonaAsigando"
                label={{
                  text: intl.formatMessage({ id: "ADMINISTRATION.POSITION.ASSIGNED" }),
                }}
                colSpan={2}
                editorOptions={{
                  inputAttr: { style: "text-transform: uppercase" },
                  disabled: true,
                }}
              />

              <Item
                dataField="PosicionPadre"
                label={{
                  text: intl.formatMessage({ id: "ADMINISTRATION.POSITION.IMMEDIATE.BOSS" }),
                }}
                colSpan={2}
                editorOptions={{
                  maxLength: 100,
                  inputAttr: { style: "text-transform: uppercase" },
                  disabled: true,
                }}
              />
            </GroupItem>


          </Form>

          {/*******>POPUP DE UNIDAD ORGA.>******** */}
          <AdministracionUnidadOrganizativaBuscar
            selectData={selectUnidadOrganizativa}
            showPopup={{ isVisiblePopUp: popupVisibleUnidad, setisVisiblePopUp: setPopupVisibleUnidad }}
            cancelarEdicion={() => setPopupVisibleUnidad(false)}
          />


        </React.Fragment>
      </PortletBody>
    </>
  );
};

export default injectIntl(PosicionEditPage);
