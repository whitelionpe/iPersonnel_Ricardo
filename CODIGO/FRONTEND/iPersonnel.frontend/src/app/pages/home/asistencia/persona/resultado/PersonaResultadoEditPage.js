import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import WithLoandingPanel from "../../../../../partials/content/withLoandingPanel";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import { Button, Form } from "devextreme-react";
import { useSelector } from "react-redux";
import FieldsetAcreditacion from "../../../../../partials/content/Acreditacion/FieldsetAcreditacion/FieldsetAcreditacion";
import { GroupItem, Item, SimpleItem, EmptyItem } from "devextreme-react/form";
import { isRequired } from "../../../../../../_metronic/utils/securityUtils";
import { isNotEmpty } from "../../../../../../_metronic";
import AsistenciaDetalleBuscar from "../../../../../partials/components/AsistenciaDetalleBuscar";

import { obtenerTodos as obtenerDetalleHorario } from "../../../../../api/asistencia/horarioDia.api";



const PersonaResultadoEditPage = (props) => {

  const { intl, modoEdicion, settingDataField, accessButton, dataRowEditNew, setLoading, modeView } = props;
  const perfil = useSelector((state) => state.perfil.perfilActual);

  const [isVisiblePopUpHorarioDia, setisVisiblePopUpHorarioDia] = useState(false);
  const [listarPopUpHorarioDias, setListarPopUpHorarioDias] = useState([]);

  const personaHorarioDetalle = async () => {
    setLoading(true);
    await obtenerDetalleHorario({
      IdCliente: perfil.IdCliente,
      IdDivision: perfil.IdDivision,
      IdCompania: dataRowEditNew.IdCompania,
      IdHorario: dataRowEditNew.IdHorario
    }).then(data => {
      setListarPopUpHorarioDias(data);
      setisVisiblePopUpHorarioDia(true);
    }).finally(() => { setLoading(false) });

  }

  return <>
    <HeaderInformation data={props.getInfo()} visible={true} labelLocation={'left'} colCount={6}
      toolbar={
        <PortletHeader
          title=""
          toolbar={
            <PortletHeaderToolbar>
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

        <FieldsetAcreditacion title={intl.formatMessage({ id: "ACCESS.HORARIO.DETALLEHORARIO" })}>
          <Form formData={dataRowEditNew} validationGroup="FormEdicion" >
            <GroupItem itemType="group" colCount={5} colSpan={5} >
              <Item
                dataField="IdHorario"
                label={{ text: intl.formatMessage({ id: "ASISTENCIA.PERSONA.BOLSAHORAS.CODIGO" }), }}
                colSpan={2}
                editorOptions={{
                  maxLength: 20,
                  inputAttr: { style: "text-transform: uppercase" },
                  readOnly: true, //Se obtiene el documento de la persona
                }}
              />
              <Item
                dataField="Horario"
                label={{ text: intl.formatMessage({ id: "ASSISTANCE.SPECIAL.CONDITIONS.DESCRIPTION" }), }}
                colSpan={2}
                editorOptions={{
                  inputAttr: { style: "text-transform: uppercase" },
                  readOnly: true, //Se obtiene el documento de la persona 
                }}
              />
              <Item
                colSpan={1}
              >
                &nbsp;
                <Button
                  icon="far fa-calendar-alt"
                  type="default"
                  hint={intl.formatMessage({ id: "ASSISTANCE.PERSON.SCHEDULE.VIEW" })}
                  // useSubmitBehavior={true}
                  onClick={personaHorarioDetalle}
                />
                {/* <EmptyItem
                  colSpan={1}></EmptyItem> */}
              </Item>

              <Item />
            </GroupItem>
          </Form>

          <Form formData={dataRowEditNew} validationGroup="FormEdicion" labelLocation="top" >
            <GroupItem itemType="group" colCount={5} colSpan={5} >

              <Item
                dataField="InicioControl"
                label={{ text: intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.START" }), }}
                editorOptions={{
                  inputAttr: { style: "text-transform: uppercase" },
                  readOnly: true, //Se obtiene el documento de la persona 
                }}
              />

              <Item
                dataField="HoraEntrada"
                label={{ text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.CHECK" }), }}
                editorOptions={{
                  inputAttr: { style: "text-transform: uppercase" },
                  readOnly: true, //Se obtiene el documento de la persona 
                }}
              />

              <Item
                dataField="MinutosTolerancia"
                label={{ text: intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.TOLERANCE" }), }}
                editorOptions={{
                  inputAttr: { style: "text-transform: uppercase" },
                  readOnly: true, //Se obtiene el documento de la persona 
                }}
              />

              <Item
                dataField="HoraSalida"
                label={{ text: intl.formatMessage({ id: "ASISTENCIA.PERSONA.BOLSAHORAS.SALIDA" }), }}
                editorOptions={{
                  inputAttr: { style: "text-transform: uppercase" },
                  readOnly: true, //Se obtiene el documento de la persona 
                }}
              />

              <Item
                dataField="ControlHEDespues"
                label={{ text: intl.formatMessage({ id: "ASSISTANCE.RESULT.PERSON.INIT_EXTRA_HOUR" }), }}
                editorOptions={{
                  inputAttr: { style: "text-transform: uppercase" },
                  readOnly: true, //Se obtiene el documento de la persona 
                }}
              />

            </GroupItem>
          </Form>
        </FieldsetAcreditacion>

        <Form>
          <GroupItem colCount={5} colSpan={5}>
            <GroupItem colCount={2} colSpan={2}>

              <FieldsetAcreditacion title={intl.formatMessage({ id: "ASSISTANCE.RESULT.PERSON.CALCULATE_HOUR" })}>
                <Form formData={dataRowEditNew} validationGroup="FormEdicion">
                  <GroupItem itemType="group" colCount={2} colSpan={2}>

                    <Item
                      dataField="MinutosTrabajados"
                      label={{ text: intl.formatMessage({ id: "ASSISTANCE.RESULT.PERSON.WORKED_MINUTES" }), }}
                      editorOptions={{
                        inputAttr: { style: "text-transform: uppercase" },
                        readOnly: true, //Se obtiene el documento de la persona 
                      }}
                    />
                    <Item
                      dataField="MinutosExtrasEntrada"
                      label={{ text: intl.formatMessage({ id: "ASSISTANCE.RESULT.PERSON.EXTRAHOUR_INIT" }), }}
                      editorOptions={{
                        inputAttr: { style: "text-transform: uppercase" },
                        readOnly: true, //Se obtiene el documento de la persona 
                      }}
                    />

                    <Item
                      dataField="MinutosRefrigerio"
                      label={{ text: intl.formatMessage({ id: "ASSISTANCE.RESULT.PERSON.BREAKE_MINUTES" }), }}
                      editorOptions={{
                        inputAttr: { style: "text-transform: uppercase" },
                        readOnly: true, //Se obtiene el documento de la persona 
                      }}
                    />
                    <Item
                      dataField="MinutosExtrasSalida"
                      label={{ text: intl.formatMessage({ id: "ASSISTANCE.RESULT.PERSON.EXTRAHOUR_END" }), }}
                      editorOptions={{
                        inputAttr: { style: "text-transform: uppercase" },
                        readOnly: true, //Se obtiene el documento de la persona 
                      }}
                    />

                    <Item
                      dataField="MinutosTardanza"
                      label={{ text: intl.formatMessage({ id: "ASSISTANCE.RESULT.PERSON.TARDINESS_MINUTES" }), }}
                      editorOptions={{
                        inputAttr: { style: "text-transform: uppercase" },
                        readOnly: true, //Se obtiene el documento de la persona 
                      }}
                    />
                    <Item
                      dataField="Intermedio"
                      label={{ text: intl.formatMessage({ id: "ASSISTANCE.RESULT.PERSON.INTERMEDIATE" }), }}
                      editorOptions={{
                        inputAttr: { style: "text-transform: uppercase" },
                        readOnly: true, //Se obtiene el documento de la persona 
                      }}
                    />

                    <Item
                      dataField="MinutosSalidaTemprano"
                      label={{ text: intl.formatMessage({ id: "ASSISTANCE.RESULT.PERSON.EARLY_DEPARTURE_MINUTES" }), }}
                      editorOptions={{
                        inputAttr: { style: "text-transform: uppercase" },
                        readOnly: true, //Se obtiene el documento de la persona 
                      }}
                    />
                    <Item
                      dataField="MinutosPermisoPago"
                      label={{ text: intl.formatMessage({ id: "ASSISTANCE.RESULT.PERSON.PAID_PERSON" }), }}
                      editorOptions={{
                        inputAttr: { style: "text-transform: uppercase" },
                        readOnly: true, //Se obtiene el documento de la persona 
                      }}
                    />

                    <Item
                      dataField="DiaLaborable"
                      label={{ text: intl.formatMessage({ id: "ASSISTANCE.WEEKDAY" }), }}
                      editorOptions={{
                        inputAttr: { style: "text-transform: uppercase" },
                        readOnly: true, //Se obtiene el documento de la persona 
                      }}
                    />
                    <Item
                      dataField="MinutosPermisoImpago"
                      label={{ text: intl.formatMessage({ id: "ASSISTANCE.RESULT.PERSON.UNPAID_PERSON" }), }}
                      editorOptions={{
                        inputAttr: { style: "text-transform: uppercase" },
                        readOnly: true, //Se obtiene el documento de la persona 
                      }}
                    />

                  </GroupItem>
                </Form>
              </FieldsetAcreditacion>

            </GroupItem>
            <GroupItem colCount={3} colSpan={3}>
 
              <FieldsetAcreditacion title={intl.formatMessage({ id: "ASSISTANCE.RESULT.PERSON.PROCECED_MARKS" })}>
                <Form formData={dataRowEditNew} validationGroup="FormEdicion">
                  <GroupItem itemType="group" colCount={3} colSpan={3}>

                    <Item
                      dataField="DetalleMarcacion"
                      label={{ text: intl.formatMessage({ id: "CONFIG.MENU.ADMINISTRACION.MARCAS" }), }}
                      
                      colSpan={3}
                      editorType="dxTextArea"
                      editorOptions={{
                        maxLength: 5000,
                        inputAttr: { style: "text-transform: uppercase" },
                        width: "100%",
                        height: "200px",
                        readOnly: true, 
                      }}
                    />

                  </GroupItem>
                </Form>
              </FieldsetAcreditacion>

            </GroupItem>
          </GroupItem>
        </Form>



      </React.Fragment>
    </PortletBody>
    {isVisiblePopUpHorarioDia && (
      <AsistenciaDetalleBuscar
        listDetalle={listarPopUpHorarioDias}
        showPopup={{ isVisiblePopUp: isVisiblePopUpHorarioDia, setisVisiblePopUp: setisVisiblePopUpHorarioDia }}
        cancelar={() => setisVisiblePopUpHorarioDia(false)}
        showButton={false}
      />
    )}

  </>;
}

export default injectIntl(WithLoandingPanel(PersonaResultadoEditPage));


