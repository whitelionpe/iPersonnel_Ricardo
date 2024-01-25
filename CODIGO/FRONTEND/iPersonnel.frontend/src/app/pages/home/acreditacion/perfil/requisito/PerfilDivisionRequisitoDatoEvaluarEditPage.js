import React, { useEffect, useState } from "react";
//import { useSelector } from "react-redux";
import Form, { Item, GroupItem, SimpleItem } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody } from "../../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../../store/config/Styles";
import { injectIntl } from "react-intl";
import { listarEstadoSimple, listarEstado } from "../../../../../../_metronic/utils/utils";
import { listar as listarDatoEvaluar } from "../../../../../api/acreditacion/requisitoDatoEvaluar.api";
import WithLoandingPanel from "../../../../../partials/content/withLoandingPanel";

const PerfilDivisionRequisitoDatoEvaluarEditPage = props => {
  const { intl, dataRowEditNew, setLoading } = props;
  const classesEncabezado = useStylesEncabezado();
  const [datosEvaluar, setDatosEvaluar] = useState([]);

  useEffect(() => {
    if (dataRowEditNew) cargarCombos(props.dataRowEditNew);
  }, [dataRowEditNew]);

  async function cargarCombos(dataRow) {
    const { IdCliente, IdRequisito } = dataRow;
    setLoading(true);
    let datoEvaluar = await listarDatoEvaluar({ IdCliente, IdRequisito }).finally(() => { setLoading(false) });
    setDatosEvaluar(datoEvaluar);
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

  /******************************************************************* */

  return (
    <>

      <PortletBody >
        <Button
          id="idButtonGrabar"
          icon="fa fa-save"
          type="default"
          hint={intl.formatMessage({ id: "ACTION.RECORD" })}
          onClick={grabar}
          useSubmitBehavior={true}
          validationGroup="FormEdicion"
          style={{ display: "none" }}
        />
        <React.Fragment>
          <Form formData={props.dataRowEditNew} validationGroup="FormEdicion" >
            <GroupItem itemType="group" colCount={2} colSpan={2}>
              <Item colSpan={2}>
                <AppBar position="static" className={classesEncabezado.secundario}>
                  <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                    <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                      {intl.formatMessage({ id: "COMMON.DETAIL" }) + " - " + intl.formatMessage({ id: "ACCREDITATION.DATAEVALUATE.TAB" })}
                    </Typography>
                  </Toolbar>
                </AppBar>
              </Item>

              <SimpleItem dataField="IdCliente" visible={false}></SimpleItem>
              <SimpleItem dataField="IdPerfil" visible={false}></SimpleItem>
              <SimpleItem dataField="IdDivision" visible={false}></SimpleItem>
              <SimpleItem dataField="IdRequisito" visible={false}></SimpleItem>

              <Item colSpan={1} dataField="Requisito"
                label={{ text: intl.formatMessage({ id: "ACCREDITATION.REQUIREMENT" }) }}
                editorOptions={{ readOnly: true, }}
              />

              <Item
                dataField="IdDatoEvaluar"
                label={{ text: intl.formatMessage({ id: "ACCREDITATION.DATAEVALUATE" }) }}
                editorType="dxSelectBox"
                isRequired={true}
                editorOptions={{
                  items: datosEvaluar,
                  valueExpr: "IdDatoEvaluar",
                  displayExpr: "DatoEvaluar",
                  readOnly: !props.dataRowEditNew.esNuevoRegistro,
                  // onValueChanged: (e) => onValueChangedTipo(e.value),
                  placeholder: "Seleccione..",
                }}
              />

              <Item
                dataField="AdjuntarArchivo"
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.INDISCIPLINE.ATTACHFILE" }) }}
                editorType="dxSelectBox"
                isRequired={true}
                editorOptions={{
                  //readOnly: !props.modoEdicion,
                  items: listarEstado(),
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                  readOnly: props.dataRowEditNew.esNuevoRegistro ? true : !props.modoEdicion,
                }}
              />
              <Item
                dataField="Activo"
                label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
                editorType="dxSelectBox"
                isRequired={true}
                editorOptions={{
                  //readOnly: !props.modoEdicion,
                  items: listarEstadoSimple(),
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                  readOnly: props.dataRowEditNew.esNuevoRegistro ? true : !props.modoEdicion,
                }}
              />

            </GroupItem>
          </Form>


        </React.Fragment>
      </PortletBody>

    </>
  );

};

export default injectIntl(WithLoandingPanel(PerfilDivisionRequisitoDatoEvaluarEditPage));

