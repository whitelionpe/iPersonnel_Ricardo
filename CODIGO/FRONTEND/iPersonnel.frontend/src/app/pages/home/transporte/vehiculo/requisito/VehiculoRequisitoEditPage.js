import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import Form, { Item, GroupItem } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import { AppBar } from "@material-ui/core";
import { Toolbar } from "@material-ui/core";
import { Typography } from "@material-ui/core";
import { useStylesEncabezado } from "../../../../../store/config/Styles";
import { handleInfoMessages, handleErrorMessages } from "../../../../../store/ducks/notify-messages";

import FileUploader from "../../../../../partials/content/FileUploader";
import FileViewer from "../../../../../partials/content/FileViewer";
import { downloadFile } from "../../../../../api/helpers/fileBase64.api";
import { isNotEmpty } from "../../../../../../_metronic";
import PropTypes from "prop-types";
import { isRequired, isModified } from "../../../../../../_metronic/utils/securityUtils";

import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";
import AccesoRequisitoBuscar from "../../../../../partials/components/AccesoRequisitoBuscar";


const VehiculoRequisitoEditPage = props => {
  const { intl, setLoading, modoEdicion, settingDataField, accessButton, idModulo, idMenu, idAplicacion } = props;

  const [fileBase64, setFileBase64] = useState();
  const [isVisiblePopUpFile, setisVisiblePopUpFile] = useState(false);

  const classesEncabezado = useStylesEncabezado();

  const [isVisiblePopUpVehiculoRequisito, setisVisiblePopUpVehiculoRequisito] = useState(false);

  const [filtroLocal] = useState({
    IdEntidad: "V",
  });

  function grabar(e) {
    // add:IdItemSharepoint
    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (Date.parse(new Date(props.dataRowEditNew.FechaInicio)) > Date.parse(new Date(props.dataRowEditNew.FechaFin))) {
        handleInfoMessages(intl.formatMessage({ id: "ACCESS.PERSON.STARTDATE.VALID" }));
        return;
      }
      document.getElementById("btnUploadFile").click();
      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregarRequisito(props.dataRowEditNew);
      } else {
        props.actualizarRequisito(props.dataRowEditNew);
      }
    }
  }
  async function descarArchivo() {

    if (!isNotEmpty(fileBase64)) {
      let params = {
        FileName: props.dataRowEditNew.NombreArchivo,
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

  const onFileUploader = (data) => {
    const { file, fileName, fileDate } = data;
    props.dataRowEditNew.FileBase64 = file;
    props.dataRowEditNew.NombreArchivo = fileName;
    props.dataRowEditNew.FechaArchivo = fileDate;
  }


  const agregar = (dataPopup) => {
    const { IdRequisito, Requisito, DiasNotificacion } = dataPopup[0];
    if (isNotEmpty(IdRequisito)) {
      props.dataRowEditNew.IdRequisito = IdRequisito;
      props.dataRowEditNew.Requisito = Requisito;
      props.dataRowEditNew.DiasNotificacion = DiasNotificacion;
    }
    setisVisiblePopUpVehiculoRequisito(false);
  };

  useEffect(() => {

  }, []);

  return (
    <>

      <HeaderInformation data={props.getInfo()} visible={props.showHeaderInformation} labelLocation={'left'} colCount={6}
        toolbar={
          <PortletHeader
            title=""
            toolbar={
              <PortletHeaderToolbar>

                <Button
                  icon="exportpdf"
                  type="default"
                  hint={intl.formatMessage({ id: "ACTION.DOWNLOAD" })}
                  onClick={descarArchivo}
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
                  visible={false}
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

              <Item dataField="Requisito" with="50"
                isRequired={modoEdicion}
                label={{ text: intl.formatMessage({ id: "ACCESS.PERSON.REQUIREMENT" }) }}
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
                      disabled: !props.dataRowEditNew.esNuevoRegistro ? true : false,
                      onClick: () => {
                        setisVisiblePopUpVehiculoRequisito(true);
                      },

                    }
                  }]
                }}
              />
              <Item />

              <Item dataField="FechaInicio"
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.STARTDATE" }) }}
                isRequired={modoEdicion ? isRequired('FechaInicio', settingDataField) : false}
                editorType="dxDateBox"
                dataType="date"
                editorOptions={{
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  displayFormat: "dd/MM/yyyy",
                  readOnly: !(modoEdicion ? isModified('FechaInicio', settingDataField) : false)

                }}
              />

              <Item dataField="FechaFin"
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.ENDDATE" }) }}
                isRequired={modoEdicion ? isRequired('FechaFin', settingDataField) : false}
                editorType="dxDateBox"
                dataType="date"
                editorOptions={{
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  displayFormat: "dd/MM/yyyy",
                  readOnly: !(modoEdicion ? isModified('FechaInicio', settingDataField) : false)
                }}
              />
              <Item dataField="IdCliente" visible={false} />
              <Item dataField="IdDivision" visible={false} />
              <Item dataField="IdPersona" visible={false} />
              <Item dataField="IdRequisito" visible={false} />
              <Item dataField="IdSecuencial" visible={false} />
              <Item dataField="FileBase64" visible={false} />
              <Item dataField="NombreArchivo" visible={false} />
              <Item dataField="IdItemSharepoint" visible={false} />

              <Item dataField="FechaArchivo" visible={false} />

            </GroupItem>
            <GroupItem itemType="group" colCount={2} colSpan={2}>
              <Item colSpan={2}>
                <AppBar position="static" className={classesEncabezado.secundario}>
                  <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                    <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                      {intl.formatMessage({ id: "COMMON.FILE" })}
                    </Typography>
                  </Toolbar>
                </AppBar>
              </Item>
              <Item colSpan={2}>

                <FileUploader
                  agregarFotoBd={(data) => onFileUploader(data)}
                  fileNameX={props.dataRowEditNew.NombreArchivo}
                  fileDateX={props.dataRowEditNew.FechaArchivo}
                />
              </Item>

            </GroupItem>

          </Form>

          {/*** PopUp -> Buscar Rquisitos ****/}
          {isVisiblePopUpVehiculoRequisito && (
            <AccesoRequisitoBuscar
              selectData={agregar}
              showPopup={{ isVisiblePopUp: isVisiblePopUpVehiculoRequisito, setisVisiblePopUp: setisVisiblePopUpVehiculoRequisito }}
              cancelarEdicion={() => setisVisiblePopUpVehiculoRequisito(false)}
              selectionMode={"row"}
              filtro={filtroLocal}
            />
          )}

          {/* POPUP-> Visualizar documento .PDF*/}
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
VehiculoRequisitoEditPage.propTypes = {
  showButton: PropTypes.bool,
  pathFile: PropTypes.string,

};
VehiculoRequisitoEditPage.defaultProps = {
  showButton: true,
  pathFile: "",
};

export default injectIntl(WithLoandingPanel(VehiculoRequisitoEditPage));

