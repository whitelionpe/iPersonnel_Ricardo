import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import Form, { Item, GroupItem } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";
import { obtenerTodos as obtenerAplicaciones } from "../../../../api/sistema/moduloAplicacion.api";
import { useSelector } from "react-redux";
import MenuTreeViewPage from "../../../../partials/content/TreeView/MenuTreeViewPage";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import { handleInfoMessages } from "../../../../store/ducks/notify-messages";
import { isNotEmpty } from "../../../../../_metronic";
//import { isNotEmpty } from "../../../../../_metronic";
//import { listarEstadoSimple, isRequired, isModified } from "../../../../../_metronic";
import HeaderInformation from "../../../../partials/components/HeaderInformation";
import FieldsetAcreditacion from '../../../../partials/content/Acreditacion/FieldsetAcreditacion/FieldsetAcreditacion';

const PerfilMenuEditPage = props => {
  const { intl, setLoading, modoEdicion, modoEdicionMenu, accessButton } = props;
  const { IdCliente, IdDivision } = useSelector(state => state.perfil.perfilActual);
  const classesEncabezado = useStylesEncabezado();
  const [cmbAplicacion, setCmbAplicacion] = useState([]);

  const [selectedNodos, setSelectedNodos] = useState([]);

  async function cargarCombos() {
    let cmbAplicacion = [];
    if (!props.dataRowEditNew.esNuevoRegistro) {
      //Accion editar
      cmbAplicacion = await obtenerAplicaciones({ IdCliente, IdDivision, IdModulo: '%' });
    }
    setCmbAplicacion(cmbAplicacion);
  }

  async function onValueChangedModulo(value) {
    setLoading(true);
    await obtenerAplicaciones({ IdCliente, IdDivision, IdModulo: value }).then(aplicaciones => {
      setCmbAplicacion(aplicaciones);
    }).finally(() => { setLoading(false) });

  }


  function grabar(e) {
    if (selectedNodos.length > 0) {

      //Listar por IdPadre   
      let nodoChildSelected = selectedNodos[0].selectNodo.filter(data => { return isNotEmpty(data.IdMenuPadre) });
      //Obtener array de idMenu
      const uniqueSelectIdMenu = [...new Set(nodoChildSelected.map(item => item.IdMenuPadre))];
      //Listar objetos menu de acuerdo a uniqueIdMenu
      let dataMenu = selectedNodos[1].dataAll.filter(i => uniqueSelectIdMenu.includes(i.IdMenu) && i.Nivel === 1);
      //Listar objetos seleccionados nivel 2
      let dataObjeto = selectedNodos[0].selectNodo.filter(data => { return data.Nivel === 2 });

      //No seleccionados.
      let dataMenuNoSelect = selectedNodos[1].dataAll.filter(d => !uniqueSelectIdMenu.includes(d.IdMenu) && d.Edit && d.Nivel === 1);
      dataMenuNoSelect.map(item => {
        dataMenu.push(item);
      });

      let nodoChildNoSelected = selectedNodos[1].dataAll.filter(d => { return d.selected === false && d.Nivel === 2 });
      nodoChildNoSelected.map(objet => {
        dataObjeto.push(objet);
      });
      ///>Proteccion de datos

      let dataProtection = dataMenuNoSelect.filter(d => { return d.DataProtecion === true });

      if (dataMenu.length > 0) {
        props.agregarPerfilMenu(props.dataRowEditNew, dataMenu, dataObjeto, dataProtection);
      } else {
        handleInfoMessages(intl.formatMessage({ id: "MESSAGES.SELECT.ROW" }));
      }
    } else {
      handleInfoMessages(intl.formatMessage({ id: "MESSAGES.NO.CHANGES" }));
    }

  }
  function seleccionarNodo(selectNodo, dataAll) {

    setSelectedNodos([{ selectNodo }, { dataAll }]);
  }

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
              </PortletHeaderToolbar>
            }
          />


        } />



      <PortletBody >
        <React.Fragment>
          <FieldsetAcreditacion title={intl.formatMessage({ id: "COMMON.DETAIL" })}>
            <Form formData={props.dataRowEditNew} validationGroup="FormEdicion" >
              <GroupItem itemType="group" colCount={2} colSpan={2}>
                <Item
                  dataField="IdModulo"
                  label={{ text: intl.formatMessage({ id: "SECURITY.PROFILE.MENU.MODULE" }) }}
                  editorType="dxSelectBox"
                  isRequired={modoEdicion}
                  editorOptions={{
                    items: props.moduloData,
                    valueExpr: "IdModulo",
                    displayExpr: "Modulo",
                    readOnly: !props.dataRowEditNew.esNuevoRegistro ? true : false,
                    onValueChanged: (e => onValueChangedModulo(e.value))
                  }}
                />
                <Item
                  dataField="IdAplicacion"
                  label={{ text: intl.formatMessage({ id: "SECURITY.PROFILE.MENU.APLICATION" }) }}
                  editorType="dxSelectBox"
                  isRequired={modoEdicion}
                  editorOptions={{
                    items: cmbAplicacion,
                    valueExpr: "IdAplicacion",
                    displayExpr: "Aplicacion",
                    readOnly: !props.dataRowEditNew.esNuevoRegistro ? true : false,
                    onValueChanged: (e => {
                      //Listar menú..
                      props.listarTreeview(props.dataRowEditNew, modoEdicionMenu);

                    })
                  }}
                />
              </GroupItem>
            </Form>
          </FieldsetAcreditacion>

          <FieldsetAcreditacion title={intl.formatMessage({ id: "SYSTEM.MENU.MENU" })}>
           
              <MenuTreeViewPage
                modoEdicion={modoEdicionMenu}
                menus={props.menus}
                showCheckBoxesModes={"normal"}
                selectionMode={"multiple"}
                setSelectedNodos={setSelectedNodos}
                seleccionarNodo={seleccionarNodo}
                selectNodesRecursive={true}
              />
           
          </FieldsetAcreditacion>
        </React.Fragment>
      </PortletBody>
    </>
  );
};

export default injectIntl(WithLoandingPanel(PerfilMenuEditPage));
