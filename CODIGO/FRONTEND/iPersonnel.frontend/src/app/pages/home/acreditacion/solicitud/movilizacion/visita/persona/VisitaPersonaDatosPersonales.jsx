import React, { Fragment, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";
import { WithLoandingPanel } from "../../../../../../../partials/content/withLoandingPanel";
import { Popup } from "devextreme-react/popup";
import PropTypes from "prop-types";
import Form, {
  Item,
  GroupItem,
  PatternRule,
  RequiredRule,
  EmailRule,
  StringLengthRule,
  EmptyItem
} from "devextreme-react/form";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../../../../store/config/Styles";
import {
  listarEstado,
  listarEstadoSimple,
  PatterRuler,
  isNotEmpty,
  dateFormat
} from "../../../../../../../../_metronic";

//import * '../../../../../../_metronic';
import { obtenerTodos as obtenerTodosLicencias } from "../../../../../../../api/sistema/licenciaConducir.api";

import ImageViewer from "../../../../../../../partials/content/ImageViewer/ImageViewer";
import CustomTabNav from "../../../../../../../partials/content/Acreditacion/CustomTabNav/CustomTabNav";

import {
  createItem,
  createItemAutorizador
} from "../../../../../../../partials/content/Acreditacion/DynamicColumns";

import {
  PortletBody,
  PortletHeader,
  PortletHeaderToolbar
} from "../../../../../../../partials/content/Portlet";
import { Button } from "devextreme-react";

import {
  handleErrorMessages,
  handleSuccessMessages
} from "../../../../../../../store/ducks/notify-messages";

import {
  obtener as obtenerDetalle,
  downloadFile as downloadFileDetalle,
  actualizarrequisitos
} from "../../../../../../../api/acreditacion/visitaPersonaDetalle.api";
import FieldsetAcreditacion from '../../../../../../../partials/content/Acreditacion/FieldsetAcreditacion/FieldsetAcreditacion';

const VisitaPersonaDatosPersonales = props => {
  const classesEncabezado = useStylesEncabezado();
  const { intl, modoEdicion } = props;

  const [settingDataField, setSettingDataField] = useState([]);
  const [maxLengthDocumento, setMaxLengthDocumento] = useState(20);
  const [estadoDiscapacidad, setEstadoDiscapacidad] = useState([]);
  const [valueEdad, setValueEdad] = useState(0);

  const [estadoSimple, setEstadoSimple] = useState([]);
  const [flUpdateImage, setFlUpdateImage] = useState(false);
  const [viewpopup, setViewpopup] = useState(false);
  const tipoDocumentos = props.tipoDocumentos;
  const sexoSimple = props.sexoSimple;
  //-----------------------------------------------------------------------
  //Foto:
  const [currentImagePersona, setCurrentImagePersona] = useState(
    props.dataRowEditNew.Foto
  );

  //---------------------------------------------------------
  const [mascara, setMascara] = useState("");
  const [reglas, setReglas] = useState("");

  const isRequiredAccreditation = fieldName => {
    let valor = settingDataField.filter(
      x => x.IdDato.toUpperCase() === fieldName.toUpperCase()
    );

    if (valor.length > 0) {
      return valor[0].Obligatorio === "S";
    }
    return false; //Si no existe configuracion no es obligatorio
  };

  const isModifiedAccreditation = fieldName => {
    let valor = settingDataField.filter(
      x => x.IdDato.toUpperCase() === fieldName.toUpperCase()
    );

    if (valor.length > 0) {
      return modoEdicion ? valor[0].Editable === "S" : false;
    }

    return false; //Si no existe configuracion se deshabilita
  };

  const isRequiredRuleAccreditation = id => {
    return modoEdicion ? false : isRequiredAccreditation(id);
  };

  const onValueChangedTipoDocumento = e => {
    const resultado = tipoDocumentos.find(x => x.IdTipoDocumento === e.value);
    if (resultado) {
      setMaxLengthDocumento(resultado.Longitud);

      if (resultado.Mascara !== "") {
        setMascara(resultado.Mascara);
      } else {
        setMascara("");
      }

      if (resultado.CaracteresPermitidos !== "") {
        if (PatterRuler.hasOwnProperty(resultado.CaracteresPermitidos)) {
          setReglas(PatterRuler[resultado.CaracteresPermitidos]);
        } else {
          setReglas("");
        }
      } else {
        setReglas("");
      }
    } else {
      setMaxLengthDocumento(20);
    }
  };

  const onValueChangedFechaNacimiento = e => {
    let FechaNacimiento = new Date(e.value);
    let FechaActual = new Date();
    let edad = FechaActual.getFullYear() - FechaNacimiento.getFullYear();

    if (e.value != null) {
      setValueEdad(edad);
    } else {
      setValueEdad(0);
    }
  };
  return (
    <Fragment>
      <FieldsetAcreditacion title={intl.formatMessage({ id: "ACCREDITATION.PEOPLE.EDIT" })}>
        <Form formData={props.dataRowEditNew} validationGroup="FormEdicion">
          <GroupItem itemType="group" colSpan={2} colCount={2}>
            <Item
              dataField="IdTipoDocumento"
              label={{
                text: intl.formatMessage({
                  id: "ADMINISTRATION.PERSON.DOCUMENT.TYPE"
                })
              }}
              editorType="dxSelectBox"
              isRequired={isRequiredAccreditation("IdTipoDocumento")}
              editorOptions={{
                items: tipoDocumentos,
                valueExpr: "IdTipoDocumento",
                displayExpr: "TipoDocumento",
                searchEnabled: true,
                placeholder: "Seleccione..",
                showClearButton: true,
                inputAttr: { style: "text-transform: uppercase" },
                readOnly: !modoEdicion
                  ? true
                  : !props.permisosDatosPersona.IDTIPODOCUMENTO,
                onValueChanged: onValueChangedTipoDocumento
              }}
            />

            <Item rowSpan={6}>
              <Fragment>
                <ImageViewer
                  // setImagedLoad={cargarFotoSeleccionada}
                  defaultImage={currentImagePersona}
                  setFlUpdate={setFlUpdateImage}
                  flUpdate={flUpdateImage}
                  width={192}
                  height={192}
                  editImage={false}
                  intl={intl}
                />
              </Fragment>
            </Item>

            <Item
              dataField="Documento"
              isRequired={isRequiredAccreditation("Documento")}
              label={{
                text: intl.formatMessage({
                  id: "ADMINISTRATION.PERSON.DOCUMENT"
                })
              }}
              editorOptions={{
                maxLength: maxLengthDocumento,
                inputAttr: { style: "text-transform: uppercase" },
                readOnly: !modoEdicion
                  ? true
                  : !props.permisosDatosPersona.DOCUMENTO,
                mask: mascara
              }}
            >
              {isRequiredRuleAccreditation("Documento") ? (
                <RequiredRule
                  message={intl.formatMessage({
                    id: "COMMON.ISREQUIERD"
                  })}
                />
              ) : (
                <StringLengthRule max={20} />
              )}

              <PatternRule pattern={reglas} message={"Valor incorrecto"} />

              {/* {
                         reglas !== "" ?
                             <PatternRule pattern={reglas} message={"Valor incorrecto"} />
                             : null
                     } */}
            </Item>
            <EmptyItem />
            <Item
              dataField="Apellido"
              isRequired={isRequiredAccreditation("Apellido")}
              label={{
                text: intl.formatMessage({
                  id: "ADMINISTRATION.PERSON.SURNAMES"
                })
              }}
              editorOptions={{
                maxLength: 50,
                inputAttr: { style: "text-transform: uppercase" },
                readOnly: !modoEdicion
                  ? true
                  : !props.permisosDatosPersona.APELLIDO
              }}
            >
              {isRequiredRuleAccreditation("Apellido") ? (
                <RequiredRule
                  message={intl.formatMessage({
                    id: "COMMON.ISREQUIERD"
                  })}
                />
              ) : (
                <StringLengthRule max={50} />
              )}
              <PatternRule
                pattern={PatterRuler.SOLO_LETRAS}
                message={intl.formatMessage({
                  id: "COMMON.ENTER.LETTERS"
                })}
              />
            </Item>
            <EmptyItem />
            <Item
              dataField="Nombre"
              isRequired={isRequiredAccreditation("Nombre")}
              label={{
                text: intl.formatMessage({
                  id: "ADMINISTRATION.PERSON.NAME"
                })
              }}
              editorOptions={{
                maxLength: 50,
                inputAttr: { style: "text-transform: uppercase" },
                readOnly: !modoEdicion ? true : !props.permisosDatosPersona.NOMBRE
              }}
            >
              {isRequiredRuleAccreditation("Nombre") ? (
                <RequiredRule
                  message={intl.formatMessage({
                    id: "COMMON.ISREQUIERD"
                  })}
                />
              ) : (
                <StringLengthRule max={50} />
              )}
              <PatternRule
                pattern={PatterRuler.SOLO_LETRAS}
                message={intl.formatMessage({
                  id: "COMMON.ENTER.LETTERS"
                })}
              />
            </Item>
            <EmptyItem />
            <Item
              dataField="Sexo"
              isRequired={isRequiredAccreditation("Sexo")}
              label={{
                text: intl.formatMessage({
                  id: "ADMINISTRATION.PERSON.GENDER"
                })
              }}
              editorType="dxSelectBox"
              editorOptions={{
                items: sexoSimple,
                valueExpr: "Valor",
                displayExpr: "Descripcion",
                placeholder: "Seleccione..",
                showClearButton: true,
                inputAttr: { style: "text-transform: uppercase" },
                readOnly: !modoEdicion ? true : !props.permisosDatosPersona.SEXO
              }}
            />
            <EmptyItem />
            <Item
              dataField="TelefonoMovil"
              isRequired={isRequiredAccreditation("TelefonoMovil")}
              label={{
                text: intl.formatMessage({
                  id: "ADMINISTRATION.PERSON.MOBILE.PHONE"
                })
              }}
              editorOptions={{
                maxLength: 20,
                inputAttr: { style: "text-transform: uppercase" },
                readOnly: !modoEdicion
                  ? true
                  : !props.permisosDatosPersona.TELEFONOMOVIL
              }}
            >
              {isRequiredRuleAccreditation("TelefonoMovil") ? (
                <RequiredRule
                  message={intl.formatMessage({
                    id: "COMMON.ISREQUIERD"
                  })}
                />
              ) : (
                <StringLengthRule max={20} />
              )}
              <PatternRule
                pattern={PatterRuler.SOLO_NUMEROS}
                message={intl.formatMessage({
                  id: "COMMON.ENTER.NUMERIC.DATA"
                })}
              />
            </Item>

            <Item
              dataField="Direccion"
              isRequired={isRequiredAccreditation("Direccion")}
              label={{
                text: intl.formatMessage({
                  id: "ADMINISTRATION.PERSON.ADDRESS"
                })
              }}
              colSpan={2}
              editorOptions={{
                maxLength: 500,
                inputAttr: { style: "text-transform: uppercase" },
                readOnly: !modoEdicion
                  ? true
                  : !props.permisosDatosPersona.DIRECCION
              }}
            />

            <Item
              dataField="FechaNacimiento"
              isRequired={isRequiredAccreditation("FechaNacimiento")}
              label={{
                text: intl.formatMessage({
                  id: "ACCREDITATION.EDIT.BIRTHDAY"
                })
              }}
              editorType="dxDateBox"
              dataType="date"
              editorOptions={{
                displayFormat: "dd/MM/yyyy",
                showClearButton: false,
                inputAttr: { style: "text-transform: uppercase" },
                readOnly: !modoEdicion
                  ? true
                  : !props.permisosDatosPersona.FECHANACIMIENTO,
                onValueChanged: onValueChangedFechaNacimiento
              }}
            />
            <Item
              dataField="Edad"
              label={{
                text: intl.formatMessage({
                  id: "ADMINISTRATION.PERSON.AGE"
                })
              }}
              editorOptions={{
                disabled: true,
                inputAttr: { style: "text-transform: uppercase" },
                readOnly: !modoEdicion
                  ? true
                  : !props.permisosDatosPersona.FECHANACIMIENTO,
                value: props.dataRowEditNew.esNuevoRegistro
                  ? valueEdad
                  : valueEdad > 0
                    ? valueEdad
                    : props.dataRowEditNew.Edad
              }}
            >
              {isRequiredRuleAccreditation("FechaNacimiento") ? (
                <RequiredRule
                  message={intl.formatMessage({
                    id: "COMMON.ISREQUIERD"
                  })}
                />
              ) : (
                <StringLengthRule max={200} />
              )}
              <PatternRule
                pattern={PatterRuler.SOLO_NUMEROS}
                message={intl.formatMessage({
                  id: "COMMON.ENTER.NUMERIC.DATA"
                })}
              />
            </Item>

            <Item
              dataField="CompaniaContratista"
              label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.COMPANY" }) }}
              editorOptions={{
                inputAttr: { style: "text-transform: uppercase" },
                readOnly: true
              }}
            />

            <Item
              dataField="Email"
              isRequired={isRequiredAccreditation("Email")}
              label={{
                text: intl.formatMessage({
                  id: "ADMINISTRATION.PERSON.MAIL"
                })
              }}
              editorOptions={{
                maxLength: 50,
                inputAttr: { style: "text-transform: uppercase" },
                readOnly: !modoEdicion ? true : !props.permisosDatosPersona.EMAIL
              }}
            >
            </Item>
          </GroupItem>
        </Form>
      </FieldsetAcreditacion>
    </Fragment>
  );
};

export default VisitaPersonaDatosPersonales;
