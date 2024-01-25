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
import { AppBar } from "@material-ui/core";
import { Toolbar } from "@material-ui/core";
import { Typography } from "@material-ui/core";
import { useStylesEncabezado } from "../../../../store/config/Styles";
import { obtenerTodos as obtenerTipoMantenimiento } from "../../../../api/sistema/tipomantenimiento.api";
import CardFoto from "../../../../partials/content/cardFoto";
import { isNotEmpty } from "../../../../../_metronic";
import { Paper } from '@material-ui/core';
import { max } from "lodash";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";

import { handleErrorMessages } from "../../../../store/ducks/notify-messages";

import FileUploader from "../../../../partials/content/FileUploader";
import FileViewer from "../../../../partials/content/FileViewer";
import { downloadFile } from "../../../../api/helpers/fileBase64.api";

import { PatterRuler } from "../../../../../_metronic";
import { isRequired, isModified } from "../../../../../_metronic/utils/securityUtils";
import FieldsetAcreditacion from '../../../../partials/content/Acreditacion/FieldsetAcreditacion/FieldsetAcreditacion';


const EquipoMantenimientoEditPage = props => {

  const { intl, modoEdicion, settingDataField, accessButton, setLoading, idModulo, idMenu, idAplicacion, medidaSugeridas } = props;

  const [tipoEquiposMant, setTipoEquiposMant] = useState([]);
  const classesEncabezado = useStylesEncabezado();
  const [popupVisibleFoto1, setPopupVisibleFoto1] = useState(false);
  const [popupVisibleFoto2, setPopupVisibleFoto2] = useState(false);
  const [popupVisibleFoto3, setPopupVisibleFoto3] = useState(false);

  const [fileBase64, setFileBase64] = useState();
  const [isVisiblePopUpFile, setisVisiblePopUpFile] = useState(false);

  async function cargarCombos() {
    let tipoEquiposMant = await obtenerTipoMantenimiento({ IdCliente: '%', IdEquipo: '%' });
    setTipoEquiposMant(tipoEquiposMant);
  }


  const onFileUploader = (data, tipo) => {
    const { file, fileName, fileDate } = data;
    if (tipo === "Foto1") {
      props.dataRowEditNew.Foto1 = (isNotEmpty(file) ? file : "")
    } else if (tipo === "Foto2") {
      props.dataRowEditNew.Foto2 = (isNotEmpty(file) ? file : "")
    } else if (tipo === "Foto3") {
      props.dataRowEditNew.Foto3 = (isNotEmpty(file) ? file : "")
    } else if (tipo === "PDF") {
      props.dataRowEditNew.FileBase64 = (isNotEmpty(file) ? file : "")
      props.dataRowEditNew.FechaArchivo = (isNotEmpty(fileDate) ? fileDate : "")
      props.dataRowEditNew.NombreArchivo = (isNotEmpty(fileName) ? fileName : "")
    }
  }


  function grabar(data) {
    document.getElementById("btnUploadFile").click();
    const tipoMantenimiento = tipoEquiposMant.find(tipo => tipo.IdTipoMantenimiento === props.dataRowEditNew.IdTipoMantenimiento);
    // add:IdItemSharepoint
    let parameter = {
      IdCliente: props.dataRowEditNew.IdCliente
      , IdEquipo: props.dataRowEditNew.IdEquipo
      , IdSecuencial: props.dataRowEditNew.IdSecuencial
      , IdTipoMantenimiento: props.dataRowEditNew.IdTipoMantenimiento
      , Descripcion: props.dataRowEditNew.Descripcion
      , Tecnico: props.dataRowEditNew.Tecnico
      , Observacion: props.dataRowEditNew.Observacion
      , FechaInicio: props.dataRowEditNew.FechaInicio
      , FechaFin: props.dataRowEditNew.FechaFin
      , TipoMantenimiento: tipoMantenimiento.TipoMantenimiento
      , FechaArchivo: (props.dataRowEditNew.FechaArchivo ? props.dataRowEditNew.FechaArchivo : "")
      , NombreArchivo: (props.dataRowEditNew.NombreArchivo ? props.dataRowEditNew.NombreArchivo : "")
      , IdItemSharepoint: (props.dataRowEditNew.IdItemSharepoint ? props.dataRowEditNew.IdItemSharepoint : "")

      , Foto1: (props.dataRowEditNew.Foto1 ? props.dataRowEditNew.Foto1 : "")
      , Foto2: (props.dataRowEditNew.Foto2 ? props.dataRowEditNew.Foto2 : "")
      , Foto3: (props.dataRowEditNew.Foto3 ? props.dataRowEditNew.Foto3 : "")
      , FileBase64: (props.dataRowEditNew.FileBase64 ? props.dataRowEditNew.FileBase64 : "")

    };

    if (props.dataRowEditNew.esNuevoRegistro) {
      let result = data.validationGroup.validate();
      if (result.isValid) {
        props.agregarEquipoMantenimiento(parameter);
      }
    } else {
      props.actualizarEquipoMantenimiento(parameter);
    }

  }

  const deletePicture = (tipoFoto) => {
    const { IdCliente, IdEquipo, IdSecuencial } = props.dataRowEditNew;
    props.eliminarRegistroxFoto({ IdCliente: IdCliente, IdEquipo: IdEquipo, IdSecuencial: IdSecuencial, TipoFoto: tipoFoto }, false);
  }



  function showInfo(tipo) {
    if (tipo === "foto1") setPopupVisibleFoto1(true);
    if (tipo === "foto2") setPopupVisibleFoto2(true);
    if (tipo === "foto3") setPopupVisibleFoto3(true);
  }

  function hideInfo(tipo) {
    if (tipo === "foto1") setPopupVisibleFoto1(false);
    if (tipo === "foto2") setPopupVisibleFoto2(false);
    if (tipo === "foto3") setPopupVisibleFoto3(false);
  }

  async function descargarArchivo() {

    if (!isNotEmpty(fileBase64)) {
      let params = {
        FileName: props.dataRowEditNew.NombreArchivo,
        IdItemSharepoint: props.dataRowEditNew.IdItemSharepoint,
        FileType: "data:application/pdf;base64,",
        path: "",
        idModulo,
        idAplicacion,
        idMenu
      };

      setLoading(true);
      await downloadFile(params)
        .then(data => {
          setFileBase64(data.fileBase64);
          document.getElementById("fileOpenWindow").click()
        })
        .catch((err) => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
        }).finally(() => setLoading(false));

    } else {
      document.getElementById("fileOpenWindow").click()
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
      <PortletHeader
        title={props.titulo}
        toolbar={
          <PortletHeaderToolbar>
            <Button
              icon="exportpdf"
              type="default"
              hint={intl.formatMessage({ id: "ACTION.DOWNLOAD" })}
              onClick={descargarArchivo}
              visible={isNotEmpty(props.dataRowEditNew.NombreArchivo) && !props.dataRowEditNew.esNuevoRegistro ? true : false}
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

          <FieldsetAcreditacion title={intl.formatMessage({ id: "COMMON.DETAIL" })}>
            <Form formData={props.dataRowEditNew} validationGroup="FormEdicion"  >
              <GroupItem itemType="group" colCount={2} colSpan={2}>
                <Item dataField="IdEquipo" visible={false} />
                <Item dataField="FileBase64" visible={false} />
                <Item dataField="TipoMantenimiento" visible={false} />
                <Item dataField="NombreArchivo" visible={false} />
                <Item dataField="IdItemSharepoint" visible={false} />
                <Item dataField="FechaArchivo" visible={false} />
                <Item
                  dataField="IdTipoMantenimiento"
                  label={{ text: intl.formatMessage({ id: "COMMON.TYPE" }) }}
                  editorType="dxSelectBox"
                  isRequired={modoEdicion}
                  editorOptions={{
                    items: tipoEquiposMant,
                    valueExpr: "IdTipoMantenimiento",
                    displayExpr: "TipoMantenimiento",
                    searchEnabled: true,
                    readOnly: !props.dataRowEditNew.esNuevoRegistro ? true : false
                  }}
                />

                <Item dataField="Tecnico"
                  label={{ text: intl.formatMessage({ id: "SYSTEM.TEAM.TECHNICAL" }) }}
                  isRequired={modoEdicion ? isRequired('Tecnico', settingDataField) : false}
                  editorOptions={{
                    maxLength: 50,
                    inputAttr: { 'style': 'text-transform: uppercase' },
                    readOnly: !(modoEdicion ? isModified('Tecnico', settingDataField) : false)
                  }}
                >
                  {(isRequiredRule("Tecnico")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={100} />}
                  <PatternRule pattern={PatterRuler.LETRAS_DESCRIPCION} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS" })} />
                </Item>

                <Item dataField="FechaInicio"
                  label={{ text: intl.formatMessage({ id: "SYSTEM.TEAM.DATE" }) }}
                  editorType="dxDateBox"
                  isRequired={modoEdicion ? isRequired('FechaInicio', settingDataField) : false}
                  editorOptions={{
                    type: "datetime",
                    inputAttr: { 'style': 'text-transform: uppercase' },
                    displayFormat: "dd/MM/yyyy HH:mm",
                    readOnly: !(modoEdicion ? isModified('FechaInicio', settingDataField) : false)
                  }}
                />

                <Item dataField="FechaFin"
                  label={{ text: intl.formatMessage({ id: "SYSTEM.TEAM.DATE.END" }) }}
                  editorType="dxDateBox"
                  isRequired={modoEdicion ? isRequired('FechaFin', settingDataField) : false}
                  editorOptions={{
                    type: "datetime",
                    inputAttr: { 'style': 'text-transform: uppercase' },
                    displayFormat: "dd/MM/yyyy HH:mm",
                    readOnly: !(modoEdicion ? isModified('FechaFin', settingDataField) : false)
                  }}
                />

                <Item dataField="Observacion"
                  label={{ text: intl.formatMessage({ id: "COMMON.OBSERVATION" }) }}
                  colSpan={2}
                  isRequired={modoEdicion ? isRequired('Observacion', settingDataField) : false}
                  editorOptions={{
                    maxLength: max,
                    inputAttr: { 'style': 'text-transform: uppercase' },
                    readOnly: !(modoEdicion ? isModified('Observacion', settingDataField) : false)
                  }}
                >
                  {(isRequiredRule("Observacion")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={100} />}
                  <PatternRule pattern={PatterRuler.LETRAS_DESCRIPCION} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS" })} />
                </Item>

                <Item
                  dataField="Descripcion"
                  isRequired={modoEdicion ? isRequired('Descripcion', settingDataField) : false}
                  label={{ text: intl.formatMessage({ id: "SYSTEM.TEAM.WORK" }) }}
                  colSpan={2}
                  editorType="dxTextArea"
                  editorOptions={{
                    maxLength: max,
                    inputAttr: { 'style': 'text-transform: uppercase' },
                    height: 100,
                    readOnly: !(modoEdicion ? isModified('Descripcion', settingDataField) : false)
                  }}
                />

                <Item dataField="NombreArchivo"
                  label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.INDISCIPLINE.ATTACHFILE" }) }}
                  visible={false}
                  colSpan={2}
                  editorOptions={{
                    maxLength: 50,
                    inputAttr: { 'style': 'text-transform: uppercase' },
                    disabled: props.dataRowEditNew.esNuevoRegistro ? true : true
                  }}
                />
              </GroupItem>
            </Form>
          </FieldsetAcreditacion>
          <FieldsetAcreditacion title={intl.formatMessage({ id: "SYSTEM.TEAM.PHOTOS" })}>
            <Form formData={props.dataRowEditNew} validationGroup="FormEdicion"  >

              <GroupItem itemType="group" colCount={3} colSpan={3}>
                <Item>
                  <Paper>
                    <PortletHeader title={intl.formatMessage({ id: "SYSTEM.TEAM.PHOTO1" })} />
                    <PortletBody >
                      <div className="d-flex justify-content-center">
                        <CardFoto
                          size={props.size}
                          agregarFotoBdGrabar={(data) => grabar(data)}
                          deletePicture={() => deletePicture("Foto1")}
                          agregarFotoBd={(data) => onFileUploader(data, "Foto1")}//onFileUploader: Solo va ha recargar la data temporalmente
                          id={"Foto1"}

                          esSubirImagen={true}
                          imagenB64={props.dataRowEditNew.Foto1 ? props.dataRowEditNew.Foto1 : null}
                          fechaFoto={props.dataRowEditNew.FechaModificacion ? props.dataRowEditNew.FechaModificacion : props.dataRowEditNew.FechaCreacion}
                          popupVisible={popupVisibleFoto1}
                          hidePopup={() => hideInfo("foto1")}
                          onClick={() => showInfo("foto1")}
                          colSpan={2}

                          medidaSugeridas={medidaSugeridas}
                          numberPosition={"1"}
                        />
                      </div>
                    </PortletBody>
                  </Paper>
                </Item>



                <Item>
                  <Paper>
                    <PortletHeader title={intl.formatMessage({ id: "SYSTEM.TEAM.PHOTO2" })} />
                    <PortletBody >
                      <div className="d-flex justify-content-center">
                        <CardFoto
                          size={props.size}
                          agregarFotoBdGrabar={(data) => grabar(data)}
                          deletePicture={() => deletePicture("Foto2")}
                          agregarFotoBd={(data) => onFileUploader(data, "Foto2")}
                          id={"Foto2"}
                          esSubirImagen={true}
                          imagenB64={props.dataRowEditNew.Foto2 ? props.dataRowEditNew.Foto2 : null}
                          fechaFoto={props.dataRowEditNew.FechaModificacion ? props.dataRowEditNew.FechaModificacion : props.dataRowEditNew.FechaCreacion}
                          popupVisible={popupVisibleFoto2}
                          hidePopup={() => hideInfo("foto2")}
                          onClick={() => showInfo("foto2")}
                          colSpan={2}

                          medidaSugeridas={medidaSugeridas}
                          numberPosition={"2"}
                        />
                      </div>
                    </PortletBody>
                  </Paper>
                </Item>
                <Item>
                  <Paper>
                    <PortletHeader title={intl.formatMessage({ id: "SYSTEM.TEAM.PHOTO3" })} />
                    <PortletBody >
                      <div className="d-flex justify-content-center">
                        <CardFoto
                          size={props.size}
                          agregarFotoBdGrabar={(data) => grabar(data)}
                          deletePicture={() => deletePicture("Foto3")}
                          agregarFotoBd={(data) => onFileUploader(data, "Foto3")}
                          id={"Foto3"}
                          esSubirImagen={true}
                          imagenB64={props.dataRowEditNew.Foto3 ? props.dataRowEditNew.Foto3 : null}
                          fechaFoto={props.dataRowEditNew.FechaModificacion ? props.dataRowEditNew.FechaModificacion : props.dataRowEditNew.FechaCreacion}
                          popupVisible={popupVisibleFoto3}
                          hidePopup={() => hideInfo("foto3")}
                          onClick={() => showInfo("foto3")}
                          colSpan={2}

                          medidaSugeridas={medidaSugeridas}
                          numberPosition={"3"}
                        />
                      </div>
                    </PortletBody>
                  </Paper>
                </Item>

              </GroupItem>

            </Form>
          </FieldsetAcreditacion>
          <FieldsetAcreditacion title={intl.formatMessage({ id: "COMMON.FILE" })}>
            <Form formData={props.dataRowEditNew} validationGroup="FormEdicion"  >
              <GroupItem itemType="group" colCount={2} colSpan={2}>
                <Item colSpan={2}>
                  {/* Componente-> Cargar un documento .PDF*/}
                  <FileUploader
                    agregarFotoBd={(data) => onFileUploader(data, "PDF")}
                    fileNameX={props.dataRowEditNew.NombreArchivo}
                    fileDateX={props.dataRowEditNew.FechaArchivo}
                  />
                </Item>

              </GroupItem>
            </Form>
          </FieldsetAcreditacion>

          <FileViewer
            showPopup={{ isVisiblePopUp: isVisiblePopUpFile, setisVisiblePopUp: setisVisiblePopUpFile }}
            cancelar={() => setisVisiblePopUpFile(false)}
            fileBase64={fileBase64}
            fileName={props.dataRowEditNew.NombreArchivo}
          />

        </React.Fragment>
      </PortletBody>
    </>
  );

};

export default injectIntl(WithLoandingPanel(EquipoMantenimientoEditPage));
