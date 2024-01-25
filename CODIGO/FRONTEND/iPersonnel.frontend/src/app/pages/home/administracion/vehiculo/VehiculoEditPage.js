import React, { useEffect, useState, Fragment } from "react";
import { injectIntl } from "react-intl";
import { useSelector } from "react-redux";
import {
  PortletBody,
  PortletHeader,
  PortletHeaderToolbar,
} from "../../../../partials/content/Portlet";
import { Button } from "devextreme-react";

import Form, {
  Item,
  GroupItem,
  SimpleItem,
  RequiredRule,
  StringLengthRule,
  PatternRule
} from "devextreme-react/form";

import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";

//Api:
import { obtenerTodos as obtenerTodosTipoVehiculos } from "../../../../api/administracion/tipoVehiculo.api";
import { obtenerTodos as obtenerTodosMarcas } from "../../../../api/administracion/marca.api";
import { obtenerTodos as obtenerTodosMarcaModelo } from "../../../../api/administracion/marcaModelo.api";
import { obtenerTodos as obtenerTodosColor } from "../../../../api/administracion/color.api";
import { obtenerTodos as obtenerTodosCombustible } from "../../../../api/administracion/combustible.api";

import { listarEstadoSimple,listarEstado,PatterRuler } from "../../../../../_metronic";
import { isRequired, isModified } from "../../../../../_metronic/utils/securityUtils";


