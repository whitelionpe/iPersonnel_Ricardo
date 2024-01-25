import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";
import { Portlet } from "../content/Portlet";
import MenuTreeViewPage from "../content/TreeView/MenuTreeViewPage";
import { Popup } from 'devextreme-react/popup';
import PropTypes from "prop-types";
import { serviceAccesoGrupoPuerta } from "../../api/acceso/grupoPuerta.api";
import { isNotEmpty } from "../../../_metronic";


const AccesoGrupoPuertaBuscar = props => {

  const { intl, varIdGrupo, varGrupo, showPopup } = props;
  const [datasource, setDatasource] = useState([]);
  const { IdCliente, IdDivision } = useSelector(state => state.perfil.perfilActual);

  async function cargarData() {

    await serviceAccesoGrupoPuerta.listarTreeViewGrupoPuerta({
      IdCliente: IdCliente,
      IdDivision: IdDivision,
      IdGrupo: varIdGrupo,
      numPagina: 0,
      tamPagina: 0
    }).then(grupoPuerta => {
      setDatasource(grupoPuerta);
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
              id={"MenuTreeViewPage"}
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
AccesoGrupoPuertaBuscar.propTypes = {
  showButton: PropTypes.bool,
  selectionMode: PropTypes.string,
  showCheckBoxesModes: PropTypes.string

};
AccesoGrupoPuertaBuscar.defaultProps = {
  showButton: true,
  selectionMode: "row",
  showCheckBoxesModes: "none"
};

export default injectIntl(AccesoGrupoPuertaBuscar);
