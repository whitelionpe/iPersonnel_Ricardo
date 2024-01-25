import React, { useEffect, useState,Fragment } from "react";
import { injectIntl } from "react-intl";
//import { useSelector } from "react-redux";
import { handleInfoMessages } from "../../../../store/ducks/notify-messages";
import Form, { Item, GroupItem } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";
//import { listarEstadoSimple } from "../../../../api/sistema/entidad.api";
import MenuTreeViewPage from "../../../../partials/content/TreeView/MenuTreeViewPage";
import { isNotEmpty, listarEstadoSimple } from "../../../../../_metronic";
import PropTypes from "prop-types";

import HeaderInformation from "../../../../partials/components/HeaderInformation";


const PerfilDetalleEditPage = props => {
  const { intl } = props;
  const [estadoSimple, setEstadoSimple] = useState([]);
  const classesEncabezado = useStylesEncabezado();
  const [isDisabledMenuOption, setDisabledMenuOption] = useState(false);
  const [selectedNodos, setSelectedNodos] = useState([]);

  //Menu
  const [idMenu, setIdMenu] = useState("PE");
  const [dataFilter, setDataFilter] = useState({ IdCampamento: "" });
  const [isSubMenu, setIsSubMenu] = useState(false);


  async function cargarCombos() {
    let estadoSimple = listarEstadoSimple();
    setEstadoSimple(estadoSimple);
  }

  function grabar(e) {
    if (selectedNodos.length > 0) {

      let treeviewCamas = selectedNodos.filter(datos => { return isNotEmpty(datos.IdHabitacion); });
      if (treeviewCamas.length > 0) { //pendiente validar!
        props.agregarCampPerfilDetalle(treeviewCamas);
      } else {
        handleInfoMessages(intl.formatMessage({ id: "PROFILE.DETAIL.MUST.BED.MSG" }));//PENDIENTE - INTERNACIONALIZACION
      }
    } else {
      handleInfoMessages(intl.formatMessage({ id: "PROFILE.DETAIL.MUST.ELEMENT.MSG" }));//PENDIENTE - INTERNACIONALIZACION
    }
  }

  useEffect(() => {
    cargarCombos();
  }, []);

  const seleccionarNodo = (nodo, items) => {
    setSelectedNodos(nodo);
  }



  const customRenderMenuTreeView = (e) => { 
    const { icon, Menu, Nivel } = e;
    let itemMenu = <span>{Menu}</span>;

    switch (Nivel) {
      case 2: itemMenu = <Fragment> <span>{intl.formatMessage({ id: "CAMP.PROFILE.DETAIL.CAMP" })} </span> - <span> {Menu} </span></Fragment>; break;
      case 3: itemMenu = <Fragment>  <span>{intl.formatMessage({ id: "CAMP.PROFILE.DETAIL.MODULETYPE" })} </span> - <span>  {Menu} </span></Fragment>; break;
      case 5: itemMenu = <Fragment> <span>{intl.formatMessage({ id: "CAMP.PROFILE.DETAIL.ROOMTYPE" })} </span> - <span> {Menu} </span></Fragment>; break;
    }

    return (
      <div className="dx-item-content dx-treeview-item-content">
        <i className={`dx-icon dx-icon-${icon} color_yellow`}></i>
        {itemMenu}
      </div>
    ) 
  }

  return (
    <>

      <HeaderInformation data={props.getInfo()} visible={props.showHeaderInformation} labelLocation={'left'} colCount={6}
        toolbar={
          <PortletHeader
            title={""}
            toolbar={
              <PortletHeaderToolbar >
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
        } />

      <PortletBody >
        <React.Fragment>
          <Form formData={props.dataRowEditNew} validationGroup="FormEdicion" >
            <GroupItem itemType="group" colCount={2} colSpan={2}>
              <Item colSpan={2}>
                <AppBar position="static" className={classesEncabezado.secundario}>
                  <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                    <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                      {intl.formatMessage({ id: "CAMP.PROFILE.DETAIL.ADD" })}
                    </Typography>
                  </Toolbar>
                </AppBar>
              </Item>

              <Item colSpan={2}>
                <MenuTreeViewPage

                  menus={props.menus}
                  dataFilter={dataFilter}
                  setDataFilter={setDataFilter}
                  isSubMenu={isSubMenu}
                  setIsSubMenu={setIsSubMenu}
                  showModulo={false}
                  showButton={false}
                  showCheckBoxesModes={"normal"}
                  selectionMode={"multiple"}
                  setSelectedNodos={setSelectedNodos}
                  cancelarEdicion={true}
                  seleccionarNodo={seleccionarNodo}
                  customRender={customRenderMenuTreeView}
                />
              </Item>
              <Item dataField="IdPerfil" visible={false} />
            </GroupItem>


          </Form>
        </React.Fragment>
      </PortletBody>
    </>
  );
};

PerfilDetalleEditPage.propTypes = {
  showHeaderInformation: PropTypes.bool,
};
PerfilDetalleEditPage.defaultProps = {
  showHeaderInformation: true,
};

export default injectIntl(PerfilDetalleEditPage);


