import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import Form, { Item, GroupItem } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import { AppBar } from "@material-ui/core";
import { Toolbar } from "@material-ui/core";
import { Typography } from "@material-ui/core";
import { useStylesEncabezado } from "../../../../../store/config/Styles";
import { useSelector } from "react-redux";
import { handleInfoMessages, handleErrorMessages } from "../../../../../store/ducks/notify-messages";
import { obtenerTodos as obtenerRestricciones } from "../../../../../api/acceso/restriccion.api";
import FileUploader from "../../../../../partials/content/FileUploader";
import FileViewer from "../../../../../partials/content/FileViewer";
import { downloadFile } from "../../../../../api/helpers/fileBase64.api";
import { isNotEmpty } from "../../../../../../_metronic";
import PropTypes from "prop-types";
import { listarEstado } from "../../../../../../_metronic";
import { isRequired, isModified } from "../../../../../../_metronic/utils/securityUtils";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";
import AccesoRestriccionBuscar from "../../../../../partials/components/AccesoRestriccionBuscar";

const VehiculoRestriccionEditPage = props => {
  const { intl, setLoading, modoEdicion, settingDataField, accessButton, idModulo, idMenu, idAplicacion, fechasContrato } = props;
  const perfil = useSelector(state => state.perfil.perfilActual);
  const [fileBase64, setFileBase64] = useState();
  const [isVisiblePopUpFile, setisVisiblePopUpFile] = useState(false);
  const [estadoSimple, setEstadoSimple] = useState([]);
  const [restricciones, setRestricciones] = useState([]);
  const classesEncabezado = useStylesEncabezado();
  const [isVisiblePopUpRestriccion, setisVisiblePopUpRestriccion] = useState(false);

  async function cargarCombos() {
    let estadoSimple = listarEstado();
    let restricciones = await obtenerRestricciones({ IdCliente: perfil.IdCliente, IdDivision: perfil.IdDivision });
    setEstadoSimple(estadoSimple);
    setRestricciones(restricciones);
  }

  function grabar(e) {

    // add:IdItemSharepoint
    if (Date.parse(new Date(props.dataRowEditNew.FechaInicio)).toLocaleString() >= Date.parse(new Date(props.dataRowEditNew.FechaFin)).toLocaleString()) {
      handleInfoMessages(intl.formatMessage({ id: "ACCESS.PERSON.STARTDATE.VALID" }));
      return;
    }

    let result = e.validationGroup.validate();
    if (result.isValid) {
      document.getElementById("btnUploadFile").click();
      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregarRestriccion(props.dataRowEditNew);
      } else {
        props.actualizarRestriccion(props.dataRowEditNew);
      }
    }
  }

  async function descarArchivo() {

    if (!isNotEmpty(fileBase64)) {
      let params = {
        FileName: props.dataRowEditNew.NombreArchivo,
        idItemSharepoint: props.dataRowEditNew.IdItemSharepoint,

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
    const { IdRestriccion, Restriccion } = dataPopup[0];
    if (isNotEmpty(IdRestriccion)) {
      props.dataRowEditNew.IdRestriccion = IdRestriccion;
      props.dataRowEditNew.Restriccion = Restriccion;
    }
    setisVisiblePopUpRestriccion(false);
  };

  useEffect(() => {
    cargarCombos();
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
              <Item dataField="IdRestriccion" visible={false} />
              <Item dataField="FileBase64" visible={false} />
              <Item dataField="NombreArchivo" visible={false} />
              <Item dataField="IdItemSharepoint" visible={false} />

              <Item dataField="FechaArchivo" visible={false} />
              <Item dataField="Restriccion" with="50"
                isRequired={modoEdicion}
                label={{ text: intl.formatMessage({ id: "ACCESS.PERSON.RESTRICTION" }) }}
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
                        setisVisiblePopUpRestriccion(true);
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
                  displayFormat: "dd/MM/yyyy", //"dd/MM/yyyy HH:mm"
                  readOnly: !(modoEdicion ? isModified('FechaInicio', settingDataField) : false),
                  min: fechasContrato.FechaInicioContrato,
                  max: fechasContrato.FechaFinContrato
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
                  readOnly: !(modoEdicion ? isModified('FechaInicio', settingDataField) : false),
                  min: fechasContrato.FechaInicioContrato,
                  max: fechasContrato.FechaFinContrato
                }}
              />

              <Item
                dataField="HoraInicio"
                label={{ text: intl.formatMessage({ id: "ACCESS.PERSON.GRUPO.STARTTIME" }) }}
                isRequired={modoEdicion ? isRequired("HoraInicio", settingDataField) : false}
                editorType="dxDateBox"
                editorOptions={{
                  showClearButton: true,
                  useMaskBehavior: true,
                  maxLength: 5,
                  displayFormat: "HH:mm",
                  type: "time"
                }}
              />

              <Item
                dataField="HoraFin"
                label={{ text: intl.formatMessage({ id: "CASINO.DINNINGROOM.SERVICE.ENDTIME" }) }}
                isRequired={modoEdicion ? isRequired("HoraFin", settingDataField) : false}
                editorType="dxDateBox"
                editorOptions={{
                  showClearButton: true,
                  useMaskBehavior: true,
                  maxLength: 5,
                  displayFormat: "HH:mm",
                  type: "time"
                }}
              />


              <Item
                dataField="FlgDiaCompleto"
                isRequired={modoEdicion ? isRequired('FlgDiaCompleto', settingDataField) : false}
                label={{ text: intl.formatMessage({ id: "ACCESS.PERSON.RESTRICTION.COMPLETEDAY" }) }}
                editorType="dxSelectBox"
                editorOptions={{
                  items: estadoSimple,
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                  readOnly: !(modoEdicion ? isModified('FlgDiaCompleto', settingDataField) : false)
                }}
              />
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
                {/* Componente-> Cargar un documento .PDF*/}
                <FileUploader
                  agregarFotoBd={(data) => onFileUploader(data)}
                  fileNameX={props.dataRowEditNew.NombreArchivo}
                  fileDateX={props.dataRowEditNew.FechaArchivo}
                />
              </Item>

            </GroupItem>
          </Form>

          {/*** PopUp -> Buscar Restriccion ****/}
          {isVisiblePopUpRestriccion && (
            <AccesoRestriccionBuscar
              dataSource={restricciones}
              selectData={agregar}
              showPopup={{ isVisiblePopUp: isVisiblePopUpRestriccion, setisVisiblePopUp: setisVisiblePopUpRestriccion }}
              cancelarEdicion={() => setisVisiblePopUpRestriccion(false)}
              selectionMode={"row"}
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

VehiculoRestriccionEditPage.propTypes = {
  showButton: PropTypes.bool,
  pathFile: PropTypes.string,

};
VehiculoRestriccionEditPage.defaultProps = {
  showButton: true,
  pathFile: "",
};

export default injectIntl(VehiculoRestriccionEditPage);
