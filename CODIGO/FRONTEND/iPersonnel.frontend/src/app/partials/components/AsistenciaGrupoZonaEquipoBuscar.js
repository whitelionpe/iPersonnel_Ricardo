import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";
import { Portlet } from "../content/Portlet";
import MenuTreeViewPage from "../content/TreeView/MenuTreeViewPage";
import { Popup } from 'devextreme-react/popup';
import PropTypes from "prop-types";
import { handleErrorMessages } from "../../store/ducks/notify-messages";
import { serviceZonaEquipo } from "../../api/asistencia/grupoZonaEquipo.api";
import { isNotEmpty } from "../../../_metronic";


const AsistenciaGrupoZonaEquipoBuscar = props => {

  const { intl, varIdGrupo, varGrupo, showPopup, varIdCompania, dataMenu } = props;
  const [datasource, setDatasource] = useState([]);
  const { IdCliente, IdDivision } = useSelector(state => state.perfil.perfilActual);

  async function cargarData() {
    await serviceZonaEquipo.listarTreeViewGrupoZonaEquipo({
      IdCliente,
      IdDivision,
      IdCompania: varIdCompania,
      IdGrupo: varIdGrupo,
      IdModulo: dataMenu.info.IdModulo
      /* numPagina: 0,
      tamPagina: 0 */
    }).then(grupoPuerta => {
      //debugger;
      setDatasource(grupoPuerta);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => {
    });
  }


  const seleccionarNodo = async (dataRow) => {

  }

  useEffect(() => {
    if (isNotEmpty(varIdGrupo)) {
      cargarData();
    }

  }, [varIdGrupo]);

  return (
    <>
      <Popup
        visible={showPopup.isVisiblePopUp}
        dragEnabled={false}
        closeOnOutsideClick={false}
        showTitle={true}
        height={"500px"}
        width={"500px"}
        title={varGrupo + ' - ' + intl.formatMessage({ id: "ACCESS.R001.INTERVALCONSULTATION.CHECK.POINT" }).toUpperCase()}
        onHiding={() => showPopup.setisVisiblePopUp(!showPopup.isVisiblePopUp)}
      >
        <Portlet>

          <div className="container">

            <MenuTreeViewPage
              menus={datasource}
              searchEnabled={false}
              showButton={false}
              modoEdicion={false}
              seleccionarNodo={seleccionarNodo}
            />
          </div>
        </Portlet>
      </Popup>

    </>
  );
};
AsistenciaGrupoZonaEquipoBuscar.propTypes = {
  showButton: PropTypes.bool,
  selectionMode: PropTypes.string,
  showCheckBoxesModes: PropTypes.string

};
AsistenciaGrupoZonaEquipoBuscar.defaultProps = {
  showButton: true,
  selectionMode: "row",
  showCheckBoxesModes: "none"
};

export default injectIntl(AsistenciaGrupoZonaEquipoBuscar);
