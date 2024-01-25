import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import Form, {
  Item,
  GroupItem,
  SimpleItem,
  ButtonItem,
  RequiredRule,
  StringLengthRule,
  PatternRule
} from "devextreme-react/form";
import { Button, TabPanel } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderPopUp, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";

import { isNotEmpty, listarEstadoSimple, PatterRuler } from "../../../../../_metronic";
import { isRequired, isModified } from "../../../../../_metronic/utils/securityUtils";
import DataGrid, { Column, Paging, Summary, TotalItem } from "devextreme-react/data-grid";
import FieldsetAcreditacion from '../../../../partials/content/Acreditacion/FieldsetAcreditacion/FieldsetAcreditacion';


const AprobadorHHEEEditPage = props => {

  const { intl, modoEdicion, settingDataField, accessButton, listaPerfilCombo } = props;

  const [estadoSimple, setEstadoSimple] = useState([]);
  const [listaPerfiles, setListaPerfiles] = useState([]);
  const classesEncabezado = useStylesEncabezado();
  const [labelPerfil, setLabelPerfil] = useState("");

  async function cargarCombos() {
    let estadoSimple = listarEstadoSimple();
    setEstadoSimple(estadoSimple);

    if (isNotEmpty(listaPerfilCombo)) {
      setListaPerfiles(listaPerfilCombo);
    } else {
      setListaPerfiles([]);
    }

  }

  function grabar(e) {
    let result = e.validationGroup.validate();
    if (result.isValid) {

      if (props.dataRowEditNew.esNuevoRegistro) {
        // props.agregar(props.dataRowEditNew);
      } else {
        props.actualizar(props.dataRowEditNew);
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
    <>
      <React.Fragment>

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


        <TabPanel id="tabPanel">
          <Item title={intl.formatMessage({ id: "TRANSPORTE.MANIFEST.INFORMATION" })}
            icon="floppy">


            <PortletBody>

              <AppBar position="static" className={classesEncabezado.secundario}>
                <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                  <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                    {intl.formatMessage({ id: "COMMON.DETAIL" })}
                  </Typography>
                </Toolbar>
              </AppBar>

              &nbsp;

              <FieldsetAcreditacion title={intl.formatMessage({ id: "ASSISTANCE.PROFILE.DETAIL" })}>
                <Form formData={props.dataRowEditNew} validationGroup="FormEdicion" >
                  <GroupItem itemType="group" colCount={2} colSpan={2}>
                    <Item colSpan={2}>
                      <PortletHeaderPopUp
                        title={""}
                        toolbar={
                          <PortletHeaderToolbar>

                            {/* <Button
                              id="idGrabarPerfil"
                              icon="fa fa-save"
                              type="default"
                              hint={intl.formatMessage({ id: "ACTION.RECORD" })}
                              useSubmitBehavior={true}
                              disabled={false} //props.modoEdicion
                              validationGroup="FormEdicion"
                              onClick={grabar}
                              visible={true}
                            /> */}

                          </PortletHeaderToolbar>
                        }
                      />

                    </Item>
                    <Item dataField="IdCliente" visible={false} />
                    <Item dataField="IdPerfilPadre" visible={false} />
                    <Item dataField="IdPerfil"
                      label={{ text: intl.formatMessage({ id: "COMMON.CODE" }) }}
                      isRequired={true}
                      colSpan={2}
                      editorOptions={{
                        readOnly: !props.modoEdicion,
                        maxLength: 20,
                        inputAttr: { 'style': 'text-transform: uppercase' },
                        disabled: !props.dataRowEditNew.esNuevoRegistro ? true : false
                      }}
                    >
                      <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} />
                      <PatternRule pattern={PatterRuler.CODE} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS.NUMERIC" })} />
                    </Item>
                    {/* //ACCREDITATION.PROFILE.APPROVER */}
                    <Item dataField="Perfil"
                      isRequired={true}
                      label={{
                        text: props.dataRowEditNew.CantidadHijos ?? 0 > 0 ? intl.formatMessage({ id: "ACCREDITATION.PROFILE.APPROVER" })
                          : intl.formatMessage({ id: "ACCREDITATION.PROFILE.APPLICANT" })
                      }}
                      colSpan={2}
                      editorOptions={{
                        readOnly: true,//!props.modoEdicion,//LSF
                        maxLength: 100,
                        inputAttr: { 'style': 'text-transform: uppercase' },
                      }}
                    >
                      {(isRequiredRule("TipoModulo")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={100} />}
                      <PatternRule pattern={PatterRuler.LETRAS_DESCRIPCION} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS.NUMERIC" })} />
                    </Item>

                    <Item
                      dataField="Activo"
                      label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
                      colSpan={2}
                      editorType="dxSelectBox"
                      isRequired={true}
                      editorOptions={{
                        readOnly: true,//!props.modoEdicion,//LSF
                        items: estadoSimple,
                        valueExpr: "Valor",
                        displayExpr: "Descripcion",
                        disabled: props.dataRowEditNew.esNuevoRegistro ? true : false
                      }}
                    />

                    <Item dataField="Nivel"
                      isRequired={true}
                      label={{
                        text: intl.formatMessage({ id: "ASSISTANCE.PROFILE.APPROVER_LEVEL" })
                      }}
                      colSpan={2}
                      editorOptions={{
                        readOnly: true,//!props.modoEdicion,//LSF
                        maxLength: 100,
                        inputAttr: { 'style': 'text-transform: uppercase' },
                        disabled: props.dataRowEditNew.esNuevoRegistro ? true : false
                      }}
                    >
                    </Item>

                    <Item dataField="AutorizacionAutomatica"
                      isRequired={false}
                      label={{
                        text: intl.formatMessage({ id: "ASSISTANCE.PROFILE.AUTORIZACION_AUTO" })
                      }}
                      editorType="dxCheckBox"
                      colSpan={2}
                      editorOptions={{
                        readOnly: true,// !props.modoEdicion,//LSF
                        value: props.dataRowEditNew.AutorizacionAutomatica === "S" ? true : false,
                        // text: intl.formatMessage({ id: "ACCESS.REPORT.CURRENT.VALIDITY" }),
                        width: "100%",
                        disabled: props.dataRowEditNew.esNuevoRegistro ? true : false
                      }}
                    />

                    <Item
                      dataField="IdPerfilPadre"
                      label={{ text: intl.formatMessage({ id: "ASSISTANCE.PROFILE.FATHER_PROFILE" }) }}
                      colSpan={2}
                      editorType="dxSelectBox"
                      // isRequired={true}
                      editorOptions={{
                        readOnly:  !props.modoEdicion,
                        items: listaPerfilCombo,
                        showClearButton: true,
                        searchEnabled: true,
                        valueExpr: "IdPerfil",
                        displayExpr: "Perfil",
                        disabled: false,//props.dataRowEditNew.esNuevoRegistro ? true : false
                        noDataText: intl.formatMessage({ id: "ASSISTANCE.PERSON.JUSTIFICATION.NO_DATA" }) //ASSISTANCE.PERSON.JUSTIFICATION.NO_DATA
                      }}
                    />

                  </GroupItem>
                </Form>
              </FieldsetAcreditacion>

              <FieldsetAcreditacion title={intl.formatMessage({ id: "ASSISTANCE.PROFILE.USERS_ASSOCIATED" })}>
                <DataGrid
                  dataSource={props.perfilesUsuarios}
                  showBorders={true}
                  focusedRowEnabled={true}
                  keyExpr="RowIndex"
                  noDataText={intl.formatMessage({ id: "ASSISTANCE.PERSON.JUSTIFICATION.NO_DATA" })}
                >
                  <Column dataField="RowIndex" caption="#" width={"5%"} alignment={"center"} />
                  <Column dataField="IdPersona" caption={intl.formatMessage({ id: "ACCESS.PERSON.PROFILE.CODE" })} width={"10%"} alignment={"center"} />
                  <Column dataField="NombreCompleto" caption={intl.formatMessage({ id: "SECURITY.USER.FULLNAME" })} visible={true} width={"35%"} alignment={"left"} />
                  <Column dataField="Posicion" caption={intl.formatMessage({ id: "ADMINISTRATION.ORGANIZATIONALUNIT.POSITIONS.TAB" })} visible={true} width={"25%"} alignment={"left"} />
                  <Column dataField="UnidadOrganizativa" caption={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.UNIDADORGANIZATIVA.ABR" })} width={"25%"} />

                  <Summary>
                    <TotalItem
                      cssClass="classColorPaginador_"
                      column="NombreCompleto"
                      summaryType="count"
                      displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
                    />
                  </Summary>
                  <Paging defaultPageSize={10} />

                </DataGrid>
              </FieldsetAcreditacion>

            </PortletBody>
          </Item>

          <Item title={intl.formatMessage({ id: "CONFIG.MENU.ADMINISTRACION.UNIDAD_ORGANIZATIVA" })}
            icon="comment">

            <PortletBody>
              &nbsp;
              <AppBar position="static" className={classesEncabezado.secundario}>
                <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                  <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                    {intl.formatMessage({ id: "ASSISTANCE.PROFILE.UO_ASSOCIATED" })}
                  </Typography>
                </Toolbar>
              </AppBar>
              &nbsp;
              <DataGrid
                dataSource={props.unidadOrganizativa}
                showBorders={true}
                focusedRowEnabled={true}
                keyExpr="RowIndex"
                noDataText={intl.formatMessage({ id: "ASSISTANCE.PERSON.JUSTIFICATION.NO_DATA" })}
              >
                <Column dataField="RowIndex" caption="#" width={"10%"} alignment={"center"} />
                <Column dataField="IdUnidadOrganizativa" caption={intl.formatMessage({ id: "ACCESS.PERSON.PROFILE.CODE" })} width={"30%"} alignment={"center"} />
                <Column dataField="UnidadOrganizativa" caption={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.UNIDADORGANIZATIVA" })} visible={true} width={"40%"} alignment={"left"} />
                {/* <Column dataField="Posicion" caption={intl.formatMessage({ id: "ADMINISTRATION.ORGANIZATIONALUNIT.POSITIONS.TAB" })} visible={true} width={"25%"} alignment={"left"} />
                <Column dataField="UnidadOrganizativa" caption={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.UNIDADORGANIZATIVA.ABR" })} width={"25%"} /> */}

                <Summary>
                  <TotalItem
                    cssClass="classColorPaginador_"
                    column="IdUnidadOrganizativa"
                    summaryType="count"
                    displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
                  />
                </Summary>
                <Paging defaultPageSize={20} />

              </DataGrid>
            </PortletBody>

          </Item>


          <Item title={intl.formatMessage({ id: "ACCREDITATION.PROFILE.DIVISION" })}
            icon="comment">

            <PortletBody>
              &nbsp;
              <AppBar position="static" className={classesEncabezado.secundario}>
                <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                  <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                    {intl.formatMessage({ id: "ASSISTANCE.PROFILE.DIVISION_ASSOCIATED" })}
                  </Typography>
                </Toolbar>
              </AppBar>
              &nbsp;
              <DataGrid
                dataSource={props.division}
                showBorders={true}
                focusedRowEnabled={true}
                keyExpr="RowIndex"
                noDataText={intl.formatMessage({ id: "ASSISTANCE.PERSON.JUSTIFICATION.NO_DATA" })}
              >
                <Column dataField="RowIndex" caption="#" width={"10%"} alignment={"center"} />
                <Column dataField="IdDivision" caption={intl.formatMessage({ id: "ACCESS.PERSON.PROFILE.CODE" })} width={"30%"} alignment={"center"} />
                <Column dataField="Division" caption={intl.formatMessage({ id: "ACCREDITATION.PROFILE.DIVISION" })} visible={true} width={"40%"} alignment={"left"} />
                {/* <Column dataField="Posicion" caption={intl.formatMessage({ id: "ADMINISTRATION.ORGANIZATIONALUNIT.POSITIONS.TAB" })} visible={true} width={"25%"} alignment={"left"} />
                <Column dataField="UnidadOrganizativa" caption={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.UNIDADORGANIZATIVA.ABR" })} width={"25%"} /> */}

                <Summary>
                  <TotalItem
                    cssClass="classColorPaginador_"
                    column="IdDivision"
                    summaryType="count"
                    displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
                  />
                </Summary>
                <Paging defaultPageSize={20} />

              </DataGrid>
            </PortletBody>

          </Item>


        </TabPanel>



      </React.Fragment>
    </>
  );
};

export default injectIntl(AprobadorHHEEEditPage);
