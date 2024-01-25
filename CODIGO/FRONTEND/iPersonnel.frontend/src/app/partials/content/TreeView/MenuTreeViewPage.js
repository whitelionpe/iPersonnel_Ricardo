import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { PortletBody } from "../Portlet";
import { TreeView } from "devextreme-react";// Button, DropDownButton,

import { isNotEmpty } from "../../../../_metronic";
import PropTypes from "prop-types";
import Tooltip from '@material-ui/core/Tooltip';

const MenuTreeViewPage = (props) => {
  const [treeViewRef, setTreeViewRef] = useState(null);


  const seleccionarNodo = (evt) => {
    const { IdMenu } = evt.itemData;

    //Agregar focus nodo seleccionado.
    evt.component.selectItem(evt.itemData.IdMenu);
    evt.event.preventDefault();

    if (isNotEmpty(IdMenu)) {
      props.seleccionarNodo(evt.itemData);
    }
  };

  const treeViewSelectionChanged = (e) => {
    //Obtener nodos seleccionados.
    syncSelection();
  };

  const syncSelection = () => {
    if (props.selectionMode === "multiple") {
      let selectedNodos = [];
      selectedNodos = treeViewRef.props.items.filter(result => { return result.selected })
      props.seleccionarNodo(selectedNodos, treeViewRef.props.items);
    }
  };

  return (
    <>

      <PortletBody >

        <TreeView
          id={props.id}
          items={props.menus}
          ref={(e) => setTreeViewRef(e)}
          dataStructure="plain"
          focusStateEnabled={true}
          disabled={props.modoEdicion}
          height={props.height}
          //selectByClick={true} 
          virtualModeEnabled={true}

          selectNodesRecursive={props.selectNodesRecursive}
          selectionMode={props.selectionMode}
          showCheckBoxesMode={props.showCheckBoxesModes}
          //selectByClick={false} //selectByClick={true}

          searchEnabled={props.searchEnabled}
          searchMode={props.searchMode}
          displayExpr={props.displayExpr}
          keyExpr={props.keyExpr}
          parentIdExpr={props.parentIdExpr}
          onItemClick={seleccionarNodo}//{(e) => seleccionarNodo(e)}
          itemRender={props.customRender}
          onSelectionChanged={treeViewSelectionChanged}



        />
      </PortletBody>

    </>
  );
};
MenuTreeViewPage.propTypes = {
  id: PropTypes.string,
  menus: PropTypes.array,
  modoEdicion: PropTypes.bool,
  showCheckBoxesModes: PropTypes.string,
  selectionMode: PropTypes.string,
  searchEnabled: PropTypes.bool,
  searchMode: PropTypes.string,
  displayExpr: PropTypes.string,
  parentIdExpr: PropTypes.string,
  keyExpr: PropTypes.string,
  customRender: PropTypes.func,
  selectNodesRecursive: PropTypes.bool,
  height: PropTypes.string
};
MenuTreeViewPage.defaultProps = {
  id: "treeview-base",
  menus: [],
  modoEdicion: false,
  showCheckBoxesModes: "none", //['normal', 'selectAll', 'none']
  selectionMode: "single", //['multiple', 'single']
  searchEnabled: true,
  searchMode: 'contains', //'contains', 'startswith //
  displayExpr: 'Menu',//Descripcion que va mostrar
  parentIdExpr: 'IdMenuPadre',//IdReferencia del padre
  keyExpr: 'IdMenu', //Identificador, No debe repertirse
  selectNodesRecursive: true,
  customRender: (e) => {
    return TreeviewDefaultItem(e)
  },
  height: '420px'
}


const TreeviewDefaultItem = (e) => {

  const { icon, IconColor, Menu, TextColor, TextBold, toolTip } = e;
  // console.log("TreeviewDefaultItem::>", e)

  return (
    <div className="dx-item-content dx-treeview-item-content">
      {/* <i className={`dx-icon dx-icon-${icon}`} style={{ color: isNotEmpty(IconColor) ? ''+IconColor+'' : '#f7d673' }} />  */}
      {isNotEmpty(toolTip) ? (
        <Tooltip title={<span style={{ fontSize: "12px",color: 'black'}}> {isNotEmpty(toolTip) ? '' + toolTip + '' : ''} </span>} >
          <i className={!icon?.startsWith("fas ") ? `dx-icon dx-icon-${icon}` : icon} style={{ color: isNotEmpty(IconColor) ? '' + IconColor + '' : '#000000' }} />
        </Tooltip>
      ) : (
        <i className={!icon?.startsWith("fas ") ? `dx-icon dx-icon-${icon}` : icon} style={{ color: isNotEmpty(IconColor) ? '' + IconColor + '' : '#000000' }} />
      )
      }
      {/* <i className={`dx-icon dx-icon-${icon}`} style={{ color: 'red' }} /> */}
      {isNotEmpty(TextColor) || isNotEmpty(TextBold) ?
        (<span className={TextColor} style={{ fontSize: "12px",color: 'black'}}> <span className={TextBold} style={{ fontSize: "12px",color: 'black'}}>{Menu} </span></span>) : (<span style={{ fontSize: "12px",color: 'black'}}>{Menu}</span>)
      }

    </div>
  );

}

{
  /**-TreeviewExtend: con esta funcion se extiende comportamiento para agreagar iconos editar y eliminar */
}
const TreeviewExtend = (props) => {
  const { icon, TextColor, TextBold, Menu } = props.data;
  // const { intl } = props;
  // const editarNodo = (e, evt) => {
  //   e.preventDefault();
  //   props.editarRegistro(evt, true);
  // };
  // const nuevoNodo = (e, evt) => {
  //   e.preventDefault();
  //   props.nuevoRegistro(evt, true);
  // };
  // const eliminarNodo = (e, evt) => {
  //   e.preventDefault();
  //   let result = confirm(intl.formatMessage({ id: "ALERT.REMOVE" }));
  //   result.then((dialogResult) => {
  //     if (dialogResult) props.eliminarRegistro(evt);
  //   });
  // };

  return (
    <>
      {/* <div className="row">
        <div className="col-md-10"> */}

      <i className={`dx-icon-${icon}`}></i>&nbsp;
      <span className={TextColor}>
        &nbsp;
        <span className={TextBold}>
          &nbsp;
          {Menu}
        </span>
      </span>

      {/* <div className="col-md-2">
          {isNotEmpty(props.data.IdMenu) && (
            <>
              <div className="dx-command-edit-with-icons">
                {props.data.showIconEdit && (
                  <span
                    className="dx-icon-edit"
                    title={intl.formatMessage({ id: "ACTION.EDIT" })}
                    aria-label={intl.formatMessage({ id: "ACTION.EDIT" })}
                    onClick={(e) => editarNodo(e, props.data)}
                  />
                )}
                &nbsp;
                {props.data.showIconAdd && (
                  <span
                    className="dx-icon-plus"
                    title={intl.formatMessage({ id: "ACTION.ADD" })}
                    aria-label={intl.formatMessage({ id: "ACTION.ADD" })}
                    onClick={(e) => nuevoNodo(e, props.data)}
                  />
                )}
                &nbsp;
                {props.data.showIconRemove && (
                  <span
                    className="dx-icon-trash"
                    title={intl.formatMessage({ id: "ACTION.REMOVE" })}
                    aria-label={intl.formatMessage({ id: "ACTION.REMOVE" })}
                    onClick={(e) => eliminarNodo(e, props.data)}
                  />
                )}
              </div>
            </>
          )}
        </div> 
      </div>*/}
    </>
  );
};


export default injectIntl(MenuTreeViewPage);
