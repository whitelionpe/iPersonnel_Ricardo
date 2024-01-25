import React, { useState, useEffect } from "react";
import { injectIntl } from "react-intl";//Multi-idioma
import { Button } from "devextreme-react";
import { Portlet, PortletHeaderPopUp, PortletHeaderToolbar } from "../content/Portlet";
import { handleInfoMessages } from "../../store/ducks/notify-messages";
import MenuTreeViewPage from "../content/TreeView/MenuTreeViewPage";
import { Popup } from 'devextreme-react/popup';
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { listarTreeview } from "../../api/administracion/unidadOrganizativa.api";
import { getDataTempLocal, isNotEmpty, setDataTempLocal } from "../../../_metronic";


const AdministracionUnidadOrganizativaBuscar = props => {
  const perfil = useSelector(state => state.perfil.perfilActual);
  const { intl } = props;
  const [unidadOrganizativa, setUnidadOrganizativa] = useState([]);
  const [varIdMenu, setVarIdMenu] = useState();
  //const [dataFilter, setDataFilter] = useState({ IdModulo: "" });
  //const [isSubMenu, setIsSubMenu] = useState(false);

  const [selected, setSelected] = useState({});

  function aceptar(e) {
   
    let dataSelected = [];
    if (props.selectionMode === "row" || props.selectionMode === "single") {
      const { IdCliente, IdDivision, IdUnidadOrganizativa, Menu } = selected;
      if (isNotEmpty(IdUnidadOrganizativa)) {
        props.selectData({ IdCliente, IdDivision, IdUnidadOrganizativa, UnidadOrganizativa: Menu });
      } else {
        handleInfoMessages(intl.formatMessage({ id: "MESSAGES.SELECT.ROW" }));
      }
     return;
    } else {
      dataSelected = selected;

      if (dataSelected.length > 0) {
        props.selectData(dataSelected);
        props.showPopup.setisVisiblePopUp(!props.showPopup.isVisiblePopUp);
      } else {
        handleInfoMessages(intl.formatMessage({ id: "MESSAGES.SELECT.ROW" }));
      }
    }


  }

  const seleccionarNodo = async (dataRow) => {
    const { IdMenu } = dataRow;
    if (IdMenu !== varIdMenu) setVarIdMenu(IdMenu);
    setSelected(dataRow);
  }

  // const treeViewSetFocusNodo = (data, idMenu) => {
  //   let menus = [];
  //   let objIndex = data.findIndex((obj => obj.IdMenu === idMenu));
  //   if (objIndex >= 0) data[objIndex].selected = true;
  //   menus...data);
  //   return menus;
  // }

  async function cargarData() {
    await listarTreeview({ IdCliente: perfil.IdCliente, IdDivision: perfil.IdDivision, ShowIconAction: 0, Activo: "S" })
      .then(unidadOrganizativa => {
        setUnidadOrganizativa(unidadOrganizativa);
      });
  }

  useEffect(() => {
    cargarData();
  }, []);

  return (
    <>
      <Popup
        visible={props.showPopup.isVisiblePopUp}
        dragEnabled={false}
        closeOnOutsideClick={false}
        showTitle={true}
        height={"600px"}
        width={"600px"}
        title={(intl.formatMessage({ id: "ACTION.SEARCH" }) + ' ' + intl.formatMessage({ id: "ADMINISTRATION.ORGANIZATIONALUNIT.ORGANIZATIONALUNIT" })).toUpperCase()}
        onHiding={() => props.showPopup.setisVisiblePopUp(!props.showPopup.isVisiblePopUp)}
      >
        <Portlet>
        

<div className="container">
  <div className="float-right">
  <Button
                  icon="todo"
                  type="default"
                  hint={intl.formatMessage({ id: "ACTION.ACCEPT" })}
                  onClick={aceptar}
                  useSubmitBehavior={true}
                  validationGroup="FormEdicion"
                  style={{ marginTop:"7px" }}
                />
  </div>
          <MenuTreeViewPage
            menus={unidadOrganizativa}
            modoEdicion={false}
            seleccionarNodo={seleccionarNodo}     
            selectionMode = {props.selectionMode}       
            showCheckBoxesModes = {props.showCheckBoxesModes}
          />
  </div>
        </Portlet>
      </Popup>

    </>
  );
};
AdministracionUnidadOrganizativaBuscar.propTypes = {
  showButton: PropTypes.bool,
  selectionMode: PropTypes.string,
  showCheckBoxesModes: PropTypes.string

};
AdministracionUnidadOrganizativaBuscar.defaultProps = {
  showButton: true,
  selectionMode: "row", //['multiple', 'row'] 
  showCheckBoxesModes :"none" //
};

export default injectIntl(AdministracionUnidadOrganizativaBuscar);
