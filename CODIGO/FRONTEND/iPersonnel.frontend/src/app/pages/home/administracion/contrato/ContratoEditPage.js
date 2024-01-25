import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Form, {
  Item,
  GroupItem,
  SimpleItem,
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
import { injectIntl } from "react-intl";
import PropTypes from 'prop-types'
import AdministracionCompaniaBuscar from "../../../../partials/components/AdministracionCompaniaBuscar";
import AdministracionCompaniaMandanteBuscar from "../../../../partials/components/AdministracionCompaniaMandanteBuscar";
import { listar as listarTipoContrato } from "../../../../api/administracion/tipoContrato.api";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import { obtenerTodos as listarServicio } from "../../../../api/administracion/servicio.api";
import FileUploader from "../../../../partials/content/FileUploader";
import FileViewer from "../../../../partials/content/FileViewer";
import { downloadFile } from "../../../../api/helpers/fileBase64.api";
import { isNotEmpty, listarEstadoDotacion } from "../../../../../_metronic";
import { handleErrorMessages } from "../../../../store/ducks/notify-messages";
import SimpleDropDownBoxGridCharge from '../../../../partials/components/SimpleDropDownBoxGrid/SimpleDropDownBoxGridCharge';
import { listarEstadoSimple, listarEstado, PatterRuler } from "../../../../../_metronic";
import { isRequired } from "../../../../../_metronic/utils/securityUtils";
import FieldsetAcreditacion from '../../../../partials/content/Acreditacion/FieldsetAcreditacion/FieldsetAcreditacion';

const ContratoEditPage = props => {

  const { intl, modoEdicion, settingDataField, accessButton, setLoading, idModulo, idMenu, idAplicacion } = props;

  const [fileBase64, setFileBase64] = useState();

  const [tipoContrato, settipoContrato] = useState([]);

  const [servicios, setServicios] = useState([]);
  const [servicioSeleccionados, setServiciosSeleccionados] = useState([]);

  const classesEncabezado = useStylesEncabezado();

  const [isVisiblePopUpCompaniaMandante, setisVisiblePopUpCompaniaMandante] = useState(false);
  const [isVisiblePopUpCompaniaContratista, setisVisiblePopUpCompaniaContratista] = useState(false);

  const [companiaContratista, setCompaniaContratista] = useState("");
  const [isVisiblePopUpFile, setisVisiblePopUpFile] = useState(false);

  const perfil = useSelector(state => state.perfil.perfilActual);

  const [isChangeCmbService, setIsChangeCmbService] = useState(false);

  const [blockDotacion, setBlockDotacion] = useState(false);

  async function cargarCombos() {
    setLoading(true);
    //Listar Tipo de Contratos.
    await listarTipoContrato({ IdCliente: perfil.IdCliente, NumPagina: 0, TamPagina: 0 }).then(response => {
      settipoContrato(response);
    })

    //Listar los servicios
    await listarServicio({ IdCliente: perfil.IdCliente }).then(response => {
      // console.log("listarServicios", response);
      setServicios(response.map(x => ({ IdServicio: x.IdServicio, Servicio: x.Servicio, Check: true })));
    }).finally(() => { setLoading(false); });


  }

  function grabar(e) {
    // add:IdItemSharepoint
    let result = e.validationGroup.validate();
    if (result.isValid) {
      document.getElementById("btnUploadFile").click();
      if (isChangeCmbService) {
        let strServicios = servicioSeleccionados.join('|');
        props.dataRowEditNew.Servicios = strServicios
      }

      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregarContrato(props.dataRowEditNew);
      } else {
        props.actualizarContrato(props.dataRowEditNew);
      }
    }
    props.setDatacheck([]);
  }


  const selectCompaniaMandante = (mandante) => {
    const { IdCompania, Compania } = mandante[0];
    props.dataRowEditNew.IdCompaniaMandante = IdCompania;
    props.dataRowEditNew.CompaniaMandante = Compania;
  }

  const selectCompaniaContratista = (contratista) => {
    const { IdCompania, Compania } = contratista[0];
    props.dataRowEditNew.IdCompaniaContratista = IdCompania;
    props.dataRowEditNew.CompaniaContratista = Compania;
  }

  /**************************************************************************************************** */
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

  const onFileUploader = (data) => {
    const { file, fileName, fileDate } = data;
    props.dataRowEditNew.FileBase64 = file;
    props.dataRowEditNew.NombreArchivo = fileName;
    props.dataRowEditNew.FechaArchivo = fileDate;
  }

  /**************************************************************************************************** */
  const isRequiredRule = (id) => {
    return modoEdicion ? false : isRequired(id, settingDataField);
  }


  const validarBloqueoDotacion = () => {
    console.log('*** props.dataRowEditNew.ValidarDotacion :> ', props.dataRowEditNew.ValidarDotacion);
    console.log('*** props.dataRowEditNew.Dotacion :> ', props.dataRowEditNew.Dotacion);
    if (isNotEmpty(props.dataRowEditNew.ValidarDotacion)) {
      // props.dataRowEditNew.Dotacion= 0;
      if (props.dataRowEditNew.ValidarDotacion == 'S')
        setBlockDotacion(false);
      else if (props.dataRowEditNew.ValidarDotacion == 'Y')
        setBlockDotacion(true);
      else if (props.dataRowEditNew.ValidarDotacion == 'N')
        setBlockDotacion(true);
    }
    console.log('*** props.dataRowEditNew.Dotacion :> ', props.dataRowEditNew.Dotacion);
  }

  useEffect(()=>{
    if(isNotEmpty(props.dataRowEditNew.ValidarDotacion)){
      if (props.dataRowEditNew.ValidarDotacion == 'S')
        setBlockDotacion(false);
      else if (props.dataRowEditNew.ValidarDotacion == 'Y')
        setBlockDotacion(true);
      else if (props.dataRowEditNew.ValidarDotacion == 'N')
        setBlockDotacion(true); 
    }

  },[props.dataRowEditNew.ValidarDotacion]);


  useEffect(() => {
    cargarCombos();
  }, []);

  return (
    <><PortletHeader
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
            visible={props.modoEdicion}
            onClick={grabar}
            useSubmitBehavior={true}
            validationGroup="FormEdicion"
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
                <SimpleItem dataField="IdCliente" visible={false}></SimpleItem>
                <SimpleItem dataField="IdCompaniaMandante" visible={false}></SimpleItem>
                <SimpleItem dataField="IdCompaniaContratista" visible={false}></SimpleItem>

                <Item
                  colSpan={1} dataField="IdContrato" isRequired={true} label={{ text: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CONTRACT" }), }}
                  editorOptions={{
                    maxLength: 100,
                    inputAttr: { style: "text-transform: uppercase" },
                    readOnly: !props.dataRowEditNew.esNuevoRegistro,
                  }}
                >
                  <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} />
                  <PatternRule pattern={PatterRuler.LETRAS_NUMEROS_GUIONES} message={intl.formatMessage({ id: "Ingrese solo letras numeros o guiones " })} />
                </Item>

                <Item
                  dataField="IdTipoContrato"
                  label={{
                    text: intl.formatMessage({
                      id: "ADMINISTRATION.CONTRACT.CONTRACTTYPE",
                    }),
                  }}
                  editorType="dxSelectBox"
                  isRequired={true}
                  editorOptions={{
                    items: tipoContrato,
                    valueExpr: "IdTipoContrato",
                    displayExpr: "TipoContrato",
                    readOnly: !props.modoEdicion,
                  }}
                />

                <Item
                  colSpan={1} dataField="CompaniaMandante" isRequired={true} label={{ text: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CLIENTCOMPANY" }), }}
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
                          disabled: !props.dataRowEditNew.esNuevoRegistro,
                          onClick: (evt) => {
                            setCompaniaContratista("N");
                            setisVisiblePopUpCompaniaMandante(true);
                          },
                        },
                      },
                    ],
                  }}
                />
                <Item
                  colSpan={1} dataField="CompaniaContratista" isRequired={true} label={{ text: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CONTRACTORCOMPANY" }), }}
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
                          disabled: !props.dataRowEditNew.esNuevoRegistro,
                          onClick: () => {
                            setCompaniaContratista("S");
                            setisVisiblePopUpCompaniaContratista(true);
                          },
                        },
                      },
                    ],
                  }}
                />
                <Item
                  colSpan={2}
                  dataField="Asunto"
                  //  isRequired={true} 
                  label={{ text: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.SUBJECT" }), }}
                  editorOptions={{
                    maxLength: 100,
                    inputAttr: { style: "text-transform: uppercase" },
                    readOnly: !props.modoEdicion,
                  }}
                >
                  {(isRequiredRule("Asunto")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={100} />}
                  <PatternRule pattern={PatterRuler.LETRAS_DESCRIPCION} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS" })} />
                </Item>

                <Item
                  dataField="FechaInicio"
                  label={{
                    text: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.STARTDATE" }),
                  }}
                  isRequired={true}
                  editorType="dxDateBox"
                  dataType="datetime"
                  editorOptions={{
                    inputAttr: { style: "text-transform: uppercase" },
                    displayFormat: "dd/MM/yyyy",
                    readOnly: !props.modoEdicion,
                  }}
                />

                <Item
                  dataField="FechaFin"
                  label={{
                    text: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.ENDDATE" }),
                  }}
                  isRequired={true}
                  editorType="dxDateBox"
                  dataType="datetime"
                  editorOptions={{
                    inputAttr: { style: "text-transform: uppercase" },
                    displayFormat: "dd/MM/yyyy",
                    readOnly: !props.modoEdicion,
                  }}
                />

                <Item
                  dataField="ValidarDotacion"
                  label={{ text: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.ISVALIDENDOWMENT" }) }}
                  editorType="dxSelectBox"
                  isRequired={true}
                  editorOptions={{
                    readOnly: !props.modoEdicion,
                    items: listarEstadoDotacion(),
                    valueExpr: "Valor",
                    displayExpr: "Descripcion",
                    onValueChanged: (e) => {
                      validarBloqueoDotacion();
                    }
                  }}
                />

                <Item
                  colSpan={1} dataField="Dotacion" isRequired={true} label={{ text: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.ENDOWMENT" }), }}
                  editorType="dxNumberBox"
                  dataType="number"
                  editorOptions={{
                    maxLength: 5,
                    inputAttr: { style: "text-transform: uppercase; text-align: right", },
                    // readOnly: !props.modoEdicion,
                    readOnly: !props.modoEdicion ? true : blockDotacion,
                    showSpinButtons: true,
                    showClearButton: true,
                    min: 0,
                    max: 999999
                  }}
                />


                <Item
                  dataField="Servicios"
                  label={{ text: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.SERVICES" }) }}
                >
                  <SimpleDropDownBoxGridCharge
                    id="SimpleBDServicios"
                    ColumnDisplay={"Servicio"}
                    ColumnValue={"IdServicio"}
                    placeholder={"Select a value.."}
                    SelectionMode="multiple"
                    dataSource={servicios}
                    Columnas={[{ dataField: "Servicio", caption: intl.formatMessage({ id: "CAMP.RESERVATION.SERVICES" }), width: '100%' }]}
                    setSeleccionados={setServiciosSeleccionados}
                    Seleccionados={servicioSeleccionados}
                    pageSize={10}
                    pageEnabled={true}
                    dataCheck={props.dataCheck}
                    setDatacheck={props.setDatacheck}
                    setIsChangeCmbService={setIsChangeCmbService}
                    readOnly={!props.modoEdicion}
                  />

                </Item>

                <Item
                  dataField="Activo"
                  label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
                  editorType="dxSelectBox"
                  isRequired={true}
                  editorOptions={{
                    readOnly: props.dataRowEditNew.esNuevoRegistro ? true : !props.modoEdicion,
                    items: listarEstadoSimple(),
                    valueExpr: "Valor",
                    displayExpr: "Descripcion",
                  }}
                />
                <Item dataField="IdItemSharepoint" visible={false} />

                <Item
                  visible={(!props.dataRowEditNew.esNuevoRegistro && props.dataRowEditNew.CantidadAdendas > 0) ? true : false}
                  cssClass={"text-primary"}
                >
                  <span>
                    <strong>
                      {intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.FINAL_BASE_DATE" }) + ": " + props.dataRowEditNew.FechaFinBase}
                    </strong>
                  </span>
                </Item>
              </GroupItem>
            </Form>
          </FieldsetAcreditacion>
          <FieldsetAcreditacion title={intl.formatMessage({ id: "COMMON.FILE" })}>
            <Form formData={props.dataRowEditNew} validationGroup="FormEdicion" >
              <GroupItem itemType="group" colCount={2} colSpan={2}>
                <Item colSpan={2}>
                  {/* Componente-> Cargar un documento .PDF*/}
                  <FileUploader
                    agregarFotoBd={onFileUploader}
                    fileNameX={props.dataRowEditNew.NombreArchivo}
                    fileDateX={props.dataRowEditNew.FechaArchivo}
                  />
                </Item>

              </GroupItem>

            </Form>
          </FieldsetAcreditacion>

          {/* ------------------BUSCAR-COMPANIAS---------------------------------- */}
          {isVisiblePopUpCompaniaMandante && (
            <AdministracionCompaniaMandanteBuscar
              selectData={selectCompaniaMandante}
              showPopup={{ isVisiblePopUp: isVisiblePopUpCompaniaMandante, setisVisiblePopUp: setisVisiblePopUpCompaniaMandante }}
              cancelarEdicion={() => setisVisiblePopUpCompaniaMandante(false)}
              uniqueId={"administracionCompaniaMandanteBuscar"}
              contratista={companiaContratista}
              isContratista={"N"}
            />
          )}

          {isVisiblePopUpCompaniaContratista && (
            <AdministracionCompaniaBuscar
              selectData={selectCompaniaContratista}
              showPopup={{ isVisiblePopUp: isVisiblePopUpCompaniaContratista, setisVisiblePopUp: setisVisiblePopUpCompaniaContratista }}
              cancelarEdicion={() => setisVisiblePopUpCompaniaContratista(false)}
              uniqueId={"administracionCompaniaContratistaBuscar"}
              contratista={companiaContratista}
              isContratista={"S"}
            />
          )}


          {/* ---------------------------------------------------- */}
          <FileViewer
            showPopup={{ isVisiblePopUp: isVisiblePopUpFile, setisVisiblePopUp: setisVisiblePopUpFile }}
            cancelar={() => setisVisiblePopUpFile(false)}
            fileBase64={fileBase64}
            fileName={props.dataRowEditNew.NombreArchivo}
          />
          {/* ---------------------------------------------------- */}

        </React.Fragment>
      </PortletBody>
    </>
  );

};

ContratoEditPage.propTypes = {
  titulo: PropTypes.string,
  modoEdicion: PropTypes.bool,
  showButtons: PropTypes.bool,
  showAppBar: PropTypes.bool,

}
ContratoEditPage.defaultProps = {
  titulo: "",
  modoEdicion: false,
  showButtons: true,
  showAppBar: true,
}

export default injectIntl(WithLoandingPanel(ContratoEditPage));
