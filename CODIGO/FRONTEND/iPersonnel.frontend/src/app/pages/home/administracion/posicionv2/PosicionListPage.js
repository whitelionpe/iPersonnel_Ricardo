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
import AdministracionUnidadOrganizativaBuscar from "../../../../partials/components/AdministracionUnidadOrganizativaBuscar";


const PosicionListPage = props => {
  const { intl, setLoading, modoEdicion, accessButton } = props;
  const { IdCliente, IdDivision } = useSelector(state => state.perfil.perfilActual);

  const classesEncabezado = useStylesEncabezado();

  const [cmbDivisiones, setCmbDivisiones] = useState([]);
  const [popupVisibleUnidad, setPopupVisibleUnidad] = useState(false);
  const [currentDivision, setCurrentDivision] = useState("");

  const [buscarPosiciones, setBuscarPosiciones] = useState([]);



  async function cargarCombos() {
    await obtenerTodosDivisiones({ IdCliente })
      .then(
        divisiones => {

          setCmbDivisiones(divisiones);
          setCurrentDivision("DIV01");

          props.buscarTreeView(
            getDivision(),
            props.dataRowEditNew.IdUnidadOrganizativa
          );
        });
  }

  const selectUnidadOrganizativa = async (dataPopup) => {

    const { IdUnidadOrganizativa, UnidadOrganizativa } = dataPopup;
    props.dataRowEditNew.IdUnidadOrganizativa = IdUnidadOrganizativa;
    props.dataRowEditNew.UnidadOrganizativa = UnidadOrganizativa;

    props.buscarTreeView(
      getDivision(),
      props.dataRowEditNew.IdUnidadOrganizativa
    );

    setPopupVisibleUnidad(false);
  };

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
      props.dataRowEditNew.IdUnidadOrganizativa
    );
  }

  const selectPosicion = () => {
    
    //debugger;
    props.buscarTreeView(
      getDivision(),
      props.dataRowEditNew.IdUnidadOrganizativa,
      props.dataRowEditNew.Posiciones
    );
  };


  const eventRefresh = () => {
    props.buscarTreeView(
      getDivision(),
      props.dataRowEditNew.IdUnidadOrganizativa="",
      props.dataRowEditNew.Posiciones=""
    );
  }



  useEffect(() => {
   // debugger;
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

              <Item
                dataField="UnidadOrganizativa"
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.ORGANIZATIONALUNIT.COSTCENTER.UO.TAB" }) }}
                colSpan={2}
                editorOptions={{
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
                        onClick: () => { setPopupVisibleUnidad(true); }
                      },
                    },
                  ],
                }}
              />


              <Item
                dataField="Posiciones"
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.POSITION" }) }}
                editorOptions={{
                  showClearButton: true,
                  buttons: [
                    {
                      name: "search",
                      location: "after",
                      useSubmitBehavior: true,
                      options: {
                        stylingMode: "text",
                        icon: "search",
                        onClick: () => { selectPosicion(); }
                      },
                    },
                  ],
                }}
              />



            </GroupItem>

            <GroupItem itemType="group" colCount={2} colSpan={2}>

              <Item colSpan={2}>
                <AppBar position="static" className={classesEncabezado.secundario}>
                  <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                    <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                      {intl.formatMessage({ id: "SYSTEM.MENU.MENU" })}
                    </Typography>
                  </Toolbar>
                </AppBar>
              </Item>

            </GroupItem>

          </Form>

          {/*           <MenuTreeViewPage
            modoEdicion={modoEdicionMenu}
            menus={props.menus}
            showCheckBoxesModes={"normal"}
            selectionMode={"multiple"}
            seleccionarNodo={seleccionarNodo}

          /> */}


          {/*******>POPUP DE UNIDAD ORGA.>******** */}
          <AdministracionUnidadOrganizativaBuscar
            selectData={selectUnidadOrganizativa}
            showPopup={{ isVisiblePopUp: popupVisibleUnidad, setisVisiblePopUp: setPopupVisibleUnidad }}
            cancelarEdicion={() => setPopupVisibleUnidad(false)}
          />

        </React.Fragment>
      </PortletBody>
    </>
  );
};

export default injectIntl(WithLoandingPanel(PosicionListPage));
