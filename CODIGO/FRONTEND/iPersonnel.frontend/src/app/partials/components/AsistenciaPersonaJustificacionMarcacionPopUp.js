import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { Button  } from "devextreme-react";
import { Portlet  } from "../content/Portlet";
import { isNotEmpty, listarEstado } from "../../../_metronic";
 
import Form, { GroupItem, Item, SimpleItem } from "devextreme-react/form";
import { useStylesEncabezado } from "../../store/config/Styles";
import { WithLoandingPanel } from "../content/withLoandingPanel";
import { AppBar, Typography } from "@material-ui/core";
import '../components/AsistenciaPersonaHorarioDia.css';
import { handleErrorMessages, handleInfoMessages } from "../../store/ducks/notify-messages";
import { servicePersonaGrupo } from "../../api/asistencia/personaGrupo.api";
import { useSelector } from "react-redux";    

const AsistenciaPersonaJustificacionMarcacionPopUp = (props) => {
  const { intl, setLoading, varIdPersona, varFecha, dataRowEditNew, modeView, dataZona, 
    dataTipoIdentificacion } = props;
  const perfil = useSelector((state) => state.perfil.perfilActual);
  const [lstZona, setlstZona] = useState([]);
  const [lstEquipo, setlstEquipo] = useState([]);
  const [lstTipoIdentificacion, setlstTipoIdentificacion] = useState([]); 
  const classesEncabezado = useStylesEncabezado();
  const [estados, setEstados] = useState([]); 

  useEffect(() => {
    console.log("--useEffect-- poopupmarcacion--");
    dataRowEditNew.IdPersona = props.varIdPersona;
    try {
      cargarCombos();
    } catch (error) {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), error)
    } 

  }, [dataZona, dataTipoIdentificacion]);
 

  async function cargarCombos() {

    console.log("dataZona : ", dataZona, " | dataTipoIdentificacion : ", dataTipoIdentificacion,
      " | estados : ", estados);

    let estados = listarEstado();
    setlstZona(dataZona);//--cboZona 
    setlstTipoIdentificacion(dataTipoIdentificacion);//--cboTipoIdentificacion
    setEstados(estados);

  }

  async function onValueChangedZona(value) {
    console.log("Enter to onValueChangedZona ::: value::>> ", value);
    if (isNotEmpty(value)) {

      dataRowEditNew.IdEquipo = '';

      let cboEquipo = await servicePersonaGrupo.obtenerZonaEquipo({
        IdCliente: perfil.IdCliente,
        IdDivision: perfil.IdDivision,
        IdPersona: varIdPersona,
        IdZona: value,
      });
      setlstEquipo(cboEquipo);
    } else {
      dataRowEditNew.IdEquipo = '';
      setlstEquipo([]);
    }

  }

  function grabarMarcacion(e) {

    if (dataRowEditNew.FechaCorta === undefined) {
      handleInfoMessages(
        intl.formatMessage({ id: "ACCESS.PERSON.MARK.DATE.VALID" })
      );
      return;
    }
    if (dataRowEditNew.Minutos === undefined) {
      handleInfoMessages(
        intl.formatMessage({ id: "ACCESS.PERSON.MARK.HOUR.VALID" })
      );
      return;
    }

    let fecha = dataRowEditNew.FechaCorta;
    let hora = dataRowEditNew.Minutos;
    let fechaMarca = add_hora_fecha(fecha, hora);
    dataRowEditNew.FechaMarca = fechaMarca;
    let { Entrada, Online } = dataRowEditNew;
    dataRowEditNew.Entrada = Entrada ? "S" : "N";
    let result = e.validationGroup.validate();

    if (result.isValid)
      props.agregarMarcacion(dataRowEditNew);
 
  }

  function add_hora_fecha(fec1, fec2) {
    fec1.setHours(fec2.getHours());
    fec1.setMinutes(fec2.getMinutes());
    fec1.setSeconds(fec2.getSeconds());
    return fec1;
  }
 
  return (
    <>
      <div id='divPopUpMarcacion'   >
        <Portlet>

          {/* <React.Fragment> */}
          <Form validationGroup="FormEdicion" >
            <GroupItem itemType="group" colCount={2} colSpan={2} >
              <Item colSpan={2}>
                <AppBar position="static" className={classesEncabezado.secundario}>
                  <Typography variant="h6" color="inherit" className={classesEncabezado.title} >
                    {intl.formatMessage({ id: "ADMINISTRATION.BRAND.ADD" })}
                  </Typography>
                </AppBar>
              </Item>
              <Item colSpan={2}>
                <div style={{ textAlign: 'right' }}>
                  <Button
                    icon="fa fa-save"
                    type="default"
                    hint={intl.formatMessage({ id: "ACTION.RECORD" })}
                    onClick={grabarMarcacion}
                    useSubmitBehavior={true}
                    validationGroup="FormEdicion"
                    disabled={modeView}
                  />
                  <Button
                    icon="fa fa-times-circle"
                    type="normal"
                    hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
                    onClick={props.cancelarMarcacion}
                  />
                </div>
              </Item>
            </GroupItem>
          </Form>
 

          <Form formData={dataRowEditNew} validationGroup="FormEdicion">
            <GroupItem itemType="group" colCount={2} colSpan={2}>
              <SimpleItem dataField="IdPersona" visible={false}></SimpleItem>
              <SimpleItem dataField="IdSecuencial" visible={false}></SimpleItem>

               <Item dataField="Hash"
                visible={false}
                // editorOptions={{
                //   value: isNotEmpty(cadenaMarcacion) ? cadenaMarcacion : dataRowEditNew.Hash
                // }} 
              /> 

 
              <Item
                label={{ visible: false }}
              >
                {/* {dataRowEditNew.RegistroAlterado && (
                  <div className="detalle_barraTextHash">
                    <h6 style={{ color: "white" }}>{intl.formatMessage({ id: "ADMINISTRATION.PERSON.MARKING.ALTERED" })}</h6>
                  </div>
                )} */}

              </Item>  

              <Item />

              <Item
                dataField="IdZona"
                label={{ text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.ZONE", }), }}
                editorType="dxSelectBox"
                isRequired={true}
                editorOptions={{
                  items: lstZona,
                  valueExpr: "IdZona",
                  displayExpr: "Zona",
                  onValueChanged: (e) => onValueChangedZona(e.value), //LSF
                  searchEnabled: true,
                  showClearButton: true,
                  readOnly: modeView ? true : false
                }}
              />


              <Item
                dataField="IdEquipo"
                label={{ text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.EQUIPMENT", }), }}
                editorType="dxSelectBox"
                editorOptions={{
                  items: lstEquipo,
                  valueExpr: "IdEquipo",
                  displayExpr: "Equipo",
                  showClearButton: true,
                  searchEnabled: true,
                  readOnly: modeView ? true : false
                }}
              />

              <Item
                dataField="IdTipoIdentificacion"
                label={{ text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.IDTYPE", }), }}
                isRequired={true}
                editorType="dxSelectBox"
                editorOptions={{
                  readOnly: true,
                  items: lstTipoIdentificacion,
                  valueExpr: "IdTipoIdentificacion",
                  displayExpr: "TipoIdentificacion",
                }}
              />

              <Item
                dataField="Identificacion"
                label={{ text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.ID" }), }}
                editorOptions={{
                  maxLength: 20,
                  inputAttr: { style: "text-transform: uppercase" },
                  readOnly: true, //Se obtiene el documento de la persona
                }}
              />


              <Item
                dataField="FechaCorta"
                label={{ text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.DATE" }) }}
                isRequired={true}
                editorType="dxDateBox"
                dataType="datetime"
                editorOptions={{
                  displayFormat: "dd/MM/yyyy",
                  readOnly: true  //modeView ? true : false 
                }}
              />

              <Item
                dataField="Minutos"
                label={{ text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.HOUR" }) }}
                isRequired={true}
                editorType="dxDateBox"
                editorOptions={{
                  type: "time",
                  showClearButton: true,
                  maxLength: 5,
                  displayFormat: "HH:mm",
                  useMaskBehavior: true,
                  readOnly: modeView ? true : false
                }}
              />

              <Item
                dataField="Observacion"
                label={{ text: intl.formatMessage({ id: "COMMON.OBSERVATION" }), }}
                isRequired={true}
                colSpan={2}
                editorType="dxTextArea"
                editorOptions={{
                  maxLength: 500,
                  inputAttr: { style: "text-transform: uppercase" },
                  width: "100%",
                  height: 30,
                  readOnly: modeView ? true : false
                }}
              />

            </GroupItem>
          </Form>

          <br />
        </Portlet>
      </div>
    </>
  );

};
 
export default injectIntl(WithLoandingPanel(AsistenciaPersonaJustificacionMarcacionPopUp));
