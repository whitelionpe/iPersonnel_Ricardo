
import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";//Multi-idioma
import { Button } from "devextreme-react";
import { Portlet, PortletHeaderPopUp, PortletHeaderToolbar } from "../content/Portlet";

import { isNotEmpty } from "../../../_metronic";
import { handleInfoMessages } from "../../store/ducks/notify-messages";
import { Popup } from 'devextreme-react/popup';
import PropTypes from "prop-types";
import MenuTreeViewPage from "../content/TreeView/MenuTreeViewPage";
import { listarTreeview } from "../../api/sistema/division.api";
import { useSelector } from "react-redux";

const AdministracionDivisionBuscar = props => {

  const { intl } = props;
  const perfil = useSelector(state => state.perfil.perfilActual);

  const [division, setDivision] = useState([]);
  const [varIdMenu, setVarIdMenu] = useState();
  const [selected, setSelected] = useState({});


  async function cargarData() {
    await listarTreeview({ IdCliente: perfil.IdCliente, verZona: props.verZona }).then(
      data => { setDivision(data); });
  }

  const seleccionarNodo = async (dataRow) => {
    // console.log("seleccionarNodo", dataRow);
    const { IdMenu } = dataRow;
    if (IdMenu !== varIdMenu) setVarIdMenu(IdMenu);
    setSelected(dataRow);
  }

  function aceptar(e) {
    const { IdCliente, IdDivision, Menu } = selected;
    // console.log("selected", selected);
    if (isNotEmpty(IdDivision)) {
      props.selectData({ IdCliente, IdDivision, Division: Menu });
    } else {
      handleInfoMessages(intl.formatMessage({ id: "MESSAGES.SELECT.ROW" }));
    }

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
        height={"450px"}
        width={"500px"}
        title={(intl.formatMessage({ id: "ACTION.SEARCH" }) + ' ' + intl.formatMessage({ id: "SYSTEM.DIVISIONS" })).toUpperCase()}
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
                style={{ marginTop: "7px" }}
              />
            </div>
            <MenuTreeViewPage
              menus={division}
              modoEdicion={false}
              seleccionarNodo={seleccionarNodo}
            />
          </div>

        </Portlet>
      </Popup>
    </>
  );
};

AdministracionDivisionBuscar.propTypes = {
  showButton: PropTypes.bool,
  selectionMode: PropTypes.string,
};
AdministracionDivisionBuscar.defaultProps = {
  showButton: false,
  selectionMode: "row", //['multiple', 'row','single]

};
export default injectIntl(AdministracionDivisionBuscar);


