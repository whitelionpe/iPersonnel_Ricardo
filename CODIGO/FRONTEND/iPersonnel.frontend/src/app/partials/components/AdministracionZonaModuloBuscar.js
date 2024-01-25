import React, { useState, useEffect } from "react";
import { injectIntl } from "react-intl";
import { Button } from "devextreme-react";
import { Portlet} from "../content/Portlet";
import { handleInfoMessages } from "../../store/ducks/notify-messages";
import MenuTreeViewPage from "../content/TreeView/MenuTreeViewPage";
import { Popup } from 'devextreme-react/popup';
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { listarTreeviewZonaModulo } from "../../api/administracion/zona.api";
import { isNotEmpty,toAbsoluteUrl } from "../../../_metronic";
import FileCopyIcon from '@material-ui/icons/FileCopyOutlined';
// import MapIco from '../../../../public/media/products/map.ico';


const AdministracionZonaModuloBuscar = props => {
  const perfil = useSelector(state => state.perfil.perfilActual);
  const { intl } = props;
  const [zona, setZona] = useState([]);
  const [varIdMenu, setVarIdMenu] = useState();
  const [selected, setSelected] = useState({});
  const [isSelectable, setIsSelectable] = useState(false);

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
    const { IdMenu,IdModulo } = dataRow;
    if (IdMenu !== varIdMenu) setVarIdMenu(IdMenu);
    setIsSelectable(isNotEmpty(IdModulo) ? false:true);
    setSelected(dataRow);
  }

  async function cargarData() {
  // console.log("AdministracionZonaModuloBuscar|cargarData|props.dataMenu:",props.dataMenu);
    await listarTreeviewZonaModulo({ 
      IdCliente: perfil.IdCliente, 
      IdDivision: perfil.IdDivision,
      IdModulo : isNotEmpty(props.dataMenu.info.IdModulo) ? props.dataMenu.info.IdModulo : "" 
    })
      .then(zona => {
        // console.log("cargarData|zona:",zona);
        // zona[0].icon = isNotEmpty(zona.IdModulo) ? zona.icon : 'tags' //'../../../../public/media/products/map.ico' // '/media/products/map.ico' //'map' //<i class="icon dx-icon-home" />
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
                disabled={isSelectable}
              />
            </div>
            <MenuTreeViewPage
              menus={zona}
              modoEdicion={false}
              seleccionarNodo={seleccionarNodo}
              selectionMode={props.selectionMode}
              showCheckBoxesModes={props.showCheckBoxesModes}
            />
          </div>
        </Portlet>
      </Popup>

    </>
  );
};
AdministracionZonaModuloBuscar.propTypes = {
  showButton: PropTypes.bool,
  selectionMode: PropTypes.string,
  showCheckBoxesModes: PropTypes.string

};
AdministracionZonaModuloBuscar.defaultProps = {
  showButton: true,
  selectionMode: "row", 
  showCheckBoxesModes: "none" 
};

export default injectIntl(AdministracionZonaModuloBuscar);
