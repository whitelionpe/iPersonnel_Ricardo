import React, { useEffect, useState } from "react";
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
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";
import { max } from "lodash";
import { isNotEmpty, listarEstadoSimple } from "../../../../../_metronic";
import { handleErrorMessages } from "../../../../store/ducks/notify-messages";
import FileUploader from "../../../../partials/content/FileUploader";
import FileViewer from "../../../../partials/content/FileViewer";
import { downloadFile } from "../../../../api/helpers/fileBase64.api";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import { obtenerTodos as obtenerCmbIndisciplina } from "../../../../api/administracion/indisciplina.api";
import { listarTipoSeveridad, PatterRuler } from "../../../../../_metronic";
import { isRequired, isModified } from "../../../../../_metronic/utils/securityUtils";
import FieldsetAcreditacion from '../../../../partials/content/Acreditacion/FieldsetAcreditacion/FieldsetAcreditacion';

const PersonaIndisciplinaEditPage = props => {
  const { intl, setLoading, modoEdicion, settingDataField, accessButton, idModulo, idMenu, idAplicacion } = props;

  const [fileBase64, setFileBase64] = useState();
  const [isVisiblePopUpFile, setisVisiblePopUpFile] = useState(false);

  const perfil = useSelector(state => state.perfil.perfilActual);
  const [cmbIndisciplina, setCmbIndisciplina] = useState([]);
  const [tipoSeveridades, setTipoSeveridades] = useState([]);
  const classesEncabezado = useStylesEncabezado();

  async function cargarCombos() {
    let cmbIndisciplina = await obtenerCmbIndisciplina({ IdCliente: perfil.IdCliente });
    setCmbIndisciplina(cmbIndisciplina);

    let tipoSeveridades = listarTipoSeveridad();
    setTipoSeveridades(tipoSeveridades);
  }


  function grabar(e) {
    // add:IdItemSharepoint
    let result = e.validationGroup.validate();
    if (result.isValid) {
      document.getElementById("btnUploadFile").click();
      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregarPersonaIndisciplina(props.dataRowEditNew);
      } else {
        props.actualizarPersonaIndisciplina(props.dataRowEditNew);
      }
    }
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
          //setisVisiblePopUpFile(true);
          document.getElementById("fileOpenWindow").click()
        })
        .catch((err) => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
        }).finally(() => setLoading(false));

    } else {
      //setisVisiblePopUpFile(true);
      document.getElementById("fileOpenWindow").click()
    }
  }

  const onFileUploader = (data) => {
    const { file, fileName, fileDate } = data;
    props.dataRowEditNew.FileBase64 = file;
    props.dataRowEditNew.NombreArchivo = fileName;
    props.dataRowEditNew.FechaArchivo = fileDate;
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
              useSubmitBehavior={true}
              validationGroup="FormEdicion"
              onClick={grabar}
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
            <Form formData={props.dataRowEditNew} validationGroup="FormEdicion" >
              <GroupItem itemType="group" colCount={2} colSpan={2}>
                <Item dataField="FileBase64" visible={false} />
                <Item dataField="Indisciplina" visible={false} />
                <Item dataField="NombreArchivo" visible={false} />
                <Item dataField="FechaArchivo" visible={false} />

                <Item
                  dataField="IdIndisciplina"
                  label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.INDISCIPLINE.INDISCIPLINE" }) }}
                  editorType="dxSelectBox"
                  isRequired={modoEdicion}
                  colSpan={1}
                  editorOptions={{
                    items: cmbIndisciplina,
                    valueExpr: "IdIndisciplina",
                    displayExpr: "Indisciplina",
                    readOnly: !props.dataRowEditNew.esNuevoRegistro ? true : false,
                    onValueChanged: ((e) => props.dataRowEditNew.Indisciplina = e.value)
                  }}
                />

                <Item
                  dataField="Severidad"
                  label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.INDISCIPLINE.SEVERITY" }) }}
                  editorType="dxSelectBox"
                  isRequired={modoEdicion ? isRequired('Severidad', settingDataField) : false}
                  colSpan={1}
                  editorOptions={{
                    items: tipoSeveridades,
                    valueExpr: "Valor",
                    displayExpr: "Descripcion",
                    readOnly: !(modoEdicion ? isModified('Severidad', settingDataField) : false)
                  }}
                />

                <Item
                  dataField="Observacion"
                  label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.INDISCIPLINE.OBSERVATION" }) }}
                  isRequired={modoEdicion ? isRequired('Observacion', settingDataField) : false}
                  colSpan={2}
                  editorType="dxTextArea"
                  editorOptions={{
                    maxLength: 4000,
                    inputAttr: { 'style': 'text-transform: uppercase' },
                    height: 100,
                    readOnly: !(modoEdicion ? isModified('Observacion', settingDataField) : false)
                  }}
                >
                  {(isRequiredRule("Observacion")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={4000} />}
                  {/* <PatternRule pattern={PatterRuler.LETRAS_DESCRIPCION} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS" })} /> */}
                </Item>

                <Item dataField="NombreArchivo"
                  label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.INDISCIPLINE.ATTACHFILE" }) }}
                  colSpan={2}
                  visible={false}
                  editorOptions={{
                    maxLength: 50,
                    inputAttr: { 'style': 'text-transform: uppercase' },
                    disabled: props.dataRowEditNew.esNuevoRegistro ? true : true
                  }}
                />
                <Item dataField="IdItemSharepoint" visible={false} />
                <Item
                  dataField="Activo"
                  label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
                  editorType="dxSelectBox"
                  isRequired={modoEdicion}
                  editorOptions={{
                    items: listarEstadoSimple(),
                    valueExpr: "Valor",
                    displayExpr: "Descripcion",
                    readOnly: !(modoEdicion ? (props.dataRowEditNew.esNuevoRegistro ? false : true) : false)
                  }}
                />

                <Item dataField="IdCliente" visible={false} />
                <Item dataField="IdPersona" visible={false} />
              </GroupItem>
            </Form>
          </FieldsetAcreditacion>
          <FieldsetAcreditacion title={intl.formatMessage({ id: "COMMON.FILE" })}>
            <Form formData={props.dataRowEditNew} validationGroup="FormEdicion" >
              <GroupItem itemType="group" colCount={2} colSpan={2}>
                <Item colSpan={2}>
                  {/* Componente-> Cargar un documento .PDF*/}
                  <FileUploader
                    agregarFotoBd={(data) => onFileUploader(data)}
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

export default injectIntl(WithLoandingPanel(PersonaIndisciplinaEditPage));
