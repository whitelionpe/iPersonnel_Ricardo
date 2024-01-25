import React from "react";
import DataGrid, {
  Grouping as GroupingGrid,
  Paging as PagingGrid,
  Sorting,
  Button as ColumnButton,
  Column,
  MasterDetail
} from "devextreme-react/data-grid";
import {
  PortletBody,
  PortletHeader,
  PortletHeaderToolbar
} from "../../../../partials/content/Portlet";
import CustomTabNav from "../../../../partials/content/Acreditacion/CustomTabNav/CustomTabNav";
import { CellHorasRender, dateFormat } from "../../../../../_metronic";
import HeaderInformation from "../../../../partials/components/HeaderInformation";
import { Button } from "devextreme-react";

const SolicitudEditPage = ({
  intl,
  dataRowEditNew,
  dataSource,
  dataSourceAprobadores,
  cancelarEdicion,
  getInfo
}) => {
  const getStateRequestStyle = estado => {
    let css = "";
    let text = "";

    switch (estado) {
      case "I":
        css = "estado_item_inactivo";
        text = intl.formatMessage({ id: "COMMON.INCOMPLETE" }).toUpperCase();
        break;
      case "P":
        css = "estado_item_pendiente";
        text = intl.formatMessage({ id: "COMMON.EARRING" }).toUpperCase();
        break;
      case "O":
        css = "estado_item_observado";
        text = intl.formatMessage({ id: "COMMON.OBSERVED" }).toUpperCase();
        break;
      case "R":
        css = "estado_item_rechazado";
        text = intl.formatMessage({ id: "COMMON.REJECTED" }).toUpperCase();
        break;
      case "A":
        css = "estado_item_aprobado";
        text = intl.formatMessage({ id: "COMMON.APPROVED" }).toUpperCase();
        break;
      default:
        css = "";
        text = "";
        break;
    }

    return { css, text };
  };

  const cellEstadoRender = e => {
    let estado = e.data.EstadoAprobacion;
    if (estado.trim() === "") {
      estado = "I";
    }

    let { css, text: estado_txt } = getStateRequestStyle(estado);

    return css === "" ? (
      <div className={"estado_item_general"}>{estado_txt}</div>
    ) : estado === "P" ? (
      <div className={`estado_item_general estado_item_small ${css}`}>
        {estado_txt}
      </div>
    ) : (
      <>
        <div className="align_estado_grid">
          <div className={`estado_item_general estado_item_small ${css}`}>
            {estado_txt}
          </div>
        </div>
      </>
    );
  };

  const DetalleFechas = ({ intl, Solicitud }) => {
    console.log("DetalleFechas", Solicitud);
    let { Documento, Nombres, Detalle } = Solicitud;

    return (
      <>
        <PortletBody>
          {/* <div className="grid_detail_title">
            {Documento} - {Nombres}
          </div> */}
          <DataGrid
            dataSource={Detalle}
            showBorders={true}
            focusedRowEnabled={true}
            keyExpr="Fecha"
            // onCellPrepared={onCellPrepared}
          >
            <Column
              caption={intl.formatMessage({
                id: "ACCESS.PERSON.MARK.DATE"
              })}
              dataField="Fecha"
              width={"20%"}
              alignment={"left"}
              allowSorting={true}
              allowFiltering={true}
              allowHeaderFiltering={false}
              allowEditing={false}
              dataType="date"
              format="dd/MM/yyyy"
            />

            <Column
              caption={intl.formatMessage({
                id: "ASSISTANCE.REQUEST.TOTALHOURS"
              })}
              dataField="Minutos"
              width={"20%"}
              alignment={"center"}
              allowSorting={true}
              allowFiltering={false}
              allowHeaderFiltering={false}
              allowEditing={false}
              cellRender={e => <CellHorasRender field={e.data.Minutos} />}
            />
            {/* dataType='datetime' [editorOptions]="{ type: 'time' }" format='shortTime'k */}
            <Column
              caption={intl.formatMessage({
                id: "ASSISTANCE.REQUEST.TOTALPAIDHOURS"
              })}
              dataField="MinutosPagados"
              width={"20%"}
              alignment={"center"}
              allowSorting={true}
              allowFiltering={false}
              allowHeaderFiltering={false}
              cellRender={e => (
                <CellHorasRender field={e.data.MinutosPagados} />
              )}
            ></Column>
            <Column
              caption={intl.formatMessage({
                id: "ASSISTANCE.REQUEST.TOTALCOMPENSATEDHOURS"
              })}
              dataField="MinutosCompensados"
              width={"20%"}
              alignment={"center"}
              allowSorting={true}
              allowFiltering={false}
              allowHeaderFiltering={false}
              cellRender={e => (
                <CellHorasRender field={e.data.MinutosCompensados} />
              )}
            ></Column>
            <Column
              caption={intl.formatMessage({
                id: "ASSISTANCE.REQUEST.TOTALHOURSEXCLUDED"
              })}
              dataField="MinutosExcluidos"
              width={"20%"}
              alignment={"center"}
              allowSorting={true}
              allowFiltering={false}
              allowHeaderFiltering={false}
              cellRender={e => (
                <CellHorasRender field={e.data.MinutosExcluidos} />
              )}
            ></Column>
          </DataGrid>
        </PortletBody>
      </>
    );
  };

  return (
    <>
      <HeaderInformation
        data={getInfo()}
        visible={true}
        labelLocation={"left"}
        colCount={6}
        toolbar={
          <PortletHeader
            title={""}
            toolbar={
              <PortletHeaderToolbar>
                <Button
                  icon="fa fa-times-circle"
                  type="normal"
                  hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
                  onClick={cancelarEdicion}
                />
              </PortletHeaderToolbar>
            }
          />
        }
      />

      <PortletBody>
        <CustomTabNav
          id="ctnav_asistencia"
          cssClassBody="tab-nav-body-asistencia"
          cssClassHeader="tab-nav-header-asistencia"
          elementos={[
            {
              id: "tabSolicitud",
              nombre: intl.formatMessage({
                id: "ASSISTANCE.REQUEST.TAB.GENERAL"
              }),
              icon: "dx-icon-fields",
              buttonDelete: false
            },
            {
              id: "tabTrabajadores",
              nombre: intl.formatMessage({
                id: "ACREDITATION.REPORT.AVERAGE.HOURS"
              }),
              icon: "dx-icon-card",
              buttonDelete: false
            },
            {
              id: "tabAprobadores",
              nombre: intl.formatMessage({
                id: "ASSISTANCE.REQUEST.TAB.APPROVERS"
              }),
              icon: "dx-icon-fieldchooser",
              buttonDelete: false
            }
          ]}
        >
          <div className="content">
            <div className="row">
              <div className="col-6">
                <div>
                  <fieldset className="scheduler-border">
                    <legend className="scheduler-border">
                      <h5>
                        {intl.formatMessage({
                          id: "DEMOBILIZATION.PEOPLE.WORKER"
                        })}
                        :
                      </h5>
                    </legend>
                    <div className="row">
                      <div className="col-3">
                        {intl.formatMessage({
                          id: "COMMON.CODE"
                        })}
                      </div>
                      <div className="col-9 font-weight-bold">
                        {dataRowEditNew.IdPersona}
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-3">
                        {intl.formatMessage({
                          id: "ADMINISTRATION.PERSON.DOCUMENT"
                        })}
                      </div>
                      <div className="col-9 font-weight-bold">
                        {dataRowEditNew.Documento}
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-3">
                        {intl.formatMessage({
                          id: "ADMINISTRATION.PERSON.NAME"
                        })}
                      </div>
                      <div className="col-9 font-weight-bold">
                        {dataRowEditNew.NombresTrabajador}
                      </div>
                    </div>
                  </fieldset>
                </div>
              </div>
              <div className="col-6">
                <fieldset className="scheduler-border">
                  <legend className="scheduler-border">
                    <h5>
                      {intl.formatMessage({
                        id: "ASSISTANCE.REQUEST.USER.REQUEST"
                      })}
                      :
                    </h5>
                  </legend>
                  <div className="row">
                    <div className="col-12">
                      <div className="row">
                        <div className="col-3">
                          {intl.formatMessage({
                            id: "COMMON.CODE"
                          })}
                        </div>
                        <div className="col-9 font-weight-bold">
                          {dataRowEditNew.IdPersonaSolicitante}
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-3">
                          {intl.formatMessage({
                            id: "ADMINISTRATION.PERSON.DOCUMENT"
                          })}
                        </div>
                        <div className="col-9 font-weight-bold">
                          {dataRowEditNew.Documento}
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-3">
                          {intl.formatMessage({
                            id: "ADMINISTRATION.PERSON.NAME"
                          })}
                        </div>
                        <div className="col-9 font-weight-bold">
                          {dataRowEditNew.NombresSolicitante}
                        </div>
                      </div>
                    </div>
                  </div>
                </fieldset>
              </div>
            </div>
            <div className="row">
              <div className="col-12">
                <fieldset className="scheduler-border fieldsetFechas">
                  <div className="row" style={{ marginTop: "8px" }}>
                    <div className="col-2">
                      {intl.formatMessage({
                        id: "ASSISTANCE.REQUEST.APPLICATIONDATE"
                      })}
                    </div>
                    <div className="col-2 font-weight-bold">
                      {dateFormat(dataRowEditNew.FechaSolicitud, "dd/MM/yyyy")}
                    </div>
                    <div className="col-2">
                      {intl.formatMessage({
                        id: "ADMINISTRATION.PERSON.STARTDATE"
                      })}
                    </div>
                    <div className="col-2 font-weight-bold">
                      {dataRowEditNew.FechaInicio}
                    </div>
                    <div className="col-2">
                      {intl.formatMessage({
                        id: "ADMINISTRATION.PERSON.ENDDATE"
                      })}
                    </div>
                    <div className="col-2 font-weight-bold">
                      {dataRowEditNew.FechaFin}
                    </div>
                  </div>
                  <div className="row  mt-2">
                    <div className="col-2">
                      {intl.formatMessage({
                        id: "ACCREDITATION.REQUEST.TITLE.OBSERVATION"
                      })}
                    </div>
                    <div className="col-10 font-weight-bold">
                      {dataRowEditNew.Observacion}
                    </div>
                  </div>
                </fieldset>
              </div>
            </div>
          </div>

          <div className="content">
            <div className="row">
              <div className="col-12">
                <div className="content">
                  <label className="label-asistencia-resumen">
                    {intl.formatMessage({
                      id: "ASSISTANCE.REQUEST.SUMMARY"
                    })}
                    :
                  </label>
                  <DataGrid
                    dataSource={dataSource}
                    columnAutoWidth={true}
                    focusedRowEnabled={true}
                    allowColumnReordering={true}
                    allowColumnResizing={true}
                    keyExpr={"IdPersona"}
                  >
                    <Sorting mode="multiple" />
                    {/* <GroupPanel visible={true} /> */}
                    {/* <SearchPanel visible={true} /> */}
                    <GroupingGrid autoExpandAll={false} />
                    <PagingGrid defaultPageSize={15} />

                    <Column
                      caption={intl.formatMessage({
                        id: "ASSISTANCE.REQUEST.TOTALHOURS"
                      })}
                      dataField="Minutos"
                      width={"25%"}
                      alignment={"center"}
                      allowSorting={true}
                      allowFiltering={false}
                      allowHeaderFiltering={false}
                      allowEditing={false}
                      cellRender={e => (
                        <CellHorasRender field={e.data.Minutos} />
                      )}
                    />
                    <Column
                      caption={intl.formatMessage({
                        id: "ASSISTANCE.REQUEST.TOTALPAIDHOURS"
                      })}
                      dataField="MinutosPagados"
                      width={"25%"}
                      alignment={"center"}
                      allowSorting={true}
                      allowFiltering={false}
                      allowHeaderFiltering={false}
                      cellRender={e => (
                        <CellHorasRender field={e.data.MinutosPagados} />
                      )}
                    ></Column>
                    <Column
                      caption={intl.formatMessage({
                        id: "ASSISTANCE.REQUEST.TOTALCOMPENSATEDHOURS"
                      })}
                      dataField="MinutosCompensados"
                      width={"25%"}
                      alignment={"center"}
                      allowSorting={true}
                      allowFiltering={false}
                      allowHeaderFiltering={false}
                      cellRender={e => (
                        <CellHorasRender field={e.data.MinutosCompensados} />
                      )}
                    ></Column>
                    <Column
                      caption={intl.formatMessage({
                        id: "ASSISTANCE.REQUEST.TOTALHOURSEXCLUDED"
                      })}
                      dataField="MinutosExcluidos"
                      width={"25%"}
                      alignment={"center"}
                      allowSorting={true}
                      allowFiltering={false}
                      allowHeaderFiltering={false}
                      cellRender={e => (
                        <CellHorasRender field={e.data.MinutosExcluidos} />
                      )}
                    ></Column>
                    <MasterDetail
                      enabled={true}
                      component={opt =>
                        DetalleFechas({
                          intl,
                          Solicitud: opt.data.data
                        })
                      }
                    />
                  </DataGrid>
                </div>
              </div>
            </div>
          </div>
          <div className="content">
            <div className="row">
              <div className="col-12">
                <div className="content">
                  <>
                    <label className="label-asistencia-resumen">
                      {intl.formatMessage({
                        id: "ASSISTANCE.REQUEST.TAB.APPROVERS"
                      })}
                      &nbsp;
                      {dataRowEditNew.Automatico === "S"
                        ? "(Automatico)"
                        : "(Por Niveles)"}
                      :
                    </label>
                    <PortletBody>
                      <DataGrid
                        dataSource={dataSourceAprobadores}
                        showBorders={true}
                        focusedRowEnabled={true}
                        keyExpr="IdPerfil"
                        // onCellPrepared={onCellPrepared}
                        allowColumnResizing={true}
                      >
                        <Column
                          caption={intl.formatMessage({
                            id: "ACCREDITATION.PROFILE"
                          })}
                          dataField="Perfil"
                          width={"20%"}
                          alignment={"left"}
                          allowSorting={true}
                          allowFiltering={true}
                          allowHeaderFiltering={false}
                          allowEditing={false}
                          dataType="date"
                          format="dd/MM/yyyy"
                        />

                        <Column
                          caption={intl.formatMessage({
                            id: "ASSISTANCE.REQUEST.APPROVE"
                          })}
                          dataField="NombreCompletoAprobador"
                          width={"20%"}
                          alignment={"left"}
                        />

                        <Column
                          caption={intl.formatMessage({
                            id: "ACCESS.PERSON.MARK.DATE"
                          })}
                          dataField="FechaAprobacion"
                          width={"15%"}
                          alignment={"left"}
                          dataType="date"
                          format="dd/MM/yyyy HH:mm"
                          allowSorting={true}
                          allowFiltering={false}
                          allowHeaderFiltering={false}
                        />

                        <Column
                          caption={intl.formatMessage({
                            id: "SYSTEM.MENU.LEVEL"
                          })}
                          dataField="NivelAprobacion"
                          width={"10%"}
                          alignment={"center"}
                        />
                        <Column
                          caption={intl.formatMessage({
                            id: "COMMON.STATE"
                          })}
                          dataField="EstadoAprobacion"
                          width={"15%"}
                          alignment={"center"}
                          cellRender={cellEstadoRender}
                        />

                        <Column
                          caption={intl.formatMessage({
                            id: "ACCESS.PERSON.EXONERACION.OBSERVATION"
                          })}
                          dataField="Observacion"
                          width={"20%"}
                          alignment={"left"}
                        />
                      </DataGrid>
                    </PortletBody>
                  </>
                </div>
              </div>
            </div>
          </div>
        </CustomTabNav>
      </PortletBody>
    </>
  );
};

export default SolicitudEditPage;
