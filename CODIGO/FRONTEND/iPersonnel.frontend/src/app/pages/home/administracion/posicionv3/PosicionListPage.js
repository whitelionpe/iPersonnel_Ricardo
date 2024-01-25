import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import Form, { Item, GroupItem } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";
import { useSelector } from "react-redux";
import MenuTreeViewPage from "../../../../partials/content/TreeView/MenuTreeViewPage";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import { handleInfoMessages } from "../../../../store/ducks/notify-messages";
import { isNotEmpty } from "../../../../../_metronic";

import { obtenerTodos as obtenerTodosDivisiones } from "../../../../api/sistema/division.api";


const PosicionListPage = props => {
  const { intl, setLoading, modoEdicion, accessButton } = props;
  const { IdCliente, IdDivision } = useSelector(state => state.perfil.perfilActual);

  const classesEncabezado = useStylesEncabezado();

  const [cmbDivisiones, setCmbDivisiones] = useState([]);
  const [currentDivision, setCurrentDivision] = useState("");




  async function cargarCombos() {
    await obtenerTodosDivisiones({ IdCliente })
      .then(
        divisiones => {

          setCmbDivisiones(divisiones);
          setCurrentDivision("DIV01");

          props.buscarTreeView(
            getDivision(),
      //props.dataRowEditNew.IdUnidadOrganizativa
          );
        });
  }


  const getDivision = () => {
    let data = localStorage.getItem("divisionSelected");
    return data;
  }

  const setDivision = (target) => {
    let value = target.value == null ? target.previousValue : target.value;
    localStorage.setItem("divisionSelected", value);
    setCurrentDivision(value);
  }

  const onChangeDivision = () => {

    props.buscarTreeView(
      getDivision(),
//props.dataRowEditNew.IdUnidadOrganizativa
    );
  }

 


  const eventRefresh = () => {
    props.buscarTreeView(
      getDivision(),
      //props.dataRowEditNew.IdUnidadOrganizativa="",
      props.dataRowEditNew.Posiciones=""
    );
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
              id="idLimpiar"
              icon="fa fa-save"
              useSubmitBehavior={true}
              onClick={eventRefresh}
              visible={false}
            />
          </PortletHeaderToolbar>
        }
      />
      <PortletBody >
        <React.Fragment>
          <Form formData={props.dataRowEditNew} validationGroup="FormEdicion" >
            <GroupItem itemType="group" colCount={2} colSpan={2}>

              <Item
                dataField="IdDivisionSelector"
                label={{ text: intl.formatMessage({ id: "SYSTEM.DIVISION" }) }}
                editorType="dxSelectBox"
                editorOptions={{
                  items: cmbDivisiones,
                  valueExpr: "IdDivision",
                  displayExpr: "Division",
                  value: currentDivision,
                  showClearButton: true,
                  onValueChanged: (e => {
                    //Listar menú..
                    setDivision(e);
                    onChangeDivision();
                  }),

                }}
              />

       


            </GroupItem>

          </Form>


        </React.Fragment>
      </PortletBody>
    </>
  );
};

export default injectIntl(WithLoandingPanel(PosicionListPage));
