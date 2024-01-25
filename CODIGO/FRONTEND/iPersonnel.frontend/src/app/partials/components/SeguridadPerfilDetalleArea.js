import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { Portlet, PortletBody } from "../content/Portlet";
import { Popup } from 'devextreme-react/popup';
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import MenuTreeViewPage from "../content/TreeView/MenuTreeViewPage";
import Form, { Item, GroupItem } from 'devextreme-react/form';
import { TreeView } from "devextreme-react";
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';

/* import { obtenerTodos as obtenerTodosPerfiles } from '../../api/seguridad/perfil.api';
import { obtenerTodos as obtenerUsuarioPerfiles } from '../../api/seguridad/usuarioPerfil.api'; */
import { listarTreeview as listarTreeviewDivision } from "../../api/seguridad/perfilDivision.api";
import { listarTreeview as listarTreeviewUO } from "../../api/seguridad/unidadOrganizativa.api";
import { isNotEmpty } from "../../../_metronic";
import { useStylesTab } from "../../store/config/Styles";
import { WithLoandingPanel } from "../../partials/content/withLoandingPanel";


const SeguridadPerfilDetalleArea = props => {
  const { intl, setLoading } = props;
  const classes = useStylesTab();
  const { IdCliente } = useSelector(state => state.perfil.perfilActual);
  /* const [cmbPerfiles, setcmbPerfiles] = useState([]);
  const [cmbUsuario, setcmbUsuario] = useState([]); */


  const [divisionesTreeView, setDivisionesTreeView] = useState([{
    Icon: "flaticon2-expand"
    , IdMenu: null
    , IdModulo: null
    , IdMenuPadre: null
    , Menu: intl.formatMessage({ id: "SYSTEM.MENU.OPTIONS" })
    , MenuPadre: null
    , Nivel: 0
    , Orden: 0
    , expanded: true
  }]);


  const [unidadOrganizativaTreeView, setUnidadOrganizativaTreeView] = useState([{
    Icon: "flaticon2-expand"
    , IdMenu: null
    , IdModulo: null
    , IdMenuPadre: null
    , Menu: intl.formatMessage({ id: "SYSTEM.MENU.OPTIONS" })
    , MenuPadre: null
    , Nivel: 0
    , Orden: 0
    , expanded: true
  }]);



  async function listarTVDivisiones(dataRow) {
    //async function listarTVDivisiones() {
    setLoading(true);
    const { IdPerfil } = dataRow;
    //console.log("listarTVDivisiones", dataRow);
    await listarTreeviewDivision({
      IdCliente: IdCliente,
      IdPerfil: IdPerfil//'ADM001'
    }).then(dataTreeView => {
      //console.log("listarTVDivisiones", dataTreeView);
      if (!isNotEmpty(dataTreeView)) {
        setDivisionesTreeView([{
          Activo: "S"
          , icon: "flaticon2-expand"
          , IdMenu: null
          , IdMenuPadre: null
          , IdModulo: ""
          , Menu: "-SIN DATOS-"
          , MenuPadre: null
          , expanded: true
        }])
      } else {
        setDivisionesTreeView(dataTreeView);

      }
    }).catch(err => {
    }).finally(() => { setLoading(false); });
  }

  async function listarTVUnidadOrganizativa(dataRow) {
    //async function listarTVUnidadOrganizativa() {
    setLoading(true);
    const { IdPerfil } = dataRow;
    await listarTreeviewUO({
      IdCliente: IdCliente,
      IdPerfil: IdPerfil, //'ADM001',
      Asignado: 'S'
    }).then(dataTreeView => {
      if (!isNotEmpty(dataTreeView)) {
        setUnidadOrganizativaTreeView([{
          Activo: "S"
          , icon: "flaticon2-expand"
          , IdMenu: null
          , IdMenuPadre: null
          , IdModulo: ""
          , Menu: "-SIN DATOS-"
          , MenuPadre: null
          , expanded: true
        }])
      } else {
        setUnidadOrganizativaTreeView(dataTreeView);
      }
    }).catch(err => {
    }).finally(() => {
      setLoading(false);
    });
  }


  useEffect(() => {

    //setPerfiles(props.perfilesData);
    console.log("useEffect",props.dataRowEditNew );

  }, []);


  return (
    <>
      <Popup
        visible={props.showPopup.isVisiblePopUp}
        dragEnabled={false}
        closeOnOutsideClick={false}
        showTitle={true}
        height={"650px"}
        width={"45%"}
        title={(intl.formatMessage({ id: "ACCREDITATION.PROFILE.DETAIL" }).toUpperCase())}
        onHiding={() => props.showPopup.setisVisiblePopUp(!props.showPopup.isVisiblePopUp)}
      >
        <Portlet>
          <PortletBody>
            <Form formData={props.dataRowEditNew} validationGroup="FormEdicion" id="editForm"  >
              <GroupItem itemType="group" colCount={2} >

                <Item                 
                  dataField="IdPerfil"
                  label={{ text: intl.formatMessage({ id: "SECURITY.USER.PROFILES" }) }}
                  editorType="dxSelectBox"
                  colSpan={2}
                  editorOptions={{
                    items: props.perfilesData,
                    valueExpr: "IdPerfil",
                    displayExpr: "Perfil",
                    //defaultValue:"01AP003A", 
                    //value: "01AP003A",
                     onValueChanged: (e => {
                       console.log("onValueChanged",e);
                      listarTVDivisiones(props.dataRowEditNew);
                      //console.log("props.dataRowEditNew", props.dataRowEditNew)
                      listarTVUnidadOrganizativa(props.dataRowEditNew);
                    })
                  }}
                />
              </GroupItem>
            </Form>
            <div className="row" style={{ width: "100%", height: "10%", marginTop: "13px", paddingBottom: "0px"}}>

              <div style={{ width: "40%" }}>
                <b> {intl.formatMessage({ id: "SYSTEM.DIVISIONS" }).toUpperCase()} </b>
                <br />
                <br />
                <div style={{ boxShadow: "rgba(5, 5, 0, 0.17) 8px 2px 20px -20px" }}> {/* paddingTop:"0px", paddingBottom:"0px" */}
                  <MenuTreeViewPage
                    menus={divisionesTreeView}
                    modoEdicion={false}
                    searchEnabled={false}
                  />
                   
                </div>
              </div>

              <div style={{ width: "5%" }} />
              <div style={{ width: "55%" }}>
                <b> {intl.formatMessage({ id: "ADMINISTRATION.ORGANIZATIONALUNIT.MAINTENANCE" }).toUpperCase()} </b>
                <br />
                <br />
                <div style={{ boxShadow: "rgba(5, 5, 0, 0.17) 8px 2px 20px -20px" }}>
                  <TreeView
                    id="treeview-base"
                    items={unidadOrganizativaTreeView}
                    dataStructure="plain"
                    virtualModeEnabled={false}
                    selectNodesRecursive={false}
                    selectByClick={false}
                    displayExpr="Menu"
                    parentIdExpr="IdMenuPadre"
                    keyExpr="IdMenu"
                  />
                </div>
              </div>

            </div>

          </PortletBody>
        </Portlet>
      </Popup>
    </>
  );
};

SeguridadPerfilDetalleArea.propTypes = {
  showButton: PropTypes.bool,
  selectionMode: PropTypes.string,
};
SeguridadPerfilDetalleArea.defaultProps = {
  showButton: false,
  selectionMode: "row",
};

export default injectIntl(WithLoandingPanel(SeguridadPerfilDetalleArea));
