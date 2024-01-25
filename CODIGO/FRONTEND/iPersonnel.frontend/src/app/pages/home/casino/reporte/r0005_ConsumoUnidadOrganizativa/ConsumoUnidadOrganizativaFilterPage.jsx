import React, { useEffect, useState, Fragment } from "react";
import Form, { GroupItem, Item } from "devextreme-react/form";
import { useSelector } from "react-redux";
import { isNotEmpty } from "../../../../../../_metronic";
import AdministracionCompaniaBuscar from "../../../../../partials/components/AdministracionCompaniaBuscar";
import AdministracionUnidadOrganizativaContratoBuscar from "../../../../../partials/components/AdministracionUnidadOrganizativaContratoBuscar";
import { obtenerTodos as obtenerCmbComedor } from "../../../../../api/casino/comedor.api";
import { obtenerTodos as obtenerCmbServicio } from "../../../../../api/casino/comedorServicio.api";

const ConsumoUnidadOrganizativaFilterPage = ({ intl, dataRowEditNew }) => {
  const { IdCliente, IdDivision } = useSelector(
    state => state.perfil.perfilActual
  );
  const [popupVisibleCompania, setPopupVisibleCompania] = useState(false);
  const [popupVisibleUnidad, setPopupVisibleUnidad] = useState(false);
  const [cmbComedor, setCmbComedor] = useState([]);
  const [cmbServicio, setCmbServicio] = useState([]);

  useEffect(() => {
    cargarCombos();
  }, []);

  async function cargarCombos() {
    let cmbComedorX = await obtenerCmbComedor({
      IdCliente: IdCliente,
      IdDivision: IdDivision,
      IdTipo: "%"
    });
    setCmbComedor(cmbComedorX);
  }

  async function CargarServicios(idComedor) {
    let cmbServicioX = await obtenerCmbServicio({
      IdCliente,
      IdDivision,
      IdComedor: idComedor
    });
    setCmbServicio(cmbServicioX);
  }

  const selectCompania = dataPopup => {
    const { IdCompania, Compania } = dataPopup[0];
    dataRowEditNew.IdCompania = IdCompania;
    dataRowEditNew.Compania = Compania;
    setPopupVisibleCompania(false);
  };

  const selectUnidadOrganizativa = async selectedRow => { 
    let strUnidadesOrganizativas = selectedRow
      .map(x => x.IdUnidadOrganizativa)
      .join("|");
    let UnidadesOrganizativasDescripcion = selectedRow
      .map(x => x.UnidadOrganizativa)
      .join(",");
    dataRowEditNew.UnidadesOrganizativas = strUnidadesOrganizativas;
    dataRowEditNew.UnidadesOrganizativasDescripcion = UnidadesOrganizativasDescripcion;
    setPopupVisibleUnidad(false);
  };

  return (
    <Fragment>
      <Form formData={dataRowEditNew} validationGroup="FormEdicion">
        <GroupItem itemType="group" colCount={2} colSpan={2}>
          <div className="row">
            <div className="col-md-12">
              <>
                <Form formData={dataRowEditNew} validationGroup="FormEdicion">
                  <GroupItem itemType="group" colCount={2}>
                    <Item
                      dataField="IdComedor"
                      label={{
                        text: intl.formatMessage({ id: "CASINO.DINNINGROOM" })
                      }}
                      editorType="dxSelectBox"
                      editorOptions={{
                        items: cmbComedor,
                        valueExpr: "IdComedor",
                        displayExpr: "Comedor",
                        showClearButton: true,
                        onValueChanged: e => {
                          if (isNotEmpty(e.value)) {
                            CargarServicios(e.value);
                          }
                        }
                      }}
                    />

                    <Item
                      dataField="IdServicio"
                      editorType="dxSelectBox"
                      label={{
                        text: intl.formatMessage({
                          id: "CASINO.DINNINGROOM.SERVICE"
                        })
                      }}
                      editorOptions={{
                        items: cmbServicio,
                        valueExpr: "IdServicio",
                        showClearButton: true,
                        displayExpr: function(item) {
                          if (item) {
                            return (
                              item.Servicio +
                              "- [" +
                              item.HoraInicio +
                              " " +
                              item.HoraFin +
                              "]"
                            );
                          }
                        }
                      }}
                    />

                    <Item
                      dataField="Compania"
                      label={{
                        text: intl.formatMessage({
                          id: "ADMINISTRATION.PERSON.COMPANY"
                        })
                      }}
                      editorOptions={{
                        readOnly: true,
                        hoverStateEnabled: false,
                        inputAttr: { style: "text-transform: uppercase" },
                        showClearButton: true,
                        buttons: [
                          {
                            name: "search",
                            location: "after",
                            useSubmitBehavior: true,
                            options: {
                              stylingMode: "text",
                              icon: "search",
                              disabled: false,
                              onClick: () => {
                                setPopupVisibleCompania(true);
                              }
                            }
                          }
                        ]
                      }}
                    />

                    <Item
                      dataField="UnidadesOrganizativasDescripcion"
                      label={{
                        text: intl.formatMessage({
                          id:
                            "ADMINISTRATION.ORGANIZATIONALUNIT.ORGANIZATIONALUNIT"
                        })
                      }}
                      editorOptions={{
                        hoverStateEnabled: false,
                        inputAttr: { style: "text-transform: uppercase" },
                        showClearButton: true,
                        buttons: [
                          {
                            name: "search",
                            location: "after",
                            useSubmitBehavior: true,
                            options: {
                              stylingMode: "text",
                              icon: "search",
                              onClick: () => {
                                setPopupVisibleUnidad(true);
                              }
                            }
                          }
                        ]
                      }}
                    />

                    <Item
                      dataField="FechaInicio"
                      label={{
                        text: intl.formatMessage({
                          id: "ACCESS.PERSON.MARK.STARTDATE"
                        })
                      }}
                      isRequired={true}
                      editorType="dxDateBox"
                      dataType="date"
                      editorOptions={{
                        inputAttr: { style: "text-transform: uppercase" },
                        displayFormat: "dd/MM/yyyy"
                      }}
                    />

                    <Item
                      dataField="FechaFin"
                      label={{
                        text: intl.formatMessage({
                          id: "ACCESS.PERSON.MARK.ENDDATE"
                        })
                      }}
                      isRequired={true}
                      editorType="dxDateBox"
                      dataType="date"
                      editorOptions={{
                        inputAttr: { style: "text-transform: uppercase" },
                        displayFormat: "dd/MM/yyyy"
                      }}
                    />
                  </GroupItem>
                </Form>
              </>
            </div>
          </div>
        </GroupItem>
      </Form>

      {/*******>POPUP DE COMPANIAS>******** */}
      {popupVisibleCompania && (
        <AdministracionCompaniaBuscar
          selectData={selectCompania}
          showPopup={{
            isVisiblePopUp: popupVisibleCompania,
            setisVisiblePopUp: setPopupVisibleCompania
          }}
          cancelarEdicion={() => setPopupVisibleCompania(false)}
          uniqueId={"companiabuscarReporteFilterPage"}
        />
      )}

      {/*******>POPUP DE UNIDAD ORGA.>*********************** */}
      {popupVisibleUnidad && (
        <AdministracionUnidadOrganizativaContratoBuscar
          selectData={selectUnidadOrganizativa}
          showPopup={{
            isVisiblePopUp: popupVisibleUnidad,
            setisVisiblePopUp: setPopupVisibleUnidad
          }}
          cancelar={() => setPopupVisibleUnidad(false)}
          uniqueId={"divisionbuscarUnidadListPage"}
          selectionMode={"multiple"}
          showCheckBoxesModes={"normal"}
        />
      )}
    </Fragment>
  );
};

export default ConsumoUnidadOrganizativaFilterPage;
