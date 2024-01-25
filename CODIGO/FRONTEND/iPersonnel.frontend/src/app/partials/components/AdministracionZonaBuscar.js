import React, { useState, useEffect } from "react";
import { injectIntl } from "react-intl";
import { Button } from "devextreme-react";
import { Portlet} from "../content/Portlet";
import { handleInfoMessages } from "../../store/ducks/notify-messages";
import MenuTreeViewPage from "../content/TreeView/MenuTreeViewPage";
import { Popup } from 'devextreme-react/popup';
import PropTypes from "prop-types";
import { useSelector } from "react-redux"; 
import { listarTreeviewZonaAcceso } from "../../api/administracion/zona.api";
import { isNotEmpty } from "../../../_metronic";


const AdministracionZonaBuscar = props => {
  const perfil = useSelector(state => state.perfil.perfilActual);
  const { intl ,dataMenu } = props;
  const [zona, setZona] = useState([]);
  const [varIdMenu, setVarIdMenu] = useState();
  const [selected, setSelected] = useState({});

  function aceptar(e) {
    let dataSelected = [];
    if (props.selectionMode === "row" || props.selectionMode === "single") {
      const { IdCliente, IdDivision, IdZona, Zona } = selected;
      if (isNotEmpty(IdZona)) {
        props.selectData({ IdCliente, IdDivision, IdZona, Zona: Zona});
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


  async function cargarData() {
      //debugger;
  // console.log("AdministracionZonaBuscar|cargarData|props.dataMenu:",props.dataMenu);
    await listarTreeviewZonaAcceso({ 
      IdCliente: perfil.IdCliente, 
      IdDivision: perfil.IdDivision,
      IdModulo : isNotEmpty(dataMenu.info.IdModulo) ? dataMenu.info.IdModulo : "" 
    })
      .then(zona => {
        setZona(zona);
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
        title={(intl.formatMessage({ id: "ACTION.SEARCH" }) + ' ' + intl.formatMessage({ id: "ACCESS.PERSON.RESTRICTION.ZONE" })).toUpperCase()}
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
              menus={zona}
              modoEdicion={false}
              seleccionarNodo={seleccionarNodo}
              selectionMode={props.selectionMode}
              showCheckBoxesModes={props.showCheckBoxesModes}
              selectNodesRecursive = {props.selectNodesRecursive}
            />
          </div>
        </Portlet>
      </Popup>

    </>
  );
};
AdministracionZonaBuscar.propTypes = {
  showButton: PropTypes.bool,
  selectionMode: PropTypes.string,
  showCheckBoxesModes: PropTypes.string,
  selectNodesRecursive: PropTypes.bool,


};
AdministracionZonaBuscar.defaultProps = {
  showButton: true,
  selectionMode: "row", 
  showCheckBoxesModes: "none" ,
  selectNodesRecursive:true
};

export default injectIntl(AdministracionZonaBuscar);
