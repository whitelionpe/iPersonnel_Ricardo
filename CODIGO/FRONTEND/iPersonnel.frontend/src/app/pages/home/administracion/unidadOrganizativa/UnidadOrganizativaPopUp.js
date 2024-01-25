import React, { useEffect, useState } from "react";
import Form, { Item, GroupItem } from "devextreme-react/form";
import { useSelector } from "react-redux";
import { TreeView } from "devextreme-react";
import { useStylesEncabezado } from "../../../../../app/store/config/Styles";
import { isNotEmpty } from "../../../../../_metronic";
import PropTypes from "prop-types";
import { Popup } from "devextreme-react/popup";
import Paper from "@material-ui/core/Paper";
import { injectIntl } from "react-intl";
import AppBar from "@material-ui/core/AppBar";
import { listarTreeview } from "../../../../api/administracion/unidadOrganizativa.api";
import { handleErrorMessages } from "../../../../store/ducks/notify-messages";

const UnidadOrganizativaPopUp = (props) => {
  const { intl, isVisiblePopup, setIsVisiblePopUp, seleccionarNodo } = props;
  const perfil = useSelector((state) => state.perfil.perfilActual);

  //const [treeViewRef, setTreeViewRef] = useState(null);
  const classesEncabezado = useStylesEncabezado();

  const [menus, setMenus] = useState([
    {
      Icon: "flaticon2-expand",
      IdMenu: null,
      IdModulo: null,
      IdMenuPadre: null,
      Menu: "-SIN DEFINIR UNIDAD-",
      MenuPadre: null,
      Nivel: 0,
      Orden: 0,
      expanded: true,
      selected: false, //ff
    },
  ]);

  const nodoSeleccionado = (evt) => { 
    let { IdMenu, IdUnidadOrganizativa, Menu } = evt;
    seleccionarNodo({ IdMenu, IdUnidadOrganizativa, Menu });
    setIsVisiblePopUp(false);
  };

  /*const treeViewSelectionChanged = (e) => {
    //Obtener nodos seleccionados.
    syncSelection();
  };*/

  /*const syncSelection = () => {
    if (props.selectionMode === "multiple") {
      let selectedNodos = [];
      treeViewRef.props.items.map((node) => {
        if (node.selected) selectedNodos.push(node);
      });
      props.setSelectedNodos(selectedNodos);
    }
  };*/

  async function listarUnidadOrganizativa() {
    let unidadOrganizativas = await listarTreeview({
      IdCliente: perfil.IdCliente,
      IdDivision: perfil.IdDivision,
    }).catch((err) => {
      handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
    });

    if (!isNotEmpty(unidadOrganizativas)) {
      //Sin data , mostrar por defecto.
      setMenus([
        {
          Activo: "S",
          icon: "flaticon2-expand",
          IdMenu: null,
          IdMenuPadre: null,
          IdModulo: "",
          Menu: "-SIN DATOS-",
          MenuPadre: null,
          expanded: true,
        },
      ]);
    } else {
      setMenus(unidadOrganizativas);
    }
  }

  useEffect(() => {
    listarUnidadOrganizativa();
  }, []);
  
  return (
    <Popup
      visible={isVisiblePopup}
      dragEnabled={false}
      closeOnOutsideClick={true}
      showTitle={true}
      title={intl.formatMessage({ id: "ADMINISTRATION.ORGANIZATIONALUNIT.SUBTITLE" })}
      height={580}
      width={700}
      onHiding={() => setIsVisiblePopUp(!isVisiblePopup)}
    >
      <Paper>
        <AppBar position="static" className={classesEncabezado.secundario}>
          {/* <Toolbar variant="dense" className={classesEncabezado.toolbar}>
            <Typography variant="h6" color="inherit" className={classesEncabezado.title}></Typography>
          </Toolbar> */}
        </AppBar>

        <Form formData={props.dataFilter} disabled={props.modoEdicion}>
          <GroupItem itemType="group" colCount={2} colSpan={2}>
            <Item colSpan={2}>
              <TreeView
                id="treeview-base"
                items={menus}
                //ref={(e) => setTreeViewRef(e)}
                dataStructure="plain"
                virtualModeEnabled={true}
                selectNodesRecursive={true}
                selectionMode={props.selectionMode}
                showCheckBoxesMode={props.showCheckBoxesModes}
                selectByClick={true}
                displayExpr="Menu"
                parentIdExpr="IdMenuPadre"
                keyExpr="IdMenu"
                itemRender={(e) =>
                  TreeviewExtend({
                    data: e,
                    nodoSeleccionado,
                  })
                }
                //onSelectionChanged={treeViewSelectionChanged}
              />
            </Item>
          </GroupItem>
        </Form>
      </Paper>
    </Popup>
  );
};
UnidadOrganizativaPopUp.propTypes = {
  menus: PropTypes.array,
  modulos: PropTypes.array,
  dataFilter: PropTypes.object,
  modoEdicion: PropTypes.bool,
  isSubMenu: PropTypes.bool,
  listarMenu: PropTypes.func,
  showModulo: PropTypes.bool,
  options: PropTypes.array,
  showButton: PropTypes.bool,
  showCheckBoxesModes: PropTypes.string,
  selectionMode: PropTypes.string,
};
UnidadOrganizativaPopUp.defaultProps = {
  menus: [],
  modulos: [],
  dataFilter: { IdModulo: "" },
  modoEdicion: false,
  isSubMenu: false,
  showModulo: true,
  options: [],
  showButton: true,
  showCheckBoxesModes: "none",
  selectionMode: "single",
};

{
  /**-TreeviewExtend: con esta funcion se extiende comportamiento para agreagar iconos editar y eliminar */
}
const TreeviewExtend = (props) => {
  const seleccionarRegistro = (e, evt) => {
    e.preventDefault();

    props.nodoSeleccionado(evt, true);
  };

  return (
    <>
      <div className="row">
        <div className="col-md-10">
          <i className={`dx-icon-${props.data.icon}`}></i>{" "}
          <span className={props.data.TextColor}>
            {" "}
            <span className={props.data.TextBold}>
              {" "}
              {props.data.Menu}{" "}
            </span>{" "}
          </span>
        </div>
        <div className="col-md-2">
          <div className="dx-command-edit-with-icons text-right">
            <span
              className="dx-icon-check"
              title="Seleccionar"
              aria-label="Seleccionar"
              onClick={(e) => seleccionarRegistro(e, props.data)}
            />
            &nbsp;
          </div>
        </div>
      </div>
    </>
  );
};

export default injectIntl(UnidadOrganizativaPopUp);
