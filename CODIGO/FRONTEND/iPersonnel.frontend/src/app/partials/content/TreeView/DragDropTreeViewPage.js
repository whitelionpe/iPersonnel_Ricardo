import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { PortletBody } from "../Portlet";
import { Sortable, TreeView } from "devextreme-react";// Button, DropDownButton,

import { isNotEmpty } from "../../../../_metronic";
import PropTypes from "prop-types";
import Tooltip from '@material-ui/core/Tooltip';

const DragDropTreeViewPage = (props) => {
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


  function onDragChange(e) {
    if (e.fromComponent === e.toComponent) {
      const fromNode = this.findNode(this.getTreeView(e.fromData), e.fromIndex);
      const toNode = this.findNode(this.getTreeView(e.toData), this.calculateToIndex(e));
      if (toNode !== null && this.isChildNode(fromNode, toNode)) {
        e.cancel = true;
      }
    }
  }

  function  onDragEnd(e) {
    if (e.fromComponent === e.toComponent && e.fromIndex === e.toIndex) {
      return;
    }

    const fromTreeView = this.getTreeView(e.fromData);
    const toTreeView = this.getTreeView(e.toData);

    const fromNode = this.findNode(fromTreeView, e.fromIndex);
    const toNode = this.findNode(toTreeView, this.calculateToIndex(e));

    if (e.dropInsideItem && toNode !== null && !toNode.itemData.isDirectory) {
      return;
    }

    const fromTopVisibleNode = this.getTopVisibleNode(e.fromComponent);
    const toTopVisibleNode = this.getTopVisibleNode(e.toComponent);

    const fromItems = this.state[this.getStateFieldName(e.fromData)];
    const toItems = this.state[this.getStateFieldName(e.toData)];
    this.moveNode(fromNode, toNode, fromItems, toItems, e.dropInsideItem);

    this.setState({
      [this.getStateFieldName(e.fromData)]: [...fromItems],
      [this.getStateFieldName(e.toData)]: [...toItems],
    });
    fromTreeView.scrollToItem(fromTopVisibleNode);
    toTreeView.scrollToItem(toTopVisibleNode);
  }



  return (
    <>

      <PortletBody >
        <Sortable
          filter=".dx-treeview-item"
          group="shared"
          data="driveC"
          allowDropInsideItem={true}
          allowReordering={true}
          // onDragChange={onDragChange}
          // onDragEnd={onDragEnd}
          >

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
        </Sortable>
      </PortletBody>

    </>
  );
};
DragDropTreeViewPage.propTypes = {
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
DragDropTreeViewPage.defaultProps = {
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
        <Tooltip title={<span style={{ fontSize: "12px" }}> {isNotEmpty(toolTip) ? '' + toolTip + '' : ''} </span>} >
          <i className={!icon?.startsWith("fas ") ? `dx-icon dx-icon-${icon}` : icon} style={{ color: isNotEmpty(IconColor) ? '' + IconColor + '' : '#f7d673' }} />
        </Tooltip>
      ) : (
        <i className={!icon?.startsWith("fas ") ? `dx-icon dx-icon-${icon}` : icon} style={{ color: isNotEmpty(IconColor) ? '' + IconColor + '' : '#f7d673' }} />
      )
      }
      {/* <i className={`dx-icon dx-icon-${icon}`} style={{ color: 'red' }} /> */}
      {isNotEmpty(TextColor) || isNotEmpty(TextBold) ?
        (<span className={TextColor}> <span className={TextBold}>{Menu} </span></span>) : (<span>{Menu}</span>)
      }

    </div>
  );

}

{
  /**-TreeviewExtend: con esta funcion se extiende comportamiento para agreagar iconos editar y eliminar */
}
const TreeviewExtend = (props) => {
  const { icon, TextColor, TextBold, Menu } = props.data;

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

    </>
  );
};


export default injectIntl(DragDropTreeViewPage);
