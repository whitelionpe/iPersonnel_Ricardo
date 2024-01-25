import React, { useEffect, useState, Fragment } from "react";
import { injectIntl } from "react-intl";
import { handleInfoMessages } from "../../../../../store/ducks/notify-messages";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado, useStylesTab } from "../../../../../store/config/Styles";
import { listarEstadoSimple } from "../../../../../api/sistema/entidad.api";
import MenuTreeViewPage from "../../../../../partials/content/TreeView/MenuTreeViewPage";
import { isNotEmpty } from "../../../../../../_metronic";
import PropTypes from "prop-types";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";
//TreeView   
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';

const AutorizadorDivisionEditPage = props => {
  const { intl, cancelarEdicion } = props;
  const classesEncabezado = useStylesEncabezado();
  const [isDisabledMenuOption, setDisabledMenuOption] = useState(false);
  const [selectedNodos, setSelectedNodos] = useState([]);
  const [selectedNodosUO, setSelectedNodosUO] = useState([]);
  const [idMenu, setIdMenu] = useState("PE");
  const [dataFilter, setDataFilter] = useState({ IdCampamento: "" });
  const [isSubMenu, setIsSubMenu] = useState(false);

  const classes = useStylesTab();

  function grabar(e) {

    let lselectedNodos = props.menus.filter(s => s.selected)
    let lselectedNodosUO = props.menusUnidadOrg.filter(s => s.selected);


    if (lselectedNodos.length > 0 && lselectedNodosUO.length > 0) {
      let treeviewDivisiones = lselectedNodos.filter(datos => isNotEmpty(datos.IdDivision));
      let treeviewUO = lselectedNodosUO.filter(datos => isNotEmpty(datos.IdUnidadOrganizativa));
      if (treeviewDivisiones.length > 0 && treeviewUO.length > 0) {
        props.agregarAutorizadorDivision(treeviewDivisiones);
        props.agregarAutorizadorRequisitoUnidadOrg(treeviewUO);
      }
      else {
        handleInfoMessages(intl.formatMessage({ id: "ACREDITATION.AUTORIZATOR.MUST.DIVISION.MSG" }));
      }
    } else {
      handleInfoMessages(intl.formatMessage({ id: "ACREDITATION.AUTORIZATOR.MUST.SELECT.MSG" }));
    }

    /*
    seleccionarNodo(lselectedNodos);
    seleccionarNodoUO(lselectedNodosUO);
    if (selectedNodos.length > 0 && selectedNodosUO.length > 0)  {
      let treeviewDivisiones = selectedNodos.filter(datos => { return isNotEmpty(datos.IdDivision); });
      let treeviewUO = selectedNodosUO.filter(datos => { return isNotEmpty(datos.IdUnidadOrganizativa); })
      if (treeviewDivisiones.length > 0 && treeviewUO.length > 0) {
        props.agregarAutorizadorDivision(treeviewDivisiones); 
        props.agregarAutorizadorRequisitoUnidadOrg(treeviewUO);
      } 
      else {
        handleInfoMessages("Debe seleccinar una división.");
      }
    } else {
      handleInfoMessages("Debe seleccinar un elemento en ambos.");
    }
    */

  }



  useEffect(() => {
    props.listarTreeViewDivision();
    props.listarTreeViewUnidadOrg();


  }, []);

  const seleccionarNodo = (nodo) => {

    setSelectedNodos(nodo);
  }

  const seleccionarNodoUO = (nodo) => {
    setSelectedNodosUO(nodo);
  }




  const customRenderMenuTreeView = (e) => {
    const { icon, Menu, Nivel } = e;
    let itemMenu = <span>{Menu}</span>;

    switch (Nivel) {
      //case 2: itemMenu = <Fragment> <span>{intl.formatMessage({ id: "SYSTEM.DIVISION" })} </span> - <span> {Menu} </span></Fragment>; break;
      case 2: itemMenu = <Fragment> <span> {Menu} </span></Fragment>; break;
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
                  onClick={cancelarEdicion}
                />
              </PortletHeaderToolbar>
            }
          />
        } />



      <Paper className={classes.paper}>
        <Grid container spacing={1} direction="row" justify="flex-start" alignItems="stretch" >
          <Grid item xs={6} style={{ borderRight: "1px solid #ebedf2" }}>
            <AppBar position="static" className={classesEncabezado.secundario}>
              <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                  {intl.formatMessage({ id: "SYSTEM.DIVISIONS" })}
                </Typography>
              </Toolbar>
            </AppBar>

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

          </Grid>

          <Grid item xs={6} >
            <AppBar position="static" className={classesEncabezado.secundario}>
              <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                  {intl.formatMessage({ id: "ADMINISTRATION.ORGANIZATIONALUNIT.MAINTENANCE" })}
                </Typography>
              </Toolbar>
            </AppBar>
            <MenuTreeViewPage
              menus={props.menusUnidadOrg}
              dataFilter={dataFilter}
              setDataFilter={setDataFilter}
              isSubMenu={isSubMenu}
              setIsSubMenu={setIsSubMenu}
              showModulo={false}
              showButton={false}
              showCheckBoxesModes={"normal"}
              selectionMode={"multiple"}
              setSelectedNodos={setSelectedNodosUO}
              cancelarEdicion={true}
              seleccionarNodo={seleccionarNodoUO}
              customRender={customRenderMenuTreeView}
            />

          </Grid>

        </Grid>
      </Paper>


    </>
  );
};

AutorizadorDivisionEditPage.propTypes = {
  showHeaderInformation: PropTypes.bool,
};
AutorizadorDivisionEditPage.defaultProps = {
  showHeaderInformation: true,
};

export default injectIntl(AutorizadorDivisionEditPage);


