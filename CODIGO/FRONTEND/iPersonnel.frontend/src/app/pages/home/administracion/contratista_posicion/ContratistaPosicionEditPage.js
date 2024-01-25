import React, { useEffect, useState, Fragment } from "react";

import { useSelector } from "react-redux";
import Form, { 
  Item,
  GroupItem,
  RequiredRule,
  StringLengthRule,
  PatternRule
  } from "devextreme-react/form";
import { Button } from "devextreme-react";
import {
  PortletBody,
  PortletHeader,
  PortletHeaderToolbar,
} from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";

import { obtenerTodos as obtenerCmbTipoPosicion } from "../../../../api/administracion/tipoPosicion.api";
import { obtenerTodos as obtenerCmbFuncion } from "../../../../api/administracion/funcion.api";
import { obtenerTodos as obtenerTodosDivisiones } from "../../../../api/sistema/division.api";
import { handleInfoMessages } from "../../../../store/ducks/notify-messages";
import { injectIntl } from "react-intl";
import AdministracionPosicionBuscar from "../../../../partials/components/AdministracionPosicionBuscar";
import AdministracionUnidadOrganizativaBuscar from "../../../../partials/components/AdministracionUnidadOrganizativaBuscar";

import { listarEstadoSimple,listarEstado, PatterRuler,isNotEmpty } from "../../../../../_metronic";
import { isRequired,isModified} from "../../../../../_metronic/utils/securityUtils";

const ContratistaPosicionEditPage = (props) => {
  const { intl,  modoEdicion, settingDataField, accessButton  } = props;

  const { IdCliente } = useSelector((state) => state.perfil.perfilActual);
  const [estadoSimple, setEstadoSimple] = useState([]);
  const classesEncabezado = useStylesEncabezado();
  const [cmbTipoPosicion, setCmbTipoPosicion] = useState([]);
  const [cmbFuncion, setCmbFuncion] = useState([]);
  const [cmbDivisiones, setCmbDivisiones] = useState([]);
  const [popupVisiblePosicion, setPopupVisiblePosicion] = useState(false);
  const [popupVisibleUnidad, setPopupVisibleUnidad] = useState(false);
  const [filtroLocal, setFiltroLocal] = useState({
    IdCliente, IdDivision: "", IdUnidadOrganizativa: "", IdFuncion: "", IdTipoPosicion: ""
  });

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
    await obtenerCmbFuncion({ IdCliente, Contratista: 'S' }).then(cmbFuncion => {
      setCmbFuncion(cmbFuncion);
    });
    setEstadoSimple(estadoSimple);


  }

  function grabar(e) {
    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregarPosicion(props.dataRowEditNew);
      } else {
        props.actualizarPosicion(props.dataRowEditNew);
      }
    }
  }

  /*********************************************** */

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


  /*********************************************** */

  const isRequiredRule = (id) => {
    return modoEdicion ? false : isRequired(id, settingDataField);
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
            <Fragment>
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
            </Fragment>
          </PortletHeaderToolbar>
        }
      />
      <PortletBody>
        <React.Fragment>
          <Form formData={props.dataRowEditNew} validationGroup="FormEdicion">
            <GroupItem itemType="group" colCount={2} colSpan={2}>
              <Item colSpan={2}>
                <AppBar
                  position="static"
                  className={classesEncabezado.secundario}
                >
                  <Toolbar
                    variant="dense"
                    className={classesEncabezado.toolbar}
                  >
                    <Typography
                      variant="h6"
                      color="inherit"
                      className={classesEncabezado.title}
                    >
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
                  maxLength: 10,
                  inputAttr: { style: "text-transform: uppercase" },
                  readOnly: props.dataRowEditNew.esNuevoRegistro ? false : true, //Si no es nuevo
                }}
                >
                <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} />
                <PatternRule pattern={PatterRuler.CODE} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS.NUMERIC" })} />
              </Item>

              <Item
                dataField="Posicion"
                isRequired={modoEdicion ? isRequired('Posicion', settingDataField) : false}
                label={{
                  text: intl.formatMessage({ id: "ADMINISTRATION.POSITION" }),
                }}
                editorOptions={{
                  maxLength: 100,
                  inputAttr: { style: "text-transform: uppercase" },
                  readOnly: !(modoEdicion ? isModified('Posicion', settingDataField) : false),
                }}
                >
                <PatternRule pattern={PatterRuler.LETRAS_DESCRIPCION} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS" })} />
              </Item>

              <Item
                dataField="IdDivision"
                isRequired={modoEdicion ? isRequired('IdDivision', settingDataField) : false}
                label={{
                  text: intl.formatMessage({
                    id: "SYSTEM.DIVISION",
                  }),
                }}
                editorType="dxSelectBox"
                editorOptions={{
                  items: cmbDivisiones,
                  valueExpr: "IdDivision",
                  displayExpr: "Division",
                  showClearButton: true,
                  readOnly: !(modoEdicion ? isModified('IdDivision', settingDataField) : false),
                }}
              />

              {/* <Item
                dataField="UnidadOrganizativa"
                isRequired={modoEdicion ? isRequired('UnidadOrganizativa', settingDataField) : false}
                label={{
                  text: intl.formatMessage({
                    id: "ADMINISTRATION.POSITION.ORGANIZATIONALUNIT",
                  }),
                }}
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
              /> */}

              <Item
                dataField="IdTipoPosicion"
                isRequired={modoEdicion ? isRequired('IdTipoPosicion', settingDataField) : false}
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
                  readOnly: !(modoEdicion ? isModified('IdTipoPosicion', settingDataField) : false),
                }}
              />

              <Item
                dataField="IdFuncion"
                isRequired={modoEdicion ? isRequired('IdFuncion', settingDataField) : false}
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
                  readOnly: !(modoEdicion ? isModified('IdFuncion', settingDataField) : false),
                }}
              />

                <Item
                  dataField="Activo"
                  label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
                  editorType="dxSelectBox"
                  isRequired={true}
                  editorOptions={{
                    items: estadoSimple,
                    valueExpr: "Valor",
                    displayExpr: "Descripcion",
                    disabled: props.dataRowEditNew.esNuevoRegistro ? true : !props.modoEdicion
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
          {/*******>POPUP DE UNIDAD ORGA. CON POSICIONES>******** */}
          <AdministracionPosicionBuscar
            selectData={agregarPopupPosicion}
            showPopup={{ isVisiblePopUp: popupVisiblePosicion, setisVisiblePopUp: setPopupVisiblePosicion }}
            cancelar={() => setPopupVisiblePosicion(false)}
            filtro={filtroLocal}
          />


        </React.Fragment>
      </PortletBody>
    </>
  );
};

export default injectIntl(ContratistaPosicionEditPage);
