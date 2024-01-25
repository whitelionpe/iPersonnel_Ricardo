import React, { useEffect, useState } from "react";
import Form, { Item, GroupItem } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../../store/config/Styles";
import { useSelector } from "react-redux";
import { handleInfoMessages } from "../../../../../store/ducks/notify-messages";
import { listarEstadoSimple, listarEstado, isNotEmpty } from "../../../../../../_metronic";
import { isRequired, isModified } from "../../../../../../_metronic/utils/securityUtils";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";
import AccesoGrupoRestriccionBuscar from "../../../../../partials/components/AccesoGrupoRestriccionBuscar";
//Multi-idioma
import { injectIntl } from "react-intl";
import FieldsetAcreditacion from '../../../../../partials/content/Acreditacion/FieldsetAcreditacion/FieldsetAcreditacion';
 
const GrupoRestriccionEditPage = props => {

  //multi-idioma
  const { intl, modoEdicion, settingDataField, dataRowEditNew } = props;


  //const [estado, setEstado] = useState([]);
  const [estadoSimple, setEstadoSimple] = useState([]);
  const classesEncabezado = useStylesEncabezado();

  const [isVisiblePopUpRestriccion, setisVisiblePopUpRestriccion] = useState(false);
  const [dayCompleteReadOnly, setDayCompleteReadOnly] = useState(false);
  const [hourReadOnly, setHourReadOnly] = useState(false);
  const [horaMin, setHoraMin] = useState(new Date('2020-01-01 00:00:00.000'));
  const [horaMax, setHoraMax] = useState(new Date('2020-01-01 23:59:00.000'));

  async function cargarCombos() {
    //let estado = listarEstado();
    //setEstado(estado);
    let estadoSimple = listarEstadoSimple();
    setEstadoSimple(estadoSimple);
  }

  function grabar(e) {

    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (Date.parse(new Date(dataRowEditNew.FechaInicio)) > Date.parse(new Date(dataRowEditNew.FechaFin))) {
        handleInfoMessages(intl.formatMessage({ id: "ACCESS.PERSON.STARTDATE.VALID" }));
        return;
      }
      if (dataRowEditNew.esNuevoRegistro) {
        props.agregarRestriccion(dataRowEditNew);
      } else {
        props.actualizarRestriccion(dataRowEditNew);
      }
    }
  }


  const agregar = (dataPopup) => {
    const { IdRestriccion, Restriccion } = dataPopup[0];
    setisVisiblePopUpRestriccion(false);
    if (isNotEmpty(IdRestriccion)) {
      props.setDataRowEditNew({
        ...dataRowEditNew,
        IdRestriccion: IdRestriccion,
        Restriccion: Restriccion,
      });
    }
  };

  useEffect(() => {
    cargarCombos();
  }, []);


  return (
    <>

      <HeaderInformation data={props.getInfo()} visible={true} labelLocation={'left'} colCount={6}
        toolbar={
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

      <PortletBody>
        <React.Fragment>
        

          <Form formData={dataRowEditNew} validationGroup="FormEdicion" >
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
              <Item dataField="Restriccion" with="50"
                isRequired={modoEdicion}
                label={{ text: intl.formatMessage({ id: "ACCESS.GROUP.RESTRICTION" }) }}
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
                      disabled: !dataRowEditNew.esNuevoRegistro ? true : false,
                      onClick: () => {
                        setisVisiblePopUpRestriccion(true);
                      },
                    }
                  }]

                }}
              />
              <Item
                dataField="FlgDiaCompleto"
                label={{ text: intl.formatMessage({ id: "ACCESS.GROUP.RESTRICTION.COMPLETEDAY" }) }}
                editorType="dxSelectBox"
                isRequired={modoEdicion ? isRequired('FlgDiaCompleto', settingDataField) : false}
                editorOptions={{
                  items: listarEstado(),
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                  onValueChanged: (e) => { setHourReadOnly(e.value === 'S' ? true : false) }
                }}
              />

              <Item dataField="FechaInicio"
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.STARTDATE" }) }}
                isRequired={modoEdicion ? isRequired('FechaInicio', settingDataField) : false}
                editorType="dxDateBox"
                editorOptions={{
                  type: "date",
                  //inputAttr: { 'style': 'text-transform: uppercase' },
                  displayFormat: "dd/MM/yyyy",
                  readOnly: !(modoEdicion ? isModified('FechaInicio', settingDataField) : false)
                }}
              />

              <Item dataField="FechaFin"
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.ENDDATE" }) }}
                isRequired={modoEdicion ? isRequired('FechaFin', settingDataField) : false}
                editorType="dxDateBox"
                editorOptions={{
                  type: "date",
                  //inputAttr: { 'style': 'text-transform: uppercase' },
                  displayFormat: "dd/MM/yyyy",
                  readOnly: !(modoEdicion ? isModified('FechaFin', settingDataField) : false)
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
                  type: "time",
                  readOnly: hourReadOnly,
                  value: hourReadOnly ? horaMin : (dataRowEditNew.esNuevoRegistro ? new Date('2020-01-01 08:00:00.000') : dataRowEditNew.HoraInicio)
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
                  type: "time",
                  readOnly: hourReadOnly,
                  value: hourReadOnly ? horaMax : (dataRowEditNew.esNuevoRegistro ? new Date('2020-01-01 18:00:00.000') : dataRowEditNew.HoraFin)
                }}
              />

              <Item
                dataField="Activo"
                label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
                editorType="dxSelectBox"
                isRequired={modoEdicion}
                editorOptions={{
                  items: estadoSimple,
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                  readOnly: !(modoEdicion ? (dataRowEditNew.esNuevoRegistro ? false : true) : false)
                }}
              />

            </GroupItem>
          </Form>
          
          
          {/*** PopUp ****/}
          {isVisiblePopUpRestriccion && (
            <AccesoGrupoRestriccionBuscar
              dataSource={props.accesoRestriccionData}
              selectData={agregar}
              showPopup={{ isVisiblePopUp: isVisiblePopUpRestriccion, setisVisiblePopUp: setisVisiblePopUpRestriccion }}
              cancelarEdicion={() => setisVisiblePopUpRestriccion(false)}
              // IdCliente={props.IdCliente}
              selectionMode={"row"}
            />
          )}

        </React.Fragment>
      </PortletBody>
    </>
  );

};

export default injectIntl(GrupoRestriccionEditPage);
