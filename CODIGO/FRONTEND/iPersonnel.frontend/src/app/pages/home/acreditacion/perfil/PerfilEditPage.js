import React, { useEffect, useState } from "react";
import Form, {
  Item,
  GroupItem,
  SimpleItem,
  RequiredRule,
  StringLengthRule,
  PatternRule,
  EmptyItem
} from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";
import { injectIntl } from "react-intl";

import { serviceEntidad } from "../../../../api/sistema/entidad.api";
import { obtenerTodos as obtenerTodosPerfilAcceso } from "../../../../api/acceso/perfil.api";
import { obtener as obtenerModulo } from "../../../../api/sistema/modulo.api";

import { listarEstadoSimple, listarTipoOperacionAcreditacion, PatterRuler, listarEstado, isNotEmpty } from "../../../../../_metronic";
import { isRequired, isModified } from "../../../../../_metronic/utils/securityUtils";
import AccesoPerfilBuscar from "../../../../partials/components/AccesoPerfilBuscar";


const PerfilEditPage = props => {
  const { intl, modoEdicion, settingDataField, IdCliente } = props;
  const [estadoSimple, setEstadoSimple] = useState([]);
  const [entidades, setEntidades] = useState([]);
  const [tipoOperacion, setTipoOperacion] = useState([]);
  const [perfilAcceso, setPerfilAcceso] = useState([]);
  const [perfilAccesoFiltrado, setPerfilAccesoFiltrado] = useState([]);

  const classesEncabezado = useStylesEncabezado();
  const [readOnlyVisit, setReadOnlyVisit] = useState(false);
  const [viewPerfilAcceso, setViewPerfilAcceso] = useState(false);
  const [isVisiblePopUpPerfil, setisVisiblePopUpPerfil] = useState(false);
  const isRequiredRule = (id) => {
    return modoEdicion ? false : isRequired(id, settingDataField);
  }

  useEffect(() => {
    cargarCombos();
    if (props.dataRowEditNew.IdEntidad) {
      //console.log("props.dataRowEditNew.Visita",props.dataRowEditNew.IdEntidad) ;
      onValueChangedVisita(props.dataRowEditNew.IdEntidad);
    }

  }, []);

  async function cargarCombos() {
    let estadoSimple = listarEstadoSimple();
    setEstadoSimple(estadoSimple);

    let entidad = await serviceEntidad.obtenerTodos({ ImprimirFotocheck: "" });
    setEntidades(entidad);

    let tipoOperacion = await listarTipoOperacionAcreditacion();
    setTipoOperacion(tipoOperacion);


    let modulo = await obtenerModulo({ IdCliente, IdModulo: '04' });
    setViewPerfilAcceso(!!modulo);
    if (!!modulo) {
      let tmpPerfilAcceso = await obtenerTodosPerfilAcceso({ IdCliente });
      setPerfilAcceso(tmpPerfilAcceso);

      if (!!props.dataRowEditNew.IdEntidad) {
        setViewPerfilAcceso(props.dataRowEditNew.IdEntidad !== "C");
        setPerfilAccesoFiltrado(tmpPerfilAcceso.filter(x => x.IdEntidad === props.dataRowEditNew.IdEntidad));
      }
    }
  }

  async function onValueChangedVisita(value) {
    //console.log("onValueChangedVisita", value);

    if (value !== props.dataRowEditNew.IdPerfilAcceso) {
      props.setDataRowEditNew(prev => ({ ...prev, IdPerfilAcceso: '', PerfilAcceso: '' }));
    }

    setViewPerfilAcceso(value !== "C"); //Compañia se deshabilita 
    setPerfilAccesoFiltrado(perfilAcceso.filter(x => x.IdEntidad === value));
    if (value === "P") {
      setReadOnlyVisit(true);
    } else {
      setReadOnlyVisit(false);
      props.dataRowEditNew.Visita = 'N';
    }
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

  const agregar = (dataPopup) => {
    const { IdPerfil, Perfil } = dataPopup[0];
    setisVisiblePopUpPerfil(false);
    if (isNotEmpty(IdPerfil)) {
      props.setDataRowEditNew({
        ...props.dataRowEditNew,
        IdPerfilAcceso: IdPerfil,
        PerfilAcceso: Perfil,
      });
    }
  };

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

              <GroupItem colCount={2} colSpan={2} >
                <GroupItem colCount={1}>
                  <Item dataField="IdPerfil"
                    isRequired={true}
                    label={{ text: intl.formatMessage({ id: "COMMON.CODE" }) }}
                    editorOptions={{
                      maxLength: 20,
                      inputAttr: { 'style': 'text-transform: uppercase' },
                      readOnly: !props.dataRowEditNew.esNuevoRegistro,
                    }}
                  >
                    <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} />
                    <PatternRule pattern={PatterRuler.CODE} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS.NUMERIC" })} />
                  </Item>


                  <Item dataField="Perfil"
                    isRequired={true}
                    label={{ text: intl.formatMessage({ id: "ACCREDITATION.PROFILE" }) }}
                    editorOptions={{
                      maxLength: 50,
                      inputAttr: { 'style': 'text-transform: uppercase' },
                      readOnly: !props.modoEdicion,
                    }}
                  >
                    {<RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} />}
                    <PatternRule pattern={PatterRuler.LETRAS_DESCRIPCION} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS" })} />
                  </Item>

                  <Item
                    dataField="IdEntidad"
                    label={{ text: intl.formatMessage({ id: "ACCREDITATION.REQUIREMENT.ENTITY" }) }}
                    editorType="dxSelectBox"
                    isRequired={true}
                    editorOptions={{
                      items: entidades,
                      valueExpr: "IdEntidad",
                      displayExpr: "Entidad",
                      readOnly: !props.dataRowEditNew.esNuevoRegistro,
                      placeholder: "Seleccione..",
                      onValueChanged: (e) => {
                        onValueChangedVisita(e.value);
                      }
                    }}
                  />
                  <Item dataField="Descripcion"
                    isRequired={modoEdicion ? isRequired('Descripcion', settingDataField) : false}
                    label={{ text: intl.formatMessage({ id: "COMMON.DESCRIPTION" }) }}
                    // colSpan={2}
                    editorType="dxTextArea"
                    editorOptions={{
                      readOnly: !(modoEdicion ? isModified('Descripcion', settingDataField) : false),
                      maxLength: 500,
                      height: 100,
                      inputAttr: { 'style': 'text-transform: uppercase' },
                    }}
                  >
                    {<RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} />}
                    <PatternRule pattern={PatterRuler.LETRAS_DESCRIPCION} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS" })} />
                  </Item>
                </GroupItem>
                <GroupItem colCount={1}>
                  <Item
                    dataField="TipoOperacion"
                    label={{ text: intl.formatMessage({ id: "ACCREDITATION.REQUIREMENT.OPERATIONTYPE" }) }}
                    editorType="dxSelectBox"
                    isRequired={modoEdicion ? isRequired('TipoOperacion', settingDataField) : false}
                    editorOptions={{
                      items: tipoOperacion,
                      valueExpr: "Valor",
                      displayExpr: "Descripcion",
                      readOnly: !(modoEdicion ? isModified('TipoOperacion', settingDataField) : false),
                    }}
                  />


                  <Item dataField="Alias"
                    //isRequired={modoEdicion ? isRequired('Alias', settingDataField) : false}
                    label={{ text: intl.formatMessage({ id: "SYSTEM.CUSTOMER.NICKNAME" }) }}
                    editorOptions={{
                      maxLength: 50,
                      inputAttr: { 'style': 'text-transform: uppercase' },
                      readOnly: !props.modoEdicion,
                    }}
                  >
                    {<RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} />}
                    <PatternRule pattern={PatterRuler.LETRAS_DESCRIPCION} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS" })} />
                  </Item>


                  <Item
                    dataField="Visita"
                    label={{ text: intl.formatMessage({ id: "ACREDITATION.VISIT" }) }}
                    editorType="dxSelectBox"
                    isRequired={modoEdicion}
                    editorOptions={{
                      //value: isNotEmpty(props.dataRowEditNew.TerminaEjecutarse) ? props.dataRowEditNew.TerminaEjecutarse : terminaEjecutarseValue,
                      items: listarEstado(),
                      valueExpr: "Valor",
                      displayExpr: "Descripcion",
                      readOnly: props.dataRowEditNew.esNuevoRegistro && readOnlyVisit ? false : (!props.dataRowEditNew.esNuevoRegistro && readOnlyVisit) ? false : true,
                    }}
                  />
                  {/* <Item
                    dataField="IdPerfilAcceso"
                    label={{ text: intl.formatMessage({ id: "ACCESS.PERSON.ACCESS_PROFILE" }) }}
                    editorType="dxSelectBox"
                    isRequired={false}
                    editorOptions={{
                      items: perfilAccesoFiltrado,
                      valueExpr: "IdPerfil",
                      displayExpr: "Perfil",
                      readOnly: !modoEdicion ? true : !viewPerfilAcceso
                    }}
                  /> */}

                  <Item dataField="PerfilAcceso" with="50"
                    isRequired={!modoEdicion ? true : !viewPerfilAcceso}
                    label={{ text: intl.formatMessage({ id: "ACCESS.PERSON.ACCESS_PROFILE" }) }}
                    editorOptions={{
                      readOnly: true,
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
                          disabled: !modoEdicion ? true : !viewPerfilAcceso,
                          onClick: () => {
                            setisVisiblePopUpPerfil(true);
                          },
                        }
                      }]

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
                      readOnly: props.dataRowEditNew.esNuevoRegistro ? true : !props.modoEdicion,
                    }}
                  />
                </GroupItem>
              </GroupItem>





            </GroupItem>
          </Form>

          {isVisiblePopUpPerfil && (
            <AccesoPerfilBuscar
              dataSource={perfilAccesoFiltrado}
              selectData={agregar}
              showPopup={{ isVisiblePopUp: isVisiblePopUpPerfil, setisVisiblePopUp: setisVisiblePopUpPerfil }}
              cancelarEdicion={() => setisVisiblePopUpPerfil(false)}
              selectionMode={"row"}
            />
          )}

        </React.Fragment>
      </PortletBody>
    </>
  );

};

export default injectIntl(PerfilEditPage);