const VehiculoEditPage = (props) => {
  const classesEncabezado = useStylesEncabezado();
  const { intl, modoEdicion, settingDataField, accessButton } = props;
  const perfil = useSelector((state) => state.perfil.perfilActual);

  const [tipoVehiculos, setTipoVehiculos] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [colores, setColores] = useState([]);
  const [estadoSimple, setEstadoSimple] = useState([]);
  const [combustibles, setCombustibles] = useState([]);

  async function cargarCombos() {
    let estadoSimples = listarEstadoSimple();
    let tipoVehiculo = await obtenerTodosTipoVehiculos({
      IdCliente: perfil.IdCliente,
    });
    let marcas = await obtenerTodosMarcas({ IdCliente: perfil.IdCliente });

    let colores = await obtenerTodosColor({ IdCliente: perfil.IdCliente });
    let combustibles = await obtenerTodosCombustible({
      IdCliente: perfil.IdCliente,
    });

    setTipoVehiculos(tipoVehiculo);
    setMarcas(marcas);
    setColores(colores);
    setEstadoSimple(estadoSimples);
    setCombustibles(combustibles);

    if (!props.dataRowEditNew.esNuevoRegistro) {
      onValueChanged(props.dataRowEditNew.IdMarca);
    }
  }


  async function onValueChanged(valor) {
    let modelosData = await obtenerTodosMarcaModelo({
      IdCliente: perfil.IdCliente,
      IdMarca: valor,
      IdModelo: "%",
    });
    setModelos(modelosData);
  }

  function onInitializedMarca(e) {
    setTimeout(function () {
      e.component.focus();
    }, 0);
  }

  function getFormatMessage(strId) {
    return intl.formatMessage({ id: strId });
  }

  function grabar(e) {
    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregarVehiculo(props.dataRowEditNew);
      } else {
        props.actualizarVehiculo(props.dataRowEditNew);
      }
    }
  }

  const isRequiredRule = (id) => {
    return modoEdicion ? false : isRequired(id, settingDataField);
  }


  useEffect(() => {
    cargarCombos();
  }, []);

  return (
    <Fragment>
      <PortletHeader
        title={
          <>
            {props.titulo}{" "}
            <b style={{ color: "red" }}>
              {props.dataRowEditNew.Activo === "N"
                ? `- ${intl.formatMessage({
                  id: "ADMINISTRATION.VEHICLE.STATE.INACTIVE",
                })}`
                : ""}
            </b>{" "}
          </>
        }
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
      <PortletBody>
        <Form formData={props.dataRowEditNew} validationGroup="FormEdicion">
          <GroupItem itemType="group" colCount={2}>
            <Item colSpan={2}>
              <AppBar
                position="static"
                className={classesEncabezado.secundario}
              >
                <Toolbar variant="dense" className={classesEncabezado.toolbar}>
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

            <SimpleItem dataField="IdCliente" visible={false}></SimpleItem>
            <SimpleItem dataField="IdVehiculo" visible={false}></SimpleItem>

            <Item
              dataField="Placa"
              isRequired={modoEdicion}
              label={{
                text: intl.formatMessage({
                  id: "ADMINISTRATION.VEHICLE.PLATE",
                }),
              }}
              editorOptions={{
                maxLength: 20,
                inputAttr: { style: "text-transform: uppercase" },
                readOnly: !props.modoEdicion,
                tabIndex: 1
              }}
            >
              {(isRequiredRule("Placa")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={20} />}
              <PatternRule pattern={PatterRuler.CODE} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS.NUMERIC" })} />
            </Item>

            <Item
              dataField="IdTipoVehiculo"
              label={{ text: getFormatMessage("ADMINISTRATION.VEHICLE.TYPE") }}
              isRequired={modoEdicion ? isRequired('TipoModulo', settingDataField) : false}
              editorType="dxSelectBox"
              editorOptions={{
                items: tipoVehiculos,
                valueExpr: "IdTipoVehiculo",
                displayExpr: "TipoVehiculo",
                placeholder: "Seleccione..",
                readOnly: !props.modoEdicion,
                tabIndex: 2

              }}
            />

            <Item
              dataField="IdCombustible"
              label={{ text: getFormatMessage("ADMINISTRATION.VEHICLE.FUEL") }}
              editorType="dxSelectBox"
              isRequired={modoEdicion ? isRequired('TipoModulo', settingDataField) : false}
              editorOptions={{
                items: combustibles,
                valueExpr: "IdCombustible",
                displayExpr: "Combustible",
                placeholder: "Seleccione..",
                readOnly: !props.modoEdicion,
                tabIndex: 3

              }}
            />

            <Item
              dataField="IdMarca"
              label={{ text: getFormatMessage("ADMINISTRATION.VEHICLE.BRAND") }}
              editorType="dxSelectBox"
              isRequired={modoEdicion ? isRequired('TipoModulo', settingDataField) : false}
              editorOptions={{
                items: marcas,
                valueExpr: "IdMarca",
                displayExpr: "Marca",
                onValueChanged: (e) => onValueChanged(e.value),
                // onValueChanged : (e) =>  onValueChanged(e),
                placeholder: "Seleccione..",
                readOnly: !props.modoEdicion,
                tabIndex: 4,
                onInitialized: onInitializedMarca
              }}
            />

            <Item
              dataField="IdModelo"
              label={{ text: getFormatMessage("ADMINISTRATION.VEHICLE.MODEL") }}
              editorType="dxSelectBox"
              isRequired={modoEdicion ? isRequired('IdModelo', settingDataField) : false}
              editorOptions={{
                items: modelos,
                valueExpr: "IdModelo",
                displayExpr: "Modelo",
                placeholder: "Seleccione..",
                readOnly: !(modoEdicion ? isModified('IdModelo', settingDataField) : false),
                tabIndex: 5
              }}
            />

            <Item
              dataField="IdColor"
              label={{ text: getFormatMessage("ADMINISTRATION.VEHICLE.COLOR") }}
              editorType="dxSelectBox"
              isRequired={modoEdicion ? isRequired('IdColor', settingDataField) : false}
              editorOptions={{
                items: colores,
                valueExpr: "IdColor",
                displayExpr: "Color",
                placeholder: "Seleccione..",
                readOnly: !(modoEdicion ? isModified('IdColor', settingDataField) : false),
                tabIndex: 6
              }}
            />

            <Item
              dataField="Potencia"
              isRequired={modoEdicion ? isRequired('Potencia', settingDataField) : false}
              label={{
                text: intl.formatMessage({
                  id: "ADMINISTRATION.VEHICLE.POWER",
                }),
              }}
              editorOptions={{
                maxLength: 50,
                inputAttr: { style: "text-transform: uppercase" },
                readOnly: !(modoEdicion ? isModified('Potencia', settingDataField) : false),
                tabIndex: 7
              }}
            >
              {(isRequiredRule("Potencia")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={50} />}
              <PatternRule pattern={PatterRuler.LETRAS_DESCRIPCION} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS.NUMERIC" })} />
            </Item>

            <Item
              dataField="Anno"
              isRequired={modoEdicion ? isRequired('Anno', settingDataField) : false}
              label={{
                text: intl.formatMessage({
                  id: "ADMINISTRATION.VEHICLE.YEAR"
                }),
              }}
              editorOptions={{
                maxLength: 5,
                inputAttr: { style: "text-transform: uppercase" },
                mask: "0000",
                maskRules: { X: /^\d+$/ },
                readOnly: !(modoEdicion ? isModified('Anno', settingDataField) : false),
                tabIndex: 8
              }}
            />

            <Item
              dataField="Serie"
              isRequired={modoEdicion ? isRequired('Serie', settingDataField) : false}
              label={{
                text: intl.formatMessage({
                  id: "ADMINISTRATION.VEHICLE.SERIE"
                }),
              }}
              editorOptions={{
                maxLength: 20,
                inputAttr: { style: "text-transform: uppercase" },
                readOnly: !(modoEdicion ? isModified('Serie', settingDataField) : false),
                tabIndex: 9
              }}
            >
              {(isRequiredRule("Serie")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={20} />}
              <PatternRule pattern={PatterRuler.LETRAS_NUMEROS} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS.NUMERIC" })} />
            </Item>


            <Item
              dataField="FechaRegistro"
              isRequired={modoEdicion ? isRequired('TipoModulo', settingDataField) : false}
              label={{
                text: intl.formatMessage({
                  id: "ADMINISTRATION.VEHICLE.REGISTERDATE",
                }),
              }}
              editorType="dxDateBox"
              dataType="datetime"
              editorOptions={{
                inputAttr: { style: "text-transform: uppercase" },
                displayFormat: "dd/MM/yyyy",
                readOnly: !(modoEdicion ? isModified('FechaRegistro', settingDataField) : false),
                tabIndex: 10
              }}
            />


          <Item
              dataField="NumAsientos"
              label={{ text:intl.formatMessage({ id: "ADMINISTRATION.VEHICLE.NUMBEROFSEATS" })}}
              isRequired={modoEdicion ? isRequired('NumAsientos', settingDataField) : false}
              editorType="dxNumberBox"
              dataType="number"
              editorOptions={{
                inputAttr: { style: "text-transform: uppercase; text-align: right",},
                showSpinButtons: true,
                showClearButton: false,
                readOnly: !(modoEdicion ? isModified('NumAsientos', settingDataField) : false),
                maxLength: 2,
                min: 0,
                max: 100,
                tabIndex: 11
              }}
          />

          <Item
              dataField="TransportePasajeros"
              label={{ text:intl.formatMessage({ id: "ADMINISTRATION.VEHICLE.PASSENGER.TRANSPORTATION" })}}
              isRequired={modoEdicion ? isRequired('TransportePasajeros', settingDataField) : false}
              editorType="dxSelectBox"
              editorOptions={{
                items: listarEstado(),
                valueExpr: "Valor",
                displayExpr: "Descripcion",
                placeholder: "Seleccione..",
                readOnly: !(modoEdicion ? isModified('NumAsientos', settingDataField) : false),
                tabIndex: 12
              }}
            />

            <Item
              dataField="Activo"
              label={{ text: getFormatMessage("ADMINISTRATION.VEHICLE.STATE") }}
              editorType="dxSelectBox"
              isRequired={modoEdicion}
              editorOptions={{
                items: estadoSimple,
                valueExpr: "Valor",
                displayExpr: "Descripcion",
                readOnly: !(modoEdicion ? (props.dataRowEditNew.esNuevoRegistro ? false : true) : false),
                placeholder: "Seleccione..",
                tabIndex: 13
              }}
            />
          </GroupItem>
        </Form>
      </PortletBody>
    </Fragment>
  );
};

export default injectIntl(VehiculoEditPage);
