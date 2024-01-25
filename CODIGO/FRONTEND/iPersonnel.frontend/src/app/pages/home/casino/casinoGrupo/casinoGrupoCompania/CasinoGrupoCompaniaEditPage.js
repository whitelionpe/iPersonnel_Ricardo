import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import Form, {
  Item,
  GroupItem
} from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../../store/config/Styles";
import AdministracionCompaniaBuscar from "../../../../../partials/components/AdministracionCompaniaBuscar";
import { listarEstadoSimple } from "../../../../../../_metronic";
import { handleInfoMessages } from "../../../../../store/ducks/notify-messages";

const CasinoGrupoCompaniaEditPage = props => {
  const { intl, modoEdicion, accessButton } = props;
  const [popupVisibleCompania, setPopupVisibleCompania] = useState(false);
  const classesEncabezado = useStylesEncabezado();

  function grabar(e) {
    let result = e.validationGroup.validate();
    if (result.isValid) {

      if (Date.parse(new Date(props.dataRowEditNew.FechaInicio)) > Date.parse(new Date(props.dataRowEditNew.FechaFin))) {
        handleInfoMessages(intl.formatMessage({ id: "ACCESS.PERSON.STARTDATE.VALID" }));
        return;
      }

      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregarCompaniaGrupo(props.dataRowEditNew);
      } else {
        props.actualizarCompaniaGrupo(props.dataRowEditNew);
      }
    }
  }

  const selectCompania = (dataPopup) => {
    var companias = dataPopup.map(x => (x.IdCompania)).join(',');
    props.dataRowEditNew.IdCompania = companias;

    let cadenaMostrar = dataPopup.map(x => (x.Compania)).join(', ');
    if (cadenaMostrar.length > 100) {
      cadenaMostrar = cadenaMostrar.substring(0, 100) + '...';
    }
    props.dataRowEditNew.Compania = cadenaMostrar
    setPopupVisibleCompania(false);
  }

  useEffect(() => {
  }, []);

  return (
    <>
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

              <Item
                dataField="Compania"
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.COMPANY" }) }}
                isRequired={true}
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
                        setPopupVisibleCompania(true);
                      },
                    }
                  }]
                }}
              />
              <Item></Item>

              <Item
                dataField="FechaInicio"
                label={{ text: intl.formatMessage({ id: "CASINO.PERSON.GROUP.STARTDATE" }) }}
                editorType="dxDateBox"
                dataType="date"
                isRequired={modoEdicion}
                editorOptions={{
                  displayFormat: "dd/MM/yyyy",
                }}
              />

              <Item
                dataField="FechaFin"
                label={{ text: intl.formatMessage({ id: "CASINO.PERSON.GROUP.ENDDATE" }) }}
                editorType="dxDateBox"
                dataType="date"
                isRequired={modoEdicion}
                editorOptions={{
                  displayFormat: "dd/MM/yyyy",
                }}
              />
              <Item></Item>
              <Item
                dataField="Activo"
                label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
                editorType="dxSelectBox"
                isRequired={modoEdicion}
                editorOptions={{
                  readOnly: !(modoEdicion ? (props.dataRowEditNew.esNuevoRegistro ? false : true) : false),
                  items: listarEstadoSimple(),
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                }}
              />

            </GroupItem>
          </Form>

          {/*** PopUp -> Buscar Compania ****/}
          {popupVisibleCompania && (
            <AdministracionCompaniaBuscar
              selectData={selectCompania}
              showPopup={{ isVisiblePopUp: popupVisibleCompania, setisVisiblePopUp: setPopupVisibleCompania }}
              cancelarEdicion={() => setPopupVisibleCompania(false)}
              uniqueId={"casinoGrupoCompaniaBuscar"}
              selectionMode={"multiple"}
            />
          )}

        </React.Fragment>
      </PortletBody>
    </>
  );
};

export default injectIntl(CasinoGrupoCompaniaEditPage);
